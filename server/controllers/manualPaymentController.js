const ManualPayment = require('../models/ManualPayment');
const Project = require('../models/Project');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendPaymentVerificationNotification, sendPaymentVerifiedNotification } = require('../utils/emailService');

// Create manual payment order
const createManualPayment = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod, paymentDetails } = req.body;
    const buyerId = req.user.userId;
    
    console.log('Creating manual payment:', { projectId, amount, paymentMethod, buyerId });

    // Validate project exists and is available
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('Project found:', { id: project._id, title: project.title, status: project.status });
    
    if (project.status !== 'available') {
      console.log('Project not available for purchase:', { status: project.status });
      return res.status(400).json({ message: 'Project is not available for purchase' });
    }

    // Check if THIS USER already has a payment order for this project
    const existingPayment = await ManualPayment.findOne({ 
      projectId, 
      buyerId, 
      status: { $in: ['pending', 'payment_uploaded', 'payment_verified', 'delivery_confirmed'] } 
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You already have a payment order for this project' });
    }

    // Calculate platform fee and seller amount
    const platformFee = 0.05; // 5%
    const platformFeeAmount = amount * platformFee;
    const sellerAmount = amount - platformFeeAmount;

    // Create manual payment
    const manualPayment = new ManualPayment({
      projectId,
      buyerId,
      sellerId: project.seller,
      amount,
      platformFee,
      platformFeeAmount,
      sellerAmount,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      status: 'pending'
    });

    await manualPayment.save();

    res.status(201).json({
      message: 'Manual payment order created successfully',
      payment: manualPayment
    });

  } catch (error) {
    console.error('Error creating manual payment:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.userId);
    res.status(500).json({ message: 'Error creating manual payment', error: error.message });
  }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, phoneNumber, senderName, notes } = req.body;
    const buyerId = req.user.userId;

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.buyerId.toString() !== buyerId) {
      return res.status(403).json({ message: 'Not authorized to upload payment proof' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment proof can only be uploaded for pending payments' });
    }

    // Upload screenshot if provided
    let screenshotUrl = '';
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path, 'payment-proofs');
        screenshotUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image to cloud storage' });
      }
    } else {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    // Update payment details
    payment.paymentDetails = {
      transactionId,
      phoneNumber,
      senderName,
      screenshot: screenshotUrl,
      notes
    };
    payment.status = 'payment_uploaded';
    await payment.save();

    // Send email notification to admin
    try {
      const populatedPayment = await ManualPayment.findById(payment._id)
        .populate('buyerId', 'firstName lastName email')
        .populate('sellerId', 'firstName lastName email')
        .populate('projectId');
      
      await sendPaymentVerificationNotification(
        populatedPayment, 
        populatedPayment.buyerId, 
        populatedPayment.sellerId, 
        populatedPayment.projectId
      );
    } catch (emailError) {
      console.error('Failed to send payment verification notification:', emailError);
      // Don't fail the request if email fails
    }

    // Notify admin (you can implement email notification here)
    // await sendAdminNotification(payment);

    res.json({
      message: 'Payment proof uploaded successfully',
      payment
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ message: 'Error uploading payment proof', error: error.message });
  }
};

// Update payment proof
const updatePaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, phoneNumber, senderName, notes } = req.body;
    const buyerId = req.user.userId;

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.buyerId.toString() !== buyerId) {
      return res.status(403).json({ message: 'Not authorized to update payment proof' });
    }

    if (payment.status !== 'payment_uploaded') {
      return res.status(400).json({ message: 'Payment proof can only be updated for payments with uploaded status' });
    }

    // Update screenshot if provided
    let screenshotUrl = payment.paymentDetails?.screenshot || '';
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path, 'payment-proofs');
        screenshotUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image to cloud storage' });
      }
    }

    // Update payment details
    payment.paymentDetails = {
      transactionId,
      phoneNumber,
      senderName,
      screenshot: screenshotUrl,
      notes
    };
    // Keep the status as 'payment_uploaded' since we're just updating details
    await payment.save();

    res.json({
      message: 'Payment proof updated successfully',
      payment
    });

  } catch (error) {
    console.error('Error updating payment proof:', error);
    res.status(500).json({ message: 'Error updating payment proof', error: error.message });
  }
};

// Verify payment (Admin only)
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { verificationNotes } = req.body;
    const adminId = req.user.userId;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can verify payments' });
    }

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'payment_uploaded') {
      return res.status(400).json({ message: 'Payment can only be verified when proof is uploaded' });
    }

    // Update payment status
    payment.status = 'payment_verified';
    payment.verificationDetails = {
      verifiedBy: adminId,
      verifiedAt: new Date(),
      verificationNotes
    };
    await payment.save();

    // Update project status
    const project = await Project.findById(payment.projectId);
    if (project) {
      project.status = 'sold';
      await project.save();
      console.log(`Project ${project._id} marked as sold after payment verification`);
    }

    // Send email notification to buyer
    try {
      const populatedPayment = await ManualPayment.findById(payment._id)
        .populate('buyerId', 'firstName lastName email')
        .populate('sellerId', 'firstName lastName email')
        .populate('projectId');
      
      await sendPaymentVerifiedNotification(
        populatedPayment, 
        populatedPayment.buyerId, 
        populatedPayment.sellerId, 
        populatedPayment.projectId
      );
    } catch (emailError) {
      console.error('Failed to send payment verification notification to buyer:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Payment verified successfully. Project has been marked as sold and removed from the website.',
      payment
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Confirm delivery (Buyer only)
const confirmDelivery = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { confirmationNotes } = req.body;
    const buyerId = req.user.userId;

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.buyerId.toString() !== buyerId) {
      return res.status(403).json({ message: 'Only the buyer can confirm delivery' });
    }

    if (payment.status !== 'payment_verified') {
      return res.status(400).json({ message: 'Delivery can only be confirmed after payment verification' });
    }

    // Update payment status
    payment.status = 'delivery_confirmed';
    payment.deliveryConfirmation = {
      confirmedBy: buyerId,
      confirmedAt: new Date(),
      confirmationNotes
    };
    await payment.save();

    res.json({
      message: 'Delivery confirmed successfully',
      payment
    });

  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({ message: 'Error confirming delivery', error: error.message });
  }
};

// Pay seller (Admin only)
const paySeller = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { 
      paymentMethod, 
      accountNumber, 
      phoneNumber, 
      accountHolderName, 
      paymentNotes 
    } = req.body;
    const adminId = req.user.userId;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can pay sellers' });
    }

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'delivery_confirmed') {
      return res.status(400).json({ message: 'Seller can only be paid after delivery confirmation' });
    }

    // Update payment status
    payment.status = 'completed';
    payment.sellerPaymentDetails = {
      paymentMethod,
      accountNumber,
      phoneNumber,
      accountHolderName,
      paidAt: new Date(),
      paidBy: adminId,
      paymentNotes
    };
    await payment.save();

    // Update project status
    const project = await Project.findById(payment.projectId);
    if (project) {
      project.status = 'completed';
      await project.save();
    }

    // Update seller stats
    const seller = await User.findById(payment.sellerId);
    if (seller) {
      seller.stats.totalEarnings += payment.sellerAmount;
      seller.stats.projectsCompleted += 1;
      await seller.save();
    }

    res.json({
      message: 'Seller paid successfully',
      payment
    });

  } catch (error) {
    console.error('Error paying seller:', error);
    res.status(500).json({ message: 'Error paying seller', error: error.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;

    const payment = await ManualPayment.findById(paymentId)
      .populate({
        path: 'projectId',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      })
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    if (payment.buyerId._id.toString() !== userId && 
        payment.sellerId._id.toString() !== userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json({ payment });

  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ message: 'Error getting payment details', error: error.message });
  }
};

// Get user's payments (only payments where user is the buyer)
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    // Only show payments where the user is the buyer (for privacy)
    const query = {
      buyerId: userId
    };

    if (status) {
      query.status = status;
    }

    const payments = await ManualPayment.find(query)
      .populate({
        path: 'projectId',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      })
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ManualPayment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({ message: 'Error getting payments', error: error.message });
  }
};

// Get seller's payment orders (only payments for projects they own)
const getSellerPayments = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    // Only show payments for projects where the user is the seller
    const query = {
      sellerId: sellerId
    };

    if (status) {
      query.status = status;
    }

    const payments = await ManualPayment.find(query)
      .populate({
        path: 'projectId',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      })
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ManualPayment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting seller payments:', error);
    res.status(500).json({ message: 'Error getting seller payments', error: error.message });
  }
};

// Get admin dashboard payments (Admin only)
const getAdminPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this endpoint' });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const payments = await ManualPayment.find(query)
      .populate('projectId')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ManualPayment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting admin payments:', error);
    res.status(500).json({ message: 'Error getting admin payments', error: error.message });
  }
};

// Create dispute
const createDispute = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.userId;

    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.buyerId.toString() !== userId && 
        payment.sellerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to create dispute' });
    }

    if (payment.status === 'completed' || payment.status === 'refunded') {
      return res.status(400).json({ message: 'Cannot create dispute for completed or refunded payments' });
    }

    // Update payment status
    payment.status = 'disputed';
    payment.disputeDetails = {
      reason,
      description,
      evidence: []
    };
    await payment.save();

    res.json({
      message: 'Dispute created successfully',
      payment
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ message: 'Error creating dispute', error: error.message });
  }
};

// Delete payment order (Buyer only, pending payments only)
const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const payment = await ManualPayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment order not found' });
    }

    // Allow admin to delete any payment, or buyer to delete their own pending payments
    if (!isAdmin && payment.buyerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this payment order' });
    }

    // For non-admin users, only allow deletion of pending payments
    if (!isAdmin && payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment order cannot be deleted after creation. Contact admin.' });
    }

    await ManualPayment.findByIdAndDelete(paymentId);

    res.json({
      message: 'Payment order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment order:', error);
    res.status(500).json({ message: 'Error deleting payment order', error: error.message });
  }
};

module.exports = {
  createManualPayment,
  getPaymentDetails,
  getUserPayments,
  getSellerPayments,
  getAdminPayments,
  uploadPaymentProof,
  updatePaymentProof,
  verifyPayment,
  confirmDelivery,
  paySeller,
  createDispute,
  deletePayment
}; 
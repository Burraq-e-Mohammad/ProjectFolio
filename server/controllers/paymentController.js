const EscrowAccount = require('../models/EscrowAccount');
const Project = require('../models/Project');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create escrow account and payment intent
const createEscrowPayment = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod } = req.body;
    const customerId = req.user.userId;

    // Validate project exists and is available
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'available') {
      return res.status(400).json({ message: 'Project is not available for purchase' });
    }

    // Check if escrow already exists
    const existingEscrow = await EscrowAccount.findOne({ 
      projectId, 
      customerId, 
      status: { $in: ['pending', 'funded', 'in_progress'] } 
    });

    if (existingEscrow) {
      return res.status(400).json({ message: 'Escrow account already exists for this project' });
    }

    // Calculate commission (5%)
    const commission = 0.05;
    const commissionAmount = amount * commission;
    const clientAmount = amount - commissionAmount;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        projectId,
        customerId,
        clientId: project.userId.toString(),
        commissionAmount: commissionAmount.toString(),
        clientAmount: clientAmount.toString()
      }
    });

    // Create escrow account
    const escrowAccount = new EscrowAccount({
      projectId,
      customerId,
      clientId: project.userId,
      amount,
      commission,
      commissionAmount,
      clientAmount,
      paymentMethod,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    await escrowAccount.save();

    // Update project status
    project.status = 'in_progress';
    project.assignedTo = customerId;
    await project.save();

    res.status(201).json({
      message: 'Escrow account created successfully',
      escrowAccount,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Error creating escrow payment:', error);
    res.status(500).json({ message: 'Error creating escrow payment', error: error.message });
  }
};

// Confirm payment and fund escrow
const confirmPayment = async (req, res) => {
  try {
    const { escrowAccountId, paymentIntentId } = req.body;

    const escrowAccount = await EscrowAccount.findById(escrowAccountId);
    if (!escrowAccount) {
      return res.status(404).json({ message: 'Escrow account not found' });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update escrow status
    escrowAccount.status = 'funded';
    escrowAccount.updatedAt = new Date();
    await escrowAccount.save();

    // Update project status
    const project = await Project.findById(escrowAccount.projectId);
    if (project) {
      project.status = 'funded';
      await project.save();
    }

    res.json({
      message: 'Payment confirmed and escrow funded',
      escrowAccount
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

// Release payment to client
const releasePayment = async (req, res) => {
  try {
    const { escrowAccountId } = req.body;
    const { role } = req.user;

    const escrowAccount = await EscrowAccount.findById(escrowAccountId)
      .populate('projectId')
      .populate('clientId');

    if (!escrowAccount) {
      return res.status(404).json({ message: 'Escrow account not found' });
    }

    // Only customer or admin can release payment
    if (role !== 'admin' && escrowAccount.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to release payment' });
    }

    if (escrowAccount.status !== 'funded' && escrowAccount.status !== 'in_progress') {
      return res.status(400).json({ message: 'Payment cannot be released in current status' });
    }

    // Transfer funds to client (in real implementation, this would use Stripe Connect)
    // For now, we'll simulate the transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(escrowAccount.clientAmount * 100),
      currency: 'usd',
      destination: escrowAccount.clientId.paymentInfo?.stripeAccountId || 'acct_default',
      metadata: {
        escrowAccountId: escrowAccountId,
        projectId: escrowAccount.projectId.toString(),
        type: 'escrow_release'
      }
    });

    // Update escrow status
    escrowAccount.status = 'completed';
    escrowAccount.releaseDate = new Date();
    await escrowAccount.save();

    // Update project status
    const project = await Project.findById(escrowAccount.projectId);
    if (project) {
      project.status = 'completed';
      await project.save();
    }

    // Update client stats
    const client = await User.findById(escrowAccount.clientId);
    if (client) {
      client.stats.totalEarnings += escrowAccount.clientAmount;
      client.stats.projectsCompleted += 1;
      await client.save();
    }

    res.json({
      message: 'Payment released successfully',
      escrowAccount,
      transfer
    });

  } catch (error) {
    console.error('Error releasing payment:', error);
    res.status(500).json({ message: 'Error releasing payment', error: error.message });
  }
};

// Get escrow account details
const getEscrowAccount = async (req, res) => {
  try {
    const { escrowAccountId } = req.params;

    const escrowAccount = await EscrowAccount.findById(escrowAccountId)
      .populate('projectId')
      .populate('customerId')
      .populate('clientId');

    if (!escrowAccount) {
      return res.status(404).json({ message: 'Escrow account not found' });
    }

    // Check authorization
    if (escrowAccount.customerId._id.toString() !== req.user.userId && 
        escrowAccount.clientId._id.toString() !== req.user.userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this escrow account' });
    }

    res.json({ escrowAccount });

  } catch (error) {
    console.error('Error getting escrow account:', error);
    res.status(500).json({ message: 'Error getting escrow account', error: error.message });
  }
};

// Get user's escrow accounts
const getUserEscrowAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { customerId: userId },
        { clientId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const escrowAccounts = await EscrowAccount.find(query)
      .populate('projectId')
      .populate('customerId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EscrowAccount.countDocuments(query);

    res.json({
      escrowAccounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting user escrow accounts:', error);
    res.status(500).json({ message: 'Error getting escrow accounts', error: error.message });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { escrowAccountId, reason } = req.body;
    const { role } = req.user;

    const escrowAccount = await EscrowAccount.findById(escrowAccountId);
    if (!escrowAccount) {
      return res.status(404).json({ message: 'Escrow account not found' });
    }

    // Only customer or admin can request refund
    if (role !== 'admin' && escrowAccount.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to request refund' });
    }

    if (escrowAccount.status !== 'funded' && escrowAccount.status !== 'in_progress') {
      return res.status(400).json({ message: 'Refund not allowed in current status' });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: escrowAccount.paymentIntentId,
      metadata: {
        escrowAccountId: escrowAccountId,
        reason: reason || 'customer_request'
      }
    });

    // Update escrow status
    escrowAccount.status = 'refunded';
    escrowAccount.updatedAt = new Date();
    await escrowAccount.save();

    // Update project status
    const project = await Project.findById(escrowAccount.projectId);
    if (project) {
      project.status = 'available';
      project.assignedTo = null;
      await project.save();
    }

    res.json({
      message: 'Payment refunded successfully',
      escrowAccount,
      refund
    });

  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ message: 'Error refunding payment', error: error.message });
  }
};

const rejectPayment = (req, res) => {
  res.status(501).json({ message: 'Reject payment not implemented yet.' });
};

module.exports = {
  createEscrowPayment,
  confirmPayment,
  releasePayment,
  getEscrowAccount,
  getUserEscrowAccounts,
  refundPayment,
  rejectPayment
}; 
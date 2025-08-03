const Dispute = require('../models/Dispute');
const EscrowAccount = require('../models/EscrowAccount');
const Project = require('../models/Project');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// Create a new dispute
const createDispute = async (req, res) => {
  try {
    const { 
      projectId, 
      escrowAccountId, 
      disputeType, 
      title, 
      description 
    } = req.body;
    const initiatorId = req.user.userId;

    // Validate escrow account exists
    const escrowAccount = await EscrowAccount.findById(escrowAccountId);
    if (!escrowAccount) {
      return res.status(404).json({ message: 'Escrow account not found' });
    }

    // Check if user is involved in the escrow
    if (escrowAccount.customerId.toString() !== initiatorId && 
        escrowAccount.clientId.toString() !== initiatorId) {
      return res.status(403).json({ message: 'Not authorized to create dispute for this escrow' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({
      escrowAccountId,
      status: { $in: ['open', 'under_review', 'mediation'] }
    });

    if (existingDispute) {
      return res.status(400).json({ message: 'Dispute already exists for this escrow account' });
    }

    // Determine respondent (the other party)
    const respondentId = escrowAccount.customerId.toString() === initiatorId ? 
      escrowAccount.clientId : escrowAccount.customerId;

    const dispute = new Dispute({
      projectId,
      escrowAccountId,
      initiatorId,
      respondentId,
      disputeType,
      title,
      description,
      status: 'open'
    });

    await dispute.save();

    // Update escrow status
    escrowAccount.status = 'disputed';
    escrowAccount.disputeDetails = {
      reason: disputeType,
      description: description
    };
    await escrowAccount.save();

    // Populate user information
    await dispute.populate('initiatorId', 'name email');
    await dispute.populate('respondentId', 'name email');

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ message: 'Error creating dispute', error: error.message });
  }
};

// Upload dispute evidence
const uploadEvidence = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { evidenceType, title, description } = req.body;
    const uploadedBy = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user is involved in the dispute
    if (dispute.initiatorId.toString() !== uploadedBy && 
        dispute.respondentId.toString() !== uploadedBy) {
      return res.status(403).json({ message: 'Not authorized to upload evidence for this dispute' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'dispute_evidence',
      resource_type: 'auto'
    });

    // Add evidence to dispute
    dispute.evidence.push({
      type: evidenceType,
      title,
      description,
      url: result.secure_url,
      filename: req.file.originalname,
      uploadedBy,
      uploadedAt: new Date()
    });

    await dispute.save();

    res.json({
      message: 'Evidence uploaded successfully',
      evidence: dispute.evidence[dispute.evidence.length - 1]
    });

  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ message: 'Error uploading evidence', error: error.message });
  }
};

// Add message to dispute
const addDisputeMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { content, isInternal = false } = req.body;
    const senderId = req.user.userId;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user is involved in the dispute or is admin
    if (dispute.initiatorId.toString() !== senderId && 
        dispute.respondentId.toString() !== senderId &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add messages to this dispute' });
    }

    // Add message to dispute
    dispute.messages.push({
      senderId,
      content,
      isInternal,
      createdAt: new Date()
    });

    await dispute.save();

    // Populate sender information
    const sender = await User.findById(senderId).select('name email role');

    res.json({
      message: 'Message added successfully',
      message: {
        ...dispute.messages[dispute.messages.length - 1],
        senderId: sender
      }
    });

  } catch (error) {
    console.error('Error adding dispute message:', error);
    res.status(500).json({ message: 'Error adding dispute message', error: error.message });
  }
};

// Get dispute details
const getDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user.userId;

    const dispute = await Dispute.findById(disputeId)
      .populate('initiatorId', 'name email')
      .populate('respondentId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('messages.senderId', 'name email role');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user is involved in the dispute or is admin
    if (dispute.initiatorId._id.toString() !== userId && 
        dispute.respondentId._id.toString() !== userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this dispute' });
    }

    res.json({ dispute });

  } catch (error) {
    console.error('Error getting dispute:', error);
    res.status(500).json({ message: 'Error getting dispute', error: error.message });
  }
};

// Get user's disputes
const getUserDisputes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { initiatorId: userId },
        { respondentId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('initiatorId', 'name email')
      .populate('respondentId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting user disputes:', error);
    res.status(500).json({ message: 'Error getting user disputes', error: error.message });
  }
};

// Admin: Assign dispute
const assignDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { assignedTo } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to assign disputes' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.assignedTo = assignedTo;
    dispute.assignedAt = new Date();
    dispute.status = 'under_review';

    await dispute.save();

    await dispute.populate('assignedTo', 'name email');

    res.json({
      message: 'Dispute assigned successfully',
      dispute
    });

  } catch (error) {
    console.error('Error assigning dispute:', error);
    res.status(500).json({ message: 'Error assigning dispute', error: error.message });
  }
};

// Admin: Resolve dispute
const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { 
      action, 
      amount, 
      description, 
      notes 
    } = req.body;
    const resolvedBy = req.user.userId;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to resolve disputes' });
    }

    const dispute = await Dispute.findById(disputeId)
      .populate('escrowAccountId');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.status = 'resolved';
    dispute.resolution = {
      action,
      amount,
      description,
      notes,
      resolvedBy,
      resolvedAt: new Date()
    };

    await dispute.save();

    // Update escrow account based on resolution
    const escrowAccount = dispute.escrowAccountId;
    if (escrowAccount) {
      if (action === 'refund_full' || action === 'refund_partial') {
        escrowAccount.status = 'refunded';
        escrowAccount.disputeDetails.resolution = description;
      } else if (action === 'continue_project') {
        escrowAccount.status = 'in_progress';
        escrowAccount.disputeDetails.resolution = description;
      }
      await escrowAccount.save();
    }

    // Update project status
    const project = await Project.findById(dispute.projectId);
    if (project) {
      if (action === 'refund_full' || action === 'refund_partial') {
        project.status = 'available';
        project.assignedTo = null;
      } else if (action === 'continue_project') {
        project.status = 'in_progress';
      }
      await project.save();
    }

    await dispute.populate('resolvedBy', 'name email');

    res.json({
      message: 'Dispute resolved successfully',
      dispute
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ message: 'Error resolving dispute', error: error.message });
  }
};

// Admin: Get all disputes
const getAllDisputes = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all disputes' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('initiatorId', 'name email')
      .populate('respondentId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting all disputes:', error);
    res.status(500).json({ message: 'Error getting all disputes', error: error.message });
  }
};

module.exports = {
  createDispute,
  uploadEvidence,
  addDisputeMessage,
  getDispute,
  getUserDisputes,
  assignDispute,
  resolveDispute,
  getAllDisputes
}; 
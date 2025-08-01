const Verification = require('../models/Verification');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// Submit verification request
const submitVerification = async (req, res) => {
  try {
    console.log('Headers:', req.headers);
    console.log('User:', req.user);
    console.log('Body:', req.body);
    const { verificationType, verificationData } = req.body;
    const userId = req.user.userId;

    // Check if verification already exists for this type
    const existingVerification = await Verification.findOne({
      userId,
      verificationType,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingVerification) {
      return res.status(400).json({ 
        message: `Verification for ${verificationType} already exists` 
      });
    }

    // Create new verification
    const verification = new Verification({
      userId,
      verificationType,
      verificationData,
      status: 'pending'
    });

    await verification.save();

    res.status(201).json({
      message: 'Verification submitted successfully',
      verification
    });

  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ message: 'Error submitting verification', error: error.message });
  }
};

// Upload verification document
const uploadDocument = async (req, res) => {
  try {
    const { verificationId, documentType } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    if (verification.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to upload documents for this verification' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'verification_documents',
      resource_type: 'auto'
    });

    // Add document to verification
    verification.documents.push({
      type: documentType,
      url: result.secure_url,
      filename: req.file.originalname,
      uploadedAt: new Date()
    });

    await verification.save();

    res.json({
      message: 'Document uploaded successfully',
      document: verification.documents[verification.documents.length - 1]
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

// Get user's verification status
const getUserVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const verifications = await Verification.find({ userId })
      .sort({ createdAt: -1 });

    // Calculate overall trust score
    let totalTrustScore = 0;
    let verifiedCount = 0;

    verifications.forEach(verification => {
      if (verification.status === 'approved') {
        totalTrustScore += verification.trustScore;
        verifiedCount++;
      }
    });

    const averageTrustScore = verifiedCount > 0 ? Math.round(totalTrustScore / verifiedCount) : 0;

    // Update user's verification status and trust score
    const user = await User.findById(userId);
    if (user) {
      user.trustScore = averageTrustScore;
      
      // Update verification level based on trust score
      if (averageTrustScore >= 80) {
        user.verificationStatus = 'enterprise';
      } else if (averageTrustScore >= 60) {
        user.verificationStatus = 'premium';
      } else if (averageTrustScore >= 30) {
        user.verificationStatus = 'verified';
      } else if (averageTrustScore >= 10) {
        user.verificationStatus = 'basic';
      } else {
        user.verificationStatus = 'unverified';
      }

      user.isVerified = user.verificationStatus !== 'unverified';
      await user.save();
    }

    res.json({
      verifications,
      overallTrustScore: averageTrustScore,
      verificationStatus: user.verificationStatus,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('Error getting user verification:', error);
    res.status(500).json({ message: 'Error getting user verification', error: error.message });
  }
};

// Admin: Review verification
const reviewVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, reviewNotes } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to review verifications' });
    }

    const verification = await Verification.findById(verificationId)
      .populate('userId');

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    verification.status = status;
    verification.reviewNotes = reviewNotes;
    verification.reviewedBy = adminId;
    verification.reviewedAt = new Date();

    if (status === 'approved') {
      // Calculate trust score
      verification.calculateTrustScore();
      verification.updateVerificationLevel();
    }

    await verification.save();

    // Update user's overall verification status
    await updateUserVerificationStatus(verification.userId);

    res.json({
      message: 'Verification reviewed successfully',
      verification
    });

  } catch (error) {
    console.error('Error reviewing verification:', error);
    res.status(500).json({ message: 'Error reviewing verification', error: error.message });
  }
};

// Admin: Get all pending verifications
const getPendingVerifications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view pending verifications' });
    }

    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    } else {
      query.status = 'pending';
    }

    const verifications = await Verification.find(query)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Verification.countDocuments(query);

    res.json({
      verifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting pending verifications:', error);
    res.status(500).json({ message: 'Error getting pending verifications', error: error.message });
  }
};

// Helper function to update user verification status
const updateUserVerificationStatus = async (userId) => {
  try {
    const verifications = await Verification.find({ 
      userId, 
      status: 'approved' 
    });

    let totalTrustScore = 0;
    verifications.forEach(verification => {
      totalTrustScore += verification.trustScore;
    });

    const averageTrustScore = verifications.length > 0 ? 
      Math.round(totalTrustScore / verifications.length) : 0;

    const user = await User.findById(userId);
    if (user) {
      user.trustScore = averageTrustScore;
      
      // Update verification level
      if (averageTrustScore >= 80) {
        user.verificationStatus = 'enterprise';
      } else if (averageTrustScore >= 60) {
        user.verificationStatus = 'premium';
      } else if (averageTrustScore >= 30) {
        user.verificationStatus = 'verified';
      } else if (averageTrustScore >= 10) {
        user.verificationStatus = 'basic';
      } else {
        user.verificationStatus = 'unverified';
      }

      user.isVerified = user.verificationStatus !== 'unverified';
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user verification status:', error);
  }
};

// Get verification requirements
const getVerificationRequirements = async (req, res) => {
  try {
    const requirements = {
      email: {
        title: 'Email Verification',
        description: 'Verify your email address',
        points: 10,
        required: true
      },
      phone: {
        title: 'Phone Verification',
        description: 'Verify your phone number',
        points: 15,
        required: false
      },
      contact_verification: {
        title: 'Contact Verification',
        description: 'Verify through email and phone (privacy-friendly)',
        points: 25,
        required: false
      },
      business: {
        title: 'Business Verification',
        description: 'Verify your business information (optional)',
        points: 20,
        required: false
      },
      portfolio: {
        title: 'Portfolio Verification',
        description: 'Link your portfolio or previous work (optional)',
        points: 15,
        required: false
      },
      social_media: {
        title: 'Social Media Verification',
        description: 'Link your LinkedIn, Facebook, or Instagram profile (optional)',
        points: 10,
        required: false
      }
    };

    res.json({ requirements });

  } catch (error) {
    console.error('Error getting verification requirements:', error);
    res.status(500).json({ message: 'Error getting verification requirements', error: error.message });
  }
};

module.exports = {
  submitVerification,
  uploadDocument,
  getUserVerification,
  reviewVerification,
  getPendingVerifications,
  getVerificationRequirements
}; 
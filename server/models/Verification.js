const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationType: {
    type: String,
    enum: [
      'email',
      'phone',
      'identity',
      'business',
      'portfolio',
      'social_media',
      'contact_verification'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  documents: [{
    type: {
      type: String,
      enum: ['passport', 'driver_license', 'national_id', 'business_license', 'portfolio_link', 'social_profile']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  verificationData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  verificationLevel: {
    type: String,
    enum: ['basic', 'verified', 'premium', 'enterprise'],
    default: 'basic'
  },
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
verificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate trust score based on verification status
verificationSchema.methods.calculateTrustScore = function() {
  let score = 0;
  
  // Base score for each verification type
  const verificationScores = {
    email: 10,
    phone: 15,
    identity: 25,
    business: 20,
    portfolio: 15,
    social_media: 10
  };
  
  // Add score for each approved verification
  if (this.status === 'approved') {
    score += verificationScores[this.verificationType] || 0;
  }
  
  // Bonus for multiple verifications
  if (this.documents && this.documents.length > 1) {
    score += 5;
  }
  
  // Bonus for social media verification
  if (this.verificationData.socialMediaProfiles) {
    const verifiedSocialProfiles = this.verificationData.socialMediaProfiles.filter(profile => profile.verified);
    score += verifiedSocialProfiles.length * 5;
  }
  
  this.trustScore = Math.min(100, score);
  return this.trustScore;
};

// Update verification level based on trust score
verificationSchema.methods.updateVerificationLevel = function() {
  if (this.trustScore >= 80) {
    this.verificationLevel = 'enterprise';
  } else if (this.trustScore >= 60) {
    this.verificationLevel = 'premium';
  } else if (this.trustScore >= 30) {
    this.verificationLevel = 'verified';
  } else {
    this.verificationLevel = 'basic';
  }
};

module.exports = mongoose.model('Verification', verificationSchema); 
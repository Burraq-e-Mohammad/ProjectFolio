const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String }, // Remove required to allow firstName/lastName
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Remove required to allow Google Sign-In users
  role: { type: String, enum: ['seller', 'customer', 'admin'], default: 'customer' },
  googleId: { type: String }, // Add to store Google's sub identifier
  
  // Verification and Trust System
  verificationStatus: {
    type: String,
    enum: ['unverified', 'basic', 'verified', 'premium', 'enterprise'],
    default: 'unverified'
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  
  // Contact Information
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  
  // Business Information (for sellers)
  businessInfo: {
    businessName: String,
    businessType: String,
    businessRegistration: String,
    website: String,
    description: String
  },
  
  // Payment Information
  paymentInfo: {
    stripeCustomerId: String,
    paypalEmail: String,
    bankAccount: {
      accountNumber: String,
      routingNumber: String,
      accountType: String
    }
  },
  
  // Profile Information
  profile: {
    avatar: String,
    bio: String,
    location: String,
    skills: [String],
    portfolio: [{
      title: String,
      description: String,
      url: String,
      image: String
    }],
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      website: String
    }
  },
  
  // Statistics
  stats: {
    projectsCompleted: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Index for efficient querying
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ trustScore: -1 });
UserSchema.index({ role: 1 });

// Virtual for full verification status
UserSchema.virtual('isFullyVerified').get(function() {
  return this.verificationStatus === 'verified' || 
         this.verificationStatus === 'premium' || 
         this.verificationStatus === 'enterprise';
});

// Method to update trust score
UserSchema.methods.updateTrustScore = function() {
  // This will be calculated based on verification data
  // Implementation will be in the verification controller
  return this.trustScore;
};

// Method to get verification badge
UserSchema.methods.getVerificationBadge = function() {
  const badges = {
    unverified: { text: 'Unverified', color: 'gray' },
    basic: { text: 'Basic', color: 'blue' },
    verified: { text: 'Verified', color: 'green' },
    premium: { text: 'Premium', color: 'purple' },
    enterprise: { text: 'Enterprise', color: 'gold' }
  };
  
  return badges[this.verificationStatus] || badges.unverified;
};

module.exports = mongoose.model('User', UserSchema);
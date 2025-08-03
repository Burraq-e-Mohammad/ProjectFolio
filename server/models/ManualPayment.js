const mongoose = require('mongoose');

const manualPaymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0.05 // 5% platform fee
  },
  platformFeeAmount: {
    type: Number,
    required: true
  },
  sellerAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'payment_uploaded', 'payment_verified', 'delivery_confirmed', 'completed', 'disputed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['easypaisa', 'bank_transfer']
  },
  paymentDetails: {
    transactionId: String,
    phoneNumber: String,
    senderName: String,
    screenshot: String, // URL to uploaded screenshot
    notes: String
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String
  },
  deliveryConfirmation: {
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmedAt: Date,
    confirmationNotes: String
  },
  sellerPaymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['easypaisa', 'bank_transfer']
    },
    accountNumber: String,
    phoneNumber: String,
    accountHolderName: String,
    paidAt: Date,
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentNotes: String
  },
  disputeDetails: {
    reason: String,
    description: String,
    evidence: [String],
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
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
manualPaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate platform fee and seller amount
manualPaymentSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    this.platformFeeAmount = this.amount * this.platformFee;
    this.sellerAmount = this.amount - this.platformFeeAmount;
  }
  next();
});

module.exports = mongoose.model('ManualPayment', manualPaymentSchema); 
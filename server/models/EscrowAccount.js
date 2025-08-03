const mongoose = require('mongoose');

const escrowAccountSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    required: true,
    default: 0.05 // 5% commission
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  clientAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'funded', 'in_progress', 'completed', 'disputed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'bank_transfer']
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'approved'],
      default: 'pending'
    },
    dueDate: {
      type: Date
    },
    completedDate: {
      type: Date
    }
  }],
  releaseDate: {
    type: Date
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
escrowAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate commission and client amount
escrowAccountSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    this.commissionAmount = this.amount * this.commission;
    this.clientAmount = this.amount - this.commissionAmount;
  }
  next();
});

module.exports = mongoose.model('EscrowAccount', escrowAccountSchema); 
const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  escrowAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscrowAccount',
    required: true
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disputeType: {
    type: String,
    enum: ['quality_issue', 'delivery_delay', 'scope_creep', 'payment_dispute', 'communication_issue', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'mediation', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['message', 'file', 'screenshot', 'document']
    },
    title: String,
    description: String,
    url: String,
    filename: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    action: {
      type: String,
      enum: ['refund_full', 'refund_partial', 'continue_project', 'modify_scope', 'extend_deadline', 'other']
    },
    amount: Number,
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    notes: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  dueDate: Date,
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
disputeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
disputeSchema.index({ projectId: 1, status: 1 });
disputeSchema.index({ initiatorId: 1, status: 1 });
disputeSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema); 
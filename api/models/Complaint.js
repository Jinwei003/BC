import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  batchId: {
    type: String,
    required: true,
    trim: true
  },
  complainant: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  complaintType: {
    type: String,
    required: true,
    enum: ['QUALITY', 'SAFETY', 'LABELING', 'CONTAMINATION', 'ALLERGIC_REACTION', 'OTHER'],
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  purchaseDetails: {
    purchaseDate: {
      type: Date,
      required: false
    },
    retailer: {
      type: String,
      required: false,
      trim: true
    },
    lotNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    }
  },
  evidenceFiles: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileHash: {
      type: String,
      required: true
    },
    ipfsHash: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
    default: 'SUBMITTED'
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  investigation: {
    startDate: {
      type: Date
    },
    investigator: {
      type: String,
      trim: true
    },
    findings: {
      type: String,
      trim: true
    },
    rootCause: {
      type: String,
      trim: true
    },
    correctiveActions: [{
      action: {
        type: String,
        required: true,
        trim: true
      },
      responsible: {
        type: String,
        required: true,
        trim: true
      },
      dueDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
      },
      completedDate: {
        type: Date
      }
    }],
    preventiveActions: [{
      action: {
        type: String,
        required: true,
        trim: true
      },
      responsible: {
        type: String,
        required: true,
        trim: true
      },
      dueDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
      },
      completedDate: {
        type: Date
      }
    }]
  },
  resolution: {
    resolvedDate: {
      type: Date
    },
    resolvedBy: {
      type: String,
      trim: true
    },
    resolution: {
      type: String,
      trim: true
    },
    compensation: {
      type: String,
      trim: true
    },
    customerSatisfaction: {
      type: String,
      enum: ['VERY_SATISFIED', 'SATISFIED', 'NEUTRAL', 'DISSATISFIED', 'VERY_DISSATISFIED']
    }
  },
  communications: [{
    date: {
      type: Date,
      default: Date.now
    },
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    method: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'SMS', 'LETTER', 'IN_PERSON'],
      required: true
    },
    subject: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  internalNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    note: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ batchId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ complaintType: 1 });
complaintSchema.index({ 'complainant.email': 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model('Complaint', complaintSchema);
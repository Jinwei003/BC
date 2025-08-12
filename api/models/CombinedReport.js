import mongoose from 'mongoose';

const combinedReportSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  merchantWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Ingredients Report Section
  ingredientsReport: {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    manufacturingDate: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    ingredients: {
      type: String,
      required: true
    },
    nutritionalInfo: {
      type: String,
      required: false
    },
    allergens: {
      type: String,
      required: false
    },
    certifications: {
      type: String,
      required: false
    }
  },
  
  // Test Process Report Section
  testProcessReport: {
    testingLaboratory: {
      type: String,
      required: true
    },
    testDate: {
      type: String,
      required: true
    },
    testResults: {
      type: String,
      required: true
    },
    testMethodology: {
      type: String,
      required: false
    }
  },
  
  // Authentication Report Section
  authenticationReport: {
    certificates: {
      type: String,
      required: true
    },
    complianceChecks: {
      type: String,
      required: false
    },
    auditTrail: {
      type: String,
      required: false
    }
  },
  
  // Report Status and Approval Workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin Approval/Rejection Details
  approvedAt: {
    type: Date,
    required: false
  },
  approvedBy: {
    type: String,
    required: false
  },
  rejectedAt: {
    type: Date,
    required: false
  },
  rejectedBy: {
    type: String,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  },
  
  // IPFS and Blockchain Data (Set after approval)
  reportHash: {
    type: String,
    required: false
  },
  sha256Hash: {
    type: String,
    required: false
  },
  ipfsHash: {
    type: String,
    required: false
  },
  ipfsCid: {
    type: String,
    required: false
  },
  blockchainTxHash: {
    type: String,
    required: false
  },
  onBlockchain: {
    type: Boolean,
    default: false
  },
  
  // Notification Status
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
combinedReportSchema.index({ batchId: 1 });
combinedReportSchema.index({ merchantWallet: 1 });
combinedReportSchema.index({ status: 1 });
combinedReportSchema.index({ createdAt: -1 });

export default mongoose.model('CombinedReport', combinedReportSchema);
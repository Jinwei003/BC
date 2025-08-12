import mongoose from 'mongoose';

const authenticationSchema = new mongoose.Schema({
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
  certificates: [{
    type: {
      type: String,
      required: true,
      enum: ['ISO', 'FDA', 'HACCP', 'GMP', 'ORGANIC', 'HALAL', 'KOSHER', 'OTHER'],
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true
    },
    certificateNumber: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    scope: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['VALID', 'EXPIRED', 'REVOKED', 'SUSPENDED'],
      default: 'VALID'
    },
    verificationUrl: {
      type: String,
      trim: true
    }
  }],
  complianceChecks: {
    regulatoryCompliance: {
      fda: {
        compliant: {
          type: Boolean,
          required: true
        },
        details: {
          type: String,
          trim: true
        }
      },
      usda: {
        compliant: {
          type: Boolean,
          required: true
        },
        details: {
          type: String,
          trim: true
        }
      },
      localRegulations: {
        compliant: {
          type: Boolean,
          required: true
        },
        details: {
          type: String,
          trim: true
        }
      }
    },
    qualityStandards: {
      iso22000: {
        compliant: {
          type: Boolean,
          required: true
        },
        certificateNumber: {
          type: String,
          trim: true
        }
      },
      haccp: {
        compliant: {
          type: Boolean,
          required: true
        },
        certificateNumber: {
          type: String,
          trim: true
        }
      },
      gmp: {
        compliant: {
          type: Boolean,
          required: true
        },
        certificateNumber: {
          type: String,
          trim: true
        }
      }
    },
    overallCompliance: {
      type: String,
      enum: ['FULLY_COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT'],
      required: true
    }
  },
  auditTrail: [{
    auditor: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      organization: {
        type: String,
        required: true,
        trim: true
      },
      credentials: {
        type: String,
        required: true,
        trim: true
      }
    },
    auditDate: {
      type: Date,
      required: true
    },
    auditType: {
      type: String,
      enum: ['INTERNAL', 'EXTERNAL', 'REGULATORY', 'CERTIFICATION'],
      required: true
    },
    findings: [{
      category: {
        type: String,
        required: true,
        trim: true
      },
      severity: {
        type: String,
        enum: ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'],
        required: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      correctedAction: {
        type: String,
        trim: true
      },
      status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'IN_PROGRESS'],
        default: 'OPEN'
      }
    }],
    overallRating: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'],
      required: true
    }
  }],
  evidenceFiles: [{
    filename: {
      type: String,
      required: false
    },
    originalName: {
      type: String,
      required: false
    },
    fileHash: {
      type: String,
      required: false
    },
    ipfsHash: {
      type: String,
      required: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportHash: {
    type: String,
    required: false
  },
  ipfsHash: {
    type: String,
    required: false // Will be set after admin approval
  },
  sha256Hash: {
    type: String,
    required: false // SHA-256 hash of the report data
  },
  ipfsCid: {
    type: String,
    required: false // IPFS CID from Pinata upload
  },
  blockchainTxHash: {
    type: String,
    required: false // Blockchain transaction hash
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    required: false
  },
  approvedAt: {
    type: Date,
    required: false
  },
  approvedBy: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
authenticationSchema.index({ batchId: 1 });
authenticationSchema.index({ merchantWallet: 1 });
authenticationSchema.index({ 'certificates.type': 1 });
authenticationSchema.index({ 'certificates.expiryDate': 1 });
authenticationSchema.index({ 'complianceChecks.overallCompliance': 1 });

export default mongoose.model('Authentication', authenticationSchema);
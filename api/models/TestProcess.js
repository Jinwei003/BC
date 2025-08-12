import mongoose from 'mongoose';

const testProcessSchema = new mongoose.Schema({
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
  testingLaboratory: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    certification: {
      type: String,
      required: true,
      trim: true
    },
    contactInfo: {
      phone: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true
      }
    }
  },
  testDate: {
    type: Date,
    required: true
  },
  testResults: {
    proteinContent: {
      measured: {
        type: Number,
        required: true,
        min: 0
      },
      expected: {
        type: Number,
        required: true,
        min: 0
      },
      variance: {
        type: Number,
        required: true
      },
      passed: {
        type: Boolean,
        required: true
      }
    },
    purityTest: {
      contaminants: [{
        name: {
          type: String,
          required: true
        },
        level: {
          type: Number,
          required: true,
          min: 0
        },
        unit: {
          type: String,
          required: true
        },
        limit: {
          type: Number,
          required: true,
          min: 0
        },
        passed: {
          type: Boolean,
          required: true
        }
      }],
      overallPurity: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      passed: {
        type: Boolean,
        required: true
      }
    },
    microbiologicalTest: {
      bacteria: {
        count: {
          type: Number,
          required: true,
          min: 0
        },
        unit: {
          type: String,
          required: true
        },
        limit: {
          type: Number,
          required: true,
          min: 0
        },
        passed: {
          type: Boolean,
          required: true
        }
      },
      yeastMold: {
        count: {
          type: Number,
          required: true,
          min: 0
        },
        unit: {
          type: String,
          required: true
        },
        limit: {
          type: Number,
          required: true,
          min: 0
        },
        passed: {
          type: Boolean,
          required: true
        }
      },
      pathogens: [{
        name: {
          type: String,
          required: true
        },
        detected: {
          type: Boolean,
          required: true
        },
        passed: {
          type: Boolean,
          required: true
        }
      }],
      passed: {
        type: Boolean,
        required: true
      }
    },
    heavyMetals: [{
      metal: {
        type: String,
        required: true
      },
      level: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true
      },
      limit: {
        type: Number,
        required: true,
        min: 0
      },
      passed: {
        type: Boolean,
        required: true
      }
    }],
    overallResult: {
      type: String,
      enum: ['PASS', 'FAIL', 'CONDITIONAL'],
      required: true
    }
  },
  testMethodology: {
    standards: [{
      type: String,
      required: true
    }],
    equipment: [{
      name: {
        type: String,
        required: true
      },
      model: {
        type: String,
        required: true
      },
      calibrationDate: {
        type: Date,
        required: true
      }
    }],
    procedures: {
      type: String,
      required: true
    }
  },
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
testProcessSchema.index({ batchId: 1 });
testProcessSchema.index({ merchantWallet: 1 });
testProcessSchema.index({ testDate: 1 });
testProcessSchema.index({ 'testResults.overallResult': 1 });

export default mongoose.model('TestProcess', testProcessSchema);
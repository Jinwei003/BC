import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
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
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    source: {
      type: String,
      required: true,
      trim: true
    }
  }],
  nutritionalInfo: {
    protein: {
      type: Number,
      required: true,
      min: 0
    },
    carbohydrates: {
      type: Number,
      required: true,
      min: 0
    },
    fats: {
      type: Number,
      required: true,
      min: 0
    },
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      default: ''
    }
  },
  allergens: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true
    },
    validUntil: {
      type: Date,
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
ingredientSchema.index({ batchId: 1 });
ingredientSchema.index({ merchantWallet: 1 });
ingredientSchema.index({ manufacturingDate: 1 });
ingredientSchema.index({ expiryDate: 1 });

export default mongoose.model('Ingredients', ingredientSchema);
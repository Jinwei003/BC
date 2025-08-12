import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    unique: true,
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
  },
  businessLicense: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
merchantSchema.index({ walletAddress: 1 });
merchantSchema.index({ email: 1 });
merchantSchema.index({ status: 1 });

export default mongoose.model('Merchant', merchantSchema);
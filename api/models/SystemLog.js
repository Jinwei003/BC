import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
    default: 'INFO'
  },
  category: {
    type: String,
    required: true,
    enum: ['AUTH', 'API', 'DATABASE', 'BLOCKCHAIN', 'FILE_UPLOAD', 'SECURITY', 'SYSTEM', 'USER_ACTION'],
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['ADMIN', 'MERCHANT', 'ANONYMOUS'],
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  endpoint: {
    type: String,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    trim: true
  },
  statusCode: {
    type: Number,
    min: 100,
    max: 599
  },
  responseTime: {
    type: Number,
    min: 0
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    name: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    stack: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      trim: true
    }
  },
  metadata: {
    batchId: {
      type: String,
      trim: true
    },
    transactionHash: {
      type: String,
      trim: true
    },
    fileHash: {
      type: String,
      trim: true
    },
    ipfsHash: {
      type: String,
      trim: true
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true
    },
    sessionId: {
      type: String,
      trim: true
    },
    requestId: {
      type: String,
      trim: true
    }
  },
  security: {
    suspicious: {
      type: Boolean,
      default: false
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    threatType: {
      type: String,
      enum: ['BRUTE_FORCE', 'SQL_INJECTION', 'XSS', 'CSRF', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'OTHER'],
      trim: true
    },
    blocked: {
      type: Boolean,
      default: false
    }
  },
  performance: {
    memoryUsage: {
      type: Number,
      min: 0
    },
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100
    },
    diskUsage: {
      type: Number,
      min: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  archived: {
    type: Boolean,
    default: false
  },
  retentionDate: {
    type: Date
  }
}, {
  timestamps: false // We use our own timestamp field
});

// Indexes for efficient queries
systemLogSchema.index({ timestamp: -1 });
systemLogSchema.index({ level: 1 });
systemLogSchema.index({ category: 1 });
systemLogSchema.index({ userId: 1 });
systemLogSchema.index({ userType: 1 });
systemLogSchema.index({ ipAddress: 1 });
systemLogSchema.index({ statusCode: 1 });
systemLogSchema.index({ 'security.suspicious': 1 });
systemLogSchema.index({ 'security.riskLevel': 1 });
systemLogSchema.index({ archived: 1 });
systemLogSchema.index({ retentionDate: 1 });
systemLogSchema.index({ 'metadata.batchId': 1 });
systemLogSchema.index({ 'metadata.walletAddress': 1 });

// Compound indexes for common queries
systemLogSchema.index({ category: 1, timestamp: -1 });
systemLogSchema.index({ level: 1, timestamp: -1 });
systemLogSchema.index({ userId: 1, timestamp: -1 });
systemLogSchema.index({ 'security.suspicious': 1, timestamp: -1 });

export default mongoose.model('SystemLog', systemLogSchema);
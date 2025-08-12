import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { requestLogger, responseLogger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Logging middleware
app.use(requestLogger);
app.use(responseLogger);

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import merchantRoutes from './routes/merchant.js';
import verificationRoutes from './routes/verification.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes (will be added as we create them)
// app.use('/api/auth', authRoutes);
// app.use('/api/merchants', merchantRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/verification', verificationRoutes);
// app.use('/api/complaints', complaintRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/blockchain', blockchainRoutes);
// app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(async (err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Log error
  const { logActivity } = await import('./middleware/logger.js');
  logActivity({
    level: 'ERROR',
    category: 'SYSTEM',
    action: 'UNHANDLED_ERROR',
    message: err.message,
    userId: req.user?.walletAddress || req.user?.id,
    userType: req.user?.role?.toUpperCase(),
    ipAddress: req.ip,
    endpoint: req.path,
    method: req.method,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});

export default app;
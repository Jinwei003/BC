/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import merchantRoutes from './routes/merchant.js';
import verificationRoutes from './routes/verification.js';
import { authenticateToken } from './middleware/auth.js';
// import { requestLogger, responseLogger } from './middleware/logger.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

// Connect to MongoDB
connectDB();

const app: express.Application = express();

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
// app.use(requestLogger);
// app.use(responseLogger);

/**
 * API Routes
 */
console.log('Loading auth routes:', typeof authRoutes);
console.log('Auth routes object:', authRoutes);
app.use('/api/auth', authRoutes);
console.log('Registered /api/auth routes');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/merchant', authenticateToken, merchantRoutes);
app.use('/api/verification', verificationRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status((error as any).status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

/**
 * 404 handler
 */
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export default app;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  console.log('=== AUTHENTICATE TOKEN DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Authorization header:', req.headers['authorization']);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Extracted token:', token ? 'Present' : 'Missing');
  console.log('Token length:', token ? token.length : 0);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    console.log('Token verified successfully for user:', user);
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to verify merchant role
export const requireMerchant = (req, res, next) => {
  if (!req.user || req.user.role !== 'merchant') {
    return res.status(403).json({ 
      success: false, 
      message: 'Merchant access required' 
    });
  }
  next();
};

// Middleware to verify approved merchant
export const requireApprovedMerchant = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'merchant') {
      return res.status(403).json({ 
        success: false, 
        message: 'Merchant access required' 
      });
    }

    // Import Merchant model dynamically to avoid circular dependency
    const { default: Merchant } = await import('../models/Merchant.js');
    
    const merchant = await Merchant.findOne({ 
      walletAddress: req.user.walletAddress.toLowerCase() 
    });

    if (!merchant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Merchant not found' 
      });
    }

    if (merchant.status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: 'Merchant account not approved' 
      });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error('Error verifying merchant approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to verify wallet address ownership
export const verifyWalletOwnership = (req, res, next) => {
  const { walletAddress } = req.params;
  
  if (!walletAddress) {
    return res.status(400).json({ 
      success: false, 
      message: 'Wallet address required' 
    });
  }

  if (req.user.role === 'admin') {
    // Admins can access any wallet
    next();
    return;
  }

  if (req.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: wallet address mismatch' 
    });
  }

  next();
};

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '24h' 
  });
};

// Verify JWT token without middleware
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
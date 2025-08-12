import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import Merchant from '../models/Merchant.js';
import { generateToken } from '../middleware/auth.js';
// import { logAuthActivity } from '../middleware/logger.js';
import { authorizeMerchantOnChain, isMerchantAuthorizedOnChain } from '../utils/blockchain.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      // await logAuthActivity(req, null, 'admin_login_failed', 'Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check admin credentials
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username !== adminUsername || password !== adminPassword) {
      // await logAuthActivity(req, null, 'admin_login_failed', 'Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      id: 'admin',
      role: 'admin',
      username: adminUsername
    });

    // await logAuthActivity(req, 'admin', 'admin_login_success', 'Admin logged in successfully');

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: 'admin',
        role: 'admin',
        username: adminUsername
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    // await logAuthActivity(req, null, 'admin_login_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Merchant registration
router.post('/merchant/register', async (req, res) => {
  try {
    const {
      name,
      organization,
      email,
      phone,
      address,
      businessLicense,
      description,
      walletAddress,
      signature,
      message
    } = req.body;

    // Validate input
    if (!name || !organization || !email || !walletAddress || !signature || !message) {
      // await logAuthActivity(req, null, 'merchant_registration_failed', 'Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      // await logAuthActivity(req, walletAddress, 'merchant_registration_failed', 'Invalid wallet address');
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        // await logAuthActivity(req, walletAddress, 'merchant_registration_failed', 'Signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Signature verification failed'
        });
      }
    } catch (error) {
      // await logAuthActivity(req, walletAddress, 'merchant_registration_failed', 'Invalid signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({
      $or: [
        { email },
        { walletAddress: walletAddress.toLowerCase() }
      ]
    });

    if (existingMerchant) {
      // await logAuthActivity(req, walletAddress, 'merchant_registration_failed', 'Merchant already exists');
      return res.status(409).json({
        success: false,
        message: 'Merchant with this email or wallet address already exists'
      });
    }

    // Create new merchant
    const merchant = new Merchant({
      name,
      organization,
      email,
      phone,
      address,
      businessLicense,
      description,
      walletAddress: walletAddress.toLowerCase(),
      status: 'pending'
    });

    await merchant.save();

    // await logAuthActivity(req, walletAddress, 'merchant_registration_success', 'Merchant registered successfully');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
      merchant: {
        id: merchant._id,
        name: merchant.name,
        organization: merchant.organization,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        status: merchant.status,
        createdAt: merchant.createdAt
      }
    });
  } catch (error) {
    console.error('Merchant registration error:', error);
    // await logAuthActivity(req, req.body?.walletAddress, 'merchant_registration_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Merchant login with MetaMask
router.post('/merchant/login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate input
    if (!walletAddress || !signature || !message) {
      // await logAuthActivity(req, walletAddress, 'merchant_login_failed', 'Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Wallet address, signature, and message are required'
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      // await logAuthActivity(req, walletAddress, 'merchant_login_failed', 'Invalid wallet address');
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        // await logAuthActivity(req, walletAddress, 'merchant_login_failed', 'Signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Signature verification failed'
        });
      }
    } catch (error) {
      // await logAuthActivity(req, walletAddress, 'merchant_login_failed', 'Invalid signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Find merchant in database
    const merchant = await Merchant.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (!merchant) {
      // await logAuthActivity(req, walletAddress, 'merchant_login_failed', 'Merchant not found');
      return res.status(404).json({
        success: false,
        message: 'Merchant not found. Please register first.'
      });
    }

    if (merchant.status !== 'approved') {
      // await logAuthActivity(req, walletAddress, 'merchant_login_failed', `Merchant status: ${merchant.status}`);
      return res.status(403).json({
        success: false,
        message: `Account ${merchant.status}. Please contact admin.`,
        status: merchant.status
      });
    }

    // Update last login
    merchant.lastLoginAt = new Date();
    await merchant.save();

    // Generate token
    const token = generateToken({
      id: merchant._id,
      role: 'merchant',
      walletAddress: merchant.walletAddress,
      name: merchant.name,
      organization: merchant.organization
    });

    // await logAuthActivity(req, walletAddress, 'merchant_login_success', 'Merchant logged in successfully');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        organization: merchant.organization,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        status: merchant.status,
        createdAt: merchant.createdAt,
        lastLoginAt: merchant.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Merchant login error:', error);
    // await logAuthActivity(req, req.body?.walletAddress, 'merchant_login_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get merchant profile
router.get('/merchant/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const merchant = await Merchant.findById(decoded.id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        organization: merchant.organization,
        email: merchant.email,
        phone: merchant.phone,
        address: merchant.address,
        businessLicense: merchant.businessLicense,
        description: merchant.description,
        walletAddress: merchant.walletAddress,
        status: merchant.status,
        createdAt: merchant.createdAt,
        lastLoginAt: merchant.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Get merchant profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For admin
    if (decoded.role === 'admin') {
      return res.json({
        success: true,
        valid: true,
        user: {
          id: decoded.id,
          role: decoded.role,
          username: decoded.username
        }
      });
    }

    // For merchant
    if (decoded.role === 'merchant') {
      const merchant = await Merchant.findById(decoded.id);
      
      if (!merchant || merchant.status !== 'approved') {
        return res.status(403).json({
          success: false,
          valid: false,
          message: 'Merchant account not active'
        });
      }

      return res.json({
        success: true,
        valid: true,
        user: {
          id: merchant._id,
          role: 'merchant',
          name: merchant.name,
          organization: merchant.organization,
          walletAddress: merchant.walletAddress,
          status: merchant.status
        }
      });
    }

    res.status(400).json({
      success: false,
      valid: false,
      message: 'Invalid token role'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid or expired token'
    });
  }
});

export default router;
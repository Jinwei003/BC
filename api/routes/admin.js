import express from 'express';
import mongoose from 'mongoose';
import Merchant from '../models/Merchant.js';
import Complaint from '../models/Complaint.js';
import SystemLog from '../models/SystemLog.js';
import Ingredients from '../models/Ingredients.js';
import TestProcess from '../models/TestProcess.js';
import Authentication from '../models/Authentication.js';
import CombinedReport from '../models/CombinedReport.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
// import { logActivity } from '../middleware/logger.js';
import { authorizeMerchantOnChain, revokeMerchantOnChain } from '../utils/blockchain.js';
import { uploadToIPFS, generateSHA256Hash } from '../utils/ipfs.js';
import { createBatchOnChain, storeReportOnChain } from '../utils/blockchain.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`=== ADMIN ROUTE REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Full URL: ${req.originalUrl}`);
  console.log(`Body:`, req.body);
  console.log(`Headers:`, req.headers);
  next();
});

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all merchants
router.get('/merchants', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const merchants = await Merchant.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Merchant.countDocuments(query);

    // await logActivity(req, req.user.id, 'admin_view_merchants', 'Admin viewed merchants list');

    res.json({
      success: true,
      merchants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get merchants error:', error);
    // await logActivity(req, req.user.id, 'admin_view_merchants_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get merchant by ID
router.get('/merchants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findById(id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // await logActivity(req, req.user.id, 'admin_view_merchant', `Admin viewed merchant ${id}`);

    res.json({
      success: true,
      merchant
    });
  } catch (error) {
    console.error('Get merchant error:', error);
    // await logActivity(req, req.user.id, 'admin_view_merchant_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Approve merchant
router.post('/merchants/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const merchant = await Merchant.findById(id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    if (merchant.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Merchant is already approved'
      });
    }

    // Authorize merchant on blockchain
    try {
      const blockchainResult = await authorizeMerchantOnChain(merchant.walletAddress);
      
      // Update merchant status
      merchant.status = 'approved';
      merchant.approvedAt = new Date();
      merchant.approvedBy = req.user.id;
      if (notes) {
        merchant.approvalNotes = notes;
      }
      merchant.blockchainTxHash = blockchainResult.transactionHash;
      
      await merchant.save();

      // await logActivity(req, req.user.id, 'admin_approve_merchant', 
      //   `Admin approved merchant ${id}`, {
      //     merchantId: id,
      //     walletAddress: merchant.walletAddress,
      //     transactionHash: blockchainResult.transactionHash
      //   });

      res.json({
        success: true,
        message: 'Merchant approved successfully',
        merchant,
        blockchain: blockchainResult
      });
    } catch (blockchainError) {
      console.error('Blockchain authorization error:', blockchainError);
      // await logActivity(req, req.user.id, 'admin_approve_merchant_blockchain_error', 
      //   `Blockchain authorization failed for merchant ${id}: ${blockchainError.message}`);
      
      res.status(500).json({
        success: false,
        message: 'Failed to authorize merchant on blockchain',
        error: blockchainError.message
      });
    }
  } catch (error) {
    console.error('Approve merchant error:', error);
    // await logActivity(req, req.user.id, 'admin_approve_merchant_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reject merchant
router.post('/merchants/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const merchant = await Merchant.findById(id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    if (merchant.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Merchant is already rejected'
      });
    }

    // Update merchant status
    merchant.status = 'rejected';
    merchant.rejectedAt = new Date();
    merchant.rejectedBy = req.user.id;
    merchant.rejectionReason = reason;
    
    await merchant.save();

    // await logActivity(req, req.user.id, 'admin_reject_merchant', 
    //   `Admin rejected merchant ${id}`, {
    //     merchantId: id,
    //     walletAddress: merchant.walletAddress,
    //     reason
    //   });

    res.json({
      success: true,
      message: 'Merchant rejected successfully',
      merchant
    });
  } catch (error) {
    console.error('Reject merchant error:', error);
    // await logActivity(req, req.user.id, 'admin_reject_merchant_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Revoke merchant
router.post('/merchants/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Revocation reason is required'
      });
    }

    const merchant = await Merchant.findById(id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    if (merchant.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved merchants can be revoked'
      });
    }

    // Revoke merchant on blockchain
    try {
      const blockchainResult = await revokeMerchantOnChain(merchant.walletAddress);
      
      // Update merchant status
      merchant.status = 'revoked';
      merchant.revokedAt = new Date();
      merchant.revokedBy = req.user.id;
      merchant.revocationReason = reason;
      merchant.revocationTxHash = blockchainResult.transactionHash;
      
      await merchant.save();

      // await logActivity(req, req.user.id, 'admin_revoke_merchant', 
      //   `Admin revoked merchant ${id}`, {
      //     merchantId: id,
      //     walletAddress: merchant.walletAddress,
      //     reason,
      //     transactionHash: blockchainResult.transactionHash
      //   });

      res.json({
        success: true,
        message: 'Merchant revoked successfully',
        merchant,
        blockchain: blockchainResult
      });
    } catch (blockchainError) {
      console.error('Blockchain revocation error:', blockchainError);
      // await logActivity(req, req.user.id, 'admin_revoke_merchant_blockchain_error', 
      //   `Blockchain revocation failed for merchant ${id}: ${blockchainError.message}`);
      
      res.status(500).json({
        success: false,
        message: 'Failed to revoke merchant on blockchain',
        error: blockchainError.message
      });
    }
  } catch (error) {
    console.error('Revoke merchant error:', error);
    // await logActivity(req, req.user.id, 'admin_revoke_merchant_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all complaints
router.get('/complaints', async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (severity) {
      query.severity = severity;
    }
    if (search) {
      query.$or = [
        { batchId: { $regex: search, $options: 'i' } },
        { 'complainant.name': { $regex: search, $options: 'i' } },
        { 'complainant.email': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    // await logActivity(req, req.user.id, 'admin_view_complaints', 'Admin viewed complaints list');

    res.json({
      success: true,
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    // await logActivity(req, req.user.id, 'admin_view_complaints_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get complaint by ID
router.get('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // await logActivity(req, req.user.id, 'admin_view_complaint', `Admin viewed complaint ${id}`);

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    // await logActivity(req, req.user.id, 'admin_view_complaint_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority, internalNotes } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority'
      });
    }

    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update fields
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (priority) complaint.priority = priority;
    if (internalNotes) {
      complaint.internalNotes.push({
        note: internalNotes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    complaint.updatedAt = new Date();
    await complaint.save();

    // await logActivity(req, req.user.id, 'admin_update_complaint', 
    //   `Admin updated complaint ${id}`, {
    //     complaintId: id,
    //     changes: { status, assignedTo, priority }
    //   });

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    // await logActivity(req, req.user.id, 'admin_update_complaint_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [merchantStats, complaintStats] = await Promise.all([
      Merchant.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Get recent activity
    const recentLogs = await SystemLog.find({
      category: { $in: ['auth', 'admin', 'merchant'] }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp level action message userId');

    // await logActivity(req, req.user.id, 'admin_view_stats', 'Admin viewed system statistics');

    res.json({
      success: true,
      stats: {
        merchants: merchantStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        complaints: complaintStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentActivity: recentLogs
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    // await logActivity(req, req.user.id, 'admin_view_stats_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const { level, category, page = 1, limit = 50, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (level) {
      query.level = level;
    }
    if (category) {
      query.category = category;
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const logs = await SystemLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SystemLog.countDocuments(query);

    // await logActivity(req, req.user.id, 'admin_view_logs', 'Admin viewed system logs');

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    // await logActivity(req, req.user.id, 'admin_view_logs_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== REPORT APPROVAL ENDPOINTS =====

// Get all pending reports
router.get('/reports/pending', async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let reports = [];
    let total = 0;

    if (!type || type === 'all') {
      // Get all pending reports from all types
      const [ingredients, testProcess, authentication] = await Promise.all([
        Ingredients.find({ status: 'pending' }).populate('merchantId', 'name organization').sort({ createdAt: -1 }),
        TestProcess.find({ status: 'pending' }).populate('merchantId', 'name organization').sort({ createdAt: -1 }),
        Authentication.find({ status: 'pending' }).populate('merchantId', 'name organization').sort({ createdAt: -1 })
      ]);

      // Combine and add type field
      reports = [
        ...ingredients.map(r => ({ ...r.toObject(), reportType: 'ingredients' })),
        ...testProcess.map(r => ({ ...r.toObject(), reportType: 'test-process' })),
        ...authentication.map(r => ({ ...r.toObject(), reportType: 'authentication' }))
      ];

      // Sort by creation date and paginate
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      total = reports.length;
      reports = reports.slice(skip, skip + parseInt(limit));
    } else {
      // Get specific type of reports
      let Model;
      switch (type) {
        case 'ingredients':
          Model = Ingredients;
          break;
        case 'test-process':
          Model = TestProcess;
          break;
        case 'authentication':
          Model = Authentication;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }

      reports = await Model.find({ status: 'pending' })
        .populate('merchantId', 'name organization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      total = await Model.countDocuments({ status: 'pending' });
      reports = reports.map(r => ({ ...r.toObject(), reportType: type }));
    }

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== COMBINED REPORT ENDPOINTS ===== 
// NOTE: These routes must come BEFORE the generic /reports/:type routes to avoid conflicts

// Get all pending combined reports
router.get('/reports/combined/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await CombinedReport.find({ status: 'pending' })
      .populate('merchantWallet', 'name organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CombinedReport.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending combined reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all approved combined reports
router.get('/reports/combined/approved', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await CombinedReport.find({ status: 'approved' })
      .populate('merchantWallet', 'name organization email')
      .sort({ approvedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CombinedReport.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get approved combined reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific combined report by ID
router.get('/reports/combined/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await CombinedReport.findById(id)
      .populate('merchantWallet', 'name organization email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Combined report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get combined report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Approve a combined report
router.post('/reports/combined/:id/approve', async (req, res) => {
  try {
    console.log('=== APPROVE REQUEST START ===');
    console.log('Approve request received for report ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('ObjectId valid:', mongoose.Types.ObjectId.isValid(req.params.id));
    
    const { id } = req.params;
    const { notes } = req.body;

    console.log('Searching for report with ID:', id);
    const report = await CombinedReport.findById(id);
    console.log('Found report:', report ? 'Yes' : 'No');
    console.log('Report details:', report ? { id: report._id, status: report.status, batchId: report.batchId } : 'null');
    
    if (!report) {
      console.log('Report not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Combined report not found'
      });
    }

    console.log('Report status:', report.status);
    if (report.status !== 'pending') {
      console.log('Report is not pending, current status:', report.status);
      return res.status(400).json({
        success: false,
        message: 'Report is not pending approval'
      });
    }

    try {
      // Prepare report data for hashing and IPFS upload
      const reportData = {
        ...report.toObject(),
        approvedAt: new Date(),
        approvedBy: req.user.id
      };
      
      console.log('Generating SHA-256 hash and uploading to Pinata IPFS...');
      // Generate SHA-256 hash and upload to Pinata IPFS
      const { hash: sha256Hash, cid: ipfsCid } = await uploadToIPFS(reportData, `combined-report-${id}`);
      console.log('IPFS upload successful:', { sha256Hash, ipfsCid });
      
      console.log('Storing report on blockchain...');
      // Store report hash and CID on blockchain
      const blockchainResult = await storeReportOnChain(id, sha256Hash, ipfsCid);
      console.log('Blockchain storage successful:', blockchainResult);
      
      // Update report with all the new data
      report.status = 'approved';
      report.approvedAt = new Date();
      report.approvedBy = req.user.id;
      report.sha256Hash = sha256Hash;
      report.ipfsHash = ipfsCid; // Store the CID as ipfsHash for backward compatibility
      report.ipfsCid = ipfsCid;
      report.blockchainTxHash = blockchainResult.transactionHash;
      report.onBlockchain = true;
      
      // Update Authentication Report audit trail to show blockchain verification complete
      if (report.authenticationReport) {
        report.authenticationReport.auditTrail = 'Blockchain verification complete';
      }
      
      if (notes) {
        report.approvalNotes = notes;
      }
      
      await report.save();
      console.log('Report saved successfully with blockchain data');

      res.json({
        success: true,
        message: 'Combined report approved successfully',
        report,
        blockchain: {
          hash: sha256Hash,
          ipfsCid: ipfsCid,
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber
        }
      });
    } catch (blockchainError) {
      console.error('Blockchain/IPFS error during approval:', blockchainError);
      
      // Still approve the report but without blockchain data
      report.status = 'approved';
      report.approvedAt = new Date();
      report.approvedBy = req.user.id;
      if (notes) {
        report.approvalNotes = notes;
      }
      
      await report.save();
      
      res.json({
        success: true,
        message: 'Combined report approved successfully (blockchain integration failed)',
        report,
        warning: 'Blockchain integration failed: ' + blockchainError.message
      });
    }
  } catch (error) {
    console.error('Approve combined report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Reject a combined report
router.post('/reports/combined/:id/reject', async (req, res) => {
  try {
    console.log('=== REJECT REQUEST START ===');
    console.log('Reject request received for report ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('ObjectId valid:', mongoose.Types.ObjectId.isValid(req.params.id));
    
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      console.log('Rejection reason missing');
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    console.log('Searching for report with ID:', id);
    const report = await CombinedReport.findById(id);
    console.log('Found report:', report ? 'Yes' : 'No');
    console.log('Report details:', report ? { id: report._id, status: report.status, batchId: report.batchId } : 'null');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Combined report not found'
      });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Report is not pending approval'
      });
    }

    // Update report status to rejected
    report.status = 'rejected';
    report.rejectedAt = new Date();
    report.rejectedBy = req.user.id;
    report.rejectionReason = reason;
    
    await report.save();

    res.json({
      success: true,
      message: 'Combined report rejected successfully',
      report
    });
  } catch (error) {
    console.error('Reject combined report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== GENERIC REPORT ENDPOINTS =====

// Approve a report
router.post('/reports/:type/:id/approve', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { notes } = req.body;

    // Get the appropriate model
    let Model;
    switch (type) {
      case 'ingredients':
        Model = Ingredients;
        break;
      case 'test-process':
        Model = TestProcess;
        break;
      case 'authentication':
        Model = Authentication;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    const report = await Model.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Report is not pending approval'
      });
    }

    try {
      // Prepare report data for hashing and IPFS upload
      const reportData = {
        ...report.toObject(),
        approvedAt: new Date(),
        approvedBy: req.user.id
      };
      
      // Generate SHA-256 hash and upload to Pinata IPFS
      const { hash: sha256Hash, cid: ipfsCid } = await uploadToIPFS(reportData, `${type}-report-${id}`);
      
      // Store report hash and CID on blockchain
      const blockchainResult = await storeReportOnChain(id, sha256Hash, ipfsCid);
      
      // Update report with all the new data
      report.status = 'approved';
      report.approvedAt = new Date();
      report.approvedBy = req.user.id;
      report.sha256Hash = sha256Hash;
      report.ipfsHash = ipfsCid; // Store the CID as ipfsHash for backward compatibility
      report.ipfsCid = ipfsCid;
      report.blockchainTxHash = blockchainResult.transactionHash;
      if (notes) {
        report.approvalNotes = notes;
      }
      
      await report.save();

      // If this is an authentication report, try to create batch on blockchain
      if (type === 'authentication') {
        try {
          // Get related reports
          const ingredientsReport = await Ingredients.findOne({ 
            merchantId: report.merchantId, 
            batchId: report.batchId,
            status: 'approved'
          });
          
          const testProcessReport = await TestProcess.findOne({ 
            merchantId: report.merchantId, 
            batchId: report.batchId,
            status: 'approved'
          });

          if (ingredientsReport && testProcessReport) {
            // All reports are approved, create batch on blockchain
            const batchResult = await createBatchOnChain(
              report.batchId,
              ingredientsReport.ipfsHash,
              testProcessReport.ipfsHash,
              report.ipfsHash
            );

            // Update all reports with blockchain transaction hash
            await Promise.all([
              Ingredients.findByIdAndUpdate(ingredientsReport._id, { blockchainTxHash: batchResult.transactionHash }),
              TestProcess.findByIdAndUpdate(testProcessReport._id, { blockchainTxHash: batchResult.transactionHash }),
              Authentication.findByIdAndUpdate(report._id, { blockchainTxHash: batchResult.transactionHash })
            ]);

            return res.json({
              success: true,
              message: 'Report approved and batch created on blockchain successfully',
              report,
              sha256Hash,
              ipfs: { 
                cid: ipfsCid,
                hash: ipfsCid // For backward compatibility
              },
              blockchain: {
                reportTransaction: blockchainResult,
                batchTransaction: batchResult
              }
            });
          }
        } catch (blockchainError) {
          console.error('Blockchain batch creation error:', blockchainError);
          // Report is still approved even if blockchain fails
        }
      }

      res.json({
        success: true,
        message: 'Report approved successfully',
        report,
        sha256Hash,
        ipfs: { 
          cid: ipfsCid,
          hash: ipfsCid // For backward compatibility
        },
        blockchain: blockchainResult
      });
    } catch (ipfsError) {
      console.error('IPFS upload error:', ipfsError);
      res.status(500).json({
        success: false,
        message: 'Failed to upload report to IPFS',
        error: ipfsError.message
      });
    }
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reject a report
router.post('/reports/:type/:id/reject', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get the appropriate model
    let Model;
    switch (type) {
      case 'ingredients':
        Model = Ingredients;
        break;
      case 'test-process':
        Model = TestProcess;
        break;
      case 'authentication':
        Model = Authentication;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    const report = await Model.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Report is not pending approval'
      });
    }

    // Update report status to rejected
    report.status = 'rejected';
    report.rejectedAt = new Date();
    report.rejectedBy = req.user.id;
    report.rejectionReason = reason;
    
    await report.save();

    res.json({
      success: true,
      message: 'Report rejected successfully',
      report
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
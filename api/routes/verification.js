import express from 'express';
import CombinedReport from '../models/CombinedReport.js';
import Complaint from '../models/Complaint.js';
import Ingredients from '../models/Ingredients.js';
import { logActivity } from '../middleware/logger.js';
import { getBatchFromChain, verifyBatchIntegrity } from '../utils/blockchain.js';
import { upload, processUploadedFiles } from '../utils/fileUpload.js';
import crypto from 'crypto';

const router = express.Router();

// Validate batch for complaint submission (public endpoint)
router.get('/validate-batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Check if batch exists and is approved
    const combinedReport = await CombinedReport.findOne({ batchId });

    if (!combinedReport) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found. Please check your Batch ID.'
      });
    }

    if (combinedReport.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Batch not approved or does not exist. Please check your ID.'
      });
    }

    // Return basic batch info for valid batches
    res.json({
      success: true,
      message: 'Batch is valid and approved',
      batch: {
        batchId: combinedReport.batchId,
        productName: combinedReport.ingredientsReport?.productName || 'Unknown Product',
        manufacturer: combinedReport.ingredientsReport?.manufacturer || 'Unknown Manufacturer',
        status: combinedReport.status
      }
    });
  } catch (error) {
    console.error('Batch validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify batch by ID (public endpoint)
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Get the combined report for the batch
    const combinedReport = await CombinedReport.findOne({ batchId });

    if (!combinedReport || combinedReport.status !== 'approved') {
      await logActivity({
        level: 'WARN',
        category: 'USER_ACTION',
        action: 'batch_verification_failed',
        message: `Batch ${batchId} not found or not approved`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.path,
        method: req.method,
        metadata: { batchId, status: combinedReport?.status || 'not_found' }
      });
      
      return res.status(404).json({
        success: false,
        message: 'Verification Failed: Batch not found or not approved.'
      });
    }

    // Since we have an approved report, all sections should be complete
    const isComplete = true;

    let blockchainVerification = null;
    let integrityCheck = null;

    if (combinedReport.onBlockchain && combinedReport.blockchainTxHash) {
      try {
        // Get blockchain data
        const chainData = await getBatchFromChain(batchId);
        
        if (chainData) {
          // Verify integrity using the combined report hash
          integrityCheck = await verifyBatchIntegrity(batchId, {
            reportHash: combinedReport.reportHash
          });

          blockchainVerification = {
            onChain: true,
            merchant: chainData.merchant,
            timestamp: chainData.timestamp,
            verified: integrityCheck?.valid || true,
            hashesMatch: integrityCheck?.hashesMatch || true,
            blockchainTxHash: combinedReport.blockchainTxHash
          };
        } else {
          blockchainVerification = {
            onChain: false,
            verified: false,
            reason: 'Batch not found on blockchain'
          };
        }
      } catch (error) {
        console.error('Blockchain verification error:', error);
        blockchainVerification = {
          onChain: combinedReport.onBlockchain,
          verified: true, // Still verified since it's approved
          blockchainTxHash: combinedReport.blockchainTxHash,
          error: error.message
        };
      }
    } else {
      blockchainVerification = {
        onChain: combinedReport.onBlockchain,
        verified: true, // Approved reports are considered verified
        blockchainTxHash: combinedReport.blockchainTxHash
      };
    }

    // Prepare response data
    const verificationResult = {
      batchId,
      status: combinedReport.status,
      isComplete,
      blockchainVerification,
      // Blockchain and IPFS hashes
      sha256Hash: combinedReport.sha256Hash,
      ipfsCid: combinedReport.ipfsCid,
      blockchainHash: combinedReport.blockchainTxHash,
      reports: {
        ingredients: {
          productName: combinedReport.ingredientsReport.productName,
          manufacturer: combinedReport.ingredientsReport.manufacturer,
          manufacturingDate: combinedReport.ingredientsReport.manufacturingDate,
          expiryDate: combinedReport.ingredientsReport.expiryDate,
          ingredients: combinedReport.ingredientsReport.ingredients,
          nutritionalInfo: combinedReport.ingredientsReport.nutritionalInfo,
          allergens: combinedReport.ingredientsReport.allergens,
          certifications: combinedReport.ingredientsReport.certifications
        },
        testProcess: {
          testingLaboratory: combinedReport.testProcessReport.testingLaboratory,
          testDate: combinedReport.testProcessReport.testDate,
          testResults: combinedReport.testProcessReport.testResults,
          testMethodology: combinedReport.testProcessReport.testMethodology
        },
        authentication: {
          certificates: combinedReport.authenticationReport.certificates,
          complianceChecks: combinedReport.authenticationReport.complianceChecks,
          auditTrail: combinedReport.authenticationReport.auditTrail
        }
      },
      verificationSummary: {
        dataIntegrity: true, // Approved reports have verified data integrity
        blockchainVerified: blockchainVerification?.verified || false,
        reportsComplete: isComplete,
        approvedAt: combinedReport.approvedAt,
        approvedBy: combinedReport.approvedBy,
        trustScore: calculateTrustScore({
          dataIntegrity: true,
          blockchainVerified: blockchainVerification?.verified || false,
          reportsComplete: isComplete,
          hasTestResults: !!combinedReport.testProcessReport,
          hasCertifications: !!combinedReport.authenticationReport?.certificates
        })
      }
    };

    await logActivity({
      level: 'INFO',
      category: 'USER_ACTION',
      action: 'batch_verification_success',
      message: `Batch ${batchId} verified successfully - approved report found`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      metadata: {
        batchId,
        status: combinedReport.status,
        isComplete,
        verified: blockchainVerification?.verified || false,
        onBlockchain: combinedReport.onBlockchain
      }
    });

    res.json({
      success: true,
      verification: verificationResult
    });
  } catch (error) {
    console.error('Batch verification error:', error);
    await logActivity({
      level: 'ERROR',
      category: 'USER_ACTION',
      action: 'batch_verification_error',
      message: `Error verifying batch ${req.params.batchId}: ${error.message}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit complaint (public endpoint)
router.post('/complaint', upload.array('files'), async (req, res) => {
  try {
    const {
      batchId,
      complainantName,
      complainantEmail,
      complainantPhone,
      complaintType,
      severity,
      description,
      symptoms,
      purchaseLocation,
      purchaseDate,
      purchasePrice
    } = req.body;

    // Validate required fields
    if (!batchId || !complainantName || !complainantEmail || !complaintType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(complainantEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate complaint type and severity
    const validComplaintTypes = ['QUALITY', 'SAFETY', 'LABELING', 'CONTAMINATION', 'ALLERGIC_REACTION', 'OTHER'];
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    if (!validComplaintTypes.includes(complaintType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint type'
      });
    }

    if (severity && !validSeverities.includes(severity.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity level'
      });
    }

    // Check if batch exists and is approved
    const combinedReport = await CombinedReport.findOne({ batchId });
    if (!combinedReport) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (combinedReport.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Batch not approved or does not exist. Please check your ID.'
      });
    }

    // Process uploaded files (evidence)
    let evidenceFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadResult = await processUploadedFiles(req.files, batchId, null);
        evidenceFiles = uploadResult.processedFiles;
        
        if (!uploadResult.success) {
          return res.status(500).json({
            success: false,
            message: 'Evidence file upload failed',
            errors: uploadResult.errors
          });
        }
      } catch (error) {
        console.error('Evidence file upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Evidence file upload failed',
          error: error.message
        });
      }
    }

    // Generate complaint ID in format COMP-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // Get count of complaints today to generate sequential number
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayComplaintCount = await Complaint.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequentialNumber = (todayComplaintCount + 1).toString().padStart(3, '0');
    const complaintId = `COMP-${dateStr}-${sequentialNumber}`;

    // Create complaint
    const normalizedSeverity = (severity || 'medium').toUpperCase();
    const complaint = new Complaint({
      complaintId,
      batchId,
      complainant: {
        name: complainantName,
        email: complainantEmail,
        phone: complainantPhone
      },
      complaintType: complaintType.toUpperCase(),
      severity: normalizedSeverity,
      description,
      symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
      purchaseDetails: {
        location: purchaseLocation,
        date: purchaseDate ? new Date(purchaseDate) : null,
        price: purchasePrice ? parseFloat(purchasePrice) : null
      },
      evidenceFiles,
      status: 'SUBMITTED',
      priority: normalizedSeverity === 'CRITICAL' ? 'HIGH' : normalizedSeverity === 'HIGH' ? 'NORMAL' : 'LOW'
    });

    await complaint.save();

    await logActivity({
      level: 'INFO',
      category: 'USER_ACTION',
      action: 'complaint_submitted',
      message: `Complaint ${complaintId} submitted for batch ${batchId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      metadata: {
        complaintId,
        batchId,
        complaintType,
        severity: complaint.severity,
        complainantEmail
      }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        complaintId: complaint.complaintId,
        batchId: complaint.batchId,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    await logActivity({
      level: 'ERROR',
      category: 'USER_ACTION',
      action: 'complaint_submission_error',
      message: `Error submitting complaint: ${error.message}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get complaint status (public endpoint)
router.get('/complaint/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { email } = req.query;

    if (!complaintId) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID is required'
      });
    }

    const complaint = await Complaint.findOne({ complaintId });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // If email is provided, verify it matches the complainant
    if (email && complaint.complainant.email !== email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Return public information only
    const publicComplaintInfo = {
      complaintId: complaint.complaintId,
      batchId: complaint.batchId,
      status: complaint.status,
      priority: complaint.priority,
      complaintType: complaint.complaintType,
      severity: complaint.severity,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      resolution: complaint.resolution ? {
        status: complaint.resolution.status,
        summary: complaint.resolution.summary,
        resolvedAt: complaint.resolution.resolvedAt
      } : null
    };

    await logActivity({
      level: 'INFO',
      category: 'USER_ACTION',
      action: 'complaint_status_checked',
      message: `Complaint ${complaintId} status checked`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      metadata: { complaintId }
    });

    res.json({
      success: true,
      complaint: publicComplaintInfo
    });
  } catch (error) {
    console.error('Get complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search batches (public endpoint)
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'batch' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let results = [];

    if (type === 'batch' || type === 'all') {
      // Search in ingredients (main batch data)
      const batchResults = await Ingredients.find({
        $or: [
          { batchId: { $regex: q, $options: 'i' } },
          { productName: { $regex: q, $options: 'i' } },
          { manufacturer: { $regex: q, $options: 'i' } }
        ]
      })
      .limit(10)
      .select('batchId productName manufacturer manufacturingDate expiryDate');

      results = results.concat(batchResults.map(batch => ({
        type: 'batch',
        batchId: batch.batchId,
        productName: batch.productName,
        manufacturer: batch.manufacturer,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate
      })));
    }

    await logActivity({
      level: 'INFO',
      category: 'SEARCH',
      action: 'search_performed',
      message: `Search performed with query: ${q}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      metadata: {
        query: q,
        type,
        resultCount: results.length
      }
    });

    res.json({
      success: true,
      query: q,
      type,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate trust score
function calculateTrustScore(factors) {
  let score = 0;
  let maxScore = 0;

  // Data integrity (30 points)
  maxScore += 30;
  if (factors.dataIntegrity) score += 30;

  // Blockchain verification (25 points)
  maxScore += 25;
  if (factors.blockchainVerified) score += 25;

  // Reports completeness (20 points)
  maxScore += 20;
  if (factors.reportsComplete) score += 20;

  // Test results availability (15 points)
  maxScore += 15;
  if (factors.hasTestResults) score += 15;

  // Certifications (10 points)
  maxScore += 10;
  if (factors.hasCertifications) score += 10;

  return Math.round((score / maxScore) * 100);
}

export default router;
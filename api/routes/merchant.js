import express from 'express';
import Ingredients from '../models/Ingredients.js';
import TestProcess from '../models/TestProcess.js';
import Authentication from '../models/Authentication.js';
import CombinedReport from '../models/CombinedReport.js';
import { requireMerchant, requireApprovedMerchant, verifyWalletOwnership } from '../middleware/auth.js';
import { logActivity, logFileActivity, logBlockchainActivity } from '../middleware/logger.js';
import { generateFileHash } from '../utils/fileUpload.js';
import { createBatchOnChain } from '../utils/blockchain.js';
import crypto from 'crypto';

const router = express.Router();

// Apply merchant authentication to all routes
router.use(requireMerchant);
router.use(requireApprovedMerchant);

// Submit combined report (all 3 sections)
router.post('/reports/combined', async (req, res) => {
  try {
    const {
      batchId,
      // Ingredients data
      ingredientsData: {
        productName,
        manufacturer,
        manufacturingDate,
        expiryDate,
        ingredients,
        nutritionalInfo,
        allergens,
        certifications
      } = {},
      // Test Process data
      testProcessData: {
        testingLaboratory,
        testDate,
        testResults,
        testMethodology
      } = {},
      // Authentication data
      authenticationData: {
        certificates,
        complianceChecks,
        auditTrail
      } = {}
    } = req.body;

    // Validate required fields
    if (!batchId || !productName || !manufacturer || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required ingredients fields'
      });
    }

    if (!testingLaboratory || !testDate || !testResults) {
      return res.status(400).json({
        success: false,
        message: 'Missing required test process fields'
      });
    }

    if (!certificates) {
      return res.status(400).json({
        success: false,
        message: 'Missing required authentication fields'
      });
    }

    // Check if batch already exists
    const existingBatch = await CombinedReport.findOne({ batchId });
    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: 'Batch ID already exists'
      });
    }

    // Process ingredients data
    let parsedIngredients = [];
    if (ingredients) {
      try {
        parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
      } catch (error) {
        parsedIngredients = [{
          name: ingredients,
          percentage: 100,
          source: 'Not specified'
        }];
      }
    }

    let parsedNutritionalInfo;
    if (nutritionalInfo && typeof nutritionalInfo === 'string') {
      parsedNutritionalInfo = {
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        calories: 0,
        description: nutritionalInfo
      };
    } else {
      parsedNutritionalInfo = nutritionalInfo || {
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        calories: 0
      };
    }

    let parsedAllergens = [];
    if (allergens) {
      try {
        parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
      } catch (error) {
        parsedAllergens = allergens.split(',').map(item => item.trim()).filter(item => item);
      }
    }

    let parsedCertifications = [];
    if (certifications) {
      try {
        parsedCertifications = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
      } catch (error) {
        parsedCertifications = [{
          name: certifications,
          issuedBy: 'Not specified',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }];
      }
    }

    // Process test results
    let parsedTestResults;
    if (testResults && typeof testResults === 'string') {
      try {
        parsedTestResults = JSON.parse(testResults);
      } catch (error) {
        parsedTestResults = {
          proteinContent: 'Not specified',
          purityTest: 'Not specified',
          microbiologicalTest: 'Not specified',
          heavyMetals: 'Not specified',
          overallResult: testResults
        };
      }
    } else {
      parsedTestResults = testResults || {
        proteinContent: 'Not specified',
        purityTest: 'Not specified',
        microbiologicalTest: 'Not specified',
        heavyMetals: 'Not specified',
        overallResult: 'Not specified'
      };
    }

    // Process compliance checks
    let parsedComplianceChecks;
    if (complianceChecks && typeof complianceChecks === 'string') {
      try {
        parsedComplianceChecks = JSON.parse(complianceChecks);
      } catch (error) {
        parsedComplianceChecks = {
          regulatoryCompliance: 'Not specified',
          qualityStandards: 'Not specified',
          overallCompliance: complianceChecks
        };
      }
    } else {
      parsedComplianceChecks = complianceChecks || {
        regulatoryCompliance: 'Not specified',
        qualityStandards: 'Not specified',
        overallCompliance: 'Not specified'
      };
    }

    // Create combined report data
    const reportData = {
      batchId,
      merchantWallet: req.user.walletAddress,
      ingredientsReport: {
        productName,
        manufacturer,
        manufacturingDate,
        expiryDate,
        ingredients: JSON.stringify(parsedIngredients),
        nutritionalInfo: JSON.stringify(parsedNutritionalInfo),
        allergens: JSON.stringify(parsedAllergens),
        certifications: JSON.stringify(parsedCertifications)
      },
      testProcessReport: {
        testingLaboratory,
        testDate,
        testResults: JSON.stringify(parsedTestResults),
        testMethodology: testMethodology || 'Not specified'
      },
      authenticationReport: {
        certificates,
        complianceChecks: JSON.stringify(parsedComplianceChecks),
        auditTrail: auditTrail || 'Not specified'
      },
      status: 'pending'
    };

    // Generate report hash
    const reportHash = generateFileHash(JSON.stringify(reportData));
    reportData.reportHash = reportHash;

    // Create combined report
    const combinedReport = new CombinedReport(reportData);
    await combinedReport.save();

    await logActivity(req, req.user.id, 'combined_report_created', 
      `Created combined report for batch ${batchId}`, {
        batchId,
        reportHash
      });

    res.status(201).json({
      success: true,
      message: 'Your report is pending admin approval.',
      report: combinedReport
    });
  } catch (error) {
    console.error('Upload combined report error:', error);
    await logActivity(req, req.user.id, 'combined_report_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get combined reports for merchant
router.get('/reports/combined', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { merchantWallet: req.user.walletAddress };
    if (search) {
      query.batchId = { $regex: search, $options: 'i' };
    }

    const reports = await CombinedReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform the data to match frontend expectations
    const transformedReports = reports.map(report => {
      const reportObj = report.toObject();
      return {
        ...reportObj,
        // Map database field names to frontend expected field names
        ingredientsData: reportObj.ingredientsReport,
        testProcessData: reportObj.testProcessReport,
        authenticationData: reportObj.authenticationReport
      };
    });

    const total = await CombinedReport.countDocuments(query);

    await logActivity(req, req.user.id, 'merchant_view_combined_reports', 'Merchant viewed their combined reports');

    res.json({
      success: true,
      reports: transformedReports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get combined reports error:', error);
    await logActivity(req, req.user.id, 'merchant_view_combined_reports_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific combined report details
router.get('/reports/combined/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const report = await CombinedReport.findOne({ 
      batchId, 
      merchantWallet: req.user.walletAddress 
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logActivity(req, req.user.id, 'merchant_view_combined_report_details', 
      `Merchant viewed combined report ${batchId} details`);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get combined report details error:', error);
    await logActivity(req, req.user.id, 'merchant_view_combined_report_details_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload ingredients report
router.post('/reports/ingredients', async (req, res) => {
  try {
    const {
      batchId,
      productName,
      manufacturer,
      manufacturingDate,
      expiryDate,
      ingredients,
      nutritionalInfo,
      allergens,
      certifications
    } = req.body;

    // Validate required fields
    if (!batchId || !productName || !manufacturer || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if batch already exists
    const existingBatch = await Ingredients.findOne({ batchId });
    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: 'Batch ID already exists'
      });
    }

    // Handle text fields (accept both JSON and plain text)
    let parsedIngredients = [];
    if (ingredients) {
      try {
        // Try to parse as JSON first
        parsedIngredients = JSON.parse(ingredients);
      } catch (error) {
        // If not JSON, create a default ingredient entry
        parsedIngredients = [{
          name: ingredients,
          percentage: 100,
          source: 'Not specified'
        }];
      }
    }
    
    // Parse nutritionalInfo - create object with required fields
    let parsedNutritionalInfo;
    if (nutritionalInfo && typeof nutritionalInfo === 'string') {
      // Create a default nutritional info object with the text as description
      parsedNutritionalInfo = {
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        calories: 0,
        description: nutritionalInfo
      };
    } else {
      parsedNutritionalInfo = {
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        calories: 0
      };
    }
    
    // Parse allergens as array
    let parsedAllergens = [];
    if (allergens) {
      try {
        parsedAllergens = JSON.parse(allergens);
      } catch (error) {
        // If not JSON, split by comma or treat as single item
        parsedAllergens = allergens.split(',').map(item => item.trim()).filter(item => item);
      }
    }

    // Parse certifications as array of objects
    let parsedCertifications = [];
    if (certifications) {
      try {
        parsedCertifications = JSON.parse(certifications);
      } catch (error) {
        // If not JSON, create a default certification entry
        parsedCertifications = [{
          name: certifications,
          issuedBy: 'Not specified',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }];
      }
    }

    // No file processing - form-only submission

    // Create report data object
    const reportData = {
      batchId,
      productName,
      manufacturer,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      ingredients: parsedIngredients,
      nutritionalInfo: parsedNutritionalInfo,
      allergens: parsedAllergens,
      certifications: parsedCertifications
    };

    // Generate report hash
    const reportHash = generateFileHash(JSON.stringify(reportData));

    // Create ingredients report with pending status
    // IPFS upload and blockchain recording will happen after admin approval
    const ingredientsReport = new Ingredients({
      ...reportData,
      merchantWallet: req.user.walletAddress,
      reportHash,
      status: 'pending'
      // ipfsHash will be set after admin approval
    });

    await ingredientsReport.save();

    await logActivity(req, req.user.id, 'ingredients_report_created', 
      `Created ingredients report for batch ${batchId}`, {
        batchId,
        reportHash
      });

    res.status(201).json({
      success: true,
      message: 'Ingredients report submitted successfully and is pending admin approval',
      report: ingredientsReport
    });
  } catch (error) {
    console.error('Upload ingredients report error:', error);
    await logActivity(req, req.user.id, 'ingredients_report_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload test process report
router.post('/reports/test-process', async (req, res) => {
  try {
    const {
      batchId,
      testingLaboratory,
      testDate,
      testResults,
      testMethodology
    } = req.body;

    // Validate required fields
    if (!batchId || !testingLaboratory || !testDate || !testResults) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if ingredients report exists
    const ingredientsReport = await Ingredients.findOne({ batchId });
    if (!ingredientsReport) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients report must be uploaded first'
      });
    }

    // Check if test process already exists
    const existingTestProcess = await TestProcess.findOne({ batchId });
    if (existingTestProcess) {
      return res.status(409).json({
        success: false,
        message: 'Test process report already exists for this batch'
      });
    }

    // Handle text fields (accept both JSON and plain text)
    const parsedTestingLaboratory = testingLaboratory || '';
    const parsedTestResults = testResults || '';
    const parsedTestMethodology = testMethodology || '';

    // No file processing - form-only submission

    // Create report data object
    const reportData = {
      batchId,
      testingLaboratory: parsedTestingLaboratory,
      testDate: new Date(testDate),
      testResults: parsedTestResults,
      testMethodology: parsedTestMethodology
    };

    // Generate report hash
    const reportHash = generateFileHash(JSON.stringify(reportData));

    // Create test process report with pending status
    // IPFS upload and blockchain recording will happen after admin approval
    const testProcessReport = new TestProcess({
      ...reportData,
      merchantWallet: req.user.walletAddress,
      reportHash,
      status: 'pending'
      // ipfsHash will be set after admin approval
    });

    await testProcessReport.save();

    await logActivity(req, req.user.id, 'test_process_report_created', 
      `Created test process report for batch ${batchId}`, {
        batchId,
        reportHash
      });

    res.status(201).json({
      success: true,
      message: 'Test process report submitted successfully and is pending admin approval',
      report: testProcessReport
    });
  } catch (error) {
    console.error('Upload test process report error:', error);
    await logActivity(req, req.user.id, 'test_process_report_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload authentication report
router.post('/reports/authentication', async (req, res) => {
  try {
    const {
      batchId,
      certificates,
      complianceChecks,
      auditTrail
    } = req.body;

    // Validate required fields
    if (!batchId || !certificates) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if test process report exists
    const testProcessReport = await TestProcess.findOne({ batchId });
    if (!testProcessReport) {
      return res.status(400).json({
        success: false,
        message: 'Test process report must be uploaded first'
      });
    }

    // Check if authentication already exists
    const existingAuthentication = await Authentication.findOne({ batchId });
    if (existingAuthentication) {
      return res.status(409).json({
        success: false,
        message: 'Authentication report already exists for this batch'
      });
    }

    // Handle text fields (accept both JSON and plain text)
    const parsedCertificates = certificates || '';
    const parsedComplianceChecks = complianceChecks || '';
    const parsedAuditTrail = auditTrail || '';

    // No file processing - form-only submission

    // Create report data object
    const reportData = {
      batchId,
      certificates: parsedCertificates,
      complianceChecks: parsedComplianceChecks,
      auditTrail: parsedAuditTrail
    };

    // Generate report hash
    const reportHash = generateFileHash(JSON.stringify(reportData));

    // Create authentication report with pending status
    // IPFS upload and blockchain recording will happen after admin approval
    const authenticationReport = new Authentication({
      ...reportData,
      merchantWallet: req.user.walletAddress,
      reportHash,
      status: 'pending'
      // ipfsHash will be set after admin approval
    });

    await authenticationReport.save();

    await logActivity(req, req.user.id, 'authentication_report_created', 
      `Created authentication report for batch ${batchId}`, {
        batchId,
        reportHash
      });

    res.status(201).json({
      success: true,
      message: 'Authentication report submitted successfully and is pending admin approval',
      report: authenticationReport
    });
  } catch (error) {
    console.error('Upload authentication report error:', error);
    await logActivity(req, req.user.id, 'authentication_report_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get merchant's batches
router.get('/batches', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { merchantWallet: req.user.walletAddress };
    if (search) {
      query.batchId = { $regex: search, $options: 'i' };
    }

    // Get ingredients reports (which contain the main batch info)
    const batches = await Ingredients.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('batchId productName manufacturer manufacturingDate expiryDate createdAt blockchainTxHash');

    const total = await Ingredients.countDocuments(query);

    // Get completion status for each batch
    const batchesWithStatus = await Promise.all(
      batches.map(async (batch) => {
        const [testProcess, authentication] = await Promise.all([
          TestProcess.findOne({ batchId: batch.batchId }).select('_id'),
          Authentication.findOne({ batchId: batch.batchId }).select('_id')
        ]);

        return {
          ...batch.toObject(),
          completionStatus: {
            ingredients: true,
            testProcess: !!testProcess,
            authentication: !!authentication,
            onBlockchain: !!batch.blockchainTxHash
          }
        };
      })
    );

    await logActivity(req, req.user.id, 'merchant_view_batches', 'Merchant viewed their batches');

    res.json({
      success: true,
      batches: batchesWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get merchant batches error:', error);
    await logActivity(req, req.user.id, 'merchant_view_batches_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific batch details
router.get('/batches/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // Get all reports for the batch
    const [ingredientsReport, testProcessReport, authenticationReport] = await Promise.all([
      Ingredients.findOne({ batchId, merchantWallet: req.user.walletAddress }),
      TestProcess.findOne({ batchId, merchantWallet: req.user.walletAddress }),
      Authentication.findOne({ batchId, merchantWallet: req.user.walletAddress })
    ]);

    if (!ingredientsReport) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    await logActivity(req, req.user.id, 'merchant_view_batch_details', 
      `Merchant viewed batch ${batchId} details`);

    res.json({
      success: true,
      batch: {
        batchId,
        ingredients: ingredientsReport,
        testProcess: testProcessReport,
        authentication: authenticationReport,
        completionStatus: {
          ingredients: true,
          testProcess: !!testProcessReport,
          authentication: !!authenticationReport,
          onBlockchain: !!ingredientsReport.blockchainTxHash
        }
      }
    });
  } catch (error) {
    console.error('Get batch details error:', error);
    await logActivity(req, req.user.id, 'merchant_view_batch_details_error', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
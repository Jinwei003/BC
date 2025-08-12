import multer from 'multer';
import crypto from 'crypto';
import { PinataSDK } from 'pinata';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Generate SHA-256 hash for file content
export const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Upload file to IPFS via Pinata
export const uploadToIPFS = async (fileBuffer, filename, metadata = {}) => {
  try {
    // Create File object from buffer
    const file = new File([fileBuffer], filename, { type: 'application/octet-stream' });
    
    // Upload to Pinata using the v2 API
    const result = await pinata.upload.file(file).addMetadata({
      name: filename,
      ...metadata
    });

    return {
      success: true,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

// Upload JSON data to IPFS
export const uploadJSONToIPFS = async (jsonData, filename) => {
  try {
    const result = await pinata.upload.json(jsonData).addMetadata({
      name: filename
    });

    return {
      success: true,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`IPFS JSON upload failed: ${error.message}`);
  }
};

// Process uploaded files with hashing and IPFS upload
export const processUploadedFiles = async (files, batchId, merchantWallet) => {
  const processedFiles = [];
  const errors = [];

  for (const file of files) {
    try {
      // Generate SHA-256 hash
      const fileHash = generateFileHash(file.buffer);
      
      // Create unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${batchId}_${timestamp}_${file.originalname}`;
      
      // Upload to IPFS
      const ipfsResult = await uploadToIPFS(file.buffer, uniqueFilename, {
        batchId,
        merchantWallet,
        originalName: file.originalname,
        fileHash,
        uploadedAt: new Date().toISOString()
      });

      processedFiles.push({
        filename: uniqueFilename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileHash,
        ipfsHash: ipfsResult.ipfsHash,
        uploadedAt: new Date()
      });
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  return {
    processedFiles,
    errors,
    success: errors.length === 0
  };
};

// Process uploaded files for pending reports (no IPFS upload)
export const processUploadedFilesForPending = async (files, batchId, merchantWallet) => {
  const processedFiles = [];
  const errors = [];

  for (const file of files) {
    try {
      // Generate SHA-256 hash
      const fileHash = generateFileHash(file.buffer);
      
      // Create unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${batchId}_${timestamp}_${file.originalname}`;
      
      // Save file locally as backup (no IPFS upload)
      const uploadDir = path.join(__dirname, '../uploads', batchId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filepath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filepath, file.buffer);

      processedFiles.push({
        filename: uniqueFilename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileHash,
        filepath,
        uploadedAt: new Date()
        // Note: No ipfsHash - will be added after admin approval
      });
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  return {
    processedFiles,
    errors,
    success: errors.length === 0
  };
};

// Save files locally (backup)
export const saveFilesLocally = async (files, batchId) => {
  const uploadDir = path.join(__dirname, '../uploads', batchId);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const savedFiles = [];

  for (const file of files) {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, file.buffer);
      
      savedFiles.push({
        filename,
        originalName: file.originalname,
        filepath,
        size: file.size,
        savedAt: new Date()
      });
    } catch (error) {
      console.error(`Error saving file ${file.originalname}:`, error);
    }
  }

  return savedFiles;
};

// Verify file integrity
export const verifyFileIntegrity = (fileBuffer, expectedHash) => {
  const actualHash = generateFileHash(fileBuffer);
  return actualHash === expectedHash;
};

// Get file from IPFS
export const getFileFromIPFS = async (ipfsHash) => {
  try {
    const response = await fetch(`${process.env.PINATA_GATEWAY}/ipfs/${ipfsHash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error retrieving file from IPFS:', error);
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
};

// Delete file from IPFS (unpin)
export const deleteFromIPFS = async (ipfsHash) => {
  try {
    await pinata.unpin(ipfsHash);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from IPFS:', error);
    throw new Error(`IPFS deletion failed: ${error.message}`);
  }
};

// Validate file upload request
export const validateFileUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  // Check file count
  if (req.files.length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 10 files allowed per upload'
    });
  }

  // Check total size
  const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 50 * 1024 * 1024; // 50MB total
  
  if (totalSize > maxTotalSize) {
    return res.status(400).json({
      success: false,
      message: 'Total file size exceeds 50MB limit'
    });
  }

  next();
};
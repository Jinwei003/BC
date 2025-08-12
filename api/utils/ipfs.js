import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';

// Pinata configuration
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const PINATA_API_URL = 'https://api.pinata.cloud';

if (!PINATA_JWT) {
  throw new Error('PINATA_JWT environment variable is required');
}

/**
 * Generate SHA-256 hash of data
 * @param {Object} data - The data to hash
 * @returns {string} - The SHA-256 hash
 */
export const generateSHA256Hash = (data) => {
  const jsonData = JSON.stringify(data, null, 2);
  return crypto.createHash('sha256').update(jsonData).digest('hex');
};

/**
 * Upload data to IPFS via Pinata
 * @param {Object} data - The data to upload to IPFS
 * @param {string} name - Optional name for the file
 * @returns {Promise<{hash: string, cid: string}>} - The SHA-256 hash and IPFS CID
 */
export const uploadToIPFS = async (data, name = 'report') => {
  try {
    // Generate SHA-256 hash
    const hash = generateSHA256Hash(data);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create form data for Pinata
    const formData = new FormData();
    formData.append('file', Buffer.from(jsonData), {
      filename: `${name}-${Date.now()}.json`,
      contentType: 'application/json'
    });
    
    // Add metadata
    const metadata = JSON.stringify({
      name: `${name}-${Date.now()}`,
      keyvalues: {
        sha256: hash,
        type: 'report',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Upload to Pinata
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        }
      }
    );
    
    const cid = response.data.IpfsHash;
    console.log('Data uploaded to Pinata IPFS:', {
      hash,
      cid,
      name: response.data.PinSize
    });
    
    return { hash, cid };
  } catch (error) {
    console.error('Error uploading to Pinata IPFS:', error.response?.data || error.message);
    throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
  }
};

/**
 * Retrieve data from IPFS via Pinata Gateway
 * @param {string} cid - The IPFS CID
 * @returns {Promise<Object>} - The retrieved data
 */
export const getFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${cid}`, {
      timeout: 30000 // 30 second timeout
    });
    
    if (typeof response.data === 'string') {
      return JSON.parse(response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error.message);
    throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
  }
};

/**
 * Verify if a file exists on IPFS
 * @param {string} cid - The IPFS CID
 * @returns {Promise<boolean>} - Whether the file exists
 */
export const verifyIPFSFile = async (cid) => {
  try {
    const response = await axios.head(`${PINATA_GATEWAY}/ipfs/${cid}`, {
      timeout: 10000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export { generateSHA256Hash as default };
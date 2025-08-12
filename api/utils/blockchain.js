import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Smart contract ABI (Application Binary Interface)
const PROTEIN_VERIFICATION_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ingredientsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "testProcessHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "authenticationHash",
        "type": "string"
      }
    ],
    "name": "BatchCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "MerchantAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "MerchantRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "authorizeMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ingredientsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "testProcessHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "authenticationHash",
        "type": "string"
      }
    ],
    "name": "createBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      }
    ],
    "name": "getBatch",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "merchant",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "ingredientsHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "testProcessHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "authenticationHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct ProteinVerification.BatchData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "isMerchantAuthorized",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "revokeMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "transferAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "reportId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "sha256Hash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsCid",
        "type": "string"
      }
    ],
    "name": "storeReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "reportId",
        "type": "string"
      }
    ],
    "name": "getReport",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "sha256Hash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct ProteinVerification.ReportData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "reportId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "sha256Hash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsCid",
        "type": "string"
      }
    ],
    "name": "ReportStored",
    "type": "event"
  }
];

// Initialize provider and contract
let provider;
let contract;
let adminWallet;

try {
  // Connect to Ethereum network
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
  
  // Initialize contract
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    PROTEIN_VERIFICATION_ABI,
    provider
  );

  // Initialize admin wallet for transactions
  if (process.env.ADMIN_PRIVATE_KEY) {
    adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  }
} catch (error) {
  console.error('Error initializing blockchain connection:', error);
}

// Get contract instance with signer
const getContractWithSigner = (privateKey = null) => {
  try {
    const wallet = privateKey 
      ? new ethers.Wallet(privateKey, provider)
      : adminWallet;
    
    if (!wallet) {
      throw new Error('No wallet available for signing transactions');
    }

    return contract.connect(wallet);
  } catch (error) {
    console.error('Error getting contract with signer:', error);
    throw error;
  }
};

// Authorize merchant on blockchain
export const authorizeMerchantOnChain = async (merchantAddress) => {
  try {
    const contractWithSigner = getContractWithSigner();
    const tx = await contractWithSigner.authorizeMerchant(merchantAddress);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error authorizing merchant on chain:', error);
    throw new Error(`Blockchain authorization failed: ${error.message}`);
  }
};

// Revoke merchant on blockchain
export const revokeMerchantOnChain = async (merchantAddress) => {
  try {
    const contractWithSigner = getContractWithSigner();
    const tx = await contractWithSigner.revokeMerchant(merchantAddress);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error revoking merchant on chain:', error);
    throw new Error(`Blockchain revocation failed: ${error.message}`);
  }
};

// Check if merchant is authorized on blockchain
export const isMerchantAuthorizedOnChain = async (merchantAddress) => {
  try {
    const isAuthorized = await contract.isMerchantAuthorized(merchantAddress);
    return isAuthorized;
  } catch (error) {
    console.error('Error checking merchant authorization:', error);
    throw new Error(`Blockchain authorization check failed: ${error.message}`);
  }
};

// Create batch on blockchain
export const createBatchOnChain = async (batchId, ingredientsHash, testProcessHash, authenticationHash, merchantPrivateKey = null) => {
  try {
    const contractWithSigner = getContractWithSigner(merchantPrivateKey);
    const tx = await contractWithSigner.createBatch(
      batchId,
      ingredientsHash,
      testProcessHash,
      authenticationHash
    );
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error creating batch on chain:', error);
    throw new Error(`Blockchain batch creation failed: ${error.message}`);
  }
};

// Get batch data from blockchain
export const getBatchFromChain = async (batchId) => {
  try {
    const batchData = await contract.getBatch(batchId);
    
    if (!batchData.exists) {
      return null;
    }
    
    return {
      merchant: batchData.merchant,
      ingredientsHash: batchData.ingredientsHash,
      testProcessHash: batchData.testProcessHash,
      authenticationHash: batchData.authenticationHash,
      timestamp: new Date(Number(batchData.timestamp) * 1000),
      exists: batchData.exists
    };
  } catch (error) {
    console.error('Error getting batch from chain:', error);
    throw new Error(`Blockchain batch retrieval failed: ${error.message}`);
  }
};

// Store report hash and IPFS CID on blockchain
export const storeReportOnChain = async (reportId, sha256Hash, ipfsCid) => {
  try {
    const contractWithSigner = getContractWithSigner();
    const tx = await contractWithSigner.storeReport(reportId, sha256Hash, ipfsCid);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      reportId,
      sha256Hash,
      ipfsCid
    };
  } catch (error) {
    console.error('Error storing report on chain:', error);
    throw new Error(`Blockchain report storage failed: ${error.message}`);
  }
};

// Get report data from blockchain
export const getReportFromChain = async (reportId) => {
  try {
    const reportData = await contract.getReport(reportId);
    
    if (!reportData.exists) {
      return null;
    }
    
    return {
      sha256Hash: reportData.sha256Hash,
      ipfsCid: reportData.ipfsCid,
      timestamp: new Date(Number(reportData.timestamp) * 1000),
      exists: reportData.exists
    };
  } catch (error) {
    console.error('Error getting report from chain:', error);
    throw new Error(`Blockchain report retrieval failed: ${error.message}`);
   }
 };

// Verify batch integrity
export const verifyBatchIntegrity = async (batchId, expectedHashes) => {
  try {
    const chainData = await getBatchFromChain(batchId);
    
    if (!chainData) {
      return {
        valid: false,
        reason: 'Batch not found on blockchain'
      };
    }

    const hashesMatch = {
      ingredients: chainData.ingredientsHash === expectedHashes.ingredientsHash,
      testProcess: chainData.testProcessHash === expectedHashes.testProcessHash,
      authentication: chainData.authenticationHash === expectedHashes.authenticationHash
    };

    const allHashesMatch = Object.values(hashesMatch).every(match => match);

    return {
      valid: allHashesMatch,
      chainData,
      hashesMatch,
      reason: allHashesMatch ? 'All hashes match' : 'Hash mismatch detected'
    };
  } catch (error) {
    console.error('Error verifying batch integrity:', error);
    return {
      valid: false,
      reason: `Verification failed: ${error.message}`
    };
  }
};

// Get transaction details
export const getTransactionDetails = async (transactionHash) => {
  try {
    const tx = await provider.getTransaction(transactionHash);
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    return {
      transaction: tx,
      receipt: receipt,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      confirmations: await tx.confirmations()
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw new Error(`Transaction details retrieval failed: ${error.message}`);
  }
};

// Get current gas price
export const getCurrentGasPrice = async () => {
  try {
    const gasPrice = await provider.getFeeData();
    return {
      gasPrice: gasPrice.gasPrice?.toString(),
      maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
    };
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw new Error(`Gas price retrieval failed: ${error.message}`);
  }
};

// Estimate gas for transaction
export const estimateGas = async (functionName, params) => {
  try {
    let gasEstimate;
    
    switch (functionName) {
      case 'authorizeMerchant':
        gasEstimate = await contract.authorizeMerchant.estimateGas(params[0]);
        break;
      case 'revokeMerchant':
        gasEstimate = await contract.revokeMerchant.estimateGas(params[0]);
        break;
      case 'createBatch':
        gasEstimate = await contract.createBatch.estimateGas(...params);
        break;
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
    
    return gasEstimate.toString();
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error(`Gas estimation failed: ${error.message}`);
  }
};

// Check network connection
export const checkNetworkConnection = async () => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    return {
      connected: true,
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      },
      blockNumber,
      contractAddress: process.env.CONTRACT_ADDRESS
    };
  } catch (error) {
    console.error('Error checking network connection:', error);
    return {
      connected: false,
      error: error.message
    };
  }
};

export { contract, provider, adminWallet };
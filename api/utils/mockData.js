// Mock data for development when database is not available

const mockMerchants = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Merchant',
    organization: 'Test Organization',
    email: 'test@merchant.com',
    walletAddress: '0x71be63f3384f5fb98995898a86b02fb2426c5788',
    status: 'active',
    registrationDate: new Date('2024-01-01'),
    isVerified: true,
    businessLicense: 'BL123456',
    contactPhone: '+1234567890',
    businessAddress: {
      street: '123 Business St',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'USA'
    },
    certifications: ['ISO9001', 'HACCP'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Demo Merchant',
    organization: 'Demo Corp',
    email: 'demo@merchant.com',
    walletAddress: '0x742d35cc6634c0532925a3b8d0c0fc8c2c4c8c8c',
    status: 'active',
    registrationDate: new Date('2024-01-15'),
    isVerified: true,
    businessLicense: 'BL789012',
    contactPhone: '+1987654321',
    businessAddress: {
      street: '456 Demo Ave',
      city: 'Demo City',
      state: 'DC',
      zipCode: '54321',
      country: 'USA'
    },
    certifications: ['ISO14001', 'GMP'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

const mockBatches = [
  {
    _id: '507f1f77bcf86cd799439021',
    batchId: 'BATCH001',
    merchantWallet: '0x71be63f3384f5fb98995898a86b02fb2426c5788',
    productName: 'Premium Whey Protein',
    productType: 'Whey Protein Isolate',
    manufacturingDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-01-01'),
    quantity: 1000,
    unit: 'kg',
    status: 'verified',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock database operations
export const mockDatabase = {
  // Merchant operations
  findMerchantByWallet: async (walletAddress) => {
    const merchant = mockMerchants.find(m => 
      m.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    return merchant || null;
  },
  
  createMerchant: async (merchantData) => {
    const newMerchant = {
      _id: Date.now().toString(),
      ...merchantData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockMerchants.push(newMerchant);
    return newMerchant;
  },
  
  updateMerchant: async (walletAddress, updateData) => {
    const index = mockMerchants.findIndex(m => 
      m.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    if (index !== -1) {
      mockMerchants[index] = { ...mockMerchants[index], ...updateData, updatedAt: new Date() };
      return mockMerchants[index];
    }
    return null;
  },
  
  getAllMerchants: async () => {
    return mockMerchants;
  },
  
  // Batch operations
  findBatchById: async (batchId) => {
    const batch = mockBatches.find(b => b.batchId === batchId);
    return batch || null;
  },
  
  createBatch: async (batchData) => {
    const newBatch = {
      _id: Date.now().toString(),
      ...batchData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockBatches.push(newBatch);
    return newBatch;
  },
  
  // Generic operations
  isConnected: () => global.mockDatabase === true,
  
  // Mock save method for objects
  save: async (obj) => {
    obj.updatedAt = new Date();
    return obj;
  }
};

export default mockDatabase;
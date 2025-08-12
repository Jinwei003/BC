import axios from 'axios';
import crypto from 'crypto';

const API_BASE = 'http://localhost:3004/api';

// Sample data based on technical documentation
const sampleData = {
  merchant: {
    name: 'Premium Protein Co.',
    organization: 'Premium Protein Co.',
    email: 'contact@premiumprotein.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    businessLicense: 'BL-2024-001'
  },
  
  batchData: {
    batchId: 'PROT-20241201-A',
    productName: 'Premium Whey Protein Isolate',
    productDescription: 'High-quality whey protein isolate with natural flavoring',
    ingredients: [
      { name: 'Whey Protein Isolate', percentage: 85, source: 'New Zealand Dairy' },
      { name: 'Natural Vanilla Flavor', percentage: 10, source: 'Madagascar' },
      { name: 'Lecithin', percentage: 3, source: 'Sunflower' },
      { name: 'Stevia Extract', percentage: 2, source: 'Organic Farms' }
    ],
    nutritionalInfo: {
      protein: '25g per 30g serving',
      carbohydrates: '1g per 30g serving',
      fat: '0.5g per 30g serving',
      calories: '110 per 30g serving'
    },
    manufacturingDate: '2024-12-01',
    expiryDate: '2026-12-01',
    certifications: ['ISO 22000', 'HACCP', 'GMP']
  }
};

async function createSampleData() {
  try {
    console.log('Creating sample data via API calls...');
    
    // First, register the merchant
    console.log('1. Registering sample merchant...');
    try {
      const registrationData = {
        ...sampleData.merchant,
        signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        message: 'Register merchant account'
      };
      const merchantResponse = await axios.post(`${API_BASE}/auth/merchant/register`, registrationData);
      console.log('✓ Sample merchant registered successfully');
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.message?.includes('already exists')) {
        console.log('✓ Sample merchant already exists');
      } else {
        console.log('⚠ Merchant registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Create a mock file buffer for uploads
    const mockFileBuffer = Buffer.from('Sample file content for testing');
    const mockFileHash = crypto.createHash('sha256').update(mockFileBuffer).digest('hex');
    
    // Login as the merchant to get authentication token
    console.log('2. Logging in as merchant...');
    let authToken = null;
    try {
      const loginData = {
        walletAddress: sampleData.merchant.walletAddress,
        signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        message: 'Login to merchant account'
      };
      const loginResponse = await axios.post(`${API_BASE}/auth/merchant/login`, loginData);
      authToken = loginResponse.data.token;
      console.log('✓ Merchant logged in successfully');
    } catch (error) {
      console.log('⚠ Merchant login failed:', error.response?.data?.message || error.message);
      console.log('Note: This is expected since we need real MetaMask signatures for authentication.');
      console.log('The merchant registration should still work for database population.');
      return;
    }

    // Create sample batch data through merchant API
    console.log('3. Creating sample batch data...');
    try {
      // Check if batch already exists
      try {
        const existingBatch = await axios.get(`${API_BASE}/verification/batch/${sampleData.batchData.batchId}`);
        console.log('✓ Sample batch data already exists');
      } catch (error) {
        if (error.response?.status === 404) {
          // Create ingredients report
          const ingredientsData = {
            batchId: sampleData.batchData.batchId,
            productName: sampleData.batchData.productName,
            productDescription: sampleData.batchData.productDescription,
            ingredients: sampleData.batchData.ingredients,
            nutritionalInfo: sampleData.batchData.nutritionalInfo,
            manufacturingDate: sampleData.batchData.manufacturingDate,
            expiryDate: sampleData.batchData.expiryDate,
            certifications: sampleData.batchData.certifications
          };
          
          const ingredientsResponse = await axios.post(
            `${API_BASE}/merchant/ingredients-report`,
            ingredientsData,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          
          console.log('✓ Sample batch data created successfully');
        } else {
          console.log('⚠ Error checking batch:', error.response?.data?.message || error.message);
        }
      }
    } catch (error) {
      console.log('⚠ Batch creation failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n=== SAMPLE DATA SETUP COMPLETE ===');
    console.log('You can now test the system with:');
    console.log('Batch ID: PROT-20241201-A');
    console.log('Merchant Wallet: 0x742d35Cc6634C0532925a3b8D4C9db96590c6C87');
    console.log('\nNote: The system is now using real MongoDB database.');
    console.log('You can test the system with the registered merchant and batch data.');
    console.log('The verification should work with real database entries.');
    console.log('======================================\n');
    
  } catch (error) {
    console.error('Error creating sample data:', error.message);
  }
}

// Run the script
createSampleData().catch(console.error);
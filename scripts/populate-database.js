import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../api/models/Merchant.js';
import Ingredients from '../api/models/Ingredients.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleMerchant = {
  name: 'Premium Protein Co.',
  organization: 'Premium Protein Co.',
  email: 'contact@premiumprotein.com',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  businessLicense: 'BL-2024-001',
  status: 'approved'
};

const sampleIngredients = {
  batchId: 'PROT-20241201-A',
  productName: 'Premium Whey Protein Isolate',
  manufacturer: 'Premium Protein Co.',
  ingredients: [
    { name: 'Whey Protein Isolate', percentage: 85, source: 'New Zealand Dairy' },
    { name: 'Natural Vanilla Flavor', percentage: 10, source: 'Madagascar' },
    { name: 'Lecithin', percentage: 3, source: 'Sunflower' },
    { name: 'Stevia Extract', percentage: 2, source: 'Organic Farms' }
  ],
  nutritionalInfo: {
    protein: 25,
    carbohydrates: 1,
    fats: 0.5,
    calories: 110,
    fiber: 0,
    sugar: 0
  },
  manufacturingDate: new Date('2024-12-01'),
  expiryDate: new Date('2026-12-01'),
  allergens: ['Milk'],
  certifications: [
    { name: 'ISO 22000', issuedBy: 'ISO Certification Body', validUntil: new Date('2025-12-01') },
    { name: 'HACCP', issuedBy: 'Food Safety Authority', validUntil: new Date('2025-12-01') },
    { name: 'GMP', issuedBy: 'Manufacturing Standards Board', validUntil: new Date('2025-12-01') }
  ],
  evidenceFiles: [],
  reportHash: 'sample-hash-123',
  ipfsHash: 'QmSampleHash123'
};

async function populateDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ 
      walletAddress: sampleMerchant.walletAddress.toLowerCase() 
    });
    
    let merchant;
    if (existingMerchant) {
      console.log('✓ Sample merchant already exists');
      merchant = existingMerchant;
    } else {
      // Create merchant
      merchant = new Merchant({
        ...sampleMerchant,
        walletAddress: sampleMerchant.walletAddress.toLowerCase()
      });
      await merchant.save();
      console.log('✓ Sample merchant created');
    }

    // Check if ingredients report already exists
    const existingIngredients = await Ingredients.findOne({ batchId: sampleIngredients.batchId });
    
    if (existingIngredients) {
      console.log('✓ Sample ingredients report already exists');
    } else {
      // Create ingredients report
      const ingredients = new Ingredients({
        ...sampleIngredients,
        merchantWallet: merchant.walletAddress
      });
      await ingredients.save();
      console.log('✓ Sample ingredients report created');
    }

    console.log('\n=== DATABASE POPULATION COMPLETE ===');
    console.log('Sample data created:');
    console.log('Merchant:', sampleMerchant.name);
    console.log('Wallet:', sampleMerchant.walletAddress);
    console.log('Batch ID:', sampleIngredients.batchId);
    console.log('Status: Ready for testing');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateDatabase().catch(console.error);
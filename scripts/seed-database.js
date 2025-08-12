import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../api/models/Merchant.js';
import Ingredients from '../api/models/Ingredients.js';
import Complaint from '../api/models/Complaint.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleMerchant = {
  name: 'Premium Protein Co.',
  organization: 'Premium Protein Co.',
  email: 'contact@premiumprotein.com',
  walletAddress: '0x742d35cc6634c0532925a3b8d4c9db96590c6c87',
  status: 'approved',
  businessLicense: 'BL-2024-001'
};

const sampleIngredients = {
  batchId: 'PROT-20241201-A',
  merchantWallet: '0x742d35cc6634c0532925a3b8d4c9db96590c6c87',
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
    { name: 'GMP', issuedBy: 'Good Manufacturing Practice Board', validUntil: new Date('2025-12-01') }
  ],
  evidenceFiles: [],
  reportHash: '0x1234567890abcdef1234567890abcdef12345678',
  ipfsHash: 'QmSampleHashForTesting123456789'
};

const sampleComplaint = {
  complaintId: 'COMP-20241201-001',
  batchId: 'PROT-20241201-A',
  complainant: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, State 12345'
  },
  complaintType: 'QUALITY',
  severity: 'MEDIUM',
  description: 'Product taste seems different from usual batch',
  symptoms: ['Unusual taste', 'Texture inconsistency'],
  purchaseDetails: {
    purchaseDate: new Date('2024-11-15'),
    retailer: 'Health Store Plus',
    lotNumber: 'LOT-2024-1201',
    expiryDate: new Date('2026-12-01')
  },
  evidenceFiles: [],
  status: 'SUBMITTED',
  priority: 'NORMAL'
};

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing sample data...');
    await Merchant.deleteOne({ email: sampleMerchant.email });
    await Ingredients.deleteOne({ batchId: sampleIngredients.batchId });
    await Complaint.deleteOne({ complaintId: sampleComplaint.complaintId });
    console.log('✓ Cleared existing data');

    // Create merchant
    console.log('Creating sample merchant...');
    const merchant = new Merchant(sampleMerchant);
    await merchant.save();
    console.log('✓ Sample merchant created:', merchant.name);

    // Create ingredients report
    console.log('Creating sample ingredients report...');
    const ingredients = new Ingredients(sampleIngredients);
    await ingredients.save();
    console.log('✓ Sample ingredients report created:', ingredients.batchId);

    // Create complaint
    console.log('Creating sample complaint...');
    const complaint = new Complaint(sampleComplaint);
    await complaint.save();
    console.log('✓ Sample complaint created:', complaint.complaintId);

    console.log('\n=== DATABASE SEEDING COMPLETE ===');
    console.log('Sample data created:');
    console.log('- Merchant:', sampleMerchant.name);
    console.log('- Wallet Address:', sampleMerchant.walletAddress);
    console.log('- Batch ID:', sampleIngredients.batchId);
    console.log('- Complaint ID:', sampleComplaint.complaintId);
    console.log('\nYou can now test:');
    console.log('1. Batch verification with ID: PROT-20241201-A');
    console.log('2. Admin panel to see merchants and complaints');
    console.log('3. MetaMask login with wallet: 0x742d35cc6634c0532925a3b8d4c9db96590c6c87');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
seedDatabase().catch(console.error);
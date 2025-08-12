import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../api/models/Merchant.js';

// Load environment variables
dotenv.config();

async function migrateMerchantFields() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Find all merchants that are missing the new fields
    const merchantsToUpdate = await Merchant.find({
      $or: [
        { phone: { $exists: false } },
        { address: { $exists: false } },
        { description: { $exists: false } }
      ]
    });

    console.log(`Found ${merchantsToUpdate.length} merchants that need field updates`);

    if (merchantsToUpdate.length === 0) {
      console.log('✓ All merchants already have the required fields');
      return;
    }

    // Update each merchant with default values
    let updatedCount = 0;
    for (const merchant of merchantsToUpdate) {
      const updateData = {};
      
      // Add missing fields with appropriate default values
      if (!merchant.phone) {
        updateData.phone = '';
      }
      if (!merchant.address) {
        updateData.address = '';
      }
      if (!merchant.description) {
        updateData.description = '';
      }

      // Update the merchant
      await Merchant.findByIdAndUpdate(merchant._id, updateData);
      updatedCount++;
      
      console.log(`✓ Updated merchant: ${merchant.name} (${merchant.email})`);
    }

    console.log(`\n=== MIGRATION COMPLETE ===`);
    console.log(`Total merchants updated: ${updatedCount}`);
    console.log(`Fields added: phone, address, description`);
    console.log(`Default values: empty strings`);
    console.log(`===========================\n`);

    // Update the sample merchant with realistic data
    const sampleMerchant = await Merchant.findOne({ 
      email: 'contact@premiumprotein.com' 
    });
    
    if (sampleMerchant) {
      await Merchant.findByIdAndUpdate(sampleMerchant._id, {
        phone: '+1-555-0123',
        address: '123 Protein Manufacturing Blvd, Industrial District, New York, NY 10001',
        description: 'Premium protein supplement manufacturer specializing in high-quality whey protein isolates and nutritional products. Committed to providing safe, tested, and certified protein supplements for health-conscious consumers.'
      });
      console.log('✓ Updated sample merchant with realistic data');
    }

    // Check for any merchants from Nutriplex (the one showing in the dashboard)
    const nutriplexMerchant = await Merchant.findOne({ 
      organization: { $regex: /nutriplex/i } 
    });
    
    if (nutriplexMerchant) {
      await Merchant.findByIdAndUpdate(nutriplexMerchant._id, {
        phone: '+60-3-1234-5678',
        address: 'Nutriplex Solutions Sdn Bhd, Level 15, Menara ABC, Jalan Ampang, 50450 Kuala Lumpur, Malaysia',
        description: 'Leading Malaysian nutrition solutions provider specializing in protein verification and quality assurance services for the Southeast Asian market.'
      });
      console.log('✓ Updated Nutriplex merchant with realistic data');
    }

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateMerchantFields().catch(console.error);
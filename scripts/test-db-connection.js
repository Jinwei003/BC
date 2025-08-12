import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../api/models/Merchant.js';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection Status...');
  console.log('=' .repeat(50));
  
  try {
    // Check if MongoDB URI is configured
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found in environment variables');
      console.log('📝 System will use mock database mode');
      return;
    }
    
    console.log('✅ MongoDB URI found in environment');
    console.log('🔗 Connection string:', mongoUri.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Attempt to connect
    console.log('\n🔌 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔗 Ready State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Test database operations
    console.log('\n📋 Testing database operations...');
    
    // Count merchants
    const merchantCount = await Merchant.countDocuments();
    console.log(`👥 Total merchants in database: ${merchantCount}`);
    
    // Get recent merchants
    const recentMerchants = await Merchant.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name organization email status createdAt');
    
    if (recentMerchants.length > 0) {
      console.log('\n📝 Recent merchants:');
      recentMerchants.forEach((merchant, index) => {
        console.log(`  ${index + 1}. ${merchant.name} (${merchant.organization}) - ${merchant.status}`);
        console.log(`     Email: ${merchant.email}`);
        console.log(`     Created: ${merchant.createdAt}`);
      });
    } else {
      console.log('\n📝 No merchants found in database');
    }
    
    // Check if mock database flag is set
    if (global.mockDatabase) {
      console.log('\n⚠️  WARNING: Global mock database flag is set to true');
      console.log('   This means the application might still be using mock data');
    } else {
      console.log('\n✅ Mock database flag is not set - using real database');
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Database connection failed!');
    console.log('🔍 Error details:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting suggestions:');
      console.log('   1. Check if MongoDB Atlas cluster is running');
      console.log('   2. Verify network access settings in MongoDB Atlas');
      console.log('   3. Check if your IP address is whitelisted');
      console.log('   4. Verify the connection string is correct');
    }
    
    console.log('\n📝 System will fall back to mock database mode');
    global.mockDatabase = true;
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
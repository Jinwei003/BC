import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas Connection...');
  console.log('Connection String:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
  
  try {
    console.log('\n⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('🔌 Ready State:', conn.connection.readyState);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    } else {
      console.log('   No collections found (empty database)');
    }
    
    // Test write operation
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = { test: true, timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('✅ Write test successful');
    
    // Test read operation
    const readDoc = await testCollection.findOne({ test: true });
    console.log('✅ Read test successful');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleanup successful');
    
    await mongoose.connection.close();
    console.log('\n🎉 Connection test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run seed');
    console.log('   2. Restart your server');
    console.log('   3. Check admin panel for real data');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 DNS Resolution Issue Detected');
      console.log('Possible solutions:');
      console.log('1. Check if MongoDB Atlas cluster is running');
      console.log('2. Verify the cluster URL is correct');
      console.log('3. Try using a standard connection string instead of SRV');
      console.log('4. Check your internet connection');
      console.log('5. Try connecting from MongoDB Compass with the same URL');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication Issue Detected');
      console.log('Possible solutions:');
      console.log('1. Verify username and password are correct');
      console.log('2. Check database user permissions in MongoDB Atlas');
      console.log('3. Ensure the user has access to the specified database');
    } else if (error.message.includes('network')) {
      console.log('\n🌐 Network Access Issue Detected');
      console.log('Possible solutions:');
      console.log('1. Check Network Access settings in MongoDB Atlas');
      console.log('2. Add your current IP address to the whitelist');
      console.log('3. Temporarily allow access from anywhere (0.0.0.0/0)');
    }
    
    console.log('\n📖 For detailed troubleshooting, see: DATABASE_SETUP.md');
    process.exit(1);
  }
};

testConnection();
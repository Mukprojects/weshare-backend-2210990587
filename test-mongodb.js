const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    
    // Insert a test document
    const result = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'MongoDB is working!' 
    });
    
    console.log('✅ Test document inserted with ID:', result.insertedId);
    
    // Read the test document
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Test document retrieved:', doc);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('\n🎉 MongoDB is working perfectly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB service is running');
      console.log('2. Check if MongoDB is installed');
      console.log('3. Verify the connection string in .env file');
      console.log('4. Try: net start MongoDB (as administrator)');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
}

testMongoConnection();
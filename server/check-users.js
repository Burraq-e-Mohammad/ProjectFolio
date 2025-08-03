const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI environment variable is not set');
      console.error('Please check your .env file');
      return;
    }

    // Connect to MongoDB using the same connection string as the server
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('-password');
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Check specifically for admin users
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    console.log(`\n👑 Admin users: ${adminUsers.length}`);
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nDatabase connection closed');
    }
  }
};

// Run the check
checkUsers(); 
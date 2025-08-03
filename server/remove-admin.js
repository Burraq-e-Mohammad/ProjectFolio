const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const removeAdmin = async () => {
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

    // Find and remove admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('Found admin user:', adminUser.email);
      await User.findByIdAndDelete(adminUser._id);
      console.log('✅ Admin user removed successfully!');
    } else {
      console.log('No admin user found in database');
    }

  } catch (error) {
    console.error('Error removing admin:', error);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
};

// Run the removal
removeAdmin(); 
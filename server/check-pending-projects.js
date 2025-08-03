const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projectfolio')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Project = require('./models/Project');
const User = require('./models/User');

async function checkPendingProjects() {
  try {
    console.log('=== Checking Pending Projects ===');
    
    // Get all projects
    const allProjects = await Project.find().populate('seller', 'name email');
    console.log(`Total projects in database: ${allProjects.length}`);
    
    // Get projects by status
    const pendingProjects = await Project.find({ status: 'pending' }).populate('seller', 'name email');
    const availableProjects = await Project.find({ status: 'available' }).populate('seller', 'name email');
    const rejectedProjects = await Project.find({ status: 'rejected' }).populate('seller', 'name email');
    
    console.log(`\nProjects by status:`);
    console.log(`- Pending: ${pendingProjects.length}`);
    console.log(`- Available: ${availableProjects.length}`);
    console.log(`- Rejected: ${rejectedProjects.length}`);
    
    if (pendingProjects.length > 0) {
      console.log('\n=== Pending Projects Details ===');
      pendingProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title}`);
        console.log(`   - ID: ${project._id}`);
        console.log(`   - Seller: ${project.seller?.name || 'Unknown'} (${project.seller?.email || 'No email'})`);
        console.log(`   - Category: ${project.category}`);
        console.log(`   - Price: RS ${project.price}`);
        console.log(`   - Status: ${project.status}`);
        console.log(`   - Created: ${project.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\nNo pending projects found. All projects have been reviewed.');
    }
    
    // Check if there are any projects that might need approval
    if (allProjects.length === 0) {
      console.log('\nNo projects found in database. You may need to create some test projects.');
    }
    
  } catch (error) {
    console.error('Error checking pending projects:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkPendingProjects(); 
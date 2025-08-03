require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

async function checkProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all projects
    const projects = await Project.find({}).populate('seller', 'firstName lastName email');
    
    console.log(`\n=== PROJECTS IN DATABASE (${projects.length} total) ===`);
    
    if (projects.length === 0) {
      console.log('No projects found in database');
      return;
    }

    // Group by status
    const statusCounts = {};
    projects.forEach(project => {
      const status = project.status || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\nStatus breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} projects`);
    });

    console.log('\nDetailed project list:');
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.title}`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Price: RS ${project.price}`);
      console.log(`   Seller: ${project.seller?.firstName} ${project.seller?.lastName} (${project.seller?.email})`);
      console.log(`   Created: ${project.createdAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkProjects(); 
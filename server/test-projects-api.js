const mongoose = require('mongoose');
require('dotenv').config();

const testAPI = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectfolio';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Import Project model
    const Project = require('./models/Project');

    // Check total projects
    const totalProjects = await Project.countDocuments();
    console.log('Total projects in database:', totalProjects);

    // Check available projects
    const availableProjects = await Project.countDocuments({ status: { $in: ['available', 'pending'] } });
    console.log('Available/pending projects:', availableProjects);

    // Get sample projects
    const projects = await Project.find({ status: { $in: ['available', 'pending'] } }).limit(3);
    console.log('Sample projects:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} - Status: ${project.status} - Category: ${project.category}`);
    });

    // Test the filter that the API uses
    const filter = { status: { $in: ['available', 'pending'] } };
    const filteredProjects = await Project.find(filter);
    console.log('Projects matching API filter:', filteredProjects.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

testAPI(); 
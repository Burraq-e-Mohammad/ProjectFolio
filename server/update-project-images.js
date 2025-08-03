const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

// Default images for each category
const defaultImages = {
  'Web Application': [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
  ],
  'Mobile App': [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
  ],
  'Desktop Software': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
  ],
  'AI/ML': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1673187736167-4d9c0ac262df?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1673187736167-4d9c0ac262df?w=400&h=300&fit=crop'
  ],
  'Business Software': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  ],
  'Analytics': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  ],
  'Finance': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
  ],
  'E-commerce': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  ],
  'Game Development': [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
  ],
  'DevOps Tools': [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
  ]
};

async function updateProjectImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to update`);

    let updatedCount = 0;
    for (const project of projects) {
      // Check if the project has the old default image or no images
      const hasOldDefaultImage = project.images && project.images.length > 0 && 
        (project.images[0].includes('via.placeholder.com') || 
         project.images[0].includes('placeholder-project') ||
         project.images[0] === 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop');

      if (hasOldDefaultImage || !project.images || project.images.length === 0) {
        // Get category-specific images
        const categoryImages = defaultImages[project.category] || defaultImages['Web Application'];
        const randomIndex = Math.floor(Math.random() * categoryImages.length);
        const newDefaultImage = categoryImages[randomIndex];

        // Update the project
        await Project.findByIdAndUpdate(project._id, {
          images: [newDefaultImage]
        });

        console.log(`Updated project "${project.title}" with new image: ${newDefaultImage}`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} projects`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating project images:', error);
    process.exit(1);
  }
}

updateProjectImages(); 
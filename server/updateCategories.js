const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for category update'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import Project model
const Project = require('./models/Project');

// Category mapping from old to new
const categoryMapping = {
  'Web': 'Web Development',
  'App': 'App Development',
  'Mobile Development': 'App Development',
  'UI/UX': 'UI/UX Design',
  'Graphic': 'Graphic Design',
  'Data': 'Data Science',
  'ML': 'Machine Learning',
  'AI': 'Machine Learning',
  'Game': 'Game Development'
};

async function updateCategories() {
  try {
    console.log('Starting category update...');
    
    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to update`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const oldCategory = project.category;
      const newCategory = categoryMapping[oldCategory];
      
      if (newCategory && newCategory !== oldCategory) {
        console.log(`Updating project "${project.title}" from "${oldCategory}" to "${newCategory}"`);
        project.category = newCategory;
        await project.save();
        updatedCount++;
      } else if (!newCategory) {
        console.log(`Project "${project.title}" has category "${oldCategory}" - no mapping found, keeping as is`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} projects`);
    
    // Show final category distribution
    const finalCategories = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Final category distribution:');
    finalCategories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} projects`);
    });
    
  } catch (error) {
    console.error('Error updating categories:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateCategories(); 
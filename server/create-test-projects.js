const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
require('dotenv').config();

const createTestData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectfolio';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('test123', saltRounds);
      
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'seller',
        isVerified: true,
        verificationStatus: 'verified'
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }

    // Check if test projects already exist
    const existingProjects = await Project.countDocuments({ seller: testUser._id });
    if (existingProjects > 0) {
      console.log(`Found ${existingProjects} existing test projects`);
      console.log('Skipping project creation');
      process.exit(0);
    }

    // Create test projects
    const testProjects = [
      {
        title: 'E-commerce Website',
        description: 'A modern e-commerce platform built with React and Node.js. Features include user authentication, product catalog, shopping cart, and payment integration.',
        category: 'Web Application',
        price: 2500,
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500'],
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Mobile Fitness App',
        description: 'Cross-platform fitness tracking app with workout plans, progress tracking, and social features. Built with React Native.',
        category: 'Mobile App',
        price: 1800,
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'AI Chatbot Assistant',
        description: 'Intelligent chatbot powered by machine learning for customer support. Integrates with popular messaging platforms.',
        category: 'AI/ML',
        price: 3200,
        images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500'],
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Dashboard Analytics Platform',
        description: 'Real-time analytics dashboard with interactive charts and data visualization. Supports multiple data sources.',
        category: 'Analytics',
        price: 2100,
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500'],
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'Game Development Engine',
        description: '2D game development engine with physics engine, sprite management, and cross-platform deployment.',
        category: 'Game Development',
        price: 2800,
        images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500'],
        seller: testUser._id,
        status: 'available'
      },
      {
        title: 'UI/UX Design System',
        description: 'Comprehensive design system with reusable components, style guide, and documentation for consistent user experience.',
        category: 'UI/UX Design',
        price: 1500,
        images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500'],
        seller: testUser._id,
        status: 'available'
      }
    ];

    // Insert test projects
    const createdProjects = await Project.insertMany(testProjects);
    console.log(`✅ Successfully created ${createdProjects.length} test projects`);

    // Display created projects
    console.log('\n📋 Created Projects:');
    createdProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} - $${project.price} (${project.category})`);
    });

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  }
};

createTestData(); 
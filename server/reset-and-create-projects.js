const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
require('dotenv').config();

// Sample project data with unique images for each
const sampleProjects = [
  {
    title: "E-Commerce Platform",
    description: "A modern e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.",
    category: "Web Application",
    price: 2500,
    tags: ["React", "Node.js", "MongoDB", "E-commerce", "Payment Gateway"],
    demoUrl: "https://demo-ecommerce.example.com",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Task Management App",
    description: "A comprehensive task management application with real-time collaboration, project tracking, and team management features. Built with React Native for cross-platform compatibility.",
    category: "Mobile App",
    price: 1800,
    tags: ["React Native", "Firebase", "Real-time", "Collaboration"],
    demoUrl: "https://demo-taskapp.example.com",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "AI Chatbot Assistant",
    description: "An intelligent chatbot powered by machine learning algorithms. Features natural language processing, sentiment analysis, and integration with multiple messaging platforms.",
    category: "AI/ML",
    price: 3200,
    tags: ["Python", "TensorFlow", "NLP", "Machine Learning", "API"],
    demoUrl: "https://demo-chatbot.example.com",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Financial Analytics Dashboard",
    description: "A comprehensive financial analytics platform with real-time data visualization, portfolio tracking, and investment recommendations. Includes advanced charting and reporting tools.",
    category: "Analytics",
    price: 2800,
    tags: ["React", "D3.js", "Python", "Financial APIs", "Data Visualization"],
    demoUrl: "https://demo-finance.example.com",
    images: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Game Development Engine",
    description: "A 2D game development engine with built-in physics, sprite management, and cross-platform deployment. Perfect for indie game developers and educational projects.",
    category: "Game Development",
    price: 1500,
    tags: ["C++", "OpenGL", "Game Engine", "Physics", "Cross-platform"],
    demoUrl: "https://demo-gameengine.example.com",
    images: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "DevOps Automation Platform",
    description: "A comprehensive DevOps platform with CI/CD pipelines, container orchestration, and infrastructure as code. Supports multiple cloud providers and deployment strategies.",
    category: "DevOps Tools",
    price: 2200,
    tags: ["Docker", "Kubernetes", "Jenkins", "Terraform", "AWS"],
    demoUrl: "https://demo-devops.example.com",
    images: [
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Desktop Accounting Software",
    description: "A professional accounting software for small to medium businesses. Features include invoicing, expense tracking, financial reporting, and tax preparation tools.",
    category: "Desktop Software",
    price: 1200,
    tags: ["Electron", "React", "SQLite", "Accounting", "Business"],
    demoUrl: "https://demo-accounting.example.com",
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Business Intelligence Platform",
    description: "A powerful BI platform with data warehousing, ETL processes, and interactive dashboards. Supports multiple data sources and provides advanced analytics capabilities.",
    category: "Business Software",
    price: 3500,
    tags: ["Python", "PostgreSQL", "Apache Airflow", "Tableau", "Data Warehouse"],
    demoUrl: "https://demo-bi.example.com",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Mobile Banking App",
    description: "A secure mobile banking application with biometric authentication, real-time transactions, and financial planning tools. Built with React Native and native security features.",
    category: "Mobile App",
    price: 4000,
    tags: ["React Native", "Biometric Auth", "Banking APIs", "Security", "Financial"],
    demoUrl: "https://demo-banking.example.com",
    images: [
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&q=80"
    ]
  },
  {
    title: "Social Media Analytics Tool",
    description: "A comprehensive social media analytics platform that tracks engagement, sentiment analysis, and campaign performance across multiple social networks.",
    category: "Analytics",
    price: 1900,
    tags: ["Python", "Social APIs", "Machine Learning", "Analytics", "Dashboard"],
    demoUrl: "https://demo-socialanalytics.example.com",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
    ]
  }
];

async function resetAndCreateProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all existing projects
    const deleteResult = await Project.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing projects`);

    // Find a user to assign as seller (assuming there's at least one user)
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using user ${user.email} as seller for all projects`);

    // Create new projects
    const createdProjects = [];
    for (const projectData of sampleProjects) {
      const project = new Project({
        ...projectData,
        seller: user._id,
        status: 'available'
      });
      
      const savedProject = await project.save();
      createdProjects.push(savedProject);
      console.log(`Created project: ${savedProject.title} - RS ${savedProject.price}`);
    }

    console.log(`\n✅ Successfully created ${createdProjects.length} new projects with unique images and correct data`);
    console.log('\nProject Summary:');
    createdProjects.forEach(project => {
      console.log(`- ${project.title}: RS ${project.price} (${project.category})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
resetAndCreateProjects(); 
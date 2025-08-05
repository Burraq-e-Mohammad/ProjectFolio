const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const { cloudinary } = require('../utils/cloudinary');
const { sendProjectApprovalNotification, sendProjectApprovedNotification } = require('../utils/emailService');

exports.createProject = async (req, res) => {
  try {
    const { title, description, category, price, tags, demoUrl, images } = req.body;
    
    // Check user verification status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Allow posting for verified users (email verified) or admin users
    if (!user.isVerified && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Email verification required to post ads. Please verify your email first.' 
      });
    }
    
    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Title, description, category, and price are required' });
    }
    
    // Validate price
    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }
    
    // Handle images - can be either uploaded files or image URLs
    let imagePaths = [];
    
    // Check if images are provided as URLs (from separate upload)
    if (images && Array.isArray(images)) {
      imagePaths = images;
    }
    // Check if images are uploaded files
    else if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed' });
      }
      
      // Upload images to Cloudinary with optimization
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'project_images',
            resource_type: 'auto',
            transformation: [
              { width: 800, height: 600, crop: 'fit', quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          return result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      });
      
      imagePaths = await Promise.all(uploadPromises);
    }
    
    // Add default image if no images provided
    if (imagePaths.length === 0) {
      // Use a category-specific default image with random variations
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
      
      const categoryImages = defaultImages[category] || defaultImages['Web Application'];
      const randomIndex = Math.floor(Math.random() * categoryImages.length);
      const defaultImage = categoryImages[randomIndex];
      imagePaths = [defaultImage];
    }
    
    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      tags: tags || [],
      demoUrl: demoUrl || '',
      images: imagePaths,
      seller: req.user.userId,
      status: 'pending' // Projects start as pending for admin approval
    });
    
    await project.save();
    
    // Populate seller info
    await project.populate('seller', 'firstName lastName email isVerified verificationStatus');
    
    // Send email notification to admin
    try {
      await sendProjectApprovalNotification(project, project.seller);
    } catch (emailError) {
      console.error('Failed to send project approval notification:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (err) {
    console.error('Project creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    let filter = { status: 'available' }; // Only show approved projects
    
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // Get total count for pagination
    const total = await Project.countDocuments(filter);
    
    // Get projects with pagination
    const projects = await Project.find(filter)
      .populate('seller', 'firstName lastName email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      data: {
        projects,
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('seller', 'firstName lastName email username');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is admin (allow admins to see all projects)
    const isAdmin = req.user && req.user.role === 'admin';
    
    // For non-admin users, only show approved projects
    if (!isAdmin && project.status !== 'available') {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Return in the format expected by frontend
    res.json({ data: project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ seller: req.user.userId }).populate('seller', 'firstName lastName email username');
    res.json({ data: projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    console.log('=== SERVER UPDATE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('Project ID:', req.params.id);
    console.log('User ID from token:', req.user.userId);
    
    const { title, description, category, price } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !price) {
      console.log('Missing required fields:', { title, description, category, price });
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missing: {
          title: !title,
          description: !description,
          category: !category,
          price: !price
        }
      });
    }
    
    console.log('Validating project ID format...');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid project ID format');
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    console.log('Finding project in database...');
    const project = await Project.findById(req.params.id);
    
    console.log('Found project:', project);
    
    if (!project) {
      console.log('Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }
    
    console.log('Project seller ID:', project.seller);
    console.log('Project seller ID type:', typeof project.seller);
    console.log('User ID type:', typeof req.user.userId);
    console.log('Comparison result:', project.seller.toString() !== req.user.userId);
    
    // Check if user owns this project
    if (project.seller.toString() !== req.user.userId) {
      console.log('Permission denied - user does not own this project');
      return res.status(403).json({ message: 'You can only edit your own projects' });
    }
    
    console.log('Permission granted - updating project');
    
    // Update project fields
    project.title = title;
    project.description = description;
    project.category = category;
    project.price = price;
    
    // Handle images update
    if (req.body.images && Array.isArray(req.body.images)) {
      project.images = req.body.images;
      console.log('Images updated:', req.body.images);
    } else if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'project_images',
            resource_type: 'auto',
            transformation: [
              { width: 800, height: 600, crop: 'fit', quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          return result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      });
      
      project.images = await Promise.all(uploadPromises);
      console.log('New images uploaded:', project.images);
    }
    
    // Add default image if no images provided
    if (!project.images || project.images.length === 0) {
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
      
      const categoryImages = defaultImages[category] || defaultImages['Web Application'];
      const randomIndex = Math.floor(Math.random() * categoryImages.length);
      const defaultImage = categoryImages[randomIndex];
      project.images = [defaultImage];
      console.log('Default image added:', defaultImage);
    }
    
    console.log('Saving updated project...');
    console.log('Updated project data:', {
      title: project.title,
      description: project.description,
      category: project.category,
      price: project.price,
      images: project.images
    });
    
    await project.save();
    console.log('Project updated successfully');
    
    // Populate seller info before sending response
    await project.populate('seller', 'firstName lastName email');
    res.json({ data: project });
  } catch (err) {
    console.error('=== SERVER UPDATE ERROR ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      console.error('Validation errors:', err.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    
    if (err.name === 'CastError') {
      console.error('Cast error:', err);
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    if (project.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all projects for admin (all statuses)
exports.getAllProjectsForAdmin = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const projects = await Project.find({})
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pending projects for admin approval
exports.getPendingProjects = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const projects = await Project.find({ status: 'pending' })
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve project (admin only)
exports.approveProject = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = 'available';
    await project.save();

    // Populate seller info for email notification
    await project.populate('seller', 'firstName lastName email');

    // Send email notification to seller
    try {
      await sendProjectApprovedNotification(project, project.seller);
    } catch (emailError) {
      console.error('Failed to send project approval notification to seller:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Project approved successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject project (admin only)
exports.rejectProject = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = 'rejected';
    await project.save();

    res.json({ message: 'Project rejected successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');

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
      
      // Upload images to Cloudinary
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'project_images',
            resource_type: 'auto'
          });
          return result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      });
      
      imagePaths = await Promise.all(uploadPromises);
    }
    
    // Make images optional for now
    // if (imagePaths.length === 0) {
    //   return res.status(400).json({ message: 'At least one image is required' });
    // }
    
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
    console.log('=== GET PROJECTS DEBUG ===');
    console.log('Query parameters:', req.query);
    console.log('Request headers:', req.headers);
    
    const { category, search, page = 1, limit = 12 } = req.query;
    let filter = { status: { $in: ['available', 'pending'] } }; // Show both approved and pending projects
    
    if (category) {
      filter.category = category;
      console.log('Filtering by category:', category);
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
      console.log('Filtering by search:', search);
    }
    
    console.log('Final filter:', filter);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    console.log('Pagination - skip:', skip, 'limit:', limitNum);
    
    // Get total count for pagination
    const total = await Project.countDocuments(filter);
    console.log('Total projects found:', total);
    
    // Get projects with pagination
    const projects = await Project.find(filter)
      .populate('seller', 'firstName lastName email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Projects returned:', projects.length);
    console.log('First project sample:', projects[0]);
    
    res.json({
      projects,
      total,
      page: parseInt(page),
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error('=== GET PROJECTS ERROR ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('seller', 'firstName lastName email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ seller: req.user.userId }).populate('seller', 'firstName lastName email');
    res.json(projects);
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
    
    // Update image if new one is uploaded
    if (req.file) {
      project.images = [req.file.path];
      console.log('New image uploaded:', req.file.path);
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
    res.json(project);
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

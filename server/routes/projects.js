const express = require('express');
const router = express.Router();
const { 
  createProject, getProjects, getProjectById, getMyProjects, updateProject, deleteProject, getAllProjectsForAdmin, getPendingProjects, approveProject, rejectProject, incrementProjectViews 
} = require('../controllers/projectController');
const { auth, optionalAuth } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projectfolio', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [
      { width: 800, height: 600, crop: 'fit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', getProjects);

// Protected routes (only logged-in users can post, edit, delete)
router.get('/my-projects', auth, getMyProjects);
router.post('/', auth, upload.array('images', 5), createProject);
router.put('/:id', auth, upload.array('images', 5), updateProject);
router.delete('/:id', auth, deleteProject);

// Admin routes for project approval
router.get('/admin', auth, getAllProjectsForAdmin);
router.get('/pending', auth, getPendingProjects);
router.put('/:id/approve', auth, approveProject);
router.put('/:id/reject', auth, rejectProject);

// Image upload endpoint
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Parameterized routes (must come after specific routes)
// Use optionalAuth so admins (or logged-in users) can be identified while allowing public access to available projects
router.get('/:id', optionalAuth, getProjectById);
router.post('/:id/views', incrementProjectViews);

module.exports = router;

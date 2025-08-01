const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, getMyProjects, getPendingProjects, approveProject, rejectProject } = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projectfolio', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
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
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Parameterized routes (must come after specific routes)
router.get('/:id', getProjectById);

module.exports = router;

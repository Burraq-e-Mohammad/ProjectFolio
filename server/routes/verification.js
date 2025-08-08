const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/authMiddleware');
const {
  submitVerification,
  uploadDocument,
  getUserVerification,
  reviewVerification,
  getPendingVerifications,
  getVerificationRequirements
} = require('../controllers/verificationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/verification/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
  }
});

function debugRouterUse(router, ...args) {
  return router.use(...args);
}

// Submit verification request
router.post('/submit', auth, submitVerification);

// Upload verification document
router.post('/upload-document', auth, upload.single('document'), uploadDocument);

// Get user's verification status
router.get('/user-verification', auth, getUserVerification);

// Get verification requirements
router.get('/requirements', getVerificationRequirements);

// Admin routes
// Review verification
router.put('/review/:verificationId', reviewVerification);

// Get pending verifications
router.get('/pending', getPendingVerifications);

// Test authentication middleware
router.get('/test-auth', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 
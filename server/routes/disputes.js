const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createDispute,
  uploadEvidence,
  addDisputeMessage,
  getDispute,
  getUserDisputes,
  assignDispute,
  resolveDispute,
  getAllDisputes
} = require('../controllers/disputeController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/disputes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and common file types
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('application/') ||
        file.mimetype.startsWith('text/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a valid file.'), false);
    }
  }
});

function debugRouterUse(router, ...args) {
  return router.use(...args);
}


// Create a new dispute
router.post('/create', createDispute);

// Upload dispute evidence
router.post('/:disputeId/evidence', upload.single('evidence'), uploadEvidence);

// Add message to dispute
router.post('/:disputeId/messages', addDisputeMessage);

// Get dispute details
router.get('/:disputeId', getDispute);

// Get user's disputes
router.get('/user/disputes', getUserDisputes);

// Admin routes
// Assign dispute
router.put('/:disputeId/assign', assignDispute);

// Resolve dispute
router.put('/:disputeId/resolve', resolveDispute);

// Get all disputes (admin only)
router.get('/admin/all', getAllDisputes);

module.exports = router; 
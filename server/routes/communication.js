const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  sendMessage,
  uploadAttachment,
  getConversation,
  getUserConversations,
  markAsRead,
  getUnreadCount
} = require('../controllers/communicationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
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

// Send a message
router.post('/send', sendMessage);

// Upload file attachment
router.post('/upload-attachment', upload.single('file'), uploadAttachment);

// Get conversation messages
router.get('/conversation/:projectId', getConversation);

// Get user's conversations
router.get('/conversations', getUserConversations);

// Mark messages as read
router.put('/mark-read/:projectId', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

module.exports = router; 
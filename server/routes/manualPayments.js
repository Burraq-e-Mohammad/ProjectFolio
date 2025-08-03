const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createManualPayment,
  uploadPaymentProof,
  verifyPayment,
  confirmDelivery,
  paySeller,
  getPaymentDetails,
  getUserPayments,
  getSellerPayments,
  getAdminPayments,
  createDispute,
  deletePayment,
  updatePaymentProof
} = require('../controllers/manualPaymentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create manual payment order
router.post('/create', authMiddleware, createManualPayment);

// Get user's payments (specific route - must come before parameterized routes)
router.get('/user/payments', authMiddleware, getUserPayments);

// Get seller's payment orders (specific route - must come before parameterized routes)
router.get('/seller/payments', authMiddleware, getSellerPayments);

// Get admin dashboard payments (Admin only) (specific route - must come before parameterized routes)
router.get('/admin/payments', authMiddleware, getAdminPayments);

// Upload payment proof
router.post('/:paymentId/upload-proof', authMiddleware, upload.single('screenshot'), uploadPaymentProof);

// Update payment proof
router.put('/:paymentId/update-proof', authMiddleware, upload.single('screenshot'), updatePaymentProof);

// Verify payment (Admin only)
router.post('/:paymentId/verify', authMiddleware, verifyPayment);

// Confirm delivery (Buyer only)
router.post('/:paymentId/confirm-delivery', authMiddleware, confirmDelivery);

// Pay seller (Admin only)
router.post('/:paymentId/pay-seller', authMiddleware, paySeller);

// Create dispute
router.post('/:paymentId/dispute', authMiddleware, createDispute);

// Delete payment order (Buyer only, pending payments only)
router.delete('/:paymentId', authMiddleware, deletePayment);

// Get payment details
router.get('/:paymentId', authMiddleware, getPaymentDetails);

module.exports = router; 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/register/google', authController.googleRegister);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

// Email verification routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.updatePassword);

// Create admin user (for initial setup)
router.post('/create-admin', authController.createAdmin);

// Admin routes
router.post('/admin/login', authController.adminLogin);
router.get('/admin/validate-token', auth, authController.validateAdminToken);
router.get('/admin/users', auth, authController.getAllUsers);

module.exports = router;
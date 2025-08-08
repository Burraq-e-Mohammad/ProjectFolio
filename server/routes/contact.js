const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
console.log('sendContactMessage:', contactController.sendContactMessage);
console.log('getAllContactMessages:', contactController.getAllContactMessages);
console.log('getContact:', contactController.getContact);
const { auth, adminOnly } = require('../middleware/authMiddleware');

router.post('/send', (req, res, next) => {
  console.log('POST /api/contact/send hit', req.body);
  next();
}, contactController.sendContactMessage);
router.get('/messages', auth, adminOnly, contactController.getAllContactMessages);
router.get('/contact', contactController.getContact);
router.patch('/reply/:messageId', auth, adminOnly, contactController.adminReplyToContactMessage);

module.exports = router; 
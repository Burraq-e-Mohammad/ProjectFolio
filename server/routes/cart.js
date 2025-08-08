const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart, updateQuantity, cleanupOrphanedItems } = require('../controllers/cartController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.post('/remove', auth, removeFromCart);
router.delete('/clear', auth, clearCart);
router.put('/quantity/:projectId', auth, updateQuantity);
router.post('/cleanup', auth, cleanupOrphanedItems); // Admin cleanup endpoint

module.exports = router;

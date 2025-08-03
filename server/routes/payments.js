const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createEscrowPayment,
  confirmPayment,
  releasePayment,
  getEscrowAccount,
  getUserEscrowAccounts,
  refundPayment
} = require('../controllers/paymentController');

function debugRouterUse(router, ...args) {
  return router.use(...args);
}


// Create escrow payment
router.post('/create-escrow', createEscrowPayment);

// Confirm payment
router.post('/confirm-payment', confirmPayment);

// Release payment to client
router.post('/release-payment', releasePayment);

// Get escrow account details
router.get('/escrow/:escrowAccountId', getEscrowAccount);

// Get user's escrow accounts
router.get('/escrow-accounts', getUserEscrowAccounts);

// Refund payment
router.post('/refund-payment', refundPayment);

module.exports = router; 
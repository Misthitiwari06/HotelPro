const express = require('express');
const router = express.Router();
const { getPaymentConfig, verifyUpiPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', getPaymentConfig);
router.post('/verify-upi', protect, verifyUpiPayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { submitPayment, getPendingPayments, verifyPayment, getMyPayments } = require('../controllers/paymentController');

// @route POST /api/payments/submit
// @desc Submit payment proof
router.post('/submit', auth, upload.single('screenshot'), submitPayment);

// @route GET /api/payments/my
// @desc Get user's payment history
router.get('/my', auth, getMyPayments);

// @route GET /api/payments/admin/all
// @desc Get all payments for admin review
router.get('/admin/all', auth, adminAuth, getPendingPayments);

// @route PUT /api/payments/admin/verify/:id
// @desc Approve or Reject payment
router.put('/admin/verify/:id', auth, adminAuth, verifyPayment);

module.exports = router;

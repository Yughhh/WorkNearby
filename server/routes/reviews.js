const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createReview, getUserReviews } = require('../controllers/reviewController');

// @route POST /api/reviews
router.post('/', auth, createReview);

// @route GET /api/reviews/user/:userId
router.get('/user/:userId', auth, getUserReviews);

module.exports = router;

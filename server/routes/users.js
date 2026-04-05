const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { updateProfile, getNearbyFreelancers } = require('../controllers/userController');

// @route PUT /api/users/profile
router.put('/profile', auth, updateProfile);

// @route GET /api/users/nearby
router.get('/nearby', auth, getNearbyFreelancers);

module.exports = router;

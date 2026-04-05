const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { getGrowthStats } = require('../controllers/eventController');

// @route GET /api/admin/stats
// @desc Get analytics and growth stats
router.get('/stats', auth, adminAuth, getGrowthStats);

module.exports = router;

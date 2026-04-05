const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createJob, getNearbyJobs, getClientJobs, markJobCompleted } = require('../controllers/jobController');

// @route POST /api/jobs
router.post('/', auth, createJob);

// @route GET /api/jobs/nearby
router.get('/nearby', auth, getNearbyJobs);

// @route GET /api/jobs/client
router.get('/client', auth, getClientJobs);

// @route PUT /api/jobs/:id/complete
router.put('/:id/complete', auth, markJobCompleted);

module.exports = router;

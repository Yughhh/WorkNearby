const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createApplication, getJobApplications, getUserApplications, updateApplicationStatus, getMyApplications } = require('../controllers/applicationController');

// @route POST /api/applications
router.post('/', auth, createApplication);

// @route GET /api/applications/my
router.get('/my', auth, getMyApplications);

// @route GET /api/applications/job/:jobId
router.get('/job/:jobId', auth, getJobApplications);

// @route GET /api/applications/user
router.get('/user', auth, getUserApplications);

// @route PUT /api/applications/:id
router.put('/:id', auth, updateApplicationStatus);

module.exports = router;

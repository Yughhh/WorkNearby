const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { logEvent } = require('../services/eventService');

// Apply to Job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, proposal } = req.body;
    const freelancerId = req.user.id;

    // Check if duplicate application
    const existing = await Application.findOne({ jobId, freelancerId });
    if (existing) return res.status(400).json({ message: 'Already applied for this job' });

    // CREDIT CHECK
    const user = await User.findById(freelancerId);
    if (!user || user.credits < 1) {
      return res.status(403).json({ message: 'Insufficient credits. Please top up to apply.' });
    }

    const application = new Application({
      jobId,
      freelancerId,
      proposal
    });

    await application.save();

    // Deduct Credit
    await User.findByIdAndUpdate(freelancerId, { $inc: { credits: -1 } });

    // Update job status to 'Applied' if it was 'Open'
    await Job.findByIdAndUpdate(jobId, { status: 'Applied' });

    // ANALYTICS
    logEvent('APPLICATION', freelancerId, { jobId, applicationId: application._id });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Job Applications (for Client)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId }).populate('freelancerId', 'name rating skills bio');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Applications (for Freelancer)
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user.id }).populate('jobId', 'title budget status locationName');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Application Status (Accept/Reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    await application.save();

    if (status === 'Accepted') {
      // Update Job status to 'InProgress' and set accepted freelancer
      await Job.findByIdAndUpdate(application.jobId, {
        status: 'InProgress',
        acceptedFreelancerId: application.freelancerId
      });
      
      // Reject other applications for this job
      await Application.updateMany(
        { jobId: application.jobId, _id: { $ne: id } },
        { status: 'Rejected' }
      );
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all applications for a freelancer
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user.id })
      .populate('jobId', 'title description budget category')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


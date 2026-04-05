const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');

// Create a Review
exports.createReview = async (req, res) => {
  try {
    const { jobId, toUserId, rating, comment } = req.body;
    const fromUserId = req.user.id;

    // 1. Verify job exists and is COMPLETED
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'Completed') {
      return res.status(400).json({ message: 'Reviews are only allowed for completed jobs.' });
    }

    // 2. Verify user is involved in the job
    const isInvolved = job.clientId.toString() === fromUserId || job.acceptedFreelancerId.toString() === fromUserId;
    if (!isInvolved) {
      return res.status(403).json({ message: 'You are not authorized to review this job.' });
    }

    // 3. Create Review
    const review = new Review({
      jobId,
      fromUserId,
      toUserId,
      rating,
      comment
    });

    await review.save();

    // 4. Update Target User's Average Rating
    const reviews = await Review.find({ toUserId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(toUserId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length,
      rating: Math.round(averageRating) // Simple integer rating for quick UI displays
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this job.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Reviews for a User
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ toUserId: userId })
      .populate('fromUserId', 'name role')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

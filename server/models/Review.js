const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

// Prevent duplicate reviews for the same job by the same user
ReviewSchema.index({ jobId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

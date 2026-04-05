const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
ApplicationSchema.index({ freelancerId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);

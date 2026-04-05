const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['SIGNUP', 'JOB_POST', 'APPLICATION', 'PAYMENT_INITIATED', 'PAYMENT_APPROVED'], 
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);

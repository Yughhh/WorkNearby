const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  category: { 
    type: String, 
    enum: [
      "Web Development",
      "App Development",
      "Graphic Design",
      "Video Editing",
      "Content Writing",
      "Digital Marketing",
      "Social Media Management",
      "Photography",
      "Tutoring",
      "Data Entry",
      "Electrician",
      "Plumber",
      "Home Cleaning",
      "AC Repair",
      "Other"
    ],
    required: true
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acceptedFreelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Open', 'Applied', 'InProgress', 'Completed'], 
    default: 'Open' 
  },
  
  // Location Fields (GeoJSON) for proximity search
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  locationName: String
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);

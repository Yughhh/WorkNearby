const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['freelancer', 'client'], required: true },
  skills: [String],
  bio: String,
  rating: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  pricing: { type: Number, default: 0 },
  portfolioImages: [String],
  
  // Location Fields (GeoJSON)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  locationName: String,
  isExactLocationVisible: { type: Boolean, default: false },
  credits: { type: Number, default: 5 }
}, { timestamps: true });

UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);

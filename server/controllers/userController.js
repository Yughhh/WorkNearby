const User = require('../models/User');

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { skills, bio, pricing } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { skills, bio, pricing } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Nearby Freelancers (for Client)
exports.getNearbyFreelancers = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const radiusInMeters = radius * 1000;

    const freelancers = await User.find({
      role: 'freelancer',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      }
    }).select('name skills rating bio location locationName');

    // Add distance calculation and privacy mask
    const maskedFreelancers = freelancers.map(fr => {
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        fr.location.coordinates[1], 
        fr.location.coordinates[0]
      );

      // Mask coordinates for privacy (add small random offset ~100m-200m)
      // 0.001 degree is approx 111 meters
      const offset = () => (Math.random() - 0.5) * 0.002; 
      
      return {
        _id: fr._id,
        name: fr.name,
        skills: fr.skills,
        rating: fr.rating,
        bio: fr.bio,
        locationName: fr.locationName,
        distance,
        location: {
          type: 'Point',
          coordinates: [
            fr.location.coordinates[0] + offset(),
            fr.location.coordinates[1] + offset()
          ]
        }
      };
    });

    res.json(maskedFreelancers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function for Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}


const Job = require('../models/Job');
const User = require('../models/User');
const { logEvent } = require('../services/eventService');

// Create Job
exports.createJob = async (req, res) => {
  try {
    const { title, description, budget, category } = req.body;
    const clientId = req.user.id;

    // Get client's location
    const client = await User.findById(clientId);
    if (!client) return res.status(404).json({ message: 'User not found' });

    const job = new Job({
      title,
      description,
      budget,
      category,
      clientId,
      location: client.location,
      locationName: client.locationName
    });

    await job.save();

    // ANALYTICS
    logEvent('JOB_POST', clientId, { budget, category, jobId: job._id });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Nearby Jobs
exports.getNearbyJobs = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const radiusInMeters = radius * 1000;

    const jobs = await Job.find({
      status: 'Open',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('clientId', 'name rating');

    // Add distance calculation and privacy mask for each job
    const jobsWithDistance = jobs.map(job => {
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        job.location.coordinates[1], 
        job.location.coordinates[0]
      );
      
      // Mask coordinates for privacy (add small random offset ~100m-200m)
      const offset = () => (Math.random() - 0.5) * 0.002;

      return {
        ...job._doc,
        distance, // In km
        location: {
          type: 'Point',
          coordinates: [
            job.location.coordinates[0] + offset(),
            job.location.coordinates[1] + offset()
          ]
        }
      };
    });

    res.json(jobsWithDistance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark Job as Completed (Client Side)
exports.markJobCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Verify authorized Client
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (job.status !== 'InProgress') {
      return res.status(400).json({ message: 'Only in-progress jobs can be completed.' });
    }

    job.status = 'Completed';
    await job.save();

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Client Jobs
exports.getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user.id }).sort('-createdAt');
    res.json(jobs);
  } catch (err) {
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

const Event = require('../models/Event');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getGrowthStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();
        
        const payments = await Payment.find({ status: 'Approved' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Basic Trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSignups = await Event.countDocuments({ 
            type: 'SIGNUP', 
            createdAt: { $gte: sevenDaysAgo } 
        });

        const recentJobs = await Event.countDocuments({ 
            type: 'JOB_POST', 
            createdAt: { $gte: sevenDaysAgo } 
        });

        res.json({
            summary: {
                totalUsers,
                totalJobs,
                totalApplications,
                totalRevenue
            },
            trends: {
                recentSignups,
                recentJobs
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

const Payment = require('../models/Payment');
const User = require('../models/User');
const { logEvent } = require('../services/eventService');

// User Submission
exports.submitPayment = async (req, res) => {
  try {
    const { amount, creditsRequested } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Screenshot is required' });

    const payment = new Payment({
      userId: req.user.id,
      amount,
      creditsRequested,
      screenshotUrl: req.file.path
    });

    await payment.save();

    // ANALYTICS
    logEvent('PAYMENT_INITIATED', req.user.id, { amount, creditsRequested, paymentId: payment._id });

    res.status(201).json({ message: 'Payment submitted for manual review.', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Review (List All)
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Action (Approve/Reject)
exports.verifyPayment = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Record not found' });

    if (payment.status !== 'Pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    payment.status = status;
    await payment.save();
    if (status === 'Approved') {
      await User.findByIdAndUpdate(payment.userId, {
        $inc: { credits: payment.creditsRequested }
      });

      // ANALYTICS
      logEvent('PAYMENT_APPROVED', payment.userId, { amount: payment.amount, creditsAdded: payment.creditsRequested, paymentId: payment._id });
    }

    res.json({ message: `Payment ${status.toLowerCase()} successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User Payment Status
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

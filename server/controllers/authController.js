const jwt = require('jsonwebtoken');
const { logEvent } = require('../services/eventService');

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, lat, lng, locationName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      locationName
    });

    await user.save();

    // Create Token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // ANALYTICS
    logEvent('SIGNUP', user._id, { role });

    res.status(201).json({ token, user: { id: user._id, name, email, role, locationName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, locationName: user.locationName } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

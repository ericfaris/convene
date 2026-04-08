const Event = require('../models/Event');

module.exports = async (req, res, next) => {
  try {
    const token = req.params.adminToken;
    const event = await Event.findOne({ adminToken: token });
    if (!event) return res.status(403).json({ error: 'Invalid admin token' });
    req.event = event;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

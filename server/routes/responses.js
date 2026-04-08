const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Response = require('../models/Response');

// POST /api/events/:participantToken/respond
router.post('/:participantToken/respond', async (req, res) => {
  try {
    const { familyName, availableDates, notes } = req.body;
    const { participantToken } = req.params;

    const event = await Event.findOne({ participantToken });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.status !== 'open') {
      return res.status(403).json({ error: 'Event is not accepting responses' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (today > event.deadline) {
      return res.status(403).json({ error: 'Submission deadline has passed' });
    }

    if (!event.families.includes(familyName)) {
      return res.status(400).json({ error: 'Family not found in this event' });
    }

    await Response.findOneAndUpdate(
      { eventId: event._id, familyName },
      { availableDates, notes, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

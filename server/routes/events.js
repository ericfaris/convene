const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/Event');
const Response = require('../models/Response');
const adminAuth = require('../middleware/adminAuth');
const { suggestWindows, guestBlocks, datesInWindow } = require('../lib/schedule');

function buildHeatmap(responses) {
  const heatmap = {};
  responses.forEach(r => {
    r.availableDates.forEach(date => {
      heatmap[date] = (heatmap[date] || 0) + 1;
    });
  });
  return heatmap;
}

// POST /api/events — create event
router.post('/', async (req, res) => {
  try {
    const { name, description, dateWindow, attendees, allowedDays = [] } = req.body;
    if (!datesInWindow(dateWindow?.start, dateWindow?.end).length) {
      return res.status(400).json({ error: 'The date window needs a start date on or before its end date.' });
    }
    if (!guestBlocks(dateWindow, allowedDays).length) {
      return res.status(400).json({ error: 'None of the chosen days of the week fall inside the date window.' });
    }
    const adminToken = crypto.randomBytes(24).toString('hex');
    const participantToken = crypto.randomBytes(16).toString('hex');

    await Event.create({
      name, description, dateWindow, attendees, allowedDays,
      adminToken, participantToken
    });

    const base = process.env.BASE_URL || 'http://localhost:3000';
    res.json({
      adminUrl: `${base}/admin/${adminToken}`,
      participantUrl: `${base}/e/${participantToken}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:participantToken — participant view
router.get('/:participantToken', async (req, res) => {
  try {
    const event = await Event.findOne({ participantToken: req.params.participantToken });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const responses = await Response.find({ eventId: event._id });
    const respondedAttendees = responses.map(r => r.attendeeName);
    const attendeeResponses = {};
    responses.forEach(r => { attendeeResponses[r.attendeeName] = { availableDates: r.availableDates, notes: r.notes }; });

    res.json({
      name: event.name,
      description: event.description,
      dateWindow: event.dateWindow,
      status: event.status,
      finalizedDates: event.status === 'finalized' ? event.finalizedDates : null,
      attendees: event.attendees,
      allowedDays: event.allowedDays,
      respondedAttendees,
      attendeeResponses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:participantToken/summary — public summary view
router.get('/:participantToken/summary', async (req, res) => {
  try {
    const event = await Event.findOne({ participantToken: req.params.participantToken });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const responses = await Response.find({ eventId: event._id });
    const heatmap = buildHeatmap(responses);
    const attendeeDates = {};
    responses.forEach(r => { attendeeDates[r.attendeeName] = r.availableDates; });

    res.json({
      name: event.name,
      status: event.status,
      dateWindow: event.dateWindow,
      finalizedDates: event.status === 'finalized' ? event.finalizedDates : null,
      allowedDays: event.allowedDays,
      totalAttendees: event.attendees.length,
      respondedCount: responses.length,
      heatmap,
      attendeeDates,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:participantToken/response/:attendeeName — fetch existing response
router.get('/:participantToken/response/:attendeeName', async (req, res) => {
  try {
    const event = await Event.findOne({ participantToken: req.params.participantToken });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const response = await Response.findOne({ eventId: event._id, attendeeName: req.params.attendeeName });
    if (!response) return res.json({ availableDates: [], notes: '' });

    res.json({ availableDates: response.availableDates, notes: response.notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:adminToken/admin — admin dashboard
router.get('/:adminToken/admin', adminAuth, async (req, res) => {
  try {
    const event = req.event;
    const responses = await Response.find({ eventId: event._id });
    const heatmap = buildHeatmap(responses);
    const suggestedWindows = suggestWindows(event.dateWindow, event.allowedDays, responses);

    res.json({
      event,
      responses,
      heatmap,
      suggestedWindows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:adminToken/attendees — add an attendee
router.post('/:adminToken/attendees', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const event = req.event;
    const trimmed = name.trim();
    if (event.attendees.includes(trimmed)) {
      return res.status(400).json({ error: 'Attendee already exists' });
    }
    event.attendees.push(trimmed);
    await event.save();
    res.json({ success: true, attendees: event.attendees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:adminToken/finalize — finalize event
router.patch('/:adminToken/finalize', adminAuth, async (req, res) => {
  try {
    const { start, end } = req.body;
    const event = req.event;
    event.finalizedDates = { start, end };
    event.status = 'finalized';
    await event.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:adminToken — delete event and its responses (admin only)
router.delete('/:adminToken', adminAuth, async (req, res) => {
  try {
    const event = req.event;
    await Response.deleteMany({ eventId: event._id });
    await event.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

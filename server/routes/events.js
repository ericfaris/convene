const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/Event');
const Response = require('../models/Response');
const adminAuth = require('../middleware/adminAuth');

function buildHeatmap(responses) {
  const heatmap = {};
  responses.forEach(r => {
    r.availableDates.forEach(date => {
      heatmap[date] = (heatmap[date] || 0) + 1;
    });
  });
  return heatmap;
}

function getSuggestedWindows(dateWindow, heatmap) {
  const windows = [];
  const endDate = new Date(dateWindow.end + 'T00:00:00');
  const current = new Date(dateWindow.start + 'T00:00:00');

  while (current <= endDate) {
    const day = current.getDay(); // 0=Sun, 5=Fri, 6=Sat

    // Fri–Sun window
    if (day === 5) {
      const d1 = toDateStr(current);
      const d2Date = addDays(current, 1);
      const d3Date = addDays(current, 2);
      if (d3Date <= endDate) {
        const d2 = toDateStr(d2Date);
        const d3 = toDateStr(d3Date);
        const score = (heatmap[d1] || 0) + (heatmap[d2] || 0) + (heatmap[d3] || 0);
        windows.push({ start: d1, end: d3, familyCount: score });
      }
    }

    // Sat–Mon window
    if (day === 6) {
      const d1 = toDateStr(current);
      const d2Date = addDays(current, 1);
      const d3Date = addDays(current, 2);
      if (d3Date <= endDate) {
        const d2 = toDateStr(d2Date);
        const d3 = toDateStr(d3Date);
        const score = (heatmap[d1] || 0) + (heatmap[d2] || 0) + (heatmap[d3] || 0);
        windows.push({ start: d1, end: d3, familyCount: score });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return windows.sort((a, b) => b.familyCount - a.familyCount).slice(0, 3);
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// POST /api/events — create event
router.post('/', async (req, res) => {
  try {
    const { name, description, dateWindow, deadline, families, allowedDays = [] } = req.body;
    const adminToken = crypto.randomBytes(24).toString('hex');
    const participantToken = crypto.randomBytes(16).toString('hex');

    const event = await Event.create({
      name, description, dateWindow, deadline, families, allowedDays,
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
    const respondedFamilies = responses.map(r => r.familyName);

    res.json({
      name: event.name,
      description: event.description,
      dateWindow: event.dateWindow,
      deadline: event.deadline,
      status: event.status,
      finalizedDates: event.status === 'finalized' ? event.finalizedDates : null,
      families: event.families,
      allowedDays: event.allowedDays,
      respondedFamilies
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:participantToken/summary — public summary
router.get('/:participantToken/summary', async (req, res) => {
  try {
    const event = await Event.findOne({ participantToken: req.params.participantToken });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const responses = await Response.find({ eventId: event._id });
    const heatmap = buildHeatmap(responses);

    res.json({
      name: event.name,
      deadline: event.deadline,
      dateWindow: event.dateWindow,
      allowedDays: event.allowedDays,
      totalFamilies: event.families.length,
      respondedCount: responses.length,
      heatmap,
      status: event.status,
      finalizedDates: event.status === 'finalized' ? event.finalizedDates : null
    });
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
    const suggestedWindows = getSuggestedWindows(event.dateWindow, heatmap);

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

module.exports = router;

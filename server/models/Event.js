const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  dateWindow: {
    start: { type: String, required: true },
    end:   { type: String, required: true }
  },
  deadline: { type: String, required: true },
  adminToken: { type: String, required: true, unique: true },
  participantToken: { type: String, required: true, unique: true },
  families: [{ type: String }],
  status: { type: String, enum: ['open', 'closed', 'finalized'], default: 'open' },
  finalizedDates: {
    start: { type: String, default: null },
    end:   { type: String, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);

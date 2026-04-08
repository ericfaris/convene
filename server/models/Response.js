const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  familyName: { type: String, required: true },
  availableDates: [{ type: String }],
  notes: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

responseSchema.index({ eventId: 1, familyName: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);

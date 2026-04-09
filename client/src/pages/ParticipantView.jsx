import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, submitResponse } from '../api/client.js';
import CalendarGrid from '../components/CalendarGrid.jsx';
import FamilyList from '../components/FamilyList.jsx';

function countGroups(selectedDates) {
  const sorted = [...selectedDates].sort();
  if (!sorted.length) return 0;
  let groups = 1;
  for (let i = 1; i < sorted.length; i++) {
    const d1 = new Date(sorted[i - 1] + 'T00:00:00');
    const d2 = new Date(sorted[i] + 'T00:00:00');
    if ((d2 - d1) / 86400000 !== 1) groups++;
  }
  return groups;
}

export default function ParticipantView() {
  const { token } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // screen: 'list' | 'dates' | 'confirm'
  const [screen, setScreen] = useState('list');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEvent(token)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function selectFamily(name) {
    const existing = event.familyResponses?.[name];
    setSelectedFamily(name);
    setSelectedDates(existing ? new Set(existing.availableDates) : new Set());
    setNotes(existing?.notes || '');
    setScreen('dates');
  }

  function toggleDate(date) {
    setSelectedDates(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  }

  function toggleGroup(dates) {
    setSelectedDates(prev => {
      const next = new Set(prev);
      const allSelected = dates.every(d => next.has(d));
      if (allSelected) {
        dates.forEach(d => next.delete(d));
      } else {
        dates.forEach(d => next.add(d));
      }
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitResponse(token, {
        familyName: selectedFamily,
        availableDates: [...selectedDates].sort(),
        notes
      });
      setEvent(ev => ({
        ...ev,
        respondedFamilies: [...(ev.respondedFamilies || []).filter(f => f !== selectedFamily), selectedFamily],
        familyResponses: { ...ev.familyResponses, [selectedFamily]: { availableDates: [...selectedDates].sort(), notes } }
      }));
      setScreen('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!event) return null;

  const isFinalized = event.status === 'finalized';
  const isClosed = event.status === 'closed' || isFinalized;

  // --- Event header (shown on all screens) ---
  const header = (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>{event.name}</h1>
        <span className={`tag tag-${event.status}`}>{event.status}</span>
      </div>
      {event.description && <p style={{ color: '#6b7280', margin: '0 0 4px' }}>{event.description}</p>}
      <div style={{ fontSize: '.85rem', color: '#6b7280' }}>
        📅 {event.dateWindow.start} → {event.dateWindow.end}
      </div>
    </div>
  );

  // --- Finalized banner ---
  if (isFinalized && event.finalizedDates?.start) {
    return (
      <div className="container">
        {header}
        <div className="banner">
          <strong>🎉 Dates finalized:</strong> {event.finalizedDates.start} → {event.finalizedDates.end}
        </div>
      </div>
    );
  }

  // --- Closed ---
  if (isClosed) {
    return (
      <div className="container">
        {header}
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <strong>⛔ Submissions closed.</strong>
        </div>
      </div>
    );
  }

  // --- Screen: list ---
  if (screen === 'list') {
    return (
      <div className="container">
        {header}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Who are you?</h2>
          <FamilyList
            families={event.families}
            respondedFamilies={event.respondedFamilies}
            selected=""
            onSelect={selectFamily}
            disabled={false}
          />
        </div>
      </div>
    );
  }

  // --- Screen: dates ---
  if (screen === 'dates') {
    return (
      <div className="container">
        {header}
        <div className="card">
          <button
            type="button"
            onClick={() => setScreen('list')}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '.9rem', marginBottom: 12, fontFamily: 'inherit' }}
          >
            ← Back
          </button>
          <h2 style={{ marginTop: 0 }}>
            {(event.respondedFamilies || []).includes(selectedFamily)
              ? `Update your availability, ${selectedFamily}.`
              : `Hi, ${selectedFamily}! Pick your available dates.`}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '.9rem', margin: '0 0 16px' }}>
            Select all the dates that work for you. <strong>{countGroups(selectedDates)} weekend{countGroups(selectedDates) !== 1 ? 's' : ''} selected.</strong>
          </p>
          <CalendarGrid
            dateWindow={event.dateWindow}
            selected={selectedDates}
            onToggle={toggleDate}
            onToggleGroup={toggleGroup}
            disabled={false}
            allowedDays={event.allowedDays || []}
          />
        </div>

        <div className="card">
          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              placeholder="e.g. Weekends only work best for us"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting || selectedDates.size === 0}
            onClick={handleSubmit}
            style={{ width: '100%', justifyContent: 'center', padding: 12 }}
          >
            {submitting ? 'Submitting…' : 'Submit Availability'}
          </button>
        </div>
      </div>
    );
  }

  // --- Screen: confirm ---
  return (
    <div className="container">
      {header}
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ marginTop: 0 }}>Thank you, {selectedFamily}!</h2>
        <p style={{ color: '#6b7280', marginBottom: 0 }}>
          Your availability has been saved. We'll let you know when dates are finalized.
        </p>
      </div>
    </div>
  );
}

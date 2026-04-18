import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="container"><p style={{ color: '#78716C', fontWeight: 600 }}>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!event) return null;

  const isFinalized = event.status === 'finalized';
  const isClosed = event.status === 'closed' || isFinalized;

  const header = (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{event.name}</h1>
        <span className={`tag tag-${event.status}`}>{event.status}</span>
      </div>
      {event.description && <p style={{ color: '#78716C', margin: '0 0 6px', fontWeight: 500 }}>{event.description}</p>}
      <div style={{ fontSize: '.85rem', color: '#A8A29E', fontWeight: 600 }}>
        📅 {event.dateWindow.start} → {event.dateWindow.end}
      </div>
    </div>
  );

  if (isFinalized && event.finalizedDates?.start) {
    return (
      <div className="container">
        {header}
        <div className="banner">
          🎉 Dates finalized: <strong>{event.finalizedDates.start} → {event.finalizedDates.end}</strong>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="container">
        {header}
        <div className="card" style={{ background: '#FEF9EE', border: '2px solid #FCD34D', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⏳</div>
          <strong style={{ fontSize: '1.1rem' }}>Submissions are closed.</strong>
          <p style={{ color: '#78716C', margin: '8px 0 0', fontWeight: 500 }}>Waiting on the organizer to finalize dates.</p>
        </div>
      </div>
    );
  }

  // Screen: list
  if (screen === 'list') {
    return (
      <div className="container">
        {header}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>Who are you? 👋</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/e/${token}/results`)}
            >
              📊 See Results
            </button>
          </div>
          <p style={{ color: '#78716C', fontWeight: 500, margin: '12px 0 16px', fontSize: '.95rem' }}>
            Tap your family's name to pick your available dates.
          </p>
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

  // Screen: dates
  if (screen === 'dates') {
    const isUpdating = (event.respondedFamilies || []).includes(selectedFamily);
    const groupCount = countGroups(selectedDates);
    return (
      <div className="container">
        {header}
        <div className="card">
          <button
            type="button"
            onClick={() => setScreen('list')}
            style={{
              background: 'none',
              border: 'none',
              color: '#F97316',
              cursor: 'pointer',
              padding: 0,
              fontSize: '.9rem',
              fontWeight: 700,
              marginBottom: 14,
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ← Back
          </button>
          <h2 style={{ marginTop: 0 }}>
            {isUpdating
              ? `Update your picks, ${selectedFamily}! ✏️`
              : `Hi, ${selectedFamily}! 👋 Pick your dates.`}
          </h2>
          <p style={{ color: '#78716C', fontSize: '.95rem', fontWeight: 500, margin: '0 0 18px' }}>
            Select all the weekends that work for you.{' '}
            <strong style={{ color: groupCount > 0 ? '#65A30D' : '#A8A29E' }}>
              {groupCount} weekend{groupCount !== 1 ? 's' : ''} selected.
            </strong>
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
            <label>Any notes? (optional)</label>
            <textarea
              placeholder="e.g. We can't do the last weekend in July…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting || selectedDates.size === 0}
            onClick={handleSubmit}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem' }}
          >
            {submitting ? 'Saving…' : isUpdating ? 'Update My Availability ✓' : 'Submit My Availability 🎉'}
          </button>
        </div>
      </div>
    );
  }

  // Screen: confirm
  return (
    <div className="container">
      {header}
      <div className="card" style={{ textAlign: 'center', padding: '48px 28px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 12, lineHeight: 1 }}>🎉</div>
        <h2 style={{ marginTop: 0, fontSize: '1.6rem' }}>Thanks, {selectedFamily}!</h2>
        <p style={{ color: '#78716C', fontWeight: 500, margin: '0', maxWidth: 320, marginInline: 'auto', lineHeight: 1.7 }}>
          Your availability has been saved. We'll let everyone know once dates are finalized.
        </p>
      </div>
    </div>
  );
}

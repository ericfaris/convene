import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, submitResponse } from '../api/client.js';
import CalendarGrid from '../components/CalendarGrid.jsx';
import FamilyList from '../components/FamilyList.jsx';

export default function ParticipantView() {
  const { token } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getEvent(token)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleDate(date) {
    setSelectedDates(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFamily) return;
    setSubmitting(true);
    try {
      await submitResponse(token, {
        familyName: selectedFamily,
        availableDates: [...selectedDates].sort(),
        notes
      });
      setSubmitted(true);
      setEvent(ev => ({
        ...ev,
        respondedFamilies: [...(ev.respondedFamilies || []).filter(f => f !== selectedFamily), selectedFamily]
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!event) return null;

  const today = new Date().toISOString().split('T')[0];
  const deadlinePassed = today > event.deadline;
  const isFinalized = event.status === 'finalized';
  const isClosed = event.status === 'closed' || deadlinePassed || isFinalized;

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0 }}>{event.name}</h1>
          <span className={`tag tag-${event.status}`}>{event.status}</span>
        </div>
        {event.description && <p style={{ color: '#6b7280', margin: '0 0 12px' }}>{event.description}</p>}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '.85rem', color: '#6b7280' }}>
          <span>📅 {event.dateWindow.start} → {event.dateWindow.end}</span>
          <span>⏰ Deadline: {event.deadline}</span>
        </div>
      </div>

      {isFinalized && event.finalizedDates?.start && (
        <div className="banner">
          <strong>🎉 Dates finalized:</strong> {event.finalizedDates.start} → {event.finalizedDates.end}
        </div>
      )}

      {isClosed && !isFinalized && (
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <strong>⛔ Submissions closed</strong> — the deadline has passed.
        </div>
      )}

      {submitted && (
        <div className="success">
          ✓ Response submitted for <strong>{selectedFamily}</strong>. You can submit again to update it.
        </div>
      )}

      {!isClosed && (
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Select Your Family</h2>
            <FamilyList
              families={event.families}
              respondedFamilies={event.respondedFamilies}
              selected={selectedFamily}
              onSelect={name => {
                setSelectedFamily(name);
                setSubmitted(false);
              }}
              disabled={false}
            />
          </div>

          {selectedFamily && (
            <>
              <div className="card">
                <h2>Mark Your Available Dates</h2>
                <p style={{ color: '#6b7280', fontSize: '.9rem', margin: '0 0 16px' }}>
                  Click dates to toggle. Green = available.
                  <strong> {selectedDates.size} dates selected.</strong>
                </p>
                <CalendarGrid
                  dateWindow={event.dateWindow}
                  selected={selectedDates}
                  onToggle={toggleDate}
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
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || selectedDates.size === 0}
                  style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                >
                  {submitting ? 'Submitting…' : 'Submit Availability'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {isClosed && (
        <div className="card">
          <h2>Families</h2>
          <FamilyList
            families={event.families}
            respondedFamilies={event.respondedFamilies}
            selected=""
            onSelect={() => {}}
            disabled
          />
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminDashboard, finalizeEvent, addAttendee } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import ResponseTable from '../components/ResponseTable.jsx';

export default function AdminDashboard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalDates, setFinalDates] = useState({ start: '', end: '' });
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState('');
  const [copied, setCopied] = useState(false);
  const [newAttendee, setNewAttendee] = useState('');
  const [addingAttendee, setAddingAttendee] = useState(false);
  const [attendeeError, setAttendeeError] = useState('');

  useEffect(() => {
    getAdminDashboard(token)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleFinalize(e) {
    e.preventDefault();
    setFinalizeError('');
    setFinalizing(true);
    try {
      await finalizeEvent(token, finalDates);
      const updated = await getAdminDashboard(token);
      setData(updated);
      setShowFinalize(false);
    } catch (err) {
      setFinalizeError(err.message);
    } finally {
      setFinalizing(false);
    }
  }

  async function handleAddAttendee(e) {
    e.preventDefault();
    if (!newAttendee.trim()) return;
    setAttendeeError('');
    setAddingAttendee(true);
    try {
      await addAttendee(token, newAttendee.trim());
      const updated = await getAdminDashboard(token);
      setData(updated);
      setNewAttendee('');
    } catch (err) {
      setAttendeeError(err.message);
    } finally {
      setAddingAttendee(false);
    }
  }

  function copyParticipantLink() {
    const base = window.location.origin;
    const url = `${base}/e/${data.event.participantToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="container"><p style={{ color: '#64748B', fontWeight: 600 }}>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!data) return null;

  const { event, responses, heatmap, suggestedWindows } = data;
  const respondedCount = responses.length;
  const totalAttendees = event.attendees.length;
  const pct = totalAttendees > 0 ? (respondedCount / totalAttendees) * 100 : 0;

  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{event.name}</h1>
          <span className={`tag tag-${event.status}`}>{event.status}</span>
        </div>
        {event.description && <p style={{ color: '#64748B', margin: '0 0 10px', fontWeight: 500 }}>{event.description}</p>}
        <div style={{ fontSize: '.85rem', color: '#94A3B8', fontWeight: 600, marginBottom: 16 }}>
          📅 {event.dateWindow.start} → {event.dateWindow.end}
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', fontWeight: 600 }}>
          <span style={{ color: '#64748B' }}>{respondedCount} of {totalAttendees} attendees responded</span>
          <span style={{ color: '#FF6B6B' }}>{Math.round(pct)}%</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 16 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={copyParticipantLink}>
            {copied ? '✓ Copied!' : '🔗 Copy Participant Link'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/e/${event.participantToken}/results`)}>
            📊 See Results
          </button>
          {event.status !== 'finalized' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowFinalize(f => !f)}>
              {showFinalize ? 'Cancel' : '✓ Finalize Dates'}
            </button>
          )}
        </div>
      </div>

      {/* Finalized banner */}
      {event.status === 'finalized' && event.finalizedDates?.start && (
        <div className="banner">
          🎉 Finalized: <strong>{event.finalizedDates.start} → {event.finalizedDates.end}</strong>
        </div>
      )}

      {/* Finalize form */}
      {showFinalize && (
        <div className="card" style={{ border: '2px solid #FF6B6B' }}>
          <h2>Set the Final Dates</h2>
          {finalizeError && <div className="error">{finalizeError}</div>}
          <form onSubmit={handleFinalize}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field">
                <label>Start Date</label>
                <input type="date" required value={finalDates.start} onChange={e => setFinalDates(d => ({ ...d, start: e.target.value }))} />
              </div>
              <div className="field">
                <label>End Date</label>
                <input type="date" required value={finalDates.end} onChange={e => setFinalDates(d => ({ ...d, end: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={finalizing}>
              {finalizing ? 'Saving…' : '🎉 Confirm Dates'}
            </button>
          </form>
        </div>
      )}

      {/* Suggested windows */}
      {suggestedWindows.length > 0 && (
        <div className="card">
          <h2>Top Suggested Weekends</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {suggestedWindows.map((w, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 180px',
                  border: '2px solid',
                  borderColor: i === 0 ? '#FFD1D1' : '#E2E8F0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  background: i === 0 ? '#FFF1F1' : '#FFFFFF',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4, color: i === 0 ? '#FA5252' : '#64748B' }}>
                  {i === 0 ? '⭐ Best pick' : `#${i + 1}`}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: 4 }}>{w.start} → {w.end}</div>
                <div style={{ fontSize: '.8rem', color: '#94A3B8', fontWeight: 500, marginBottom: 8 }}>{w.attendeeCount} attendees available</div>
                {event.status !== 'finalized' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setFinalDates({ start: w.start, end: w.end }); setShowFinalize(true); }}
                  >
                    Use this
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="card">
        <h2>Availability Heatmap</h2>
        <HeatmapCalendar
          dateWindow={event.dateWindow}
          heatmap={heatmap}
          finalizedDates={event.finalizedDates}
          allowedDays={event.allowedDays || []}
        />
      </div>

      {/* Response table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Responses</h2>
          <form onSubmit={handleAddAttendee} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add attendee…"
              value={newAttendee}
              onChange={e => setNewAttendee(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '.9rem', borderRadius: 8, border: '1.5px solid #E2E8F0', fontFamily: 'inherit' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={addingAttendee || !newAttendee.trim()}>
              {addingAttendee ? '…' : '+ Add'}
            </button>
          </form>
        </div>
        {attendeeError && <div className="error" style={{ marginBottom: 12 }}>{attendeeError}</div>}
        <ResponseTable attendees={event.attendees} responses={responses} />
      </div>
    </div>
  );
}

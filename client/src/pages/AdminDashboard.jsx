import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminDashboard, finalizeEvent } from '../api/client.js';
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

  function copyParticipantLink() {
    const base = window.location.origin;
    const url = `${base}/e/${data.event.participantToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="container"><p style={{ color: '#78716C', fontWeight: 600 }}>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!data) return null;

  const { event, responses, heatmap, suggestedWindows } = data;
  const respondedCount = responses.length;
  const totalFamilies = event.families.length;
  const pct = totalFamilies > 0 ? (respondedCount / totalFamilies) * 100 : 0;

  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{event.name}</h1>
          <span className={`tag tag-${event.status}`}>{event.status}</span>
        </div>
        {event.description && <p style={{ color: '#78716C', margin: '0 0 10px', fontWeight: 500 }}>{event.description}</p>}
        <div style={{ fontSize: '.85rem', color: '#A8A29E', fontWeight: 600, marginBottom: 16 }}>
          📅 {event.dateWindow.start} → {event.dateWindow.end}
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', fontWeight: 600 }}>
          <span style={{ color: '#78716C' }}>{respondedCount} of {totalFamilies} families responded</span>
          <span style={{ color: '#F97316' }}>{Math.round(pct)}%</span>
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
        <div className="card" style={{ border: '2px solid #F97316' }}>
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
                  borderColor: i === 0 ? '#FED7AA' : '#E8DDD4',
                  borderRadius: 12,
                  padding: '14px 16px',
                  background: i === 0 ? '#FFF7ED' : '#FFFBF5',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4, color: i === 0 ? '#EA580C' : '#78716C' }}>
                  {i === 0 ? '⭐ Best pick' : `#${i + 1}`}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: 4 }}>{w.start} → {w.end}</div>
                <div style={{ fontSize: '.8rem', color: '#A8A29E', fontWeight: 500, marginBottom: 8 }}>{w.familyCount} families available</div>
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
        <h2>Responses</h2>
        <ResponseTable families={event.families} responses={responses} />
      </div>
    </div>
  );
}

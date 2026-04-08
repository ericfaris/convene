import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminDashboard, finalizeEvent } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import ResponseTable from '../components/ResponseTable.jsx';

export default function AdminDashboard() {
  const { token } = useParams();
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

  function copySummaryLink() {
    const base = window.location.origin;
    const url = `${base}/s/${data.event.participantToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="container"><p>Loading…</p></div>;
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
          <h1 style={{ margin: 0 }}>{event.name}</h1>
          <span className={`tag tag-${event.status}`}>{event.status}</span>
        </div>
        {event.description && <p style={{ color: '#6b7280', margin: '0 0 12px' }}>{event.description}</p>}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '.85rem', color: '#6b7280', marginBottom: 16 }}>
          <span>📅 {event.dateWindow.start} → {event.dateWindow.end}</span>
          <span>⏰ Deadline: {event.deadline}</span>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
          <span>{respondedCount} of {totalFamilies} families responded</span>
          <span style={{ fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={copySummaryLink}>
            {copied ? '✓ Copied!' : '🔗 Copy Summary Link'}
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
          <strong>🎉 Finalized:</strong> {event.finalizedDates.start} → {event.finalizedDates.end}
        </div>
      )}

      {/* Finalize form */}
      {showFinalize && (
        <div className="card" style={{ border: '2px solid #2563eb' }}>
          <h2>Finalize Dates</h2>
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
              {finalizing ? 'Saving…' : 'Confirm Finalized Dates'}
            </button>
          </form>
        </div>
      )}

      {/* Suggested windows */}
      {suggestedWindows.length > 0 && (
        <div className="card">
          <h2>Suggested Weekends</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {suggestedWindows.map((w, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 180px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '12px 16px',
                  background: i === 0 ? '#eff6ff' : '#f9fafb',
                  borderColor: i === 0 ? '#93c5fd' : '#e5e7eb'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                  #{i + 1} {i === 0 && '⭐'}
                </div>
                <div style={{ fontSize: '.9rem', marginBottom: 4 }}>{w.start} → {w.end}</div>
                <div style={{ fontSize: '.8rem', color: '#6b7280' }}>Score: {w.familyCount}</div>
                {event.status !== 'finalized' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => { setFinalDates({ start: w.start, end: w.end }); setShowFinalize(true); }}
                  >
                    Use this window
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

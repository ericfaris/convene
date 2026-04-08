import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSummary } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';

export default function SummaryView() {
  const { token } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSummary(token)
      .then(setSummary)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!summary) return null;

  const pct = summary.totalFamilies > 0
    ? (summary.respondedCount / summary.totalFamilies) * 100
    : 0;

  // Build a minimal dateWindow from heatmap keys for the calendar
  const dates = Object.keys(summary.heatmap).sort();
  const hasHeatmap = dates.length > 0;

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0 }}>{summary.name}</h1>
          <span className={`tag tag-${summary.status}`}>{summary.status}</span>
        </div>
        <div style={{ fontSize: '.85rem', color: '#6b7280', marginBottom: 16 }}>
          ⏰ Deadline: {summary.deadline}
        </div>

        {summary.status === 'finalized' && summary.finalizedDates?.start && (
          <div className="banner" style={{ marginBottom: 16 }}>
            <strong>🎉 Dates finalized:</strong> {summary.finalizedDates.start} → {summary.finalizedDates.end}
          </div>
        )}

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
          <span>{summary.respondedCount} of {summary.totalFamilies} families responded</span>
          <span style={{ fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {hasHeatmap && (
        <div className="card">
          <h2>Availability Overview</h2>
          <p style={{ color: '#6b7280', fontSize: '.9rem', margin: '0 0 16px' }}>
            Showing dates where at least one family is available. Individual family details are not shown here.
          </p>
          <HeatmapCalendar
            dateWindow={{ start: dates[0], end: dates[dates.length - 1] }}
            heatmap={summary.heatmap}
            finalizedDates={summary.finalizedDates}
          />
        </div>
      )}

      {!hasHeatmap && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 24px' }}>
          No availability data yet. Check back after families respond.
        </div>
      )}
    </div>
  );
}

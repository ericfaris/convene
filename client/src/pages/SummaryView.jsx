import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSummary, getEvent } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';

function groupConsecutive(dates) {
  if (!dates.length) return [];
  const sorted = [...dates].sort();
  const groups = [];
  let cur = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const d1 = new Date(sorted[i - 1] + 'T00:00:00');
    const d2 = new Date(sorted[i] + 'T00:00:00');
    if ((d2 - d1) / 86400000 === 1) {
      cur.push(sorted[i]);
    } else {
      groups.push(cur);
      cur = [sorted[i]];
    }
  }
  groups.push(cur);
  return groups;
}

function groupLabel(dates) {
  const opts = { weekday: 'short', month: 'short', day: 'numeric' };
  const fmt = str => new Date(str + 'T00:00:00').toLocaleDateString('en-US', opts);
  if (dates.length === 1) return fmt(dates[0]);
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

export default function SummaryView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([getSummary(token), getEvent(token)])
      .then(([s, e]) => { setSummary(s); setEvent(e); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!summary || !event) return null;

  const pct = summary.totalFamilies > 0
    ? Math.round((summary.respondedCount / summary.totalFamilies) * 100)
    : 0;

  const dates = Object.keys(summary.heatmap).sort();
  const hasHeatmap = dates.length > 0;
  const isFinalized = summary.status === 'finalized';
  const isClosed = summary.status === 'closed';
  const canSubmit = !isFinalized && !isClosed;

  const respondedSet = new Set(event.respondedFamilies || []);

  function formatDate(str) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="container">

      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0 }}>{summary.name}</h1>
          <span className={`tag tag-${summary.status}`}>{summary.status}</span>
        </div>
        {event.description && (
          <p style={{ color: '#6b7280', margin: '0 0 12px' }}>{event.description}</p>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '.85rem', color: '#6b7280' }}>
          <span>📅 {formatDate(summary.dateWindow.start)} → {formatDate(summary.dateWindow.end)}</span>
        </div>
      </div>

      {/* Finalized banner */}
      {isFinalized && summary.finalizedDates?.start && (
        <div className="banner">
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
            🎉 Dates have been finalized!
          </div>
          <div style={{ fontSize: '1rem' }}>
            {formatDate(summary.finalizedDates.start)} → {formatDate(summary.finalizedDates.end)}
          </div>
        </div>
      )}

      {/* Closed banner */}
      {isClosed && !isFinalized && (
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <strong>⛔ Submissions closed.</strong> Waiting on the organizer to finalize dates.
        </div>
      )}

      {/* Submit / update button */}
      {canSubmit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/e/${token}`)}
          >
            Submit / Update My Availability
          </button>
        </div>
      )}

      {/* Response progress */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Responses</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', marginBottom: 6 }}>
          <span>{summary.respondedCount} of {summary.totalFamilies} families responded</span>
          <span style={{ fontWeight: 600 }}>{pct}%</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 16 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {event.families.map(name => {
            const responded = respondedSet.has(name);
            const dates = summary.familyDates?.[name] || [];
            const isOpen = expanded === name;
            return (
              <div key={name} style={{
                borderRadius: 8,
                background: responded ? '#f0fdf4' : '#f9fafb',
                border: `1px solid ${responded ? '#bbf7d0' : '#e5e7eb'}`,
                overflow: 'hidden',
              }}>
                <div
                  onClick={() => responded && setExpanded(isOpen ? null : name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    cursor: responded ? 'pointer' : 'default',
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: responded ? '#22c55e' : '#e5e7eb',
                    color: responded ? '#fff' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {responded ? '✓' : '–'}
                  </span>
                  <span style={{ fontWeight: 500, color: responded ? '#15803d' : '#6b7280' }}>{name}</span>
                  {responded && (
                    <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: '#6b7280' }}>
                      {dates.length} date{dates.length !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}
                    </span>
                  )}
                  {!responded && (
                    <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: '#9ca3af' }}>pending</span>
                  )}
                </div>
                {isOpen && dates.length > 0 && (
                  <div style={{ padding: '0 12px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {groupConsecutive(dates).map((group, i) => (
                      <span key={i} style={{
                        fontSize: '.78rem',
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: '#dcfce7',
                        color: '#166534',
                        fontWeight: 500,
                        border: '1px solid #bbf7d0',
                      }}>
                        {groupLabel(group)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      {hasHeatmap && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Availability Overview</h2>
          <p style={{ color: '#6b7280', fontSize: '.9rem', margin: '0 0 16px' }}>
            Darker = more families available that day.
          </p>
          <HeatmapCalendar
            dateWindow={summary.dateWindow}
            heatmap={summary.heatmap}
            finalizedDates={summary.finalizedDates}
            allowedDays={summary.allowedDays || []}
          />
        </div>
      )}

      {!hasHeatmap && !isFinalized && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 24px' }}>
          No availability data yet — check back after families respond.
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '../api/client.js';

function getWeekendBlocks(dateWindow, allowedDays) {
  const blocks = [];
  const end = new Date(dateWindow.end + 'T00:00:00');
  const cur = new Date(dateWindow.start + 'T00:00:00');
  const allowed = new Set(allowedDays.length ? allowedDays : [0, 1, 2, 3, 4, 5, 6]);
  let block = [];
  while (cur <= end) {
    if (allowed.has(cur.getDay())) {
      block.push(cur.toISOString().split('T')[0]);
    } else if (block.length) {
      blocks.push(block);
      block = [];
    }
    cur.setDate(cur.getDate() + 1);
  }
  if (block.length) blocks.push(block);
  return blocks;
}

function blockLabel(dates) {
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

export default function ResultsMatrix() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvent(token)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="container"><p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading…</p></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!event) return null;

  const blocks = getWeekendBlocks(event.dateWindow, event.allowedDays || []);
  const families = event.families;
  const responses = event.familyResponses || {};

  const blockTotals = blocks.map(dates =>
    families.filter(f => {
      const avail = new Set(responses[f]?.availableDates || []);
      return dates.every(d => avail.has(d));
    }).length
  );

  const maxTotal = Math.max(...blockTotals, 1);

  const familyTotals = families.map(f => {
    const avail = new Set(responses[f]?.availableDates || []);
    return blocks.filter(dates => dates.every(d => avail.has(d))).length;
  });

  const notResponded = families.filter(f => !responses[f]);

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{event.name}</h1>
          <span className={`tag tag-${event.status}`}>{event.status}</span>
        </div>
        {event.description && (
          <p style={{ color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 500 }}>{event.description}</p>
        )}
        <div style={{ fontSize: '.85rem', color: '#A8A29E', fontWeight: 600, marginBottom: 16 }}>
          📅 {event.dateWindow.start} → {event.dateWindow.end}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/e/${token}`)}>
          ← Back
        </button>
      </div>

      {notResponded.length > 0 && (
        <div style={{
          background: 'var(--yellow-pale)',
          border: '1.5px solid var(--yellow)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: '.875rem',
          fontWeight: 600,
          color: '#92400E',
        }}>
          ⏳ Still waiting on: {notResponded.join(', ')}
        </div>
      )}

      {/* Matrix */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <h2 style={{ padding: '24px 24px 0' }}>Weekend Availability</h2>
        <table style={{ tableLayout: 'auto', fontSize: '.85rem' }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 24, minWidth: 130 }}>Weekend</th>
              {families.map(f => (
                <th key={f} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{f}</th>
              ))}
              <th style={{ textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((dates, bi) => {
              const total = blockTotals[bi];
              const isTop = total === maxTotal && total > 0;
              return (
                <tr key={bi} style={{ background: isTop ? 'var(--green-pale)' : undefined }}>
                  <td style={{ paddingLeft: 24, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--gray-light)' }}>
                    {blockLabel(dates)}
                    {isTop && (
                      <span className="tag tag-open" style={{ marginLeft: 8, fontSize: '.65rem', padding: '1px 6px', verticalAlign: 'middle' }}>
                        best
                      </span>
                    )}
                  </td>
                  {families.map(f => {
                    const avail = new Set(responses[f]?.availableDates || []);
                    const hasAll = dates.every(d => avail.has(d));
                    const hasSome = dates.some(d => avail.has(d));
                    return (
                      <td key={f} style={{ textAlign: 'center', borderBottom: '1px solid var(--gray-light)', verticalAlign: 'middle' }}>
                        {hasAll
                          ? <span style={{ color: 'var(--green)', fontSize: '1.1rem', fontWeight: 800 }}>✓</span>
                          : hasSome
                          ? <span style={{ color: 'var(--yellow)', fontWeight: 700 }} title="Partial availability">~</span>
                          : <span style={{ color: 'var(--border)' }}>—</span>
                        }
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontWeight: 800, borderBottom: '1px solid var(--gray-light)', verticalAlign: 'middle', color: total > 0 ? 'var(--green-dark)' : 'var(--text-muted)' }}>
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--gray-light)', borderTop: '2px solid var(--border)' }}>
              <td style={{ paddingLeft: 24, fontWeight: 700, color: 'var(--text-muted)', fontSize: '.78rem', borderBottom: 'none' }}>
                Weekends available
              </td>
              {familyTotals.map((t, i) => (
                <td key={i} style={{ textAlign: 'center', fontWeight: 800, color: t > 0 ? 'var(--green-dark)' : 'var(--text-muted)', borderBottom: 'none' }}>
                  {t}
                </td>
              ))}
              <td style={{ borderBottom: 'none' }} />
            </tr>
          </tfoot>
        </table>
        <p style={{ padding: '12px 24px', margin: 0, fontSize: '.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--gray-light)' }}>
          ✓ = all days available &nbsp;·&nbsp; ~ = partial &nbsp;·&nbsp; — = not available
        </p>
      </div>
    </div>
  );
}

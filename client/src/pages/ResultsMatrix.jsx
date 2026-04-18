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
  const start = new Date(dates[0] + 'T00:00:00');
  const end = new Date(dates[dates.length - 1] + 'T00:00:00');
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
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

  // count total families available per block
  const blockTotals = blocks.map(dates => {
    const dateSet = new Set(dates);
    return families.filter(f => {
      const avail = new Set(responses[f]?.availableDates || []);
      return dates.every(d => avail.has(d));
    }).length;
  });

  const maxTotal = Math.max(...blockTotals, 1);

  // per-family totals (blocks where they're fully available)
  const familyTotals = families.map(f => {
    const avail = new Set(responses[f]?.availableDates || []);
    return blocks.filter(dates => dates.every(d => avail.has(d))).length;
  });

  const notResponded = families.filter(f => !responses[f]);

  return (
    <div className="container" style={{ maxWidth: 780 }}>
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
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/e/${token}`)}
        >
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
      <div className="card" style={{ padding: '20px 0', overflowX: 'auto' }}>
        <h2 style={{ margin: '0 0 16px', paddingInline: 24 }}>Weekend Availability</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '.82rem',
          tableLayout: 'auto',
        }}>
          <thead>
            <tr>
              <th style={thStyle('left', true)}>Weekend</th>
              {families.map(f => (
                <th key={f} style={thStyle('center', true)}>
                  <div style={{ writingMode: 'horizontal-tb', whiteSpace: 'nowrap', fontSize: '.75rem' }}>
                    {f}
                  </div>
                </th>
              ))}
              <th style={thStyle('center', true)}>Total</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((dates, bi) => {
              const total = blockTotals[bi];
              const isTop = total === maxTotal && total > 0;
              const rowBg = isTop ? 'var(--green-pale)' : bi % 2 === 0 ? '#fff' : 'var(--gray-light)';
              return (
                <tr key={bi} style={{ background: rowBg }}>
                  <td style={{ ...tdStyle('left'), fontWeight: 600, whiteSpace: 'nowrap', paddingLeft: 24 }}>
                    {blockLabel(dates)}
                    {isTop && (
                      <span style={{
                        marginLeft: 6,
                        fontSize: '.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '.4px',
                        background: 'var(--green)',
                        color: '#fff',
                        borderRadius: 4,
                        padding: '1px 5px',
                        verticalAlign: 'middle',
                      }}>best</span>
                    )}
                  </td>
                  {families.map(f => {
                    const avail = new Set(responses[f]?.availableDates || []);
                    const hasAll = dates.every(d => avail.has(d));
                    const hasSome = dates.some(d => avail.has(d));
                    return (
                      <td key={f} style={{ ...tdStyle('center') }}>
                        {hasAll
                          ? <span style={{ color: 'var(--green)', fontSize: '1rem', fontWeight: 800 }}>✓</span>
                          : hasSome
                          ? <span style={{ color: 'var(--yellow)', fontSize: '.8rem', fontWeight: 700 }} title="Partial availability">~</span>
                          : <span style={{ color: 'var(--border)', fontSize: '.9rem' }}>—</span>
                        }
                      </td>
                    );
                  })}
                  <td style={{ ...tdStyle('center'), fontWeight: 800, color: total > 0 ? 'var(--green-dark)' : 'var(--text-muted)' }}>
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--gray-light)' }}>
              <td style={{ ...tdStyle('left'), fontWeight: 700, fontSize: '.78rem', color: 'var(--text-muted)', paddingLeft: 24 }}>
                Weekends available
              </td>
              {familyTotals.map((t, i) => (
                <td key={i} style={{ ...tdStyle('center'), fontWeight: 800, color: t > 0 ? 'var(--green-dark)' : 'var(--text-muted)' }}>
                  {t}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
        <span style={{ marginInline: 8 }}>✓ = all days available</span>
        <span style={{ marginInline: 8 }}>~ = partial</span>
        <span style={{ marginInline: 8 }}>— = not available</span>
      </div>
    </div>
  );
}

function thStyle(align, header) {
  return {
    padding: '10px 8px',
    textAlign: align,
    fontWeight: 700,
    fontSize: '.78rem',
    color: header ? 'var(--text-muted)' : 'var(--text)',
    borderBottom: '2px solid var(--border)',
    background: 'var(--gray-light)',
    whiteSpace: 'nowrap',
  };
}

function tdStyle(align) {
  return {
    padding: '9px 8px',
    textAlign: align,
    borderBottom: '1px solid var(--border)',
  };
}

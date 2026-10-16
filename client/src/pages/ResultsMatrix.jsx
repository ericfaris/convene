import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '../api/client.js';
import EventHeader from '../components/storybook/EventHeader.jsx';
import Moment from '../components/storybook/Moment.jsx';
import PageFoot from '../components/storybook/PageFoot.jsx';
import { ART } from '../components/storybook/art.js';

function isWeekendOnly(allowedDays) {
  return allowedDays.length > 0 && allowedDays.every(d => [0, 5, 6].includes(d));
}

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

  if (loading) return <div className="container"><p className="loading-note">Loading results…</p></div>;
  if (error) {
    const notFound = /not found/i.test(error);
    return (
      <div className="container">
        <Moment
          art={ART.lost}
          headingLevel={1}
          eyebrow={notFound ? 'Link not found' : 'Something went wrong'}
          title={notFound ? 'We couldn’t find that gathering.' : 'That didn’t load.'}
        >
          {notFound ? 'The link may be mistyped, or the organizer removed the event.' : error}
        </Moment>
        <PageFoot />
      </div>
    );
  }
  if (!event) return null;

  const allowedDays = event.allowedDays || [];
  const weekendOnly = isWeekendOnly(allowedDays);
  const blocks = getWeekendBlocks(event.dateWindow, allowedDays);
  const attendees = event.attendees;
  const responses = event.attendeeResponses || {};

  const blockTotals = blocks.map(dates =>
    attendees.filter(f => {
      const avail = new Set(responses[f]?.availableDates || []);
      return dates.every(d => avail.has(d));
    }).length
  );

  const maxTotal = Math.max(...blockTotals, 1);

  const attendeeTotals = attendees.map(f => {
    const avail = new Set(responses[f]?.availableDates || []);
    return blocks.filter(dates => dates.every(d => avail.has(d))).length;
  });

  const notResponded = attendees.filter(f => !responses[f]);
  const bestIndex = blockTotals.indexOf(maxTotal);
  const anyReplies = notResponded.length < attendees.length;

  return (
    <div className="container">
      <EventHeader
        event={event}
        eyebrow="Results so far"
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/e/${token}`)}>
            ← Back to my dates
          </button>
        }
      />

      {!anyReplies && (
        <Moment
          art={ART.noReplies}
          sticker={`0 of ${attendees.length} replied`}
          eyebrow="Nothing yet"
          title="No one has picked dates yet."
          actions={<button type="button" className="btn btn-primary" onClick={() => navigate(`/e/${token}`)}>Add my dates</button>}
        >
          Be the first. Results fill in here as people reply.
        </Moment>
      )}

      {anyReplies && maxTotal > 0 && blockTotals[bestIndex] > 0 && (
        <div className="best-so-far">
          <span className="sticker sticker-green">
            <span className="tag tag-finalized">Best so far</span>
            <strong>{blockLabel(blocks[bestIndex])}</strong>
            <span>· {maxTotal} of {attendees.length} free</span>
          </span>
        </div>
      )}

      {notResponded.length > 0 && anyReplies && (
        <div className="banner banner-warn">
          Still waiting on: {notResponded.join(', ')}
        </div>
      )}

      {/* Matrix */}
      {anyReplies && (
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <h2 className="section-title" style={{ padding: '24px 24px 8px' }}>Who’s free {weekendOnly ? 'which weekend' : 'when'}</h2>
        <table style={{ tableLayout: 'auto', fontSize: '.85rem' }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 24, minWidth: 130 }}>{weekendOnly ? 'Weekend' : 'Dates'}</th>
              {attendees.map(f => (
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
                  {attendees.map(f => {
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
                {weekendOnly ? 'Weekends' : 'Dates'} available
              </td>
              {attendeeTotals.map((t, i) => (
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
      )}
      <PageFoot />
    </div>
  );
}

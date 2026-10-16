import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminDashboard, finalizeEvent, addAttendee } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import ResponseTable from '../components/ResponseTable.jsx';
import EventHeader from '../components/storybook/EventHeader.jsx';
import Moment from '../components/storybook/Moment.jsx';
import { ART } from '../components/storybook/art.js';
import { formatRange } from '../lib/dates.js';

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
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="container"><p className="loading-note">Loading your dashboard…</p></div>;
  if (error) {
    const notFound = /not found|invalid/i.test(error);
    return (
      <div className="container">
        <Moment
          art={ART.lost}
          headingLevel={1}
          eyebrow={notFound ? 'Admin link not recognized' : 'Something went wrong'}
          title={notFound ? 'We couldn’t find that dashboard.' : 'That didn’t load.'}
          actions={notFound
            ? <Link to="/new" className="btn btn-primary">Start a new gathering</Link>
            : <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>}
        >
          {notFound
            ? 'Double-check the admin link you saved when you created the event. It’s the only way back in.'
            : error}
        </Moment>
      </div>
    );
  }
  if (!data) return null;

  const { event, responses, heatmap, suggestedWindows } = data;
  const respondedCount = responses.length;
  const totalAttendees = event.attendees.length;
  const pct = totalAttendees > 0 ? (respondedCount / totalAttendees) * 100 : 0;
  const isFinalized = event.status === 'finalized' && event.finalizedDates?.start;
  const finalRange = formatRange(event.finalizedDates?.start, event.finalizedDates?.end);

  return (
    <div className="container">
      <EventHeader
        event={event}
        eyebrow="Organizer view · keep this link private"
      />

      <div className="card">
        <div className="progress-head">
          <span>{respondedCount} of {totalAttendees} people responded</span>
          <strong>{Math.round(pct)}%</strong>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 16 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={copyParticipantLink}>
            {copied ? '✓ Copied' : 'Copy guest link'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/e/${event.participantToken}/results`)}>
            See results
          </button>
          {!isFinalized && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowFinalize(f => !f)}>
              {showFinalize ? 'Cancel' : 'Finalize dates'}
            </button>
          )}
        </div>
      </div>

      {isFinalized && (
        <Moment
          art={ART.finalized}
          sticker={<><span className="tag tag-finalized">Finalized</span><strong>{finalRange}</strong></>}
          stickerTone="green"
          eyebrow="Locked in"
          title="It’s on the calendar."
        >
          {`Everyone with the guest link now sees ${finalRange} as the final date.`}
        </Moment>
      )}

      {!isFinalized && respondedCount === 0 && (
        <Moment
          art={ART.noReplies}
          sticker="0 replies so far"
          eyebrow="Waiting on replies"
          title="Send the guest link to get things going."
          actions={
            <button type="button" className="btn btn-primary" onClick={copyParticipantLink}>
              {copied ? '✓ Copied' : 'Copy guest link'}
            </button>
          }
        >
          Paste it in the group chat. Guests tap their name and pick their dates. No sign-up needed. The best dates show up here as replies come in.
        </Moment>
      )}

      {/* Finalize form */}
      {showFinalize && (
        <div className="card card-emphasis">
          <h2 className="section-title">Lock in the final dates</h2>
          <p className="section-sub">Everyone with the guest link will see these.</p>
          {finalizeError && <div className="error">{finalizeError}</div>}
          <form onSubmit={handleFinalize}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12, marginBottom: 12 }}>
              <div className="field">
                <label htmlFor="final-start">Start date</label>
                <input id="final-start" type="date" required value={finalDates.start} onChange={e => setFinalDates(d => ({ ...d, start: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="final-end">End date</label>
                <input id="final-end" type="date" required value={finalDates.end} onChange={e => setFinalDates(d => ({ ...d, end: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={finalizing}>
              {finalizing ? 'Saving…' : 'Confirm dates'}
            </button>
          </form>
        </div>
      )}

      {/* Suggested windows */}
      {suggestedWindows.length > 0 && (
        <div className="card">
          <h2 className="section-title">Top suggested dates</h2>
          <p className="section-sub">Ranked by how many people can make every day.</p>
          <div className="option-grid">
            {suggestedWindows.map((w, i) => (
              <div key={i} className={`option-card${i === 0 ? ' is-best' : ''}`}>
                <span className="option-label">{i === 0 ? '★ Best pick' : `#${i + 1}`}</span>
                <span className="option-dates">{formatRange(w.start, w.end)}</span>
                <span className="option-meta">{w.attendeeCount} of {totalAttendees} available</span>
                {!isFinalized && (
                  <button
                    className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setFinalDates({ start: w.start, end: w.end }); setShowFinalize(true); }}
                  >
                    Use these dates
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap (nothing to show until someone replies) */}
      {respondedCount > 0 && <div className="card">
        <h2 className="section-title">Who’s free when</h2>
        <p className="section-sub">Darker days work for more people.</p>
        <HeatmapCalendar
          dateWindow={event.dateWindow}
          heatmap={heatmap}
          finalizedDates={event.finalizedDates}
          allowedDays={event.allowedDays || []}
        />
      </div>}

      {/* Response table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Responses</h2>
          <form onSubmit={handleAddAttendee} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label htmlFor="new-attendee" className="sr-only">Add someone</label>
            <input
              id="new-attendee"
              type="text"
              className="input-sm"
              placeholder="Add someone…"
              value={newAttendee}
              onChange={e => setNewAttendee(e.target.value)}
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

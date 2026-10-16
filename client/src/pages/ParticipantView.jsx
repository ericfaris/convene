import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent, submitResponse } from '../api/client.js';
import CalendarGrid from '../components/CalendarGrid.jsx';
import AttendeeList from '../components/AttendeeList.jsx';
import EventHeader from '../components/storybook/EventHeader.jsx';
import Moment from '../components/storybook/Moment.jsx';
import PageFoot from '../components/storybook/PageFoot.jsx';
import { ART } from '../components/storybook/art.js';
import { formatRange } from '../lib/dates.js';
import { choiceNoun, countChosen } from '../lib/schedule.js';

export default function ParticipantView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [screen, setScreen] = useState('list');
  const [selectedAttendee, setSelectedAttendee] = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEvent(token)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function selectAttendee(name) {
    const existing = event.attendeeResponses?.[name];
    setSelectedAttendee(name);
    setSelectedDates(existing ? new Set(existing.availableDates) : new Set());
    setNotes(existing?.notes || '');
    setScreen('dates');
  }

  function toggleDate(date) {
    setSelectedDates(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  }

  function toggleGroup(dates) {
    setSelectedDates(prev => {
      const next = new Set(prev);
      const allSelected = dates.every(d => next.has(d));
      if (allSelected) {
        dates.forEach(d => next.delete(d));
      } else {
        dates.forEach(d => next.add(d));
      }
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitResponse(token, {
        attendeeName: selectedAttendee,
        availableDates: [...selectedDates].sort(),
        notes
      });
      setEvent(ev => ({
        ...ev,
        respondedAttendees: [...(ev.respondedAttendees || []).filter(f => f !== selectedAttendee), selectedAttendee],
        attendeeResponses: { ...ev.attendeeResponses, [selectedAttendee]: { availableDates: [...selectedDates].sort(), notes } }
      }));
      setScreen('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p className="loading-note">Loading your invitation…</p></div>;
  if (error && !event) {
    const notFound = /not found/i.test(error);
    return (
      <div className="container">
        <Moment
          art={ART.lost}
          headingLevel={1}
          eyebrow={notFound ? 'Link not found' : 'Something went wrong'}
          title={notFound ? 'We couldn’t find that gathering.' : 'That didn’t load.'}
          actions={notFound
            ? <Link to="/" className="btn btn-secondary">What is Convene?</Link>
            : <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>}
        >
          {notFound
            ? 'The link may be mistyped, or the organizer removed the event. Ask them to send it again.'
            : error}
        </Moment>
        <PageFoot />
      </div>
    );
  }
  if (!event) return null;

  const isFinalized = event.status === 'finalized';
  const isClosed = event.status === 'closed' || isFinalized;
  const finalRange = formatRange(event.finalizedDates?.start, event.finalizedDates?.end);

  const header = (
    <EventHeader
      event={event}
      eyebrow="You’re invited"
      actions={
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/e/${token}/results`)}>
          See results
        </button>
      }
    />
  );

  if (isFinalized && event.finalizedDates?.start) {
    return (
      <div className="container">
        {header}
        <Moment
          art={ART.finalized}
          sticker={<><span className="tag tag-finalized">Finalized</span><strong>{finalRange}</strong></>}
          stickerTone="green"
          eyebrow="The date is set"
          title="It’s happening. See you there!"
        >
          {`${event.name} is on ${finalRange}. Put it on your calendar.`}
        </Moment>
        <PageFoot />
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="container">
        {header}
        <Moment
          art={ART.waiting}
          sticker="Responses closed"
          eyebrow="Almost there"
          title="Waiting on the organizer."
        >
          Everyone’s picks are in. The final date will show up on this page once it’s locked in.
        </Moment>
        <PageFoot />
      </div>
    );
  }

  // Screen: list
  if (screen === 'list') {
    return (
      <div className="container">
        {header}
        <div className="card">
          <p className="chapter chapter-sm">
            <span className="chapter-num">01</span>
            <span className="eyebrow">Find your name</span>
          </p>
          <h2 className="section-title">Who are you?</h2>
          <p className="section-sub">Tap your name to pick the dates that work. No sign-up needed.</p>
          {error && <div className="error">{error}</div>}
          <AttendeeList
            attendees={event.attendees}
            respondedAttendees={event.respondedAttendees}
            selected=""
            onSelect={selectAttendee}
            disabled={false}
          />
        </div>
        <PageFoot />
      </div>
    );
  }

  // Screen: dates
  if (screen === 'dates') {
    const isUpdating = (event.respondedAttendees || []).includes(selectedAttendee);
    const noun = choiceNoun(event.allowedDays);
    const selectionCount = countChosen(event.dateWindow, event.allowedDays, selectedDates);
    const selectionLabel = `${noun}${selectionCount !== 1 ? 's' : ''}`;
    return (
      <div className="container">
        {header}
        <div className="card">
          <button type="button" className="link-btn" onClick={() => setScreen('list')} style={{ marginBottom: 14 }}>
            ← Not {selectedAttendee}?
          </button>
          <p className="chapter chapter-sm">
            <span className="chapter-num">02</span>
            <span className="eyebrow">Pick your days</span>
          </p>
          <h2 className="section-title">
            {isUpdating ? `Update your picks, ${selectedAttendee}.` : `Hi, ${selectedAttendee}! When are you free?`}
          </h2>
          <p className="section-sub">
            {noun === 'date' ? 'Tap every date that works for you.' : `Tap every ${noun} that works for you. One tap covers all its days.`}{' '}
            <strong className={selectionCount > 0 ? 'count-good' : 'count-none'}>
              {selectionCount} {selectionLabel} selected.
            </strong>
          </p>
          {error && <div className="error">{error}</div>}
          <CalendarGrid
            dateWindow={event.dateWindow}
            selected={selectedDates}
            onToggle={toggleDate}
            onToggleGroup={toggleGroup}
            disabled={false}
            allowedDays={event.allowedDays || []}
          />
        </div>

        <div className="card">
          <div className="field">
            <label htmlFor="notes">Any notes? (optional)</label>
            <textarea
              id="notes"
              placeholder="e.g. We can’t do the last weekend in July…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={submitting || selectedDates.size === 0}
            onClick={handleSubmit}
          >
            {submitting ? 'Saving…' : isUpdating ? 'Update my availability' : 'Send my availability'}
          </button>
        </div>
        <PageFoot />
      </div>
    );
  }

  // Screen: confirm
  const savedCount = (() => {
    const n = countChosen(event.dateWindow, event.allowedDays, selectedDates);
    return `${n} ${choiceNoun(event.allowedDays)}${n !== 1 ? 's' : ''} saved`;
  })();
  return (
    <div className="container">
      {header}
      <Moment
        art={ART.thanks}
        sticker={<><span aria-hidden="true">✓</span> {savedCount}</>}
        stickerTone="green"
        eyebrow="03 · All done"
        title={`Thanks, ${selectedAttendee}!`}
        actions={<>
          <button type="button" className="btn btn-secondary" onClick={() => setScreen('dates')}>Change my dates</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/e/${token}/results`)}>See who else is free</button>
        </>}
      >
        Your availability is saved. Come back to this link anytime to change it. The final date will show up here once it’s set.
      </Moment>
      <PageFoot />
    </div>
  );
}

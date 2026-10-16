import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createEvent } from '../api/client.js';
import Moment from '../components/storybook/Moment.jsx';
import { ART } from '../components/storybook/art.js';
import DateWindowFields from '../components/DateWindowFields.jsx';
import { previewWindow } from '../lib/schedule.js';

export default function CreateEvent() {

  const [form, setForm] = useState({
    name: '',
    description: '',
    dateWindow: { start: '', end: '' },
    attendees: [''],
    allowedDays: [0, 1, 2, 3, 4, 5, 6]
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({});

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function updateAttendee(i, val) {
    const attendees = [...form.attendees];
    attendees[i] = val;
    setField('attendees', attendees);
  }

  function addAttendee() {
    setField('attendees', [...form.attendees, '']);
  }

  function removeAttendee(i) {
    setField('attendees', form.attendees.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const check = previewWindow(form.dateWindow, form.allowedDays);
    if (check.status === 'error') { setError(`${check.headline} ${check.detail}`); return; }
    setLoading(true);
    try {
      const attendees = form.attendees.map(f => f.trim()).filter(Boolean);
      const allowedDays = form.allowedDays.length === 7 ? [] : form.allowedDays;
      const data = await createEvent({ ...form, attendees, allowedDays });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copy(key, text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(c => ({ ...c, [key]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000);
  }

  if (result) {
    return (
      <div className="container">
        <Moment
          art={ART.allSet}
          headingLevel={1}
          sticker={<><span aria-hidden="true">✓</span> Links ready</>}
          stickerTone="green"
          eyebrow="02 · Share"
          title="You’re all set!"
        >
          Send the guest link to everyone. Keep the admin link for yourself. You’ll use it to see replies and lock in the date.
        </Moment>

        <div className="card">
          <label htmlFor="participant-url">Guest link: share this with everyone</label>
          <div className="copy-box">
            <input id="participant-url" readOnly value={result.participantUrl} />
            <button className="btn btn-primary btn-sm" onClick={() => copy('participant', result.participantUrl)}>
              {copied.participant ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="card card-warn">
          <h2 className="section-title">Save your admin link</h2>
          <p className="section-sub">It’s only shown once, and it’s the only way back to your dashboard. Bookmark it or email it to yourself.</p>
          <label htmlFor="admin-url">Admin link (keep this private)</label>
          <div className="copy-box">
            <input id="admin-url" readOnly value={result.adminUrl} />
            <button className="btn btn-secondary btn-sm" onClick={() => copy('admin', result.adminUrl)}>
              {copied.admin ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => { setResult(null); setForm({ name: '', description: '', dateWindow: { start: '', end: '' }, attendees: [''], allowedDays: [0,1,2,3,4,5,6] }); }}>
          ← Plan another gathering
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <Link to="/" aria-label="Convene home" className="brand-link">
          <img src="/logo.svg" alt="" width="28" height="28" />
          <span>Convene</span>
        </Link>
        <p className="chapter chapter-sm">
          <span className="chapter-num">01</span>
          <span className="eyebrow">Suggest</span>
        </p>
        <h1 className="masthead-title">Suggest a window.</h1>
        <p className="subtitle">Name your gathering, pick a range of dates, and list who’s invited. No account needed.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ev-name">Event Name *</label>
            <input
              type="text"
              required
              id="ev-name"
              placeholder="Piercefield Summer Bash 2026"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-desc">Description</label>
            <textarea
              id="ev-desc"
              placeholder="Any details attendees should know…"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
          </div>

          <DateWindowFields
            dateWindow={form.dateWindow}
            allowedDays={form.allowedDays}
            onWindowChange={w => setField('dateWindow', w)}
            onDaysChange={days => setField('allowedDays', days)}
          />

          <div className="field">
            <label>Attendees</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.attendees.map((attendee, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    aria-label={`Attendee ${i + 1} name`}
                    placeholder={`Attendee ${i + 1} name`}
                    value={attendee}
                    onChange={e => updateAttendee(i, e.target.value)}
                  />
                  {form.attendees.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" aria-label={`Remove attendee ${i + 1}`} onClick={() => removeAttendee(i)}>✕</button>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addAttendee}>
                  + Add Attendee
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating…' : 'Create my gathering'}
          </button>
        </form>
      </div>
    </div>
  );
}

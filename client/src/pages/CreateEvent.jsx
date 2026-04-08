import { useState } from 'react';
import { createEvent } from '../api/client.js';

export default function CreateEvent() {
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [form, setForm] = useState({
    name: '',
    description: '',
    dateWindow: { start: '', end: '' },
    deadline: '',
    families: [''],
    allowedDays: [0, 1, 2, 3, 4, 5, 6]
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({});

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setDateWindow(key, value) {
    setForm(f => ({ ...f, dateWindow: { ...f.dateWindow, [key]: value } }));
  }

  function updateFamily(i, val) {
    const families = [...form.families];
    families[i] = val;
    setField('families', families);
  }

  function addFamily() {
    setField('families', [...form.families, '']);
  }

  function removeFamily(i) {
    setField('families', form.families.filter((_, idx) => idx !== i));
  }

  function toggleDay(dow) {
    setForm(f => {
      const has = f.allowedDays.includes(dow);
      // Don't allow deselecting all days
      if (has && f.allowedDays.length === 1) return f;
      return {
        ...f,
        allowedDays: has ? f.allowedDays.filter(d => d !== dow) : [...f.allowedDays, dow].sort((a, b) => a - b)
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const families = form.families.map(f => f.trim()).filter(Boolean);
      // If all 7 days are selected, send empty array (no filter)
      const allowedDays = form.allowedDays.length === 7 ? [] : form.allowedDays;
      const data = await createEvent({ ...form, families, allowedDays });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text);
    setCopied(c => ({ ...c, [key]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000);
  }

  if (result) {
    return (
      <div className="container">
        <div className="card">
          <h1>Event Created!</h1>
          <p className="subtitle">Share the participant link with your families. Save your admin link — it cannot be recovered.</p>

          <div className="card" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <h3>⚠️ Save Your Admin Link</h3>
            <p style={{ margin: '0 0 12px', fontSize: '.9rem', color: '#92400e' }}>
              This is the only time your admin link will be shown. If you lose it, you won't be able to manage this event.
            </p>
            <label>Admin Link (private — keep this safe)</label>
            <div className="copy-box">
              <input readOnly value={result.adminUrl} />
              <button className="btn btn-secondary btn-sm" onClick={() => copy('admin', result.adminUrl)}>
                {copied.admin ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Participant Link (share this with everyone)</label>
            <div className="copy-box">
              <input readOnly value={result.participantUrl} />
              <button className="btn btn-primary btn-sm" onClick={() => copy('participant', result.participantUrl)}>
                {copied.participant ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => { setResult(null); setForm({ name: '', description: '', dateWindow: { start: '', end: '' }, deadline: '', families: [''], allowedDays: [0,1,2,3,4,5,6] }); }}>
            Create Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Convene</h1>
        <p className="subtitle">Find the best dates for your group gathering.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Event Name *</label>
            <input
              type="text"
              required
              placeholder="Smith Family Reunion 2025"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Add any details for your group..."
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Window Start *</label>
              <input
                type="date"
                required
                value={form.dateWindow.start}
                onChange={e => setDateWindow('start', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Window End *</label>
              <input
                type="date"
                required
                value={form.dateWindow.end}
                onChange={e => setDateWindow('end', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Response Deadline *</label>
            <input
              type="date"
              required
              value={form.deadline}
              onChange={e => setField('deadline', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Days of week to show</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {ALL_DAYS.map(dow => {
                const active = form.allowedDays.includes(dow);
                return (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => toggleDay(dow)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: '2px solid',
                      borderColor: active ? '#2563eb' : '#e5e7eb',
                      background: active ? '#eff6ff' : '#fff',
                      color: active ? '#1d4ed8' : '#9ca3af',
                      fontWeight: active ? 600 : 400,
                      fontSize: '.85rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all .15s',
                    }}
                  >
                    {DAY_NAMES[dow]}
                  </button>
                );
              })}
            </div>
            {form.allowedDays.length < 7 && (
              <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 6 }}>
                Only {form.allowedDays.map(d => DAY_NAMES[d]).join(', ')} will be shown to participants.
              </div>
            )}
          </div>

          <div className="field">
            <label>Families</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.families.map((fam, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder={`Family ${i + 1} name`}
                    value={fam}
                    onChange={e => updateFamily(i, e.target.value)}
                  />
                  {form.families.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFamily(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addFamily}>
                + Add Family
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

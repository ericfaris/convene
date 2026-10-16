import { useMemo, useState } from 'react';
import DatesGuide from './storybook/DatesGuide.jsx';
import {
  DAY_SHORT, DAY_LONG, describeDays, choiceNoun, previewWindow, isEveryDay, weekday,
} from '../lib/schedule.js';

const ALL = [0, 1, 2, 3, 4, 5, 6];
export const DAY_PRESETS = [
  { label: 'Every day', days: ALL },
  { label: 'Weekends (Fri–Sun)', days: [0, 5, 6] },
  { label: 'Sat & Sun', days: [0, 6] },
  { label: 'Weeknights (Mon–Thu)', days: [1, 2, 3, 4] },
];
const sameDays = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

const md = iso => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
function choiceText(block) {
  if (block.length === 1) return `${DAY_SHORT[weekday(block[0])]} ${md(block[0])}`;
  return `${DAY_SHORT[weekday(block[0])]} ${md(block[0])} – ${DAY_SHORT[weekday(block.at(-1))]} ${md(block.at(-1))}`;
}

function daysHint(allowedDays) {
  if (isEveryDay(allowedDays)) {
    return 'All 7 days are on, so guests get a calendar and tap individual days.';
  }
  const noun = choiceNoun(allowedDays);
  const which = describeDays(allowedDays);
  const off = ALL.filter(d => !allowedDays.includes(d)).map(d => DAY_LONG[d]);
  const hidden = `${off.length === 1 ? off[0] : `${off.slice(0, -1).join(', ')} and ${off.at(-1)}`} won’t appear at all.`;
  return noun === 'date'
    ? `Only ${which} appear, and each date is its own tap. ${hidden}`
    : `Only ${which} appear. Back-to-back days are bundled, so each ${which} ${noun} is one tap. ${hidden}`;
}

export function WindowPreview({ preview, max = 4 }) {
  const choices = preview.options?.blocks || [];
  const partial = new Set(preview.options?.partial || []);
  return (
    <div className={`preview is-${preview.status}`} aria-live="polite">
      <p className="eyebrow">What guests will see</p>
      <p className="preview-headline">{preview.headline}</p>
      {preview.detail && <p className="preview-detail">{preview.detail}</p>}
      {preview.status === 'ok' && (
        <div className="preview-choices" aria-label="First few choices">
          {choices.slice(0, max).map((b, i) => (
            <span key={b[0]} className={`choice-chip${partial.has(i) ? ' is-partial' : ''}`}>{choiceText(b)}</span>
          ))}
          {choices.length > max && <span className="choice-chip is-more">+{choices.length - max} more</span>}
        </div>
      )}
      {preview.warnings?.length > 0 && (
        <ul className="preview-warnings">
          {preview.warnings.map(w => <li key={w}>{w}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function DateWindowFields({ dateWindow, allowedDays, onWindowChange, onDaysChange }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const preview = useMemo(() => previewWindow(dateWindow, allowedDays), [dateWindow, allowedDays]);

  function toggleDay(dow) {
    const has = allowedDays.includes(dow);
    if (has && allowedDays.length === 1) return; // at least one day must stay on
    onDaysChange(has ? allowedDays.filter(d => d !== dow) : [...allowedDays, dow].sort((a, b) => a - b));
  }

  return (
    <fieldset className="fieldset">
      <legend><h2 className="section-title">When could it happen?</h2></legend>
      <p className="field-help">
        Set the range of dates guests can choose from, then which days of the week count.
      </p>
      <button type="button" className="help-btn" onClick={() => setGuideOpen(true)} style={{ marginBottom: 'var(--space-5)' }}>
        <span className="help-btn-mark" aria-hidden="true">?</span> How dates work
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="ev-start">Window start *</label>
          <input
            id="ev-start"
            type="date"
            required
            aria-describedby="ev-start-hint"
            value={dateWindow.start}
            onChange={e => onWindowChange({ ...dateWindow, start: e.target.value })}
          />
          <div id="ev-start-hint" className="field-hint">First day guests can pick (included).</div>
        </div>
        <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="ev-end">Window end *</label>
          <input
            id="ev-end"
            type="date"
            required
            min={dateWindow.start || undefined}
            aria-describedby="ev-end-hint"
            value={dateWindow.end}
            onChange={e => onWindowChange({ ...dateWindow, end: e.target.value })}
          />
          <div id="ev-end-hint" className="field-hint">Last day guests can pick (included).</div>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label id="ev-days">Days of the week guests can pick</label>
        <div role="group" aria-label="Quick picks" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0 10px' }}>
          {DAY_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              className="btn btn-secondary btn-sm"
              aria-pressed={sameDays(allowedDays, p.days)}
              onClick={() => onDaysChange([...p.days].sort((a, b) => a - b))}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div role="group" aria-labelledby="ev-days" aria-describedby="ev-days-hint" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ALL.map(dow => (
            <button
              key={dow}
              type="button"
              className="toggle-pill"
              aria-pressed={allowedDays.includes(dow)}
              aria-label={DAY_LONG[dow]}
              onClick={() => toggleDay(dow)}
            >
              {DAY_SHORT[dow]}
            </button>
          ))}
        </div>
        <div id="ev-days-hint" className="field-hint" style={{ marginTop: 8, fontSize: 'var(--text-body-sm)' }}>
          {daysHint(allowedDays)}
        </div>
      </div>

      <WindowPreview preview={preview} />

      <DatesGuide open={guideOpen} onClose={() => setGuideOpen(false)} preview={preview} />
    </fieldset>
  );
}

import { useEffect, useRef, useState } from 'react';
import { DAY_SHORT, datesInWindow, guestOptions, weekday } from '../../lib/schedule.js';

// "How dates work": a four-step modal explaining the date window, days of
// the week, what guests tap, and how the best date is ranked. Diagrams are
// drawn from the real scheduling logic (lib/schedule.js), so they can't
// drift from what the app does.

const EX_WINDOW = { start: '2026-07-08', end: '2026-07-26' };
const EX_DAYS = [5, 6, 0]; // Fri–Sun
const MONTH = datesInWindow('2026-06-28', '2026-08-01'); // July 2026, Sun-aligned weeks
const day = iso => +iso.slice(8, 10);
const inJuly = iso => iso.slice(5, 7) === '07';

function MiniCal({ mode, picks = [] }) {
  const inWindow = d => d >= EX_WINDOW.start && d <= EX_WINDOW.end;
  return (
    <div className="mini-cal" aria-hidden="true">
      {DAY_SHORT.map((n, i) => (
        <span key={n} className={`mini-cal-head${mode !== 'window' && mode !== 'all' && EX_DAYS.includes(i) ? ' is-on' : ''}`}>{n}</span>
      ))}
      {MONTH.map(d => {
        if (!inJuly(d)) return <span key={d} />;
        let cls = 'mini-day';
        if (inWindow(d)) {
          if (mode === 'window' || mode === 'all') cls += ' is-in';
          else if (EX_DAYS.includes(weekday(d))) cls += ' is-on';
        }
        if (mode === 'window' && (d === EX_WINDOW.start || d === EX_WINDOW.end)) cls += ' is-edge';
        if (picks.includes(d)) cls += ' is-pick';
        return <span key={d} className={cls}>{day(d)}</span>;
      })}
    </div>
  );
}

const md = iso => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
const blockText = b => (b.length === 1 ? md(b[0]) : `${DAY_SHORT[weekday(b[0])]} ${md(b[0])} – ${DAY_SHORT[weekday(b.at(-1))]} ${md(b.at(-1))}`);

function MiniBlocks({ picked = 1 }) {
  const { blocks } = guestOptions(EX_WINDOW, EX_DAYS);
  return (
    <div className="mini-blocks" aria-hidden="true">
      {blocks.map((b, i) => (
        <span key={b[0]} className={`mini-block${i === picked ? ' is-pick' : ''}`}>
          <span>{blockText(b)}</span>{i === picked && <span>✓</span>}
        </span>
      ))}
    </div>
  );
}

const STEPS = [
  {
    eyebrow: 'The window',
    title: 'Start and end set the outer edges.',
    body: (
      <>
        <strong>Window start</strong> is the first day anyone can pick and <strong>window end</strong> is the last.
        Both days are included. Nothing before the start or after the end ever shows up for guests.
      </>
    ),
    figure: (
      <div className="guide-figure">
        <MiniCal mode="window" />
        <span className="sticker sticker-pinned">Jul 8 → Jul 26</span>
      </div>
    ),
    alt: 'July 2026 calendar with July 8 through July 26 highlighted and the two end days outlined.',
  },
  {
    eyebrow: 'Days of the week',
    title: 'Only the days you turn on appear.',
    body: (
      <>
        Inside the window, guests see <strong>only the days of the week you leave on</strong>. Turn off Mon–Thu and
        those days are hidden completely; guests can’t pick them at all. Leave all seven on and every day in the window
        is available.
      </>
    ),
    figure: (
      <div className="guide-figure">
        <MiniCal mode="days" />
        <span className="sticker sticker-pinned">Fri, Sat &amp; Sun only</span>
      </div>
    ),
    alt: 'The same calendar where only the Fridays, Saturdays and Sundays inside the window are lit.',
  },
  {
    eyebrow: 'What guests tap',
    title: 'Every day on means single days. Some days on means blocks.',
    body: (
      <>
        With <strong>all seven days on</strong>, guests get a calendar and tap each day they’re free. With <strong>only
        some days on</strong>, back-to-back days are bundled into a block. Each Fri–Sun is <strong>one tap</strong> that
        marks all three days. If the window starts or ends mid-block (say, on a Saturday), that edge block is shorter.
      </>
    ),
    figure: (
      <div className="guide-figure guide-compare">
        <div>
          <h4>All 7 days on</h4>
          <MiniCal mode="all" picks={['2026-07-10', '2026-07-11', '2026-07-18']} />
        </div>
        <div>
          <h4>Fri–Sun on</h4>
          <MiniBlocks picked={1} />
        </div>
      </div>
    ),
    alt: 'Side by side: a calendar where single days are picked, and a list of Friday-to-Sunday blocks with one picked.',
  },
  {
    eyebrow: 'Picking the winner',
    title: 'Your dashboard ranks the same choices.',
    body: (
      <>
        Your private dashboard ranks the choices guests saw by <strong>how many people are free on every day</strong> of
        them. Someone who can only make Saturday doesn’t count toward a Fri–Sun block. Pick one, lock it in, and everyone
        with the guest link sees the final date.
      </>
    ),
    figure: (
      <div className="guide-figure">
        <div className="option-grid" aria-hidden="true">
          <div className="option-card is-best">
            <span className="option-label">★ Best pick</span>
            <span className="option-dates">Jul 17 – Jul 19</span>
            <span className="option-meta">7 of 9 free every day</span>
          </div>
          <div className="option-card">
            <span className="option-label">#2</span>
            <span className="option-dates">Jul 10 – Jul 12</span>
            <span className="option-meta">5 of 9 free every day</span>
          </div>
        </div>
      </div>
    ),
    alt: 'Two ranked option cards: Jul 17–19 best with 7 of 9 free, Jul 10–12 second with 5 of 9.',
  },
];

export default function DatesGuide({ open, onClose, preview }) {
  const ref = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStep(0);
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
    }
  }, [open]);

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <dialog
      ref={ref}
      className="guide"
      aria-labelledby="guide-title"
      onClose={onClose}
      onCancel={e => { e.preventDefault(); onClose(); }}
      onClick={e => { if (e.target === ref.current) onClose(); }}
    >
      <div className="guide-inner">
        <div className="guide-head">
          <p className="chapter chapter-sm">
            <span className="chapter-num">{String(step + 1).padStart(2, '0')}</span>
            <span className="eyebrow">{s.eyebrow}</span>
          </p>
          <button type="button" className="guide-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <h2 id="guide-title" className="guide-title">{s.title}</h2>
        <p className="guide-body">{s.body}</p>
        <figure role="img" aria-label={s.alt} style={{ margin: 0 }}>{s.figure}</figure>

        {preview?.status === 'ok' && (step >= 2) && (
          <p className="guide-yours"><span aria-hidden="true">✓ </span>With your settings: {preview.headline}</p>
        )}

        <div className="guide-foot">
          <div className="guide-dots">
            {STEPS.map((x, i) => (
              <button
                key={x.eyebrow}
                type="button"
                className="guide-dot"
                aria-label={`Step ${i + 1}: ${x.eyebrow}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
            {last
              ? <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
              : <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>Next</button>}
          </div>
        </div>
      </div>
    </dialog>
  );
}

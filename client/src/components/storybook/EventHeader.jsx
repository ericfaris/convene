import { formatRange } from '../../lib/dates.js';

// The invitation-style masthead at the top of every event page.
export default function EventHeader({ event, eyebrow, actions }) {
  return (
    <header className="card masthead">
      <div className="masthead-top">
        <p className="eyebrow" style={{ margin: 0 }}>{eyebrow}</p>
        <span className={`tag tag-${event.status}`}>{event.status}</span>
      </div>
      <h1 className="masthead-title">{event.name}</h1>
      {event.description && <p className="masthead-desc">{event.description}</p>}
      <div className="masthead-meta">
        <span className="sticker">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1.5" y="2.5" width="13" height="12" rx="2.5" />
            <path d="M1.5 6.5h13M5 1v3M11 1v3" strokeLinecap="round" />
          </svg>
          {formatRange(event.dateWindow.start, event.dateWindow.end)}
        </span>
        {actions && <div className="masthead-actions">{actions}</div>}
      </div>
    </header>
  );
}

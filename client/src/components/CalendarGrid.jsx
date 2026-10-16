import { formatDay, toISO } from '../lib/dates.js';
import { guestOptions } from '../lib/schedule.js';
import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Grouped button mode (when allowedDays is a subset) ---

function formatDate(dateStr, opts) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', opts);
}

function groupLabel(dates) {
  const opts = { weekday: 'short', month: 'long', day: 'numeric' };
  if (dates.length === 1) return formatDate(dates[0], opts);
  return `${formatDate(dates[0], opts)} – ${formatDate(dates[dates.length - 1], opts)}`;
}

function GroupedButtons({ dateWindow, allowedDays, selected, onToggleGroup, disabled }) {
  const groups = useMemo(
    () => guestOptions(dateWindow, allowedDays).blocks,
    [dateWindow.start, dateWindow.end, allowedDays.join(',')]
  );

  let lastMonth = null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {groups.map((dates, i) => {
        const allSelected = dates.every(d => selected.has(d));
        const someSelected = !allSelected && dates.some(d => selected.has(d));
        const month = dates[0].slice(0, 7);
        const showMonthLabel = month !== lastMonth;
        lastMonth = month;
        const monthLabel = showMonthLabel
          ? formatDate(dates[0], { month: 'long', year: 'numeric' })
          : null;

        return (
          <div key={i}>
            {monthLabel && (
              <div style={{
                fontWeight: 800,
                fontSize: '.8rem',
                color: 'var(--text-muted)',
                margin: '16px 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
              }}>
                {monthLabel}
              </div>
            )}
            <button
              type="button"
              aria-pressed={allSelected ? true : someSelected ? 'mixed' : false}
              onClick={() => !disabled && onToggleGroup(dates)}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '2px solid',
                borderColor: allSelected ? 'var(--green)' : someSelected ? 'var(--primary-light)' : 'var(--border)',
                borderRadius: 12,
                background: allSelected ? 'var(--green)' : someSelected ? 'var(--primary-pale)' : disabled ? 'var(--gray-light)' : '#fff',
                color: allSelected ? '#fff' : someSelected ? 'var(--primary-dark)' : disabled ? 'var(--text-faint)' : 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: allSelected ? '0 2px 8px rgba(101,163,13,.2)' : 'none',
              }}
            >
              <span>{groupLabel(dates)}</span>
              {allSelected && <span style={{ fontSize: '.9rem' }}>✓</span>}
              {someSelected && <span style={{ fontSize: '.75rem', opacity: .7 }}>partial</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// --- Full grid mode ---

function buildWeekRows(dateWindow) {
  const cols = [0, 1, 2, 3, 4, 5, 6];
  const start = new Date(dateWindow.start + 'T00:00:00');
  const end = new Date(dateWindow.end + 'T00:00:00');
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const rows = [];
  let lastMonth = null;

  while (cursor <= end) {
    const cells = [];
    let monthLabel = null;
    for (const dow of cols) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + dow);
      const dateStr = toISO(d);
      const inRange = dateStr >= dateWindow.start && dateStr <= dateWindow.end;
      if (inRange) {
        const month = dateStr.slice(0, 7);
        if (month !== lastMonth) {
          if (!monthLabel) monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          lastMonth = month;
        }
      }
      cells.push(inRange ? dateStr : null);
    }
    if (cells.some(c => c !== null)) rows.push({ cells, monthLabel });
    cursor.setDate(cursor.getDate() + 7);
  }
  return rows;
}

function FullGrid({ dateWindow, selected, onToggle, disabled }) {
  const rows = useMemo(() => buildWeekRows(dateWindow), [dateWindow.start, dateWindow.end]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: '.7rem',
            fontWeight: 800,
            color: 'var(--text-faint)',
            paddingBottom: 6,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}>
            {d}
          </div>
        ))}
      </div>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx}>
          {row.monthLabel && (
            <div style={{
              fontWeight: 800,
              fontSize: '.8rem',
              color: 'var(--text-muted)',
              margin: '14px 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              {row.monthLabel}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {row.cells.map((date, i) =>
              date ? (
                <button
                  key={date}
                  type="button"
                  aria-label={formatDay(date)}
                  aria-pressed={selected.has(date)}
                  onClick={() => !disabled && onToggle(date)}
                  disabled={disabled}
                  style={{
                    minHeight: 48, minWidth: 0,
                    border: '2px solid',
                    borderColor: selected.has(date) ? 'var(--green)' : 'var(--border)',
                    borderRadius: 10,
                    background: selected.has(date) ? 'var(--green)' : disabled ? 'var(--gray-light)' : '#fff',
                    color: selected.has(date) ? '#fff' : disabled ? 'var(--text-faint)' : 'var(--text)',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '.9rem',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all .12s',
                    boxShadow: selected.has(date) ? '0 2px 6px rgba(101,163,13,.25)' : 'none',
                  }}
                >
                  {parseInt(date.slice(8), 10)}
                </button>
              ) : <div key={`e-${rowIdx}-${i}`} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main export ---

export default function CalendarGrid({ dateWindow, selected, onToggle, onToggleGroup, disabled = false, allowedDays = [] }) {
  const useGrouped = guestOptions(dateWindow, allowedDays).mode === 'blocks';

  if (useGrouped) {
    return (
      <GroupedButtons
        dateWindow={dateWindow}
        allowedDays={allowedDays}
        selected={selected}
        onToggleGroup={onToggleGroup || (() => {})}
        disabled={disabled}
      />
    );
  }

  return (
    <FullGrid
      dateWindow={dateWindow}
      selected={selected}
      onToggle={onToggle || (() => {})}
      disabled={disabled}
    />
  );
}

import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Grouped button mode (when allowedDays is a subset) ---

function generateFilteredDates(start, end, allowedDays) {
  const allowed = new Set(allowedDays);
  const dates = [];
  const cur = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  while (cur <= endDate) {
    if (allowed.has(cur.getDay())) dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function groupConsecutive(dates) {
  if (!dates.length) return [];
  const groups = [];
  let cur = [dates[0]];
  for (let i = 1; i < dates.length; i++) {
    const d1 = new Date(dates[i - 1] + 'T00:00:00');
    const d2 = new Date(dates[i] + 'T00:00:00');
    if ((d2 - d1) / 86400000 === 1) {
      cur.push(dates[i]);
    } else {
      groups.push(cur);
      cur = [dates[i]];
    }
  }
  groups.push(cur);
  return groups;
}

function formatDate(dateStr, opts) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', opts);
}

function groupLabel(dates) {
  const opts = { weekday: 'short', month: 'long', day: 'numeric' };
  if (dates.length === 1) return formatDate(dates[0], opts);
  return `${formatDate(dates[0], opts)} – ${formatDate(dates[dates.length - 1], opts)}`;
}

function GroupedButtons({ dateWindow, allowedDays, selected, onToggleGroup, disabled }) {
  const groups = useMemo(() => {
    const filtered = generateFilteredDates(dateWindow.start, dateWindow.end, allowedDays);
    return groupConsecutive(filtered);
  }, [dateWindow.start, dateWindow.end, allowedDays.join(',')]);

  // Track which month each group belongs to for labeling
  let lastMonth = null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#6b7280', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {monthLabel}
              </div>
            )}
            <button
              onClick={() => !disabled && onToggleGroup(dates)}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid',
                borderColor: allSelected ? '#16a34a' : someSelected ? '#86efac' : '#e5e7eb',
                borderRadius: 8,
                background: allSelected ? '#22c55e' : someSelected ? '#f0fdf4' : disabled ? '#f9fafb' : '#fff',
                color: allSelected ? '#fff' : someSelected ? '#15803d' : disabled ? '#9ca3af' : '#111827',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: allSelected ? 600 : 400,
                cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{groupLabel(dates)}</span>
              {allSelected && <span style={{ fontSize: '.85rem' }}>✓</span>}
              {someSelected && <span style={{ fontSize: '.75rem', opacity: .7 }}>partial</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// --- Full grid mode (when all days are shown) ---

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
      const dateStr = d.toISOString().split('T')[0];
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 600, color: '#6b7280', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
      </div>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx}>
          {row.monthLabel && (
            <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#374151', margin: '12px 0 6px' }}>
              {row.monthLabel}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
            {row.cells.map((date, i) =>
              date ? (
                <button
                  key={date}
                  onClick={() => !disabled && onToggle(date)}
                  disabled={disabled}
                  style={{
                    minHeight: 44, minWidth: 0,
                    border: '1px solid',
                    borderColor: selected.has(date) ? '#16a34a' : '#e5e7eb',
                    borderRadius: 6,
                    background: selected.has(date) ? '#22c55e' : disabled ? '#f3f4f6' : '#fff',
                    color: selected.has(date) ? '#fff' : disabled ? '#9ca3af' : '#111827',
                    fontWeight: selected.has(date) ? 600 : 400,
                    fontSize: '.875rem',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
  const useGrouped = allowedDays.length > 0 && allowedDays.length < 7;

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

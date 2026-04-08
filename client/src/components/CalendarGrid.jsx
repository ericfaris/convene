import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Builds week rows for the calendar, filtered to only show allowedDays columns.
// allowedDays = [] means all 7 days.
function buildWeekRows(dateWindow, allowedDays) {
  const cols = allowedDays.length > 0
    ? [...allowedDays].sort((a, b) => a - b)
    : [0, 1, 2, 3, 4, 5, 6];

  const start = new Date(dateWindow.start + 'T00:00:00');
  const end = new Date(dateWindow.end + 'T00:00:00');

  // Start from the Sunday on or before the first date
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
          if (!monthLabel) {
            monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }
          lastMonth = month;
        }
      }

      cells.push(inRange ? dateStr : null);
    }

    if (cells.some(c => c !== null)) {
      rows.push({ cells, monthLabel });
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return { cols, rows };
}

export default function CalendarGrid({ dateWindow, selected, onToggle, disabled = false, allowedDays = [] }) {
  const { cols, rows } = useMemo(
    () => buildWeekRows(dateWindow, allowedDays),
    [dateWindow.start, dateWindow.end, allowedDays.join(',')]
  );

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
        gap: 3,
        marginBottom: 4
      }}>
        {cols.map(dow => (
          <div key={dow} style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 600, color: '#6b7280', paddingBottom: 4 }}>
            {DAY_NAMES[dow]}
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
            gap: 3,
            marginBottom: 3
          }}>
            {row.cells.map((date, i) =>
              date ? (
                <button
                  key={date}
                  onClick={() => !disabled && onToggle(date)}
                  disabled={disabled}
                  aria-pressed={selected.has(date)}
                  style={{
                    minHeight: 44,
                    minWidth: 0,
                    border: '1px solid',
                    borderColor: selected.has(date) ? '#16a34a' : '#e5e7eb',
                    borderRadius: 6,
                    background: selected.has(date) ? '#22c55e' : disabled ? '#f3f4f6' : '#fff',
                    color: selected.has(date) ? '#fff' : disabled ? '#9ca3af' : '#111827',
                    fontWeight: selected.has(date) ? 600 : 400,
                    fontSize: '.875rem',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'background .1s, border-color .1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {parseInt(date.slice(8), 10)}
                </button>
              ) : (
                <div key={`e-${rowIdx}-${i}`} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

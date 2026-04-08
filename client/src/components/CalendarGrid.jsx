import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateDates(start, end) {
  const dates = [];
  const current = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function groupByMonth(dates) {
  const months = new Map();
  for (const d of dates) {
    const key = d.slice(0, 7); // "YYYY-MM"
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(d);
  }
  return months;
}

function MonthGrid({ monthKey, dates, selected, onToggle, disabled }) {
  const firstDate = new Date(dates[0] + 'T00:00:00');
  const startDow = firstDate.getDay();
  const label = firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells = [...Array(startDow).fill(null), ...dates];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 600, color: '#6b7280', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
        {cells.map((date, i) =>
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
            <div key={`e-${i}`} />
          )
        )}
      </div>
    </div>
  );
}

export default function CalendarGrid({ dateWindow, selected, onToggle, disabled = false }) {
  const months = useMemo(
    () => groupByMonth(generateDates(dateWindow.start, dateWindow.end)),
    [dateWindow.start, dateWindow.end]
  );

  return (
    <div>
      {[...months.entries()].map(([key, dates]) => (
        <MonthGrid
          key={key}
          monthKey={key}
          dates={dates}
          selected={selected}
          onToggle={onToggle}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

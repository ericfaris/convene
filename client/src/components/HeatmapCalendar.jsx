import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function heatColor(count, max) {
  if (!count) return '#f3f4f6';
  const t = max > 0 ? count / max : 0;
  if (t < 0.25) return '#dbeafe';
  if (t < 0.5)  return '#93c5fd';
  if (t < 0.75) return '#3b82f6';
  return '#1d4ed8';
}

function textColor(count, max) {
  if (!count) return '#9ca3af';
  const t = max > 0 ? count / max : 0;
  return t >= 0.5 ? '#fff' : '#1e3a8a';
}

function buildFinalizedSet(finalizedDates) {
  if (!finalizedDates?.start || !finalizedDates?.end) return new Set();
  const s = new Set();
  const cur = new Date(finalizedDates.start + 'T00:00:00');
  const end = new Date(finalizedDates.end + 'T00:00:00');
  while (cur <= end) {
    s.add(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return s;
}

function buildWeekRows(dateWindow, allowedDays) {
  const cols = allowedDays.length > 0
    ? [...allowedDays].sort((a, b) => a - b)
    : [0, 1, 2, 3, 4, 5, 6];

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

export default function HeatmapCalendar({ dateWindow, heatmap, finalizedDates, allowedDays = [] }) {
  const { cols, rows } = useMemo(
    () => buildWeekRows(dateWindow, allowedDays),
    [dateWindow.start, dateWindow.end, allowedDays.join(',')]
  );
  const maxCount = Math.max(0, ...Object.values(heatmap));
  const finalizedSet = useMemo(() => buildFinalizedSet(finalizedDates), [finalizedDates]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.8rem', color: '#6b7280' }}>Families available:</span>
        {[0.25, 0.5, 0.75, 1].map(t => {
          const count = Math.round(t * maxCount);
          return (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem' }}>
              <span style={{ width: 16, height: 16, borderRadius: 3, background: heatColor(count, maxCount), display: 'inline-block', border: '1px solid #e5e7eb' }} />
              {count === maxCount ? `${count} (max)` : count}
            </span>
          );
        })}
        {finalizedDates?.start && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem' }}>
            <span style={{ width: 16, height: 16, borderRadius: 3, background: '#fbbf24', display: 'inline-block', border: '2px solid #f59e0b' }} />
            Finalized
          </span>
        )}
      </div>

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
                <div
                  key={date}
                  title={date + (heatmap[date] ? `: ${heatmap[date]} families` : '')}
                  style={{
                    minHeight: 44,
                    borderRadius: 6,
                    background: finalizedSet.has(date) ? '#fbbf24' : heatColor(heatmap[date] || 0, maxCount),
                    color: finalizedSet.has(date) ? '#78350f' : textColor(heatmap[date] || 0, maxCount),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.8rem',
                    border: finalizedSet.has(date) ? '2px solid #f59e0b' : '1px solid transparent',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{parseInt(date.slice(8), 10)}</div>
                  {heatmap[date] ? <div style={{ fontSize: '.65rem' }}>{heatmap[date]}</div> : null}
                </div>
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

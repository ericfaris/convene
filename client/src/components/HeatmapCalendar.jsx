import { useMemo } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function heatColor(count, max) {
  if (!count) return '#F5F0EB';
  const t = max > 0 ? count / max : 0;
  if (t < 0.25) return '#FEF3C7';
  if (t < 0.5)  return '#FED7AA';
  if (t < 0.75) return '#FB923C';
  return '#EA580C';
}

function textColor(count, max) {
  if (!count) return '#A8A29E';
  const t = max > 0 ? count / max : 0;
  return t >= 0.5 ? '#fff' : '#78350F';
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
      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.8rem', color: '#78716C', fontWeight: 600 }}>Families available:</span>
        {[0.25, 0.5, 0.75, 1].map(t => {
          const count = Math.round(t * maxCount);
          return (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem', fontWeight: 600, color: '#78716C' }}>
              <span style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: heatColor(count, maxCount),
                display: 'inline-block',
                border: '1px solid rgba(0,0,0,.06)',
              }} />
              {count === maxCount ? `${count} (max)` : count}
            </span>
          );
        })}
        {finalizedDates?.start && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem', fontWeight: 600, color: '#78716C' }}>
            <span style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: '#65A30D',
              display: 'inline-block',
              border: '2px solid #4D7C0F',
            }} />
            Finalized
          </span>
        )}
      </div>

      {/* Day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
        gap: 3,
        marginBottom: 4,
      }}>
        {cols.map(dow => (
          <div key={dow} style={{
            textAlign: 'center',
            fontSize: '.7rem',
            fontWeight: 800,
            color: '#A8A29E',
            paddingBottom: 6,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}>
            {DAY_NAMES[dow]}
          </div>
        ))}
      </div>

      {/* Calendar rows */}
      {rows.map((row, rowIdx) => (
        <div key={rowIdx}>
          {row.monthLabel && (
            <div style={{
              fontWeight: 800,
              fontSize: '.8rem',
              color: '#78716C',
              margin: '14px 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              {row.monthLabel}
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
            gap: 3,
            marginBottom: 3,
          }}>
            {row.cells.map((date, i) =>
              date ? (
                <div
                  key={date}
                  title={date + (heatmap[date] ? `: ${heatmap[date]} families available` : ': no responses')}
                  style={{
                    minHeight: 48,
                    borderRadius: 10,
                    background: finalizedSet.has(date) ? '#65A30D' : heatColor(heatmap[date] || 0, maxCount),
                    color: finalizedSet.has(date) ? '#fff' : textColor(heatmap[date] || 0, maxCount),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.8rem',
                    border: finalizedSet.has(date)
                      ? '2px solid #4D7C0F'
                      : '1px solid rgba(0,0,0,.04)',
                    boxShadow: finalizedSet.has(date) ? '0 2px 8px rgba(101,163,13,.25)' : 'none',
                    transition: 'all .1s',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{parseInt(date.slice(8), 10)}</div>
                  {heatmap[date] ? (
                    <div style={{ fontSize: '.65rem', fontWeight: 600, opacity: .85 }}>{heatmap[date]}</div>
                  ) : null}
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

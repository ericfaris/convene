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
    const key = d.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(d);
  }
  return months;
}

function MonthGrid({ dates, heatmap, maxCount, finalizedDates }) {
  const firstDate = new Date(dates[0] + 'T00:00:00');
  const startDow = firstDate.getDay();
  const label = firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const finalizedSet = useMemo(() => {
    if (!finalizedDates?.start || !finalizedDates?.end) return new Set();
    const s = new Set();
    const cur = new Date(finalizedDates.start + 'T00:00:00');
    const end = new Date(finalizedDates.end + 'T00:00:00');
    while (cur <= end) {
      s.add(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return s;
  }, [finalizedDates]);

  const cells = [...Array(startDow).fill(null), ...dates];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 600, color: '#6b7280', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
        {cells.map((date, i) =>
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
            <div key={`e-${i}`} />
          )
        )}
      </div>
    </div>
  );
}

export default function HeatmapCalendar({ dateWindow, heatmap, finalizedDates }) {
  const months = useMemo(
    () => groupByMonth(generateDates(dateWindow.start, dateWindow.end)),
    [dateWindow.start, dateWindow.end]
  );
  const maxCount = Math.max(0, ...Object.values(heatmap));

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
      {[...months.entries()].map(([key, dates]) => (
        <MonthGrid
          key={key}
          dates={dates}
          heatmap={heatmap}
          maxCount={maxCount}
          finalizedDates={finalizedDates}
        />
      ))}
    </div>
  );
}

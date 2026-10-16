// Human-friendly date labels for ISO day strings ("2026-07-12").
// Parsed as local dates so a day never shifts across a timezone boundary.

function parse(iso) {
  return new Date(`${iso}T00:00:00`);
}

/** "Sat, Jul 12" */
export function formatDay(iso) {
  return parse(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * "Jun 1 – Aug 31, 2026", "Dec 28, 2026 – Jan 3, 2027", or "Sat, Jul 12, 2026"
 * for a single day. Returns '' for missing input.
 */
export function formatRange(start, end) {
  if (!start) return '';
  const a = parse(start);
  if (!end || end === start) {
    return a.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  const b = parse(end);
  const md = { month: 'short', day: 'numeric' };
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.toLocaleDateString('en-US', md)} – ${b.toLocaleDateString('en-US', { ...md, year: 'numeric' })}`;
  }
  const mdy = { ...md, year: 'numeric' };
  return `${a.toLocaleDateString('en-US', mdy)} – ${b.toLocaleDateString('en-US', mdy)}`;
}

/** Local-calendar ISO day for a Date built from local parts (never toISOString, which shifts east of UTC). */
export function toISO(date) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

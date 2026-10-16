// CommonJS twin of client/src/lib/schedule.js (the subset the server needs).
// Keep the two in step: client/src/lib/schedule.parity.test.js runs both on
// the same inputs and fails if they disagree.
//
// UTC arithmetic on "YYYY-MM-DD" strings, so results never shift by a day.

const DAY_MS = 86400000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toMs = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const fromMs = ms => new Date(ms).toISOString().slice(0, 10);
const weekday = iso => new Date(toMs(iso)).getUTCDay();

function datesInWindow(start, end) {
  if (!ISO.test(start || '') || !ISO.test(end || '')) return [];
  const out = [];
  for (let ms = toMs(start); ms <= toMs(end); ms += DAY_MS) out.push(fromMs(ms));
  return out;
}

function normalizeDays(allowedDays) {
  const set = [...new Set((allowedDays || []).filter(d => d >= 0 && d <= 6))].sort((a, b) => a - b);
  return set.length === 7 ? [] : set;
}

/** The choices guests see: single days, or blocks of consecutive allowed days. */
function guestBlocks(dateWindow, allowedDays) {
  const all = datesInWindow(dateWindow && dateWindow.start, dateWindow && dateWindow.end);
  const days = normalizeDays(allowedDays);
  if (!days.length) return all.map(d => [d]);
  const allowed = new Set(days);
  const blocks = [];
  for (const d of all.filter(x => allowed.has(weekday(x)))) {
    const prev = blocks[blocks.length - 1];
    if (prev && toMs(d) - toMs(prev[prev.length - 1]) === DAY_MS) prev.push(d);
    else blocks.push([d]);
  }
  return blocks;
}

/** Top choices ranked by people free on every day of them (ties → earliest). */
function suggestWindows(dateWindow, allowedDays, responses, limit = 3) {
  const sets = (responses || []).map(r => new Set(r.availableDates || []));
  return guestBlocks(dateWindow, allowedDays)
    .map(b => ({
      start: b[0],
      end: b[b.length - 1],
      attendeeCount: sets.filter(s => b.every(d => s.has(d))).length,
    }))
    .filter(w => w.attendeeCount > 0)
    .sort((a, b) => b.attendeeCount - a.attendeeCount || (a.start < b.start ? -1 : 1))
    .slice(0, limit);
}

module.exports = { datesInWindow, normalizeDays, guestBlocks, suggestWindows };

// How a date window + days of the week turn into what guests pick from.
// Single source of truth for the create-form preview, the "How dates work"
// guide, the guest calendar, the results matrix and (via its CommonJS twin
// server/lib/schedule.js, kept in parity by schedule.parity.test.js) the
// organizer's suggested dates.
//
// All arithmetic is in UTC on "YYYY-MM-DD" strings, so it never shifts a day
// in any timezone.

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 86400000;
export const LONG_WINDOW_DAYS = 120;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toMs = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const fromMs = ms => new Date(ms).toISOString().slice(0, 10);
export const weekday = iso => new Date(toMs(iso)).getUTCDay();

/** Every date from start to end inclusive; [] if missing or reversed. */
export function datesInWindow(start, end) {
  if (!ISO.test(start || '') || !ISO.test(end || '')) return [];
  const out = [];
  for (let ms = toMs(start); ms <= toMs(end); ms += DAY_MS) out.push(fromMs(ms));
  return out;
}

/** [] and all-seven both mean "every day". Returns a sorted unique list or []. */
export function normalizeDays(allowedDays) {
  const set = [...new Set((allowedDays || []).filter(d => d >= 0 && d <= 6))].sort((a, b) => a - b);
  return set.length === 7 ? [] : set;
}

export const isEveryDay = allowedDays => normalizeDays(allowedDays).length === 0;

/**
 * Runs of consecutive weekdays, wrapping Sat→Sun (Fri, Sat, Sun is one run).
 * Returns arrays of weekday numbers in calendar order, e.g. [[1],[3],[5,6,0]].
 */
export function dayRuns(allowedDays) {
  const days = normalizeDays(allowedDays);
  if (!days.length) return [[0, 1, 2, 3, 4, 5, 6]];
  const has = new Set(days);
  const runs = [];
  const seen = new Set();
  for (const d of days) {
    if (seen.has(d) || has.has((d + 6) % 7)) continue; // not a run start
    const run = [];
    for (let x = d; has.has(x) && !seen.has(x); x = (x + 1) % 7) { run.push(x); seen.add(x); }
    runs.push(run);
  }
  return runs.sort((a, b) => ((a[0] + 6) % 7) - ((b[0] + 6) % 7)); // Monday-first reading order
}

/** "every day", "Fri–Sun", "Sat & Sun", "Mon, Wed & Fri–Sun" */
export function describeDays(allowedDays) {
  if (isEveryDay(allowedDays)) return 'every day';
  const runs = dayRuns(allowedDays);
  const parts = runs.map(run => {
    if (run.length === 1) return DAY_SHORT[run[0]];
    // "Sat & Sun" reads best alone; inside a list use a range so "&" stays unambiguous
    if (run.length === 2 && runs.length === 1) return `${DAY_SHORT[run[0]]} & ${DAY_SHORT[run[1]]}`;
    return `${DAY_SHORT[run[0]]}–${DAY_SHORT[run.at(-1)]}`;
  });
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} & ${parts.at(-1)}`;
}

/**
 * What guests pick from.
 *  - mode 'days':   every day is allowed → each date is its own choice.
 *  - mode 'blocks': a subset → consecutive allowed days bundle into one
 *                   choice (each Fri–Sun is one tap).
 * `partial` lists block indexes cut short by the window's edges.
 */
export function guestOptions(dateWindow, allowedDays) {
  const all = datesInWindow(dateWindow?.start, dateWindow?.end);
  const days = normalizeDays(allowedDays);
  if (!days.length) {
    return { mode: 'days', dates: all, blocks: all.map(d => [d]), partial: [] };
  }
  const allowed = new Set(days);
  const dates = all.filter(d => allowed.has(weekday(d)));
  const blocks = [];
  for (const d of dates) {
    const prev = blocks.at(-1);
    if (prev && toMs(d) - toMs(prev.at(-1)) === DAY_MS) prev.push(d);
    else blocks.push([d]);
  }
  const runLen = {};
  for (const run of dayRuns(days)) for (const d of run) runLen[d] = run.length;
  const partial = blocks
    .map((b, i) => (b.length < runLen[weekday(b[0])] ? i : -1))
    .filter(i => i >= 0);
  return { mode: 'blocks', dates, blocks, partial };
}

/** How many responders are free on every date of each block. */
export function blockScores(blocks, responses) {
  const sets = (responses || []).map(r => new Set(r.availableDates || []));
  return blocks.map(block => sets.filter(s => block.every(d => s.has(d))).length);
}

/**
 * The organizer's top suggestions: the choices guests actually saw, ranked
 * by how many people are free on every day of them (ties → earliest).
 * Choices nobody can make are left out.
 */
export function suggestWindows(dateWindow, allowedDays, responses, limit = 3) {
  const { blocks } = guestOptions(dateWindow, allowedDays);
  const scores = blockScores(blocks, responses);
  return blocks
    .map((b, i) => ({ start: b[0], end: b.at(-1), attendeeCount: scores[i] }))
    .filter(w => w.attendeeCount > 0)
    .sort((a, b) => b.attendeeCount - a.attendeeCount || (a.start < b.start ? -1 : 1))
    .slice(0, limit);
}

/** Noun for one guest choice: "date", "weekend" (blocks within Fri–Sun) or "block". */
export function choiceNoun(allowedDays) {
  const days = normalizeDays(allowedDays);
  if (!days.length) return 'date';
  const runs = dayRuns(days);
  if (runs.every(r => r.length === 1)) return 'date';
  if (days.every(d => d === 5 || d === 6 || d === 0)) return 'weekend';
  return 'block';
}

/** How many whole choices are selected (blocks count only when every day is picked). */
export function countChosen(dateWindow, allowedDays, selected) {
  const { blocks } = guestOptions(dateWindow, allowedDays);
  return blocks.filter(b => b.every(d => selected.has(d))).length;
}

const fmt = (iso, opts) => new Date(toMs(iso)).toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });
const longDay = iso => fmt(iso, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Plain-language preview for the create form.
 * { status: 'empty' | 'error' | 'ok', headline, detail, warnings[], options }
 */
export function previewWindow(dateWindow, allowedDays, today = fromMs(Date.now())) {
  const { start, end } = dateWindow || {};
  if (!start || !end) {
    return { status: 'empty', headline: 'Pick a start and end date to see what guests will get.', detail: '', warnings: [] };
  }
  if (end < start) {
    return { status: 'error', headline: 'The window ends before it starts.', detail: 'Move the end date to on or after the start date.', warnings: [] };
  }
  const options = guestOptions(dateWindow, allowedDays);
  const span = datesInWindow(start, end).length;
  const daysLabel = describeDays(allowedDays);
  if (!options.dates.length) {
    return {
      status: 'error',
      headline: `No ${daysLabel} falls inside this window.`,
      detail: 'Widen the window or turn on more days of the week.',
      warnings: [], options,
    };
  }

  const range = `${longDay(start)} and ${longDay(end)}`;
  let headline, detail;
  if (options.mode === 'days') {
    headline = `Guests will see a calendar of all ${plural(span, 'day')} between ${range}.`;
    detail = 'They tap each day they’re free. Every day is its own choice.';
  } else if (options.blocks.every(b => b.length === 1)) {
    headline = `Guests will see ${plural(options.blocks.length, 'date')} (${daysLabel} only) between ${range}.`;
    detail = 'Each date is its own tap. Other days of the week are hidden.';
  } else {
    headline = `Guests will see ${plural(options.blocks.length, `${daysLabel} block`)} between ${range}.`;
    detail = `Each block is one tap: tapping it marks every day in it. Other days of the week are hidden, and the organizer’s suggestions rank whole blocks.`;
  }

  const warnings = [];
  if (options.mode === 'blocks') {
    for (const i of options.partial) {
      const b = options.blocks[i];
      const which = i === 0 ? 'first' : i === options.blocks.length - 1 ? 'last' : 'one';
      const why = i === 0 ? `the window starts on a ${DAY_LONG[weekday(start)]}` : `the window ends on a ${DAY_LONG[weekday(end)]}`;
      const label = b.length === 1 ? DAY_SHORT[weekday(b[0])] : `${DAY_SHORT[weekday(b[0])]}–${DAY_SHORT[weekday(b.at(-1))]}`;
      warnings.push(`The ${which} block is only ${label} (${fmt(b[0], { month: 'short', day: 'numeric' })}) because ${why}.`);
    }
  }
  if (start < today) warnings.push('The window starts in the past. Guests can still pick those dates.');
  if (span > LONG_WINDOW_DAYS) warnings.push(`That’s a long window (${span} days). Guests will have a lot to scroll through.`);

  return { status: 'ok', headline, detail, warnings, options };
}

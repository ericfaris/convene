import { describe, it, expect } from 'vitest';
import {
  datesInWindow, normalizeDays, dayRuns, describeDays, guestOptions, suggestWindows,
  previewWindow, choiceNoun, countChosen,
} from './schedule.js';

const W = { start: '2026-07-01', end: '2026-07-19' }; // Wed Jul 1 … Sun Jul 19
const FRI_SUN = [5, 6, 0];

describe('days of the week', () => {
  it('treats [] and all seven as every day', () => {
    expect(normalizeDays([])).toEqual([]);
    expect(normalizeDays([0, 1, 2, 3, 4, 5, 6])).toEqual([]);
  });
  it('finds runs that wrap Saturday → Sunday', () => {
    expect(dayRuns(FRI_SUN)).toEqual([[5, 6, 0]]);
    expect(dayRuns([3, 5, 6, 0])).toEqual([[3], [5, 6, 0]]);
    expect(dayRuns([1, 3, 5, 6, 0])).toEqual([[3], [5, 6, 0, 1]]); // Mon follows Sun: a long weekend
  });
  it.each([
    [[], 'every day'], [FRI_SUN, 'Fri–Sun'], [[0, 6], 'Sat & Sun'], [[1, 2, 3, 4], 'Mon–Thu'],
    [[1, 3, 5], 'Mon, Wed & Fri'], [[1, 5, 6, 0], 'Fri–Mon'], [[2, 5, 6], 'Tue & Fri–Sat'],
  ])('describeDays(%j) → %s', (days, text) => expect(describeDays(days)).toBe(text));
  it.each([[[], 'date'], [FRI_SUN, 'weekend'], [[0, 6], 'weekend'], [[1, 2, 3, 4], 'block'], [[1, 3], 'date']])(
    'choiceNoun(%j) → %s', (days, noun) => expect(choiceNoun(days)).toBe(noun));
});

describe('guestOptions', () => {
  it('every day → one choice per day', () => {
    const o = guestOptions(W, []);
    expect(o.mode).toBe('days');
    expect(o.blocks).toHaveLength(19);
  });
  it('Fri–Sun → whole-weekend blocks, nothing else', () => {
    const o = guestOptions(W, FRI_SUN);
    expect(o.mode).toBe('blocks');
    expect(o.blocks.map(b => b.join(','))).toEqual([
      '2026-07-03,2026-07-04,2026-07-05', '2026-07-10,2026-07-11,2026-07-12', '2026-07-17,2026-07-18,2026-07-19',
    ]);
    expect(o.partial).toEqual([]);
  });
  it('flags blocks cut short by the window edges', () => {
    const o = guestOptions({ start: '2026-07-04', end: '2026-07-17' }, FRI_SUN); // starts Sat, ends Fri
    expect(o.blocks[0]).toEqual(['2026-07-04', '2026-07-05']);
    expect(o.blocks.at(-1)).toEqual(['2026-07-17']);
    expect(o.partial).toEqual([0, 2]);
  });
  it('is empty for a reversed window', () => {
    expect(guestOptions({ start: '2026-07-10', end: '2026-07-01' }, []).blocks).toEqual([]);
    expect(datesInWindow('2026-07-10', '2026-07-01')).toEqual([]);
  });
});

describe('suggestWindows / countChosen', () => {
  it('counts people free every day of a block, never person-days', () => {
    const res = suggestWindows(W, FRI_SUN, [
      { availableDates: ['2026-07-10', '2026-07-11', '2026-07-12'] },
      { availableDates: ['2026-07-10', '2026-07-11', '2026-07-12'] },
      { availableDates: ['2026-07-11'] },
    ]);
    expect(res).toEqual([{ start: '2026-07-10', end: '2026-07-12', attendeeCount: 2 }]);
  });
  it('counts only fully selected blocks', () => {
    const sel = new Set(['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-18']);
    expect(countChosen(W, FRI_SUN, sel)).toBe(1);
    expect(countChosen(W, [], sel)).toBe(4);
  });
});

describe('previewWindow', () => {
  const today = '2026-06-01';
  it('asks for dates when empty', () => {
    expect(previewWindow({ start: '', end: '' }, [], today).status).toBe('empty');
  });
  it('errors on a reversed window', () => {
    const p = previewWindow({ start: '2026-07-10', end: '2026-07-01' }, [], today);
    expect(p.status).toBe('error');
    expect(p.headline).toMatch(/ends before it starts/);
  });
  it('errors when no chosen weekday falls inside the window', () => {
    const p = previewWindow({ start: '2026-07-06', end: '2026-07-08' }, FRI_SUN, today); // Mon–Wed
    expect(p.status).toBe('error');
    expect(p.headline).toBe('No Fri–Sun falls inside this window.');
  });
  it('explains the every-day calendar', () => {
    const p = previewWindow(W, [], today);
    expect(p.headline).toBe('Guests will see a calendar of all 19 days between Wed, Jul 1, 2026 and Sun, Jul 19, 2026.');
  });
  it('explains blocks and one-tap behavior', () => {
    const p = previewWindow(W, FRI_SUN, today);
    expect(p.headline).toBe('Guests will see 3 Fri–Sun blocks between Wed, Jul 1, 2026 and Sun, Jul 19, 2026.');
    expect(p.detail).toMatch(/one tap/);
  });
  it('explains single-day subsets', () => {
    expect(previewWindow(W, [1, 3], today).headline).toMatch(/^Guests will see 5 dates \(Mon & Wed only\)/);
  });
  it('warns about short edge blocks, past starts and long windows', () => {
    const p = previewWindow({ start: '2026-07-04', end: '2026-07-17' }, FRI_SUN, '2026-07-10');
    expect(p.warnings).toEqual([
      'The first block is only Sat–Sun (Jul 4) because the window starts on a Saturday.',
      'The last block is only Fri (Jul 17) because the window ends on a Friday.',
      'The window starts in the past. Guests can still pick those dates.',
    ]);
    expect(previewWindow({ start: '2026-07-01', end: '2026-12-31' }, [], today).warnings[0]).toMatch(/long window \(184 days\)/);
  });
});

describe('timezone safety', () => {
  it('gives identical answers far east and far west of UTC', () => {
    const run = () => JSON.stringify([guestOptions(W, FRI_SUN), previewWindow(W, FRI_SUN, '2026-06-01').headline]);
    const orig = process.env.TZ;
    process.env.TZ = 'Pacific/Kiritimati'; const east = run();
    process.env.TZ = 'Pacific/Pago_Pago'; const west = run();
    process.env.TZ = orig;
    expect(east).toBe(west);
  });
});

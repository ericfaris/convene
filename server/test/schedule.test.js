const { test } = require('node:test');
const assert = require('node:assert/strict');
const { datesInWindow, normalizeDays, guestBlocks, suggestWindows } = require('../lib/schedule');

const W = { start: '2026-07-01', end: '2026-07-19' }; // Wed Jul 1 … Sun Jul 19
const FRI_SUN = [5, 6, 0];

test('datesInWindow is inclusive and rejects reversed/invalid windows', () => {
  assert.equal(datesInWindow('2026-07-01', '2026-07-03').join(), '2026-07-01,2026-07-02,2026-07-03');
  assert.deepEqual(datesInWindow('2026-07-03', '2026-07-01'), []);
  assert.deepEqual(datesInWindow('', '2026-07-01'), []);
  assert.equal(datesInWindow('2026-12-30', '2027-01-02').length, 4);
});

test('normalizeDays treats [] and all seven as every day', () => {
  assert.deepEqual(normalizeDays([]), []);
  assert.deepEqual(normalizeDays([6, 0, 1, 2, 3, 4, 5]), []);
  assert.deepEqual(normalizeDays([6, 5, 0, 5]), [0, 5, 6]);
});

test('guestBlocks: every day → one choice per day', () => {
  assert.equal(guestBlocks(W, []).length, 19);
});

test('guestBlocks: Fri–Sun → whole weekends, wrapping Sat→Sun', () => {
  assert.deepEqual(guestBlocks(W, FRI_SUN), [
    ['2026-07-03', '2026-07-04', '2026-07-05'],
    ['2026-07-10', '2026-07-11', '2026-07-12'],
    ['2026-07-17', '2026-07-18', '2026-07-19'],
  ]);
});

test('suggestWindows counts people free on EVERY day of a block (not person-days)', () => {
  const responses = [
    { availableDates: ['2026-07-10', '2026-07-11', '2026-07-12'] },
    { availableDates: ['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-17'] },
    { availableDates: ['2026-07-17', '2026-07-18', '2026-07-19'] },
  ];
  assert.deepEqual(suggestWindows(W, FRI_SUN, responses), [
    { start: '2026-07-10', end: '2026-07-12', attendeeCount: 2 },
    { start: '2026-07-17', end: '2026-07-19', attendeeCount: 1 },
  ]);
});

test('suggestWindows respects the allowed days (no Sat–Mon windows when only Sat/Sun allowed)', () => {
  const res = suggestWindows(W, [6, 0], [{ availableDates: ['2026-07-11', '2026-07-12', '2026-07-13'] }]);
  assert.deepEqual(res, [{ start: '2026-07-11', end: '2026-07-12', attendeeCount: 1 }]);
});

test('suggestWindows on an every-day event ranks single days, ties earliest first', () => {
  const res = suggestWindows(W, [], [
    { availableDates: ['2026-07-04', '2026-07-09'] },
    { availableDates: ['2026-07-09', '2026-07-02'] },
  ]);
  assert.deepEqual(res.map(r => [r.start, r.attendeeCount]), [['2026-07-09', 2], ['2026-07-02', 1], ['2026-07-04', 1]]);
});

test('suggestWindows leaves out choices nobody can make', () => {
  assert.deepEqual(suggestWindows(W, FRI_SUN, []), []);
});

test('no timezone drift: same answer in UTC+14 and UTC-11', () => {
  const run = () => JSON.stringify(guestBlocks(W, FRI_SUN));
  const orig = process.env.TZ;
  process.env.TZ = 'Pacific/Kiritimati'; const east = run();
  process.env.TZ = 'Pacific/Pago_Pago'; const west = run();
  process.env.TZ = orig;
  assert.equal(east, west);
});

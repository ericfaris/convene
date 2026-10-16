// The server keeps a CommonJS twin of the scheduling logic (the Docker build
// copies client/ and server/ separately, so they can't share a file). This
// keeps the two from drifting.
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import * as client from './schedule.js';

const server = createRequire(import.meta.url)('../../../server/lib/schedule.js');

const windows = [
  { start: '2026-07-01', end: '2026-07-31' },
  { start: '2026-07-04', end: '2026-07-17' },
  { start: '2026-12-26', end: '2027-01-10' },
  { start: '2026-02-20', end: '2026-03-05' },
  { start: '2026-07-10', end: '2026-07-01' },
];
const daySets = [[], [0, 1, 2, 3, 4, 5, 6], [5, 6, 0], [0, 6], [1, 2, 3, 4], [1, 3, 5], [2], [1, 5, 6, 0]];

describe('server/lib/schedule.js matches client/src/lib/schedule.js', () => {
  for (const w of windows) {
    for (const days of daySets) {
      it(`${w.start}…${w.end} ${JSON.stringify(days)}`, () => {
        expect(server.guestBlocks(w, days)).toEqual(client.guestOptions(w, days).blocks);
        const all = client.datesInWindow(w.start, w.end);
        const responses = [
          { availableDates: all.filter((_, i) => i % 2 === 0) },
          { availableDates: all.slice(0, 9) },
          { availableDates: all },
        ];
        expect(server.suggestWindows(w, days, responses)).toEqual(client.suggestWindows(w, days, responses));
      });
    }
  }
});

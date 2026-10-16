import { describe, it, expect } from 'vitest';
import { formatDay, formatRange } from './dates.js';

describe('formatDay', () => {
  it('formats an ISO day without timezone drift', () => {
    expect(formatDay('2026-07-12')).toBe('Sun, Jul 12');
    expect(formatDay('2026-01-01')).toBe('Thu, Jan 1');
  });
});

describe('formatRange', () => {
  it('shares the year within one year', () => {
    expect(formatRange('2026-06-01', '2026-08-31')).toBe('Jun 1 – Aug 31, 2026');
  });
  it('spells out both years across a new year', () => {
    expect(formatRange('2026-12-28', '2027-01-03')).toBe('Dec 28, 2026 – Jan 3, 2027');
  });
  it('treats a single day (or missing end) as one date', () => {
    expect(formatRange('2026-07-12', '2026-07-12')).toBe('Sun, Jul 12, 2026');
    expect(formatRange('2026-07-12')).toBe('Sun, Jul 12, 2026');
  });
  it('returns an empty string for missing input', () => {
    expect(formatRange(undefined, undefined)).toBe('');
  });
});

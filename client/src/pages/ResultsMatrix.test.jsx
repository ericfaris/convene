import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResultsMatrix from './ResultsMatrix.jsx';
import { ART } from '../components/storybook/art.js';
import * as api from '../api/client.js';

vi.mock('../api/client.js', () => ({ getEvent: vi.fn() }));

const event = (attendeeResponses = {}) => ({
  name: 'Summer Reunion', status: 'open',
  dateWindow: { start: '2026-07-10', end: '2026-07-19' },
  attendees: ['Jane', 'Roy', 'Betty'],
  allowedDays: [5, 6, 0],
  attendeeResponses,
});

const renderResults = () => render(
  <MemoryRouter initialEntries={['/e/tok/results']}>
    <Routes><Route path="/e/:token/results" element={<ResultsMatrix />} /></Routes>
  </MemoryRouter>
);

describe('ResultsMatrix', () => {
  beforeEach(() => vi.mocked(api.getEvent).mockReset());
  afterEach(cleanup);

  it('shows an empty moment and no matrix when nobody has replied', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(event());
    renderResults();
    expect(await screen.findByAltText(ART.noReplies.alt)).toBeTruthy();
    expect(screen.getByText('0 of 3 replied')).toBeTruthy();
    expect(document.querySelector('table')).toBeNull();
  });

  it('highlights the best weekend so far as a green sticker and lists who is missing', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(event({
      Jane: { availableDates: ['2026-07-17', '2026-07-18', '2026-07-19'] },
      Roy:  { availableDates: ['2026-07-17', '2026-07-18', '2026-07-19'] },
    }));
    renderResults();
    const sticker = (await screen.findByText('Best so far')).closest('.sticker');
    expect(sticker.className).toMatch(/sticker-green/);
    expect(sticker.textContent).toContain('Fri, Jul 17 – Sun, Jul 19');
    expect(sticker.textContent).toContain('2 of 3 free');
    expect(screen.getByText('Still waiting on: Betty')).toBeTruthy();
    expect(document.querySelector('table')).toBeTruthy();
  });
});

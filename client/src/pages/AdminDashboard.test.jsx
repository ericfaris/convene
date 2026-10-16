import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import { ART } from '../components/storybook/art.js';
import * as api from '../api/client.js';

vi.mock('../api/client.js', () => ({
  getAdminDashboard: vi.fn(), finalizeEvent: vi.fn(), addAttendee: vi.fn(),
}));

const dashboard = (over = {}) => ({
  event: {
    name: 'Summer Reunion', status: 'open', participantToken: 'ptok',
    dateWindow: { start: '2026-07-01', end: '2026-07-31' },
    attendees: ['Jane', 'Roy', 'Betty'], allowedDays: [], ...over.event,
  },
  responses: over.responses ?? [{ attendeeName: 'Jane', availableDates: ['2026-07-11', '2026-07-12'], notes: '' }],
  heatmap: over.heatmap ?? { '2026-07-11': 1, '2026-07-12': 1 },
  suggestedWindows: over.suggestedWindows ?? [
    { start: '2026-07-11', end: '2026-07-12', attendeeCount: 1 },
    { start: '2026-07-18', end: '2026-07-19', attendeeCount: 0 },
  ],
});

const renderAdmin = () => render(
  <MemoryRouter initialEntries={['/admin/atok']}>
    <Routes><Route path="/admin/:token" element={<AdminDashboard />} /></Routes>
  </MemoryRouter>
);

describe('AdminDashboard', () => {
  beforeEach(() => { Object.values(api).forEach(fn => fn.mockReset?.()); });
  afterEach(cleanup);

  it('shows the organizer masthead, progress and a printed best pick', async () => {
    vi.mocked(api.getAdminDashboard).mockResolvedValue(dashboard());
    renderAdmin();
    expect(await screen.findByRole('heading', { level: 1, name: 'Summer Reunion' })).toBeTruthy();
    expect(screen.getByText(/Organizer view/)).toBeTruthy();
    expect(screen.getByText('1 of 3 people responded')).toBeTruthy();
    const best = screen.getByText('★ Best pick').closest('.option-card');
    expect(best.className).toMatch(/is-best/);
    expect(best.textContent).toContain('Jul 11 – Jul 12, 2026');
    expect(screen.queryByAltText(ART.noReplies.alt)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Who’s free when' })).toBeTruthy();
  });

  it('"Use these dates" pre-fills the finalize form', async () => {
    vi.mocked(api.getAdminDashboard).mockResolvedValue(dashboard());
    renderAdmin();
    fireEvent.click((await screen.findAllByRole('button', { name: 'Use these dates' }))[0]);
    expect(screen.getByLabelText('Start date').value).toBe('2026-07-11');
    expect(screen.getByLabelText('End date').value).toBe('2026-07-12');
  });

  it('shows the no-replies moment with a copy-link CTA when nobody has answered', async () => {
    vi.mocked(api.getAdminDashboard).mockResolvedValue(dashboard({ responses: [], heatmap: {}, suggestedWindows: [] }));
    renderAdmin();
    expect(await screen.findByAltText(ART.noReplies.alt)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Send the guest link/ })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Copy guest link' }).length).toBe(2);
    expect(screen.queryByRole('heading', { name: 'Who’s free when' })).toBeNull();
  });

  it('celebrates a finalized event and hides finalize controls', async () => {
    vi.mocked(api.getAdminDashboard).mockResolvedValue(dashboard({
      event: { status: 'finalized', finalizedDates: { start: '2026-07-11', end: '2026-07-12' } },
    }));
    renderAdmin();
    expect(await screen.findByRole('heading', { name: 'It’s on the calendar.' })).toBeTruthy();
    expect(screen.getByAltText(ART.finalized.alt)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Finalize dates' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Use these dates' })).toBeNull();
  });

  it('shows the lost moment for a bad admin link', async () => {
    vi.mocked(api.getAdminDashboard).mockRejectedValue(new Error('Invalid admin token'));
    renderAdmin();
    expect(await screen.findByRole('heading', { level: 1, name: /couldn’t find that dashboard/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Start a new gathering' }).getAttribute('href')).toBe('/new');
  });
});

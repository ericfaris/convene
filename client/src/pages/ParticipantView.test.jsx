import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ParticipantView from './ParticipantView.jsx';
import { ART } from '../components/storybook/art.js';
import * as api from '../api/client.js';

vi.mock('../api/client.js', () => ({ getEvent: vi.fn(), submitResponse: vi.fn() }));

const baseEvent = () => ({
  name: 'Summer Reunion',
  description: 'Lake house',
  status: 'open',
  dateWindow: { start: '2026-07-01', end: '2026-07-14' },
  attendees: ['Jane', 'Roy & Katy'],
  respondedAttendees: ['Roy & Katy'],
  attendeeResponses: { 'Roy & Katy': { availableDates: ['2026-07-04'], notes: '' } },
  allowedDays: [],
});

function renderAt(path = '/e/tok') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/e/:token" element={<ParticipantView />} />
        <Route path="/e/:token/results" element={<p>results-page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ParticipantView', () => {
  beforeEach(() => { vi.mocked(api.getEvent).mockReset(); vi.mocked(api.submitResponse).mockReset(); });
  afterEach(cleanup);

  it('opens on an invitation masthead and the attendee picker (step 01)', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(baseEvent());
    renderAt();
    expect(await screen.findByRole('heading', { level: 1, name: 'Summer Reunion' })).toBeTruthy();
    expect(screen.getByText('You’re invited')).toBeTruthy();
    expect(screen.getByText('Jul 1 – Jul 14, 2026')).toBeTruthy();
    expect(document.querySelector('.chapter .chapter-num').textContent).toBe('01');
    expect(screen.getByRole('heading', { name: 'Who are you?' })).toBeTruthy();
    const roy = screen.getByRole('button', { name: /Roy & Katy/ });
    expect(roy.className).toMatch(/is-done/);
    expect(screen.getByText('Planned with Convene ·')).toBeTruthy();
  });

  it('walks list → dates → submit → thank-you moment, and lets them change dates', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(baseEvent());
    vi.mocked(api.submitResponse).mockResolvedValue({});
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: 'Jane' }));
    expect(document.querySelector('.chapter .chapter-num').textContent).toBe('02');
    expect(screen.getByRole('heading', { name: /Hi, Jane!/ })).toBeTruthy();
    const send = screen.getByRole('button', { name: 'Send my availability' });
    expect(send.disabled).toBe(true);

    fireEvent.click(screen.getAllByRole('button', { name: /^4$|Jul 4|Sat.*4/ })[0]);
    expect(send.disabled).toBe(false);
    fireEvent.click(send);

    expect(await screen.findByRole('heading', { name: 'Thanks, Jane!' })).toBeTruthy();
    expect(screen.getByAltText(ART.thanks.alt)).toBeTruthy();
    expect(screen.getByText(/1 date saved/)).toBeTruthy();
    expect(api.submitResponse).toHaveBeenCalledWith('tok', expect.objectContaining({ attendeeName: 'Jane', availableDates: ['2026-07-04'] }));

    fireEvent.click(screen.getByRole('button', { name: 'Change my dates' }));
    expect(screen.getByRole('heading', { name: /Update your picks, Jane/ })).toBeTruthy();
  });

  it('keeps the form on screen when a submit fails (regression: used to blank the page)', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(baseEvent());
    vi.mocked(api.submitResponse).mockRejectedValue(new Error('Server error'));
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: 'Jane' }));
    fireEvent.click(screen.getAllByRole('button', { name: /^4$|Jul 4|Sat.*4/ })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Send my availability' }));
    expect(await screen.findByText('Server error')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send my availability' })).toBeTruthy();
  });

  it('shows the finalized moment with the date as a green sticker', async () => {
    vi.mocked(api.getEvent).mockResolvedValue({
      ...baseEvent(), status: 'finalized', finalizedDates: { start: '2026-07-11', end: '2026-07-12' },
    });
    renderAt();
    expect(await screen.findByRole('heading', { name: /It’s happening/ })).toBeTruthy();
    expect(screen.getByAltText(ART.finalized.alt)).toBeTruthy();
    expect(screen.getByText('Jul 11 – Jul 12, 2026').closest('.sticker-green')).toBeTruthy();
  });

  it('shows the waiting moment when responses are closed', async () => {
    vi.mocked(api.getEvent).mockResolvedValue({ ...baseEvent(), status: 'closed' });
    renderAt();
    expect(await screen.findByRole('heading', { name: 'Waiting on the organizer.' })).toBeTruthy();
    expect(screen.getByAltText(ART.waiting.alt)).toBeTruthy();
  });

  it('shows the lost moment for an unknown link', async () => {
    vi.mocked(api.getEvent).mockRejectedValue(new Error('Event not found'));
    renderAt();
    expect(await screen.findByRole('heading', { level: 1, name: /couldn’t find that gathering/ })).toBeTruthy();
    expect(screen.getByAltText(ART.lost.alt)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'What is Convene?' }).getAttribute('href')).toBe('/');
  });

  it('header "See results" goes to the results page', async () => {
    vi.mocked(api.getEvent).mockResolvedValue(baseEvent());
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: 'See results' }));
    await waitFor(() => expect(screen.getByText('results-page')).toBeTruthy());
  });
});

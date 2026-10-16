import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateEvent from './CreateEvent.jsx';
import { ART } from '../components/storybook/art.js';
import * as api from '../api/client.js';

vi.mock('../api/client.js', () => ({ createEvent: vi.fn() }));

const renderCreate = () => render(<MemoryRouter><CreateEvent /></MemoryRouter>);

describe('CreateEvent', () => {
  beforeEach(() => vi.mocked(api.createEvent).mockReset());
  afterEach(cleanup);

  it('frames the form as step 01 · Suggest with labelled fields', () => {
    renderCreate();
    expect(screen.getByRole('heading', { level: 1, name: 'Suggest a window.' })).toBeTruthy();
    expect(document.querySelector('.chapter-num').textContent).toBe('01');
    expect(screen.getByLabelText('Event Name *')).toBeTruthy();
    expect(screen.getByLabelText('Window start *')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'When could it happen?' })).toBeTruthy();
  });

  it('has no "Load Defaults" shortcut (removed: it leaked a hard-coded guest list)', () => {
    renderCreate();
    expect(screen.queryByRole('button', { name: /load defaults/i })).toBeNull();
    expect(screen.getByLabelText('Attendee 1 name').value).toBe('');
  });

  it('day pills expose pressed state and refuse to deselect the last day', () => {
    renderCreate();
    const group = screen.getByRole('group', { name: 'Days of the week guests can pick' });
    const pills = [...group.querySelectorAll('.toggle-pill')];
    expect(pills.filter(p => p.getAttribute('aria-pressed') === 'true')).toHaveLength(7);
    pills.slice(0, 6).forEach(p => fireEvent.click(p));
    const sat = screen.getByRole('button', { name: 'Saturday' });
    expect(sat.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(sat);
    expect(sat.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Only Sat appear/)).toBeTruthy();
  });

  it('refuses to submit a window that ends before it starts, without calling the API', () => {
    renderCreate();
    fireEvent.change(screen.getByLabelText('Event Name *'), { target: { value: 'Reunion' } });
    fireEvent.change(screen.getByLabelText('Window start *'), { target: { value: '2026-07-31' } });
    fireEvent.change(screen.getByLabelText('Window end *'), { target: { value: '2026-07-01' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create my gathering' }).closest('form'));
    expect(api.createEvent).not.toHaveBeenCalled();
    expect(screen.getAllByText(/The window ends before it starts/).length).toBeGreaterThan(0);
  });

  it('shows the all-set moment with both links after creating', async () => {
    vi.mocked(api.createEvent).mockResolvedValue({
      participantUrl: 'https://x/e/p', adminUrl: 'https://x/admin/a',
    });
    renderCreate();
    fireEvent.change(screen.getByLabelText('Event Name *'), { target: { value: 'Reunion' } });
    fireEvent.change(screen.getByLabelText('Window start *'), { target: { value: '2026-07-01' } });
    fireEvent.change(screen.getByLabelText('Window end *'), { target: { value: '2026-07-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create my gathering' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'You’re all set!' })).toBeTruthy();
    expect(screen.getByAltText(ART.allSet.alt)).toBeTruthy();
    expect(screen.getByLabelText(/Guest link/).value).toBe('https://x/e/p');
    expect(screen.getByLabelText(/Admin link/).value).toBe('https://x/admin/a');
  });
});

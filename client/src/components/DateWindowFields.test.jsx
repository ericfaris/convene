import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { useState } from 'react';
import DateWindowFields from './DateWindowFields.jsx';

function Harness({ start = '2026-07-01', end = '2026-07-19', days = [0, 1, 2, 3, 4, 5, 6] }) {
  const [w, setW] = useState({ start, end });
  const [d, setD] = useState(days);
  return <DateWindowFields dateWindow={w} allowedDays={d} onWindowChange={setW} onDaysChange={setD} />;
}

const preview = () => document.querySelector('.preview');

describe('DateWindowFields', () => {
  afterEach(cleanup);

  it('labels start/end explicitly as inclusive first/last pickable days', () => {
    render(<Harness />);
    const start = screen.getByLabelText('Window start *');
    expect(document.getElementById(start.getAttribute('aria-describedby')).textContent)
      .toBe('First day guests can pick (included).');
    const end = screen.getByLabelText('Window end *');
    expect(document.getElementById(end.getAttribute('aria-describedby')).textContent)
      .toBe('Last day guests can pick (included).');
    expect(end.getAttribute('min')).toBe('2026-07-01');
  });

  it('previews the every-day calendar by default', () => {
    render(<Harness />);
    expect(preview().textContent).toContain('Guests will see a calendar of all 19 days');
    expect(screen.getByText(/All 7 days are on/)).toBeTruthy();
    expect(within(preview()).getByText('+15 more')).toBeTruthy();
  });

  it('the Fri–Sun preset switches the preview to one-tap weekend blocks and says what is hidden', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Weekends (Fri–Sun)' }));
    expect(screen.getByRole('button', { name: 'Weekends (Fri–Sun)' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Monday' }).getAttribute('aria-pressed')).toBe('false');
    expect(preview().textContent).toContain('Guests will see 3 Fri–Sun blocks');
    expect(screen.getByText(/each Fri–Sun weekend is one tap/)).toBeTruthy();
    expect(screen.getByText(/Monday, Tuesday, Wednesday and Thursday won’t appear at all/)).toBeTruthy();
    expect(within(preview()).getByText('Fri Jul 3 – Sun Jul 5')).toBeTruthy();
  });

  it('marks short edge blocks and explains why', () => {
    render(<Harness start="2026-07-04" end="2026-07-17" days={[0, 5, 6]} />);
    expect(within(preview()).getByText('Sat Jul 4 – Sun Jul 5').className).toMatch(/is-partial/);
    expect(screen.getByText(/first block is only Sat–Sun \(Jul 4\) because the window starts on a Saturday/)).toBeTruthy();
  });

  it('shows an error when no chosen day falls in the window', () => {
    render(<Harness start="2026-07-06" end="2026-07-08" days={[0, 5, 6]} />);
    expect(preview().className).toMatch(/is-error/);
    expect(preview().textContent).toContain('No Fri–Sun falls inside this window.');
  });
});

describe('DatesGuide (via "How dates work")', () => {
  afterEach(cleanup);

  it('walks through four steps and closes', () => {
    render(<Harness days={[0, 5, 6]} />);
    const dialog = document.querySelector('dialog.guide');
    expect(dialog.open).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /How dates work/ }));
    expect(dialog.open).toBe(true);

    const title = () => dialog.querySelector('#guide-title').textContent;
    expect(title()).toBe('Start and end set the outer edges.');
    expect(dialog.querySelector('.chapter-num').textContent).toBe('01');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(title()).toBe('Only the days you turn on appear.');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(title()).toMatch(/single days.*blocks/);
    // ties the example back to the organizer's real settings
    expect(within(dialog).getByText(/With your settings: Guests will see 3 Fri–Sun blocks/)).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: /Step 4/ }));
    expect(title()).toBe('Your dashboard ranks the same choices.');
    expect(within(dialog).queryByRole('button', { name: 'Next' })).toBeNull();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Got it' }));
    expect(dialog.open).toBe(false);
  });

  it('reopens at step 1 and closes with the ✕ button', () => {
    render(<Harness />);
    const dialog = document.querySelector('dialog.guide');
    fireEvent.click(screen.getByRole('button', { name: /How dates work/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(dialog.open).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /How dates work/ }));
    expect(dialog.querySelector('.chapter-num').textContent).toBe('01');
  });

  it('gives every diagram a text alternative', () => {
    render(<Harness />);
    const dialog = document.querySelector('dialog.guide');
    fireEvent.click(screen.getByRole('button', { name: /How dates work/ }));
    for (let i = 0; i < 4; i++) {
      expect(dialog.querySelector('figure[role="img"]').getAttribute('aria-label').length).toBeGreaterThan(30);
      const next = within(dialog).queryByRole('button', { name: 'Next' });
      if (next) fireEvent.click(next);
    }
  });
});

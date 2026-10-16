import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Moment from './Moment.jsx';
import EventHeader from './EventHeader.jsx';
import PageFoot from './PageFoot.jsx';
import { ART } from './art.js';

afterEach(cleanup);

describe('ART', () => {
  it.each(Object.entries(ART))('%s exists in /public with alt text', (_k, art) => {
    expect(existsSync(resolve(import.meta.dirname, '../../../public', art.src.slice(1)))).toBe(true);
    expect(art.alt.length).toBeGreaterThan(20);
  });
});

describe('Moment', () => {
  it('renders printed art, a pinned sticker, headline, body and actions', () => {
    render(
      <Moment art={ART.thanks} sticker="3 dates saved" stickerTone="green" eyebrow="All done" title="Thanks, Jane!"
        actions={<button>Change</button>}>
        Saved.
      </Moment>
    );
    const img = screen.getByAltText(ART.thanks.alt);
    expect(img.closest('.print')).toBeTruthy();
    const sticker = screen.getByText('3 dates saved');
    expect(sticker.className).toMatch(/sticker-pinned/);
    expect(sticker.className).toMatch(/sticker-green/);
    expect(screen.getByRole('heading', { level: 2, name: 'Thanks, Jane!' })).toBeTruthy();
    expect(screen.getByText('Saved.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change' })).toBeTruthy();
  });

  it('can render as the page h1 and without art', () => {
    render(<Moment title="Oops" headingLevel={1} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Oops' })).toBeTruthy();
    expect(document.querySelector('.print')).toBeNull();
  });
});

describe('EventHeader', () => {
  it('shows name, status, description and a friendly date-window sticker', () => {
    render(
      <EventHeader
        eyebrow="You’re invited"
        event={{ name: 'Summer Reunion', status: 'open', description: 'Lake house', dateWindow: { start: '2026-06-01', end: '2026-08-31' } }}
        actions={<button>See results</button>}
      />
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Summer Reunion' })).toBeTruthy();
    expect(screen.getByText('open').className).toMatch(/tag-open/);
    expect(screen.getByText('Lake house')).toBeTruthy();
    expect(screen.getByText('Jun 1 – Aug 31, 2026').className).toMatch(/sticker/);
    expect(screen.getByRole('button', { name: 'See results' })).toBeTruthy();
  });
});

describe('PageFoot', () => {
  it('links guests back to the landing story', () => {
    render(<MemoryRouter><PageFoot /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Plan your own' }).getAttribute('href')).toBe('/');
  });
});

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

// Pages that fetch on mount shouldn't hit the network in routing tests.
vi.mock('./api/client.js', () => {
  const pending = () => new Promise(() => {});
  return {
    createEvent: vi.fn(pending),
    getEvent: vi.fn(pending),
    getAdminDashboard: vi.fn(pending),
    getSummary: vi.fn(pending),
    submitResponse: vi.fn(pending),
  };
});

const at = path => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('routing', () => {
  afterEach(cleanup);

  it('serves the story landing at /', () => {
    at('/');
    expect(document.querySelector('.lp-story')).toBeTruthy();
    expect(screen.queryByText('Event Name *')).toBeNull();
  });

  it('moves the create-event form to /new', () => {
    at('/new');
    expect(screen.getByText('Event Name *')).toBeTruthy();
    expect(screen.getByLabelText('Convene home').getAttribute('href')).toBe('/');
  });

  it('leaves participant and admin links where they were', () => {
    at('/e/abc');
    expect(document.querySelector('.lp-story')).toBeNull();
    cleanup();
    at('/admin/abc');
    expect(document.querySelector('.lp-story')).toBeNull();
  });
});

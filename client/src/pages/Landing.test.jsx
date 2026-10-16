import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import { STORY_SLIDES, AUTOPLAY_MS } from '../landing/storySlides.js';

function mockReducedMotion(reduce) {
  window.matchMedia = vi.fn().mockImplementation(q => ({
    matches: reduce && q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }));
}

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<p>create-form</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const activeTitle = () =>
  document.querySelector('.lp-slide.is-on .lp-title').textContent;
const carousel = () => document.querySelector('.lp-story');

describe('Landing', () => {
  beforeEach(() => { vi.useFakeTimers(); mockReducedMotion(false); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('opens on the problem chapter and hides the rest from AT', () => {
    renderLanding();
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
    const slides = document.querySelectorAll('.lp-slide');
    expect(slides).toHaveLength(STORY_SLIDES.length);
    expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    expect(slides[1].getAttribute('aria-hidden')).toBe('true');
    expect(slides[1].hasAttribute('inert')).toBe(true);
  });

  it('builds every chapter from the shared storybook primitives', () => {
    renderLanding();
    const slides = document.querySelectorAll('.lp-slide');
    slides.forEach((slide, i) => {
      const print = slide.querySelector('.print');
      expect(print, `slide ${i}`).toBeTruthy();
      expect(print.classList.contains('print-alt')).toBe(i % 2 === 1);
      expect(slide.querySelector('.sticker.sticker-pinned'), `slide ${i}`).toBeTruthy();
      expect(slide.querySelector('.chapter .chapter-num').textContent).toBe(String(i + 1).padStart(2, '0'));
    });
    expect(slides[slides.length - 1].querySelector('.sticker-green')).toBeTruthy();
    expect(document.querySelector('.lp-hero-title .ink-underline').textContent).toBe('everyone');
    expect(document.querySelector('.lp-final').classList.contains('halftone')).toBe(true);
  });

  it('advances with next/prev buttons and wraps around', () => {
    renderLanding();
    fireEvent.click(screen.getByLabelText('Next chapter'));
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
    fireEvent.click(screen.getByLabelText('Previous chapter'));
    fireEvent.click(screen.getByLabelText('Previous chapter'));
    expect(activeTitle()).toBe(STORY_SLIDES.at(-1).title);
    // last slide's "next" restarts the story
    fireEvent.click(screen.getByLabelText('Back to the start'));
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
  });

  it('jumps straight to a chapter from the progress bar', () => {
    renderLanding();
    fireEvent.click(screen.getByRole('tab', { name: /Chapter 5: Decide/ }));
    expect(activeTitle()).toBe(STORY_SLIDES[4].title);
    expect(screen.getByRole('tab', { name: /Chapter 5/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('supports arrow keys', () => {
    renderLanding();
    fireEvent.keyDown(carousel(), { key: 'ArrowRight' });
    fireEvent.keyDown(carousel(), { key: 'ArrowRight' });
    expect(activeTitle()).toBe(STORY_SLIDES[2].title);
    fireEvent.keyDown(carousel(), { key: 'ArrowLeft' });
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
  });

  it('supports swipe, ignoring small drags', () => {
    renderLanding();
    fireEvent.touchStart(carousel(), { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(carousel(), { changedTouches: [{ clientX: 280 }] });
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
    fireEvent.touchStart(carousel(), { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(carousel(), { changedTouches: [{ clientX: 150 }] });
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
  });

  it('autoplays through the story', () => {
    renderLanding();
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS); });
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS); });
    expect(activeTitle()).toBe(STORY_SLIDES[2].title);
  });

  it('holds while hovered and resumes on leave', () => {
    renderLanding();
    fireEvent.mouseEnter(carousel());
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS * 3); });
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
    fireEvent.mouseLeave(carousel());
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS); });
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
  });

  it('stops autoplay when the user hits pause, and restarts on play', () => {
    renderLanding();
    fireEvent.click(screen.getByLabelText('Pause story'));
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS * 3); });
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
    fireEvent.click(screen.getByLabelText('Play story'));
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS); });
    expect(activeTitle()).toBe(STORY_SLIDES[1].title);
  });

  it('does not autoplay for prefers-reduced-motion users', () => {
    mockReducedMotion(true);
    renderLanding();
    expect(screen.getByLabelText('Play story')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(AUTOPLAY_MS * 3); });
    expect(activeTitle()).toBe(STORY_SLIDES[0].title);
  });

  it('puts every CTA on the create form at /new', () => {
    renderLanding();
    // nav + final section + the last chapter's (currently hidden) CTA
    expect(document.querySelectorAll('a[href="/new"]')).toHaveLength(3);
    fireEvent.click(screen.getByText('Start planning'));
    expect(screen.getByText('create-form')).toBeTruthy();
  });

  it('says "no sign-ups" up front', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: 'No sign-ups' })).toBeTruthy();
    expect(document.querySelector('.lp-hero-sub').textContent).toMatch(/No sign-ups/);
  });
});

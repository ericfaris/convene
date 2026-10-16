import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { STORY_SLIDES, wrapIndex } from './storySlides.js';

const PUBLIC = resolve(import.meta.dirname, '../../public');

describe('STORY_SLIDES', () => {
  it('tells the full suggest → decide → finalize arc, in order', () => {
    expect(STORY_SLIDES.map(s => s.id)).toEqual([
      'problem', 'suggest', 'share', 'pick', 'decide', 'finalize',
    ]);
  });

  it('has unique ids and complete copy + alt text on every slide', () => {
    expect(new Set(STORY_SLIDES.map(s => s.id)).size).toBe(STORY_SLIDES.length);
    for (const s of STORY_SLIDES) {
      expect(s.chapter, s.id).toBeTruthy();
      expect(s.title, s.id).toBeTruthy();
      expect(s.body.length, s.id).toBeGreaterThan(40);
      expect(s.alt.length, s.id).toBeGreaterThan(20);
      expect(s.chip?.kind, s.id).toBeTruthy();
    }
  });

  it('points every slide at an illustration that exists in /public', () => {
    for (const s of STORY_SLIDES) {
      expect(existsSync(resolve(PUBLIC, s.image.replace(/^\//, ''))), s.image).toBe(true);
    }
  });

  it('keeps the no-sign-up promise in the story itself', () => {
    const text = STORY_SLIDES.map(s => s.body).join(' ').toLowerCase();
    expect(text).toMatch(/no account/);
    expect(text).toMatch(/signs? up/);
  });
});

describe('wrapIndex', () => {
  it('wraps forward and backward', () => {
    expect(wrapIndex(0, 6)).toBe(0);
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(7, 6)).toBe(1);
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(-7, 6)).toBe(5);
  });
});

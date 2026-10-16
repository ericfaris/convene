// Contract tests for the design system (DESIGN.md). The storybook/riso
// primitives live in index.css and nowhere else — pages compose them
// instead of re-inventing tilts, offset shadows or grain.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const SRC = import.meta.dirname;
const indexCss = readFileSync(resolve(SRC, 'index.css'), 'utf8');
const showcase = readFileSync(resolve(SRC, '../design-system.html'), 'utf8');

function cssFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return cssFiles(p);
    return p.endsWith('.css') ? [p] : [];
  });
}
const pageCss = cssFiles(SRC).filter(p => !p.endsWith('index.css'));

const TOKENS = [
  '--ink', '--riso-a', '--riso-b', '--halftone', '--halftone-size', '--grain',
  '--shadow-print', '--shadow-sticker', '--shadow-stamp', '--tilt', '--tilt-alt', '--tilt-sticker',
  '--duration-print', '--duration-stick',
];
const CLASSES = [
  'print', 'print-alt', 'sticker', 'sticker-bubble', 'sticker-green', 'sticker-pinned',
  'stamp', 'stamp-green', 'chapter', 'chapter-num', 'ink-underline', 'halftone', 'anim-print', 'anim-stick',
];

describe('storybook primitives', () => {
  it.each(TOKENS)('index.css defines token %s on :root', token => {
    expect(indexCss).toMatch(new RegExp(`\\n\\s*${token}:`));
  });

  it.each(CLASSES)('index.css defines .%s', cls => {
    expect(indexCss).toMatch(new RegExp(`\\.${cls}[\\s{,:]`));
  });

  it.each(CLASSES)('the showcase page demonstrates .%s', cls => {
    expect(showcase).toMatch(new RegExp(`class="[^"]*\\b${cls}\\b`));
  });

  it('reduced-motion users never get the entrance animations', () => {
    const block = indexCss.match(/@media \(prefers-reduced-motion: no-preference\) \{[^}]*\.anim-print[^}]*\}/);
    expect(block).not.toBeNull();
  });
});

// Components composed from the primitives; every page uses these.
const COMPONENTS = [
  'masthead', 'moment', 'moment-art', 'moment-title', 'section-title', 'chapter-sm',
  'attendee-btn', 'toggle-pill', 'option-card', 'card-emphasis', 'card-warn',
  'banner-warn', 'link-btn', 'btn-block', 'page-foot',
];

describe('storybook components', () => {
  it.each(COMPONENTS)('index.css defines .%s', cls => {
    expect(indexCss).toMatch(new RegExp(`\\.${cls}[\\s{,:.]`));
  });
  it.each(COMPONENTS)('the showcase page demonstrates .%s', cls => {
    expect(showcase).toMatch(new RegExp(`class="[^"]*\\b${cls}\\b`));
  });
});

// Routed pages take color from tokens/classes only. SummaryView is unrouted legacy.
const ROUTED_PAGES = ['Landing', 'CreateEvent', 'ParticipantView', 'ResultsMatrix', 'AdminDashboard'];
describe('routed pages use tokens, not hex colors', () => {
  it.each(ROUTED_PAGES)('%s.jsx', page => {
    const src = readFileSync(resolve(SRC, 'pages', `${page}.jsx`), 'utf8');
    expect(src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])/g)).toBeNull();
  });
});

describe('page stylesheets compose the system instead of forking it', () => {
  it.each(pageCss.map(p => [relative(SRC, p), p]))('%s', (_name, file) => {
    const css = readFileSync(file, 'utf8');
    // No redefining system tokens or primitives…
    for (const t of TOKENS) expect(css, t).not.toMatch(new RegExp(`${t}\\s*:`));
    expect(css).not.toMatch(/(^|\n)\s*\.(print|sticker|stamp|chapter-num|ink-underline|halftone)\s*\{/);
    // …and no hand-rolled riso effects (hard offset shadows, outlined numerals, grain).
    expect(css).not.toMatch(/box-shadow:[^;]*\d+px \d+px 0 /);
    expect(css).not.toMatch(/-webkit-text-stroke/);
    expect(css).not.toMatch(/feTurbulence/);
  });
});

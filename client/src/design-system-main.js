// Entry point for the static design-system showcase (design-system.html).
// Imports the app's real stylesheet — the same file main.jsx imports for
// the app itself — so every token rendered below is guaranteed to match
// production, never a hand-copied value.
import './index.css';

const root = getComputedStyle(document.documentElement);
const val = (name) => root.getPropertyValue(name).trim();

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'style') Object.assign(node.style, v);
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

// ── Color swatches ──────────────────────────────────────────────────
const COLOR_TOKENS = [
  ['--bg', 'Background'], ['--card', 'Card surface'], ['--gray-light', 'Gray surface'],
  ['--border', 'Border'],
  ['--primary', 'Primary (coral)'], ['--primary-dark', 'Primary dark'], ['--primary-light', 'Primary light'], ['--primary-pale', 'Primary pale'],
  ['--accent', 'Accent (sky)'], ['--accent-dark', 'Accent dark'], ['--accent-light', 'Accent light'], ['--accent-pale', 'Accent pale'],
  ['--yellow', 'Yellow (butter/warn)'], ['--yellow-pale', 'Yellow pale'],
  ['--red', 'Red (danger)'], ['--red-pale', 'Red pale'], ['--red-border', 'Red border'],
  ['--text', 'Text'], ['--text-muted', 'Text muted'], ['--text-faint', 'Text faint'],
  ['--heat-0', 'Heat 0'], ['--heat-1', 'Heat 1'], ['--heat-2', 'Heat 2'], ['--heat-3', 'Heat 3'], ['--heat-4', 'Heat 4'],
];

const colorGrid = document.getElementById('color-swatches');
COLOR_TOKENS.forEach(([token, label]) => {
  const value = val(token);
  const textColor = ['--text', '--primary-dark', '--accent-dark', '--red'].includes(token) ? '#fff' : 'inherit';
  colorGrid.appendChild(
    el('div', { class: 'ds-swatch' }, [
      el('div', { class: 'ds-swatch-fill', style: { background: `var(${token})` } }),
      el('div', { class: 'ds-swatch-label' }, [
        el('span', { class: 'ds-swatch-name', text: label }),
        el('span', { class: 'ds-swatch-value', text: `${token} · ${value}` }),
      ]),
    ])
  );
});

// ── Type scale ───────────────────────────────────────────────────────
const TYPE_STEPS = [
  ['--text-display-lg', 'Display LG', 'var(--font-display)', '700', 'normal', 'Hero wordmark, landing moments (.display-lg)'],
  ['--text-display-md', 'Display MD', 'var(--font-display)', '700', 'normal', 'Section-leading display (.display-md)'],
  ['--text-display-sm', 'Display SM / h1', 'var(--font-display)', '700', 'normal', 'Default h1 — card & page titles'],
  ['--text-h2', 'H2', 'var(--font-body)', '700', 'normal', 'Section headings within a card'],
  ['--text-h3', 'H3', 'var(--font-body)', '600', 'normal', 'Sub-labels, muted headings'],
  ['--text-body-lg', 'Body LG', 'var(--font-body)', '700', 'normal', 'Primary button / key label text'],
  ['--text-body', 'Body', 'var(--font-body)', '500', 'normal', 'Default paragraph / input text'],
  ['--text-body-sm', 'Body SM', 'var(--font-body)', '600', 'normal', 'Secondary text, table cells'],
  ['--text-caption', 'Caption', 'var(--font-body)', '700', 'normal', 'Eyebrows, badges, table headers (uppercase)'],
];
const typeWrap = document.getElementById('type-scale');
TYPE_STEPS.forEach(([token, label, font, weight, style, desc]) => {
  const size = val(token);
  typeWrap.appendChild(
    el('div', { class: 'ds-row' }, [
      el('div', {
        style: {
          fontFamily: font, fontWeight: weight, fontStyle: style, fontSize: size,
          lineHeight: '1.2', flex: '1 1 320px', minWidth: '260px',
        },
        text: label,
      }),
      el('div', { class: 'ds-row-meta', text: `${token} · ${size} · ${weight}${style === 'italic' ? ' italic' : ''}` }),
      el('div', { class: 'ds-row-meta', style: { flexBasis: '100%', color: 'var(--text-faint)' }, text: desc }),
    ])
  );
});

// ── Space scale ──────────────────────────────────────────────────────
const SPACE_TOKENS = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--space-8', '--space-10', '--space-12'];
const spaceWrap = document.getElementById('space-scale');
SPACE_TOKENS.forEach((token) => {
  const px = val(token);
  spaceWrap.appendChild(
    el('div', { class: 'ds-scale-item' }, [
      el('div', { class: 'ds-scale-box', style: { width: px, height: '20px', borderRadius: '3px' } }),
      el('div', { class: 'ds-scale-label', text: `${token} = ${px}` }),
    ])
  );
});

// ── Radius scale ─────────────────────────────────────────────────────
const RADIUS_TOKENS = ['--radius-sm', '--radius', '--radius-lg', '--radius-pill'];
const radiusWrap = document.getElementById('radius-scale');
RADIUS_TOKENS.forEach((token) => {
  const r = val(token);
  radiusWrap.appendChild(
    el('div', { class: 'ds-scale-item' }, [
      el('div', { class: 'ds-scale-radius', style: { borderRadius: r === val('--radius-pill') ? '9999px' : r, width: '56px', height: '56px' } }),
      el('div', { class: 'ds-scale-label', text: `${token} = ${r}` }),
    ])
  );
});

// ── Shadow scale ─────────────────────────────────────────────────────
const SHADOW_TOKENS = ['--shadow-sm', '--shadow-md', '--shadow-lg'];
const shadowWrap = document.getElementById('shadow-scale');
SHADOW_TOKENS.forEach((token) => {
  shadowWrap.appendChild(
    el('div', {
      class: 'ds-shadow-card',
      style: { boxShadow: `var(${token})` },
      text: token,
    })
  );
});

// ── Confetti dots (decorative sample) ─────────────────────────────────
const confetti = document.getElementById('ds-confetti');
if (confetti) {
  const dotColors = [val('--primary'), val('--yellow'), val('--accent')];
  for (let i = 0; i < 18; i++) {
    const size = 6 + Math.round(Math.random() * 10);
    confetti.appendChild(
      el('span', {
        style: {
          position: 'absolute',
          left: `${Math.random() * 96}%`,
          top: `${Math.random() * 80 + 8}%`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: dotColors[i % dotColors.length],
        },
      })
    );
  }
}

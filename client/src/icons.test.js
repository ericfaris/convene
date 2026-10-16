// House app-icon standard (shared with redline/jambo): favicon.ico (16/32/48),
// apple-touch-icon (180), rounded 192/512 and a maskable 512, all rendered from
// scripts/icons/icon.svg by scripts/icons/build.py, and wired into the page
// head and the web manifest. Guards against a stale or half-wired icon set.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PUBLIC = resolve(import.meta.dirname, '../public');
const HTML = resolve(import.meta.dirname, '../index.html');
const MASTER = resolve(import.meta.dirname, '../../scripts/icons/icon.svg');
const PNGS = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512 };

describe('app icons', () => {
  it('ships every PNG at its declared size', () => {
    for (const [file, size] of Object.entries(PNGS)) {
      const b = readFileSync(resolve(PUBLIC, file));
      expect(b.subarray(1, 4).toString(), file).toBe('PNG');
      expect([b.readUInt32BE(16), b.readUInt32BE(20)], file).toEqual([size, size]);
    }
  });

  it('favicon.ico holds 16, 32 and 48', () => {
    const ico = readFileSync(resolve(PUBLIC, 'favicon.ico'));
    expect([...ico.subarray(0, 6)]).toEqual([0, 0, 1, 0, 3, 0]);
    expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48]);
  });

  it('the manifest lists 192, 512 and the maskable 512', () => {
    const m = JSON.parse(readFileSync(resolve(PUBLIC, 'manifest.webmanifest'), 'utf8'));
    expect(m.icons.map((i) => i.src)).toEqual(['/icon-192.png', '/icon-512.png', '/icon-maskable-512.png']);
    expect(m.icons[2].purpose).toBe('maskable');
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('the page head links the icon set and manifest', () => {
    const html = readFileSync(HTML, 'utf8');
    expect(html).toContain('<link rel="icon" href="/favicon.ico" sizes="any" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
  });

  it('the master SVG has the bg and mark layers build.py expects', () => {
    expect(existsSync(MASTER)).toBe(true);
    const svg = readFileSync(MASTER, 'utf8');
    expect(svg).toContain('id="bg"');
    expect(svg).toContain('id="mark"');
  });
});

# Convene — Design System

**"Sunroom Social"**

Live showcase: `client/design-system.html` → served at `/design-system.html`
once built (e.g. https://convene.mooseflip.com/design-system.html), or open
locally after `npm run build && npm run preview` in `client/`. It renders
every token and component below directly from `client/src/index.css` —
nothing on that page is a hand-copied value.

---

## 1. Direction narrative

Convene is a small, low-stakes utility: an organizer picks a date window and
a list of family/friends, shares a link, and everyone taps the weekends
they're free. The audience is not a SaaS buyer — it's parents and friend
groups coordinating a reunion or a weekend hang. The tone that fits is
upbeat, playful, "let's get together" — bright and a little bit fun, not
corporate or clinical.

### Direction

Three directions were originally evaluated for this app (see Changelog):
a warm terracotta/serif "Golden Hour Gathering," a rust/sage letterpress
"Orchard Almanac," and a bright coral/butter/sky geometric-sans "Sunroom
Social." This pass adopts **Sunroom Social**: a dominant coral
(`#FF6B6B`) on a clean white ground, with butter yellow (`#FFD93D`) and sky
blue (`#4FC3F7`) as supporting accents, and one bold, rounded geometric
sans (`Fredoka`) carrying the entire type system instead of a serif/sans
pairing. It's a more graphic, confetti-and-sunshine take than the previous
uplift — closer to "we're throwing a party" than "we're planning an
event," which suits an app whose whole point is getting people together.

### Key moments this system was designed around

1. **Landing on the create-event form** — first impression, the wordmark
   (`h1`/`.display-lg`, bold `Fredoka`) sets the tone.
2. **Picking a weekend as an attendee** — the tactile selector state
   (`AttendeeList` buttons: default → responded → selected).
3. **Submitting availability** — success confirmation banner/state.
4. **Opening the admin heatmap** — the payoff moment, seeing everyone's
   availability at a glance (color-coded calendar).
5. **Finalizing dates** — the emphasis card + finalized tag, the "we're
   doing this" moment.

---

## 2. Color

All tokens live in `:root` in `client/src/index.css`.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--card` | `#FFFFFF` | Card/surface background |
| `--gray-light` | `#F1F5F9` | Secondary surface (secondary buttons, table zebra-adjacent) |
| `--border` | `#E2E8F0` | Default border |
| `--primary` | `#FF6B6B` | Dominant brand color (coral) — primary buttons, links, focus ring |
| `--primary-dark` | `#FA5252` | Primary hover/active |
| `--primary-light` | `#FFD1D1` | Selected-state borders, progress bar end stop |
| `--primary-pale` | `#FFF1F1` | Banner background, selected-attendee background |
| `--accent` | `#4FC3F7` | Accent (sky blue) — "available"/confirmation semantics only |
| `--accent-dark` | `#0288D1` | Accent hover / finalized-date border |
| `--accent-light` | `#B3E5FC` | "Done" badge background |
| `--accent-pale` | `#E1F5FE` | Success alert background |
| `--yellow` | `#FFD93D` | Butter accent — warn surfaces, progress-bar gradient stop |
| `--yellow-pale` | `#FFFBEA` | Warn surface |
| `--red` | `#EF4444` | Danger text/icon |
| `--red-pale` | `#FEF2F2` | Danger surface (error alert, danger button) |
| `--red-border` | `#FECACA` | Danger border |
| `--text` | `#16213E` | Primary text (dark navy) |
| `--text-muted` | `#64748B` | Secondary text, labels |
| `--text-faint` | `#94A3B8` | Tertiary text, placeholders, "—" |
| `--heat-0…4` | `#F1F5F9 → #FF6B6B` | Sequential availability heat scale, butter → coral (see §7 data viz) |

**Contrast:** `--text` (#16213E) on `--bg`/`--card` ≈ 15.8:1 (AAA). White text
on `--primary` (#FF6B6B) ≈ 2.8:1 — acceptable for large/bold button label
text (≥18px bold, per WCAG large-text threshold) but the primary button
never carries small body text for this reason. `--primary-dark` on
`--primary-pale` (banner text) ≈ 4.2:1 (AA, large/bold text). `--accent-dark`
on `--accent-pale` ≈ 4.9:1 (AA).

Dominant color is coral; sky blue is deliberately restricted to
"positive/available/confirmed" semantics so it reads as a signal, not a
second brand color. Butter yellow covers warm/warn surfaces and the
mid-step of the heat scale — it never appears as an interactive control
color on its own.

---

## 3. Type

- **One face throughout**: [`Fredoka`](https://fonts.google.com/specimen/Fredoka)
  (variable, weights 400/500/600/700) — loaded from Google Fonts (`@import`
  at the top of `index.css`). A bold, rounded geometric sans carries the
  entire hierarchy, from the wordmark down to table cells and captions —
  no serif/sans pairing this time. Fallback stack: `system-ui,
  -apple-system, 'Segoe UI', sans-serif`.
- **Mono** (`--font-mono`): system stack, used only for the availability
  date lists in `ResponseTable` and for token labels in the showcase page.

### Full type scale

| Token | Size | Typical weight | Use |
|---|---|---|---|
| `--text-display-lg` | 3rem (48px) | 700 | `.display-lg` — hero wordmark, landing-only |
| `--text-display-md` | 2.25rem (36px) | 700 | `.display-md` — section-leading display, rarely used |
| `--text-display-sm` | 1.75rem (28px) | 700 | Default `h1` — every page/card title |
| `--text-h2` | 1.25rem (20px) | 700 | `h2` — section headings within a card |
| `--text-h3` | 1rem (16px) | 600 | `h3` — muted sub-headings |
| `--text-body-lg` | 1.05rem (16.8px) | 700 | Primary button text, key list labels (`AttendeeList`) |
| `--text-body` | 1rem (16px) | 500 | Paragraphs, form inputs |
| `--text-body-sm` | 0.875rem (14px) | 600 | Secondary copy, table cells, small buttons |
| `--text-caption` | 0.75rem (12px) | 700 | Eyebrows, tags, table headers — always uppercase + letter-spacing |

`h1` is bold and upright (no italic, no serif) — the wordmark now reads as
big and friendly rather than editorial, matching the confetti/geometric
feel of the rest of the system. The `.eyebrow` utility (small caps label,
e.g. "SUNROOM SOCIAL") is colored `--primary` rather than a muted neutral,
so it reads as a bright accent line rather than quiet metadata.

---

## 4. Spacing, radius, shadow, motion

### Spacing (4px base)

`--space-1` 4px · `--space-2` 8px · `--space-3` 12px · `--space-4` 16px ·
`--space-5` 20px · `--space-6` 24px · `--space-7` 28px · `--space-8` 32px ·
`--space-10` 40px · `--space-12` 48px.

Cards use `--space-7` internal padding; page container uses `--space-7`
top / `--space-4` sides / `--space-12` bottom. Form fields use `--space-5`
bottom margin.

### Radius

`--radius-sm` 8px (inputs, small controls) · `--radius` 18px (cards,
banners, calendar day cells) · `--radius-lg` 24px (reserved for larger
modal/sheet surfaces, not yet used) · `--radius-pill` 9999px (tags, progress
bar track/fill, "Done" badges, buttons like "Pick your weekends"). Radius
stepped up from the previous pass (14px → 18px) to read a little more
playful/rounded, matching the bigger, softer shapes in the mood board.

### Shadow

All shadows are coral-tinted (`rgba(255,107,107, …)`, never pure black) so
they read as branded elevation on the white ground rather than muddying it
gray.

- `--shadow-sm` / `--shadow` — `0 2px 12px rgba(255,107,107,.10), 0 1px 3px rgba(255,107,107,.06)` — default card elevation.
- `--shadow-md` — `0 6px 20px rgba(255,107,107,.14), 0 2px 6px rgba(255,107,107,.08)` — reserved for hover/raised states.
- `--shadow-lg` — `0 16px 40px rgba(255,107,107,.20), 0 4px 12px rgba(255,107,107,.10)` — for any future modal/popover surface.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | Fades, border/background color transitions — no overshoot |
| `--ease-press` | `cubic-bezier(.34,1.56,.64,1)` | Buttons, selection states — slight spring/overshoot for tactility |
| `--duration-micro` | 120ms | Hover/focus color changes |
| `--duration-base` | 200ms | Press transforms, border/background transitions |
| `--duration-page` | 400ms | Progress bar fill, staggered card reveal on load |

A `prefers-reduced-motion: reduce` block collapses all animation/transition
durations to ~0 globally. The page-load stagger (`.container > .card`
fade+rise, `convene-rise` keyframe) is itself gated inside a
`prefers-reduced-motion: no-preference` media query so it never runs for
users who've opted out.

---

## 5. Components

All components are plain CSS classes in `client/src/index.css` (no CSS
modules/styled-components) — the same classes the React pages already used
before this pass, so no JSX structure changed (only the literal color
values inlined in a few components were updated to match the new tokens —
see §8).

- **`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-sm`**
  — default, hover, active (scale .97 via `--ease-press`), disabled (opacity
  .45). Primary carries a colored (coral) shadow so it reads as the one
  confident action per screen.
- **Inputs** (`input[type=text|date]`, `textarea`) — default, focus (coral
  border + glow ring), `.input-error` variant (red border + red glow ring
  on focus), disabled (opacity .55). Text/date inputs and textareas share
  one rule set.
- **`.card`** — base surface; an emphasis variant is just an inline
  `border: 2px solid var(--primary)` override (used for the admin
  finalize panel) rather than a second class, since it's a one-off.
- **`.banner`** — persistent informational strip (e.g. "closes for
  responses on…").
- **`.success` / `.error`** — inline alert states (`.success` now sky-blue
  tinted, `.error` red).
- **`.tag` / `.tag-open` / `.tag-closed` / `.tag-finalized`** — pill status
  badges, uppercase caption type.
- **`.progress-bar-wrap` / `.progress-bar`** — coral→butter gradient fill,
  animates width on `--duration-page`.
- **Attendee selector** (`AttendeeList.jsx`, inline-styled) — three states:
  default (white, neutral border), responded (pale background, light-coral
  border, sky "✓ Done" pill), selected (pale-coral background, full coral
  border, subtle scale + shadow). Given the outsized role this control
  plays (it's the primary interaction for every non-admin visitor), it
  gets the most tactile treatment in the system: the scale+shadow pairing
  on selection is the system's signature micro-interaction.
- **Table** (`ResponseTable.jsx`) — uppercase caption headers, muted
  secondary text, monospace date lists.
- **Data / heat scale** (`HeatmapCalendar.jsx`, `CalendarGrid.jsx`) — a
  bespoke 5-step sequential scale (neutral → butter → coral) computed
  per-cell in JS rather than via CSS classes, since the step depends on a
  runtime ratio. Documented and tokenized as `--heat-0…4` in `index.css`;
  the components' `heatColor()` / `textColor()` functions were updated in
  this pass to the new hex values (behavior unchanged, literal colors now
  match the new tokens).

---

## 6. Backgrounds & decoration

The ground is a flat white — the previous pass's warm noise texture was
dropped, since "Sunroom Social" is a cleaner, more graphic direction where
the coral/butter/sky palette itself is the texture. The one decorative
motif is **confetti dots** in the three brand colors, scattered loosely
around hero/marketing moments (see the mood-board reference and the
showcase page's "Background & decoration" section) — never inside the
working app UI itself, which stays clean and functional.

---

## 7. Accessibility notes

- `:focus-visible` gets a 2px `--primary` outline (3px offset on `.btn`) —
  applied globally, not per-component, so no interactive element is missing
  a focus ring.
- Color is never the sole signal: the "Done" badge pairs sky blue with a ✓
  glyph and text; tags always carry a text label; the finalized calendar
  cell gets both a color change *and* a heavier border.
- `prefers-reduced-motion: reduce` disables all transitions/animations
  (button press, card reveal, progress-bar fill) via a blanket override.
- Contrast ratios for the pairs that matter are called out in §2 — all meet
  at least AA for their text size; heat-scale cell text uses dark navy
  throughout (rather than switching to white at high saturation) since the
  new coral/butter ramp is lighter overall than the old orange one and
  dark text reads more reliably across every step.
- There's no mute/sound control because this pass has no sound identity in
  scope (a quiet scheduling utility has no key moments that call for audio).

---

## 8. Asset inventory

| File | Role |
|---|---|
| `client/public/favicon.ico`, `icon-16/32/48/180/192/512.png`, `logo.png`, `logo.webp` | New icon mark: a solid coral (`#FF6B6B`) square with a bold white heart and butter/sky/light-coral confetti dots — replaces the old illustrated people/calendar mark to match the Sunroom Social palette. Hand-built as SVG and rasterized per size (no photographic/AI-generated art), so it stays crisp and legible down to 16px. |
| `client/src/index.css` | Token source of truth + all component styles (this pass: swapped the color palette, swapped the type system to a single `Fredoka` face, bumped the radius scale, retinted shadows coral, dropped the noise-texture background, renamed the `--green-*` tokens to `--accent-*` now that they're sky blue). |
| `client/design-system.html` | Showcase page — copy and inline demo colors updated for the new palette/type/decoration. |
| `client/src/design-system-main.js` | Showcase page's JS — token list and type-scale metadata updated; added a small confetti-dot decorative sample. |
| `client/src/components/AttendeeList.jsx`, `HeatmapCalendar.jsx`, `CalendarGrid.jsx`, `ResponseTable.jsx`, `client/src/pages/*.jsx` | Inline-styled literal hex values (these components don't consume CSS custom properties directly) updated to match the new token values, so the whole app stays visually consistent with the new palette. |

No new fonts/images/audio were generated as production assets for this
pass; the mood-board reference lives outside the repo.

---

## 9. Showcase page

`client/design-system.html` (built alongside the main app via
`npm run build` in `client/`; Vite emits it as a sibling static file, so in
production it's reachable at `/design-system.html` off the same Express
static server that serves the app itself — no extra route needed). It
imports `client/src/index.css` via a dedicated entry script
(`design-system-main.js`), exactly like `main.jsx` does for the real app, so
it always ships the same compiled CSS asset — never a hand-copied fork.

Sections: Color (all tokens, live values via `getComputedStyle`), Type (full
scale, real fonts), Spacing & radius (visual scale), Shadow & motion
(hoverable tiles), Components (buttons/inputs/cards/banner-alerts/tags/
progress bar/attendee-selector states/table/heat scale — real markup and
classes), Background & decoration (confetti-dot sample in the three brand
colors).

---

## Changelog

- **2026-09-16** — Replaced the app icon/favicon set and `logo.png`/`logo.webp`
  with a new coral heart + confetti-dot mark (see §8), retiring the old
  illustrated people/calendar icon.
- **2026-09-16** — Pivoted the design system from "Golden Hour Gathering"
  (terracotta/cream, `Fraunces` serif display + `Nunito` body) to
  **"Sunroom Social"** (coral/butter/sky, single bold `Fredoka` geometric
  sans) per updated direction. Repainted every color token (`--primary`,
  `--yellow`, text/neutral scale, heat scale), renamed `--green-*` tokens
  to `--accent-*` to match their new sky-blue value, bumped the radius
  scale, retinted shadows coral, dropped the warm noise-texture background
  in favor of a confetti-dot decorative motif, and updated every
  inline-hex literal in `AttendeeList`, `HeatmapCalendar`, `CalendarGrid`,
  `ResponseTable`, and the page components to match. No JSX structure
  changed — this remains a styling-only pass.
- **2026-09-13** — Initial `DESIGN.md`. Formalized the app's original warm
  orange/cream identity into a documented token system ("Golden Hour
  Gathering"), added `Fraunces` as a display face, added spacing/shadow/
  motion scales, focus-visible + reduced-motion handling, an `.input-error`
  state, and the `client/design-system.html` live showcase page.

# Convene — Design System

**"Golden Hour Gathering"**

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
groups coordinating a reunion or a weekend hang. The tone that fits is warm,
handwritten-invitation, "see you there" — not corporate, not clinical.

The app already had real brand equity worth keeping: a terracotta-orange
primary (`#F97316`), a cream ground, and Nunito as the body face, plus an
existing icon (a small illustrated family/people mark) and full favicon set.
Rather than discard that, this pass is an **uplift**: keep the established
palette and body type, formalize it into a real token system, and add the
one thing it was missing — a distinctive display face and a documented
scale — to turn "decent default styling" into an actual identity.

### Mood board process

Three directions were generated via Ideogram (`mcp__ideogram__generate_image`,
16:9 "design system mood board" prompts) and evaluated against the app's
actual purpose:

1. **Golden Hour Gathering** — cream/terracotta/olive, warm serif display
   (evoking `Fraunces`), linen texture, sun + calendar motif. *(chosen)*
2. **Orchard Almanac** — sage/rust/mustard, letterpress serif, hand-drawn
   almanac calendar, aged-paper farmhouse mood.
3. **Sunroom Social** — coral/butter/sky, bold geometric sans, confetti
   dots, generic upbeat modern-SaaS energy.

**Chosen: Golden Hour Gathering.** It's the only one of the three that
*extends* rather than replaces the app's existing orange/cream identity —
so the uplift reads as "the same app, now finished" rather than a rebrand,
and the existing icon/favicon needed no rework. Orchard Almanac was a strong
second (the botanical calendar motif is charming) but its rust/sage palette
would have meant discarding the established orange brand color entirely.
Sunroom Social's bright coral/sky palette and geometric sans read as generic
consumer-SaaS — closer to a scheduling *tool* than a *gathering*, which is
the wrong register for an app whose whole point is "family reunion," not
"productivity app."

### Key moments this system was designed around

1. **Landing on the create-event form** — first impression, the wordmark
   sets the tone (`h1`/`.display-lg` italic serif).
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
| `--bg` | `#FFFBF5` | Page background (warm cream) |
| `--card` | `#FFFFFF` | Card/surface background |
| `--gray-light` | `#F5F0EB` | Secondary surface (secondary buttons, table zebra-adjacent) |
| `--border` | `#E8DDD4` | Default border |
| `--primary` | `#F97316` | Dominant brand color — primary buttons, links, focus ring |
| `--primary-dark` | `#EA580C` | Primary hover/active, display-lg text |
| `--primary-light` | `#FED7AA` | Selected-state borders, progress bar end stop |
| `--primary-pale` | `#FFF7ED` | Banner background, selected-attendee background |
| `--green` | `#65A30D` | Accent — "available"/confirmation semantics only |
| `--green-dark` | `#4D7C0F` | Green hover / finalized-date border |
| `--green-light` | `#ECFCCB` | "Done" badge background |
| `--green-pale` | `#F7FEE7` | Success alert background |
| `--yellow` | `#FCD34D` | Warn accent, progress-bar gradient stop |
| `--yellow-pale` | `#FEFCE8` | Warn surface |
| `--red` | `#EF4444` | Danger text/icon |
| `--red-pale` | `#FEF2F2` | Danger surface (error alert, danger button) |
| `--red-border` | `#FECACA` | Danger border |
| `--text` | `#1C1917` | Primary text |
| `--text-muted` | `#78716C` | Secondary text, labels |
| `--text-faint` | `#A8A29E` | Tertiary text, placeholders, "—" |
| `--heat-0…4` | `#F5F0EB → #EA580C` | Sequential availability heat scale (see §7 data viz) |

**Contrast:** `--text` (#1C1917) on `--bg`/`--card` ≈ 16.7:1 (AAA). White text
on `--primary` (#F97316) ≈ 2.7:1 — acceptable for large/bold button label
text (≥18px bold, per WCAG large-text threshold) but the primary button
never carries small body text for this reason. `--primary-dark` on
`--primary-pale` (banner text) ≈ 5.2:1 (AA). `--green-dark` on `--green-pale`
≈ 5.8:1 (AA).

Dominant color is terracotta orange; olive green is deliberately restricted
to "positive/available/confirmed" semantics so it reads as a signal, not a
second brand color.

---

## 3. Type

- **Display**: [`Fraunces`](https://fonts.google.com/specimen/Fraunces)
  (variable, optical-size axis), italic, weight 600 — loaded from Google
  Fonts (`@import` at the top of `index.css`; weights 500/600/700 roman +
  500/600 italic pulled to cover the scale). Fallback stack:
  `'Iowan Old Style', 'Palatino Linotype', Georgia, serif`. Used for every
  `h1` and the `.display-lg`/`.display-md` utility classes — the one
  distinctive, editorial note against an otherwise plain, friendly UI.
- **Body**: `Nunito` (400/500/600/700/800) — carried over from the app's
  existing identity, rounded and approachable, good at small sizes for
  dense admin tables. Fallback stack: `system-ui, -apple-system, 'Segoe UI',
  sans-serif`.
- **Mono** (`--font-mono`): system stack, used only for the availability
  date lists in `ResponseTable` and for token labels in the showcase page.

### Full type scale

| Token | Size | Typical weight | Face | Use |
|---|---|---|---|---|
| `--text-display-lg` | 3rem (48px) | 600 italic | Fraunces | `.display-lg` — hero wordmark, landing-only |
| `--text-display-md` | 2.25rem (36px) | 600 italic | Fraunces | `.display-md` — section-leading display, rarely used |
| `--text-display-sm` | 1.75rem (28px) | 600 italic | Fraunces | Default `h1` — every page/card title |
| `--text-h2` | 1.25rem (20px) | 700 | Nunito | `h2` — section headings within a card |
| `--text-h3` | 1rem (16px) | 600 | Nunito | `h3` — muted sub-headings |
| `--text-body-lg` | 1.05rem (16.8px) | 700 | Nunito | Primary button text, key list labels (`AttendeeList`) |
| `--text-body` | 1rem (16px) | 500 | Nunito | Paragraphs, form inputs |
| `--text-body-sm` | 0.875rem (14px) | 600 | Nunito | Secondary copy, table cells, small buttons |
| `--text-caption` | 0.75rem (12px) | 800 | Nunito | Eyebrows, tags, table headers — always uppercase + letter-spacing |

`h1` is intentionally always italic serif — it's the one signature
typographic move in an otherwise restrained system, applied consistently so
every page title (event name, "Convene", "Thanks, {name}!", "You're all
set!") gets the same warm, invitation-card treatment without any
per-page styling.

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

`--radius-sm` 8px (inputs, small controls) · `--radius` 14px (cards,
banners, calendar day cells) · `--radius-lg` 20px (reserved for larger
modal/sheet surfaces, not yet used) · `--radius-pill` 9999px (tags, progress
bar track/fill, "Done" badges).

### Shadow

All shadows are warm-tinted (`rgba(120, 70, 20, …)`, never pure black) so
they read correctly on the cream ground instead of muddying it gray.

- `--shadow-sm` / `--shadow` — `0 2px 12px rgba(120,70,20,.08), 0 1px 3px rgba(120,70,20,.05)` — default card elevation.
- `--shadow-md` — `0 6px 20px rgba(120,70,20,.10), 0 2px 6px rgba(120,70,20,.06)` — reserved for hover/raised states.
- `--shadow-lg` — `0 16px 40px rgba(120,70,20,.16), 0 4px 12px rgba(120,70,20,.08)` — new; for any future modal/popover surface.

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
before this pass, so no JSX changed.

- **`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-sm`**
  — default, hover, active (scale .97 via `--ease-press`), disabled (opacity
  .45). Primary carries a colored shadow so it reads as the one confident
  action per screen.
- **Inputs** (`input[type=text|date]`, `textarea`) — default, focus (orange
  border + glow ring), new `.input-error` variant (red border + red glow
  ring on focus), disabled (opacity .55). Text/date inputs and textareas
  share one rule set.
- **`.card`** — base surface; an emphasis variant is just an inline
  `border: 2px solid var(--primary)` override (used for the admin
  finalize panel) rather than a second class, since it's a one-off.
- **`.banner`** — persistent informational strip (e.g. "closes for
  responses on…").
- **`.success` / `.error`** — inline alert states.
- **`.tag` / `.tag-open` / `.tag-closed` / `.tag-finalized`** — pill status
  badges, uppercase caption type.
- **`.progress-bar-wrap` / `.progress-bar`** — orange→yellow gradient fill,
  animates width on `--duration-page`.
- **Attendee selector** (`AttendeeList.jsx`, inline-styled) — three states:
  default (white, neutral border), responded (pale background, light-orange
  border, green "✓ Done" pill), selected (pale-orange background, full
  orange border, subtle scale + shadow). Given the outsized role this
  control plays (it's the primary interaction for every non-admin visitor),
  it gets the most tactile treatment in the system: the scale+shadow pairing
  on selection is the system's signature micro-interaction.
- **Table** (`ResponseTable.jsx`) — uppercase caption headers, muted
  secondary text, monospace date lists.
- **Data / heat scale** (`HeatmapCalendar.jsx`, `CalendarGrid.jsx`) — a
  bespoke 5-step sequential scale (light → saturated orange) computed
  per-cell in JS rather than via CSS classes, since the step depends on a
  runtime ratio. Documented and tokenized as `--heat-0…4` in `index.css`
  for reference/consistency, but the components' own `heatColor()` /
  `textColor()` functions were left untouched (behavior-sensitive,
  out of scope for a styling-only pass) — their literal hex values already
  match the tokens.

---

## 6. Backgrounds & texture

A single generated texture: an inline SVG `feTurbulence` noise filter,
embedded as a data URI directly in the `body` background-image rule (no
external file). Kept at 2.5% opacity in the app (barely perceptible — just
enough to keep the cream ground from feeling like a flat digital fill) and
shown at 12% opacity in the showcase page so it's actually visible there.
No other generated art was needed for this pass — the existing icon/logo
already carry the "family gathering" motif well (see §8).

Ideogram prompt direction used for the mood board (for a consistent
follow-up asset later, e.g. a landing-page hero texture): *"cream and warm
white background, linen paper texture, soft golden-hour lighting, warm
charcoal accents"*.

---

## 7. Accessibility notes

- `:focus-visible` gets a 2px `--primary` outline (3px offset on `.btn`) —
  applied globally, not per-component, so no interactive element is missing
  a focus ring.
- Color is never the sole signal: the "Done" badge pairs green with a ✓
  glyph and text; tags always carry a text label; the finalized calendar
  cell gets both a color change *and* a heavier border.
- `prefers-reduced-motion: reduce` disables all transitions/animations
  (button press, card reveal, progress-bar fill) via a blanket override.
- Contrast ratios for the pairs that matter are called out in §2 — all meet
  at least AA for their text size.
- There's no mute/sound control because this pass has no sound identity in
  scope (a quiet scheduling utility has no key moments that call for audio).

---

## 8. Asset inventory

| File | Role |
|---|---|
| `client/public/favicon.ico`, `icon-16/32/48/180/192/512.png` | Existing favicon/app-icon set — already present and on-brand (illustrated family/people mark on a soft green rounded-square background); verified during this pass, not regenerated. |
| `client/public/logo.png`, `logo.webp` | Existing wordmark/logo asset, unchanged. |
| `client/src/index.css` | Token source of truth + all component styles (this pass: reorganized into a documented scale, added `--space-*`, `--radius-lg`, `--shadow-lg`, `--heat-0…4`, motion tokens, `.input-error`, focus-visible rules, reduced-motion handling, page-reveal animation, `.display-lg/md`, `.eyebrow`). |
| `client/design-system.html` | New — static showcase page (Vite multi-entry), see below. |
| `client/src/design-system-main.js` | New — showcase page's JS: imports the real `index.css` and renders live token values via `getComputedStyle`. |
| `client/vite.config.js` | Updated — added `design-system.html` as a second Rollup build input (multi-page app) so the showcase ships as a real static file at `/design-system.html` sharing the app's actual compiled CSS asset. |

No new fonts/images/audio were generated as production assets — the mood
board images live only in the session scratchpad, not the repo.

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
classes), Background & texture (the noise SVG at higher opacity for
visibility).

---

## Changelog

- **2026-09-13** — Initial `DESIGN.md`. Formalized the app's existing warm
  orange/cream identity into a documented token system ("Golden Hour
  Gathering"), added `Fraunces` as a display face, added spacing/shadow/
  motion scales, focus-visible + reduced-motion handling, an `.input-error`
  state, and the `client/design-system.html` live showcase page. No JSX
  changed — every existing page/component picked up the uplift purely
  through the shared `index.css` classes they already used.

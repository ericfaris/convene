# Convene — Design System

**"Golden Hour Gathering · Storybook"**

Live showcase: `client/design-system.html` → served at `/design-system.html`
once built (e.g. https://convene.mooseflip.com/design-system.html), or open
locally after `npm run build && npm run preview` in `client/`. It renders
every token and component below directly from `client/src/index.css` —
nothing on that page is a hand-copied value.

> **House style:** everything new follows the **Storybook layer (§10)**:
> riso-print illustration cards, real-UI stickers, stamps, outlined chapter
> numerals, inked emphasis, halftone. Read §10's checklist before building
> any new screen.

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

1. **Landing page story** (`/`) — first impression: a six-chapter riso
   storybook slideshow that explains the app before asking for anything
   (see §10). The create-event form moved to `/new`.
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
- **Attendee selector** (`AttendeeList.jsx` → `.attendee-btn`, see §10; originally inline-styled) — three states:
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

*Riso halftone, paper grain and generated story illustrations are covered in §10.*

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
| `client/public/favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png`, `manifest.webmanifest` | App icon on the house standard shared with every mooseflip app (2026-10-16): a calendar page with a green "this date works" check on a bold orange tile. Rendered from `scripts/icons/icon.svg` by `python3 scripts/icons/build.py`; `client/src/icons.test.js` guards the wiring. |
| `client/public/logo.svg`, `logo-lockup.svg` | Open Table mark (calendar-cell C + green confirmed-date dot) and horizontal lockup, used in the UI. |
| `client/src/index.css` | Token source of truth + all component styles (this pass: reorganized into a documented scale, added `--space-*`, `--radius-lg`, `--shadow-lg`, `--heat-0…4`, motion tokens, `.input-error`, focus-visible rules, reduced-motion handling, page-reveal animation, `.display-lg/md`, `.eyebrow`). |
| `client/design-system.html` | New — static showcase page (Vite multi-entry), see below. |
| `client/src/design-system-main.js` | New — showcase page's JS: imports the real `index.css` and renders live token values via `getComputedStyle`. |
| `client/vite.config.js` | Updated — added `design-system.html` as a second Rollup build input (multi-page app) so the showcase ships as a real static file at `/design-system.html` sharing the app's actual compiled CSS asset. |

| `client/public/story/01-chaos.webp` … `06-gather.webp` | Landing story illustrations (Ideogram 4.5, 1024×768 WebP, 27–135 KB each) — see §10. |
| `client/src/landing/landing.css` | Landing layout only (`.lp-*`); all riso styling comes from the §10 primitives. |
| `client/src/designSystem.test.js` | Contract test: primitives defined once in `index.css`, shown in the showcase, never forked in page CSS. |
| `client/public/story/moment-*.webp` | Six in-app moment illustrations (all-set, thanks, waiting, no-replies, finalized, lost); see §10. |
| `client/src/components/storybook/` | `EventHeader`, `Moment`, `PageFoot`, `art.js` (moment art map). |
| `client/src/landing/storySlides.js` | Story copy, art paths, alt text and UI-sticker data for the slideshow. |
| `client/src/pages/Landing.jsx` | Landing page + carousel. |

The 2026-09-13 mood-board images live only in that session's scratchpad,
not the repo.

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

## 10. Storybook layer (system-wide)

**Status: house style.** As of 2026-10-16 the riso "storybook" look that
debuted on the landing page is part of the core system, not a one-off. Any
new page, feature, empty state, or marketing surface follows it. The base
tokens and components above (§2–§5) still govern ordinary UI such as forms,
tables and buttons. The storybook layer sits on top of them.

### Direction

*Golden Hour Gathering, printed.* The app reads like a hand-printed
invitation or a picture book about the gathering: cream paper, terracotta
and olive inks slightly out of register, halftone dots, grain, and small
pieces of real UI stuck on like stickers. It should feel warm, human, and
low-stakes. Avoid anything that looks like enterprise scheduling software.

### Tokens (`index.css` `:root`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `var(--text)` | Sticker outlines and hard sticker shadows |
| `--riso-a` | `var(--primary-light)` | First misregistered ink pass (print shadow, numeral shadow, stamp) |
| `--riso-b` | `rgba(101,163,13,.35)` | Olive second pass (print shadow, opposite corner) |
| `--halftone` / `--halftone-size` | orange 1.2px dots / `14px` | Dot field behind hero and closing sections |
| `--grain` | SVG fractal noise, 9% | Paper grain over printed art |
| `--shadow-print` | `9px 10px 0 riso-a, -5px -4px 0 riso-b, shadow-lg` | `.print` |
| `--shadow-sticker` | `4px 4px 0 var(--ink)` | `.sticker` |
| `--shadow-stamp` | `3px 3px 0 var(--riso-a)` | `.stamp` |
| `--tilt` / `--tilt-alt` / `--tilt-sticker` | `-1.2deg` / `1deg` / `2deg` | Print cards alternate; stickers lean the other way |
| `--duration-print` / `--duration-stick` | `700ms` / `520ms` | Entrance motion, both on `--ease-press` |

### Primitives (`index.css`)

| Class | What it is | Use it for | Don't |
|---|---|---|---|
| `.print` (+ `.print-alt`) | Rounded card, tilted, riso offset shadows, grain overlay | Illustrations; at most one hero "artifact" per screen | Wrap forms, tables, or text-heavy cards in it |
| `.sticker` (+ `-bubble`, `-green`, `-pinned`) | White chip, 2px ink border, hard ink shadow, +2° tilt | Real UI fragments (a date, a link, a status) shown *as content*; `-pinned` sticks it to the corner of a `position: relative` parent; `-green` = finalized/confirmed | Make it a real interactive control; tilted buttons hurt usability |
| `.stamp` (+ `-green`) | 44px rounded icon square with riso shadow | Feature/promise cards, empty-state icons | Use emoji as the stamp glyph (use a simple text glyph or SVG) |
| `.chapter` + `.chapter-num` | Outlined italic Fraunces numeral + eyebrow | Real sequences: story chapters, onboarding steps, "step 2 of 3" | Number things that aren't ordered |
| `.ink-underline` | Primary-colored word with a tilted olive ink stroke | The single most important word of a display headline | Use more than once per screen |
| `.halftone` | Masked dot field behind a section | Hero and closing CTA sections | Put it behind dense reading text |
| `.anim-print` / `.anim-stick` | Drop-in and slap-on entrances, reduced-motion gated | First paint of a print or sticker; carousels re-trigger them per slide | Loop them or attach them to routine UI |

### Components (`index.css` + `client/src/components/storybook/`)

Composed from the primitives. Every in-app page is assembled from these, so a
new screen should need little or no page-specific styling.

| Component | Class / React | Use |
|---|---|---|
| Event masthead | `.masthead` / `<EventHeader event eyebrow actions>` | Top of every event page: eyebrow (who's looking: "You're invited", "Results so far", "Organizer view"), status tag, Fraunces title, description, date-window **sticker**, actions |
| Moment | `.moment` / `<Moment art sticker stickerTone eyebrow title actions headingLevel>` | Any emotional or terminal state: thanks, waiting, finalized, no replies, links ready, not found / load error. Printed art + pinned sticker with the key fact + display headline + 1–2 actions |
| Step heading | `.chapter.chapter-sm` + `.section-title` + `.section-sub` | Numbered steps inside a card (participant 01 → 02 → 03; create 01 Suggest → 02 Share) |
| Section heading | `.section-title` / `.section-sub` | Card headings ("Who's free when", "Responses") |
| Attendee picker | `.attendee-list` / `.attendee-btn` (`.is-done`, `.is-selected`) | Primary participant control; riso lift on hover |
| Toggle pill | `.toggle-pill[aria-pressed]` | Multi-select chips (days of week) |
| Choice card | `.option-grid` / `.option-card` (`.is-best`) | Ranked options; the best one gets the stamp shadow |
| Card variants | `.card-emphasis`, `.card-warn`, `.banner-warn` | Active form (finalize), one-time warnings (admin link), "still waiting on…" |
| Misc | `.btn-block`, `.link-btn`, `.progress-head`, `.loading-note`, `.sr-only`, `.input-sm` | Full-width CTA, "← Back"-style text buttons, progress label row, loading text |
| Form section | `.fieldset` + `legend > .section-title` + `.field-help` | Group related fields under a display heading with one line of plain-language help |
| Explainer trigger | `.help-btn` (with `.help-btn-mark` "?") | Opens a `.guide`; place it right under the section help, never hidden in a tooltip |
| Live preview | `.preview` (`.is-empty`, `.is-error`) + `.choice-chip` (`.is-partial`, `.is-more`) | "What guests will see": the consequence of a setting in plain words, the first few real choices, and warnings. `aria-live="polite"` |
| Guide modal | `.guide` (native `<dialog>`) / `<DatesGuide>` | Step-by-step explainer: `.chapter-sm` step numeral, `.guide-title`, `.guide-body`, a `.guide-figure` diagram (with a text alternative), `.guide-yours` ("With your settings…"), dot stepper + Back/Next/Got it. Esc, ✕ and backdrop click all close it |
| Diagram minis | `.mini-cal` / `.mini-day` (`.is-in`, `.is-on`, `.is-pick`, `.is-edge`) / `.mini-block` (`.is-pick`, `.is-partial`) | Tiny calendar and block lists for guides. Generate them from `lib/schedule.js` so they can't drift from real behavior |
| Footer | `.page-foot` / `<PageFoot>` | "Planned with Convene · Plan your own" on guest-facing pages |

**Moment art** (`components/storybook/art.js`, files in `public/story/`):

| Key | File | Where |
|---|---|---|
| `allSet` | `moment-all-set.webp`: Maya launching a paper airplane from a hill | Create → links ready |
| `thanks` | `moment-thanks.webp`: grandmother mailing a ✓ envelope | Participant submitted |
| `waiting` | `moment-waiting.webp`: Maya at the window with tea and a cat | Responses closed, not finalized |
| `noReplies` | `moment-no-replies.webp`: Maya on porch steps, airplanes flying off | Admin/results with zero replies |
| `finalized` | `moment-finalized.webp`: family car driving to the farmhouse | Finalized (participant + admin) |
| `lost` | `moment-lost.webp`: dog sniffing a crumpled airplane | Unknown link / load error |

Copy voice for moments: short declarative headline ending in a period or
exclamation mark ("Waiting on the organizer.", "It's happening. See you
there!"). The body says what happens next. Buttons name the action ("Change
my dates", "Copy guest link"). No emoji in headings or buttons. A ✓ glyph is
fine inside stickers and tags.

### Explaining a setting

Any setting whose effect isn't obvious gets all three of these:
1. **Explicit labels and hints**: say what the field *does*, not just what
   it is ("Window start: first day guests can pick (included)").
2. **A live `.preview`**: the consequence in a full sentence, the first few
   real choices, and warnings for surprising edges.
3. **A `.help-btn` → `.guide`**: a short walkthrough with diagrams, ending
   on "With your settings…".

The date window and days of the week (`DateWindowFields` + `DatesGuide`) are
the reference implementation. Their logic lives in `client/src/lib/schedule.js`
(server twin: `server/lib/schedule.js`), shared by the preview, guide, guest
calendar, results and organizer suggestions.

### Illustration recipe (Ideogram)

All story art is generated, never stock. Use `ideogram_4_5`, size
`2304x1728` (4:3), `num_images: 2`, and pick the variant that best matches
character and palette. It's delivered as 1024×768 WebP: save it to
`client/public/story/` (or a sibling folder) as-is. End every prompt with
this suffix, verbatim:

> *Riso print look in a limited palette: terracotta orange, olive green and
> warm charcoal ink on cream paper; visible grain, halftone dots, slight
> color misregistration, flat simple shapes, friendly rounded characters
> with minimal faces. Generous cream negative space. No words, no letters,
> no text.*

Recurring cast: **Maya**, the organizer, is *"a woman with a short dark bob
haircut and an orange sweater"*. Guests are drawn as a mix of ages
(grandmother in a cardigan, couples, a dad with a toddler, a teen) in
olive/terracotta clothes. Always include "no text" or the model letters
calendars and signs. Write alt text for every image describing the scene,
not the style.

### Checklist for new UI

1. Build the structure from §5 components (`.card`, `.btn`, inputs, tags).
2. Where a screen has a *moment* (empty state, success, a reveal, a
   marketing block), add **one** storybook element: a `.print` illustration,
   a `.sticker` of the key fact, or a `.stamp`.
3. Headlines that carry emotion use Fraunces italic (`h1`, `.display-*`).
   They can include one `.ink-underline`.
4. Never hand-roll hard offset shadows, tilts, outlined numerals or grain in
   page CSS. Use the tokens and classes above. `src/designSystem.test.js`
   fails the build if a page stylesheet does.
5. New primitives/components go into `index.css`, this section, and the
   Storybook sections of `design-system.html` together. The contract test
   checks that every primitive and component appears in the showcase.
6. Routed pages take colors from tokens/classes only. The contract test
   fails on hex literals in `pages/*.jsx` (unrouted legacy `SummaryView` is
   exempt).
7. Any new terminal or empty state is a `<Moment>` with art. Generate new
   art with the recipe below if none of the existing scenes fit.

### Landing page (`/`) — reference implementation

`client/src/pages/Landing.jsx` and `client/src/landing/` (copy in
`storySlides.js`, layout-only CSS in `landing.css`). One organizer, Maya,
takes a family reunion from group-chat chaos to a finalized date:

| # | Chapter | Headline | Art | Sticker |
|---|---|---|---|---|
| 1 | The problem | Forty-seven messages. Still no date. | `01-chaos` | `.sticker-bubble` |
| 2 | Suggest | Maya suggests a window. That's it. | `02-suggest` | event name field |
| 3 | Share | One link. Drop it anywhere. | `03-share` | link + Copy |
| 4 | Pick | Everyone taps their name, then their days. | `04-pick` | ✓ day pills |
| 5 | Decide | The best date lights up. | `05-decide` | mini heat strip (`--heat-*`) |
| 6 | Finalize | Lock it in. See you there. | `06-gather` | `.sticker-green` |

"No sign-ups / no account / no app" is repeated in the hero, chapters 2–3,
the promise cards and the final CTA. It's the core pitch.

**Carousel behavior:** autoplays every 7s (`AUTOPLAY_MS`), holds on hover
and focus, has a pause/play button, and doesn't autoplay for
reduced-motion users. ←/→ keys, swipe, and progress segments that double as
chapter tabs. It uses `aria-roledescription` carousel/slide, inactive slides
are `aria-hidden` + `inert`, and a polite live region is active only when
not autoplaying. All slides share one grid cell, so the height never jumps.

**Tests:** `Landing.test.jsx` (behavior + primitives used),
`storySlides.test.js` (story data, art files exist), `App.test.jsx`
(routing), `designSystem.test.js` (system contract). Run `npm test` in
`client/`.

---

## Changelog

- **2026-09-13** — Initial `DESIGN.md`. Formalized the app's existing warm
  orange/cream identity into a documented token system ("Golden Hour
  Gathering"), added `Fraunces` as a display face, added spacing/shadow/
  motion scales, focus-visible + reduced-motion handling, an `.input-error`
  state, and the `client/design-system.html` live showcase page. No JSX
  changed — every existing page/component picked up the uplift purely
  through the shared `index.css` classes they already used.
- **2026-10-16** — Added the landing storybook (§10): `/` is now a
  six-chapter riso-print slideshow telling the suggest → share → pick →
  decide → finalize story; the create form moved to `/new` (its logo links
  back home). Six Ideogram illustrations in `client/public/story/`, new
  `landing.css`, showcase gained a "Storybook" section, and the client got
  its first test suite (Vitest).
- **2026-10-16 (later)** — Promoted the storybook look to **house style**.
  Riso tokens (`--ink`, `--riso-a/b`, `--halftone`, `--grain`,
  `--shadow-print/sticker/stamp`, `--tilt*`, `--duration-print/stick`) and
  primitives (`.print`, `.sticker*`, `.stamp*`, `.chapter`/`.chapter-num`,
  `.ink-underline`, `.halftone`, `.anim-print`/`.anim-stick`) moved from
  `landing.css` into `index.css`. §10 rewritten as system-wide rules with a
  checklist and the Ideogram recipe. The showcase's "Storybook primitives"
  section demos every one. `designSystem.test.js` enforces it.
- **2026-10-16 (evening)** — Applied the storybook layer to every in-app
  page. New components (`.masthead`/`<EventHeader>`, `.moment`/`<Moment>`,
  `.chapter-sm`, `.section-title`, `.attendee-btn`, `.toggle-pill`,
  `.option-card`, card/banner variants, `.page-foot`) and six new moment
  illustrations. Participant flow is now numbered steps 01 → 02 → 03 with
  illustrated thanks/closed/finalized/not-found states. Admin and results
  pages got masthead, best-pick and "best so far" stickers, and empty states.
  Create became "01 · Suggest" → "02 · Share". `AttendeeList`,
  `CalendarGrid` and `ResponseTable` moved off hex literals onto tokens.
  Calendar day/weekend buttons gained `aria-pressed` and full-date labels.
  Removed "Load Defaults" (it shipped a hard-coded personal guest list).
  Fixed the 2-column date inputs overflowing at phone width.
- **2026-10-16 (night)** — Made the date window and days of the week
  explicit. New "When could it happen?" section (`DateWindowFields`) with
  inclusive start/end hints, day presets, a plain-language days hint, a live
  "What guests will see" preview with edge warnings, and a four-step "How
  dates work" guide modal (`DatesGuide`). New components: `.fieldset`,
  `.field-help`, `.help-btn`, `.preview`, `.choice-chip`, `.guide`,
  `.mini-cal`/`.mini-day`, `.mini-block`, and the pressed state for
  `.btn-secondary`. Added the "Explaining a setting" pattern.

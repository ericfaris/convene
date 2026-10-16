# Changelog

## Unreleased

### Added
- **"When could it happen?"** section on the create form. Window start and end are labeled as the inclusive first and last days guests can pick. Day-of-week presets (Every day, Weekends Fri–Sun, Sat & Sun, Weeknights Mon–Thu) come with a hint that says exactly which days are hidden and whether guests tap single days or whole blocks.
- **Live "What guests will see" preview**: a plain-language summary, the first few choices, and warnings when a block is cut short by the window's edge, the window starts in the past, or the window is very long. It blocks submitting a window that ends before it starts or contains none of the chosen days.
- **"How dates work" guide**: a four-step modal covering the window, days of the week, single days vs. blocks, and how the best date is ranked. It ends with "With your settings…".

### Fixed
- Organizer suggestions now rank the choices guests actually saw, by **people free on every day** of them. Before, they always proposed Fri–Sun/Sat–Mon windows regardless of the chosen days, and counted person-days, which could read as "6 of 5 available".
- Results for an every-day event list one row per date instead of one row for the whole window.
- Guests east of UTC (e.g. Europe) saw every calendar date shifted back by one day.
- The server rejects a window that ends before it starts or contains none of the chosen days.
- Date inputs no longer clip their text on narrow phones.

## 1.0.0 — 2026-10-16

The first official release. Convene finds the date everyone can make: suggest a window, share one link, and lock in the best date. No sign-ups, no app.

### What's in it
- **Landing page (`/`)**: a six-chapter illustrated story (the problem → suggest → share → pick → decide → finalize) with autoplay, pause, keyboard and swipe controls. It respects reduced-motion settings.
- **Create (`/new`)**: name the gathering, pick a date window and days of the week, list who's invited. You get a guest link to share and a private admin link.
- **Guest page (`/e/:token`)**: tap your name, tap the dates that work, add a note. Come back anytime to change your picks. Clear screens for closed, finalized and broken links.
- **Results (`/e/:token/results`)**: who's free which weekend, the best option so far, and who hasn't replied.
- **Organizer dashboard (`/admin/:token`)**: reply progress, top suggested dates, an availability heatmap, a responses table, adding people late, and finalizing the date.
- **Design system**: "Golden Hour Gathering · Storybook". A riso-print look with illustrated moments throughout, documented in `DESIGN.md` and shown live at `/design-system.html`.
- **Tests**: client test suite (Vitest + Testing Library) covering every page state, the components, and a design-system contract.

### Notes
- Package versions were reset to `1.0.0` (previously client `1.3.0`, server `1.4.2`, untagged) to mark the first official release.

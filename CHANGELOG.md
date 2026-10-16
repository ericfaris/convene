# Changelog

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

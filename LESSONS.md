# Lessons

## 2026-10-16 — Storybook landing page (`/`), form moved to `/new`
- **Ideogram art delivery**: `ideogram_4_5` at 2304×1728 still serves 1024×768 WebP from the `…/balanced/response/<id>@2k` URL (the `full/` path 404s). 1024px is plenty for a ~600px slide; WebP came in at 27–135 KB, so no re-encode needed.
- **Character consistency across scenes** came from repeating one literal description ("a woman with a short dark bob haircut and an orange sweater") plus an identical style suffix in every prompt, with 2 variations each to pick from. Always add "no text" or the model letters the calendars. Prompt suffix is recorded in DESIGN.md §10.
- **Tests**: vitest 3 pins vite ≤7; with vite 8 use vitest 5 (+ jsdom). Carousel slides that are `aria-hidden` drop out of `getAllByRole`, so assert hidden-slide content via `querySelector`.
- **Autoplay vs. CSS progress bar**: JS `setTimeout` drives the advance (testable with fake timers); the CSS fill is visual only and gets re-keyed on resume so the two never drift.
- **Deploy gotcha**: push to `main` auto-deploys via the self-hosted runner. The client now has `npm test`, but CI only runs `docker build`, so run the tests locally before pushing.
- **Shell gotcha**: `pkill -f "<pattern>"` inside a compound Bash command matches its own shell and kills it (exit 144); stop a background server by PID instead.

## 2026-10-16 — Storybook look applied to all in-app pages
- **Screenshot every state without touching prod data**: Playwright `page.route('**/api/**', …)` against `vite preview` with fixture JSON renders each page state (finalized, closed, empty, not-found) safely. The live app on :8300 shares the production DB, so never create test events there.
- **`grid-template-columns: 1fr 1fr` overflows on phones** when the cells hold `input[type=date]` (1fr's minimum is min-content). Use `minmax(0, 1fr)`; base inputs now carry `min-width: 0`.
- **Contract tests pay off immediately**: banning hand-rolled riso effects in page CSS caught a fork on the first run, and banning hex literals in routed pages forced the leftover inline colors onto tokens.

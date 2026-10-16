# Convene

Group date-finding app: React + Vite client (`client/`), Express + MongoDB API (`server/`). See README.md.

## Design system — follow it for all UI work
- **`DESIGN.md` is the source of truth.** Read it before touching UI. **§10 Storybook layer is house style**: riso-print look, with `.print`, `.sticker`, `.stamp`, `.chapter`, `.ink-underline`, `.halftone`. Use its checklist for every new screen or state.
- Tokens and primitives live only in `client/src/index.css`. Page CSS composes them and never hand-rolls offset shadows, tilts, grain or outlined numerals. `client/src/designSystem.test.js` enforces this.
- New primitives go into `index.css`, DESIGN.md §10 and the "Storybook primitives" section of `client/design-system.html` in the same change.
- New illustrations: generate them with Ideogram using DESIGN.md §10's recipe (exact prompt suffix, recurring character "Maya"), save as WebP under `client/public/story/`, and always write alt text.

## Working
- `cd client && npm test` (Vitest) and `npm run build` before committing.
- Pushing to `main` auto-deploys to convene.mooseflip.com via the self-hosted runner. CI only runs `docker build`, so run the tests locally first.
- Routes: `/` landing story, `/new` create form, `/e/:token` participant, `/admin/:token` admin.

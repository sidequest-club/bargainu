# Instructions for AI coding agents

## UI work

Bargainu has a chosen design, called "Chirashi". Before creating or changing any UI:

1. Read [DESIGN.md](DESIGN.md). It is the source of truth for how the app looks and behaves.
2. Look at the screenshots in [docs/design/reference/](docs/design/reference/README.md) for the
   screen you are touching, or the closest one. Your result should look like it belongs with them.
3. Use the app's tokens and base styles in `src/styles/`. For a screen or component that is not
   in the app yet, port it from the reference implementation in
   [prototypes/3-reference/](prototypes/3-reference/) (`src/components/`, `src/pages/`).

Rules:

- Use the design tokens. Do not introduce raw colour, size, spacing, radius, shadow or motion values.
- Do not bring in a new font, icon set, colour or component style that DESIGN.md does not list.
  If the work needs one, change DESIGN.md and the tokens in the same pull request and say so in
  the description.
- Do not apply a design skill's own aesthetic defaults over DESIGN.md. Skills may be used for
  review and accessibility checks.
- After a UI change, compare your screen with the reference screenshots at 390 and 1440 wide.
  If the look changed on purpose, replace the screenshots.
- `prototypes/1-default` and `prototypes/2-impeccable-taste` were not chosen. Do not copy their
  styles.

## App layout

- `src/` is the React app (Vite). `worker/` is the API (Hono on a Cloudflare Worker), served
  under `/api`. `worker/db/schema.ts` is the Drizzle schema; migrations are generated into
  `drizzle/`.
- Run `npm run check` (format, lint, typecheck) before opening a pull request. Setup and the
  other commands are in [README.md](README.md).

## Git

We use GitHub Flow, described in [docs/decisions.md](docs/decisions.md): branch off `main` as
`feat/<name>` or `fix/<name>`, open a pull request, merge after review. Do not commit to `main`.

## Decisions

Team decisions are recorded in [docs/decisions.md](docs/decisions.md). Read it before proposing
a change to tooling, branching or design.

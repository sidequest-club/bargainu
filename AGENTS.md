# Instructions for AI coding agents

## UI work

Bargainu has a chosen design, called "Chirashi". Before creating or changing any UI:

1. Read [DESIGN.md](DESIGN.md). It is the source of truth for how the app looks and behaves.
2. Look at the screenshots in [docs/design/reference/](docs/design/reference/README.md) for the
   screen you are touching, or the closest one. Your result should look like it belongs with them.
3. Reuse the reference implementation in [prototypes/3-reference/](prototypes/3-reference/):
   its tokens (`src/styles/tokens.css`) and its components (`src/components/`).

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

## Git

We use GitHub Flow, described in [docs/decisions.md](docs/decisions.md): branch off `main` as
`feat/<name>` or `fix/<name>`, open a pull request, merge after review. Do not commit to `main`.

## Decisions

Team decisions are recorded in [docs/decisions.md](docs/decisions.md). Read it before proposing
a change to tooling, branching or design.

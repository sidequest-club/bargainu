# Instructions for AI coding agents

## UI work

Read [DESIGN.md](DESIGN.md) before creating or changing any UI. It is the source of truth for how
Bargainu looks and behaves.

- Use the design tokens it defines. Do not introduce raw colour, size, spacing, radius, shadow or
  motion values.
- Do not bring in a new font, icon set, colour or component style that DESIGN.md does not list.
  If the work needs one, change DESIGN.md and the tokens in the same pull request and say so in
  the description.
- Do not apply a design skill's own aesthetic defaults over DESIGN.md. Skills may be used for
  review and accessibility checks.
- How the design was produced, and how to produce more in the same way, is in
  [docs/design/recipes/](docs/design/recipes/README.md).

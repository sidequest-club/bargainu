# Bargainu design system

**Status: not chosen yet.** Three prototypes exist and the team has not picked one. Until it does,
there is no design system to follow, and no new UI should be built outside `prototypes/`.

## The three candidates

| # | Recipe | Draft design system |
|---|---|---|
| 1 | frontend-design + web-design-guidelines + Emil Kowalski | [prototypes/1-default/DESIGN.md](prototypes/1-default/DESIGN.md) |
| 2 | Impeccable + Taste Skill | [prototypes/2-impeccable-taste/DESIGN.md](prototypes/2-impeccable-taste/DESIGN.md) |
| 3 | Reference-driven | [prototypes/3-reference/DESIGN.md](prototypes/3-reference/DESIGN.md) |

How each was built: [docs/design/recipes/](docs/design/recipes/README.md).

## When the team has chosen

1. Replace this file with the chosen prototype's `DESIGN.md`.
2. Copy that prototype's `src/styles/tokens.css` into the app as the only place design tokens are
   defined.
3. Record the decision and date at the top of this file.

## Rules that already apply

- Every colour, font size, spacing value, radius, shadow and motion value comes from a token in
  `tokens.css`. No raw values in components.
- A change to the look of the app is made by changing this file and the tokens first, in the same
  pull request as the UI change.
- A new component follows the component rules in this file. If the rules do not cover it, add the
  rule here before building it.

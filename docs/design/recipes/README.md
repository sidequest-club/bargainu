# How the three UI/UX prototypes were built

Three prototypes of the same app were generated on 2026-10-04, each by one AI agent that was given
the same product brief and a different design recipe. This folder records each recipe so the same
process can be run again.

| # | Recipe | Folder | Recipe file |
|---|---|---|---|
| 1 | frontend-design + web-design-guidelines + Emil Kowalski | `prototypes/1-default` | [1-default.md](1-default.md) |
| 2 | Impeccable + Taste Skill | `prototypes/2-impeccable-taste` | [2-impeccable-taste.md](2-impeccable-taste.md) |
| 3 | Reference-driven, no design skill | `prototypes/3-reference` | [3-reference.md](3-reference.md) |

## What "reproduce" means here

Running a recipe again gives a design in the same style, not the same pixels, because the agent's
output is not deterministic. The exact result is kept by the code in `prototypes/` and by each
prototype's `DESIGN.md`. Use the recipe to make new screens in the same way, and `DESIGN.md` to
keep them consistent with what exists.

## What was held constant

- **Brief:** [prototypes/BRIEF.md](../../../prototypes/BRIEF.md). It lists the five screens, the
  filters, the technical rules and the deliverables, and says nothing about looks.
- **Data and images:** [prototypes/shared/deals.ts](../../../prototypes/shared/deals.ts), 60 invented
  deals, and 60 Unsplash photos fetched by `prototypes/shared/scripts/fetch-images.mjs`.
- **Scaffold:** `npm create vite@latest -- --template react-ts` (Vite 8.3, React 19.2,
  TypeScript 6.0), then `vite.config.ts` changed to `base: './'`, `publicDir: '../shared/public'`
  and an `@shared` alias.
- **Agent:** Claude Code 2.1.289, model `claude-opus-5-5`, one general-purpose subagent per
  prototype, started from a session whose working directory was the repo root. Each agent ran
  without human input and could not see the other two prototypes.
- **Self-check:** each agent took screenshots of its own dev server with
  `prototypes/shared/scripts/shot.sh` (headless Chrome).

## Steps to run a recipe again

1. Clone the skill repositories named in the recipe file at the commits listed there.
2. Create a fresh prototype folder from the scaffold above, next to `prototypes/shared`.
3. Start a Claude Code session in the repo and give a subagent the prompt in the recipe file,
   with `$SKILLS` replaced by the folder holding your clones and the port and folder adjusted.
4. When it finishes, read its `RECIPE-NOTES.md` for the choices it made, and click through the app.

## Build and deploy

```
cd prototypes
./build.sh --shots     # builds dist/ with the comparison page and /1 /2 /3
npx wrangler deploy    # uploads dist/ as static assets, configured in wrangler.jsonc
```

The deployed site is https://bargainu-prototypes.asakurayuta.workers.dev (Yuta's Cloudflare account,
Workers static assets). `wrangler pages` was not used: wrangler 4.142 now hands Pages projects over
to Workers.

Each prototype keeps its sign-in and favorites under its own `localStorage` keys
(`bargainu.p1.*`, `bargainu.p2.*`, `bargainu.p3.*`), because all three are served from one origin.

## After the team chooses

1. Copy the chosen prototype's `DESIGN.md` to the repo root as `DESIGN.md`.
2. Copy its `src/styles/tokens.css` into the real app as the single source of design tokens.
3. Keep its recipe file and `RECIPE-NOTES.md`. Delete or archive the other two prototypes.

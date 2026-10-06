# Bargainu (バーゲイヌ)

> Working title was "Bargain Finder". **Bargainu** = bargain + 犬 (dog): a dog that sniffs out the best deals.

A web app that collects ongoing discounts and sales from Japanese online stores and shows them in one place.

## Why this project

This is the first Sidequest Club project. The main goal is to learn how to work together, since we all come from different companies with different standards. We chose this idea because it is simple and well-defined, so we can focus on how we work as a team. To keep it manageable we set a clear scope, and we use free tools only so nobody has to pay anything.

## Scope (v1)

| | |
|---|---|
| **Market** | Japan only |
| **Stores (trial)** | Yodobashi, Rakuten, Amazon |
| **Channel** | Online stores only |
| **Platform** | Web app first (mobile can be tried in a later project) |
| **Team** | Yuta, Norty, Mizuki |
| **Way of working** | Agile-style sprints, syncing 1–2 times a week |

## Timeline

About 4.5 weeks in total. Norty's leave still needs to be factored in.

| Phase | Duration |
|---|---|
| Planning | 1 week |
| Build | 2 weeks |
| Testing | 1 week |
| Deployment / infra | 3 days |

## Tech stack

Decided, see [docs/decisions.md](docs/decisions.md).

- **Frontend:** Vite + React + TypeScript
- **Backend:** Hono on a Cloudflare Worker
- **Database:** Cloudflare D1, with Drizzle for queries and migrations
- **Login:** Better Auth with Google sign-in
- **Lint and format:** Oxlint and Oxfmt
- **Data collection:** a separate collector, run on a schedule by GitHub Actions
- **Hosting:** Cloudflare
- **Project management:** Linear (free plan)

## Running it locally

Needs Node 24 or newer.

```
npm install
cp .dev.vars.example .dev.vars     # then fill in the values, see the comments in the file
npm run db:migrate:local           # creates the local database
npm run dev                        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Runs the app and the API together, with a local database |
| `npm run check` | Format check, lint and typecheck. Run before opening a pull request |
| `npm run format` | Formats the code with Oxfmt |
| `npm run build` | Typechecks and builds into `dist/` |
| `npm run db:generate` | Writes a new migration into `drizzle/` after `worker/db/schema.ts` changes |
| `npm run db:migrate:local` | Applies migrations to the local database |
| `npm run db:migrate:remote` | Applies migrations to the deployed database |
| `npm run auth:generate` | Regenerates the login tables after `worker/auth.ts` changes |
| `npm run deploy` | Builds and deploys to Cloudflare |

Where things are: `src/` is the React app, `worker/` is the API, `drizzle/` holds the database
migrations, and `prototypes/` holds the three design prototypes that were compared.

## End of project: what we'll have built

- Collects data from online stores on ongoing discounts and bargain sales
- Shows those discounts in the app
- A "Top Discounts" section
- Filters: discount %, brand, category (shoes, clothes, etc.), prefecture/city, and online vs in-store
- User login
- Favorites

## Homework before next sync

| Who | What |
|---|---|
| **Norty** | Research what data is available from each store (official APIs vs scraping, what's allowed) + list possible features |
| **Mizuki** | Set up project management: Linear workspace, Vercel, timeline/Gantt chart, and a shared doc for real-time collaboration + list possible features |
| **Yuta** | Create the GitHub repo and do the initial project setup + draft the UI/UX + list possible features |

## Still to decide

- Final timeline once Norty's leave dates are confirmed
- Name checks for Bargainu: domain, app stores and Japanese trademarks (J-PlatPat) are not checked yet

## Decisions so far

Recorded in [docs/decisions.md](docs/decisions.md).

| Topic | Decision |
|---|---|
| UI/UX | Prototype 3, "Chirashi": [docs/design/reference/](docs/design/reference/README.md) |
| Git branching | GitHub Flow |
| Project management | Linear |
| Hosting | Cloudflare |
| Tech stack | Vite + React, Hono, D1, Better Auth, all on Cloudflare |

- Design system: [DESIGN.md](DESIGN.md), with screenshots in [docs/design/reference/](docs/design/reference/README.md)
- The three prototypes that were compared: code in [prototypes/](prototypes/). They are no longer deployed.
- How each prototype was built: [docs/design/recipes/](docs/design/recipes/README.md)

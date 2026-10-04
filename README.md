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

## Tech stack (proposed)

- **Frontend:** React + TypeScript
- **Backend:** Serverless (Supabase / Cloudflare Workers / Vercel functions)
- **Hosting & DB:** Vercel + Supabase or Neon
- **Project management:** Linear (free plan)

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

## UI/UX prototypes

Three prototypes of the finished v1 app, built from the same brief and data with three different design recipes:
https://bargainu-prototypes.asakurayuta.workers.dev

- Code: [prototypes/](prototypes/)
- How each was built, and how to do it again: [docs/design/recipes/](docs/design/recipes/README.md)
- Design system (pending the team's choice): [DESIGN.md](DESIGN.md)

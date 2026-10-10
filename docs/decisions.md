# Decisions

Team decisions for Bargainu, newest first. Add an entry when the team agrees something that
changes how we work or what we build. Recorded on the date shown; the team is Yuta, Norty and Mizuki.

## 9. Testing: Vitest in the Workers runtime, Playwright in a browser (2026-10-08)

**Decision:** two kinds of automated test, both run by CI on every pull request.

| Kind | Tool | Where |
|---|---|---|
| API | Vitest 4 with `@cloudflare/vitest-plugin` | `tests/api/` |
| Browser | Playwright, Chromium only | `tests/e2e/` |

**Why:** Cloudflare's Vitest integration runs the tests inside the same runtime as the deployed
Worker, with a real local D1 built from our migrations, so a route is tested with the bindings it
has in production and nothing is mocked. Playwright reads the `storageState` file that
`npm run dev:session` already writes, which gives a signed-in browser without Google.

**Checked against our setup:** the integration needs Vitest 4.1 or later in the 4.x line (not
Vitest 5), and works with Vite 8 and our `wrangler.jsonc` unchanged. The package was renamed from
`@cloudflare/vitest-pool-workers`, which is deprecated.

**What follows:**

- A merge to `main` is deployed only if both the `check` and `e2e` jobs pass.
- A new or changed Worker route comes with an API test. Browser tests are kept to whole flows a
  user depends on; they are slower and use the local database.
- The script tests in `scripts/` stay on Node's built-in test runner.

Chosen by Yuta while doing SID-26; Norty and Mizuki have not reviewed it yet.

## 5. Tech stack: all on Cloudflare (2026-10-06)

**Decision:** option A of the tech stack proposal. Everything runs in the team's Cloudflare
account, on the free plan.

| Part | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| API | Hono on a Cloudflare Worker, deployed together with the frontend |
| Database | Cloudflare D1 (SQLite) |
| Queries and migrations | Drizzle |
| Login | Better Auth with Google sign-in |
| Lint | Oxlint |
| Format | Oxfmt |
| Data collection | A separate collector, run on a schedule by GitHub Actions |

**Why:** one account and one deploy, nothing that sleeps or pauses, and it costs nothing. The
chosen design is already a Vite + React app, so its tokens and components carry over.

**Options considered:** A, all Cloudflare with D1; B, Cloudflare with Neon Postgres; C, Cloudflare
with Supabase Postgres. Next.js was ruled out: Cloudflare's path for new Next.js apps is in beta,
and showing up in search results is not in scope for v1. The comparison, with free-plan limits and
sources, is at https://claude.ai/artifact/HYTbWomd48yP4XBSGscFzh. Agreed by Yuta and Mizuki in
Slack; Norty had not replied when this was recorded.

**What follows:**

- The collector is independent of the app. Whoever builds it chooses how, including the language.
  It cannot connect to D1 directly, so it sends its data to a protected endpoint on the Worker,
  or writes files to R2 for a Worker to load.
- Where the data can come from, as far as we have checked: Rakuten has an official Ichiba Item
  Search API. Amazon's Product Advertising API 5 is deprecated and replaced by the Creators API,
  which is for affiliate partners; what it takes to qualify is not checked. Yodobashi most likely
  has to be scraped; we have not looked for an official API or read its terms of use.
- If the import step into D1 proves painful, option B is the fallback. Drizzle supports both
  databases.

**CPU time, measured on the deployed Worker (2026-10-08):** the free plan allows 10 ms of CPU
per request. The signed-out routes fit. The Google sign-in, sign-out and the first signed-in
request after an idle spell do not.

| Request | Samples | CPU ms, median | CPU ms, highest |
|---|---|---|---|
| `GET /api/health` | 25 | 0 | 1 |
| `GET /api/me`, signed out | 25 | 0 | 0 |
| `GET /api/deals`, signed out, no deals in the database | 25 | 1 | 5 |
| `GET /api/auth/get-session`, signed out | 10 | 1 | 6 |
| `POST /api/auth/sign-in/social`, the step before Google | 15 | 3 | 9 |
| `GET /api/auth/callback/google`, the step after Google | 2 | 21 and 32 | 32 |
| `GET /api/auth/get-session`, signed in | 3 | 5 | 33 |
| `GET /api/favorites`, signed in, nothing saved | 3 | 5 | 6 |
| `POST /api/auth/sign-out` | 3 | 11 | 31 |

- The callback from Google was two to three times the limit on both sign-ins. The 33 ms and 31 ms
  readings were each the first request after the Worker had been idle.
- No request was stopped: every one finished with outcome `ok`, and both sign-ins worked.
  Cloudflare lets a Worker run over the limit now and then, and stops it with error 1102 if it
  goes over consistently
  ([limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time)). So sign-in
  works today on that allowance. It is not something to rely on.
- How it was measured: `npx wrangler tail bargainu --format json` prints `cpuTime` in whole
  milliseconds for each request. Requests were sent at least a second apart, because the tail
  drops entries when they come faster.
- Two sign-ins is a small sample. It is enough to say the callback is over, not by how much.

**Where the callback's time goes (profiled locally, 2026-10-11):** there is no single expensive
step to remove. Better Auth does not verify the signature of Google's ID token in the callback,
and the only hashing is cheap: it checks one signed cookie and signs another. The work is database statements: a first
sign-in runs 10 and a returning one 9, against 1 for the step before Google and 2 for a signed-in
`get-session`. The CPU time is spread across Better Auth, zod and Drizzle building and reading
them.

- How it was profiled: the Worker's own auth options run in Node against a local D1, with Google's
  token endpoint stubbed, under the V8 CPU profiler. In that setup the callback's first run in a
  fresh process cost about five times its warm runs. That ratio is from Node on a laptop, not from
  the Worker.
- Cloudflare's limits page says Workers that handle authentication typically use 10 to 20 ms.

**Decided (Yuta, 2026-10-11):** stay on the free plan and change no code.

- Three requests went over: the callback on both sign-ins, sign-out at its median (11 ms), and the
  first signed-in `get-session` after the Worker had been idle (33 ms). The app asks for the
  session on every page load, so that last one is the one a signed-in visitor meets most often.
  Once the Worker was warm, `get-session` took 5 ms.
- All of them work today on Cloudflare's allowance for running over now and then, and every
  route a signed-out visitor uses is under the limit.
- Move the account to Workers Paid ($5 a month) when a request ends with outcome `exceededCpu`
  (error 1102), or before the public launch, whichever comes first. The outcome shows in the
  Cloudflare dashboard under the Worker's Metrics, Errors, Invocation Statuses, as "Exceeded CPU
  Time Limits".
- Not chosen: storing the sign-in state in a cookie (`account.storeStateStrategy`), which would
  take 5 statements off the callback. It is unlikely to bring the callback under 10 ms by itself,
  does nothing for `get-session` or sign-out, and was not measured on the deployed Worker. It is
  the first thing to try if we want to stay free for longer.
- Not chosen: moving the database to Neon (option B). It would not help, because waiting on the
  database does not count as CPU time.

**Not measured yet:** `/api/deals` with real deals, saving a favourite (the deployed database
has no deals), and a collector import (the endpoint does not exist yet).

## 4. Hosting: Cloudflare (2026-10-05)

**Decision:** the app is hosted on Cloudflare, in a team account that Mizuki created and invited
everyone to.

**Why:** Vercel's free tier does not let the three of us collaborate on one project. Cloudflare's
does, and it also gives us Workers, Pages and R2 at low cost.

**Options considered:** Vercel (the original proposal in the README) and Cloudflare. Agreed in
the #brainstorming channel on Slack.

**What follows:** the prototypes were on Yuta's personal Cloudflare account and were going to move
to the team account. They were retired instead on 2026-10-06, once prototype 3 was being ported
into the app: the deployment was removed and only the app is deployed to the team account. The
backend and database are not decided yet.

## 3. UI/UX: prototype 3, "Chirashi" (2026-10-05)

**Decision:** the app is built on prototype 3, the reference-driven design in a Japanese sale-flyer
style.

- Design system: [DESIGN.md](../DESIGN.md)
- Screenshots of every screen: [docs/design/reference/](design/reference/README.md)
- Code: [prototypes/3-reference/](../prototypes/3-reference/)

**Options considered:** three prototypes with the same screens and data, compared side by side on
a deployed page that has since been removed. Their code is in [prototypes/](../prototypes/).

| # | Recipe | Outcome |
|---|---|---|
| 1 | frontend-design + web-design-guidelines + Emil Kowalski | not chosen |
| 2 | Impeccable + Taste Skill | not chosen |
| 3 | References from Awwwards and footer.design, motion from `fancy` | **chosen** |

How each was built is in [docs/design/recipes/](design/recipes/README.md).

**What follows:** UI work reads `DESIGN.md` first and uses its tokens. Prototypes 1 and 2 stay in
`prototypes/` as a record until the team decides to remove them.

## 2. Git branching: GitHub Flow (2026-10-05)

**Decision:** we use GitHub Flow.

![GitHub Flow: short branches off main, each merged back through a pull request and deployed](branching/1-github-flow.drawio.png)

How it works for us:

1. `main` is always deployable. Nobody commits to it directly.
2. Start each piece of work on a short branch off `main`, named for what it does:
   `feat/top-discounts`, `fix/login-redirect`.
3. Push the branch and open a pull request.
4. After review, merge the pull request into `main` and delete the branch.
5. Every merge to `main` is deployed. GitHub Actions does it: database migrations first, then
   the app. A failed migration stops the deploy.

**Options considered:** [GitHub Flow](branching/1-github-flow.drawio.png),
[Git Flow](branching/2-git-flow.drawio.png) and
[trunk-based development](branching/3-trunk-based.drawio.png). The editable diagrams are the
`.drawio` files next to each image.

**Not decided yet:** how many approvals a pull request needs, whether merges are squashed, and
whether `main` gets branch protection on GitHub.

## 1. Project management: Linear (2026-10-05)

**Decision:** work is tracked in Linear, in the Sidequest Club workspace, on the free plan.
Issue keys start with `SID-`.

Collaborative documents are being tried in Notion.

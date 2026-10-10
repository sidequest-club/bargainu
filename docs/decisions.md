# Decisions

Team decisions for Bargainu, newest first. Add an entry when the team agrees something that
changes how we work or what we build. Recorded on the date shown; the team is Yuta, Norty and Mizuki.

| #   | Decision                                                                     | Date       |
| --- | ---------------------------------------------------------------------------- | ---------- |
| 9   | [Testing](#9-testing-vitest-in-the-workers-runtime-playwright-in-a-browser-2026-10-08): Vitest and Playwright | 2026-10-08 |
| 8   | [How we work](#8-how-we-work-2026-10-10): two weekly meetings, two labels    | 2026-10-10 |
| 7   | [v1 scope](#7-v1-scope-rakuten-only-2026-10-10): Rakuten only                 | 2026-10-10 |
| 6   | [Rakuten data](#6-rakuten-data-what-the-terms-allow-2026-10-08): prices 24 h  | 2026-10-08 |
| 5   | [Tech stack](#5-tech-stack-all-on-cloudflare-2026-10-06): all on Cloudflare   | 2026-10-06 |
| 4   | [Hosting](#4-hosting-cloudflare-2026-10-05): Cloudflare                       | 2026-10-05 |
| 3   | [UI/UX](#3-uiux-prototype-3-chirashi-2026-10-05): prototype 3, "Chirashi"     | 2026-10-05 |
| 2   | [Git branching](#2-git-branching-github-flow-2026-10-05): GitHub Flow         | 2026-10-05 |
| 1   | [Project management](#1-project-management-linear-2026-10-05): Linear         | 2026-10-05 |

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

## 8. How we work (2026-10-10)

**Decision:** we follow one written routine. It is kept in two documents on the team's Home page
in Linear, and not repeated here:
[Start here](https://linear.app/sidequest-club/document/start-here-where-things-go-and-how-a-week-runs-61244d237fb9)
for where things go and how a week runs, and
[Team rules](https://linear.app/sidequest-club/document/team-rules-7841ba32ee1b) for the rules.
Decided by Yuta on 2026-10-10 after the sync on 2026-10-09, to be presented to the team on
2026-10-13.

A week has two 30-minute meetings. On Monday we plan: pick the week's work and give each task an
owner, a reviewer, a "done when" sentence and a review label. On Friday we review: demo what got
finished, look at what did not, and discuss anything open. Anyone can propose a rule change, and
proposals are gone through on Friday.

![How a project, a week and a pull request go](process/how-we-work.drawio.png)

The one rule copied here, because coding agents read this file and not Linear, is the pull request
label. `ai-review` is the default: the pull request merges when CI passes and the AI review is
clean, and nobody waits for a person. Use `human-review` only when one of these is true:

| Question                                    | Example                                       |
| ------------------------------------------- | --------------------------------------------- |
| Does a person have to see it to judge it?   | How a screen looks or feels                   |
| Is it impossible to undo?                   | Deletes real users' data, spends money        |
| Is it a decision for all three of us?       | Scope, a rule, what a store's terms let us do |

A `human-review` pull request also waits for its named reviewer. Database changes, sign-in code,
deploy scripts and new libraries are `ai-review` unless one of the three questions applies.

**Why:** after the first week one person had created and done most of the work, the others did not
know what to pick up, and long AI-written text hid the few things a person had to read.

**What follows:**

- Notion is no longer used. Rules live in the Linear documents, decisions stay in this file. This
  replaces the last line of decision 1.
- Linear has one project per app, starting with "Bargainu v1", with a milestone for each week.
  Tasks about how we work carry the `team` label and belong to no project.
- Long AI-written updates go to #p1-updates in Slack. #project-1-bargainu is for short messages.
- A problem the AI reviewer finds outside a pull request's scope becomes a Linear issue.

**Not decided yet:** which AI reviewer runs on pull requests (SID-36).

## 7. v1 scope: Rakuten only (2026-10-10)

**Decision:** v1 collects and shows deals from Rakuten only. A deal is an item in a sale period or
with boosted points, which is option 1 for the deal data model (SID-17). Decided by Yuta on
2026-10-10, to be presented to the team on 2026-10-13.

**Why:** Rakuten is the only store with a working collector. Decision 6 rules out price history,
which leaves option 1, and leaves open whether a site that also lists other stores breaks
第10条1項(6). One store removes that question for v1.

**What follows:**

- The end date is fixed at 2026-11-02. If time runs short, scope is cut in this order: the
  discount % filter, then the prefecture/city and in-store filters.
- Amazon, Yodobashi and Yahoo! Shopping are out of v1. SID-18 and SID-33 are not needed for it.

## 6. Rakuten data: what the terms allow (2026-10-08)

This entry records what Rakuten's rules say, read on 2026-10-08 for SID-19. The team has not
agreed the points under "Not decided yet". The Japanese text of the terms is the binding one, so
the article names below are the Japanese ones.

Sources:

- [楽天ウェブサービス規約](https://webservice.rakuten.co.jp/guide/rule), last revised 2012-06-28.
- [クレジット表示方法と注意](https://webservice.rakuten.co.jp/guide/credit).
- Rakuten Web Service help, ご利用ルール:
  [how often to update data](https://webservice.faq.rakuten.net/hc/ja/articles/900001974343)
  (edited 2024-04-01),
  [what the data may be used for](https://webservice.faq.rakuten.net/hc/ja/articles/900001974363),
  [showing other stores' items](https://webservice.faq.rakuten.net/hc/ja/articles/900001970786),
  [request limit](https://webservice.faq.rakuten.net/hc/ja/articles/900001974383).

The terms themselves give no storage period. 第10条1項(7) allows copying only as Rakuten sets out
separately, and 第1条4項 makes the help pages part of the rules. The periods are in the help.

**Storing prices: 24 hours at most.**

| Rule | What the help page says |
|---|---|
| Keeping data | Price and availability (価格情報、販売可能情報): 24 hours. Everything else: 3 months. Rakuten can tell us to delete it at any time. |
| Refreshing what we show | A price or availability we display must be fetched again at least once a week. |
| Showing the update time | If we update less often than once an hour, the update date and time goes next to the price, with the disclaimer below next to it or behind a link. |
| Purpose | To introduce Rakuten's items and link to the item's page on Rakuten. Copying or changing the data for any other purpose is forbidden. |
| Requests | One request a second for each application ID. Rakuten does not raise this limit. |

The disclaimer, with our site name in place of ●●:

> このサイトで掲載されている情報は、●●（サイト名）の作成者により運営されています。価格、販売可能情報は、変更される場合があります。購入時に楽天市場店舗（www.rakuten.co.jp）に表示されている価格が、その商品の販売に適用されます。

So we cannot keep a price history and calculate price drops from it. That was option 2 for the
deal data model (SID-17). Option 1, a deal is an item in a sale period or with boosted points,
uses only what the API returns at the time and is allowed.

**Credit: required on every site that uses the API.**

- Use one of Rakuten's three credits, with their HTML unchanged. The text one is
  `<a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a>`.
  The other two are banner images, 221 x 21 and 311 x 30.
- It can go anywhere on the page, as long as it stays clear that the site uses Rakuten Web Service.
- Nothing may suggest that Rakuten runs the site or is our partner (第10条1項(1)). We have to say
  that we make and run it and are responsible for it (第11条1項).

**Other rules that affect the app.**

- Links (第8条4項): the part of the app that uses Rakuten data must link to Rakuten, and must not
  link to any other website. The help page says items from other stores may sit on the same page
  if each shows where it came from. A Rakuten deal card or page links only to Rakuten.
- Income (第3条, 第10条1項(4) and (5)): the only income allowed from this data is Rakuten
  Affiliate, with links made through it. No other affiliate programme on Rakuten items, and no
  paid tool built on the API. Rakuten Affiliate's own
  [guideline](https://affiliate.rakuten.co.jp/guideline/rule/) lists showing a list price we made
  up next to a lower price as a misleading display.
- Competing services (第10条1項(6)): the API may not be used for a service that competes, or might
  compete, with the Rakuten group. Nothing says whether a site that also lists Amazon and
  Yodobashi counts. Rakuten's help says it does not answer whether a particular use breaks the
  terms; each developer has to judge.
- Where the data is kept (第10条1項(9)): not anywhere that shares it with the public or with many
  people. The R2 bucket has to stay private.
- No press release about the app or the API without Rakuten's written consent (第19条).

**What follows:**

- SID-17: choose option 1. Do not add price history for Rakuten.
- Collector (SID-28, SID-25): every Rakuten price we hold has to be fetched again or deleted
  within 24 hours. That means a run at least once a day, removing deals a run did not refresh, and
  deleting raw files in R2 after a day or keeping them without prices.
- Screens (SID-24): the credit, the update time and disclaimer by each Rakuten price, a label
  showing which store a deal is from, and a line saying who runs the site.
- `collector/samples/rakuten-item-search.json` is a real API response with prices, committed to
  this public repository on 2026-10-06. It is past 24 hours and in a public place. Replace it with
  invented values.

**Not decided yet:**

- Whether a multi-store deal site is acceptable under 第10条1項(6). This is a risk for the v1 scope
  of three stores and the team has to judge it.
- Whether we join Rakuten Affiliate. If the app earns nothing, 第3条 does not apply.
- Whether our collector, a server sending `Referer` for a Web Application, is within the terms.
  Not checked here.

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
4. After review, merge the pull request into `main` with a merge commit and delete the branch.
5. Every merge to `main` is deployed. GitHub Actions does it: database migrations first, then
   the app. A failed migration stops the deploy.

**Options considered:** [GitHub Flow](branching/1-github-flow.drawio.png),
[Git Flow](branching/2-git-flow.drawio.png) and
[trunk-based development](branching/3-trunk-based.drawio.png). The editable diagrams are the
`.drawio` files next to each image.

**Protection on `main` (2026-10-11, SID-22):** GitHub enforces rule 1 and the checks.

- A change reaches `main` only through a pull request. A direct push is refused, for
  administrators too.
- A pull request merges only when the `check`, `e2e` and `review-label` jobs pass.
- GitHub requires no approval, because an `ai-review` pull request merges without one
  (decision 8). GitHub does not enforce the named reviewer of a `human-review` pull request.
- Pull requests are merged with a merge commit. Squash and rebase merging are turned off. A merge
  commit keeps the branch's commits for `git log` and `git bisect`, and
  `git log --first-parent main` still gives one line per pull request.

Decided by Yuta on 2026-10-11.

## 1. Project management: Linear (2026-10-05)

**Decision:** work is tracked in Linear, in the Sidequest Club workspace, on the free plan.
Issue keys start with `SID-`.

Collaborative documents were tried in Notion until 2026-10-10. See decision 8.

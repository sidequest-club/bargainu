# Decisions

Team decisions for Bargainu, newest first. Add an entry when the team agrees something that
changes how we work or what we build. Recorded on the date shown; the team is Yuta, Norty and Mizuki.

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

**Not checked yet:** whether Better Auth's Google sign-in and a collector import each fit in the
free plan's 10 ms of CPU per request. Test both during the initial project setup.

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

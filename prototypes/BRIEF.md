# Bargainu prototype brief

This is the product brief shared by all three UI/UX prototypes. It says what to build and
deliberately says nothing about how it should look. The look comes from each prototype's recipe.

## Product

**Bargainu (バーゲイヌ)** = bargain + 犬 (inu, dog): a dog that sniffs out the best deals.

A web app that collects ongoing discounts and sales from Japanese online stores and shows them
in one place. The trial stores are Yodobashi, Rakuten and Amazon. The market is Japan, so prices
are in yen. The UI copy is in English for now; Japanese comes later, so leave room for longer
and denser text.

The prototype shows the finished v1 app, not an MVP slice.

## Screens

Build all five as clickable flows with client-side state only.

1. **Home** — the landing view of the app. Must include a "Top Discounts" section. Should also
   give a way into categories and surface a few more deals (for example ending soon or just found).
2. **Browse** — the full deal list with these filters, all working:
   - discount % (minimum)
   - brand
   - category
   - prefecture, then city (only meaningful for in-store deals)
   - online vs in-store
   - store and sort order are welcome extras
   Show the result count, an empty state, and a way to clear filters.
3. **Deal detail** — sale price, original price, discount %, store, time left, location for
   in-store deals, a "Go to store" action (it can be a dead link), save to favorites, and related deals.
4. **Login** — email and password form plus a one-click demo sign-in. There is no backend:
   any input signs in as the demo user. Persist the session in `localStorage`.
5. **Favorites** — the saved deals. Signed-out users are asked to sign in first. Needs an empty
   state. Persist favorites in `localStorage`.

Navigation between all five must work on both a phone (375px wide) and a desktop (1440px wide).

## Data and images

Import everything from `@shared/deals` (file: `prototypes/shared/deals.ts`). It exports 60 deals
across 12 categories and 3 stores, plus `topDiscounts`, `categories`, `brands`, `stores`,
`prefectures`, `citiesByPrefecture`, `getDeal`, `formatYen`, `imageUrl` and `demoUser`.

- Use `imageUrl(deal)` for product photos. They are 900x900 JPEGs.
- Do not edit anything in `prototypes/shared/` and do not touch the other prototype folders.
- Do not add store logos or any real brand logo. Store names are plain text.
- You may add icons, illustration and a Bargainu logo or dog mark of your own making.

## Technical rules

- Vite + React + TypeScript, already scaffolded in your folder. Add any libraries you want.
- Use **hash routing** (`/#/browse`, `/#/deal/:id`, ...). The build is served from a sub-path,
  so `vite.config.ts` keeps `base: './'`. Do not change `base`, `publicDir` or the `@shared` alias.
- `npm run build` must pass with no TypeScript errors.
- Put every design token (colour, type, spacing, radius, shadow, motion) in
  `src/styles/tokens.css` as CSS custom properties and use them everywhere. No raw hex values
  or magic numbers outside that file.
- Baseline quality that applies to every prototype: keyboard reachable, visible focus,
  `prefers-reduced-motion` respected, no horizontal scroll at 375px.

## Checking your own work

Start your dev server on the port given in your recipe prompt and take screenshots with:

```
../shared/scripts/shot.sh "http://localhost:<port>/#/<route>" .screens/<name>.png <width> <height>
```

Look at every screen at 390 and 1440 wide, and fix what looks wrong before you finish.
Stop your dev server when you are done.

## Deliverables in your prototype folder

1. The working app.
2. `DESIGN.md` — the design system as built, so that someone could extend this app without
   drifting: concept in two or three sentences, colour tokens with their roles, typography scale,
   spacing, radius, elevation, motion rules, component rules (card, badge, button, filter, nav,
   form, empty state), copy voice, and a do / don't list.
3. `RECIPE-NOTES.md` — what you actually did, for reproducibility: which skill files you read
   and followed, every setting or dial you chose and its value, the libraries you added with
   versions, the fonts, the references you used, and the order of the steps you took.

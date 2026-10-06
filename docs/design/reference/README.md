# What Bargainu looks like

Screenshots of the chosen design (prototype 3, "Chirashi"), taken on 2026-10-04 from
`prototypes/3-reference`. The two Login shots were retaken from the app on 2026-10-06, when the
demo account and email form gave way to Google sign-in. Use them with [DESIGN.md](../../../DESIGN.md): the file gives the rules,
these show the result. A new or changed screen should look like it belongs next to these.

To see the same screens running, run `npm install && npm run dev` in the repo root, after the
setup in the [README](../../../README.md). The app is deployed at
https://bargainu.sidequest-club.workers.dev.

| Screen | Desktop, 1440 wide | Phone, 390 wide | Route |
|---|---|---|---|
| Home | [home-1440.jpg](home-1440.jpg) (full page) | [home-390.jpg](home-390.jpg) | `/` |
| Browse | [browse-1440.jpg](browse-1440.jpg) | [browse-390.jpg](browse-390.jpg) | `/browse` |
| Browse, filter sheet open | (filters are a left rail, see Browse) | [browse-filters-390.jpg](browse-filters-390.jpg) | `/browse` |
| Browse, no results | [browse-empty-1440.jpg](browse-empty-1440.jpg) | [browse-empty-390.jpg](browse-empty-390.jpg) | `/browse` with filters that match nothing |
| Deal detail, in-store deal | [deal-1440.jpg](deal-1440.jpg) | [deal-390.jpg](deal-390.jpg) | `/deal/trail-blaze-2-orange` |
| Deal detail, online deal | [deal-online-1440.jpg](deal-online-1440.jpg) | [deal-online-390.jpg](deal-online-390.jpg) | `/deal/<id>` |
| Login | [login-1440.jpg](login-1440.jpg) | [login-390.jpg](login-390.jpg) | `/login` |
| Favorites, signed in | [favorites-1440.jpg](favorites-1440.jpg) | [favorites-390.jpg](favorites-390.jpg) | `/favorites` |
| Favorites, signed out | [favorites-signed-out-1440.jpg](favorites-signed-out-1440.jpg) | [favorites-signed-out-390.jpg](favorites-signed-out-390.jpg) | `/favorites` |

## Reading them

- Numbers that count up on load (the discount on Deal detail, the result count) may be caught
  part-way. `deal-390.jpg` shows 32% on a deal that is 40% off. The data in
  `prototypes/shared/deals.ts` is correct.
- Not captured: hover and pressed states, the marquees moving, the toast, and the signed-in
  account panel. Run the app to see those.
- The footer's small print reads differently in the app, as on the Login shots.

## Retaking them

```
npm run dev
prototypes/shared/scripts/shot.sh "http://localhost:5173/browse" out.png 1440 1000
```

`shot.sh` cannot lay out narrower than about 500px, so phone shots need device emulation
(Chrome DevTools, or a script over the DevTools Protocol). Save as JPEG at quality 82.

# What Bargainu looks like

Screenshots of the chosen design (prototype 3, "Chirashi"), taken on 2026-10-04 from
`prototypes/3-reference`. The two Login shots were retaken from the app on 2026-10-06, when the
demo account and email form gave way to Google sign-in. The Home and Browse shots were retaken
from the app on 2026-10-14 (SID-24), after the features cut by decision 10 were removed and the
footer gained Rakuten's notices. Every app screen was retaken on 2026-10-15 (SID-24), when the
screens moved to the agreed data model: the sticker says SALE or the point rate instead of a
% off, cards name the shop instead of a brand and show when the price was fetched, and Browse filters
by shop. Home, Browse, the filter sheet, both Deal detail screens and signed-in Favorites were retaken on
2026-10-17 (SID-43), when the screens were fitted to real Rakuten titles: the Deal title became body
text, the hero stopped promising cuts, the points sticker got a capital X and the shop checklist gained
a search box. They show the local sample deals from `npm run db:seed:local`, which are all Rakuten
since the same change, so the Store filter is hidden as it is on the live site. Favorites signed in uses
`npm run dev:session` with four saved deals. Use them with [DESIGN.md](../../../DESIGN.md): the file gives the rules,
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
| Deal detail, sale and points | [deal-1440.jpg](deal-1440.jpg) | [deal-390.jpg](deal-390.jpg) | `/deal/aero-knit-slip-on` |
| Deal detail, points with no end date | [deal-points-1440.jpg](deal-points-1440.jpg) | [deal-points-390.jpg](deal-points-390.jpg) | `/deal/reference-50-wired` |
| Login | [login-1440.jpg](login-1440.jpg) | [login-390.jpg](login-390.jpg) | `/login` |
| Favorites, signed in | [favorites-1440.jpg](favorites-1440.jpg) | [favorites-390.jpg](favorites-390.jpg) | `/favorites` |
| Favorites, signed out | [favorites-signed-out-1440.jpg](favorites-signed-out-1440.jpg) | [favorites-signed-out-390.jpg](favorites-signed-out-390.jpg) | `/favorites` |

## Reading them

- Numbers that count up on load (the point rate on Deal detail, the result count) may be caught
  part-way.
- Not captured: hover and pressed states, the marquees moving, the toast, and the signed-in
  account panel. Run the app to see those.

## Retaking them

```
npm run dev
prototypes/shared/scripts/shot.sh "http://localhost:5173/browse" out.png 1440 1000
```

`shot.sh` cannot lay out narrower than about 500px, so phone shots need device emulation
(Chrome DevTools, or a script over the DevTools Protocol). Save as JPEG at quality 82.

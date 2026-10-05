# Recipe notes: prototype 3, reference-driven

What was actually done, so the run can be repeated.

## Recipe

References only. No design skill was invoked (not frontend-design, not web-design-guidelines, none),
and the other two prototype folders were not opened.

## Files read and followed

- `prototypes/BRIEF.md` (product brief, binding).
- `prototypes/3-reference/DIRECTION.md` (concept, references, rules, six signature pieces, fancy component list).
- `prototypes/shared/deals.ts` and `prototypes/shared/scripts/shot.sh`.
- Fancy source at commit f9f62c6: `blocks/simple-marquee.tsx`, `text/text-rotate.tsx`,
  `text/basic-number-ticker.tsx`, `text/vertical-cut-reveal.tsx`, `text/underline-center.tsx`, `LICENSE`.

No skill files were read.

## References

Taken from DIRECTION.md as written. The three sites were not opened again during the build; only the
patterns listed in DIRECTION.md were used, and no asset, logo, text or code was taken from them.

| Reference | What ended up in the app |
|---|---|
| Vibe (vibebevvy.com) | Top ticker with round sticker dots, chunky soft serif for the warm line, yellow pill button with an arrow, doodles on the hero type (spark, squiggle, curly arrow) |
| Ring Pop (ringpopcandy.com) | Cream paper, Anton capitals, tilted overlapping marquee bands with same-hue dark text, floating rounded nav, flat colour blocks between Home sections |
| Nothin' (noth.in) | Footer: one short line above an edge-to-edge wordmark |
| fancy (danielpetho/fancy, MIT) | The motion components below |

## Fonts

All self-hosted through Fontsource, so the build has no network dependency.

| Role | Font | Package |
|---|---|---|
| Headlines, prices | Anton 400 (latin subset) | `@fontsource/anton` 5.3.0 |
| Wordmark, warm lines | Fraunces Variable, `soft.css` (wght + SOFT axes), used at SOFT 100, wght 900 and 600 | `@fontsource-variable/fraunces` 5.3.0 |
| Body, UI | Hanken Grotesk Variable | `@fontsource-variable/hanken-grotesk` 5.3.0 |

## Libraries added

| Package | Version | Why |
|---|---|---|
| `motion` | 12.43.0 (`^12.23.24`, the range fancy itself declares) | Required by the fancy components. v14 exists but fancy was written against v12, so v12 was pinned on purpose. |
| the three Fontsource packages above | 5.3.0 | Fonts |

Not added: Tailwind, a router, an icon set, clsx, tailwind-merge, matter-js.

## Fancy components

Copied into `src/fancy/` with a header naming the source and licence; `src/fancy/LICENSE` is the MIT notice.

| File | Used for |
|---|---|
| `simple-marquee.tsx` | Ticker strip and the three category bands (via `src/components/Marquee.tsx`) |
| `text-rotate.tsx` | Rotating category word in the Home headline |
| `vertical-cut-reveal.tsx` | Entrance of "Big cuts on" |
| `basic-number-ticker.tsx` | Discount number on the detail sticker, and the Browse result count |
| `underline-center.tsx` | Text links (hero, panels, breadcrumbs, footer, login) |

Adaptations: Tailwind classes ported to plain CSS classes (`src/styles/fancy.css`, `fx-` prefix);
`cn` replaced by a five-line joiner (`src/fancy/cn.ts`); type-only imports for `verbatimModuleSyntax`;
an unused parameter renamed; the underline element changed from `div` to `span` so it is valid inside `<p>`.
`physics/gravity.tsx` was left out (see decisions).

## Settings chosen

| Setting | Value |
|---|---|
| Tilt: sticker / bands / hero word / collage | -9deg / -3.2, 2.4, -1.4deg / -2deg / -5, 6, -3deg |
| Outline | 2px ink, 3px for frames |
| Shadow | 2, 4, 7px hard ink offset, no blur |
| Radius | 6, 12, 20px, pill |
| Sticker | 16 points, inner radius 81% of outer, red at 40% off or more, yellow below |
| Marquee speed | ticker 2.2, bands 3 (percent of one loop per second), 0.25x on hover |
| Hero word | first word holds 5200ms, then rotates every 3000ms, 0.03s character stagger |
| Reveal | spring stiffness 260, damping 24, 0.09s per word |
| Number ticker | 0.9s on the detail sticker, 0.45s on the result count |
| Settle failsafe | 1600ms |
| Breakpoints | 640px, 960px |
| Card grid minimum | 208px (150px on phones) |
| localStorage keys | `bargainu.p3.session`, `bargainu.p3.favorites` |

## Decisions made alone

- **Plain CSS, not Tailwind.** DIRECTION.md allowed either. Porting about fifteen utility classes kept
  `tokens.css` as the only source of values.
- **Own hash router** (`src/lib/router.tsx`, about 50 lines) instead of a router library. Filter state is in
  the hash query (`#/browse?category=Shoes&min=30`), which is what lets band words, category tiles and
  prefecture buttons on Home link straight into a filtered Browse.
- **Motion tokens are read from CSS in JS** (`tokenNumber`) so durations and speeds are not duplicated in TSX.
- **Gravity left out.** It was optional, needs matter-js, and a physics canvas has no clean reduced-motion or
  keyboard story. The empty states use the sleepy dog instead.
- **Bands are pink, green, blue**, not pink, green, yellow as on the reference, because yellow is reserved
  for the primary action and the Top Discounts block sits directly under the bands.
- **Footer is ink with a yellow wordmark**, not a red block, so it stays quiet under Browse and Deal detail.
- **Saving while signed out** sends the user to Login with `next` and `save` parameters, then saves the deal
  and returns them to where they were. The brief only said signed-out users are asked to sign in first.
- **"Go to store"** is a dead link that shows a toast naming the store.
- **Home lists do not repeat deals.** "Ending soon" skips the Top Discounts eight, and "Just sniffed out"
  skips both, because in this dataset the three lists would otherwise show the same four items.
- **Extras beyond the brief:** search box, store filter, five sort orders, active-filter chips, an
  "In a shop near you" block that links into the prefecture filter, a not-found state for unknown deals.
- **Settle failsafe and first-word hold.** motion caps each frame's time step, so when frames are throttled
  (background tab, tall headless capture) an entrance can stall half way. After 1600ms the headline and the
  number tickers are swapped for their final state, and the hero word does not start rotating until 5.2s.
  The hold is longer than `shot.sh`'s 5s virtual-time budget on purpose, so its screenshots catch a settled headline.
- **Dog mark**: drawn by hand as SVG paths for this prototype (white dog, yellow eye patch, big nose, three moods).
  Icons and doodles are hand-made too.

## Checking

- `shot.sh` cannot lay out narrower than about 500px (headless Chrome's minimum window), so its "390" shots
  are a cropped 500px layout. Phone shots were taken with `.screens/cdp.mjs`, a small Chrome DevTools Protocol
  script that emulates a real 390px device width, can run scripted clicks first, and captures the full page.
  Desktop Home was also taken with `shot.sh` at 1440.
- Looked at, at 390 and 1440: Home, Browse, Browse empty state, Deal detail (online and in-store), Login,
  Favorites signed out and with items. At one width only: the signed-in account panel (390), the empty
  Favorites state (1440), the phone filter sheet (390), the Home hero at 768.
- Scripted checks (`.screens/t-*.js`): every filter and sort changes the count and the URL as expected
  (60, Shoes 5, +Audio 10, min 50% 2, in-store 15, Tokyo 6, Shinjuku 3, online 45 with location disabled,
  empty state at 0, clear back to 60); the save, sign-in, favourites, remove, sign-out and gate flow;
  no horizontal scroll at 375px on any route; marquees and the hero word stand still under reduced motion;
  only one copy of each band link is in the tab order.
- `npm run build` passes. `oxlint` reports warnings only: the fast-refresh rule on files that export hooks,
  and hook-dependency warnings inside the copied fancy files, which were left as upstream wrote them.

## Order of steps

1. Read BRIEF.md and DIRECTION.md, the shared data and the fancy sources.
2. Chose fonts, installed `motion` and Fontsource, wrote `tokens.css`.
3. Copied the five fancy components and ported their classes to plain CSS.
4. Built router, store, icons, dog, sticker, doodles, marquee wrapper, card, shell (ticker, nav, tab bar, footer, toast).
5. Built Home, Browse, Deal detail, Login, Favorites.
6. First screenshots; fixed the footer wordmark overflow, the collage (now ratio-based), duplicate Home lists.
7. Found the phone screenshot limit and wrote `cdp.mjs`; checked every screen at 390 and 1440.
8. Scripted the filter and favourites flows; fixed invalid `div` in `p` from the underline component, the live
   region on the result count, breadcrumb hit targets.
9. Added the settle failsafe after `shot.sh` caught a half-revealed headline.
10. Audited CSS for raw values, ran lint and build, wrote DESIGN.md and this file, stopped the dev server.

## Not delivered or unsure

- Japanese copy is not written; only the font fallbacks and wrapping behaviour are prepared.
- No favicon (the shared `public` folder is read-only for this prototype).
- Not tested in Safari or Firefox, or on a real phone. Checks were in Chrome only.
- Hover states, the marquee hover slowdown and keyboard focus rings were not looked at in screenshots,
  only reasoned from the CSS and the tab-order script.
- Photos come from the shared set; one shoe photo shows a real brand mark, which is outside this folder's control.

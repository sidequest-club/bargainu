---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief: Bargainu app (all five screens)

Scope: the whole v1 app shell and its five routes (Home, Browse, Deal detail, Login, Favorites).
Visitor mode: Operate. The shopper is in a task: find a deal, narrow the list, save or leave for the store.

- Audience and job: shoppers in Japan scanning what is on sale right now across Yodobashi, Rakuten and Amazon.
- Task content: discount %, sale price, original price, store, time left, location for in-store deals.
- Important states: filtered / empty results, signed in / signed out, saved / not saved, ending within a day.
- Constraints: yen, English copy now with room for Japanese, no store logos, tokens only, 375px to 1440px.
- Unresolved: Japanese copy, real store links.

## Direction contract

THESIS: A bargain is something you carry home wrapped. Bargainu is the department-store carrier bag and its paper seal: one green, one yellow sticker, everything else paper and ink. It refuses the category default (red and yellow flyer noise with boxed cards) and its opposite (a white grid with one grey accent).

OWN-WORLD: Bottle-green shell (header, hero field, tab bar selection), green-tinted paper ground, green-black ink, flat colour with hairline seams and no decorative shadow. One accent: saffron yellow, reserved for the discount seal and the primary action. Pill controls, soft 14px photo wells, cardless product tiles. One workhorse sans with tabular figures.

STORY: The shopper sees real deals immediately, reads the percent on the seal first, narrows by filters that state what they are doing, saves with one tap, and leaves for the store.

FIRST VIEWPORT: Green header (logo seal, Home / Browse / Favorites, search, account). Below it a green field split left/right: left a two-line headline, one sentence and one action; right the single biggest discount as a live deal, its photo large, its yellow seal straddling the photo edge at the largest seal size. Top Discounts ranked grid begins at the fold.

FORM: Depachika wrapping paper and carrier bag (包装紙 / 紙袋), candidate 7 of 7 on my ordered list; seed key 73351ce9. Signature move: the discount is a round paper seal that straddles the edge of every product photo, its diameter stepping up with the size of the discount, and it presses down when a deal is saved.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

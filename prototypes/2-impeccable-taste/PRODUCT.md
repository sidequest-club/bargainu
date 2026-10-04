# Product

<!-- impeccable:product-schema 1 -->

> Source note: nobody was available for Impeccable's init interview. Every fact below is taken
> from `../BRIEF.md` (the binding product brief) or the shared dataset `../shared/deals.ts`.
> Lines marked **(inferred)** are my reading of the brief, not a confirmed answer.

## Platform

web

## Stack

Vite + React + TypeScript, pre-scaffolded and fixed by the brief. Hash routing, `base: './'`,
client-side state only, `localStorage` for session and favorites.

## Users

Shoppers in Japan who want to know what is on sale right now across several stores without
opening each store's site. **(inferred)** They check on a phone in spare minutes (commute,
lunch) and on a desktop when comparing a bigger purchase. They are fluent in Japanese e-commerce
and in-store shopping; nothing needs explaining.

## Product Purpose

Bargainu (バーゲイヌ, bargain + 犬 inu, dog) collects ongoing discounts and sales from Japanese
online stores and shows them in one place. Trial stores: Yodobashi, Rakuten, Amazon. Success
**(inferred)**: a shopper finds a deal worth acting on within a few seconds, and can narrow 60
deals to the handful that match a discount floor, a brand, a category, or a place.

## Positioning

One list across stores, including in-store deals located by prefecture and city. The dog
"sniffs out" deals: the product does the hunting, the shopper does the choosing.

## Operating Context

- Prices are in yen, tax included. Discount percent is the headline number of every deal.
- Deals expire (`endsInHours`) and have a found-time (`postedHoursAgo`).
- In-store deals carry a prefecture and city; online deals do not.
- The action on a deal leaves Bargainu for the store ("Go to store").

## Capabilities and Constraints

- Five screens: Home, Browse, Deal detail, Login, Favorites.
- Browse filters: minimum discount %, brand, category, prefecture then city, online vs in-store,
  plus store and sort order.
- No backend. Any login input signs in as the demo user. Session and favorites persist locally.
- UI copy is English for now; Japanese comes later, so layouts must tolerate longer, denser text.
- No store logos or real brand logos. Store names are plain text.
- Undecided: Japanese copy, real data feeds, account features beyond favorites.

## Brand Commitments

- Name: Bargainu / バーゲイヌ. A dog is part of the name; a self-made dog mark is allowed.
- No other brand assets, colours or type are fixed by the brief.

## Evidence on Hand

- `../shared/deals.ts`: 60 invented deals, 12 categories, 3 stores, invented brands and prices.
- `../shared/public/images/`: 900x900 product photos, one per deal.
- No testimonials, user counts, savings totals or partner claims exist. Do not invent them.

## Product Principles

1. The discount is the content. Percent off, sale price and time left are readable before anything else.
2. Never make the shopper hunt. Filters are always one tap away and always say what they are doing.
3. Honest urgency. Show real time left; never fake scarcity.
4. Plain store names, no borrowed brand identity.
5. Room for Japanese. Nothing depends on a short English string.

## Accessibility & Inclusion

Baseline from the brief: keyboard reachable, visible focus, `prefers-reduced-motion` respected,
no horizontal scroll at 375px. Target WCAG AA contrast.

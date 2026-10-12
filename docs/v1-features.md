# v1 features

**Status: draft for the meeting on 2026-10-13 (SID-32). The team has not agreed it.**

The v1 list is fixed and nothing is added to it. This page gives each item one line that says
what it means, and marks it functional (the app itself) or non-functional (platform:
infrastructure, deployment, monitoring, security).

The definitions assume v1 shows Rakuten only, and that a deal is an item in a sale period or with
boosted points. Both are decision 7, which is in pull request #14 and not merged yet. Rakuten's
rules are in decision 6 of [decisions.md](decisions.md).

## The definitions

Two items are split, because their parts differ: collecting has a platform half, and each filter
has its own answer. A line that starts with "Proposed" changes what the item meant in the
prototype and needs a yes or no from the team.

| #   | Item                         | Mark           | Definition                                                                                                                                                                                                                     |
| --- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1a  | Collect: what counts         | Functional     | The collector searches Rakuten Ichiba for an agreed list of keywords and keeps an item only if it is in a time-limited sale or its point rate is above 1.                                                                       |
| 1b  | Collect: it runs by itself   | Non-functional | A GitHub Actions run collects at least once a day without anyone starting it, loads the deals into the app's database, and a Rakuten price that was not fetched again within 24 hours is removed.                               |
| 2   | Show the deals               | Functional     | Home and Browse list every deal that has not ended, and the Deal screen shows one deal with a link to its page on Rakuten. Each shows the name, image, price, shop, why it is a deal, and Rakuten's credit and price notice. |
| 3   | "Top Discounts"              | Functional     | A section on Home with the 8 highest-ranked deals. Proposed ranking: highest point rate first, then the sale that ends soonest.                                                                                                |
| 4a  | Filter: discount %           | Functional     | Proposed: cut from v1. Rakuten returns no original price, so there is no percentage to filter on.                                                                                                                              |
| 4b  | Filter: brand                | Functional     | Proposed: filter by the Rakuten shop that sells the item, one or more at a time. Rakuten returns no brand.                                                                                                                      |
| 4c  | Filter: category             | Functional     | Choose one or more of our 12 categories. Every Rakuten genre we collect maps to exactly one of them.                                                                                                                           |
| 4d  | Filter: prefecture/city      | Functional     | Proposed: not shown in v1. Every Rakuten deal is online, so no deal has a place.                                                                                                                                               |
| 4e  | Filter: online vs in-store   | Functional     | Proposed: not shown in v1. Every deal is online.                                                                                                                                                                               |
| 5   | User login                   | Functional     | A visitor signs in with a Google account and can sign out. Signing in is needed only to save favorites; everything else works signed out.                                                                                      |
| 6   | Favorites                    | Functional     | A signed-in user saves or removes a deal from its card or its screen, and the Favorites screen lists the deals they saved, newest first.                                                                                       |

## Where each item stands today

The app runs on the prototype's invented deals. Nothing real is in the deployed database.

| #   | Today                                                                                                                                                              | Issue                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 1a  | The collector fetches Rakuten items for keywords typed in by hand. It keeps every item, not only those in a sale or with boosted points.                            | SID-17                 |
| 1b  | Runs are started by hand and write raw files. Nothing loads them into the database, and nothing removes an old price.                                               | SID-23, SID-28, SID-25 |
| 2   | Built, on invented deals. Cards show an original price, a discount, a rating and a brand that Rakuten does not all supply. No credit or price notice yet.           | SID-24                 |
| 3   | Built. It ranks by percentage off the original price.                                                                                                              | SID-24                 |
| 4a  | Built as a slider from 0 to 60%.                                                                                                                                   | SID-24                 |
| 4b  | Built on the invented brands.                                                                                                                                      | SID-24                 |
| 4c  | Built on our 12 categories. No mapping from Rakuten genres exists.                                                                                                 | SID-17                 |
| 4d  | Built. It only applies to in-store deals.                                                                                                                          | SID-24                 |
| 4e  | Built.                                                                                                                                                             | SID-24                 |
| 5   | Built and deployed.                                                                                                                                                | none                   |
| 6   | Built and deployed. What happens to a saved deal once it ends is not decided.                                                                                      | SID-25                 |

## Questions for the meeting

1. **"Top Discounts" (3):** is point rate, then ending soonest, the right ranking? The name says
   discount, and a points boost is not a price cut. Rakuten Affiliate's guideline counts a list
   price we made up as a misleading display (decision 6), so we cannot invent a percentage.
2. **Discount % (4a):** cut it, or replace it with a minimum point rate? Decision 7 already names
   it as the first thing to cut.
3. **Brand (4b):** is the shop a fair stand-in for brand, or do we cut this filter too? A shop
   list can get long, since many shops sell the same kind of item.
4. **Place and channel (4d, 4e):** hide both in v1? Decision 7 names them as the second cut.
5. **Category (4c):** what happens to an item whose Rakuten genre maps to none of our 12: do we
   skip it, or add an "Other" category? The mapping itself is SID-17.
6. **Collect (1a):** which keywords, and who keeps the list? SID-28 has the same question.

## In the app but not on the list

These came with the prototype. The list is fixed, so each needs a decision to keep or remove.

- Free-text search on Browse. SID-38 proposes moving it into the API.
- Sorting on Browse: biggest discount, lowest price, ending soonest, just found, top rated. The
  first depends on the discount and goes with 4a.
- A store filter. With one store it has nothing to choose between.
- Two more sections on Home, "Ending soon" and "Just sniffed out".

## What Rakuten returns

Read from `collector/samples/rakuten-item-search.json` and
[collector/README.md](../collector/README.md).

| We want                | Rakuten has                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| Original price         | Nothing. Only the current price, `itemPrice`.                              |
| A sale period          | `startTime` and `endTime`, empty when the item is not in one.              |
| Boosted points         | `pointRate`, with its own start and end time. 1 is the normal rate.        |
| Brand                  | Nothing. `shopName` and `shopCode` name the shop.                          |
| Category               | `genreId`, Rakuten's own genre.                                            |
| Rating and reviews     | `reviewAverage` and `reviewCount`.                                         |
| Prefecture or city     | Nothing we can use. The listings are online.                               |

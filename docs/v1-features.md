# v1 features

**Status: agreed at the sync on 2026-10-13 (SID-32).** Recorded as decision 10 in
[decisions.md](decisions.md).

This page gives each item on the v1 list one line that says what it means, and marks it functional
(the app itself) or non-functional (platform: infrastructure, deployment, monitoring, security).

v1 shows Rakuten only, and a deal is an item in a sale period or with boosted points (decision 7).
Rakuten's rules are in decision 6. Rakuten returns no original price, no brand and no place, so
three items were cut and one changed.

## The definitions

Two items are split, because their parts differ: collecting has a platform half, and each filter
has its own answer.

| #   | Item                       | Mark           | Definition                                                                                                                                                                                                                   |
| --- | -------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1a  | Collect: what counts       | Functional     | The collector searches Rakuten Ichiba for an agreed list of keywords and keeps an item only if it is in a time-limited sale or its point rate is above 1.                                                                    |
| 1b  | Collect: it runs by itself | Non-functional | A GitHub Actions run collects at least once a day without anyone starting it, loads the deals into the app's database, and a Rakuten price that was not fetched again within 24 hours is removed.                            |
| 2   | Show the deals             | Functional     | Home and Browse list every deal that has not ended, and the Deal screen shows one deal with a link to its page on Rakuten. Each shows the name, image, price, shop, why it is a deal, and Rakuten's credit and price notice. |
| 3   | "Top Discounts"            | Functional     | **Cut from v1.** Rakuten returns no original price, so there is no discount to rank by.                                                                                                                                      |
| 4a  | Filter: discount %         | Functional     | **Cut from v1.** There is no percentage to filter on.                                                                                                                                                                        |
| 4b  | Filter: brand              | Functional     | **Changed.** Filter by the Rakuten shop that sells the item, one or more at a time. Rakuten returns no brand.                                                                                                                |
| 4c  | Filter: category           | Functional     | Choose one or more of our 12 categories. Every Rakuten genre we collect maps to exactly one of them. An item whose genre fits none of the 12 is not collected.                                                               |
| 4d  | Filter: prefecture/city    | Functional     | **Not shown in v1.** Every Rakuten deal is online, so no deal has a place.                                                                                                                                                   |
| 4e  | Filter: online vs in-store | Functional     | **Not shown in v1.** Every deal is online.                                                                                                                                                                                   |
| 5   | User login                 | Functional     | A visitor signs in with a Google account and can sign out. Signing in is needed only to save favorites; everything else works signed out.                                                                                    |
| 6   | Favorites                  | Functional     | A signed-in user saves or removes a deal from its card or its screen, and the Favorites screen lists the deals they saved, newest first.                                                                                     |

## Kept, though not on the list

These came with the prototype. The team agreed to keep all four.

- Free-text search on Browse. SID-38 proposes moving it into the API.
- Sorting on Browse: lowest price, ending soonest, just found, top rated. "Biggest discount" goes
  away with the discount.
- The store filter.
- The "Ending soon" and "Just sniffed out" sections on Home.

## Not decided yet

- Which keywords the collector searches for, and who keeps the list. This is decided in SID-28.

## Where each item stands today

Updated 2026-10-17. The screens follow the agreed data model (SID-24). The deployed database holds
590 Rakuten deals from one run of the collector in #26, loaded on 2026-10-17. Nothing loads them
again until #26 is merged.

| #   | Today                                                                                                                                                                     | Issue          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1a  | On `main`, the collector fetches keywords typed in by hand and keeps every item. #26 searches our genres instead and keeps only items in a sale or with boosted points.   | SID-39         |
| 1b  | On `main`, runs are started by hand and nothing loads them. #26 adds a daily run that loads the deals into the database and clears a price that was not fetched again.    | SID-28, SID-39 |
| 2   | Built and deployed. Each deal shows its name, image, price, shop and why it is a deal, with Rakuten's credit, the update time and Rakuten's price notice.                 | none           |
| 3   | Removed.                                                                                                                                                                  | none           |
| 4a  | Removed.                                                                                                                                                                  | none           |
| 4b  | Built and deployed, filtering by shop.                                                                                                                                    | none           |
| 4c  | Built on our 12 categories. The genre-to-category mapping is `collector/categories.json` in #26.                                                                          | SID-39         |
| 4d  | Not shown.                                                                                                                                                                | none           |
| 4e  | Not shown.                                                                                                                                                                | none           |
| 5   | Built and deployed.                                                                                                                                                       | none           |
| 6   | Built and deployed. A saved deal that has ended, or that a run did not refresh, drops out of Favorites. Showing it as no longer on sale (data-model.md) is not built yet. | SID-25         |

## What Rakuten returns

Read from [rakuten-api.md](rakuten-api.md) and [collector/README.md](../collector/README.md).

| We want            | Rakuten has                                                         |
| ------------------ | ------------------------------------------------------------------- |
| Original price     | Nothing. Only the current price, `itemPrice`.                       |
| A sale period      | `startTime` and `endTime`, empty when the item is not in one.       |
| Boosted points     | `pointRate`, with its own start and end time. 1 is the normal rate. |
| Brand              | Nothing. `shopName` and `shopCode` name the shop.                   |
| Category           | `genreId`, Rakuten's own genre.                                     |
| Rating and reviews | `reviewAverage` and `reviewCount`.                                  |
| Prefecture or city | Nothing we can use. The listings are online.                        |

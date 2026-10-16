# Rakuten Ichiba APIs: what each one returns

What data we can get from Rakuten, field by field, so we can decide which part of the UI needs
which data. Checked on 2026-10-10 against Rakuten's documentation and one real call to each API
with our keys. All five worked with our application ID, access key and `Referer`.

## The five APIs

All are `GET` requests under `https://openapi.rakuten.co.jp`.

| API | Path | Ask it for | It returns | Per call | Used now |
|---|---|---|---|---|---|
| [Item Search](#item-search) | `/ichibams/api/IchibaItem/Search/20260701` | a keyword, genre, shop or item code | listings | 30, up to 100 pages | yes, by the collector |
| [Ranking](#ranking) | `/ichibaranking/api/IchibaItem/Ranking/20220601` | everything, a genre, or an age and sex | best-selling listings, with their rank | 30, up to 34 pages | no |
| [Product Search](#product-search) | `/ichibaproduct/api/Product/Search/20250801` | a keyword, genre, product ID or JAN code | products | 30, up to 100 pages | no |
| [Genre Search](#genre-search) | `/ichibagt/api/IchibaGenre/Search/20260701` | a genre ID (`0` for the top) | one genre with its parents, siblings and children | 1 genre | no |
| [Attribute Search](#attribute-search) | `/ichibagt/api/IchibaAttribute/Search/20260701` | a genre ID | the attribute names used in that genre | 1 genre | no |

A **listing** is one shop's offer, with that shop's price. Item Search and Ranking return
listings, so the same earphones sold by ten shops are ten listings. A **product** is the model
itself, identified by its JAN code. Product Search returns products and summarises the listings
for each one.

## Sending a request

1. **Keys.** `collector/.env` holds `RAKUTEN_APP_ID`, `RAKUTEN_ACCESS_KEY` and `RAKUTEN_REFERER`.
   If it is missing, copy `collector/.env.example` and fill it from "Your Applications" at
   https://webservice.rakuten.co.jp/. Never print the keys or commit them.
2. **Headers.** Send `Referer` and `Origin` set to one of the app's allowed websites:
   `https://github.com/` or a `*.workers.dev` address. The app is registered as a Web Application,
   so a request without them is refused.
3. **Parameters.** Every API takes `applicationId` and `accessKey` (required), and
   `affiliateId`, `format`, `formatVersion`, `elements` and `callback` (optional). Send
   `formatVersion=2`, which gives the flat field names used below. `elements` limits the response
   to the fields you list. URL-encode Japanese values.
4. **Rate.** At most one request a second per application ID. The collector waits 1.5 seconds.

From the repository root:

```sh
set -a; . collector/.env; set +a
REFERER="${RAKUTEN_REFERER:-https://github.com/}"
curl -sG "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701" \
  -H "Referer: $REFERER" \
  -H "Origin: ${REFERER%/}" \
  --data-urlencode "applicationId=$RAKUTEN_APP_ID" \
  --data-urlencode "accessKey=$RAKUTEN_ACCESS_KEY" \
  --data-urlencode "keyword=イヤホン" \
  -d hits=1 -d formatVersion=2
```

For another API, use its path from the table above and its own parameters:

| API | Smallest working parameters |
|---|---|
| Item Search | `keyword=イヤホン` |
| Ranking | `genreId=502835`, or none for all of Ichiba |
| Product Search | `keyword=イヤホン` |
| Genre Search | `genreId=0` |
| Attribute Search | `genreId=502835` |

A successful call returns HTTP 200 and the JSON described below. Errors come in two shapes:

| HTTP | Body | Cause |
|---|---|---|
| 403 | `{"errors": {"errorCode": 403, "errorMessage": "REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING"}}` | No `Referer` header |
| 403 | `{"errors": {"errorCode": 403, "errorMessage": "Invalid Access Key"}}` | Wrong access key |
| 400 | `{"error": "wrong_parameter", "error_description": "keyword or itemCode is essential parameter, …"}` | A required parameter is missing or wrong |

Item and shop URLs in a response carry our application ID (`rafcid=`). Do not commit or share raw
responses.

## Item Search

Ask with at least one of `keyword`, `genreId`, `shopCode` or `itemCode`. Filters include
`minPrice`, `maxPrice` and `NGKeyword`. `sort` orders by price, reviews, affiliate rate or last
update. Examples are from `collector/samples/rakuten-item-search.json`.

**Top level**

| Field | Type | Example | Meaning |
|---|---|---|---|
| `count` | int | `483171` | Matches in total |
| `page`, `pageCount` | int | `1`, `100` | This page and the number of pages, at most 100 |
| `first`, `last`, `hits` | int | `1`, `3`, `3` | Positions and number of items on this page |
| `carrier` | int | `0` | 0 PC, 1 mobile, 2 smartphone |
| `Items` | array | | The listings, below |
| `GenreInformation` | object | | Only with `genreInformationFlag=1`: the genre's `ancestors`, `genre` and `children`, each with `genreId`, `nameJa`, `level` and `itemCount` |
| `Attributes` | array | | Only with `attributeFlag=1` and a `genreId`: `id` and `nameJa` of each attribute |

**Each listing**

| Field | Type | Example | Meaning |
|---|---|---|---|
| *What it is* | | | |
| `itemName` | string | `Bose QuietComfort Ultra Earbuds 2nd Gen(第2世代) …` | Title written by the shop, often packed with keywords and sale claims |
| `catchcopy` | string | `""` | The shop's sales line. Often empty |
| `itemCaption` | string | `【商品紹介】 ■さらに進化した イヤホン …` | Long description, plain text |
| `itemCode` | string | `superdeal:10006894` | Listing ID, `<shopCode>:<number>` |
| `genreId` | int | `502835` | Rakuten genre. Its name comes from Genre Search |
| `attributeIds` | int[] | `[1, 3, 36, 5]` | Attributes the listing has. Names come from Attribute Search; the values are not returned |
| *Price* | | | |
| `itemPrice` | int | `39600` | Current price in yen |
| `itemPriceMin1`–`3`, `itemPriceMax1`–`3` | int | `39600` | Lowest and highest price: 1 of all, 2 searchable, 3 purchasable. The docs say no more |
| `itemPriceBaseField` | string | `item_price_min3` | Which of those `itemPrice` is |
| `taxFlag` | int | `0` | 0 tax included, 1 not |
| `postageFlag` | int | `0` | 0 shipping included, 1 not |
| *Sale and points* | | | |
| `startTime`, `endTime` | string | `2026-10-04 10:00`, `2026-10-13 09:59` | Period of a time-limited sale, Japan time with no zone. Empty when there is none; `9999-12-31` means no end |
| `pointRate` | int | `1` | Points multiplier: 5 means 5× points |
| `pointRateStartTime`, `pointRateEndTime` | string | `""` | Period of the multiplier |
| *Images* | | | |
| `imageFlag` | int | `1` | 1 has images |
| `smallImageUrls` | string[] | `https://thumbnail.image.rakuten.co.jp/…?_ex=64x64` | Up to 3, 64×64 |
| `mediumImageUrls` | string[] | `…?_ex=128x128` | Up to 3, 128×128. The largest size the API gives |
| *Links* | | | |
| `itemUrl` | string | `https://item.rakuten.co.jp/superdeal/…/?rafcid=…` | Listing page. The `rafcid` holds our application ID |
| `shopUrl` | string | `https://www.rakuten.co.jp/superdeal/?rafcid=…` | Shop page |
| `affiliateUrl`, `shopAffiliateUrl` | string | `""` | Filled only when we send `affiliateId` |
| *Shop* | | | |
| `shopName` | string | `楽天スーパーDEALSHOP` | |
| `shopCode` | string | `superdeal` | |
| `shopOfTheYearFlag` | int | `0` | 1 won Shop of the Year |
| *Reviews* | | | |
| `reviewCount` | int | `17` | |
| `reviewAverage` | float | `4.65` | Out of 5 |
| *Stock and delivery* | | | |
| `availability` | int | `1` | 1 in stock, 0 out of stock. No quantity |
| `creditCardFlag` | int | `1` | 1 takes credit cards |
| `giftFlag` | int | `0` | 1 offers gift wrapping |
| `shipOverseasFlag`, `shipOverseasArea` | int, string | `0`, `""` | Ships abroad, and to which countries |
| `asurakuFlag`, `asurakuClosingTime`, `asurakuArea` | int, string, string | `0`, `""`, `""` | Next-day delivery. Always 0 since 2024-07-01 |
| `affiliateRate` | float | `2.0` | Our commission, in percent |

## Ranking

Ask with nothing (all of Ichiba), a `genreId`, or an `age` (10 to 50) and `sex` (0 male, 1 female).
A genre cannot be combined with age or sex. `period=realtime` gives the live ranking. Pages 1 to 34
give up to about 1,000 listings.

**Top level:** `title` (`【楽天市場】ランキング市場 【ヘッドホン・イヤホン】`), `lastBuildDate`
(`Sat, 10 Oct 2026 00:00:00 +0900`) and `Items`.

**Each listing** has the same fields as Item Search, with these differences:

| | Fields |
|---|---|
| Added | `rank` (int, 1 is the best seller), `carrier`, `hasPriceRange` (1 shows the price as a range) |
| Missing | `giftFlag`, `attributeIds` |
| Strings, not numbers | `itemPrice`, `itemPriceMin1`–`3`, `itemPriceMax1`–`3`, `reviewAverage`, `affiliateRate`, `genreId`. For example `"4980"` |

- `pointRate` is shown only for multipliers that last more than 24 hours.
- Our call for genre 502835 returned the listings in reverse, rank 30 first. Sort by `rank`.
- 1 of those 30 listings had a sale period.

## Product Search

Ask with at least one of `keyword`, `genreId`, `productId` or `productCode` (JAN code). Filters
are `minPrice` and `maxPrice`, both on `salesMinPrice`. `sort` is `standard` or `-satisfied`.
`genreInformationFlag=1` adds product counts per genre. Examples are from our call for イヤホン.

**Top level:** `count` (`16371`), `page`, `first`, `last`, `hits`, `pageCount`, `Products` and
`GenreInformation`. `GenreInformation` came back, empty, even though we did not ask for it.

**Each product**

| Field | Type | Example | Meaning |
|---|---|---|---|
| *What it is* | | | |
| `productId` | string | `314b3d9a9dfb5db06a7048e304484c4d` | Rakuten's product ID |
| `productCode` | string | `4515287022394` | JAN code |
| `productName` | string | `エフ・アール・シー FPG22IM イヤホンマイク…` | |
| `productNo` | string | `FPG-22IM` | Model number |
| `brandName` | string | `イヤホンマイクシリーズ` | |
| `productCaption` | string | `・プロが求める高い耐久性能と…` | Description |
| `releaseDate` | string | `null` | |
| `genreId`, `genreName` | string | `568239`, `ヘッドセット・イヤホンマイク` | |
| `ProductDetails` | array | `null` | Name and value pairs, such as specifications |
| *Maker* | | | |
| `makerCode`, `makerName` | string | `104515287`, `エフ・アール・シー` | |
| `makerNameKana`, `makerNameFormal` | string | `エフアールシー`, `株式会社エフ・アール・シー` | Name in katakana, and the company's formal name |
| `makerPageUrlPC`, `makerPageUrlMobile` | string | `""` | |
| *Prices across listings* | | | |
| `minPrice`, `maxPrice`, `averagePrice` | int | `null` | Over all listings |
| `salesMinPrice`, `salesMaxPrice` | int | `2500`, `null` | Over listings that can be bought |
| `usedExclude…` | int | `null` | The same four prices and two counts, leaving out used items |
| *Number of listings* | | | |
| `itemCount`, `salesItemCount` | int | `null`, `30` | All listings, and those that can be bought |
| *Reviews and rank* | | | |
| `reviewCount`, `reviewAverage` | int, float | `2`, `5.0` | |
| `rank` | int | `945` | |
| `rankTargetGenreId`, `rankTargetProductCount` | | `null` | The genre the rank is in, and how many products it ranks |
| *Links and images* | | | |
| `productUrlPC`, `productUrlMobile` | string | `https://product.rakuten.co.jp/product/-/…` | Product page. The mobile one is `http` |
| `reviewUrlPC`, `reviewUrlMobile` | string | | Review page |
| `searchUrl` | string | `https://search.rakuten.co.jp/search/mall/?ran=…` | Ichiba search for this product |
| `affiliateUrl` | string | `null` | Filled only when we send `affiliateId` |
| `smallImageUrl`, `mediumImageUrl` | string | `https://r.r10s.jp/g/gran_img/…` | One image each, 64×64 and 128×128 |

In both products we fetched, `salesMinPrice` and `salesItemCount` were the only price and count
fields filled; the others, `averagePrice` included, were `null`. Two products is a small sample.

## Genre Search

Ask with `genreId`; `0` is the top of the tree.

| Field | Meaning |
|---|---|
| `genre` | The genre asked for: `genreId`, `nameJa`, `level` |
| `ancestors[]` | Its parents, top first, with the same three fields |
| `siblings[]` | Genres on the same level |
| `children[]` | Genres under it |
| `attributes[]` | `id` and `nameJa` of the attributes used in it. The docs call the ID `attributeId`; the API returns `id` |

`genreId=0` returned 39 top-level genres, such as `100371` レディースファッション. Genre 502835 is
ヘッドホン・イヤホン, level 3, under TV・オーディオ・カメラ, with 13 siblings, no children and
34 attributes.

## Attribute Search

Ask with `genreId`, and optionally an `attributeId`. It returns `attributes[]` with `id` and
`nameJa` only, the same list Genre Search includes. For genre 502835 the names include カラー,
ブランド名, メーカー型番, Bluetooth対応, ノイズキャンセリング機能 and 装着タイプ.

No API returns an attribute's value. We can tell that a listing has a colour, not which colour.

## What none of them give

- An original or list price. Listings have the current price only. Product Search has prices from
  other shops, but they were mostly `null` in our call.
- Images larger than 128×128.
- How many are in stock. `availability` is in stock or not.

How long we may keep this data, and how to credit Rakuten, is in decision 6 of
[decisions.md](decisions.md).

## Sources

- [Item Search](https://webservice.rakuten.co.jp/documentation/ichiba-item-search)
- [Ranking](https://webservice.rakuten.co.jp/documentation/ichiba-item-ranking)
- [Product Search](https://webservice.rakuten.co.jp/documentation/ichiba-product-search)
- [Genre Search](https://webservice.rakuten.co.jp/documentation/ichiba-genre-search)
- [Attribute Search](https://webservice.rakuten.co.jp/documentation/ichiba-attribute-search)

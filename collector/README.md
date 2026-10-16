# Collector

Fetches deals from store APIs, lands them raw in R2 and loads them into the app's D1 database.
It is independent of the web app: plain Python, standard library only, run by GitHub Actions.

The Collect workflow runs once a day at 10:17 Japan time, and can be started by hand:

1. `rakuten.py` searches each Rakuten genre in `categories.json` and saves what the API
   returned, unchanged, as NDJSON.
2. The workflow copies that file to R2.
3. A second job downloads it, `normalize.py` turns it into SQL for the tables in
   [data-model.md](../docs/architecture/data-model.md), and `wrangler d1 execute` runs it on D1.
   D1 runs the file as one, so a failed load changes nothing.
4. The load clears the price and promotions of every deal the run did not refresh, and R2 keeps
   only this run's file. Prices may be kept for 24 hours (decision 6). A Rakuten search that
   fails drops its deals until the next run. If the upload or the load fails, or the run starts
   late, the old prices stay until the next run.
5. A deal no run has refreshed for 3 months is deleted, with its favorites. Until then its
   favorites stay, shown as no longer on sale.

Status: Rakuten only.

## Where the data goes

```
raw/rakuten/<YYYY-MM-DD>/<HHMMSS>Z.ndjson
```

Dates and times are UTC. One file per run. Each line is one item:

```json
{"fetched_at": "2026-10-07T07:12:29+00:00", "keyword": null, "genre_id": 558885, "page": 1, "item": { ... }}
```

`item` is exactly what Rakuten returned. `genre_id` is the genre that was searched, which
gives the item its category. A keyword search has a `keyword` and no `genre_id`, so its items
are not loaded. Locally the same layout is written under
`collector/out/`, which is not committed.

Raw files keep Rakuten's item URLs as sent, and those contain our application ID
(`rafcid=...`). Keep the bucket private. `normalize.py` removes the parameter.

## What counts as a deal

`categories.json` maps each of our categories to Rakuten genres. Each genre gets two searches:
one for boosted points (`pointRateFlag=1`), and one for everything, because the API cannot
filter for time-limited sales. `normalize.py` keeps a listing only if:

- it is in a time-limited sale that has started and has a real end date (`9999-12-31` is not
  one), or its point rate is above 1 and the boost is running, and
- it has an image, and its price includes tax.

One page of every search (2026-10-14) gave 288 deals out of 780 listings, in all 12 categories.

## Run it locally

1. Copy `collector/.env.example` to `collector/.env` and fill in the Rakuten keys.
2. Collect:

   ```
   python3 collector/rakuten.py --categories collector/categories.json --pages 1
   ```

3. Turn the raw file into SQL and load it into your local database. `--cutoff` is in
   milliseconds; deals fetched before it lose their price, and 0 keeps everything:

   ```
   python3 collector/normalize.py --cutoff 0 collector/out/raw/rakuten/<date>/<time>Z.ndjson > collector/out/load.sql
   npx wrangler d1 execute DB --local --file collector/out/load.sql
   ```

4. Run the tests: `python3 -m unittest discover -s collector`.

To try it without keys or network:

```
python3 collector/rakuten.py --from-file collector/samples/rakuten-item-search.json
```

If a request fails, the rest of that search is skipped and the other searches carry on. The run
ends with an error, and the workflow still loads what was fetched.

## GitHub Actions setup

The Collect workflow needs these in the repository settings.

Secrets:

- `RAKUTEN_APP_ID`, `RAKUTEN_ACCESS_KEY`, `RAKUTEN_AFFILIATE_ID` (optional; leave it unset
  until we decide on Rakuten Affiliate)
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: an R2 API token with object read and write on
  the bucket only
- `CLOUDFLARE_D1_TOKEN`: a Cloudflare API token with D1 edit only, separate from the deploy
  token. Only the load job gets it.

Variables:

- `R2_BUCKET`: the bucket name

The bucket must be private. Give it a lifecycle rule that deletes `raw/` after 1 day, in case
the workflow stops running: R2 removes expired objects within about a day after that.

R2 is reached with the AWS CLI that GitHub's runners already have, pointed at R2's
S3-compatible endpoint. Local runs do not upload.

GitHub turns off a scheduled workflow in a public repository after 60 days without activity.

## What we learned about the Rakuten API (2026-10-06)

- Endpoint: Ichiba Item Search, version `20260701`. Needs `applicationId` and `accessKey`.
- Our app is registered as a Web Application, so requests send a `Referer` and `Origin` that
  match the app's allowed websites (`github.com`, `*.workers.dev`).
- There is **no original or list price**, only `itemPrice`. "81%OFF" style claims appear only
  in item names.
- `startTime` / `endTime` give the period of a time-limited sale. `pointRate` has its own
  start and end times. All are Japan time with no zone; `9999-12-31` means no end date.
- There is no JAN code field. Some listings mention it in `itemCaption`.
- Searches return non-product listings such as ふるさと納税; we exclude them with `NGKeyword`.
- A full response is in `samples/rakuten-item-search.json` (application ID removed).

## Still open

- `samples/rakuten-item-search.json` is a real response with prices. Replace it with invented
  values (decision 6).
- Whether a server sending `Referer` for a Web Application is within the terms.

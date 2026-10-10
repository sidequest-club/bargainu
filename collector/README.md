# Collector

Fetches product data from store APIs and lands it raw in R2. It is independent of the web
app: plain Python, standard library only, run by GitHub Actions.

The flow is raw first, clean afterwards:

1. `rakuten.py` saves what the API returned, unchanged, as NDJSON.
2. The workflow copies those files to R2.
3. `normalize.py` turns raw files into cleaned records. It is a draft until the deal data
   model is agreed (SID-17).

Status: Rakuten only. Runs are started by hand.

## Where the data goes

```
raw/rakuten/<YYYY-MM-DD>/<HHMMSS>Z.ndjson
```

Dates and times are UTC. One file per run. Each line is one item:

```json
{"fetched_at": "2026-10-07T07:12:29+00:00", "keyword": "イヤホン", "page": 1, "item": { ... }}
```

`item` is exactly what Rakuten returned. Locally the same layout is written under
`collector/out/`, which is not committed.

Raw files keep Rakuten's item URLs as sent, and those contain our application ID
(`rafcid=...`). Keep the bucket private. `normalize.py` removes the parameter.

## Run it locally

1. Copy `collector/.env.example` to `collector/.env` and fill in the Rakuten keys.
2. Collect:

   ```
   python3 collector/rakuten.py イヤホン --pages 1
   ```

3. Clean a raw file:

   ```
   python3 collector/normalize.py collector/out/raw/rakuten/<date>/<time>Z.ndjson
   ```

To try it without keys or network:

```
python3 collector/rakuten.py --from-file collector/samples/rakuten-item-search.json
```

If a later page fails, the run stops with an error but keeps the items already fetched.

## GitHub Actions setup

The Collect workflow needs these in the repository settings.

Secrets:

- `RAKUTEN_APP_ID`, `RAKUTEN_ACCESS_KEY`, `RAKUTEN_AFFILIATE_ID` (optional)
- `R2_ACCOUNT_ID`: the Cloudflare account ID
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: an R2 API token with write access to the bucket

Variables:

- `R2_BUCKET`: the bucket name

The upload uses the AWS CLI that GitHub's runners already have, pointed at R2's
S3-compatible endpoint. Local runs do not upload.

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

- Prices may be kept for 24 hours and other item data for 3 months, so raw files with prices
  cannot stay in R2 as they do now. See decision 6 in `docs/decisions.md`.
- `samples/rakuten-item-search.json` is a real response with prices. Replace it with invented
  values (decision 6).
- Whether a server sending `Referer` for a Web Application is within the terms.
- How R2 files reach D1: a Worker that loads them, or the ingest endpoint (SID-23, SID-28).

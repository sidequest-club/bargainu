# Collector

Fetches product data from store APIs and hands it to the Bargainu Worker. It is independent
of the web app: plain Python, standard library only, run by GitHub Actions.

Status: Rakuten only, and it writes JSON files. Posting to the Worker comes once the ingest
endpoint exists.

## Run it locally

1. Copy `collector/.env.example` to `collector/.env` and fill in the Rakuten keys.
2. Run a search:

   ```
   python3 collector/rakuten.py イヤホン --pages 1
   ```

   Output goes to `collector/out/rakuten-<timestamp>.json`.

To try the output format without keys or network:

```
python3 collector/rakuten.py --from-file collector/samples/rakuten-item-search.json
```

## What we learned about the Rakuten API (2026-10-06)

- Endpoint: Ichiba Item Search, version `20260701`. Needs `applicationId` and `accessKey`.
- Our app is registered as a Web Application, so requests send a `Referer` and `Origin` that
  match the app's allowed websites (`github.com`, `*.workers.dev`).
- There is **no original or list price**, only `itemPrice`. A discount percent has to come
  from our own stored price history. "81%OFF" style claims appear only in item names.
- `startTime` / `endTime` give the period of a time-limited sale. `pointRate` has its own
  start and end times.
- There is no JAN code field. Some listings mention it in `itemCaption`.
- Searches return non-product listings such as ふるさと納税; we exclude them with `NGKeyword`.
- A raw response is in `samples/rakuten-item-search.json` (application ID removed).

## Still open

- How long the terms allow us to store prices.
- Whether a Rakuten credit or affiliate link is required on our pages.
- Whether a server sending `Referer` for a Web Application is within the terms.

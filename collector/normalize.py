"""Turn raw Rakuten NDJSON (from rakuten.py) into cleaned records.

This is a first draft of the cleaning step. The deal data model is not agreed yet (SID-17),
so treat the output fields as a proposal.

Usage:

    python collector/normalize.py collector/out/raw/rakuten/2026-10-07/071229Z.ndjson

Prints a JSON array to stdout, or writes it to --out.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

JST = timezone(timedelta(hours=9))

# Rakuten uses this date to mean "no end date".
NO_END_YEAR = 9999

# Query parameters Rakuten adds to item URLs. `rafcid` carries our application ID.
TRACKING_PARAMS = {"rafcid"}

AFFILIATE_HOST = "hb.afl.rakuten.co.jp"


def strip_tracking(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k not in TRACKING_PARAMS]
    return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))


def plain_item_url(url: str) -> str:
    """Return the item's own page URL.

    When we send an affiliate ID, Rakuten returns its affiliate redirect in itemUrl as well,
    with the real page in the `pc` parameter.
    """
    parts = urllib.parse.urlsplit(url)
    if parts.netloc == AFFILIATE_HOST:
        target = urllib.parse.parse_qs(parts.query).get("pc")
        if target:
            url = target[0]
    return strip_tracking(url)


def jst_to_iso(value: str | None) -> str | None:
    """Rakuten sends '2026-10-04 10:00' in Japan time with no zone. Return ISO with +09:00."""
    if not value:
        return None
    parsed = datetime.strptime(value, "%Y-%m-%d %H:%M")
    if parsed.year == NO_END_YEAR:
        return None
    return parsed.replace(tzinfo=JST).isoformat(timespec="minutes")


def normalize(line: dict) -> dict:
    item = line["item"]
    # TODO: this is the 128x128 thumbnail. The app will want a larger size.
    images = item.get("mediumImageUrls") or []
    return {
        "store": "rakuten",
        "item_code": item["itemCode"],
        "name": item["itemName"],
        "price": item["itemPrice"],
        "url": plain_item_url(item["itemUrl"]),
        "affiliate_url": strip_tracking(item["affiliateUrl"]) if item.get("affiliateUrl") else None,
        "image_url": images[0] if images else None,
        "shop_code": item.get("shopCode"),
        "shop_name": item.get("shopName"),
        "genre_id": item.get("genreId"),
        "available": item.get("availability") == 1,
        "review_count": item.get("reviewCount"),
        "review_average": item.get("reviewAverage"),
        # Time-limited sale period. Null when the item is not in one.
        "sale_start": jst_to_iso(item.get("startTime")),
        "sale_end": jst_to_iso(item.get("endTime")),
        "point_rate": item.get("pointRate"),
        "point_rate_start": jst_to_iso(item.get("pointRateStartTime")),
        "point_rate_end": jst_to_iso(item.get("pointRateEndTime")),
        "fetched_at": line["fetched_at"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="+", type=Path, help="raw NDJSON files")
    parser.add_argument("--out", type=Path, help="write here instead of stdout")
    args = parser.parse_args()

    # Later lines win, so an item fetched twice keeps its newest record.
    records: dict[str, dict] = {}
    for path in args.files:
        with path.open(encoding="utf-8") as lines:
            for text in lines:
                if text.strip():
                    record = normalize(json.loads(text))
                    records[record["item_code"]] = record

    output = json.dumps(list(records.values()), ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.write_text(output, encoding="utf-8")
        print(f"Wrote {len(records)} records to {args.out}", file=sys.stderr)
    else:
        sys.stdout.write(output)


if __name__ == "__main__":
    main()

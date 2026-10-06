"""Collect items from the Rakuten Ichiba Item Search API.

Uses only the standard library. Usage:

    python collector/rakuten.py イヤホン 掃除機 --pages 2
    python collector/rakuten.py --from-file collector/samples/rakuten-item-search.json

Writes one JSON file per run to collector/out/.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701"
HERE = Path(__file__).parent

# Rakuten asks for roughly one request every 1.5 seconds.
SECONDS_BETWEEN_REQUESTS = 1.5
HITS_PER_PAGE = 30  # API maximum
MAX_PAGE = 100  # API maximum

# Listings that are not ordinary products. Passed to the API as NGKeyword.
EXCLUDED_WORDS = ["ふるさと納税"]


def load_env_file(path: Path) -> None:
    """Read KEY=VALUE lines into os.environ without overriding existing values."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def fetch_page(keyword: str, page: int) -> dict:
    params = {
        "applicationId": os.environ["RAKUTEN_APP_ID"],
        "accessKey": os.environ["RAKUTEN_ACCESS_KEY"],
        "keyword": keyword,
        "NGKeyword": " ".join(EXCLUDED_WORDS),
        "hits": HITS_PER_PAGE,
        "page": page,
        "format": "json",
        "formatVersion": 2,
    }
    affiliate_id = os.environ.get("RAKUTEN_AFFILIATE_ID")
    if affiliate_id:
        params["affiliateId"] = affiliate_id

    referer = os.environ.get("RAKUTEN_REFERER", "https://github.com/")
    origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(referer))
    request = urllib.request.Request(
        f"{ENDPOINT}?{urllib.parse.urlencode(params)}",
        headers={"Referer": referer, "Origin": origin},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Rakuten explains the problem in the body. Never print the URL: it holds the key.
        body = error.read().decode("utf-8", "replace")
        raise SystemExit(f"Rakuten returned HTTP {error.code}: {body}") from None


def normalize(item: dict, fetched_at: str) -> dict:
    """Keep the fields Bargainu uses, under our own names."""
    images = item.get("mediumImageUrls") or []
    return {
        "store": "rakuten",
        "item_code": item["itemCode"],
        "name": item["itemName"],
        "price": item["itemPrice"],
        "url": item["itemUrl"],
        "affiliate_url": item.get("affiliateUrl") or None,
        "image_url": images[0] if images else None,
        "shop_code": item.get("shopCode"),
        "shop_name": item.get("shopName"),
        "genre_id": item.get("genreId"),
        "available": item.get("availability") == 1,
        "review_count": item.get("reviewCount"),
        "review_average": item.get("reviewAverage"),
        # Time-limited sale period, empty when the item is not in one.
        "sale_start": item.get("startTime") or None,
        "sale_end": item.get("endTime") or None,
        "point_rate": item.get("pointRate"),
        "point_rate_start": item.get("pointRateStartTime") or None,
        "point_rate_end": item.get("pointRateEndTime") or None,
        "fetched_at": fetched_at,
    }


def collect(keywords: list[str], pages: int) -> list[dict]:
    fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    records: dict[str, dict] = {}
    first_request = True
    for keyword in keywords:
        for page in range(1, min(pages, MAX_PAGE) + 1):
            if not first_request:
                time.sleep(SECONDS_BETWEEN_REQUESTS)
            first_request = False
            data = fetch_page(keyword, page)
            if "error" in data:
                raise SystemExit(f"Rakuten error: {data}")
            for item in data.get("Items", []):
                records[item["itemCode"]] = normalize(item, fetched_at)
            print(f"{keyword} page {page}: {len(data.get('Items', []))} items", file=sys.stderr)
            if page >= data.get("pageCount", 0):
                break
    return list(records.values())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("keywords", nargs="*", help="search keywords, one search per keyword")
    parser.add_argument("--pages", type=int, default=1, help="pages per keyword (30 items each)")
    parser.add_argument("--from-file", type=Path, help="normalize a saved API response; no network")
    parser.add_argument("--out", type=Path, default=HERE / "out", help="output directory")
    args = parser.parse_args()

    if args.from_file:
        data = json.loads(args.from_file.read_text(encoding="utf-8"))
        fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        records = [normalize(item, fetched_at) for item in data["Items"]]
    else:
        if not args.keywords:
            parser.error("give at least one keyword, or --from-file")
        load_env_file(HERE / ".env")
        missing = [k for k in ("RAKUTEN_APP_ID", "RAKUTEN_ACCESS_KEY") if not os.environ.get(k)]
        if missing:
            raise SystemExit(f"Missing {', '.join(missing)}. See collector/.env.example.")
        records = collect(args.keywords, args.pages)

    args.out.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = args.out / f"rakuten-{stamp}.json"
    path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} items to {path}")


if __name__ == "__main__":
    main()

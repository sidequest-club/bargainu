"""Collect raw items from the Rakuten Ichiba Item Search API.

Writes the API's items unchanged, one per line (NDJSON), in the layout we use in R2:

    raw/rakuten/<YYYY-MM-DD>/<HHMMSS>Z.ndjson

Each line is {"fetched_at", "keyword", "genre_id", "page", "item"}, where "item" is exactly
what Rakuten returned and "genre_id" is the genre searched. Cleaning is a separate step: see
normalize.py.

Uses only the standard library. Usage:

    python collector/rakuten.py --categories collector/categories.json --pages 2
    python collector/rakuten.py イヤホン 掃除機 --pages 2
    python collector/rakuten.py --from-file collector/samples/rakuten-item-search.json
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
from typing import TextIO

ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701"
HERE = Path(__file__).parent

# Rakuten asks for roughly one request every 1.5 seconds.
SECONDS_BETWEEN_REQUESTS = 1.5
HITS_PER_PAGE = 30  # API maximum
MAX_PAGE = 100  # API maximum

# Listings that are not ordinary products. Passed to the API as NGKeyword.
EXCLUDED_WORDS = ["ふるさと納税"]


class RakutenError(Exception):
    """The API refused a request or could not be reached."""


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


def fetch_page(query: dict, page: int) -> dict:
    params = {
        "applicationId": os.environ["RAKUTEN_APP_ID"],
        "accessKey": os.environ["RAKUTEN_ACCESS_KEY"],
        **query,
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
    # Never put the request URL in an error message: it holds the access key.
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.load(response)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", "replace")
        raise RakutenError(f"HTTP {error.code}: {body}") from None
    except urllib.error.URLError as error:
        raise RakutenError(f"could not reach Rakuten: {error.reason}") from None
    if "error" in data:
        raise RakutenError(str(data))
    return data


def genre_searches(categories: Path) -> list[dict]:
    """Two searches per genre: boosted points, which the API can filter on, and everything, for
    time-limited sales, which it cannot."""
    mapping = json.loads(categories.read_text(encoding="utf-8"))
    genres = [int(genre) for names in mapping.values() for genre in names]
    return [
        {"genreId": genre, "imageFlag": 1, **points}
        for genre in genres
        for points in ({"pointRateFlag": 1}, {})
    ]


def describe(query: dict) -> str:
    if "keyword" in query:
        return query["keyword"]
    return f"genre {query['genreId']}" + (" points" if query.get("pointRateFlag") else "")


def write_items(out: TextIO, items: list[dict], query: dict, page: int, at: str) -> None:
    for item in items:
        line = {
            "fetched_at": at,
            "keyword": query.get("keyword"),
            "genre_id": query.get("genreId"),
            "page": page,
            "item": item,
        }
        out.write(json.dumps(line, ensure_ascii=False) + "\n")
    # Flush per page, so an error on a later page keeps what was already fetched.
    out.flush()


def collect(out: TextIO, queries: list[dict], pages: int) -> tuple[int, str | None]:
    """Fetch every query and page. Returns (items written, error or None)."""
    written = 0
    first_request = True
    for query in queries:
        for page in range(1, min(pages, MAX_PAGE) + 1):
            if not first_request:
                time.sleep(SECONDS_BETWEEN_REQUESTS)
            first_request = False
            at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            try:
                data = fetch_page(query, page)
            except RakutenError as error:
                return written, f"{describe(query)} page {page}: {error}"
            items = data.get("Items", [])
            write_items(out, items, query, page, at)
            written += len(items)
            print(f"{describe(query)} page {page}: {len(items)} items", file=sys.stderr)
            if page >= data.get("pageCount", 0):
                break
    return written, None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("keywords", nargs="*", help="search keywords, one search per keyword")
    parser.add_argument("--categories", type=Path, help="search the genres in this file instead")
    parser.add_argument("--pages", type=int, default=1, help="pages per keyword (30 items each)")
    parser.add_argument("--from-file", type=Path, help="use a saved API response; no network")
    parser.add_argument("--out", type=Path, default=HERE / "out", help="output directory")
    args = parser.parse_args()

    if not args.from_file:
        if not args.keywords and not args.categories:
            parser.error("give at least one keyword, --categories or --from-file")
        load_env_file(HERE / ".env")
        missing = [k for k in ("RAKUTEN_APP_ID", "RAKUTEN_ACCESS_KEY") if not os.environ.get(k)]
        if missing:
            raise SystemExit(f"Missing {', '.join(missing)}. See collector/.env.example.")

    now = datetime.now(timezone.utc)
    path = args.out / "raw" / "rakuten" / now.strftime("%Y-%m-%d") / now.strftime("%H%M%SZ.ndjson")
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as out:
        if args.from_file:
            data = json.loads(args.from_file.read_text(encoding="utf-8"))
            at = now.isoformat(timespec="seconds")
            write_items(out, data["Items"], {}, data.get("page", 1), at)
            written, error = len(data["Items"]), None
        else:
            queries = [{"keyword": keyword} for keyword in args.keywords]
            if args.categories:
                queries += genre_searches(args.categories)
            written, error = collect(out, queries, args.pages)

    print(f"Wrote {written} items to {path}")
    if error:
        raise SystemExit(f"Stopped early, kept what was fetched. {error}")


if __name__ == "__main__":
    main()

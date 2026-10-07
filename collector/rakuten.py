"""Collect raw items from the Rakuten Ichiba Item Search API.

Writes the API's items unchanged, one per line (NDJSON), in the layout we use in R2:

    raw/rakuten/<YYYY-MM-DD>/<HHMMSS>Z.ndjson

Each line is {"fetched_at", "keyword", "page", "item"}, where "item" is exactly what
Rakuten returned. Cleaning is a separate step: see normalize.py.

Uses only the standard library. Usage:

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


def write_items(out: TextIO, items: list[dict], keyword: str | None, page: int, at: str) -> None:
    for item in items:
        line = {"fetched_at": at, "keyword": keyword, "page": page, "item": item}
        out.write(json.dumps(line, ensure_ascii=False) + "\n")
    # Flush per page, so an error on a later page keeps what was already fetched.
    out.flush()


def collect(out: TextIO, keywords: list[str], pages: int) -> tuple[int, str | None]:
    """Fetch every keyword and page. Returns (items written, error or None)."""
    written = 0
    first_request = True
    for keyword in keywords:
        for page in range(1, min(pages, MAX_PAGE) + 1):
            if not first_request:
                time.sleep(SECONDS_BETWEEN_REQUESTS)
            first_request = False
            at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            try:
                data = fetch_page(keyword, page)
            except RakutenError as error:
                return written, f"{keyword} page {page}: {error}"
            items = data.get("Items", [])
            write_items(out, items, keyword, page, at)
            written += len(items)
            print(f"{keyword} page {page}: {len(items)} items", file=sys.stderr)
            if page >= data.get("pageCount", 0):
                break
    return written, None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("keywords", nargs="*", help="search keywords, one search per keyword")
    parser.add_argument("--pages", type=int, default=1, help="pages per keyword (30 items each)")
    parser.add_argument("--from-file", type=Path, help="use a saved API response; no network")
    parser.add_argument("--out", type=Path, default=HERE / "out", help="output directory")
    args = parser.parse_args()

    if not args.from_file:
        if not args.keywords:
            parser.error("give at least one keyword, or --from-file")
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
            write_items(out, data["Items"], None, data.get("page", 1), at)
            written, error = len(data["Items"]), None
        else:
            written, error = collect(out, args.keywords, args.pages)

    print(f"Wrote {written} items to {path}")
    if error:
        raise SystemExit(f"Stopped early, kept what was fetched. {error}")


if __name__ == "__main__":
    main()

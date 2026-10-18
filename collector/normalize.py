"""Turn raw Rakuten NDJSON (from rakuten.py) into SQL that loads the deals into D1.

Usage:

    python collector/normalize.py --cutoff 1791940000000 collector/out/raw/rakuten/<date>/<time>Z.ndjson

Upserts every listing that is a deal, then clears the price and promotions of the deals fetched
before --cutoff (ms, the start of the run), so only what this run found is on sale. Deals no run
has fetched for 3 months are deleted. With no files, only the clean-up runs. The tables are in
docs/architecture/data-model.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).parent
JST = timezone(timedelta(hours=9))

# Rakuten uses this date to mean "no end date".
NO_END_YEAR = 9999

# Query parameters Rakuten adds to item URLs. `rafcid` carries our application ID.
TRACKING_PARAMS = {"rafcid"}

AFFILIATE_HOST = "hb.afl.rakuten.co.jp"

STORE = "Rakuten"

# /api/deals sends every deal at once, so the description stays short.
BLURB_LENGTH = 300

# A cut description ends at the last sentence or word end, if one is in the last part of the cut.
BLURB_MIN_KEEP = BLURB_LENGTH // 2
SENTENCE_ENDS = "。！？!?"
ELLIPSIS = "…"

# Shops wrap sales claims in decorative brackets: 【1,000円OFF】, ＼P10倍／, ★19日9:59まで★.
# A bracketed part goes only when it holds one of these words, so 【2本セット】, 【約8畳用】 or
# 【新品】/【中古】, which say what is being sold, stay.
# Dates in a title go stale and can contradict the app's own countdown. A sales date comes with まで,
# 限定 or a start time's から and a sales percent with OFF or 最大, so a bare date, fraction or %
# (綿100%, 1/12, 24時間) is left as part of what is sold. 倍, から and 最大 also describe the item
# (2倍濃縮, 3歳から, 最大12時間点灯), so only a point rate, a start time and a discount count. ★, ☆, ◆ and ■ are also used one at a time as bullets, so
# a pair of them never spans a space.
BRACKETS = r"【[^【】]*】|\[[^\[\]]*\]|［[^［］]*］|＼[^＼／]*／|★[^★\s]*★|☆[^☆\s]*☆|◆[^◆\s]*◆|■[^■\s]*■|＜[^＜＞]*＞|《[^《》]*》|『[^『』]*』"
SALES_WORDS = re.compile(
    r"OFF|ＯＦＦ|off|ポイント|[PＰ][0-9０-９]|クーポン|セール|SALE|ＳＡＬＥ|まで|[日時0-9０-９]から|限定|"
    r"送料無料|[1１]位|ランキング|最大[0-9０-９,，]+[%％円]|半額|円引|割引|"
    r"特典|期間|マラソン|買い回り|エントリー|レビュー|予約|入荷|公式|MVP|受賞|あす楽|即納|翌日|お得|"
    r"在庫|残り|激安|大特価|値下げ|タイムセール|発送|出荷|発売|再販|新色|ノベルティ|ラッピング|掲載|紹介|"
    r"保証|ゆうパケット|メール便|宅配便|即日|当日|累計|突破|イチオシ|リニューアル|正規品|認定|EVENT|FAIR"
)
# Rakuten's own marking for an advertised listing is kept: a bracket holding exactly one of these.
KEEP_WORDS = ("広告", "PR")
TITLE_EDGES = " 　|｜/／・,、:：!！"

# Within decision 6's 3 months even across February, with a day for the run that deletes it.
KEEP_DEALS_MS = 88 * 24 * 60 * 60 * 1000


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


def jst_to_ms(value: str | None) -> int | None:
    """Rakuten sends '2026-10-04 10:00' in Japan time with no zone. None when empty or 9999."""
    if not value:
        return None
    parsed = datetime.strptime(value, "%Y-%m-%d %H:%M")
    if parsed.year == NO_END_YEAR:
        return None
    return int(parsed.replace(tzinfo=JST).timestamp() * 1000)


def promotions(item: dict, at: int) -> list[tuple[str, int | None, int | None]]:
    """Why the item is a deal at `at`, as (kind, ends_at, point_rate) rows. Empty if it is not."""
    found = []
    start, end = jst_to_ms(item.get("startTime")), jst_to_ms(item.get("endTime"))
    if end is not None and (start or 0) <= at < end:
        found.append(("sale", end, None))
    rate = item.get("pointRate") or 1
    start, end = jst_to_ms(item.get("pointRateStartTime")), jst_to_ms(item.get("pointRateEndTime"))
    if rate > 1 and (start or 0) <= at and (end is None or at < end):
        found.append(("points", end, rate))
    return found


def to_deal(line: dict, categories: dict[int, str]) -> dict | None:
    """The deal a raw line describes, or None if we do not keep it."""
    item = line["item"]
    category = categories.get(line.get("genre_id"))
    images = item.get("mediumImageUrls") or []
    at = int(datetime.fromisoformat(line["fetched_at"]).timestamp() * 1000)
    reasons = promotions(item, at)
    if not category or not images or item.get("taxFlag") == 1 or not reasons:
        return None
    return {
        "shop": {"code": item["shopCode"], "store": STORE, "name": item["shopName"]},
        "deal": {
            "id": item["itemCode"],
            "shop_code": item["shopCode"],
            "category": category,
            "title": clean_title(item["itemName"]),
            "blurb": cut_blurb(item.get("itemCaption") or ""),
            "image": images[0],
            "url": plain_item_url(item["itemUrl"]),
            "price": item["itemPrice"],
            "fetched_at": at,
            "found_at": at,
            "rating": float(item.get("reviewAverage") or 0),
            "reviews": int(item.get("reviewCount") or 0),
        },
        "promotions": reasons,
    }


def clean_title(title: str) -> str:
    """The shop's title without the bracketed sales claims around it. The raw title when cleaning
    would leave nothing."""

    def drop(match: re.Match[str]) -> str:
        part = match.group(0)
        if part[1:-1].strip() in KEEP_WORDS or not SALES_WORDS.search(part):
            return part
        return " "

    cleaned = re.sub(BRACKETS, drop, title)
    cleaned = " ".join(cleaned.split()).strip(TITLE_EDGES)
    return cleaned or title


def cut_blurb(caption: str) -> str:
    """The description on one line, cut to BLURB_LENGTH at a sentence or word end, with an ellipsis."""
    text = " ".join(caption.split())
    if len(text) <= BLURB_LENGTH:
        return text
    cut = text[: BLURB_LENGTH - len(ELLIPSIS)]
    end = max(cut.rfind(mark) for mark in SENTENCE_ENDS)
    if end >= BLURB_MIN_KEEP:
        return cut[: end + 1]
    space = cut.rfind(" ")
    if space >= BLURB_MIN_KEEP:
        cut = cut[:space]
    return cut.rstrip(TITLE_EDGES) + ELLIPSIS


def literal(value: str | int | float | None) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return repr(value)
    return "'" + value.replace("\x00", "").replace("'", "''") + "'"


def upsert(table: str, row: dict, key: str, keep: tuple[str, ...] = ()) -> str:
    """One INSERT per row: D1 refuses statements over 100 KB."""
    columns = ", ".join(row)
    values = ", ".join(literal(value) for value in row.values())
    updates = ", ".join(f"{c} = excluded.{c}" for c in row if c != key and c not in keep)
    return (
        f"INSERT INTO {table} ({columns}) VALUES ({values})"
        f" ON CONFLICT({key}) DO UPDATE SET {updates};"
    )


def to_sql(deals: list[dict], cutoff: int) -> str:
    shops = {d["shop"]["code"]: d["shop"] for d in deals}
    statements = [upsert("shops", shop, "code") for shop in shops.values()]
    statements += [upsert("deals", d["deal"], "id", keep=("found_at",)) for d in deals]
    # A deal this run did not refresh keeps no promotion, so every row is replaced.
    statements.append("DELETE FROM promotions;")
    statements += [
        "INSERT INTO promotions (deal_id, kind, ends_at, point_rate) VALUES "
        f"({literal(d['deal']['id'])}, {literal(kind)}, {literal(ends_at)}, {literal(rate)});"
        for d in deals
        for kind, ends_at, rate in d["promotions"]
    ]
    # Prices may be kept 24 hours (decision 6). Favorites cascade from the delete.
    statements.append(
        f"UPDATE deals SET price = NULL WHERE fetched_at < {cutoff} AND price IS NOT NULL;"
    )
    statements.append(f"DELETE FROM deals WHERE fetched_at < {cutoff - KEEP_DEALS_MS};")
    statements.append("DELETE FROM shops WHERE code NOT IN (SELECT shop_code FROM deals);")
    return "\n".join(statements) + "\n"


def load_categories(path: Path) -> dict[int, str]:
    mapping = json.loads(path.read_text(encoding="utf-8"))
    return {int(genre): category for category, genres in mapping.items() for genre in genres}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="*", type=Path, help="raw NDJSON files")
    parser.add_argument(
        "--cutoff", type=int, required=True, help="clear the prices of deals fetched before this (ms)"
    )
    parser.add_argument("--categories", type=Path, default=HERE / "categories.json")
    args = parser.parse_args()

    categories = load_categories(args.categories)
    # Later lines win, so an item fetched twice keeps its newest record.
    deals: dict[str, dict] = {}
    lines = 0
    for path in args.files:
        with path.open(encoding="utf-8") as raw:
            for text in raw:
                if text.strip():
                    lines += 1
                    deal = to_deal(json.loads(text), categories)
                    if deal:
                        deals[deal["deal"]["id"]] = deal

    sys.stdout.write(to_sql(list(deals.values()), args.cutoff))
    print(f"{len(deals)} deals from {lines} listings", file=sys.stderr)


if __name__ == "__main__":
    main()

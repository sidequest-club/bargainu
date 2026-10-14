"""Tests for normalize.py. Run from the repository root: python3 -m unittest discover -s collector"""

import json
import re
import sqlite3
import unittest
from pathlib import Path

import normalize

ROOT = Path(__file__).parent.parent
CATEGORIES = {558885: "Shoes"}
HOUR = 60 * 60 * 1000

# 2026-10-14 10:20 in Japan. Every value below is invented.
AT = "2026-10-14T01:20:00+00:00"
AT_MS = 1791940800000


def line(fetched_at=AT, genre_id=558885, **item):
    listing = {
        "itemCode": "kutsuya:1",
        "itemName": "Canvas shoe",
        "itemCaption": "  A canvas\n shoe.  ",
        "itemPrice": 5000,
        "itemUrl": "https://item.rakuten.co.jp/kutsuya/1/?rafcid=not-our-id",
        "mediumImageUrls": ["https://thumbnail.image.rakuten.co.jp/1.jpg"],
        "shopCode": "kutsuya",
        "shopName": "Kutsuya",
        "reviewAverage": 4.5,
        "reviewCount": 3,
        "taxFlag": 0,
        "startTime": "2026-10-14 10:00",
        "endTime": "2026-10-20 09:59",
        "pointRate": 1,
        "pointRateStartTime": "",
        "pointRateEndTime": "",
    }
    item = {**listing, **item}
    return {"fetched_at": fetched_at, "keyword": None, "genre_id": genre_id, "page": 1, "item": item}


def deal(**kwargs):
    return normalize.to_deal(line(**kwargs), CATEGORIES)


class WhatIsKept(unittest.TestCase):
    def test_a_sale_with_an_end_date(self):
        ends = normalize.jst_to_ms("2026-10-20 09:59")
        self.assertEqual(deal()["promotions"], [("sale", ends, None)])

    def test_not_a_sale_without_a_real_end(self):
        self.assertIsNone(deal(endTime="9999-12-31 23:59"))

    def test_not_a_sale_that_has_not_started(self):
        self.assertIsNone(deal(startTime="2026-10-15 10:00"))

    def test_not_normal_points(self):
        self.assertIsNone(deal(startTime="", endTime="", pointRate=1))

    def test_boosted_points_with_no_end(self):
        found = deal(startTime="", endTime="", pointRate=5)
        self.assertEqual(found["promotions"], [("points", None, 5)])

    def test_not_tax_excluded(self):
        self.assertIsNone(deal(taxFlag=1))

    def test_not_without_an_image(self):
        self.assertIsNone(deal(mediumImageUrls=[]))

    def test_not_a_genre_outside_our_categories(self):
        self.assertIsNone(deal(genre_id=999))

    def test_fields(self):
        row = deal()["deal"]
        self.assertEqual(row["url"], "https://item.rakuten.co.jp/kutsuya/1/")
        self.assertEqual(row["blurb"], "A canvas shoe.")
        self.assertEqual(row["category"], "Shoes")
        self.assertEqual(row["fetched_at"], AT_MS)


class Load(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        for migration in sorted((ROOT / "drizzle").glob("*.sql")):
            for statement in migration.read_text(encoding="utf-8").split("--> statement-breakpoint"):
                self.db.executescript(statement)

    def load(self, deals, cutoff):
        self.db.executescript(normalize.to_sql(deals, cutoff))

    def one(self, sql):
        return self.db.execute(sql).fetchone()

    def test_a_later_run_updates_the_deal_but_keeps_when_it_was_found(self):
        self.load([deal()], AT_MS)
        next_day = deal(fetched_at="2026-10-15T01:20:00+00:00", itemPrice=4500, itemName="It's new")
        self.load([next_day], AT_MS + 24 * HOUR)

        self.assertEqual(self.one("select price, title, found_at from deals"), (4500, "It's new", AT_MS))
        self.assertEqual(self.one("select count(*) from promotions"), (1,))

    def test_deals_the_run_did_not_refresh_go_with_their_favorites_and_shop(self):
        self.load([deal()], AT_MS)
        self.db.execute(
            "insert into user (id, name, email, created_at, updated_at)"
            " values ('u', 'U', 'u@example.invalid', 0, 0)"
        )
        self.db.execute("insert into favorites (user_id, deal_id) values ('u', 'kutsuya:1')")

        self.load([], AT_MS + 24 * HOUR)

        for table in ("deals", "promotions", "favorites", "shops"):
            self.assertEqual(self.one(f"select count(*) from {table}"), (0,), table)


class Categories(unittest.TestCase):
    def test_every_category_is_one_of_ours(self):
        taxonomy = (ROOT / "worker" / "db" / "taxonomy.ts").read_text(encoding="utf-8")
        listed = re.search(r"CATEGORIES = \[(.*?)\]", taxonomy, re.S)[1]
        ours = set(re.findall(r"'(\w+)'", listed))
        mapping = json.loads((ROOT / "collector" / "categories.json").read_text(encoding="utf-8"))
        self.assertLessEqual(set(mapping), ours)


if __name__ == "__main__":
    unittest.main()

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



class Titles(unittest.TestCase):
    def test_sales_claims_in_brackets_go(self):
        title = "【10/15限定！最大500円OFFクーポン】＼P10倍／ 見本 スニーカー ★20日9:59まで★"
        self.assertEqual(normalize.clean_title(title), "見本 スニーカー")

    def test_brackets_that_say_what_is_sold_stay(self):
        title = "【新品】【2足セット】見本 スニーカー【約25cm】"
        self.assertEqual(normalize.clean_title(title), title)
        for title in ("【お得な2個セット】見本 洗剤", "【2個セット 送料無料】見本 洗剤"):
            self.assertEqual(normalize.clean_title(title), title)

    def test_an_advert_marking_stays(self):
        title = "見本 スニーカー【広告】"
        self.assertEqual(normalize.clean_title(title), title)

    def test_a_single_star_used_as_a_bullet_does_not_take_the_name(self):
        title = "★楽天1位 見本 スニーカー メンズ ★5点満点"
        self.assertEqual(normalize.clean_title(title), title)

    def test_sizes_materials_and_years_in_brackets_stay(self):
        for title in ("【綿100%】見本 Tシャツ", "【1/12スケール】見本 模型", "【24時間保温】見本 水筒", "【2027年4月始まり】見本 手帳",
                      "【2倍濃縮】見本 洗剤", "【10倍ズーム】見本 双眼鏡", "【3歳から】見本 積み木", "【最大12時間点灯】見本 ライト",
                      "【Coffee Beans】見本", "【HUAWEI P30】見本"):
            self.assertEqual(normalize.clean_title(title), title)

    def test_start_times_discounts_and_point_rates_still_go(self):
        for title in ("【10/15 20:00から】見本 スニーカー", "【最大50%引き】見本 スニーカー", "【全品P10倍】見本 スニーカー", "＼ポイント5倍／見本 スニーカー",
                      "【P最大10倍】見本 スニーカー", "＼P最大44倍／見本 スニーカー", "【10/20(月)から】見本 スニーカー"):
            self.assertEqual(normalize.clean_title(title), "見本 スニーカー")

    def test_letters_p_r_inside_a_sales_claim_do_not_keep_it(self):
        self.assertEqual(normalize.clean_title("【SPRING SALE 20%OFF】見本 スニーカー"), "見本 スニーカー")
        self.assertEqual(normalize.clean_title("【20%off】見本 スニーカー"), "見本 スニーカー")

    def test_separators_left_at_the_edges_go(self):
        self.assertEqual(normalize.clean_title("【楽天1位】｜見本 スニーカー｜"), "見本 スニーカー")

    def test_a_title_that_is_only_a_claim_is_kept(self):
        title = "【P10倍 20日まで】"
        self.assertEqual(normalize.clean_title(title), title)

    def test_the_deal_gets_the_clean_title(self):
        self.assertEqual(deal(itemName="＼送料無料／Canvas shoe")["deal"]["title"], "Canvas shoe")


class Blurbs(unittest.TestCase):
    def test_a_short_caption_is_kept_whole(self):
        self.assertEqual(normalize.cut_blurb("  A canvas\n shoe.  "), "A canvas shoe.")

    def test_a_long_caption_ends_at_a_sentence(self):
        caption = "見本の説明です。" * 60
        blurb = normalize.cut_blurb(caption)
        self.assertLessEqual(len(blurb), normalize.BLURB_LENGTH)
        self.assertTrue(blurb.endswith("。"))

    def test_a_long_caption_with_no_sentence_ends_at_a_word_with_an_ellipsis(self):
        blurb = normalize.cut_blurb("canvas " * 100)
        self.assertLessEqual(len(blurb), normalize.BLURB_LENGTH)
        self.assertTrue(blurb.endswith("canvas…"))

    def test_a_long_caption_with_no_break_is_cut_with_an_ellipsis(self):
        blurb = normalize.cut_blurb("あ" * 400)
        self.assertEqual(len(blurb), normalize.BLURB_LENGTH)
        self.assertTrue(blurb.endswith("…"))

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

    def save_favorite(self):
        self.db.execute(
            "insert into user (id, name, email, created_at, updated_at)"
            " values ('u', 'U', 'u@example.invalid', 0, 0)"
        )
        self.db.execute("insert into favorites (user_id, deal_id) values ('u', 'kutsuya:1')")

    def test_a_deal_the_run_did_not_refresh_loses_its_price_but_keeps_its_favorite(self):
        self.load([deal()], AT_MS)
        self.save_favorite()

        self.load([], AT_MS + 24 * HOUR)

        self.assertEqual(self.one("select price from deals"), (None,))
        self.assertEqual(self.one("select count(*) from promotions"), (0,))
        self.assertEqual(self.one("select count(*) from favorites"), (1,))
        self.assertEqual(self.one("select count(*) from shops"), (1,))

    def test_a_deal_no_run_refreshed_for_3_months_goes_with_its_favorites_and_shop(self):
        self.load([deal()], AT_MS)
        self.save_favorite()

        self.load([], AT_MS + normalize.KEEP_DEALS_MS + HOUR)

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

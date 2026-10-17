"""Tests for rakuten.py. Run from the repository root: python3 -m unittest discover -s collector"""

import io
import json
import unittest
from unittest import mock

import rakuten


def fetch_page(query, page):
    if query["genreId"] == 1:
        raise rakuten.RakutenError("HTTP 503")
    return {"Items": [{"itemCode": "kutsuya:1"}], "pageCount": 1}


class Collect(unittest.TestCase):
    def test_a_failed_search_does_not_stop_the_next(self):
        out = io.StringIO()
        with mock.patch.object(rakuten, "fetch_page", fetch_page), mock.patch("time.sleep"):
            written, error = rakuten.collect(out, [{"genreId": 1}, {"genreId": 2}], pages=2)

        self.assertEqual(written, 1)
        self.assertEqual([json.loads(line)["genre_id"] for line in out.getvalue().splitlines()], [2])
        self.assertIn("genre 1 page 1: HTTP 503", error)


if __name__ == "__main__":
    unittest.main()

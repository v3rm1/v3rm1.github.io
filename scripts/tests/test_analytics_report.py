"""Unit tests for scripts/analytics_report.py.

Run from the repository root: python3 -m unittest discover -s scripts/tests
"""
import datetime as dt
import email.message
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import analytics_report as ar  # noqa: E402

TODAY = dt.date(2026, 10, 13)
NOW = dt.datetime(2026, 10, 13, 7, 0, tzinfo=dt.timezone.utc)


def fixture(name):
    return json.loads((HERE / "fixtures" / (name + ".json")).read_text())


def fake_get(path, **params):
    """Answers like the API, choosing the fixture by endpoint and window."""
    if path == "/stats/total":
        return fixture("total_current" if params["start"] == "2026-09-14" else "total_previous")
    return fixture(path.rsplit("/", 1)[1])


def empty_get(path, **params):
    if path == "/stats/total":
        return {"total": 0, "total_events": 0, "total_utc": 0, "stats": []}
    if path == "/stats/hits":
        return {"total": 0, "more": False, "hits": []}
    return {"more": False, "stats": []}


def http_error(code, body, headers=None):
    hdrs = email.message.Message()
    for k, v in (headers or {}).items():
        hdrs[k] = v
    return urllib.error.HTTPError("https://x", code, "err", hdrs, io.BytesIO(json.dumps(body).encode()))


class WindowTest(unittest.TestCase):
    def test_windows(self):
        cur, prev = ar.windows(TODAY, 30)
        self.assertEqual(cur, (dt.date(2026, 9, 14), dt.date(2026, 10, 13)))
        self.assertEqual(prev, (dt.date(2026, 8, 15), dt.date(2026, 9, 13)))

    def test_change_pct(self):
        self.assertEqual(ar.change_pct(30, 20), 50.0)
        self.assertEqual(ar.change_pct(5, 0), None)


class BuildReportTest(unittest.TestCase):
    def setUp(self):
        self.report = ar.build_report(fake_get, TODAY, 30, now=NOW)

    def test_totals(self):
        self.assertEqual(
            self.report["totals"],
            {"visits": 26, "events": 4, "previous_visits": 19, "previous_events": 1, "change_pct": 36.8},
        )
        self.assertEqual(self.report["generated_at"], "2026-10-13T07:00:00+00:00")
        self.assertEqual(self.report["window"], {"start": "2026-09-14", "end": "2026-10-13", "days": 30})

    def test_paths_split_and_sorted(self):
        self.assertEqual([r["path"] for r in self.report["pages"]], ["/", "/de/"])
        self.assertEqual([r["path"] for r in self.report["panes"]], ["/#skills/jax", "/#projects"])
        self.assertEqual(self.report["blog"][0]["title"], "From Legg-Hutter to ARC")
        self.assertEqual(self.report["events"], [{"name": "out-github.com", "visits": 4}, {"name": "cv-industry", "visits": 2}])

    def test_languages_daily_and_breakdowns(self):
        self.assertEqual(self.report["languages"], {"en": 12, "de": 3})
        # Summed from page paths only (the cv-industry event is left out),
        # over every day of the window, including days without visits.
        self.assertEqual(self.report["daily"], [{"day": "2026-10-12", "visits": 5}, {"day": "2026-10-13", "visits": 10}])
        self.assertEqual(self.report["referrers"], [{"name": "linkedin.com", "count": 6}, {"name": "(direct)", "count": 2}])
        self.assertEqual(self.report["countries"][0], {"name": "Germany", "count": 8})
        self.assertEqual(self.report["sizes"], [{"name": "Phones", "count": 7}])

    def test_empty_site(self):
        report = ar.build_report(empty_get, TODAY, 30, now=NOW)
        self.assertEqual(report["totals"]["visits"], 0)
        self.assertIsNone(report["totals"]["change_pct"])
        self.assertEqual(report["pages"], [])
        self.assertEqual(report["languages"], {"en": 0, "de": 0})

    def test_more_paths_flag(self):
        def many(path, **params):
            data = fake_get(path, **params)
            if path == "/stats/hits":
                data = dict(data, more=True)
            return data

        self.assertFalse(self.report["more_paths"])
        self.assertTrue(ar.build_report(many, TODAY, 30, now=NOW)["more_paths"])


class ClientTest(unittest.TestCase):
    def test_sends_bearer_key(self):
        seen = {}

        def fake_urlopen(req, timeout):
            seen["auth"] = req.get_header("Authorization")
            seen["url"] = req.full_url
            return io.BytesIO(b'{"ok": true}')

        with mock.patch.object(ar.urllib.request, "urlopen", fake_urlopen):
            data = ar.Client("k3y", sleep=lambda s: None).get("/stats/total", start="2026-09-14")
        self.assertEqual(data, {"ok": True})
        self.assertEqual(seen["auth"], "Bearer k3y")
        self.assertEqual(seen["url"], "https://v3rm1.goatcounter.com/api/v0/stats/total?start=2026-09-14")

    def test_http_error_message(self):
        with mock.patch.object(ar.urllib.request, "urlopen", side_effect=http_error(403, {"error": "no permission"})):
            with self.assertRaises(ar.ReportError) as ctx:
                ar.Client("k", sleep=lambda s: None).get("/stats/total")
        self.assertIn("HTTP 403", str(ctx.exception))
        self.assertIn("no permission", str(ctx.exception))

    def test_retries_once_on_rate_limit(self):
        sleeps = []
        responses = [http_error(429, {"error": "slow down"}, {"X-Rate-Limit-Reset": "2"}), io.BytesIO(b"{}")]
        with mock.patch.object(ar.urllib.request, "urlopen", side_effect=responses):
            self.assertEqual(ar.Client("k", sleep=sleeps.append).get("/stats/total"), {})
        self.assertIn(2.0, sleeps)

    def test_network_error(self):
        with mock.patch.object(ar.urllib.request, "urlopen", side_effect=urllib.error.URLError("no route")):
            with self.assertRaisesRegex(ar.ReportError, "network error"):
                ar.Client("k", sleep=lambda s: None).get("/stats/total")


class MainTest(unittest.TestCase):
    def test_missing_key(self):
        err = subprocess.CalledProcessError(44, "security")
        with mock.patch.object(ar.subprocess, "run", side_effect=err):
            with self.assertRaisesRegex(ar.ReportError, "not found in Keychain"):
                ar.read_key()

    def test_failure_keeps_previous_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "report.json")
            Path(out).write_text('{"old": true}')
            with mock.patch.object(ar, "read_key", side_effect=ar.ReportError("API key not found")):
                with mock.patch("sys.stderr", new_callable=io.StringIO) as stderr:
                    self.assertEqual(ar.main(["--output", out]), 1)
            self.assertEqual(Path(out).read_text(), '{"old": true}')
            self.assertIn("analytics_report: API key not found", stderr.getvalue())

    def test_writes_json_and_creates_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "Dashboards", "report.json")
            with mock.patch.object(ar, "read_key", return_value="k"), mock.patch.object(ar.Client, "get", side_effect=lambda self_, p, **kw: fake_get(p, **kw), autospec=True):
                with mock.patch("sys.stdout", new_callable=io.StringIO):
                    self.assertEqual(ar.main(["--output", out]), 0)
            self.assertEqual(json.loads(Path(out).read_text())["site"], "v3rm1")
            self.assertEqual([f for f in os.listdir(os.path.dirname(out)) if f.endswith(".tmp")], [])


if __name__ == "__main__":
    unittest.main()

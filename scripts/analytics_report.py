#!/usr/bin/env python3
"""Pull GoatCounter stats for v3rm1.github.io into the Obsidian dashboard JSON.

Usage: analytics_report.py [--days N] [--output PATH]

The API key is read from the macOS Keychain (service goatcounter-api,
account v3rm1). Standard library only, so the system python3 runs it.
See docs/analytics.md.
"""
import argparse
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

SITE = "v3rm1"
API = "https://%s.goatcounter.com/api/v0" % SITE
KEYCHAIN_SERVICE = "goatcounter-api"
DEFAULT_OUTPUT = os.path.expanduser(
    "~/Documents/obsidian-files/obsidian-dashboard/Dashboards/portfolio-analytics.json"
)
TOP = 10
# The API allows 4 requests per second.
REQUEST_GAP = 0.26


class ReportError(Exception):
    """A failure reported as one line rather than a traceback."""


def read_key():
    try:
        out = subprocess.run(
            ["security", "find-generic-password", "-s", KEYCHAIN_SERVICE, "-a", SITE, "-w"],
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        raise ReportError(
            "API key not found in Keychain (service %s, account %s)" % (KEYCHAIN_SERVICE, SITE)
        )
    return out.stdout.strip()


def error_text(err):
    try:
        body = json.load(err)
    except Exception:
        return str(err.reason)
    return body.get("error") or json.dumps(body.get("errors", body))


class Client:
    """GET requests to the GoatCounter API under its rate limit."""

    def __init__(self, key, sleep=time.sleep):
        self.key = key
        self.sleep = sleep

    def get(self, path, **params):
        url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
        for attempt in (1, 2):
            self.sleep(REQUEST_GAP)
            req = urllib.request.Request(
                url,
                headers={"Authorization": "Bearer " + self.key, "Content-Type": "application/json"},
            )
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    return json.load(resp)
            except urllib.error.HTTPError as err:
                if err.code == 429 and attempt == 1:
                    self.sleep(float(err.headers.get("X-Rate-Limit-Reset") or 1))
                    continue
                raise ReportError("HTTP %d for %s: %s" % (err.code, path, error_text(err)))
            except urllib.error.URLError as err:
                raise ReportError("network error for %s: %s" % (path, err.reason))
            except ValueError:
                raise ReportError("invalid JSON from %s" % path)


def windows(today, days):
    """The current window ending today and the equally long one before it."""
    start = today - dt.timedelta(days=days - 1)
    prev_end = start - dt.timedelta(days=1)
    prev_start = prev_end - dt.timedelta(days=days - 1)
    return (start, today), (prev_start, prev_end)


def change_pct(now, before):
    if not before:
        return None
    return round(100.0 * (now - before) / before, 1)


def split_hits(hits):
    """Sorts paths into site pages, panes (/#…), blog posts and events."""
    groups = {"pages": [], "panes": [], "blog": [], "events": []}
    for h in hits:
        visits = h.get("count", 0)
        path = h["path"]
        if h.get("event"):
            groups["events"].append({"name": path, "visits": visits})
            continue
        row = {"path": path, "title": h.get("title") or "", "visits": visits}
        if path.startswith("/#"):
            groups["panes"].append(row)
        elif path.startswith("/blog/posts/"):
            groups["blog"].append(row)
        else:
            groups["pages"].append(row)
    for rows in groups.values():
        rows.sort(key=lambda r: -r["visits"])
    return groups


def daily_page_visits(days, hits):
    """Visits per day across page paths; events are left out."""
    per_day = dict.fromkeys(days, 0)
    for h in hits:
        if h.get("event"):
            continue
        for s in h.get("stats", []):
            if s["day"] in per_day:
                per_day[s["day"]] += s.get("daily", 0)
    return [{"day": d, "visits": v} for d, v in per_day.items()]


def page_visits(total):
    """GoatCounter's total counts events too; visits should not."""
    return total.get("total", 0) - total.get("total_events", 0)


def top(stats):
    return [{"name": s.get("name") or "(direct)", "count": s.get("count", 0)} for s in stats[:TOP]]


def build_report(get, today, days, now=None):
    (start, end), (prev_start, prev_end) = windows(today, days)
    span = {"start": start.isoformat(), "end": end.isoformat()}
    cur = get("/stats/total", **span)
    prev = get("/stats/total", start=prev_start.isoformat(), end=prev_end.isoformat())
    hits = get("/stats/hits", daily="true", limit=100, **span)
    groups = split_hits(hits.get("hits", []))
    by_path = {r["path"]: r["visits"] for r in groups["pages"]}

    report = {
        "generated_at": (now or dt.datetime.now(dt.timezone.utc)).isoformat(timespec="seconds"),
        "site": SITE,
        "window": dict(span, days=days),
        "previous": {"start": prev_start.isoformat(), "end": prev_end.isoformat()},
        "totals": {
            "visits": page_visits(cur),
            "events": cur.get("total_events", 0),
            "previous_visits": page_visits(prev),
            "previous_events": prev.get("total_events", 0),
            "change_pct": change_pct(page_visits(cur), page_visits(prev)),
        },
        "daily": daily_page_visits([s["day"] for s in cur.get("stats", [])], hits.get("hits", [])),
        "languages": {"en": by_path.get("/", 0), "de": by_path.get("/de/", 0)},
        # True when the API had more paths than the 100 fetched.
        "more_paths": bool(hits.get("more")),
    }
    report.update(groups)
    for page, key in (("toprefs", "referrers"), ("locations", "countries"), ("systems", "systems"), ("sizes", "sizes")):
        report[key] = top(get("/stats/" + page, limit=TOP, **span).get("stats", []))
    return report


def write_json(report, path):
    """Writes atomically, so a reader never sees a half-written file."""
    folder = os.path.dirname(os.path.abspath(path))
    os.makedirs(folder, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=folder, prefix=".portfolio-analytics.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(report, f, indent=2)
            f.write("\n")
        os.replace(tmp, path)
    except BaseException:
        os.unlink(tmp)
        raise


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--days", type=int, default=30, help="window length in days (default 30)")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="JSON file to write")
    args = parser.parse_args(argv)
    if args.days < 1:
        parser.error("--days must be at least 1")
    try:
        client = Client(read_key())
        report = build_report(client.get, dt.date.today(), args.days)
        write_json(report, args.output)
    except (ReportError, OSError) as err:
        print("analytics_report: %s" % err, file=sys.stderr)
        return 1
    print("analytics_report: wrote %s (%d visits)" % (args.output, report["totals"]["visits"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Browser tests for js/track.js: page views, pane views and click events.

Run from the repository root:
    uv run --with playwright python tests/test_track.py
First time only:
    uv run --with playwright python -m playwright install webkit
"""
import functools
import http.server
import threading
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
POST = "/blog/posts/2026-10-13-legg-hutter-to-arc/"

# Records every count() call instead of sending it.
STUB = "window.__gc = []; window.goatcounter = { count: function (v) { window.__gc.push(v); } };"
# Keeps link clicks on the page. Registered on window, so it runs after
# track.js's document-level listener has already seen the click.
NO_NAV = "window.addEventListener('click', function (e) { e.preventDefault(); });"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class TrackTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(QuietHandler, directory=str(ROOT))
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = "http://127.0.0.1:%d" % cls.server.server_port
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.webkit.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()

    def open(self, path, stub=True):
        ctx = self.browser.new_context(viewport={"width": 1280, "height": 900})
        self.addCleanup(ctx.close)
        page = ctx.new_page()
        self.errors = []
        page.on("pageerror", lambda e: self.errors.append(str(e)))
        page.route("https://gc.zgo.at/**", lambda route: route.abort())
        if stub:
            page.add_init_script(STUB)
        page.add_init_script(NO_NAV)
        page.goto(self.base + path)
        page.wait_for_load_state("load")
        page.wait_for_timeout(300)
        return page

    def views(self, page):
        return [c["path"] for c in page.evaluate("window.__gc") if not c.get("event")]

    def events(self, page):
        return [c["path"] for c in page.evaluate("window.__gc") if c.get("event")]

    def click(self, page, selector):
        page.click(selector)
        page.wait_for_timeout(150)

    def test_home_counts_once(self):
        page = self.open("/")
        self.assertEqual(self.views(page), ["/"])

    def test_pane_in_hash_on_load(self):
        page = self.open("/#projects")
        self.assertEqual(self.views(page), ["/#projects"])

    def test_static_anchor_normalised(self):
        page = self.open("/#skill-jax")
        self.assertEqual(self.views(page), ["/#skills/jax"])

    def test_pane_clicks(self):
        page = self.open("/")
        self.click(page, '.sidebar-item[data-cmd="projects"]')
        self.click(page, '.sidebar-item[data-cmd="projects"]')
        self.click(page, '.sidebar-item[data-cmd="skills"]')
        self.click(page, '.sidebar-item[data-cmd=""]')
        self.assertEqual(self.views(page), ["/", "/#projects", "/#skills", "/"])

    def test_cv_and_outbound_events(self):
        page = self.open("/")
        for selector in [
            '.hero a[href$="VarunRaviVarma_Industry_CV.pdf"]',
            '.hero a[href$="VRVarma_Academic_CV.pdf"]',
            '.hero a[href^="mailto:"]',
            '.hero a[href*="linkedin.com"]',
            '.hero a[href="https://github.com/v3rm1"]',
        ]:
            self.click(page, selector)
        self.assertEqual(
            self.events(page),
            ["cv-industry", "cv-academic", "out-email", "out-linkedin.com", "out-github.com"],
        )

    def test_german_page(self):
        page = self.open("/de/")
        self.assertEqual(self.views(page), ["/de/"])
        self.click(page, 'a[href$="VarunRaviVarma_Industry_CV.pdf"]')
        self.assertEqual(self.events(page), ["cv-industry-de"])

    def test_blog_post_and_rss(self):
        page = self.open(POST)
        self.assertEqual(self.views(page), [POST])
        self.click(page, '.navbar a[href$="index.xml"]')
        self.assertEqual(self.events(page), ["rss"])

    def test_blog_anchor_not_in_path(self):
        page = self.open(POST + "#fig-arc-pipeline")
        self.assertEqual(self.views(page), [POST])

    def test_works_without_goatcounter(self):
        page = self.open("/", stub=False)
        self.click(page, '.hero a[href$="VarunRaviVarma_Industry_CV.pdf"]')
        self.click(page, '.sidebar-item[data-cmd="projects"]')
        self.assertEqual(page.evaluate("typeof window.track.view"), "function")
        self.assertEqual(page.evaluate("document.getElementById('status-path').textContent"), "~/projects")
        self.assertEqual(self.errors, [])


if __name__ == "__main__":
    unittest.main()

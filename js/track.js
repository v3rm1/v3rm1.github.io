// GoatCounter page views and events for the site and the blog.
// Every call is a no-op while count.js is blocked or still loading, so
// tracking can never break a page.
(function () {
  const ENDPOINT = "https://v3rm1.goatcounter.com/count";
  const CV_FILES = {
    "VarunRaviVarma_Industry_CV.pdf": "cv-industry",
    "VRVarma_Academic_CV.pdf": "cv-academic",
  };
  const onGermanPage = location.pathname.startsWith("/de/");
  // With data-panes the page reports its own views (the main site's panes).
  const pageCountsViews = document.currentScript.hasAttribute("data-panes");
  const pending = [];
  let lastView = null;

  function ready() {
    return window.goatcounter && typeof window.goatcounter.count === "function";
  }

  function send(vars) {
    if (!ready()) {
      pending.push(vars);
      return;
    }
    try {
      window.goatcounter.count(vars);
    } catch (e) {}
  }

  function flush() {
    while (pending.length && ready()) send(pending.shift());
  }

  // Counts a page view; repeating the current path is ignored.
  function view(path) {
    if (path === lastView) return;
    lastView = path;
    send({ path: path });
  }

  function eventName(link) {
    let url;
    try {
      url = new URL(link.href, location.href);
    } catch (e) {
      return null;
    }
    const file = url.pathname.split("/").pop();
    if (CV_FILES[file]) return CV_FILES[file] + (onGermanPage ? "-de" : "");
    if (url.protocol === "mailto:") return "out-email";
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.host !== location.host) return "out-" + url.hostname.replace(/^www\./, "");
    if (file === "index.xml") return "rss";
    return null;
  }

  // Capture phase, so the click is seen even if a later handler stops it.
  document.addEventListener(
    "click",
    function (e) {
      const link = e.target.closest && e.target.closest("a[href]");
      if (!link) return;
      const name = eventName(link);
      if (name) {
        send({ path: name, title: link.textContent.trim().slice(0, 100), event: true });
      }
    },
    true
  );

  window.track = { view: view };

  if (!window.goatcounter) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = ENDPOINT;
    // Views are counted here instead, so pane paths keep their hash.
    s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    s.onload = flush;
    document.head.appendChild(s);
  }

  // Anchors within a page (#fig-1) are not separate pages.
  if (!pageCountsViews) view(location.pathname);
})();

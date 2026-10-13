# Analytics

The site and blog count visits with [GoatCounter](https://www.goatcounter.com) (site code
`v3rm1`, dashboard at https://v3rm1.goatcounter.com). It sets no cookies, so no consent
banner is needed.

## What is counted

- Page views: `/`, `/de/` and each blog post. Anchors such as `#fig-1` are ignored.
- Pane views on the main site: `/#projects`, `/#skills/jax`, `/#project/<name>`.
- Events: `cv-industry`, `cv-academic` (with `-de` from the German page), `out-email`,
  `out-<host>` for off-site links (e.g. `out-github.com`), `rss`.

All tracking lives in `js/track.js`. Visitors who block GoatCounter are not counted and
notice nothing.

## Not counting your own visits

Open https://v3rm1.github.io/#toggle-goatcounter once in each browser you use; an alert
confirms tracking is off. Open it again to turn tracking back on.

## Reaching GoatCounter from this Mac

AdGuard DNS blocks GoatCounter, so `/etc/hosts` pins it:

```
65.21.71.180 goatcounter.com www.goatcounter.com v3rm1.goatcounter.com
```

If the dashboard stops loading, check GoatCounter's current address
(`curl -s "https://dns.google/resolve?name=goatcounter.com&type=A"`) and update the line.

## Obsidian report

`scripts/analytics_report.py` reads the API key from the Keychain (service
`goatcounter-api`, account `v3rm1`) and writes
`~/Documents/obsidian-files/obsidian-dashboard/Dashboards/portfolio-analytics.json`. The
"Portfolio Analytics" card on `HOME.canvas` displays it.

Run it by hand: `python3 scripts/analytics_report.py` (options: `--days N`, `--output PATH`).

Replace the key: `security add-generic-password -U -s goatcounter-api -a v3rm1 -w '<key>'`.

### Refreshing

Run the script by hand whenever you want fresh numbers; the card warns when its data is
more than 48 hours old.

There is no scheduled job: macOS blocks background jobs from `~/Documents`, where both this
script and the vault live, unless the Python interpreter is given Full Disk Access.

## Tests

- `python3 -m unittest discover -s scripts/tests`
- `uv run --with playwright python tests/test_track.py` (first time:
  `uv run --with playwright python -m playwright install webkit`)

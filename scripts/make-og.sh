#!/bin/sh
# Render scripts/og-card.html to images/og-card.png (1200x630) with headless
# Chrome. Rerun after changing the profile in js/data.js. Override the browser
# with CHROME=/path/to/chrome.
set -e
cd "$(dirname "$0")/.."
for c in "$CHROME" \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" \
  "$(command -v chromium || true)" "$(command -v google-chrome || true)"; do
  if [ -n "$c" ] && [ -x "$c" ]; then CHROME="$c"; break; fi
done
[ -n "$CHROME" ] || { echo "No Chrome found; set CHROME=/path/to/chrome" >&2; exit 1; }
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --window-size=1200,630 --virtual-time-budget=4000 \
  --screenshot="$PWD/images/og-card.png" "file://$PWD/scripts/og-card.html" >/dev/null 2>&1
echo "images/og-card.png updated"

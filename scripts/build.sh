#!/bin/sh
# Render the Quarto blog, then regenerate the hero, static content and post list.
set -e
cd "$(dirname "$0")/.."
quarto render blog-src
node scripts/build-static.mjs

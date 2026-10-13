#!/bin/sh
# Render the Quarto blog, then regenerate the hero, static content and post list.
set -e
cd "$(dirname "$0")/.."
# blog/ is entirely generated. Quarto does not clean an output-dir outside its
# project, so clear it here or deleted posts would stay published.
rm -rf blog
quarto render blog-src
node scripts/build-static.mjs

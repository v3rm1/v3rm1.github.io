# Blog Quarto template: notes and pending tweaks

Findings from testing the blog (`blog-src/`, Quarto 1.10.19) at 390px phone width in
Chrome and WebKit (Safari's engine), October 2026.

## Already fixed

- **Wide tables and display maths** widened the whole page on phones. `catppuccin.scss` now
  scrolls `.math.display` sideways inside its own box, and tables below 768px.
- **Diagrams in the Legg-Hutter post** rendered at 22–47% scale on phones. Left-to-right
  flowcharts are now top-down and label wrapping is narrower; every diagram now renders at 82% or more.
- **An HTML `<sup>` in a Mermaid label** rendered on top of a neighbouring node in WebKit.
  The label now uses plain Unicode.

## Writing diagrams (rules for future posts)

1. Use `flowchart TD`. A left-to-right chain of four or more nodes is 1200–1500px wide
   and shrinks to unreadable text on a phone (and to about 50% on desktop).
2. Keep at most two side-by-side columns. For two subgraphs, narrow the wrapping:
   `%%{init: {"flowchart": {"wrappingWidth": 110, "nodeSpacing": 24, "padding": 8}}}%%`
   on the line after the `%%|` options.
3. No HTML tags in labels (`<sup>`, `<br>`, `<b>`). Mermaid puts labels in SVG
   `foreignObject`, which WebKit positions wrongly. Use Unicode: `2^(−K(μ))`, `Υ(π)`.
4. No LaTeX in labels; MathJax does not reach inside diagrams.
5. Check new diagrams at phone width before publishing. The aim is at least 80% scale at 390px.

## Template tweaks still to do

1. **Diagram colours do not match the theme.** `_quarto.yml` sets `mermaid: theme: dark`,
   which makes Quarto hand Mermaid its stock dark theme (grey boxes). Quarto already
   derives Catppuccin `--mermaid-*` variables from the SCSS theme, but ignores them while a
   Mermaid theme is set. Remove `mermaid: theme: dark` and, if needed, set `$mermaid-node-bg-color`,
   `$mermaid-edge-color` and the other `$mermaid-*` variables in `catppuccin.scss`.
2. **Diagram font.** Mermaid lays out labels in its own default font and Quarto then shows them in
   `--mermaid-font-family` (Lato). Different widths can make text overflow boxes. Fixing item 1
   lets one font apply to both; otherwise set `fontFamily` in the `%%{init}%%` block.
3. **Pre-render diagrams at build time.** Consider `mermaid-format: svg` under `format: html`
   (needs `quarto install chromium` once). Today diagrams render in the browser only after
   `window.load`, so slow assets leave raw Mermaid source on screen. Pre-rendering also drops
   the 2.7MB `mermaid.min.js` and makes diagrams work without JavaScript. Re-check rule 3 after
   switching, as labels are still `foreignObject`.
4. **Navbar title truncates on phones** ("Varun Ravi V…"). Shorten `website.title`
   (e.g. "v3rm1 / blog") or hide the title below 600px in `catppuccin.scss`.
5. **Output directory warning.** `output-dir: ../blog` sits outside the Quarto project, so
   Quarto warns and will not clean `site_libs`. `scripts/build.sh` works around this with
   `rm -rf blog`; always build through it, not a bare `quarto render`.

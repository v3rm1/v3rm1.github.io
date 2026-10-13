# Blog Quarto template: notes and tweaks

Findings from testing the blog (`blog-src/`, Quarto 1.10.19) at 390px phone width in
Chrome and WebKit (Safari's engine), October 2026.

## Already fixed

- **Wide tables and display maths** widened the whole page on phones. `tokyonight.scss` now
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

## Template tweaks (done October 2026)

The blog and main site now use Tokyo Night (Night). Comment grey is lifted from `#737aa2`
to `#7a82ab` so it reaches 4.5:1 contrast.

1. **Diagram colours.** `mermaid: theme: dark` is removed from `_quarto.yml`, so diagrams take
   the `$mermaid-*` variables set in `tokyonight.scss`. Mermaid's own stylesheet still paints
   edge labels light grey, so `tokyonight.scss` overrides `.edgeLabel` with `!important`.
2. **Diagram font.** `$mermaid-font-family` is Mermaid's measuring font
   (`"trebuchet ms", verdana, arial, sans-serif`), so labels are measured and shown in the same font.
3. **Build-time diagrams: rejected.** `mermaid-format: svg` measures label widths with this
   machine's fonts, so phones without those fonts would show text overflowing boxes. Diagrams
   stay rendered in the reader's browser; their raw source is hidden (`pre.mermaid-js`) until
   rendered, which removes the flash of Mermaid code.
4. **Navbar title.** Below 576px the navbar shows `v3rm1/blog` instead of the truncated full
   title. Page titles and metadata keep the full name.
5. **Output directory warning.** Not fixable without restructuring; build with `scripts/build.sh`.

Also added: a `theme-color` meta (`#16161e`) on the blog, main site and German page, so phone
browsers tint their bars to match.

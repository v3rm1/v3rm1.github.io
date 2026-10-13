// Renders the hero and the crawlable static content from js/data.js into
// index.html, between the GENERATED:hero and GENERATED:content markers.
// js/data.js stays the single source of truth; rerun after editing it:
//   node scripts/build-static.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = new Function(
  readFileSync(join(root, "js/data.js"), "utf8") + "\nreturn DATA;"
)();

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const link = (text, href) =>
  `<a class="ext-link" href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;

const list = (items) =>
  `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

// ── Hero ──────────────────────────────────────────────────────
function hero() {
  const p = DATA.profile;
  const c = DATA.contact;
  const nav = ["about", "projects", "cv", "skills", "publications", "contact"]
    .map((s) => `<a class="hero-nav" href="#${s}" data-cmd="${s}">${s}</a>`)
    .join("\n      ");
  return `
  <header class="hero" id="top">
    <h1 class="hero-name">${esc(p.name)}</h1>
    <p class="hero-headline">${esc(p.headline)}</p>
    <p class="hero-tagline">${esc(p.tagline)}</p>
    ${p.availability ? `<p class="hero-availability">● ${esc(p.availability)}</p>` : ""}
    <div class="hero-cta">
      <a class="cta cta-primary" href="${esc(p.cv)}" download>Download CV</a>
      <a class="cta" href="mailto:${esc(c.email)}">Email me</a>
      <a class="cta" href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
      <a class="cta" href="${esc(c.github)}" target="_blank" rel="noopener">GitHub</a>
    </div>
    <nav class="hero-navs" aria-label="Sections">
      ${nav}
    </nav>
  </header>
  `;
}

// ── Static content ────────────────────────────────────────────
function entry(title, sub, meta, details) {
  return `<article>
        <h4>${esc(title)}${sub ? ` <span class="color-comment">| ${esc(sub)}</span>` : ""}</h4>
        <p class="color-comment">${esc(meta)}</p>
        ${list(details)}
      </article>`;
}

function content() {
  const projects = Object.values(DATA.projects)
    .map(
      (p) => `<article>
        <h3>${esc(p.title)}</h3>
        <p class="color-orange">${esc(p.category)} project</p>
        <p class="pre">${esc(p.description)}</p>
        ${p.link ? `<p>${link("View on GitHub", p.link)}</p>` : ""}
      </article>`
    )
    .join("\n      ");

  const skillGroups = { ...DATA.skills.programming, ...DATA.skills.tools };
  const skills = Object.entries(skillGroups)
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v.join(" · "))}</dd>`)
    .join("");

  const pubs = DATA.publications
    .map(
      (p) => `<li>
        <strong>${esc(p.title)}</strong><br>
        <span class="color-orange">${esc(p.venue)}</span>
        ${p.doi ? ` — DOI: ${link(p.doi, "https://doi.org/" + p.doi)}` : ""}
        <p class="color-comment">${esc(p.description)}</p>
      </li>`
    )
    .join("\n      ");

  const c = DATA.contact;
  return `
  <div id="static-content">
    <section id="about">
      <h2>About</h2>
      <p class="pre">${esc(DATA.about)}</p>
    </section>
    <section id="projects">
      <h2>Projects</h2>
      ${projects}
    </section>
    <section id="cv">
      <h2>Curriculum Vitae</h2>
      <h3>Education</h3>
      ${DATA.education.map((e) => entry(e.institution, e.degree, `${e.period} | ${e.location}`, e.details)).join("\n      ")}
      <h3>Experience</h3>
      ${DATA.experience.map((e) => entry(e.company, e.role, `${e.period} | ${e.location}`, e.details)).join("\n      ")}
      <p>${link("Download CV (PDF)", DATA.profile.cv)}</p>
    </section>
    <section id="skills">
      <h2>Skills</h2>
      <dl>${skills}</dl>
      <h3>Core competencies</h3>
      ${list(DATA.skills.competencies)}
    </section>
    <section id="publications">
      <h2>Publications</h2>
      <ol>
      ${pubs}
      </ol>
    </section>
    <section id="contact">
      <h2>Contact</h2>
      <ul>
        <li>Email: <a class="ext-link" href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
        <li>GitHub: ${link(c.github, c.github)}</li>
        <li>LinkedIn: ${link(c.linkedin, c.linkedin)}</li>
        <li>ORCID: ${link(c.orcid, c.orcid)}</li>
        <li>Location: ${esc(c.location)}</li>
      </ul>
    </section>
  </div>
  `;
}

function inject(html, name, body) {
  const re = new RegExp(
    `(<!-- GENERATED:${name} START[^>]*-->)[\\s\\S]*?(<!-- GENERATED:${name} END -->)`
  );
  if (!re.test(html)) throw new Error(`Missing GENERATED:${name} markers in index.html`);
  return html.replace(re, (_, start, end) => `${start}${body}${end}`);
}

const indexPath = join(root, "index.html");
let html = readFileSync(indexPath, "utf8");
html = inject(html, "hero", hero());
html = inject(html, "content", content());
writeFileSync(indexPath, html);
console.log("index.html updated");

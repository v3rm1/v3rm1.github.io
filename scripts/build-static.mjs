// Generates everything derived from js/data.js (the single source of truth):
//   - index.html: hero, crawlable static content and JSON-LD, between the
//     GENERATED:* markers
//   - de/index.html: German landing page
//   - js/generated.js: blog posts (from blog-src/posts), skill evidence and
//     timeline, read by the terminal
// Rerun after editing js/data.js or rendering the blog:
//   node scripts/build-static.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = new Function(
  readFileSync(join(root, "js/data.js"), "utf8") + "\nreturn DATA;"
)();

// Published posts, newest first, read from each post's front matter.
function readPosts() {
  const dir = join(root, "blog-src/posts");
  if (!existsSync(dir)) return [];
  const posts = [];
  for (const slug of readdirSync(dir)) {
    const file = join(dir, slug, "index.qmd");
    if (!existsSync(file)) continue;
    const front = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
    if (!front) continue;
    const meta = {};
    for (const line of front[1].split("\n")) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    if (meta.draft === "true") continue;
    posts.push({
      title: meta.title,
      date: meta.date,
      description: meta.description || "",
      url: `blog/posts/${slug}/`,
    });
  }
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

const POSTS = readPosts();

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9+#]+/g, "-").replace(/^-|-$/g, "");

// ── Skill evidence ────────────────────────────────────────────
// Every skill, in group order, with the projects, roles, degrees and papers
// whose `stack` names it.
function buildSkills() {
  const skills = [];
  const bySkill = {};
  for (const [group, names] of Object.entries(DATA.skills.groups)) {
    for (const name of names) {
      const s = { group, name, slug: slugify(name), evidence: [] };
      skills.push(s);
      bySkill[name] = s;
    }
  }
  const sources = [
    ...Object.entries(DATA.projects).map(([key, p]) => [p.stack, `Project: ${p.title}`, `project ${key}`]),
    ...DATA.experience.map((e) => [e.stack, `${e.role} @ ${e.company}`, "cv"]),
    ...DATA.education.map((e) => [e.stack, `${e.degree}, ${e.institution}`, "cv"]),
    ...DATA.publications.map((p) => [p.stack, `Paper: ${p.title} (${p.year})`, "publications"]),
  ];
  for (const [stack, label, cmd] of sources) {
    for (const name of stack || []) {
      if (!bySkill[name]) {
        console.warn(`warning: "${name}" (in ${label}) is not in skills.groups`);
        continue;
      }
      bySkill[name].evidence.push({ label, cmd });
    }
  }
  return skills;
}

const SKILLS = buildSkills();
const skillSlug = Object.fromEntries(SKILLS.map((s) => [s.name, s.slug]));

// ── Timeline ──────────────────────────────────────────────────
// Education and roles, newest first; an entry without a start date is ongoing.
const TIMELINE = [
  ...DATA.education.map((e) => ({ when: e.period, start: e.start, title: e.degree, org: e.institution, kind: "education" })),
  ...DATA.experience.map((e) => ({ when: e.period, start: e.start, title: e.role, org: e.company, kind: "work" })),
].sort((a, b) => (b.start || "9999").localeCompare(a.start || "9999"));

const TIMELINE_SUMMARY =
  "Mechanical engineering → data & analytics consulting → health data science → AI research";

const TEACHING = DATA.experience
  .filter((e) => e.teaching)
  .map((e) => ({ org: e.company, role: e.role, when: e.period, courses: e.details }));

// ── HTML helpers ──────────────────────────────────────────────
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

const tags = (stack) =>
  `<p class="tags">${(stack || [])
    .map((n) => `<a class="tag" href="#skill-${skillSlug[n]}">${esc(n)}</a>`)
    .join(" ")}</p>`;

function groupBy(items, key) {
  const out = {};
  for (const i of items) (out[i[key]] ||= []).push(i);
  return out;
}

// ── Hero ──────────────────────────────────────────────────────
function hero() {
  const p = DATA.profile;
  const c = DATA.contact;
  const nav = ["about", "skills", "projects", "timeline", "cv", "publications", "contact"]
    .map((s) => `<a class="hero-nav" href="#${s}" data-cmd="${s}">${s}</a>`)
    .concat('<a class="hero-nav" href="blog/">blog</a>')
    .concat('<a class="hero-nav" href="de/" hreflang="de" lang="de">deutsch</a>')
    .join("\n      ");
  const top = p.topSkills
    .map((n) => `<a class="tag" href="#skill-${skillSlug[n]}" data-cmd="skills ${skillSlug[n]}">${esc(n)}</a>`)
    .join(" ");
  return `
  <header class="hero" id="top">
    <h1 class="hero-name">${esc(p.name)}</h1>
    <p class="hero-headline">${esc(p.headline)}</p>
    <p class="hero-tagline">${esc(p.tagline)}</p>
    ${p.availability ? `<p class="hero-availability">● ${esc(p.availability)}</p>` : ""}
    <p class="tags hero-skills">${top}</p>
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
function entry(title, sub, meta, details, stack) {
  return `<article>
        <h4>${esc(title)}${sub ? ` <span class="color-comment">| ${esc(sub)}</span>` : ""}</h4>
        <p class="color-comment">${esc(meta)}</p>
        ${list(details)}
        ${tags(stack)}
      </article>`;
}

function skillsSection() {
  const groups = Object.entries(groupBy(SKILLS, "group"))
    .map(
      ([group, skills]) => `<h3>${esc(group)}</h3>
      <dl class="skill-matrix">${skills
        .map(
          (s) => `
        <dt id="skill-${s.slug}">${esc(s.name)}</dt>
        <dd>${s.evidence.length ? `<span class="color-comment">Used in:</span> ${esc(s.evidence.map((e) => e.label).join(" · "))}` : ""}</dd>`
        )
        .join("")}
      </dl>`
    )
    .join("\n      ");
  return `<section id="skills">
      <h2>Skills</h2>
      ${groups}
      <h3>Also used</h3>
      <p>${esc(DATA.skills.alsoUsed.join(" · "))}</p>
      <h3>Languages</h3>
      ${list(DATA.skills.languages)}
    </section>`;
}

function projectsSection() {
  const byCat = groupBy(
    Object.entries(DATA.projects).map(([key, p]) => ({ key, ...p })),
    "category"
  );
  const cats = DATA.projectCategories
    .filter((c) => byCat[c])
    .map(
      (c) => `<h3>${esc(c)}</h3>
      ${byCat[c]
        .map(
          (p) => `<article>
        <h4>${esc(p.title)}</h4>
        ${p.status ? `<p class="color-orange">${esc(p.status)}</p>` : ""}
        <p class="pre">${esc(p.description)}</p>
        ${p.link ? `<p>${link("View on GitHub", p.link)}</p>` : ""}
        ${tags(p.stack)}
      </article>`
        )
        .join("\n      ")}`
    )
    .join("\n      ");
  return `<section id="projects">
      <h2>Projects</h2>
      ${cats}
    </section>`;
}

function timelineSection() {
  return `<section id="timeline">
      <h2>Timeline</h2>
      <p class="color-comment">${esc(TIMELINE_SUMMARY)}</p>
      <ul class="timeline">${TIMELINE.map(
        (t) => `
        <li><span class="color-comment">${esc(t.when)}</span> — <strong>${esc(t.title)}</strong>, ${esc(t.org)}</li>`
      ).join("")}
      </ul>
    </section>`;
}

function content() {
  const pubs = DATA.publications
    .map(
      (p) => `<li>
        <strong>${esc(p.title)}</strong><br>
        <span class="color-orange">${esc(p.venue)}, ${esc(p.year)}</span>
        ${p.doi ? ` — DOI: ${link(p.doi, "https://doi.org/" + p.doi)}` : ""}
        <p class="color-comment">${esc(p.description)}</p>
        ${tags(p.stack)}
      </li>`
    )
    .join("\n      ");

  const teaching = TEACHING.map(
    (t) => `<article>
        <h4>${esc(t.org)} <span class="color-comment">| ${esc(t.role)}</span></h4>
        <p class="color-comment">${esc(t.when)}</p>
        ${list(t.courses)}
      </article>`
  ).join("\n      ");

  const posts = POSTS.length
    ? `<ul>${POSTS.map((p) => `<li><a class="ext-link" href="${esc(p.url)}">${esc(p.title)}</a> <span class="color-comment">${esc(p.date)}</span></li>`).join("")}</ul>`
    : "";

  const c = DATA.contact;
  return `
  <div id="static-content">
    <section id="about">
      <h2>About</h2>
      <p class="pre">${esc(DATA.about)}</p>
    </section>
    ${skillsSection()}
    ${projectsSection()}
    ${timelineSection()}
    <section id="cv">
      <h2>Curriculum Vitae</h2>
      <h3>Experience</h3>
      ${DATA.experience.map((e) => entry(e.company, e.role, `${e.period} | ${e.location}`, e.details, e.stack)).join("\n      ")}
      <h3>Education</h3>
      ${DATA.education.map((e) => entry(e.institution, e.degree, `${e.period} | ${e.location}`, e.details, e.stack)).join("\n      ")}
      <p>${link("Download CV (PDF)", DATA.profile.cv)}</p>
    </section>
    <section id="teaching">
      <h2>Teaching</h2>
      ${teaching}
    </section>
    <section id="publications">
      <h2>Publications</h2>
      <ol>
      ${pubs}
      </ol>
    </section>
    <section id="blog">
      <h2>Blog</h2>
      ${posts}
      <p><a class="ext-link" href="blog/">All posts</a> · <a class="ext-link" href="blog/index.xml">RSS</a></p>
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

// ── Structured data (schema.org Person) ───────────────────────
function jsonld() {
  const p = DATA.profile;
  const c = DATA.contact;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    url: p.url,
    jobTitle: "AI Research Scientist",
    description: p.tagline,
    email: `mailto:${c.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Grimstad", addressCountry: "NO" },
    affiliation: { "@type": "CollegeOrUniversity", name: "University of Agder" },
    alumniOf: DATA.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: [...SKILLS.map((s) => s.name), ...DATA.skills.alsoUsed],
    knowsLanguage: ["en", "de"],
    sameAs: [c.github, c.linkedin, c.orcid],
  };
  // Escape "<" so the JSON can never close the script element early.
  const json = JSON.stringify(person, null, 2).replace(/</g, "\\u003c");
  return `\n  <script type="application/ld+json">\n${json}\n  </script>\n  `;
}

// ── German landing page ───────────────────────────────────────
function germanPage() {
  const p = DATA.profile;
  const de = DATA.de;
  const c = DATA.contact;
  const groups = Object.entries(groupBy(SKILLS, "group"))
    .map(([g, skills]) => `<dt>${esc(de.groups[g] || g)}</dt><dd>${esc(skills.map((s) => s.name).join(" · "))}</dd>`)
    .join("\n        ");
  const timeline = TIMELINE.map(
    (t) => `<li><span class="color-comment">${esc(t.when)}</span> — <strong>${esc(t.title)}</strong>, ${esc(t.org)}</li>`
  ).join("\n        ");
  const pubs = DATA.publications
    .map((x) => `<li><strong>${esc(x.title)}</strong><br><span class="color-orange">${esc(x.venue)}, ${esc(x.year)}</span>${x.doi ? ` — ${link(x.doi, "https://doi.org/" + x.doi)}` : ""}</li>`)
    .join("\n        ");
  return `<!DOCTYPE html>
<!-- Generated by scripts/build-static.mjs from js/data.js. Do not edit. -->
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.name)} — KI-Forscher (Reinforcement Learning &amp; Multi-Agenten-Systeme)</title>
  <meta name="description" content="${esc(de.tagline)}">
  <link rel="canonical" href="${p.url}de/">
  <link rel="alternate" hreflang="en" href="${p.url}">
  <link rel="alternate" hreflang="de" href="${p.url}de/">
  <link rel="alternate" hreflang="x-default" href="${p.url}">
  <link rel="icon" type="image/svg+xml" href="../images/favicon.svg">
  <meta property="og:title" content="${esc(p.name)} — KI-Forscher">
  <meta property="og:description" content="${esc(de.tagline)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${p.url}de/">
  <meta property="og:locale" content="de_DE">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/terminal.css">
</head>
<body>
  <div class="tui-frame">
    <div class="tui-top-border" aria-hidden="true">
      <span class="border-title">┌─ v3rm1@portfolio:~/de </span>
      <span class="border-fill">────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────</span>
      <span class="border-right">┐</span>
    </div>
    <div class="tui-middle">
      <main class="tui-main tui-main-full">
        <header class="hero">
          <h1 class="hero-name">${esc(p.name)}</h1>
          <p class="hero-headline">${esc(de.headline)}</p>
          <p class="hero-tagline">${esc(de.tagline)}</p>
          <p class="hero-availability">● ${esc(de.availability)}</p>
          <div class="hero-cta">
            <a class="cta cta-primary" href="../${esc(p.cv)}" download>Lebenslauf (PDF, Englisch)</a>
            <a class="cta" href="mailto:${esc(c.email)}">E-Mail</a>
            <a class="cta" href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
            <a class="cta" href="${esc(c.github)}" target="_blank" rel="noopener">GitHub</a>
          </div>
          <nav class="hero-navs" aria-label="Abschnitte">
            <a class="hero-nav" href="#profil">profil</a>
            <a class="hero-nav" href="#kompetenzen">kompetenzen</a>
            <a class="hero-nav" href="#werdegang">werdegang</a>
            <a class="hero-nav" href="#publikationen">publikationen</a>
            <a class="hero-nav" href="#kontakt">kontakt</a>
            <a class="hero-nav" href="../" hreflang="en" lang="en">english (full site)</a>
          </nav>
        </header>
        <div id="static-content">
          <section id="profil">
            <h2>Profil</h2>
            <p class="pre">${esc(de.about)}</p>
          </section>
          <section id="kompetenzen">
            <h2>Kompetenzen</h2>
            <dl>
        ${groups}
            </dl>
            <p class="color-comment">Nachweise zu jeder Kompetenz (Projekte, Stellen, Publikationen) auf der <a class="ext-link" href="../#skills">englischen Seite</a>.</p>
          </section>
          <section id="werdegang">
            <h2>Werdegang</h2>
            <ul class="timeline">
        ${timeline}
            </ul>
          </section>
          <section id="publikationen">
            <h2>Publikationen</h2>
            <ol>
        ${pubs}
            </ol>
          </section>
          <section id="kontakt">
            <h2>Kontakt</h2>
            <ul>
              <li>E-Mail: <a class="ext-link" href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
              <li>LinkedIn: ${link(c.linkedin, c.linkedin)}</li>
              <li>GitHub: ${link(c.github, c.github)}</li>
              <li>Standort: ${esc(c.location)}</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
    <div class="tui-bottom-border tui-border-row" aria-hidden="true">
      <span class="border-left">└</span>
      <span class="border-fill">────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────</span>
      <span class="border-right">┘</span>
    </div>
  </div>
</body>
</html>
`;
}

// ── Write outputs ─────────────────────────────────────────────
function inject(html, name, body) {
  const re = new RegExp(
    `(<!-- GENERATED:${name} START[^>]*-->)[\\s\\S]*?(<!-- GENERATED:${name} END -->)`
  );
  if (!re.test(html)) throw new Error(`Missing GENERATED:${name} markers in index.html`);
  return html.replace(re, (_, start, end) => `${start}${body}${end}`);
}

const indexPath = join(root, "index.html");
let html = readFileSync(indexPath, "utf8");
html = inject(html, "jsonld", jsonld());
html = inject(html, "hero", hero());
html = inject(html, "content", content());
writeFileSync(indexPath, html);

mkdirSync(join(root, "de"), { recursive: true });
writeFileSync(join(root, "de/index.html"), germanPage());

const generated = { POSTS, SKILLS, TIMELINE, TIMELINE_SUMMARY, TEACHING };
writeFileSync(
  join(root, "js/generated.js"),
  "// Generated by scripts/build-static.mjs from js/data.js and blog-src/posts. Do not edit.\n" +
    Object.entries(generated)
      .map(([k, v]) => `const ${k} = ${JSON.stringify(v, null, 2)};\n`)
      .join("")
);
console.log("index.html, de/index.html and js/generated.js updated");

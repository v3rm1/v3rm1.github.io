# TUI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the terminal portfolio to look like a full ncurses-style TUI app with sidebar, main panel, and status bar using Catppuccin Mocha colors and box-drawing characters.

**Architecture:** Three-region layout — fixed sidebar (commands list), scrollable main panel (terminal I/O), and bottom status bar (keybinds left, session info right). All drawn with single-line Unicode box-drawing characters (`┌─┐│└─┘`). CSS Grid for layout, no new dependencies.

**Tech Stack:** Vanilla HTML/CSS/JS, Fira Code font, Catppuccin Mocha palette.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `css/terminal.css` | Rewrite | Full TUI layout: grid, box-drawing borders, Catppuccin Mocha palette, sidebar, status bar, responsive collapse |
| `index.html` | Rewrite | Three-region structure: sidebar, main panel, status bar. Remove macOS chrome. |
| `js/terminal.js` | Modify | Sidebar click handling, active command highlighting, remove pill-bar logic |
| `js/data.js` | No change | — |

---

### Task 1: Rewrite `index.html` with TUI structure

**Files:**
- Rewrite: `index.html`

- [ ] **Step 1: Replace HTML with three-region TUI layout**

Replace the entire `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>v3rm1 — Varun Ravi Varma</title>
  <meta name="description" content="AI Research Scientist & Software Engineer — Terminal Portfolio">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/terminal.css">
</head>
<body>
  <div class="tui-frame">
    <!-- Top border with title -->
    <div class="tui-top-border">
      <span class="border-left">┌─ Commands ──┬</span>
      <span class="border-title">─ v3rm1@portfolio:~ </span>
      <span class="border-fill">─</span>
      <span class="border-right">┐</span>
    </div>

    <!-- Middle: sidebar + main -->
    <div class="tui-middle">
      <!-- Sidebar -->
      <div class="tui-sidebar" id="sidebar">
        <div class="sidebar-item" data-cmd="help"> help</div>
        <div class="sidebar-item" data-cmd="about"> about</div>
        <div class="sidebar-item" data-cmd="projects"> projects</div>
        <div class="sidebar-item" data-cmd="cv"> cv</div>
        <div class="sidebar-item" data-cmd="skills"> skills</div>
        <div class="sidebar-item" data-cmd="publications"> publications</div>
        <div class="sidebar-item" data-cmd="contact"> contact</div>
        <div class="sidebar-item" data-cmd="clear"> clear</div>
      </div>

      <!-- Vertical divider -->
      <div class="tui-divider">│</div>

      <!-- Main terminal panel -->
      <div class="tui-main" id="terminal-body">
        <div id="output"></div>
        <div class="input-line" id="input-line">
          <span class="prompt">v3rm1@portfolio:~$&nbsp;</span>
          <input type="text" id="command-input" autocomplete="off" autocapitalize="off" spellcheck="false" autofocus>
        </div>
      </div>
    </div>

    <!-- Separator between middle and status bar -->
    <div class="tui-mid-border">
      <span class="border-left">├──────────────┴</span>
      <span class="border-fill">─</span>
      <span class="border-right">┤</span>
    </div>

    <!-- Status bar -->
    <div class="tui-statusbar">
      <span class="status-left" id="status-keys">
        [F1]Help [F2]About [F3]Projects [F4]CV [F5]Skills
      </span>
      <span class="status-right">
        v3rm1 │ Grimstad, NO
      </span>
    </div>

    <!-- Bottom border -->
    <div class="tui-bottom-border">
      <span class="border-left">└</span>
      <span class="border-fill">─</span>
      <span class="border-right">┘</span>
    </div>
  </div>

  <script src="js/data.js"></script>
  <script src="js/terminal.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify file saved correctly**

Open `index.html` in browser — it will look broken until CSS is applied in Task 2.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: restructure HTML for TUI three-region layout"
```

---

### Task 2: Rewrite `css/terminal.css` with TUI styling

**Files:**
- Rewrite: `css/terminal.css`

- [ ] **Step 1: Replace CSS with full TUI layout and Catppuccin Mocha palette**

Replace the entire `css/terminal.css` with:

```css
/* Catppuccin Mocha palette */
:root {
  --base: #1e1e2e;
  --mantle: #181825;
  --surface0: #313244;
  --surface1: #45475a;
  --overlay0: #6c7086;
  --text: #cdd6f4;
  --subtext0: #a6adc8;
  --green: #a6e3a1;
  --mauve: #cba6f7;
  --blue: #89b4fa;
  --peach: #fab387;
  --red: #f38ba8;
  --teal: #94e2d5;
  --pink: #f5c2e7;
  --yellow: #f9e2af;
  --lavender: #b4befe;

  --sidebar-width: 16ch;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background: var(--mantle);
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace;
  color: var(--text);
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
}

/* ── TUI Frame ─────────────────────────────────────── */
.tui-frame {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--base);
}

/* ── Top border ────────────────────────────────────── */
.tui-top-border {
  display: flex;
  color: var(--overlay0);
  line-height: 1;
  padding: 0;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
}

.tui-top-border .border-left {
  flex-shrink: 0;
}

.tui-top-border .border-title {
  flex-shrink: 0;
  color: var(--blue);
}

.tui-top-border .border-fill {
  flex: 1;
  overflow: hidden;
  color: var(--overlay0);
}

.tui-top-border .border-right {
  flex-shrink: 0;
}

/* ── Middle section (sidebar + divider + main) ───── */
.tui-middle {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ── Sidebar ───────────────────────────────────────── */
.tui-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--base);
  padding: 4px 0;
  overflow-y: auto;
  border-left: 1ch solid transparent;
  position: relative;
}

.tui-sidebar::before {
  content: '│';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  color: var(--overlay0);
  line-height: 1.5;
  /* Repeat the border character visually via a pseudo-element column */
  writing-mode: vertical-lr;
  letter-spacing: 0;
  overflow: hidden;
  width: 1ch;
}

/* Simpler approach: use actual left border character per line */
.tui-sidebar {
  padding-left: 0;
}

.sidebar-item {
  padding: 1px 8px 1px 0;
  color: var(--teal);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;
  position: relative;
}

.sidebar-item::before {
  content: '│';
  color: var(--overlay0);
  margin-right: 4px;
}

.sidebar-item:hover {
  background: var(--surface0);
  color: var(--text);
}

.sidebar-item.active {
  background: var(--surface0);
  color: var(--mauve);
  font-weight: 700;
}

.sidebar-item.active::after {
  content: ' ◂';
  color: var(--mauve);
}

/* ── Vertical divider ─────────────────────────────── */
.tui-divider {
  color: var(--overlay0);
  line-height: 1.5;
  user-select: none;
  -webkit-user-select: none;
  white-space: pre;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Fill divider with │ characters */
.tui-divider::before {
  content: '│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A│\A';
  white-space: pre;
}

/* ── Main terminal panel ──────────────────────────── */
.tui-main {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px;
  min-width: 0;
  scroll-behavior: smooth;
}

.tui-main::-webkit-scrollbar {
  width: 8px;
}

.tui-main::-webkit-scrollbar-track {
  background: var(--base);
}

.tui-main::-webkit-scrollbar-thumb {
  background: var(--surface1);
  border-radius: 4px;
}

/* Right border on main panel */
.tui-main {
  border-right: none;
  position: relative;
}

.tui-middle::after {
  content: '';
  display: flex;
  flex-direction: column;
  color: var(--overlay0);
  white-space: pre;
  user-select: none;
  -webkit-user-select: none;
}

/* ── Mid border (separator) ───────────────────────── */
.tui-mid-border {
  display: flex;
  color: var(--overlay0);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
}

.tui-mid-border .border-left {
  flex-shrink: 0;
}

.tui-mid-border .border-fill {
  flex: 1;
  overflow: hidden;
}

.tui-mid-border .border-right {
  flex-shrink: 0;
}

/* ── Status bar ───────────────────────────────────── */
.tui-statusbar {
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
  color: var(--subtext0);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.status-left {
  color: var(--teal);
}

.status-left .key {
  color: var(--mauve);
}

.status-left .label {
  color: var(--subtext0);
}

.status-right {
  color: var(--overlay0);
}

/* ── Bottom border ────────────────────────────────── */
.tui-bottom-border {
  display: flex;
  color: var(--overlay0);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
}

.tui-bottom-border .border-left {
  flex-shrink: 0;
}

.tui-bottom-border .border-fill {
  flex: 1;
  overflow: hidden;
}

.tui-bottom-border .border-right {
  flex-shrink: 0;
}

/* ── Output ───────────────────────────────────────── */
#output {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.output-line {
  margin-bottom: 1px;
}

.output-block {
  margin-bottom: 10px;
}

/* ── Prompt and input ─────────────────────────────── */
.input-line {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.prompt {
  color: var(--green);
  white-space: nowrap;
  font-weight: 700;
}

#command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  caret-color: var(--green);
}

/* ── Color utility classes ────────────────────────── */
.color-green { color: var(--green); }
.color-purple { color: var(--mauve); }
.color-cyan { color: var(--teal); }
.color-orange { color: var(--peach); }
.color-red { color: var(--red); }
.color-comment { color: var(--overlay0); }
.color-pink { color: var(--pink); }
.color-fg { color: var(--text); }
.color-blue { color: var(--blue); }
.bold { font-weight: 700; }

/* ── Clickable inline commands ────────────────────── */
.clickable {
  color: var(--teal);
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed var(--teal);
  transition: color 0.15s;
}

.clickable:hover {
  color: var(--text);
}

/* ── External links ───────────────────────────────── */
a.ext-link {
  color: var(--blue);
  text-decoration: none;
  border-bottom: 1px solid var(--blue);
  transition: color 0.15s;
}

a.ext-link:hover {
  color: var(--text);
}

/* ── Separator ────────────────────────────────────── */
.separator {
  color: var(--overlay0);
  margin: 6px 0;
}

/* ── Boot text ────────────────────────────────────── */
.boot-tag {
  color: var(--overlay0);
}

.boot-ok {
  color: var(--green);
  font-weight: 700;
}

/* ── History prompt echo ──────────────────────────── */
.history-prompt {
  color: var(--green);
  font-weight: 700;
}

.history-cmd {
  color: var(--text);
}

/* ── Help table ───────────────────────────────────── */
.help-table {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 16px;
}

.help-cmd {
  color: var(--teal);
}

.help-desc {
  color: var(--overlay0);
}

/* ── Hidden input line (during boot) ──────────────── */
.input-line.hidden {
  display: none;
}

/* ── Responsive: narrow screens ───────────────────── */
@media (max-width: 600px) {
  :root {
    --sidebar-width: 0px;
  }

  .tui-sidebar {
    display: none;
  }

  .tui-divider {
    display: none;
  }

  .tui-top-border .border-left {
    display: none;
  }

  .tui-top-border .border-title::before {
    content: '┌─';
  }

  .tui-mid-border .border-left {
    content: '├';
  }

  .tui-mid-border .border-left {
    font-size: 0;
  }

  .tui-mid-border .border-left::before {
    content: '├';
    font-size: 14px;
  }

  body {
    font-size: 12px;
  }

  .tui-statusbar {
    font-size: 11px;
  }

  .tui-frame {
    border-radius: 0;
  }
}
```

- [ ] **Step 2: Open in browser, verify layout**

Check: sidebar on left, main panel on right, status bar at bottom, box-drawing borders visible.

- [ ] **Step 3: Commit**

```bash
git add css/terminal.css
git commit -m "feat: TUI layout with Catppuccin Mocha palette and box-drawing borders"
```

---

### Task 3: Update `js/terminal.js` for sidebar interaction and status bar

**Files:**
- Modify: `js/terminal.js`

- [ ] **Step 1: Update terminal.js**

Replace the entire file. Key changes from the original:
- Remove `commandBar` references (pill buttons gone)
- Add sidebar click handling
- Add active-command highlighting in sidebar
- Add F-key keyboard shortcuts
- Generate status bar keybind hints dynamically

```javascript
(function () {
  const output = document.getElementById("output");
  const input = document.getElementById("command-input");
  const inputLine = document.getElementById("input-line");
  const terminalBody = document.getElementById("terminal-body");
  const sidebar = document.getElementById("sidebar");

  const history = [];
  let historyIndex = -1;

  // ── F-key mappings ────────────────────────────────────────────
  const fKeyMap = {
    F1: "help",
    F2: "about",
    F3: "projects",
    F4: "cv",
    F5: "skills",
    F6: "publications",
    F7: "contact",
  };

  // ── Boot sequence ──────────────────────────────────────────────
  const bootLines = [
    { text: "[BIOS] v3rm1 systems v1.0", delay: 100 },
    { text: "[BOOT] Loading kernel............. OK", delay: 200 },
    { text: "[INIT] Mounting filesystem......... OK", delay: 200 },
    { text: "[INIT] Starting network........... OK", delay: 200 },
    { text: "[AUTH] User authenticated: guest", delay: 150 },
    { text: "[SYS]  Loading profile: Varun Ravi Varma", delay: 150 },
    { text: "[SYS]  Session started.", delay: 200 },
    { text: "", delay: 100 },
    { text: "Welcome to v3rm1's portfolio terminal.", delay: 100, cls: "color-green bold" },
    { text: "Type 'help' or select a command from the sidebar.", delay: 100, cls: "color-comment" },
    { text: "", delay: 50 }
  ];

  function colorBootLine(text) {
    return text
      .replace(/^(\[[A-Z]+\])/, '<span class="color-comment">$1</span>')
      .replace(/(OK)$/, '<span class="color-green bold">$1</span>');
  }

  async function boot() {
    inputLine.classList.add("hidden");
    for (const line of bootLines) {
      await delay(line.delay);
      const div = document.createElement("div");
      div.className = "output-line";
      if (line.cls) {
        div.className += " " + line.cls;
        div.textContent = line.text;
      } else {
        div.innerHTML = colorBootLine(line.text);
      }
      output.appendChild(div);
      scrollToBottom();
    }
    await delay(200);
    inputLine.classList.remove("hidden");
    input.focus();
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ── Scroll helper ──────────────────────────────────────────────
  function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // ── Output helpers ─────────────────────────────────────────────
  function appendLine(html, cls) {
    const div = document.createElement("div");
    div.className = "output-line" + (cls ? " " + cls : "");
    div.innerHTML = html;
    output.appendChild(div);
  }

  function appendBlock(html) {
    const div = document.createElement("div");
    div.className = "output-block";
    div.innerHTML = html;
    output.appendChild(div);
  }

  function appendSeparator() {
    appendLine("────────────────────────────────────────────", "separator");
  }

  function makeClickable(text, cmd) {
    return `<span class="clickable" data-cmd="${cmd}">[${text}]</span>`;
  }

  function makeExtLink(text, url) {
    return `<a class="ext-link" href="${url}" target="_blank" rel="noopener">${text}</a>`;
  }

  // ── Sidebar highlight ─────────────────────────────────────────
  function setActiveSidebar(cmd) {
    sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.cmd === cmd);
    });
  }

  // ── Commands ───────────────────────────────────────────────────
  const commands = {};

  commands.help = function () {
    const rows = [
      ["help", "Show available commands"],
      ["about", "About me"],
      ["projects", "List all projects"],
      ["project &lt;name&gt;", "View a specific project"],
      ["cv", "View my CV"],
      ["skills", "View my skills & tools"],
      ["publications", "View my publications"],
      ["contact", "Contact info & social links"],
      ["clear", "Clear the terminal"]
    ];
    let html = '<div class="help-table">';
    for (const [cmd, desc] of rows) {
      html += `<span class="help-cmd">${cmd}</span><span class="help-desc">${desc}</span>`;
    }
    html += "</div>";
    appendBlock(html);
  };

  commands.about = function () {
    appendLine('<span class="color-purple bold">About Me</span>');
    appendSeparator();
    appendBlock(escapeHtml(DATA.about));
    appendLine(
      makeClickable("cv", "cv") +
        "  " +
        makeClickable("projects", "projects") +
        "  " +
        makeClickable("skills", "skills"),
      "color-comment"
    );
  };

  commands.projects = function () {
    appendLine('<span class="color-purple bold">Projects</span>');
    appendSeparator();

    const research = [];
    const personal = [];
    for (const [key, p] of Object.entries(DATA.projects)) {
      if (p.category === "Research") research.push([key, p]);
      else personal.push([key, p]);
    }

    appendLine('<span class="color-orange bold">Research</span>');
    for (const [key, p] of research) {
      appendLine(
        `  <span class="clickable" data-cmd="project ${key}">${key}</span>  <span class="color-comment">— ${p.title}</span>`
      );
    }

    appendLine("");
    appendLine('<span class="color-orange bold">Personal</span>');
    for (const [key, p] of personal) {
      appendLine(
        `  <span class="clickable" data-cmd="project ${key}">${key}</span>  <span class="color-comment">— ${p.title}</span>`
      );
    }

    appendLine("");
    appendLine(
      '<span class="color-comment">Type \'project &lt;name&gt;\' to view details</span>'
    );
  };

  commands.project = function (args) {
    const name = args.trim().toLowerCase();
    if (!name) {
      appendLine('<span class="color-red">Usage: project &lt;name&gt;</span>');
      return;
    }
    const p = DATA.projects[name];
    if (!p) {
      appendLine(
        `<span class="color-red">Project not found: ${escapeHtml(name)}</span>`
      );
      appendLine(
        '<span class="color-comment">Use \'projects\' to see available projects</span>'
      );
      return;
    }

    appendLine(`<span class="color-purple bold">${escapeHtml(p.title)}</span>`);
    appendLine(`<span class="color-orange">${p.category} Project</span>`);
    appendSeparator();
    appendBlock(escapeHtml(p.description));
    if (p.link) {
      appendLine(makeExtLink("[View on GitHub]", p.link));
    }
    appendLine("");
    appendLine(makeClickable("projects", "projects"), "color-comment");
  };

  commands.cv = function () {
    appendLine('<span class="color-purple bold">Curriculum Vitae</span>');
    appendSeparator();

    // Education
    appendLine('<span class="color-orange bold">Education</span>');
    for (const e of DATA.education) {
      appendLine(
        `  <span class="color-cyan bold">${escapeHtml(e.institution)}</span> | ${escapeHtml(e.degree)}`
      );
      appendLine(
        `  <span class="color-comment">${escapeHtml(e.period)} | ${escapeHtml(e.location)}</span>`
      );
      for (const d of e.details) {
        appendLine(`    - ${escapeHtml(d)}`);
      }
      appendLine("");
    }

    // Experience
    appendLine('<span class="color-orange bold">Experience</span>');
    for (const e of DATA.experience) {
      appendLine(
        `  <span class="color-cyan bold">${escapeHtml(e.company)}</span> | ${escapeHtml(e.role)}`
      );
      appendLine(
        `  <span class="color-comment">${escapeHtml(e.period)} | ${escapeHtml(e.location)}</span>`
      );
      for (const d of e.details) {
        appendLine(`    - ${escapeHtml(d)}`);
      }
      appendLine("");
    }

    appendLine(
      makeExtLink("[Download PDF]", "files/cv/VRVarma_Academic_CV.pdf")
    );
    appendLine("");
    appendLine(
      makeClickable("skills", "skills") +
        "  " +
        makeClickable("projects", "projects") +
        "  " +
        makeClickable("publications", "publications"),
      "color-comment"
    );
  };

  commands.skills = function () {
    appendLine('<span class="color-purple bold">Skills & Tools</span>');
    appendSeparator();

    appendLine('<span class="color-orange bold">Tools</span>');
    for (const [cat, items] of Object.entries(DATA.skills.tools)) {
      appendLine(`  <span class="color-cyan">${escapeHtml(cat)}:</span>`);
      appendLine(`    ${items.map(escapeHtml).join(" · ")}`);
    }

    appendLine("");
    appendLine('<span class="color-orange bold">Programming</span>');
    for (const [cat, items] of Object.entries(DATA.skills.programming)) {
      appendLine(`  <span class="color-cyan">${escapeHtml(cat)}:</span>`);
      appendLine(`    ${items.map(escapeHtml).join(" · ")}`);
    }

    appendLine("");
    appendLine('<span class="color-orange bold">Core Competencies</span>');
    for (const c of DATA.skills.competencies) {
      appendLine(`  - ${escapeHtml(c)}`);
    }
  };

  commands.publications = function () {
    appendLine('<span class="color-purple bold">Publications</span>');
    appendSeparator();

    for (let i = 0; i < DATA.publications.length; i++) {
      const p = DATA.publications[i];
      appendLine(
        `<span class="color-cyan bold">${i + 1}. ${escapeHtml(p.title)}</span>`
      );
      let meta = `   <span class="color-orange">${escapeHtml(p.venue)}</span>`;
      if (p.status === "Under Review") {
        meta += ` <span class="color-comment">(Under Review)</span>`;
      }
      appendLine(meta);
      if (p.doi) {
        appendLine(
          `   DOI: ${makeExtLink(p.doi, "https://doi.org/" + p.doi)}`
        );
      }
      appendLine(
        `   <span class="color-comment">${escapeHtml(p.description)}</span>`
      );
      appendLine("");
    }
  };

  commands.contact = function () {
    appendLine('<span class="color-purple bold">Contact</span>');
    appendSeparator();

    const c = DATA.contact;
    appendLine(
      `  <span class="color-orange">Email:</span>    ${makeExtLink(c.email, "mailto:" + c.email)}`
    );
    appendLine(
      `  <span class="color-orange">GitHub:</span>   ${makeExtLink("v3rm1", c.github)}`
    );
    appendLine(
      `  <span class="color-orange">LinkedIn:</span> ${makeExtLink("Varun Ravi Varma", c.linkedin)}`
    );
    appendLine(
      `  <span class="color-orange">ORCID:</span>    ${makeExtLink("0000-0003-1719-2478", c.orcid)}`
    );
    appendLine(
      `  <span class="color-orange">Location:</span> ${escapeHtml(c.location)}`
    );
  };

  commands.clear = function () {
    output.innerHTML = "";
  };

  // ── Escape HTML ────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Execute command ────────────────────────────────────────────
  function execute(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Echo the command
    appendLine(
      `<span class="history-prompt">v3rm1@portfolio:~$</span> <span class="history-cmd">${escapeHtml(trimmed)}</span>`
    );

    // Parse command and args
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    // Add to history
    history.push(trimmed);
    historyIndex = history.length;

    // Highlight sidebar
    setActiveSidebar(cmd);

    if (commands[cmd]) {
      commands[cmd](args);
    } else {
      appendLine(
        `<span class="color-red">command not found: ${escapeHtml(cmd)}. Type 'help' for available commands.</span>`
      );
    }

    appendLine("");
    scrollToBottom();
  }

  // ── Input handling ─────────────────────────────────────────────
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const val = input.value;
      input.value = "";
      execute(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        input.value = "";
      }
    }
  });

  // ── F-key handling ─────────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (fKeyMap[e.key]) {
      e.preventDefault();
      execute(fKeyMap[e.key]);
      input.focus();
    }
  });

  // ── Sidebar click handling ─────────────────────────────────────
  sidebar.addEventListener("click", function (e) {
    const item = e.target.closest(".sidebar-item");
    if (!item) return;
    const cmd = item.dataset.cmd;
    execute(cmd);
    input.focus();
  });

  // ── Inline clickable elements ──────────────────────────────────
  output.addEventListener("click", function (e) {
    const el = e.target.closest(".clickable");
    if (!el) return;
    const cmd = el.dataset.cmd;
    if (cmd) {
      execute(cmd);
      input.focus();
    }
  });

  // ── Focus input on main panel click ────────────────────────────
  terminalBody.addEventListener("click", function (e) {
    if (!e.target.closest(".clickable") && !e.target.closest("a")) {
      input.focus();
    }
  });

  // ── Start ──────────────────────────────────────────────────────
  boot();
})();
```

- [ ] **Step 2: Verify in browser**

Check:
- Boot sequence plays in main panel
- Sidebar items are clickable and execute commands
- Active command highlighted with `◂` marker
- F1-F7 keys trigger commands
- Command history (up/down arrows) works
- Inline clickable links work

- [ ] **Step 3: Commit**

```bash
git add js/terminal.js
git commit -m "feat: sidebar interaction, F-key shortcuts, active command highlighting"
```

---

### Task 4: Polish borders and visual cleanup

**Files:**
- Modify: `css/terminal.css`
- Modify: `index.html`

- [ ] **Step 1: Fix the border-fill elements to render properly**

The `border-fill` spans need to repeat `─` characters via CSS or use a background approach. Update CSS to use `overflow: hidden` with a very long text content:

In `index.html`, replace each `<span class="border-fill">─</span>` with a longer repeated string so the flex layout clips it:

```html
<!-- In tui-top-border -->
<span class="border-fill">────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────</span>

<!-- In tui-mid-border -->
<span class="border-fill">────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────</span>

<!-- In tui-bottom-border -->
<span class="border-fill">────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────</span>
```

- [ ] **Step 2: Verify borders stretch correctly at various widths**

Resize browser window and confirm `─` fills the gap.

- [ ] **Step 3: Commit**

```bash
git add index.html css/terminal.css
git commit -m "fix: ensure box-drawing borders fill available width"
```

---

### Task 5: Final integration test

- [ ] **Step 1: Full walkthrough**

Open in browser and test every command: `help`, `about`, `projects`, `project thesis`, `cv`, `skills`, `publications`, `contact`, `clear`. Test F-keys. Test sidebar clicks. Test typing + history. Test responsive (<600px).

- [ ] **Step 2: Fix any issues found**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete TUI portfolio redesign with Catppuccin Mocha theme"
```

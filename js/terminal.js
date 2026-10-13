(function () {
  const output = document.getElementById("output");
  const input = document.getElementById("command-input");
  const inputLine = document.getElementById("input-line");
  const terminalBody = document.getElementById("terminal-body");
  const sidebar = document.getElementById("sidebar");

  const history = [];
  let historyIndex = -1;

  // ── Shortcut keys ─────────────────────────────────────────────
  // Number keys instead of F-keys: F1/F5/F7 belong to the browser
  // (help, reload, caret browsing) and need fn on most Mac keyboards.
  const shortcutMap = {
    1: "help",
    2: "about",
    3: "projects",
    4: "cv",
    5: "skills",
    6: "publications",
    7: "contact",
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

  // Boot animation plays once per session, is skipped on any key or tap,
  // and never plays for visitors who prefer reduced motion.
  let skipBoot = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    if (sessionStorage.getItem("booted")) skipBoot = true;
    sessionStorage.setItem("booted", "1");
  } catch (e) {}

  function skipBootHandler() {
    skipBoot = true;
  }

  async function boot() {
    inputLine.classList.add("hidden");
    document.addEventListener("keydown", skipBootHandler);
    document.addEventListener("pointerdown", skipBootHandler);
    for (const line of bootLines) {
      if (!skipBoot) await delay(line.delay);
      const div = document.createElement("div");
      div.className = "output-line";
      if (line.cls) {
        div.className += " " + line.cls;
        div.textContent = line.text;
      } else {
        div.innerHTML = colorBootLine(line.text);
      }
      output.appendChild(div);
    }
    if (!skipBoot) await delay(200);
    document.removeEventListener("keydown", skipBootHandler);
    document.removeEventListener("pointerdown", skipBootHandler);
    inputLine.classList.remove("hidden");
    focusInput();
  }

  // Focusing on touch devices pops up the on-screen keyboard over the page.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  function focusInput() {
    if (finePointer) input.focus({ preventScroll: true });
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
      ["skills", "Skills by capability, with evidence"],
      ["skills &lt;name&gt;", "Where I used a skill, e.g. skills jax"],
      ["projects", "List all projects"],
      ["project &lt;name&gt;", "View a specific project"],
      ["timeline", "Career path at a glance"],
      ["cv", "View my CV"],
      ["teaching", "Courses I have taught"],
      ["publications", "View my publications"],
      ["blog", "Latest blog posts"],
      ["contact", "Contact info & social links"],
      ["whoami", "Display current user identity"],
      ["neofetch", "System information"],
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
      makeClickable("skills", "skills") +
        "  " +
        makeClickable("projects", "projects") +
        "  " +
        makeClickable("timeline", "timeline"),
      "color-comment"
    );
  };

  // Clickable skill names that run `skills <slug>`.
  function skillTags(stack) {
    return (stack || [])
      .map((name) => {
        const s = SKILLS.find((x) => x.name === name);
        return s ? makeClickable(escapeHtml(name), "skills " + s.slug) : escapeHtml(name);
      })
      .join(" ");
  }

  commands.skills = function (args) {
    const query = args.trim().toLowerCase();
    if (query) {
      const matches = SKILLS.filter(
        (s) => s.slug === query || s.name.toLowerCase().includes(query)
      );
      if (!matches.length) {
        appendLine(`<span class="color-red">No skill matching: ${escapeHtml(query)}</span>`);
        appendLine('<span class="color-comment">Use \'skills\' to see them all</span>');
        return;
      }
      for (const s of matches) {
        appendLine(
          `<span class="color-purple bold">${escapeHtml(s.name)}</span> <span class="color-comment">— ${escapeHtml(s.group)}</span>`
        );
        if (!s.evidence.length) {
          appendLine('  <span class="color-comment">No linked project yet.</span>');
        }
        for (const e of s.evidence) {
          appendLine(`  - ${makeClickable(escapeHtml(e.label), e.cmd)}`);
        }
        appendLine("");
      }
      appendLine(makeClickable("all skills", "skills"), "color-comment");
      return;
    }

    appendLine('<span class="color-purple bold">Skills</span>');
    appendSeparator();
    const groups = {};
    for (const s of SKILLS) (groups[s.group] ||= []).push(s);
    for (const [group, skills] of Object.entries(groups)) {
      appendLine(`<span class="color-orange bold">${escapeHtml(group)}</span>`);
      appendLine(
        "  " +
          skills
            .map(
              (s) =>
                makeClickable(escapeHtml(s.name), "skills " + s.slug) +
                (s.evidence.length ? `<span class="color-comment">(${s.evidence.length})</span>` : "")
            )
            .join("  ")
      );
      appendLine("");
    }
    appendLine('<span class="color-orange bold">Also used</span>');
    appendLine("  " + DATA.skills.alsoUsed.map(escapeHtml).join(" · "));
    appendLine("");
    appendLine('<span class="color-orange bold">Languages</span>');
    appendLine("  " + DATA.skills.languages.map(escapeHtml).join(" · "));
    appendLine("");
    appendLine(
      '<span class="color-comment">Numbers count linked projects, roles and papers. Click a skill to see them.</span>'
    );
  };

  commands.projects = function () {
    appendLine('<span class="color-purple bold">Projects</span>');
    appendSeparator();

    for (const category of DATA.projectCategories) {
      const entries = Object.entries(DATA.projects).filter(
        ([, p]) => p.category === category
      );
      if (!entries.length) continue;
      appendLine(`<span class="color-orange bold">${escapeHtml(category)}</span>`);
      for (const [key, p] of entries) {
        appendLine(
          `  <span class="clickable" data-cmd="project ${key}">${key}</span>  <span class="color-comment">— ${escapeHtml(p.title)}</span>`
        );
      }
      appendLine("");
    }

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
    appendLine(
      `<span class="color-orange">${escapeHtml(p.category)}</span>` +
        (p.status ? ` <span class="color-comment">· ${escapeHtml(p.status)}</span>` : "")
    );
    appendSeparator();
    appendBlock(escapeHtml(p.description));
    appendLine('<span class="color-comment">Skills:</span> ' + skillTags(p.stack));
    if (p.link) {
      appendLine(makeExtLink("[View on GitHub]", p.link));
    }
    appendLine("");
    appendLine(makeClickable("projects", "projects"), "color-comment");
  };

  commands.timeline = function () {
    appendLine('<span class="color-purple bold">Timeline</span>');
    appendSeparator();
    appendLine(`<span class="color-comment">${escapeHtml(TIMELINE_SUMMARY)}</span>`);
    appendLine("");
    for (const t of TIMELINE) {
      const marker = t.kind === "education" ? "◆" : "●";
      appendLine(
        `<span class="color-cyan">${marker}</span> <span class="bold">${escapeHtml(t.title)}</span>, ${escapeHtml(t.org)}`
      );
      appendLine(`  <span class="color-comment">${escapeHtml(t.when)}</span>`);
    }
    appendLine("");
    appendLine(
      '<span class="color-comment"><span class="color-cyan">◆</span> education  <span class="color-cyan">●</span> work</span>'
    );
    appendLine(makeClickable("cv", "cv") + "  " + makeClickable("skills", "skills"), "color-comment");
  };

  commands.teaching = function () {
    appendLine('<span class="color-purple bold">Teaching</span>');
    appendSeparator();
    for (const t of TEACHING) {
      appendLine(
        `<span class="color-cyan bold">${escapeHtml(t.org)}</span> | ${escapeHtml(t.role)}`
      );
      appendLine(`  <span class="color-comment">${escapeHtml(t.when)}</span>`);
      for (const c of t.courses) {
        appendLine(`    - ${escapeHtml(c)}`);
      }
      appendLine("");
    }
  };

  commands.cv = function () {
    appendLine('<span class="color-purple bold">Curriculum Vitae</span>');
    appendSeparator();

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
      appendLine("    " + skillTags(e.stack));
      appendLine("");
    }

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
      appendLine("    " + skillTags(e.stack));
      appendLine("");
    }

    appendLine(
      makeExtLink("[Download PDF]", DATA.profile.cv)
    );
    appendLine("");
    appendLine(
      makeClickable("timeline", "timeline") +
        "  " +
        makeClickable("teaching", "teaching") +
        "  " +
        makeClickable("publications", "publications"),
      "color-comment"
    );
  };

  commands.publications = function () {
    appendLine('<span class="color-purple bold">Publications</span>');
    appendSeparator();

    for (let i = 0; i < DATA.publications.length; i++) {
      const p = DATA.publications[i];
      appendLine(
        `<span class="color-cyan bold">${i + 1}. ${escapeHtml(p.title)}</span>`
      );
      appendLine(
        `   <span class="color-orange">${escapeHtml(p.venue)}, ${escapeHtml(String(p.year))}</span>`
      );
      if (p.doi) {
        appendLine(
          `   DOI: ${makeExtLink(p.doi, "https://doi.org/" + p.doi)}`
        );
      }
      appendLine(
        `   <span class="color-comment">${escapeHtml(p.description)}</span>`
      );
      appendLine("   " + skillTags(p.stack));
      appendLine("");
    }
  };

  commands.blog = function () {
    appendLine('<span class="color-purple bold">Blog</span>');
    appendSeparator();
    if (!POSTS.length) {
      appendLine('<span class="color-comment">No posts yet.</span>');
    }
    for (const p of POSTS) {
      appendLine(
        `<span class="color-comment">${escapeHtml(p.date)}</span>  ` +
          `<a class="ext-link" href="${p.url}">${escapeHtml(p.title)}</a>`
      );
      if (p.description) {
        appendLine(`  <span class="color-comment">${escapeHtml(p.description)}</span>`);
      }
    }
    appendLine("");
    appendLine(
      '<a class="ext-link" href="blog/">[All posts]</a>  ' +
        '<a class="ext-link" href="blog/index.xml">[RSS]</a>'
    );
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

  commands.whoami = function () {
    appendLine(
      '<span class="color-green bold">Varun Ravi Varma</span> <span class="color-comment">—</span> ' +
      '<span class="color-purple">AI Research Scientist & Software Engineer</span> <span class="color-comment">@ Grimstad, Norway</span>'
    );
  };

  // ── Easter eggs ────────────────────────────────────────────────
  commands.sudo = function () {
    appendLine('<span class="color-red bold">[sudo] password for guest: ********</span>');
    appendLine('<span class="color-red">Access denied. Nice try though.</span>');
  };

  commands.exit = function () {
    appendLine('<span class="color-comment">Logout...</span>');
    appendLine('<span class="color-green bold">Just kidding. You can\'t leave. Stay a while.</span>');
  };

  commands.neofetch = function () {
    const art = [
      '<span class="color-blue bold">        ██╗   ██╗██████╗ </span>  <span class="color-green bold">v3rm1</span><span class="color-comment">@</span><span class="color-blue bold">portfolio</span>',
      '<span class="color-blue bold">        ██║   ██║╚════██╗</span>  <span class="color-comment">──────────────────</span>',
      '<span class="color-blue bold">        ██║   ██║ █████╔╝</span>  <span class="color-orange">OS:</span>      <span class="color-fg">v3rm1OS 1.0 (TUI Edition)</span>',
      '<span class="color-blue bold">        ╚██╗ ██╔╝ ╚═══██╗</span>  <span class="color-orange">Host:</span>    <span class="color-fg">github.io</span>',
      '<span class="color-blue bold">         ╚████╔╝ ██████╔╝</span>  <span class="color-orange">Kernel:</span>  <span class="color-fg">HTML5/CSS3/JS</span>',
      '<span class="color-blue bold">          ╚═══╝  ╚═════╝ </span>  <span class="color-orange">Shell:</span>   <span class="color-fg">v3rm1-sh 1.0</span>',
      '                          <span class="color-orange">Role:</span>    <span class="color-fg">PhD Researcher / AI Engineer</span>',
      '                          <span class="color-orange">Focus:</span>   <span class="color-fg">Multi-Agent RL, Interpretability</span>',
      '                          <span class="color-orange">Lang:</span>    <span class="color-fg">Python, C++, Julia</span>',
      '                          <span class="color-orange">Theme:</span>   <span class="color-fg">Catppuccin Mocha</span>',
      '',
      '                          <span class="color-red">██</span><span class="color-orange">██</span><span class="color-green">██</span><span class="color-cyan">██</span><span class="color-blue">██</span><span class="color-purple">██</span><span class="color-pink">██</span>',
    ];
    for (const line of art) {
      appendLine(line);
    }
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

    appendLine(
      `<span class="history-prompt">v3rm1@portfolio:~$</span> <span class="history-cmd">${escapeHtml(trimmed)}</span>`
    );

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    history.push(trimmed);
    historyIndex = history.length;

    setActiveSidebar(cmd);

    // Easter egg: rm -rf /
    if (trimmed === "rm -rf /" || trimmed === "rm -rf / --no-preserve-root") {
      appendLine('<span class="color-red bold">🔥 Deleting everything...</span>');
      appendLine('<span class="color-red">rm: cannot remove \'/portfolio\': Permission denied</span>');
      appendLine('<span class="color-comment">This is a portfolio, not a real filesystem. Relax.</span>');
    } else if (commands[cmd]) {
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
    if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.value.trim().toLowerCase();
      if (!partial) return;
      const allCmds = Object.keys(commands);
      const matches = allCmds.filter((c) => c.startsWith(partial));
      if (matches.length === 1) {
        input.value = matches[0];
      } else if (matches.length > 1) {
        appendLine(
          `<span class="history-prompt">v3rm1@portfolio:~$</span> <span class="history-cmd">${escapeHtml(partial)}</span>`
        );
        appendLine(matches.join("  "), "color-cyan");
        appendLine("");
        scrollToBottom();
      }
    } else if (e.key === "Enter") {
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

  // ── Shortcut handling ──────────────────────────────────────────
  // Only fires while the prompt is empty, so digits can still be typed
  // as part of a command.
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (inputLine.classList.contains("hidden") || input.value) return;
    if (shortcutMap[e.key]) {
      e.preventDefault();
      execute(shortcutMap[e.key]);
      focusInput();
    }
  });

  // ── Sidebar click handling ─────────────────────────────────────
  sidebar.addEventListener("click", function (e) {
    const item = e.target.closest(".sidebar-item");
    if (!item) return;
    const cmd = item.dataset.cmd;
    execute(cmd);
    focusInput();
  });

  // ── Hero section links ─────────────────────────────────────────
  // Without JS these anchors jump to the static sections instead.
  document.querySelector(".hero").addEventListener("click", function (e) {
    const el = e.target.closest("[data-cmd]");
    if (!el) return;
    e.preventDefault();
    execute(el.dataset.cmd);
    focusInput();
  });

  // ── Inline clickable elements ──────────────────────────────────
  output.addEventListener("click", function (e) {
    const el = e.target.closest(".clickable");
    if (!el) return;
    const cmd = el.dataset.cmd;
    if (cmd) {
      execute(cmd);
      focusInput();
    }
  });

  // ── Focus input on main panel click ────────────────────────────
  terminalBody.addEventListener("click", function (e) {
    if (!e.target.closest(".clickable") && !e.target.closest("a")) {
      focusInput();
    }
  });

  // ── Start ──────────────────────────────────────────────────────
  boot();
})();

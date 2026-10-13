(function () {
  const output = document.getElementById("output");
  const terminalBody = document.getElementById("terminal-body");
  const sidebar = document.getElementById("sidebar");
  const hero = document.querySelector(".hero");
  const statusPath = document.getElementById("status-path");
  const frameTitle = document.getElementById("frame-title");

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
    { text: "Select a section from the menu.", delay: 100, cls: "color-comment" },
    { text: "", delay: 50 }
  ];

  function colorBootLine(text) {
    return text
      .replace(/^(\[[A-Z]+\])/, '<span class="color-comment">$1</span>')
      .replace(/(OK)$/, '<span class="color-green bold">$1</span>');
  }

  // Boot animation plays once per session, is skipped on any click or tap,
  // and never plays for visitors who prefer reduced motion.
  let skipBoot = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    if (sessionStorage.getItem("booted")) skipBoot = true;
    sessionStorage.setItem("booted", "1");
  } catch (e) {}

  function skipBootHandler() {
    skipBoot = true;
  }

  // The boot log is the home pane's output. A section chosen mid-boot
  // replaces the pane, so the animation stops writing once it is gone.
  let booting = false;

  async function boot() {
    trackView("", "");
    booting = true;
    document.addEventListener("pointerdown", skipBootHandler);
    for (const line of bootLines) {
      if (!skipBoot) await delay(line.delay);
      if (!booting) break;
      output.appendChild(bootLine(line));
    }
    booting = false;
    document.removeEventListener("pointerdown", skipBootHandler);
  }

  function bootLine(line) {
    const div = document.createElement("div");
    div.className = "output-line boot-line";
    if (line.cls) {
      div.className += " " + line.cls;
      div.textContent = line.text;
    } else {
      div.innerHTML = colorBootLine(line.text);
    }
    return div;
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ── Scroll helper ──────────────────────────────────────────────
  // Phones scroll the window, wider screens scroll the main panel.
  function scrollToTop() {
    terminalBody.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ── Output helpers ─────────────────────────────────────────────
  // Leading spaces become a left indent and a "- " bullet a hanging
  // indent, so wrapped text stays aligned on narrow screens.
  function appendLine(html, cls) {
    const div = document.createElement("div");
    div.className = "output-line" + (cls ? " " + cls : "");
    const [, spaces, bullet] = html.match(/^( *)(- )?/);
    if (spaces || bullet) {
      const hang = bullet ? 2 : 0;
      div.style.paddingLeft = spaces.length + hang + "ch";
      div.style.textIndent = -hang + "ch";
      html = html.slice(spaces.length);
    }
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

  function makeClickable(text, cmd, bare) {
    const label = bare ? text : `[${text}]`;
    return `<button type="button" class="clickable" data-cmd="${cmd}">${label}</button>`;
  }

  function makeExtLink(text, url) {
    return `<a class="ext-link" href="${url}" target="_blank" rel="noopener">${text}</a>`;
  }

  // ── Sidebar highlight ─────────────────────────────────────────
  // `project x` highlights `projects`, `skills x` highlights `skills`.
  function setActiveSidebar(cmd) {
    const section = cmd === "project" ? "projects" : cmd;
    sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
      const active = item.dataset.cmd === section;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  // ── Commands ───────────────────────────────────────────────────
  const commands = {};

  commands.about = function () {
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
        appendLine(makeClickable("all skills", "skills"), "color-comment");
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
      '<span class="color-comment">Numbers count linked projects, roles and papers. Select a skill to see them.</span>'
    );
  };

  commands.projects = function () {

    for (const category of DATA.projectCategories) {
      const entries = Object.entries(DATA.projects).filter(
        ([, p]) => p.category === category
      );
      if (!entries.length) continue;
      appendLine(`<span class="color-orange bold">${escapeHtml(category)}</span>`);
      for (const [key, p] of entries) {
        appendLine(
          `<div class="row">${makeClickable(key, "project " + key, true)}<span class="color-comment">— ${escapeHtml(p.title)}</span></div>`
        );
      }
      appendLine("");
    }

    appendLine('<span class="color-comment">Select a project for details.</span>');
  };

  commands.project = function (args) {
    const name = args.trim().toLowerCase();
    const p = DATA.projects[name];
    if (!p) {
      appendLine(
        `<span class="color-red">Project not found: ${escapeHtml(name)}</span>`
      );
      appendLine(makeClickable("projects", "projects"), "color-comment");
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
      makeExtLink("[Download CV]", DATA.profile.cv) +
        "  " +
        makeExtLink("[Academic CV]", DATA.profile.academicCv)
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
      '                          <span class="color-orange">Theme:</span>   <span class="color-fg">Tokyo Night</span>',
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

  // ── Panes ──────────────────────────────────────────────────────
  // Every section is a pane addressed by the URL hash (`#projects`,
  // `#skills/jax`), so the back button and shared links work. An empty
  // hash is the home pane: the hero and the boot log.
  function hashToCmd(hash) {
    const h = decodeURIComponent(hash.replace(/^#/, ""));
    // Static-content anchors used by the hero tags and no-JS links.
    const skill = h.match(/^skill-(.+)$/);
    if (skill) return "skills " + skill[1];
    return h.split("/").join(" ").trim();
  }

  function cmdToHash(cmd) {
    return cmd ? "#" + cmd.trim().split(/\s+/).join("/") : "";
  }

  // Pane views for analytics (js/track.js); absent when tracking is off.
  function trackView(cmd, args) {
    const path = "/" + cmdToHash([cmd, args].filter(Boolean).join(" "));
    if (window.track) window.track.view(path);
  }

  function render(raw) {
    const parts = raw.trim().split(/\s+/);
    let cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");
    if (!commands[cmd]) cmd = "";

    booting = false;
    output.innerHTML = "";
    hero.hidden = cmd !== "";
    if (cmd) {
      commands[cmd](args);
    } else {
      for (const line of bootLines) output.appendChild(bootLine(line));
    }

    setActiveSidebar(cmd);
    const path = "~/" + (cmd ? [cmd, args].filter(Boolean).join("/") : "");
    statusPath.textContent = path;
    frameTitle.textContent = "─ v3rm1@portfolio:" + path + " ";
    scrollToTop();
    trackView(cmd, args);
  }

  function navigate(cmd) {
    const hash = cmdToHash(cmd);
    if (hash === location.hash) {
      render(cmd);
    } else if (hash) {
      location.hash = hash;
    } else {
      // Going home: drop the hash without leaving a bare "#" in the URL.
      history.pushState(null, "", location.pathname + location.search);
      render("");
    }
  }

  // Also fires on back/forward between panes, including back to home.
  window.addEventListener("hashchange", () => render(hashToCmd(location.hash)));

  // ── Pointer handling ───────────────────────────────────────────
  // Sidebar buttons, hero links and inline commands all carry data-cmd.
  // Hero anchors fall back to the static sections when JS is off.
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-cmd]");
    if (!el) return;
    e.preventDefault();
    navigate(el.dataset.cmd);
  });

  // ── Menu row overflow hint (phones) ────────────────────────────
  // The row fades out on the right while more items are off-screen.
  function updateMenuHint() {
    const more = sidebar.scrollLeft + sidebar.clientWidth < sidebar.scrollWidth - 1;
    sidebar.classList.toggle("has-more", more);
  }
  sidebar.addEventListener("scroll", updateMenuHint, { passive: true });
  window.addEventListener("resize", updateMenuHint);
  updateMenuHint();

  // ── Start ──────────────────────────────────────────────────────
  const initial = hashToCmd(location.hash);
  if (initial) render(initial);
  else boot();
})();

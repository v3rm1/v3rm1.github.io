(function () {
  const output = document.getElementById("output");
  const terminalBody = document.getElementById("terminal-body");
  const sidebar = document.getElementById("sidebar");
  const hero = document.querySelector(".hero");
  const statusPath = document.getElementById("status-path");
  const frameTitle = document.getElementById("frame-title");


  // ── Scroll helper ──────────────────────────────────────────────
  function scrollToTop() {
    terminalBody.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ── Output helpers ─────────────────────────────────────────────
  function appendLine(html, cls) {
    const div = document.createElement("div");
    div.className = "output-line" + (cls ? " " + cls : "");
    const [, spaces, bullet] = html.match(/^( *)(- )?/) || [];
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
    return `<button type="button" class="clickable" data-cmd="${escapeAttr(cmd)}">${label}</button>`;
  }

  function makeExtLink(text, url) {
    return `<a class="ext-link" href="${url}" target="_blank" rel="noopener">${text}</a>`;
  }

  // ── Sidebar highlight ─────────────────────────────────────────
  function setActiveSidebar(cmd) {
    const section = cmd === "project" ? "projects" : cmd;
    sidebar.querySelectorAll(".sidebar-item").forEach((item) => {
      const active = item.dataset.cmd === section;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  // ── BibTeX Citations ───────────────────────────────────────────
  const BIBTEX = [
    `@article{varma2024noise,
  title={Improving Noise Robustness through Abstractions and its Impact on Machine Learning},
  author={Varma, Varun Ravi and others},
  journal={arXiv preprint arXiv:2406.08428},
  year={2024},
  doi={10.48550/arXiv.2406.08428}
}`,
    `@article{varma2024cactus,
  title={CACTUS: A Comprehensive Abstraction and Classification Tool for Uncovering Structures},
  author={Varma, Varun Ravi and others},
  journal={ACM Transactions on Intelligent Systems and Technology},
  year={2024},
  doi={10.1145/3649459}
}`,
    `@article{varma2023sanda,
  title={SaNDA: A Small and iNcomplete Dataset Analyser},
  author={Varma, Varun Ravi and others},
  journal={Information Sciences},
  volume={648},
  year={2023},
  doi={10.1016/j.ins.2023.119078}
}`,
    `@inproceedings{varma2024pandemic,
  title={Adaptive Pandemic Analysis: An Agent-Based Reinforcement Learning Framework},
  author={Varma, Varun Ravi and others},
  booktitle={FAIEMA 2024},
  year={2024}
}`
  ];

  // ── Clipboard copy helper ───────────────────────────────────────
  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(success, fallback);
    } else {
      fallback();
    }

    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        success();
      } catch (e) {}
      document.body.removeChild(ta);
    }

    function success() {
      if (!btn) return;
      const oldText = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("bold");
      setTimeout(() => {
        btn.textContent = oldText;
        btn.classList.remove("bold");
      }, 2000);
    }
  }

  // ── Persistent Subpane Header ──────────────────────────────────
  function renderSubpaneHeader() {
    const div = document.createElement("div");
    div.className = "output-block";
    div.innerHTML = `
      <div class="subpane-header">
        <div class="subpane-identity">
          <span class="subpane-name">${escapeHtml(DATA.profile.name)}</span>
          <span class="subpane-role">· ${escapeHtml(DATA.profile.headline.split("—")[0].trim())}</span>
        </div>
        <div class="subpane-actions">
          <a class="cta cta-compact cta-primary" href="${escapeHtml(DATA.profile.cv)}" download>CV</a>
          <a class="cta cta-compact" href="mailto:${escapeHtml(DATA.contact.email)}">Email</a>
          <button type="button" class="cta cta-compact cta-home" data-cmd="">Home</button>
        </div>
      </div>`;
    output.appendChild(div);
  }

  // ── Home View (Executive Spotlight & Diagnostics) ──────────────
  function renderHome(container) {
    const spotlightDiv = document.createElement("div");
    spotlightDiv.className = "output-block";
    spotlightDiv.innerHTML = `
      <div class="home-spotlight">
        <div class="spotlight-header">
          <span class="color-magenta bold">┌─ RESEARCH HIGHLIGHTS &amp; CAPABILITIES</span>
        </div>
        <div class="spotlight-grid">
          <div class="spotlight-card">
            <div class="card-title color-cyan bold">◆ Hierarchical Multi-Agent RL</div>
            <div class="card-body">Structured sub-team coordination in Dec-POMDPs. Long-horizon decision-making under partial observability with rigorous evaluation across random seeds.</div>
            <div class="card-link">${makeClickable("View Project Details ▸", "project marl_coordination", true)}</div>
          </div>
          <div class="spotlight-card">
            <div class="card-title color-orange bold">◆ GPU Simulation in JAX</div>
            <div class="card-body">Vectorised, JIT-compiled crisis and agent-based simulation environments. Stepping 10,000s of scenarios concurrently on single GPUs.</div>
            <div class="card-link">${makeClickable("View Project Details ▸", "project gpu_sim", true)}</div>
          </div>
          <div class="spotlight-card">
            <div class="card-title color-green bold">◆ Production ML &amp; Data Systems</div>
            <div class="card-body">Enterprise experience scaling ML pipelines, cloud architectures (Azure/Databricks), and interpretable models (Tsetlin Machines) from industry to academia.</div>
            <div class="card-link">${makeClickable("View Career Timeline ▸", "timeline", true)}</div>
          </div>
        </div>
      </div>`;
    container.appendChild(spotlightDiv);
  }

  // ── Breadcrumb path updater ────────────────────────────────────
  function updateBreadcrumbs(cmd, args) {
    statusPath.innerHTML = "";
    const homeBtn = document.createElement("button");
    homeBtn.type = "button";
    homeBtn.className = "breadcrumb-btn";
    homeBtn.dataset.cmd = "";
    homeBtn.textContent = "~";
    statusPath.appendChild(homeBtn);

    if (cmd) {
      statusPath.appendChild(document.createTextNode("/"));
      const cmdBtn = document.createElement("button");
      cmdBtn.type = "button";
      cmdBtn.className = "breadcrumb-btn";
      cmdBtn.dataset.cmd = cmd;
      cmdBtn.textContent = cmd;
      statusPath.appendChild(cmdBtn);
    }
    if (args) {
      statusPath.appendChild(document.createTextNode("/" + args));
    }
    const plainPath = "~/" + (cmd ? [cmd, args].filter(Boolean).join("/") : "");
    frameTitle.textContent = "─ v3rm1@portfolio:" + plainPath + " ";
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

    // Live search input
    appendBlock(
      `<div class="skills-filter-wrap">` +
        `<span class="color-comment">Filter:</span> ` +
        `<input type="text" id="skill-search-input" class="tui-input" placeholder="Type to filter skills (e.g. JAX, PyTorch, RL, Python)..." autocomplete="off">` +
      `</div>`
    );

    const container = document.createElement("div");
    container.id = "skills-list-container";
    output.appendChild(container);

    function renderSkillGroups(filterText) {
      container.innerHTML = "";
      const ft = (filterText || "").trim().toLowerCase();
      const groups = {};
      for (const s of SKILLS) {
        if (!ft || s.name.toLowerCase().includes(ft) || s.group.toLowerCase().includes(ft)) {
          (groups[s.group] ||= []).push(s);
        }
      }

      if (!Object.keys(groups).length) {
        container.innerHTML = `<div class="output-line color-comment">No skills match "${escapeHtml(ft)}".</div>`;
        return;
      }

      for (const [group, skills] of Object.entries(groups)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "output-block";
        let html = `<div class="output-line color-orange bold">${escapeHtml(group)}</div><div class="tags" style="margin-top:4px">`;
        html += skills
          .map((s) => {
            const isTop = DATA.profile.topSkills.includes(s.name);
            return `<span class="skill-pill ${isTop ? "top-skill" : ""}">${makeClickable(escapeHtml(s.name), "skills " + s.slug, true)}<span class="skill-count">${s.evidence.length ? `(${s.evidence.length})` : ""}</span></span>`;
          })
          .join(" ");
        html += `</div>`;
        groupDiv.innerHTML = html;
        container.appendChild(groupDiv);
      }

      if (!ft) {
        const alsoDiv = document.createElement("div");
        alsoDiv.className = "output-block";
        alsoDiv.innerHTML = `<div class="output-line color-orange bold">Also used</div><div class="output-line color-comment" style="margin-top:2px">${DATA.skills.alsoUsed.map(escapeHtml).join(" · ")}</div>`;
        container.appendChild(alsoDiv);

        const langDiv = document.createElement("div");
        langDiv.className = "output-block";
        langDiv.innerHTML = `<div class="output-line color-orange bold">Languages</div><div class="output-line color-comment" style="margin-top:2px">${DATA.skills.languages.map(escapeHtml).join(" · ")}</div>`;
        container.appendChild(langDiv);
      }
    }

    renderSkillGroups("");

    const input = document.getElementById("skill-search-input");
    if (input) {
      input.addEventListener("input", (e) => {
        renderSkillGroups(e.target.value);
      });
    }

    appendLine(
      '<span class="color-comment">Select a skill to view linked projects, roles, and publications.</span>'
    );
  };

  let activeProjectCategory = "All";

  commands.projects = function (args) {
    const filterCat = args ? args.trim() : activeProjectCategory;
    activeProjectCategory = filterCat || "All";

    const allKeys = Object.keys(DATA.projects);
    const catCounts = {};
    for (const k of allKeys) {
      const cat = DATA.projects[k].category;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }

    let filterBar = `<div class="projects-filter-bar">` +
      `<span class="color-comment">Filter:</span> ` +
      `<button type="button" class="filter-btn ${activeProjectCategory === "All" ? "active" : ""}" data-proj-filter="All">All (${allKeys.length})</button>`;

    for (const cat of DATA.projectCategories) {
      if (catCounts[cat]) {
        filterBar += `<button type="button" class="filter-btn ${activeProjectCategory === cat ? "active" : ""}" data-proj-filter="${escapeAttr(cat)}">${escapeHtml(cat)} (${catCounts[cat]})</button>`;
      }
    }
    filterBar += `</div>`;
    appendBlock(filterBar);

    for (const category of DATA.projectCategories) {
      if (activeProjectCategory !== "All" && activeProjectCategory !== category) continue;
      const entries = Object.entries(DATA.projects).filter(
        ([, p]) => p.category === category
      );
      if (!entries.length) continue;
      appendLine(`<span class="color-orange bold">── ${escapeHtml(category)} ──</span>`);
      for (const [key, p] of entries) {
        const firstLine = p.description.split("\n")[0];
        let cardHtml = `
          <div class="project-card">
            <div class="project-card-header">
              <span class="project-card-title">${makeClickable(p.title, "project " + key, true)}</span>
              ${p.status ? `<span class="project-card-status">· ${escapeHtml(p.status)}</span>` : ""}
            </div>
            <div class="project-card-desc">${escapeHtml(firstLine)}</div>
            <div class="project-card-footer">
              <span class="color-comment">Skills: ${skillTags(p.stack)}</span>
              ${makeClickable("View Details ▸", "project " + key, true)}
            </div>
          </div>`;
        appendBlock(cardHtml);
      }
      appendLine("");
    }

    appendLine('<span class="color-comment">Select any project for deep-dive and architecture notes.</span>');
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

    const allKeys = Object.keys(DATA.projects);
    const currIdx = allKeys.indexOf(name);
    const prevKey = currIdx > 0 ? allKeys[currIdx - 1] : null;
    const nextKey = currIdx < allKeys.length - 1 ? allKeys[currIdx + 1] : null;

    appendLine(`<span class="color-purple bold" style="font-size:1.1rem">${escapeHtml(p.title)}</span>`);
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

    let pagerHtml = `<div class="project-pager">`;
    if (prevKey) {
      pagerHtml += makeClickable(`◂ ${DATA.projects[prevKey].title}`, "project " + prevKey);
    } else {
      pagerHtml += `<span></span>`;
    }
    pagerHtml += makeClickable("All Projects", "projects");
    if (nextKey) {
      pagerHtml += makeClickable(`${DATA.projects[nextKey].title} ▸`, "project " + nextKey);
    } else {
      pagerHtml += `<span></span>`;
    }
    pagerHtml += `</div>`;
    appendBlock(pagerHtml);
  };

  commands.timeline = function () {
    appendLine(`<span class="color-comment">${escapeHtml(TIMELINE_SUMMARY)}</span>`);
    appendLine("");
    let railHtml = '<div class="timeline-rail">';
    for (let i = 0; i < TIMELINE.length; i++) {
      const t = TIMELINE[i];
      const isLast = i === TIMELINE.length - 1;
      const glyph = i === 0 ? "┌─" : isLast ? "└─" : "├─";
      const marker = t.kind === "education" ? "◆" : "●";
      railHtml += `
        <div class="timeline-step">
          <div class="timeline-line">
            <span class="timeline-glyph">${glyph}</span>
            ${!isLast ? '<span class="timeline-connector"></span>' : ""}
          </div>
          <div class="timeline-content">
            <div class="timeline-role"><span class="color-cyan">${marker}</span> ${escapeHtml(t.title)}</div>
            <div class="timeline-org">${escapeHtml(t.org)}</div>
            <div class="timeline-date">${escapeHtml(t.when)}</div>
          </div>
        </div>`;
    }
    railHtml += "</div>";
    appendBlock(railHtml);
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
        `<span class="color-cyan bold">${i + 1}. ${escapeHtml(p.title)}</span>` +
          ` <button type="button" class="bibtex-toggle-btn" data-bibtex-idx="${i}">[BibTeX]</button>`
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

      const bib = BIBTEX[i] || "";
      appendBlock(
        `<div id="bibtex-${i}" class="bibtex-drawer" hidden>` +
          `<button type="button" class="copy-btn" data-copy="${escapeAttr(bib)}">Copy</button>` +
          `<pre class="bibtex-code">${escapeHtml(bib)}</pre>` +
        `</div>`
      );
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
      `  <span class="color-orange">Email:</span>    ${makeExtLink(c.email, "mailto:" + c.email)} ` +
      `<button type="button" class="copy-inline-btn" data-copy="${escapeAttr(c.email)}">Copy</button>`
    );
    appendLine(
      `  <span class="color-orange">GitHub:</span>   ${makeExtLink("v3rm1", c.github)}`
    );
    appendLine(
      `  <span class="color-orange">LinkedIn:</span> ${makeExtLink("Varun Ravi Varma", c.linkedin)}`
    );
    appendLine(
      `  <span class="color-orange">ORCID:</span>    ${makeExtLink("0000-0003-1719-2478", c.orcid)} ` +
      `<button type="button" class="copy-inline-btn" data-copy="0000-0003-1719-2478">Copy</button>`
    );
    appendLine(
      `  <span class="color-orange">Location:</span> ${escapeHtml(c.location)}`
    );
  };

  // ── Escape HTML ────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ── Panes ──────────────────────────────────────────────────────
  function hashToCmd(hash) {
    const h = decodeURIComponent(hash.replace(/^#/, ""));
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

    output.innerHTML = "";
    hero.hidden = cmd !== "";
    if (cmd) {
      renderSubpaneHeader();
      commands[cmd](args);
    } else {
      renderHome(output);
    }

    setActiveSidebar(cmd);
    updateBreadcrumbs(cmd, args);
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
      history.pushState(null, "", location.pathname + location.search);
      render("");
    }
  }

  window.addEventListener("hashchange", () => render(hashToCmd(location.hash)));

  // ── Pointer handling ───────────────────────────────────────────
  document.addEventListener("click", function (e) {
    const bibtexToggle = e.target.closest("[data-bibtex-idx]");
    if (bibtexToggle) {
      e.preventDefault();
      const idx = bibtexToggle.dataset.bibtexIdx;
      const drawer = document.getElementById("bibtex-" + idx);
      if (drawer) {
        drawer.hidden = !drawer.hidden;
        bibtexToggle.textContent = drawer.hidden ? "[BibTeX]" : "[Hide BibTeX]";
      }
      return;
    }

    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      e.preventDefault();
      copyToClipboard(copyBtn.dataset.copy, copyBtn);
      return;
    }

    const filterBtn = e.target.closest("[data-proj-filter]");
    if (filterBtn) {
      e.preventDefault();
      const filter = filterBtn.dataset.projFilter;
      commands.projects(filter);
      return;
    }

    const el = e.target.closest("[data-cmd]");
    if (!el) return;
    e.preventDefault();
    navigate(el.dataset.cmd);
  });

  // ── Menu row overflow hint (phones) ────────────────────────────
  function updateMenuHint() {
    const more = sidebar.scrollLeft + sidebar.clientWidth < sidebar.scrollWidth - 1;
    sidebar.classList.toggle("has-more", more);
  }
  sidebar.addEventListener("scroll", updateMenuHint, { passive: true });
  window.addEventListener("resize", updateMenuHint);
  updateMenuHint();

  // ── Start ──────────────────────────────────────────────────────
  const initial = hashToCmd(location.hash);
  render(initial || "");
})();

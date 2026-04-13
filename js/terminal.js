(function () {
  const output = document.getElementById("output");
  const input = document.getElementById("command-input");
  const inputLine = document.getElementById("input-line");
  const terminalBody = document.getElementById("terminal-body");
  const commandBar = document.getElementById("command-bar");

  const history = [];
  let historyIndex = -1;

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
    { text: "Type 'help' or click a command below to get started.", delay: 100, cls: "color-comment" },
    { text: "", delay: 50 }
  ];

  function colorBootLine(text) {
    return text
      .replace(/^(\[[A-Z]+\])/, '<span class="color-comment">$1</span>')
      .replace(/(OK)$/, '<span class="color-green bold">$1</span>');
  }

  async function boot() {
    inputLine.classList.add("hidden");
    commandBar.style.visibility = "hidden";
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
    commandBar.style.visibility = "visible";
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

  // ── Click handling (command bar pills) ─────────────────────────
  commandBar.addEventListener("click", function (e) {
    const pill = e.target.closest(".cmd-pill");
    if (!pill) return;
    const cmd = pill.dataset.cmd;
    input.value = cmd;
    execute(cmd);
    input.focus();
  });

  // ── Click handling (inline clickable elements) ─────────────────
  output.addEventListener("click", function (e) {
    const el = e.target.closest(".clickable");
    if (!el) return;
    const cmd = el.dataset.cmd;
    if (cmd) {
      input.value = cmd;
      execute(cmd);
      input.focus();
    }
  });

  // ── Focus input on terminal click ──────────────────────────────
  terminalBody.addEventListener("click", function (e) {
    if (!e.target.closest(".clickable") && !e.target.closest("a")) {
      input.focus();
    }
  });

  // ── Start ──────────────────────────────────────────────────────
  boot();
})();

# Terminal Portfolio Design Spec

## Overview

Convert the existing Jekyll-based academic portfolio site into a single-page terminal UI styled GitHub Pages site. The site uses a hybrid interaction model: a real terminal with typed commands combined with persistent clickable command buttons and inline clickable elements.

## Tech Stack

- Pure HTML/CSS/JS (no frameworks, no build tools, no Jekyll)
- Deployed on GitHub Pages as static files

## File Structure

```
index.html          # Single page, all markup
css/terminal.css    # Dracula-themed terminal styling
js/terminal.js      # Command parsing, output rendering, boot sequence
js/data.js          # All content as JS objects
files/cv/           # CV PDF for download
images/             # Profile picture
```

## Theme: Dracula

| Role                  | Color     |
|-----------------------|-----------|
| Background            | `#282a36` |
| Foreground/text       | `#f8f8f2` |
| Prompt/commands       | `#50fa7b` (green) |
| Headings/labels       | `#bd93f9` (purple) |
| Links/clickable       | `#8be9fd` (cyan) |
| Highlights/important  | `#ffb86c` (orange) |
| Errors                | `#ff5555` (red) |
| Subtle/comments       | `#6272a4` (comment gray) |

**Typography:** `'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace`

## Terminal Chrome

- Window-like container with a title bar
- Three dots (red/yellow/green) in the title bar
- Title text: `v3rm1@portfolio:~$`
- Blinking cursor on the input line
- No CRT/scanline effects (clean look)

## Boot Sequence

On page load, a simulated startup plays line by line (~2-3 seconds total):

```
[BIOS] v3rm1 systems v1.0
[BOOT] Loading kernel............. OK
[INIT] Mounting filesystem......... OK
[INIT] Starting network........... OK
[AUTH] User authenticated: guest
[SYS]  Loading profile: Varun Ravi Varma
[SYS]  Session started.

Welcome to v3rm1's portfolio terminal.
Type 'help' or click a command below to get started.
```

After completion, the prompt appears with blinking cursor.

## Commands

### `help`
Lists all available commands with one-line descriptions in a table format.

### `about`
Displays bio text (from updated CV personal profile). Inline clickable suggestions at bottom: `[cv] [projects] [skills]`

### `projects`
Lists all projects with index numbers and titles. Each project name is clickable. Shows hint: `Type 'project <name>' to view details`

Projects included:
- **Research Projects:**
  - `thesis` - Interpretable RL with Regression Tsetlin Machine
  - `cogn_mod` - Cognitive Modelling: Basic Principles and Methods
  - `deep_learning` - Deep Learning: Reinforcement Learning with Confidence Estimation
  - `ml_bach` - Machine Learning: Completing the Unfinished Bach Fugue
- **Personal Projects:**
  - `road_sign` - HackerEarth: Road Sign Detection
  - `ad_click` - HackerEarth: Ad Click Prediction
  - `product_rec` - HackerEarth: Product Recognition
  - `network_attack` - HackerEarth: Network Attack Prediction
  - `awesummly` - Awesummly: Topic Modelling

### `project <name>`
Shows full project description with tech stack and a clickable `[View on GitHub]` link in cyan (where applicable).

### `cv`
Renders CV in sections: Education, Experience, Teaching. Includes clickable `[Download PDF]` link.

### `skills`
Shows categorized skills:
- **Tools:** Analytics & BI, OS & Environments, Databases
- **Programming:** Languages, Frameworks
- **Core Competencies**

Uses Dracula colors to group categories (purple headings, orange sub-categories).

### `publications`
Lists 4 publications with titles, venues, DOI links (clickable cyan), and one-line descriptions:
1. Noise Robustness Through Abstractions... (IEEE Transactions - Under Review)
2. CACTUS (ACM TIST, DOI: 10.1145/3649459)
3. SANDA (Elsevier J. Info Sciences, DOI: 10.2139/ssrn.4364273)
4. Adaptive Pandemic Analysis (FAIEMA 2024)

### `contact`
Shows contact info and social links as clickable cyan links:
- Email: varunravivarma@gmail.com
- GitHub: v3rm1
- LinkedIn: Varun Ravi Varma
- ORCID: 0000-0003-1719-2478
- Location: Grimstad, Norway

### `clear`
Clears terminal output, keeps command bar.

### Unknown command
Red text: `command not found: <input>. Type 'help' for available commands.`

## Interaction Model

### Text Input
- Styled as terminal prompt: `v3rm1@portfolio:~$ ` with blinking cursor
- Enter key executes command
- Arrow up/down cycles through command history

### Clickable Elements
- All inline suggestions (e.g. `[cv]`, project names) execute the command on click
- The command text appears typed in the prompt, then output renders (maintains terminal illusion)

### Persistent Command Bar
- Fixed at the bottom of the viewport
- Pill/button style showing: `help` `about` `projects` `cv` `skills` `publications` `contact` `clear`
- Clicking a pill executes that command (same behavior as inline clicks)

### Scrolling
- Terminal output scrolls naturally
- New output auto-scrolls to bottom
- User can scroll up to review previous output

### Mobile
- Command bar wraps to two rows if needed
- Terminal container fills viewport
- Command bar is primary interaction method on mobile

### Responsive
- Single column, full-width terminal
- Title bar adapts text size on small screens
- Minimum comfortable font size maintained

## Content Source

All content from the updated CV PDF (VRVarma_Academic_CV-2.pdf) plus existing portfolio markdown files for the 3 academic projects (cogn_mod, deep_learning, ml_bach).

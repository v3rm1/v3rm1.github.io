// Shared simulation helpers for the interactive OJS widgets in the blog posts.
// Pure computation only: plotting lives in the OJS cells of each post.

// ── Seeded randomness ──────────────────────────────────────────────

// mulberry32: small, fast 32-bit PRNG, so every widget run is reproducible.
export function makeRng(seed = 42) {
  let a = seed >>> 0;
  const random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let spare = null;
  // Box-Muller, caching the second variate.
  const normal = (mean = 0, sd = 1) => {
    if (spare !== null) {
      const z = spare;
      spare = null;
      return mean + sd * z;
    }
    let u = 0;
    while (u === 0) u = random();
    const v = random();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return mean + sd * r * Math.cos(2 * Math.PI * v);
  };
  const int = (n) => Math.floor(random() * n);
  const choice = (arr) => arr[int(arr.length)];
  return { random, normal, int, choice };
}

// Index of the largest entry, ties broken uniformly at random.
export function argmaxRandom(values, rng, n = values.length) {
  let best = -Infinity;
  let count = 0;
  let pick = 0;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v > best + 1e-12) {
      best = v;
      pick = i;
      count = 1;
    } else if (Math.abs(v - best) <= 1e-12) {
      count += 1;
      if (rng.random() * count < 1) pick = i;
    }
  }
  return pick;
}

// Trailing moving average (shorter window at the start).
export function rolling(values, window) {
  const out = new Float64Array(values.length);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    out[i] = sum / Math.min(i + 1, window);
  }
  return out;
}

// ── Theme ──────────────────────────────────────────────────────────

const currentTheme = () =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

// Use with Generators.observe: re-emits whenever the navbar toggle flips data-theme.
export function observeTheme(notify) {
  notify(currentTheme());
  const mo = new MutationObserver(() => notify(currentTheme()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

// Tokyo Night (dark) and Tokyo Night Day (light) accents.
export function palette(theme) {
  return theme === "light"
    ? { blue: "#2e7de9", green: "#587539", orange: "#b15c00", magenta: "#9854f1", cyan: "#007197", red: "#c64343", muted: "#6172b0", grid: "#b4b5ba", bg: "#d5d6db", fg: "#343b58" }
    : { blue: "#7aa2f7", green: "#9ece6a", orange: "#ff9e64", magenta: "#bb9af7", cyan: "#7dcfff", red: "#f7768e", muted: "#7a82ab", grid: "#3b4261", bg: "#16161e", fg: "#c0caf5" };
}

// ── Tic-tac-toe ────────────────────────────────────────────────────

// Board: array of 9 cells, 1 = X (agent), -1 = O (opponent), 0 = empty.
export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// 1 or -1 for a win, 0 for a draw, null while the game is ongoing.
export function winner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.includes(0) ? null : 0;
}

export const boardKey = (board) => board.join(",");

const terminalValue = (w) => (w === 1 ? 1 : w === -1 ? 0 : 0.5);

// V of an afterstate (board right after the agent has moved).
export function afterstateValue(values, board) {
  const w = winner(board);
  if (w !== null) return terminalValue(w);
  const v = values.get(boardKey(board));
  return v === undefined ? 0.5 : v;
}

// Value of every legal move for X, as {cell, value}.
export function moveValues(values, board) {
  const out = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] !== 0) continue;
    board[i] = 1;
    out.push({ cell: i, value: afterstateValue(values, board) });
    board[i] = 0;
  }
  return out;
}

export function greedyMove(values, board, rng) {
  const mv = moveValues(values, board);
  return mv[argmaxRandom(mv.map((m) => m.value), rng)].cell;
}

// Tabular TD(0) over afterstates (Sutton & Barto §1.5), agent X moves first
// against a uniformly random opponent O. Exploratory moves are not learnt from.
// history[e] holds 1 (win), 0 (draw) or -1 (loss) for episode e.
export function trainTicTacToe({ episodes = 5000, alpha = 0.1, epsilon = 0.1, seed = 42 } = {}) {
  const rng = makeRng(seed);
  const values = new Map();
  const history = new Int8Array(episodes);
  const setV = (key, v) => values.set(key, v);
  const getV = (key) => {
    const v = values.get(key);
    return v === undefined ? 0.5 : v;
  };

  for (let ep = 0; ep < episodes; ep++) {
    const board = new Array(9).fill(0);
    let prevKey = null; // last greedy afterstate, waiting for its TD target
    let result = null;

    while (result === null) {
      const empty = [];
      for (let i = 0; i < 9; i++) if (board[i] === 0) empty.push(i);
      const explore = rng.random() < epsilon;
      const cell = explore ? rng.choice(empty) : greedyMove(values, board, rng);
      board[cell] = 1;
      const target = afterstateValue(values, board);
      if (prevKey !== null && !explore) setV(prevKey, getV(prevKey) + alpha * (target - getV(prevKey)));
      prevKey = explore ? null : boardKey(board);

      result = winner(board);
      if (result !== null) break;

      const oppEmpty = [];
      for (let i = 0; i < 9; i++) if (board[i] === 0) oppEmpty.push(i);
      board[rng.choice(oppEmpty)] = -1;
      result = winner(board);
      // Opponent ended the game: back the outcome up into our last afterstate.
      if (result !== null && prevKey !== null) {
        const v = getV(prevKey);
        setV(prevKey, v + alpha * (terminalValue(result) - v));
      }
    }
    history[ep] = result;
  }
  return { values, history };
}

// ── Symmetry quotient (tier-3 abstraction) ─────────────────────────

// Each transform maps a cell index of the new board to one in the old board.
const ROT = [6, 3, 0, 7, 4, 1, 8, 5, 2];
const FLIP = [2, 1, 0, 5, 4, 3, 8, 7, 6];
const compose = (p, q) => p.map((i) => q[i]);
const ID = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const R1 = ROT, R2 = compose(ROT, ROT), R3 = compose(R2, ROT);

export const SYMMETRY_GROUPS = {
  "none (identity)": [ID],
  "mirror (left-right)": [ID, FLIP],
  "rotations C4": [ID, R1, R2, R3],
  "full dihedral D4": [ID, R1, R2, R3, FLIP, compose(FLIP, R1), compose(FLIP, R2), compose(FLIP, R3)],
};

// Counts positions reachable from the empty board in legal play (X first),
// raw and up to the chosen symmetry group.
export function countStates(group) {
  const seen = new Set();
  const classes = new Set();
  const board = new Array(9).fill(0);
  const canonical = () => {
    let best = null;
    for (const g of group) {
      const k = g.map((i) => board[i] + 1).join("");
      if (best === null || k < best) best = k;
    }
    return best;
  };
  const visit = (player) => {
    const key = board.join("");
    if (seen.has(key)) return;
    seen.add(key);
    classes.add(canonical());
    if (winner(board) !== null) return;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== 0) continue;
      board[i] = player;
      visit(-player);
      board[i] = 0;
    }
  };
  visit(1);
  return { raw: seen.size, reduced: classes.size };
}

// ── k-armed bandit testbed ─────────────────────────────────────────

// Averages over `runs` independent bandit problems (Sutton & Barto §2.3).
// method: "egreedy" {epsilon, alpha (null = sample average), q0}
//         "ucb"     {c}
//         "gradient" {alpha, baseline}
// q* ~ N(offset, 1) per arm; with nonstationary, q* starts at offset and
// takes N(0, 0.01²) random-walk steps (Exercise 2.5).
export function runTestbed({
  method = "egreedy", k = 10, steps = 1000, runs = 300, seed = 1,
  nonstationary = false, offset = 0,
  epsilon = 0.1, alpha = null, q0 = 0, c = 2, baseline = true,
} = {}) {
  const rng = makeRng(seed);
  const reward = new Float64Array(steps);
  const optimal = new Float64Array(steps);
  const q = new Float64Array(k);
  const Q = new Float64Array(k);
  const N = new Float64Array(k);
  const H = new Float64Array(k);
  const pi = new Float64Array(k);
  const scores = new Float64Array(k);

  for (let r = 0; r < runs; r++) {
    for (let a = 0; a < k; a++) {
      q[a] = nonstationary ? offset : rng.normal(offset, 1);
      Q[a] = q0;
      N[a] = 0;
      H[a] = 0;
    }
    let meanReward = 0;

    for (let t = 0; t < steps; t++) {
      let action;
      if (method === "ucb") {
        for (let a = 0; a < k; a++) {
          scores[a] = N[a] === 0 ? Infinity : Q[a] + c * Math.sqrt(Math.log(t + 1) / N[a]);
        }
        action = argmaxRandom(scores, rng);
      } else if (method === "gradient") {
        let maxH = -Infinity;
        for (let a = 0; a < k; a++) maxH = Math.max(maxH, H[a]);
        let z = 0;
        for (let a = 0; a < k; a++) {
          pi[a] = Math.exp(H[a] - maxH);
          z += pi[a];
        }
        let u = rng.random() * z;
        action = k - 1;
        for (let a = 0; a < k; a++) {
          u -= pi[a];
          if (u < 0) {
            action = a;
            break;
          }
        }
        for (let a = 0; a < k; a++) pi[a] /= z;
      } else {
        action = rng.random() < epsilon ? rng.int(k) : argmaxRandom(Q, rng);
      }

      let best = 0;
      for (let a = 1; a < k; a++) if (q[a] > q[best]) best = a;
      const R = rng.normal(q[action], 1);
      reward[t] += R;
      if (action === best) optimal[t] += 1;

      if (method === "gradient") {
        // Baseline is the mean of rewards before this step (S&B §2.8).
        const b = baseline ? (t === 0 ? R : meanReward) : 0;
        for (let a = 0; a < k; a++) {
          H[a] += alpha * (R - b) * ((a === action ? 1 : 0) - pi[a]);
        }
        meanReward += (R - meanReward) / (t + 1);
      } else {
        N[action] += 1;
        const step = alpha === null ? 1 / N[action] : alpha;
        Q[action] += step * (R - Q[action]);
      }

      if (nonstationary) for (let a = 0; a < k; a++) q[a] += rng.normal(0, 0.01);
    }
  }
  for (let t = 0; t < steps; t++) {
    reward[t] /= runs;
    optimal[t] = (100 * optimal[t]) / runs;
  }
  return { reward, optimal };
}

// Long-format rows for Plot: one row per (series, bin), each bin averaging
// `every` consecutive steps to take the edge off the sampling noise.
export function toRows(series, every = 5) {
  const rows = [];
  for (const { name, reward, optimal } of series) {
    for (let t = 0; t < reward.length; t += every) {
      const end = Math.min(t + every, reward.length);
      let r = 0, o = 0;
      for (let i = t; i < end; i++) { r += reward[i]; o += optimal[i]; }
      rows.push({ series: name, step: end, reward: r / (end - t), optimal: o / (end - t) });
    }
  }
  return rows;
}

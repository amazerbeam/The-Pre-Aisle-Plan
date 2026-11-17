# Tasks: Pip's Path mockup (Play a game, picker, chapter map, Garden Path levels)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** One self-contained, playable mockup, `foodbytes-app/mockup/pips-path.html`, for the developer to approve before any app code exists:
- the Pip game entry (tap Pip, or a Games pill), the game picker and the chapter map
- the 10 solver-verified Garden Path levels, in a full skin per theme (Garden Path / Ember Trail / Circuit Run), with Pip walking, marking, talking and reacting
- clear and stuck states, the endless and Chapter 2 previews, and the capped sprinkle reward

A node smoke proves the pure logic. Nothing in the app changes.

**Spec:** `plan.md` in this folder. The developer approved it on 2026-11-17, after one revision for themed skins and Pip's role.

---

## File map

**Created:**
- `foodbytes-app/mockup/pips-path.html`: the mockup. Pure script blocks `pp-pip`, `pp-levels`, `pp-engine`, `pp-sequencer` and `pp-skins`, plus the DOM block `pp-ui`.
- `.claude/contract/2026-11-17-pips-path-mockup/mockup-smoke.mjs`: a node smoke covering the levels, engine, sequencer, rewards, skins, Pip render and token contrast.
- `.claude/contract/2026-11-17-pips-path-mockup/pr-description.md`

**Modified:**
- `foodbytes-app/mockup/README.md`: one table row for `pips-path.html`
- `foodbytes-app/client/package.json`: `version` only
- `foodbytes-app/foodbytes-api/pom.xml`: project `<version>` only
- `CHANGELOG.md`: one line

**Deleted:** (none)

### Conventions for every task

**Script blocks.** Each block is a `<script id="…">` with no `type` attribute, in this order:
1. `pp-pip`
2. `pp-levels`
3. `pp-engine`
4. `pp-sequencer`
5. `pp-skins`
6. `pp-ui`

The first five are **pure**: no `document`, `window`, `localStorage`, `matchMedia` or `requestAnimationFrame`. Only `pp-ui` touches the DOM.

**What the smoke may load.** It concatenates the five pure blocks and runs them in one `vm` context. Top-level `const`s are not context properties, so it appends a trailing expression that returns the names it tests.

**Names are fixed by `plan.md` → Data shapes:**
- `GARDEN_PATH_LEVELS`, `LEVEL_MAX_COLS`
- `parseLevel`, `neighbours`, `newRun`, `canStep`, `step`, `backtrackTo`, `undo`, `restart`, `isCleared`, `isStuck`, `keyToDelta`, `countSolutions`
- `FAMILIES`, `chapterQueue`, `nextPuzzle`, `REWARD`, `rewardFor`
- `THEME_LINE`, `SKIN_ART_KEYS`, `SKIN_LINE_KEYS`, `SKINS`, `lineFor`, `pipLineFor`

The skin keys are **`herb`, `dragon` and `robot`** (Pip lines), never theme ids.

**Live class names copied from `pip-room-chrome.html`:**
- `.pet-view`
- `.pet-bubble`, `.pet-bubble-text`, `.pet-bubble.is-asking`
- `.pip-checkin-btn`, `.pip-checkin-btn--primary`, `.pip-checkin-btn--link`
- `.pip-room-actions`, `.pip-room-action`
- `.pip-shop`, `.pip-shop-head`, `.pip-shop-icon-btn`, `.pip-shop-body`

New classes use the `pp-` prefix (e.g. `.pp-board`, `.pp-tile`, `.pp-map-node`).

**Touch and accessibility (react-frontend):**
- Every interactive element is at least 44 × 44 px, with `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent`.
- Hover lives in `@media (hover: hover)`, paired with `:active`. Outlines use `:focus-visible`.
- Icon-only buttons get an `aria-label`. Toggles are `<button aria-pressed>`.
- No `console.log`.
- The page works from 320 to 1280 px with no horizontal page scroll.

**Franchise rule.** No franchise names, marks, characters or lookalike art anywhere in the art or the game copy. Inspirations ("one-line fill puzzles", "cracked-ice gym floors in monster-catching RPGs") appear only in the notes panel, worded as in the epic.

**Run commands from the repo root** `E:\Webdesign\The-Pre-Aisle-Plan` in PowerShell.

---

## Phase 1 — Pure core and the smoke

This phase builds the file's pure script blocks and a smoke that proves them, before any screen exists. It is a safe stopping point: the HTML opens, it shows a placeholder "Pip's Path mockup: screens arrive in Phase 2" heading, and the smoke is green.

### Task 1: Scaffold the file with levels, engine and sequencer ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/mockup/pips-path.html`

- [x] **Step 1: Write the HTML skeleton**

The file opens with `<!doctype html>`, `<html lang="en">`, a `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` and `<title>Pip's Path mockup</title>`. It has an empty `<style>` and a `<main id="app"><h1>Pip's Path mockup</h1><p>Screens arrive in Phase 2.</p></main>`, followed by the six script blocks in the order above. `pp-pip`, `pp-skins` and `pp-ui` hold only a comment for now.

- [x] **Step 2: Write `pp-levels` verbatim from plan.md → Data shapes → Levels**

```js
const GARDEN_PATH_LEVELS = [
  { id: 'garden-01', family: 'garden-path', kind: 'core', solutions: 8,  rows: ['S..', '...', '...'] },
  { id: 'garden-02', family: 'garden-path', kind: 'core', solutions: 12, rows: ['....', '..S.', '....'] },
  { id: 'garden-03', family: 'garden-path', kind: 'core', solutions: 4,  rows: ['.#..', '....', '..S.', '....'] },
  { id: 'garden-04', family: 'garden-path', kind: 'core', solutions: 9,  rows: ['.....', '.....', '.....', 'S..#.'] },
  { id: 'garden-05', family: 'garden-path', kind: 'core', solutions: 7,  rows: ['.....', '.#...', '....S', '.....', '.#...'] },
  { id: 'garden-06', family: 'garden-path', kind: 'core', solutions: 1,  rows: ['..#..', '#....', '..#..', '....S', '.....'] },
  { id: 'garden-07', family: 'garden-path', kind: 'core', solutions: 6,  rows: ['.#....', '......', '......', '......', '.S#...'] },
  { id: 'garden-08', family: 'garden-path', kind: 'core', solutions: 1,  rows: ['......', '......', '......', '#....#', '......', '..S..#'] },
  { id: 'garden-09', family: 'garden-path', kind: 'core', solutions: 1,  rows: ['....#.', '..#.#.', '......', '.S....', '......', '...#..'] },
  { id: 'garden-10', family: 'garden-path', kind: 'core', solutions: 4,  rows: ['......', '......', '......', '..#..#', '....#.', '.S....', '...#..'] },
];
const LEVEL_MAX_COLS = 6; // 288 px ÷ 6 = 48 px tiles at 320 px
```

- [x] **Step 3: Write `pp-engine`**

Runs are immutable `{ path: number[] }`, and every operation returns a run. `countSolutions` is the pruned DFS the planner verified: it prunes on connectivity of the unvisited region and allows at most one dead end, because the end is free.

```js
function parseLevel(level) {
  const H = level.rows.length, W = level.rows[0].length, open = [];
  let start = -1, total = 0;
  level.rows.forEach((row, y) => [...row].forEach((c, x) => {
    const i = y * W + x; open[i] = c !== '#';
    if (open[i]) total++;
    if (c === 'S') start = i;
  }));
  return { id: level.id, W, H, open, start, total };
}
function neighbours(grid, i) {
  const { W, H, open } = grid, x = i % W, y = Math.floor(i / W), out = [];
  if (x > 0) out.push(i - 1); if (x < W - 1) out.push(i + 1);
  if (y > 0) out.push(i - W); if (y < H - 1) out.push(i + W);
  return out.filter(j => open[j]);
}
const newRun = (grid) => ({ path: [grid.start] });
const head = (run) => run.path[run.path.length - 1];
const canStep = (grid, run, j) => grid.open[j] === true && !run.path.includes(j) && neighbours(grid, head(run)).includes(j);
const step = (grid, run, j) => (canStep(grid, run, j) ? { path: [...run.path, j] } : run);
function backtrackTo(run, j) { const k = run.path.indexOf(j); return k < 0 ? run : { path: run.path.slice(0, k + 1) }; }
const undo = (run) => (run.path.length > 1 ? { path: run.path.slice(0, -1) } : run);
const restart = (grid) => newRun(grid);
const isCleared = (grid, run) => run.path.length === grid.total;
const isStuck = (grid, run) => !isCleared(grid, run) && !neighbours(grid, head(run)).some(j => !run.path.includes(j));
const keyToDelta = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
function countSolutions(level, limit = 1e6) {
  const g = parseLevel(level), N = g.W * g.H, NB = Array.from({ length: N }, (_, i) => (g.open[i] ? neighbours(g, i) : []));
  const seen = new Uint8Array(N), mark = new Int32Array(N), path = [g.start];
  let count = 0, first = null, stamp = 0;
  seen[g.start] = 1;
  const viable = (cur, left) => {
    let dead = 0, any = -1;
    for (let i = 0; i < N; i++) {
      if (!g.open[i] || seen[i]) continue;
      any = i; let d = 0, adj = false;
      for (const j of NB[i]) { if (!seen[j]) d++; if (j === cur) adj = true; }
      if (d === 0 && !adj) return false;
      if (d === 1 && !adj && ++dead > 1) return false;
    }
    stamp++; const stack = [any]; mark[any] = stamp; let reached = 0;
    while (stack.length) { const i = stack.pop(); reached++; for (const j of NB[i]) if (!seen[j] && mark[j] !== stamp) { mark[j] = stamp; stack.push(j); } }
    return reached === left && NB[cur].some(j => !seen[j]);
  };
  const dfs = (cur, n) => {
    if (count >= limit) return;
    if (n === g.total) { count++; if (!first) first = path.slice(); return; }
    if (!viable(cur, g.total - n)) return;
    for (const j of NB[cur]) if (!seen[j]) { seen[j] = 1; path.push(j); dfs(j, n + 1); path.pop(); seen[j] = 0; }
  };
  dfs(g.start, 1);
  return { count, first };
}
```

- [x] **Step 4: Write `pp-sequencer`**

`nextPuzzle` takes `rng` (a `() => number` in [0, 1)) so the smoke can seed it. `pools` is built from `GARDEN_PATH_LEVELS` plus, for the `ch2` preview, placeholder ids.

```js
const FAMILIES = [
  { id: 'garden-path', chapter: 1, name: 'Garden Path', shipped: true },
  { id: 'thin-ice',    chapter: 2, name: 'Thin Ice',    shipped: false },
];
const REWARD = { FIRST_CLEAR: 3, ENDLESS_CLEAR: 1, REPLAY: 0, DAILY_CAP: 10 };
function chapterQueue(chapter, pools) {
  const fam = FAMILIES.find(f => f.chapter === chapter);
  const refreshers = FAMILIES.filter(f => f.chapter < chapter).map(f => pools[f.id].refreshers[chapter - 2]);
  return [...pools[fam.id].core, ...refreshers];
}
function nextPuzzle(progress, pools, rng) {
  const shipped = FAMILIES.filter(f => f.shipped).sort((a, b) => a.chapter - b.chapter);
  for (const fam of shipped) {
    const id = chapterQueue(fam.chapter, pools).find(x => !progress.cleared.includes(x));
    if (id) return { id, mode: 'chapter', resetSeen: false };
  }
  const all = shipped.flatMap(f => chapterQueue(f.chapter, pools));
  if (all.length === 0) return null;
  let left = all.filter(x => !progress.endlessSeen.includes(x));
  const resetSeen = left.length === 0;
  if (resetSeen) left = all;
  return { id: left[Math.min(left.length - 1, Math.floor(rng() * left.length))], mode: 'endless', resetSeen };
}
function rewardFor(progress, { id, mode }, todayKey) {
  const base = mode === 'endless' ? REWARD.ENDLESS_CLEAR : progress.cleared.includes(id) ? REWARD.REPLAY : REWARD.FIRST_CLEAR;
  const room = Math.max(0, REWARD.DAILY_CAP - (progress.earned[todayKey] ?? 0));
  const amount = Math.min(base, room);
  return { amount, capped: amount < base };
}
```

`nextPuzzle` is pure: when the pool is used up it returns `resetSeen: true` and the caller clears `progress.endlessSeen`. The UI then pushes the drawn id onto `endlessSeen`. Amended at apply review: nextPuzzle is pure; the caller applies resetSeen.

- [x] **Step 5: Verify the file parses**

Run: `node -e "const s=require('fs').readFileSync('foodbytes-app/mockup/pips-path.html','utf8');const b=[...s.matchAll(/<script id=\"(pp-[a-z]+)\">([\s\S]*?)<\/script>/g)];console.log(b.map(m=>m[1]).join(','));new Function(b.slice(1,4).map(m=>m[2]).join('\n'))"`
Expected: `pp-pip,pp-levels,pp-engine,pp-sequencer,pp-skins,pp-ui` and no error.

### Task 2: Write the smoke for levels, engine, sequencer and rewards ✓

- Skill: react-frontend

**Files:**
- Create: `.claude/contract/2026-11-17-pips-path-mockup/mockup-smoke.mjs`

- [x] **Step 1: Write the loader and the assertions**

The script uses `node:fs`, `node:vm` and `node:assert/strict`, and has no dependencies.

```js
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../../../foodbytes-app/mockup/pips-path.html', import.meta.url), 'utf8');
const blocks = Object.fromEntries([...html.matchAll(/<script id="(pp-[a-z]+)">([\s\S]*?)<\/script>/g)].map(m => [m[1], m[2]]));
const PURE = ['pp-pip', 'pp-levels', 'pp-engine', 'pp-sequencer', 'pp-skins'];
for (const id of PURE) {
  assert.ok(id in blocks, `missing block ${id}`);
  assert.doesNotMatch(blocks[id], /\b(document|window|localStorage|matchMedia|requestAnimationFrame)\b/, `${id} must be pure`);
}
const names = ['GARDEN_PATH_LEVELS', 'LEVEL_MAX_COLS', 'parseLevel', 'neighbours', 'newRun', 'canStep', 'step', 'backtrackTo', 'undo', 'restart',
  'isCleared', 'isStuck', 'keyToDelta', 'countSolutions', 'FAMILIES', 'chapterQueue', 'nextPuzzle', 'REWARD', 'rewardFor'];
const optional = ['THEME_LINE', 'SKIN_ART_KEYS', 'SKIN_LINE_KEYS', 'SKINS', 'lineFor', 'pipLineFor', 'pip'];
const src = PURE.map(id => blocks[id]).join('\n;\n') + `\n;({ ${names.join(', ')}, ${optional.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ')} })`;
const X = vm.runInNewContext(src, {});

// Levels
assert.equal(X.GARDEN_PATH_LEVELS.length, 10);
const ids = new Set();
for (const lv of X.GARDEN_PATH_LEVELS) {
  assert.ok(!ids.has(lv.id), `duplicate ${lv.id}`); ids.add(lv.id);
  assert.equal(lv.family, 'garden-path'); assert.equal(lv.kind, 'core');
  const w = lv.rows[0].length;
  assert.ok(lv.rows.every(r => r.length === w && /^[S.#]+$/.test(r)), `${lv.id} rows`);
  assert.ok(w <= X.LEVEL_MAX_COLS, `${lv.id} wider than ${X.LEVEL_MAX_COLS}`);
  assert.equal((lv.rows.join('').match(/S/g) || []).length, 1, `${lv.id} start`);
  const { count, first } = X.countSolutions(lv);
  assert.equal(count, lv.solutions, `${lv.id} solution count`);
  // Replay the first solution through the engine: every step legal, ends cleared.
  const g = X.parseLevel(lv); let run = X.newRun(g);
  for (const j of first.slice(1)) { assert.ok(X.canStep(g, run, j), `${lv.id} illegal step ${j}`); run = X.step(g, run, j); }
  assert.ok(X.isCleared(g, run), `${lv.id} not cleared`);
}

// Engine rules on garden-03 ('.#..','....','..S.','....', W=4, start=10)
{
  const g = X.parseLevel(X.GARDEN_PATH_LEVELS[2]); let r = X.newRun(g);
  assert.equal(g.start, 10); assert.equal(g.total, 15);
  assert.equal(X.step(g, r, 12), r, 'non-adjacent step refused');
  assert.equal(X.step(g, r, 1), r, 'rock refused');
  r = X.step(g, r, 9); r = X.step(g, r, 5);
  assert.deepEqual(r.path, [10, 9, 5]);
  assert.equal(X.step(g, r, 9), r, 'revisit refused');
  assert.deepEqual(X.undo(r).path, [10, 9]);
  assert.deepEqual(X.backtrackTo(r, 10).path, [10]);
  assert.deepEqual(X.undo(X.newRun(g)).path, [10], 'undo never below start');
  assert.deepEqual(X.restart(g).path, [10]);
  // Stuck: walk into the top-left corner pocket: 10→9→8→4→0, whose only neighbour (1) is a rock.
  let s = X.newRun(g); for (const j of [9, 8, 4, 0]) s = X.step(g, s, j);
  assert.ok(X.isStuck(g, s) && !X.isCleared(g, s), 'stuck detected');
}

// Sequencer
const pools = { 'garden-path': { core: X.GARDEN_PATH_LEVELS.map(l => l.id), refreshers: ['garden-r1', 'garden-r2'] },
                'thin-ice': { core: Array.from({ length: 10 }, (_, i) => `thin-ice-${String(i + 1).padStart(2, '0')}`), refreshers: ['thin-ice-r1'] } };
assert.equal(X.chapterQueue(1, pools).length, 10);
assert.deepEqual(X.chapterQueue(2, pools).slice(-1), ['garden-r1']);
assert.equal(X.chapterQueue(2, pools).length, 11);
let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
assert.deepEqual(X.nextPuzzle({ cleared: [], endlessSeen: [], earned: {} }, pools, rng), { id: 'garden-01', mode: 'chapter', resetSeen: false });
assert.deepEqual(X.nextPuzzle({ cleared: ['garden-01', 'garden-02', 'garden-03'], endlessSeen: [], earned: {} }, pools, rng), { id: 'garden-04', mode: 'chapter', resetSeen: false });
{
  const p = { cleared: [...pools['garden-path'].core], endlessSeen: [], earned: {} }, drawn = new Set();
  for (let i = 0; i < 10; i++) { const n = X.nextPuzzle(p, pools, rng); assert.equal(n.mode, 'endless'); assert.ok(!drawn.has(n.id), 'no repeat before pool used'); drawn.add(n.id); p.endlessSeen.push(n.id); }
  assert.equal(drawn.size, 10);
  const again = X.nextPuzzle(p, pools, rng); assert.equal(again.mode, 'endless'); assert.equal(again.resetSeen, true, 'pool used up: caller resets'); assert.equal(p.endlessSeen.length, 10, 'nextPuzzle never mutates progress');
}

// Rewards
{
  const day = '2026-11-17', p = { cleared: [], endlessSeen: [], earned: {} };
  assert.deepEqual(X.rewardFor(p, { id: 'garden-01', mode: 'chapter' }, day), { amount: 3, capped: false });
  assert.deepEqual(X.rewardFor({ ...p, cleared: ['garden-01'] }, { id: 'garden-01', mode: 'chapter' }, day), { amount: 0, capped: false });
  assert.deepEqual(X.rewardFor(p, { id: 'garden-02', mode: 'endless' }, day), { amount: 1, capped: false });
  assert.deepEqual(X.rewardFor({ ...p, earned: { [day]: 9 } }, { id: 'garden-02', mode: 'chapter' }, day), { amount: 1, capped: true });
  assert.deepEqual(X.rewardFor({ ...p, earned: { [day]: 10 } }, { id: 'garden-02', mode: 'chapter' }, day), { amount: 0, capped: true });
}

export { X, html, blocks }; // Task 4 and Task 9 extend below this line
console.log(`Pip's Path core OK: ${X.GARDEN_PATH_LEVELS.length} levels, engine, sequencer, rewards`);
```

- [x] **Step 2: Run the smoke**

Run: `node .claude\contract\2026-11-17-pips-path-mockup\mockup-smoke.mjs`
Expected: `Pip's Path core OK: 10 levels, engine, sequencer, rewards` and exit code 0.
Amended at apply: deepEqual compares JSON-normalised vm output (cross-realm prototypes).

---

## Phase 2 — Pip and the skins

This phase adds the live Pip art and the three game skins as pure data, and extends the smoke over them. It is a safe stopping point: no screens use them yet, and the smoke stays green.

### Task 3: Copy the live Pip drawing code into `pp-pip` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`pp-pip` block)

- [x] **Step 1: Copy lines 209–1160 of `foodbytes-app/mockup/pip-themed-lines.html` verbatim**

The copy runs from the comment after `<script>` ("Shared space: every line draws in 200 units…") through `const hatMiniViewBox = …;`. It defines `pip(line, fi, mood, outfit, opts)` and everything it calls (`LINES`, `LINE_COPY`, `formName`, `MOOD_LABELS`, `WARDROBE`, the wardrobe drawers, `props`, `headBarY`). Put a first-line comment in front: `/* Copied verbatim from pip-themed-lines.html lines 209–1160 (2026-11-17). Do not edit here. */`. Do not copy anything from line 1161 on (growth policy and DOM code).

- [x] **Step 2: Verify it is pure and renders all three lines**

Run: `node -e "const s=require('fs').readFileSync('foodbytes-app/mockup/pips-path.html','utf8');const b=s.match(/<script id=\"pp-pip\">([\s\S]*?)<\/script>/)[1];const out=new Function(b+';return [\"herb\",\"dragon\",\"robot\"].map(l=>pip(l,1,\"happy\",{}))')();console.log(out.map(x=>x.length+(/NaN|undefined/.test(x)?' BAD':' ok')).join(' '))"`
Expected: three lengths, each followed by ` ok`.

### Task 4: Write the three skins in `pp-skins` and extend the smoke ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`pp-skins` block)
- Modify: `.claude/contract/2026-11-17-pips-path-mockup/mockup-smoke.mjs`

- [x] **Step 1: Write `THEME_LINE`, the key lists, `lineFor` and `pipLineFor`**

```js
const THEME_LINE = { default: 'herb', parchment: 'dragon', cyberpunk: 'robot' }; // mirrors THEMES[].pipLine
const SKIN_ART_KEYS = ['board', 'tile', 'mark', 'rock', 'start'];
const SKIN_LINE_KEYS = ['intro', 'half', 'stuck', 'cleared'];
const lineFor = (themeId) => THEME_LINE[themeId] ?? 'herb';
function pipLineFor(run, grid) {
  if (isCleared(grid, run)) return 'cleared';
  if (isStuck(grid, run)) return 'stuck';
  return run.path.length >= Math.ceil(grid.total / 2) ? 'half' : 'intro';
}
```

- [x] **Step 2: Write `SKINS` with art for every key**

Each `art` entry is a complete `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">…</svg>` string with its own literal palette. The marks carry the class hooks the celebrations animate: `pp-mark` on the mark's root group, and `pp-mark-bloom` / `pp-mark-flame` / `pp-mark-led` on the part that changes when cleared. Titles, goals, `trail`, `celebrate`, `stuckFx` and `lines` are exactly as in `plan.md` → Data shapes → Skins:

| key | `herb` (Garden Path) | `dragon` (Ember Trail) | `robot` (Circuit Run) |
|---|---|---|---|
| `board` | wood-plank frame `#8a5a35` / `#6e4526`, a soil inset `#5b3a24` | stone border `#6d6457` with a rim `#4a4239`, faint parchment map lines `#c9b48a` at 0.25 opacity | dark PCB `#0e1a14` with gold traces `#c8a24a` |
| `tile` | soil square `#7a4f30`, a seed dot `#d9c08a` | flagstone `#b9ad96`, cracks `#8c8170` | node pad `#1b2a33`, ring `#2f4552` |
| `mark` | sprout: stem `#4f9a3a` + two leaves `#7cc95a`, with a hidden flower `.pp-mark-bloom` (petals `#f7a8c8`, centre `#ffd34d`) | ember: coals `#7a2e12` + a flame `.pp-mark-flame` (`#ff8a2a`, core `#ffd34d`) | lit pad: ring `#37e6ff`, an LED dot `.pp-mark-led` (`#9cff6a`) |
| `rock` | terracotta flower pot `#c8693f` with a rim `#a8532f` and a little plant | grey boulder `#857c70` with a gold coin `#e3c35a` | capacitor block `#2a3642` with a stripe `#ff5fa2` |
| `start` | watering can `#5b85c4` | twig nest `#8a6a3e` with a shell fleck `#fffaf3` | charging dock `#22303f` with a bolt `#ffd34d` |

`trail` style keys: `path` is a dashed `#d9c08a` line 6 wide, `ember` is `#ff8a2a` 5 wide with an orange glow filter, and `trace` is `#37e6ff` 4 wide with a cyan glow filter. The glow filters sit in `.pp-trail-glow`, which Low FX drops.

- [x] **Step 3: Extend the smoke with the skins and Pip checks**

Append above the final `console.log` in `mockup-smoke.mjs`:

```js
// Skins
assert.deepEqual(Object.keys(X.SKINS).sort(), ['dragon', 'herb', 'robot']);
assert.deepEqual(X.THEME_LINE, { default: 'herb', parchment: 'dragon', cyberpunk: 'robot' });
assert.equal(X.lineFor('nope'), 'herb');
const titles = new Set();
for (const [line, skin] of Object.entries(X.SKINS)) {
  titles.add(skin.title);
  for (const k of X.SKIN_ART_KEYS) { assert.match(skin.art[k], /^<svg[^>]*viewBox="0 0 48 48"[\s\S]*<\/svg>$/, `${line}.art.${k}`); assert.doesNotMatch(skin.art[k], /NaN|undefined/, `${line}.art.${k} clean`); }
  for (const k of X.SKIN_LINE_KEYS) assert.ok(typeof skin.lines[k] === 'string' && skin.lines[k].length > 0, `${line}.lines.${k}`);
  assert.match(skin.art.mark, /pp-mark-(bloom|flame|led)/, `${line} mark hook`);
  assert.ok(['path', 'ember', 'trace'].includes(skin.trail));
  const svg = X.pip(line, 1, 'happy', {}); assert.doesNotMatch(svg, /NaN|undefined/, `${line} pip`);
}
assert.equal(titles.size, 3, 'skin titles distinct');
assert.deepEqual([...titles].sort(), ['Circuit Run', 'Ember Trail', 'Garden Path']);
{ // pipLineFor on garden-01 (9 tiles: half at 5)
  const g = X.parseLevel(X.GARDEN_PATH_LEVELS[0]); let r = X.newRun(g);
  assert.equal(X.pipLineFor(r, g), 'intro');
  for (const j of [1, 2, 5, 4]) r = X.step(g, r, j); assert.equal(X.pipLineFor(r, g), 'half');
  for (const j of [3, 6, 7, 8]) r = X.step(g, r, j); assert.equal(X.pipLineFor(r, g), 'cleared');
}
// No franchise names in the page's game copy
assert.doesNotMatch(html.replace(/<aside class="pp-notes"[\s\S]*?<\/aside>/, ''), /pok[eé]mon|sootopolis|flow free|rush hour|lights out|sokoban|baba is you/i, 'franchise names only in the notes panel');
```

- [x] **Step 4: Run the smoke**

Run: `node .claude\contract\2026-11-17-pips-path-mockup\mockup-smoke.mjs`
Expected: `Pip's Path core OK: 10 levels, engine, sequencer, rewards`, exit 0.

---

## Phase 3 — Screens

This phase builds the visible mockup in `pp-ui` and the CSS. Each task adds screens on top of the frame from Task 5 and leaves the page opening with no console errors. A screen not built yet shows "Screen coming in Task N". The smoke still passes after every task, because it only reads the pure blocks.

### Task 5: Frame, theme tokens, control panel and deep links ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`<style>`, `<main>`, `pp-ui`)

- [x] **Step 1: Copy the theme token blocks and the live room CSS**

From `foodbytes-app/mockup/pip-room-chrome.html`, copy into `<style>` verbatim:
- the three `.frame[data-theme="default"|"parchment"|"cyberpunk"] { … }` token blocks (from line 11 to the closing `}` at line 262)
- the rules for `.pet-view`, `.pet-bubble`, `.pet-bubble::after`, `.pet-bubble-text`, `.pet-bubble.is-asking` and `.pet-bubble:focus`
- the rules for `.pip-checkin-btn` and its modifiers and states
- the rules for `.pip-room-actions` and `.pip-room-action`
- the rules for `.pip-shop`, `.pip-shop-head`, `.pip-shop-head h3`, `.pip-shop-icon-btn` and `.pip-shop-body`

Find each group by its selector, and put the comment `/* from pip-room-chrome.html (live class names) */` above each group.

- [x] **Step 2: Add the proposed `--pp-*` role tokens to each frame block**

Add these 13 tokens inside each of the three frame blocks, each value a `#rrggbb` hex (the smoke parses them):
`--pp-board-bg`, `--pp-tile-bg`, `--pp-tile-border`, `--pp-tile-visited-bg`, `--pp-trail`, `--pp-trail-glow`, `--pp-rock`, `--pp-start-ring`, `--pp-node-cleared-bg`, `--pp-node-current-ring`, `--pp-node-locked-bg`, `--pp-node-text`, `--pp-hud-text`.
- In Default and Parchment, `--pp-trail-glow` takes the same hex as `--pp-trail`. The CSS uses the glow only under `[data-theme="cyberpunk"]`.

Starting values (contrast is checked in Task 9):

| token | default | parchment | cyberpunk |
|---|---|---|---|
| `--pp-board-bg` | `#f3efe6` | `#efe0c0` | `#05070b` |
| `--pp-tile-bg` | `#7a4f30` | `#b9ad96` | `#1b2a33` |
| `--pp-tile-border` | `#5b3a24` | `#8c8170` | `#2f4552` |
| `--pp-tile-visited-bg` | `#8f6440` | `#cdb98f` | `#10303a` |
| `--pp-trail` | `#d9c08a` | `#ff8a2a` | `#37e6ff` |
| `--pp-trail-glow` | `#d9c08a` | `#ff8a2a` | `#37e6ff` |
| `--pp-rock` | `#c8693f` | `#857c70` | `#2a3642` |
| `--pp-start-ring` | `#4a3f80` | `#8b1e1e` | `#ff5fa2` |
| `--pp-node-cleared-bg` | `#1b6b2e` | `#3b2415` | `#9cff6a` |
| `--pp-node-current-ring` | `#4a3f80` | `#8b1e1e` | `#37e6ff` |
| `--pp-node-locked-bg` | `#e9ecef` | `#d8c7a3` | `#1b2a33` |
| `--pp-node-text` | `#2c3e50` | `#3b2415` | `#e6f7ff` |
| `--pp-hud-text` | `#2c3e50` | `#3b2415` | `#e6f7ff` |

Text on a cleared node uses `--on-brand` in Default and Parchment and `#05070b` in Cyberpunk. That colour is set as `--pp-node-cleared-text` in each block, and the smoke checks it too.

- [x] **Step 3: Build the control panel and the hash state**

`pp-ui` keeps one `state` object, `{ theme, screen, lv, preset, width, entry, lowfx, rm, sol }`, with the defaults `default`, `room`, `1`, `three`, `both`, `a`, `false`, `false`, `false`. It defines:
- `readHash()`: parses `location.hash` keys `theme`, `s`, `lv`, `p`, `w`, `entry`, `lowfx`, `rm` and `sol`, falling back to the default for any unknown value.
- `writeHash()`: mirrors `state` back into the hash.
- `render()`: draws the frames.

The control panel `<nav class="pp-controls" aria-label="Mockup controls">` holds button groups for every key, each a `<button aria-pressed>` of at least 44 px:
- **Screen:** Room, Offer, Picker, Map, Board, Cleared, Stuck, Endless, Ch 2
- **Level:** 1–10
- **Progress:** New, 3 cleared, All cleared, Ch 2 preview
- **Theme:** Default, Parchment, Cyberpunk
- **Width:** 375, 1280, Both
- **Entry:** A tap Pip, B Games pill
- **Toggles:** Low FX, Reduced motion, Show a solution

`render()` draws one `.frame[data-theme]` per requested width (`style="width:375px"` / `1280px`, `max-width:100%`), each holding a `.pet-view` with a `.pp-room` band. The frame gets `class="lowfx"` when Low FX is on and `class="is-still"` when reduced motion is on or `matchMedia('(prefers-reduced-motion: reduce)')` matches.

- [x] **Step 4: Check it in a browser** (static equivalent only: script syntax check + jsdom harness, no real browser; visual check remains manual)

Open `foodbytes-app/mockup/pips-path.html#theme=parchment&w=both`.
Expected:
- The controls show, with Parchment pressed.
- Two frames, 375 px and 1280 px, are drawn in Parchment tokens. Each reads "Screen coming in Task 6".
- No console errors.
- No horizontal scroll at a 320 px window.

### Task 6: Room, offer (option A and B) and the game picker ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`<style>`, `pp-ui`)

- [x] **Step 1: Room and option A, tap Pip**

`screenRoom()` draws:
- a room band (a soft gradient from `--bg-secondary`, labelled "Room art: see pip-room-dragon.html" and so on, by line, as in `pip-room-chrome.html`)
- Pip, from `pip(lineFor(state.theme), 1, 'content', {})`, standing on the rug at the lower left, wrapped in `<button type="button" class="pp-pip-btn" aria-label="Play with Basil">`. The button is at least 72 × 96 px, transparent, with a `:focus-visible` ring in `--pip-focus-ring`.
- a `.pet-bubble` holding the mood line ("Feeling good today 🌿" for herb, "Toasty and content 🔥" for dragon, "All systems nominal 🔋" for robot)
- the `.pip-room-actions` strip with Shop, Edit room and Wardrobe

Tapping `.pp-pip-btn` sets `screen = 'offer'`.

- [x] **Step 2: Offer bubble**

`screenOffer()` is the room with the bubble switched to `.pet-bubble.is-asking`. The text is "Play a game with me? 🎲", and the actions are a `.pip-checkin-actions` row holding `<button class="pip-checkin-btn pip-checkin-btn--primary">Play a game</button>` and `<button class="pip-checkin-btn pip-checkin-btn--link">Not now</button>`.
- **Play a game** opens the picker.
- **Not now** returns to `room`, showing the mood line again.
- A second demo, "Check-in open", is reachable from the Offer screen via a small `Show: check-in is asking` toggle. It shows the check-in question with No / Yes / Not now, and tapping Pip leaves it unchanged. That demonstrates the priority rule.

- [x] **Step 3: Option B, the Games pill**

When `state.entry === 'b'`, `.pp-pip-btn` is not rendered. The `.pip-room-actions` strip gains `<button class="pip-checkin-btn pip-room-action" aria-haspopup="dialog"><span aria-hidden="true">🎲</span> Games</button>` after Wardrobe, and it opens the picker directly.

- [x] **Step 4: Game picker sheet**

`screenPicker()` draws a `.pip-shop` sheet (`role="dialog" aria-modal="true" aria-labelledby`):
- **Head:** a `.pip-shop-head` with a `✕` close button (`aria-label="Close games"`) and `<h3>Games</h3>`.
- **Body:** a `.pip-shop-body` with two `.pp-game-card` buttons:
  - **Pip's Path card.** A 120 × 96 art area shows a 3×3 mini board in the current skin (using `SKINS[line].art.tile`, `.mark` and `.start`) with a small Pip (`pip(line, 1, 'happy', {}, { variant: 'mini' })`) on the centre tile. Beside it: the title "Pip's Path", the subtitle `${SKINS[line].title} · ${cleared} / 10` (or "Endless · random puzzles" when everything is cleared), and a progress bar.
  - **"More games soon" card.** A disabled `<button disabled>` with a 🎲 placeholder and the text "More of Pip's games are on the way".

Tapping Pip's Path opens `map`. The ✕ returns to `room`.

- [x] **Step 5: Check it in a browser** (static equivalent only: jsdom harness; visual and measured 44 px checks remain manual)

Open `pips-path.html#s=room&w=375` and step through all three themes.
Expected:
- Pip is drawn as herb, then dragon, then robot.
- Tapping Pip shows the offer, and Not now returns to the room.
- The Ch-in toggle keeps the check-in buttons after a tap.
- `#entry=b` shows the 🎲 Games pill and no Pip button.
- The picker shows "Garden Path · 3 / 10", "Ember Trail · 3 / 10" or "Circuit Run · 3 / 10" by theme.
- Every button is at least 44 px, measured in DevTools.

### Task 7: Chapter map, endless card and the Chapter 2 preview ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`<style>`, `pp-ui`)

- [x] **Step 1: Progress presets**

`PRESETS = { new: [], three: ['garden-01','garden-02','garden-03'], all: <all 10 ids>, ch2: <all 10 ids> }`. `progressFor(preset)` returns `{ cleared, endlessSeen: [], earned: { [todayKey]: preset === 'three' ? 9 : 0 } }`, so the cap line shows on the next clear from the `three` preset. `todayKey` is the local `YYYY-MM-DD`. `pools` is built as in the smoke. For the `ch2` preset, the UI flips a copy of `FAMILIES[1]` to `shipped: true` (the pure `FAMILIES` stays unchanged).

- [x] **Step 2: The map**

`screenMap()` draws:
- **Header:** a sheet header with a back arrow to the picker (`aria-label="Back to games"`), `<h3>${SKINS[line].title}</h3>` and the goal line (`SKINS[line].goal`).
- **Path:** a winding path of 10 `.pp-map-node` buttons, two staggered columns on 375 px and one row of 10 on 1280 px. Each node is 56 px, numbered, with `aria-label="Puzzle N, cleared|current|locked"`:
  - **cleared:** `--pp-node-cleared-bg`, `--pp-node-cleared-text`, with a ✓ and the skin's `mark` art at 20 px
  - **current:** a ring in `--pp-node-current-ring`, with Pip (`variant: 'mini'`) standing on it
  - **locked:** `--pp-node-locked-bg`, 🔒, disabled
- The nodes are joined by a dashed SVG path in `--pp-trail`.

Tapping a cleared or current node sets `lv` and opens `board`.

- [x] **Step 3: Endless card**

When every shipped chapter is cleared (`all` preset), the map shows all ten as cleared, followed by a `.pp-endless-card` button: "🎲 Random puzzle" with the sub-line "Every puzzle again in a random order. No repeats until you've played them all." Tapping it calls `nextPuzzle` with `Math.random`, loads that level and opens `board` with an "Endless" chip in the HUD. The `endless` screen jumps straight to this view.

- [x] **Step 4: Chapter 2 preview**

For the `ch2` preset and the `ch2` screen, below Chapter 1 (collapsed to a one-line "Chapter 1 · ✓ 10 / 10" row), draw a Chapter 2 block titled "Chapter 2 · Thin Ice (preview)":
- 10 placeholder nodes marked "not designed"
- an 11th node with a ↺ badge and the label "Refresher: a new Garden Path puzzle"
- a caption: "Each new chapter adds one refresher from every earlier chapter (10 + 1 here, 10 + 2 in Chapter 3)."

The nodes are disabled. The preview never needs Thin Ice levels.

- [x] **Step 5: Check it in a browser** (static equivalent only: jsdom harness; visual and measured 44 px checks remain manual)

Open `pips-path.html#s=map&p=three&w=both`, then `#s=endless&p=all`, then `#s=ch2&p=ch2`, in each theme.
Expected:
- Puzzles 1–3 are cleared, 4 is current with Pip on it, and 5–10 are locked.
- The endless card appears only when all ten are cleared.
- The Ch 2 block shows 11 nodes, and the last carries ↺.
- The title reads Garden Path, Ember Trail or Circuit Run by theme.

### Task 8: The board, with Pip walking, marking and talking ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`<style>`, `pp-ui`)

- [x] **Step 1: Board layout**

`screenBoard()` renders:
- **HUD:** a `.pp-hud` bar with:
  - back to the map (`aria-label="Back to the map"`)
  - the title `${SKINS[line].title} · ${n} / 10`, or `Endless`
  - a live counter, "`${left}` tiles left" (`aria-live="polite"`)
  - Undo (`↶ Undo`) and Restart (`⟲ Restart`) buttons, each at least 44 px
- **Pip's HUD bubble:** a `.pet-bubble.pp-board-bubble` above the board holding `SKINS[line].lines[pipLineFor(run, grid)]`. It only changes when the key changes, so screen readers hear 4 lines per puzzle, not one per step.
- **Board:** a `.pp-board` (`role="group"`, `aria-label="Puzzle board, W by H"`). It is a CSS grid of `grid.W` columns, with `width: min(100%, W × 64px)` and square cells, and it shows the skin's `board` art as its background frame.

Each cell is either:
- an open tile, `<button type="button" class="pp-tile" data-i="i" aria-label="Row r, column c, visited|open|Pip is here">`, drawn with the skin's `tile` art, plus `mark` when visited and not the head, plus `start` on the start tile; or
- a rock, `<div class="pp-tile pp-tile--rock" aria-hidden="true">` drawn with `rock` art.

Over the board sit two layers:
- `<svg class="pp-trail">`: a polyline through the centres of `run.path` in `--pp-trail`, styled per `skin.trail`, with `.pp-trail-glow` applied under `[data-theme="cyberpunk"]` and for `ember`
- `<div class="pp-pip-token">`: absolutely positioned on the head cell, holding `pip(line, 1, mood, {})` at 1.3 × the tile size, feet on the tile centre. It mirrors with `scaleX(-1)` when the last move was to the left. Its transition is `transform 180ms ease-out`, so moving the token only updates its `style.transform`.

- [x] **Step 2: Input**

All input goes through `apply(op)`, which replaces `run`, then re-renders the tiles, trail, counter and bubble, and moves the token.
- **Pointer:** `pointerdown` on `.pp-board` finds the tile under the pointer. A tile already in the path → `backtrackTo`. Otherwise → `step`. Then `setPointerCapture`, and on `pointermove` it uses `document.elementFromPoint(e.clientX, e.clientY)?.closest('.pp-tile')` to try `step` into each new tile. `pointerup` / `pointercancel` end the drag and remove the move listener. `.pp-board` has `touch-action: none`.
- **Keyboard:** while focus is inside the board, `keydown` maps `keyToDelta[e.key]` (lower-case letters) to the neighbour of the head and calls `step`, then moves focus to the new head tile. `Backspace` and `z` call `undo`, and `r` calls `restart`. Each handled key calls `preventDefault()`.
- **Buttons:** Undo and Restart call the same ops.
- **Show a solution** (review toggle): when on, it draws `countSolutions(level).first` as a faint dotted overlay polyline (cached per level id). It never moves Pip.

- [x] **Step 3: Pip's mood while playing**

- `content` while playing
- `happy` the moment `isCleared`
- `bored` while `isStuck`

The token re-renders only when the mood changes.

- [x] **Step 4: Check it in a browser** (static equivalent only: script syntax check + jsdom harness, no real browser; visual check remains manual)

Open `pips-path.html#s=board&lv=3&w=375` in each theme, and play garden-03 by tap, by drag and by arrow keys.
Expected:
- Pip hops tile to tile and faces left or right.
- A sprout, ember or lit node appears on each tile Pip leaves.
- The trail draws in the skin's style.
- Tapping an earlier path tile rewinds to it.
- Undo and Restart work.
- The bubble changes from intro to halfway at 8 of 15.
- At `#lv=10&w=375` in a 320 px window, the tiles are 48 px and there is no horizontal scroll.
- No console errors.

### Task 9: Cleared and stuck states, celebrations, motion rules, notes panel and the contrast smoke ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html` (`<style>`, `pp-ui`, notes `<aside>`)
- Modify: `.claude/contract/2026-11-17-pips-path-mockup/mockup-smoke.mjs`

- [x] **Step 1: Cleared state**

When `isCleared` becomes true, the board gets the class `is-cleared pp-fx--${skin.celebrate}`:
- `bloom` reveals `.pp-mark-bloom` with a staggered scale-in (40 ms per tile in path order) and drops 12 petals
- `flare` scales `.pp-mark-flame` up 1.6× and floats sparks
- `sweep` lights `.pp-mark-led` in path order (30 ms per tile)

Pip jumps once (a 300 ms `translateY(-12px)` keyframe on the token's inner `<g>`).

A `.pp-clear-card` appears under the board, containing:
- Pip's cleared line (already in the bubble)
- a sprinkle line from `rewardFor(progress, current, todayKey)`:
  - `+3 ✨` when an amount is paid
  - `+1 ✨ · today's game sprinkles are full (10/10)` when the cap trims it
  - `No sprinkles for replays` when the amount is 0 and the cap did not apply
  - `Today's game sprinkles are full (10/10)` when the amount is 0 because of the cap
- `Next puzzle` (primary) and `Map` buttons

Then `progress.cleared` gets the id, and `progress.earned[todayKey]` gets the amount. **Next** calls `nextPuzzle` and opens it. The `cleared` screen deep link plays the level's first solution instantly and shows this state.

- [x] **Step 2: Stuck state**

When `isStuck`:
- the board gets `is-stuck pp-fx--${skin.stuckFx}` (`droop` rotates the marks' leaves 25°, `dim` drops the flames to 40 % opacity, `flicker` blinks the LEDs twice)
- the Undo button gets `.pp-pulse` (a 1.2 s ring pulse, 3 times)
- Pip turns `bored`
- the bubble shows the skin's stuck line

The `stuck` screen deep link loads garden-03 and walks `[9, 8, 4, 0]`.

- [x] **Step 3: Motion rules**

Every keyframe animation and the token transition are switched off by `.frame.lowfx .pp-*`, `.frame.is-still .pp-*` and `@media (prefers-reduced-motion: reduce)`, which set `animation: none; transition: none`. With motion off, the cleared state shows its final frame straight away (flowers open, braziers lit, all LEDs on). Low FX also drops `.pp-trail-glow` (`filter: none`).

- [x] **Step 4: Notes panel**

Add `<aside class="pp-notes" aria-label="Design notes">` under the frames, holding:
1. **Rules:** Garden Path, plus backtracking, Undo, Restart and stuck.
2. **The bubble priority rule:** the offer never replaces a check-in question or a cook line, and Not now restores the previous line.
3. **Option A vs B:** "pick one at review".
4. **The cadence:** 10 + one refresher per earlier family, then endless with no repeats.
5. **The reward proposal:** 3 / 1 / 0, cap 10 a day on the Europe/Dublin day. "10 = one logged meal. At most 70 a week, against about 300 from meal habits."
6. **The skins table** (from plan.md).
7. **The `--pp-*` token table**, printed from the live frame blocks via `getComputedStyle`, three columns.
8. **The level table:** id, size, open tiles and solutions, computed with `countSolutions` at load.
9. **Inspirations, design reference only:** "one-line fill puzzles (Garden Path); later chapters: cracked-ice gym floors in monster-catching RPGs, ice caves, Sokoban, …" as in the epic.
10. **Open questions:** whether the per-theme title should be one title everywhere; option A or B.

- [x] **Step 5: Extend the smoke with token contrast**

Append above the final `console.log`:

```js
// --pp-* tokens: present in every frame, hex, and AA for text pairs
const frameBlock = (t) => html.match(new RegExp(`\\.frame\\[data-theme="${t}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`))[1];
const tok = (block, name) => { const m = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\b`)); assert.ok(m, `missing hex ${name}`); return m[1]; };
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PP = ['--pp-board-bg', '--pp-tile-bg', '--pp-tile-border', '--pp-tile-visited-bg', '--pp-trail', '--pp-trail-glow', '--pp-rock', '--pp-start-ring',
  '--pp-node-cleared-bg', '--pp-node-cleared-text', '--pp-node-current-ring', '--pp-node-locked-bg', '--pp-node-text', '--pp-hud-text'];
const PAIRS = [['--pp-hud-text', '--pp-board-bg'], ['--pp-node-text', '--pp-node-locked-bg'], ['--pp-node-cleared-text', '--pp-node-cleared-bg'], ['--pp-node-text', '--pp-board-bg']];
let pairCount = 0;
for (const t of ['default', 'parchment', 'cyberpunk']) {
  const b = frameBlock(t); PP.forEach(n => tok(b, n));
  for (const [fg, bg] of PAIRS) { const r = ratio(tok(b, fg), tok(b, bg)); assert.ok(r >= 4.5, `${t} ${fg} on ${bg} = ${r.toFixed(2)}:1`); pairCount++; }
}
console.log(`Tokens OK: ${PP.length} --pp-* tokens × 3 themes, ${pairCount} AA pairs`);
```

If a pair fails, change that theme's token value in the frame block (never the threshold), and update the Task 5 table values in the notes panel to match.

- [x] **Step 6: Run the smoke and check the states in a browser** (smoke run; states checked in a jsdom harness only, animation and visuals remain manual)

Run: `node .claude\contract\2026-11-17-pips-path-mockup\mockup-smoke.mjs`
Expected: `Tokens OK: 14 --pp-* tokens × 3 themes, 12 AA pairs`, then `Pip's Path core OK: 10 levels, engine, sequencer, rewards`, exit 0.

Then open `pips-path.html#s=cleared&lv=5`, `#s=stuck`, `#s=cleared&p=three&lv=4` and `#s=cleared&lowfx`, in each theme.
Expected:
- The cleared state shows the skin's celebration and `+3 ✨`.
- With `p=three` the line reads `+1 ✨ · today's game sprinkles are full (10/10)`.
- The stuck state pulses Undo and shows the stuck line with the drooping, dim or flickering marks.
- With `lowfx` or `rm`, nothing animates and the final frame shows.
- The notes panel lists 10 levels with solutions 8, 12, 4, 9, 7, 1, 6, 1, 1, 4.

---

## Phase 4 — README

A documentation-only phase. It is safe because nothing else reads the README.

### Task 10: Add the mockup to the README ✓

- Skill: none (mockup index documentation, no code)

**Files:**
- Modify: `foodbytes-app/mockup/README.md` (the table, after the `day-kcal-buttons.html` row)

- [x] **Step 1: Add the row**

```markdown
| `pips-path.html` | **In review (MPP-49):** Pip's games. Tap Pip (option A) or a 🎲 Games pill (option B) → "Play a game with me?" → game picker → Pip's Path chapter map → board. The 10 solver-verified Garden Path levels (one path through every tile, start fixed, end free) in a full skin per Pip line: Garden Path (herb, Default), Ember Trail (dragon, Parchment), Circuit Run (robot, Cyberpunk). Pip walks, marks each tile, talks in a bubble and celebrates or gets stuck. Cleared and stuck states, endless mode, a Chapter 2 refresher preview, proposed rewards (3 ✨ first clear, 1 ✨ endless, cap 10 a day), proposed `--pp-*` tokens and a notes panel. Pure blocks `pp-levels`, `pp-engine`, `pp-sequencer` and `pp-skins` are what the build ticket ports. Deep links: `#theme=`, `#s=room\|offer\|picker\|map\|board\|cleared\|stuck\|endless\|ch2`, `#lv=1…10`, `#p=new\|three\|all\|ch2`, `#w=375\|1280\|both`, `#entry=a\|b`, `#lowfx`, `#rm`, `#sol`. Contract `2026-11-17-pips-path-mockup`. |
```

- [x] **Step 2: Verify**

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "pips-path.html"`
Expected: one hit.

---

## Phase 5 — Final verification

The closing phase. There are no production changes beyond the version bump, only sanity checks on the cumulative work.

### Task 11 (M.1): Bump version + CHANGELOG ✓

- Skill: none (release bookkeeping per `CLAUDE.md` → Versioning & deploy verification)

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a **Story** (the MPP-49 child), so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`, add: `<new version> — <MPP-n if the child Story exists by then, else 2026-11-17-pips-path-mockup>: Pip's Path mockup (Play a game, picker, chapter map, 10 Garden Path levels in three skins)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 12 (M.2): Full smoke and stale-pattern greps ✓

- Skill: none (verification only)

- [x] **Step 1: Smoke**

Run: `node .claude\contract\2026-11-17-pips-path-mockup\mockup-smoke.mjs`
Expected: both OK lines, exit 0.

- [x] **Step 2: No debug output and no app changes**

Run: `Select-String -Path foodbytes-app\mockup\pips-path.html -Pattern "console\.(log|debug)"`
Expected: zero hits.

Run: `git status --porcelain foodbytes-app/client/src foodbytes-app/foodbytes-api/src`
Expected: no paths this contract added (lines already listed in the git status at plan time, such as the robot and dragon Pip files, may still show; nothing new).

### Task 13 (M.3): Production build ✓

- Skill: none (verification only)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. The bump touched `package.json`, which Vite's `define` reads.

The backend suite (`mvn test`) is not run. Only the `pom.xml` `<version>` changed, `check:version` covers it, and `mvn` is not on PATH without the prefix in CLAUDE.md.

### Task 14 (M.4): PR description ✓

- Skill: none (documentation)

**Files:**
- Create: `.claude/contract/2026-11-17-pips-path-mockup/pr-description.md`

- [x] **Step 1: Write the PR description**

Include:
- A link to `plan.md` in this folder.
- A summary: the mockup, its screens, the three skins and the 10 levels with their solution counts.
- The new version from Task 11.
- **No migration and no Railway step.**
- The verification results from Tasks 9 and 12–13: the smoke output lines and the build time.
- The open review choices for the developer:
  - entry option A or B
  - one title or per-skin titles
  - the reward numbers
- A one-line note for future contributors: "Puzzle logic for Pip's games lives in pure `<script id>` blocks so it can be ported and smoke-tested; boards are at most 6 columns (48 px tiles at 320 px)."
- A suggested commit subject: `MPP-<n>: Pip's Path mockup with Garden Path levels and three skins`, with the child Story key, or `2026-11-17-pips-path-mockup: …` if the Story still does not exist.

---

## Self-review

**Spec coverage:**
- Mockup file with all screens (room, offer, picker, map, board, cleared, stuck, endless, ch2): Tasks 5–9.
- 10 Garden Path levels, solver-verified: Tasks 1–2 (data, count match, solution replay).
- Three skins, one per Pip line: Task 4 (data and smoke) and Tasks 6–9 (rendering, celebrations).
- Pip's role (walks, marks, talks, reacts, on the map and the picker): Tasks 6 (picker), 7 (map) and 8–9 (board, mood, bubble, jump).
- Pure engine, sequencer and reward blocks: Tasks 1, 2 and 4.
- Theme switch, live tokens, proposed `--pp-*` tokens with AA: Tasks 5 and 9.
- Controls (tap, drag/swipe, keys, backtrack, Undo, Restart): Task 8.
- Review aids (state switcher, deep links, show a solution, notes panel): Tasks 5, 8 and 9.
- Entry options A and B, and the bubble priority demo: Task 6.
- Endless mode and the Chapter 2 refresher preview: Task 7.
- Reward proposal with the daily cap: Tasks 1, 2 and 9.
- 320–1280 px, 44 px targets, Low FX and reduced motion: Tasks 5, 8 and 9.
- Smoke script: Tasks 2, 4 and 9.
- README row: Task 10.
- Version bump and CHANGELOG: Task 11.
- PR description: Task 14.

**Placeholder scan:** no `TBD`, `TODO` or "implement later". The only deferred value is the MPP key, which Tasks 11 and 14 resolve with a stated fallback to the slug.

**Type / name consistency:**
- `GARDEN_PATH_LEVELS`, `LEVEL_MAX_COLS`, the engine functions, `FAMILIES`, `chapterQueue`, `nextPuzzle`, `REWARD`, `rewardFor`, `THEME_LINE`, `SKIN_ART_KEYS`, `SKIN_LINE_KEYS`, `SKINS`, `lineFor` and `pipLineFor` match plan.md → Data shapes and are spelt identically in Tasks 1, 2, 4 and 6–9.
- `pipLineFor(run, grid)` drops plan.md's unused third `skin` argument. It returns a key, and the caller indexes `SKINS[line].lines`.
- The skin keys are `herb`, `dragon` and `robot` throughout.
- The `--pp-*` list in Task 5 has 13 names, plus `--pp-node-cleared-text`, which Task 5 Step 2 adds. That makes the 14 the Task 9 smoke checks.
- The CSS hooks `pp-mark-bloom`, `pp-mark-flame` and `pp-mark-led` are set in Task 4 and animated in Task 9.

**Phase boundary cleanliness:**
- Phase 1 ends with a placeholder page and a green smoke.
- Phase 2 adds pure data only, and the smoke stays green.
- Phase 3 adds screens one task at a time. Unbuilt screens show a "coming in Task N" line, so the page never errors.
- Phase 4 is documentation only.
- Phase 5 is the bump plus checks. No phase leaves a half-renamed identifier or a broken page.

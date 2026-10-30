# Tasks: Pip level-bar points pop

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE (Task 5 manual check outstanding — developer-owned)
Started: 2026-10-30

**Goal:** When Pip's growth points change, the head bar floats "+3" / "−3" up and fades, then shows the "current / size" count and fades. The uncommitted implementation is hardened, verified on `/pet` and shipped as a MINOR bump.

**Spec:** `plan.md` in this folder.

> **Starting state:** the pop is already implemented, uncommitted, in the working tree (8 files, `git diff --stat` ≈ +115/−12). Do **not** revert or re-implement it; the tasks below edit it in place. Confirm first with `git status --short`. It should list `PetView.jsx`, `PipHeadBar.css`, `PipHeadBar.jsx`, `RoomPip.jsx`, `constants/pipGrowth.js`, `hooks/usePipGrowth.js`, `utils/pipGrowth.check.mjs` and `utils/pipGrowth.js` as modified.

---

## File map

**Created:**
- `.claude/contract/2026-10-30-pip-points-pop/pr-description.md`: PR text for the developer (Task 7)

**Modified (already uncommitted, kept):**
- `foodbytes-app/client/src/utils/pipGrowth.js`: `growthGain` helper
- `foodbytes-app/client/src/utils/pipGrowth.check.mjs`: `growthGain` checks
- `foodbytes-app/client/src/components/pet/PetView.jsx`: `levelBar.gain`
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`: passes `gain`

**Modified (by this contract):**
- `foodbytes-app/client/src/constants/pipGrowth.js`: add `HEAD_BAR_GAIN_DELTA_MS`
- `foodbytes-app/client/src/hooks/usePipGrowth.js`: counter-based pop id
- `foodbytes-app/client/src/components/pet/room/PipHeadBar.jsx`: pass `--pip-gain-ms` / `--pip-gain-delta-ms`
- `foodbytes-app/client/src/components/pet/room/PipHeadBar.css`: durations from the CSS vars
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version bump

**Deleted:** (none)

---

## Phase 1 — Harden the pop

Make the CSS timing come from the JS constants and make the pop id always unique. The pop's visible behaviour is unchanged. This phase ends with `check:growth` and `npm run build` green.

### Task 1: Add `HEAD_BAR_GAIN_DELTA_MS` constant ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipGrowth.js` (the `HEAD_BAR_GAIN_MS` block at the end)

- [x] **Step 1: Replace the gain constant block**

Replace:
```js
// The "+3" that floats up off the bar, then the "3 / 15" count that takes its place and fades. Keep in step with PipHeadBar.css.
export const HEAD_BAR_GAIN_MS = 2400
```
with:
```js
// The points pop over the bar: the "+3" floats up and fades, then the "3 / 15" count takes its place and fades.
export const HEAD_BAR_GAIN_DELTA_MS = 1200 // the "+3"
export const HEAD_BAR_GAIN_MS = 2400 // the count (after any evolve); usePipGrowth clears the pop once it has played
```

- [x] **Step 2: Verify the module still loads**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {HEAD_BAR_GAIN_MS, HEAD_BAR_GAIN_DELTA_MS} from './src/constants/pipGrowth.js'; console.log(HEAD_BAR_GAIN_MS, HEAD_BAR_GAIN_DELTA_MS)"`
Expected: `2400 1200`

### Task 2: Counter-based pop id in `usePipGrowth` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePipGrowth.js` (module constants and the run-start effect)

- [x] **Step 1: Add the counter below `NO_GROWTH`**

After the `const NO_GROWTH = { ... gain: null }` line, add:
```js

// Each pop gets a fresh id, so its <g> remounts and the CSS animation replays even for a repeat value.
let gainSeq = 0
```

- [x] **Step 2: Use it when the run starts**

Replace:
```js
    setGain(popped && { ...popped, id: `${growth.points}:${growth.lastScoredDate}` })
```
with:
```js
    setGain(popped && { ...popped, id: ++gainSeq })
```

- [x] **Step 3: Update the JSDoc id type**

The hook's comment block already describes `gain` as `({ id, text, gained, count, delayMs })`. Leave it as is. Confirm there is no remaining reference to the old id:

Run: `Select-String -Path foodbytes-app\client\src\hooks\usePipGrowth.js -Pattern "lastScoredDate}"`
Expected: zero hits.

### Task 3: Pass the durations into `PipHeadBar` as CSS vars ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PipHeadBar.jsx:1` (import) and the gain `<g>` style

- [x] **Step 1: Import the constants**

Replace:
```js
import { HEAD_BAR_FLASH_MS, HEAD_BAR_HEIGHT, HEAD_BAR_WIDTH, PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
```
with:
```js
import {
  HEAD_BAR_FLASH_MS, HEAD_BAR_GAIN_DELTA_MS, HEAD_BAR_GAIN_MS, HEAD_BAR_HEIGHT, HEAD_BAR_WIDTH, PIP_GROWTH_PHASES
} from '../../../constants/pipGrowth'
```

- [x] **Step 2: Set the vars on the gain group**

Replace:
```jsx
          style={{ '--pip-gain-delay': `${gain.delayMs}ms`, '--pip-gain-rise': `${-12 / poseScale}px` }}
```
with:
```jsx
          style={{
            '--pip-gain-delay': `${gain.delayMs}ms`,
            '--pip-gain-rise': `${-12 / poseScale}px`,
            '--pip-gain-ms': `${HEAD_BAR_GAIN_MS}ms`,
            '--pip-gain-delta-ms': `${HEAD_BAR_GAIN_DELTA_MS}ms`
          }}
```

### Task 4: CSS durations from the vars ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PipHeadBar.css` (the points-pop block, lines ~25–58)

- [x] **Step 1: Rewrite the block comment**

Replace:
```css
/* The points pop: "+3" floats up and fades, then "3 / 15" takes its place and fades.
   The +3 runs 1.2 s; the count waits out any evolve (--pip-gain-delay) and runs 2.4 s
   = HEAD_BAR_GAIN_MS, when usePipGrowth clears it. */
```
with:
```css
/* The points pop: "+3" floats up and fades, then "3 / 15" takes its place and fades.
   Durations come from HEAD_BAR_GAIN_DELTA_MS / HEAD_BAR_GAIN_MS via PipHeadBar; the count
   also waits out any evolve (--pip-gain-delay). */
```

- [x] **Step 2: Use the vars in both animations**

Replace:
```css
.pip-head-bar-delta { animation: pip-gain-delta 1.2s ease-out 1 both; }
```
with:
```css
.pip-head-bar-delta { animation: pip-gain-delta var(--pip-gain-delta-ms) ease-out 1 both; }
```
and replace:
```css
  animation: pip-gain-count 2.4s ease-in-out var(--pip-gain-delay, 0ms) 1 both;
```
with:
```css
  animation: pip-gain-count var(--pip-gain-ms) ease-in-out var(--pip-gain-delay, 0ms) 1 both;
```

- [x] **Step 3: Update the count keyframe comment**

Replace:
```css
/* Holds back until the +3 has gone (50% of 2.4 s ≈ the +3's 1.2 s), then shows and fades. */
```
with:
```css
/* Holds back until the +3 has gone (HEAD_BAR_GAIN_DELTA_MS is half of HEAD_BAR_GAIN_MS), then shows and fades. */
```

- [x] **Step 4: Confirm no literal durations remain in the pop rules**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\PipHeadBar.css -Pattern "1\.2s|2\.4s"`
Expected: zero hits.

- [x] **Step 5: Pin the half-length relationship in the check**

In `foodbytes-app/client/src/utils/pipGrowth.check.mjs`, change the constants import:
```js
import { PIP_GROWTH_PHASES } from '../constants/pipGrowth.js'
```
to:
```js
import { HEAD_BAR_GAIN_DELTA_MS, HEAD_BAR_GAIN_MS, PIP_GROWTH_PHASES } from '../constants/pipGrowth.js'
```
and add, directly above `console.log('pipGrowth checks passed')`:
```js
// pip-gain-count stays hidden for its first ~half, so the +3 must be gone by then.
assert.ok(HEAD_BAR_GAIN_DELTA_MS <= HEAD_BAR_GAIN_MS / 2, 'the +3 would overlap the count')
```

- [x] **Step 6: Run the checks and the build**

Run: `cd foodbytes-app\client; npm run check:growth; npm run build`
Expected: `pipGrowth checks passed`, then `✓ built in <n>s` with no errors.

- [x] **Step 7: Measure the touched component files**

Run: `cd foodbytes-app\client\src; foreach ($f in 'components\pet\room\PipHeadBar.jsx','hooks\usePipGrowth.js','components\pet\PetView.jsx','components\pet\room\RoomPip.jsx') { "$f $((Get-Content $f | Measure-Object -Line).Lines)" }`
Expected: every file under 200 lines.

---

## Phase 2 — Manual check in the running app

There is no frontend test runner, so the visible behaviour is checked by hand. This phase changes no code, unless a check fails and the plan's Risks section names the lever to pull (`--pip-gain-rise`, `fontSize`).

### Task 5: Watch the pop on `/pet` — pending: developer manual check, not run

- Skill: react-frontend

**Files:**
- (none — manual verification)

- [ ] **Step 1: Start the stack**

Start the backend per CLAUDE.md → "Running the backend locally with Google login" (with `FRONTEND_URL=http://localhost:5173`). Then:
Run: `cd foodbytes-app\client; npm run dev`
Expected: Vite serving on `http://localhost:5173`. Sign in and open `/pet`.

- [ ] **Step 2: Trigger a gain**

In DevTools → Application → Local Storage, open the key `foodbytes.pip.lastSeenGrowth.<userId>`. Lower `points` and `barCurrent` by 3, keeping `barCurrent` ≥ 0 and the same `form`. Reload.
Expected: a green "+3" rises off the bar and fades in about 1.2 s. Then "<barCurrent> / <barSize>" appears in the same spot, holds, and fades. It's gone by about 2.4 s, and the bar fill animates up meanwhile.

- [ ] **Step 3: Trigger a loss**

Same key: raise `points` and `barCurrent` by 3 (staying below `barSize`). Reload.
Expected: a rust "−3" rises and fades, then the count shows and fades. The bar drains.

- [ ] **Step 4: Trigger an evolve**

Same key: set `form` to one below the current form, with any `points` lower than the current value. Reload.
Expected: "+N" shows immediately while the bar fills and flashes. The count appears only after Pip has evolved, showing the new form's numbers. (Skip this step if Pip is currently a Seed: there's no lower form.)

- [ ] **Step 5: Edge positions and widths**

Repeat Step 2 with Pip in bed (night) and with a hat on. Then repeat at a 375 px wide viewport (DevTools device mode).
Expected: the "+3" isn't clipped at the room's top edge, and both texts are legible at 375 px. If either fails, tune `--pip-gain-rise` or the `fontSize` values in `PipHeadBar.jsx`, then re-run Phase 1 Step 6.

- [ ] **Step 6: Reduced motion**

DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", then repeat Step 2.
Expected: "+3" shows in place without rising and fades. The count still shows and fades.

- [ ] **Step 7: Record the results**

Write which steps passed, and any tuning made, into the Verification section of `pr-description.md` (Task 7). State plainly any step you could not run.

---

## Phase 3 — Final verification

No production changes beyond the version bump.

### Task 6: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. There's no Jira ticket and this is new behaviour, not a bug fix → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`:
`<new version> — 2026-10-30-pip-points-pop: Pip's head bar pops "+3" / "−3" when he gains or loses points, then shows the count and fades`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 7: Stale-reference grep, checks, build, PR description ✓

- Skill: none — verification and handoff

**Files:**
- Create: `.claude/contract/2026-10-30-pip-points-pop/pr-description.md`

- [x] **Step 1: No console logging added**

Run: `git diff -U0 -- foodbytes-app/client/src | Select-String -Pattern "^\+.*console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 2: Run every pet-related check**

Run: `cd foodbytes-app\client; npm run check:growth; npm run check:room; npm run check:wardrobe`
Expected: each prints its `... checks passed` line, with no assertion errors.

- [x] **Step 3: Production build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `✓ built in <n>s`, no errors.

- [x] **Step 4: Write `pr-description.md`**

Include:
- A link to `plan.md` in this folder.
- A summary: the head-bar points pop ("+N"/"−N" rise and fade, then the "current / size" count fade), driven by `growthGain` → `usePipGrowth.gain` → `PipHeadBar`. Name the new version from Task 6.
- Migrations: none. Backend: no changes; the version bump in `pom.xml` only.
- Verification: results from Phase 1 Step 6, the Phase 2 manual checks (pass/fail per step, any tuning) and Task 7 Steps 1–3.
- A note for contributors: pop durations live in `HEAD_BAR_GAIN_DELTA_MS` / `HEAD_BAR_GAIN_MS` and reach the CSS as `--pip-gain-delta-ms` / `--pip-gain-ms`. Never hard-code them in `PipHeadBar.css`.
- A suggested commit subject: `2026-10-30-pip-points-pop: Pip head bar points pop (+N, then count, fades)` (no MPP ticket).

---

## Self-review

**Spec coverage:**
- Keep and review the uncommitted pop: starting-state note, plus Tasks 2–4 editing it in place.
- Durations driven from the constants via CSS vars: Tasks 1, 3, 4.
- Unique pop id from a counter: Task 2.
- `growthGain` covered by the check: already in the check; Task 4 Step 5 adds the timing invariant; Task 7 Step 2 runs it.
- Manual check (gain, loss, evolve, bed, phone, reduced motion): Task 5.
- MINOR bump + CHANGELOG: Task 6.

**Placeholder scan:** no `TBD`, `TODO`, `implement later` or "similar to Task N". Every edit shows the exact old and new text, and every check has `Run:` / `Expected:`.

**Type / name consistency:** `HEAD_BAR_GAIN_DELTA_MS` and `HEAD_BAR_GAIN_MS` are used the same in Tasks 1, 3, 4. So are `--pip-gain-ms`, `--pip-gain-delta-ms`, `--pip-gain-delay` and `--pip-gain-rise` in Tasks 3 and 4, and `gainSeq` in Task 2. `growthGain` and `gain` match plan.md → Data shapes.

**Phase boundary cleanliness:**
- Phase 1 ends with `check:growth` and the build green, and every var it introduces is both set (Task 3) and read (Task 4).
- Phase 2 changes no code, unless tuning is needed, and then it re-runs Phase 1 Step 6.
- Phase 3 only bumps the version and verifies.

# Tasks: Fix the cook-scene walk-back duration (MPP-29 regression)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Each of Pip's cook-scene walks lasts exactly as long as the phase that starts it (700 ms out, 500 ms back), so the scene stays ≤ 3 s and Pip is on the rug when it ends. A check pins this rule.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:** (none — no new files)

**Modified:**
- `foodbytes-app/client/src/utils/cookServe.js` — add the `pipWalkMs(phase)` helper.
- `foodbytes-app/client/src/utils/cookServe.check.mjs` — pin the walk duration to its phase and the scene end to ≤ `PIP_ANIMATION_MAX_MS`.
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:3,210-223` — PipWalker reads `pipWalkMs(phase)`; drop `WALK_DURATION` and the unused `COOK_PHASE_MS` import.
- `foodbytes-app/client/src/constants/pet.js:76-77` — correct the comment.
- `foodbytes-app/client/src/components/pet/room/PetRoom.css:40-42` — correct the comment.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — PATCH bump.

**Deleted:** (none)

---

## Phase 1 — Per-phase walk duration

Adds the pure helper and its checks, then wires PipWalker to it. Each task leaves `npm run check:cook` and the build green, so stopping after either task is safe.

### Task 1: Add `pipWalkMs` to cookServe.js and pin it in cookServe.check.mjs ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/cookServe.js:19-20`
- Modify: `foodbytes-app/client/src/utils/cookServe.check.mjs:6,33`

- [x] **Step 1: Write the failing checks**

In `cookServe.check.mjs`, change the import on line 6:

```js
import { shouldServe, cookServeSchedule, cookServeBubble, shouldTakeToPip, pipWalkMs } from './cookServe.js'
```

and line 7:

```js
import { COOK_PHASE_MS, PIP_ANIMATION_MAX_MS } from '../constants/pet.js'
```

Directly after the existing line `assert.ok(total(cookServeSchedule(true)) <= PIP_ANIMATION_MAX_MS, 'reduced-motion serve over the 3 s limit')`, insert:

```js

// MPP-29 regression: PipWalker's CSS walk lasts exactly the phase that starts it, so Pip is on
// the rug when the scene ends (a 700 ms walk in the 500 ms `returning` phase overran by 200 ms).
assert.equal(pipWalkMs('walking'), COOK_PHASE_MS.walking)
assert.equal(pipWalkMs('returning'), COOK_PHASE_MS.returning)
assert.equal(pipWalkMs(null), COOK_PHASE_MS.walking) // idle: the next walk is always the walk out
let walkEndsAt = 0
let sceneStart = 0
for (const { phase, ms } of cookServeSchedule(false)) {
  if (phase === 'walking' || phase === 'returning') {
    assert.equal(pipWalkMs(phase), ms, `${phase} walk does not match its phase`)
    walkEndsAt = sceneStart + pipWalkMs(phase)
  }
  sceneStart += ms
}
assert.ok(walkEndsAt <= sceneStart, 'Pip still walking after the cook scene ends')
assert.ok(walkEndsAt <= PIP_ANIMATION_MAX_MS, 'walk back over the 3 s limit')
```

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: fails with `SyntaxError: The requested module './cookServe.js' does not provide an export named 'pipWalkMs'`.

- [x] **Step 3: Add the helper**

In `cookServe.js`, directly after the `cookServeSchedule` function (after its closing `}` on line 20), insert:

```js

/**
 * MPP-29: PipWalker's CSS walk lasts exactly the phase that starts it — out in `walking`,
 * back in `returning`. Other phases don't move Pip; they fall back to the walk out, which
 * is the next walk from idle.
 */
export function pipWalkMs(phase) {
  return phase === COOK_PHASES.RETURNING ? COOK_PHASE_MS.returning : COOK_PHASE_MS.walking
}
```

(`COOK_PHASES` and `COOK_PHASE_MS` are already imported on line 2.)

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `cook-and-serve checks passed`

### Task 2: PipWalker uses the per-phase duration ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:3,6,209-223`
- Modify: `foodbytes-app/client/src/constants/pet.js:76-77`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:40-42`

- [x] **Step 1: Swap the imports**

Line 3, drop `COOK_PHASE_MS` (line 210 is its only use):

```js
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
```

After `import useRoomOverlay from '../../../hooks/useRoomOverlay'`, add:

```js
import { pipWalkMs } from '../../../utils/cookServe'
```

- [x] **Step 2: Replace the constant duration**

Delete these two lines (209–210) and the blank line after them:

```js
// MPP-29: the walk lasts exactly the walking phase, so Pip arrives as the cooking line appears.
const WALK_DURATION = `${COOK_PHASE_MS.walking}ms`
```

In `PipWalker`, replace `transitionDuration: WALK_DURATION` with `transitionDuration: \`${pipWalkMs(phase)}ms\``, and add one comment line above the `<g className=…>` return so the function reads:

```jsx
function PipWalker({ phase, children }) {
  const atCooker = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.COOKING || phase === COOK_PHASES.SERVED
  const walking = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.RETURNING
  const [dx, dy] = COOK_WALK_OFFSET
  const transform = atCooker ? `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` : 'none'
  // MPP-29: each walk lasts exactly its phase (out 0.7 s, back 0.5 s), so Pip is on the rug as the scene ends.
  return (
    <g className={walking ? 'pip-walker is-walking' : 'pip-walker'} style={{ transform, transitionDuration: `${pipWalkMs(phase)}ms` }}>
      <g className="pip-hop">{children}</g>
    </g>
  )
}
```

- [x] **Step 3: Correct the two stale comments**

`constants/pet.js` line 77, replace:

```js
// PipWalker's CSS walk reads `walking` too, so retune here only.
```

with:

```js
// PipWalker's CSS walks read `walking` (out) and `returning` (back) via pipWalkMs, so retune here only.
```

`PetRoom.css` line 42, replace:

```css
   MPP-29: its duration is set inline from COOK_PHASE_MS.walking (PipWalker). */
```

with:

```css
   MPP-29: its duration is set inline per phase from pipWalkMs (walking out, returning back). */
```

- [x] **Step 4: Confirm no stale references remain**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\PetRoom.jsx -Pattern "WALK_DURATION|COOK_PHASE_MS"`
Expected: zero hits.

- [x] **Step 5: Build and re-run the check**

Run: `cd foodbytes-app\client; npm run check:cook; npm run build`
Expected: `cook-and-serve checks passed`, then `built in <n>s` with no errors.

- [ ] **Step 6: Manual visual check (developer)** — outstanding, developer at /pet

Start the frontend (`cd foodbytes-app\client; npm run dev`) with the backend running, signed in. Tick today's lunch as eaten so `/pet` plays the cook scene (MPP-34 hands off automatically). At phone width (375 px) watch the walk back: Pip should reach the rug as the "Yum! 💜" bubble clears, without sliding on after it. Then turn on reduced motion (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`) and confirm only the served plate shows, with no walking.

---

## Phase 2 — Final verification

No production changes beyond the version bump. These tasks only confirm that the cumulative work is clean.

### Task 3: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This is a regression fix on MPP-29 (a Task that already took its MINOR bump) → treat it as a bug and bump **PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`:
`<new version> — MPP-29: cook scene's walk back now lasts its 0.5 s phase, so Pip is on the rug when the scene ends (no 200 ms overrun past 3 s)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 4: Run all the room checks ✓

- Skill: none — verification only

- [x] **Step 1: The room and Pip checks all pass**

Run: `cd foodbytes-app\client; npm run check:cook; npm run check:room; npm run check:growth; npm run check:pip`
Expected: each prints its `… checks passed` line, with no assertion errors.

### Task 5: Run the full backend test suite ✓

- Skill: none — verification only (the backend is untouched apart from the pom version)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test` (with the JAVA_HOME / Maven PATH prefix from `CLAUDE.md`)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 6: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Write the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-29-walker-return-duration/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- A link to `plan.md`.
- A summary: PipWalker used the 700 ms walk-out duration for the 500 ms walk back, so Pip overran the scene by 200 ms. Each walk now lasts exactly its phase via `pipWalkMs`, which `check:cook` pins.
- The new version from Task 3.
- No migration and no Railway step.
- Verification results from Tasks 1, 2, 4, 5 and 6, plus the manual `/pet` check outcome (or "not yet checked").
- A one-line convention note: cook-scene walk timing lives in `pipWalkMs`. Retune `COOK_PHASE_MS` only, never a duration inside PetRoom.
- A suggested commit subject: `MPP-29: walk back lasts its returning phase, scene ends with Pip on the rug`.

---

## Self-review

**Spec coverage:**
- Per-phase walk duration via `pipWalkMs` — Tasks 1, 2.
- PipWalker reads it in PetRoom.jsx — Task 2.
- Check pinning the walk duration to its phase and the scene to ≤ `PIP_ANIMATION_MAX_MS` — Task 1.
- Stale comments corrected — Task 2, Step 3.
- PATCH bump + CHANGELOG — Task 3.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "similar to Task N". Every step shows the exact code or command. The only "fill at apply time" value is the version number, which is deliberate.

**Type / name consistency:** `pipWalkMs(phase)` is used identically in Task 1 (definition + check) and Task 2 (PetRoom import and call). `COOK_PHASE_MS.walking` / `.returning` and `COOK_PHASES.RETURNING` match `constants/pet.js`.

**Phase boundary cleanliness:**
- Phase 1: Task 1 adds a helper nothing else uses yet, so the build is still green. Task 2 switches PetRoom to it and removes `WALK_DURATION` in the same step, so no dead reference is left.
- Phase 2: only the version bump and verification. The manifests and CHANGELOG are bumped together and gated by `check:version`.

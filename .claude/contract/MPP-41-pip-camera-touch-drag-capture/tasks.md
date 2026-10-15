# Tasks: Pip's room camera — touch drag cancels after a few px and floats back to Pip

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-15

**Goal:** Make one-finger touch drag-to-pan in Pip's room work by ending the gesture on `lostpointercapture` only when the stage itself lost capture.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:** (none — no new files)

**Modified:**
- `foodbytes-app/client/src/hooks/usePipCamera.js:207-268` — add `onLostCapture` guard and register it for `lostpointercapture` instead of `onUp`
- `foodbytes-app/client/package.json` — PATCH version bump
- `foodbytes-app/foodbytes-api/pom.xml` — PATCH version bump
- `CHANGELOG.md` — prepend one line

**Deleted:** (none)

---

## Phase 1 — Capture hand-off fix

A single behavioural change inside `wireInput`. The boundary is safe: the client builds green and every other listener is untouched, so a stop here leaves only the version bump outstanding.

### Task 1: Guard `lostpointercapture` in `wireInput` so only the stage's own loss ends a gesture ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePipCamera.js:207-268`

- [x] **Step 1: Add the `onLostCapture` handler directly after `onUp`**

Insert immediately after the closing `}` of `const onUp = e => { … }` (currently line 222), before `const onClick`:

```js
  // On touch the finger's original target holds an implicit capture; moving it to the stage in onMove
  // fires a bubbling lostpointercapture on that child. Only the stage losing capture ends the gesture.
  const onLostCapture = e => {
    if (e.target === stage) onUp(e)
  }
```

- [x] **Step 2: Register it in the listeners table in place of `onUp`**

In the `listeners` array (currently line 266), replace:

```js
['lostpointercapture', onUp]
```

with:

```js
['lostpointercapture', onLostCapture]
```

Leave `['pointerup', onUp]` and `['pointercancel', onUp]` unchanged. The detach loop iterates the same array, so removal needs no extra code.

- [x] **Step 3: Confirm `onUp` is no longer bound to `lostpointercapture`**

Run: `Select-String -Path foodbytes-app\client\src\hooks\usePipCamera.js -Pattern "'lostpointercapture', onUp"`
Expected: zero hits.

Run: `Select-String -Path foodbytes-app\client\src\hooks\usePipCamera.js -Pattern "'lostpointercapture', onLostCapture"`
Expected: exactly one hit.

- [x] **Step 4: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 5: Manual check — record outcome in the final report (developer-owned on a real phone)** (developer-owned — pending on phone)

On a phone (Chrome DevTools device toolbar with touch is a smoke check only — see `plan.md` Risks), open the Pip tab and:
1. Drag left/right at default zoom → camera follows the finger with its trail for the whole drag; does **not** start floating back while the finger is down.
2. Drag past the room edge → rubber-bands.
3. Lift the finger → camera floats back to Pip over ~2 s.
4. Pinch to zoom in, then drag → pans at the new zoom; pinch itself still zooms and is remembered after reload.
5. Start a drag on the fridge (or trophy cabinet) tap area and release on it → the fridge/cabinet does **not** open. A plain tap still opens it.
6. Desktop mouse drag (zoomed in) still pans and floats home on release.

---

## Phase 2 — Final verification

No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a **Bug** → bump **PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-41: fix touch drag in Pip's room cancelling after a few px and floating back to Pip`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references and debug output ✓

- Skill: none — read-only audit

**Files:**
- (read-only) `foodbytes-app/client/src/hooks/usePipCamera.js`

- [x] **Step 1: No debug logging introduced**

Run: `Select-String -Path foodbytes-app\client\src\hooks\usePipCamera.js -Pattern "console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 2: Every `lostpointercapture` binding goes through the guard**

Run: `Select-String -Path foodbytes-app\client\src\hooks\usePipCamera.js -Pattern "lostpointercapture"`
Expected: hits only in the new comment and the `['lostpointercapture', onLostCapture]` table entry.

### Task M.3: Run the full backend test suite ✓

- Skill: none — regression gate; backend untouched apart from the pom version

**Files:**
- (none — verification only)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build ✓

- Skill: none — verification only

**Files:**
- (none — verification only)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-41-pip-camera-touch-drag-capture/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: `lostpointercapture` from a child's implicit touch capture no longer ends the drag; the new version from Task M.1.
- Migrations: none.
- Verification results from Phase 1 (build, greps) and the manual phone checks — state plainly which were run and which remain for the developer.
- Convention note: in `wireInput`, `lostpointercapture` must be filtered to `e.target === stage`, because it bubbles from children.
- Suggested commit subject: `MPP-41: fix touch drag in Pip's room floating back to Pip after a few px`.

---

## Self-review

**Spec coverage:**
- Guarded `lostpointercapture` handler in `wireInput` — Task 1 (Steps 1–3).
- Manual re-test of drag, rubber-band, float-home, pinch, tap-after-drag swallow — Task 1 Step 5.
- PATCH version bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command; `<new version>` is computed at apply time by design.

**Type / name consistency:** `onLostCapture` is the only new identifier, used identically in Task 1 Steps 1–3, Task M.2 and `plan.md` Data shapes. `onUp`, `stage`, `listeners` match the existing file.

**Phase boundary cleanliness:** Phase 1 ends with the client building green and the hook internally consistent (handler defined and registered in the same task). Phase 2 changes only manifests/CHANGELOG and ends with `check:version`, `mvn test` and `npm run build` green.

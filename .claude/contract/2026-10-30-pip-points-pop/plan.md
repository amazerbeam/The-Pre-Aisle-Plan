# Plan: Pip level-bar points pop

Plan folder: `.claude/contract/2026-10-30-pip-points-pop/`
Execution status: see `tasks.md` in this folder.

---

## Part 1 — Alignment

### Task reference
Developer prose, 2026-10-30: "when pip gains or loses exp I want to see the numbers go up. so +3 then the bar to show the exp number do 3/15 then fade away".

Follow-up, same day: "plan this update please /fb-plan". The brief handed to the planner was: *Pip level-bar points pop: when Pip gains or loses growth points, float "+3"/"−3" up off the head bar, then show the bar count "3 / 15" and fade. Already implemented uncommitted in the working tree (growthGain in utils/pipGrowth.js, usePipGrowth gain state, PipHeadBar text + CSS, HEAD_BAR_GAIN_MS, checks in pipGrowth.check.mjs). The plan should cover formalising, verification, version bump and changelog.*

There is no Jira ticket.

### Restated goal
When Pip's growth points change, the small level bar over his head in the room briefly shows what changed. A green "+3", or a rust "−3" on a loss, rises off the bar and fades. Then the bar's count for the current form ("6 / 21") appears in the same spot, holds for a moment and fades. The code already sits uncommitted in the working tree. This contract reviews it and hardens it, so the CSS timing can't drift from the JS constant and repeat pops replay reliably. It then verifies the pop in the running app and ships it as a MINOR version bump with a CHANGELOG line.

### In scope
- Keep and review the uncommitted pop: `growthGain` in `utils/pipGrowth.js`, the `gain` state in `usePipGrowth`, the pass-through in `PetView`/`RoomPip`, and the `<text>` plus CSS in `PipHeadBar`.
- Drive the CSS animation durations from `HEAD_BAR_GAIN_MS` through CSS custom properties, so the JS clear timer and the keyframes share one source of truth.
- Give each pop a unique id from a counter, so two pops with the same points/date pair still remount and replay.
- Keep `growthGain` covered by `pipGrowth.check.mjs`.
- Manual check on `/pet`: a gain, a loss, an evolve, Pip in bed, phone width and reduced motion.
- Version bump (MINOR) and a CHANGELOG line.

### Explicitly out of scope
- Any backend change. Points, thresholds and the bar come from `PetGrowthPolicy` unchanged.
- Pops for sprinkles. The MPP-42 count-up already covers them.
- Pops anywhere outside the room's head bar, such as the header or the wardrobe.
- Changing the existing bar fill, flash, evolve or de-evolve sequence.
- A screen-reader announcement for the pop. `PipHeadBarStatus` already exposes the new value.

### Pattern Reference
None supplied. Chosen references:
- `components/pet/room/PipHeadBar.jsx` / `.css`: units divided by poseScale, and the `--pip-head-bar-flash` CSS-var pattern for passing a JS duration to CSS.
- `utils/pipGrowth.js` + `pipGrowth.check.mjs`: pure helpers pinned by a node check.
- `hooks/usePipGrowth.js`: one timer per effect, cleared on cleanup.

### Constraints flagged on the brief
- Format is exactly "+N" / "−N" (U+2212 minus), then "current / size".
- The pop fades away; nothing persists.
- From the project rules: no frontend test runner (verification is a node check, the build and a manual check), and component files stay under 200 lines.

### Assumptions made
- **Version bump is MINOR** (1.28.x → 1.29.0). It's a new behaviour with no ticket, and CLAUDE.md says "anything else MINOR".
- **CHANGELOG key is the plan slug** `2026-10-30-pip-points-pop`, because there is no MPP ticket.
- **The count shows the settled bar** (the new form's numbers after an evolve or de-evolve), and waits out the animated steps. The "+3" shows immediately. This is already implemented and the developer saw it described; it is unconfirmed.
- **No pop when the points didn't move** (a floored slip at 0 points). Nothing changed, so there's nothing to show.
- **Reduced motion still shows the numbers**, fading without the rise. An opacity fade isn't vestibular motion.
- No pop into or out of Basilisk — Basilisk has no bar (MPP-38 AC 8), so there is nothing to pop over (Defender W1, fix pass).
- A hold (cook scene / announcement) drops the pop; the run replays the bar but not the numbers (Defender W2, fix pass).
- **Pop id comes from a module-level counter in the hook** rather than `points:lastScoredDate`. This guarantees a fresh React key, so the CSS animation restarts.
- **Skipping the HTML mockup** (memory: mockup before UI code). It's a small addition to an existing component, specced exactly by the developer, and already built. The manual check in Phase 2 stands in for the review.

### Cross-code alignment audit (FE ↔ BE ↔ DB)
Skipped: no persistence touched. The pop reads only `points`, `barCurrent` and `barSize`, which `PipGrowthDTO` already sends. The pop does not change how they are used.

---

## Part 2 — Technical design

### Approach
The pop is derived entirely on the client from the existing "since last visit" growth run in `usePipGrowth`. When a run starts, the pure helper `growthGain(seen, growth, steps)` returns `{ text, gained, count, delayMs }`, or null when the points didn't change. `delayMs` is the sum of the non-REVEALED steps, so the count waits out a fill/evolve or drain/shrink. The hook stores the pop in its own `gain` state. It does not derive it from `run`, because a plain bar move lasts only 900 ms and the pop runs 2.4 s, so the pop has to outlive the run. A timer clears the pop after `delayMs + HEAD_BAR_GAIN_MS`. The `gain` flows out through the hook's return, into `levelBar.gain` in `PetView`, and through `RoomPip` to `PipHeadBar`. There, two SVG `<text>` nodes under a keyed `<g>` play CSS keyframes once.

Formalising changes two things. First, the CSS durations (1.2 s delta, 2.4 s count) are currently literals that a comment says must match `HEAD_BAR_GAIN_MS`. They become `--pip-gain-ms` and `--pip-gain-delta-ms`, set inline from the constants, the same way `--pip-head-bar-flash` already works, so the two can't drift. Second, the pop id becomes a counter, so the keyed `<g>` always remounts and the animation replays.

Alternatives considered:
- **Derive the pop from `run` alone:** rejected, because it unmounts after 900 ms on a bar move.
- **A React-driven animation with requestAnimationFrame:** rejected as heavier than a one-shot CSS keyframe for no benefit.
- **Render the pop as HTML over the SVG:** rejected, because it wouldn't follow Pip's pose and walk transforms the way an in-SVG node inside RoomPip does.

### Skills to invoke during execution
- `react-frontend`: owns every touched file (hook, components, CSS, constants, utils), the file-size budget, the no-console rule and the verification honesty rule.

### Diagram
```mermaid
sequenceDiagram
  participant API as /api/pet (growth)
  participant Hook as usePipGrowth
  participant Util as growthGain
  participant View as PetView → RoomPip
  participant Bar as PipHeadBar
  API->>Hook: growth (points changed vs seen)
  Hook->>Util: growthGain(seen, growth, steps)
  Util-->>Hook: { text, gained, count, delayMs } | null
  Hook->>Hook: setGain({...pop, id: ++counter}); setRun(...)
  Hook-->>View: { ..., gain }
  View->>Bar: levelBar.gain
  Bar->>Bar: <g key=id> "+3" rises+fades (delta ms) → "6 / 21" after delayMs, fades (gain ms)
  Hook->>Hook: setTimeout(delayMs + HEAD_BAR_GAIN_MS) → setGain(null)
```

### Data shapes
No schema or contract changes. Client-side shapes:

#### `growthGain(seen, growth, steps)` in `utils/pipGrowth.js`
Returns `null`, or:
```js
{ text: '+3' | '−3', gained: boolean, count: '6 / 21', delayMs: number }
```

#### `usePipGrowth` return
Adds `gain: { id: number, text, gained, count, delayMs } | null` to the existing shape, including `NO_GROWTH`.

#### Constants in `constants/pipGrowth.js`
- `HEAD_BAR_GAIN_MS = 2400`: the count's run and the hook's clear timer (exists).
- `HEAD_BAR_GAIN_DELTA_MS = 1200`: the "+3" run (new).

#### CSS custom properties on `.pip-head-bar-gain`
`--pip-gain-delay` (exists), `--pip-gain-rise` (exists), `--pip-gain-ms` (new), `--pip-gain-delta-ms` (new).

### Runtime quality notes
Mapped onto the browser runtime:
- **Resource cleanup:** one `setTimeout` per pop in a `[gain]` effect, cleared on cleanup and on unmount. The CSS animation needs no cleanup.
- **Concurrency / ordering:** a new run can't start while one is active, so pops don't overlap mid-run. A pop from a previous run may still be fading when the next starts. `setGain` replaces it, and the new key remounts the group. The counter guarantees the key changes.
- **Allocation / cost behaviour:** two `<text>` nodes for at most about 5 s. The animation is compositor-friendly (opacity and transform). There's no extra re-render beyond the two `setGain` calls.
- **Error paths:** none new. `growthGain` is only called when the change is non-null, so `seen` and `growth` are both present. A missing `barSize` on either side (Basilisk) returns null, so no pop is drawn.

### Risks and judgement calls
- **Text over the room's top edge:** when Pip is tall, in bed or behind a hat, the rising "+3" (12 room units above the bar) might clip at the SVG top. The manual check covers it. If it clips, reduce `--pip-gain-rise` rather than move the bar.
- **Legibility at phone width:** 9 and 7 room units with a white halo. Check on a 375 px viewport. Font size is the lever.
- **A loss shows a rust "−3"** instead of the green, which is warmer than the slip line's tone. It doesn't shame the user (AC 9), but sanity-check the colour.
- **No pop into or out of Basilisk**, and a hold drops the pop (see Assumptions; Defender fix pass).
- **The counter is module-level.** It's shared across hook instances, but only uniqueness matters, so that's harmless.

# Findings: MPP-45

## Mockup smoke

Run 2026-11-16 with `--expect-complete`, from the repo root. Both files printed identical output and exited 0.

`node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html --expect-complete`
`node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html --expect-complete`

```
missing: 0 unique ids (0 boxes across 244 renders)
fit: stations 20/20 fit (0 not drawn); decor 55/55 fit (0 not drawn)
labels: stations 5, levels 5 x 4/4/4/4/4, decor 55, styles 10
geometry: 267 numbers checked against the live code
mockup smoke OK
```

No geometry mismatch: the ports are safe to proceed.

## SSR baseline

`node scripts\room-ssr.mjs --write <ssr-baseline>` wrote 8 files (day-rug-l1-defaults 18524, all-l4-every-spot 58976, asleep-l2 20746, cooking-served-fridge-50 19099, editing 25878, station-thumbs 60187, decor-thumbs 154131, style-tab-and-chips 5545 chars), taken from unmodified `client/src/`. `--compare` then printed `Room SSR OK: 8 fixtures identical`. The script silences only the `useLayoutEffect does nothing on the server` warning from `usePipCamera`.

## SleepZs

```
1 zzz at 273.2 246.0 bed top at 338.4 271.4
2 zzz at 271.3 221.8 bed top at 336.6 247.1
3 zzz at 280.7 218.1 bed top at 345.9 243.5
4 zzz at 280.7 218.1 bed top at 345.9 243.5
```

Each level's offset is (+65.2, +25.4) px, which is `shiftPx(STATION_SHIFT.bed)` for `[0, 70]`. `SleepZs` is drawn after the frontFloor layer, outside the bed's `ShiftedStation` group, so the Zs sit about 70 v-units off the shifted bed.

Confirmed: Task 10 runs.

### Phase 2 SSR compare (Task 11)

With only `HERB_ROOM` registered, 7 of 8 fixtures were byte-identical to the baseline. `asleep-l2` differed in exactly two ways, both caused by the Task 10 move:

1. The `SleepZs` output, `<g transform="translate(271.3,191.8)"><g class="pip-zzz"><text x="10" y="0" …>z</text><text x="22" y="-12" …>z</text></g></g>` (identical text), moved from after the front-floor decor layer (outside the bed) to the end of the bed's `ShiftedStation` group, after `art.front`. Offset 19559 before, 19429 after.
2. The `useId` prefix of Pip's figure gradient ids (`pip-figure-R6c93…` became `pip-figure-Rac93…`). React derives it from the tree position, and `Station`'s bed fragment gained a fourth child. Ids stay unique, nothing else reads them.

After normalising the useId prefix and removing the moved Zs wrapper from both files, the remaining markup is equal. The baseline was then rewritten (`--write`), and `--compare` printed `Room SSR OK: 8 fixtures identical`.

## Shared engine

`pip-room-robot.html:337-520` (`room-iso`) diffed against `pip-room-dragon.html:335-518`: **identical** (empty `diff`, line offset only). One `packShapes.jsx` serves both packs. `iso.js` already exports `rectVPoints` / `rectUPoints` / `rectHPoints`, so they are imported, not copied.

## Dragon pack fidelity (Phase 3)

Every dragon drawing was compared against the mockup's own string output: the `DRAGON_ROOM` blocks were evaluated in node and every attribute value (`points`, `d`, `transform`, `fill`, `stroke`, `opacity`, `class`, sizes) was compared in document order against the SSR markup of the JSX port. Covered: 5 stations x 4 levels (bed back and front), the backdrop for 4 wall x 4 floor styles x day and night, and the four effects (gauge at 0/30/50/100 %, steam, zzz, plate). Result: identical in order, except:
- `x="-.6"` vs `x="-0.6"` (same number, written differently).
- `cooker` L1: the mockup split the pot-ring string in half by character count (`ring.slice(0, ring.length / 2)`), which cuts through a `<polygon>` tag. The JSX port splits the nine rocks by element (4 behind the pot, 5 in front), so it is correct markup instead of a broken one. Visually the same rocks, in the same depth order.

## Robot pack fidelity (Phase 4)

Same method as the dragon: the `room-geometry`, `room-iso` and `room-pack` blocks of `pip-room-robot.html` plus the engine's own `backdropSVG` / `part` (lines 1896-1923) were evaluated in a node `vm`, and the resulting strings were tokenised and compared tag by tag, attribute by attribute in document order (numeric values compared as numbers) against the SSR markup of the JSX port. Covered: 5 stations x 4 levels (bed back and front separately), the backdrop for all 6 wall x 4 floor styles x day and night (48), the four effects (gauge at 0/10/30/50/77/100 %, steam, zzz, plate) at every level, plus `styles`, `labels.stations/levels/styles` (deep equal) and the station/shell/window ambience subset. 108 fragments, 0 differences. Two negative controls (steam vs plate, cabinet L2 vs L3) were flagged as expected, so the compare is not vacuous. Scratch script, not committed.

- No `cooker` pot-ring string-split quirk in the robot art, so no deliberate deviation.
- Night rain: `<clipPath id="robot-glass-clip">` plus `room-fx room-fx--rain` kept; the fixed id carries the plan's comment in `robotShell.jsx`.
- Split for the 400-line budget: `robotFloors.jsx` (the four floor patterns) out of `robotShell.jsx` (379 lines).
- Decor-only helpers left for MPP-47: `ellU`, `slabU`, `bandAt`, `ringLine`, `ellBand`, `limb`, `gear`, `hat`, `digit7`/`SEG7`, `ringPts`, `HI`, `PLATE`, `INKBLUE`, `discU` (unused by any non-decor code). Decor-id ambience entries (lines 1669-1676) were not copied.
- Follow-up (not fixed): `robotParts.jsx`'s `glowG` mirrors the dragon pack's inline `<g {...glow()}>`; a shared `glowG` in `packShapes.jsx` would dedupe both, but touches Phase 3 files.

## Literal audit (Phase 5, Task 26)

Command: `Select-String` for `#hex` / `rgb(a)(` over `PetView.css`, `SprinklesChip.css`, `room/*.css` after Tasks 23-25. Every hit is room art, the pin, or a black shadow; no missed chrome literal.

- `PetView.css:15-21` — pin (the Default tokens re-declared on `.pip-fridge-view, .pip-cabinet-view, .pip-wardrobe-preview`, plus `--pip-focus-ring`)
- `PetView.css:60` — roomArt (black shadow, speech bubble)
- `room/FridgeView.css:14, 38, 48, 53, 70, 79, 81, 89, 97, 102, 110` — roomArt (Fridge interior)
- `room/PetRoom.css:11` — roomArt (surround outside the room)
- `room/PetRoom.css:74, 403` — roomArt (black shadows)
- `room/PipHeadBar.css:3, 4, 7, 22, 32, 38, 39, 42` — roomArt (head bar)
- `room/TrophyCabinetView.css:14, 15, 41, 42, 50, 53, 63, 65, 73, 84, 119, 120, 129, 143, 149, 152` — roomArt (Trophy cabinet scene)
- `room/WardrobeView.css:78, 96, 187` — roomArt (Dress Pip stage)
- `SprinklesChip.css` — no literals left (all five now tokens)

## Token value changes

None. All 36 pairs x 3 themes passed AA with the mockup's Parchment and Cyberpunk values as written. No pair was adjusted and no `KNOWN_EXCEPTIONS` entry was added.

## Phase 5 deviations from the plan text

- The pin moved to `.pip-fridge-view, .pip-cabinet-view, .pip-wardrobe-preview` only, not `.pip-room-svg`. The room SVG art is drawn from literals and has no `var(--global)` consumer except the decor-spot tag (`PetRoom.css` `.pip-decor-spot-tag`), which the chrome table tokenises as chrome: pinning the svg would have paired a Default `--bg-primary` fill with a themed `--pet-label-text`. The head bar is literal-only and needs no pin.
- The pin rule gained `--pip-focus-ring: #7c5cd6` and `color: var(--text-primary)`. The first keeps the ring visible on the light fridge now that `--pip-focus-ring` is themed (Cyberpunk yellow on `#eef6fb` would be about 1.1:1); the second re-resolves inherited text colour inside the scenes, which used to come from the pinned `.pet-view` tokens.
- `check-themes.mjs` `resolve` now follows `var()` chains up to 5 hops (a single hop was enough before; `--on-brand: var(--page)` style chains are fine, this is a safety margin for the pet tokens).
- Mockup follow-up for Phase 6: the pair table lists `--pet-wardrobe-worn-ring`; the normalised name is `--pet-wardrobe-worn-shadow` (its property is `box-shadow`).

## Phase 6-7 notes

- Task 29: `chrome-smoke.mjs` (contract `2026-11-16-themed-pip-rooms-mockups`) took a `POST_SWEEP = true` switch. Its pre-sweep source-line and literal-coverage audits cannot pass once the literals live in `styles/themes/*.css`; with the switch it checks each token's Default / Parchment / Cyberpunk value against the theme CSS, then runs the contrast pairs unchanged. It needs the HTML path as an argument. Result: `chrome smoke OK: 76 tokens, 36 room-art literals, 36 pairs x 3 themes`.
- M.2 step 3: the plan's regex (`--pet-(accent|line|...)`) also matches the prefix of the normalised names (`--pet-accent-color`, `--pet-hit-active-bg`) because the word-boundary anchor fires before `-`. With a strict lookahead (`(?![\w-])`) there are zero hits.
- M.1: version 1.34.0 (other work, uncommitted) bumped to 1.35.0.

## Review fix round 1

- DRY: `SKIRTING_HEIGHT` is now exported from `room/roomDecor.jsx` (markup-neutral) and imported by the dragon and robot shells. `wallAt`/`wallLen` and `glowG` moved into `packs/packShapes.jsx`; both packs import them from there (robot's `glowG` left `robotParts.jsx`, the five dragon inline `<g {...glow()}>` wrappers became `glowG(...)`). No shared `shellBase` backdrop helper, by decision (mockup fidelity).
- `pack.ambience` / `pack.labels` kept. All three packs already set `labels: ROOM_LABELS[line]` (one copy). `roomPacks.js` now documents that `ambience` is declarative (animations come from `room-fx--*` in roomFx.css) and `labels` is read through `petRoomLabels.js`.
- `packStyle`: a non-herb pack that lacks an id now falls back to its own default wall/floor style for that spot (never the herb style object); unknown ids return null; herb unchanged.
- `packs.check.mjs`: uses `PIP_LINE.HERB`; for non-herb packs asserts non-empty `ambience`, each effect is a `.room-fx--*` loop parsed from roomFx.css (and the 11 expected loops exist), each target is shell/window/station/decor id, no extra station/style/decor keys; every pack asserts `pack.labels === ROOM_LABELS[line]`. Mutation-checked (bogus effect, bogus target, wrong labels each failed with the expected message), then reverted.
- Low FX glow leak: `robotEffects.jsx` (indicator LED circle) and `robotFridge.jsx` (cryo cross) now carry `data-glow` via `glow()` spread on the same element, so no wrapper was added. Grep of `drop-shadow`/`filter:` across dragon and robot shows only `glow()` in `packShapes.jsx`. The mockup used plain inline filters, so the dragon/robot SSR output differs from before by `data-glow=""` only (13 added; scratch before/after compare of every station level, every backdrop day/night and the effects: identical after stripping that attribute).
- Unknown ids: `RoomStyleChips` and `ShopStylesTab` skip an item whose `packStyle` is null. `packStationArt` clamps the level to the pack's built levels (herb, with no builds, still goes through `HERB_ROOM.stationById` unchanged).
- Skipped by instruction: `robotShell.jsx` size (376 lines, under 400), `packBackdrop` dual path, `packDecorArt` double cache.

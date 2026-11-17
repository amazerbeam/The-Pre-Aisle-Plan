# Pip's Path mockup (2026-11-17-pips-path-mockup)

Plan: [plan.md](plan.md). Tasks: [tasks.md](tasks.md). Version: **1.43.0** (MINOR bump, Story).

## Summary

Adds `foodbytes-app/mockup/pips-path.html`, a playable mockup of Pip's games: tap Pip (option A) or a Games pill (option B) -> "Play a game with me?" -> game picker -> Pip's Path chapter map -> board. Screens also cover cleared, stuck, endless mode and a Chapter 2 refresher preview, plus proposed rewards (3 sparkles first clear, 1 endless, cap 10 a day), proposed `--pp-*` tokens and a notes panel.

Three skins, one per Pip line: Garden Path (herb, Default), Ember Trail (dragon, Parchment), Circuit Run (robot, Cyberpunk).

10 solver-verified Garden Path levels (solution counts): 8, 12, 4, 9, 7, 1, 6, 1, 1, 4.

Also: `foodbytes-app/mockup/README.md` row, `CHANGELOG.md` line, version bump in `package.json` and `pom.xml`.

**No migration and no Railway step.** No change under `client/src` or `foodbytes-api/src`.

## Verification

- `node .claude/contract/2026-11-17-pips-path-mockup/mockup-smoke.mjs` (exit 0):
  - `Tokens OK: 14 --pp-* tokens × 3 themes, 12 AA pairs`
  - `Pip's Path core OK: 10 levels, engine, sequencer, rewards`
- `npm run check:version`: `Version OK: 1.43.0`
- `npm run build`: `built in 1.55s` (only the usual chunk-size warning)
- No `console.log/debug` in `pips-path.html`; `git status` on `client/src` and `foodbytes-api/src` is clean.
- Not verified: visual checks are pending a manual browser pass. `mvn test` not run (only the `pom.xml` version changed).

## Deviations from plan

- A bare `#s=cleared` hash starts from preset `new`; `s=endless` defaults to preset `all`, and `s=ch2` to `ch2`.
- Pip's aria-label is "Play with Pip".
- 6-column tiles are about 45 px at 320 px (still at least 44).
- One word changed in the copied Pip art ("window glows" -> "glass glows") for the purity check.
- The smoke uses a `plain` deepEqual wrapper for vm cross-realm objects.

## Open review choices

- Entry option A (tap Pip) or B (Games pill)
- One title or per-skin titles
- The reward numbers

## Note for contributors

Puzzle logic for Pip's games lives in pure `<script id>` blocks so it can be ported and smoke-tested; boards are at most 6 columns (48 px tiles at 320 px).

## Review fixes

- `nextPuzzle` is pure (returns `resetSeen`, or `null` when nothing to play); `rng() === 1` is clamped; `chapterQueue` throws clear errors and drops missing refreshers.
- `validateLevel` moved into `pp-engine`; `parseLevel` validates and throws `invalid level: <id> …`.
- One reward per attempt (sticky result); the board is frozen after a clear (only Undo, Restart, R act).
- Drag tracks one pointer and samples coalesced/interpolated points, so fast swipes do not skip tiles.
- Focus moves sensibly between room, offer, picker and map; Escape steps back; Tab is trapped inside the `aria-modal` sheets (kept `aria-modal`); modal ids are unique per frame.
- Small cleanups: `roomActions()` loses its unused param, `playNext()` replaces duplicated cases, magic numbers named, smoke file tidied.

## Suggested commit subject

`2026-11-17-pips-path-mockup: Pip's Path mockup with Garden Path levels and three skins`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

## Post-review change (developer request)
- Blocked tiles (`#`) are now plain black in every skin (`--pp-rock: #000000`), with no skin art, so it is obvious where Pip can't walk. `rock` was dropped from `SKIN_ART_KEYS` and the three skins.

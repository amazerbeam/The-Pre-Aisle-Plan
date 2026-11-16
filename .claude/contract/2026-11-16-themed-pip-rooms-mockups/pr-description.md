# 2026-11-16-themed-pip-rooms-mockups: themed Pip room mockups (lair, workshop, room UI)

Plan: [plan.md](plan.md)

## Summary

Three approved mockups in `foodbytes-app/mockup/`, all approved on 2026-11-16:

- `pip-room-dragon.html` (Pip's dragon lair), approved 2026-11-16
- `pip-room-robot.html` (robot workshop), approved 2026-11-16
- `pip-room-chrome.html` (themed room UI chrome), approved 2026-11-16

Version 1.33.0 to 1.34.0. CHANGELOG: `1.34.0 — 2026-11-16-themed-pip-rooms-mockups: mockups for Pip's dragon lair, robot workshop and themed room UI (no app change)`.

## Migration / app change

No migration. No app code changed (Task M.2): `git diff` touches only the two version lines under `foodbytes-app/client` (`package.json`) and `foodbytes-app/foodbytes-api` (`pom.xml`). `npm run build` OK, `npm run check:version` OK.

## Smoke outputs

- Both room files pass `mockup-smoke.mjs --expect-complete`: missing 0, stations 20/20 and decor 55/55 fit, labels 5 / levels 5x4 / 55 / 10, 267 geometry numbers checked.
- `chrome-smoke.mjs`: 75 tokens (55 new + 20 existing), 36 room-art literals, 36 pairs x 3 themes, all AA.
- QA mutation tests showed both smokes fail correctly.

## Decisions at review

- Names: no renames, no art changes.
- Robot night-window rain: **kept**. Its pending note and the `data-open-question="robot-rain"` attribute were removed; the rain stays in `ROBOT_ROOM.ambience` and the window art.
- Added scope: `labels.levels`, a name per station level per creature.

## Follow-ups for contract 2 (review notes, all reviewers approved)

a. Escape the URL-hash placement id in `missingBox`, or drop unknown ids, in both room files.
b. `mockup-smoke.mjs` should assert a minimum geometry `checked` count and default to strict mode.
c. Hash-compare the shared engine blocks across the two room files.
d. Normalise the `--pet-*` token names to `--pet-<area>-<role>`: `--pet-accent`, `--pet-line*`, `--pet-card-bg`, `--pet-tag-bg`, `--pet-text-*`, `-fill` vs `-bg`, and the duplicate error/warn tokens.
e. The Fridge, Trophy cabinet and head bar are classified as room art, so the herb-green head bar sits over the dragon and robot. Revisit in contract 2.
f. `SprinklesChip.css` was not audited.
g. `--pip-focus-ring` is not themed.
h. Two pre-existing Default contrast misses: the badge at 3.56:1 and the worn dot at 2.76:1.
i. Possible live bug: the `SleepZs` effect is drawn unshifted relative to the bed (about 70 v-units off), in `PetRoom.jsx`.
j. The shop status-line copy in the chrome mockup was invented; confirm it against the live `upgradedLine` / `levelSetLine`.
k. Both smokes locate the live code differently (`import.meta.url` vs HTML path). Unify them before archiving.

## Note for contracts 2-4

Port from `foodbytes-app/mockup/pip-room-*.html`; the room packs and token table are laid out in the shape contract 2 implements; re-run `mockup-smoke.mjs` first to confirm the copied geometry still matches the live code.

## Suggested commit subject

`2026-11-16-themed-pip-rooms-mockups: themed Pip room mockups (lair, workshop, room UI)`

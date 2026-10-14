# MPP-29: Pip's room polish pass (focus rings, states, 3 s motion limit)

Plan: [plan.md](plan.md) (same folder). Version: **1.24.0** (MINOR, Jira Task).

## Summary
- **AC 1 (focus and states):** every Pip-room control now has a visible `:focus-visible` ring from shared tokens, and the missing hover/pressed states are added (fridge, cabinet, shop, wardrobe, edit bar, decor picker).
- **AC 2 (motion):** the 3 s limit is pinned in `check:cook` / `check:growth` via `PIP_ANIMATION_MAX_MS`. The cook scene is retuned to 3.0 s (0.7 / 1.0 / 0.8 / 0.5). The walk duration is read from `COOK_PHASE_MS.walking`. Overlays share one entrance (`pip-overlay-in`). There is one `prefersReducedMotion()` in `utils/reducedMotion.js`.
- **AC 3 (dark mode):** skipped by developer decision; FoodBytes has no dark theme.
- **AC 5:** no mini cook animation next to `PetReaction`. MPP-34 deleted it on purpose, and the tick hands off to `/pet`, where the full cook-and-serve scene plays. A second animation would duplicate it.

## Migration
None. Frontend only; nothing to apply to Railway.

## Verification
- `npm run check:version`: `Version OK: 1.24.0`
- M.2 greps: no `outline: 3px solid #` in the room CSS. `0.32s|1.25s` has one benign hit, `PetRoom.css:47`, the idle `.pip-hop` ambient hop loop (out of scope, not a one-shot animation). The reduced-motion helper grep shows the single `REDUCED_MOTION_QUERY =` export in `utils/reducedMotion.js`. It also matches 4 pre-existing `console.log` lines in `hooks/useWakeLock.js` (known debt, untouched).
- All 11 `check:*` scripts (macros, pet, pip, room, cook, fridge, checkin, awards, growth, wardrobe, bubble) pass.
- `npm run build`: built in 799 ms, no errors.
- `node foodbytes-app/database/build-golive.mjs --check`: `Go-live OK: 10 migrations`.
- Not verified by the executor: visual behaviour. The client has no UI test runner. The developer review in `visual-review.md` (phone widths, motion feel, focus walk, clothing art) is **pending**.

## Convention note
Pip-room focus rings and sheet timing come from the `--pip-*` tokens in `global.css`. One-shot room animations must stay under `PIP_ANIMATION_MAX_MS`, which `check:cook` / `check:growth` enforce.

## Suggested commit subject
`MPP-29: Pip's room polish pass (focus rings, states, 3 s motion limit)`

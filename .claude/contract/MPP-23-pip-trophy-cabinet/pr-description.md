# MPP-23: Trophy cabinet view and new-award bubble

Plan: [plan.md](plan.md)

## Summary (v1.15.0)
- A cabinet button in Pip's room opens a trophy cabinet overlay.
- Three shelves (plan / snack-free / alcohol-free) showing now, best and next milestone, with x N award counts.
- A note and the "firsts" list.
- Pip's bubble announces newly earned awards (per-browser baseline in `awardSeenStore`).
- Frontend only; version bumped 1.14.0 -> 1.15.0 (package.json, pom.xml, CHANGELOG).

## Migrations
None. Nothing added to `MPP-15-epic-breakdown/railway-migrations.md`. Depends on MPP-22 and MPP-24's `pet_awards` / `pet_firsts` being applied before the epic merges to master.

## Verification
Exercised (automated):
- `npm run check:version` - Version OK: 1.15.0
- `npm run check:awards`, `check:room`, `check:checkin`, `check:fridge`, `check:cook` - all pass
- `mvn test` - 235 run, 0 failures, 0 errors, BUILD SUCCESS
- `npm run build` - built OK
- Greps: no stale FRIDGE_HINT / FridgeButton / pip-fridge-btn; no new console.log/debug (only the existing baseline in useWakeLock.js and api.js); all touched files under 400 lines.

NOT exercised: the five manual browser observations from Task 12 Step 5 (cabinet opens / room inert, shelves and x N, note and firsts, announcement bubble, error + Try again). The developer still needs to do these. No frontend test runner exists.

## Convention note
Room overlays use `useRoomOverlay` + `StationButton` + a `*HitBox(level)` in `roomLayout.js`; new award lines come from `usePetAwards`'s per-browser baseline (`awardSeenStore`).

## Suggested commit subject
`MPP-23: Trophy cabinet view and new-award bubble`

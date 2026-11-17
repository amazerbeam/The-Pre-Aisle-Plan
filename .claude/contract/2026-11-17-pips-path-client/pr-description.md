# MPP-49: Pip's Path client (tap Pip to play, picker, chapter map, Garden Path board) + reuse open maps

Version 1.45.0 (MINOR). Plan: `.claude/contract/2026-11-17-pips-path-client/plan.md`. Backend contract: `.claude/contract/2026-11-17-pips-path-backend/`.

## Summary
- Tap Pip in the room: "Play a game with me?" offer (Play a game / Not now); ignored while a check-in is open.
- Games sheet: picker, then Pip's Path chapter map, then the board (tap, drag, keys, restart, revisit-restarts, stuck state, clear card).
- Three skins keyed on Pip line: Garden Path (herb), Ember Trail (dragon), Circuit Run (robot). Board chrome uses the `--pp-*` tokens.
- Server-checked clears (5 sprinkles, cap 50/day) with the header balance updating from the response.
- Backend: an open, uncleared map is handed back per slot (reuse rule). The REFRESHER reuse branch is untestable until a second puzzle family ships.
- Mockup `foodbytes-app/mockup/pips-path.html` synced (Option B "Games pill" removed, README says live from v1.45.0).
- Developer change (2026-11-17): no Undo; revisiting a tile restarts. The Undo button, its keys (Backspace / Z) and drag-backtracking are gone. Walking from Pip's tile onto an adjacent tile already on the path restarts the level (taps, drag steps and arrow / WASD keys; a drag ends at the restart); Pip says a per-skin reset line until the next step. Tapping Pip's own tile or a non-adjacent tile does nothing. The stuck pulse moves to Restart, which also un-freezes a cleared board (a second clear answers "Already counted"). Mockup and its smoke check updated to match.

## Migrations
None in this ticket. Railway still needs the backend's `mpp15-railway-golive.sql` at the MPP-15 merge (unchanged).

## Verification
- Backend: `mvn test` BUILD SUCCESS, 604 tests, 0 failures, 0 errors.
- Client: `npm run build` OK (built in 1.32s); `check:games` (Pip's Path engine OK), `check:bubble`, `check:room`, `check:version` (Version OK: 1.45.0) all exit 0.
- `check:themes` exits 1 on a PRE-EXISTING Default failure, `folder-chip-text on folder-chip-bg (default): 4.36 < 4.5` (introduced by commit 4af2726, before this branch; not fixed here). The known `text-secondary on bg-secondary (default)` WARN also prints. No `pp-*` pair fails. The "Themes OK" line was not reached; needs its own ticket.
- Greps: no console.log/debug, dangerouslySetInnerHTML or direct axios in the new code; no theme-id branching in games components; Option B gone from the mockup.
- No frontend test runner exists; client behaviour beyond the node check scripts and the build is unverified until the Task 24 play test.


## Task 24 manual checklist (PENDING, developer to run at http://localhost:3000)
1. Room: tap Pip offer, Not now, check-in open: PENDING
2. Games sheet close / focus return: PENDING
3. Chapter map locking: PENDING
4. Board input, revisiting a tile restarts (no Undo), Restart button, stuck: PENDING
5. Clear, `+5`, header balance, map progress: PENDING
6. Reuse of the same map after going back: PENDING
7. Restart then re-clear shows "Already counted": PENDING
8. Offline clear, Try again: PENDING
9. Three themes at 320 and 1280 px, tiles >= 44 px, no horizontal scroll: PENDING
10. Low FX / reduced motion: PENDING
11. Daily cap (10 maps, then 50/50 line): PENDING

## Plan deviation
The tap-Pip button is not rendered while Pip is asleep (the plan assumed a sleeping Pip is tappable, but he is not drawn in bed, so there was nothing to tap). Its box overlaps the cabinet and wardrobe boxes, so it sits before the station buttons in the DOM and they win the overlap.

## Future chapters
A new family adds a `PuzzleFamily` bean on the server and a skin entry plus art set per Pip line in `constants/pipsPath.js` / `pipsPathArt.jsx`.

## Branch
`feature/MPP-49-pips-path-client`, stacked on `feature/MPP-49-pips-path-backend`; push both after Task 24 passes.
Suggested commit subject: `MPP-49: Pip's Path client (tap Pip to play, picker, chapter map, Garden Path board) + reuse open maps`

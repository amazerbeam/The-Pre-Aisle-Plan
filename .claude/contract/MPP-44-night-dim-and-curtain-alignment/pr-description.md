# MPP-44: night dim covers the whole stage; curtains centred on the sill

Plan: [plan.md](plan.md)

## Summary
- **Night dim:** moved out of the SVG world into a stage-level `.pip-room-night-dim` div, a sibling after `.pip-room-world` in `.pip-room-stage`. It now covers the whole visible stage (not just the world SVG), ignores pointer events, and sits under the bubble, hint and target marker.
- **Curtains:** both curtain styles in `decorArtWindow.jsx` are now mirrored about v 198 (rod, caps, panels, folds, tie-backs) so they centre on the window, and the panels end at the sill top (h 74).
- **Version:** 1.28.1 -> 1.28.2 (Bug, PATCH). CHANGELOG updated.

## Migrations
None.

## Verification
- Task 3 / Task 6 (phase builds): passed during Phases 1 and 2.
- Task 7 (manual browser check, incl. how the dimmed "z z" reads, each curtain with every window placement, day and night, phone width, thumbnails): **PENDING developer verification. Not yet performed.**
- Task 9 greps: old geometry patterns -> zero hits; `NightDim` in PetRoom.jsx -> two hits (import line 18, `{asleep && <NightDim />}` line 168, after the world div); `console.log/debug` in room/*.jsx -> zero hits.
- Task 10: `mvn test` -> 442 run, 0 failures, 0 errors, BUILD SUCCESS.
- Task 11: `npm run build` -> built in 1.08s, no errors (existing chunk-size warning only). `npm run check:version` -> Version OK: 1.28.2.

## Convention note
Screen-fixed room layers (hint, target marker, night dim) live in `.pip-room-stage` as siblings of `.pip-room-world`, never inside the SVG.

## Suggested commit subject
`MPP-44: night dim covers the whole stage; curtains centred on the sill`

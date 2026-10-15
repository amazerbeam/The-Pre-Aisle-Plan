# MPP-39: Pip's room on a zoomable camera; white walls by default (1.26.0)

Plan: [plan.md](plan.md)

## Summary
Pip's room is bigger and lower, with stations and decor spread out. It opens zoomed in on Pip. Drag or pinch (Ctrl+wheel on desktop) to look around. The camera floats back to Pip after 2 s and follows him. Zoom is remembered in this browser. The recentre button, keyboard control and reduced-motion handling are in. The default wall is White (Lavender stays free and owned). Skirting and corner lines were added. Version bumped 1.25.1 -> 1.26.0 (Story = MINOR).

## Migrations
**None.** No room stores a wall style (0 rows locally and on Railway), so the White default applies through `DecorCatalogue.defaultFor`. Nothing goes into `mpp15-railway-golive.sql`.

## Verification
- `npm run check:version`: Version OK: 1.26.0
- `check:room`, `check:camera`, `check:pip`, `check:cook`, `check:wardrobe`: all print "... checks passed"
- `mvn test`: 401 tests, 0 failures, 0 errors, BUILD SUCCESS
- `npm run build`: built in 923ms, no errors
- Stale-reference greps (old viewBox / scene / lavender default): zero hits. `console.log` hits exist only in untouched `useWakeLock.js` and `api.js`.
- Task 10 / 12 results: see the Implementer reports for those phases.
- Task 14 manual browser checklist (drag, pinch, float-back, follow Pip, station and decor positions): **pending developer manual check**. Note any position that looks off (shift values in `roomLayout.js`).
- Not covered by automation: the client has no component test runner; camera and hit-box behaviour in a real browser is unverified until the manual check.

## Note for future contributors
Room art keeps its MPP-16 coordinates: a station or decor spot is placed in the bigger room by `STATION_SHIFT` / `DECOR_SPOT_SHIFT` (an SVG translate), and the room's tap areas must use the shifted `*HitBox` functions with `hitBoxStyle` (% of `ROOM_WORLD`).

## Suggested commit subject
`MPP-39: Pip's room on a zoomable camera that floats back to Pip; white walls by default`

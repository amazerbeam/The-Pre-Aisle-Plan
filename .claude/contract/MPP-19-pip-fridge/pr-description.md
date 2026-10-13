# MPP-19: Pip's fridge gauge and 15-slot fridge view (v1.10.0)

Plan: [plan.md](plan.md)

## Summary
- `utils/fridgeFill.js`: fridge window (7 days containing today, aligned to the meal-plan start day), fill/percent/slot helpers, band, note, bubble copy. Pinned by `fridgeFill.check.mjs` (`npm run check:fridge`).
- Fridge constants in `constants/petRoom.js`; `PetContext` exposes `fridge = { fill, loading, error, retry }`, reusing the calendar `weekPlan` when it is the fridge week.
- Level-aware gauge drawn on the fridge in the room SVG; level-aware `fridgeHitBox` with a real button over the fridge.
- `FridgeView` dialog (15 slots on 3 shelves, meter line, note, "Back to room"), four async states, own scroll. `useRoomOverlay` handles open/close, Escape, focus in and focus return.
- Low-stock idle bubble ("The fridge is getting empty") at 20 % or below, priority cook > fridge-low > mood. "Tap the fridge" hint.
- Version 1.10.0 (Story, MINOR) in package.json and pom.xml, plus CHANGELOG.

## No migration, no backend change
Frontend only (pom.xml version bump aside). Railway redeploys the web service on push.

## Verification
- `check:version`: Version OK: 1.10.0 (done)
- `check:fridge`: fridgeFill: all checks passed (done)
- `check:room`: room checks passed (done)
- `check:pet`: petMood: all checks passed (done)
- `check:pip`: pip position checks passed (done)
- `check:cook`: cook-and-serve checks passed (done)
- `check:macros`: All macro traffic-light checks passed (done)
- `npm run build`: built in ~0.8s, no errors (done)
- Line counts: fridgeFill.js 88, useRoomOverlay.js 43, FridgeView.jsx 74, PetRoom.jsx 147, roomEffects.jsx 66, roomLayout.js 112, PetContext.jsx 193, PetView.jsx 85 (all under 200)
- Grep audits: no console.log/debug, no hard-coded fridge copy/thresholds outside constants, no .module.css (done)
- Manual browser checks (Task 9 Step 5: gauge colours, tap/keyboard open, Escape, focus return, low-stock bubble, empty-plan state, hint): **unverified** (no browser available; there is no frontend test runner)

## Notes for future contributors
- The fridge window rule lives only in `fridgeWindow()`.
- `FRIDGE_FOOTPRINT` must be updated with any fridge art change (MPP-26).
- `useRoomOverlay` is the overlay pattern for MPP-23's cabinet.

## Suggested commit subject
`MPP-19: Pip's fridge gauge and 15-slot fridge view`

## Review fixes
- Fridge dialog keeps focus after "Try again"; overlay traps Tab and ignores Escape from outside the panel (useRoomOverlay).
- Fridge shows loading, not "nothing planned", while the calendar week is still fetching (planCoversRange).

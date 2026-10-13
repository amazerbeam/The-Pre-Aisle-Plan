# MPP-18: Pip cooks and serves a newly eaten meal on /pet

Plan: [plan.md](plan.md) (same folder)

## Summary

On `/pet`, the viewer's newest unseen eaten breakfast/lunch/dinner plays Pip's scene once: walk to the cooker, cook (steam), serve (plate on the counter), walk back. Under `prefers-reduced-motion` only the served plate shows (about 2.5 s, no movement). The "last seen" marker is per user, stored in try/catch `localStorage` with an in-memory fallback, so a reload never replays the scene and a disabled-storage browser replays at most once per page load. Several new meals give one scene (the latest). Partner ticks do not trigger it (per-person eaten ticks, MPP-33). Frontend only.

Version: **1.9.0** (MINOR, Story). `client/package.json`, `foodbytes-api/pom.xml` and `CHANGELOG.md` agree.

## Migrations

None. No Railway step, frontend only.

## Verification

- `check:version` — `Version OK: 1.9.0`
- `check:macros` — passed
- `check:pet` — `petMood: all checks passed`
- `check:pip` — `pip position checks passed`
- `check:room` — `room checks passed`
- `check:cook` — `cook-and-serve checks passed`
- `npm run build` — `built in 770ms`, no errors
- Line counts: `PetRoom.jsx` 87, `roomEffects.jsx` 51, `PetView.jsx` 82, `useCookAndServe.js` 47 (all under 200)
- No `console.log` / `console.debug` in the new or touched files.

### Manual checks (Task 10 Step 3) — NOT RUN YET, pending developer verification

No browser was available to the implementer, so none of these five results exist yet. The hook, timers and rendering are verified by build and node checks only; nothing in the browser is verified.

1. Delete `foodbytes.pip.lastSeenEatenAt.*`, tick today's lunch, open `/pet` at 390 px: walk, "Yay, lunch time! Let me cook 🍳", "Cooking your lunch…" with steam, "Lunch is served! 🍽️" with plate (not over the fridge), walk back, normal bubble, no horizontal scroll. — not run
2. Reload `/pet`: no scene; the key holds a number. — not run
3. Tick breakfast and dinner, open `/pet`: one scene for the last ticked. — not run
4. Emulate `prefers-reduced-motion: reduce`, delete the key, open `/pet`: plate at the cooker, no movement, routine pose after about 2.5 s. — not run
5. Linked partner ticks a meal, open your `/pet`: no scene (AC 6). — not run

## Note for future contributors

The room's `PipWalker` `<g>` must stay mounted in a fixed position, or the cook-and-serve walk loses its CSS transition. A new Pip scene should add a phase to `COOK_PHASES` / `cookServeSchedule` rather than a second timer.

## Suggested commit subject

`MPP-18: Pip cooks and serves a newly eaten meal on /pet`

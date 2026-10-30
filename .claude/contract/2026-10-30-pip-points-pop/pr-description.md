# Pip head bar points pop (1.29.0)

Plan: [plan.md](plan.md)

## Summary

Pip's room head bar now pops "+N" / "−N" (rise and fade) when growth points change, then shows the "current / size" count and fades. Driven by `growthGain` (`utils/pipGrowth.js`) -> `usePipGrowth().gain` -> `levelBar.gain` (PetView) -> RoomPip -> `PipHeadBar`. Each pop gets a counter-based id so the animation replays. Version bumped to **1.29.0** (MINOR; no Jira ticket).

## Migrations / backend

Migrations: none. Backend: no changes; only the version bump in `pom.xml`.

## Verification

Automated (run):
- `npm run check:growth` -> `pipGrowth checks passed` (includes the +3 <= count/2 timing invariant)
- `npm run check:room` -> `room checks passed`
- `npm run check:wardrobe` -> `wardrobe checks passed`
- `npm run check:version` -> `Version OK: 1.29.0`
- `npm run build` -> `built in 1.19s` (pre-existing chunk-size warning only)
- No added `console.log` / `console.debug` in the client diff (zero hits)
- Line counts: PipHeadBar.jsx 64, usePipGrowth.js 91, PetView.jsx 147, RoomPip.jsx 34 (all under 200)

Manual checks on `/pet` (Phase 2, Task 5): **NOT RUN.** They need a Google login and a browser, so the developer owns them. Outstanding:
1. Gain: lower `points`/`barCurrent` by 3 in `foodbytes.pip.lastSeenGrowth.<userId>`, reload; green "+3" rises and fades (~1.2 s), then the count shows and fades (~2.4 s).
2. Loss: raise by 3; rust "-3", bar drains.
3. Evolve: set `form` one lower; "+N" immediately, count only after the evolve.
4. Edge positions: Pip in bed (night) and with a hat; "+3" not clipped at the room top.
5. 375 px viewport: both texts legible (tune `--pip-gain-rise` / `fontSize` if not).
6. Reduced motion: "+3" fades in place without rising; count still shows and fades.

No frontend test runner exists; visible behaviour is unverified until these are done.

## Review fixes

- No pop into or out of Basilisk (it has no bar); `growthGain` returns null and `count` is always a string.
- A hold (cook scene / announcement) drops the pop; the run replays the bar, not the numbers.
- Reduced motion: pop durations restored with `!important` so the landing page's global 0.01ms rule can't hide them; the count's opacity fade is intentional.
- `PetRoom.jsx` doc comment lists `gain` on `levelBar`.

## Note for contributors

Pop durations live in `HEAD_BAR_GAIN_DELTA_MS` / `HEAD_BAR_GAIN_MS` (`constants/pipGrowth.js`) and reach the CSS as `--pip-gain-delta-ms` / `--pip-gain-ms`. Never hard-code them in `PipHeadBar.css`.

## Suggested commit subject

`2026-10-30-pip-points-pop: Pip head bar points pop (+N, then count, fades)`

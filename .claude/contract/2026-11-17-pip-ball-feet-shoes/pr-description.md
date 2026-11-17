# 2026-11-17-pip-ball-feet-shoes: ball feet, whole-foot shoes, frames behind the sill

Plan: [plan.md](plan.md) · Version: **1.42.0** (client `package.json` + api `pom.xml` + CHANGELOG)

## Summary

- **Foot slot model.** Every Pip's feet are now little balls owned by the shoe slot. "No shoes" shows the line's bare ball foot; a worn shoe replaces the whole foot. Legs on herb, dragon and robot end above the foot tip (no claws or plates in the legs). `PipFigure` paints `dress.feet` after the torso extras, in front of the body, so nothing pokes out and the whole shoe shows.
- **Dragon shoes.** `sneakers` is now Fluffy fur boots and `wellies` is Dragonscale boots (names in `constants/pipWardrobe.js`). Herb Sneakers/Wellies and robot Hover pads/Mag boots keep their designs, redrawn as foot swaps.
- **Frames behind the sill (option C, all rooms).** The sill is split out of each pack's backdrop (`RoomSill`, `robotSill`, `dragonSill`, read through `packSill`), `DECOR_LAYERS.wall` is split into `wall` + `window`, and the draw order is wall decor, sill, window decor. `photo-strip` frames are raised 12 in all three packs, so the bottom frame clears the sill and the sill covers it from in front. Curtains and sill ornaments still draw over the sill.
- Mockup: `pip-themed-lines.html` ported to the ball-feet model; `README.md` marks `pip-dragon-shoes.html` live.

## Migration

No migration. Client-only change.

## Checks (Tasks M.3 / M.4)

- `npm run check:wardrobe`: `wardrobe checks passed`
- `npm run check:room`: `room checks passed`, `Room packs OK: herb, dragon, robot`
- `npm run check:pip`: `pip position checks passed`
- `npm run check:version`: `Version OK: 1.42.0`
- `npm run check:themes`: the known `default|text-secondary|bg-secondary` WARN, then `FAIL folder-chip-text on folder-chip-bg (default): 4.36 < 4.5`. This token pair is not touched by this contract (no edits to `default.css`); see Notes.
- `npm run build`: `built in 1.36s`, no errors
- Mockup renders in headless Edge with no console errors. Not verified: the manual visual check on a device (Task M.5).

## Notes for contributors

Feet are a wardrobe slot: each line's `BARE_FOOT` + `SHOES` draw in the foot frame (`footFrame`), and PipFigure paints `dress.feet` in front of the body.

## Suggested commit subject

`2026-11-17-pip-ball-feet-shoes: ball feet, whole-foot shoes, frames behind the sill`

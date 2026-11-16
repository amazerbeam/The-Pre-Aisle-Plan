# MPP-46: Dragon lair decor — 55 lair drawings and names

Plan: [plan.md](plan.md). Version 1.36.0.

## Summary
- All 55 decor items are drawn as lair counterparts on Parchment, ported verbatim from `pip-room-dragon.html` into `packs/dragon/dragonDecor*.jsx` (merged in `dragonDecor.js`).
- `packDecorArt` applies `DECOR_LEGACY_SHIFT` to pack-drawn legacy ids (`DECOR_LEGACY_IDS` now exported from `roomLayout.js`).
- `decorLabel(line, id)` names decor in the picker, Shop Decor tab, spot buttons, bought line and recent-sprinkles list.
- Bought-style name fix: `decorBoughtLine` names styles through `styleLabel` for the room's line.
- 19 decor ambience entries added to the dragon pack.
- `FULL_DECOR_LINES` in `packs.check.mjs` enforces full coverage (drawings and names) for the dragon line.

No migration, no backend change, no Railway step.

## Verification
- check:room: passed (Room packs OK: herb, dragon, robot)
- check:sprinkles: passed
- check:themes: OK, 3 themes, 189 contrast pairs (plus the one known WARN)
- SSR compare: 8 fixtures identical to the pre-change herb baseline
- npm run build: passed
- mvn test: 489 run, 0 failures, 0 errors, BUILD SUCCESS
- Task 17 localhost walk (fit, animation, Low FX, reduced motion, 375 px): NOT yet done; manual step pending.

## Convention note
A room pack that draws every decor id joins `FULL_DECOR_LINES` in `packs.check.mjs`; names go in `ROOM_LABELS[line].decor` and are read through `decorLabel`.

Suggested commit subject: `MPP-46: Dragon lair decor — 55 lair drawings and names`

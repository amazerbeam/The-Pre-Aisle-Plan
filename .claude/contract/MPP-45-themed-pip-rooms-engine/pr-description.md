# MPP-45: themed Pip rooms — room packs per creature and themed room UI

Plan: [plan.md](./plan.md) (tasks: [tasks.md](./tasks.md), evidence: [findings.md](./findings.md)). Version 1.35.0.

## Summary
- **Room packs.** The room follows the creature (`theme.pipLine`): Default keeps the herb room, Parchment gets the dragon lair, Cyberpunk the robot workshop (shell, 5 stations x 4 levels, 10 styles, ambience such as torch flicker, embers, steam and night rain). Names (stations, levels, styles) come from per-creature labels. Decor is not drawn per creature yet; it falls back to the herb art.
- **Themed room UI.** The room chrome (Shop, picker, Dress Pip, edit bar, pills, check-in, sprinkles chip) reads `--pet-*` role tokens, normalised names, with a `PET_PAIRS` contrast set in `check-themes.mjs`. `--pip-focus-ring` is per theme. The Fridge interior, Trophy cabinet scene and Dress Pip stage keep the Default palette through a pin.
- Convention: room art goes through `roomPack(line)`; never call `stationArt` / `decorArt` / `roomBackdrop` from a consumer.

**No migration. No server change.**

## SleepZs outcome
Confirmed in Task 3 that `SleepZs` was drawn outside the bed's shifted group, so the Zs sat about 70 v-units off the shifted bed at every level. Task 10 moved it into the bed's `ShiftedStation` group. The only herb SSR difference this caused (`asleep-l2`) was that move plus a `useId` prefix change; after normalising both, the markup is equal and the baseline was rewritten. See findings.md -> SleepZs.

## Notes for review
- **Cooker L1 rock split (Phase 3).** The mockup split the pot-ring string by character count, cutting through a `<polygon>`. The JSX port splits the nine rocks by element (4 behind, 5 in front): same rocks, same depth order, valid markup.
- **Pin deviation (Phase 5).** The pin sits on `.pip-fridge-view, .pip-cabinet-view, .pip-wardrobe-preview`, not on `.pip-room-svg` (the room SVG is drawn from literals). The pin block also sets `--pip-focus-ring: #7c5cd6` and `color: var(--text-primary)` so the ring stays visible on the light fridge now that the ring is themed. The mockup and README now describe this.
- `chrome-smoke.mjs` (contract 2026-11-16-themed-pip-rooms-mockups) gained a `POST_SWEEP` mode: its source-line audit no longer applies once literals moved to the theme files, so it now checks each token's three values against `styles/themes/*.css`.

## Verification
- `npm run build`: green (`built in 1.23s`).
- `npm run check:room`: `Room packs OK: herb, dragon, robot`.
- `npm run check:themes`: one known WARN (`default|text-secondary|bg-secondary`), then `Themes OK: 3 themes, 189 contrast pairs`.
- `npm run check:sprinkles`, `check:wardrobe`: pass. `check:version`: `Version OK: 1.35.0`.
- `node scripts/room-ssr.mjs --compare ...ssr-baseline`: `Room SSR OK: 8 fixtures identical`.
- Chrome mockup smoke: `chrome smoke OK: 76 tokens, 36 room-art literals, 36 pairs x 3 themes`.
- `mvn test`: BUILD SUCCESS, 489 tests, 0 failures, 0 errors.
- File budget: no file under `components/pet/room` is over 400 lines.
- **Manual walk of /pet in three themes: pending — developer (Task 30).**

## Follow-ups
- Head bar, Fridge interior and Trophy cabinet per creature (MPP-46/47 or a new ticket); dragon/robot decor.
- Mockup tooling a/b/c/k (see findings.md).
- Default contrast misses (h).

## Suggested commit subject
`MPP-45: themed Pip rooms — room packs per creature and themed room UI`

# 2026-11-15-themed-pip-lines: themed Pip lines (dragon, robot) and no de-evolve

Plan: [plan.md](plan.md) (this folder). Version 1.32.2 -> 1.33.0.

## Summary
- Server line registry (`PetGrowthPolicy.Line`: herb, dragon, robot). Form is derived from the peak points, so no line de-evolves any more (herb's old de-evolve is gone).
- `PetGrowthDTO.lines` returns every line (`PetLineGrowthDTO`); the growth payload shape changed.
- Client line registry plus three art packs (herb, dragon, robot, 3 forms each for dragon and robot).
- Per-creature wardrobe: the same 20 items, each line with its own art, names (`WARDROBE_ITEM_LABELS`) and animations (17 `pip-fx` effects); screen faces (REPLACES_FACE) and back-wear layers (cape).
- Theme `pipLine`: Default -> herb, Cyberpunk -> robot, Parchment -> dragon, read via `useTheme()`.
- CHANGELOG: `1.33.0 — 2026-11-15-themed-pip-lines: Pip is a dragon on Parchment and a robot on Cyberpunk (3 forms each); no line de-evolves any more — forms follow peak points`

## Migration / deploy
- Migration: none.
- Deploy: backend and frontend should go out in the same push (the growth payload shape changed).

## Verification
- Phase 2 targeted backend tests: 66 run, 0 failures.
- Phases 3-5: `check:wardrobe`, `check:growth`, `check:room`, `check:themes` and `npm run build` green. Phase 4 server-rendered 330 PipFigure combinations with no NaN/undefined.
- Phase 6: full backend suite `mvn test` 489 run, 0 failures, 0 errors, BUILD SUCCESS. Client `check:themes` (known default text-secondary WARN + `Themes OK: 3 themes, 81 contrast pairs`), `check:version` (1.33.0), `check:growth`, `check:wardrobe`, `check:room`, `check:pet`, `check:bubble` all pass; `npm run build` built. Stale-reference greps: zero hits. Largest touched file 358 lines (robotWardrobe.js).
- Manual theme walk (Default, Cyberpunk, Parchment; Pip forms, wardrobe, 320-1280px): pending (developer).

## Convention note
A new Pip form = append a threshold in `PetGrowthPolicy.Line`, a geometry entry in `<line>Forms.js`, its art, and its name in `PIP_LINE_COPY`; `check:growth` and `check:wardrobe` enforce the rest. A new wardrobe item = an id on the server catalogue, a drawing in every `<line>Wardrobe.js`, and a name in every `WARDROBE_ITEM_LABELS` line.

## Suggested commit subject
`2026-11-15-themed-pip-lines: themed Pip lines (dragon, robot) and no de-evolve`

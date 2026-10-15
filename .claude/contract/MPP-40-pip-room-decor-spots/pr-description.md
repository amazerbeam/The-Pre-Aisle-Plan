# MPP-40: Pip's room — 12 decor spots, rug spot, wardrobe station, deeper windowsill

Plan: [plan.md](plan.md) (tasks in [tasks.md](tasks.md)). Version 1.27.0 (Story → MINOR).

## Summary
- 12 decor spots (3 renamed, 9 new) with 43 new items; the existing 12 MPP-27 items keep their ids and prices.
- The rug is now a spot with a free pink default.
- New wardrobe station (levels 1–4, ledger ids 52–54); it opens Dress Pip.
- Deeper windowsill; floor art split into back/front layers (`decorArtFloorBack.jsx`, `decorArtFloorFront.jsx`, merged by `decorArtFloor.jsx`; shared helpers in `decorArtWalls.jsx`).
- Art pass signed off on 2026-10-15 (mockup `pip-room-decor-spots-mockup.html`).
- Bought-item copy is `bought and put in the "<Spot>" spot.`; set-level messages use `levelSetLine`.
- Version 1.27.0 in `package.json` and `pom.xml`; CHANGELOG line added.

## Migration
`foodbytes-app/database/migrations/2026-10-15-mpp40-pet-room-decor-spots.sql` — go-live row 11 in `railway-migrations.md`, included in `mpp15-railway-golive.sql` (regenerated; `build-golive.mjs --check` prints `Go-live OK: 11 migrations`). Applied to the LOCAL foodbytes-db only. Railway gets it at the MPP-15 merge, after row 10 and before the backend deploys (`ddl-auto: validate`).

## Pet free mode
`PET_FREE_MODE=true` (local only, default off via `application.yml`, never on Railway) unlocks the room shop for testing: free placing and upgrades, plus `PUT /api/pet/stations/{station}/level`. Documented in `CLAUDE.md` and `.env.example`.

## Verification
- `mvn test`: Tests run: 420, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS.
- `npm run check:room`: room checks passed.
- `npm run build`: built OK. `npm run check:version`: Version OK: 1.27.0.
- Component sizes all under 400 lines (largest furniture.jsx 364).
- Grep audits: no old spot names, no added console.log/debug, free mode default off.
- Task 22 manual localhost check (free mode and normal mode): TO BE COMPLETED BY THE DEVELOPER before merge.

## Convention note
Decor spot geometry is in world coords (`DECOR_SPOT_SHAPES`); only MPP-27's 12 items use `DECOR_LEGACY_SHIFT`. Spots with a free default (rug, finishes) are `RoomSpot.hasDefault()` / `hasDefault(spot)`.

## Suggested commit subject
`MPP-40: Pip's room — 12 decor spots, rug spot, wardrobe station, deeper windowsill`

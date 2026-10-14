# MPP-26: Shop — upgrade Pip's stations with sprinkles (v1.20.0)

Plan: `.claude/contract/MPP-26-pip-shop-station-upgrades/plan.md`
Mockup: `.claude/contract/MPP-15-epic-breakdown/mockups/mpp-26-shop-sheet-mockup.html`

## Summary
- Station levels are stored per person (`pet_station_levels`): bed, fridge, cooker and trophy cabinet, levels 1 to 4. A linked partner's room is untouched.
- New endpoint `POST /api/pet/stations/{station}/upgrade`. It returns a `RoomWriteDTO` with the new sprinkle balance and room. `PetDTO.room` carries levels and upgrade costs, so the client hard-codes no prices.
- Spending goes through the locked path `SprinkleService.lockWallet` + `spend`. MPP-27 reuses it.
- Client: a Shop pill in the room strip opens a Shop sheet with four station cards, a next-level thumbnail and a two-tap confirm. It handles short, maxed, 409 and network-error states.
- Version bumped 1.19.0 to 1.20.0 (Story: MINOR). `package.json`, `pom.xml` and `CHANGELOG.md` agree.

## Migration
`2026-10-14-mpp26-pet-station-levels.sql` is go-live row 8, after MPP-25's row 7. Railway gets `foodbytes-app/database/mpp15-railway-golive.sql` once, before the merged backend deploys (`ddl-auto: validate`).

## Verification
- M.1 `npm run check:version`: `Version OK: 1.20.0`.
- M.2: no 300/600/1200 literals in the shop client files; no added `console.log`/`console.debug`; the old wardrobe wrapper is gone from `WardrobeButton.jsx`.
- M.3 `node foodbytes-app/database/build-golive.mjs --check`: `Go-live OK: 8 migrations`.
- M.4 `mvn test`: 348 tests, 0 failures, 0 errors, `BUILD SUCCESS`.
- M.5 `npm run build`: built in 1.13s; `npm run check:room`: `room checks passed`.
- Backend tests for Tasks 7 to 12 are part of the M.4 run.

### Not verified
- Task 3, applying the migration to the local `foodbytes-db`, has NOT been done. The developer chose to proceed without it. The migration has not been run against a real MySQL; no test boots JPA.
- Task 22, the manual browser check of the Shop sheet (the eight-step walkthrough), is still pending.
- The client has no test runner. Only the build and the node room checks ran.

## Note for contributors
Every sprinkles purchase goes through `lockWallet` + `spend`. Never insert a debit directly.

## Suggested commit subject
`MPP-26: Shop — upgrade Pip's stations with sprinkles`

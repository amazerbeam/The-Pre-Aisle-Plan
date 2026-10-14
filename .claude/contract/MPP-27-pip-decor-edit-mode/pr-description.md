# MPP-27: Decor, wall and floor styles, and edit mode for Pip's room

Version 1.21.0 (Story, MINOR bump from 1.20.0).

- Plan: `.claude/contract/MPP-27-pip-decor-edit-mode/plan.md`
- Approved mockup: `.claude/contract/MPP-15-epic-breakdown/mockups/mpp-27-decor-catalogue-mockup.html`

## Summary

- Decor catalogue (`DecorCatalogue`): 12 items for three fixed room spots, plus paid wall and floor styles on top of the free defaults.
- Per-person ownership and placements (per-person Pip, MPP-33): decor writes never use the meal-plan owner; a linked partner's room and balance are untouched.
- `POST /api/pet/decor/{itemId}/buy` and `PUT /api/pet/room/placements`; both answer `RoomWriteDTO`.
- `SprinkleSource.DECOR_PURCHASE` added; `SprinkleServiceTest` (which pins the `SprinkleSource` list) was updated to include it.
- Styled room backdrop (replaces the old `ROOM_BACKDROP` export; duplicated `percentOf` removed).
- Edit room: the pencil "Edit room" toggle, dashed spot buttons, per-spot picker (place, swap, clear) and owned-style chips.
- Shop sheet: new Decor and Walls & floors tabs; prices come from `room.decor`, none hard-coded in the client.

## Migration

`2026-10-14-mpp27-pet-room-decor.sql` is go-live row 9 and runs after MPP-25 (row 7) and MPP-26 (row 8). Railway gets `foodbytes-app/database/mpp15-railway-golive.sql` once, before the merged backend deploys (`ddl-auto: validate`).

## Verification

- Tasks 5, 7-9, 12, 17: implemented and ticked in `tasks.md` (backend tests included in the full run below; room geometry pins in `check:room`).
- Task 29 (manual browser check): pending developer.
- M.1: `npm run check:version` -> `Version OK: 1.21.0`.
- M.2: greps for hard-coded prices, `ROOM_BACKDROP` / `const percentOf`, new `console.log/debug`, and `mealPlanOwner` in DecorService/PetRoomService: zero hits.
- M.3: `node foodbytes-app/database/build-golive.mjs --check` -> `Go-live OK: 9 migrations`.
- M.4: `mvn test` -> BUILD SUCCESS, 378 tests, 0 failures, 0 errors.
- M.5: `npm run build` -> built in 825ms; `npm run check:room` -> `room checks passed`.
- Not verified: client UI behaviour in a browser (no frontend test runner).

## For contributors

A new decor item is a line in `DecorCatalogue`, a label in `constants/petDecor.js` and art in `decorArt.jsx`, inside its spot's `volume`. Every purchase goes through `lockWallet` + `spend`.

Suggested commit subject: `MPP-27: Decor, wall and floor styles, and edit mode for Pip's room`

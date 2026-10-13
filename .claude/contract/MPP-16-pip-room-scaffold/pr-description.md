# MPP-16: Pip's room — 3D corner room engine and furniture catalogue

Plan: [plan.md](./plan.md) (this folder). Version: **1.7.0** (Task -> MINOR bump from 1.6.0).

## Summary
- An SVG corner room replaces the CSS backdrop on `/pet`.
- New `components/pet/room/` module: iso engine, furniture catalogue (bed / fridge / cooker / cabinet x levels 1-4), and `PetRoom`.
- `MochiBody` / `MochiGradient` extracted into `mochiParts.jsx` and shared with `MochiPet`.
- Old `.pet-room*` / `.pet-stage*` CSS removed; `check:room` script added.

## Migrations
None. Frontend only; nothing to apply on Railway.

## Verification
- `npm run check:version`: Version OK: 1.7.0
- `npm run check:pet`: petMood: all checks passed
- `npm run check:room`: room checks passed
- `npm run build`: built in 678ms, no errors
- `mvn test`: 158 tests, 0 failures, 0 errors, BUILD SUCCESS (backend untouched except pom version)
- Grep audits: no `pet-room|pet-stage` left in `src`; no console.log/debug, dangerouslySetInnerHTML, useMemo, React.memo or useCallback under `components/pet`.
- **Manual 320 px / desktop browser check (Task 12 Step 5): NOT DONE.** No browser was available; pending developer.

## Convention note
Room art is data in `FURNITURE[station][level-1]`, and draw order is `ROOM_DRAW_ORDER`. Add new stations or decor by extending those, never by reordering JSX or depth-sorting.

## Suggested commit subject
`MPP-16: Pip's room — 3D corner room engine and furniture catalogue`

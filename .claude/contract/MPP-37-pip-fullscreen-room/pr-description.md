# MPP-37: Pip tab full screen — no top bar, slim header, one-row room buttons

Plan: `.claude/contract/MPP-37-pip-fullscreen-room/plan.md`

## Summary

- Pip mode: on `/pet` the app's top bar is hidden and `main` is exactly one screen tall (`.main-content--pip`, `--footer-clearance` token); the page never scrolls.
- New `PipHeader`: name + rename pencil, herb form, sprinkles, mood chip. Replaces the name row under the room and the room's in-room sprinkles counter.
- Full-height room: `.pip-room-stage` fills the space; `.pip-room-scene` is the positioned 360x330 box so station hit boxes, hint, bubble and decor spots are anchored to the picture.
- Shop / Edit room / Wardrobe sit in one equal-column row directly above the tab bar.
- Today's meals removed (`PetMealsCard.jsx` deleted, its CSS removed).
- Version: 1.24.1 -> 1.24.2 (Bug, PATCH).

## Migrations

None.

## Verification

- `npm run check:version`: `Version OK: 1.24.2`.
- `npm run build` (client): passes (`built in 835ms`).
- `mvn test` (backend, no backend change): BUILD SUCCESS, 398 tests, 0 failures, 0 errors.
- Stale-reference grep (`PetMealsCard|pet-meals|pet-meta|SprinklesCounter|pip-room-sprinkles`): 0 hits. `console.log/debug` hits: 5 (baseline 6, no new).
- Not verified by automation: the client has no test runner; all visual behaviour is unverified until the phone check below.

### Task 8 phone checks: PENDING (deferred to the developer)

At 360x740 and 390x844 (DevTools device mode, portrait), signed in, `/pet`:
1. No purple top bar. Slim header shows name + pencil, form name, sprinkles, mood chip.
2. Page does not scroll; room fills the space between header and tab bar; nothing under the tab bar.
3. Shop, Edit room, Wardrobe in one row directly above the tab bar, none clipped, each 44px tall.
4. "Tap the fridge or cabinet" hint sits inside the room picture (bottom-left).
5. No Today's meals card.
6. Edit mode: decor spots on furniture, edit bar under the room, room shrinks with no page scroll, Done exits. Rename still saves. A 12-character name truncates the form name rather than pushing chips off-screen. Recipes, Meal Plan, Shopping still show the top bar.

### MPP-36 tap check: PENDING (deferred to the developer)

Tap the fridge art: fridge view opens, back returns to the room. Tap the cabinet art: trophy cabinet opens. With keyboard Tab focus, the yellow focus ring outlines the fridge and cabinet themselves, not empty space. Record: if both open, "MPP-36 appears fixed by the scene positioning"; otherwise MPP-36 still reproduces.

## Convention note

Room overlays (`StationButton`, hint, bubble, decor spots) are positioned against `.pip-room-scene`, which must stay `position: relative` and exactly the SVG's aspect ratio (360 / 330).

## Ordering note

MPP-38 (level bar) is applied after this and edits `PetRoom.jsx` / `PetRoom.css` again.

## Suggested commit subject

`MPP-37: Pip tab full screen — no top bar, slim header, one-row room buttons`
- Review fixes: trailing-slash /pet/ route match, Pip room min-height + scroll fallback on short screens (incl. guest/error/loading states).

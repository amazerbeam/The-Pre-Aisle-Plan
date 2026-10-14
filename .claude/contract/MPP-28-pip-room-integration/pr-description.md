# MPP-28: one pet payload for Pip's room and a single bubble priority

Plan: [plan.md](plan.md) (this folder). Version 1.22.0 -> 1.23.0.

## Summary
- `/api/pet` gains `habits` + `awards`; the client no longer calls `/api/pet/habits` or `/api/pet/awards`.
- `GET /api/meal-plan` gains optional `days` (1-14, default 7).
- `PetContext` makes at most one plan read.
- `pipBubble` owns the AC 2 order; `usePipGrowth` holds; check-in answers refresh the whole pet.
- `WardrobeService.sync` takes statuses (ledger derived once).

## Migrations
None. No Railway or local apply; go-live file unchanged (`build-golive.mjs --check` -> `Go-live OK: 10 migrations`).

## Convention note
Pip's bubble order lives in `utils/pipBubble.js` (`npm run check:bubble`); a new line goes there, not inline in PetView.

## Verification (automated, Phases 5-6)
- Task 15 Step 1 owner-resolution audit: the 10 expected files, no others. In the pet services, the owner id feeds only `mealPlanEntryRepository.findMainMealSlots` / `findFullyPlannedDates` (PetGrowthService, PlanStreakService, PetFirstService PLAN_FULL_WEEK, SprinkleService) and `userRepository.findPlanMemberIds` (SprinkleService full-week payout to every plan member, by design). Eaten, check-in and pet_* reads and writes all use the caller's own userId. No leak, no Bug logged.
- Task 15 Step 2: `PetServiceTest#getPet_linkedPartner_everyPersonalPartIsTheirOwn_neverThePlanOwners+getPet_planOwner_neverReadsThePartnersParts` -> BUILD SUCCESS, 2 tests, 0 failures.
- M.1: package.json and pom.xml both 1.23.0; `npm run check:version` -> `Version OK: 1.23.0`.
- M.2: stale-reference grep (client) zero hits; `awardService.getAwards` grep in foodbytes-api/src zero hits.
- M.3: all 11 check scripts (macros, pet, pip, room, cook, fridge, checkin, awards, growth, wardrobe, bubble) print their passed line.
- M.4: full `mvn test` delegated to QA (Implementer does not run the full suite).
- M.5: `npm run build` -> `built in 817ms`; `build-golive.mjs --check` -> `Go-live OK: 10 migrations`.

## Task 16 manual verification: PENDING - developer manual verification
1. Request count (AC 1) on `/pet`, DevTools Network Fetch/XHR, reload: expected `GET /api/pet` plus at most one `GET /api/meal-plan?...&days=...` (none when the calendar is on the current week and today is not its first day); no `/api/pet/habits` or `/api/pet/awards`; another week still <=2.
2. Bubble order (AC 2) at 375 px: eaten dinner -> cook scene leads, no check-in/award line over it; "No" completing a streak milestone -> "New ..." line leads, question and buttons beneath, cabinet and sprinkles update without reload; form change -> evolve line after the award line; idle with low fridge and no check-in -> fridge line, else mood line.
3. Footer tab, mood, eaten hand-off (AC 4) on `/`, `/mealplan`, `/shopping`: tab shows Pip's form and mood, hat only, with name; ticking a meal flips mood without reload; "Mark as eaten" on breakfast/lunch/dinner navigates to `/pet` after ~600 ms.
4. Two linked accounts (two browsers): same plan, shopping list, templates, extra choices; different eaten ticks, Pip name, mood, meal times, check-ins, cabinet, sprinkles, room, decor, wardrobe, form.

## Bugs logged under MPP-15
None.

## Suggested commit subject
`MPP-28: one pet payload for Pip's room and a single bubble priority`

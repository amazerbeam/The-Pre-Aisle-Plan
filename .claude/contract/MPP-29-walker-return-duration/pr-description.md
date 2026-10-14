# MPP-29: walk back lasts its returning phase

Plan: [plan.md](plan.md)

## Summary
PipWalker used the 700 ms walk-out duration for the 500 ms walk back, so Pip overran the cook scene by 200 ms. Each walk now lasts exactly its phase via `pipWalkMs`, which `check:cook` pins.

## Version
1.24.1 (PATCH, regression fix on MPP-29). `package.json`, `pom.xml` and CHANGELOG agree (`check:version` passes).

## Deploy
No migration and no Railway step.

## Verification
- Task 1: `check:cook` failed on the missing `pipWalkMs` export, then passed after the helper was added.
- Task 2: no stale `WALK_DURATION`/`COOK_PHASE_MS` in PetRoom.jsx; `check:cook` passes; `npm run build` built in 862 ms.
- Task 4: `check:cook`, `check:room`, `check:growth`, `check:pip` all print their passed lines.
- Task 5: `mvn test` BUILD SUCCESS, 398 tests, 0 failures, 0 errors.
- Task 6: `npm run build` succeeds.
- Manual `/pet` visual check (walk back, reduced motion): not yet checked.

## Convention
Cook-scene walk timing lives in `pipWalkMs`. Retune `COOK_PHASE_MS` only, never a duration inside PetRoom.

## Suggested commit subject
`MPP-29: walk back lasts its returning phase, scene ends with Pip on the rug`

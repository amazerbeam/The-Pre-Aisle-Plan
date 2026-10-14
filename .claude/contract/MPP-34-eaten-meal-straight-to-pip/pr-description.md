# MPP-34: Marking a meal as eaten takes you straight to Pip

Plan: [plan.md](plan.md)

## Summary
After the server confirms "Mark as eaten" on a counted meal dated today or yesterday, the app holds "✓ Eaten" for about 600 ms and then navigates to `/pet`, where Pip walks, cooks and serves the meal. Undo within the beat, snacks/extras, meals two or more days old, and failed saves all keep the user on the recipe. The old `PetReaction` inline reaction is removed.

Version: **1.17.0** (MINOR, Story). `package.json`, `pom.xml` and `CHANGELOG.md` agree (`check:version` passes).

## Migrations
None.

## Verification
- `npm run check:cook`: cook-and-serve checks passed
- `npm run check:pet`: petMood: all checks passed
- `npm run build`: built in 706ms, no errors
- `npm run check:version`: Version OK: 1.17.0
- `mvn test`: BUILD SUCCESS, 267 tests, 0 failures, 0 errors
- Stale-reference grep (`PetReaction|petReactionText|shouldShowPetReaction|pet-react`) and `console.log/debug` grep on touched files: zero hits
- Manual check (Task 11, phone width on `/mealplan`): **pending the developer**. There is no frontend test runner, so the navigation behaviour is unverified by automation.

## Notes for future contributors
- An eaten tick hands off to `/pet` via `useTakeToPip`. Any future surface that marks meals eaten should reuse `shouldTakeToPip` rather than re-deriving the rule.
- `PetReaction` no longer exists, so MPP-28 AC 4 needs its wording updated.

## Suggested commit subject
`MPP-34: Marking a meal as eaten takes you straight to Pip`

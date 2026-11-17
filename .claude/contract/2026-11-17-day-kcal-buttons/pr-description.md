# day-kcal-buttons: show day kcal on recipe-card day buttons (v1.41.0)

Plan: [plan.md](plan.md)

## Summary
- Each recipe-card day button shows the day's kcal in all three themes (Default, Cyberpunk, Parchment).
- Hovering or keyboard-focusing a button previews the day total with this recipe added. The logic is in `client/src/utils/dayKcal.js`.
- `RecipeCard` passes the variant's kcal to `DayAssignmentButtons` through the new `assignKcal` prop.
- Version bumped to **1.41.0** (MINOR, no Jira ticket) in `package.json`, `pom.xml` and `CHANGELOG.md`.
- Mockups updated: `app-mockup.html`, `day-kcal-buttons.html`, `mockup/README.md`.

## Migration
No migration.

## Results
- `npm run check:version`: `Version OK: 1.41.0`
- `npm run build`: passes (`built in 1.33s`)
- `npm run check:daykcal`: `All day-kcal checks passed.`
- `npm run check:themes`: **FAIL, pre-existing and unrelated.** `FAIL folder-chip-text on folder-chip-bg (default): 4.36 < 4.5`, plus the known WARN `text-secondary on bg-secondary (default): 4.45`. `default.css` and `check-themes.mjs` are unchanged in the working tree, and no pair involving the day-kcal change fails. Left alone because Default must not drift; needs its own ticket.
- `mvn test`: 508 tests, 0 failures, 0 errors, BUILD SUCCESS (no backend change)
- Manual check: **outstanding.** Task 7 Step 4 (visual check in 3 themes at 1280px and 320px) and Task 8 Step 3 (`app-mockup.html` Recipes tab in a browser).

## Notes
- The preview is mouse and keyboard only, by decision. There is no long-press preview.
- The optimistic total briefly shows the base recipe's kcal for a non-default variant. Known and out of scope.

## Suggested commit subject
`day-kcal-buttons: show day kcal on recipe-card day buttons`

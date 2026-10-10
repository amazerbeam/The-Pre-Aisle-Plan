# MPP-8: Shopping list honours homemade / store-bought selections

- Jira: https://amazerbeam.atlassian.net/browse/MPP-8
- Plan: [plan.md](./plan.md) (tasks in [tasks.md](./tasks.md))

## Summary

- `GenerateShoppingListModal` now sends `useHomemadeSelections().selections` as the third argument of `generateShoppingList`, so a store-bought extra lists its store-bought product instead of the homemade sub-recipe's raw ingredients.
- Backend production code is unchanged. It already honoured selections; the client just never sent them.
- 7 new backend tests pin the selections contract:
  - `GenerateShoppingListRequestTest` (2): string JSON keys deserialise to `Map<Long, Map<Long, Boolean>>`; omitted selections give null.
  - `ShoppingListControllerTest` (2): `POST /generate` forwards selections (or null) to `PersistedShoppingListService`.
  - `ShoppingListServiceTest` (+3): store-bought with ingredient (nested child skipped), store-bought without ingredient (fallback to "Store Bought Items" aisle), explicit homemade equals null selections.

## Migrations

None.

## Verification

- Caller audit: no `generateShoppingList(startDate, endDate)` two-argument call remains under `foodbytes-app/client/src` (0 hits).
- Backend `mvn test`: `Tests run: 71, Failures: 0, Errors: 0, Skipped: 0`, BUILD SUCCESS. `ShoppingListServiceTest` 21, `ShoppingListControllerTest` 2, `GenerateShoppingListRequestTest` 2. `AuthControllerLoginTest` also passed (4/4) in this run.
- Client `npm run build`: 182 modules transformed, `built in 607ms`, no errors.
- Not verified: the client has no test runner, so the modal change is covered by build and code reading only.
- AC4 (live repro: Spaghetti Bolognese 2026-10-12 with Fresh Pasta store-bought, expect Spaghetti (dried) and no Plain flour / Egg / Salt): pending developer verification after the Railway deploy.

## Follow-ups to ticket

- `endDate` is ignored by `PersistedShoppingListService`.
- Breakdown popup diverges for store-bought rows.
- Selections are lost on variant switch.
- Selections are per-browser (localStorage).

## Note for contributors

Any new caller of `generateShoppingList` must pass `selections`, or store-bought choices are silently dropped.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

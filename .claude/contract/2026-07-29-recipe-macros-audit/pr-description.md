# Recipe macro audit sign-off

Plan: [`.claude/contract/2026-07-29-recipe-macros-audit/plan.md`](./plan.md)

## Summary

Adds a chef-facing sign-off that a recipe's macros/calories have been checked against the `CLAUDE.md` targets. Mirrors `ingredients.macros_verified` (FR-083) one level up — per-recipe rather than per-ingredient.

- Three new columns on `recipes`: `macros_audited` (boolean, `NOT NULL DEFAULT 0`), `macros_audited_at` (timestamp), `macros_audited_by` (FK → `users.id`, `ON DELETE SET NULL`).
- One admin-only write path: `PATCH /api/recipes/admin/{id}/audit?audited={bool}`, `@PreAuthorize("hasRole('ADMIN')")`, identity via `@AuthenticationPrincipal UserPrincipal`. Setting stamps `macrosAuditedAt = now()` and `macrosAuditedBy = <principal id>`; clearing nulls both, so the columns never describe a sign-off that's no longer in force.
- Instant-apply Audited / Not-audited toggle in `RecipeInfoForm`, next to the existing Visibility toggle — existing recipes only, disabled while the form has unsaved edits.
- Admin-only green "✓ Audited" badge on `RecipeCard`, beside the Cheat badge, gated on `isAdmin`.

The flag is **sticky by design** — nothing in the application clears it automatically (not an ingredient edit, not a servings change, not a full Recipe Info save). Only an explicit chef action through the new endpoint flips it. This is an accepted trade-off from the developer, not an oversight — see the sticky-invariant note below and `plan.md` → Risks.

## Deploy note — migration status

`foodbytes-app/database/migrations/2026-07-29_recipe_macros_audit.sql` is **already applied to the live Railway MySQL** (`hopper.proxy.rlwy.net:35402`, schema `railway`). Applied 2026-07-30 by the orchestrator with the developer's explicit authorization. Verified post-apply:
- 3 columns present with the expected types/nullability/defaults (`macros_audited` `tinyint(1)` `NOT NULL DEFAULT 0`; `macros_audited_at` `timestamp` nullable; `macros_audited_by` `bigint` nullable).
- `idx_recipes_macros_audited` present (non-unique).
- `fk_recipes_macros_audited_by → users(id)` present with `DELETE_RULE = SET NULL`.
- 160 recipes, all `macros_audited = 0`, 0 nulls — every existing recipe is explicitly unaudited, as intended.

**No manual step is owed against the current production database for this PR.** The only outstanding manual-apply obligation is for **any other environment** — a fresh local dev DB, a new Railway instance, a restored backup — where this migration has not yet run. Because Hibernate runs `ddl-auto: validate`, starting the backend against an unmigrated schema in any such environment is a hard startup failure (`SchemaManagementException`). Apply the migration there before the backend starts.

## Smoke test — outstanding, not yet run

Task 13 (live smoke test: restart the backend against the migrated schema, toggle the audit flag on a real recipe through the UI, confirm the DB row, confirm a full Recipe Info save doesn't disturb it) **has not been executed**. Docker is not installed in the environment this contract was implemented in, and the UI click-through requires a logged-in human session — neither is something this phase could perform. This is owed to the developer/orchestrator before merge is considered fully verified live. Specifically outstanding, matching Task 13's Steps 2 and 4:

1. Log in as the admin/chef account, open any recipe → Edit → Recipe Info, click **✓ Audited**. Confirm: green "Marked as audited." banner; the toggle shows Audited with a sign-off date; closing the modal shows the green "✓ Audited" badge on that recipe's card.
2. In the same modal, bump Default Servings by 1 and Save. Re-query the row and confirm `macros_audited`, `macros_audited_at`, and `macros_audited_by` are **unchanged** by the save (the sticky invariant, confirmed live rather than just in a unit test). Set servings back afterward.

The **sticky invariant itself is covered by an automated unit test** — `RecipeServiceMacroAuditTest :: updateRecipe_doesNotFlipAuditFlagFromInboundDto` (5/5 tests passing, `mvn test -Dtest=RecipeServiceMacroAuditTest`) — which drives a hostile/stale `RecipeAdminDTO` (`macrosAudited(true)`, a fake auditor id, a 2020 timestamp) through `updateRecipe` and asserts the entity's audit trio stays at its pre-call values. A sibling test, `createRecipe_startsUnaudited`, does the same for the create path. What remains unverified is only the live, end-to-end path through the running app and a real database round trip.

**Known pre-existing failure, unrelated to this PR:** `mvn clean test` does not currently reach BUILD SUCCESS, because `AuthControllerLoginTest` cannot load its Spring slice context — `AuthController` constructor-injects `JwtCookieService` (`AuthController.java:24`) but the test only declares `@MockBean PasswordAuthService`, never mocking `JwtCookieService`. Neither file is touched by this PR. The two service test classes are green: `RecipeServiceMacroAuditTest` 5/5, `ShoppingListServiceTest` 16/16.

## Convention note for future contributors

The audit trio on `RecipeAdminDTO` is **response-only**. `RecipeService` never reads `dto.getMacrosAudited()` / `getMacrosAuditedAt()` / `getMacrosAuditedBy()` anywhere — `PATCH /api/recipes/admin/{id}/audit` is the *only* writer, and `updateRecipe` carries an explicit comment recording that the omission is intentional. `RecipeInfoForm` saves the whole loaded DTO as a spread (`{...recipe, ...updatedData}`) — if `updateRecipe` ever started mapping the audit fields from the inbound payload, a stale client object could silently flip the sign-off as a side effect of an unrelated edit (e.g. a rename). **Do not "complete" the field mapping in `updateRecipe`** to make it symmetric with `convertToDTO`/`convertToRecipeAdminDTO` — that symmetry is deliberately broken here.

## Judgement calls a reviewer should not have to rediscover

- **New endpoint is stricter than its siblings.** `PATCH /admin/{id}/audit` requires `@PreAuthorize("hasRole('ADMIN')")`. Its siblings — `/visibility`, `PUT /admin/{id}`, `DELETE /admin/{id}` — currently fall through to `SecurityConfig`'s `.anyRequest().authenticated()`, so any logged-in user can call them today. Correct for a chef sign-off action, but it leaves the recipe-admin surface inconsistently protected. Closing that pre-existing gap (tightening the other three endpoints) is explicitly **out of scope** for this PR — flagged for a follow-up, not silently left as a surprise.
- **Shared `.toggle-button` CSS side effect.** The 44px min-height / `@media (hover: hover)` / `:disabled` / `:focus-visible` fix applied to `RecipeInfoForm.css` was required for the new audit toggle (touch-target and hover-hygiene rules in the `react-frontend` skill) but the rule is shared with the existing Visibility toggle group. **The Visibility buttons will render visibly taller as a side effect of this PR.** No behavioural change, purely a sizing/touch-target improvement, but called out so it isn't a surprise in review.
- **`macrosAudited` is visible on the public `GET /api/recipes` response**, not just the admin endpoints. It was added to `RecipeDTO` (not a separate admin-only DTO) because the admin list path (`getAllRecipesAdmin` → `convertToAdminDTO` → `convertToDTO`) reuses `convertToDTO`, and `RecipeDTO` also backs the public recipe list. This is a deliberate, accepted trade-off — `macrosAudited` is a non-sensitive boolean, and the frontend only renders the badge when `isAdmin` is true. A separate admin-only DTO was judged as more code than the leak is worth.

## Out of scope (unchanged from `plan.md`)

- No automatic invalidation of the flag on ingredient/calorie/servings edits (sticky by design).
- No cascade invalidation through linked/parent recipes.
- No coupling to the "Go Live" gate (still governed solely by the existing FR-083 `macros_verified` check).
- No rendering of the auditor's name (stored/returned as a raw `users.id`).
- No backfill — every pre-existing recipe starts at `macros_audited = 0`.

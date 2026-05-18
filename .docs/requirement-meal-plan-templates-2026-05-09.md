---
**Date:** 2026-05-09
**Status:** Draft
---

# Saved Meal Plan Templates ("Save as" / "Choose meal plan")

## Problem / motivation

Today the only way to reuse a week's meals is `copy-week`, which only works between two specific calendar weeks. Users have no way to keep a named, reusable plan (e.g. "High Protein Diet", "Low Carb Week", "Wife's Plan") that they can re-apply to any future week. The result is that curated plans get lost as soon as the week scrolls past, and the user has to rebuild them recipe-by-recipe.

This requirement adds a per-user library of named meal-plan templates. A template is a snapshot of the seven day-offsets (Mon–Sun) and the recipes assigned to each meal slot, decoupled from any calendar date. The user can save the current week as a template, and later apply any saved template to the currently-displayed week.

## Scope

**In scope**
- Backend: new `meal_plan_templates` + `meal_plan_template_entries` tables, JPA entities, repository, service methods, REST endpoints under `/api/meal-plan/templates`.
- Saving the current week as a named template (snapshot by `dayOffset` 0–6 + `mealId` + `recipeId` + `servings`).
- Listing templates for the authenticated user.
- Applying a template to the currently-displayed week (replace-all semantics: delete every entry in the target week, then insert template entries with `planDate = currentStartDate + dayOffset`).
- Renaming a template.
- Deleting a template.
- Updating a template ("save again with same name") — re-snapshots from the current week's entries.
- Frontend: replace the existing `C` button in `MealPlanCalendar` header with a single overflow menu (kebab) exposing **Copy week…**, **Save as template…**, **Apply template…**, **Manage templates…**. Modal(s) for save/apply/manage.
- Shopping-list cache invalidation on apply (same hook used by `copyWeek`).
- Sync mode (`users.meal_plan_owner_id`): templates are scoped to the **effective owner**, mirroring how meal plans behave today (see `MealPlanService.getEffectiveMealPlanOwnerId`).

**Out of scope / non-goals**
- Sharing templates between users (no public/global templates in v1).
- Versioning / history of a template (each "Update from current week" overwrites the snapshot).
- Pre-seeded system templates ("High-Protein", etc. shipped in DB).
- Any change to the existing `copy-week` endpoint or the `C` button's underlying behavior (only its host UI moves into the new menu).
- Template assignment to a non-Monday start date — same Monday-only rule applies.
- Partial application (specific days only). Apply is always all-7-days replace-all.

## Success criteria

Each bullet is verifiable by the listed command, query, or visual.

- **DB migration applied:** new file `foodbytes-app/database/migrations/2026-05-09_meal_plan_templates.sql` creates `meal_plan_templates(id, user_id, name, created_at, updated_at)` with `UNIQUE (user_id, name)`, and `meal_plan_template_entries(id, template_id, day_offset TINYINT 0..6, meal_id, recipe_id, servings)` with FKs and `ON DELETE CASCADE` from template. Verify: `SHOW CREATE TABLE meal_plan_templates;` shows the unique key; inserting a duplicate `(user_id, name)` fails.
- **Save endpoint works:** `POST /api/meal-plan/templates` body `{ "name": "High Protein Diet", "sourceStartDate": "2026-05-11" }` returns 200 with the new template; the rows in `meal_plan_template_entries` exactly match `meal_plan_entries` for that user+week, mapped to `day_offset = planDate - sourceStartDate`. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#savesSnapshotWithDayOffsets` passes.
- **Duplicate name rejected:** `POST /api/meal-plan/templates` with an existing name for the same user returns 409 with `{ "error": "Template name already exists" }`. Different user can reuse the same name. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#rejectsDuplicateNamePerUser` passes.
- **List endpoint:** `GET /api/meal-plan/templates` returns `[{ id, name, entryCount, updatedAt }, ...]` for the effective owner only. Guest (`userPrincipal == null`) → 403. Verify: `mvn test -Dtest=MealPlanTemplateControllerTest#listReturnsOnlyOwnersTemplates` passes.
- **Apply endpoint replaces target week:** `POST /api/meal-plan/templates/{id}/apply?targetStartDate=2026-05-18` deletes all `meal_plan_entries` for the user in `[targetStartDate, targetStartDate+7)`, inserts new entries with `planDate = targetStartDate + dayOffset`, and returns the resulting `MealPlanWeekDTO`. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#applyReplacesTargetWeek` passes.
- **Rename:** `PATCH /api/meal-plan/templates/{id}` with `{ "name": "..." }` updates the row; collision returns 409. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#renameRejectsCollision` passes.
- **Update-from-current-week:** `PUT /api/meal-plan/templates/{id}/snapshot?sourceStartDate=...` deletes all `meal_plan_template_entries` for that template, re-inserts from the source week. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#updateSnapshotOverwritesEntries` passes.
- **Delete:** `DELETE /api/meal-plan/templates/{id}` returns 204; `meal_plan_template_entries` rows for that template are gone (cascade). Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#deleteCascadesEntries` passes.
- **Sync mode honored:** when the authenticated user has `meal_plan_owner_id` set, save/apply/list/rename/delete all operate on the owner's templates. Verify: `mvn test -Dtest=MealPlanTemplateServiceTest#respectsMealPlanOwnerSync` passes.
- **Frontend menu replaces `C` button:** `MealPlanCalendar` header renders a single kebab/menu trigger; opening it shows **Copy week…**, **Save as template…**, **Apply template…**, **Manage templates…**. Verify visually at `http://localhost:5173/mealplan` that the bare `C` button is gone and the four menu items are present.
- **Save modal flow:** menu → "Save as template…" opens a modal with a name input; submitting calls the save endpoint, closes the modal on success, shows inline error on 409. Verify visually: save a week as "High Protein Diet" → re-open menu → "Apply template…" lists "High Protein Diet".
- **Apply modal flow:** menu → "Apply template…" opens a modal with a dropdown of saved templates; selecting one + clicking **Apply** calls the apply endpoint with the currently-displayed `startDate`, refreshes the week plan, and invalidates the shopping-list cache. Verify visually: change to a fresh week, apply "High Protein Diet" → all 7 days populate with the snapshotted recipes.
- **Apply confirms before overwrite when target week is non-empty:** modal shows the same overwrite warning copy as `CopyWeekModal` ("This will replace all meals in the target week.") before the apply call fires. Verify visually.
- **Manage modal flow:** menu → "Manage templates…" lists templates with rename, "Update from this week", and delete actions. Verify visually that rename + delete + update each round-trip and refresh the list.
- **Frontend build green:** `cd foodbytes-app/client && npm run build` succeeds with no new warnings about the affected files.

## Reference patterns

- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java:138` — `copyWeek` endpoint shape (auth check, `@DateTimeFormat ISO.DATE`, returning `MealPlanWeekDTO`). Mirror for `apply`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:246` — `copyWeek` service body (delete target range → fetch source → re-insert with day-offset → return `getWeekPlan`). The apply flow is structurally identical but reads from `meal_plan_template_entries` instead of source-week `meal_plan_entries`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:39` — `getEffectiveMealPlanOwnerId` pattern; reuse for templates.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:1` — JPA entity layout (Lombok `@Data`, `@PrePersist`/`@PreUpdate` timestamps). Mirror for `MealPlanTemplate` and `MealPlanTemplateEntry`.
- `foodbytes-app/client/src/components/mealplan/CopyWeekModal.jsx:1` — modal scaffold (overlay, click-outside, ESC, pull-to-dismiss, error state). Reuse structure for SaveTemplateModal, ApplyTemplateModal, ManageTemplatesModal.
- `foodbytes-app/client/src/components/mealplan/MealPlanCalendar.jsx:79` — current `C` button location; this is what gets replaced by the menu trigger.
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx:367` — `copyWeek` context method (calls service, invalidates shopping-list cache, advances `startDate`). Mirror for `applyTemplate`; `saveTemplate`/`renameTemplate`/`deleteTemplate`/`updateTemplateSnapshot` do not need to invalidate the shopping list (they don't change the live week's meals).
- `foodbytes-app/client/src/services/mealPlanService.js:80` — service method shape (axios call, returns `response.data`). Add a new `mealPlanTemplateService.js` alongside, following the same shape.

## Constraints

- **Hibernate `ddl-auto: validate`** — schema changes must be applied to Railway MySQL **manually before backend redeploy**, or startup fails. The migration file lives in `foodbytes-app/database/migrations/` and must also be applied to the deployed DB. (See `CLAUDE.md` → "Database & Deployment".)
- **Cookie auth + `withCredentials: true`** — all new frontend calls go through the existing `services/api.js` axios instance; do not introduce a separate auth header path.
- **Sync mode (`users.meal_plan_owner_id`)** — templates are owned by the **effective owner**, not the authenticated user. Two synced users see and operate on one shared template library, matching meal-plan behavior.
- **Shopping-list cache invalidation** — `applyTemplate` must call the same `invalidateShoppingListCache` localStorage flag the existing `copyWeek` uses (`MealPlanContext.jsx:367`); save/rename/delete/update must NOT, since they don't mutate the active week.
- **Recipe-data integrity rules apply transitively** — templates store `recipe_id` references; if a recipe is deleted later, applying the template should silently skip the missing recipe rather than crash. Do not soft-store recipe contents on the template.
- **Three-variant rule (`.claude/rules/recipe-variants.md`)**: not changed by this work, but worth noting that templates point at specific variant rows (e.g. Moderate). Applying a template re-inserts the exact variant the user saved.
- **Linked-recipe extras (`.claude/rules/linked-recipe-extras.md`)**: not affected — templates only reference top-level meal-slot recipes; sub-component handling is unchanged.
- **Add `RecipeFamily`/variant awareness later** — out of scope for v1. v1 stores the literal `recipe_id` the user chose. (Open question 1 below.)
- **Auth gating** — every new endpoint must return 403 for `userPrincipal == null`, matching the pattern at `MealPlanController.java:45`.
- **Validation** — `name` is required, trimmed, 1–60 chars, must not be blank after trim. Reject with 400 otherwise. Day-offset values must be 0..6.

## Affected files / modules

- `foodbytes-app/database/migrations/2026-05-09_meal_plan_templates.sql` (new)
- `foodbytes-app/database/schema.sql` (append the two new tables)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplate.java` (new)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplateEntry.java` (new)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanTemplateRepository.java` (new)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanTemplateEntryRepository.java` (new)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanTemplateService.java` (new)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanTemplateController.java` (new) — base path `/api/meal-plan/templates`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanTemplateDTO.java`, `MealPlanTemplateEntryDTO.java`, `MealPlanTemplateCreateRequest.java`, `MealPlanTemplateRenameRequest.java` (new)
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanTemplateServiceTest.java` (new)
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/MealPlanTemplateControllerTest.java` (new)
- `foodbytes-app/client/src/services/mealPlanTemplateService.js` (new)
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx` (extend with `templates` state + `saveTemplate` / `applyTemplate` / `renameTemplate` / `deleteTemplate` / `updateTemplateSnapshot`)
- `foodbytes-app/client/src/components/mealplan/MealPlanCalendar.jsx` (replace `C` button with menu trigger)
- `foodbytes-app/client/src/components/mealplan/MealPlanMenu.jsx` + `.css` (new — overflow menu)
- `foodbytes-app/client/src/components/mealplan/SaveTemplateModal.jsx` + `.css` (new)
- `foodbytes-app/client/src/components/mealplan/ApplyTemplateModal.jsx` + `.css` (new)
- `foodbytes-app/client/src/components/mealplan/ManageTemplatesModal.jsx` + `.css` (new)

## Verification commands

```bash
cd foodbytes-app/foodbytes-api && mvn test -Dtest=MealPlanTemplateServiceTest
cd foodbytes-app/foodbytes-api && mvn test -Dtest=MealPlanTemplateControllerTest
cd foodbytes-app/foodbytes-api && mvn test
cd foodbytes-app/client && npm run build
cd foodbytes-app/client && npm run dev   # manual: walk the save / apply / manage flows at /mealplan
```

DB sanity (against Railway MySQL or local docker mysql):

```sql
SHOW CREATE TABLE meal_plan_templates;
SHOW CREATE TABLE meal_plan_template_entries;
-- After saving "High Protein Diet" from week 2026-05-11:
SELECT t.name, e.day_offset, e.meal_id, e.recipe_id, e.servings
FROM meal_plan_templates t
JOIN meal_plan_template_entries e ON e.template_id = t.id
WHERE t.user_id = <me> AND t.name = 'High Protein Diet'
ORDER BY e.day_offset, e.meal_id;
-- Expect 21 rows (3 meals × 7 days), day_offset 0..6.
```

## Open questions

1. **Variant resolution on apply** — templates store concrete `recipe_id`s. If the user later renames a `RecipeFamily` default from Moderate to Balanced, the saved plan still points at the old recipe id. Acceptable for v1, or should apply re-resolve to the family's current default? (Recommended: keep literal id in v1; revisit if users complain.)
2. **What happens if a referenced recipe has been deleted?** Recommended: skip silently and surface "X recipes were skipped because they no longer exist" in the apply-success toast. Confirm before implementing.
3. **Mobile menu behavior** — should the new overflow menu be a bottom-sheet on mobile or a simple anchored dropdown like desktop? Existing modals use pull-to-dismiss; menus do not. Default: anchored dropdown on both, matching simplicity.
4. **Servings preserved exactly** — confirm that template entries should snapshot `servings` from the source week (1–N) and replay them verbatim on apply. Default: yes.

---

`.docs/requirement-meal-plan-templates-2026-05-09.md`

**Hand-off:** start a fresh Claude session and reference this doc with `@.docs/requirement-meal-plan-templates-2026-05-09.md` to begin implementation.

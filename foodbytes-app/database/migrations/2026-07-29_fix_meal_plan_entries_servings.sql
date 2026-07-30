-- =============================================================================
-- 2026-07-29 — Repair meal_plan_entries.servings stored as 1 against
--               2-serving recipes (contract 2026-07-29-shopping-list-servings-halving)
--
-- THIS IS A DATA REPAIR, NOT DDL.
--   No table is created, altered or dropped. Hibernate runs `ddl-auto: validate`
--   and has nothing to validate here — the schema is untouched. This file lives
--   under `database/migrations/` only because that is where this repo keeps its
--   ad-hoc, manually-applied SQL.
--
-- SYMPTOM
--   The shopping list showed half the required quantity for affected recipes —
--   reported case: `Sirloin steak` listed as 120 g instead of 240 g.
--
-- ROOT CAUSE
--   `ShoppingListService.processRecipeIngredients` correctly scales each
--   ingredient by `quantity * entry.servings / recipe.defaultServings`
--   (ShoppingListService.java:474-476, mirrored on the meal-breakdown path at
--   ShoppingListService.java:267-269), but 23 `meal_plan_entries` rows were
--   minted with `servings = 1` while their recipe's `default_servings = 2`,
--   so 240 * 1 / 2 = 120.
--
--   The code fix shipped in the same contract (Phases 1 and 2): the literal
--   fallback is now `MealPlanService.resolveServings(...)`, derived from
--   `recipe.getDefaultServings()`, and the `= 1` field initialiser was removed
--   from `MealPlanCreateRequest.servings` (plus two mirrored JS parameter
--   defaults in `mealPlanService.js` and `MealPlanContext.jsx`).
--   This file repairs only the rows those paths already created.
--
-- !! WARNING — WRITES TO LIVE PERSONAL DATA !!
--   This modifies real meal-plan rows in the production Railway MySQL.
--   Scope: exactly 23 rows, `user_id = 1` ONLY.
--   The commented rollback block at the very bottom of this file is the ONLY
--   reversal path — there is no other backup of the pre-image. Read it before
--   you run the UPDATE.
--
-- SAFE TO RE-RUN
--   The UPDATE carries an `AND mpe.servings = 1` guard, so a second run matches
--   0 rows instead of re-applying. The id list is enumerated, never predicated.
--
-- OUT OF SCOPE — DO NOT SWEEP IN: meal_plan_entries.id = 306
--   A 24th row exhibits the same defect (`servings = 1`, `default_servings > 1`)
--   but belongs to `user_id = 6` (a different person), `plan_date 2026-01-26`,
--   `recipe_id 3`. It is six months stale and is not this user's data, so
--   rewriting it is not implied by "confirm and fix my shopping list".
--   Id 306 deliberately appears NOWHERE as a target in this file — it shows up
--   only in the audit queries below, where its survival is the expected result.
--   If a future reader is tempted to "helpfully" include it: don't. Raise it
--   with user 6 first.
--
-- NOTE ON DATES
--   The `mysql` client renders raw `DATE` columns in UTC, so `2026-07-31` comes
--   back as `2026-07-30T23:00:00.000Z`. Every query below therefore formats
--   `plan_date` with `DATE_FORMAT(...,'%Y-%m-%d')`. Never read a raw plan_date.
--
-- Apply manually to Railway. Run the sections in order, top to bottom.
-- =============================================================================


-- =============================================================================
-- STEP 1 — PRE-FLIGHT: see exactly what is about to change
-- -----------------------------------------------------------------------------
-- Expected: 23 rows. Every row has `servings = 1` and `default_servings = 2`,
-- `user_id = 1`, and `recipe_id` in (23, 37, 104, 139, 142). `plan_date` spans
-- roughly 2026-05-12 → 2026-07-31; the bounds recorded in plan.md were read from
-- raw UTC-shifted output and may be one day early, so a +/-1 day difference is
-- NOT a reason to stop. STOP only if the id set differs, or if any row has
-- `servings <> 1` or `default_servings <> 2`.
-- =============================================================================

SELECT mpe.id,
       DATE_FORMAT(mpe.plan_date, '%Y-%m-%d') AS plan_date,
       mpe.user_id,
       mpe.recipe_id,
       r.name AS recipe_name,
       mpe.servings,
       r.default_servings
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.id IN (956,961,964,1078,1081,1084,1192,1200,1203,1223,1231,1234,
                 1254,1256,1259,1275,1277,1299,1301,1323,1353,1416,1493)
ORDER BY mpe.id;


-- =============================================================================
-- STEP 2 — PRE-FLIGHT AUDIT: every affected row repo-wide, not just the targets
-- -----------------------------------------------------------------------------
-- Expected BEFORE the repair: 24 rows — the 23 `user_id = 1` targets from
--   STEP 1, plus id 306 (`user_id = 6`, out of scope, see header).
-- Expected AFTER the repair:   1 row  — id 306 only.
--
-- If this returns rows that are neither in the 23-id list nor id 306, then a
-- defaulting path still exists that the contract did not close. REPORT that
-- rather than sweeping the extra rows into the UPDATE below — the enumerated id
-- list is deliberate and must not be widened on the fly.
-- =============================================================================

SELECT mpe.id,
       DATE_FORMAT(mpe.plan_date, '%Y-%m-%d') AS plan_date,
       mpe.user_id,
       mpe.recipe_id,
       r.name AS recipe_name,
       mpe.servings,
       r.default_servings
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.servings = 1
  AND r.default_servings > 1
ORDER BY mpe.user_id, mpe.id;


-- =============================================================================
-- STEP 3 — THE REPAIR
-- -----------------------------------------------------------------------------
-- Expected: 23 rows affected.
--
-- This is a SINGLE AUTOCOMMIT STATEMENT — there is no START TRANSACTION and no
-- COMMIT to remember. It either applies in full or not at all; a partial repair
-- is not reachable.
--
-- Four deliberate design choices:
--
--   1. `SET mpe.servings = r.default_servings` rather than a hardcoded `2`.
--      The correct value is a property of the recipe, so it is read from the
--      recipe. All five recipes involved happen to have `default_servings = 2`
--      today, but the statement stays correct if one of them changes.
--
--   2. `AND mpe.servings = 1` makes the statement IDEMPOTENT. Re-running it
--      affects 0 rows instead of re-applying, and it cannot clobber a row that
--      someone has since set to a deliberate value.
--
--   3. The id list is ENUMERATED, not predicate-driven (i.e. not
--      `WHERE servings = 1 AND default_servings > 1`). A genuine one-serving
--      entry created between planning and application must not be caught by
--      accident, and user 6's id 306 must not be touched at all.
--
--   4. `AND mpe.user_id = 1` is DEFENCE-IN-DEPTH. The file header promises this
--      statement touches `user_id = 1` ONLY; this predicate makes the SQL
--      enforce that promise rather than merely assert it. It is a no-op if the
--      enumerated id list is correct, and a hard stop (0 rows matched for the
--      offending id) if an id in the list ever turns out to belong to someone
--      else — notably user 6's id 306.
-- =============================================================================

UPDATE meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
SET mpe.servings = r.default_servings
WHERE mpe.id IN (956,961,964,1078,1081,1084,1192,1200,1203,1223,1231,1234,
                 1254,1256,1259,1275,1277,1299,1301,1323,1353,1416,1493)
  AND mpe.servings = 1
  AND mpe.user_id = 1;


-- =============================================================================
-- STEP 4 — POST-FLIGHT AUDIT: confirm only the intended rows moved
-- -----------------------------------------------------------------------------
-- Same audit as STEP 2, re-run.
-- Expected: exactly 1 row — `id = 306`, `user_id = 6`. Every `user_id = 1` row
-- has left the result set. Any surviving `user_id = 1` row means the UPDATE did
-- not fully apply — unless its id is outside the 23-id list in STEP 1, in which
-- case it is a newly created row, not a failed update. Cross-check the id before
-- concluding the UPDATE failed.
-- =============================================================================

SELECT mpe.id,
       DATE_FORMAT(mpe.plan_date, '%Y-%m-%d') AS plan_date,
       mpe.user_id,
       mpe.recipe_id,
       r.name AS recipe_name,
       mpe.servings,
       r.default_servings
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.servings = 1
  AND r.default_servings > 1
ORDER BY mpe.user_id, mpe.id;


-- =============================================================================
-- STEP 5 — POST-FLIGHT SYMPTOM CHECK: the exact figure from the bug report
-- -----------------------------------------------------------------------------
-- Entry 1493 is the Light variant of "Beef & Mushroom Black Bean Stir Fry"
-- (recipe 104); `recipe_ingredients.id = 1584` is the 240 g Sirloin steak row.
-- This reproduces the arithmetic ShoppingListService performs.
--
-- Expected: one row —
--   ingredient = 'Sirloin steak', recipe_qty = 240.00, servings = 2,
--   default_servings = 2, shopping_list_qty = 240.00
-- Before the repair this returned shopping_list_qty = 120.00.
-- =============================================================================

SELECT i.name AS ingredient, ri.quantity AS recipe_qty, mpe.servings, r.default_servings,
       ROUND(ri.quantity * mpe.servings / r.default_servings, 2) AS shopping_list_qty
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE mpe.id = 1493 AND i.name = 'Sirloin steak' AND ri.id = 1584;


-- =============================================================================
-- ROLLBACK — restores the exact pre-image (every one of the 23 rows held
--            `servings = 1` before STEP 3 ran)
-- -----------------------------------------------------------------------------
-- COMMENTED OUT ON PURPOSE so it cannot fire by accident. Uncomment only the
-- lines you actually want to reverse.
--
-- Written as 23 per-row statements rather than one `IN (...)` statement so that
-- a partial reversal is possible: if only some of the repaired entries turn out
-- to have been legitimately single-serving, reverse just those ids and leave
-- the rest corrected.
--
-- Ids are ascending and byte-identical to the STEP 1 / STEP 3 lists above.
-- =============================================================================

-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 956;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 961;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 964;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1078;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1081;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1084;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1192;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1200;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1203;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1223;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1231;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1234;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1254;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1256;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1259;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1275;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1277;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1299;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1301;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1323;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1353;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1416;
-- UPDATE meal_plan_entries SET servings = 1 WHERE id = 1493;

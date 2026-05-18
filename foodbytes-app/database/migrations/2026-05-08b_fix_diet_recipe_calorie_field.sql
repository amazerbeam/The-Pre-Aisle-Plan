-- =============================================================================
-- Fix: doubles `recipes.calories` for the 15 new "- Diet" recipes (ids 187–201).
--
-- Bug: the migrations on 2026-05-07 and 2026-05-08 stored per-serving kcal in
-- `recipes.calories`, but the existing convention (e.g. Pink Sauce Pasta id 37
-- stored 1115 = 557 per-srv × default_servings 2) is whole-recipe kcal.
-- The UI displays `calories / default_servings`, so the new recipes were
-- showing half the real per-serving kcal.
--
-- Fix: multiply the stored values by default_servings (always 2 here).
-- After this runs, every Light/Moderate/Balanced "- Diet" recipe will display
-- correct per-serving kcal in the meal-plan UI.
--
-- Idempotent guard: only multiplies if the stored value is still suspiciously
-- low (< 900 — well below any realistic whole-recipe total). Safe to re-run.
--
-- Apply manually to Railway. No schema change.
-- =============================================================================

START TRANSACTION;

UPDATE recipes
SET calories = calories * default_servings
WHERE id BETWEEN 187 AND 201
  AND calories < 900;   -- guard: skip if already corrected

-- Verify (run after applying):
-- SELECT id, name, default_servings, calories,
--        ROUND(calories / default_servings) AS kcal_per_srv
-- FROM recipes WHERE id BETWEEN 187 AND 201 ORDER BY id;

COMMIT;

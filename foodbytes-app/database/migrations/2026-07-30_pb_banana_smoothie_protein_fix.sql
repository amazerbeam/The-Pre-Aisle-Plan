-- 2026-07-30  Peanut Butter Banana Smoothie (family 2, recipes 4/5/6) — protein + kcal fix
--
-- Problem: all three variants failed the per-variant targets in CLAUDE.md on BOTH
-- protein and kcal. Per serving before this migration:
--   Light    (4)  P 14.3 g,  378 kcal   (needs >=35 g, 450-550)
--   Moderate (5)  P 18.8 g,  501 kcal   (needs >=35 g, 550-650)
--   Balanced (6)  P 23.5 g,  626 kcal   (needs >=35 g, 700-800)
-- Fat% sat at 34.3% on every variant (top edge of the 25-35% band), so adding
-- whey both raises protein/kcal AND pulls fat% down into the middle of the band.
--
-- Fix: 60 g Whey protein isolate (ingredient 163, macros_verified) per recipe
-- = 2 x 30 g scoops, one per serving. Light also gets banana 300 -> 330 g,
-- because whey alone leaves it at 39.9% carbs (inside the 1-2% slack, but on
-- the wrong side of the 40% floor).
--
-- After (verified against live Railway DB, recomputed from recipe_ingredients):
--   Light    (4)  whole 987 kcal  -> per srv P 38.6, 494 kcal, fat 27.2%, carbs 41.5%
--   Moderate (5)  whole 1204 kcal -> per srv P 43.0, 602 kcal, fat 29.3%, carbs 42.2%
--   Balanced (6)  whole 1454 kcal -> per srv P 47.7, 727 kcal, fat 30.1%, carbs 43.6%
-- Ordering 494 < 602 < 727, gaps 108 / 125 kcal.
--
-- Also fixes a recipe-variants rule violation: is_default was on Balanced,
-- must be Moderate.
--
-- Idempotent: inserts are guarded with WHERE NOT EXISTS, updates are absolute
-- assignments. Re-running the whole file is a no-op.
--
-- NOTE on the guards: `<=>` is avoided because the MySQL MCP client's SQL
-- parser rejects it, and the NOT EXISTS subquery reads a derived table because
-- MySQL will not let INSERT ... SELECT read the target table directly. These
-- rows never carry a linked_recipe_id, so `linked_recipe_id IS NULL` is exact.

-- 1. Whey protein isolate, 60 g on each variant
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT r.id, 163, NULL, 60.00, 1, 60.00, 5
FROM recipes r
WHERE r.id IN (4,5,6)
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT recipe_id, ingredient_id, linked_recipe_id FROM recipe_ingredients) AS ex
    WHERE ex.recipe_id = r.id AND ex.ingredient_id = 163 AND ex.linked_recipe_id IS NULL
  );

-- 2. Light: banana 300 -> 330 g (keeps carbs% off the 40% floor)
UPDATE recipe_ingredients SET quantity = 330.00, quantity_grams = 330.00
WHERE recipe_id = 4 AND ingredient_id = 10;

-- 3. recipes.calories = whole-recipe kcal (per-serving x default_servings)
UPDATE recipes SET calories = CASE id WHEN 4 THEN 987 WHEN 5 THEN 1204 WHEN 6 THEN 1454 END
WHERE id IN (4,5,6);

-- 4. Default variant must be Moderate (was Balanced)
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 5 THEN 1 ELSE 0 END
WHERE family_id = 2;

-- 5. Steps: load powder into liquid (not onto frozen fruit), longer blend,
--    thickening/loosening cue, and an explicit taste-and-adjust before plating.
--    Updated in place rather than DELETE + re-INSERT: nothing is renumbered, so
--    there are no (recipe_id, step_number) unique-key collisions, and the
--    recipes never pass through a zero-step state.
UPDATE recipe_steps SET instruction = 'Peel the bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid. Frozen banana is what makes this thick - fresh banana gives you a thin, foamy drink.'
WHERE recipe_id IN (4,5,6) AND step_number = 1;

UPDATE recipe_steps SET instruction = 'Pour the milk into the blender first, then add the whey protein isolate (2 x 30 g scoops), the peanut butter, and finally the frozen banana chunks. Powder goes into liquid, never on top of the frozen fruit, or it clumps against the blender wall.'
WHERE recipe_id IN (4,5,6) AND step_number = 2;

UPDATE recipe_steps SET instruction = 'Blend on high until completely smooth and creamy, 80-110 seconds. Scrape the sides down once and blend again if you can still see pale powder streaks.'
WHERE recipe_id IN (4,5,6) AND step_number = 3;

UPDATE recipe_steps SET instruction = 'The whey keeps thickening as it hydrates. If it is too thick to pour, loosen with a splash more milk, 20-30 ml at a time, and pulse to combine.'
WHERE recipe_id IN (4,5,6) AND step_number = 4;

UPDATE recipe_steps SET instruction = 'Add a pinch of salt, pulse briefly, then taste. It should read sweet and nutty with the salt lifting the banana - if it tastes flat, add a second pinch.'
WHERE recipe_id IN (4,5,6) AND step_number = 5;

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT r.id, 6, 'Pour into glasses and serve immediately while thick and cold.', NULL, NULL, NULL
FROM recipes r
WHERE r.id IN (4,5,6)
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT recipe_id, step_number FROM recipe_steps) AS ex
    WHERE ex.recipe_id = r.id AND ex.step_number = 6
  );

-- =====================================================================
-- 2026-08-21  Chicken Chow Fun (family 112, recipes 270/271/272) --
--             post-insert 5-lens audit fixes
--
-- Findings from audit (see chat record) and fixes applied:
--   1. [Dish quality] No heat/spice element anywhere -> added Chilli
--      Flakes (165) to all three variants (sauce ingredient).
--   2. [Dish quality] Crunch/texture only present in Balanced (peanuts)
--      -> added Roasted Peanuts (140) 8g garnish to Light + Moderate too
--      (Balanced keeps its existing 20g).
--   3. [Technique] Sauce was fully added at the noodle-glazing stage
--      (step 5), diverging from the brief's "fold sauce in with bean
--      sprouts/chicken at the wet-egg stage" -> reworded steps 2/5/7 so
--      two-thirds of the sauce glazes the noodles and one-third is
--      folded in with the bean sprouts/chicken/egg.
--
-- Adding chilli flakes + peanuts pushed kcal up ~52 kcal/variant on
-- Light and Moderate (peanuts are the bulk of it). Compensated by
-- trimming chicken breast (protein has large headroom above the 35g
-- floor, no macro reject risk): Light 220g->185g, Moderate 240g->205g.
-- Balanced only gained the negligible chilli-flake delta, no offset
-- needed.
--
-- Recomputed post-fix macros (whole recipe / per serving, serves 2):
--   Light     1085 kcal / 542.5  P43.9g C53.4g F17.1g  fat 28.3% carbs 39.3%
--   Moderate  1277 kcal / 638.6  P47.7g C67.0g F20.0g  fat 28.2% carbs 41.9%
--   Balanced  1579 kcal / 789.3  P64.8g C76.5g F24.9g  fat 28.4% carbs 38.8%
-- All still pass: protein >=35g, fat 25-35%, carbs >=38%, kcal ordering
-- Light<Moderate<Balanced with >80kcal gaps. macros_audited=1 set on
-- all three (macros_audited_by left NULL, per convention).
--
-- Idempotent: ingredient inserts guarded with WHERE NOT EXISTS; quantity
-- UPDATEs and the recipes.calories/macros_audited UPDATEs are naturally
-- idempotent (re-running sets the same values again).
-- =====================================================================

-- 1. Chicken breast portion trims (Light, Moderate only)
UPDATE recipe_ingredients SET quantity = 185.00, quantity_grams = 185.00
WHERE recipe_id = 270 AND ingredient_id = 11 AND linked_recipe_id IS NULL;

UPDATE recipe_ingredients SET quantity = 205.00, quantity_grams = 205.00
WHERE recipe_id = 271 AND ingredient_id = 11 AND linked_recipe_id IS NULL;

-- 2. Chilli Flakes (165) added to all three variants
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 165, NULL, 1.00, 17, 1.00, 17
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND ingredient_id=165 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 165, NULL, 1.00, 17, 1.00, 17
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND ingredient_id=165 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 165, NULL, 1.00, 17, 1.00, 18
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND ingredient_id=165 AND linked_recipe_id IS NULL);

-- 3. Roasted Peanuts (140) garnish added to Light + Moderate (Balanced already has 20g)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 140, NULL, 8.00, 1, 8.00, 18
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND ingredient_id=140 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 140, NULL, 8.00, 1, 8.00, 18
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND ingredient_id=140 AND linked_recipe_id IS NULL);

-- 4. Recomputed whole-recipe calories
UPDATE recipes SET calories = 1085 WHERE id = 270;
UPDATE recipes SET calories = 1277 WHERE id = 271;
UPDATE recipes SET calories = 1579 WHERE id = 272;

-- 5. Step rewrites: chilli into the sauce mix (step 2), two-thirds sauce
--    glazes the noodles (step 5), remaining third folds in at the wet-egg
--    stage (step 7), peanut-scatter line added to Light/Moderate step 8.
UPDATE recipe_steps SET instruction = 'Whisk the soy sauce, dark soy sauce, oyster sauce, sugar, lime juice, chilli flakes and white pepper together in a small bowl to make the sauce.'
WHERE recipe_id IN (270,271,272) AND step_number = 2;

UPDATE recipe_steps SET instruction = 'Add the red pepper and stir-fry for 1-2 minutes, then add the noodles and sweetcorn. Pour over two-thirds of the sauce and toss to coat, cooking for 2-3 minutes until the noodles are heated through with lightly charred edges.'
WHERE recipe_id IN (270,271,272) AND step_number = 5;

UPDATE recipe_steps SET instruction = 'While the egg is still wet, immediately fold in the bean sprouts, rested chicken, half the spring onions and the remaining sauce, tossing off the heat so the egg coats everything in silky ribbons and the sprouts stay crisp.'
WHERE recipe_id IN (270,271,272) AND step_number = 7;

UPDATE recipe_steps SET instruction = 'Taste and adjust the seasoning with a little extra soy sauce if needed. Scatter the crushed roasted peanuts over the top, plate, and garnish with the remaining spring onion.'
WHERE recipe_id IN (270,271) AND step_number = 8;

-- 6. Mark the audit complete on all three family members
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (270, 271, 272);

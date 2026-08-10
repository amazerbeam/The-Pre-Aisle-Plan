-- Task 6: Design and insert the Greek Yogurt & Granola Bowl family (links Task 2)
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- all three
-- variants cleared every reject condition on first design.

-- Step 1: Confirm granola recipe id + total yield.
SELECT id, name, calories, default_servings FROM recipes WHERE name = 'Goodness Granola';
-- Result: id=213, calories=2393, default_servings=10 -- total yield = 500g
-- (10 x 50g servings, from Task 2's own design).

-- Step 2: Resolve remaining ingredients. Greek yogurt (49), Mixed berries (3),
-- Honey (4) all already confirmed live. No new ingredients.

-- Step 3: Design -- "Greek Yogurt & Granola Bowl", meal_id=1 (Breakfast).
-- Granola portions used (90g/120g/150g) are all well under the 500g total
-- yield -- satisfies the 50g-vs-300g proration rule.
-- Ingredients (whole recipe, serves 2):
--                    Light             Moderate (default)   Balanced
-- Greek yogurt (49)  600g              700g                  900g
-- Goodness Granola   90g (linked 213)  120g (linked 213)     150g (linked 213)
-- Mixed berries (3)  130g              160g                  200g
-- Honey (4)          12g (2.4 tsp)     18g (3.6 tsp)          25g (5 tsp)

-- Step 4/5: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=219, families=95, steps=1941, recipe_ingredients=2707 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Greek Yogurt & Granola Bowl', 2, 907, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Greek Yogurt & Granola Bowl');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Greek Yogurt & Granola Bowl', 2, 1148, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Greek Yogurt & Granola Bowl');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Greek Yogurt & Granola Bowl', 2, 1458, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Greek Yogurt & Granola Bowl');
-- New recipe ids: Light=220, Moderate=221, Balanced=222

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 220, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=220 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 221, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=221 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 222, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=222 AND meal_id=1);

-- recipe_ingredients (guarded). Granola row: ingredient_id=NULL, linked_recipe_id=213,
-- quantity_grams = portion actually served -- never the 500g total yield.
-- Light (220)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 220, 49, NULL, 600.00, 1, 600.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=220 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 220, NULL, 213, 90.00, 1, 90.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=220 AND linked_recipe_id=213);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 220, 3, NULL, 130.00, 1, 130.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=220 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 220, 4, NULL, 2.40, 3, 12.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=220 AND ingredient_id=4 AND linked_recipe_id IS NULL);
-- Moderate (221)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 221, 49, NULL, 700.00, 1, 700.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=221 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 221, NULL, 213, 120.00, 1, 120.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=221 AND linked_recipe_id=213);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 221, 3, NULL, 160.00, 1, 160.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=221 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 221, 4, NULL, 3.60, 3, 18.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=221 AND ingredient_id=4 AND linked_recipe_id IS NULL);
-- Balanced (222)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 222, 49, NULL, 900.00, 1, 900.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=222 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 222, NULL, 213, 150.00, 1, 150.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=222 AND linked_recipe_id=213);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 222, 3, NULL, 200.00, 1, 200.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=222 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 222, 4, NULL, 5.00, 3, 25.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=222 AND ingredient_id=4 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2708-2719

-- recipe_steps: each variant carries the mandatory linked step (linked_recipe_id=213
-- + populated alt_instruction), per .claude/rules/linked-recipe-extras.md.
DELETE FROM recipe_steps WHERE recipe_id IN (220,221,222);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(220, 1, 'Spoon the Greek yogurt into two bowls.', NULL, NULL),
(220, 2, 'Top with 90g of the linked Goodness Granola (45g per bowl).', 213, 'Use 90g of store-bought granola instead (45g per bowl).'),
(220, 3, 'Scatter over the mixed berries.', NULL, NULL),
(220, 4, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(221, 1, 'Spoon the Greek yogurt into two bowls.', NULL, NULL),
(221, 2, 'Top with 120g of the linked Goodness Granola (60g per bowl).', 213, 'Use 120g of store-bought granola instead (60g per bowl).'),
(221, 3, 'Scatter over the mixed berries.', NULL, NULL),
(221, 4, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(222, 1, 'Spoon the Greek yogurt into two bowls.', NULL, NULL),
(222, 2, 'Top with 150g of the linked Goodness Granola (75g per bowl).', 213, 'Use 150g of store-bought granola instead (75g per bowl).'),
(222, 3, 'Scatter over the mixed berries.', NULL, NULL),
(222, 4, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL);

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Greek Yogurt & Granola Bowl'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Greek Yogurt & Granola Bowl');
-- New family id: 96

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 96, 220, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=96 AND recipe_id=220);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 96, 221, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=96 AND recipe_id=221);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 96, 222, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=96 AND recipe_id=222);

-- Step 6: Verify.
-- Linked-step coverage (all 3 recipe_ingredients rows with linked_recipe_id=213):
--   linked_step_count = 1 on all three. Pass.
-- Family structure: 3 members, Light(220)/Moderate(221,is_default=1)/Balanced(222),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients + prorated Goodness Granola, granola ratio =
-- quantity_grams / 500g total yield):
--   Light:    P 36.19  C 45.97  F 13.86  kcal 453.4 (stored 907,  matches 2x)
--   Moderate: P 43.18  C 59.52  F 18.11  kcal 573.8 (stored 1148, matches 2x)
--   Balanced: P 55.23  C 75.87  F 22.72  kcal 728.9 (stored 1458, matches 2x)
-- Matches design exactly. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=96, Light=220, Moderate=221, Balanced=222
-- ==========================================================================

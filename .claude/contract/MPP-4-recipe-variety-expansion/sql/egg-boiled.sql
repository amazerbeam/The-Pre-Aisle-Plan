-- Task 8: Design and insert the Boiled Egg family
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- all three
-- variants cleared every reject condition on first design.

-- Step 1: Resolve ingredients. Cottage cheese (169) confirmed live.
-- Toast linked to Milk Bread (id 26), same as Tasks 3 and 7 -- reusing an
-- existing linkable sub-recipe across multiple dishes is exactly the point
-- of the homemade-first pattern, not a bug.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%chive%' OR LOWER(name) LIKE '%spring onion%';
-- Result: Spring onions (id 128) already exists, reused for flavour/garnish.

-- Step 2-3: Design -- "Soft-Boiled Eggs, Cottage Cheese & Toast", meal_id=1.
-- Ingredients (whole recipe, serves 2):
--                     Light             Moderate (default)   Balanced
-- Egg (59)            150g (3)          200g (4)              250g (5)
-- Cottage cheese (169) 300g             300g                  380g
-- Milk Bread (toast, linked 26) 220g    300g                  380g
-- Spring onions (128) 15g               20g                    25g
-- Black pepper (50)   0.5g              0.5g                   0.5g
-- Salt (5)            1g                1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=225, families=97, steps=1971, recipe_ingredients=2743 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Soft-Boiled Eggs, Cottage Cheese & Toast', 2, 958, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Soft-Boiled Eggs, Cottage Cheese & Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Soft-Boiled Eggs, Cottage Cheese & Toast', 2, 1220, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Soft-Boiled Eggs, Cottage Cheese & Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Soft-Boiled Eggs, Cottage Cheese & Toast', 2, 1540, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Soft-Boiled Eggs, Cottage Cheese & Toast');
-- New recipe ids: Light=226, Moderate=227, Balanced=228

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 226, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=226 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 227, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=227 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 228, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=228 AND meal_id=1);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (226)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, 59, NULL, 3.00, 5, 150.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, 169, NULL, 300.00, 1, 300.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND ingredient_id=169 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, NULL, 26, 220.00, 1, 220.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, 128, NULL, 15.00, 1, 15.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND ingredient_id=128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 226, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=226 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (227)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, 59, NULL, 4.00, 5, 200.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, 169, NULL, 300.00, 1, 300.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND ingredient_id=169 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, NULL, 26, 300.00, 1, 300.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, 128, NULL, 20.00, 1, 20.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND ingredient_id=128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 227, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=227 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (228)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, 59, NULL, 5.00, 5, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, 169, NULL, 380.00, 1, 380.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND ingredient_id=169 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, NULL, 26, 380.00, 1, 380.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, 128, NULL, 25.00, 1, 25.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND ingredient_id=128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 228, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=228 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2744-2761

-- recipe_steps: toast step carries linked_recipe_id=26 + alt_instruction.
-- Boiled-egg technique given a real endpoint (6 min soft / 7 min firm, ice-bath step).
DELETE FROM recipe_steps WHERE recipe_id IN (226,227,228);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(226, 1, 'Toast the bread according to the linked recipe. Use 220g (4-5 slices @ 50g each).', 26, 'Toast 4-5 slices of store-bought bread (~50g each).'),
(226, 2, 'Bring a pan of water to a gentle boil. Lower in the eggs and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer).', NULL, NULL),
(226, 3, 'Transfer the eggs to an ice bath for 1 minute to stop the cooking, then peel.', NULL, NULL),
(226, 4, 'Spread the cottage cheese over the toast.', NULL, NULL),
(226, 5, 'Halve the eggs and arrange over the cottage cheese. Scatter with spring onions, salt, and pepper. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(227, 1, 'Toast the bread according to the linked recipe. Use 300g (6 slices @ 50g each).', 26, 'Toast 6 slices of store-bought bread (~50g each).'),
(227, 2, 'Bring a pan of water to a gentle boil. Lower in the eggs and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer).', NULL, NULL),
(227, 3, 'Transfer the eggs to an ice bath for 1 minute to stop the cooking, then peel.', NULL, NULL),
(227, 4, 'Spread the cottage cheese over the toast.', NULL, NULL),
(227, 5, 'Halve the eggs and arrange over the cottage cheese. Scatter with spring onions, salt, and pepper. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(228, 1, 'Toast the bread according to the linked recipe. Use 380g (7-8 slices @ 50g each).', 26, 'Toast 7-8 slices of store-bought bread (~50g each).'),
(228, 2, 'Bring a pan of water to a gentle boil. Lower in the eggs and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer).', NULL, NULL),
(228, 3, 'Transfer the eggs to an ice bath for 1 minute to stop the cooking, then peel.', NULL, NULL),
(228, 4, 'Spread the cottage cheese over the toast.', NULL, NULL),
(228, 5, 'Halve the eggs and arrange over the cottage cheese. Scatter with spring onions, salt, and pepper. Serve immediately.', NULL, NULL);

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Soft-Boiled Eggs, Cottage Cheese & Toast'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Soft-Boiled Eggs, Cottage Cheese & Toast');
-- New family id: 98

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 98, 226, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=98 AND recipe_id=226);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 98, 227, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=98 AND recipe_id=227);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 98, 228, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=98 AND recipe_id=228);

-- Step 5: Verify.
-- Linked-step coverage (linked_recipe_id=26): linked_step_count=1 on all three. Pass.
-- Family structure: 3 members, Light(226)/Moderate(227,is_default=1)/Balanced(228),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients + prorated Milk Bread, ratio = quantity_grams/743g):
--   Light:    P 35.23  C 52.03  F 14.42  kcal 478.8 (stored 958,  matches 2x)
--   Moderate: P 41.73  C 69.00  F 18.59  kcal 610.2 (stored 1220, matches 2x)
--   Balanced: P 52.63  C 87.33  F 23.36  kcal 770.0 (stored 1540, matches 2x)
-- Matches design. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=98, Light=226, Moderate=227, Balanced=228
-- ==========================================================================

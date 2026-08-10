-- Task 7: Design and insert the Poached Egg family
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- both
-- iterations (first attempt overshot fat%/undershot carbs%, rebalanced with
-- less avocado + more toast) landed all three variants in range.

-- Step 1: Resolve ingredients.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE LOWER(name) LIKE '%salmon%';
-- Result: Tinned salmon (54), Salmon Fillet (109) -- no "Smoked Salmon". New ingredient needed.
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'smoked_salmon', 'Smoked Salmon', 5, 18.30, 0.00, 4.30
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Smoked Salmon'));
-- New ingredient id: 185 (USDA lox-style smoked salmon values, aisle 5 = Fish)
-- Lemon (88) and Fresh Dill (156) already confirmed live -- reused.
-- Toast linked to Milk Bread (id 26) per homemade-first rule -- no raw bread inlined.

-- Step 2-3: Design -- "Poached Eggs, Smoked Salmon & Avocado on Toast", meal_id=1.
-- First attempt (Eggs 200g/Salmon 150g/Avocado 100g/Toast 250g) landed Moderate
-- at fat% 38.0% (fails >35% reject) and carbs% 37.5% (fails <38% reject) --
-- rebalanced by cutting avocado and increasing toast across all three variants.
-- Ingredients (whole recipe, serves 2):
--                    Light              Moderate (default)   Balanced
-- Egg (59)           150g (3)           200g (4)              250g (5)
-- Smoked Salmon (185) 180g              150g                  200g
-- Avocado (72)       40g (1/4)          60g (0.4)             70g (0.45)
-- Milk Bread (toast, linked 26) 220g    300g                  350g
-- Lemon (88)         12g (0.2)          15g (0.25)             18g (0.3)
-- Fresh Dill (156)   1.5g               2g                     2.5g
-- Black pepper (50)  0.5g               0.5g                   0.5g
-- Salt (5)           1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_ingredient_id', MAX(id) FROM ingredients
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=222, families=96, ingredients=184 (pre Smoked Salmon insert), steps=1953, recipe_ingredients=2719

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Poached Eggs, Smoked Salmon & Avocado on Toast', 2, 1018, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Poached Eggs, Smoked Salmon & Avocado on Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Poached Eggs, Smoked Salmon & Avocado on Toast', 2, 1283, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Poached Eggs, Smoked Salmon & Avocado on Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Poached Eggs, Smoked Salmon & Avocado on Toast', 2, 1550, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Poached Eggs, Smoked Salmon & Avocado on Toast');
-- New recipe ids: Light=223, Moderate=224, Balanced=225

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 223, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=223 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 224, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=224 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 225, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=225 AND meal_id=1);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (223)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 59, NULL, 3.00, 5, 150.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 185, NULL, 180.00, 1, 180.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=185 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 72, NULL, 0.25, 5, 40.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=72 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, NULL, 26, 220.00, 1, 220.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 88, NULL, 0.20, 5, 12.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 156, NULL, 1.50, 1, 1.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=156 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 223, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=223 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (224)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 59, NULL, 4.00, 5, 200.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 185, NULL, 150.00, 1, 150.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=185 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 72, NULL, 0.40, 5, 60.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=72 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, NULL, 26, 300.00, 1, 300.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 88, NULL, 0.25, 5, 15.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 156, NULL, 2.00, 1, 2.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=156 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 224, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=224 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (225)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 59, NULL, 5.00, 5, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 185, NULL, 200.00, 1, 200.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=185 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 72, NULL, 0.45, 5, 70.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=72 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, NULL, 26, 350.00, 1, 350.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 88, NULL, 0.30, 5, 18.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 156, NULL, 2.50, 1, 2.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=156 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 225, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=225 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2720-2743

-- recipe_steps: toast step carries linked_recipe_id=26 + alt_instruction. Poached
-- egg technique given a real endpoint (simmer not boil, 3-min timing, drain step).
DELETE FROM recipe_steps WHERE recipe_id IN (223,224,225);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(223, 1, 'Toast the bread according to the linked recipe. Use 220g (4-5 slices @ 50g each).', 26, 'Toast 4-5 slices of store-bought bread (~50g each).'),
(223, 2, 'Bring a pan of water to a gentle simmer (not a rolling boil) and add a splash of the lemon juice.', NULL, NULL),
(223, 3, 'Crack each egg into a small cup, then slide gently into the water. Poach 3 minutes for a runny yolk, until the white is set.', NULL, NULL),
(223, 4, 'Lift the eggs out with a slotted spoon and drain briefly on kitchen paper.', NULL, NULL),
(223, 5, 'Layer the toast with mashed avocado, top with the smoked salmon and poached eggs.', NULL, NULL),
(223, 6, 'Scatter with fresh dill, crack over black pepper, and season with salt. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(224, 1, 'Toast the bread according to the linked recipe. Use 300g (6 slices @ 50g each).', 26, 'Toast 6 slices of store-bought bread (~50g each).'),
(224, 2, 'Bring a pan of water to a gentle simmer (not a rolling boil) and add a splash of the lemon juice.', NULL, NULL),
(224, 3, 'Crack each egg into a small cup, then slide gently into the water. Poach 3 minutes for a runny yolk, until the white is set.', NULL, NULL),
(224, 4, 'Lift the eggs out with a slotted spoon and drain briefly on kitchen paper.', NULL, NULL),
(224, 5, 'Layer the toast with mashed avocado, top with the smoked salmon and poached eggs.', NULL, NULL),
(224, 6, 'Scatter with fresh dill, crack over black pepper, and season with salt. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(225, 1, 'Toast the bread according to the linked recipe. Use 350g (7 slices @ 50g each).', 26, 'Toast 7 slices of store-bought bread (~50g each).'),
(225, 2, 'Bring a pan of water to a gentle simmer (not a rolling boil) and add a splash of the lemon juice.', NULL, NULL),
(225, 3, 'Crack each egg into a small cup, then slide gently into the water. Poach 3 minutes for a runny yolk, until the white is set.', NULL, NULL),
(225, 4, 'Lift the eggs out with a slotted spoon and drain briefly on kitchen paper.', NULL, NULL),
(225, 5, 'Layer the toast with mashed avocado, top with the smoked salmon and poached eggs.', NULL, NULL),
(225, 6, 'Scatter with fresh dill, crack over black pepper, and season with salt. Serve immediately.', NULL, NULL);

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Poached Eggs, Smoked Salmon & Avocado on Toast'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Poached Eggs, Smoked Salmon & Avocado on Toast');
-- New family id: 97

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 97, 223, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=97 AND recipe_id=223);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 97, 224, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=97 AND recipe_id=224);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 97, 225, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=97 AND recipe_id=225);

-- Step 5: Verify.
-- Linked-step coverage (linked_recipe_id=26): linked_step_count=1 on all three. Pass.
-- Family structure: 3 members, Light(223)/Moderate(224,is_default=1)/Balanced(225),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients + prorated Milk Bread, ratio = quantity_grams/743g):
--   Light:    P 35.55  C 48.82  F 19.05  kcal 508.9 (stored 1018, matches 2x)
--   Moderate: P 39.49  C 66.67  F 24.08  kcal 641.3 (stored 1283, matches 2x)
--   Balanced: P 49.44  C 77.87  F 29.54  kcal 775.1 (stored 1550, matches 2x)
-- Matches design. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=97, Light=223, Moderate=224, Balanced=225, Smoked Salmon=185
-- ==========================================================================

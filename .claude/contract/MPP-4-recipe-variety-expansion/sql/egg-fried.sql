-- Task 9: Design and insert the Fried Egg family
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction, after two
-- rebalancing passes (halloumi's ~25g fat/100g repeatedly blew the 35%
-- fat ceiling; added lean Sliced Ham as an offsetting protein-fat lever
-- and cut/removed added frying oil) landed all three in range.

-- Step 1: Resolve ingredients.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE LOWER(name) LIKE '%halloumi%';
-- Result: zero rows -- Halloumi confirmed genuinely new.
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'halloumi', 'Halloumi', 6, 22.00, 2.00, 25.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Halloumi'));
-- New ingredient id: 186 (typical halloumi values, aisle 6 = Dairy)
-- Toast linked to Milk Bread (id 26), same pattern as Tasks 3/7/8.
-- Sliced Ham (id 108, lean 18P/1.5C/3F) reused from Task 3 as the protein-fat
-- offsetting lever against halloumi's fat density.

-- Step 2-3: Design -- "Fried Eggs with Halloumi & Toast", meal_id=1.
-- NOTE: Light carries MORE Sliced Ham (150g) than Moderate (80g) -- a
-- deliberate "swap fatty cheese for lean protein" lever (CLAUDE.md's own
-- "Light: leaner protein cut") since halloumi alone couldn't clear the
-- 35g/serving protein floor without exceeding the 35% fat ceiling at
-- Light's lower kcal budget. Not a rule violation -- no rule requires
-- monotonic per-ingredient amounts, only kcal/protein/fat/carbs ordering,
-- which holds.
-- Ingredients (whole recipe, serves 2):
--                     Light              Moderate (default)   Balanced
-- Egg (59)            150g (3)           200g (4)              250g (5)
-- Halloumi (186)      35g                50g                    55g
-- Sliced Ham (108)    150g               80g                    100g
-- Milk Bread (toast, linked 26) 230g     300g                   340g
-- Olive oil (22)      1g                 1g                     0g (halloumi/egg fat sufficient)
-- Black pepper (50)   0.5g               0.5g                   0.5g
-- Salt (5)            1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_ingredient_id', MAX(id) FROM ingredients
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=228, families=98, ingredients=185 (pre Halloumi insert), steps=1986, recipe_ingredients=2761

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Fried Eggs with Halloumi & Toast', 2, 1040, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Fried Eggs with Halloumi & Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Fried Eggs with Halloumi & Toast', 2, 1253, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Fried Eggs with Halloumi & Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Fried Eggs with Halloumi & Toast', 2, 1451, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Fried Eggs with Halloumi & Toast');
-- New recipe ids: Light=229, Moderate=230, Balanced=231

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 229, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=229 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 230, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=230 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 231, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=231 AND meal_id=1);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (229)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 59, NULL, 3.00, 5, 150.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 186, NULL, 35.00, 1, 35.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=186 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 108, NULL, 150.00, 1, 150.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, NULL, 26, 230.00, 1, 230.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 22, NULL, 0.20, 3, 1.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 229, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=229 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (230)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 59, NULL, 4.00, 5, 200.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 186, NULL, 50.00, 1, 50.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=186 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 108, NULL, 80.00, 1, 80.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, NULL, 26, 300.00, 1, 300.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 22, NULL, 0.20, 3, 1.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 230, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=230 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (231) -- no added oil, halloumi/egg fat sufficient at this scale
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, 59, NULL, 5.00, 5, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, 186, NULL, 55.00, 1, 55.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND ingredient_id=186 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, 108, NULL, 100.00, 1, 100.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, NULL, 26, 340.00, 1, 340.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 231, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=231 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2762-2781

-- recipe_steps: toast step carries linked_recipe_id=26 + alt_instruction.
-- Fried-egg technique given real endpoints (halloumi 1-2 min/side until
-- golden and crisp, eggs 2-3 min until whites set/crisp edges/runny yolk).
DELETE FROM recipe_steps WHERE recipe_id IN (229,230,231);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(229, 1, 'Toast the bread according to the linked recipe. Use 230g (4-5 slices @ 50g each).', 26, 'Toast 4-5 slices of store-bought bread (~50g each).'),
(229, 2, 'Slice the halloumi into ~1cm slabs and pat dry. Heat the olive oil in a non-stick pan over medium-high heat and fry the halloumi 1-2 minutes per side until golden and crisp at the edges.', NULL, NULL),
(229, 3, 'Push the halloumi to one side of the pan, crack in the eggs, and fry 2-3 minutes until the whites are set and crisp at the edges but the yolk is still runny.', NULL, NULL),
(229, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL),
(229, 5, 'Plate the toast with the halloumi, ham, and fried eggs. Season with salt and pepper. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(230, 1, 'Toast the bread according to the linked recipe. Use 300g (6 slices @ 50g each).', 26, 'Toast 6 slices of store-bought bread (~50g each).'),
(230, 2, 'Slice the halloumi into ~1cm slabs and pat dry. Heat the olive oil in a non-stick pan over medium-high heat and fry the halloumi 1-2 minutes per side until golden and crisp at the edges.', NULL, NULL),
(230, 3, 'Push the halloumi to one side of the pan, crack in the eggs, and fry 2-3 minutes until the whites are set and crisp at the edges but the yolk is still runny.', NULL, NULL),
(230, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL),
(230, 5, 'Plate the toast with the halloumi, ham, and fried eggs. Season with salt and pepper. Serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(231, 1, 'Toast the bread according to the linked recipe. Use 340g (7 slices @ 50g each).', 26, 'Toast 7 slices of store-bought bread (~50g each).'),
(231, 2, 'Slice the halloumi into ~1cm slabs and pat dry. Fry in a non-stick pan over medium-high heat (no added oil needed) 1-2 minutes per side until golden and crisp at the edges.', NULL, NULL),
(231, 3, 'Push the halloumi to one side of the pan, crack in the eggs, and fry 2-3 minutes until the whites are set and crisp at the edges but the yolk is still runny.', NULL, NULL),
(231, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL),
(231, 5, 'Plate the toast with the halloumi, ham, and fried eggs. Season with salt and pepper. Serve immediately.', NULL, NULL);

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Fried Eggs with Halloumi & Toast'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Fried Eggs with Halloumi & Toast');
-- New family id: 99

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 99, 229, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=99 AND recipe_id=229);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 99, 230, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=99 AND recipe_id=230);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 99, 231, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=99 AND recipe_id=231);

-- Step 5: Verify.
-- Linked-step coverage (linked_recipe_id=26): linked_step_count=1 on all three. Pass.
-- Family structure: 3 members, Light(229)/Moderate(230,is_default=1)/Balanced(231),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients + prorated Milk Bread, ratio = quantity_grams/743g):
--   Light:    P 36.34  C 49.95  F 19.45  kcal 520.2 (stored 1040, matches 2x)
--   Moderate: P 37.75  C 64.30  F 24.27  kcal 626.6 (stored 1253, matches 2x)
--   Balanced: P 44.95  C 73.03  F 28.15  kcal 725.3 (stored 1451, matches 2x)
-- Matches design. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=99, Light=229, Moderate=230, Balanced=231, Halloumi=186
-- ==========================================================================

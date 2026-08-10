-- Task 10: Design and insert the Omelette family
-- MPP-4-recipe-variety-expansion, Phase 2 (final task of this phase)
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- widened
-- Moderate's toast portion after the first pass left the Light->Moderate
-- kcal gap at only 49.5 (below the 80kcal advisory), then all three cleared
-- every reject condition with proper gaps.

-- Step 1: Resolve ingredients.
SELECT id, name, default_servings, calories FROM recipes WHERE LOWER(name) LIKE '%honey ham%';
-- Result: "Honey Ham" already exists as an Extras recipe (id 64, 10 servings,
-- 4104 kcal whole -- 2916g total yield). Per homemade-first rule, this
-- component MUST be linked, not replaced with a raw deli-ham ingredient.
SELECT SUM(quantity_grams) AS total_yield_g,
  SUM(ri.quantity_grams*i.protein_per_100g/100) AS total_p,
  SUM(ri.quantity_grams*i.carbs_per_100g/100) AS total_c,
  SUM(ri.quantity_grams*i.fat_per_100g/100) AS total_f
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id WHERE ri.recipe_id = 64;
-- Result: total_yield_g=2916, total P=531.028 C=104.44 F=173.519 (per-gram:
-- P=0.18211, C=0.03582, F=0.05951)
-- Cheddar Cheese (90) confirmed live and reused. Toast linked to Milk Bread
-- (id 26), same pattern as Tasks 3/7/8/9.

-- Step 2-3: Design -- "Cheese & Ham Omelette with Toast", meal_id=1.
-- French-style soft-curd technique chosen (off-heat whisk, gentle fold,
-- glossy finish) -- distinct doneness style, macro-neutral choice.
-- Ingredients (whole recipe, serves 2):
--                     Light              Moderate (default)   Balanced
-- Egg (59)            150g (3)           200g (4)              250g (5)
-- Cheddar Cheese (90) 18g                25g                    35g
-- Honey Ham (linked 64) 170g             100g                   130g
-- Milk Bread (toast, linked 26) 240g     320g                   380g
-- Black pepper (50)  0.5g                0.5g                   0.5g
-- Salt (5)            1g                 1g                     1g
-- (Pan uses a small amount of butter to cook the eggs -- not quantified as
-- a macro-bearing ingredient, matching the Balanced Fried Egg precedent
-- from Task 9 where a trace fat is mentioned in method but not costed.)

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=231, families=99, steps=2001, recipe_ingredients=2781 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Cheese & Ham Omelette with Toast', 2, 1096, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Cheese & Ham Omelette with Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Cheese & Ham Omelette with Toast', 2, 1287, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Cheese & Ham Omelette with Toast');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Cheese & Ham Omelette with Toast', 2, 1584, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Cheese & Ham Omelette with Toast');
-- New recipe ids: Light=232, Moderate=233, Balanced=234

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 232, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=232 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 233, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=233 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 234, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=234 AND meal_id=1);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (232)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, 59, NULL, 3.00, 5, 150.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, 90, NULL, 18.00, 1, 18.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND ingredient_id=90 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, NULL, 64, 170.00, 1, 170.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND linked_recipe_id=64);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, NULL, 26, 240.00, 1, 240.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 232, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=232 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (233)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, 59, NULL, 4.00, 5, 200.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, 90, NULL, 25.00, 1, 25.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND ingredient_id=90 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, NULL, 64, 100.00, 1, 100.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND linked_recipe_id=64);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, NULL, 26, 320.00, 1, 320.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 233, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=233 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (234)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, 59, NULL, 5.00, 5, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, 90, NULL, 35.00, 1, 35.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND ingredient_id=90 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, NULL, 64, 130.00, 1, 130.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND linked_recipe_id=64);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, NULL, 26, 380.00, 1, 380.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND linked_recipe_id=26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, 50, NULL, 0.15, 3, 0.50, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 234, 5, NULL, 1.00, 17, 1.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=234 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2782-2799

-- recipe_steps: TWO linked steps per variant -- toast (linked_recipe_id=26)
-- and the Honey Ham fold-in (linked_recipe_id=64) -- each with a populated
-- alt_instruction. French-style soft-curd technique given a real endpoint
-- (10-second undisturbed sit, gentle push-from-edges, 1-2 min to glossy-set).
DELETE FROM recipe_steps WHERE recipe_id IN (232,233,234);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(232, 1, 'Toast the bread according to the linked recipe. Use 240g (4-5 slices @ 50g each).', 26, 'Toast 4-5 slices of store-bought bread (~50g each).'),
(232, 2, 'Whisk the eggs off the heat with a pinch of the salt and pepper until just combined.', NULL, NULL),
(232, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL),
(232, 4, 'Scatter the cheddar and 170g of the linked Honey Ham over one half.', 64, 'Scatter the cheddar and 170g of store-bought sliced ham over one half.'),
(232, 5, 'Fold the omelette in half, slide onto the toast, and serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(233, 1, 'Toast the bread according to the linked recipe. Use 320g (6-7 slices @ 50g each).', 26, 'Toast 6-7 slices of store-bought bread (~50g each).'),
(233, 2, 'Whisk the eggs off the heat with a pinch of the salt and pepper until just combined.', NULL, NULL),
(233, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL),
(233, 4, 'Scatter the cheddar and 100g of the linked Honey Ham over one half.', 64, 'Scatter the cheddar and 100g of store-bought sliced ham over one half.'),
(233, 5, 'Fold the omelette in half, slide onto the toast, and serve immediately.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(234, 1, 'Toast the bread according to the linked recipe. Use 380g (7-8 slices @ 50g each).', 26, 'Toast 7-8 slices of store-bought bread (~50g each).'),
(234, 2, 'Whisk the eggs off the heat with a pinch of the salt and pepper until just combined.', NULL, NULL),
(234, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL),
(234, 4, 'Scatter the cheddar and 130g of the linked Honey Ham over one half.', 64, 'Scatter the cheddar and 130g of store-bought sliced ham over one half.'),
(234, 5, 'Fold the omelette in half, slide onto the toast, and serve immediately.', NULL, NULL);

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Cheese & Ham Omelette with Toast'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Cheese & Ham Omelette with Toast');
-- New family id: 100

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 100, 232, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=100 AND recipe_id=232);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 100, 233, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=100 AND recipe_id=233);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 100, 234, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=100 AND recipe_id=234);

-- Step 5: Verify.
-- Linked-step coverage: linked_step_count=1 for BOTH linked_recipe_id=26 and
--   linked_recipe_id=64, on all three variants. Pass.
-- Family structure: 3 members, Light(232)/Moderate(233,is_default=1)/Balanced(234),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients + prorated Milk Bread [ratio/743g] +
-- prorated Honey Ham [ratio/2916g]):
--   Light:    P 37.12  C 53.70  F 20.53  kcal 548.1 (stored 1096, matches 2x)
--   Moderate: P 38.08  C 69.28  F 23.77  kcal 643.4 (stored 1287, matches 2x)
--   Balanced: P 47.71  C 82.55  F 30.13  kcal 792.2 (stored 1584, matches 2x)
-- Matches design. All reject conditions clear. Gaps 95.3 / 148.8, both >=80.

-- ==========================================================================
-- IDS FOR REFERENCE: family=100, Light=232, Moderate=233, Balanced=234
-- This completes Phase 2 (Breakfast: redesign + new families).
-- ==========================================================================

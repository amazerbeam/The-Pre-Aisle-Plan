-- Task 5: Design and insert the new Smoothie family
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction (in-range macros
-- proceed straight to SQL) -- all three variants cleared every reject
-- condition on first design.

-- Step 1: Resolve ingredients. Existing smoothie family confirmed live at
-- ids 4/5/6 "Peanut Butter Banana Smoothie" (banana + peanut butter + whey
-- protein isolate + milk, dual-tagged meal_id 1 Breakfast + 4 Snacks).
-- New family differentiates on both fruit (mixed berries) and protein lever
-- (Greek yogurt alone, no whey powder / peanut butter).
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%kefir%' OR LOWER(name) LIKE '%berries%' OR LOWER(name) LIKE '%berry%';
-- Result: "Mixed berries" (id 3) already exists, reused. Kefir: zero matches,
-- not used -- Low fat milk (id 2) used as the liquid base instead (no need
-- to introduce a new ingredient for one dish).

-- Step 2-3: Design -- "Mixed Berry & Greek Yogurt Smoothie", dual meal_id
-- (1=Breakfast, 4=Snacks) matching the existing smoothie family's precedent.
-- Ingredients (whole recipe, serves 2):
--                    Light             Moderate (default)   Balanced
-- Mixed berries (3)  250g              320g                  380g
-- Greek yogurt (49)  470g              500g                  600g
-- Low fat milk (2)   600ml             650ml                 800ml
-- Honey (4)          12g (2.4 tsp)     20g (4 tsp)            25g (5 tsp)
-- Chia seeds (162)   10g               15g                    20g
-- Walnuts (8)        20g               30g                    45g
-- Salt (5)           0.5g (pinch)      0.5g (pinch)           0.5g (pinch)

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=216, families=94, steps=1929, recipe_ingredients=2686 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Mixed Berry & Greek Yogurt Smoothie', 2, 915, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Mixed Berry & Greek Yogurt Smoothie');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Mixed Berry & Greek Yogurt Smoothie', 2, 1115, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Mixed Berry & Greek Yogurt Smoothie');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Mixed Berry & Greek Yogurt Smoothie', 2, 1422, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Mixed Berry & Greek Yogurt Smoothie');
-- New recipe ids: Light=217, Moderate=218, Balanced=219

-- recipe_meals: dual-tagged Breakfast(1) + Snacks(4), guarded, matching precedent
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 217, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=217 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 217, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=217 AND meal_id=4);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 218, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=218 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 218, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=218 AND meal_id=4);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 219, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=219 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 219, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=219 AND meal_id=4);

-- recipe_ingredients (guarded, x3 variants x7 rows). units: g=1 ml=2 tsp=3 pinch=17
-- Light (217)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 3, NULL, 250.00, 1, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 49, NULL, 470.00, 1, 470.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 2, NULL, 600.00, 2, 600.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 4, NULL, 2.40, 3, 12.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 162, NULL, 10.00, 1, 10.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=162 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 8, NULL, 20.00, 1, 20.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 217, 5, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=217 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (218)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 3, NULL, 320.00, 1, 320.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 49, NULL, 500.00, 1, 500.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 2, NULL, 650.00, 2, 650.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 4, NULL, 4.00, 3, 20.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 162, NULL, 15.00, 1, 15.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=162 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 8, NULL, 30.00, 1, 30.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 218, 5, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=218 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (219)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 3, NULL, 380.00, 1, 380.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=3 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 49, NULL, 600.00, 1, 600.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 2, NULL, 800.00, 2, 800.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 4, NULL, 5.00, 3, 25.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 162, NULL, 20.00, 1, 20.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=162 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 8, NULL, 45.00, 1, 45.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 219, 5, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=219 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2687-2707

-- recipe_steps (wipe-and-reinsert, identical 4-step blend method across variants)
DELETE FROM recipe_steps WHERE recipe_id IN (217,218,219);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(217, 1, 'Add the mixed berries, Greek yogurt, milk, honey, chia seeds, walnuts, and salt to a blender.'),
(217, 2, 'Blend on high until smooth and creamy, scraping down the sides if needed, about 1 minute.'),
(217, 3, 'Taste and adjust sweetness with a touch more honey if needed.'),
(217, 4, 'Pour into glasses and serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(218, 1, 'Add the mixed berries, Greek yogurt, milk, honey, chia seeds, walnuts, and salt to a blender.'),
(218, 2, 'Blend on high until smooth and creamy, scraping down the sides if needed, about 1 minute.'),
(218, 3, 'Taste and adjust sweetness with a touch more honey if needed.'),
(218, 4, 'Pour into glasses and serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(219, 1, 'Add the mixed berries, Greek yogurt, milk, honey, chia seeds, walnuts, and salt to a blender.'),
(219, 2, 'Blend on high until smooth and creamy, scraping down the sides if needed, about 1 minute.'),
(219, 3, 'Taste and adjust sweetness with a touch more honey if needed.'),
(219, 4, 'Pour into glasses and serve immediately.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Mixed Berry & Greek Yogurt Smoothie'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Mixed Berry & Greek Yogurt Smoothie');
-- New family id: 95

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 95, 217, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=95 AND recipe_id=217);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 95, 218, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=95 AND recipe_id=218);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 95, 219, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=95 AND recipe_id=219);

-- Step 5: Verify.
-- Family structure: 3 members, Light(217)/Moderate(218,is_default=1)/Balanced(219), display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 37.29  C 45.39  F 14.08  kcal 457.4 (stored 915, matches 2x)
--   Moderate: P 41.17  C 56.28  F 18.67  kcal 557.8 (stored 1115, matches 2x)
--   Balanced: P 50.56  C 69.21  F 25.76  kcal 710.9 (stored 1422, matches 2x)
-- Matches design. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=95, Light=217, Moderate=218, Balanced=219
-- ==========================================================================

-- Task 11: Design and insert the Cod family
-- MPP-4-recipe-variety-expansion, Phase 3
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- all three
-- variants cleared every hard reject condition (fat% is a soft miss on the
-- 25-35% target band at 22-24%, but only >35% is a hard reject).

-- Step 1: Confirm Cod id + dedup-check potatoes.
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE name = 'Cod';
-- Result: id=181, P18.00 C0.00 F1.00 (from Task 1).
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE LOWER(name) LIKE '%potato%';
-- Result: Sweet potato (15), Baby potatoes (52), Potatoes (69), Potato (121).
-- CONFIRMS the historical dupe flagged in homemade-first-and-ingredient-dedup.md:
-- "Potatoes" (69) and "Potato" (121) are identical rows (P2.00 C17.00 F0.10 both).
-- Not merged here -- that is a Task 20 dedup-sweep concern, not this task's job.
-- Used "Baby potatoes" (52) instead -- a genuinely distinct product (new
-- potatoes), sidestepping the duplicate entirely.

-- Step 2-3: Design -- "Baked Cod with Lemon, Herbs & New Potatoes", meal_id=3 (Dinner).
-- Zero prawns/shellfish anywhere in this recipe (hard brief constraint).
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Cod (181)            400g               500g                  600g
-- Baby potatoes (52)   550g               650g                  850g
-- Olive oil (22)       18g (1.3 tbsp)     25g (1.8 tbsp)         30g (2.15 tbsp)
-- Lemon (88)           15g (0.25)         20g (0.35)             25g (0.4)
-- Fresh Parsley (123)  5g                 5g                     5g
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=234, families=100, steps=2016, recipe_ingredients=2799 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Baked Cod with Lemon, Herbs & New Potatoes', 2, 917, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Baked Cod with Lemon, Herbs & New Potatoes');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Baked Cod with Lemon, Herbs & New Potatoes', 2, 1140, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Baked Cod with Lemon, Herbs & New Potatoes');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Baked Cod with Lemon, Herbs & New Potatoes', 2, 1422, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Baked Cod with Lemon, Herbs & New Potatoes');
-- New recipe ids: Light=235, Moderate=236, Balanced=237

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 235, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=235 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 236, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=236 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 237, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=237 AND meal_id=3);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 tbsp=4 piece=5 pinch=17
-- Light (235)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 181, NULL, 400.00, 1, 400.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=181 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 52, NULL, 550.00, 1, 550.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=52 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 22, NULL, 1.30, 4, 18.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 88, NULL, 0.25, 5, 15.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 123, NULL, 5.00, 1, 5.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=123 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 235, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=235 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (236)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 181, NULL, 500.00, 1, 500.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=181 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 52, NULL, 650.00, 1, 650.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=52 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 22, NULL, 1.80, 4, 25.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 88, NULL, 0.35, 5, 20.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 123, NULL, 5.00, 1, 5.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=123 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 236, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=236 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (237)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 181, NULL, 600.00, 1, 600.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=181 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 52, NULL, 850.00, 1, 850.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=52 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 22, NULL, 2.15, 4, 30.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 88, NULL, 0.40, 5, 25.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 123, NULL, 5.00, 1, 5.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=123 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 237, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=237 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2800-2820

-- recipe_steps (identical method across variants, quantities differ only in
-- ingredient amounts, not the steps themselves).
DELETE FROM recipe_steps WHERE recipe_id IN (235,236,237);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(235, 1, 'Preheat the oven to 200°C (400°F).'),
(235, 2, 'Halve or quarter the baby potatoes and toss with half the olive oil, salt, and pepper. Roast for 20 minutes.'),
(235, 3, 'Pat the cod fillets dry and season with salt and pepper. Nestle among the potatoes, drizzle with the remaining olive oil and a squeeze of lemon, and top with a few lemon slices.'),
(235, 4, 'Return to the oven and bake 12-15 minutes, until the cod flakes easily with a fork and reaches 63°C (145°F) internally.'),
(235, 5, 'Scatter with fresh parsley and serve with the remaining lemon wedges.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(236, 1, 'Preheat the oven to 200°C (400°F).'),
(236, 2, 'Halve or quarter the baby potatoes and toss with half the olive oil, salt, and pepper. Roast for 20 minutes.'),
(236, 3, 'Pat the cod fillets dry and season with salt and pepper. Nestle among the potatoes, drizzle with the remaining olive oil and a squeeze of lemon, and top with a few lemon slices.'),
(236, 4, 'Return to the oven and bake 12-15 minutes, until the cod flakes easily with a fork and reaches 63°C (145°F) internally.'),
(236, 5, 'Scatter with fresh parsley and serve with the remaining lemon wedges.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(237, 1, 'Preheat the oven to 200°C (400°F).'),
(237, 2, 'Halve or quarter the baby potatoes and toss with half the olive oil, salt, and pepper. Roast for 20 minutes.'),
(237, 3, 'Pat the cod fillets dry and season with salt and pepper. Nestle among the potatoes, drizzle with the remaining olive oil and a squeeze of lemon, and top with a few lemon slices.'),
(237, 4, 'Return to the oven and bake 12-15 minutes, until the cod flakes easily with a fork and reaches 63°C (145°F) internally.'),
(237, 5, 'Scatter with fresh parsley and serve with the remaining lemon wedges.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Baked Cod with Lemon, Herbs & New Potatoes'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Baked Cod with Lemon, Herbs & New Potatoes');
-- New family id: 101

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 101, 235, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=101 AND recipe_id=235);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 101, 236, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=101 AND recipe_id=236);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 101, 237, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=101 AND recipe_id=237);

-- Step 5: Verify.
-- Family structure: 3 members, Light(235)/Moderate(236,is_default=1)/Balanced(237),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 41.61  C 47.61  F 11.31  kcal 458.6 (stored 917,  matches 2x)
--   Moderate: P 51.64  C 56.34  F 15.36  kcal 570.2 (stored 1140, matches 2x)
--   Balanced: P 62.66  C 73.57  F 18.47  kcal 711.2 (stored 1422, matches 2x)
-- Matches design. All hard reject conditions clear (fat% 22-24% is a soft
-- miss on the target band, not a reject -- only >35% rejects).
-- Explicit shellfish check: zero matches for prawn/shrimp/shellfish/mussel/
-- crab/lobster/oyster/scallop/clam across all three recipe_ingredients sets. Pass.

-- ==========================================================================
-- IDS FOR REFERENCE: family=101, Light=235, Moderate=236, Balanced=237
-- FLAG FOR TASK 20: ingredients.id 69 "Potatoes" and 121 "Potato" are
-- duplicate rows (identical macros) -- merge during the dedup sweep.
-- ==========================================================================

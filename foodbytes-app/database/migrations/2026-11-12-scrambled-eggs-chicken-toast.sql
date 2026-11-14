-- 2026-11-12 — New family: Scrambled Eggs, Chicken & Toast (family 122, recipes 300/301/302)
-- Toast = homemade Milk Bread (recipe 26), linked. Idempotent: safe to re-run.
-- Per serving (homemade basis): Light 504 kcal / 38.5 g P | Moderate 611 / 42.3 | Balanced 723 / 50.6

-- 1. Recipes (calories = whole-recipe kcal)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 300, 'Scrambled Eggs, Chicken & Toast', 2, 1009, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 300);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 301, 'Scrambled Eggs, Chicken & Toast', 2, 1222, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 301);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 302, 'Scrambled Eggs, Chicken & Toast', 2, 1446, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 302);

-- 2. Meals (Breakfast)
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 300, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 300 AND meal_id = 1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 301, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 301 AND meal_id = 1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 302, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 302 AND meal_id = 1);

-- 3. Ingredients
-- units: 1 g, 3 tsp, 5 piece, 13 slice
-- ---- Light (300): 5 slices, 2 eggs, 140 g chicken, no butter
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, NULL, 26, 5, 13, 250, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> NULL AND linked_recipe_id <=> 26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 59, NULL, 2, 5, 100, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 59 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 11, NULL, 140, 1, 140, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 11 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 46, NULL, 1, 3, 2.3, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 46 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 66, NULL, 0.5, 3, 1.5, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 66 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 22, NULL, 1, 3, 5, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 22 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 5, NULL, 0.25, 3, 1.5, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 300, 50, NULL, 0.25, 3, 0.75, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 300 AND ingredient_id <=> 50 AND linked_recipe_id <=> NULL);

-- ---- Moderate (301): 6 slices, 3 eggs, 130 g chicken, 1 tsp butter
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, NULL, 26, 6, 13, 300, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> NULL AND linked_recipe_id <=> 26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 59, NULL, 3, 5, 150, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 59 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 11, NULL, 130, 1, 130, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 11 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 46, NULL, 1, 3, 2.3, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 46 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 66, NULL, 0.5, 3, 1.5, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 66 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 22, NULL, 1, 3, 5, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 22 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 53, NULL, 1, 3, 5, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 53 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 5, NULL, 0.25, 3, 1.5, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 301, 50, NULL, 0.25, 3, 0.75, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 301 AND ingredient_id <=> 50 AND linked_recipe_id <=> NULL);

-- ---- Balanced (302): 7 slices, 4 eggs, 150 g chicken, 1 tsp butter
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, NULL, 26, 7, 13, 350, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> NULL AND linked_recipe_id <=> 26);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 59, NULL, 4, 5, 200, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 59 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 11, NULL, 150, 1, 150, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 11 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 46, NULL, 1, 3, 2.3, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 46 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 66, NULL, 0.5, 3, 1.5, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 66 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 22, NULL, 1, 3, 5, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 22 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 53, NULL, 1, 3, 5, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 53 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 5, NULL, 0.25, 3, 1.5, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 302, 50, NULL, 0.25, 3, 0.75, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 302 AND ingredient_id <=> 50 AND linked_recipe_id <=> NULL);

-- 4. Steps (wipe + re-insert = idempotent)
DELETE FROM recipe_steps WHERE recipe_id IN (300, 301, 302);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(300, 1, 'Toast the bread according to the linked recipe. Use 5 slices @ 50g each (2-3 per person).', NULL, 26, 'Toast 5 slices of store-bought bread (~50g each).'),
(300, 2, 'Pat the chicken breast (140g) dry and cut into 1.5cm pieces. Toss with the smoked paprika, garlic granules, salt and half the pepper.', NULL, NULL, NULL),
(300, 3, 'Heat the olive oil in a non-stick pan over medium-high heat until it shimmers. Add the chicken in one layer and leave it untouched for 2 minutes until browned, then turn and cook 2-3 minutes more until no pink remains in the thickest piece. Move to a plate to rest.', NULL, NULL, NULL),
(300, 4, 'Turn the heat to low and let the pan cool for 30 seconds. Add the 2 beaten eggs and stir constantly with a spatula for 3-4 minutes until soft curds form, pulling the pan off the heat while they still look slightly wet.', 'The eggs keep cooking off the heat; stopping while they are glossy keeps them creamy.', NULL, NULL),
(300, 5, 'Fold the chicken and its resting juices through the eggs. Taste and adjust with the salt and remaining pepper, then pile onto the toast.', NULL, NULL, NULL),
(301, 1, 'Toast the bread according to the linked recipe. Use 6 slices @ 50g each (3 per person).', NULL, 26, 'Toast 6 slices of store-bought bread (~50g each).'),
(301, 2, 'Pat the chicken breast (130g) dry and cut into 1.5cm pieces. Toss with the smoked paprika, garlic granules, salt and half the pepper.', NULL, NULL, NULL),
(301, 3, 'Heat the olive oil in a non-stick pan over medium-high heat until it shimmers. Add the chicken in one layer and leave it untouched for 2 minutes until browned, then turn and cook 2-3 minutes more until no pink remains in the thickest piece. Move to a plate to rest.', NULL, NULL, NULL),
(301, 4, 'Turn the heat to low and add the butter. Once it foams, add the 3 beaten eggs and stir constantly with a spatula for 4-5 minutes until soft curds form, pulling the pan off the heat while they still look slightly wet.', 'The eggs keep cooking off the heat; stopping while they are glossy keeps them creamy.', NULL, NULL),
(301, 5, 'Fold the chicken and its resting juices through the eggs. Taste and adjust with the salt and remaining pepper, then pile onto the toast.', NULL, NULL, NULL),
(302, 1, 'Toast the bread according to the linked recipe. Use 7 slices @ 50g each (3-4 per person).', NULL, 26, 'Toast 7 slices of store-bought bread (~50g each).'),
(302, 2, 'Pat the chicken breast (150g) dry and cut into 1.5cm pieces. Toss with the smoked paprika, garlic granules, salt and half the pepper.', NULL, NULL, NULL),
(302, 3, 'Heat the olive oil in a non-stick pan over medium-high heat until it shimmers. Add the chicken in one layer and leave it untouched for 2 minutes until browned, then turn and cook 2-3 minutes more until no pink remains in the thickest piece. Move to a plate to rest.', NULL, NULL, NULL),
(302, 4, 'Turn the heat to low and add the butter. Once it foams, add the 4 beaten eggs and stir constantly with a spatula for 4-5 minutes until soft curds form, pulling the pan off the heat while they still look slightly wet.', 'The eggs keep cooking off the heat; stopping while they are glossy keeps them creamy.', NULL, NULL),
(302, 5, 'Fold the chicken and its resting juices through the eggs. Taste and adjust with the salt and remaining pepper, then pile onto the toast.', NULL, NULL, NULL);

-- 5. Extras (parent -> Milk Bread)
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) SELECT 300, 26, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 300 AND child_recipe_id = 26);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) SELECT 301, 26, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 301 AND child_recipe_id = 26);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) SELECT 302, 26, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 302 AND child_recipe_id = 26);

-- 6. Family
INSERT INTO recipe_families (id, family_name, description)
SELECT 122, 'Scrambled Eggs, Chicken & Toast', 'Soft scrambled eggs folded through smoked-paprika seared chicken, piled on homemade milk bread toast. A high-protein take on the classic.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 122);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 122, 300, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 300);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 122, 301, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 301);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 122, 302, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 302);

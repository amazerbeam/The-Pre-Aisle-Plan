-- =============================================
-- MIGRATION: Avocado Toast Variant Updates
-- Date: 2025-12-19
-- Description: Update Avocado Toast variants
--   Light: 2 slices (1/person), 150g avocado, 2 eggs (1/person), no cheese
--   Standard: 4 slices (2/person), 200g avocado, no eggs, 20g parmesan (vegetarian)
--   Full: 4 slices (2/person), 200g avocado, 4 eggs (2/person), 20g parmesan
-- =============================================

-- =============================================
-- STEP 1: Update Recipe Calories
-- =============================================
UPDATE recipes SET calories = 718 WHERE id = 53;  -- Light: ~359 cal/serving
UPDATE recipes SET calories = 949 WHERE id = 54;  -- Standard: ~475 cal/serving
UPDATE recipes SET calories = 1259 WHERE id = 55; -- Full: ~630 cal/serving

-- =============================================
-- STEP 2: Delete Old Ingredients
-- =============================================
DELETE FROM recipe_ingredients WHERE recipe_id IN (53, 54, 55);

-- =============================================
-- STEP 3: Insert New Ingredients
-- =============================================

-- Recipe 53: Avocado Toast (Light)
-- 2 slices bread (100g), 150g avocado, 8g butter, 2 eggs (100g)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(53, NULL, 26, 100, 1, 100.00, 1),         -- Milk Bread (linked), 2 slices @ 50g each (100g)
(53, 72, NULL, 150, 1, 150.00, 2),         -- Avocado, 150g (½ per person)
(53, 53, NULL, 8, 1, 8.00, 3),             -- Salted butter, 8g
(53, 59, NULL, 2, 5, 100.00, 4),           -- Eggs, 2 medium (100g) - 1 per person, fried
(53, 5, NULL, 0.25, 3, 1.50, 5),           -- Salt, pinch
(53, 50, NULL, 0.25, 3, 0.75, 6);          -- Black pepper, pinch

-- Recipe 54: Avocado Toast (Standard)
-- 4 slices bread (200g), 200g avocado, 15g butter, 20g parmesan, no eggs
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(54, NULL, 26, 200, 1, 200.00, 1),         -- Milk Bread (linked), 4 slices @ 50g each (200g)
(54, 72, NULL, 200, 1, 200.00, 2),         -- Avocado, 200g (1 per person)
(54, 53, NULL, 15, 1, 15.00, 3),           -- Salted butter, 15g
(54, 30, NULL, 20, 1, 20.00, 4),           -- Parmesan, 20g (10g per person)
(54, 5, NULL, 0.25, 3, 1.50, 5),           -- Salt, pinch
(54, 50, NULL, 0.25, 3, 0.75, 6);          -- Black pepper, pinch

-- Recipe 55: Avocado Toast (Full)
-- 4 slices bread (200g), 200g avocado, 20g butter, 4 eggs (200g), 20g parmesan
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(55, NULL, 26, 200, 1, 200.00, 1),         -- Milk Bread (linked), 4 slices @ 50g each (200g)
(55, 72, NULL, 200, 1, 200.00, 2),         -- Avocado, 200g (1 per person)
(55, 53, NULL, 20, 1, 20.00, 3),           -- Salted butter, 20g (extra for frying 4 eggs)
(55, 59, NULL, 4, 5, 200.00, 4),           -- Eggs, 4 medium (200g) - 2 per person, fried
(55, 30, NULL, 20, 1, 20.00, 5),           -- Parmesan, 20g (10g per person)
(55, 5, NULL, 0.25, 3, 1.50, 6),           -- Salt, pinch
(55, 50, NULL, 0.25, 3, 0.75, 7);          -- Black pepper, pinch

-- =============================================
-- STEP 4: Delete Old Steps
-- =============================================
DELETE FROM recipe_steps WHERE recipe_id IN (53, 54, 55);

-- =============================================
-- STEP 5: Insert New Steps
-- =============================================

-- Recipe 53: Avocado Toast (Light) - 1 slice per person with fried egg
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(53, 1, 'Toast the bread according to the linked recipe. Use 2 slices @ 50g each (1 per person).', 26, 'Toast 2 slices of store-bought bread (~50g each).'),
(53, 2, 'Halve avocado, remove pit, and scoop flesh into a bowl.', NULL, NULL),
(53, 3, 'Mash avocado with a fork. Season with salt and pepper.', NULL, NULL),
(53, 4, 'Fry 2 eggs in the butter (8g) until whites are set but yolks still runny.', NULL, NULL),
(53, 5, 'Spread mashed avocado evenly on toast (~75g per person).', NULL, NULL),
(53, 6, 'Top each slice with a fried egg.', NULL, NULL),
(53, 7, 'Serve immediately.', NULL, NULL);

-- Recipe 54: Avocado Toast (Standard) - vegetarian with parmesan
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(54, 1, 'Toast the bread according to the linked recipe. Use 4 slices @ 50g each (2 per person).', 26, 'Toast 4 slices of store-bought bread (~50g each).'),
(54, 2, 'Butter each slice of toast with the 15g butter.', NULL, NULL),
(54, 3, 'Halve avocados, remove pit, and scoop flesh into a bowl.', NULL, NULL),
(54, 4, 'Mash avocado with a fork. Season with salt and pepper.', NULL, NULL),
(54, 5, 'Spread mashed avocado evenly on buttered toast (~100g per person).', NULL, NULL),
(54, 6, 'Grate fresh parmesan over the top (10g per person).', NULL, NULL),
(54, 7, 'Serve immediately.', NULL, NULL);

-- Recipe 55: Avocado Toast (Full) - 4 eggs with parmesan
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(55, 1, 'Toast the bread according to the linked recipe. Use 4 slices @ 50g each (2 per person).', 26, 'Toast 4 slices of store-bought bread (~50g each).'),
(55, 2, 'Butter each slice of toast with half the butter (10g).', NULL, NULL),
(55, 3, 'Halve avocados, remove pit, and scoop flesh into a bowl.', NULL, NULL),
(55, 4, 'Mash avocado with a fork. Season with salt and pepper.', NULL, NULL),
(55, 5, 'Fry 4 eggs in remaining butter (10g) until whites are set but yolks still runny.', NULL, NULL),
(55, 6, 'Spread mashed avocado evenly on buttered toast (~100g per person).', NULL, NULL),
(55, 7, 'Top each slice with a fried egg (2 per person).', NULL, NULL),
(55, 8, 'Grate fresh parmesan over the top (10g per person).', NULL, NULL),
(55, 9, 'Serve immediately.', NULL, NULL);

-- =============================================
-- STEP 6: Update Recipe Family Description
-- =============================================
UPDATE recipe_families
SET description = 'Mashed avocado on buttered toast. Light: 1 slice with fried egg. Standard: vegetarian with parmesan. Full: 2 slices, 2 eggs per person, topped with parmesan.'
WHERE id = 16;

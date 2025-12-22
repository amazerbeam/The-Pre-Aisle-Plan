-- =============================================
-- LENTIL STEW CHORIZO UPDATE
-- Migration script for live database
-- Date: 2024-12-18
-- =============================================

-- 1. Add chorizo ingredient (ID 73)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
VALUES (73, 'chorizo', 'Chorizo', 1, 23.00, 1.50, 39.00, TRUE);

-- 2. Update recipe calorie totals
UPDATE recipes SET calories = 963 WHERE id = 30;   -- Light: ~481 cal/serving
UPDATE recipes SET calories = 1064 WHERE id = 31;  -- Standard: ~532 cal/serving
UPDATE recipes SET calories = 1177 WHERE id = 32;  -- Full: ~589 cal/serving

-- 3. Delete existing recipe ingredients for all three variants
DELETE FROM recipe_ingredients WHERE recipe_id IN (30, 31, 32);

-- 4. Insert updated Light ingredients (no chorizo, full base)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(30, 55, NULL, 400, 1, 400.00, 1),     -- Brown lentils (tinned), 400g
(30, 12, NULL, 1, 8, 150.00, 2),       -- Onion, 1 large (150g)
(30, 13, NULL, 3, 10, 9.00, 3),        -- Garlic, 3 cloves (9g)
(30, 56, NULL, 120, 1, 120.00, 4),     -- Carrot, 120g
(30, 33, NULL, 1, 15, 400.00, 5),      -- Tinned tomatoes, 1 tin (400g)
(30, 46, NULL, 1.5, 3, 4.50, 6),       -- Smoked paprika, 1.5 tsp
(30, 18, NULL, 1.5, 3, 4.50, 7),       -- Cumin, 1.5 tsp
(30, 58, NULL, 300, 2, 300.00, 8),     -- Vegetable stock, 300ml
(30, 57, NULL, 200, 1, 200.00, 9),     -- Pak choi, 200g
(30, 5, NULL, 0.75, 3, 4.50, 10),      -- Salt, 0.75 tsp
(30, 22, NULL, 1.5, 4, 21.00, 11);     -- Olive oil, 1.5 tbsp

-- 5. Insert updated Standard ingredients (50g chorizo, reduced oil)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(31, 73, NULL, 50, 1, 50.00, 1),       -- Chorizo, 50g
(31, 55, NULL, 400, 1, 400.00, 2),     -- Brown lentils (tinned), 400g
(31, 12, NULL, 1, 8, 150.00, 3),       -- Onion, 1 large (150g)
(31, 13, NULL, 3, 10, 9.00, 4),        -- Garlic, 3 cloves (9g)
(31, 56, NULL, 120, 1, 120.00, 5),     -- Carrot, 120g
(31, 33, NULL, 1, 15, 400.00, 6),      -- Tinned tomatoes, 1 tin (400g)
(31, 46, NULL, 1.5, 3, 4.50, 7),       -- Smoked paprika, 1.5 tsp
(31, 18, NULL, 1.5, 3, 4.50, 8),       -- Cumin, 1.5 tsp
(31, 58, NULL, 300, 2, 300.00, 9),     -- Vegetable stock, 300ml
(31, 57, NULL, 200, 1, 200.00, 10),    -- Pak choi, 200g
(31, 5, NULL, 0.75, 3, 4.50, 11),      -- Salt, 0.75 tsp
(31, 22, NULL, 0.5, 4, 7.00, 12);      -- Olive oil, 0.5 tbsp

-- 6. Insert updated Full ingredients (75g chorizo, reduced oil)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(32, 73, NULL, 75, 1, 75.00, 1),       -- Chorizo, 75g
(32, 55, NULL, 400, 1, 400.00, 2),     -- Brown lentils (tinned), 400g
(32, 12, NULL, 1, 8, 150.00, 3),       -- Onion, 1 large (150g)
(32, 13, NULL, 3, 10, 9.00, 4),        -- Garlic, 3 cloves (9g)
(32, 56, NULL, 120, 1, 120.00, 5),     -- Carrot, 120g
(32, 33, NULL, 1, 15, 400.00, 6),      -- Tinned tomatoes, 1 tin (400g)
(32, 46, NULL, 1.5, 3, 4.50, 7),       -- Smoked paprika, 1.5 tsp
(32, 18, NULL, 1.5, 3, 4.50, 8),       -- Cumin, 1.5 tsp
(32, 58, NULL, 300, 2, 300.00, 9),     -- Vegetable stock, 300ml
(32, 57, NULL, 200, 1, 200.00, 10),    -- Pak choi, 200g
(32, 5, NULL, 0.75, 3, 4.50, 11),      -- Salt, 0.75 tsp
(32, 22, NULL, 0.5, 4, 7.00, 12);      -- Olive oil, 0.5 tbsp

-- 7. Delete existing recipe steps for all three variants
DELETE FROM recipe_steps WHERE recipe_id IN (30, 31, 32);

-- 8. Insert updated Light steps (no chorizo)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(30, 1, 'Prep the vegetables: Dice the onion, mince the garlic, and dice the carrot into small cubes. Roughly chop the pak choi, keeping stems and leaves separate.'),
(30, 2, 'Heat olive oil in a large pot over medium heat. Add onion and cook 4-5 minutes until softened.'),
(30, 3, 'Add garlic, smoked paprika, and cumin. Stir for 30 seconds until fragrant.'),
(30, 4, 'Add the diced carrot. Cook 2-3 minutes, stirring occasionally.'),
(30, 5, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any bits from the bottom.'),
(30, 6, 'Drain and rinse the tinned lentils. Add to the pot.'),
(30, 7, 'Bring to a simmer. Cook uncovered for 15-20 minutes until the stew thickens and carrots are tender.'),
(30, 8, 'Add the pak choi stems first, cook 2 minutes. Then add the leaves and cook another 2 minutes until wilted.'),
(30, 9, 'Season with salt to taste. Serve in bowls.');

-- 9. Insert updated Standard steps (with chorizo)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(31, 1, 'Prep the vegetables: Dice the onion, mince the garlic, and dice the carrot into small cubes. Roughly chop the pak choi, keeping stems and leaves separate. Slice the chorizo into thin coins.'),
(31, 2, 'Heat a large pot over medium heat. Add the chorizo slices and fry for 2-3 minutes until crispy and the fat renders out. Remove chorizo and set aside, leaving the fat in the pot.'),
(31, 3, 'Add olive oil to the chorizo fat. Add onion and cook 4-5 minutes until softened.'),
(31, 4, 'Add garlic, smoked paprika, and cumin. Stir for 30 seconds until fragrant.'),
(31, 5, 'Add the diced carrot. Cook 2-3 minutes, stirring occasionally.'),
(31, 6, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any bits from the bottom.'),
(31, 7, 'Drain and rinse the tinned lentils. Add to the pot.'),
(31, 8, 'Bring to a simmer. Cook uncovered for 15-20 minutes until the stew thickens and carrots are tender.'),
(31, 9, 'Add the pak choi stems first, cook 2 minutes. Then add the leaves and cook another 2 minutes until wilted.'),
(31, 10, 'Season with salt to taste. Serve in bowls, topped with the crispy chorizo.');

-- 10. Insert updated Full steps (with chorizo)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(32, 1, 'Prep the vegetables: Dice the onion, mince the garlic, and dice the carrot into small cubes. Roughly chop the pak choi, keeping stems and leaves separate. Slice the chorizo into thin coins.'),
(32, 2, 'Heat a large pot over medium heat. Add the chorizo slices and fry for 2-3 minutes until crispy and the fat renders out. Remove chorizo and set aside, leaving the fat in the pot.'),
(32, 3, 'Add olive oil to the chorizo fat. Add onion and cook 4-5 minutes until softened.'),
(32, 4, 'Add garlic, smoked paprika, and cumin. Stir for 30 seconds until fragrant.'),
(32, 5, 'Add the diced carrot. Cook 2-3 minutes, stirring occasionally.'),
(32, 6, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any bits from the bottom.'),
(32, 7, 'Drain and rinse the tinned lentils. Add to the pot.'),
(32, 8, 'Bring to a simmer. Cook uncovered for 15-20 minutes until the stew thickens and carrots are tender.'),
(32, 9, 'Add the pak choi stems first, cook 2 minutes. Then add the leaves and cook another 2 minutes until wilted.'),
(32, 10, 'Season with salt to taste. Serve in bowls, topped with the crispy chorizo.');

-- 11. Update family description
UPDATE recipe_families
SET description = 'Hearty stew with brown lentils, tomatoes, carrots, and pak choi, spiced with smoked paprika and cumin. Standard and Full variants include crispy chorizo.'
WHERE id = 9;

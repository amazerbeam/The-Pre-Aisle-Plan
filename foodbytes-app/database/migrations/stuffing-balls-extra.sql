-- =============================================
-- STUFFING BALLS (EXTRA) - Christmas Recipe
-- Migration: Add to live database
-- =============================================

-- =============================================
-- NEW INGREDIENTS
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(77, 'pork_sausage_meat', 'Pork sausage meat', 1, 13.00, 2.00, 22.00, TRUE),
(78, 'italian_herbs', 'Italian herbs seasoning', 8, 9.00, 69.00, 4.00, TRUE),
(79, 'dried_thyme', 'Dried thyme', 8, 9.00, 64.00, 1.70, TRUE);

-- =============================================
-- STUFFING BALLS RECIPE
-- Total: ~2570 cal for 12 balls (~214 cal per ball)
-- Macros per ball: 9g protein, 19g carbs, 13g fat
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(56, 'Stuffing Balls', 12, 2570, FALSE, TRUE);

-- Assign to 'extras' meal type (meal_id = 5)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (56, 5);

-- =============================================
-- STUFFING BALLS INGREDIENTS
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- For the mash
(56, 69, NULL, 250, 1, 250.00, 1),      -- Potatoes, 250g raw (peeled)
(56, 53, NULL, 15, 1, 15.00, 2),        -- Salted butter (for mash), 15g
-- For the stuffing
(56, 63, NULL, 120, 1, 120.00, 3),      -- Breadcrumbs (for mixture), 120g
(56, 12, NULL, 1, 7, 110.00, 4),        -- Onion, 1 medium (110g)
(56, 53, NULL, 30, 1, 30.00, 5),        -- Salted butter (for stuffing), 30g
(56, 78, NULL, 1, 3, 2.00, 6),          -- Italian herbs seasoning, 1 tsp (2g)
(56, 79, NULL, 1, 3, 2.00, 7),          -- Dried thyme, 1 tsp (2g)
(56, 24, NULL, 60, 2, 60.00, 8),        -- Chicken stock, 60ml
(56, 5, NULL, 0.5, 3, 3.00, 9),         -- Salt, 0.5 tsp
(56, 50, NULL, 0.25, 3, 0.50, 10),      -- Black pepper, 0.25 tsp
-- For the balls
(56, 77, NULL, 450, 1, 450.00, 11),     -- Pork sausage meat, 1 lb (450g)
-- For coating
(56, 59, NULL, 2, 7, 100.00, 12),       -- Eggs, 2 medium (100g)
(56, 63, NULL, 100, 1, 100.00, 13);     -- Breadcrumbs (for coating), 100g

-- =============================================
-- STUFFING BALLS STEPS
-- =============================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(56, 1, 'Make the mash: Peel and chop potatoes into chunks. Boil in salted water 15-20 minutes until tender. Drain well.', NULL, NULL),
(56, 2, 'Mash with 15g butter until smooth. Season lightly. Spread on a plate and refrigerate until cold.', NULL, NULL),
(56, 3, 'Make the stuffing: Melt 30g butter in a pan over medium heat. Add diced onion and cook 6-7 minutes until soft and lightly golden.', NULL, NULL),
(56, 4, 'Add Italian herbs and thyme. Stir for 30 seconds until fragrant.', NULL, NULL),
(56, 5, 'Tip onion mixture into a bowl with 120g breadcrumbs. Pour over warm stock and mix well. Season with salt and pepper. Let cool completely.', NULL, NULL),
(56, 6, 'Form the balls: Combine sausage meat, cold mash (~200g), and cooled stuffing in a large bowl. Mix thoroughly with your hands until evenly combined.', NULL, NULL),
(56, 7, 'Roll into 12 balls, about golf-ball sized (~65g each). Chill 15 minutes to firm up.', NULL, NULL),
(56, 8, 'Coat the balls: Set up breading station - beaten eggs in one bowl, 100g breadcrumbs in another.', NULL, NULL),
(56, 9, 'Dip each ball in egg wash, then roll in breadcrumbs until fully coated.', NULL, NULL),
(56, 10, 'Bake at 190C for 25-30 minutes until golden and cooked through (internal temp 74C).', NULL, NULL);

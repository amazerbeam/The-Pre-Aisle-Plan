-- FoodBytes Seed Data
-- Version: 1.0.0 (New Recipe Database)

-- =============================================
-- LOOKUP TABLES
-- =============================================

-- Aisles (matching recipes.js AISLE structure)
INSERT INTO aisles (id, `key`, name, display_order) VALUES
(1, 'meat', 'Meat', 1),
(2, 'poultry', 'Poultry', 2),
(3, 'veg', 'Veg', 3),
(4, 'fruit', 'Fruit', 4),
(5, 'fish', 'Fish', 5),
(6, 'dairy', 'Dairy', 6),
(7, 'frozen', 'Frozen', 7),
(8, 'herbs_spices', 'Herbs & Spices', 8),
(9, 'oils', 'Oils & Fats', 9),
(10, 'tins_jars', 'Tins & Jars', 10),
(11, 'grains_pasta', 'Grains & Pasta', 11),
(12, 'condiments', 'Condiments & Sauces', 12),
(13, 'bakery', 'Bakery', 13),
(14, 'nuts', 'Nuts', 14),
(15, 'seeds', 'Seeds', 15),
(16, 'beverages', 'Beverages', 16),
(17, 'misc', 'Misc', 17);

-- Units
INSERT INTO units (id, `key`, value) VALUES
(1, 'g', 'g'),
(2, 'ml', 'ml'),
(3, 'tsp', 'tsp'),
(4, 'tbsp', 'tbsp'),
(5, 'piece', 'piece'),
(6, 'small', 'small'),
(7, 'medium', 'medium'),
(8, 'large', 'large'),
(9, 'handful', 'handful'),
(10, 'clove', 'clove'),
(11, 'head', 'head'),
(12, 'stalk', 'stalk'),
(13, 'slice', 'slice'),
(14, 'leaf', 'leaf'),
(15, 'tin', 'tin'),
(16, 'cup', 'cup'),
(17, 'pinch', 'pinch'),
(18, 'oz', 'oz');

-- Meals
-- FR-085: Added 'extras' meal type for sub-recipes (Pizza Dough, Pizza Sauce, Pesto, etc.)
INSERT INTO meals (id, `key`, name, display_order) VALUES
(1, 'breakfast', 'Breakfast', 1),
(2, 'lunch', 'Lunch', 2),
(3, 'dinner', 'Dinner', 3),
(4, 'snacks', 'Snacks', 4),
(5, 'extras', 'Extras', 5);

-- =============================================
-- INGREDIENTS (with aisle references and macros)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
-- Grains (aisle 11)
(1, 'rolled_oats', 'Rolled oats', 11, 13.00, 67.00, 7.00, TRUE),

-- Dairy (aisle 6)
(2, 'milk', 'Milk', 6, 3.40, 5.00, 3.60, TRUE),

-- Fruit (aisle 4)
(3, 'mixed_berries', 'Mixed berries', 4, 1.00, 12.00, 0.40, TRUE),

-- Condiments (aisle 12)
(4, 'honey', 'Honey', 12, 0.30, 82.00, 0.00, TRUE),

-- Herbs & Spices (aisle 8)
(5, 'salt', 'Salt', 8, 0.00, 0.00, 0.00, TRUE),

-- Nuts (aisle 14)
(6, 'peanut_butter', 'Peanut butter', 14, 25.00, 20.00, 50.00, TRUE),
(7, 'almonds', 'Almonds', 14, 21.00, 22.00, 49.00, TRUE),
(8, 'walnuts', 'Walnuts', 14, 15.00, 14.00, 65.00, TRUE),

-- Beverages (aisle 16)
(9, 'water', 'Water', 16, 0.00, 0.00, 0.00, TRUE),

-- Fruit (aisle 4)
(10, 'banana', 'Banana', 4, 1.10, 22.70, 0.30, TRUE),

-- Poultry (aisle 2)
(11, 'chicken_breast', 'Chicken breast', 2, 31.00, 0.00, 3.60, TRUE),

-- Vegetables (aisle 3)
(12, 'onion', 'Onion', 3, 1.10, 9.30, 0.10, TRUE),
(13, 'garlic', 'Garlic', 3, 6.40, 33.00, 0.50, TRUE),
(14, 'ginger', 'Ginger', 3, 1.80, 18.00, 0.80, TRUE),
(15, 'sweet_potato', 'Sweet potato', 3, 1.60, 20.00, 0.10, TRUE),

-- Frozen (aisle 7)
(16, 'frozen_peas', 'Frozen peas', 7, 5.40, 14.00, 0.40, TRUE),

-- Herbs & Spices (aisle 8)
(17, 'turmeric', 'Turmeric', 8, 8.00, 65.00, 10.00, TRUE),
(18, 'cumin', 'Cumin', 8, 18.00, 44.00, 22.00, TRUE),
(19, 'cinnamon', 'Cinnamon', 8, 4.00, 81.00, 1.20, TRUE),
(20, 'star_anise', 'Star anise', 8, 18.00, 50.00, 16.00, TRUE),
(21, 'msg', 'MSG', 8, 0.00, 0.00, 0.00, TRUE),

-- Oils (aisle 9)
(22, 'olive_oil', 'Olive oil', 9, 0.00, 0.00, 100.00, TRUE),

-- Tins & Jars (aisle 10)
(23, 'tomato_paste', 'Tomato paste', 10, 4.30, 19.00, 0.50, TRUE),
(24, 'chicken_stock', 'Chicken stock', 10, 0.50, 0.50, 0.10, TRUE),

-- Condiments (aisle 12)
(25, 'soy_sauce', 'Soy sauce', 12, 5.00, 5.00, 0.00, TRUE),

-- Grains (aisle 11)
(26, 'jasmine_rice', 'Jasmine rice', 11, 7.00, 79.00, 0.60, TRUE),
(27, 'cornflour', 'Cornflour', 11, 0.30, 91.00, 0.10, TRUE);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
-- Porridge with Berries & Nuts Family
(1, 'Porridge with Berries & Nuts (Light)', 2, 716, FALSE, TRUE),
(2, 'Porridge with Berries & Nuts', 2, 972, FALSE, TRUE),
(3, 'Porridge with Berries & Nuts (Full)', 2, 1236, FALSE, TRUE),

-- Peanut Butter Banana Smoothie Family
(4, 'Peanut Butter Banana Smoothie (Light)', 2, 849, FALSE, TRUE),
(5, 'Peanut Butter Banana Smoothie', 2, 1123, FALSE, TRUE),
(6, 'Peanut Butter Banana Smoothie (Full)', 2, 1404, FALSE, TRUE),

-- Irish Chicken Curry Family
(7, 'Irish Chicken Curry (Light)', 2, 1395, FALSE, TRUE),
(8, 'Irish Chicken Curry', 2, 1662, FALSE, TRUE),
(9, 'Irish Chicken Curry (Full)', 2, 2035, FALSE, TRUE);

-- =============================================
-- RECIPE MEALS
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(1, 1),  -- Light: Breakfast
(2, 1),  -- Standard: Breakfast
(3, 1),  -- Full: Breakfast

-- Peanut Butter Banana Smoothie: Breakfast & Snacks
(4, 1),  -- Light: Breakfast
(4, 4),  -- Light: Snacks
(5, 1),  -- Standard: Breakfast
(5, 4),  -- Standard: Snacks
(6, 1),  -- Full: Breakfast
(6, 4),  -- Full: Snacks

-- Irish Chicken Curry: Dinner
(7, 3),  -- Light: Dinner
(8, 3),  -- Standard: Dinner
(9, 3);  -- Full: Dinner

-- =============================================
-- RECIPE INGREDIENTS
-- =============================================

-- Recipe 1: Porridge with Berries & Nuts (Light) - ~716 cal total, ~358 cal/serving
-- FR-093: Added linked_recipe_id column (NULL for regular ingredients)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(1, 1, NULL, 60, 1, 60.00, 1),      -- Rolled oats, 60g
(1, 2, NULL, 250, 2, 258.00, 2),    -- Milk, 250ml
(1, 9, NULL, 150, 2, 150.00, 3),    -- Water, 150ml
(1, 3, NULL, 80, 1, 80.00, 4),      -- Mixed berries, 80g
(1, 4, NULL, 1, 3, 8.00, 5),        -- Honey, 1 tsp
(1, 5, NULL, 0.5, 3, 3.00, 6),      -- Salt, 0.5 tsp
(1, 6, NULL, 1, 4, 18.00, 7),       -- Peanut butter, 1 tbsp
(1, 7, NULL, 10, 1, 10.00, 8),      -- Almonds, 10g
(1, 8, NULL, 10, 1, 10.00, 9);      -- Walnuts, 10g

-- Recipe 2: Porridge with Berries & Nuts (Standard) - ~972 cal total, ~486 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(2, 1, NULL, 80, 1, 80.00, 1),      -- Rolled oats, 80g
(2, 2, NULL, 330, 2, 340.00, 2),    -- Milk, 330ml
(2, 9, NULL, 200, 2, 200.00, 3),    -- Water, 200ml
(2, 3, NULL, 105, 1, 105.00, 4),    -- Mixed berries, 105g
(2, 4, NULL, 1.5, 3, 12.00, 5),     -- Honey, 1.5 tsp
(2, 5, NULL, 0.5, 3, 3.00, 6),      -- Salt, 0.5 tsp
(2, 6, NULL, 1.5, 4, 27.00, 7),     -- Peanut butter, 1.5 tbsp
(2, 7, NULL, 13, 1, 13.00, 8),      -- Almonds, 13g
(2, 8, NULL, 13, 1, 13.00, 9);      -- Walnuts, 13g

-- Recipe 3: Porridge with Berries & Nuts (Full) - ~1236 cal total, ~618 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(3, 1, NULL, 100, 1, 100.00, 1),    -- Rolled oats, 100g
(3, 2, NULL, 415, 2, 427.00, 2),    -- Milk, 415ml
(3, 9, NULL, 250, 2, 250.00, 3),    -- Water, 250ml
(3, 3, NULL, 135, 1, 135.00, 4),    -- Mixed berries, 135g
(3, 4, NULL, 2, 3, 14.00, 5),       -- Honey, 2 tsp
(3, 5, NULL, 0.75, 3, 4.50, 6),     -- Salt, 0.75 tsp
(3, 6, NULL, 2, 4, 36.00, 7),       -- Peanut butter, 2 tbsp
(3, 7, NULL, 17, 1, 17.00, 8),      -- Almonds, 17g
(3, 8, NULL, 17, 1, 17.00, 9);      -- Walnuts, 17g

-- Recipe 4: Peanut Butter Banana Smoothie (Light) - ~860 cal total, ~430 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(4, 10, NULL, 300, 1, 300.00, 1),   -- Banana (frozen), 300g
(4, 2, NULL, 400, 2, 412.00, 2),    -- Milk, 400ml
(4, 6, NULL, 45, 1, 45.00, 3),      -- Peanut butter, 45g
(4, 5, NULL, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 5: Peanut Butter Banana Smoothie (Standard) - ~1080 cal total, ~540 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(5, 10, NULL, 400, 1, 400.00, 1),   -- Banana (frozen), 400g
(5, 2, NULL, 520, 2, 536.00, 2),    -- Milk, 520ml
(5, 6, NULL, 60, 1, 60.00, 3),      -- Peanut butter, 60g
(5, 5, NULL, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 6: Peanut Butter Banana Smoothie (Full) - ~1360 cal total, ~680 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(6, 10, NULL, 500, 1, 500.00, 1),   -- Banana (frozen), 500g
(6, 2, NULL, 650, 2, 670.00, 2),    -- Milk, 650ml
(6, 6, NULL, 75, 1, 75.00, 3),      -- Peanut butter, 75g
(6, 5, NULL, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 7: Irish Chicken Curry (Light) - ~960 cal total, ~480 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(7, 11, NULL, 240, 1, 240.00, 1),     -- Chicken breast, 240g (120g x 2)
(7, 22, NULL, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(7, 12, NULL, 1, 8, 150.00, 3),       -- Onion, 1 large
(7, 13, NULL, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(7, 14, NULL, 5, 1, 5.00, 5),         -- Ginger, 5g
(7, 10, NULL, 1, 7, 120.00, 6),       -- Banana, 1 medium
(7, 23, NULL, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(7, 25, NULL, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(7, 4, NULL, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(7, 24, NULL, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(7, 17, NULL, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(7, 18, NULL, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(7, 19, NULL, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(7, 20, NULL, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(7, 21, NULL, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(7, 5, NULL, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(7, 27, NULL, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(7, 15, NULL, 150, 1, 150.00, 18),    -- Sweet potato, 150g (75g x 2)
(7, 16, NULL, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(7, 26, NULL, 111, 1, 111.00, 20);    -- Jasmine rice (uncooked), 111g

-- Recipe 8: Irish Chicken Curry (Standard) - ~1240 cal total, ~620 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(8, 11, NULL, 300, 1, 300.00, 1),     -- Chicken breast, 300g (150g x 2)
(8, 22, NULL, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(8, 12, NULL, 1, 8, 150.00, 3),       -- Onion, 1 large
(8, 13, NULL, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(8, 14, NULL, 5, 1, 5.00, 5),         -- Ginger, 5g
(8, 10, NULL, 1, 7, 120.00, 6),       -- Banana, 1 medium
(8, 23, NULL, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(8, 25, NULL, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(8, 4, NULL, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(8, 24, NULL, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(8, 17, NULL, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(8, 18, NULL, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(8, 19, NULL, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(8, 20, NULL, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(8, 21, NULL, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(8, 5, NULL, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(8, 27, NULL, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(8, 15, NULL, 200, 1, 200.00, 18),    -- Sweet potato, 200g (100g x 2)
(8, 16, NULL, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(8, 26, NULL, 148, 1, 148.00, 20);    -- Jasmine rice (uncooked), 148g

-- Recipe 9: Irish Chicken Curry (Full) - ~1560 cal total, ~780 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(9, 11, NULL, 400, 1, 400.00, 1),     -- Chicken breast, 400g (200g x 2)
(9, 22, NULL, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(9, 12, NULL, 1, 8, 150.00, 3),       -- Onion, 1 large
(9, 13, NULL, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(9, 14, NULL, 5, 1, 5.00, 5),         -- Ginger, 5g
(9, 10, NULL, 1, 7, 120.00, 6),       -- Banana, 1 medium
(9, 23, NULL, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(9, 25, NULL, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(9, 4, NULL, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(9, 24, NULL, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(9, 17, NULL, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(9, 18, NULL, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(9, 19, NULL, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(9, 20, NULL, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(9, 21, NULL, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(9, 5, NULL, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(9, 27, NULL, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(9, 15, NULL, 300, 1, 300.00, 18),    -- Sweet potato, 300g (150g x 2)
(9, 16, NULL, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(9, 26, NULL, 185, 1, 185.00, 20);    -- Jasmine rice (uncooked), 185g

-- =============================================
-- RECIPE STEPS
-- =============================================

-- Recipe 1: Porridge with Berries & Nuts (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(1, 1, 'Set heat to 7/9. Bring milk, water, and salt to a boil in a saucepan.'),
(1, 2, 'Stir in rolled oats. Reduce heat to medium-low. Cook 4-5 minutes, stirring occasionally, until oats absorb liquid and reach desired consistency.'),
(1, 3, 'While oats cook, roughly chop almonds and walnuts. Give them a light pinch of salt.'),
(1, 4, 'Transfer porridge to bowls. Drizzle honey over hot oats, add peanut butter, then top with chopped nuts and berries.');

-- Recipe 2: Porridge with Berries & Nuts (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(2, 1, 'Set heat to 7/9. Bring milk, water, and salt to a boil in a saucepan.'),
(2, 2, 'Stir in rolled oats. Reduce heat to medium-low. Cook 4-5 minutes, stirring occasionally, until oats absorb liquid and reach desired consistency.'),
(2, 3, 'While oats cook, roughly chop almonds and walnuts. Give them a light pinch of salt.'),
(2, 4, 'Transfer porridge to bowls. Drizzle honey over hot oats, add peanut butter, then top with chopped nuts and berries.');

-- Recipe 3: Porridge with Berries & Nuts (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(3, 1, 'Set heat to 7/9. Bring milk, water, and salt to a boil in a saucepan.'),
(3, 2, 'Stir in rolled oats. Reduce heat to medium-low. Cook 4-5 minutes, stirring occasionally, until oats absorb liquid and reach desired consistency.'),
(3, 3, 'While oats cook, roughly chop almonds and walnuts. Give them a light pinch of salt.'),
(3, 4, 'Transfer porridge to bowls. Drizzle honey over hot oats, add peanut butter, then top with chopped nuts and berries.');

-- Recipe 4: Peanut Butter Banana Smoothie (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(4, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(4, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(4, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(4, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(4, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- Recipe 5: Peanut Butter Banana Smoothie (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(5, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(5, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(5, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(5, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(5, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- Recipe 6: Peanut Butter Banana Smoothie (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(6, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(6, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(6, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(6, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(6, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- Recipe 7: Irish Chicken Curry (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(7, 1, 'Brine the chicken: Dissolve 2 tbsp salt in 1 litre cold water. Submerge chicken breasts, refrigerate 20-30 minutes. Rinse and pat dry.'),
(7, 2, 'Roast sweet potatoes: Preheat oven to 200°C. Toss cubed sweet potato with a drizzle of olive oil and pinch of salt. Roast 25-30 minutes until golden.'),
(7, 3, 'Sear the chicken: Heat olive oil in a large pan over medium-high heat. Season brined chicken lightly. Sear 3-4 minutes per side until golden. Remove, slice into bite-sized pieces, set aside.'),
(7, 4, 'Build the base: In the same pan, sauté onion over medium heat until soft and translucent, 5-6 minutes. Add garlic and ginger, cook 1 minute until fragrant.'),
(7, 5, 'Add the banana: Break banana into chunks directly into the pan. Mash roughly with a wooden spoon — it will dissolve as it cooks.'),
(7, 6, 'Spices and paste: Add turmeric, cumin, cinnamon, and star anise. Stir 30 seconds. Add tomato paste, stir another minute.'),
(7, 7, 'Liquid: Pour in stock, soy sauce, honey, and MSG (if using). Bring to a simmer. Cook 10 minutes, stirring occasionally.'),
(7, 8, 'Blend: Remove star anise. Use an immersion blender to smooth the sauce for a velvety texture.'),
(7, 9, 'Thicken if needed: Mix cornflour with 2 tbsp cold water. Stir into curry and simmer 2-3 minutes until glossy.'),
(7, 10, 'Finish: Return sliced chicken to the sauce. Add frozen peas and roasted sweet potato. Simmer 3-4 minutes until heated through.'),
(7, 11, 'Taste and adjust: Add more salt, honey, or soy sauce as needed. Serve over rice.');

-- Recipe 8: Irish Chicken Curry (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(8, 1, 'Brine the chicken: Dissolve 2 tbsp salt in 1 litre cold water. Submerge chicken breasts, refrigerate 20-30 minutes. Rinse and pat dry.'),
(8, 2, 'Roast sweet potatoes: Preheat oven to 200°C. Toss cubed sweet potato with a drizzle of olive oil and pinch of salt. Roast 25-30 minutes until golden.'),
(8, 3, 'Sear the chicken: Heat olive oil in a large pan over medium-high heat. Season brined chicken lightly. Sear 3-4 minutes per side until golden. Remove, slice into bite-sized pieces, set aside.'),
(8, 4, 'Build the base: In the same pan, sauté onion over medium heat until soft and translucent, 5-6 minutes. Add garlic and ginger, cook 1 minute until fragrant.'),
(8, 5, 'Add the banana: Break banana into chunks directly into the pan. Mash roughly with a wooden spoon — it will dissolve as it cooks.'),
(8, 6, 'Spices and paste: Add turmeric, cumin, cinnamon, and star anise. Stir 30 seconds. Add tomato paste, stir another minute.'),
(8, 7, 'Liquid: Pour in stock, soy sauce, honey, and MSG (if using). Bring to a simmer. Cook 10 minutes, stirring occasionally.'),
(8, 8, 'Blend: Remove star anise. Use an immersion blender to smooth the sauce for a velvety texture.'),
(8, 9, 'Thicken if needed: Mix cornflour with 2 tbsp cold water. Stir into curry and simmer 2-3 minutes until glossy.'),
(8, 10, 'Finish: Return sliced chicken to the sauce. Add frozen peas and roasted sweet potato. Simmer 3-4 minutes until heated through.'),
(8, 11, 'Taste and adjust: Add more salt, honey, or soy sauce as needed. Serve over rice.');

-- Recipe 9: Irish Chicken Curry (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(9, 1, 'Brine the chicken: Dissolve 2 tbsp salt in 1 litre cold water. Submerge chicken breasts, refrigerate 20-30 minutes. Rinse and pat dry.'),
(9, 2, 'Roast sweet potatoes: Preheat oven to 200°C. Toss cubed sweet potato with a drizzle of olive oil and pinch of salt. Roast 25-30 minutes until golden.'),
(9, 3, 'Sear the chicken: Heat olive oil in a large pan over medium-high heat. Season brined chicken lightly. Sear 3-4 minutes per side until golden. Remove, slice into bite-sized pieces, set aside.'),
(9, 4, 'Build the base: In the same pan, sauté onion over medium heat until soft and translucent, 5-6 minutes. Add garlic and ginger, cook 1 minute until fragrant.'),
(9, 5, 'Add the banana: Break banana into chunks directly into the pan. Mash roughly with a wooden spoon — it will dissolve as it cooks.'),
(9, 6, 'Spices and paste: Add turmeric, cumin, cinnamon, and star anise. Stir 30 seconds. Add tomato paste, stir another minute.'),
(9, 7, 'Liquid: Pour in stock, soy sauce, honey, and MSG (if using). Bring to a simmer. Cook 10 minutes, stirring occasionally.'),
(9, 8, 'Blend: Remove star anise. Use an immersion blender to smooth the sauce for a velvety texture.'),
(9, 9, 'Thicken if needed: Mix cornflour with 2 tbsp cold water. Stir into curry and simmer 2-3 minutes until glossy.'),
(9, 10, 'Finish: Return sliced chicken to the sauce. Add frozen peas and roasted sweet potato. Simmer 3-4 minutes until heated through.'),
(9, 11, 'Taste and adjust: Add more salt, honey, or soy sauce as needed. Serve over rice.');

-- =============================================
-- RECIPE FAMILIES
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(1, 'Porridge with Berries & Nuts', 'Creamy oat porridge topped with honey, peanut butter, mixed berries, and chopped nuts'),
(2, 'Peanut Butter Banana Smoothie', 'Thick and creamy frozen banana smoothie with peanut butter and milk'),
(3, 'Irish Chicken Curry', 'Sweet and mild chicken curry with banana, warm spices, roasted sweet potato, and peas. Served over rice.');

-- Link recipes to family
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(1, 2, TRUE, 'Standard', 1),   -- Standard is default
(1, 1, FALSE, 'Light', 2),
(1, 3, FALSE, 'Full', 3),

-- Peanut Butter Banana Smoothie Family
(2, 5, TRUE, 'Standard', 1),   -- Standard is default
(2, 4, FALSE, 'Light', 2),
(2, 6, FALSE, 'Full', 3),

-- Irish Chicken Curry Family
(3, 8, TRUE, 'Standard', 1),   -- Standard is default
(3, 7, FALSE, 'Light', 2),
(3, 9, FALSE, 'Full', 3);

-- =============================================
-- PIZZA FAMILY (with Extras System)
-- =============================================

-- NEW INGREDIENTS
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
-- Nuts (aisle 14)
(28, 'pine_nuts', 'Pine nuts', 14, 13.70, 4.00, 68.00, TRUE),

-- Herbs (aisle 8)
(29, 'basil', 'Fresh basil', 8, 3.20, 1.30, 0.60, TRUE),
(34, 'bay_leaf', 'Bay leaf', 8, 7.60, 75.00, 8.40, TRUE),
(35, 'oregano', 'Dried oregano', 8, 9.00, 69.00, 4.30, TRUE),

-- Dairy (aisle 6)
(30, 'parmesan', 'Parmesan cheese', 6, 36.00, 4.00, 26.00, TRUE),
(37, 'mozzarella', 'Mozzarella', 6, 22.00, 2.00, 21.00, TRUE),

-- Grains (aisle 11)
(31, 'dry_yeast', 'Dry yeast', 11, 40.00, 41.00, 7.00, TRUE),
(32, 'bread_flour', 'Bread flour', 11, 12.00, 70.00, 1.50, TRUE),

-- Tins (aisle 10)
(33, 'tinned_tomatoes', 'Tinned tomatoes', 10, 1.00, 4.00, 0.10, TRUE),

-- Condiments (aisle 12)
(36, 'sugar', 'Sugar', 12, 0.00, 100.00, 0.00, TRUE),

-- =============================================
-- CHICKEN SATAY INGREDIENTS (IDs 38-42)
-- =============================================
-- Tins & Jars (aisle 10)
(38, 'coconut_milk', 'Coconut milk', 10, 2.00, 3.00, 21.00, TRUE),
-- Condiments (aisle 12)
(39, 'worcestershire_sauce', 'Worcestershire sauce', 12, 1.00, 23.00, 0.00, TRUE),
-- Fruit (aisle 4)
(40, 'lime_juice', 'Lime juice', 4, 0.40, 8.40, 0.10, TRUE),
-- Poultry (aisle 2)
(41, 'chicken_thigh', 'Chicken thigh (boneless)', 2, 26.00, 0.00, 10.00, TRUE),
-- Vegetables (aisle 3)
(42, 'red_bell_pepper', 'Red bell pepper', 3, 1.00, 6.00, 0.30, TRUE);

-- =============================================
-- EXTRAS RECIPES (must be created BEFORE parent)
-- =============================================

-- Recipe 10: Pesto (Extras) - ~895 cal total, makes ~165g
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(10, 'Pesto', 11, 895, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (10, 5);  -- 5 = extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(10, 28, NULL, 25, 1, 25.00, 1),     -- Pine nuts, 25g
(10, 29, NULL, 40, 1, 40.00, 2),     -- Fresh basil, 40g
(10, 30, NULL, 25, 1, 25.00, 3),     -- Parmesan, 25g
(10, 22, NULL, 75, 2, 68.00, 4),     -- Olive oil, 75ml (68g)
(10, 13, NULL, 1, 10, 3.00, 5),      -- Garlic, 1 clove (3g)
(10, 5, NULL, 0.25, 3, 1.50, 6);     -- Salt, 1/4 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(10, 1, 'Toast pine nuts in a dry pan over medium heat, shaking frequently, until lightly golden and fragrant (2-3 minutes). Watch carefully — they burn quickly. Set aside to cool.', NULL, NULL),
(10, 2, 'Add garlic and salt to a mortar. Pound to a smooth paste.', NULL, NULL),
(10, 3, 'Add toasted pine nuts. Crush until broken down but still slightly textured.', NULL, NULL),
(10, 4, 'Tear basil leaves into the mortar. Pound in batches, grinding in circular motions until leaves break down into the paste.', NULL, NULL),
(10, 5, 'Add parmesan cheese. Work into the mixture until combined.', NULL, NULL),
(10, 6, 'Slowly drizzle in olive oil while stirring with the pestle. Continue until you reach a loose, spoonable consistency.', NULL, NULL),
(10, 7, 'Taste and adjust salt. Transfer to a jar, top with a thin layer of olive oil to preserve. Refrigerate up to 1 week.', NULL, NULL);

-- Recipe 11: Pizza Dough (Extras) - ~2052 cal total, makes ~760g (4 portions)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(11, 'Pizza Dough', 4, 2052, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (11, 5);  -- 5 = extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(11, 31, NULL, 1, 3, 3.00, 1),       -- Dry yeast, 1 tsp (3g)
(11, 32, NULL, 450, 1, 450.00, 2),   -- Bread flour, 450g
(11, 22, NULL, 4, 4, 56.00, 3),      -- Olive oil, 4 tbsp (56g)
(11, 5, NULL, 2, 3, 12.00, 4),       -- Salt, 2 tsp
(11, 9, NULL, 240, 2, 240.00, 5);    -- Water, 240ml

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(11, 1, 'Warm the water to lukewarm (about 37°C — comfortable to touch). Sprinkle yeast over the surface and let bloom for 5 minutes until foamy.', NULL, NULL),
(11, 2, 'In a large bowl, combine bread flour and salt. Make a well in the center.', NULL, NULL),
(11, 3, 'Pour in the yeast mixture and olive oil. Stir with a wooden spoon until a shaggy dough forms.', NULL, NULL),
(11, 4, 'Turn out onto a floured surface. Knead for 8-10 minutes until smooth, elastic, and slightly tacky but not sticky. The dough should spring back when poked.', NULL, NULL),
(11, 5, 'Form into a ball. Place in a lightly oiled bowl, cover with a damp tea towel or cling film.', NULL, NULL),
(11, 6, 'Let rise in a warm spot for 1-2 hours until doubled in size.', NULL, NULL),
(11, 7, 'Punch down the dough to release air. Divide into 4 equal portions (~190g each).', NULL, NULL),
(11, 8, 'Use immediately, or wrap individual portions tightly in cling film and freeze for up to 3 months. Thaw overnight in fridge before use.', NULL, NULL);

-- Recipe 12: Pizza Sauce (Extras) - ~246 cal total, makes ~440g
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(12, 'Pizza Sauce', 7, 246, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (12, 5);  -- 5 = extras

-- Pizza Sauce ingredients - Pesto is linked as a recipe ingredient (FR-093)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(12, 33, NULL, 1, 15, 400.00, 1),    -- Tinned tomatoes, 1 tin (400g)
(12, 22, NULL, 1, 4, 14.00, 2),      -- Olive oil, 1 tbsp (14g)
(12, NULL, 10, 1, 4, 15.00, 3),      -- Pesto (linked recipe), 1 tbsp (15g) - FR-093
(12, 13, NULL, 2, 10, 6.00, 4),      -- Garlic, 2 cloves (6g)
(12, 34, NULL, 1, 14, 1.00, 5),      -- Bay leaf, 1 leaf
(12, 5, NULL, 1, 3, 6.00, 6),        -- Salt, 1 tsp
(12, 35, NULL, 1, 3, 2.00, 7),       -- Oregano, 1 tsp
(12, 36, NULL, 1, 3, 4.00, 8);       -- Sugar, 1 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(12, 1, 'Prepare the pesto according to the linked recipe — you will need 1 tbsp (15g).', 10, 'Have 1 tbsp store-bought pesto ready.'),
(12, 2, 'Heat olive oil in a saucepan over medium heat. Add garlic and cook for 30 seconds until fragrant but not browned.', NULL, NULL),
(12, 3, 'Crush the tinned tomatoes by hand or with a fork directly into the pan. Add all the liquid from the tin.', NULL, NULL),
(12, 4, 'Stir in the pesto, bay leaf, oregano, sugar, and salt.', NULL, NULL),
(12, 5, 'Bring to a gentle simmer. Cook uncovered for 10-12 minutes, stirring occasionally, until slightly thickened.', NULL, NULL),
(12, 6, 'Remove bay leaf. Taste and adjust seasoning — add more salt or sugar if needed.', NULL, NULL),
(12, 7, 'For a smoother sauce, blend briefly with an immersion blender. Store refrigerated for up to 5 days, or freeze for up to 3 months.', NULL, NULL);

-- Link Pizza Sauce to Pesto
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(12, 10, 0);  -- Pizza Sauce → Pesto

-- =============================================
-- PIZZA RECIPES (Dinner - 3 Variants)
-- =============================================

-- Recipe 13: Pizza (Light) - ~1148 cal total (2 servings, 574 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(13, 'Pizza (Light)', 2, 1148, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (13, 3);  -- 3 = dinner

-- FR-093: Pizza Light uses linked_recipe_id for dough and sauce
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(13, NULL, 11, 280, 1, 280.00, 1),   -- Pizza Dough (linked recipe), 280g (140g x 2)
(13, NULL, 12, 90, 1, 90.00, 2),     -- Pizza Sauce (linked recipe), 90g (45g x 2)
(13, 37, NULL, 120, 1, 120.00, 3);   -- Mozzarella (raw ingredient), 120g (60g x 2)

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(13, 1, 'Prepare the pizza dough according to the linked recipe. Use 140g dough per person.', 11, 'Remove 280g store-bought pizza dough from fridge 30 minutes before use.'),
(13, 2, 'Make the pizza sauce using the linked recipe. Use 45g sauce per pizza.', 12, 'Measure out 90g store-bought pizza sauce.'),
(13, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(13, 4, 'On a floured surface, stretch or roll your 140g dough portions to approximately 10 inches each, keeping edges slightly thicker for crust.', NULL, NULL),
(13, 5, 'Transfer dough to a sheet of baking paper. Work quickly from here — the dough will stick if left too long.', NULL, NULL),
(13, 6, 'Spread 45g sauce evenly over each base, leaving a 1-inch border for the crust.', NULL, NULL),
(13, 7, 'Tear 60g mozzarella per pizza into pieces and distribute evenly over the sauce.', NULL, NULL),
(13, 8, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(13, 9, 'Bake for 10-12 minutes until crust is golden and puffed, cheese is bubbling with golden spots.', NULL, NULL),
(13, 10, 'Remove from oven. Let rest 2 minutes before slicing.', NULL, NULL);

-- Recipe 14: Pizza (Standard) - ~1636 cal total (2 servings, 818 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(14, 'Pizza', 2, 1636, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (14, 3);  -- 3 = dinner

-- FR-093: Pizza Standard uses linked_recipe_id for dough and sauce
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(14, NULL, 11, 370, 1, 370.00, 1),   -- Pizza Dough (linked recipe), 370g (185g x 2)
(14, NULL, 12, 120, 1, 120.00, 2),   -- Pizza Sauce (linked recipe), 120g (60g x 2)
(14, 37, NULL, 200, 1, 200.00, 3);   -- Mozzarella (raw ingredient), 200g (100g x 2)

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(14, 1, 'Prepare the pizza dough according to the linked recipe. Use 185g dough per person.', 11, 'Remove 370g store-bought pizza dough from fridge 30 minutes before use.'),
(14, 2, 'Make the pizza sauce using the linked recipe. Use 60g sauce per pizza.', 12, 'Measure out 120g store-bought pizza sauce.'),
(14, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(14, 4, 'On a floured surface, stretch or roll your 185g dough portions to approximately 12 inches each, keeping edges slightly thicker for crust.', NULL, NULL),
(14, 5, 'Transfer dough to a sheet of baking paper. Work quickly from here — the dough will stick if left too long.', NULL, NULL),
(14, 6, 'Spread 60g sauce evenly over each base, leaving a 1-inch border for the crust.', NULL, NULL),
(14, 7, 'Tear 100g mozzarella per pizza into pieces and distribute evenly over the sauce.', NULL, NULL),
(14, 8, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(14, 9, 'Bake for 12-14 minutes until crust is golden and puffed, cheese is bubbling with golden spots.', NULL, NULL),
(14, 10, 'Remove from oven. Let rest 2 minutes before slicing.', NULL, NULL);

-- Recipe 15: Pizza (Full) - ~2124 cal total (2 servings, 1062 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(15, 'Pizza (Full)', 2, 2124, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (15, 3);  -- 3 = dinner

-- FR-093: Pizza Full uses linked_recipe_id for dough and sauce
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(15, NULL, 11, 460, 1, 460.00, 1),   -- Pizza Dough (linked recipe), 460g (230g x 2)
(15, NULL, 12, 150, 1, 150.00, 2),   -- Pizza Sauce (linked recipe), 150g (75g x 2)
(15, 37, NULL, 280, 1, 280.00, 3);   -- Mozzarella (raw ingredient), 280g (140g x 2)

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(15, 1, 'Prepare the pizza dough according to the linked recipe. Use 230g dough per person.', 11, 'Remove 460g store-bought pizza dough from fridge 30 minutes before use.'),
(15, 2, 'Make the pizza sauce using the linked recipe. Use 75g sauce per pizza.', 12, 'Measure out 150g store-bought pizza sauce.'),
(15, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(15, 4, 'On a floured surface, stretch or roll your 230g dough portions to approximately 14 inches each, keeping edges slightly thicker for crust.', NULL, NULL),
(15, 5, 'Transfer dough to a sheet of baking paper. Work quickly from here — the dough will stick if left too long.', NULL, NULL),
(15, 6, 'Spread 75g sauce evenly over each base, leaving a 1-inch border for the crust.', NULL, NULL),
(15, 7, 'Tear 140g mozzarella per pizza into pieces and distribute evenly over the sauce.', NULL, NULL),
(15, 8, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(15, 9, 'Bake for 12-14 minutes until crust is golden and puffed, cheese is bubbling with golden spots.', NULL, NULL),
(15, 10, 'Remove from oven. Let rest 2 minutes before slicing.', NULL, NULL);

-- Link Pizza recipes to their extras
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
-- Pizza (Light) links to Dough and Sauce
(13, 11, 0),  -- Pizza Light → Pizza Dough
(13, 12, 1),  -- Pizza Light → Pizza Sauce
-- Pizza (Standard) links to Dough and Sauce
(14, 11, 0),  -- Pizza Standard → Pizza Dough
(14, 12, 1),  -- Pizza Standard → Pizza Sauce
-- Pizza (Full) links to Dough and Sauce
(15, 11, 0),  -- Pizza Full → Pizza Dough
(15, 12, 1);  -- Pizza Full → Pizza Sauce

-- =============================================
-- PIZZA RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(4, 'Pizza', 'Classic homemade pizza with from-scratch dough and sauce. Scales from light to full portions.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(4, 14, TRUE, 'Standard', 1),   -- Standard is default
(4, 13, FALSE, 'Light', 2),
(4, 15, FALSE, 'Full', 3);

-- =============================================
-- CHICKEN SATAY FAMILY
-- =============================================

-- Recipe 16: Chicken Satay (Light) - ~1100 cal total, ~550 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(16, 'Chicken Satay (Light)', 2, 1100, FALSE, TRUE);

-- Recipe 17: Chicken Satay (Standard) - ~1460 cal total, ~730 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(17, 'Chicken Satay', 2, 1460, FALSE, TRUE);

-- Recipe 18: Chicken Satay (Full) - ~1900 cal total, ~950 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(18, 'Chicken Satay (Full)', 2, 1900, FALSE, TRUE);

-- =============================================
-- CHICKEN SATAY RECIPE MEALS (Dinner)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(16, 3),  -- Light: Dinner
(17, 3),  -- Standard: Dinner
(18, 3);  -- Full: Dinner

-- =============================================
-- CHICKEN SATAY RECIPE INGREDIENTS
-- =============================================

-- Recipe 16: Chicken Satay (Light) - ~1100 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Chicken & Marinade
(16, 41, NULL, 220, 1, 220.00, 1),      -- Chicken thigh, 220g
(16, 13, NULL, 2, 10, 6.00, 2),         -- Garlic, 2 cloves (6g)
(16, 14, NULL, 5, 1, 5.00, 3),          -- Ginger, 5g
(16, 25, NULL, 1, 4, 15.00, 4),         -- Soy sauce (marinade), 1 tbsp
(16, 4, NULL, 1, 3, 7.00, 5),           -- Honey (marinade), 1 tsp
(16, 22, NULL, 0.5, 4, 7.00, 6),        -- Olive oil, 0.5 tbsp
-- Vegetables (for skewers)
(16, 12, NULL, 80, 1, 80.00, 7),        -- Onion, 80g
(16, 42, NULL, 80, 1, 80.00, 8),        -- Red bell pepper, 80g
-- Peanut Sauce
(16, 6, NULL, 2, 4, 32.00, 9),          -- Peanut butter, 2 tbsp
(16, 38, NULL, 100, 2, 100.00, 10),     -- Coconut milk, 100ml
(16, 25, NULL, 1, 4, 15.00, 11),        -- Soy sauce (sauce), 1 tbsp
(16, 39, NULL, 0.5, 4, 9.00, 12),       -- Worcestershire, 0.5 tbsp
(16, 4, NULL, 1, 3, 7.00, 13),          -- Honey (sauce), 1 tsp
(16, 18, NULL, 0.25, 3, 0.75, 14),      -- Cumin, 0.25 tsp
(16, 40, NULL, 15, 2, 15.00, 15),       -- Lime juice, 15ml (0.5 lime)
(16, 27, NULL, 0.5, 3, 1.50, 16),       -- Cornflour, 0.5 tsp
-- Side
(16, 26, NULL, 56, 1, 56.00, 17),       -- Jasmine rice (uncooked), 56g
(16, 5, NULL, 0.5, 3, 3.00, 18);        -- Salt, 0.5 tsp

-- Recipe 17: Chicken Satay (Standard) - ~1460 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Chicken & Marinade
(17, 41, NULL, 280, 1, 280.00, 1),      -- Chicken thigh, 280g
(17, 13, NULL, 2, 10, 6.00, 2),         -- Garlic, 2 cloves (6g)
(17, 14, NULL, 5, 1, 5.00, 3),          -- Ginger, 5g
(17, 25, NULL, 1, 4, 15.00, 4),         -- Soy sauce (marinade), 1 tbsp
(17, 4, NULL, 1, 3, 7.00, 5),           -- Honey (marinade), 1 tsp
(17, 22, NULL, 1, 4, 14.00, 6),         -- Olive oil, 1 tbsp
-- Vegetables (for skewers)
(17, 12, NULL, 100, 1, 100.00, 7),      -- Onion, 100g
(17, 42, NULL, 100, 1, 100.00, 8),      -- Red bell pepper, 100g
-- Peanut Sauce
(17, 6, NULL, 2, 4, 32.00, 9),          -- Peanut butter, 2 tbsp
(17, 38, NULL, 100, 2, 100.00, 10),     -- Coconut milk, 100ml
(17, 25, NULL, 1, 4, 15.00, 11),        -- Soy sauce (sauce), 1 tbsp
(17, 39, NULL, 0.5, 4, 9.00, 12),       -- Worcestershire, 0.5 tbsp
(17, 4, NULL, 1, 3, 7.00, 13),          -- Honey (sauce), 1 tsp
(17, 18, NULL, 0.25, 3, 0.75, 14),      -- Cumin, 0.25 tsp
(17, 40, NULL, 15, 2, 15.00, 15),       -- Lime juice, 15ml (0.5 lime)
(17, 27, NULL, 0.5, 3, 1.50, 16),       -- Cornflour, 0.5 tsp
-- Side
(17, 26, NULL, 74, 1, 74.00, 17),       -- Jasmine rice (uncooked), 74g
(17, 5, NULL, 0.5, 3, 3.00, 18);        -- Salt, 0.5 tsp

-- Recipe 18: Chicken Satay (Full) - ~1900 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Chicken & Marinade
(18, 41, NULL, 360, 1, 360.00, 1),      -- Chicken thigh, 360g
(18, 13, NULL, 3, 10, 9.00, 2),         -- Garlic, 3 cloves (9g)
(18, 14, NULL, 8, 1, 8.00, 3),          -- Ginger, 8g
(18, 25, NULL, 1.5, 4, 22.00, 4),       -- Soy sauce (marinade), 1.5 tbsp
(18, 4, NULL, 1.5, 3, 10.00, 5),        -- Honey (marinade), 1.5 tsp
(18, 22, NULL, 1.5, 4, 21.00, 6),       -- Olive oil, 1.5 tbsp
-- Vegetables (for skewers)
(18, 12, NULL, 120, 1, 120.00, 7),      -- Onion, 120g
(18, 42, NULL, 120, 1, 120.00, 8),      -- Red bell pepper, 120g
-- Peanut Sauce
(18, 6, NULL, 2.5, 4, 40.00, 9),        -- Peanut butter, 2.5 tbsp
(18, 38, NULL, 130, 2, 130.00, 10),     -- Coconut milk, 130ml
(18, 25, NULL, 1.5, 4, 22.00, 11),      -- Soy sauce (sauce), 1.5 tbsp
(18, 39, NULL, 0.75, 4, 14.00, 12),     -- Worcestershire, 0.75 tbsp
(18, 4, NULL, 1.5, 3, 10.00, 13),       -- Honey (sauce), 1.5 tsp
(18, 18, NULL, 0.33, 3, 1.00, 14),      -- Cumin, 0.33 tsp
(18, 40, NULL, 22, 2, 22.00, 15),       -- Lime juice, 22ml (0.75 lime)
(18, 27, NULL, 0.75, 3, 2.25, 16),      -- Cornflour, 0.75 tsp
-- Side
(18, 26, NULL, 92, 1, 92.00, 17),       -- Jasmine rice (uncooked), 92g
(18, 5, NULL, 0.75, 3, 4.50, 18);       -- Salt, 0.75 tsp

-- =============================================
-- CHICKEN SATAY RECIPE STEPS
-- =============================================

-- Recipe 16: Chicken Satay (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(16, 1, 'Brine the chicken: Cut chicken thigh into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water. Submerge chicken, refrigerate 15-20 minutes. Rinse and pat dry.'),
(16, 2, 'Make the marinade: In a bowl, combine minced garlic, grated ginger, soy sauce, honey, and olive oil. Whisk until honey dissolves. Toss brined chicken in marinade. Set aside while you prep other ingredients.'),
(16, 3, 'Start the rice: Rinse jasmine rice under cold water until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.'),
(16, 4, 'Prep vegetables: Cut onion and red bell pepper into 1-inch chunks.'),
(16, 5, 'Make the peanut sauce: In a small saucepan over medium-low heat, combine coconut milk, peanut butter, soy sauce, Worcestershire, honey, and cumin. Whisk until smooth and peanut butter melts. Simmer 3-4 minutes.'),
(16, 6, 'Thicken the sauce: Mix cornflour with 1 tbsp cold water to make a slurry. Stir into the simmering sauce. Cook 1-2 minutes until glossy. Remove from heat, stir in lime juice. Taste and adjust.'),
(16, 7, 'Cook the vegetables: Heat a large pan or wok over medium-high heat with a drizzle of oil. Sauté onion and red pepper for 3-4 minutes until slightly charred but still crisp. Remove and set aside.'),
(16, 8, 'Cook the chicken: In the same pan over medium-high heat, cook marinated chicken pieces in a single layer. Don''t crowd the pan. Cook 3-4 minutes per side until golden and cooked through (74°C internal).'),
(16, 9, 'Combine: Return vegetables to the pan with the chicken. Toss briefly to combine.'),
(16, 10, 'Serve: Spoon chicken and vegetables over jasmine rice. Drizzle generously with peanut sauce.');

-- Recipe 17: Chicken Satay (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(17, 1, 'Brine the chicken: Cut chicken thigh into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water. Submerge chicken, refrigerate 15-20 minutes. Rinse and pat dry.'),
(17, 2, 'Make the marinade: In a bowl, combine minced garlic, grated ginger, soy sauce, honey, and olive oil. Whisk until honey dissolves. Toss brined chicken in marinade. Set aside while you prep other ingredients.'),
(17, 3, 'Start the rice: Rinse jasmine rice under cold water until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.'),
(17, 4, 'Prep vegetables: Cut onion and red bell pepper into 1-inch chunks.'),
(17, 5, 'Make the peanut sauce: In a small saucepan over medium-low heat, combine coconut milk, peanut butter, soy sauce, Worcestershire, honey, and cumin. Whisk until smooth and peanut butter melts. Simmer 3-4 minutes.'),
(17, 6, 'Thicken the sauce: Mix cornflour with 1 tbsp cold water to make a slurry. Stir into the simmering sauce. Cook 1-2 minutes until glossy. Remove from heat, stir in lime juice. Taste and adjust.'),
(17, 7, 'Cook the vegetables: Heat a large pan or wok over medium-high heat with a drizzle of oil. Sauté onion and red pepper for 3-4 minutes until slightly charred but still crisp. Remove and set aside.'),
(17, 8, 'Cook the chicken: In the same pan over medium-high heat, cook marinated chicken pieces in a single layer. Don''t crowd the pan. Cook 3-4 minutes per side until golden and cooked through (74°C internal).'),
(17, 9, 'Combine: Return vegetables to the pan with the chicken. Toss briefly to combine.'),
(17, 10, 'Serve: Spoon chicken and vegetables over jasmine rice. Drizzle generously with peanut sauce.');

-- Recipe 18: Chicken Satay (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(18, 1, 'Brine the chicken: Cut chicken thigh into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water. Submerge chicken, refrigerate 15-20 minutes. Rinse and pat dry.'),
(18, 2, 'Make the marinade: In a bowl, combine minced garlic, grated ginger, soy sauce, honey, and olive oil. Whisk until honey dissolves. Toss brined chicken in marinade. Set aside while you prep other ingredients.'),
(18, 3, 'Start the rice: Rinse jasmine rice under cold water until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.'),
(18, 4, 'Prep vegetables: Cut onion and red bell pepper into 1-inch chunks.'),
(18, 5, 'Make the peanut sauce: In a small saucepan over medium-low heat, combine coconut milk, peanut butter, soy sauce, Worcestershire, honey, and cumin. Whisk until smooth and peanut butter melts. Simmer 3-4 minutes.'),
(18, 6, 'Thicken the sauce: Mix cornflour with 1 tbsp cold water to make a slurry. Stir into the simmering sauce. Cook 1-2 minutes until glossy. Remove from heat, stir in lime juice. Taste and adjust.'),
(18, 7, 'Cook the vegetables: Heat a large pan or wok over medium-high heat with a drizzle of oil. Sauté onion and red pepper for 3-4 minutes until slightly charred but still crisp. Remove and set aside.'),
(18, 8, 'Cook the chicken: In the same pan over medium-high heat, cook marinated chicken pieces in a single layer. Don''t crowd the pan. Cook 3-4 minutes per side until golden and cooked through (74°C internal).'),
(18, 9, 'Combine: Return vegetables to the pan with the chicken. Toss briefly to combine.'),
(18, 10, 'Serve: Spoon chicken and vegetables over jasmine rice. Drizzle generously with peanut sauce.');

-- =============================================
-- CHICKEN SATAY RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(5, 'Chicken Satay', 'Thai-style grilled chicken skewers with onion and red pepper, served with a creamy peanut dipping sauce over jasmine rice.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(5, 17, TRUE, 'Standard', 1),   -- Standard is default
(5, 16, FALSE, 'Light', 2),
(5, 18, FALSE, 'Full', 3);

-- =============================================
-- BLACK BEAN CHICKEN WRAP INGREDIENTS (IDs 43-50)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
-- Grains (aisle 11)
(43, 'plain_flour', 'Plain flour', 11, 10.00, 76.00, 1.00, TRUE),
-- Dairy (aisle 6)
(44, 'unsalted_butter', 'Unsalted butter', 6, 0.90, 0.10, 81.00, TRUE),
(49, 'greek_yogurt', 'Greek yogurt', 6, 10.00, 3.60, 0.70, TRUE),
-- Tins & Jars (aisle 10)
(45, 'black_beans', 'Black beans (tinned)', 10, 8.90, 23.70, 0.50, TRUE),
-- Herbs & Spices (aisle 8)
(46, 'smoked_paprika', 'Smoked paprika', 8, 14.00, 54.00, 13.00, TRUE),
(50, 'black_pepper', 'Black pepper', 8, 10.00, 64.00, 3.30, TRUE),
-- Vegetables (aisle 3)
(47, 'lettuce', 'Lettuce', 3, 1.40, 2.90, 0.20, TRUE),
(48, 'tomato', 'Tomato', 3, 0.90, 3.90, 0.20, TRUE);

-- =============================================
-- FLATBREAD (Extra Recipe)
-- =============================================

-- Recipe 19: Flatbread - ~1368 cal total, makes ~486g (5-6 wraps)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(19, 'Flatbread', 5, 1368, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (19, 5);  -- 5 = extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(19, 43, NULL, 250, 1, 250.00, 1),    -- Plain flour, 250g (2 cups)
(19, 5, NULL, 1, 3, 6.00, 2),         -- Salt, 1 tsp
(19, 44, NULL, 50, 1, 50.00, 3),      -- Unsalted butter, 50g
(19, 2, NULL, 180, 2, 180.00, 4);     -- Milk, 180ml (3/4 cup)

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(19, 1, 'Combine flour and salt in a large bowl. Make a well in the center.', NULL, NULL),
(19, 2, 'Melt butter and add to milk. Pour into the flour well.', NULL, NULL),
(19, 3, 'Mix with a fork until a shaggy dough forms, then knead by hand for 3-4 minutes until smooth and elastic.', NULL, NULL),
(19, 4, 'Cover dough with a damp tea towel and rest for 15-20 minutes.', NULL, NULL),
(19, 5, 'Divide dough into 5-6 portions (~80-90g each). Roll each into a thin circle, about 8 inches diameter.', NULL, NULL),
(19, 6, 'Heat a dry pan or griddle over medium-high heat. Cook each flatbread for 1-2 minutes per side until golden spots appear and bread puffs slightly.', NULL, NULL),
(19, 7, 'Stack cooked flatbreads under a clean tea towel to keep warm and soft.', NULL, NULL);

-- =============================================
-- BLACK BEAN CHICKEN WRAP FAMILY
-- =============================================

-- Recipe 20: Black Bean Chicken Wrap (Light) - ~1313 cal total, ~656 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(20, 'Black Bean Chicken Wrap (Light)', 2, 1313, FALSE, TRUE);

-- Recipe 21: Black Bean Chicken Wrap (Standard) - ~1699 cal total, ~849 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(21, 'Black Bean Chicken Wrap', 2, 1699, FALSE, TRUE);

-- Recipe 22: Black Bean Chicken Wrap (Full) - ~2136 cal total, ~1068 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(22, 'Black Bean Chicken Wrap (Full)', 2, 2136, FALSE, TRUE);

-- =============================================
-- BLACK BEAN WRAP RECIPE MEALS (Lunch)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(20, 2),  -- Light: Lunch
(21, 2),  -- Standard: Lunch
(22, 2);  -- Full: Lunch

-- =============================================
-- BLACK BEAN WRAP RECIPE EXTRAS (link to Flatbread)
-- =============================================
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(20, 19, 0),  -- Light → Flatbread
(21, 19, 0),  -- Standard → Flatbread
(22, 19, 0);  -- Full → Flatbread

-- =============================================
-- BLACK BEAN WRAP RECIPE INGREDIENTS
-- =============================================

-- Recipe 20: Black Bean Chicken Wrap (Light) - ~1100 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Flatbread (linked recipe)
(20, NULL, 19, 140, 1, 140.00, 1),     -- Flatbread, 140g (70g x 2)
-- Chicken & seasoning
(20, 11, NULL, 200, 1, 200.00, 2),     -- Chicken breast, 200g
(20, 22, NULL, 1, 4, 14.00, 3),        -- Olive oil, 1 tbsp
(20, 46, NULL, 0.5, 3, 1.50, 4),       -- Smoked paprika, 0.5 tsp
(20, 18, NULL, 0.5, 3, 1.50, 5),       -- Cumin, 0.5 tsp
(20, 5, NULL, 0.5, 3, 3.00, 6),        -- Salt, 0.5 tsp
(20, 50, NULL, 0.25, 3, 0.75, 7),      -- Black pepper, 0.25 tsp
-- Black bean dip
(20, 45, NULL, 200, 1, 200.00, 8),     -- Black beans, 200g
(20, 40, NULL, 2, 4, 30.00, 9),        -- Lime juice, 2 tbsp
(20, 46, NULL, 0.5, 3, 1.50, 10),      -- Smoked paprika (dip), 0.5 tsp
(20, 18, NULL, 0.5, 3, 1.50, 11),      -- Cumin (dip), 0.5 tsp
-- Greek yogurt sauce
(20, 49, NULL, 60, 1, 60.00, 12),      -- Greek yogurt, 60g
(20, 13, NULL, 1, 10, 3.00, 13),       -- Garlic, 1 clove
(20, 40, NULL, 1, 4, 15.00, 14),       -- Lime juice (sauce), 1 tbsp
-- Rice & veg
(20, 26, NULL, 25, 1, 25.00, 15),      -- Jasmine rice (uncooked), 25g
(20, 47, NULL, 40, 1, 40.00, 16),      -- Lettuce, 40g
(20, 48, NULL, 60, 1, 60.00, 17),      -- Tomato, 60g
(20, 12, NULL, 40, 1, 40.00, 18);      -- Onion, 40g

-- Recipe 21: Black Bean Chicken Wrap (Standard) - ~1400 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Flatbread (linked recipe)
(21, NULL, 19, 180, 1, 180.00, 1),     -- Flatbread, 180g (90g x 2)
-- Chicken & seasoning
(21, 11, NULL, 260, 1, 260.00, 2),     -- Chicken breast, 260g
(21, 22, NULL, 1.5, 4, 21.00, 3),      -- Olive oil, 1.5 tbsp
(21, 46, NULL, 0.75, 3, 2.25, 4),      -- Smoked paprika, 0.75 tsp
(21, 18, NULL, 0.75, 3, 2.25, 5),      -- Cumin, 0.75 tsp
(21, 5, NULL, 0.5, 3, 3.00, 6),        -- Salt, 0.5 tsp
(21, 50, NULL, 0.25, 3, 0.75, 7),      -- Black pepper, 0.25 tsp
-- Black bean dip
(21, 45, NULL, 240, 1, 240.00, 8),     -- Black beans, 240g
(21, 40, NULL, 2, 4, 30.00, 9),        -- Lime juice, 2 tbsp
(21, 46, NULL, 0.5, 3, 1.50, 10),      -- Smoked paprika (dip), 0.5 tsp
(21, 18, NULL, 0.5, 3, 1.50, 11),      -- Cumin (dip), 0.5 tsp
-- Greek yogurt sauce
(21, 49, NULL, 80, 1, 80.00, 12),      -- Greek yogurt, 80g
(21, 13, NULL, 1, 10, 3.00, 13),       -- Garlic, 1 clove
(21, 40, NULL, 1, 4, 15.00, 14),       -- Lime juice (sauce), 1 tbsp
-- Rice & veg
(21, 26, NULL, 35, 1, 35.00, 15),      -- Jasmine rice (uncooked), 35g
(21, 47, NULL, 50, 1, 50.00, 16),      -- Lettuce, 50g
(21, 48, NULL, 80, 1, 80.00, 17),      -- Tomato, 80g
(21, 12, NULL, 50, 1, 50.00, 18);      -- Onion, 50g

-- Recipe 22: Black Bean Chicken Wrap (Full) - ~1700 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Flatbread (linked recipe)
(22, NULL, 19, 220, 1, 220.00, 1),     -- Flatbread, 220g (110g x 2)
-- Chicken & seasoning
(22, 11, NULL, 340, 1, 340.00, 2),     -- Chicken breast, 340g
(22, 22, NULL, 2, 4, 28.00, 3),        -- Olive oil, 2 tbsp
(22, 46, NULL, 1, 3, 3.00, 4),         -- Smoked paprika, 1 tsp
(22, 18, NULL, 1, 3, 3.00, 5),         -- Cumin, 1 tsp
(22, 5, NULL, 0.75, 3, 4.50, 6),       -- Salt, 0.75 tsp
(22, 50, NULL, 0.5, 3, 1.50, 7),       -- Black pepper, 0.5 tsp
-- Black bean dip
(22, 45, NULL, 280, 1, 280.00, 8),     -- Black beans, 280g
(22, 40, NULL, 2.5, 4, 37.00, 9),      -- Lime juice, 2.5 tbsp
(22, 46, NULL, 0.75, 3, 2.25, 10),     -- Smoked paprika (dip), 0.75 tsp
(22, 18, NULL, 0.75, 3, 2.25, 11),     -- Cumin (dip), 0.75 tsp
-- Greek yogurt sauce
(22, 49, NULL, 100, 1, 100.00, 12),    -- Greek yogurt, 100g
(22, 13, NULL, 2, 10, 6.00, 13),       -- Garlic, 2 cloves
(22, 40, NULL, 1.5, 4, 22.00, 14),     -- Lime juice (sauce), 1.5 tbsp
-- Rice & veg
(22, 26, NULL, 45, 1, 45.00, 15),      -- Jasmine rice (uncooked), 45g
(22, 47, NULL, 60, 1, 60.00, 16),      -- Lettuce, 60g
(22, 48, NULL, 100, 1, 100.00, 17),    -- Tomato, 100g
(22, 12, NULL, 60, 1, 60.00, 18);      -- Onion, 60g

-- =============================================
-- BLACK BEAN WRAP RECIPE STEPS
-- =============================================

-- Recipe 20: Black Bean Chicken Wrap (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(20, 1, 'Prepare the flatbread according to the linked recipe. Use 70g dough per wrap.', 19, 'Use 2 store-bought tortillas or wraps (about 70g each).'),
(20, 2, 'Cook the rice: Rinse jasmine rice until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.', NULL, NULL),
(20, 3, 'Season the chicken: Slice chicken breast into strips. Toss with olive oil, smoked paprika, cumin, salt, and black pepper until evenly coated.', NULL, NULL),
(20, 4, 'Grill the chicken: Heat a grill pan or skillet over medium-high heat. Cook chicken strips 3-4 minutes per side until charred and cooked through (74°C internal). Set aside to rest.', NULL, NULL),
(20, 5, 'Make the black bean dip: Drain and rinse black beans. Mash roughly with a fork, leaving some texture. Stir in lime juice, smoked paprika, and cumin. Season to taste.', NULL, NULL),
(20, 6, 'Make the yogurt sauce: Mince garlic finely. Mix Greek yogurt with garlic and lime juice. Season with a pinch of salt.', NULL, NULL),
(20, 7, 'Prep the veg: Shred lettuce, dice tomato, and thinly slice onion.', NULL, NULL),
(20, 8, 'Assemble wraps: Warm flatbreads briefly. Spread black bean dip down the center, add rice, sliced chicken, lettuce, tomato, and onion. Drizzle with yogurt sauce.', NULL, NULL),
(20, 9, 'Roll burrito-style: Fold bottom edge up over filling, fold sides in, then roll tightly from bottom to top. Cut in half diagonally to serve.', NULL, NULL);

-- Recipe 21: Black Bean Chicken Wrap (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(21, 1, 'Prepare the flatbread according to the linked recipe. Use 90g dough per wrap.', 19, 'Use 2 store-bought tortillas or wraps (about 90g each).'),
(21, 2, 'Cook the rice: Rinse jasmine rice until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.', NULL, NULL),
(21, 3, 'Season the chicken: Slice chicken breast into strips. Toss with olive oil, smoked paprika, cumin, salt, and black pepper until evenly coated.', NULL, NULL),
(21, 4, 'Grill the chicken: Heat a grill pan or skillet over medium-high heat. Cook chicken strips 3-4 minutes per side until charred and cooked through (74°C internal). Set aside to rest.', NULL, NULL),
(21, 5, 'Make the black bean dip: Drain and rinse black beans. Mash roughly with a fork, leaving some texture. Stir in lime juice, smoked paprika, and cumin. Season to taste.', NULL, NULL),
(21, 6, 'Make the yogurt sauce: Mince garlic finely. Mix Greek yogurt with garlic and lime juice. Season with a pinch of salt.', NULL, NULL),
(21, 7, 'Prep the veg: Shred lettuce, dice tomato, and thinly slice onion.', NULL, NULL),
(21, 8, 'Assemble wraps: Warm flatbreads briefly. Spread black bean dip down the center, add rice, sliced chicken, lettuce, tomato, and onion. Drizzle with yogurt sauce.', NULL, NULL),
(21, 9, 'Roll burrito-style: Fold bottom edge up over filling, fold sides in, then roll tightly from bottom to top. Cut in half diagonally to serve.', NULL, NULL);

-- Recipe 22: Black Bean Chicken Wrap (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(22, 1, 'Prepare the flatbread according to the linked recipe. Use 110g dough per wrap.', 19, 'Use 2 large store-bought tortillas or wraps (about 110g each).'),
(22, 2, 'Cook the rice: Rinse jasmine rice until water runs clear. Cook according to package directions with a pinch of salt. Keep warm.', NULL, NULL),
(22, 3, 'Season the chicken: Slice chicken breast into strips. Toss with olive oil, smoked paprika, cumin, salt, and black pepper until evenly coated.', NULL, NULL),
(22, 4, 'Grill the chicken: Heat a grill pan or skillet over medium-high heat. Cook chicken strips 3-4 minutes per side until charred and cooked through (74°C internal). Set aside to rest.', NULL, NULL),
(22, 5, 'Make the black bean dip: Drain and rinse black beans. Mash roughly with a fork, leaving some texture. Stir in lime juice, smoked paprika, and cumin. Season to taste.', NULL, NULL),
(22, 6, 'Make the yogurt sauce: Mince garlic finely. Mix Greek yogurt with garlic and lime juice. Season with a pinch of salt.', NULL, NULL),
(22, 7, 'Prep the veg: Shred lettuce, dice tomato, and thinly slice onion.', NULL, NULL),
(22, 8, 'Assemble wraps: Warm flatbreads briefly. Spread black bean dip down the center, add rice, sliced chicken, lettuce, tomato, and onion. Drizzle with yogurt sauce.', NULL, NULL),
(22, 9, 'Roll burrito-style: Fold bottom edge up over filling, fold sides in, then roll tightly from bottom to top. Cut in half diagonally to serve.', NULL, NULL);

-- =============================================
-- BLACK BEAN WRAP RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(6, 'Black Bean Chicken Wrap', 'Grilled spiced chicken with smoky black bean dip, Greek yogurt sauce, fresh veg, and rice wrapped in homemade flatbread.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(6, 21, TRUE, 'Standard', 1),   -- Standard is default
(6, 20, FALSE, 'Light', 2),
(6, 22, FALSE, 'Full', 3);

-- =============================================
-- CHICKEN & VEGETABLE SOUP INGREDIENTS (IDs 51-52)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(51, 'broccoli', 'Broccoli', 3, 2.80, 7.00, 0.40, TRUE),
(52, 'baby_potatoes', 'Baby potatoes', 3, 2.00, 17.00, 0.10, TRUE);

-- =============================================
-- CHICKEN & VEGETABLE SOUP FAMILY
-- =============================================

-- Recipe 23: Chicken & Vegetable Soup (Light) - ~868 cal total, ~434 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(23, 'Chicken & Vegetable Soup (Light)', 2, 868, FALSE, TRUE);

-- Recipe 24: Chicken & Vegetable Soup (Standard) - ~1135 cal total, ~567 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(24, 'Chicken & Vegetable Soup', 2, 1135, FALSE, TRUE);

-- Recipe 25: Chicken & Vegetable Soup (Full) - ~1398 cal total, ~699 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(25, 'Chicken & Vegetable Soup (Full)', 2, 1398, FALSE, TRUE);

-- =============================================
-- CHICKEN & VEGETABLE SOUP RECIPE MEALS (Lunch)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(23, 2),  -- Light: Lunch
(24, 2),  -- Standard: Lunch
(25, 2);  -- Full: Lunch

-- =============================================
-- CHICKEN & VEGETABLE SOUP RECIPE INGREDIENTS
-- =============================================

-- Recipe 23: Chicken & Vegetable Soup (Light) - ~900 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Soup base (fried, then blended)
(23, 12, NULL, 1, 7, 110.00, 1),       -- Onion, 1 medium (110g)
(23, 13, NULL, 2, 10, 6.00, 2),        -- Garlic, 2 cloves (6g)
(23, 42, NULL, 100, 1, 100.00, 3),     -- Red bell pepper, 100g
(23, 51, NULL, 120, 1, 120.00, 4),     -- Broccoli, 120g
(23, 44, NULL, 20, 1, 20.00, 5),       -- Unsalted butter, 20g
(23, 5, NULL, 0.5, 3, 3.00, 6),        -- Salt, 0.5 tsp
(23, 50, NULL, 0.25, 3, 0.75, 7),      -- Black pepper, 0.25 tsp
-- Stock and chicken (added after frying)
(23, 24, NULL, 500, 2, 500.00, 8),     -- Chicken stock, 500ml
(23, 11, NULL, 200, 1, 200.00, 9),     -- Chicken breast, 200g
-- Peas (added at end)
(23, 16, NULL, 80, 1, 80.00, 10),      -- Frozen peas, 80g
-- Roasted potato topping
(23, 52, NULL, 150, 1, 150.00, 11),    -- Baby potatoes, 150g
(23, 22, NULL, 0.5, 4, 7.00, 12);      -- Olive oil (for potatoes), 0.5 tbsp

-- Recipe 24: Chicken & Vegetable Soup (Standard) - ~1100 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Soup base (fried, then blended)
(24, 12, NULL, 1, 7, 110.00, 1),       -- Onion, 1 medium (110g)
(24, 13, NULL, 2, 10, 6.00, 2),        -- Garlic, 2 cloves (6g)
(24, 42, NULL, 120, 1, 120.00, 3),     -- Red bell pepper, 120g
(24, 51, NULL, 150, 1, 150.00, 4),     -- Broccoli, 150g
(24, 44, NULL, 25, 1, 25.00, 5),       -- Unsalted butter, 25g
(24, 5, NULL, 0.5, 3, 3.00, 6),        -- Salt, 0.5 tsp
(24, 50, NULL, 0.25, 3, 0.75, 7),      -- Black pepper, 0.25 tsp
-- Stock and chicken (added after frying)
(24, 24, NULL, 500, 2, 500.00, 8),     -- Chicken stock, 500ml
(24, 11, NULL, 260, 1, 260.00, 9),     -- Chicken breast, 260g
-- Peas (added at end)
(24, 16, NULL, 100, 1, 100.00, 10),    -- Frozen peas, 100g
-- Roasted potato topping
(24, 52, NULL, 200, 1, 200.00, 11),    -- Baby potatoes, 200g
(24, 22, NULL, 1, 4, 14.00, 12);       -- Olive oil (for potatoes), 1 tbsp

-- Recipe 25: Chicken & Vegetable Soup (Full) - ~1400 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Soup base (fried, then blended)
(25, 12, NULL, 1, 8, 150.00, 1),       -- Onion, 1 large (150g)
(25, 13, NULL, 3, 10, 9.00, 2),        -- Garlic, 3 cloves (9g)
(25, 42, NULL, 150, 1, 150.00, 3),     -- Red bell pepper, 150g
(25, 51, NULL, 180, 1, 180.00, 4),     -- Broccoli, 180g
(25, 44, NULL, 30, 1, 30.00, 5),       -- Unsalted butter, 30g
(25, 5, NULL, 0.75, 3, 4.50, 6),       -- Salt, 0.75 tsp
(25, 50, NULL, 0.5, 3, 1.50, 7),       -- Black pepper, 0.5 tsp
-- Stock and chicken (added after frying)
(25, 24, NULL, 500, 2, 500.00, 8),     -- Chicken stock, 500ml
(25, 11, NULL, 340, 1, 340.00, 9),     -- Chicken breast, 340g
-- Peas (added at end)
(25, 16, NULL, 120, 1, 120.00, 10),    -- Frozen peas, 120g
-- Roasted potato topping
(25, 52, NULL, 250, 1, 250.00, 11),    -- Baby potatoes, 250g
(25, 22, NULL, 1, 4, 14.00, 12);       -- Olive oil (for potatoes), 1 tbsp

-- =============================================
-- CHICKEN & VEGETABLE SOUP RECIPE STEPS
-- =============================================

-- Recipe 23: Chicken & Vegetable Soup (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(23, 1, 'Start the potatoes: Preheat oven to 200°C. Halve the baby potatoes, toss with olive oil and a pinch of salt. Spread on a baking tray and roast for 25-30 minutes until golden and crispy.'),
(23, 2, 'While potatoes roast, prep the soup base: Dice onion, mince garlic, roughly chop red bell pepper and broccoli.'),
(23, 3, 'Fry the vegetables: Melt butter in a large pot over medium heat. Add onion and garlic, cook 3-4 minutes until softened. Add red pepper and broccoli, season with salt and pepper. Cook 5-6 minutes, stirring occasionally.'),
(23, 4, 'Add stock: Pour in the chicken stock and bring to a simmer.'),
(23, 5, 'Poach the chicken: Add whole chicken breast to the pot. Simmer gently for 12-15 minutes until chicken is cooked through (74°C internal). Remove chicken and set aside.'),
(23, 6, 'Blend the soup: Use an immersion blender to blend the soup until smooth. Alternatively, transfer to a blender in batches.'),
(23, 7, 'Slice or shred the chicken. Return to the pot.'),
(23, 8, 'Add peas: Stir in frozen peas. Simmer for 3 minutes until peas are cooked but still bright green. Taste and adjust seasoning.'),
(23, 9, 'Serve: Ladle soup into bowls. Top with crispy roasted potatoes.');

-- Recipe 24: Chicken & Vegetable Soup (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(24, 1, 'Start the potatoes: Preheat oven to 200°C. Halve the baby potatoes, toss with olive oil and a pinch of salt. Spread on a baking tray and roast for 25-30 minutes until golden and crispy.'),
(24, 2, 'While potatoes roast, prep the soup base: Dice onion, mince garlic, roughly chop red bell pepper and broccoli.'),
(24, 3, 'Fry the vegetables: Melt butter in a large pot over medium heat. Add onion and garlic, cook 3-4 minutes until softened. Add red pepper and broccoli, season with salt and pepper. Cook 5-6 minutes, stirring occasionally.'),
(24, 4, 'Add stock: Pour in the chicken stock and bring to a simmer.'),
(24, 5, 'Poach the chicken: Add whole chicken breast to the pot. Simmer gently for 12-15 minutes until chicken is cooked through (74°C internal). Remove chicken and set aside.'),
(24, 6, 'Blend the soup: Use an immersion blender to blend the soup until smooth. Alternatively, transfer to a blender in batches.'),
(24, 7, 'Slice or shred the chicken. Return to the pot.'),
(24, 8, 'Add peas: Stir in frozen peas. Simmer for 3 minutes until peas are cooked but still bright green. Taste and adjust seasoning.'),
(24, 9, 'Serve: Ladle soup into bowls. Top with crispy roasted potatoes.');

-- Recipe 25: Chicken & Vegetable Soup (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(25, 1, 'Start the potatoes: Preheat oven to 200°C. Halve the baby potatoes, toss with olive oil and a pinch of salt. Spread on a baking tray and roast for 25-30 minutes until golden and crispy.'),
(25, 2, 'While potatoes roast, prep the soup base: Dice onion, mince garlic, roughly chop red bell pepper and broccoli.'),
(25, 3, 'Fry the vegetables: Melt butter in a large pot over medium heat. Add onion and garlic, cook 3-4 minutes until softened. Add red pepper and broccoli, season with salt and pepper. Cook 5-6 minutes, stirring occasionally.'),
(25, 4, 'Add stock: Pour in the chicken stock and bring to a simmer.'),
(25, 5, 'Poach the chicken: Add whole chicken breast to the pot. Simmer gently for 12-15 minutes until chicken is cooked through (74°C internal). Remove chicken and set aside.'),
(25, 6, 'Blend the soup: Use an immersion blender to blend the soup until smooth. Alternatively, transfer to a blender in batches.'),
(25, 7, 'Slice or shred the chicken. Return to the pot.'),
(25, 8, 'Add peas: Stir in frozen peas. Simmer for 3 minutes until peas are cooked but still bright green. Taste and adjust seasoning.'),
(25, 9, 'Serve: Ladle soup into bowls. Top with crispy roasted potatoes.');

-- =============================================
-- CHICKEN & VEGETABLE SOUP RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(7, 'Chicken & Vegetable Soup', 'Hearty blended soup with chunky chicken and peas, topped with crispy roasted baby potatoes.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(7, 24, TRUE, 'Standard', 1),   -- Standard is default
(7, 23, FALSE, 'Light', 2),
(7, 25, FALSE, 'Full', 3);

-- =============================================
-- MILK BREAD & SALMON SANDWICH INGREDIENTS (IDs 53-54)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(53, 'salted_butter', 'Salted butter', 6, 0.90, 0.10, 81.00, TRUE),
(54, 'tinned_salmon', 'Tinned salmon', 10, 20.50, 0.00, 8.00, TRUE);

-- =============================================
-- MILK BREAD (Extra Recipe)
-- =============================================

-- Recipe 26: Milk Bread - ~1770 cal total, makes ~743g (6-8 slices)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(26, 'Milk Bread', 6, 1770, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (26, 5);  -- 5 = extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(26, 32, NULL, 400, 1, 400.00, 1),     -- Bread flour, 400g
(26, 53, NULL, 20, 1, 20.00, 2),       -- Salted butter, 20g
(26, 36, NULL, 1, 4, 12.00, 3),        -- Sugar, 1 tbsp
(26, 5, NULL, 1.5, 3, 9.00, 4),        -- Salt, 1.5 tsp
(26, 2, NULL, 290, 2, 299.00, 5),      -- Milk, 290ml
(26, 31, NULL, 1, 3, 3.00, 6);         -- Dry yeast, 1 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(26, 1, 'Warm the milk to lukewarm (about 37C). Sprinkle yeast over the surface and let bloom for 5 minutes until foamy.', NULL, NULL),
(26, 2, 'In a large bowl, combine bread flour, sugar, and salt. Make a well in the center.', NULL, NULL),
(26, 3, 'Melt the butter and add to the yeast mixture. Pour into the flour well.', NULL, NULL),
(26, 4, 'Mix with a wooden spoon until a shaggy dough forms. Turn out onto a floured surface.', NULL, NULL),
(26, 5, 'Knead for 10-12 minutes until smooth, elastic, and slightly tacky. The dough should spring back when poked.', NULL, NULL),
(26, 6, 'Form into a ball. Place in a lightly oiled bowl, cover with a damp tea towel or cling film.', NULL, NULL),
(26, 7, 'Let rise in a warm spot for 1-1.5 hours until doubled in size.', NULL, NULL),
(26, 8, 'Punch down the dough. Shape into a loaf and place in a greased 9x5 inch loaf tin.', NULL, NULL),
(26, 9, 'Cover and let rise again for 30-45 minutes until dough rises above the tin edge.', NULL, NULL),
(26, 10, 'Preheat oven to 180C. Bake for 30-35 minutes until golden brown and sounds hollow when tapped.', NULL, NULL),
(26, 11, 'Remove from tin and cool on a wire rack before slicing.', NULL, NULL);

-- =============================================
-- SALMON SANDWICH FAMILY
-- =============================================

-- Recipe 27: Salmon Sandwich (Light) - ~650 cal total, ~325 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(27, 'Salmon Sandwich (Light)', 2, 650, FALSE, TRUE);

-- Recipe 28: Salmon Sandwich (Standard) - ~839 cal total, ~419 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(28, 'Salmon Sandwich', 2, 839, FALSE, TRUE);

-- Recipe 29: Salmon Sandwich (Full) - ~1020 cal total, ~510 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(29, 'Salmon Sandwich (Full)', 2, 1020, FALSE, TRUE);

-- =============================================
-- SALMON SANDWICH RECIPE MEALS (Lunch)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(27, 2),  -- Light: Lunch
(28, 2),  -- Standard: Lunch
(29, 2);  -- Full: Lunch

-- =============================================
-- SALMON SANDWICH RECIPE EXTRAS (link to Milk Bread)
-- =============================================
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(27, 26, 0),  -- Light -> Milk Bread
(28, 26, 0),  -- Standard -> Milk Bread
(29, 26, 0);  -- Full -> Milk Bread

-- =============================================
-- SALMON SANDWICH RECIPE INGREDIENTS
-- =============================================

-- Recipe 27: Salmon Sandwich (Light) - ~620 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(27, NULL, 26, 120, 1, 120.00, 1),     -- Milk Bread (linked), 120g (4 slices)
(27, 54, NULL, 160, 1, 160.00, 2),     -- Tinned salmon, 160g
(27, 53, NULL, 15, 1, 15.00, 3),       -- Salted butter, 15g
(27, 47, NULL, 40, 1, 40.00, 4);       -- Lettuce, 40g

-- Recipe 28: Salmon Sandwich (Standard) - ~780 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(28, NULL, 26, 150, 1, 150.00, 1),     -- Milk Bread (linked), 150g (4 slices)
(28, 54, NULL, 213, 1, 213.00, 2),     -- Tinned salmon, 213g (1 large tin)
(28, 53, NULL, 20, 1, 20.00, 3),       -- Salted butter, 20g
(28, 47, NULL, 40, 1, 40.00, 4);       -- Lettuce, 40g

-- Recipe 29: Salmon Sandwich (Full) - ~940 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(29, NULL, 26, 180, 1, 180.00, 1),     -- Milk Bread (linked), 180g (4 slices)
(29, 54, NULL, 260, 1, 260.00, 2),     -- Tinned salmon, 260g
(29, 53, NULL, 25, 1, 25.00, 3),       -- Salted butter, 25g
(29, 47, NULL, 40, 1, 40.00, 4);       -- Lettuce, 40g

-- =============================================
-- SALMON SANDWICH RECIPE STEPS
-- =============================================

-- Recipe 27: Salmon Sandwich (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(27, 1, 'Prepare the milk bread according to the linked recipe. Slice into pieces (~30g each).', 26, 'Use 4 slices of store-bought bread (~30g each).'),
(27, 2, 'Drain the tinned salmon. Tip into a bowl and mash with a fork. Check carefully for any bones and remove.', NULL, NULL),
(27, 3, 'Butter each slice of bread.', NULL, NULL),
(27, 4, 'Wash and dry the lettuce leaves.', NULL, NULL),
(27, 5, 'Assemble: Place lettuce on 2 slices of buttered bread. Divide the mashed salmon between them. Top with remaining bread slices.', NULL, NULL),
(27, 6, 'Cut in half and serve.', NULL, NULL);

-- Recipe 28: Salmon Sandwich (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(28, 1, 'Prepare the milk bread according to the linked recipe. Slice into pieces (~37g each).', 26, 'Use 4 slices of store-bought bread (~37g each).'),
(28, 2, 'Drain the tinned salmon. Tip into a bowl and mash with a fork. Check carefully for any bones and remove.', NULL, NULL),
(28, 3, 'Butter each slice of bread.', NULL, NULL),
(28, 4, 'Wash and dry the lettuce leaves.', NULL, NULL),
(28, 5, 'Assemble: Place lettuce on 2 slices of buttered bread. Divide the mashed salmon between them. Top with remaining bread slices.', NULL, NULL),
(28, 6, 'Cut in half and serve.', NULL, NULL);

-- Recipe 29: Salmon Sandwich (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(29, 1, 'Prepare the milk bread according to the linked recipe. Slice into pieces (~45g each).', 26, 'Use 4 slices of store-bought bread (~45g each).'),
(29, 2, 'Drain the tinned salmon. Tip into a bowl and mash with a fork. Check carefully for any bones and remove.', NULL, NULL),
(29, 3, 'Butter each slice of bread.', NULL, NULL),
(29, 4, 'Wash and dry the lettuce leaves.', NULL, NULL),
(29, 5, 'Assemble: Place lettuce on 2 slices of buttered bread. Divide the mashed salmon between them. Top with remaining bread slices.', NULL, NULL),
(29, 6, 'Cut in half and serve.', NULL, NULL);

-- =============================================
-- SALMON SANDWICH RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(8, 'Salmon Sandwich', 'Simple salmon sandwich with homemade milk bread, salted butter, and fresh lettuce.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(8, 28, TRUE, 'Standard', 1),   -- Standard is default
(8, 27, FALSE, 'Light', 2),
(8, 29, FALSE, 'Full', 3);

-- =============================================
-- LENTIL STEW INGREDIENTS (IDs 55-58)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(55, 'brown_lentils_tinned', 'Brown lentils (tinned)', 10, 9.00, 20.00, 0.40, TRUE),
(56, 'carrot', 'Carrot', 3, 0.90, 10.00, 0.20, TRUE),
(57, 'pak_choi', 'Pak choi', 3, 1.50, 2.20, 0.20, TRUE),
(58, 'vegetable_stock', 'Vegetable stock', 10, 0.30, 0.40, 0.00, TRUE);

-- =============================================
-- LENTIL STEW FAMILY
-- =============================================

-- Recipe 30: Lentil Stew (Light) - ~708 cal total, ~354 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(30, 'Lentil Stew (Light)', 2, 708, FALSE, TRUE);

-- Recipe 31: Lentil Stew (Standard) - ~852 cal total, ~426 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(31, 'Lentil Stew', 2, 852, FALSE, TRUE);

-- Recipe 32: Lentil Stew (Full) - ~963 cal total, ~481 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(32, 'Lentil Stew (Full)', 2, 963, FALSE, TRUE);

-- =============================================
-- LENTIL STEW RECIPE MEALS (Lunch)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(30, 2),  -- Light: Lunch
(31, 2),  -- Standard: Lunch
(32, 2);  -- Full: Lunch

-- =============================================
-- LENTIL STEW RECIPE INGREDIENTS
-- =============================================

-- Recipe 30: Lentil Stew (Light) - ~900 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(30, 55, NULL, 300, 1, 300.00, 1),     -- Brown lentils (tinned), 300g
(30, 12, NULL, 1, 7, 110.00, 2),       -- Onion, 1 medium (110g)
(30, 13, NULL, 2, 10, 6.00, 3),        -- Garlic, 2 cloves (6g)
(30, 56, NULL, 80, 1, 80.00, 4),       -- Carrot, 80g
(30, 33, NULL, 1, 15, 400.00, 5),      -- Tinned tomatoes, 1 tin (400g)
(30, 46, NULL, 1, 3, 3.00, 6),         -- Smoked paprika, 1 tsp
(30, 18, NULL, 1, 3, 3.00, 7),         -- Cumin, 1 tsp
(30, 58, NULL, 200, 2, 200.00, 8),     -- Vegetable stock, 200ml
(30, 57, NULL, 100, 1, 100.00, 9),     -- Pak choi, 100g
(30, 5, NULL, 0.5, 3, 3.00, 10),       -- Salt, 0.5 tsp
(30, 22, NULL, 1, 4, 14.00, 11);       -- Olive oil, 1 tbsp

-- Recipe 31: Lentil Stew (Standard) - ~1100 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(31, 55, NULL, 400, 1, 400.00, 1),     -- Brown lentils (tinned), 400g (1 tin)
(31, 12, NULL, 1, 7, 110.00, 2),       -- Onion, 1 medium (110g)
(31, 13, NULL, 3, 10, 9.00, 3),        -- Garlic, 3 cloves (9g)
(31, 56, NULL, 100, 1, 100.00, 4),     -- Carrot, 100g
(31, 33, NULL, 1, 15, 400.00, 5),      -- Tinned tomatoes, 1 tin (400g)
(31, 46, NULL, 1, 3, 3.00, 6),         -- Smoked paprika, 1 tsp
(31, 18, NULL, 1, 3, 3.00, 7),         -- Cumin, 1 tsp
(31, 58, NULL, 250, 2, 250.00, 8),     -- Vegetable stock, 250ml
(31, 57, NULL, 150, 1, 150.00, 9),     -- Pak choi, 150g
(31, 5, NULL, 0.5, 3, 3.00, 10),       -- Salt, 0.5 tsp
(31, 22, NULL, 1, 4, 14.00, 11);       -- Olive oil, 1 tbsp

-- Recipe 32: Lentil Stew (Full) - ~1300 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(32, 55, NULL, 400, 1, 400.00, 1),     -- Brown lentils (tinned), 400g (1 tin)
(32, 12, NULL, 1, 8, 150.00, 2),       -- Onion, 1 large (150g)
(32, 13, NULL, 3, 10, 9.00, 3),        -- Garlic, 3 cloves (9g)
(32, 56, NULL, 120, 1, 120.00, 4),     -- Carrot, 120g
(32, 33, NULL, 1, 15, 400.00, 5),      -- Tinned tomatoes, 1 tin (400g)
(32, 46, NULL, 1.5, 3, 4.50, 6),       -- Smoked paprika, 1.5 tsp
(32, 18, NULL, 1.5, 3, 4.50, 7),       -- Cumin, 1.5 tsp
(32, 58, NULL, 300, 2, 300.00, 8),     -- Vegetable stock, 300ml
(32, 57, NULL, 200, 1, 200.00, 9),     -- Pak choi, 200g
(32, 5, NULL, 0.75, 3, 4.50, 10),      -- Salt, 0.75 tsp
(32, 22, NULL, 1.5, 4, 21.00, 11);     -- Olive oil, 1.5 tbsp

-- =============================================
-- LENTIL STEW RECIPE STEPS
-- =============================================

-- Recipe 30: Lentil Stew (Light)
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

-- Recipe 31: Lentil Stew (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(31, 1, 'Prep the vegetables: Dice the onion, mince the garlic, and dice the carrot into small cubes. Roughly chop the pak choi, keeping stems and leaves separate.'),
(31, 2, 'Heat olive oil in a large pot over medium heat. Add onion and cook 4-5 minutes until softened.'),
(31, 3, 'Add garlic, smoked paprika, and cumin. Stir for 30 seconds until fragrant.'),
(31, 4, 'Add the diced carrot. Cook 2-3 minutes, stirring occasionally.'),
(31, 5, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any bits from the bottom.'),
(31, 6, 'Drain and rinse the tinned lentils. Add to the pot.'),
(31, 7, 'Bring to a simmer. Cook uncovered for 15-20 minutes until the stew thickens and carrots are tender.'),
(31, 8, 'Add the pak choi stems first, cook 2 minutes. Then add the leaves and cook another 2 minutes until wilted.'),
(31, 9, 'Season with salt to taste. Serve in bowls.');

-- Recipe 32: Lentil Stew (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(32, 1, 'Prep the vegetables: Dice the onion, mince the garlic, and dice the carrot into small cubes. Roughly chop the pak choi, keeping stems and leaves separate.'),
(32, 2, 'Heat olive oil in a large pot over medium heat. Add onion and cook 4-5 minutes until softened.'),
(32, 3, 'Add garlic, smoked paprika, and cumin. Stir for 30 seconds until fragrant.'),
(32, 4, 'Add the diced carrot. Cook 2-3 minutes, stirring occasionally.'),
(32, 5, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any bits from the bottom.'),
(32, 6, 'Drain and rinse the tinned lentils. Add to the pot.'),
(32, 7, 'Bring to a simmer. Cook uncovered for 15-20 minutes until the stew thickens and carrots are tender.'),
(32, 8, 'Add the pak choi stems first, cook 2 minutes. Then add the leaves and cook another 2 minutes until wilted.'),
(32, 9, 'Season with salt to taste. Serve in bowls.');

-- =============================================
-- LENTIL STEW RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(9, 'Lentil Stew', 'Hearty vegetarian stew with brown lentils, tomatoes, carrots, and pak choi, spiced with smoked paprika and cumin.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(9, 31, TRUE, 'Standard', 1),   -- Standard is default
(9, 30, FALSE, 'Light', 2),
(9, 32, FALSE, 'Full', 3);

-- =============================================
-- LENTIL STUFFED PEPPERS FAMILY
-- =============================================

-- Recipe 33: Lentil Stuffed Peppers (Light) - ~782 cal total, ~391 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(33, 'Lentil Stuffed Peppers (Light)', 2, 782, FALSE, TRUE);

-- Recipe 34: Lentil Stuffed Peppers (Standard) - ~969 cal total, ~484 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(34, 'Lentil Stuffed Peppers', 2, 969, FALSE, TRUE);

-- Recipe 35: Lentil Stuffed Peppers (Full) - ~1217 cal total, ~608 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(35, 'Lentil Stuffed Peppers (Full)', 2, 1217, FALSE, TRUE);

-- =============================================
-- LENTIL STUFFED PEPPERS RECIPE MEALS (Lunch)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(33, 2),  -- Light: Lunch
(34, 2),  -- Standard: Lunch
(35, 2);  -- Full: Lunch

-- =============================================
-- LENTIL STUFFED PEPPERS RECIPE INGREDIENTS
-- =============================================

-- Recipe 33: Lentil Stuffed Peppers (Light) - ~700 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(33, 42, NULL, 3, 7, 450.00, 1),       -- Red bell peppers, 3 medium (450g)
(33, 55, NULL, 300, 1, 300.00, 2),     -- Brown lentils (tinned), 300g
(33, 33, NULL, 300, 1, 300.00, 3),     -- Tinned tomatoes, 300g
(33, 23, NULL, 1, 4, 15.00, 4),        -- Tomato paste, 1 tbsp
(33, 12, NULL, 1, 7, 110.00, 5),       -- Onion, 1 medium (110g)
(33, 13, NULL, 2, 10, 6.00, 6),        -- Garlic, 2 cloves (6g)
(33, 22, NULL, 1, 4, 14.00, 7),        -- Olive oil, 1 tbsp
(33, 36, NULL, 1, 3, 4.00, 8),         -- Sugar, 1 tsp
(33, 35, NULL, 1, 3, 2.00, 9),         -- Oregano, 1 tsp
(33, 5, NULL, 0.5, 3, 3.00, 10),       -- Salt, 0.5 tsp
(33, 50, NULL, 0.25, 3, 0.75, 11);     -- Black pepper, 0.25 tsp

-- Recipe 34: Lentil Stuffed Peppers (Standard) - ~800 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(34, 42, NULL, 4, 7, 600.00, 1),       -- Red bell peppers, 4 medium (600g)
(34, 55, NULL, 400, 1, 400.00, 2),     -- Brown lentils (tinned), 400g (1 tin)
(34, 33, NULL, 1, 15, 400.00, 3),      -- Tinned tomatoes, 1 tin (400g)
(34, 23, NULL, 1, 4, 15.00, 4),        -- Tomato paste, 1 tbsp
(34, 12, NULL, 1, 7, 110.00, 5),       -- Onion, 1 medium (110g)
(34, 13, NULL, 2, 10, 6.00, 6),        -- Garlic, 2 cloves (6g)
(34, 22, NULL, 1, 4, 14.00, 7),        -- Olive oil, 1 tbsp
(34, 36, NULL, 1, 3, 4.00, 8),         -- Sugar, 1 tsp
(34, 35, NULL, 1, 3, 2.00, 9),         -- Oregano, 1 tsp
(34, 5, NULL, 0.5, 3, 3.00, 10),       -- Salt, 0.5 tsp
(34, 50, NULL, 0.25, 3, 0.75, 11);     -- Black pepper, 0.25 tsp

-- Recipe 35: Lentil Stuffed Peppers (Full) - ~1040 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(35, 42, NULL, 4, 8, 700.00, 1),       -- Red bell peppers, 4 large (700g)
(35, 55, NULL, 500, 1, 500.00, 2),     -- Brown lentils (tinned), 500g
(35, 33, NULL, 1, 15, 400.00, 3),      -- Tinned tomatoes, 1 tin (400g)
(35, 23, NULL, 1.5, 4, 22.00, 4),      -- Tomato paste, 1.5 tbsp
(35, 12, NULL, 1, 8, 150.00, 5),       -- Onion, 1 large (150g)
(35, 13, NULL, 3, 10, 9.00, 6),        -- Garlic, 3 cloves (9g)
(35, 22, NULL, 1.5, 4, 21.00, 7),      -- Olive oil, 1.5 tbsp
(35, 36, NULL, 1, 3, 4.00, 8),         -- Sugar, 1 tsp
(35, 35, NULL, 1.5, 3, 3.00, 9),       -- Oregano, 1.5 tsp
(35, 5, NULL, 0.75, 3, 4.50, 10),      -- Salt, 0.75 tsp
(35, 50, NULL, 0.5, 3, 1.50, 11);      -- Black pepper, 0.5 tsp

-- =============================================
-- LENTIL STUFFED PEPPERS RECIPE STEPS
-- =============================================

-- Recipe 33: Lentil Stuffed Peppers (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(33, 1, 'Preheat oven to 190C.'),
(33, 2, 'Halve the peppers lengthways, remove seeds and white membrane. Place cut-side up on a baking tray.'),
(33, 3, 'Heat olive oil in a pan over medium heat. Add diced onion and cook 4-5 minutes until softened.'),
(33, 4, 'Add minced garlic, cook 30 seconds until fragrant.'),
(33, 5, 'Add tinned tomatoes, tomato paste, sugar, and oregano. Stir to combine.'),
(33, 6, 'Drain and rinse the tinned lentils. Add to the pan.'),
(33, 7, 'Simmer for 10-15 minutes until the sauce thickens. Season with salt and pepper.'),
(33, 8, 'Spoon the lentil bolognese filling into the pepper halves, packing it in generously.'),
(33, 9, 'Bake for 25-30 minutes until peppers are soft and slightly charred at the edges.'),
(33, 10, 'Serve hot.');

-- Recipe 34: Lentil Stuffed Peppers (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(34, 1, 'Preheat oven to 190C.'),
(34, 2, 'Halve the peppers lengthways, remove seeds and white membrane. Place cut-side up on a baking tray.'),
(34, 3, 'Heat olive oil in a pan over medium heat. Add diced onion and cook 4-5 minutes until softened.'),
(34, 4, 'Add minced garlic, cook 30 seconds until fragrant.'),
(34, 5, 'Add tinned tomatoes, tomato paste, sugar, and oregano. Stir to combine.'),
(34, 6, 'Drain and rinse the tinned lentils. Add to the pan.'),
(34, 7, 'Simmer for 10-15 minutes until the sauce thickens. Season with salt and pepper.'),
(34, 8, 'Spoon the lentil bolognese filling into the pepper halves, packing it in generously.'),
(34, 9, 'Bake for 25-30 minutes until peppers are soft and slightly charred at the edges.'),
(34, 10, 'Serve hot.');

-- Recipe 35: Lentil Stuffed Peppers (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(35, 1, 'Preheat oven to 190C.'),
(35, 2, 'Halve the peppers lengthways, remove seeds and white membrane. Place cut-side up on a baking tray.'),
(35, 3, 'Heat olive oil in a pan over medium heat. Add diced onion and cook 4-5 minutes until softened.'),
(35, 4, 'Add minced garlic, cook 30 seconds until fragrant.'),
(35, 5, 'Add tinned tomatoes, tomato paste, sugar, and oregano. Stir to combine.'),
(35, 6, 'Drain and rinse the tinned lentils. Add to the pan.'),
(35, 7, 'Simmer for 10-15 minutes until the sauce thickens. Season with salt and pepper.'),
(35, 8, 'Spoon the lentil bolognese filling into the pepper halves, packing it in generously.'),
(35, 9, 'Bake for 25-30 minutes until peppers are soft and slightly charred at the edges.'),
(35, 10, 'Serve hot.');

-- =============================================
-- LENTIL STUFFED PEPPERS RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(10, 'Lentil Stuffed Peppers', 'Roasted red peppers stuffed with lentil bolognese - a hearty vegetarian take on the Italian classic.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(10, 34, TRUE, 'Standard', 1),   -- Standard is default
(10, 33, FALSE, 'Light', 2),
(10, 35, FALSE, 'Full', 3);

-- =============================================
-- FRESH PASTA INGREDIENT (ID 59)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(59, 'egg', 'Egg', 6, 13.00, 1.10, 11.00, TRUE);

-- =============================================
-- FRESH PASTA (Extra Recipe)
-- =============================================

-- Recipe 36: Fresh Pasta - ~793 cal total, makes ~280g (2 servings)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(36, 'Fresh Pasta', 2, 793, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (36, 5);  -- 5 = extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(36, 43, NULL, 180, 1, 180.00, 1),    -- Plain flour, 180g
(36, 59, NULL, 2, 7, 100.00, 2),      -- Eggs, 2 medium (100g)
(36, 5, NULL, 1, 17, 2.00, 3);        -- Salt, 1 pinch (2g)

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(36, 1, 'Mound flour on a clean work surface. Make a deep well in the center.', NULL, NULL),
(36, 2, 'Crack eggs into the well. Add salt. Beat eggs with a fork, gradually incorporating flour from the inner walls.', NULL, NULL),
(36, 3, 'Once a shaggy dough forms, knead by hand for 8-10 minutes until smooth and elastic. The dough should spring back when poked.', NULL, NULL),
(36, 4, 'Wrap tightly in cling film. Rest at room temperature for 30 minutes minimum (up to 2 hours).', NULL, NULL),
(36, 5, 'Divide dough in half. Keep unused portion wrapped. Roll each piece thin — setting 5-6 on a pasta machine, or about 2mm thick by hand.', NULL, NULL),
(36, 6, 'Cut to desired shape: tagliatelle (8mm wide), fettuccine (6mm), or pappardelle (25mm). Dust with flour to prevent sticking.', NULL, NULL),
(36, 7, 'To cook: Boil well-salted water. Cook fresh pasta 2-3 minutes until al dente. Reserve pasta water before draining.', NULL, NULL),
(36, 8, 'Use immediately, or dry on a rack for 30 minutes then store in an airtight container for up to 2 days. Can also freeze.', NULL, NULL);

-- =============================================
-- PINK SAUCE PASTA INGREDIENT (ID 60)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(60, 'cashews', 'Cashews', 14, 18.00, 27.00, 44.00, TRUE);

-- =============================================
-- PINK SAUCE PASTA FAMILY (Dinner)
-- =============================================

-- Recipe 37: Pink Sauce Pasta (Light) - ~1150 cal total, ~575 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(37, 'Pink Sauce Pasta (Light)', 2, 1150, FALSE, TRUE);

-- Recipe 38: Pink Sauce Pasta (Standard) - ~1404 cal total, ~702 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(38, 'Pink Sauce Pasta', 2, 1404, FALSE, TRUE);

-- Recipe 39: Pink Sauce Pasta (Full) - ~1773 cal total, ~886 cal/serving
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(39, 'Pink Sauce Pasta (Full)', 2, 1773, FALSE, TRUE);

-- =============================================
-- PINK SAUCE PASTA RECIPE MEALS (Dinner)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(37, 3),  -- Light: Dinner
(38, 3),  -- Standard: Dinner
(39, 3);  -- Full: Dinner

-- =============================================
-- PINK SAUCE PASTA RECIPE EXTRAS (link to Fresh Pasta)
-- =============================================
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(37, 36, 0),  -- Light -> Fresh Pasta
(38, 36, 0),  -- Standard -> Fresh Pasta
(39, 36, 0);  -- Full -> Fresh Pasta

-- =============================================
-- PINK SAUCE PASTA RECIPE INGREDIENTS
-- =============================================

-- Recipe 37: Pink Sauce Pasta (Light) - ~1150 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Fresh Pasta (linked recipe)
(37, NULL, 36, 120, 1, 120.00, 1),        -- Fresh Pasta, 120g
-- Chicken
(37, 11, NULL, 160, 1, 160.00, 2),        -- Chicken breast, 160g
(37, 22, NULL, 0.75, 4, 10.00, 3),        -- Olive oil, 0.75 tbsp (10g)
(37, 5, NULL, 0.5, 3, 3.00, 4),           -- Salt, 0.5 tsp
(37, 50, NULL, 0.25, 3, 0.75, 5),         -- Black pepper, 0.25 tsp
-- Cashew cream sauce
(37, 60, NULL, 50, 1, 50.00, 6),          -- Cashews, 50g
(37, 2, NULL, 130, 2, 134.00, 7),         -- Milk, 130ml
(37, 13, NULL, 1, 10, 3.00, 8),           -- Garlic, 1 clove (3g)
(37, 46, NULL, 0.5, 3, 1.50, 9),          -- Smoked paprika, 0.5 tsp
(37, 30, NULL, 20, 1, 20.00, 10);         -- Parmesan, 20g

-- Recipe 38: Pink Sauce Pasta (Standard) - ~1404 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Fresh Pasta (linked recipe)
(38, NULL, 36, 140, 1, 140.00, 1),        -- Fresh Pasta, 140g
-- Chicken
(38, 11, NULL, 200, 1, 200.00, 2),        -- Chicken breast, 200g
(38, 22, NULL, 1, 4, 14.00, 3),           -- Olive oil, 1 tbsp (14g)
(38, 5, NULL, 0.5, 3, 3.00, 4),           -- Salt, 0.5 tsp
(38, 50, NULL, 0.25, 3, 0.75, 5),         -- Black pepper, 0.25 tsp
-- Cashew cream sauce
(38, 60, NULL, 60, 1, 60.00, 6),          -- Cashews, 60g
(38, 2, NULL, 150, 2, 155.00, 7),         -- Milk, 150ml
(38, 13, NULL, 2, 10, 6.00, 8),           -- Garlic, 2 cloves (6g)
(38, 46, NULL, 1, 3, 3.00, 9),            -- Smoked paprika, 1 tsp
(38, 30, NULL, 25, 1, 25.00, 10);         -- Parmesan, 25g

-- Recipe 39: Pink Sauce Pasta (Full) - ~1773 cal total
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Fresh Pasta (linked recipe)
(39, NULL, 36, 160, 1, 160.00, 1),        -- Fresh Pasta, 160g
-- Chicken
(39, 11, NULL, 260, 1, 260.00, 2),        -- Chicken breast, 260g
(39, 22, NULL, 1.25, 4, 18.00, 3),        -- Olive oil, 1.25 tbsp (18g)
(39, 5, NULL, 0.75, 3, 4.50, 4),          -- Salt, 0.75 tsp
(39, 50, NULL, 0.5, 3, 1.50, 5),          -- Black pepper, 0.5 tsp
-- Cashew cream sauce
(39, 60, NULL, 80, 1, 80.00, 6),          -- Cashews, 80g
(39, 2, NULL, 180, 2, 186.00, 7),         -- Milk, 180ml
(39, 13, NULL, 2, 10, 6.00, 8),           -- Garlic, 2 cloves (6g)
(39, 46, NULL, 1.5, 3, 4.50, 9),          -- Smoked paprika, 1.5 tsp
(39, 30, NULL, 35, 1, 35.00, 10);         -- Parmesan, 35g

-- =============================================
-- PINK SAUCE PASTA RECIPE STEPS
-- =============================================

-- Recipe 37: Pink Sauce Pasta (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(37, 1, 'Prepare the fresh pasta according to the linked recipe. Use 60g dough per person.', 36, 'Cook 120g dried pasta (fettuccine or tagliatelle) according to package directions.'),
(37, 2, 'Soak cashews in boiling water for 15 minutes to soften. Drain.', NULL, NULL),
(37, 3, 'Blend soaked cashews with milk until completely smooth and creamy (2-3 minutes in a high-powered blender).', NULL, NULL),
(37, 4, 'Season chicken breast with salt and pepper. Heat olive oil in a pan over medium-high heat. Cook chicken 5-6 minutes per side until golden and cooked through (74C internal). Rest, then slice.', NULL, NULL),
(37, 5, 'In the same pan, add minced garlic and cook 30 seconds until fragrant.', NULL, NULL),
(37, 6, 'Pour in the cashew cream. Add smoked paprika. Simmer gently for 3-4 minutes, stirring occasionally.', NULL, NULL),
(37, 7, 'Stir in grated parmesan until melted. Add a splash of pasta water to loosen if needed.', NULL, NULL),
(37, 8, 'Toss cooked pasta in the sauce. Top with sliced chicken. Serve immediately.', NULL, NULL);

-- Recipe 38: Pink Sauce Pasta (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(38, 1, 'Prepare the fresh pasta according to the linked recipe. Use 70g dough per person.', 36, 'Cook 140g dried pasta (fettuccine or tagliatelle) according to package directions.'),
(38, 2, 'Soak cashews in boiling water for 15 minutes to soften. Drain.', NULL, NULL),
(38, 3, 'Blend soaked cashews with milk until completely smooth and creamy (2-3 minutes in a high-powered blender).', NULL, NULL),
(38, 4, 'Season chicken breast with salt and pepper. Heat olive oil in a pan over medium-high heat. Cook chicken 5-6 minutes per side until golden and cooked through (74C internal). Rest, then slice.', NULL, NULL),
(38, 5, 'In the same pan, add minced garlic and cook 30 seconds until fragrant.', NULL, NULL),
(38, 6, 'Pour in the cashew cream. Add smoked paprika. Simmer gently for 3-4 minutes, stirring occasionally.', NULL, NULL),
(38, 7, 'Stir in grated parmesan until melted. Add a splash of pasta water to loosen if needed.', NULL, NULL),
(38, 8, 'Toss cooked pasta in the sauce. Top with sliced chicken. Serve immediately.', NULL, NULL);

-- Recipe 39: Pink Sauce Pasta (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(39, 1, 'Prepare the fresh pasta according to the linked recipe. Use 80g dough per person.', 36, 'Cook 160g dried pasta (fettuccine or tagliatelle) according to package directions.'),
(39, 2, 'Soak cashews in boiling water for 15 minutes to soften. Drain.', NULL, NULL),
(39, 3, 'Blend soaked cashews with milk until completely smooth and creamy (2-3 minutes in a high-powered blender).', NULL, NULL),
(39, 4, 'Season chicken breast with salt and pepper. Heat olive oil in a pan over medium-high heat. Cook chicken 5-6 minutes per side until golden and cooked through (74C internal). Rest, then slice.', NULL, NULL),
(39, 5, 'In the same pan, add minced garlic and cook 30 seconds until fragrant.', NULL, NULL),
(39, 6, 'Pour in the cashew cream. Add smoked paprika. Simmer gently for 3-4 minutes, stirring occasionally.', NULL, NULL),
(39, 7, 'Stir in grated parmesan until melted. Add a splash of pasta water to loosen if needed.', NULL, NULL),
(39, 8, 'Toss cooked pasta in the sauce. Top with sliced chicken. Serve immediately.', NULL, NULL);

-- =============================================
-- PINK SAUCE PASTA RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(11, 'Pink Sauce Pasta', 'Creamy cashew-based pink sauce with smoked paprika, parmesan, and sliced chicken over fresh pasta.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(11, 38, TRUE, 'Standard', 1),   -- Standard is default
(11, 37, FALSE, 'Light', 2),
(11, 39, FALSE, 'Full', 3);

-- =============================================
-- CHICKEN TIKKA MASALA FAMILY
-- =============================================

-- New Ingredient: Garam Masala (ID 61)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(61, 'garam_masala', 'Garam masala', 8, 12.00, 60.00, 15.00, TRUE);

-- =============================================
-- CHICKEN TIKKA MASALA RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(40, 'Chicken Tikka Masala (Light)', 2, 1258, FALSE, TRUE),
(41, 'Chicken Tikka Masala', 2, 1493, FALSE, TRUE),
(42, 'Chicken Tikka Masala (Full)', 2, 1792, FALSE, TRUE);

-- =============================================
-- CHICKEN TIKKA MASALA RECIPE MEALS (Dinner)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(40, 3),  -- Light: Dinner
(41, 3),  -- Standard: Dinner
(42, 3);  -- Full: Dinner

-- =============================================
-- CHICKEN TIKKA MASALA RECIPE INGREDIENTS
-- =============================================

-- Recipe 40: Chicken Tikka Masala (Light) - ~1258 cal total, ~629 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(40, 11, NULL, 240, 1, 240.00, 1),       -- Chicken breast, 240g
(40, 22, NULL, 1.5, 4, 21.00, 2),        -- Olive oil, 1.5 tbsp
(40, 12, NULL, 1, 7, 110.00, 3),         -- Onion, 1 medium
(40, 13, NULL, 3, 10, 9.00, 4),          -- Garlic, 3 cloves
(40, 14, NULL, 10, 1, 10.00, 5),         -- Ginger, 10g
(40, 23, NULL, 2, 4, 32.00, 6),          -- Tomato paste, 2 tbsp
(40, 33, NULL, 1, 15, 400.00, 7),        -- Tinned tomatoes, 1 tin
(40, 49, NULL, 75, 1, 75.00, 8),         -- Greek yogurt, 75g
(40, 18, NULL, 1, 3, 3.00, 9),           -- Cumin, 1 tsp
(40, 17, NULL, 0.5, 3, 1.00, 10),        -- Turmeric, 0.5 tsp
(40, 46, NULL, 0.5, 3, 1.50, 11),        -- Smoked paprika, 0.5 tsp
(40, 19, NULL, 0.33, 3, 0.50, 12),       -- Cinnamon, 0.33 tsp
(40, 5, NULL, 1, 3, 6.00, 13),           -- Salt, 1 tsp
(40, 50, NULL, 0.33, 3, 1.00, 14),       -- Black pepper, 0.33 tsp
(40, 4, NULL, 0.5, 3, 3.50, 15),         -- Honey, 0.5 tsp
(40, 61, NULL, 1, 3, 3.00, 16),          -- Garam masala, 1 tsp
(40, 26, NULL, 120, 1, 120.00, 17);      -- Jasmine rice (uncooked), 120g

-- Recipe 41: Chicken Tikka Masala (Standard) - ~1493 cal total, ~747 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(41, 11, NULL, 300, 1, 300.00, 1),       -- Chicken breast, 300g
(41, 22, NULL, 1.5, 4, 21.00, 2),        -- Olive oil, 1.5 tbsp
(41, 12, NULL, 1, 7, 110.00, 3),         -- Onion, 1 medium
(41, 13, NULL, 3, 10, 9.00, 4),          -- Garlic, 3 cloves
(41, 14, NULL, 10, 1, 10.00, 5),         -- Ginger, 10g
(41, 23, NULL, 2, 4, 32.00, 6),          -- Tomato paste, 2 tbsp
(41, 33, NULL, 1, 15, 400.00, 7),        -- Tinned tomatoes, 1 tin
(41, 49, NULL, 75, 1, 75.00, 8),         -- Greek yogurt, 75g
(41, 18, NULL, 1, 3, 3.00, 9),           -- Cumin, 1 tsp
(41, 17, NULL, 0.5, 3, 1.00, 10),        -- Turmeric, 0.5 tsp
(41, 46, NULL, 0.5, 3, 1.50, 11),        -- Smoked paprika, 0.5 tsp
(41, 19, NULL, 0.33, 3, 0.50, 12),       -- Cinnamon, 0.33 tsp
(41, 5, NULL, 1, 3, 6.00, 13),           -- Salt, 1 tsp
(41, 50, NULL, 0.33, 3, 1.00, 14),       -- Black pepper, 0.33 tsp
(41, 4, NULL, 0.5, 3, 3.50, 15),         -- Honey, 0.5 tsp
(41, 61, NULL, 1, 3, 3.00, 16),          -- Garam masala, 1 tsp
(41, 26, NULL, 160, 1, 160.00, 17);      -- Jasmine rice (uncooked), 160g

-- Recipe 42: Chicken Tikka Masala (Full) - ~1792 cal total, ~896 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(42, 11, NULL, 400, 1, 400.00, 1),       -- Chicken breast, 400g
(42, 22, NULL, 1.5, 4, 21.00, 2),        -- Olive oil, 1.5 tbsp
(42, 12, NULL, 1, 7, 110.00, 3),         -- Onion, 1 medium
(42, 13, NULL, 3, 10, 9.00, 4),          -- Garlic, 3 cloves
(42, 14, NULL, 10, 1, 10.00, 5),         -- Ginger, 10g
(42, 23, NULL, 2, 4, 32.00, 6),          -- Tomato paste, 2 tbsp
(42, 33, NULL, 1, 15, 400.00, 7),        -- Tinned tomatoes, 1 tin
(42, 49, NULL, 75, 1, 75.00, 8),         -- Greek yogurt, 75g
(42, 18, NULL, 1, 3, 3.00, 9),           -- Cumin, 1 tsp
(42, 17, NULL, 0.5, 3, 1.00, 10),        -- Turmeric, 0.5 tsp
(42, 46, NULL, 0.5, 3, 1.50, 11),        -- Smoked paprika, 0.5 tsp
(42, 19, NULL, 0.33, 3, 0.50, 12),       -- Cinnamon, 0.33 tsp
(42, 5, NULL, 1, 3, 6.00, 13),           -- Salt, 1 tsp
(42, 50, NULL, 0.33, 3, 1.00, 14),       -- Black pepper, 0.33 tsp
(42, 4, NULL, 0.5, 3, 3.50, 15),         -- Honey, 0.5 tsp
(42, 61, NULL, 1, 3, 3.00, 16),          -- Garam masala, 1 tsp
(42, 26, NULL, 200, 1, 200.00, 17);      -- Jasmine rice (uncooked), 200g

-- =============================================
-- CHICKEN TIKKA MASALA RECIPE STEPS
-- =============================================

-- Recipe 40: Chicken Tikka Masala (Light)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(40, 1, 'Cut chicken into bite-sized pieces. Season with salt, pepper, and half the garam masala.'),
(40, 2, 'Heat 1 tbsp olive oil in a large pan over medium-high heat. Cook chicken until golden on all sides, about 5 minutes. Remove and set aside.'),
(40, 3, 'Add remaining oil to pan. Sauté diced onion until softened and lightly golden, about 5 minutes.'),
(40, 4, 'Add minced garlic and grated ginger. Cook 1 minute until fragrant.'),
(40, 5, 'Add cumin, turmeric, smoked paprika, and cinnamon. Stir for 30 seconds until fragrant.'),
(40, 6, 'Stir in tomato paste and cook for 1 minute.'),
(40, 7, 'Pour in tinned tomatoes. Use a wooden spoon to break them up. Simmer for 10 minutes, stirring occasionally.'),
(40, 8, 'Reduce heat to low. Stir in Greek yogurt, honey, and remaining garam masala. Season with salt and pepper to taste.'),
(40, 9, 'Return chicken to the sauce. Simmer gently for 5-10 minutes until chicken is cooked through (74°C internal).'),
(40, 10, 'Meanwhile, cook rice according to package directions. Serve curry over rice.');

-- Recipe 41: Chicken Tikka Masala (Standard)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(41, 1, 'Cut chicken into bite-sized pieces. Season with salt, pepper, and half the garam masala.'),
(41, 2, 'Heat 1 tbsp olive oil in a large pan over medium-high heat. Cook chicken until golden on all sides, about 5 minutes. Remove and set aside.'),
(41, 3, 'Add remaining oil to pan. Sauté diced onion until softened and lightly golden, about 5 minutes.'),
(41, 4, 'Add minced garlic and grated ginger. Cook 1 minute until fragrant.'),
(41, 5, 'Add cumin, turmeric, smoked paprika, and cinnamon. Stir for 30 seconds until fragrant.'),
(41, 6, 'Stir in tomato paste and cook for 1 minute.'),
(41, 7, 'Pour in tinned tomatoes. Use a wooden spoon to break them up. Simmer for 10 minutes, stirring occasionally.'),
(41, 8, 'Reduce heat to low. Stir in Greek yogurt, honey, and remaining garam masala. Season with salt and pepper to taste.'),
(41, 9, 'Return chicken to the sauce. Simmer gently for 5-10 minutes until chicken is cooked through (74°C internal).'),
(41, 10, 'Meanwhile, cook rice according to package directions. Serve curry over rice.');

-- Recipe 42: Chicken Tikka Masala (Full)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(42, 1, 'Cut chicken into bite-sized pieces. Season with salt, pepper, and half the garam masala.'),
(42, 2, 'Heat 1 tbsp olive oil in a large pan over medium-high heat. Cook chicken until golden on all sides, about 5 minutes. Remove and set aside.'),
(42, 3, 'Add remaining oil to pan. Sauté diced onion until softened and lightly golden, about 5 minutes.'),
(42, 4, 'Add minced garlic and grated ginger. Cook 1 minute until fragrant.'),
(42, 5, 'Add cumin, turmeric, smoked paprika, and cinnamon. Stir for 30 seconds until fragrant.'),
(42, 6, 'Stir in tomato paste and cook for 1 minute.'),
(42, 7, 'Pour in tinned tomatoes. Use a wooden spoon to break them up. Simmer for 10 minutes, stirring occasionally.'),
(42, 8, 'Reduce heat to low. Stir in Greek yogurt, honey, and remaining garam masala. Season with salt and pepper to taste.'),
(42, 9, 'Return chicken to the sauce. Simmer gently for 5-10 minutes until chicken is cooked through (74°C internal).'),
(42, 10, 'Meanwhile, cook rice according to package directions. Serve curry over rice.');

-- =============================================
-- CHICKEN TIKKA MASALA RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(12, 'Chicken Tikka Masala', 'Creamy tomato-based curry with tender chicken, Greek yogurt, and aromatic spices. Served over jasmine rice.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(12, 41, TRUE, 'Standard', 1),   -- Standard is default
(12, 40, FALSE, 'Light', 2),
(12, 42, FALSE, 'Full', 3);

-- =============================================
-- BURGER PATTIES (Extra)
-- =============================================

-- New Ingredients for Burger Patties
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(62, 'beef_mince_5', 'Beef mince (5% fat)', 1, 21.00, 0.00, 5.00, TRUE),
(63, 'breadcrumbs', 'Breadcrumbs', 13, 13.00, 72.00, 5.00, TRUE),
(64, 'onion_powder', 'Onion powder', 8, 10.00, 79.00, 1.00, TRUE),
(65, 'paprika', 'Paprika', 8, 14.00, 54.00, 13.00, TRUE);

-- Recipe 43: Burger Patties (Extra) - ~852 cal total, makes 4 patties (~565g yield)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(43, 'Burger Patties', 4, 852, FALSE, TRUE);

-- Assign to 'extras' meal type (meal_id = 5)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (43, 5);

-- Burger Patties Ingredients
-- Total yield: 565g, Per patty: ~141g, 213 cal, 26.5g protein, 7.5g carbs, 7.5g fat
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(43, 62, NULL, 454, 1, 454.00, 1),    -- Beef mince 5% fat, 454g (1 lb)
(43, 63, NULL, 0.25, 16, 30.00, 2),   -- Breadcrumbs, 1/4 cup (30g)
(43, 64, NULL, 1, 3, 2.00, 3),        -- Onion powder, 1 tsp (2g)
(43, 13, NULL, 1, 10, 3.00, 4),       -- Garlic, 1 clove (3g)
(43, 39, NULL, 1, 4, 17.00, 5),       -- Worcestershire sauce, 1 tbsp (17g)
(43, 5, NULL, 1, 3, 6.00, 6),         -- Salt, 1 tsp (6g)
(43, 50, NULL, 0.5, 3, 1.50, 7),      -- Black pepper, 0.5 tsp (1.5g)
(43, 65, NULL, 0.5, 3, 1.50, 8),      -- Paprika, 0.5 tsp (1.5g)
(43, 59, NULL, 1, 7, 50.00, 9);       -- Egg, 1 medium (50g)

-- Burger Patties Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(43, 1, 'Combine beef mince, breadcrumbs, onion powder, minced garlic, Worcestershire sauce, salt, pepper, paprika, and beaten egg in a large bowl.', NULL, NULL),
(43, 2, 'Mix gently with your hands until just combined — don''t overwork or patties will be tough.', NULL, NULL),
(43, 3, 'Divide into 4 equal portions (~141g each). Form into patties about 2cm thick, slightly thinner in the center (they puff up when cooking).', NULL, NULL),
(43, 4, 'Make a small dimple in the center of each patty with your thumb to prevent doming.', NULL, NULL),
(43, 5, 'Cook on grill or pan over medium-high heat, 4-5 minutes per side until internal temp reaches 71°C (160°F).', NULL, NULL),
(43, 6, 'Rest 2-3 minutes before serving.', NULL, NULL);

-- =============================================
-- STROMBOLI FAMILY (with Linked Recipe Extras)
-- =============================================

-- New Ingredients for Stromboli
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(66, 'garlic_granules', 'Garlic granules', 8, 17.00, 73.00, 0.50, TRUE),
(67, 'italian_seasoning', 'Italian seasoning', 8, 5.00, 60.00, 6.00, TRUE);

-- Stromboli Recipes (3 variants, serves 2 each)
-- Uses linked recipes: Pizza Dough (11), Pizza Sauce (12), Burger Patties (43)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(44, 'Stromboli (Light)', 2, 1344, FALSE, TRUE),
(45, 'Stromboli', 2, 1664, FALSE, TRUE),
(46, 'Stromboli (Full)', 2, 2098, FALSE, TRUE);

-- Assign to Dinner meal type
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(44, 3),  -- Light: Dinner
(45, 3),  -- Standard: Dinner
(46, 3);  -- Full: Dinner

-- =============================================
-- STROMBOLI RECIPE EXTRAS (for popup hierarchy)
-- =============================================
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
-- Light variant extras
(44, 11, 0),  -- Pizza Dough
(44, 12, 1),  -- Pizza Sauce
(44, 43, 2),  -- Burger Patties
-- Standard variant extras
(45, 11, 0),  -- Pizza Dough
(45, 12, 1),  -- Pizza Sauce
(45, 43, 2),  -- Burger Patties
-- Full variant extras
(46, 11, 0),  -- Pizza Dough
(46, 12, 1),  -- Pizza Sauce
(46, 43, 2); -- Burger Patties

-- =============================================
-- STROMBOLI (LIGHT) INGREDIENTS
-- Total: 1344 cal, Per serving: 672 cal, 30.4g protein, 60g carbs, 34.5g fat
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(44, NULL, 11, 250, 1, 250.00, 1),    -- Pizza Dough (linked), 250g
(44, NULL, 12, 38, 1, 38.00, 2),      -- Pizza Sauce (linked), 38g (~2.5 tbsp)
(44, 37, NULL, 80, 1, 80.00, 3),      -- Mozzarella, 80g
(44, 30, NULL, 15, 1, 15.00, 4),      -- Parmesan, 15g
(44, NULL, 43, 100, 1, 100.00, 5),    -- Burger Patties (linked), 100g
(44, 12, NULL, 40, 1, 40.00, 6),      -- Onion (grilled), 40g
(44, 66, NULL, 1, 3, 2.50, 7),        -- Garlic granules, 1 tsp (2.5g)
(44, 67, NULL, 2, 3, 2.00, 8),        -- Italian seasoning, 2 tsp (2g)
(44, 22, NULL, 1.5, 4, 21.00, 9);     -- Olive oil, 1.5 tbsp (21g)

-- =============================================
-- STROMBOLI (STANDARD) INGREDIENTS
-- Total: 1664 cal, Per serving: 832 cal, 37.7g protein, 72g carbs, 43.7g fat
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(45, NULL, 11, 300, 1, 300.00, 1),    -- Pizza Dough (linked), 300g
(45, NULL, 12, 45, 1, 45.00, 2),      -- Pizza Sauce (linked), 45g (3 tbsp)
(45, 37, NULL, 100, 1, 100.00, 3),    -- Mozzarella, 100g
(45, 30, NULL, 20, 1, 20.00, 4),      -- Parmesan, 20g
(45, NULL, 43, 125, 1, 125.00, 5),    -- Burger Patties (linked), 125g
(45, 12, NULL, 50, 1, 50.00, 6),      -- Onion (grilled), 50g
(45, 66, NULL, 1, 3, 3.00, 7),        -- Garlic granules, 1 tsp (3g)
(45, 67, NULL, 2, 3, 2.00, 8),        -- Italian seasoning, 2 tsp (2g)
(45, 22, NULL, 2, 4, 28.00, 9);       -- Olive oil, 2 tbsp (28g)

-- =============================================
-- STROMBOLI (FULL) INGREDIENTS
-- Total: 2098 cal, Per serving: 1049 cal, 48.6g protein, 89g carbs, 55.6g fat
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(46, NULL, 11, 370, 1, 370.00, 1),    -- Pizza Dough (linked), 370g
(46, NULL, 12, 55, 1, 55.00, 2),      -- Pizza Sauce (linked), 55g (4 tbsp)
(46, 37, NULL, 130, 1, 130.00, 3),    -- Mozzarella, 130g
(46, 30, NULL, 30, 1, 30.00, 4),      -- Parmesan, 30g
(46, NULL, 43, 160, 1, 160.00, 5),    -- Burger Patties (linked), 160g
(46, 12, NULL, 60, 1, 60.00, 6),      -- Onion (grilled), 60g
(46, 66, NULL, 1, 3, 3.00, 7),        -- Garlic granules, 1 tsp (3g)
(46, 67, NULL, 2, 3, 2.00, 8),        -- Italian seasoning, 2 tsp (2g)
(46, 22, NULL, 2.5, 4, 35.00, 9);     -- Olive oil, 2.5 tbsp (35g)

-- =============================================
-- STROMBOLI RECIPE STEPS (Light)
-- =============================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(44, 1, 'Prepare the pizza dough according to the linked recipe. Use 250g dough.', 11, 'Use 250g store-bought pizza dough, brought to room temperature.'),
(44, 2, 'Prepare the burger patty mixture according to the linked recipe. You will need 100g of the mixture (crumbled, not formed into patties).', 43, 'Use 100g cooked ground beef, crumbled.'),
(44, 3, 'Grill the onion slices until softened and lightly charred, about 3-4 minutes per side.', NULL, NULL),
(44, 4, 'Roll the dough into a 30 x 20 cm rectangle on a floured surface. Spread the pizza sauce over the dough, leaving a 2cm border. Layer the crumbled burger meat, grilled onion, mozzarella, and parmesan.', 12, 'Roll the dough into a 30 x 20 cm rectangle. Spread 38g store-bought pizza sauce over the dough. Layer the meat, onion, and cheeses.'),
(44, 5, 'Roll the stromboli tightly from the long edge, sealing the seam and tucking the ends underneath. Place seam-side down on a lined baking tray.', NULL, NULL),
(44, 6, 'Mix olive oil with garlic granules and Italian seasoning. Brush generously over the top and sides of the stromboli. Cut 3-4 small slits on top for steam.', NULL, NULL),
(44, 7, 'Bake at 200°C for 25-30 minutes until golden brown. Rest 5 minutes before slicing.', NULL, NULL);

-- =============================================
-- STROMBOLI RECIPE STEPS (Standard)
-- =============================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(45, 1, 'Prepare the pizza dough according to the linked recipe. Use 300g dough.', 11, 'Use 300g store-bought pizza dough, brought to room temperature.'),
(45, 2, 'Prepare the burger patty mixture according to the linked recipe. You will need 125g of the mixture (crumbled, not formed into patties).', 43, 'Use 125g cooked ground beef, crumbled.'),
(45, 3, 'Grill the onion slices until softened and lightly charred, about 3-4 minutes per side.', NULL, NULL),
(45, 4, 'Roll the dough into a 30 x 20 cm rectangle on a floured surface. Spread the pizza sauce over the dough, leaving a 2cm border. Layer the crumbled burger meat, grilled onion, mozzarella, and parmesan.', 12, 'Roll the dough into a 30 x 20 cm rectangle. Spread 45g store-bought pizza sauce over the dough. Layer the meat, onion, and cheeses.'),
(45, 5, 'Roll the stromboli tightly from the long edge, sealing the seam and tucking the ends underneath. Place seam-side down on a lined baking tray.', NULL, NULL),
(45, 6, 'Mix olive oil with garlic granules and Italian seasoning. Brush generously over the top and sides of the stromboli. Cut 3-4 small slits on top for steam.', NULL, NULL),
(45, 7, 'Bake at 200°C for 25-30 minutes until golden brown. Rest 5 minutes before slicing.', NULL, NULL);

-- =============================================
-- STROMBOLI RECIPE STEPS (Full)
-- =============================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(46, 1, 'Prepare the pizza dough according to the linked recipe. Use 370g dough.', 11, 'Use 370g store-bought pizza dough, brought to room temperature.'),
(46, 2, 'Prepare the burger patty mixture according to the linked recipe. You will need 160g of the mixture (crumbled, not formed into patties).', 43, 'Use 160g cooked ground beef, crumbled.'),
(46, 3, 'Grill the onion slices until softened and lightly charred, about 3-4 minutes per side.', NULL, NULL),
(46, 4, 'Roll the dough into a 30 x 20 cm rectangle on a floured surface. Spread the pizza sauce over the dough, leaving a 2cm border. Layer the crumbled burger meat, grilled onion, mozzarella, and parmesan.', 12, 'Roll the dough into a 30 x 20 cm rectangle. Spread 55g store-bought pizza sauce over the dough. Layer the meat, onion, and cheeses.'),
(46, 5, 'Roll the stromboli tightly from the long edge, sealing the seam and tucking the ends underneath. Place seam-side down on a lined baking tray.', NULL, NULL),
(46, 6, 'Mix olive oil with garlic granules and Italian seasoning. Brush generously over the top and sides of the stromboli. Cut 3-4 small slits on top for steam.', NULL, NULL),
(46, 7, 'Bake at 200°C for 25-30 minutes until golden brown. Rest 5 minutes before slicing.', NULL, NULL);

-- =============================================
-- STROMBOLI RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(13, 'Stromboli', 'Rolled pizza dough stuffed with seasoned beef, mozzarella, parmesan, grilled onion, and pizza sauce. Brushed with garlic and Italian herb olive oil.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(13, 45, TRUE, 'Standard', 1),   -- Standard is default
(13, 44, FALSE, 'Light', 2),
(13, 46, FALSE, 'Full', 3);

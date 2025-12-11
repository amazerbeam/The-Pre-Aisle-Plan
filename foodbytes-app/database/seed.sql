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
(26, 'rice', 'Rice (cooked)', 11, 2.70, 28.00, 0.30, TRUE),
(27, 'cornflour', 'Cornflour', 11, 0.30, 91.00, 0.10, TRUE);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
-- Porridge with Berries & Nuts Family
(1, 'Porridge with Berries & Nuts (Light)', 2, 1010, FALSE, TRUE),
(2, 'Porridge with Berries & Nuts', 2, 1190, FALSE, TRUE),
(3, 'Porridge with Berries & Nuts (Full)', 2, 1430, FALSE, TRUE),

-- Peanut Butter Banana Smoothie Family
(4, 'Peanut Butter Banana Smoothie (Light)', 2, 860, FALSE, TRUE),
(5, 'Peanut Butter Banana Smoothie', 2, 1080, FALSE, TRUE),
(6, 'Peanut Butter Banana Smoothie (Full)', 2, 1360, FALSE, TRUE),

-- Irish Chicken Curry Family
(7, 'Irish Chicken Curry (Light)', 2, 960, FALSE, TRUE),
(8, 'Irish Chicken Curry', 2, 1240, FALSE, TRUE),
(9, 'Irish Chicken Curry (Full)', 2, 1560, FALSE, TRUE);

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

-- Recipe 1: Porridge with Berries & Nuts (Light) - ~1010 cal total, ~505 cal/serving
-- FR-093: Added linked_recipe_id column (NULL for regular ingredients)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(1, 1, NULL, 100, 1, 100.00, 1),    -- Rolled oats, 100g
(1, 2, NULL, 425, 2, 438.00, 2),    -- Milk, 425ml
(1, 9, NULL, 255, 2, 255.00, 3),    -- Water, 255ml
(1, 3, NULL, 135, 1, 135.00, 4),    -- Mixed berries, 135g
(1, 4, NULL, 1.5, 3, 12.00, 5),     -- Honey, 1.5 tsp
(1, 5, NULL, 1, 3, 5.00, 6),        -- Salt, 1 tsp
(1, 6, NULL, 1.5, 4, 27.00, 7),     -- Peanut butter, 1.5 tbsp
(1, 7, NULL, 17, 1, 17.00, 8),      -- Almonds, 17g
(1, 8, NULL, 17, 1, 17.00, 9);      -- Walnuts, 17g

-- Recipe 2: Porridge with Berries & Nuts (Standard) - ~1190 cal total, ~595 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(2, 1, NULL, 120, 1, 120.00, 1),    -- Rolled oats, 120g
(2, 2, NULL, 500, 2, 515.00, 2),    -- Milk, 500ml
(2, 9, NULL, 300, 2, 300.00, 3),    -- Water, 300ml
(2, 3, NULL, 160, 1, 160.00, 4),    -- Mixed berries, 160g
(2, 4, NULL, 2, 3, 14.00, 5),       -- Honey, 2 tsp
(2, 5, NULL, 1, 3, 6.00, 6),        -- Salt, 1 tsp
(2, 6, NULL, 2, 4, 32.00, 7),       -- Peanut butter, 2 tbsp
(2, 7, NULL, 20, 1, 20.00, 8),      -- Almonds, 20g
(2, 8, NULL, 20, 1, 20.00, 9);      -- Walnuts, 20g

-- Recipe 3: Porridge with Berries & Nuts (Full) - ~1430 cal total, ~715 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(3, 1, NULL, 145, 1, 145.00, 1),    -- Rolled oats, 145g
(3, 2, NULL, 600, 2, 618.00, 2),    -- Milk, 600ml
(3, 9, NULL, 360, 2, 360.00, 3),    -- Water, 360ml
(3, 3, NULL, 190, 1, 190.00, 4),    -- Mixed berries, 190g
(3, 4, NULL, 2.5, 3, 17.00, 5),     -- Honey, 2.5 tsp
(3, 5, NULL, 1, 3, 7.00, 6),        -- Salt, 1 tsp
(3, 6, NULL, 2.5, 4, 40.00, 7),     -- Peanut butter, 2.5 tbsp
(3, 7, NULL, 24, 1, 24.00, 8),      -- Almonds, 24g
(3, 8, NULL, 24, 1, 24.00, 9);      -- Walnuts, 24g

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
(7, 26, NULL, 278, 1, 278.00, 20);    -- Rice (cooked), 278g (3/4 cup x 2)

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
(8, 26, NULL, 370, 1, 370.00, 20);    -- Rice (cooked), 370g (1 cup x 2)

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
(9, 26, NULL, 462, 1, 462.00, 20);    -- Rice (cooked), 462g (1.25 cups x 2)

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
(36, 'sugar', 'Sugar', 12, 0.00, 100.00, 0.00, TRUE);

-- =============================================
-- EXTRAS RECIPES (must be created BEFORE parent)
-- =============================================

-- Recipe 10: Pesto (Extras) - ~879 cal total, makes ~165g
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(10, 'Pesto', 11, 879, FALSE, TRUE);

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

-- Recipe 11: Pizza Dough (Extras) - ~2033 cal total, makes ~760g (4 portions)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(11, 'Pizza Dough', 4, 2033, FALSE, TRUE);

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

-- Recipe 12: Pizza Sauce (Extras) - ~313 cal total, makes ~440g
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(12, 'Pizza Sauce', 7, 313, FALSE, TRUE);

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

-- Recipe 13: Pizza (Light) - ~1220 cal total (2 servings, 610 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(13, 'Pizza (Light)', 2, 1220, FALSE, TRUE);

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

-- Recipe 14: Pizza (Standard) - ~1680 cal total (2 servings, 840 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(14, 'Pizza', 2, 1680, FALSE, TRUE);

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

-- Recipe 15: Pizza (Full) - ~2140 cal total (2 servings, 1070 cal each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(15, 'Pizza (Full)', 2, 2140, FALSE, TRUE);

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

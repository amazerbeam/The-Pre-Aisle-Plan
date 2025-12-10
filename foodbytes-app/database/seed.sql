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
INSERT INTO meals (id, `key`, name, display_order) VALUES
(1, 'breakfast', 'Breakfast', 1),
(2, 'lunch', 'Lunch', 2),
(3, 'dinner', 'Dinner', 3),
(4, 'snacks', 'Snacks', 4);

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
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(1, 1, 100, 1, 100.00, 1),    -- Rolled oats, 100g
(1, 2, 425, 2, 438.00, 2),    -- Milk, 425ml
(1, 9, 255, 2, 255.00, 3),    -- Water, 255ml
(1, 3, 135, 1, 135.00, 4),    -- Mixed berries, 135g
(1, 4, 1.5, 3, 12.00, 5),     -- Honey, 1.5 tsp
(1, 5, 1, 3, 5.00, 6),        -- Salt, 1 tsp
(1, 6, 1.5, 4, 27.00, 7),     -- Peanut butter, 1.5 tbsp
(1, 7, 17, 1, 17.00, 8),      -- Almonds, 17g
(1, 8, 17, 1, 17.00, 9);      -- Walnuts, 17g

-- Recipe 2: Porridge with Berries & Nuts (Standard) - ~1190 cal total, ~595 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(2, 1, 120, 1, 120.00, 1),    -- Rolled oats, 120g
(2, 2, 500, 2, 515.00, 2),    -- Milk, 500ml
(2, 9, 300, 2, 300.00, 3),    -- Water, 300ml
(2, 3, 160, 1, 160.00, 4),    -- Mixed berries, 160g
(2, 4, 2, 3, 14.00, 5),       -- Honey, 2 tsp
(2, 5, 1, 3, 6.00, 6),        -- Salt, 1 tsp
(2, 6, 2, 4, 32.00, 7),       -- Peanut butter, 2 tbsp
(2, 7, 20, 1, 20.00, 8),      -- Almonds, 20g
(2, 8, 20, 1, 20.00, 9);      -- Walnuts, 20g

-- Recipe 3: Porridge with Berries & Nuts (Full) - ~1430 cal total, ~715 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(3, 1, 145, 1, 145.00, 1),    -- Rolled oats, 145g
(3, 2, 600, 2, 618.00, 2),    -- Milk, 600ml
(3, 9, 360, 2, 360.00, 3),    -- Water, 360ml
(3, 3, 190, 1, 190.00, 4),    -- Mixed berries, 190g
(3, 4, 2.5, 3, 17.00, 5),     -- Honey, 2.5 tsp
(3, 5, 1, 3, 7.00, 6),        -- Salt, 1 tsp
(3, 6, 2.5, 4, 40.00, 7),     -- Peanut butter, 2.5 tbsp
(3, 7, 24, 1, 24.00, 8),      -- Almonds, 24g
(3, 8, 24, 1, 24.00, 9);      -- Walnuts, 24g

-- Recipe 4: Peanut Butter Banana Smoothie (Light) - ~860 cal total, ~430 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(4, 10, 300, 1, 300.00, 1),   -- Banana (frozen), 300g
(4, 2, 400, 2, 412.00, 2),    -- Milk, 400ml
(4, 6, 45, 1, 45.00, 3),      -- Peanut butter, 45g
(4, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 5: Peanut Butter Banana Smoothie (Standard) - ~1080 cal total, ~540 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(5, 10, 400, 1, 400.00, 1),   -- Banana (frozen), 400g
(5, 2, 520, 2, 536.00, 2),    -- Milk, 520ml
(5, 6, 60, 1, 60.00, 3),      -- Peanut butter, 60g
(5, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 6: Peanut Butter Banana Smoothie (Full) - ~1360 cal total, ~680 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(6, 10, 500, 1, 500.00, 1),   -- Banana (frozen), 500g
(6, 2, 650, 2, 670.00, 2),    -- Milk, 650ml
(6, 6, 75, 1, 75.00, 3),      -- Peanut butter, 75g
(6, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 7: Irish Chicken Curry (Light) - ~960 cal total, ~480 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(7, 11, 240, 1, 240.00, 1),     -- Chicken breast, 240g (120g x 2)
(7, 22, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(7, 12, 1, 8, 150.00, 3),       -- Onion, 1 large
(7, 13, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(7, 14, 5, 1, 5.00, 5),         -- Ginger, 5g
(7, 10, 1, 7, 120.00, 6),       -- Banana, 1 medium
(7, 23, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(7, 25, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(7, 4, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(7, 24, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(7, 17, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(7, 18, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(7, 19, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(7, 20, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(7, 21, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(7, 5, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(7, 27, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(7, 15, 150, 1, 150.00, 18),    -- Sweet potato, 150g (75g x 2)
(7, 16, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(7, 26, 278, 1, 278.00, 20);    -- Rice (cooked), 278g (3/4 cup x 2)

-- Recipe 8: Irish Chicken Curry (Standard) - ~1240 cal total, ~620 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(8, 11, 300, 1, 300.00, 1),     -- Chicken breast, 300g (150g x 2)
(8, 22, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(8, 12, 1, 8, 150.00, 3),       -- Onion, 1 large
(8, 13, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(8, 14, 5, 1, 5.00, 5),         -- Ginger, 5g
(8, 10, 1, 7, 120.00, 6),       -- Banana, 1 medium
(8, 23, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(8, 25, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(8, 4, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(8, 24, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(8, 17, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(8, 18, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(8, 19, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(8, 20, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(8, 21, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(8, 5, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(8, 27, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(8, 15, 200, 1, 200.00, 18),    -- Sweet potato, 200g (100g x 2)
(8, 16, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(8, 26, 370, 1, 370.00, 20);    -- Rice (cooked), 370g (1 cup x 2)

-- Recipe 9: Irish Chicken Curry (Full) - ~1560 cal total, ~780 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(9, 11, 400, 1, 400.00, 1),     -- Chicken breast, 400g (200g x 2)
(9, 22, 1, 4, 14.00, 2),        -- Olive oil, 1 tbsp
(9, 12, 1, 8, 150.00, 3),       -- Onion, 1 large
(9, 13, 3, 10, 9.00, 4),        -- Garlic, 3 cloves
(9, 14, 5, 1, 5.00, 5),         -- Ginger, 5g
(9, 10, 1, 7, 120.00, 6),       -- Banana, 1 medium
(9, 23, 1, 4, 16.00, 7),        -- Tomato paste, 1 tbsp
(9, 25, 2, 3, 10.00, 8),        -- Soy sauce, 2 tsp
(9, 4, 1, 3, 7.00, 9),          -- Honey, 1 tsp
(9, 24, 480, 2, 480.00, 10),    -- Chicken stock, 480ml
(9, 17, 0.5, 3, 1.00, 11),      -- Turmeric, 0.5 tsp
(9, 18, 0.5, 3, 1.50, 12),      -- Cumin, 0.5 tsp
(9, 19, 0.33, 3, 0.50, 13),     -- Cinnamon, 0.33 tsp
(9, 20, 1, 5, 2.00, 14),        -- Star anise, 1 piece
(9, 21, 1, 17, 0.50, 15),       -- MSG, 1 pinch (optional)
(9, 5, 1, 3, 6.00, 16),         -- Salt, 1 tsp
(9, 27, 1, 4, 8.00, 17),        -- Cornflour, 1 tbsp
(9, 15, 300, 1, 300.00, 18),    -- Sweet potato, 300g (150g x 2)
(9, 16, 0.5, 16, 72.00, 19),    -- Frozen peas, 0.5 cup
(9, 26, 462, 1, 462.00, 20);    -- Rice (cooked), 462g (1.25 cups x 2)

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

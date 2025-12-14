-- =============================================
-- IRISH CHICKEN CURRY - Migration Script
-- Default Servings: 2
-- =============================================

-- CLEANUP: Delete previous Irish Chicken Curry data (if exists)
DELETE FROM recipe_family_members WHERE family_id = 3;
DELETE FROM recipe_families WHERE id = 3;
DELETE FROM recipe_steps WHERE recipe_id IN (7, 8, 9);
DELETE FROM recipe_ingredients WHERE recipe_id IN (7, 8, 9);
DELETE FROM recipe_meals WHERE recipe_id IN (7, 8, 9);
DELETE FROM recipes WHERE id IN (7, 8, 9);
DELETE FROM ingredients WHERE id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27);

-- =============================================
-- NEW INGREDIENTS (IDs 11-27)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
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
-- RECIPES (IDs 7-9) - Default 2 servings
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(7, 'Irish Chicken Curry (Light)', 2, 960, FALSE, TRUE),
(8, 'Irish Chicken Curry', 2, 1240, FALSE, TRUE),
(9, 'Irish Chicken Curry (Full)', 2, 1560, FALSE, TRUE);

-- RECIPE MEALS (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(7, 3),  -- Light: Dinner
(8, 3),  -- Standard: Dinner
(9, 3);  -- Full: Dinner

-- =============================================
-- RECIPE INGREDIENTS (2 servings base)
-- =============================================

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
-- RECIPE STEPS (same for all variants)
-- =============================================
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
-- RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(3, 'Irish Chicken Curry', 'Sweet and mild chicken curry with banana, warm spices, roasted sweet potato, and peas. Served over rice.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(3, 8, TRUE, 'Standard', 1),
(3, 7, FALSE, 'Light', 2),
(3, 9, FALSE, 'Full', 3);

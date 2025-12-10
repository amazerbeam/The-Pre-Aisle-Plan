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
(9, 'water', 'Water', 16, 0.00, 0.00, 0.00, TRUE);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
-- Porridge with Berries & Nuts Family
(1, 'Porridge with Berries & Nuts (Light)', 2, 1010, FALSE, TRUE),
(2, 'Porridge with Berries & Nuts', 2, 1190, FALSE, TRUE),
(3, 'Porridge with Berries & Nuts (Full)', 2, 1430, FALSE, TRUE);

-- =============================================
-- RECIPE MEALS
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(1, 1),  -- Light: Breakfast
(2, 1),  -- Standard: Breakfast
(3, 1);  -- Full: Breakfast

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

-- =============================================
-- RECIPE FAMILIES
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(1, 'Porridge with Berries & Nuts', 'Creamy oat porridge topped with honey, peanut butter, mixed berries, and chopped nuts');

-- Link recipes to family
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(1, 2, TRUE, 'Standard', 1),   -- Standard is default
(1, 1, FALSE, 'Light', 2),
(1, 3, FALSE, 'Full', 3);

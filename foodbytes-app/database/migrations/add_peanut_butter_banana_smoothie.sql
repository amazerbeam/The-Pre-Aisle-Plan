-- Migration: Add Peanut Butter Banana Smoothie Recipe Family
-- Date: 2025-12-10

-- =============================================
-- 1. ADD NEW INGREDIENT
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(10, 'banana', 'Banana', 4, 1.10, 22.70, 0.30, TRUE);

-- =============================================
-- 2. ADD RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(4, 'Peanut Butter Banana Smoothie (Light)', 2, 860, FALSE, TRUE),
(5, 'Peanut Butter Banana Smoothie', 2, 1080, FALSE, TRUE),
(6, 'Peanut Butter Banana Smoothie (Full)', 2, 1360, FALSE, TRUE);

-- =============================================
-- 3. ADD RECIPE MEALS (Breakfast & Snacks)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(4, 1),  -- Light: Breakfast
(4, 4),  -- Light: Snacks
(5, 1),  -- Standard: Breakfast
(5, 4),  -- Standard: Snacks
(6, 1),  -- Full: Breakfast
(6, 4);  -- Full: Snacks

-- =============================================
-- 4. ADD RECIPE INGREDIENTS
-- =============================================

-- Recipe 4: Light - ~860 cal total, ~430 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(4, 10, 300, 1, 300.00, 1),   -- Banana (frozen), 300g
(4, 2, 400, 2, 412.00, 2),    -- Milk, 400ml
(4, 6, 45, 1, 45.00, 3),      -- Peanut butter, 45g
(4, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 5: Standard - ~1080 cal total, ~540 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(5, 10, 400, 1, 400.00, 1),   -- Banana (frozen), 400g
(5, 2, 520, 2, 536.00, 2),    -- Milk, 520ml
(5, 6, 60, 1, 60.00, 3),      -- Peanut butter, 60g
(5, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- Recipe 6: Full - ~1360 cal total, ~680 cal/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(6, 10, 500, 1, 500.00, 1),   -- Banana (frozen), 500g
(6, 2, 650, 2, 670.00, 2),    -- Milk, 650ml
(6, 6, 75, 1, 75.00, 3),      -- Peanut butter, 75g
(6, 5, 1, 17, 0.50, 4);       -- Salt, 1 pinch

-- =============================================
-- 5. ADD RECIPE STEPS
-- =============================================

-- Recipe 4: Light
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(4, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(4, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(4, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(4, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(4, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- Recipe 5: Standard
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(5, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(5, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(5, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(5, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(5, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- Recipe 6: Full
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(6, 1, 'Peel bananas, break into chunks, and freeze for at least 2 hours (or overnight) until solid.'),
(6, 2, 'Add frozen banana chunks, milk, and peanut butter to a blender.'),
(6, 3, 'Blend on high until completely smooth and creamy, about 60-90 seconds. Scrape sides if needed.'),
(6, 4, 'Add a pinch of salt to enhance sweetness. Pulse briefly to combine.'),
(6, 5, 'Pour into glasses and serve immediately while thick and cold.');

-- =============================================
-- 6. ADD RECIPE FAMILY
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(2, 'Peanut Butter Banana Smoothie', 'Thick and creamy frozen banana smoothie with peanut butter and milk');

-- Link recipes to family
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(2, 5, TRUE, 'Moderate', 1),   -- Moderate is default
(2, 4, FALSE, 'Light', 2),
(2, 6, FALSE, 'Balanced', 3);

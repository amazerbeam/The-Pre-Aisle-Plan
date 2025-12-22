-- FR-103: Store-Bought Ingredient Linking Migration
-- Allows extras to have both ingredient_id AND linked_recipe_id
-- When store-bought selected: use ingredient_id (with proper aisle)
-- When homemade selected: use linked_recipe_id (process recipe ingredients)

-- Step 1: Add store-bought ingredients (next available ID = 74)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(74, 'pesto_store', 'Pesto', 12, 4.00, 5.00, 45.00, FALSE),              -- Condiments & Sauces
(75, 'pizza_dough_store', 'Pizza Dough', 13, 8.00, 50.00, 2.00, FALSE),  -- Bakery
(76, 'pizza_sauce_store', 'Pizza Sauce', 12, 1.50, 8.00, 0.50, FALSE);   -- Condiments & Sauces

-- Step 2: Update recipe_ingredients to add ingredient_id alongside linked_recipe_id
-- This allows store-bought option for extras
UPDATE recipe_ingredients SET ingredient_id = 74 WHERE linked_recipe_id = 10;  -- Pesto
UPDATE recipe_ingredients SET ingredient_id = 75 WHERE linked_recipe_id = 11;  -- Pizza Dough
UPDATE recipe_ingredients SET ingredient_id = 76 WHERE linked_recipe_id = 12;  -- Pizza Sauce

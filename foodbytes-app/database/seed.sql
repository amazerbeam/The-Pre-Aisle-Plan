-- FoodBytes Seed Data
-- Version: 2.0.0 (Normalized)

-- =============================================
-- LOOKUP TABLES
-- =============================================

-- Aisles (for shopping list organization)
INSERT INTO aisles (id, `key`, name, display_order) VALUES
(1, 'produce', 'Produce', 1),
(2, 'dairy', 'Dairy & Eggs', 2),
(3, 'meat', 'Meat & Poultry', 3),
(4, 'seafood', 'Seafood', 4),
(5, 'bakery', 'Bakery', 5),
(6, 'grains', 'Grains & Pasta', 6),
(7, 'canned', 'Canned Goods', 7),
(8, 'condiments', 'Condiments & Sauces', 8),
(9, 'spices', 'Spices & Seasonings', 9),
(10, 'oils', 'Oils & Vinegars', 10),
(11, 'nuts', 'Nuts & Seeds', 11),
(12, 'snacks', 'Snacks & Confectionery', 12),
(13, 'breakfast', 'Breakfast & Cereals', 13),
(14, 'health', 'Health Foods', 14),
(15, 'deli', 'Deli', 15);

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
(14, 'leaf', 'leaf');

-- Meals
INSERT INTO meals (id, `key`, name, display_order) VALUES
(1, 'breakfast', 'Breakfast', 1),
(2, 'lunch', 'Lunch', 2),
(3, 'dinner', 'Dinner', 3),
(4, 'snacks', 'Snacks', 4);

-- =============================================
-- INGREDIENTS (with aisle references)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Produce (aisle 1)
(1, 'mixed_berries', 'Mixed berries', 1),
(2, 'banana', 'Banana', 1),
(3, 'spinach', 'Spinach', 1),
(4, 'avocado', 'Avocado', 1),
(5, 'cucumber', 'Cucumber', 1),
(6, 'cherry_tomatoes', 'Cherry tomatoes', 1),
(7, 'carrot', 'Carrot', 1),
(8, 'lemon', 'Lemon', 1),
(9, 'salad_leaves', 'Salad leaves', 1),
(10, 'lettuce_leaves', 'Lettuce leaves', 1),
(11, 'tomato', 'Tomato', 1),
(12, 'red_onion', 'Red onion', 1),
(13, 'fresh_parsley', 'Fresh parsley', 1),
(14, 'broccoli', 'Broccoli', 1),
(15, 'green_bell_pepper', 'Green bell pepper', 1),
(16, 'red_bell_pepper', 'Red bell pepper', 1),
(17, 'onion', 'Onion', 1),
(18, 'garlic', 'Garlic', 1),
(19, 'ginger', 'Ginger', 1),
(20, 'celery', 'Celery', 1),
(21, 'potatoes', 'Potatoes', 1),
(22, 'lettuce', 'Lettuce', 1),

-- Dairy & Eggs (aisle 2)
(23, 'greek_yogurt', 'Greek yogurt', 2),
(24, 'milk', 'Milk', 2),
(25, 'eggs', 'Eggs', 2),
(26, 'butter', 'Butter', 2),
(27, 'feta_cheese', 'Feta cheese', 2),
(28, 'cheese', 'Cheese', 2),

-- Meat & Poultry (aisle 3)
(29, 'chicken_breast', 'Chicken breast', 3),
(30, 'turkey_breast', 'Turkey breast', 3),
(31, 'beef_sirloin', 'Beef sirloin', 3),
(32, 'beef_mince', 'Beef mince', 3),

-- Seafood (aisle 4)
(33, 'salmon_fillet', 'Salmon fillet', 4),

-- Bakery (aisle 5)
(34, 'flour_tortillas', 'Flour tortillas', 5),
(35, 'burger_bun', 'Burger bun', 5),
(36, 'plain_flour', 'Plain flour', 5),

-- Grains & Pasta (aisle 6)
(37, 'rolled_oats', 'Rolled oats', 6),
(38, 'quinoa', 'Quinoa', 6),
(39, 'brown_rice', 'Brown rice', 6),

-- Canned Goods (aisle 7)
(40, 'chickpeas', 'Chickpeas', 7),

-- Condiments & Sauces (aisle 8)
(41, 'honey', 'Honey', 8),
(42, 'mayonnaise', 'Mayonnaise', 8),
(43, 'soy_sauce', 'Soy sauce', 8),
(44, 'maple_syrup', 'Maple syrup', 8),

-- Spices & Seasonings (aisle 9)
(45, 'cinnamon', 'Cinnamon', 9),
(46, 'salt', 'Salt', 9),

-- Oils & Vinegars (aisle 10)
(47, 'olive_oil', 'Olive oil', 10),
(48, 'lemon_juice', 'Lemon juice', 10),

-- Nuts & Seeds (aisle 11)
(49, 'chia_seeds', 'Chia seeds', 11),
(50, 'almonds', 'Almonds', 11),
(51, 'cashews', 'Cashews', 11),
(52, 'walnuts', 'Walnuts', 11),
(53, 'sesame_seeds', 'Sesame seeds', 11),

-- Snacks & Confectionery (aisle 12)
(54, 'dark_chocolate', 'Dark chocolate', 12),
(55, 'dark_chocolate_chips', 'Dark chocolate chips', 12),

-- Breakfast & Cereals (aisle 13)
(56, 'granola', 'Granola', 13),
(57, 'peanut_butter', 'Peanut butter', 13),

-- Deli (aisle 15)
(58, 'hummus', 'Hummus', 15);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(1, 'Overnight Oats', 2, 880, FALSE, TRUE),
(2, 'Scrambled Eggs with Spinach & Avocado', 2, 734, FALSE, TRUE),
(3, 'Greek Yogurt Parfait', 1, 350, FALSE, TRUE),
(4, 'Grilled Chicken Salad', 2, 1210, FALSE, TRUE),
(5, 'Turkey & Avocado Wrap', 2, 680, FALSE, TRUE),
(6, 'Mediterranean Quinoa Bowl', 2, 720, FALSE, TRUE),
(7, 'Baked Salmon with Vegetables', 2, 1200, FALSE, TRUE),
(8, 'Stir-Fried Chicken & Peppers', 2, 1180, FALSE, TRUE),
(9, 'Beef Stir Fry with Broccoli', 2, 980, FALSE, TRUE),
(10, 'Mixed Nuts & Dark Chocolate', 1, 280, FALSE, TRUE),
(11, 'Hummus with Veggie Sticks', 1, 220, FALSE, TRUE),
(12, 'Protein Energy Balls', 2, 320, FALSE, TRUE),
(13, 'Pancakes with Maple Syrup', 2, 650, TRUE, TRUE),
(14, 'Burger with Fries', 1, 1100, TRUE, TRUE);

-- =============================================
-- RECIPE MEALS (using meal_id)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
-- Breakfast (meal_id = 1)
(1, 1), (2, 1), (3, 1), (13, 1),
-- Lunch (meal_id = 2)
(4, 2), (5, 2), (6, 2),
-- Dinner (meal_id = 3)
(7, 3), (8, 3), (9, 3), (14, 3),
-- Snacks (meal_id = 4)
(10, 4), (11, 4), (12, 4);

-- =============================================
-- RECIPE INGREDIENTS (using ingredient_id and unit_id)
-- =============================================

-- Recipe 1: Overnight Oats
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(1, 37, 40, 1, 1),    -- Rolled oats, 40g
(1, 23, 100, 1, 2),   -- Greek yogurt, 100g
(1, 24, 200, 2, 3),   -- Milk, 200ml
(1, 1, 100, 1, 4),    -- Mixed berries, 100g
(1, 49, 2, 3, 5),     -- Chia seeds, 2 tsp
(1, 41, 0.5, 3, 6),   -- Honey, 0.5 tsp
(1, 57, 1, 4, 7),     -- Peanut butter, 1 tbsp
(1, 2, 1, 5, 8),      -- Banana, 1 piece
(1, 45, 0.25, 3, 9);  -- Cinnamon, 0.25 tsp

-- Recipe 2: Scrambled Eggs with Spinach & Avocado
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(2, 25, 8, 6, 1),     -- Eggs, 8 small
(2, 26, 1, 3, 2),     -- Butter, 1 tsp
(2, 3, 60, 1, 3),     -- Spinach, 60g
(2, 4, 1, 7, 4);      -- Avocado, 1 medium

-- Recipe 3: Greek Yogurt Parfait
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(3, 23, 200, 1, 1),   -- Greek yogurt, 200g
(3, 1, 80, 1, 2),     -- Mixed berries, 80g
(3, 56, 30, 1, 3),    -- Granola, 30g
(3, 41, 1, 4, 4);     -- Honey, 1 tbsp

-- Recipe 4: Grilled Chicken Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(4, 29, 240, 1, 1),   -- Chicken breast, 240g
(4, 9, 2, 9, 2),      -- Salad leaves, 2 handful
(4, 5, 1, 5, 3),      -- Cucumber, 1 piece
(4, 6, 10, 5, 4),     -- Cherry tomatoes, 10 piece
(4, 7, 2, 5, 5),      -- Carrot, 2 piece
(4, 8, 1, 5, 6),      -- Lemon, 1 piece
(4, 47, 1, 4, 7),     -- Olive oil, 1 tbsp
(4, 4, 0.5, 7, 8),    -- Avocado, 0.5 medium
(4, 40, 150, 1, 9),   -- Chickpeas, 150g
(4, 27, 40, 1, 10);   -- Feta cheese, 40g

-- Recipe 5: Turkey & Avocado Wrap
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(5, 34, 2, 5, 1),     -- Flour tortillas, 2 piece
(5, 30, 150, 1, 2),   -- Turkey breast, 150g
(5, 4, 1, 7, 3),      -- Avocado, 1 medium
(5, 10, 4, 5, 4),     -- Lettuce leaves, 4 piece
(5, 11, 1, 5, 5),     -- Tomato, 1 piece
(5, 42, 1, 4, 6);     -- Mayonnaise, 1 tbsp

-- Recipe 6: Mediterranean Quinoa Bowl
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(6, 38, 150, 1, 1),   -- Quinoa, 150g
(6, 5, 1, 5, 2),      -- Cucumber, 1 piece
(6, 6, 8, 5, 3),      -- Cherry tomatoes, 8 piece
(6, 12, 0.5, 5, 4),   -- Red onion, 0.5 piece
(6, 27, 50, 1, 5),    -- Feta cheese, 50g
(6, 47, 2, 4, 6),     -- Olive oil, 2 tbsp
(6, 48, 1, 4, 7),     -- Lemon juice, 1 tbsp
(6, 13, 2, 4, 8);     -- Fresh parsley, 2 tbsp

-- Recipe 7: Baked Salmon with Vegetables
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(7, 33, 2, 5, 1),     -- Salmon fillet, 2 piece
(7, 14, 1, 11, 2),    -- Broccoli, 1 head
(7, 7, 2, 5, 3),      -- Carrot, 2 piece
(7, 9, 2, 9, 4),      -- Salad leaves, 2 handful
(7, 8, 1, 5, 5),      -- Lemon, 1 piece
(7, 47, 3, 4, 6),     -- Olive oil, 3 tbsp
(7, 4, 1, 7, 7),      -- Avocado, 1 medium
(7, 46, 0.5, 3, 8),   -- Salt, 0.5 tsp
(7, 50, 20, 1, 9);    -- Almonds, 20g

-- Recipe 8: Stir-Fried Chicken & Peppers
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(8, 29, 240, 1, 1),   -- Chicken breast, 240g
(8, 15, 1, 5, 2),     -- Green bell pepper, 1 piece
(8, 16, 1, 5, 3),     -- Red bell pepper, 1 piece
(8, 17, 1, 5, 4),     -- Onion, 1 piece
(8, 43, 2, 4, 5),     -- Soy sauce, 2 tbsp
(8, 18, 2, 10, 6),    -- Garlic, 2 clove
(8, 19, 1, 3, 7),     -- Ginger, 1 tsp
(8, 47, 2, 4, 8),     -- Olive oil, 2 tbsp
(8, 53, 1, 3, 9);     -- Sesame seeds, 1 tsp

-- Recipe 9: Beef Stir Fry with Broccoli
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(9, 31, 250, 1, 1),   -- Beef sirloin, 250g
(9, 14, 200, 1, 2),   -- Broccoli, 200g
(9, 43, 3, 4, 3),     -- Soy sauce, 3 tbsp
(9, 18, 3, 10, 4),    -- Garlic, 3 clove
(9, 47, 2, 4, 5),     -- Olive oil, 2 tbsp
(9, 39, 150, 1, 6);   -- Brown rice, 150g

-- Recipe 10: Mixed Nuts & Dark Chocolate
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(10, 50, 20, 1, 1),   -- Almonds, 20g
(10, 51, 15, 1, 2),   -- Cashews, 15g
(10, 52, 15, 1, 3),   -- Walnuts, 15g
(10, 54, 20, 1, 4);   -- Dark chocolate, 20g

-- Recipe 11: Hummus with Veggie Sticks
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(11, 58, 100, 1, 1),  -- Hummus, 100g
(11, 7, 2, 5, 2),     -- Carrot, 2 piece
(11, 5, 0.5, 5, 3),   -- Cucumber, 0.5 piece
(11, 20, 2, 12, 4),   -- Celery, 2 stalk
(11, 16, 0.5, 5, 5);  -- Red bell pepper, 0.5 piece

-- Recipe 12: Protein Energy Balls
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(12, 37, 100, 1, 1),  -- Rolled oats, 100g
(12, 57, 80, 1, 2),   -- Peanut butter, 80g
(12, 41, 3, 4, 3),    -- Honey, 3 tbsp
(12, 55, 30, 1, 4),   -- Dark chocolate chips, 30g
(12, 49, 1, 4, 5);    -- Chia seeds, 1 tbsp

-- Recipe 13: Pancakes with Maple Syrup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(13, 36, 200, 1, 1),  -- Plain flour, 200g
(13, 25, 2, 8, 2),    -- Eggs, 2 large
(13, 24, 300, 2, 3),  -- Milk, 300ml
(13, 26, 30, 1, 4),   -- Butter, 30g
(13, 44, 4, 4, 5),    -- Maple syrup, 4 tbsp
(13, 1, 100, 1, 6);   -- Mixed berries, 100g

-- Recipe 14: Burger with Fries
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(14, 32, 200, 1, 1),  -- Beef mince, 200g
(14, 35, 1, 5, 2),    -- Burger bun, 1 piece
(14, 22, 2, 14, 3),   -- Lettuce, 2 leaf
(14, 11, 2, 13, 4),   -- Tomato, 2 slice
(14, 28, 1, 13, 5),   -- Cheese, 1 slice
(14, 21, 200, 1, 6),  -- Potatoes, 200g
(14, 47, 2, 4, 7),    -- Olive oil, 2 tbsp
(14, 46, 0.5, 3, 8);  -- Salt, 0.5 tsp

-- =============================================
-- RECIPE STEPS
-- =============================================

-- Recipe 1: Overnight Oats
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(1, 1, 'Combine oats, yogurt, milk, chia seeds, and peanut butter.'),
(1, 2, 'Mix well and refrigerate overnight.'),
(1, 3, 'In the morning, stir and top with berries, banana slices, honey, and cinnamon.');

-- Recipe 2: Scrambled Eggs
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(2, 1, 'Slice or mash avocado and set aside.'),
(2, 2, 'Sauté spinach in a non-stick pan until wilted. Remove and plate.'),
(2, 3, 'Whisk eggs with salt to taste.'),
(2, 4, 'Heat butter in a pan, add eggs, and stir continuously until softly scrambled.'),
(2, 5, 'Serve eggs with spinach and avocado on the side.');

-- Recipe 3: Greek Yogurt Parfait
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(3, 1, 'Layer half the yogurt in a glass or bowl.'),
(3, 2, 'Add half the berries and granola.'),
(3, 3, 'Repeat layers and drizzle with honey.');

-- Recipe 4: Grilled Chicken Salad
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(4, 1, 'Cook and slice the chicken breast. Let rest if made in advance.'),
(4, 2, 'Wash and prep the salad leaves, cucumber, tomatoes, and carrots.'),
(4, 3, 'Slice avocado and drain chickpeas.'),
(4, 4, 'Crumble feta over the vegetables.'),
(4, 5, 'In a small bowl, mix lemon juice and 1 tbsp olive oil for dressing.'),
(4, 6, 'Combine all ingredients in a large bowl and toss with dressing.'),
(4, 7, 'Top with grilled chicken and serve.');

-- Recipe 5: Turkey & Avocado Wrap
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(5, 1, 'Warm the tortillas slightly.'),
(5, 2, 'Spread mayonnaise on each tortilla.'),
(5, 3, 'Layer turkey, sliced avocado, lettuce, and tomato.'),
(5, 4, 'Roll up tightly and slice in half to serve.');

-- Recipe 6: Mediterranean Quinoa Bowl
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(6, 1, 'Cook quinoa according to package instructions and let cool.'),
(6, 2, 'Dice cucumber, halve tomatoes, and thinly slice red onion.'),
(6, 3, 'Combine cooled quinoa with vegetables.'),
(6, 4, 'Crumble feta cheese over the bowl.'),
(6, 5, 'Drizzle with olive oil and lemon juice, toss to combine.'),
(6, 6, 'Garnish with fresh parsley.');

-- Recipe 7: Baked Salmon
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(7, 1, 'Preheat oven to 180°C.'),
(7, 2, 'Cut broccoli into florets and toss with 1 tbsp olive oil and salt.'),
(7, 3, 'Spread broccoli on a baking tray and roast for 10 minutes.'),
(7, 4, 'Add salmon fillets in the center, drizzle with olive oil and season.'),
(7, 5, 'Bake for another 20 minutes until salmon is cooked and broccoli tender.'),
(7, 6, 'Spiralize carrots and toss with salad leaves, avocado, and almonds.'),
(7, 7, 'Make a dressing with lemon juice and 1 tbsp olive oil.'),
(7, 8, 'Serve salmon with roasted broccoli and the avocado-nut salad.');

-- Recipe 8: Stir-Fried Chicken
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(8, 1, 'Slice chicken and peppers into strips.'),
(8, 2, 'Heat oil in a wok over high heat.'),
(8, 3, 'Stir-fry chicken for 4-5 minutes until cooked.'),
(8, 4, 'Add garlic and ginger, stir for 30 seconds.'),
(8, 5, 'Add peppers and onion, cook for 3 minutes.'),
(8, 6, 'Add soy sauce and toss to combine.'),
(8, 7, 'Sprinkle with sesame seeds before serving.');

-- Recipe 9: Beef Stir Fry
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(9, 1, 'Cook brown rice according to package instructions.'),
(9, 2, 'Slice beef into thin strips.'),
(9, 3, 'Cut broccoli into small florets.'),
(9, 4, 'Heat oil in a wok and stir-fry beef for 2-3 minutes.'),
(9, 5, 'Add garlic and broccoli, cook for 4 minutes.'),
(9, 6, 'Add soy sauce and toss well.'),
(9, 7, 'Serve over brown rice.');

-- Recipe 10: Mixed Nuts & Dark Chocolate
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(10, 1, 'Combine all nuts in a small container.'),
(10, 2, 'Break dark chocolate into small pieces and add.'),
(10, 3, 'Mix and enjoy as a healthy snack.');

-- Recipe 11: Hummus with Veggie Sticks
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(11, 1, 'Cut vegetables into sticks.'),
(11, 2, 'Serve hummus in a bowl with veggie sticks around it.'),
(11, 3, 'Dip and enjoy!');

-- Recipe 12: Protein Energy Balls
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(12, 1, 'Mix all ingredients in a bowl until well combined.'),
(12, 2, 'Refrigerate for 15 minutes to make rolling easier.'),
(12, 3, 'Roll into small balls (about 12).'),
(12, 4, 'Store in refrigerator for up to 1 week.');

-- Recipe 13: Pancakes
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(13, 1, 'Whisk flour, eggs, and milk until smooth batter forms.'),
(13, 2, 'Heat a non-stick pan with a little butter.'),
(13, 3, 'Pour batter to make pancakes, flip when bubbles form.'),
(13, 4, 'Stack pancakes and top with berries and maple syrup.');

-- Recipe 14: Burger with Fries
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(14, 1, 'Cut potatoes into fries, toss with oil and salt, bake at 200°C for 25 min.'),
(14, 2, 'Form beef mince into a patty, season with salt.'),
(14, 3, 'Grill or pan-fry patty for 4 minutes each side.'),
(14, 4, 'Toast the burger bun.'),
(14, 5, 'Assemble: bun, lettuce, patty, cheese, tomato, bun.'),
(14, 6, 'Serve with fries.');

-- =============================================
-- TEST USER (development only)
-- =============================================
INSERT INTO users (email, name, google_id, is_admin, created_at) VALUES
('admin@foodbytes.test', 'Admin User', 'google_admin_test_id', TRUE, NOW());

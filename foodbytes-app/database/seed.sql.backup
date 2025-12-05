-- FoodBytes Seed Data
-- Version: 3.0.0 (Imported from recipes.js)

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
-- INGREDIENTS (with aisle references)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Meat (aisle 1)
(1, 'ground_beef', 'Beef Mince (3% fat)', 1),
(2, 'streaky_bacon', 'Streaky bacon', 1),
(3, 'sirloin_steak', 'Sirloin Steak', 1),
(4, 'pork_belly', 'Pork belly', 1),
(5, 'chorizo', 'Chorizo', 1),
(6, 'firm_tofu', 'Firm tofu', 1),

-- Poultry (aisle 2)
(7, 'chicken_breast', 'Chicken breast', 2),
(8, 'turkey_mince', 'Turkey mince', 2),

-- Veg (aisle 3)
(9, 'broccoli', 'Broccoli', 3),
(10, 'lettuce_leaves', 'Lettuce leaves', 3),
(11, 'salad_leaves', 'Salad leaves', 3),
(12, 'spinach', 'Spinach', 3),
(13, 'garlic', 'Garlic', 3),
(14, 'ginger', 'Ginger', 3),
(15, 'green_bell_pepper', 'Green bell pepper', 3),
(16, 'red_bell_pepper', 'Red bell pepper', 3),
(17, 'onion', 'Onion', 3),
(18, 'red_onion', 'Red onion', 3),
(19, 'spring_onion', 'Spring onion', 3),
(20, 'pak_choi', 'Pak choi', 3),
(21, 'celery', 'Celery', 3),
(22, 'carrot', 'Carrot', 3),
(23, 'cucumber', 'Cucumber', 3),
(24, 'cherry_tomatoes', 'Cherry tomatoes', 3),
(25, 'tomato', 'Tomato', 3),
(26, 'sweet_potato', 'Sweet potato', 3),
(27, 'mushrooms', 'Mushrooms', 3),
(28, 'rosemary_sprig', 'Rosemary sprig', 3),

-- Fruit (aisle 4)
(29, 'lemon', 'Lemon', 4),
(30, 'lemon_juice', 'Lemon juice', 4),
(31, 'lime_juice', 'Lime juice', 4),
(32, 'banana', 'Banana', 4),
(33, 'avocado', 'Avocado', 4),
(34, 'mixed_berries', 'Mixed berries', 4),

-- Fish (aisle 5)
(35, 'white_fish', 'White fish', 5),

-- Dairy (aisle 6)
(36, 'greek_yogurt', 'Greek yogurt', 6),
(37, 'milk', 'Milk', 6),
(38, 'eggs', 'Eggs', 6),
(39, 'feta_cheese', 'Feta cheese', 6),
(40, 'cheese', 'Cheese', 6),

-- Frozen (aisle 7)
(41, 'peas_petit_pois', 'Petit pois', 7),
(42, 'green_beans_frozen', 'Green beans (frozen)', 7),

-- Herbs & Spices (aisle 8)
(43, 'basil', 'Basil', 8),
(44, 'salt', 'Salt', 8),
(45, 'black_pepper', 'Black pepper', 8),
(46, 'smoked_paprika', 'Smoked paprika', 8),
(47, 'chili_flakes', 'Chili flakes', 8),
(48, 'italian_seasoning', 'Italian seasoning', 8),
(49, 'cumin', 'Cumin', 8),
(50, 'cinnamon', 'Cinnamon', 8),
(51, 'sugar', 'Sugar', 8),
(52, 'anise_star', 'Star anise', 8),
(53, 'msg', 'MSG', 8),
(54, 'garam_masala', 'Garam Masala', 8),
(55, 'onion_powder', 'Onion powder', 8),
(56, 'garlic_powder', 'Garlic powder', 8),
(57, 'turmeric', 'Turmeric', 8),
(58, 'lemon_zest', 'Lemon zest', 8),

-- Oils & Fats (aisle 9)
(59, 'olive_oil', 'Olive oil', 9),

-- Tins & Jars (aisle 10)
(60, 'tomato_paste', 'Tomato paste', 10),
(61, 'tinned_tomatoes', 'Tinned tomatoes', 10),
(62, 'black_beans', 'Black Beans', 10),
(63, 'tomato_sauce', 'Tomato sauce', 10),
(64, 'chickpeas', 'Chickpeas', 10),
(65, 'butter_beans', 'Butter beans', 10),
(66, 'brown_lentils', 'Brown lentils', 10),
(67, 'capers', 'Capers', 10),
(68, 'green_olives', 'Green olives', 10),

-- Grains & Pasta (aisle 11)
(69, 'rolled_oats', 'Rolled oats', 11),
(70, 'paella_rice', 'Paella rice', 11),
(71, 'jasmine_rice', 'Jasmine rice', 11),

-- Condiments & Sauces (aisle 12)
(72, 'soy_sauce', 'Soy sauce', 12),
(73, 'worcestershire_sauce', 'Worcestershire sauce', 12),
(74, 'maple_syrup', 'Maple syrup', 12),
(75, 'jalapenos', 'Jalapenos', 12),
(76, 'honey', 'Honey', 12),

-- Bakery (aisle 13)
(77, 'plain_flour', 'Plain flour', 13),
(78, 'almond_flour', 'Almond flour', 13),
(79, 'breadcrumbs', 'Breadcrumbs', 13),
(80, 'baking_powder', 'Baking powder', 13),
(81, 'corn_flour', 'Corn flour', 13),
(82, 'dry_yeast', 'Dry yeast', 13),
(83, 'vanilla_extract', 'Vanilla extract', 13),

-- Nuts (aisle 14)
(84, 'almonds', 'Almonds', 14),
(85, 'cashews', 'Cashews', 14),
(86, 'walnuts', 'Walnuts', 14),
(87, 'peanut_butter', 'Peanut butter', 14),

-- Seeds (aisle 15)
(88, 'sesame_seeds', 'Sesame seeds', 15),

-- Beverages (aisle 16)
(89, 'water', 'Water', 16),

-- Misc (aisle 17)
(90, 'stock', 'Stock', 17);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
-- Breakfast
(1, 'Almond Flour Pancakes', 2, 745, FALSE, TRUE),
(2, 'Frozen Banana Whip', 2, 930, FALSE, TRUE),
(3, 'Morning Oats with Honey, Nuts & Berries', 2, 620, FALSE, TRUE),
(4, 'Buttermilk Pancake Stack with Streaky Bacon', 2, 1680, TRUE, TRUE),
-- Lunch
(5, 'Argentine Beef Empanada Bites', 2, 2575, TRUE, TRUE),
(6, 'Chicken & Black Bean Burrito', 2, 760, FALSE, TRUE),
(7, 'Pan-Fried Fish Cakes with Lemon & Roasted Sweet Potato', 2, 920, FALSE, TRUE),
(8, 'Lemon Chicken Salad with Feta & Chickpeas', 2, 1150, FALSE, TRUE),
(9, 'Turkish-Style Lettuce Wraps', 2, 1195, FALSE, TRUE),
-- Dinner
(10, 'Crispy Herb Chicken with Roasted Garlic Vegetables', 2, 1495, FALSE, TRUE),
(11, 'Spiced Banana Curry with Chickpeas & Tofu', 2, 1470, FALSE, TRUE),
(12, 'Creamy Tikka Masala with Chickpeas', 2, 1205, FALSE, TRUE),
(13, 'Chili Crisp Tofu with Mushrooms', 2, 960, FALSE, TRUE),
(14, 'Wok-Tossed Chicken with Cashews & Pak Choi', 2, 1200, FALSE, TRUE),
(15, 'Tuscan Turkey Meatballs', 2, 1500, FALSE, TRUE),
(16, 'Black Pepper Beef Stir Fry', 2, 1170, TRUE, TRUE),
(17, 'Chicken & Pork Paella', 4, 4540, TRUE, TRUE),
(18, 'Chorizo Pizza', 2, 3820, TRUE, TRUE);

-- =============================================
-- RECIPE MEALS (using meal_id)
-- =============================================
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
-- Breakfast (meal_id = 1)
(1, 1), (2, 1), (3, 1), (4, 1),
-- Lunch (meal_id = 2)
(5, 2), (6, 2), (7, 2), (8, 2), (9, 2),
-- Dinner (meal_id = 3)
(5, 3), (10, 3), (11, 3), (12, 3), (13, 3), (14, 3), (15, 3), (16, 3), (17, 3), (18, 3);

-- =============================================
-- RECIPE INGREDIENTS (using ingredient_id and unit_id)
-- =============================================

-- Recipe 1: Almond Flour Pancakes
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(1, 78, 60, 1, 1),     -- Almond flour, 60g
(1, 38, 2, 6, 2),      -- Eggs, 2 small
(1, 37, 60, 2, 3),     -- Milk, 60ml
(1, 80, 0.5, 3, 4),    -- Baking powder, 0.5 tsp
(1, 83, 0.5, 3, 5),    -- Vanilla extract, 0.5 tsp
(1, 59, 1, 3, 6),      -- Olive oil, 1 tsp
(1, 34, 60, 1, 7),     -- Mixed berries, 60g
(1, 76, 1, 3, 8),      -- Honey, 1 tsp
(1, 36, 100, 1, 9),    -- Greek yogurt, 100g
(1, 32, 1, 5, 10);     -- Banana, 1 piece

-- Recipe 2: Monkey Moo
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(2, 32, 400, 1, 1),    -- Banana, 400g
(2, 37, 520, 2, 2),    -- Milk, 520ml
(2, 87, 60, 1, 3);     -- Peanut butter, 60g

-- Recipe 3: Warm Oat Porridge with Berries & Nuts
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(3, 69, 60, 1, 1),     -- Rolled oats, 60g
(3, 37, 250, 2, 2),    -- Milk, 250ml
(3, 89, 150, 2, 3),    -- Water, 150ml
(3, 34, 80, 1, 4),     -- Mixed berries, 80g
(3, 76, 1, 3, 5),      -- Honey, 1 tsp
(3, 44, 0.5, 3, 6),    -- Salt, 0.5 tsp
(3, 87, 1, 4, 7),      -- Peanut butter, 1 tbsp
(3, 84, 10, 1, 8),     -- Almonds, 10g
(3, 86, 10, 1, 9);     -- Walnuts, 10g

-- Recipe 4: Pancakes and Bacon
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(4, 77, 100, 1, 1),    -- Plain flour, 100g
(4, 38, 2, 6, 2),      -- Eggs, 2 small
(4, 37, 300, 2, 3),    -- Milk, 300ml
(4, 36, 10, 1, 4),     -- Greek yogurt, 10g
(4, 2, 12, 13, 5),     -- Streaky bacon, 12 slices
(4, 74, 2, 4, 6);      -- Maple syrup, 2 tbsp

-- Recipe 5: Argentine Beef Empanada Bites
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(5, 77, 300, 1, 1),    -- Plain flour, 300g
(5, 44, 1, 3, 2),      -- Salt, 1 tsp
(5, 36, 75, 1, 3),     -- Greek yogurt, 75g
(5, 89, 120, 2, 4),    -- Water, 120ml
(5, 59, 1, 4, 5),      -- Olive oil, 1 tbsp
(5, 17, 1, 5, 6),      -- Onion, 1 piece
(5, 16, 0.5, 5, 7),    -- Red bell pepper, 0.5 piece
(5, 13, 2, 10, 8),     -- Garlic, 2 cloves
(5, 1, 400, 1, 9),     -- Ground beef, 400g
(5, 46, 1, 3, 10),     -- Smoked paprika, 1 tsp
(5, 49, 1, 3, 11),     -- Cumin, 1 tsp
(5, 45, 0.25, 3, 12),  -- Black pepper, 0.25 tsp
(5, 60, 1.5, 4, 13),   -- Tomato paste, 1.5 tbsp
(5, 90, 60, 2, 14),    -- Stock, 60ml
(5, 38, 2, 6, 15),     -- Eggs, 2 small
(5, 68, 50, 1, 16);    -- Green olives, 50g

-- Recipe 6: Chicken & Black Bean Burrito
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(6, 7, 150, 1, 1),     -- Chicken breast, 150g
(6, 62, 120, 1, 2),    -- Black beans, 120g
(6, 18, 0.5, 6, 3),    -- Red onion, 0.5 small
(6, 17, 0.5, 6, 4),    -- Onion, 0.5 small
(6, 16, 0.5, 5, 5),    -- Red bell pepper, 0.5 piece
(6, 25, 1, 7, 6),      -- Tomatoe, 1 medium
(6, 75, 0.25, 5, 7),   -- Jalapenos, 0.25 piece
(6, 10, 2, 9, 8),      -- Lettuce leaves, 2 handful
(6, 33, 0.5, 5, 9),    -- Avocado, 0.5 piece
(6, 36, 2, 4, 10),     -- Greek yogurt, 2 tbsp
(6, 13, 0.25, 10, 11), -- Garlic, 0.25 clove
(6, 31, 2, 3, 12),     -- Lime juice, 2 tsp
(6, 59, 2, 3, 13),     -- Olive oil, 2 tsp
(6, 46, 1, 3, 14),     -- Smoked paprika, 1 tsp
(6, 49, 1, 3, 15),     -- Cumin, 1 tsp
(6, 44, 1, 3, 16),     -- Salt, 1 tsp
(6, 45, 0.25, 3, 17);  -- Black pepper, 0.25 tsp

-- Recipe 7: Fish Cakes with Leafy Salad & Sweet Potato
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(7, 35, 250, 1, 1),    -- White fish, 250g
(7, 38, 2, 6, 2),      -- Eggs, 2 small
(7, 13, 1, 10, 3),     -- Garlic, 1 clove
(7, 19, 1, 6, 4),      -- Spring onion, 1 small
(7, 58, 0.5, 3, 5),    -- Lemon zest, 0.5 tsp
(7, 77, 2, 4, 6),      -- Plain flour, 2 tbsp
(7, 59, 2, 4, 7),      -- Olive oil, 2 tbsp
(7, 44, 0.5, 3, 8),    -- Salt, 0.5 tsp
(7, 45, 0.25, 3, 9),   -- Black pepper, 0.25 tsp
(7, 26, 300, 1, 10),   -- Sweet potato, 300g
(7, 11, 2, 9, 11),     -- Salad leaves, 2 handful
(7, 23, 0.5, 5, 12),   -- Cucumber, 0.5 piece
(7, 24, 6, 5, 13),     -- Cherry tomatoes, 6 pieces
(7, 30, 1, 4, 14);     -- Lemon juice, 1 tbsp

-- Recipe 8: Grilled Chicken Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(8, 7, 240, 1, 1),     -- Chicken breast, 240g
(8, 11, 2, 9, 2),      -- Salad leaves, 2 handful
(8, 23, 1, 5, 3),      -- Cucumber, 1 piece
(8, 24, 10, 5, 4),     -- Cherry tomatoes, 10 pieces
(8, 22, 2, 5, 5),      -- Carrot, 2 pieces
(8, 29, 1, 5, 6),      -- Lemon, 1 piece
(8, 59, 1, 4, 7),      -- Olive oil, 1 tbsp
(8, 33, 0.5, 7, 8),    -- Avocado, 0.5 medium
(8, 64, 150, 1, 9),    -- Chickpeas, 150g
(8, 39, 40, 1, 10);    -- Feta cheese, 40g

-- Recipe 9: Turkey Lettuce Cups with Feta & Nut Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(9, 8, 400, 1, 1),     -- Turkey mince, 400g
(9, 10, 8, 5, 2),      -- Lettuce leaves, 8 pieces
(9, 16, 2, 5, 3),      -- Red bell pepper, 2 pieces
(9, 13, 1, 10, 4),     -- Garlic, 1 clove
(9, 59, 3, 4, 5),      -- Olive oil, 3 tbsp
(9, 44, 0.25, 3, 6),   -- Salt, 0.25 tsp
(9, 45, 0.25, 3, 7),   -- Black pepper, 0.25 tsp
(9, 23, 0.5, 5, 8),    -- Cucumber, 0.5 piece
(9, 24, 6, 5, 9),      -- Cherry tomatoes, 6 pieces
(9, 18, 0.25, 5, 10),  -- Red onion, 0.25 piece
(9, 36, 40, 1, 11),    -- Greek yogurt, 40g
(9, 14, 20, 1, 12),    -- Ginger, 20g
(9, 30, 1, 4, 13);     -- Lemon juice, 1 tbsp

-- Recipe 10: Breaded Chicken with Garlic Veggies & Avocado
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(10, 7, 340, 1, 1),    -- Chicken breast, 340g
(10, 79, 0.25, 16, 2), -- Breadcrumbs, 0.25 cup
(10, 56, 1, 3, 3),     -- Garlic powder, 1 tsp
(10, 55, 0.5, 3, 4),   -- Onion powder, 0.5 tsp
(10, 46, 0.5, 3, 5),   -- Smoked paprika, 0.5 tsp
(10, 44, 0.75, 3, 6),  -- Salt, 0.75 tsp
(10, 45, 0.25, 3, 7),  -- Black pepper, 0.25 tsp
(10, 59, 2, 4, 8),     -- Olive oil, 2 tbsp
(10, 9, 1, 11, 9),     -- Broccoli, 1 head
(10, 22, 2, 5, 10),    -- Carrot, 2 pieces
(10, 13, 1, 10, 11),   -- Garlic, 1 clove
(10, 33, 1, 7, 12),    -- Avocado, 1 medium
(10, 88, 1, 3, 13),    -- Sesame seeds, 1 tsp
(10, 84, 15, 1, 14);   -- Almonds, 15g

-- Recipe 11: Chinese Chickpea & Tofu Curry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(11, 64, 240, 1, 1),   -- Chickpeas, 240g
(11, 6, 150, 1, 2),    -- Firm tofu, 150g
(11, 17, 1, 8, 3),     -- Onion, 1 large
(11, 13, 3, 10, 4),    -- Garlic, 3 cloves
(11, 14, 5, 1, 5),     -- Ginger, 5g
(11, 32, 1, 7, 6),     -- Banana, 1 medium
(11, 72, 2, 3, 7),     -- Soy sauce, 2 tsp
(11, 60, 1, 4, 8),     -- Tomato paste, 1 tbsp
(11, 76, 1, 3, 9),     -- Honey, 1 tsp
(11, 44, 1, 3, 10),    -- Salt, 1 tsp
(11, 57, 0.5, 3, 11),  -- Turmeric, 0.5 tsp
(11, 49, 0.5, 3, 12),  -- Cumin, 0.5 tsp
(11, 50, 0.25, 3, 13), -- Cinnamon, 0.25 tsp
(11, 52, 1, 5, 14),    -- Star anise, 1 piece
(11, 53, 1, 17, 15),   -- MSG, 1 pinch
(11, 90, 480, 2, 16),  -- Stock, 480ml
(11, 59, 2, 4, 17),    -- Olive oil, 2 tbsp
(11, 26, 400, 1, 18),  -- Sweet potato, 400g
(11, 41, 1, 16, 19),   -- Petit pois, 1 cup
(11, 45, 0.25, 3, 20); -- Black pepper, 0.25 tsp

-- Recipe 12: Mild Chicken & Chickpea Tikka Masala
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(12, 7, 250, 1, 1),    -- Chicken breast, 250g
(12, 64, 150, 1, 2),   -- Chickpeas, 150g
(12, 41, 1, 16, 3),    -- Petit pois, 1 cup
(12, 17, 1, 7, 4),     -- Onion, 1 medium
(12, 13, 3, 10, 5),    -- Garlic, 3 cloves
(12, 14, 10, 1, 6),    -- Ginger, 10g
(12, 60, 2, 4, 7),     -- Tomato paste, 2 tbsp
(12, 61, 1, 15, 8),    -- Tinned tomatoes, 1 tin
(12, 36, 75, 1, 9),    -- Greek yogurt, 75g
(12, 59, 1.5, 4, 10),  -- Olive oil, 1.5 tbsp
(12, 49, 1, 3, 11),    -- Cumin, 1 tsp
(12, 57, 0.5, 3, 12),  -- Turmeric, 0.5 tsp
(12, 46, 0.5, 3, 13),  -- Smoked paprika, 0.5 tsp
(12, 50, 0.25, 3, 14), -- Cinnamon, 0.25 tsp
(12, 44, 1, 3, 15),    -- Salt, 1 tsp
(12, 45, 0.25, 3, 16), -- Black pepper, 0.25 tsp
(12, 76, 0.5, 3, 17),  -- Honey, 0.5 tsp
(12, 54, 1, 3, 18);    -- Garam masala, 1 tsp

-- Recipe 13: Spicy Tofu Stir-Fry with Mushrooms & Nuts
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(13, 6, 400, 1, 1),    -- Firm tofu, 400g
(13, 59, 3, 4, 2),     -- Olive oil, 3 tbsp
(13, 13, 1, 10, 3),    -- Garlic, 1 clove
(13, 16, 1, 5, 4),     -- Red bell pepper, 1 piece
(13, 17, 1, 5, 5),     -- Onion, 1 piece
(13, 27, 150, 1, 6),   -- Mushrooms, 150g
(13, 72, 2, 4, 7),     -- Soy sauce, 2 tbsp
(13, 46, 0.5, 3, 8),   -- Smoked paprika, 0.5 tsp
(13, 47, 0.5, 3, 9),   -- Chili flakes, 0.5 tsp
(13, 85, 30, 1, 10);   -- Cashews, 30g

-- Recipe 14: Stir-Fried Chicken & Peppers with Tofu & Nuts
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(14, 7, 240, 1, 1),    -- Chicken breast, 240g
(14, 15, 1, 5, 2),     -- Green bell pepper, 1 piece
(14, 16, 1, 5, 3),     -- Red bell pepper, 1 piece
(14, 17, 1, 5, 4),     -- Onion, 1 piece
(14, 20, 300, 1, 5),   -- Pak choi, 300g
(14, 21, 2, 5, 6),     -- Celery, 2 pieces
(14, 27, 100, 1, 7),   -- Mushrooms, 100g
(14, 6, 100, 1, 8),    -- Firm tofu, 100g
(14, 38, 2, 6, 9),     -- Eggs, 2 small
(14, 85, 30, 1, 10),   -- Cashews, 30g
(14, 59, 2, 4, 11),    -- Olive oil, 2 tbsp
(14, 72, 1, 4, 12),    -- Soy sauce, 1 tbsp
(14, 73, 0.5, 4, 13),  -- Worcestershire sauce, 0.5 tbsp
(14, 14, 1, 3, 14),    -- Ginger, 1 tsp
(14, 13, 1, 10, 15),   -- Garlic, 1 clove
(14, 81, 1, 3, 16),    -- Corn flour, 1 tsp
(14, 88, 1, 3, 17),    -- Sesame seeds, 1 tsp
(14, 44, 0.5, 3, 18);  -- Salt, 0.5 tsp

-- Recipe 15: Tuscan Turkey Meatballs
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(15, 8, 300, 1, 1),    -- Turkey mince, 300g
(15, 66, 1, 15, 2),    -- Brown lentils, 1 tin
(15, 61, 1, 15, 3),    -- Tinned tomatoes, 1 tin
(15, 17, 1, 5, 4),     -- Onion, 1 piece
(15, 13, 3, 10, 5),    -- Garlic, 3 cloves
(15, 21, 2, 12, 6),    -- Celery, 2 stalks
(15, 22, 1, 5, 7),     -- Carrot, 1 piece
(15, 12, 60, 1, 8),    -- Spinach, 60g
(15, 43, 1, 4, 9),     -- Basil, 1 tbsp
(15, 67, 1, 4, 10),    -- Capers, 1 tbsp
(15, 59, 2, 4, 11),    -- Olive oil, 2 tbsp
(15, 44, 1, 3, 12),    -- Salt, 1 tsp
(15, 51, 1, 3, 13),    -- Sugar, 1 tsp
(15, 45, 0.25, 3, 14), -- Black pepper, 0.25 tsp
(15, 48, 1, 3, 15),    -- Italian seasoning, 1 tsp
(15, 90, 1, 16, 16),   -- Stock, 1 cup
(15, 26, 300, 1, 17);  -- Sweet potato, 300g

-- Recipe 16: Black Pepper Beef Stir Fry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(16, 3, 250, 1, 1),    -- Sirloin steak, 250g
(16, 45, 1, 4, 2),     -- Black pepper, 1 tbsp
(16, 72, 1, 4, 3),     -- Soy sauce, 1 tbsp
(16, 73, 0.5, 4, 4),   -- Worcestershire sauce, 0.5 tbsp
(16, 51, 0.5, 3, 5),   -- Sugar, 0.5 tsp
(16, 89, 1, 4, 6),     -- Water, 1 tbsp
(16, 81, 1, 3, 7),     -- Corn flour, 1 tsp
(16, 17, 0.5, 5, 8),   -- Onion, 0.5 piece
(16, 13, 2, 10, 9),    -- Garlic, 2 cloves
(16, 16, 1, 5, 10),    -- Red bell pepper, 1 piece
(16, 15, 1, 5, 11),    -- Green bell pepper, 1 piece
(16, 59, 1, 4, 12),    -- Olive oil, 1 tbsp
(16, 71, 1, 16, 13);   -- Jasmine rice, 1 cup

-- Recipe 17: Chicken & Pork Paella
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(17, 59, 50, 2, 1),    -- Olive oil, 50ml
(17, 7, 8, 5, 2),      -- Chicken breast, 8 pieces
(17, 4, 8, 18, 3),     -- Pork belly, 8 oz
(17, 16, 1, 5, 4),     -- Red bell pepper, 1 piece
(17, 15, 1, 5, 5),     -- Green bell pepper, 1 piece
(17, 41, 50, 1, 6),    -- Petit pois, 50g
(17, 42, 150, 1, 7),   -- Green beans frozen, 150g
(17, 65, 1, 15, 8),    -- Butter beans, 1 tin
(17, 13, 2, 10, 9),    -- Garlic, 2 cloves
(17, 46, 1, 3, 10),    -- Smoked paprika, 1 tsp
(17, 57, 0.5, 3, 11),  -- Turmeric, 0.5 tsp
(17, 63, 400, 1, 12),  -- Tomato sauce, 400g
(17, 70, 400, 1, 13),  -- Paella rice, 400g
(17, 89, 900, 2, 14),  -- Water, 900ml
(17, 28, 1, 5, 15);    -- Rosemary sprig, 1 piece

-- Recipe 18: Chorizo Pizza
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(18, 77, 450, 1, 1),   -- Plain flour, 450g
(18, 89, 240, 2, 2),   -- Water, 240ml
(18, 82, 1, 3, 3),     -- Dry yeast, 1 tsp
(18, 59, 4, 4, 4),     -- Olive oil, 4 tbsp
(18, 44, 2, 3, 5),     -- Salt, 2 tsp
(18, 63, 100, 1, 6),   -- Tomato sauce, 100g
(18, 40, 300, 1, 7),   -- Cheese, 300g
(18, 5, 100, 1, 8);    -- Chorizo, 100g

-- =============================================
-- RECIPE STEPS
-- =============================================

-- Recipe 1: Almond Flour Pancakes
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(1, 1, 'In a bowl, whisk eggs, milk, and vanilla extract.'),
(1, 2, 'Add almond flour and baking powder. Mix until a smooth batter forms.'),
(1, 3, 'Heat a non-stick pan over medium heat and lightly grease with oil or butter.'),
(1, 4, 'Pour small portions of batter to form 4-6 mini pancakes.'),
(1, 5, 'Cook for 2-3 minutes until bubbles form, then flip and cook another 1-2 minutes.'),
(1, 6, 'Serve warm with berries, sliced banana, a dollop of Greek yogurt, and a drizzle of honey if desired.');

-- Recipe 2: Monkey Moo
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(2, 1, 'Freeze Banana.'),
(2, 2, 'Blend everything until smooth.'),
(2, 3, 'Pinch of salt to enhance flavor.');

-- Recipe 3: Warm Oat Porridge with Berries & Nuts
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(3, 1, 'Set heat to 7/9. Bring milk, water, salt to boil.'),
(3, 2, 'Chop and salt the nuts.'),
(3, 3, 'Transfer oats to bowl. Add honey, peanut butter, nuts, and berries in that order.');

-- Recipe 4: Pancakes and Bacon
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(4, 1, 'Whisk flour and salt to taste in a bowl.'),
(4, 2, 'Crack in the eggs and add the milk. Whisk until smooth and lump-free.'),
(4, 3, 'Heat a non-stick pan and melt a little butter.'),
(4, 4, 'Pour in batter to form pancakes; cook until golden on one side, then flip.'),
(4, 5, 'Fry bacon separately until crispy.'),
(4, 6, 'Serve pancakes stacked with 6 slices of bacon per serving.'),
(4, 7, 'Drizzle with maple syrup and enjoy warm.');

-- Recipe 5: Argentine Beef Empanada Bites
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(5, 1, 'Mix flour and salt in a large bowl.'),
(5, 2, 'Rub in the cold butter or lard with your fingers until the mixture resembles breadcrumbs.'),
(5, 3, 'Add warm water a little at a time, mixing until a dough forms.'),
(5, 4, 'Knead for about 5 minutes until smooth. Cover and let rest for 30 minutes.'),
(5, 5, 'Roll out dough to 2-3mm thick and cut into 12cm circles. Keep covered until ready to fill.'),
(5, 6, 'Heat olive oil in a pan over medium heat.'),
(5, 7, 'Add onion and red pepper, cook until softened (5-7 minutes).'),
(5, 8, 'Add garlic, cook for 1 minute.'),
(5, 9, 'Add ground beef, break up and cook until browned.'),
(5, 10, 'Stir in paprika, cumin, salt, and pepper. Cook 1-2 minutes.'),
(5, 11, 'Add tomato paste and beef stock, stir well, and simmer for 5 minutes until slightly thickened but still moist.'),
(5, 12, 'Remove from heat and let cool slightly.'),
(5, 13, 'Mix in chopped boiled eggs and olives.'),
(5, 14, 'Place a spoonful of filling in the center of each dough circle. Fold over and seal the edges.'),
(5, 15, 'Place on a baking tray, brush with beaten egg.'),
(5, 16, 'Bake at 200C for 20-22 minutes until golden.'),
(5, 17, 'Serve warm.');

-- Recipe 6: Chicken & Black Bean Burrito
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(6, 1, 'Preheat the George Foreman grill.'),
(6, 2, 'Slice the chicken breast in half, coat with 1 tsp olive oil, smoked paprika, cumin, salt and pepper. Grill 4-6 minutes until cooked. Let rest and slice.'),
(6, 3, 'Mash black beans with 1 tbsp lime juice, 1/4 tsp smoked paprika, 1/4 tsp cumin and a pinch of salt. Set aside.'),
(6, 4, 'Heat 1 tsp olive oil in a pan. Finely chop 1/2 red onion, 1/2 white onion and 1/2 red pepper. Fry on medium heat for 4-5 minutes until soft.'),
(6, 5, 'Remove from heat. Stir in diced tomato, chopped jalapeno, 1 tsp lime juice, a pinch of salt, 1/8 tsp cumin and 1/8 tsp smoked paprika.'),
(6, 6, 'In a small bowl, mix Greek yogurt with 1 tsp lime juice, grated garlic, salt and pepper.'),
(6, 7, 'Slice lettuce and avocado.'),
(6, 8, 'Warm 2 flatbreads (60g each).'),
(6, 9, 'Assemble each wrap: spread mashed beans, add sliced chicken, spoon on warm onion-pepper mix, add lettuce and avocado, drizzle yogurt sauce.'),
(6, 10, 'Fold and serve immediately.');

-- Recipe 7: Fish Cakes with Leafy Salad & Sweet Potato
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(7, 1, 'Peel and cube the sweet potato. Roast in the oven at 200C for 25-30 minutes with a bit of olive oil and salt.'),
(7, 2, 'Poach the fish in simmering water for 5-6 minutes or until cooked through. Drain and cool.'),
(7, 3, 'Flake the fish into a bowl. Add finely chopped onion, garlic, lemon zest, almond flour, and beaten egg.'),
(7, 4, 'Season with salt and pepper. Mix well and form into 4 small fish cakes.'),
(7, 5, 'Chill for 10-15 minutes if time allows to help them hold shape.'),
(7, 6, 'Heat 1 tbsp olive oil in a non-stick pan over medium heat. Fry fish cakes for 3-4 minutes per side until golden and heated through.'),
(7, 7, 'Meanwhile, prepare the salad: toss mixed leaves with sliced cucumber and halved cherry tomatoes. Dress with lemon juice and 1 tbsp olive oil.'),
(7, 8, 'Serve 2 fish cakes per person alongside the salad and roasted sweet potato.');

-- Recipe 8: Grilled Chicken Salad
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(8, 1, 'Cook and slice the chicken breast. Let rest if made in advance.'),
(8, 2, 'Wash and prep the salad leaves, cucumber, tomatoes, and carrots.'),
(8, 3, 'Slice avocado and drain chickpeas.'),
(8, 4, 'Crumble feta over the vegetables.'),
(8, 5, 'In a small bowl, mix lemon juice and 1 tbsp olive oil for dressing.'),
(8, 6, 'Combine all ingredients in a large bowl and toss with dressing.'),
(8, 7, 'Top with grilled chicken and serve.');

-- Recipe 9: Turkey Lettuce Cups with Feta & Nut Salad
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(9, 1, 'Heat 1 tbsp olive oil in a pan over medium heat.'),
(9, 2, 'Add garlic and cook for 30 seconds.'),
(9, 3, 'Add turkey mince and cook until browned (6-8 minutes).'),
(9, 4, 'Add diced bell peppers, cook for 2-3 minutes. Season with salt and pepper.'),
(9, 5, 'Let mixture cool slightly. Wash and dry lettuce leaves.'),
(9, 6, 'Spoon the turkey mixture into the lettuce leaves.'),
(9, 7, 'To make the salad, slice cucumber, cherry tomatoes, and red onion.'),
(9, 8, 'Toss with 2 tbsp olive oil, lemon juice, chopped almonds, and crumbled feta.'),
(9, 9, 'Serve the lettuce cups with the salad on the side.');

-- Recipe 10: Breaded Chicken with Garlic Veggies & Avocado
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(10, 1, 'Preheat oven to 200C (392F).'),
(10, 2, 'Mix breadcrumbs, garlic powder, onion powder, paprika, salt, and pepper.'),
(10, 3, 'Brush chicken breasts with 1 tbsp olive oil.'),
(10, 4, 'Coat chicken in breadcrumb mixture and place on a baking sheet.'),
(10, 5, 'Bake chicken for 25 minutes, flipping halfway.'),
(10, 6, 'Cut broccoli into florets and slice carrots.'),
(10, 7, 'Toss vegetables with 1 tbsp olive oil, minced garlic, and a pinch of salt.'),
(10, 8, 'Roast veggies for 20-25 minutes with the chicken.'),
(10, 9, 'Slice avocado and divide between plates.'),
(10, 10, 'Top roasted vegetables with chopped nuts and sesame seeds.'),
(10, 11, 'Serve chicken with garlic veggies and avocado slices on the side.');

-- Recipe 11: Chinese Chickpea & Tofu Curry
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(11, 1, 'Preheat oven to 200C.'),
(11, 2, 'Preheat 2 pans, one for tofu and one for curry sauce.'),
(11, 3, 'Peel and cube the sweet potatoes. Toss with 1 tbsp olive oil and a pinch of salt.'),
(11, 4, 'Fry the tofu cubes until golden on all sides.'),
(11, 5, 'Put sweet potatoes in the oven for 30 minutes.'),
(11, 6, 'In a saucepan, heat 1 tbsp olive oil over medium heat. Add sliced onion and a pinch of salt; fry 5 minutes until softened.'),
(11, 7, 'Add minced garlic and grated ginger; cook 30 seconds.'),
(11, 8, 'Add banana, soy sauce, tomato puree, sugar, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(11, 9, 'Remove sauce and blend until smooth.'),
(11, 10, 'Return to pan. Add Anise Star.'),
(11, 11, 'Add chickpeas to the sauce and simmer for 20 minutes.'),
(11, 12, 'Add the fried tofu and peas to the curry sauce. Cook for another 5 minutes.'),
(11, 13, 'Serve hot with the roasted sweet potatoes.');

-- Recipe 12: Mild Chicken & Chickpea Tikka Masala
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(12, 1, 'Dice the onion, mince the garlic, and grate the ginger.'),
(12, 2, 'Cut chicken into bite-sized pieces and season lightly with salt and pepper.'),
(12, 3, 'Heat olive oil in a pan over medium heat. Add the chicken and onion together. Cook for 5-7 minutes until the onions soften and the chicken is lightly browned.'),
(12, 4, 'Add garlic and ginger. Cook for 30 seconds until fragrant.'),
(12, 5, 'Sprinkle in cumin, turmeric, smoked paprika, and cinnamon. Stir and toast the spices for 30 seconds.'),
(12, 6, 'Add tomato paste and cook for 1 minute to deepen the flavour.'),
(12, 7, 'Pour in the tinned tomatoes. Stir and let the sauce simmer gently for 8-10 minutes until it thickens slightly.'),
(12, 8, 'Add chickpeas and frozen peas. Simmer for another 3 minutes.'),
(12, 9, 'Reduce heat to low. Stir in the Greek yogurt slowly to prevent it from splitting.'),
(12, 10, 'Turn off the heat and add garam masala and honey (optional). Taste and adjust salt, pepper, or sweetness.'),
(12, 11, 'Serve with roasted vegetables, cauliflower rice, or a small portion of basmati rice if desired.');

-- Recipe 13: Spicy Tofu Stir-Fry with Mushrooms & Nuts
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(13, 1, 'Heat 1 tbsp olive oil or ghee in a pan and fry tofu until golden, about 20 minutes. Set aside.'),
(13, 2, 'Add 1 tbsp more oil to the pan, saute garlic for 30 seconds.'),
(13, 3, 'Add red pepper, onion, and mushrooms. Stir-fry for 4-5 minutes.'),
(13, 4, 'Return tofu to the pan. Add soy sauce, smoked paprika, and chili flakes.'),
(13, 5, 'Add final 1 tbsp of oil and the nuts. Stir well and cook for 1-2 more minutes.'),
(13, 6, 'Serve hot.');

-- Recipe 14: Stir-Fried Chicken & Peppers with Tofu & Nuts
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(14, 1, 'Slice chicken, peppers, onion, celery, pak choi, and mushrooms.'),
(14, 2, 'Toss everything with 1 tbsp olive oil and salt to marinate overnight.'),
(14, 3, 'Cut tofu into strips and pan-fry separately in a bit of oil until golden. Set aside.'),
(14, 4, 'Boil eggs, peel, and slice.'),
(14, 5, 'Stir-fry chicken and marinated veg for 4-5 minutes.'),
(14, 6, 'Add garlic, ginger, mushrooms; stir-fry 1 minute.'),
(14, 7, 'Add soy sauce and Worcestershire; stir.'),
(14, 8, 'Mix corn flour with water, add to pan, and thicken sauce.'),
(14, 9, 'Add tofu, sliced boiled eggs, and nuts. Toss briefly to warm through.'),
(14, 10, 'Sprinkle sesame seeds before serving.');

-- Recipe 15: Tuscan Turkey Meatballs
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(15, 1, 'Preheat oven to 200C (390F). Peel and cube the sweet potatoes. Toss with a pinch of salt and 1 tsp olive oil. Roast for 25-30 minutes until tender and golden. Set aside.'),
(15, 2, 'Finely chop half the onion, 1 clove garlic, and half the basil (if using leaves). In a bowl, mix with turkey mince, salt, and pepper.'),
(15, 3, 'Form the turkey mixture into small meatballs (about 12).'),
(15, 4, 'Finely chop the remaining onion, celery, carrot, and garlic.'),
(15, 5, 'Heat 1 tbsp olive oil in a large pan over medium heat. Add the chopped onion, celery, carrot, and a pinch of salt. Fry for 5-7 minutes until softened and lightly golden. Remove the veg from the pan and set aside.'),
(15, 6, 'Add a little more olive oil if needed, then fry the meatballs in the same pan until browned on all sides. Remove and set aside.'),
(15, 7, 'In a saucepan, heat 1 tbsp olive oil over medium heat. Add the remaining garlic and saute for 30 seconds until fragrant.'),
(15, 8, 'Add the capers and cook for another minute.'),
(15, 9, 'Add the tinned tomatoes, 1 tsp salt, 1 tsp sugar and Italian seasoning herbs. Stir and bring to a simmer.'),
(15, 10, 'Return the fried vegetables and meatballs to the sauce, along with the lentils. Stir to combine.'),
(15, 11, 'Add the stock and bring to a gentle simmer.'),
(15, 12, 'Cover and simmer everything together for 30 minutes on low heat.'),
(15, 13, 'Stir in the spinach and remaining basil (if using leaves) until wilted.'),
(15, 14, 'Serve the lentil and meatball stew hot with a portion of roasted sweet potatoes on the side or stirred through.');

-- Recipe 16: Black Pepper Beef Stir Fry
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(16, 1, 'Marinate the beef and leave it to rest for at least 15 min.'),
(16, 2, 'Prepare the sauce: mix black pepper, soy sauce, Worcestershire sauce, sugar, and 1 tbsp water. Set aside.'),
(16, 3, 'Heat 1 tbsp olive oil in a wok over high heat. Add the beef and stir-fry 1-2 min until browned. Remove and set aside.'),
(16, 4, 'In the same wok, add sliced onion and minced garlic. Stir-fry until fragrant. Add more oil if needed.'),
(16, 5, 'Add sliced red and green peppers. Stir-fry for 1 min.'),
(16, 6, 'Return the beef to the wok. Pour in the prepared sauce and mix well.'),
(16, 7, 'Stir in the cornstarch slurry (1 tsp cornstarch mixed with 1 tbsp water). Cook 30 sec until the sauce thickens and coats the beef and vegetables.'),
(16, 8, 'Serve hot with 1 cup cooked jasmine rice.');

-- Recipe 17: Chicken & Pork Paella
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(17, 1, 'Pour the olive oil into a paella pan and when hot, add all the meat and cook until browned.'),
(17, 2, 'Add the garlic (crushed or sliced) and the red and green peppers. Cook for 2 minutes and stir.'),
(17, 3, 'Add the tomato sauce and stir well.'),
(17, 4, 'Pour in the rice and stir to coat with the sauce.'),
(17, 5, 'Pour the water and stir very gently on high heat. Season with paprika, turmeric, and salt.'),
(17, 6, 'Once it starts to boil, stop stirring and add the green beans, butter beans, and rosemary to the middle of the pan.'),
(17, 7, 'Let the water absorb and keep the paella on the hob until fully cooked. Adjust seasoning.'),
(17, 8, 'Let it rest for 3-5 minutes. Before serving, break the paella by loosening the rice with a spoon.'),
(17, 9, 'If the rice is undercooked, cover with foil and bake at 200C for 5-10 min to finish cooking.');

-- Recipe 18: Chorizo Pizza
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(18, 1, 'Mix flour, yeast, and salt.'),
(18, 2, 'Add water and oil; knead 8-10 min. Rise 1 hour.'),
(18, 3, 'Preheat 230C.'),
(18, 4, 'Roll, sauce, top with cheese & chorizo. Bake 12-15 min.');

-- =============================================
-- RECIPE 19: Spiced Banana Curry with Rice (Linked to Recipe 11)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(19, 'Spiced Banana Curry with Chickpeas & Tofu (With Rice)', 2, 2120, FALSE, TRUE);

-- Recipe 19 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(19, 3);

-- Recipe 19 ingredients (same as recipe 11 + jasmine rice)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(19, 71, 180, 1, 1),   -- Jasmine rice, 180g (dry)
(19, 64, 240, 1, 2),   -- Chickpeas, 240g
(19, 6, 150, 1, 3),    -- Firm tofu, 150g
(19, 17, 1, 8, 4),     -- Onion, 1 large
(19, 13, 3, 10, 5),    -- Garlic, 3 cloves
(19, 14, 5, 1, 6),     -- Ginger, 5g
(19, 32, 1, 7, 7),     -- Banana, 1 medium
(19, 72, 2, 3, 8),     -- Soy sauce, 2 tsp
(19, 60, 1, 4, 9),     -- Tomato paste, 1 tbsp
(19, 76, 1, 3, 10),    -- Honey, 1 tsp
(19, 44, 1, 3, 11),    -- Salt, 1 tsp
(19, 57, 0.5, 3, 12),  -- Turmeric, 0.5 tsp
(19, 49, 0.5, 3, 13),  -- Cumin, 0.5 tsp
(19, 50, 0.25, 3, 14), -- Cinnamon, 0.25 tsp
(19, 52, 1, 5, 15),    -- Star anise, 1 piece
(19, 53, 1, 17, 16),   -- MSG, 1 pinch
(19, 90, 480, 2, 17),  -- Stock, 480ml
(19, 59, 2, 4, 18),    -- Olive oil, 2 tbsp
(19, 26, 400, 1, 19),  -- Sweet potato, 400g
(19, 41, 1, 16, 20),   -- Petit pois, 1 cup
(19, 45, 0.25, 3, 21); -- Black pepper, 0.25 tsp

-- Recipe 19 steps (same as recipe 11 + rice cooking)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(19, 1, 'Rinse the jasmine rice under cold water until water runs clear. Add to a pot with 360ml water, bring to boil, then reduce heat to low, cover and cook for 12-15 minutes. Let rest covered for 5 minutes.'),
(19, 2, 'Preheat oven to 200C.'),
(19, 3, 'Preheat 2 pans, one for tofu and one for curry sauce.'),
(19, 4, 'Peel and cube the sweet potatoes. Toss with 1 tbsp olive oil and a pinch of salt.'),
(19, 5, 'Fry the tofu cubes until golden on all sides.'),
(19, 6, 'Put sweet potatoes in the oven for 30 minutes.'),
(19, 7, 'In a saucepan, heat 1 tbsp olive oil over medium heat. Add sliced onion and a pinch of salt; fry 5 minutes until softened.'),
(19, 8, 'Add minced garlic and grated ginger; cook 30 seconds.'),
(19, 9, 'Add banana, soy sauce, tomato puree, sugar, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(19, 10, 'Remove sauce and blend until smooth.'),
(19, 11, 'Return to pan. Add Star Anise.'),
(19, 12, 'Add chickpeas to the sauce and simmer for 20 minutes.'),
(19, 13, 'Add the fried tofu and peas to the curry sauce. Cook for another 5 minutes.'),
(19, 14, 'Fluff the rice with a fork. Serve curry hot over jasmine rice with roasted sweet potatoes on the side.');

-- =============================================
-- RECIPE FAMILIES (Linked Recipe Variants)
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(1, 'Spiced Banana Curry', 'Aromatic banana curry with chickpeas and tofu - available with or without rice');

-- Link recipes to family
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(1, 19, TRUE, 'With Rice', 1),
(1, 11, FALSE, 'Without Rice', 2);

-- =============================================
-- TEST USER (development only)
-- =============================================
INSERT INTO users (email, name, google_id, is_admin, created_at) VALUES
('admin@foodbytes.test', 'Admin User', 'google_admin_test_id', TRUE, NOW());

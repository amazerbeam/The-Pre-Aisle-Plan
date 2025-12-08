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
(90, 'stock', 'Stock', 17),

-- Additional ingredients for new recipes
(91, 'bread_flour', 'Bread flour', 13),
(92, 'butter', 'Butter', 6),
(93, 'naan_bread', 'Naan bread', 13),
(94, 'basmati_rice', 'Basmati rice', 11);

-- =============================================
-- RECIPES
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
-- Breakfast
(1, 'Almond Flour Pancakes', 2, 745, FALSE, TRUE),
(2, 'Frozen Banana Whip', 2, 930, FALSE, TRUE),
(3, 'Protein Oats with Eggs & Greek Yogurt', 2, 1180, FALSE, TRUE),
(4, 'Buttermilk Pancake Stack with Streaky Bacon', 2, 1280, FALSE, TRUE),
-- Lunch
(5, 'Argentine Beef Empanada Bites', 2, 3086, FALSE, TRUE),
(6, 'Chicken & Black Bean Burrito', 2, 1070, FALSE, TRUE),
(7, 'Pan-Fried Fish Cakes with Lemon & Roasted Sweet Potato', 2, 1040, FALSE, TRUE),
(8, 'Lemon Chicken Salad with Feta & Chickpeas', 2, 1150, FALSE, TRUE),
(9, 'Turkish-Style Lettuce Wraps', 2, 1195, FALSE, TRUE),
-- Dinner
(10, 'Crispy Herb Chicken with Roasted Garlic Vegetables', 2, 1495, FALSE, TRUE),
(11, 'Spiced Chicken & Banana Curry', 2, 1400, FALSE, TRUE),
(12, 'Creamy Tikka Masala with Chickpeas', 2, 1205, FALSE, TRUE),
(13, 'Chili Crisp Chicken with Mushrooms & Cashews', 2, 1270, FALSE, TRUE),
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

-- Recipe 3: Protein Oats with Eggs & Greek Yogurt
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(3, 69, 80, 1, 1),     -- Rolled oats, 80g
(3, 37, 250, 2, 2),    -- Milk, 250ml
(3, 36, 200, 1, 3),    -- Greek yogurt, 200g
(3, 38, 6, 5, 4),      -- Eggs, 6 (scrambled on side)
(3, 34, 60, 1, 5),     -- Mixed berries, 60g
(3, 76, 1, 3, 6),      -- Honey, 1 tsp
(3, 44, 0.5, 3, 7),    -- Salt, 0.5 tsp
(3, 84, 15, 1, 8);     -- Almonds, 15g

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
(5, 92, 75, 1, 3),     -- Butter, 75g
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
(6, 7, 350, 1, 1),     -- Chicken breast, 350g
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
(7, 35, 400, 1, 1),    -- White fish, 400g
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

-- Recipe 11: Spiced Chicken & Banana Curry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(11, 7, 450, 1, 1),    -- Chicken breast, 450g
(11, 17, 1, 8, 2),     -- Onion, 1 large
(11, 13, 3, 10, 3),    -- Garlic, 3 cloves
(11, 14, 5, 1, 4),     -- Ginger, 5g
(11, 32, 1, 7, 5),     -- Banana, 1 medium
(11, 72, 2, 3, 6),     -- Soy sauce, 2 tsp
(11, 60, 1, 4, 7),     -- Tomato paste, 1 tbsp
(11, 76, 1, 3, 8),     -- Honey, 1 tsp
(11, 44, 1, 3, 9),     -- Salt, 1 tsp
(11, 57, 0.5, 3, 10),  -- Turmeric, 0.5 tsp
(11, 49, 0.5, 3, 11),  -- Cumin, 0.5 tsp
(11, 50, 0.25, 3, 12), -- Cinnamon, 0.25 tsp
(11, 52, 1, 5, 13),    -- Star anise, 1 piece
(11, 90, 400, 2, 14),  -- Stock, 400ml
(11, 59, 1.5, 4, 15),  -- Olive oil, 1.5 tbsp
(11, 26, 250, 1, 16),  -- Sweet potato, 250g (reduced)
(11, 45, 0.25, 3, 17); -- Black pepper, 0.25 tsp

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

-- Recipe 13: Chili Crisp Chicken with Mushrooms & Cashews
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(13, 7, 450, 1, 1),    -- Chicken breast, 450g
(13, 59, 2, 4, 2),     -- Olive oil, 2 tbsp
(13, 13, 2, 10, 3),    -- Garlic, 2 cloves
(13, 16, 1, 5, 4),     -- Red bell pepper, 1 piece
(13, 17, 1, 5, 5),     -- Onion, 1 piece
(13, 27, 200, 1, 6),   -- Mushrooms, 200g
(13, 72, 2, 4, 7),     -- Soy sauce, 2 tbsp
(13, 46, 0.5, 3, 8),   -- Smoked paprika, 0.5 tsp
(13, 47, 1, 3, 9),     -- Chili flakes, 1 tsp
(13, 85, 30, 1, 10),   -- Cashews, 30g
(13, 44, 0.5, 3, 11),  -- Salt, 0.5 tsp
(13, 45, 0.25, 3, 12); -- Black pepper, 0.25 tsp

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

-- Recipe 3: Protein Oats with Eggs & Greek Yogurt
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(3, 1, 'Bring milk and salt to a simmer. Add oats and cook 4-5 minutes, stirring.'),
(3, 2, 'While oats cook, scramble 6 eggs in a separate pan with a little butter.'),
(3, 3, 'Transfer oats to bowls. Top with Greek yogurt, berries, almonds, and honey.'),
(3, 4, 'Serve scrambled eggs on the side. Each person gets 3 eggs.');

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
(5, 17, 'Serve 5 empanadas per person warm. Each empanada should contain approximately 30g of filling. Freeze remaining empanadas for later.');

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

-- Recipe 11: Spiced Chicken & Banana Curry
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(11, 1, 'Preheat oven to 200C. Cube sweet potatoes, toss with a little oil and salt.'),
(11, 2, 'Roast sweet potatoes for 25-30 minutes until tender.'),
(11, 3, 'Cut chicken into bite-sized pieces. Season with salt and pepper.'),
(11, 4, 'Heat oil in a pan. Brown chicken pieces 5-6 minutes. Set aside.'),
(11, 5, 'In same pan, fry sliced onion 5 minutes until softened.'),
(11, 6, 'Add garlic and ginger; cook 30 seconds until fragrant.'),
(11, 7, 'Add banana, soy sauce, tomato paste, honey, turmeric, cumin, cinnamon, and stock.'),
(11, 8, 'Blend sauce until smooth. Return to pan with star anise.'),
(11, 9, 'Add chicken back to sauce. Simmer 15 minutes until chicken is cooked through.'),
(11, 10, 'Serve curry over roasted sweet potatoes.');

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

-- Recipe 13: Chili Crisp Chicken with Mushrooms & Cashews
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(13, 1, 'Slice chicken breast into strips. Season with salt, pepper, and smoked paprika.'),
(13, 2, 'Heat 1 tbsp oil in a wok or large pan over high heat. Stir-fry chicken 5-6 minutes until cooked. Set aside.'),
(13, 3, 'Add remaining oil. Sauté garlic 30 seconds until fragrant.'),
(13, 4, 'Add onion, red pepper, and mushrooms. Stir-fry 4-5 minutes until tender.'),
(13, 5, 'Return chicken to pan. Add soy sauce and chili flakes. Toss to combine.'),
(13, 6, 'Add cashews, stir through for 1 minute.'),
(13, 7, 'Serve immediately.');

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
-- RECIPE 20: Homemade Milk Bread (Toast)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(20, 'Homemade Milk Bread', 8, 1680, FALSE, TRUE);

-- Recipe 20 meal assignment (Breakfast, Snacks)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(20, 1), (20, 4);

-- Recipe 20 ingredients (user's exact recipe)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(20, 91, 400, 1, 1),   -- Bread flour, 400g
(20, 82, 1, 3, 2),     -- Dry yeast, 1 tsp
(20, 92, 20, 1, 3),    -- Butter, 20g
(20, 37, 290, 2, 4),   -- Milk, 290ml
(20, 51, 1, 4, 5),     -- Sugar, 1 tbsp
(20, 44, 1.5, 3, 6);   -- Salt, 1.5 tsp

-- Recipe 20 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(20, 1, 'Warm the milk to lukewarm (about 37C). Add sugar and stir to dissolve. Sprinkle yeast over and let sit 5-10 minutes until foamy.'),
(20, 2, 'In a large bowl or bread maker, combine flour and salt. Add the yeast mixture.'),
(20, 3, 'Melt the butter and add to the dough. Knead for 10 minutes until smooth and elastic (or use bread maker dough cycle).'),
(20, 4, 'Cover and let rise in a warm place for 1-1.5 hours until doubled in size.'),
(20, 5, 'Punch down the dough. Shape into a loaf and place in a greased 2lb loaf tin.'),
(20, 6, 'Cover and let rise for another 30-45 minutes until dough reaches top of tin.'),
(20, 7, 'Preheat oven to 180C (350F).'),
(20, 8, 'Bake for 30-35 minutes until golden brown and sounds hollow when tapped.'),
(20, 9, 'Let cool on a wire rack before slicing. Makes approximately 8 thick slices.');

-- =============================================
-- RECIPE 21: Classic Buttermilk Pancakes (Standard - no bacon)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(21, 'Classic Buttermilk Pancakes', 2, 980, FALSE, TRUE);

-- Recipe 21 meal assignment (Breakfast)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(21, 1);

-- Recipe 21 ingredients (standard pancakes with honey and berries)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(21, 77, 100, 1, 1),   -- Plain flour, 100g
(21, 38, 2, 6, 2),     -- Eggs, 2 small
(21, 37, 250, 2, 3),   -- Milk, 250ml
(21, 80, 1, 3, 4),     -- Baking powder, 1 tsp
(21, 92, 15, 1, 5),    -- Butter, 15g (for cooking)
(21, 76, 2, 4, 6),     -- Honey, 2 tbsp
(21, 34, 80, 1, 7),    -- Mixed berries, 80g
(21, 36, 60, 1, 8);    -- Greek yogurt, 60g

-- Recipe 21 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(21, 1, 'Sift flour and baking powder into a bowl. Make a well in the centre.'),
(21, 2, 'Crack in the eggs and add half the milk. Whisk from the centre, gradually incorporating flour.'),
(21, 3, 'Add remaining milk and whisk until smooth. Let batter rest 10 minutes.'),
(21, 4, 'Heat a non-stick pan over medium heat. Add a small knob of butter.'),
(21, 5, 'Pour small ladlefuls of batter to form pancakes. Cook until bubbles appear, then flip.'),
(21, 6, 'Cook for another minute until golden. Keep warm while making the rest.'),
(21, 7, 'Stack pancakes and serve with Greek yogurt, mixed berries, and a drizzle of honey.');

-- =============================================
-- RECIPE 22: Creamy Tikka Masala - Light (No Rice)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(22, 'Creamy Tikka Masala (Light - No Chickpeas)', 2, 1095, FALSE, TRUE);

-- Recipe 22 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(22, 3);

-- Recipe 22 ingredients (Light version - NO chickpeas, extra chicken for protein)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(22, 7, 350, 1, 1),    -- Chicken breast, 350g (extra to maintain protein)
(22, 41, 1, 16, 2),    -- Petit pois, 1 cup
(22, 17, 1, 7, 3),     -- Onion, 1 medium
(22, 13, 3, 10, 4),    -- Garlic, 3 cloves
(22, 14, 10, 1, 5),    -- Ginger, 10g
(22, 60, 2, 4, 6),     -- Tomato paste, 2 tbsp
(22, 61, 1, 15, 7),    -- Tinned tomatoes, 1 tin
(22, 36, 75, 1, 8),    -- Greek yogurt, 75g
(22, 59, 1.5, 4, 9),   -- Olive oil, 1.5 tbsp
(22, 49, 1, 3, 10),    -- Cumin, 1 tsp
(22, 57, 0.5, 3, 11),  -- Turmeric, 0.5 tsp
(22, 46, 0.5, 3, 12),  -- Smoked paprika, 0.5 tsp
(22, 50, 0.25, 3, 13), -- Cinnamon, 0.25 tsp
(22, 44, 1, 3, 14),    -- Salt, 1 tsp
(22, 45, 0.25, 3, 15), -- Black pepper, 0.25 tsp
(22, 76, 0.5, 3, 16),  -- Honey, 0.5 tsp
(22, 54, 1, 3, 17);    -- Garam masala, 1 tsp

-- Recipe 22 steps (Light version - no chickpeas)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(22, 1, 'Dice the onion, mince the garlic, and grate the ginger.'),
(22, 2, 'Cut chicken into bite-sized pieces and season lightly with salt and pepper.'),
(22, 3, 'Heat olive oil in a pan over medium heat. Add the chicken and onion together. Cook for 5-7 minutes.'),
(22, 4, 'Add garlic and ginger. Cook for 30 seconds until fragrant.'),
(22, 5, 'Sprinkle in cumin, turmeric, smoked paprika, and cinnamon. Stir and toast for 30 seconds.'),
(22, 6, 'Add tomato paste and cook for 1 minute.'),
(22, 7, 'Pour in the tinned tomatoes. Simmer for 8-10 minutes until thickened.'),
(22, 8, 'Add frozen peas. Simmer for another 3 minutes.'),
(22, 9, 'Reduce heat to low. Stir in Greek yogurt slowly.'),
(22, 10, 'Add garam masala and honey. Serve with roasted vegetables (Light version - no rice).');

-- =============================================
-- RECIPE 23: Creamy Tikka Masala - Full (With Rice & Naan)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(23, 'Creamy Tikka Masala with Rice & Naan', 2, 1755, FALSE, TRUE);

-- Recipe 23 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(23, 3);

-- Recipe 23 ingredients (Tikka + basmati rice + naan)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(23, 94, 150, 1, 1),   -- Basmati rice, 150g (dry)
(23, 7, 250, 1, 2),    -- Chicken breast, 250g
(23, 64, 150, 1, 3),   -- Chickpeas, 150g
(23, 41, 1, 16, 4),    -- Petit pois, 1 cup
(23, 17, 1, 7, 5),     -- Onion, 1 medium
(23, 13, 3, 10, 6),    -- Garlic, 3 cloves
(23, 14, 10, 1, 7),    -- Ginger, 10g
(23, 60, 2, 4, 8),     -- Tomato paste, 2 tbsp
(23, 61, 1, 15, 9),    -- Tinned tomatoes, 1 tin
(23, 36, 75, 1, 10),   -- Greek yogurt, 75g
(23, 59, 1.5, 4, 11),  -- Olive oil, 1.5 tbsp
(23, 49, 1, 3, 12),    -- Cumin, 1 tsp
(23, 57, 0.5, 3, 13),  -- Turmeric, 0.5 tsp
(23, 46, 0.5, 3, 14),  -- Smoked paprika, 0.5 tsp
(23, 50, 0.25, 3, 15), -- Cinnamon, 0.25 tsp
(23, 44, 1, 3, 16),    -- Salt, 1 tsp
(23, 45, 0.25, 3, 17), -- Black pepper, 0.25 tsp
(23, 76, 0.5, 3, 18),  -- Honey, 0.5 tsp
(23, 54, 1, 3, 19),    -- Garam masala, 1 tsp
(23, 93, 2, 5, 20);    -- Naan bread, 2 pieces

-- Recipe 23 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(23, 1, 'Rinse basmati rice until water runs clear. Cook with 300ml water, bring to boil, reduce heat, cover and cook 12 minutes. Rest 5 minutes.'),
(23, 2, 'Dice the onion, mince the garlic, and grate the ginger.'),
(23, 3, 'Cut chicken into bite-sized pieces and season with salt and pepper.'),
(23, 4, 'Heat olive oil. Add chicken and onion. Cook 5-7 minutes.'),
(23, 5, 'Add garlic, ginger, and spices. Cook 30 seconds.'),
(23, 6, 'Add tomato paste, cook 1 minute. Add tinned tomatoes, simmer 8-10 minutes.'),
(23, 7, 'Add chickpeas and peas. Simmer 3 minutes.'),
(23, 8, 'Stir in Greek yogurt slowly. Add garam masala and honey.'),
(23, 9, 'Warm the naan bread in oven or dry pan.'),
(23, 10, 'Serve curry over fluffy basmati rice with warm naan on the side.');

-- =============================================
-- RECIPE 24: Wok-Tossed Chicken - Light (No Rice)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(24, 'Wok-Tossed Chicken with Pak Choi (Light)', 2, 980, FALSE, TRUE);

-- Recipe 24 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(24, 3);

-- Recipe 24 ingredients (chicken, no rice - Light version)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(24, 7, 240, 1, 1),    -- Chicken breast, 240g (same protein as Standard)
(24, 15, 1, 5, 2),     -- Green bell pepper, 1 piece
(24, 16, 1, 5, 3),     -- Red bell pepper, 1 piece
(24, 17, 1, 5, 4),     -- Onion, 1 piece
(24, 20, 300, 1, 5),   -- Pak choi, 300g
(24, 21, 2, 5, 6),     -- Celery, 2 pieces
(24, 27, 100, 1, 7),   -- Mushrooms, 100g
(24, 85, 30, 1, 8),    -- Cashews, 30g
(24, 59, 2, 4, 9),     -- Olive oil, 2 tbsp
(24, 72, 1, 4, 10),    -- Soy sauce, 1 tbsp
(24, 73, 0.5, 4, 11),  -- Worcestershire sauce, 0.5 tbsp
(24, 14, 1, 3, 12),    -- Ginger, 1 tsp
(24, 13, 1, 10, 13),   -- Garlic, 1 clove
(24, 81, 1, 3, 14),    -- Corn flour, 1 tsp
(24, 88, 1, 3, 15),    -- Sesame seeds, 1 tsp
(24, 44, 0.5, 3, 16);  -- Salt, 0.5 tsp

-- Recipe 24 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(24, 1, 'Slice chicken breast into thin strips. Season with salt and pepper.'),
(24, 2, 'Slice peppers, onion, celery, pak choi, and mushrooms.'),
(24, 3, 'Heat oil in a wok over high heat. Stir-fry chicken 4-5 minutes until cooked through. Set aside.'),
(24, 4, 'Stir-fry vegetables 3-4 minutes. Add garlic and ginger, cook 30 seconds.'),
(24, 5, 'Add soy sauce and Worcestershire sauce.'),
(24, 6, 'Mix corn flour with 1 tbsp water, add to wok to thicken.'),
(24, 7, 'Return chicken to wok, add cashews. Toss to combine.'),
(24, 8, 'Sprinkle with sesame seeds and serve immediately (no rice for Light version).');

-- =============================================
-- RECIPE 25: Wok-Tossed Chicken with Rice (Full)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(25, 'Wok-Tossed Chicken with Cashews & Rice', 2, 1550, FALSE, TRUE);

-- Recipe 25 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(25, 3);

-- Recipe 25 ingredients (chicken + rice)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(25, 71, 150, 1, 1),   -- Jasmine rice, 150g (dry)
(25, 7, 240, 1, 2),    -- Chicken breast, 240g
(25, 15, 1, 5, 3),     -- Green bell pepper, 1 piece
(25, 16, 1, 5, 4),     -- Red bell pepper, 1 piece
(25, 17, 1, 5, 5),     -- Onion, 1 piece
(25, 20, 300, 1, 6),   -- Pak choi, 300g
(25, 21, 2, 5, 7),     -- Celery, 2 pieces
(25, 27, 100, 1, 8),   -- Mushrooms, 100g
(25, 6, 100, 1, 9),    -- Firm tofu, 100g
(25, 38, 2, 6, 10),    -- Eggs, 2 small
(25, 85, 30, 1, 11),   -- Cashews, 30g
(25, 59, 2, 4, 12),    -- Olive oil, 2 tbsp
(25, 72, 1, 4, 13),    -- Soy sauce, 1 tbsp
(25, 73, 0.5, 4, 14),  -- Worcestershire sauce, 0.5 tbsp
(25, 14, 1, 3, 15),    -- Ginger, 1 tsp
(25, 13, 1, 10, 16),   -- Garlic, 1 clove
(25, 81, 1, 3, 17),    -- Corn flour, 1 tsp
(25, 88, 1, 3, 18),    -- Sesame seeds, 1 tsp
(25, 44, 0.5, 3, 19);  -- Salt, 0.5 tsp

-- Recipe 25 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(25, 1, 'Rinse rice, cook with 300ml water. Bring to boil, reduce heat, cover 12-15 minutes. Rest 5 minutes.'),
(25, 2, 'Slice chicken, peppers, onion, celery, pak choi, and mushrooms. Marinate chicken with salt.'),
(25, 3, 'Cube and pan-fry tofu until golden. Set aside.'),
(25, 4, 'Boil eggs, peel, and slice.'),
(25, 5, 'Stir-fry chicken and vegetables 4-5 minutes in hot wok.'),
(25, 6, 'Add garlic, ginger, mushrooms; cook 1 minute.'),
(25, 7, 'Add soy sauce and Worcestershire sauce.'),
(25, 8, 'Thicken with corn flour mixed with water.'),
(25, 9, 'Add tofu, eggs, and cashews. Toss briefly.'),
(25, 10, 'Serve over jasmine rice, sprinkled with sesame seeds.');

-- =============================================
-- RECIPE 26: Tuscan Turkey Meatballs - Light (No Sweet Potato)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(26, 'Tuscan Turkey Meatballs (Light)', 2, 1150, FALSE, TRUE);

-- Recipe 26 meal assignment (Dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(26, 3);

-- Recipe 26 ingredients (same as 15 but without sweet potato)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(26, 8, 300, 1, 1),    -- Turkey mince, 300g
(26, 66, 1, 15, 2),    -- Brown lentils, 1 tin
(26, 61, 1, 15, 3),    -- Tinned tomatoes, 1 tin
(26, 17, 1, 5, 4),     -- Onion, 1 piece
(26, 13, 3, 10, 5),    -- Garlic, 3 cloves
(26, 21, 2, 12, 6),    -- Celery, 2 stalks
(26, 22, 1, 5, 7),     -- Carrot, 1 piece
(26, 12, 80, 1, 8),    -- Spinach, 80g (extra for bulk)
(26, 43, 1, 4, 9),     -- Basil, 1 tbsp
(26, 67, 1, 4, 10),    -- Capers, 1 tbsp
(26, 59, 2, 4, 11),    -- Olive oil, 2 tbsp
(26, 44, 1, 3, 12),    -- Salt, 1 tsp
(26, 76, 1, 3, 13),    -- Honey, 1 tsp (instead of sugar)
(26, 45, 0.25, 3, 14), -- Black pepper, 0.25 tsp
(26, 48, 1, 3, 15),    -- Italian seasoning, 1 tsp
(26, 90, 1, 16, 16);   -- Stock, 1 cup

-- Recipe 26 steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(26, 1, 'Finely chop half the onion, 1 clove garlic, and basil. Mix with turkey mince, salt, and pepper. Form into 12 meatballs.'),
(26, 2, 'Chop remaining onion, celery, carrot, and garlic.'),
(26, 3, 'Heat 1 tbsp olive oil. Fry vegetables 5-7 minutes. Remove and set aside.'),
(26, 4, 'Brown meatballs in same pan. Remove and set aside.'),
(26, 5, 'Heat remaining oil, saute garlic 30 seconds. Add capers 1 minute.'),
(26, 6, 'Add tinned tomatoes, salt, honey, and Italian seasoning. Simmer.'),
(26, 7, 'Return vegetables and meatballs. Add lentils and stock.'),
(26, 8, 'Simmer covered 30 minutes.'),
(26, 9, 'Stir in spinach until wilted. Serve hot.');

-- =============================================
-- RECIPE FAMILIES (Linked Recipe Variants)
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(1, 'Spiced Banana Curry', 'Aromatic banana curry with chickpeas and tofu - Light without rice, Full with rice'),
(2, 'Buttermilk Pancakes', 'Classic American pancakes - Light with almond flour, Standard with honey & berries, Full with streaky bacon'),
(3, 'Creamy Tikka Masala', 'Rich and creamy chicken tikka - Light without carbs, Standard with chickpeas, Full with rice & naan'),
(4, 'Wok-Tossed Stir Fry', 'Asian stir fry with cashews - Light tofu version, Standard chicken, Full with rice'),
(5, 'Tuscan Turkey Meatballs', 'Italian-style meatballs in tomato sauce - Light without potato, Full with sweet potato'),
(6, 'Empanadas', 'Hand-held pastry parcels - Beef Standard, Mushroom & Chicken with cashew cream');

-- Link recipes to families using Light/Standard/Full labels
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
-- Banana Curry Family
(1, 11, FALSE, 'Light', 2),
(1, 19, TRUE, 'Standard', 1),
-- Pancake Family
(2, 1, FALSE, 'Light', 2),
(2, 21, TRUE, 'Standard', 1),
(2, 4, FALSE, 'Full', 3),
-- Tikka Masala Family
(3, 22, FALSE, 'Light', 2),
(3, 12, TRUE, 'Standard', 1),
(3, 23, FALSE, 'Full', 3),
-- Stir Fry Family
(4, 24, FALSE, 'Light', 2),
(4, 14, TRUE, 'Standard', 1),
(4, 25, FALSE, 'Full', 3),
-- Turkey Meatballs Family
(5, 26, FALSE, 'Light', 2),
(5, 15, TRUE, 'Standard', 1),
-- Empanadas Family (recipe 36 added after it's created below)
(6, 5, TRUE, 'Beef', 1);

-- =============================================
-- NEW INGREDIENTS FOR LUNCH RECIPES
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Grains (aisle 11)
(95, 'quinoa', 'Quinoa', 11),
-- Veg (aisle 3)
(96, 'red_cabbage', 'Red cabbage', 3),
(97, 'white_cabbage', 'White cabbage', 3),
(98, 'rocket', 'Rocket (arugula)', 3),
(99, 'baby_potatoes', 'Baby potatoes', 3),
(100, 'green_beans_fresh', 'Green beans (fresh)', 3),
-- Fish (aisle 5)
(101, 'salmon', 'Salmon fillet', 5),
(102, 'tinned_tuna', 'Tinned tuna (in olive oil)', 5),
-- Dairy (aisle 6)
(103, 'parmesan', 'Parmesan cheese', 6),
-- Herbs & Spices (aisle 8)
(104, 'fresh_parsley', 'Fresh parsley', 8),
(105, 'dried_oregano', 'Dried oregano', 8),
(106, 'fresh_coriander', 'Fresh coriander', 8),
(107, 'bay_leaf', 'Bay leaf', 8),
(108, 'dried_thyme', 'Dried thyme', 8),
-- Oils (aisle 9)
(109, 'sesame_oil', 'Sesame oil (toasted)', 9),
-- Tins & Jars (aisle 10)
(110, 'kalamata_olives', 'Kalamata olives', 10),
(111, 'black_olives', 'Black olives', 10),
-- Condiments (aisle 12)
(112, 'rice_vinegar', 'Rice vinegar', 12),
(113, 'balsamic_vinegar', 'Balsamic vinegar', 12),
(114, 'dijon_mustard', 'Dijon mustard', 12),
(115, 'red_wine_vinegar', 'Red wine vinegar', 12);

-- =============================================
-- RECIPE 27: Greek Chicken Power Bowl (Standard)
-- Office lunch - travels cold
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(27, 'Greek Chicken Power Bowl', 2, 1178, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(27, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(27, 7, 400, 1, 1),    -- Chicken breast, 400g
(27, 95, 150, 1, 2),   -- Quinoa (dry), 150g
(27, 23, 150, 1, 3),   -- Cucumber, 150g
(27, 24, 200, 1, 4),   -- Cherry tomatoes, 200g
(27, 39, 60, 1, 5),    -- Feta cheese, 60g
(27, 110, 40, 1, 6),   -- Kalamata olives, 40g
(27, 18, 50, 1, 7),    -- Red onion, 50g
(27, 104, 20, 1, 8),   -- Fresh parsley, 20g
(27, 59, 2, 4, 9),     -- Olive oil, 2 tbsp
(27, 30, 2, 4, 10),    -- Lemon juice, 2 tbsp
(27, 13, 1, 10, 11),   -- Garlic, 1 clove
(27, 105, 1, 3, 12),   -- Dried oregano, 1 tsp
(27, 44, 1, 3, 13),    -- Salt, 1 tsp
(27, 45, 0.5, 3, 14);  -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(27, 1, 'Rinse quinoa and cook with 300ml water: bring to boil, reduce heat, cover 15 minutes. Fluff and cool.'),
(27, 2, 'Season chicken with salt, pepper, oregano. Grill or pan-fry in 1 tsp olive oil until cooked through (165°F internal). Rest 5 minutes, slice.'),
(27, 3, 'Make dressing: Whisk remaining olive oil, lemon juice, minced garlic, oregano, salt, pepper.'),
(27, 4, 'Dice cucumber, halve cherry tomatoes, thinly slice red onion, crumble feta.'),
(27, 5, 'Divide cooled quinoa between 2 containers.'),
(27, 6, 'Top with sliced chicken, cucumber, tomatoes, feta, olives, red onion.'),
(27, 7, 'Pack dressing separately in small container.'),
(27, 8, 'Add fresh parsley just before eating. Travels well cold for 3-4 days.');

-- =============================================
-- RECIPE 28: Greek Chicken Power Bowl (Light - No Quinoa)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(28, 'Greek Chicken Power Bowl (Light)', 2, 818, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(28, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(28, 7, 400, 1, 1),    -- Chicken breast, 400g
(28, 23, 200, 1, 2),   -- Cucumber, 200g (extra)
(28, 24, 250, 1, 3),   -- Cherry tomatoes, 250g (extra)
(28, 39, 60, 1, 4),    -- Feta cheese, 60g
(28, 110, 40, 1, 5),   -- Kalamata olives, 40g
(28, 18, 50, 1, 6),    -- Red onion, 50g
(28, 11, 100, 1, 7),   -- Salad leaves, 100g (added for volume)
(28, 104, 20, 1, 8),   -- Fresh parsley, 20g
(28, 59, 2, 4, 9),     -- Olive oil, 2 tbsp
(28, 30, 2, 4, 10),    -- Lemon juice, 2 tbsp
(28, 13, 1, 10, 11),   -- Garlic, 1 clove
(28, 105, 1, 3, 12),   -- Dried oregano, 1 tsp
(28, 44, 1, 3, 13),    -- Salt, 1 tsp
(28, 45, 0.5, 3, 14);  -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(28, 1, 'Season chicken with salt, pepper, oregano. Grill or pan-fry in 1 tsp olive oil until cooked through. Rest 5 minutes, slice.'),
(28, 2, 'Make dressing: Whisk remaining olive oil, lemon juice, minced garlic, oregano, salt, pepper.'),
(28, 3, 'Dice cucumber, halve cherry tomatoes, thinly slice red onion, crumble feta.'),
(28, 4, 'Divide salad leaves between 2 containers.'),
(28, 5, 'Top with sliced chicken, cucumber, tomatoes, feta, olives, red onion.'),
(28, 6, 'Pack dressing separately. Add parsley before eating.');

-- =============================================
-- RECIPE 29: Asian Sesame Chicken Salad (Standard)
-- Office lunch - travels cold, cabbage stays crunchy
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(29, 'Asian Sesame Chicken Salad', 2, 960, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(29, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(29, 7, 400, 1, 1),    -- Chicken breast, 400g
(29, 96, 200, 1, 2),   -- Red cabbage, 200g
(29, 97, 200, 1, 3),   -- White cabbage, 200g
(29, 22, 120, 1, 4),   -- Carrots, 120g (2 medium)
(29, 19, 40, 1, 5),    -- Spring onions, 40g
(29, 16, 100, 1, 6),   -- Red bell pepper, 100g
(29, 106, 30, 1, 7),   -- Fresh coriander, 30g
(29, 88, 2, 4, 8),     -- Sesame seeds, 2 tbsp
(29, 109, 1.5, 4, 9),  -- Sesame oil (toasted), 1.5 tbsp
(29, 72, 1, 4, 10),    -- Soy sauce (Kikkoman), 1 tbsp
(29, 112, 1, 4, 11),   -- Rice vinegar, 1 tbsp
(29, 76, 1, 3, 12),    -- Honey, 1 tsp
(29, 13, 1, 10, 13),   -- Garlic, 1 clove
(29, 14, 10, 1, 14),   -- Ginger, 10g
(29, 59, 1, 3, 15),    -- Olive oil (for cooking), 1 tsp
(29, 44, 0.5, 3, 16);  -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(29, 1, 'Season chicken with salt. Grill or pan-fry in olive oil until cooked through. Rest, then slice or shred.'),
(29, 2, 'Finely shred both cabbages. Julienne the carrots. Slice spring onions and red pepper thinly.'),
(29, 3, 'Make dressing: Whisk sesame oil, soy sauce, rice vinegar, honey, minced garlic, grated ginger.'),
(29, 4, 'Toast sesame seeds in a dry pan until golden (2 minutes). Set aside.'),
(29, 5, 'Combine all vegetables in a large bowl or divide between containers.'),
(29, 6, 'Top with sliced chicken and toasted sesame seeds.'),
(29, 7, 'Pack dressing separately. Keeps 4-5 days - cabbage stays crunchy unlike lettuce.'),
(29, 8, 'Add fresh coriander just before eating.');

-- =============================================
-- RECIPE 30: Honey Garlic Salmon & Greens (Standard)
-- Office lunch - reheats well, or eat at home fresh
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(30, 'Honey Garlic Salmon & Greens', 2, 1080, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(30, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(30, 101, 400, 1, 1),  -- Salmon fillets, 400g (200g each)
(30, 76, 1, 4, 2),     -- Honey, 1 tbsp
(30, 13, 2, 10, 3),    -- Garlic, 2 cloves
(30, 72, 1, 4, 4),     -- Soy sauce (Kikkoman), 1 tbsp
(30, 109, 1, 3, 5),    -- Sesame oil, 1 tsp
(30, 31, 1, 4, 6),     -- Lime juice, 1 tbsp
(30, 9, 200, 1, 7),    -- Broccoli (tenderstem), 200g
(30, 20, 200, 1, 8),   -- Pak choi, 200g
(30, 59, 1, 3, 9),     -- Olive oil, 1 tsp
(30, 44, 0.5, 3, 10),  -- Salt, 0.5 tsp
(30, 45, 0.25, 3, 11); -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(30, 1, 'Mix honey, minced garlic, soy sauce, sesame oil, and lime juice in a bowl.'),
(30, 2, 'Place salmon in a baking dish, pour marinade over. Let sit 10 minutes (or marinate overnight in fridge).'),
(30, 3, 'Preheat oven to 200°C (400°F).'),
(30, 4, 'Bake salmon for 12-15 minutes until it flakes easily with a fork.'),
(30, 5, 'Meanwhile, steam or stir-fry broccoli and pak choi with olive oil and a pinch of salt until tender-crisp (3-4 minutes).'),
(30, 6, 'Serve salmon over greens, spoon remaining glaze from the dish on top.'),
(30, 7, 'For office: Pack salmon and greens separately. Reheat salmon loosely covered for 2 minutes in microwave.');

-- =============================================
-- RECIPE 31: Chicken & Vegetable Soup (Standard)
-- Office lunch - reheats perfectly, freezer-friendly
-- Dutch oven recipe
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(31, 'Chicken & Vegetable Soup', 4, 900, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(31, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(31, 7, 400, 1, 1),    -- Chicken breast, 400g
(31, 59, 1, 4, 2),     -- Olive oil, 1 tbsp
(31, 17, 150, 1, 3),   -- Onion, 150g (1 large)
(31, 21, 150, 1, 4),   -- Celery, 150g (3 stalks)
(31, 22, 150, 1, 5),   -- Carrots, 150g (2 medium)
(31, 13, 3, 10, 6),    -- Garlic, 3 cloves
(31, 90, 1000, 2, 7),  -- Stock (homemade), 1000ml
(31, 100, 200, 1, 8),  -- Green beans (fresh), 200g
(31, 12, 100, 1, 9),   -- Spinach, 100g
(31, 107, 1, 5, 10),   -- Bay leaf, 1 piece
(31, 108, 1, 3, 11),   -- Dried thyme, 1 tsp
(31, 30, 1, 4, 12),    -- Lemon juice, 1 tbsp
(31, 44, 1, 3, 13),    -- Salt, 1 tsp
(31, 45, 0.5, 3, 14);  -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(31, 1, 'Heat olive oil in dutch oven over medium heat.'),
(31, 2, 'Dice onion, celery, and carrots. Add to pot, sauté 5 minutes until softened.'),
(31, 3, 'Add minced garlic, cook 30 seconds until fragrant.'),
(31, 4, 'Add whole chicken breasts, stock, bay leaf, thyme, salt, and pepper.'),
(31, 5, 'Bring to boil, reduce heat, cover. Simmer 20 minutes until chicken is cooked through.'),
(31, 6, 'Remove chicken to a board. Shred with two forks.'),
(31, 7, 'Cut green beans into 2-inch pieces. Add to pot, cook 5 minutes.'),
(31, 8, 'Return shredded chicken to pot. Add spinach, stir until wilted.'),
(31, 9, 'Remove bay leaf. Stir in lemon juice. Taste and adjust seasoning.'),
(31, 10, 'For 50g protein per serving, eat 2 portions (450 cal each). Freezes well for 3 months.');

-- =============================================
-- RECIPE 32: Steak & Rocket Salad (Light)
-- Home lunch - best fresh off the pan
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(32, 'Steak & Rocket Salad', 2, 940, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(32, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(32, 3, 350, 1, 1),    -- Sirloin steak, 350g
(32, 98, 150, 1, 2),   -- Rocket, 150g
(32, 24, 100, 1, 3),   -- Cherry tomatoes, 100g
(32, 103, 40, 1, 4),   -- Parmesan, 40g (shaved)
(32, 59, 1, 4, 5),     -- Olive oil, 1 tbsp
(32, 113, 1, 4, 6),    -- Balsamic vinegar, 1 tbsp
(32, 44, 1, 3, 7),     -- Salt, 1 tsp
(32, 45, 0.5, 3, 8);   -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(32, 1, 'Remove steak from fridge 30 minutes before cooking.'),
(32, 2, 'Season both sides generously with salt and pepper.'),
(32, 3, 'Heat a pan to very hot. Add 1 tsp olive oil.'),
(32, 4, 'Cook steak 2-3 minutes per side for medium-rare (adjust for preferred doneness). Rest 5 minutes.'),
(32, 5, 'Toss rocket with remaining olive oil, balsamic vinegar, and a pinch of salt.'),
(32, 6, 'Slice steak against the grain into strips.'),
(32, 7, 'Divide rocket between plates. Top with sliced steak, halved cherry tomatoes, and parmesan shavings.'),
(32, 8, 'Best eaten fresh - steak loses quality when reheated.');

-- =============================================
-- RECIPE 33: Steak & Rocket Salad (Standard - with potatoes)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(33, 'Steak & Rocket Salad with Roast Potatoes', 2, 1240, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(33, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(33, 3, 350, 1, 1),    -- Sirloin steak, 350g
(33, 98, 150, 1, 2),   -- Rocket, 150g
(33, 24, 100, 1, 3),   -- Cherry tomatoes, 100g
(33, 103, 40, 1, 4),   -- Parmesan, 40g
(33, 99, 300, 1, 5),   -- Baby potatoes, 300g
(33, 59, 2, 4, 6),     -- Olive oil, 2 tbsp (1 for potatoes)
(33, 113, 1, 4, 7),    -- Balsamic vinegar, 1 tbsp
(33, 44, 1.5, 3, 8),   -- Salt, 1.5 tsp
(33, 45, 0.5, 3, 9);   -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(33, 1, 'Preheat oven to 200°C. Halve baby potatoes, toss with 1 tbsp olive oil and salt.'),
(33, 2, 'Roast potatoes for 25-30 minutes until golden and crispy.'),
(33, 3, 'Remove steak from fridge 30 minutes before cooking. Season well.'),
(33, 4, 'Cook steak in hot pan 2-3 minutes per side. Rest 5 minutes, then slice.'),
(33, 5, 'Toss rocket with remaining olive oil, balsamic, and salt.'),
(33, 6, 'Plate rocket, top with steak, tomatoes, parmesan, and roast potatoes on the side.');

-- =============================================
-- RECIPE 34: Tuna Niçoise (Light - no potatoes)
-- Office lunch - travels cold
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(34, 'Tuna Niçoise (Light)', 2, 958, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(34, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(34, 102, 320, 1, 1),  -- Tinned tuna (drained), 320g (2 tins)
(34, 38, 4, 5, 2),     -- Eggs, 4 pieces
(34, 100, 150, 1, 3),  -- Green beans (fresh), 150g
(34, 24, 100, 1, 4),   -- Cherry tomatoes, 100g
(34, 111, 40, 1, 5),   -- Black olives, 40g
(34, 11, 100, 1, 6),   -- Salad leaves, 100g
(34, 59, 1, 4, 7),     -- Olive oil, 1 tbsp
(34, 115, 1, 4, 8),    -- Red wine vinegar, 1 tbsp
(34, 114, 1, 3, 9),    -- Dijon mustard, 1 tsp
(34, 44, 0.5, 3, 10),  -- Salt, 0.5 tsp
(34, 45, 0.25, 3, 11); -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(34, 1, 'Boil eggs for 7-8 minutes for jammy yolks. Cool in ice water, peel, halve.'),
(34, 2, 'Blanch green beans in boiling water for 3 minutes. Refresh in cold water, drain.'),
(34, 3, 'Make dressing: Whisk olive oil, red wine vinegar, Dijon mustard, salt, pepper.'),
(34, 4, 'Drain tuna and flake into chunks.'),
(34, 5, 'Arrange salad leaves in containers or on plates.'),
(34, 6, 'Top with green beans, tuna, halved eggs, cherry tomatoes, and olives.'),
(34, 7, 'Pack dressing separately. Travels well cold for 2-3 days.');

-- =============================================
-- RECIPE 35: Tuna Niçoise (Standard - with potatoes)
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(35, 'Tuna Niçoise', 2, 1112, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(35, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(35, 102, 320, 1, 1),  -- Tinned tuna (drained), 320g
(35, 38, 4, 5, 2),     -- Eggs, 4 pieces
(35, 99, 200, 1, 3),   -- Baby potatoes, 200g
(35, 100, 150, 1, 4),  -- Green beans (fresh), 150g
(35, 24, 100, 1, 5),   -- Cherry tomatoes, 100g
(35, 111, 40, 1, 6),   -- Black olives, 40g
(35, 11, 100, 1, 7),   -- Salad leaves, 100g
(35, 59, 1, 4, 8),     -- Olive oil, 1 tbsp
(35, 115, 1, 4, 9),    -- Red wine vinegar, 1 tbsp
(35, 114, 1, 3, 10),   -- Dijon mustard, 1 tsp
(35, 44, 0.5, 3, 11),  -- Salt, 0.5 tsp
(35, 45, 0.25, 3, 12); -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(35, 1, 'Boil baby potatoes until tender (15 minutes). Cool, halve.'),
(35, 2, 'Boil eggs 7-8 minutes for jammy yolks. Cool in ice water, peel, halve.'),
(35, 3, 'Blanch green beans 3 minutes. Refresh in cold water.'),
(35, 4, 'Make dressing: Whisk olive oil, red wine vinegar, Dijon mustard, salt, pepper.'),
(35, 5, 'Drain tuna and flake into chunks.'),
(35, 6, 'Arrange salad leaves, top with potatoes, green beans, tuna, eggs, tomatoes, olives.'),
(35, 7, 'Drizzle dressing or pack separately. Classic French composed salad.');

-- =============================================
-- RECIPE 36: Mushroom & Chicken Empanada with Cashew Cream
-- Variant of Beef Empanadas - same dough, different filling
-- =============================================
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(36, 'Mushroom & Chicken Empanada with Cashew Cream', 2, 2780, FALSE, FALSE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(36, 2), -- Lunch
(36, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- Dough (same as beef empanadas)
(36, 77, 300, 1, 1),   -- Plain flour, 300g
(36, 44, 1, 3, 2),     -- Salt, 1 tsp
(36, 92, 75, 1, 3),    -- Butter, 75g
(36, 89, 120, 2, 4),   -- Water, 120ml
-- Filling
(36, 7, 350, 1, 5),    -- Chicken breast, 350g
(36, 27, 250, 1, 6),   -- Mushrooms, 250g
(36, 17, 100, 1, 7),   -- Onion, 100g
(36, 13, 2, 10, 8),    -- Garlic, 2 cloves
(36, 59, 1, 4, 9),     -- Olive oil, 1 tbsp
(36, 108, 1, 3, 10),   -- Dried thyme, 1 tsp
(36, 44, 0.5, 3, 11),  -- Salt, 0.5 tsp
(36, 45, 0.25, 3, 12), -- Black pepper, 0.25 tsp
-- Cashew Cream Sauce
(36, 85, 40, 1, 13),   -- Cashews, 40g
(36, 37, 100, 2, 14),  -- Milk, 100ml
(36, 13, 1, 10, 15),   -- Garlic, 1 clove (for sauce)
(36, 44, 0.25, 3, 16), -- Salt, 0.25 tsp (for sauce)
-- Egg wash
(36, 38, 1, 5, 17);    -- Egg, 1 piece

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(36, 1, 'DOUGH: Mix flour and salt. Rub in cold butter until breadcrumbs texture. Add yogurt and water, mix to form dough. Knead 5 minutes, cover, rest 30 minutes.'),
(36, 2, 'CASHEW CREAM: Soak cashews in boiling water for 15 minutes. Drain. Blend cashews, milk, garlic, and salt until completely smooth. Set aside.'),
(36, 3, 'FILLING: Dice chicken into small cubes. Finely chop mushrooms and onion.'),
(36, 4, 'Heat olive oil in a pan. Cook chicken until browned (5 minutes). Remove and set aside.'),
(36, 5, 'In same pan, cook onions until softened (3 minutes). Add mushrooms and thyme, cook until mushrooms release liquid and it evaporates (5-7 minutes).'),
(36, 6, 'Return chicken to pan. Pour in half the cashew cream. Stir well, season with salt and pepper. Let cool slightly.'),
(36, 7, 'Roll dough to 2-3mm thick. Cut 12cm circles. Place spoonful of filling in center.'),
(36, 8, 'Fold dough over, seal edges with fork. Place on baking tray, brush with beaten egg.'),
(36, 9, 'Bake at 200°C for 20-22 minutes until golden brown.'),
(36, 10, 'Serve with remaining cashew cream as dipping sauce. Makes approximately 8-10 empanadas, serve 4-5 per person.');

-- Add recipe 36 to Empanadas family (family 6 already exists)
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(6, 36, FALSE, 'Mushroom & Chicken', 2);

-- =============================================
-- RECIPE FAMILIES FOR NEW LUNCHES
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(7, 'Greek Chicken Power Bowl', 'Mediterranean bowl - Light no quinoa, Standard with quinoa'),
(8, 'Steak & Rocket Salad', 'Bistro salad - Light no potatoes, Standard with roast potatoes'),
(9, 'Tuna Niçoise', 'French composed salad - Light no potatoes, Standard with potatoes');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
-- Greek Chicken Bowl Family
(7, 27, TRUE, 'Standard', 1),
(7, 28, FALSE, 'Light', 2),
-- Steak Salad Family
(8, 33, TRUE, 'Standard', 1),
(8, 32, FALSE, 'Light', 2),
-- Tuna Niçoise Family
(9, 35, TRUE, 'Standard', 1),
(9, 34, FALSE, 'Light', 2);

-- =============================================
-- NEW RECIPES - December 2025
-- 12 New Recipes (4 Breakfast, 4 Lunch, 4 Dinner)
-- Following Chef Agent guidelines with Step 4b Validation
-- All ingredients validated for Tesco Ireland availability
-- =============================================

-- =============================================
-- NEW INGREDIENTS (IDs 116+)
-- All validated against Tesco Ireland availability
-- Note: Some ingredients may already exist in seed.sql with different IDs
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Proteins
(116, 'beef_mince_5', 'Beef mince (5% fat)', 1),
(117, 'pork_sausages', 'Pork sausages', 1),
(118, 'back_bacon', 'Back bacon rashers', 1),
(119, 'chicken_thigh', 'Chicken thigh (boneless)', 2),
-- Veg
(120, 'courgette', 'Courgette', 3),
(121, 'leek', 'Leek', 3),
(122, 'parsnip', 'Parsnip', 3),
(123, 'fresh_dill', 'Fresh dill', 3),
-- Dairy
(124, 'halloumi', 'Halloumi cheese', 6),
-- Tins
(125, 'tuna_in_brine', 'Tuna in brine', 10),
-- Beverages
(126, 'stout', 'Stout (Guinness)', 16),
(127, 'red_wine', 'Red wine', 16);

-- =============================================
-- BREAKFAST RECIPES (IDs 19-26)
-- =============================================

-- -----------------------------------------
-- RECIPE 19: Spanish Shakshuka (Standard)
-- Cuisine: Spanish/Middle Eastern
--
-- STEP 4b VALIDATION:


-- =============================================
-- RECIPE RESTRUCTURE - December 2025
-- 1. Oats Light variant (user's original)
-- 2. Banana Curry modular structure
-- 3. Tikka Masala modular structure + Cheat variant
-- =============================================

-- =============================================
-- PART 1: OATS RECIPE FAMILY
-- =============================================

-- Recipe 3 stays as "Protein Oats with Eggs & Greek Yogurt" (Standard)
-- Adding new Recipe 100: "Simple Porridge Oats" (Light - user's original)

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(100, 'Simple Porridge Oats', 2, 900, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(100, 1); -- Breakfast

-- User's original recipe:
-- 60g oats, 250ml milk, 150ml water, 80g berries, 1 tsp honey, 0.5 tsp salt, 1 tbsp peanut butter, 10g almonds, 10g walnuts
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(100, 69, 60, 1, 1),     -- Rolled oats, 60g
(100, 37, 250, 2, 2),    -- Milk, 250ml
(100, 89, 150, 2, 3),    -- Water, 150ml
(100, 34, 80, 1, 4),     -- Mixed berries, 80g
(100, 76, 1, 3, 5),      -- Honey, 1 tsp
(100, 44, 0.5, 3, 6),    -- Salt, 0.5 tsp
(100, 87, 1, 4, 7),      -- Peanut butter, 1 tbsp (15g)
(100, 84, 10, 1, 8),     -- Almonds, 10g
(100, 86, 10, 1, 9);     -- Walnuts, 10g

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(100, 1, 'Add oats, milk, water, and salt to a pot. Bring to a simmer.'),
(100, 2, 'Cook for 4-5 minutes, stirring occasionally, until creamy.'),
(100, 3, 'Transfer to bowls. Top with peanut butter, berries, almonds, and walnuts.'),
(100, 4, 'Drizzle with honey and serve warm.');

-- Nutrition per serving (450 cal per serving for 2 servings):
-- ~450 cal | ~12g protein | ~18g fat | ~58g carbs
-- This is the LIGHT variant - lower protein but good for light days

-- Create Oats family
INSERT INTO recipe_families (id, family_name, description) VALUES
(10, 'Porridge Oats', 'Warming oats - Light simple version, Standard with eggs & yogurt for protein');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(10, 100, FALSE, 'Light', 2),
(10, 3, TRUE, 'Standard', 1);

-- =============================================
-- PART 2: BANANA CURRY - MODULAR STRUCTURE
-- =============================================
-- The SAUCE is preserved exactly as specified
-- Protein, Carbs, Veg are separate components

-- First, create a "Sauce Base" concept by restructuring existing recipes

-- SAUCE RECIPE (base only - for reference, not standalone)
-- This documents the preserved sauce:
-- 1 large Onion, 3 cloves Garlic, 5g Ginger, 1 medium Banana
-- 2 tsp Soy sauce, 1 tbsp Tomato paste, 1 tsp Honey, 1 tsp Salt
-- 0.5 tsp Turmeric, 0.5 tsp Cumin, 0.3 tsp Cinnamon, 1 Star anise, 1 pinch MSG
-- 480ml Stock

-- Update existing Recipe 11 to be "Banana Curry - Chicken & Sweet Potato" (Standard)
-- Recipe 11 already has: Chicken 450g, Sweet Potato 250g - this is the STANDARD

-- Create Recipe 101: Banana Curry - Light (Chicken only, no carbs)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(101, 'Banana Curry - Light (Chicken & Greens)', 2, 1050, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(101, 3); -- Dinner

-- Same sauce + extra chicken + greens instead of sweet potato
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(101, 17, 1, 8, 1),      -- Onion, 1 large
(101, 13, 3, 10, 2),     -- Garlic, 3 cloves
(101, 14, 5, 1, 3),      -- Ginger, 5g
(101, 32, 1, 7, 4),      -- Banana, 1 medium
(101, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(101, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(101, 76, 1, 3, 7),      -- Honey, 1 tsp
(101, 44, 1, 3, 8),      -- Salt, 1 tsp
(101, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(101, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(101, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(101, 52, 1, 5, 12),     -- Star anise, 1 piece
(101, 53, 1, 17, 13),    -- MSG, 1 pinch
(101, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN (extra for Light)
(101, 7, 500, 1, 15),    -- Chicken breast, 500g (extra)
-- VEG (greens instead of sweet potato)
(101, 12, 200, 1, 16),   -- Spinach, 200g
(101, 9, 200, 1, 17),    -- Broccoli, 200g
-- COOKING
(101, 59, 1.5, 4, 18),   -- Olive oil, 1.5 tbsp
(101, 45, 0.25, 3, 19);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(101, 1, 'SAUCE: Slice onion, mince garlic, grate ginger.'),
(101, 2, 'Heat oil in a pan. Fry onion 5 minutes until softened.'),
(101, 3, 'Add garlic and ginger, cook 30 seconds.'),
(101, 4, 'Add banana, soy sauce, tomato paste, honey, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(101, 5, 'Blend sauce until smooth. Return to pan, add star anise.'),
(101, 6, 'PROTEIN: Cut chicken into bite-sized pieces. Season and brown in a separate pan.'),
(101, 7, 'Add chicken to sauce. Simmer 15-20 minutes until cooked through.'),
(101, 8, 'VEG: Steam broccoli and wilt spinach in the last 5 minutes.'),
(101, 9, 'Serve curry over bed of greens. Light version - no rice or sweet potato.');

-- Create Recipe 102: Banana Curry - Full (Chicken + Jasmine Rice)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(102, 'Banana Curry - Full (Chicken & Jasmine Rice)', 2, 1650, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(102, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(102, 17, 1, 8, 1),      -- Onion, 1 large
(102, 13, 3, 10, 2),     -- Garlic, 3 cloves
(102, 14, 5, 1, 3),      -- Ginger, 5g
(102, 32, 1, 7, 4),      -- Banana, 1 medium
(102, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(102, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(102, 76, 1, 3, 7),      -- Honey, 1 tsp
(102, 44, 1, 3, 8),      -- Salt, 1 tsp
(102, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(102, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(102, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(102, 52, 1, 5, 12),     -- Star anise, 1 piece
(102, 53, 1, 17, 13),    -- MSG, 1 pinch
(102, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN
(102, 7, 450, 1, 15),    -- Chicken breast, 450g
-- CARBS (Full - jasmine rice)
(102, 71, 180, 1, 16),   -- Jasmine rice, 180g (dry)
-- VEG
(102, 41, 150, 1, 17),   -- Petit pois, 150g
-- COOKING
(102, 59, 1.5, 4, 18),   -- Olive oil, 1.5 tbsp
(102, 45, 0.25, 3, 19);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(102, 1, 'RICE: Rinse jasmine rice until water runs clear. Cook with 360ml water. Bring to boil, reduce heat, cover 12-15 minutes. Rest 5 minutes.'),
(102, 2, 'SAUCE: Slice onion, mince garlic, grate ginger.'),
(102, 3, 'Heat oil in a pan. Fry onion 5 minutes until softened.'),
(102, 4, 'Add garlic and ginger, cook 30 seconds.'),
(102, 5, 'Add banana, soy sauce, tomato paste, honey, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(102, 6, 'Blend sauce until smooth. Return to pan, add star anise.'),
(102, 7, 'PROTEIN: Cut chicken into bite-sized pieces. Season and brown separately.'),
(102, 8, 'Add chicken to sauce. Simmer 15-20 minutes.'),
(102, 9, 'Add peas in last 5 minutes.'),
(102, 10, 'Serve curry over fluffy jasmine rice. Full version for high activity days.');

-- Create Recipe 103: Banana Curry - Tofu & Chickpea (Vegetarian Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(103, 'Banana Curry - Tofu & Chickpea', 2, 1400, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(103, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(103, 17, 1, 8, 1),      -- Onion, 1 large
(103, 13, 3, 10, 2),     -- Garlic, 3 cloves
(103, 14, 5, 1, 3),      -- Ginger, 5g
(103, 32, 1, 7, 4),      -- Banana, 1 medium
(103, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(103, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(103, 76, 1, 3, 7),      -- Honey, 1 tsp
(103, 44, 1, 3, 8),      -- Salt, 1 tsp
(103, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(103, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(103, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(103, 52, 1, 5, 12),     -- Star anise, 1 piece
(103, 53, 1, 17, 13),    -- MSG, 1 pinch
(103, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN (vegetarian)
(103, 6, 300, 1, 15),    -- Firm tofu, 300g
(103, 64, 240, 1, 16),   -- Chickpeas, 240g
-- CARBS
(103, 26, 300, 1, 17),   -- Sweet potato, 300g
-- VEG
(103, 41, 100, 1, 18),   -- Petit pois, 100g
-- COOKING
(103, 59, 2, 4, 19),     -- Olive oil, 2 tbsp
(103, 45, 0.25, 3, 20);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(103, 1, 'SWEET POTATO: Peel and cube. Roast at 200C for 30 minutes.'),
(103, 2, 'TOFU: Press and cube tofu. Pan-fry until golden on all sides. Set aside.'),
(103, 3, 'SAUCE: Make sauce as per standard method - onion, garlic, ginger, banana, spices, stock. Blend smooth.'),
(103, 4, 'Add chickpeas to sauce. Simmer 15 minutes.'),
(103, 5, 'Add fried tofu and peas. Cook 5 more minutes.'),
(103, 6, 'Serve over roasted sweet potato. Vegetarian protein option.');

-- Update Banana Curry Family
-- First delete existing family members for family 1
-- Then recreate with new structure
DELETE FROM recipe_family_members WHERE family_id = 1;

UPDATE recipe_families SET description = 'Aromatic banana curry with preserved sauce - Light (chicken & greens), Standard (chicken & sweet potato), Full (chicken & rice), Veggie (tofu & chickpea)' WHERE id = 1;

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(1, 101, FALSE, 'Light', 1),
(1, 11, TRUE, 'Standard', 2),
(1, 102, FALSE, 'Full', 3),
(1, 103, FALSE, 'Veggie', 4);

-- Remove recipe 19 from family (it's redundant with new structure)
-- Recipe 19 can be kept as standalone or deleted

-- =============================================
-- PART 3: TIKKA MASALA - MODULAR STRUCTURE
-- =============================================
-- THE SAUCE (Base for Light/Standard/Full):
-- Olive oil + onion + garlic + ginger
-- Spices: cumin, turmeric, smoked paprika, cinnamon, salt, pepper
-- Tomato paste + Tinned tomatoes
-- Greek yogurt (stirred in off heat)
-- Garam masala + honey (finishers)

-- Recipe 12 is current "Creamy Tikka Masala with Chickpeas" - make this Standard
-- Recipe 22 is "Creamy Tikka Masala (Light - No Chickpeas)" - keep as Light
-- Recipe 23 is "Creamy Tikka Masala with Rice & Naan" - keep as Full

-- Add Recipe 104: Traditional Butter Chicken Tikka (Cheat)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(104, 'Traditional Butter Chicken Tikka (Cheat)', 2, 1800, TRUE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(104, 3); -- Dinner

-- New ingredient for cream
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
(154, 'double_cream', 'Double cream', 6),
(155, 'kashmiri_chili', 'Kashmiri chili powder', 8),
(156, 'fenugreek_leaves', 'Dried fenugreek leaves (kasoori methi)', 8);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- MARINADE
(104, 7, 500, 1, 1),     -- Chicken breast, 500g (or thigh)
(104, 36, 100, 1, 2),    -- Greek yogurt, 100g (marinade)
(104, 155, 1, 3, 3),     -- Kashmiri chili powder, 1 tsp
(104, 54, 1, 3, 4),      -- Garam masala, 1 tsp
(104, 49, 1, 3, 5),      -- Cumin, 1 tsp
(104, 44, 1, 3, 6),      -- Salt, 1 tsp
(104, 30, 1, 4, 7),      -- Lemon juice, 1 tbsp
-- SAUCE BASE
(104, 92, 50, 1, 8),     -- Butter, 50g (traditional!)
(104, 59, 1, 4, 9),      -- Olive oil, 1 tbsp
(104, 17, 1, 8, 10),     -- Onion, 1 large
(104, 13, 4, 10, 11),    -- Garlic, 4 cloves
(104, 14, 15, 1, 12),    -- Ginger, 15g
(104, 60, 2, 4, 13),     -- Tomato paste, 2 tbsp
(104, 61, 1, 15, 14),    -- Tinned tomatoes, 1 tin
-- SPICES
(104, 57, 0.5, 3, 15),   -- Turmeric, 0.5 tsp
(104, 46, 1, 3, 16),     -- Smoked paprika, 1 tsp
(104, 50, 0.5, 3, 17),   -- Cinnamon, 0.5 tsp
(104, 45, 0.25, 3, 18),  -- Black pepper, 0.25 tsp
-- FINISHING (what makes it traditional/cheat)
(104, 154, 150, 2, 19),  -- Double cream, 150ml
(104, 156, 1, 4, 20),    -- Dried fenugreek leaves, 1 tbsp
(104, 76, 1, 3, 21),     -- Honey, 1 tsp
(104, 54, 0.5, 3, 22),   -- Garam masala, 0.5 tsp (finishing)
-- SERVE WITH
(104, 94, 200, 1, 23),   -- Basmati rice, 200g
(104, 93, 4, 5, 24);     -- Naan bread, 4 pieces

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(104, 1, 'MARINADE: Mix yogurt, Kashmiri chili, garam masala, cumin, salt, lemon juice. Coat chicken pieces. Marinate 2-24 hours.'),
(104, 2, 'COOK CHICKEN: Grill or pan-fry marinated chicken until charred and cooked through. Set aside.'),
(104, 3, 'SAUCE: Heat butter and oil in a pan. Fry sliced onion until deep golden (10-12 minutes).'),
(104, 4, 'Add garlic and ginger. Cook 2 minutes.'),
(104, 5, 'Add tomato paste, turmeric, paprika, cinnamon, pepper. Cook 1 minute.'),
(104, 6, 'Add tinned tomatoes. Simmer 15 minutes. Blend until smooth.'),
(104, 7, 'Return sauce to pan. Add cooked chicken pieces.'),
(104, 8, 'FINISH: Stir in double cream. Simmer 5 minutes. Do not boil.'),
(104, 9, 'Crush fenugreek leaves between palms, add to curry with honey and finishing garam masala.'),
(104, 10, 'SERVE: With basmati rice and warm naan. This is the CHEAT version - Friday only!');

-- Nutrition per serving:
-- ~900 cal | ~55g protein | ~45g fat | ~65g carbs
-- CHEAT - exceeds fat limit significantly due to butter and cream

-- Update Tikka Masala Family
DELETE FROM recipe_family_members WHERE family_id = 3;

UPDATE recipe_families SET description = 'Rich tikka masala - Light (no chickpeas), Standard (with chickpeas & peas), Full (rice & naan), Cheat (traditional butter chicken)' WHERE id = 3;

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(3, 22, FALSE, 'Light', 1),
(3, 12, TRUE, 'Standard', 2),
(3, 23, FALSE, 'Full', 3),
(3, 104, FALSE, 'Cheat', 4);

-- =============================================
-- PART 4: RECIPE AUDIT SUMMARY
-- =============================================
-- All recipes analyzed against diet plan guardrails:
-- Target: 550-650 cal/serving, >=45g protein, <=25g fat

-- BREAKFAST:
-- 1. Almond Flour Pancakes: 373 cal/serving - LIGHT (low cal)
-- 2. Frozen Banana Whip: 465 cal/serving - LIGHT (smoothie)
-- 3. Protein Oats (Standard): 590 cal/serving - STANDARD (good protein with eggs)
-- 4. Pancakes & Bacon: 640 cal/serving - FULL (high cal with bacon)
-- 100. Simple Porridge Oats (NEW): 450 cal/serving - LIGHT (user's original)

-- LUNCH:
-- 5. Empanadas: 1543 cal/serving - CHEAT! (pastry heavy)
-- 6. Burrito: 535 cal/serving - STANDARD
-- 7. Fish Cakes: 520 cal/serving - STANDARD
-- 8. Chicken Salad: 575 cal/serving - STANDARD
-- 9. Lettuce Wraps: 598 cal/serving - STANDARD
-- 27-35: Various bowls and salads - properly structured

-- DINNER:
-- 10. Crispy Herb Chicken: 748 cal/serving - needs FULL label
-- 11. Banana Curry: 700 cal/serving - STANDARD (now restructured)
-- 12. Tikka Masala: 603 cal/serving - STANDARD
-- 13. Chili Crisp Chicken: 635 cal/serving - STANDARD
-- 14. Wok-Tossed: 600 cal/serving - STANDARD
-- 15. Turkey Meatballs: 750 cal/serving - FULL
-- 16-18: Already marked as CHEAT

-- =============================================
-- SUMMARY OF CHANGES
-- =============================================
-- NEW RECIPES ADDED:
-- 100: Simple Porridge Oats (Light) - user's original oats recipe
-- 101: Banana Curry Light (Chicken & Greens)
-- 102: Banana Curry Full (Chicken & Jasmine Rice)
-- 103: Banana Curry Veggie (Tofu & Chickpea)
-- 104: Traditional Butter Chicken Tikka (Cheat)

-- NEW INGREDIENTS ADDED:
-- 154: Double cream
-- 155: Kashmiri chili powder
-- 156: Dried fenugreek leaves

-- FAMILY UPDATES:
-- Family 1 (Banana Curry): Now modular with 4 variants
-- Family 3 (Tikka Masala): Added Cheat variant
-- Family 10 (NEW): Porridge Oats family

-- SAUCE BASES PRESERVED:
-- Banana Curry: Onion, garlic, ginger, banana, soy, tomato paste, honey, spices, stock
-- Tikka Masala: Olive oil, onion, garlic, ginger, spices, tomato paste, tinned tomatoes, yogurt, garam masala, honey

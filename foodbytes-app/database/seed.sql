-- FoodBytes Database Seed Data (Normalized)
-- Populates lookup tables and sample data

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ===========================
-- SEED MEALS (4 meal types)
-- ===========================
INSERT INTO `meals` (`key`, `name`, `display_order`) VALUES
('BREAKFAST', 'Breakfast', 1),
('LUNCH', 'Lunch', 2),
('DINNER', 'Dinner', 3),
('SNACKS', 'Snacks', 4);

-- ===========================
-- SEED AISLES (17 total)
-- ===========================
INSERT INTO `aisles` (`key`, `name`, `display_order`) VALUES
('MEAT', 'Meat', 1),
('POULTRY', 'Poultry', 2),
('VEG', 'Veg', 3),
('FRUIT', 'Fruit', 4),
('FISH', 'Fish', 5),
('DAIRY', 'Dairy', 6),
('FROZEN', 'Frozen', 7),
('HERBS_SPICES', 'Herbs & Spices', 8),
('OILS', 'Oils & Fats', 9),
('TINS_JARS', 'Tins & Jars', 10),
('GRAINS_PASTA', 'Grains & Pasta', 11),
('CONDIMENTS', 'Condiments & Sauces', 12),
('BAKERY', 'Bakery', 13),
('NUTS', 'Nuts', 14),
('SEEDS', 'Seeds', 15),
('BEVERAGES', 'Beverages', 16),
('MISC', 'Misc', 17);

-- ===========================
-- SEED UNITS (23 total)
-- ===========================
INSERT INTO `units` (`key`, `value`) VALUES
-- Weight
('GRAM', 'g'),
('KILOGRAM', 'kg'),
('OUNCE', 'oz'),
('POUND', 'lb'),

-- Volume (Metric)
('MILLILITER', 'ml'),
('LITER', 'l'),

-- Volume (Imperial/US)
('TEASPOON', 'tsp'),
('TABLESPOON', 'tbsp'),
('CUP', 'cup'),

-- Count / Size
('PIECES', 'piece'),
('SLICES', 'slice'),
('HANDFUL', 'handful'),
('SMALL', 'small'),
('MEDIUM', 'medium'),
('LARGE', 'large'),

-- Containers
('TIN', 'tin'),
('CAN', 'can'),
('PACK', 'pack'),

-- Cooking Measures
('PINCH', 'pinch'),
('DASH', 'dash'),
('SPRIG', 'sprig'),
('CLOVE', 'clove'),
('LEAF', 'leaf'),

-- Special
('HEAD', 'head'),
('STALK', 'stalk'),
('NONE', '');

-- ===========================
-- Get aisle IDs for reference
-- ===========================
SET @aisle_meat = (SELECT id FROM aisles WHERE `key` = 'MEAT');
SET @aisle_poultry = (SELECT id FROM aisles WHERE `key` = 'POULTRY');
SET @aisle_veg = (SELECT id FROM aisles WHERE `key` = 'VEG');
SET @aisle_fruit = (SELECT id FROM aisles WHERE `key` = 'FRUIT');
SET @aisle_fish = (SELECT id FROM aisles WHERE `key` = 'FISH');
SET @aisle_dairy = (SELECT id FROM aisles WHERE `key` = 'DAIRY');
SET @aisle_frozen = (SELECT id FROM aisles WHERE `key` = 'FROZEN');
SET @aisle_herbs = (SELECT id FROM aisles WHERE `key` = 'HERBS_SPICES');
SET @aisle_oils = (SELECT id FROM aisles WHERE `key` = 'OILS');
SET @aisle_tins = (SELECT id FROM aisles WHERE `key` = 'TINS_JARS');
SET @aisle_grains = (SELECT id FROM aisles WHERE `key` = 'GRAINS_PASTA');
SET @aisle_condiments = (SELECT id FROM aisles WHERE `key` = 'CONDIMENTS');
SET @aisle_bakery = (SELECT id FROM aisles WHERE `key` = 'BAKERY');
SET @aisle_nuts = (SELECT id FROM aisles WHERE `key` = 'NUTS');
SET @aisle_seeds = (SELECT id FROM aisles WHERE `key` = 'SEEDS');
SET @aisle_beverages = (SELECT id FROM aisles WHERE `key` = 'BEVERAGES');
SET @aisle_misc = (SELECT id FROM aisles WHERE `key` = 'MISC');

-- ===========================
-- SEED INGREDIENTS (Common items)
-- ===========================
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
-- Grains & Bakery
('ROLLED_OATS', 'Rolled oats', @aisle_grains),
('PLAIN_FLOUR', 'Plain flour', @aisle_bakery),
('ALMOND_FLOUR', 'Almond flour', @aisle_bakery),
('PAELLA_RICE', 'Paella rice', @aisle_grains),
('BREAD', 'Bread', @aisle_bakery),
('WHOLEMEAL_BREAD', 'Wholemeal bread', @aisle_bakery),
('FLOUR_TORTILLAS', 'Flour tortillas', @aisle_bakery),
('PASTA', 'Pasta', @aisle_grains),
('RICE', 'Rice', @aisle_grains),

-- Dairy & Eggs
('GREEK_YOGURT', 'Greek yogurt', @aisle_dairy),
('MILK', 'Milk', @aisle_dairy),
('CREME_FRAICHE', 'Crème Fraîche', @aisle_dairy),
('BUTTER', 'Butter', @aisle_dairy),
('DOUBLE_CREAM', 'Double cream', @aisle_dairy),
('CHEESE', 'Cheese', @aisle_dairy),
('MOZZARELLA', 'Mozzarella', @aisle_dairy),
('PARMESAN_CHEESE', 'Parmesan', @aisle_dairy),
('FETA_CHEESE', 'Feta cheese', @aisle_dairy),
('HALLOUMI', 'Halloumi', @aisle_dairy),
('EGG', 'Egg', @aisle_dairy),

-- Meat & Poultry
('BEEF_MINCE', 'Beef mince', @aisle_meat),
('CHICKEN_BREAST', 'Chicken breast', @aisle_poultry),
('BACON', 'Bacon', @aisle_meat),
('SAUSAGE', 'Sausage', @aisle_meat),
('TURKEY_MINCE', 'Turkey mince', @aisle_poultry),

-- Fish
('SALMON', 'Salmon', @aisle_fish),
('COD', 'Cod', @aisle_fish),
('PRAWNS', 'Prawns', @aisle_fish),
('WHITE_FISH', 'White fish', @aisle_fish),

-- Vegetables
('ONION', 'Onion', @aisle_veg),
('GARLIC', 'Garlic', @aisle_veg),
('TOMATO', 'Tomato', @aisle_veg),
('CARROT', 'Carrot', @aisle_veg),
('BROCCOLI', 'Broccoli', @aisle_veg),
('SPINACH', 'Spinach', @aisle_veg),
('BELL_PEPPER', 'Bell pepper', @aisle_veg),
('MUSHROOM', 'Mushroom', @aisle_veg),
('POTATO', 'Potato', @aisle_veg),
('SWEET_POTATO', 'Sweet potato', @aisle_veg),
('CUCUMBER', 'Cucumber', @aisle_veg),
('LETTUCE', 'Lettuce', @aisle_veg),
('CELERY', 'Celery', @aisle_veg),
('PAK_CHOI', 'Pak choi', @aisle_veg),
('CHERRY_TOMATOES', 'Cherry tomatoes', @aisle_veg),
('AVOCADO', 'Avocado', @aisle_veg),

-- Fruits
('BANANA', 'Banana', @aisle_fruit),
('APPLE', 'Apple', @aisle_fruit),
('LEMON', 'Lemon', @aisle_fruit),
('BLUEBERRY', 'Blueberry', @aisle_fruit),
('MIXED_BERRIES', 'Mixed berries', @aisle_fruit),

-- Herbs & Spices
('SALT', 'Salt', @aisle_herbs),
('BLACK_PEPPER', 'Black pepper', @aisle_herbs),
('PAPRIKA', 'Paprika', @aisle_herbs),
('CUMIN', 'Cumin', @aisle_herbs),
('BASIL', 'Basil', @aisle_herbs),
('OREGANO', 'Oregano', @aisle_herbs),
('GINGER', 'Ginger', @aisle_herbs),
('TURMERIC', 'Turmeric', @aisle_herbs),
('CINNAMON', 'Cinnamon', @aisle_herbs),
('SMOKED_PAPRIKA', 'Smoked paprika', @aisle_herbs),
('CHILI_FLAKES', 'Chili flakes', @aisle_herbs),

-- Oils & Condiments
('OLIVE_OIL', 'Olive oil', @aisle_oils),
('VEGETABLE_OIL', 'Vegetable oil', @aisle_oils),
('SOY_SAUCE', 'Soy sauce', @aisle_condiments),
('HONEY', 'Honey', @aisle_condiments),
('TOMATO_PASTE', 'Tomato paste', @aisle_condiments),

-- Nuts & Seeds
('ALMONDS', 'Almonds', @aisle_nuts),
('CASHEWS', 'Cashews', @aisle_nuts),
('WALNUTS', 'Walnuts', @aisle_nuts),
('PEANUT_BUTTER', 'Peanut butter', @aisle_nuts),
('CHIA_SEEDS', 'Chia seeds', @aisle_seeds),

-- Tins & Jars
('CHICKPEAS', 'Chickpeas', @aisle_tins),
('TINNED_TOMATOES', 'Tinned tomatoes', @aisle_tins),
('BROWN_LENTILS', 'Brown lentils', @aisle_tins),
('BLACK_BEANS', 'Black beans', @aisle_tins),

-- Other
('FIRM_TOFU', 'Firm tofu', @aisle_misc),
('VANILLA_EXTRACT', 'Vanilla extract', @aisle_misc),
('STOCK', 'Stock', @aisle_misc);

-- ===========================
-- SEED SAMPLE ADMIN USER
-- ===========================
INSERT INTO `users` (`email`, `name`, `oauth_provider`, `oauth_id`, `is_admin`, `default_servings`, `created_at`, `last_login`) VALUES
('admin@foodbytes.app', 'Admin User', 'GOOGLE', 'admin-test-oauth-id-12345', TRUE, 2, NOW(), NOW());

-- Get admin user ID
SET @admin_user_id = LAST_INSERT_ID();

-- ===========================
-- Get unit IDs for reference
-- ===========================
SET @unit_g = (SELECT id FROM units WHERE `key` = 'GRAM');
SET @unit_ml = (SELECT id FROM units WHERE `key` = 'MILLILITER');
SET @unit_tbsp = (SELECT id FROM units WHERE `key` = 'TABLESPOON');
SET @unit_tsp = (SELECT id FROM units WHERE `key` = 'TEASPOON');
SET @unit_piece = (SELECT id FROM units WHERE `key` = 'PIECES');
SET @unit_handful = (SELECT id FROM units WHERE `key` = 'HANDFUL');
SET @unit_medium = (SELECT id FROM units WHERE `key` = 'MEDIUM');
SET @unit_cup = (SELECT id FROM units WHERE `key` = 'CUP');
SET @unit_clove = (SELECT id FROM units WHERE `key` = 'CLOVE');
SET @unit_head = (SELECT id FROM units WHERE `key` = 'HEAD');

-- ===========================
-- Get meal IDs for reference
-- ===========================
SET @meal_breakfast = (SELECT id FROM meals WHERE `key` = 'BREAKFAST');
SET @meal_lunch = (SELECT id FROM meals WHERE `key` = 'LUNCH');
SET @meal_dinner = (SELECT id FROM meals WHERE `key` = 'DINNER');
SET @meal_snacks = (SELECT id FROM meals WHERE `key` = 'SNACKS');

-- ===========================
-- SEED SAMPLE RECIPE: Grilled Chicken Salad
-- ===========================
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`) VALUES
('Grilled Chicken Salad', 2, 1210, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

-- Link to meal types
INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES
(@recipe_id, @meal_lunch);

-- Add ingredients
INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKEN_BREAST'), 240, @unit_g, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'LETTUCE'), 2, @unit_handful, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CUCUMBER'), 1, @unit_piece, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHERRY_TOMATOES'), 10, @unit_piece, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CARROT'), 2, @unit_piece, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'LEMON'), 1, @unit_piece, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 1, @unit_tbsp, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'AVOCADO'), 0.5, @unit_medium, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKPEAS'), 150, @unit_g, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'FETA_CHEESE'), 40, @unit_g, 10);

-- Add steps
INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`, `tip`) VALUES
(@recipe_id, 1, 'Cook and slice the chicken breast. Let rest if made in advance.', 'Season with salt and pepper before cooking'),
(@recipe_id, 2, 'Wash and prep the salad leaves, cucumber, tomatoes, and carrots.', NULL),
(@recipe_id, 3, 'Slice avocado and drain chickpeas.', NULL),
(@recipe_id, 4, 'Crumble feta over the vegetables.', NULL),
(@recipe_id, 5, 'In a small bowl, mix lemon juice and 1 tbsp olive oil for dressing.', NULL),
(@recipe_id, 6, 'Combine all ingredients in a large bowl and toss with dressing.', NULL),
(@recipe_id, 7, 'Top with grilled chicken and serve.', NULL);

-- ===========================
-- SEED SAMPLE RECIPE: Banana Chia Pudding
-- ===========================
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`) VALUES
('Banana Chia Pudding with Peanut Butter & Berries', 2, 660, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

-- Link to meal types
INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES
(@recipe_id, @meal_breakfast);

-- Add ingredients
INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHIA_SEEDS'), 4, @unit_tbsp, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MILK'), 160, @unit_ml, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BANANA'), 1, @unit_piece, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'HONEY'), 1, @unit_tsp, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'VANILLA_EXTRACT'), 0.5, @unit_tsp, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'PEANUT_BUTTER'), 2, @unit_tbsp, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GREEK_YOGURT'), 150, @unit_g, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MIXED_BERRIES'), 100, @unit_g, 8);

-- Add steps
INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`, `tip`) VALUES
(@recipe_id, 1, 'Mash the banana in a bowl or jar.', NULL),
(@recipe_id, 2, 'Add milk, chia seeds, honey, and vanilla. Mix well.', NULL),
(@recipe_id, 3, 'Let sit for 5 minutes, then stir again to break up clumps.', 'This prevents the chia seeds from clumping together'),
(@recipe_id, 4, 'Cover and refrigerate for at least 2 hours or overnight.', 'Overnight gives the best texture'),
(@recipe_id, 5, 'In the morning, stir in peanut butter and Greek yogurt.', NULL),
(@recipe_id, 6, 'Top with fresh berries before serving.', NULL);

-- ===========================
-- SEED SAMPLE RECIPE: Spicy Tofu Stir-Fry
-- ===========================
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`) VALUES
('Spicy Tofu Stir-Fry with Mushrooms & Nuts', 2, 1180, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

-- Link to meal types
INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES
(@recipe_id, @meal_dinner);

-- Add ingredients
INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'FIRM_TOFU'), 400, @unit_g, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 3, @unit_tbsp, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GARLIC'), 1, @unit_clove, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BELL_PEPPER'), 1, @unit_piece, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ONION'), 1, @unit_piece, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MUSHROOM'), 150, @unit_g, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SOY_SAUCE'), 2, @unit_tbsp, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SMOKED_PAPRIKA'), 0.5, @unit_tsp, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHILI_FLAKES'), 0.5, @unit_tsp, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CASHEWS'), 30, @unit_g, 10);

-- Add steps
INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`, `tip`) VALUES
(@recipe_id, 1, 'Heat 1 tbsp olive oil or ghee in a pan and fry tofu until golden, about 20 minutes. Set aside.', 'Press tofu first to remove excess moisture'),
(@recipe_id, 2, 'Add 1 tbsp more oil to the pan, sauté garlic for 30 seconds.', NULL),
(@recipe_id, 3, 'Add red pepper, onion, and mushrooms. Stir-fry for 4-5 minutes.', NULL),
(@recipe_id, 4, 'Return tofu to the pan. Add soy sauce, smoked paprika, and chili flakes.', 'Adjust chili to taste'),
(@recipe_id, 5, 'Add final 1 tbsp of oil and the nuts. Stir well and cook for 1-2 more minutes.', NULL),
(@recipe_id, 6, 'Serve hot.', NULL);

-- ===========================
-- VERIFY DATA
-- ===========================

-- Show counts
SELECT 'Meals' AS table_name, COUNT(*) AS row_count FROM meals
UNION ALL
SELECT 'Aisles', COUNT(*) FROM aisles
UNION ALL
SELECT 'Units', COUNT(*) FROM units
UNION ALL
SELECT 'Ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'Recipe Meals', COUNT(*) FROM recipe_meals
UNION ALL
SELECT 'Recipe Ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL
SELECT 'Recipe Steps', COUNT(*) FROM recipe_steps;

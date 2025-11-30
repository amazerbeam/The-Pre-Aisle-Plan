-- FoodBytes Database Seed Data
-- Populates initial lookup tables and sample data

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

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
-- SEED SAMPLE INGREDIENTS (50 common items)
-- ===========================

-- Get aisle IDs for reference
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

-- Fish
('SALMON', 'Salmon', @aisle_fish),
('COD', 'Cod', @aisle_fish),
('PRAWNS', 'Prawns', @aisle_fish),

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

-- Fruits
('BANANA', 'Banana', @aisle_fruit),
('APPLE', 'Apple', @aisle_fruit),
('LEMON', 'Lemon', @aisle_fruit),
('BLUEBERRY', 'Blueberry', @aisle_fruit),

-- Herbs & Spices
('SALT', 'Salt', @aisle_herbs),
('BLACK_PEPPER', 'Black pepper', @aisle_herbs),
('PAPRIKA', 'Paprika', @aisle_herbs),
('CUMIN', 'Cumin', @aisle_herbs),
('BASIL', 'Basil', @aisle_herbs),
('OREGANO', 'Oregano', @aisle_herbs),

-- Oils & Condiments
('OLIVE_OIL', 'Olive oil', @aisle_oils),
('VEGETABLE_OIL', 'Vegetable oil', @aisle_oils),
('SOY_SAUCE', 'Soy sauce', @aisle_condiments),
('HONEY', 'Honey', @aisle_condiments);

-- ===========================
-- SEED SAMPLE ADMIN USER
-- ===========================
INSERT INTO `users` (`email`, `name`, `oauth_provider`, `oauth_id`, `is_admin`, `created_at`, `last_login`) VALUES
('admin@foodbytes.app', 'Admin User', 'google', 'admin-test-oauth-id-12345', TRUE, NOW(), NOW());

-- Get admin user ID for sample data
SET @admin_user_id = LAST_INSERT_ID();

-- ===========================
-- SEED SAMPLE RECIPES (3 simple examples)
-- ===========================

-- Recipe 1: Greek Yogurt Bowl (Breakfast, Live)
INSERT INTO `recipes` (
  `name`,
  `meal_types`,
  `default_servings`,
  `calories`,
  `ingredients`,
  `steps`,
  `is_cheat`,
  `is_live`,
  `is_deleted`
) VALUES (
  'Greek Yogurt Bowl',
  JSON_ARRAY('breakfast'),
  2,
  350,
  JSON_ARRAY(
    JSON_OBJECT('name', 'Greek yogurt', 'quantity', 300, 'unit', 'g'),
    JSON_OBJECT('name', 'Rolled oats', 'quantity', 50, 'unit', 'g'),
    JSON_OBJECT('name', 'Honey', 'quantity', 2, 'unit', 'tbsp'),
    JSON_OBJECT('name', 'Blueberry', 'quantity', 100, 'unit', 'g'),
    JSON_OBJECT('name', 'Banana', 'quantity', 1, 'unit', 'piece')
  ),
  JSON_ARRAY(
    'Place Greek yogurt in bowls',
    'Top with rolled oats',
    'Drizzle with honey',
    'Add fresh blueberries and sliced banana',
    'Serve immediately'
  ),
  FALSE,
  TRUE,
  FALSE
);

-- Recipe 2: Chicken and Vegetable Stir Fry (Lunch/Dinner, Live)
INSERT INTO `recipes` (
  `name`,
  `meal_types`,
  `default_servings`,
  `calories`,
  `ingredients`,
  `steps`,
  `is_cheat`,
  `is_live`,
  `is_deleted`
) VALUES (
  'Chicken and Vegetable Stir Fry',
  JSON_ARRAY('lunch', 'dinner'),
  2,
  480,
  JSON_ARRAY(
    JSON_OBJECT('name', 'Chicken breast', 'quantity', 300, 'unit', 'g'),
    JSON_OBJECT('name', 'Bell pepper', 'quantity', 1, 'unit', 'piece'),
    JSON_OBJECT('name', 'Broccoli', 'quantity', 200, 'unit', 'g'),
    JSON_OBJECT('name', 'Carrot', 'quantity', 1, 'unit', 'piece'),
    JSON_OBJECT('name', 'Onion', 'quantity', 1, 'unit', 'piece'),
    JSON_OBJECT('name', 'Garlic', 'quantity', 2, 'unit', 'clove'),
    JSON_OBJECT('name', 'Soy sauce', 'quantity', 3, 'unit', 'tbsp'),
    JSON_OBJECT('name', 'Vegetable oil', 'quantity', 2, 'unit', 'tbsp'),
    JSON_OBJECT('name', 'Rice', 'quantity', 200, 'unit', 'g')
  ),
  JSON_ARRAY(
    'Cook rice according to package instructions',
    'Cut chicken breast into bite-sized pieces',
    'Chop all vegetables into similar-sized pieces',
    'Heat oil in a large pan or wok over high heat',
    'Add chicken and cook until browned (5-6 minutes)',
    'Add garlic and onion, stir fry for 2 minutes',
    'Add remaining vegetables and stir fry for 4-5 minutes',
    'Add soy sauce and toss to coat',
    'Serve immediately over cooked rice'
  ),
  FALSE,
  TRUE,
  FALSE
);

-- Recipe 3: Cheese Pizza (Dinner, Cheat, Hidden - for testing admin visibility)
INSERT INTO `recipes` (
  `name`,
  `meal_types`,
  `default_servings`,
  `calories`,
  `ingredients`,
  `steps`,
  `is_cheat`,
  `is_live`,
  `is_deleted`
) VALUES (
  'Cheese Pizza',
  JSON_ARRAY('dinner'),
  2,
  850,
  JSON_ARRAY(
    JSON_OBJECT('name', 'Plain flour', 'quantity', 300, 'unit', 'g'),
    JSON_OBJECT('name', 'Mozzarella', 'quantity', 200, 'unit', 'g'),
    JSON_OBJECT('name', 'Tomato', 'quantity', 400, 'unit', 'g'),
    JSON_OBJECT('name', 'Olive oil', 'quantity', 2, 'unit', 'tbsp'),
    JSON_OBJECT('name', 'Basil', 'quantity', 1, 'unit', 'handful'),
    JSON_OBJECT('name', 'Salt', 'quantity', 1, 'unit', 'pinch')
  ),
  JSON_ARRAY(
    'Prepare pizza dough with flour, water, salt, and olive oil',
    'Let dough rest for 30 minutes',
    'Roll out dough into pizza shape',
    'Spread crushed tomatoes on dough',
    'Add torn mozzarella on top',
    'Bake in preheated oven at 220°C for 12-15 minutes',
    'Top with fresh basil leaves before serving'
  ),
  TRUE,
  FALSE,
  FALSE
);

-- ===========================
-- SEED SAMPLE MEAL PLAN ENTRIES (Admin user, next 7 days)
-- ===========================

-- Get recipe IDs
SET @recipe_yogurt_id = (SELECT id FROM recipes WHERE name = 'Greek Yogurt Bowl');
SET @recipe_stirfry_id = (SELECT id FROM recipes WHERE name = 'Chicken and Vegetable Stir Fry');

-- Next 7 days of meal planning for admin user
INSERT INTO `meal_plan_entries` (`user_id`, `plan_date`, `meal_type`, `recipe_id`, `servings`) VALUES
-- Day 1
(@admin_user_id, CURDATE(), 'breakfast', @recipe_yogurt_id, 2),
(@admin_user_id, CURDATE(), 'lunch', @recipe_stirfry_id, 2),

-- Day 2
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'breakfast', @recipe_yogurt_id, 2),
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'dinner', @recipe_stirfry_id, 3),

-- Day 3
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'breakfast', @recipe_yogurt_id, 1),

-- Day 4
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'lunch', @recipe_stirfry_id, 2),

-- Day 5
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'breakfast', @recipe_yogurt_id, 2),
(@admin_user_id, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'dinner', @recipe_stirfry_id, 2);

-- ===========================
-- SEED SAMPLE AUDIT LOG ENTRIES
-- ===========================

-- CREATE action for Greek Yogurt Bowl
INSERT INTO `recipe_audit_log` (`recipe_id`, `user_id`, `action`, `old_values`, `new_values`) VALUES
(
  @recipe_yogurt_id,
  @admin_user_id,
  'CREATE',
  NULL,
  JSON_OBJECT(
    'name', 'Greek Yogurt Bowl',
    'meal_types', JSON_ARRAY('breakfast'),
    'default_servings', 2,
    'calories', 350,
    'is_cheat', FALSE,
    'is_live', TRUE
  )
);

-- CREATE action for Chicken Stir Fry
INSERT INTO `recipe_audit_log` (`recipe_id`, `user_id`, `action`, `old_values`, `new_values`) VALUES
(
  @recipe_stirfry_id,
  @admin_user_id,
  'CREATE',
  NULL,
  JSON_OBJECT(
    'name', 'Chicken and Vegetable Stir Fry',
    'meal_types', JSON_ARRAY('lunch', 'dinner'),
    'default_servings', 2,
    'calories', 480,
    'is_cheat', FALSE,
    'is_live', TRUE
  )
);

-- Sample UPDATE action (admin changed yogurt bowl calories)
INSERT INTO `recipe_audit_log` (`recipe_id`, `user_id`, `action`, `old_values`, `new_values`) VALUES
(
  @recipe_yogurt_id,
  @admin_user_id,
  'UPDATE',
  JSON_OBJECT('calories', 320),
  JSON_OBJECT('calories', 350)
);

-- ===========================
-- VERIFY DATA
-- ===========================

-- Show counts
SELECT 'Aisles' AS table_name, COUNT(*) AS row_count FROM aisles
UNION ALL
SELECT 'Units', COUNT(*) FROM units
UNION ALL
SELECT 'Ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'Meal Plan Entries', COUNT(*) FROM meal_plan_entries
UNION ALL
SELECT 'Audit Log', COUNT(*) FROM recipe_audit_log;

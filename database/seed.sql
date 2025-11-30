-- FoodBytes Database Seed File
-- Populates the database with initial reference data, ingredients, and sample recipes
-- Run this after schema.sql to populate the database

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- REFERENCE DATA (Lookup Tables)
-- ============================================

-- Insert meal types
INSERT INTO `meals` (`key`, `name`, `display_order`) VALUES
('BREAKFAST', 'Breakfast', 1),
('LUNCH', 'Lunch', 2),
('DINNER', 'Dinner', 3),
('SNACKS', 'Snacks', 4);

-- Insert grocery aisles with colors from UX context
INSERT INTO `aisles` (`key`, `name`, `display_order`, `color`) VALUES
('MEAT', 'Meat', 1, '#e74c3c'),
('POULTRY', 'Poultry', 2, '#e74c3c'),
('VEG', 'Veg', 3, '#27ae60'),
('FRUIT', 'Fruit', 4, '#27ae60'),
('FISH', 'Fish', 5, '#3498db'),
('DAIRY', 'Dairy', 6, '#3498db'),
('FROZEN', 'Frozen', 7, '#9b59b6'),
('HERBS_SPICES', 'Herbs & Spices', 8, '#c0392b'),
('OILS', 'Oils & Fats', 9, '#16a085'),
('TINS_JARS', 'Tins & Jars', 10, '#7f8c8d'),
('GRAINS_PASTA', 'Grains & Pasta', 11, '#d35400'),
('CONDIMENTS', 'Condiments & Sauces', 12, '#f1c40f'),
('BAKERY', 'Bakery', 13, '#f39c12'),
('NUTS', 'Nuts', 14, '#95a5a6'),
('SEEDS', 'Seeds', 15, '#95a5a6'),
('BEVERAGES', 'Beverages', 16, '#1abc9c'),
('MISC', 'Misc', 17, '#bdc3c7');

-- Insert measurement units from Legacy recipes.js
INSERT INTO `units` (`key`, `value`, `category`) VALUES
-- Weight
('GRAM', 'g', 'weight'),
('KILOGRAM', 'kg', 'weight'),
('OUNCE', 'oz', 'weight'),
('POUND', 'lb', 'weight'),

-- Volume (metric)
('MILLILITER', 'ml', 'volume'),
('LITER', 'l', 'volume'),

-- Volume (imperial/US)
('TEASPOON', 'tsp', 'volume'),
('TABLESPOON', 'tbsp', 'volume'),
('CUP', 'cup', 'volume'),

-- Count / size
('PIECES', 'piece', 'count'),
('SLICES', 'slice', 'count'),
('HANDFUL', 'handful', 'count'),
('SMALL', 'small', 'size'),
('MEDIUM', 'medium', 'size'),
('LARGE', 'large', 'size'),

-- Cans / tins / packs
('TIN', 'tin', 'container'),
('CAN', 'can', 'container'),
('PACK', 'pack', 'container'),

-- Cooking measures
('PINCH', 'pinch', 'cooking'),
('DASH', 'dash', 'cooking'),
('SPRIG', 'sprig', 'cooking'),
('CLOVE', 'clove', 'cooking'),
('LEAF', 'leaf', 'cooking'),

-- Special
('HEAD', 'head', 'special'),
('STALK', 'stalk', 'special'),
('NONE', '', 'special');

-- ============================================
-- INGREDIENTS (All ingredients from Legacy)
-- ============================================

-- Get aisle IDs for reference
SET @aisle_grains_pasta = (SELECT id FROM aisles WHERE `key` = 'GRAINS_PASTA');
SET @aisle_bakery = (SELECT id FROM aisles WHERE `key` = 'BAKERY');
SET @aisle_dairy = (SELECT id FROM aisles WHERE `key` = 'DAIRY');
SET @aisle_poultry = (SELECT id FROM aisles WHERE `key` = 'POULTRY');
SET @aisle_meat = (SELECT id FROM aisles WHERE `key` = 'MEAT');
SET @aisle_fish = (SELECT id FROM aisles WHERE `key` = 'FISH');
SET @aisle_veg = (SELECT id FROM aisles WHERE `key` = 'VEG');
SET @aisle_tins_jars = (SELECT id FROM aisles WHERE `key` = 'TINS_JARS');
SET @aisle_herbs_spices = (SELECT id FROM aisles WHERE `key` = 'HERBS_SPICES');
SET @aisle_fruit = (SELECT id FROM aisles WHERE `key` = 'FRUIT');
SET @aisle_nuts = (SELECT id FROM aisles WHERE `key` = 'NUTS');
SET @aisle_seeds = (SELECT id FROM aisles WHERE `key` = 'SEEDS');
SET @aisle_oils = (SELECT id FROM aisles WHERE `key` = 'OILS');
SET @aisle_condiments = (SELECT id FROM aisles WHERE `key` = 'CONDIMENTS');
SET @aisle_beverages = (SELECT id FROM aisles WHERE `key` = 'BEVERAGES');
SET @aisle_frozen = (SELECT id FROM aisles WHERE `key` = 'FROZEN');
SET @aisle_misc = (SELECT id FROM aisles WHERE `key` = 'MISC');

-- Insert all ingredients from Legacy recipes.js
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
-- Grains / bakery / flours
('ROLLED_OATS', 'Rolled oats', @aisle_grains_pasta),
('PLAIN_FLOUR', 'Plain flour', @aisle_bakery),
('ALMOND_FLOUR', 'Almond flour', @aisle_bakery),
('PAELLA_RICE', 'Paella rice', @aisle_grains_pasta),
('BREAD', 'Bread', @aisle_bakery),
('WHOLEMEAL_BREAD', 'Wholemeal bread', @aisle_bakery),
('FLOUR_TORTILLAS', 'Flour tortillas', @aisle_bakery),

-- Dairy & eggs
('GREEK_YOGURT', 'Greek yogurt', @aisle_dairy),
('MILK', 'Milk', @aisle_dairy),
('CREME_FRAINCHE', 'Crème Fraîche', @aisle_bakery),
('BUTTER', 'Butter', @aisle_dairy),
('DOUBLE_CREAM', 'Double cream', @aisle_dairy),
('CHEESE', 'Cheese', @aisle_dairy),
('MOZZARELLA', 'Mozzarella', @aisle_dairy),
('PARMESAN_CHEESE', 'Parmesan', @aisle_dairy),
('FETA_CHEESE', 'Feta cheese', @aisle_dairy),
('HALLOUMI', 'Halloumi', @aisle_dairy),
('EGGS', 'Eggs', @aisle_bakery),

-- Meat / poultry / fish
('CHICKEN_BREAST', 'Chicken breast', @aisle_poultry),
('CHICKEN_WINGS', 'Chicken wings', @aisle_poultry),
('TURKEY_BREAST', 'Turkey breast', @aisle_poultry),
('TURKEY_MINCE', 'Turkey mince', @aisle_poultry),
('STREAKY_BACON', 'Streaky bacon', @aisle_meat),
('GROUND_BEEF', 'Beef Mince (3% fat) ', @aisle_meat),
('BEEF_ROAST', 'Beef roast', @aisle_meat),
('PORK_BELLY', 'Pork belly', @aisle_meat),
('SALMON_FILLET', 'Salmon fillet', @aisle_fish),
('WHITE_FISH', 'White fish', @aisle_fish),
('SIRLOIN_STEAK', 'Sirloin  Steak', @aisle_meat),
('CHICKEN_WHOLE', 'Whole chicken', @aisle_poultry),

-- Vegetables
('BROCCOLI', 'Broccoli', @aisle_veg),
('TURNIP', 'Turnip', @aisle_veg),
('LETTUCE_LEAVES', 'Lettuce leaves', @aisle_veg),
('SALAD_LEAVES', 'Salad leaves', @aisle_veg),
('SPINACH', 'Spinach', @aisle_veg),
('ZUCCHINI', 'Zucchini', @aisle_veg),
('GARLIC', 'Garlic', @aisle_veg),
('GINGER', 'Ginger', @aisle_veg),
('GREEN_BELL_PEPPER', 'Green bell pepper', @aisle_veg),
('RED_BELL_PEPPER', 'Red bell pepper', @aisle_veg),
('ONION', 'Onion', @aisle_veg),
('RED_ONION', 'Red onion', @aisle_veg),
('SPRING_ONION', 'Spring onion', @aisle_veg),
('PAK_CHOI', 'Pak choi', @aisle_veg),
('CELERY', 'Celery', @aisle_veg),
('CARROT', 'Carrot', @aisle_veg),
('CUCUMBER', 'Cucumber', @aisle_veg),
('CHERRY_TOMATOES', 'Cherry tomatoes', @aisle_veg),
('TOMATOE', 'Tomatoe', @aisle_veg),
('SCALLIONS', 'Scallions', @aisle_veg),
('POTATOES', 'Potatoes', @aisle_veg),
('SWEET_POTATO', 'Sweet potato', @aisle_veg),
('LEEK', 'Leek', @aisle_veg),

-- Canned/jarred vegetables
('TOMATO_PASTE', 'Tomato paste', @aisle_tins_jars),
('TINNED_TOMATOES', 'Tinned tomatoes', @aisle_tins_jars),
('BLACK_BEANS', 'Black Beans', @aisle_tins_jars),
('TOMATO_SAUCE', 'Tomato sauce', @aisle_tins_jars),

-- Herbs & Spices
('BASIL', 'Basil', @aisle_herbs_spices),
('THYME', 'Thyme (dried)', @aisle_herbs_spices),
('ROSEMARY', 'Rosemary (dried)', @aisle_herbs_spices),
('BAY_LEAF', 'Bay leaf', @aisle_herbs_spices),
('CHIVES', 'Chives', @aisle_herbs_spices),
('SALT', 'Salt', @aisle_herbs_spices),
('BLACK_PEPPER', 'Black pepper', @aisle_herbs_spices),
('SMOKED_PAPRIKA', 'Smoked paprika', @aisle_herbs_spices),
('CHILI_FLAKES', 'Chili flakes', @aisle_herbs_spices),
('ITALIAN_SEASONING', 'Italian seasoning', @aisle_herbs_spices),
('CUMIN', 'Cumin', @aisle_herbs_spices),
('CINNAMON', 'Cinnamon', @aisle_herbs_spices),
('ANISE_STAR', 'Star anise', @aisle_herbs_spices),
('MSG', 'MSG', @aisle_herbs_spices),
('GARAM_MASALA', 'Garam Masala', @aisle_herbs_spices),
('ONION_POWDER', 'Onion powder', @aisle_herbs_spices),
('GARLIC_POWDER', 'Garlic powder', @aisle_herbs_spices),
('CURRY_POWDER', 'Curry powder', @aisle_herbs_spices),
('TURMERIC', 'Turmeric', @aisle_herbs_spices),
('LEMON_ZEST', 'Lemon zest', @aisle_herbs_spices),

-- Fruits
('LEMON', 'Lemon', @aisle_fruit),
('LEMON_JUICE', 'Lemon juice', @aisle_fruit),
('LIME_JUICE', 'Lime juice', @aisle_fruit),
('BANANA', 'Banana', @aisle_fruit),
('APPLE', 'Apple', @aisle_fruit),
('PEACH', 'Peach', @aisle_fruit),
('AVOCADO', 'Avocado', @aisle_fruit),
('MIXED_BERRIES', 'Mixed berries', @aisle_fruit),
('PINEAPPLE_CHUNKS', 'Pineapple chunks', @aisle_tins_jars),
('COCONUT_WATER', 'Coconut water', @aisle_fruit),

-- Legumes / tins
('CHICKPEAS', 'Chickpeas', @aisle_tins_jars),
('BUTTER_BEANS', 'Butter beans', @aisle_tins_jars),
('BROWN_LENTILS', 'Brown lentils', @aisle_tins_jars),
('HUMMUS', 'Hummus', @aisle_tins_jars),
('CAPERS', 'Capers', @aisle_tins_jars),
('GREEN_OLIVES', 'Green olives', @aisle_tins_jars),
('TUNA', 'Tuna', @aisle_tins_jars),

-- Nuts & seeds
('ALMONDS', 'Almonds', @aisle_nuts),
('CASHEWS', 'Cashews', @aisle_nuts),
('WALNUTS', 'Walnuts', @aisle_nuts),
('ALMOND_BUTTER', 'Almond butter', @aisle_nuts),
('PEANUT_BUTTER', 'Peanut butter', @aisle_nuts),
('COCONUT_FLAKES', 'Coconut flakes', @aisle_bakery),
('SESAME_SEEDS', 'Sesame seeds', @aisle_seeds),
('CHIA_SEEDS', 'Chia seeds', @aisle_seeds),

-- Oils / condiments / sauces
('OLIVE_OIL', 'Olive oil', @aisle_oils),
('PESTO', 'Pesto', @aisle_condiments),
('SOY_SAUCE', 'Soy sauce', @aisle_condiments),
('WORCESTERSHIRE_SAUCE', 'Worcestershire sauce', @aisle_condiments),
('FRANKS_HOT_SAUCE', 'Frank\'s Hot Sauce', @aisle_condiments),
('JALAPENOS', 'Jalapeños', @aisle_condiments),

-- Baking ingredients
('MAPLE_SYRUP', 'Maple syrup', @aisle_bakery),
('VANILLA_EXTRACT', 'Vanilla extract', @aisle_bakery),
('SUGAR', 'Sugar', @aisle_bakery),
('BREADCRUMBS', 'Breadcrumbs', @aisle_bakery),
('BAKING_POWDER', 'Baking powder', @aisle_bakery),
('CORN_FLOUR', 'Corn flour', @aisle_bakery),
('HONEY', 'Honey', @aisle_bakery),
('DRY_YEAST', 'Dry yeast', @aisle_bakery),

-- Stocks & misc
('STOCK', 'Stock', @aisle_misc),
('CRISPS', 'Crisps', @aisle_misc),
('AREPA_FLOUR_HARINA_PAN', 'Harina PAN', @aisle_misc),
('WATER', 'Water', @aisle_beverages),
('RUM', 'Rum', @aisle_beverages),

-- Frozen
('PEAS_PETIT_POIS', 'Petit pois', @aisle_frozen),
('GREEN_BEANS_FROZEN', 'Green beans (frozen)', @aisle_frozen),

-- Extra proteins
('MUSHROOMS', 'Mushrooms', @aisle_veg),
('FIRM_TOFU', 'Firm tofu', @aisle_meat),
('CHORIZO', 'Chorizo', @aisle_meat),

-- Extra grains
('RISOTTO_RICE', 'Risotto rice', @aisle_grains_pasta),
('JASMINE_RICE', 'Jasmine rice', @aisle_grains_pasta),
('RICE_UNCOOKED', 'Uncooked rice', @aisle_grains_pasta),

-- Fresh herbs (in veg section)
('ROSEMARY_SPRIG', 'Rosemary sprig', @aisle_veg);

-- ============================================
-- ADMIN USER
-- ============================================

INSERT INTO `users` (`email`, `name`, `oauth_provider`, `oauth_id`, `is_admin`, `default_servings`, `created_at`) VALUES
('admin@foodbytes.com', 'Admin User', 'GOOGLE', 'GOD_MODE_USER', TRUE, 2, CURRENT_TIMESTAMP);

-- ============================================
-- SAMPLE RECIPES
-- ============================================

-- Get unit IDs for reference
SET @unit_gram = (SELECT id FROM units WHERE `key` = 'GRAM');
SET @unit_ml = (SELECT id FROM units WHERE `key` = 'MILLILITER');
SET @unit_tsp = (SELECT id FROM units WHERE `key` = 'TEASPOON');
SET @unit_tbsp = (SELECT id FROM units WHERE `key` = 'TABLESPOON');
SET @unit_piece = (SELECT id FROM units WHERE `key` = 'PIECES');
SET @unit_cup = (SELECT id FROM units WHERE `key` = 'CUP');
SET @unit_small = (SELECT id FROM units WHERE `key` = 'SMALL');
SET @unit_medium = (SELECT id FROM units WHERE `key` = 'MEDIUM');
SET @unit_handful = (SELECT id FROM units WHERE `key` = 'HANDFUL');
SET @unit_clove = (SELECT id FROM units WHERE `key` = 'CLOVE');
SET @unit_head = (SELECT id FROM units WHERE `key` = 'HEAD');
SET @unit_tin = (SELECT id FROM units WHERE `key` = 'TIN');
SET @unit_stalk = (SELECT id FROM units WHERE `key` = 'STALK');

-- Get meal type IDs
SET @meal_breakfast = (SELECT id FROM meals WHERE `key` = 'BREAKFAST');
SET @meal_lunch = (SELECT id FROM meals WHERE `key` = 'LUNCH');
SET @meal_dinner = (SELECT id FROM meals WHERE `key` = 'DINNER');
SET @meal_snacks = (SELECT id FROM meals WHERE `key` = 'SNACKS');

-- ============================================
-- Recipe 1: Overnight Oats (Breakfast)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Overnight Oats', 2, 880, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

-- Link to meal types
INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_breakfast);

-- Recipe ingredients
INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ROLLED_OATS'), 40.00, @unit_gram, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GREEK_YOGURT'), 100.00, @unit_gram, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MILK'), 200.00, @unit_ml, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MIXED_BERRIES'), 100.00, @unit_gram, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHIA_SEEDS'), 2.00, @unit_tsp, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'HONEY'), 0.50, @unit_tsp, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'PEANUT_BUTTER'), 1.00, @unit_tbsp, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BANANA'), 1.00, @unit_piece, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CINNAMON'), 0.25, @unit_tsp, 9);

-- Recipe steps
INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Combine oats, yogurt, milk, chia seeds, and peanut butter.'),
(@recipe_id, 2, 'Mix well and refrigerate overnight.'),
(@recipe_id, 3, 'In the morning, stir and top with berries, banana slices, honey, and cinnamon.');

-- ============================================
-- Recipe 2: Scrambled Eggs with Spinach & Avocado (Breakfast)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Scrambled Eggs with Spinach & Avocado', 2, 734, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_breakfast);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'EGGS'), 8.00, @unit_small, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BUTTER'), 1.00, @unit_tsp, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SPINACH'), 60.00, @unit_gram, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'AVOCADO'), 1.00, @unit_medium, 4);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Slice or mash avocado and set aside.'),
(@recipe_id, 2, 'Sauté spinach in a non-stick pan until wilted. Remove and plate.'),
(@recipe_id, 3, 'Whisk eggs with salt to taste.'),
(@recipe_id, 4, 'Heat butter in a pan, add eggs, and stir continuously until softly scrambled.'),
(@recipe_id, 5, 'Serve eggs with spinach and avocado on the side.');

-- ============================================
-- Recipe 3: Grilled Chicken Salad (Lunch)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Grilled Chicken Salad', 2, 1210, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_lunch);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKEN_BREAST'), 240.00, @unit_gram, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALAD_LEAVES'), 2.00, @unit_handful, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CUCUMBER'), 1.00, @unit_piece, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHERRY_TOMATOES'), 10.00, @unit_piece, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CARROT'), 2.00, @unit_piece, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'LEMON'), 1.00, @unit_piece, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 1.00, @unit_tbsp, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'AVOCADO'), 0.50, @unit_medium, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKPEAS'), 150.00, @unit_gram, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'FETA_CHEESE'), 40.00, @unit_gram, 10);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Cook and slice the chicken breast. Let rest if made in advance.'),
(@recipe_id, 2, 'Wash and prep the salad leaves, cucumber, tomatoes, and carrots.'),
(@recipe_id, 3, 'Slice avocado and drain chickpeas.'),
(@recipe_id, 4, 'Crumble feta over the vegetables.'),
(@recipe_id, 5, 'In a small bowl, mix lemon juice and 1 tbsp olive oil for dressing.'),
(@recipe_id, 6, 'Combine all ingredients in a large bowl and toss with dressing.'),
(@recipe_id, 7, 'Top with grilled chicken and serve.');

-- ============================================
-- Recipe 4: Baked Salmon with Avocado & Nut Salad (Dinner)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Baked Salmon with Avocado & Nut Salad', 2, 1200, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_dinner);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALMON_FILLET'), 2.00, @unit_piece, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BROCCOLI'), 1.00, @unit_head, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CARROT'), 2.00, @unit_piece, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALAD_LEAVES'), 2.00, @unit_handful, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'LEMON'), 1.00, @unit_piece, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 3.00, @unit_tbsp, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'AVOCADO'), 1.00, @unit_medium, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALT'), 0.50, @unit_tsp, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ALMONDS'), 20.00, @unit_gram, 9);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Preheat oven to 180°C.'),
(@recipe_id, 2, 'Cut broccoli into florets and toss with 1 tbsp olive oil and salt.'),
(@recipe_id, 3, 'Spread broccoli on a baking tray and roast for 10 minutes.'),
(@recipe_id, 4, 'Add salmon fillets in the center, drizzle with olive oil and season.'),
(@recipe_id, 5, 'Bake for another 20 minutes until salmon is cooked and broccoli tender.'),
(@recipe_id, 6, 'Spiralize carrots and toss with salad leaves, avocado (sliced), and chopped almonds.'),
(@recipe_id, 7, 'Make a dressing with lemon juice and 1 tbsp olive oil, and toss with salad.'),
(@recipe_id, 8, 'Serve the baked salmon with roasted broccoli and the avocado-nut salad.');

-- ============================================
-- Recipe 5: Stir-Fried Chicken & Peppers with Tofu & Nuts (Dinner)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Stir-Fried Chicken & Peppers with Tofu & Nuts', 2, 1180, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_dinner);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKEN_BREAST'), 240.00, @unit_gram, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GREEN_BELL_PEPPER'), 1.00, @unit_piece, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'RED_BELL_PEPPER'), 1.00, @unit_piece, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ONION'), 1.00, @unit_piece, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'PAK_CHOI'), 300.00, @unit_gram, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CELERY'), 2.00, @unit_piece, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'MUSHROOMS'), 100.00, @unit_gram, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'FIRM_TOFU'), 100.00, @unit_gram, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'EGGS'), 2.00, @unit_small, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CASHEWS'), 30.00, @unit_gram, 10),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 2.00, @unit_tbsp, 11),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SOY_SAUCE'), 1.00, @unit_tbsp, 12),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'WORCESTERSHIRE_SAUCE'), 0.50, @unit_tbsp, 13),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GINGER'), 1.00, @unit_tsp, 14),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GARLIC'), 1.00, @unit_clove, 15),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CORN_FLOUR'), 1.00, @unit_tsp, 16),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SESAME_SEEDS'), 1.00, @unit_tsp, 17),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALT'), 0.50, @unit_tsp, 18);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Slice chicken, peppers, onion, celery, pak choi, and mushrooms.'),
(@recipe_id, 2, 'Toss everything with 1 tbsp olive oil and salt to marinate overnight.'),
(@recipe_id, 3, 'Cut tofu into strips and pan-fry separately in a bit of oil until golden. Set aside.'),
(@recipe_id, 4, 'Boil eggs, peel, and slice.'),
(@recipe_id, 5, 'Stir-fry chicken and marinated veg for 4–5 minutes.'),
(@recipe_id, 6, 'Add garlic, ginger, mushrooms; stir-fry 1 minute.'),
(@recipe_id, 7, 'Add soy sauce and Worcestershire; stir.'),
(@recipe_id, 8, 'Mix corn flour with water, add to pan, and thicken sauce.'),
(@recipe_id, 9, 'Add tofu, sliced boiled eggs, and nuts. Toss briefly to warm through.'),
(@recipe_id, 10, 'Sprinkle sesame seeds before serving.');

-- ============================================
-- Recipe 6: Apple, Almonds & Greek Yogurt (Snack)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Apple, Almonds & Greek Yogurt', 2, 450, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_snacks);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'APPLE'), 2.00, @unit_medium, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ALMONDS'), 30.00, @unit_gram, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GREEK_YOGURT'), 150.00, @unit_gram, 3);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Slice each apple into wedges or bite-sized pieces.'),
(@recipe_id, 2, 'Portion the almonds into two servings (15g each).'),
(@recipe_id, 3, 'Spoon 75g of Greek yogurt into a bowl per person.'),
(@recipe_id, 4, 'Serve one apple, 15g almonds, and 75g yogurt per person.');

-- ============================================
-- Recipe 7: Tuscan Turkey Meatballs (Dinner)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Tuscan Turkey Meatballs', 2, 1584, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_dinner);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'TURKEY_MINCE'), 300.00, @unit_gram, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BROWN_LENTILS'), 1.00, @unit_tin, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'TINNED_TOMATOES'), 1.00, @unit_tin, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ONION'), 1.00, @unit_piece, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GARLIC'), 3.00, @unit_clove, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CELERY'), 2.00, @unit_stalk, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CARROT'), 1.00, @unit_piece, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SPINACH'), 60.00, @unit_gram, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BASIL'), 1.00, @unit_tbsp, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CAPERS'), 1.00, @unit_tbsp, 10),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 2.00, @unit_tbsp, 11),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALT'), 1.00, @unit_tsp, 12),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SUGAR'), 1.00, @unit_tsp, 13),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BLACK_PEPPER'), 0.25, @unit_tsp, 14),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ITALIAN_SEASONING'), 1.00, @unit_tsp, 15),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'STOCK'), 1.00, @unit_cup, 16),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SWEET_POTATO'), 300.00, @unit_gram, 17);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Preheat oven to 200°C (390°F). Peel and cube the sweet potatoes. Toss with a pinch of salt and 1 tsp olive oil. Roast for 25–30 minutes until tender and golden. Set aside.'),
(@recipe_id, 2, 'Finely chop half the onion, 1 clove garlic, and half the basil (if using leaves). In a bowl, mix with turkey mince, salt, and pepper.'),
(@recipe_id, 3, 'Form the turkey mixture into small meatballs (about 12).'),
(@recipe_id, 4, 'Finely chop the remaining onion, celery, carrot, and garlic.'),
(@recipe_id, 5, 'Heat 1 tbsp olive oil in a large pan over medium heat. Add the chopped onion, celery, carrot, and a pinch of salt. Fry for 5–7 minutes until softened and lightly golden. Remove the veg from the pan and set aside.'),
(@recipe_id, 6, 'Add a little more olive oil if needed, then fry the meatballs in the same pan until browned on all sides. Remove and set aside.'),
(@recipe_id, 7, 'In a saucepan, heat 1 tbsp olive oil over medium heat. Add the remaining garlic and sauté for 30 seconds until fragrant.'),
(@recipe_id, 8, 'Add the capers and cook for another minute.'),
(@recipe_id, 9, 'Add the tinned tomatoes, 1 tsp salt, 1 tsp sugar and Italian seasoning herbs. Stir and bring to a simmer.'),
(@recipe_id, 10, 'Return the fried vegetables and meatballs to the sauce, along with the lentils. Stir to combine.'),
(@recipe_id, 11, 'Add the stock and bring to a gentle simmer.'),
(@recipe_id, 12, 'Cover and simmer everything together for 30 minutes on low heat.'),
(@recipe_id, 13, 'Stir in the spinach and remaining basil (if using leaves) until wilted.'),
(@recipe_id, 14, 'Serve the lentil and meatball stew hot with a portion of roasted sweet potatoes on the side or stirred through.');

-- ============================================
-- Recipe 8: Mild Chicken & Chickpea Tikka Masala (Dinner)
-- ============================================

INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Mild Chicken & Chickpea Tikka Masala', 2, 592, FALSE, TRUE);

SET @recipe_id = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`) VALUES (@recipe_id, @meal_dinner);

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`) VALUES
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKEN_BREAST'), 250.00, @unit_gram, 1),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CHICKPEAS'), 150.00, @unit_gram, 2),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'PEAS_PETIT_POIS'), 1.00, @unit_cup, 3),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ONION'), 1.00, @unit_medium, 4),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GARLIC'), 3.00, @unit_clove, 5),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GINGER'), 10.00, @unit_gram, 6),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'TOMATO_PASTE'), 2.00, @unit_tbsp, 7),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'TINNED_TOMATOES'), 1.00, @unit_tin, 8),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GREEK_YOGURT'), 75.00, @unit_gram, 9),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'OLIVE_OIL'), 1.50, @unit_tbsp, 10),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CUMIN'), 1.00, @unit_tsp, 11),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'TURMERIC'), 0.50, @unit_tsp, 12),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SMOKED_PAPRIKA'), 0.50, @unit_tsp, 13),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'CINNAMON'), 0.25, @unit_tsp, 14),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'SALT'), 1.00, @unit_tsp, 15),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'BLACK_PEPPER'), 0.25, @unit_tsp, 16),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'HONEY'), 0.50, @unit_tsp, 17),
(@recipe_id, (SELECT id FROM ingredients WHERE `key` = 'GARAM_MASALA'), 1.00, @unit_tsp, 18);

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@recipe_id, 1, 'Dice the onion, mince the garlic, and grate the ginger.'),
(@recipe_id, 2, 'Cut chicken into bite-sized pieces and season lightly with salt and pepper.'),
(@recipe_id, 3, 'Heat olive oil in a pan over medium heat. Add the chicken and onion together. Cook for 5–7 minutes until the onions soften and the chicken is lightly browned.'),
(@recipe_id, 4, 'Add garlic and ginger. Cook for 30 seconds until fragrant.'),
(@recipe_id, 5, 'Sprinkle in cumin, turmeric, smoked paprika, and cinnamon. Stir and toast the spices for 30 seconds.'),
(@recipe_id, 6, 'Add tomato paste and cook for 1 minute to deepen the flavour.'),
(@recipe_id, 7, 'Pour in the tinned tomatoes. Stir and let the sauce simmer gently for 8–10 minutes until it thickens slightly.'),
(@recipe_id, 8, 'Add chickpeas and frozen peas. Simmer for another 3 minutes.'),
(@recipe_id, 9, 'Reduce heat to low. Stir in the Greek yogurt slowly to prevent it from splitting.'),
(@recipe_id, 10, 'Turn off the heat and add garam masala and honey (optional). Taste and adjust salt, pepper, or sweetness.'),
(@recipe_id, 11, 'Serve with roasted vegetables, cauliflower rice, or a small portion of basmati rice if desired.');

-- ============================================
-- END OF SEED FILE
-- ============================================

-- Summary:
-- - 4 meal types inserted
-- - 17 aisles inserted with UX colors
-- - 28 measurement units inserted
-- - 100+ ingredients inserted (all from Legacy recipes.js)
-- - 1 admin user created (GOD mode)
-- - 8 sample recipes with full ingredient lists, steps, and meal type assignments

SELECT 'Database seeded successfully!' as message;

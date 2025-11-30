-- FoodBytes Seed Data
-- Reference data and sample recipes

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- MEAL TYPES
-- ============================================
INSERT INTO `meals` (`key`, `name`, `display_order`) VALUES
('BREAKFAST', 'Breakfast', 1),
('LUNCH', 'Lunch', 2),
('DINNER', 'Dinner', 3),
('SNACKS', 'Snacks', 4);

-- ============================================
-- GROCERY AISLES (17 aisles per requirements)
-- ============================================
INSERT INTO `aisles` (`key`, `name`, `display_order`, `color`) VALUES
('MEAT', 'Meat', 1, '#e74c3c'),
('POULTRY', 'Poultry', 2, '#c0392b'),
('VEG', 'Veg', 3, '#27ae60'),
('FRUIT', 'Fruit', 4, '#2ecc71'),
('FISH', 'Fish', 5, '#3498db'),
('DAIRY', 'Dairy', 6, '#9b59b6'),
('FROZEN', 'Frozen', 7, '#1abc9c'),
('HERBS_SPICES', 'Herbs & Spices', 8, '#e67e22'),
('OILS_FATS', 'Oils & Fats', 9, '#f39c12'),
('TINS_JARS', 'Tins & Jars', 10, '#7f8c8d'),
('GRAINS_PASTA', 'Grains & Pasta', 11, '#d35400'),
('CONDIMENTS_SAUCES', 'Condiments & Sauces', 12, '#f1c40f'),
('BAKERY', 'Bakery', 13, '#e74c3c'),
('NUTS', 'Nuts', 14, '#8e44ad'),
('SEEDS', 'Seeds', 15, '#16a085'),
('BEVERAGES', 'Beverages', 16, '#2980b9'),
('MISC', 'Misc', 17, '#bdc3c7');

-- ============================================
-- MEASUREMENT UNITS (23 units per requirements)
-- ============================================
INSERT INTO `units` (`key`, `value`, `category`) VALUES
-- Weight
('GRAM', 'g', 'weight'),
('KILOGRAM', 'kg', 'weight'),
('OUNCE', 'oz', 'weight'),
('POUND', 'lb', 'weight'),
-- Volume (Metric)
('MILLILITER', 'ml', 'volume_metric'),
('LITER', 'l', 'volume_metric'),
-- Volume (Imperial)
('TEASPOON', 'tsp', 'volume_imperial'),
('TABLESPOON', 'tbsp', 'volume_imperial'),
('CUP', 'cup', 'volume_imperial'),
-- Count
('PIECE', 'piece', 'count'),
('SLICE', 'slice', 'count'),
('HANDFUL', 'handful', 'count'),
('SMALL', 'small', 'count'),
('MEDIUM', 'medium', 'count'),
('LARGE', 'large', 'count'),
-- Container
('TIN', 'tin', 'container'),
('CAN', 'can', 'container'),
('PACK', 'pack', 'container'),
-- Cooking
('PINCH', 'pinch', 'cooking'),
('DASH', 'dash', 'cooking'),
('SPRIG', 'sprig', 'cooking'),
('CLOVE', 'clove', 'cooking'),
('LEAF', 'leaf', 'cooking'),
-- Other
('HEAD', 'head', 'other'),
('STALK', 'stalk', 'other'),
('NONE', '', 'other');

-- ============================================
-- INGREDIENTS (Sample ingredients by aisle)
-- ============================================

-- Get aisle IDs
SET @MEAT = (SELECT id FROM aisles WHERE `key` = 'MEAT');
SET @POULTRY = (SELECT id FROM aisles WHERE `key` = 'POULTRY');
SET @VEG = (SELECT id FROM aisles WHERE `key` = 'VEG');
SET @FRUIT = (SELECT id FROM aisles WHERE `key` = 'FRUIT');
SET @FISH = (SELECT id FROM aisles WHERE `key` = 'FISH');
SET @DAIRY = (SELECT id FROM aisles WHERE `key` = 'DAIRY');
SET @FROZEN = (SELECT id FROM aisles WHERE `key` = 'FROZEN');
SET @HERBS_SPICES = (SELECT id FROM aisles WHERE `key` = 'HERBS_SPICES');
SET @OILS_FATS = (SELECT id FROM aisles WHERE `key` = 'OILS_FATS');
SET @TINS_JARS = (SELECT id FROM aisles WHERE `key` = 'TINS_JARS');
SET @GRAINS_PASTA = (SELECT id FROM aisles WHERE `key` = 'GRAINS_PASTA');
SET @CONDIMENTS_SAUCES = (SELECT id FROM aisles WHERE `key` = 'CONDIMENTS_SAUCES');
SET @BAKERY = (SELECT id FROM aisles WHERE `key` = 'BAKERY');
SET @NUTS = (SELECT id FROM aisles WHERE `key` = 'NUTS');
SET @SEEDS = (SELECT id FROM aisles WHERE `key` = 'SEEDS');
SET @BEVERAGES = (SELECT id FROM aisles WHERE `key` = 'BEVERAGES');
SET @MISC = (SELECT id FROM aisles WHERE `key` = 'MISC');

-- Meat
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('BEEF_MINCE', 'Beef mince', @MEAT),
('BEEF_STEAK', 'Beef steak', @MEAT),
('PORK_MINCE', 'Pork mince', @MEAT),
('BACON', 'Bacon', @MEAT),
('SAUSAGE', 'Sausage', @MEAT);

-- Poultry
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('CHICKEN_BREAST', 'Chicken breast', @POULTRY),
('CHICKEN_THIGH', 'Chicken thigh', @POULTRY),
('CHICKEN_DRUMSTICK', 'Chicken drumstick', @POULTRY),
('TURKEY_MINCE', 'Turkey mince', @POULTRY),
('EGG', 'Egg', @POULTRY);

-- Vegetables
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('ONION', 'Onion', @VEG),
('GARLIC', 'Garlic', @VEG),
('TOMATO', 'Tomato', @VEG),
('CARROT', 'Carrot', @VEG),
('POTATO', 'Potato', @VEG),
('SWEET_POTATO', 'Sweet potato', @VEG),
('BROCCOLI', 'Broccoli', @VEG),
('SPINACH', 'Spinach', @VEG),
('LETTUCE', 'Lettuce', @VEG),
('CUCUMBER', 'Cucumber', @VEG),
('BELL_PEPPER', 'Bell pepper', @VEG),
('MUSHROOM', 'Mushroom', @VEG),
('COURGETTE', 'Courgette', @VEG),
('AUBERGINE', 'Aubergine', @VEG),
('CELERY', 'Celery', @VEG),
('SPRING_ONION', 'Spring onion', @VEG),
('AVOCADO', 'Avocado', @VEG);

-- Fruit
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('BANANA', 'Banana', @FRUIT),
('APPLE', 'Apple', @FRUIT),
('ORANGE', 'Orange', @FRUIT),
('LEMON', 'Lemon', @FRUIT),
('LIME', 'Lime', @FRUIT),
('STRAWBERRY', 'Strawberry', @FRUIT),
('BLUEBERRY', 'Blueberry', @FRUIT),
('RASPBERRY', 'Raspberry', @FRUIT);

-- Fish
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('SALMON', 'Salmon', @FISH),
('COD', 'Cod', @FISH),
('TUNA', 'Tuna', @FISH),
('PRAWNS', 'Prawns', @FISH);

-- Dairy
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('MILK', 'Milk', @DAIRY),
('BUTTER', 'Butter', @DAIRY),
('CHEDDAR_CHEESE', 'Cheddar cheese', @DAIRY),
('MOZZARELLA', 'Mozzarella', @DAIRY),
('PARMESAN', 'Parmesan', @DAIRY),
('GREEK_YOGURT', 'Greek yogurt', @DAIRY),
('CREAM', 'Cream', @DAIRY),
('CREAM_CHEESE', 'Cream cheese', @DAIRY),
('FETA_CHEESE', 'Feta cheese', @DAIRY);

-- Herbs & Spices
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('SALT', 'Salt', @HERBS_SPICES),
('BLACK_PEPPER', 'Black pepper', @HERBS_SPICES),
('PAPRIKA', 'Paprika', @HERBS_SPICES),
('CUMIN', 'Cumin', @HERBS_SPICES),
('OREGANO', 'Oregano', @HERBS_SPICES),
('BASIL', 'Basil', @HERBS_SPICES),
('THYME', 'Thyme', @HERBS_SPICES),
('ROSEMARY', 'Rosemary', @HERBS_SPICES),
('CINNAMON', 'Cinnamon', @HERBS_SPICES),
('GINGER', 'Ginger', @HERBS_SPICES),
('CHILLI_FLAKES', 'Chilli flakes', @HERBS_SPICES),
('TURMERIC', 'Turmeric', @HERBS_SPICES),
('CORIANDER', 'Coriander', @HERBS_SPICES),
('PARSLEY', 'Parsley', @HERBS_SPICES);

-- Oils & Fats
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('OLIVE_OIL', 'Olive oil', @OILS_FATS),
('VEGETABLE_OIL', 'Vegetable oil', @OILS_FATS),
('COCONUT_OIL', 'Coconut oil', @OILS_FATS),
('SESAME_OIL', 'Sesame oil', @OILS_FATS);

-- Grains & Pasta
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('RICE', 'Rice', @GRAINS_PASTA),
('BROWN_RICE', 'Brown rice', @GRAINS_PASTA),
('PASTA', 'Pasta', @GRAINS_PASTA),
('SPAGHETTI', 'Spaghetti', @GRAINS_PASTA),
('PENNE', 'Penne', @GRAINS_PASTA),
('ROLLED_OATS', 'Rolled oats', @GRAINS_PASTA),
('QUINOA', 'Quinoa', @GRAINS_PASTA),
('COUSCOUS', 'Couscous', @GRAINS_PASTA),
('FLOUR', 'Flour', @GRAINS_PASTA),
('BREADCRUMBS', 'Breadcrumbs', @GRAINS_PASTA);

-- Condiments & Sauces
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('SOY_SAUCE', 'Soy sauce', @CONDIMENTS_SAUCES),
('TOMATO_KETCHUP', 'Tomato ketchup', @CONDIMENTS_SAUCES),
('MAYONNAISE', 'Mayonnaise', @CONDIMENTS_SAUCES),
('MUSTARD', 'Mustard', @CONDIMENTS_SAUCES),
('HONEY', 'Honey', @CONDIMENTS_SAUCES),
('MAPLE_SYRUP', 'Maple syrup', @CONDIMENTS_SAUCES),
('VINEGAR', 'Vinegar', @CONDIMENTS_SAUCES),
('BALSAMIC_VINEGAR', 'Balsamic vinegar', @CONDIMENTS_SAUCES),
('HOT_SAUCE', 'Hot sauce', @CONDIMENTS_SAUCES),
('WORCESTERSHIRE_SAUCE', 'Worcestershire sauce', @CONDIMENTS_SAUCES);

-- Tins & Jars
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('TINNED_TOMATOES', 'Tinned tomatoes', @TINS_JARS),
('TOMATO_PASTE', 'Tomato paste', @TINS_JARS),
('COCONUT_MILK', 'Coconut milk', @TINS_JARS),
('CHICKPEAS', 'Chickpeas', @TINS_JARS),
('BLACK_BEANS', 'Black beans', @TINS_JARS),
('KIDNEY_BEANS', 'Kidney beans', @TINS_JARS),
('SWEETCORN', 'Sweetcorn', @TINS_JARS),
('OLIVES', 'Olives', @TINS_JARS);

-- Bakery
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('BREAD', 'Bread', @BAKERY),
('WHOLEMEAL_BREAD', 'Wholemeal bread', @BAKERY),
('TORTILLA', 'Tortilla', @BAKERY),
('PITTA_BREAD', 'Pitta bread', @BAKERY),
('NAAN_BREAD', 'Naan bread', @BAKERY),
('BURGER_BUN', 'Burger bun', @BAKERY),
('CROISSANT', 'Croissant', @BAKERY);

-- Nuts
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('ALMONDS', 'Almonds', @NUTS),
('WALNUTS', 'Walnuts', @NUTS),
('CASHEWS', 'Cashews', @NUTS),
('PEANUTS', 'Peanuts', @NUTS),
('PINE_NUTS', 'Pine nuts', @NUTS),
('PEANUT_BUTTER', 'Peanut butter', @NUTS),
('ALMOND_BUTTER', 'Almond butter', @NUTS);

-- Seeds
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('CHIA_SEEDS', 'Chia seeds', @SEEDS),
('FLAX_SEEDS', 'Flax seeds', @SEEDS),
('SUNFLOWER_SEEDS', 'Sunflower seeds', @SEEDS),
('PUMPKIN_SEEDS', 'Pumpkin seeds', @SEEDS),
('SESAME_SEEDS', 'Sesame seeds', @SEEDS);

-- Beverages
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('COFFEE', 'Coffee', @BEVERAGES),
('TEA', 'Tea', @BEVERAGES),
('ORANGE_JUICE', 'Orange juice', @BEVERAGES),
('APPLE_JUICE', 'Apple juice', @BEVERAGES),
('STOCK_CUBE', 'Stock cube', @BEVERAGES);

-- Misc
INSERT INTO `ingredients` (`key`, `name`, `aisle_id`) VALUES
('SUGAR', 'Sugar', @MISC),
('BROWN_SUGAR', 'Brown sugar', @MISC),
('VANILLA_EXTRACT', 'Vanilla extract', @MISC),
('BAKING_POWDER', 'Baking powder', @MISC),
('BICARBONATE_OF_SODA', 'Bicarbonate of soda', @MISC),
('CHOCOLATE_CHIPS', 'Chocolate chips', @MISC),
('COCOA_POWDER', 'Cocoa powder', @MISC);

-- ============================================
-- SAMPLE RECIPES
-- ============================================

-- Recipe 1: Porridge (Breakfast)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Porridge with Banana and Honey', 2, 440, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'BREAKFAST';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 100, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'ROLLED_OATS' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 400, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'MILK' AND u.`key` = 'MILLILITER'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'BANANA' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'HONEY' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'CINNAMON' AND u.`key` = 'TEASPOON';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Add oats and milk to a saucepan over medium heat'),
(@RECIPE_ID, 2, 'Stir continuously for 5-7 minutes until thickened'),
(@RECIPE_ID, 3, 'Slice the bananas'),
(@RECIPE_ID, 4, 'Pour porridge into bowls, top with banana slices'),
(@RECIPE_ID, 5, 'Drizzle with honey and sprinkle cinnamon');

-- Recipe 2: Scrambled Eggs on Toast (Breakfast)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Scrambled Eggs on Toast', 2, 520, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'BREAKFAST';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 4, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'EGG' AND u.`key` = 'LARGE'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'BREAD' AND u.`key` = 'SLICE'
UNION ALL
SELECT @RECIPE_ID, i.id, 20, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'BUTTER' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 50, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'MILK' AND u.`key` = 'MILLILITER'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'SALT' AND u.`key` = 'PINCH'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 6 FROM ingredients i, units u WHERE i.`key` = 'BLACK_PEPPER' AND u.`key` = 'PINCH';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Crack eggs into a bowl, add milk, salt and pepper, whisk well'),
(@RECIPE_ID, 2, 'Melt butter in a non-stick pan over low heat'),
(@RECIPE_ID, 3, 'Add egg mixture and stir gently with a spatula'),
(@RECIPE_ID, 4, 'Toast the bread'),
(@RECIPE_ID, 5, 'Serve scrambled eggs on toast');

-- Recipe 3: Chicken Stir Fry (Dinner)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Chicken Stir Fry', 2, 680, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'DINNER';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 400, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'CHICKEN_BREAST' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 200, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'RICE' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'BELL_PEPPER' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'BROCCOLI' AND u.`key` = 'HEAD'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'ONION' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 6 FROM ingredients i, units u WHERE i.`key` = 'GARLIC' AND u.`key` = 'CLOVE'
UNION ALL
SELECT @RECIPE_ID, i.id, 3, u.id, 7 FROM ingredients i, units u WHERE i.`key` = 'SOY_SAUCE' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 8 FROM ingredients i, units u WHERE i.`key` = 'SESAME_OIL' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 9 FROM ingredients i, units u WHERE i.`key` = 'VEGETABLE_OIL' AND u.`key` = 'TABLESPOON';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Cook rice according to package instructions'),
(@RECIPE_ID, 2, 'Slice chicken breast into strips'),
(@RECIPE_ID, 3, 'Chop vegetables into bite-sized pieces'),
(@RECIPE_ID, 4, 'Heat oil in a wok over high heat'),
(@RECIPE_ID, 5, 'Stir fry chicken until golden, about 5 minutes, then set aside'),
(@RECIPE_ID, 6, 'Add vegetables and garlic, stir fry for 3-4 minutes'),
(@RECIPE_ID, 7, 'Return chicken to wok, add soy sauce and sesame oil'),
(@RECIPE_ID, 8, 'Serve over rice');

-- Recipe 4: Spaghetti Bolognese (Dinner)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Spaghetti Bolognese', 4, 2400, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'DINNER';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 500, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'BEEF_MINCE' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 400, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'SPAGHETTI' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'TINNED_TOMATOES' AND u.`key` = 'TIN'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'TOMATO_PASTE' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'ONION' AND u.`key` = 'LARGE'
UNION ALL
SELECT @RECIPE_ID, i.id, 3, u.id, 6 FROM ingredients i, units u WHERE i.`key` = 'GARLIC' AND u.`key` = 'CLOVE'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 7 FROM ingredients i, units u WHERE i.`key` = 'CARROT' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 8 FROM ingredients i, units u WHERE i.`key` = 'CELERY' AND u.`key` = 'STALK'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 9 FROM ingredients i, units u WHERE i.`key` = 'OREGANO' AND u.`key` = 'TEASPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 10 FROM ingredients i, units u WHERE i.`key` = 'BASIL' AND u.`key` = 'TEASPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 50, u.id, 11 FROM ingredients i, units u WHERE i.`key` = 'PARMESAN' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 12 FROM ingredients i, units u WHERE i.`key` = 'OLIVE_OIL' AND u.`key` = 'TABLESPOON';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Finely dice onion, carrot, celery and garlic'),
(@RECIPE_ID, 2, 'Heat olive oil in a large pan, sauté vegetables until soft'),
(@RECIPE_ID, 3, 'Add beef mince, break up and brown for 8-10 minutes'),
(@RECIPE_ID, 4, 'Add tinned tomatoes, tomato paste, oregano and basil'),
(@RECIPE_ID, 5, 'Simmer for 30 minutes, stirring occasionally'),
(@RECIPE_ID, 6, 'Cook spaghetti according to package instructions'),
(@RECIPE_ID, 7, 'Serve sauce over spaghetti, topped with grated parmesan');

-- Recipe 5: Greek Salad (Lunch)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Greek Salad', 2, 360, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'LUNCH';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 1, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'CUCUMBER' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 4, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'TOMATO' AND u.`key` = 'MEDIUM'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'ONION' AND u.`key` = 'SMALL'
UNION ALL
SELECT @RECIPE_ID, i.id, 150, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'FETA_CHEESE' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 100, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'OLIVES' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 3, u.id, 6 FROM ingredients i, units u WHERE i.`key` = 'OLIVE_OIL' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 7 FROM ingredients i, units u WHERE i.`key` = 'OREGANO' AND u.`key` = 'TEASPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 8 FROM ingredients i, units u WHERE i.`key` = 'SALT' AND u.`key` = 'PINCH';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Chop cucumber and tomatoes into chunks'),
(@RECIPE_ID, 2, 'Thinly slice the red onion'),
(@RECIPE_ID, 3, 'Combine vegetables in a large bowl'),
(@RECIPE_ID, 4, 'Add olives and crumbled feta cheese'),
(@RECIPE_ID, 5, 'Drizzle with olive oil, season with oregano and salt'),
(@RECIPE_ID, 6, 'Toss gently and serve');

-- Recipe 6: Banana Smoothie (Snacks)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Banana Peanut Butter Smoothie', 1, 380, FALSE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'SNACKS';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 1, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'BANANA' AND u.`key` = 'LARGE'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'PEANUT_BUTTER' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 250, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'MILK' AND u.`key` = 'MILLILITER'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'HONEY' AND u.`key` = 'TABLESPOON';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Add all ingredients to a blender'),
(@RECIPE_ID, 2, 'Blend until smooth'),
(@RECIPE_ID, 3, 'Pour into a glass and serve immediately');

-- Recipe 7: Pancakes (Breakfast - Cheat)
INSERT INTO `recipes` (`name`, `default_servings`, `calories`, `is_cheat`, `is_live`)
VALUES ('Fluffy Pancakes with Maple Syrup', 2, 720, TRUE, TRUE);

SET @RECIPE_ID = LAST_INSERT_ID();

INSERT INTO `recipe_meals` (`recipe_id`, `meal_id`)
SELECT @RECIPE_ID, id FROM meals WHERE `key` = 'BREAKFAST';

INSERT INTO `recipe_ingredients` (`recipe_id`, `ingredient_id`, `quantity`, `unit_id`, `display_order`)
SELECT @RECIPE_ID, i.id, 200, u.id, 1 FROM ingredients i, units u WHERE i.`key` = 'FLOUR' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 2 FROM ingredients i, units u WHERE i.`key` = 'EGG' AND u.`key` = 'LARGE'
UNION ALL
SELECT @RECIPE_ID, i.id, 300, u.id, 3 FROM ingredients i, units u WHERE i.`key` = 'MILK' AND u.`key` = 'MILLILITER'
UNION ALL
SELECT @RECIPE_ID, i.id, 30, u.id, 4 FROM ingredients i, units u WHERE i.`key` = 'BUTTER' AND u.`key` = 'GRAM'
UNION ALL
SELECT @RECIPE_ID, i.id, 2, u.id, 5 FROM ingredients i, units u WHERE i.`key` = 'SUGAR' AND u.`key` = 'TABLESPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 1, u.id, 6 FROM ingredients i, units u WHERE i.`key` = 'BAKING_POWDER' AND u.`key` = 'TEASPOON'
UNION ALL
SELECT @RECIPE_ID, i.id, 4, u.id, 7 FROM ingredients i, units u WHERE i.`key` = 'MAPLE_SYRUP' AND u.`key` = 'TABLESPOON';

INSERT INTO `recipe_steps` (`recipe_id`, `step_number`, `instruction`) VALUES
(@RECIPE_ID, 1, 'Mix flour, sugar and baking powder in a bowl'),
(@RECIPE_ID, 2, 'In another bowl, whisk eggs, milk and melted butter'),
(@RECIPE_ID, 3, 'Combine wet and dry ingredients, mix until just combined'),
(@RECIPE_ID, 4, 'Heat a non-stick pan over medium heat'),
(@RECIPE_ID, 5, 'Pour batter to form pancakes, cook until bubbles form'),
(@RECIPE_ID, 6, 'Flip and cook other side until golden'),
(@RECIPE_ID, 7, 'Stack pancakes and drizzle with maple syrup');

SELECT 'Seed data inserted successfully' AS status;

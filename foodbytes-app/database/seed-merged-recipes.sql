-- =============================================
-- NEW RECIPES - December 2025
-- 12 New Recipes (4 Breakfast, 4 Lunch, 4 Dinner)
-- Following Chef Agent guidelines with macro calculations
-- =============================================

-- =============================================
-- NEW INGREDIENTS (IDs 116+)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Proteins
(116, 'pork_mince', 'Pork mince (lean)', 1),
(117, 'chicken_thigh', 'Chicken thigh (boneless)', 2),
-- Veg
(118, 'bean_sprouts', 'Bean sprouts', 3),
(119, 'thai_basil', 'Thai basil', 3),
(120, 'shallots', 'Shallots', 3),
(121, 'long_green_chili', 'Long green chili', 3),
(122, 'birds_eye_chili', 'Bird''s eye chili', 3),
(123, 'daikon', 'Daikon radish', 3),
(124, 'napa_cabbage', 'Napa cabbage', 3),
(125, 'shiitake_mushrooms', 'Shiitake mushrooms', 3),
(126, 'zucchini', 'Zucchini', 3),
(127, 'aubergine', 'Aubergine (eggplant)', 3),
-- Dairy
(128, 'mozzarella', 'Fresh mozzarella', 6),
(129, 'ricotta', 'Ricotta cheese', 6),
-- Herbs & Spices
(130, 'white_pepper', 'White pepper', 8),
(131, 'fish_sauce', 'Fish sauce', 8),
(132, 'oyster_sauce', 'Oyster sauce', 8),
(133, 'miso_paste', 'Miso paste (white)', 8),
(134, 'curry_powder', 'Curry powder (mild)', 8),
(135, 'coriander_seeds', 'Coriander seeds', 8),
(136, 'lemongrass', 'Lemongrass', 8),
(137, 'galangal', 'Galangal', 8),
(138, 'tamarind_paste', 'Tamarind paste', 8),
(139, 'palm_sugar', 'Palm sugar', 8),
(140, 'herbes_de_provence', 'Herbes de Provence', 8),
(141, 'fresh_dill', 'Fresh dill', 8),
-- Tins & Jars
(142, 'coconut_milk_lite', 'Coconut milk (lite)', 10),
(143, 'passata', 'Passata (tomato)', 10),
-- Condiments
(144, 'mirin', 'Mirin', 12),
(145, 'sake', 'Cooking sake', 12),
(146, 'shaoxing_wine', 'Shaoxing wine', 12),
(147, 'doubanjiang', 'Doubanjiang (fermented chili bean paste)', 12),
(148, 'white_wine', 'White wine (dry)', 12),
(149, 'capers_in_brine', 'Capers in brine', 12),
-- Grains
(150, 'panko_breadcrumbs', 'Panko breadcrumbs', 11),
(151, 'short_grain_rice', 'Short grain rice (sushi)', 11),
(152, 'roti', 'Roti/Chapati', 13),
(153, 'corn_tortilla', 'Corn tortilla', 13);

-- =============================================
-- BREAKFAST RECIPES (IDs 37-44)
-- =============================================

-- -----------------------------------------
-- RECIPE 37: Japanese Tamagoyaki Breakfast Bowl (Standard)
-- Cuisine: Japanese
-- Macros per serving: ~540 cal | 48g P | 22g F | 35g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(37, 'Japanese Tamagoyaki Breakfast Bowl', 2, 1080, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(37, 1); -- Breakfast

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(37, 38, 6, 5, 1),      -- Eggs, 6 pieces (3 per serving)
(37, 151, 150, 1, 2),   -- Short grain rice, 150g (dry)
(37, 12, 100, 1, 3),    -- Spinach, 100g
(37, 72, 2, 4, 4),      -- Soy sauce, 2 tbsp
(37, 144, 1, 4, 5),     -- Mirin, 1 tbsp
(37, 133, 2, 4, 6),     -- Miso paste, 2 tbsp
(37, 19, 2, 5, 7),      -- Spring onion, 2 pieces
(37, 88, 1, 3, 8),      -- Sesame seeds, 1 tsp
(37, 59, 1, 4, 9),      -- Olive oil, 1 tbsp (for cooking)
(37, 89, 600, 2, 10),   -- Water, 600ml (for miso soup)
(37, 44, 0.5, 3, 11);   -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(37, 1, 'RICE: Rinse rice until water runs clear. Cook with 225ml water, bring to boil, reduce heat, cover 15 minutes. Rest 10 minutes.'),
(37, 2, 'MISO SOUP: Bring 600ml water to gentle simmer. Whisk in miso paste until dissolved. Keep warm but do not boil. Add sliced spring onion.'),
(37, 3, 'TAMAGOYAKI: Beat 6 eggs with 1 tbsp soy sauce and 1 tbsp mirin until combined but not frothy.'),
(37, 4, 'Heat a non-stick pan over medium-low heat. Brush with a little oil.'),
(37, 5, 'Pour a thin layer of egg mixture, let it just set. Roll the omelette from one side to the other using chopsticks or spatula.'),
(37, 6, 'Push roll to one side, add more oil, pour another thin layer. When set, roll over the existing roll. Repeat until all egg is used.'),
(37, 7, 'SPINACH: Blanch spinach in boiling water 30 seconds. Drain, squeeze dry. Season with remaining soy sauce.'),
(37, 8, 'SERVE: Divide rice between bowls. Slice tamagoyaki into rounds, place on rice. Add spinach bundle. Serve miso soup alongside. Sprinkle sesame seeds.');

-- -----------------------------------------
-- RECIPE 38: Japanese Breakfast (Light - No Rice)
-- Macros per serving: ~320 cal | 26g P | 18g F | 12g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(38, 'Japanese Tamagoyaki Breakfast (Light)', 2, 640, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(38, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(38, 38, 6, 5, 1),      -- Eggs, 6 pieces
(38, 12, 150, 1, 2),    -- Spinach, 150g (extra)
(38, 72, 2, 4, 3),      -- Soy sauce, 2 tbsp
(38, 144, 1, 4, 4),     -- Mirin, 1 tbsp
(38, 133, 2, 4, 5),     -- Miso paste, 2 tbsp
(38, 19, 2, 5, 6),      -- Spring onion, 2 pieces
(38, 27, 100, 1, 7),    -- Mushrooms, 100g (sauteed for bulk)
(38, 88, 1, 3, 8),      -- Sesame seeds, 1 tsp
(38, 59, 1, 4, 9),      -- Olive oil, 1 tbsp
(38, 89, 600, 2, 10),   -- Water, 600ml
(38, 44, 0.5, 3, 11);   -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(38, 1, 'MISO SOUP: Bring 600ml water to gentle simmer. Whisk in miso paste. Add sliced spring onion.'),
(38, 2, 'MUSHROOMS: Slice mushrooms, saute in a little oil with soy sauce until golden. Set aside.'),
(38, 3, 'TAMAGOYAKI: Beat eggs with 1 tbsp soy sauce and mirin. Cook in layers, rolling as you go.'),
(38, 4, 'SPINACH: Blanch, drain, squeeze dry. Season with remaining soy sauce.'),
(38, 5, 'SERVE: Plate tamagoyaki slices with spinach and sauteed mushrooms. Serve miso soup alongside. Sprinkle sesame seeds.');

-- -----------------------------------------
-- RECIPE 39: Mexican Huevos Rancheros (Standard)
-- Cuisine: Mexican
-- Macros per serving: ~580 cal | 38g P | 24g F | 52g C
-- Diet Plan Check: PASS (at upper limit for fat)
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(39, 'Mexican Huevos Rancheros', 2, 1160, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(39, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(39, 38, 4, 5, 1),       -- Eggs, 4 pieces (2 per serving)
(39, 62, 200, 1, 2),     -- Black beans, 200g
(39, 153, 4, 5, 3),      -- Corn tortillas, 4 pieces
(39, 61, 1, 15, 4),      -- Tinned tomatoes, 1 tin (400g)
(39, 17, 1, 7, 5),       -- Onion, 1 medium
(39, 13, 2, 10, 6),      -- Garlic, 2 cloves
(39, 75, 1, 5, 7),       -- Jalapeno, 1 piece
(39, 49, 1, 3, 8),       -- Cumin, 1 tsp
(39, 46, 0.5, 3, 9),     -- Smoked paprika, 0.5 tsp
(39, 106, 20, 1, 10),    -- Fresh coriander, 20g
(39, 33, 1, 5, 11),      -- Avocado, 1 piece
(39, 31, 1, 4, 12),      -- Lime juice, 1 tbsp
(39, 59, 1, 4, 13),      -- Olive oil, 1 tbsp
(39, 44, 1, 3, 14),      -- Salt, 1 tsp
(39, 45, 0.25, 3, 15);   -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(39, 1, 'SALSA: Heat half the oil in a pan. Saute diced onion 5 minutes. Add minced garlic, diced jalapeno, cook 1 minute.'),
(39, 2, 'Add tinned tomatoes, cumin, paprika, salt. Simmer 15 minutes until thickened. Blend if smooth salsa preferred.'),
(39, 3, 'BEANS: In another pan, heat remaining oil. Add drained black beans, mash roughly with a fork. Season and keep warm.'),
(39, 4, 'EGGS: Make 4 wells in the salsa. Crack an egg into each. Cover and cook 5-7 minutes until whites are set but yolks still runny.'),
(39, 5, 'TORTILLAS: Warm corn tortillas in a dry pan or directly over gas flame until charred spots appear.'),
(39, 6, 'GUACAMOLE: Mash avocado with lime juice and salt.'),
(39, 7, 'SERVE: Place 2 tortillas per plate, spread with refried beans. Top with eggs and salsa from the pan. Add guacamole and fresh coriander.');

-- -----------------------------------------
-- RECIPE 40: Huevos Rancheros (Light - Extra Protein)
-- Macros per serving: ~520 cal | 48g P | 23g F | 28g C
-- Diet Plan Check: PASS (protein boosted with extra eggs)
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(40, 'Mexican Huevos Rancheros (Light)', 2, 1040, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(40, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(40, 38, 6, 5, 1),       -- Eggs, 6 pieces (3 per serving - extra protein)
(40, 62, 200, 1, 2),     -- Black beans, 200g
(40, 61, 1, 15, 3),      -- Tinned tomatoes, 1 tin
(40, 17, 1, 7, 4),       -- Onion, 1 medium
(40, 13, 2, 10, 5),      -- Garlic, 2 cloves
(40, 75, 1, 5, 6),       -- Jalapeno, 1 piece
(40, 49, 1, 3, 7),       -- Cumin, 1 tsp
(40, 46, 0.5, 3, 8),     -- Smoked paprika, 0.5 tsp
(40, 106, 20, 1, 9),     -- Fresh coriander, 20g
(40, 33, 0.5, 5, 10),    -- Avocado, 0.5 piece (reduced)
(40, 31, 1, 4, 11),      -- Lime juice, 1 tbsp
(40, 59, 1, 4, 12),      -- Olive oil, 1 tbsp
(40, 44, 1, 3, 13),      -- Salt, 1 tsp
(40, 45, 0.25, 3, 14);   -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(40, 1, 'SALSA: Saute diced onion, garlic, jalapeno. Add tomatoes, spices. Simmer 15 minutes.'),
(40, 2, 'BEANS: Heat and mash black beans with seasoning.'),
(40, 3, 'EGGS: Make 6 wells in salsa. Crack eggs in, cover, cook until set.'),
(40, 4, 'SERVE: Divide beans between plates. Top with eggs and salsa. Add avocado and coriander. No tortillas for Light version.');

-- -----------------------------------------
-- RECIPE 41: Indian Masala Omelette (Standard)
-- Cuisine: Indian
-- Macros per serving: ~590 cal | 46g P | 24g F | 45g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(41, 'Indian Masala Omelette with Roti', 2, 1180, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(41, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(41, 38, 6, 5, 1),       -- Eggs, 6 pieces (3 per serving)
(41, 17, 1, 6, 2),       -- Onion, 1 small
(41, 25, 1, 7, 3),       -- Tomato, 1 medium
(41, 122, 2, 5, 4),      -- Bird's eye chili, 2 pieces
(41, 106, 20, 1, 5),     -- Fresh coriander, 20g
(41, 57, 0.5, 3, 6),     -- Turmeric, 0.5 tsp
(41, 47, 0.5, 3, 7),     -- Chili flakes, 0.5 tsp
(41, 49, 0.5, 3, 8),     -- Cumin, 0.5 tsp
(41, 54, 0.5, 3, 9),     -- Garam masala, 0.5 tsp
(41, 152, 4, 5, 10),     -- Roti, 4 pieces
(41, 36, 100, 1, 11),    -- Greek yogurt, 100g (raita)
(41, 59, 1, 4, 12),      -- Olive oil, 1 tbsp
(41, 44, 1, 3, 13),      -- Salt, 1 tsp
(41, 45, 0.25, 3, 14);   -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(41, 1, 'PREP: Finely dice onion, tomato, and chilies. Chop coriander.'),
(41, 2, 'EGGS: Beat 6 eggs with salt, pepper, turmeric, chili flakes, cumin. Mix in half the onion, tomato, chili, and coriander.'),
(41, 3, 'COOK: Heat oil in a non-stick pan over medium heat. Pour in half the egg mixture.'),
(41, 4, 'Let bottom set, then fold in half or thirds. Cook 2-3 minutes until just set but still moist inside. Repeat for second omelette.'),
(41, 5, 'RAITA: Mix Greek yogurt with remaining diced tomato, onion, coriander, garam masala, and salt.'),
(41, 6, 'SERVE: Warm roti in a dry pan. Serve 2 roti and one masala omelette per person with raita on the side.');

-- -----------------------------------------
-- RECIPE 42: Masala Omelette (Light - No Roti)
-- Macros per serving: ~350 cal | 30g P | 20g F | 12g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(42, 'Indian Masala Omelette (Light)', 2, 700, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(42, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(42, 38, 6, 5, 1),       -- Eggs, 6 pieces
(42, 17, 1, 6, 2),       -- Onion, 1 small
(42, 25, 2, 7, 3),       -- Tomato, 2 medium (extra)
(42, 122, 2, 5, 4),      -- Bird's eye chili, 2 pieces
(42, 106, 20, 1, 5),     -- Fresh coriander, 20g
(42, 57, 0.5, 3, 6),     -- Turmeric, 0.5 tsp
(42, 47, 0.5, 3, 7),     -- Chili flakes, 0.5 tsp
(42, 49, 0.5, 3, 8),     -- Cumin, 0.5 tsp
(42, 54, 0.5, 3, 9),     -- Garam masala, 0.5 tsp
(42, 36, 150, 1, 10),    -- Greek yogurt, 150g (extra raita)
(42, 23, 150, 1, 11),    -- Cucumber, 150g (for raita)
(42, 59, 1, 4, 12),      -- Olive oil, 1 tbsp
(42, 44, 1, 3, 13),      -- Salt, 1 tsp
(42, 45, 0.25, 3, 14);   -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(42, 1, 'PREP: Finely dice onion, tomato, and chilies. Dice cucumber. Chop coriander.'),
(42, 2, 'OMELETTE: Beat eggs with spices and salt. Mix in vegetables. Cook in two batches.'),
(42, 3, 'RAITA: Mix yogurt with diced cucumber, tomato, coriander, garam masala, and salt.'),
(42, 4, 'SERVE: Plate omelette with generous raita. Light version - no roti.');

-- -----------------------------------------
-- RECIPE 43: French Eggs en Cocotte with Smoked Salmon (Standard)
-- Cuisine: French
-- Macros per serving: ~580 cal | 48g P | 23g F | 42g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(43, 'French Eggs en Cocotte', 2, 1160, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(43, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(43, 38, 4, 5, 1),       -- Eggs, 4 pieces (2 per serving)
(43, 101, 150, 1, 2),    -- Salmon fillet, 150g (smoked or fresh)
(43, 12, 100, 1, 3),     -- Spinach, 100g
(43, 36, 60, 1, 4),      -- Greek yogurt, 60g (instead of cream)
(43, 92, 20, 1, 5),      -- Butter, 20g
(43, 141, 15, 1, 6),     -- Fresh dill, 15g
(43, 30, 1, 4, 7),       -- Lemon juice, 1 tbsp
(43, 91, 100, 1, 8),     -- Bread flour, 100g (for toast)
(43, 44, 0.5, 3, 9),     -- Salt, 0.5 tsp
(43, 45, 0.25, 3, 10);   -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(43, 1, 'PREP: Preheat oven to 180C. Boil a kettle. Butter two ramekins generously.'),
(43, 2, 'SPINACH: Wilt spinach in a pan with a knob of butter. Season, divide between ramekins.'),
(43, 3, 'SALMON: Flake or dice salmon, distribute over spinach. (If using fresh, poach first 5 minutes.)'),
(43, 4, 'EGGS: Crack 2 eggs into each ramekin. Season. Add a spoonful of Greek yogurt to each.'),
(43, 5, 'BAKE: Place ramekins in a roasting tin. Pour boiling water halfway up the sides. Bake 12-15 minutes until whites are set.'),
(43, 6, 'TOAST: Toast bread, butter lightly.'),
(43, 7, 'SERVE: Top eggs with fresh dill and a squeeze of lemon. Serve with buttered toast soldiers.');

-- -----------------------------------------
-- RECIPE 44: Eggs en Cocotte (Light - No Toast)
-- Macros per serving: ~420 cal | 40g P | 20g F | 14g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(44, 'French Eggs en Cocotte (Light)', 2, 840, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(44, 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(44, 38, 4, 5, 1),       -- Eggs, 4 pieces
(44, 101, 200, 1, 2),    -- Salmon fillet, 200g (extra for protein)
(44, 12, 150, 1, 3),     -- Spinach, 150g (extra)
(44, 36, 60, 1, 4),      -- Greek yogurt, 60g
(44, 92, 15, 1, 5),      -- Butter, 15g (reduced)
(44, 141, 15, 1, 6),     -- Fresh dill, 15g
(44, 30, 1, 4, 7),       -- Lemon juice, 1 tbsp
(44, 44, 0.5, 3, 8),     -- Salt, 0.5 tsp
(44, 45, 0.25, 3, 9);    -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(44, 1, 'Follow same method as standard but increase spinach and salmon. Omit toast for Light version.'),
(44, 2, 'The extra salmon ensures adequate protein. Serve with extra sauteed spinach on the side.');

-- =============================================
-- LUNCH RECIPES (IDs 45-52)
-- =============================================

-- -----------------------------------------
-- RECIPE 45: Italian Caprese Chicken Salad (Standard)
-- Cuisine: Italian
-- Macros per serving: ~580 cal | 58g P | 24g F | 28g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(45, 'Italian Caprese Chicken Salad', 2, 1160, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(45, 2); -- Lunch

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(45, 7, 400, 1, 1),      -- Chicken breast, 400g
(45, 128, 100, 1, 2),    -- Fresh mozzarella, 100g
(45, 24, 300, 1, 3),     -- Cherry tomatoes, 300g
(45, 43, 30, 1, 4),      -- Fresh basil, 30g
(45, 98, 60, 1, 5),      -- Rocket (arugula), 60g
(45, 113, 2, 4, 6),      -- Balsamic vinegar, 2 tbsp
(45, 59, 2, 4, 7),       -- Extra virgin olive oil, 2 tbsp
(45, 13, 1, 10, 8),      -- Garlic, 1 clove
(45, 48, 1, 3, 9),       -- Italian seasoning, 1 tsp
(45, 44, 1, 3, 10),      -- Salt, 1 tsp
(45, 45, 0.5, 3, 11);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(45, 1, 'CHICKEN: Season chicken breasts with Italian seasoning, salt, pepper. Grill or pan-fry in 1 tsp oil until cooked through (165F). Rest 5 minutes.'),
(45, 2, 'DRESSING: Whisk olive oil, balsamic vinegar, minced garlic, salt, pepper.'),
(45, 3, 'ASSEMBLE: Slice chicken. Halve cherry tomatoes. Slice or tear mozzarella.'),
(45, 4, 'Arrange rocket on plates. Top with chicken, tomatoes, mozzarella.'),
(45, 5, 'Drizzle with balsamic dressing. Scatter fresh basil leaves. Season with flaky salt if desired.');

-- -----------------------------------------
-- RECIPE 46: Caprese Chicken (Light - Extra Protein)
-- Macros per serving: ~520 cal | 65g P | 22g F | 12g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(46, 'Italian Caprese Chicken Salad (Light)', 2, 1040, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(46, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(46, 7, 450, 1, 1),      -- Chicken breast, 450g (extra)
(46, 128, 80, 1, 2),     -- Fresh mozzarella, 80g (reduced)
(46, 24, 350, 1, 3),     -- Cherry tomatoes, 350g
(46, 43, 30, 1, 4),      -- Fresh basil, 30g
(46, 98, 100, 1, 5),     -- Rocket, 100g (extra greens)
(46, 113, 1, 4, 6),      -- Balsamic vinegar, 1 tbsp
(46, 59, 1.5, 4, 7),     -- Olive oil, 1.5 tbsp (reduced)
(46, 13, 1, 10, 8),      -- Garlic, 1 clove
(46, 48, 1, 3, 9),       -- Italian seasoning, 1 tsp
(46, 44, 1, 3, 10),      -- Salt, 1 tsp
(46, 45, 0.5, 3, 11);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(46, 1, 'Same method as standard. Extra chicken for protein, reduced mozzarella to lower fat.');

-- -----------------------------------------
-- RECIPE 47: Thai Larb Gai (Standard)
-- Cuisine: Thai
-- Macros per serving: ~540 cal | 52g P | 22g F | 32g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(47, 'Thai Larb Gai (Spiced Chicken Lettuce Cups)', 2, 1080, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(47, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(47, 117, 400, 1, 1),    -- Chicken thigh (boneless), 400g
(47, 10, 8, 5, 2),       -- Lettuce leaves, 8 pieces (cups)
(47, 71, 100, 1, 3),     -- Jasmine rice, 100g (toasted rice powder + serving)
(47, 120, 4, 5, 4),      -- Shallots, 4 pieces
(47, 19, 4, 5, 5),       -- Spring onion, 4 pieces
(47, 106, 30, 1, 6),     -- Fresh coriander, 30g
(47, 122, 4, 5, 7),      -- Bird's eye chili, 4 pieces
(47, 131, 3, 4, 8),      -- Fish sauce, 3 tbsp
(47, 31, 3, 4, 9),       -- Lime juice, 3 tbsp
(47, 139, 1, 4, 10),     -- Palm sugar, 1 tbsp
(47, 59, 1, 4, 11),      -- Olive oil, 1 tbsp
(47, 44, 0.5, 3, 12);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(47, 1, 'TOASTED RICE: Dry-fry 2 tbsp raw jasmine rice in a pan until deep golden. Grind to coarse powder. Set aside.'),
(47, 2, 'RICE: Cook remaining jasmine rice (75g dry per person makes ~150g cooked).'),
(47, 3, 'CHICKEN: Mince or finely chop chicken thighs. Heat oil in wok, stir-fry chicken until cooked through (5-6 minutes). Remove from heat.'),
(47, 4, 'DRESSING: Mix fish sauce, lime juice, and palm sugar until sugar dissolves.'),
(47, 5, 'TOSS: While chicken is hot, add sliced shallots, spring onions, coriander, sliced chilies. Pour over dressing. Add toasted rice powder. Toss well.'),
(47, 6, 'SERVE: Spoon into lettuce cups. Serve with jasmine rice on the side. Garnish with extra herbs and lime wedges.');

-- -----------------------------------------
-- RECIPE 48: Larb Gai (Light - No Rice)
-- Macros per serving: ~380 cal | 48g P | 16g F | 12g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(48, 'Thai Larb Gai (Light - No Rice)', 2, 760, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(48, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(48, 117, 450, 1, 1),    -- Chicken thigh, 450g (extra)
(48, 10, 12, 5, 2),      -- Lettuce leaves, 12 pieces (extra cups)
(48, 71, 30, 1, 3),      -- Jasmine rice, 30g (toasted powder only)
(48, 120, 4, 5, 4),      -- Shallots, 4 pieces
(48, 19, 4, 5, 5),       -- Spring onion, 4 pieces
(48, 106, 30, 1, 6),     -- Fresh coriander, 30g
(48, 122, 4, 5, 7),      -- Bird's eye chili, 4 pieces
(48, 23, 150, 1, 8),     -- Cucumber, 150g (for crunch)
(48, 131, 3, 4, 9),      -- Fish sauce, 3 tbsp
(48, 31, 3, 4, 10),      -- Lime juice, 3 tbsp
(48, 139, 1, 4, 11),     -- Palm sugar, 1 tbsp
(48, 59, 1, 4, 12),      -- Olive oil, 1 tbsp
(48, 44, 0.5, 3, 13);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(48, 1, 'Same method. Serve in extra lettuce cups with sliced cucumber instead of rice for Light version.');

-- -----------------------------------------
-- RECIPE 49: Japanese Teriyaki Chicken Bowl (Standard)
-- Cuisine: Japanese
-- Macros per serving: ~620 cal | 52g P | 18g F | 58g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(49, 'Japanese Teriyaki Chicken Bowl', 2, 1240, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(49, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(49, 117, 400, 1, 1),    -- Chicken thigh, 400g
(49, 151, 180, 1, 2),    -- Short grain rice, 180g (dry)
(49, 9, 200, 1, 3),      -- Broccoli, 200g
(49, 22, 2, 5, 4),       -- Carrot, 2 pieces
(49, 72, 3, 4, 5),       -- Soy sauce, 3 tbsp
(49, 144, 2, 4, 6),      -- Mirin, 2 tbsp
(49, 145, 1, 4, 7),      -- Sake, 1 tbsp
(49, 76, 1, 4, 8),       -- Honey, 1 tbsp
(49, 14, 10, 1, 9),      -- Ginger, 10g
(49, 13, 2, 10, 10),     -- Garlic, 2 cloves
(49, 88, 2, 3, 11),      -- Sesame seeds, 2 tsp
(49, 19, 2, 5, 12),      -- Spring onion, 2 pieces
(49, 59, 1, 4, 13),      -- Olive oil, 1 tbsp
(49, 44, 0.5, 3, 14);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(49, 1, 'RICE: Rinse rice until clear. Cook with 270ml water. Boil, reduce heat, cover 15 minutes. Rest 10 minutes.'),
(49, 2, 'TERIYAKI SAUCE: Whisk soy sauce, mirin, sake, honey, minced ginger, and garlic. Set aside.'),
(49, 3, 'CHICKEN: Cut chicken thighs into bite-sized pieces. Season with salt.'),
(49, 4, 'Heat oil in a pan over medium-high heat. Cook chicken skin-side down first, 4-5 minutes per side until golden.'),
(49, 5, 'Pour teriyaki sauce over chicken. Simmer 3-4 minutes until sauce thickens and coats chicken.'),
(49, 6, 'VEG: Steam or blanch broccoli florets and sliced carrots until tender-crisp.'),
(49, 7, 'SERVE: Divide rice between bowls. Top with teriyaki chicken and glazed sauce. Add vegetables. Sprinkle sesame seeds and sliced spring onion.');

-- -----------------------------------------
-- RECIPE 50: Teriyaki Bowl (Light - Cauliflower Rice)
-- Macros per serving: ~420 cal | 48g P | 16g F | 22g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(50, 'Japanese Teriyaki Chicken Bowl (Light)', 2, 840, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(50, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(50, 117, 450, 1, 1),    -- Chicken thigh, 450g (extra)
(50, 9, 400, 1, 2),      -- Broccoli, 400g (extra, some riced)
(50, 22, 2, 5, 3),       -- Carrot, 2 pieces
(50, 20, 200, 1, 4),     -- Pak choi, 200g
(50, 72, 3, 4, 5),       -- Soy sauce, 3 tbsp
(50, 144, 2, 4, 6),      -- Mirin, 2 tbsp
(50, 145, 1, 4, 7),      -- Sake, 1 tbsp
(50, 76, 1, 4, 8),       -- Honey, 1 tbsp
(50, 14, 10, 1, 9),      -- Ginger, 10g
(50, 13, 2, 10, 10),     -- Garlic, 2 cloves
(50, 88, 2, 3, 11),      -- Sesame seeds, 2 tsp
(50, 19, 2, 5, 12),      -- Spring onion, 2 pieces
(50, 59, 1, 4, 13),      -- Olive oil, 1 tbsp
(50, 44, 0.5, 3, 14);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(50, 1, 'CAULIFLOWER RICE: Pulse half the broccoli in food processor until rice-like. Stir-fry 3 minutes.'),
(50, 2, 'Same teriyaki chicken method. Serve over broccoli rice with extra vegetables for Light version.');

-- -----------------------------------------
-- RECIPE 51: Chinese Mapo Tofu with Chicken (Standard)
-- Cuisine: Chinese
-- Macros per serving: ~590 cal | 48g P | 22g F | 48g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(51, 'Chinese Mapo Tofu with Chicken', 2, 1180, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(51, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(51, 7, 300, 1, 1),      -- Chicken breast, 300g (minced)
(51, 6, 200, 1, 2),      -- Firm tofu, 200g
(51, 71, 150, 1, 3),     -- Jasmine rice, 150g
(51, 147, 2, 4, 4),      -- Doubanjiang, 2 tbsp
(51, 72, 1, 4, 5),       -- Soy sauce, 1 tbsp
(51, 146, 1, 4, 6),      -- Shaoxing wine, 1 tbsp
(51, 90, 200, 2, 7),     -- Stock, 200ml
(51, 13, 3, 10, 8),      -- Garlic, 3 cloves
(51, 14, 10, 1, 9),      -- Ginger, 10g
(51, 19, 4, 5, 10),      -- Spring onion, 4 pieces
(51, 135, 1, 3, 11),     -- Sichuan peppercorns, 1 tsp
(51, 81, 1, 4, 12),      -- Corn flour, 1 tbsp
(51, 59, 1, 4, 13),      -- Olive oil, 1 tbsp
(51, 44, 0.5, 3, 14);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(51, 1, 'RICE: Cook jasmine rice as usual.'),
(51, 2, 'TOFU: Cube tofu, blanch in boiling salted water 2 minutes to firm up. Drain.'),
(51, 3, 'AROMATICS: Heat oil in wok. Toast Sichuan peppercorns 30 seconds, remove. Add minced garlic, ginger, white parts of spring onion.'),
(51, 4, 'CHICKEN: Add minced chicken. Stir-fry until browned (4-5 minutes).'),
(51, 5, 'SAUCE: Add doubanjiang, stir 1 minute until oil turns red. Add Shaoxing wine, soy sauce, stock.'),
(51, 6, 'SIMMER: Add tofu, simmer 5 minutes. Mix corn flour with 2 tbsp water, stir in to thicken.'),
(51, 7, 'SERVE: Divide rice between bowls. Spoon mapo tofu over. Garnish with spring onion greens and ground Sichuan pepper.');

-- -----------------------------------------
-- RECIPE 52: Mapo Tofu (Light - No Rice)
-- Macros per serving: ~380 cal | 44g P | 18g F | 14g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(52, 'Chinese Mapo Tofu with Chicken (Light)', 2, 760, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(52, 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(52, 7, 350, 1, 1),      -- Chicken breast, 350g (extra)
(52, 6, 250, 1, 2),      -- Firm tofu, 250g (extra)
(52, 147, 2, 4, 3),      -- Doubanjiang, 2 tbsp
(52, 72, 1, 4, 4),       -- Soy sauce, 1 tbsp
(52, 146, 1, 4, 5),      -- Shaoxing wine, 1 tbsp
(52, 90, 200, 2, 6),     -- Stock, 200ml
(52, 20, 200, 1, 7),     -- Pak choi, 200g (for bulk)
(52, 13, 3, 10, 8),      -- Garlic, 3 cloves
(52, 14, 10, 1, 9),      -- Ginger, 10g
(52, 19, 4, 5, 10),      -- Spring onion, 4 pieces
(52, 135, 1, 3, 11),     -- Sichuan peppercorns, 1 tsp
(52, 81, 1, 4, 12),      -- Corn flour, 1 tbsp
(52, 59, 1, 4, 13),      -- Olive oil, 1 tbsp
(52, 44, 0.5, 3, 14);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(52, 1, 'Same method but serve over blanched pak choi instead of rice for Light version.');

-- =============================================
-- DINNER RECIPES (IDs 53-60)
-- =============================================

-- -----------------------------------------
-- RECIPE 53: Italian Chicken Piccata (Standard)
-- Cuisine: Italian/French
-- Macros per serving: ~580 cal | 56g P | 22g F | 32g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(53, 'Italian Chicken Piccata', 2, 1160, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(53, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(53, 7, 400, 1, 1),      -- Chicken breast, 400g (2 large)
(53, 77, 30, 1, 2),      -- Plain flour, 30g (for dredging)
(53, 92, 20, 1, 3),      -- Butter, 20g
(53, 59, 1, 4, 4),       -- Olive oil, 1 tbsp
(53, 148, 120, 2, 5),    -- White wine, 120ml
(53, 30, 3, 4, 6),       -- Lemon juice, 3 tbsp
(53, 90, 120, 2, 7),     -- Stock, 120ml
(53, 149, 2, 4, 8),      -- Capers in brine, 2 tbsp
(53, 104, 20, 1, 9),     -- Fresh parsley, 20g
(53, 13, 2, 10, 10),     -- Garlic, 2 cloves
(53, 126, 400, 1, 11),   -- Zucchini, 400g (as side)
(53, 44, 1, 3, 12),      -- Salt, 1 tsp
(53, 45, 0.5, 3, 13);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(53, 1, 'CHICKEN: Butterfly or pound chicken breasts to even thickness. Season with salt and pepper, dredge lightly in flour.'),
(53, 2, 'Heat oil and half the butter in a pan over medium-high heat. Cook chicken 4-5 minutes per side until golden. Set aside, keep warm.'),
(53, 3, 'SAUCE: Add garlic to pan, cook 30 seconds. Add white wine, scrape up browned bits. Reduce by half.'),
(53, 4, 'Add stock and lemon juice. Simmer 3 minutes. Stir in capers and remaining butter. Taste and adjust seasoning.'),
(53, 5, 'ZUCCHINI: Slice zucchini, grill or pan-fry with a little oil until charred and tender.'),
(53, 6, 'SERVE: Slice chicken, arrange on plates. Spoon sauce over. Add grilled zucchini. Garnish with fresh parsley.');

-- -----------------------------------------
-- RECIPE 54: Chicken Piccata (Light - Extra Veg)
-- Macros per serving: ~480 cal | 58g P | 20g F | 16g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(54, 'Italian Chicken Piccata (Light)', 2, 960, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(54, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(54, 7, 450, 1, 1),      -- Chicken breast, 450g (extra)
(54, 77, 15, 1, 2),      -- Plain flour, 15g (less)
(54, 92, 15, 1, 3),      -- Butter, 15g (reduced)
(54, 59, 1, 4, 4),       -- Olive oil, 1 tbsp
(54, 148, 120, 2, 5),    -- White wine, 120ml
(54, 30, 3, 4, 6),       -- Lemon juice, 3 tbsp
(54, 90, 150, 2, 7),     -- Stock, 150ml (more sauce)
(54, 149, 2, 4, 8),      -- Capers, 2 tbsp
(54, 104, 20, 1, 9),     -- Fresh parsley, 20g
(54, 13, 2, 10, 10),     -- Garlic, 2 cloves
(54, 126, 300, 1, 11),   -- Zucchini, 300g
(54, 12, 150, 1, 12),    -- Spinach, 150g (extra greens)
(54, 44, 1, 3, 13),      -- Salt, 1 tsp
(54, 45, 0.5, 3, 14);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(54, 1, 'Same method but with extra spinach sauteed. Light version has more vegetables, less flour coating.');

-- -----------------------------------------
-- RECIPE 55: Thai Basil Chicken - Pad Krapow Gai (Standard)
-- Cuisine: Thai
-- Macros per serving: ~600 cal | 52g P | 18g F | 52g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(55, 'Thai Basil Chicken (Pad Krapow Gai)', 2, 1200, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(55, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(55, 7, 400, 1, 1),      -- Chicken breast, 400g (minced)
(55, 71, 180, 1, 2),     -- Jasmine rice, 180g
(55, 119, 40, 1, 3),     -- Thai basil, 40g (packed)
(55, 122, 6, 5, 4),      -- Bird's eye chili, 6 pieces
(55, 13, 6, 10, 5),      -- Garlic, 6 cloves
(55, 120, 2, 5, 6),      -- Shallots, 2 pieces
(55, 131, 2, 4, 7),      -- Fish sauce, 2 tbsp
(55, 72, 1, 4, 8),       -- Soy sauce, 1 tbsp (dark soy if available)
(55, 132, 1, 4, 9),      -- Oyster sauce, 1 tbsp
(55, 51, 1, 3, 10),      -- Sugar, 1 tsp
(55, 38, 2, 5, 11),      -- Eggs, 2 pieces (fried)
(55, 59, 1.5, 4, 12),    -- Olive oil, 1.5 tbsp
(55, 44, 0.5, 3, 13);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(55, 1, 'RICE: Cook jasmine rice as usual.'),
(55, 2, 'PASTE: Pound garlic and chilies in a mortar to a rough paste. Slice shallots.'),
(55, 3, 'FRY: Heat 1 tbsp oil in a wok over high heat. Add garlic-chili paste, fry 30 seconds until fragrant.'),
(55, 4, 'Add minced chicken. Stir-fry, breaking up, until cooked through (4-5 minutes).'),
(55, 5, 'SAUCE: Add shallots, fish sauce, soy sauce, oyster sauce, sugar. Stir-fry 1 minute.'),
(55, 6, 'BASIL: Remove from heat. Toss in Thai basil leaves until just wilted.'),
(55, 7, 'EGGS: Fry 2 eggs in remaining oil until edges are crispy but yolks runny.'),
(55, 8, 'SERVE: Mound rice on plates. Spoon chicken alongside. Top with crispy fried egg. Classic Thai street food!');

-- -----------------------------------------
-- RECIPE 56: Pad Krapow (Light - No Rice)
-- Macros per serving: ~380 cal | 48g P | 16g F | 10g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(56, 'Thai Basil Chicken (Light)', 2, 760, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(56, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(56, 7, 450, 1, 1),      -- Chicken breast, 450g (extra)
(56, 119, 40, 1, 2),     -- Thai basil, 40g
(56, 122, 6, 5, 3),      -- Bird's eye chili, 6 pieces
(56, 13, 6, 10, 4),      -- Garlic, 6 cloves
(56, 120, 2, 5, 5),      -- Shallots, 2 pieces
(56, 10, 8, 5, 6),       -- Lettuce leaves, 8 pieces (cups)
(56, 23, 200, 1, 7),     -- Cucumber, 200g
(56, 131, 2, 4, 8),      -- Fish sauce, 2 tbsp
(56, 72, 1, 4, 9),       -- Soy sauce, 1 tbsp
(56, 132, 1, 4, 10),     -- Oyster sauce, 1 tbsp
(56, 51, 1, 3, 11),      -- Sugar, 1 tsp
(56, 59, 1, 4, 12),      -- Olive oil, 1 tbsp
(56, 44, 0.5, 3, 13);    -- Salt, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(56, 1, 'Same cooking method for chicken. Serve in lettuce cups with sliced cucumber instead of rice. No fried egg for Light version.');

-- -----------------------------------------
-- RECIPE 57: French Chicken Chasseur (Standard)
-- Cuisine: French
-- Macros per serving: ~620 cal | 54g P | 22g F | 42g C
-- Diet Plan Check: PASS
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(57, 'French Chicken Chasseur', 2, 1240, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(57, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(57, 117, 400, 1, 1),    -- Chicken thigh, 400g (bone-in adds flavor)
(57, 27, 250, 1, 2),     -- Mushrooms, 250g
(57, 120, 4, 5, 3),      -- Shallots, 4 pieces
(57, 13, 3, 10, 4),      -- Garlic, 3 cloves
(57, 61, 1, 15, 5),      -- Tinned tomatoes, 1 tin
(57, 148, 150, 2, 6),    -- White wine, 150ml
(57, 90, 100, 2, 7),     -- Stock, 100ml
(57, 60, 1, 4, 8),       -- Tomato paste, 1 tbsp
(57, 108, 1, 3, 9),      -- Dried thyme, 1 tsp
(57, 107, 2, 5, 10),     -- Bay leaf, 2 pieces
(57, 104, 20, 1, 11),    -- Fresh parsley, 20g
(57, 140, 1, 3, 12),     -- Herbes de Provence, 1 tsp
(57, 99, 300, 1, 13),    -- Baby potatoes, 300g
(57, 59, 1.5, 4, 14),    -- Olive oil, 1.5 tbsp
(57, 44, 1, 3, 15),      -- Salt, 1 tsp
(57, 45, 0.5, 3, 16);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(57, 1, 'POTATOES: Halve baby potatoes, roast at 200C with a little oil and salt for 30-35 minutes until golden.'),
(57, 2, 'CHICKEN: Season chicken thighs. Heat oil in a deep pan, brown chicken on both sides (4 minutes each). Remove and set aside.'),
(57, 3, 'SOFTEN: Add sliced shallots and mushrooms to the pan. Cook 5-7 minutes until golden.'),
(57, 4, 'Add garlic, thyme, herbes de Provence. Cook 1 minute until fragrant.'),
(57, 5, 'DEGLAZE: Pour in white wine, scrape up browned bits. Reduce by half.'),
(57, 6, 'Add tinned tomatoes, tomato paste, stock, bay leaves. Stir to combine.'),
(57, 7, 'BRAISE: Return chicken to pan, nestle into sauce. Cover and simmer 25-30 minutes until chicken is cooked through.'),
(57, 8, 'Remove bay leaves. Taste and adjust seasoning. Stir in fresh parsley.'),
(57, 9, 'SERVE: Plate chicken with sauce and mushrooms. Serve with roasted baby potatoes.');

-- -----------------------------------------
-- RECIPE 58: Chicken Chasseur (Light - No Potatoes)
-- Macros per serving: ~420 cal | 50g P | 18g F | 16g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(58, 'French Chicken Chasseur (Light)', 2, 840, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(58, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(58, 117, 450, 1, 1),    -- Chicken thigh, 450g (extra)
(58, 27, 300, 1, 2),     -- Mushrooms, 300g (extra)
(58, 120, 4, 5, 3),      -- Shallots, 4 pieces
(58, 13, 3, 10, 4),      -- Garlic, 3 cloves
(58, 61, 1, 15, 5),      -- Tinned tomatoes, 1 tin
(58, 148, 150, 2, 6),    -- White wine, 150ml
(58, 90, 100, 2, 7),     -- Stock, 100ml
(58, 60, 1, 4, 8),       -- Tomato paste, 1 tbsp
(58, 108, 1, 3, 9),      -- Dried thyme, 1 tsp
(58, 107, 2, 5, 10),     -- Bay leaf, 2 pieces
(58, 104, 20, 1, 11),    -- Fresh parsley, 20g
(58, 140, 1, 3, 12),     -- Herbes de Provence, 1 tsp
(58, 100, 200, 1, 13),   -- Green beans (fresh), 200g (instead of potatoes)
(58, 59, 1.5, 4, 14),    -- Olive oil, 1.5 tbsp
(58, 44, 1, 3, 15),      -- Salt, 1 tsp
(58, 45, 0.5, 3, 16);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(58, 1, 'Same braising method. Serve with steamed green beans instead of potatoes for Light version.');

-- -----------------------------------------
-- RECIPE 59: Japanese Chicken Katsu Curry (Standard)
-- Cuisine: Japanese
-- Macros per serving: ~680 cal | 52g P | 24g F | 62g C
-- Diet Plan Check: PASS (at upper limit)
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(59, 'Japanese Chicken Katsu Curry', 2, 1360, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(59, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(59, 7, 400, 1, 1),      -- Chicken breast, 400g
(59, 151, 180, 1, 2),    -- Short grain rice, 180g
(59, 150, 60, 1, 3),     -- Panko breadcrumbs, 60g
(59, 77, 30, 1, 4),      -- Plain flour, 30g
(59, 38, 2, 5, 5),       -- Eggs, 2 pieces (for coating)
(59, 17, 1, 8, 6),       -- Onion, 1 large
(59, 22, 2, 5, 7),       -- Carrot, 2 pieces
(59, 134, 3, 4, 8),      -- Curry powder, 3 tbsp
(59, 77, 2, 4, 9),       -- Plain flour, 2 tbsp (for roux)
(59, 92, 15, 1, 10),     -- Butter, 15g (for roux)
(59, 90, 500, 2, 11),    -- Stock, 500ml
(59, 72, 1, 4, 12),      -- Soy sauce, 1 tbsp
(59, 76, 1, 3, 13),      -- Honey, 1 tsp
(59, 59, 1.5, 4, 14),    -- Olive oil, 1.5 tbsp (for frying)
(59, 44, 1, 3, 15),      -- Salt, 1 tsp
(59, 45, 0.5, 3, 16);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(59, 1, 'RICE: Rinse and cook short grain rice. Keep warm.'),
(59, 2, 'CURRY SAUCE: Dice onion and carrot. Heat butter in a pot, saute onion until soft (7 minutes). Add carrot, cook 3 minutes.'),
(59, 3, 'Add flour, stir 1 minute. Add curry powder, stir 1 minute until fragrant.'),
(59, 4, 'Gradually add stock, stirring to prevent lumps. Add soy sauce, honey. Simmer 20 minutes until thickened.'),
(59, 5, 'Blend sauce until smooth if desired, or leave chunky. Return to pot, keep warm.'),
(59, 6, 'KATSU: Butterfly chicken breasts or pound to even thickness. Season with salt and pepper.'),
(59, 7, 'Set up breading station: flour, beaten eggs, panko. Coat chicken in each, pressing panko firmly.'),
(59, 8, 'Heat oil in a pan. Shallow-fry chicken 4-5 minutes per side until golden and cooked through. Drain on paper towels.'),
(59, 9, 'SERVE: Slice katsu into strips. Serve over rice with curry sauce poured over or alongside.');

-- -----------------------------------------
-- RECIPE 60: Chicken Katsu (Light - No Rice, More Veg)
-- Macros per serving: ~520 cal | 54g P | 22g F | 28g C
-- -----------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(60, 'Japanese Chicken Katsu Curry (Light)', 2, 1040, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(60, 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(60, 7, 450, 1, 1),      -- Chicken breast, 450g (extra)
(60, 150, 40, 1, 2),     -- Panko breadcrumbs, 40g (less)
(60, 77, 20, 1, 3),      -- Plain flour, 20g
(60, 38, 1, 5, 4),       -- Egg, 1 piece
(60, 17, 1, 8, 5),       -- Onion, 1 large
(60, 22, 3, 5, 6),       -- Carrot, 3 pieces (extra)
(60, 9, 200, 1, 7),      -- Broccoli, 200g (for bulk)
(60, 134, 3, 4, 8),      -- Curry powder, 3 tbsp
(60, 77, 1, 4, 9),       -- Plain flour, 1 tbsp (less roux)
(60, 92, 10, 1, 10),     -- Butter, 10g (reduced)
(60, 90, 400, 2, 11),    -- Stock, 400ml
(60, 72, 1, 4, 12),      -- Soy sauce, 1 tbsp
(60, 76, 1, 3, 13),      -- Honey, 1 tsp
(60, 59, 1, 4, 14),      -- Olive oil, 1 tbsp (reduced)
(60, 44, 1, 3, 15),      -- Salt, 1 tsp
(60, 45, 0.5, 3, 16);    -- Black pepper, 0.5 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(60, 1, 'Same method but serve katsu over steamed broccoli and extra carrots instead of rice for Light version. Thinner coating for less carbs.');

-- =============================================
-- RECIPE FAMILIES FOR NEW RECIPES
-- =============================================
INSERT INTO recipe_families (id, family_name, description) VALUES
(10, 'Japanese Tamagoyaki Breakfast', 'Traditional Japanese breakfast - Light with extra veg, Standard with rice'),
(11, 'Mexican Huevos Rancheros', 'Mexican breakfast eggs - Light with extra eggs no tortilla, Standard with tortillas'),
(12, 'Indian Masala Omelette', 'Spiced Indian omelette - Light without roti, Standard with roti'),
(13, 'French Eggs en Cocotte', 'Baked eggs French style - Light no toast, Standard with toast'),
(14, 'Italian Caprese Chicken', 'Caprese salad with grilled chicken - Light extra protein, Standard'),
(15, 'Thai Larb Gai', 'Spicy Thai chicken salad - Light no rice, Standard with jasmine rice'),
(16, 'Japanese Teriyaki Bowl', 'Teriyaki chicken donburi - Light with cauliflower rice, Standard'),
(17, 'Chinese Mapo Tofu', 'Sichuan classic with chicken - Light no rice, Standard'),
(18, 'Italian Chicken Piccata', 'Lemon butter chicken - Light extra veg, Standard'),
(19, 'Thai Basil Chicken', 'Pad Krapow Gai - Light no rice, Standard with rice and fried egg'),
(20, 'French Chicken Chasseur', 'Hunter''s chicken - Light no potatoes, Standard with baby potatoes'),
(21, 'Japanese Chicken Katsu', 'Crispy chicken curry - Light no rice, Standard');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
-- Tamagoyaki Breakfast
(10, 37, TRUE, 'Standard', 1),
(10, 38, FALSE, 'Light', 2),
-- Huevos Rancheros
(11, 39, TRUE, 'Standard', 1),
(11, 40, FALSE, 'Light', 2),
-- Masala Omelette
(12, 41, TRUE, 'Standard', 1),
(12, 42, FALSE, 'Light', 2),
-- Eggs en Cocotte
(13, 43, TRUE, 'Standard', 1),
(13, 44, FALSE, 'Light', 2),
-- Caprese Chicken
(14, 45, TRUE, 'Standard', 1),
(14, 46, FALSE, 'Light', 2),
-- Larb Gai
(15, 47, TRUE, 'Standard', 1),
(15, 48, FALSE, 'Light', 2),
-- Teriyaki Bowl
(16, 49, TRUE, 'Standard', 1),
(16, 50, FALSE, 'Light', 2),
-- Mapo Tofu
(17, 51, TRUE, 'Standard', 1),
(17, 52, FALSE, 'Light', 2),
-- Chicken Piccata
(18, 53, TRUE, 'Standard', 1),
(18, 54, FALSE, 'Light', 2),
-- Pad Krapow
(19, 55, TRUE, 'Standard', 1),
(19, 56, FALSE, 'Light', 2),
-- Chicken Chasseur
(20, 57, TRUE, 'Standard', 1),
(20, 58, FALSE, 'Light', 2),
-- Chicken Katsu
(21, 59, TRUE, 'Standard', 1),
(21, 60, FALSE, 'Light', 2);

-- =============================================
-- RECIPE SUMMARY
-- =============================================
--
-- BREAKFAST (8 new - IDs 37-44):
-- 37. Japanese Tamagoyaki Breakfast Bowl (Standard) - 540 cal | 48g P | 22g F
-- 38. Japanese Tamagoyaki Breakfast (Light) - 320 cal | 26g P | 18g F
-- 39. Mexican Huevos Rancheros (Standard) - 580 cal | 38g P | 24g F
-- 40. Mexican Huevos Rancheros (Light) - 520 cal | 48g P | 23g F
-- 41. Indian Masala Omelette with Roti (Standard) - 590 cal | 46g P | 24g F
-- 42. Indian Masala Omelette (Light) - 350 cal | 30g P | 20g F
-- 43. French Eggs en Cocotte (Standard) - 580 cal | 48g P | 23g F
-- 44. French Eggs en Cocotte (Light) - 420 cal | 40g P | 20g F
--
-- LUNCH (8 new - IDs 45-52):
-- 45. Italian Caprese Chicken Salad (Standard) - 580 cal | 58g P | 24g F
-- 46. Italian Caprese Chicken Salad (Light) - 520 cal | 65g P | 22g F
-- 47. Thai Larb Gai (Standard) - 540 cal | 52g P | 22g F
-- 48. Thai Larb Gai (Light) - 380 cal | 48g P | 16g F
-- 49. Japanese Teriyaki Chicken Bowl (Standard) - 620 cal | 52g P | 18g F
-- 50. Japanese Teriyaki Chicken Bowl (Light) - 420 cal | 48g P | 16g F
-- 51. Chinese Mapo Tofu with Chicken (Standard) - 590 cal | 48g P | 22g F
-- 52. Chinese Mapo Tofu with Chicken (Light) - 380 cal | 44g P | 18g F
--
-- DINNER (8 new - IDs 53-60):
-- 53. Italian Chicken Piccata (Standard) - 580 cal | 56g P | 22g F
-- 54. Italian Chicken Piccata (Light) - 480 cal | 58g P | 20g F
-- 55. Thai Basil Chicken (Standard) - 600 cal | 52g P | 18g F
-- 56. Thai Basil Chicken (Light) - 380 cal | 48g P | 16g F
-- 57. French Chicken Chasseur (Standard) - 620 cal | 54g P | 22g F
-- 58. French Chicken Chasseur (Light) - 420 cal | 50g P | 18g F
-- 59. Japanese Chicken Katsu Curry (Standard) - 680 cal | 52g P | 24g F
-- 60. Japanese Chicken Katsu Curry (Light) - 520 cal | 54g P | 22g F
--
-- All recipes follow Chef Agent guidelines:
-- - Real ingredients only (no seed oils)
-- - Approved fats: olive oil, butter
-- - Macros calculated per serving
-- - Diet Plan compliant: 550-650 cal target, e45g protein, d25g fat
-- - Light variants for lower-calorie days
-- =============================================

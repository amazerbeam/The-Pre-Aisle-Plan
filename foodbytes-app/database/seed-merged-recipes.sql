-- =============================================
-- MERGED RECIPES - Combined from seed-new-recipes.sql & seed-high-protein-recipes.sql
-- All recipes set to is_live = FALSE (must be manually enabled)
-- Recipe IDs: 37-66 (from seed-new), 67-85 (from seed-high-protein, renumbered)
-- Generated: December 2024
-- =============================================

-- =============================================
-- NEW INGREDIENTS (combined from both files)
-- =============================================
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
-- Meat (aisle 1)
(116, 'ground_lamb', 'Ground lamb', 1),
(117, 'prosciutto', 'Prosciutto', 1),
-- Poultry (aisle 2)
(118, 'chicken_thigh', 'Chicken thigh (boneless)', 2),
(124, 'ground_turkey', 'Ground turkey', 2),
-- Veg (aisle 3)
(119, 'asparagus', 'Asparagus', 3),
(120, 'zucchini', 'Zucchini (courgette)', 3),
(121, 'eggplant', 'Eggplant (aubergine)', 3),
(122, 'leek', 'Leek', 3),
(123, 'bean_sprouts', 'Bean sprouts', 3),
(125, 'kale', 'Kale', 3),
(126, 'roma_tomato', 'Roma tomato', 3),
(127, 'shallot', 'Shallot', 3),
(167, 'cauliflower', 'Cauliflower', 3),
(168, 'corn_kernels', 'Corn kernels', 3),
-- Fruit (aisle 4)
(128, 'apple', 'Apple', 4),
(129, 'orange', 'Orange', 4),
(130, 'dried_cranberries', 'Dried cranberries', 4),
-- Fish (aisle 5)
(131, 'smoked_salmon', 'Smoked salmon', 5),
(132, 'prawns', 'Prawns (shrimp)', 5),
(169, 'tinned_tuna', 'Tinned tuna (in water)', 5),
-- Dairy (aisle 6)
(133, 'cream_cheese', 'Cream cheese', 6),
(134, 'mozzarella', 'Fresh mozzarella', 6),
(135, 'ricotta', 'Ricotta cheese', 6),
(136, 'cheddar', 'Cheddar cheese', 6),
(170, 'cottage_cheese', 'Cottage cheese', 6),
(171, 'egg_whites', 'Egg whites', 6),
-- Herbs & Spices (aisle 8)
(137, 'fresh_mint', 'Fresh mint', 8),
(138, 'fresh_dill', 'Fresh dill', 8),
(139, 'cayenne_pepper', 'Cayenne pepper', 8),
(140, 'coriander_seeds', 'Coriander seeds', 8),
(141, 'paprika', 'Paprika (sweet)', 8),
(142, 'nutmeg', 'Nutmeg', 8),
(143, 'fish_sauce', 'Fish sauce', 8),
(144, 'thai_basil', 'Thai basil', 8),
(145, 'lemongrass', 'Lemongrass', 8),
(146, 'galangal', 'Galangal', 8),
(147, 'cardamom', 'Cardamom pods', 8),
(148, 'fennel_seeds', 'Fennel seeds', 8),
-- Oils & Fats (aisle 9)
(149, 'coconut_oil', 'Coconut oil', 9),
(150, 'ghee', 'Ghee', 9),
-- Tins & Jars (aisle 10)
(151, 'coconut_milk', 'Coconut milk (full fat)', 10),
(152, 'coconut_cream', 'Coconut cream', 10),
(153, 'artichoke_hearts', 'Artichoke hearts', 10),
(154, 'sun_dried_tomatoes', 'Sun-dried tomatoes', 10),
-- Grains & Pasta (aisle 11)
(155, 'spaghetti', 'Spaghetti', 11),
(156, 'rice_noodles', 'Rice noodles', 11),
(157, 'corn_tortillas', 'Corn tortillas', 11),
-- Bakery (aisle 13)
(158, 'pita_bread', 'Pita bread', 13),
(159, 'sourdough', 'Sourdough bread', 13),
-- Condiments (aisle 12)
(160, 'tahini', 'Tahini', 12),
(161, 'miso_paste', 'Miso paste (white)', 12),
(162, 'oyster_sauce', 'Oyster sauce', 12),
(163, 'chili_paste', 'Chili paste', 12),
-- Misc (aisle 17)
(164, 'chicken_stock', 'Chicken stock', 17),
(165, 'beef_stock', 'Beef stock', 17),
(166, 'vegetable_stock', 'Vegetable stock', 17)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =============================================
-- BREAKFAST RECIPES (IDs 37-45 from seed-new, 67-71 high-protein unique)
-- =============================================

-- Recipe 37: Shakshuka (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(37, 'Shakshuka (Middle Eastern Baked Eggs)', 2, 800, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (37, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(37, 38, 4, 5, 1), (37, 61, 400, 1, 2), (37, 17, 150, 1, 3), (37, 16, 150, 1, 4),
(37, 13, 3, 10, 5), (37, 59, 2, 4, 6), (37, 49, 1, 3, 7), (37, 46, 1, 3, 8),
(37, 47, 0.5, 3, 9), (37, 44, 1, 3, 10), (37, 45, 0.25, 3, 11), (37, 106, 20, 1, 12),
(37, 39, 40, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(37, 1, 'Heat olive oil in a large oven-safe skillet over medium heat.'),
(37, 2, 'Add diced onion and bell pepper. Cook 5-7 minutes until softened.'),
(37, 3, 'Add minced garlic, cumin, paprika, and chili flakes. Cook 30 seconds until fragrant.'),
(37, 4, 'Pour in tinned tomatoes. Season with salt and pepper. Simmer 10 minutes until slightly thickened.'),
(37, 5, 'Make 4 wells in the sauce. Crack an egg into each well.'),
(37, 6, 'Cover and cook on low heat for 8-10 minutes until egg whites are set but yolks remain runny.'),
(37, 7, 'Scatter fresh coriander and crumbled feta over the top.'),
(37, 8, 'Serve immediately from the pan with crusty bread or pita (not included in calories).');

-- Recipe 38: French Toast with Berries
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(38, 'French Toast with Berries', 2, 1000, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (38, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(38, 159, 200, 1, 1), (38, 38, 3, 5, 2), (38, 37, 100, 2, 3), (38, 92, 30, 1, 4),
(38, 50, 0.5, 3, 5), (38, 83, 1, 3, 6), (38, 34, 120, 1, 7), (38, 74, 2, 4, 8),
(38, 44, 0.25, 17, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(38, 1, 'In a shallow bowl, whisk eggs, milk, cinnamon, vanilla, and salt until combined.'),
(38, 2, 'Heat half the butter in a non-stick pan over medium heat.'),
(38, 3, 'Dip bread slices into egg mixture, letting each side soak for 10 seconds.'),
(38, 4, 'Cook 2-3 minutes per side until golden brown. Add remaining butter as needed.'),
(38, 5, 'Serve immediately topped with fresh berries and maple syrup.');

-- Recipe 39: Greek Yogurt Parfait (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(39, 'Greek Yogurt Parfait with Homemade Granola', 2, 900, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (39, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(39, 36, 300, 1, 1), (39, 69, 80, 1, 2), (39, 84, 30, 1, 3), (39, 76, 2, 4, 4),
(39, 149, 1, 4, 5), (39, 50, 0.5, 3, 6), (39, 34, 100, 1, 7), (39, 44, 0.25, 17, 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(39, 1, 'GRANOLA: Preheat oven to 160C (320F).'),
(39, 2, 'Mix oats, roughly chopped almonds, melted coconut oil, 1 tbsp honey, cinnamon, and salt.'),
(39, 3, 'Spread on a baking tray. Bake 20-25 minutes, stirring halfway, until golden.'),
(39, 4, 'Let cool completely on the tray (it will crisp up).'),
(39, 5, 'PARFAIT: Layer Greek yogurt in glasses or bowls.'),
(39, 6, 'Add a layer of granola, then berries, then more yogurt.'),
(39, 7, 'Top with remaining granola, berries, and a drizzle of honey.');

-- Recipe 40: Smoked Salmon Scramble (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(40, 'Smoked Salmon Scramble', 2, 950, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (40, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(40, 38, 6, 5, 1), (40, 131, 100, 1, 2), (40, 92, 30, 1, 3), (40, 133, 40, 1, 4),
(40, 19, 30, 1, 5), (40, 138, 10, 1, 6), (40, 44, 0.25, 3, 7), (40, 45, 0.25, 3, 8),
(40, 30, 1, 3, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(40, 1, 'Crack eggs into a bowl. Season lightly with salt and pepper. Whisk gently.'),
(40, 2, 'Slice smoked salmon into ribbons. Thinly slice spring onions. Chop dill.'),
(40, 3, 'Melt butter in a non-stick pan over LOW heat.'),
(40, 4, 'Add eggs. Stir continuously with a spatula, scraping the bottom and sides.'),
(40, 5, 'When eggs are 70% set (still quite wet), add cream cheese in small pieces.'),
(40, 6, 'Remove from heat while eggs are still slightly underdone.'),
(40, 7, 'Fold in smoked salmon, spring onions, dill, and a squeeze of lemon juice.'),
(40, 8, 'Serve immediately.');

-- Recipe 41: Mushroom & Spinach Omelette
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(41, 'Mushroom & Spinach Omelette', 2, 800, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (41, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(41, 38, 6, 5, 1), (41, 27, 200, 1, 2), (41, 12, 100, 1, 3), (41, 40, 60, 1, 4),
(41, 92, 20, 1, 5), (41, 13, 1, 10, 6), (41, 44, 0.5, 3, 7), (41, 45, 0.25, 3, 8),
(41, 108, 0.5, 3, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(41, 1, 'Slice mushrooms. Mince garlic. Grate cheese.'),
(41, 2, 'Heat half the butter in a pan over medium-high heat. Add mushrooms and thyme.'),
(41, 3, 'Cook mushrooms 4-5 minutes until golden. Add garlic, cook 30 seconds.'),
(41, 4, 'Add spinach, stir until wilted. Season with salt and pepper. Set aside.'),
(41, 5, 'Beat 3 eggs with a pinch of salt. Melt half remaining butter in same pan.'),
(41, 6, 'Pour in eggs. Let set for 30 seconds, then gently push edges to center.'),
(41, 7, 'When mostly set but still slightly wet, add half the filling and cheese to one side.'),
(41, 8, 'Fold omelette in half. Repeat for second omelette.');

-- Recipe 42: Huevos Rancheros (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(42, 'Huevos Rancheros', 2, 1050, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (42, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(42, 38, 4, 5, 1), (42, 62, 240, 1, 2), (42, 157, 4, 5, 3), (42, 25, 200, 1, 4),
(42, 75, 30, 1, 5), (42, 17, 80, 1, 6), (42, 13, 2, 10, 7), (42, 59, 1, 4, 8),
(42, 49, 1, 3, 9), (42, 44, 1, 3, 10), (42, 106, 20, 1, 11), (42, 33, 0.5, 7, 12),
(42, 31, 1, 4, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(42, 1, 'SALSA: Dice tomatoes, finely chop onion (half), mince garlic (1 clove), and slice jalapenos.'),
(42, 2, 'Heat 1 tsp olive oil in a pan. Add onion, cook 3 minutes. Add garlic and jalapenos, cook 1 minute.'),
(42, 3, 'Add tomatoes, cumin, and salt. Simmer 10 minutes until slightly thickened.'),
(42, 4, 'BEANS: Heat remaining onion in 1 tsp olive oil. Add black beans and remaining garlic.'),
(42, 5, 'Mash beans partially with a fork. Season and keep warm.'),
(42, 6, 'Warm tortillas in a dry pan.'),
(42, 7, 'Fry eggs in remaining olive oil until whites are set but yolks are runny.'),
(42, 8, 'ASSEMBLE: Place 2 tortillas per plate, spread with beans, top with 2 eggs each.'),
(42, 9, 'Spoon salsa over eggs. Top with sliced avocado and fresh coriander.');

-- Recipe 43: Overnight Oats (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(43, 'Overnight Oats with Apple & Cinnamon', 2, 800, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (43, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(43, 69, 100, 1, 1), (43, 37, 200, 2, 2), (43, 36, 150, 1, 3), (43, 128, 200, 1, 4),
(43, 76, 1, 4, 5), (43, 50, 1, 3, 6), (43, 86, 20, 1, 7), (43, 44, 0.25, 17, 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(43, 1, 'In two jars, divide oats, milk, Greek yogurt, and a pinch of salt.'),
(43, 2, 'Stir well to combine. Refrigerate overnight (or at least 4 hours).'),
(43, 3, 'In the morning, grate or dice the apple. Roughly chop walnuts.'),
(43, 4, 'Stir the oats - they should be thick and creamy.'),
(43, 5, 'Top with apple, cinnamon, walnuts, and a drizzle of honey.');

-- Recipe 44: Japanese Tamagoyaki
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(44, 'Japanese Tamagoyaki (Rolled Omelette)', 2, 750, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (44, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(44, 38, 6, 5, 1), (44, 72, 2, 3, 2), (44, 76, 1, 3, 3), (44, 90, 2, 4, 4),
(44, 59, 1, 4, 5), (44, 44, 0.25, 17, 6), (44, 19, 20, 1, 7), (44, 71, 150, 1, 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(44, 1, 'Whisk eggs with soy sauce, honey, stock, and salt.'),
(44, 2, 'Heat a rectangular tamagoyaki pan (or non-stick pan) over medium-low heat. Lightly oil.'),
(44, 3, 'Pour a thin layer of egg mixture (about 1/4) into the pan. Let it set slightly.'),
(44, 4, 'When surface is still slightly wet, roll the egg from one end to the other.'),
(44, 5, 'Push the roll to the far end of the pan. Oil the empty space.'),
(44, 6, 'Pour another thin layer of egg, lifting the roll to let it flow underneath.'),
(44, 7, 'Roll again, incorporating the previous roll. Repeat until all egg is used.'),
(44, 8, 'Let rest 2 minutes, then slice into 2cm pieces. Serve with rice.');

-- Recipe 45: Avocado Toast with Poached Eggs
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(45, 'Avocado Toast with Poached Eggs', 2, 1000, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (45, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(45, 159, 160, 1, 1), (45, 33, 2, 7, 2), (45, 38, 4, 5, 3), (45, 30, 1, 4, 4),
(45, 47, 0.5, 3, 5), (45, 44, 0.5, 3, 6), (45, 45, 0.25, 3, 7), (45, 115, 1, 4, 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(45, 1, 'Bring a pot of water to a gentle simmer. Add red wine vinegar.'),
(45, 2, 'Crack each egg into a small cup. Create a gentle whirlpool in the water.'),
(45, 3, 'Slide egg into the center. Poach 3 minutes for runny yolk.'),
(45, 4, 'Repeat with remaining eggs.'),
(45, 5, 'Toast sourdough slices until golden.'),
(45, 6, 'Halve avocados, scoop flesh into a bowl. Add lemon juice, salt, pepper. Mash roughly.'),
(45, 7, 'Spread mashed avocado generously on each toast slice.'),
(45, 8, 'Top each toast with a poached egg. Season with chili flakes.');

-- =============================================
-- HIGH-PROTEIN BREAKFAST VARIANTS (IDs 67-71)
-- =============================================

-- Recipe 67: Shakshuka (High-Protein) - variant of 37
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(67, 'High-Protein Shakshuka', 2, 900, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (67, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(67, 38, 6, 5, 1), (67, 39, 100, 1, 2), (67, 61, 400, 1, 3), (67, 17, 100, 1, 4),
(67, 16, 100, 1, 5), (67, 13, 3, 10, 6), (67, 59, 1, 4, 7), (67, 49, 1, 3, 8),
(67, 46, 1, 3, 9), (67, 47, 0.5, 3, 10), (67, 44, 1, 3, 11), (67, 106, 20, 1, 12);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(67, 1, 'Heat olive oil in an oven-safe skillet over medium heat.'),
(67, 2, 'Saute diced onion and pepper 5-7 minutes until soft.'),
(67, 3, 'Add garlic, cumin, paprika, chili. Cook 30 seconds.'),
(67, 4, 'Add tomatoes, season, simmer 10 minutes.'),
(67, 5, 'Make 6 wells, crack eggs into each.'),
(67, 6, 'Crumble feta generously over the top.'),
(67, 7, 'Cover and cook 8-10 minutes until whites set, yolks runny.'),
(67, 8, 'Top with coriander. Serve 3 eggs + half the feta per person.');

-- Recipe 68: Cottage Cheese Protein Pancakes - ADD TO PANCAKE FAMILY
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(68, 'Cottage Cheese Protein Pancakes', 2, 880, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (68, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(68, 170, 400, 1, 1), (68, 38, 4, 5, 2), (68, 69, 60, 1, 3), (68, 83, 1, 3, 4),
(68, 50, 0.5, 3, 5), (68, 34, 80, 1, 6), (68, 92, 10, 1, 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(68, 1, 'Blend cottage cheese, eggs, oats, vanilla, and cinnamon until smooth.'),
(68, 2, 'Let batter rest 5 minutes while oats absorb liquid.'),
(68, 3, 'Heat butter in non-stick pan over medium heat.'),
(68, 4, 'Pour 1/4 cup batter per pancake. Cook until bubbles form, then flip.'),
(68, 5, 'Cook another 1-2 minutes until golden.'),
(68, 6, 'Makes about 8 small pancakes. Serve 4 per person with berries.');

-- Recipe 69: Greek Yogurt Power Bowl (High-Protein) - variant of 39
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(69, 'Greek Yogurt Power Bowl', 2, 940, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (69, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(69, 36, 400, 1, 1), (69, 84, 50, 1, 2), (69, 34, 100, 1, 3), (69, 76, 1, 4, 4),
(69, 88, 1, 4, 5), (69, 50, 0.5, 3, 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(69, 1, 'Divide Greek yogurt between two bowls (200g each).'),
(69, 2, 'Roughly chop almonds. Toast in dry pan 2 minutes until golden.'),
(69, 3, 'Top yogurt with berries, toasted almonds, sesame seeds.'),
(69, 4, 'Drizzle with honey and dust with cinnamon.');

-- Recipe 70: Overnight Protein Oats (High-Protein) - variant of 43
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(70, 'Overnight Protein Oats', 2, 920, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (70, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(70, 69, 100, 1, 1), (70, 36, 300, 1, 2), (70, 38, 2, 5, 3), (70, 37, 100, 2, 4),
(70, 76, 1, 4, 5), (70, 50, 1, 3, 6), (70, 84, 20, 1, 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(70, 1, 'Whisk eggs until smooth. This adds protein and makes oats custardy.'),
(70, 2, 'Mix oats, Greek yogurt, whisked eggs, milk, and cinnamon in a bowl.'),
(70, 3, 'Divide between 2 jars or containers.'),
(70, 4, 'Refrigerate overnight (minimum 4 hours).'),
(70, 5, 'In morning, top with honey and chopped almonds.');

-- Recipe 71: High-Protein Huevos Rancheros - variant of 42
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(71, 'High-Protein Huevos Rancheros', 2, 950, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (71, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(71, 38, 6, 5, 1), (71, 62, 200, 1, 2), (71, 36, 100, 1, 3), (71, 25, 150, 1, 4),
(71, 75, 20, 1, 5), (71, 17, 60, 1, 6), (71, 59, 1, 4, 7), (71, 49, 1, 3, 8),
(71, 44, 1, 3, 9), (71, 106, 20, 1, 10), (71, 31, 1, 4, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(71, 1, 'Heat beans in a pan with cumin and mash partially. Keep warm.'),
(71, 2, 'Make quick salsa: dice tomato, onion, jalapeno. Mix with lime, salt, coriander.'),
(71, 3, 'Fry eggs sunny-side up in olive oil (3 per person).'),
(71, 4, 'Divide mashed beans between plates.'),
(71, 5, 'Top with fried eggs, salsa, and Greek yogurt.'),
(71, 6, 'Garnish with extra coriander. Skip tortillas to save carbs.');

-- =============================================
-- LUNCH RECIPES (IDs 46-55 from seed-new, 72-77 high-protein unique)
-- =============================================

-- Recipe 46: Mediterranean Chicken Wrap (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(46, 'Mediterranean Chicken Wrap', 2, 1050, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (46, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(46, 7, 300, 1, 1), (46, 160, 40, 1, 2), (46, 23, 150, 1, 3), (46, 24, 100, 1, 4),
(46, 39, 40, 1, 5), (46, 18, 50, 1, 6), (46, 11, 60, 1, 7), (46, 158, 2, 5, 8),
(46, 30, 2, 4, 9), (46, 13, 2, 10, 10), (46, 59, 1, 3, 11), (46, 105, 1, 3, 12),
(46, 44, 1, 3, 13), (46, 45, 0.25, 3, 14);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(46, 1, 'Season chicken with oregano, salt, pepper. Grill or pan-fry until cooked through. Rest, then slice.'),
(46, 2, 'TAHINI SAUCE: Mix tahini with 1 tbsp lemon juice, minced garlic, and 2-3 tbsp water until smooth.'),
(46, 3, 'Dice cucumber and halve cherry tomatoes. Thinly slice red onion. Crumble feta.'),
(46, 4, 'Warm pita breads in a dry pan or oven.'),
(46, 5, 'Split pitas open. Layer salad leaves, chicken, cucumber, tomatoes, red onion, and feta.'),
(46, 6, 'Drizzle generously with tahini sauce and remaining lemon juice.');

-- Recipe 47: Thai Chicken Larb (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(47, 'Thai Chicken Larb (Lettuce Cups)', 2, 800, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (47, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(47, 7, 400, 1, 1), (47, 10, 8, 5, 2), (47, 127, 40, 1, 3), (47, 19, 30, 1, 4),
(47, 143, 2, 4, 5), (47, 31, 3, 4, 6), (47, 47, 1, 3, 7), (47, 137, 20, 1, 8),
(47, 106, 20, 1, 9), (47, 59, 1, 4, 10), (47, 69, 30, 1, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(47, 1, 'Toast oats in a dry pan until golden (2-3 minutes). Pulse in blender until coarsely ground.'),
(47, 2, 'Mince chicken breast finely with a knife or pulse briefly in food processor.'),
(47, 3, 'Heat olive oil in a wok over high heat. Add chicken mince, breaking up with spatula.'),
(47, 4, 'Cook 4-5 minutes until chicken is cooked through and slightly browned.'),
(47, 5, 'Remove from heat. Add fish sauce, lime juice, and chili flakes. Toss well.'),
(47, 6, 'Add thinly sliced shallot, spring onion, herbs, and toasted oat powder.'),
(47, 7, 'Taste and adjust seasoning. Spoon into lettuce cups.');

-- Recipe 48: Japanese Teriyaki Chicken Bowl
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(48, 'Japanese Teriyaki Chicken Bowl', 2, 1150, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (48, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(48, 118, 400, 1, 1), (48, 71, 150, 1, 2), (48, 72, 3, 4, 3), (48, 76, 2, 4, 4),
(48, 14, 10, 1, 5), (48, 13, 2, 10, 6), (48, 109, 1, 3, 7), (48, 9, 150, 1, 8),
(48, 22, 100, 1, 9), (48, 88, 1, 4, 10), (48, 19, 20, 1, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(48, 1, 'TERIYAKI SAUCE: Mix soy sauce, honey, grated ginger, minced garlic, and sesame oil.'),
(48, 2, 'Cook rice with 300ml water, bring to boil, cover, simmer 12 minutes. Rest 5 minutes.'),
(48, 3, 'Cut chicken thighs into bite-sized pieces. Season lightly with salt.'),
(48, 4, 'Heat a pan over medium-high heat. Cook chicken 5-6 minutes until golden.'),
(48, 5, 'Pour teriyaki sauce over chicken. Simmer 2-3 minutes until sauce thickens.'),
(48, 6, 'Steam broccoli florets and julienned carrots until tender-crisp (3-4 minutes).'),
(48, 7, 'Divide rice between bowls. Arrange chicken and vegetables on top.'),
(48, 8, 'Drizzle with extra sauce. Sprinkle with sesame seeds and spring onion.');

-- Recipe 49: Italian Minestrone Soup
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(49, 'Italian Minestrone Soup', 2, 750, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (49, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(49, 61, 400, 1, 1), (49, 64, 200, 1, 2), (49, 155, 80, 1, 3), (49, 120, 150, 1, 4),
(49, 22, 100, 1, 5), (49, 21, 100, 1, 6), (49, 17, 100, 1, 7), (49, 13, 2, 10, 8),
(49, 12, 60, 1, 9), (49, 59, 2, 4, 10), (49, 166, 600, 2, 11), (49, 48, 1, 3, 12),
(49, 44, 1, 3, 13), (49, 45, 0.25, 3, 14), (49, 103, 30, 1, 15);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(49, 1, 'Dice onion, carrot, celery, and zucchini into small cubes. Mince garlic.'),
(49, 2, 'Heat olive oil in a large pot. Add onion, carrot, and celery. Cook 5 minutes.'),
(49, 3, 'Add garlic and Italian seasoning. Cook 30 seconds until fragrant.'),
(49, 4, 'Add tinned tomatoes, stock, and drained chickpeas. Bring to a boil.'),
(49, 5, 'Break spaghetti into short pieces, add to pot. Reduce heat and simmer 10 minutes.'),
(49, 6, 'Add zucchini. Cook another 5 minutes.'),
(49, 7, 'Stir in spinach until wilted. Season with salt and pepper.'),
(49, 8, 'Serve hot with freshly grated Parmesan.');

-- Recipe 50: Greek Chicken Souvlaki Plate (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(50, 'Greek Chicken Souvlaki Plate', 2, 1200, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (50, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(50, 7, 400, 1, 1), (50, 36, 150, 1, 2), (50, 23, 150, 1, 3), (50, 24, 100, 1, 4),
(50, 18, 50, 1, 5), (50, 158, 2, 5, 6), (50, 59, 2, 4, 7), (50, 30, 2, 4, 8),
(50, 13, 3, 10, 9), (50, 105, 2, 3, 10), (50, 44, 1, 3, 11), (50, 45, 0.5, 3, 12),
(50, 138, 10, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(50, 1, 'MARINADE: Mix 1 tbsp olive oil, 1 tbsp lemon juice, 2 minced garlic cloves, oregano, salt, pepper.'),
(50, 2, 'Cut chicken into 2cm cubes. Toss with marinade. Refrigerate at least 30 minutes.'),
(50, 3, 'TZATZIKI: Grate half the cucumber, squeeze out water. Mix with yogurt, 1 minced garlic clove, lemon juice, dill, salt.'),
(50, 4, 'Thread chicken onto skewers. Grill 3-4 minutes per side until charred and cooked through.'),
(50, 5, 'SALAD: Dice remaining cucumber. Halve tomatoes. Slice red onion. Toss with olive oil and salt.'),
(50, 6, 'Warm pita breads. Serve chicken skewers with tzatziki, salad, and warm pita.');

-- Recipe 51: Spanish Tortilla
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(51, 'Spanish Tortilla (Potato Omelette)', 2, 1050, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (51, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(51, 38, 6, 5, 1), (51, 99, 400, 1, 2), (51, 17, 150, 1, 3), (51, 59, 3, 4, 4),
(51, 44, 1, 3, 5), (51, 45, 0.25, 3, 6), (51, 11, 60, 1, 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(51, 1, 'Peel and thinly slice potatoes (2-3mm). Thinly slice onion.'),
(51, 2, 'Heat 2 tbsp olive oil in an 8-inch non-stick pan over medium-low heat.'),
(51, 3, 'Add potatoes and onion in layers, seasoning each layer. Cook gently 20-25 minutes until tender.'),
(51, 4, 'Beat eggs with salt and pepper. Drain potato-onion mixture, add to eggs, let sit 5 minutes.'),
(51, 5, 'Heat remaining olive oil in the same pan over medium heat.'),
(51, 6, 'Pour in egg-potato mixture. Cook 5 minutes, shaking pan occasionally.'),
(51, 7, 'Place a plate over the pan, flip tortilla onto plate, slide back into pan. Cook another 3-4 minutes.'),
(51, 8, 'Slide onto serving plate. Let rest 5 minutes before cutting into wedges.');

-- Recipe 52: Moroccan Chickpea Stew
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(52, 'Moroccan Chickpea Stew', 2, 850, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (52, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(52, 64, 400, 1, 1), (52, 61, 400, 1, 2), (52, 17, 150, 1, 3), (52, 22, 100, 1, 4),
(52, 13, 3, 10, 5), (52, 59, 2, 4, 6), (52, 49, 1.5, 3, 7), (52, 50, 0.5, 3, 8),
(52, 141, 1, 3, 9), (52, 57, 0.5, 3, 10), (52, 14, 10, 1, 11), (52, 12, 60, 1, 12),
(52, 166, 200, 2, 13), (52, 76, 1, 3, 14), (52, 44, 1, 3, 15), (52, 106, 20, 1, 16);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(52, 1, 'Dice onion and carrot. Mince garlic and grate ginger.'),
(52, 2, 'Heat olive oil in a pot. Add onion and carrot, cook 5 minutes.'),
(52, 3, 'Add garlic, ginger, cumin, cinnamon, paprika, and turmeric. Stir 30 seconds.'),
(52, 4, 'Add tinned tomatoes, drained chickpeas, stock, honey, and salt.'),
(52, 5, 'Bring to a simmer. Cook covered for 20 minutes.'),
(52, 6, 'Stir in spinach until wilted.'),
(52, 7, 'Serve in bowls topped with fresh coriander.');

-- Recipe 53: Vietnamese Beef Noodle Bowl
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(53, 'Vietnamese-Inspired Beef Noodle Bowl', 2, 950, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (53, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(53, 3, 250, 1, 1), (53, 156, 150, 1, 2), (53, 123, 100, 1, 3), (53, 22, 80, 1, 4),
(53, 23, 80, 1, 5), (53, 137, 20, 1, 6), (53, 106, 20, 1, 7), (53, 143, 2, 4, 8),
(53, 31, 3, 4, 9), (53, 76, 1, 4, 10), (53, 13, 2, 10, 11), (53, 47, 1, 3, 12),
(53, 59, 1, 3, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(53, 1, 'NUOC CHAM: Mix fish sauce, lime juice, honey, minced garlic, and chili flakes.'),
(53, 2, 'Cook rice noodles according to package. Drain and rinse with cold water.'),
(53, 3, 'Julienne carrot and cucumber. Roughly chop mint and coriander.'),
(53, 4, 'Slice steak very thinly against the grain.'),
(53, 5, 'Heat olive oil in a pan over very high heat. Sear steak 30 seconds per side.'),
(53, 6, 'Divide noodles between bowls. Top with carrot, cucumber, bean sprouts, and herbs.'),
(53, 7, 'Arrange sliced steak on top.'),
(53, 8, 'Drizzle generously with nuoc cham dressing.');

-- Recipe 54: Tuscan White Bean Soup
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(54, 'Tuscan White Bean Soup', 2, 800, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (54, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(54, 65, 400, 1, 1), (54, 125, 100, 1, 2), (54, 17, 100, 1, 3), (54, 21, 80, 1, 4),
(54, 22, 80, 1, 5), (54, 13, 3, 10, 6), (54, 59, 2, 4, 7), (54, 28, 2, 5, 8),
(54, 164, 500, 2, 9), (54, 44, 1, 3, 10), (54, 45, 0.5, 3, 11), (54, 103, 30, 1, 12);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(54, 1, 'Dice onion, celery, and carrot. Mince garlic. Strip kale leaves and roughly chop.'),
(54, 2, 'Heat olive oil in a large pot. Add mirepoix and cook 5-7 minutes.'),
(54, 3, 'Add garlic and rosemary. Cook 30 seconds.'),
(54, 4, 'Add drained beans and stock. Bring to a simmer.'),
(54, 5, 'Remove half the soup and blend until smooth. Return to pot.'),
(54, 6, 'Add kale. Simmer 5-10 minutes until kale is tender.'),
(54, 7, 'Season with salt and pepper. Remove rosemary stems.'),
(54, 8, 'Serve with freshly grated Parmesan.');

-- Recipe 55: Prawn & Avocado Salad (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(55, 'Prawn & Avocado Salad', 2, 900, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (55, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(55, 132, 300, 1, 1), (55, 33, 2, 7, 2), (55, 11, 100, 1, 3), (55, 24, 100, 1, 4),
(55, 23, 100, 1, 5), (55, 18, 40, 1, 6), (55, 59, 2, 4, 7), (55, 30, 2, 4, 8),
(55, 13, 1, 10, 9), (55, 47, 0.5, 3, 10), (55, 44, 0.5, 3, 11), (55, 45, 0.25, 3, 12),
(55, 138, 10, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(55, 1, 'Heat 1 tbsp olive oil in a pan. Season prawns with salt, pepper, and chili flakes.'),
(55, 2, 'Cook prawns 2 minutes per side until pink. Add minced garlic in last 30 seconds.'),
(55, 3, 'Halve avocados, remove pit, slice or cube the flesh.'),
(55, 4, 'Halve cherry tomatoes. Slice cucumber. Thinly slice red onion.'),
(55, 5, 'DRESSING: Whisk remaining olive oil with lemon juice, salt, and pepper.'),
(55, 6, 'Arrange salad leaves on plates. Top with avocado, tomatoes, cucumber, and red onion.'),
(55, 7, 'Arrange warm prawns on top.'),
(55, 8, 'Drizzle with dressing and scatter fresh dill.');

-- =============================================
-- HIGH-PROTEIN LUNCH (IDs 72-77)
-- =============================================

-- Recipe 72: Thai Chicken Larb (High-Protein) - variant of 47
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(72, 'Thai Chicken Larb (High-Protein)', 2, 1280, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (72, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(72, 7, 400, 1, 1), (72, 10, 8, 5, 2), (72, 36, 150, 1, 3), (72, 143, 2, 4, 4),
(72, 31, 3, 4, 5), (72, 47, 1, 3, 6), (72, 137, 20, 1, 7), (72, 106, 20, 1, 8),
(72, 127, 40, 1, 9), (72, 59, 1, 4, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(72, 1, 'Mince chicken breast finely (or use pre-minced).'),
(72, 2, 'Heat olive oil in wok over high heat. Stir-fry chicken 4-5 min until cooked.'),
(72, 3, 'Remove from heat. Add fish sauce, lime juice, chili flakes.'),
(72, 4, 'Add sliced shallot, torn mint and coriander. Toss well.'),
(72, 5, 'Taste: adjust sour/salty/spicy balance.'),
(72, 6, 'Spoon into lettuce cups. Serve with Greek yogurt on the side.');

-- Recipe 73: Greek Chicken Souvlaki Bowl (Light) - variant of 50
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(73, 'Greek Chicken Souvlaki Bowl', 2, 1340, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (73, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(73, 7, 400, 1, 1), (73, 36, 150, 1, 2), (73, 23, 150, 1, 3), (73, 24, 100, 1, 4),
(73, 18, 50, 1, 5), (73, 59, 2, 4, 6), (73, 30, 2, 4, 7), (73, 13, 2, 10, 8),
(73, 105, 2, 3, 9), (73, 44, 1, 3, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(73, 1, 'MARINADE: Mix 1 tbsp olive oil, lemon juice, minced garlic, oregano, salt.'),
(73, 2, 'Cube chicken, marinate 30 min minimum (overnight better).'),
(73, 3, 'TZATZIKI: Grate half cucumber, squeeze dry. Mix with yogurt, 1 garlic clove, salt.'),
(73, 4, 'Thread chicken on skewers. Grill 3-4 min per side.'),
(73, 5, 'Dice remaining cucumber, halve tomatoes, slice onion.'),
(73, 6, 'Bowl: salad vegetables, chicken skewers, generous tzatziki.');

-- Recipe 74: High-Protein Tuna Nicoise
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(74, 'High-Protein Tuna Nicoise', 2, 1300, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (74, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(74, 169, 320, 1, 1), (74, 38, 4, 5, 2), (74, 100, 150, 1, 3), (74, 24, 100, 1, 4),
(74, 111, 40, 1, 5), (74, 11, 80, 1, 6), (74, 59, 2, 4, 7), (74, 115, 1, 4, 8),
(74, 114, 1, 3, 9), (74, 44, 0.5, 3, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(74, 1, 'Boil eggs 7-8 min for jammy yolks. Cool, peel, halve.'),
(74, 2, 'Blanch green beans 3 min. Refresh in cold water.'),
(74, 3, 'Make dressing: whisk olive oil, vinegar, mustard, salt.'),
(74, 4, 'Drain tuna, flake into chunks.'),
(74, 5, 'Arrange salad leaves, top with beans, tomatoes, olives.'),
(74, 6, 'Add tuna and egg halves. Drizzle with dressing.');

-- Recipe 75: Steak & Egg Salad
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(75, 'Steak & Egg Salad', 2, 1340, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (75, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(75, 3, 300, 1, 1), (75, 38, 4, 5, 2), (75, 98, 100, 1, 3), (75, 24, 100, 1, 4),
(75, 103, 40, 1, 5), (75, 59, 2, 4, 6), (75, 113, 1, 4, 7), (75, 44, 1, 3, 8),
(75, 45, 0.5, 3, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(75, 1, 'Remove steak from fridge 30 min before cooking. Season generously.'),
(75, 2, 'Cook steak 2-3 min per side for medium-rare. Rest 5 min.'),
(75, 3, 'Boil eggs 7-8 min. Cool, peel, halve.'),
(75, 4, 'Slice steak against the grain.'),
(75, 5, 'Arrange rocket on plates. Add tomatoes, steak, eggs.'),
(75, 6, 'Shave Parmesan over top. Dress with olive oil and balsamic.');

-- Recipe 76: Prawn & Egg Power Bowl (High-Protein) - variant of 55
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(76, 'Prawn & Egg Power Bowl', 2, 1280, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (76, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(76, 132, 350, 1, 1), (76, 38, 4, 5, 2), (76, 33, 1, 7, 3), (76, 11, 100, 1, 4),
(76, 24, 100, 1, 5), (76, 59, 2, 4, 6), (76, 30, 2, 4, 7), (76, 13, 2, 10, 8),
(76, 47, 0.5, 3, 9), (76, 44, 0.5, 3, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(76, 1, 'Boil eggs 7-8 min. Cool, peel, halve.'),
(76, 2, 'Heat 1 tbsp olive oil. Season prawns with salt, chili, garlic.'),
(76, 3, 'Sear prawns 2 min per side until pink.'),
(76, 4, 'Arrange salad leaves, tomatoes, sliced avocado.'),
(76, 5, 'Top with prawns and halved eggs.'),
(76, 6, 'Dress with remaining olive oil and lemon juice.');

-- Recipe 77: Turkey Meatballs with Ricotta
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(77, 'Turkey Meatballs with Ricotta', 2, 1320, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (77, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(77, 124, 400, 1, 1), (77, 135, 150, 1, 2), (77, 103, 40, 1, 3), (77, 61, 400, 1, 4),
(77, 13, 2, 10, 5), (77, 12, 100, 1, 6), (77, 59, 1, 4, 7), (77, 48, 1, 3, 8),
(77, 44, 1, 3, 9), (77, 45, 0.25, 3, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(77, 1, 'Mix turkey mince with half the Parmesan, Italian seasoning, salt, pepper.'),
(77, 2, 'Form into 12 meatballs.'),
(77, 3, 'Brown meatballs in olive oil 3-4 min all sides. Remove.'),
(77, 4, 'Add garlic to pan, cook 30 sec. Add tinned tomatoes.'),
(77, 5, 'Simmer 10 min. Return meatballs, cook 15 min until cooked through.'),
(77, 6, 'Stir in spinach until wilted.'),
(77, 7, 'Serve with dollops of ricotta and remaining Parmesan.');

-- =============================================
-- DINNER RECIPES (IDs 56-63 from seed-new, 78-85 high-protein)
-- =============================================

-- Recipe 56: Spaghetti Bolognese
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(56, 'Spaghetti Bolognese', 2, 1300, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (56, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(56, 1, 300, 1, 1), (56, 155, 180, 1, 2), (56, 61, 400, 1, 3), (56, 17, 100, 1, 4),
(56, 22, 60, 1, 5), (56, 21, 60, 1, 6), (56, 13, 2, 10, 7), (56, 60, 2, 4, 8),
(56, 59, 1, 4, 9), (56, 48, 1, 3, 10), (56, 44, 1.5, 3, 11), (56, 45, 0.5, 3, 12),
(56, 103, 30, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(56, 1, 'Finely dice onion, carrot, and celery (soffritto). Mince garlic.'),
(56, 2, 'Heat olive oil in a large pan over medium heat.'),
(56, 3, 'Add soffritto with a pinch of salt. Cook 8-10 minutes until softened.'),
(56, 4, 'Add garlic, cook 30 seconds. Push vegetables to the side.'),
(56, 5, 'Add ground beef. Break up and brown for 5-6 minutes.'),
(56, 6, 'Add tomato paste, stir 1 minute to caramelize.'),
(56, 7, 'Add tinned tomatoes, Italian seasoning, salt, and pepper. Add 100ml water.'),
(56, 8, 'Simmer uncovered for at least 30 minutes.'),
(56, 9, 'Cook spaghetti in salted water until al dente. Reserve 1 cup pasta water.'),
(56, 10, 'Toss pasta with sauce, adding pasta water if needed.'),
(56, 11, 'Serve with freshly grated Parmesan.');

-- Recipe 57: Honey Garlic Salmon (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(57, 'Honey Garlic Salmon with Roasted Vegetables', 2, 1150, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (57, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(57, 101, 400, 1, 1), (57, 76, 2, 4, 2), (57, 13, 4, 10, 3), (57, 72, 2, 4, 4),
(57, 9, 200, 1, 5), (57, 119, 150, 1, 6), (57, 59, 2, 4, 7), (57, 30, 1, 4, 8),
(57, 44, 0.5, 3, 9), (57, 45, 0.25, 3, 10), (57, 88, 1, 4, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(57, 1, 'Preheat oven to 200C (400F).'),
(57, 2, 'GLAZE: Mix honey, minced garlic, soy sauce, and lemon juice.'),
(57, 3, 'Trim broccoli into florets. Snap woody ends off asparagus.'),
(57, 4, 'Toss vegetables with 1 tbsp olive oil and salt. Spread on a baking tray.'),
(57, 5, 'Place salmon fillets on another baking tray.'),
(57, 6, 'Brush salmon generously with honey garlic glaze.'),
(57, 7, 'Roast vegetables 15-20 minutes until tender.'),
(57, 8, 'Roast salmon 12-15 minutes until it flakes easily.'),
(57, 9, 'Serve salmon over roasted vegetables. Sprinkle with sesame seeds.');

-- Recipe 58: Thai Green Curry (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(58, 'Thai Green Curry with Chicken', 2, 1200, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (58, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(58, 7, 400, 1, 1), (58, 151, 400, 2, 2), (58, 121, 150, 1, 3), (58, 123, 80, 1, 4),
(58, 144, 15, 1, 5), (58, 145, 1, 12, 6), (58, 146, 10, 1, 7), (58, 13, 3, 10, 8),
(58, 127, 40, 1, 9), (58, 143, 2, 4, 10), (58, 76, 1, 3, 11), (58, 47, 1, 3, 12),
(58, 140, 1, 3, 13), (58, 49, 0.5, 3, 14), (58, 149, 1, 4, 15);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(58, 1, 'GREEN CURRY PASTE: Bash lemongrass, slice the tender part. Slice galangal, garlic, and shallot.'),
(58, 2, 'Toast coriander seeds and cumin in a dry pan 1 minute. Grind to powder.'),
(58, 3, 'Blend paste ingredients with 2 tbsp coconut milk until smooth.'),
(58, 4, 'Cut chicken into bite-sized pieces. Cut eggplant into chunks.'),
(58, 5, 'Heat coconut oil in a wok over medium-high heat. Add curry paste, fry 2 minutes.'),
(58, 6, 'Add chicken, stir to coat in paste. Cook 3 minutes until sealed.'),
(58, 7, 'Pour in remaining coconut milk. Add eggplant. Simmer 15 minutes.'),
(58, 8, 'Season with fish sauce and honey.'),
(58, 9, 'Stir in bean sprouts and Thai basil just before serving.');

-- Recipe 59: Lemon Herb Roasted Chicken Thighs (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(59, 'Lemon Herb Roasted Chicken Thighs', 2, 1400, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (59, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(59, 118, 600, 1, 1), (59, 29, 2, 5, 2), (59, 13, 6, 10, 3), (59, 28, 3, 5, 4),
(59, 108, 1, 3, 5), (59, 59, 2, 4, 6), (59, 44, 1.5, 3, 7), (59, 45, 0.5, 3, 8),
(59, 26, 300, 1, 9), (59, 120, 150, 1, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(59, 1, 'Preheat oven to 200C (400F). Take chicken out of fridge 30 minutes before.'),
(59, 2, 'Cube sweet potato. Slice zucchini into half-moons. Smash garlic cloves.'),
(59, 3, 'Zest one lemon. Juice both lemons. Mix zest, juice, olive oil, thyme, salt, and pepper.'),
(59, 4, 'Toss vegetables with half the lemon mixture in a roasting pan.'),
(59, 5, 'Season chicken thighs generously. Place skin-side up on vegetables.'),
(59, 6, 'Pour remaining lemon mixture over chicken. Tuck rosemary and garlic around the pan.'),
(59, 7, 'Roast 40-45 minutes until chicken skin is golden and internal temp reaches 74C.'),
(59, 8, 'Rest 5 minutes before serving. Spoon pan juices over everything.');

-- Recipe 60: Mexican Beef Tacos
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(60, 'Mexican Beef Tacos', 2, 1150, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (60, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(60, 1, 300, 1, 1), (60, 157, 6, 5, 2), (60, 33, 1, 7, 3), (60, 126, 150, 1, 4),
(60, 17, 80, 1, 5), (60, 106, 20, 1, 6), (60, 31, 2, 4, 7), (60, 13, 2, 10, 8),
(60, 49, 1, 3, 9), (60, 46, 1, 3, 10), (60, 47, 0.5, 3, 11), (60, 44, 1, 3, 12),
(60, 136, 40, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(60, 1, 'SEASONING: Mix cumin, paprika, chili flakes, and 0.5 tsp salt.'),
(60, 2, 'Heat a pan over medium-high heat. Add ground beef, break up, cook until browned.'),
(60, 3, 'Add minced garlic and seasoning mix. Cook 1 minute. Drain excess fat if needed.'),
(60, 4, 'PICO DE GALLO: Dice tomato and half the onion. Mix with coriander, 1 tbsp lime juice, and salt.'),
(60, 5, 'GUACAMOLE: Mash avocado with remaining lime juice, diced onion, salt, and pepper.'),
(60, 6, 'Warm tortillas in a dry pan.'),
(60, 7, 'Assemble tacos: Add spiced beef, guacamole, pico de gallo, and grated cheddar.'),
(60, 8, 'Serve immediately with lime wedges.');

-- Recipe 61: Japanese Beef Gyudon
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(61, 'Japanese Beef Gyudon (Rice Bowl)', 2, 1250, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (61, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(61, 3, 300, 1, 1), (61, 71, 200, 1, 2), (61, 17, 200, 1, 3), (61, 38, 2, 5, 4),
(61, 72, 3, 4, 5), (61, 76, 1, 4, 6), (61, 14, 10, 1, 7), (61, 164, 150, 2, 8),
(61, 19, 20, 1, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(61, 1, 'Cook rice: Rinse until clear, cook with 400ml water, bring to boil, cover, simmer 12 minutes.'),
(61, 2, 'Slice beef very thinly. Thinly slice onion. Grate ginger.'),
(61, 3, 'SAUCE: Mix soy sauce, honey, ginger, and stock.'),
(61, 4, 'Heat a pan over medium-high heat. Add onions, cook 3-4 minutes until softened.'),
(61, 5, 'Pour in sauce mixture. Bring to a simmer.'),
(61, 6, 'Add beef slices in a single layer. Cook 2-3 minutes until just cooked through.'),
(61, 7, 'Soft-poach or fry eggs with runny yolks.'),
(61, 8, 'Divide rice between bowls. Top with beef and onions, spooning sauce over.'),
(61, 9, 'Top each bowl with an egg and sliced spring onion.');

-- Recipe 62: Lamb Kofta (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(62, 'Lamb Kofta with Tzatziki', 2, 1300, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (62, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(62, 116, 400, 1, 1), (62, 36, 150, 1, 2), (62, 23, 150, 1, 3), (62, 13, 3, 10, 4),
(62, 17, 60, 1, 5), (62, 49, 1, 3, 6), (62, 140, 1, 3, 7), (62, 141, 0.5, 3, 8),
(62, 50, 0.25, 3, 9), (62, 44, 1.5, 3, 10), (62, 45, 0.5, 3, 11), (62, 137, 15, 1, 12),
(62, 30, 2, 4, 13), (62, 59, 1, 4, 14), (62, 158, 2, 5, 15);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(62, 1, 'TZATZIKI: Grate cucumber, squeeze out excess water. Mix with yogurt, 1 minced garlic clove, mint, lemon juice, and salt.'),
(62, 2, 'KOFTA: Grate onion and squeeze out moisture. Toast cumin and coriander seeds, grind.'),
(62, 3, 'Mix lamb with grated onion, 2 minced garlic cloves, ground spices, paprika, cinnamon, salt, and pepper.'),
(62, 4, 'Divide mixture into 8 portions. Shape into oval cylinders.'),
(62, 5, 'Grill or pan-fry kofta in olive oil 3-4 minutes per side.'),
(62, 6, 'Warm pita bread. Make a quick salad with lettuce, tomato, and remaining mint.'),
(62, 7, 'Serve kofta with tzatziki, warm pita, salad, and lemon wedges.');

-- Recipe 63: Butter Chicken (Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(63, 'Butter Chicken (Murgh Makhani)', 2, 1400, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (63, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(63, 7, 450, 1, 1), (63, 36, 100, 1, 2), (63, 61, 400, 1, 3), (63, 92, 40, 1, 4),
(63, 17, 100, 1, 5), (63, 13, 4, 10, 6), (63, 14, 15, 1, 7), (63, 54, 1.5, 3, 8),
(63, 49, 1, 3, 9), (63, 140, 1, 3, 10), (63, 57, 0.5, 3, 11), (63, 139, 0.25, 3, 12),
(63, 147, 3, 5, 13), (63, 44, 1.5, 3, 14), (63, 76, 1, 3, 15), (63, 106, 20, 1, 16);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(63, 1, 'MARINADE: Mix yogurt with 0.5 tsp each garam masala, cumin, turmeric, salt, and grated ginger. Coat chicken chunks. Rest 30 minutes.'),
(63, 2, 'Dice onion. Mince garlic and remaining ginger.'),
(63, 3, 'Heat half the butter in a pan. Add marinated chicken, cook 4-5 minutes until lightly charred. Set aside.'),
(63, 4, 'Add remaining butter to pan. Saute onion 5 minutes until golden.'),
(63, 5, 'Add garlic, ginger, cardamom, and remaining spices. Cook 1 minute.'),
(63, 6, 'Add tinned tomatoes. Simmer 10 minutes until sauce thickens. Remove cardamom pods.'),
(63, 7, 'Blend sauce until smooth. Return to pan.'),
(63, 8, 'Add chicken back to sauce. Simmer 10 minutes until cooked through.'),
(63, 9, 'Stir in honey. Adjust salt and spice level.'),
(63, 10, 'Garnish with fresh coriander.');

-- =============================================
-- HIGH-PROTEIN DINNER (IDs 78-85)
-- =============================================

-- Recipe 78: Honey Garlic Salmon (Light) - variant of 57
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(78, 'Honey Garlic Salmon with Greens', 2, 1320, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (78, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(78, 101, 400, 1, 1), (78, 38, 4, 5, 2), (78, 76, 2, 4, 3), (78, 13, 4, 10, 4),
(78, 72, 2, 4, 5), (78, 9, 200, 1, 6), (78, 20, 150, 1, 7), (78, 59, 1, 3, 8),
(78, 44, 0.5, 3, 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(78, 1, 'Mix honey, minced garlic, soy sauce for glaze.'),
(78, 2, 'Season salmon with salt. Brush with half the glaze.'),
(78, 3, 'Bake salmon at 200C for 12-15 min, brushing with more glaze halfway.'),
(78, 4, 'Boil eggs 7-8 min. Cool and halve.'),
(78, 5, 'Steam or stir-fry broccoli and pak choi 3-4 min.'),
(78, 6, 'Serve salmon on greens with halved eggs and remaining glaze.');

-- Recipe 79: Lamb Kofta (Light) - variant of 62
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(79, 'Lamb Kofta (Light)', 2, 1340, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (79, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(79, 116, 350, 1, 1), (79, 36, 200, 1, 2), (79, 23, 200, 1, 3), (79, 24, 100, 1, 4),
(79, 18, 50, 1, 5), (79, 17, 60, 1, 6), (79, 13, 3, 10, 7), (79, 49, 1, 3, 8),
(79, 140, 1, 3, 9), (79, 59, 1, 4, 10), (79, 137, 15, 1, 11), (79, 30, 1, 4, 12),
(79, 44, 1.5, 3, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(79, 1, 'TZATZIKI: Grate half cucumber, squeeze dry. Mix with yogurt, 1 garlic clove, mint, lemon, salt.'),
(79, 2, 'KOFTA: Mix lamb with grated onion, 2 garlic cloves, cumin, coriander, salt.'),
(79, 3, 'Form into 8 oval patties or onto skewers.'),
(79, 4, 'Grill or pan-fry kofta in olive oil 3-4 min per side.'),
(79, 5, 'SALAD: Dice remaining cucumber, halve tomatoes, slice red onion.'),
(79, 6, 'Serve kofta with tzatziki and salad (no pita).');

-- Recipe 80: Butter Chicken (Light) - variant of 63
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(80, 'Butter Chicken (Light)', 2, 1300, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (80, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(80, 7, 450, 1, 1), (80, 36, 150, 1, 2), (80, 61, 300, 1, 3), (80, 92, 30, 1, 4),
(80, 17, 80, 1, 5), (80, 13, 4, 10, 6), (80, 14, 15, 1, 7), (80, 54, 1.5, 3, 8),
(80, 49, 1, 3, 9), (80, 57, 0.5, 3, 10), (80, 139, 0.25, 3, 11), (80, 44, 1.5, 3, 12),
(80, 167, 200, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(80, 1, 'MARINADE: Mix 50g yogurt with half the spices. Coat chicken chunks. Rest 30 min.'),
(80, 2, 'Brown chicken in half the butter. Set aside.'),
(80, 3, 'Saute onion in remaining butter 5 min. Add garlic, ginger, spices. Cook 1 min.'),
(80, 4, 'Add tinned tomatoes. Simmer 10 min until thick.'),
(80, 5, 'Blend sauce until smooth. Return to pan.'),
(80, 6, 'Add chicken, simmer 10 min until cooked through.'),
(80, 7, 'Stir in remaining yogurt. Season.'),
(80, 8, 'Pulse cauliflower to rice texture. Microwave 3 min. Serve curry over cauli rice.');

-- Recipe 81: Chicken Tikka (Light)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(81, 'Chicken Tikka (Light)', 2, 1300, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (81, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(81, 7, 400, 1, 1), (81, 36, 200, 1, 2), (81, 17, 100, 1, 3), (81, 13, 3, 10, 4),
(81, 14, 15, 1, 5), (81, 49, 1.5, 3, 6), (81, 46, 1, 3, 7), (81, 57, 0.5, 3, 8),
(81, 54, 1, 3, 9), (81, 59, 2, 4, 10), (81, 30, 2, 4, 11), (81, 44, 1.5, 3, 12),
(81, 167, 200, 1, 13);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(81, 1, 'MARINADE: Mix 100g yogurt with all spices, 1 tbsp lemon juice, 2 garlic cloves, ginger, salt.'),
(81, 2, 'Cube chicken, coat in marinade. Rest 30 min (overnight better).'),
(81, 3, 'Thread chicken on skewers. Grill or pan-fry until charred and cooked through.'),
(81, 4, 'RAITA: Mix remaining yogurt with grated cucumber, mint, salt.'),
(81, 5, 'Pulse cauliflower to rice. Microwave 3 min or fry with 1 garlic clove.'),
(81, 6, 'Serve tikka over cauliflower rice with raita and lemon wedges.');

-- Recipe 82: Thai Red Curry (Full) - variant of 58
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(82, 'Thai Red Curry with Chicken', 2, 1250, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (82, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(82, 7, 400, 1, 1), (82, 151, 400, 2, 2), (82, 16, 150, 1, 3), (82, 123, 80, 1, 4),
(82, 144, 15, 1, 5), (82, 145, 1, 12, 6), (82, 146, 10, 1, 7), (82, 13, 3, 10, 8),
(82, 127, 40, 1, 9), (82, 143, 2, 4, 10), (82, 76, 1, 3, 11), (82, 47, 2, 3, 12),
(82, 141, 1, 3, 13), (82, 149, 1, 4, 14);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(82, 1, 'RED CURRY PASTE: Use paprika and extra chili instead of green chilies. Add to paste ingredients.'),
(82, 2, 'Follow green curry method substituting paste.'),
(82, 3, 'Use sliced red bell pepper instead of eggplant for a sweeter, less bitter curry.'),
(82, 4, 'Red curry traditionally has a sweeter, smokier flavor profile.');

-- Recipe 83: Lemon Herb Chicken (Light) - variant of 59
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(83, 'Lemon Herb Chicken with Sweet Potato', 2, 1340, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (83, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(83, 7, 350, 1, 1), (83, 26, 300, 1, 2), (83, 9, 200, 1, 3), (83, 29, 2, 5, 4),
(83, 59, 2, 4, 5), (83, 28, 2, 5, 6), (83, 108, 1, 3, 7), (83, 13, 4, 10, 8),
(83, 44, 1.5, 3, 9), (83, 45, 0.5, 3, 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(83, 1, 'Preheat oven to 200C.'),
(83, 2, 'Cube sweet potato. Toss with 1 tbsp olive oil, salt. Roast 25-30 min.'),
(83, 3, 'Season chicken with salt, pepper, thyme. Zest and juice 1 lemon over chicken.'),
(83, 4, 'Add rosemary and smashed garlic to chicken. Drizzle with remaining olive oil.'),
(83, 5, 'Pan-fry or bake chicken 6-7 min per side until cooked through.'),
(83, 6, 'Steam broccoli 4-5 min until tender-crisp.'),
(83, 7, 'Serve chicken with sweet potato and broccoli. Squeeze remaining lemon over.');

-- Recipe 84: Beef & Vegetable Stir Fry
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(84, 'Beef & Vegetable Stir Fry', 2, 1280, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (84, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(84, 3, 300, 1, 1), (84, 38, 4, 5, 2), (84, 16, 100, 1, 3), (84, 15, 100, 1, 4),
(84, 20, 200, 1, 5), (84, 17, 80, 1, 6), (84, 72, 2, 4, 7), (84, 13, 2, 10, 8),
(84, 14, 10, 1, 9), (84, 59, 2, 4, 10), (84, 45, 1, 4, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(84, 1, 'Slice beef very thinly against the grain.'),
(84, 2, 'Heat 1 tbsp oil in wok over HIGH heat. Sear beef 1-2 min. Set aside.'),
(84, 3, 'Scramble eggs in same wok. Set aside.'),
(84, 4, 'Add remaining oil. Stir-fry peppers, onion, pak choi 3-4 min.'),
(84, 5, 'Add garlic, ginger. Cook 30 sec.'),
(84, 6, 'Return beef and eggs. Add soy sauce and black pepper.'),
(84, 7, 'Toss everything together. Serve immediately.');

-- Recipe 85: Prawn & Chicken Stir Fry
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(85, 'Prawn & Chicken Stir Fry', 2, 1320, FALSE, FALSE);
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (85, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(85, 7, 200, 1, 1), (85, 132, 250, 1, 2), (85, 16, 100, 1, 3), (85, 20, 200, 1, 4),
(85, 27, 100, 1, 5), (85, 72, 2, 4, 6), (85, 13, 2, 10, 7), (85, 14, 10, 1, 8),
(85, 59, 2, 4, 9), (85, 109, 1, 3, 10), (85, 88, 1, 4, 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(85, 1, 'Slice chicken breast thinly. Season with salt.'),
(85, 2, 'Heat olive oil in wok over HIGH heat. Stir-fry chicken 4-5 min. Set aside.'),
(85, 3, 'Add prawns, cook 2 min per side until pink. Set aside.'),
(85, 4, 'Stir-fry peppers, pak choi, mushrooms 2-3 min.'),
(85, 5, 'Add garlic and ginger. Cook 30 sec.'),
(85, 6, 'Return chicken and prawns. Add soy sauce and sesame oil.'),
(85, 7, 'Toss, top with sesame seeds. Serve immediately.');

-- =============================================
-- RECIPE FAMILIES (Updated with all variants)
-- =============================================

-- Add to existing Pancake Family (ID 2)
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(2, 68, FALSE, 'High-Protein', 4);

-- New families for merged recipes (starting from ID 13)
INSERT INTO recipe_families (id, family_name, description) VALUES
(13, 'Shakshuka', 'Middle Eastern baked eggs - Standard, High-Protein variant'),
(14, 'Greek Yogurt Bowl', 'Yogurt-based breakfast - Parfait with granola, Power Bowl high-protein'),
(15, 'Overnight Oats', 'No-cook oats - Apple & Cinnamon standard, Protein Oats high-protein'),
(16, 'Huevos Rancheros', 'Mexican breakfast eggs - Standard with tortillas, High-Protein without'),
(17, 'Thai Chicken Larb', 'Thai minced chicken - Lettuce Cups standard, High-Protein version'),
(18, 'Greek Souvlaki', 'Greek chicken skewers - Plate with pita, Bowl without'),
(19, 'Prawn Salad', 'Prawn-based salads - Avocado Salad standard, Power Bowl high-protein'),
(20, 'Honey Garlic Salmon', 'Glazed salmon - With Roasted Veg standard, With Greens light'),
(21, 'Lamb Kofta', 'Middle Eastern lamb - Standard with pita, Light without'),
(22, 'Butter Chicken', 'Indian butter chicken - Standard, Light with cauliflower rice'),
(23, 'Thai Curry', 'Thai coconut curry - Green standard, Red variant'),
(24, 'Lemon Herb Chicken', 'Roasted chicken - Thighs standard, Breast light');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
-- Shakshuka Family
(13, 37, TRUE, 'Standard', 1),
(13, 67, FALSE, 'High-Protein', 2),
-- Greek Yogurt Bowl Family
(14, 39, TRUE, 'Standard', 1),
(14, 69, FALSE, 'High-Protein', 2),
-- Overnight Oats Family
(15, 43, TRUE, 'Standard', 1),
(15, 70, FALSE, 'High-Protein', 2),
-- Huevos Rancheros Family
(16, 42, TRUE, 'Standard', 1),
(16, 71, FALSE, 'High-Protein', 2),
-- Thai Chicken Larb Family
(17, 47, TRUE, 'Standard', 1),
(17, 72, FALSE, 'High-Protein', 2),
-- Greek Souvlaki Family
(18, 50, TRUE, 'Standard', 1),
(18, 73, FALSE, 'Light', 2),
-- Prawn Salad Family
(19, 55, TRUE, 'Standard', 1),
(19, 76, FALSE, 'High-Protein', 2),
-- Honey Garlic Salmon Family
(20, 57, TRUE, 'Standard', 1),
(20, 78, FALSE, 'Light', 2),
-- Lamb Kofta Family
(21, 62, TRUE, 'Standard', 1),
(21, 79, FALSE, 'Light', 2),
-- Butter Chicken Family
(22, 63, TRUE, 'Standard', 1),
(22, 80, FALSE, 'Light', 2),
(22, 81, FALSE, 'Tikka Light', 3),
-- Thai Curry Family
(23, 58, TRUE, 'Green', 1),
(23, 82, FALSE, 'Red', 2),
-- Lemon Herb Chicken Family
(24, 59, TRUE, 'Standard', 1),
(24, 83, FALSE, 'Light', 2);

-- FoodBytes MVP Seed Data
-- Sample recipes for testing

-- Insert sample recipes
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

-- Assign meals to categories
INSERT INTO recipe_meals (recipe_id, meal_type) VALUES
-- Breakfast
(1, 'breakfast'),
(2, 'breakfast'),
(3, 'breakfast'),
(13, 'breakfast'),
-- Lunch
(4, 'lunch'),
(5, 'lunch'),
(6, 'lunch'),
-- Dinner
(7, 'dinner'),
(8, 'dinner'),
(9, 'dinner'),
(14, 'dinner'),
-- Snacks
(10, 'snacks'),
(11, 'snacks'),
(12, 'snacks');

-- Recipe 1: Overnight Oats - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(1, 'Rolled oats', 40, 'g', 1),
(1, 'Greek yogurt', 100, 'g', 2),
(1, 'Milk', 200, 'ml', 3),
(1, 'Mixed berries', 100, 'g', 4),
(1, 'Chia seeds', 2, 'tsp', 5),
(1, 'Honey', 0.5, 'tsp', 6),
(1, 'Peanut butter', 1, 'tbsp', 7),
(1, 'Banana', 1, 'piece', 8),
(1, 'Cinnamon', 0.25, 'tsp', 9);

-- Recipe 1: Overnight Oats - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(1, 1, 'Combine oats, yogurt, milk, chia seeds, and peanut butter.'),
(1, 2, 'Mix well and refrigerate overnight.'),
(1, 3, 'In the morning, stir and top with berries, banana slices, honey, and cinnamon.');

-- Recipe 2: Scrambled Eggs - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(2, 'Eggs', 8, 'small', 1),
(2, 'Butter', 1, 'tsp', 2),
(2, 'Spinach', 60, 'g', 3),
(2, 'Avocado', 1, 'medium', 4);

-- Recipe 2: Scrambled Eggs - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(2, 1, 'Slice or mash avocado and set aside.'),
(2, 2, 'Sauté spinach in a non-stick pan until wilted. Remove and plate.'),
(2, 3, 'Whisk eggs with salt to taste.'),
(2, 4, 'Heat butter in a pan, add eggs, and stir continuously until softly scrambled.'),
(2, 5, 'Serve eggs with spinach and avocado on the side.');

-- Recipe 3: Greek Yogurt Parfait - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(3, 'Greek yogurt', 200, 'g', 1),
(3, 'Mixed berries', 80, 'g', 2),
(3, 'Granola', 30, 'g', 3),
(3, 'Honey', 1, 'tbsp', 4);

-- Recipe 3: Greek Yogurt Parfait - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(3, 1, 'Layer half the yogurt in a glass or bowl.'),
(3, 2, 'Add half the berries and granola.'),
(3, 3, 'Repeat layers and drizzle with honey.');

-- Recipe 4: Grilled Chicken Salad - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(4, 'Chicken breast', 240, 'g', 1),
(4, 'Salad leaves', 2, 'handful', 2),
(4, 'Cucumber', 1, 'piece', 3),
(4, 'Cherry tomatoes', 10, 'piece', 4),
(4, 'Carrot', 2, 'piece', 5),
(4, 'Lemon', 1, 'piece', 6),
(4, 'Olive oil', 1, 'tbsp', 7),
(4, 'Avocado', 0.5, 'medium', 8),
(4, 'Chickpeas', 150, 'g', 9),
(4, 'Feta cheese', 40, 'g', 10);

-- Recipe 4: Grilled Chicken Salad - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(4, 1, 'Cook and slice the chicken breast. Let rest if made in advance.'),
(4, 2, 'Wash and prep the salad leaves, cucumber, tomatoes, and carrots.'),
(4, 3, 'Slice avocado and drain chickpeas.'),
(4, 4, 'Crumble feta over the vegetables.'),
(4, 5, 'In a small bowl, mix lemon juice and 1 tbsp olive oil for dressing.'),
(4, 6, 'Combine all ingredients in a large bowl and toss with dressing.'),
(4, 7, 'Top with grilled chicken and serve.');

-- Recipe 5: Turkey & Avocado Wrap - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(5, 'Flour tortillas', 2, 'piece', 1),
(5, 'Turkey breast', 150, 'g', 2),
(5, 'Avocado', 1, 'medium', 3),
(5, 'Lettuce leaves', 4, 'piece', 4),
(5, 'Tomato', 1, 'piece', 5),
(5, 'Mayonnaise', 1, 'tbsp', 6);

-- Recipe 5: Turkey & Avocado Wrap - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(5, 1, 'Warm the tortillas slightly.'),
(5, 2, 'Spread mayonnaise on each tortilla.'),
(5, 3, 'Layer turkey, sliced avocado, lettuce, and tomato.'),
(5, 4, 'Roll up tightly and slice in half to serve.');

-- Recipe 6: Mediterranean Quinoa Bowl - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(6, 'Quinoa', 150, 'g', 1),
(6, 'Cucumber', 1, 'piece', 2),
(6, 'Cherry tomatoes', 8, 'piece', 3),
(6, 'Red onion', 0.5, 'piece', 4),
(6, 'Feta cheese', 50, 'g', 5),
(6, 'Olive oil', 2, 'tbsp', 6),
(6, 'Lemon juice', 1, 'tbsp', 7),
(6, 'Fresh parsley', 2, 'tbsp', 8);

-- Recipe 6: Mediterranean Quinoa Bowl - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(6, 1, 'Cook quinoa according to package instructions and let cool.'),
(6, 2, 'Dice cucumber, halve tomatoes, and thinly slice red onion.'),
(6, 3, 'Combine cooled quinoa with vegetables.'),
(6, 4, 'Crumble feta cheese over the bowl.'),
(6, 5, 'Drizzle with olive oil and lemon juice, toss to combine.'),
(6, 6, 'Garnish with fresh parsley.');

-- Recipe 7: Baked Salmon - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(7, 'Salmon fillet', 2, 'piece', 1),
(7, 'Broccoli', 1, 'head', 2),
(7, 'Carrot', 2, 'piece', 3),
(7, 'Salad leaves', 2, 'handful', 4),
(7, 'Lemon', 1, 'piece', 5),
(7, 'Olive oil', 3, 'tbsp', 6),
(7, 'Avocado', 1, 'medium', 7),
(7, 'Salt', 0.5, 'tsp', 8),
(7, 'Almonds', 20, 'g', 9);

-- Recipe 7: Baked Salmon - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(7, 1, 'Preheat oven to 180°C.'),
(7, 2, 'Cut broccoli into florets and toss with 1 tbsp olive oil and salt.'),
(7, 3, 'Spread broccoli on a baking tray and roast for 10 minutes.'),
(7, 4, 'Add salmon fillets in the center, drizzle with olive oil and season.'),
(7, 5, 'Bake for another 20 minutes until salmon is cooked and broccoli tender.'),
(7, 6, 'Spiralize carrots and toss with salad leaves, avocado, and almonds.'),
(7, 7, 'Make a dressing with lemon juice and 1 tbsp olive oil.'),
(7, 8, 'Serve salmon with roasted broccoli and the avocado-nut salad.');

-- Recipe 8: Stir-Fried Chicken - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(8, 'Chicken breast', 240, 'g', 1),
(8, 'Green bell pepper', 1, 'piece', 2),
(8, 'Red bell pepper', 1, 'piece', 3),
(8, 'Onion', 1, 'piece', 4),
(8, 'Soy sauce', 2, 'tbsp', 5),
(8, 'Garlic', 2, 'clove', 6),
(8, 'Ginger', 1, 'tsp', 7),
(8, 'Olive oil', 2, 'tbsp', 8),
(8, 'Sesame seeds', 1, 'tsp', 9);

-- Recipe 8: Stir-Fried Chicken - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(8, 1, 'Slice chicken and peppers into strips.'),
(8, 2, 'Heat oil in a wok over high heat.'),
(8, 3, 'Stir-fry chicken for 4-5 minutes until cooked.'),
(8, 4, 'Add garlic and ginger, stir for 30 seconds.'),
(8, 5, 'Add peppers and onion, cook for 3 minutes.'),
(8, 6, 'Add soy sauce and toss to combine.'),
(8, 7, 'Sprinkle with sesame seeds before serving.');

-- Recipe 9: Beef Stir Fry - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(9, 'Beef sirloin', 250, 'g', 1),
(9, 'Broccoli', 200, 'g', 2),
(9, 'Soy sauce', 3, 'tbsp', 3),
(9, 'Garlic', 3, 'clove', 4),
(9, 'Olive oil', 2, 'tbsp', 5),
(9, 'Brown rice', 150, 'g', 6);

-- Recipe 9: Beef Stir Fry - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(9, 1, 'Cook brown rice according to package instructions.'),
(9, 2, 'Slice beef into thin strips.'),
(9, 3, 'Cut broccoli into small florets.'),
(9, 4, 'Heat oil in a wok and stir-fry beef for 2-3 minutes.'),
(9, 5, 'Add garlic and broccoli, cook for 4 minutes.'),
(9, 6, 'Add soy sauce and toss well.'),
(9, 7, 'Serve over brown rice.');

-- Recipe 10: Mixed Nuts & Dark Chocolate - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(10, 'Almonds', 20, 'g', 1),
(10, 'Cashews', 15, 'g', 2),
(10, 'Walnuts', 15, 'g', 3),
(10, 'Dark chocolate', 20, 'g', 4);

-- Recipe 10: Mixed Nuts & Dark Chocolate - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(10, 1, 'Combine all nuts in a small container.'),
(10, 2, 'Break dark chocolate into small pieces and add.'),
(10, 3, 'Mix and enjoy as a healthy snack.');

-- Recipe 11: Hummus with Veggie Sticks - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(11, 'Hummus', 100, 'g', 1),
(11, 'Carrot', 2, 'piece', 2),
(11, 'Cucumber', 0.5, 'piece', 3),
(11, 'Celery', 2, 'stalk', 4),
(11, 'Red bell pepper', 0.5, 'piece', 5);

-- Recipe 11: Hummus with Veggie Sticks - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(11, 1, 'Cut vegetables into sticks.'),
(11, 2, 'Serve hummus in a bowl with veggie sticks around it.'),
(11, 3, 'Dip and enjoy!');

-- Recipe 12: Protein Energy Balls - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(12, 'Rolled oats', 100, 'g', 1),
(12, 'Peanut butter', 80, 'g', 2),
(12, 'Honey', 3, 'tbsp', 3),
(12, 'Dark chocolate chips', 30, 'g', 4),
(12, 'Chia seeds', 1, 'tbsp', 5);

-- Recipe 12: Protein Energy Balls - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(12, 1, 'Mix all ingredients in a bowl until well combined.'),
(12, 2, 'Refrigerate for 15 minutes to make rolling easier.'),
(12, 3, 'Roll into small balls (about 12).'),
(12, 4, 'Store in refrigerator for up to 1 week.');

-- Recipe 13: Pancakes (Cheat) - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(13, 'Plain flour', 200, 'g', 1),
(13, 'Eggs', 2, 'large', 2),
(13, 'Milk', 300, 'ml', 3),
(13, 'Butter', 30, 'g', 4),
(13, 'Maple syrup', 4, 'tbsp', 5),
(13, 'Mixed berries', 100, 'g', 6);

-- Recipe 13: Pancakes - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(13, 1, 'Whisk flour, eggs, and milk until smooth batter forms.'),
(13, 2, 'Heat a non-stick pan with a little butter.'),
(13, 3, 'Pour batter to make pancakes, flip when bubbles form.'),
(13, 4, 'Stack pancakes and top with berries and maple syrup.');

-- Recipe 14: Burger with Fries (Cheat) - Ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(14, 'Beef mince', 200, 'g', 1),
(14, 'Burger bun', 1, 'piece', 2),
(14, 'Lettuce', 2, 'leaf', 3),
(14, 'Tomato', 2, 'slice', 4),
(14, 'Cheese', 1, 'slice', 5),
(14, 'Potatoes', 200, 'g', 6),
(14, 'Olive oil', 2, 'tbsp', 7),
(14, 'Salt', 0.5, 'tsp', 8);

-- Recipe 14: Burger with Fries - Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(14, 1, 'Cut potatoes into fries, toss with oil and salt, bake at 200°C for 25 min.'),
(14, 2, 'Form beef mince into a patty, season with salt.'),
(14, 3, 'Grill or pan-fry patty for 4 minutes each side.'),
(14, 4, 'Toast the burger bun.'),
(14, 5, 'Assemble: bun, lettuce, patty, cheese, tomato, bun.'),
(14, 6, 'Serve with fries.');

-- Insert a test admin user (for development only)
INSERT INTO users (email, name, google_id, is_admin, created_at) VALUES
('admin@foodbytes.test', 'Admin User', 'google_admin_test_id', TRUE, NOW());

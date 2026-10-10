-- Chicken Alfredo â€” Light/Moderate/Balanced (family 116, recipes 282-284)
-- CHEAT MEAL: is_cheat = 1, macros_audited stays 0 (matches the convention used by
-- Carbonara 210-212, Steak & Chips 47-49, Big Mac 63, Pastichio 65).
-- Fat runs 48-55% of kcal by design; protein still clears 35 g/serving on all three.
-- New ingredient: Double cream. Fresh egg pasta is shared with the pesto-pasta migration.
-- All inserts guarded with WHERE NOT EXISTS â€” re-running is a no-op.

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 199, 'fresh_egg_pasta', 'Fresh egg pasta', 11, 8.90, 49.70, 2.50, 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE `key` = 'fresh_egg_pasta' OR name = 'Fresh egg pasta');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 200, 'double_cream', 'Double cream', 6, 1.70, 2.70, 48.00, 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE `key` = 'double_cream' OR name = 'Double cream');

SET @ing_fresh_pasta := (SELECT id FROM ingredients WHERE `key` = 'fresh_egg_pasta');
SET @ing_cream       := (SELECT id FROM ingredients WHERE `key` = 'double_cream');

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 282, 'Chicken Alfredo', 2, 1670, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 282);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 283, 'Chicken Alfredo', 2, 2189, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 283);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 284, 'Chicken Alfredo', 2, 2732, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 284);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM (SELECT 282 AS id UNION SELECT 283 UNION SELECT 284) r
WHERE NOT EXISTS (SELECT 1 FROM recipe_meals m WHERE m.recipe_id = r.id AND m.meal_id = 3);

-- Ingredients (FR-103 dual-path on the pasta)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 11, NULL, 220.00, 1, 220.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, @ing_fresh_pasta, 36, 200.00, 1, 200.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, @ing_cream, NULL, 80.00, 2, 80.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> @ing_cream) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 44, NULL, 1.50, 4, 20.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 44) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 30, NULL, 50.00, 1, 50.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 30) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 13, NULL, 2.00, 10, 6.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 13) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 22, NULL, 1.00, 3, 5.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 22) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 105, NULL, 1.00, 17, 0.30, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 105) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 123, NULL, 1.00, 9, 5.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 123) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 5, NULL, 0.50, 3, 3.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 282, 50, NULL, 0.25, 3, 1.50, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 282 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 11, NULL, 250.00, 1, 250.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, @ing_fresh_pasta, 36, 250.00, 1, 250.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, @ing_cream, NULL, 120.00, 2, 120.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> @ing_cream) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 44, NULL, 2.00, 4, 30.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 44) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 30, NULL, 70.00, 1, 70.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 30) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 13, NULL, 2.00, 10, 6.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 13) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 22, NULL, 1.00, 3, 5.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 22) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 105, NULL, 1.00, 17, 0.30, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 105) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 123, NULL, 1.00, 9, 5.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 123) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 5, NULL, 0.50, 3, 3.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 283, 50, NULL, 0.25, 3, 1.50, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 283 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 11, NULL, 280.00, 1, 280.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, @ing_fresh_pasta, 36, 282.00, 1, 282.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, @ing_cream, NULL, 150.00, 2, 150.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> @ing_cream) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 44, NULL, 3.00, 4, 40.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 44) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 30, NULL, 85.00, 1, 85.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 30) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 178, NULL, 40.00, 1, 40.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 178) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 13, NULL, 2.00, 10, 6.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 13) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 105, NULL, 1.00, 17, 0.30, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 105) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 123, NULL, 1.00, 9, 5.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 123) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 5, NULL, 0.50, 3, 3.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 284, 50, NULL, 0.25, 3, 1.50, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 284 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));

-- Steps (the pasta prep step carries linked_recipe_id + alt_instruction)
DELETE FROM recipe_steps WHERE recipe_id IN (282,283,284);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 1, 'Make the fresh pasta according to the linked recipe and cut it to fettuccine. You need 200 g.', 'Wide ribbons are the point — Alfredo needs surface area for the sauce to cling to.', 36, 'Use 200 g fresh egg pasta from the pack (about 2/3 of a 300 g pack).');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 2, 'Grate 50 g parmesan finely from a block and let it come to room temperature.', 'Do not use pre-grated parmesan. It is dusted with anti-caking starch and will never emulsify — it just goes gritty.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 3, 'Pat the 220 g chicken breast completely dry, season, and rest at room temperature for 10 minutes.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 4, 'Heat 1 tsp olive oil in a heavy pan over medium-high until it shimmers. Sear the chicken 4-5 minutes a side, to 74 C internal. Rest on a board for 5 minutes. Keep the pan.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 5, 'Drop the pan to medium-low. Melt 1 1/2 tbsp unsalted butter, add 2 grated garlic cloves and cook 30-45 seconds until fragrant.', 'The garlic must not colour — browned garlic turns the whole sauce acrid.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 6, 'Pour in 80 ml double cream and bring to a bare simmer. Reduce for 3-4 minutes, until it is down by about a quarter and coats the back of a spoon. Grate in a pinch of nutmeg.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 7, 'Cook the pasta in heavily salted boiling water for 2-3 minutes, until it floats and is just tender. Reserve 250 ml of the cooking water, then drain.', 'Salt this water properly. It is the only chance to season the pasta itself, and the starch in it is what holds the sauce together.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 8, 'Take the pan off the heat and wait 30 seconds. Add the pasta and a 60 ml splash of pasta water, then the 50 g parmesan in three handfuls, tossing continuously between each.', 'This is the step that makes or breaks Alfredo. Above a simmer the cheese seizes into strings and the sauce breaks into oil and grit. Off the heat, cheese in stages, keep it moving.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 9, 'Toss hard for a full minute, loosening with more pasta water until the sauce is glossy and clings to every ribbon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 10, 'Slice the rested chicken across the grain and fold it in with any juices from the board.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 11, 'Taste. It will want far more black pepper than you expect. Add salt only after tasting — the parmesan brings a lot of its own.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (282, 12, 'Plate immediately and finish with chopped parsley and cracked black pepper.', 'Alfredo tightens as it cools and does not come back. This dish waits for nobody — have everyone at the table before step 9.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 1, 'Make the fresh pasta according to the linked recipe and cut it to fettuccine. You need 250 g.', 'Wide ribbons are the point — Alfredo needs surface area for the sauce to cling to.', 36, 'Use 250 g fresh egg pasta from the pack (about 4/5 of a 300 g pack).');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 2, 'Grate 70 g parmesan finely from a block and let it come to room temperature.', 'Do not use pre-grated parmesan. It is dusted with anti-caking starch and will never emulsify — it just goes gritty.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 3, 'Pat the 250 g chicken breast completely dry, season, and rest at room temperature for 10 minutes.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 4, 'Heat 1 tsp olive oil in a heavy pan over medium-high until it shimmers. Sear the chicken 4-5 minutes a side, to 74 C internal. Rest on a board for 5 minutes. Keep the pan.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 5, 'Drop the pan to medium-low. Melt 2 tbsp unsalted butter, add 2 grated garlic cloves and cook 30-45 seconds until fragrant.', 'The garlic must not colour — browned garlic turns the whole sauce acrid.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 6, 'Pour in 120 ml double cream and bring to a bare simmer. Reduce for 3-4 minutes, until it is down by about a quarter and coats the back of a spoon. Grate in a pinch of nutmeg.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 7, 'Cook the pasta in heavily salted boiling water for 2-3 minutes, until it floats and is just tender. Reserve 250 ml of the cooking water, then drain.', 'Salt this water properly. It is the only chance to season the pasta itself, and the starch in it is what holds the sauce together.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 8, 'Take the pan off the heat and wait 30 seconds. Add the pasta and a 60 ml splash of pasta water, then the 70 g parmesan in three handfuls, tossing continuously between each.', 'This is the step that makes or breaks Alfredo. Above a simmer the cheese seizes into strings and the sauce breaks into oil and grit. Off the heat, cheese in stages, keep it moving.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 9, 'Toss hard for a full minute, loosening with more pasta water until the sauce is glossy and clings to every ribbon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 10, 'Slice the rested chicken across the grain and fold it in with any juices from the board.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 11, 'Taste. It will want far more black pepper than you expect. Add salt only after tasting — the parmesan brings a lot of its own.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (283, 12, 'Plate immediately and finish with chopped parsley and cracked black pepper.', 'Alfredo tightens as it cools and does not come back. This dish waits for nobody — have everyone at the table before step 9.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 1, 'Make the fresh pasta according to the linked recipe and cut it to fettuccine. You need 282 g.', 'Wide ribbons are the point — Alfredo needs surface area for the sauce to cling to.', 36, 'Use 282 g fresh egg pasta from the pack (almost a full 300 g pack).');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 2, 'Grate 85 g parmesan finely from a block and let it come to room temperature.', 'Do not use pre-grated parmesan. It is dusted with anti-caking starch and will never emulsify — it just goes gritty.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 3, 'Pat the 280 g chicken breast completely dry, season, and rest at room temperature for 10 minutes.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 4, 'Render 40 g diced pancetta in a cold heavy pan over medium heat, 5-6 minutes, until crisp and it has given up its fat. Lift the pancetta out and set aside, leaving the fat behind.', 'Starting pancetta in a cold pan renders the fat gently instead of scorching the outside.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 5, 'Sear the chicken in the pancetta fat over medium-high, 4-5 minutes a side, to 74 C internal. Rest on a board for 5 minutes. Keep the pan.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 6, 'Drop the pan to medium-low. Melt 3 tbsp unsalted butter, add 2 grated garlic cloves and cook 30-45 seconds until fragrant.', 'The garlic must not colour — browned garlic turns the whole sauce acrid.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 7, 'Pour in 150 ml double cream and bring to a bare simmer. Reduce for 3-4 minutes, until it is down by about a quarter and coats the back of a spoon. Grate in a pinch of nutmeg.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 8, 'Cook the pasta in heavily salted boiling water for 2-3 minutes, until it floats and is just tender. Reserve 250 ml of the cooking water, then drain.', 'Salt this water properly. It is the only chance to season the pasta itself, and the starch in it is what holds the sauce together.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 9, 'Take the pan off the heat and wait 30 seconds. Add the pasta and a 60 ml splash of pasta water, then the 85 g parmesan in three handfuls, tossing continuously between each.', 'This is the step that makes or breaks Alfredo. Above a simmer the cheese seizes into strings and the sauce breaks into oil and grit. Off the heat, cheese in stages, keep it moving.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 10, 'Toss hard for a full minute, loosening with more pasta water until the sauce is glossy and clings to every ribbon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 11, 'Slice the rested chicken across the grain and fold it in with any juices from the board. Scatter the crisped pancetta over.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 12, 'Taste. It will want far more black pepper than you expect. Add salt only after tasting — the parmesan brings a lot of its own.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (284, 13, 'Plate immediately and finish with chopped parsley and cracked black pepper.', 'Alfredo tightens as it cools and does not come back. This dish waits for nobody — have everyone at the table before step 9.', NULL, NULL);

-- Extras hierarchy
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT p.id, 36, 1 FROM (SELECT 282 AS id UNION SELECT 283 UNION SELECT 284) p
WHERE NOT EXISTS (SELECT 1 FROM recipe_extras e WHERE e.parent_recipe_id = p.id AND e.child_recipe_id = 36);

-- Family + members (Moderate is the default)
INSERT INTO recipe_families (id, family_name, description)
SELECT 116, 'Chicken Alfredo', 'Cheat meal. Seared chicken and fresh fettuccine in a butter, cream and parmesan emulsion.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 116);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 116, 282, 0, 'Light', 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 116 AND recipe_id = 282);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 116, 283, 1, 'Moderate', 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 116 AND recipe_id = 283);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 116, 284, 0, 'Balanced', 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 116 AND recipe_id = 284);

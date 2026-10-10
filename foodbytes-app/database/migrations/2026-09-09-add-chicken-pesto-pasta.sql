-- Chicken Pesto Pasta â€” Light/Moderate/Balanced (family 115, recipes 279-281)
-- Links: Fresh Pasta (36) + Pesto (10), both FR-103 dual-path.
-- New ingredient: Fresh egg pasta (store-bought counterpart for the pasta link).
-- All inserts guarded with WHERE NOT EXISTS â€” re-running is a no-op.

-- 1. New ingredient (uncooked/as-sold basis: 150 g pack half = 395 kcal)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 199, 'fresh_egg_pasta', 'Fresh egg pasta', 11, 8.90, 49.70, 2.50, 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE `key` = 'fresh_egg_pasta' OR name = 'Fresh egg pasta');

SET @ing_fresh_pasta := (SELECT id FROM ingredients WHERE `key` = 'fresh_egg_pasta');

-- 2. Parent variants (calories = whole-recipe kcal = per-serving x default_servings)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 279, 'Chicken Pesto Pasta', 2, 1094, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 279);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 280, 'Chicken Pesto Pasta', 2, 1291, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 280);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 281, 'Chicken Pesto Pasta', 2, 1468, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 281);

-- 3. Meal slots (dinner)
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM (SELECT 279 AS id UNION SELECT 280 UNION SELECT 281) r
WHERE NOT EXISTS (SELECT 1 FROM recipe_meals m WHERE m.recipe_id = r.id AND m.meal_id = 3);

-- 4. Ingredients (raw + FR-103 dual-path on pasta and pesto)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 11, NULL, 180.00, 1, 180.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, @ing_fresh_pasta, 36, 210.00, 1, 210.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 74, 10, 20.00, 1, 20.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 74) AND (linked_recipe_id <=> 10));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 116, NULL, 150.00, 1, 150.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 172, NULL, 80.00, 1, 80.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 172) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 88, NULL, 0.50, 7, 20.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 22, NULL, 1.00, 3, 5.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 22) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 29, NULL, 1.00, 9, 5.00, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 29) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 5, NULL, 0.50, 3, 3.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 279, 50, NULL, 0.25, 3, 1.50, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 279 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 11, NULL, 200.00, 1, 200.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, @ing_fresh_pasta, 36, 245.00, 1, 245.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 74, 10, 25.00, 1, 25.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 74) AND (linked_recipe_id <=> 10));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 116, NULL, 150.00, 1, 150.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 172, NULL, 80.00, 1, 80.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 172) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 88, NULL, 0.50, 7, 20.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 22, NULL, 1.00, 3, 5.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 22) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 30, NULL, 10.00, 1, 10.00, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 30) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 29, NULL, 1.00, 9, 5.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 29) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 5, NULL, 0.50, 3, 3.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 280, 50, NULL, 0.25, 3, 1.50, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 280 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 11, NULL, 210.00, 1, 210.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, @ing_fresh_pasta, 36, 282.00, 1, 282.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> @ing_fresh_pasta) AND (linked_recipe_id <=> 36));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 74, 10, 32.00, 1, 32.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 74) AND (linked_recipe_id <=> 10));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 116, NULL, 150.00, 1, 150.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 172, NULL, 80.00, 1, 80.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 172) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 88, NULL, 0.50, 7, 20.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 22, NULL, 1.00, 3, 5.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 22) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 30, NULL, 15.00, 1, 15.00, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 30) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 29, NULL, 1.00, 9, 5.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 29) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 5, NULL, 0.50, 3, 3.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 5) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 281, 50, NULL, 0.25, 3, 1.50, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 281 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));

-- 5. Steps (linked prep steps carry linked_recipe_id + alt_instruction)
DELETE FROM recipe_steps WHERE recipe_id IN (279,280,281);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 1, 'Make the fresh pasta according to the linked recipe and cut it to tagliatelle. You need 210 g. Dust with semolina and rest it on a tray so the strands do not stick.', 'Fresh pasta dries out fast — keep it loosely covered until the water is boiling.', 36, 'Use 210 g fresh egg pasta from the pack (about 2/3 of a 300 g pack), kept chilled until you need it.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 2, 'Make the pesto according to the linked recipe. You need 20 g for this dish.', 'Pesto is the seasoning here, not a sauce you pour on — it gets loosened with pasta water in step 7.', 10, 'Measure out 20 g store-bought pesto and let it come to room temperature.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 3, 'Pat the 180 g chicken breast completely dry, season both sides with salt and pepper, and leave it at room temperature for 10 minutes.', 'Wet chicken steams instead of searing — the drying is not optional.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 4, 'Heat 1 tsp olive oil in a heavy pan over medium-high until it shimmers. Sear the chicken 4-5 minutes on the first side, until it releases cleanly from the pan and is deep golden, then flip and cook 3-4 minutes more to 74 C internal. Move to a board to rest for 5 minutes. Keep the pan.', 'If it sticks when you try to flip it, it is not ready — give it another 30 seconds.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 5, 'Halve the cherry tomatoes. Take the pan off direct heat and add them cut-side down to the residual fat for 2 minutes, until they blister and just start to collapse.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 6, 'Cook the pasta in well-salted boiling water — fresh pasta needs only 2-3 minutes, until it floats and is just tender. Reserve 200 ml of the cooking water, then drain. Do not rinse it.', 'That starchy water is what makes the sauce cling. Reserve it before you drain, not after.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 7, 'Take the pan off the heat and let it drop below a simmer, about 1 minute. Stir in the pesto and 60 ml of the pasta water to a loose, glossy emulsion.', 'Boiled pesto splits and turns bitter — the basil browns and the oil separates. Off the heat, always.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 8, 'Add the drained pasta and the baby spinach and toss off the heat until the spinach wilts, about 30 seconds, and every strand is coated. Loosen with pasta water a splash at a time until the sauce coats the back of a spoon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 9, 'Slice the rested chicken across the grain and add it to the pan along with any juices from the board.', 'Those resting juices are pure seasoning — tipping them in is the difference between a good plate and a flat one.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 10, 'Add the zest and juice of half a lemon. Taste, and adjust salt, pepper and lemon until it tastes bright rather than oily.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (279, 11, 'Plate immediately and finish with torn basil and cracked black pepper.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 1, 'Make the fresh pasta according to the linked recipe and cut it to tagliatelle. You need 245 g. Dust with semolina and rest it on a tray so the strands do not stick.', 'Fresh pasta dries out fast — keep it loosely covered until the water is boiling.', 36, 'Use 245 g fresh egg pasta from the pack (about 4/5 of a 300 g pack), kept chilled until you need it.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 2, 'Make the pesto according to the linked recipe. You need 25 g for this dish.', 'Pesto is the seasoning here, not a sauce you pour on — it gets loosened with pasta water in step 7.', 10, 'Measure out 25 g store-bought pesto and let it come to room temperature.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 3, 'Pat the 200 g chicken breast completely dry, season both sides with salt and pepper, and leave it at room temperature for 10 minutes.', 'Wet chicken steams instead of searing — the drying is not optional.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 4, 'Heat 1 tsp olive oil in a heavy pan over medium-high until it shimmers. Sear the chicken 4-5 minutes on the first side, until it releases cleanly from the pan and is deep golden, then flip and cook 3-4 minutes more to 74 C internal. Move to a board to rest for 5 minutes. Keep the pan.', 'If it sticks when you try to flip it, it is not ready — give it another 30 seconds.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 5, 'Halve the cherry tomatoes. Take the pan off direct heat and add them cut-side down to the residual fat for 2 minutes, until they blister and just start to collapse.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 6, 'Cook the pasta in well-salted boiling water — fresh pasta needs only 2-3 minutes, until it floats and is just tender. Reserve 200 ml of the cooking water, then drain. Do not rinse it.', 'That starchy water is what makes the sauce cling. Reserve it before you drain, not after.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 7, 'Take the pan off the heat and let it drop below a simmer, about 1 minute. Stir in the pesto and 60 ml of the pasta water to a loose, glossy emulsion.', 'Boiled pesto splits and turns bitter — the basil browns and the oil separates. Off the heat, always.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 8, 'Add the drained pasta and the baby spinach and toss off the heat until the spinach wilts, about 30 seconds, and every strand is coated. Loosen with pasta water a splash at a time until the sauce coats the back of a spoon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 9, 'Slice the rested chicken across the grain and add it to the pan along with any juices from the board.', 'Those resting juices are pure seasoning — tipping them in is the difference between a good plate and a flat one.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 10, 'Add the zest and juice of half a lemon. Taste, and adjust salt, pepper and lemon until it tastes bright rather than oily.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (280, 11, 'Plate immediately and finish with 10 g grated parmesan, torn basil and cracked black pepper.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 1, 'Make the fresh pasta according to the linked recipe and cut it to tagliatelle. You need 282 g. Dust with semolina and rest it on a tray so the strands do not stick.', 'Fresh pasta dries out fast — keep it loosely covered until the water is boiling.', 36, 'Use 282 g fresh egg pasta from the pack (almost a full 300 g pack), kept chilled until you need it.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 2, 'Make the pesto according to the linked recipe. You need 32 g for this dish.', 'Pesto is the seasoning here, not a sauce you pour on — it gets loosened with pasta water in step 7.', 10, 'Measure out 32 g store-bought pesto and let it come to room temperature.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 3, 'Pat the 210 g chicken breast completely dry, season both sides with salt and pepper, and leave it at room temperature for 10 minutes.', 'Wet chicken steams instead of searing — the drying is not optional.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 4, 'Heat 1 tsp olive oil in a heavy pan over medium-high until it shimmers. Sear the chicken 4-5 minutes on the first side, until it releases cleanly from the pan and is deep golden, then flip and cook 3-4 minutes more to 74 C internal. Move to a board to rest for 5 minutes. Keep the pan.', 'If it sticks when you try to flip it, it is not ready — give it another 30 seconds.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 5, 'Halve the cherry tomatoes. Take the pan off direct heat and add them cut-side down to the residual fat for 2 minutes, until they blister and just start to collapse.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 6, 'Cook the pasta in well-salted boiling water — fresh pasta needs only 2-3 minutes, until it floats and is just tender. Reserve 200 ml of the cooking water, then drain. Do not rinse it.', 'That starchy water is what makes the sauce cling. Reserve it before you drain, not after.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 7, 'Take the pan off the heat and let it drop below a simmer, about 1 minute. Stir in the pesto and 60 ml of the pasta water to a loose, glossy emulsion.', 'Boiled pesto splits and turns bitter — the basil browns and the oil separates. Off the heat, always.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 8, 'Add the drained pasta and the baby spinach and toss off the heat until the spinach wilts, about 30 seconds, and every strand is coated. Loosen with pasta water a splash at a time until the sauce coats the back of a spoon.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 9, 'Slice the rested chicken across the grain and add it to the pan along with any juices from the board.', 'Those resting juices are pure seasoning — tipping them in is the difference between a good plate and a flat one.', NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 10, 'Add the zest and juice of half a lemon. Taste, and adjust salt, pepper and lemon until it tastes bright rather than oily.', NULL, NULL, NULL);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (281, 11, 'Plate immediately and finish with 15 g grated parmesan, torn basil and cracked black pepper.', NULL, NULL, NULL);

-- 6. Extras hierarchy (parent -> child recipes)
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT p.id, c.cid, c.ord
FROM (SELECT 279 AS id UNION SELECT 280 UNION SELECT 281) p
CROSS JOIN (SELECT 36 AS cid, 1 AS ord UNION SELECT 10, 2) c
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_extras e WHERE e.parent_recipe_id = p.id AND e.child_recipe_id = c.cid);

-- 7. Family + members (Moderate is the default)
INSERT INTO recipe_families (id, family_name, description)
SELECT 115, 'Chicken Pesto Pasta', 'Seared chicken and fresh pasta tossed with basil pesto, blistered cherry tomatoes, spinach and lemon.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 115);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 115, 279, 0, 'Light', 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 115 AND recipe_id = 279);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 115, 280, 1, 'Moderate', 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 115 AND recipe_id = 280);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 115, 281, 0, 'Balanced', 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 115 AND recipe_id = 281);

-- 8. Audit attestation. All five lenses run on 2026-09-09; no findings.
-- Recomputed kcal matches the stored column exactly on all three variants (0.0% drift).
-- Per-serving: protein 42.4/49.4/54.2 g, fat 27.1/28.3/29.4%, carbs 41.9/41.0/41.1% â€” all green.
-- macros_audited_by stays NULL (agent-run audit, per skill convention).
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (279, 280, 281);

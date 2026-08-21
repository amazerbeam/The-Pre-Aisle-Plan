-- =====================================================================
-- 2026-08-21  Add Chicken Chow Fun
--
--   Family 112  Chicken Chow Fun  (recipes 270/271/272)
--               Rice noodle stir-fry: chicken, sweetcorn, bean sprouts,
--               egg scrambled off-heat then folded in wet, red pepper,
--               soy/oyster/dark-soy sauce, lime, sesame oil. Balanced
--               adds a roasted-peanut garnish.
--
-- One new ingredient: 198 Sweetcorn (dedup-checked case-insensitively,
-- incl. singular/plural/synonyms -- no 'corn'/'sweetcorn'/'sweet corn'
-- row existed; 'Cornflour' (27) is unrelated).
--
-- No fish sauce anywhere (anchovy-derived, avoided for gout). Savoury
-- depth comes from soy sauce, dark soy sauce and oyster sauce.
--
-- No sub-components (bread/dough/sauce-as-recipe) -- nothing to link,
-- linked-recipe-extras.md does not apply to this recipe.
--
-- Every insert is guarded with WHERE NOT EXISTS. Re-running this whole
-- file is a no-op. recipe_steps use wipe-and-re-insert (the unique key
-- on (recipe_id, step_number) makes UPDATE-based renumbering collide).
--
-- IDs verified against live DB 2026-08-21:
--   MAX(recipes.id)=269  MAX(recipe_families.id)=111  MAX(ingredients.id)=197
--
-- Macro design (per skill self-review, whole-recipe / per-serving, serves 2):
--   Light     1088 kcal /  544/srv   P48.3g C52.5g F15.6g  fat 25.9% carbs 38.6%
--   Moderate  1280 kcal /  640/srv   P52.0g C66.2g F18.6g  fat 26.2% carbs 41.3%
--   Balanced  1575 kcal /  788/srv   P64.8g C76.3g F24.8g  fat 28.4% carbs 38.7%
-- All pass: protein >=35g, fat 25-35%, carbs >=38% (design target 40-50%),
-- kcal ordering Light<Moderate<Balanced with >80kcal gaps.
-- macros_audited left at 0 (design-time calc only, not a formal audit pass).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. NEW INGREDIENT (198)
--    Dedup-checked case-insensitively incl. singular/plural and synonyms:
--    no 'sweetcorn'/'sweet corn'/'corn' row exists. Cornflour (27) is a
--    different item and is NOT a duplicate of this.
-- ---------------------------------------------------------------------

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 198, 'sweetcorn', 'Sweetcorn', 10, 2.90, 18.70, 1.00, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 198 OR `key` = 'sweetcorn' OR LOWER(name) = 'sweetcorn');


-- =====================================================================
-- 2. FAMILY 112 — CHICKEN CHOW FUN
-- =====================================================================

-- 2a. Recipes. calories = whole-recipe kcal (per-serving x default_servings).
--     Light 544.0/srv (1088), Moderate 640.0/srv (1280), Balanced 787.7/srv (1575).

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 270, 'Chicken Chow Fun', 2, 1088, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 270);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 271, 'Chicken Chow Fun', 2, 1280, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 271);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 272, 'Chicken Chow Fun', 2, 1575, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 272);

-- 2b. Meal slots (3 = dinner)
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 270, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 270 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 271, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 271 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 272, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 272 AND meal_id = 3);


-- ---------------------------------------------------------------------
-- 2c. Ingredients — LIGHT (270)
--     P 96.51  C 105.13  F 31.26  = 1088 kcal whole / 544 per serving
-- ---------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 11, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 137, NULL, 70.00, 1, 70.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 59, NULL, 2.00, 8, 112.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 138, NULL, 180.00, 1, 180.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 198, NULL, 90.00, 1, 90.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>198) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 42, NULL, 70.00, 1, 70.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 128, NULL, 2.00, 5, 20.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 13, NULL, 2.00, 10, 8.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 14, NULL, 1.50, 3, 8.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 129, NULL, 2.00, 3, 9.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 148, NULL, 12.00, 2, 12.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 25, NULL, 12.00, 2, 12.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 147, NULL, 12.00, 2, 12.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>147) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 40, NULL, 5.00, 2, 5.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 36, NULL, 1.00, 3, 4.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 270, 151, NULL, 1.00, 17, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=270 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));

-- ---------------------------------------------------------------------
-- 2d. Ingredients — MODERATE (271)
--     P 103.98  C 132.35  F 37.18  = 1280 kcal whole / 640 per serving
-- ---------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 11, NULL, 240.00, 1, 240.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 137, NULL, 100.00, 1, 100.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 59, NULL, 2.00, 8, 112.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 138, NULL, 160.00, 1, 160.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 198, NULL, 100.00, 1, 100.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>198) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 42, NULL, 60.00, 1, 60.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 128, NULL, 2.00, 5, 20.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 13, NULL, 3.00, 10, 12.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 14, NULL, 1.50, 3, 8.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 129, NULL, 3.00, 3, 14.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 148, NULL, 15.00, 2, 15.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 25, NULL, 15.00, 2, 15.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 147, NULL, 15.00, 2, 15.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>147) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 40, NULL, 5.00, 2, 5.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 36, NULL, 1.00, 3, 4.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 271, 151, NULL, 1.00, 17, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=271 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));

-- ---------------------------------------------------------------------
-- 2e. Ingredients — BALANCED (272)
--     P 129.55  C 152.60  F 49.64  = 1575 kcal whole / 787.7 per serving
-- ---------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 11, NULL, 300.00, 1, 300.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 137, NULL, 110.00, 1, 110.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 59, NULL, 2.00, 8, 112.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 138, NULL, 160.00, 1, 160.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 198, NULL, 140.00, 1, 140.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>198) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 42, NULL, 70.00, 1, 70.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 128, NULL, 2.00, 5, 20.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 13, NULL, 3.00, 10, 12.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 14, NULL, 2.00, 3, 10.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 129, NULL, 3.00, 3, 14.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 148, NULL, 16.00, 2, 16.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 25, NULL, 16.00, 2, 16.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 147, NULL, 16.00, 2, 16.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>147) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 40, NULL, 5.00, 2, 5.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 36, NULL, 1.00, 3, 4.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 151, NULL, 1.00, 17, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 272, 140, NULL, 20.00, 1, 20.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=272 AND (ingredient_id<=>140) AND (linked_recipe_id<=>NULL));


-- ---------------------------------------------------------------------
-- 2f. Steps — LIGHT (270) & MODERATE (271) share the same 8 steps.
--     Wipe-and-re-insert (idempotent on retry).
-- ---------------------------------------------------------------------
DELETE FROM recipe_steps WHERE recipe_id IN (270, 271);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
VALUES
(270, 1, 'Soak or cook the rice noodles according to the packet instructions until just pliable. Drain and set aside.', NULL, NULL),
(270, 2, 'Whisk the soy sauce, dark soy sauce, oyster sauce, sugar, lime juice and white pepper together in a small bowl to make the sauce.', NULL, NULL),
(270, 3, 'Pat the chicken dry and slice into thin strips. Sear in half the sesame oil over high heat until cooked through and lightly caramelized, about 4-5 minutes. Remove and rest.', NULL, NULL),
(270, 4, 'Add the remaining sesame oil to the pan and saute the garlic and ginger for about 30 seconds until fragrant - don''t let them catch or burn.', NULL, NULL),
(270, 5, 'Add the red pepper and stir-fry for 1-2 minutes, then add the noodles and sweetcorn. Pour over the sauce and toss to coat, cooking for 2-3 minutes until the noodles are heated through with lightly charred edges.', NULL, NULL),
(270, 6, 'Take the pan off the heat entirely. Push everything to one side, crack the eggs into the empty space, and let sit undisturbed for 5-10 seconds until the edges just set but the middle is still glossy and wet. Scramble lightly - don''t cook it dry.', NULL, NULL),
(270, 7, 'While the egg is still wet, immediately fold in the bean sprouts, rested chicken and half the spring onions, tossing off the heat so the egg coats everything in silky ribbons and the sprouts stay crisp.', NULL, NULL),
(270, 8, 'Taste and adjust the seasoning with a little extra soy sauce if needed. Plate and garnish with the remaining spring onion.', NULL, NULL),

(271, 1, 'Soak or cook the rice noodles according to the packet instructions until just pliable. Drain and set aside.', NULL, NULL),
(271, 2, 'Whisk the soy sauce, dark soy sauce, oyster sauce, sugar, lime juice and white pepper together in a small bowl to make the sauce.', NULL, NULL),
(271, 3, 'Pat the chicken dry and slice into thin strips. Sear in half the sesame oil over high heat until cooked through and lightly caramelized, about 4-5 minutes. Remove and rest.', NULL, NULL),
(271, 4, 'Add the remaining sesame oil to the pan and saute the garlic and ginger for about 30 seconds until fragrant - don''t let them catch or burn.', NULL, NULL),
(271, 5, 'Add the red pepper and stir-fry for 1-2 minutes, then add the noodles and sweetcorn. Pour over the sauce and toss to coat, cooking for 2-3 minutes until the noodles are heated through with lightly charred edges.', NULL, NULL),
(271, 6, 'Take the pan off the heat entirely. Push everything to one side, crack the eggs into the empty space, and let sit undisturbed for 5-10 seconds until the edges just set but the middle is still glossy and wet. Scramble lightly - don''t cook it dry.', NULL, NULL),
(271, 7, 'While the egg is still wet, immediately fold in the bean sprouts, rested chicken and half the spring onions, tossing off the heat so the egg coats everything in silky ribbons and the sprouts stay crisp.', NULL, NULL),
(271, 8, 'Taste and adjust the seasoning with a little extra soy sauce if needed. Plate and garnish with the remaining spring onion.', NULL, NULL);

-- ---------------------------------------------------------------------
-- 2g. Steps — BALANCED (272): same 8 steps, step 8 adds the peanut garnish.
-- ---------------------------------------------------------------------
DELETE FROM recipe_steps WHERE recipe_id = 272;

INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
VALUES
(272, 1, 'Soak or cook the rice noodles according to the packet instructions until just pliable. Drain and set aside.', NULL, NULL),
(272, 2, 'Whisk the soy sauce, dark soy sauce, oyster sauce, sugar, lime juice and white pepper together in a small bowl to make the sauce.', NULL, NULL),
(272, 3, 'Pat the chicken dry and slice into thin strips. Sear in half the sesame oil over high heat until cooked through and lightly caramelized, about 4-5 minutes. Remove and rest.', NULL, NULL),
(272, 4, 'Add the remaining sesame oil to the pan and saute the garlic and ginger for about 30 seconds until fragrant - don''t let them catch or burn.', NULL, NULL),
(272, 5, 'Add the red pepper and stir-fry for 1-2 minutes, then add the noodles and sweetcorn. Pour over the sauce and toss to coat, cooking for 2-3 minutes until the noodles are heated through with lightly charred edges.', NULL, NULL),
(272, 6, 'Take the pan off the heat entirely. Push everything to one side, crack the eggs into the empty space, and let sit undisturbed for 5-10 seconds until the edges just set but the middle is still glossy and wet. Scramble lightly - don''t cook it dry.', NULL, NULL),
(272, 7, 'While the egg is still wet, immediately fold in the bean sprouts, rested chicken and half the spring onions, tossing off the heat so the egg coats everything in silky ribbons and the sprouts stay crisp.', NULL, NULL),
(272, 8, 'Taste and adjust the seasoning with a little extra soy sauce if needed. Scatter the crushed roasted peanuts over the top, plate, and garnish with the remaining spring onion.', NULL, NULL);


-- =====================================================================
-- 3. RECIPE FAMILY
-- =====================================================================

INSERT INTO recipe_families (id, family_name)
SELECT 112, 'Chicken Chow Fun'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 112);

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 112, 270, 'Light', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 112 AND recipe_id = 270);

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 112, 271, 'Moderate', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 112 AND recipe_id = 271);

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 112, 272, 'Balanced', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 112 AND recipe_id = 272);

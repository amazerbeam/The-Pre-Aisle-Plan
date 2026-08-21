-- =====================================================================
-- 2026-08-12  Add two stir-fry families
--
--   Family 109  Chicken, Broccoli & Cashew Stir Fry   (recipes 259/260/261)
--               Easy midweek. No new ingredients, no sub-recipes.
--
--   Family 110  Thai Red Curry Chicken Stir Fry       (recipes 263/264/265)
--               Weekend build. Links sub-recipe 262 (Thai Red Curry Paste)
--               with an FR-103 store-bought fallback on the same row.
--
-- Fish sauce is deliberately absent from both — anchovy-derived, avoided
-- for gout. Replaced with light soy sauce (~1.2x weight, soy is ~18% salt
-- vs fish sauce's ~25%) plus MSG for the glutamate.
--
-- Every insert is guarded with WHERE NOT EXISTS. Re-running this whole
-- file is a no-op. recipe_steps use wipe-and-re-insert (the unique key
-- on (recipe_id, step_number) makes UPDATE-based renumbering collide).
--
-- IDs verified against live DB 2026-08-12:
--   MAX(recipes.id)=258  MAX(recipe_families.id)=108  MAX(ingredients.id)=187
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. NEW INGREDIENTS (188-195) — Thai curry only.
--    Dedup-checked case-insensitively incl. singular/plural: no matches.
-- ---------------------------------------------------------------------

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 188, 'dried_red_chilli', 'Dried red chilli', 8, 12.00, 30.00, 17.00, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 188 OR `key` = 'dried_red_chilli' OR LOWER(name) = 'dried red chilli');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 189, 'lemongrass', 'Lemongrass', 3, 1.80, 25.30, 0.50, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 189 OR `key` = 'lemongrass' OR LOWER(name) = 'lemongrass');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 190, 'galangal', 'Galangal', 3, 1.00, 15.00, 0.80, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 190 OR `key` = 'galangal' OR LOWER(name) = 'galangal');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 191, 'shrimp_paste', 'Shrimp paste', 12, 20.00, 3.00, 1.50, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 191 OR `key` = 'shrimp_paste' OR LOWER(name) = 'shrimp paste');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 192, 'coriander_seeds', 'Coriander seeds', 8, 12.40, 55.00, 17.80, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 192 OR `key` = 'coriander_seeds' OR LOWER(name) = 'coriander seeds');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 193, 'kaffir_lime_leaf', 'Kaffir lime leaf', 8, 1.00, 10.00, 1.00, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 193 OR `key` = 'kaffir_lime_leaf' OR LOWER(name) = 'kaffir lime leaf');

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 194, 'bamboo_shoots', 'Bamboo shoots', 10, 1.50, 3.20, 0.20, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 194 OR `key` = 'bamboo_shoots' OR LOWER(name) = 'bamboo shoots');

-- Store-bought counterpart for the FR-103 dual path on the paste row.
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 195, 'thai_red_curry_paste', 'Thai red curry paste', 12, 3.00, 17.00, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 195 OR `key` = 'thai_red_curry_paste' OR LOWER(name) = 'thai red curry paste');


-- =====================================================================
-- 2. FAMILY 109 — CHICKEN, BROCCOLI & CASHEW STIR FRY
-- =====================================================================

-- 2a. Recipes. calories = whole-recipe kcal (per-serving x default_servings).
--     Light 540.3/srv, Moderate 628.3/srv, Balanced 788.6/srv.

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 259, 'Chicken, Broccoli & Cashew Stir Fry', 2, 1081, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 259);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 260, 'Chicken, Broccoli & Cashew Stir Fry', 2, 1257, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 260);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 261, 'Chicken, Broccoli & Cashew Stir Fry', 2, 1577, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 261);

-- 2b. Meal slots
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 259, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 259 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 260, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 260 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 261, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 261 AND meal_id = 3);

-- 2c. Ingredients — LIGHT (259)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 11, NULL, 210.00, 1, 210.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 27, NULL, 2.00, 4, 16.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>27) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 183, NULL, 2.00, 3, 10.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 129, NULL, 1.00, 3, 5.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 51, NULL, 220.00, 1, 220.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 42, NULL, 1.00, 8, 160.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 56, NULL, 2.00, 7, 100.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>56) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 128, NULL, 4.00, 5, 40.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 13, NULL, 3.00, 10, 12.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 14, NULL, 2.00, 3, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 25, NULL, 30.00, 2, 30.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 148, NULL, 1.50, 3, 8.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 4, NULL, 1.50, 3, 10.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>4) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 159, NULL, 2.00, 3, 10.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>159) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 24, NULL, 110.00, 2, 110.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 60, NULL, 16.00, 1, 16.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>60) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 165, NULL, 0.25, 3, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 21, NULL, 1.00, 17, 0.50, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 259, 26, NULL, 50.00, 1, 50.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=259 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 2d. Ingredients — MODERATE (260)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 11, NULL, 210.00, 1, 210.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 27, NULL, 2.00, 4, 16.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>27) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 183, NULL, 1.00, 4, 12.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 129, NULL, 1.00, 3, 5.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 51, NULL, 200.00, 1, 200.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 42, NULL, 1.00, 8, 150.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 56, NULL, 2.00, 7, 100.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>56) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 128, NULL, 4.00, 5, 40.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 13, NULL, 3.00, 10, 12.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 14, NULL, 2.00, 3, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 25, NULL, 30.00, 2, 30.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 148, NULL, 1.50, 3, 8.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 4, NULL, 2.00, 3, 14.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>4) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 159, NULL, 2.00, 3, 10.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>159) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 24, NULL, 100.00, 2, 100.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 60, NULL, 22.00, 1, 22.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>60) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 165, NULL, 0.25, 3, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 21, NULL, 1.00, 17, 0.50, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 260, 26, NULL, 85.00, 1, 85.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=260 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 2e. Ingredients — BALANCED (261)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 11, NULL, 260.00, 1, 260.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 27, NULL, 2.00, 4, 16.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>27) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 183, NULL, 1.00, 4, 14.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 129, NULL, 1.00, 3, 6.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 51, NULL, 200.00, 1, 200.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 42, NULL, 1.00, 8, 150.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 56, NULL, 2.00, 7, 100.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>56) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 128, NULL, 4.00, 5, 40.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 13, NULL, 3.00, 10, 12.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 14, NULL, 2.00, 3, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 25, NULL, 32.00, 2, 32.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 148, NULL, 1.50, 3, 8.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>148) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 4, NULL, 2.00, 3, 14.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>4) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 159, NULL, 2.00, 3, 10.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>159) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 24, NULL, 100.00, 2, 100.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 60, NULL, 35.00, 1, 35.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>60) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 165, NULL, 0.25, 3, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 21, NULL, 1.00, 17, 0.50, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 261, 26, NULL, 125.00, 1, 125.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=261 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 2f. Steps (wipe-and-re-insert; identical across variants — quantities live on the ingredient rows)
DELETE FROM recipe_steps WHERE recipe_id IN (259, 260, 261);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(259, 1, 'Rinse the rice until the water runs clear, then cook it with 1.5x its weight in water: lid on, 10 min on low, then 10 min off the heat without lifting the lid. Start this first so it steams while you cook everything else.', 'Rinsing washes off surface starch and is the difference between separate grains and a sticky clump.'),
(259, 2, 'Toss the sliced chicken with half the cornflour and 1 tbsp of the soy sauce until every piece is slicked. Leave it while you prep the rest.', 'This is velveting. Thirty seconds of work, and it is the single biggest difference between home stir-fry and takeaway texture.'),
(259, 3, 'Mix the sauce in a mug: the remaining soy sauce, dark soy, honey, rice vinegar, chicken stock, MSG, chilli flakes and the remaining cornflour. Stir until no lumps remain and set it beside the hob.', NULL),
(259, 4, 'Chop the broccoli into small florets, the pepper into thick strips, and the carrot into steep diagonal slices. Cut the spring onions into 3 cm lengths. Slice the garlic and matchstick the ginger, keeping those two in a separate pile.', 'Everything must be chopped before the pan goes on — a stir-fry gives you no time to catch up once it starts.'),
(259, 5, 'Heat your largest pan or a wok over high heat until a drop of water skitters across the surface. Add the coconut oil, then the chicken in a single layer. Leave it undisturbed for 2 min, then toss until just opaque, about 1 min more. Tip it onto a plate, juices and all.', 'Crowding the pan makes the chicken steam. Cook it in two batches if it will not fit in one layer.'),
(259, 6, 'Same pan, still on high. Add the broccoli and carrot with 2 tbsp of water and cover for 2 min so the hard vegetables steam through. Lid off, add the pepper, and toss for 1 min.', NULL),
(259, 7, 'Push the vegetables to one side, add the garlic and ginger to the bare patch, and stir for 30 seconds until fragrant but not browned, then fold them through.', 'Burnt garlic turns the whole pan bitter and there is no fixing it. Thirty seconds, no more.'),
(259, 8, 'Stir the sauce again — the cornflour settles fast — and pour it in. It thickens in under a minute. The moment it coats the vegetables and leaves a clear trail behind the spoon, it is done.', NULL),
(259, 9, 'Return the chicken and any juices from the plate, add the cashews and spring onions, and toss for 30 seconds to heat through.', 'Those plate juices are concentrated chicken flavour. Tipping them down the sink is throwing away the best part of the sauce.'),
(259, 10, 'Taste before it leaves the pan. Needs lift? A splash of rice vinegar. Tastes flat? A little more soy. Serve over the rice with the sauce spooned across.', NULL),
(259, 11, 'Drizzle the sesame oil over the finished plates.', 'Sesame oil is a finishing oil, not a cooking oil — its flavour breaks down over high heat. Always off the heat, always last.');

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip)
SELECT 260, step_number, instruction, tip FROM recipe_steps WHERE recipe_id = 259;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip)
SELECT 261, step_number, instruction, tip FROM recipe_steps WHERE recipe_id = 259;

-- 2g. Family 109
INSERT INTO recipe_families (id, family_name, description)
SELECT 109, 'Chicken, Broccoli & Cashew Stir Fry', 'Fast midweek Chinese-style stir fry. Velveted chicken, a big load of vegetables, and a soy-garlic-ginger sauce that thickens in the pan. Everything from Tesco; 25 minutes start to finish.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 109);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 109, 259, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 259);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 109, 260, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 260);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 109, 261, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 261);


-- =====================================================================
-- 3. SUB-RECIPE 262 — THAI RED CURRY PASTE
--    Yield 180 g. 246 kcal total. ~4 uses.
-- =====================================================================

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 262, 'Thai Red Curry Paste', 4, 246, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 262);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 262, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 262 AND meal_id = 5);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 188, NULL, 10.00, 5, 25.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>188) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 139, NULL, 2.00, 7, 50.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>139) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 13, NULL, 6.00, 10, 24.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 189, NULL, 2.00, 12, 30.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>189) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 190, NULL, 3.00, 13, 15.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>190) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 80, NULL, 1.00, 9, 15.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>80) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 191, NULL, 1.50, 3, 8.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>191) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 192, NULL, 1.50, 3, 4.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>192) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 18, NULL, 0.50, 3, 2.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>18) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 151, NULL, 0.25, 3, 1.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 193, NULL, 2.00, 14, 2.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>193) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 262, 5, NULL, 0.75, 3, 4.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=262 AND (ingredient_id<=>5) AND (linked_recipe_id<=>NULL));

DELETE FROM recipe_steps WHERE recipe_id = 262;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(262, 1, 'Snip the dried chillies open, shake out and discard the seeds, then cover with boiling water and soak for 20 min until fully soft. Drain and squeeze dry.', 'The seeds carry raw heat without flavour. Removing them is what lets you use ten chillies and still taste the dish.'),
(262, 2, 'Wrap the shrimp paste in a scrap of foil and toast it in a dry pan for 2 min per side.', 'It smells aggressive raw and mellows completely once toasted. Do not skip this — untoasted, it dominates the paste.'),
(262, 3, 'Toast the coriander seeds and cumin in the same dry pan over medium heat for about 90 seconds, until fragrant, then grind to a powder.', NULL),
(262, 4, 'Trim the lemongrass to the tender pale core and slice it as thinly as you possibly can. Peel and finely chop the galangal. Both are woody, and coarse pieces will stay stringy in the finished paste no matter how long you pound.', NULL),
(262, 5, 'Pound everything in a mortar in order of hardness: lemongrass and galangal first, then the lime leaves, then the chillies, then the shallot, garlic and coriander stems, and finally the ground spices, shrimp paste and salt. Work each stage to a pulp before adding the next.', 'No mortar? Blitz in a small blender with 1 tbsp of water. The texture is slightly looser but the flavour holds up.'),
(262, 6, 'Pack into a clean jar and smooth the surface flat. Keeps 2 weeks in the fridge, or freeze in tablespoon portions for 3 months.', 'Freeze it in an ice cube tray — one cube is roughly one dinner''s worth.');


-- =====================================================================
-- 4. FAMILY 110 — THAI RED CURRY CHICKEN STIR FRY
--    Light 550.8/srv, Moderate 634.0/srv, Balanced 787.5/srv.
-- =====================================================================

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 263, 'Thai Red Curry Chicken Stir Fry', 2, 1102, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 263);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 264, 'Thai Red Curry Chicken Stir Fry', 2, 1268, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 264);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 265, 'Thai Red Curry Chicken Stir Fry', 2, 1575, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 265);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 263, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 263 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 264, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 264 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 265, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 265 AND meal_id = 3);

-- 4a. Ingredients — LIGHT (263). Row 2 is the FR-103 dual path:
--     ingredient_id 195 (store-bought) AND linked_recipe_id 262 (homemade).
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 11, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 195, 262, 2.50, 4, 40.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>195) AND (linked_recipe_id<=>262));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 183, NULL, 2.00, 3, 10.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 38, NULL, 55.00, 2, 55.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>38) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 24, NULL, 140.00, 2, 140.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 25, NULL, 18.00, 2, 18.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 21, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 36, NULL, 1.00, 3, 5.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 40, NULL, 1.00, 4, 15.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 133, NULL, 170.00, 1, 170.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>133) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 42, NULL, 1.00, 8, 160.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 51, NULL, 160.00, 1, 160.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 194, NULL, 120.00, 1, 120.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>194) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 139, NULL, 2.00, 6, 40.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>139) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 128, NULL, 3.00, 5, 30.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 29, NULL, 1.00, 9, 10.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>29) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 263, 26, NULL, 60.00, 1, 60.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=263 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 4b. Ingredients — MODERATE (264)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 11, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 195, 262, 3.00, 4, 45.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>195) AND (linked_recipe_id<=>262));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 183, NULL, 1.00, 4, 12.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 38, NULL, 70.00, 2, 70.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>38) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 24, NULL, 120.00, 2, 120.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 25, NULL, 18.00, 2, 18.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 21, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 36, NULL, 1.50, 3, 6.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 40, NULL, 1.00, 4, 15.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 133, NULL, 160.00, 1, 160.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>133) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 42, NULL, 1.00, 8, 150.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 51, NULL, 150.00, 1, 150.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 194, NULL, 100.00, 1, 100.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>194) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 139, NULL, 2.00, 6, 40.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>139) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 128, NULL, 3.00, 5, 30.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 29, NULL, 1.00, 9, 10.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>29) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 264, 26, NULL, 95.00, 1, 95.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=264 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 4c. Ingredients — BALANCED (265). Adds roasted peanuts for crunch.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 11, NULL, 250.00, 1, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 195, 262, 3.50, 4, 50.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>195) AND (linked_recipe_id<=>262));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 183, NULL, 1.00, 4, 12.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 38, NULL, 80.00, 2, 80.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>38) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 24, NULL, 110.00, 2, 110.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 25, NULL, 22.00, 2, 22.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 21, NULL, 1.00, 17, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 36, NULL, 1.50, 3, 7.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>36) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 40, NULL, 1.00, 4, 15.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 133, NULL, 160.00, 1, 160.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>133) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 42, NULL, 1.00, 8, 150.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 51, NULL, 150.00, 1, 150.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>51) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 194, NULL, 100.00, 1, 100.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>194) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 139, NULL, 2.00, 6, 40.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>139) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 128, NULL, 3.00, 5, 30.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 29, NULL, 1.00, 9, 12.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>29) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 140, NULL, 20.00, 1, 20.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>140) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 265, 26, NULL, 125.00, 1, 125.00, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=265 AND (ingredient_id<=>26) AND (linked_recipe_id<=>NULL));

-- 4d. Steps. Step 1 carries linked_recipe_id 262 + alt_instruction (the
--     homemade/store-bought fork the UI renders as a clickable prep step).
DELETE FROM recipe_steps WHERE recipe_id IN (263, 264, 265);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(263, 1, 'Prepare the Thai Red Curry Paste according to the linked recipe. This dish needs 40-50 g; the batch makes 180 g, so freeze the rest in tablespoon portions.', 'Make a double batch while the mortar is out — it freezes for three months and turns this into a 30-minute dinner next time.', 262, 'Measure out 40-50 g (about 3 tbsp) of shop-bought Thai red curry paste. Taste it first: most jarred pastes run saltier than homemade, so hold back half the soy sauce and season at the end instead.'),
(263, 2, 'Rinse the rice until the water runs clear, then cook it with 1.5x its weight in water: lid on, 10 min low, 10 min off the heat. Start it now so it steams while you cook.', NULL, NULL, NULL),
(263, 3, 'Pat the chicken completely dry with kitchen paper and slice it thinly on the bias. Season with a pinch of salt.', 'Wet chicken steams instead of searing. Thirty seconds with kitchen paper is what buys you a crust.', NULL, NULL),
(263, 4, 'Blanch the broccoli and green beans in salted boiling water for 90 seconds, then drop them into cold water and drain hard.', 'Skipping this is how 600 g of vegetables turns a stir-fry into a stew. Blanching part-cooks them so they hit the wok ready to finish.', NULL, NULL),
(263, 5, 'Heat a wok or your widest pan over high heat until a drop of water skitters. Add the coconut oil, then the chicken in a single layer — in two batches if it will not fit. Sear 2 min undisturbed, toss, 1 min more until just opaque. Remove to a plate and keep the juices.', NULL, NULL, NULL),
(263, 6, 'Turn the heat to medium-high. Add the coconut milk to the empty pan and let it bubble for about 2 min until the fat separates and it looks split and glossy. Stir in the curry paste and fry it in that fat for 90 seconds, until it darkens and smells sweet rather than raw.', 'This is called cracking the cream, and it is the whole flavour of the dish. Paste stirred into liquid instead of fried in fat tastes raw and thin.', 262, 'Cracking the cream matters even more with shop-bought paste — it is the step that cooks off the tinned edge. Fry it the full 90 seconds until it darkens.'),
(263, 7, 'Add the shallot and stir-fry 1 min. Add the drained broccoli and green beans, the pepper and the bamboo shoots. Toss hard for 2 min to coat everything in the paste.', NULL, NULL, NULL),
(263, 8, 'Pour in the stock, soy sauce, sugar and MSG. Boil hard for 3-4 min until the liquid reduces to a glaze that coats the vegetables and leaves a clear trail when you drag a spoon across the pan.', 'You want it clinging, not swimming. If it still pools at the bottom of the pan, keep going.', NULL, NULL),
(263, 9, 'Return the chicken and any juices from the plate. Toss for 1 min to heat through.', NULL, NULL, NULL),
(263, 10, 'Off the heat, stir in the lime juice, spring onions and basil.', 'Residual heat wilts the basil without blackening it, and adding the acid last stops it splitting the coconut milk.', NULL, NULL),
(263, 11, 'Taste. It should read salty, then sweet, then sour, then hot. Flat? A little more soy, a few drops at a time. Too sharp? A pinch of sugar. Serve over the rice with the pan glaze spooned over.', 'Pan size matters here — 600 g of vegetables in a 24 cm pan will stew rather than fry. Use a wok, or cook the vegetables in two batches.', NULL, NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 264, step_number, instruction, tip, linked_recipe_id, alt_instruction FROM recipe_steps WHERE recipe_id = 263;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 265, step_number, instruction, tip, linked_recipe_id, alt_instruction FROM recipe_steps WHERE recipe_id = 263;

-- Balanced gets one extra step for the peanuts.
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
VALUES (265, 12, 'Scatter the roasted peanuts over the plated curry.', 'They go on at the very last moment — stirred into the pan they soften and lose the crunch that earns them their place.', NULL, NULL);

-- 4e. Extras hierarchy (parent -> paste)
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 263, 262, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 263 AND child_recipe_id = 262);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 264, 262, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 264 AND child_recipe_id = 262);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 265, 262, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 265 AND child_recipe_id = 262);

-- 4f. Family 110
INSERT INTO recipe_families (id, family_name, description)
SELECT 110, 'Thai Red Curry Chicken Stir Fry', 'A stir-fried red curry rather than a soupy one. The paste is cracked in coconut cream over high heat so the sauce clings instead of pooling, which keeps the coconut milk down to 70 ml and leaves room for 320 g of vegetables per plate.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 110);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 110, 263, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 263);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 110, 264, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 264);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 110, 265, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 265);


-- =====================================================================
-- 5. VERIFICATION (run after applying; all five should return clean)
-- =====================================================================

-- 5a. Families have exactly 3 members, labels Light,Moderate,Balanced, default on Moderate.
--     Expect 2 rows, both showing 3 / 'Light,Moderate,Balanced' / 'Moderate'.
-- SELECT rfm.family_id, COUNT(*) AS members,
--        GROUP_CONCAT(rfm.variant_label ORDER BY rfm.display_order) AS labels,
--        MAX(CASE WHEN rfm.is_default = 1 THEN rfm.variant_label END) AS default_label
-- FROM recipe_family_members rfm WHERE rfm.family_id IN (109,110) GROUP BY rfm.family_id;

-- 5b. Stored calories vs recomputed (raw + prorated linked). Expect pct_diff < 5 on all six.
-- SELECT r.id, r.name, r.calories AS stored, ROUND(SUM(x.kcal)) AS computed,
--        ROUND(ABS(r.calories - SUM(x.kcal)) / r.calories * 100, 1) AS pct_diff,
--        ROUND(SUM(x.kcal) / r.default_servings) AS per_serving
-- FROM recipes r JOIN (
--   SELECT ri.recipe_id, ri.quantity_grams * (i.protein_per_100g*4 + i.carbs_per_100g*4 + i.fat_per_100g*9)/100 AS kcal
--   FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
--   WHERE ri.linked_recipe_id IS NULL
--   UNION ALL
--   SELECT ri.recipe_id, (ri.quantity_grams / y.yield_g) * y.total_kcal
--   FROM recipe_ingredients ri
--   JOIN (SELECT ri2.recipe_id, SUM(ri2.quantity_grams) AS yield_g,
--                SUM(ri2.quantity_grams * (i2.protein_per_100g*4 + i2.carbs_per_100g*4 + i2.fat_per_100g*9)/100) AS total_kcal
--         FROM recipe_ingredients ri2 JOIN ingredients i2 ON i2.id = ri2.ingredient_id GROUP BY ri2.recipe_id) y
--     ON y.recipe_id = ri.linked_recipe_id
--   WHERE ri.linked_recipe_id IS NOT NULL
-- ) x ON x.recipe_id = r.id
-- WHERE r.id BETWEEN 259 AND 265 GROUP BY r.id;

-- 5c. Every linked ingredient row has a matching step. Expect 0 rows.
-- SELECT ri.recipe_id, ri.linked_recipe_id FROM recipe_ingredients ri
-- WHERE ri.linked_recipe_id IS NOT NULL AND ri.recipe_id BETWEEN 259 AND 265
--   AND NOT EXISTS (SELECT 1 FROM recipe_steps rs
--                   WHERE rs.recipe_id = ri.recipe_id AND rs.linked_recipe_id = ri.linked_recipe_id
--                     AND rs.alt_instruction IS NOT NULL);

-- 5d. FR-103 dual path present in all 3 variants of family 110. Expect 0 rows.
-- SELECT rfm.family_id, lr.name, COUNT(DISTINCT rfm.variant_label) AS n
-- FROM recipe_family_members rfm
-- JOIN recipe_ingredients ri ON ri.recipe_id = rfm.recipe_id
-- JOIN recipes lr ON lr.id = ri.linked_recipe_id
-- WHERE ri.ingredient_id IS NOT NULL AND ri.linked_recipe_id IS NOT NULL AND rfm.family_id = 110
-- GROUP BY rfm.family_id, lr.name HAVING n <> 3;

-- 5e. No duplicate recipe_ingredients rows from a double-run. Expect 0 rows.
-- SELECT recipe_id, ingredient_id, linked_recipe_id, COUNT(*) c
-- FROM recipe_ingredients WHERE recipe_id BETWEEN 259 AND 265
-- GROUP BY recipe_id, ingredient_id, linked_recipe_id HAVING c > 1;

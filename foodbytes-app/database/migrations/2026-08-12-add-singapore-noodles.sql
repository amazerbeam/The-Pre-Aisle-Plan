-- =====================================================================
-- 2026-08-12  Add Singapore Noodles
--
--   Family 111  Singapore Noodles  (recipes 266/267/268)
--               Easy midweek. One new ingredient (196 Curry powder).
--               No sub-recipes, no linked extras.
--
-- IDs deliberately skip 259-265 / families 109-110 / ingredients 188-195,
-- which are reserved by the unapplied 2026-08-12-add-stir-fry-and-thai-red-curry.sql
-- migration. Either file can be applied first without collision.
--
-- Noodles are Flat Rice Noodles (137) rather than a new vermicelli row --
-- user's call; the two have identical per-100g macros, so this changes
-- nothing in the macro math.
--
-- Curry powder is a generic blend (USDA per-100g), not Madras-specific --
-- user will use whatever jar they have.
--
-- No fish sauce anywhere (anchovy-derived, avoided for gout). Salt comes
-- from soy sauce + salt, savouriness from MSG.
--
-- Every insert is guarded with WHERE NOT EXISTS. Re-running this whole
-- file is a no-op. recipe_steps use wipe-and-re-insert (the unique key on
-- (recipe_id, step_number) makes UPDATE-based renumbering collide).
--
-- IDs verified against live DB 2026-08-12:
--   MAX(recipes.id)=258  MAX(recipe_families.id)=108  MAX(ingredients.id)=187
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. NEW INGREDIENT (196)
--    Dedup-checked case-insensitively incl. singular/plural and synonyms:
--    no 'curry powder' / 'madras' row exists. Garam masala (61) is a
--    different blend and is NOT a duplicate of this.
-- ---------------------------------------------------------------------

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 196, 'curry_powder', 'Curry powder', 8, 12.70, 55.80, 13.80, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 196 OR `key` = 'curry_powder' OR LOWER(name) = 'curry powder');


-- =====================================================================
-- 2. FAMILY 111 — SINGAPORE NOODLES
-- =====================================================================

-- 2a. Recipes. calories = whole-recipe kcal (per-serving x default_servings).
--     Light 528.3/srv, Moderate 627.0/srv, Balanced 786.7/srv.

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 266, 'Singapore Noodles', 2, 1057, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 266);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 267, 'Singapore Noodles', 2, 1254, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 267);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 268, 'Singapore Noodles', 2, 1573, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 268);

-- 2b. Meal slots (3 = dinner)
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 266, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 266 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 267, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 267 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 268, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 268 AND meal_id = 3);


-- 2c. Ingredients — LIGHT (266)
--     P 78.32  C 114.16  F 31.85  = 1056.5 kcal whole / 528.3 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 11, NULL, 180.00, 1, 180.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 59, NULL, 1.00, 8, 56.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 137, NULL, 80.00, 1, 80.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 138, NULL, 140.00, 1, 140.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 12, NULL, 1.00, 7, 100.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>12) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 42, NULL, 1.00, 7, 120.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 128, NULL, 4.00, 5, 40.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 13, NULL, 4.00, 10, 16.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 14, NULL, 1.50, 3, 8.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 196, NULL, 1.50, 4, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>196) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 17, NULL, 1.00, 3, 3.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>17) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 18, NULL, 1.00, 3, 3.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>18) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 165, NULL, 1.00, 3, 2.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 25, NULL, 20.00, 2, 20.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 24, NULL, 90.00, 2, 90.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 183, NULL, 1.50, 3, 8.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 129, NULL, 1.50, 3, 7.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 40, NULL, 2.00, 3, 10.00, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 80, NULL, 1.00, 9, 8.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>80) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 21, NULL, 1.00, 17, 0.50, 20 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 5, NULL, 0.50, 3, 3.00, 21 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>5) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 266, 151, NULL, 0.25, 3, 1.00, 22 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=266 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));


-- 2d. Ingredients — MODERATE (267)
--     P 85.20  C 136.03  F 41.01  = 1254.0 kcal whole / 627.0 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 11, NULL, 180.00, 1, 180.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 59, NULL, 2.00, 8, 112.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 137, NULL, 110.00, 1, 110.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 138, NULL, 100.00, 1, 100.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 12, NULL, 1.00, 7, 100.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>12) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 42, NULL, 1.00, 7, 100.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 128, NULL, 4.00, 5, 40.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 13, NULL, 4.00, 10, 16.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 14, NULL, 1.50, 3, 8.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 196, NULL, 1.50, 4, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>196) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 17, NULL, 1.00, 3, 3.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>17) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 18, NULL, 1.00, 3, 3.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>18) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 165, NULL, 1.00, 3, 2.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 25, NULL, 20.00, 2, 20.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 24, NULL, 80.00, 2, 80.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 183, NULL, 2.00, 3, 10.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 129, NULL, 1.50, 3, 8.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 40, NULL, 2.00, 3, 10.00, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 80, NULL, 1.00, 9, 8.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>80) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 21, NULL, 1.00, 17, 0.50, 20 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 5, NULL, 0.50, 3, 3.00, 21 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>5) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 267, 151, NULL, 0.25, 3, 1.00, 22 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=267 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));


-- 2e. Ingredients — BALANCED (268). Adds roasted peanuts for crunch.
--     P 105.23  C 159.67  F 57.08  = 1573.4 kcal whole / 786.7 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 11, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>11) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 59, NULL, 2.00, 8, 112.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>59) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 137, NULL, 132.00, 1, 132.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>137) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 138, NULL, 100.00, 1, 100.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>138) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 12, NULL, 1.00, 7, 100.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>12) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 42, NULL, 1.00, 7, 100.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>42) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 128, NULL, 4.00, 5, 40.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>128) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 13, NULL, 4.00, 10, 16.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>13) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 14, NULL, 1.50, 3, 8.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>14) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 196, NULL, 2.00, 4, 12.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>196) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 17, NULL, 1.00, 3, 3.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>17) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 18, NULL, 1.00, 3, 3.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>18) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 165, NULL, 1.00, 3, 2.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>165) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 25, NULL, 22.00, 2, 22.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>25) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 24, NULL, 80.00, 2, 80.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>24) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 183, NULL, 2.00, 3, 11.00, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>183) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 129, NULL, 2.00, 3, 9.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>129) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 140, NULL, 25.00, 1, 25.00, 18 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>140) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 40, NULL, 2.50, 3, 12.00, 19 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>40) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 80, NULL, 1.00, 9, 8.00, 20 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>80) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 21, NULL, 1.00, 17, 0.50, 21 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>21) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 5, NULL, 0.50, 3, 3.00, 22 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>5) AND (linked_recipe_id<=>NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 268, 151, NULL, 0.25, 3, 1.00, 23 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=268 AND (ingredient_id<=>151) AND (linked_recipe_id<=>NULL));


-- 2f. Steps (wipe-and-re-insert; identical across variants except the
--     Balanced peanut finish — quantities live on the ingredient rows)
DELETE FROM recipe_steps WHERE recipe_id IN (266, 267, 268);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(266, 1, 'Soak the rice noodles in warm water for 15-20 minutes, until pliable but still firm at the core. Drain well and toss with a few drops of the sesame oil so they do not clump.', 'Never boil them. They finish cooking in the wok, and noodles that went into boiling water arrive there already soft and break into mush the moment you toss them.'),
(266, 2, 'Slice the chicken thinly on the bias and season with the salt and white pepper.', NULL),
(266, 3, 'Chop everything before the pan goes on: onion into thin wedges, pepper into strips, spring onions into 3 cm lengths, garlic sliced, ginger cut into matchsticks. Combine the curry powder, turmeric, cumin and chilli flakes in a small bowl.', 'A stir-fry gives you no time to catch up once the pan is hot. Everything within arm''s reach before you light the hob.'),
(266, 4, 'Beat the eggs. Heat the pan over high heat, add a third of the coconut oil, and scramble the eggs in about 30 seconds while they are still slightly wet. Tip them onto a plate.', 'Pull them while they look underdone — they will finish in the residual heat and again when they go back into the wok.'),
(266, 5, 'Same pan, still high, remaining coconut oil. Chicken in a single layer, 90 seconds undisturbed, then toss for 1 minute until just opaque. Onto the plate with the eggs, juices and all.', 'Crowding the pan makes the chicken steam instead of sear. Two batches if it will not sit in one layer.'),
(266, 6, 'Turn the heat down to medium. Add the garlic and ginger for 20 seconds, then tip in the spice mix and stir it through the oil for 45-60 seconds, until it darkens a shade and smells nutty rather than dusty.', 'This is the step the whole dish is built on. Curry powder added later, into liquid, stays chalky no matter how long it cooks — it needs fat and direct heat to bloom.'),
(266, 7, 'Heat back to high. Add the onion and pepper and stir-fry for 2 minutes — they should keep some bite.', NULL),
(266, 8, 'Add the noodles and the soy sauce, then the stock a splash at a time, lifting and turning until every strand is coated yellow and no liquid pools at the base of the pan.', 'Use tongs or chopsticks, never a spoon — a spoon shreds the noodles. And go easy on the stock: this dish should finish dry and separate, not saucy.'),
(266, 9, 'Return the chicken, the egg and every drop of juice from the plate. Add the bean sprouts and spring onions and toss for 30 seconds only.', 'Those plate juices are concentrated flavour. And the sprouts are there for crunch — another minute in the pan and they go limp.'),
(266, 10, 'Off the heat, stir through the remaining sesame oil, the lime juice and the coriander.', 'Sesame oil is a finishing oil — its flavour breaks down over high heat. Off the hob, always last.'),
(266, 11, 'Taste before it leaves the pan. Tastes dusty? The spices needed longer at step 6 — bloom a pinch more in a teaspoon of oil and stir it through. Flat? A little more soy. Heavy? More lime.', NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip)
SELECT 267, step_number, instruction, tip FROM recipe_steps WHERE recipe_id = 266;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip)
SELECT 268, step_number, instruction, tip FROM recipe_steps WHERE recipe_id = 266;

-- Balanced gets one extra step for the peanuts.
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip)
VALUES (268, 12, 'Scatter the roasted peanuts over the plated noodles.', 'They go on at the very last moment — tossed into the pan they soften and lose the crunch that earns them their place.');


-- 2g. Family 111
INSERT INTO recipe_families (id, family_name, description)
SELECT 111, 'Singapore Noodles', 'Curry-spiced rice noodles with chicken, scrambled egg and bean sprouts. The spices are bloomed in oil before anything wet goes in, which is what separates this from a dusty-tasting imitation. Finishes dry and separate rather than saucy; 25 minutes start to finish.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 111);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 111, 266, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 266);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 111, 267, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 267);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 111, 268, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 268);

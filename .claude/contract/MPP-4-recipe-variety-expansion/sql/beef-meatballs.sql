-- Task 14: Design and insert the Beef Meatballs family
-- MPP-4-recipe-variety-expansion, Phase 4
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- all three
-- variants cleared every hard reject condition on first design (fat%
-- 23-24% is a soft miss on the 25-35% target band, not a reject).

-- Step 1: Resolve ingredients.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%beef mince%' OR LOWER(name) LIKE '%breadcrumb%' OR LOWER(name) LIKE '%passata%'
   OR LOWER(name) LIKE '%spaghetti%' OR LOWER(name) LIKE '%basil%' OR LOWER(name) LIKE '%oregano%' OR LOWER(name) LIKE '%parmesan%';
-- Result: Beef Mince (3% fat) (125, P22/C0/F3) confirmed as the lean cut
-- already used by Bolognese and Burger Patties. Breadcrumbs (63), Egg (59,
-- id checked separately), Tomato passata (136), Spaghetti dried (126),
-- Fresh basil (29), Dried oregano (35), Parmesan cheese (30), Garlic (13,
-- checked separately) all confirmed live. No new ingredients needed.
-- Distinct from Spaghetti Bolognese (family 23): rolled/shaped meatballs
-- browned then simmered in sauce, vs a loose ragu -- a real technique
-- difference, not a relabeling.

-- Step 2-3: Design -- "Beef Meatballs in Tomato Sauce with Spaghetti", meal_id=3.
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Beef Mince 3% (125)  280g               350g                  450g
-- Breadcrumbs (63)     25g                30g                    35g
-- Egg (59)             1 (50g)            1 (50g)                1 (50g)
-- Tomato passata (136) 250g               300g                  380g
-- Spaghetti dried (126) 90g               130g                  150g
-- Garlic (13)          1.5 cloves (6g)    2 cloves (8g)          2.5 cloves (10g)
-- Olive oil (22)       6g (0.45 tbsp)     10g (0.7 tbsp)         14g (1 tbsp)
-- Fresh basil (29)     2g                 3g                     4g
-- Dried oregano (35)   1g (0.4 tsp)       1g (0.4 tsp)           1.5g (0.6 tsp)
-- Parmesan cheese (30) 8g                 10g                    15g
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=243, families=103, steps=2064, recipe_ingredients=2865 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Meatballs in Tomato Sauce with Spaghetti', 2, 964, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Meatballs in Tomato Sauce with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Meatballs in Tomato Sauce with Spaghetti', 2, 1261, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Meatballs in Tomato Sauce with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Meatballs in Tomato Sauce with Spaghetti', 2, 1543, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Meatballs in Tomato Sauce with Spaghetti');
-- New recipe ids: Light=244, Moderate=245, Balanced=246

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 244, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=244 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 245, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=245 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 246, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=246 AND meal_id=3);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 tbsp=4 piece=5 clove=10 pinch=17
-- Light (244)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 125, NULL, 280.00, 1, 280.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=125 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 63, NULL, 25.00, 1, 25.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 136, NULL, 250.00, 1, 250.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 126, NULL, 90.00, 1, 90.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 13, NULL, 1.50, 10, 6.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 22, NULL, 0.45, 4, 6.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 29, NULL, 2.00, 1, 2.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 35, NULL, 0.40, 3, 1.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 30, NULL, 8.00, 1, 8.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 244, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=244 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (245)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 125, NULL, 350.00, 1, 350.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=125 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 63, NULL, 30.00, 1, 30.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 136, NULL, 300.00, 1, 300.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 126, NULL, 130.00, 1, 130.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 13, NULL, 2.00, 10, 8.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 22, NULL, 0.70, 4, 10.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 29, NULL, 3.00, 1, 3.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 35, NULL, 0.40, 3, 1.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 30, NULL, 10.00, 1, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 245, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=245 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (246)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 125, NULL, 450.00, 1, 450.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=125 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 63, NULL, 35.00, 1, 35.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 136, NULL, 380.00, 1, 380.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 126, NULL, 150.00, 1, 150.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 13, NULL, 2.50, 10, 10.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 22, NULL, 1.00, 4, 14.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 29, NULL, 4.00, 1, 4.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 35, NULL, 0.60, 3, 1.50, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 30, NULL, 15.00, 1, 15.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 246, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=246 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2866-2901

-- recipe_steps (identical method across variants). Includes a taste-and-adjust
-- step before plating, per the chef audit lens.
DELETE FROM recipe_steps WHERE recipe_id IN (244,245,246);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(244, 1, 'In a bowl, combine the beef mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~10 meatballs -- do not overwork the mixture or they will turn dense.'),
(244, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(244, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(244, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until cooked through and the sauce has thickened slightly.'),
(244, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(244, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(245, 1, 'In a bowl, combine the beef mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~12 meatballs -- do not overwork the mixture or they will turn dense.'),
(245, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(245, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(245, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until cooked through and the sauce has thickened slightly.'),
(245, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(245, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(246, 1, 'In a bowl, combine the beef mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~14 meatballs -- do not overwork the mixture or they will turn dense.'),
(246, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(246, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(246, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until cooked through and the sauce has thickened slightly.'),
(246, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(246, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Beef Meatballs in Tomato Sauce with Spaghetti'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Meatballs in Tomato Sauce with Spaghetti');
-- New family id: 104

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 104, 244, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=104 AND recipe_id=244);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 104, 245, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=104 AND recipe_id=245);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 104, 246, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=104 AND recipe_id=246);

-- Step 5: Verify.
-- Family structure: 3 members, Light(244)/Moderate(245,is_default=1)/Balanced(246),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 44.06  C 48.34  F 12.47  kcal 481.8 (stored 964,  matches 2x)
--   Moderate: P 55.17  C 65.92  F 16.23  kcal 630.5 (stored 1261, matches 2x)
--   Balanced: P 69.10  C 77.13  F 20.72  kcal 771.4 (stored 1543, matches 2x)
-- Matches design. All reject conditions clear (fat% 23-24% is a soft miss
-- on the target band, not a reject -- only >35% rejects).

-- ==========================================================================
-- IDS FOR REFERENCE: family=104, Light=244, Moderate=245, Balanced=246
-- ==========================================================================

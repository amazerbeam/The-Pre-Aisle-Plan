-- Task 17: Design and insert the Turkey Meatballs family
-- MPP-4-recipe-variety-expansion, Phase 5
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- macros were
-- recomputed from scratch with Turkey mince (21P/2F per 100g), NOT copied
-- from Task 14's beef numbers. The lower fat content correctly shows up as
-- a lower fat% across all three variants (~21-22% here vs ~23-24% for beef).

-- Step 1: Confirm Turkey mince id + resolve the rest.
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE name = 'Turkey mince (2% fat)';
-- Result: id=180, P21.00 C0.00 F2.00 (from Task 1) -- vs Beef Mince 3% fat
-- (id 125) at P22.00 C0.00 F3.00. Close but genuinely distinct; the ratio
-- difference (21:2 vs 22:3) is what produces the lower fat% below.
-- Same supporting ingredients as Task 14: Breadcrumbs (63), Egg (59), Tomato
-- passata (136), Spaghetti dried (126), Garlic (13), Olive oil (22), Fresh
-- basil (29), Dried oregano (35), Parmesan cheese (30) -- all reused.

-- Step 2-3: Design -- "Turkey Meatballs in Tomato Sauce with Spaghetti", meal_id=3.
-- Ingredients (whole recipe, serves 2) -- same portion structure as Task 14's
-- beef family (a legitimate basis for comparison since the two mince products
-- have such similar per-100g ratios), recomputed fresh with turkey mince:
--                      Light              Moderate (default)   Balanced
-- Turkey mince (180)   280g               350g                  450g
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
-- Result: recipes=252, families=106, steps=2112, recipe_ingredients=2952 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Meatballs in Tomato Sauce with Spaghetti', 2, 927, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Meatballs in Tomato Sauce with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Meatballs in Tomato Sauce with Spaghetti', 2, 1217, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Meatballs in Tomato Sauce with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Meatballs in Tomato Sauce with Spaghetti', 2, 1484, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Meatballs in Tomato Sauce with Spaghetti');
-- New recipe ids: Light=253, Moderate=254, Balanced=255

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 253, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=253 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 254, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=254 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 255, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=255 AND meal_id=3);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 tbsp=4 piece=5 clove=10 pinch=17
-- Light (253)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 180, NULL, 280.00, 1, 280.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 63, NULL, 25.00, 1, 25.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 136, NULL, 250.00, 1, 250.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 126, NULL, 90.00, 1, 90.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 13, NULL, 1.50, 10, 6.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 22, NULL, 0.45, 4, 6.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 29, NULL, 2.00, 1, 2.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 35, NULL, 0.40, 3, 1.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 30, NULL, 8.00, 1, 8.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 253, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=253 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (254)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 180, NULL, 350.00, 1, 350.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 63, NULL, 30.00, 1, 30.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 136, NULL, 300.00, 1, 300.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 126, NULL, 130.00, 1, 130.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 13, NULL, 2.00, 10, 8.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 22, NULL, 0.70, 4, 10.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 29, NULL, 3.00, 1, 3.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 35, NULL, 0.40, 3, 1.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 30, NULL, 10.00, 1, 10.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 254, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=254 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (255)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 180, NULL, 450.00, 1, 450.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 63, NULL, 35.00, 1, 35.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 136, NULL, 380.00, 1, 380.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=136 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 126, NULL, 150.00, 1, 150.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 13, NULL, 2.50, 10, 10.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 22, NULL, 1.00, 4, 14.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 29, NULL, 4.00, 1, 4.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 35, NULL, 0.60, 3, 1.50, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 30, NULL, 15.00, 1, 15.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 50, NULL, 0.15, 3, 0.50, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 255, 5, NULL, 1.00, 17, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=255 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2953-2988

-- recipe_steps (identical method across variants, adjusted note that turkey
-- must be fully cooked through, unlike beef which the analogous step
-- allowed to be served pink -- a real food-safety difference between the
-- two proteins reflected in the wording, not just macros).
DELETE FROM recipe_steps WHERE recipe_id IN (253,254,255);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(253, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~10 meatballs -- do not overwork the mixture or they will turn dense.'),
(253, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(253, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(253, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).'),
(253, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(253, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(254, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~12 meatballs -- do not overwork the mixture or they will turn dense.'),
(254, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(254, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(254, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).'),
(254, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(254, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(255, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, oregano, salt, and pepper. Mix gently and shape into ~14 meatballs -- do not overwork the mixture or they will turn dense.'),
(255, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, then remove.'),
(255, 3, 'Add the remaining olive oil and garlic to the pan, cook 30 seconds until fragrant. Stir in the tomato passata and bring to a simmer.'),
(255, 4, 'Return the meatballs to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).'),
(255, 5, 'Meanwhile, cook the spaghetti according to package directions, drain, reserving a splash of pasta water to loosen the sauce if needed.'),
(255, 6, 'Toss the spaghetti with the sauce and meatballs, taste and adjust seasoning, then scatter with parmesan and fresh basil to serve.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Turkey Meatballs in Tomato Sauce with Spaghetti'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Meatballs in Tomato Sauce with Spaghetti');
-- New family id: 107

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 107, 253, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=107 AND recipe_id=253);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 107, 254, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=107 AND recipe_id=254);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 107, 255, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=107 AND recipe_id=255);

-- Step 5: Verify.
-- Family structure: 3 members, Light(253)/Moderate(254,is_default=1)/Balanced(255),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 42.66  C 48.34  F 11.07  kcal 463.6 (stored 927,  matches 2x)
--   Moderate: P 53.42  C 65.92  F 14.48  kcal 607.7 (stored 1217, matches 2x)
--   Balanced: P 66.85  C 77.13  F 18.47  kcal 742.1 (stored 1484, matches 2x)
-- Matches design (minor rounding). All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=107, Light=253, Moderate=254, Balanced=255
-- ==========================================================================

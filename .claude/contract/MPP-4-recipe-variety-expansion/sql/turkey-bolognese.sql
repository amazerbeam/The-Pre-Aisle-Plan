-- Task 18: Design and insert the Turkey Bolognese family
-- MPP-4-recipe-variety-expansion, Phase 5 (final task of this phase)
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- mirrors the
-- existing beef Spaghetti Bolognese (family 23) aromatics/technique
-- structure but with fresh, macro-target-calibrated portions -- the beef
-- family's own Moderate variant runs ~772 kcal/serving, well outside its
-- band, but that's pre-existing data out of scope to fix here.

-- Step 1: Confirm Turkey mince id + resolve the rest.
SELECT ri.recipe_id, i.name AS ingredient, ri.quantity_grams
FROM recipe_ingredients ri LEFT JOIN ingredients i ON i.id = ri.ingredient_id
WHERE ri.recipe_id = 82 ORDER BY ri.sort_order;
-- Result: beef Bolognese aromatics structure confirmed -- Onion, Carrot,
-- Celery, Garlic, Tinned tomatoes, Tomato paste, [Beef] Stock, Olive oil,
-- Sugar, Dried oregano, Bay leaf, Parmesan, Fresh basil.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%onion%' OR LOWER(name) LIKE '%celery%' OR LOWER(name) LIKE '%bay leaf%'
   OR LOWER(name) LIKE '%sugar%' OR LOWER(name) LIKE '%chicken stock%' OR LOWER(name) LIKE '%beef stock%';
-- Result: Onion (12), Celery (99), Bay leaf (34), Sugar (36), Chicken stock
-- (24) -- and Beef Stock (122). Chicken Stock chosen as the turkey-appropriate
-- swap for Beef Stock, per the task's own suggestion.
-- This is a genuinely different family (different protein/macro profile),
-- confirmed distinct from family 23 "Spaghetti Bolognese" in Step 5.

-- Step 2-3: Design -- "Turkey Bolognese with Spaghetti", meal_id=3.
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Turkey mince (180)   280g               350g                  450g
-- Spaghetti dried (126) 90g               130g                  160g
-- Onion (12)           70g                80g                    100g
-- Carrot (56)          40g                50g                    60g
-- Celery (99)          25g                30g                    35g
-- Garlic (13)          1.25 cloves (5g)   1.5 cloves (6g)        2 cloves (8g)
-- Tinned tomatoes (33) 250g               300g                  350g
-- Tomato paste (23)    15g                20g                    25g
-- Chicken stock (24)   170ml              200ml                  230ml
-- Olive oil (22)       14g (1 tbsp)       20g (1.4 tbsp)         26g (1.85 tbsp)
-- Sugar (36)           2g (0.4 tsp)       3g (0.6 tsp)           4g (0.8 tsp)
-- Dried oregano (35)   1g (0.4 tsp)       1g (0.4 tsp)           1.5g (0.6 tsp)
-- Bay leaf (34)        0.3g               0.3g                   0.3g
-- Parmesan cheese (30) 8g                 10g                    14g
-- Fresh basil (29)     2g                 3g                     4g
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=255, families=107, steps=2130, recipe_ingredients=2988 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Bolognese with Spaghetti', 2, 912, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Bolognese with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Bolognese with Spaghetti', 2, 1213, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Bolognese with Spaghetti');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Bolognese with Spaghetti', 2, 1529, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Bolognese with Spaghetti');
-- New recipe ids: Light=256, Moderate=257, Balanced=258

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 256, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=256 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 257, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=257 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 258, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=258 AND meal_id=3);

-- recipe_ingredients (guarded, 17 rows per variant). unit ids: g=1 ml=2 tsp=3 tbsp=4 clove=10 leaf=14 pinch=17
-- Light (256)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 180, NULL, 280.00, 1, 280.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 126, NULL, 90.00, 1, 90.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 12, NULL, 70.00, 1, 70.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=12 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 56, NULL, 40.00, 1, 40.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 99, NULL, 25.00, 1, 25.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=99 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 13, NULL, 1.25, 10, 5.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 33, NULL, 250.00, 1, 250.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=33 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 23, NULL, 15.00, 1, 15.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=23 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 24, NULL, 170.00, 2, 170.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=24 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 22, NULL, 1.00, 4, 14.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 36, NULL, 0.40, 3, 2.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=36 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 35, NULL, 0.40, 3, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 34, NULL, 1.00, 14, 0.30, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=34 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 30, NULL, 8.00, 1, 8.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 29, NULL, 2.00, 1, 2.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 50, NULL, 0.15, 3, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 256, 5, NULL, 1.00, 17, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=256 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (257)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 180, NULL, 350.00, 1, 350.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 126, NULL, 130.00, 1, 130.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 12, NULL, 80.00, 1, 80.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=12 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 56, NULL, 50.00, 1, 50.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 99, NULL, 30.00, 1, 30.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=99 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 13, NULL, 1.50, 10, 6.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 33, NULL, 300.00, 1, 300.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=33 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 23, NULL, 20.00, 1, 20.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=23 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 24, NULL, 200.00, 2, 200.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=24 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 22, NULL, 1.40, 4, 20.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 36, NULL, 0.60, 3, 3.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=36 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 35, NULL, 0.40, 3, 1.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 34, NULL, 1.00, 14, 0.30, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=34 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 30, NULL, 10.00, 1, 10.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 29, NULL, 3.00, 1, 3.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 50, NULL, 0.15, 3, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 257, 5, NULL, 1.00, 17, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=257 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (258)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 180, NULL, 450.00, 1, 450.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 126, NULL, 160.00, 1, 160.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=126 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 12, NULL, 100.00, 1, 100.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=12 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 56, NULL, 60.00, 1, 60.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 99, NULL, 35.00, 1, 35.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=99 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 13, NULL, 2.00, 10, 8.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 33, NULL, 350.00, 1, 350.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=33 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 23, NULL, 25.00, 1, 25.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=23 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 24, NULL, 230.00, 2, 230.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=24 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 22, NULL, 1.85, 4, 26.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 36, NULL, 0.80, 3, 4.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=36 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 35, NULL, 0.60, 3, 1.50, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=35 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 34, NULL, 1.00, 14, 0.30, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=34 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 30, NULL, 14.00, 1, 14.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=30 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 29, NULL, 4.00, 1, 4.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=29 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 50, NULL, 0.15, 3, 0.50, 16 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 258, 5, NULL, 1.00, 17, 1.00, 17 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=258 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2989-3039

-- recipe_steps (identical classic-bolognese method across variants).
DELETE FROM recipe_steps WHERE recipe_id IN (256,257,258);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(256, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot, and celery, and cook 6-8 minutes until softened.'),
(256, 2, 'Add the garlic and cook 30 seconds until fragrant.'),
(256, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.'),
(256, 4, 'Stir in the tomato paste and cook 1 minute, then add the tinned tomatoes, chicken stock, sugar, oregano, and bay leaf. Bring to a simmer.'),
(256, 5, 'Simmer uncovered for 30-35 minutes, stirring occasionally, until the sauce has thickened and the turkey reaches 74°C (165°F) internally.'),
(256, 6, 'Meanwhile, cook the spaghetti according to package directions and drain.'),
(256, 7, 'Remove the bay leaf, taste and adjust seasoning, then toss the spaghetti with the sauce. Scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(257, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot, and celery, and cook 6-8 minutes until softened.'),
(257, 2, 'Add the garlic and cook 30 seconds until fragrant.'),
(257, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.'),
(257, 4, 'Stir in the tomato paste and cook 1 minute, then add the tinned tomatoes, chicken stock, sugar, oregano, and bay leaf. Bring to a simmer.'),
(257, 5, 'Simmer uncovered for 30-35 minutes, stirring occasionally, until the sauce has thickened and the turkey reaches 74°C (165°F) internally.'),
(257, 6, 'Meanwhile, cook the spaghetti according to package directions and drain.'),
(257, 7, 'Remove the bay leaf, taste and adjust seasoning, then toss the spaghetti with the sauce. Scatter with parmesan and fresh basil to serve.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(258, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot, and celery, and cook 6-8 minutes until softened.'),
(258, 2, 'Add the garlic and cook 30 seconds until fragrant.'),
(258, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.'),
(258, 4, 'Stir in the tomato paste and cook 1 minute, then add the tinned tomatoes, chicken stock, sugar, oregano, and bay leaf. Bring to a simmer.'),
(258, 5, 'Simmer uncovered for 30-35 minutes, stirring occasionally, until the sauce has thickened and the turkey reaches 74°C (165°F) internally.'),
(258, 6, 'Meanwhile, cook the spaghetti according to package directions and drain.'),
(258, 7, 'Remove the bay leaf, taste and adjust seasoning, then toss the spaghetti with the sauce. Scatter with parmesan and fresh basil to serve.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Turkey Bolognese with Spaghetti'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Bolognese with Spaghetti');
-- New family id: 108

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 108, 256, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=108 AND recipe_id=256);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 108, 257, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=108 AND recipe_id=257);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 108, 258, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=108 AND recipe_id=258);

-- Step 5: Verify.
-- Family structure: 3 members, Light(256)/Moderate(257,is_default=1)/Balanced(258),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 39.16  C 47.50  F 11.92  kcal 453.9 (stored 912,  matches 2x)
--   Moderate: P 49.87  C 65.20  F 16.26  kcal 606.6 (stored 1213, matches 2x)
--   Balanced: P 63.60  C 80.14  F 21.10  kcal 764.9 (stored 1529, matches 2x)
-- Matches design (minor rounding). All reject conditions clear.
-- Duplicate-family check: family 108 "Turkey Bolognese with Spaghetti" is
--   distinct from family 23 "Spaghetti Bolognese" -- different id, different
--   family_name, different protein source and macro profile. Not a duplicate.

-- ==========================================================================
-- IDS FOR REFERENCE: family=108, Light=256, Moderate=257, Balanced=258
-- This completes Phase 5 (Turkey) and all 18 dish-design tasks (Tasks 1-18).
-- Only Phase 6 (final verification, Tasks 19-22) remains.
-- ==========================================================================

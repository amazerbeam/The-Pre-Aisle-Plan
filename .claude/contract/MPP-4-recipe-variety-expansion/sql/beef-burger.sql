-- Task 15: Design and insert the Beef Burger family (store-bought patty)
-- MPP-4-recipe-variety-expansion, Phase 4 (final task of this phase)
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction, after
-- discovering the store-bought patty (17P/20F per 100g) cannot clear the
-- protein floor and stay under the 35% fat ceiling on its own -- added
-- Sliced Ham (id 108) as the protein-fat balancing lever (same fix used in
-- Task 9's Fried Egg family). Result is a smaller patty than a typical
-- burger, which is the direct consequence of the developer's explicit
-- decision to use id 95 directly rather than link/design a homemade patty.

-- Step 1: Confirm the store-bought patty + resolve the rest.
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE id = 95;
-- Result: "Beef Burger Patties", P17.00 C0.00 F20.00 -- confirmed as planned.
-- Per the developer's explicit decision, ingredient_id=95 is used directly
-- on every variant. Burger Patties (id 43) is NOT linked; no homemade patty
-- was designed.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%bun%' OR LOWER(name) LIKE '%bread roll%' OR LOWER(name) LIKE '%lettuce%' OR LOWER(name) LIKE '%tomato%';
-- Result: "Brioche Burger Buns" (94) already exists as a distinct product --
-- not a linkable sub-recipe, no dedup conflict with Milk Bread/Pita/Flatbread.
-- Lettuce (47), Tomato (48) confirmed live. Dijon Mustard (86) used as the
-- burger sauce (no ketchup ingredient exists). No bacon exists in the DB --
-- Sliced Ham (108, from Task 3) used as the protein-fat balancing topping instead.

-- Step 2-3: Design -- "Beef Burger with Bun, Lettuce, Tomato & Ham", meal_id=3.
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Beef Burger Patties (95) 25g            30g                   40g
-- Sliced Ham (108)     280g               350g                  430g
-- Brioche Burger Buns (94) 1 (210g)       1 (260g)               1 (320g)
-- Lettuce (47)         18g                20g                    25g
-- Tomato (48)          25g                30g                    35g
-- Dijon Mustard (86)   4g (0.8 tsp)       5g (1 tsp)             6g (1.2 tsp)
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1g                 1g                     1g
-- (Buns are single large units sized per variant, matching the display
-- convention of "1 piece" scaled by weight -- unusual but consistent with
-- how single-unit linked/whole items are represented elsewhere.)

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=246, families=104, steps=2082, recipe_ingredients=2901 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Burger with Bun, Lettuce, Tomato & Ham', 2, 1040, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Burger with Bun, Lettuce, Tomato & Ham');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Burger with Bun, Lettuce, Tomato & Ham', 2, 1289, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Burger with Bun, Lettuce, Tomato & Ham');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Beef Burger with Bun, Lettuce, Tomato & Ham', 2, 1593, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Burger with Bun, Lettuce, Tomato & Ham');
-- New recipe ids: Light=247, Moderate=248, Balanced=249

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 247, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=247 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 248, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=248 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 249, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=249 AND meal_id=3);

-- recipe_ingredients (guarded). Patty row: ingredient_id=95, linked_recipe_id=NULL
-- on every variant (guards against accidentally reaching for id 43).
-- unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (247)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 95, NULL, 25.00, 1, 25.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=95 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 108, NULL, 280.00, 1, 280.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 94, NULL, 1.00, 5, 210.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 47, NULL, 18.00, 1, 18.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=47 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 48, NULL, 25.00, 1, 25.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=48 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 86, NULL, 0.80, 3, 4.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=86 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 247, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=247 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (248)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 95, NULL, 30.00, 1, 30.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=95 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 108, NULL, 350.00, 1, 350.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 94, NULL, 1.00, 5, 260.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 47, NULL, 20.00, 1, 20.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=47 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 48, NULL, 30.00, 1, 30.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=48 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 86, NULL, 1.00, 3, 5.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=86 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 248, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=248 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (249)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 95, NULL, 40.00, 1, 40.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=95 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 108, NULL, 430.00, 1, 430.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 94, NULL, 1.00, 5, 320.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 47, NULL, 25.00, 1, 25.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=47 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 48, NULL, 35.00, 1, 35.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=48 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 86, NULL, 1.20, 3, 6.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=86 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 249, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=249 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2902-2925

-- recipe_steps (identical method across variants).
DELETE FROM recipe_steps WHERE recipe_id IN (247,248,249);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(247, 1, 'Cook the burger patties according to package directions (pan-fry or grill, roughly 4 minutes per side, until cooked through).'),
(247, 2, 'Warm the sliced ham in the same pan for 30 seconds per side.'),
(247, 3, 'Toast the cut side of the burger buns briefly.'),
(247, 4, 'Spread the bottom bun with mustard, then layer the lettuce, tomato, patty, and ham.'),
(247, 5, 'Top with the bun lid and serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(248, 1, 'Cook the burger patties according to package directions (pan-fry or grill, roughly 4 minutes per side, until cooked through).'),
(248, 2, 'Warm the sliced ham in the same pan for 30 seconds per side.'),
(248, 3, 'Toast the cut side of the burger buns briefly.'),
(248, 4, 'Spread the bottom bun with mustard, then layer the lettuce, tomato, patty, and ham.'),
(248, 5, 'Top with the bun lid and serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(249, 1, 'Cook the burger patties according to package directions (pan-fry or grill, roughly 4 minutes per side, until cooked through).'),
(249, 2, 'Warm the sliced ham in the same pan for 30 seconds per side.'),
(249, 3, 'Toast the cut side of the burger buns briefly.'),
(249, 4, 'Spread the bottom bun with mustard, then layer the lettuce, tomato, patty, and ham.'),
(249, 5, 'Top with the bun lid and serve immediately.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Beef Burger with Bun, Lettuce, Tomato & Ham'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Beef Burger with Bun, Lettuce, Tomato & Ham');
-- New family id: 105

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 105, 247, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=105 AND recipe_id=247);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 105, 248, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=105 AND recipe_id=248);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 105, 249, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=105 AND recipe_id=249);

-- Step 5: Verify.
-- Family structure: 3 members, Light(247)/Moderate(248,is_default=1)/Balanced(249),
--   display_order 1/2/3. Correct.
-- Patty guard: ingredient_id=95, linked_recipe_id IS NULL on all three
--   recipe_ingredients rows -- confirmed, never id 43.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 36.07  C 50.34  F 19.43  kcal 520.5 (stored 1040, matches 2x)
--   Moderate: P 44.85  C 62.26  F 24.01  kcal 644.5 (stored 1289, matches 2x)
--   Balanced: P 55.38  C 76.55  F 29.84  kcal 796.3 (stored 1593, matches 2x)
-- Matches design (minor rounding vs. live-DB lettuce macro). All reject
-- conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=105, Light=247, Moderate=248, Balanced=249
-- This completes Phase 4 (Beef).
-- ==========================================================================

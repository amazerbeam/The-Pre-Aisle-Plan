-- Task 16: Design and insert the Turkey Burger family
-- MPP-4-recipe-variety-expansion, Phase 5
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction -- turkey
-- mince's much leaner profile (21P/2F per 100g, vs the beef patty's
-- 17P/20F) meant no protein-fat lever was needed here, unlike Task 15.

-- Step 1: Confirm Turkey mince id + resolve the rest.
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE name = 'Turkey mince (2% fat)';
-- Result: id=180, P21.00 C0.00 F2.00 (from Task 1).
-- Per the plan's Assumption, this patty is inlined as raw ingredients
-- (turkey mince + breadcrumbs + egg), not a linked Extras sub-recipe --
-- no existing turkey-patty component to link, and only this dish uses it.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%cabbage%' OR LOWER(name) LIKE '%carrot%' OR LOWER(name) LIKE '%coleslaw%';
-- Result: White Cabbage (160), Carrot (56) confirmed live for slaw. Mayonnaise
-- (87) confirmed live for slaw dressing. Brioche Burger Buns (94) reused from
-- Task 15's own resolution.

-- Step 2-3: Design -- "Turkey Burger with Bun & Slaw", meal_id=3.
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Turkey mince (180)   220g               280g                  350g
-- Breadcrumbs (63)     20g                25g                    30g
-- Egg (59)             1 (50g)            1 (50g)                1 (50g)
-- Brioche Burger Buns (94) 1 (170g)        1 (220g)               1 (260g)
-- White Cabbage (160)  70g                80g                    90g
-- Carrot (56)          25g                30g                    35g
-- Mayonnaise (87)      10g                12g                    18g
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1.5g               1.5g                   1.5g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=249, families=105, steps=2097, recipe_ingredients=2925 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Burger with Bun & Slaw', 2, 1029, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Burger with Bun & Slaw');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Burger with Bun & Slaw', 2, 1289, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Burger with Bun & Slaw');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Turkey Burger with Bun & Slaw', 2, 1557, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Burger with Bun & Slaw');
-- New recipe ids: Light=250, Moderate=251, Balanced=252

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 250, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=250 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 251, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=251 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 252, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=252 AND meal_id=3);

-- recipe_ingredients (guarded). Patty ingredients are separate rows (turkey
-- mince, breadcrumbs, egg), not a single linked row. unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (250)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 180, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 63, NULL, 20.00, 1, 20.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 94, NULL, 1.00, 5, 170.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 160, NULL, 70.00, 1, 70.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=160 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 56, NULL, 25.00, 1, 25.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 87, NULL, 10.00, 1, 10.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=87 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 50, NULL, 0.15, 3, 0.50, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 250, 5, NULL, 1.00, 17, 1.50, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=250 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (251)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 180, NULL, 280.00, 1, 280.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 63, NULL, 25.00, 1, 25.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 94, NULL, 1.00, 5, 220.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 160, NULL, 80.00, 1, 80.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=160 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 56, NULL, 30.00, 1, 30.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 87, NULL, 12.00, 1, 12.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=87 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 50, NULL, 0.15, 3, 0.50, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 251, 5, NULL, 1.00, 17, 1.50, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=251 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (252)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 180, NULL, 350.00, 1, 350.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=180 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 63, NULL, 30.00, 1, 30.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=63 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 59, NULL, 1.00, 5, 50.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=59 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 94, NULL, 1.00, 5, 260.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=94 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 160, NULL, 90.00, 1, 90.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=160 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 56, NULL, 35.00, 1, 35.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 87, NULL, 18.00, 1, 18.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=87 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 50, NULL, 0.15, 3, 0.50, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 252, 5, NULL, 1.00, 17, 1.50, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=252 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2926-2952

-- recipe_steps (identical method across variants).
DELETE FROM recipe_steps WHERE recipe_id IN (250,251,252);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(250, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.'),
(250, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.'),
(250, 3, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, salt, and pepper for the slaw.'),
(250, 4, 'Toast the cut side of the burger buns briefly.'),
(250, 5, 'Build the burger: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(251, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.'),
(251, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.'),
(251, 3, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, salt, and pepper for the slaw.'),
(251, 4, 'Toast the cut side of the burger buns briefly.'),
(251, 5, 'Build the burger: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(252, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.'),
(252, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.'),
(252, 3, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, salt, and pepper for the slaw.'),
(252, 4, 'Toast the cut side of the burger buns briefly.'),
(252, 5, 'Build the burger: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Turkey Burger with Bun & Slaw'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Turkey Burger with Bun & Slaw');
-- New family id: 106

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 106, 250, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=106 AND recipe_id=250);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 106, 251, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=106 AND recipe_id=251);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 106, 252, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=106 AND recipe_id=252);

-- Step 5: Verify.
-- Family structure: 3 members, Light(250)/Moderate(251,is_default=1)/Balanced(252),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 35.09  C 49.29  F 19.67  kcal 514.5 (stored 1029, matches 2x)
--   Moderate: P 43.82  C 62.90  F 24.19  kcal 644.6 (stored 1289, matches 2x)
--   Balanced: P 53.21  C 74.28  F 29.80  kcal 778.1 (stored 1557, matches 2x)
-- Matches design. All reject conditions clear.

-- ==========================================================================
-- IDS FOR REFERENCE: family=106, Light=250, Moderate=251, Balanced=252
-- ==========================================================================

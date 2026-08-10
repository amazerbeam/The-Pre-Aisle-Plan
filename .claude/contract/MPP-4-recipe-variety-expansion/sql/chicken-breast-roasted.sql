-- Task 13: Design and insert the Chicken Breast (roasted) family
-- MPP-4-recipe-variety-expansion, Phase 3 (final task of this phase)
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction, after adding a
-- small garlic + fresh rosemary flavour boost (negligible macro impact,
-- precisely recomputed) -- all three cleared every reject condition.

-- Step 1: Resolve ingredients.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE id IN (11,15,172,51,22);
-- Result: Chicken breast (11) P31/C0/F3.6, Sweet potato (15) P1.6/C20/F0.1,
-- Broccoli (51) P2.8/C7/F0.4, Baby spinach (172) P2.9/C3.6/F0.4, Olive oil (22).
-- Broccoli chosen as the "greens" side (classic roast-chicken pairing).
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%rosemary%' OR LOWER(name) LIKE '%thyme%' OR LOWER(name) LIKE '%garlic%';
-- Result: Garlic (13), Fresh rosemary (71) already exist, reused.
-- Hard constraint: roasted technique only, no breading/curry/composed bowl
-- beyond the simple sweet-potato-and-broccoli side (verified in Step 5).

-- Step 2-3: Design -- "Herb-Roasted Chicken Breast with Sweet Potato & Greens", meal_id=3.
-- First-pass numbers (without garlic/rosemary) needed an olive-oil bump on
-- Moderate (18g -> 28g) to clear the 25% fat floor without breaking the
-- carbs floor; garlic (1 clove) + fresh rosemary (2g) then added to all
-- three for flavour, with the whole design recomputed to the final numbers below.
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Chicken breast (11)  230g               300g                  400g
-- Sweet potato (15)    400g               550g                  700g
-- Broccoli (51)        170g               200g                  220g
-- Olive oil (22)       18g (1.3 tbsp)     28g (2 tbsp)           28g (2 tbsp)
-- Garlic (13)           4g (1 clove)       4g (1 clove)           4g (1 clove)
-- Fresh rosemary (71)   2g                 2g                     2g
-- Black pepper (50)     0.5g               0.5g                   0.5g
-- Salt (5)               1g                 1g                     1g

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=240, families=102, steps=2049, recipe_ingredients=2841 (before this task)

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Herb-Roasted Chicken Breast with Sweet Potato & Greens', 2, 955, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Herb-Roasted Chicken Breast with Sweet Potato & Greens');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Herb-Roasted Chicken Breast with Sweet Potato & Greens', 2, 1298, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Herb-Roasted Chicken Breast with Sweet Potato & Greens');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Herb-Roasted Chicken Breast with Sweet Potato & Greens', 2, 1594, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Herb-Roasted Chicken Breast with Sweet Potato & Greens');
-- New recipe ids: Light=241, Moderate=242, Balanced=243

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 241, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=241 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 242, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=242 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 243, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=243 AND meal_id=3);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 tbsp=4 clove=10 pinch=17
-- Light (241)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 11, NULL, 230.00, 1, 230.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 15, NULL, 400.00, 1, 400.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=15 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 51, NULL, 170.00, 1, 170.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=51 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 22, NULL, 1.30, 4, 18.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 13, NULL, 1.00, 10, 4.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 71, NULL, 2.00, 1, 2.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 241, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=241 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (242)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 11, NULL, 300.00, 1, 300.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 15, NULL, 550.00, 1, 550.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=15 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 51, NULL, 200.00, 1, 200.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=51 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 22, NULL, 2.00, 4, 28.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 13, NULL, 1.00, 10, 4.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 71, NULL, 2.00, 1, 2.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 242, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=242 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (243)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 11, NULL, 400.00, 1, 400.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 15, NULL, 700.00, 1, 700.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=15 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 51, NULL, 220.00, 1, 220.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=51 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 22, NULL, 2.00, 4, 28.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 13, NULL, 1.00, 10, 4.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 71, NULL, 2.00, 1, 2.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 50, NULL, 0.15, 3, 0.50, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 243, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=243 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2842-2865

-- recipe_steps (identical method across variants). Roasted-only technique --
-- no breading/frying/curry language (verified in Step 5). Includes the
-- resting-juices step per the chef audit lens on missing chef craft.
DELETE FROM recipe_steps WHERE recipe_id IN (241,242,243);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(241, 1, 'Preheat the oven to 200°C (400°F).'),
(241, 2, 'Toss the diced sweet potato and broccoli with half the olive oil, minced garlic, salt, and pepper. Spread on a tray and roast for 15 minutes.'),
(241, 3, 'Rub the chicken breasts with the remaining olive oil, chopped rosemary, salt, and pepper.'),
(241, 4, 'Push the vegetables to the sides of the tray and add the chicken. Roast 20-25 minutes, until the chicken reaches 74°C (165°F) internally and the vegetables are tender and caramelized.'),
(241, 5, 'Rest the chicken for 5 minutes before slicing -- this keeps the juices in the meat instead of on the board. Spoon any resting juices back over the sliced chicken before serving.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(242, 1, 'Preheat the oven to 200°C (400°F).'),
(242, 2, 'Toss the diced sweet potato and broccoli with half the olive oil, minced garlic, salt, and pepper. Spread on a tray and roast for 15 minutes.'),
(242, 3, 'Rub the chicken breasts with the remaining olive oil, chopped rosemary, salt, and pepper.'),
(242, 4, 'Push the vegetables to the sides of the tray and add the chicken. Roast 20-25 minutes, until the chicken reaches 74°C (165°F) internally and the vegetables are tender and caramelized.'),
(242, 5, 'Rest the chicken for 5 minutes before slicing -- this keeps the juices in the meat instead of on the board. Spoon any resting juices back over the sliced chicken before serving.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(243, 1, 'Preheat the oven to 200°C (400°F).'),
(243, 2, 'Toss the diced sweet potato and broccoli with half the olive oil, minced garlic, salt, and pepper. Spread on a tray and roast for 15 minutes.'),
(243, 3, 'Rub the chicken breasts with the remaining olive oil, chopped rosemary, salt, and pepper.'),
(243, 4, 'Push the vegetables to the sides of the tray and add the chicken. Roast 20-25 minutes, until the chicken reaches 74°C (165°F) internally and the vegetables are tender and caramelized.'),
(243, 5, 'Rest the chicken for 5 minutes before slicing -- this keeps the juices in the meat instead of on the board. Spoon any resting juices back over the sliced chicken before serving.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Herb-Roasted Chicken Breast with Sweet Potato & Greens'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Herb-Roasted Chicken Breast with Sweet Potato & Greens');
-- New family id: 103

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 103, 241, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=103 AND recipe_id=241);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 103, 242, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=103 AND recipe_id=242);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 103, 243, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=103 AND recipe_id=243);

-- Step 5: Verify.
-- Family structure: 3 members, Light(241)/Moderate(242,is_default=1)/Balanced(243),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 41.42  C 46.98  F 13.76  kcal 477.4 (stored 955,  matches 2x)
--   Moderate: P 53.89  C 63.03  F 20.15  kcal 649.0 (stored 1298, matches 2x)
--   Balanced: P 70.87  C 78.73  F 22.07  kcal 797.0 (stored 1594, matches 2x)
-- Matches design. All reject conditions clear.
-- Explicit technique check: zero recipe_steps rows match bread/batter/curry/fry
-- across all three variants -- roasted-only confirmed.

-- ==========================================================================
-- IDS FOR REFERENCE: family=103, Light=241, Moderate=242, Balanced=243
-- This completes Phase 3 (Fish & Chicken mains).
-- ==========================================================================

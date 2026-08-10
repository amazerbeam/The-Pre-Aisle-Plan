-- Task 12: Design and insert the Mackerel family
-- MPP-4-recipe-variety-expansion, Phase 3
-- Executed live against Railway MySQL on 2026-08-10.
-- Design auto-approved per developer's standing instruction, after two
-- rebalancing passes: mackerel's high fat (14g/100g) blew the 35% ceiling
-- with any added oil, so oil was dropped entirely, and a lemon-yogurt
-- drizzle was added (fixes Light's protein floor, gives dish coherence
-- across all three variants, and keeps fat in range without added fat).

-- Step 1: Confirm Mackerel id + dedup-check quinoa/greens.
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE name = 'Mackerel';
-- Result: id=182, P19.00 C0.00 F14.00 (from Task 1).
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE LOWER(name) LIKE '%quinoa%' OR LOWER(name) LIKE '%spinach%' OR LOWER(name) LIKE '%kale%' OR LOWER(name) LIKE '%broccoli%';
-- Result: zero matches for Quinoa -- genuinely new. Broccoli (51) and Baby
-- spinach (172) already exist; Baby spinach chosen as the "greens".
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'quinoa', 'Quinoa', 11, 14.00, 64.00, 6.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Quinoa'));
-- New ingredient id: 187. Dry/raw basis, matching the project's existing
-- dry-grain convention (Jasmine rice id 26 is also stored dry, not cooked).

-- Step 2-3: Design -- "Pan-Seared Mackerel with Greens & Quinoa", meal_id=3 (Dinner).
-- Zero prawns/shellfish anywhere in this recipe (hard brief constraint).
-- Ingredients (whole recipe, serves 2):
--                      Light              Moderate (default)   Balanced
-- Mackerel (182)       200g               250g                  320g
-- Quinoa (187, dry)    140g               175g                  220g
-- Baby spinach (172)   130g               150g                  170g
-- Greek yogurt (49)    150g (dressing)    80g (dressing)         100g (dressing)
-- Lemon (88)           18g (0.3)          20g (0.35)             25g (0.4)
-- Black pepper (50)    0.5g               0.5g                   0.5g
-- Salt (5)             1g                 1g                     1g
-- (No added olive oil on any variant -- mackerel's own fat is already at
-- the 35% ceiling; the lemon-yogurt dressing supplies moisture instead.)

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_ingredient_id', MAX(id) FROM ingredients
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=237, families=101, ingredients=186 (pre Quinoa insert), steps=2031, recipe_ingredients=2820

INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Pan-Seared Mackerel with Greens & Quinoa', 2, 1056, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Pan-Seared Mackerel with Greens & Quinoa');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Pan-Seared Mackerel with Greens & Quinoa', 2, 1249, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Pan-Seared Mackerel with Greens & Quinoa');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Pan-Seared Mackerel with Greens & Quinoa', 2, 1575, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Pan-Seared Mackerel with Greens & Quinoa');
-- New recipe ids: Light=238, Moderate=239, Balanced=240

INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 238, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=238 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 239, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=239 AND meal_id=3);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 240, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=240 AND meal_id=3);

-- recipe_ingredients (guarded). unit ids: g=1 tsp=3 piece=5 pinch=17
-- Light (238)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 182, NULL, 200.00, 1, 200.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=182 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 187, NULL, 140.00, 1, 140.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=187 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 172, NULL, 130.00, 1, 130.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=172 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 49, NULL, 150.00, 1, 150.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 88, NULL, 0.30, 5, 18.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 238, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=238 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (239)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 182, NULL, 250.00, 1, 250.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=182 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 187, NULL, 175.00, 1, 175.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=187 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 172, NULL, 150.00, 1, 150.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=172 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 49, NULL, 80.00, 1, 80.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 88, NULL, 0.35, 5, 20.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 239, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=239 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (240)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 182, NULL, 320.00, 1, 320.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=182 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 187, NULL, 220.00, 1, 220.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=187 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 172, NULL, 170.00, 1, 170.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=172 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 49, NULL, 100.00, 1, 100.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 88, NULL, 0.40, 5, 25.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=88 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 50, NULL, 0.15, 3, 0.50, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=50 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 240, 5, NULL, 1.00, 17, 1.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=240 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2821-2841

-- recipe_steps (identical method across variants). Skin-on sear given a real
-- endpoint (dry-patted fillet, dry pan, press to prevent curling, 3-4 min skin/1-2 min flesh).
DELETE FROM recipe_steps WHERE recipe_id IN (238,239,240);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(238, 1, 'Rinse the quinoa, then cook according to package directions (roughly 1:2 quinoa:water, simmer 15 minutes, until fluffy).'),
(238, 2, 'Pat the mackerel fillets completely dry and score the skin lightly. Season with salt and pepper.'),
(238, 3, 'Heat a dry non-stick pan over high heat. Lay the mackerel skin-side down and press gently for the first 30 seconds to stop it curling. Sear 3-4 minutes until the skin is crisp, then flip and cook 1-2 minutes more.'),
(238, 4, 'Wilt the spinach in the same pan for 30-60 seconds.'),
(238, 5, 'Whisk the Greek yogurt with a squeeze of lemon juice and a pinch of salt for the dressing.'),
(238, 6, 'Plate the quinoa and spinach, top with the mackerel, and drizzle with the lemon-yogurt dressing.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(239, 1, 'Rinse the quinoa, then cook according to package directions (roughly 1:2 quinoa:water, simmer 15 minutes, until fluffy).'),
(239, 2, 'Pat the mackerel fillets completely dry and score the skin lightly. Season with salt and pepper.'),
(239, 3, 'Heat a dry non-stick pan over high heat. Lay the mackerel skin-side down and press gently for the first 30 seconds to stop it curling. Sear 3-4 minutes until the skin is crisp, then flip and cook 1-2 minutes more.'),
(239, 4, 'Wilt the spinach in the same pan for 30-60 seconds.'),
(239, 5, 'Whisk the Greek yogurt with a squeeze of lemon juice and a pinch of salt for the dressing.'),
(239, 6, 'Plate the quinoa and spinach, top with the mackerel, and drizzle with the lemon-yogurt dressing.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(240, 1, 'Rinse the quinoa, then cook according to package directions (roughly 1:2 quinoa:water, simmer 15 minutes, until fluffy).'),
(240, 2, 'Pat the mackerel fillets completely dry and score the skin lightly. Season with salt and pepper.'),
(240, 3, 'Heat a dry non-stick pan over high heat. Lay the mackerel skin-side down and press gently for the first 30 seconds to stop it curling. Sear 3-4 minutes until the skin is crisp, then flip and cook 1-2 minutes more.'),
(240, 4, 'Wilt the spinach in the same pan for 30-60 seconds.'),
(240, 5, 'Whisk the Greek yogurt with a squeeze of lemon juice and a pinch of salt for the dressing.'),
(240, 6, 'Plate the quinoa and spinach, top with the mackerel, and drizzle with the lemon-yogurt dressing.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Pan-Seared Mackerel with Greens & Quinoa'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Pan-Seared Mackerel with Greens & Quinoa');
-- New family id: 102

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 102, 238, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=102 AND recipe_id=238);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 102, 239, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=102 AND recipe_id=239);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 102, 240, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=102 AND recipe_id=240);

-- Step 5: Verify.
-- Family structure: 3 members, Light(238)/Moderate(239,is_default=1)/Balanced(240),
--   display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only, no linked recipes):
--   Light:    P 38.31  C 50.84  F 19.02  kcal 527.8 (stored 1056, matches 2x)
--   Moderate: P 42.31  C 61.23  F 23.37  kcal 624.5 (stored 1249, matches 2x)
--   Balanced: P 53.43  C 76.58  F 29.74  kcal 787.7 (stored 1575, matches 2x)
-- Matches design. All reject conditions clear (fat% 32-34%, comfortably
-- inside 25-35%; carbs% 38.5-39.2%, clears the 38% floor).
-- Explicit shellfish check: zero matches for prawn/shrimp/shellfish/mussel/
-- crab/lobster/oyster/scallop/clam across all three recipe_ingredients sets. Pass.

-- ==========================================================================
-- IDS FOR REFERENCE: family=102, Light=238, Moderate=239, Balanced=240, Quinoa=187
-- This completes Phase 3's fish tasks; Task 13 (Chicken Breast) remains.
-- ==========================================================================

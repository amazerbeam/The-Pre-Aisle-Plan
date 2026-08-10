-- Task 4: Design and insert the new Porridge family
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Design presented and auto-approved per developer's standing instruction
-- ("once the recipes are in range of the guide you are ok to create them") --
-- all three variants cleared every reject condition before this SQL ran.

-- Step 1: Resolve ingredients. Plan's cached id for "Protein Porridge" (86) was
-- stale -- that recipe id is now "Black Pepper Beef Stir Fry". Live lookup found
-- the real porridge families: id 1/2/3 "Porridge with Berries & Nuts" (peanut
-- butter protein lever, berries), id 187/192/193 "Protein Porridge with Berries"
-- (whey protein isolate + Greek yogurt, berries). This family differentiates on
-- both flavour (apple/cinnamon vs berries) and protein lever (Greek yogurt
-- alone, no whey powder).
SELECT id, name FROM ingredients WHERE LOWER(name) LIKE '%apple%' OR LOWER(name) LIKE '%pear%';
-- Result: zero rows -- Apple confirmed genuinely new.

INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'apple', 'Apple', 4, 0.30, 14.00, 0.20
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Apple'));
-- New ingredient id: 184 (USDA raw-with-skin values, aisle 4 = Fruit)

-- Step 2-3: Design -- "Apple, Cinnamon & Walnut Porridge", meal_id=1 (Breakfast).
-- Ingredients (whole recipe, serves 2):
--                    Light            Moderate (default)   Balanced
-- Rolled oats (1)    75g               100g                  130g
-- Low-fat milk (2)   300ml             400ml                 500ml
-- Apple (184)        130g (1 small)    150g (1 medium)       180g (1 large)
-- Cinnamon (19)      2.5g (1 tsp)      3g (1 tsp)             4g (1.5 tsp)
-- Walnuts (8)        20g               25g                   40g
-- Greek yogurt (49)  480g              450g                  500g
-- Honey (4)          5g (1 tsp)        8g (1.5 tsp)          15g (1 tbsp)
-- Salt (5)           1g (pinch)        1g (pinch)             1.5g (0.25 tsp)

-- Step 4: Generate and run guarded INSERT SQL.
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_family_id', MAX(id) FROM recipe_families
UNION ALL SELECT 'max_ingredient_id', MAX(id) FROM ingredients
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps
UNION ALL SELECT 'max_recipe_ingredients_id', MAX(id) FROM recipe_ingredients;
-- Result: recipes=213, families=93, ingredients=183 (pre-Apple-insert), steps=1911, recipe_ingredients=2662

-- recipes (guarded on family existence, since 3 rows intentionally share one name)
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Apple, Cinnamon & Walnut Porridge', 2, 951, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Apple, Cinnamon & Walnut Porridge');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Apple, Cinnamon & Walnut Porridge', 2, 1130, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Apple, Cinnamon & Walnut Porridge');
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Apple, Cinnamon & Walnut Porridge', 2, 1468, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Apple, Cinnamon & Walnut Porridge');
-- New recipe ids: Light=214, Moderate=215, Balanced=216

-- recipe_meals (guarded, meal_id=1 Breakfast)
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 214, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=214 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 215, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=215 AND meal_id=1);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 216, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id=216 AND meal_id=1);

-- recipe_ingredients (guarded, x3 variants x8 rows). unit ids: g=1 ml=2 tsp=3 tbsp=4 piece=5 small=6 medium=7 large=8 pinch=17
-- Light (214)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 1, NULL, 75.00, 1, 75.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=1 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 2, NULL, 300.00, 2, 300.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 184, NULL, 1.00, 6, 130.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=184 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 19, NULL, 1.00, 3, 2.50, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=19 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 8, NULL, 20.00, 1, 20.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 49, NULL, 480.00, 1, 480.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 4, NULL, 1.00, 3, 5.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 214, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=214 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Moderate (215)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 1, NULL, 100.00, 1, 100.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=1 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 2, NULL, 400.00, 2, 400.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 184, NULL, 1.00, 7, 150.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=184 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 19, NULL, 1.00, 3, 3.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=19 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 8, NULL, 25.00, 1, 25.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 49, NULL, 450.00, 1, 450.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 4, NULL, 1.50, 3, 8.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 215, 5, NULL, 1.00, 17, 1.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=215 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- Balanced (216)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 1, NULL, 130.00, 1, 130.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=1 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 2, NULL, 500.00, 2, 500.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=2 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 184, NULL, 1.00, 8, 180.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=184 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 19, NULL, 1.50, 3, 4.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=19 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 8, NULL, 40.00, 1, 40.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=8 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 49, NULL, 500.00, 1, 500.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=49 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 4, NULL, 1.00, 4, 15.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=4 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) SELECT 216, 5, NULL, 0.25, 3, 1.50, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id=216 AND ingredient_id=5 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2663-2686

-- recipe_steps (wipe-and-reinsert, identical method across variants except Balanced's closing drizzle)
DELETE FROM recipe_steps WHERE recipe_id IN (214,215,216);
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(214, 1, 'Peel, core, and dice the apple into ~1cm pieces.'),
(214, 2, 'Combine the oats, milk, and diced apple in a saucepan over medium heat.'),
(214, 3, 'Bring to a gentle simmer, then reduce to low and cook 8-10 minutes, stirring frequently, until the oats are creamy and the apple has softened.'),
(214, 4, 'Stir in the cinnamon and salt.'),
(214, 5, 'Remove from heat and stir in the honey.'),
(214, 6, 'Divide into bowls, swirl through the Greek yogurt, and scatter with walnuts. Taste and adjust sweetness before serving.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(215, 1, 'Peel, core, and dice the apple into ~1cm pieces.'),
(215, 2, 'Combine the oats, milk, and diced apple in a saucepan over medium heat.'),
(215, 3, 'Bring to a gentle simmer, then reduce to low and cook 8-10 minutes, stirring frequently, until the oats are creamy and the apple has softened.'),
(215, 4, 'Stir in the cinnamon and salt.'),
(215, 5, 'Remove from heat and stir in the honey.'),
(215, 6, 'Divide into bowls, swirl through the Greek yogurt, and scatter with walnuts. Taste and adjust sweetness before serving.');
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(216, 1, 'Peel, core, and dice the apple into ~1cm pieces.'),
(216, 2, 'Combine the oats, milk, and diced apple in a saucepan over medium heat.'),
(216, 3, 'Bring to a gentle simmer, then reduce to low and cook 8-10 minutes, stirring frequently, until the oats are creamy and the apple has softened.'),
(216, 4, 'Stir in the cinnamon and salt.'),
(216, 5, 'Remove from heat and stir in the honey.'),
(216, 6, 'Divide into bowls, swirl through the Greek yogurt, and scatter with walnuts. Drizzle with a little extra honey. Taste and adjust sweetness before serving.');

-- recipe_families / recipe_family_members
INSERT INTO recipe_families (family_name)
SELECT 'Apple, Cinnamon & Walnut Porridge'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE family_name = 'Apple, Cinnamon & Walnut Porridge');
-- New family id: 94

INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 94, 214, 'Light', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=94 AND recipe_id=214);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 94, 215, 'Moderate', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=94 AND recipe_id=215);
INSERT INTO recipe_family_members (family_id, recipe_id, variant_label, display_order, is_default)
SELECT 94, 216, 'Balanced', 3, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id=94 AND recipe_id=216);

-- Step 5: Verify.
-- Family structure: 3 members, Light(214)/Moderate(215,is_default=1)/Balanced(216), display_order 1/2/3. Correct.
-- Recomputed macros (raw ingredients only -- no linked recipes in this family):
--   Light:    P 35.73  C 54.08  F 12.90  kcal 475.3 (stored 951, matches 2x)
--   Moderate: P 37.97  C 67.35  F 15.97  kcal 565.0 (stored 1130, matches 2x)
--   Balanced: P 45.32  C 86.97  F 22.75  kcal 734.0 (stored 1468, matches 2x)
-- Matches design exactly. All reject conditions clear on all three variants.

-- ==========================================================================
-- IDS FOR REFERENCE: family=94, Light=214, Moderate=215, Balanced=216, Apple ingredient=184
-- ==========================================================================

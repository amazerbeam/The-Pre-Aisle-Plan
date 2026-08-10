-- Task 2: Design and insert the Granola/Muesli Extras recipe
-- MPP-4-recipe-variety-expansion, Phase 1
-- Executed live against Railway MySQL on 2026-08-10.
-- Design presented to developer and approved in chat before this SQL ran.

-- Step 1: Resolve every ingredient against the live DB.
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE name IN ('Rolled oats', 'Walnuts', 'Almonds', 'Chia seeds', 'Sesame seeds', 'Coconut oil', 'Maple syrup', 'Honey', 'Cinnamon');
-- Result: all 9 rows found (8 pre-existing, Coconut oil = id 183 just created in Task 1).
-- No new ingredient inserts needed. Honey (id 4) resolved but not used -- Maple syrup chosen as the sweetener.

-- Step 2/3: Design -- "Goodness Granola", 500g batch, 10 servings @ 50g.
-- Approved by developer 2026-08-10.
--
-- Ingredient        | grams | ingredient_id | unit
-- Rolled oats       | 280   | 1             | g
-- Walnuts           | 50    | 8             | g
-- Almonds           | 50    | 7             | g
-- Chia seeds        | 20    | 162           | g
-- Sesame seeds      | 20    | 81            | g
-- Coconut oil       | 35    | 183           | tbsp (2.5)
-- Maple syrup       | 40    | 144           | tbsp (2)
-- Cinnamon          | 5     | 19            | tsp (2)
-- Total             | 500   |               |
--
-- Whole batch: P 61.30g  C 249.47g  F 127.80g  kcal 2393.28 (4P+4C+9F cross-check: exact by construction)
-- Per serving (÷10): P 6.13g  C 24.95g  F 12.78g  kcal 239.33
-- Extras recipes are not held to L/M/B per-serving bands (linkable component, not a meal).

-- Step 4: Generate and run the guarded INSERT SQL.

-- recipes (guarded on name -- this is a standalone Extras recipe, no family siblings share this name)
INSERT INTO recipes (name, default_servings, calories, macros_audited)
SELECT 'Goodness Granola', 10, 2393, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Goodness Granola');
-- New recipe id: 213

-- recipe_meals (guarded, meal_id = 5 / Extras)
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 213, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 213 AND meal_id = 5);

-- recipe_ingredients (guarded, one row per approved ingredient)
-- NOTE: the chef skill's <=> NULL-safe guard pattern is rejected by this MCP query
-- parser ("Expected ... but '>' found"). Since linked_recipe_id is always NULL on
-- these rows, the guard is rewritten as `linked_recipe_id IS NULL` -- functionally
-- equivalent for this task, and used for every subsequent guarded insert this session.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 1, NULL, 280.00, 1, 280.00, 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 1 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 8, NULL, 50.00, 1, 50.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 8 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 7, NULL, 50.00, 1, 50.00, 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 7 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 162, NULL, 20.00, 1, 20.00, 4
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 162 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 81, NULL, 20.00, 1, 20.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 81 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 183, NULL, 2.50, 4, 35.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 183 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 144, NULL, 2.00, 4, 40.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 144 AND linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 213, 19, NULL, 2.00, 3, 5.00, 8
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 213 AND ingredient_id = 19 AND linked_recipe_id IS NULL);
-- New recipe_ingredients ids: 2651-2658

-- recipe_steps (wipe-and-reinsert pattern)
DELETE FROM recipe_steps WHERE recipe_id = 213;

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(213, 1, 'Preheat the oven to 160°C (325°F). Line a large baking tray with parchment paper.'),
(213, 2, 'In a large bowl, combine the rolled oats, walnuts, almonds, chia seeds, sesame seeds, and cinnamon.'),
(213, 3, 'In a small saucepan over low heat, warm the coconut oil and maple syrup together until melted and combined, about 2 minutes — do not let it bubble.'),
(213, 4, 'Pour the wet mixture over the dry ingredients and stir until every oat and nut piece is evenly coated.'),
(213, 5, 'Spread the mixture in a thin, even layer across the tray.'),
(213, 6, 'Bake for 25–30 minutes, tossing every 10 minutes, until golden brown and fragrant.'),
(213, 7, 'Remove from the oven and let cool completely on the tray, about 20 minutes — it crisps up as it cools, so do not skip this step.'),
(213, 8, 'Break into clusters and store in an airtight container for up to 2 weeks. Serve in ~50 g portions with Greek yogurt or kefir and fresh fruit.');
-- New recipe_steps ids: 1886-1893

-- Step 5: Verify.
SELECT r.id, r.name, r.calories, r.default_servings, rm.meal_id
FROM recipes r JOIN recipe_meals rm ON rm.recipe_id = r.id
WHERE r.name = 'Goodness Granola';
-- Result: id=213, calories=2393, default_servings=10, meal_id=5.

SELECT * FROM recipe_family_members WHERE recipe_id = 213;
-- Result: zero rows -- confirmed no family for this Extras recipe.

SELECT
  SUM(ri.quantity_grams * i.protein_per_100g / 100) AS total_protein,
  SUM(ri.quantity_grams * i.carbs_per_100g / 100) AS total_carbs,
  SUM(ri.quantity_grams * i.fat_per_100g / 100) AS total_fat,
  SUM(ri.quantity_grams * i.protein_per_100g / 100 * 4
    + ri.quantity_grams * i.carbs_per_100g / 100 * 4
    + ri.quantity_grams * i.fat_per_100g / 100 * 9) AS total_kcal
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE ri.recipe_id = 213;
-- Result: P 61.30  C 249.47  F 127.80  kcal 2393.28 -- matches design exactly, agrees with
-- stored calories (2393) well within 5%.

-- ==========================================================================
-- ID FOR DOWNSTREAM TASKS: Goodness Granola -> recipes.id = 213
-- Task 6 (Yogurt & Granola Bowl) links to this id via recipe_ingredients.linked_recipe_id.
-- ==========================================================================

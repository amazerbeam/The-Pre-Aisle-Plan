-- 2026-07-30  Audit remediation part 4 — cook-friendly display units
--
-- Audit Lens 2: the legacy recipes store spices, garlic, fats, eggs and
-- condiments in grams. Nobody weighs 1 g of black pepper or 10 g of garlic.
-- `quantity` + `unit_id` is what the cook sees; `quantity_grams` is what the
-- macro maths uses. This migration changes ONLY the former.
--
-- quantity_grams NEVER appears in a SET clause. Macros cannot move.
--
-- Every statement guards on `unit_id = 1`, so a row already converted is
-- skipped: the file is idempotent and safe to re-run.
--
-- Quantities are rounded to the nearest 0.25 unit — ROUND(x * 4) / 4 — so the
-- display reads as a real measurement, with a 0.25 floor so nothing shows as 0.
--
-- Deliberately NOT converted: bulk items that are correctly weighed
-- (Butterbeans 135, bell peppers 42/127, Chorizo 73, Pepperoni 149, Dried Egg
-- Noodles 164, meat and fish), and fats under 5 g where sub-teaspoon precision
-- matters (e.g. recipe 190's 2 g olive oil after the part-2 fix).
--
-- Row counts measured against the live DB, 2026-07-30.

-- Garlic (13) -> clove, 3 g per clove. 30 rows.
UPDATE recipe_ingredients SET unit_id = 10, quantity = GREATEST(ROUND(quantity_grams / 3.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 13;

-- Ginger (14) -> tsp grated, 5 g per tsp. 18 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 14;

-- Salt (5) -> tsp, 6 g per tsp. 15 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 6.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 5;

-- Black pepper (50) and Chilli Flakes (165): under 1 g -> pinch, else tsp at
-- 2 g per tsp. Order matters — the pinch statement must run FIRST, because the
-- tsp statement would otherwise claim the sub-gram rows.
UPDATE recipe_ingredients SET unit_id = 17, quantity = 1.00
WHERE unit_id = 1 AND ingredient_id IN (50, 165) AND quantity_grams < 1;

UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 2.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (50, 165) AND quantity_grams >= 1;

-- Sugar (36) -> tsp, 4 g per tsp. 5 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 4.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 36;

-- Fats: Olive oil (22), Sesame oil (129), Butter (103), Salted butter (53),
-- Unsalted butter (44), Ghee (177 — created in part 1).
-- >= 14 g -> tbsp; 5-13.99 g -> tsp; < 5 g stays in grams.
-- The tbsp statement runs first; the tsp statement then only sees rows still in
-- grams, so no row is converted twice.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 14.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (22, 129, 103, 53, 44, 177) AND quantity_grams >= 14;

UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (22, 129, 103, 53, 44, 177) AND quantity_grams >= 5 AND quantity_grams < 14;

-- Honey (4) -> tbsp, 20 g per tbsp. 13 rows.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 20.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 4;

-- Peanut butter (6) -> tbsp, 16 g per tbsp. 6 rows.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 16.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 6;

-- Liquid condiments: Soy sauce (25), Dark Soy Sauce (148), Lime juice (40).
-- Under 8 g -> tsp at 5 g; 8 g and over -> tbsp at 15 g. Splitting avoids
-- absurd readings like "0.25 tbsp" for a 5 g splash of dark soy.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (25, 148, 40) AND quantity_grams < 8;

UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 15.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (25, 148, 40) AND quantity_grams >= 8;

-- Soft herbs: Fresh basil (29) 6 g per handful, Fresh coriander (80) 8 g.
UPDATE recipe_ingredients SET unit_id = 9, quantity = GREATEST(ROUND(quantity_grams / 6.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 29;

UPDATE recipe_ingredients SET unit_id = 9, quantity = GREATEST(ROUND(quantity_grams / 8.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 80;

-- Egg (59) -> piece, 50 g per egg. Whole eggs only, so round to integers.
UPDATE recipe_ingredients SET unit_id = 5, quantity = GREATEST(ROUND(quantity_grams / 50.0), 1)
WHERE unit_id = 1 AND ingredient_id = 59;

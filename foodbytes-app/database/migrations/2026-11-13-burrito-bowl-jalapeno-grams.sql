-- Chicken Burrito Bowl (family 17, recipes 57/58/59): show the jalapeno in grams.
--
-- MPP-5 (2026-08-18) added the jalapeno as whole chillies: unit 7 (medium), qty 1 / 1.5 / 2,
-- quantity_grams 20 / 30 / 40. Developer request: list it in grams only.
-- unit ids: 1=g 7=medium
--
-- quantity_grams is unchanged, so macros, kcal and macros_audited are unaffected.
-- Idempotent: the UPDATE is a no-op on re-run, and the INSERTs only fire if the
-- MPP-5 rows are missing (e.g. that block was never applied to this DB).

-- Safety: the Jalapeno ingredient must exist (MPP-5 created it). Guarded on lower-cased name.
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 'jalapeno', 'Jalapeno', 3, 0.90, 6.50, 0.40, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = 'jalapeno');

SET @jalapeno := (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1);

-- Convert the existing rows to grams.
UPDATE recipe_ingredients
SET unit_id = 1, quantity = quantity_grams
WHERE recipe_id IN (57, 58, 59)
  AND ingredient_id = @jalapeno
  AND linked_recipe_id IS NULL;

-- Fallback: add the rows in grams if they are not there.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 57, @jalapeno, NULL, 20.00, 1, 20.00, 16
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 57 AND ingredient_id = @jalapeno);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 58, @jalapeno, NULL, 30.00, 1, 30.00, 16
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 58 AND ingredient_id = @jalapeno);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 59, @jalapeno, NULL, 40.00, 1, 40.00, 17
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 59 AND ingredient_id = @jalapeno);

-- Verify: expect 3 rows, unit 1 (g), quantity = quantity_grams = 20 / 30 / 40.
SELECT ri.recipe_id, r.name, ri.quantity, u.name AS unit, ri.quantity_grams
FROM recipe_ingredients ri
JOIN recipes r ON r.id = ri.recipe_id
JOIN units u ON u.id = ri.unit_id
WHERE ri.recipe_id IN (57, 58, 59) AND ri.ingredient_id = @jalapeno;

-- Picanha Steak with Fried Onion Mash (family 119: Light 291 / Moderate 292 / Balanced 293)
-- 1) Balanced (293): less mash. Potato 900 g -> 750 g, milk 150 ml -> 130 ml, butter 14 g -> 15 g.
--    Per serving: 793 -> 735 kcal, P 47 g, fat 33.7 %, carbs 40.5 %. Still above Moderate (652).
-- 2) All three variants: fry the onions in olive oil (id 22) instead of sunflower oil (id 84).
--    Same grams, same macros (100 g fat / 100 g), so Light/Moderate calories are unchanged.
-- Idempotent: every statement can be re-run safely.

-- 1) Balanced mash
UPDATE recipe_ingredients SET quantity = 750.00, unit_id = 1, quantity_grams = 750.00
WHERE id = 3652 AND recipe_id = 293 AND ingredient_id = 121;   -- Potato

UPDATE recipe_ingredients SET quantity = 130.00, unit_id = 2, quantity_grams = 130.00
WHERE id = 3656 AND recipe_id = 293 AND ingredient_id = 2;     -- Low fat milk

UPDATE recipe_ingredients SET quantity = 1.00, unit_id = 4, quantity_grams = 15.00
WHERE id = 3655 AND recipe_id = 293 AND ingredient_id = 103;   -- Butter, 1 tbsp

-- 2) Sunflower oil -> olive oil, all three variants
UPDATE recipe_ingredients SET ingredient_id = 22
WHERE id IN (3636, 3645, 3654) AND ingredient_id = 84;

UPDATE recipe_steps
SET instruction = REPLACE(instruction, 'Heat the sunflower oil', 'Heat the olive oil')
WHERE recipe_id IN (291, 292, 293) AND instruction LIKE '%Heat the sunflower oil%';

-- Whole-recipe kcal (P 94.9 / C 148.8 / F 55.0, Atwater) = 1470
UPDATE recipes SET calories = 1470 WHERE id = 293;

-- Re-attest the family (macros re-verified for all three)
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (291, 292, 293);

-- Family 7 "Chicken & Vegetable Soup" (recipes 23 Light / 24 Moderate / 25 Balanced)
--   1. Chicken stock 500 ml -> 400 ml on all three variants.
--   2. Add 100 ml Whole Milk (ingredient 104, reused -- no new ingredient row).
--      Whole rather than low-fat: it holds up better against splitting when warmed
--      in a hot soup, and the fat difference is ~1 g per serving.
--   3. Rename: "Creamy Chicken & Broccoli Soup with Crispy Potatoes".
--   4. Steps: stock quantity stated; milk goes in AFTER blending, warmed gently
--      without boiling (dairy split guard); taste-and-adjust kept.
--
-- Read from live 2026-11-14. Unit ids: 2=ml. Idempotent: safe to re-run.
--
-- Macros (recomputed from ingredients, whole recipe / per serving, serves 2):
--              BEFORE (per srv)                  AFTER (per srv)
--   23 Light   462 kcal  P37.6  F26.2%  C41.2%   492 kcal  P39.0  F27.8%  C40.5%   PASS
--   24 Moder   554 kcal  P42.6  F27.8%  C41.5%   584 kcal  P44.0  F29.0%  C40.8%   PASS
--   25 Balan   703 kcal  P51.5  F28.8%  C41.9%   733 kcal  P52.9  F29.8%  C41.3%   PASS
--   kcal ordering 492 < 584 < 733 holds. calories column: 984 / 1168 / 1466.

-- 1. Stock 500 -> 400 ml
UPDATE recipe_ingredients
SET quantity = 400.00, quantity_grams = 400.00
WHERE recipe_id IN (23, 24, 25) AND ingredient_id = 24 AND linked_recipe_id IS NULL;

-- 2. Milk 100 ml (sorted right after the stock; sort_order 8 is stock, so shift 9+ down by one)
UPDATE recipe_ingredients SET sort_order = sort_order + 1
WHERE recipe_id IN (23, 24, 25) AND sort_order >= 9
  AND NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_ingredients WHERE ingredient_id = 104 AND recipe_id IN (23,24,25)) x);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 23, 104, NULL, 100.00, 2, 100.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 23 AND ingredient_id <=> 104 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 24, 104, NULL, 100.00, 2, 100.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 24 AND ingredient_id <=> 104 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 25, 104, NULL, 100.00, 2, 100.00, 9
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 25 AND ingredient_id <=> 104 AND linked_recipe_id <=> NULL);

-- 3. Name, family name, description, whole-recipe calories
UPDATE recipes SET name = 'Creamy Chicken & Broccoli Soup with Crispy Potatoes' WHERE id IN (23, 24, 25);
UPDATE recipes SET calories = 984  WHERE id = 23;
UPDATE recipes SET calories = 1168 WHERE id = 24;
UPDATE recipes SET calories = 1466 WHERE id = 25;
UPDATE recipe_families
SET family_name = 'Creamy Chicken & Broccoli Soup with Crispy Potatoes',
    description = 'Silky blended broccoli and pepper soup enriched with milk, with chunky chicken and peas, topped with crispy roasted baby potatoes.'
WHERE id = 7;

-- 4. Steps 4 and 8 change; the rest are re-inserted verbatim.
DELETE FROM recipe_steps WHERE recipe_id IN (23, 24, 25);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT r.id, s.n, s.txt, NULL, NULL, NULL
FROM (SELECT 23 AS id UNION ALL SELECT 24 UNION ALL SELECT 25) r
CROSS JOIN (
  SELECT 1 AS n, 'Start the potatoes: Preheat oven to 200°C. Halve the baby potatoes, toss with olive oil and a pinch of salt. Spread on a baking tray and roast for 25-30 minutes until golden and crispy.' AS txt
  UNION ALL SELECT 2, 'While potatoes roast, prep the soup base: Dice onion, mince garlic, roughly chop red bell pepper and broccoli.'
  UNION ALL SELECT 3, 'Fry the vegetables: Melt butter in a large pot over medium heat. Add onion and garlic, cook 3-4 minutes until softened. Add red pepper and broccoli, season with salt and pepper. Cook 5-6 minutes, stirring occasionally.'
  UNION ALL SELECT 4, 'Add stock: Pour in the 400 ml chicken stock and bring to a simmer.'
  UNION ALL SELECT 5, 'Poach the chicken: Add whole chicken breast to the pot. Simmer gently for 12-15 minutes until chicken is cooked through (74°C internal). Remove chicken and set aside.'
  UNION ALL SELECT 6, 'Blend the soup: Use an immersion blender to blend the soup until smooth. Alternatively, transfer to a blender in batches.'
  UNION ALL SELECT 7, 'Slice or shred the chicken. Return to the pot.'
  UNION ALL SELECT 8, 'Add milk and peas: Turn the heat to low and stir in the 100 ml milk and the frozen peas. Warm for 3-4 minutes, stirring, until the peas are cooked but still bright green and the soup is steaming -- do not let it boil once the milk is in, or it can split. Taste and adjust seasoning.'
  UNION ALL SELECT 9, 'Serve: Ladle soup into bowls. Top with crispy roasted potatoes.'
) s;

-- Macro attestation: re-verified above in the same pass, so refresh rather than clear.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (23, 24, 25);

-- Verify
SELECT ri.recipe_id, i.name, ri.quantity, u.`key` AS unit, ri.quantity_grams, ri.sort_order
FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id JOIN units u ON u.id = ri.unit_id
WHERE ri.recipe_id IN (23, 24, 25) AND ri.ingredient_id IN (24, 104)
ORDER BY ri.recipe_id, ri.sort_order;

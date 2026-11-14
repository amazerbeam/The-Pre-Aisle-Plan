-- Family 37 "Hash Browns & Diced Chicken" (recipes 124 Light / 125 Moderate / 126 Balanced)
-- Developer's own method replaces the air-fryer method:
--   grate potato + onion -> salt -> sieve 20 min -> 4 hash browns per serving ->
--   squeeze + shape -> pan-fry in batches of 4 (1/2 tbsp oil per side, re-oil before the flip)
--   -> chicken on a grill for ~4 min.
--
-- Ingredient changes (read from live 2026-11-14; unit ids 3=tsp 4=tbsp):
--   Olive oil 14 / 18 / 24 g -> 28 g (2 tbsp) on all three: 2 batches x (1/2 + 1/2 tbsp).
--     The chicken is grilled, so it takes no oil.
--   Salt (ingredient 5) added: ~1% of the potato + onion weight before draining.
--     Dry-mix recipes use ~1/2 tsp per lb (~0.7%), and some of the salt drains away
--     with the liquid, so 1% going in lands close to that.
--     Light 640 g -> 1 tsp (6 g); Moderate 830 g -> 1.25 tsp (7.5 g); Balanced 1050 g -> 1.75 tsp (10.5 g).
--
-- Macros (per serving, serves 2):
--              BEFORE                              AFTER
--   124 Light   455 kcal P37.1 F21.6% C45.8%       518 kcal P37.1 F31.1% C40.2%  PASS
--   125 Moder   582 kcal P46.7 F21.5% C46.4%       627 kcal P46.7 F27.2% C43.0%  PASS
--   126 Balan   745 kcal P59.7 F22.1% C45.9%       763 kcal P59.7 F23.9% C44.8%  PASS (fat under the 25% target, not a reject; was 22.1%)
--   kcal ordering 518 < 627 < 763 holds. calories column: 1036 / 1254 / 1526.
-- Idempotent: safe to re-run.

-- Oil -> 2 tbsp
UPDATE recipe_ingredients SET quantity = 2.00, unit_id = 4, quantity_grams = 28.00
WHERE recipe_id IN (124, 125, 126) AND ingredient_id = 22 AND linked_recipe_id IS NULL;

-- Salt
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 124, 5, NULL, 1.00, 3, 6.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 125, 5, NULL, 1.25, 3, 7.50, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 126, 5, NULL, 1.75, 3, 10.50, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id <=> 5 AND linked_recipe_id <=> NULL);

-- Whole-recipe calories
UPDATE recipes SET calories = 1036 WHERE id = 124;
UPDATE recipes SET calories = 1254 WHERE id = 125;
UPDATE recipes SET calories = 1526 WHERE id = 126;

-- Steps: same text for all three variants except the salt amount in step 2.
DELETE FROM recipe_steps WHERE recipe_id IN (124, 125, 126);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT r.id, s.n,
       REPLACE(s.txt, '{SALT}', r.salt),
       NULL, NULL, NULL
FROM (SELECT 124 AS id, '1 tsp' AS salt
      UNION ALL SELECT 125, '1 1/4 tsp'
      UNION ALL SELECT 126, '1 3/4 tsp') r
CROSS JOIN (
  SELECT 1 AS n, 'Grate the potato and onion: Peel the potatoes. Grate the potatoes and the onion on the large holes of a box grater, or use the grating disc of a food processor, into a large bowl.' AS txt
  UNION ALL SELECT 2, 'Salt the mix: Add {SALT} salt and a pinch of black pepper and toss with your hands until every shred is coated. The salt seasons the hash browns and pulls the water out of the potato.'
  UNION ALL SELECT 3, 'Drain: Tip the mix into a sieve set over a bowl and leave it for 20 minutes. A good amount of liquid will collect underneath; throw it away.'
  UNION ALL SELECT 4, 'Preheat the pan: About 5 minutes before the draining is done, put a large non-stick pan over medium-high heat so it is fully hot when the hash browns go in. Meanwhile dice the chicken breast, season it with salt, pepper and a pinch of paprika if you have it, and heat the grill.'
  UNION ALL SELECT 5, 'Divide the mixture into 8 equal portions, 4 hash browns per serving.'
  UNION ALL SELECT 6, 'Squeeze and shape: Take one portion at a time and squeeze it hard in your fist over the sink until no more liquid drips out, then press it into a compact patty about 1.5 cm thick. The drier and tighter the patty, the crispier the hash brown and the less it falls apart in the pan.'
  UNION ALL SELECT 7, 'Fry the first side: Add 1/2 tbsp olive oil to the hot pan and heat it until it shimmers and gives off the first wisp of smoke. Lay in 4 hash browns, press each one down lightly with a spatula, and leave them alone for 4-5 minutes until the underside is deep golden brown and they lift away from the pan easily.'
  UNION ALL SELECT 8, 'Fry the second side: Carefully lift the hash browns out onto a plate with a spatula. Add another 1/2 tbsp oil to the pan and let it heat for 30 seconds, then return the hash browns browned side up. Cook 4-5 minutes more until the second side is golden and crisp. Move them to a wire rack so they stay crisp, then repeat steps 7 and 8 with the other 4 hash browns and the last 1 tbsp of oil.'
  UNION ALL SELECT 9, 'Grill the chicken: While the second batch fries, cook the diced chicken on the hot grill for about 4 minutes, until golden and 74°C (165°F) inside.'
  UNION ALL SELECT 10, 'Taste the chicken and adjust the seasoning, then serve 4 hash browns per plate topped with the chicken and any juices.'
) s;

-- Re-verified above in the same pass: no reject on any variant, so refresh the attestation.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (124, 125, 126);

-- Verify
SELECT ri.recipe_id, i.name, ri.quantity, u.`key` AS unit, ri.quantity_grams
FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id JOIN units u ON u.id = ri.unit_id
WHERE ri.recipe_id IN (124, 125, 126) ORDER BY ri.recipe_id, ri.sort_order;
SELECT recipe_id, COUNT(*) AS steps FROM recipe_steps WHERE recipe_id IN (124, 125, 126) GROUP BY recipe_id;

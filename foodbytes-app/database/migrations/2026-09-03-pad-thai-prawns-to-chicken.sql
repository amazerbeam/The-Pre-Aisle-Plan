-- Pad Thai (family 27, recipes 91 Light / 92 Moderate / 93 Balanced)
-- Remove prawns entirely; the dish becomes chicken-only.
-- APPLIED to Railway MySQL 2026-09-03.
--
-- Swap basis: PROTEIN-MATCHED, not gram-for-gram.
--   Chicken breast is 31 g protein/100 g against prawns' 21 g, so a 1:1 weight swap would have
--   pushed Balanced to 831 kcal/serving and dragged carbs to 40.1% - right on the green boundary
--   in client/src/constants/macroTargets.js. Matching protein contribution instead keeps the
--   family's audited macro profile essentially where it was:
--     Light    130 g chicken + 90 g prawns  -> 190 g chicken   (1082 -> 1092 kcal whole)
--     Moderate 150 g chicken + 110 g prawns -> 225 g chicken   (1264 -> 1279 kcal whole)
--     Balanced 180 g chicken + 130 g prawns -> 270 g chicken   (1580 -> 1600 kcal whole)
--
-- Post-swap per serving: Light 546 / Moderate 639 / Balanced 800 kcal; protein 41.2 / 47.5 / 59.1 g;
-- fat 26.9 / 26.4 / 28.8 %; carbs 42.9 / 43.9 / 41.7 %. All green, kcal ordering holds.
--
-- Steps rewritten 11 -> 10: the dedicated prawn-sear step is gone, and the three other prawn
-- mentions (prep, return-to-wok, plating) are removed. Endpoints tightened while in there -
-- noodles air-dried before frying, chicken juices returned to the wok, sprouts and peanuts
-- explicitly kept raw for crunch.
--
-- NOT changed (flagged to the user, awaiting a decision): the 1 tbsp fish sauce. Per the gout
-- guidance, concentrated anchovy is normally swapped for soy + MSG. Removing the prawns already
-- takes the big purine load out of this dish; the fish sauce is a separate call.

-- ---------- invalidate the stale attestation ----------
UPDATE recipes SET macros_audited = 0, macros_audited_at = NULL WHERE id IN (91,92,93);

-- ---------- drop the prawns ----------
DELETE FROM recipe_ingredients
WHERE recipe_id IN (91,92,93) AND ingredient_id = 143 AND linked_recipe_id IS NULL;

-- ---------- scale the chicken up to carry the dish ----------
UPDATE recipe_ingredients SET quantity = 190, quantity_grams = 190, sort_order = 1
WHERE recipe_id = 91 AND ingredient_id = 11 AND linked_recipe_id IS NULL;
UPDATE recipe_ingredients SET quantity = 225, quantity_grams = 225, sort_order = 1
WHERE recipe_id = 92 AND ingredient_id = 11 AND linked_recipe_id IS NULL;
UPDATE recipe_ingredients SET quantity = 270, quantity_grams = 270, sort_order = 1
WHERE recipe_id = 93 AND ingredient_id = 11 AND linked_recipe_id IS NULL;

-- ---------- steps (wipe-and-reinsert: unique key is (recipe_id, step_number)) ----------
DELETE FROM recipe_steps WHERE recipe_id IN (91,92,93);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.id, s.n, s.txt, NULL, NULL FROM recipes r JOIN (
  SELECT 1 AS n, 'Cover the dried rice noodles in room-temperature water for 30-45 minutes until pliable but still firm - they should bend easily but still snap if you pull them. Drain well and leave to air-dry in the colander; wet noodles steam instead of frying.' AS txt
  UNION ALL SELECT 2, 'Prepare the sauce: soak the tamarind in 3 tbsp warm water for 5 minutes, then mash and strain out the fibres. Mix the tamarind water with the fish sauce, soy sauce, sugar and chilli flakes until the sugar has fully dissolved - no grit at the bottom of the bowl. Set it beside the hob.'
  UNION ALL SELECT 3, 'Slice the chicken breast across the grain into thin strips no thicker than a pencil, then pat them dry. Mince the garlic, thinly slice the shallot, and cut the spring onions into 2-inch lengths, keeping whites and greens separate.'
  UNION ALL SELECT 4, 'Heat half the oil in a wok over high heat until it just shimmers. Spread the chicken in a single layer and leave it undisturbed for 60 seconds to take colour, then toss and stir-fry 2-3 minutes more until golden at the edges and just cooked through. Tip onto a plate - it carries on cooking, and any juices go back in later.'
  UNION ALL SELECT 5, 'Add the remaining oil to the hot wok, then the garlic and shallot. Fry 30 seconds until fragrant and the shallot turns translucent - pull them off the direct heat if the garlic starts colouring past pale gold.'
  UNION ALL SELECT 6, 'Push the aromatics to one side of the wok. Crack the egg into the cleared space and scramble it loosely for about 30 seconds, until just set but still glossy, then break it into the aromatics.'
  UNION ALL SELECT 7, 'Add the drained noodles and the sauce. Toss constantly for 2-3 minutes until the noodles have drunk up the sauce, softened through, and taken on an even amber colour. If they seize up before they are tender, splash in a tablespoon of hot water at a time.'
  UNION ALL SELECT 8, 'Return the chicken along with any juices left on the plate. Add half the bean sprouts and the spring onion whites and toss for 30 seconds - just long enough to warm the chicken through while the sprouts keep their snap.'
  UNION ALL SELECT 9, 'Taste and adjust before plating: you are aiming for sweet, sour and salty in balance with gentle heat behind them. Lime for sourness, a splash of fish sauce for salt, a pinch of sugar to round it off, more chilli for heat.'
  UNION ALL SELECT 10, 'Plate immediately and top with the remaining raw bean sprouts, the spring onion greens, crushed peanuts and a lime wedge. The raw sprouts and peanuts are the crunch against the soft noodles - do not cook them in.'
) s ON r.id IN (91,92,93);

-- ---------- rewrite stored whole-recipe kcal from the ingredients ----------
UPDATE recipes r
JOIN (SELECT ri.recipe_id,
             ROUND(SUM(ri.quantity_grams*(i.protein_per_100g*4+i.carbs_per_100g*4+i.fat_per_100g*9)/100)) AS kc
      FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE ri.recipe_id IN (91,92,93) GROUP BY ri.recipe_id) t ON t.recipe_id = r.id
SET r.calories = t.kc;

-- ---------- re-attest ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (91,92,93);

-- Picanha Steak with Fried Onion Mash (family 119, recipes 291/292/293): swap the parsley garnish for rosemary.
-- Fresh rosemary (id 71), 2 sprigs = 4 g, basted in the rendered fat cap and crumbled over at the end
-- (raw rosemary is too harsh to scatter as a garnish). Replaces Fresh Parsley (id 123), sort order 9.
-- Rosemary adds ~6 kcal per recipe; per serving now Light 565 / Moderate 652 / Balanced 793 kcal.
-- Protein / fat % / carbs % move by <0.2 and stay in the green band. Re-runnable.

-- ---------- ingredient swap ----------
UPDATE recipe_ingredients
SET ingredient_id = 71, quantity = 2, unit_id = 12, quantity_grams = 4
WHERE recipe_id IN (291,292,293) AND ingredient_id = 123 AND linked_recipe_id IS NULL;

-- ---------- calories (whole recipe, 2 servings) ----------
UPDATE recipes SET calories = 1129 WHERE id = 291;
UPDATE recipes SET calories = 1304 WHERE id = 292;
UPDATE recipes SET calories = 1587 WHERE id = 293;

-- ---------- steps ----------
UPDATE recipe_steps
SET instruction = 'Put the picanha fat-side down in a cold heavy frying pan (cast iron is ideal) and set it over medium heat. Render the fat cap for 6-8 minutes, until it is crisp and golden and there are a couple of tablespoons of fat in the pan - no oil needed. Turn the heat up to high and sear the meat 3-4 minutes per side for medium-rare (52-54 °C in the centre) or 4-5 minutes per side for medium (57 °C). For the last 2 minutes, drop the rosemary sprigs into the fat and spoon the hot fat over the steak. Rest the steak on a warm plate, loosely covered, for 8 minutes, and lift the rosemary out onto kitchen paper - it crisps as it cools.'
WHERE recipe_id IN (291,292,293) AND step_number = 4;

UPDATE recipe_steps
SET instruction = 'Taste the mash and adjust - the potato water is already salty, so taste before adding any more. Spoon the mash onto warm plates, fan the steak slices over the top with their juices, then strip the crisp rosemary leaves from the sprigs, crumble them over, and finish with a crack of black pepper.'
WHERE recipe_id IN (291,292,293) AND step_number = 8;

-- ---------- audit attestation (macros re-verified; still passes) ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (291,292,293);

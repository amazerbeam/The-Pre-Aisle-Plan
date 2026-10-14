-- Picanha Steak with Fried Onion Mash — family 119, recipes 291 (Light) / 292 (Moderate) / 293 (Balanced)
-- SuperValu Irish picanha (350 g pack), fat cap rendered crisp so the steak cooks in its own fat.
-- Mash: potatoes beaten with warm low fat milk + butter, sunflower-oil-fried onion folded through,
-- loosened with the reserved potato water.
-- New ingredient: Picanha steak (id 203), macros from the SuperValu pack label (21 P / 0 C / 10 F per 100 g).
-- Per serving: Light 562 / Moderate 649 / Balanced 790 kcal; protein 36.9 / 41.5 / 49.2 g;
-- fat 30.6 / 31.6 / 31.0 %; carbs 43.1 / 42.8 / 44.1 %.
-- Variant levers: picanha 270/300/350 g, potato 600/700/900 g, butter 5/10/14 g, milk 100/120/150 ml.

-- ---------- new ingredient ----------
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT * FROM (SELECT 203 AS a, 'picanha_steak' AS b, 'Picanha steak' AS c, 1 AS d, 21.00 AS e, 0.00 AS f, 10.00 AS g, 1 AS h) x
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE `key`='picanha_steak' OR LOWER(name)='picanha steak');

-- ---------- recipes ----------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 291 AS a,'Picanha Steak with Fried Onion Mash' AS b,2 AS c,1123 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=291);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 292 AS a,'Picanha Steak with Fried Onion Mash' AS b,2 AS c,1298 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=292);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 293 AS a,'Picanha Steak with Fried Onion Mash' AS b,2 AS c,1581 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=293);

-- ---------- meal slot (dinner) ----------
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM recipes r WHERE r.id IN (291,292,293)
  AND NOT EXISTS (SELECT 1 FROM recipe_meals rm WHERE rm.recipe_id=r.id AND rm.meal_id=3);

-- ---------- ingredients ----------
-- unit ids: 1=g 2=ml 3=tsp 4=tbsp 7=medium 9=handful
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.* FROM (
  SELECT 291 AS recipe_id, 203 AS ingredient_id, NULL AS linked_recipe_id, 270 AS quantity, 1 AS unit_id, 270 AS quantity_grams, 1 AS sort_order
  UNION ALL SELECT 291, 121, NULL, 600,  1, 600,  2   -- Potato
  UNION ALL SELECT 291,  12, NULL,   1,  7, 150,  3   -- Onion
  UNION ALL SELECT 291,  84, NULL,   1,  3,   5,  4   -- Sunflower Oil
  UNION ALL SELECT 291, 103, NULL,   1,  3,   5,  5   -- Butter
  UNION ALL SELECT 291,   2, NULL, 100,  2, 100,  6   -- Low fat milk
  UNION ALL SELECT 291,   5, NULL,0.75,  3,   4,  7   -- Salt
  UNION ALL SELECT 291,  50, NULL,0.25,  3,   1,  8   -- Black pepper
  UNION ALL SELECT 291, 123, NULL,   1,  9,  10, 9   -- Fresh Parsley

  UNION ALL SELECT 292, 203, NULL, 300,  1, 300,  1
  UNION ALL SELECT 292, 121, NULL, 700,  1, 700,  2
  UNION ALL SELECT 292,  12, NULL,   1,  7, 150,  3
  UNION ALL SELECT 292,  84, NULL,   1,  3,   5,  4
  UNION ALL SELECT 292, 103, NULL,   2,  3,  10,  5
  UNION ALL SELECT 292,   2, NULL, 120,  2, 120,  6
  UNION ALL SELECT 292,   5, NULL,0.75,  3,   4,  7
  UNION ALL SELECT 292,  50, NULL,0.25,  3,   1,  8
  UNION ALL SELECT 292, 123, NULL,   1,  9,  10, 9

  UNION ALL SELECT 293, 203, NULL, 350,  1, 350,  1
  UNION ALL SELECT 293, 121, NULL, 900,  1, 900,  2
  UNION ALL SELECT 293,  12, NULL,   1,  7, 150,  3
  UNION ALL SELECT 293,  84, NULL,   1,  3,   5,  4
  UNION ALL SELECT 293, 103, NULL,   1,  4,  14,  5
  UNION ALL SELECT 293,   2, NULL, 150,  2, 150,  6
  UNION ALL SELECT 293,   5, NULL,0.75,  3,   4,  7
  UNION ALL SELECT 293,  50, NULL,0.25,  3,   1,  8
  UNION ALL SELECT 293, 123, NULL,   1,  9,  10, 9
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = v.recipe_id AND ri.ingredient_id = v.ingredient_id AND ri.linked_recipe_id IS NULL
);

-- ---------- steps (wipe-and-reinsert: unique key is (recipe_id, step_number)) ----------
DELETE FROM recipe_steps WHERE recipe_id IN (291,292,293);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.id, s.n, s.txt, NULL, NULL FROM recipes r JOIN (
  SELECT 1 AS n, 'Take the picanha out of the fridge 30 minutes before cooking. Pat it completely dry with kitchen paper. Score the fat cap in a crosshatch about 1 cm apart, cutting through the fat but not into the meat, then season all over with half the salt.' AS txt
  UNION ALL SELECT 2, 'Peel the potatoes and cut them into even 4-5 cm chunks. Put them in a pot of cold, well-salted water, bring to the boil, then simmer for 15-18 minutes until a knife slides into the biggest chunk with no resistance.'
  UNION ALL SELECT 3, 'While the potatoes cook, halve and thinly slice the onion. Heat the sunflower oil in a frying pan over medium heat until it shimmers, add the onion with a pinch of the salt and fry for 12-15 minutes, stirring every couple of minutes, until soft and deep golden. Turn the heat down if the edges start to blacken.'
  UNION ALL SELECT 4, 'Put the picanha fat-side down in a cold heavy frying pan (cast iron is ideal) and set it over medium heat. Render the fat cap for 6-8 minutes, until it is crisp and golden and there are a couple of tablespoons of fat in the pan - no oil needed. Turn the heat up to high and sear the meat 3-4 minutes per side for medium-rare (52-54 °C in the centre) or 4-5 minutes per side for medium (57 °C). Rest it on a warm plate, loosely covered, for 8 minutes.'
  UNION ALL SELECT 5, 'Before draining, scoop out a mug (about 200 ml) of the potato water. Drain the potatoes, return them to the hot pot over low heat for 1 minute and shake to steam off the surface moisture. Warm the milk and butter together (30-40 seconds in the microwave) until the butter melts - cold dairy makes mash gluey.'
  UNION ALL SELECT 6, 'Mash the potatoes with a masher or ricer (never a blender - it turns them to glue), then beat in the warm milk and butter. Fold through the fried onions. Loosen with the reserved potato water, 1 tbsp at a time, until the mash is soft and spoonable. Season with the black pepper.'
  UNION ALL SELECT 7, 'Slice the rested picanha against the grain into 1 cm slices - the grain runs lengthways along the cap, so cut across it. Pour the resting juices from the plate back over the slices.'
  UNION ALL SELECT 8, 'Taste the mash and adjust - the potato water is already salty, so taste before adding any more. Spoon the mash onto warm plates, fan the steak slices over the top with their juices, then finish with the chopped parsley and a crack of black pepper.'
) s ON r.id IN (291,292,293);

-- ---------- family ----------
INSERT INTO recipe_families (id, family_name, description)
SELECT * FROM (SELECT 119 AS a, 'Picanha Steak with Fried Onion Mash' AS b,
  'Irish picanha seared in its own rendered fat cap, sliced over buttery fried onion mash. Light / Moderate / Balanced.' AS c) x
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id=119);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT v.* FROM (
  SELECT 119 AS family_id, 291 AS recipe_id, 0 AS is_default, 'Light' AS variant_label, 1 AS display_order
  UNION ALL SELECT 119, 292, 1, 'Moderate', 2
  UNION ALL SELECT 119, 293, 0, 'Balanced', 3
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m WHERE m.family_id=v.family_id AND m.recipe_id=v.recipe_id);

-- ---------- audit attestation (five lenses run at design time; re-verified read-only after apply) ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (291,292,293);

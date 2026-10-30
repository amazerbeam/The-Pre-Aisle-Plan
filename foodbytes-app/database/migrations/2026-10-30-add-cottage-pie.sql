-- Cottage Pie — family 121, recipes 297 (Light) / 298 (Moderate) / 299 (Balanced)
-- 3% fat beef mince, carrot/onion/celery, tomato paste + Worcestershire gravy, peas, cheddar-topped mash.
-- Ids skip 294-296 / family 120, which 2026-10-30-add-fureys-tomato-beef-curry.sql claims but had not been applied.
-- Per serving: Light ~538 / Moderate 620 / Balanced 744 kcal; protein 38.0 / 42.5 / 50.7 g;
-- fat 27.9 / 29.3 / 31.3 %; carbs 44.0 / 43.3 / 41.4 %.
-- Variant levers: mince 230/250/300 g, potato 360/450/560 g, butter 0.75/1/1.5 tbsp, milk 40/50/70 ml, cheddar 15/25/35 g.
-- No new ingredients. Every statement is guarded so a re-run is a no-op.

-- ---------- recipes ----------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT v.* FROM (
  SELECT 297 AS id, 'Cottage Pie' AS name, 2 AS default_servings, 1077 AS calories, 0 AS is_cheat, 1 AS is_live
  UNION ALL SELECT 298, 'Cottage Pie', 2, 1241, 0, 1
  UNION ALL SELECT 299, 'Cottage Pie', 2, 1487, 0, 1
) v
WHERE NOT EXISTS (SELECT 1 FROM recipes r WHERE r.id = v.id);

-- ---------- recipe_meals (dinner) ----------
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT v.* FROM (SELECT 297 AS recipe_id, 3 AS meal_id UNION ALL SELECT 298, 3 UNION ALL SELECT 299, 3) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_meals rm WHERE rm.recipe_id = v.recipe_id AND rm.meal_id = v.meal_id);

-- ---------- recipe_ingredients ----------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT r.recipe_id, v.ingredient_id, NULL,
       CASE r.var WHEN 'L' THEN v.qL WHEN 'M' THEN v.qM ELSE v.qB END,
       v.unit_id,
       CASE r.var WHEN 'L' THEN v.gL WHEN 'M' THEN v.gM ELSE v.gB END,
       v.sort_order
FROM (
  --           ingredient            qL    qM    qB   unit   gL     gM     gB   sort
  SELECT 125 AS ingredient_id, 230 AS qL, 250 AS qM, 300 AS qB, 1 AS unit_id, 230 AS gL, 250 AS gM, 300 AS gB, 1 AS sort_order -- Beef Mince (3% fat)
  UNION ALL SELECT  22,    2,    2,    2,  3,   10,    10,    10,   2  -- Olive oil, tsp
  UNION ALL SELECT  12,    1,    1,    1,  7,  117,   117,   117,   3  -- Onion, medium
  UNION ALL SELECT  56,    1,    1,    1,  8,  100,   100,   100,   4  -- Carrot, large
  UNION ALL SELECT  99,    1,    1,    1, 12,   50,    50,    50,   5  -- Celery, stalk
  UNION ALL SELECT  13,    2,    2,    2, 10,    7,     7,     7,   6  -- Garlic, clove
  UNION ALL SELECT  23,    2,    2,    2,  4,   30,    30,    30,   7  -- Tomato paste, tbsp
  UNION ALL SELECT  43,    1,    1,    1,  4,    8,     8,     8,   8  -- Plain flour, tbsp
  UNION ALL SELECT  39,    1,    1,    1,  4,   18,    18,    18,   9  -- Worcestershire sauce, tbsp
  UNION ALL SELECT 122,  300,  300,  300,  2,  300,   300,   300,  10  -- Beef Stock, ml
  UNION ALL SELECT  98,    4,    4,    4,  5,    2,     2,     2,  11  -- Fresh Thyme, sprigs
  UNION ALL SELECT  34,    1,    1,    1, 14,  0.3,   0.3,   0.3,  12  -- Bay leaf
  UNION ALL SELECT  16,   80,   80,   80,  1,   80,    80,    80,  13  -- Frozen peas, g
  UNION ALL SELECT 121,  360,  450,  560,  1,  360,   450,   560,  14  -- Potato, g
  UNION ALL SELECT  44, 0.75,    1,  1.5,  4, 10.5,    14,    21,  15  -- Unsalted butter, tbsp
  UNION ALL SELECT 104,   40,   50,   70,  2,   40,    50,    70,  16  -- Whole Milk, ml
  UNION ALL SELECT  90,   15,   25,   35,  1,   15,    25,    35,  17  -- Cheddar Cheese, g
  UNION ALL SELECT   5,    1,    1,    1,  3,    6,     6,     6,  18  -- Salt, tsp
  UNION ALL SELECT  50,  0.5,  0.5,  0.5,  3,  1.5,   1.5,   1.5,  19  -- Black pepper, tsp
  UNION ALL SELECT 123,    5,    5,    5,  1,    5,     5,     5,  20  -- Fresh Parsley, g
) v
CROSS JOIN (SELECT 297 AS recipe_id, 'L' AS var UNION ALL SELECT 298, 'M' UNION ALL SELECT 299, 'B') r
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = r.recipe_id AND (ri.ingredient_id <=> v.ingredient_id) AND ri.linked_recipe_id IS NULL
);

-- ---------- recipe_steps (wipe and re-insert) ----------
DELETE FROM recipe_steps WHERE recipe_id IN (297, 298, 299);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.recipe_id, s.step_number, s.instruction, NULL, NULL
FROM (
  SELECT 1 AS step_number, 'Start the potatoes. Peel and cut them into even 4 cm chunks. Put them in a pan of cold, well-salted water, bring to the boil and simmer 15-18 minutes, until a knife slides through with no resistance.' AS instruction
  UNION ALL SELECT 2, 'Brown the mince. While the potatoes cook, heat the olive oil in a wide pan over medium-high heat until it shimmers. Add the mince in one flat layer and leave it untouched for 3 minutes to brown. Break it up and cook 3-4 minutes more, until no pink remains and a brown crust (fond) has formed on the base of the pan. Lean mince releases almost no fat - that fond is your flavour.'
  UNION ALL SELECT 3, 'Sweat the vegetables. Reduce to medium heat. Add the onion, carrot and celery with a pinch of the salt and cook 6-8 minutes, scraping up the fond as they release moisture, until the onion is soft and translucent. Add the garlic for the last 60 seconds, until fragrant.'
  UNION ALL SELECT 4, 'Toast the paste and flour. Stir in the tomato paste and cook 2 minutes, until it darkens to a brick red. Sprinkle over the flour and stir 1 minute so no dry spots remain.'
  UNION ALL SELECT 5, 'Build the gravy. Add the Worcestershire, then pour in the stock a splash at a time, scraping the pan clean. Add the thyme sprigs and bay leaf. Simmer uncovered 15-20 minutes, until the gravy coats the back of a spoon and a line drawn through it slowly closes. Heat the oven to 200°C fan.'
  UNION ALL SELECT 6, 'Mash. Drain the potatoes and let them steam-dry in the colander for 2 minutes. Warm the milk (20 seconds in the microwave), return the potatoes to the pan and mash with the butter and warm milk until smooth - cold milk makes mash gluey. Season with salt and pepper, then taste and adjust.'
  UNION ALL SELECT 7, 'Finish the filling. Remove the thyme stalks and bay leaf. Stir in the frozen peas, then taste and adjust with salt, pepper or a dash more Worcestershire. Spoon into a ~20 cm baking dish.'
  UNION ALL SELECT 8, 'Top the pie. Spoon the mash around the edges first to seal in the filling, then fill the middle and spread. Rough up the surface with a fork so the ridges crisp, and scatter over the cheddar.'
  UNION ALL SELECT 9, 'Bake 20-25 minutes, until the edges bubble and the top is golden. Rest 5 minutes so the gravy sets, then finish with chopped parsley and serve.'
) s
CROSS JOIN (SELECT 297 AS recipe_id UNION ALL SELECT 298 UNION ALL SELECT 299) r;

-- ---------- family ----------
INSERT INTO recipe_families (id, family_name, description)
SELECT 121, 'Cottage Pie', 'Lean 3% beef mince in a Worcestershire and tomato gravy under a cheddar-topped mash.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 121);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT v.* FROM (
  SELECT 121 AS family_id, 297 AS recipe_id, 0 AS is_default, 'Light' AS variant_label, 1 AS display_order
  UNION ALL SELECT 121, 298, 1, 'Moderate', 2
  UNION ALL SELECT 121, 299, 0, 'Balanced', 3
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m WHERE m.family_id = v.family_id AND m.recipe_id = v.recipe_id);

-- ---------- audit sign-off (run after the inserts were verified on live, 2026-10-30) ----------
-- Five-lens audit: no findings. Recomputed whole-recipe kcal 1076 / 1241 / 1487 matches stored calories.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (297, 298, 299);

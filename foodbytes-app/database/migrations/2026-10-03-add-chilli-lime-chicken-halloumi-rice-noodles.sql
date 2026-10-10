-- Chilli Lime Chicken & Halloumi Rice Noodles — family 118, recipes 288 (Light) / 289 (Moderate) / 290 (Balanced)
-- Flat rice noodles wok-tossed with velveted chicken breast, golden-seared halloumi cubes and a
-- honey-chilli-lime glaze; broccoli, red pepper and carrot for crunch, coriander + lime to finish.
-- No new ingredients; no sub-recipes (the glaze is built in the wok, no fish sauce — gout).
-- Per serving: Light 544 / Moderate 650 / Balanced 789 kcal; protein 38.1 / 42.6 / 51.1 g;
-- fat 28.6 / 29.7 / 30.4 %; carbs 43.4 / 44.0 / 43.7 %.
-- APPLIED to Railway MySQL 2026-10-03, including these post-insert changes (all macro-neutral):
--   * soy sauce shown as 1.5 tbsp instead of 25 ml (tbsp is the majority unit for soy)
--   * step 6: olive oil heated to shimmering, not smoking (EVOO burns at wok-smoke temperatures)
--   * step 7: frozen-broccoli note (cook from frozen, microwave + pat dry, skip the water)

-- ---------- recipes ----------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 288 AS a,'Chilli Lime Chicken & Halloumi Rice Noodles' AS b,2 AS c,1088 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=288);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 289 AS a,'Chilli Lime Chicken & Halloumi Rice Noodles' AS b,2 AS c,1300 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=289);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 290 AS a,'Chilli Lime Chicken & Halloumi Rice Noodles' AS b,2 AS c,1579 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=290);

-- ---------- meal slot (dinner) ----------
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM recipes r WHERE r.id IN (288,289,290)
  AND NOT EXISTS (SELECT 1 FROM recipe_meals rm WHERE rm.recipe_id=r.id AND rm.meal_id=3);

-- ---------- ingredients ----------
-- unit ids: 1=g 2=ml 3=tsp 4=tbsp 5=piece 7=medium 9=handful 10=clove 17=pinch
-- Variant levers: chicken 175/190/230 g, halloumi 45/60/75 g, noodles 65/95/130 g,
--                 olive oil 10/14/18 g, sesame oil 5/5/6 g. Everything else is shared.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.* FROM (
  SELECT 288 AS recipe_id, 11 AS ingredient_id, NULL AS linked_recipe_id, 175 AS quantity, 1 AS unit_id, 175 AS quantity_grams, 1 AS sort_order
  UNION ALL SELECT 288, 186, NULL,  45,  1,  45,  2   -- Halloumi
  UNION ALL SELECT 288, 137, NULL,  65,  1,  65,  3   -- Flat rice noodles
  UNION ALL SELECT 288,  51, NULL, 150,  1, 150,  4   -- Broccoli
  UNION ALL SELECT 288,  42, NULL,   1,  7, 120,  5   -- Red bell pepper
  UNION ALL SELECT 288,  56, NULL,   1,  7,  80,  6   -- Carrot
  UNION ALL SELECT 288, 128, NULL,   4,  5,  40,  7   -- Spring onions
  UNION ALL SELECT 288,  13, NULL,   3, 10,  12,  8   -- Garlic
  UNION ALL SELECT 288,  14, NULL, 1.5,  3,   8,  9   -- Ginger
  UNION ALL SELECT 288,  25, NULL, 1.5,  4,  25, 10   -- Soy sauce
  UNION ALL SELECT 288,   4, NULL,   1,  4,  21, 11   -- Honey
  UNION ALL SELECT 288,  40, NULL,   2,  4,  30, 12   -- Lime juice
  UNION ALL SELECT 288, 165, NULL, 0.5,  3,   1, 13   -- Chilli flakes
  UNION ALL SELECT 288,  27, NULL,   1,  4,   8, 14   -- Cornflour
  UNION ALL SELECT 288,  24, NULL,  60,  2,  60, 15   -- Chicken stock
  UNION ALL SELECT 288,  22, NULL,   2,  3,  10, 16   -- Olive oil
  UNION ALL SELECT 288, 129, NULL,   1,  3,   5, 17   -- Sesame oil
  UNION ALL SELECT 288,  21, NULL,   1, 17, 0.5, 18   -- MSG
  UNION ALL SELECT 288,  80, NULL,   1,  9,  10, 19   -- Fresh coriander

  UNION ALL SELECT 289,  11, NULL, 190,  1, 190,  1
  UNION ALL SELECT 289, 186, NULL,  60,  1,  60,  2
  UNION ALL SELECT 289, 137, NULL,  95,  1,  95,  3
  UNION ALL SELECT 289,  51, NULL, 150,  1, 150,  4
  UNION ALL SELECT 289,  42, NULL,   1,  7, 120,  5
  UNION ALL SELECT 289,  56, NULL,   1,  7,  80,  6
  UNION ALL SELECT 289, 128, NULL,   4,  5,  40,  7
  UNION ALL SELECT 289,  13, NULL,   3, 10,  12,  8
  UNION ALL SELECT 289,  14, NULL, 1.5,  3,   8,  9
  UNION ALL SELECT 289,  25, NULL, 1.5,  4,  25, 10
  UNION ALL SELECT 289,   4, NULL,   1,  4,  21, 11
  UNION ALL SELECT 289,  40, NULL,   2,  4,  30, 12
  UNION ALL SELECT 289, 165, NULL, 0.5,  3,   1, 13
  UNION ALL SELECT 289,  27, NULL,   1,  4,   8, 14
  UNION ALL SELECT 289,  24, NULL,  60,  2,  60, 15
  UNION ALL SELECT 289,  22, NULL,   1,  4,  14, 16
  UNION ALL SELECT 289, 129, NULL,   1,  3,   5, 17
  UNION ALL SELECT 289,  21, NULL,   1, 17, 0.5, 18
  UNION ALL SELECT 289,  80, NULL,   1,  9,  10, 19

  UNION ALL SELECT 290,  11, NULL, 230,  1, 230,  1
  UNION ALL SELECT 290, 186, NULL,  75,  1,  75,  2
  UNION ALL SELECT 290, 137, NULL, 130,  1, 130,  3
  UNION ALL SELECT 290,  51, NULL, 150,  1, 150,  4
  UNION ALL SELECT 290,  42, NULL,   1,  7, 120,  5
  UNION ALL SELECT 290,  56, NULL,   1,  7,  80,  6
  UNION ALL SELECT 290, 128, NULL,   4,  5,  40,  7
  UNION ALL SELECT 290,  13, NULL,   3, 10,  12,  8
  UNION ALL SELECT 290,  14, NULL, 1.5,  3,   8,  9
  UNION ALL SELECT 290,  25, NULL, 1.5,  4,  25, 10
  UNION ALL SELECT 290,   4, NULL,   1,  4,  21, 11
  UNION ALL SELECT 290,  40, NULL,   2,  4,  30, 12
  UNION ALL SELECT 290, 165, NULL, 0.5,  3,   1, 13
  UNION ALL SELECT 290,  27, NULL,   1,  4,   8, 14
  UNION ALL SELECT 290,  24, NULL,  60,  2,  60, 15
  UNION ALL SELECT 290,  22, NULL,1.25,  4,  18, 16
  UNION ALL SELECT 290, 129, NULL,1.25,  3,   6, 17
  UNION ALL SELECT 290,  21, NULL,   1, 17, 0.5, 18
  UNION ALL SELECT 290,  80, NULL,   1,  9,  10, 19
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = v.recipe_id AND ri.ingredient_id = v.ingredient_id AND ri.linked_recipe_id IS NULL
);

-- ---------- steps (wipe-and-reinsert: unique key is (recipe_id, step_number)) ----------
DELETE FROM recipe_steps WHERE recipe_id IN (288,289,290);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.id, s.n, s.txt, NULL, NULL FROM recipes r JOIN (
  SELECT 1 AS n, 'Slice the chicken breast across the grain into 1 cm strips. Toss with 1 tsp of the soy sauce and half the cornflour and leave for 15 minutes while you prep - the light coating keeps the breast juicy in the fierce heat of the wok.' AS txt
  UNION ALL SELECT 2, 'Soak the flat rice noodles in just-boiled water for 6-8 minutes, until pliable but still firm with a white core - they finish cooking in the wok. Drain, rinse under cold water, and toss with a few drops of the sesame oil so they do not clump.'
  UNION ALL SELECT 3, 'Cut the halloumi into 1.5 cm cubes and pat them completely dry with kitchen paper. Cut the broccoli into small florets, slice the red pepper into strips, and cut the carrot into thin matchsticks. Slice the spring onions, keeping whites and greens separate.'
  UNION ALL SELECT 4, 'Whisk the glaze in a small bowl: the remaining soy sauce, honey, half the lime juice, chicken stock, chilli flakes, MSG and the remaining cornflour. Set it beside the hob.'
  UNION ALL SELECT 5, 'Heat a dry non-stick pan or wok over medium-high heat. Add the halloumi with no oil and fry for 4-5 minutes, turning every minute or so, until golden and crusted on most sides. Tip onto a plate - it softens if it sits in the sauce, so it goes back on at the very end.'
  UNION ALL SELECT 6, 'Add half the olive oil to the wok over high heat and wait until it shimmers - do not push olive oil to smoking. Lay the chicken in a single layer and leave it undisturbed for 90 seconds until the underside is golden, then toss and cook 2-3 minutes more until no pink remains in the thickest strip. Tip onto the plate with the halloumi, keeping any juices.'
  UNION ALL SELECT 7, 'Add the remaining olive oil and the broccoli with 2 tbsp water. Stir-fry for 2 minutes until the water steams off and the broccoli is bright green, then add the pepper and carrot and toss for 2 minutes more - the edges should char lightly but the vegetables should stay crisp. If using frozen broccoli, do not defrost it: microwave the frozen florets for 2-3 minutes, drain, pat dry with kitchen paper, skip the 2 tbsp water and add them to the wok together with the pepper and carrot - they are already blanched, so take them off while still bright green. Push the vegetables to one side, add the garlic, ginger and spring onion whites to the cleared space and fry 20-30 seconds until fragrant, before the garlic colours past pale gold.'
  UNION ALL SELECT 8, 'Add the noodles and toss for 1 minute to heat through. Give the glaze a stir, pour it down the hot sides of the wok and toss for 60-90 seconds until it thickens and coats every strand - it should cling to the noodles, not pool in the bottom. Add a splash of hot water if it tightens too far.'
  UNION ALL SELECT 9, 'Return the chicken and its plate juices and toss for 30 seconds to heat it through. Take the wok off the heat and stir in the remaining sesame oil and the rest of the lime juice.'
  UNION ALL SELECT 10, 'Taste and adjust. The soy brings the salt and the halloumi adds more on top, so do not add salt. If it tastes flat, add a squeeze more lime. If it is too sharp, add a few more drops of honey. For more heat, add a pinch of chilli flakes. Divide between warm bowls, scatter over the crisp halloumi, spring onion greens and torn coriander, and serve straight away while the halloumi is still crisp.'
) s ON r.id IN (288,289,290);

-- ---------- family ----------
INSERT INTO recipe_families (id, family_name, description)
SELECT * FROM (SELECT 118 AS a, 'Chilli Lime Chicken & Halloumi Rice Noodles' AS b,
  'Flat rice noodles wok-tossed with chicken, golden-seared halloumi and a honey-chilli-lime glaze. Light / Moderate / Balanced.' AS c) x
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id=118);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT v.* FROM (
  SELECT 118 AS family_id, 288 AS recipe_id, 0 AS is_default, 'Light' AS variant_label, 1 AS display_order
  UNION ALL SELECT 118, 289, 1, 'Moderate', 2
  UNION ALL SELECT 118, 290, 0, 'Balanced', 3
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m WHERE m.family_id=v.family_id AND m.recipe_id=v.recipe_id);

-- ---------- audit attestation ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (288,289,290);

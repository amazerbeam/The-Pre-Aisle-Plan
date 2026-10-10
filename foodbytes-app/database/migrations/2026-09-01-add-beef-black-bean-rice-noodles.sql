-- Beef Black Bean Rice Noodles — family 114, recipes 276 (Light) / 277 (Moderate) / 278 (Balanced)
-- Cantonese flat rice noodles with velveted sirloin and a fermented black bean (douchi) pan sauce.
-- No new ingredients; no sub-recipes (the black bean sauce is built in the wok, matching recipes 104-106).
-- APPLIED to Railway MySQL 2026-09-01.
--
-- Includes the post-insert balance fix from the same session:
--   * added 1/2 tsp salt removed from all three variants (soy + oyster + douchi already put the dish
--     at ~5.5-6 g salt/serving; the salt cellar was pure addition with nothing to correct)
--   * sugar 1 tsp -> 2 tsp, bringing douchi:sugar to ~3:1, the standard counterweight for the ferment's tang
--   * 1/2 tsp chilli flakes added with the aromatics — the dish had no heat at all and read one-note
-- Post-fix per serving: Light 555 / Moderate 647 / Balanced 781 kcal; protein 37.2 / 39.9 / 47.5 g;
-- fat 27.4 / 28.5 / 29.2 %; carbs 45.7 / 46.9 / 46.5 %. All mid-green, kcal ordering holds.

-- ---------- recipes ----------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 276 AS a,'Beef Black Bean Rice Noodles' AS b,2 AS c,1109 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=276);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 277 AS a,'Beef Black Bean Rice Noodles' AS b,2 AS c,1294 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=277);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 278 AS a,'Beef Black Bean Rice Noodles' AS b,2 AS c,1562 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=278);

-- ---------- meal slot (dinner) ----------
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM recipes r WHERE r.id IN (276,277,278)
  AND NOT EXISTS (SELECT 1 FROM recipe_meals rm WHERE rm.recipe_id=r.id AND rm.meal_id=3);

-- ---------- ingredients ----------
-- unit ids: 1=g 2=ml 3=tsp 4=tbsp 5=piece 7=medium 10=clove 17=pinch
-- Variant levers: sirloin 280/300/360 g, noodles 95/125/160 g, douchi 24/24/30 g,
--                 sunflower oil 10/14/18 g, sesame oil 6/8/10 g. Everything else is shared.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.* FROM (
  SELECT 276 AS recipe_id, 68 AS ingredient_id, NULL AS linked_recipe_id, 280 AS quantity, 1 AS unit_id, 280 AS quantity_grams, 1 AS sort_order
  UNION ALL SELECT 276, 137, NULL,  95,  1,  95,  2   -- Flat rice noodles
  UNION ALL SELECT 276, 146, NULL,   2,  4,  24,  3   -- Fermented black beans (douchi)
  UNION ALL SELECT 276,  13, NULL,   4, 10,  16,  4   -- Garlic
  UNION ALL SELECT 276,  14, NULL, 1.5,  3,   8,  5   -- Ginger
  UNION ALL SELECT 276,  12, NULL,   1,  7, 100,  6   -- Onion
  UNION ALL SELECT 276, 127, NULL,   1,  7, 120,  7   -- Green bell pepper
  UNION ALL SELECT 276, 128, NULL,   4,  5,  40,  8   -- Spring onions
  UNION ALL SELECT 276,  25, NULL,  20,  2,  20,  9   -- Soy sauce
  UNION ALL SELECT 276, 148, NULL,   1,  3,   6, 10   -- Dark soy sauce
  UNION ALL SELECT 276, 147, NULL,   1,  4,  18, 11   -- Oyster sauce
  UNION ALL SELECT 276, 130, NULL,  15,  2,  15, 12   -- Dry sherry (Shaoxing stand-in)
  UNION ALL SELECT 276,  24, NULL,  80,  2,  80, 13   -- Chicken stock
  UNION ALL SELECT 276,  36, NULL,   2,  3,   8, 14   -- Sugar
  UNION ALL SELECT 276,  27, NULL,   1,  4,   8, 15   -- Cornflour
  UNION ALL SELECT 276,  84, NULL,   2,  3,  10, 16   -- Sunflower oil
  UNION ALL SELECT 276, 129, NULL,   1,  3,   6, 17   -- Sesame oil
  UNION ALL SELECT 276, 151, NULL,0.25,  3,   1, 18   -- White pepper
  UNION ALL SELECT 276,  21, NULL,   1, 17, 0.5, 19   -- MSG
  UNION ALL SELECT 276, 165, NULL, 0.5,  3,   1, 20   -- Chilli flakes

  UNION ALL SELECT 277,  68, NULL, 300,  1, 300,  1
  UNION ALL SELECT 277, 137, NULL, 125,  1, 125,  2
  UNION ALL SELECT 277, 146, NULL,   2,  4,  24,  3
  UNION ALL SELECT 277,  13, NULL,   4, 10,  16,  4
  UNION ALL SELECT 277,  14, NULL, 1.5,  3,   8,  5
  UNION ALL SELECT 277,  12, NULL,   1,  7, 100,  6
  UNION ALL SELECT 277, 127, NULL,   1,  7, 120,  7
  UNION ALL SELECT 277, 128, NULL,   4,  5,  40,  8
  UNION ALL SELECT 277,  25, NULL,  20,  2,  20,  9
  UNION ALL SELECT 277, 148, NULL,   1,  3,   6, 10
  UNION ALL SELECT 277, 147, NULL,   1,  4,  18, 11
  UNION ALL SELECT 277, 130, NULL,  15,  2,  15, 12
  UNION ALL SELECT 277,  24, NULL,  80,  2,  80, 13
  UNION ALL SELECT 277,  36, NULL,   2,  3,   8, 14
  UNION ALL SELECT 277,  27, NULL,   1,  4,   8, 15
  UNION ALL SELECT 277,  84, NULL,   1,  4,  14, 16
  UNION ALL SELECT 277, 129, NULL, 1.5,  3,   8, 17
  UNION ALL SELECT 277, 151, NULL,0.25,  3,   1, 18
  UNION ALL SELECT 277,  21, NULL,   1, 17, 0.5, 19
  UNION ALL SELECT 277, 165, NULL, 0.5,  3,   1, 20

  UNION ALL SELECT 278,  68, NULL, 360,  1, 360,  1
  UNION ALL SELECT 278, 137, NULL, 160,  1, 160,  2
  UNION ALL SELECT 278, 146, NULL, 2.5,  4,  30,  3
  UNION ALL SELECT 278,  13, NULL,   4, 10,  16,  4
  UNION ALL SELECT 278,  14, NULL, 1.5,  3,   8,  5
  UNION ALL SELECT 278,  12, NULL,   1,  7, 100,  6
  UNION ALL SELECT 278, 127, NULL,   1,  7, 120,  7
  UNION ALL SELECT 278, 128, NULL,   4,  5,  40,  8
  UNION ALL SELECT 278,  25, NULL,  20,  2,  20,  9
  UNION ALL SELECT 278, 148, NULL,   1,  3,   6, 10
  UNION ALL SELECT 278, 147, NULL,   1,  4,  18, 11
  UNION ALL SELECT 278, 130, NULL,  15,  2,  15, 12
  UNION ALL SELECT 278,  24, NULL,  80,  2,  80, 13
  UNION ALL SELECT 278,  36, NULL,   2,  3,   8, 14
  UNION ALL SELECT 278,  27, NULL,   1,  4,   8, 15
  UNION ALL SELECT 278,  84, NULL,1.25,  4,  18, 16
  UNION ALL SELECT 278, 129, NULL,   2,  3,  10, 17
  UNION ALL SELECT 278, 151, NULL,0.25,  3,   1, 18
  UNION ALL SELECT 278,  21, NULL,   1, 17, 0.5, 19
  UNION ALL SELECT 278, 165, NULL, 0.5,  3,   1, 20
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = v.recipe_id AND ri.ingredient_id = v.ingredient_id AND ri.linked_recipe_id IS NULL
);

-- ---------- steps (wipe-and-reinsert: unique key is (recipe_id, step_number)) ----------
DELETE FROM recipe_steps WHERE recipe_id IN (276,277,278);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.id, s.n, s.txt, NULL, NULL FROM recipes r JOIN (
  SELECT 1 AS n, 'Slice the sirloin across the grain into 3-4 mm strips. Toss with 1 tsp of the light soy, the dry sherry, half the cornflour and the white pepper. Leave to velvet at room temperature for 15 minutes while you prep everything else.' AS txt
  UNION ALL SELECT 2, 'Soak the flat rice noodles in just-boiled water for 6-8 minutes, until pliable but still firm with a white core - they finish cooking in the wok. Drain, rinse under cold water to stop them, and toss with 1 tsp of the sesame oil so they do not clump.'
  UNION ALL SELECT 3, 'Rinse the fermented black beans under cold water for 10 seconds to knock back the salt, then drain. Roughly chop half of them and leave the rest whole - the chopped half perfumes the sauce, the whole ones give little salty bursts.'
  UNION ALL SELECT 4, 'Whisk the sauce in a small bowl: the remaining light soy, the dark soy, oyster sauce, sugar, chicken stock, MSG and the remaining cornflour. Set it beside the hob - once the wok is going there is no time to measure.'
  UNION ALL SELECT 5, 'Get the wok ripping hot - a flicked drop of water should vanish on contact. Add half the sunflower oil, pat the surface marinade off the beef, and lay it in a single layer. Leave it undisturbed 60-90 seconds until the underside is deeply browned, toss for 30 seconds more, then tip onto a plate. It should still be pink inside; it goes back in later.'
  UNION ALL SELECT 6, 'Add the remaining sunflower oil to the wok. Stir-fry the onion and green pepper over high heat for about 2 minutes, until the edges take some char but the centres stay crisp. Push them to one side, drop the garlic, ginger, chilli flakes and black beans into the cleared space and fry 20-30 seconds until fragrant - pull them into the vegetables before the garlic goes past pale gold.'
  UNION ALL SELECT 7, 'Add the drained noodles and toss for 1 minute to heat through, loosening them with tongs. Pour the sauce down the hot sides of the wok and toss constantly for 60-90 seconds until it thickens and glosses every strand - it should cling to the noodles, not pool in the bottom. Splash in a tablespoon of hot water if it tightens too far.'
  UNION ALL SELECT 8, 'Return the beef along with any juices left on the plate, add the sliced spring onion whites, and toss for 30 seconds just to warm the beef through - any longer and it goes grey and tough. Take the wok off the heat and stir through the remaining sesame oil.'
  UNION ALL SELECT 9, 'Taste and adjust. The soy, oyster sauce and black beans carry all the salt this dish needs, so do not reach for the salt cellar - if it reads flat it wants a pinch more MSG or a few drops of dark soy for depth and colour, and a pinch more sugar if the black beans are dominating. Plate into warm bowls, scatter the spring onion greens over the top, and serve immediately.'
) s ON r.id IN (276,277,278);

-- ---------- family ----------
INSERT INTO recipe_families (id, family_name, description)
SELECT * FROM (SELECT 114 AS a, 'Beef Black Bean Rice Noodles' AS b,
  'Cantonese-style flat rice noodles wok-tossed with velveted sirloin and a fermented black bean sauce. Light / Moderate / Balanced.' AS c) x
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id=114);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT v.* FROM (
  SELECT 114 AS family_id, 276 AS recipe_id, 0 AS is_default, 'Light' AS variant_label, 1 AS display_order
  UNION ALL SELECT 114, 277, 1, 'Moderate', 2
  UNION ALL SELECT 114, 278, 0, 'Balanced', 3
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m WHERE m.family_id=v.family_id AND m.recipe_id=v.recipe_id);

-- ---------- audit attestation ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (276,277,278);

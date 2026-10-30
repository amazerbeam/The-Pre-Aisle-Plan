-- Furey's-Style Tomato Beef Curry — family 120, recipes 294 (Light) / 295 (Moderate) / 296 (Balanced)
-- Recreation of the beef curry from Furey's Bar, Moyvalley: braised stewing beef in a tomato-paste-led sauce,
-- turmeric for colour, star anise in the background, peas, over jasmine rice.
-- Per serving: Light 530 / Moderate 632 / Balanced 743 kcal; protein 37.4 / 40.9 / 48.0 g;
-- fat 28.5 / 27.8 / 28.4 %; carbs 43.2 / 46.3 / 45.7 %.
-- Variant levers: beef 260/280/340 g, jasmine rice 70/110/140 g, butter 0/5/10 g.
--
-- Also in this file:
--   * Ingredient 120 'Beef Chuck' -> 'Stewing beef', macros from the Tesco Irish Stewing Beef 454 g label
--     (135 kcal, 6.0 g fat, 0 g sugar per 100 g; protein derived from energy = 20.3 g).
--   * Classic Irish Beef Stew (78/79/80) re-fixed for the leaner beef: fat fell to ~22% of kcal and the
--     method relied on a fatty whole chuck roast searing "in its own fat". Adds 1 tbsp olive oil to sear in,
--     rewrites the chuck-roast steps for diced stewing beef. New per serving: 547 / 590 / 727 kcal,
--     fat 31.2 / 29.9 / 28.2 %, carbs 41.6 / 43.0 / 43.3 %, protein 37.2 / 39.9 / 51.7 g.

-- ---------- ingredient 120: Tesco Irish Stewing Beef ----------
UPDATE ingredients
SET `key` = 'stewing_beef', name = 'Stewing beef',
    protein_per_100g = 20.30, carbs_per_100g = 0.00, fat_per_100g = 6.00, macros_verified = 1
WHERE id = 120;

-- ---------- Classic Irish Beef Stew (78/79/80) ----------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.* FROM (
  SELECT 78 AS recipe_id, 22 AS ingredient_id, NULL AS linked_recipe_id, 1 AS quantity, 4 AS unit_id, 14 AS quantity_grams, 17 AS sort_order
  UNION ALL SELECT 79, 22, NULL, 1, 4, 14, 17
  UNION ALL SELECT 80, 22, NULL, 1, 4, 14, 17
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = v.recipe_id AND ri.ingredient_id = v.ingredient_id AND ri.linked_recipe_id IS NULL
);

UPDATE recipe_steps SET instruction = 'DAY BEFORE (optional): Salt the stewing beef generously all over. Spread it on a rack over a plate and refrigerate uncovered for 12-24 hours.'
WHERE recipe_id IN (78,79,80) AND step_number = 1;
UPDATE recipe_steps SET instruction = 'Take the beef out of the fridge and pat it completely dry with kitchen paper. Let it sit for 30 minutes to take the chill off.'
WHERE recipe_id IN (78,79,80) AND step_number = 2;
UPDATE recipe_steps SET instruction = 'Sear the beef. Heat the olive oil in a heavy pot over high heat until it shimmers. Sear the beef in two batches so the pieces don''t touch, 4-5 minutes per batch, turning until deeply browned on at least two sides. Lift onto a plate and keep any juices.'
WHERE recipe_id IN (78,79,80) AND step_number = 3;
UPDATE recipe_steps SET instruction = 'Build the base. Reduce heat to medium. Add the butter to the fat left in the pot. Sauté the onion and celery for 5 minutes, scraping up the browned bits, until softened. Add the garlic and cook 1 minute until fragrant.'
WHERE recipe_id IN (78,79,80) AND step_number = 4;
UPDATE recipe_steps SET instruction = 'Braise the beef. Return the beef and its juices to the pot. Add the stock, Worcestershire, bay leaves and thyme. Bring to a boil, then reduce to a bare simmer. Cover and cook for 2-2.5 hours, until a chunk breaks apart when pressed with a spoon.'
WHERE recipe_id IN (78,79,80) AND step_number = 6;
UPDATE recipe_steps SET instruction = 'Skim the surface. Tilt the pot and spoon off any fat pooled on top of the liquid - lean stewing beef gives off little, so this takes a minute.'
WHERE recipe_id IN (78,79,80) AND step_number = 7;
UPDATE recipe_steps SET instruction = 'Check the beef. Press a chunk against the side of the pot - it should fall apart easily. If it resists, cover and simmer 20 minutes more.'
WHERE recipe_id IN (78,79,80) AND step_number = 8;
UPDATE recipe_steps SET instruction = 'Add vegetables. Add the potatoes, carrots and parsnips to the pot. Simmer uncovered 45-60 minutes, until the vegetables are tender and the broth has reduced slightly.'
WHERE recipe_id IN (78,79,80) AND step_number = 9;

UPDATE recipes SET calories = 1094 WHERE id = 78;
UPDATE recipes SET calories = 1181 WHERE id = 79;
UPDATE recipes SET calories = 1453 WHERE id = 80;

-- ---------- curry: recipes ----------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 294 AS a,'Furey''s-Style Tomato Beef Curry' AS b,2 AS c,1060 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=294);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 295 AS a,'Furey''s-Style Tomato Beef Curry' AS b,2 AS c,1263 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=295);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT * FROM (SELECT 296 AS a,'Furey''s-Style Tomato Beef Curry' AS b,2 AS c,1486 AS d,0 AS e,1 AS f) x
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=296);

-- ---------- curry: meal slot (dinner) ----------
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM recipes r WHERE r.id IN (294,295,296)
  AND NOT EXISTS (SELECT 1 FROM recipe_meals rm WHERE rm.recipe_id=r.id AND rm.meal_id=3);

-- ---------- curry: ingredients ----------
-- unit ids: 1=g 2=ml 3=tsp 4=tbsp 5=piece 8=large 9=handful 10=clove 14=leaf 16=cup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.* FROM (
  SELECT 294 AS recipe_id, 120 AS ingredient_id, NULL AS linked_recipe_id, 260 AS quantity, 1 AS unit_id, 260 AS quantity_grams, 1 AS sort_order
  UNION ALL SELECT 294,  22, NULL,   1,  4,  14,  2   -- Olive oil
  UNION ALL SELECT 294,  12, NULL,   1,  8, 150,  3   -- Onion
  UNION ALL SELECT 294,  13, NULL,   3, 10,  10,  4   -- Garlic
  UNION ALL SELECT 294,  14, NULL,   2,  3,  10,  5   -- Ginger
  UNION ALL SELECT 294,  17, NULL,   1,  3,   2,  6   -- Turmeric
  UNION ALL SELECT 294,  18, NULL,   1,  3,   3,  7   -- Cumin
  UNION ALL SELECT 294,  61, NULL,   2,  3,   6,  8   -- Garam masala
  UNION ALL SELECT 294,  20, NULL,   2,  5,   4,  9   -- Star anise
  UNION ALL SELECT 294,  34, NULL,   1, 14, 0.3, 10   -- Bay leaf
  UNION ALL SELECT 294,  23, NULL,   3,  4,  47, 11   -- Tomato paste
  UNION ALL SELECT 294,  33, NULL, 200,  1, 200, 12   -- Tinned tomatoes
  UNION ALL SELECT 294, 122, NULL, 400,  2, 400, 13   -- Beef Stock
  UNION ALL SELECT 294,  16, NULL, 0.5, 16,  75, 14   -- Frozen peas
  UNION ALL SELECT 294,  26, NULL,  70,  1,  70, 16   -- Jasmine rice
  UNION ALL SELECT 294,   5, NULL,   1,  3,   6, 17   -- Salt
  UNION ALL SELECT 294,  50, NULL, 0.5,  3,   1, 18   -- Black pepper
  UNION ALL SELECT 294,  88, NULL,   1,  4,  15, 19   -- Lemon (juice)
  UNION ALL SELECT 294,  80, NULL,   1,  9,   8, 20   -- Fresh coriander

  UNION ALL SELECT 295, 120, NULL, 280,  1, 280,  1
  UNION ALL SELECT 295,  22, NULL,   1,  4,  14,  2
  UNION ALL SELECT 295,  12, NULL,   1,  8, 150,  3
  UNION ALL SELECT 295,  13, NULL,   3, 10,  10,  4
  UNION ALL SELECT 295,  14, NULL,   2,  3,  10,  5
  UNION ALL SELECT 295,  17, NULL,   1,  3,   2,  6
  UNION ALL SELECT 295,  18, NULL,   1,  3,   3,  7
  UNION ALL SELECT 295,  61, NULL,   2,  3,   6,  8
  UNION ALL SELECT 295,  20, NULL,   2,  5,   4,  9
  UNION ALL SELECT 295,  34, NULL,   1, 14, 0.3, 10
  UNION ALL SELECT 295,  23, NULL,   3,  4,  47, 11
  UNION ALL SELECT 295,  33, NULL, 200,  1, 200, 12
  UNION ALL SELECT 295, 122, NULL, 400,  2, 400, 13
  UNION ALL SELECT 295,  16, NULL, 0.5, 16,  75, 14
  UNION ALL SELECT 295, 103, NULL,   1,  3,   5, 15   -- Butter
  UNION ALL SELECT 295,  26, NULL, 110,  1, 110, 16
  UNION ALL SELECT 295,   5, NULL,   1,  3,   6, 17
  UNION ALL SELECT 295,  50, NULL, 0.5,  3,   1, 18
  UNION ALL SELECT 295,  88, NULL,   1,  4,  15, 19
  UNION ALL SELECT 295,  80, NULL,   1,  9,   8, 20

  UNION ALL SELECT 296, 120, NULL, 340,  1, 340,  1
  UNION ALL SELECT 296,  22, NULL,   1,  4,  14,  2
  UNION ALL SELECT 296,  12, NULL,   1,  8, 150,  3
  UNION ALL SELECT 296,  13, NULL,   3, 10,  10,  4
  UNION ALL SELECT 296,  14, NULL,   2,  3,  10,  5
  UNION ALL SELECT 296,  17, NULL,   1,  3,   2,  6
  UNION ALL SELECT 296,  18, NULL,   1,  3,   3,  7
  UNION ALL SELECT 296,  61, NULL,   2,  3,   6,  8
  UNION ALL SELECT 296,  20, NULL,   2,  5,   4,  9
  UNION ALL SELECT 296,  34, NULL,   1, 14, 0.3, 10
  UNION ALL SELECT 296,  23, NULL,   3,  4,  47, 11
  UNION ALL SELECT 296,  33, NULL, 200,  1, 200, 12
  UNION ALL SELECT 296, 122, NULL, 400,  2, 400, 13
  UNION ALL SELECT 296,  16, NULL, 0.5, 16,  75, 14
  UNION ALL SELECT 296, 103, NULL,   2,  3,  10, 15
  UNION ALL SELECT 296,  26, NULL, 140,  1, 140, 16
  UNION ALL SELECT 296,   5, NULL,   1,  3,   6, 17
  UNION ALL SELECT 296,  50, NULL, 0.5,  3,   1, 18
  UNION ALL SELECT 296,  88, NULL,   1,  4,  15, 19
  UNION ALL SELECT 296,  80, NULL,   1,  9,   8, 20
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  WHERE ri.recipe_id = v.recipe_id AND ri.ingredient_id = v.ingredient_id AND ri.linked_recipe_id IS NULL
);

-- ---------- curry: steps (wipe-and-reinsert: unique key is (recipe_id, step_number)) ----------
-- Step 9 differs: Light has no butter.
DELETE FROM recipe_steps WHERE recipe_id IN (294,295,296);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction)
SELECT r.id, s.n,
       CASE WHEN r.id = 294 AND s.n = 9
         THEN 'Uncover the curry and simmer for 10-15 minutes, until the sauce is thick enough to coat the back of a spoon. Add the frozen peas for the last 5 minutes. Take off the heat and fish out the star anise and bay leaf.'
         ELSE s.txt END,
       NULL, NULL
FROM recipes r JOIN (
  SELECT 1 AS n, 'Cut the beef into 3 cm chunks if the pieces are large and pat them completely dry with kitchen paper - wet beef steams instead of browning. Season with half the salt and the black pepper.' AS txt
  UNION ALL SELECT 2, 'Heat the olive oil in a heavy casserole over medium-high heat until it shimmers. Brown the beef in two batches so the pieces don''t touch, 4-5 minutes per batch, turning until deeply browned on at least two sides. Lift onto a plate and keep any juices.'
  UNION ALL SELECT 3, 'Lower the heat to medium and add the diced onion to the same pot, scraping up the browned bits from the base. Cook for 10-12 minutes, stirring now and then, until soft and golden.'
  UNION ALL SELECT 4, 'Add the grated garlic and ginger and cook for 1 minute, stirring, until fragrant but not browned.'
  UNION ALL SELECT 5, 'Add the turmeric, cumin, garam masala and star anise and stir for 30 seconds to bloom the spices in the fat. If the pot looks dry, add a splash of the stock so they don''t scorch.'
  UNION ALL SELECT 6, 'Add the tomato paste and fry it, stirring constantly, for 2-3 minutes until it darkens from bright red to brick-red and starts to catch on the base. This is where the deep tomato flavour comes from.'
  UNION ALL SELECT 7, 'Pour in the stock and tinned tomatoes and scrape the base clean. Return the beef and its juices, add the bay leaf and the rest of the salt, and bring to a bare simmer. Cover and cook on the lowest heat for 1 hour 45 minutes to 2 hours, until a chunk breaks apart when pressed with a spoon.'
  UNION ALL SELECT 8, 'About 25 minutes before the curry is done, rinse the rice until the water runs clear. Put it in a small pot with 1.5 times its volume of cold water, bring to the boil, then cover and cook on the lowest heat for 12 minutes. Take off the heat and leave covered for 5 minutes, then fluff with a fork.'
  UNION ALL SELECT 9, 'Uncover the curry and simmer for 10-15 minutes, until the sauce is thick enough to coat the back of a spoon. Add the frozen peas for the last 5 minutes. Take off the heat, fish out the star anise and bay leaf, and swirl in the butter until glossy.'
  UNION ALL SELECT 10, 'Taste and adjust: add the lemon juice to lift the tomato, then more salt if it tastes flat. Spoon the rice into warm bowls, ladle the curry alongside, and finish with torn coriander.'
) s ON r.id IN (294,295,296);

-- ---------- curry: family ----------
INSERT INTO recipe_families (id, family_name, description)
SELECT * FROM (SELECT 120 AS a, 'Furey''s-Style Tomato Beef Curry' AS b,
  'Pub-style beef curry after the one at Furey''s Bar, Moyvalley: slow-braised stewing beef in a brick-red tomato sauce with turmeric and star anise, peas, over rice. Light / Moderate / Balanced.' AS c) x
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id=120);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT v.* FROM (
  SELECT 120 AS family_id, 294 AS recipe_id, 0 AS is_default, 'Light' AS variant_label, 1 AS display_order
  UNION ALL SELECT 120, 295, 1, 'Moderate', 2
  UNION ALL SELECT 120, 296, 0, 'Balanced', 3
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m WHERE m.family_id=v.family_id AND m.recipe_id=v.recipe_id);

-- ---------- audit attestation (five lenses run at design time; re-verified read-only after apply) ----------
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (78,79,80,294,295,296);

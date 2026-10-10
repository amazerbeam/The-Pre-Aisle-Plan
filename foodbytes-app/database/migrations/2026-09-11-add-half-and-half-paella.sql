-- Half & Half Paella with Moorish Meatballs - Light/Moderate/Balanced (family 117, recipes 285-287)
-- An homage to The Paella Guys (Dublin market stalls, est. 2009, Ian Marconi - ex-Moro): their
-- "half and half" box of chicken & chorizo paella with garlicky Moorish meatballs. The original
-- recipe was never published; this is a Moro-style reconstruction. Meatballs are lamb per the user.
-- Sized for an 18" (46 cm) paella pan, 8 servings.
-- CHEAT MEAL: is_cheat = 1, macros_audited stays 0 (fat 36-40% of kcal, carbs 34-38% by design).
-- Chorizo is SuperValu Signature Tastes Riojan Chorizo Cular (23 P / 1.5 C / 39 F per 100 g) - an
-- exact match for the existing Chorizo row (73). Paella oil is cut back because the chorizo renders its own fat.
-- No saffron: the user cannot source it, so the stock is coloured with 2 tsp turmeric + 2 tsp smoked
-- paprika (the same stand-in used by Paella de pollo 87-89, scaled x4 for the 18" pan).
-- New ingredient: Ground coriander (only Fresh coriander existed).
-- All inserts guarded - re-running is a no-op.

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 202, 'ground_coriander', 'Ground coriander', 8, 12.37, 54.99, 17.77, 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE `key` = 'ground_coriander' OR LOWER(name) = 'ground coriander');

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 285, 'Half & Half Paella with Moorish Meatballs', 8, 6901, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 285);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 286, 'Half & Half Paella with Moorish Meatballs', 8, 7799, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 286);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 287, 'Half & Half Paella with Moorish Meatballs', 8, 9140, 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 287);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT r.id, 3 FROM (SELECT 285 AS id UNION SELECT 286 UNION SELECT 287) r
WHERE NOT EXISTS (SELECT 1 FROM recipe_meals m WHERE m.recipe_id = r.id AND m.meal_id = 3);

-- Ingredients (no linked extras: sofrito uses grated fresh tomato; no stock recipe exists)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.recipe_id, v.ingredient_id, NULL, v.quantity, v.unit_id, v.quantity_grams, v.sort_order FROM (
  SELECT 285 AS recipe_id, 132 AS ingredient_id, 560.00 AS quantity, 1 AS unit_id, 560.00 AS quantity_grams, 1 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 41 AS ingredient_id, 700.00 AS quantity, 1 AS unit_id, 700.00 AS quantity_grams, 2 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 73 AS ingredient_id, 150.00 AS quantity, 1 AS unit_id, 150.00 AS quantity_grams, 3 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 166 AS ingredient_id, 700.00 AS quantity, 1 AS unit_id, 700.00 AS quantity_grams, 4 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 22 AS ingredient_id, 4.00 AS quantity, 4 AS unit_id, 56.00 AS quantity_grams, 5 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 12 AS ingredient_id, 3.00 AS quantity, 7 AS unit_id, 450.00 AS quantity_grams, 6 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 42 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 300.00 AS quantity_grams, 7 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 13 AS ingredient_id, 10.00 AS quantity, 10 AS unit_id, 30.00 AS quantity_grams, 8 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 48 AS ingredient_id, 2.00 AS quantity, 7 AS unit_id, 250.00 AS quantity_grams, 9 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 33 AS ingredient_id, 2.00 AS quantity, 15 AS unit_id, 800.00 AS quantity_grams, 10 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 23 AS ingredient_id, 1.00 AS quantity, 4 AS unit_id, 16.00 AS quantity_grams, 11 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 24 AS ingredient_id, 1700.00 AS quantity, 2 AS unit_id, 1700.00 AS quantity_grams, 12 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 130 AS ingredient_id, 100.00 AS quantity, 2 AS unit_id, 100.00 AS quantity_grams, 13 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 17 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 14 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 46 AS ingredient_id, 5.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 15 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 18 AS ingredient_id, 3.00 AS quantity, 3 AS unit_id, 6.00 AS quantity_grams, 16 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ground_coriander') AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 17 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 19 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 2.50 AS quantity_grams, 18 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 165 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 19 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 63 AS ingredient_id, 50.00 AS quantity, 1 AS unit_id, 50.00 AS quantity_grams, 20 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 59 AS ingredient_id, 1.00 AS quantity, 5 AS unit_id, 50.00 AS quantity_grams, 21 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 16 AS ingredient_id, 1.00 AS quantity, 16 AS unit_id, 150.00 AS quantity_grams, 22 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 4 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 7.00 AS quantity_grams, 23 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 123 AS ingredient_id, 1.00 AS quantity, 9 AS unit_id, 20.00 AS quantity_grams, 24 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 88 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 60.00 AS quantity_grams, 25 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 5 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 26 AS sort_order
  UNION ALL
  SELECT 285 AS recipe_id, 50 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 27 AS sort_order
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = v.recipe_id AND (ri.ingredient_id <=> v.ingredient_id) AND ri.linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.recipe_id, v.ingredient_id, NULL, v.quantity, v.unit_id, v.quantity_grams, v.sort_order FROM (
  SELECT 286 AS recipe_id, 132 AS ingredient_id, 600.00 AS quantity, 1 AS unit_id, 600.00 AS quantity_grams, 1 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 41 AS ingredient_id, 800.00 AS quantity, 1 AS unit_id, 800.00 AS quantity_grams, 2 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 73 AS ingredient_id, 200.00 AS quantity, 1 AS unit_id, 200.00 AS quantity_grams, 3 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 166 AS ingredient_id, 800.00 AS quantity, 1 AS unit_id, 800.00 AS quantity_grams, 4 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 22 AS ingredient_id, 5.00 AS quantity, 4 AS unit_id, 70.00 AS quantity_grams, 5 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 12 AS ingredient_id, 3.00 AS quantity, 7 AS unit_id, 450.00 AS quantity_grams, 6 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 42 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 300.00 AS quantity_grams, 7 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 13 AS ingredient_id, 10.00 AS quantity, 10 AS unit_id, 30.00 AS quantity_grams, 8 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 48 AS ingredient_id, 2.00 AS quantity, 7 AS unit_id, 250.00 AS quantity_grams, 9 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 33 AS ingredient_id, 2.00 AS quantity, 15 AS unit_id, 800.00 AS quantity_grams, 10 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 23 AS ingredient_id, 1.00 AS quantity, 4 AS unit_id, 16.00 AS quantity_grams, 11 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 24 AS ingredient_id, 1800.00 AS quantity, 2 AS unit_id, 1800.00 AS quantity_grams, 12 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 130 AS ingredient_id, 100.00 AS quantity, 2 AS unit_id, 100.00 AS quantity_grams, 13 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 17 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 14 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 46 AS ingredient_id, 5.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 15 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 18 AS ingredient_id, 3.00 AS quantity, 3 AS unit_id, 6.00 AS quantity_grams, 16 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ground_coriander') AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 17 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 19 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 2.50 AS quantity_grams, 18 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 165 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 19 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 63 AS ingredient_id, 60.00 AS quantity, 1 AS unit_id, 60.00 AS quantity_grams, 20 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 59 AS ingredient_id, 1.00 AS quantity, 5 AS unit_id, 50.00 AS quantity_grams, 21 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 16 AS ingredient_id, 1.00 AS quantity, 16 AS unit_id, 150.00 AS quantity_grams, 22 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 4 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 7.00 AS quantity_grams, 23 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 123 AS ingredient_id, 1.00 AS quantity, 9 AS unit_id, 20.00 AS quantity_grams, 24 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 88 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 60.00 AS quantity_grams, 25 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 5 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 26 AS sort_order
  UNION ALL
  SELECT 286 AS recipe_id, 50 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 27 AS sort_order
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = v.recipe_id AND (ri.ingredient_id <=> v.ingredient_id) AND ri.linked_recipe_id IS NULL);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT v.recipe_id, v.ingredient_id, NULL, v.quantity, v.unit_id, v.quantity_grams, v.sort_order FROM (
  SELECT 287 AS recipe_id, 132 AS ingredient_id, 700.00 AS quantity, 1 AS unit_id, 700.00 AS quantity_grams, 1 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 41 AS ingredient_id, 900.00 AS quantity, 1 AS unit_id, 900.00 AS quantity_grams, 2 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 73 AS ingredient_id, 300.00 AS quantity, 1 AS unit_id, 300.00 AS quantity_grams, 3 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 166 AS ingredient_id, 900.00 AS quantity, 1 AS unit_id, 900.00 AS quantity_grams, 4 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 22 AS ingredient_id, 6.00 AS quantity, 4 AS unit_id, 84.00 AS quantity_grams, 5 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 12 AS ingredient_id, 3.00 AS quantity, 7 AS unit_id, 450.00 AS quantity_grams, 6 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 42 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 300.00 AS quantity_grams, 7 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 13 AS ingredient_id, 10.00 AS quantity, 10 AS unit_id, 30.00 AS quantity_grams, 8 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 48 AS ingredient_id, 2.00 AS quantity, 7 AS unit_id, 250.00 AS quantity_grams, 9 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 33 AS ingredient_id, 2.00 AS quantity, 15 AS unit_id, 800.00 AS quantity_grams, 10 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 23 AS ingredient_id, 1.00 AS quantity, 4 AS unit_id, 16.00 AS quantity_grams, 11 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 24 AS ingredient_id, 2100.00 AS quantity, 2 AS unit_id, 2100.00 AS quantity_grams, 12 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 130 AS ingredient_id, 100.00 AS quantity, 2 AS unit_id, 100.00 AS quantity_grams, 13 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 17 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 14 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 46 AS ingredient_id, 5.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 15 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 18 AS ingredient_id, 3.00 AS quantity, 3 AS unit_id, 6.00 AS quantity_grams, 16 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, (SELECT id FROM ingredients WHERE `key` = 'ground_coriander') AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 4.00 AS quantity_grams, 17 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 19 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 2.50 AS quantity_grams, 18 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 165 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 19 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 63 AS ingredient_id, 70.00 AS quantity, 1 AS unit_id, 70.00 AS quantity_grams, 20 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 59 AS ingredient_id, 1.00 AS quantity, 5 AS unit_id, 50.00 AS quantity_grams, 21 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 16 AS ingredient_id, 1.00 AS quantity, 16 AS unit_id, 150.00 AS quantity_grams, 22 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 4 AS ingredient_id, 1.00 AS quantity, 3 AS unit_id, 7.00 AS quantity_grams, 23 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 123 AS ingredient_id, 1.00 AS quantity, 9 AS unit_id, 20.00 AS quantity_grams, 24 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 88 AS ingredient_id, 2.00 AS quantity, 5 AS unit_id, 60.00 AS quantity_grams, 25 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 5 AS ingredient_id, 2.00 AS quantity, 3 AS unit_id, 12.00 AS quantity_grams, 26 AS sort_order
  UNION ALL
  SELECT 287 AS recipe_id, 50 AS ingredient_id, 0.50 AS quantity, 3 AS unit_id, 1.00 AS quantity_grams, 27 AS sort_order
) v
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = v.recipe_id AND (ri.ingredient_id <=> v.ingredient_id) AND ri.linked_recipe_id IS NULL);

-- Steps
DELETE FROM recipe_steps WHERE recipe_id IN (285,286,287);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(285, 1, 'Grate 1 onion and crush 3 garlic cloves. In a large bowl combine the 700 g lamb mince, grated onion, garlic, 50 g breadcrumbs, the egg, 2 tsp cumin, 2 tsp ground coriander, 1/2 tsp cinnamon, half the chopped parsley, 1 tsp salt and a good grind of pepper. Mix with your hands until just combined.', 'Do not overwork it or the meatballs turn dense. Fry a thumbnail of the mix and taste it before you roll - this is your only chance to fix the seasoning.', NULL, NULL),
(285, 2, 'Roll into about 28 meatballs of roughly 35 g each and chill them for 15 minutes.', 'Chilling firms them up so they hold their shape when browned.', NULL, NULL),
(285, 3, 'Heat 2 tbsp olive oil in a large deep casserole over medium-high until it shimmers. Brown the meatballs in two batches, 5-6 minutes per batch, turning until coloured all over. They do not need to be cooked through. Lift out onto a plate.', 'Crowding the pan steams them grey. Two batches, space between each ball.', NULL, NULL),
(285, 4, 'Drop to medium. Add 1 tbsp olive oil and 1 finely diced onion to the same casserole and cook 8-10 minutes until soft and golden. Add 3 sliced garlic cloves, 1 tsp cumin, 1/2 tsp cinnamon, 1 tsp smoked paprika and the chilli flakes and cook for 1 minute until fragrant. Stir in the tomato paste and cook 1 minute more.', NULL, NULL, NULL),
(285, 5, 'Pour in the 100 ml dry sherry and let it bubble, scraping up the browned bits, until reduced by half (about 2 minutes). Add both tins of tomatoes and the honey and simmer 15 minutes.', NULL, NULL, NULL),
(285, 6, 'Return the meatballs and any juices from the plate. Simmer covered for 15 minutes, then uncovered for 10 minutes, until the sauce is thick enough to coat the back of a spoon and the meatballs read 71 C in the centre. Taste and adjust the salt, then keep warm on the lowest heat.', 'The sauce improves while it waits - make the meatballs first and they will be at their best when the paella is ready.', NULL, NULL),
(285, 7, 'Meanwhile, bring the 1700 ml chicken stock to a simmer in a pot, whisk in 2 tsp turmeric and 2 tsp smoked paprika and keep it hot. Taste it: it should be slightly too salty, because the rice will absorb it.', 'Turmeric and smoked paprika stand in for saffron here: the turmeric carries the colour, the paprika the savoury depth.', NULL, NULL),
(285, 8, 'Cut the 700 g chicken thighs into 4 cm chunks, pat completely dry and season with salt. Slice 150 g chorizo (3/4 of the 200 g pack) into 5 mm rounds. Dice 1 onion, cut the peppers into strips, and grate the 2 fresh tomatoes on a box grater, discarding the skins.', 'This is a dry-cured chorizo cular, so slice it thin - thick chunks stay chewy and hold their fat.', NULL, NULL),
(285, 9, 'Set the 18 inch (46 cm) paella pan over two burners or a paella ring with 1 tbsp olive oil on medium-low. Render the chorizo gently for 2-3 minutes until it releases its red oil, then lift it out. If the fat is pooling across the pan, spoon a little off before the next step.', 'Cured chorizo scorches fast and turns bitter. Keep it gentle - you want the oil, not a crisp.', NULL, NULL),
(285, 10, 'Turn the heat to medium-high and brown the chicken in the chorizo oil for 6-8 minutes until golden on all sides, then push it to the rim of the pan.', 'Rotate the pan every couple of minutes so both burners get every part of it.', NULL, NULL),
(285, 11, 'In the centre, cook the onion and peppers for 8 minutes until soft. Add 4 crushed garlic cloves for 1 minute, then 2 tsp smoked paprika for 20 seconds. Add the grated tomato and cook 5 minutes until it darkens into a thick, jammy sofrito. Return the chorizo and stir everything together.', 'Paprika burns in seconds - have the tomato ready to go straight in after it.', NULL, NULL),
(285, 12, 'Scatter the 560 g rice evenly across the pan and stir for 1-2 minutes to coat every grain in the sofrito. Pour in all the hot spiced stock, stir once to level the rice, and do not stir again from here. Taste the liquid now and correct the salt.', 'Once the stock is in, stirring releases starch and turns paella into risotto. Hands off.', NULL, NULL),
(285, 13, 'Boil hard for 8-10 minutes, rotating the pan over the burners. Scatter over the peas, then reduce to a low simmer for 8-10 minutes until the liquid is absorbed and the rice is just tender.', 'If the liquid is gone but the rice is still chalky in the middle, sprinkle over 100 ml hot water, cover the pan with foil and give it 5 more minutes on low. Big pans over home burners cook unevenly, so check the edges and the centre.', NULL, NULL),
(285, 14, 'For the last 1-2 minutes turn the heat up high for the socarrat. Listen for a crackle and a toasty smell; stop the moment it smells anything more than toasty.', 'Scrape a spoon at the edge: a golden crust that releases in shards is the socarrat. That is the best bit.', NULL, NULL),
(285, 15, 'Take the pan off the heat, cover with a clean tea towel and rest for 5-10 minutes.', NULL, NULL, NULL),
(285, 16, 'Serve half and half: paella with a scrape of socarrat on one side of each plate, 3-4 meatballs and their sauce on the other. Finish both halves with the remaining chopped parsley and a lemon wedge.', NULL, NULL, NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(286, 1, 'Grate 1 onion and crush 3 garlic cloves. In a large bowl combine the 800 g lamb mince, grated onion, garlic, 60 g breadcrumbs, the egg, 2 tsp cumin, 2 tsp ground coriander, 1/2 tsp cinnamon, half the chopped parsley, 1 tsp salt and a good grind of pepper. Mix with your hands until just combined.', 'Do not overwork it or the meatballs turn dense. Fry a thumbnail of the mix and taste it before you roll - this is your only chance to fix the seasoning.', NULL, NULL),
(286, 2, 'Roll into about 32 meatballs of roughly 35 g each and chill them for 15 minutes.', 'Chilling firms them up so they hold their shape when browned.', NULL, NULL),
(286, 3, 'Heat 2 tbsp olive oil in a large deep casserole over medium-high until it shimmers. Brown the meatballs in two batches, 5-6 minutes per batch, turning until coloured all over. They do not need to be cooked through. Lift out onto a plate.', 'Crowding the pan steams them grey. Two batches, space between each ball.', NULL, NULL),
(286, 4, 'Drop to medium. Add 1 tbsp olive oil and 1 finely diced onion to the same casserole and cook 8-10 minutes until soft and golden. Add 3 sliced garlic cloves, 1 tsp cumin, 1/2 tsp cinnamon, 1 tsp smoked paprika and the chilli flakes and cook for 1 minute until fragrant. Stir in the tomato paste and cook 1 minute more.', NULL, NULL, NULL),
(286, 5, 'Pour in the 100 ml dry sherry and let it bubble, scraping up the browned bits, until reduced by half (about 2 minutes). Add both tins of tomatoes and the honey and simmer 15 minutes.', NULL, NULL, NULL),
(286, 6, 'Return the meatballs and any juices from the plate. Simmer covered for 15 minutes, then uncovered for 10 minutes, until the sauce is thick enough to coat the back of a spoon and the meatballs read 71 C in the centre. Taste and adjust the salt, then keep warm on the lowest heat.', 'The sauce improves while it waits - make the meatballs first and they will be at their best when the paella is ready.', NULL, NULL),
(286, 7, 'Meanwhile, bring the 1800 ml chicken stock to a simmer in a pot, whisk in 2 tsp turmeric and 2 tsp smoked paprika and keep it hot. Taste it: it should be slightly too salty, because the rice will absorb it.', 'Turmeric and smoked paprika stand in for saffron here: the turmeric carries the colour, the paprika the savoury depth.', NULL, NULL),
(286, 8, 'Cut the 800 g chicken thighs into 4 cm chunks, pat completely dry and season with salt. Slice 200 g chorizo (the whole 200 g pack) into 5 mm rounds. Dice 1 onion, cut the peppers into strips, and grate the 2 fresh tomatoes on a box grater, discarding the skins.', 'This is a dry-cured chorizo cular, so slice it thin - thick chunks stay chewy and hold their fat.', NULL, NULL),
(286, 9, 'Set the 18 inch (46 cm) paella pan over two burners or a paella ring with 2 tbsp olive oil on medium-low. Render the chorizo gently for 2-3 minutes until it releases its red oil, then lift it out. If the fat is pooling across the pan, spoon a little off before the next step.', 'Cured chorizo scorches fast and turns bitter. Keep it gentle - you want the oil, not a crisp.', NULL, NULL),
(286, 10, 'Turn the heat to medium-high and brown the chicken in the chorizo oil for 6-8 minutes until golden on all sides, then push it to the rim of the pan.', 'Rotate the pan every couple of minutes so both burners get every part of it.', NULL, NULL),
(286, 11, 'In the centre, cook the onion and peppers for 8 minutes until soft. Add 4 crushed garlic cloves for 1 minute, then 2 tsp smoked paprika for 20 seconds. Add the grated tomato and cook 5 minutes until it darkens into a thick, jammy sofrito. Return the chorizo and stir everything together.', 'Paprika burns in seconds - have the tomato ready to go straight in after it.', NULL, NULL),
(286, 12, 'Scatter the 600 g rice evenly across the pan and stir for 1-2 minutes to coat every grain in the sofrito. Pour in all the hot spiced stock, stir once to level the rice, and do not stir again from here. Taste the liquid now and correct the salt.', 'Once the stock is in, stirring releases starch and turns paella into risotto. Hands off.', NULL, NULL),
(286, 13, 'Boil hard for 8-10 minutes, rotating the pan over the burners. Scatter over the peas, then reduce to a low simmer for 8-10 minutes until the liquid is absorbed and the rice is just tender.', 'If the liquid is gone but the rice is still chalky in the middle, sprinkle over 100 ml hot water, cover the pan with foil and give it 5 more minutes on low. Big pans over home burners cook unevenly, so check the edges and the centre.', NULL, NULL),
(286, 14, 'For the last 1-2 minutes turn the heat up high for the socarrat. Listen for a crackle and a toasty smell; stop the moment it smells anything more than toasty.', 'Scrape a spoon at the edge: a golden crust that releases in shards is the socarrat. That is the best bit.', NULL, NULL),
(286, 15, 'Take the pan off the heat, cover with a clean tea towel and rest for 5-10 minutes.', NULL, NULL, NULL),
(286, 16, 'Serve half and half: paella with a scrape of socarrat on one side of each plate, 4 meatballs and their sauce on the other. Finish both halves with the remaining chopped parsley and a lemon wedge.', NULL, NULL, NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(287, 1, 'Grate 1 onion and crush 3 garlic cloves. In a large bowl combine the 900 g lamb mince, grated onion, garlic, 70 g breadcrumbs, the egg, 2 tsp cumin, 2 tsp ground coriander, 1/2 tsp cinnamon, half the chopped parsley, 1 tsp salt and a good grind of pepper. Mix with your hands until just combined.', 'Do not overwork it or the meatballs turn dense. Fry a thumbnail of the mix and taste it before you roll - this is your only chance to fix the seasoning.', NULL, NULL),
(287, 2, 'Roll into about 36 meatballs of roughly 35 g each and chill them for 15 minutes.', 'Chilling firms them up so they hold their shape when browned.', NULL, NULL),
(287, 3, 'Heat 2 tbsp olive oil in a large deep casserole over medium-high until it shimmers. Brown the meatballs in two batches, 5-6 minutes per batch, turning until coloured all over. They do not need to be cooked through. Lift out onto a plate.', 'Crowding the pan steams them grey. Two batches, space between each ball.', NULL, NULL),
(287, 4, 'Drop to medium. Add 1 tbsp olive oil and 1 finely diced onion to the same casserole and cook 8-10 minutes until soft and golden. Add 3 sliced garlic cloves, 1 tsp cumin, 1/2 tsp cinnamon, 1 tsp smoked paprika and the chilli flakes and cook for 1 minute until fragrant. Stir in the tomato paste and cook 1 minute more.', NULL, NULL, NULL),
(287, 5, 'Pour in the 100 ml dry sherry and let it bubble, scraping up the browned bits, until reduced by half (about 2 minutes). Add both tins of tomatoes and the honey and simmer 15 minutes.', NULL, NULL, NULL),
(287, 6, 'Return the meatballs and any juices from the plate. Simmer covered for 15 minutes, then uncovered for 10 minutes, until the sauce is thick enough to coat the back of a spoon and the meatballs read 71 C in the centre. Taste and adjust the salt, then keep warm on the lowest heat.', 'The sauce improves while it waits - make the meatballs first and they will be at their best when the paella is ready.', NULL, NULL),
(287, 7, 'Meanwhile, bring the 2100 ml chicken stock to a simmer in a pot, whisk in 2 tsp turmeric and 2 tsp smoked paprika and keep it hot. Taste it: it should be slightly too salty, because the rice will absorb it.', 'Turmeric and smoked paprika stand in for saffron here: the turmeric carries the colour, the paprika the savoury depth.', NULL, NULL),
(287, 8, 'Cut the 900 g chicken thighs into 4 cm chunks, pat completely dry and season with salt. Slice 300 g chorizo (1 1/2 of the 200 g packs) into 5 mm rounds. Dice 1 onion, cut the peppers into strips, and grate the 2 fresh tomatoes on a box grater, discarding the skins.', 'This is a dry-cured chorizo cular, so slice it thin - thick chunks stay chewy and hold their fat.', NULL, NULL),
(287, 9, 'Set the 18 inch (46 cm) paella pan over two burners or a paella ring with 3 tbsp olive oil on medium-low. Render the chorizo gently for 2-3 minutes until it releases its red oil, then lift it out. If the fat is pooling across the pan, spoon a little off before the next step.', 'Cured chorizo scorches fast and turns bitter. Keep it gentle - you want the oil, not a crisp.', NULL, NULL),
(287, 10, 'Turn the heat to medium-high and brown the chicken in the chorizo oil for 6-8 minutes until golden on all sides, then push it to the rim of the pan.', 'Rotate the pan every couple of minutes so both burners get every part of it.', NULL, NULL),
(287, 11, 'In the centre, cook the onion and peppers for 8 minutes until soft. Add 4 crushed garlic cloves for 1 minute, then 2 tsp smoked paprika for 20 seconds. Add the grated tomato and cook 5 minutes until it darkens into a thick, jammy sofrito. Return the chorizo and stir everything together.', 'Paprika burns in seconds - have the tomato ready to go straight in after it.', NULL, NULL),
(287, 12, 'Scatter the 700 g rice evenly across the pan and stir for 1-2 minutes to coat every grain in the sofrito. Pour in all the hot spiced stock, stir once to level the rice, and do not stir again from here. Taste the liquid now and correct the salt.', 'Once the stock is in, stirring releases starch and turns paella into risotto. Hands off.', NULL, NULL),
(287, 13, 'Boil hard for 8-10 minutes, rotating the pan over the burners. Scatter over the peas, then reduce to a low simmer for 8-10 minutes until the liquid is absorbed and the rice is just tender.', 'If the liquid is gone but the rice is still chalky in the middle, sprinkle over 100 ml hot water, cover the pan with foil and give it 5 more minutes on low. Big pans over home burners cook unevenly, so check the edges and the centre.', NULL, NULL),
(287, 14, 'For the last 1-2 minutes turn the heat up high for the socarrat. Listen for a crackle and a toasty smell; stop the moment it smells anything more than toasty.', 'Scrape a spoon at the edge: a golden crust that releases in shards is the socarrat. That is the best bit.', NULL, NULL),
(287, 15, 'Take the pan off the heat, cover with a clean tea towel and rest for 5-10 minutes.', NULL, NULL, NULL),
(287, 16, 'Serve half and half: paella with a scrape of socarrat on one side of each plate, 4-5 meatballs and their sauce on the other. Finish both halves with the remaining chopped parsley and a lemon wedge.', NULL, NULL, NULL);

-- Family + members (Moderate is the default)
INSERT INTO recipe_families (id, family_name, description)
SELECT 117, 'Half & Half Paella with Moorish Meatballs', 'Cheat meal. A Dublin market-stall classic: chicken and Riojan chorizo paella with turmeric, smoked paprika and socarrat, served half and half with lamb meatballs in a cumin, cinnamon and sherry tomato sauce. 18 inch pan, serves 8.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 117);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 117, 285, 0, 'Light', 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 117 AND recipe_id = 285);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 117, 286, 1, 'Moderate', 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 117 AND recipe_id = 286);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 117, 287, 0, 'Balanced', 3
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 117 AND recipe_id = 287);

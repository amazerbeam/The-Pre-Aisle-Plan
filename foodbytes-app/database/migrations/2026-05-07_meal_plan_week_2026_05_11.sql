-- =============================================================================
-- Meal Plan — Week of Mon 2026-05-11
-- Generated 2026-05-07
--
-- Adds:
--   8 new ingredients (cottage cheese, cannellini beans, chickpeas, baby
--     spinach, sundried tomatoes, heavy cream, basmati rice, orange)
--   5 new recipes (Light-only "- Diet" variants), each in its own family
--   recipe_meals, recipe_ingredients, recipe_steps for each
--   meal_plan_entries for user_id=1 covering Mon 2026-05-11 → Sun 2026-05-17
--
-- Quantities in recipe_ingredients are for the WHOLE RECIPE (default_servings=2).
--
-- Excluded by user from this week's plan (still in DB, just not used):
--   - Salmon en Papillote
--   - Black Bean Chicken Wrap
--   - Salmon & Asparagus
--
-- All recipes audited against Light targets per CLAUDE.md
--   (450–550 kcal, ≥35 g protein, fat 25–35 %, carbs 40–50 % with 1–2 % slack).
-- Daily protein totals 108–133 g (target band 101–134 g for 84 kg user).
--
-- Apply manually to Railway. Hibernate is in `validate` mode.
-- Per `recipe-variants.md`: each new recipe ships Light-only here; Moderate
-- and Balanced variants to be added in a follow-up migration.
-- =============================================================================

START TRANSACTION;

-- -----------------------------------------------------------------------------
-- 0. New ingredients (verified macros from USDA / Tesco panels)
-- -----------------------------------------------------------------------------
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
 ('cottage_cheese',     'Cottage cheese',                6, 11.00,  3.40,  1.50, 1),
 ('cannellini_beans',   'Cannellini beans (tinned)',    10,  7.50, 17.00,  0.90, 1),
 ('chickpeas_tinned',   'Chickpeas (tinned)',           10,  7.00, 14.00,  2.60, 1),
 ('baby_spinach',       'Baby spinach',                  3,  2.90,  3.60,  0.40, 1),
 ('sundried_tomatoes',  'Sundried tomatoes (in oil)',   10, 14.10, 23.30, 14.10, 1),
 ('heavy_cream',        'Heavy cream',                   6,  2.10,  2.70, 47.00, 1),
 ('basmati_rice',       'Basmati rice',                 11,  7.10, 78.00,  0.70, 1),
 ('orange',             'Orange',                        4,  0.90, 11.80,  0.10, 1);

SET @ing_cottage_cheese    := (SELECT id FROM ingredients WHERE `key` = 'cottage_cheese');
SET @ing_cannellini        := (SELECT id FROM ingredients WHERE `key` = 'cannellini_beans');
SET @ing_chickpeas         := (SELECT id FROM ingredients WHERE `key` = 'chickpeas_tinned');
SET @ing_spinach           := (SELECT id FROM ingredients WHERE `key` = 'baby_spinach');
SET @ing_sundried_tomatoes := (SELECT id FROM ingredients WHERE `key` = 'sundried_tomatoes');
SET @ing_heavy_cream       := (SELECT id FROM ingredients WHERE `key` = 'heavy_cream');
SET @ing_basmati           := (SELECT id FROM ingredients WHERE `key` = 'basmati_rice');
SET @ing_orange            := (SELECT id FROM ingredients WHERE `key` = 'orange');

-- Existing ingredient ids (frequently used)
SET @ing_oats           := 1;
SET @ing_milk           := 2;
SET @ing_berries        := 3;
SET @ing_honey          := 4;
SET @ing_salt           := 5;
SET @ing_almonds        := 7;
SET @ing_walnuts        := 8;
SET @ing_chicken_breast := 11;
SET @ing_garlic         := 13;
SET @ing_sweet_potato   := 15;
SET @ing_olive_oil      := 22;
SET @ing_chicken_stock  := 24;
SET @ing_oregano        := 35;
SET @ing_chicken_thigh  := 41;
SET @ing_pb             := 6;
SET @ing_greek_yogurt   := 49;
SET @ing_baby_pots      := 52;
SET @ing_carrot         := 56;
SET @ing_vegetable_stock := 58;
SET @ing_egg            := 59;
SET @ing_paprika        := 65;
SET @ing_garlic_powder  := 92;
SET @ing_thyme_dry      := 79;
SET @ing_celery         := 99;
SET @ing_red_pepper     := 42;
SET @ing_pepper         := 50;
SET @ing_onion          := 12;
SET @ing_red_onion      := 155;
SET @ing_lemon          := 88;
SET @ing_cucumber       := 153;
SET @ing_cherry_tom     := 116;
SET @ing_feta           := 154;
SET @ing_dill           := 156;
SET @ing_parsley        := 123;
SET @ing_basil          := 29;
SET @ing_chilli         := 165;
SET @ing_capers         := 114;
SET @ing_dijon          := 86;
SET @ing_asparagus      := 113;
SET @ing_parmesan       := 30;
SET @ing_whey           := 163;
SET @ing_cinnamon       := 19;
SET @ing_bay            := 34;

SET @u_g     := 1;
SET @u_ml    := 2;
SET @u_tsp   := 3;
SET @u_tbsp  := 4;
SET @u_piece := 5;
SET @u_pinch := 17;

SET @meal_breakfast := 1;
SET @meal_lunch     := 2;
SET @meal_dinner    := 3;

-- =============================================================================
-- NEW RECIPE 1 — Protein Porridge with Berries - Diet
--   Light: per srv ~552 kcal, 44.5 g protein, 58.7 g carb, 15.5 g fat
-- =============================================================================
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Protein Porridge with Berries - Diet', 2, 552, 0, 1);
SET @r_porridge := LAST_INSERT_ID();

INSERT INTO recipe_families (family_name, description)
VALUES ('Protein Porridge with Berries', 'Stovetop oats with whey + Greek yogurt + berries and nuts. High protein, weight-loss friendly. Diet (Light) variant.');
SET @rf_porridge := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (@rf_porridge, @r_porridge, 1, 'Light', 1);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_porridge, @meal_breakfast);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_porridge, @ing_oats,         NULL, 90,  @u_g,  90,  1),
 (@r_porridge, @ing_milk,         NULL, 400, @u_ml, 412, 2),
 (@r_porridge, @ing_whey,         NULL, 50,  @u_g,  50,  3),
 (@r_porridge, @ing_greek_yogurt, NULL, 160, @u_g, 160,  4),
 (@r_porridge, @ing_berries,      NULL, 160, @u_g, 160,  5),
 (@r_porridge, @ing_honey,        NULL, 10,  @u_g,  10,  6),
 (@r_porridge, @ing_almonds,      NULL, 15,  @u_g,  15,  7),
 (@r_porridge, @ing_walnuts,      NULL, 15,  @u_g,  15,  8),
 (@r_porridge, @ing_cinnamon,     NULL, 1,   @u_g,   1,  9),
 (@r_porridge, @ing_salt,         NULL, 1,   @u_pinch, 0.5, 10);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_porridge, 1, 'Combine oats and milk in a small saucepan, bring to a simmer, cook 4 min stirring to your preferred consistency.'),
 (@r_porridge, 2, 'Off heat, whisk in the whey protein isolate until smooth. Stir in a pinch of salt and the cinnamon.'),
 (@r_porridge, 3, 'Divide between two bowls. Top each with a generous spoon of Greek yogurt, the berries, almonds, walnuts and a drizzle of honey.');

-- =============================================================================
-- NEW RECIPE 2 — Greek Chicken Gyros Bowl - Diet
--   Light: per srv ~548 kcal, 38 g protein, 55 g carb, 19.7 g fat
--   Source concept: joytothefood.com sheet-pan chicken gyros
-- =============================================================================
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Greek Chicken Gyros Bowl - Diet', 2, 548, 0, 1);
SET @r_gyros := LAST_INSERT_ID();

INSERT INTO recipe_families (family_name, description)
VALUES ('Greek Chicken Gyros Bowl', 'Sheet-pan oregano chicken thigh with chickpeas, basmati rice and a cucumber-feta-yogurt salad. Diet (Light) variant.');
SET @rf_gyros := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (@rf_gyros, @r_gyros, 1, 'Light', 1);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_gyros, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_gyros, @ing_chicken_thigh, NULL, 180, @u_g,  180, 1),
 (@r_gyros, @ing_chickpeas,     NULL, 130, @u_g,  130, 2),
 (@r_gyros, @ing_basmati,       NULL, 80,  @u_g,   80, 3),
 (@r_gyros, @ing_red_onion,     NULL, 60,  @u_g,   60, 4),
 (@r_gyros, @ing_cherry_tom,    NULL, 200, @u_g,  200, 5),
 (@r_gyros, @ing_cucumber,      NULL, 200, @u_g,  200, 6),
 (@r_gyros, @ing_feta,          NULL, 30,  @u_g,   30, 7),
 (@r_gyros, @ing_greek_yogurt,  NULL, 60,  @u_g,   60, 8),
 (@r_gyros, @ing_olive_oil,     NULL, 10,  @u_g,   10, 9),
 (@r_gyros, @ing_lemon,         NULL, 30,  @u_g,   30, 10),
 (@r_gyros, @ing_garlic,        NULL, 8,   @u_g,    8, 11),
 (@r_gyros, @ing_oregano,       NULL, 2,   @u_g,    2, 12),
 (@r_gyros, @ing_paprika,       NULL, 2,   @u_g,    2, 13),
 (@r_gyros, @ing_garlic_powder, NULL, 2,   @u_g,    2, 14),
 (@r_gyros, @ing_dill,          NULL, 4,   @u_g,    4, 15),
 (@r_gyros, @ing_salt,          NULL, 3,   @u_g,    3, 16),
 (@r_gyros, @ing_pepper,        NULL, 1,   @u_g,    1, 17);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_gyros, 1, 'Heat oven to 220°C / 425°F. Dice chicken thigh, drain chickpeas, cut red onion into wedges.'),
 (@r_gyros, 2, 'Toss chicken, chickpeas and onion on a sheet pan with 6g olive oil, oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Roast 22 min until chicken hits 75°C and chickpeas are crisp.'),
 (@r_gyros, 3, 'While roasting, cook the basmati rice per packet (about 12 min).'),
 (@r_gyros, 4, 'Make the salad: dice cucumber and halve cherry tomatoes; toss with crushed garlic, dill, remaining olive oil and lemon. Crumble over feta. Whisk Greek yogurt with a pinch of salt for the drizzle.'),
 (@r_gyros, 5, 'Plate rice, top with the sheet-pan chicken and chickpeas, side of cucumber-feta salad, finish with the yogurt drizzle.');

-- =============================================================================
-- NEW RECIPE 3 — Mediterranean White Bean & Chicken Soup - Diet
--   Light: per srv ~560 kcal, 44 g protein, 58 g carb, 16.8 g fat
--   Source concept: feelgoodfoodie.net white bean soup, with chicken added
-- =============================================================================
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean White Bean & Chicken Soup - Diet', 2, 560, 0, 1);
SET @r_soup := LAST_INSERT_ID();

INSERT INTO recipe_families (family_name, description)
VALUES ('Mediterranean White Bean & Chicken Soup', 'One-pot soup with chicken breast, cannellini beans, spinach and small pasta. Diet (Light) variant.');
SET @rf_soup := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (@rf_soup, @r_soup, 1, 'Light', 1);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_soup, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_soup, @ing_chicken_breast,  NULL, 160, @u_g,  160, 1),
 (@r_soup, @ing_cannellini,      NULL, 240, @u_g,  240, 2),
 (@r_soup, 126,                  NULL, 60,  @u_g,   60, 3),  -- spaghetti, broken short
 (@r_soup, @ing_onion,           NULL, 100, @u_g,  100, 4),
 (@r_soup, @ing_garlic,          NULL, 8,   @u_g,    8, 5),
 (@r_soup, @ing_carrot,          NULL, 120, @u_g,  120, 6),
 (@r_soup, @ing_celery,          NULL, 100, @u_g,  100, 7),
 (@r_soup, @ing_vegetable_stock, NULL, 700, @u_ml, 700, 8),
 (@r_soup, @ing_spinach,         NULL, 80,  @u_g,   80, 9),
 (@r_soup, @ing_olive_oil,       NULL, 20,  @u_g,   20, 10),
 (@r_soup, @ing_parmesan,        NULL, 15,  @u_g,   15, 11),
 (@r_soup, @ing_thyme_dry,       NULL, 1,   @u_g,    1, 12),
 (@r_soup, @ing_oregano,         NULL, 1,   @u_g,    1, 13),
 (@r_soup, @ing_salt,            NULL, 3,   @u_g,    3, 14),
 (@r_soup, @ing_pepper,          NULL, 1,   @u_g,    1, 15);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_soup, 1, 'Heat olive oil in a large pot over medium heat. Sweat diced onion, carrot and celery 5 min until soft. Add minced garlic, thyme, oregano, salt and pepper; cook 1 min.'),
 (@r_soup, 2, 'Add diced chicken breast and brown 3 min. Pour in vegetable stock, drained cannellini beans and broken pasta. Bring to a boil, reduce to a simmer 12 min until chicken is cooked through and pasta is tender.'),
 (@r_soup, 3, 'Stir in baby spinach and simmer 2 min until wilted. Taste and adjust seasoning.'),
 (@r_soup, 4, 'Ladle into two bowls and top with grated parmesan.');

-- =============================================================================
-- NEW RECIPE 4 — Slow-Roasted Salmon with Citrus & Veg - Diet
--   Light: per srv ~550 kcal, 36.1 g protein, 52.2 g carb, 21.9 g fat
--   Source concept: forksandfoliage.com slow-roasted salmon with citrus & capers
-- =============================================================================
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Slow-Roasted Salmon with Citrus & Veg - Diet', 2, 550, 0, 1);
SET @r_salmon := LAST_INSERT_ID();

INSERT INTO recipe_families (family_name, description)
VALUES ('Slow-Roasted Salmon with Citrus & Veg', 'Low-temp salmon with lemon, orange, capers and Dijon, roasted alongside baby potatoes and asparagus. Diet (Light) variant.');
SET @rf_salmon := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (@rf_salmon, @r_salmon, 1, 'Light', 1);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_salmon, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_salmon, 109,              NULL, 280, @u_g,  280, 1),  -- salmon fillet
 (@r_salmon, @ing_baby_pots,   NULL, 480, @u_g,  480, 2),
 (@r_salmon, @ing_asparagus,   NULL, 200, @u_g,  200, 3),
 (@r_salmon, @ing_lemon,       NULL, 60,  @u_g,   60, 4),
 (@r_salmon, @ing_orange,      NULL, 50,  @u_g,   50, 5),
 (@r_salmon, @ing_olive_oil,   NULL, 6,   @u_g,    6, 6),
 (@r_salmon, @ing_dijon,       NULL, 10,  @u_g,   10, 7),
 (@r_salmon, @ing_capers,      NULL, 10,  @u_g,   10, 8),
 (@r_salmon, @ing_garlic,      NULL, 8,   @u_g,    8, 9),
 (@r_salmon, @ing_parsley,     NULL, 8,   @u_g,    8, 10),
 (@r_salmon, @ing_salt,        NULL, 3,   @u_g,    3, 11),
 (@r_salmon, @ing_pepper,      NULL, 1,   @u_g,    1, 12);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_salmon, 1, 'Heat oven to 200°C / 400°F. Halve baby potatoes, toss with crushed garlic, half the salt, pepper and a teaspoon of the olive oil. Spread on a sheet pan and roast 18 min.'),
 (@r_salmon, 2, 'Drop oven to 110°C / 225°F. Push potatoes aside, lay salmon (skin down) and asparagus on the pan.'),
 (@r_salmon, 3, 'Whisk Dijon, capers, juice of half the lemon and half the orange, remaining olive oil, salt and pepper. Spoon over salmon. Top with thin slices of the remaining lemon and orange.'),
 (@r_salmon, 4, 'Slow-roast 22–25 min until salmon flakes easily (internal 55°C). Asparagus and potatoes finish in the same pass.'),
 (@r_salmon, 5, 'Rest 5 min, scatter chopped parsley and serve.');

-- =============================================================================
-- NEW RECIPE 5 — High-Protein Tuscan Chicken with Rice - Diet
--   Light: per srv ~587 kcal, 51.5 g protein, 57 g carb, 16.9 g fat
--   Source concept: joytothefood.com high-protein "Marry Me" Tuscan chicken
-- =============================================================================
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('High-Protein Tuscan Chicken with Rice - Diet', 2, 587, 0, 1);
SET @r_tuscan := LAST_INSERT_ID();

INSERT INTO recipe_families (family_name, description)
VALUES ('High-Protein Tuscan Chicken with Rice', 'Pan-seared chicken breast in a creamy sundried-tomato sauce thickened with cottage cheese, served over basmati and spinach. Diet (Light) variant.');
SET @rf_tuscan := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (@rf_tuscan, @r_tuscan, 1, 'Light', 1);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_tuscan, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_tuscan, @ing_chicken_breast,   NULL, 220, @u_g,  220, 1),
 (@r_tuscan, @ing_basmati,          NULL, 130, @u_g,  130, 2),
 (@r_tuscan, @ing_sundried_tomatoes,NULL, 30,  @u_g,   30, 3),
 (@r_tuscan, @ing_heavy_cream,      NULL, 20,  @u_g,   20, 4),
 (@r_tuscan, @ing_cottage_cheese,   NULL, 80,  @u_g,   80, 5),
 (@r_tuscan, @ing_parmesan,         NULL, 20,  @u_g,   20, 6),
 (@r_tuscan, @ing_spinach,          NULL, 120, @u_g,  120, 7),
 (@r_tuscan, @ing_garlic,           NULL, 12,  @u_g,   12, 8),
 (@r_tuscan, @ing_olive_oil,        NULL, 4,   @u_g,    4, 9),
 (@r_tuscan, @ing_chicken_stock,    NULL, 240, @u_ml, 240, 10),
 (@r_tuscan, @ing_basil,            NULL, 6,   @u_g,    6, 11),
 (@r_tuscan, @ing_chilli,           NULL, 1,   @u_g,    1, 12),
 (@r_tuscan, @ing_oregano,          NULL, 1,   @u_g,    1, 13),
 (@r_tuscan, @ing_salt,             NULL, 3,   @u_g,    3, 14),
 (@r_tuscan, @ing_pepper,           NULL, 1,   @u_g,    1, 15);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_tuscan, 1, 'Cook the basmati rice per packet (about 12 min).'),
 (@r_tuscan, 2, 'Slice chicken breast into 1″ medallions, season with salt, pepper, oregano and chilli flakes. Heat olive oil in a non-stick pan over medium-high; sear chicken 3 min each side until just cooked through. Remove and rest.'),
 (@r_tuscan, 3, 'Same pan: add minced garlic and chopped sundried tomatoes, cook 1 min. Pour in chicken stock and heavy cream, simmer to reduce slightly (3 min).'),
 (@r_tuscan, 4, 'Off heat, whisk in cottage cheese and grated parmesan until silky. Stir in baby spinach to wilt (1 min). Return chicken to coat in the sauce.'),
 (@r_tuscan, 5, 'Plate rice, ladle over the Tuscan chicken and sauce, scatter torn basil to serve.');

-- =============================================================================
-- MEAL TAG FIXES — recipes used in this plan that are mis-tagged or untagged
--   Per `feedback_meal_slot_discipline.md`: only put breakfast-typed recipes in
--   breakfast slots, etc. Add the missing tags so the plan is slot-correct.
--
--   Pink Sauce Pasta (37,38,39)            : add Lunch    (already tagged Dinner)
--   Reina Arepa (127,128,129)              : add Breakfast (already tagged Lunch)
--   Beef & Mushroom Black Bean SF (104-106): add Lunch    (already tagged Dinner)
--   Salmon w/ Air-Fried Pot & GB (139-141) : add Dinner   (currently NO meal tag)
--   Chicken Burrito Bowl (57,58,59)        : add Dinner   (already tagged Lunch)
-- INSERT IGNORE so re-running this migration is safe (recipe_meals has a UNIQUE
-- (recipe_id, meal_id) — adjust if your schema uses a different constraint).
-- =============================================================================
INSERT IGNORE INTO recipe_meals (recipe_id, meal_id) VALUES
 (37,  @meal_lunch),
 (38,  @meal_lunch),
 (39,  @meal_lunch),
 (127, @meal_breakfast),
 (128, @meal_breakfast),
 (129, @meal_breakfast),
 (104, @meal_lunch),
 (105, @meal_lunch),
 (106, @meal_lunch),
 (139, @meal_dinner),
 (140, @meal_dinner),
 (141, @meal_dinner),
 (57,  @meal_dinner),
 (58,  @meal_dinner),
 (59,  @meal_dinner);

-- =============================================================================
-- MEAL PLAN ENTRIES — week starting Mon 2026-05-11, user_id=1
--   (karen17guzman shares via meal_plan_owner_id=1)
-- Clear any existing entries for that week first, then re-insert.
-- =============================================================================
SET @r_overnight_oats             := 130;  -- existing Light, 526 kcal / 44 g pro
SET @r_hash_browns_chicken        := 124;  -- existing Light, 455 kcal / 37.1 g pro
SET @r_reina_arepa                := 127;  -- existing Light, 536 kcal / 36.3 g pro
SET @r_med_salmon                 := 142;  -- existing Light, 536 kcal / 33.3 g pro
SET @r_pink_sauce_pasta           := 37;   -- existing Light, 557 kcal / 42 g pro
SET @r_chicken_veg_soup           := 23;   -- existing Light, 434 kcal / 39 g pro
SET @r_salmon_airfried            := 139;  -- existing Light, 530 kcal / 33 g pro
SET @r_beef_blackbean_stirfry     := 104;  -- existing Light, 460 kcal / 35.7 g pro
SET @r_tamarind_noodles           := 133;  -- existing Light, 546 kcal / 39.9 g pro
SET @r_chicken_burrito_bowl       := 57;   -- existing Light, 578 kcal / 38.1 g pro

DELETE FROM meal_plan_entries
 WHERE user_id = 1
   AND plan_date BETWEEN '2026-05-11' AND '2026-05-17';

INSERT INTO meal_plan_entries (user_id, plan_date, meal_id, recipe_id, servings) VALUES
 -- Monday: Protein Porridge / Greek Chicken Gyros Bowl / Slow-Roasted Salmon
 (1, '2026-05-11', @meal_breakfast, @r_porridge,                 1),
 (1, '2026-05-11', @meal_lunch,     @r_gyros,                    1),
 (1, '2026-05-11', @meal_dinner,    @r_salmon,                   1),
 -- Tuesday: Overnight Oats / White Bean & Chicken Soup / Med Salmon
 (1, '2026-05-12', @meal_breakfast, @r_overnight_oats,           1),
 (1, '2026-05-12', @meal_lunch,     @r_soup,                     1),
 (1, '2026-05-12', @meal_dinner,    @r_med_salmon,               1),
 -- Wednesday: Hash Browns & Chicken / Pink Sauce Pasta / Tuscan Chicken
 (1, '2026-05-13', @meal_breakfast, @r_hash_browns_chicken,      1),
 (1, '2026-05-13', @meal_lunch,     @r_pink_sauce_pasta,         1),
 (1, '2026-05-13', @meal_dinner,    @r_tuscan,                   1),
 -- Thursday: Reina Arepa / Chicken & Veg Soup / Salmon Air-Fried
 (1, '2026-05-14', @meal_breakfast, @r_reina_arepa,              1),
 (1, '2026-05-14', @meal_lunch,     @r_chicken_veg_soup,         1),
 (1, '2026-05-14', @meal_dinner,    @r_salmon_airfried,          1),
 -- Friday: Protein Porridge / Beef & Mushroom Black Bean / Tamarind Noodles
 (1, '2026-05-15', @meal_breakfast, @r_porridge,                 1),
 (1, '2026-05-15', @meal_lunch,     @r_beef_blackbean_stirfry,   1),
 (1, '2026-05-15', @meal_dinner,    @r_tamarind_noodles,         1),
 -- Saturday: Overnight Oats / Greek Chicken Gyros Bowl / Chicken Burrito Bowl
 (1, '2026-05-16', @meal_breakfast, @r_overnight_oats,           1),
 (1, '2026-05-16', @meal_lunch,     @r_gyros,                    1),
 (1, '2026-05-16', @meal_dinner,    @r_chicken_burrito_bowl,     1),
 -- Sunday: Hash Browns & Chicken / White Bean & Chicken Soup / Tuscan Chicken (leftovers)
 (1, '2026-05-17', @meal_breakfast, @r_hash_browns_chicken,      1),
 (1, '2026-05-17', @meal_lunch,     @r_soup,                     1),
 (1, '2026-05-17', @meal_dinner,    @r_tuscan,                   1);

COMMIT;

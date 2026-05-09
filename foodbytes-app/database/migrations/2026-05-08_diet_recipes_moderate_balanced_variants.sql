-- =============================================================================
-- Adds Moderate + Balanced variants for the 5 "- Diet" recipes shipped on
-- 2026-05-07. The original migration shipped Light only (rule violation per
-- `recipe-variants.md` — every family must have all three variants with
-- Moderate as default).
--
-- This follow-up:
--   1. Updates the existing Light family-member rows to is_default=0.
--   2. Inserts new Moderate (is_default=1, default) + Balanced recipes for
--      each of the 5 families, with their recipe_meals, recipe_ingredients,
--      recipe_steps and recipe_family_members rows.
--
-- Existing family + Light recipe ids (queried 2026-05-08):
--   family 86 — Protein Porridge with Berries        — Light id 187
--   family 87 — Greek Chicken Gyros Bowl             — Light id 188
--   family 88 — Med White Bean & Chicken Soup        — Light id 189
--   family 89 — Slow-Roasted Salmon with Citrus & Veg — Light id 190
--   family 90 — High-Protein Tuscan Chicken w/ Rice  — Light id 191
--
-- Targets per CLAUDE.md:
--   Moderate: 550–650 kcal, ≥35 g protein, fat 25–35 %, carbs 40–50 %
--   Balanced: 700–800 kcal, ≥35 g protein, fat 25–35 %, carbs 40–50 %
--
-- Apply manually to Railway. Hibernate is in `validate` mode (no schema change).
-- =============================================================================

START TRANSACTION;

-- -----------------------------------------------------------------------------
-- Lookups for new ingredients (by `key` — robust to id drift between envs)
-- -----------------------------------------------------------------------------
SET @ing_cottage_cheese    := (SELECT id FROM ingredients WHERE `key` = 'cottage_cheese');
SET @ing_cannellini        := (SELECT id FROM ingredients WHERE `key` = 'cannellini_beans');
SET @ing_chickpeas         := (SELECT id FROM ingredients WHERE `key` = 'chickpeas_tinned');
SET @ing_spinach           := (SELECT id FROM ingredients WHERE `key` = 'baby_spinach');
SET @ing_sundried_tomatoes := (SELECT id FROM ingredients WHERE `key` = 'sundried_tomatoes');
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
SET @ing_onion          := 12;
SET @ing_garlic         := 13;
SET @ing_cinnamon       := 19;
SET @ing_olive_oil      := 22;
SET @ing_chicken_stock  := 24;
SET @ing_jasmine_rice   := 26;
SET @ing_basil          := 29;
SET @ing_parmesan       := 30;
SET @ing_oregano_dry    := 35;
SET @ing_chicken_thigh  := 41;
SET @ing_greek_yogurt   := 49;
SET @ing_pepper         := 50;
SET @ing_baby_pots      := 52;
SET @ing_carrot         := 56;
SET @ing_vegetable_stock := 58;
SET @ing_paprika        := 65;
SET @ing_thyme_dry      := 79;
SET @ing_dijon          := 86;
SET @ing_lemon          := 88;
SET @ing_garlic_powder  := 92;
SET @ing_celery         := 99;
SET @ing_salmon         := 109;
SET @ing_asparagus      := 113;
SET @ing_capers         := 114;
SET @ing_cherry_tom     := 116;
SET @ing_parsley        := 123;
SET @ing_spaghetti      := 126;
SET @ing_cucumber       := 153;
SET @ing_feta           := 154;
SET @ing_red_onion      := 155;
SET @ing_dill           := 156;
SET @ing_whey           := 163;
SET @ing_chilli         := 165;

SET @u_g     := 1;
SET @u_ml    := 2;
SET @u_pinch := 17;

SET @meal_breakfast := 1;
SET @meal_lunch     := 2;
SET @meal_dinner    := 3;

-- =============================================================================
-- 1. Flip existing Light variants to is_default=0
--    (Moderate becomes default; inserted below.)
-- =============================================================================
UPDATE recipe_family_members
SET is_default = 0
WHERE family_id IN (86, 87, 88, 89, 90)
  AND variant_label = 'Light';

-- =============================================================================
-- 2. Protein Porridge with Berries — Moderate (default) + Balanced
--    Family 86. Light = recipe 187.
-- =============================================================================

-- Moderate: per srv ~640 kcal, 49 g protein, 69 g carb, 19 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Protein Porridge with Berries - Diet', 2, 640, 0, 1);
SET @r_porridge_M := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (86, @r_porridge_M, 1, 'Moderate', 2);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_porridge_M, @meal_breakfast);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_porridge_M, @ing_oats,         NULL, 110, @u_g,  110, 1),
 (@r_porridge_M, @ing_milk,         NULL, 485, @u_ml, 500, 2),
 (@r_porridge_M, @ing_whey,         NULL, 50,  @u_g,   50, 3),
 (@r_porridge_M, @ing_greek_yogurt, NULL, 180, @u_g,  180, 4),
 (@r_porridge_M, @ing_berries,      NULL, 160, @u_g,  160, 5),
 (@r_porridge_M, @ing_honey,        NULL, 12,  @u_g,   12, 6),
 (@r_porridge_M, @ing_almonds,      NULL, 18,  @u_g,   18, 7),
 (@r_porridge_M, @ing_walnuts,      NULL, 18,  @u_g,   18, 8),
 (@r_porridge_M, @ing_cinnamon,     NULL, 1,   @u_g,    1, 9),
 (@r_porridge_M, @ing_salt,         NULL, 1,   @u_pinch, 0.5, 10);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_porridge_M, 1, 'Combine oats and milk in a saucepan, simmer 4 min stirring to your preferred consistency.'),
 (@r_porridge_M, 2, 'Off heat, whisk in the whey protein isolate, the cinnamon and a pinch of salt.'),
 (@r_porridge_M, 3, 'Divide between two bowls. Top each with Greek yogurt, berries, almonds, walnuts and a drizzle of honey.');

-- Balanced: per srv ~700 kcal, 55 g protein, 73 g carb, 21 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Protein Porridge with Berries - Diet', 2, 700, 0, 1);
SET @r_porridge_B := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (86, @r_porridge_B, 0, 'Balanced', 3);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_porridge_B, @meal_breakfast);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_porridge_B, @ing_oats,         NULL, 110, @u_g,  110, 1),
 (@r_porridge_B, @ing_milk,         NULL, 485, @u_ml, 500, 2),
 (@r_porridge_B, @ing_whey,         NULL, 60,  @u_g,   60, 3),
 (@r_porridge_B, @ing_greek_yogurt, NULL, 200, @u_g,  200, 4),
 (@r_porridge_B, @ing_berries,      NULL, 180, @u_g,  180, 5),
 (@r_porridge_B, @ing_honey,        NULL, 15,  @u_g,   15, 6),
 (@r_porridge_B, @ing_almonds,      NULL, 22,  @u_g,   22, 7),
 (@r_porridge_B, @ing_walnuts,      NULL, 22,  @u_g,   22, 8),
 (@r_porridge_B, @ing_cinnamon,     NULL, 1,   @u_g,    1, 9),
 (@r_porridge_B, @ing_salt,         NULL, 1,   @u_pinch, 0.5, 10);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_porridge_B, 1, 'Combine oats and milk in a saucepan, simmer 4 min stirring to your preferred consistency.'),
 (@r_porridge_B, 2, 'Off heat, whisk in the whey protein isolate, the cinnamon and a pinch of salt.'),
 (@r_porridge_B, 3, 'Divide between two bowls. Top each with Greek yogurt, berries, almonds, walnuts and a drizzle of honey.');

-- =============================================================================
-- 3. Greek Chicken Gyros Bowl — Moderate (default) + Balanced
--    Family 87. Light = recipe 188.
-- =============================================================================

-- Moderate: per srv ~643 kcal, 47 g protein, 62 g carb, 23 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Greek Chicken Gyros Bowl - Diet', 2, 643, 0, 1);
SET @r_gyros_M := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (87, @r_gyros_M, 1, 'Moderate', 2);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_gyros_M, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_gyros_M, @ing_chicken_thigh, NULL, 220, @u_g, 220, 1),
 (@r_gyros_M, @ing_chickpeas,     NULL, 150, @u_g, 150, 2),
 (@r_gyros_M, @ing_jasmine_rice,  NULL, 100, @u_g, 100, 3),
 (@r_gyros_M, @ing_red_onion,     NULL, 60,  @u_g,  60, 4),
 (@r_gyros_M, @ing_cherry_tom,    NULL, 200, @u_g, 200, 5),
 (@r_gyros_M, @ing_cucumber,      NULL, 200, @u_g, 200, 6),
 (@r_gyros_M, @ing_feta,          NULL, 50,  @u_g,  50, 7),
 (@r_gyros_M, @ing_greek_yogurt,  NULL, 80,  @u_g,  80, 8),
 (@r_gyros_M, @ing_olive_oil,     NULL, 8,   @u_g,   8, 9),
 (@r_gyros_M, @ing_lemon,         NULL, 30,  @u_g,  30, 10),
 (@r_gyros_M, @ing_garlic,        NULL, 10,  @u_g,  10, 11),
 (@r_gyros_M, @ing_oregano_dry,   NULL, 2,   @u_g,   2, 12),
 (@r_gyros_M, @ing_paprika,       NULL, 2,   @u_g,   2, 13),
 (@r_gyros_M, @ing_garlic_powder, NULL, 2,   @u_g,   2, 14),
 (@r_gyros_M, @ing_dill,          NULL, 4,   @u_g,   4, 15),
 (@r_gyros_M, @ing_salt,          NULL, 3,   @u_g,   3, 16),
 (@r_gyros_M, @ing_pepper,        NULL, 1,   @u_g,   1, 17);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_gyros_M, 1, 'Heat oven to 220°C / 425°F. Dice chicken thigh, drain chickpeas, cut red onion into wedges.'),
 (@r_gyros_M, 2, 'Toss chicken, chickpeas and onion on a sheet pan with most of the olive oil, oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Roast 22 min until chicken hits 75°C and chickpeas are crisp.'),
 (@r_gyros_M, 3, 'While roasting, cook the jasmine rice per packet (about 12 min).'),
 (@r_gyros_M, 4, 'Make the salad: dice cucumber and halve cherry tomatoes; toss with crushed garlic, dill, remaining olive oil and lemon. Crumble over feta. Whisk Greek yogurt with a pinch of salt for the drizzle.'),
 (@r_gyros_M, 5, 'Plate rice, top with the sheet-pan chicken and chickpeas, side of cucumber-feta salad, finish with the yogurt drizzle.');

-- Balanced: per srv ~780 kcal, 54 g protein, 78 g carb, 28 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Greek Chicken Gyros Bowl - Diet', 2, 780, 0, 1);
SET @r_gyros_B := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (87, @r_gyros_B, 0, 'Balanced', 3);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_gyros_B, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_gyros_B, @ing_chicken_thigh, NULL, 240, @u_g, 240, 1),
 (@r_gyros_B, @ing_chickpeas,     NULL, 180, @u_g, 180, 2),
 (@r_gyros_B, @ing_jasmine_rice,  NULL, 130, @u_g, 130, 3),
 (@r_gyros_B, @ing_red_onion,     NULL, 80,  @u_g,  80, 4),
 (@r_gyros_B, @ing_cherry_tom,    NULL, 240, @u_g, 240, 5),
 (@r_gyros_B, @ing_cucumber,      NULL, 200, @u_g, 200, 6),
 (@r_gyros_B, @ing_feta,          NULL, 70,  @u_g,  70, 7),
 (@r_gyros_B, @ing_greek_yogurt,  NULL, 100, @u_g, 100, 8),
 (@r_gyros_B, @ing_olive_oil,     NULL, 10,  @u_g,  10, 9),
 (@r_gyros_B, @ing_lemon,         NULL, 30,  @u_g,  30, 10),
 (@r_gyros_B, @ing_garlic,        NULL, 12,  @u_g,  12, 11),
 (@r_gyros_B, @ing_oregano_dry,   NULL, 2,   @u_g,   2, 12),
 (@r_gyros_B, @ing_paprika,       NULL, 2,   @u_g,   2, 13),
 (@r_gyros_B, @ing_garlic_powder, NULL, 2,   @u_g,   2, 14),
 (@r_gyros_B, @ing_dill,          NULL, 4,   @u_g,   4, 15),
 (@r_gyros_B, @ing_salt,          NULL, 3,   @u_g,   3, 16),
 (@r_gyros_B, @ing_pepper,        NULL, 1,   @u_g,   1, 17);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_gyros_B, 1, 'Heat oven to 220°C / 425°F. Dice chicken thigh, drain chickpeas, cut red onion into wedges.'),
 (@r_gyros_B, 2, 'Toss chicken, chickpeas and onion on a sheet pan with most of the olive oil, oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Roast 22 min until chicken hits 75°C and chickpeas are crisp.'),
 (@r_gyros_B, 3, 'While roasting, cook the jasmine rice per packet (about 12 min).'),
 (@r_gyros_B, 4, 'Make the salad: dice cucumber and halve cherry tomatoes; toss with crushed garlic, dill, remaining olive oil and lemon. Crumble over feta. Whisk Greek yogurt with a pinch of salt for the drizzle.'),
 (@r_gyros_B, 5, 'Plate rice, top with the sheet-pan chicken and chickpeas, side of cucumber-feta salad, finish with the yogurt drizzle.');

-- =============================================================================
-- 4. Mediterranean White Bean & Chicken Soup — Moderate (default) + Balanced
--    Family 88. Light = recipe 189.
-- =============================================================================

-- Moderate: per srv ~649 kcal, 51 g protein, 71 g carb, 18 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean White Bean & Chicken Soup - Diet', 2, 649, 0, 1);
SET @r_soup_M := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (88, @r_soup_M, 1, 'Moderate', 2);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_soup_M, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_soup_M, @ing_chicken_breast,  NULL, 180, @u_g,  180, 1),
 (@r_soup_M, @ing_cannellini,      NULL, 280, @u_g,  280, 2),
 (@r_soup_M, @ing_spaghetti,       NULL, 80,  @u_g,   80, 3),
 (@r_soup_M, @ing_onion,           NULL, 100, @u_g,  100, 4),
 (@r_soup_M, @ing_garlic,          NULL, 10,  @u_g,   10, 5),
 (@r_soup_M, @ing_carrot,          NULL, 130, @u_g,  130, 6),
 (@r_soup_M, @ing_celery,          NULL, 100, @u_g,  100, 7),
 (@r_soup_M, @ing_vegetable_stock, NULL, 750, @u_ml, 750, 8),
 (@r_soup_M, @ing_spinach,         NULL, 100, @u_g,  100, 9),
 (@r_soup_M, @ing_olive_oil,       NULL, 20,  @u_g,   20, 10),
 (@r_soup_M, @ing_parmesan,        NULL, 20,  @u_g,   20, 11),
 (@r_soup_M, @ing_thyme_dry,       NULL, 1,   @u_g,    1, 12),
 (@r_soup_M, @ing_oregano_dry,     NULL, 1,   @u_g,    1, 13),
 (@r_soup_M, @ing_salt,            NULL, 3,   @u_g,    3, 14),
 (@r_soup_M, @ing_pepper,          NULL, 1,   @u_g,    1, 15);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_soup_M, 1, 'Heat olive oil in a large pot. Sweat diced onion, carrot and celery 5 min. Add minced garlic, thyme, oregano, salt and pepper; cook 1 min.'),
 (@r_soup_M, 2, 'Add diced chicken breast and brown 3 min. Pour in vegetable stock, drained cannellini beans and broken pasta. Simmer 12 min until chicken is cooked through and pasta is tender.'),
 (@r_soup_M, 3, 'Stir in baby spinach and simmer 2 min until wilted. Taste and adjust seasoning.'),
 (@r_soup_M, 4, 'Ladle into two bowls and top with grated parmesan.');

-- Balanced: per srv ~779 kcal, 62 g protein, 84 g carb, 22 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean White Bean & Chicken Soup - Diet', 2, 779, 0, 1);
SET @r_soup_B := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (88, @r_soup_B, 0, 'Balanced', 3);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_soup_B, @meal_lunch);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_soup_B, @ing_chicken_breast,  NULL, 220, @u_g,  220, 1),
 (@r_soup_B, @ing_cannellini,      NULL, 320, @u_g,  320, 2),
 (@r_soup_B, @ing_spaghetti,       NULL, 100, @u_g,  100, 3),
 (@r_soup_B, @ing_onion,           NULL, 120, @u_g,  120, 4),
 (@r_soup_B, @ing_garlic,          NULL, 12,  @u_g,   12, 5),
 (@r_soup_B, @ing_carrot,          NULL, 150, @u_g,  150, 6),
 (@r_soup_B, @ing_celery,          NULL, 120, @u_g,  120, 7),
 (@r_soup_B, @ing_vegetable_stock, NULL, 800, @u_ml, 800, 8),
 (@r_soup_B, @ing_spinach,         NULL, 120, @u_g,  120, 9),
 (@r_soup_B, @ing_olive_oil,       NULL, 24,  @u_g,   24, 10),
 (@r_soup_B, @ing_parmesan,        NULL, 25,  @u_g,   25, 11),
 (@r_soup_B, @ing_thyme_dry,       NULL, 1,   @u_g,    1, 12),
 (@r_soup_B, @ing_oregano_dry,     NULL, 1,   @u_g,    1, 13),
 (@r_soup_B, @ing_salt,            NULL, 3,   @u_g,    3, 14),
 (@r_soup_B, @ing_pepper,          NULL, 1,   @u_g,    1, 15);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_soup_B, 1, 'Heat olive oil in a large pot. Sweat diced onion, carrot and celery 5 min. Add minced garlic, thyme, oregano, salt and pepper; cook 1 min.'),
 (@r_soup_B, 2, 'Add diced chicken breast and brown 3 min. Pour in vegetable stock, drained cannellini beans and broken pasta. Simmer 12 min until chicken is cooked through and pasta is tender.'),
 (@r_soup_B, 3, 'Stir in baby spinach and simmer 2 min until wilted. Taste and adjust seasoning.'),
 (@r_soup_B, 4, 'Ladle into two bowls and top with grated parmesan.');

-- =============================================================================
-- 5. Slow-Roasted Salmon with Citrus & Veg — Moderate (default) + Balanced
--    Family 89. Light = recipe 190.
-- =============================================================================

-- Moderate: per srv ~642 kcal, 41 g protein, 66 g carb, 24 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Slow-Roasted Salmon with Citrus & Veg - Diet', 2, 642, 0, 1);
SET @r_salmon_M := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (89, @r_salmon_M, 1, 'Moderate', 2);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_salmon_M, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_salmon_M, @ing_salmon,    NULL, 320, @u_g,  320, 1),
 (@r_salmon_M, @ing_baby_pots, NULL, 700, @u_g,  700, 2),
 (@r_salmon_M, @ing_asparagus, NULL, 220, @u_g,  220, 3),
 (@r_salmon_M, @ing_lemon,     NULL, 60,  @u_g,   60, 4),
 (@r_salmon_M, @ing_orange,    NULL, 50,  @u_g,   50, 5),
 (@r_salmon_M, @ing_olive_oil, NULL, 4,   @u_g,    4, 6),
 (@r_salmon_M, @ing_dijon,     NULL, 12,  @u_g,   12, 7),
 (@r_salmon_M, @ing_capers,    NULL, 12,  @u_g,   12, 8),
 (@r_salmon_M, @ing_garlic,    NULL, 10,  @u_g,   10, 9),
 (@r_salmon_M, @ing_parsley,   NULL, 10,  @u_g,   10, 10),
 (@r_salmon_M, @ing_salt,      NULL, 3,   @u_g,    3, 11),
 (@r_salmon_M, @ing_pepper,    NULL, 1,   @u_g,    1, 12);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_salmon_M, 1, 'Heat oven to 200°C / 400°F. Halve baby potatoes, toss with crushed garlic, half the salt, pepper and a drop of the olive oil. Spread on a sheet pan and roast 18 min.'),
 (@r_salmon_M, 2, 'Drop oven to 110°C / 225°F. Push potatoes aside, lay salmon (skin down) and asparagus on the pan.'),
 (@r_salmon_M, 3, 'Whisk Dijon, capers, juice of half the lemon and half the orange, remaining oil, salt and pepper. Spoon over salmon. Top with thin slices of remaining lemon and orange.'),
 (@r_salmon_M, 4, 'Slow-roast 22–25 min until salmon flakes (internal 55°C). Asparagus and potatoes finish in the same pass.'),
 (@r_salmon_M, 5, 'Rest 5 min, scatter chopped parsley and serve.');

-- Balanced: per srv ~757 kcal, 47 g protein, 76 g carb, 29 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Slow-Roasted Salmon with Citrus & Veg - Diet', 2, 757, 0, 1);
SET @r_salmon_B := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (89, @r_salmon_B, 0, 'Balanced', 3);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_salmon_B, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_salmon_B, @ing_salmon,    NULL, 360, @u_g,  360, 1),
 (@r_salmon_B, @ing_baby_pots, NULL, 800, @u_g,  800, 2),
 (@r_salmon_B, @ing_asparagus, NULL, 240, @u_g,  240, 3),
 (@r_salmon_B, @ing_lemon,     NULL, 60,  @u_g,   60, 4),
 (@r_salmon_B, @ing_orange,    NULL, 50,  @u_g,   50, 5),
 (@r_salmon_B, @ing_olive_oil, NULL, 10,  @u_g,   10, 6),
 (@r_salmon_B, @ing_dijon,     NULL, 12,  @u_g,   12, 7),
 (@r_salmon_B, @ing_capers,    NULL, 12,  @u_g,   12, 8),
 (@r_salmon_B, @ing_garlic,    NULL, 12,  @u_g,   12, 9),
 (@r_salmon_B, @ing_parsley,   NULL, 10,  @u_g,   10, 10),
 (@r_salmon_B, @ing_salt,      NULL, 3,   @u_g,    3, 11),
 (@r_salmon_B, @ing_pepper,    NULL, 1,   @u_g,    1, 12);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_salmon_B, 1, 'Heat oven to 200°C / 400°F. Halve baby potatoes, toss with crushed garlic, half the salt, pepper and a drop of the olive oil. Spread on a sheet pan and roast 18 min.'),
 (@r_salmon_B, 2, 'Drop oven to 110°C / 225°F. Push potatoes aside, lay salmon (skin down) and asparagus on the pan.'),
 (@r_salmon_B, 3, 'Whisk Dijon, capers, juice of half the lemon and half the orange, remaining oil, salt and pepper. Spoon over salmon. Top with thin slices of remaining lemon and orange.'),
 (@r_salmon_B, 4, 'Slow-roast 22–25 min until salmon flakes (internal 55°C). Asparagus and potatoes finish in the same pass.'),
 (@r_salmon_B, 5, 'Rest 5 min, scatter chopped parsley and serve.');

-- =============================================================================
-- 6. High-Protein Tuscan Chicken with Rice — Moderate (default) + Balanced
--    Family 90. Light = recipe 191.
-- =============================================================================

-- Moderate: per srv ~641 kcal, 53 g protein, 67 g carb, 18 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('High-Protein Tuscan Chicken with Rice - Diet', 2, 641, 0, 1);
SET @r_tuscan_M := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (90, @r_tuscan_M, 1, 'Moderate', 2);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_tuscan_M, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_tuscan_M, @ing_chicken_breast,    NULL, 200, @u_g,  200, 1),
 (@r_tuscan_M, @ing_jasmine_rice,      NULL, 140, @u_g,  140, 2),
 (@r_tuscan_M, @ing_sundried_tomatoes, NULL, 35,  @u_g,   35, 3),
 (@r_tuscan_M, @ing_cottage_cheese,    NULL, 120, @u_g,  120, 4),
 (@r_tuscan_M, @ing_parmesan,          NULL, 25,  @u_g,   25, 5),
 (@r_tuscan_M, @ing_spinach,           NULL, 140, @u_g,  140, 6),
 (@r_tuscan_M, @ing_garlic,            NULL, 14,  @u_g,   14, 7),
 (@r_tuscan_M, @ing_olive_oil,         NULL, 14,  @u_g,   14, 8),
 (@r_tuscan_M, @ing_chicken_stock,     NULL, 280, @u_ml, 280, 9),
 (@r_tuscan_M, @ing_basil,             NULL, 6,   @u_g,    6, 10),
 (@r_tuscan_M, @ing_chilli,            NULL, 1,   @u_g,    1, 11),
 (@r_tuscan_M, @ing_oregano_dry,       NULL, 1,   @u_g,    1, 12),
 (@r_tuscan_M, @ing_salt,              NULL, 3,   @u_g,    3, 13),
 (@r_tuscan_M, @ing_pepper,            NULL, 1,   @u_g,    1, 14);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_tuscan_M, 1, 'Cook the jasmine rice per packet (about 12 min).'),
 (@r_tuscan_M, 2, 'Slice chicken breast into 1″ medallions, season with salt, pepper, oregano and chilli flakes. Heat olive oil in a non-stick pan over medium-high; sear chicken 3 min each side until just cooked through. Remove and rest.'),
 (@r_tuscan_M, 3, 'Same pan: add minced garlic and chopped sundried tomatoes, cook 1 min. Pour in chicken stock, simmer to reduce slightly (3 min).'),
 (@r_tuscan_M, 4, 'Blend cottage cheese smooth in a small jug. Off heat, whisk it into the pan with the grated parmesan until silky. Stir in baby spinach to wilt (1 min). Return chicken to coat in the sauce.'),
 (@r_tuscan_M, 5, 'Plate rice, ladle over the Tuscan chicken and sauce, scatter torn basil to serve.');

-- Balanced: per srv ~789 kcal, 63 g protein, 84 g carb, 22 g fat
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('High-Protein Tuscan Chicken with Rice - Diet', 2, 789, 0, 1);
SET @r_tuscan_B := LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
VALUES (90, @r_tuscan_B, 0, 'Balanced', 3);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_tuscan_B, @meal_dinner);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
 (@r_tuscan_B, @ing_chicken_breast,    NULL, 240, @u_g,  240, 1),
 (@r_tuscan_B, @ing_jasmine_rice,      NULL, 180, @u_g,  180, 2),
 (@r_tuscan_B, @ing_sundried_tomatoes, NULL, 40,  @u_g,   40, 3),
 (@r_tuscan_B, @ing_cottage_cheese,    NULL, 140, @u_g,  140, 4),
 (@r_tuscan_B, @ing_parmesan,          NULL, 30,  @u_g,   30, 5),
 (@r_tuscan_B, @ing_spinach,           NULL, 160, @u_g,  160, 6),
 (@r_tuscan_B, @ing_garlic,            NULL, 16,  @u_g,   16, 7),
 (@r_tuscan_B, @ing_olive_oil,         NULL, 18,  @u_g,   18, 8),
 (@r_tuscan_B, @ing_chicken_stock,     NULL, 320, @u_ml, 320, 9),
 (@r_tuscan_B, @ing_basil,             NULL, 8,   @u_g,    8, 10),
 (@r_tuscan_B, @ing_chilli,            NULL, 1,   @u_g,    1, 11),
 (@r_tuscan_B, @ing_oregano_dry,       NULL, 1,   @u_g,    1, 12),
 (@r_tuscan_B, @ing_salt,              NULL, 3,   @u_g,    3, 13),
 (@r_tuscan_B, @ing_pepper,            NULL, 1,   @u_g,    1, 14);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
 (@r_tuscan_B, 1, 'Cook the jasmine rice per packet (about 12 min).'),
 (@r_tuscan_B, 2, 'Slice chicken breast into 1″ medallions, season with salt, pepper, oregano and chilli flakes. Heat olive oil in a non-stick pan over medium-high; sear chicken 3 min each side until just cooked through. Remove and rest.'),
 (@r_tuscan_B, 3, 'Same pan: add minced garlic and chopped sundried tomatoes, cook 1 min. Pour in chicken stock, simmer to reduce slightly (3 min).'),
 (@r_tuscan_B, 4, 'Blend cottage cheese smooth in a small jug. Off heat, whisk it into the pan with the grated parmesan until silky. Stir in baby spinach to wilt (1 min). Return chicken to coat in the sauce.'),
 (@r_tuscan_B, 5, 'Plate rice, ladle over the Tuscan chicken and sauce, scatter torn basil to serve.');

COMMIT;

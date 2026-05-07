-- ============================================================
-- Salmon with Air-Fried Potatoes & Green Beans (3 variants)
-- + Skill-led weight-loss meal plan for user_id = 1
-- Week of Mon 2026-05-12 .. Sun 2026-05-18
-- ============================================================
-- Skill rationale:
--   - Mediterranean default (Am J Med systematic review): legumes, oily fish, olive oil
--   - Oily fish 2x in the week (USDA / Mediterranean)
--   - Zero red meat (Mediterranean limits red meat; CLAUDE.md gout list)
--   - Per-meal protein in USDA 25-40 g band where possible
--   - No gout-flagged ingredients (no oyster sauce, fish sauce, organ meats, sardines)
--   - Quality fats only (olive oil, butter, ghee) - no seed-oil blends
-- ============================================================

START TRANSACTION;

-- -----------------------------------------------------------
-- 1. Recipe family
-- -----------------------------------------------------------
INSERT INTO recipe_families (family_name, description)
VALUES ('Salmon with Air-Fried Potatoes & Green Beans',
        'Mediterranean-style salmon dinner: oven-roasted salmon with crispy air-fried potato cubes and lemon-garlic green beans.');
SET @family_id = LAST_INSERT_ID();

-- -----------------------------------------------------------
-- 2. LIGHT variant (~530 kcal/serving, 33 g protein)
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Salmon with Air-Fried Potatoes & Green Beans', 2, 1060, 0, 1);
SET @r_light = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_light, 0, 'Light', 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_light, 109, 260,  1,  260, 1),  -- Salmon Fillet 260 g
(@r_light, 121, 400,  1,  400, 2),  -- Potato 400 g (cubed, air-fried)
(@r_light, 133, 260,  1,  260, 3),  -- Green beans 260 g
(@r_light,  22,  12,  1,   12, 4),  -- Olive oil 12 g
(@r_light,  88,  30,  1,   30, 5),  -- Lemon (juice/wedges) 30 g
(@r_light,  13,  12,  1,   12, 6),  -- Garlic 12 g (~4 cloves)
(@r_light, 156,   4,  1,    4, 7),  -- Fresh Dill 4 g
(@r_light,   5,   6,  1,    6, 8),  -- Salt 6 g
(@r_light,  50,   1,  1,    1, 9);  -- Black pepper 1 g

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_light, 1, 'Preheat oven to 200 C / 400 F. Cube the potatoes (2 cm). Toss with half the olive oil, half the salt, and pepper.'),
(@r_light, 2, 'Air-fry the potato cubes at 200 C for 18-22 minutes, shaking halfway, until golden and crisp.'),
(@r_light, 3, 'Pat the salmon fillets dry. Rub with the remaining olive oil, salt, pepper, and half the chopped dill. Roast skin-side down on a lined tray for 10-12 minutes (until just opaque).'),
(@r_light, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp.'),
(@r_light, 5, 'Toss the warm green beans with crushed garlic, lemon juice, and the remaining dill. Plate salmon, potatoes, and beans; finish with lemon wedges.');

-- -----------------------------------------------------------
-- 3. MODERATE variant (~635 kcal/serving, 39 g protein)
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Salmon with Air-Fried Potatoes & Green Beans', 2, 1267, 0, 1);
SET @r_mod = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_mod, 1, 'Moderate', 2);  -- default variant

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_mod, 109, 320,  1,  320, 1),
(@r_mod, 121, 480,  1,  480, 2),
(@r_mod, 133, 280,  1,  280, 3),
(@r_mod,  22,  16,  1,   16, 4),
(@r_mod,  88,  36,  1,   36, 5),
(@r_mod,  13,  14,  1,   14, 6),
(@r_mod, 156,   5,  1,    5, 7),
(@r_mod,   5,   6,  1,    6, 8),
(@r_mod,  50, 1.5,  1,  1.5, 9);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_mod, 1, 'Preheat oven to 200 C / 400 F. Cube the potatoes (2 cm). Toss with half the olive oil, half the salt, and pepper.'),
(@r_mod, 2, 'Air-fry the potato cubes at 200 C for 20-24 minutes, shaking halfway, until golden and crisp.'),
(@r_mod, 3, 'Pat the salmon fillets dry. Rub with the remaining olive oil, salt, pepper, and half the chopped dill. Roast skin-side down for 11-13 minutes.'),
(@r_mod, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp.'),
(@r_mod, 5, 'Toss the warm green beans with crushed garlic, lemon juice, and the remaining dill. Plate and serve with lemon wedges.');

-- -----------------------------------------------------------
-- 4. BALANCED variant (~790 kcal/serving, 49 g protein)
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Salmon with Air-Fried Potatoes & Green Beans', 2, 1576, 0, 1);
SET @r_bal = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_bal, 0, 'Balanced', 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_bal, 109, 400,  1,  400, 1),
(@r_bal, 121, 600,  1,  600, 2),
(@r_bal, 133, 320,  1,  320, 3),
(@r_bal,  22,  20,  1,   20, 4),
(@r_bal,  88,  40,  1,   40, 5),
(@r_bal,  13,  16,  1,   16, 6),
(@r_bal, 156,   6,  1,    6, 7),
(@r_bal,   5,   7,  1,    7, 8),
(@r_bal,  50,   2,  1,    2, 9);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_bal, 1, 'Preheat oven to 200 C / 400 F. Cube the potatoes (2 cm). Toss with half the olive oil, half the salt, and pepper.'),
(@r_bal, 2, 'Air-fry the potato cubes at 200 C for 22-26 minutes, shaking halfway, until golden and crisp.'),
(@r_bal, 3, 'Pat the salmon fillets dry. Rub with the remaining olive oil, salt, pepper, and half the chopped dill. Roast skin-side down for 12-14 minutes.'),
(@r_bal, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp.'),
(@r_bal, 5, 'Toss the warm green beans with crushed garlic, lemon juice, and the remaining dill. Plate generously and serve with lemon wedges.');

-- -----------------------------------------------------------
-- 4b. Tag all 3 variants as Dinner in recipe_meals
-- -----------------------------------------------------------
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(@r_light, 3),
(@r_mod,   3),
(@r_bal,   3);

-- ============================================================
-- 5. Meal plan for user_id = 1, week of 2026-05-12
--    Every recipe placed only in a slot it's tagged for in recipe_meals.
--    Skill-led: 2x oily fish, 5 legume-anchored meals, 0 red meat.
-- ============================================================
-- Reference (recipe_id : name : valid system meal):
--   1   Porridge with Berries & Nuts (Light)        - Breakfast
--   124 Hash Browns & Diced Chicken (Light)         - Breakfast  (37 g protein)
--   130 Overnight Oats (Light)                      - Breakfast  (44 g protein)
--   20  Black Bean Chicken Wrap (Light)             - Lunch       (legumes)
--   23  Chicken & Vegetable Soup (Light)            - Lunch
--   30  Lentil Stew (Light)                         - Lunch       (legumes)
--   33  Lentil Stuffed Peppers (Light)              - Lunch       (legumes)
--   57  Chicken Burrito Bowl (Light)                - Lunch       (black beans)
--   95  Tortilla Espanola (Light)                   - Lunch
--   127 Reina Arepa (Light)                         - Lunch
--   16  Chicken Satay (Light)                       - Dinner
--   40  Chicken Tikka Masala (Light)                - Dinner
--   69  Salmon & Asparagus (Light)                  - Dinner      (oily fish)
--   87  Paella de pollo (Light)                     - Dinner      (butterbeans)
--   108 Drunken Noodles (Light)                     - Dinner
--   133 Tamarind Tossed Noodles (Light)             - Dinner
--   @r_light  Salmon w/ Air-Fried Potatoes & Green Beans (Light, NEW) - Dinner

-- Meal IDs: 1 = Breakfast, 2 = Lunch, 3 = Dinner

INSERT INTO meal_plan_entries (user_id, plan_date, meal_id, recipe_id, servings) VALUES
-- Mon 12 May
(1, '2026-05-12', 1,   1,        2),  -- B: Porridge
(1, '2026-05-12', 2,  30,        2),  -- L: Lentil Stew         [legumes]
(1, '2026-05-12', 3,  87,        2),  -- D: Paella de pollo     [butterbeans]
-- Tue 13 May  (oily fish #1)
(1, '2026-05-13', 1, 130,        2),  -- B: Overnight Oats
(1, '2026-05-13', 2,  23,        2),  -- L: Chicken & Veg Soup
(1, '2026-05-13', 3, @r_light,   2),  -- D: NEW Salmon          [oily fish]
-- Wed 14 May
(1, '2026-05-14', 1, 124,        2),  -- B: Hash Browns & Diced Chicken
(1, '2026-05-14', 2,  95,        2),  -- L: Tortilla Espanola
(1, '2026-05-14', 3, 108,        2),  -- D: Drunken Noodles
-- Thu 15 May
(1, '2026-05-15', 1,   1,        2),  -- B: Porridge
(1, '2026-05-15', 2,  57,        2),  -- L: Chicken Burrito Bowl [black beans]
(1, '2026-05-15', 3, 133,        2),  -- D: Tamarind Tossed Noodles
-- Fri 16 May
(1, '2026-05-16', 1, 130,        2),  -- B: Overnight Oats
(1, '2026-05-16', 2, 127,        2),  -- L: Reina Arepa
(1, '2026-05-16', 3,  16,        2),  -- D: Chicken Satay
-- Sat 17 May  (oily fish #2)
(1, '2026-05-17', 1, 124,        2),  -- B: Hash Browns & Diced Chicken
(1, '2026-05-17', 2,  20,        2),  -- L: Black Bean Chicken Wrap [legumes]
(1, '2026-05-17', 3,  69,        2),  -- D: Salmon & Asparagus      [oily fish]
-- Sun 18 May
(1, '2026-05-18', 1,   1,        2),  -- B: Porridge
(1, '2026-05-18', 2,  33,        2),  -- L: Lentil Stuffed Peppers  [legumes]
(1, '2026-05-18', 3,  40,        2);  -- D: Chicken Tikka Masala

COMMIT;

-- ============================================================
-- Sanity-check queries (run after commit if you want to verify)
-- ============================================================
-- SELECT * FROM recipe_family_members WHERE family_id = @family_id;
-- SELECT plan_date, m.name AS meal, r.name AS recipe
--   FROM meal_plan_entries mpe
--   JOIN meals m   ON m.id = mpe.meal_id
--   JOIN recipes r ON r.id = mpe.recipe_id
--   WHERE mpe.user_id = 1 AND plan_date BETWEEN '2026-05-12' AND '2026-05-18'
--   ORDER BY plan_date, m.id;

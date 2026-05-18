-- ============================================================
-- Mediterranean Salmon with Sweet Potato & Broccoli (3 variants)
-- + Saturday 2026-05-17 dinner swap (replaces Salmon & Asparagus #69)
--
-- Why: user dislikes asparagus; wants a second distinct salmon
-- dish so the week's two oily-fish dinners aren't identical.
-- Skill-aligned: Mediterranean (olive oil, oily fish), sweet
-- potato over white potato (lower GI, more beta-carotene), broccoli
-- as cruciferous vegetable.
-- ============================================================

START TRANSACTION;

-- -----------------------------------------------------------
-- 1. Recipe family
-- -----------------------------------------------------------
INSERT INTO recipe_families (family_name, description)
VALUES ('Mediterranean Salmon with Sweet Potato & Broccoli',
        'Roasted salmon with sweet potato wedges and lemon-garlic broccoli - low-GI carbs, omega-3, cruciferous veg.');
SET @family_id = LAST_INSERT_ID();

-- -----------------------------------------------------------
-- 2. LIGHT variant (~535 kcal/serving, 33 g protein)
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean Salmon with Sweet Potato & Broccoli', 2, 1066, 0, 1);
SET @r_light = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_light, 0, 'Light', 1);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_light, 109, 260,  1,  260, 1),  -- Salmon Fillet
(@r_light,  15, 340,  1,  340, 2),  -- Sweet potato
(@r_light,  51, 280,  1,  280, 3),  -- Broccoli
(@r_light,  22,  12,  1,   12, 4),  -- Olive oil
(@r_light,  88,  24,  1,   24, 5),  -- Lemon (juice + wedges)
(@r_light,  13,  12,  1,   12, 6),  -- Garlic
(@r_light, 156,   4,  1,    4, 7),  -- Fresh Dill
(@r_light,   5,   6,  1,    6, 8),  -- Salt
(@r_light,  50,   1,  1,    1, 9);  -- Black pepper

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_light, 1, 'Preheat oven to 200 C / 400 F. Cut sweet potatoes into 2 cm wedges. Toss with half the olive oil, half the salt, and a pinch of pepper.'),
(@r_light, 2, 'Roast sweet potato wedges on a lined tray for 22-25 minutes, turning halfway, until edges caramelise.'),
(@r_light, 3, 'Pat the salmon dry. Rub with the remaining olive oil, half the chopped dill, salt, and pepper. Roast skin-side down for 10-12 minutes (just opaque).'),
(@r_light, 4, 'Cut broccoli into florets. Steam 4-5 minutes until bright and tender-crisp.'),
(@r_light, 5, 'Toss the warm broccoli with crushed garlic, lemon juice, the remaining dill, and a small pinch of salt. Plate with lemon wedges.');

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_light, 3);

-- -----------------------------------------------------------
-- 3. MODERATE variant (~665 kcal/serving, 40 g protein) - default
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean Salmon with Sweet Potato & Broccoli', 2, 1328, 0, 1);
SET @r_mod = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_mod, 1, 'Moderate', 2);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_mod, 109, 320,  1,  320, 1),
(@r_mod,  15, 440,  1,  440, 2),
(@r_mod,  51, 320,  1,  320, 3),
(@r_mod,  22,  16,  1,   16, 4),
(@r_mod,  88,  30,  1,   30, 5),
(@r_mod,  13,  14,  1,   14, 6),
(@r_mod, 156,   5,  1,    5, 7),
(@r_mod,   5,   6,  1,    6, 8),
(@r_mod,  50, 1.5,  1,  1.5, 9);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_mod, 1, 'Preheat oven to 200 C / 400 F. Cut sweet potatoes into 2 cm wedges. Toss with half the olive oil, half the salt, and a pinch of pepper.'),
(@r_mod, 2, 'Roast sweet potato wedges on a lined tray for 24-28 minutes, turning halfway.'),
(@r_mod, 3, 'Pat the salmon dry. Rub with remaining olive oil, half the chopped dill, salt, and pepper. Roast skin-side down for 11-13 minutes.'),
(@r_mod, 4, 'Cut broccoli into florets. Steam 4-5 minutes until bright and tender-crisp.'),
(@r_mod, 5, 'Toss broccoli with crushed garlic, lemon juice, remaining dill, and a small pinch of salt. Plate with lemon wedges.');

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_mod, 3);

-- -----------------------------------------------------------
-- 4. BALANCED variant (~825 kcal/serving, 50 g protein)
-- -----------------------------------------------------------
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live)
VALUES ('Mediterranean Salmon with Sweet Potato & Broccoli', 2, 1650, 0, 1);
SET @r_bal = LAST_INSERT_ID();

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(@family_id, @r_bal, 0, 'Balanced', 3);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(@r_bal, 109, 400,  1,  400, 1),
(@r_bal,  15, 560,  1,  560, 2),
(@r_bal,  51, 360,  1,  360, 3),
(@r_bal,  22,  20,  1,   20, 4),
(@r_bal,  88,  36,  1,   36, 5),
(@r_bal,  13,  16,  1,   16, 6),
(@r_bal, 156,   6,  1,    6, 7),
(@r_bal,   5,   7,  1,    7, 8),
(@r_bal,  50,   2,  1,    2, 9);

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(@r_bal, 1, 'Preheat oven to 200 C / 400 F. Cut sweet potatoes into 2 cm wedges. Toss with half the olive oil, half the salt, and pepper.'),
(@r_bal, 2, 'Roast sweet potato wedges for 26-30 minutes, turning halfway.'),
(@r_bal, 3, 'Pat the salmon dry. Rub with remaining olive oil, half the chopped dill, salt, and pepper. Roast skin-side down for 12-14 minutes.'),
(@r_bal, 4, 'Cut broccoli into florets. Steam 4-5 minutes.'),
(@r_bal, 5, 'Toss broccoli with crushed garlic, lemon juice, remaining dill, and salt. Plate generously with lemon wedges.');

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (@r_bal, 3);

-- -----------------------------------------------------------
-- 5. Swap Saturday 2026-05-17 dinner to the new Light variant
--    (replaces previous Salmon & Asparagus #69)
-- -----------------------------------------------------------
UPDATE meal_plan_entries
   SET recipe_id = @r_light
 WHERE user_id   = 1
   AND plan_date = '2026-05-17'
   AND meal_id   = 3;

COMMIT;

-- ============================================================
-- Verify
-- ============================================================
-- SELECT plan_date, m.name AS meal, r.name AS recipe
--   FROM meal_plan_entries mpe
--   JOIN meals m   ON m.id = mpe.meal_id
--   JOIN recipes r ON r.id = mpe.recipe_id
--   WHERE mpe.user_id = 1 AND plan_date = '2026-05-17'
--   ORDER BY m.id;

-- 2026-07-30  Audit remediation part 3 — Paella Valenciana becomes a family
--
-- Recipe 90 was a family of ONE (recipe_families 26, variant_label NULL,
-- display_order 1, is_default 1), violating .claude/rules/recipe-variants.md:
-- every meal recipe ships as Light/Moderate/Balanced. It also breached the fat
-- ceiling at 35.2 %.
--
-- default_servings stays 4 — this is a shareable pan dish, confirmed with the
-- developer.
--
-- Fat fix on 90: olive oil 46 -> 32 g  =>  fat 35.2 % -> 32.7 %.
--
-- Scaling for the siblings. Chicken wings are 18 g protein / 15 g fat per 100 g,
-- so they carry the protein AND the fat. Scaling wings down to make a Light
-- drops protein to 28.6 g/srv, which fails the 35 g floor. All three variants
-- therefore keep all 8 wings (530 g); the levers are olive oil (22), paella
-- rice (132) and butterbeans (135):
--
--            wings   oil    rice   beans  | P/srv  fat%   carb%  kcal/srv
--   Light      530   20 g   300 g  280 g  | 36.3   33.6   45.9    708
--   Moderate   530   32 g   400 g  240 g  | 37.4   32.7   48.9    812
--   Balanced   530   40 g   480 g  280 g  | 39.5   31.3   51.3    910
--
-- Balanced's row is the MEASURED result (2026-07-30, post-apply). The plan
-- projected 45.5 / 33.7 / 47.7 / 979, which was arithmetically impossible:
-- wings are identical across all three variants, so protein/srv moves only with
-- the rice and bean rows (~+2 g, not +8 g). All three still pass
-- protein >= 35 g, fat <= 35 %, carbs >= 38 %. Balanced's 51.3 % carbs is
-- over the 50 % design target but is NOT a reject under the 2026-07-30 policy.
--
-- All three pass protein >= 35 g, fat <= 35 %, carbs >= 38 %. kcal is advisory
-- under the 2026-07-30 policy and is not banded here.
--
-- Water scales with the rice at the original 2.25:1 ratio (900 ml : 400 g), so
-- step 5's text is rewritten per variant.
--
-- Idempotent: all inserts guarded on the target recipe id, updates absolute.

-- ---------------------------------------------------------------------------
-- 1. Fix recipe 90's fat, and label it Moderate.
--    The olive oil row is stored in ml (unit_id 2): 32 g / 0.92 g per ml ~= 35 ml.
-- ---------------------------------------------------------------------------
UPDATE recipe_ingredients SET quantity = 35.00, quantity_grams = 32.00
WHERE recipe_id = 90 AND ingredient_id = 22;

UPDATE recipes SET calories = 3249 WHERE id = 90;

UPDATE recipe_family_members
SET variant_label = 'Moderate', display_order = 2, is_default = 1
WHERE family_id = 26 AND recipe_id = 90;

-- ---------------------------------------------------------------------------
-- 2. The two new recipes (208 Light, 209 Balanced). MAX(recipes.id) was 207.
-- ---------------------------------------------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 208, 'Paella Valenciana', 4, 2831, 0, 1, 0
FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT id FROM recipes) AS ex WHERE ex.id = 208);

-- CORRECTED AT APPLY TIME, 2026-07-30: was 3915. The plan projected Balanced at
-- P 45.5 g/srv and 979 kcal/srv, but all three variants share the same 530 g of
-- wings, so protein/serving cannot jump 8 g between siblings. Measured against
-- the live rows after insert: P 39.5 g/srv, fat 31.3 %, carbs 51.3 %,
-- 910 kcal/srv => whole-recipe 3641. The old 3915 tripped the >5 %
-- stored_cal_check and would have blocked macros_audited on family 26.
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 209, 'Paella Valenciana', 4, 3641, 0, 1, 0
FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT id FROM recipes) AS ex WHERE ex.id = 209);

-- 3. Meal slot — 3 = Dinner, matching recipe 90.
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 208, 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id, meal_id FROM recipe_meals) AS ex
                  WHERE ex.recipe_id = 208 AND ex.meal_id = 3);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 209, 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id, meal_id FROM recipe_meals) AS ex
                  WHERE ex.recipe_id = 209 AND ex.meal_id = 3);

-- ---------------------------------------------------------------------------
-- 4. Ingredients — clone recipe 90's 13 rows, scaling only 22 / 132 / 135.
--    The Tomato passata row (ingredient 136 + linked_recipe_id 12) is copied
--    verbatim so the FR-103 dual path survives on both siblings.
--
--    NOTE on the guard below: each `NOT EXISTS (... WHERE ex.recipe_id = 208)`
--    (and 209) is a WHOLE-RECIPE guard, not the per-row `(recipe_id,
--    ingredient_id)` / `(recipe_id, linked_recipe_id)` guard that
--    chef/SKILL.md step 7a documents as the standard idempotency pattern for
--    `recipe_ingredients`. That divergence is safe here ONLY because each
--    clone below is a single atomic multi-row `INSERT ... SELECT` — under
--    InnoDB it is all-or-nothing on retry, so "any row landed" and "all rows
--    landed" are the same state. Do NOT copy this whole-recipe-guard pattern
--    into a context that issues several separate single-row `INSERT`
--    statements: a partial run there could leave some rows present while
--    others failed, and a whole-recipe guard checked against the same table
--    would then block the remaining rows from ever landing on a retry — the
--    per-row guard from step 7a is required in that shape of script.
-- ---------------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 208, src.ingredient_id, src.linked_recipe_id,
       CASE src.ingredient_id WHEN  22 THEN  22.00 WHEN 132 THEN 300.00 WHEN 135 THEN 280.00 ELSE src.quantity END,
       src.unit_id,
       CASE src.ingredient_id WHEN  22 THEN  20.00 WHEN 132 THEN 300.00 WHEN 135 THEN 280.00 ELSE src.quantity_grams END,
       src.sort_order
FROM (SELECT ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order
      FROM recipe_ingredients WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_ingredients) AS ex WHERE ex.recipe_id = 208);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 209, src.ingredient_id, src.linked_recipe_id,
       CASE src.ingredient_id WHEN  22 THEN  43.00 WHEN 132 THEN 480.00 WHEN 135 THEN 280.00 ELSE src.quantity END,
       src.unit_id,
       CASE src.ingredient_id WHEN  22 THEN  40.00 WHEN 132 THEN 480.00 WHEN 135 THEN 280.00 ELSE src.quantity_grams END,
       src.sort_order
FROM (SELECT ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order
      FROM recipe_ingredients WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_ingredients) AS ex WHERE ex.recipe_id = 209);

-- ---------------------------------------------------------------------------
-- 5. Steps — clone all 10, preserving step 3's linked_recipe_id (12) and its
--    alt_instruction so the homemade/store-bought sauce path survives.
-- ---------------------------------------------------------------------------
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 208, src.step_number, src.instruction, src.tip, src.linked_recipe_id, src.alt_instruction
FROM (SELECT step_number, instruction, tip, linked_recipe_id, alt_instruction
      FROM recipe_steps WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_steps) AS ex WHERE ex.recipe_id = 208);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 209, src.step_number, src.instruction, src.tip, src.linked_recipe_id, src.alt_instruction
FROM (SELECT step_number, instruction, tip, linked_recipe_id, alt_instruction
      FROM recipe_steps WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_steps) AS ex WHERE ex.recipe_id = 209);

-- 6. Water scales with the rice (2.25 ml per g of rice).
--    Light 300 g -> 675 ml; Balanced 480 g -> 1080 ml.
UPDATE recipe_steps SET instruction = REPLACE(instruction, '900ml', '675ml')
WHERE recipe_id = 208 AND step_number = 5;

UPDATE recipe_steps SET instruction = REPLACE(instruction, '900ml', '1080ml')
WHERE recipe_id = 209 AND step_number = 5;

-- ---------------------------------------------------------------------------
-- 7. Family membership — Light 1, Moderate 2 (default), Balanced 3
-- ---------------------------------------------------------------------------
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 26, 208, 0, 'Light', 1 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT family_id, recipe_id FROM recipe_family_members) AS ex
                  WHERE ex.family_id = 26 AND ex.recipe_id = 208);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 26, 209, 0, 'Balanced', 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT family_id, recipe_id FROM recipe_family_members) AS ex
                  WHERE ex.family_id = 26 AND ex.recipe_id = 209);

-- Task 3: Audit and redesign Scrambled Eggs & Toast in place (family 15, recipes 50/51/52)
-- MPP-4-recipe-variety-expansion, Phase 2
-- Executed live against Railway MySQL on 2026-08-10.
-- Redesign presented to developer and approved in chat before this SQL ran.

-- ==========================================================================
-- STEP 1-2: 5-LENS AUDIT FINDINGS (pre-fix state)
-- ==========================================================================
-- Pre-fix per-serving state (recomputed from recipe_ingredients + linked Milk
-- Bread id 26, prorated by quantity_grams / 743g total yield):
--   Light  (50): kcal 459   protein 21.1g  fat% 44.4%  carbs% 37.1%  -- FAIL all 3
--   Moderate(51): kcal 573* protein 22.7g  fat% 52.4%  carbs% 31.2%  -- FAIL all 3
--   Balanced(52): kcal 688  protein 34.2g  fat% 54.6%  carbs% 25.4%  -- FAIL all 3
--   *stored calories/2 = 573.5; recomputed = 553.3 (3.65% drift, within 5% tolerance)
--
-- Findings, ranked:
--   1. Fat% 44-55% of kcal on every variant (target 25-35%) -- butter scaled up
--      with nothing else scaling alongside it.
--   2. Protein fails the >=35g floor on all three (21.1 / 22.7 / 34.2g) -- eggs
--      alone can't clear it, no other protein source in the dish.
--   3. Carbs% fails the >=38% floor on all three (37.1% / 31.2% / 25.4%) -- toast
--      was fixed at 200g on all three variants instead of scaling with the dish.
--   4. is_default = 1 sat on Balanced (recipe 52), not Moderate (51) -- hard
--      structural violation of .claude/rules/recipe-variants.md, independent of
--      the macro issues.
--   5. (Minor, moot once redesigned) Moderate's stored calories (1147) disagreed
--      with the recomputed total (1106.6) by 3.65% -- inside the 5% tolerance.
--
-- What was already correct (no fix needed):
--   - Toast already linked to Milk Bread (id 26) via linked_recipe_id, with a
--     proper recipe_steps row carrying linked_recipe_id=26 + a populated
--     alt_instruction. The plan's predicted "raw bread ingredient" finding did
--     NOT materialize.
--   - Units already cook-friendly (eggs in pieces, butter in tbsp, salt/pepper
--     in tsp) -- no Lens 2 gram-stored-spice fix needed.
--   - meal_id = 1 (Breakfast) correct on all three.

-- ==========================================================================
-- STEP 3: APPROVED REDESIGN -- adds Sliced Ham (id 108, lean 18P/1.5C/3F per
-- 100g) as the missing protein, cuts butter to a cooking-only amount, scales
-- toast per variant instead of holding it fixed at 200g, and gives Balanced
-- an avocado garnish (id 72) as the standard "indulgent lever" instead of
-- more butter. No new ingredients required.
-- ==========================================================================

-- --- Light (recipe 50): 3 eggs / 180g ham / 250g toast / 6g butter ---
UPDATE recipe_ingredients SET quantity = 3.00, quantity_grams = 150.00 WHERE recipe_id = 50 AND ingredient_id = 59;
UPDATE recipe_ingredients SET quantity = 250.00, quantity_grams = 250.00 WHERE recipe_id = 50 AND linked_recipe_id = 26;
UPDATE recipe_ingredients SET quantity = 1.25, unit_id = 3, quantity_grams = 6.00 WHERE recipe_id = 50 AND ingredient_id = 53;
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 50, 108, NULL, 180.00, 1, 180.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 50 AND ingredient_id = 108 AND linked_recipe_id IS NULL);

-- --- Moderate (recipe 51): 4 eggs / 150g ham / 300g toast / 10g butter ---
UPDATE recipe_ingredients SET quantity = 4.00, quantity_grams = 200.00 WHERE recipe_id = 51 AND ingredient_id = 59;
UPDATE recipe_ingredients SET quantity = 300.00, quantity_grams = 300.00 WHERE recipe_id = 51 AND linked_recipe_id = 26;
UPDATE recipe_ingredients SET quantity = 2.00, unit_id = 3, quantity_grams = 10.00 WHERE recipe_id = 51 AND ingredient_id = 53;
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 51, 108, NULL, 150.00, 1, 150.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 51 AND ingredient_id = 108 AND linked_recipe_id IS NULL);

-- --- Balanced (recipe 52): 5 eggs / 200g ham / 350g toast / 10g butter / 40g (1/4) avocado ---
UPDATE recipe_ingredients SET quantity = 5.00, quantity_grams = 250.00 WHERE recipe_id = 52 AND ingredient_id = 59;
UPDATE recipe_ingredients SET quantity = 350.00, quantity_grams = 350.00 WHERE recipe_id = 52 AND linked_recipe_id = 26;
UPDATE recipe_ingredients SET quantity = 2.00, unit_id = 3, quantity_grams = 10.00 WHERE recipe_id = 52 AND ingredient_id = 53;
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 52, 108, NULL, 200.00, 1, 200.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 52 AND ingredient_id = 108 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 52, 72, NULL, 0.25, 5, 40.00, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 52 AND ingredient_id = 72 AND linked_recipe_id IS NULL);

-- --- recipe_steps: wipe-and-reinsert per variant. Adds a "warm the ham" step
-- and a "taste and adjust seasoning" closing step (both missing pre-fix);
-- drops the now-redundant separate toast-buttering step since butter moves
-- entirely into the pan.
DELETE FROM recipe_steps WHERE recipe_id = 50;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(50, 1, 'Toast the bread according to the linked recipe. Use 5 slices @ 50g each (2-3 per person).', 26, 'Toast 5 slices of store-bought bread (~50g each).'),
(50, 2, 'Crack 3 eggs into a cold non-stick pan with the butter (6g). Place over low heat.', NULL, NULL),
(50, 3, 'Stir constantly with a spatula, scraping the bottom. Cook 5-7 minutes, removing from heat occasionally to prevent overcooking.', NULL, NULL),
(50, 4, 'When the eggs form soft, creamy curds with no liquid remaining, remove from heat. Season with salt and pepper.', NULL, NULL),
(50, 5, 'Warm the sliced ham (180g) in the same pan for 30-60 seconds per side.', NULL, NULL),
(50, 6, 'Plate the scrambled eggs and ham on the toast. Taste and adjust seasoning before serving.', NULL, NULL);

DELETE FROM recipe_steps WHERE recipe_id = 51;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(51, 1, 'Toast the bread according to the linked recipe. Use 6 slices @ 50g each (3 per person).', 26, 'Toast 6 slices of store-bought bread (~50g each).'),
(51, 2, 'Crack 4 eggs into a cold non-stick pan with the butter (10g). Place over low heat.', NULL, NULL),
(51, 3, 'Stir constantly with a spatula, scraping the bottom. Cook 5-7 minutes, removing from heat occasionally to prevent overcooking.', NULL, NULL),
(51, 4, 'When the eggs form soft, creamy curds with no liquid remaining, remove from heat. Season with salt and pepper.', NULL, NULL),
(51, 5, 'Warm the sliced ham (150g) in the same pan for 30-60 seconds per side.', NULL, NULL),
(51, 6, 'Plate the scrambled eggs and ham on the toast. Taste and adjust seasoning before serving.', NULL, NULL);

DELETE FROM recipe_steps WHERE recipe_id = 52;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(52, 1, 'Toast the bread according to the linked recipe. Use 7 slices @ 50g each (3-4 per person).', 26, 'Toast 7 slices of store-bought bread (~50g each).'),
(52, 2, 'Crack 5 eggs into a cold non-stick pan with the butter (10g). Place over low heat.', NULL, NULL),
(52, 3, 'Stir constantly with a spatula, scraping the bottom. Cook 5-7 minutes, removing from heat occasionally to prevent overcooking.', NULL, NULL),
(52, 4, 'When the eggs form soft, creamy curds with no liquid remaining, remove from heat. Season with salt and pepper.', NULL, NULL),
(52, 5, 'Warm the sliced ham (200g) in the same pan for 30-60 seconds per side.', NULL, NULL),
(52, 6, 'Plate the scrambled eggs and ham on the toast, and top with the sliced avocado. Taste and adjust seasoning before serving.', NULL, NULL);

-- --- recipes.calories (whole-recipe, homemade basis) ---
UPDATE recipes SET calories = 1041 WHERE id = 50;
UPDATE recipes SET calories = 1231 WHERE id = 51;
UPDATE recipes SET calories = 1548 WHERE id = 52;

-- --- is_default fix: was on Balanced, must be Moderate ---
UPDATE recipe_family_members SET is_default = 1 WHERE family_id = 15 AND recipe_id = 51;
UPDATE recipe_family_members SET is_default = 0 WHERE family_id = 15 AND recipe_id = 52;

-- ==========================================================================
-- STEP 4: RECOMPUTED POST-FIX MACROS (raw ingredients + prorated Milk Bread,
-- 250/300/350g of the 743g total yield)
-- ==========================================================================
--                    Whole recipe (÷2)                     | Per serving          | Fat%   Carbs%
-- Light  (50): P 72.07  C 108.04  F 35.63  kcal 1041        | P 36.03 C 54.02 F 17.82 kcal 520.6 | 30.8%  41.5%
-- Moderate(51): P 77.21  C 128.79  F 45.24  kcal 1231        | P 38.60 C 64.39 F 22.62 kcal 615.6 | 33.1%  41.8%
-- Balanced(52): P 97.52  C 154.32  F 60.01  kcal 1547        | P 48.76 C 77.16 F 30.01 kcal 773.7 | 34.9%  39.9%
--
-- All three clear every reject condition: protein >=35g/srv, fat 25-35%,
-- carbs >=38% (Balanced at 39.9% is under the 40% target but well clear of
-- the 38% reject floor). Ordering 520.6 < 615.6 < 773.7, gaps 95.0 / 158.1
-- both >=80 advisory. Stored calories (1041/1231/1548) agree with recomputed
-- whole-recipe kcal (1041.15/1231.14/1547.43) within <0.1%.

UPDATE recipes
SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (50, 51, 52);
-- Result: all three rows macros_audited=1. macros_audited_by left NULL (agent-run audit).

-- Verify is_default landed correctly:
SELECT rfm.variant_label, r.id, r.macros_audited, rfm.is_default
FROM recipe_family_members rfm JOIN recipes r ON r.id = rfm.recipe_id
WHERE rfm.family_id = 15 ORDER BY rfm.display_order;
-- Result: Light(50) is_default=0, Moderate(51) is_default=1, Balanced(52) is_default=0. Correct.

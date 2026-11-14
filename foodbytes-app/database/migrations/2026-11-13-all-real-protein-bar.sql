-- 2026-11-13 — New snack family: All Real Protein Bar (Choc Hazelnut) (family 123, recipes 303/304/305)
-- Store-bought 50 g bar. Light = 1 bar, Moderate = 2 bars, Balanced = 3 bars.
-- Macros per 100 g from the pack label (photo, 2026-11-13): 359 kcal, fat 11 g (sat 3.3), carbs 25 g (sugars 18),
-- fibre 16 g, protein 33 g, salt 0.20 g. Per 50 g bar: 180 kcal, P 16 g, C 13 g, F 5.7 g.
-- Per serving (Atwater 4/4/9, excludes fibre): Light 166 kcal / 16.5 g P | Moderate 331 / 33.0 | Balanced 497 / 49.5
-- Snack product: does NOT meet the meal targets (carbs ~30 % of kcal; Light/Moderate protein < 35 g). Do not mark macros_audited.
-- Idempotent: safe to re-run. The trailing UPDATEs also correct an earlier draft (25 g mini bars) if that was applied.

-- 1. Ingredient (dedup checked 2026-11-13: no existing protein bar row; only 'Whey protein isolate' #163)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 204, 'all_real_protein_bar_choc_hazelnut', 'All Real protein bar (choc hazelnut)', 17, 33.00, 25.00, 11.00, 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE id = 204 OR `key` = 'all_real_protein_bar_choc_hazelnut'
                  OR LOWER(name) = 'all real protein bar (choc hazelnut)');
UPDATE ingredients SET `key` = 'all_real_protein_bar_choc_hazelnut', name = 'All Real protein bar (choc hazelnut)',
       aisle_id = 17, protein_per_100g = 33.00, carbs_per_100g = 25.00, fat_per_100g = 11.00, macros_verified = 1
WHERE id = 204;

-- 2. Recipes (calories = whole-recipe kcal, 1 serving each)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 303, 'All Real Protein Bar (Choc Hazelnut)', 1, 166, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 303);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 304, 'All Real Protein Bar (Choc Hazelnut)', 1, 331, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 304);
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 305, 'All Real Protein Bar (Choc Hazelnut)', 1, 497, 0, 1 WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 305);
UPDATE recipes SET name = 'All Real Protein Bar (Choc Hazelnut)', default_servings = 1,
       calories = CASE id WHEN 303 THEN 166 WHEN 304 THEN 331 WHEN 305 THEN 497 END
WHERE id IN (303, 304, 305);

-- 3. Meals (Snacks = 4)
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 303, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 303 AND meal_id = 4);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 304, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 304 AND meal_id = 4);
INSERT INTO recipe_meals (recipe_id, meal_id) SELECT 305, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 305 AND meal_id = 4);

-- 4. Recipe ingredients (unit 5 = piece; 50 g per bar)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 303, 204, NULL, 1, 5, 50, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 303 AND ingredient_id <=> 204);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 304, 204, NULL, 2, 5, 100, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 304 AND ingredient_id <=> 204);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 305, 204, NULL, 3, 5, 150, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 305 AND ingredient_id <=> 204);
UPDATE recipe_ingredients SET quantity_grams = quantity * 50 WHERE recipe_id IN (303, 304, 305) AND ingredient_id = 204;

-- 5. Steps (wipe + re-insert = idempotent)
DELETE FROM recipe_steps WHERE recipe_id IN (303, 304, 305);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction) VALUES
(303, 1, 'Unwrap and eat 1 bar (50g).', NULL, NULL, NULL),
(304, 1, 'Unwrap and eat 2 bars (100g).', NULL, NULL, NULL),
(305, 1, 'Unwrap and eat 3 bars (150g).', NULL, NULL, NULL);

-- 6. Family
INSERT INTO recipe_families (id, family_name, description)
SELECT 123, 'All Real Protein Bar (Choc Hazelnut)', 'Store-bought 50g chocolate hazelnut protein bars made in Ireland with grass-fed milk protein. Pick 1, 2 or 3 bars.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 123);
UPDATE recipe_families SET family_name = 'All Real Protein Bar (Choc Hazelnut)',
       description = 'Store-bought 50g chocolate hazelnut protein bars made in Ireland with grass-fed milk protein. Pick 1, 2 or 3 bars.'
WHERE id = 123;

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 123, 303, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 303);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 123, 304, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 304);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 123, 305, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 305);

-- =============================================
-- PEANUT BUTTER BANANA OVERNIGHT OATS
-- 3 variants: Light (130), Moderate (131), Balanced (132)
-- Family ID: 39
-- =============================================

-- STEP 1: New ingredients
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(162, 'chia_seeds', 'Chia seeds', 15, 16.50, 42.10, 30.70, TRUE);

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(163, 'whey_protein_isolate', 'Whey protein isolate', 17, 80.65, 0.00, 1.61, TRUE);

-- STEP 2: Recipes (all same name — variant label comes from family)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(130, 'Peanut Butter Banana Overnight Oats', 2, 1052, FALSE, TRUE),
(131, 'Peanut Butter Banana Overnight Oats', 2, 1267, FALSE, TRUE),
(132, 'Peanut Butter Banana Overnight Oats', 2, 1558, FALSE, TRUE);

-- STEP 3: Meal assignment (all breakfast)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(130, 1),
(131, 1),
(132, 1);

-- STEP 4: Recipe family
INSERT INTO recipe_families (id, family_name, description) VALUES
(39, 'Peanut Butter Banana Overnight Oats', 'Overnight oats with chia seeds, Greek yogurt, whey protein, peanut butter and banana. Prep night before.');

-- STEP 5: Family members (Balanced = default)
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(39, 131, FALSE, 'Moderate', 1),
(39, 130, FALSE, 'Light', 2),
(39, 132, TRUE, 'Balanced', 3);

-- STEP 6: Recipe ingredients — LIGHT (130)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(130, 1, NULL, 60, 1, 60.00, 1),
(130, 162, NULL, 20, 1, 20.00, 2),
(130, 163, NULL, 50, 1, 50.00, 3),
(130, 104, NULL, 160, 2, 160.00, 4),
(130, 49, NULL, 240, 1, 240.00, 5),
(130, 6, NULL, 24, 1, 24.00, 6),
(130, 4, NULL, 16, 1, 16.00, 7),
(130, 10, NULL, 100, 1, 100.00, 8);

-- STEP 7: Recipe ingredients — MODERATE (131)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(131, 1, NULL, 84, 1, 84.00, 1),
(131, 162, NULL, 24, 1, 24.00, 2),
(131, 163, NULL, 50, 1, 50.00, 3),
(131, 104, NULL, 220, 2, 220.00, 4),
(131, 49, NULL, 260, 1, 260.00, 5),
(131, 6, NULL, 30, 1, 30.00, 6),
(131, 4, NULL, 20, 1, 20.00, 7),
(131, 10, NULL, 100, 1, 100.00, 8);

-- STEP 8: Recipe ingredients — BALANCED (132)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(132, 1, NULL, 110, 1, 110.00, 1),
(132, 162, NULL, 30, 1, 30.00, 2),
(132, 163, NULL, 50, 1, 50.00, 3),
(132, 104, NULL, 260, 2, 260.00, 4),
(132, 49, NULL, 260, 1, 260.00, 5),
(132, 6, NULL, 40, 1, 40.00, 6),
(132, 4, NULL, 24, 1, 24.00, 7),
(132, 10, NULL, 160, 1, 160.00, 8);

-- STEP 9: Recipe steps — LIGHT (130)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(130, 1, 'Split 60g rolled oats, 20g chia seeds, and 50g whey protein isolate evenly between 2 jars or containers.'),
(130, 2, 'Pour 80ml whole milk into each jar. Spoon 120g Greek yogurt (0% fat) into each. Stir well until combined.'),
(130, 3, 'Add 12g peanut butter and 8g honey to each jar. Swirl through — don''t fully mix for a ripple effect.'),
(130, 4, 'Slice banana and place 50g on top of each jar.'),
(130, 5, 'Seal with lid, refrigerate overnight (minimum 4 hours).'),
(130, 6, 'Eat cold straight from the jar, or microwave 1-2 minutes if you prefer it warm.');

-- STEP 10: Recipe steps — MODERATE (131)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(131, 1, 'Split 84g rolled oats, 24g chia seeds, and 50g whey protein isolate evenly between 2 jars or containers.'),
(131, 2, 'Pour 110ml whole milk into each jar. Spoon 130g Greek yogurt (0% fat) into each. Stir well until combined.'),
(131, 3, 'Add 15g peanut butter and 10g honey to each jar. Swirl through — don''t fully mix for a ripple effect.'),
(131, 4, 'Slice banana and place 50g on top of each jar.'),
(131, 5, 'Seal with lid, refrigerate overnight (minimum 4 hours).'),
(131, 6, 'Eat cold straight from the jar, or microwave 1-2 minutes if you prefer it warm.');

-- STEP 11: Recipe steps — BALANCED (132)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(132, 1, 'Split 110g rolled oats, 30g chia seeds, and 50g whey protein isolate evenly between 2 jars or containers.'),
(132, 2, 'Pour 130ml whole milk into each jar. Spoon 130g Greek yogurt (0% fat) into each. Stir well until combined.'),
(132, 3, 'Add 20g peanut butter and 12g honey to each jar. Swirl through — don''t fully mix for a ripple effect.'),
(132, 4, 'Slice banana and place 80g on top of each jar.'),
(132, 5, 'Seal with lid, refrigerate overnight (minimum 4 hours).'),
(132, 6, 'Eat cold straight from the jar, or microwave 1-2 minutes if you prefer it warm.');

-- =============================================
-- VERIFICATION
-- =============================================
SELECT r.id, r.name, r.calories, rfm.variant_label, rfm.is_default
FROM recipes r
JOIN recipe_family_members rfm ON rfm.recipe_id = r.id
WHERE rfm.family_id = 39
ORDER BY rfm.display_order;

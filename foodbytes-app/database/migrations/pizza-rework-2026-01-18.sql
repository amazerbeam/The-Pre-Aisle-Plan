-- =============================================
-- PIZZA FAMILY REWORK - 2026-01-18
-- =============================================
-- Changes:
-- 1. Pizza Sauce (12): Remove pesto link, simplify to tomato-only
-- 2. Pizza variants (13, 14, 15, 107): Smaller pizzas with chicken + mushrooms
--    - Light (7"): 100g dough, 110g chicken
--    - Moderate (8"): 130g dough, 100g chicken
--    - Balanced 1 (9"): 170g dough, 100g chicken
--    - Balanced 2 (9"): 170g dough, 80g chicken + 15g pepperoni
-- 3. Add pepperoni ingredient
-- 4. Pizza Dough (11): NO CHANGES - keeping 4 tbsp oil
-- =============================================

-- =============================================
-- STEP 1: ADD NEW INGREDIENT - PEPPERONI
-- =============================================
-- Properoni from Tesco Ireland: 479 cal, 22g protein, 1g carbs, 43g fat per 100g
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(149, 'pepperoni', 'Pepperoni', 1, 22.00, 1.00, 43.00, TRUE);

-- =============================================
-- STEP 2: DELETE OLD PIZZA SAUCE (Recipe 12)
-- =============================================
-- Remove link to Pesto
DELETE FROM recipe_extras WHERE parent_recipe_id = 12;

-- Remove old ingredients
DELETE FROM recipe_ingredients WHERE recipe_id = 12;

-- Remove old steps
DELETE FROM recipe_steps WHERE recipe_id = 12;

-- Update recipe calories (198 cal total for 8 servings)
UPDATE recipes SET calories = 198 WHERE id = 12;

-- =============================================
-- STEP 3: INSERT NEW PIZZA SAUCE INGREDIENTS
-- Makes ~420g, 8 servings, ~198 cal total
-- Simple crushed tomato sauce - no pesto
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(12, 33, NULL, 1, 15, 400.00, 1),    -- Tinned tomatoes, 1 tin (400g)
(12, 22, NULL, 0.75, 4, 10.00, 2),   -- Olive oil, 3/4 tbsp (10g)
(12, 13, NULL, 2, 10, 6.00, 3),      -- Garlic, 2 cloves (6g)
(12, 5, NULL, 1, 3, 6.00, 4),        -- Salt, 1 tsp
(12, 35, NULL, 1, 3, 2.00, 5),       -- Oregano, 1 tsp
(12, 36, NULL, 1, 3, 4.00, 6);       -- Sugar, 1 tsp

-- =============================================
-- STEP 4: INSERT NEW PIZZA SAUCE STEPS
-- =============================================
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(12, 1, 'Heat olive oil in a saucepan over medium heat. Add garlic and cook for 30 seconds until fragrant but not browned.', NULL, NULL),
(12, 2, 'Crush the tinned tomatoes by hand or with a fork directly into the pan. Add all the liquid from the tin.', NULL, NULL),
(12, 3, 'Stir in the oregano, sugar, and salt.', NULL, NULL),
(12, 4, 'Bring to a gentle simmer. Cook uncovered for 8-10 minutes, stirring occasionally, until slightly thickened.', NULL, NULL),
(12, 5, 'Taste and adjust seasoning. For a smoother sauce, blend briefly with an immersion blender.', NULL, NULL),
(12, 6, 'Store refrigerated for up to 5 days, or freeze for up to 3 months.', NULL, NULL);

-- =============================================
-- STEP 5: DELETE OLD PIZZA RECIPES (13, 14, 15)
-- =============================================
-- Remove recipe family links
DELETE FROM recipe_extras WHERE parent_recipe_id IN (13, 14, 15);

-- Remove old ingredients
DELETE FROM recipe_ingredients WHERE recipe_id IN (13, 14, 15);

-- Remove old steps
DELETE FROM recipe_steps WHERE recipe_id IN (13, 14, 15);

-- Remove old recipe_meals
DELETE FROM recipe_meals WHERE recipe_id IN (13, 14, 15);

-- Delete old recipes
DELETE FROM recipes WHERE id IN (13, 14, 15);

-- =============================================
-- STEP 6: INSERT NEW PIZZA RECIPES
-- =============================================

-- Recipe 13: Pizza Light - 7" thin, chicken + mushrooms
-- Total: ~1092 cal (2 servings, 546 cal each)
-- Per serving: 100g dough, 35g sauce, 25g mozz, 110g chicken, 30g mushrooms
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(13, 'Pizza', 2, 1092, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (13, 3);  -- Dinner

-- Recipe 14: Pizza Moderate - 8", chicken + mushrooms
-- Total: ~1288 cal (2 servings, 644 cal each)
-- Per serving: 130g dough, 45g sauce, 35g mozz, 100g chicken, 40g mushrooms
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(14, 'Pizza', 2, 1288, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (14, 3);  -- Dinner

-- Recipe 15: Pizza Balanced 1 - 9", chicken + mushrooms (no pepperoni)
-- Total: ~1602 cal (2 servings, 801 cal each)
-- Per serving: 170g dough, 55g sauce, 50g mozz, 100g chicken, 50g mushrooms
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(15, 'Pizza', 2, 1602, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (15, 3);  -- Dinner

-- Recipe 78: Pizza Balanced 2 - 9", chicken + pepperoni + mushrooms
-- Total: ~1680 cal (2 servings, 840 cal each)
-- Per serving: 170g dough, 55g sauce, 45g mozz, 80g chicken, 15g pepperoni, 50g mushrooms
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(107, 'Pizza', 2, 1680, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (107, 3);  -- Dinner

-- =============================================
-- STEP 7: INSERT PIZZA LIGHT INGREDIENTS
-- 7" thin crust (100g dough), chicken + mushrooms
-- Per serving: 546 cal, 47g protein
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(13, 75, 11, 200, 1, 200.00, 1),     -- Pizza Dough (linked OR store-bought), 200g (100g x 2)
(13, 76, 12, 70, 1, 70.00, 2),       -- Pizza Sauce (linked OR store-bought), 70g (35g x 2)
(13, 37, NULL, 50, 1, 50.00, 3),     -- Mozzarella, 50g (25g x 2)
(13, 11, NULL, 220, 1, 220.00, 4),   -- Chicken breast, 220g (110g x 2)
(13, 70, NULL, 60, 1, 60.00, 5);     -- Mushrooms, 60g (30g x 2)

-- =============================================
-- STEP 8: INSERT PIZZA MODERATE INGREDIENTS
-- 8" (130g dough), chicken + mushrooms
-- Per serving: 644 cal, 48g protein
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(14, 75, 11, 260, 1, 260.00, 1),     -- Pizza Dough (linked OR store-bought), 260g (130g x 2)
(14, 76, 12, 90, 1, 90.00, 2),       -- Pizza Sauce (linked OR store-bought), 90g (45g x 2)
(14, 37, NULL, 70, 1, 70.00, 3),     -- Mozzarella, 70g (35g x 2)
(14, 11, NULL, 200, 1, 200.00, 4),   -- Chicken breast, 200g (100g x 2)
(14, 70, NULL, 80, 1, 80.00, 5);     -- Mushrooms, 80g (40g x 2)

-- =============================================
-- STEP 9: INSERT PIZZA BALANCED 1 INGREDIENTS
-- 9" (170g dough), chicken + mushrooms (NO pepperoni)
-- Per serving: 801 cal, 54g protein
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(15, 75, 11, 340, 1, 340.00, 1),     -- Pizza Dough (linked OR store-bought), 340g (170g x 2)
(15, 76, 12, 110, 1, 110.00, 2),     -- Pizza Sauce (linked OR store-bought), 110g (55g x 2)
(15, 37, NULL, 100, 1, 100.00, 3),   -- Mozzarella, 100g (50g x 2)
(15, 11, NULL, 200, 1, 200.00, 4),   -- Chicken breast, 200g (100g x 2)
(15, 70, NULL, 100, 1, 100.00, 5);   -- Mushrooms, 100g (50g x 2)

-- =============================================
-- STEP 10: INSERT PIZZA BALANCED 2 INGREDIENTS
-- 9" (170g dough), chicken + pepperoni + mushrooms
-- Per serving: 840 cal, 51g protein
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(107, 75, 11, 340, 1, 340.00, 1),     -- Pizza Dough (linked OR store-bought), 340g (170g x 2)
(107, 76, 12, 110, 1, 110.00, 2),     -- Pizza Sauce (linked OR store-bought), 110g (55g x 2)
(107, 37, NULL, 90, 1, 90.00, 3),     -- Mozzarella, 90g (45g x 2)
(107, 11, NULL, 160, 1, 160.00, 4),   -- Chicken breast, 160g (80g x 2)
(107, 149, NULL, 30, 1, 30.00, 5),    -- Pepperoni (cut small), 30g (15g x 2)
(107, 70, NULL, 100, 1, 100.00, 6);   -- Mushrooms, 100g (50g x 2)

-- =============================================
-- STEP 11: INSERT PIZZA RECIPE STEPS
-- =============================================

-- Pizza Light Steps (7" thin)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(13, 1, 'Prepare the pizza dough according to the linked recipe. Use 100g dough per person.', 11, 'Remove 200g store-bought pizza dough from fridge 30 minutes before use.'),
(13, 2, 'Make the pizza sauce using the linked recipe. Use 35g sauce per pizza.', 12, 'Measure out 70g store-bought pizza sauce.'),
(13, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(13, 4, 'Slice chicken breast into thin strips. Season with salt and pepper. Pan-fry in a hot dry pan for 3-4 minutes per side until cooked through. Set aside.', NULL, NULL),
(13, 5, 'Slice mushrooms thinly (about 3mm thick).', NULL, NULL),
(13, 6, 'On a floured surface, stretch each dough portion into a thin 7" circle. Transfer to parchment paper.', NULL, NULL),
(13, 7, 'Spread 35g sauce evenly over each base, leaving a 1cm border.', NULL, NULL),
(13, 8, 'Tear 25g mozzarella per pizza into pieces and distribute evenly. Add sliced chicken (110g) and mushrooms (30g).', NULL, NULL),
(13, 9, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(13, 10, 'Bake for 8-10 minutes until the crust is golden and cheese is bubbling with brown spots.', NULL, NULL),
(13, 11, 'Let rest for 2 minutes before slicing. Serve immediately.', NULL, NULL);

-- Pizza Moderate Steps (8")
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(14, 1, 'Prepare the pizza dough according to the linked recipe. Use 130g dough per person.', 11, 'Remove 260g store-bought pizza dough from fridge 30 minutes before use.'),
(14, 2, 'Make the pizza sauce using the linked recipe. Use 45g sauce per pizza.', 12, 'Measure out 90g store-bought pizza sauce.'),
(14, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(14, 4, 'Slice chicken breast into thin strips. Season with salt and pepper. Pan-fry in a hot dry pan for 3-4 minutes per side until cooked through. Set aside.', NULL, NULL),
(14, 5, 'Slice mushrooms thinly (about 3mm thick).', NULL, NULL),
(14, 6, 'On a floured surface, stretch each dough portion into an 8" circle. Transfer to parchment paper.', NULL, NULL),
(14, 7, 'Spread 45g sauce evenly over each base, leaving a 1cm border.', NULL, NULL),
(14, 8, 'Tear 35g mozzarella per pizza into pieces and distribute evenly. Add sliced chicken (100g) and mushrooms (40g).', NULL, NULL),
(14, 9, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(14, 10, 'Bake for 8-12 minutes until the crust is golden and cheese is bubbling with brown spots.', NULL, NULL),
(14, 11, 'Let rest for 2 minutes before slicing. Serve immediately.', NULL, NULL);

-- Pizza Balanced 1 Steps (9", no pepperoni)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(15, 1, 'Prepare the pizza dough according to the linked recipe. Use 170g dough per person.', 11, 'Remove 340g store-bought pizza dough from fridge 30 minutes before use.'),
(15, 2, 'Make the pizza sauce using the linked recipe. Use 55g sauce per pizza.', 12, 'Measure out 110g store-bought pizza sauce.'),
(15, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(15, 4, 'Slice chicken breast into thin strips. Season with salt and pepper. Pan-fry in a hot dry pan for 3-4 minutes per side until cooked through. Set aside.', NULL, NULL),
(15, 5, 'Slice mushrooms thinly (about 3mm thick).', NULL, NULL),
(15, 6, 'On a floured surface, stretch each dough portion into a 9" circle. Transfer to parchment paper.', NULL, NULL),
(15, 7, 'Spread 55g sauce evenly over each base, leaving a 1cm border.', NULL, NULL),
(15, 8, 'Tear 50g mozzarella per pizza into pieces and distribute evenly. Add sliced chicken (100g) and mushrooms (50g).', NULL, NULL),
(15, 9, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(15, 10, 'Bake for 8-12 minutes until the crust is golden and cheese is bubbling with brown spots.', NULL, NULL),
(15, 11, 'Let rest for 2 minutes before slicing. Serve immediately.', NULL, NULL);

-- Pizza Balanced 2 Steps (9" with pepperoni)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(107, 1, 'Prepare the pizza dough according to the linked recipe. Use 170g dough per person.', 11, 'Remove 340g store-bought pizza dough from fridge 30 minutes before use.'),
(107, 2, 'Make the pizza sauce using the linked recipe. Use 55g sauce per pizza.', 12, 'Measure out 110g store-bought pizza sauce.'),
(107, 3, 'Preheat oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes.', NULL, NULL),
(107, 4, 'Slice chicken breast into thin strips. Season with salt and pepper. Pan-fry in a hot dry pan for 3-4 minutes per side until cooked through. Set aside.', NULL, NULL),
(107, 5, 'Slice mushrooms thinly (about 3mm thick). Cut pepperoni slices into small pieces.', NULL, NULL),
(107, 6, 'On a floured surface, stretch each dough portion into a 9" circle. Transfer to parchment paper.', NULL, NULL),
(107, 7, 'Spread 55g sauce evenly over each base, leaving a 1cm border.', NULL, NULL),
(107, 8, 'Tear 45g mozzarella per pizza into pieces and distribute evenly. Add sliced chicken (80g), pepperoni pieces (15g), and mushrooms (50g).', NULL, NULL),
(107, 9, 'Carefully slide the pizza (on its paper) onto the hot tray or stone.', NULL, NULL),
(107, 10, 'Bake for 8-12 minutes until the crust is golden, cheese is bubbling, and pepperoni edges are slightly crispy.', NULL, NULL),
(107, 11, 'Let rest for 2 minutes before slicing. Serve immediately.', NULL, NULL);

-- =============================================
-- STEP 12: RE-LINK PIZZA RECIPES TO EXTRAS (Dough & Sauce)
-- =============================================
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(13, 11, 0),  -- Pizza Light → Pizza Dough
(13, 12, 1),  -- Pizza Light → Pizza Sauce
(14, 11, 0),  -- Pizza Moderate → Pizza Dough
(14, 12, 1),  -- Pizza Moderate → Pizza Sauce
(15, 11, 0),  -- Pizza Balanced 1 → Pizza Dough
(15, 12, 1),  -- Pizza Balanced 1 → Pizza Sauce
(107, 11, 0),  -- Pizza Balanced 2 → Pizza Dough
(107, 12, 1);  -- Pizza Balanced 2 → Pizza Sauce

-- =============================================
-- STEP 13: UPDATE RECIPE FAMILY
-- =============================================
UPDATE recipe_families
SET description = 'Homemade pizza with from-scratch dough and tomato sauce. All variants include chicken and mushrooms. Balanced 2 adds pepperoni. Sizes: Light 7", Moderate 8", Balanced 9".'
WHERE id = 4;

-- =============================================
-- STEP 14: LINK RECIPES TO FAMILY (recipe_family_members)
-- =============================================
DELETE FROM recipe_family_members WHERE recipe_id IN (13, 14, 15);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(4, 13, FALSE, 'Light', 1),
(4, 14, TRUE, 'Moderate', 2),
(4, 15, FALSE, 'Balanced', 3),
(4, 107, FALSE, 'Balanced 2', 4);

-- =============================================
-- SUMMARY
-- =============================================
-- Pizza Light (13):     7" | 100g dough | 546 cal | 47g protein
-- Pizza Moderate (14):  8" | 130g dough | 644 cal | 48g protein
-- Pizza Balanced 1 (15): 9" | 170g dough | 801 cal | 54g protein (no pepperoni)
-- Pizza Balanced 2 (107): 9" | 170g dough | 840 cal | 51g protein (with pepperoni)
-- Pepperoni ingredient ID: 149
--
-- Pizza Sauce (12): New tomato-only recipe, no pesto link
-- Pizza Dough (11): UNCHANGED - still 4 tbsp (56g) olive oil
-- =============================================

-- =============================================
-- VERIFICATION QUERIES (run separately to check)
-- =============================================
-- SELECT * FROM recipes WHERE id IN (11, 12, 13, 14, 15, 107);
-- SELECT * FROM recipe_ingredients WHERE recipe_id IN (12, 13, 14, 15, 107);
-- SELECT * FROM recipe_steps WHERE recipe_id IN (12, 13, 14, 15, 107);
-- SELECT * FROM recipe_extras WHERE parent_recipe_id IN (12, 13, 14, 15, 107);
-- SELECT * FROM ingredients WHERE id = 149;

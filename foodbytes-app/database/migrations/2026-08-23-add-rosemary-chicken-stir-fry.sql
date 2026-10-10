-- Rosemary Garlic Chicken Stir-Fry with Rice Noodles
-- Family: Light (273) / Moderate (274, default) / Balanced (275)
-- New recipe ids: 273, 274, 275 (MAX(recipes.id) was 272)
-- New family id: 113 (MAX(recipe_families.id) was 112)
-- All statements guarded so re-running this script is a no-op on already-applied rows.

-- 1. Recipes (Light / Moderate / Balanced)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 273, 'Rosemary Garlic Chicken Stir-Fry with Rice Noodles', 2, 1014, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 273);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 274, 'Rosemary Garlic Chicken Stir-Fry with Rice Noodles', 2, 1269, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 274);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live)
SELECT 275, 'Rosemary Garlic Chicken Stir-Fry with Rice Noodles', 2, 1555, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 275);

-- 2. recipe_meals (Dinner = meal_id 3)
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 273, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 273 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 274, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 274 AND meal_id = 3);
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 275, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 275 AND meal_id = 3);

-- 3. recipe_ingredients
-- Ingredient ids used: chicken_breast=11, rice_noodles_flat=137, olive_oil=22, sesame_oil=129,
-- garlic=13, ginger=14, fresh_rosemary=71, soy_sauce=25, dark_soy_sauce=148,
-- red_bell_pepper=42, carrot=56, spring_onions=128, lime_juice=40, chilli_flakes=165, black_pepper=50
-- Unit ids: g=1, tsp=3, tbsp=4, piece=5, large=8, clove=10, stalk=12

-- Light (273)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 11, NULL, 220.00, 1, 220.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 137, NULL, 90.00, 1, 90.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 137 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 22, NULL, 2.00, 3, 10.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 129, NULL, 2.00, 3, 10.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 129 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 13, NULL, 4.00, 10, 16.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 14, NULL, 2.00, 3, 10.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 14 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 71, NULL, 2.00, 3, 4.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 25, NULL, 2.00, 4, 30.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 25 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 148, NULL, 2.00, 3, 10.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 148 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 42, NULL, 0.50, 5, 120.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 42 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 56, NULL, 1.00, 8, 100.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 128, NULL, 4.00, 12, 30.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 40, NULL, 4.00, 3, 20.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 40 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 165, NULL, 0.50, 3, 2.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 165 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 273, 50, NULL, 0.50, 3, 2.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 273 AND ingredient_id = 50 AND linked_recipe_id IS NULL);

-- Moderate (274)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 11, NULL, 270.00, 1, 270.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 137, NULL, 120.00, 1, 120.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 137 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 22, NULL, 1.00, 4, 14.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 129, NULL, 1.00, 4, 14.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 129 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 13, NULL, 4.00, 10, 16.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 14, NULL, 2.00, 3, 10.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 14 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 71, NULL, 2.00, 3, 4.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 25, NULL, 2.00, 4, 30.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 25 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 148, NULL, 2.00, 3, 10.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 148 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 42, NULL, 0.50, 5, 120.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 42 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 56, NULL, 1.00, 8, 100.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 128, NULL, 4.00, 12, 30.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 40, NULL, 4.00, 3, 20.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 40 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 165, NULL, 0.50, 3, 2.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 165 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 274, 50, NULL, 0.50, 3, 2.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 274 AND ingredient_id = 50 AND linked_recipe_id IS NULL);

-- Balanced (275)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 11, NULL, 340.00, 1, 340.00, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 11 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 137, NULL, 160.00, 1, 160.00, 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 137 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 22, NULL, 1.00, 4, 16.00, 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 22 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 129, NULL, 1.00, 4, 16.00, 4 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 129 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 13, NULL, 4.00, 10, 16.00, 5 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 13 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 14, NULL, 2.00, 3, 10.00, 6 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 14 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 71, NULL, 2.00, 3, 4.00, 7 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 71 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 25, NULL, 2.00, 4, 30.00, 8 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 25 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 148, NULL, 2.00, 3, 10.00, 9 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 148 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 42, NULL, 0.50, 5, 120.00, 10 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 42 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 56, NULL, 1.00, 8, 100.00, 11 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 56 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 128, NULL, 4.00, 12, 30.00, 12 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 128 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 40, NULL, 4.00, 3, 20.00, 13 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 40 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 165, NULL, 0.50, 3, 2.00, 14 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 165 AND linked_recipe_id IS NULL);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 275, 50, NULL, 0.50, 3, 2.00, 15 WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 275 AND ingredient_id = 50 AND linked_recipe_id IS NULL);

-- 4. recipe_steps (identical technique across all three variants; wipe-and-reinsert for idempotency)
DELETE FROM recipe_steps WHERE recipe_id IN (273, 274, 275);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(273, 1, 'Pat the chicken strips dry and season with a pinch of salt and black pepper.', 'Dry chicken sears instead of steaming.'),
(273, 2, 'Boil the rice noodles per packet directions, drain, toss with a few drops of sesame oil to stop sticking, and set aside.', NULL),
(273, 3, 'Heat the olive oil in a wok or large pan over high heat until shimmering. Sear the chicken in a single layer, working in batches if it crowds the pan, 2-3 min per side until golden and just cooked through. Remove to a plate to rest.', 'A crowded pan steams the chicken instead of searing it.'),
(273, 4, 'Drop the heat to medium. Add the chopped rosemary to the residual oil and let it sizzle 15-20 sec to bloom its oil.', 'This is what gets the rosemary flavour into the dish instead of it just sitting on top as a garnish.'),
(273, 5, 'Add the garlic and ginger, stirring constantly for 30 sec until fragrant.', 'Don''t let the garlic brown or it turns bitter.'),
(273, 6, 'Add the bell pepper and carrot, stir-fry 2-3 min until just crisp-tender.', NULL),
(273, 7, 'Return the chicken, along with any resting juices on the plate, to the pan. Add the soy sauce and dark soy sauce, toss to coat, 1 min.', 'The resting juices carry flavour back into the sauce - don''t discard them.'),
(273, 8, 'Add the drained noodles and toss everything together 1-2 min until the noodles pick up colour from the dark soy sauce.', NULL),
(273, 9, 'Off the heat, stir through the sesame oil and lime juice. Taste and adjust salt, lime, or chilli to balance.', NULL),
(273, 10, 'Plate and scatter the spring onions and chilli flakes over the top.', NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(274, 1, 'Pat the chicken strips dry and season with a pinch of salt and black pepper.', 'Dry chicken sears instead of steaming.'),
(274, 2, 'Boil the rice noodles per packet directions, drain, toss with a few drops of sesame oil to stop sticking, and set aside.', NULL),
(274, 3, 'Heat the olive oil in a wok or large pan over high heat until shimmering. Sear the chicken in a single layer, working in batches if it crowds the pan, 2-3 min per side until golden and just cooked through. Remove to a plate to rest.', 'A crowded pan steams the chicken instead of searing it.'),
(274, 4, 'Drop the heat to medium. Add the chopped rosemary to the residual oil and let it sizzle 15-20 sec to bloom its oil.', 'This is what gets the rosemary flavour into the dish instead of it just sitting on top as a garnish.'),
(274, 5, 'Add the garlic and ginger, stirring constantly for 30 sec until fragrant.', 'Don''t let the garlic brown or it turns bitter.'),
(274, 6, 'Add the bell pepper and carrot, stir-fry 2-3 min until just crisp-tender.', NULL),
(274, 7, 'Return the chicken, along with any resting juices on the plate, to the pan. Add the soy sauce and dark soy sauce, toss to coat, 1 min.', 'The resting juices carry flavour back into the sauce - don''t discard them.'),
(274, 8, 'Add the drained noodles and toss everything together 1-2 min until the noodles pick up colour from the dark soy sauce.', NULL),
(274, 9, 'Off the heat, stir through the sesame oil and lime juice. Taste and adjust salt, lime, or chilli to balance.', NULL),
(274, 10, 'Plate and scatter the spring onions and chilli flakes over the top.', NULL);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip) VALUES
(275, 1, 'Pat the chicken strips dry and season with a pinch of salt and black pepper.', 'Dry chicken sears instead of steaming.'),
(275, 2, 'Boil the rice noodles per packet directions, drain, toss with a few drops of sesame oil to stop sticking, and set aside.', NULL),
(275, 3, 'Heat the olive oil in a wok or large pan over high heat until shimmering. Sear the chicken in a single layer, working in batches if it crowds the pan, 2-3 min per side until golden and just cooked through. Remove to a plate to rest.', 'A crowded pan steams the chicken instead of searing it.'),
(275, 4, 'Drop the heat to medium. Add the chopped rosemary to the residual oil and let it sizzle 15-20 sec to bloom its oil.', 'This is what gets the rosemary flavour into the dish instead of it just sitting on top as a garnish.'),
(275, 5, 'Add the garlic and ginger, stirring constantly for 30 sec until fragrant.', 'Don''t let the garlic brown or it turns bitter.'),
(275, 6, 'Add the bell pepper and carrot, stir-fry 2-3 min until just crisp-tender.', NULL),
(275, 7, 'Return the chicken, along with any resting juices on the plate, to the pan. Add the soy sauce and dark soy sauce, toss to coat, 1 min.', 'The resting juices carry flavour back into the sauce - don''t discard them.'),
(275, 8, 'Add the drained noodles and toss everything together 1-2 min until the noodles pick up colour from the dark soy sauce.', NULL),
(275, 9, 'Off the heat, stir through the sesame oil and lime juice. Taste and adjust salt, lime, or chilli to balance.', NULL),
(275, 10, 'Plate and scatter the spring onions and chilli flakes over the top.', NULL);

-- 5. recipe_families
INSERT INTO recipe_families (id, family_name, description)
SELECT 113, 'Rosemary Garlic Chicken Stir-Fry with Rice Noodles', 'Rosemary-bloomed chicken stir-fry with garlic, ginger, soy, and flat rice noodles.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_families WHERE id = 113);

-- 6. recipe_family_members
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 113, 273, 0, 'Light', 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 113 AND recipe_id = 273);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 113, 274, 1, 'Moderate', 2 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 113 AND recipe_id = 274);
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 113, 275, 0, 'Balanced', 3 WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 113 AND recipe_id = 275);

-- 7. Mark audited (macros hand-verified in the chef skill's design pass; see conversation)
UPDATE recipes
SET macros_audited = 1, macros_audited_at = NOW(), macros_audited_by = NULL
WHERE id IN (273, 274, 275);

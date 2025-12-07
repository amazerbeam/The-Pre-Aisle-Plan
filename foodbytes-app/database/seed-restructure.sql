-- =============================================
-- RECIPE RESTRUCTURE - December 2025
-- 1. Oats Light variant (user's original)
-- 2. Banana Curry modular structure
-- 3. Tikka Masala modular structure + Cheat variant
-- =============================================

-- =============================================
-- PART 1: OATS RECIPE FAMILY
-- =============================================

-- Recipe 3 stays as "Protein Oats with Eggs & Greek Yogurt" (Standard)
-- Adding new Recipe 100: "Simple Porridge Oats" (Light - user's original)

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(100, 'Simple Porridge Oats', 2, 900, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(100, 1); -- Breakfast

-- User's original recipe:
-- 60g oats, 250ml milk, 150ml water, 80g berries, 1 tsp honey, 0.5 tsp salt, 1 tbsp peanut butter, 10g almonds, 10g walnuts
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
(100, 69, 60, 1, 1),     -- Rolled oats, 60g
(100, 37, 250, 2, 2),    -- Milk, 250ml
(100, 89, 150, 2, 3),    -- Water, 150ml
(100, 34, 80, 1, 4),     -- Mixed berries, 80g
(100, 76, 1, 3, 5),      -- Honey, 1 tsp
(100, 44, 0.5, 3, 6),    -- Salt, 0.5 tsp
(100, 87, 1, 4, 7),      -- Peanut butter, 1 tbsp (15g)
(100, 84, 10, 1, 8),     -- Almonds, 10g
(100, 86, 10, 1, 9);     -- Walnuts, 10g

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(100, 1, 'Add oats, milk, water, and salt to a pot. Bring to a simmer.'),
(100, 2, 'Cook for 4-5 minutes, stirring occasionally, until creamy.'),
(100, 3, 'Transfer to bowls. Top with peanut butter, berries, almonds, and walnuts.'),
(100, 4, 'Drizzle with honey and serve warm.');

-- Nutrition per serving (450 cal per serving for 2 servings):
-- ~450 cal | ~12g protein | ~18g fat | ~58g carbs
-- This is the LIGHT variant - lower protein but good for light days

-- Create Oats family
INSERT INTO recipe_families (id, family_name, description) VALUES
(10, 'Porridge Oats', 'Warming oats - Light simple version, Standard with eggs & yogurt for protein');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(10, 100, FALSE, 'Light', 2),
(10, 3, TRUE, 'Standard', 1);

-- =============================================
-- PART 2: BANANA CURRY - MODULAR STRUCTURE
-- =============================================
-- The SAUCE is preserved exactly as specified
-- Protein, Carbs, Veg are separate components

-- First, create a "Sauce Base" concept by restructuring existing recipes

-- SAUCE RECIPE (base only - for reference, not standalone)
-- This documents the preserved sauce:
-- 1 large Onion, 3 cloves Garlic, 5g Ginger, 1 medium Banana
-- 2 tsp Soy sauce, 1 tbsp Tomato paste, 1 tsp Honey, 1 tsp Salt
-- 0.5 tsp Turmeric, 0.5 tsp Cumin, 0.3 tsp Cinnamon, 1 Star anise, 1 pinch MSG
-- 480ml Stock

-- Update existing Recipe 11 to be "Banana Curry - Chicken & Sweet Potato" (Standard)
-- Recipe 11 already has: Chicken 450g, Sweet Potato 250g - this is the STANDARD

-- Create Recipe 101: Banana Curry - Light (Chicken only, no carbs)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(101, 'Banana Curry - Light (Chicken & Greens)', 2, 1050, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(101, 3); -- Dinner

-- Same sauce + extra chicken + greens instead of sweet potato
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(101, 17, 1, 8, 1),      -- Onion, 1 large
(101, 13, 3, 10, 2),     -- Garlic, 3 cloves
(101, 14, 5, 1, 3),      -- Ginger, 5g
(101, 32, 1, 7, 4),      -- Banana, 1 medium
(101, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(101, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(101, 76, 1, 3, 7),      -- Honey, 1 tsp
(101, 44, 1, 3, 8),      -- Salt, 1 tsp
(101, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(101, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(101, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(101, 52, 1, 5, 12),     -- Star anise, 1 piece
(101, 53, 1, 17, 13),    -- MSG, 1 pinch
(101, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN (extra for Light)
(101, 7, 500, 1, 15),    -- Chicken breast, 500g (extra)
-- VEG (greens instead of sweet potato)
(101, 12, 200, 1, 16),   -- Spinach, 200g
(101, 9, 200, 1, 17),    -- Broccoli, 200g
-- COOKING
(101, 59, 1.5, 4, 18),   -- Olive oil, 1.5 tbsp
(101, 45, 0.25, 3, 19);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(101, 1, 'SAUCE: Slice onion, mince garlic, grate ginger.'),
(101, 2, 'Heat oil in a pan. Fry onion 5 minutes until softened.'),
(101, 3, 'Add garlic and ginger, cook 30 seconds.'),
(101, 4, 'Add banana, soy sauce, tomato paste, honey, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(101, 5, 'Blend sauce until smooth. Return to pan, add star anise.'),
(101, 6, 'PROTEIN: Cut chicken into bite-sized pieces. Season and brown in a separate pan.'),
(101, 7, 'Add chicken to sauce. Simmer 15-20 minutes until cooked through.'),
(101, 8, 'VEG: Steam broccoli and wilt spinach in the last 5 minutes.'),
(101, 9, 'Serve curry over bed of greens. Light version - no rice or sweet potato.');

-- Create Recipe 102: Banana Curry - Full (Chicken + Jasmine Rice)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(102, 'Banana Curry - Full (Chicken & Jasmine Rice)', 2, 1650, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(102, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(102, 17, 1, 8, 1),      -- Onion, 1 large
(102, 13, 3, 10, 2),     -- Garlic, 3 cloves
(102, 14, 5, 1, 3),      -- Ginger, 5g
(102, 32, 1, 7, 4),      -- Banana, 1 medium
(102, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(102, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(102, 76, 1, 3, 7),      -- Honey, 1 tsp
(102, 44, 1, 3, 8),      -- Salt, 1 tsp
(102, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(102, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(102, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(102, 52, 1, 5, 12),     -- Star anise, 1 piece
(102, 53, 1, 17, 13),    -- MSG, 1 pinch
(102, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN
(102, 7, 450, 1, 15),    -- Chicken breast, 450g
-- CARBS (Full - jasmine rice)
(102, 71, 180, 1, 16),   -- Jasmine rice, 180g (dry)
-- VEG
(102, 41, 150, 1, 17),   -- Petit pois, 150g
-- COOKING
(102, 59, 1.5, 4, 18),   -- Olive oil, 1.5 tbsp
(102, 45, 0.25, 3, 19);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(102, 1, 'RICE: Rinse jasmine rice until water runs clear. Cook with 360ml water. Bring to boil, reduce heat, cover 12-15 minutes. Rest 5 minutes.'),
(102, 2, 'SAUCE: Slice onion, mince garlic, grate ginger.'),
(102, 3, 'Heat oil in a pan. Fry onion 5 minutes until softened.'),
(102, 4, 'Add garlic and ginger, cook 30 seconds.'),
(102, 5, 'Add banana, soy sauce, tomato paste, honey, salt, turmeric, cumin, cinnamon, MSG, and stock.'),
(102, 6, 'Blend sauce until smooth. Return to pan, add star anise.'),
(102, 7, 'PROTEIN: Cut chicken into bite-sized pieces. Season and brown separately.'),
(102, 8, 'Add chicken to sauce. Simmer 15-20 minutes.'),
(102, 9, 'Add peas in last 5 minutes.'),
(102, 10, 'Serve curry over fluffy jasmine rice. Full version for high activity days.');

-- Create Recipe 103: Banana Curry - Tofu & Chickpea (Vegetarian Standard)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(103, 'Banana Curry - Tofu & Chickpea', 2, 1400, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(103, 3); -- Dinner

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- SAUCE (preserved exactly)
(103, 17, 1, 8, 1),      -- Onion, 1 large
(103, 13, 3, 10, 2),     -- Garlic, 3 cloves
(103, 14, 5, 1, 3),      -- Ginger, 5g
(103, 32, 1, 7, 4),      -- Banana, 1 medium
(103, 72, 2, 3, 5),      -- Soy sauce, 2 tsp
(103, 60, 1, 4, 6),      -- Tomato paste, 1 tbsp
(103, 76, 1, 3, 7),      -- Honey, 1 tsp
(103, 44, 1, 3, 8),      -- Salt, 1 tsp
(103, 57, 0.5, 3, 9),    -- Turmeric, 0.5 tsp
(103, 49, 0.5, 3, 10),   -- Cumin, 0.5 tsp
(103, 50, 0.3, 3, 11),   -- Cinnamon, 0.3 tsp
(103, 52, 1, 5, 12),     -- Star anise, 1 piece
(103, 53, 1, 17, 13),    -- MSG, 1 pinch
(103, 90, 480, 2, 14),   -- Stock, 480ml
-- PROTEIN (vegetarian)
(103, 6, 300, 1, 15),    -- Firm tofu, 300g
(103, 64, 240, 1, 16),   -- Chickpeas, 240g
-- CARBS
(103, 26, 300, 1, 17),   -- Sweet potato, 300g
-- VEG
(103, 41, 100, 1, 18),   -- Petit pois, 100g
-- COOKING
(103, 59, 2, 4, 19),     -- Olive oil, 2 tbsp
(103, 45, 0.25, 3, 20);  -- Black pepper, 0.25 tsp

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(103, 1, 'SWEET POTATO: Peel and cube. Roast at 200C for 30 minutes.'),
(103, 2, 'TOFU: Press and cube tofu. Pan-fry until golden on all sides. Set aside.'),
(103, 3, 'SAUCE: Make sauce as per standard method - onion, garlic, ginger, banana, spices, stock. Blend smooth.'),
(103, 4, 'Add chickpeas to sauce. Simmer 15 minutes.'),
(103, 5, 'Add fried tofu and peas. Cook 5 more minutes.'),
(103, 6, 'Serve over roasted sweet potato. Vegetarian protein option.');

-- Update Banana Curry Family
-- First delete existing family members for family 1
-- Then recreate with new structure
DELETE FROM recipe_family_members WHERE family_id = 1;

UPDATE recipe_families SET description = 'Aromatic banana curry with preserved sauce - Light (chicken & greens), Standard (chicken & sweet potato), Full (chicken & rice), Veggie (tofu & chickpea)' WHERE id = 1;

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(1, 101, FALSE, 'Light', 1),
(1, 11, TRUE, 'Standard', 2),
(1, 102, FALSE, 'Full', 3),
(1, 103, FALSE, 'Veggie', 4);

-- Remove recipe 19 from family (it's redundant with new structure)
-- Recipe 19 can be kept as standalone or deleted

-- =============================================
-- PART 3: TIKKA MASALA - MODULAR STRUCTURE
-- =============================================
-- THE SAUCE (Base for Light/Standard/Full):
-- Olive oil + onion + garlic + ginger
-- Spices: cumin, turmeric, smoked paprika, cinnamon, salt, pepper
-- Tomato paste + Tinned tomatoes
-- Greek yogurt (stirred in off heat)
-- Garam masala + honey (finishers)

-- Recipe 12 is current "Creamy Tikka Masala with Chickpeas" - make this Standard
-- Recipe 22 is "Creamy Tikka Masala (Light - No Chickpeas)" - keep as Light
-- Recipe 23 is "Creamy Tikka Masala with Rice & Naan" - keep as Full

-- Add Recipe 104: Traditional Butter Chicken Tikka (Cheat)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(104, 'Traditional Butter Chicken Tikka (Cheat)', 2, 1800, TRUE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES
(104, 3); -- Dinner

-- New ingredient for cream
INSERT INTO ingredients (id, `key`, name, aisle_id) VALUES
(154, 'double_cream', 'Double cream', 6),
(155, 'kashmiri_chili', 'Kashmiri chili powder', 8),
(156, 'fenugreek_leaves', 'Dried fenugreek leaves (kasoori methi)', 8);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, sort_order) VALUES
-- MARINADE
(104, 7, 500, 1, 1),     -- Chicken breast, 500g (or thigh)
(104, 36, 100, 1, 2),    -- Greek yogurt, 100g (marinade)
(104, 155, 1, 3, 3),     -- Kashmiri chili powder, 1 tsp
(104, 54, 1, 3, 4),      -- Garam masala, 1 tsp
(104, 49, 1, 3, 5),      -- Cumin, 1 tsp
(104, 44, 1, 3, 6),      -- Salt, 1 tsp
(104, 30, 1, 4, 7),      -- Lemon juice, 1 tbsp
-- SAUCE BASE
(104, 92, 50, 1, 8),     -- Butter, 50g (traditional!)
(104, 59, 1, 4, 9),      -- Olive oil, 1 tbsp
(104, 17, 1, 8, 10),     -- Onion, 1 large
(104, 13, 4, 10, 11),    -- Garlic, 4 cloves
(104, 14, 15, 1, 12),    -- Ginger, 15g
(104, 60, 2, 4, 13),     -- Tomato paste, 2 tbsp
(104, 61, 1, 15, 14),    -- Tinned tomatoes, 1 tin
-- SPICES
(104, 57, 0.5, 3, 15),   -- Turmeric, 0.5 tsp
(104, 46, 1, 3, 16),     -- Smoked paprika, 1 tsp
(104, 50, 0.5, 3, 17),   -- Cinnamon, 0.5 tsp
(104, 45, 0.25, 3, 18),  -- Black pepper, 0.25 tsp
-- FINISHING (what makes it traditional/cheat)
(104, 154, 150, 2, 19),  -- Double cream, 150ml
(104, 156, 1, 4, 20),    -- Dried fenugreek leaves, 1 tbsp
(104, 76, 1, 3, 21),     -- Honey, 1 tsp
(104, 54, 0.5, 3, 22),   -- Garam masala, 0.5 tsp (finishing)
-- SERVE WITH
(104, 94, 200, 1, 23),   -- Basmati rice, 200g
(104, 93, 4, 5, 24);     -- Naan bread, 4 pieces

INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(104, 1, 'MARINADE: Mix yogurt, Kashmiri chili, garam masala, cumin, salt, lemon juice. Coat chicken pieces. Marinate 2-24 hours.'),
(104, 2, 'COOK CHICKEN: Grill or pan-fry marinated chicken until charred and cooked through. Set aside.'),
(104, 3, 'SAUCE: Heat butter and oil in a pan. Fry sliced onion until deep golden (10-12 minutes).'),
(104, 4, 'Add garlic and ginger. Cook 2 minutes.'),
(104, 5, 'Add tomato paste, turmeric, paprika, cinnamon, pepper. Cook 1 minute.'),
(104, 6, 'Add tinned tomatoes. Simmer 15 minutes. Blend until smooth.'),
(104, 7, 'Return sauce to pan. Add cooked chicken pieces.'),
(104, 8, 'FINISH: Stir in double cream. Simmer 5 minutes. Do not boil.'),
(104, 9, 'Crush fenugreek leaves between palms, add to curry with honey and finishing garam masala.'),
(104, 10, 'SERVE: With basmati rice and warm naan. This is the CHEAT version - Friday only!');

-- Nutrition per serving:
-- ~900 cal | ~55g protein | ~45g fat | ~65g carbs
-- CHEAT - exceeds fat limit significantly due to butter and cream

-- Update Tikka Masala Family
DELETE FROM recipe_family_members WHERE family_id = 3;

UPDATE recipe_families SET description = 'Rich tikka masala - Light (no chickpeas), Standard (with chickpeas & peas), Full (rice & naan), Cheat (traditional butter chicken)' WHERE id = 3;

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(3, 22, FALSE, 'Light', 1),
(3, 12, TRUE, 'Standard', 2),
(3, 23, FALSE, 'Full', 3),
(3, 104, FALSE, 'Cheat', 4);

-- =============================================
-- PART 4: RECIPE AUDIT SUMMARY
-- =============================================
-- All recipes analyzed against diet plan guardrails:
-- Target: 550-650 cal/serving, >=45g protein, <=25g fat

-- BREAKFAST:
-- 1. Almond Flour Pancakes: 373 cal/serving - LIGHT (low cal)
-- 2. Frozen Banana Whip: 465 cal/serving - LIGHT (smoothie)
-- 3. Protein Oats (Standard): 590 cal/serving - STANDARD (good protein with eggs)
-- 4. Pancakes & Bacon: 640 cal/serving - FULL (high cal with bacon)
-- 100. Simple Porridge Oats (NEW): 450 cal/serving - LIGHT (user's original)

-- LUNCH:
-- 5. Empanadas: 1543 cal/serving - CHEAT! (pastry heavy)
-- 6. Burrito: 535 cal/serving - STANDARD
-- 7. Fish Cakes: 520 cal/serving - STANDARD
-- 8. Chicken Salad: 575 cal/serving - STANDARD
-- 9. Lettuce Wraps: 598 cal/serving - STANDARD
-- 27-35: Various bowls and salads - properly structured

-- DINNER:
-- 10. Crispy Herb Chicken: 748 cal/serving - needs FULL label
-- 11. Banana Curry: 700 cal/serving - STANDARD (now restructured)
-- 12. Tikka Masala: 603 cal/serving - STANDARD
-- 13. Chili Crisp Chicken: 635 cal/serving - STANDARD
-- 14. Wok-Tossed: 600 cal/serving - STANDARD
-- 15. Turkey Meatballs: 750 cal/serving - FULL
-- 16-18: Already marked as CHEAT

-- =============================================
-- SUMMARY OF CHANGES
-- =============================================
-- NEW RECIPES ADDED:
-- 100: Simple Porridge Oats (Light) - user's original oats recipe
-- 101: Banana Curry Light (Chicken & Greens)
-- 102: Banana Curry Full (Chicken & Jasmine Rice)
-- 103: Banana Curry Veggie (Tofu & Chickpea)
-- 104: Traditional Butter Chicken Tikka (Cheat)

-- NEW INGREDIENTS ADDED:
-- 154: Double cream
-- 155: Kashmiri chili powder
-- 156: Dried fenugreek leaves

-- FAMILY UPDATES:
-- Family 1 (Banana Curry): Now modular with 4 variants
-- Family 3 (Tikka Masala): Added Cheat variant
-- Family 10 (NEW): Porridge Oats family

-- SAUCE BASES PRESERVED:
-- Banana Curry: Onion, garlic, ginger, banana, soy, tomato paste, honey, spices, stock
-- Tikka Masala: Olive oil, onion, garlic, ginger, spices, tomato paste, tinned tomatoes, yogurt, garam masala, honey

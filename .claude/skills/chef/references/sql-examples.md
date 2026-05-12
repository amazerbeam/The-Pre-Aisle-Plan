# Chef — SQL examples

Worked end-to-end inserts. Replace IDs with values from the live `max_*` query before running.

## Simple recipe (no extras), 3 variants

```sql
-- 1. New ingredient (if any)
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
VALUES (250, 'sumac', 'Sumac', 7, 4.00, 70.00, 5.00, FALSE);

-- 2. Three variants — SAME name, no suffix; calories = kcal/srv * default_servings
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(301, 'Sumac Chicken Bowl', 2, 1020, FALSE, TRUE),  -- Light    (510/srv × 2)
(302, 'Sumac Chicken Bowl', 2, 1210, FALSE, TRUE),  -- Moderate (605/srv × 2)
(303, 'Sumac Chicken Bowl', 2, 1520, FALSE, TRUE);  -- Balanced (760/srv × 2)

-- 3. Meal slot (3 = dinner)
INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (301, 3), (302, 3), (303, 3);

-- 4. Ingredients per variant (raw only here)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(301, 12, NULL, 250, 1, 250.00, 1),  -- Chicken thigh 250 g
(301, 250, NULL, 1, 3, 6.00, 2),     -- Sumac 1 tsp
-- ... repeat for 302 (300 g chicken) and 303 (380 g chicken + extras)

-- 5. Steps
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(302, 1, 'Pat chicken dry, season with sumac and salt.', NULL, NULL),
(302, 2, 'Sear in olive oil 4 min per side until golden.', NULL, NULL);
-- ... repeat per variant

-- 6. Family + members (Moderate = default)
INSERT INTO recipe_families (id, family_name, description) VALUES
(45, 'Sumac Chicken Bowl', 'Levantine-style sumac chicken with herb yoghurt.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(45, 301, FALSE, 'Light',    1),
(45, 302, TRUE,  'Moderate', 2),
(45, 303, FALSE, 'Balanced', 3);
```

## Recipe with FR-103 dual-path extras (Pizza)

Key rules:
- Sub-recipe (`Pizza Dough`) created **before** parent.
- Parent row has BOTH `ingredient_id` (store-bought) AND `linked_recipe_id` (homemade).
- `quantity_grams` = grams of dough used in **this** dish, not the dough recipe's total yield.
- Dual-path applied to **all three** variants in the family.

```sql
-- Store-bought ingredient counterparts
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(75, 'pizza_dough_store', 'Pizza Dough', 13, 8.00, 50.00, 2.00, FALSE),
(76, 'pizza_sauce_store', 'Pizza Sauce', 12, 1.50, 8.00, 0.50, FALSE);

-- Sub-recipes
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(11, 'Pizza Dough', 4, 2033, FALSE, TRUE),
(12, 'Pizza Sauce', 7, 313,  FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (11, 5), (12, 5);  -- extras

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
(11, 32, NULL, 450, 1, 450.00, 1),  -- Bread flour
(11, 9,  NULL, 240, 2, 240.00, 2),  -- Water
(11, 22, NULL, 4,   4, 56.00,  3),  -- Olive oil
(11, 31, NULL, 1,   3, 3.00,   4),  -- Dry yeast
(11, 5,  NULL, 2,   3, 12.00,  5);  -- Salt
-- Total yield: 761 g

-- Parent variants (same name)
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live) VALUES
(13, 'Pizza Margherita', 2, 1220, FALSE, TRUE),
(14, 'Pizza Margherita', 2, 1680, FALSE, TRUE),
(15, 'Pizza Margherita', 2, 2140, FALSE, TRUE);

INSERT INTO recipe_meals (recipe_id, meal_id) VALUES (13, 3), (14, 3), (15, 3);

-- FR-103 dual-path on ALL THREE variants
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
-- Light (280 g dough, 90 g sauce, 120 g cheese)
(13, 75, 11, 280, 1, 280.00, 1),
(13, 76, 12, 90,  1, 90.00,  2),
(13, 37, NULL, 120, 1, 120.00, 3),
-- Moderate
(14, 75, 11, 370, 1, 370.00, 1),
(14, 76, 12, 120, 1, 120.00, 2),
(14, 37, NULL, 200, 1, 200.00, 3),
-- Balanced
(15, 75, 11, 460, 1, 460.00, 1),
(15, 76, 12, 150, 1, 150.00, 2),
(15, 37, NULL, 280, 1, 280.00, 3);

-- Hierarchy for the popup
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order) VALUES
(13, 11, 0), (13, 12, 1),
(14, 11, 0), (14, 12, 1),
(15, 11, 0), (15, 12, 1);

-- Steps with store-bought alternatives
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
(14, 1, 'Prepare the pizza dough per the linked recipe; use 185 g per person.', 11, 'Remove 370 g store-bought dough from fridge 30 min before use.'),
(14, 2, 'Make the pizza sauce per the linked recipe; 60 g per pizza.',           12, 'Measure 120 g store-bought pizza sauce.'),
(14, 3, 'Preheat oven to 250°C with a stone if available.',                       NULL, NULL);

-- Family
INSERT INTO recipe_families (id, family_name, description) VALUES
(20, 'Pizza Margherita', 'Neapolitan-style with homemade or store-bought dough/sauce.');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(20, 13, FALSE, 'Light',    1),
(20, 14, TRUE,  'Moderate', 2),
(20, 15, FALSE, 'Balanced', 3);
```

## Verification queries (run after insert)

```sql
-- Family has exactly 3 members, default = Moderate
SELECT family_id,
       GROUP_CONCAT(variant_label ORDER BY display_order) AS labels,
       MAX(CASE WHEN is_default = 1 THEN variant_label END) AS default_label
FROM recipe_family_members WHERE family_id = 20 GROUP BY family_id;
-- expect: 'Light,Moderate,Balanced' / 'Moderate'

-- Recomputed kcal per serving close to stored
SELECT r.id, r.name, r.calories / r.default_servings AS stored_per_srv,
       ROUND(SUM(
         CASE WHEN ri.linked_recipe_id IS NULL THEN
           ri.quantity_grams * (i.protein_per_100g*4 + i.carbs_per_100g*4 + i.fat_per_100g*9) / 100
         ELSE 0 END
       ) / r.default_servings) AS computed_raw_only_per_srv
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.id IN (13,14,15)
GROUP BY r.id;
-- (raw-only — add the linked-recipe portion separately if you want a full check)
```

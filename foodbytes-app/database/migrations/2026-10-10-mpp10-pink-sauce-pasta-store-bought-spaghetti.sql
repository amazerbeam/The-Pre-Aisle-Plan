-- MPP-10 follow-up: give Pink Sauce Pasta's Fresh Pasta a store-bought product.
--
-- Pink Sauce Pasta (37 Light / 38 Moderate / 39 Balanced) links Fresh Pasta (36) with
-- ingredient_id NULL, so choosing store-bought pasta could only list a generic
-- "Store Bought Fresh Pasta" row. This sets the FR-103 dual path to Spaghetti (dried) (126) —
-- the same product Spaghetti Bolognese and Chicken Carbonara already use for Fresh Pasta — on
-- all three variants, as recipe-variants.md requires.
--
-- Shopping list only: nutrition stays on the homemade linked recipe (CLAUDE.md, FR-103).
-- quantity_grams is unchanged (175 / 220 / 260 g).
-- Idempotent: only fills rows whose ingredient_id is still NULL. Data-only; apply any time.

UPDATE recipe_ingredients
SET ingredient_id = 126
WHERE recipe_id IN (37, 38, 39)
  AND linked_recipe_id = 36
  AND ingredient_id IS NULL;

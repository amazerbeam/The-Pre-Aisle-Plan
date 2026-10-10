-- MPP-10: add the 32 linked sub-recipes that are missing from recipe_extras.
--
-- recipe_extras drives the homemade/store-bought popup and the shopping list's extras walk;
-- ShoppingListService.processRecipeIngredients skips linked rows, so a link with no
-- recipe_extras row is silently dropped from the shopping list in BOTH modes.
-- Reviewed list (2026-10-10, live gap query): 71 extras rows vs 103 distinct links → 32 missing.
-- No recipe ingredients, steps or yields change. All 32 links already have a linked prep step
-- (linked-recipe-extras.md check 5 returned 0).
--
-- Idempotent: NOT EXISTS guard + unique_parent_child (parent_recipe_id, child_recipe_id).
-- Data-only: may be applied before or after the backend deploy.

INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT v.p, v.c, v.o
FROM (
            SELECT  37 AS p,  12 AS c, 1 AS o   -- Pink Sauce Pasta (L)  → Pizza Sauce
  UNION ALL SELECT  38,  12, 1                  -- Pink Sauce Pasta (M)  → Pizza Sauce
  UNION ALL SELECT  39,  12, 1                  -- Pink Sauce Pasta (B)  → Pizza Sauce
  UNION ALL SELECT 189,  36, 0                  -- Med. White Bean & Chicken Soup → Fresh Pasta
  UNION ALL SELECT 196,  36, 0
  UNION ALL SELECT 197,  36, 0
  UNION ALL SELECT 205,  26, 0                  -- Crispy Chicken Dippers → Milk Bread
  UNION ALL SELECT 206,  26, 0
  UNION ALL SELECT 207,  26, 0
  UNION ALL SELECT 208,  12, 0                  -- Paella Valenciana → Pizza Sauce
  UNION ALL SELECT 209,  12, 0
  UNION ALL SELECT 210,  36, 0                  -- Chicken Carbonara → Fresh Pasta
  UNION ALL SELECT 211,  36, 0
  UNION ALL SELECT 212,  36, 0
  UNION ALL SELECT 220, 213, 0                  -- Greek Yogurt & Granola Bowl → Goodness Granola
  UNION ALL SELECT 221, 213, 0
  UNION ALL SELECT 222, 213, 0
  UNION ALL SELECT 223,  26, 0                  -- Poached Eggs, Smoked Salmon & Avocado on Toast → Milk Bread
  UNION ALL SELECT 224,  26, 0
  UNION ALL SELECT 225,  26, 0
  UNION ALL SELECT 226,  26, 0                  -- Soft-Boiled Eggs, Cottage Cheese & Toast → Milk Bread
  UNION ALL SELECT 227,  26, 0
  UNION ALL SELECT 228,  26, 0
  UNION ALL SELECT 229,  26, 0                  -- Fried Eggs with Halloumi & Toast → Milk Bread
  UNION ALL SELECT 230,  26, 0
  UNION ALL SELECT 231,  26, 0
  UNION ALL SELECT 232,  26, 0                  -- Cheese & Ham Omelette with Toast → Milk Bread
  UNION ALL SELECT 232,  64, 1                  --                                → Honey Ham
  UNION ALL SELECT 233,  26, 0
  UNION ALL SELECT 233,  64, 1
  UNION ALL SELECT 234,  26, 0
  UNION ALL SELECT 234,  64, 1
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_extras re
  WHERE re.parent_recipe_id = v.p AND re.child_recipe_id = v.c
);

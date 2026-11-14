-- 2026-11-13: Pad Thai (family: recipes 91 Light / 92 Moderate / 93 Balanced)
-- Swap the shallot (1 small, 30 g, ingredient 139) for half a medium onion
-- (0.5 medium, 55 g, ingredient 12 "Onion") on all three variants.
--
-- Macro impact (whole recipe, every variant):
--   Shallot 30 g : P 0.75  C 5.10  F 0.03  ~23.7 kcal
--   Onion   55 g : P 0.61  C 5.12  F 0.06  ~23.4 kcal
--   Delta        : ~-0.3 kcal whole recipe -> recipes.calories and macros_audited unchanged.
--
-- Steps 3 and 5 reworded: onion needs ~2 min to soften (vs 30 s for shallot),
-- so it goes in first and the garlic follows, keeping the garlic from burning.
--
-- Idempotent: re-running is a no-op.

-- 1. Ingredient rows (ri 1010 / 1024 / 1038)
UPDATE recipe_ingredients
SET ingredient_id = 12,      -- Onion
    quantity = 0.50,
    unit_id = 7,             -- medium
    quantity_grams = 55.00
WHERE recipe_id IN (91, 92, 93)
  AND ingredient_id = 139    -- Shallot
  AND linked_recipe_id IS NULL;

-- 2. Step 3 (prep)
UPDATE recipe_steps
SET instruction = 'Slice the chicken breast across the grain into thin strips no thicker than a pencil, then pat them dry. Mince the garlic, thinly slice the half onion, and cut the spring onions into 2-inch lengths, keeping whites and greens separate.'
WHERE recipe_id IN (91, 92, 93) AND step_number = 3;

-- 3. Step 5 (aromatics)
UPDATE recipe_steps
SET instruction = 'Add the remaining oil to the hot wok, then the onion. Stir-fry about 2 minutes until it softens and turns translucent at the edges. Add the garlic and fry 30 seconds more until fragrant - pull the wok off the direct heat if the garlic starts colouring past pale gold.'
WHERE recipe_id IN (91, 92, 93) AND step_number = 5;

-- Verify
SELECT ri.recipe_id, i.name, ri.quantity, u.`key` AS unit, ri.quantity_grams
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
JOIN units u ON u.id = ri.unit_id
WHERE ri.recipe_id IN (91, 92, 93) AND ri.ingredient_id IN (12, 139);

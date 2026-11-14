-- 2026-11-13 — Scrambled Eggs, Chicken & Toast (family 122, recipes 300/301/302)
-- Show the Milk Bread toast in grams instead of slices. Display-only:
-- quantity_grams is unchanged, so macros do not move. Idempotent: safe to re-run.

-- 1. Ingredient rows: slices (unit 13) -> grams (unit 1)
UPDATE recipe_ingredients SET quantity = 250, unit_id = 1 WHERE recipe_id = 300 AND linked_recipe_id = 26;
UPDATE recipe_ingredients SET quantity = 300, unit_id = 1 WHERE recipe_id = 301 AND linked_recipe_id = 26;
UPDATE recipe_ingredients SET quantity = 350, unit_id = 1 WHERE recipe_id = 302 AND linked_recipe_id = 26;

-- 2. Step 1 wording to match
UPDATE recipe_steps
SET instruction     = 'Toast the bread according to the linked recipe. Use 250g (125g per person).',
    alt_instruction = 'Toast 250g of store-bought bread (125g per person).'
WHERE recipe_id = 300 AND step_number = 1;

UPDATE recipe_steps
SET instruction     = 'Toast the bread according to the linked recipe. Use 300g (150g per person).',
    alt_instruction = 'Toast 300g of store-bought bread (150g per person).'
WHERE recipe_id = 301 AND step_number = 1;

UPDATE recipe_steps
SET instruction     = 'Toast the bread according to the linked recipe. Use 350g (175g per person).',
    alt_instruction = 'Toast 350g of store-bought bread (175g per person).'
WHERE recipe_id = 302 AND step_number = 1;

-- 3. Record the audit (whole family; macros verified 2026-11-13, unaffected by this change)
UPDATE recipes
SET macros_audited = 1,
    macros_audited_at = NOW()
WHERE id IN (300, 301, 302);

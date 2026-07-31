-- 2026-07-30  Audit remediation part 1 — structural fixes + seed-oil removal
--
-- Macro-neutral. No gram weight changes. Three groups of change:
--
-- 1. SEED OIL. `Sunflower Oil` (ingredient 84) is a seed oil. At the time this
--    migration was written (2026-07-30), CLAUDE.md prohibited seed oils outright
--    ("No seed oils, margarine, or vegetable oil of unknown composition") and
--    named butter/olive oil/ghee as the approved fats. Under that guidance the
--    oil was swapped for Ghee on the 6 recipes it appeared on: Black Pepper Beef
--    Stir Fry (84/85/86) and Chicken & Beef Chop Suey (111/112/113) — the only
--    approved option with a stir-fry-appropriate smoke point (butter burns;
--    olive oil is wrong for the cuisine). At 99.80 % fat vs sunflower's 100 %,
--    whole-recipe kcal moves by <3 kcal on every affected recipe.
--
--    Later in this same session the developer removed the seed-oil clause from
--    CLAUDE.md ("I don't care about seed oils anymore, it's been removed from
--    claude.md"), so this swap is no longer required by any active rule. It
--    stands as applied — reverting it isn't warranted on its own — but the 13
--    remaining `Sunflower Oil` rows elsewhere in the database are deliberately
--    left alone; this migration never claimed to sweep all of them.
--
-- 2. VARIANT PICKER. Nine families had `is_default` on Balanced; the rule in
--    .claude/rules/recipe-variants.md requires Moderate. Five of those also had
--    `display_order` producing Moderate,Light,Balanced instead of
--    Light,Moderate,Balanced. Users were being handed the highest-calorie
--    variant by default, from a dropdown that did not read light-to-heavy.
--
-- 3. NAMES. `recipes.name` must not carry variant/diet suffixes — the family
--    name is the dish, variant labels live in recipe_family_members.
--
-- Idempotent: the INSERT is guarded, every UPDATE is an absolute assignment.
-- Re-running the whole file is a no-op.
--
-- NOTE on the guard: `<=>` is avoided because the MySQL MCP client's SQL parser
-- rejects it, and the NOT EXISTS subquery reads a derived table because MySQL
-- will not let INSERT ... SELECT read the target table directly.

-- ---------------------------------------------------------------------------
-- 1. Ghee (id 177; MAX(ingredients.id) was 176). aisle_id 9 = 'Oils & Fats',
--    the aisle of Olive oil (22), Sesame oil (129) and Sunflower Oil (84).
-- ---------------------------------------------------------------------------
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 177, 'ghee', 'Ghee', 9, 0.00, 0.00, 99.80, 1
FROM (SELECT 1) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT id, `key` FROM ingredients) AS ex
  WHERE ex.id = 177 OR ex.`key` = 'ghee'
);

-- 2. Swap Sunflower Oil -> Ghee. quantity, unit_id, quantity_grams unchanged.
UPDATE recipe_ingredients SET ingredient_id = 177
WHERE ingredient_id = 84 AND recipe_id IN (84, 85, 86, 111, 112, 113);

-- ---------------------------------------------------------------------------
-- 3. is_default -> Moderate on all nine drifted families
-- ---------------------------------------------------------------------------
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  21 THEN 1 ELSE 0 END WHERE family_id =  6;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  82 THEN 1 ELSE 0 END WHERE family_id = 23;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  85 THEN 1 ELSE 0 END WHERE family_id = 24;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  88 THEN 1 ELSE 0 END WHERE family_id = 25;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 105 THEN 1 ELSE 0 END WHERE family_id = 31;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 112 THEN 1 ELSE 0 END WHERE family_id = 33;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 128 THEN 1 ELSE 0 END WHERE family_id = 38;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 131 THEN 1 ELSE 0 END WHERE family_id = 39;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 134 THEN 1 ELSE 0 END WHERE family_id = 40;

-- ---------------------------------------------------------------------------
-- 4. display_order -> Light=1, Moderate=2, Balanced=3 on the five scrambled
-- ---------------------------------------------------------------------------
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN  84 THEN 1 WHEN  85 THEN 2 WHEN  86 THEN 3 END WHERE family_id = 24;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN  87 THEN 1 WHEN  88 THEN 2 WHEN  89 THEN 3 END WHERE family_id = 25;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 111 THEN 1 WHEN 112 THEN 2 WHEN 113 THEN 3 END WHERE family_id = 33;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 130 THEN 1 WHEN 131 THEN 2 WHEN 132 THEN 3 END WHERE family_id = 39;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 133 THEN 1 WHEN 134 THEN 2 WHEN 135 THEN 3 END WHERE family_id = 40;

-- ---------------------------------------------------------------------------
-- 5. Strip suffixes / align names with family names
-- ---------------------------------------------------------------------------
UPDATE recipes SET name = 'Protein Porridge with Berries'          WHERE id IN (187, 192, 193);
UPDATE recipes SET name = 'Slow-Roasted Salmon with Citrus & Veg'   WHERE id IN (190, 198, 199);
UPDATE recipes SET name = 'Peanut Butter Banana Overnight Oats'     WHERE id IN (130, 131, 132);

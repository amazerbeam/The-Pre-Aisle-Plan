-- Task 1: Create shared new ingredients (dedup-guarded)
-- MPP-4-recipe-variety-expansion, Phase 1
-- Executed live against Railway MySQL on 2026-08-10.

-- Step 1: Re-confirm no existing row for each of the four proposed ingredients
SELECT id, name FROM ingredients
WHERE LOWER(name) LIKE '%turkey%'
   OR LOWER(name) LIKE '%cod%'
   OR LOWER(name) LIKE '%mackerel%'
   OR LOWER(name) LIKE '%coconut%';
-- Result: only "Coconut milk" (id 38) matched -- a different item. Zero rows for
-- Turkey mince, Cod, Mackerel, Coconut oil. Matches the planning-time audit.

-- Step 2: Insert the four ingredients with guarded, idempotent SQL.
--
-- SCHEMA GAP vs. the plan's draft SQL: `ingredients` has two additional NOT NULL
-- columns not listed in plan.md/tasks.md -- `key` (varchar(100), UNIQUE) and
-- `aisle_id` (bigint FK -> aisles.id, NOT NULL, no default). The plan's draft
-- INSERT would have failed with "Field 'key' doesn't have a default value".
-- Filled per existing convention: key = snake_case of the name; aisle_id resolved
-- from `aisles` (Meat=1, Poultry=2, Fish=5, Oils & Fats=9) matching how existing
-- rows are categorised (Chicken breast -> Poultry, Salmon Fillet -> Fish,
-- Olive oil -> Oils & Fats). Turkey mince filed under Poultry (2), not Meat (1),
-- because the existing convention splits chicken/turkey from beef/lamb.

INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'turkey_mince_2pct', 'Turkey mince (2% fat)', 2, 21.00, 0.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Turkey mince (2% fat)'));

INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'cod', 'Cod', 5, 18.00, 0.00, 1.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Cod'));

INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'mackerel', 'Mackerel', 5, 19.00, 0.00, 14.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Mackerel'));

INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'coconut_oil', 'Coconut oil', 9, 0.00, 0.00, 100.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Coconut oil'));

-- Step 3: Verify exactly one row per name and capture the new ids.
SELECT id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g
FROM ingredients
WHERE name IN ('Turkey mince (2% fat)', 'Cod', 'Mackerel', 'Coconut oil');

-- Result -- 4 rows, new ids:
--   180  turkey_mince_2pct   Turkey mince (2% fat)   aisle 2 (Poultry)   P21.00 C0.00 F2.00
--   181  cod                 Cod                     aisle 5 (Fish)      P18.00 C0.00 F1.00
--   182  mackerel            Mackerel                aisle 5 (Fish)      P19.00 C0.00 F14.00
--   183  coconut_oil         Coconut oil             aisle 9 (Oils&Fats) P0.00  C0.00 F100.00

-- Step 4: Re-run Step 2's inserts once more and confirm zero new rows.
-- All four re-run statements returned "Affected rows: 0" -- idempotency confirmed.
-- Final COUNT(*) for the four names: 4 (unchanged).

-- ==========================================================================
-- IDS FOR DOWNSTREAM TASKS (reference by id, do not re-derive):
--   Turkey mince (2% fat)  -> ingredients.id = 180
--   Cod                    -> ingredients.id = 181
--   Mackerel               -> ingredients.id = 182
--   Coconut oil            -> ingredients.id = 183
-- ==========================================================================

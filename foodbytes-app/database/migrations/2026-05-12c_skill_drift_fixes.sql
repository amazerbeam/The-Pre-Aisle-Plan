-- ============================================================
-- Skill-drift fixes for week of 2026-05-12 (user_id = 1)
--
-- Why each swap:
--   1. Wed dinner: Drunken Noodles -> Chicken Tikka Masala
--      Removes 35 g oyster sauce (CLAUDE.md gout "moderate" list).
--      Tikka Masala #40 is yogurt-based (Greek yogurt, not cream)
--      = Mediterranean-leaning; 49 g protein/serving.
--   2. Sun dinner: Tikka Masala (now Wed) -> Greek Chicken Gyros
--      Adds an explicitly Mediterranean dinner (Am J Med default
--      pattern). Brings Mediterranean dinner count from 1 to 2.
--   3. Sun breakfast: Porridge -> Overnight Oats
--      Lifts breakfast protein from ~13 g to ~44 g (USDA per-meal
--      band 25-40 g). Sun was carrying two sub-25g protein meals.
-- ============================================================

START TRANSACTION;

-- 1. Wed 2026-05-14 dinner: 108 (Drunken Noodles) -> 40 (Chicken Tikka Masala)
UPDATE meal_plan_entries
   SET recipe_id = 40
 WHERE user_id   = 1
   AND plan_date = '2026-05-14'
   AND meal_id   = 3;

-- 2. Sun 2026-05-18 dinner: 40 (Tikka Masala) -> 118 (Greek Chicken Gyros Light)
UPDATE meal_plan_entries
   SET recipe_id = 118
 WHERE user_id   = 1
   AND plan_date = '2026-05-18'
   AND meal_id   = 3;

-- 3. Sun 2026-05-18 breakfast: 1 (Porridge Light) -> 130 (Overnight Oats Light)
UPDATE meal_plan_entries
   SET recipe_id = 130
 WHERE user_id   = 1
   AND plan_date = '2026-05-18'
   AND meal_id   = 1;

COMMIT;

-- ============================================================
-- Verify
-- ============================================================
-- SELECT plan_date, m.name AS meal, r.name AS recipe
--   FROM meal_plan_entries mpe
--   JOIN meals m   ON m.id = mpe.meal_id
--   JOIN recipes r ON r.id = mpe.recipe_id
--   WHERE mpe.user_id = 1
--     AND plan_date BETWEEN '2026-05-12' AND '2026-05-18'
--   ORDER BY plan_date, m.id;

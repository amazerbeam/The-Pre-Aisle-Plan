-- MPP-24: Pip's "firsts" - one row per person per feature they have tried for the first time.
--
-- Keys: MAKE_TEMPLATE (saved a meal-plan template), GENERATE_SHOPPING_LIST (generated a list),
-- PLAN_FULL_WEEK (7 consecutive days with breakfast, lunch and dinner all planned on the shared
-- plan), COOK_HOMEMADE_EXTRA (ticked as eaten a meal whose recipe has a direct extra chosen as
-- homemade - no choice row = homemade, MPP-10). Recorded by the app after the triggering request
-- commits (PetFirstRecorder); uk_pet_firsts makes recording idempotent and earned_at never moves.
--
-- Per person (MPP-33): user_id is whoever acted, never the meal-plan owner. The backfill below
-- credits templates, lists and full weeks to the plan owner because the actor was never recorded
-- (MPP-24 AC 4); homemade-extra ticks already carry the eater's user_id.
--
-- Lossless: creates a new table and only INSERTs into it; no existing row is changed. Local
-- evidence (2026-10-13): 5 templates over 4 owners, 5 lists, 4 owners with a full week, 0
-- qualifying homemade-extra ticks. Re-running the file is a no-op (ON DUPLICATE KEY UPDATE id = id).
--
-- MUST be applied before the backend that maps PetFirst deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 4 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_firsts (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  first_key  VARCHAR(32) NOT NULL,
  earned_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_firsts (user_id, first_key),
  CONSTRAINT chk_pet_firsts_key CHECK (first_key IN
    ('MAKE_TEMPLATE','GENERATE_SHOPPING_LIST','PLAN_FULL_WEEK','COOK_HOMEMADE_EXTRA')),
  CONSTRAINT fk_pet_firsts_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill 1/4: a saved template -> the owner, at their first template's creation.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT user_id, 'MAKE_TEMPLATE', MIN(COALESCE(created_at, NOW()))
FROM meal_plan_templates
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 2/4: a generated list -> the owner (one list per owner), at generation.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT user_id, 'GENERATE_SHOPPING_LIST', MIN(COALESCE(generated_at, NOW()))
FROM shopping_lists
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 3/4: a full week -> the owner, at the earliest moment any 7 consecutive
-- breakfast/lunch/dinner-complete days existed (window done = its latest entry's created_at).
-- Same rule as PetFirstPolicy.containsFullWeek.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
WITH full_days AS (
  SELECT e.user_id, e.plan_date, MAX(COALESCE(e.created_at, TIMESTAMP(e.plan_date))) AS day_done
  FROM meal_plan_entries e
  JOIN meals m ON m.id = e.meal_id
  WHERE m.`key` IN ('breakfast','lunch','dinner')
  GROUP BY e.user_id, e.plan_date
  HAVING COUNT(DISTINCT m.`key`) = 3
), windows AS (
  SELECT s.user_id, MAX(d.day_done) AS window_done
  FROM full_days s
  JOIN full_days d ON d.user_id = s.user_id
                  AND d.plan_date BETWEEN s.plan_date AND s.plan_date + INTERVAL 6 DAY
  GROUP BY s.user_id, s.plan_date
  HAVING COUNT(*) = 7
)
SELECT user_id, 'PLAN_FULL_WEEK', MIN(window_done)
FROM windows
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 4/4: a homemade extra eaten -> the eater, at their first qualifying tick.
-- Same probe as PetFirstRepository.countHomemadeExtras.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT t.user_id, 'COOK_HOMEMADE_EXTRA', MIN(t.eaten_at)
FROM meal_plan_entry_eaten t
JOIN meal_plan_entries e ON e.id = t.meal_plan_entry_id
WHERE EXISTS (
  SELECT 1
  FROM recipe_extras x
  LEFT JOIN meal_plan_entry_extra_choices c
         ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id
  WHERE x.parent_recipe_id = e.recipe_id
    AND (c.id IS NULL OR c.is_homemade = 1))
GROUP BY t.user_id
ON DUPLICATE KEY UPDATE id = id;

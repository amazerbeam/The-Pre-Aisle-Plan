-- MPP-25: sprinkles - Pip's consistency-only currency. An append-only ledger: one row per payout,
-- one payout per (person, source) ever (uk_pet_sprinkles). The balance is SUM(amount) per user.
--
-- Sources and source_id:
--   MEAL_EATEN     10  meal_plan_entries.id  - a person's first paid tick of a breakfast/lunch/dinner
--   MEAL_ON_TIME    5  meal_plan_entries.id  - that tick landed on the plan day by the meal's time
--   HOMEMADE_EXTRA  5  meal_plan_entries.id  - that meal had a direct extra chosen as homemade
--   FULL_WEEK      20  epoch day of a Monday - Mon-Sun with breakfast/lunch/dinner all planned,
--                                            paid to every member of the shared plan
-- source_id has no FK: a deleted entry keeps its payout. Rows are never updated or deleted by the
-- app, so un-ticking a meal never refunds and re-ticking never pays again (MPP-25 AC 3).
-- Per person (MPP-33): user_id is the earner, never the meal-plan owner.
--
-- Lossless: creates a new table and only INSERTs into it; no existing row is changed. Local
-- evidence (2026-10-14): 2 ticks by 1 person in meal_plan_entry_eaten; 13 users, 2 linked.
-- The backfill seals existing ticks (MEAL_EATEN + HOMEMADE_EXTRA) so un-tick/re-tick of a
-- pre-ledger tick cannot pay. No MEAL_ON_TIME / FULL_WEEK backfill. Re-running is a no-op
-- (ON DUPLICATE KEY UPDATE id = id). On Railway, MPP-35 (order 2) has copied the old shared ticks
-- into the per-person table first, so this backfill seals them: 7 ticks -> 70 sprinkles for user 1.
--
-- MUST be applied before the backend that maps PetSprinkle deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 8 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_sprinkles (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  user_id      BIGINT      NOT NULL,
  source_type  VARCHAR(16) NOT NULL,
  source_id    BIGINT      NOT NULL,
  amount       INT         NOT NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_sprinkles (user_id, source_type, source_id),
  CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
    ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA')),
  CONSTRAINT fk_pet_sprinkles_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill 1/2: every existing main-meal tick whose plan date is not after the tick's local date
-- (Europe/Dublin; falls back to UTC when MySQL has no tz tables) -> MEAL_EATEN 10, at the tick.
-- Same rules as SprinklePolicy.isMainMeal / isPayable.
INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount, created_at)
SELECT t.user_id, 'MEAL_EATEN', t.meal_plan_entry_id, 10, t.eaten_at
FROM meal_plan_entry_eaten t
JOIN meal_plan_entries e ON e.id = t.meal_plan_entry_id
JOIN meals m ON m.id = e.meal_id
WHERE m.`key` IN ('breakfast','lunch','dinner')
  AND e.plan_date <= DATE(COALESCE(CONVERT_TZ(t.eaten_at, '+00:00', 'Europe/Dublin'), t.eaten_at))
ON DUPLICATE KEY UPDATE pet_sprinkles.id = pet_sprinkles.id;

-- Backfill 2/2: of those, ticks of a meal with a direct homemade extra -> HOMEMADE_EXTRA 5.
-- Same probe as PetFirstRepository.countHomemadeExtras (no choice row = homemade, MPP-10).
INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount, created_at)
SELECT s.user_id, 'HOMEMADE_EXTRA', s.source_id, 5, s.created_at
FROM pet_sprinkles s
JOIN meal_plan_entries e ON e.id = s.source_id
WHERE s.source_type = 'MEAL_EATEN'
  AND EXISTS (
    SELECT 1
    FROM recipe_extras x
    LEFT JOIN meal_plan_entry_extra_choices c
           ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id
    WHERE x.parent_recipe_id = e.recipe_id
      AND (c.id IS NULL OR c.is_homemade = 1))
ON DUPLICATE KEY UPDATE pet_sprinkles.id = pet_sprinkles.id;

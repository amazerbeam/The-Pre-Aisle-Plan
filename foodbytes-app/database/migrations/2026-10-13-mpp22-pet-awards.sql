-- MPP-22: Pip's award ledger - one row per milestone crossed on a streak.
--
-- A streak (PLAN, SNACK or ALCOHOL) earns a milestone each time its running length passes a ladder
-- day: 1, 3, 5, 7, 14, 21, 30, repeating every 30 days (streak day s -> ladder day ((s-1) mod 30)+1,
-- cycle_index = (s-1) div 30). A row is identified by who earned it, on which streak type, which
-- milestone, the run's first day and the cycle, so recording the same award twice is a no-op
-- (uk_pet_awards). Counts per milestone are COUNT(*) per (user_id, streak_type, milestone).
-- Rows are never deleted by the app: an award stays earned even if a later untick shortens the run.
--
-- Per person (MPP-33): user_id is the person who earned it, never the meal-plan owner.
--
-- Lossless: creates a new, empty table; no existing row is read or changed (13 users locally,
-- no award data exists anywhere yet).
--
-- MUST be applied before the backend that maps PetAward deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 3 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_awards (
  id           BIGINT           NOT NULL AUTO_INCREMENT,
  user_id      BIGINT           NOT NULL,
  streak_type  VARCHAR(16)      NOT NULL,
  milestone    INT              NOT NULL,
  streak_start DATE             NOT NULL,
  cycle_index  INT              NOT NULL,
  awarded_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_awards (user_id, streak_type, milestone, streak_start, cycle_index),
  CONSTRAINT chk_pet_awards_streak_type CHECK (streak_type IN ('PLAN','SNACK','ALCOHOL')),
  CONSTRAINT chk_pet_awards_milestone   CHECK (milestone IN (1,3,5,7,14,21,30)),
  CONSTRAINT chk_pet_awards_cycle_index CHECK (cycle_index >= 0),
  CONSTRAINT fk_pet_awards_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

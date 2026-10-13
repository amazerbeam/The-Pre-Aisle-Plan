-- MPP-20: per-person habit streaks for Pip's daily check-in (snack-free, alcohol-free).
--
-- Adds two tables:
--   pet_habit_days    - one row per (user_id, habit, day) once that day has been answered for;
--                       clean = 1 for a clean day, 0 for the lapse day. MPP-31's rolling 30-day
--                       fitness score reads this log.
--   pet_habit_streaks - one summary row per (user_id, habit): streak_start (first day of the running
--                       streak; NULL until the first clean day), best (never lowered) and
--                       last_answered_date. The running streak length is derived from
--                       streak_start..last_answered_date, never stored.
--
-- habit is VARCHAR(16) + CHECK rather than a MySQL ENUM; the entity pins @JdbcTypeCode(VARCHAR).
-- Habits always belong to the caller, never to users.meal_plan_owner_id (per-person Pip, MPP-33).
--
-- Purely additive and lossless: no existing table, column or row changes. Local counts at planning
-- (2026-10-13): users 13 rows; no pet_habit_* table exists.
--
-- MPP-15 is local-first: applied to the local foodbytes-db now, listed in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md, and MUST be applied to the Railway
-- MySQL BEFORE the merged backend deploys (spring.jpa.hibernate.ddl-auto = validate fails startup
-- otherwise). Safe to apply while the current backend runs.

CREATE TABLE IF NOT EXISTS pet_habit_days (
  id       BIGINT      NOT NULL AUTO_INCREMENT,
  user_id  BIGINT      NOT NULL,
  habit    VARCHAR(16) NOT NULL,
  day      DATE        NOT NULL,
  clean    BOOLEAN     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_habit_days_user_habit_day (user_id, habit, day),
  CONSTRAINT chk_pet_habit_days_habit CHECK (habit IN ('SNACK','ALCOHOL')),
  CONSTRAINT fk_pet_habit_days_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_habit_streaks (
  id                 BIGINT      NOT NULL AUTO_INCREMENT,
  user_id            BIGINT      NOT NULL,
  habit              VARCHAR(16) NOT NULL,
  streak_start       DATE        NULL,
  best               INT         NOT NULL DEFAULT 0,
  last_answered_date DATE        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_habit_streaks_user_habit (user_id, habit),
  CONSTRAINT chk_pet_habit_streaks_habit CHECK (habit IN ('SNACK','ALCOHOL')),
  CONSTRAINT fk_pet_habit_streaks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- MPP-33: per-person eaten ticks. Each person ticks the meals they ate; the meal plan stays shared.
--
-- Adds one table:
--   meal_plan_entry_eaten - one row per (meal_plan_entry_id, user_id) while that person has the
--                           meal ticked; eaten_at is the UTC wall time of their first tick.
--
-- Purely additive and lossless for existing data: no column or row changes. This file does not
-- carry the existing shared ticks (meal_plan_entries.eaten / eaten_at) over; MPP-35's go-live step
-- (order 2) copies them to each entry's plan owner straight after this table is created. Live counts at planning (2026-10-13): meal_plan_entries 800 rows,
-- 5 with eaten = 1; 2 linked users; meal_plan_entry_eaten does not exist.
--
-- The old meal_plan_entries.eaten / eaten_at columns stay until a follow-up cleanup migration: the
-- MPP-33 backend no longer maps them, validate ignores unmapped columns, and eaten has DEFAULT 0 so
-- inserts that omit it still succeed.
--
-- ON DELETE CASCADE on meal_plan_entry_id is load-bearing: MealPlanEntryRepository.deleteByUserIdAndDateRange
-- is a JPQL bulk delete that bypasses JPA cascades (same reason as MPP-10's extra-choice tables).
--
-- MUST be applied to the Railway MySQL BEFORE the MPP-33 backend is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise). Safe to apply while the
-- current backend runs.

CREATE TABLE IF NOT EXISTS meal_plan_entry_eaten (
  id                 BIGINT    NOT NULL AUTO_INCREMENT,
  meal_plan_entry_id BIGINT    NOT NULL,
  user_id            BIGINT    NOT NULL,
  eaten_at           TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpe_eaten_entry_user (meal_plan_entry_id, user_id),
  KEY idx_mpe_eaten_user (user_id),
  CONSTRAINT fk_mpe_eaten_entry FOREIGN KEY (meal_plan_entry_id)
    REFERENCES meal_plan_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpe_eaten_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

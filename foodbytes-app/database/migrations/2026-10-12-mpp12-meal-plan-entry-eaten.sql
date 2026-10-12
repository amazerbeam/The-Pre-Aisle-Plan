-- MPP-12: mark a planned meal as eaten (one shared state per meal plan entry).
--
-- Adds two columns to meal_plan_entries:
--   eaten     TINYINT(1) NOT NULL DEFAULT 0 - one shared state per entry; linked users
--             (users.meal_plan_owner_id) read and write the owner's row, so both see it
--   eaten_at  TIMESTAMP NULL - UTC wall time the entry was first ticked; NULL when not eaten
--
-- Purely additive and lossless: no existing column or row changes, every existing row becomes
-- eaten = 0 / eaten_at = NULL (AC 8). Live counts at planning (2026-10-12): meal_plan_entries
-- 800 rows across 7 owners. No eaten_by column by design (ticket: no "ticked by").
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these columns is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise). Safe to apply while the
-- current backend runs: validate ignores columns the entity does not map.

ALTER TABLE meal_plan_entries
  ADD COLUMN eaten    TINYINT(1) NOT NULL DEFAULT 0 AFTER servings,
  ADD COLUMN eaten_at TIMESTAMP  NULL     DEFAULT NULL AFTER eaten;

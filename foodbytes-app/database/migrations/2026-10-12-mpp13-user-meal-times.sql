-- 2026-10-12 — User-configurable meal times (MPP-13)
--
-- Adds three nullable TIME columns to users: the time by which the user usually
-- eats breakfast, lunch and dinner. NULL means "use the default"
-- (11:00 / 15:00 / 21:00, owned by MealTimesPolicy in the backend) — the defaults
-- are deliberately NOT written into the rows, so changing a default later reaches
-- every user who never chose their own, and "Reset to defaults" is a plain
-- clear-to-NULL.
--
-- Purely additive and lossless: no existing column or row changes. Live counts at
-- planning (2026-10-12): users = 13 rows; none of breakfast_by / lunch_by /
-- dinner_by existed. Every existing user reads as "defaults" (MPP-13 AC 2).
--
-- The three columns are always written together (all set, or all NULL) by
-- UserService.updatePreferences; the strict breakfast < lunch < dinner order is
-- enforced by the application (MealTimesRequest), not by a CHECK constraint, so
-- the 400 message stays the one the frontend shows.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these columns
-- is deployed (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise).
-- Safe to apply while the current backend runs: validate ignores unmapped columns.

ALTER TABLE users
  ADD COLUMN breakfast_by TIME NULL DEFAULT NULL AFTER default_servings,
  ADD COLUMN lunch_by     TIME NULL DEFAULT NULL AFTER breakfast_by,
  ADD COLUMN dinner_by    TIME NULL DEFAULT NULL AFTER lunch_by;

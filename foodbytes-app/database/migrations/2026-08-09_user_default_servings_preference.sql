-- 2026-08-09 — User default portions preference (MPP-3)
--
-- Two changes to users.default_servings:
--
-- 1. Reset every row to NULL. The column already existed as INT NULL DEFAULT 1
--    but was dead — no backend or frontend code path ever read or wrote it
--    (grep found only the 2026-05-18_password_auth.sql seed INSERT). All 11
--    rows therefore hold the untouched column default of 1, not anyone's
--    choice. MPP-3 AC 9 requires "never set" to fall back to the recipe's own
--    default_servings, so NULL becomes the canonical never-set value. Leaving
--    the 1s in place would silently give every existing user a one-serving
--    preference the moment the feature ships.
--
-- 2. Widen INT -> DECIMAL(4,2), matching meal_plan_entries.servings, so the
--    preference supports the same 0.25 quarter-portion precision as every
--    other servings control. Lossless: all 11 rows hold the integer 1, well
--    inside DECIMAL(4,2)'s 0.01..99.99 range. No backfill needed.
--
-- DECIMAL(4,2) permits 0.01..99.99 at the column level; the application floor
-- (0.25) and ceiling (20) are enforced by UserPreferencesUpdateRequest
-- validation, mirroring how MealPlanCreateRequest guards the entry column.
--
-- IDEMPOTENT. The destructive UPDATE is guarded on information_schema still
-- reporting the column as `int`, which is only true on the first run. Re-running
-- this file after go-live is a no-op and will NOT wipe real preferences. The
-- ALTER is naturally idempotent (MODIFY to the same type does nothing).
--
-- MUST be applied to the Railway MySQL BEFORE the backend redeploys.
-- Hibernate runs ddl-auto: validate and will refuse to start if the entity is
-- BigDecimal while the column is still INT.

SET @is_int := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'default_servings'
    AND DATA_TYPE    = 'int'
);

SET @reset_sql := IF(@is_int = 1,
                     'UPDATE users SET default_servings = NULL',
                     'DO 0');
PREPARE reset_stmt FROM @reset_sql;
EXECUTE reset_stmt;
DEALLOCATE PREPARE reset_stmt;

ALTER TABLE users
  MODIFY COLUMN default_servings DECIMAL(4,2) NULL DEFAULT NULL;

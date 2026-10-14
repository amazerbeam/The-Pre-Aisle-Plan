-- MPP-31: Pip evolves. Records when a user's Pip first reached Basilisk (90 points) so the form
-- stays Basilisk forever, even if later slips or backdated check-in answers lower the replayed
-- total (AC 3).
--
-- Lossless: adds one NULLable column with no default value to fill. No backfill is needed —
-- checked 2026-10-14 on the local foodbytes-db: pet_habit_days holds 2 rows (1 user, both
-- 2026-10-14), so no user can be near 90 points.
--
-- Hibernate runs ddl-auto: validate. Apply this to the database BEFORE the backend that maps
-- User.petFullyGrownAt starts: local foodbytes-db now, Railway at MPP-15 epic merge
-- (.claude/contract/MPP-15-epic-breakdown/railway-migrations.md, row 5).
--
-- Idempotent (guarded on information_schema) so the combined go-live file can be re-run safely
-- after a partial failure. MySQL 8.0 has no ADD COLUMN IF NOT EXISTS.

SET @mpp31_has_col := (SELECT COUNT(*) FROM information_schema.columns
                       WHERE table_schema = DATABASE() AND table_name = 'users'
                         AND column_name = 'pet_fully_grown_at');
SET @mpp31_sql := IF(@mpp31_has_col = 0,
  'ALTER TABLE users ADD COLUMN pet_fully_grown_at TIMESTAMP NULL DEFAULT NULL AFTER pet_name',
  'DO 0');
PREPARE mpp31_stmt FROM @mpp31_sql;
EXECUTE mpp31_stmt;
DEALLOCATE PREPARE mpp31_stmt;

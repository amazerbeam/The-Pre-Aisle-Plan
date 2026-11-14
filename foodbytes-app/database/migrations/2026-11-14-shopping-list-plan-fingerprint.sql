-- 2026-11-14 Shopping redesign (plan: .claude/contract/2026-11-14-meal-plan-screen-redesign/)
-- Stores a SHA-256 fingerprint of the meal plan (entries + extra choices in the list's date range,
-- effective owner) when a shopping list is generated, so GET /api/shopping-list can report
-- planChangedSinceGenerated. Lossless: a new NULLable column; the 5 existing lists stay NULL
-- (reported as not-stale until regenerated). MUST be applied before the backend that maps
-- ShoppingList.planFingerprint deploys (Hibernate ddl-auto=validate).
SET @has := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'shopping_lists' AND column_name = 'plan_fingerprint');
SET @sql := IF(@has = 0,
  'ALTER TABLE shopping_lists ADD COLUMN plan_fingerprint CHAR(64) NULL AFTER generated_at',
  'SELECT ''plan_fingerprint already present''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

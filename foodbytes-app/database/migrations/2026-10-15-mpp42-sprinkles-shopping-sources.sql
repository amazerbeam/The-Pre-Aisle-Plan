-- MPP-42: two new sprinkles sources - the week's shopping list made (+10) and finished (+15).
--
--   SHOPPING_LIST_GENERATED  10  epoch day of a Monday - a list was generated that Mon-Sun week
--   SHOPPING_LIST_COMPLETED  15  epoch day of a Monday - the list had >= 1 item, all checked
-- Both pay every member of the shared plan (MPP-33), once per (person, week) via uk_pet_sprinkles,
-- so regenerating or re-checking in the same week pays nothing. No backfill (out of scope).
--
-- source_type is widened VARCHAR(16) -> VARCHAR(32): the new names are 23 characters.
-- chk_pet_sprinkles_source is re-declared as a superset of MPP-27's list.
--
-- Lossless: widening a VARCHAR keeps every value (longest today: STATION_UPGRADE, 15 chars), and
-- the CHECK only gains values, so every existing row passes. Evidence 2026-10-15: local
-- foodbytes-db 4 rows (all MEAL_EATEN); Railway 27 rows, already varchar(16) + MPP-27's CHECK.
--
-- Idempotent (MPP-15 go-live file): the CHECK is dropped only if present, MODIFY re-applies the
-- same type, and the CHECK is re-added - re-running the file is safe. The CHECK is dropped before
-- the MODIFY so the column change never fights the constraint.
--
-- MUST run after MPP-27's 2026-10-14-mpp27-pet-room-decor.sql (go-live row 10) and before the
-- backend that pays SHOPPING_LIST_* starts - Hibernate validate does not check CHECK constraints
-- or VARCHAR length, so a missing apply fails at the first shopping payout, not at startup.
-- MPP-15 is local-first: applied to the local foodbytes-db now; row 12 of
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles MODIFY source_type VARCHAR(32) NOT NULL;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE',
   'SHOPPING_LIST_GENERATED','SHOPPING_LIST_COMPLETED'));

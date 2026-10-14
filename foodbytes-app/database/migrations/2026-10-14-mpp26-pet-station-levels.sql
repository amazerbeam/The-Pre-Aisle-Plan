-- MPP-26: Pip's station levels (bed, fridge, cooker, trophy cabinet), per person, plus the ledger
-- source for spending sprinkles on them.
--
-- pet_station_levels - one row per station a person has upgraded; level 2..4. A missing row is
-- level 1, so every user (existing and new) starts at 1 with no backfill (AC 1). Written only by
-- StationService.upgrade under the per-person wallet lock; nothing lowers a level or deletes a row,
-- so upgrades are never lost (AC 4).
--
-- pet_sprinkles.chk_pet_sprinkles_source is re-declared as a superset of MPP-25's list, adding
-- STATION_UPGRADE: a spend is one negative row, source_id = station code * 10 + new level
-- (bed 1, fridge 2, cooker 3, cabinet 4 -> 12..44), so uk_pet_sprinkles also lets each person buy
-- each (station, level) once.
--
-- Per person (MPP-33): user_id is the person upgrading their own room, never the meal-plan owner.
--
-- Lossless: one new, empty table, and a CHECK widened to a superset (every existing row still
-- passes). Local evidence 2026-10-14: 13 users (2 linked), no station table yet.
--
-- Idempotent (MPP-15 go-live file): CREATE TABLE IF NOT EXISTS, and the CHECK is dropped only if
-- present before being re-added, so re-running the file is safe.
--
-- MUST run after MPP-25's 2026-10-14-mpp25-pet-sprinkles.sql (go-live row 7) and before the
-- backend that maps PetStationLevel starts (ddl-auto: validate). MPP-15 is local-first: applied to
-- the local foodbytes-db now; row 8 of .claude/contract/MPP-15-epic-breakdown/railway-migrations.md
-- for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_station_levels (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  user_id     BIGINT      NOT NULL,
  station     VARCHAR(16) NOT NULL,
  level       INT         NOT NULL,
  upgraded_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_station_levels (user_id, station),
  CONSTRAINT chk_pet_station_levels_station CHECK (station IN ('BED','FRIDGE','COOKER','CABINET')),
  CONSTRAINT chk_pet_station_levels_level CHECK (level BETWEEN 2 AND 4),
  CONSTRAINT fk_pet_station_levels_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE'));

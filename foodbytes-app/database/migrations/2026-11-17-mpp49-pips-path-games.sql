-- MPP-49 (Pip's Path backend): issued game maps, per-person game progress, and the GAME_CLEAR
-- sprinkles source (5 per cleared map, capped at 50 a Europe/Dublin day in SprinklePolicy).
--
--   pet_game_maps      one row per issued map; the server replays a clear against `layout`,
--                      and its id is pet_sprinkles.source_id for GAME_CLEAR (pays once per map)
--   pet_game_progress  one row per (person, family): highest_cleared 0-10, refresher_through =
--                      highest chapter whose refresher of this family is cleared (0 = none)
--   chk_pet_sprinkles_source  re-declared as MPP-42's list + GAME_CLEAR
--
-- Lossless: two new tables (absent locally, 2026-11-17), and the CHECK only gains a value, so every
-- existing pet_sprinkles row passes (local: 4 rows, all MEAL_EATEN).
--
-- Idempotent (MPP-15 go-live file): CREATE TABLE IF NOT EXISTS; the CHECK is dropped only if
-- present and re-added. MUST run AFTER 2026-10-15-mpp42-sprinkles-shopping-sources.sql (go-live
-- row 12) - MPP-42 re-declares the CHECK without GAME_CLEAR. MUST be applied before the backend
-- that maps PetGameMap / PetGameProgress starts (Hibernate validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; row 13 of
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_game_maps (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  family      VARCHAR(32)   NOT NULL,
  difficulty  INT           NOT NULL,
  mode        VARCHAR(16)   NOT NULL,
  chapter     INT           NULL,
  seed        BIGINT        NOT NULL,
  width       INT           NOT NULL,
  height      INT           NOT NULL,
  layout      VARCHAR(1024) NOT NULL,
  issued_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at  TIMESTAMP     NULL,
  PRIMARY KEY (id),
  KEY idx_pet_game_maps_user (user_id, issued_at),
  CONSTRAINT chk_pet_game_maps_difficulty CHECK (difficulty BETWEEN 1 AND 10),
  CONSTRAINT chk_pet_game_maps_mode CHECK (mode IN ('CHAPTER','REFRESHER','ENDLESS')),
  CONSTRAINT fk_pet_game_maps_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_game_progress (
  id                BIGINT      NOT NULL AUTO_INCREMENT,
  user_id           BIGINT      NOT NULL,
  family            VARCHAR(32) NOT NULL,
  highest_cleared   INT         NOT NULL DEFAULT 0,
  refresher_through INT         NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_game_progress (user_id, family),
  CONSTRAINT chk_pet_game_progress_highest CHECK (highest_cleared BETWEEN 0 AND 10),
  CONSTRAINT fk_pet_game_progress_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE',
   'SHOPPING_LIST_GENERATED','SHOPPING_LIST_COMPLETED','GAME_CLEAR'));

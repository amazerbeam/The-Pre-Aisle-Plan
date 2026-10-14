-- MPP-27: Pip's room decor, per person - what each person has bought (kept forever) and what sits
-- on each of the room's fixed spots, plus the ledger source for paying for it.
--
-- pet_decor_owned - one row per decor item or style a person has bought. Never deleted by the app
-- (AC 2: owned forever). The free default styles (wall-lavender, floor-lilac) are owned implicitly
-- and never stored. Written only by DecorService.buy under the per-person wallet lock.
--
-- pet_room_placements - one row per filled spot: LEFT_WALL / RIGHT_WALL / FLOOR hold a decor item,
-- WALL_STYLE / FLOOR_STYLE hold the chosen style. A missing row is an empty spot, or the default
-- style, so every user (existing and new) starts with today's room and no backfill. item_key is not
-- CHECK-constrained: the catalogue is data in DecorCatalogue.java (the pet_wardrobe_unlocks precedent).
--
-- pet_sprinkles.chk_pet_sprinkles_source is re-declared as a superset of MPP-26's list, adding
-- DECOR_PURCHASE: a purchase is one negative row with source_id = the pet_decor_owned.id inserted in
-- the same transaction, so each debit points at what it bought.
--
-- Per person (MPP-33): user_id is the person decorating their own room, never the meal-plan owner.
--
-- Lossless: two new, empty tables, and a CHECK widened to a superset (every existing row still
-- passes). Local evidence 2026-10-14: no decor or room tables exist; 13 users (2 linked).
--
-- Idempotent (MPP-15 go-live file): CREATE TABLE IF NOT EXISTS, and the CHECK is dropped only if
-- present before being re-added, so re-running the file is safe.
--
-- MUST run after MPP-25 (go-live row 7, creates pet_sprinkles) and MPP-26 (row 8), and before the
-- backend that maps PetDecorOwned / PetRoomPlacement starts (ddl-auto: validate). MPP-15 is
-- local-first: applied to the local foodbytes-db now; row 9 of
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_decor_owned (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  user_id      BIGINT      NOT NULL,
  item_key     VARCHAR(32) NOT NULL,
  purchased_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_decor_owned (user_id, item_key),
  CONSTRAINT fk_pet_decor_owned_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_room_placements (
  id        BIGINT      NOT NULL AUTO_INCREMENT,
  user_id   BIGINT      NOT NULL,
  spot      VARCHAR(16) NOT NULL,
  item_key  VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_room_placements (user_id, spot),
  CONSTRAINT chk_pet_room_placements_spot CHECK (spot IN ('LEFT_WALL','RIGHT_WALL','FLOOR','WALL_STYLE','FLOOR_STYLE')),
  CONSTRAINT fk_pet_room_placements_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE'));

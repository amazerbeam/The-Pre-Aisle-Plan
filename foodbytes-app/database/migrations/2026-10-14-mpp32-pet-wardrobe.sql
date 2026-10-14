-- MPP-32: Pip's wardrobe. Two per-person tables:
--
-- pet_wardrobe_unlocks - one row per clothing item a person has unlocked. Written by
-- WardrobeService.sync via an idempotent INSERT ... ON DUPLICATE KEY UPDATE id = id (uk on
-- user_id + item_key), and never deleted by the app: unlocks are kept forever (AC 2), even if a
-- later slip lowers Pip's form or an untick shortens a streak. seen_at stays NULL until the user
-- opens the slot holding the item in the Dress Pip screen; NULL drives the Wardrobe badge and the
-- NEW tags, and survives a reload (AC 4).
--
-- pet_outfit_slots - what Pip is wearing: at most one item per slot (uk on user_id + slot). An
-- empty slot is a missing row.
--
-- item_key is not CHECK-constrained: the catalogue is data in WardrobeCatalogue (20 items today)
-- and the service rejects unknown ids before writing.
--
-- Per person (MPP-33): user_id is always the person dressing their own Pip, never the meal-plan owner.
--
-- Lossless: creates two new, empty tables; no existing row is read or changed. Checked 2026-10-14 on
-- the local foodbytes-db: 13 users, no wardrobe/outfit tables yet. No backfill - each user's
-- starter items (beanie, jeans) and anything already earned are granted on their next GET /api/pet.
--
-- MUST be applied before the backend that maps PetWardrobeUnlock / PetOutfitSlot starts
-- (ddl-auto: validate). MPP-15 is local-first: applied to the local foodbytes-db now; listed as
-- order 7 in .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_wardrobe_unlocks (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  user_id     BIGINT      NOT NULL,
  item_key    VARCHAR(32) NOT NULL,
  unlocked_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen_at     TIMESTAMP   NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_wardrobe_unlocks (user_id, item_key),
  CONSTRAINT fk_pet_wardrobe_unlocks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_outfit_slots (
  id        BIGINT      NOT NULL AUTO_INCREMENT,
  user_id   BIGINT      NOT NULL,
  slot      VARCHAR(16) NOT NULL,
  item_key  VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_outfit_slots (user_id, slot),
  CONSTRAINT chk_pet_outfit_slots_slot CHECK (slot IN ('HAT','GLASSES','SCARF','JACKET','BELT','PANTS','SHOES')),
  CONSTRAINT fk_pet_outfit_slots_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

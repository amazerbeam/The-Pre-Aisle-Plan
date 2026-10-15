-- MPP-40: Pip's room grows from 3 decor spots to 12, the rug becomes a spot, and a wardrobe
-- station joins the other four.
--
-- pet_room_placements - the three MPP-27 spots are renamed to their new names, so every existing
-- placement still shows in the same place (AC 3): LEFT_WALL -> OVER_WARDROBE, RIGHT_WALL ->
-- FRONT_RIGHT_WALL, FLOOR -> BY_FRIDGE. chk_pet_room_placements_spot is re-declared with the 12
-- decor spots plus the two finishes. RUG, like the finishes, stores no row for its free default
-- (rug-pink), so every room starts with the pink rug and no backfill (AC 4).
--
-- pet_station_levels - chk_pet_station_levels_station is re-declared as a superset adding WARDROBE
-- (AC 5). A missing row is level 1, as for the other stations. Its upgrades use the existing
-- STATION_UPGRADE ledger source (ids 52..54), so pet_sprinkles is untouched.
--
-- Lossless: renames only, and both CHECKs accept every row the renamed data can hold. Local
-- evidence 2026-10-15: pet_room_placements 0 rows, pet_station_levels 0 rows, pet_decor_owned 0 rows.
--
-- Idempotent (MPP-15 go-live file): each CHECK is dropped only if present before being re-added,
-- and the UPDATEs match nothing on a second run.
--
-- MUST run after MPP-27's 2026-10-14-mpp27-pet-room-decor.sql (go-live row 10, which creates
-- chk_pet_room_placements_spot) and before the backend that knows RoomSpot.OVER_WARDROBE /
-- RoomStation.WARDROBE starts. MPP-15 is local-first: applied to the local foodbytes-db now; row 11
-- of .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_room_placements_spot');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_room_placements DROP CHECK chk_pet_room_placements_spot', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

UPDATE pet_room_placements SET spot = 'OVER_WARDROBE'    WHERE spot = 'LEFT_WALL';
UPDATE pet_room_placements SET spot = 'FRONT_RIGHT_WALL' WHERE spot = 'RIGHT_WALL';
UPDATE pet_room_placements SET spot = 'BY_FRIDGE'        WHERE spot = 'FLOOR';

ALTER TABLE pet_room_placements ADD CONSTRAINT chk_pet_room_placements_spot CHECK (spot IN
  ('OVER_WARDROBE','BEDSIDE_WALL','FRONT_RIGHT_WALL','WINDOW_DRESSING','WINDOWSILL','RUG',
   'BACK_CORNER','BEDSIDE_NOOK','FOOT_OF_BED','BY_FRIDGE','CORNER_BY_DOOR','FRONT_OF_ROOM',
   'WALL_STYLE','FLOOR_STYLE'));

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_station_levels_station');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_station_levels DROP CHECK chk_pet_station_levels_station', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_station_levels ADD CONSTRAINT chk_pet_station_levels_station CHECK (station IN
  ('BED','FRIDGE','COOKER','CABINET','WARDROBE'));

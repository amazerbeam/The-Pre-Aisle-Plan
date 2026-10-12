-- MPP-14: the pet's name, stored once per meal plan on the OWNER's users row.
--
-- What: adds users.pet_name VARCHAR(12) NULL. NULL means "use the default name"
-- (PetPolicy.DEFAULT_NAME = "Pip"); a linked user's own column stays NULL and is
-- never read — PetService resolves meal_plan_owner_id first.
--
-- Why it is lossless: a new nullable column with no default and no backfill. Live
-- Railway had 13 users on 2026-10-12 (2 linked, 2 distinct owners); every one reads
-- as "Pip" until renamed.
--
-- No AFTER clause on purpose, so this does not depend on the MPP-13 meal-time
-- columns being present.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps User.petName
-- deploys (Hibernate ddl-auto: validate). Apply order on Railway when shipping
-- MPP-12/13/14 together:
--   1. 2026-10-12-mpp12-meal-plan-entry-eaten.sql
--   2. 2026-10-12-mpp13-user-meal-times.sql
--   3. 2026-10-12-mpp14-user-pet-name.sql   (this file)
-- Safe to apply while the current backend is running.

ALTER TABLE users
  ADD COLUMN pet_name VARCHAR(12) NULL DEFAULT NULL;

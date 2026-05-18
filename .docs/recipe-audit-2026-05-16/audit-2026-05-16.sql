-- =============================================================================
-- Recipe Audit — Meal Plan Week 2026-05-18 → 2026-05-24
-- Generated: 2026-05-16 (appended per family as audits are approved)
-- Companion: ./TODO.md
--
-- BACKUP TAKEN: __________ (Railway snapshot timestamp — fill in before running)
--
-- Scope: 16 recipe families (18 recipes) from the May 18–24 meal plan.
-- Idempotency: every INSERT into recipe_ingredients / recipe_meals / recipe_extras
--   / recipe_family_members is guarded with WHERE NOT EXISTS. recipe_steps uses
--   wipe-and-re-insert per recipe. Re-running this file is a no-op on applied rows.
--
-- Run order (FK-safe):
--   1. New ingredients (if any)
--   2. recipes (per-variant UPDATEs to calories, name, etc.)
--   3. recipe_ingredients (guarded INSERTs / UPDATEs of quantity_grams)
--   4. recipe_steps (DELETE + re-INSERT per recipe)
--   5. recipe_meals (guarded)
--   6. recipe_extras (guarded)
--   7. recipe_families / recipe_family_members (guarded UPDATEs)
--
-- Recipes touched:
--   (none yet — sections appended below as audits are approved)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Section: Family 23 — Spaghetti Bolognese (Light 81)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 7 — Chicken & Vegetable Soup (Light 23 / Moderate 24)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 42 — Salmon with Air-Fried Potatoes & Green Beans (Light 139)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 12 — Chicken Tikka Masala (Light 40)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 37 — Hash Browns & Diced Chicken (Moderate 125)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 32 — Pad Kee Mao / Drunken Noodles (Light 108)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 31 — Beef & Mushroom Black Bean Stir Fry (Light 104)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 11 — Pink Sauce Pasta (Light 37)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 88 — Mediterranean White Bean & Chicken Soup (Light 189)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 86 — Protein Porridge with Berries (Light 187)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 87 — Greek Chicken Gyros Bowl (Light 188)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 90 — Tuscan Chicken with Rice (Light 191)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 17 — Chicken Burrito Bowl (Moderate 58)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 39 — Peanut Butter Banana Overnight Oats (Light 130 / Moderate 131)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 3 — Irish Chicken Curry (Light 7)
-- Status: pending audit
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- Section: Family 40 — Tamarind Tossed Noodles (Moderate 134)
-- Status: pending audit
-- -----------------------------------------------------------------------------

-- =============================================================================
-- END OF FILE
-- =============================================================================

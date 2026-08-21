-- 2026-08-18 Recipe cleanup ahead of the full audit pass
--
-- 1. Homemade Big Mac (63)      -> cheat meal, excluded from audit
-- 2. Pastichio (Lasagna) (65)   -> cheat meal, serves 4 (was 8), excluded from audit
-- 3. Peanut Butter Banana Smoothie (family 2, recipes 4/5/6) -> "Frozen Banana Smoothie"
-- 4. Homemade Doner Kebab (136/137/138) + Korean Fried Chicken (121/122/123)
--    -> retired via is_live = 0, NOT hard-deleted: 4 of the 6 appear in
--       meal_plan_entries (1 user, Jan-Apr 2026) and a hard delete would drop
--       days out of that user's plan history. Reversible.
--
-- Idempotent: every statement is a targeted UPDATE, safe to re-run.

-- 1. Homemade Big Mac -> cheat
UPDATE recipes SET is_cheat = 1 WHERE id = 63;

-- 2. Pastichio -> cheat, serves 4.
--    calories is whole-recipe kcal and does NOT change with default_servings.
--    Stored 6705 vs recomputed 6552 = 2.3% out, inside the 5% tolerance, so left as-is.
UPDATE recipes SET is_cheat = 1, default_servings = 4 WHERE id = 65;

-- 3. Rename the smoothie family + all three variants (names stay identical across siblings)
UPDATE recipes SET name = 'Frozen Banana Smoothie' WHERE id IN (4, 5, 6);
UPDATE recipe_families SET family_name = 'Frozen Banana Smoothie' WHERE id = 2;
--    macros_audited is deliberately NOT cleared: the attestation is invalidated by
--    changes to recipe_ingredients / default_servings / calories, not by a rename.

-- 4. Retire Doner Kebab + Korean Fried Chicken
UPDATE recipes SET is_live = 0 WHERE id IN (136, 137, 138, 121, 122, 123);
--    Flatbread (19) is left live: 3 other parents still reference it in recipe_extras.

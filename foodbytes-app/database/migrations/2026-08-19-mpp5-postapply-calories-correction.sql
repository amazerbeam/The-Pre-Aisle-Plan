-- 2026-08-19-mpp5-postapply-calories-correction.sql
-- Follow-up to 2026-08-18-mpp5-family-audit-remediation.sql, which was applied to the live
-- Railway MySQL on 2026-08-19.
--
-- WHY THIS EXISTS
--   Task 37 (the post-apply authoritative macro recompute) found the stored recipes.calories
--   column drifting from the recomputed whole-recipe total on six recipes the migration had
--   just written. Two of them are over the 5 % KCALCOL reject tolerance:
--       221  +9.0 %   (Greek Yogurt & Granola Bowl, Moderate)
--       269  -5.6 %   (Salmon Sandwich, the Light created by Task 30)
--   and four are inside tolerance but still wrong:
--       220  -4.9 %   247  +5.1 %   248  +3.9 %   249  +3.0 %
--
--   The INGREDIENTS ARE CORRECT on all six -- verified row by row against the live rows and
--   against the pre-apply backup. This is purely the stored column: the figures written by
--   the migration were computed against assumed linked-recipe yields (Goodness Granola,
--   Burger Patties, Milk Bread) rather than against the live yields the database actually
--   holds. Per CLAUDE.md the recomputed value is the trustworthy one, so it is written here.
--
--   No macro moves. recipes.calories is not the display source -- the backend derives
--   per-serving kcal from ingredients + prorated extras via MacroCalculationService -- so the
--   user-facing cards were never wrong. The column survives as the admin-editable value and
--   as the audit reference, which is why it has to agree.
--
-- WHAT IT DOES NOT TOUCH
--   No ingredient row, no step, no macros_audited flag. Per the chef skill's invalidation
--   rule a calories change DOES stale an attestation -- but here the change makes the column
--   agree with the composition that was already verified in the same pass, so the attestation
--   is being corrected into truth rather than invalidated. The six recipes stay
--   macros_audited = 1 and their timestamps are left alone.
--
-- IDEMPOTENT: plain UPDATEs to literal values. Safe to re-run.

UPDATE recipes SET calories = 988  WHERE id = 220;   -- was 940,  computed 988  (-4.9 %)
UPDATE recipes SET calories = 1066 WHERE id = 221;   -- was 1162, computed 1066 (+9.0 %)  KCALCOL
UPDATE recipes SET calories = 924  WHERE id = 247;   -- was 971,  computed 924  (+5.1 %)  KCALCOL
UPDATE recipes SET calories = 1137 WHERE id = 248;   -- was 1181, computed 1137 (+3.9 %)
UPDATE recipes SET calories = 1350 WHERE id = 249;   -- was 1391, computed 1350 (+3.0 %)
UPDATE recipes SET calories = 931  WHERE id = 269;   -- was 879,  computed 931  (-5.6 %)

-- Recipe 222 computed 1421 against a stored 1421 (0.0 %) and is deliberately absent.

-- Post-apply check -- every one of the six should return drift 0.0 %.
SELECT id, calories FROM recipes WHERE id IN (220,221,222,247,248,249,269) ORDER BY id;

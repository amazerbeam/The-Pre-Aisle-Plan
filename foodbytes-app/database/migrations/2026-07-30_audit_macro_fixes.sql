-- 2026-07-30  Audit remediation part 2 — the five real macro failures
--
-- Scored under the policy in .claude/rules/recipe-variants.md
-- ("Calories are a target, not a reject condition"): protein >= 35 g,
-- fat <= 35 %, carbs >= 38 % per serving. kcal is advisory.
--
-- Of 58 rows across 20 audited families, exactly 6 breached. Recipe 90
-- (Paella Valenciana) is handled in the next migration because it also needs a
-- family build-out. The other five, each fixed with ONE lever:
--
--   84  Black Pepper Beef, Light     P 24.6 g -> 36.2 g   sirloin 180 -> 290 g
--   85  Black Pepper Beef, Moderate  P 31.9 g -> 41.4 g   sirloin 240 -> 330 g
--   111 Chop Suey, Light             P 30.6 g -> 38.4 g   thigh 100 -> 140 g,
--                                                         sirloin 100 -> 125 g
--   190 Salmon, Light                F 35.8 % -> 33.5 %   olive oil 6 -> 2 g
--   127 Reina Arepa, Light           C 37.9 % -> 38.7 %   mayo link 15 -> 12 g
--
-- Recipe 86 (Black Pepper Beef, Balanced) needs no change — P 42.1 g.
--
-- Because kcal no longer constrains, no compensating cuts are needed: an
-- earlier draft of this work trimmed noodles and oil on 111 and added 180 g of
-- butterbeans to 190 purely to hold kcal inside a band. All dropped.
--
-- kcal ordering after the fixes (Light < Moderate < Balanced) still holds:
--   Black Pepper Beef 528 / 632 / 744
--   Chop Suey         582 / 630 / 787
--   Salmon            534 / 672 / 781
--   Reina Arepa       473 / 583 / 751
--
-- GOUT NOTE: raising sirloin cuts against .claude/skills/diet-guidelines
-- ("moderate red meat, prefer chicken/turkey"). Accepted deliberately — the
-- alternative is renaming the dish and swapping the protein. Flagged in
-- plan.md -> Risks.
--
-- Idempotent: every statement is an absolute assignment.

-- 84 Black Pepper Beef, Light — sirloin steak (ingredient 68)
UPDATE recipe_ingredients SET quantity = 290.00, quantity_grams = 290.00
WHERE recipe_id = 84 AND ingredient_id = 68;

-- 85 Black Pepper Beef, Moderate — sirloin steak
UPDATE recipe_ingredients SET quantity = 330.00, quantity_grams = 330.00
WHERE recipe_id = 85 AND ingredient_id = 68;

-- 111 Chop Suey, Light — chicken thigh (41) and sirloin (68)
UPDATE recipe_ingredients SET quantity = 140.00, quantity_grams = 140.00
WHERE recipe_id = 111 AND ingredient_id = 41;

UPDATE recipe_ingredients SET quantity = 125.00, quantity_grams = 125.00
WHERE recipe_id = 111 AND ingredient_id = 68;

-- 190 Salmon, Light — olive oil (22). Stays in grams: under 5 g, so the
-- Phase 5 unit sweep deliberately leaves sub-teaspoon fats alone.
UPDATE recipe_ingredients SET quantity = 2.00, quantity_grams = 2.00
WHERE recipe_id = 190 AND ingredient_id = 22;

-- 127 Reina Arepa, Light — Mayonnaise linked row (FR-103 dual path:
-- ingredient_id 87 AND linked_recipe_id 62 on the same row).
UPDATE recipe_ingredients SET quantity = 12.00, quantity_grams = 12.00
WHERE recipe_id = 127 AND linked_recipe_id = 62;

-- recipes.calories = whole-recipe kcal (per-serving x default_servings).
-- All five have default_servings = 2.
UPDATE recipes SET calories = CASE id
    WHEN  84 THEN 1055
    WHEN  85 THEN 1263
    WHEN 111 THEN 1165
    WHEN 190 THEN 1068
    WHEN 127 THEN  945
  END
WHERE id IN (84, 85, 111, 190, 127);

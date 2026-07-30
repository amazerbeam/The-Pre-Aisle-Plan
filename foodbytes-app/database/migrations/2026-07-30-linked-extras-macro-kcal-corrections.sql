-- =====================================================================
-- Linked-extras macro/kcal audit — data corrections
-- Date: 2026-07-30
-- Contract: .claude/contract/2026-07-30-linked-extras-macro-kcal-audit/
-- Findings: .claude/contract/2026-07-30-linked-extras-macro-kcal-audit/findings.md
--
-- WHAT THIS DOES
--   DML only — no DDL, no schema change. `ddl-auto: validate` cannot block
--   backend startup whether or not this file is applied. That also means a
--   forgotten apply fails SILENTLY: the derived display (Phases 2-3 of this
--   contract, already in the codebase) stays correct regardless, while the
--   admin-editable `recipes.calories` column keeps disagreeing with it.
--
--   MUST BE APPLIED MANUALLY to the Railway MySQL by the developer. No
--   automated step in this contract runs DDL or a write against production.
--
--   Every statement below is written to be RE-RUNNABLE: Section 1 is
--   guarded by a WHERE clause that only matches the pre-fix value (so once
--   applied, re-running is a no-op); Section 2 is a self-computing
--   correlated UPDATE that derives its own target from current data, so
--   re-running it always converges on the same answer rather than drifting.
--   Sections 3 and 4 are entirely commented out pending developer approval
--   (see "DEVELOPER DECISIONS REQUIRED" below) and contain no destructive
--   statement in live form.
--
-- SCOPE (four sections, per Task 14 of the contract's tasks.md)
--   1. Recipe 65 (Pastichio) `quantity_grams` over-yield against Fresh
--      Pasta (36)'s 282 g batch — reject condition in
--      .claude/rules/linked-recipe-extras.md.
--   2. Realign the 20 store-bought-basis `recipes.calories` values onto
--      the homemade basis (.claude/rules/homemade-first-and-ingredient-dedup.md,
--      confirmed developer decision: nutrition is always homemade).
--   3. PROPOSED (commented) — wrong store-bought *product* mappings, a
--      shopping-list defect: Milk Bread -> Brioche Burger Buns, Fresh
--      Pasta -> Spaghetti (dried). Their macros are out of scope (never
--      read for nutrition); only the product identity is in scope.
--   4. PROPOSED (commented) — two `recipe_family_members` structure
--      violations of .claude/rules/recipe-variants.md: family 4 (Pizza)
--      has 4 members, family 26 (Paella Valenciana) has a NULL
--      `variant_label`.
--
-- OUT OF SCOPE / DELIBERATELY NOT ADDRESSED HERE
--   - Per-100g macro corrections on store-bought ingredient rows (26 of 38
--     dual-path rows diverge >10% from their homemade counterpart) — never
--     read for nutrition now that homemade-only is confirmed; busywork.
--   - Recipe redesigns for dishes that breach CLAUDE.md reject ceilings
--     once correctly computed (63, 22, 46, 120, 29) — a separate `chef`
--     engagement with macro-target acceptance criteria, not a calculation
--     fix. See findings.md section 8.
--   - The 13 "neither basis" recipes (20, 21, 22, 28, 45, 46, 87, 119, 128,
--     136, 137, 138, 189) — see the note at the end of this file. No
--     mechanism explains all 13 uniformly, and no computed target for any
--     of them (beyond 118/119/28's bare residuals) exists in findings.md
--     or plan.md. Fabricating a target kcal for these is explicitly worse
--     than leaving them for individual review, per this task's brief.
--
-- KNOWN OVERLAP WITH ANOTHER UNAPPLIED MIGRATION (found while writing this
-- file, flagged for the developer — not fixed here, no scope to fix it):
--   `foodbytes-app/database/migrations/2026-07-30_stromboli_rebuild.sql`
--   (same date, different task) reduces Pizza Dough (11)'s olive oil,
--   changing its yield from 761 g/2053 kcal (the figure this audit's
--   findings.md was computed against) to 733 g/1800 kcal, and separately
--   resyncs Pizza (13/14/15/107) `recipes.calories` to 1020/1206/1500/1553.
--   Section 2 below is a self-computing statement that reads
--   `recipe_ingredients`/`ingredients` live at apply time, so it produces
--   the CORRECT figure for 13/14/15/107 regardless of whether the
--   Stromboli migration has already been applied when this one runs — it
--   is not sensitive to apply order between the two files. This is exactly
--   why a self-computing statement was chosen over the hand-computed 1269
--   for recipe 14 that findings.md records: that figure is only valid
--   against the PRE-Stromboli-fix dough weight and would be stale if
--   applied after. Whichever migration lands last, Section 2 recomputes
--   fresh. The developer should still be aware both files touch recipes
--   13/14/15/107.
--
-- DEVELOPER DECISIONS REQUIRED BEFORE APPLYING (see tasks.md Task 15 Step 1)
--   1. Section 1: confirm 282 g (Fresh Pasta's full batch yield) is really
--      what Pastichio (65) uses, by checking its `recipe_steps` wording.
--      Shipped here as the rule-compliant CEILING (quantity_grams can never
--      legitimately exceed the linked recipe's total yield), not as a
--      verified true value — the true value could be lower.
--   2. Section 3: approve or reject each store-bought product swap, and
--      supply/confirm the target `ingredient_id`. A dedupe search
--      (.claude/rules/homemade-first-and-ingredient-dedup.md) must be run
--      before any new `ingredients` row is created.
--   3. Section 4: choose remediation for family 4 (recipe 107) and
--      family 26 (recipe 90) — each has more than one defensible fix.
--   4. Decide whether/when the 13 "neither basis" recipes get individual
--      review (see closing note). Not part of this migration.
-- =====================================================================


-- =====================================================================
-- SECTION 1 — Recipe 65 (Pastichio) quantity_grams over-yield
-- =====================================================================
-- Pastichio (65) claimed 454 g of Fresh Pasta (36) against a 282 g batch
-- yield (ratio 1.61), over-attributing the pasta contribution by 61%. All
-- other 63 linked rows in the database have ratios between 0.0485 and
-- 0.9220 (findings.md section 7.1) — 65 is the sole reject-condition
-- violation of .claude/rules/linked-recipe-extras.md ("quantity_grams must
-- be <= linked recipe's total yield").
--
-- 282.00 is shipped uncommented as the rule-compliant CEILING: no
-- legitimate value can exceed it, so clamping to it can never make the
-- violation worse, even if the dish's true intended portion turns out to
-- be lower. It is not a verified true value — the developer should confirm
-- against recipe 65's `recipe_steps` (decision 1 above) and adjust
-- downward if the steps describe a smaller portion (e.g. "half the
-- batch" would be 141 g, not 282 g).
--
-- Guarded by matching the known pre-fix value, so a re-run after this has
-- already landed is a no-op (quantity_grams will no longer be 454.00).
UPDATE recipe_ingredients
SET quantity = 282.00, quantity_grams = 282.00
WHERE recipe_id = 65 AND linked_recipe_id = 36 AND quantity_grams = 454.00;


-- =====================================================================
-- PRE-FLIGHT ASSERTION — confirm traversal depth is still 1 before running
-- SECTION 2. Section 2's "child" subquery computes a linked recipe's
-- kcal/gram from ITS OWN raw ingredient rows only (no recursion) — safe
-- exactly because the audit (findings.md section 6) verified depth 1: no
-- recipe that is itself a linked child anywhere in the database links a
-- further child of its own. This file is written to be re-runnable later,
-- so re-check that assumption every time rather than trusting a stale note.
--
-- Expected: ZERO ROWS. Any row returned means some recipe that is a linked
-- child (i.e. appears as `linked_recipe_id` on some other row) itself has a
-- non-NULL `linked_recipe_id` of its own — depth 2. That row's contribution
-- would be silently dropped from BOTH the numerator and denominator of the
-- "child" subquery's kcal_per_gram (its INNER JOIN to `ingredients` only
-- sees raw ingredient rows), skewing Section 2's derived kcal with no
-- error. If this returns any rows, STOP — do not run Section 2 as written;
-- it must be reworked into a recursive CTE (or iterated depth-by-depth)
-- before it can be trusted again.
--
-- SELECT DISTINCT ri2.recipe_id, ri2.linked_recipe_id
-- FROM recipe_ingredients ri2
-- WHERE ri2.linked_recipe_id IS NOT NULL
--   AND ri2.recipe_id IN (
--       SELECT DISTINCT linked_recipe_id
--       FROM recipe_ingredients
--       WHERE linked_recipe_id IS NOT NULL
--   );


-- =====================================================================
-- SECTION 2 — Realign the 20 store-bought-basis recipes.calories values
-- =====================================================================
-- findings.md classifies 20 of the 48 recipes with extras as having their
-- stored `recipes.calories` computed on the STORE-BOUGHT basis, the one
-- basis the developer has ruled out for nutrition ("We should never use
-- the store bought calores, if store bough is chosen the cals sill come
-- from homemade"). ids: 13, 14, 15, 44, 63, 65, 81, 82, 83, 88, 89, 90,
-- 98, 99, 100, 107, 118, 120, 127, 129.
--
-- APPROACH — self-computing, not hand-typed magic numbers.
-- Only recipe 14's homemade-basis target (1269, against the PRE-Stromboli-
-- fix dough) is explicitly worked out in plan.md/findings.md; the other 19
-- targets are NOT recorded anywhere in the contract's artifacts, and
-- inventing them would be fabrication. This UPDATE instead derives each
-- recipe's whole-recipe kcal directly from `recipe_ingredients` +
-- `ingredients`, applying the exact formula MacroCalculationService uses
-- (see plan.md Part 2 "Data shapes"):
--   ingredient kcal   = quantity_grams * (4*protein + 4*carbs + 9*fat) / 100
--   linked kcal       = quantity_grams * (linked_recipe_total_kcal / linked_recipe_total_yield_g)
--   recipe_total_kcal = SUM(raw ingredient kcal) + SUM(linked kcal)   -- rounded once, at the end
-- On an FR-103 dual-path row (both ingredient_id and linked_recipe_id set)
-- the homemade branch is taken and the store-bought ingredient is never
-- read — matching MacroCalculationService's isLinkedRecipe()-before-
-- isRawIngredient() branch order exactly.
--
-- SIMPLIFICATION (verified safe by the audit, findings.md section 6):
-- traversal depth is exactly 1 — no recipe that is itself a linked child
-- anywhere in the database links a further child. So a linked recipe's own
-- total kcal/yield can be computed from its raw ingredient rows alone,
-- with no recursion needed.
--
-- NATURALLY IDEMPOTENT: this does not compare against the old stored
-- value — it recomputes the target fresh from current ingredient data
-- every time it runs, so re-running it after it has already applied
-- converges on the same answer (or, if the ingredient graph changed since,
-- the new correct answer) rather than drifting or erroring.
--
-- ORDER: must run AFTER Section 1, since recipe 65's corrected
-- quantity_grams (282, not 454) is read live by this statement.
--
-- SANITY CHECK: recipe 14 (Pizza, Moderate) is the one figure independently
-- hand-verified in findings.md — 634 kcal/serving x 2 servings = 1269
-- whole-recipe, against the dough weight recorded there (761 g/2053 kcal).
-- If `2026-07-30_stromboli_rebuild.sql` has already been applied when this
-- runs, recipe 11's dough is leaner (733 g/1800 kcal) and 14's correct
-- result will legitimately differ from 1269 — that is the self-computing
-- approach working as intended, not a bug. Do not "fix" the result back to
-- 1269 if the dough has changed.
UPDATE recipes r
JOIN (
    SELECT ri.recipe_id,
           ROUND(SUM(
             CASE
               -- Homemade branch wins on a dual-path row; store-bought
               -- ingredient_id is never read here, matching the engine.
               WHEN ri.linked_recipe_id IS NOT NULL THEN
                 ri.quantity_grams * COALESCE(child.kcal_per_gram, 0)
               WHEN ri.ingredient_id IS NOT NULL THEN
                 -- LEFT JOIN to ingredients: a dangling ingredient_id (FK makes this
                 -- unreachable today, but this branch should still degrade to 0, not
                 -- NULL, the same way the linked branch above already does) must not
                 -- turn a whole recipe's SUM() into NULL if it were the only row.
                 COALESCE(ri.quantity_grams * (4 * ing.protein_per_100g + 4 * ing.carbs_per_100g + 9 * ing.fat_per_100g) / 100, 0)
               ELSE 0
             END
           )) AS homemade_kcal
    FROM recipe_ingredients ri
    LEFT JOIN ingredients ing ON ing.id = ri.ingredient_id
    LEFT JOIN (
        -- Per-linked-recipe kcal/gram, from ITS OWN raw ingredient rows
        -- only (safe: traversal depth is exactly 1, verified in the audit).
        SELECT ci.recipe_id,
               SUM(ci.quantity_grams * (4 * ci_ing.protein_per_100g + 4 * ci_ing.carbs_per_100g + 9 * ci_ing.fat_per_100g) / 100)
                 / NULLIF(SUM(ci.quantity_grams), 0) AS kcal_per_gram
        FROM recipe_ingredients ci
        JOIN ingredients ci_ing ON ci_ing.id = ci.ingredient_id
        GROUP BY ci.recipe_id
    ) child ON child.recipe_id = ri.linked_recipe_id
    WHERE ri.recipe_id IN (13, 14, 15, 44, 63, 65, 81, 82, 83, 88, 89, 90, 98, 99, 100, 107, 118, 120, 127, 129)
    GROUP BY ri.recipe_id
) homemade ON homemade.recipe_id = r.id
SET r.calories = homemade.homemade_kcal
WHERE r.id IN (13, 14, 15, 44, 63, 65, 81, 82, 83, 88, 89, 90, 98, 99, 100, 107, 118, 120, 127, 129);


-- =====================================================================
-- SECTION 3 — PROPOSED: wrong store-bought product mappings
-- =====================================================================
-- Shopping-list defect, not a macro defect: with homemade-only nutrition
-- confirmed, these ingredients' per-100g macros are never read for any
-- displayed number. What IS a real defect is that the mapped product is
-- the wrong item — the shopping list sends the user to buy the wrong
-- thing. Requires developer approval before uncommenting (chef skill:
-- "get explicit approval per data change"). Ingredient ids below are
-- placeholders — resolve them by running the dedupe lookup first, per
-- .claude/rules/homemade-first-and-ingredient-dedup.md.

-- --- 3a. Milk Bread (26) -> "Brioche Burger Buns" is the wrong product ---
-- Recipes 98/99/100 (French Toast) offer 'Brioche Burger Buns' as the
-- store-bought stand-in for Milk Bread (26). Wrong product: French Toast
-- needs sliceable LOAF, not buns (ratio 1.397, findings.md section 7.4).
--
-- Run this lookup first (dedupe check per the rule — search case-
-- insensitively for the name, singular/plural, and synonyms before
-- creating anything new):
--   SELECT id, `key`, name FROM ingredients
--   WHERE LOWER(name) LIKE '%brioche%' OR LOWER(name) LIKE '%milk bread%'
--      OR LOWER(name) LIKE '%loaf%';
--
-- PROPOSAL - requires developer approval before uncommenting. Replace
-- <LOAF_INGREDIENT_ID> with the id of a milk-bread/brioche LOAF ingredient
-- (create one via the dedupe workflow if none exists — singular, sentence
-- case, e.g. "Brioche loaf").
-- UPDATE recipe_ingredients SET ingredient_id = <LOAF_INGREDIENT_ID>
-- WHERE recipe_id IN (98, 99, 100) AND linked_recipe_id = 26;

-- --- 3b. Fresh Pasta (36) -> "Spaghetti (dried)"/"Lasagna Sheets" ---
-- Recipes 81/82/83 (Spaghetti Bolognese) and 65 (Pastichio) compare dried
-- pasta weight to fresh dough weight with no hydration factor (ratios
-- 1.246 / 1.232, findings.md section 7.4). 100 g dried ~= 250 g cooked, so
-- a gram-for-gram swap is wrong even as a rough store-bought equivalent —
-- either the dried quantity_grams on the store-bought path needs a
-- hydration-adjusted figure, or the mapped product needs to change to a
-- fresh/chilled pasta product that is gram-comparable to the homemade
-- dough. This needs a culinary judgement call the developer should make,
-- not a mechanical swap:
--
-- Run this lookup first:
--   SELECT id, `key`, name FROM ingredients
--   WHERE LOWER(name) LIKE '%pasta%' OR LOWER(name) LIKE '%spaghetti%'
--      OR LOWER(name) LIKE '%lasagna%';
--
-- PROPOSAL - requires developer approval before uncommenting. Two options,
-- pick one:
--   (a) keep "Spaghetti (dried)" but change the STORE-BOUGHT display
--       quantity to reflect dried weight for an equivalent cooked amount
--       (roughly quantity_grams / 2.5) — leaves ingredient_id unchanged.
--   (b) point ingredient_id at a fresh/chilled pasta product instead,
--       which is gram-comparable to the homemade dough without a
--       hydration factor.
-- Neither statement is written live pending that choice; nutrition is
-- unaffected either way (homemade-only), this is a shopping-list-only fix.


-- =====================================================================
-- SECTION 4 — PROPOSED: variant-family structure repairs
-- =====================================================================
-- Both breach .claude/rules/recipe-variants.md ("exactly three members,
-- labelled Light/Moderate/Balanced, Moderate default"). Presented as
-- commented proposals because each has more than one defensible fix and
-- picking wrong is destructive (recipe 107 disappears from the variant
-- dropdown if its family_members row is removed without another home).

-- --- 4a. Family 4 (Pizza): four members, not three ---
-- 13 Light, 14 Moderate (default), 15 Balanced, and a fourth — 107
-- "Balanced 2" at display_order 4.
--
-- PROPOSAL - requires developer approval. Options (pick one):
--   (a) DELETE FROM recipe_family_members WHERE family_id = 4 AND recipe_id = 107;
--       -- Removes 107 from the variant dropdown entirely. Recipe 107 the
--       -- row is untouched (not deleted), just no longer a family member.
--   (b) Move 107 into a new family of its own (requires 2 more sibling
--       recipes to satisfy the 3-member rule — a chef-design task, not a
--       one-line UPDATE).
--   (c) Relabel one of the existing three and swap 107 in — changes which
--       recipe the user sees under each label; likely the most disruptive
--       option.
-- No statement is written live; option (a) is the smallest and safest
-- change but still needs an explicit go-ahead since it removes a recipe
-- from the UI.
-- -- DELETE FROM recipe_family_members WHERE family_id = 4 AND recipe_id = 107;

-- --- 4b. Family 26 (Paella Valenciana): single member, NULL variant_label ---
-- Recipe 90 is the family's only member, with variant_label NULL and
-- is_default = 1. A family of one is invisible in the variant dropdown
-- (RecipeFamilyService.getVariantsForRecipe returns empty for solo
-- families) — defeating the purpose of having a family at all.
--
-- PROPOSAL - requires developer approval. This UPDATE only fixes the
-- LABEL on the existing single member; it does NOT create the two missing
-- siblings the rule actually requires (a Light and a Balanced variant of
-- Paella Valenciana still need to be designed — a `chef` engagement, out
-- of scope for this migration).
-- -- UPDATE recipe_family_members SET variant_label = 'Moderate', display_order = 2
-- -- WHERE family_id = 26 AND recipe_id = 90;


-- =====================================================================
-- NOTE (not a section — no SQL, deliberately) — the 13 "neither basis"
-- recipes: 20, 21, 22, 28, 45, 46, 87, 119, 128, 136, 137, 138, 189
-- =====================================================================
-- Per the contract brief, these get INDIVIDUAL review, not a blanket
-- rewrite or a batch of commented proposals with guessed numbers — their
-- stored `recipes.calories` matches neither the homemade basis nor the
-- store-bought basis, so no single mechanism explains the gap, and
-- fabricating a target kcal for any of them would violate this task's
-- explicit instruction that fabricating a figure is worse than leaving it
-- computed at apply time.
--
-- What IS known, from findings.md section 2 (residual analysis), for the
-- three of these thirteen with any recorded figure at all:
--   - 119 (Greek Chicken Gyros): ~83% of its gap is explained by the
--     store-bought swap, with a residual ~-40 kcal left over — a genuine
--     second error stacked on top of the store-bought-basis issue.
--   - 28 (Salmon Sandwich): has NO dual-path row at all, so the
--     store-bought-basis explanation does not apply here — this is a
--     plain wrong number, residual -66 kcal, standalone.
--   - 118 (Greek Chicken Gyros): residual 3 kcal — almost fully explained
--     by the store-bought swap, negligible leftover.
-- None of these three residuals is a computed TARGET kcal (they are gaps
-- against an unspecified baseline), so even for these three there is
-- nothing to write as a proposed UPDATE without inventing the missing
-- half of the arithmetic. The other ten (20, 21, 22, 45, 46, 87, 128, 136,
-- 137, 138, 189) have no figures recorded anywhere in this contract's
-- artifacts beyond being named as "matches neither basis" in the
-- classification in findings.md section 3.
--
-- This is intentionally deferred as a separate follow-up: once calories
-- derive at display time (already true in the running application after
-- Phases 2-3 of this contract), what the USER sees for all 48 recipes is
-- already correct regardless of what this column says — so this is
-- admin-column hygiene, not a user-facing defect, and is the one part of
-- the data work safe to defer without leaving anything broken in
-- production.
-- =====================================================================

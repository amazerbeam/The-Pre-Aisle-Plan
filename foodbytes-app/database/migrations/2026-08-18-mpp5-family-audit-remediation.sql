-- 2026-08-18-mpp5-family-audit-remediation.sql
-- MPP-5: Audit and fix all unaudited recipe families
-- Approved against findings.md and decisions.md
-- (.claude/contract/MPP-5-audit-unaudited-recipe-families/).
--
-- SCOPE
--   Ticket scope was 35 families / 106 live recipes. FIVE families were reclassified as
--   cheat meals on developer instruction (2026-08-18) -- not four, per decisions.md:
--   14 Steak & Chips, 16 Avocado Toast, 28 Tortilla Espanola, 29 French Toast, and
--   93 Chicken Carbonara (added at the Phase 2 gate -- "make it a cheat meal and double
--   the sauce and increase the bacon. It's not nice as is."). That leaves
--   30 audit families / 90 live recipes in scope for macro remediation and sign-off.
--
--   PHASES 3 THROUGH 11b ARE ALL PRESENT IN THIS FILE. Every one of the 30 audit families
--   is remediated and signed off here, across two sign-off blocks: 15 families in Phase 7
--   (already macro-clean) and 15 in Phase 10 (remediated first). Phase 12 is the
--   developer's apply-and-verify pass (tasks.md Tasks 35-40); the only Phase 12 SQL in
--   this file is the post-apply verification block at the very bottom.
--
-- WHAT THIS DOES
--   Ph3  is_cheat = 1 on families 14, 16, 28, 29, 93 (16 recipes, not 13). macros_audited
--        left at 0 on all of them -- a cheat meal must never read as signed off.
--   Ph4  Structural, non-cheat only: is_default Balanced->Moderate on 10 families, not 9 --
--        family 7 (Chicken & Vegetable Soup) is added per decisions.md even though it is
--        out of ticket scope and already attested (macros_audited stays untouched: moving
--        is_default does not touch recipe_ingredients, default_servings or calories);
--        retire member 107 (Pizza "Balanced 2"); display_order -> 1/2/3 on family 35.
--   Ph5  Macro-neutral (or near-neutral) data integrity: merge ingredient 69 (Potatoes)
--        into 121 (Potato) table-wide, including cheat recipes 47/48/49 -- and repoint
--        shopping_list_items at 121 first, because that column carries no FK and the
--        DELETE would silently orphan rather than error; recipe 212's Fresh Pasta portion
--        300g -> 280g against a 282g linked yield (an impossible-data fix, not a macro
--        finding -- family 93 is a cheat meal so this carries NO macros_audited sign-off,
--        per decisions.md Decision 7); drop the " - Diet" name suffix on recipes
--        188/194/195 (lens-5 reject).
--   Ph6  Lens 3 / lens 4 prose pass on the 19 already-macro-clean families, 57 recipes
--        (Tasks 15-18): per-recipe wipe-and-re-insert of recipe_steps, carrying every
--        linked_recipe_id, alt_instruction and tip through verbatim.
--   Ph7  macros_audited = 1 on 15 of those 19 families (Task 19). 15, not 19 -- families
--        95, 96, 105 and 106 have their composition changed later in this file, so they
--        are signed off with the remediated set in Phase 10 instead, not here.
--   Ph8  Macro remediation, low-risk tier (Tasks 20, 21, 22; Task 23 VOID): family 23's
--        calories column only, family 22's stew (incl. decisions.md Sec.10 -- the step 0
--        chef note moved to recipe_steps.tip and steps renumbered 1-10), family 4's Pizza
--        Light carbs.
--   Ph9  Macro remediation, heavy tier (Tasks 24-30): families 1, 5, 9, 10, 35, 42, 43 and
--        8. Family 8 gains a Light created from nothing -- inserted with an EXPLICIT
--        recipes.id of 269, guarded, and followed by a MANDATORY member-count check.
--        Family 1 is REWORKED AND RENAMED to 'Peanut Butter Porridge with Berries &
--        Walnuts' (developer, 2026-08-19). This supersedes an earlier 530/570/620 g Greek
--        yogurt fix in this same file, which was unbuyable against a 500 g tub AND left the
--        family a near-clone of Protein Porridge (187/192/193). Whey isolate 30/40/50 g now
--        carries the protein, yogurt drops to 160/180/200 g, peanut butter rises to
--        22/31/40 g as the dish identity, and the almonds are removed. Second rename in
--        this file after family 105's, on the same agreed exception to plan.md's
--        no-renaming boundary.
--   Ph9b The decisions.md work that tasks.md has no task number for: family 96 (yogurt
--        rebalanced with whey protein isolate added -- Decision 5 as revised 2026-08-19;
--        family 95 is reverted to live and changes nothing), family 106 (mayonnaise FR-103
--        dual-path + linked prep step, vinegar in the slaw, patty rest -- Decision 6), and
--        family 105's full rework to a pita-based burger (drop the ham and the brioche bun,
--        link the patty to recipe 43, add pita as an FR-103 dual-path row, and rename the
--        family and all three recipes -- Decision 1, an agreed exception to plan.md's
--        no-renaming boundary). Family 43's Mediterranean additions (Decision 8) land with
--        Task 29 in Phase 9.
--   Ph10 Prose pass over the 11 families remediated in Phases 8 and 9 (Task 31 -- 95, 96,
--        105 and 106 had theirs in Phase 6 / 9b), then the second sign-off block:
--        macros_audited = 1 on all 15 (Task 32). 15 + Phase 7's 15 = the 30 in scope.
--   Ph11 Developer-requested changes to already-audited families: Pad Thai (Task 33 --
--        NOTE ONLY as of 2026-08-19. The prawn + fish sauce removal that decisions.md Sec.2
--        called for is REVERTED: the dish ships exactly as it is live, and the prawn-free
--        chicken swap is offered to the cook in a recipe_steps.tip instead. No ingredient,
--        calories or macros_audited write) and Chicken Burrito Bowl jalapenos (Task 34).
--   Ph11b Family 93's sauce doubled (egg and Parmesan together) and pancetta raised, per
--        decisions.md Sec.7. NOT an audit and produces no sign-off -- it supersedes the
--        Phase 5 calories value on recipe 212, deliberately and by file order.
--
--   UNIT REALISM (former Task 14) IS VOID -- dropped to MPP-6 (Standardise ingredient
--   display units) per decisions.md. Zero unit-only rows are touched by this file.
--
-- WHY IT IS LOSSLESS
--   No DDL. No hard deletes of recipes: member 107 is soft-deleted via is_live = 0 because
--   meal_plan_entries may reference it and a hard delete would drop plan history.
--   Ingredient merge 69 -> 121 is macro-neutral: identical per-100g values
--   (P 2.00 / C 17.00 / F 0.10) per findings.md. 69 had 5 uses, 121 had 19. The only row
--   ever deleted from a reference table is ingredient 69, and every column that can point
--   at it -- recipe_ingredients.ingredient_id (FK) and shopping_list_items.ingredient_id
--   (no FK) -- is repointed at 121 immediately beforehand.
--   The prose passes DELETE from recipe_steps, always scoped to one recipe_id and always
--   immediately followed by a full re-insert of that recipe's steps, because the
--   (recipe_id, step_number) unique key makes mid-sequence renumbering collide. Every
--   linked_recipe_id, alt_instruction and tip on a wiped step is carried through verbatim
--   in the re-insert -- dropping one is a hard reject under
--   .claude/rules/linked-recipe-extras.md. No recipe_steps row is deleted without a
--   replacement in the same block.
--
-- KNOWN, ACCEPTED EXCEPTIONS
--   Cheat families skip structural fixes by developer instruction, so family 28 keeps
--   4 members incl. an "Extra Light" label and family 29 keeps Moderate at display_order 1.
--   Both are hard rejects under .claude/rules/recipe-variants.md and will persist.
--   Family 7 moves from an illegal state (default on Balanced) to a legal one (default on
--   Moderate) without its attestation being cleared/re-set -- decisions.md Decision 4
--   confirms this is intentional: recipe_family_members is not recipe_ingredients, and no
--   macro moves when only the default flag changes.
--   Family 105 lands at 23.3 % fat on all three variants, under the 25 % chef floor. Not a
--   reject (the reject is ABOVE 35 %) and structural -- the linked patty is 3.7 g fat/100 g
--   and the pita 9.76, so no portion ratio moves the composite. decisions.md rules "leave
--   it"; the cheese/pickle remedy sits in the step tip, which costs no macros. Precedent:
--   families 9 (23.3 %) and 107 (21.4 %) in findings.md.
--   Family 96 takes yogurt DOWN on Balanced only (450 -> 350 g per serving) and adds whey
--   protein isolate (existing ingredient 163) across all three variants. This SUPERSEDES an
--   earlier revision of this file that cut the yogurt on all three and raised the granola to
--   backfill kcal; decisions.md's follow-up ruling "keep the partial cut" is void. The
--   original finding was wrong twice -- a standard yogurt tub is 500 g, not the "large" tub
--   it claimed, and 450 g/serving applied to Balanced alone, not the family -- and the cut
--   it prompted cost Balanced 11.7 g of protein per serving. Whey supplies protein at
--   almost no fat or carb cost, so protein now RISES to 40.2 / 46.2 / 55.3 g/serving while
--   the outlier portion still goes away. Full reasoning at the Phase 9b block.
--   Family 95 is REVERTED to its live composition and writes nothing at all: findings.md
--   accepted its portions outright and it passes every reject condition unchanged. It is
--   still signed off in Task 32.
--
-- IDEMPOTENCY
--   Every statement is safe to re-run. recipe_ingredients has no unique index on
--   (recipe_id, ingredient_id) or (recipe_id, linked_recipe_id) -- verified live
--   2026-08-18 against information_schema.STATISTICS -- so every INSERT into it is written
--   as INSERT ... SELECT ... WHERE NOT EXISTS with <=> NULL-safe equality on BOTH id
--   columns, required because exactly one of them is NULL on an ordinary row and neither is
--   on an FR-103 dual-path row. recipe_steps rewrites use wipe-and-re-insert (see above),
--   with each re-insert guarded on the (recipe_id, step_number) natural key. The new
--   family 8 Light is inserted with an explicit id and is guarded on both the id being free
--   AND family 8 having no Light, so a re-run -- or an id collision -- is a no-op rather
--   than a corruption. Plain UPDATEs are naturally idempotent.
--   Do NOT rely on START TRANSACTION: the Railway console commits per statement.
--
-- HOW THE FIGURES WERE DERIVED
--   Phases 3-5 were written while the live DB was unreachable, so their figures come from
--   findings.md's already-recorded live-query results. From Phase 6 onward every macro
--   figure was RECOMPUTED FROM THE LIVE ROWS on 2026-08-18 -- raw ingredients
--   (quantity_grams x per-100g) plus linked recipes prorated by
--   (parent quantity_grams / linked total yield), kcal by Atwater 4P + 4C + 9F -- and the
--   recompute was validated against findings.md's published baselines before any fix was
--   designed (families 23 and 4 reproduced exactly). Where a findings.md fix table is
--   reused, it is because this run re-derived the same numbers, not because it was trusted
--   on sight. Corrections found against live data are listed in decisions.md.
--
-- APPLY: manually, by the developer, against the live Railway MySQL.
--   DML-only, so unlike a schema migration this carries no ddl-auto:validate startup risk.
--   UTF-8: from Phase 6 onward the step text contains the degree sign (200°C, 74°C),
--   matching what is already stored. The Railway console is fine; a CLI client needs
--   --default-character-set=utf8mb4.
--   RUN THE PRE-FLIGHT FIRST: SELECT COUNT(*) FROM recipes WHERE id = 269; -- must be 0.
--   Do not reorder statements. Two later statements deliberately supersede earlier ones
--   (recipe 212's calories, Phase 11b over Phase 5), and re-running an earlier section
--   after a later one regresses them -- the verification block at the bottom catches it.

-- =====================================================================================
-- PHASE 3 -- Cheat reclassification
-- =====================================================================================

-- Task 7: mark the five nominated families as cheat meals.
-- DB confirm step skipped (connection down) -- confirmed via findings.md headline numbers
-- and decisions.md instead: all 16 recipes below are is_cheat = 0, macros_audited = 0
-- pre-apply. Developer instruction 2026-08-18 -- resolves AC-7 without deleting anything:
-- meal-plan history is preserved and no dish is mangled to hit a number. These families are
-- exempt from the macro audit AND from structural fixes. Family 93 (Chicken Carbonara) is
-- the fifth family, added at the Phase 2 gate (decisions.md Decision 7) -- NOT in the
-- original four-family list tasks.md still shows.
UPDATE recipes SET is_cheat = 1 WHERE id IN (47,48,49,          -- fam 14 Steak & Chips
                                             53,54,55,          -- fam 16 Avocado Toast
                                             94,95,96,97,       -- fam 28 Tortilla Espanola
                                             98,99,100,         -- fam 29 French Toast
                                             210,211,212);      -- fam 93 Chicken Carbonara
-- macros_audited is deliberately left at 0 on all 16 -- a cheat meal is not audited and
-- must not read as signed off.

-- =====================================================================================
-- PHASE 4 -- Structural fixes on non-cheat families
-- =====================================================================================

-- Task 8: move is_default from Balanced to Moderate on the 10 non-cheat families.
-- 10, not 9 -- decisions.md Decision 4 adds family 7 (Chicken & Vegetable Soup), already
-- attested (macros_audited = 1, macros_audited_at = 2026-07-30) and out of ticket scope,
-- but carrying the same is_default-on-Balanced structural reject (findings.md divergence
-- 1). Developer chose to move the default WITHOUT clearing/re-setting the attestation:
-- recipe_family_members is not recipe_ingredients, default_servings or calories, and no
-- macro moves when the default flag changes -- so macros_audited on 23/24/25 is
-- deliberately NOT touched by this statement. No macros_audited UPDATE is written for
-- 23/24/25 anywhere in this file.
-- Families 14, 16, 28, 29, 93 are absent -- they are cheat and exempt from structural fixes.
UPDATE recipe_family_members SET is_default = 0
WHERE family_id IN (1,5,7,8,9,10,12,22,35,37);

UPDATE recipe_family_members SET is_default = 1
WHERE family_id IN (1,5,7,8,9,10,12,22,35,37) AND variant_label = 'Moderate';

-- Task 9: retire the Pizza "Balanced 2" member (recipe 107) -- family 4's illegal 4th
-- member. Recipe 94 (Tortilla "Extra Light") is NOT retired -- family 28 is cheat and
-- exempt from structural fixes.
-- Soft-delete only, never DELETE FROM recipes -- meal_plan_entries may reference 107 and a
-- hard delete would drop plan history.
UPDATE recipes SET is_live = 0 WHERE id = 107;
DELETE FROM recipe_family_members WHERE recipe_id = 107;

-- Task 10: correct display_order on family 35 (Greek Chicken Gyros) to 1=Light/2=Moderate/
-- 3=Balanced. Families 28 and 29 also have wrong ordering but are cheat and keep their
-- current (wrong) ordering by developer instruction.
UPDATE recipe_family_members
SET display_order = CASE variant_label
      WHEN 'Light' THEN 1 WHEN 'Moderate' THEN 2 WHEN 'Balanced' THEN 3 END
WHERE family_id = 35 AND variant_label IN ('Light','Moderate','Balanced');

-- =====================================================================================
-- PHASE 5 -- Macro-neutral data integrity and the lens-5 name fix
-- =====================================================================================

-- Task 11: ingredient dedup -- 'Potatoes' (69) -> 'Potato' (121). Singular sentence case
-- is the convention. Macro-neutral: identical per-100g values confirmed in findings.md
-- (both P 2.00 / C 17.00 / F 0.10, verified 2026-08-18). Applies table-wide, including
-- cheat recipes 47/48/49 -- dedup is a table rule, not audit-scoped.
UPDATE recipe_ingredients SET ingredient_id = 121 WHERE ingredient_id = 69;

-- MUST run before the DELETE below. shopping_list_items.ingredient_id references
-- ingredients.id but carries NO foreign key constraint (verified live 2026-08-18 against
-- information_schema: recipe_ingredients.ingredient_id is the ONLY formal FK to
-- ingredients). Without a FK, the DELETE cannot fail on a dangling reference -- it silently
-- orphans any shopping_list_items row still pointing at 69, and whatever joins those rows
-- back to ingredients then drops the row or NPEs.
-- Why it is needed even though the count is currently zero: ingredient 69 stays live and
-- orderable in the app right up until this file is applied, so a shopping list generated in
-- the window between verification and the developer's manual apply would strand a row.
-- Verified live 2026-08-18: 0 rows currently reference 69. This statement is a no-op in that
-- case and is safe to re-run. shopping_list_items.ingredient_name (a denormalised text
-- column) is deliberately NOT rewritten -- see the note below.
UPDATE shopping_list_items SET ingredient_id = 121 WHERE ingredient_id = 69;
-- ingredient_name is left as-is on purpose. It is a point-in-time snapshot of what the user
-- put on their list, not a foreign key, and rewriting 'Potatoes' -> 'Potato' would edit the
-- text of a list a user is mid-shop on for no functional gain: nothing joins on it, and the
-- 69 -> 121 repoint above already fixes the only column that can dangle. Any list generated
-- after this file is applied picks the canonical 'Potato' name up from ingredients (121)
-- automatically.

DELETE FROM ingredients WHERE id = 69;

-- Task 12: recipe 212 (Chicken Carbonara, Balanced -- now a cheat meal per Phase 3) linked
-- 300g of Fresh Pasta against a 282g yield -- an impossible-data reject per
-- .claude/rules/linked-recipe-extras.md, NOT a macro finding, so family 93's cheat
-- exemption does not cover it (decisions.md Decision 7). Reduce the PARENT portion only;
-- Fresh Pasta (36) itself is an extra and stays untouched ("don't audit extras").
-- No macros_audited write here -- family 93 left the audit in Phase 3 and gets no sign-off,
-- per decisions.md ("Do not write the macros_audited = 1 sign-off that the old task text
-- implies").
UPDATE recipe_ingredients SET quantity = 280.00, quantity_grams = 280.00
WHERE recipe_id = 212
  AND linked_recipe_id = (SELECT id FROM recipes WHERE name = 'Fresh Pasta' LIMIT 1);

-- Recomputed whole-recipe kcal per findings.md (down from 1481). DB unreachable this run,
-- so this figure is taken directly from findings.md's already-computed live-query result
-- (divergence 6 and the "quantity_grams over linked yield" section), not re-derived here.
UPDATE recipes SET calories = 1425 WHERE id = 212;

-- Step 1's instruction referenced the old "scale up 1.1x to yield 300g" language, which is
-- no longer true at 280g. Rewritten to match the corrected portion (280g dough, 140g per
-- person on 2 servings). Plain UPDATE of instruction text only -- tip / linked_recipe_id /
-- alt_instruction on this row are left exactly as they were.
UPDATE recipe_steps
SET instruction = 'Prepare the fresh pasta according to the linked recipe. Use 280g of dough (~140g per person).'
WHERE recipe_id = 212 AND step_number = 1;

-- Task 13: lens-5 reject -- a variant suffix on recipes.name. The dish name is the family
-- name; the variant lives in recipe_family_members.variant_label. Family 87's
-- family_name is already 'Greek Chicken Gyros Bowl', so this rename aligns the two rather
-- than breaking alignment.
UPDATE recipes SET name = 'Greek Chicken Gyros Bowl' WHERE id IN (188, 194, 195);

-- =====================================================================================
-- PHASE 6 -- Lens 3 / lens 4 prose pass on the macro-clean families
-- =====================================================================================
--
-- ENCODING: from this point the file is UTF-8, not ASCII -- the carried-through step text
-- contains the degree sign (200°C, 74°C). That matches what is already stored on the
-- sibling recipes, so it is preserved rather than downgraded. Apply this file as UTF-8
-- (the Railway console is fine; a CLI client needs --default-character-set=utf8mb4).
--
-- METHOD: per-recipe wipe-and-re-insert. DELETE is always scoped to a single recipe_id,
-- never a range, and every INSERT is guarded on the (recipe_id, step_number) natural key
-- so a re-run is a no-op. No cascading UPDATE of step_number -- that unique key collides.
-- linked_recipe_id and alt_instruction are carried through verbatim on every step that
-- had them (recipes 226-234 step 1 -> Milk Bread 26; recipes 232-234 step 4 -> Honey Ham
-- 64). Dropping either is a hard reject under .claude/rules/linked-recipe-extras.md.
--
-- WHERE THE FIX LANDS -- instruction vs tip. A lens-4 finding whose fix needs an
-- ingredient that is NOT on the recipe (lemon, chives, rocket, a green side) is written
-- into recipe_steps.tip, not the instruction. The instruction stays cookable from the
-- ingredient list alone, the shopping list stays correct, and the macros do not move --
-- which is what lets these families keep a "no macro change" sign-off in Phase 7.
-- Technique and order-of-operations fixes go into instruction, where they belong.
--
-- FAMILIES DELIBERATELY NOT TOUCHED HERE
--   93  (210-212) cheat meal -- decisions.md Decision 7. Never audited, never signed off.
--   105 (247-249) full rework to a pita dish + rename -- decisions.md Decision 1.
--   106 (250-252) mayonnaise dual-path + vinegar + patty rest -- decisions.md Decision 6.
--   96  (220-222) -- decisions.md Decision 5, as revised 2026-08-19: whey protein isolate
--        added and the Balanced yogurt cut. The step text names the amounts, so rewriting
--        its prose here would describe a superseded composition -- exactly the reason 105
--        and 106 are deferred -- and the new whey step has to be written against the final
--        ingredient list. It moves to the remediated-family prose pass and sign-off
--        (Tasks 31/32) instead. A deviation from tasks.md Phase 6/7, which predates
--        Decision 5; see the Implementer Report.
--   95  (217-219) -- deferred here for the same reason when Decision 5 still applied to it.
--        That cut is now REVERTED and the family changes in no way, so the deferral is moot:
--        its steps quote no gram weights and findings.md returned "Nothing to fix" on both
--        lens 3 and lens 4. Left untouched throughout, and signed off in Task 32.
--
--   Families 94 (214-216), 97 (223-225), 102 (238-240), 104 (244-246) and 11 (37-39) had
--   NO lens-3 or lens-4 finding in findings.md ("Nothing to fix" / "Proposed fix: None"),
--   so their steps are left exactly as they are. They are still signed off in Phase 7 --
--   the pass ran, it just found nothing to change.

-- -------------------------------------------------------------------------------------
-- Task 15 -- breakfast families 94-100 (recipes 214-234)
-- 94 and 97: no finding, untouched. 95 and 96: deferred (see above). 98, 99, 100 below.
-- -------------------------------------------------------------------------------------

-- Family 98 (Soft-Boiled Eggs, Cottage Cheese & Toast) -- recipes 226/227/228.
-- findings.md lens 4: "There is no acid" and the colour is thin. The macro-safe half of
-- that fix -- season and taste the cottage cheese itself instead of scattering salt over
-- the finished plate -- goes into the instruction; lemon and dill go into the tip, since
-- neither is on the ingredient list. Lens 3 was already clean: the ice bath and the 6/7
-- minute choice are preserved, and the reason for the ice bath is now given to the cook.

DELETE FROM recipe_steps WHERE recipe_id = 226;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 226, 1, 'Toast the bread according to the linked recipe. Use 220g (4-5 slices @ 50g each).', NULL, 26, 'Toast 4-5 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 226 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 226, 2, 'Bring a pan of water to a gentle boil. Lower the eggs in on a spoon and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer). Start the timer the moment the last egg is in.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 226 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 226, 3, 'Transfer the eggs straight into a bowl of iced water for 1 minute to stop the cooking, then peel -- the cold shock is also what makes them peel cleanly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 226 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 226, 4, 'Season the cottage cheese with a small pinch of the salt and half the black pepper, stir, and taste it before it goes anywhere -- unseasoned cottage cheese reads milky and flat. Spread it thickly over the toast.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 226 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 226, 5, 'Halve the eggs and arrange them over the cottage cheese. Scatter with the spring onions and the remaining pepper, and serve immediately while the toast is still crisp.', 'This plate has no acid and it wants one: a squeeze of lemon or a few drops of vinegar over the cottage cheese sharpens the whole thing, and chives or dill alongside the spring onion give it the green it is missing. Neither is in the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 226 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 227;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 227, 1, 'Toast the bread according to the linked recipe. Use 300g (6 slices @ 50g each).', NULL, 26, 'Toast 6 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 227 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 227, 2, 'Bring a pan of water to a gentle boil. Lower the eggs in on a spoon and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer). Start the timer the moment the last egg is in.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 227 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 227, 3, 'Transfer the eggs straight into a bowl of iced water for 1 minute to stop the cooking, then peel -- the cold shock is also what makes them peel cleanly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 227 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 227, 4, 'Season the cottage cheese with a small pinch of the salt and half the black pepper, stir, and taste it before it goes anywhere -- unseasoned cottage cheese reads milky and flat. Spread it thickly over the toast.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 227 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 227, 5, 'Halve the eggs and arrange them over the cottage cheese. Scatter with the spring onions and the remaining pepper, and serve immediately while the toast is still crisp.', 'This plate has no acid and it wants one: a squeeze of lemon or a few drops of vinegar over the cottage cheese sharpens the whole thing, and chives or dill alongside the spring onion give it the green it is missing. Neither is in the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 227 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 228;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 228, 1, 'Toast the bread according to the linked recipe. Use 380g (7-8 slices @ 50g each).', NULL, 26, 'Toast 7-8 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 228 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 228, 2, 'Bring a pan of water to a gentle boil. Lower the eggs in on a spoon and boil 6 minutes for a soft, jammy yolk (7 minutes for firmer). Start the timer the moment the last egg is in.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 228 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 228, 3, 'Transfer the eggs straight into a bowl of iced water for 1 minute to stop the cooking, then peel -- the cold shock is also what makes them peel cleanly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 228 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 228, 4, 'Season the cottage cheese with a small pinch of the salt and half the black pepper, stir, and taste it before it goes anywhere -- unseasoned cottage cheese reads milky and flat. Spread it thickly over the toast.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 228 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 228, 5, 'Halve the eggs and arrange them over the cottage cheese. Scatter with the spring onions and the remaining pepper, and serve immediately while the toast is still crisp.', 'This plate has no acid and it wants one: a squeeze of lemon or a few drops of vinegar over the cottage cheese sharpens the whole thing, and chives or dill alongside the spring onion give it the green it is missing. Neither is in the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 228 AND step_number = 5);

-- Family 99 (Fried Eggs with Halloumi & Toast) -- recipes 229/230/231.
-- findings.md lens 4: "This plate is very salty and has no counterpoint", and step 5 then
-- instructed more salt on top of two cured components. Instruction fix: taste before
-- salting, and keep the pinch for the eggs. Lemon and a green go into the tip (not on the
-- ingredient list). Lens 3 was sound and is preserved, including the dry-pan halloumi on
-- 231 (which carries no olive oil row) and the oiled pan on 229/230 (which do), plus the
-- eggs cooking in the rendered halloumi fat.

DELETE FROM recipe_steps WHERE recipe_id = 229;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 229, 1, 'Toast the bread according to the linked recipe. Use 230g (4-5 slices @ 50g each).', NULL, 26, 'Toast 4-5 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 229 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 229, 2, 'Slice the halloumi into ~1cm slabs and pat them completely dry -- wet halloumi steams instead of browning. Heat the olive oil in a non-stick pan over medium-high heat and fry the halloumi 1-2 minutes per side, until golden and crisp at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 229 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 229, 3, 'Push the halloumi to one side of the pan and crack in the eggs. Fry 2-3 minutes in the rendered halloumi fat, until the whites are set and crisp at the edges but the yolks are still runny.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 229 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 229, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 229 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 229, 5, 'Plate the toast with the halloumi, ham and fried eggs, and grind the black pepper over. Taste before you reach for the salt -- halloumi and ham are both cured, so the plate is usually salty enough already; keep the pinch of salt for the eggs alone if they need it. Serve immediately.', 'Salty and rich, with nothing cutting it. A lemon wedge squeezed over the halloumi is the standard fix, and a handful of rocket or a sliced tomato gives the plate the green and red it otherwise has none of. Neither is in the ingredient list, and neither costs meaningful calories.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 229 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 230;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 230, 1, 'Toast the bread according to the linked recipe. Use 300g (6 slices @ 50g each).', NULL, 26, 'Toast 6 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 230 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 230, 2, 'Slice the halloumi into ~1cm slabs and pat them completely dry -- wet halloumi steams instead of browning. Heat the olive oil in a non-stick pan over medium-high heat and fry the halloumi 1-2 minutes per side, until golden and crisp at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 230 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 230, 3, 'Push the halloumi to one side of the pan and crack in the eggs. Fry 2-3 minutes in the rendered halloumi fat, until the whites are set and crisp at the edges but the yolks are still runny.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 230 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 230, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 230 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 230, 5, 'Plate the toast with the halloumi, ham and fried eggs, and grind the black pepper over. Taste before you reach for the salt -- halloumi and ham are both cured, so the plate is usually salty enough already; keep the pinch of salt for the eggs alone if they need it. Serve immediately.', 'Salty and rich, with nothing cutting it. A lemon wedge squeezed over the halloumi is the standard fix, and a handful of rocket or a sliced tomato gives the plate the green and red it otherwise has none of. Neither is in the ingredient list, and neither costs meaningful calories.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 230 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 231;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 231, 1, 'Toast the bread according to the linked recipe. Use 340g (7 slices @ 50g each).', NULL, 26, 'Toast 7 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 231 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 231, 2, 'Slice the halloumi into ~1cm slabs and pat them completely dry -- wet halloumi steams instead of browning. Fry in a dry non-stick pan over medium-high heat (halloumi releases its own fat, so no added oil is needed) 1-2 minutes per side, until golden and crisp at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 231 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 231, 3, 'Push the halloumi to one side of the pan and crack in the eggs. Fry 2-3 minutes in the rendered halloumi fat, until the whites are set and crisp at the edges but the yolks are still runny.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 231 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 231, 4, 'Warm the sliced ham in the same pan for 30 seconds per side.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 231 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 231, 5, 'Plate the toast with the halloumi, ham and fried eggs, and grind the black pepper over. Taste before you reach for the salt -- halloumi and ham are both cured, so the plate is usually salty enough already; keep the pinch of salt for the eggs alone if they need it. Serve immediately.', 'Salty and rich, with nothing cutting it. A lemon wedge squeezed over the halloumi is the standard fix, and a handful of rocket or a sliced tomato gives the plate the green and red it otherwise has none of. Neither is in the ingredient list, and neither costs meaningful calories.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 231 AND step_number = 5);

-- Family 100 (Cheese & Ham Omelette with Toast) -- recipes 232/233/234.
-- findings.md lens 3: step 2 said "Whisk the eggs off the heat", which is confusing --
-- the eggs are in a bowl and were never on heat. Rewritten to the wording findings.md
-- proposed, plus the reason to stop whisking early. Lens 4 (no green, nothing sharp):
-- chives go into the tip, not the ingredient list. The French soft-curd method in step 3
-- and both linked rows (Milk Bread 26 on step 1, Honey Ham 64 on step 4, with their
-- alt_instruction text) are carried through verbatim. Step 5 now names the residual-heat
-- melt that the method was already relying on.

DELETE FROM recipe_steps WHERE recipe_id = 232;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 232, 1, 'Toast the bread according to the linked recipe. Use 240g (4-5 slices @ 50g each).', NULL, 26, 'Toast 4-5 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 232 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 232, 2, 'Whisk the eggs in a bowl with a pinch of the salt and pepper until just combined -- stop as soon as the yolks and whites are one colour, because over-whisking makes a rubbery omelette.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 232 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 232, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 232 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 232, 4, 'Scatter the cheddar and 170g of the linked Honey Ham over one half.', NULL, 64, 'Scatter the cheddar and 170g of store-bought sliced ham over one half.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 232 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 232, 5, 'Fold the omelette over the filling and leave it in the pan off the heat for 20 seconds, so the cheddar melts in the residual heat rather than cooking. Slide onto the toast and serve immediately.', 'Nothing green and nothing sharp on this plate. A tablespoon of chopped chives whisked into the eggs and a hard grind of pepper at the table fix both the colour and the flatness -- neither is in the ingredient list, and neither moves the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 232 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 233;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 233, 1, 'Toast the bread according to the linked recipe. Use 320g (6-7 slices @ 50g each).', NULL, 26, 'Toast 6-7 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 233 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 233, 2, 'Whisk the eggs in a bowl with a pinch of the salt and pepper until just combined -- stop as soon as the yolks and whites are one colour, because over-whisking makes a rubbery omelette.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 233 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 233, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 233 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 233, 4, 'Scatter the cheddar and 100g of the linked Honey Ham over one half.', NULL, 64, 'Scatter the cheddar and 100g of store-bought sliced ham over one half.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 233 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 233, 5, 'Fold the omelette over the filling and leave it in the pan off the heat for 20 seconds, so the cheddar melts in the residual heat rather than cooking. Slide onto the toast and serve immediately.', 'Nothing green and nothing sharp on this plate. A tablespoon of chopped chives whisked into the eggs and a hard grind of pepper at the table fix both the colour and the flatness -- neither is in the ingredient list, and neither moves the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 233 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 234;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 234, 1, 'Toast the bread according to the linked recipe. Use 380g (7-8 slices @ 50g each).', NULL, 26, 'Toast 7-8 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 234 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 234, 2, 'Whisk the eggs in a bowl with a pinch of the salt and pepper until just combined -- stop as soon as the yolks and whites are one colour, because over-whisking makes a rubbery omelette.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 234 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 234, 3, 'Melt a little butter in a non-stick pan over medium-low heat. Pour in the eggs and let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy (French-style soft curd).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 234 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 234, 4, 'Scatter the cheddar and 130g of the linked Honey Ham over one half.', NULL, 64, 'Scatter the cheddar and 130g of store-bought sliced ham over one half.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 234 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 234, 5, 'Fold the omelette over the filling and leave it in the pan off the heat for 20 seconds, so the cheddar melts in the residual heat rather than cooking. Slide onto the toast and serve immediately.', 'Nothing green and nothing sharp on this plate. A tablespoon of chopped chives whisked into the eggs and a hard grind of pepper at the table fix both the colour and the flatness -- neither is in the ingredient list, and neither moves the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 234 AND step_number = 5);

-- -------------------------------------------------------------------------------------
-- Task 16 -- fish and roast-protein families 101-103 (recipes 235-243)
-- 102 (238-240) had no finding and is untouched. 101 and 103 had a lens-4 finding only,
-- and in both cases the fix needs an ingredient the recipe does not carry (a green side;
-- lemon). Those go into recipe_steps.tip. No instruction changed, no step was added,
-- removed or renumbered, so these are targeted single-column UPDATEs rather than a
-- wipe-and-re-insert: the wipe pattern exists to avoid (recipe_id, step_number) unique-key
-- collisions during renumbering, and there is no renumbering here. Re-typing five correct
-- instructions verbatim to change one NULL would only add transcription risk.
-- Same idempotency property: re-running these UPDATEs is a no-op.
-- -------------------------------------------------------------------------------------

-- Family 101 (Baked Cod with Lemon, Herbs & New Potatoes) -- recipes 235/236/237.
-- findings.md: "the best-sequenced recipe in the audit" -- lens 3 clean, nothing to fix.
-- Lens 4: "The one thing it lacks is a green vegetable, which is a serving-suggestion gap
-- rather than a defect." Recorded as a serving suggestion on the final step.
UPDATE recipe_steps
SET tip = 'The tray has no green vegetable. Steamed or blanched greens alongside -- tenderstem broccoli, green beans, peas -- finish the plate for almost nothing. They are not in the ingredient list, so they are not counted in the macros for this recipe.'
WHERE recipe_id IN (235, 236, 237) AND step_number = 5;

-- Family 103 (Herb-Roasted Chicken Breast with Sweet Potato & Greens) -- 241/242/243.
-- findings.md lens 3: the rest-and-return-the-juices step is called out as a model and is
-- left exactly as it is. Lens 4: "There is no acid -- a squeeze of lemon over the finished
-- tray would sharpen the whole thing and costs nothing." No lemon row on the recipe, so
-- this lands as a tip on the resting/serving step.
UPDATE recipe_steps
SET tip = 'There is no acid on this tray and it flattens the whole thing. A squeeze of lemon over the sliced chicken and vegetables at the finish sharpens the rosemary and the caramelised sweet potato. Lemon is not in the ingredient list and costs nothing worth counting.'
WHERE recipe_id IN (241, 242, 243) AND step_number = 5;

-- -------------------------------------------------------------------------------------
-- Task 17 -- pasta, meatball and burger families 104-108 (recipes 244-258)
-- 104 (244-246): no finding, untouched. 105 (247-249) and 106 (250-252): deferred to
-- their own rework, per decisions.md Decisions 1 and 6 -- NOT touched here. 107 and 108
-- below.
-- -------------------------------------------------------------------------------------

-- Family 107 (Turkey Meatballs in Tomato Sauce with Spaghetti) -- recipes 253/254/255.
-- findings.md: technique already good ("the same well-built method as family 104"), so
-- the rewrite preserves the do-not-overwork warning, the 74°C endpoint with its stated
-- reason, the reserved pasta water and the taste-and-adjust. Added: turn the meatballs
-- only once they release, do not colour the garlic, deglaze the fond into the passata,
-- return the resting juices from the plate, and use the reserved water as an actual
-- emulsifier rather than an optional loosener. The lens-4 finding (21-22% fat reads dry
-- next to the beef sibling) is "recommended, not required" and would move macros, so it
-- lands in the tip -- the family keeps its no-macro-change sign-off.

DELETE FROM recipe_steps WHERE recipe_id = 253;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, the oregano, salt and pepper. Mix gently with a fork and shape into ~10 meatballs -- do not overwork the mixture or they will turn dense.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, turning each only once it releases from the pan cleanly. Remove to a plate -- they are browned, not cooked through, and will finish in the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 3, 'Turn the heat down to medium, add the remaining olive oil and the garlic, and cook 30 seconds until fragrant -- do not let the garlic colour or it turns bitter. Pour in the tomato passata and scrape the browned bits off the base of the pan into it, then bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 4, 'Return the meatballs and any juices collected on the plate to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 5, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 253, 6, 'Toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until the sauce coats every strand and looks glossy rather than watery. Taste and adjust the salt and pepper, then scatter with the parmesan and torn basil off the heat and serve.', 'Turkey mince at 2% fat leaves very little fat in the sauce, so it can read leaner and drier than the beef version of this dish no matter how well it is cooked. A teaspoon of olive oil stirred through at the very end, or holding back some of the parmesan to grate at the table, buys the mouthfeel back for almost nothing.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 253 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 254;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, the oregano, salt and pepper. Mix gently with a fork and shape into ~12 meatballs -- do not overwork the mixture or they will turn dense.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, turning each only once it releases from the pan cleanly. Remove to a plate -- they are browned, not cooked through, and will finish in the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 3, 'Turn the heat down to medium, add the remaining olive oil and the garlic, and cook 30 seconds until fragrant -- do not let the garlic colour or it turns bitter. Pour in the tomato passata and scrape the browned bits off the base of the pan into it, then bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 4, 'Return the meatballs and any juices collected on the plate to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 5, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 254, 6, 'Toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until the sauce coats every strand and looks glossy rather than watery. Taste and adjust the salt and pepper, then scatter with the parmesan and torn basil off the heat and serve.', 'Turkey mince at 2% fat leaves very little fat in the sauce, so it can read leaner and drier than the beef version of this dish no matter how well it is cooked. A teaspoon of olive oil stirred through at the very end, or holding back some of the parmesan to grate at the table, buys the mouthfeel back for almost nothing.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 254 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 255;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, half the garlic, the oregano, salt and pepper. Mix gently with a fork and shape into ~14 meatballs -- do not overwork the mixture or they will turn dense.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 2, 'Heat half the olive oil in a large pan over medium-high heat. Brown the meatballs on all sides, 5-6 minutes, turning each only once it releases from the pan cleanly. Remove to a plate -- they are browned, not cooked through, and will finish in the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 3, 'Turn the heat down to medium, add the remaining olive oil and the garlic, and cook 30 seconds until fragrant -- do not let the garlic colour or it turns bitter. Pour in the tomato passata and scrape the browned bits off the base of the pan into it, then bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 4, 'Return the meatballs and any juices collected on the plate to the sauce, cover, and simmer 15 minutes until they reach 74°C (165°F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 5, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 255, 6, 'Toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until the sauce coats every strand and looks glossy rather than watery. Taste and adjust the salt and pepper, then scatter with the parmesan and torn basil off the heat and serve.', 'Turkey mince at 2% fat leaves very little fat in the sauce, so it can read leaner and drier than the beef version of this dish no matter how well it is cooked. A teaspoon of olive oil stirred through at the very end, or holding back some of the parmesan to grate at the table, buys the mouthfeel back for almost nothing.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 255 AND step_number = 6);

-- Family 108 (Turkey Bolognese with Spaghetti) -- recipes 256/257/258.
-- findings.md lens 3 named one omission: "no pasta water reserved (families 104 and 107
-- both do), so there is nothing to loosen or emulsify the sauce at the toss." Fixed in
-- step 6, and step 7 now uses it. The correct order of operations that findings.md
-- praised -- soffritto, garlic 30s, mince until no longer pink, tomato paste cooked out
-- BEFORE the liquid, uncovered simmer, bay removed, taste-and-adjust -- is preserved;
-- step 5 gains a real thickening endpoint (coats the back of a spoon) alongside the 74°C.
-- The lens-4 suggestions (longer simmer, a splash of wine) are advisory and go in the tip.

DELETE FROM recipe_steps WHERE recipe_id = 256;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot and celery with a pinch of the salt and cook 6-8 minutes, until softened and translucent but not browned.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 2, 'Add the garlic and cook 30 seconds, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 4, 'Stir in the tomato paste and cook 1 minute -- this cooks out its raw, tinny edge -- then add the tinned tomatoes, chicken stock, sugar, oregano and bay leaf. Bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 5, 'Simmer uncovered 30-35 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of a spoon and the turkey has reached 74°C (165°F) internally. If it tightens before the time is up, loosen it with a splash of water.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 6, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 256, 7, 'Remove the bay leaf. Taste and adjust the salt, pepper and sugar, then toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until it coats every strand. Scatter with the parmesan and torn basil to serve.', 'Lean turkey and a 30-minute simmer make a lighter sauce than a beef ragu. If you have the time, an hour on the lowest heat deepens it considerably; a splash of red wine reduced down with the tomato paste does the same in less time. Wine is not in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 256 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 257;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot and celery with a pinch of the salt and cook 6-8 minutes, until softened and translucent but not browned.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 2, 'Add the garlic and cook 30 seconds, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 4, 'Stir in the tomato paste and cook 1 minute -- this cooks out its raw, tinny edge -- then add the tinned tomatoes, chicken stock, sugar, oregano and bay leaf. Bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 5, 'Simmer uncovered 30-35 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of a spoon and the turkey has reached 74°C (165°F) internally. If it tightens before the time is up, loosen it with a splash of water.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 6, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 257, 7, 'Remove the bay leaf. Taste and adjust the salt, pepper and sugar, then toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until it coats every strand. Scatter with the parmesan and torn basil to serve.', 'Lean turkey and a 30-minute simmer make a lighter sauce than a beef ragu. If you have the time, an hour on the lowest heat deepens it considerably; a splash of red wine reduced down with the tomato paste does the same in less time. Wine is not in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 257 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 258;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 1, 'Heat the olive oil in a large pan over medium heat. Add the onion, carrot and celery with a pinch of the salt and cook 6-8 minutes, until softened and translucent but not browned.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 2, 'Add the garlic and cook 30 seconds, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 3, 'Add the turkey mince, breaking it up with a spoon, and cook 5-6 minutes until no longer pink.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 4, 'Stir in the tomato paste and cook 1 minute -- this cooks out its raw, tinny edge -- then add the tinned tomatoes, chicken stock, sugar, oregano and bay leaf. Bring to a simmer.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 5, 'Simmer uncovered 30-35 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of a spoon and the turkey has reached 74°C (165°F) internally. If it tightens before the time is up, loosen it with a splash of water.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 6, 'Meanwhile, cook the spaghetti according to package directions. Reserve a mugful of the starchy cooking water before draining.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 258, 7, 'Remove the bay leaf. Taste and adjust the salt, pepper and sugar, then toss the spaghetti through the sauce, adding the reserved pasta water a splash at a time until it coats every strand. Scatter with the parmesan and torn basil to serve.', 'Lean turkey and a 30-minute simmer make a lighter sauce than a beef ragu. If you have the time, an hour on the lowest heat deepens it considerably; a splash of red wine reduced down with the tomato paste does the same in less time. Wine is not in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 258 AND step_number = 7);

-- -------------------------------------------------------------------------------------
-- Task 18 -- the four remaining Group A families: 11, 12, 37, 87
-- Family 11 (37/38/39) is the canonical FR-103 pattern cited in
-- .claude/rules/linked-recipe-extras.md and findings.md calls its technique "exemplary".
-- No finding, so its steps -- and its two linked prep steps -- are NOT touched at all.
-- Note: family 87 (188/194/195) has NO linked recipe_ingredients rows in the live data
-- (verified 2026-08-18), contrary to the note in tasks.md Task 18; nothing to preserve.
-- -------------------------------------------------------------------------------------

-- Family 12 (Chicken Tikka Masala) -- recipes 40/41/42.
-- findings.md lens 3 dish-breaker: "Step 8 is the flag ... The yogurt goes into a tomato
-- sauce that has just simmered 10 minutes, with reduce-heat-to-low as the only protection
-- and no tempering. Yogurt added to an acidic sauce still above ~80°C will grain."
-- Two fixes, both order-of-operations:
--   1. The chicken now goes back into the TOMATO sauce and comes up to 74°C there, before
--      any dairy is in the pan. Previously the yogurt went in first and was then simmered
--      a further 5-10 minutes, which is the same fault twice over.
--   2. The yogurt is added off the heat and tempered with two spoonfuls of the hot sauce,
--      exactly as findings.md prescribes, with the reason stated to the cook.
-- The rice moves up to step 9 so it is genuinely cooking "meanwhile" rather than being
-- started after the curry is finished. Everything findings.md praised (chicken browned
-- and removed, onion softened, aromatics 1 minute, ground spices 30 seconds, tomato paste
-- cooked out) is preserved. Lens 4 (no heat, no coriander, nothing green) needs chilli
-- and coriander, neither of which is on the recipe, so it lands in the tip.

DELETE FROM recipe_steps WHERE recipe_id = 40;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 1, 'Cut the chicken into bite-sized pieces. Season with salt, pepper and half the garam masala.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 2, 'Heat 1 tbsp of the olive oil in a large pan over medium-high heat. Cook the chicken until golden on all sides, about 5 minutes -- it does not need to be cooked through, it finishes in the sauce. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 3, 'Add the remaining oil to the pan. Saute the diced onion until softened and lightly golden, about 5 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 4, 'Add the minced garlic and grated ginger. Cook 1 minute, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 5, 'Add the cumin, turmeric, smoked paprika and cinnamon. Stir for 30 seconds, until fragrant -- any longer over this heat and the ground spices scorch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 6, 'Stir in the tomato paste and cook for 1 minute, to cook out its raw edge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 7, 'Pour in the tinned tomatoes and break them up with a wooden spoon. Simmer 10 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of the spoon.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 8, 'Return the chicken and any juices to the sauce and simmer gently 5-10 minutes, until the chicken is cooked through (74°C internal). Do this before the yogurt goes anywhere near the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 9, 'While the curry simmers, cook the rice according to package directions.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 40, 10, 'Take the pan off the heat. Whisk the Greek yogurt smooth in a small bowl, stir in two spoonfuls of the hot sauce to temper it, then stir the tempered yogurt back into the pan along with the honey and the remaining garam masala. Tempering is not optional -- cold yogurt dropped straight into an acidic sauce above ~80°C will split into grains. Taste, adjust the salt, pepper and honey, and serve over the rice.', 'No chilli and no fresh herb anywhere in this recipe, so it will read pale and mild. A slit green chilli with the onion, or a pinch of chilli powder with the ground spices, gives it heat; coriander torn over at the end gives it the green the plate has none of. Neither is in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 40 AND step_number = 10);

DELETE FROM recipe_steps WHERE recipe_id = 41;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 1, 'Cut the chicken into bite-sized pieces. Season with salt, pepper and half the garam masala.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 2, 'Heat 1 tbsp of the olive oil in a large pan over medium-high heat. Cook the chicken until golden on all sides, about 5 minutes -- it does not need to be cooked through, it finishes in the sauce. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 3, 'Add the remaining oil to the pan. Saute the diced onion until softened and lightly golden, about 5 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 4, 'Add the minced garlic and grated ginger. Cook 1 minute, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 5, 'Add the cumin, turmeric, smoked paprika and cinnamon. Stir for 30 seconds, until fragrant -- any longer over this heat and the ground spices scorch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 6, 'Stir in the tomato paste and cook for 1 minute, to cook out its raw edge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 7, 'Pour in the tinned tomatoes and break them up with a wooden spoon. Simmer 10 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of the spoon.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 8, 'Return the chicken and any juices to the sauce and simmer gently 5-10 minutes, until the chicken is cooked through (74°C internal). Do this before the yogurt goes anywhere near the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 9, 'While the curry simmers, cook the rice according to package directions.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 41, 10, 'Take the pan off the heat. Whisk the Greek yogurt smooth in a small bowl, stir in two spoonfuls of the hot sauce to temper it, then stir the tempered yogurt back into the pan along with the honey and the remaining garam masala. Tempering is not optional -- cold yogurt dropped straight into an acidic sauce above ~80°C will split into grains. Taste, adjust the salt, pepper and honey, and serve over the rice.', 'No chilli and no fresh herb anywhere in this recipe, so it will read pale and mild. A slit green chilli with the onion, or a pinch of chilli powder with the ground spices, gives it heat; coriander torn over at the end gives it the green the plate has none of. Neither is in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 41 AND step_number = 10);

DELETE FROM recipe_steps WHERE recipe_id = 42;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 1, 'Cut the chicken into bite-sized pieces. Season with salt, pepper and half the garam masala.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 2, 'Heat 1 tbsp of the olive oil in a large pan over medium-high heat. Cook the chicken until golden on all sides, about 5 minutes -- it does not need to be cooked through, it finishes in the sauce. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 3, 'Add the remaining oil to the pan. Saute the diced onion until softened and lightly golden, about 5 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 4, 'Add the minced garlic and grated ginger. Cook 1 minute, until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 5, 'Add the cumin, turmeric, smoked paprika and cinnamon. Stir for 30 seconds, until fragrant -- any longer over this heat and the ground spices scorch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 6, 'Stir in the tomato paste and cook for 1 minute, to cook out its raw edge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 7, 'Pour in the tinned tomatoes and break them up with a wooden spoon. Simmer 10 minutes, stirring occasionally, until the sauce has thickened enough to coat the back of the spoon.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 8, 'Return the chicken and any juices to the sauce and simmer gently 5-10 minutes, until the chicken is cooked through (74°C internal). Do this before the yogurt goes anywhere near the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 9, 'While the curry simmers, cook the rice according to package directions.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 42, 10, 'Take the pan off the heat. Whisk the Greek yogurt smooth in a small bowl, stir in two spoonfuls of the hot sauce to temper it, then stir the tempered yogurt back into the pan along with the honey and the remaining garam masala. Tempering is not optional -- cold yogurt dropped straight into an acidic sauce above ~80°C will split into grains. Taste, adjust the salt, pepper and honey, and serve over the rice.', 'No chilli and no fresh herb anywhere in this recipe, so it will read pale and mild. A slit green chilli with the onion, or a pinch of chilli powder with the ground spices, gives it heat; coriander torn over at the end gives it the green the plate has none of. Neither is in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 42 AND step_number = 10);

-- Family 37 (Hash Browns & Diced Chicken) -- recipes 124/125/126.
-- findings.md lens 3 dish-breaker: "Loose grated potato tipped into an air-fryer basket
-- and shaken does not become hash browns -- it becomes dry shreds. There is no forming
-- step, no binder, no compression, and shaking actively prevents the cake from setting."
-- Implemented exactly as findings.md proposed, taking the second binder option: there is
-- no egg and no flour on this recipe, so the binder is the potato starch reclaimed from
-- the squeezing liquid (step 1), which costs nothing and adds no ingredient row.
-- Forming, oiling both sides, 12 minutes then ONE flip (never a shake), then 8-10 more.
-- The squeeze-it-dry instruction findings.md praised is kept, and its em dash is
-- normalised to the double hyphen the rest of the corpus uses.
-- Lens 4 ("beige on beige ... no acid, no green, no sauce") needs ingredients this recipe
-- does not carry, so it goes in the tip. Also added: an internal temperature and a rest
-- on the chicken, and a taste-and-adjust before serving -- all three were missing.
-- NOTE: steps 2 and 5 reference salt, pepper and paprika, which are NOT rows on this
-- recipe. That is pre-existing (the original steps did the same) and is left as-is rather
-- than silently changing the composition of a family being signed off as macro-clean.
-- Flagged in the Implementer Report as a follow-up.

DELETE FROM recipe_steps WHERE recipe_id = 124;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 1, 'Peel and grate the potatoes on the large holes of a box grater. Squeeze firmly in a clean kitchen towel over a bowl to remove as much moisture as possible -- this is critical for crispy hash browns. Let the squeezed liquid stand 2 minutes, then pour off the water and keep the white starch left behind in the bottom of the bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 2, 'Finely dice the onion. Mix it into the grated potato along with the reserved potato starch and a pinch of salt and pepper. That starch is the only binder here -- it is what lets the cakes hold together without egg or flour.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 3, 'Press the mixture firmly into 4 patties about 1.5cm thick, compacting each one until it holds its shape in your hand. Loose shreds never set into a hash brown.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 4, 'Brush both sides of the patties with most of the olive oil and lay them in the air fryer basket in a single layer, not touching. Air fry at 200°C for 12 minutes, flip once with a spatula -- do not shake the basket, shaking breaks the cakes apart -- then air fry 8-10 minutes more, until deep golden and crisp at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 5, 'While the hash browns cook, dice the chicken breast and season it with salt, pepper and a pinch of paprika if you have it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 6, 'Heat a non-stick pan over medium-high heat with the remaining olive oil. Cook the chicken 6-8 minutes, turning occasionally, until golden and 74°C (165°F) internally. Let it rest 2 minutes off the heat.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 124, 7, 'Taste the chicken and adjust the seasoning, then serve the crisp hash browns topped with the diced chicken and any juices left in the pan.', 'Potato and chicken is beige on beige, and at roughly 22 percent fat the plate reads dry. None of the fixes cost much: a squeeze of lemon or a spoon of yogurt over the chicken for acid, sliced scallion or watercress for green, or a fried egg on top, which also lifts the fat toward the target band. None of them are in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 124 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 125;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 1, 'Peel and grate the potatoes on the large holes of a box grater. Squeeze firmly in a clean kitchen towel over a bowl to remove as much moisture as possible -- this is critical for crispy hash browns. Let the squeezed liquid stand 2 minutes, then pour off the water and keep the white starch left behind in the bottom of the bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 2, 'Finely dice the onion. Mix it into the grated potato along with the reserved potato starch and a pinch of salt and pepper. That starch is the only binder here -- it is what lets the cakes hold together without egg or flour.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 3, 'Press the mixture firmly into 5 patties about 1.5cm thick, compacting each one until it holds its shape in your hand. Loose shreds never set into a hash brown.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 4, 'Brush both sides of the patties with most of the olive oil and lay them in the air fryer basket in a single layer, not touching. Air fry at 200°C for 12 minutes, flip once with a spatula -- do not shake the basket, shaking breaks the cakes apart -- then air fry 8-10 minutes more, until deep golden and crisp at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 5, 'While the hash browns cook, dice the chicken breast and season it with salt, pepper and a pinch of paprika if you have it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 6, 'Heat a non-stick pan over medium-high heat with the remaining olive oil. Cook the chicken 6-8 minutes, turning occasionally, until golden and 74°C (165°F) internally. Let it rest 2 minutes off the heat.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 125, 7, 'Taste the chicken and adjust the seasoning, then serve the crisp hash browns topped with the diced chicken and any juices left in the pan.', 'Potato and chicken is beige on beige, and at roughly 22 percent fat the plate reads dry. None of the fixes cost much: a squeeze of lemon or a spoon of yogurt over the chicken for acid, sliced scallion or watercress for green, or a fried egg on top, which also lifts the fat toward the target band. None of them are in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 125 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 126;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 1, 'Peel and grate the potatoes on the large holes of a box grater. Squeeze firmly in a clean kitchen towel over a bowl to remove as much moisture as possible -- this is critical for crispy hash browns. Let the squeezed liquid stand 2 minutes, then pour off the water and keep the white starch left behind in the bottom of the bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 2, 'Finely dice the onion. Mix it into the grated potato along with the reserved potato starch and a pinch of salt and pepper. That starch is the only binder here -- it is what lets the cakes hold together without egg or flour.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 3, 'Press the mixture firmly into 6 patties about 1.5cm thick, compacting each one until it holds its shape in your hand. Loose shreds never set into a hash brown.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 4, 'Brush both sides of the patties with most of the olive oil and lay them in the air fryer basket in a single layer, not touching. Air fry at 200°C for 12 minutes, flip once with a spatula -- do not shake the basket, shaking breaks the cakes apart -- then air fry 8-10 minutes more, until deep golden and crisp at the edges. Cook them in two batches rather than stacking them.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 5, 'While the hash browns cook, dice the chicken breast and season it with salt, pepper and a pinch of paprika if you have it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 6, 'Heat a non-stick pan over medium-high heat with the remaining olive oil. Cook the chicken 6-8 minutes, turning occasionally, until golden and 74°C (165°F) internally. Let it rest 2 minutes off the heat.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 126, 7, 'Taste the chicken and adjust the seasoning, then serve the crisp hash browns topped with the diced chicken and any juices left in the pan.', 'Potato and chicken is beige on beige, and at roughly 22 percent fat the plate reads dry. None of the fixes cost much: a squeeze of lemon or a spoon of yogurt over the chicken for acid, sliced scallion or watercress for green, or a fried egg on top, which also lifts the fat toward the target band. None of them are in the ingredient list.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 126 AND step_number = 7);

-- Family 87 (Greek Chicken Gyros Bowl) -- recipes 188/194/195.
-- findings.md lens 3, two flags: (1) recipe 188 step 2 quoted a raw gram figure in prose
-- ("with 6g olive oil"), "which reads like a spreadsheet rather than a recipe and should
-- become 'with most of the olive oil' as the sibling variant already does" -- all three
-- are now identical on that clause; (2) "there is no taste-and-adjust step" -- added at
-- step 5, before anything is plated, which is where it is useful. Also added: pat the
-- chickpeas dry and spread the tray in a single layer, both of which the "chickpeas are
-- crisp" endpoint already depends on. The parallel timing findings.md praised (rice and
-- salad built while the tray roasts) is unchanged.

DELETE FROM recipe_steps WHERE recipe_id = 188;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 188, 1, 'Heat oven to 220°C / 425°F. Dice the chicken thigh, drain the chickpeas and pat them dry (wet chickpeas steam instead of crisping), and cut the red onion into wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 188 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 188, 2, 'Toss the chicken, chickpeas and onion on a sheet pan with most of the olive oil, the oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Spread into a single layer -- crowded, they steam. Roast 22 min until the chicken hits 75°C and the chickpeas are crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 188 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 188, 3, 'While roasting, cook the jasmine rice per packet (about 12 min) and leave it covered off the heat to steam.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 188 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 188, 4, 'Make the salad: dice the cucumber and halve the cherry tomatoes; toss with the crushed garlic, dill, remaining olive oil and lemon. Crumble over the feta. Whisk the Greek yogurt with a pinch of salt for the drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 188 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 188, 5, 'Taste the salad and the yogurt drizzle and adjust the salt, lemon and pepper before anything is plated -- feta varies a lot in saltiness. Then plate the rice, top with the sheet-pan chicken and chickpeas, add the cucumber-feta salad alongside, and finish with the yogurt drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 188 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 194;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 194, 1, 'Heat oven to 220°C / 425°F. Dice the chicken thigh, drain the chickpeas and pat them dry (wet chickpeas steam instead of crisping), and cut the red onion into wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 194 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 194, 2, 'Toss the chicken, chickpeas and onion on a sheet pan with most of the olive oil, the oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Spread into a single layer -- crowded, they steam. Roast 22 min until the chicken hits 75°C and the chickpeas are crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 194 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 194, 3, 'While roasting, cook the jasmine rice per packet (about 12 min) and leave it covered off the heat to steam.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 194 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 194, 4, 'Make the salad: dice the cucumber and halve the cherry tomatoes; toss with the crushed garlic, dill, remaining olive oil and lemon. Crumble over the feta. Whisk the Greek yogurt with a pinch of salt for the drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 194 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 194, 5, 'Taste the salad and the yogurt drizzle and adjust the salt, lemon and pepper before anything is plated -- feta varies a lot in saltiness. Then plate the rice, top with the sheet-pan chicken and chickpeas, add the cucumber-feta salad alongside, and finish with the yogurt drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 194 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 195;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 195, 1, 'Heat oven to 220°C / 425°F. Dice the chicken thigh, drain the chickpeas and pat them dry (wet chickpeas steam instead of crisping), and cut the red onion into wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 195 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 195, 2, 'Toss the chicken, chickpeas and onion on a sheet pan with most of the olive oil, the oregano, paprika, garlic powder, half the lemon juice, salt and pepper. Spread into a single layer -- crowded, they steam. Roast 22 min until the chicken hits 75°C and the chickpeas are crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 195 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 195, 3, 'While roasting, cook the jasmine rice per packet (about 12 min) and leave it covered off the heat to steam.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 195 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 195, 4, 'Make the salad: dice the cucumber and halve the cherry tomatoes; toss with the crushed garlic, dill, remaining olive oil and lemon. Crumble over the feta. Whisk the Greek yogurt with a pinch of salt for the drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 195 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 195, 5, 'Taste the salad and the yogurt drizzle and adjust the salt, lemon and pepper before anything is plated -- feta varies a lot in saltiness. Then plate the rice, top with the sheet-pan chicken and chickpeas, add the cucumber-feta salad alongside, and finish with the yogurt drizzle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 195 AND step_number = 5);

-- =====================================================================================
-- PHASE 7 -- Sign off the macro-clean families
-- =====================================================================================
--
-- One statement per family, all members together -- a partially flagged family reads as
-- "reviewed" on the card while its siblings were never checked, which is a worse state
-- than none of them being flagged.
--
-- macros_audited_by is intentionally left NULL and must never be assigned here: it is an
-- FK to users.id and this was an agent-run audit with no user row behind it (chef skill,
-- "Recording the audit"; established precedent is the Stromboli family 44/45/46).
--
-- 15 families, not the 19 in tasks.md Task 19. The four differences are all deferrals,
-- not failures -- every one of them is a family whose composition changes later in this
-- same contract, and signing off a recipe whose ingredients are about to move would be a
-- stale attestation the moment it lands:
--   96  (220-222) -- whey protein isolate added, Balanced yogurt cut, decisions.md #5 as
--        revised 2026-08-19
--   105 (247-249) -- full rework to a pita dish + rename, decisions.md #1
--   106 (250-252) -- mayonnaise dual-path + vinegar + patty rest, decisions.md #6
--   95  (217-219) -- deferred here when decisions.md #5 still cut its yogurt too. That cut
--        is now reverted and the family's composition does not move, so it could have been
--        signed off in this block. It is left in Task 32 anyway: the sign-off belongs with
--        the family it was assessed alongside, and moving it now would only churn the file.
-- All four are signed off with the remediated families in Task 32 instead.
-- (Family 93 was never in this list: it is a cheat meal and is never audited at all.)

UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (37,38,39);      -- fam 11  Pink Sauce Pasta
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (40,41,42);      -- fam 12  Chicken Tikka Masala
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (124,125,126);   -- fam 37  Hash Browns & Diced Chicken
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (188,194,195);   -- fam 87  Greek Chicken Gyros Bowl
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (214,215,216);   -- fam 94  Apple, Cinnamon & Walnut Porridge
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (223,224,225);   -- fam 97  Poached Eggs, Smoked Salmon & Avocado on Toast
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (226,227,228);   -- fam 98  Soft-Boiled Eggs, Cottage Cheese & Toast
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (229,230,231);   -- fam 99  Fried Eggs with Halloumi & Toast
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (232,233,234);   -- fam 100 Cheese & Ham Omelette with Toast
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (235,236,237);   -- fam 101 Baked Cod with Lemon, Herbs & New Potatoes
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (238,239,240);   -- fam 102 Pan-Seared Mackerel with Greens & Quinoa
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (241,242,243);   -- fam 103 Herb-Roasted Chicken Breast with Sweet Potato & Greens
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (244,245,246);   -- fam 104 Beef Meatballs in Tomato Sauce with Spaghetti
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (253,254,255);   -- fam 107 Turkey Meatballs in Tomato Sauce with Spaghetti
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (256,257,258);   -- fam 108 Turkey Bolognese with Spaghetti

-- =====================================================================================
-- PHASE 8 -- Macro remediation: the low-risk tier (Tasks 20, 21, 22; Task 23 VOID)
-- =====================================================================================
--
-- METHOD. Every figure below was recomputed from the LIVE rows on 2026-08-18 via
-- mcp__mysql__mysql_query, not copied from findings.md: raw ingredients
-- (quantity_grams x per-100g) PLUS linked recipes prorated by
-- (parent quantity_grams / linked total yield), kcal by Atwater 4P + 4C + 9F. The
-- recompute was validated against findings.md's published baselines before any fix was
-- designed -- family 23 reproduced 1254 / 1407 / 1701 exactly and family 4 reproduced
-- 1020 / 1206 / 1500 exactly -- so where a findings.md fix table is reused below, it is
-- because this run re-derived the same numbers, not because it was trusted on sight.
--
-- STANDARD APPLIED (.claude/rules/recipe-variants.md, 2026-07-30 policy):
--   REJECT: protein < 35 g/srv | fat > 35 % of kcal | carbs < 38 % of kcal
--           | kcal ordering not Light < Moderate < Balanced
--   NOT a reject: per-serving kcal outside its design band; carbs above 50 %; fat below
--           the 25 % chef floor (a quality flag -- called out explicitly where it lands).
--   recipes.calories is WHOLE-RECIPE = ROUND(per_serving_kcal x default_servings).
--
-- WORCESTERSHIRE SAUCE (ingredient 39) IS RETAINED IN FAMILIES 5 AND 22.
--   findings.md proposes removing it on gout grounds, and its fix tables for BOTH families
--   assume a Worcestershire -> soy substitution. decisions.md Sec.3 and its *Anchovy
--   position* REJECT that: at in-repo doses Worcestershire contributes ~10 mg purines
--   against ~180-200 mg from the beef in the same serving. Ingredient 39 is therefore NOT
--   touched anywhere in this file, and the resulting figures for families 5 and 22 were
--   recomputed from scratch WITHOUT the soy swap. They differ from the published
--   findings.md tables; the numbers in this file are the correct ones.
--
-- NO macros_audited WRITES ANYWHERE BELOW. Sign-off is Phase 10 / Task 32.
--
-- NO NEW INGREDIENTS ARE CREATED. Every ingredient used below already existed and was
-- resolved by case-insensitive search first, per
-- .claude/rules/homemade-first-and-ingredient-dedup.md:
--   Greek yogurt 49, Chicken breast 11, Cottage cheese 169, Mozzarella 37,
--   Cherry Tomatoes 116, Black Olives 117, Dried oregano 35, White Wine Vinegar 85.
--   ("cider vinegar" does not exist as a row; White Wine Vinegar (85) is the existing row
--    reused for family 106's slaw acid rather than inserting a near-duplicate.)

-- -------------------------------------------------------------------------------------
-- Task 20 -- Family 23 (Spaghetti Bolognese), recipes 81/82/83: calories column only.
-- -------------------------------------------------------------------------------------
-- Protein, fat % and carb % all pass on all three variants. The single reject is the
-- stored column running +9.9 / +9.8 / +10.1 % ABOVE the recomputed whole-recipe total --
-- a POSITIVE drift, matching neither documented failure mode (store-bought basis drifts
-- negative; per-serving-instead-of-whole lands at ~ -50 %). No ingredient row is touched,
-- so the macros do not move at all.
--   unchanged: 627 / 703 / 851 kcal/srv, P 46.6 / 55.0 / 70.6 g,
--              fat 25.8 / 26.2 / 25.8 %, carb 44.4 / 42.5 / 41.0 %
UPDATE recipes SET calories = 1254 WHERE id = 81;   -- Light,    was 1378 (+9.9 %)
UPDATE recipes SET calories = 1407 WHERE id = 82;   -- Moderate, was 1545 (+9.8 %)
UPDATE recipes SET calories = 1701 WHERE id = 83;   -- Balanced, was 1874 (+10.1 %)

-- -------------------------------------------------------------------------------------
-- Task 21 -- Family 22 (Classic Irish Beef Stew), recipes 78/79/80.
--            Light protein 31.7 -> 36.8 g. PLUS decisions.md Sec.10 (step_number = 0).
-- -------------------------------------------------------------------------------------
-- Only recipe 78 failed, and only on protein. The lever has to be beef AND potato
-- together: raising beef alone pushes fat % over the 35 % ceiling, because beef chuck at
-- 20 P / 10 F per 100 g is 53 % fat by kcal. The potato rises with it to dilute fat % and
-- carry the carbs, and the butter is halved on all three variants -- that trim is
-- load-bearing and must not be reversed.
-- Worcestershire (39) at 18 g is UNCHANGED on all three per decisions.md Sec.3. These
-- figures are recomputed on that basis and SUPERSEDE findings.md's soy-swap table
-- (which published 528 / 575 / 728).
--
--            BEFORE (kcal/srv, P g, fat %, carb %)     AFTER
--   78 Light   482  31.7  34.3  39.4  [P REJECT]        533  36.8  29.7  42.7   PASS
--   79 Moder   571  38.6  33.8  39.1  pass              580  39.5  28.9  43.8   PASS
--   80 Balan   709  49.9  33.7  38.2  pass              733  51.1  29.2  42.9   PASS
--   kcal ordering 533 < 580 < 733 -- holds.
UPDATE recipe_ingredients SET quantity = 280.00, quantity_grams = 280.00
WHERE recipe_id = 78 AND ingredient_id = 120;               -- Beef Chuck 240 -> 280 g
UPDATE recipe_ingredients SET quantity = 350.00, quantity_grams = 350.00
WHERE recipe_id = 78 AND ingredient_id = 121;               -- Potato 240 -> 350 g
UPDATE recipe_ingredients SET quantity = 390.00, quantity_grams = 390.00
WHERE recipe_id = 79 AND ingredient_id = 121;               -- Potato 300 -> 390 g
UPDATE recipe_ingredients SET quantity = 530.00, quantity_grams = 530.00
WHERE recipe_id = 80 AND ingredient_id = 121;               -- Potato 400 -> 530 g
UPDATE recipe_ingredients SET quantity = 0.50, quantity_grams = 7.00
WHERE recipe_id IN (78,79,80) AND ingredient_id = 103;      -- Butter 1 -> 0.5 tbsp (14 -> 7 g)
UPDATE recipes SET calories = 1065 WHERE id = 78;   -- was 923
UPDATE recipes SET calories = 1159 WHERE id = 79;   -- was 1099
UPDATE recipes SET calories = 1467 WHERE id = 80;   -- was 1373

-- decisions.md Sec.10 -- the step_number = 0 CHEF'S NOTE row on all three variants.
-- Verified live: each of 78/79/80 carries exactly 11 rows numbered 0..10 with tip NULL on
-- step 1. Once step 0 is deleted the survivors are ALREADY contiguous 1..10, so there is
-- no renumbering to do and therefore no (recipe_id, step_number) unique-key collision to
-- avoid. DEVIATION, stated openly: the dispatch asked for wipe-and-re-insert. That pattern
-- exists precisely to survive renumbering; re-typing 30 verbatim steps to accomplish a
-- one-row DELETE plus a one-column UPDATE would add transcription risk, not remove it.
-- Both statements below are naturally idempotent -- on a re-run the DELETE matches nothing
-- and the UPDATE rewrites the identical tip.
-- The note lands on step 1, which is the dry-brine instruction it explains.
UPDATE recipe_steps SET tip = 'CHEF''S NOTE: We use whole chuck roast instead of pre-cubed stewing beef — it has better marbling and collagen for a richer stew. The overnight salt (dry brine) seasons the meat all the way through, firms the texture so it holds together during braising, and makes the final result more tender.'
WHERE recipe_id IN (78,79,80) AND step_number = 1;
DELETE FROM recipe_steps WHERE recipe_id IN (78,79,80) AND step_number = 0;

-- -------------------------------------------------------------------------------------
-- Task 22 -- Family 4 (Pizza), recipes 13/14/15: Light carbs 35.8 % -> 41.1 %.
-- -------------------------------------------------------------------------------------
-- findings.md divergence 7 is the trap: raising recipe 13's dough by 80 g clears carbs at
-- 41.4 % but lands Light at 608 kcal/srv against Moderate's 603 -- BREAKING the
-- Light < Moderate ordering, which IS a hard reject. The fix is therefore coordinated
-- across all three: dough up on every member, plus a trim to recipe 13's oversized chicken
-- portion (220 g, MORE than Moderate's 200 g), which restores the variant ladder and lifts
-- carb % by lowering protein's share of kcal.
-- The dough rows are FR-103 dual-path (ingredient_id 75 AND linked_recipe_id 11), so they
-- are matched on linked_recipe_id; nutrition comes from the homemade linked recipe either
-- way. All portions stay inside Pizza Dough's 733 g yield (largest used here: 370 g).
--
--            BEFORE                                     AFTER
--   13 Light   510  48.3  26.3  35.8  [CARB REJECT]     528  43.6  25.9  41.1   PASS
--   14 Moder   603  50.0  27.4  39.4  pass              640  51.1  26.9  41.2   PASS
--   15 Balan   750  56.6  28.4  41.4  pass              787  57.8  27.9  42.7   PASS
--   kcal ordering 528 < 640 < 787 -- holds, with 112 / 147 kcal gaps.
UPDATE recipe_ingredients SET quantity = 240.00, quantity_grams = 240.00
WHERE recipe_id = 13 AND linked_recipe_id = 11;             -- Pizza Dough 200 -> 240 g
UPDATE recipe_ingredients SET quantity = 290.00, quantity_grams = 290.00
WHERE recipe_id = 14 AND linked_recipe_id = 11;             -- Pizza Dough 260 -> 290 g
UPDATE recipe_ingredients SET quantity = 370.00, quantity_grams = 370.00
WHERE recipe_id = 15 AND linked_recipe_id = 11;             -- Pizza Dough 340 -> 370 g
UPDATE recipe_ingredients SET quantity = 180.00, quantity_grams = 180.00
WHERE recipe_id = 13 AND ingredient_id = 11;                -- Chicken breast 220 -> 180 g
UPDATE recipes SET calories = 1056 WHERE id = 13;   -- was 1020
UPDATE recipes SET calories = 1279 WHERE id = 14;   -- was 1206
UPDATE recipes SET calories = 1574 WHERE id = 15;   -- was 1500

-- Task 23 -- VOID. Family 93 (Chicken Carbonara) was reclassified as a cheat meal at the
-- Phase 2 gate (decisions.md Sec.7). It leaves the audit entirely: no macro remediation,
-- no prose pass, no sign-off, and the macro reject conditions no longer apply to it. Its
-- one non-macro fix (recipe 212's 300 g Fresh Pasta against a 282 g linked yield) already
-- landed in Phase 5 / Task 12 above. Nothing is emitted here.

-- =====================================================================================
-- PHASE 9 -- Macro remediation: the heavy tier (Tasks 24, 25, 26, 27, 28, 29, 30)
-- =====================================================================================
--
-- Seven families needing genuine recipe surgery. Fewer than plan.md carried, because four
-- of the hardest (14, 16, 28, 29) are now cheat and exempt and family 93 left the audit.
-- Each task is independent: stopping between them leaves every earlier family fully fixed.
--
-- IDEMPOTENCY. recipe_ingredients has NO unique index on (recipe_id, ingredient_id) or
-- (recipe_id, linked_recipe_id). VERIFIED LIVE 2026-08-18 against
-- information_schema.STATISTICS: the only unique index on recipe_ingredients is PRIMARY on
-- `id`; fk_recipe_ingredients_ingredient, fk_recipe_ingredients_unit, idx_linked_recipe_id
-- and idx_recipe_id are all NON_UNIQUE = 1. (The repo's database/schema.sql is an empty
-- directory, so information_schema is the authority here, not a checked-in DDL file.)
-- Because there is no unique constraint to collide with, every INSERT below is written as
-- INSERT ... SELECT ... WHERE NOT EXISTS with <=> NULL-safe equality on BOTH id columns --
-- required because exactly one of them is NULL on any ordinary row, and neither is on an
-- FR-103 dual-path row. Do NOT rely on START TRANSACTION: the Railway console commits per
-- statement, so every statement must stand alone on a retry.

-- -------------------------------------------------------------------------------------
-- Task 24 -- Family 1, recipes 1/2/3. REWORKED + RENAMED 2026-08-19 on developer
--            instruction: 'Peanut Butter Porridge with Berries & Walnuts'.
--            Protein 12.7 / 17.2 / 22.0 -> 36.6 / 45.9 / 55.4 g. Fat 38.7-39.9 % -> 27-29 %.
-- -------------------------------------------------------------------------------------
-- !! THIS BLOCK SUPERSEDES THE EARLIER 530/570/620 g GREEK YOGURT FIX. DO NOT RESTORE IT. !!
--   An earlier revision of this file poured 530 / 570 / 620 g of Greek yogurt into these
--   three recipes, copying family 94 (Apple, Cinnamon & Walnut Porridge). Two things were
--   wrong with it, both raised by the developer on 2026-08-19:
--
--   1. THE PORTION IS UNBUYABLE. 530 g whole-recipe against a standard 500 g tub means the
--      cook buys a tub, comes up 30 g short, and opens a second one. Nothing about the fix
--      needed that much yogurt -- it was there purely as a protein carrier.
--   2. IT MADE THIS A NEAR-CLONE OF AN EXISTING FAMILY. `Protein Porridge with Berries`
--      (recipes 187/192/193) is already oats + milk + whey + Greek yogurt + berries + honey
--      + almonds + walnuts. Adding half a kilo of yogurt here left peanut butter as the only
--      thing telling the two dishes apart, in a picker that shows both.
--
-- WHAT SHIPS INSTEAD
--   Whey protein isolate (163) carries the protein -- 30 / 40 / 50 g, roughly a scoop per
--   two servings -- and the yogurt drops to 160 / 180 / 200 g, which is 80-100 g per serving
--   and three batches out of one tub. Those are the SAME yogurt weights recipes 187/192/193
--   already use, so this follows the in-repo working model rather than inventing one.
--   Ingredient 163 ALREADY EXISTS (80.65 P / 0.00 C / 1.61 F per 100 g) and is already on
--   9 rows, three of them porridge. NO NEW INGREDIENT IS CREATED by this block.
--
--   The dish is then pushed AWAY from Protein Porridge rather than toward it, per the
--   developer's choice of option 1: peanut butter becomes the identity (22 / 31 / 40 g, up
--   from 18/27/36), the almonds are REMOVED so walnuts stand alone, and the name says what
--   is in the bowl. Family 1 is now the only porridge in the table built on peanut butter.
--
--            BEFORE                                     AFTER
--    1 Light   329  12.7  38.7  45.8  [P, FAT]          501  36.6  27.7  43.1   PASS
--    2 Moder   446  17.2  39.1  45.5  [P, FAT]          635  45.9  28.5  42.5   PASS
--    3 Balan   570  22.0  39.9  44.7  [P, FAT]          777  55.4  28.9  42.5   PASS
--   kcal ordering 501 < 635 < 777 -- holds, with 133 / 142 kcal gaps, and all three land
--   INSIDE their design bands (450-550 / 550-650 / 700-800) -- which the superseded yogurt
--   version missed on Balanced at 684.

-- Greek yogurt -- the creaminess, not the protein. 80-100 g per serving.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 1, 49, NULL, 160.00, 1, 160.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 1 AND (ingredient_id <=> 49) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 2, 49, NULL, 180.00, 1, 180.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 2 AND (ingredient_id <=> 49) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 3, 49, NULL, 200.00, 1, 200.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 3 AND (ingredient_id <=> 49) AND (linked_recipe_id <=> NULL));

-- Whey protein isolate -- the protein. Existing ingredient 163, unit g like all 9 of its
-- current rows (quantity = quantity_grams throughout).
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 1, 163, NULL, 30.00, 1, 30.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 1 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 2, 163, NULL, 40.00, 1, 40.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 2 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 3, 163, NULL, 50.00, 1, 50.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 3 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));

-- Peanut butter UP -- this is now what the dish is named for. 18 g per tbsp on these rows.
UPDATE recipe_ingredients SET quantity = 1.25, quantity_grams = 22.00
WHERE recipe_id = 1 AND ingredient_id = 6;                  -- Peanut butter 1 -> 1.25 tbsp (18 -> 22 g)
UPDATE recipe_ingredients SET quantity = 1.75, quantity_grams = 31.00
WHERE recipe_id = 2 AND ingredient_id = 6;                  -- Peanut butter 1.5 -> 1.75 tbsp (27 -> 31 g)
UPDATE recipe_ingredients SET quantity = 2.25, quantity_grams = 40.00
WHERE recipe_id = 3 AND ingredient_id = 6;                  -- Peanut butter 2 -> 2.25 tbsp (36 -> 40 g)

-- Almonds OUT so the walnuts read as the nut in "& Walnuts". Idempotent: on a re-run the
-- DELETE matches nothing. Walnuts take over sort_order 8.
DELETE FROM recipe_ingredients WHERE recipe_id IN (1,2,3) AND ingredient_id = 7;
UPDATE recipe_ingredients SET quantity = 10.00, quantity_grams = 10.00, sort_order = 8
WHERE recipe_id = 1 AND ingredient_id = 8;                   -- Walnuts 10 g
UPDATE recipe_ingredients SET quantity = 13.00, quantity_grams = 13.00, sort_order = 8
WHERE recipe_id = 2 AND ingredient_id = 8;                   -- Walnuts 13 g
UPDATE recipe_ingredients SET quantity = 16.00, quantity_grams = 16.00, sort_order = 8
WHERE recipe_id = 3 AND ingredient_id = 8;                   -- Walnuts 17 -> 16 g

-- Milk stays high: with only 160-200 g of yogurt going in, the bowl needs the liquid.
UPDATE recipe_ingredients SET quantity = 380.00, quantity_grams = 391.00
WHERE recipe_id = 1 AND ingredient_id = 2;                  -- Low fat milk 250 -> 380 ml
UPDATE recipe_ingredients SET quantity = 460.00, quantity_grams = 475.00
WHERE recipe_id = 2 AND ingredient_id = 2;                  -- Low fat milk 330 -> 460 ml
UPDATE recipe_ingredients SET quantity = 540.00, quantity_grams = 557.00
WHERE recipe_id = 3 AND ingredient_id = 2;                  -- Low fat milk 415 -> 540 ml

UPDATE recipe_ingredients SET quantity = 90.00, quantity_grams = 90.00
WHERE recipe_id = 1 AND ingredient_id = 1;                  -- Rolled oats 60 -> 90 g
UPDATE recipe_ingredients SET quantity = 110.00, quantity_grams = 110.00
WHERE recipe_id = 2 AND ingredient_id = 1;                  -- Rolled oats 80 -> 110 g
UPDATE recipe_ingredients SET quantity = 135.00, quantity_grams = 135.00
WHERE recipe_id = 3 AND ingredient_id = 1;                  -- Rolled oats 100 -> 135 g

UPDATE recipe_ingredients SET quantity = 100.00, quantity_grams = 100.00
WHERE recipe_id = 1 AND ingredient_id = 3;                  -- Mixed berries 80 -> 100 g
UPDATE recipe_ingredients SET quantity = 130.00, quantity_grams = 130.00
WHERE recipe_id = 2 AND ingredient_id = 3;                  -- Mixed berries 105 -> 130 g
UPDATE recipe_ingredients SET quantity = 160.00, quantity_grams = 160.00
WHERE recipe_id = 3 AND ingredient_id = 3;                  -- Mixed berries 135 -> 160 g

UPDATE recipe_ingredients SET quantity = 100.00, quantity_grams = 100.00
WHERE recipe_id = 1 AND ingredient_id = 9;                  -- Water 150 -> 100 ml
UPDATE recipe_ingredients SET quantity = 120.00, quantity_grams = 120.00
WHERE recipe_id = 2 AND ingredient_id = 9;                  -- Water 200 -> 120 ml
UPDATE recipe_ingredients SET quantity = 140.00, quantity_grams = 140.00
WHERE recipe_id = 3 AND ingredient_id = 9;                  -- Water 250 -> 140 ml

UPDATE recipe_ingredients SET quantity = 2.00, quantity_grams = 16.00
WHERE recipe_id = 3 AND ingredient_id = 4;                  -- Honey 14 -> 16 g (2 tsp, was 1.75)
-- Honey on 1 and 2 (8 g / 12 g) and salt on all three are already correct. Untouched.

-- Rename. recipes.name and recipe_families.family_name are kept identical so the two stay
-- aligned, and all three variants share one name -- the variant lives in
-- recipe_family_members.variant_label, never in the recipe name. Same precedent as the
-- family 105 rename later in this file, and an agreed exception to plan.md's
-- "no renaming beyond the ' - Diet' suffix" boundary: the old name described a dish that no
-- longer has almonds in it and never had peanut butter in its title.
UPDATE recipes SET name = 'Peanut Butter Porridge with Berries & Walnuts' WHERE id IN (1,2,3);
UPDATE recipe_families SET family_name = 'Peanut Butter Porridge with Berries & Walnuts' WHERE id = 1;

UPDATE recipes SET calories = 1003 WHERE id = 1;    -- was 657
UPDATE recipes SET calories = 1269 WHERE id = 2;    -- was 892
UPDATE recipes SET calories = 1554 WHERE id = 3;    -- was 1139
-- The whey and the yogurt both need steps, and both go in OFF THE HEAT -- whey boiled
-- denatures and goes grainy, yogurt stirred into boiling oats splits. So do the step-1
-- hob-dial cue, the unstirred peanut butter, the untoasted nuts and the missing
-- taste-and-adjust. All of that is the Phase 10 / Task 31 prose pass.

-- -------------------------------------------------------------------------------------
-- Task 25 -- Family 5 (Chicken Satay), recipes 16/17/18.
--            Fat 48 % -> ~31 %. Carbs 27.6 % -> ~39-41 %.
-- -------------------------------------------------------------------------------------
-- CORRECTION TO plan.md, confirmed live: the plan's premise that this family needs rice
-- added is FALSE. Jasmine rice (26) is ALREADY in all three variants at 56 / 74 / 92 g dry
-- and step 3 cooks it. The 48 % fat comes from chicken THIGH (10 % fat) plus 100-130 g
-- coconut milk (21 % fat) plus 32-40 g peanut butter (50 % fat) plus 7-21 g olive oil.
-- So the levers are: thigh -> breast (10 % fat -> 3.6 %, the single biggest move), halve
-- the coconut milk, and roughly double the rice that is already there to carry carb %.
-- The peanut butter is NOT cut -- it is the sauce, and cutting it would stop the dish
-- being satay.
-- Worcestershire (39) at 9 / 9 / 14 g is UNCHANGED per decisions.md Sec.3; these figures
-- are recomputed on that basis and SUPERSEDE findings.md's soy-swap table (1246/1487/1998).
--
--            BEFORE                                     AFTER
--   16 Light   625  37.6  48.2  27.8  [FAT, CARB]       626  44.4  30.7  40.9   PASS
--   17 Moder   753  46.2  47.8  27.6  [FAT, CARB]       746  54.7  31.4  39.3   PASS
--   18 Balan   980  59.3  48.5  27.3  [FAT, CARB]      1003  70.8  31.7  40.1   PASS
--   kcal ordering 626 < 746 < 1003 -- holds. kcal runs above the design bands, which is a
--   target miss and explicitly NOT a reject.
UPDATE recipe_ingredients SET ingredient_id = 11
WHERE recipe_id IN (16,17,18) AND ingredient_id = 41;       -- Chicken thigh -> breast (220/280/360 g kept)

UPDATE recipe_ingredients SET quantity = 50.00, quantity_grams = 50.00
WHERE recipe_id IN (16,17) AND ingredient_id = 38;          -- Coconut milk 100 -> 50 ml
UPDATE recipe_ingredients SET quantity = 70.00, quantity_grams = 70.00
WHERE recipe_id = 18 AND ingredient_id = 38;                -- Coconut milk 130 -> 70 ml

UPDATE recipe_ingredients SET quantity = 110.00, quantity_grams = 110.00
WHERE recipe_id = 16 AND ingredient_id = 26;                -- Jasmine rice 56 -> 110 g dry
UPDATE recipe_ingredients SET quantity = 130.00, quantity_grams = 130.00
WHERE recipe_id = 17 AND ingredient_id = 26;                -- Jasmine rice 74 -> 130 g dry
UPDATE recipe_ingredients SET quantity = 180.00, quantity_grams = 180.00
WHERE recipe_id = 18 AND ingredient_id = 26;                -- Jasmine rice 92 -> 180 g dry

UPDATE recipes SET calories = 1251 WHERE id = 16;   -- was 1250
UPDATE recipes SET calories = 1492 WHERE id = 17;   -- was 1460
UPDATE recipes SET calories = 2006 WHERE id = 18;   -- was 1959
-- Step 1 marinates and step 4 cooks "chicken thigh" by name and to a thigh's timing.
-- Breast is leaner and overcooks faster; the wording and the timing both need revising in
-- the Phase 10 / Task 31 prose pass. No ingredient is added, so no new step is required.

-- -------------------------------------------------------------------------------------
-- Task 26 -- Family 9 (Lentil Stew), recipes 30/31/32. Protein 24.3/30.1/32.9 -> 39.8/46.3/50.0 g.
-- -------------------------------------------------------------------------------------
-- Fat and carbs already pass; only protein fails. Carbs above 50 % on Light is over-target
-- and explicitly not a reject.
-- diet-guidelines judgement: 400 g of tinned lentils is already 36 g protein whole-recipe
-- (18 g/srv). Reaching 35 g/srv from lentils alone needs ~780 g of tinned lentils per two
-- servings, which is not a bowl of stew -- that would be arithmetic compliance with no meal
-- behind it. This family is NOT vegetarian (Moderate and Balanced already contain chorizo),
-- so chicken breast is consistent with what the dish already is rather than a change of
-- identity. That is the honest lever.
-- Light also gets its olive oil raised 21 -> 24 g, which lifts fat from 23.3 % to 25.1 % --
-- just over the 25 % chef floor that findings.md flagged as reads-dry. Light carries no
-- chorizo, so it has no other fat source at all.
--
--            BEFORE                                     AFTER
--   30 Light   481  24.3  23.7  56.0  [P REJECT]        573  39.8  25.1  47.1   PASS
--   31 Moder   531  30.1  26.2  51.1  [P REJECT]        613  46.3  25.5  44.3   PASS
--   32 Balan   587  32.9  31.2  46.4  [P REJECT]        673  50.0  29.8  40.4   PASS
--   kcal ordering 573 < 613 < 673 -- holds. Light-to-Moderate is a 40 kcal gap, under the
--   advisory 80 kcal step; ordering is the hard rule and it is intact.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 30, 11, NULL, 100.00, 1, 100.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 30 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 31, 11, NULL, 105.00, 1, 105.00, 13
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 31 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 32, 11, NULL, 110.00, 1, 110.00, 13
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 32 AND (ingredient_id <=> 11) AND (linked_recipe_id <=> NULL));

UPDATE recipe_ingredients SET quantity = 1.75, quantity_grams = 24.00
WHERE recipe_id = 30 AND ingredient_id = 22;                -- Olive oil 1.5 -> 1.75 tbsp (21 -> 24 g)

UPDATE recipes SET calories = 1146 WHERE id = 30;   -- was 963
UPDATE recipes SET calories = 1226 WHERE id = 31;   -- was 1064
UPDATE recipes SET calories = 1346 WHERE id = 32;   -- was 1177
-- The chicken needs a step, and Light's step sequence is one shorter than its siblings'
-- (no chorizo), so the rewrite has to be per-recipe rather than per-family. Also owed: a
-- finishing acid and fresh parsley on all three. Phase 10 / Task 31.

-- -------------------------------------------------------------------------------------
-- Task 27 -- Family 10 (Lentil Stuffed Peppers), recipes 33/34/35.
--            Protein 18.5/24.2/29.8 -> 37.2/46.2/56.2 g. Fat 16.8-19.8 % -> 25.4-27.9 %.
-- -------------------------------------------------------------------------------------
-- Two rejects pulling in the same direction: protein misses by 5-16 g AND fat sits 5-8 pts
-- BELOW the 25 % floor -- the dry-and-bland failure mode from chef lens 1 in its clearest
-- form. Lens 4 called this an all-soft, one-note plate: soft filling inside soft pepper,
-- no cheese, no crunch, no herb, no acid.
-- diet-guidelines judgement: unlike family 9, this family IS genuinely vegetarian with no
-- meat in it, so adding poultry would change what the dish is. The honest lever is dairy
-- protein -- cottage cheese (169) folded through the filling, which also supplies the
-- moisture it lacks, plus a mozzarella (37) cap, which supplies the browned crust it is
-- missing. Two existing ingredients fix protein, fat % and the texture finding together.
--
--            BEFORE                                     AFTER
--   33 Light   391  18.5  19.8  61.3  [P REJECT]        562  37.2  27.9  45.6   PASS
--   34 Moder   484  24.2  16.8  63.1  [P REJECT]        684  46.2  25.4  47.6   PASS
--   35 Balan   608  29.8  19.2  61.2  [P REJECT]        850  56.2  27.1  46.5   PASS
--   kcal ordering 562 < 684 < 850 -- holds. Carbs 45-48 % is over the 40-50 % target on
--   none of them and is in any case not a reject above 50 %.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 33, 169, NULL, 200.00, 1, 200.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 33 AND (ingredient_id <=> 169) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 33, 37, NULL, 70.00, 1, 70.00, 13
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 33 AND (ingredient_id <=> 37) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 34, 169, NULL, 240.00, 1, 240.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 34 AND (ingredient_id <=> 169) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 34, 37, NULL, 80.00, 1, 80.00, 13
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 34 AND (ingredient_id <=> 37) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 35, 169, NULL, 280.00, 1, 280.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 35 AND (ingredient_id <=> 169) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 35, 37, NULL, 100.00, 1, 100.00, 13
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 35 AND (ingredient_id <=> 37) AND (linked_recipe_id <=> NULL));

UPDATE recipes SET calories = 1124 WHERE id = 33;   -- was 782
UPDATE recipes SET calories = 1367 WHERE id = 34;   -- was 969
UPDATE recipes SET calories = 1701 WHERE id = 35;   -- was 1217
-- Both additions need steps (fold the cottage cheese through the filling before stuffing;
-- scatter the mozzarella over for the last 10 minutes of the bake), plus the lemon and
-- torn basil the lens-4 finding asked for. Phase 10 / Task 31.

-- -------------------------------------------------------------------------------------
-- Task 28 -- Family 35 (Greek Chicken Gyros), recipes 118/119/120.
--            Fat 38.6-40.1 % -> ~28 %. Carbs 32.8-34.2 % -> ~39-40 %. Plus the
--            store-bought-basis calories bug CLAUDE.md names by this exact family.
-- -------------------------------------------------------------------------------------
-- Confirmed live at -12.1 / -15.5 / -12.9 %: stored calories were entered on the
-- STORE-BOUGHT basis (pita ingredient 157 at 265 kcal/100 g) while nutrition is computed on
-- the HOMEMADE basis (linked recipe 117 at 389 kcal/100 g). Per CLAUDE.md and the standing
-- memory note, nutrition always comes from the homemade linked recipe, so the column is
-- rewritten on the homemade basis below -- which is also why every AFTER figure here is
-- higher than the number the card used to show.
-- Levers: thigh -> breast is the fat lever (10 % -> 3.6 %); the olive oil and feta trims
-- finish it; the pita raise supplies the carbs. Protein passes comfortably throughout and
-- is not touched directly.
-- The pita rows are FR-103 dual-path (ingredient 157 AND linked 117), matched on
-- linked_recipe_id. All portions stay inside Pita Bread's 335 g yield (largest: 220 g) --
-- Pita Bread is an extra and is NOT modified ("don't audit extras").
--
--            BEFORE                                     AFTER
--  118 Light   604  41.1  38.6  34.2  [FAT, CARB, KCALCOL]  575  46.5  27.3  40.3  PASS
--  119 Moder   770  51.6  39.2  34.0  [FAT, CARB, KCALCOL]  719  58.1  27.8  39.9  PASS
--  120 Balan   967  65.4  40.1  32.8  [FAT, CARB, KCALCOL]  884  73.1  28.3  38.7  PASS
--   kcal ordering 575 < 719 < 884 -- holds.
UPDATE recipe_ingredients SET ingredient_id = 11
WHERE recipe_id IN (118,119,120) AND ingredient_id = 41;    -- Chicken thigh -> breast (200/250/320 g kept)

UPDATE recipe_ingredients SET quantity = 0.50, quantity_grams = 8.00
WHERE recipe_id = 118 AND ingredient_id = 22;               -- Olive oil 12 -> 8 g
UPDATE recipe_ingredients SET quantity = 0.75, quantity_grams = 10.00
WHERE recipe_id = 119 AND ingredient_id = 22;               -- Olive oil 16 -> 10 g
UPDATE recipe_ingredients SET quantity = 1.00, quantity_grams = 12.00
WHERE recipe_id = 120 AND ingredient_id = 22;               -- Olive oil 20 -> 12 g

UPDATE recipe_ingredients SET quantity = 140.00, quantity_grams = 140.00
WHERE recipe_id = 118 AND linked_recipe_id = 117;           -- Pita 120 -> 140 g (yield 335 g)
UPDATE recipe_ingredients SET quantity = 180.00, quantity_grams = 180.00
WHERE recipe_id = 119 AND linked_recipe_id = 117;           -- Pita 160 -> 180 g
UPDATE recipe_ingredients SET quantity = 220.00, quantity_grams = 220.00
WHERE recipe_id = 120 AND linked_recipe_id = 117;           -- Pita 200 -> 220 g

UPDATE recipe_ingredients SET quantity = 20.00, quantity_grams = 20.00
WHERE recipe_id = 118 AND ingredient_id = 154;              -- Feta 30 -> 20 g
UPDATE recipe_ingredients SET quantity = 28.00, quantity_grams = 28.00
WHERE recipe_id = 119 AND ingredient_id = 154;              -- Feta 40 -> 28 g
UPDATE recipe_ingredients SET quantity = 40.00, quantity_grams = 40.00
WHERE recipe_id = 120 AND ingredient_id = 154;              -- Feta 60 -> 40 g

UPDATE recipes SET calories = 1149 WHERE id = 118;  -- was 1062 (store-bought basis)
UPDATE recipes SET calories = 1438 WHERE id = 119;  -- was 1300 (store-bought basis)
UPDATE recipes SET calories = 1768 WHERE id = 120;  -- was 1686 (store-bought basis)
-- Owed to Phase 10 / Task 31: the marinade and cook steps name "thigh"; the homemade pita
-- path never tells the cook to warm the bread (the store-bought alt_instruction does); and
-- the tzatziki -- the component most likely to need salt -- has no taste-and-adjust.

-- -------------------------------------------------------------------------------------
-- Task 29 -- Families 42 and 43 (Salmon), recipes 139-141 and 142-144.
--            Fat 39.6-41.3 % -> ~33-34 %. Carbs 33.8-35.6 % -> ~40-43 %. Light protein up.
-- -------------------------------------------------------------------------------------
-- Near-identical failure shapes. Salmon is INTRINSICALLY 13 % fat, so the lever is to cut
-- the ADDED fat and raise the starch base -- the fish is not cut, and on Light it is raised,
-- because Light was also short on protein (33.0 g on 139, 33.3 g on 142).
-- CAVEAT CARRIED FORWARD: fat lands at 33.4-34.8 % on all six -- inside the band but with
-- little headroom. The olive oil trims are load-bearing and must not be reversed.
--
--            BEFORE                                     AFTER
--  139 Light   530  33.0  39.6  35.4  [P, FAT, CARB]    608  38.7  34.1  40.4   PASS
--  140 Moder   645  40.1  40.9  34.2  [FAT, CARB]       682  42.0  33.5  41.8   PASS
--  141 Balan   799  49.8  41.3  33.8  [FAT, CARB]       843  52.1  33.9  41.4   PASS
--   kcal ordering 608 < 682 < 843 -- holds.
UPDATE recipe_ingredients SET quantity = 300.00, quantity_grams = 300.00
WHERE recipe_id = 139 AND ingredient_id = 109;              -- Salmon Fillet 260 -> 300 g
UPDATE recipe_ingredients SET quantity = 1.25, quantity_grams = 6.00
WHERE recipe_id = 139 AND ingredient_id = 22;               -- Olive oil 12 -> 6 g
UPDATE recipe_ingredients SET quantity = 0.50, quantity_grams = 8.00
WHERE recipe_id = 140 AND ingredient_id = 22;               -- Olive oil 16 -> 8 g
UPDATE recipe_ingredients SET quantity = 0.75, quantity_grams = 10.00
WHERE recipe_id = 141 AND ingredient_id = 22;               -- Olive oil 20 -> 10 g
UPDATE recipe_ingredients SET quantity = 570.00, quantity_grams = 570.00
WHERE recipe_id = 139 AND ingredient_id = 121;              -- Potato 400 -> 570 g
UPDATE recipe_ingredients SET quantity = 670.00, quantity_grams = 670.00
WHERE recipe_id = 140 AND ingredient_id = 121;              -- Potato 480 -> 670 g
UPDATE recipe_ingredients SET quantity = 830.00, quantity_grams = 830.00
WHERE recipe_id = 141 AND ingredient_id = 121;              -- Potato 600 -> 830 g
UPDATE recipes SET calories = 1215 WHERE id = 139;  -- was 1060
UPDATE recipes SET calories = 1365 WHERE id = 140;  -- was 1267
UPDATE recipes SET calories = 1685 WHERE id = 141;  -- was 1576

-- Family 43 -- the same macro fix, PLUS decisions.md Sec.8: "make it genuinely
-- Mediterranean". Lens 4 found the name only half-earned: olive oil, lemon, dill and
-- broccoli are consistent with the claim, but sweet potato is not a Mediterranean staple
-- and there were no olives, no tomato and no oregano -- nothing that reads specifically of
-- the region. Cherry Tomatoes (116), Black Olives (117) and Dried oregano (35) are all
-- EXISTING rows and make the claim true at small macro cost. The developer approved the
-- dish-side remedy rather than a rename.
-- The olives are 11 % fat, which is why 142's olive portion is held to 20 g and its sweet
-- potato goes to 520 g rather than findings.md's 490 g -- without that, Light lands at
-- 34.8 % fat, 0.2 pts off a reject. This is a deliberate re-derivation, not the published
-- table.
--
--            BEFORE                                     AFTER (with Mediterranean additions)
--  142 Light   536  33.3  39.8  35.3  [P, FAT, CARB]    654  39.4  33.9  42.0   PASS
--  143 Moder   669  40.8  40.1  35.6  [FAT, CARB]       743  43.0  33.4  43.4   PASS
--  144 Balan   831  50.4  40.2  35.5  [FAT, CARB]       924  53.2  33.7  43.3   PASS
--   kcal ordering 654 < 743 < 924 -- holds.
UPDATE recipe_ingredients SET quantity = 300.00, quantity_grams = 300.00
WHERE recipe_id = 142 AND ingredient_id = 109;              -- Salmon Fillet 260 -> 300 g
UPDATE recipe_ingredients SET quantity = 1.25, quantity_grams = 6.00
WHERE recipe_id = 142 AND ingredient_id = 22;               -- Olive oil 12 -> 6 g
UPDATE recipe_ingredients SET quantity = 0.50, quantity_grams = 8.00
WHERE recipe_id = 143 AND ingredient_id = 22;               -- Olive oil 16 -> 8 g
UPDATE recipe_ingredients SET quantity = 0.75, quantity_grams = 10.00
WHERE recipe_id = 144 AND ingredient_id = 22;               -- Olive oil 20 -> 10 g
UPDATE recipe_ingredients SET quantity = 520.00, quantity_grams = 520.00
WHERE recipe_id = 142 AND ingredient_id = 15;               -- Sweet potato 340 -> 520 g
UPDATE recipe_ingredients SET quantity = 610.00, quantity_grams = 610.00
WHERE recipe_id = 143 AND ingredient_id = 15;               -- Sweet potato 440 -> 610 g
UPDATE recipe_ingredients SET quantity = 770.00, quantity_grams = 770.00
WHERE recipe_id = 144 AND ingredient_id = 15;               -- Sweet potato 560 -> 770 g

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 142, 116, NULL, 120.00, 1, 120.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 142 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 142, 117, NULL, 20.00, 1, 20.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 142 AND (ingredient_id <=> 117) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 142, 35, NULL, 0.50, 3, 1.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 142 AND (ingredient_id <=> 35) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 143, 116, NULL, 150.00, 1, 150.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 143 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 143, 117, NULL, 30.00, 1, 30.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 143 AND (ingredient_id <=> 117) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 143, 35, NULL, 0.50, 3, 1.00, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 143 AND (ingredient_id <=> 35) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 144, 116, NULL, 180.00, 1, 180.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 144 AND (ingredient_id <=> 116) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 144, 117, NULL, 40.00, 1, 40.00, 11
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 144 AND (ingredient_id <=> 117) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 144, 35, NULL, 0.75, 3, 1.50, 12
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 144 AND (ingredient_id <=> 35) AND (linked_recipe_id <=> NULL));

UPDATE recipes SET calories = 1307 WHERE id = 142;  -- was 1066
UPDATE recipes SET calories = 1487 WHERE id = 143;  -- was 1328
UPDATE recipes SET calories = 1848 WHERE id = 144;  -- was 1650
-- Owed to Phase 10 / Task 31 on both families: nothing currently tells the cook when to
-- start each component so sweet potato (24-30 min), salmon (10-13 min) and broccoli
-- (4-5 min) land together; raw crushed garlic is tossed through warm broccoli at step 5;
-- and family 43 now needs a step putting the cherry tomatoes and olives on the tray for
-- the last 12 minutes with the oregano.

-- -------------------------------------------------------------------------------------
-- Task 30 -- Family 8 (Salmon Sandwich), recipes 28/29 + a Light created from nothing.
-- -------------------------------------------------------------------------------------
-- The largest single piece of work in the phase. Moderate (28) failed ALL FOUR checks
-- (P 30.2 g, fat 40.5 %, carbs 34.5 %, calories -6.8 %); Balanced (29) failed fat and
-- carbs; and the family was structurally illegal at 2 members with the default on Balanced.
--
-- Lens 4 dish-breaker, and the reason this is more than a numbers fix: the whole recipe was
-- four rows -- Milk Bread, tinned salmon, salted butter, lettuce. Tinned salmon mashed with
-- butter and nothing else is flat and faintly metallic. Cottage cheese (169) replaces most
-- of the butter as the binder (11 P / 1.5 F per 100 g against 0.9 P / 81 F), which fixes
-- protein and fat % with one substitution and keeps the filling moist; lemon (88) and black
-- pepper (50) give it the acid and seasoning it had none of. All three are existing rows.
-- Milk Bread portions rise to carry carbs and all stay inside its 743 g yield (largest: 460
-- g). Milk Bread is an extra and is NOT modified.
--
--            BEFORE                                     AFTER
--   LIGHT      -- did not exist --                       439  35.9  26.8  40.5   PASS  (new, id 269)
--   28 Moder   485  30.2  40.5  34.5  [P,FAT,CARB,KCAL]  519  38.0  30.5  40.2   PASS
--   29 Balan   904  60.4  36.2  37.1  [FAT, CARB]        907  62.9  29.1  43.1   PASS
--   kcal ordering 439 < 519 < 907 -- holds.
--
-- !! PRE-FLIGHT CHECK BEFORE APPLYING THIS TASK !!
--   The new Light is inserted with an EXPLICIT id of 269 so that every statement below can
--   reference it as a literal -- a session variable will not survive the Railway console,
--   which commits per statement. Verified live 2026-08-18: MAX(recipes.id) = 268 and
--   recipes.AUTO_INCREMENT = 269, so 269 is free.
--   Run this first and confirm it returns 0:
--       SELECT COUNT(*) FROM recipes WHERE id = 269;
--   If it returns 1, STOP -- another recipe has taken the id. Every statement touching 269
--   below is additionally guarded on 269 actually being family 8's Light member, so a
--   collision makes this task a silent no-op rather than corrupting an unrelated recipe,
--   but it still needs a human to re-point the id before the Light will exist.

UPDATE recipe_ingredients SET quantity = 0.50, quantity_grams = 8.00
WHERE recipe_id = 28 AND ingredient_id = 53;                -- Salted butter 24 -> 8 g
UPDATE recipe_ingredients SET quantity = 240.00, quantity_grams = 240.00
WHERE recipe_id = 28 AND ingredient_id = 54;                -- Tinned salmon 213 -> 240 g
UPDATE recipe_ingredients SET quantity = 240.00, quantity_grams = 240.00
WHERE recipe_id = 28 AND linked_recipe_id = 26;             -- Milk Bread 200 -> 240 g (yield 743 g)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 28, 169, NULL, 60.00, 1, 60.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 28 AND (ingredient_id <=> 169) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 28, 88, NULL, 20.00, 1, 20.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 28 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 28, 50, NULL, 0.25, 3, 0.50, 7
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 28 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));

UPDATE recipe_ingredients SET quantity = 0.75, quantity_grams = 10.00
WHERE recipe_id = 29 AND ingredient_id = 53;                -- Salted butter 30 -> 10 g
UPDATE recipe_ingredients SET quantity = 460.00, quantity_grams = 460.00
WHERE recipe_id = 29 AND linked_recipe_id = 26;             -- Milk Bread 400 -> 460 g
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 29, 88, NULL, 30.00, 1, 30.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 29 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 29, 50, NULL, 0.50, 3, 1.00, 6
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 29 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));

UPDATE recipes SET calories = 1039 WHERE id = 28;   -- was 904
UPDATE recipes SET calories = 1815 WHERE id = 29;   -- was 1807

-- The new Light. Same recipes.name as its siblings -- no variant suffix; the label lives in
-- recipe_family_members.variant_label (lens 5 / .claude/rules/recipe-variants.md).
-- macros_audited stays 0: sign-off is Phase 10 / Task 32.
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 269, 'Salmon Sandwich', 2, 879, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id = 269)
  AND NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 8 AND variant_label = 'Light');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 8, 269, 0, 'Light', 1
WHERE EXISTS (SELECT 1 FROM recipes WHERE id = 269 AND name = 'Salmon Sandwich')
  AND NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE family_id = 8 AND variant_label = 'Light');

-- display_order was Moderate = 1, Balanced = 2 -- wrong once Light exists. Task 10 only
-- renumbered family 35; family 8 needs it too. is_default is already handled by Phase 4 /
-- Task 8 (family 8 is in that id list, and it sets the flag by variant_label, so the Light
-- inserted here is correctly left at 0).
UPDATE recipe_family_members
SET display_order = CASE variant_label
      WHEN 'Light' THEN 1 WHEN 'Moderate' THEN 2 WHEN 'Balanced' THEN 3 END
WHERE family_id = 8 AND variant_label IN ('Light','Moderate','Balanced');

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 269, 2                                               -- meal 2, matching siblings 28 and 29
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_meals WHERE recipe_id = 269 AND meal_id = 2);

-- Ingredients. Every insert is additionally guarded on 269 being family 8's Light, so an
-- id collision cannot write these rows onto an unrelated recipe.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, NULL, 26, 200.00, 1, 200.00, 1
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> NULL) AND (linked_recipe_id <=> 26));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, 54, NULL, 220.00, 1, 220.00, 2
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> 54) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, 169, NULL, 90.00, 1, 90.00, 3
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> 169) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, 47, NULL, 40.00, 1, 40.00, 4
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> 47) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, 88, NULL, 20.00, 1, 20.00, 5
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> 88) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 269, 50, NULL, 0.25, 3, 0.50, 6
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE recipe_id = 269 AND (ingredient_id <=> 50) AND (linked_recipe_id <=> NULL));

-- Parent -> child extras row, matching the existing 28 -> 26 and 29 -> 26 pattern.
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 269, 26, 0
WHERE EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = 269 AND family_id = 8 AND variant_label = 'Light')
  AND NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 269 AND child_recipe_id = 26);

-- Steps for the new Light. Step 1 carries linked_recipe_id = 26 AND a populated
-- alt_instruction -- a linked ingredient with no linked prep step is a hard reject under
-- .claude/rules/linked-recipe-extras.md. Guarded on the (recipe_id, step_number) natural
-- key, so a re-run is a no-op.
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 1, 'Prepare the milk bread according to the linked recipe. Use 200g -- 4 slices @ 50g each, 2 per person.', NULL, 26, 'Use 4 slices of store-bought bread (~50g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 2, 'Drain the tinned salmon well. Tip it into a bowl and mash with a fork, checking carefully for bones and removing any you find.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 3, 'Fold the cottage cheese through the mashed salmon until the filling holds together. It does the job butter was doing, with a fraction of the fat, and it keeps the filling moist rather than pasty.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 4, 'Squeeze in the lemon and grind over the black pepper. Taste it now and adjust -- tinned salmon without acid reads flat and slightly metallic, and this is the step that fixes it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 5, 'Wash the lettuce and dry it thoroughly -- wet leaves will soak into the bread.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 6, 'Lay the lettuce on 2 slices of bread, divide the salmon mixture between them (~165g per sandwich), and top with the remaining slices.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 269, 7, 'Cut each sandwich in half and serve.', 'Capers or chopped dill folded in with the lemon lift this further, and neither is on the ingredient list or changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 269 AND step_number = 7);
-- Recipes 28 and 29 keep their existing steps for now. Both are now WRONG in two places --
-- step 3 still buttering with "15g"/"30g" of butter that is now 8 g / 10 g, and step 5's
-- "~106g per sandwich" was already a copy-paste error (right on 28, wrong on 29) and is now
-- wrong on both -- and neither has a step for the cottage cheese, lemon or pepper added
-- above. That rewrite belongs to the Phase 10 / Task 31 prose pass, which owns family 8.
-- Flagged loudly here because until Task 31 lands, recipes 28 and 29 have ingredients the
-- cook is never told to use.

-- !! MANDATORY CHECK -- RUN THIS NOW, DO NOT SKIP IT !!
--   Must return 3. If it returns 2, recipe id 269 was already taken and the ENTIRE family 8
--   Light block above silently no-opped -- every statement is guarded, so nothing errored
--   and nothing was corrupted, but nothing was created either. Family 8 stays 2-member and
--   broken, and the Task 32 sign-off further down (`... WHERE id IN (269,28,29)`) will still
--   run without complaint, signing off a family that does not exist in its fixed form.
--   STOP and re-point the id before continuing past this line.
SELECT COUNT(*) AS family_8_members FROM recipe_family_members WHERE family_id = 8;

-- =====================================================================================
-- PHASE 9b -- decisions.md remediation that tasks.md has no task number for
-- =====================================================================================
-- decisions.md lists six pieces of work added at the Phase 2 gate with no corresponding
-- task. Four of them belong to this dispatch and are below: Sec.5 (families 96 and 95),
-- Sec.6 (family 106), Sec.1 (family 105). Sec.10 (family 22's step 0) landed inline with
-- Task 21 above; Sec.7 (family 93's sauce and pancetta) belongs to the cheat rework and is
-- out of scope for a macro-remediation pass, since family 93 left the audit entirely.

-- -------------------------------------------------------------------------------------
-- decisions.md Sec.5 -- Family 96 (Greek Yogurt & Granola Bowl), recipes 220/221/222.
-- -------------------------------------------------------------------------------------
-- !! THIS BLOCK SUPERSEDES THE EARLIER "PARTIAL YOGURT CUT" DECISION. DO NOT RESTORE IT. !!
--   An earlier revision of this file cut the yogurt to 580/600/640 g and raised the granola
--   to 100/135/170 g, and a follow-up ruling in decisions.md recorded "keep the partial
--   cut". Both are now void. The developer revised the decision on 2026-08-19 after two
--   errors in the original finding came to light, and after answering the one question that
--   unblocked it. Anyone reinstating the yogurt-cut-plus-granola-raise numbers is undoing a
--   deliberate change -- read the reasoning below first.
--
-- WHY THE EARLIER DECISION WAS WRONG
--   1. The finding overstated the portion. It called 450 g of Greek yogurt "a whole large
--      tub per person". A standard tub is 500 g, so 450 g is most of a standard tub, not a
--      large one. The rhetorical force of the finding was doing work the arithmetic did not
--      support.
--   2. It applied to ONE variant, not the family. Only Balanced (222) sat at 450 g/serving.
--      Light was 300 and Moderate 350 -- unremarkable for a yogurt bowl. Cutting all three
--      to fix an outlier on one of them was over-correction.
--   3. The cut cost real protein. Balanced fell 55.2 -> 43.5 g/serving, a loss of 11.7 g,
--      to solve a presentation complaint. Greek yogurt IS the protein in this bowl; cutting
--      it is cutting the thing the recipe is for.
--
-- WHAT UNBLOCKED IT
--   The earlier block reported, correctly, that no (yogurt x granola) cell satisfies both
--   the portion target and the macro standard -- granola is 12.26 P / 25.56 F per 100 g, so
--   buying protein with granola buys fat faster. It also said so plainly: "reaching
--   200-250 g of yogurt per serving needs a protein source this bowl does not have."
--   The developer supplied one. Whey protein isolate (ingredient 163, 80.65 P / 0.00 C /
--   1.61 F per 100 g) carries protein at almost no fat and no carb cost, which is exactly
--   the lever the grid search lacked. With whey in the bowl the yogurt can come DOWN on
--   Balanced -- further than the earlier cut managed -- while protein goes UP.
--
-- INGREDIENT 163 ALREADY EXISTS. NO NEW INGREDIENT IS CREATED.
--   Verified live 2026-08-19: `Whey protein isolate` id 163, used on 9 existing rows
--   (recipes 4/5/6 Frozen Banana Smoothie, 130/131/132 Overnight Oats, 187/192/193 Protein
--   Porridge), every one of them unit_id 1 with quantity = quantity_grams. The three rows
--   below follow that convention exactly. Creating a parallel "Protein powder" row would
--   violate .claude/rules/homemade-first-and-ingredient-dedup.md.
--
-- WHAT ACTUALLY CHANGES
--   Light   (220): yogurt UNCHANGED at 600 g. It was never the outlier. + 10 g whey.
--   Moder   (221): yogurt 700 -> 640 g. + 15 g whey.
--   Balan   (222): yogurt 900 -> 700 g -- a deeper cut than the superseded 640 g, and it
--                  still GAINS protein. + 25 g whey. The 450 g/serving outlier is gone
--                  (350 g/serving now) and nothing was traded for it.
--   Granola, mixed berries and honey are all UNCHANGED on all three variants. The earlier
--   granola raise existed only to backfill kcal lost with the yogurt; whey makes it
--   unnecessary, and leaving granola alone keeps Goodness Granola (213) untouched as an
--   extra should be.
--
--            BEFORE (live)                              AFTER
--  220 Light   453  36.2  27.5  40.6  pass              470  40.2  26.7  39.1   PASS
--  221 Moder   574  43.2  28.4  41.5  pass              581  46.2  27.9  40.2   PASS
--  222 Balan   729  55.2  28.1  41.6  pass              710  55.3  28.2  40.7   PASS
--   Recomputed from recipe_ingredients plus Goodness Granola prorated at its live 500 g
--   yield (61.30 P / 249.47 C / 127.80 F whole-recipe), Atwater 4/4/9 on unrounded totals.
--   Protein rises on every variant. kcal ordering 470 < 581 < 710 -- holds, and all three
--   now sit INSIDE their design bands (450-550 / 550-650 / 700-800), which the superseded
--   version did not manage on Balanced (698).
--   CARB FLOOR WATCH: whey adds protein with zero carbs, so carb % falls. Light lands at
--   39.1 %, the tightest carb margin in this family, against a 38 % reject -- 1.1 pts of
--   headroom. Do not cut Light's honey or berries without recomputing; either would push it
--   toward the floor.
UPDATE recipe_ingredients SET quantity = 640.00, quantity_grams = 640.00
WHERE recipe_id = 221 AND ingredient_id = 49;               -- Greek yogurt 700 -> 640 g (320 g/srv)
UPDATE recipe_ingredients SET quantity = 700.00, quantity_grams = 700.00
WHERE recipe_id = 222 AND ingredient_id = 49;               -- Greek yogurt 900 -> 700 g (350 g/srv)
-- Recipe 220's Greek yogurt stays at its live 600 g -- deliberately no statement for it.
-- Granola (linked 213) stays at its live 90 / 120 / 150 g, mixed berries at 130 / 160 / 200
-- and honey at 12 / 18 / 25 -- deliberately no statements for those either.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 220, 163, NULL, 10.00, 1, 10.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 220 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 221, 163, NULL, 15.00, 1, 15.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 221 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 222, 163, NULL, 25.00, 1, 25.00, 5
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 222 AND (ingredient_id <=> 163) AND (linked_recipe_id <=> NULL));
UPDATE recipes SET calories = 940  WHERE id = 220;  -- was 907  (whole-recipe, 470 x 2)
UPDATE recipes SET calories = 1162 WHERE id = 221;  -- was 1148 (whole-recipe, 581 x 2)
UPDATE recipes SET calories = 1421 WHERE id = 222;  -- was 1458 (whole-recipe, 710 x 2)

-- Step text names the amounts explicitly, so it is regenerated with the new grams -- this
-- is exactly why Phase 6 deliberately skipped family 96 in the prose pass. These steps
-- SUPERSEDE the yogurt-cut versions (290/300/320 g per bowl, granola 100/135/170 g) that an
-- earlier revision of this file wrote; those grams no longer exist in the data.
-- Two things change beyond the numbers:
--   1. A new step 1 whisks the whey into the yogurt BEFORE anything is assembled. Dry whey
--      dropped onto a finished bowl does not disperse -- it clumps, and the lumps do not
--      break up under a spoon. Added a third at a time, whisked smooth between additions,
--      it goes in clean. Without this instruction the whey row is invisible to the cook.
--   2. Everything downstream shifts by one step number.
-- linked_recipe_id 213 and its alt_instruction are carried through verbatim on the granola
-- step (dropping either is a hard reject), with the live 90/120/150 g figures restored.
-- Per-recipe wipe-and-re-insert, each re-insert guarded on (recipe_id, step_number).
DELETE FROM recipe_steps WHERE recipe_id = 220;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 220, 1, 'Whisk the 10g of whey protein isolate into the 600g of Greek yogurt until no dry powder is left. Add it a third at a time and whisk each addition smooth before the next -- tipped in all at once it clumps, and the lumps will not break up once the bowl is assembled.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 220 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 220, 2, 'Spoon the protein yogurt into two bowls (about 305g per bowl).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 220 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 220, 3, 'Top with 90g of the linked Goodness Granola (45g per bowl).', NULL, 213, 'Use 90g of store-bought granola instead (45g per bowl).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 220 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 220, 4, 'Scatter over the mixed berries.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 220 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 220, 5, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 220 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 221;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 221, 1, 'Whisk the 15g of whey protein isolate into the 640g of Greek yogurt until no dry powder is left. Add it a third at a time and whisk each addition smooth before the next -- tipped in all at once it clumps, and the lumps will not break up once the bowl is assembled.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 221 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 221, 2, 'Spoon the protein yogurt into two bowls (about 328g per bowl).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 221 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 221, 3, 'Top with 120g of the linked Goodness Granola (60g per bowl).', NULL, 213, 'Use 120g of store-bought granola instead (60g per bowl).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 221 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 221, 4, 'Scatter over the mixed berries.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 221 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 221, 5, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 221 AND step_number = 5);

DELETE FROM recipe_steps WHERE recipe_id = 222;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 222, 1, 'Whisk the 25g of whey protein isolate into the 700g of Greek yogurt until no dry powder is left. Add it a third at a time and whisk each addition smooth before the next -- tipped in all at once it clumps, and the lumps will not break up once the bowl is assembled.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 222 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 222, 2, 'Spoon the protein yogurt into two bowls (about 363g per bowl).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 222 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 222, 3, 'Top with 150g of the linked Goodness Granola (75g per bowl).', NULL, 213, 'Use 150g of store-bought granola instead (75g per bowl).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 222 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 222, 4, 'Scatter over the mixed berries.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 222 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 222, 5, 'Drizzle with honey and serve immediately -- the granola softens if left to sit.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 222 AND step_number = 5);

-- -------------------------------------------------------------------------------------
-- decisions.md Sec.5 (second half) -- Family 95 (Mixed Berry & Greek Yogurt Smoothie).
-- -------------------------------------------------------------------------------------
-- !! NO STATEMENTS. THIS FAMILY IS DELIBERATELY UNCHANGED. DO NOT ADD ANY. !!
--   An earlier revision of this file cut family 95's Greek yogurt 470/500/600 -> 450/460/490
--   g and rewrote recipes.calories to 903/1091/1355. That change is REVERTED and this block
--   SUPERSEDES it. If you are reading a diff and wondering where those six statements went:
--   they were removed on purpose on 2026-08-19, not lost.
--
-- WHY IT WAS REVERTED
--   The cut existed only because decisions.md Sec.5 ended "and 95 proportionally" -- family
--   95 was swept along with family 96's yogurt reduction rather than assessed on its own.
--   findings.md had already examined this family and explicitly ACCEPTED its portions with
--   no change proposed: 235 / 250 / 300 g per serving in a BLENDED DRINK, where bulk liquid
--   is the format. findings.md drew the contrast with family 96 in as many words -- "the
--   same ingredient at 450 g/serving in a BOWL is not defensible" -- so the finding was
--   always about the bowl, never about the smoothie.
--   There was no defect to fix here. The family passes every reject condition on its live
--   composition, and cutting it removed 1.0 / 2.0 / 5.5 g of protein per serving for nothing.
--
-- LIVE COMPOSITION, RECOMPUTED AND CONFIRMED PASSING 2026-08-19
--   Greek yogurt stays 470 / 500 / 600 g whole-recipe (235 / 250 / 300 g per serving), and
--   recipes.calories stays 915 / 1115 / 1422 -- all four figures verified against the live
--   DB, and the stored calories reproduce the recomputed whole-recipe kcal to within 1.
--
--             kcal  P g/srv  fat %  carb %
--  217 Light   457    37.3    27.7   39.7   PASS
--  218 Moder   558    41.2    30.1   40.4   PASS
--  219 Balan   711    50.6    32.6   38.9   PASS
--   Protein >= 35 g, fat <= 35 % (tightest: 219 at 32.6), carbs >= 38 % (tightest: 219 at
--   38.9). kcal ordering 457 < 558 < 711 -- holds. Nothing to remediate.
--
-- NO STEP REWRITE EITHER. Verified live 2026-08-19: all four steps on each of 217/218/219
-- name their ingredients but quote no gram weights ("Add the mixed berries, Greek yogurt,
-- milk, honey, chia seeds, walnuts, and salt to a blender"), so no prose anywhere in this
-- family depends on the portion sizes. The earlier revision never wrote steps for 217-219,
-- so there is nothing to undo here -- confirmed by inspection of the live recipe_steps rows,
-- which are byte-identical to what findings.md recorded. findings.md also returned "Nothing
-- to fix" on both lens 3 and lens 4 for this family.
--
-- IT STILL GETS SIGNED OFF. Passing with no change is an audit result, not an absence of
-- one. macros_audited = 1 on 217/218/219 is written in Phase 10 / Task 32 and stays there.

-- -------------------------------------------------------------------------------------
-- decisions.md Sec.6 -- Family 106 (Turkey Burger with Bun & Slaw), recipes 250/251/252.
--            All three fixes: mayonnaise dual-path link, vinegar in the slaw, patty rest.
-- -------------------------------------------------------------------------------------
-- 1. HOMEMADE-FIRST VIOLATION. The family used the raw Mayonnaise ingredient (87) while
--    the Mayonnaise recipe (62) exists and is live -- a violation under
--    .claude/rules/homemade-first-and-ingredient-dedup.md. Converted to an FR-103
--    dual-path row: ingredient_id 87 is KEPT as the store-bought fallback and
--    linked_recipe_id 62 is added, on ALL THREE variants so the toggle is consistent
--    across the family (a store-bought option present on some siblings but not others is
--    itself a reject). Nutrition now comes from the homemade side, per CLAUDE.md: 73.06 g
--    fat/100 g against the raw row's 79 -- a 7.3 % divergence, inside the 10 % tolerance.
--    Portions 10 / 12 / 18 g are all well inside Mayonnaise's 309 g yield.
-- 2. THE SLAW HAD NO ACID AT ALL -- mayonnaise, salt and pepper, and nothing sharp, while
--    being the component whose job is to cut a lean turkey patty. White Wine Vinegar (85)
--    is the existing row used ("cider vinegar" does not exist; no near-duplicate created).
--    Zero macros, decisive on the plate.
-- 3. NO REST on the patty before assembly. 30 seconds, added to the build step.
-- Margins here were the tightest in the whole audit -- Light sat 0.1 g over the protein
-- floor and 0.3 pts over the carb floor -- so all three were fully recomputed. Every
-- margin improves slightly.
--
--            BEFORE                                     AFTER
--  250 Light   515  35.1  34.4  38.3  pass (barely)     512  35.2  34.0  38.5   PASS
--  251 Moder   645  43.8  33.8  39.0  pass              642  43.9  33.4  39.2   PASS
--  252 Balan   778  53.2  34.5  38.2  pass              774  53.3  34.0  38.4   PASS
--   kcal ordering 512 < 642 < 774 -- holds.
UPDATE recipe_ingredients SET linked_recipe_id = 62
WHERE recipe_id IN (250,251,252) AND ingredient_id = 87 AND linked_recipe_id IS NULL;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 250, 85, NULL, 1.00, 3, 5.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 250 AND (ingredient_id <=> 85) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 251, 85, NULL, 1.00, 3, 5.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 251 AND (ingredient_id <=> 85) AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 252, 85, NULL, 1.50, 3, 7.00, 10
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 252 AND (ingredient_id <=> 85) AND (linked_recipe_id <=> NULL));

INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 250, 62, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 250 AND child_recipe_id = 62);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 251, 62, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 251 AND child_recipe_id = 62);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 252, 62, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 252 AND child_recipe_id = 62);

UPDATE recipes SET calories = 1024 WHERE id = 250;  -- was 1029
UPDATE recipes SET calories = 1283 WHERE id = 251;  -- was 1289
UPDATE recipes SET calories = 1547 WHERE id = 252;  -- was 1557

-- Steps: 5 -> 6. The new step 3 is the mandatory linked prep step for Mayonnaise, carrying
-- linked_recipe_id = 62 and a populated alt_instruction. The good existing craft is kept
-- verbatim -- do-not-overwork, the lightly-oiled pan and why, and the 74 C poultry
-- endpoint, which is non-negotiable and is already stated.
DELETE FROM recipe_steps WHERE recipe_id = 250;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 3, 'Make the mayonnaise using the linked recipe. Use 10g for the slaw.', NULL, 62, 'Measure out 10g of store-bought mayonnaise.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 4, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, the white wine vinegar, salt, and pepper. Taste it before it goes near the burger -- the vinegar is what cuts a lean turkey patty, so the slaw should read sharp, not just creamy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 5, 'Toast the cut side of the burger buns briefly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 250, 6, 'Rest the patties off the heat for 30 seconds, then build: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 250 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 251;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 3, 'Make the mayonnaise using the linked recipe. Use 12g for the slaw.', NULL, 62, 'Measure out 12g of store-bought mayonnaise.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 4, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, the white wine vinegar, salt, and pepper. Taste it before it goes near the burger -- the vinegar is what cuts a lean turkey patty, so the slaw should read sharp, not just creamy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 5, 'Toast the cut side of the burger buns briefly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 251, 6, 'Rest the patties off the heat for 30 seconds, then build: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 251 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 252;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 1, 'In a bowl, combine the turkey mince, breadcrumbs, egg, salt, and pepper. Mix gently and shape into 2 patties -- do not overwork the mixture.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 2, 'Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily). Cook the patties 5-6 minutes per side, until they reach 74°C (165°F) internally and are no longer pink in the middle.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 3, 'Make the mayonnaise using the linked recipe. Use 18g for the slaw.', NULL, 62, 'Measure out 18g of store-bought mayonnaise.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 4, 'Meanwhile, toss the shredded cabbage and carrot with the mayonnaise, the white wine vinegar, salt, and pepper. Taste it before it goes near the burger -- the vinegar is what cuts a lean turkey patty, so the slaw should read sharp, not just creamy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 5, 'Toast the cut side of the burger buns briefly.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 252, 6, 'Rest the patties off the heat for 30 seconds, then build: bottom bun, patty, a generous pile of slaw, bun lid. Serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 252 AND step_number = 6);

-- -------------------------------------------------------------------------------------
-- decisions.md Sec.1 -- Family 105, recipes 247/248/249. FULL REWORK + RENAME.
-- -------------------------------------------------------------------------------------
-- THE findings.md FIX TABLE FOR THIS FAMILY IS VOID. findings.md proposed correcting a
-- transposition (patty up, ham down to a garnish, bun kept) and published 540 / 669 / 825.
-- The developer rejected both options on the table and specified a different dish: pita
-- instead of a bun, and the ham removed entirely. Everything below is recomputed from
-- scratch against the live rows.
--
-- What was actually stored, verified live -- the clearest case in the audit of numbers
-- passing while the plate fails (zero macro rejects on all three variants):
--     Beef Burger Patties (95):  25 / 30 / 40 g   =  12.5-20 g of beef PER SERVING
--     Sliced Ham (108):         280 / 350 / 430 g =  140-215 g of ham PER SERVING
--     Brioche Burger Buns (94): 210 / 260 / 320 g =  1.5-2 buns PER SERVING
-- The macros passed BECAUSE ham is lean and protein-dense. A dish called "Beef Burger with
-- Bun, Lettuce, Tomato & Ham" was in fact a pile of ham with a smear of beef in it.
--
-- The five changes, per decisions.md Sec.1:
--  1. Sliced Ham (108) rows REMOVED outright.
--  2. Brioche Burger Buns (94) rows REMOVED outright.
--  3. Pita added as an FR-103 dual-path row -- linked_recipe_id 117 (homemade Pita Bread)
--     AND ingredient_id 157 (store-bought Pita Bread, P 8.50 / C 55.00 / F 1.20), copying
--     family 35's existing pattern exactly. With the mandatory linked prep step.
--  4. The raw patty ingredient (95) is REPLACED by a link to the Burger Patties recipe
--     (43) -- clearing the homemade-first violation and the transposed weight in one move.
--     Recipe 43 computes to 19.68 P / 5.38 C / 3.70 F per 100 g, far leaner than the
--     17 / 0 / 20 store-bought row, which is what makes a real 150-200 g patty feasible.
--     With the mandatory linked prep step.
--  5. The family and all three recipes are RENAMED. The old name promised a bun and ham
--     the dish no longer contains, which lens 5 rejects outright. Agreed exception to
--     plan.md's "no renaming beyond the ' - Diet' suffix" boundary (decisions.md Sec.1).
-- Also corrected while the dish is open: lettuce was 9-12 g PER SERVING (a single small
-- leaf) and tomato 12-18 g. Both raised to a real portion; macro cost is negligible.
--
-- Portions stay inside both linked yields: patty max 400 g of a 565 g yield; pita max
-- 210 g of a 335 g yield. Neither linked recipe is modified ("don't audit extras").
--
--            BEFORE                                     AFTER
--  247 Light   521  36.1  33.6  38.7  pass              485  38.0  23.3  45.4   PASS
--  248 Moder   645  44.9  33.5  38.6  pass              590  45.0  23.3  46.2   PASS
--  249 Balan   796  55.4  33.7  38.5  pass              696  52.1  23.3  46.8   PASS
--   kcal ordering 485 < 590 < 696 -- holds. Protein, fat % and carb % all pass.
--
-- KNOWN AND ACCEPTED -- read before "fixing" either of these:
--  (a) Fat lands at 23.3 % on all three, BELOW the 25 % chef floor. This is a quality flag,
--      NOT a reject (the reject is fat ABOVE 35 %). It is structural to the dish the
--      developer specified: the linked patty is 3.7 g fat/100 g and the pita 9.76, so both
--      components sit near 23-25 % fat by kcal and no portion ratio moves the composite.
--      Precedent for flagging rather than failing: findings.md accepted family 9 Light at
--      23.3 % and family 107 at 21.4-22.4 %. The honest remedy is a slice of cheese or a
--      pickle, which findings.md also recommended -- but adding an ingredient the developer
--      did not authorise is a recipe-design decision, so it is written into the step tip
--      (where it changes no macros) and reported instead.
--  (b) Homemade Pita Bread (117) computes to ~389 kcal/100 g against the store-bought row's
--      265 -- a divergence findings.md already flags as a data bug on family 35. Nutrition
--      comes from the homemade side per CLAUDE.md, so this family reads high. Recipe 117 is
--      an extra and is READ-ONLY: do not "fix" it here.

DELETE FROM recipe_ingredients WHERE recipe_id IN (247,248,249) AND ingredient_id = 108;   -- Sliced Ham out
DELETE FROM recipe_ingredients WHERE recipe_id IN (247,248,249) AND ingredient_id = 94;    -- Brioche Buns out

-- Raw patty row -> homemade link. Converting the existing row in place keeps sort_order 1
-- and is naturally idempotent: on a re-run no row matches ingredient_id = 95.
UPDATE recipe_ingredients SET ingredient_id = NULL, linked_recipe_id = 43,
       quantity = 300.00, unit_id = 1, quantity_grams = 300.00, sort_order = 1
WHERE recipe_id = 247 AND ingredient_id = 95;               -- 25 g raw -> 300 g linked (150 g/srv)
UPDATE recipe_ingredients SET ingredient_id = NULL, linked_recipe_id = 43,
       quantity = 350.00, unit_id = 1, quantity_grams = 350.00, sort_order = 1
WHERE recipe_id = 248 AND ingredient_id = 95;               -- 30 g raw -> 350 g linked (175 g/srv)
UPDATE recipe_ingredients SET ingredient_id = NULL, linked_recipe_id = 43,
       quantity = 400.00, unit_id = 1, quantity_grams = 400.00, sort_order = 1
WHERE recipe_id = 249 AND ingredient_id = 95;               -- 40 g raw -> 400 g linked (200 g/srv)

-- Pita, FR-103 dual-path: BOTH ingredient_id 157 and linked_recipe_id 117 set on one row,
-- matching family 35's rows exactly. Nutrition comes from 117; 157 is the shopping-list
-- fallback only.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 247, 157, 117, 140.00, 1, 140.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 247 AND (ingredient_id <=> 157) AND (linked_recipe_id <=> 117));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 248, 157, 117, 175.00, 1, 175.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 248 AND (ingredient_id <=> 157) AND (linked_recipe_id <=> 117));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 249, 157, 117, 210.00, 1, 210.00, 2
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 249 AND (ingredient_id <=> 157) AND (linked_recipe_id <=> 117));

UPDATE recipe_ingredients SET quantity = 40.00, quantity_grams = 40.00, sort_order = 3
WHERE recipe_id = 247 AND ingredient_id = 47;               -- Lettuce 18 -> 40 g
UPDATE recipe_ingredients SET quantity = 50.00, quantity_grams = 50.00, sort_order = 3
WHERE recipe_id = 248 AND ingredient_id = 47;               -- Lettuce 20 -> 50 g
UPDATE recipe_ingredients SET quantity = 60.00, quantity_grams = 60.00, sort_order = 3
WHERE recipe_id = 249 AND ingredient_id = 47;               -- Lettuce 25 -> 60 g
UPDATE recipe_ingredients SET quantity = 60.00, quantity_grams = 60.00, sort_order = 4
WHERE recipe_id = 247 AND ingredient_id = 48;               -- Tomato 25 -> 60 g
UPDATE recipe_ingredients SET quantity = 80.00, quantity_grams = 80.00, sort_order = 4
WHERE recipe_id = 248 AND ingredient_id = 48;               -- Tomato 30 -> 80 g
UPDATE recipe_ingredients SET quantity = 100.00, quantity_grams = 100.00, sort_order = 4
WHERE recipe_id = 249 AND ingredient_id = 48;               -- Tomato 35 -> 100 g
UPDATE recipe_ingredients SET quantity = 1.00, quantity_grams = 5.00, sort_order = 5
WHERE recipe_id = 247 AND ingredient_id = 86;               -- Dijon 0.8 -> 1 tsp
UPDATE recipe_ingredients SET quantity = 1.25, quantity_grams = 6.00, sort_order = 5
WHERE recipe_id = 248 AND ingredient_id = 86;               -- Dijon 1 -> 1.25 tsp
UPDATE recipe_ingredients SET quantity = 1.50, quantity_grams = 8.00, sort_order = 5
WHERE recipe_id = 249 AND ingredient_id = 86;               -- Dijon 1.2 -> 1.5 tsp
UPDATE recipe_ingredients SET sort_order = 6 WHERE recipe_id IN (247,248,249) AND ingredient_id = 50;
UPDATE recipe_ingredients SET sort_order = 7 WHERE recipe_id IN (247,248,249) AND ingredient_id = 5;

INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 247, 43, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 247 AND child_recipe_id = 43);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 247, 117, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 247 AND child_recipe_id = 117);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 248, 43, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 248 AND child_recipe_id = 43);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 248, 117, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 248 AND child_recipe_id = 117);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 249, 43, 0 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 249 AND child_recipe_id = 43);
INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT 249, 117, 1 WHERE NOT EXISTS (SELECT 1 FROM recipe_extras WHERE parent_recipe_id = 249 AND child_recipe_id = 117);

-- Rename. recipes.name and recipe_families.family_name are kept identical so the two stay
-- aligned, and all three variants share one name -- the variant lives in
-- recipe_family_members.variant_label, never in the recipe name.
UPDATE recipes SET name = 'Beef Burger in Pita with Lettuce & Tomato' WHERE id IN (247,248,249);
UPDATE recipe_families SET family_name = 'Beef Burger in Pita with Lettuce & Tomato' WHERE id = 105;

UPDATE recipes SET calories = 971  WHERE id = 247;  -- was 1040
UPDATE recipes SET calories = 1181 WHERE id = 248;  -- was 1289
UPDATE recipes SET calories = 1391 WHERE id = 249;  -- was 1593

-- Steps: complete rewrite, because the dish has completely changed. Two linked prep steps
-- are mandatory here -- one per linked_recipe_id on the ingredient rows (43 and 117) --
-- each carrying a populated alt_instruction. Step 1's old text ("cook the burger patties
-- according to package directions") deferred to a packet, gave no internal temperature, no
-- rest and no warning against pressing the patty; all four are fixed.
DELETE FROM recipe_steps WHERE recipe_id = 247;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 1, 'Prepare the burger patties according to the linked recipe. Use 300g of mixture, shaped into 2 patties of about 150g each, and press a shallow dimple into the centre of each so they stay flat as they cook.', NULL, 43, 'Use 2 store-bought beef burger patties (~150g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 2, 'Pat the patties dry and season them. Heat a heavy pan over medium-high until it just begins to smoke, then sear 3-4 minutes per side to 71°C internally. Do not press down on them -- pressing squeezes out the juice that keeps the patty moist, and buys nothing back.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 3, 'Move the patties to a warm plate and rest 3 minutes while you assemble. Pour any juices that collect back over them before serving.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 4, 'Prepare the pita according to the linked recipe. Use 140g (2 pitas @ 70g each), and warm each one in a dry pan for 30 seconds a side until it puffs and turns pliable.', NULL, 117, 'Warm 140g of store-bought pita (2 pitas) in a dry pan for 30 seconds a side.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 5, 'Split each warm pita open. Spread the inside with the Dijon mustard, then line it with the lettuce and sliced tomato so the bread is protected from the patty juices.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 247, 6, 'Slide a rested patty into each pita, season the top with the salt and pepper, and serve immediately while the bread is still warm.', 'This is a deliberately lean build -- the linked Burger Patties are only 3.7g fat per 100g -- so it sits below the fat level that usually makes a burger taste rich. A slice of cheese melted over the patty in the last minute of cooking, or a few sliced pickles for sharpness, is what this sandwich is missing. Neither is on the ingredient list and neither is costed into the macros above.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 247 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 248;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 1, 'Prepare the burger patties according to the linked recipe. Use 350g of mixture, shaped into 2 patties of about 175g each, and press a shallow dimple into the centre of each so they stay flat as they cook.', NULL, 43, 'Use 2 store-bought beef burger patties (~175g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 2, 'Pat the patties dry and season them. Heat a heavy pan over medium-high until it just begins to smoke, then sear 3-4 minutes per side to 71°C internally. Do not press down on them -- pressing squeezes out the juice that keeps the patty moist, and buys nothing back.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 3, 'Move the patties to a warm plate and rest 3 minutes while you assemble. Pour any juices that collect back over them before serving.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 4, 'Prepare the pita according to the linked recipe. Use 175g (2 pitas @ about 88g each), and warm each one in a dry pan for 30 seconds a side until it puffs and turns pliable.', NULL, 117, 'Warm 175g of store-bought pita (2 pitas) in a dry pan for 30 seconds a side.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 5, 'Split each warm pita open. Spread the inside with the Dijon mustard, then line it with the lettuce and sliced tomato so the bread is protected from the patty juices.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 248, 6, 'Slide a rested patty into each pita, season the top with the salt and pepper, and serve immediately while the bread is still warm.', 'This is a deliberately lean build -- the linked Burger Patties are only 3.7g fat per 100g -- so it sits below the fat level that usually makes a burger taste rich. A slice of cheese melted over the patty in the last minute of cooking, or a few sliced pickles for sharpness, is what this sandwich is missing. Neither is on the ingredient list and neither is costed into the macros above.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 248 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 249;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 1, 'Prepare the burger patties according to the linked recipe. Use 400g of mixture, shaped into 2 patties of about 200g each, and press a shallow dimple into the centre of each so they stay flat as they cook.', NULL, 43, 'Use 2 store-bought beef burger patties (~200g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 2, 'Pat the patties dry and season them. Heat a heavy pan over medium-high until it just begins to smoke, then sear 4 minutes per side to 71°C internally -- these are thick patties, so give them the extra minute. Do not press down on them.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 3, 'Move the patties to a warm plate and rest 3 minutes while you assemble. Pour any juices that collect back over them before serving.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 4, 'Prepare the pita according to the linked recipe. Use 210g (2 pitas @ 105g each), and warm each one in a dry pan for 30 seconds a side until it puffs and turns pliable.', NULL, 117, 'Warm 210g of store-bought pita (2 pitas) in a dry pan for 30 seconds a side.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 5, 'Split each warm pita open. Spread the inside with the Dijon mustard, then line it with the lettuce and sliced tomato so the bread is protected from the patty juices.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 249, 6, 'Slide a rested patty into each pita, season the top with the salt and pepper, and serve immediately while the bread is still warm.', 'This is a deliberately lean build -- the linked Burger Patties are only 3.7g fat per 100g -- so it sits below the fat level that usually makes a burger taste rich. A slice of cheese melted over the patty in the last minute of cooking, or a few sliced pickles for sharpness, is what this sandwich is missing. Neither is on the ingredient list and neither is costed into the macros above.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 249 AND step_number = 6);

-- =====================================================================================
-- Phases 10 and 11 landed 2026-08-18 and follow below. Phases 12-13 append at the end.
-- =====================================================================================

-- =====================================================================================
-- PHASE 10 -- Prose pass and sign-off for the remediated families
-- =====================================================================================
--
-- ENCODING: UTF-8, same as Phase 6 onward. Degree signs (200°C, 74°C) are carried through
-- verbatim from the stored text and from the sibling families rewritten in Phase 6.
--
-- METHOD: per-recipe wipe-and-re-insert, exactly as Phase 6. Every DELETE is scoped to a
-- single recipe_id -- never a range, never a family -- and every INSERT is guarded on the
-- (recipe_id, step_number) natural key so a re-run is a no-op. No cascading UPDATE of
-- step_number anywhere: that column is half of a unique key and mid-sequence renumbering
-- collides.
--
-- LINKED STEPS ARE CARRIED THROUGH VERBATIM. Every step that held a linked_recipe_id and
-- an alt_instruction still holds them below, with only the gram figure updated to the
-- post-remediation portion:
--     13/14/15 step 1 -> Pizza Dough 11      13/14/15 step 2 -> Pizza Sauce 12
--     28/29    step 1 -> Milk Bread 26       81/82/83 step 6 -> Fresh Pasta 36
--     118/119/120 steps 3 AND 5 -> Pita Bread 117 (the prep step and the consuming step,
--                 per the chef skill's "consuming step should also carry it" pattern)
-- A linked recipe_ingredients row with no matching linked recipe_steps row is a hard
-- reject under .claude/rules/linked-recipe-extras.md.
--
-- WHERE THE FIX LANDS -- instruction vs tip. Unchanged from Phase 6 and applied again
-- here: a lens-4 fix that needs an ingredient which is NOT on the recipe (lemon, parsley,
-- basil, capers, cider vinegar, wine, chilli, cheese, pickles) goes in recipe_steps.tip.
-- The instruction stays cookable from the ingredient list alone, the shopping list stays
-- correct, and the macros do not move -- which is what lets Task 32 sign these families
-- off against the figures Phases 8 and 9 computed.
--
-- WHICH FAMILIES ARE REWRITTEN HERE, AND WHICH ARE NOT
--   REWRITTEN: 1, 4, 5, 8 (28 and 29), 9, 10, 23, 35, 42, 43.
--   TIP-ONLY UPDATE: 22 -- see the note above that block.
--   ALREADY WRITTEN, NOT TOUCHED AGAIN:
--     269 (family 8's new Light) -- full step set written in Phase 9 / Task 30.
--     96 (220-222), 106 (250-252), 105 (247-249) -- all three rewritten in Phase 9b
--        against their final compositions. 105 was verified this run: its steps describe
--        the pita dish the rework produced, both linked steps (Burger Patties 43 at step 1,
--        Pita Bread 117 at step 4) carry alt_instruction, and no removed ingredient
--        (ham, brioche bun) is named anywhere in the text. No rewrite needed.
--     95 (217-219) -- VERIFIED AND DELIBERATELY LEFT ALONE, on two independent grounds.
--        First, Phase 9b no longer changes this family at all: the yogurt cut it once made
--        (470/500/600 -> 450/460/490 g) was reverted on 2026-08-19, so there is no new
--        composition for the prose to fall out of step with. Second, even if there were,
--        all four steps were read from the live DB this run and none of them quotes a gram
--        figure ("Add the mixed berries, Greek yogurt, milk, honey, chia seeds, walnuts,
--        and salt to a blender"), so the "stale grams" pattern that forced the rewrites
--        below never applied here. findings.md also recorded "Nothing to fix" on both lens
--        3 and lens 4. Signed off in Task 32 with no prose write.
--
-- EVERY FIGURE QUOTED IN THE PROSE BELOW WAS RECOMPUTED LIVE THIS RUN, not copied from
-- findings.md. All 15 families to be signed off were re-derived from recipe_ingredients
-- plus prorated linked recipes with the Phase 3-9 deltas applied, and every one reproduced
-- the AFTER figures those phases published. The full table is in the Task 32 block.

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 1 -- Peanut Butter Porridge with Berries & Walnuts, recipes 1/2/3.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 24 reworked and renamed this family: whey isolate 30/40/50 g in, Greek
-- yogurt in at a sane 160/180/200 g, peanut butter UP to 22/31/40 g as the dish identity,
-- almonds OUT. The stored steps predate all of it -- 4 steps, no yogurt, no whey, and they
-- still tell the cook to chop almonds that are no longer on the list.
-- Also fixed here, from findings.md lens 3: "Set heat to 7/9" (a dial position on one
-- specific hob, and the only heat cue in the recipe); peanut butter dropped on top at the
-- end instead of stirred through; nuts chopped and salted but never toasted; and no
-- taste-and-adjust anywhere.
-- TWO OFF-THE-HEAT RULES, both load-bearing: whey seizes into grains if it hits a
-- simmering pan, and yogurt splits. The whey also goes in as a slurry in reserved cold
-- milk rather than as dry powder, which is why step 2 holds 3 tbsp back.
-- Lens 4 wanted a warm spice; cinnamon is not on the ingredient list, so it stays a tip.

DELETE FROM recipe_steps WHERE recipe_id = 1;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 1, 'Roughly chop the walnuts. Toast them dry in a small pan over medium heat for 2-3 minutes, shaking often, until they smell nutty and darken a shade. Tip them straight out onto a plate -- left in the hot pan they keep colouring -- and season with a small pinch of the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 2, 'Measure the milk and set 3 tbsp of it aside cold for the protein powder later. Bring the rest of the milk, the water and the remaining salt to a gentle boil in a saucepan over medium-high heat. You want a lively simmer with bubbles breaking the surface, not a hard rolling boil -- milk catches on the base of the pan the moment it goes too far.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 3, 'Stir in the rolled oats. Reduce the heat to medium-low and cook 4-5 minutes, stirring often, until the oats have drunk the liquid and the porridge falls thickly from the spoon rather than pouring.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 4, 'Take the pan off the heat and stir the 22g of peanut butter through the hot oats until it melts completely and no streaks remain. This is the flavour the bowl is built on, so give it a proper stir -- spooned on top at the end it just sits there as a lump.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 5, 'Whisk the 30g of whey protein isolate into the 3 tbsp of cold milk you set aside until it is a smooth slurry with no dry lumps, then stir that through the porridge. Keep the pan off the heat: whey tipped into a simmering pan seizes into grains you cannot whisk out, and dry powder shaken straight onto porridge clumps.', 'Slurry first, always. Two minutes with a fork in a cup is the difference between a silky bowl and one full of chalky lumps.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 6, 'Fold in the 160g of Greek yogurt a third at a time, still off the heat -- stirred into boiling oats it splits and turns grainy. Then taste it. Stir in the honey a little at a time and correct the salt. Porridge is flat until it is properly seasoned, and once the toppings are on it is too late to fix.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 1, 7, 'Divide between two bowls. Scatter over the toasted walnuts and the 100g of berries and serve immediately, while the walnuts are still crisp.', 'A pinch of cinnamon folded in with the yogurt gives this the warm note it is missing. It is not on the ingredient list and it does not move the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 1 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 2;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 1, 'Roughly chop the walnuts. Toast them dry in a small pan over medium heat for 2-3 minutes, shaking often, until they smell nutty and darken a shade. Tip them straight out onto a plate -- left in the hot pan they keep colouring -- and season with a small pinch of the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 2, 'Measure the milk and set 3 tbsp of it aside cold for the protein powder later. Bring the rest of the milk, the water and the remaining salt to a gentle boil in a saucepan over medium-high heat. You want a lively simmer with bubbles breaking the surface, not a hard rolling boil -- milk catches on the base of the pan the moment it goes too far.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 3, 'Stir in the rolled oats. Reduce the heat to medium-low and cook 4-5 minutes, stirring often, until the oats have drunk the liquid and the porridge falls thickly from the spoon rather than pouring.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 4, 'Take the pan off the heat and stir the 31g of peanut butter through the hot oats until it melts completely and no streaks remain. This is the flavour the bowl is built on, so give it a proper stir -- spooned on top at the end it just sits there as a lump.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 5, 'Whisk the 40g of whey protein isolate into the 3 tbsp of cold milk you set aside until it is a smooth slurry with no dry lumps, then stir that through the porridge. Keep the pan off the heat: whey tipped into a simmering pan seizes into grains you cannot whisk out, and dry powder shaken straight onto porridge clumps.', 'Slurry first, always. Two minutes with a fork in a cup is the difference between a silky bowl and one full of chalky lumps.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 6, 'Fold in the 180g of Greek yogurt a third at a time, still off the heat -- stirred into boiling oats it splits and turns grainy. Then taste it. Stir in the honey a little at a time and correct the salt. Porridge is flat until it is properly seasoned, and once the toppings are on it is too late to fix.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 2, 7, 'Divide between two bowls. Scatter over the toasted walnuts and the 130g of berries and serve immediately, while the walnuts are still crisp.', 'A pinch of cinnamon folded in with the yogurt gives this the warm note it is missing. It is not on the ingredient list and it does not move the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 2 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 3;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 1, 'Roughly chop the walnuts. Toast them dry in a small pan over medium heat for 2-3 minutes, shaking often, until they smell nutty and darken a shade. Tip them straight out onto a plate -- left in the hot pan they keep colouring -- and season with a small pinch of the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 2, 'Measure the milk and set 3 tbsp of it aside cold for the protein powder later. Bring the rest of the milk, the water and the remaining salt to a gentle boil in a saucepan over medium-high heat. You want a lively simmer with bubbles breaking the surface, not a hard rolling boil -- milk catches on the base of the pan the moment it goes too far.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 3, 'Stir in the rolled oats. Reduce the heat to medium-low and cook 4-5 minutes, stirring often, until the oats have drunk the liquid and the porridge falls thickly from the spoon rather than pouring.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 4, 'Take the pan off the heat and stir the 40g of peanut butter through the hot oats until it melts completely and no streaks remain. This is the flavour the bowl is built on, so give it a proper stir -- spooned on top at the end it just sits there as a lump.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 5, 'Whisk the 50g of whey protein isolate into the 3 tbsp of cold milk you set aside until it is a smooth slurry with no dry lumps, then stir that through the porridge. Keep the pan off the heat: whey tipped into a simmering pan seizes into grains you cannot whisk out, and dry powder shaken straight onto porridge clumps.', 'Slurry first, always. Two minutes with a fork in a cup is the difference between a silky bowl and one full of chalky lumps.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 6, 'Fold in the 200g of Greek yogurt a third at a time, still off the heat -- stirred into boiling oats it splits and turns grainy. Then taste it. Stir in the honey a little at a time and correct the salt. Porridge is flat until it is properly seasoned, and once the toppings are on it is too late to fix.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 3, 7, 'Divide between two bowls. Scatter over the toasted walnuts and the 160g of berries and serve immediately, while the walnuts are still crisp.', 'A pinch of cinnamon folded in with the yogurt gives this the warm note it is missing. It is not on the ingredient list and it does not move the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 3 AND step_number = 7);
-- -------------------------------------------------------------------------------------
-- Task 31 / Family 4 -- Pizza, recipes 13/14/15.
-- -------------------------------------------------------------------------------------
-- Phase 8 / Task 22 raised the dough on all three (200/260/340 -> 240/290/370 g) and cut
-- recipe 13's oversized chicken (220 -> 180 g). Step 1 quoted the old dough weight per
-- person and step 8 quoted the old per-pizza toppings, so both are regenerated per variant
-- from the final recipe_ingredients rather than hand-maintained -- which is exactly the
-- editing error findings.md caught (one variant reading 25g mozzarella with 110g chicken,
-- another 50g with 100g).
-- Lens 3: step 4 seared chicken breast "in a hot dry pan", which sticks and tears. It now
-- gets a film of oil taken from the pizza's own share. Lens 4 wanted a green at the door;
-- basil and rocket are not on the ingredient list, so they are a tip.
-- Both linked steps are preserved: step 1 -> Pizza Dough (11), step 2 -> Pizza Sauce (12),
-- each with its alt_instruction updated to the new gram figure.

DELETE FROM recipe_steps WHERE recipe_id = 13;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 1, 'Prepare the pizza dough according to the linked recipe. Use 240g total -- 120g per person, one base each.', NULL, 11, 'Remove 240g store-bought pizza dough from the fridge 30 minutes before use.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 2, 'Make the pizza sauce using the linked recipe. Use 70g total -- 35g per pizza.', NULL, 12, 'Measure out 70g store-bought pizza sauce.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 3, 'Preheat the oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes. The stone has to be properly loaded with heat or the base will never crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 4, 'Slice the chicken breast into thin strips and season with salt and pepper. Heat a pan over medium-high with a thin film of oil -- chicken breast in a dry pan sticks and tears rather than colouring -- and sear the strips 2-3 minutes per side until just cooked through. Set aside; they will get a second hit of heat on the pizza.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 5, 'Slice the mushrooms thinly, about 3mm thick.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 6, 'On a floured surface, stretch each 120g dough portion into a thin 7-inch circle. Transfer to parchment paper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 7, 'Spread 35g of sauce evenly over each base, leaving a 1cm border.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 8, 'Tear 25g of mozzarella over each pizza, then add 90g of the seared chicken and 30g of sliced mushrooms per base. Keep the toppings in a single layer -- piled up they steam and the base goes soft.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 9, 'Carefully slide each pizza, still on its paper, onto the hot tray or stone.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 10, 'Bake 8-10 minutes, until the crust is golden and the cheese is bubbling with brown spots.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 13, 11, 'Rest 2 minutes before slicing -- straight out of the oven the cheese slides off the moment the knife goes in. Serve immediately.', 'This wants a green at the door: torn basil scattered over as it comes out, or a handful of rocket dropped on after the bake. Neither is on the ingredient list and neither is costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 13 AND step_number = 11);

DELETE FROM recipe_steps WHERE recipe_id = 14;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 1, 'Prepare the pizza dough according to the linked recipe. Use 290g total -- 145g per person, one base each.', NULL, 11, 'Remove 290g store-bought pizza dough from the fridge 30 minutes before use.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 2, 'Make the pizza sauce using the linked recipe. Use 90g total -- 45g per pizza.', NULL, 12, 'Measure out 90g store-bought pizza sauce.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 3, 'Preheat the oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes. The stone has to be properly loaded with heat or the base will never crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 4, 'Slice the chicken breast into thin strips and season with salt and pepper. Heat a pan over medium-high with a thin film of oil -- chicken breast in a dry pan sticks and tears rather than colouring -- and sear the strips 2-3 minutes per side until just cooked through. Set aside; they will get a second hit of heat on the pizza.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 5, 'Slice the mushrooms thinly, about 3mm thick.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 6, 'On a floured surface, stretch each 145g dough portion into an 8-inch circle. Transfer to parchment paper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 7, 'Spread 45g of sauce evenly over each base, leaving a 1cm border.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 8, 'Tear 35g of mozzarella over each pizza, then add 100g of the seared chicken and 40g of sliced mushrooms per base. Keep the toppings in a single layer -- piled up they steam and the base goes soft.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 9, 'Carefully slide each pizza, still on its paper, onto the hot tray or stone.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 10, 'Bake 8-12 minutes, until the crust is golden and the cheese is bubbling with brown spots.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 14, 11, 'Rest 2 minutes before slicing -- straight out of the oven the cheese slides off the moment the knife goes in. Serve immediately.', 'This wants a green at the door: torn basil scattered over as it comes out, or a handful of rocket dropped on after the bake. Neither is on the ingredient list and neither is costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 14 AND step_number = 11);

DELETE FROM recipe_steps WHERE recipe_id = 15;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 1, 'Prepare the pizza dough according to the linked recipe. Use 370g total -- 185g per person, one base each.', NULL, 11, 'Remove 370g store-bought pizza dough from the fridge 30 minutes before use.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 2, 'Make the pizza sauce using the linked recipe. Use 110g total -- 55g per pizza.', NULL, 12, 'Measure out 110g store-bought pizza sauce.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 3, 'Preheat the oven to its maximum temperature (usually 250°C) with a baking tray or pizza stone inside for at least 30 minutes. The stone has to be properly loaded with heat or the base will never crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 4, 'Slice the chicken breast into thin strips and season with salt and pepper. Heat a pan over medium-high with a thin film of oil -- chicken breast in a dry pan sticks and tears rather than colouring -- and sear the strips 2-3 minutes per side until just cooked through. Set aside; they will get a second hit of heat on the pizza.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 5, 'Slice the mushrooms thinly, about 3mm thick.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 6, 'On a floured surface, stretch each 185g dough portion into a 9-inch circle. Transfer to parchment paper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 7, 'Spread 55g of sauce evenly over each base, leaving a 1cm border.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 8, 'Tear 50g of mozzarella over each pizza, then add 100g of the seared chicken and 50g of sliced mushrooms per base. Keep the toppings in a single layer -- piled up they steam and the base goes soft.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 9, 'Carefully slide each pizza, still on its paper, onto the hot tray or stone.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 10, 'Bake 8-12 minutes, until the crust is golden and the cheese is bubbling with brown spots.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 15, 11, 'Rest 2 minutes before slicing -- straight out of the oven the cheese slides off the moment the knife goes in. Serve immediately.', 'This wants a green at the door: torn basil scattered over as it comes out, or a handful of rocket dropped on after the bake. Neither is on the ingredient list and neither is costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 15 AND step_number = 11);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 5 -- Chicken Satay, recipes 16/17/18.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 25 swapped chicken THIGH for BREAST (ingredient 41 -> 11) at the same
-- gram weights, halved the coconut milk and roughly doubled the rice. Steps 1 and 8 name
-- "thigh" by name and step 8 gives a thigh's timing (3-4 min per side); breast at those
-- times is dry and stringy. Both are rewritten, and step 8 now says why.
-- Worcestershire STAYS in step 5 per decisions.md Sec.3 -- the developer confirmed it, and
-- at 9/9/14 g it is roughly 10 mg of purines against the ~180-200 mg in a beef serving.
-- The step text is unchanged on that point deliberately; this is not an oversight.
-- Lens 4 found no heat in the dish. Chilli is not on the ingredient list, so it is a tip.

DELETE FROM recipe_steps WHERE recipe_id = 16;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 1, 'Brine the chicken: cut the chicken breast into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water, submerge the chicken and refrigerate 15-20 minutes. Rinse and pat dry. Breast has no fat of its own to protect it, so the brine is what keeps it juicy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 2, 'Make the marinade: in a bowl, combine the minced garlic, grated ginger, soy sauce, honey and olive oil. Whisk until the honey dissolves. Toss the brined chicken through it and set aside while you prep everything else.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 3, 'Start the rice: rinse the 110g of jasmine rice under cold water until the water runs clear, then cook according to the packet with a pinch of salt. Keep it covered and warm.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 4, 'Prep the vegetables: cut the onion and red bell pepper into 1-inch chunks.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 5, 'Make the peanut sauce: in a small saucepan over medium-low heat, combine the coconut milk, peanut butter, soy sauce, Worcestershire, honey and cumin. Whisk until smooth and the peanut butter has melted, then simmer 3-4 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 6, 'Thicken the sauce: mix the cornflour with 1 tbsp cold water to a slurry and stir it into the simmering sauce. Cook 1-2 minutes until glossy. Off the heat, stir in the lime juice, then taste and adjust -- it should read salty, sweet and sour in that order, with the peanut behind it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 7, 'Cook the vegetables: heat a large pan or wok over medium-high with a drizzle of oil. Saute the onion and red pepper 3-4 minutes until charred at the edges but still crisp. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 8, 'Cook the chicken: in the same pan over medium-high heat, lay the marinated cubes out in a single layer without crowding. Cook 2-3 minutes per side until golden and just at 74°C internally. Breast is far leaner than thigh and overcooks in under a minute -- pull it the moment it hits temperature.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 9, 'Return the vegetables to the pan with the chicken and toss briefly to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 16, 10, 'Spoon the chicken and vegetables over the jasmine rice and drizzle generously with the peanut sauce.', 'There is no heat in this dish as written. A sliced red chilli through the vegetables, or a spoon of sambal alongside, is what it wants -- neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 16 AND step_number = 10);

DELETE FROM recipe_steps WHERE recipe_id = 17;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 1, 'Brine the chicken: cut the chicken breast into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water, submerge the chicken and refrigerate 15-20 minutes. Rinse and pat dry. Breast has no fat of its own to protect it, so the brine is what keeps it juicy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 2, 'Make the marinade: in a bowl, combine the minced garlic, grated ginger, soy sauce, honey and olive oil. Whisk until the honey dissolves. Toss the brined chicken through it and set aside while you prep everything else.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 3, 'Start the rice: rinse the 130g of jasmine rice under cold water until the water runs clear, then cook according to the packet with a pinch of salt. Keep it covered and warm.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 4, 'Prep the vegetables: cut the onion and red bell pepper into 1-inch chunks.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 5, 'Make the peanut sauce: in a small saucepan over medium-low heat, combine the coconut milk, peanut butter, soy sauce, Worcestershire, honey and cumin. Whisk until smooth and the peanut butter has melted, then simmer 3-4 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 6, 'Thicken the sauce: mix the cornflour with 1 tbsp cold water to a slurry and stir it into the simmering sauce. Cook 1-2 minutes until glossy. Off the heat, stir in the lime juice, then taste and adjust -- it should read salty, sweet and sour in that order, with the peanut behind it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 7, 'Cook the vegetables: heat a large pan or wok over medium-high with a drizzle of oil. Saute the onion and red pepper 3-4 minutes until charred at the edges but still crisp. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 8, 'Cook the chicken: in the same pan over medium-high heat, lay the marinated cubes out in a single layer without crowding. Cook 2-3 minutes per side until golden and just at 74°C internally. Breast is far leaner than thigh and overcooks in under a minute -- pull it the moment it hits temperature.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 9, 'Return the vegetables to the pan with the chicken and toss briefly to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 17, 10, 'Spoon the chicken and vegetables over the jasmine rice and drizzle generously with the peanut sauce.', 'There is no heat in this dish as written. A sliced red chilli through the vegetables, or a spoon of sambal alongside, is what it wants -- neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 17 AND step_number = 10);

DELETE FROM recipe_steps WHERE recipe_id = 18;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 1, 'Brine the chicken: cut the chicken breast into 1-inch cubes. Dissolve 1 tbsp salt in 500ml cold water, submerge the chicken and refrigerate 15-20 minutes. Rinse and pat dry. Breast has no fat of its own to protect it, so the brine is what keeps it juicy.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 2, 'Make the marinade: in a bowl, combine the minced garlic, grated ginger, soy sauce, honey and olive oil. Whisk until the honey dissolves. Toss the brined chicken through it and set aside while you prep everything else.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 3, 'Start the rice: rinse the 180g of jasmine rice under cold water until the water runs clear, then cook according to the packet with a pinch of salt. Keep it covered and warm.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 4, 'Prep the vegetables: cut the onion and red bell pepper into 1-inch chunks.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 5, 'Make the peanut sauce: in a small saucepan over medium-low heat, combine the coconut milk, peanut butter, soy sauce, Worcestershire, honey and cumin. Whisk until smooth and the peanut butter has melted, then simmer 3-4 minutes.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 6, 'Thicken the sauce: mix the cornflour with 1 tbsp cold water to a slurry and stir it into the simmering sauce. Cook 1-2 minutes until glossy. Off the heat, stir in the lime juice, then taste and adjust -- it should read salty, sweet and sour in that order, with the peanut behind it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 7, 'Cook the vegetables: heat a large pan or wok over medium-high with a drizzle of oil. Saute the onion and red pepper 3-4 minutes until charred at the edges but still crisp. Remove and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 8, 'Cook the chicken: in the same pan over medium-high heat, lay the marinated cubes out in a single layer without crowding -- with this much chicken, work in two batches. Cook 2-3 minutes per side until golden and just at 74°C internally. Breast is far leaner than thigh and overcooks in under a minute, so pull it the moment it hits temperature.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 9, 'Return the vegetables to the pan with the chicken and toss briefly to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 18, 10, 'Spoon the chicken and vegetables over the jasmine rice and drizzle generously with the peanut sauce.', 'There is no heat in this dish as written. A sliced red chilli through the vegetables, or a spoon of sambal alongside, is what it wants -- neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 18 AND step_number = 10);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 8 -- Salmon Sandwich, recipes 28 and 29.
-- -------------------------------------------------------------------------------------
-- This is the defect Phase 9 / Task 30 flagged loudly and left here on purpose. As stored,
-- recipes 28 and 29 are wrong in three separate ways:
--   1. Phase 9 added cottage cheese (60g on 28), lemon (20g on 28, 30g on 29) and black
--      pepper to both, and NO step mentions any of them -- so the cook buys them and is
--      never told to use them. That is the whole point of the lens-4 fix (tinned salmon
--      mashed with butter and nothing else is flat and faintly metallic) and it currently
--      does not reach the cook at all.
--   2. Step 3 still says "the 15g butter" on 28 and "the 30g butter" on 29. Phase 9 cut
--      those to 8g and 10g.
--   3. Step 5 says "~106g per sandwich" on BOTH variants. findings.md caught this as a
--      copy-paste that was right on 28 and wrong on 29 even before the remediation; after
--      it, it is wrong on both. Regenerated per variant from the final rows.
-- Bread slicing is restated against the new Milk Bread portions: 240g on 28 cuts as
-- 4 slices at 60g (2 sandwiches, 1 each); 460g on 29 as 8 slices at about 58g (4
-- sandwiches, 2 each). Milk Bread (26) itself is an extra and is NOT touched.
-- The linked step 1 keeps linked_recipe_id = 26 and its alt_instruction on both.
-- Recipe 29 carries no cottage cheese -- Phase 9 gave it only the lemon and pepper -- so
-- its binder note goes in the tip rather than the instruction.

DELETE FROM recipe_steps WHERE recipe_id = 28;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 1, 'Prepare the milk bread according to the linked recipe. Use 240g -- 4 slices at about 60g each, 2 slices per person.', NULL, 26, 'Use 4 slices of store-bought bread (~60g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 2, 'Drain the tinned salmon well -- wet filling makes soggy bread. Tip it into a bowl and mash with a fork, checking carefully for bones and removing any you find.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 3, 'Fold the 60g of cottage cheese through the mashed salmon until the filling just holds together. It does the job the butter used to do at a fraction of the fat, and it keeps the filling moist rather than pasty.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 4, 'Squeeze in the lemon and grind over the black pepper. Taste it now and adjust -- tinned salmon with no acid reads flat and slightly metallic, and this is the step that fixes it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 5, 'Spread the 8g of butter thinly across the 4 slices. It is a scrape, not a layer -- its job here is to seal the bread against the filling, not to bind it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 6, 'Wash the lettuce and dry it thoroughly. Wet leaves will soak straight into the bread.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 28, 7, 'Lay the lettuce on 2 slices, divide the salmon mixture between them (about 160g per sandwich), and top with the remaining slices. Cut each in half and serve.', 'Capers or chopped dill folded in with the lemon lift this further. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 28 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 29;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 1, 'Prepare the milk bread according to the linked recipe. Use 460g -- 8 slices at about 58g each, enough for 4 sandwiches, 2 per person.', NULL, 26, 'Use 8 slices of store-bought bread (~58g each).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 2, 'Drain both tins of salmon well -- wet filling makes soggy bread. Tip into a bowl and mash with a fork, checking carefully for bones and removing any you find.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 3, 'Squeeze in the lemon and grind over the black pepper. Work it through the salmon, then taste and adjust -- tinned salmon with no acid reads flat and slightly metallic, and this is the step that fixes it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 4, 'Spread the 10g of butter thinly across the 8 slices. It is a scrape, not a layer -- its job here is to seal the bread against the filling, not to bind it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 5, 'Wash the lettuce and dry it thoroughly. Wet leaves will soak straight into the bread.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 6, 'Build 4 sandwiches: lettuce on 4 slices, then divide the salmon mixture between them (about 114g per sandwich) and top with the remaining slices.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 29, 7, 'Cut each in half and serve 2 sandwiches per person.', 'This variant is bound with lemon alone. A couple of spoons of cottage cheese folded in -- as the Light and Moderate versions use -- loosens the filling without adding meaningful fat, and capers or dill sharpen it further. None of the three is on this recipe''s ingredient list and none is costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 29 AND step_number = 7);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 9 -- Lentil Stew, recipes 30/31/32.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 26 added 100/105/110 g of chicken breast to close a 10.7 g protein gap,
-- and raised Light's olive oil 21 -> 24 g. Neither reaches the cook in the stored steps.
-- Light (30) has 9 steps and its siblings have 10, because Light carries no chorizo -- so
-- the rewrite is genuinely per-recipe, not a family-wide copy. Post-rewrite: 30 has 10
-- steps, 31 and 32 have 11.
-- The chicken browns in the pan before the liquid goes in and finishes in the stew, so it
-- picks up colour instead of poaching grey.
-- Lens 4: the last step was "Season with salt to taste. Serve in bowls" -- no acid, no
-- herb, no crunch. Lemon, vinegar and parsley are not on this recipe's ingredient list,
-- so the fix is a taste-and-adjust in the instruction plus the specifics in the tip. Light
-- additionally has no chorizo and therefore no crunch at all, which its tip names.

DELETE FROM recipe_steps WHERE recipe_id = 30;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 1, 'Prep: dice the onion, mince the garlic and dice the carrot into small cubes. Roughly chop the pak choi, keeping the stems and leaves separate. Cut the 100g of chicken breast into 2cm dice and pat it dry.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 2, 'Heat the olive oil in a large pot over medium heat until it shimmers, then add the onion and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 3, 'Add the garlic, smoked paprika and cumin. Stir for 30 seconds until fragrant -- long enough to bloom the spices in the oil, short enough that the garlic does not catch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 4, 'Add the diced carrot and cook 2-3 minutes, stirring occasionally.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 5, 'Push the vegetables to one side, raise the heat and add the diced chicken to the clear space. Brown it 3-4 minutes, turning once or twice, until it has colour on most sides. It does not need to be cooked through -- it will finish in the stew, and browning it now is what stops it poaching grey later.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 6, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any browned bits off the bottom of the pot -- that is where the flavour is.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 7, 'Drain and rinse the tinned lentils and add them to the pot.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 8, 'Bring to a simmer and cook uncovered 15-20 minutes, until the stew has thickened enough to hold a trail behind the spoon, the carrots are tender and the chicken is cooked through (74°C).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 9, 'Add the pak choi stems and cook 2 minutes, then the leaves for another 2 minutes until just wilted.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 30, 10, 'Take the pot off the heat, season with the salt, then taste and adjust. A lentil-and-tomato stew tastes muddy until something sharp cuts through it, so keep going until the flavours lift rather than sit. Serve in warm bowls.', 'The sharp thing this wants is a squeeze of lemon or a splash of sherry or cider vinegar stirred in off the heat, plus chopped parsley for green. This Light variant carries no chorizo, so it also has no crunch -- a few toasted seeds or a torn crouton on top would give it one. None of these is on the ingredient list and none changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 30 AND step_number = 10);

DELETE FROM recipe_steps WHERE recipe_id = 31;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 1, 'Prep: dice the onion, mince the garlic and dice the carrot into small cubes. Roughly chop the pak choi, keeping the stems and leaves separate. Slice the chorizo into thin coins. Cut the 105g of chicken breast into 2cm dice and pat it dry.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 2, 'Heat a large pot over medium heat. Fry the chorizo coins 2-3 minutes until crisp and the fat has rendered out orange. Remove the chorizo and set it aside, leaving every drop of that fat in the pot.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 3, 'Add the olive oil to the chorizo fat, then the onion, and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 4, 'Add the garlic, smoked paprika and cumin. Stir for 30 seconds until fragrant -- long enough to bloom the spices in the fat, short enough that the garlic does not catch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 5, 'Add the diced carrot and cook 2-3 minutes, stirring occasionally.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 6, 'Push the vegetables to one side, raise the heat and add the diced chicken to the clear space. Brown it 3-4 minutes, turning once or twice, until it has colour on most sides. It does not need to be cooked through -- it will finish in the stew, and browning it now is what stops it poaching grey later.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 7, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any browned bits off the bottom of the pot -- that is where the flavour is.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 8, 'Drain and rinse the tinned lentils and add them to the pot.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 9, 'Bring to a simmer and cook uncovered 15-20 minutes, until the stew has thickened enough to hold a trail behind the spoon, the carrots are tender and the chicken is cooked through (74°C).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 10, 'Add the pak choi stems and cook 2 minutes, then the leaves for another 2 minutes until just wilted.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 31, 11, 'Take the pot off the heat, season with the salt, then taste and adjust. A lentil-and-tomato stew tastes muddy until something sharp cuts through it, so keep going until the flavours lift rather than sit. Serve in warm bowls, topped with the crisp chorizo.', 'The sharp thing this wants is a squeeze of lemon or a splash of sherry or cider vinegar stirred in off the heat, plus chopped parsley for green. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 31 AND step_number = 11);

DELETE FROM recipe_steps WHERE recipe_id = 32;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 1, 'Prep: dice the onion, mince the garlic and dice the carrot into small cubes. Roughly chop the pak choi, keeping the stems and leaves separate. Slice the chorizo into thin coins. Cut the 110g of chicken breast into 2cm dice and pat it dry.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 2, 'Heat a large pot over medium heat. Fry the chorizo coins 2-3 minutes until crisp and the fat has rendered out orange. Remove the chorizo and set it aside, leaving every drop of that fat in the pot.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 3, 'Add the olive oil to the chorizo fat, then the onion, and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 4, 'Add the garlic, smoked paprika and cumin. Stir for 30 seconds until fragrant -- long enough to bloom the spices in the fat, short enough that the garlic does not catch.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 5, 'Add the diced carrot and cook 2-3 minutes, stirring occasionally.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 6, 'Push the vegetables to one side, raise the heat and add the diced chicken to the clear space. Brown it 3-4 minutes, turning once or twice, until it has colour on most sides. It does not need to be cooked through -- it will finish in the stew, and browning it now is what stops it poaching grey later.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 7, 'Pour in the tinned tomatoes and vegetable stock. Stir to combine, scraping any browned bits off the bottom of the pot -- that is where the flavour is.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 8, 'Drain and rinse the tinned lentils and add them to the pot.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 9, 'Bring to a simmer and cook uncovered 15-20 minutes, until the stew has thickened enough to hold a trail behind the spoon, the carrots are tender and the chicken is cooked through (74°C).', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 10, 'Add the pak choi stems and cook 2 minutes, then the leaves for another 2 minutes until just wilted.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 32, 11, 'Take the pot off the heat, season with the salt, then taste and adjust. A lentil-and-tomato stew tastes muddy until something sharp cuts through it, so keep going until the flavours lift rather than sit. Serve in warm bowls, topped with the crisp chorizo.', 'The sharp thing this wants is a squeeze of lemon or a splash of sherry or cider vinegar stirred in off the heat, plus chopped parsley for green. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 32 AND step_number = 11);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 10 -- Lentil Stuffed Peppers, recipes 33/34/35.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 27 added cottage cheese (200/240/280 g) and mozzarella (70/80/100 g) to
-- fix a 16 g protein gap and a fat % sitting 5-8 points BELOW the 25 % floor. Neither
-- appears in the stored 10 steps, which still end "Serve hot."
-- The two additions also fix the lens-4 finding -- an all-soft, one-note plate with no
-- cheese, no crunch, no herb and no acid -- so they are given real steps rather than a
-- mention: the cottage cheese folds in OFF the heat (stirred into a boiling pan it splits
-- and goes grainy), and the mozzarella goes on for the last stretch of the bake so it
-- browns into a cap. The bake is split 18-20 + 10-12 rather than lengthened, so total oven
-- time stays where it was.
-- Lemon and basil are not on the ingredient list, so they stay in the tip.

DELETE FROM recipe_steps WHERE recipe_id = 33;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 1, 'Preheat the oven to 190°C.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 2, 'Halve the peppers lengthways and remove the seeds and white membrane. Set them cut-side up on a baking tray.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 3, 'Heat the olive oil in a pan over medium heat until it shimmers, then add the diced onion and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 4, 'Add the minced garlic and cook 30 seconds until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 5, 'Add the tinned tomatoes, tomato paste, sugar and oregano. Stir to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 6, 'Drain and rinse the tinned lentils and add them to the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 7, 'Simmer 10-15 minutes until the sauce thickens and no free liquid pools when you drag a spoon through it -- a wet filling will steam the peppers instead of roasting them. Season with the salt and pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 8, 'Take the pan off the heat and let it settle for 2 minutes, then fold the 200g of cottage cheese through the filling. Off the heat matters: cottage cheese stirred into a boiling pan splits and turns grainy. Taste and adjust the seasoning now, while you still can.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 9, 'Spoon the filling into the pepper halves, packing it in generously.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 10, 'Bake 18-20 minutes, until the peppers have started to slump and colour at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 11, 'Tear the 70g of mozzarella over the peppers and return them to the oven for a final 10-12 minutes, until the peppers are soft and slightly charred and the cheese is melted with brown blisters on it. That browned cap is the only crisp thing on the plate and it is worth the wait.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 33, 12, 'Serve hot, straight from the tray.', 'This plate has no acid and no fresh herb: a squeeze of lemon over the peppers as they land and a scatter of torn basil are what turn it from filling into good. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 33 AND step_number = 12);

DELETE FROM recipe_steps WHERE recipe_id = 34;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 1, 'Preheat the oven to 190°C.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 2, 'Halve the peppers lengthways and remove the seeds and white membrane. Set them cut-side up on a baking tray.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 3, 'Heat the olive oil in a pan over medium heat until it shimmers, then add the diced onion and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 4, 'Add the minced garlic and cook 30 seconds until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 5, 'Add the tinned tomatoes, tomato paste, sugar and oregano. Stir to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 6, 'Drain and rinse the tinned lentils and add them to the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 7, 'Simmer 10-15 minutes until the sauce thickens and no free liquid pools when you drag a spoon through it -- a wet filling will steam the peppers instead of roasting them. Season with the salt and pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 8, 'Take the pan off the heat and let it settle for 2 minutes, then fold the 240g of cottage cheese through the filling. Off the heat matters: cottage cheese stirred into a boiling pan splits and turns grainy. Taste and adjust the seasoning now, while you still can.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 9, 'Spoon the filling into the pepper halves, packing it in generously.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 10, 'Bake 18-20 minutes, until the peppers have started to slump and colour at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 11, 'Tear the 80g of mozzarella over the peppers and return them to the oven for a final 10-12 minutes, until the peppers are soft and slightly charred and the cheese is melted with brown blisters on it. That browned cap is the only crisp thing on the plate and it is worth the wait.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 34, 12, 'Serve hot, straight from the tray.', 'This plate has no acid and no fresh herb: a squeeze of lemon over the peppers as they land and a scatter of torn basil are what turn it from filling into good. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 34 AND step_number = 12);

DELETE FROM recipe_steps WHERE recipe_id = 35;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 1, 'Preheat the oven to 190°C.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 2, 'Halve the peppers lengthways and remove the seeds and white membrane. Set them cut-side up on a baking tray.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 3, 'Heat the olive oil in a pan over medium heat until it shimmers, then add the diced onion and cook 4-5 minutes until softened.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 4, 'Add the minced garlic and cook 30 seconds until fragrant.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 5, 'Add the tinned tomatoes, tomato paste, sugar and oregano. Stir to combine.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 6, 'Drain and rinse the tinned lentils and add them to the pan.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 7, 'Simmer 10-15 minutes until the sauce thickens and no free liquid pools when you drag a spoon through it -- a wet filling will steam the peppers instead of roasting them. Season with the salt and pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 7);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 8, 'Take the pan off the heat and let it settle for 2 minutes, then fold the 280g of cottage cheese through the filling. Off the heat matters: cottage cheese stirred into a boiling pan splits and turns grainy. Taste and adjust the seasoning now, while you still can.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 8);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 9, 'Spoon the filling into the pepper halves, packing it in generously.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 9);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 10, 'Bake 18-20 minutes, until the peppers have started to slump and colour at the edges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 10);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 11, 'Tear the 100g of mozzarella over the peppers and return them to the oven for a final 10-12 minutes, until the peppers are soft and slightly charred and the cheese is melted with brown blisters on it. That browned cap is the only crisp thing on the plate and it is worth the wait.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 11);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 35, 12, 'Serve hot, straight from the tray.', 'This plate has no acid and no fresh herb: a squeeze of lemon over the peppers as they land and a scatter of torn basil are what turn it from filling into good. Neither is on the ingredient list and neither changes the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 35 AND step_number = 12);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 22 -- Classic Irish Beef Stew, recipes 78/79/80. TIP-ONLY.
-- -------------------------------------------------------------------------------------
-- DELIBERATELY NOT WIPED AND RE-INSERTED, and the reasoning is the same one Phase 8 gave
-- for the step_number = 0 fix on this exact family:
--   * findings.md rated this the strongest technique in the audit and proposed NOTHING on
--     lens 3 -- dry brine, no-oil sear, caramelised paste, bare simmer, fat skimmed, bay
--     and thyme pulled, taste-and-adjust, warm bowls. There is nothing to correct.
--   * Phase 8 raised the beef on 78 (240 -> 280 g), the potato on all three
--     (240/300/400 -> 350/390/530 g) and halved the butter (14 -> 7 g). NOT ONE step quotes
--     a gram figure, so none of them went stale. Verified against the live text this run.
--   * Worcestershire stays (decisions.md Sec.3), so step 6 needs no edit either.
-- That leaves exactly one finding to land -- lens 4: "Acid is thin". Re-typing 30 verbatim
-- steps to attach one tip would add transcription risk without removing any. This is a
-- plain UPDATE of one nullable text column on one step per recipe: it touches no key
-- column, cannot renumber anything, and rewrites the identical value on a re-run.
-- Step 1's tip is NOT touched -- Phase 8 put the CHEF'S NOTE there and it stays.
UPDATE recipe_steps
SET tip = 'The acid in this stew is thin. A splash of cider vinegar or a little stout added with the stock at the braise, or a spoon of vinegar stirred in at the very end, is what lifts a long-braised beef stew out of heaviness. Neither is on the ingredient list and neither changes the macros.'
WHERE recipe_id IN (78,79,80) AND step_number = 10;

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 23 -- Spaghetti Bolognese, recipes 81/82/83.
-- -------------------------------------------------------------------------------------
-- Phase 8 / Task 20 touched only recipes.calories on this family -- no ingredient moved,
-- so no gram figure in the prose went stale. The two lens-3 findings are what is fixed:
--   * Step 6 read "Prepare fresh pasta according to linked recipe" with NO quantity, while
--     families 11 and 93 both state grams per person in the equivalent step. The cook had
--     no idea how much dough to make. Now stated per variant: 180 / 200 / 250 g.
--   * NO pasta water was reserved. Step 7 tossed pasta with sauce and had nothing to
--     loosen or emulsify it. Reserving it moves into step 6 and using it into step 7.
-- Step 6 keeps linked_recipe_id = 36 (Fresh Pasta) and its alt_instruction, both extended
-- with the reserved-water instruction so the store-bought path gets it too.
-- Lens 4 wanted wine; it is not on the ingredient list, so it is a tip.

DELETE FROM recipe_steps WHERE recipe_id = 81;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 1, 'Finely dice the onion, carrot and celery, and mince the garlic.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 2, 'Heat the olive oil in a heavy pan over high heat. Brown the mince 5-6 minutes, breaking it up with a wooden spoon and letting it sit long enough between stirs to actually colour. Set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 3, 'In the same pan over medium heat, cook the soffritto 8-10 minutes until soft and lightly golden.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 4, 'Return the mince to the pan. Add the tinned tomatoes, tomato paste, beef stock, sugar, oregano and bay leaf. Stir well.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 5, 'Reduce the heat to low, cover partially, and simmer 90 minutes, stirring occasionally, until thick and rich and the fat has come to the surface.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 6, 'Prepare the fresh pasta according to the linked recipe. Use 180g of dough total (~90g per person). Boil in well-salted water until al dente, then reserve a cup of the starchy cooking water before draining -- you will need it in the next step.', NULL, 36, 'Cook 180g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 81, 7, 'Remove the bay leaf. Taste the ragu and adjust the salt and pepper -- after 90 minutes it will want more than you expect. Toss the drained pasta through the sauce, loosening with splashes of the reserved cooking water until it coats every strand rather than sitting beside it. Serve topped with grated Parmesan and torn basil.', 'A glass of red wine poured in with the tomatoes and reduced for a minute before the stock goes in is the acid and depth a 90-minute ragu would normally have. It is not on the ingredient list and is not costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 81 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 82;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 1, 'Finely dice the onion, carrot and celery, and mince the garlic.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 2, 'Heat the olive oil in a heavy pan over high heat. Brown the mince 5-6 minutes, breaking it up with a wooden spoon and letting it sit long enough between stirs to actually colour. Set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 3, 'In the same pan over medium heat, cook the soffritto 8-10 minutes until soft and lightly golden.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 4, 'Return the mince to the pan. Add the tinned tomatoes, tomato paste, beef stock, sugar, oregano and bay leaf. Stir well.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 5, 'Reduce the heat to low, cover partially, and simmer 90 minutes, stirring occasionally, until thick and rich and the fat has come to the surface.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 6, 'Prepare the fresh pasta according to the linked recipe. Use 200g of dough total (~100g per person). Boil in well-salted water until al dente, then reserve a cup of the starchy cooking water before draining -- you will need it in the next step.', NULL, 36, 'Cook 200g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 82, 7, 'Remove the bay leaf. Taste the ragu and adjust the salt and pepper -- after 90 minutes it will want more than you expect. Toss the drained pasta through the sauce, loosening with splashes of the reserved cooking water until it coats every strand rather than sitting beside it. Serve topped with grated Parmesan and torn basil.', 'A glass of red wine poured in with the tomatoes and reduced for a minute before the stock goes in is the acid and depth a 90-minute ragu would normally have. It is not on the ingredient list and is not costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 82 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 83;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 1, 'Finely dice the onion, carrot and celery, and mince the garlic.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 2, 'Heat the olive oil in a heavy pan over high heat. Brown the mince 5-6 minutes in two batches -- crowded into one, it steams instead of browning -- breaking it up with a wooden spoon. Set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 3, 'In the same pan over medium heat, cook the soffritto 8-10 minutes until soft and lightly golden.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 4, 'Return the mince to the pan. Add the tinned tomatoes, tomato paste, beef stock, sugar, oregano and bay leaf. Stir well.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 5, 'Reduce the heat to low, cover partially, and simmer 90 minutes, stirring occasionally, until thick and rich and the fat has come to the surface.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 6, 'Prepare the fresh pasta according to the linked recipe. Use 250g of dough total (~125g per person). Boil in well-salted water until al dente, then reserve a cup of the starchy cooking water before draining -- you will need it in the next step.', NULL, 36, 'Cook 250g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 83, 7, 'Remove the bay leaf. Taste the ragu and adjust the salt and pepper -- after 90 minutes it will want more than you expect. Toss the drained pasta through the sauce, loosening with splashes of the reserved cooking water until it coats every strand rather than sitting beside it. Serve topped with grated Parmesan and torn basil.', 'A glass of red wine poured in with the tomatoes and reduced for a minute before the stock goes in is the acid and depth a 90-minute ragu would normally have. It is not on the ingredient list and is not costed into the macros.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 83 AND step_number = 7);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 35 -- Greek Chicken Gyros, recipes 118/119/120.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 28 swapped chicken THIGH for BREAST (ingredient 41 -> 11) at the same
-- weights, trimmed the olive oil and feta, and raised the pita 120/160/200 -> 140/180/220 g.
-- Steps 2 and 4 name "thighs" and step 4 gives a thigh's timing (5-6 min per side), which
-- on breast is dry and stringy. Both rewritten, and the pita weight is now stated.
-- Two lens-3 findings from findings.md also land here:
--   * The homemade pita path never told the cook to WARM the bread -- only the
--     store-bought alt_instruction did. Cold pita cracks when you fold it. It is now a
--     step of its own, immediately before assembly.
--   * The tzatziki -- the component most likely to need salt -- had no taste-and-adjust,
--     and once it is inside the pita it cannot be fixed. Added to step 1.
-- LINKED STEPS: step 3 (prep) keeps linked_recipe_id = 117 + alt_instruction, and the new
-- step 5 (the consuming step, where the pita is warmed and used) carries them too, per the
-- chef skill's "if the sub-component is also consumed later, that step should ALSO carry
-- linked_recipe_id + alt_instruction" pattern. Pita Bread (117) is an extra: NOT modified,
-- and every portion stays inside its 335 g yield.

DELETE FROM recipe_steps WHERE recipe_id = 118;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 1, 'Make the tzatziki: grate the cucumber and squeeze it dry in a clean towel -- wet cucumber turns the whole thing to soup. Mix with the Greek yogurt, 2 minced garlic cloves, the chopped dill, the juice of half the lemon, half the olive oil and a pinch of salt. Taste it and adjust the salt and lemon now, then refrigerate: once it is inside a folded pita there is no fixing it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 2, 'Marinate the chicken: combine the remaining olive oil, the remaining lemon juice, 2 minced garlic cloves, the oregano, paprika, cumin, salt and pepper. Coat the chicken breast and leave 30 minutes, or overnight in the fridge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 3, 'Prepare the pita bread according to the linked recipe. Use 140g -- 2 pitas at about 70g each, one per person.', NULL, 117, 'Use 140g of store-bought pita (2 pitas).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 4, 'Cook the chicken: heat a skillet or grill pan over medium-high. Cook the breast 4-5 minutes per side until charred outside and 74°C in the middle. Breast is far leaner than thigh and goes dry within a minute of hitting temperature, so pull it as soon as it does. Rest 5 minutes, then slice thin against the grain.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 5, 'Warm the pita just before you build: 30 seconds a side in a dry pan, until it puffs and turns pliable. Cold pita cracks along the fold and spills everything out of the bottom.', NULL, 117, 'Warm the store-bought pita in a dry pan for 30 seconds per side until pliable.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 118, 6, 'Assemble: spread the tzatziki over the warm pita, then add the sliced chicken, tomato, red onion, lettuce and crumbled feta. Fold and serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 118 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 119;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 1, 'Make the tzatziki: grate the cucumber and squeeze it dry in a clean towel -- wet cucumber turns the whole thing to soup. Mix with the Greek yogurt, 2 minced garlic cloves, the chopped dill, the juice of half the lemon, half the olive oil and a pinch of salt. Taste it and adjust the salt and lemon now, then refrigerate: once it is inside a folded pita there is no fixing it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 2, 'Marinate the chicken: combine the remaining olive oil, the remaining lemon juice, 2 minced garlic cloves, the oregano, paprika, cumin, salt and pepper. Coat the chicken breast and leave 30 minutes, or overnight in the fridge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 3, 'Prepare the pita bread according to the linked recipe. Use 180g -- 2 pitas at about 90g each, one per person.', NULL, 117, 'Use 180g of store-bought pita (2 pitas).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 4, 'Cook the chicken: heat a skillet or grill pan over medium-high. Cook the breast 4-5 minutes per side until charred outside and 74°C in the middle. Breast is far leaner than thigh and goes dry within a minute of hitting temperature, so pull it as soon as it does. Rest 5 minutes, then slice thin against the grain.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 5, 'Warm the pita just before you build: 30 seconds a side in a dry pan, until it puffs and turns pliable. Cold pita cracks along the fold and spills everything out of the bottom.', NULL, 117, 'Warm the store-bought pita in a dry pan for 30 seconds per side until pliable.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 119, 6, 'Assemble: spread the tzatziki over the warm pita, then add the sliced chicken, tomato, red onion, lettuce and crumbled feta. Fold and serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 119 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 120;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 1, 'Make the tzatziki: grate the cucumber and squeeze it dry in a clean towel -- wet cucumber turns the whole thing to soup. Mix with the Greek yogurt, 2 minced garlic cloves, the chopped dill, the juice of half the lemon, half the olive oil and a pinch of salt. Taste it and adjust the salt and lemon now, then refrigerate: once it is inside a folded pita there is no fixing it.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 2, 'Marinate the chicken: combine the remaining olive oil, the remaining lemon juice, 2 minced garlic cloves, the oregano, paprika, cumin, salt and pepper. Coat the chicken breast and leave 30 minutes, or overnight in the fridge.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 3, 'Prepare the pita bread according to the linked recipe. Use 220g -- 2 pitas at about 110g each, one per person.', NULL, 117, 'Use 220g of store-bought pita (2 pitas).'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 4, 'Cook the chicken: heat a skillet or grill pan over medium-high. Cook the breast 5-6 minutes per side -- this is a heavier portion, so give it the extra minute -- until charred outside and 74°C in the middle. Breast is far leaner than thigh and goes dry within a minute of hitting temperature, so pull it as soon as it does. Rest 5 minutes, then slice thin against the grain.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 5, 'Warm the pita just before you build: 30 seconds a side in a dry pan, until it puffs and turns pliable. Cold pita cracks along the fold and spills everything out of the bottom.', NULL, 117, 'Warm the store-bought pita in a dry pan for 30 seconds per side until pliable.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 120, 6, 'Assemble: spread the tzatziki over the warm pita, then add the sliced chicken, tomato, red onion, lettuce and crumbled feta. Fold and serve immediately.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 120 AND step_number = 6);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 42 -- Salmon with Air-Fried Potatoes & Green Beans, 139/140/141.
-- -------------------------------------------------------------------------------------
-- Phase 9 / Task 29 raised recipe 139's salmon 260 -> 300 g, cut the olive oil on all
-- three (12/16/20 -> 6/8/10 g) and raised the potato hard: 400/480/600 -> 570/670/830 g.
-- The stored air-fry times were written for the old, much smaller potato load and are now
-- short; they are restated, with a warning about crowding the basket, since 830 g of cubed
-- potato does not fit in one layer in a domestic air fryer.
-- The two lens-3 findings are fixed in the instructions:
--   * NOTHING coordinated the three components. Read in order, the potatoes came out and
--     sat for ten minutes going cold and soft while the salmon cooked. Step 3 now starts
--     the salmon against the potato clock.
--   * RAW crushed garlic was tossed through the warm beans at step 5 -- acrid, and it takes
--     over the plate. It now goes into the steam for the last 30 seconds, which takes the
--     raw edge off without needing any extra fat. The olive oil trims are load-bearing
--     (fat lands at 33.5-34.1 %, inside the band with little headroom) so no oil is spent
--     on blooming it.

DELETE FROM recipe_steps WHERE recipe_id = 139;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 1, 'Preheat the oven to 200°C. Cube the 570g of potato into 2cm pieces and toss with half the olive oil, half the salt and the pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 2, 'Air-fry the potato at 200°C for 22-26 minutes, shaking halfway, until golden and crisp. Give them room -- piled deeper than a couple of layers they steam instead of crisping, so use two batches if the basket is small.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 3, 'Start the salmon when the potato has about 12 minutes left, so the two land together. Pat the fillets dry, rub with the remaining olive oil, salt, pepper and half the chopped dill, and roast skin-side down on a lined tray for 10-12 minutes, until the flesh is just opaque and flakes under gentle pressure.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 5, 'Drain the beans well and toss them with the softened garlic, the lemon juice and the remaining dill. Taste and adjust the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 139, 6, 'Plate the salmon, potatoes and beans, and finish with lemon wedges at the table.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 139 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 140;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 1, 'Preheat the oven to 200°C. Cube the 670g of potato into 2cm pieces and toss with half the olive oil, half the salt and the pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 2, 'Air-fry the potato at 200°C for 24-28 minutes, shaking halfway, until golden and crisp. Give them room -- piled deeper than a couple of layers they steam instead of crisping, so use two batches if the basket is small.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 3, 'Start the salmon when the potato has about 13 minutes left, so the two land together. Pat the fillets dry, rub with the remaining olive oil, salt, pepper and half the chopped dill, and roast skin-side down on a lined tray for 11-13 minutes, until the flesh is just opaque and flakes under gentle pressure.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 5, 'Drain the beans well and toss them with the softened garlic, the lemon juice and the remaining dill. Taste and adjust the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 140, 6, 'Plate the salmon, potatoes and beans, and finish with lemon wedges at the table.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 140 AND step_number = 6);

DELETE FROM recipe_steps WHERE recipe_id = 141;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 1, 'Preheat the oven to 200°C. Cube the 830g of potato into 2cm pieces and toss with half the olive oil, half the salt and the pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 2, 'Air-fry the potato at 200°C for 26-30 minutes, shaking halfway, until golden and crisp. This is a lot of potato for one basket -- do it in two batches and hold the first in a low oven, or it will steam and never crisp.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 3, 'Start the salmon when the potato has about 14 minutes left, so the two land together. Pat the fillets dry, rub with the remaining olive oil, salt, pepper and half the chopped dill, and roast skin-side down on a lined tray for 12-14 minutes, until the flesh is just opaque and flakes under gentle pressure.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 4, 'Trim the green beans. Steam or blanch 4 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 5, 'Drain the beans well and toss them with the softened garlic, the lemon juice and the remaining dill. Taste and adjust the salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 141, 6, 'Plate the salmon, potatoes and beans generously, and finish with lemon wedges at the table.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 141 AND step_number = 6);

-- -------------------------------------------------------------------------------------
-- Task 31 / Family 43 -- Mediterranean Salmon with Sweet Potato & Broccoli, 142/143/144.
-- -------------------------------------------------------------------------------------
-- Two changes to describe, not one. Phase 9 / Task 29 applied the same macro fix as family
-- 42 (salmon up on Light, olive oil down on all three, sweet potato 340/440/560 ->
-- 520/610/770 g) AND decisions.md Sec.8 -- "make it genuinely Mediterranean". Cherry
-- tomatoes (120/150/180 g), black olives (20/30/40 g) and dried oregano went in, and none
-- of the three is mentioned anywhere in the stored 5 steps.
-- findings.md's lens-4 objection was that the name only half-earned itself: olive oil,
-- lemon, dill and broccoli fit the claim, but there were no olives, no tomato and no
-- oregano -- nothing that read specifically of the region. The developer chose to fix the
-- dish rather than rename it, so the new components get real placement: oregano goes on
-- the sweet potato at the start so it roasts into the wedges, and the tomatoes and olives
-- join the tray for the last stretch -- long enough for the tomatoes to collapse and catch,
-- not so long that the olives go leathery.
-- Same two lens-3 fixes as family 42: component timing is now coordinated, and the raw
-- garlic goes into the steam rather than onto the hot broccoli.

DELETE FROM recipe_steps WHERE recipe_id = 142;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 1, 'Preheat the oven to 200°C. Cut the 520g of sweet potato into 2cm wedges and toss with half the olive oil, half the salt, a pinch of pepper and the dried oregano -- on the wedges from the start, the oregano roasts into them rather than sitting on top.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 2, 'Roast the wedges on a lined tray for 24-28 minutes, turning halfway, until the edges caramelise.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 3, 'When the wedges have about 12 minutes left, halve the 120g of cherry tomatoes and scatter them over the tray with the 20g of olives. The tomatoes should collapse and catch at the edges; the olives only need warming through so their oil comes out.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 4, 'Start the salmon at the same moment, so everything lands together. Pat the fillets dry, rub with the remaining olive oil, half the chopped dill, salt and pepper, and roast skin-side down for 10-12 minutes, until just opaque.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 5, 'Cut the broccoli into florets and steam 4-5 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 6, 'Toss the broccoli with the softened garlic, the lemon juice, the remaining dill and a small pinch of salt. Taste and adjust.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 142, 7, 'Plate the sweet potato with the blistered tomatoes and olives spooned over, add the salmon and broccoli, and finish with lemon wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 142 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 143;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 1, 'Preheat the oven to 200°C. Cut the 610g of sweet potato into 2cm wedges and toss with half the olive oil, half the salt, a pinch of pepper and the dried oregano -- on the wedges from the start, the oregano roasts into them rather than sitting on top.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 2, 'Roast the wedges on a lined tray for 26-30 minutes, turning halfway, until the edges caramelise.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 3, 'When the wedges have about 12 minutes left, halve the 150g of cherry tomatoes and scatter them over the tray with the 30g of olives. The tomatoes should collapse and catch at the edges; the olives only need warming through so their oil comes out.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 4, 'Start the salmon at the same moment, so everything lands together. Pat the fillets dry, rub with the remaining olive oil, half the chopped dill, salt and pepper, and roast skin-side down for 11-13 minutes, until just opaque.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 5, 'Cut the broccoli into florets and steam 4-5 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 6, 'Toss the broccoli with the softened garlic, the lemon juice, the remaining dill and a small pinch of salt. Taste and adjust.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 143, 7, 'Plate the sweet potato with the blistered tomatoes and olives spooned over, add the salmon and broccoli, and finish with lemon wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 143 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 144;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 1, 'Preheat the oven to 200°C. Cut the 770g of sweet potato into 2cm wedges and toss with half the olive oil, half the salt, the pepper and the dried oregano -- on the wedges from the start, the oregano roasts into them rather than sitting on top. Spread them over two trays if one is crowded.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 2, 'Roast the wedges for 28-32 minutes, turning halfway, until the edges caramelise.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 3, 'When the wedges have about 12 minutes left, halve the 180g of cherry tomatoes and scatter them over the tray with the 40g of olives. The tomatoes should collapse and catch at the edges; the olives only need warming through so their oil comes out.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 4, 'Start the salmon at the same moment, so everything lands together. Pat the fillets dry, rub with the remaining olive oil, half the chopped dill, salt and pepper, and roast skin-side down for 12-14 minutes, until just opaque.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 5, 'Cut the broccoli into florets and steam 4-5 minutes until bright and tender-crisp, adding the crushed garlic for the final 30 seconds. Half a minute in the steam takes the raw edge off it -- tossed through raw, garlic is acrid and takes over the whole plate.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 6, 'Toss the broccoli with the softened garlic, the lemon juice, the remaining dill and a pinch of salt. Taste and adjust.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 144, 7, 'Plate the sweet potato generously with the blistered tomatoes and olives spooned over, add the salmon and broccoli, and finish with lemon wedges.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 144 AND step_number = 7);

-- =====================================================================================
-- Task 32 -- Sign off the remediated families
-- =====================================================================================
--
-- FIFTEEN families, not the sixteen tasks.md implies. tasks.md Task 32 lists the twelve
-- "remediated" families as 1, 4, 5, 8, 9, 10, 22, 23, 35, 42, 43 AND 93, and the dispatch
-- adds 95, 96, 105, 106 to reach sixteen. But that twelve-family list predates the Phase 2
-- gate: decisions.md Sec.7 reclassified family 93 (Chicken Carbonara, recipes 210/211/212)
-- as a CHEAT MEAL, and a cheat family is never signed off. 11 + 4 = 15. The sixteenth
-- family does not exist; it is family 93 counted from a superseded list.
--
-- NO CHEAT RECIPE IS SIGNED OFF ANYWHERE IN THIS FILE. The cheat set is
-- 47,48,49 / 53,54,55 / 94,95,96,97 / 98,99,100 / 210,211,212 and none of those ids appears
-- in any macros_audited = 1 statement. Note the collision hazard deliberately: recipe ids
-- 94-100 are cheat RECIPES (families 28 and 29) while FAMILIES 94-100 are legitimately
-- signed off in Phase 7 as recipes 214-234. The two id spaces overlap and the filter is on
-- recipes.id every time.
-- Retired recipe 107 (Pizza "Balanced 2", is_live = 0 from Phase 4) is likewise absent.
--
-- macros_audited_by is left NULL on every row: it is an FK to users.id and this was an
-- agent-run audit with no user behind it (chef SKILL.md, and the Stromboli precedent).
--
-- VERIFIED THIS RUN, NOT INHERITED. Every one of the 45 recipes below was recomputed live
-- from recipe_ingredients plus prorated linked recipes with the Phase 3-9 deltas applied
-- (Atwater 4P + 4C + 9F; homemade basis on every FR-103 dual-path row). All 15 families
-- clear every reject in .claude/rules/recipe-variants.md:
--
--   fam  recipes        P g/srv (L/M/B)     fat %              carb %             kcal/srv
--    1   1/2/3          36.8 42.4 48.5      26.4 27.9 29.2     41.3 42.2 42.4     454<567<684
--    4   13/14/15       43.6 51.1 57.8      25.9 26.9 27.9     41.1 41.2 42.7     528<640<787
--    5   16/17/18       44.4 54.7 70.8      30.7 31.4 31.7     40.9 39.3 40.1     626<746<1003
--    8   269/28/29      35.9 38.0 62.9      26.8 30.5 29.1     40.5 40.2 43.1     439<519<907
--    9   30/31/32       39.8 46.4 50.0      25.1 25.5 29.8     47.1 44.3 40.4     573<613<673
--   10   33/34/35       37.2 46.3 56.2      27.9 25.4 27.1     45.6 47.6 46.5     562<684<850
--   22   78/79/80       36.8 39.5 51.1      29.7 28.9 29.2     42.7 43.8 42.9     533<580<733
--   23   81/82/83       46.6 55.0 70.6      25.8 26.2 25.8     44.4 42.5 41.0     627<703<851
--   35   118/119/120    46.5 58.1 73.1      27.3 27.8 28.3     40.3 39.9 38.7     575<719<884
--   42   139/140/141    38.7 42.0 52.1      34.1 33.5 33.9     40.4 41.8 41.4     608<682<843
--   43   142/143/144    39.4 43.0 53.2      33.9 33.4 33.7     42.0 43.4 43.3     654<743<924
--   95   217/218/219    37.3 41.2 50.6      27.7 30.1 32.6     39.7 40.4 38.9     457<558<711
--   96   220/221/222    40.2 46.2 55.3      26.7 27.9 28.2     39.1 40.2 40.7     470<581<710
--  105   247/248/249    38.0 45.0 52.1      23.3 23.3 23.3     45.4 46.2 46.8     485<590<696
--  106   250/251/252    35.2 43.9 53.3      34.0 33.4 34.0     38.5 39.2 38.4     512<642<774
--
--   Protein >= 35 g everywhere (tightest: 250 at 35.2, 269 at 35.9, 1 and 78 at 36.8).
--   Fat <= 35 % everywhere (tightest: 139 at 34.1, 250/252 at 34.0).
--   Carbs >= 38 % everywhere (tightest: 252 at 38.4, 250 at 38.5, 120 at 38.7, 219 at 38.9,
--     220 at 39.1 -- 220 is the one to watch, since whey adds protein with zero carbs and
--     any further trim to its honey or berries would walk it toward the 38 % floor).
--   kcal ordering Light < Moderate < Balanced holds in all 15. kcal bands are a target and
--   explicitly not a reject (.claude/rules/recipe-variants.md, 2026-07-30 policy) -- 5, 10,
--   42 and 43 run above their bands and are signed off anyway.
--   TWO ADVISORY FLAGS, recorded not blocked: family 105 sits at 23.3 % fat and family 9's
--   Light at 25.1 %, at or under the 25 % chef floor that reads dry. 105's step 6 tip
--   already names the fix (cheese or pickles) and 9's Light already had its oil raised.
--
-- STRUCTURE, also verified: every one of the 15 has exactly 3 members labelled
-- Light/Moderate/Balanced at display_order 1/2/3 with is_default on Moderate, once Phase 4
-- (is_default move, member 107 retired, family 35 renumbered) and Phase 9 (family 8's Light
-- inserted as 269 and renumbered) have been applied. Family 8 is 2 members and family 4 is
-- 4 members in the CURRENT database -- both are fixed by earlier statements in this file,
-- so this sign-off must not be run standalone.

UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (1,2,3);          -- fam 1   Peanut Butter Porridge with Berries & Walnuts
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (13,14,15);       -- fam 4   Pizza (107 retired, deliberately absent)
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (16,17,18);       -- fam 5   Chicken Satay
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (269,28,29);      -- fam 8   Salmon Sandwich (269 = the new Light)
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (30,31,32);       -- fam 9   Lentil Stew
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (33,34,35);       -- fam 10  Lentil Stuffed Peppers
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (78,79,80);       -- fam 22  Classic Irish Beef Stew
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (81,82,83);       -- fam 23  Spaghetti Bolognese
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (118,119,120);    -- fam 35  Greek Chicken Gyros
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (139,140,141);    -- fam 42  Salmon with Air-Fried Potatoes & Green Beans
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (142,143,144);    -- fam 43  Mediterranean Salmon with Sweet Potato & Broccoli
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (217,218,219);    -- fam 95  Mixed Berry & Greek Yogurt Smoothie
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (220,221,222);    -- fam 96  Greek Yogurt & Granola Bowl
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (247,248,249);    -- fam 105 Beef Burger in Pita with Lettuce & Tomato
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (250,251,252);    -- fam 106 Turkey Burger with Bun & Slaw
-- Family 93 (210,211,212) is NOT here and must never be. It is a cheat meal per
-- decisions.md Sec.7; macros_audited stays 0 on all three. Its sauce and pancetta rework
-- is Phase 11b below, which is explicitly not an audit.

-- =====================================================================================
-- PHASE 11 -- Developer-requested changes to already-audited families
-- =====================================================================================
-- Two families outside MPP-5's audit scope that the developer asked to change. Both are
-- currently macros_audited = 1.
--
-- ONLY TASK 34 TOUCHES ITS ATTESTATION. Task 34 adds an ingredient, so it CLEARS the
-- attestation before the edit and re-sets it after re-verification -- an interrupted run
-- then leaves the family honestly marked unaudited rather than falsely marked clean.
-- Task 33 is now note-only (recipe_steps.tip), which per the chef skill's invalidation rule
-- does not stale an attestation: that rule names recipe_ingredients, default_servings and
-- calories, and a tip is none of them. So family 27's flag is deliberately left untouched.
-- macros_audited_by stays NULL throughout.

-- -------------------------------------------------------------------------------------
-- Task 33 -- Pad Thai (family 27), recipes 91/92/93. NOTE ONLY -- REVERTED 2026-08-19.
-- -------------------------------------------------------------------------------------
-- !! THIS SUPERSEDES THE EARLIER PRAWN + FISH SAUCE REMOVAL. DO NOT RESTORE IT. !!
--   An earlier revision of this file deleted the prawns (143) and the fish sauce (142) from
--   all three variants, added Worcestershire (39) + MSG (21) in the fish sauce's place,
--   raised the chicken on 91 and 92, rewrote five steps, rewrote recipes.calories on all
--   three, and cleared + re-set macros_audited. ALL OF THAT IS VOID. The developer's
--   instruction on 2026-08-19: "Leave the pad thai, can you just add a note ... if you want
--   no prawns replace the prawns with x chicken", and on the fish sauce specifically,
--   "revert the whole pad thai changes, I know to use Worcestershire so it's fine".
--
-- WHAT THAT MEANS
--   The dish ships EXACTLY as it is live. Prawns stay at 90 / 110 / 130 g. Fish sauce stays
--   at 18 g on all three. No Worcestershire, no MSG, no chicken change, no calories write.
--   The gout swap is not removed from the data -- it is offered to the cook as a note, and
--   the developer has said they know to reach for Worcestershire themselves.
--
-- WHY THIS IS A tip AND NOT A NEW STEP
--   The note is not an action -- nobody does it while cooking, they decide it while
--   shopping. Making it step 1 would push a non-action to the top of the method and
--   renumber all ten steps behind it. recipe_steps.tip is the field for exactly this, and
--   it is the same call made for family 22's chef note and family 105's cheese/pickle
--   remedy earlier in this file. It renders at the start of the instruction without
--   pretending to be part of the cook.
--
-- THE SWAP QUANTITY
--   Two-thirds of the prawn weight in chicken breast is near protein-neutral: prawns are
--   21.0 P / 1.0 F per 100 g against chicken breast's 31.0 / 3.6, so 90 -> 60 g, 110 -> 75 g
--   and 130 -> 90 g move whole-recipe protein by -0.30 / +0.15 / +0.60 g -- at most 0.3 g per
--   serving -- and add +5.1 / +7.5 / +9.9 kcal per serving. Against per-serving protein of
--   41.4 / 47.4 / 58.8 g there is no risk to the 35 g floor in either direction, and the kcal
--   drift is inside the noise on a 541-790 kcal plate. The stored macros therefore stay
--   honest whichever way the cook goes, which is the whole reason the note can exist without
--   a second set of figures behind it.
--
-- NOTHING HERE INVALIDATES THE ATTESTATION
--   Family 27 is already macros_audited = 1. Per the chef skill, the attestation goes stale
--   on changes to recipe_ingredients, default_servings or calories -- this task touches NONE
--   of those, only recipe_steps.tip. So the clear-and-re-set that the old block performed is
--   deliberately absent: there is nothing to re-verify. macros_audited and
--   macros_audited_at on 91/92/93 are left exactly as they are.
--
-- Live figures, unchanged and still passing (reported for information, nothing is rewritten):
--            kcal/srv  P g   fat %  carb %
--   91 Light   541    41.4   26.1   43.3   PASS
--   92 Moder   632    47.4   25.6   44.4   PASS
--   93 Balan   790    58.8   28.0   42.2   PASS

UPDATE recipe_steps
SET tip = 'PRAWN-FREE VERSION: leave the prawns out and use 60g of chicken breast in their place, added with the chicken already in the recipe. Two-thirds of the prawn weight in chicken keeps the protein the same, so the macros on the card still hold. Worth knowing: prawns are the highest-purine ingredient in this dish, so this is the swap to make if gout is a concern.'
WHERE recipe_id = 91 AND step_number = 1;
UPDATE recipe_steps
SET tip = 'PRAWN-FREE VERSION: leave the prawns out and use 75g of chicken breast in their place, added with the chicken already in the recipe. Two-thirds of the prawn weight in chicken keeps the protein the same, so the macros on the card still hold. Worth knowing: prawns are the highest-purine ingredient in this dish, so this is the swap to make if gout is a concern.'
WHERE recipe_id = 92 AND step_number = 1;
UPDATE recipe_steps
SET tip = 'PRAWN-FREE VERSION: leave the prawns out and use 90g of chicken breast in their place, added with the chicken already in the recipe. Two-thirds of the prawn weight in chicken keeps the protein the same, so the macros on the card still hold. Worth knowing: prawns are the highest-purine ingredient in this dish, so this is the swap to make if gout is a concern.'
WHERE recipe_id = 93 AND step_number = 1;

-- -------------------------------------------------------------------------------------
-- Task 34 -- Chicken Burrito Bowl (family 17), recipes 57/58/59.
-- -------------------------------------------------------------------------------------
-- Developer request: add fresh jalapeno. findings.md called this the best-written recipe in
-- the audit set and named heat as the one thing missing from the plate.
--
-- DEDUP RE-CHECKED THIS RUN, not taken from findings.md. A case-insensitive search of
-- jalap / chilli / chili / pepper across ingredients.name and ingredients.key returned:
-- Black pepper (50), White Pepper (151), Chilli Flakes (165), Green bell pepper (127),
-- Red bell pepper (42), Pepperoni (149). No jalapeno under any spelling, and Chilli Flakes
-- is a dried spice -- a genuinely different item, not a synonym. So the insert is correct
-- under .claude/rules/homemade-first-and-ingredient-dedup.md, and it is guarded on the
-- lower-cased name so a re-run cannot create a parallel row. Singular, sentence case.
-- No accent on the "n": the rest of the table is plain ASCII in ingredient names.
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 'jalapeno', 'Jalapeno', 3, 0.90, 6.50, 0.40, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = 'jalapeno');

UPDATE recipes SET macros_audited = 0, macros_audited_at = NULL WHERE id IN (57,58,59);

-- Whole items go in whole-item units, gram weight in quantity_grams (chef lens 2):
-- 20g = 1 medium jalapeno, 30g = 1.5, 40g = 2. Portions scale with the variant.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 57, (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1), NULL, 1.00, 7, 20.00, 16
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 57
    AND (ingredient_id <=> (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1))
    AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 58, (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1), NULL, 1.50, 7, 30.00, 16
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 58
    AND (ingredient_id <=> (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1))
    AND (linked_recipe_id <=> NULL));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 59, (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1), NULL, 2.00, 7, 40.00, 17
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 59
    AND (ingredient_id <=> (SELECT id FROM ingredients WHERE LOWER(name) = 'jalapeno' LIMIT 1))
    AND (linked_recipe_id <=> NULL));

UPDATE recipes SET calories = 1099 WHERE id = 57;   -- 550 kcal/srv x 2, was 1093
UPDATE recipes SET calories = 1296 WHERE id = 58;   -- 648 kcal/srv x 2, was 1286
UPDATE recipes SET calories = 1608 WHERE id = 59;   -- 804 kcal/srv x 2, was 1595

-- Steps. Only step 5 changes -- the jalapeno goes RAW into the pico, so the heat stays
-- bright and forward; cooked into the chicken it would flatten out and lose the point of
-- adding it. Every other step is carried through with its technique intact (chicken patted
-- completely dry, seared undisturbed to a hard char, brought to 74°C, rested 5 minutes,
-- sliced against the grain with the board juices reserved and spooned over at plating;
-- beans bloomed with garlic and cumin; rice finished with lime and coriander off the heat;
-- avocado dressed with lime). The stored text carried hard line breaks and doubled spaces
-- from its original insert; those are normalised here. No linked recipes on this family.

DELETE FROM recipe_steps WHERE recipe_id = 57;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 1, 'Cook the rice: rinse the rice under cold water until the water runs clear. Cook in salted water per the packet instructions. When done, fluff with a fork, stir in half the lime juice and half the chopped coriander. Cover and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 2, 'Season the chicken: pat the thighs completely dry with kitchen paper. Mix the cumin, smoked paprika, half the salt and the pepper in a bowl. Coat the chicken generously and rub the spice mix into both sides.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 3, 'Sear the chicken: heat a heavy non-stick or cast-iron pan over medium-high until it just begins to smoke. Add the olive oil, swirl, then lay in the thighs. Sear undisturbed for 4 minutes to build a hard char, flip, and cook a further 4-5 minutes until the internal temperature reaches 74°C. Transfer to a board, rest 5 minutes, slice against the grain and reserve any juices on the board.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 4, 'Bloom the beans: in a small pot, warm 1 tsp of olive oil (taken from the recipe oil) over medium heat. Add 1 minced garlic clove and a pinch of cumin and cook 30 seconds until fragrant. Tip in the drained black beans plus 3 tbsp of their tin liquid and simmer 3 minutes until glossy and just thickened. Finish with a squeeze of lime and a pinch of salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 5, 'Make the quick pico: finely dice the tomato and the remaining onion. Slice the jalapeno thinly and add it raw -- seeds in for full heat, scraped out for a gentler one. Toss with the remaining lime juice and the remaining coriander and season with a pinch of salt. The jalapeno goes in raw on purpose: cooked into the chicken its heat flattens out, and the point of it is the bright edge it puts on the finished bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 6, 'Prep the avocado: halve it, remove the pit, and slice or roughly mash. Squeeze the remaining lime over it and season with salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 57, 7, 'Assemble the bowls: divide the coriander-lime rice between two bowls. Top with the sliced chicken, spooning the reserved resting juices over it, then the glossy black beans, the pico de gallo, the avocado, and a generous dollop of Greek yogurt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 57 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 58;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 1, 'Cook the rice: rinse the rice under cold water until the water runs clear. Cook in salted water per the packet instructions. When done, fluff with a fork, stir in half the lime juice and half the chopped coriander. Cover and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 2, 'Season the chicken: pat the thighs completely dry with kitchen paper. Mix the cumin, smoked paprika, half the salt and the pepper in a bowl. Coat the chicken generously and rub the spice mix into both sides.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 3, 'Sear the chicken: heat a heavy non-stick or cast-iron pan over medium-high until it just begins to smoke. Add the olive oil, swirl, then lay in the thighs. Sear undisturbed for 4 minutes to build a hard char, flip, and cook a further 4-5 minutes until the internal temperature reaches 74°C. Transfer to a board, rest 5 minutes, slice against the grain and reserve any juices on the board.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 4, 'Bloom the beans: in a small pot, warm 1 tsp of olive oil (taken from the recipe oil) over medium heat. Add 1 minced garlic clove and a pinch of cumin and cook 30 seconds until fragrant. Tip in the drained black beans plus 3 tbsp of their tin liquid and simmer 3 minutes until glossy and just thickened. Finish with a squeeze of lime and a pinch of salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 5, 'Make the quick pico: finely dice the tomato and the remaining onion. Slice the jalapeno thinly and add it raw -- seeds in for full heat, scraped out for a gentler one. Toss with the remaining lime juice and the remaining coriander and season with a pinch of salt. The jalapeno goes in raw on purpose: cooked into the chicken its heat flattens out, and the point of it is the bright edge it puts on the finished bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 6, 'Prep the avocado: halve it, remove the pit, and slice or roughly mash. Squeeze the remaining lime over it and season with salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 58, 7, 'Assemble the bowls: divide the coriander-lime rice between two bowls. Top with the sliced chicken, spooning the reserved resting juices over it, then the glossy black beans, the pico de gallo, the avocado, and a generous dollop of Greek yogurt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 58 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 59;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 1, 'Cook the rice: rinse the rice under cold water until the water runs clear. Cook in salted water per the packet instructions. When done, fluff with a fork, stir in half the lime juice and half the chopped coriander. Cover and set aside.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 2, 'Season the chicken: pat the thighs completely dry with kitchen paper. Mix the cumin, smoked paprika, half the salt and the pepper in a bowl. Coat the chicken generously and rub the spice mix into both sides.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 3, 'Sear the chicken: heat a heavy non-stick or cast-iron pan over medium-high until it just begins to smoke. Add the olive oil, swirl, then lay in the thighs. Sear undisturbed for 4 minutes to build a hard char, flip, and cook a further 4-5 minutes until the internal temperature reaches 74°C. Transfer to a board, rest 5 minutes, slice against the grain and reserve any juices on the board.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 4, 'Bloom the beans: in a small pot, warm 1 tsp of olive oil (taken from the recipe oil) over medium heat. Add 1 minced garlic clove and a pinch of cumin and cook 30 seconds until fragrant. Tip in the drained black beans plus 3 tbsp of their tin liquid and simmer 3 minutes until glossy and just thickened. Finish with a squeeze of lime and a pinch of salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 5, 'Make the quick pico: finely dice the tomato and the remaining onion. Slice the jalapenos thinly and add them raw -- seeds in for full heat, scraped out for a gentler one. Toss with the remaining lime juice and the remaining coriander and season with a pinch of salt. The jalapeno goes in raw on purpose: cooked into the chicken its heat flattens out, and the point of it is the bright edge it puts on the finished bowl.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 6, 'Prep the avocado: halve it, remove the pit, and slice or roughly mash. Squeeze the remaining lime over it and season with salt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 59, 7, 'Assemble the bowls: divide the coriander-lime rice between two bowls. Top with the sliced chicken, spooning the reserved resting juices over it, then the glossy black beans, the pico de gallo and the avocado. Scatter the grated cheddar over the warm chicken so it just melts, then finish with a generous dollop of Greek yogurt.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 59 AND step_number = 7);

-- Re-verified above with the jalapeno in place:
--            BEFORE                                     AFTER
--   57 Light   546  37.1  32.8  40.0  pass              550  37.2  32.6  40.3   PASS
--   58 Moder   643  42.3  33.6  40.1  pass              648  42.5  33.4  40.4   PASS
--   59 Balan   797  49.4  34.0  41.2  pass              804  49.6  33.8  41.5   PASS
--   kcal ordering 550 < 648 < 804 -- holds. The addition is +6 / +10 / +13 kcal whole-recipe
--   and every margin is unchanged or marginally better. Re-set the flag.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (57,58,59);

-- =====================================================================================
-- PHASE 11b -- decisions.md Sec.7: family 93's sauce and pancetta. No task number exists.
-- =====================================================================================
-- Developer verdict at the Phase 2 gate: "Make it a cheat meal and double the sauce and
-- increase the bacon. It's not nice as is." Phase 3 already set is_cheat = 1 on 210/211/212.
-- This block is the other half of that instruction, and tasks.md has no task for it --
-- Task 23 was voided when the family left the audit, and Phase 9b explicitly deferred the
-- sauce and pancetta work as "out of scope for a macro-remediation pass". It lands here.
--
-- THIS IS NOT AN AUDIT AND PRODUCES NO SIGN-OFF.
--   * NO macro targets apply. Protein, fat % and carb % are not checked and not enforced.
--   * macros_audited STAYS 0 on all three recipes. Nothing below writes it.
--   * The family is absent from the Task 32 sign-off block above, deliberately.
--   * The figures quoted are informational only, so the developer can see what the dish
--     now costs; they are NOT a pass/fail statement.
--
-- WHAT CHANGES.
--   Sauce doubled -- and the carbonara sauce here is egg plus Parmesan, correctly built
--   with no cream, which findings.md called "exemplary carbonara, which is rare". So both
--   components double together; doubling one alone would break the emulsion ratio that
--   makes it work. Recipe 210 has a whole egg only; 211 and 212 have a whole egg plus a
--   yolk. Each doubles in kind:
--       210  egg 1 -> 2                       Parmesan 15 -> 30 g
--       211  egg 1 -> 2, yolk 1 -> 2          Parmesan 25 -> 50 g
--       212  egg 1 -> 2, yolk 1 -> 2          Parmesan 35 -> 70 g
--   Pancetta raised, and it stays PANCETTA -- decisions.md Sec.7 confirms the developer
--   meant this cured pork, not streaky bacon, so the weight goes up rather than the
--   ingredient changing: 20 -> 40 g, 30 -> 60 g, 40 -> 80 g.
--
-- WHAT DOES NOT CHANGE.
--   Recipe 212's linked Fresh Pasta portion stays at the 280 g Phase 5 / Task 12 set. The
--   282 g Fresh Pasta yield is a hard ceiling and the cheat exemption does not cover
--   impossible data (decisions.md Sec.7 says so in terms). Fresh Pasta (36) is an extra and
--   is not touched. Recipes 210 (190 g) and 211 (260 g) are likewise unchanged.
--   The chicken is unchanged on all three.
--
--            BEFORE (kcal/srv, P g, fat %, carb %)   AFTER (informational, cheat meal)
--  210 Light   476  36.5  29.0  40.3                 590  44.5  36.9  32.9
--  211 Moder   650  45.4  31.6  40.4                 836  57.7  40.4  31.9
--  212 Balan   741  48.9  32.8  40.8                 942  63.0  42.7  30.6
--   Fat % now runs 37-43, well over the 35 % audit ceiling, and carbs fall under 38 %.
--   THAT IS THE POINT: it is a cheat meal, the reject conditions no longer apply to it, and
--   the developer asked for exactly this. Recorded here so nobody later reads these numbers
--   as an unnoticed regression. kcal ordering 590 < 836 < 942 still holds.

UPDATE recipe_ingredients SET quantity = 40.00, quantity_grams = 40.00
WHERE recipe_id = 210 AND ingredient_id = 178;              -- Pancetta 20 -> 40 g
UPDATE recipe_ingredients SET quantity = 60.00, quantity_grams = 60.00
WHERE recipe_id = 211 AND ingredient_id = 178;              -- Pancetta 30 -> 60 g
UPDATE recipe_ingredients SET quantity = 80.00, quantity_grams = 80.00
WHERE recipe_id = 212 AND ingredient_id = 178;              -- Pancetta 40 -> 80 g

UPDATE recipe_ingredients SET quantity = 2.00, quantity_grams = 100.00
WHERE recipe_id IN (210,211,212) AND ingredient_id = 59;    -- Egg 1 -> 2 medium (50 -> 100 g)
UPDATE recipe_ingredients SET quantity = 2.00, quantity_grams = 36.00
WHERE recipe_id IN (211,212) AND ingredient_id = 179;       -- Egg yolk 1 -> 2 (18 -> 36 g)

UPDATE recipe_ingredients SET quantity = 30.00, quantity_grams = 30.00
WHERE recipe_id = 210 AND ingredient_id = 30;               -- Parmesan 15 -> 30 g
UPDATE recipe_ingredients SET quantity = 50.00, quantity_grams = 50.00
WHERE recipe_id = 211 AND ingredient_id = 30;               -- Parmesan 25 -> 50 g
UPDATE recipe_ingredients SET quantity = 70.00, quantity_grams = 70.00
WHERE recipe_id = 212 AND ingredient_id = 30;               -- Parmesan 35 -> 70 g

-- recipes.calories is WHOLE-RECIPE kcal (ROUND(per_serving x default_servings), 2 servings
-- on all three). Recomputed from the final rows including the prorated linked Fresh Pasta.
-- NOTE the ordering dependency: Phase 5 / Task 12 above sets recipe 212 to 1425 for the
-- 300 -> 280 g pasta fix. That value was correct for the old sauce and is superseded here.
-- These statements come later in the file, so they win. Do not reorder them.
UPDATE recipes SET calories = 1181 WHERE id = 210;  -- 590 kcal/srv x 2, was 952
UPDATE recipes SET calories = 1672 WHERE id = 211;  -- 836 kcal/srv x 2, was 1299
UPDATE recipes SET calories = 1884 WHERE id = 212;  -- 942 kcal/srv x 2, was 1481 (then 1425)

-- Steps. Step 4 quoted the old egg count on all three, and recipe 212's step 1 was left by
-- Phase 5 as a bare "Prepare the fresh pasta... Use 280g" -- correct on the weight, but it
-- had lost the boil-and-reserve half of the original instruction, which the whole sauce
-- depends on. Both are fixed. Step 3 gains a note about crisping the larger pancetta load
-- in a single layer.
-- PRESERVED VERBATIM: step 1's linked_recipe_id = 36 (Fresh Pasta) and its alt_instruction
-- on all three, and step 5's tip -- the only recipe_steps.tip in the original data set, and
-- the one that stops the sauce scrambling.

DELETE FROM recipe_steps WHERE recipe_id = 210;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 1, 'Prepare the fresh pasta according to the linked recipe. Use 190g dough total (~95g per person). Boil in well-salted water until al dente (2-3 minutes) and reserve a cup of the starchy cooking water before draining.', NULL, 36, 'Cook 190g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 2, 'Pat the chicken dice dry and season with salt and pepper. Sear in a splash of olive oil over medium-high heat, 5-6 minutes, until golden and cooked through (74°C internal). Transfer to a board to rest.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 3, 'In the same pan, cook the diced pancetta over medium heat, 4-5 minutes, until crisp and the fat has rendered. Keep it in a single layer so it crisps rather than steams. Remove the pan from the heat and leave every drop of that fat in it -- it is half the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 4, 'Whisk the 2 eggs, most of the Parmesan and the cracked black pepper in a bowl until pale and homogenous. This is a double batch of sauce, so it will look like a lot -- that is deliberate, and it is what makes the finished plate properly coated rather than barely dressed.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 5, 'Off the heat, add the hot pasta to the pan with the pancetta and its rendered fat, tossing to coat. Working off direct heat, pour in the egg mixture, tossing continuously and adding splashes of reserved pasta water until the sauce turns glossy and coats every strand -- do not let it scramble.', 'If the sauce looks like it is about to scramble, pull the pan further from any residual heat and keep tossing; the pasta''s own warmth is enough to thicken it.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 6, 'Fold in the seared chicken and any resting juices from the board. Taste and adjust the salt -- the pancetta and Parmesan bring most of it, so go carefully.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 210, 7, 'Plate and finish with the remaining Parmesan and extra cracked black pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 210 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 211;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 1, 'Prepare the fresh pasta according to the linked recipe. Use 260g dough total (~130g per person). Boil in well-salted water until al dente (2-3 minutes) and reserve a cup of the starchy cooking water before draining.', NULL, 36, 'Cook 260g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 2, 'Pat the chicken dice dry and season with salt and pepper. Sear in a splash of olive oil over medium-high heat, 5-6 minutes, until golden and cooked through (74°C internal). Transfer to a board to rest.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 3, 'In the same pan, cook the diced pancetta over medium heat, 4-5 minutes, until crisp and the fat has rendered. Keep it in a single layer so it crisps rather than steams. Remove the pan from the heat and leave every drop of that fat in it -- it is half the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 4, 'Whisk the 2 whole eggs, the 2 egg yolks, most of the Parmesan and the cracked black pepper in a bowl until pale and homogenous. This is a double batch of sauce, so it will look like a lot -- that is deliberate, and it is what makes the finished plate properly coated rather than barely dressed.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 5, 'Off the heat, add the hot pasta to the pan with the pancetta and its rendered fat, tossing to coat. Working off direct heat, pour in the egg mixture, tossing continuously and adding splashes of reserved pasta water until the sauce turns glossy and coats every strand -- do not let it scramble.', 'If the sauce looks like it is about to scramble, pull the pan further from any residual heat and keep tossing; the pasta''s own warmth is enough to thicken it.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 6, 'Fold in the seared chicken and any resting juices from the board. Taste and adjust the salt -- the pancetta and Parmesan bring most of it, so go carefully.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 211, 7, 'Plate and finish with the remaining Parmesan and extra cracked black pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 211 AND step_number = 7);

DELETE FROM recipe_steps WHERE recipe_id = 212;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 1, 'Prepare the fresh pasta according to the linked recipe. Use 280g dough total (~140g per person). Boil in well-salted water until al dente (2-3 minutes) and reserve a cup of the starchy cooking water before draining.', NULL, 36, 'Cook 280g dried spaghetti in salted boiling water according to package directions. Reserve a cup of the cooking water before draining.'
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 1);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 2, 'Pat the chicken dice dry and season with salt and pepper. Sear in a splash of olive oil over medium-high heat, 5-6 minutes, until golden and cooked through (74°C internal). Transfer to a board to rest.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 2);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 3, 'In the same pan, cook the diced pancetta over medium heat, 5-6 minutes, until crisp and the fat has rendered. Keep it in a single layer so it crisps rather than steams. Remove the pan from the heat and leave every drop of that fat in it -- it is half the sauce.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 3);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 4, 'Whisk the 2 whole eggs, the 2 egg yolks, most of the Parmesan and the cracked black pepper in a bowl until pale and homogenous. This is a double batch of sauce, so it will look like a lot -- that is deliberate, and it is what makes the finished plate properly coated rather than barely dressed.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 4);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 5, 'Off the heat, add the hot pasta to the pan with the pancetta and its rendered fat, tossing to coat. Working off direct heat, pour in the egg mixture, tossing continuously and adding splashes of reserved pasta water until the sauce turns glossy and coats every strand -- do not let it scramble.', 'If the sauce looks like it is about to scramble, pull the pan further from any residual heat and keep tossing; the pasta''s own warmth is enough to thicken it.', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 5);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 6, 'Fold in the seared chicken and any resting juices from the board. Taste and adjust the salt -- the pancetta and Parmesan bring most of it, so go carefully.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 6);
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 212, 7, 'Plate and finish with the remaining Parmesan and extra cracked black pepper.', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = 212 AND step_number = 7);

-- No macros_audited write for family 93. Intentional and load-bearing: recipes 210, 211 and
-- 212 stay at macros_audited = 0 forever unless the developer takes them back out of cheat.

-- =====================================================================================
-- POST-APPLY VERIFICATION -- read-only. Run after the whole file has been applied.
-- =====================================================================================
-- These belong to tasks.md Phase 12 (Apply and verify). The full reject-query set is in
-- tasks.md Tasks 36, 37 and 38 -- run those too. The queries below are the ones that catch
-- an ordering mistake specific to THIS file, which those generic queries would not.

-- Must return 1884, NOT 1425. If it returns 1425, the Phase 5 section was re-run after
-- Phase 11b had already landed -- the Railway console commits per statement, so an operator
-- resuming a partial apply and re-pasting from the top silently regresses recipe 212's
-- calories to the pre-sauce-doubling value. Re-run the three Phase 11b `UPDATE recipes SET
-- calories` statements to correct it.
SELECT calories FROM recipes WHERE id = 212;

-- Must return 3. Same check as the mandatory one inside Phase 9 -- repeated here so a
-- verification pass alone catches a family 8 Light that never got created.
SELECT COUNT(*) AS family_8_members FROM recipe_family_members WHERE family_id = 8;

-- Must return 0 rows. Ingredient 69 (Potatoes) is merged into 121 (Potato); nothing may
-- still reference it, and shopping_list_items has no FK to enforce that.
SELECT 'ingredients' AS src, COUNT(*) AS refs_to_69 FROM ingredients WHERE id = 69
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients WHERE ingredient_id = 69
UNION ALL
SELECT 'shopping_list_items', COUNT(*) FROM shopping_list_items WHERE ingredient_id = 69;

-- =====================================================================================
-- Phases 12-13 append below this line in a later run.
-- =====================================================================================

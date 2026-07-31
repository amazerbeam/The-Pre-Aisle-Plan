# Recipe audit remediation — calorie policy, 5 real failures, and the variant-picker fixes

Plan: [`plan.md`](./plan.md) · Tasks: [`tasks.md`](./tasks.md) · Verification query: [`verify-macros.sql`](./verify-macros.sql)

## Summary

An audit of 20 recipe families reported 12 failures, but every one of those families rendered **all-green macro badges** in the UI. The cause was a standard that had drifted from the display: `client/src/constants/macroTargets.js:19` states the kcal band is "deliberately not traffic-lit", while three separate prose copies of the reject thresholds — `CLAUDE.md`, `.claude/rules/recipe-variants.md`, `.claude/skills/chef/SKILL.md` — still failed a recipe on per-serving calories. The display was right.

This PR resolves that, then fixes what actually was broken.

**1. Calories become a target, not an audit reject.** Stated once, canonically, in `.claude/rules/recipe-variants.md`. `CLAUDE.md`, the `chef` skill and the `diet-guidelines` skill now *point at* it rather than restating thresholds — the four-copy drift is what caused the bug, so a fifth copy was not the fix. Protein ≥ 35 g, fat ≤ 35 % of kcal and carbs ≥ 38 % of kcal remain hard rejects, as does family structure (3 members, Moderate default, correct labels, `Light < Moderate < Balanced` kcal ordering).

**2. Re-scored on protein/fat/carbs alone, 12 failures became 6 variants across 5 families** — all now fixed, each with a single lever:

| Recipe | Variant | Lever | Before | After |
|---|---|---|---|---|
| 84 | Black Pepper Beef, Light | sirloin 180 → 290 g | P 24.6 g | **P 36.1 g** |
| 85 | Black Pepper Beef, Moderate | sirloin 240 → 330 g | P 31.9 g | **P 41.4 g** |
| 111 | Chop Suey, Light | thigh 100 → 140 g, sirloin 100 → 125 g | P 30.6 g | **P 38.4 g** |
| 190 | Salmon, Light | olive oil 6 → 2 g | F 35.8 % | **F 33.6 %** |
| 127 | Reina Arepa, Light | mayo link 15 → 12 g | C 37.9 % | **C 38.7 %** |
| 90 | Paella Valenciana | olive oil 46 → 32 g | F 35.2 % | **F 32.7 %** |

**3. The variant picker is repaired in 14 places.** Nine families defaulted to **Balanced**, handing users the highest-calorie option; five listed Moderate before Light. The developer's remedy for an over-target family is "pick a different variant", which only works if the picker is honest.

**4. Paella Valenciana became a real family.** It was a family of one with a NULL `variant_label` — the one dish where picking a different variant was impossible. Now Light (208) / Moderate (90, default) / Balanced (209) at `default_servings = 4`, with the Pizza Sauce linked step and its `alt_instruction` preserved on all three.

**5. 212 rows converted from grams to cook-friendly display units** — `10 g garlic` → `3 cloves`, `150 g egg` → `3 pieces`. `quantity_grams` was never written, and this is verified: the macro fingerprint across all 60 rows is byte-identical before and after.

**6. 19 of 20 families marked `macros_audited = 1`** (57 recipe rows), `macros_audited_by` left NULL. One family withheld — see below.

## Migrations, in required apply order

All under `foodbytes-app/database/migrations/`. **DML only — no DDL, no column changes, so Hibernate `ddl-auto: validate` is unaffected and no backend redeploy is required.**

1. `2026-07-30_audit_structural_and_seed_oil.sql` — the Ghee `INSERT` must precede its own `UPDATE … ingredient_id = 177` or the FK fails
2. ⚠️ `2026-07-30-linked-extras-macro-kcal-corrections.sql` — **from the separate in-flight contract** `2026-07-30-linked-extras-macro-kcal-audit`. Both it and #3 write `recipes.calories` on recipes 90 and 127
3. `2026-07-30_audit_macro_fixes.sql`
4. `2026-07-30_paella_valenciana_variants.sql`
5. `2026-07-30_legacy_display_units.sql` — after #3/#4 so new gram weights get correct units
6. `2026-07-30_mark_recipes_audited.sql` — last; gated on a clean recompute

**On the #2 ordering hazard:** the plan treated this as strict, but that migration's calories fix is *self-computing* (`ROUND(SUM(...))` from live ingredient rows), not hardcoded. Applied *after* this work it recomputes 90 and 127 from the corrected grams rather than clobbering them. It was **not** applied here — its header lists four decisions the developer must make first, and it belongs to another contract.

## User-visible behaviour change

**Nine families now open on Moderate instead of Balanced.** Default calories drop across a large slice of the app. This is intended, but it is a visible change, not a silent data correction.

## Verification results

| Phase | Gate | Result |
|---|---|---|
| 2 | 19 families structurally valid (3 members, Moderate default, `Light,Moderate,Balanced`) | ✅ zero violations |
| 2 | Macros unmoved by the ghee swap | ✅ same 6 failures before and after |
| 3 | Five fixes pass P/F/C, all within ±0.5 of projection | ✅ |
| 3 | `stored_cal_check` = `ok` on all five | ✅ |
| 3 | kcal ordering on families 24/33/38/89 | ✅ 528/632/744 · 583/630/787 · 473/586/755 · 534/642/757 |
| 4 | Family 26 valid; all three variants pass P/F/C | ✅ |
| 4 | Pizza Sauce linked step + `alt_instruction` on 90/208/209 | ✅ 1 each |
| 4 | Water scaled per variant | ✅ 675 / 900 / 1080 ml |
| 5 | Macro fingerprint identical to pre-sweep baseline | ✅ `IDENTICAL TO BASELINE` (Σ protein 2868.9522, Σ carb % 2533.5784, Σ fat % 1733.1665, Σ kcal 84861.0281) |
| 5 | No cook-hostile gram rows remain | ✅ zero |
| 5 | No absurd display quantities (> 12 units) | ✅ zero, after two sugar rows promoted to tbsp |
| 6 | No partially-audited family, database-wide | ✅ zero |
| 7 | 60 rows in the 20 families; 0 wrongly attributed | ✅ 57 audited, 0 `macros_audited_by` set |
| 7 | Policy stated once, referenced from 3 files | ✅ |
| 7 | No stale kcal reject threshold anywhere | ✅ zero |
| 7 | No source file modified | ✅ verified by timestamp (git not installed) |

## Corrections made at apply time

Three defects in the contract's own numbers, found by running its gates. Each is recorded in the relevant migration's header comment.

1. **Recipe 209's stored calories were wrong.** The plan projected Balanced at P 45.5 g/srv and 979 kcal/srv, and wrote `calories = 3915`. Measured after insert: **P 39.5 g, 910 kcal/srv, whole-recipe 3641** — the projection was arithmetically impossible, since all three variants share the same 530 g of wings, so protein/serving cannot move 8 g between siblings. 3915 tripped the > 5 % `stored_cal_check` and would have blocked marking family 26. Corrected to 3641 in both the database and the migration file. Balanced's 51.3 % carbs is over the 50 % design target but is not a reject.
2. **The Sugar → tsp conversion produced two unusable readings** — Brioche Buns (60) at 12.5 tsp and Eggnog (61) at 17.5 tsp. Promoted to tbsp at 12.5 g (exactly 3 × the 4 g/tsp basis used above it). Added to the migration, guarded so it is a no-op on re-run.
3. **Task 10's expected insert count was 8; the SQL it dictates has 10** — two each into `recipes`, `recipe_meals`, `recipe_ingredients`, `recipe_steps`, `recipe_family_members`. The step's real invariant (every `INSERT` carries exactly one guard) passes at 10 = 10. No SQL was removed to force a match.

## Outstanding

**Family 23 (Spaghetti Bolognese, 81/82/83) is deliberately NOT marked audited.** Its protein, fat % and carbs % all pass. What fails is the `chef` skill's marking precondition that `recipes.calories` agree with the recomputed whole-recipe total within 5 %: stored 1378/1545/1874 against computed 1254/1407/1701, i.e. **+9.9 % / +9.8 % / +10.1 %**. That column is explicitly the in-flight linked-extras contract's scope, not this one's. Marking the family would have made the flag a false attestation, so all three ids are commented out in migration #6 with a note.

**To close it:** apply the linked-extras migration, re-run `verify-macros.sql` to confirm `stored_cal_check = 'ok'` on 81/82/83, then uncomment the line and re-run migration #6. That takes the audit to 20 of 20 families / 60 rows.

**Two contract checks are broader than the migrations they verify** — Task 6 Step 2 asserts `sunflower_rows = 0` and `suffixed_names = 0` database-wide, while the migrations are scope-limited. 13 `Sunflower Oil` rows remain (Mayonnaise 62, Pad Thai 91–93, Beef & Mushroom 104–106, Drunken Noodles 108–110, Korean Fried Chicken 121–123), and 3 `- Diet` names remain on Greek Chicken Gyros Bowl (188/194/195, family 87 — not in this audit). **Neither now matters:** the seed-oil prohibition was removed from `CLAUDE.md` during this work, and family 87 is out of scope. Both checks should be narrowed or dropped, not chased.

**The unit sweep's missing spices are now closed except one.** `plan.md`'s Phase 5 table listed Cinnamon, Cumin, Paprika, Oregano and Italian herbs as gram → tsp conversions; the SQL in `tasks.md` Task 13 omitted all five. A live check found only three had any gram rows at all. Cinnamon (19, 3 rows) and Dried oregano (35, 3 rows) are now converted at 2 g/tsp and the statements are in migration #5. **Paprika (65, 3 rows) is still in grams** — its statement is written in the migration but the permission classifier blocked that single write at apply time, twice, while the byte-identical Cinnamon and oregano statements succeeded. Re-run migration #5 to pick it up; it is guarded on `unit_id = 1`, so everything already converted is a no-op. Cumin and Italian herbs have zero gram-unit rows and need nothing.

**Review round 1 raised one finding that was rejected on evidence.** All three reviewers concluded this contract's pipeline deleted the "Quality fats: butter, olive oil, ghee — not seed-oil blends" sentence from `CLAUDE.md`, and two recommended restoring it. The developer removed it themselves mid-session; file timestamps confirm the edit (21:03) postdates the pipeline's only `CLAUDE.md` write (20:26). It was **not** restored. What *was* fixed is every place that had become a false claim about `CLAUDE.md`'s contents: the seed-oil justification in migration #1's header, and the "From `CLAUDE.md` — apply automatically" citation in `diet-guidelines/SKILL.md`.

**Open decision for the developer:** `.claude/skills/chef/SKILL.md` still prohibits seed oils in its Core philosophy and DO-NOT list. That is now inconsistent with `CLAUDE.md`, which no longer mentions them. Deliberately left alone — deciding whether the project keeps a seed-oil stance is a policy call, not a side effect of a calorie-policy contract. If it should go, it should go the way the calorie policy came in: stated once, canonically.

**Stale cross-reference in the other contract:** `2026-07-30-linked-extras-macro-kcal-corrections.sql` Section 4b still describes recipe 90 / family 26 as "the family's only member… invisible in the variant dropdown". Phase 4 here made it a three-member family, so that rationale is superseded. The commented SQL is a harmless no-op if ever run. Not edited — it belongs to the in-flight contract.

## For future contributors

Per-serving kcal no longer fails an audit. See `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition (audit policy, 2026-07-30)". Protein, fat %, carbs % and family structure are what reject.

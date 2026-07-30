# Audit evidence: linked-extras macro / calorie calculation

Plan folder: `.claude/contract/2026-07-30-linked-extras-macro-kcal-audit/`
Audit performed read-only against the live Railway MySQL on 2026-07-30 (no `users` table read). All figures below are quoted from `plan.md` -> Part 1 -> "Cross-code alignment audit (FE <-> BE <-> DB)"; nothing here is re-derived or re-queried.

Extras footprint: 64 `recipe_ingredients` rows carry `linked_recipe_id IS NOT NULL`, spanning 48 parent recipes and 10 distinct child recipes (pizza dough, pizza sauce, fresh pasta, milk bread, flatbread, pita, brioche buns, mayonnaise, burger patties, honey ham). 38 of the 64 are FR-103 dual-path rows (`ingredient_id` also set) - dual-path is the majority case.

---

## 1. Verdict

The calculation engine is correct on the macro side; the calorie column is never computed at all. `MacroCalculationService.calculateRecipeTotalMacros` tests `isLinkedRecipe()` before `isRawIngredient()`, so on every one of the 38 dual-path rows the homemade linked-recipe branch wins and the store-bought ingredient is never read - protein, carbs, and fat are correctly derived from raw ingredients plus prorated linked extras in every case. This already satisfies the developer's confirmed decision that nutrition is always the homemade path, whether or not the store-bought toggle is selected in `HomemadeSelectionsContext` (localStorage-only, feeds the shopping list, never nutrition).

Calories are a different story: no code path derives kcal from the ingredient graph. Every kcal figure the user sees - `RecipeCard`, meal-plan totals, the admin form - reads the hand-entered `recipes.calories` column, and on 20 of the 48 recipes with extras that column was worked out on the store-bought basis, the one basis the developer has explicitly ruled out for nutrition ("We should never use the store bought calores, if store bough is chosen the cals sill come from homemade"). This is not drift or a typo pattern: for 9 of those 20 recipes the gap between the stored value and the homemade-computed total equals the summed store-bought-minus-homemade delta of their dual-path rows to the exact kcal, and on Pizza (14) it matches exactly - stored 1212 against a store-bought-path total of 1212 and a homemade total of 1269. The result is a two-number bug that is real and user-visible: `RecipeCard` renders the stored (store-bought-basis) column while `MacroBadgeRow` derives 4P + 4C + 9F from the correctly-computed homemade macros, so the same screen shows two disagreeing versions of the same dish - Greek Chicken Gyros (119) shows 650 kcal on the card beside badge percentages computed against 765 kcal.

---

## 2. Root cause proof

The proof that the stored column was built on the store-bought basis, not drift: for each recipe, `stored - homemade_computed` is compared against the summed `store_bought - homemade` delta across that recipe's dual-path rows. A residual of (or very near) zero means the store-bought swap fully explains the gap - i.e. the stored figure literally is the store-bought total.

| Recipe id | Gap (stored - homemade) | Store-bought swap delta | Residual | Interpretation |
|---|---|---|---|---|
| 63 | +512 | +512 | 0 | Fully explained - store-bought basis |
| 81 | +124 | +124 | 0 | Fully explained - store-bought basis |
| 82 | +138 | +138 | 0 | Fully explained - store-bought basis |
| 83 | +173 | +173 | 0 | Fully explained - store-bought basis |
| 98 | +91 | +91 | 0 | Fully explained - store-bought basis |
| 99 | +136 | +136 | 0 | Fully explained - store-bought basis |
| 100 | +182 | +182 | 0 | Fully explained - store-bought basis |
| 120 | -249 | -249 | 0 | Fully explained - store-bought basis |
| 118 | - | - | 3 | Almost fully explained - store-bought basis, 3 kcal short |
| 119 | - | - | -40 | Partly explained (~83%) - store-bought swap plus a residual 40 kcal error |
| 28 | - | - | -66 | Not explained - recipe 28 has no dual-path row at all; this is a standalone wrong number |

Exact-to-the-kcal agreement across nine independent recipes (63, 81, 82, 83, 98, 99, 100, 120, and Pizza 14 in Section 5 below) is mechanism, not coincidence - the stored `recipes.calories` value on these rows was computed by summing the store-bought ingredient's kcal contribution instead of the linked recipe's prorated homemade contribution.

---

## 3. Classification of all 48 recipes with extras

Re-running the diagnosis with no divergence cutoff and a +/-3 kcal tolerance (the naive >5% divergence check used earlier concealed the true scope - it only caught 11 of the 48):

20 recipes - stored value is on the store-bought basis (the derivation fix in Phase 2/3 corrects the display; the migration in Phase 6 realigns the admin column):
ids 13, 14, 15, 44, 63, 65, 81, 82, 83, 88, 89, 90, 98, 99, 100, 107, 118, 120, 127, 129

15 recipes - stored value is already correct on the homemade basis (no correction needed):
ids 29, 37, 38, 39, 50, 51, 52, 53, 54, 55, 196, 197, 205, 206, 207

13 recipes - stored value matches neither basis (individual review required; no single mechanism explains them):
ids 20, 21, 22, 28, 45, 46, 87, 119, 128, 136, 137, 138, 189

20 + 15 + 13 = 48, accounting for every recipe with extras.

---

## 4. Positive control - Pink Sauce Pasta (37/38/39)

Recipes 37, 38, 39 (the three Light/Moderate/Balanced variants of Pink Sauce Pasta) draw 52-55% of their kcal from linked sub-recipes - the highest extras dependency of any recipe in the database: 220 g of a 282 g Fresh Pasta batch, and 180 g of a 428 g Pizza Sauce batch. Because the Fresh Pasta row on this dish is linked-only (no `ingredient_id` set), there was never a store-bought figure available to be substituted by mistake - which makes this family a clean test of the proration arithmetic in isolation.

Result: stored and computed kcal match within 1 kcal across all three variants - 515/515, 651/650, 801/801. All three variants also independently pass the `CLAUDE.md` per-variant macro targets (kcal band, >=35 g protein, fat 25-35%, carbs 40-50%).

This proves `quantity_grams / linkedTotalYield` proration is arithmetically sound and localises the defect entirely to the stored column, not to the traversal maths.

---

## 5. Worked example - Pizza (14)

Pizza (recipe 14, the Moderate variant of family 4) is the clearest single case, and it happened to sit below the naive 5% divergence cutoff at 4.5% - which is exactly why the naive check under-counted the defect's true scope (Section 3).

- Pizza Dough batch: 761 g total yield / 2053 kcal
- Pizza Sauce batch: 428 g total yield / 207 kcal
- Pizza (14) uses 260 g of the dough and 90 g of the sauce, plus raw toppings at 524 kcal

Homemade basis (the correct one, per the developer's decision):
- Dough contribution: 260/761 x 2053 ~= 702 kcal
- Sauce contribution: 90/428 x 207 ~= 44 kcal
- Total whole-recipe: 702 + 44 + 524 ~= 1269 kcal -> 634 kcal/serving (default servings = 2)

Store-bought basis (what is actually stored):
- Dough -> store-bought ingredient: 650 kcal
- Sauce -> store-bought ingredient: 38 kcal
- Raw: 524 kcal
- Total: 650 + 38 + 524 = 1212 kcal - the stored `recipes.calories` value, exactly.

This is the single cleanest proof in the audit: the stored figure is not close to the store-bought total, it is the store-bought total, to the kcal.

---

## 6. Clean checks - no violation found

Three checks came back clean and needed no fix:

- Linked prep steps are complete. The `.claude/rules/linked-recipe-extras.md` verification query (every linked `recipe_ingredients` row must have a matching `recipe_steps` row carrying the same `linked_recipe_id` and a populated `alt_instruction`) returns zero rows - no violation across all 64 linked rows.
- Traversal depth is exactly 1. A query for rows whose `recipe_id` is itself some other row's `linked_recipe_id` returns zero rows - no child recipe links a grandchild.
- No repeated child, no diamond. The per-parent check (max 3 linked rows per parent, `distinct_children` equal to `linked_rows` in every case) confirms no parent links the same child twice and no two children share a grandchild. The `visitedRecipeIds` cycle-guard defect identified in `plan.md` Part 2 is therefore a latent bug, not an active one - production data cannot trigger it today, but the new unit tests must still assert the correct behaviour rather than encode the bug as expected.

---

## 7. Data defects

Four data-integrity defects were found, independent of the calorie-basis bug above:

1. Recipe 65 `quantity_grams` over-yield. Recipe 65 Pastichio (Lasagna) consumes 454 g of recipe 36 Fresh Pasta, whose total yield is only 282 g -> `portionRatio = 1.6099`. This trips the reject condition in `.claude/rules/linked-recipe-extras.md` ("`quantity_grams` must be <= linked recipe's total yield") and over-attributes the pasta contribution by 61%. All other 63 linked rows have legitimate ratios between 0.0485 and 0.9220.
2. Family 4 (Pizza) has four members, not three. 13 Light, 14 Moderate (default), 15 Balanced, and a fourth - 107 "Balanced 2" at `display_order` 4. This breaches `.claude/rules/recipe-variants.md`'s "exactly three members, labels exactly Light/Moderate/Balanced" rule.
3. Family 26 (Paella Valenciana) has a NULL `variant_label`. Its single member, recipe 90, carries `variant_label = NULL` with `is_default = 1` - also a structural violation of `.claude/rules/recipe-variants.md` (a family of one is invisible in the variant dropdown per `RecipeFamilyService.getVariantsForRecipe`, and the label is not one of the three sanctioned values).
4. Wrong store-bought products (shopping-list defect, not a macro defect). Given homemade-only nutrition is confirmed, store-bought per-100g macros on dual-path rows are never read for any displayed number - so divergence in kcal-per-100g between the two paths is diagnostic, not a defect. What is a real defect is when the mapped store-bought product is the wrong item entirely, because the shopping list buys it:
   - `Milk Bread -> Brioche Burger Buns` - sends the shopping list for burger buns when the dish needs a loaf.
   - `Fresh Pasta -> Spaghetti (dried)` - compares dried pasta weight to fresh dough weight with no hydration factor applied (100 g dried ~= 250 g cooked).

---

## 8. Out of scope - recipes breaching `CLAUDE.md` reject ceilings once computed correctly

The `CLAUDE.md` per-variant macro targets (restated for reference, with provenance per the Provenance (verified 2026-05-12) block in `CLAUDE.md`):

| Variant | kcal/serving target | Reject if | Protein | Fat % kcal | Carbs % kcal |
|---|---|---|---|---|---|
| Light | 450-550 | >600 | >=35 g | 25-35% | 40-50% |
| Moderate | 550-650 | >750 | >=35 g | 25-35% | 40-50% |
| Balanced | 700-800 | >900 | >=35 g | 25-35% | 40-50% |

Sources, per `CLAUDE.md`'s Provenance block:
- Protein >=35 g/serving - USDA Dietary Guidelines for Americans 2025-2030 (1.2-1.6 g/kg/day -> 32-43 g across 3 meals for an 80 kg adult), corroborated by Moore/Morton muscle-protein-synthesis literature (20-40 g/meal sweet spot).
- Fat 25-35% of kcal - upper half of the USDA Acceptable Macronutrient Distribution Range (AMDR), which runs 20-35%.
- Carbs 40-50% of kcal - intentionally set below the USDA AMDR floor (45-65%) to favour protein on a calorie deficit; this is a project-internal choice, not formal AMDR compliance.
- Per-serving kcal bands (450-550 / 550-650 / 700-800) - project-internal calibration, calibrated so 3x Moderate ~= 1650-1950 kcal/day, consistent with NIH/NHLBI's 500-1000 kcal/day deficit guidance.
- Reject ceilings (Light >600, Moderate >750, Balanced >900) - project-internal; a meal-plan safety ceiling so a single recipe cannot exhaust the daily budget when stacked with two others. No external source backs the specific ceiling numbers.

Once calories are correctly derived from the ingredient graph rather than the stored column, the following five recipes with extras breach the Balanced reject ceiling of 900 kcal/serving - the most permissive of the three bands - and so breach whatever variant band they actually belong to:

| Recipe id | Dish | Correctly-computed kcal/serving | Reject ceiling breached | Margin over ceiling |
|---|---|---|---|---|
| 63 | Homemade Big Mac | 1543 | Balanced (>900) | +71% (+643 kcal) |
| 22 | Black Bean Chicken Wrap | 1059 | Balanced (>900) | +18% (+159 kcal) |
| 46 | Stromboli | 1056 | Balanced (>900) | +17% (+156 kcal) |
| 120 | Greek Chicken Gyros | 967 | Balanced (>900) | +7% (+67 kcal) |
| 29 | Salmon Sandwich | 904 | Balanced (>900) | +0.4% (+4 kcal) |

Per `CLAUDE.md`'s remediation levers (air-fry instead of pan-fry, egg whites for whole eggs, added starch for carb balance, scaling lean protein), these five dishes need portion or ingredient redesign to land back inside the target bands. That redesign is explicitly out of scope for this plan - it is a `chef`-skill engagement with its own acceptance criteria (macro-target compliance), whereas this plan's acceptance criterion is calculation correctness (deriving the right number, whatever that number turns out to be). Fixing the calculation is what exposes these five breaches; it does not, and should not, silently redesign the dishes to hide them. Recipe 120 (Greek Chicken Gyros) is a direct consequence of the fix itself: homemade pita is more calorific than the store-bought stand-in it was previously priced against, so correcting the calculation pushes this dish over the ceiling rather than pulling it under.

This list is not exhaustive of every recipe in the database breaching target bands - it is scoped to the 48 recipes with linked extras that this audit covers. A full-database macro-compliance sweep is a separate effort.

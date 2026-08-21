# MPP-5 — Five-lens audit findings

**Phase 1 deliverable. Read-only. Zero writes were issued against the live Railway MySQL and no migration file was created.**

Run date: 2026-08-18. Method: recursive-CTE recompute per `plan.md` -> Data shapes -> *Recompute formula*, expanding every `linked_recipe_id` by `quantity_grams / linked_total_yield`, depth-capped at 6, raw-ingredient contributions taken only from rows where `linked_recipe_id IS NULL`, kcal by Atwater (4P + 4C + 9F) because `ingredients` carries no kcal column. **Homemade basis throughout** — FR-103 dual-path rows contribute through the linked recipe, never the store-bought ingredient.

Sub-recipes and extras (Milk Bread 26, Pizza Dough 11, Pizza Sauce 12, Fresh Pasta 36, Pita Bread 117, Goodness Granola 213, Honey Ham 64, Mayonnaise 62, Burger Patties 43, Flatbread 19) were **read only**. No extra is audited, flagged for change, or signed off. Where a parent portion is wrong the fix is always to the parent row.

No rows were selected from `users`, `meal_plan_entries`, `shopping_lists` or `shopping_list_items`. `macros_audited_by` stays NULL in every proposal — it is an FK to `users.id` and an agent-run audit has no user row.

---

## Headline numbers

| Measure | Value |
|---|---|
| Families recomputed (ticket scope) | **35** (37 unaudited less families 36 and 41, which have zero live members) |
| Live recipes recomputed | **106** |
| Recipes tripping >=1 macro reject | **41** across 15 families |
| Recipes macro-clean | **65** across 20 families |
| Families reported in this document | **37** (the 35 + family 27 Pad Thai + family 17 Chicken Burrito Bowl, both re-opened on developer request) |
| Structural hard rejects (whole table) | 17 families, of which **14** have live members |
| Lens-5 naming rejects | 3 recipes (188, 194, 195) |
| Lens-2 unit-realism rows | **89** rows across **14** ingredient groups in the 35 families (98 rows / 14 groups including families 17 and 27) |
| Linked-extras rejects | 1 in scope (recipe 212), 1 out of scope (recipe 65, cheat) |
| Missing linked prep steps | **0** |
| Duplicate ingredient pairs | **1** (`Potatoes` 69 / `Potato` 121) |
| Homemade-first violations | **2 families** (105, 106) — NOT zero as the plan asserted |
| Gout avoid-list violations in scope | **2 families** (5, 22) — Worcestershire sauce, not anticipated by the plan |
| Mark-for-deletion nominees | **0 new**. The four plan nominees are reclassified as cheat meals by developer instruction. |

Every `Expected:` figure in `tasks.md` matched reality except where called out in **Divergences from the plan** below.

---

## Divergences from the plan — read these first

Reality wins over the expected figures. Each divergence is stated with the actual number.

1. **The default-on-`Balanced` list is 14 live families, not 13.** The plan named 13 (1, 5, 8, 9, 10, 12, 14, 16, 22, 28, 29, 35, 37) and said the live query returns 15 rows of which 2 are fully retired. The live query returns **16** rows; excluding families 36 and 41 (zero live members) leaves **14**. The extra is **family 7 (Chicken & Vegetable Soup)** — recipes 23/24/25, `is_default = 1` on `Balanced`, and **already signed off** (`macros_audited = 1`, `macros_audited_at = 2026-07-30`). It fell out of the ticket list because the ticket counted only unaudited families. So an already-attested family is carrying a hard structural reject that nothing in this contract is scheduled to fix.

2. **The lens-2 unit set is 14 ingredient groups / 89 rows in the ticket 35 families, not 13 / 83.** The plan omitted the **`Tomato` (ingredient 48)** group entirely: 9 rows stored in grams at 25-120 g, of which 6 are in the 35 families (recipes 118/119/120 and 247/248/249) and 3 in family 17. The `Onion` count of 16 and `Avocado` count of 3 are correct for the 35 families; including families 17 and 27 they are 19 and 6.

3. **The plan claim "No raw sub-component ingredients — the homemade-first rule is satisfied across the whole table" is wrong.** That query used a hardcoded name list. A generalised join of `ingredients.name` against `recipes.name` finds **two live violations**, both in families the plan classed as macro-clean and ready to sign off:
   - **Family 106** (recipes 250/251/252) uses raw `Mayonnaise` (ingredient 87) at 10/12/18 g while the `Mayonnaise` recipe (62) exists and is live.
   - **Family 105** (recipes 247/248/249) uses raw `Beef Burger Patties` (ingredient 95) while the `Burger Patties` recipe (43) exists and is live. The name differs, so an exact-name join misses it; the real-world item is the same.

4. **Two in-scope families contain Worcestershire sauce, which `CLAUDE.md` and `diet-guidelines` put on the gout avoid-list.** The plan flagged only the Pad Thai fish sauce, which is *out* of scope. In scope: **family 5** (recipes 16/17/18, 9/9/14 g, inside the peanut sauce) and **family 22** (recipes 78/79/80, 18 g each, in the braise). Worcestershire also appears in already-audited families 24 (27 g) and 92 (3.5 g), in the family-less `Burger Patties` (43, 17 g) and in cheat recipe 65 — all outside this contract but recorded because the exposure is the same.

5. **The plan premise for the family 5 fix is wrong.** The plan proposes "adding rice — defensible because satay is conventionally served with rice". Jasmine rice is **already in all three variants** (56 / 74 / 92 g dry, ingredient 26) and step 3 cooks it. The 48 % fat is driven by chicken *thigh* + coconut milk + peanut butter, not by a missing starch.

6. **Recipe 212 recomputed `calories` after the pasta fix is 1425, not ~1459** as the plan predicted.

7. **Family 4 Light carb fix cannot be "raise the dough" alone.** Raising recipe 13 dough by 80 g clears carbs at 41.4 % but lands Light at 608 kcal/serving against Moderate 603 — **breaking the `Light < Moderate` kcal ordering, a hard reject.** A coordinated three-variant change is required; numbers below.

8. **Family 35 FR-103 dual-path row diverges 47 % between its two paths.** Homemade `Pita Bread` (recipe 117) computes to **389 kcal / 100 g** (P 11.10 / C 64.25 / F 9.76) against the store-bought `Pita Bread` ingredient (157) at **265 kcal / 100 g** (P 8.50 / C 55.00 / F 1.20). `.claude/rules/linked-recipe-extras.md` flags divergence over 10 %. This is the mechanism behind the store-bought-basis `calories` bug `CLAUDE.md` documents for this family, now quantified. Because extras are read-only the divergence itself is **reported, not fixed**; it also explains why family 35 fails fat % — the homemade pita carries 9.76 g fat/100 g.

9. **`recipe_steps.tip` is populated on 3 of 745 in-scope steps** (family 93 only). Not a reject, but the field is effectively unused.

10. **Family 22 carries a `step_number = 0` row** (a CHEF NOTE) on all three variants. Numbering is therefore not contiguous from 1, which the plan own post-apply verification queries (`MIN(step_number) <> 1`) would fail on.

---

## Additional findings the ticket does not name

### Family 7 — Chicken & Vegetable Soup (out of scope, already attested)

`is_default = 1` sits on `Balanced` (recipe 25). Labels and member count are legal; `display_order` is 1/2/3. Signed off 2026-07-30. **Proposed fix:** add family 7 to the `is_default` move so the list becomes 10 non-cheat families (1, 5, 7, 8, 9, 10, 12, 22, 35, 37). It is a two-row `recipe_family_members` write with zero macro impact and does not invalidate the attestation (`recipe_family_members` is not `recipe_ingredients`, `default_servings` or `calories`). If the developer prefers to keep out-of-scope families untouched, the alternative is a separate ticket — but leaving it silent means an attested family stays illegal.

### Greek yogurt portion realism (families 95, 96)

| Recipe | Family | Yogurt | Per serving |
|---|---|---|---|
| 222 | 96 Balanced | 900 g | **450 g** |
| 221 | 96 Moderate | 700 g | 350 g |
| 220 | 96 Light | 600 g | 300 g |
| 219 | 95 Balanced | 600 g | 300 g |
| 218 | 95 Moderate | 500 g | 250 g |
| 217 | 95 Light | 470 g | 235 g |

450 g of Greek yogurt is a whole large tub per person. These families pass every macro reject *because* yogurt is protein-dense, which is exactly the failure mode the chef lens-4 test exists to catch. **Proposed fix:** family 96 yogurt 600/700/900 -> **400/450/500 g**, with the granola raised to hold kcal (Goodness Granola is 479 kcal/100 g, so +20 g granola replaces ~95 g of yogurt on kcal). Family 95 is a smoothie, where 235-300 g/serving is defensible; **no change proposed, recorded as accepted**.

### Oyster sauce (families 31, 32, 33 — all out of scope, already attested)

`Oyster Sauce` (147) at 15-40 g. `diet-guidelines` says *moderate* oyster sauce rather than avoid. Recorded for completeness; **no change proposed**.

---

## Structural findings (lens 1 — family structure)

All queries from `.claude/rules/recipe-variants.md`. 17 families fail at least one structural check; 14 have live members.

| Family | Members | Labels (by display_order) | Default | display_order | In scope? | Proposed fix |
|---|---|---|---|---|---|---|
| 1 Porridge | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 4 Pizza | **4** | Light,Moderate,Balanced,**Balanced 2** | Moderate | 1/2/3/4 | yes | retire recipe 107 (is_live = 0 + remove membership) |
| 5 Chicken Satay | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 7 Chicken & Veg Soup | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | no (attested) | default -> Moderate (see above) |
| 8 Salmon Sandwich | **2** | Moderate,Balanced | **Balanced** | 1/2 | yes | create a Light; default -> Moderate; renumber 1/2/3 |
| 9 Lentil Stew | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 10 Lentil Stuffed Peppers | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 12 Chicken Tikka Masala | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 14 Steak & Chips | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | cheat | **no fix** — exempt |
| 16 Avocado Toast | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | cheat | **no fix** — exempt |
| 22 Irish Beef Stew | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 28 Tortilla Espanola | **4** | **Moderate=1**,Light=2,**Extra Light**=3,Balanced=4 | **Balanced** | wrong | cheat | **no fix** — exempt; two hard rejects persist |
| 29 French Toast | 3 | **Moderate=1**,Light=2,Balanced=3 | **Balanced** | wrong | cheat | **no fix** — exempt; one hard reject persists |
| 35 Greek Chicken Gyros | 3 | **Moderate=1**,Light=2,Balanced=3 | **Balanced** | wrong | yes | default -> Moderate; renumber 1/2/3 |
| 36 Korean Fried Chicken | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | no (0 live) | none — fully retired |
| 37 Hash Browns & Chicken | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | yes | default -> Moderate |
| 41 Homemade Doner Kebab | 3 | Light,Moderate,Balanced | **Balanced** | 1/2/3 | no (0 live) | none — fully retired |

Recipe 107 confirmed: family 4, variant_label `Balanced 2`, is_live = 1, is_cheat = 0, 776 kcal/serving, macro-clean. Retiring it (rather than recipe 15 at 750 kcal) keeps the lower-kcal, correctly-labelled member, per assumption A2.

---

## Data-integrity findings

### Duplicate ingredient — `Potatoes` (69) / `Potato` (121)

Confirmed, and the **only** duplicate pair table-wide under the singular/plural collapse heuristic. Both rows carry identical per-100 g values (P 2.00 / C 17.00 / F 0.10), so the merge is macro-neutral. 69 has 5 uses (recipes 47, 48, 49, 56, 63), 121 has 19. **Proposed fix:** repoint `recipe_ingredients.ingredient_id` 69 -> 121, then delete row 69. `recipe_ingredients.ingredient_id` is the only FK referencing `ingredients`. Applies table-wide including cheat recipes 47/48/49 — dedup is a table rule, not audit-scoped.

### quantity_grams over linked yield

| Recipe | Parent | Linked | quantity_grams | Linked yield | In scope? |
|---|---|---|---|---|---|
| 212 | Chicken Carbonara (Balanced) | Fresh Pasta (36) | 300.00 | 282.00 | yes |
| 65 | Pastichio (Lasagna) | Fresh Pasta (36) | 454.00 | 282.00 | no — cheat |

**A complication the plan did not surface.** Recipe 212 step 1 reads: *"Prepare the fresh pasta according to the linked recipe, **scaling it up slightly (about 1.1x a single batch) to yield 300g of dough** (~150g per person)."* The 300 g is deliberate, not a typo. The macro engine prorates 300/282 = 1.064x, which is arithmetically what a 1.1x batch delivers, so the *nutrition* is already right; what fails is the structural invariant in the rule.

**Proposed fix:** reduce the parent row to `quantity = 280.00, quantity_grams = 280.00` and **rewrite step 1** to drop the scale-up language. Recomputed: whole 1425 kcal (down from 1481), per serving **713 kcal / P 47.8 g / fat 33.5 % / carb 39.7 %** — all pass. `recipes.calories` -> 1425. Fresh Pasta itself untouched. The alternative — leaving 300 g and accepting the rule violation — is defensible on nutrition grounds but leaves a documented hard reject in the data.

### Missing linked prep steps / zero-yield linked recipes

**Zero violations.** All 49 in-scope linked `recipe_ingredients` rows have at least one `recipe_steps` row carrying the same `linked_recipe_id` *and* a populated `alt_instruction`. No linked recipe sums to 0 g.

### FR-103 cross-variant consistency

**No genuine mismatch.** Family 4 `Pizza Dough` / `Pizza Sauce` report across 4 variant labels, an artefact of the illegal `Balanced 2` member which resolves when 107 is retired. But see divergence 8: the two paths on family 35 diverge 47 % on kcal.

---

## Lens-5 findings (naming and metadata)

Exactly **3** rows match any variant-suffix pattern (`- Diet`, `(Light)`, `(Moderate)`, `(Balanced)`, ` v2`, `Healthy`):

| Recipe | Current name | Proposed name |
|---|---|---|
| 188 | `Greek Chicken Gyros Bowl - Diet` | `Greek Chicken Gyros Bowl` |
| 194 | `Greek Chicken Gyros Bowl - Diet` | `Greek Chicken Gyros Bowl` |
| 195 | `Greek Chicken Gyros Bowl - Diet` | `Greek Chicken Gyros Bowl` |

All three are live and in family 87, whose `recipe_families.family_name` is already `Greek Chicken Gyros Bowl` — so the rename aligns the two rather than breaking alignment.

---

## Lens-2 findings (units and measurement realism)

**89 rows across 14 ingredient groups** in the ticket 35 families (98 rows / 14 groups including families 17 and 27). unit_id resolved from the live `units` table — g=1, ml=2, tsp=3, tbsp=4, piece=5, small=6, medium=7, large=8, handful=9, clove=10, head=11, stalk=12, slice=13, leaf=14, tin=15, cup=16, pinch=17, oz=18.

**`quantity_grams` is held constant on every one of these, so no macro moves.** Only `quantity` and `unit_id` change.

| Ingredient | id | Rows (35 fams) | Gram range | Proposed display unit | Conversion |
|---|---|---|---|---|---|
| Onion | 12 | 16 | 30-150 g | piece (5) | ROUND(g/110, 2) |
| Fresh Dill | 156 | 15 | 1.5-6 g | tbsp (4) | ROUND(g/3, 2) |
| Lemon | 88 | 12 | 24-40 g | piece (5) | ROUND(g/80, 2) |
| Fresh basil | 29 | 9 | 2-4 g | tbsp (4) | ROUND(g/3, 2) |
| **Tomato** (plan omitted this group) | 48 | 6 | 25-120 g | piece (5) | ROUND(g/100, 2) |
| Fresh Parsley | 123 | 6 | 5 g | tbsp (4) | ROUND(g/3, 2) -> 1.67 |
| Red Onion | 155 | 6 | 40-80 g | piece (5) | ROUND(g/110, 2) |
| Avocado | 72 | 3 | 50-200 g | piece (5) | ROUND(g/150, 2) |
| Fresh rosemary | 71 | 3 | 2 g | stalk (12) | fixed 2 sprigs |
| Garlic Powder | 92 | 3 | 2 g | tsp (3) | ROUND(g/2, 2) -> 1 tsp |
| Paprika | 65 | 3 | 2 g | tsp (3) | ROUND(g/2, 2) -> 1 tsp |
| Red bell pepper | 42 | 3 | 80-120 g | piece (5) | ROUND(g/100, 2) |
| Spring onions | 128 | 3 | 15-25 g | stalk (12) | ROUND(g/10, 0) |
| Pepperoni | 149 | 1 | 30 g | slice (13) | ROUND(g/5, 0) -> 6 slices |

Notes:
- The single `Pepperoni` row is on **recipe 107**, the Pizza member proposed for retirement. That fix is moot if 107 is retired first — **drop it from the migration**.
- `stalk` (12) exists, so the fall-back-to-piece contingency in the plan is not needed.
- Oils, butter, garlic and liquids were checked separately and are **already** in cook-friendly units in scope. The only remaining gram-stored items in that class are `Greek yogurt` (24 rows, legitimately weighed), `Pizza Sauce` (4 rows, the store-bought side of a dual-path row), `Garlic Powder`, and `Worcestershire sauce` (proposed for removal anyway).

---

# Per-family findings

Each section carries a macro table, the **lens 3 (technique) / lens 4 (dish quality)** note, and the proposed fix with resulting per-serving figures. Per `chef` SKILL.md, **dish-breakers and technique failures are stated before macro misses**. Per `.claude/rules/recipe-variants.md` (2026-07-30 policy), **per-serving kcal is reported for information and never a reject**. `P` rejects below 35 g, `FAT` above 35 % of kcal, `CARB` below 38 % of kcal, `KCALCOL` when stored `recipes.calories` drifts over 5 % from the recomputed whole-recipe total.

All after figures below were computed in SQL against the live rows, not by hand.

---

## Family 1 — Porridge with Berries & Nuts

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (1) | 329 | 12.7 | 38.7 | 45.8 | 657 / 657 (0.0 %) | **P, FAT** |
| Moderate (2) | 446 | 17.2 | 39.1 | 45.5 | 892 / 892 (0.0 %) | **P, FAT** |
| Balanced (3) | 570 | 22.0 | 39.9 | 44.7 | 1139 / 1139 (0.0 %) | **P, FAT** |

Verdicts: Light — fails protein by 22 g and fat by 4 pts. Moderate — fails protein by 18 g. Balanced — fails protein by 13 g. The worst protein gap in the non-cheat set.

**Lens 3 / technique.** Step 1 reads *"Set heat to 7/9"* — a dial position on one specific hob, meaningless on any other cooker, and the only heat cue in the recipe. Peanut butter is dropped onto hot oats at step 4 with no instruction to stir it through, so it sits as a lump. Only 4 steps and **no taste-and-adjust** anywhere. Nuts are chopped and salted (step 3) but never toasted, which is a free flavour win the recipe skips.

**Lens 4 / dish quality.** The plate works — berries give colour, nuts give crunch, honey gives sweetness. There is no acid, but porridge does not need one. *Would I order this again?* Yes as a bowl of porridge; no as a meal that claims 35 g of protein, because it has 13.

**Proposed fix.** Family 94 (Apple, Cinnamon & Walnut Porridge) is the working model — same dish class, already at P 35.7-45.3 g on 450-500 g of Greek yogurt. Copy that pattern:

| Recipe | Greek yogurt (49) | Peanut butter (6) | Low fat milk (2) | Rolled oats (1) |
|---|---|---|---|---|
| 1 Light | 0 -> **530 g** | 18 -> **10 g** | 258 -> **138 g** | 60 -> **70 g** |
| 2 Moderate | 0 -> **570 g** | 27 -> **15 g** | 340 -> **200 g** | 80 -> **90 g** |
| 3 Balanced | 0 -> **620 g** | 36 -> **20 g** | 427 -> **257 g** | 100 -> **110 g** |

Milk is cut as the yogurt goes in so the bowl does not become soup; peanut butter is trimmed rather than removed so fat % stays above the 25 % floor that keeps it from tasting thin.

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 1 Light | **457** | **36.9** | **26.7** | **41.1** | 915 |
| 2 Moderate | **570** | **42.5** | **28.1** | **42.1** | 1140 |
| 3 Balanced | **690** | **48.8** | **29.6** | **42.2** | 1379 |

All three pass. Ordering 457 < 570 < 690 with 113 / 120 kcal gaps. Also fix step 1 to a temperature or visual cue, add "stir the peanut butter through the hot oats until it melts", toast the nuts, and add a taste-and-adjust step.

---

## Family 4 — Pizza

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (13) | 510 | 48.3 | 26.3 | 35.8 | 1020 / 1020 (0.0 %) | **CARB** |
| Moderate (14) | 603 | 50.0 | 27.4 | 39.4 | 1206 / 1206 (0.0 %) | — |
| Balanced (15) | 750 | 56.6 | 28.4 | 41.4 | 1500 / 1500 (0.0 %) | — |
| *Balanced 2 (107)* | 776 | 52.6 | 32.9 | 40.0 | 1553 / 1553 (0.0 %) | *illegal label — retire* |

Verdicts: Light — carbs 2.2 pts under the floor. Moderate and Balanced — pass. Recipe 107 is macro-clean but structurally illegal.

**Lens 3 / technique.** Genuinely strong: 30-minute preheat on a stone at maximum temperature, dough stretched to a stated diameter, a 2-minute rest before slicing. Two flags. Step 4 sears chicken *"in a hot dry pan"* — chicken breast in a dry pan sticks and tears; it needs a film of oil, or the strips should go on the pizza raw and cook in the oven. Step 8 quantities disagree across variants in a way that looks like an editing error rather than a design choice (one variant reads 25 g mozzarella with 110 g chicken, another 50 g mozzarella with 100 g chicken) — the step text should be regenerated from `recipe_ingredients` per variant rather than hand-maintained.

**Lens 4 / dish quality.** A chicken-and-mushroom pizza on homemade dough and homemade sauce, baked hot on a stone. Acid from the tomato sauce, salt from the mozzarella, char for the visual. It needs a green — torn basil at the door, or rocket after the bake. *Would I order this again?* Yes.

**Proposed fix.** Raising Light dough alone does not work: +80 g clears carbs at 41.4 % but lands Light at 608 kcal/serving against Moderate 603, **breaking `Light < Moderate` ordering**. A coordinated change is required — raise the dough on all three and trim the oversized Light chicken portion:

| Recipe | Pizza Dough (linked 11) | Chicken breast (11) |
|---|---|---|
| 13 Light | 200 -> **240 g** | 220 -> **180 g** |
| 14 Moderate | 260 -> **290 g** | unchanged |
| 15 Balanced | 340 -> **370 g** | unchanged |

All portions stay inside the 733 g Pizza Dough yield.

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 13 Light | **528** | **43.6** | **25.9** | **41.1** | 1056 |
| 14 Moderate | **640** | **51.1** | **26.9** | **41.2** | 1279 |
| 15 Balanced | **787** | **57.8** | **27.9** | **42.7** | 1574 |

All pass, ordering 528 < 640 < 787 with 112 / 147 kcal gaps, and all three now sit inside their kcal design bands. Plus: retire recipe 107 (is_live = 0, remove membership), add oil to the step 4 pan, add torn basil at the end.

---

## Family 5 — Chicken Satay

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (16) | 625 | 37.6 | 48.2 | 27.8 | 1250 / 1250 (0.0 %) | **FAT, CARB** |
| Moderate (17) | 753 | 46.2 | 47.8 | 27.6 | 1460 / 1507 (-3.1 %) | **FAT, CARB** |
| Balanced (18) | 980 | 59.3 | 48.5 | 27.3 | 1959 / 1959 (0.0 %) | **FAT, CARB** |

Verdicts: all three fail fat by 13 pts and carbs by 10 pts. Protein passes throughout.

**Dish-breaker — gout.** Step 5 builds the peanut sauce with **Worcestershire sauce** (ingredient 39, 9/9/14 g). Worcestershire is anchovy-based and named on the `CLAUDE.md` gout avoid-list. **Proposed fix: remove it and add the same weight of soy sauce**, which is already in the recipe and in that sauce.

**Correction to the plan.** The plan proposes "adding rice". **Jasmine rice is already present** in all three variants (56 / 74 / 92 g dry) and step 3 cooks it. The fat is not a missing-starch problem; it is chicken *thigh* (10 % fat) plus 100-130 g coconut milk (21 % fat) plus 32-40 g peanut butter (50 % fat) plus 7-21 g olive oil.

**Lens 3 / technique.** Among the best in the set. The chicken is brined and patted dry, the sauce is thickened with a cornflour slurry to a stated finish (glossy), lime goes in off the heat, and there is an explicit taste-and-adjust. Vegetables are charred separately and returned. Internal temperature stated (74 C). No flags beyond the Worcestershire.

**Lens 4 / dish quality.** Satay with a proper peanut sauce, charred onion and pepper, and rice. Acid from lime, umami from soy, sweetness from honey; heat is absent — a chilli would help but is a matter of taste. *Would I order this again?* Yes — a good dish let down only by its fat ratio and one ingredient.

**Proposed fix.**

| Recipe | Chicken thigh (41) -> breast (11) | Coconut milk (38) | Jasmine rice (26) | Worcestershire (39) -> soy (25) |
|---|---|---|---|---|
| 16 Light | 220 g thigh -> **220 g breast** | 100 -> **50 g** | 56 -> **110 g** | 9 g -> **9 g soy** |
| 17 Moderate | 280 g thigh -> **280 g breast** | 100 -> **50 g** | 74 -> **130 g** | 9 g -> **9 g soy** |
| 18 Balanced | 360 g thigh -> **360 g breast** | 130 -> **70 g** | 92 -> **180 g** | 14 g -> **14 g soy** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 16 Light | **623** | **44.6** | **30.8** | **40.5** | 1246 |
| 17 Moderate | **744** | **54.8** | **31.5** | **39.0** | 1487 |
| 18 Balanced | **999** | **71.0** | **31.8** | **39.8** | 1998 |

All pass. Ordering 623 < 744 < 999. kcal runs above the design bands, which is a target miss and not a reject. The step 5 ingredient list must be edited to say soy rather than Worcestershire.

---

## Family 8 — Salmon Sandwich

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| *Light — MISSING* | — | — | — | — | — | **family has only 2 members** |
| Moderate (28) | 485 | 30.2 | 40.5 | 34.5 | 904 / 970 (-6.8 %) | **P, FAT, CARB, KCALCOL** |
| Balanced (29) | 904 | 60.4 | 36.2 | 37.1 | 1807 / 1807 (0.0 %) | **FAT, CARB** |

Verdicts: Moderate fails all four checks. Balanced fails fat and carbs. The family is structurally illegal at 2 members and defaults to Balanced.

**Lens 4 dish-breaker — there is no acid and no seasoning.** The whole recipe is four rows: Milk Bread, tinned salmon, salted butter, lettuce. Tinned salmon mashed with butter and nothing else is flat and slightly metallic. It needs lemon, black pepper, and ideally capers or dill. As written this is a dish that passes nothing and tastes of very little. *Would I order this again?* No — and the fix is cheap.

**Lens 3 / technique.** Six steps, and one is wrong. Step 5 states *"Divide the mashed salmon between them (~106g per sandwich)"* on **both** variants — but Moderate assembles 2 sandwiches from 213 g of salmon and Balanced assembles 4 from 426 g. The 106 g figure is copy-pasted and is therefore right on one variant and wrong on the other. Otherwise the steps are correct as far as they go (bones checked and removed, lettuce washed and dried).

**Proposed fix — Moderate (28).**

| Change | From | To |
|---|---|---|
| Salted butter (53) | 24 g | **8 g** |
| Tinned salmon (54) | 213 g | **240 g** |
| Milk Bread (linked 26) | 200 g | **240 g** |
| Cottage cheese (169) | — | **+60 g** |

Result: **514 kcal/srv, P 37.8 g, fat 30.8 %, carb 39.8 %** — all pass. calories -> 1028.

**Proposed fix — Balanced (29).**

| Change | From | To |
|---|---|---|
| Salted butter (53) | 30 g | **10 g** |
| Milk Bread (linked 26) | 400 g | **460 g** |

Result: **899 kcal/srv, P 62.7 g, fat 29.3 %, carb 42.8 %** — all pass. calories -> 1798.

**Proposed new Light variant.** `recipes` row: name `Salmon Sandwich` (no suffix), default_servings 2, calories 877, is_live 1, is_cheat 0, macros_audited 0. `recipe_family_members`: family_id 8, variant_label `Light`, display_order 1, is_default 0.

| Ingredient | Grams |
|---|---|
| Milk Bread (linked recipe 26, with the store-bought alt_instruction path) | 200 |
| Tinned salmon (54) | 220 |
| Cottage cheese (169) — replaces the butter as the binder | 90 |
| Lettuce (47) | 40 |
| Lemon (88) | 20 |

Result: **439 kcal/srv, P 35.9 g, fat 26.8 %, carb 40.4 %** — all pass. Whole-recipe 877 kcal.

Family ordering after all three: **439 < 514 < 899**. is_default moves to Moderate and display_order becomes 1/2/3.

Steps for the new Light must include a linked Milk Bread prep step carrying `linked_recipe_id = 26` and a populated `alt_instruction` ("Use 4 slices of store-bought bread (~50g each)."). All three variants should gain lemon and cracked pepper, and the step 5 salmon-per-sandwich figure must be regenerated per variant.

---

## Family 9 — Lentil Stew

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (30) | 481 | 24.3 | 23.7 | 56.0 | 963 / 963 (0.0 %) | **P** |
| Moderate (31) | 531 | 30.1 | 26.2 | 51.1 | 1064 / 1061 (0.2 %) | **P** |
| Balanced (32) | 587 | 32.9 | 31.2 | 46.4 | 1177 / 1174 (0.3 %) | **P** |

Verdicts: protein short by 10.7 / 4.9 / 2.1 g. Fat and carbs pass everywhere; Light fat at 23.7 % is *below* the 25 % floor the chef lens-1 flags as reads-dry — not a reject, but a real quality signal.

**Lens 3 / technique.** Solid. Chorizo is rendered first and its fat used as the cooking medium; spices bloomed for 30 seconds; pak choi stems in before the leaves. One structural note: the Light variant has no chorizo and therefore 9 steps against 10 on the others, so the step sequences are offset between siblings. That is correct behaviour, not a bug, but it means any rewrite must be per-recipe rather than per-family.

**Lens 4 / dish quality.** The last step is *"Season with salt to taste. Serve in bowls"* — no acid, no fresh herb, no crunch. A lentil-and-tomato stew without a squeeze of lemon or a splash of sherry vinegar at the end tastes muddy, and the only texture is soft. The chorizo on Moderate and Balanced supplies fat and colour; Light has neither. *Would I order this again?* The Moderate, yes. The Light as written, no.

**Nutritional judgement (diet-guidelines).** 400 g of tinned lentils is already 36 g of protein whole-recipe — 18 g per serving. Reaching 35 g/serving from lentils alone would need roughly 780 g of tinned lentils per two servings, which is not a bowl of stew. The family is **not vegetarian** — Moderate and Balanced already contain chorizo — so adding poultry is consistent with what the dish already is rather than a change of identity. This is the honest lever; padding with more lentils would be arithmetic compliance without a real meal behind it.

**Proposed fix.** Add chicken breast (ingredient 11), stirred in with the lentils:

| Recipe | Chicken breast (11) |
|---|---|
| 30 Light | **+115 g** |
| 31 Moderate | **+105 g** |
| 32 Balanced | **+110 g** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 30 Light | **571** | **42.1** | 23.3 | **47.2** | 1143 |
| 31 Moderate | **613** | **46.3** | **25.5** | **44.3** | 1226 |
| 32 Balanced | **673** | **50.0** | **29.8** | **40.4** | 1346 |

All protein, fat and carb rejects clear. Ordering 571 < 613 < 673 holds. **Light fat sits at 23.3 %, still under the 25 % chef floor** — recommend also raising Light olive oil from 21 g to 24 g, or accepting the note explicitly. Also add a finishing acid (lemon or sherry vinegar) and fresh parsley to all three, and a crunch element to Light where the chorizo is absent.

---

## Family 10 — Lentil Stuffed Peppers

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (33) | 391 | 18.5 | 19.8 | 61.3 | 782 / 782 (0.0 %) | **P** |
| Moderate (34) | 484 | 24.2 | 16.8 | 63.1 | 969 / 969 (0.0 %) | **P** |
| Balanced (35) | 608 | 29.8 | 19.2 | 61.2 | 1217 / 1217 (0.0 %) | **P** |

Verdicts: protein short by 16.5 / 10.8 / 5.2 g. Fat is 5-8 pts *below* the 25 % floor on every variant — the chef lens-1 low-fat-tastes-dry failure mode in its clearest form. Carbs run 11-13 pts above the 50 % target (over-target, not a reject).

**Lens 4 dish-breaker — this is an all-soft, one-note plate.** Roasted pepper, stewed lentils, tomato, and the final step is *"Serve hot."* No cheese, no crunch, no herb, no acid, no garnish. Soft filling inside soft pepper with nothing to break it. *Would I order this again?* No. The fix is the same as the macro fix, which is unusually convenient.

**Lens 3 / technique.** Ten clean steps with real endpoints (until the sauce thickens, until peppers are soft and slightly charred at the edges). Garlic goes in after the onion for 30 seconds — correct. No flags.

**Nutritional judgement (diet-guidelines).** Unlike family 9, this family is genuinely vegetarian with no meat already in it, so adding chicken would change what the dish is. The honest lever is **dairy protein**: cottage cheese folded into the filling (11 g protein / 100 g, and it adds the moisture the filling lacks) plus a mozzarella cap (22 g protein / 100 g, and it supplies the browned-cheese crust the dish is missing). That fixes protein, fat % and the texture-contrast finding with the same two ingredients.

**Proposed fix.**

| Recipe | Cottage cheese (169) | Mozzarella (37) |
|---|---|---|
| 33 Light | **+200 g** | **+70 g** |
| 34 Moderate | **+240 g** | **+80 g** |
| 35 Balanced | **+280 g** | **+100 g** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 33 Light | **562** | **37.2** | **27.9** | **45.6** | 1124 |
| 34 Moderate | **684** | **46.2** | **25.4** | **47.6** | 1367 |
| 35 Balanced | **850** | **56.2** | **27.1** | **46.5** | 1701 |

All pass, including the 25 % fat floor. Ordering 562 < 684 < 850. Add steps: fold the cottage cheese into the filling before stuffing; scatter the mozzarella over the peppers for the last 10 minutes of the bake; finish with a squeeze of lemon and torn basil.

---

## Family 11 — Pink Sauce Pasta

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (37) | 515 | 41.4 | 27.8 | 40.1 | 1030 / 1029 (0.1 %) | — |
| Moderate (38) | 650 | 51.8 | 28.1 | 40.0 | 1301 / 1301 (0.0 %) | — |
| Balanced (39) | 801 | 65.1 | 29.0 | 38.5 | 1602 / 1601 (0.1 %) | — |

Verdicts: all three pass every reject condition and all three sit inside their kcal design bands.

**Lens 3 / technique — exemplary, and rightly cited as the canonical FR-103 pattern.** Chicken rested 5 minutes then sliced; garlic cooked 30 seconds *"do not let it colour"*; heat reduced to low **before** the milk and parmesan go in, so the dairy cannot split; **the resting juices from the board are poured into the sauce**; pasta water added in small splashes until the sauce *"coats every strand and looks glossy"*; basil torn in **off the heat**; explicit taste-and-adjust before plating. Both linked components (Pizza Sauce 12, Fresh Pasta 36) carry prep steps with populated alt_instruction, and the linked quantities are stated per variant in the step text.

**Lens 4 / dish quality.** Acid from tomato, fat from parmesan and milk, salt adjusted, basil green against the pink sauce, cracked pepper to finish. *Would I order this again?* Yes — this is the standard the rest of the set should be measured against.

**Proposed fix.** None. Structure legal, macros clean, technique and dish quality pass. **Disposition: sign off, no macro change.**

---

## Family 12 — Chicken Tikka Masala

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (40) | 633 | 49.5 | 23.5 | 45.2 | 1258 / 1266 (-0.7 %) | — |
| Moderate (41) | 750 | 60.2 | 21.3 | 46.6 | 1493 / 1500 (-0.5 %) | — |
| Balanced (42) | 898 | 77.1 | 19.7 | 45.9 | 1792 / 1796 (-0.2 %) | — |

Verdicts: no rejects. Fat runs 19.7-23.5 %, **below the 25 % chef floor on all three** — flagged as a quality signal, not a reject. A tikka masala at 20 % fat is a thin curry.

**Lens 3 / technique.** Step 8 is the flag: *"Reduce heat to low. Stir in Greek yogurt, honey, and remaining garam masala."* The yogurt goes into a tomato sauce that has just simmered 10 minutes, with reduce-heat-to-low as the only protection and **no tempering**. Yogurt added to an acidic sauce still above ~80 C will grain. The correct instruction is to take the pan off the heat, temper the yogurt with two spoonfuls of the hot sauce, then stir the tempered mixture back in. Everything else is right — chicken browned and removed, onion softened, aromatics 1 minute, ground spices 30 seconds, tomato paste cooked out, chicken returned to finish at 74 C.

**Lens 4 / dish quality.** Acid and sweetness are present; heat is absent (no chilli anywhere); there is no fresh coriander and no green on the plate. Adding a knob of butter or a spoon of cream at the end would lift fat % toward the band *and* fix the thin mouthfeel — one change, two problems. *Would I order this again?* Yes, but it will read pale and mild.

**Proposed fix.** No macro change required. Recommended (all optional, none macro-critical): rewrite step 8 to temper the yogurt; add fresh coriander at the end; add a small chilli. is_default moves from Balanced to Moderate. **Disposition: sign off, no macro change.**

---

## Family 14 — Steak & Chips

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (47) | 383 | 25.6 | 45.7 | 27.6 | 766 / 766 (0.0 %) | **P, FAT, CARB** |
| Moderate (48) | 552 | 37.5 | 47.4 | 25.4 | 1102 / 1103 (-0.1 %) | **FAT, CARB** |
| Balanced (49) | 722 | 49.6 | 48.2 | 24.3 | 1437 / 1444 (-0.5 %) | **FAT, CARB** |

**Reclassified as a cheat meal on developer instruction — exempt from macro remediation, structural fixes, the prose pass and sign-off.** Figures above are the evidence.

**Lens 3 / technique** (recorded, not remediated). Good chip craft — par-boil, steam-dry, rough up the edges in the colander, then air-fry. Steak brought to room temperature, patted completely dry, seasoned generously, seared in a smoking pan, rested 5 minutes on a warm plate. **One real miss: the resting juices are discarded.** Step 7 plates the rested steak and never returns the juices to the mushrooms or over the meat.

**Lens 4 / dish quality.** Steak, chips, rosemary mushrooms. No acid, nothing green, brown-on-brown-on-brown. It is a cheat meal and it is honest about that. *Would I order this again?* Yes, and I would ask for a watercress salad on the side.

**Proposed fix.** is_cheat = 1 only. Its Worcestershire-free status is confirmed. Its `Potatoes` (69) rows *are* repointed to `Potato` (121) by the ingredient merge, because dedup is a table-level rule and not audit-scoped.

---

## Family 16 — Avocado Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (53) | 357 | 12.1 | 54.9 | 31.6 | 714 / 714 (0.0 %) | **P, FAT, CARB** |
| Moderate (54) | 504 | 13.7 | 48.7 | 40.4 | 1007 / 1007 (0.0 %) | **P, FAT** |
| Balanced (55) | 677 | 26.7 | 53.5 | 30.7 | 1355 / 1355 (0.0 %) | **P, FAT, CARB** |

**Reclassified as a cheat meal on developer instruction — exempt.** Figures above are the evidence.

**Lens 3 / technique** (recorded, not remediated). Step numbering **diverges across variants**: Light has 7 steps, Balanced has 9, and the same instruction appears at different numbers in each. Any future rewrite must be per-recipe. Otherwise the method is unremarkable but correct — bread toasted via the linked Milk Bread recipe with a store-bought alt_instruction, avocado mashed and seasoned, eggs fried until whites set and yolks runny, parmesan grated over.

**Lens 4 / dish quality.** Avocado, egg, parmesan on buttered toast. There is no acid — avocado toast without lemon or lime is the classic omission — and no heat. Colour is fine. *Would I order this again?* Yes, with lemon and chilli flakes.

**Note on the reclassification** (recorded for the future). At 357-677 kcal/serving this is not an indulgence in the sense Homemade Big Mac (1800 kcal/serving) is. It fails the **protein floor**, not a calorie ceiling. A user browsing cheat meals will find a modest breakfast beside a Big Mac. The developer chose this knowingly; it is logged so a later audit does not read is_cheat as evidence of indulgence.

**Proposed fix.** is_cheat = 1 only.

---

## Family 17 — Chicken Burrito Bowl *(already audited; re-opened for the jalapeno addition)*

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (57) | 546 | 37.1 | 32.8 | 40.0 | 1093 / 1093 (0.0 %) | — |
| Moderate (58) | 643 | 42.3 | 33.6 | 40.1 | 1286 / 1286 (0.0 %) | — |
| Balanced (59) | 797 | 49.4 | 34.0 | 41.2 | 1595 / 1595 (0.0 %) | — |

Verdicts: all three pass. Structure legal — labels Light/Moderate/Balanced, display_order 1/2/3, default on Moderate. All three macros_audited = 1.

**Lens 3 / technique — exemplary.** Rice finished with lime and coriander off the heat; chicken patted *"completely dry"* before searing, seared *"undisturbed for 4 min to build a hard char"*, brought to 74 C, rested 5 minutes, sliced against the grain, **and the resting juices reserved from the board and spooned over at plating**; the beans are bloomed with garlic and cumin and simmered to *"glossy and just thickened"* rather than tipped from the tin; pico built with lime and salt; avocado dressed with lime to stop it browning. Cheddar is scattered *"over the warm chicken so it just melts"*. This is the best-written recipe in the audit set.

**Lens 4 / dish quality.** Acid from three separate lime additions, fat from avocado and yogurt, salt distributed, texture contrast from charred chicken against soft rice and beans, and a genuinely colourful plate. The only thing missing is heat — which is exactly what the developer asked for. *Would I order this again?* Yes.

**Proposed change (developer request).** Add fresh jalapeno. A case-insensitive search of jalap, chilli and chili across `ingredients.name` returns exactly one row — `Chilli Flakes` (165, P 12.00 / C 30.00 / F 17.00), a dried spice and a genuinely different item. The dedup rule is therefore satisfied by an insert.

New `ingredients` row (guarded, so a re-run cannot duplicate it):

| Column | Value |
|---|---|
| key | jalapeno |
| name | Jalapeno (singular, sentence case) |
| aisle_id | 3 (veg) |
| protein_per_100g | 0.90 |
| carbs_per_100g | 6.50 |
| fat_per_100g | 0.40 |
| macros_verified | 0 |

Per-variant portions and results (modelled on Red bell pepper, whose per-100 g profile is within 0.1 g of the proposed jalapeno values on every macro):

| Recipe | Jalapeno | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|---|
| 57 Light | 20 g | **549** | **37.2** | **32.6** | **40.3** | 1099 |
| 58 Moderate | 30 g | **648** | **42.5** | **33.4** | **40.3** | 1295 |
| 59 Balanced | 40 g | **804** | **49.6** | **33.8** | **41.5** | 1607 |

Macro impact is +6 / +9 / +12 kcal whole-recipe — negligible against the bands, and every variant still passes. A `recipe_steps` row is added telling the cook when the jalapeno goes in (sliced into the pico at step 5, so the heat is raw and bright rather than cooked out).

Because `recipe_ingredients` changes, the attestation goes stale. Per `chef` SKILL.md: **clear macros_audited = 0, macros_audited_at = NULL on 57/58/59 before the edit, then re-set macros_audited = 1, macros_audited_at = NOW() after re-verification.** macros_audited_by stays NULL.

---

## Family 22 — Classic Irish Beef Stew

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (78) | 482 | 31.7 | 34.3 | 39.4 | 923 / 964 (-4.2 %) | **P** |
| Moderate (79) | 571 | 38.6 | 33.8 | 39.1 | 1099 / 1141 (-3.7 %) | — |
| Balanced (80) | 709 | 49.9 | 33.7 | 38.2 | 1373 / 1418 (-3.2 %) | — |

Verdicts: only Light fails, on protein by 3.3 g. calories drift is -3.2 to -4.2 %, inside the 5 % tolerance. Moderate and Balanced land squarely in their kcal bands.

**Dish-breaker — gout.** **Worcestershire sauce** (ingredient 39) at 18 g on all three variants, added to the braise at step 6. Anchovy-based, on the `CLAUDE.md` avoid-list. **Proposed fix: replace with 18 g soy sauce.** Soy carries 5 g carbs/100 g against Worcestershire 23 g, so the swap costs ~3.2 g carbs whole-recipe and must be compensated — see the fix table.

**Data finding — step_number = 0.** All three variants carry a step 0: *"CHEF NOTE: We use whole chuck roast instead of pre-cubed stewing beef..."*. Step numbering is therefore not contiguous from 1. The plan own post-apply verification (MIN(step_number) <> 1) would fail on this family. **Proposed fix:** move the note into `recipe_steps.tip` on step 1 (the field is currently populated on only 3 of 745 in-scope steps, so this is its intended use) and renumber the remaining steps 1-10.

**Lens 3 / technique — otherwise the strongest in the audit.** A 12-24 hour uncovered dry brine on a rack; chuck brought to room temperature and patted dry; **seared with no added oil because it renders its own fat**; butter added to the rendered fat for the base; tomato paste caramelised 2 minutes; braised at *"a bare simmer"* for 2.5-3 hours to fork-tender; **the fat is skimmed** (with a chill-overnight alternative given); beef shredded rather than left cubed; vegetables added only for the final 45-60 minutes so they do not disintegrate; bay and thyme stems removed; explicit taste-and-adjust; served in **warm** bowls with parsley. There is nothing to fix here beyond the ingredient and the numbering.

**Lens 4 / dish quality.** Deep, correct, seasonal. Acid is thin — the Worcestershire was carrying some of it, so its removal makes adding a splash of cider vinegar or stout at the braise stage more than cosmetic. Parsley gives the green; carrot and parsnip give the colour. *Would I order this again?* Yes, and it is the dish I would point at as proof the recipe set can be good.

**Proposed fix.**

| Recipe | Beef Chuck (120) | Potato (121) | Butter (53) | Worcestershire (39) -> soy (25) |
|---|---|---|---|---|
| 78 Light | 240 -> **280 g** | 240 -> **350 g** | 14 -> **7 g** | 18 g -> **18 g soy** |
| 79 Moderate | unchanged | 300 -> **390 g** | 14 -> **7 g** | 18 g -> **18 g soy** |
| 80 Balanced | unchanged | 400 -> **530 g** | 14 -> **7 g** | 18 g -> **18 g soy** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 78 Light | **528** | **37.2** | **30.0** | **41.8** | 1055 |
| 79 Moderate | **575** | **39.8** | **29.2** | **43.1** | 1149 |
| 80 Balanced | **728** | **51.5** | **29.4** | **42.3** | 1456 |

All pass, ordering 528 < 575 < 728, and all three land inside their kcal design bands. The butter trim is what keeps fat % from drifting up as the beef rises; the potato raise covers the carbs the soy swap costs. Also: is_default moves to Moderate, the step 6 ingredient name changes to soy, the chef note moves to tip, and a splash of cider vinegar is recommended at the braise.

---

## Family 23 — Spaghetti Bolognese

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (81) | 627 | 46.6 | 25.8 | 44.4 | 1378 / 1254 (**+9.9 %**) | **KCALCOL** |
| Moderate (82) | 703 | 55.0 | 26.2 | 42.5 | 1545 / 1407 (**+9.8 %**) | **KCALCOL** |
| Balanced (83) | 851 | 70.6 | 25.8 | 41.0 | 1874 / 1701 (**+10.1 %**) | **KCALCOL** |

Verdicts: protein, fat % and carb % pass on all three. The only reject is the stored calories column running ~10 % **above** the recomputed total.

**Note on the drift direction.** This is *positive* drift and it matches **neither** documented failure mode in `CLAUDE.md`. It is not the store-bought-basis bug (that runs negative, as family 35 does at -12 to -16 %) and it is not the per-serving bug (which shows a ratio near 0.5; this is ~1.10). It is a third, undiagnosed mechanism. The recomputed value is the trustworthy one, so overwriting is correct, but the provenance is worth a moment of thought before the migration lands.

**Lens 3 / technique.** Two flags. Step 6 reads *"Prepare fresh pasta according to linked recipe"* with **no quantity** — families 11 and 93 both state grams per person in the equivalent step, and this one does not, so the cook has no idea how much dough to make. And **no pasta water is reserved**: step 7 tosses pasta with sauce, with nothing to loosen or emulsify it. Otherwise correct — mince browned over high heat and removed, soffritto 8-10 minutes to *"soft and lightly golden"*, a 90-minute partially-covered simmer to *"thick and rich"*, bay removed, season and finish with parmesan and basil.

**Lens 4 / dish quality.** A proper long-simmer ragu. There is no wine and no other acid beyond the tomato, which a 90-minute Bolognese would normally have. Basil and parmesan finish it. *Would I order this again?* Yes.

**Proposed fix.** No ingredient change. Rewrite `recipes.calories` to the recomputed whole-recipe totals:

```
recipe 81 (Light)     1378 -> 1254
recipe 82 (Moderate)  1545 -> 1407
recipe 83 (Balanced)  1874 -> 1701
```

Per-serving figures are unchanged by this (the column is not the display source; the derived value is). Also recommended: state the dough quantity per variant in step 6, and reserve pasta water in step 7.

---

## Family 27 — Pad Thai *(already audited; re-opened for the prawn removal)*

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (91) | 541 | 41.4 | 26.1 | 43.3 | 1082 / 1082 (0.0 %) | — |
| Moderate (92) | 632 | 47.4 | 25.6 | 44.4 | 1264 / 1264 (0.0 %) | — |
| Balanced (93) | 790 | 58.8 | 28.0 | 42.2 | 1580 / 1580 (0.0 %) | — |

Verdicts: all three currently pass. No linked recipes, so macros compute from raw rows alone.

**Lens 3 / technique.** Correct and confident. Noodles soaked in *room-temperature* water for 30-45 minutes *"until pliable but still firm"* — the right method, not boiling. Tamarind soaked, mashed and strained. Wok heated *"until smoking"*. Protein cooked in stages and removed. Aromatics 30 seconds. Egg scrambled loosely in a cleared space. Step 10 is a full taste-and-adjust with a stated flavour target and named correction levers. Lime wedge and crushed peanuts at the finish.

**Consequence the plan did not surface: the ingredient changes force step rewrites.** Prawns are named in **steps 3, 5 and 9** and fish sauce in **steps 2 and 10**. Removing either ingredient without rewriting those steps leaves the cook reading instructions for ingredients that are not in the list. Specifically: step 3 drops "Peel and devein the prawns if needed"; step 5 is deleted and the remaining steps renumbered; step 9 becomes "Return the chicken to the wok"; step 2 substitutes soy for fish sauce; and the step 10 correction lever *"a splash of fish sauce for salt"* becomes *"a splash of soy sauce for salt"*.

**Lens 4 / dish quality.** Genuinely Thai in method — tamarind, sugar sweetness, lime, peanuts, bean sprouts added in two stages so half stay raw and crunchy. Losing the prawns costs a texture and a sweetness the chicken does not replace; raising the peanuts slightly would help. *Would I order this again?* Yes, and it survives the prawn removal.

**Proposed change 1 — remove prawns (developer request, gout).** Rows to delete: `recipe_ingredients` ids 1004 (r91), 1018 (r92), 1032 (r93) — Prawns (raw, peeled) (ingredient 143) at 90 / 110 / 130 g.

Removing prawns **with no compensation** was computed and **confirms the plan figure exactly**:

| Recipe | kcal/srv | P g | fat % | carb % | Verdict |
|---|---|---|---|---|---|
| 91 Light | 499 | **31.9** | 27.5 | 46.9 | **P reject** |

So compensation is required on Light at minimum.

**Proposed change 2 — the fish-sauce finding.** Fish Sauce (ingredient 142) is still present at **18 g on all three variants**, alongside Soy sauce (25) at 18 g. Fish sauce is anchovy-based and on the **same gout avoid-list as the prawns** — `CLAUDE.md` names it explicitly and `diet-guidelines` repeats it with the remedy (sub fish sauce to soy sauce). Soy having already been added beside it looks like an **unfinished swap**: someone added the replacement and never removed the original. Removing the prawns for gout while leaving the fish sauce in place is not a coherent outcome.

**This is recommended but not applied, because the developer asked only about prawns** and the `chef` skill forbids applying audit suggestions without explicit approval. It needs a yes or a no.

**Combined proposal — prawns out, fish sauce out, chicken compensation in:**

| Recipe | Prawns (143) | Fish Sauce (142) | Soy sauce (25) | Chicken breast (11) |
|---|---|---|---|---|
| 91 Light | 90 -> **0 g** | 18 -> **0 g** | 18 -> **36 g** | 130 -> **170 g** |
| 92 Moderate | 110 -> **0 g** | 18 -> **0 g** | 18 -> **36 g** | 150 -> **165 g** |
| 93 Balanced | 130 -> **0 g** | 18 -> **0 g** | 18 -> **36 g** | unchanged (180 g) |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 91 Light | **529** | **37.8** | **27.1** | **44.3** | 1059 |
| 92 Moderate | **591** | **37.8** | **26.9** | **47.5** | 1183 |
| 93 Balanced | **729** | **44.8** | **29.6** | **45.8** | 1457 |

All pass. Ordering 529 < 591 < 729. Light lands at 37.8 g protein rather than the predicted 38.1 g — the 0.3 g difference is the 1.6 g of whole-recipe protein in the fish sauce, which the plan figure did not remove.

**If the developer declines the fish-sauce removal**, keep 18 g of fish sauce and 18 g of soy; the protein figures rise by ~0.8 g/serving on each variant and all three still pass. The gout exposure remains.

Because `recipe_ingredients` changes, **clear macros_audited = 0, macros_audited_at = NULL on 91/92/93 before the edit, re-verify, then re-set.** macros_audited_by stays NULL.

---

## Family 28 — Tortilla Espanola

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| *Extra Light (94)* | 360 | 13.2 | 52.3 | 33.1 | 721 / 721 (0.0 %) | **P, FAT, CARB + illegal label** |
| Light (95) | 467 | 17.0 | 55.4 | 30.0 | 929 / 933 (-0.5 %) | **P, FAT, CARB** |
| Moderate (96) | 560 | 20.9 | 56.2 | 28.9 | 1122 / 1121 (0.1 %) | **P, FAT, CARB** |
| Balanced (97) | 709 | 25.3 | 56.9 | 28.8 | 1422 / 1418 (0.3 %) | **P, FAT, CARB** |

**Reclassified as a cheat meal on developer instruction — exempt from everything.** Figures above are the evidence.

**Lens 3 / technique — excellent, and worth preserving.** Potatoes sliced to 3 mm on a mandoline; confited slowly for 20-25 minutes over medium-low heat *"until potatoes are completely tender but not browned — they should almost melt when pressed"*, which is the actual Spanish method; potatoes lifted out with a slotted spoon so the excess oil stays in the pan; the mixture rested 5 minutes *"so potatoes absorb egg"*; the flip described honestly (*"In one confident motion"*); rested 5 minutes before cutting; served warm or at room temperature. Nothing to fix.

**Lens 4 / dish quality.** This is a correct tortilla espanola. Its 52-57 % fat is not a defect of execution — it is what the dish is; the potato is confited in olive oil and that is the point. There is no acid and none is wanted. *Would I order this again?* Yes.

**Proposed fix.** is_cheat = 1 on recipes 94, 95, 96, 97 only.

**Two hard rejects will persist, by developer instruction.** Because cheat families are exempt from structural fixes:
- Family 28 keeps **4 members including the Extra Light label** — recipe 94 is *not* retired.
- Family 28 keeps display_order = Moderate 1 / Light 2 / Extra Light 3 / Balanced 4, and is_default on Balanced.

Both are hard rejects under `.claude/rules/recipe-variants.md` and both are named in AC-4 and AC-5. The user-visible effect is that the variant picker shows four options with a non-standard label and opens on the wrong one. The developer confirmed this deliberately. Structural fixes here are `recipe_family_members` writes with **zero macro impact**, so this is a one-line reversal if the oddity matters more than the tidiness of the exemption. The final verification phase will report both as outstanding rather than passing silently.

---

## Family 29 — French Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (98) | 315 | 14.4 | 46.6 | 35.2 | 721 / 630 (**+14.5 %**) | **P, FAT, CARB, KCALCOL** |
| Moderate (99) | 425 | 16.7 | 45.1 | 39.2 | 987 / 851 (**+16.0 %**) | **P, FAT, KCALCOL** |
| Balanced (100) | 575 | 22.2 | 45.6 | 39.0 | 1332 / 1150 (**+15.9 %**) | **P, FAT, KCALCOL** |

**Reclassified as a cheat meal on developer instruction — exempt from everything.** Figures above are the evidence.

Note the drift direction: **+14.5 to +16.0 %**, the same undiagnosed positive-drift mechanism as family 23 and the opposite direction from family 35. Because this family is exempt, the stored calories will remain 14-16 % too high and the recipe card will over-report. That is a consequence of the exemption worth stating plainly.

**Lens 3 / technique** (recorded, not remediated). Correct: custard whisked smooth in a shallow dish; each slice dipped 15-20 seconds per side with an explicit *"Don't oversoak"*; butter taken to *foaming* before the bread goes in; 2-3 minutes per side to *"deep golden brown"*; remaining butter added at the flip so the second side gets fresh fat. Six clean steps.

**Lens 4 / dish quality.** French toast on homemade milk bread with maple syrup. No acid, no fruit, no textural counterpoint — berries and a spoon of yogurt would fix all three and are the obvious serving suggestion. *Would I order this again?* Yes.

**Proposed fix.** is_cheat = 1 on recipes 98, 99, 100 only.

**One hard reject will persist, by developer instruction:** family 29 keeps **Moderate at display_order 1** (order is Moderate 1 / Light 2 / Balanced 3) and is_default on Balanced, so the picker opens on the wrong variant and lists them out of calorie order. Named in AC-3 and AC-5; exempt by instruction; same one-line reversal available.

---

## Family 35 — Greek Chicken Gyros

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (118) | 604 | 41.1 | 38.6 | 34.2 | 1062 / 1209 (**-12.1 %**) | **FAT, CARB, KCALCOL** |
| Moderate (119) | 770 | 51.6 | 39.2 | 34.0 | 1300 / 1539 (**-15.5 %**) | **FAT, CARB, KCALCOL** |
| Balanced (120) | 967 | 65.4 | 40.1 | 32.8 | 1686 / 1935 (**-12.9 %**) | **FAT, CARB, KCALCOL** |

Verdicts: protein passes comfortably; fat fails by 3.6-5.1 pts and carbs by 3.8-5.2 pts on all three; the stored calories column is 12-16 % **below** the recomputed total.

**Root cause of the calories drift, now quantified.** This is the store-bought-basis bug `CLAUDE.md` names for this family, and the FR-103 row is the mechanism. The Pita Bread row carries **both** ingredient_id = 157 (store-bought) and linked_recipe_id = 117 (homemade):

| Path | Per 100 g | kcal / 100 g |
|---|---|---|
| Store-bought ingredient 157 | P 8.50 / C 55.00 / F 1.20 | 265 |
| **Homemade recipe 117** | P 11.10 / C 64.25 / F 9.76 | **389** |

A **47 % divergence**, far outside the 10 % tolerance in `.claude/rules/linked-recipe-extras.md`. The stored calories was computed on the 265 figure; the display derives from the 389 figure, which is why the card and the traffic-light disagree. It also explains the fat failure: the homemade pita carries 9.76 g fat per 100 g against 1.20 g on the store-bought row.

**Because extras are read-only, the divergence itself is reported and not fixed.** The pita recipe is not touched. The lever is the other fats in the parent.

**Lens 3 / technique.** Only 5 steps, and thin for the dish. Tzatziki is built inline (cucumber grated and squeezed dry — correct) rather than as its own sub-recipe, which is a missed link but not a violation since no tzatziki recipe exists. Chicken is marinated 30 minutes or overnight, cooked to 74 C, **rested 5 minutes and sliced against the grain** — all correct. The linked pita prep step carries an alt_instruction. Missing: no instruction to warm the pita just before assembly (the store-bought path says to, the homemade path does not), and no taste-and-adjust on the tzatziki, which is the component most likely to need salt.

**Lens 4 / dish quality.** Acid from lemon in both the marinade and the tzatziki; salt from feta; herb from dill and oregano; colour from tomato, red onion and lettuce; contrast from charred chicken against cool yogurt. This is a good gyro. *Would I order this again?* Yes.

**Proposed fix.**

| Recipe | Chicken thigh (41) -> breast (11) | Olive oil (22) | Pita (linked 117) | Feta (154) |
|---|---|---|---|---|
| 118 Light | 200 g thigh -> **200 g breast** | 12 -> **8 g** | 120 -> **140 g** | 30 -> **20 g** |
| 119 Moderate | 250 g thigh -> **250 g breast** | 16 -> **10 g** | 160 -> **180 g** | 40 -> **28 g** |
| 120 Balanced | 320 g thigh -> **320 g breast** | 20 -> **12 g** | 200 -> **220 g** | 60 -> **40 g** |

All pita portions stay inside the 335 g Pita Bread yield. The thigh-to-breast swap is the main fat lever (10 % -> 3.6 %); the oil and feta trims finish it; the pita raise supplies the carbs.

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 118 Light | **575** | **46.5** | **27.3** | **40.3** | 1149 |
| 119 Moderate | **719** | **58.1** | **27.8** | **39.9** | 1438 |
| 120 Balanced | **884** | **73.1** | **28.3** | **38.7** | 1768 |

All pass, ordering 575 < 719 < 884. The calories column is rewritten to the recomputed values, which also closes the KCALCOL reject. Also: is_default moves to Moderate, display_order renumbers to 1/2/3, add "warm the pita in a dry pan for 30 seconds a side" to the homemade path, and add a taste-and-adjust to the tzatziki step.

---

## Family 37 — Hash Browns & Diced Chicken

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (124) | 455 | 37.1 | 21.6 | 45.8 | 908 / 910 (-0.3 %) | — |
| Moderate (125) | 582 | 46.7 | 21.5 | 46.4 | 1164 / 1164 (0.0 %) | — |
| Balanced (126) | 745 | 59.7 | 22.1 | 45.9 | 1490 / 1490 (0.0 %) | — |

Verdicts: no macro rejects. Fat at 21.5-22.1 % is **below the 25 % chef floor** on all three — flagged, not a reject.

**Lens 3 dish-breaker — the hash browns will not work as written.** Step 1 is correct and even emphatic (*"Squeeze firmly in a clean kitchen towel to remove as much moisture as possible — this is critical for crispy hash browns"*). Step 3 then says: *"Brush the potato mixture lightly with olive oil. Air fry at 200C for 20-25 minutes, shaking halfway, until golden and crispy."* Loose grated potato tipped into an air-fryer basket and **shaken** does not become hash browns — it becomes dry shreds. There is no forming step, no binder (no egg, no flour, no starch), no compression, and shaking actively prevents the cake from setting. The recipe promises hash browns and describes something else.

**Proposed technique fix:** after step 2, form the squeezed potato-and-onion mixture into 2-4 patties about 1.5 cm thick, pressing firmly; bind with 1 beaten egg or 1 tbsp of the reserved potato starch; brush both sides with oil; air-fry at 200 C for 12 minutes, **flip once** (do not shake), then 8-10 minutes more until deep golden and crisp at the edges. If the developer prefers the loose format, the honest fix is to rename the dish (rosti shreds / potato hash) rather than keep a promise the method cannot deliver.

**Lens 4 / dish quality.** Grated potato and diced chicken breast. No acid, no green, no sauce, nothing sharp — **beige on beige**, which the lens-4 checklist fails explicitly. At 21.5 % fat it will also read dry. *Would I order this again?* No, not as plated. It needs a fried egg or a yogurt-and-chive sauce, something acidic (a squeeze of lemon, or pickled onion), and a green (chives, scallion, watercress). None of those changes threaten the macros; a fried egg would lift fat % toward the band as well.

**Proposed fix.** No macro change is required. Technique and dish-quality fixes above; is_default moves from Balanced to Moderate. **Disposition: sign off after the step rewrite, no macro change.**

---

## Family 42 — Salmon with Air-Fried Potatoes & Green Beans

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (139) | 530 | 33.0 | 39.6 | 35.4 | 1060 / 1060 (0.0 %) | **P, FAT, CARB** |
| Moderate (140) | 645 | 40.1 | 40.9 | 34.2 | 1267 / 1291 (-1.8 %) | **FAT, CARB** |
| Balanced (141) | 799 | 49.8 | 41.3 | 33.8 | 1576 / 1598 (-1.4 %) | **FAT, CARB** |

Verdicts: fat fails by 4.6-6.3 pts and carbs by 2.6-4.2 pts on all three; Light also misses protein by 2 g.

**Lens 3 / technique.** Two flags, both about coordination rather than any single step being wrong. **(1) Nothing coordinates the three components.** Step 1 preheats the oven; step 2 air-fries the potatoes for 18-22 minutes; step 3 roasts the salmon for 10-13 minutes; step 4 steams the beans for 4 minutes. Read in order, the potatoes come out and sit for ten minutes while the salmon cooks, and they will be cold and soft by plating. The steps need a "start the salmon when the potatoes have 12 minutes left" cue. **(2) Raw crushed garlic is tossed through the warm beans** at step 5 — raw garlic against hot vegetables is acrid and dominates; it should be bloomed briefly in a little of the oil, or the beans should be dressed while hot enough to cook it.

Otherwise correct: salmon patted dry before oiling, roasted skin-side down, endpoint stated (*"until just opaque"*); beans blanched to *"bright and tender-crisp"*; lemon wedges at the table.

**Lens 4 / dish quality.** Acid from lemon in the dressing and at the table; herb from dill in two places; texture from crisp potato against soft salmon and tender-crisp beans; colour from green beans and lemon against pink salmon. This is a good, honest plate. *Would I order this again?* Yes. The fat % is a nutritional target problem, not a cooking problem — the fat is the salmon, which is the dish.

**Proposed fix.** The fat is structural (salmon is 13 % fat), so the levers are to cut the *added* fat and raise the carb base rather than to touch the fish — except on Light, which also needs protein:

| Recipe | Salmon Fillet (109) | Olive oil (22) | Potato (121) |
|---|---|---|---|
| 139 Light | 260 -> **300 g** | 12 -> **6 g** | 400 -> **570 g** |
| 140 Moderate | unchanged | 16 -> **8 g** | 480 -> **670 g** |
| 141 Balanced | unchanged | 20 -> **10 g** | 600 -> **830 g** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 139 Light | **608** | **38.7** | **34.1** | **40.4** | 1215 |
| 140 Moderate | **682** | **42.0** | **33.5** | **41.8** | 1365 |
| 141 Balanced | **843** | **52.1** | **33.9** | **41.4** | 1685 |

All pass, ordering 608 < 682 < 843. Fat lands at 33.5-34.1 %, inside the band but with little headroom — the olive oil trims are load-bearing and should not be reversed. kcal runs above the design bands, which is a target miss and not a reject. Plus the two technique fixes above.

---

## Family 43 — Mediterranean Salmon with Sweet Potato & Broccoli

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (142) | 536 | 33.3 | 39.8 | 35.3 | 1066 / 1072 (-0.6 %) | **P, FAT, CARB** |
| Moderate (143) | 669 | 40.8 | 40.1 | 35.6 | 1328 / 1339 (-0.8 %) | **FAT, CARB** |
| Balanced (144) | 831 | 50.4 | 40.2 | 35.5 | 1650 / 1662 (-0.8 %) | **FAT, CARB** |

Verdicts: fat fails by 4.8-5.2 pts and carbs by 2.4-2.7 pts on all three; Light also misses protein by 1.7 g.

**Lens 3 / technique.** The same two coordination flags as family 42, and for the same reasons. Sweet potato roasts 24-30 minutes, salmon 10-13 minutes, broccoli steams 4-5 minutes, and nothing tells the cook when to start each so they land together. And raw crushed garlic is tossed through the warm broccoli at step 5. Both fixes are identical to family 42. The salmon handling itself is correct (patted dry, skin-side down, endpoint just opaque).

**Lens 4 / dish quality.** The name claims *Mediterranean*, and the dish half-earns it: olive oil, lemon, dill and broccoli are consistent, but **sweet potato is not a Mediterranean staple** and there are no olives, no capers, no tomato, no oregano — nothing that reads specifically of the region beyond the oil and the lemon. This is honest roast salmon with vegetables wearing a cuisine label it does not quite carry. The lens-4 remedy is to the dish rather than the name (a broader rename would break `recipe_families.family_name` alignment, and only the three " - Diet" rows are in scope for renaming): **adding halved cherry tomatoes to the sweet-potato tray for the last 12 minutes, plus a scatter of olives and a pinch of oregano, would make the claim true** at negligible macro cost. Recorded as a recommendation for the developer rather than applied, because it is a judgement call about what the dish is.

Otherwise: acid from lemon, colour from broccoli and orange sweet potato, texture from roasted edges against soft fish. *Would I order this again?* Yes.

**Proposed fix.**

| Recipe | Salmon Fillet (109) | Olive oil (22) | Sweet potato (15) |
|---|---|---|---|
| 142 Light | 260 -> **300 g** | 12 -> **6 g** | 340 -> **490 g** |
| 143 Moderate | unchanged | 16 -> **8 g** | 440 -> **610 g** |
| 144 Balanced | unchanged | 20 -> **10 g** | 560 -> **770 g** |

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 142 Light | **614** | **38.5** | **34.3** | **40.6** | 1228 |
| 143 Moderate | **708** | **42.1** | **32.9** | **43.3** | 1415 |
| 144 Balanced | **878** | **52.1** | **33.1** | **43.2** | 1756 |

All pass, ordering 614 < 708 < 878. Same caveat as family 42: the olive oil trims are what hold fat % inside the band.

---

## Family 87 — Greek Chicken Gyros Bowl

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (188) | 564 | 38.7 | 31.6 | 40.9 | 1096 / 1128 (-2.8 %) | — |
| Moderate (194) | 673 | 47.8 | 31.1 | 40.5 | 1286 / 1346 (-4.5 %) | — |
| Balanced (195) | 812 | 55.2 | 31.0 | 41.8 | 1560 / 1624 (-4.0 %) | — |

Verdicts: all three pass every reject condition. calories drift is -2.8 to -4.5 %, inside the 5 % tolerance (note Moderate at -4.5 % has little margin).

**Lens 5 reject — the name carries a variant suffix.** All three recipes are named `Greek Chicken Gyros Bowl - Diet`. The family name is already `Greek Chicken Gyros Bowl`, so the rename aligns the two. **Proposed fix:** `UPDATE recipes SET name = 'Greek Chicken Gyros Bowl' WHERE id IN (188, 194, 195);`

**Lens 3 / technique.** Efficient sheet-pan method with real endpoints — *"Roast 22 min until chicken hits 75C and chickpeas are crisp"*. Rice cooked in parallel with a stated time. Salad and yogurt drizzle built while the tray roasts, so the timing actually works (unlike families 42 and 43). Two small flags: step 2 quotes a raw gram figure in prose (*"with 6g olive oil"*), which reads like a spreadsheet rather than a recipe and should become "with most of the olive oil" as the sibling variant already does; and there is **no taste-and-adjust** step and **no rest** on the chicken before it goes onto the rice (diced thigh is forgiving, so this is a nit rather than a fault).

**Lens 4 / dish quality.** Acid from lemon in two places, salt from feta, fat from oil and yogurt, **texture contrast from deliberately crisped chickpeas** against soft rice, colour from cucumber, cherry tomato and the white yogurt drizzle. The crisp-chickpea call is good cooking. *Would I order this again?* Yes.

**Proposed fix.** The lens-5 rename; normalise the step 2 prose; add a taste-and-adjust before plating. No macro change. **Disposition: sign off, no macro change.**

---

## Family 93 — Chicken Carbonara

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (210) | 476 | 36.5 | 29.0 | 40.3 | 952 / 952 (0.0 %) | — |
| Moderate (211) | 650 | 45.4 | 31.6 | 40.4 | 1299 / 1299 (0.0 %) | — |
| Balanced (212) | 741 | 48.9 | 32.8 | 40.8 | 1481 / 1481 (0.0 %) | — |

Verdicts: no macro rejects on any variant. Light and Moderate land inside their kcal bands.

**The only reject in this family is the linked-extras portion on recipe 212** — quantity_grams = 300 against the 282 g Fresh Pasta yield. See the Data-integrity section for the full finding, including the complication that step 1 *deliberately* instructs a 1.1x batch, so the step text must be rewritten alongside the row.

Proposed: parent row -> quantity = 280.00, quantity_grams = 280.00; step 1 rewritten to drop the scale-up language; `recipes.calories` 1481 -> **1425**. Recomputed 212: **713 kcal/srv, P 47.8 g, fat 33.5 %, carb 39.7 %** — all pass. Ordering 476 < 650 < 713 holds. Recipes 210 and 211 are untouched. Fresh Pasta is untouched.

**Lens 3 / technique — exemplary carbonara, which is rare.** Chicken patted dry, seared to 74 C, **rested on a board**. Pancetta rendered crisp and **the pan removed from the heat** before anything else happens. Egg and Parmesan whisked *"until pale and homogenous"* in a separate bowl. Then the critical step, done correctly: *"Off the heat, add the hot pasta... Working off direct heat, pour in the egg mixture, tossing continuously and adding splashes of reserved pasta water until the sauce turns glossy and coats every strand -- do not let it scramble."* Pasta water reserved before draining. **The chicken resting juices are folded back in.** Explicit taste-and-adjust. This is the only family in the set that uses `recipe_steps.tip`.

**Lens 4 / dish quality.** Correct in composition — no cream, egg-and-cheese emulsion, pancetta, black pepper. Chicken is not traditional in carbonara but the dish does not claim to be traditional and the protein target requires it. Acid is absent, which is correct for carbonara. Texture from crisp pancetta against silky pasta; colour is pale, lifted only by pepper — a carbonara is allowed to be beige. *Would I order this again?* Yes.

**Disposition: remediate the portion (Phase 5), then sign off. No macro lever moved.**

---

## Family 94 — Apple, Cinnamon & Walnut Porridge

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (214) | 475 | 35.7 | 24.4 | 45.5 | 951 / 951 (0.0 %) | — |
| Moderate (215) | 565 | 38.0 | 25.4 | 47.7 | 1130 / 1130 (0.0 %) | — |
| Balanced (216) | 734 | 45.3 | 27.9 | 47.4 | 1468 / 1468 (0.0 %) | — |

Verdicts: all three pass and all three sit inside their kcal bands. Light fat at 24.4 % is a whisker under the 25 % chef floor — noted, not a reject. **This family is the working model for the family 1 fix.**

**Lens 3 / technique.** Clean and correct. Apple diced to a stated size; oats, milk and apple started together so the apple softens with the oats; brought to *"a gentle simmer"* then dropped to low for 8-10 minutes *"stirring frequently, until the oats are creamy and the apple has softened"*; cinnamon and salt stirred in; **honey added off the heat** so it is not cooked out; yogurt swirled through at the bowl rather than boiled; **explicit taste-and-adjust on sweetness** before serving. Nothing to fix.

**Lens 4 / dish quality.** Sweetness from apple and honey, tartness from the yogurt swirl doing acid duty, crunch from walnuts against creamy oats, and the swirl gives visual interest against the beige. *Would I order this again?* Yes.

**Proposed fix.** None. **Disposition: sign off, no macro change.**

---

## Family 95 — Mixed Berry & Greek Yogurt Smoothie

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (217) | 457 | 37.3 | 27.7 | 39.7 | 915 / 915 (0.0 %) | — |
| Moderate (218) | 558 | 41.2 | 30.1 | 40.4 | 1115 / 1116 (-0.1 %) | — |
| Balanced (219) | 711 | 50.6 | 32.6 | 38.9 | 1422 / 1422 (0.0 %) | — |

Verdicts: all three pass and all three sit inside their kcal bands.

**Lens 2 note.** Greek yogurt at 470 / 500 / 600 g = 235 / 250 / 300 g per serving. High, but a smoothie is a bulk-liquid format and 250 g of yogurt in a large glass is normal. **Recorded as accepted; no change proposed.** (Contrast family 96, where the same ingredient at 450 g/serving in a bowl is not defensible.)

**Lens 3 / technique.** Four steps, which is the right number for a blender drink. Everything into the jug, blended on high *"scraping down the sides if needed, about 1 minute"* — a real endpoint. **Taste and adjust sweetness** before pouring. Served immediately. Chia seeds go in before blending, which is correct (they thicken as they hydrate; adding them after would leave gritty whole seeds). Nothing to fix.

**Lens 4 / dish quality.** Tartness from the berries, fat and body from yogurt and walnuts, sweetness adjusted to taste. Colour is good. A smoothie has no texture-contrast obligation. *Would I order this again?* Yes.

**Proposed fix.** None. **Disposition: sign off, no macro change.**

---

## Family 96 — Greek Yogurt & Granola Bowl

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (220) | 453 | 36.2 | 27.5 | 40.6 | 907 / 907 (0.0 %) | — |
| Moderate (221) | 574 | 43.2 | 28.4 | 41.5 | 1148 / 1148 (0.0 %) | — |
| Balanced (222) | 729 | 55.2 | 28.1 | 41.6 | 1458 / 1458 (0.0 %) | — |

Verdicts: no macro rejects; all three inside their kcal bands.

**Lens 4 dish-breaker — the portions are not real.** Greek yogurt at 600 / 700 / **900 g** for two servings is 300 / 350 / **450 g per person**. 450 g is a whole large tub. This family passes every macro reject *because* yogurt is protein-dense, which is precisely the case the lens-4 test exists to catch: the numbers are right and the bowl is not. Against it sit only 90-120 g of granola and a scatter of berries, so the ratio is wrong as well as the absolute quantity.

**Proposed fix.** Rebalance toward the granola, which is the component the bowl is named for:

| Recipe | Greek yogurt (49) | Goodness Granola (linked 213) |
|---|---|---|
| 220 Light | 600 -> **400 g** | 90 -> **110 g** |
| 221 Moderate | 700 -> **450 g** | 110 -> **135 g** |
| 222 Balanced | 900 -> **500 g** | 120 -> **165 g** |

Goodness Granola computes to 479 kcal/100 g against ~72 for Greek yogurt, so roughly 20 g of granola replaces 95 g of yogurt on kcal. **These figures need a recompute before the migration is written** — they are directional, and the exact grams should be tuned so each variant holds protein >=35 g, fat <=35 % and carbs >=38 % while preserving Light < Moderate < Balanced. Granola is fat-dense (25.56 g/100 g), so fat % is the binding constraint on this rebalance, not protein. The step text ("Spoon the Greek yogurt into two bowls", "Top with Ng of the linked Goodness Granola") must be regenerated with the new grams.

If the developer prefers to leave the portions alone, that is a legitimate call — nothing is nutritionally wrong — but it should be an explicit decision, not an omission.

**Lens 3 / technique.** Four steps, appropriate for an assembly dish, and the last one earns its place: *"Drizzle with honey and serve immediately -- the granola softens if left to sit."* That is real craft in one clause. The linked granola prep step carries an alt_instruction for the store-bought path. Nothing to fix.

**Lens 4 / rest of the plate.** Tartness from yogurt and berries, sweetness from honey, and genuine texture contrast from crisp granola against thick yogurt. Colour from the berries. *Would I order this again?* Yes — at a sane portion.

---

## Family 97 — Poached Eggs, Smoked Salmon & Avocado on Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (223) | 509 | 35.6 | 33.7 | 38.4 | 1018 / 1018 (0.0 %) | — |
| Moderate (224) | 641 | 39.5 | 33.8 | 41.6 | 1283 / 1282 (0.0 %) | — |
| Balanced (225) | 775 | 49.4 | 34.3 | 40.2 | 1550 / 1550 (0.0 %) | — |

Verdicts: all three pass, and all three sit inside their kcal bands. The margins are thin — Light carbs at 38.4 % and Balanced fat at 34.3 % are close to their limits, so any future portion change here needs a recompute.

**Lens 3 / technique.** Correct poaching, described properly: water to *"a gentle simmer (not a rolling boil)"*; **a splash of the lemon juice added to the water** to help the whites set; each egg cracked into a small cup first, then slid in; 3 minutes for a runny yolk *"until the white is set"*; **lifted out and drained briefly on kitchen paper** so the toast does not go soggy. That last detail is the one most recipes omit. Nothing to fix.

**Lens 4 / dish quality.** Acid from lemon; salt from the smoked salmon; fat from avocado and yolk; herb from dill; heat from cracked pepper. Colour is genuinely good — pink salmon, green avocado, yellow yolk, green dill. Texture from crisp toast against soft everything else. *Would I order this again?* Yes; this is a restaurant plate.

**Proposed fix.** None. **Disposition: sign off, no macro change.**

---

## Family 98 — Soft-Boiled Eggs, Cottage Cheese & Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (226) | 479 | 35.2 | 27.1 | 43.5 | 958 / 957 (0.1 %) | — |
| Moderate (227) | 610 | 41.7 | 27.4 | 45.2 | 1220 / 1220 (0.0 %) | — |
| Balanced (228) | 770 | 52.6 | 27.3 | 45.4 | 1540 / 1540 (0.0 %) | — |

Verdicts: all three pass. Light protein at 35.2 g clears the floor by 0.2 g — worth noting, because any downward portion change would break it.

**Lens 3 / technique.** Correct and precise. Eggs lowered into already-gently-boiling water (not started cold), 6 minutes *"for a soft, jammy yolk (7 minutes for firmer)"* — a real choice with a real endpoint; then **an ice bath for 1 minute to stop the cooking** before peeling, which is both the right technique and the reason the eggs peel cleanly. Nothing to fix.

**Lens 4 / dish quality.** Cottage cheese on toast with jammy eggs and spring onion. **There is no acid** — a squeeze of lemon or a few drops of vinegar over the cottage cheese would sharpen the whole plate, and cottage cheese without it reads bland and milky. Texture contrast is present (crisp toast, set white, liquid yolk). Colour is thin: white cheese, white-and-yellow egg, beige toast, with spring onion as the only green. *Would I order this again?* Yes, with lemon and more pepper than the recipe suggests.

**Proposed fix.** No macro change. Recommended: add lemon to the cottage cheese step, and a herb (chives or dill) alongside the spring onion. **Disposition: sign off, no macro change.**

---

## Family 99 — Fried Eggs with Halloumi & Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (229) | 520 | 36.3 | 33.7 | 38.4 | 1040 / 1040 (0.0 %) | — |
| Moderate (230) | 627 | 37.7 | 34.9 | 41.0 | 1253 / 1253 (0.0 %) | — |
| Balanced (231) | 725 | 44.9 | 34.9 | 40.3 | 1451 / 1450 (0.0 %) | — |

Verdicts: all three pass, but **Moderate and Balanced sit at 34.9 % fat against a 35 % ceiling** — 0.1 pt of margin. Light carbs at 38.4 % are similarly tight. This family passes on the numbers and has no room at all; any portion change requires a recompute.

**Lens 3 / technique.** Good, and the variants differ intelligently: halloumi *"patted dry"* then fried in a **dry** non-stick pan on Light (*"no added oil needed"* — correct, halloumi releases its own fat) and in olive oil on the richer variants. 1-2 minutes per side *"until golden and crisp at the edges"*. Then the halloumi is pushed aside and the eggs cracked into the same pan so they cook in the rendered halloumi fat — efficient, and it builds flavour. Ham warmed 30 seconds per side. Nothing to fix.

**Lens 4 / dish quality.** **This plate is very salty and has no counterpoint.** Halloumi is a salt-cured cheese, the ham is cured, and the recipe then instructs *"Season with salt and pepper"* at step 5. There is no acid anywhere and nothing fresh. A halloumi-and-ham breakfast needs a sharp element — lemon over the halloumi (standard practice), a tomato, or a pickle — and something green. **Recommendation: drop the added salt from step 5 and add a lemon wedge**; both are free on macros. Colour is beige-and-pink with no green. *Would I order this again?* Yes, once, and I would ask for lemon.

**Proposed fix.** No macro change (and none is safely available — see the 0.1 pt fat margin). Recommended: remove the salt instruction from step 5, add lemon, add a green. **Disposition: sign off, no macro change.**

---

## Family 100 — Cheese & Ham Omelette with Toast

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (232) | 548 | 37.1 | 33.7 | 39.2 | 1096 / 1096 (0.0 %) | — |
| Moderate (233) | 643 | 38.1 | 33.3 | 43.1 | 1287 / 1287 (0.0 %) | — |
| Balanced (234) | 792 | 47.7 | 34.2 | 41.7 | 1584 / 1584 (0.0 %) | — |

Verdicts: all three pass. Fat runs 33.3-34.2 %, inside the band but without much headroom.

**Lens 3 / technique.** The omelette method is genuinely good — French soft-curd, described accurately: *"let them sit undisturbed for 10 seconds, then gently push the curds from the edges to the centre, tilting the pan to let the raw egg flow to the edges. Repeat for 1-2 minutes until mostly set but still glossy."* Butter melted over **medium-low** heat, not high. Filling scattered over one half and folded, so the cheese melts in residual heat rather than being cooked. Two carriers of linked components (Milk Bread 26 and Honey Ham 64) both with alt_instruction populated. One phrasing nit: step 2 says *"Whisk the eggs off the heat"* — the eggs are in a bowl and were never on heat, so the clause is confusing; it should read "Whisk the eggs in a bowl with a pinch of the salt and pepper until just combined."

**Lens 4 / dish quality.** Egg, cheddar, honey ham, buttered toast. No acid, nothing green, nothing sharp. Yellow-on-pink-on-beige. Chives in the eggs and a few grinds of pepper would cost nothing and fix both the colour and the flatness. *Would I order this again?* Yes — a well-made omelette carries itself — but it is the least interesting plate among the passing breakfasts.

**Proposed fix.** No macro change. Recommended: fix the step 2 phrasing; add chives. **Disposition: sign off, no macro change.**

---

## Family 101 — Baked Cod with Lemon, Herbs & New Potatoes

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (235) | 459 | 41.6 | 22.2 | 41.5 | 917 / 917 (0.0 %) | — |
| Moderate (236) | 570 | 51.6 | 24.3 | 39.5 | 1140 / 1140 (0.0 %) | — |
| Balanced (237) | 711 | 62.7 | 23.4 | 41.4 | 1422 / 1422 (0.0 %) | — |

Verdicts: all three pass every reject and **all three sit inside their kcal design bands** — one of only a handful of families in the set that do. Fat at 22.2-24.3 % is below the 25 % chef floor on all three, which is inherent to cod (a very lean fish) and is flagged rather than treated as a fault.

**Lens 3 / technique — the best-sequenced recipe in the audit.** Potatoes go in for 20 minutes **first**, then the cod is *nestled among them* and the tray returned for 12-15 minutes, so both components finish together in one dish with no coordination problem and no cold potatoes. The cod is patted dry and seasoned before oiling; lemon slices go on top so they perfume rather than stew; the endpoint is doubly specified — *"until the cod flakes easily with a fork and reaches 63C (145F) internally"*, which is the correct temperature for cod and rarely stated. Parsley and remaining lemon wedges at the finish. Nothing to fix.

**Lens 4 / dish quality.** Acid from lemon in the tray and at the table; salt seasoned in stages; fat from olive oil — modest, as cod demands; herb from parsley; colour from lemon slices and green parsley against white fish and golden potato. Texture from roasted potato edges against flaking fish. The one thing it lacks is a green vegetable, which is a serving-suggestion gap rather than a defect. *Would I order this again?* Yes.

**Proposed fix.** None. Optionally suggest a green alongside. **Disposition: sign off, no macro change.**

---

## Family 102 — Pan-Seared Mackerel with Greens & Quinoa

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (238) | 528 | 38.3 | 32.4 | 38.5 | 1056 / 1056 (0.0 %) | — |
| Moderate (239) | 624 | 42.3 | 33.7 | 39.2 | 1249 / 1249 (0.0 %) | — |
| Balanced (240) | 788 | 53.4 | 34.0 | 38.9 | 1575 / 1575 (0.0 %) | — |

Verdicts: all three pass. Margins are tight on both sides — carbs 38.5-39.2 % against a 38 % floor and fat 32.4-34.0 % against a 35 % ceiling — so any portion change needs a recompute. Mackerel is an oily fish, which is why fat sits high.

**Lens 3 / technique — excellent fish craft.** The mackerel is patted **completely** dry and *the skin is scored lightly* (so it does not contract), then laid skin-side down in a **dry** pan over high heat — correct, oily fish needs no added fat — and *"press gently for the first 30 seconds to stop it curling"*, which is exactly the detail that separates crisp skin from a curled fillet. Seared 3-4 minutes to crisp, then flipped for only 1-2 minutes. Spinach wilted in the same pan in 30-60 seconds, picking up the fish fat. Dressing whisked separately. Nothing to fix.

**Lens 4 / dish quality.** Acid from the lemon-yogurt dressing, which also supplies the cooling fat that oily mackerel needs; salt seasoned on the fish; texture from crisp skin against soft quinoa and wilted spinach; colour from dark spinach and pale dressing against bronzed skin. Mackerel is a strong, assertive fish and the plate is built to carry it. *Would I order this again?* Yes.

**Gout note.** Mackerel is an oily fish but is **not** on the `CLAUDE.md` avoid-list, which names anchovies and sardines specifically. No action.

**Proposed fix.** None. **Disposition: sign off, no macro change.**

---

## Family 103 — Herb-Roasted Chicken Breast with Sweet Potato & Greens

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (241) | 477 | 41.4 | 25.9 | 39.4 | 955 / 955 (0.0 %) | — |
| Moderate (242) | 649 | 53.9 | 27.9 | 38.8 | 1298 / 1298 (0.0 %) | — |
| Balanced (243) | 797 | 70.9 | 24.9 | 39.5 | 1594 / 1594 (0.0 %) | — |

Verdicts: all three pass, and all three sit inside their kcal bands. Balanced fat at 24.9 % is a whisker under the 25 % chef floor — noted only.

**Lens 3 / technique.** Well-sequenced: vegetables roast 15 minutes alone, then are pushed to the sides and the chicken added for 20-25 minutes, so both finish together on one tray. Endpoint doubly specified — *"until the chicken reaches 74C (165F) internally and the vegetables are tender and caramelized"*. And step 5 is the reason this family is a model: *"Rest the chicken for 5 minutes before slicing -- this keeps the juices in the meat instead of on the board. Spoon any resting juices back over the sliced chicken before serving."* That is both the rest and the juice-return, with the reasoning given to the cook. Nothing to fix.

**Lens 4 / dish quality.** Rosemary and garlic carry the aromatics; caramelised sweet potato supplies sweetness; broccoli gives the green and a firm bite against the soft potato. **There is no acid** — a squeeze of lemon over the finished tray would sharpen the whole thing and costs nothing. Colour is good (orange, green, browned chicken). *Would I order this again?* Yes.

**Proposed fix.** No macro change. Recommended: add lemon at the finish. **Disposition: sign off, no macro change.**

---

## Family 104 — Beef Meatballs in Tomato Sauce with Spaghetti

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (244) | 482 | 44.1 | 23.3 | 40.1 | 964 / 964 (0.0 %) | — |
| Moderate (245) | 630 | 55.2 | 23.2 | 41.8 | 1261 / 1261 (0.0 %) | — |
| Balanced (246) | 771 | 69.1 | 24.2 | 40.0 | 1543 / 1543 (0.0 %) | — |

Verdicts: all three pass, and all three sit inside their kcal bands. Fat runs 23.2-24.2 %, just under the 25 % chef floor on all three — a lean-mince consequence, flagged not failed.

**Lens 3 / technique.** Sound, with one piece of real craft: *"Mix gently and shape into ~10 meatballs -- don't overwork the mixture or they will turn dense."* Meatball count scales with the variant (10 on Light, 14 on Balanced), which is the right way to express a portion change in prose. Meatballs browned on all sides and **removed** before the sauce is built in the same pan; garlic 30 seconds; passata brought to a simmer; meatballs returned to finish *covered* for 15 minutes so they poach rather than fry. **Pasta water reserved** *"to loosen the sauce if needed"*. **Explicit taste-and-adjust** before plating. Nothing to fix.

**Lens 4 / dish quality.** Acid from the passata; salt adjusted; fat modest; parmesan for umami; **basil for the green and the top note**. Texture from browned meatball crust against soft interior and pasta. Colour is red, green and pale — the classic, and it works. *Would I order this again?* Yes.

**Proposed fix.** None. **Disposition: sign off, no macro change.**

---

## Family 105 — Beef Burger with Bun, Lettuce, Tomato & Ham

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (247) | 521 | 36.1 | 33.6 | 38.7 | 1040 / 1041 (-0.1 %) | — |
| Moderate (248) | 645 | 44.9 | 33.5 | 38.6 | 1289 / 1289 (0.0 %) | — |
| Balanced (249) | 796 | 55.4 | 33.7 | 38.5 | 1593 / 1593 (0.0 %) | — |

Verdicts: **zero macro rejects — and the dish is broken anyway.** This is the clearest case in the audit of numbers passing while the plate fails, and the finding most worth developer attention.

**Dish-breaker 1 — the gram weights are transposed.**

| Ingredient | Light (247) | Moderate (248) | Balanced (249) | Per serving |
|---|---|---|---|---|
| Beef Burger Patties (95) | **25 g** | **30 g** | **40 g** | **12.5-20 g** |
| Sliced Ham (108) | **280 g** | **350 g** | **430 g** | **140-215 g** |
| Brioche Burger Buns (94) | 210 g | 260 g | 320 g | 105-160 g |

A burger patty is 110-150 g. This recipe has **12.5 g of beef and 140 g of ham per serving** — the two figures are almost certainly swapped. As stored, "Beef Burger with Bun, Lettuce, Tomato & Ham" is a pile of ham with a smear of beef in it, and the bun is 1.5-2 buns per person. The macros pass **because** ham (18 g protein / 3 g fat per 100 g) is lean and protein-dense; correcting the transposition naively makes them fail hard — a straight swap lands all three at **52.6-52.8 % fat and 27.4-27.6 % carbs**, three rejects each, because the Beef Burger Patties ingredient is 20 % fat.

**Dish-breaker 2 — homemade-first violation.** A `Burger Patties` recipe (43) exists and is live, but family 105 uses the raw `Beef Burger Patties` ingredient (95) with no linked_recipe_id. This is the violation the hardcoded-name query in the plan missed. It also happens to be the fix: recipe 43 computes to **19.68 P / 5.38 C / 3.70 F per 100 g** — far leaner than the 17/0/20 store-bought row — so linking it makes a real burger macro-feasible where the raw ingredient does not.

**Lens 3 / technique.** Step 1 reads *"Cook the burger patties according to package directions (pan-fry or grill, roughly 4 minutes per side, until cooked through)."* Deferring to a packet is not an instruction, there is no internal temperature, no rest, and no note about not pressing the patty. Step 3 toasts the bun cut-side (correct). Otherwise it is assembly.

**Lens 4 / dish quality.** *Would I order this again?* No — because what arrives is not what was ordered. Beyond the transposition: mustard is the only condiment and the only acid; there is no cheese, no pickle, no onion; lettuce is 9-12 g per serving (a single small leaf). A burger needs a pickle or a sharp sauce to cut the fat, and this one has neither.

**Proposed fix — correct the transposition AND link the homemade patty.**

| Recipe | Beef Burger Patties (95) | **Burger Patties (linked recipe 43)** | Sliced Ham (108) |
|---|---|---|---|
| 247 Light | 25 -> **0 g** (row removed) | — -> **260 g** | 280 -> **45 g** |
| 248 Moderate | 30 -> **0 g** (row removed) | — -> **320 g** | 350 -> **60 g** |
| 249 Balanced | 40 -> **0 g** (row removed) | — -> **400 g** | 430 -> **70 g** |

Ham drops to a garnish layer (the dish name keeps it, and 22-35 g per serving is a real slice); the patty becomes the centre of the plate at 130-200 g per serving. All portions stay inside the 565 g Burger Patties yield.

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 247 Light | **540** | **38.4** | **30.4** | **41.2** | 1079 |
| 248 Moderate | **669** | **47.7** | **30.4** | **41.1** | 1337 |
| 249 Balanced | **825** | **58.9** | **30.4** | **41.0** | 1649 |

All pass, ordering 540 < 669 < 825, fat comfortably mid-band on all three — a better result than the current data achieves, and an honest burger. The linked row requires a matching `recipe_steps` row carrying linked_recipe_id = 43 and a populated alt_instruction ("Use 2 store-bought beef burger patties (~130g each)."), per `.claude/rules/linked-recipe-extras.md`. Step 1 is rewritten with a real method: pat dry, sear 3-4 minutes per side without pressing, to 71 C, rest 3 minutes. Bun weight should also be reviewed down toward ~80 g per serving, and a pickle and a slice of cheese are recommended.

**This family was in the Group A list — macro-clean, sign off, no macro change. It should not be signed off in that state.** It needs a decision: apply the fix above, leave the data and accept that the dish is a ham sandwich, or reclassify. Recommended disposition: **remediate and sign off** using the numbers above.

---

## Family 106 — Turkey Burger with Bun & Slaw

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (250) | 515 | 35.1 | 34.4 | 38.3 | 1029 / 1029 (0.0 %) | — |
| Moderate (251) | 645 | 43.8 | 33.8 | 39.0 | 1289 / 1289 (0.0 %) | — |
| Balanced (252) | 778 | 53.2 | 34.5 | 38.2 | 1557 / 1556 (0.0 %) | — |

Verdicts: all three pass, but the margins are the tightest in the whole audit — Light at **35.1 g protein** (0.1 g over the floor) and **38.3 % carbs** (0.3 pt over), Balanced at **34.5 % fat** (0.5 pt under the ceiling) and **38.2 % carbs**. Any portion change here needs a full recompute.

**Homemade-first violation.** Family 106 uses raw `Mayonnaise` (ingredient 87) at 10 / 12 / 18 g while the `Mayonnaise` recipe (62) exists and is live. This is the second violation the hardcoded-name query missed. **Proposed fix:** convert to an FR-103 dual-path row — keep ingredient_id = 87 (the store-bought fallback) and add linked_recipe_id = 62, on **all three variants** so the store-bought option is consistent across the family. Homemade Mayonnaise computes to 73.06 g fat / 100 g against 79 on the raw row — a 7.3 % kcal divergence, inside the 10 % tolerance.

| Recipe | kcal/srv | P g | fat % | carb % | new calories |
|---|---|---|---|---|---|
| 250 Light | **512** | **35.2** | **34.0** | **38.5** | 1024 |
| 251 Moderate | **642** | **43.9** | **33.4** | **39.2** | 1283 |
| 252 Balanced | **774** | **53.3** | **34.0** | **38.4** | 1548 |

All still pass, and every margin improves slightly. The dual-path row requires a matching `recipe_steps` row with linked_recipe_id = 62 and an alt_instruction ("Measure out Ng of store-bought mayonnaise.").

**Lens 3 / technique.** Good, and it teaches: *"Mix gently and shape into 2 patties -- do not overwork the mixture"*; *"Heat a lightly oiled non-stick pan over medium heat (turkey mince is lean and sticks easily)"*; cooked to **74 C** *"and no longer pink in the middle"*, the correct and non-negotiable temperature for poultry mince, and it is stated. Slaw made while the patties cook. Bun cut-side toasted. Missing: **no rest** on the patty before assembly (30 seconds would do), and no taste-and-adjust.

**Lens 4 / dish quality.** **The slaw has no acid.** Step 3 is *"toss the shredded cabbage and carrot with the mayonnaise, salt, and pepper"* — mayonnaise, salt, pepper, and nothing sharp. A cabbage slaw without vinegar or lemon is heavy and flat, and it is doing the job of cutting a lean, dry turkey patty, which it cannot do without acid. **Recommendation: add 1 tsp cider vinegar (or lemon juice) to the slaw** — negligible on macros, decisive on the plate. Colour comes from the carrot; there is no green beyond the cabbage. *Would I order this again?* As written, no. With acid in the slaw, yes.

**Proposed fix.** The Mayonnaise dual-path link (numbers above); vinegar in the slaw; a 30-second rest on the patty. **Disposition: remediate the link, then sign off.**

---

## Family 107 — Turkey Meatballs in Tomato Sauce with Spaghetti

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (253) | 464 | 42.7 | 21.5 | 41.7 | 927 / 927 (0.0 %) | — |
| Moderate (254) | 608 | 53.4 | 21.4 | 43.4 | 1217 / 1215 (0.1 %) | — |
| Balanced (255) | 742 | 66.9 | 22.4 | 41.6 | 1484 / 1484 (0.0 %) | — |

Verdicts: all three pass, and all three sit inside their kcal bands. Fat at 21.4-22.4 % is 2.6-3.6 pts **below** the 25 % chef floor on every variant — the most pronounced case of the low-fat-reads-dry pattern among the passing families, and inevitable with 2 %-fat turkey mince. Flagged, not failed.

**Lens 3 / technique.** The same well-built method as family 104, correctly adapted for poultry, and step 4 states the reason: *"simmer 15 minutes until they reach 74C (165F) internally and the sauce has thickened slightly (turkey must be cooked through, unlike beef which can be served pink)."* Explaining *why* the temperature differs is genuinely good recipe writing. Meatball count scales 10 -> 14 with the variant; the do-not-overwork warning is carried over; pasta water reserved; explicit taste-and-adjust. Nothing to fix.

**Lens 4 / dish quality.** Acid from passata, umami from parmesan, green and top note from basil, texture from browned crust against soft interior. The honest caveat is that at 21 % fat this will taste leaner and drier than its beef sibling (family 104) no matter how well it is cooked — a spoon of olive oil stirred into the sauce at the end, or a little more parmesan, would fix the mouthfeel and push fat toward the band. **Recommended, not required.** *Would I order this again?* Yes, though I would order the beef version first.

**Proposed fix.** No macro change required. Recommended: a little more fat at the finish (olive oil or parmesan) to lift the 21 % figure toward the 25 % floor. **Disposition: sign off, no macro change.**

---

## Family 108 — Turkey Bolognese with Spaghetti

| Variant (recipe) | kcal/srv | P g | fat % | carb % | stored vs computed | Rejects |
|---|---|---|---|---|---|---|
| Light (256) | 454 | 39.2 | 23.6 | 41.9 | 912 / 908 (0.5 %) | — |
| Moderate (257) | 607 | 49.9 | 24.1 | 43.0 | 1213 / 1213 (0.0 %) | — |
| Balanced (258) | 765 | 63.6 | 24.8 | 41.9 | 1529 / 1530 (-0.1 %) | — |

Verdicts: all three pass, and all three sit inside their kcal bands. Fat at 23.6-24.8 % is just under the 25 % chef floor on all three — the same lean-turkey consequence as family 107.

**Lens 3 / technique.** Correct order of operations throughout: soffritto softened 6-8 minutes; garlic 30 seconds; mince broken up and cooked *"until no longer pink"*; **tomato paste cooked out for 1 minute before the liquid goes in**, the step most home versions skip and the one that removes the tinny edge; then a 30-35 minute uncovered simmer *"until the sauce has thickened and the turkey reaches 74C"*; bay removed; **explicit taste-and-adjust** before the pasta is tossed through. Seven clean steps. One omission relative to its siblings: **no pasta water reserved** (families 104 and 107 both do), so there is nothing to loosen or emulsify the sauce at the toss.

**Lens 4 / dish quality.** Acid from tinned tomatoes and balanced by the sugar; parmesan for salt and umami; basil for green. As with family 107, the lean mince means the sauce will read thinner in the mouth than a beef ragu — the 30-minute simmer is shorter than the 90 minutes in family 23, which compounds it. There is no wine. *Would I order this again?* Yes.

**Proposed fix.** No macro change. Recommended: reserve pasta water in step 6 to match its siblings; consider a longer simmer or a splash of wine for depth. **Disposition: sign off, no macro change.**

---

# Cheat reclassification — families 16, 28, 29, 14

Developer instruction, 2026-08-18: all four mark-for-deletion nominees become cheat meals rather than being deleted or remediated. This resolves AC-7 without deleting anything — meal-plan history is preserved, the recipes stay available and searchable (is_live stays 1), and no dish is mangled to hit a number. It follows the precedent already set for Homemade Big Mac (63) and Pastichio (65), the only two is_cheat = 1 recipes today.

**Proposed statement.** 13 recipes, all currently is_cheat = 0 and macros_audited = 0:

```sql
UPDATE recipes SET is_cheat = 1 WHERE id IN (47,48,49,        -- fam 14 Steak & Chips
                                             53,54,55,        -- fam 16 Avocado Toast
                                             94,95,96,97,     -- fam 28 Tortilla Espanola
                                             98,99,100);      -- fam 29 French Toast
```

macros_audited is deliberately left at **0** on all 13. A cheat meal is not audited and must not read as signed off.

**The evidence, as recomputed:**

| Family | Variant | kcal/srv | P g | fat % | carb % | Rejects |
|---|---|---|---|---|---|---|
| 14 Steak & Chips | Light (47) | 383 | 25.6 | 45.7 | 27.6 | P, FAT, CARB |
| | Moderate (48) | 552 | 37.5 | 47.4 | 25.4 | FAT, CARB |
| | Balanced (49) | 722 | 49.6 | 48.2 | 24.3 | FAT, CARB |
| 16 Avocado Toast | Light (53) | 357 | 12.1 | 54.9 | 31.6 | P, FAT, CARB |
| | Moderate (54) | 504 | 13.7 | 48.7 | 40.4 | P, FAT |
| | Balanced (55) | 677 | 26.7 | 53.5 | 30.7 | P, FAT, CARB |
| 28 Tortilla Espanola | Extra Light (94) | 360 | 13.2 | 52.3 | 33.1 | P, FAT, CARB + illegal label |
| | Light (95) | 467 | 17.0 | 55.4 | 30.0 | P, FAT, CARB |
| | Moderate (96) | 560 | 20.9 | 56.2 | 28.9 | P, FAT, CARB |
| | Balanced (97) | 709 | 25.3 | 56.9 | 28.8 | P, FAT, CARB |
| 29 French Toast | Light (98) | 315 | 14.4 | 46.6 | 35.2 | P, FAT, CARB, KCALCOL (+14.5 %) |
| | Moderate (99) | 425 | 16.7 | 45.1 | 39.2 | P, FAT, KCALCOL (+16.0 %) |
| | Balanced (100) | 575 | 22.2 | 45.6 | 39.0 | P, FAT, KCALCOL (+15.9 %) |

Avocado Toast runs 12.1-26.7 g protein at 48.7-54.9 % fat and Tortilla Espanola 13.2-25.3 g at 52.3-56.9 % — dishes whose identity *is* the fat (avocado; potato confited in olive oil), so reaching target means burying the defining ingredient. French Toast and Steak & Chips were salvageable but only with large portion surgery.

## is_cheat = 1 exempts these families from structural fixes as well as from the audit

Developer-confirmed on both points. Cheat families receive **no** macro remediation, **no** structural fix, **no** prose pass and **no** sign-off.

## Two consequences that will persist in the data

Both are hard rejects under `.claude/rules/recipe-variants.md`, both are named explicitly in the acceptance criteria, and both were accepted knowingly:

1. **Family 28 keeps 4 members including an Extra Light label.** Recipe 94 is not retired. AC-4 required collapsing this family to 3. The variant picker on Tortilla Espanola will continue to show four options, one with a non-standard label.
2. **Family 29 keeps Moderate at display_order 1.** AC-5 required renumbering to 1=Light / 2=Moderate / 3=Balanced. French Toast will continue to open on the wrong variant and list its variants out of calorie order.

Both families also keep is_default on Balanced (AC-3), and family 29 keeps a stored calories column 14-16 % above the recomputed total, so its recipe card will over-report calories.

Structural fixes are cheap — `recipe_family_members` writes with zero macro impact — so **if that user-facing oddity matters more than the tidiness of the exemption, this is a one-line reversal.** The final verification phase will report all of the above as outstanding rather than passing silently.

## A note for future audits

is_cheat will now carry a semantic claim the data does not support for two of the four families. Avocado Toast runs 357-677 kcal/serving and Tortilla Espanola 360-709 — neither is an indulgence in the sense Homemade Big Mac (1800 kcal/serving) is. They fail the **protein floor**, not a calorie ceiling. A user browsing cheat meals will find two modest breakfasts sitting beside a Big Mac. This blocks nothing; it is recorded so a later audit does not read is_cheat as evidence of indulgence.

---

# Sign-off protocol

For every family that reaches a passing state, one statement per family covering **all** its members together:

```sql
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (<all members>);
-- macros_audited_by intentionally NOT written: FK to users.id, and an agent-run audit has no user row.
```

A partially flagged family is a worse state than an unflagged one, because it reads as reviewed on the card while its siblings were never checked. The live data currently has **zero** partially-audited families and must still have zero afterwards.

Families 17 (Chicken Burrito Bowl) and 27 (Pad Thai) are already macros_audited = 1. Because both have `recipe_ingredients` changes, their attestations go stale: **clear to 0 / NULL before the edit, re-verify, then re-set.**

The 13 cheat recipes are never signed off.

---

# Summary table

Disposition legend: **R** = remediate and sign off, **S** = sign off with no macro change, **C** = cheat and exempt, **X** = out of scope with a decision requested.

| Fam | Name | Macro rejects | Structural | Data / lens 2 / lens 5 | Lens 3 / lens 4 | Disposition |
|---|---|---|---|---|---|---|
| 1 | Porridge with Berries & Nuts | 3 variants: P, FAT | default on Balanced | — | hob-dial heat cue; PB not stirred in; no taste-adjust | **R** |
| 4 | Pizza | Light: CARB | **4 members** (Balanced 2) | Pepperoni unit (moot after retirement) | chicken seared in a dry pan; step-8 quantities inconsistent across variants | **R** |
| 5 | Chicken Satay | 3 variants: FAT, CARB | default on Balanced | Red bell pepper, Onion units | **gout: Worcestershire in the peanut sauce**; technique otherwise excellent; the add-rice premise is wrong, rice already present | **R** |
| 7 | Chicken & Vegetable Soup | none (attested) | **default on Balanced** | — | not re-audited | **X** — fix the default or raise a ticket |
| 8 | Salmon Sandwich | Mod: P/FAT/CARB/KCALCOL; Bal: FAT/CARB | **2 members**, no Light; default on Balanced; order 1/2 | — | **no acid, no seasoning at all**; step-5 106g copy-pasted and wrong on one variant | **R** + create Light |
| 9 | Lentil Stew | 3 variants: P | default on Balanced | Onion units | no finishing acid, no herb, no crunch; Light fat 23.3 % after fix | **R** |
| 10 | Lentil Stuffed Peppers | 3 variants: P | default on Balanced | Onion, Red bell pepper units | **all-soft beige plate, Serve hot is the last step**; fat 17-20 % | **R** |
| 11 | Pink Sauce Pasta | none | legal | Fresh basil units | exemplary — canonical FR-103 pattern | **S** |
| 12 | Chicken Tikka Masala | none | default on Balanced | Onion units | **yogurt into hot acidic sauce untempered**; no heat, no coriander; fat 20-24 % | **S** |
| 14 | Steak & Chips | Light: P/FAT/CARB; Mod+Bal: FAT/CARB | default on Balanced (**exempt**) | Potatoes->Potato merge still applies | resting juices discarded; no acid, no green | **C** |
| 16 | Avocado Toast | 3 variants: P, FAT (+CARB x2) | default on Balanced (**exempt**) | Avocado units | step numbering diverges 7 vs 9; no acid | **C** |
| 17 | Chicken Burrito Bowl | none | legal | new Jalapeno ingredient | exemplary — best-written recipe in the set | **X** — jalapeno added; clear + re-set flag |
| 22 | Classic Irish Beef Stew | Light: P | default on Balanced | **step_number = 0** | **gout: Worcestershire 18 g x3**; technique otherwise the strongest in the set | **R** |
| 23 | Spaghetti Bolognese | 3 variants: KCALCOL (**+10 %, undiagnosed direction**) | legal | — | linked pasta step states no quantity; no pasta water reserved | **R** (calories only) |
| 27 | Pad Thai | none | legal | — | steps 2/3/5/9/10 name prawns and fish sauce — **removal forces step rewrites**; **fish sauce still present beside soy (gout)** | **X** — prawns out; fish sauce recommended |
| 28 | Tortilla Espanola | 4 variants: P, FAT, CARB | **4 members + Extra Light + order wrong + default Balanced (all exempt)** | — | technique excellent; fat *is* the dish | **C** — 2 hard rejects persist |
| 29 | French Toast | 3 variants: P, FAT, KCALCOL (+16 %) | order wrong + default Balanced (**exempt**) | — | technique correct; no acid or fruit | **C** — 1 hard reject persists; calories stays +16 % |
| 35 | Greek Chicken Gyros | 3 variants: FAT, CARB, KCALCOL (**-12 to -16 %**) | default on Balanced; order wrong | **FR-103 paths diverge 47 %** (homemade pita 389 vs store-bought 265 kcal/100 g); Dill, Lemon, Tomato, Red Onion units | only 5 steps; pita never warmed on the homemade path; no taste-adjust on tzatziki | **R** |
| 37 | Hash Browns & Diced Chicken | none | default on Balanced | Onion units | **dish-breaker: loose grated potato shaken in an air fryer will not form hash browns** — no forming, no binder; beige-on-beige; fat 21.5 % | **S** after step rewrite |
| 42 | Salmon w/ Air-Fried Potatoes | Light: P/FAT/CARB; Mod+Bal: FAT/CARB | legal | Dill, Lemon units | no timing coordination — potatoes go cold; raw crushed garlic on warm beans | **R** |
| 43 | Mediterranean Salmon | Light: P/FAT/CARB; Mod+Bal: FAT/CARB | legal | Dill, Lemon units | same two flags; **Mediterranean claim only half-earned** | **R** |
| 87 | Greek Chicken Gyros Bowl | none | legal | **lens 5: - Diet suffix on 188/194/195** | strong; raw gram figure in step-2 prose; no taste-adjust | **S** + rename |
| 93 | Chicken Carbonara | none | legal | **recipe 212: 300 g vs 282 g yield — and step 1 deliberately says 1.1x batch** | exemplary off-heat carbonara; resting juices returned | **R** (portion + step) |
| 94 | Apple, Cinnamon & Walnut Porridge | none | legal | — | clean; honey off heat; taste-adjust present | **S** |
| 95 | Mixed Berry & Greek Yogurt Smoothie | none | legal | 235-300 g yogurt/srv — **accepted** | clean; taste-adjust present | **S** |
| 96 | Greek Yogurt & Granola Bowl | none | legal | **450 g yogurt per serving on Balanced** | good serve-immediately note; **portion not real** | **S** after portion decision |
| 97 | Poached Eggs, Smoked Salmon & Avocado | none | legal | Fresh Dill units | excellent poaching; margins thin | **S** |
| 98 | Soft-Boiled Eggs, Cottage Cheese & Toast | none | legal | Spring onions units | correct ice-bath method; **no acid**; Light P 35.2 g | **S** |
| 99 | Fried Eggs with Halloumi & Toast | none | legal | — | **very salty, no acid, added salt on top**; fat 34.9 % — 0.1 pt margin | **S** |
| 100 | Cheese & Ham Omelette with Toast | none | legal | — | good French curd; step-2 off-the-heat phrasing wrong; no acid, no green | **S** |
| 101 | Baked Cod with Lemon, Herbs & New Potatoes | none | legal | Fresh Parsley units | **best-sequenced recipe in the audit**; 63 C stated | **S** |
| 102 | Pan-Seared Mackerel with Greens & Quinoa | none | legal | — | excellent fish craft (score, dry pan, press 30 s) | **S** |
| 103 | Herb-Roasted Chicken Breast | none | legal | Fresh rosemary units | exemplary — resting juices returned *with the reason given*; no acid | **S** |
| 104 | Beef Meatballs in Tomato Sauce | none | legal | Fresh basil units | sound; pasta water reserved; taste-adjust present; fat 23 % | **S** |
| 105 | Beef Burger with Bun, Lettuce, Tomato & Ham | none | legal | **homemade-first violation: Burger Patties (43) exists, unlinked** | **dish-breaker: patty/ham grams transposed — 12.5 g beef vs 140 g ham per serving**; according-to-package-directions | **R** — decision requested |
| 106 | Turkey Burger with Bun & Slaw | none | legal | **homemade-first violation: Mayonnaise (62) exists, unlinked** | **slaw has no acid**; 74 C stated correctly; tightest margins in the audit | **R** |
| 107 | Turkey Meatballs in Tomato Sauce | none | legal | Fresh basil units | good; explains *why* turkey needs 74 C; fat 21.4 % | **S** |
| 108 | Turkey Bolognese with Spaghetti | none | legal | Onion, Fresh basil units | tomato paste cooked out; **no pasta water reserved** (siblings do) | **S** |

**Counts:** 14 **R** (1, 4, 5, 8, 9, 10, 22, 23, 35, 42, 43, 93, 105, 106) — 17 **S** (11, 12, 37, 87, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 107, 108) — 4 **C** (14, 16, 28, 29) — 3 **X** (7, 17, 27).

The plan remediation list was 11 families (1, 4, 5, 8, 9, 10, 22, 23, 35, 42, 43), all 11 confirmed. The list above adds **93** (portion + step rewrite, which the plan placed in Phase 5 rather than counting as remediation), **105** and **106** (both newly found, both previously slated for unconditional sign-off) — **14 in total**.

---

# Decisions requested from the developer

Nothing below is applied. Each needs a yes, a no, or a different instruction.

1. **Family 105 (Beef Burger).** The patty and ham gram weights appear transposed. Apply the corrected-and-linked fix (all three variants pass at 30.4 % fat), leave the data as-is and sign off a ham sandwich, or reclassify? *Recommended: apply the fix.*
2. **Family 27 (Pad Thai) fish sauce.** Remove ingredient 142 alongside the prawns, on the same gout grounds? *Recommended: yes — it is anchovy-based, soy is already in the recipe, and the numbers pass either way.*
3. **Families 5 and 22 Worcestershire sauce.** Remove and substitute soy, on the same gout grounds? *Recommended: yes.* (Also present in already-audited families 24 and 92, and in the family-less Burger Patties recipe 43 — out of scope here, worth a follow-up ticket.)
4. **Family 7 (Chicken & Vegetable Soup).** An already-attested family defaulting to Balanced. Include it in the is_default move (making it 10 families, not 9), or raise a separate ticket? *Recommended: include it — two rows, zero macro impact.*
5. **Family 96 (Greek Yogurt & Granola Bowl).** Cut the yogurt from 900 g to 500 g on Balanced (and proportionally on the others), or accept 450 g per serving? *Recommended: cut, with a recompute to confirm fat % holds.*
6. **Family 106 (Turkey Burger).** Convert the raw Mayonnaise row to an FR-103 dual-path link to recipe 62? *Recommended: yes — it is a rule violation and every margin improves.*
7. **Family 93 (Chicken Carbonara), recipe 212.** Reduce the parent Fresh Pasta portion 300 g -> 280 g **and rewrite step 1** to drop the scale-up-1.1x language, or leave the 300 g and accept the `linked-recipe-extras.md` violation? *Recommended: reduce and rewrite.*
8. **Family 43 (Mediterranean Salmon).** Add cherry tomatoes, olives and oregano so the Mediterranean claim is honest? *Recommended: yes — negligible macro cost.*
9. **Cheat structural exemption.** Confirm that family 28 keeping 4 members with an Extra Light label, family 29 keeping Moderate at display_order 1, both keeping is_default on Balanced, and the family 29 calories staying 16 % high are all acceptable. Reversing any of them is a `recipe_family_members` write with zero macro impact.
10. **The family 22 step_number = 0.** Move the chef note into `recipe_steps.tip` on step 1 and renumber 1-10? *Recommended: yes — the post-apply verification query in the plan fails on it otherwise.*

---

*End of Phase 1 findings. No writes were issued against the live Railway MySQL. No migration file was created. `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql` does not exist and must not be created until the Phase 2 gate passes.*

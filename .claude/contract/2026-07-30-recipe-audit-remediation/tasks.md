# Tasks: Recipe audit remediation — calorie policy, 5 real failures, and the variant-picker fixes

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: IN PROGRESS
Started: 2026-07-30

**Goal:** Write the calorie-as-target policy into the rules, fix the 5 families that genuinely fail on protein/fat/carbs, repair the variant picker across 9 families, convert legacy gram-based display units, and mark all 20 audited families `macros_audited = 1`.

**Spec:** `plan.md` in this folder. Reusable verification query: `verify-macros.sql` in this folder.

**Scope correction against the approved plan.md** — `plan.md` scopes the unit sweep to "recipe ids 4–135". Querying the real blast radius found 39 affected rows **above** id 135 (Garlic, Olive oil, Black pepper and Salt each have 12, including recipes 190/198/199; Honey has 3, on 187/192/193). The developer's instruction was "All affected legacy recipes", so Phase 5 targets rows by ingredient id with no recipe-id restriction. Flagged rather than applied silently — 217 rows instead of ~178.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-07-30_audit_structural_and_seed_oil.sql` — ghee ingredient, seed-oil swap, 9 default fixes, 5 display_order fixes, 3 name fixes
- `foodbytes-app/database/migrations/2026-07-30_audit_macro_fixes.sql` — the 5 one-lever gram changes + their `recipes.calories`
- `foodbytes-app/database/migrations/2026-07-30_paella_valenciana_variants.sql` — recipe 90 fat fix + siblings 208/209
- `foodbytes-app/database/migrations/2026-07-30_legacy_display_units.sql` — 217-row display-unit conversion
- `foodbytes-app/database/migrations/2026-07-30_mark_recipes_audited.sql` — `macros_audited` across all 20 families
- `.claude/contract/2026-07-30-recipe-audit-remediation/pr-description.md` — written in Phase 7

**Modified:**
- `.claude/rules/recipe-variants.md` — new canonical section: calories are a target, not a reject
- `CLAUDE.md` — kcal reject thresholds in the targets table replaced by a pointer to the rule
- `.claude/skills/chef/SKILL.md` — step-2 table and "Recording the audit" preconditions defer to the rule

**Deleted:** (none)

---

## Phase 1 — Document the calorie policy

Docs only, no database contact. This phase comes first because every later decision — which families are marked as-is, which are fixed, what "pass" means — derives from this policy. Safe stopping point: the repo builds nothing from these files, and the rule is self-consistent whether or not the DML phases follow.

### Task 1: Add the calorie policy to `.claude/rules/recipe-variants.md` ✓

- Skill: `chef`

**Files:**
- Modify: `.claude/rules/recipe-variants.md`

- [x] **Step 1: Append the new canonical section at the end of the file**

Add after the existing final section:

```markdown

## Calories are a target, not a reject condition (audit policy, 2026-07-30)

For **audit purposes**, per-serving kcal does not fail a recipe. The bands
(Light 450–550, Moderate 550–650, Balanced 700–800) remain design targets and
should guide new recipes, but a variant outside its band is **not** a reject and
must not block `macros_audited`.

### What still rejects

| Check | Reject when |
|---|---|
| Protein | < 35 g per serving |
| Fat | > 35 % of kcal |
| Carbs | < 38 % of kcal |
| Family size | ≠ 3 members |
| Variant labels | not exactly Light / Moderate / Balanced |
| Default | `is_default` not on Moderate, or zero/multiple defaults |
| kcal ordering | not `Light < Moderate < Balanced` |

Carbs **above** 50 % is over-target but not a reject. The ≥80 kcal gap between
siblings is advisory.

### Why

The variant family *is* the calorie-matching mechanism: a user picks Light,
Moderate or Balanced to fit their own budget. A family whose Balanced runs to
850 kcal is serving that purpose, not failing — so long as the picker is honest,
which is why family size, labels, default and kcal ordering stay hard rejects.

This also aligns the audit with what the app already shows. The P/C/F traffic
light in `client/src/constants/macroTargets.js` deliberately excludes kcal
("those variants differ on kcal only, which is deliberately not traffic-lit",
line 19). Before this policy the audit failed 12 of 20 families that the UI
rendered all-green — the standard and the display disagreed, and the display was
right.

### Verify

Score per-serving protein grams, carb % and fat % from `recipe_ingredients`
plus prorated linked recipes. Report kcal for information; do not fail on it.
```

- [x] **Step 2: Confirm the section landed and no contradictory kcal reject language survives in the file**

Run: `Select-String -Path .claude\rules\recipe-variants.md -Pattern "Calories are a target|Light >600|Moderate >750|Balanced >900"`
Expected: one hit for `Calories are a target`. If any of `Light >600` / `Moderate >750` / `Balanced >900` also appear, edit those lines to read `kcal is a target, not a reject — see "Calories are a target, not a reject condition" below.`

### Task 2: Point `CLAUDE.md` at the rule instead of restating kcal rejects ✓

- Skill: `chef`

**Files:**
- Modify: `CLAUDE.md`

- [x] **Step 1: Replace the kcal reject values in the targets table**

In the "Recipe creation — non-negotiable targets" table, the `Reject if` cells currently read `>600`, `>750`, `>900` on the three calorie rows. Change each to `—` and add this line directly beneath the table:

```markdown
> **Calories are a target, not a reject condition.** A variant outside its kcal band does not fail an audit and does not block `macros_audited`. Protein, fat % and carbs % rejects below still apply in full. See `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition (audit policy, 2026-07-30)".
```

- [x] **Step 2: Confirm no stale kcal reject threshold remains**

Run: `Select-String -Path CLAUDE.md -Pattern ">600|>750|>900"`
Expected: zero hits.

### Task 3: Point the `chef` skill at the rule ✓

- Skill: `chef`

**Files:**
- Modify: `.claude/skills/chef/SKILL.md`

- [x] **Step 1: Amend the step-2 variant target table**

Add directly beneath the target table in "### 2. Design the Moderate variant first":

```markdown
> Calories are a **design target**, not an audit reject. A finished variant outside its kcal band still passes audit and can be marked `macros_audited`. See `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition".
```

- [x] **Step 2: Amend the "Recording the audit" preconditions**

In "**When you may set it to 1:**", replace the bullet beginning `Every macro **reject** condition is cleared` with:

```markdown
- Every macro **reject** condition is cleared — per-serving protein, fat % and carbs % pass on all three variants, and `recipes.calories` agrees with the recomputed whole-recipe total within 5 %. Per-serving kcal is reported but does **not** gate the flag (see `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition").
```

- [x] **Step 3: Confirm both edits landed**

Run: `Select-String -Path .claude\skills\chef\SKILL.md -Pattern "Calories are a target"`
Expected: 2 hits.

---

## Phase 2 — Structural corrections and seed-oil removal

Macro-neutral database work: the ghee swap moves whole-recipe kcal by under 3 kcal (99.80 % fat vs 100 %), and defaults, `display_order` and names do not touch macros at all. Safe stopping point because no gram weight changes — the recompute gate must return the same 6 failures before and after. Doing this before Phase 3 means an arithmetic error later cannot leave a half-renamed family or two defaults on one family.

### Task 4: Write the structural + seed-oil migration ✓

- Skill: `chef`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-30_audit_structural_and_seed_oil.sql`

- [x] **Step 1: Write the file**

```sql
-- 2026-07-30  Audit remediation part 1 — structural fixes + seed-oil removal
--
-- Macro-neutral. No gram weight changes. Three groups of change:
--
-- 1. SEED OIL. `Sunflower Oil` (ingredient 84) is a seed oil, prohibited
--    outright by CLAUDE.md ("No seed oils, margarine, or vegetable oil of
--    unknown composition"). It appears on 6 recipes: Black Pepper Beef Stir Fry
--    (84/85/86) and Chicken & Beef Chop Suey (111/112/113). Replaced with Ghee,
--    a new ingredient row — CLAUDE.md names ghee as a preferred fat and it is
--    the only approved option with a stir-fry-appropriate smoke point (butter
--    burns; olive oil is wrong for the cuisine). At 99.80 % fat vs sunflower's
--    100 %, whole-recipe kcal moves by <3 kcal on every affected recipe.
--
-- 2. VARIANT PICKER. Nine families had `is_default` on Balanced; the rule in
--    .claude/rules/recipe-variants.md requires Moderate. Five of those also had
--    `display_order` producing Moderate,Light,Balanced instead of
--    Light,Moderate,Balanced. Users were being handed the highest-calorie
--    variant by default, from a dropdown that did not read light-to-heavy.
--
-- 3. NAMES. `recipes.name` must not carry variant/diet suffixes — the family
--    name is the dish, variant labels live in recipe_family_members.
--
-- Idempotent: the INSERT is guarded, every UPDATE is an absolute assignment.
-- Re-running the whole file is a no-op.
--
-- NOTE on the guard: `<=>` is avoided because the MySQL MCP client's SQL parser
-- rejects it, and the NOT EXISTS subquery reads a derived table because MySQL
-- will not let INSERT ... SELECT read the target table directly.

-- ---------------------------------------------------------------------------
-- 1. Ghee (id 177; MAX(ingredients.id) was 176). aisle_id 9 = 'Oils & Fats',
--    the aisle of Olive oil (22), Sesame oil (129) and Sunflower Oil (84).
-- ---------------------------------------------------------------------------
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 177, 'ghee', 'Ghee', 9, 0.00, 0.00, 99.80, 1
FROM (SELECT 1) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT id, `key` FROM ingredients) AS ex
  WHERE ex.id = 177 OR ex.`key` = 'ghee'
);

-- 2. Swap Sunflower Oil -> Ghee. quantity, unit_id, quantity_grams unchanged.
UPDATE recipe_ingredients SET ingredient_id = 177
WHERE ingredient_id = 84 AND recipe_id IN (84, 85, 86, 111, 112, 113);

-- ---------------------------------------------------------------------------
-- 3. is_default -> Moderate on all nine drifted families
-- ---------------------------------------------------------------------------
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  21 THEN 1 ELSE 0 END WHERE family_id =  6;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  82 THEN 1 ELSE 0 END WHERE family_id = 23;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  85 THEN 1 ELSE 0 END WHERE family_id = 24;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id =  88 THEN 1 ELSE 0 END WHERE family_id = 25;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 105 THEN 1 ELSE 0 END WHERE family_id = 31;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 112 THEN 1 ELSE 0 END WHERE family_id = 33;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 128 THEN 1 ELSE 0 END WHERE family_id = 38;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 131 THEN 1 ELSE 0 END WHERE family_id = 39;
UPDATE recipe_family_members SET is_default = CASE WHEN recipe_id = 134 THEN 1 ELSE 0 END WHERE family_id = 40;

-- ---------------------------------------------------------------------------
-- 4. display_order -> Light=1, Moderate=2, Balanced=3 on the five scrambled
-- ---------------------------------------------------------------------------
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN  84 THEN 1 WHEN  85 THEN 2 WHEN  86 THEN 3 END WHERE family_id = 24;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN  87 THEN 1 WHEN  88 THEN 2 WHEN  89 THEN 3 END WHERE family_id = 25;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 111 THEN 1 WHEN 112 THEN 2 WHEN 113 THEN 3 END WHERE family_id = 33;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 130 THEN 1 WHEN 131 THEN 2 WHEN 132 THEN 3 END WHERE family_id = 39;
UPDATE recipe_family_members SET display_order = CASE recipe_id WHEN 133 THEN 1 WHEN 134 THEN 2 WHEN 135 THEN 3 END WHERE family_id = 40;

-- ---------------------------------------------------------------------------
-- 5. Strip suffixes / align names with family names
-- ---------------------------------------------------------------------------
UPDATE recipes SET name = 'Protein Porridge with Berries'          WHERE id IN (187, 192, 193);
UPDATE recipes SET name = 'Slow-Roasted Salmon with Citrus & Veg'   WHERE id IN (190, 198, 199);
UPDATE recipes SET name = 'Peanut Butter Banana Overnight Oats'     WHERE id IN (130, 131, 132);
```

- [x] **Step 2: Confirm the file exists and contains no `<=>` operator**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-07-30_audit_structural_and_seed_oil.sql; Select-String -Path foodbytes-app\database\migrations\2026-07-30_audit_structural_and_seed_oil.sql -Pattern "<=>"`
Expected: the file is listed; zero pattern hits.

### Task 5: Developer applies the structural migration to Railway

- Skill: `none — DBA operation against the live Railway MySQL`

**Files:** (none — operational task)

- [ ] **Step 1: Apply the migration**

The developer runs `foodbytes-app/database/migrations/2026-07-30_audit_structural_and_seed_oil.sql` against the Railway MySQL, in full, in order.

This is DML only — no DDL, no column changes — so Hibernate's `ddl-auto: validate` is unaffected and **no backend redeploy is required**.

Expected: the ghee `INSERT` affects 1 row on first run and 0 on any re-run; the swap affects 6 rows; the nine `is_default` statements affect 3 rows each; the five `display_order` statements affect 3 rows each; the three name statements affect 3 rows each.

- [ ] **Step 2: Confirm the ghee row exists before proceeding**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT id, `key`, name, aisle_id, fat_per_100g FROM ingredients WHERE id = 177 OR `key` = 'ghee';
```
Expected: exactly one row — `177 | ghee | Ghee | 9 | 99.80`. If it is absent, stop: the seed-oil swap will have failed on the foreign key.

### Task 6: Verify structure, names and the seed-oil swap

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm every family now defaults to Moderate with correct labels and order**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT rfm.family_id, rf.family_name,
       COUNT(*) AS members,
       GROUP_CONCAT(rfm.variant_label ORDER BY rfm.display_order) AS labels,
       MAX(CASE WHEN rfm.is_default = 1 THEN rfm.variant_label END) AS default_label,
       SUM(rfm.is_default) AS n_default
FROM recipe_family_members rfm
JOIN recipe_families rf ON rf.id = rfm.family_id
WHERE rfm.family_id IN (2,3,6,17,23,24,25,27,31,33,38,39,40,86,88,89,90,91,92)
GROUP BY rfm.family_id, rf.family_name
HAVING members <> 3 OR labels <> 'Light,Moderate,Balanced' OR n_default <> 1 OR default_label <> 'Moderate';
```
Expected: **zero rows**. Family 26 (Paella Valenciana) is deliberately excluded — it is built out in Phase 4.

- [ ] **Step 2: Confirm no `Sunflower Oil` remains on any recipe, and no name suffixes survive**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT 'sunflower_rows' AS check_name, COUNT(*) AS n FROM recipe_ingredients WHERE ingredient_id = 84
UNION ALL
SELECT 'suffixed_names', COUNT(*) FROM recipes WHERE name LIKE '% - Diet%' OR name LIKE '%(Light)%' OR name LIKE '%(Balanced)%'
UNION ALL
SELECT 'oats_name_mismatch', COUNT(*) FROM recipes WHERE id IN (130,131,132) AND name <> 'Peanut Butter Banana Overnight Oats';
```
Expected: `0` for all three.

- [ ] **Step 3: Confirm macros did not move — the same 6 variants still fail, no more, no fewer**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.
Expected: exactly 6 rows with a non-NULL `fails` column — recipes 84, 85, 111, 190, 127 and 90. Any other row failing means the ghee swap changed more than expected; stop and investigate.

---

## Phase 3 — The four one-lever macro fixes

Five gram changes across five recipes, each a single ingredient, plus their recalculated `recipes.calories`. Because kcal is no longer a constraint, none of these needs a compensating change elsewhere in the recipe. Safe stopping point: after this phase the recompute gate returns exactly one remaining failure (recipe 90, fixed in Phase 4).

**Precondition:** the in-flight plan's `2026-07-30-linked-extras-macro-kcal-corrections.sql` writes `recipes.calories` on recipes 90 and 127, which this phase also writes. Apply that migration **before** this one, or its values overwrite these.

### Task 7: Write the macro-fix migration ✓

- Skill: `chef`, `diet-guidelines` — `chef` owns the gram arithmetic and guarded SQL; `diet-guidelines` owns whether the fixes are nutritionally defensible (the 35 g protein floor's provenance, and the gout tradeoff in raising sirloin)

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-30_audit_macro_fixes.sql`

- [x] **Step 1: Write the file**

```sql
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
```

- [x] **Step 2: Confirm the file exists and touches only the five intended recipes**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-07-30_audit_macro_fixes.sql -Pattern "WHERE recipe_id = " | Measure-Object -Line`
Expected: 6 lines (recipe 111 appears twice).

### Task 8: Developer applies the macro-fix migration

- Skill: `none — DBA operation against the live Railway MySQL`

**Files:** (none — operational task)

- [ ] **Step 1: Confirm the in-flight plan's migration has already been applied**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT id, name, calories FROM recipes WHERE id IN (90, 127);
```
If `2026-07-30-linked-extras-macro-kcal-corrections.sql` has **not** yet been applied, stop and apply it first — it writes `recipes.calories` on both these rows and will otherwise overwrite the values set below.

- [ ] **Step 2: Apply the migration**

The developer runs `foodbytes-app/database/migrations/2026-07-30_audit_macro_fixes.sql` against the Railway MySQL. DML only; no redeploy required.

Expected: five single-row `UPDATE`s on `recipe_ingredients` (recipe 111 accounts for two), then one `UPDATE` affecting 5 rows on `recipes`.

### Task 9: Verify the five fixes and that nothing regressed

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm the five recipes now pass protein, fat and carbs**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.

Expected on the five fixed rows:

| id | protein_g | carb_pct | fat_pct | fails |
|---|---|---|---|---|
| 84 | ~36.2 | ~42.9 | ~29.8 | NULL |
| 85 | ~41.4 | ~42.4 | ~31.4 | NULL |
| 111 | ~38.4 | ~42.1 | ~31.6 | NULL |
| 190 | ~36.2 | ~39.3 | ~33.5 | NULL |
| 127 | ~36.3 | ~38.7 | ~30.7 | NULL |

Tolerance ±0.5 on each figure — `ingredients` rows carry two-decimal precision and the plan's arithmetic rounds at each step. The only row still showing `fails` should be recipe **90**.

If a row misses, the secondary lever per recipe is: **84/85** add 20 g sirloin; **111** add 20 g chicken thigh; **190** drop olive oil to 1 g; **127** drop the mayo link to 10 g. Re-run this step after any adjustment.

- [ ] **Step 2: Confirm `stored_cal_check` is clean on the five**

In the same query output, `stored_cal_check` must read `ok` for recipes 84, 85, 111, 190 and 127 — the written `recipes.calories` agrees with the recomputed whole-recipe total within 5 %.
Expected: `ok` on all five. Recipes 81/82/83 may still read `STORED CAL OFF >5%`; that is the in-flight plan's scope, not this one's.

- [ ] **Step 3: Confirm kcal ordering still holds in all four affected families**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT rfm.family_id,
       GROUP_CONCAT(ROUND(r.calories / r.default_servings) ORDER BY rfm.display_order) AS kcal_by_order,
       IF(MIN(CASE WHEN rfm.display_order = 1 THEN r.calories / r.default_servings END)
          < MIN(CASE WHEN rfm.display_order = 2 THEN r.calories / r.default_servings END)
        AND MIN(CASE WHEN rfm.display_order = 2 THEN r.calories / r.default_servings END)
          < MIN(CASE WHEN rfm.display_order = 3 THEN r.calories / r.default_servings END),
        'ok', 'ORDER BROKEN') AS verdict
FROM recipe_family_members rfm JOIN recipes r ON r.id = rfm.recipe_id
WHERE rfm.family_id IN (24, 33, 38, 89)
GROUP BY rfm.family_id;
```
Expected: `verdict = 'ok'` on all four families.

---

## Phase 4 — Paella Valenciana family build-out

Recipe 90 is a family of one with `variant_label` NULL — the only dish where the developer's "pick a different variant" remedy is unavailable. This phase cuts its olive oil to clear the 35 % fat ceiling, labels it Moderate, and clones it into Light (208) and Balanced (209) at `default_servings = 4`. Safe stopping point: after this the recompute gate returns zero failures across all 20 families.

**Design note on the scaling.** Chicken wings carry the protein at only 18 g/100 g while also carrying 15 g/100 g of fat, so scaling the wings down — the obvious way to make a Light — drops protein to 28.6 g/serving and fails the floor. All three variants therefore keep all 8 wings, and the levers are **olive oil, paella rice and butterbeans**. Light is lighter on carbs and fat, not protein.

### Task 10: Write the Paella Valenciana migration ✓

- Skill: `chef`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-30_paella_valenciana_variants.sql`

- [x] **Step 1: Write the file**

```sql
-- 2026-07-30  Audit remediation part 3 — Paella Valenciana becomes a family
--
-- Recipe 90 was a family of ONE (recipe_families 26, variant_label NULL,
-- display_order 1, is_default 1), violating .claude/rules/recipe-variants.md:
-- every meal recipe ships as Light/Moderate/Balanced. It also breached the fat
-- ceiling at 35.2 %.
--
-- default_servings stays 4 — this is a shareable pan dish, confirmed with the
-- developer.
--
-- Fat fix on 90: olive oil 46 -> 32 g  =>  fat 35.2 % -> 32.7 %.
--
-- Scaling for the siblings. Chicken wings are 18 g protein / 15 g fat per 100 g,
-- so they carry the protein AND the fat. Scaling wings down to make a Light
-- drops protein to 28.6 g/srv, which fails the 35 g floor. All three variants
-- therefore keep all 8 wings (530 g); the levers are olive oil (22), paella
-- rice (132) and butterbeans (135):
--
--            wings   oil    rice   beans  | P/srv  fat%   carb%  kcal/srv
--   Light      530   20 g   300 g  280 g  | 36.3   33.6   45.9    708
--   Moderate   530   32 g   400 g  240 g  | 37.4   32.7   48.9    812
--   Balanced   530   40 g   480 g  280 g  | 45.5   33.7   47.7    979
--
-- All three pass protein >= 35 g, fat <= 35 %, carbs >= 38 %. kcal is advisory
-- under the 2026-07-30 policy and is not banded here.
--
-- Water scales with the rice at the original 2.25:1 ratio (900 ml : 400 g), so
-- step 5's text is rewritten per variant.
--
-- Idempotent: all inserts guarded on the target recipe id, updates absolute.

-- ---------------------------------------------------------------------------
-- 1. Fix recipe 90's fat, and label it Moderate.
--    The olive oil row is stored in ml (unit_id 2): 32 g / 0.92 g per ml ~= 35 ml.
-- ---------------------------------------------------------------------------
UPDATE recipe_ingredients SET quantity = 35.00, quantity_grams = 32.00
WHERE recipe_id = 90 AND ingredient_id = 22;

UPDATE recipes SET calories = 3249 WHERE id = 90;

UPDATE recipe_family_members
SET variant_label = 'Moderate', display_order = 2, is_default = 1
WHERE family_id = 26 AND recipe_id = 90;

-- ---------------------------------------------------------------------------
-- 2. The two new recipes (208 Light, 209 Balanced). MAX(recipes.id) was 207.
-- ---------------------------------------------------------------------------
INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 208, 'Paella Valenciana', 4, 2831, 0, 1, 0
FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT id FROM recipes) AS ex WHERE ex.id = 208);

INSERT INTO recipes (id, name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 209, 'Paella Valenciana', 4, 3915, 0, 1, 0
FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT id FROM recipes) AS ex WHERE ex.id = 209);

-- 3. Meal slot — 3 = Dinner, matching recipe 90.
INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 208, 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id, meal_id FROM recipe_meals) AS ex
                  WHERE ex.recipe_id = 208 AND ex.meal_id = 3);

INSERT INTO recipe_meals (recipe_id, meal_id)
SELECT 209, 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id, meal_id FROM recipe_meals) AS ex
                  WHERE ex.recipe_id = 209 AND ex.meal_id = 3);

-- ---------------------------------------------------------------------------
-- 4. Ingredients — clone recipe 90's 13 rows, scaling only 22 / 132 / 135.
--    The Tomato passata row (ingredient 136 + linked_recipe_id 12) is copied
--    verbatim so the FR-103 dual path survives on both siblings.
-- ---------------------------------------------------------------------------
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 208, src.ingredient_id, src.linked_recipe_id,
       CASE src.ingredient_id WHEN  22 THEN  22.00 WHEN 132 THEN 300.00 WHEN 135 THEN 280.00 ELSE src.quantity END,
       src.unit_id,
       CASE src.ingredient_id WHEN  22 THEN  20.00 WHEN 132 THEN 300.00 WHEN 135 THEN 280.00 ELSE src.quantity_grams END,
       src.sort_order
FROM (SELECT ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order
      FROM recipe_ingredients WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_ingredients) AS ex WHERE ex.recipe_id = 208);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 209, src.ingredient_id, src.linked_recipe_id,
       CASE src.ingredient_id WHEN  22 THEN  43.00 WHEN 132 THEN 480.00 WHEN 135 THEN 280.00 ELSE src.quantity END,
       src.unit_id,
       CASE src.ingredient_id WHEN  22 THEN  40.00 WHEN 132 THEN 480.00 WHEN 135 THEN 280.00 ELSE src.quantity_grams END,
       src.sort_order
FROM (SELECT ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order
      FROM recipe_ingredients WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_ingredients) AS ex WHERE ex.recipe_id = 209);

-- ---------------------------------------------------------------------------
-- 5. Steps — clone all 10, preserving step 3's linked_recipe_id (12) and its
--    alt_instruction so the homemade/store-bought sauce path survives.
-- ---------------------------------------------------------------------------
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 208, src.step_number, src.instruction, src.tip, src.linked_recipe_id, src.alt_instruction
FROM (SELECT step_number, instruction, tip, linked_recipe_id, alt_instruction
      FROM recipe_steps WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_steps) AS ex WHERE ex.recipe_id = 208);

INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT 209, src.step_number, src.instruction, src.tip, src.linked_recipe_id, src.alt_instruction
FROM (SELECT step_number, instruction, tip, linked_recipe_id, alt_instruction
      FROM recipe_steps WHERE recipe_id = 90) AS src
WHERE NOT EXISTS (SELECT 1 FROM (SELECT recipe_id FROM recipe_steps) AS ex WHERE ex.recipe_id = 209);

-- 6. Water scales with the rice (2.25 ml per g of rice).
--    Light 300 g -> 675 ml; Balanced 480 g -> 1080 ml.
UPDATE recipe_steps SET instruction = REPLACE(instruction, '900ml', '675ml')
WHERE recipe_id = 208 AND step_number = 5;

UPDATE recipe_steps SET instruction = REPLACE(instruction, '900ml', '1080ml')
WHERE recipe_id = 209 AND step_number = 5;

-- ---------------------------------------------------------------------------
-- 7. Family membership — Light 1, Moderate 2 (default), Balanced 3
-- ---------------------------------------------------------------------------
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 26, 208, 0, 'Light', 1 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT family_id, recipe_id FROM recipe_family_members) AS ex
                  WHERE ex.family_id = 26 AND ex.recipe_id = 208);

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 26, 209, 0, 'Balanced', 3 FROM (SELECT 1) AS d
WHERE NOT EXISTS (SELECT 1 FROM (SELECT family_id, recipe_id FROM recipe_family_members) AS ex
                  WHERE ex.family_id = 26 AND ex.recipe_id = 209);
```

- [x] **Step 2: Confirm the file exists and every insert is guarded**

Run: `$f="foodbytes-app\database\migrations\2026-07-30_paella_valenciana_variants.sql"; (Select-String -Path $f -Pattern "^INSERT INTO" | Measure-Object).Count; (Select-String -Path $f -Pattern "NOT EXISTS" | Measure-Object).Count`
Expected: both counts are `8` — every `INSERT` carries a guard.

> **Correction, recorded at apply time (2026-07-30):** the expected count of `8` is a planning-time miscount. The SQL dictated in Step 1 contains **10** guarded inserts — two each (sibling 208 and sibling 209) into `recipes`, `recipe_meals`, `recipe_ingredients`, `recipe_steps` and `recipe_family_members`. Measured: `INSERT INTO` = 10, `NOT EXISTS` = 10. The step's real invariant — every `INSERT` carries exactly one guard — **passes**. No SQL was removed to force a match to 8; dropping a `recipe_meals` or `recipe_family_members` insert would itself be a data bug.

### Task 11: Developer applies the Paella Valenciana migration

- Skill: `none — DBA operation against the live Railway MySQL`

**Files:** (none — operational task)

- [ ] **Step 1: Confirm ids 208 and 209 are still free**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT MAX(id) AS max_recipe_id, SUM(id IN (208, 209)) AS ids_taken FROM recipes;
```
Expected: `ids_taken = 0`. If either id is taken, renumber the migration to `MAX(id) + 1` and `+ 2` throughout before applying.

- [ ] **Step 2: Apply the migration**

The developer runs `foodbytes-app/database/migrations/2026-07-30_paella_valenciana_variants.sql` against the Railway MySQL. DML only; no redeploy required.

Expected: 2 rows into `recipes`, 2 into `recipe_meals`, 26 into `recipe_ingredients` (13 per sibling), 20 into `recipe_steps` (10 per sibling), 2 into `recipe_family_members`, plus the three updates to recipe 90.

### Task 12: Verify family 26 is a valid three-variant family

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm structure, and that all three variants pass P/F/C**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.

Expected for family 26: three rows — 208 `Light` (`display_order` 1), 90 `Moderate` (2, `dflt` 1), 209 `Balanced` (3) — with `fails` NULL on all three and approximately:

| id | variant | protein_g | carb_pct | fat_pct |
|---|---|---|---|---|
| 208 | Light | ~36.3 | ~45.9 | ~33.6 |
| 90 | Moderate | ~37.4 | ~48.9 | ~32.7 |
| 209 | Balanced | ~45.5 | ~47.7 | ~33.7 |

Tolerance ±0.5. If a variant misses on fat, drop that variant's olive-oil `quantity_grams` by 4 g and re-run.

- [ ] **Step 2: Confirm the linked sauce step survived the clone on both siblings**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT ri.recipe_id, lr.name AS linked, ri.quantity_grams,
       (SELECT COUNT(*) FROM recipe_steps rs
         WHERE rs.recipe_id = ri.recipe_id
           AND rs.linked_recipe_id = ri.linked_recipe_id
           AND rs.alt_instruction IS NOT NULL AND rs.alt_instruction <> '') AS linked_steps_with_alt
FROM recipe_ingredients ri
JOIN recipes lr ON lr.id = ri.linked_recipe_id
WHERE ri.recipe_id IN (90, 208, 209) AND ri.linked_recipe_id IS NOT NULL;
```
Expected: three rows, one per recipe, each with `linked_steps_with_alt >= 1`. A zero is a breach of `.claude/rules/linked-recipe-extras.md` reject condition 4.

- [ ] **Step 3: Confirm the water quantity was rewritten per variant**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT recipe_id, step_number,
       CASE WHEN instruction LIKE '%675ml%'  THEN '675ml'
            WHEN instruction LIKE '%1080ml%' THEN '1080ml'
            WHEN instruction LIKE '%900ml%'  THEN '900ml'
            ELSE 'NO WATER FOUND' END AS water
FROM recipe_steps WHERE recipe_id IN (90, 208, 209) AND step_number = 5;
```
Expected: `208 → 675ml`, `90 → 900ml`, `209 → 1080ml`.

---

## Phase 5 — Legacy display-unit sweep

Converts roughly 217 rows from grams to cook-friendly units. `quantity_grams` is never written, so **macros cannot move** — the recompute gate must return identical figures before and after. Runs after Phases 3 and 4 so the new gram weights get correct display units. Safe stopping point: display-only change; every statement guards on `unit_id = 1`, so re-running converts nothing twice.

Scope note: rows are selected by ingredient id with **no recipe-id restriction** — see the scope correction at the top of this file. Bulk items that are correctly weighed (Butterbeans, bell peppers, Chorizo, Pepperoni, Dried Egg Noodles, meat, fish) are deliberately excluded.

### Task 13: Write the display-unit migration ✓

- Skill: `chef`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-30_legacy_display_units.sql`

- [x] **Step 1: Write the file**

```sql
-- 2026-07-30  Audit remediation part 4 — cook-friendly display units
--
-- Audit Lens 2: the legacy recipes store spices, garlic, fats, eggs and
-- condiments in grams. Nobody weighs 1 g of black pepper or 10 g of garlic.
-- `quantity` + `unit_id` is what the cook sees; `quantity_grams` is what the
-- macro maths uses. This migration changes ONLY the former.
--
-- quantity_grams NEVER appears in a SET clause. Macros cannot move.
--
-- Every statement guards on `unit_id = 1`, so a row already converted is
-- skipped: the file is idempotent and safe to re-run.
--
-- Quantities are rounded to the nearest 0.25 unit — ROUND(x * 4) / 4 — so the
-- display reads as a real measurement, with a 0.25 floor so nothing shows as 0.
--
-- Deliberately NOT converted: bulk items that are correctly weighed
-- (Butterbeans 135, bell peppers 42/127, Chorizo 73, Pepperoni 149, Dried Egg
-- Noodles 164, meat and fish), and fats under 5 g where sub-teaspoon precision
-- matters (e.g. recipe 190's 2 g olive oil after the part-2 fix).
--
-- Row counts measured against the live DB, 2026-07-30.

-- Garlic (13) -> clove, 3 g per clove. 30 rows.
UPDATE recipe_ingredients SET unit_id = 10, quantity = GREATEST(ROUND(quantity_grams / 3.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 13;

-- Ginger (14) -> tsp grated, 5 g per tsp. 18 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 14;

-- Salt (5) -> tsp, 6 g per tsp. 15 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 6.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 5;

-- Black pepper (50) and Chilli Flakes (165): under 1 g -> pinch, else tsp at
-- 2 g per tsp. Order matters — the pinch statement must run FIRST, because the
-- tsp statement would otherwise claim the sub-gram rows.
UPDATE recipe_ingredients SET unit_id = 17, quantity = 1.00
WHERE unit_id = 1 AND ingredient_id IN (50, 165) AND quantity_grams < 1;

UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 2.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (50, 165) AND quantity_grams >= 1;

-- Sugar (36) -> tsp, 4 g per tsp. 5 rows.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 4.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 36;

-- Fats: Olive oil (22), Sesame oil (129), Butter (103), Salted butter (53),
-- Unsalted butter (44), Ghee (177 — created in part 1).
-- >= 14 g -> tbsp; 5-13.99 g -> tsp; < 5 g stays in grams.
-- The tbsp statement runs first; the tsp statement then only sees rows still in
-- grams, so no row is converted twice.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 14.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (22, 129, 103, 53, 44, 177) AND quantity_grams >= 14;

UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (22, 129, 103, 53, 44, 177) AND quantity_grams >= 5 AND quantity_grams < 14;

-- Honey (4) -> tbsp, 20 g per tbsp. 13 rows.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 20.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 4;

-- Peanut butter (6) -> tbsp, 16 g per tbsp. 6 rows.
UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 16.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 6;

-- Liquid condiments: Soy sauce (25), Dark Soy Sauce (148), Lime juice (40).
-- Under 8 g -> tsp at 5 g; 8 g and over -> tbsp at 15 g. Splitting avoids
-- absurd readings like "0.25 tbsp" for a 5 g splash of dark soy.
UPDATE recipe_ingredients SET unit_id = 3, quantity = GREATEST(ROUND(quantity_grams / 5.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (25, 148, 40) AND quantity_grams < 8;

UPDATE recipe_ingredients SET unit_id = 4, quantity = GREATEST(ROUND(quantity_grams / 15.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id IN (25, 148, 40) AND quantity_grams >= 8;

-- Soft herbs: Fresh basil (29) 6 g per handful, Fresh coriander (80) 8 g.
UPDATE recipe_ingredients SET unit_id = 9, quantity = GREATEST(ROUND(quantity_grams / 6.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 29;

UPDATE recipe_ingredients SET unit_id = 9, quantity = GREATEST(ROUND(quantity_grams / 8.0 * 4) / 4, 0.25)
WHERE unit_id = 1 AND ingredient_id = 80;

-- Egg (59) -> piece, 50 g per egg. Whole eggs only, so round to integers.
UPDATE recipe_ingredients SET unit_id = 5, quantity = GREATEST(ROUND(quantity_grams / 50.0), 1)
WHERE unit_id = 1 AND ingredient_id = 59;
```

- [x] **Step 2: Confirm `quantity_grams` is never assigned in this file**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-07-30_legacy_display_units.sql -Pattern "SET.*quantity_grams\s*="`
Expected: **zero hits**. Any hit means the sweep could move macros — fix before applying.

### Task 14: Developer applies the display-unit migration

- Skill: `none — DBA operation against the live Railway MySQL`

**Files:** (none — operational task)

- [ ] **Step 1: Capture the pre-sweep macro baseline**

Read `verify-macros.sql` from this plan folder, run it via `mcp__mysql__mysql_query`, and keep the output. It is the comparison baseline for Task 15 — macros must be identical afterwards.

- [ ] **Step 2: Apply the migration**

The developer runs `foodbytes-app/database/migrations/2026-07-30_legacy_display_units.sql` against the Railway MySQL. DML only; no redeploy required.

Expected: roughly 217 rows updated in total across the statements. An exact match is not required — the count shifts with the part-2 and part-3 gram changes — but it should land in the 200–230 range. A total near zero means the `unit_id = 1` guards matched nothing, indicating the sweep had already been applied.

### Task 15: Verify the sweep changed display only

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm macros are unchanged**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.
Expected: `protein_g`, `carb_pct`, `fat_pct` and `computed_whole_kcal` identical to the Task 14 Step 1 baseline on **every** row, and `fails` NULL on every row. Any movement means a `quantity_grams` was written; investigate before proceeding.

- [ ] **Step 2: Confirm no cook-hostile gram rows remain**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT i.id, i.name, COUNT(*) AS still_in_grams
FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
WHERE ri.unit_id = 1
  AND ri.ingredient_id IN (13, 14, 5, 50, 165, 36, 4, 6, 25, 148, 40, 29, 80, 59)
GROUP BY i.id, i.name;
```
Expected: **zero rows**. Fats (22, 129, 103, 53, 44, 177) are excluded from this check because sub-5 g rows legitimately stay in grams.

- [ ] **Step 3: Confirm no absurd display quantities were produced**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT ri.recipe_id, i.name, ri.quantity, u.value AS unit, ri.quantity_grams
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
JOIN units u ON u.id = ri.unit_id
WHERE ri.unit_id IN (3, 4, 5, 9, 10, 17) AND (ri.quantity <= 0 OR ri.quantity > 12)
ORDER BY ri.quantity DESC;
```
Expected: zero rows. A quantity over 12 tsp/tbsp/cloves reads as a measuring error and should be re-expressed in a larger unit.

---

## Phase 6 — Mark all 20 families audited

Sets `macros_audited = 1` and `macros_audited_at = NOW()` across all 20 families in three groups: the 7 that only ever failed on kcal and are clean under the new policy, the 5 remediated in Phases 3–4, and re-assertion of the 8 already marked (the unit sweep touched some of their rows, and the `chef` skill treats any edit to an audited recipe as invalidating unless re-verified in the same pass). `macros_audited_by` stays NULL — an agent-run audit has no user row behind it. Safe stopping point: the flag is the last thing written, and it is gated on the recompute returning zero failures.

### Task 16: Confirm the gate is clean before marking anything

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm zero failures across all 20 families**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.
Expected: **60 rows, `fails` NULL on every one.** If any row still fails, stop — do not proceed to Task 17. Marking a family with an outstanding reject is explicitly forbidden by the `chef` skill.

- [ ] **Step 2: Confirm every family is structurally valid**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT rfm.family_id, rf.family_name, COUNT(*) AS members,
       GROUP_CONCAT(rfm.variant_label ORDER BY rfm.display_order) AS labels,
       MAX(CASE WHEN rfm.is_default = 1 THEN rfm.variant_label END) AS default_label,
       SUM(rfm.is_default) AS n_default
FROM recipe_family_members rfm JOIN recipe_families rf ON rf.id = rfm.family_id
WHERE rfm.family_id IN (2,3,6,17,23,24,25,26,27,31,33,38,39,40,86,88,89,90,91,92)
GROUP BY rfm.family_id, rf.family_name
HAVING members <> 3 OR labels <> 'Light,Moderate,Balanced' OR n_default <> 1 OR default_label <> 'Moderate';
```
Expected: **zero rows** — all 20 families, family 26 now included.

### Task 17: Write the audit-marking migration ✓

- Skill: `chef`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-30_mark_recipes_audited.sql`

- [x] **Step 1: Write the file**

```sql
-- 2026-07-30  Audit remediation part 5 — record the audit
--
-- Sets macros_audited on all 20 families audited on 2026-07-30, scored under
-- .claude/rules/recipe-variants.md ("Calories are a target, not a reject
-- condition"): protein >= 35 g, fat <= 35 %, carbs >= 38 % per serving, plus
-- family structure. Per-serving kcal is advisory and does not gate the flag.
--
-- macros_audited_by is deliberately NOT set. It is a FK to users.id and this
-- audit was run by an agent with no user row behind it — the established
-- convention (see the Stromboli family, 44/45/46) is to leave it NULL.
--
-- Whole families only. A family with some members flagged and others not reads
-- as "reviewed" on the card while its siblings were never checked, which is a
-- worse state than unaudited.
--
-- Idempotent: re-running only refreshes the timestamps.

-- Group 1 — failed the first audit on per-serving kcal ONLY. Clean under the
-- 2026-07-30 policy; structurally repaired in part 1. Not redesigned.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
   20,  21,  22,   -- family  6  Black Bean Chicken Wrap
   81,  82,  83,   -- family 23  Spaghetti Bolognese
   87,  88,  89,   -- family 25  Paella de pollo
  104, 105, 106,   -- family 31  Beef & Mushroom Black Bean Stir Fry
  130, 131, 132,   -- family 39  Peanut Butter Banana Overnight Oats
  133, 134, 135,   -- family 40  Tamarind Tossed Noodles
  187, 192, 193    -- family 86  Protein Porridge with Berries
);

-- Group 2 — genuinely failed on protein/fat/carbs; remediated in parts 2 and 3.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
   84,  85,  86,   -- family 24  Black Pepper Beef Stir Fry
  111, 112, 113,   -- family 33  Chicken & Beef Chop Suey
  127, 128, 129,   -- family 38  Reina Arepa
  190, 198, 199,   -- family 89  Slow-Roasted Salmon with Citrus & Veg
   90, 208, 209    -- family 26  Paella Valenciana
);

-- Group 3 — already marked earlier on 2026-07-30, re-verified after the
-- display-unit sweep touched some of their rows. Re-asserted so the timestamps
-- reflect the post-sweep verification rather than the pre-sweep one.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
    4,   5,   6,   -- family  2  Peanut Butter Banana Smoothie
    7,   8,   9,   -- family  3  Irish Chicken Curry
   57,  58,  59,   -- family 17  Chicken Burrito Bowl
   91,  92,  93,   -- family 27  Pad Thai
  189, 196, 197,   -- family 88  Mediterranean White Bean & Chicken Soup
  191, 200, 201,   -- family 90  High-Protein Tuscan Chicken with Rice
  202, 203, 204,   -- family 91  Tortilla de Atun
  205, 206, 207    -- family 92  Crispy Chicken Dippers with Potato Wedges
);
```

- [x] **Step 2: Confirm `macros_audited_by` is never assigned**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-07-30_mark_recipes_audited.sql -Pattern "macros_audited_by"`
Expected: one hit, inside the header comment only — no `SET macros_audited_by` anywhere.

### Task 18: Developer applies the audit-marking migration

- Skill: `none — DBA operation against the live Railway MySQL`

**Files:** (none — operational task)

- [ ] **Step 1: Apply the migration**

The developer runs `foodbytes-app/database/migrations/2026-07-30_mark_recipes_audited.sql` against the Railway MySQL. DML only; no redeploy required.

Expected: 21 rows, 15 rows, 24 rows across the three statements — 60 in total.

- [ ] **Step 2: Confirm no family is left partially audited**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT rfm.family_id, rf.family_name, SUM(r.macros_audited) AS audited, COUNT(*) AS members
FROM recipe_family_members rfm
JOIN recipes r ON r.id = rfm.recipe_id
JOIN recipe_families rf ON rf.id = rfm.family_id
GROUP BY rfm.family_id, rf.family_name
HAVING audited > 0 AND audited < members;
```
Expected: **zero rows** — across the whole database, not just this plan's families.

---

## Phase 7 — Final verification

No production changes. Confirms the cumulative work is clean and records it for the developer. There are no build or test steps because this plan changes zero Java and zero JavaScript — only Markdown and database rows — so `mvn test` and `npm run build` would prove nothing about it. Verification is the recompute gate, grep audits on the docs edits, and a check that no source file was touched.

### Task 19: Full recompute — zero failures across all 20 families

- Skill: `chef`

**Files:** (none — verification only)

- [ ] **Step 1: Run the gate one final time**

Read `verify-macros.sql` from this plan folder and run its contents via `mcp__mysql__mysql_query`.
Expected: 60 rows; `fails` NULL on every row; `audited` = 1 on every row; `stored_cal_check` = `ok` on every row this plan touched (81/82/83 may still read `STORED CAL OFF >5%` — that is the in-flight linked-extras plan's scope).

- [ ] **Step 2: Confirm the audited count and that nothing was wrongly attributed**

Run via `mcp__mysql__mysql_query`:
```sql
SELECT COUNT(*) AS rows_in_20_families,
       SUM(r.macros_audited) AS audited,
       SUM(r.macros_audited_by IS NOT NULL) AS wrongly_attributed
FROM recipe_family_members rfm JOIN recipes r ON r.id = rfm.recipe_id
WHERE rfm.family_id IN (2,3,6,17,23,24,25,26,27,31,33,38,39,40,86,88,89,90,91,92);
```
Expected: `rows_in_20_families = 60`, `audited = 60`, `wrongly_attributed = 0`.

### Task 20: Confirm the docs changes landed

- Skill: `none — grep audit of the three Markdown edits`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm the policy is stated once and referenced twice**

Run: `Select-String -Path .claude\rules\recipe-variants.md,CLAUDE.md,.claude\skills\chef\SKILL.md -Pattern "Calories are a target" | Select-Object Path,LineNumber`
Expected: at least 1 hit in `recipe-variants.md`, 1 in `CLAUDE.md`, 2 in `chef\SKILL.md`.

- [ ] **Step 2: Confirm no stale kcal reject threshold survives anywhere**

Run: `Select-String -Path CLAUDE.md,.claude\rules\*.md,.claude\skills\chef\SKILL.md,.claude\skills\diet-guidelines\SKILL.md -Pattern "Light >600|Moderate >750|Balanced >900"`
Expected: zero hits. Any hit is a file still asserting the old standard; amend it to point at the rule.

### Task 21: Confirm no source code was modified

- Skill: `none — repository sanity check`

**Files:** (none — verification only)

- [ ] **Step 1: Confirm the working tree contains only expected paths**

Run: `git status --porcelain`
Expected: modified/added paths limited to `.claude/rules/recipe-variants.md`, `CLAUDE.md`, `.claude/skills/chef/SKILL.md`, `foodbytes-app/database/migrations/2026-07-30_*.sql`, and files under `.claude/contract/2026-07-30-recipe-audit-remediation/`. **No** path under `foodbytes-app/client/src` or `foodbytes-app/foodbytes-api/src`. If any appears, revert it — this plan changes no code.

### Task 22: Write the PR description

- Skill: `none — documentation for the developer to paste`

**Files:**
- Create: `.claude/contract/2026-07-30-recipe-audit-remediation/pr-description.md`

- [ ] **Step 1: Write the file**

Include:
- A link to `plan.md` in this folder.
- **Summary:** the calorie policy change (kcal becomes a target, not an audit reject, aligning the standard with `macroTargets.js` which already excluded it), the 5 families genuinely fixed, the 9 families whose default moved from Balanced to Moderate, Paella Valenciana becoming a real three-variant family, the ~217-row display-unit sweep, and all 20 families marked audited.
- **The five migrations in required apply order**, noting that `2026-07-30-linked-extras-macro-kcal-corrections.sql` from the in-flight linked-extras plan must land before `2026-07-30_audit_macro_fixes.sql` because both write `recipes.calories` on recipes 90 and 127.
- **No redeploy required** — DML only, no DDL, so Hibernate `validate` is unaffected.
- **User-visible behaviour change:** 9 families now open on Moderate instead of Balanced, so default calories drop across a large slice of the app.
- Verification results from Phases 2, 3, 4, 5, 6 and 7.
- A one-line note for future contributors: per-serving kcal no longer fails an audit; see `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition".

---

## Self-review

(Filled by the planner before handing off so the executor can confirm coverage.)

**Spec coverage:**
- Calorie policy documented canonically + referenced twice — Tasks 1, 2, 3; verified Task 20.
- Fix the 3 substantive macro failures (84, 85, 111) — Task 7; verified Task 9.
- Fix the 3 marginal macro failures (190, 127, 90) — Tasks 7 and 10; verified Tasks 9 and 12.
- Seed-oil removal + `Ghee` ingredient — Task 4; verified Task 6 Step 2.
- Variant-picker integrity, 9 defaults + 5 `display_order` — Task 4; verified Task 6 Step 1 and Task 16 Step 2.
- Paella Valenciana build-out to 3 variants at 4 servings — Tasks 10, 11; verified Task 12.
- Name corrections (187/192/193, 190/198/199, 130/131/132) — Task 4; verified Task 6 Step 2.
- Legacy unit sweep, `quantity_grams` untouched — Task 13; verified Task 15.
- `recipes.calories` on changed rows (84, 85, 111, 127, 190, 90, 208, 209) — Tasks 7, 10; verified Task 9 Step 2 and Task 19 Step 1.
- Mark all 20 families audited, `macros_audited_by` NULL — Task 17; verified Task 18 Step 2 and Task 19 Step 2.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step carries either the exact SQL/Markdown to write or a runnable command with an `Expected:` line. The one query reused across phases lives in `verify-macros.sql` and is named by path rather than restated.

**Type / name consistency:** `Ghee` is ingredient `177` in Tasks 4, 6 and 13. Recipes `208` (Light) and `209` (Balanced) are used identically in Tasks 10, 11, 12, 17 and 19. Family `26` carries labels `Light`/`Moderate`/`Balanced` with `display_order` 1/2/3 in Tasks 10, 12 and 16. Unit ids (`1 g`, `3 tsp`, `4 tbsp`, `5 piece`, `9 handful`, `10 clove`, `17 pinch`) match the `units` table enumerated in `plan.md`. Migration filenames are identical between the File map, the writing task and the applying task in every phase.

**Phase boundary cleanliness:**
- Phase 1 — docs only; nothing builds from these files, and the rule is self-consistent standalone.
- Phase 2 — macro-neutral; the recompute gate returns the same 6 failures before and after, so no half-applied state is possible.
- Phase 3 — five absolute gram assignments; the gate returns exactly one remaining failure (recipe 90).
- Phase 4 — family 26 becomes structurally valid and the gate returns zero failures; guarded inserts mean a retry cannot duplicate rows.
- Phase 5 — display-only; macros are identical to the Task 14 baseline, verified explicitly.
- Phase 6 — the flag is written last and gated on a clean recompute; no family can end partially audited.
- Phase 7 — read-only.

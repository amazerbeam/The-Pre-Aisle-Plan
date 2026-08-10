# Tasks: Design new recipes — breakfast staples + protein mains (chicken, fish, mince, yogurt)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Process note before you start:** every dish task below has a hard "present the design and pause for developer approval" step before SQL generation, per `.claude/skills/chef/SKILL.md` step 6. This is a live human judgement call (taste, technique, whether the macro-target-driven ingredient list reads as a dish worth eating), not a build-verifiable gate. See `plan.md` → Risks and judgement calls. If you are an unattended `/fb-apply` run, you cannot obtain that approval mid-task — the recommended execution mode for this specific contract is the developer driving each dish task as a live `/chef` conversation turn, approving the design before the task's SQL step runs. Proceeding unattended means designing and inserting without that live check, deferring human review entirely to Phase 6 and the end-of-run reviewers.

Status: IN PROGRESS
Started: 2026-08-09

**Goal:** Design 15 new Light/Moderate/Balanced recipe families, 1 new Extras recipe (granola/muesli), and redesign 1 existing family (Scrambled Eggs & Toast) in place, all inserted into the live Railway MySQL via guarded, idempotent SQL, with every variant independently passing the CLAUDE.md macro targets and no reject condition from `.claude/rules/recipe-variants.md`, `linked-recipe-extras.md`, or `homemade-first-and-ingredient-dedup.md` tripped.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/00-shared-ingredients.sql` — Task 1's guarded ingredient inserts
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/granola-muesli.sql` — Task 2
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/scrambled-eggs-toast-redesign.sql` — Task 3
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/porridge-apple-cinnamon-walnut.sql` — Task 4
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/smoothie-mixed-berry-yogurt.sql` — Task 5
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/yogurt-granola-bowl.sql` — Task 6
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-poached.sql` — Task 7
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-boiled.sql` — Task 8
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-fried.sql` — Task 9
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-omelette.sql` — Task 10
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/fish-cod.sql` — Task 11
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/fish-mackerel.sql` — Task 12
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/chicken-breast-roasted.sql` — Task 13
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/beef-meatballs.sql` — Task 14
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/beef-burger.sql` — Task 15
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-burger.sql` — Task 16
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-meatballs.sql` — Task 17
- `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-bolognese.sql` — Task 18
- `.claude/contract/MPP-4-recipe-variety-expansion/pr-description.md` — Task 22

**Modified:** (none — no repository files change; the only "modification" is to live DB rows on recipes 50/51/52, described in Task 3)

**Deleted:** (none)

---

## Phase 1 — Shared ingredient prep & the Granola Extras recipe

Both tasks in this phase are hard prerequisites for later phases: Task 1's `Turkey mince` ingredient is consumed by three Phase 5 dishes and `Cod`/`Mackerel` by Phase 3; Task 2's Granola recipe is the FK target of Phase 2's Yogurt Bowl. Nothing downstream can safely start until this phase is green.

### Task 1: Create shared new ingredients (dedup-guarded) ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/00-shared-ingredients.sql`

- [x] **Step 1: Re-confirm no existing row for each of the four proposed ingredients**

Run (values already checked during planning — re-run live immediately before insert since time has passed):
```sql
SELECT id, name FROM ingredients
WHERE LOWER(name) LIKE '%turkey%'
   OR LOWER(name) LIKE '%cod%'
   OR LOWER(name) LIKE '%mackerel%'
   OR LOWER(name) LIKE '%coconut%';
```
Expected: same result as the planning audit — `Coconut milk` (id 38) is the only hit, and it is a different item. Zero rows for `Turkey mince`, `Cod`, `Mackerel`, `Coconut oil`.

- [x] **Step 2: Insert the four ingredients with guarded, idempotent SQL**

Values sourced from USDA FoodData Central typical raw/product values, matching the precision already used on existing rows (e.g. `Chicken breast` 31/0/3.6, `Greek yogurt` 10/3.6/0.7):

```sql
INSERT INTO ingredients (name, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'Turkey mince (2% fat)', 21.00, 0.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Turkey mince (2% fat)'));

INSERT INTO ingredients (name, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'Cod', 18.00, 0.00, 1.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Cod'));

INSERT INTO ingredients (name, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'Mackerel', 19.00, 0.00, 14.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Mackerel'));

INSERT INTO ingredients (name, protein_per_100g, carbs_per_100g, fat_per_100g)
SELECT 'Coconut oil', 0.00, 0.00, 100.00
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER('Coconut oil'));
```

Naming note: `Turkey mince (2% fat)` mirrors the existing `Beef Mince (3% fat)` convention — singular, sentence case, fat descriptor in parentheses.

Run via `mcp__mysql__mysql_query`, one statement per call.

- [x] **Step 3: Verify exactly one row per name and capture the new ids**

Run:
```sql
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g
FROM ingredients
WHERE name IN ('Turkey mince (2% fat)', 'Cod', 'Mackerel', 'Coconut oil');
```
Expected: exactly 4 rows returned. Record the 4 new ids in `sql/00-shared-ingredients.sql` as a trailing comment block — every later task's SQL references them by id.

- [x] **Step 4: Re-run Step 2's inserts once more and confirm zero new rows**

Run the same four `INSERT ... WHERE NOT EXISTS` statements again, then re-run Step 3's `SELECT`.
Expected: still exactly 4 rows — proves the guard is idempotent before any downstream task depends on it.

### Task 2: Design and insert the Granola/Muesli Extras recipe ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/granola-muesli.sql`

- [x] **Step 1: Resolve every ingredient against the live DB**

The user's reference recipe: rolled oats, mixed nuts/seeds, coconut oil, maple syrup or honey, cinnamon. Run the dedup query for each proposed item:
```sql
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients
WHERE name IN ('Rolled oats', 'Walnuts', 'Almonds', 'Chia seeds', 'Sesame seeds', 'Coconut oil', 'Maple syrup', 'Honey', 'Cinnamon');
```
Expected: all 9 rows found (the first 8 already confirmed live during planning; `Coconut oil` was just created in Task 1). No new ingredient inserts needed in this task.

- [x] **Step 2: Design the recipe as a single dish (no variant family), tagged Extras**

Lay out grams per ingredient for a batch yield (e.g. `default_servings` = number of ~50g portions the batch produces — pick a realistic bake batch, e.g. 8 servings of 50g = 400g total yield). Build the per-ingredient table (whole-batch columns), sum to whole-recipe P/C/F/kcal, divide by `default_servings` for per-100g-equivalent reporting (Extras recipes don't need to hit the L/M/B per-serving bands — they're a linkable component, not a meal). Run the same self-review arithmetic checks as any `/chef` design (row-level spot check, column sums, `4P+4C+9F ≈ kcal` cross-check).

- [x] **Step 3: Present the granola design to the developer and pause**

Show the full ingredient list with gram weights, the per-batch and per-100g macro table, and the proposed `recipes.name` (e.g. "Goodness Granola"). **Do not proceed to Step 4 until the developer approves in chat.**

- [x] **Step 4: Generate and run the guarded INSERT SQL**

Fetch live max ids first:
```sql
SELECT 'max_recipe_id' AS q, MAX(id) AS id FROM recipes
UNION ALL SELECT 'max_recipe_steps_id', MAX(id) FROM recipe_steps;
```
Then insert `recipes` (one row, `meal_id` reference via `recipe_meals` = 5/Extras, `calories` = whole-batch kcal from Step 2, `default_servings` = the batch-portion count chosen in Step 2), `recipe_meals` (guarded), `recipe_ingredients` (guarded, one row per approved ingredient), and `recipe_steps` (wipe-and-re-insert pattern: bake/toast method for the oats+nuts+coconut oil+syrup mixture, cooling, storage). Write the full statements to `sql/granola-muesli.sql`.

- [x] **Step 5: Verify**

Run:
```sql
SELECT r.id, r.name, r.calories, r.default_servings, rm.meal_id
FROM recipes r JOIN recipe_meals rm ON rm.recipe_id = r.id
WHERE r.name = 'Goodness Granola';
```
Expected: one row, `meal_id = 5`. Confirm no `recipe_family_members` row exists for this recipe (Extras recipes have no family) via `SELECT * FROM recipe_family_members WHERE recipe_id = <granola_id>` → zero rows.

---

## Phase 2 — Breakfast: redesign + new families

Every task in this phase is independent of the others except Task 6, which has a hard FK dependency on Task 2's granola recipe id. The phase is a safe stopping point once every task's own verification step passes — no shared state carries into Phase 3.

### Task 3: Audit and redesign Scrambled Eggs & Toast in place (family 15, recipes 50/51/52) ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/scrambled-eggs-toast-redesign.sql`

- [x] **Step 1: Run the full 5-lens `/chef` audit on the live recipe**

Pull the current state:
```sql
SELECT ri.recipe_id, i.name AS ingredient, ri.quantity, u.value AS unit, ri.quantity_grams
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
JOIN units u ON u.id = ri.unit_id
WHERE ri.recipe_id IN (50, 51, 52) ORDER BY ri.recipe_id, ri.sort_order;

SELECT recipe_id, step_number, instruction, linked_recipe_id, alt_instruction
FROM recipe_steps WHERE recipe_id IN (50, 51, 52) ORDER BY recipe_id, step_number;
```
Apply Lens 1 (recompute macros from `recipe_ingredients`, confirm `Light<Moderate<Balanced`, protein≥35g/fat 25-35%/carbs≥38% on each of 50/51/52), Lens 2 (unit realism — flag grams-stored spices/garlic/oil), Lens 3 (technique — check for a "toast the bread"/rest/taste-adjust step and whether toast is a raw "Bread" ingredient that should be a `linked_recipe_id` to `Milk Bread` id 26 instead), Lens 4 (dish quality), Lens 5 (naming/metadata, linked-step coverage).

- [x] **Step 2: Report findings ranked by severity**

Findings likely include (confirm against live data, don't assume): toast modeled as a raw "Bread" ingredient rather than linked to `Milk Bread` (id 26) — a `.claude/rules/homemade-first-and-ingredient-dedup.md` violation if confirmed; any unit-realism misses (butter/oil in grams, herbs in grams). Present the ranked findings and the proposed fix for each to the developer and **pause for approval** before making any change.

- [x] **Step 3: Apply approved fixes with guarded/idempotent SQL**

Likely shape: `UPDATE recipe_ingredients SET ingredient_id = NULL, linked_recipe_id = 26, quantity_grams = <portion used> WHERE recipe_id IN (50,51,52) AND ingredient_id = <old bread ingredient id>` (converting the raw-bread rows to a link), plus a wipe-and-re-insert on `recipe_steps` adding a `linked_recipe_id = 26` prep step with a populated `alt_instruction` (store-bought toast fallback) if Step 2 confirmed that finding, and any unit fixes (`quantity`/`unit_id` only — `quantity_grams` must not move per the unit-realism rule). Write the exact statements to `sql/scrambled-eggs-toast-redesign.sql`.

- [x] **Step 4: Recompute and verify macros are unchanged (or intentionally changed) and record the audit**

Recompute per-serving P/C/F/kcal for 50/51/52 post-fix. Confirm all three still independently pass protein≥35g/fat 25-35%/carbs≥38%, and `Light<Moderate<Balanced` still holds. Then:
```sql
UPDATE recipes
SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (50, 51, 52);
```
Verify: `SELECT id, macros_audited, macros_audited_at FROM recipes WHERE id IN (50,51,52);` → all three show `macros_audited = 1`.

### Task 4: Design and insert the new Porridge family ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/porridge-apple-cinnamon-walnut.sql`

- [x] **Step 1: Resolve ingredients**

Working direction: *Apple, Cinnamon & Walnut Porridge* — rolled oats base, fresh apple, cinnamon, walnuts, a protein source (Greek yogurt swirl or added protein powder — confirm which the live `ingredients` table supports; `Greek yogurt` id 49 confirmed live) to clear the 35g/serving floor, since oats+fruit+nuts alone under-deliver protein (same failure mode the existing `Porridge with Berries & Nuts` family would have without its own protein lever — confirm by inspecting recipe 1-3's ingredient list before finalizing the lever). Run the dedup query for `Apple` and any other new item before assuming reuse.

- [x] **Step 2: Design Moderate first, then derive Light/Balanced**

Follow `/chef` step 2 targets (Moderate 550-650kcal) and step 5's mandatory whole-recipe/per-serving table for all three variants. Run the Step 5b self-review checklist (row spot-check, column sums, `4P+4C+9F≈kcal`, ordering & gaps) before presenting.

- [x] **Step 3: Present the 3-variant design and pause for approval**

Show ingredients, gram weights, macro table (whole + per-serving), and confirm this reads as genuinely distinct from the two existing porridge families (different flavour profile, not just a portion resize).

- [x] **Step 4: Generate and run guarded INSERT SQL**

Fetch live max ids, then insert 3× `recipes` (same `name`, `calories` = per-serving kcal × `default_servings`), `recipe_meals` (`meal_id = 1`, guarded), `recipe_ingredients` ×3 (guarded), `recipe_steps` ×3 (wipe-and-re-insert), `recipe_families` (1 row), `recipe_family_members` (3 rows, Moderate `is_default=1`). Write to `sql/porridge-apple-cinnamon-walnut.sql`.

- [x] **Step 5: Verify**

Run the family-structure query from `.claude/rules/recipe-variants.md` §1-3 scoped to the new `family_id`, and recompute macros from `recipe_ingredients` to confirm within 5% of stored `calories`.

### Task 5: Design and insert the new Smoothie family ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/smoothie-mixed-berry-yogurt.sql`

- [x] **Step 1: Resolve ingredients**

Working direction: *Mixed Berry & Greek Yogurt Smoothie* — mixed berries, `Greek yogurt` (id 49, confirmed live) as the primary protein source, a liquid base (milk or kefir — dedup-check `Kefir` before assuming it doesn't exist; not found in the planning sweep, so likely a new ingredient if used). Confirm distinct from the existing `Peanut Butter Banana Smoothie` (different fruit, different protein source — yogurt vs peanut butter).

- [x] **Step 2: Design Moderate first, then derive Light/Balanced**

Same procedure as Task 4 Step 2 — Moderate target 550-650kcal/serving, full self-review before presenting.

- [x] **Step 3: Present the 3-variant design and pause for approval**

- [x] **Step 4: Generate and run guarded INSERT SQL**

Same shape as Task 4 Step 4. `meal_id = 1` (Breakfast) — also consider a second `recipe_meals` row for `meal_id = 4` (Snacks), matching the existing smoothie family's dual-meal-slot precedent (recipes 4/5/6 are tagged both Breakfast and Snacks), confirmed with the developer at presentation time. Write to `sql/smoothie-mixed-berry-yogurt.sql`.

- [x] **Step 5: Verify**

Family-structure + recomputed-macro verification, same shape as Task 4 Step 5.

### Task 6: Design and insert the Greek Yogurt & Granola Bowl family (links Task 2) ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/yogurt-granola-bowl.sql`

- [x] **Step 1: Confirm the granola recipe id from Task 2**

```sql
SELECT id, name, calories, default_servings FROM recipes WHERE name = 'Goodness Granola';
```
Compute `linked_total_yield = calories`-derived batch weight ÷ per-100g density, or more directly re-derive `linked_total_yield_g` from Task 2's ingredient gram sum. Record this value — it's the denominator for the proration in Step 3.

- [x] **Step 2: Resolve remaining ingredients**

`Greek yogurt` (id 49) as the base, fresh berries, and the granola link. Dedup-check anything else proposed (e.g. honey drizzle — `Honey` id 4 confirmed live).

- [x] **Step 3: Design all three variants with the granola link prorated correctly**

Per `.claude/rules/linked-recipe-extras.md`, the `recipe_ingredients` row for granola must set `quantity_grams` = grams of granola actually served in the bowl (e.g. 40g Light / 50g Moderate / 65g Balanced), **never** the granola recipe's total batch yield. Macro contribution = `granola_total_macros × (bowl_quantity_grams / linked_total_yield_g)`. Run the full self-review (Step 5b) including this proration term in the column sums.

- [x] **Step 4: Present the 3-variant design and pause for approval**

- [x] **Step 5: Generate and run guarded INSERT SQL, including the mandatory linked step**

Insert `recipes` ×3, `recipe_meals` (`meal_id = 1`, guarded), `recipe_ingredients` ×3 with the granola row (`ingredient_id = NULL, linked_recipe_id = <granola_id>, quantity_grams = <prorated portion>`), and `recipe_steps` ×3 where **one step per variant carries `linked_recipe_id = <granola_id>` and a populated `alt_instruction`** (e.g. instruction: "Serve <Ng> of the linked Goodness Granola over the yogurt." / alt_instruction: "Use <Ng> of store-bought granola instead."). This is the reject condition from `.claude/rules/linked-recipe-extras.md` — a linked ingredient row with no matching linked step fails verification. Then `recipe_families` + `recipe_family_members` (Moderate default). Write to `sql/yogurt-granola-bowl.sql`.

- [x] **Step 6: Verify — including the linked-step coverage query**

```sql
SELECT ri.recipe_id, r.name AS parent, lr.name AS linked,
       (SELECT COUNT(*) FROM recipe_steps rs
          WHERE rs.recipe_id = ri.recipe_id AND rs.linked_recipe_id = ri.linked_recipe_id) AS linked_step_count
FROM recipe_ingredients ri
JOIN recipes r ON r.id = ri.recipe_id
JOIN recipes lr ON lr.id = ri.linked_recipe_id
WHERE ri.linked_recipe_id = <granola_id>;
```
Expected: `linked_step_count >= 1` on all three variant rows. Plus family-structure + recomputed-macro verification as in prior tasks.

### Task 7: Design and insert the Poached Egg family ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-poached.sql`

- [x] **Step 1: Resolve ingredients**

Working direction: *Poached Eggs, Smoked Salmon & Avocado on Toast* — eggs, smoked salmon (dedup-check — likely new or reuse an existing salmon ingredient row, confirm before assuming), avocado, and toast linked to `Milk Bread` (id 26) per the homemade-first rule (never inline raw bread flour on this recipe).

- [x] **Step 2: Design Moderate first, then derive Light/Balanced, with the linked-bread step**

Full macro table + self-review per Task 4 Step 2. Because toast links `Milk Bread`, this recipe needs the same linked-step pairing as Task 6: a step with `linked_recipe_id = 26` and a store-bought-bread `alt_instruction`.

- [x] **Step 3: Present the 3-variant design and pause for approval**

- [x] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 1`. Insert `recipes` ×3, `recipe_meals`, `recipe_ingredients` (bread row: `linked_recipe_id = 26`, `quantity_grams` = grams of bread/toast actually used, not `Milk Bread`'s total batch yield), `recipe_steps` (one step per variant with `linked_recipe_id = 26` + `alt_instruction`), `recipe_families`, `recipe_family_members`. Write to `sql/egg-poached.sql`.

- [x] **Step 5: Verify**

Linked-step coverage query (same shape as Task 6 Step 6, scoped to `linked_recipe_id = 26`), family-structure query, recomputed-macro check.

### Task 8: Design and insert the Boiled Egg family ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-boiled.sql`

- [x] **Step 1: Resolve ingredients**

Working direction: *Soft-Boiled Eggs, Cottage Cheese & Toast* — eggs, `Cottage cheese` (id 169, confirmed live) as the protein top-up, toast linked to `Milk Bread` (id 26) or `Pita Bread` (id 117) — pick whichever reads better as a dish, confirm at presentation.

- [x] **Step 2: Design Moderate first, then derive Light/Balanced, with the linked-bread step**

Same procedure and linked-step requirement as Task 7 Step 2.

- [x] **Step 3: Present the 3-variant design and pause for approval**

- [x] **Step 4: Generate and run guarded INSERT SQL**

Same shape as Task 7 Step 4, `meal_id = 1`. Write to `sql/egg-boiled.sql`.

- [x] **Step 5: Verify**

Same verification shape as Task 7 Step 5.

### Task 9: Design and insert the Fried Egg family ✓

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-fried.sql`

- [x] **Step 1: Resolve ingredients**

Working direction: *Fried Eggs with Halloumi & Toast* — eggs, a high-protein cheese for the top-up (dedup-check `Halloumi` — not confirmed live during planning, search before assuming; fall back to another confirmed high-protein item if it doesn't exist), toast linked per the same bread rule as Tasks 7-8.

- [x] **Step 2: Design Moderate first, then derive Light/Balanced, with the linked-bread step**

Same procedure as Task 7 Step 2. Technique note for the `/chef` audit lens: frying eggs needs a preheated pan and enough fat to crisp the white edge without over-browning — reflect that in the `recipe_steps` instruction, not just "fry the eggs."

- [x] **Step 3: Present the 3-variant design and pause for approval**

- [x] **Step 4: Generate and run guarded INSERT SQL**

Same shape as Task 7 Step 4, `meal_id = 1`. Write to `sql/egg-fried.sql`.

- [x] **Step 5: Verify**

Same verification shape as Task 7 Step 5.

### Task 10: Design and insert the Omelette family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/egg-omelette.sql`

- [ ] **Step 1: Resolve ingredients**

Working direction: *Cheese & Ham Omelette with Toast* — eggs, cheese, ham (dedup-check — `Honey Ham` exists as an Extras recipe per CLAUDE.md's Extras examples; confirm whether to link it or use a raw deli-ham ingredient), toast linked per the bread rule. If ham is itself a linkable sub-component recipe, apply the same linked-step pairing as Tasks 6-9.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Same procedure as prior egg tasks. Technique note: whisk eggs off-heat, don't overcook (French-style soft curd vs a fully-set diner-style omelette — confirm which style with the developer at presentation since it changes doneness wording in `recipe_steps`, not macros).

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

Same shape as prior egg tasks, `meal_id = 1`. Write to `sql/egg-omelette.sql`.

- [ ] **Step 5: Verify**

Same verification shape as prior egg tasks (linked-step coverage applies only if the ham or bread component ended up linked rather than raw).

---

## Phase 3 — Fish & Chicken mains

Independent of each other and of Phase 2, dependent only on Task 1's `Cod`/`Mackerel` ingredient rows. Safe stopping point once each task's verification passes.

### Task 11: Design and insert the Cod family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/fish-cod.sql`

- [ ] **Step 1: Confirm the `Cod` ingredient id from Task 1 and resolve the rest**

```sql
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE name = 'Cod';
```
Working direction: *Baked Cod with Lemon, Herbs & New Potatoes* — cod, potatoes, lemon, herbs, olive oil. Dedup-check `New potatoes`/`Potato` before assuming which existing row to use — `.claude/rules/homemade-first-and-ingredient-dedup.md` flags `Potato`/`Potatoes` as a known historical dupe pair, confirm which is canonical before inserting.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review. Hard constraint: zero prawns/shellfish anywhere in this recipe or its sides.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3` (Dinner). Standard insert shape (recipes ×3, recipe_meals, recipe_ingredients, recipe_steps, recipe_families, recipe_family_members). Write to `sql/fish-cod.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check, plus an explicit grep-style confirmation that no ingredient row in this recipe matches `Prawns (raw, peeled)` (id 143) or any other shellfish name.

### Task 12: Design and insert the Mackerel family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/fish-mackerel.sql`

- [ ] **Step 1: Confirm the `Mackerel` ingredient id from Task 1 and resolve the rest**

Working direction: *Pan-Seared Mackerel with Greens & Quinoa* — mackerel, quinoa, leafy greens, lemon. Dedup-check `Quinoa` and any greens before assuming a new row is needed.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review. Same no-shellfish constraint as Task 11. Technique note: mackerel is an oily fish — skin-on pan-sear needs a dry-patted fillet and a hot pan for crisp skin, reflect in `recipe_steps`.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Same insert shape as Task 11. Write to `sql/fish-mackerel.sql`.

- [ ] **Step 5: Verify**

Same verification shape as Task 11 Step 5.

### Task 13: Design and insert the Chicken Breast (roasted) family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/chicken-breast-roasted.sql`

- [ ] **Step 1: Resolve ingredients**

Working direction: *Herb-Roasted Chicken Breast with Sweet Potato & Greens* — `Chicken breast` (id 11, confirmed live), sweet potato, greens, olive oil, herbs. Hard constraint: roasted or fried technique only — no breading, no curry sauce, no composed bowl beyond a simple side (those preparations already exist elsewhere in the DB per the planning audit).

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review. Technique note for `recipe_steps`: rest the chicken after roasting and return any resting juices to the plate/sauce, per the `/chef` audit lens on missing chef craft.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Standard insert shape. Write to `sql/chicken-breast-roasted.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check, plus explicit confirmation that `recipe_steps.instruction` text contains only roasting (or frying) language, no breading/frying-in-batter/curry-sauce steps.

---

## Phase 4 — Beef

### Task 14: Design and insert the Beef Meatballs family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/beef-meatballs.sql`

- [ ] **Step 1: Resolve ingredients**

Working direction: *Beef Meatballs in Tomato Sauce with Spaghetti* — `Beef Mince (3% fat)` (confirmed live, already used in the existing Bolognese and Burger Patties recipes), breadcrumbs, egg, tomato base, spaghetti. Confirm this reads as genuinely distinct from the existing `Spaghetti Bolognese` family (rolled/shaped meatballs vs loose ragù — a real technique difference, not a relabeling).

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Standard insert shape. Write to `sql/beef-meatballs.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check.

### Task 15: Design and insert the Beef Burger family (store-bought patty)

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/beef-burger.sql`

- [ ] **Step 1: Confirm the store-bought patty ingredient and resolve the rest**

```sql
SELECT id, protein_per_100g, carbs_per_100g, fat_per_100g FROM ingredients WHERE id = 95;
```
Expected: `Beef Burger Patties`, protein 17/carbs 0/fat 20 per 100g (confirmed during planning). Per the developer's explicit decision, this recipe uses `ingredient_id = 95` directly on every variant — **do not** link `Burger Patties` (id 43) and **do not** design a fresh homemade patty. Resolve the remaining ingredients: burger bun (dedup-check before assuming a new bread-adjacent ingredient is needed — `Milk Bread`/`Flatbread`/`Pita Bread` are all linkable sub-recipes but a burger bun is a distinct product; check for an existing "bun" or "bread roll" ingredient first), lettuce, tomato, cheese.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review — this is a straightforward ingredient × per-100g calc since the patty has no linked-recipe proration to worry about (store-bought, `linked_recipe_id` stays NULL on this row).

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. `recipe_ingredients` patty row: `ingredient_id = 95, linked_recipe_id = NULL`. Standard insert shape otherwise. Write to `sql/beef-burger.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check, plus explicit confirmation the patty row has `linked_recipe_id IS NULL` and `ingredient_id = 95` on all three variants (guards against accidentally reaching for id 43 mid-design).

---

## Phase 5 — Turkey

Depends on Task 1's `Turkey mince (2% fat)` ingredient row. All three tasks are independent of each other once that dependency is satisfied.

### Task 16: Design and insert the Turkey Burger family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-burger.sql`

- [ ] **Step 1: Confirm the `Turkey mince (2% fat)` ingredient id from Task 1 and resolve the rest**

Working direction: *Turkey Burger with Bun & Slaw* — turkey mince patty inlined as raw ingredients (turkey mince, breadcrumbs, egg, seasoning) directly on this recipe per the plan's Assumption (not a linked Extras sub-recipe, since no existing turkey-patty component exists to link and only this one dish uses it). Resolve bun/slaw ingredients (dedup-check, reuse from Task 15 where the burger bun item was already resolved).

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review, including the from-scratch patty's own macro contribution (turkey mince + breadcrumbs + egg, summed per variant — not a linked-recipe proration since it's inlined).

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Standard insert shape — patty ingredients are separate `recipe_ingredients` rows (turkey mince, breadcrumbs, egg, seasoning), not a single linked row. Write to `sql/turkey-burger.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check.

### Task 17: Design and insert the Turkey Meatballs family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-meatballs.sql`

- [ ] **Step 1: Confirm the `Turkey mince (2% fat)` ingredient id and resolve the rest**

Working direction: *Turkey Meatballs in Tomato Sauce* — mirrors Task 14's beef meatballs structure with turkey mince swapped in; confirm the fat-percentage difference (2% turkey vs 3% beef) is reflected correctly in the macro recompute, not copy-pasted from Task 14's numbers.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Standard insert shape. Write to `sql/turkey-meatballs.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check.

### Task 18: Design and insert the Turkey Bolognese family

- Skill: chef

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/sql/turkey-bolognese.sql`

- [ ] **Step 1: Confirm the `Turkey mince (2% fat)` ingredient id and resolve the rest**

Working direction: *Turkey Bolognese with Spaghetti* — mirrors the existing beef `Spaghetti Bolognese` (family 23, recipes 81/82/83) aromatics/tomato-base structure (onion, carrot, celery, garlic, tinned tomatoes, tomato paste, beef stock → swap for a stock appropriate to turkey or keep a neutral vegetable/chicken stock, confirm at design time) with turkey mince replacing beef mince and its own macro profile — this is a genuinely different family (different protein), not a duplicate of family 23.

- [ ] **Step 2: Design Moderate first, then derive Light/Balanced**

Full macro table + self-review.

- [ ] **Step 3: Present the 3-variant design and pause for approval**

- [ ] **Step 4: Generate and run guarded INSERT SQL**

`meal_id = 3`. Standard insert shape. Write to `sql/turkey-bolognese.sql`.

- [ ] **Step 5: Verify**

Family-structure + recomputed-macro check, plus a duplicate-family sanity check confirming this is not flagged as a same-dish duplicate of family 23 (different `family_name`, different protein/macro profile).

---

## Phase 6 — Final verification

No production changes — only sanity-checks that the cumulative epic is internally consistent across all 17 dishes inserted in Phases 1-5.

### Task 19: Family-structure and macro-target sweep across every new family

- Skill: chef

- [ ] **Step 1: Run the family-structure check from `.claude/rules/recipe-variants.md` scoped to every family created in this epic**

Run:
```sql
SELECT rf.id, rf.family_name, COUNT(rfm.id) AS member_count,
       GROUP_CONCAT(rfm.variant_label ORDER BY rfm.display_order) AS labels,
       SUM(rfm.is_default) AS default_count
FROM recipe_families rf
LEFT JOIN recipe_family_members rfm ON rfm.family_id = rf.id
WHERE rf.id > 93
GROUP BY rf.id
HAVING member_count <> 3 OR labels <> 'Light,Moderate,Balanced' OR default_count <> 1;
```
Expected: zero rows. Any row returned is a structural defect in one of Tasks 4-18 — fix before proceeding.

- [ ] **Step 2: Recompute per-serving macros for every new/redesigned recipe and confirm targets**

For each recipe id inserted in Tasks 2-18 (plus 50/51/52 from Task 3), recompute per-serving P/C/F/kcal from `recipe_ingredients` (+ prorated `linked_recipe_id` contributions). Confirm protein ≥35g, fat 25-35% of kcal, carbs ≥38% of kcal on every meal-slot family member (the Granola Extras recipe from Task 2 is exempt — it's a component, not a meal). Confirm `Light.kcal < Moderate.kcal < Balanced.kcal` on every family.
Expected: zero reject-condition violations. Report any recipe that fails and route it back to its originating task for a fix before Step 3.

### Task 20: Dedup and linked-step coverage sweep

- Skill: chef

- [ ] **Step 1: Confirm no duplicate ingredients were introduced**

Run:
```sql
SELECT LOWER(REPLACE(REPLACE(name,'es',''),'s','')) AS root,
       GROUP_CONCAT(id), GROUP_CONCAT(name)
FROM ingredients
WHERE id > 179
GROUP BY root
HAVING COUNT(*) > 1;
```
Expected: zero rows (only 4 new ingredients from Task 1, all distinct roots — `turkey mince`, `cod`, `mackerel`, `coconut oil`).

- [ ] **Step 2: Confirm every `linked_recipe_id` row has a paired `recipe_steps` row**

Run the verify query from `.claude/rules/linked-recipe-extras.md`:
```sql
SELECT ri.recipe_id, r.name AS parent, lr.name AS linked
FROM recipe_ingredients ri
JOIN recipes r ON r.id = ri.recipe_id
JOIN recipes lr ON lr.id = ri.linked_recipe_id
WHERE ri.linked_recipe_id IS NOT NULL
  AND r.id > 212
  AND NOT EXISTS (
    SELECT 1 FROM recipe_steps rs
    WHERE rs.recipe_id = ri.recipe_id AND rs.linked_recipe_id = ri.linked_recipe_id
  );
```
Expected: zero rows. This covers the Yogurt Bowl → Granola link (Task 6) and any bread links in the egg families (Tasks 7-10).

- [ ] **Step 3: Confirm no raw ingredient inlines a sub-component that exists as its own recipe**

Run the verify query from `.claude/rules/homemade-first-and-ingredient-dedup.md` scoped to new recipes:
```sql
SELECT ri.recipe_id, r.name AS parent, i.name AS raw_ingredient
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
JOIN recipes r ON r.id = ri.recipe_id
WHERE ri.linked_recipe_id IS NULL
  AND r.id > 212
  AND i.name IN ('Pita Bread','Bread','Milk Bread','Pizza Dough','Tortilla','Wrap','Pesto','Pizza Sauce');
```
Expected: zero rows.

### Task 21: Idempotency re-run check

- Skill: chef

- [ ] **Step 1: Re-run every guarded INSERT script from Tasks 1-18 a second time**

For each `sql/*.sql` file in this plan folder, re-execute its `INSERT ... WHERE NOT EXISTS` and `recipe_steps` wipe-and-re-insert statements against the live DB.

- [ ] **Step 2: Confirm row counts are unchanged**

Run:
```sql
SELECT COUNT(*) FROM recipes WHERE id > 212;
SELECT COUNT(*) FROM ingredients WHERE id > 179;
SELECT COUNT(*) FROM recipe_families WHERE id > 93;
```
Expected: identical counts to the first run — proves every generated script in this epic is safely re-runnable, per `/chef` step 7a.

### Task 22: Write the PR / handoff description

- Skill: none — documentation summary, no code or schema governs this

**Files:**
- Create: `.claude/contract/MPP-4-recipe-variety-expansion/pr-description.md`

- [ ] **Step 1: Write the handoff summary**

Include: link to `plan.md`; the full list of 17 dishes inserted (1 Extras + 15 new families + 1 redesigned family) with their final approved names; confirmation that Phase 6's three verification tasks passed with zero violations; a note that this epic has no migration to apply (pure data, not schema) and no backend redeploy is required; and a one-line note that the `Turkey mince (2% fat)` naming convention (fat-% in parentheses) should be followed for any future turkey ingredient variants.

---

## Self-review

**Spec coverage:**
- Granola/Muesli Extras recipe (In scope) — Task 2.
- Greek Yogurt & Granola Bowl, linked (In scope) — Task 6.
- Scrambled Eggs & Toast redesign in place (In scope) — Task 3.
- New Porridge family (In scope) — Task 4.
- New Smoothie family (In scope) — Task 5.
- Poached/Boiled/Fried/Omelette egg families (In scope) — Tasks 7, 8, 9, 10.
- Two new Fish families, no shellfish (In scope) — Tasks 11, 12.
- Chicken Breast, fried-or-roasted only (In scope) — Task 13.
- Beef Meatballs, Beef Burger with store-bought patty (In scope) — Tasks 14, 15.
- Turkey Burger, Meatballs, Bolognese (In scope) — Tasks 16, 17, 18.
- New ingredients dedup-checked and created (In scope) — Task 1.
- Idempotent, guarded SQL for every insert (In scope) — every task's Step 4/insert step, verified in Task 21.
- Full verification per `/chef` step 8 and the shared rules (In scope) — Phase 6, Tasks 19-20.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, or "appropriate error handling" strings in this file. Every step names a concrete SQL query, a concrete ingredient/table/column, or an explicit "present and pause for approval" instruction — the only intentionally open items (exact ingredient gram weights, final dish names) are called out as `/chef` step-2/3 design work in `plan.md` → Assumptions, not left vague here.

**Type / name consistency:** `Turkey mince (2% fat)` is the single canonical name used across Tasks 1, 16, 17, 18 — no task introduces a variant spelling. `meal_id` values (1=Breakfast, 3=Dinner, 5=Extras) are used consistently with the live `meals` table confirmed in `plan.md`. `Beef Burger Patties` (id 95) is referenced identically in Task 15's Steps 1, 4, and 5 — no task confuses it with `Burger Patties` (id 43). The granola recipe id resolved in Task 6 Step 1 is referenced consistently through Task 6's remaining steps and re-verified in Task 20 Step 2.

**Phase boundary cleanliness:** Phase 1 ends with 4 new ingredient rows live and idempotency-proven, plus 1 granola recipe live with no dangling family — nothing downstream is blocked and nothing is half-inserted. Phase 2 ends with 6 independent breakfast families/redesign live, each independently verified — no cross-task state leaks into Phase 3. Phase 3 ends with 3 independent main-dish families live, each confirmed shellfish-free / technique-constrained. Phase 4 ends with 2 independent beef families live, the burger family confirmed on the correct store-bought ingredient id. Phase 5 ends with 3 independent turkey families live, all sharing the single Task-1 ingredient row with no duplicate turkey-mince rows created. Phase 6 makes no production changes — it only reads and re-runs already-applied scripts to prove the cumulative state is correct and stable.

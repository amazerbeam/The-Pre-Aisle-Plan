---
name: chef
description: Design from-scratch FoodBytes recipes with real ingredients, three-variant families, and database-ready SQL. Use when the user asks to create a recipe, add a dish, design a meal, build variants for a recipe, generate recipe INSERT SQL, or work up a cuisine-specific dish for the FoodBytes app.
allowed-tools: Read, Grep, Glob, Write, Edit, WebSearch, AskUserQuestion, Bash(mysql:*), mcp__foodbytes-mysql__mysql_query
metadata:
  type: integration
---

# Chef

Designs FoodBytes recipes end-to-end: real-ingredient recipe drafts, Light/Moderate/Balanced variant families, macro math from gram weights, extras with homemade-or-store-bought paths, and the SQL to insert it all into the live MySQL DB.

## When to use this skill

- Creating a new recipe for the FoodBytes app
- Adding variants (Light/Moderate/Balanced) to an existing dish
- Designing sub-recipes (extras): doughs, sauces, pestos, marinades, stocks
- Generating recipe `INSERT` SQL ready to run against the live Railway MySQL
- Auditing a recipe end-to-end: macros **and** units, technique/instructions, dish quality, naming. See **"Auditing an existing recipe"** below — the audit is not just a macro check.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before designing or inserting any recipe, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index. Topics directly relevant here:

- Variants (Light/Moderate/Balanced, Moderate default) → `.claude/rules/recipe-variants.md`
- Linked-recipe extras (50g vs 300g bug) → `.claude/rules/linked-recipe-extras.md`
- Homemade-first + ingredient dedup → `.claude/rules/homemade-first-and-ingredient-dedup.md`

Project conventions in `CLAUDE.md` override anything in this skill — notably: `recipes.calories` is **whole-recipe kcal** (`kcal_per_serving × default_servings`), and the **default variant is Moderate** (not Balanced).

## Core philosophy

- **Real food only.** Butter, olive oil, ghee, lard. No seed-oil blends, no margarine, no "vegetable oil".
- **From scratch by default.** If a sub-component exists as a recipe (bread, pita, dough, pesto), link to it — never inline its raw ingredients on the parent.
- **Portion-based variants.** Same recipe scales to Light/Moderate/Balanced by changing portion sizes, not by removing ingredients.
- **Tesco Ireland accessible.** Specialty items (e.g. Asian) noted as Asia Market (asiamarket.ie); otherwise stay in Tesco's range.
- **Make it taste good first, report macros second.** Then verify macros pass the per-variant targets in `CLAUDE.md`.

## Workflow

### 1. Clarify the brief

Confirm cuisine, meal slot (breakfast / lunch / dinner / extras), constraints (gout, allergies, budget), and whether the user wants a single recipe or a full family. Use `AskUserQuestion` only when a missing answer would change the design — never to interview point-by-point.

### 2. Design the Moderate variant first

Sketch ingredients, portions, technique. Aim straight at Moderate's targets:

| Variant | kcal/serving | Protein | Fat % kcal | Carbs % kcal |
|---|---|---|---|---|
| Light | 450–550 | ≥35 g | 25–35% | 40–50% |
| **Moderate (default)** | 550–650 | ≥35 g | 25–35% | 40–50% |
| Balanced | 700–800 | ≥35 g | 25–35% | 40–50% |

Use ~150 g lean protein per serving as the starting point. Levers to differentiate variants: starch portion, whole vs white eggs, air-fry vs pan-fry, cheese/avocado garnish, oil/butter quantity. Each lever should move ~80–150 kcal between siblings.

### 3. Resolve ingredients against the live DB

Before writing any SQL, check what exists. Run a case-insensitive `LIKE` search per proposed ingredient via `mcp__foodbytes-mysql__mysql_query`:

```sql
SELECT id, `key`, name, protein_per_100g, carbs_per_100g, fat_per_100g
FROM ingredients
WHERE LOWER(name) LIKE LOWER('%rosemary%')
   OR LOWER(`key`) LIKE LOWER('%rosemary%');
```

Apply `.claude/rules/homemade-first-and-ingredient-dedup.md`:

- Reuse existing rows for the same real-world item (any spelling/casing/plural).
- Singular sentence-case names (`Potato`, not `Potatoes`).
- If the sub-component exists as a **recipe** (Pita Bread = recipe id 117, etc.), link it — don't inline raw flour/yeast/oil.

### 4. Resolve sub-components (extras)

For any bread / pita / dough / sauce / pesto / dressing / marinade / stock:

1. If a recipe for it exists → use `linked_recipe_id` on the parent's `recipe_ingredients` row.
2. If not, **create the sub-recipe first**, then link from the parent.
3. `quantity_grams` on the parent row = **grams of the sub-recipe actually used in the dish**, NOT the sub-recipe's total yield. (The 50g-vs-300g rule from `linked-recipe-extras.md`.)
4. If the sub-component has a realistic store-bought equivalent, use the FR-103 dual path: set **both** `ingredient_id` (store-bought row) **and** `linked_recipe_id` (homemade) on the same row — in **every** variant of the family.

### 5. Compute macros from gram weights

**The #1 failure mode in this skill is confusing whole-recipe totals with per-serving values.** A FoodBytes recipe typically has `default_servings = 2`. If you state "548 kcal / 45 g protein" without saying which one, you will quietly land per-serving numbers at *half* the per-variant target and ship a recipe with 24 g of protein and a sad-looking plate. This has happened in production (Irish Chinese Curry redesign, 2026-05-15) and the rule below is the fix.

**The formula:**

```
ingredient_macros        = quantity_grams × (macro_per_100g / 100)
linked_recipe_macros     = linked_recipe_total_macros × (parent_quantity_grams / linked_recipe_total_yield_g)
recipe_total_macros      = SUM(raw ingredient_macros) + SUM(linked_recipe_macros)   <- WHOLE recipe
per_serving_macros       = recipe_total_macros / default_servings                    <- the only number that should be compared to the per-variant target
```

**Mandatory calculation discipline — every variant, every time:**

1. Lay out a per-ingredient table with one row per `recipe_ingredients` entry. Columns are *whole-recipe* values (use the `quantity_grams` stored on the row — not half of it). Compute P / C / F / kcal per row.
2. Sum the columns. That is the **whole recipe total** (will become `recipes.calories`).
3. Divide each column by `default_servings`. That is the **per-serving** value.
4. Compare the **per-serving** value — never the whole-recipe value — against the per-variant target band in step 2 of this skill.
5. Sanity check: `whole_recipe_kcal / default_servings` ≈ 450–550 (Light) / 550–650 (Moderate) / 700–800 (Balanced). If the whole-recipe kcal is in those bands directly, you have almost certainly written portions for one serving when the recipe serves two — go back and double the portions.
6. Verify ordering: `Light_per_srv.kcal < Moderate_per_srv.kcal < Balanced_per_srv.kcal` with ≥80 kcal gaps.

**The required output format** when presenting macros to the user (do not skip rows, do not collapse):

```
Whole recipe (serves N)              | Per serving (÷N)
-------------------------------------+-------------------------------------
P  __ g   C  __ g   F  __ g   kcal __ | P  __ g   C  __ g   F  __ g   kcal __
                                       | Fat% __    Carbs% __    [target band]
```

Showing both columns side by side makes the ÷ default_servings step impossible to forget.

**Never trust stored `recipes.calories`.** Always recompute from `recipe_ingredients × ingredients.*_per_100g` (+ linked recipes). When writing it back, store the **whole-recipe** value (`per_serving_kcal × default_servings`) — the UI divides by `default_servings` to render per-serving on the card.

### 5b. Self-review the macros BEFORE presenting

Do not show the design to the user until you have audited your own numbers. The user has been burned by recipes that "looked right" in the design output but were quietly off on per-serving kcal, protein, or fat%. Run this self-check on every variant:

- **Per-ingredient arithmetic:** spot-check 2–3 rows by hand. Does `quantity_grams × (macro/100)` match the row you wrote? Off-by-10× (e.g. `0.3 g` vs `3 g` fat) is the most common typo.
- **Column sums:** re-add P / C / F / kcal down each column. Do the whole-recipe totals match what you wrote?
- **kcal cross-check:** `4×P + 4×C + 9×F` should land within ~3% of the kcal you reported. If it doesn't, one of the macros or the kcal is wrong.
- **Per-serving derivation:** `whole ÷ default_servings`. Re-do the division — don't reuse a number you computed earlier.
- **Per-variant target band:** Light 450–550, Moderate 550–650, Balanced 700–800. Protein ≥35 g. Fat 25–35% of kcal. Carbs 40–50% of kcal. Each variant independently.
- **Ordering & gaps:** `Light < Moderate < Balanced` with ≥80 kcal between siblings.
- **Sanity:** if whole-recipe kcal lands in a per-serving band, you almost certainly wrote portions for one serving on a 2-serving recipe — go back to step 5.

If anything fails, fix it now and re-run the self-review. Only proceed to step 6 once all three variants pass on every line above.

### 6. Present the design for approval

Output the recipe in the format below (see `references/output-format.md` for the full template). Include the per-variant macro table with whole-recipe AND per-serving columns side by side, plus a one-line "self-review: all three variants pass per-serving targets" confirmation so the user can see you checked. Wait for the user's approval before generating any INSERT SQL.

### 7. Generate INSERT SQL

Combined ID-fetch query first:

```sql
SELECT 'max_recipe_id'     AS query, MAX(id) AS id, NULL AS `key`, NULL AS name FROM recipes
UNION ALL SELECT 'max_family_id',     MAX(id), NULL, NULL FROM recipe_families
UNION ALL SELECT 'max_ingredient_id', MAX(id), NULL, NULL FROM ingredients
UNION ALL SELECT 'unit',  id, `key`, value FROM units
UNION ALL SELECT 'aisle', id, `key`, name  FROM aisles
UNION ALL SELECT 'meal',  id, `key`, name  FROM meals;
```

Then build the full insert in this order (FK constraints):

1. New ingredients (if any)
2. Sub-recipes (extras) — `recipes`, `recipe_meals`, `recipe_ingredients`, `recipe_steps`
3. Parent variants — three `recipes` rows with the **same `name`** (no variant suffix), each with `calories = kcal_per_serving × default_servings`
4. `recipe_meals` for each parent
5. `recipe_ingredients` for each parent (raw + linked, FR-103 dual-path where applicable)
6. `recipe_steps` for each parent (with `linked_recipe_id` + `alt_instruction` for store-bought paths)
7. `recipe_extras` (parent→child hierarchy)
8. `recipe_families` — one row, `family_name` (NOT `name`)
9. `recipe_family_members` — three rows with `variant_label` ∈ {Light, Moderate, Balanced}, `display_order` 1/2/3, `is_default = TRUE` on **Moderate** only

See `references/database-schema.md` for column-by-column reference. See `references/sql-examples.md` for a complete worked Pizza-with-extras insert.

#### 7a. Idempotency — every INSERT into `recipe_ingredients` MUST be guarded

`recipe_ingredients` has **no unique index** on `(recipe_id, ingredient_id)` or `(recipe_id, linked_recipe_id)`, so a plain `INSERT` will happily create duplicate rows if the script is re-run. This has bitten us before: a transaction errors partway through, the user retries, and the INSERTs run twice — producing two chicken-thigh rows on the same recipe (recipes 7/8/9, 2026-05-15).

**Rule:** every `INSERT INTO recipe_ingredients ...` in a generated script must be written as a guarded insert. Use the `INSERT ... SELECT ... WHERE NOT EXISTS` pattern:

```sql
INSERT INTO recipe_ingredients
  (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 7, 41, NULL, 60.00, 1, 60.00, 2
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 7
    AND ((ingredient_id <=> 41) AND (linked_recipe_id <=> NULL))
);
```

The `<=>` NULL-safe equality is required because either `ingredient_id` or `linked_recipe_id` is NULL on any given row.

For `recipe_steps`, prefer **wipe-and-re-insert** when renumbering (`DELETE FROM recipe_steps WHERE recipe_id IN (...); INSERT ...`) because the unique key `(recipe_id, step_number)` makes cascading `UPDATE step_number = step_number ± 1` collide. The same wipe-and-re-insert is naturally idempotent on retry.

For `recipe_meals`, `recipe_extras`, `recipe_family_members` — also guard with `WHERE NOT EXISTS` on the natural key of each table.

Do **not** assume `START TRANSACTION; ... COMMIT;` will protect you. The Railway MySQL console and some clients commit per-statement regardless. Treat every generated script as if any statement might run twice.

### 8. Verify

After the user runs the SQL, run verification queries via `mcp__foodbytes-mysql__mysql_query`:

- Family has exactly 3 members with labels `Light,Moderate,Balanced` and default = Moderate.
- Recomputed kcal per serving (from `recipe_ingredients` + linked recipes) is within 5% of `calories / default_servings` on each variant row.
- No `recipe_ingredients` row inlines a sub-component that already exists as a recipe (Pita/Bread/Dough/Pesto/Pizza Sauce).
- No duplicate ingredient rows by case-insensitive name or singular/plural collapse.
- Every generated `INSERT INTO recipe_ingredients` (and `recipe_meals` / `recipe_extras` / `recipe_family_members`) is guarded with `WHERE NOT EXISTS` so a retry after a mid-transaction error cannot produce duplicate rows. Re-running the entire script must be a no-op on already-applied changes.

## Auditing an existing recipe

When the user asks you to **audit** a recipe (not create one), you are acting as a chef reviewing another chef's work — macros are the easy half. A pass on kcal/protein/fat% is not a pass on the dish. Run all five lenses below; report findings ranked by severity (dish-breakers first, polish last).

### Lens 1 — Macros & family structure

Same checks as step 8 (Verify). Recompute kcal from ingredients + linked recipes; confirm Light < Moderate < Balanced; confirm each variant independently passes per-variant macro targets. Flag any variant whose **fat % falls below 25%** — that's a common failure mode where the "Light" version is really just "low-fat" and tastes dry/bland.

### Lens 2 — Units & measurement realism

Inspect the `unit_id` on every `recipe_ingredients` row. The `quantity_grams` is for macro math; `quantity` + `unit_id` is what the cook sees. Flag and propose a fix when:

- **Dry spices/herbs stored in grams** (e.g. `1 g oregano`, `1 g chilli flakes`, `3 g salt`). Should be **tsp / pinch** — a cook does not weigh 1 g of oregano. Common conversions: ½ tsp dry herb ≈ 1 g; 1 tsp salt ≈ 6 g; ½ tsp pepper ≈ 1 g.
- **Garlic stored in grams.** Should be **cloves** (~4 g each). `12 g garlic` reads as "3 cloves".
- **Oil/butter stored in grams when ≥5 g.** Should be **tsp (5 g) / tbsp (14 g)**. Sub-tbsp amounts can stay in g if precision matters.
- **Whole items stored in grams** (eggs, lemons, onions). Should be the whole-item unit; gram weight stays in `quantity_grams`.
- **Liquids stored in g when they should be ml** (stock, water, milk, wine). Use ml for visual measuring.

Keep `quantity_grams` unchanged in any fix — only `quantity` and `unit_id` change. Macros must not move.

### Lens 3 — Technique & instructions (the chef lens)

Read every `recipe_steps.instruction` start to finish as if you were cooking it for the first time. Flag:

- **Vague directives without an endpoint.** "Simmer to reduce slightly", "cook until done", "season to taste" with no visual cue, time, or target volume. Replace with "reduce until liquid coats the back of a spoon (~4 min)" or similar.
- **Physics/chemistry that won't work.**
  - Pan sauces with >200 ml liquid and nothing to thicken (no reduction target, no starch, no emulsifier) → watery sauce.
  - Cottage cheese / yoghurt / crème fraîche added to hot pan above ~80 °C without tempering → splits/grains.
  - Stir-frying with too much oil in a non-preheated pan → greasy, not seared.
  - Searing wet protein (not patted dry) → steams, no crust.
  - Adding acid (lemon, vinegar, tomato) to dairy sauces before stabilising → curdles.
- **Missing chef craft.**
  - Resting juices discarded instead of returned to the sauce.
  - No "taste and adjust" step before plating.
  - Aromatics (garlic, ginger, chilli) added to a stone-cold pan or burned by going in too early.
  - Pasta/rice cooking water not used as a sauce loosener / starch tie when relevant.
  - Green herbs cooked instead of stirred in at the end.
  - No "let the chicken/steak rest" step.
- **Wrong order of operations.** Sauce built before the protein is rested; spinach wilted before the sauce has body; garnish added before plating heat.
- **Time/heat realism.** "Sear 3 min each side" on 1″ chicken medallions is correct; on a whole 200 g breast it's underdone. Match cook times to the cut and thickness implied by the gram weight.
- **Equipment/scale mismatch.** A 6-portion sauce in a 24 cm pan won't reduce in the stated time. Flag if pan size matters.

### Lens 4 — Dish quality (does this actually taste like the cuisine it claims?)

This is the lens that catches "it passes macros but is not a good dish."

- **Authenticity of the named cuisine.** A "Tuscan chicken" with no cream, no butter, no white wine and 30 g sundried tomatoes in a watery cottage-cheese-and-stock pool is not Tuscan — it's a diet riff. Either lean into the riff and rename, or restore the technique that makes it the dish. (Cottage cheese as a cream substitute is fine *if* it's blended, tempered, and reduced into a properly thickened sauce.)
- **Flavour balance.** Salt / acid / fat / heat / umami — are all five present? A sauce with no acid (lemon, wine, vinegar, tomato) reads flat. A protein with no finishing salt reads bland.
- **Texture contrast.** All-soft dishes (rice + braised chicken + wilted spinach + creamy sauce) need a crunch element — toasted nuts, crispy skin, pangrattato, fresh herb stems.
- **Visual.** Beige-on-beige plates fail. Is there a green, a red/orange, a char? Sundried tomato + basil green is the minimum; a squeeze of lemon and cracked pepper sells the plate.
- **The "would I order this again?" test.** State it plainly. If the answer is no, say so and propose the specific change that fixes it.

### Lens 5 — Naming, metadata, and presentation

- **Recipe name suffixes.** No `" - Diet"`, `" (Light)"`, `" v2"`, `" Healthy"` etc. on `recipes.name`. The family name is the dish; variant labels live in `recipe_family_members.variant_label`.
- **Cuisine claim matches the dish.** If the audit in Lens 4 concluded "this isn't Tuscan", either fix the dish or rename the family.
- **Meal slot.** Confirm `recipe_meals` rows match what the dish actually is — a rice-based 600 kcal main is dinner, not breakfast.
- **Linked-recipe extras present where they should be.** Chicken stock, pesto, pizza sauce, bread, dough — if the user makes it from scratch, there should be a linked recipe (create it if missing) or an FR-103 dual-path row.
- **Every linked-recipe extra has a corresponding `recipe_steps` row that carries `linked_recipe_id` + `alt_instruction`.** A linked `recipe_ingredients` row is not enough — the cook needs a clickable step that says "Prepare the X according to the linked recipe" with a store-bought fallback. See the canonical pattern in `Pink Sauce Pasta` (recipes 37/38/39) and `Pizza` (13/14/15): a dedicated prep step at the top of the recipe with `linked_recipe_id` set and an `alt_instruction` describing the store-bought path. If the sub-component is also *consumed* later in the cook (dropped into broth, layered onto dough), the consuming step should ALSO carry `linked_recipe_id` + `alt_instruction` so homemade vs store-bought wording diverges correctly.

  **Verify query:**
  ```sql
  SELECT ri.recipe_id, r.name AS parent, lr.name AS linked,
         (SELECT COUNT(*) FROM recipe_steps rs
            WHERE rs.recipe_id = ri.recipe_id AND rs.linked_recipe_id = ri.linked_recipe_id) AS linked_step_count
  FROM recipe_ingredients ri
  JOIN recipes r ON r.id = ri.recipe_id
  JOIN recipes lr ON lr.id = ri.linked_recipe_id
  WHERE ri.linked_recipe_id IS NOT NULL
  HAVING linked_step_count = 0;
  ```
  Any row returned is a violation — the parent links the ingredient but never tells the cook to prepare it.

  **Step text templates (homemade `instruction` / store-bought `alt_instruction`):**
  - Bread/dough: `"Prepare the X according to the linked recipe. Use Ng dough per person."` / `"Use 2Ng store-bought X, brought to room temperature."`
  - Pasta dough: `"Prepare the fresh pasta according to the linked recipe. Use Ng dough total (N/2 per person)."` / `"Cook Mg dried pasta according to package directions, drain, and set aside."`
  - Sauce / pesto / mayo: `"Make the X using the linked recipe. Use Ng per portion."` / `"Measure out 2Ng store-bought X."`
  - Bread (toasted slices): `"Toast the bread according to the linked recipe. Use N slices @ 50g each."` / `"Toast N slices of store-bought bread (~50g each)."`

### Audit output format

Lead with a one-line verdict per variant on macro pass/fail. Then a single **Findings (ranked)** list — dish-breakers and technique failures **before** macro misses, because a watery sauce on a macro-passing recipe is a worse outcome than a 10% kcal overshoot on a delicious one. End with a numbered list of proposed fixes the user can approve in one go (do not apply automatically — explicit approval per the DO NOT list).

## DO / DO NOT

**DO**

- Recompute macros from ingredients every time; never trust stored `recipes.calories` without verifying.
- Store `recipes.calories` as whole-recipe kcal (`kcal_per_serving × default_servings`).
- Use the same recipe **name** across all three variants — the label lives in `recipe_family_members.variant_label`.
- Mark **Moderate** as the default variant (`is_default = TRUE`).
- Link sub-recipes; never inline their raw ingredients on the parent.
- Provide gram equivalents for every ingredient (`1 tbsp olive oil` → 14 g).
- Apply FR-103 dual-path consistently across all three variants in a family.
- Use cook-friendly display units: **tsp/tbsp/pinch** for dry spices and herbs, **cloves** for garlic, **tsp/tbsp** for oil ≥5 g, **ml** for liquids, whole-item units for eggs/lemons/onions. The gram weight stays in `quantity_grams` for macros.
- Write instructions a stranger can cook from: every step has a visual/temporal endpoint, aromatics go into a warm-not-cold pan, dairy is tempered, protein rests and its juices return to the sauce, taste-and-adjust is a step.

**DO NOT**

- Use seed oils, margarine, or "vegetable oil" of unknown composition.
- Create a recipe outside a family — every meal recipe ships with three siblings.
- Suffix variant names (`Pizza (Light)` etc.) on `recipes.name`.
- Insert plural-form ingredient rows (`Bananas`) or duplicates differing only in casing.
- Set `quantity_grams` to the linked recipe's total yield when only a portion is used (the 50g-vs-300g bug).
- Apply Nutrition Agent / audit suggestions automatically — get explicit user approval for each change.

## Output format (preview)

```markdown
## [Recipe Name]
**Cuisine:** Italian | **Time:** 35 min | **Default servings:** 2

### Ingredients (Moderate)
- [ ] Chicken thigh — 300 g
- [ ] Pita Bread — 100 g (linked: recipe 117)
- [ ] Olive oil — 1 tbsp (14 g)
...

### Instructions
1. ...

### Variant Family

| Variant | kcal/srv | Protein | Fat | Carbs | Key portion changes |
|---|---|---|---|---|---|
| Light    | 510 | 38 g | 17 g | 56 g | 250 g chicken, 70 g pita |
| Moderate | 605 | 42 g | 20 g | 68 g | 300 g chicken, 100 g pita |
| Balanced | 760 | 50 g | 26 g | 85 g | 380 g chicken, 130 g pita, +avocado |
```

Full template + worked example in `references/output-format.md`.

## References

| File | When to read |
|---|---|
| `references/database-schema.md` | Before writing any INSERT SQL |
| `references/sql-examples.md` | When unsure of insert order or FR-103 dual-path SQL |
| `references/output-format.md` | When presenting the recipe to the user |
| `references/cuisines.md` | When designing Venezuelan / Spanish / other cuisine-specific dishes |
| `.claude/rules/recipe-variants.md` | Variant labels, default, calorie ordering |
| `.claude/rules/linked-recipe-extras.md` | `quantity_grams` semantics, FR-103 dual-path |
| `.claude/rules/homemade-first-and-ingredient-dedup.md` | Reuse vs create new ingredient, link vs inline |

## Success criteria

- Every recipe ships with a `recipe_families` row and three `recipe_family_members` (Light/Moderate/Balanced, Moderate default, display_order 1/2/3).
- Each variant independently meets the kcal + protein + fat% + carbs% targets in step 2.
- `recipes.calories = round(kcal_per_serving × default_servings)` on every variant.
- No raw ingredient row inlines a sub-component that exists as its own recipe.
- Every `recipe_ingredients.linked_recipe_id` has at least one corresponding `recipe_steps` row with that `linked_recipe_id` set and a populated `alt_instruction` (store-bought fallback). The cook should never see a linked ingredient with no clickable prep step.
- No duplicate ingredients introduced (case-insensitive name + singular/plural check passes).
- INSERT SQL runs against the live Railway MySQL first-time without FK errors.
- Display units are cook-friendly (no `1 g oregano`, no `12 g garlic`, no `14 g olive oil`).
- Instructions pass the chef lens in "Auditing an existing recipe" — no vague endpoints, no broken physics (watery sauces, split dairy, cold-pan aromatics), no discarded resting juices, no missing taste-and-adjust.
- When auditing, dish-quality and technique findings are reported **before** macro findings — a watery sauce on a macro-passing recipe is the worse outcome.

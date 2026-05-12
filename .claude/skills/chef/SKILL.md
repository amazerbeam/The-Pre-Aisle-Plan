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
- Auditing or fixing a recipe's macros, ingredients, or family

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

For each variant:

```
ingredient_macros   = quantity_grams × (macro_per_100g / 100)
linked_recipe_macros = linked_recipe_total_macros × (parent_quantity_grams / linked_recipe_total_yield_g)
recipe_total_macros  = SUM(raw ingredient_macros) + SUM(linked_recipe_macros)
per_serving_macros   = recipe_total_macros / default_servings
```

Confirm each variant independently hits the per-variant targets in step 2. Confirm `Light.kcal < Moderate.kcal < Balanced.kcal` with ≥100 kcal gaps. Recompute — never trust a stored `recipes.calories` value.

### 6. Present the design for approval

Output the recipe in the format below (see `references/output-format.md` for the full template). Wait for the user's approval before generating any INSERT SQL.

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

### 8. Verify

After the user runs the SQL, run verification queries via `mcp__foodbytes-mysql__mysql_query`:

- Family has exactly 3 members with labels `Light,Moderate,Balanced` and default = Moderate.
- Recomputed kcal per serving (from `recipe_ingredients` + linked recipes) is within 5% of `calories / default_servings` on each variant row.
- No `recipe_ingredients` row inlines a sub-component that already exists as a recipe (Pita/Bread/Dough/Pesto/Pizza Sauce).
- No duplicate ingredient rows by case-insensitive name or singular/plural collapse.

## DO / DO NOT

**DO**

- Recompute macros from ingredients every time; never trust stored `recipes.calories` without verifying.
- Store `recipes.calories` as whole-recipe kcal (`kcal_per_serving × default_servings`).
- Use the same recipe **name** across all three variants — the label lives in `recipe_family_members.variant_label`.
- Mark **Moderate** as the default variant (`is_default = TRUE`).
- Link sub-recipes; never inline their raw ingredients on the parent.
- Provide gram equivalents for every ingredient (`1 tbsp olive oil` → 14 g).
- Apply FR-103 dual-path consistently across all three variants in a family.

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
- No duplicate ingredients introduced (case-insensitive name + singular/plural check passes).
- INSERT SQL runs against the live Railway MySQL first-time without FK errors.

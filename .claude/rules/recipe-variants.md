# Rule: Every recipe must have three variants (Light / Moderate / Balanced)

Every meal recipe in FoodBytes must belong to a `recipe_family` with **three sibling variants**: **Light**, **Moderate**, and **Balanced**. This gives the user a lower-calorie and a higher-calorie option around a default.

## What the rule is

For every dish, a `recipe_families` row exists, and `recipe_family_members` contains exactly three rows pointing at three sibling recipes:

| `variant_label` | Role | `is_default` | Calorie position |
|---|---|---|---|
| `Light` | Lower-calorie option (lean protein, less fat/starch) | 0 | **lowest** of the three |
| `Moderate` | **Default** — the everyday version | **1** | middle |
| `Balanced` | Higher-calorie / more indulgent option | 0 | **highest** of the three |

`display_order` is `1 = Light`, `2 = Moderate`, `3 = Balanced`.

The per-serving kcal for the three siblings must satisfy `Light.kcal < Moderate.kcal < Balanced.kcal`, and each variant must independently meet the per-variant macro targets in `CLAUDE.md` ("Recipe creation — non-negotiable targets").

> Note: this overrides the prior behavior where `Balanced` was the default. New and existing families must use **Moderate** as the default.

## Why it exists

- Users want a lower-calorie ("Light") and a higher-calorie ("Balanced") option without losing the standard recipe. Forcing one variant per dish removes that choice; only the variant dropdown surfaces it.
- The variant dropdown in the UI **only renders when the family has ≥2 members** (`RecipeFamilyService.getVariantsForRecipe` returns empty for solo families). Families of one are invisible — defeating the purpose of the family.
- Defaulting to **Moderate** means the typical user lands on a balanced everyday portion, with Light/Balanced as deliberate up/down choices on either side.

## When to enforce

Apply this rule whenever you:
- Create a new recipe (must ship with all three siblings + a family).
- Edit a recipe that currently has no family or a family of one.
- Audit recipes for variant coverage.
- Seed/migrate recipe data.
- Review recipe families with duplicate names or mismatched defaults.

## How to verify

1. **Family exists and has exactly 3 members:**
   ```sql
   SELECT rf.id, rf.family_name, COUNT(rfm.id) AS member_count
   FROM recipe_families rf
   LEFT JOIN recipe_family_members rfm ON rfm.family_id = rf.id
   GROUP BY rf.id
   HAVING member_count <> 3;
   ```
   Any row returned is a violation.

2. **Variant labels are exactly Light/Moderate/Balanced** with `display_order` 1/2/3:
   ```sql
   SELECT family_id,
          GROUP_CONCAT(variant_label ORDER BY display_order) AS labels
   FROM recipe_family_members
   GROUP BY family_id
   HAVING labels <> 'Light,Moderate,Balanced';
   ```

3. **Default is Moderate** (and exactly one):
   ```sql
   SELECT family_id, SUM(is_default) AS default_count,
          MAX(CASE WHEN is_default = 1 THEN variant_label END) AS default_label
   FROM recipe_family_members
   GROUP BY family_id
   HAVING default_count <> 1 OR default_label <> 'Moderate';
   ```

4. **Calorie ordering holds:** `Light.kcal_per_serving < Moderate.kcal_per_serving < Balanced.kcal_per_serving`. Recompute kcal from ingredients + linked recipes (don't trust stored `recipes.calories`; see `linked-recipe-extras.md`).

5. **Each variant independently passes per-variant macro targets** from `CLAUDE.md`:
   - Light: 450–550 kcal, ≥35 g protein, fat 25–35%, carbs 40–50%
   - Moderate: 550–650 kcal, ≥35 g protein, fat 25–35%, carbs 40–50%
   - Balanced: 700–800 kcal, ≥35 g protein, fat 25–35%, carbs 40–50%

6. **No duplicate families:** family names should be unique (case-insensitive). Two families with the same name covering the same dish is a data bug — merge them.

## Reject conditions (block the recipe)

- Recipe has no family, or family has fewer than 3 members.
- Variant labels are not exactly `Light` / `Moderate` / `Balanced`.
- `is_default = 1` is on Light or Balanced (must be Moderate), or zero/multiple defaults.
- Calorie ordering is wrong (e.g., Light ≥ Moderate, or Balanced ≤ Moderate).
- Two of the three siblings are identical (Light differs from Moderate only in label, etc.) — variants must be genuinely lower- and higher-calorie than the default.
- Two recipe families exist for the same dish.

## Common levers to differentiate variants

(Same levers as in `CLAUDE.md`; apply asymmetrically across siblings.)

- **Light**: smaller starch portion (or omit), egg whites instead of whole eggs, air-fry, leaner protein cut, less oil/butter, skip cheese garnish.
- **Moderate** (default): the everyday recipe — standard portion of starch, normal protein cut, sensible fat.
- **Balanced**: larger starch portion, whole eggs / extra egg, added cheese or avocado, slightly more oil/butter, optional indulgent garnish.

Each lever should change kcal meaningfully (~80–150 kcal step between siblings) while keeping protein ≥35 g and macro split inside the per-variant targets.

## Store-bought option (FR-103) — orthogonal to the three variants

Light / Moderate / Balanced is **not** the place to model "homemade vs store-bought". Store-bought is a per-ingredient swap, not a fourth sibling.

For any sub-component that can be either made or bought (bread, pita, dough, pesto, pizza sauce, stock), the corresponding `recipe_ingredients` row should carry **both** `ingredient_id` AND `linked_recipe_id` (FR-103 dual-path). This must be done **inside each of the three variants** — Light, Moderate, and Balanced all get the same store-bought toggle on the same component row.

- Homemade path (default): macros = linked recipe macros prorated by `quantity_grams`. See `linked-recipe-extras.md`.
- Store-bought path: macros = the raw ingredient's per-100g × `quantity_grams`.

Defaulting behaviour: per the `homemade-first-and-ingredient-dedup.md` rule, the **homemade path is preferred** — the link must always exist; the raw ingredient is the optional store-bought fallback. A row with only `ingredient_id` set (and no `linked_recipe_id`) when a sub-recipe exists is still a violation.

### Verify — every variant in a family offers the same store-bought options

If one variant has an FR-103 dual-path row for "Pita Bread", the other two variants must too. Mismatch = bug.

```sql
SELECT rfm.family_id,
       lr.name AS sub_component,
       GROUP_CONCAT(DISTINCT rfm.variant_label ORDER BY rfm.display_order) AS variants_with_dual_path,
       COUNT(DISTINCT rfm.variant_label) AS dual_path_variant_count
FROM recipe_family_members rfm
JOIN recipe_ingredients ri ON ri.recipe_id = rfm.recipe_id
JOIN recipes lr ON lr.id = ri.linked_recipe_id
WHERE ri.ingredient_id IS NOT NULL AND ri.linked_recipe_id IS NOT NULL
GROUP BY rfm.family_id, lr.name
HAVING dual_path_variant_count <> 3;
```

Any row returned = a family where the store-bought option exists in some variants but not others — fix by adding the missing dual-path rows.

### Reject conditions (additional)

- A sub-recipe exists for a component, the parent variant uses it, but only `linked_recipe_id` is set with no store-bought ingredient counterpart **and** the user expects a store-bought option to be available. (Acceptable if the component has no realistic store-bought equivalent — e.g. a custom spice blend.)
- One variant in a family has the FR-103 dual-path row for a component; its siblings do not.
- Store-bought path's per-serving kcal diverges from the homemade path by >10% on the same row (data bug — usually wrong `quantity_grams` or wrong per-100g macros on the raw ingredient).

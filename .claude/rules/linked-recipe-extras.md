# Rule: Linked-recipe extras (sub-components must link, not duplicate)

When a recipe contains a sub-component that already exists as its own recipe in the database (bread, pita, dough, sauce, dressing, marinade, spice blend, stock), that sub-component **must** be stored as a linked-recipe row — not re-typed as raw ingredients on the parent.

## Schema (authoritative)

`recipe_ingredients` columns relevant to this rule:

| Column | For raw ingredient | For linked recipe |
|---|---|---|
| `ingredient_id` | set | NULL (or set if FR-103 store-bought option exists) |
| `linked_recipe_id` | NULL | set → child recipe id |
| `quantity` / `unit_id` | display amount (e.g. `50 g`, `2 tbsp`) | display amount of the linked recipe used |
| `quantity_grams` | gram weight of the raw ingredient | **grams of the linked recipe consumed by this dish** (NOT the linked recipe's total yield) |

## The 50g vs 300g case

Example — *Greek Chicken Pita Bowl* uses pita; *Pita Bread* is its own recipe.

Pita Bread recipe (sums to 300g total yield):
```
300 g  bread flour
2 tbsp olive oil
1 tsp  dry yeast
1 tsp  sugar
…
```

Pita Bowl uses **50 g** of pita. The correct row on the bowl is:

```sql
INSERT INTO recipe_ingredients
  (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
VALUES
  (<bowl_id>, NULL, <pita_id>, 50, <unit_g>, 50, <n>);
```

`quantity_grams = 50`, **not 300**. The macro service computes:
```
portionRatio = 50 / 300        = 0.1667
pita_kcal_used = pita_total_kcal * 0.1667
```

If you instead inline `50g bread flour` + `0.33 tbsp olive oil` + … on the bowl, you (a) duplicate data, (b) drift from the canonical pita recipe over time, and (c) double-count if anyone later adds the link.

## When to enforce

Apply this rule whenever:
- Creating or reviewing a recipe that mentions bread / pita / wrap / tortilla / dough / pizza base / sauce / dressing / marinade / pesto / spice rub / stock — and a recipe for that component exists.
- Auditing macros: if a parent recipe lists raw flour + yeast + oil that together form a known sub-recipe, flag it as a missed link.
- Seeding migrations: every sub-component reused across ≥2 dishes should be its own recipe and linked.

## How to verify

1. **Sub-component exists as a recipe?** Search `recipes.name` for it. If yes → must link.
2. **`quantity_grams` matches the portion used, not the linked recipe's total yield?**
   - Compute `linked_total_yield = SUM(quantity_grams) FROM recipe_ingredients WHERE recipe_id = <linked_id>`.
   - The parent's `quantity_grams` for that row must be **≤ linked_total_yield** and reflect the cooked/used portion.
3. **Macros recompute correctly?** Run the parent through `MacroCalculationService.calculatePerServingMacros` — kcal/protein/carbs/fat must reflect the prorated linked contribution, not the linked recipe's full macros.
4. **No double-counting:** if a linked row exists, the parent must NOT also list the linked recipe's raw ingredients separately.

## Edge cases

- **FR-103 store-bought option:** both `ingredient_id` and `linked_recipe_id` may be set. Homemade path uses linked-recipe macros (prorated by `quantity_grams`); store-bought path uses the raw ingredient's per-100g macros × `quantity_grams`. Both paths must yield comparable kcal — flag if they diverge >10%.
- **Linked recipe with 0 yield:** `MacroCalculationService` returns 0 macros and logs a warning. This is a data bug — fix the linked recipe's `quantity_grams` rather than working around it.
- **Circular references:** the service guards via `visitedRecipeIds`. Don't rely on it — don't create cycles.

## Reject conditions (block the recipe)

- Sub-component recipe exists but the parent inlines its raw ingredients instead of linking.
- `linked_recipe_id` set but `quantity_grams` equals the linked recipe's total yield when only a portion is used (classic 300g-instead-of-50g bug).
- Stored `recipes.calories` on the parent disagrees with the recomputed (raw + linked-prorated) total by >5%.

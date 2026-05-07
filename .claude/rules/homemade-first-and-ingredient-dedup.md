# Rule: Prefer homemade-link over raw ingredient, and dedupe ingredients before insert

Two related constraints that protect the integrity of recipe data:

1. **Homemade-first** — if a sub-component (bread, pita, dough, sauce, dressing, marinade, stock, spice blend) exists as its own recipe, the parent recipe **must** link to that recipe instead of consuming a raw "Bread" / "Pita" / "Dough" ingredient row.
2. **Ingredient dedup** — before inserting any new row into `ingredients`, search the existing table for the same item under any common spelling/casing/plural. Reuse the existing row; never create a parallel duplicate.

## Why it exists

- The user's preference is **make it, don't buy it**. A raw "Pita Bread" ingredient row models a store-bought shortcut; a `linked_recipe_id` to the Pita Bread recipe models the homemade reality. Defaulting to the raw ingredient hides the homemade path from the UI and from macro calculations.
- Macros for a homemade sub-component come from `MacroCalculationService` walking the linked recipe's ingredients (and their linked recipes). A raw "Bread" ingredient bypasses that — its per-100g macros are a single static row that drifts from the actual bread the user makes.
- Duplicate ingredients (e.g. `Potato` #121 vs `Potatoes` #69, three different `Beef Mince` rows, `Garlic granules` vs `Garlic Powder`) split macros, split shopping-list aggregation, and make it impossible to query "all recipes that use X".

## Homemade-first — when to enforce

Apply whenever you create or edit a recipe that contains:

- bread / toast / sourdough / brioche / milk bread → check `recipes.name` for `Bread` / `Milk Bread` / similar before reaching for a raw ingredient.
- pita / wrap / tortilla / flatbread → must link to `Pita Bread` recipe (id 117) or equivalent.
- pizza dough / pizza base → link to dough recipe; do not inline `Bread flour + yeast + olive oil` on the parent.
- sauce / dressing / marinade / pesto / tzatziki / spice rub / stock — if a recipe row exists for it, link.

If no recipe yet exists for the sub-component but the user expects to make it (not buy it), **create the sub-component recipe first**, then link the parent. Do not inline the raw flour/yeast/etc. on the parent as a shortcut.

The FR-103 dual-path case (both `ingredient_id` and `linked_recipe_id` set on one row) is the only situation where a raw "Pita Bread" ingredient is acceptable — and only alongside the link, never as a replacement for it. See `linked-recipe-extras.md` for the schema details.

## Ingredient dedup — when to enforce

**Before** any `INSERT INTO ingredients ...`:

1. Run a case-insensitive search for the proposed name AND its singular/plural form AND obvious synonyms:
   ```sql
   SELECT id, name FROM ingredients
   WHERE LOWER(name) = LOWER(:proposed)
      OR LOWER(name) = LOWER(:proposed_singular)
      OR LOWER(name) = LOWER(:proposed_plural)
      OR LOWER(name) LIKE CONCAT('%', LOWER(:root), '%');
   ```
2. If any row matches the same real-world item, **reuse that id** — do not insert.
3. If the existing row's name is wrong (e.g. `Potatoes` when convention is singular), update it in place rather than creating a second row.

Naming convention: **singular, sentence case** (`Potato`, `Banana`, `Tomato`). Plural-form rows are bugs. Variants that are genuinely different items (e.g. `Beef mince (5% fat)` vs `Beef Mince (3% fat)`) keep the descriptor in parentheses but must use **consistent casing** — pick one form per family and stick with it.

## How to verify

1. **No raw "Bread"/"Pita"/"Dough" ingredient on a recipe whose sub-component recipe exists:**
   ```sql
   SELECT ri.recipe_id, r.name AS parent, i.name AS raw_ingredient
   FROM recipe_ingredients ri
   JOIN ingredients i ON i.id = ri.ingredient_id
   JOIN recipes r ON r.id = ri.recipe_id
   WHERE ri.linked_recipe_id IS NULL
     AND i.name IN ('Pita Bread','Bread','Pizza Dough','Tortilla','Wrap','Pesto','Pizza Sauce');
   ```
   Each row is a candidate violation — confirm a corresponding sub-recipe exists, then convert to a `linked_recipe_id` row (clearing `ingredient_id` unless this is an FR-103 dual-path case).

2. **No duplicate ingredients by case-insensitive name or singular/plural collapse:**
   ```sql
   SELECT LOWER(REPLACE(REPLACE(name,'es',''),'s','')) AS root,
          GROUP_CONCAT(id), GROUP_CONCAT(name)
   FROM ingredients
   GROUP BY root
   HAVING COUNT(*) > 1;
   ```
   Heuristic — review each group manually. Known dupes at time of writing: `Potato`/`Potatoes`, `Beef Mince`/`Beef Mince (3% fat)`/`Beef mince (5% fat)` (casing), `Garlic granules`/`Garlic Powder`, `Italian herbs seasoning`/`Italian seasoning`.

3. **Merging duplicates** (when found): pick the canonical id, repoint `recipe_ingredients.ingredient_id` to it, then delete the loser row. Do **not** leave both rows in place "just in case".

## Reject conditions (block the recipe / migration)

- Recipe contains a raw "Bread"/"Pita"/"Dough"/"Wrap"/"Tortilla"/"Pesto"/"Pizza Sauce" ingredient when a sub-recipe for it exists, and the row does not also carry a `linked_recipe_id` (FR-103 dual-path).
- Migration inserts an ingredient whose case-insensitive name (or singular/plural form) already exists.
- Migration inserts a plural-form ingredient name (`Bananas`, `Carrots`) when the convention is singular.
- Two ingredient rows differ only in casing (`Beef Mince` vs `Beef mince`).

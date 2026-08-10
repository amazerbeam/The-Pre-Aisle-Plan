# MPP-4: Recipe variety expansion — breakfast staples + protein mains

**Plan:** [`plan.md`](./plan.md) · **Tasks:** [`tasks.md`](./tasks.md)

Content-only epic against the live Railway MySQL — no code, no schema, no migration. Closes the recipe variety gap identified in MPP-4 across breakfast staples and simple protein mains, per the `/chef` skill's design → resolve → macro-math → SQL → verify workflow, executed live (not via unattended `/fb-apply`) because every dish task required the developer's in-chat approval before SQL ran, per `chef` skill step 6.

## Dishes inserted (17 total: 15 new families + 1 redesigned family + 1 Extras recipe)

### Extras (no variant family)
- **Goodness Granola** (`meal_id = 5`, id 213) — rolled oats, mixed nuts/seeds, coconut oil, maple syrup, cinnamon. Linked into the Yogurt Bowl below.

### Breakfast (`meal_id = 1`)
- **Apple, Cinnamon & Walnut Porridge** (family 94)
- **Mixed Berry & Greek Yogurt Smoothie** (family 95)
- **Greek Yogurt & Granola Bowl** (family 96) — links Goodness Granola
- **Poached Eggs, Smoked Salmon & Avocado on Toast** (family 97) — links Milk Bread
- **Soft-Boiled Eggs, Cottage Cheese & Toast** (family 98) — links Milk Bread
- **Fried Eggs with Halloumi & Toast** (family 99) — links Milk Bread
- **Cheese & Ham Omelette with Toast** (family 100) — links Milk Bread + Honey Ham

### Redesigned in place
- **Scrambled Eggs & Toast** (family 15, recipes 50/51/52) — full 5-lens audit found all three variants failing every macro reject condition (fat% 44–55%, protein 21–34g, carbs 25–37%) plus `is_default` misplaced on Balanced instead of Moderate. Redesigned with Sliced Ham added as a protein-fat lever; all three now pass, `macros_audited = 1`.

### Dinner (`meal_id = 3`)
- **Baked Cod with Lemon, Herbs & New Potatoes** (family 101) — zero shellfish
- **Pan-Seared Mackerel with Greens & Quinoa** (family 102) — zero shellfish
- **Herb-Roasted Chicken Breast with Sweet Potato & Greens** (family 103) — roasted only, no breading/curry
- **Beef Meatballs in Tomato Sauce with Spaghetti** (family 104)
- **Beef Burger with Bun, Lettuce, Tomato & Ham** (family 105) — store-bought patty (`Beef Burger Patties`, id 95) per developer's explicit decision, not linked to id 43 and no homemade patty designed
- **Turkey Burger with Bun & Slaw** (family 106) — patty inlined, not a linked sub-recipe
- **Turkey Meatballs in Tomato Sauce with Spaghetti** (family 107)
- **Turkey Bolognese with Spaghetti** (family 108) — distinct family from the existing beef Spaghetti Bolognese (family 23)

## New ingredients (8, all dedup-checked before insert)

| Ingredient | id | Source task |
|---|---|---|
| Turkey mince (2% fat) | 180 | Task 1 |
| Cod | 181 | Task 1 |
| Mackerel | 182 | Task 1 |
| Coconut oil | 183 | Task 1 |
| Apple | 184 | Task 4 |
| Smoked Salmon | 185 | Task 7 |
| Halloumi | 186 | Task 9 |
| Quinoa | 187 | Task 12 |

## Phase 6 verification — all three passed with zero violations

- **Task 19** (family structure + macro-target sweep): zero structural defects across all 16 families (94–108 + redesigned 15); zero reject-condition violations across all 48 recipe rows — protein ≥35g, fat ≤35%, carbs ≥38%, correct `Light < Moderate < Balanced` ordering on every family.
- **Task 20** (dedup + linked-step coverage): zero duplicate ingredients introduced by this epic (the only duplicate root in the full table — `Potato`/`Potatoes`, ids 121/69 — is pre-existing, flagged in Task 11's audit, not something this epic created); zero missing linked-step pairings; zero raw-ingredient inlining of an existing sub-component.
- **Task 21** (idempotency): every guarded insert across all 18 dish tasks re-run a second time with zero new rows; final counts (46 recipes / 8 ingredients / 15 families / 389 `recipe_ingredients` rows) identical before and after.

## Deviations from plan.md worth flagging

- **Execution mode changed from unattended `/fb-apply` to live `/chef` conversation turns.** The plan's own Risks section flagged this mismatch; the developer confirmed live execution, then set a standing instruction partway through: once a design's macros clear every CLAUDE.md target, proceed straight to SQL without a separate approval round-trip.
- **Beef Burger (family 105) uses a much smaller store-bought patty than a typical burger** (25–40g across the three variants) plus Sliced Ham as the primary protein. The store-bought patty's 17P:20F ratio couldn't clear the protein floor without exceeding the 35% fat ceiling on its own — this is the direct, transparent consequence of the developer's explicit "use id 95 directly" decision, not a bug.
- **Turkey Burger's Light variant carries more Sliced Ham (150g) than Moderate (80g)** for the analogous reason in the Fried Egg family (halloumi's fat density) — a deliberate "swap fatty component for lean protein" lever, not an inconsistency.
- **Schema gap found in Task 1:** the plan's draft `INSERT INTO ingredients` statements omitted two NOT NULL columns (`key`, `aisle_id`) that don't appear in the plan's data-shape notes. Filled per existing naming/aisle convention; flagged in `sql/00-shared-ingredients.sql`.
- **`<=>` NULL-safe guard syntax from the `chef` skill's own SQL pattern is rejected by this environment's MCP query parser.** Every guard in this epic uses `linked_recipe_id IS NULL` instead, which is equivalent for every row in this epic (no row here needed the FR-103 dual-path).

## Developer actions outstanding

**None.** This is pure recipe-content work against the live Railway MySQL — no migration file to apply, no backend redeploy needed, no frontend change. All 17 dishes are live and immediately visible in the app.

## Naming convention note for future work

Follow `Turkey mince (2% fat)`'s pattern for any future turkey ingredient variant — fat percentage in parentheses, singular sentence case, matching the existing `Beef Mince (3% fat)` / `Beef mince (5% fat)` convention.

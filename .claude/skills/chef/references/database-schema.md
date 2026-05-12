# Chef — Database schema reference

Column-level reference for the tables a chef-skill insert touches. Source of truth is `foodbytes-app/database/schema.sql` — if anything here disagrees with that file, the schema file wins.

## `ingredients`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `key` | VARCHAR | snake_case stable identifier (e.g. `olive_oil`) |
| `name` | VARCHAR | Display name, **singular sentence case** (`Potato`, not `Potatoes`) |
| `aisle_id` | BIGINT | FK → `aisles.id` |
| `protein_per_100g` | DECIMAL | g per 100 g |
| `carbs_per_100g` | DECIMAL | g per 100 g |
| `fat_per_100g` | DECIMAL | g per 100 g |
| `macros_verified` | BOOLEAN | Set TRUE once verified against a trusted source |

There is **no** `calories_per_100g` column — kcal is computed: `protein*4 + carbs*4 + fat*9`.

## `recipes`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `name` | VARCHAR | **No variant suffix** — all three siblings share the same name |
| `default_servings` | INT | Usually 2 |
| `calories` | INT | **Whole-recipe kcal** = `kcal_per_serving × default_servings` |
| `is_cheat` | BOOLEAN | Default FALSE |
| `is_live` | BOOLEAN | Default TRUE |

Family membership is in `recipe_family_members`, not on this table.

## `recipe_meals`

Junction. `(recipe_id, meal_id)` where `meal_id` references `meals.id`. Meal slots: `breakfast` (1), `lunch` (2), `dinner` (3), `snack` (4), `extras` (5).

## `recipe_ingredients`

| Column | Notes |
|---|---|
| `recipe_id` | FK → `recipes.id` |
| `ingredient_id` | FK → `ingredients.id`. NULL if homemade-only extra. |
| `linked_recipe_id` | FK → `recipes.id` (sub-recipe). NULL for raw ingredient rows. |
| `quantity` | Display amount in the unit |
| `unit_id` | FK → `units.id` |
| `quantity_grams` | **Gram weight actually consumed** by this dish — for linked recipes, NOT the sub-recipe's total yield |
| `sort_order` | INT |

FR-103 truth table:

| `ingredient_id` | `linked_recipe_id` | Meaning |
|---|---|---|
| SET | NULL | Raw ingredient |
| NULL | SET | Homemade-only extra |
| SET | SET | Dual-path: store-bought ingredient + homemade sub-recipe |

## `recipe_steps`

| Column | Notes |
|---|---|
| `recipe_id` | FK |
| `step_number` | 1-based |
| `instruction` | Homemade-path / canonical instruction |
| `linked_recipe_id` | NULL or FK to sub-recipe |
| `alt_instruction` | Shown when user picks store-bought for the linked sub-recipe |

## `recipe_extras`

Parent → child hierarchy for the homemade/store-bought popup. Separate from `recipe_ingredients.linked_recipe_id` (which carries quantity).

| Column | Notes |
|---|---|
| `parent_recipe_id` | FK → `recipes.id` |
| `child_recipe_id` | FK → `recipes.id` (the extra) |
| `display_order` | INT |

## `recipe_families`

| Column | Notes |
|---|---|
| `id` | PK |
| `family_name` | VARCHAR — **NOT `name`** |
| `description` | TEXT, optional |

## `recipe_family_members`

| Column | Notes |
|---|---|
| `family_id` | FK |
| `recipe_id` | FK |
| `is_default` | BOOLEAN — TRUE on **Moderate** only |
| `variant_label` | One of `Light`, `Moderate`, `Balanced` |
| `display_order` | 1 = Light, 2 = Moderate, 3 = Balanced |

## Insert order (FK-safe)

1. `ingredients` (new)
2. Sub-recipe `recipes` → `recipe_meals` → `recipe_ingredients` → `recipe_steps`
3. Parent `recipes` (3 variants) → `recipe_meals`
4. Parent `recipe_ingredients` (raw + linked, FR-103 dual-path where relevant)
5. Parent `recipe_steps` (with `linked_recipe_id` + `alt_instruction`)
6. `recipe_extras` (parent → each sub-recipe)
7. `recipe_families`
8. `recipe_family_members` (3 rows)

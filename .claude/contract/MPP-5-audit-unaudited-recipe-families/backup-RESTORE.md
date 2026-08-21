# Pre-MPP-5 recipe backup — what it is and how to restore it

**File:** `backup-recipes-2026-08-19-pre-mpp5.sql` (1,033,102 bytes)
**Taken:** 2026-08-19 18:18:56, against the live Railway MySQL (`railway` @ `hopper.proxy.rlwy.net:35402`)
**State captured:** the recipe data **before** `2026-08-18-mpp5-family-audit-remediation.sql` was applied.

This is the undo for Task 35. The migration has no rollback script — this dump is the plan.

## What is in it

Schema **and** data (`DROP TABLE` + `CREATE TABLE` + one `INSERT` per row) for 11 tables.
Row counts were verified against live at dump time and matched exactly:

| Table | Rows |
|---|---|
| `recipes` | 200 |
| `recipe_ingredients` | 2229 |
| `recipe_steps` | 1467 |
| `recipe_families` | 61 |
| `recipe_family_members` | 184 |
| `recipe_extras` | 52 |
| `recipe_meals` | 221 |
| `ingredients` | 185 |
| `units` | 18 |
| `aisles` | 17 |
| `meals` | 5 |

Dumped with `--single-transaction` (consistent snapshot, no table locks), `--complete-insert`
(column names on every row, so the file survives a future column reorder) and
`--skip-extended-insert` (one row per line, so it diffs and greps cleanly).

## What is deliberately NOT in it

`users`, `meal_plan_entries`, `shopping_lists`, `shopping_list_items`.

Scoped out on purpose — the request was recipe data, none of these tables hold any, and keeping
user rows out of a file that lives in the repo avoids putting personal data somewhere it does not
belong. **It also means this backup cannot restore meal-plan or shopping-list state.** See the
warning below.

## How to restore

Everything in one file, FK checks disabled in the header (`FOREIGN_KEY_CHECKS=0` on line 14), so
table order does not matter and the whole file can go in as one paste:

```bash
mysql --host=hopper.proxy.rlwy.net --port=35402 --user=root --password \
      railway < backup-recipes-2026-08-19-pre-mpp5.sql
```

On Windows without `mysql` on PATH, the binary ships with MySQL Workbench:

```
"C:\Program Files\MySQL\MySQL Workbench 8.0 CE\mysql.exe" --host=... --user=root --password railway
```

It also pastes straight into the Railway web console. There is no transaction wrapper, but that
does not matter here: each table is dropped and rebuilt from scratch, so re-running the file is
idempotent. If it stops halfway, run it again from the top.

## Read this before you restore

1. **It is a full replace, not a merge.** Every one of the 11 tables is `DROP`ped and rebuilt.
   Any recipe change made *after* 18:18:56 on 2026-08-19 — including legitimate ones unrelated to
   MPP-5 — is gone. Take a fresh dump of current state first if there is any doubt.

2. **It can silently orphan meal-plan and shopping-list rows.** `meal_plan_entries` and
   `shopping_list_items` hold FKs into `recipes` and `ingredients`, but those tables are not in
   this dump and `FOREIGN_KEY_CHECKS=0` means the restore will not complain. Two concrete cases
   after the migration is applied:
   - **Recipe 269** (the new family 8 `Light`) does not exist in this snapshot. If anyone
     meal-plans it, restoring leaves a `meal_plan_entries` row pointing at a recipe id that is
     gone.
   - **Ingredient 69** (`Potatoes`) *does* exist in this snapshot. The migration deletes it and
     repoints its rows to 121; a restore brings 69 back, so any `shopping_list_items` row already
     repointed to 121 stays on 121 and the duplicate is live again.

   Neither errors. Both need a check afterwards:

   ```sql
   -- orphaned plan entries
   SELECT mpe.* FROM meal_plan_entries mpe
   LEFT JOIN recipes r ON r.id = mpe.recipe_id WHERE r.id IS NULL;
   -- orphaned shopping list items
   SELECT sli.* FROM shopping_list_items sli
   LEFT JOIN ingredients i ON i.id = sli.ingredient_id WHERE i.id IS NULL;
   ```

3. **No backend redeploy is needed either way.** The migration contains no DDL, and this restore
   recreates the same schema it captured, so Hibernate's `validate` mode is satisfied in both
   directions.

## Verifying a restore worked

```sql
SELECT 'recipes' t, COUNT(*) n FROM recipes
UNION ALL SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL SELECT 'recipe_steps', COUNT(*) FROM recipe_steps
UNION ALL SELECT 'recipe_families', COUNT(*) FROM recipe_families
UNION ALL SELECT 'recipe_family_members', COUNT(*) FROM recipe_family_members
UNION ALL SELECT 'recipe_extras', COUNT(*) FROM recipe_extras
UNION ALL SELECT 'recipe_meals', COUNT(*) FROM recipe_meals
UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients;
```

Should return the counts in the table above. Spot-checks that the migration is genuinely undone:
recipes 210–212 back at `is_cheat = 0`, ingredient 69 present again, three recipes named
`Greek Chicken Gyros Bowl - Diet`, recipe 212's Fresh Pasta portion back at 300 g, family 1 named
`Porridge with Berries & Nuts`, and no recipe 269.

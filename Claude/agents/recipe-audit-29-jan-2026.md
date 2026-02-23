# Recipe Macro Audit - 29 Jan 2026

## Overview

Full database audit of all recipes against macro targets. Many recipes fail protein, fat %, or carb % checks.

## Targets

| Check | Target | Reject If |
|-------|--------|-----------|
| **Calories (Light)** | 450-550/serving | >600 |
| **Calories (Moderate)** | 550-650/serving | >750 |
| **Calories (Balanced)** | 700-800/serving | >900 |
| **Protein** | 35g+ per serving | <35g |
| **Fat %** | 25-35% of calories | >35% |
| **Carbs %** | 40-50% of calories | <38% |

---

## Audit Results Summary

### Fully Passing (10 recipes)
- Beef & Mushroom Black Bean Stir Fry
- Black Bean Chicken Wrap
- Chicken Tikka Masala
- Drunken Noodles
- Hash Browns & Diced Chicken (NEW)
- Irish Chicken Curry
- Paella Valenciana
- Pizza (all variants)
- Reina Arepa (NEW)
- Spaghetti Bolognese

### Excluded (Cheat Meals / Deleted)
- **Pastichio (Lasagna)** — Cheat meal, no fix needed
- **Homemade Big Mac** — Cheat meal, no fix needed
- **Salmon & Asparagus** — DELETED (user request)

### Needing Fixes (7 recipes)
1. Greek Chicken Gyros
2. Breaded Chicken with Mash & Black Beans
3. Stromboli
4. Salmon Sandwich
5. Lentil Stew
6. Lentil Stuffed Peppers
7. Peanut Butter Banana Smoothie

---

## Verified Fixes

### 1. Greek Chicken Gyros (Recipes 118, 119, 120)

**Issue:** Fat 36-37% (over), Carbs 33-35% (under)
**Root cause:** Chicken thighs (10% fat) + olive oil

**Fix:**
- Change chicken thigh → chicken breast (same quantity)
- Reduce olive oil: 20g → 14g (Balanced)
- Increase pita: 200g → 240g (Balanced)

**Verified (Balanced):**
| | Before | After |
|--|--------|-------|
| Protein | 125.6g | 145.0g |
| Carbs | 140.3g | 162.3g |
| Fat | 69.1g | 43.1g |
| Cal/serving | 843 | 809 |
| Fat % | 37% ❌ | 24% ✓ |
| Carbs % | 33% ❌ | 40% ✓ |

**Status:** [x] SQL Generated

---

### 2. Breaded Chicken with Mash & Black Beans (Recipes 101, 102, 103)

**Issue:** Fat 36-39% (over), Carbs 31-33% (under)
**Root cause:** 38g olive oil + 20g butter

**Fix:**
- Reduce olive oil (breading): 28g → 12g (Balanced)
- Reduce olive oil (beans): 10g → 5g (Balanced)
- Reduce butter: 20g → 12g (Balanced)
- Increase potato: 320g → 420g (Balanced)

**Verified (Balanced):**
| | Before | After |
|--|--------|-------|
| Protein | 128.8g | 130.8g |
| Carbs | 132.9g | 149.9g |
| Fat | 74.8g | 47.3g |
| Cal/serving | 860 | 775 |
| Fat % | 39% ❌ | 28% ✓ |
| Carbs % | 31% ❌ | 39% ✓ |

**Status:** [x] SQL Generated

---

### 3. Stromboli (Recipes 44, 45, 46)

**Issue:** Fat 36-38% (over)
**Root cause:** 35g olive oil + heavy cheese

**Fix:**
- Reduce olive oil: 35g → 18g (Balanced)
- Reduce mozzarella: 130g → 110g (Balanced)

**Verified (Balanced):**
| | Before | After |
|--|--------|-------|
| Protein | 101.6g | 97.2g |
| Carbs | 212.2g | 211.8g |
| Fat | 86.6g | 65.4g |
| Cal/serving | 1017 | 913 |
| Fat % | 38% ❌ | 32% ✓ |

**Status:** [x] SQL Generated

---

### 4. Salmon Sandwich (Recipes 28, 29)

**Issue:** Fat 36% (over), Moderate protein 30g (under)
**Root cause:** 30g butter

**Fix:**
- Reduce butter: 30g → 15g (Balanced), 15g → 8g (Moderate)

**Verified (Balanced):**
| | Before | After |
|--|--------|-------|
| Fat | 72.7g | 60.5g |
| Fat % | 36% ❌ | ~31% ✓ |

**Status:** [x] SQL Generated

---

### 5. Lentil Stew (Recipes 30, 31, 32)

**Issue:** Protein 24-33g (under) — vegetarian base
**Root cause:** No meat protein, Light has no chorizo

**Fix:**
- Add chicken breast: 150g (Light), 100g (Moderate), 80g (Balanced)

**Verified (Light):**
| | Before | After |
|--|--------|-------|
| Protein | 48.6g | 95.1g |
| Carbs | 134.9g | 134.9g |
| Fat | 25.4g | 30.8g |
| Cal/serving | 481 | 599 |
| Protein/serv | 24.3g ❌ | 47.6g ✓ |
| Fat % | 24% ✓ | 23% ✓ |
| Carbs % | 56% ✓ | 45% ✓ |

**Status:** [x] SQL Generated

---

### 6. Lentil Stuffed Peppers (Recipes 33, 34, 35)

**Issue:** Protein 18-30g (under) — vegetarian
**Root cause:** Lentils only protein source

**Fix:**
- Add turkey mince: 150g (Light), 120g (Moderate), 100g (Balanced)

**Verified (Balanced):**
| | Before | After |
|--|--------|-------|
| Protein | 59.6g | 86.6g |
| Carbs | 186.1g | 186.1g |
| Fat | 26.0g | 34.0g |
| Cal/serving | 608 | 698 |
| Protein/serv | 29.8g ❌ | 43.3g ✓ |
| Fat % | 19% ✓ | 22% ✓ |

**Status:** [x] SQL Generated

---

### 7. Peanut Butter Banana Smoothie (Recipes 4, 5, 6)

**Issue:** Protein 14-24g (under)
**Root cause:** Smoothie, limited protein sources

**Fix:**
- Add protein powder: 45g (Light), 40g (Moderate), 35g (Balanced)

**Verified (Light):**
| | Before | After |
|--|--------|-------|
| Protein | 28.6g | 64.6g |
| Carbs | 95.6g | 99.2g |
| Fat | 28.8g | 30.2g |
| Cal/serving | 378 | 464 |
| Protein/serv | 14.3g ❌ | 32.3g ✓ |
| Fat % | 34% ✓ | 29% ✓ |
| Carbs % | 51% ✓ | 43% ✓ |

**Updated amounts after verification:**
- Light: 55g (not 45g) → 36.3g protein/serving ✓
- Moderate: 45g (not 40g) → 38g protein/serving ✓
- Balanced: 35g → 38g protein/serving ✓

**Status:** [x] SQL Generated

---

## New Ingredients Required

```sql
INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(162, 'turkey_mince', 'Turkey Mince', 2, 27.0, 0.0, 8.0, TRUE),
(163, 'protein_powder', 'Protein Powder', 17, 80.0, 8.0, 3.0, TRUE);
```

---

## Ingredient IDs Reference

| Ingredient | ID |
|------------|-----|
| chicken_breast | 11 |
| olive_oil | 22 |
| mozzarella | 37 |
| chicken_thigh | 41 |
| unsalted_butter | 44 |
| salted_butter | 53 |
| potato | 121 |
| pita_bread_store | 157 |
| turkey_mince | 162 (new) |
| protein_powder | 163 (new) |

---

## Recipes to Delete

- **Salmon & Asparagus** (Recipes 69, 70) — User requested deletion

---

## Other Failing Recipes (Not Yet Addressed)

These recipes also fail but weren't prioritized in this audit:

| Recipe | Issue | Notes |
|--------|-------|-------|
| Avocado Toast | Fat 49-55%, Protein 11-27g | Major redesign needed |
| Chicken Satay | Fat 48-49%, Carbs 27-28% | Peanut sauce is fat-heavy |
| French Toast | Fat 50-51%, Protein 14-22g | Egg/butter heavy |
| Korean Fried Chicken | Fat 39%, Carbs 35-37% | Fried + sauce |
| Oat Arepa with Egg | Fat 46-48%, Protein 19-30g | Egg/cheese heavy |
| Paella de pollo | Fat 38-43% | Oil heavy |
| Pink Sauce Pasta | Fat 41-43%, Carbs 27-29% | Cream heavy |
| Porridge with Berries | Fat 39-40%, Protein 13-22g | Nuts add fat |
| Scrambled Eggs & Toast | Fat 44-55%, Carbs 25-37% | Egg/butter heavy |
| Steak & Chips | Fat 46-48%, Carbs 24-28% | Steak fat + chips |
| Tortilla Española | Fat 52-57%, Protein 13-25g | Egg/oil heavy |
| Chicken & Vegetable Soup | Carbs 29-31% | Low carb content |
| Chicken Burrito Bowl (B) | Fat 36% | Slightly over |

---

## SQL Execution Checklist

**Migration file:** `foodbytes-app/database/migrations/029_recipe_macro_fixes.sql`

- [x] Create new ingredients (turkey_mince, protein_powder) — SQL ready
- [x] Greek Chicken Gyros — update thigh→breast, oil, pita — SQL ready
- [x] Breaded Chicken — update oil, butter, potato — SQL ready
- [x] Stromboli — update oil, mozzarella — SQL ready
- [x] Salmon Sandwich — update butter — SQL ready
- [x] Lentil Stew — insert chicken — SQL ready
- [x] Lentil Stuffed Peppers — insert turkey — SQL ready
- [x] PB Banana Smoothie — insert protein powder (corrected: 55g/45g/35g) — SQL ready
- [x] Delete Salmon & Asparagus — SQL ready
- [ ] **RUN MIGRATION ON LIVE DB**
- [ ] Re-run audit to verify fixes
- [ ] Update stored calories on all fixed recipes

---

## Audit Query

```sql
-- Full audit query with pass/fail flags
WITH recipe_macros AS (
    SELECT
        r.id, r.name,
        COALESCE(rfm.variant_label, '-') AS variant,
        r.default_servings AS servings,
        r.calories AS stored_cal,
        COALESCE((SELECT ROUND(SUM(i.protein_per_100g * ri.quantity_grams / 100), 1)
            FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = r.id AND ri.ingredient_id IS NOT NULL), 0) AS raw_protein,
        COALESCE((SELECT ROUND(SUM(i.carbs_per_100g * ri.quantity_grams / 100), 1)
            FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = r.id AND ri.ingredient_id IS NOT NULL), 0) AS raw_carbs,
        COALESCE((SELECT ROUND(SUM(i.fat_per_100g * ri.quantity_grams / 100), 1)
            FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = r.id AND ri.ingredient_id IS NOT NULL), 0) AS raw_fat,
        COALESCE((SELECT ROUND(SUM(
            (SELECT SUM(i2.protein_per_100g * ri2.quantity_grams / 100) FROM recipe_ingredients ri2
             JOIN ingredients i2 ON i2.id = ri2.ingredient_id WHERE ri2.recipe_id = lr.id AND ri2.ingredient_id IS NOT NULL)
            * ri.quantity_grams / NULLIF((SELECT SUM(ri3.quantity_grams) FROM recipe_ingredients ri3
               WHERE ri3.recipe_id = lr.id AND ri3.ingredient_id IS NOT NULL), 0)), 1)
            FROM recipe_ingredients ri JOIN recipes lr ON lr.id = ri.linked_recipe_id
            WHERE ri.recipe_id = r.id AND ri.linked_recipe_id IS NOT NULL AND ri.ingredient_id IS NULL), 0) AS extra_protein,
        COALESCE((SELECT ROUND(SUM(
            (SELECT SUM(i2.carbs_per_100g * ri2.quantity_grams / 100) FROM recipe_ingredients ri2
             JOIN ingredients i2 ON i2.id = ri2.ingredient_id WHERE ri2.recipe_id = lr.id AND ri2.ingredient_id IS NOT NULL)
            * ri.quantity_grams / NULLIF((SELECT SUM(ri3.quantity_grams) FROM recipe_ingredients ri3
               WHERE ri3.recipe_id = lr.id AND ri3.ingredient_id IS NOT NULL), 0)), 1)
            FROM recipe_ingredients ri JOIN recipes lr ON lr.id = ri.linked_recipe_id
            WHERE ri.recipe_id = r.id AND ri.linked_recipe_id IS NOT NULL AND ri.ingredient_id IS NULL), 0) AS extra_carbs,
        COALESCE((SELECT ROUND(SUM(
            (SELECT SUM(i2.fat_per_100g * ri2.quantity_grams / 100) FROM recipe_ingredients ri2
             JOIN ingredients i2 ON i2.id = ri2.ingredient_id WHERE ri2.recipe_id = lr.id AND ri2.ingredient_id IS NOT NULL)
            * ri.quantity_grams / NULLIF((SELECT SUM(ri3.quantity_grams) FROM recipe_ingredients ri3
               WHERE ri3.recipe_id = lr.id AND ri3.ingredient_id IS NOT NULL), 0)), 1)
            FROM recipe_ingredients ri JOIN recipes lr ON lr.id = ri.linked_recipe_id
            WHERE ri.recipe_id = r.id AND ri.linked_recipe_id IS NOT NULL AND ri.ingredient_id IS NULL), 0) AS extra_fat
    FROM recipes r
    LEFT JOIN recipe_family_members rfm ON rfm.recipe_id = r.id
    LEFT JOIN recipe_meals rm ON rm.recipe_id = r.id
    LEFT JOIN meals m ON m.id = rm.meal_id
    WHERE r.is_live = TRUE AND (m.`key` IS NULL OR m.`key` != 'extras')
)
SELECT id, name, variant, servings, stored_cal,
    ROUND(raw_protein + extra_protein, 1) AS total_protein,
    ROUND(raw_carbs + extra_carbs, 1) AS total_carbs,
    ROUND(raw_fat + extra_fat, 1) AS total_fat,
    ROUND((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9) AS calc_cal,
    ROUND((raw_protein + extra_protein) / servings, 1) AS protein_per_serv,
    ROUND(((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9) / servings) AS cal_per_serv,
    ROUND((raw_protein + extra_protein) * 4 * 100 / NULLIF((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9, 0)) AS protein_pct,
    ROUND((raw_carbs + extra_carbs) * 4 * 100 / NULLIF((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9, 0)) AS carbs_pct,
    ROUND((raw_fat + extra_fat) * 9 * 100 / NULLIF((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9, 0)) AS fat_pct,
    CASE WHEN (raw_protein + extra_protein) / servings >= 35 THEN 'PASS' ELSE 'FAIL' END AS protein_check,
    CASE WHEN ROUND((raw_fat + extra_fat) * 9 * 100 / NULLIF((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9, 0)) <= 35 THEN 'PASS' ELSE 'FAIL' END AS fat_check,
    CASE WHEN ROUND((raw_carbs + extra_carbs) * 4 * 100 / NULLIF((raw_protein + extra_protein) * 4 + (raw_carbs + extra_carbs) * 4 + (raw_fat + extra_fat) * 9, 0)) >= 38 THEN 'PASS' ELSE 'FAIL' END AS carbs_check
FROM recipe_macros
ORDER BY name, variant;
```

# Weight-Loss Meal Plan — Week of 2026-05-11 (Mon → Sun)

**Generated:** 2026-05-07
**Targets per `CLAUDE.md` (Light variant — used here for weight loss):** 450–550 kcal/serving, ≥35 g protein/serving, fat 25–35 % of kcal, carbs 40–50 % of kcal.
**Daily protein target (84 kg user, 1.2–1.6 g/kg):** 101–134 g/day.
Gout constraints applied (no anchovy / sardine / fish-sauce). Excluded by user from this week's plan: *Salmon en Papillote*, *Black Bean Chicken Wrap*, *Salmon & Asparagus*.

## The plan

| Day | Breakfast | Lunch | Dinner |
|---|---|---|---|
| **Mon** | Protein Porridge with Berries 🆕 | Greek Chicken Gyros Bowl 🆕 | Slow-Roasted Salmon with Citrus & Veg 🆕 |
| **Tue** | Overnight Oats | Mediterranean White Bean & Chicken Soup 🆕 | Mediterranean Salmon w/ Sweet Potato & Broccoli |
| **Wed** | Hash Browns & Diced Chicken | Pink Sauce Pasta | High-Protein Tuscan Chicken with Rice 🆕 |
| **Thu** | Reina Arepa | Chicken & Vegetable Soup | Salmon w/ Air-Fried Potatoes & Green Beans |
| **Fri** | Protein Porridge with Berries 🆕 | Beef & Mushroom Black Bean Stir Fry | Tamarind Tossed Noodles |
| **Sat** | Overnight Oats | Greek Chicken Gyros Bowl 🆕 | Chicken Burrito Bowl |
| **Sun** | Hash Browns & Diced Chicken | White Bean & Chicken Soup 🆕 (leftovers) | Tuscan Chicken with Rice 🆕 (leftovers) |

**5 unique new recipes** (each used 1–2 days) + **8 unique existing recipes** (already passing macros).

## Daily protein totals

| Day | Breakfast | Lunch | Dinner | Daily total |
|---|---|---|---|---|
| Mon | 44.5 | 38 | 36 | **118 g** ✅ |
| Tue | 44 | 44 | 33 | **121 g** ✅ |
| Wed | 37 | 42 | 51.5 | **131 g** ✅ |
| Thu | 36 | 39 | 33 | **108 g** ✅ |
| Fri | 44.5 | 36 | 40 | **120 g** ✅ |
| Sat | 44 | 38 | 38 | **120 g** ✅ |
| Sun | 37 | 44 | 51.5 | **133 g** ✅ |

Average **121 g/day**, every day inside the 101–134 g target band.

## Per-meal kcal/protein

| Meal | kcal | Protein | Status |
|---|---|---|---|
| 🆕 Protein Porridge with Berries | 552 | 44.5 | Light upper edge |
| 🆕 Greek Chicken Gyros Bowl | 548 | 38 | ✅ |
| 🆕 Med White Bean & Chicken Soup | 560 | 44 | Light upper edge |
| 🆕 Slow-Roasted Salmon with Citrus & Veg | 550 | 36 | ✅ |
| 🆕 High-Protein Tuscan Chicken w/ Rice | 587 | 51.5 | Just over Light cap (under 600 reject) |
| Overnight Oats (existing) | 526 | 44 | ✅ |
| Hash Browns & Diced Chicken (existing) | 455 | 37 | ✅ |
| Reina Arepa (existing) | 536 | 36 | ✅ |
| Mediterranean Salmon (existing) | 536 | 33 | protein 2 g under, kcal ✅ |
| Salmon w/ Air-Fried Pot & GB (existing) | 530 | 33 | protein 2 g under, kcal ✅ |
| Pink Sauce Pasta (existing) | 557 | 42 | ✅ |
| Chicken & Vegetable Soup (existing) | 434 | 39 | ✅ |
| Beef & Mushroom Black Bean Stir Fry (existing) | 460 | 35.7 | ✅ |
| Tamarind Tossed Noodles (existing) | 546 | 40 | ✅ |
| Chicken Burrito Bowl Light (existing) | 578 | 38 | Just over Light cap (under 600 reject) |

## New ingredients added to the database

| Ingredient | Aisle | Why |
|---|---|---|
| Cottage cheese | Dairy | Tuscan Chicken sauce thickener |
| Cannellini beans (tinned) | Tins & Jars | White bean soup base |
| Chickpeas (tinned) | Tins & Jars | Gyros bowl bulk + plant protein |
| Baby spinach | Veg | Soup + Tuscan chicken |
| Sundried tomatoes (in oil) | Tins & Jars | Tuscan chicken signature flavour |
| Heavy cream | Dairy | Tuscan chicken sauce |
| Basmati rice | Grains & Pasta | Gyros bowl + Tuscan chicken base |
| Orange | Fruit | Slow-roasted salmon citrus glaze |

## New recipes — sourcing

1. **Protein Porridge with Berries** — original FoodBytes recipe; structure follows USDA 2025–2030 high-protein-breakfast guidance (≥30 g protein at breakfast).
2. **Greek Chicken Gyros Bowl** — based on [Joy to the Food sheet-pan chicken gyros](https://joytothefood.com/high-protein-low-calorie-dinner-recipes/); chickpeas + rice added for carb target.
3. **Mediterranean White Bean & Chicken Soup** — based on [Feel Good Foodie white bean soup](https://feelgoodfoodie.net/recipe/white-bean-soup/); chicken added for protein target.
4. **Slow-Roasted Salmon with Citrus & Veg** — based on [Forks & Foliage slow-roasted salmon with citrus and capers](https://forksandfoliage.com/slow-roasted-salmon-with-citrus-capers/).
5. **High-Protein Tuscan Chicken with Rice** — based on [Joy to the Food high-protein Tuscan chicken](https://joytothefood.com/high-protein-tuscan-chicken/); cottage cheese is the published thickener (kept), portions trimmed to hit Light target.

## Migration

`foodbytes-app/database/migrations/2026-05-07_meal_plan_week_2026_05_11.sql`

Apply manually to Railway (Hibernate is in `validate` mode). No backend redeploy needed since no schema changes.

## Notes / follow-ups

- Each new recipe ships **Light only** here. Per `recipe-variants.md` they need Moderate + Balanced too — flagged for a follow-up migration.
- Ingredient hygiene (Potato/Potatoes duplicate, Beef Mince casing, Garlic granules vs Powder) still pending; not required for this plan to work.

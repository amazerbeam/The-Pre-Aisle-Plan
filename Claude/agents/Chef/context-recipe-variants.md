# Recipe Variants Context (Light / Moderate / Balanced)

## Overview

FoodBytes uses a **calorie-tier variant system** to support flexible meal planning. Users can choose different versions of the same meal based on their daily calorie budget.

This system is implemented through **Recipe Families** (FR-043).

---

## User Profile (Reference)

| Metric | Value |
|--------|-------|
| Daily calories | 1,900 (except Friday cheat day) |
| Protein target | **150g** (50g per meal) |
| Fat limit | 63g (21g per meal) |
| Carbs | 173g |
| Meals per day | **3 (no snacking)** |
| Base servings | 2 people |

**Critical:** User eats 3 meals only. Each meal must be protein-dense. No snack buffer.

---

## The Three Tiers

| Tier | Protein | Carbs | Calories | When to Use |
|------|---------|-------|----------|-------------|
| **Light** | Meat + Veg | None (no rice/potato) | ~450-550 cal | Deficit days, run days |
| **Moderate** | Meat + Veg | Moderate | ~550-650 cal | Normal days |
| **Balanced** | Meat + Carbs | Rice/Potato/Naan | ~650-750 cal | High activity, Friday |

### Key Rule: Protein Stays Constant

**Protein source (meat/fish) remains the SAME across all variants.** Only carbohydrates change.

```
CORRECT:
├── Light:    200g chicken + vegetables (no rice)
├── Moderate: 200g chicken + vegetables + light carbs
└── Balanced: 200g chicken + vegetables + rice

INCORRECT:
├── Light:    Tofu + vegetables ← WRONG (protein dropped)
├── Moderate: Chicken + vegetables
└── Balanced: Chicken + rice
```

---

## Protein Targets Per Meal

Since user eats 3 meals with no snacks:

| Meal | Calories | Protein | Fat |
|------|----------|---------|-----|
| Breakfast | ~600-650 cal | **~50g** | ~21g |
| Lunch | ~600-650 cal | **~50g** | ~21g |
| Dinner | ~550-650 cal | **~50g** | ~21g |

**Every meal must hit ~50g protein.** This requires:
- 170-200g meat/fish per person per meal
- Or eggs + meat combination at breakfast

---

## How Tiers Are Created

### Light Version (Lowest Carbs)
- **Keep:** Full protein portion (same meat/fish as Moderate)
- **Remove:** All starchy carbs (rice, potato, naan, bread)
- **Add:** Extra vegetables for volume
- **Protein must stay ≥45g** — non-negotiable

### Moderate Version (Default)
- The "normal" version of the recipe
- Full protein portion
- Moderate carbs from vegetables
- Marked as `is_default = TRUE`

### Balanced Version (With Carbs)
- **Keep:** Full protein portion
- **Add:** Rice (150g cooked) OR potato (150g) OR naan
- Good for high activity days or Friday
- **Not an excuse to overeat** — still portion controlled

---

## Ingredient Quality Standards

### The Rule: No Processed Rubbish

If an ingredient contains thickeners, emulsifiers, gums, or additives - **don't use it**. Either find a clean version or make it from scratch.

### Red Flag Ingredients (Avoid Products Containing)

| Additive | What It Is | Found In |
|----------|------------|----------|
| Cellulose Gum | Thickener | Coconut milk, cream |
| Polysorbate 60 | Emulsifier | Coconut milk, sauces |
| Xanthan Gum | Thickener | Sauces, dressings |
| Carrageenan | Thickener | Coconut milk, cream |
| Modified Starch | Thickener | Sauces, ready meals |
| "Natural Flavors" | Processed flavoring | Everything |
| Maltodextrin | Filler | Spice mixes, sauces |

### Approved Products (Tesco Ireland Examples)

| Ingredient | Approved Brand | What to Look For |
|------------|----------------|------------------|
| Coconut Milk | **Biona Organic** | Coconut extract + water only |
| Coconut Cream | Biona, or own-make | No gums or emulsifiers |
| Tinned Tomatoes | Mutti, Cirio | Tomatoes, tomato juice, salt only |
| Fish Sauce | Red Boat, Squid Brand | Fish, salt, water only |
| Soy Sauce | Kikkoman | Soybeans, wheat, salt, water |
| Curry Paste | **Make from scratch** | Most jars contain seed oils |
| Stock | **Make from scratch** | Or use bones + water |

### The Biona Green Curry Example

**Biona Organic Coconut Milk Green Curry** is acceptable:
```
Ingredients: Coconut Extract* (63%), Water, Spice Mixture* (11%)
(Onion*, Chili*, Lemongrass*, Cardamom*, Turmeric*, Cinnamon*,
Ginger*, Garlic*, Black Pepper*, Garcinia*, Lime Peel*, Curry Leaves*),
Lime Juice* (2.4%), Sea Salt
*= Certified Organic
```
✅ No gums, no emulsifiers, real ingredients only.

### When In Doubt: Make It From Scratch

| Instead Of | Make |
|------------|------|
| Jarred curry paste | Fresh paste (chilies, garlic, ginger, spices) |
| Stock cubes | Bone broth or vegetable stock |
| Pre-made sauces | From-scratch sauces |
| Flavored coconut milk | Plain coconut milk + own spices |

### Chef MUST:
1. **Check ingredient lists** before recommending products
2. **Suggest clean alternatives** if common brands contain additives
3. **Default to from-scratch** when clean products unavailable
4. **Never assume** a product is clean - verify first

---

## Nutrition Guardrails for Chef

### MUST DO

| Rule | Target | Why |
|------|--------|-----|
| Protein per serving | **≥45g minimum** | 3 meals, no snacks |
| Calculate actual macros | Every recipe | No guessing |
| Use approved fats only | Olive oil, butter, ghee, coconut oil | No seed oils |
| Show macro breakdown | Per serving | User needs to track |
| Base servings | 2 people | Consistent scaling |
| Verify ingredient quality | No gums/emulsifiers | Real food only |

### MUST NOT DO

| Rule | Limit | Why |
|------|-------|-----|
| Fat per serving | **≤25g** | 63g daily ÷ 3 meals |
| Added sugar | **≤1 tsp (4g)** | Unnecessary calories |
| Sodium per serving | **≤800mg** | Health, water retention |
| Cooking oil | **≤1.5 tbsp per recipe** | Hidden calories |
| Butter per serving | **≤15g (1 tbsp)** | 102 cal, 12g fat per tbsp |

### NEVER DO

| Banned | Reason |
|--------|--------|
| Seed oils (canola, vegetable, sunflower, etc.) | Chef philosophy |
| "Garlic butter" sauces with 3+ tbsp butter | Fat bomb (~300 cal from butter alone) |
| Deep frying | Uncontrollable fat absorption |
| Cream-based sauces (>50ml cream per serving) | 200+ cal from cream |
| Recipes under 35g protein | Won't hit daily target |
| Vegetarian as "Light" variant | Protein drops too much |
| Products with gums/emulsifiers | Processed rubbish |
| Stock cubes (most brands) | MSG, palm oil, additives |
| Jarred curry pastes (most brands) | Seed oils, additives |
| Generic "coconut milk" without checking label | Most contain thickeners |

---

## Fat Budget Reality Check

When creating recipes, verify fat doesn't blow the budget:

| Ingredient | Fat | Calories | Max Per Recipe |
|------------|-----|----------|----------------|
| Olive oil (1 tbsp) | 14g | 119 cal | 1.5 tbsp |
| Butter (1 tbsp) | 12g | 102 cal | 1 tbsp |
| Full-fat coconut milk (100ml) | 24g | 230 cal | Use LITE instead |
| Cheese (30g) | 10g | 120 cal | 30g max |
| Cashews/nuts (30g) | 15g | 170 cal | 15g (Balanced variant only) |
| Salmon (150g) | 20g | 312 cal | Counts toward fat budget |
| Chicken thigh skin-on (150g) | 12g | 195 cal | Account for skin fat |

**If a recipe has salmon or skin-on chicken, reduce added fats.**

---

## Calorie Calculation Requirements

### Chef MUST calculate and display:

```markdown
### Nutrition Breakdown (Per Serving)

| Ingredient | Grams | Cal | Protein | Fat | Carbs |
|------------|-------|-----|---------|-----|-------|
| Chicken breast | 200g | 220 | 41g | 4.8g | 0g |
| Vegetables | 150g | 50 | 3g | 0g | 10g |
| Olive oil | 1 tbsp | 119 | 0g | 14g | 0g |
| ... | ... | ... | ... | ... | ... |
| **TOTAL** | — | **XXX** | **XXg** | **XXg** | **XXg** |
```

### Verify against limits:

```
Diet Plan Check:
├── Calories: XXX (XX% of 1,900) [✅/⚠️/❌]
├── Protein: XXg (target: 50g) [✅/⚠️/❌]
├── Fat: XXg (limit: 21g) [✅/⚠️/❌]
└── Status: APPROVED / NEEDS REVISION
```

---

## Variant Naming Convention

```
variant_label: "Light"     — No carbs, meat + veg
variant_label: "Moderate"  — Default (is_default = TRUE)
variant_label: "Balanced"  — With rice/potato
```

The dropdown displays:
```
[Thai Green Curry ▾]
├── Moderate ← (default, shown first)
├── Light
└── Balanced
```

---

## What Gets Variants (And What Doesn't)

### DO Create Variants For:
- Dinner recipes (most flexibility needed)
- Lunch recipes (moderate flexibility)
- Recipes with natural carb add-ons (rice, potato, naan)
- Curries, stir-fries, roasts, stews

### DO NOT Create Variants For:
- **Cheat meals** (is_cheat = TRUE) — treats, not for optimization
- Breakfast items (already designed for specific macros)
- Recipes under 400 calories (already light)
- Recipes where carb removal breaks the dish

---

## Creating a Recipe Family

### Step 1: Design Moderate Version First
- Full protein (200g meat/fish per person)
- Balanced vegetables
- Moderate fat (≤21g per serving)
- Mark as `is_default = TRUE`

### Step 2: Create Light Version
Remove carbs, keep everything else:
```
Moderate: Chicken Curry + Rice = 650 cal | 50g P | 18g F
Light:    Chicken Curry (no rice) = 450 cal | 50g P | 18g F
          Reduction: -200 cal (removed rice)
          Protein: UNCHANGED ✓
```

### Step 3: Create Balanced Version (if needed)
Add carbs to Moderate:
```
Moderate: Chicken Curry = 450 cal | 50g P | 18g F
Balanced: Chicken Curry + Rice + Naan = 750 cal | 52g P | 22g F
          Addition: +300 cal (rice + naan)
```

### Step 4: Verify All Variants

| Check | Light | Moderate | Balanced |
|-------|-------|----------|------|
| Protein ≥45g | ✓ | ✓ | ✓ |
| Fat ≤25g | ✓ | ✓ | ✓ |
| Meaningful calorie difference | — | +150 | +150 |

---

## Database Structure

```sql
-- Recipe Family
INSERT INTO recipe_families (id, family_name, description) VALUES
(X, 'Thai Green Curry', 'Aromatic Thai curry - Light no rice, Moderate default, Balanced with rice');

-- Link variants (Moderate is default)
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(X, [moderate_id], TRUE, 'Moderate', 1),
(X, [light_id], FALSE, 'Light', 2),
(X, [balanced_id], FALSE, 'Balanced', 3);
```

---

## Example: Thai Green Curry Family

| Variant | Chicken | Rice | Cal | Protein | Fat |
|---------|---------|------|-----|---------|-----|
| **Light** | 200g pp | None | 395 | 47g | 10g |
| **Moderate** | 200g pp | 75g | 590 | 51g | 10g |
| **Balanced** | 200g pp | 100g + cashews | 720 | 54g | 17g |

All variants: Same chicken, same sauce. Only carbs change.

---

## Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| Making "Light" vegetarian | Protein drops 30g+ | Keep same meat |
| Adding butter for flavor | +100 cal, +12g fat per tbsp | Use herbs, spices, acid instead |
| Using full-fat coconut milk | 24g fat per 100ml | Use lite coconut milk |
| Forgetting cooking oil in calculations | +120 cal per tbsp | Always count it |
| Serving sizes too small | Won't hit 50g protein | 200g meat/fish minimum |
| Creating variants with <150 cal difference | Not meaningful choice | At least 150 cal gap |

---

## Approved Swaps (When User Requests)

| Original | Swap | Calorie Impact | Protein Impact |
|----------|------|----------------|----------------|
| Jasmine rice | Cauliflower rice | -180 cal | Same |
| Chicken thigh | Chicken breast | -30 cal | +5g protein |
| Full coconut milk | Lite coconut milk | -150 cal | Same |
| Beef mince | Turkey mince | -80 cal | +2g protein |
| Butter | Olive oil | Same cal | Same |
| Naan bread | Skip it | -250 cal | -6g protein |

---

## Quick Reference Card

```
VARIANT RULES:
├── Light:    Meat + Veg, NO carbs (~500 cal, 50g P)
├── Moderate: Meat + Veg, moderate (~600 cal, 50g P)  [DEFAULT]
└── Balanced: Meat + Carbs (rice/potato) (~700 cal, 50g P)

PER MEAL LIMITS:
├── Calories: ~550-650 (flexible)
├── Protein:  ≥45g (non-negotiable)
├── Fat:      ≤25g (strict)
└── Carbs:    Flexible (this is the lever)

NEVER:
├── Vegetarian as "Light" (protein too low)
├── >25g fat per serving
├── <45g protein per serving
├── Seed oils (canola, vegetable, sunflower)
└── Butter bombs (>1 tbsp per serving)
```

---

## Integration with Meal Planning

When users plan meals:
1. They see the recipe card with variant dropdown
2. Based on their day's goals, they select appropriate tier
3. Shopping list pulls ingredients for selected variant
4. Calorie totals update automatically

This enables **flexible dieting** — same delicious meals, adjusted to daily needs while maintaining protein targets.

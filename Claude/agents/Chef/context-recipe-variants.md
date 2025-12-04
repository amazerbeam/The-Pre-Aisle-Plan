# Recipe Variants Context (Light / Standard / Full)

## Overview

FoodBytes uses a **calorie-tier variant system** to support flexible meal planning. Users can choose different versions of the same meal based on their daily calorie budget.

This system is implemented through **Recipe Families** (FR-043).

## The Three Tiers

| Tier | Label | Calorie Target | When User Chooses This |
|------|-------|----------------|------------------------|
| **Light** | "Light" | ~400-500 cal | Big breakfast/lunch, calorie-saving day |
| **Standard** | "Standard" (default) | ~550-700 cal | Normal day, balanced eating |
| **Full** | "Full" | ~750-900 cal | Light eating earlier, training day, higher energy needs |

## How Tiers Are Created

### Light Version (Reduce ~200-300 cal from Standard)
- Remove carb base (rice, potato, naan)
- Use leaner protein (tofu instead of chicken, chicken instead of beef)
- Reduce calorie-dense ingredients (oils, nuts, cheese)
- Keep portion sizes reasonable
- **Protein must stay ≥25g** — satiety is non-negotiable

### Standard Version (Default)
- The "normal" version of the recipe
- Balanced macros
- Moderate carb inclusion
- Standard protein (chicken, fish, moderate beef)
- This is what most users will eat most days

### Full Version (Add ~150-250 cal to Standard)
- Add carb base (rice, potato, naan, bread)
- Can use fattier protein cuts
- Full portions of all components
- Good for active days or when earlier meals were light
- **Not an excuse to overeat** — still a defined portion

## Variant Naming Convention

Use this format for variant labels in the database:

```
variant_label: "Light"
variant_label: "Standard"  (is_default = TRUE)
variant_label: "Full"
```

The dropdown will display:
```
[Curry Night ▾]
├── Light
├── Standard ← (default, shown first)
└── Full
```

## What Gets Variants (And What Doesn't)

### DO Create Variants For:
- Dinner recipes (most flexibility needed)
- Lunch recipes (moderate flexibility)
- High-calorie recipes that could be lightened
- Recipes with natural carb add-ons (rice, potato, bread)

### DO NOT Create Variants For:
- **Cheat meals** (is_cheat = TRUE) — these are treats, not for optimization
- Simple breakfast items (already portion-controlled)
- Recipes under 400 calories (already "light")
- Snacks

## Creating a Recipe Family

When the Chef agent creates recipe variants:

### Step 1: Identify the Standard Version
- This is usually the existing recipe
- Should be a complete, satisfying meal
- Mark as `is_default = TRUE`

### Step 2: Create Light Version
Calculate reductions:
```
Standard: Chicken Curry + Rice = 750 cal
Light:    Chicken Curry (no rice) = 550 cal
          Reduction: -200 cal (removed 180g cooked rice)
```

Modifications to consider:
- Remove starch (rice -200 cal, potato -150 cal, naan -250 cal)
- Swap protein (beef→chicken -50 cal, chicken→tofu -80 cal)
- Reduce oil by 1 tbsp (-120 cal)

### Step 3: Create Full Version
Calculate additions:
```
Standard: Chicken Curry (no rice) = 550 cal
Full:     Chicken Curry + Rice + Naan = 850 cal
          Addition: +300 cal (rice + half naan)
```

Modifications to consider:
- Add starch (rice +200 cal, potato +150 cal)
- Use full-fat ingredients
- Add sides (naan, bread)

### Step 4: Verify Protein Consistency
All three versions should have similar protein (within 10g):
```
Light:    28g protein ✓
Standard: 32g protein ✓
Full:     35g protein ✓
```

If Light version protein drops significantly, add protein (extra egg, Greek yogurt, etc.)

## Database Structure

```sql
-- Recipe Family
INSERT INTO recipe_families (id, family_name, description) VALUES
(X, 'Curry Night', 'Aromatic curry - available in Light, Standard, and Full portions');

-- Link variants (Standard first, is_default)
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(X, [standard_id], TRUE, 'Standard', 1),
(X, [light_id], FALSE, 'Light', 2),
(X, [full_id], FALSE, 'Full', 3);
```

## Calorie Accuracy Requirements

When creating variants, the Chef agent MUST:

1. **Calculate actual calories** — don't estimate
2. **Document the difference** — show what changed between variants
3. **Keep differences meaningful** — at least 150 cal between tiers
4. **Maintain recipe integrity** — Light version should still taste good, not be a sad portion

## Example: Stir Fry Family

| Variant | Modifications | Calories | Protein |
|---------|---------------|----------|---------|
| **Light** | Tofu, no rice, 1 tbsp oil | ~450 | 25g |
| **Standard** | Chicken, no rice, 2 tbsp oil | ~585 | 35g |
| **Full** | Chicken + jasmine rice, 2 tbsp oil | ~785 | 38g |

## Integration with Meal Planning

When users plan meals:
1. They see the recipe card with dropdown
2. Based on their day's eating, they select appropriate tier
3. Shopping list pulls ingredients for selected variant
4. Calorie totals update automatically

This enables **flexible dieting** — same delicious meals, adjusted to daily needs.

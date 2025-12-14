# Nutrition Guidelines

Flexible guidance for creating balanced recipes. The Nutrition Agent (`agent-nutrition`) is the authority — defer to it for nutrition questions.

## Core Principle

**There are no hard limits. The user controls their intake through portion selection.**

The Chef creates balanced, delicious recipes with accurate macro information. The user picks the variant (Light/Standard/Full) that fits their goals.

## Reference Ranges (Not Limits)

These are typical ranges for balanced meals — not pass/fail criteria.

| Macro | Typical Range | Notes |
|-------|---------------|-------|
| Calories | 450-800 per serving | Varies by variant |
| Protein | 40-65g per serving | Higher is generally good |
| Fat | 15-35g per serving | Depends on the dish |
| Carbs | 30-80g per serving | Varies by variant |

## What Makes a Balanced Recipe

| Element | Guidance |
|---------|----------|
| **Protein** | Include a solid protein source (~150g meat/fish for Standard) |
| **Vegetables** | Generous portion, at least 1 cup |
| **Carbs** | Appropriate to the dish (rice, potato, bread, pasta) |
| **Fats** | Use quality fats (butter, olive oil), reasonable amounts |

## Macro Calculation

Calculate and display macros for EVERY recipe:

```
### Nutrition (Per Serving - Standard)
| Cal | Protein | Fat | Carbs |
|-----|---------|-----|-------|
| 650 | 50g | 22g | 60g |
```

For variant families, show all three:

```
| Variant | Cal | Protein | Fat | Carbs |
|---------|-----|---------|-----|-------|
| Light | 500 | 40g | 18g | 45g |
| Standard | 650 | 50g | 22g | 60g |
| Full | 800 | 65g | 28g | 75g |
```

## Daily Context (For Reference)

Users typically eat 3 meals, no snacking. Daily targets vary by goal:

| Goal | Daily Calories | Protein | Fat | Carbs |
|------|----------------|---------|-----|-------|
| Weight Loss | ~1,800 | 130-150g | 50-60g | 180-200g |
| Maintenance | ~2,200-2,400 | 150-180g | 65-95g | 240-300g |
| Weight Gain | ~2,600-2,800 | 170-200g | 80-100g | 300-350g |

**The user's goal determines which variant they pick — not which recipes they can eat.**

## Higher-Fat Recipes

Some recipes are naturally higher in fat. This is fine:

| Recipe Type | Expected Fat | How to Handle |
|-------------|--------------|---------------|
| Salmon dishes | 20-30g | Note it pairs well with lighter meals |
| Creamy curries | 25-35g | Use full-fat coconut if it makes a better dish |
| Dishes with cheese | 20-30g | Reasonable amounts, good quality |

**Don't artificially restrict a dish to hit arbitrary limits. Make good food.**

## Fat Sources Reference

| Source | Fat per Unit | Notes |
|--------|--------------|-------|
| Olive oil (1 tbsp) | 14g | Quality cooking fat |
| Butter (1 tbsp) | 12g | Great for flavor |
| Full coconut milk (100ml) | 24g | Use when dish needs it |
| Lite coconut milk (100ml) | 6g | Use when full isn't needed |
| Salmon (150g) | 20g | Healthy fats |
| Chicken thigh skin-on (150g) | 12g | More flavor than breast |

## What To Avoid

| Don't | Why |
|-------|-----|
| Treat a recipe as "failed" because fat is 28g | There's no failure — just accurate information |
| Force lite coconut milk when full-fat is better | Make good food, report the macros |
| Add unnecessary fat just because | Don't be excessive either direction |
| Skip macro calculation | Always provide the numbers |

## Defer to Nutrition Agent

For questions about:
- Daily limits
- Macro ratios
- Health conditions
- "Is this too much?"

Use the Task tool to consult the Nutrition Agent:
```
Task(subagent_type="agent-nutrition", prompt="[question]")
```

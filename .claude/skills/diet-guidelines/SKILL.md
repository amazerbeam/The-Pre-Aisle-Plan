---
name: diet-guidelines
description: Apply 2026 evidence-based weight-loss diet standards from WHO, NIH/NHLBI, USDA, Mayo Clinic, Harvard T.H. Chan, and Cochrane when creating recipes, designing meal plans, evaluating macros, or advising on diet patterns. Use when the user asks about weight loss, diet plans, recipe macros, Mediterranean / high-protein / intermittent-fasting patterns, GLP-1 lifestyle pairing, or whether a recipe meets nutritional targets.
license: Apache-2.0
metadata:
  author: foodbytes
  version: "1.0"
  model: inherit
allowed-tools: Read, Grep, Glob
---

# Diet Guidelines (2026)

Evidence-based reference for weight-loss diet decisions in the FoodBytes app. Sourced from official bodies only — WHO, USDA, NIH/NHLBI, Mayo Clinic, Harvard T.H. Chan, Cochrane. Pair with `CLAUDE.md` recipe targets — this skill explains the *why* behind those numbers and the patterns that produce them.

## Use when
- Creating, editing, or reviewing recipes for macro/calorie compliance
- Designing or critiquing a meal plan (Light / Moderate / Balanced)
- User asks "is this diet good for weight loss?" or compares patterns
- Tagging recipes by pattern (Mediterranean, high-protein, TRE-friendly)
- Discussing user/wife weight progress or plan adjustments

## Do not use when
- Question is purely culinary (technique, flavour, substitutions) with no nutrition framing
- Medical/clinical advice beyond diet pattern guidance — defer to a clinician
- Designing for a non-weight-loss goal (athletic performance, pregnancy, paediatrics)

## Core principles (every official source agrees)
1. **Calorie deficit is the mechanism.** Patterns are just delivery systems for sustained adherence.
2. **Protein + fibre drive satiety.** Both should be high in every meal.
3. **Adherence beats optimality.** A "perfect" diet the user abandons loses to a good one they sustain.
4. **Preserve lean mass.** Pair deficit with resistance training and adequate protein, or fat loss becomes muscle loss.
5. **Avoid crash restriction.** Harvard T.H. Chan: very-low-calorie diets cause muscle loss, metabolic slowdown, and regain.

## Recipe macro targets (from `CLAUDE.md`, restated for context)
| Variant | kcal/serving | Protein | Fat % kcal | Carbs % kcal |
|---|---|---|---|---|
| Light | 450–550 | ≥35 g | 25–35 % | 40–50 % |
| Moderate | 550–650 | ≥35 g | 25–35 % | 40–50 % |
| Balanced | 700–800 | ≥35 g | 25–35 % | 40–50 % |

Reject if Light >600, Moderate >750, Balanced >900, protein <35 g, fat >35 % kcal, or carbs <38 % kcal. Compute on **whole recipe including linked-recipe extras**, not direct ingredients only — stored kcal totals are unreliable.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, **scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision** — including rules added after this skill was written. Common matches for this skill: linked-recipe extras (prorated macros for pita / dough / sauce sub-components), gout substitutions, ingredient-quality constraints. See `.claude/rules/README.md` for the index.

## Diet patterns — when to recommend each

### Mediterranean
Vegetables, fruit, whole grains, legumes, nuts, fish, olive oil; limit red meat and ultra-processed food. **Strongest long-term evidence**: 2× higher odds of maintenance; −4 to −10 kg at 12+ months when energy-restricted. Default recommendation for most users.

### High-protein (USDA 2025–2030, Jan 2026)
1.2–1.6 g protein per kg bodyweight/day, 25–40 g per meal. Reduces ghrelin, raises GLP-1/PYY, preserves lean mass, prevents regain at 6–12 months. Aligns with the ≥35 g/serving target.

### Time-restricted eating (TRE) / intermittent fasting
8–10 h eating window. Cochrane 2026: **no clinically meaningful advantage** over standard calorie restriction. Early TRE beats late by ~1.15 kg. Recommend only as an adherence tool, never as the primary mechanism.

### Mayo Clinic Diet
Two-phase (2-week reset → lifelong). NIH/NHLBI: structured supervised programs significantly outperform DIY for *maintenance*. Useful framing for users who want scaffolding.

### Lifestyle + GLP-1 (WHO Dec 2025)
GLP-1 medication is **adjunct to** diet/activity/behavioural support, not a substitute. ≥6-month continuous use with weekly counselling. Mention only if user raises medication; never recommend pharmacotherapy unprompted.

## Health constraints (project-specific)
From `CLAUDE.md` — apply automatically:
- **Gout history**: avoid organ meats, anchovies, fish sauce, sardines; moderate red meat, shellfish, oyster sauce, yeast extract. Prefer chicken/turkey over beef. Sub fish sauce → soy sauce.
- **Quality fats only**: butter, olive oil, ghee — not seed-oil blends.
- **Clean ingredients**: pure tamarind block over jarred paste with stabilizers.

## Approach when invoked
1. Identify the decision: recipe creation, plan review, pattern recommendation, or macro audit.
2. Apply core principles + macro targets first; pattern choice second.
3. If recipe fails targets, redesign — common levers: air-fry vs pan-fry, egg whites for whole eggs, add starch (toast/potato/rice) for carbs, scale lean protein.
4. Cite the source body (WHO / USDA / Cochrane / Mayo / Harvard) when making a claim, so the user can verify.
5. Flag conflicts with gout/quality-fats constraints before suggesting an ingredient.

## Output
- For recipe review: target table with computed vs required, pass/fail per row, and concrete fix suggestions.
- For pattern recommendation: 2–4 sentence plain-English explanation + which user goal it fits + one caveat.
- For plan critique: adherence risk, satiety risk, lean-mass risk — in that order.

## Sources
- WHO GLP-1 obesity guideline (Dec 2025)
- USDA Dietary Guidelines for Americans 2025–2030 (Jan 2026)
- NHLBI Obesity Education Initiative clinical guidelines
- Mayo Clinic Diet (mayoclinic.org)
- Harvard T.H. Chan School of Public Health — nutrition source
- Cochrane review on intermittent fasting (2026)
- Systematic reviews: Mediterranean diet long-term weight loss (Am J Med); high-protein mechanisms (PMC7539343)

## Success criteria
- Every macro claim cites the source body or `CLAUDE.md` target
- Recipe verdicts compute against the full ingredient + linked-recipe set, not stored kcal
- Gout and quality-fats constraints applied without being asked
- Pattern recommendations distinguish *mechanism* (deficit) from *delivery* (pattern)
- No pharmacotherapy advice unless user raised it

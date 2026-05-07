# Shared Rules

Topic-scoped rules that apply across the FoodBytes project. Any skill, agent, or `CLAUDE.md` reference can pull from here — the goal is one canonical statement of each rule, reused everywhere.

## Convention

- One topic per file. Filename = kebab-case slug of the topic (e.g. `linked-recipe-extras.md`).
- Each rule file should state: **what the rule is**, **why it exists**, **when to enforce**, **how to verify**, **reject conditions**.
- Skills reference rules via path: `.claude/rules/<file>.md`. They are *not* auto-loaded — the skill's `SKILL.md` must instruct Claude to Read the relevant rule file.

## How skills use this folder

In a `SKILL.md`, include a "Shared rules" section that lists relevant rule files by topic. Example:

```markdown
## Shared rules (read on demand)
Before answering, Read any rule file whose topic matches the decision:
- Linked-recipe extras → `.claude/rules/linked-recipe-extras.md`
- Gout substitutions  → `.claude/rules/gout-substitutions.md`
```

When adding a new skill, audit this folder first and wire any matching rules into the skill's "Shared rules" section.

## When to add a new rule here vs. inside a skill

- **Here** — the rule is about project data, schema, conventions, or constraints that more than one workflow could touch (recipe integrity, ingredient quality, DB schema rules, gout/health constraints).
- **Inside a skill** — the rule only makes sense within that skill's narrow domain (e.g. "how to phrase a Mediterranean-pattern recommendation" belongs in `diet-guidelines`, not here).

## Index

- [linked-recipe-extras.md](linked-recipe-extras.md) — sub-components (pita, dough, sauce) must be linked, not inlined; `quantity_grams` = portion used, not linked recipe's total yield.
- [recipe-variants.md](recipe-variants.md) — every recipe must ship with three variants in a family: Light (lower-cal), Moderate (default), Balanced (higher-cal).
- [homemade-first-and-ingredient-dedup.md](homemade-first-and-ingredient-dedup.md) — link to sub-recipes (Bread, Pita, Dough) instead of using raw ingredients; always dedupe ingredients (no `Banana`/`Bananas` splits) before inserting.

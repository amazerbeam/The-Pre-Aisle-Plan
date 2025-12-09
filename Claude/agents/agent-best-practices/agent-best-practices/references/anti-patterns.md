# Anti-Patterns

Common mistakes to avoid when creating agent files.

## Monolithic Files

❌ **Problem:** Everything in one 2,000+ word file

```markdown
# My Agent
[800 words of instructions]
[500 words of examples]  
[400 words of domain knowledge]
[300 words of edge cases]
```

✅ **Fix:** Split into agent file + references

```
my-agent/
├── SKILL.md           # 600 words - core only
└── references/
    ├── examples.md
    ├── domain-guide.md
    └── edge-cases.md
```

## Listing Known Knowledge

❌ **Problem:** Documenting things the model already knows

```markdown
### Italian Cuisine
- Fresh pasta (flour, eggs, olive oil)
- Risotto technique (toast, deglaze, gradual stock)
- Proper tomato sauces (San Marzano, garlic, basil)
```

✅ **Fix:** Point to dynamic lookup

```markdown
## Cuisine Expertise
Specializes in Italian, Chinese, Thai, Indian, French, Japanese, Mexican.
Use WebSearch for authentic regional techniques when uncertain.
```

## Duplicating Rules

❌ **Problem:** Same rule in multiple places

```markdown
## Philosophy
Never use seed oils...

## Ingredients
Banned: seed oils...

## DO NOT
Use seed oils...
```

✅ **Fix:** Single source of truth

```markdown
## Banned Ingredients
Canola oil, vegetable oil, soybean oil, corn oil...
```

## Style Rules for Linters

❌ **Problem:** Using prompts for what tools can enforce

```markdown
- Use 2-space indentation
- Always use semicolons
- Sort imports alphabetically
- Maximum line length 80 chars
```

✅ **Fix:** Reference tooling

```markdown
Run `npm run lint` before committing. Style rules in .eslintrc.
```

## Negative-Only Instructions

❌ **Problem:** Agent gets stuck with no alternative

```markdown
Never use the --force flag.
```

✅ **Fix:** Provide alternative

```markdown
Avoid --force flag. Use --force-with-lease for safer force pushes.
```

## Vague Reference Links

❌ **Problem:** Claude may ignore unclear pointers

```markdown
See references/guide.md for more info.
```

✅ **Fix:** Explain when and why

```markdown
Before generating SQL, read `references/schema.md` to verify 
current table structure and required fields.
```

## Overloaded DO/DO NOT

❌ **Problem:** 20+ items mixing universal and specific

```markdown
**DO NOT:**
- Use seed oils
- Skip tests
- Use var instead of const
- Forget semicolons
- Use any database without checking schema
- Deploy on Fridays
- ... (15 more items)
```

✅ **Fix:** Universal in agent file, specific in references

```markdown
# SKILL.md
**DO NOT:**
- Use seed oils
- Skip tests
- Skip validation

# references/database-rules.md
**DO NOT:**
- Use any database without checking schema
```

## Missing Trigger Conditions

❌ **Problem:** References listed without context

```markdown
## References
- schema.md
- examples.md
- edge-cases.md
```

✅ **Fix:** Explain when to use each

```markdown
## References
| File | When to Use |
|------|-------------|
| `references/schema.md` | Before any database operation |
| `references/examples.md` | When unsure of output format |
| `references/edge-cases.md` | When standard workflow doesn't fit |
```
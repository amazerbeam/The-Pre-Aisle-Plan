# Database Schema

Reference for generating SQL inserts.

## Before Writing SQL

**Always** read `foodbytes-app/database/seed.sql` to:
- Verify current table structure
- Check existing ID patterns
- Understand required fields
- See relationship structure

## Basic Insert Pattern

```sql
-- Recipe: [Name]
INSERT INTO recipes (id, name, cuisine, prep_time, cook_time, servings, difficulty, description)
VALUES ([next_id], '[name]', '[cuisine]', [prep_min], [cook_min], [servings], '[difficulty]', '[description]');

INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit, preparation)
VALUES
([recipe_id], '[ingredient]', [qty], '[unit]', '[prep notes]'),
([recipe_id], '[ingredient]', [qty], '[unit]', '[prep notes]');

INSERT INTO recipe_instructions (recipe_id, step_number, instruction)
VALUES
([recipe_id], 1, '[step 1]'),
([recipe_id], 2, '[step 2]');
```

## Recipe Family Insert

For recipes with variants:

```sql
-- Recipe Family
INSERT INTO recipe_families (id, family_name, description) VALUES
(X, '[Family Name]', '[Description]');

-- Link variants
INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order) VALUES
(X, [standard_id], TRUE, 'Standard', 1),
(X, [light_id], FALSE, 'Light', 2),
(X, [full_id], FALSE, 'Full', 3),
(X, [cheat_id], FALSE, 'Cheat', 4);
```

## Checklist Before Insert

- [ ] Read seed.sql for current schema
- [ ] Use next available ID
- [ ] Include all required fields
- [ ] Escape single quotes in text
- [ ] Link variants to family if applicable

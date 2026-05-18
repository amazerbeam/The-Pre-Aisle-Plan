# Structure Guide

Templates and folder structure for building agent files.

## Folder Structure

```
agent-name/
├── SKILL.md                    # Core agent file (required)
├── references/                 # On-demand knowledge
│   ├── domain-guide.md         # Domain-specific details
│   ├── rules-[context].md      # Context-specific rules
│   └── examples/
│       ├── good-output.md
│       └── bad-output.md
├── assets/                     # Output resources (not loaded)
│   └── template.md
└── scripts/                    # Executable tools
    └── validate.py
```

## File Purposes

| Directory | Purpose | When Loaded |
|-----------|---------|-------------|
| `SKILL.md` | Core instructions | Always (when agent triggered) |
| `references/` | Knowledge to read while working | On-demand per task |
| `assets/` | Templates copied to output | Never loaded into context |
| `scripts/` | Executable code | Run without reading |

## Agent File Sections

1. **Frontmatter** — name, description, version, tools
2. **Identity** — 1-2 sentence statement
3. **Core Philosophy** — 3-5 bullets
4. **Domain Rules** — Universal hard rules only
5. **Workflow** — Numbered steps with reference pointers
6. **Output Format** — Minimal template
7. **DO/DO NOT** — 5-7 universal items each
8. **References** — Index with trigger conditions

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | kebab-case identifier |
| `description` | Yes | 1-2 sentences for discovery |
| `version` | Recommended | Semantic versioning (1.0.0) |
| `tools` | Recommended | List of allowed tools |

## Linking to References

### Good: Explain When and Why

```markdown
When inserting records, first read `references/database-schema.md`
to verify current table structure.
```

### Bad: Just Mention Path

```markdown
See references/guide.md for more info.
```

## Naming Conventions

- Agent folders: `kebab-case-name/`
- Agent files: `SKILL.md` (uppercase)
- References: `kebab-case.md` (lowercase)
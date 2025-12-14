# Decision Framework

How to decide what goes in the agent file vs. reference files.

## The Core Question

> "Does this apply to every single task this agent will do?"

- **YES** → Agent file
- **NO** → Reference file

## Decision Matrix

| Question | YES → | NO → |
|----------|-------|------|
| Applies to every task? | Agent file | Reference |
| Agent fails without this? | Agent file | Reference |
| Static/unchanging rule? | Agent file | Reference or lookup |
| Under 50 words? | Agent file | Reference |
| Domain knowledge? | Reference | Agent file (if rule) |
| Code example? | Reference | Agent file (if critical) |
| Context-specific rule? | Reference | Agent file |

## Content Placement

### Agent File (Always Loaded)

✅ **Include:**
- Identity (1-2 sentences)
- Core philosophy (3-5 bullets)
- Universal hard rules
- Workflow steps with pointers
- Minimal output template
- Universal DO/DO NOT

❌ **Exclude:**
- Knowledge the model already has
- Context-specific rules
- Extended examples
- Dynamically lookupable info
- Linter-enforceable style rules

### Reference Files (On-Demand)

✅ **Include:**
- Domain-specific knowledge
- Context-specific DO/DO NOT
- Extended examples
- Database schemas
- API documentation
- Detailed guides

### Assets (Never Loaded)

✅ **Include:**
- Templates
- Boilerplate code
- Images, fonts
- Sample documents

## DO/DO NOT Placement

### Universal Rules → Agent File

```markdown
**DO NOT:**
- Ever use seed oils
- Skip validation step
```

### Context-Specific → Reference

```markdown
# references/database-rules.md

**DO NOT:**
- Assume ID patterns
- Insert without verifying foreign keys
```

## Examples Placement

| Type | Location |
|------|----------|
| Output template (skeleton) | Agent file |
| Complete output example | `references/examples/` |
| Code examples | `references/examples/` |
| Bad examples | `references/examples/` |
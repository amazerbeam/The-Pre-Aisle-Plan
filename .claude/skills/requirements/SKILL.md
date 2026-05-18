---
name: requirements
description: Produce a per-task requirement / spec document for FoodBytes work before any code is written. Use when the user asks to "write a requirement", "draft a spec", "create a requirement doc", "document this feature/change before implementing", or wants a SPEC.md-style brief for a task before coding starts.
allowed-tools: Read, Grep, Glob, Write, AskUserQuestion
metadata:
  type: integration
  author: foodbytes
  version: "1.0"
---

# Requirements (FoodBytes)

Produce a single, scannable requirement document for one task — the artifact a fresh Claude session will implement against. Output goes to `.docs/requirement-<kebab-slug>-<YYYY-MM-DD>.md`. The skill **interviews first, writes second**, and refuses to ship a doc whose success criteria can't be made concrete.

This is a per-task spec. It is **not** a plan (no implementation steps), **not** a CLAUDE.md edit, and **not** a skill file.

## Use when

- User asks to write a requirement, draft a spec, or document a change before coding.
- A non-trivial feature, migration, refactor, or bug fix is about to start and needs a clean brief.
- The user wants a SPEC.md-style document a fresh session can pick up against.

## Do not use when

- The change is one-line / one-file obvious — just do it.
- The user is editing `CLAUDE.md`, `.claude/rules/`, or another skill — those have their own conventions.
- The user wants an *implementation plan* (use plan mode instead).

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before writing the requirement, **Glob `.claude/rules/*.md` and Read any file whose topic matches** — recipes / ingredients / macros / migrations / variants / linked-recipe extras / homemade-first. Cite the matching rule by path inside the requirement's **Constraints** section so the implementing session loads it. See `.claude/rules/README.md` for the index.

## Workflow

### 1. Interview (mandatory unless the user already supplied every section)

Use `AskUserQuestion` to fill gaps. Don't ask obvious questions (the user already told you the headline). Dig into the parts most likely to bite:

- **Definition of done.** What's the verifiable signal? A passing test, a screenshot match, a SQL query that returns a specific row count?
- **Out of scope.** What looks adjacent but the user does *not* want touched?
- **Constraints.** Compat targets, libraries banned/required, perf budget, security implications, data-migration risk.
- **Reference patterns.** "Is there an existing component / endpoint / migration we should mirror?"
- **Affected blast radius.** Backend only? Frontend? DB schema? All three?

Cap the interview at ~4 questions per round. Two rounds max — if the answers still aren't concrete, **stop and tell the user the requirement isn't ready** rather than padding the doc.

### 2. Scan the repo for grounding

Before writing, do a light pass — don't deep-explore:

- Glob/Grep to confirm any file paths the user mentioned actually exist.
- If the task touches recipes / ingredients / migrations, Read the matching `.claude/rules/*.md`.
- Read existing reference files the user pointed at, just enough to capture a `path:line` anchor.

Do **not** read more than ~5 files at this stage. The requirement is a brief, not a research report.

### 3. Write the document

Path: `.docs/requirement-<kebab-slug>-<YYYY-MM-DD>.md`. Use today's date (the harness provides `currentDate`). Slug from the headline, kebab-case, ≤6 words.

Sections, in order. **Omit any section that has no content** — empty boilerplate is worse than nothing.

```markdown
# <Title>

**Date:** YYYY-MM-DD
**Status:** Draft

## Problem / motivation
<2–4 sentences. The WHY. What's broken or missing, who's affected, why now.>

## Scope
**In scope**
- …
**Out of scope / non-goals**
- …

## Success criteria
<Concrete and verifiable. Each bullet must be checkable by a command, a test, a query,
or a screenshot diff. No "looks good", no "feels right".>
- …

## Reference patterns
<file:line pointers to existing code the implementer should mirror. No inlined snippets.>
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeController.java:42` — pagination shape to copy
- `foodbytes-app/client/src/components/mealplan/WeekView.jsx:118` — date-picker pattern

## Constraints
<Libraries allowed/forbidden, perf budget, compat, security, data-migration safety.
Cite any matching `.claude/rules/<file>.md` by path.>
- …

## Affected files / modules
<Best-effort — the implementer will refine.>
- …

## Verification commands
<Exact commands the implementer will run. Pull from the stack hints below where relevant.>
```bash
cd foodbytes-app/foodbytes-api && mvn test -Dtest=<ClassName>
cd foodbytes-app/client && npm run build
```

## Open questions
<Anything still ambiguous. If this section is long, the requirement isn't ready.>
- …
```

#### Stack hints to surface in **Verification commands** when relevant

| Surface | Command |
|---|---|
| Backend unit/integration | `cd foodbytes-app/foodbytes-api && mvn test` (or `-Dtest=ClassName#method` for one) |
| Frontend build | `cd foodbytes-app/client && npm run build` |
| Frontend dev server | `cd foodbytes-app/client && npm run dev` |
| DB schema change | New file under `foodbytes-app/database/migrations/<YYYY-MM-DD>_<slug>.sql`, applied manually to Railway MySQL |
| Full stack via Docker | `docker-compose up --build` (root compose file) |

### 4. Hand off

After writing, output exactly one line pointing at the file, then suggest the user **start a fresh Claude session** and reference the doc with `@.docs/<filename>`. Clean context + written spec is Anthropic's recommended hand-off pattern.

## Reject conditions (stop and re-interview)

- Success criteria are vague ("works correctly", "looks better", "is faster") with no command, test, or visual to check against.
- Scope is unbounded ("clean up the meal plan area").
- The "requirement" is really a plan — bullets describe steps, not outcomes.
- Two rounds of interview have not produced a concrete definition of done.

If any of these triggers, tell the user what's missing in one or two sentences and stop. Don't ship a fluffy doc.

## Anti-patterns (do not do)

- **Restating the prompt.** If the doc only repeats what the user said, the interview was skipped.
- **Inlining code.** Use `path:line` references; snippets rot.
- **Implementation steps.** "First do X, then Y" belongs in plan mode, not here.
- **Empty sections.** Omit any heading that has no content.
- **Long prose.** Bullets and short sentences. Tables where they help.
- **Padding with `.claude/rules/` summaries.** Cite the rule path; don't copy its contents.

## Success criteria (for this skill)

- File exists at `.docs/requirement-<slug>-<YYYY-MM-DD>.md`.
- Every present section has real content; no empty boilerplate.
- **Success criteria** bullets are each backed by a command, test, query, or screenshot.
- **Reference patterns** uses `path:line` anchors only — no inlined snippets.
- Any matching `.claude/rules/*.md` is cited in **Constraints**.
- Hand-off line at the end points the user at a fresh session with `@.docs/<filename>`.

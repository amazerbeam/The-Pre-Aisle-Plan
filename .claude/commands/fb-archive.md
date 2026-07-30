---
description: Archive the completed contract — extract learnings, update rules, and clean up
---

You are the **Archive Agent** for the EIDA implementation pipeline. Close out the current contract, capture learnings, and clean up.

## Step 1: Resolve the plan and read its status

Read `.claude/workflow/plan-resolution.md` and follow **Resolving the target plan**, accepting statuses `COMPLETE` and `BLOCKED`. `$ARGUMENTS` may name the slug directly. The resolved folder is `<plan>`; the slug is `<slug>`. If that file is absent, do not guess: say so, state that plans live at `.claude/contract/<slug>/` as `plan.md` + `tasks.md`, and ask the developer which plan to use.

Then read:
- `<plan>/tasks.md` — check ✓ vs ✗ counts and overall status
- `<plan>/plan.md` — Part 1 for the feature name and acceptance criteria, Part 2 for the technical approach taken
- `<plan>/corrections.md` — **if present**, the developer's corrections logged via `/fb-issue` during this contract. This is the **primary signal** for learnings (Step 3). If absent, the developer logged no corrections — fall back to `tasks.md` ✗ entries and session context.

If no plan resolves, inform the user: "No finished plan to archive."

## Step 2: Generate Session Summary

Analyze the implementation:

1. **Feature**: What was implemented?
2. **Completion**: How many tasks passed (✓) vs failed (✗)?
3. **Acceptance criteria**: Which criteria were met?

## Step 3: Extract Learnings

Order of evidence:

1. **`corrections.md`** (if present) — every block here is a developer-confirmed correction. These are the highest-signal learnings; treat them as authoritative. Note which corrections were already applied to a skill/agent (`Approved & applied: <path>`) vs rejected vs left pending.
2. **`tasks.md` ✗ entries** — task-level failures with their captured reason.
3. **Session context** — anything else surfaced in chat that did not make it into `corrections.md` or `tasks.md`.

For each source, identify:

- **What worked well?** — Patterns, approaches, or decisions that succeeded smoothly
- **What caused failures?** — Root causes of any ✗ tasks (not just symptoms)
- **What was surprising?** — Unexpected issues, missing context, or wrong assumptions in the plan
- **Rule gaps** — Were there edge cases or quality patterns not covered by existing rules?

If `corrections.md` is present and most issues were already applied to skills/agents during the session via `/fb-issue`, Steps 4 and 5 may have little to add — that is fine. Skip them honestly rather than inventing rule updates.

## Step 4: Propose Rule Updates (if needed)

If the session revealed **generalizable** improvements to the development rules, propose specific additions or modifications to:

| File | Type of Update |
|------|---------------|
| `.claude/rules/code-quality.md` | New quality patterns learned |
| `.claude/rules/code-review.md` | New defensive checks discovered |
| `.claude/rules/backend.md` | Backend patterns refined |
| `.claude/rules/frontend.md` | Frontend patterns refined |
| `.claude/rules/architecture.md` | Architecture constraints clarified |

**Rules for proposing updates:**
- Only propose changes that are **generalizable** — not specific to this one feature
- Only propose changes based on **actual issues encountered** — not hypothetical scenarios
- Changes should be **additive or corrective** — don't remove existing rules without strong justification
- Keep rules concise — one or two lines per new rule

**Present all proposed changes to the user and WAIT for explicit approval before making any edits.**

## Step 5: Propose Agent Updates (if needed)

If the pipeline agents (implementer, code-evaluator, defender, qa) could be improved based on this session:

- Did any agent miss something it should have caught?
- Did any agent flag false positives repeatedly?
- Were the agent prompts missing important context?

Propose specific changes to the agent definition files in `.claude/agents/` and **wait for user approval**.

## Step 6: Save Project Memory (if applicable)

If there were significant **non-obvious learnings** about the project (not code patterns — those go in rules), save them to memory:

- New understanding about how the 3 projects interact
- Discovered constraints, limitations, or undocumented behavior
- Decisions that affect future feature work

Only save what would be useful in a future conversation with no memory of this session.

## Step 7: Clean Up

After the user confirms they are satisfied with the summary and any proposed updates, **ask for confirmation before touching any file** — this is the one destructive step in the pipeline, so the prompt comes first, not after the moves:

> "Ready to move corrections to `.claude/lessons/<slug>.md` and archive the plan to `.claude/contract/archive/<slug>/`. Proceed?"

Only once the developer agrees, work through the four steps below. Nothing is deleted — a finished plan becomes history, not a gap.

1. **If `<plan>/corrections.md` exists**, move its content to `.claude/lessons/<slug>.md`, creating `.claude/lessons/` if needed. If that file already holds a trail, **append** to it rather than overwriting — a forced overwrite destroys prior lessons and an unforced move fails mid-cleanup, leaving the folder half-processed. Then remove the now-copied `<plan>/corrections.md`. `.claude/lessons/` stays the single place a post-archive `/fb-issue` appends to, which is why corrections leave the plan folder rather than travelling with it.
2. Create `.claude/contract/archive/` if it does not exist.
3. Check `.claude/contract/archive/<slug>/` **before** moving. If it already exists, stop and report it, or archive to `<slug>-2` (then `-3`, …) — on Windows, moving a folder onto an existing folder of the same name nests it as `archive/<slug>/<slug>/` instead of merging. Once the target is free, **move** the whole plan folder to `.claude/contract/archive/<slug>/` — `plan.md`, `tasks.md`, and `spec.md` if present. Move, never copy: a path that is live in two places drifts.
4. Confirm `.claude/contract/<slug>/` no longer exists, that `.claude/contract/archive/<slug>/plan.md` is the file you just moved (same size and content as the plan you summarised — a pre-existing archived copy would satisfy a bare existence check), and that `.claude/contract/archive/<slug>/<slug>/` does **not** exist.

Other plan folders are untouched — archiving one plan never affects another. Before writing the Step 8 output, enumerate them for the "Other plans still active" line: run the discovery step from `.claude/workflow/plan-resolution.md` over `.claude/contract/` and list each remaining plan's slug and status.

## Step 8: Final Output

```markdown
## Archive Summary

### Feature: [name]
### Status: [COMPLETE | PARTIAL — N of M tasks passed]

### Tasks
- Passed: N ✓
- Failed: M ✗

### Rules Updated
- [list of rule files updated, or "None"]

### Agents Updated
- [list of agent files updated, or "None"]

### Learnings Saved
- [list of memories saved, or "None"]

### Contract
- [MOVED to `.claude/contract/archive/<slug>/` | RETAINED in place — reason]

### Corrections
- [`corrections.md` moved to `.claude/lessons/<slug>.md` | "No corrections logged"]

### Other plans still active
- [slug — Status, one line each, or "None"]

---
Ready for the next `/fb-plan`.
```

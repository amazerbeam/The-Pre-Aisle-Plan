---
description: Execute the implementation contract — Implementer runs every phase end-to-end (writing and running tests as it goes), then [Code-Evaluator + Defender + QA] review in parallel once at the end, then a single combined fix pass + verification round (max 2 rounds)
---

You are the **Orchestrator** for the FoodBytes implementation pipeline. Execute the resolved contract under `.claude/contract/<slug>/` (see Step 1) using 4 specialized agents.

The Implementer subagent works through **all phases end-to-end first**, writing and running tests as the tasks dictate. Reviewers run **in parallel only once at the end**, after the full implementation is complete. Then a **single combined fix pass** addresses any issues, followed by one verification round (max 2 rounds total).

Reviewers **always run as parallel subagents** in a single Agent dispatch — never sequentially.

## Step 1: Resolve the plan and load the contract

Read `.claude/workflow/plan-resolution.md` and follow **Resolving the target plan**, accepting statuses `PLANNED`, `IN PROGRESS`, and `BLOCKED`. `$ARGUMENTS` may name the slug directly. The resolved folder is `<plan>` for the rest of this document — state which plan you resolved before doing any work. If that file is absent, do not guess: say so, state that plans live at `.claude/contract/<slug>/` as `plan.md` + `tasks.md`, and ask the developer which plan to use.

**Then move the ticket to `Coding` — before anything else.** The slug is the only prerequisite (it carries the key), so this is the first action `/fb-apply` takes: the board must show work in flight from the moment the command starts, not after the contract has been read. If the slug carries an `MPP-<n>` key, invoke the `management-jira` skill and transition that issue to `Coding` — automatically, no confirmation prompt. Read *The MPP status model* in that skill for the rules: resolve the transition id live, report the move in one line, skip silently when the slug has no key, and never fail this command over a Jira error. Transitions are any → any, so a ticket still sitting in `To Do` moves straight to `Coding`. Do not defer this to a later step, and do not batch it with the `Status:` write below.

With the board updated, read:
- `<plan>/plan.md` — Part 1 is scope and acceptance criteria, Part 2 is the technical approach and data shapes
- `<plan>/tasks.md` — implementation checklist (grouped under `## Phase N — Name` headings; each task carries its own `**Files:**` block and ordered `- [ ] **Step:**` bullets)

If either file is missing, **stop** and tell the user to run `/fb-plan <task>` first.

Update the `Status:` line in `<plan>/tasks.md` to `IN PROGRESS`.

## Step 2: The agents

All 4 agents are registered project agents defined in `.claude/agents/` — spawn them with the Agent tool using `subagent_type`, and their definitions load automatically. Do **not** paste agent file contents into prompts.

| `subagent_type` | Definition | Role |
|---|---|---|
| `implementer` | `.claude/agents/implementer.md` | writes production code and tests |
| `code-evaluator` | `.claude/agents/code-evaluator.md` | quality review (DRY/KISS/SOLID + project conventions) |
| `defender` | `.claude/agents/defender.md` | edge cases, security, blast radius |
| `qa` | `.claude/agents/qa.md` | builds, tests, AC traceability |

Each prompt below is the agent's **assignment** only. Read an agent file yourself only if you need to quote one of its rules back to the developer.

## Step 3: Reading tasks.md

`<plan>/tasks.md` is grouped under `## Phase N — Name` headings; tasks are numbered sequentially across all phases. Each task carries its own `**Files:**` block listing the file(s) it touches and what changes in each, plus one or more `- [ ] **Step:**` bullets describing the work in order. **File paths are owned by the task, not by `plan.md`.** Example shape produced by `/fb-plan`:

```
## Phase 2 — Backend type sweep

[Framing paragraph explaining what this phase covers and why it is a safe boundary.]

### Task 5: Widen MealPlanCreateRequest.servings and replace @Min(1) with decimal validation

- Skill: `java-backend` — DTO layer; validation belongs on the request DTO, not the controller.

**Files:**
- Modify: `src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java`
- Test: `src/test/java/com/foodbytes/dto/MealPlanCreateRequestTest.java`

- [ ] **Step 1: Write the failing test**

[code]

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanCreateRequestTest`
Expected: FAIL — decimal value rejected by @Min(1)

- [ ] **Step 3: Widen the field and swap the validation annotations**

[code]

- [ ] **Step 4: Re-run the test**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanCreateRequestTest`
Expected: PASS
```

Rules for reading and processing `tasks.md`:
- The task block (with its `**Files:**` lines and ordered `- [ ] **Step:**` bullets) is the authoritative file list and execution sequence. The Implementer walks every step in the order listed — the planner picked the step shape (TDD vs edit/verify vs grep-audit) per task. Do not collapse, reorder, or skip steps.
- After each phase completes, append every path the Implementer touched (from each task's `**Files:**` block — Create / Modify / Delete / Test) to a cumulative **changed-files log** kept in orchestrator state. This log is the input to the end-of-run reviewer dispatch.
- If a task has no `**Files:**` block (pure verification or coordination), no path is appended for that task.
- Phases run in order. A phase ends in a clean, revertible state (the planner confirms this in the Self-review block at the bottom of `tasks.md`); use phase boundaries as natural orchestration checkpoints.

### Tasks the developer owns, not the Implementer

Some tasks are marked `Skill: none — DBA operation against the live Railway MySQL` or similar. **Never dispatch these to the Implementer and never perform them yourself.** Hibernate runs `ddl-auto: validate`, so a migration must be applied to the live database *before* the phase that changes the matching Java type — otherwise the backend will not start.

When you reach such a task:
1. Stop dispatching.
2. Tell the developer exactly what to run and where (the migration file path, the target database), and that the backend may need a manual redeploy on Railway afterwards.
3. Wait for confirmation that it is applied, then tick the task and continue with the next phase.

Treat this as a pause condition, not a blocker.

## Step 4: Implementation — every phase, end-to-end

Work through every phase in `tasks.md` in order. **Do NOT invoke reviewers between phases — reviewers run once at the end (Step 5).**

### Pause Conditions

**Pause if:**
- Task is unclear → ask for clarification
- Implementation reveals a design issue → suggest updating artifacts
- Error or blocker encountered → report and wait for guidance
- A task requires the developer to act on the live database or Railway (see Step 3)
- User interrupts

**On pause, flag the ticket — do not transition it.** If the slug carries an `MPP-<n>` key, invoke `management-jira` and add a flag to that card, leaving its status at `Coding`. Blocked is orthogonal to progress, so there is no `Blocked` status to move to — see *The MPP status model*. Clear the flag when work resumes.

### Output During Implementation

Use this format to stream progress as tasks complete:

```
## Implementing: <phase name>

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

### Output On Pause (Issue Encountered)

When any pause condition fires, stop implementation and surface it to the user in this format:

```
## Implementation Paused

**Phase:** <phase name>
**Progress:** N/M tasks complete in this phase

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

### Guardrails

- Keep going through tasks until done or blocked
- If a task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- The Implementer ticks each `- [ ] **Step:**` checkbox as it completes the step, and the task heading once all its steps are ticked
- Pause on errors, blockers, or unclear requirements — don't guess

### Phase Dispatch

For **each phase** that has unchecked tasks in `tasks.md`, spawn an **Agent** (`subagent_type: "implementer"`) with the prompt below. After the phase returns, append the phase's changed-files list to the cumulative **changed-files log**. Move to the next phase. **Do NOT spawn reviewers between phases.**

```
## Your Assignment

### Contract Context
[Paste the relevant `###` sections of `<plan>/plan.md` for this phase — normally Part 1 → Restated goal + In scope + Explicitly out of scope, and Part 2 → Approach + Data shapes]

### Skills to invoke
[Paste the "Skills to invoke during execution" list from `<plan>/plan.md` Part 2. The Implementer must invoke each via the Skill tool before writing code — these encode layer placement, naming, and patterns.]

### Rules to honour
- Scan `.claude/rules/README.md` and Read every rule file whose topic this phase touches (recipes, ingredients, macros, meal plans, variants, migrations). Their reject conditions are hard constraints.
- `CLAUDE.md` at the repo root — project conventions and the non-negotiable recipe macro targets.
- Code quality: `.claude/skills/react-frontend/references/engineering-standards.md` (frontend) and the `java-backend` SKILL.md layering/DTO/security rules (backend).

### Tasks to Implement
[Paste only the tasks for the current phase from tasks.md, INCLUDING the phase's framing paragraph and each task's `**Files:**` block and full `- [ ] **Step:**` bullets. The `**Files:**` block is the authoritative file list for that task — touch every listed path and nothing outside the union of those paths. The step bullets are the spec — walk every one in order.]

### Project Paths
- Backend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\foodbytes-api`
- Frontend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\client`
- Migrations: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\database\migrations`

### Important Constraints
- **Walk every `- [ ] **Step:**` bullet of every task in the listed order.** The planner picked the step shape per task (TDD test-first, edit/verify, grep audit, etc.); your job is to execute exactly what's there. Do NOT collapse, reorder, or skip steps. For tasks whose `**Files:**` block lists a `Test:` path, the test file is required output of this phase — write the test, run it, and confirm the expected outcome before moving on. Tests are part of the contract, not a future PR.
- Update `<plan>/tasks.md`, ticking each `- [ ] **Step:**` checkbox as you complete it and the task heading once all its steps are ticked.
- Return your Implementer Report listing every file changed (production AND test files) in this phase.
- **NO reviewer pass will run between phases** — produce finished, merge-ready code AND tests for this phase. Reviewers (Code-Evaluator + Defender + QA) WILL run once at the very end, after every phase has completed; QA validates that any tests introduced are present, runnable, passing, and meaningful (not tautological).
- **Do not apply migrations or run any write against the live Railway MySQL.** Write the migration file; the developer applies it. Say so in your report.
- If the design references an asset that lives outside the contract (an SVG pasted into the brief, an image, a file under `mockups/`), read it and use it verbatim. Do NOT ship placeholder `<rect>`s, lorem-ipsum copy, or "TODO: replace later" stubs — the asset is reachable, fetch it.
```

Keep dispatching the Implementer phase by phase until every phase in `tasks.md` has its tasks marked `- [x]` (or the Implementer reports it cannot complete a task — note the blocker against that phase, append whatever paths it did touch, and continue with the next phase). Then go to **Step 5**.

## Step 5: Final Review — Parallel (Code-Evaluator + Defender + QA)

Once every phase is implemented, spawn all 3 reviewers **in a single message with multiple Agent tool calls** so they run concurrently. Pass each reviewer the **complete cumulative changed-files log from all phases** (built across Step 4) and the full task list from `tasks.md`.

### 5.1 — Code-Evaluator (`subagent_type: "code-evaluator"`)

```
## Your Assignment

### Files to Review
[Cumulative changed-files log from every phase]

### Tasks Implemented
[Full tasks.md task list, grouped by phase, with ✓ marks]

### Standards Reference
Read the standards that match the changed files — `.claude/skills/react-frontend/SKILL.md` + `references/engineering-standards.md` for `client/`, `.claude/skills/java-backend/SKILL.md` for `foodbytes-api/`, plus `CLAUDE.md` and any relevant `.claude/rules/` file.

Review every changed file and produce your Code-Evaluator Report.
```

### 5.2 — Defender (`subagent_type: "defender"`)

```
## Your Assignment

### Files to Review
[Cumulative changed-files log from every phase]

### Tasks Implemented
[Full tasks.md task list, grouped by phase, with ✓ marks]

### Context
[Note any migration this contract introduced and whether the developer has applied it — an entity change with an unapplied migration is a startup failure the Defender must flag.]

Apply your full defensive checklist — including §11 Shared-Surface Contract / Blast Radius — to every changed file and produce your Defender Report.
```

### 5.3 — QA (`subagent_type: "qa"`)

```
## Your Assignment

### Acceptance Criteria
[Paste `<plan>/plan.md` Part 1 → Restated goal, In scope, and Explicitly out of scope]

### Tasks to Validate
[Full tasks.md task list, grouped by phase, with ✓ marks — INCLUDING each task's full `**Files:**` block (Create / Modify / Delete / Test) and the full text of every `- [ ] **Step:**` bullet. The step bullets are the spec — you need them to judge whether the actual code and tests on disk match what the task asked for.]

### Test Paths to Validate (from each task's `Files: → Test:` — only tasks that list one)
[Newline-separated list, one path per task whose `**Files:**` block contains a `Test:` sub-bullet. These are the files QA must read, run, and judge for tautology / coverage / meaningfulness. Tasks without a `Test:` path are not subject to test validation.]

### Files Changed
[Cumulative changed-files log — production AND test files]

### Project Paths
- Backend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\foodbytes-api`
- Frontend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\client`

### Delegated Final-Verification Commands
[Paste verbatim the `Run:` / `Expected:` pairs from the contract's closing `Final verification` phase that the Implementer left unticked — typically bare `mvn test` and `npm run build`. If none, say "none delegated".]

Run all seven validation steps (build, lint position, **test validation** for tasks that list a `Test:` path, frontend verification, log review, AC traceability, delegated final-verification) against the FULL implementation (not per phase) and produce your QA Report. Remember: you NEVER write code — including tests. If a required test is missing, broken, or tautological, FAIL the task and let the Implementer fix it in the combined fix pass. You have no browser tools — emit visual/interaction criteria as MANUAL VERIFICATION NEEDED with the exact route, viewport, and expected outcome. Do not mutate the Railway database.
```

**Wait for all 3 agents to return.** Collect all three reports.

## Step 6: Combined Fix Pass + Re-Review

Verdicts:
- Code-Evaluator: `APPROVED` or `ISSUES FOUND`
- Defender: `APPROVED` or `ISSUES FOUND`
- QA: `ALL PASSED` or `FAILURES FOUND`

**If ALL three approved** → skip to **Step 7** (Final Report).

**If ANY reviewer found issues**, spawn the Implementer (`subagent_type: "implementer"`) **once** with all feedback combined:

```
## Your Assignment: Fix Review Issues

You are receiving feedback from 3 reviewers who analyzed the full implementation in parallel.
Fix ALL issues listed below in a single pass.

### Code-Evaluator Feedback
[Paste the full Code-Evaluator Report — or "No issues" if APPROVED]

### Defender Feedback
[Paste the full Defender Report — or "No issues" if APPROVED]

### QA Feedback
[Paste the full QA Report — or "No issues" if ALL PASSED]

### Files Previously Changed
[Cumulative changed-files log from Step 4]

### Project Paths
- Backend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\foodbytes-api`
- Frontend: `E:\Webdesign\The-Pre-Aisle-Plan\foodbytes-app\client`

### Important Constraints
- Fix ONLY the issues identified by reviewers — do not make unrelated changes
- For Code-Evaluator issues: apply the specific principle or convention fix suggested
- For Defender issues: prioritize Critical over Warning; skip Info-level items
- For QA failures: fix build errors, functional issues, AND test issues — for `test-missing` add the test the task specified at the listed `Test:` path; for `test-broken` make it run and pass; for `test-tautological` rewrite it to assert the actual behaviour described in the task's step bullets; for `test-coverage-gap` or `ac-test-gap` add an assertion for the missed criterion
- **`test-runner-missing` is NOT yours to fix** — the client has no test runner. Do not install one. Report it back so the orchestrator can resolve it with the developer.
- **`manual verification needed` items are NOT failures** — leave them for the developer.
- Return your Implementer Report listing all fixes applied (production AND test files)
```

Collect the result. Extract the updated list of changed files (union with the previous cumulative log).

**Re-Review (verification round).** After the fix pass, spawn all 3 reviewers **in parallel again** with the same prompts as Step 5, including any newly-changed files.

**Wait for all 3 agents to return.**

- If ALL three now approve → proceed to Step 7.
- If issues remain → **maximum 2 fix-review rounds total.** If round 2 still has issues, log the remaining issues and proceed to Step 7 — do not block the contract on a stuck reviewer cycle.

## Step 7: Update Tasks & Final Report

Update `<plan>/tasks.md`:
- Tasks that completed cleanly: tick the task heading and every step beneath it; append ` ✓` to the heading.
- Tasks that could not be completed or failed after max retries: tick the heading, append ` ✗ — [failure reason]`.

Set the `Status:` line to `COMPLETE` (or `BLOCKED` if any task failed after max retries).

**Move the ticket to `Ready for Test`** — but only when the status you just wrote is `COMPLETE`. The gates are green and the one remaining question is how it feels in the hand, which is the developer's to answer. If you wrote `BLOCKED` instead, flag the card and leave it at `Coding`. Automatic either way, no confirmation prompt; the rules are in *The MPP status model* in `management-jira`.

Present:

```markdown
## Implementation Summary

### Tasks
- Total: N
- Passed: M ✓
- Failed: K ✗

### Phase Results
[Include only phases that were in the contract]
| Phase | Tasks | Passed | Failed |
|-------|-------|--------|--------|
| 1. [phase name] | N | M | K |
| 2. [phase name] | N | M | K |
| ... | ... | ... | ... |

### Failed Tasks (if any)
- ✗ Task N — [description] — [reason]

### Review Cycles Used
- Round 1: [APPROVED | ISSUES FOUND]
- Round 2 (if used): [APPROVED | ISSUES FOUND]

### Residual Review Issues (if round 2 still had issues)
- [unresolved issue summary, file:line]

### Jira
- [The transition performed, e.g. `MPP-12 Coding → Ready for Test` — or the flag added, or plainly that it was skipped or failed]

### Developer Actions Outstanding
- [Migrations to apply to the Railway MySQL, backend redeploys, and every MANUAL VERIFICATION NEEDED item from the QA report — route, viewport, expected outcome]

### Files Changed
[Cumulative changed-files log, deduplicated]

### Next Steps
[If all passed, no residuals]: "Implementation complete. Run `/fb-archive` to close this contract."
[If some failed or residuals]: "Some tasks failed or have residual review issues. Review above. Run `/fb-apply` again to retry failed tasks only."
```

## Important Rules

- **The Jira move to `Coding` is the first action, not a formality.** It happens in Step 1 the moment the slug resolves — before the contract files are read, before any dispatch. A run that reaches the Implementer with the card still in `Planned` is a defect in this command's ordering.
- **Implementer runs through every phase first** — do NOT invoke Code-Evaluator, Defender, or QA between phases. The Implementer carries quality through every phase (writing AND running tests as tasks dictate); reviewers see the full result.
- **Reviewers run once, at the very end, in a single Agent dispatch** — always spawn all 3 in a single message so they execute concurrently. Never per-phase, never sequentially.
- **Combined feedback to the Implementer** — all 3 reviewer reports are merged into a single Implementer prompt for the fix pass, never sent one reviewer at a time.
- **Agents have isolated context** — pass everything they need in the prompt; do not assume any agent remembers prior phases or prior dispatches.
- **The orchestrator manages state** — track the cumulative changed-files log across phases, fix-round counters, and residual issues.
- **Files come from tasks, not from `plan.md`** — every phase dispatch uses each task's `**Files:**` block as the authoritative file list.
- **Nobody in this pipeline writes to the live database.** Migration files are written by the Implementer and applied by the developer. If the contract needs a schema change applied mid-run, pause and hand it over.
- **Maximum 2 fix-review rounds total.** After round 2, log residuals and continue.
- **Failed tasks from a previous `/fb-apply` run** should be retried (they will still be unticked in `tasks.md`).
- **Do not implement code yourself** — all code changes go through the Implementer agent.
- **If a phase blocks on a genuine failure** (the Implementer cannot complete a task), log the blocker, continue with remaining phases, and surface it in the final report — do not run reviewers as an early-exit hack, and do not auto-retry beyond the post-review fix-loop cap.

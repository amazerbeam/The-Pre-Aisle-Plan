---
description: Produce an implementation plan (proposal + design + tasks) for a Claude-ready Jira subtask
---

You are the **Planning Agent**. Produce an implementation plan for the primed subtask:

**Subtask context:** $ARGUMENTS

The subtask is the source of truth. Scope, technical pointers, pattern references, and constraints all come from it. Do not infer intent the subtask doesn't state. Do not sweep the codebase for context — the developer has already primed what you need.

## Step 0: Preconditions — only refuse when there is literally no context

The gate is narrow. Only refuse to plan if one of these two unrecoverable conditions holds:

1. **No subtask context** — `$ARGUMENTS` is empty, or there is no Jira link / pasted subtask body in the session.
   - Response: "Prime the session with the Jira subtask body or link before invoking `/plan`."

2. **Subtask unreadable** — link given but Atlassian MCP returns an error (disconnected, 404, permission denied).
   - Response: surface the actual error verbatim. Ask the developer to paste the subtask body inline or fix access. Do not guess.

**Vagueness is NOT a refusal condition.** If the subtask is missing Pattern References, ambiguous on scope, light on technical pointers, or otherwise sparse — proceed. Do not bounce it back to the developer. Instead, in Step 2:

- Make the **most plausible decisions** Claude can defend, drawing on the loaded skills (Step 1.5) and the conventions they encode.
- Capture every such decision in a new **"Assumptions made"** section in `proposal.md`, each with a one-line rationale.
- Frame the plan so the developer can red-line specific assumptions in `proposal.md` review rather than rewriting the subtask.

The alignment check happens in `proposal.md`, not at the gate. A best-effort plan with explicit assumptions is more useful to the developer than a refusal.

## Step 1: Defer to the specialised agent and read the rules

Canonical patterns live in the invoked specialised agent's SKILL.md, not in the wider codebase. Honour any `CLAUDE.md` do-not-pattern-match fences (Bedrock / Relic / Archive and similar). Do not pattern-match against legacy code.

Read `${CLAUDE_PLUGIN_ROOT}/rules/code-quality.md` and ensure the plan complies with it — in particular the Runtime Quality section (no memory leaks, performant, thread-safe, no GC suspension).

If the subtask points to specific files or components as Pattern Reference, treat those as authoritative for this subtask.

## Step 1.5: Classify the work and load skills BEFORE planning

The planner is only as good as the conventions it has loaded. Without the right skills in context, plans can be internally consistent yet land in the wrong layer, miss house naming, or skip test patterns. Close that gap before writing any of the three files.

### a) Classify the work from the subtask

Pick every category that applies. A subtask can be in more than one (e.g. new REST endpoint + new table = Java REST + Java SQL + Architecture).

**Java backend**
- New REST endpoint or controller method → `eida-java-development:java-rest-develop`
- General Java code, refactor, review on JDK 21 → `eida-java-development:java-develop`
- New table / new JPA entity / Envers `_aud` companion / native SQL → `eida-java-development:java-sql-develop`
- Struts 2 action / interceptor / result review → `eida-development:struts2-review`

**Frontend**
- New screen on legacy `WebContent/r/eida_central` (React 16.9) → `eida-frontend-development:fe-react-16-develop`
- Legacy grid (Logs, Pipework, QA, Admin) → `eida-frontend-development:fe-react-16-datagrid`
- Modern React 18 component work → `eida-frontend-development:fe-react-18-develop`
- Modern server-side data table → `eida-frontend-development:fe-react-18-datagrid`

**Architecture / DB / Infra**
- Where Java code belongs (Action / Business / Service / Repository / DTO) → `eida-architecture:backend-conventions`
- Schema design / DDL review / "what are our DB rules" → `eida-architecture:db-conventions`
- New migration appended to `SQL_Incrementals.sql` → `eida-architecture:db-migration`
- Schema change PR review → `eida-architecture:db-review`
- Kubernetes / Skaffold / Kustomize manifests → `eida-infrastructure:iac-kubernetes`
- Terraform under `gcp-*` / `inf1-*` → `eida-infrastructure:iac-terraform`
- Bicep / Azure infra → `eida-development:bicep-iac` (and `eida-development:bicep-validate` for review)
- Dockerfile / docker-compose → `eida-development:docker-orchestrator`

**Cross-cutting (almost always include when the subtask has Java code)**
- JUnit 5 unit tests → `eida-development:junit`
- Mock setup, ArgumentCaptor, static/spy mocking → `eida-development:mockito`
- Test review / naming / structure → `eida-development:test-patterns`

**Frontend tests** (when subtask has React code)
- Vitest unit + Playwright e2e → `eida-development:frontend-testing`

### b) Confirm the skill list with the developer

Build the proposed list from the classification above, then call `AskUserQuestion` once to confirm. Pre-tick every skill the classification matched. Group choices visually as **Java**, **Frontend**, **Architecture / DB / Infra**, **Cross-cutting**. The developer can untick anything that doesn't apply or tick extras the classifier missed. If the developer is unavailable (no interactive UI), proceed with the proposed list and note in `design.md` that no developer override was applied.

### c) Load the confirmed skills

For each confirmed skill, invoke it via the Skill tool *before* writing `design.md` and `tasks.md`. The skill content informs:
- the **Approach** section in `design.md` (correct layer placement, correct patterns)
- the **Files to touch** table (right paths, right naming)
- the **Tasks** in `tasks.md` (concrete steps that match house standards)

Record the loaded skills in `design.md` under "Skills to invoke during execution" — this becomes the handoff list for the post-`/clear` execution session.

If the developer overrode a skill (added or removed one), capture that in a one-line note under the skill list so the execution session understands why.

## Step 1.6: Verify against the local database (when applicable)

If the subtask touches DB-backed code — JPA entity, repository, native SQL, migration, or a FE grid wired to a search endpoint — use the `mysql-eida-local` MCP server (see memory `reference_mysql_local_mcp.md`) to ground the plan in the actual local schema and data.

Confirm:
1. Every referenced table exists in the target tenant DB (default `eida_global`). If DDL is staged in `data/sql/SQL_Incrementals.sql` but unapplied locally, add the apply step to `tasks.md`.
2. Every column referenced by entities, native SQL, or filter registries exists with the expected name, type, and nullability.
3. The target tenant DB has representative rows so a developer smoke test is meaningful. If not, plan a seed step (a new dev-only seed file — `SQL_Incrementals.sql` is DDL-only by convention).
4. Names align across the chain: DB column ↔ JPA `@Column` ↔ DTO field ↔ BE filter/sort registry key ↔ FE column id. Any mismatch is an in-scope defect, not an out-of-scope item.

Capture findings in `proposal.md` under a section titled **"Cross-code alignment audit (FE ↔ BE ↔ DB)"** with one bullet per check. Skip this step entirely for subtasks that don't touch persistence (pure UI, pure config, pure docs).

## Step 2: Produce the plan — proposal and design first

Create the directory `.claude/contract/` and write **only** `proposal.md` and `design.md` in this step. **Do not write `tasks.md` yet** — it is gated on developer approval of the proposal and design (see Step 3). The three files together form the alignment artefact between Claude and the developer; the Jira story still owns the broader context (Why, story-level AC, Out of Scope).

### File 1: `.claude/contract/proposal.md`

The shared understanding of what this subtask is doing. Restate it in your own words — this is how the developer confirms Claude has read the subtask correctly before any design happens.

```markdown
# Proposal: [Subtask key + title]

## Subtask reference
[Jira subtask key and link]

## Restated goal
[One paragraph in plain prose: what this subtask delivers, in Claude's own words. The developer reads this to confirm Claude understood the subtask. Mismatch here = stop and fix.]

## In scope
- [Specific, concrete deliverable]
- [Specific, concrete deliverable]

## Explicitly out of scope
- [Anything the subtask implies but isn't asking for]
- [Anything adjacent that could otherwise creep in]

## Pattern Reference (from subtask)
[Verbatim from the subtask: file paths, class names, or "follow <agent>/SKILL.md". If the subtask provided none, write "None supplied — see Assumptions" and document Claude's chosen reference there.]

## Constraints flagged on the subtask
[Verbatim or paraphrased: DB structure notes, auth/role requirements, validation rules, anything the dev called out as "don't surprise me on this".]

## Assumptions made
[Every decision Claude made because the subtask didn't say. One bullet per assumption, with a one-line rationale. The developer red-lines this section during review — that is cheaper than rewriting the subtask. Skip the section only if the subtask was fully specified and Claude assumed nothing.

Examples of what to capture:
- Layer / package chosen (modern REST `com.eidacentral.*` vs module-first Struts vs legacy)
- Pattern Reference selected when none was supplied (cite the existing class)
- Endpoint path, HTTP verb, response shape
- Parameter type (enum vs string), where the enum lives, path vs query
- Auth / role requirement
- Schema decisions (column types, nullability, indexes, audit, multi-tenancy)
- Scope-narrowing when the subtask straddled BE + FE]
```

### File 2: `.claude/contract/design.md`

The technical approach. **All six subsections below are required.** If a subsection genuinely doesn't apply, write a single-line skip justification (e.g. "Data shapes: no schema or contract changes."). Empty headings, empty `mermaid` fences, and "TBD" are worse than absent — they signal the planner gave up rather than thought it through.

File paths are **not** listed centrally here — each task in `tasks.md` names the files it touches.

```markdown
# Design: [Subtask key + title]

## Approach
[2-4 paragraphs explaining the technical shape. How the change is structured, why this shape over the alternatives Claude considered (call the alternatives out by name — the developer often learns more from the road not taken than the road taken), what the moving parts are, how data flows end-to-end. Reflect the conventions from the skills loaded in Step 1.5.]

## Skills to invoke during execution
[The confirmed skill list from Step 1.5 (post-developer-confirmation). One bullet per skill: `skill-name` — why it applies. If the developer overrode the classifier proposal (added or removed a skill), note it on a one-line trailing comment so the execution session knows why.]

## Diagram
A Mermaid diagram of the flow or structure that matters most: sequence diagram for request flows, class/component for structural changes, flowchart for decision logic. If the work is genuinely a single-file edit with no flow worth illustrating, replace the fence below with one line: "Diagram skipped — single-file change, no flow." Never leave an empty fence.

​```mermaid
[sequence / class / component / flowchart]
​```

## Data shapes
Entities, DTOs, TypeScript types, DDL — the new or modified ones, with **concrete fields, types, nullability, indexes, and constraints**. Not prose. If nothing changes, write: "No schema or contract changes." Worked example showing the depth expected:

​```ts
type CreatePunchRequest = {
  projectId: number;            // FK projects.id, required
  description: string;          // required, max 500 chars
  assigneeId: number | null;    // FK users.id, optional
};
​```

​```sql
ALTER TABLE punches
  ADD COLUMN assignee_id BIGINT NULL,
  ADD INDEX idx_punches_assignee (assignee_id),
  ADD CONSTRAINT fk_punches_assignee FOREIGN KEY (assignee_id) REFERENCES users(id);
​```

## Runtime quality notes
Address each dimension below. The four dimensions come from `${CLAUDE_PLUGIN_ROOT}/rules/code-quality.md` Runtime Quality. "Trivial — no concerns" is an acceptable answer per dimension, but only when honestly true.

- **Resource cleanup:** [files, sockets, DB connections, transactions, timers — how each is closed/released, try-with-resources / finally / using]
- **Concurrency / thread-safety:** [shared state, locks, race conditions, async ordering, GC suspension risk]
- **Allocation behaviour:** [hot paths, large allocations, streaming vs buffering, memory leaks, pooling]
- **Error paths:** [what's caught where, what bubbles up, what the user sees, what gets logged]

## Risks and judgement calls
[Decisions Claude made that the developer should sanity-check before approving the plan — pattern choice, naming, structural decisions, where a method lives, library picks, scope-narrowing. One bullet per call. This is the second-most-important section after Approach: it surfaces things that could be wrong without burying them in prose.]
```

## Step 2.5: Self-review proposal and design

Before handing off proposal + design for approval, review them against the subtask. No subagent dispatch — do this yourself.

1. **Subtask coverage:** Skim each requirement, AC, and Pattern Reference in the subtask. Is each one reflected in `proposal.md` "In scope" and addressed in `design.md` "Approach"? List gaps and fix.
2. **Design completeness:** `design.md` has all six required subsections (Approach, Skills to invoke during execution, Diagram, Data shapes, Runtime quality, Risks). Each is filled or has an explicit one-line skip justification.
3. **Placeholder scan in proposal + design:** No `TBD`, `TODO`, `implement later`, "appropriate error handling", empty `mermaid` fences, or empty subsections. Fix every hit.
4. **Assumptions ↔ design alignment:** Every assumption in `proposal.md` "Assumptions made" that constrains a technical decision is reflected in `design.md` "Approach" or "Risks and judgement calls". Assumptions that don't influence anything are noise — drop them.
5. **DB alignment audit (when Step 1.6 ran):** The "Cross-code alignment audit (FE ↔ BE ↔ DB)" section in `proposal.md` reports a finding for every check actually performed.

Fix issues inline. Continue to Step 3.

## Step 3: Hand off proposal and design — gate approval with `AskUserQuestion`

**Do not write `tasks.md` yet.** First present in chat:

1. **Restated goal** from `proposal.md` (so the developer can confirm understanding before reading the rest)
2. **Assumptions made** from `proposal.md` (call this out clearly — it is the part the developer most needs to red-line)
3. **Mermaid diagram** from `design.md` if you produced one
4. **Skills loaded** during planning and **skills to invoke** during execution (from `design.md`) — flag any developer override
5. **Judgement calls** you made — pattern choice, naming, structural decisions

Then tell the developer:

> Review `.claude/contract/proposal.md` and `.claude/contract/design.md`. Start with `proposal.md` — if the restated goal doesn't match your intent, stop and fix the subtask before going further.

### Then call `AskUserQuestion` to gate the tasks.md write

This is a **mandatory** tool call — do not infer approval from chat replies. Use this exact shape:

```
AskUserQuestion({
  questions: [{
    question: "Approve proposal.md + design.md and proceed to write tasks.md?",
    header: "Approve plan",
    multiSelect: false,
    options: [
      { label: "Approve — write tasks.md",
        description: "Proposal and design look right. Generate tasks.md now." },
      { label: "Request changes",
        description: "Proposal or design needs revision before tasks.md. I'll list red-lines in the next message." }
    ]
  }]
})
```

**Branch on the answer:**

- **Approve — write tasks.md** → continue to Step 4.
- **Request changes** → ask the developer for the specific red-lines (or read them from the same turn if already provided). Revise `proposal.md` and/or `design.md` in place, re-run Step 2.5, then re-call `AskUserQuestion` with the same question. Loop until the developer picks "Approve".
- **`Other` (free-text)** → treat as a request for changes unless the free-text is unambiguous approval (e.g. "approved", "lgtm, proceed"). When in doubt, re-ask.

If the runtime cannot present `AskUserQuestion` (non-interactive session), state that explicitly in chat and proceed to Step 4, but add a one-line note at the top of `tasks.md` that proposal/design were not developer-confirmed.

## Step 4: Produce `tasks.md` (after approval)

Now that proposal and design are approved, write the execution checklist.

### File 3: `.claude/contract/tasks.md`

The execution checklist. Atomic, ordered, specific, **grouped by phase**. Each phase is a safe stopping point — the build is green and the codebase is internally consistent. Within a phase, each task is a self-contained vertical slice that names its component, the skill that governs it, the files it touches, and the ordered checkbox steps the executor must walk through. Tests live inside the task that introduces the behaviour they cover — never as a trailing "Unit tests" section. **Do not insert commit steps between phases or between tasks** — the executor decides when to commit; planning never prescribes git commits.

```markdown
# Tasks: [Subtask key + title]

> **For agentic workers:** Use `/eida:apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: PLANNED
Started: [today's date]

**Goal:** [one-sentence restatement from proposal.md]

**Spec:** `.claude/contract/proposal.md` and `.claude/contract/design.md`

---

## File map

**Created:** *(or "(none — no new files)")*
- `path/to/NewFile.java` — [one-line purpose]

**Modified:**
- `path/to/Existing.java` — [one-line summary of change]
- `path/to/Other.xml:120-145` — [one-line summary]

**Deleted:** *(or "(none)")*
- `path/to/Obsolete.java`

---

## Phase 1 — [Phase name, e.g. "Module entity logical-name renames"]

[1-3 sentence framing paragraph: what this phase covers and why the boundary is a safe stopping point — build is green? widens before cuts? read-only side effects? The framing tells the executor when to stop and re-evaluate if a step misbehaves. Do not include commit instructions.]

### Task 1: [Component / verb-shaped name — e.g. "Add CreatePunchRequest DTO"]

- Skill: [skill-name from "Skills to invoke during execution" in design.md, or `none — vanilla edit` with a one-line reason]

**Files:**
- Create: `exact/path/to/NewClass.java`
- Modify: `exact/path/to/Existing.java:123-145`
- Delete: `exact/path/to/Obsolete.java`
- Test: `exact/path/to/NewClassTest.java`

(Omit any sub-bullet that genuinely doesn't apply — e.g. no new file → no `Create:`. Use `path:line-range` on `Modify:` whenever the change is localised.)

- [ ] **Step 1: [Imperative verb describing the action — e.g. "Add the DTO record" / "Update the @Entity annotation" / "Write the failing test"]**

[The exact code or change. Use a fenced block when the action is a code edit. State the precise diff: what gets replaced and what replaces it.]

​```java
public record CreatePunchRequest(
    long projectId,
    String description,
    Long assigneeId
) {}
​```

- [ ] **Step 2: [Verify the previous step — build, lint, or run a test]**

Run: `<exact command>`
Expected: `<concrete expected outcome — "BUILD SUCCESSFUL", "PASS", "0 errors", a specific log line, or a specific HTTP response>`

### Task 2: [Next component]

[…repeat the same shape, with whatever step count fits the work…]

---

## Phase 2 — [Phase name, e.g. "Wire the new endpoint"]

[Framing paragraph for Phase 2.]

### Task N: …

[…tasks…]

---

## Phase M — Final verification

The closing phase. No production changes — only sanity-checks that the cumulative work is clean.

### Task M.1: Grep for stale references

- [ ] **Step 1: Confirm no [stale-pattern] remains**

Run:
​```bash
grep -rn "<pattern>" <paths>
​```
Expected: zero hits.

### Task M.2: Run the full test suite end-to-end

- [ ] **Step 1: Clean test run**

Run: `<exact command, e.g. ./gradlew :module:clean :module:test>`
Expected: BUILD SUCCESSFUL with 0 failures, 0 errors.

### Task M.3: Update the PR description

- [ ] **Step 1: Open / update the PR description**

Include:
- Link to the spec.
- Summary of the change.
- Smoke-test result from the prior phase (HTTP status, response shape).
- A one-line note for future contributors on any new convention introduced.

---

## Self-review

(Filled by the planner before handing off — kept in the file so the executor can confirm coverage.)

**Spec coverage:**
- [Design-doc requirement D1] — Tasks N, M.
- [Design-doc requirement D2] — Task K.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:** [Confirm any new identifiers — DTO fields, entity names, bean names, persistence-unit names, columns, endpoint paths — are used identically across every task that touches them.]

**Phase boundary cleanliness:** Each phase ends with the build green and the codebase internally consistent (no half-applied renames, no dead references). [One sentence per phase confirming this.]
```

**Rules for tasks.md:**
- Tasks are grouped under `## Phase N — Name` headings. Phase numbering starts at 1; task numbering is sequential across all phases (Task 1, Task 2, … Task K).
- Every phase opens with a 1-3 sentence framing paragraph explaining what the phase covers and why the boundary is a safe stopping point (green build, no half-applied changes).
- **Never plan commits.** Tasks and phases must not include `git commit` steps, "commit at end of phase" instructions, or commit-message templates. Committing is the executor's decision, not the plan's.
- Every code-touching task carries a `**Files:**` block (`Create` / `Modify` / `Delete` / `Test` — omit any sub-bullet that doesn't apply; use `path:line-range` on `Modify:` whenever the change is localised) and at least one `- [ ] **Step:**` bullet.
- **Step shape is flexible — fit the work, not a fixed template.** Common shapes:
  - `edit → build / verify` (refactors, config changes)
  - `add failing test → run-fail → implement → run-pass` (TDD slices)
  - `grep → confirm zero hits` (verification phases)
  Each step must be a real action (a concrete code change, or a runnable command with `Run:` / `Expected:`), never a description.
- The Skill bullet must name a skill from `design.md` "Skills to invoke during execution". If no skill applies, write `Skill: none — vanilla edit` with a one-line reason.
- The closing phase is named `## Phase N — Final verification` and contains only no-production-change sanity checks (grep audits, full test suite, PR description, smoke tests).
- Use the project's real runners in any verification step: `./gradlew test --tests …` / `./gradlew :module:test` for Java, `npm test -- <path>` or `npx vitest run <path>` for React, `npx playwright test <path>` for e2e.
- One component per task. If a slice touches a controller, a service, and a repo, that's three tasks under the same phase — not one bundle.
- If the work warrants TDD (new behaviour with a meaningful invariant), the task's steps follow the test-first sequence above. If the work is a mechanical refactor, rename, or config edit, the steps follow the edit/verify sequence. The planner picks the shape per task — the executor walks whatever steps the task lists.

**How phases execute in `/eida:apply`:**
- The Implementer subagent walks every phase end-to-end first, executing every `- [ ] **Step:**` bullet of every task in the listed order — including any test steps. Reviewers do **not** run between phases.
- After the last phase completes, three reviewers (Code-Evaluator + Defender + QA) run **once, in parallel**, against the cumulative implementation. QA validates the production code AND any tests introduced (present, runnable, asserting the right behaviour, not tautological).
- If reviewers find issues, the Implementer gets a single combined fix prompt, then reviewers run **one** verification round. Max 2 rounds total.

### Rules across all three files
- Do **not** restate the Jira story's Why or story-level Acceptance Criteria — those live on the story.
- `proposal.md` is the alignment check. `design.md` is the technical approach. `tasks.md` is the execution list. Don't duplicate content across them.
- Tasks must be specific: file paths, method names, endpoint paths, component names.
- Tests live inside the task that introduces the behaviour they cover, not in a trailing "Unit tests" section. Tasks that introduce new behaviour with a meaningful invariant must include a test step (and the corresponding `Test:` entry in the `**Files:**` block).
- Plan must comply with `${CLAUDE_PLUGIN_ROOT}/rules/code-quality.md`.

### No placeholders
Every line must contain content the developer can act on. These are **plan failures** — never write them in any of the three files:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- A step that is prose ("verify it works", "run the build") without a `Run:` / `Expected:` line or a concrete code block
- A step that describes *what* without showing *how* — class/method/endpoint name required where applicable
- References in `tasks.md` to types or methods not present in `design.md` "Data shapes" or earlier tasks
- An empty `mermaid` code fence in `design.md`
- A `design.md` subsection with no body (write the one-line skip justification instead)
- A `## Phase` heading with no framing paragraph (write the 1-line "why this is a safe boundary" instead)
- A `## Phase` heading with no `### Task N:` blocks under it
- A task missing its `- Skill:` line, its `**Files:**` block, or any `- [ ] **Step:**` bullet

### Cross-file consistency
- Every code-touching task in `tasks.md` carries a `**Files:**` block (Create / Modify / Delete / Test) and at least one `- [ ] **Step:**` bullet — file paths and verification commands are owned by tasks, not by `design.md`.
- Every `- Skill:` value in a task must appear in `design.md` "Skills to invoke during execution" (or be the literal `none — <reason>`).
- Every type, DTO field, method signature, and endpoint shape used inside a task's steps must match `design.md` "Data shapes" (or be introduced by an earlier task).
- Every "In scope" bullet in `proposal.md` must map to one or more tasks in `tasks.md`.
- Every assumption in `proposal.md` "Assumptions made" that constrains a technical decision must be reflected in `design.md` "Approach" or "Risks and judgement calls" — assumptions that don't influence anything are noise.
- Every phase in `tasks.md` ends with the build green and no half-applied changes — confirm this in the Self-review block at the bottom of `tasks.md`.

## Step 4.5: Self-review `tasks.md` against the approved proposal + design

Look at `tasks.md` with fresh eyes against the already-approved `proposal.md` and `design.md`. Run this checklist yourself — no subagent dispatch.

1. **Subtask coverage:** Skim each requirement, AC, and Pattern Reference in the subtask, plus every "In scope" bullet in `proposal.md`. Can you point to a task in `tasks.md` that implements it? List any gaps and add tasks for them.
2. **Phase shape:** `tasks.md` is grouped under `## Phase N — Name` headings. Every phase has a 1-3 sentence framing paragraph and at least one `### Task N:` block. Every code-touching task has a `### Task N: [Component]` heading, a `- Skill:` line, a `**Files:**` block, and at least one `- [ ] **Step:**` bullet that is either a concrete code change or a runnable command with `Run:` / `Expected:`. The closing phase is `## Phase N — Final verification`.
3. **Cross-file consistency:** Apply the bullets from "Cross-file consistency" above. A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug — find and fix it. Every `- Skill:` resolves to a skill listed in `design.md` "Skills to invoke during execution". Every type, DTO field, method signature, and endpoint shape used inside a task's steps must match `design.md` "Data shapes" (or be introduced by an earlier task). Do **not** silently change anything in the approved `proposal.md` or `design.md` — if a gap forces a design change, surface it back to the developer for re-approval rather than rewriting the approved files unilaterally.
4. **Placeholder scan in `tasks.md`:** Search for the patterns in "No placeholders" above. Fix every hit.
5. **Self-review block in `tasks.md`:** The bottom-of-file Self-review block lists spec coverage (one bullet per design-doc requirement), a placeholder scan confirmation, type/name consistency confirmation, and a per-phase reversibility line.

Fix issues inline. No need to re-review after fixing — just fix and continue to Step 5.

## Step 5: Final hand off

After writing `tasks.md`, present in chat:

1. **Counts**: total phases and total tasks (each task is a vertical slice with its own `**Files:**` block and ordered checkbox steps)
2. **Phase summary**: one line per phase naming the phase and what it delivers
3. Reminder of the approved skills to invoke during execution (from `design.md`)

Then tell the developer:

> The contract is complete under `.claude/contract/` — `proposal.md`, `design.md`, and `tasks.md`. When you're ready, post the contents (or a concise digest) as a comment on the Jira subtask via the Atlassian MCP — the Jira comment is the canonical plan, not this chat session. Then `/clear` and start a fresh execution session that pulls the plan from Jira.

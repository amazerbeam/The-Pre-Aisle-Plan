# Requirements Traceability Matrix (RTM)

How to parse requirements and track verification.

## Dynamic Parsing

CEO MUST dynamically read ALL requirements from `agents/Requirements/foodbytes-requirements.md`. Do NOT hardcode requirement IDs.

### Parsing Instructions

1. Read entire `foodbytes-requirements.md`
2. Find all `### FR-XXX:` sections (Functional Requirements)
3. Find all `### NFR-XXX:` sections (Non-Functional Requirements)
4. For each requirement, extract:
   - ID (e.g., "FR-001", "NFR-005")
   - Title (text after colon)
   - Priority (from **Priority:** line)
   - Acceptance Criteria (bullet points)
5. Create RTM entry for each

## RTM Location

`docs/verification/requirements-traceability-matrix.md`

## RTM Entry Format

```markdown
### [REQ-ID]: [Title]
**Status:** NOT_STARTED | IN_PROGRESS | IMPLEMENTED | VERIFIED | BLOCKED
**Phase:** [Phase number]
**Implementation:** [File paths, components, endpoints]
**Evidence:** [Test results, screenshots, notes]
**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

## Status Definitions

| Status | Meaning |
|--------|---------|
| NOT_STARTED | Not yet addressed |
| IN_PROGRESS | Design approved, implementing |
| IMPLEMENTED | Code complete, awaiting verification |
| VERIFIED | All acceptance criteria confirmed |
| BLOCKED | Cannot implement — needs user decision |

## Verification Workflow

```
1. PARSE (Startup)
   └── Read requirements doc
   └── Extract all FR-xxx and NFR-xxx
   └── Create RTM with all as NOT_STARTED

2. UPDATE (After Each Phase)
   └── Add implementation artifacts
   └── Change status: NOT_STARTED → IN_PROGRESS/IMPLEMENTED
   └── Report coverage percentage

3. VERIFY (Phase 10)
   └── For each requirement:
       ├── Check implementation evidence exists
       ├── Test against acceptance criteria
       ├── Mark VERIFIED if all pass
       └── Identify gaps if any fail

4. RESOLVE GAPS (If Any)
   └── List unverified requirements
   └── Assign to appropriate agent
   └── Agent implements
   └── Re-verify

5. COMPLETION (When 100% Verified)
   └── Generate final report
   └── Declare DONE
```

## Evidence Types

| Type | Description | Example |
|------|-------------|---------|
| CODE_REF | File path | `client/src/components/RecipeCard.jsx` |
| API_ENDPOINT | REST endpoint | `GET /api/recipes` |
| TEST_RESULT | Test passing | "Login flow tested successfully" |
| SCREENSHOT | Visual evidence | `docs/verification/screenshots/fr-009.png` |

## Phase-by-Phase Updates

After each phase:

1. Update RTM with new file paths, components, endpoints
2. Change status from NOT_STARTED to IN_PROGRESS/IMPLEMENTED
3. Add evidence
4. Report: "Phase X complete. Coverage: Y% (A/B requirements addressed)"

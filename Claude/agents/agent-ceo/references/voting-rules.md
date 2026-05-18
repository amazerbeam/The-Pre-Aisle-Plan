# Voting Rules

Rules for peer review voting on design proposals.

## Eligibility

- **Voters**: All 6 agents EXCEPT the design submitter
- **Per Design**: 5 eligible voters

## Quorum

- **Minimum Votes**: 4 of 5 must vote
- **If quorum not met**: Request missing reviews before proceeding

## Majority Calculation

```
APPROVED if: approvals > rejections
REJECTED if: rejections >= approvals

Examples:
- 5 approve, 0 reject = APPROVED
- 4 approve, 1 reject = APPROVED
- 3 approve, 2 reject = APPROVED (majority)
- 2 approve, 3 reject = REJECTED
- 2 approve, 2 reject, 1 abstain = REJECTED (no majority)
```

## Tie-Breaker Rules

| Decision Type | Deciding Vote |
|---------------|---------------|
| Architecture | @system-architect |
| Database | @sql-agent |
| Frontend | @react-agent |
| UX | @ux-agent |
| Security | @auth-agent |
| Java/Backend | @java-agent |

## Domain Authority

- Agents have EXTRA WEIGHT in their domain expertise
- But NO VETO power — majority still rules
- Rejections from domain experts should be taken more seriously

## Context File Rules — NON-NEGOTIABLE

**CRITICAL:** DO/DO NOT rules in each agent's context file CANNOT be overridden by peer review votes.

### Rule Hierarchy

```
1. Context File DOs/DO NOTs  ← HIGHEST PRIORITY (cannot be vetoed)
2. Requirements Document
3. Peer Review Decisions
4. Agent Suggestions
```

### Conflict Resolution

When design conflicts with another agent's context file rules:

1. **Detect** — Reviewer identifies violation
2. **Cannot Veto** — The rule stands as written
3. **Find Workaround** — Submitting agent must revise to comply
4. **Escalate if Stuck** — CEO asks user to resolve conflict

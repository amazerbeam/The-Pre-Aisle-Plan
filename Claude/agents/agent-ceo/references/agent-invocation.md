# Agent Invocation

How to invoke specialized agents using the Task tool.

## Available Agents

| Agent | Context File | Invoke For |
|-------|--------------|------------|
| @system-architect | `agents/System Architect/context-system-architect.md` | Architecture, Docker, API contracts |
| @sql-agent | `agents/MySQL/context-sql.md` | Database schema, queries, migrations |
| @auth-agent | `agents/Login-Authentication/context-authentication.md` | OAuth, JWT, security middleware |
| @java-agent | `agents/Java/context-java.md` | Spring Boot, controllers, services |
| @react-agent | `agents/React/context-react.md` | Components, state, routing |
| @ux-agent | `agents/UX/context-ux.md` | Responsive CSS, accessibility |
| @testing-agent | `agents/Testing/agent-testing` | E2E tests, regression |

## Invocation Pattern

Use the `Task` tool to invoke agents:

```
Task tool parameters:
- subagent_type: "general-purpose"
- prompt: [Include agent context and specific request]
```

## Design Request Template

When requesting a design from a lead agent:

```
You are the [AGENT_NAME] for FoodBytes.

Read your context file: [CONTEXT_FILE_PATH]

TASK: Design [COMPONENT/FEATURE] for Phase [N]

REQUIREMENTS TO ADDRESS:
[List FR-xxx and NFR-xxx from requirements doc]

OUTPUT:
1. Technical design document
2. "Requirements Addressed" table mapping each FR/NFR to implementation
3. Any constraints or dependencies

Follow all DO/DO NOT rules from your context file.
```

## Review Request Template

When requesting a peer review:

```
You are the [AGENT_NAME] reviewing a design for FoodBytes.

Read your context file: [CONTEXT_FILE_PATH]

DESIGN TO REVIEW:
[DESIGN_CONTENT]

CLAIMED REQUIREMENTS:
[List of FR-xxx/NFR-xxx the design claims to address]

REVIEW TASK:
1. Evaluate from your domain expertise
2. Check for conflicts with your context file rules
3. Verify requirements coverage claims

RESPOND WITH:
- VERDICT: APPROVE or REJECT
- REASON: (required for REJECT)
- REQUIREMENTS VERIFIED: [list]
- SUGGESTIONS: (optional)
```

## Implementation Request Template

When requesting implementation after design approval:

```
You are the [AGENT_NAME] for FoodBytes.

APPROVED DESIGN:
[DESIGN_CONTENT]

TASK: Implement this design

REQUIREMENTS:
[List FR-xxx/NFR-xxx]

OUTPUT:
- Working code files
- File paths for RTM tracking
- Any issues encountered

Follow all DO/DO NOT rules from your context file.
```

## Testing Request Template

When invoking @testing-agent:

```
You are the Testing Agent for FoodBytes.

TASK: Run E2E tests on all requirements

REQUIREMENTS TO TEST:
- "Complete" section: Regression tests
- "In Progress" section: New feature tests

Read requirements from: agents/Requirements/foodbytes-requirements.md

OUTPUT:
- Test results for each requirement
- PASS/FAIL status
- Failure details if any
- Report at: agents/Testing/test-results-report.md

ALL TESTS MUST PASS before CEO can declare done.
```

## Context Files to Read First

Before invoking any agent, CEO should read:

```
agents/Requirements/foodbytes-requirements.md  # Current requirements
agents/Login-Authentication/context-authentication.md
agents/React/context-react.md
agents/System Architect/context-system-architect.md
agents/MySQL/context-sql.md
agents/UX/context-ux.md
agents/Java/context-java.md
```

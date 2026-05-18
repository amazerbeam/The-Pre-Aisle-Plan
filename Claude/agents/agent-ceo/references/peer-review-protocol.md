# Peer Review Protocol

How to conduct peer reviews for design proposals.

## Workflow

```
1. DESIGN PHASE
   └── CEO invokes lead agent for domain design
       └── Agent produces design document

2. SUBMISSION
   └── CEO logs submission with timestamp
       └── Design stored in docs/designs/

3. REVIEW DISTRIBUTION
   └── CEO invokes each OTHER agent as reviewer
       └── 5 reviewers per design (all except submitter)

4. VOTING
   └── Each reviewer returns verdict:
       ├── APPROVE - Design meets requirements
       └── REJECT - With specific reason

5. TALLY
   └── CEO counts votes
       ├── Majority (3+ of 5) = APPROVED
       └── Minority (<3 of 5) = REJECTED

6. RESOLUTION
   ├── If APPROVED: Proceed to implementation
   └── If REJECTED:
       ├── Log all rejections with reasons
       ├── Request revision from original agent
       └── Repeat from step 3
```

## Review Prompt Template

Use this when invoking an agent as reviewer:

```
You are reviewing a design proposal for FoodBytes.

DESIGN BEING REVIEWED:
- Title: [DESIGN_NAME]
- Submitted by: [AGENT_NAME]
- Phase: [PHASE_NUMBER]

DESIGN DOCUMENT:
[DESIGN_CONTENT]

REQUIREMENTS CLAIMED:
[List of FR-xxx and NFR-xxx this design claims to address]

YOUR TASK:
1. Evaluate from your domain expertise
2. Check compatibility, technical soundness, integration concerns
3. VERIFY requirements coverage claims

RESPOND WITH:
- VERDICT: APPROVE or REJECT
- REASON: Specific explanation (required for REJECT)
- REQUIREMENTS VERIFIED: [FR/NFR IDs correctly implemented]
- REQUIREMENTS MISSING: [Any claimed but not implemented]
- SUGGESTIONS: Optional improvements
```

## Design Submission Template

All submissions MUST include "Requirements Addressed" section:

```markdown
## [DESIGN_NAME] - Phase [N]

### Design Content
[Technical design details...]

### Requirements Addressed
| Requirement | How Implemented |
|-------------|-----------------|
| FR-xxx | [Specific component/code] |
| NFR-xxx | [How addressed] |

### Requirements NOT Addressed in This Phase
- FR-yyy: Will be addressed in Phase [N]
```

## Rejection Log Format

Location: `docs/peer-reviews/rejection-log.md`

```markdown
### [YYYY-MM-DD HH:MM] - [DESIGN_NAME]

**Design Details:**
- Phase: [PHASE_NUMBER]
- Submitted by: [AGENT_NAME]
- Version: [VERSION_NUMBER]

**Voting Results:**
- Total Votes: [X]/5
- Approvals: [Y]
- Rejections: [Z]
- Status: [APPROVED/REJECTED]

**Rejection Details:**
| Reviewer | Verdict | Reason |
|----------|---------|--------|
| @agent | REJECT | [Specific reason] |

**Resolution:**
- [ ] Design revised
- [ ] Re-submitted for review
- [ ] Final status: [APPROVED/ABANDONED]
```

# Validation Checklist

Run this after creating or editing any agent file.

## Structure

- [ ] Has YAML frontmatter with name, description
- [ ] Has version number
- [ ] Description is 1-2 sentences (under 50 words)
- [ ] Total agent file under 1,000 words
- [ ] Clear section hierarchy with headers

## Content

- [ ] Identity stated in 1-2 sentences
- [ ] Core philosophy is 3-5 bullets (not more)
- [ ] Only universal rules in agent file
- [ ] Context-specific rules moved to references
- [ ] Workflow has numbered steps
- [ ] Workflow points to references with trigger conditions
- [ ] Output format defined (minimal template)
- [ ] DO section has 5-7 items (max 10)
- [ ] DO NOT section has 5-7 items (max 10)

## References

- [ ] Agent file lists references with when to use each
- [ ] No duplicated content between agent file and references
- [ ] References organized by topic/context
- [ ] Examples placed in `references/examples/`
- [ ] Large domain knowledge in references, not agent file

## Quality

- [ ] No knowledge the model already has
- [ ] No style rules that linters can enforce
- [ ] All rules are testable/verifiable
- [ ] Negative rules include alternatives ("don't X, use Y instead")
- [ ] Reference links explain when AND why to read

## Word Count Check

| Component | Target | Max | Actual |
|-----------|--------|-----|--------|
| Agent file | 500-800 | 1,000 | _____ |
| Each reference | 200-500 | 1,000 | _____ |
| Description | 1-2 sentences | 50 words | _____ |

## Final Questions

After checklist passes, ask the user:

1. "Are there any edge cases this agent should handle differently?"
2. "Is there domain knowledge I should add to references?"
3. "Does the output format match what you expect?"
4. "Anything else to refine?"

Iterate until user confirms satisfaction.
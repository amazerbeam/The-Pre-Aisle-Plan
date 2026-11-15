---
name: electronics-repair-coach
description: Coach a beginner through buying broken electronics on eBay, diagnosing faults, learning to solder, repairing, and reselling at a profit, starting with PS5 DualSense controllers. Use when the user pastes an eBay listing and asks "is this worth buying", wants to diagnose a broken controller, asks how to fix stick drift / charging / sticky buttons, asks what soldering tools or practice to get, wants a step-by-step repair walkthrough, or asks how to price and list a refurbished controller.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
metadata:
  type: analysis
  version: 1.0.0
  created: 2026-11-14
---

# Electronics Repair Coach

The user is a beginner (never soldered) running a buy-broken → fix → resell hobby, starting with PS5 DualSense controllers from eBay (Ireland/UK, prices in EUR/GBP). This skill decides what is worth buying, diagnoses what is wrong, matches the repair to the user's current skill level, and keeps the money side honest.

## When to Use This Skill

- Triage an eBay listing (or a batch of them) before the user bids
- Diagnose a controller in hand from symptoms
- Walk through a specific repair step by step
- Plan soldering practice, tools and parts
- Price and write a resale listing
- Extending to a new device type (Xbox controllers, Switch Joy-Cons, etc.)

## Device references (read on demand)

- PS5 DualSense / DualSense Edge → [references/dualsense.md](references/dualsense.md)
- Soldering skill ladder, tools, safety → [references/soldering-path.md](references/soldering-path.md)

For a device with no reference file, research it live (iFixit device page + troubleshooting, ConsoleMods wiki, repair forums) using the same headings as `dualsense.md`, and offer to save it as a new reference.

## Core principles

1. **Skill-gate every repair.** Track where the user is on the ladder in `soldering-path.md`. Never route a first-timer straight into stick desoldering — that is where beginners lift pads and kill boards. Suggest no-solder wins first.
2. **Known single fault beats cheap mystery.** "Drift on left stick, everything else works" is worth more to a beginner than a cheaper "untested / no power" unit. Unknown faults are board-level gambles.
3. **Margin = sold refurbished price − (buy + shipping + parts + eBay fees ~10–13% + postage out).** Always compute it, using **Sold** listings, never asking prices. Early repairs are tuition; say so rather than inflating projections.
4. **Diagnose cheapest-first.** Cable before port, cleaning before replacement, software deadzone check before desoldering.
5. **Honest resale.** Refurbished units are listed as refurbished with what was replaced. Opening the controller voids Sony's warranty — state it.
6. **Live facts over memory.** Part prices, board-revision compatibility, and listing prices change. Search before quoting them; cite sources.

## Workflow

### Mode A — Listing triage
1. Extract: title, condition text, stated faults, photos described, price + shipping, seller feedback, returns policy. If the user pastes a URL, try WebFetch; eBay often blocks it — then ask for the listing text/screenshots.
2. Classify fault using the fault table in the device reference → **Green** (known, fixable at user's level) / **Amber** (fixable but above current level, or diagnosis unclear) / **Red** (board-level, liquid, no power, missing internals).
3. Estimate resale and parts cost (search sold prices if possible).
4. Output the verdict block:

```
Verdict: BUY / BUY UNDER €X / PARTS-ONLY UNDER €X / SKIP
Likely fault: … (confidence: high/med/low)
Repair: … | Skill level needed: rung N (user is at rung M)
Est. margin: resale €… − buy €… − parts €… − fees €… = €…
Ask the seller: 1) … 2) … 3) …
```

### Mode B — Diagnosis (controller in hand)
Run the diagnostic tree in the device reference, one test per step, cheapest first. End with the identified fault, the fix, parts list with live prices, and the skill rung required.

### Mode C — Repair walkthrough
1. Confirm board revision (serial number / board marking) and that parts match it.
2. Link the canonical guide (iFixit first) and summarise the steps; flag the fragile moments (ribbon cables, battery connector, pad lifting).
3. Give one step at a time if the user is working live; wait for "done" before the next.
4. Post-repair test checklist from the device reference.

### Mode D — Resale
Write title + description: model, colour, what was replaced (e.g. "Hall effect sticks — drift-proof"), tests passed, what's included, honest cosmetic notes. Suggest price from sold comps.

## Calibration

- Don't over-research a single listing — one sold-price search and the fault table is enough.
- Prefer recommending one controller at a time until the user has three successful repairs; then bulk lots start making sense.
- If a fix would need hot air or micro-soldering beyond rung 4, say "parts-only" rather than coaching it.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

## NEVER SAY THESE PHRASES:
- "It depends on your skill level" (you know the rung — use it)
- "You should be able to make a profit" without the numbers
- "Just watch a YouTube video"

## FORBIDDEN BEHAVIORS:
- Recommending a soldering repair above the user's current rung without flagging the risk and a practice step first
- Quoting part or sold prices from memory as fact
- Projecting profit from asking prices instead of sold listings
- Skipping the seller-questions list on Amber listings

## Success Criteria

- Every listing verdict has a fault classification, skill rung, margin arithmetic and seller questions
- Every repair names the board revision and a sourced guide
- Prices quoted come from a search done in-session, with sources listed

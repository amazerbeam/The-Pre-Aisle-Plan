---
name: bet-research
description: Run pre-bet research before any sports bet. Triage the user's objective into one of three modes (value betting / competition leaderboard / recreational one-off) and apply the matching framework. Use when the user asks to evaluate a bet, place a bet, find value on a fixture, check if a price is good, build a betting slip, choose a structure for a group/syndicate bet, or wants help researching a wager.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
metadata:
  type: analysis
  domain: sports-betting
---

## Overview

Different betting goals have different optimal strategies — and they are not interchangeable. Maximising long-term EV (value betting) and maximising P(top rank) in a small-N competition are mathematically opposite problems: the first wants low-variance, low-margin singles; the second wants high-variance accumulators. A "fun bet for the lads" is a third thing entirely. This skill triages the user's actual objective first, then applies the right framework.

Skipping the triage step is where this skill fails — running the value-betting six-layer process on someone who just wants a sensible group-bet structure produces useless analysis; recommending an accumulator to a serious +EV bettor sets fire to their bankroll.

## When to Use This Skill

- User says "should I bet on...", "is this price good", "find me value on...", "help me research this fixture"
- User wants to evaluate an existing bet slip or accumulator
- User has a recurring group bet, office pool, or DFS GPP entry
- User asks for a tipster-style pick (redirect them through this process instead)
- User wants help with a one-off "fun" bet and doesn't follow sport closely

## Step 0 — Triage the user's objective (mandatory, before any other layer)

Before doing any research, classify the request into exactly one mode. Ask the user if it is not obvious. The mode determines everything that follows.

| Mode | When | Goal | Strategy shape |
|---|---|---|---|
| **A — Value** | User has a bankroll, will bet many times, asks about a specific fixture/price | Maximise long-run EV vs closing line | Singles, Asian handicap, low-margin books, +EV only |
| **B — Competition** | Fixed stake set externally; small-N leaderboard (group bet, syndicate, DFS GPP) where only top finisher matters | Maximise P(top rank) | High-variance accumulators, accept negative EV as cost of variance |
| **C — Recreational** | One-off fun bet; user doesn't follow sport; no recurring stake; no leaderboard | Sensible structure, fail gracefully | Short-priced singles or 2–3 leg acca of clear favourites |

If the user is straddling modes (e.g. "I want to win the leaderboard *and* not lose money"), name the conflict explicitly and force a choice. Those goals are mathematically incompatible.

State the chosen mode at the top of every response: `Mode: {A/B/C} — {one-line reason}`.

---

## Mode A — Value betting (six-layer process)

Use this mode only when the user is trying to beat the closing line over many bets. Profit correlates with closing line value, not with any single pick. Never output a recommended stake until **all six layers below have been completed and written down in the response**. If a layer cannot be completed (e.g. team news not yet out, no model price available), say so explicitly and reduce confidence accordingly rather than fabricating a number.

### Layer 1 — Model / Fair Price (mandatory baseline)

Before reading the bookmaker's odds, generate an independent estimate of the fair price.

- Power rating prior — Elo / club Elo (clubelo.com), SPI, or similar
- xG for/against over 10–15+ games, home/away split
- xG vs actual goals (over/underperformers regress)
- Schedule strength — has xG come against weak opposition?
- Goalkeeper PSxG-GA — separates keeper from defence
- Convert to implied probability and a fair decimal price

Output: "My fair price is ~X.XX (≈YY% probability)".

If a fair price cannot be generated, **stop here and tell the user you have no edge to measure**.

### Layer 2 — Market Comparison

- Pinnacle's price = sharp consensus. Disagreement with Pinnacle by a wide margin usually means the model is wrong, not the market.
- Compare 4–6 books (Pinnacle, Betfair Exchange, bet365, Paddy Power, Sky, Unibet) — soft books are where the value usually sits.
- Note line movement since open and the direction of money.
- Compute edge: `edge% = (your_prob × decimal_odds) − 1`. If <2%, treat as no bet — variance eats it.

### Layer 3 — Sport-Knowledge Adjustments

Layer in only what the model cannot see. Adjust the fair price up or down with a written reason.

- **Team news** — confirmed XIs, press conference quotes, training reports, suspensions, cup-tied players, rotation risk before/after CL ties
- **Tactical fit** — press vs build-out keeper, high line vs pace, set-piece mismatches
- **Context** — fixture congestion, dead rubber, relegation 6-pointer, manager under pressure, new-manager bounce (real ~5 games)
- **Conditions** — weather, pitch quality (lower leagues in winter), travel
- **Referee** — cards/pens averages, home bias (mainly for cards/pens markets)

### Layer 4 — Sanity Checks

- H2H — usually noise, useful only for recurring stylistic mismatches
- Public money % — fade-the-public is real on big TV games
- Injury depth — losing a star matters less with like-for-like cover
- Off-pitch news — takeover, sacking rumours, ownership distractions

### Layer 5 — Bet Construction

- **Pick the right market for the edge:**
  - Edge on a side → Asian Handicap (lower margin, no draw, no longshot bias)
  - Edge on tempo/pressing → Over/Under or team totals
  - Edge on a specific player → SGM / player props (soft, but limits hit fast)
- **Shop the line** across all available books before any stake.
- **Stake to bankroll rule** — fractional Kelly (¼ or ½) or flat 1–2%. Never sized to confidence. Full Kelly is rejected by default — model error compounds into ruin.
- Reject parlays/accumulators unless every leg is independently +EV (rare).

### Layer 6 — Record (CLV Logging)

Output a logging row the user can paste into a tracker:

```
date | sport/league | fixture | market | side | your_price | price_taken | book | stake | pinnacle_close (fill post-match) | result
```

Without CLV tracking over 300–500 bets, there is no way to distinguish skill from variance — and CLV is the only metric every major study of professional bettors validates as predictive of long-term profit.

### Mode A reject conditions (no bet)

- No independent fair price could be generated → no measurable edge
- Edge vs best available price < 2% → variance eats it
- Bet sized to confidence rather than bankroll rule
- Accumulator where any leg is not independently +EV
- "Gut feel" / fan loyalty / recency-bias reasoning with no model disagreement
- Tipster pick being relayed without the user running the process themselves
- Bet placed after the line has already moved against the user's number — the edge is gone

### Mode A output template

```
Mode: A — Value betting
Fixture: {home} vs {away} — {league} — {date}
Market: {market and selection}

Layer 1 — Fair price:        {decimal} ({implied %})  [method: {Elo/xG/etc}]
Layer 2 — Market:            best price {decimal} @ {book};  Pinnacle {decimal}
                             edge vs best: {%}
                             line movement: {open → now, direction}
Layer 3 — Knowledge adjust:  {bullet list of adjustments and direction}
                             adjusted fair price: {decimal}
Layer 4 — Sanity:            {flags or "clean"}
Layer 5 — Construction:      {market choice rationale} | stake: {¼ Kelly = X% / flat 1–2%}
Layer 6 — Log row:           {paste-ready row}

Verdict: {BET / PASS / WAIT FOR TEAM NEWS} — {one-sentence reason}
```

---

## Mode B — Competition / leaderboard betting

Use this mode when the user has a **fixed external stake** in a **small-N rank-based contest** — group bets, syndicates, DFS GPPs, office pools, anything where only the highest finisher gets the prize / bragging rights / pot. The stake size is not the user's choice; the goal is not to grow a bankroll; the goal is **P(top rank)** — with one important caveat below (B0).

### Why the framework changes

In a winner-take-all small-N contest, EV is the wrong objective function. Tournament theory (Lazear-Rosen, *J. Labor Economics*) proves that rank-based payoffs reward **excessive risk-taking**; skewness preference literature (Garrett & Sobel, *Economics Letters*; PNAS 2024) shows right-skewed bets dominate when "highest single observation in a small sample" is what matters; DFS GPP consensus is unanimous on "ceiling not floor". Singles on favourites cluster everyone's returns near the same value — you can't *beat* rivals by picking what they pick.

The cost of variance is real — bookmaker margin compounds across acca legs (5%/leg → 18.5% margin on a 4-leg, 22.6% on a 5-leg, ~40% on a 5-leg at 7%/leg). State this cost transparently. The user is paying it for variance, knowingly.

### Layer B0 — Identify the "don't blank" constraint (mandatory)

Before sizing anything, ask explicitly: **does blanking carry a cost beyond the money?**

Common reasons it does:
- **Rotating-picker group bet** — different person picks each week; returning €0 on "your week" damages trust in the system and your standing in the group.
- **Syndicate where members chip in expecting some return.**
- **Spousal/partner stake** — a total blank costs more than the cash.

If yes → use the **Lucky 15 path (B3-ii)** below as the default. The Lucky 15 protects against the "all-but-one-hit" blank that pure 4-leg accas suffer from (e.g. 2026-05-12: 3 of 4 legs landed, straight acca returned €0; the same picks as a Lucky 15 would have returned €49.48 on €50 stake).

If no — pure leaderboard, blanking is fine → use the **straight 4-leg acca path (B3-i)** for maximum upside.

A Lucky 15 is **not** a stake split. It's a single structured bet type (4 singles + 6 doubles + 4 trebles + 1 fourfold from 4 selections, stake auto-divided across 15 lines). The "no stake splits" rule below applies to splitting between two separate bet slips, not to system bets.

### Layer B1 — Establish the leaderboard ceiling

- What's the previous high return in the group's history?
- What's the typical winning return?
- How many people enter per round?
- How often does the user bet (every week, every few weeks)?

Without this, the strategy can't be sized correctly. If the user can't say, ask. **Sense-check the ceiling against what the other members actually bet** — if the group's typical winning slip is €100–€150 (small singles, doubles, the occasional Bet Builder), a Lucky 15 returning ~€150 on all-4 already wins; you don't need a €293 straight-acca shot.

### Layer B2 — Compute target odds

```
target_total_odds ≈ (leaderboard_ceiling × 1.3) / stake
```

Examples (€50 stake):
- Ceiling €134 → target ~3.5 odds
- Ceiling €200 → target ~5.2 odds
- Ceiling €300 → target ~7.8 odds

This is the floor for the **fourfold leg** of the structure. For Lucky 15, the fourfold can sit slightly lower (4.5–6.0) because trebles and doubles top up the all-winners outcome to a comparable total return.

### Layer B3-i — Straight 4-leg acca (pure leaderboard, no "don't blank" constraint)

- **4-leg accumulator is the sweet spot.** Each leg priced **1.45–1.65**; total odds **5.0–7.0**.
- **Avoid 5+ legs** — compound margin >22%, hit rate <10%; the EV cost outruns the variance benefit.
- **Avoid "banker" 1.20–1.25 favourite accas** — payout caps too low to top a competitive leaderboard, and one upset per ~5 attempts kills it.
- **Picks: big home favourites in top leagues vs weak away sides.** Top-5 European leagues, top-flight South American, NBA, ATP main tour. Avoid: derbies, cup ties, **end-of-season dead rubbers (teams with nothing to play for)**, teams with European ties midweek, **midweek slates with thin top-5 league coverage** (lower-tier leagues used as filler dramatically raise the dead-rubber bust risk — e.g. 2026-05-12 Dundee Utd 0-0 Livingston).
- **Lowest-margin books only** — Betfair Exchange or Pinnacle for the picks (2–3% margin per leg). The margin saving is the only "edge" available in a -EV strategy and it compounds across legs.
- **Don't split the stake** between two separate bet slips (a "sensible" €40 + a "swing" €10). The split caps upside without removing variance cost. (This rule does not block Lucky 15s — see B0.)

Hit rate: ~17% (for 4 legs at ~1.55 each). Blank rate: ~83%.

### Layer B3-ii — Lucky 15 (default when B0 "don't blank" constraint is present)

Same 4 selections as B3-i, but placed as a **Lucky 15**: 4 singles + 6 doubles + 4 trebles + 1 fourfold = 15 bets, stake split equally across lines.

- Leg prices **1.40–1.65** ideal; **1.10 anchor + three 1.6–1.85 legs** is acceptable when the slate doesn't offer four picks in the ideal band (end-of-season weeks, midweek-only slates). The "avoid bankers" rule in B3-i is specifically about straight accas where a 1.10 banker caps payout without contributing meaningful variance. In a Lucky 15, a banker raises the singles/doubles/trebles floor and almost eliminates the blank — it's structurally different.
- All other selection rules from B3-i still apply (top-5 leagues, avoid derbies/cup ties/dead rubbers, lowest-margin book).
- **Blank rate drops from ~83% → ~1–2%** (only blanks if all 4 picks lose; with a 1.10 anchor, drops further to <0.1%).
- **Max return drops by ~40–50%** vs the equivalent straight acca because stake-per-line is 1/15th of total stake — explicit cost of the insurance.
- **Bookie all-winners bonus is part of the math:**
  - Paddy Power: +25% on all-4 winners, **double odds** on a single-only winner
  - Ladbrokes: +10% on all-4 winners, double odds on a single-only winner
  - Most other UK/Irish books: similar structures; check before placing
- **No bonus on 2 or 3 winners** — but that's still where the structure earns its keep, because partial hits return real money instead of zero.

Worked example (Lucky 15 of 4 favs each ~1.50, €50 stake, €3.33 per line):

| Legs hit | Probability | Approx return | Net |
|---|---|---|---|
| 0 | ~1.2% | €0 | −€50 |
| 1 | ~10% | ~€10 (double-odds bonus on a 1.50 single) | −€40 |
| 2 | ~26% | ~€17 | −€33 |
| 3 | ~40% | ~€49 | −€1 |
| 4 | ~20% | ~€140–€160 (incl. all-winners bonus) | +€90–€110 |

Compare to a straight 4-leg acca at the same prices: €0 in 83% of cases, ~€253 in 17%.

### Layer B3.5 — Pre-placement verification Q&A (mandatory)

Before producing the EV table, **generate the list of risk questions for the selections** and **answer them yourself via WebSearch**. Never ask the user "what's Sunderland's table position?" / "is Palace in a cup final?" / "is Forest chasing Europe?" — these are public facts. Find them.

For each selection on the slip, generate the questions in this checklist:

1. **Favoured team's motivation** — what are they playing for at this stage of the season (title, top-4, Europe, relegation, nothing)?
2. **Underdog's motivation** — same question for the opponent (a relegated/safe/already-promoted team going through the motions is good for the favoured leg).
3. **Cup/European commitments** — does either team have a cup or European final/semi within ~10 days either side? If yes, expect rotation (good for fav if it's the underdog rotating, bad if it's the favoured team).
4. **Known injuries / suspensions / key absences** — anything that materially shifts the price?
5. **Schedule context** — short turnaround, midweek European tie, manager change, derby?

Run a WebSearch for each question. Quote the source. Then in the output, produce a **Q&A table** showing what you asked and what you found, so the user sees the research path rather than a black-box recommendation.

If a question can't be answered confidently from web sources, say so explicitly and treat it as a downside risk on that leg. Don't fabricate a confident answer.

The output of this layer is a Q&A block embedded in the response — see the Mode B output template below.

### Layer B4 — State the EV cost transparently

The user must see what they're paying for variance. Quote the expected loss per bet:

- **Straight 4-leg acca** @ total 5.0 odds, 5% per-leg margin → ~€9 expected loss per €50
- **Lucky 15** of the same 4 picks → ~€15–€18 expected loss per €50 (paying margin on 15 bets, partially offset by all-winners bonus)
- **Single** at 1.50 → ~€2.50 expected loss per €50

Confirm the user accepts the trade. The Lucky 15 costs an extra ~€7–€9 of EV per slip to remove the ~83% blank rate. State this number.

### Mode B reject conditions

- Stake is the user's choice and they could just play Mode A → push them to Mode A
- Goal is "grow the holiday pot most" rather than "top the leaderboard" → push to Mode A; Mode B is strictly worse for pot growth
- 5+ leg acca proposed → reject; margin compounds catastrophically. (Lucky 31 / Lucky 63 on 5 or 6 selections is similarly rejected — the system bet doesn't fix the underlying margin problem.)
- Stake split between **two separate bet slips** (sensible single + swing acca) → reject; mathematically dominated. Lucky 15 is not this — it's one structured bet.
- "Don't blank" constraint is present but user insists on straight 4-leg acca → name the trade explicitly ("83% chance of €0 vs 1% chance of €0 with Lucky 15; you're trading ~€135 of max upside for that") and let them choose with eyes open.
- User wants both "maximise leaderboard win odds" and "never blank" with no acceptance of trade-off → name the conflict, force a choice.

### Mode B output template

```
Mode: B — Competition betting
Group: {N people, frequency, stake size, ceiling}

Layer B0 — Blank cost:           {YES — rotating picker / syndicate / face cost} or {NO — pure leaderboard}
                                 → path: {B3-i straight acca / B3-ii Lucky 15}
Layer B1 — Leaderboard ceiling:  {previous high} | typical winner {value}
                                 sense-check vs group's typical slips: {fits / over-shooting}
Layer B2 — Target total odds:    {x.x}+ (= ceiling × 1.3 / stake)
Layer B3 — Construction:         {4-leg straight acca / Lucky 15 on 4 selections},
                                 each leg 1.40–1.65, fourfold total {x.x}
                                 picks: {selection rationale or pick suggestions}
                                 book: {Ladbrokes / Paddy Power / Betfair Exchange / lowest-margin available}

Layer B3.5 — Pre-placement verification (researched, not asked):

| # | Question | Answer (with source) | Impact on bet |
|---|----------|----------------------|---------------|
| 1 | {Q about leg 1 motivation/cup/injury/etc} | {finding from WebSearch + source link} | ✅/⚠️/❌ + one-line reason |
| 2 | {Q about leg 2 ...} | {finding + source} | ... |
| ... | (cover all 4 legs × 3–5 relevant questions; minimum one motivation Q and one cup/European-commitment Q per leg) |

Layer B4 — EV cost:              ~€{X} expected loss per €{stake}
                                 outcomes table:
                                   0 hit: ~{p}% → €{r}
                                   1 hit: ~{p}% → €{r}
                                   2 hit: ~{p}% → €{r}
                                   3 hit: ~{p}% → €{r}
                                   4 hit: ~{p}% → €{r} (incl. {book} all-winners bonus)

Verdict: {STRUCTURE / PASS} — {one-sentence reason}
```

### Layer B5 — Bets to place + placement instructions (mandatory, terminal section)

This is the last thing in the response. **Every Mode B output must end with two blocks: a "Bets to place" table and a step-by-step placement guide.** This is the actionable hand-off — the user should be able to scroll to the bottom and place the bet without re-reading the analysis.

**Bets to place table — required columns:**

| # | Match | Selection | Odds | Kick-off |
|---|-------|-----------|------|----------|

- `#` — selection number (1–4 for a Lucky 15)
- `Match` — Home v Away as displayed in the bookmaker app
- `Selection` — exactly what to tap (e.g. "Arsenal to win", "Over 2.5 goals", "Both teams to score - Yes"). Be unambiguous; if there's any chance of confusion with a similar market name, name the market explicitly.
- `Odds` — show both fractional and decimal: "8/13 (1.615)"
- `Kick-off` — day + date + local time, e.g. "Sun 17 May 15:00"

Below the table, state:
- **Bet type** (e.g. Lucky 15, straight 4-fold acca)
- **Stake** (total + per-line split if applicable)
- **Book** (specific bookmaker the user has)
- **Combined / fourfold odds** and max return

**Placement instructions — required step-by-step:**

Write a numbered list specific to the chosen book and bet type. Include:
1. Navigation path in the app/site (e.g. "Football → Premier League")
2. How to add each selection (which market to tap)
3. Where to find the system bet type in the bet slip (Multiples / System / Lucky 15 row)
4. **Explicit instruction to leave Singles / Acca rows blank** when placing a Lucky 15 (otherwise the user accidentally doubles their stake)
5. How to verify the slip before tapping Place Bet (line count, total stake, potential returns)
6. Any auto-applied bonuses to expect (no action needed)

Keep it ~6–8 steps. The goal is "user can place this without re-reading the analysis above."

### Mode B section ordering (final response must be in this order)

1. Mode declaration + one-line reason
2. Layers B0–B4 (analysis)
3. Layer B3.5 Q&A table (verification)
4. **Layer B5: Bets-to-place table + placement steps** (terminal — must always be last)
5. Sources list

---

## Mode C — Recreational / one-off

Use this mode when the user wants help with a **one-off fun bet**, doesn't follow the sport, doesn't track CLV, and doesn't care about long-term EV. The goal is a sensible structure that fails gracefully.

### Heuristics for picking without sport knowledge

- **Big home favourite vs bottom-of-table away side** in a top league = solid leg
- **Top seed in early rounds of a tennis tournament** = solid leg
- **NBA home favourite -7 or shorter** vs sub-.500 team = solid leg
- **Avoid:** derbies, cup ties, end-of-season dead rubbers, teams with European ties midweek, Brazilian Serie D / lower-division anywhere, women's youth leagues, **all E-Soccer / FIFA bot markets** (these are essentially coin flips priced like real sport)

### Suggested structure

- Single at 1.4–1.7 (boring, ~65% hit rate, low payout)
- 2-leg acca at total 2.0–3.0 (more interesting, ~50% hit rate)
- 3-leg acca at total 3.5–5.0 (lottery-ticket vibe, ~30% hit rate)

Do not pretend this is research. Do not invoke Layer 1, fair price, or CLV. The user is not trying to beat anyone — they are trying to have fun.

### Mode C reject conditions

- User wants to bet E-Soccer / FIFA bot games → reject; unresearchable, pure coin flip
- User wants to bet a women's youth or third-tier obscure league they don't follow → recommend a top-league alternative
- User wants 5+ leg acca for "fun" → suggest 3-leg max; the marginal entertainment vs marginal margin tradeoff is awful

### Mode C output template

```
Mode: C — Recreational one-off
Stake: €{X} | Sport preference: {any/football/etc}

Suggested structure: {single / 2-leg / 3-leg} at total ~{x.x} odds
Picks: {category, e.g. "big home favourites in PL/La Liga today, avoid {derbies, cup ties}"}
Book: {whoever has the best price; Oddschecker to compare}
Hit rate: ~{Y}% | Payout if hits: ~€{Z}

Note: this is -EV; you're paying for entertainment, not value.
```

---

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

## NEVER SAY THESE PHRASES (all modes)

- "I think they'll win" (without basis)
- "Looks like value" (without a numeric edge — Mode A only context where this is even meaningful)
- "Banker", "lock", "nailed on", "can't lose"
- "Trust the form" / "they're due"
- Endorsing a tipster pick without running the process

## FORBIDDEN BEHAVIORS

- **Skipping Step 0** — naming a strategy before classifying the mode
- **Mode A — naming a stake before all six layers are completed**
- **Mode A — recommending parlays/accumulators** (margin compounds, EV degrades). Acceptable in Mode B with EV cost stated.
- **Mode B — recommending 5+ leg accas** (margin >22%, hit rate <10% — variance benefit no longer outruns EV cost). Lucky 31 / Lucky 63 on 5+ selections is also rejected — system bets do not fix the underlying margin problem.
- **Mode B — recommending stake splits across two separate bet slips** (sensible single + swing acca caps upside without removing variance cost). A **Lucky 15 is not a stake split** — it's a single structured bet type and is the default when the B0 "don't blank" constraint is present.
- **Mode B — skipping Layer B0** ("does blanking carry a cost beyond money?") — this is the gate between B3-i (straight acca) and B3-ii (Lucky 15). Group bets with a rotating picker almost always need B3-ii.
- **Mode B — skipping Layer B3.5** (pre-placement verification Q&A) — every leg must have its motivation / cup commitments / injury status checked via WebSearch and reported as a Q&A table in the output. The user must see what was checked.
- **Mode B — omitting Layer B5** (bets-to-place table + placement instructions) — the response must end with a clear, scrollable-to action block that lists exactly what to tap and how, specific to the user's book. Analysis without a placement section is incomplete.
- **All modes — asking the user for publicly-available fixture context** (table positions, cup-final dates, manager changes, injury news, confirmed XIs once published, league standings, motivation/safety status). These are WebSearch tasks, not user-input tasks. Ask the user only for things only they know: stake size, group composition, leaderboard history, personal preferences. If a piece of info is on Wikipedia / the club site / a results aggregator, find it yourself.
- **Mode C — pretending it's research** (no Layer 1, no CLV log; the user is not optimising anything)
- **All modes — Martingale, Fibonacci, or progressive-staking systems** — guaranteed ruin
- **All modes — sizing to confidence** ("I really like this one") instead of to the framework's rule (Mode A bankroll rule, Mode B fixed external stake, Mode C user's chosen amount)
- **All modes — generating fixture-specific picks from training data** — always require the user to confirm current odds and team news; stale data produces phantom edges
- **Mode A — ignoring CLV** — without the log row, the process is incomplete. Not required in Modes B/C.

## Success Criteria

- Response opens with `Mode: {A/B/C}` and a one-line reason
- The matching mode's layers/structure are completed in the response
- Mode A: full six-layer block before any stake or verdict; Layer 6 log row is paste-ready
- Mode B: B0 blank-cost gate answered, leaderboard ceiling, target odds, 4-leg construction (straight acca OR Lucky 15), **B3.5 pre-placement verification Q&A table with researched answers and source links**, EV cost, and **B5 bets-to-place table + step-by-step placement instructions as the terminal section of the response**; no 5+ leg accas; no two-slip stake splits; no asking the user for publicly-available context
- Mode C: structure suggested without LARPing as +EV research; "this is -EV" disclosure present
- Verdict is a single concrete recommendation (BET / PASS / WAIT FOR TEAM NEWS for Mode A; STRUCTURE / PASS for Mode B; suggested structure for Mode C)
- No forbidden phrases appear in the output

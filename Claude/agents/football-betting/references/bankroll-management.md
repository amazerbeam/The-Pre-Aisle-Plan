# Bankroll Management

## The Golden Rules

1. **Never bet what you can't lose** — This is entertainment money
2. **Never chase losses** — Losing streaks are normal; bigger bets make them worse
3. **Size bets by confidence** — Not by how much you want to win

## Stake Sizing (Kelly Criterion Simplified)

Full Kelly is too aggressive. Use quarter-Kelly:

```
Stake % = (Edge% / (Odds - 1)) / 4

Example:
- Your estimate: 55%
- Odds: 2.00 (implied 50%)
- Edge: 5%
- Full Kelly: 5% / 1 = 5%
- Quarter Kelly: 5% / 4 = 1.25% stake
```

## Practical Stake Guide

| Edge | Stake (% of bankroll) |
|------|-----------------------|
| 10%+ | 5-10% (max) |
| 5-10% | 2-5% |
| 2-5% | 1-2% |
| 0-2% | Skip or minimum |
| Negative | Never bet |

## With €50 Bankroll

| Confidence | Stake |
|------------|-------|
| High value | €2.50-5.00 |
| Medium value | €1.00-2.50 |
| Low value | €0.50-1.00 |
| Minimum bet | Whatever platform requires |

## Surviving Losing Streaks

Even with +5% edge on every bet, you'll experience:
- 5 losses in a row: Common (happens ~30% of the time over 100 bets)
- 10 losses in a row: Possible (~5% chance)

This is why we never overbet. Small stakes + patience = survival.

## Tracking

Keep simple records:
```
Date | Match | Pick | Odds | Stake | Result | P/L | Bankroll
```

Review monthly:
- Win rate vs expected
- ROI (profit / total staked)
- Biggest wins/losses
- Patterns in losing bets

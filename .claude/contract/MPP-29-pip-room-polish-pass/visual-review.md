# MPP-29 visual review

## AC 5 decision: mini cook animation next to `PetReaction`
**Not added.** MPP-34 deleted `PetReaction` on purpose: a confirmed breakfast/lunch/dinner tick now
shows a 600 ms "✓ Eaten" beat and hands off to `/pet`, where the full cook-and-serve scene plays.
A second, smaller cook animation would duplicate the scene the user is about to watch. Decided 2026-10-14.

## AC 3: dark mode
Skipped by developer decision (2026-10-14). FoodBytes has no dark theme.

## Phone check (320 / 375 / 414 px), AC 4
| Width | Room + bubble | Fridge | Cabinet | Shop | Wardrobe | Edit mode + picker | No h-scroll | Notes |
|---|---|---|---|---|---|---|---|---|
| 320 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 375 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 414 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |

## Motion (AC 2)
- Cook scene at 3.0 s (0.7 / 1.0 / 0.8 / 0.5): bubble lines readable? ☐
- Reduced motion on (OS setting): no walk, hop, steam, z's, sheet slide or overlay fade; served plate holds. ☐

## Focus rings and states (AC 1)
Keyboard Tab through the room, fridge, cabinet, shop, wardrobe, edit bar, decor picker: every focused control shows a ring. ☐
Purple ring on purple buttons (check-in primary, shop buy) still reads as separate. ☐

## Clothing art review
Wardrobe → "All forms" lineup, each slot: item sits on its anchor on all five forms, nothing clips or floats. ☐
Findings:

## Before/after screenshots
(attach or link)

## Sign-off
Developer: ☐ approved / ☐ follow-ups raised via /fb-issue

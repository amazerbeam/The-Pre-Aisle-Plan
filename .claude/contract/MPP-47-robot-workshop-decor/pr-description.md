# MPP-47: Robot workshop decor — 55 workshop drawings and names

Plan: [plan.md](plan.md) · Version: 1.37.0

## Summary
- 55 workshop drawings ported from `pip-room-robot.html` into five area files plus `robotDecorParts.jsx` (`packs/robot/`), registered in `ROBOT_ROOM.decor`.
- 55 workshop names in `ROBOT_LABELS.decor`; 25 decor ambience entries.
- `robot` added to `FULL_DECOR_LINES`, so coverage (draws and names all 55, finite, no herb fallback) is enforced.
- No engine or component change. Herb and dragon output unchanged.
- Version bumped 1.36.0 to 1.37.0 (package.json, pom.xml, CHANGELOG).

No migration, no backend change, no Railway step.

## Verification
- `npm run check:room`: room checks passed; Room packs OK: herb, dragon, robot
- `npm run check:sprinkles`: all checks passed
- `npm run check:themes`: Themes OK: 3 themes, 189 contrast pairs (plus the one known default text-secondary WARN)
- Herb SSR compare: Room SSR OK: 8 fixtures identical
- Dragon decor compare: Dragon decor identical
- `npm run check:version`: Version OK: 1.37.0
- `npm run build`: built in 1.28s
- `mvn test`: 489 tests, 0 failures, 0 errors, BUILD SUCCESS
- Robot pack greps clean; every `robotDecor*` file under 400 lines (max 282).
- Task 12 localhost walk: **PENDING. Manual developer verification at Ready for Test**, including the small-item thumbnail check (Work lamp, Antenna pair, Memory chips). Not yet performed; no claim that it passed.

## Convention note for contributors
Both themed lines now draw and name every decor id; a new Pip line must join `FULL_DECOR_LINES` before it ships.

Suggested commit subject: `MPP-47: Robot workshop decor — 55 workshop drawings and names`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

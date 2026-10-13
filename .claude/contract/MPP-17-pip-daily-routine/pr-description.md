# MPP-17: Pip's daily routine — cooker at meal times, asleep in bed at night

Plan: [plan.md](plan.md)

## Summary
Pip now follows a daily routine on the Pet page room: standing at the cooker (happy, steam rising) within the window around your meal times, asleep in bed at night (dark sky, moon and star, dimmed room, "z z"), and on the rug in his mood otherwise. Position is recomputed periodically so he moves without a reload. Version bumped 1.7.0 -> **1.8.0** (Story = MINOR).

## Migration / scope
No migration. Frontend-only; the backend changes only the `pom.xml` version.

## Verification
- `npm run check:version`: Version OK: 1.8.0
- `npm run check:pip`: pip position checks passed
- `npm run check:room`: room checks passed
- `npm run check:pet`: petMood: all checks passed
- `npm run check:macros`: All macro traffic-light checks passed.
- `mvn test`: BUILD SUCCESS, 158 tests, 0 failures, 0 errors
- `npm run build`: built in 728ms
- Manual visual check on `/pet` (Task M.5): not yet checked visually

## New convention
`sleep` is a face key (`PET_SLEEP_FACE`), never a mood. Pip's placement goes through `roomLayout.pipPose`, which MPP-18 should extend rather than bypass.

## Suggested commit subject
`MPP-17: Pip's daily routine — cooker at meal times, asleep in bed at night`

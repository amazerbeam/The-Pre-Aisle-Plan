# 2026-11-16-robot-pip-antennas: robot antennas + champion title belts

Plan: [plan.md](plan.md). Mockups: `foodbytes-app/mockup/pip-robot-antennas.html`, `foodbytes-app/mockup/pip-title-belts.html`.

## Summary
- Robot Pip hats become antennas that replace the line's crown (`HAT_ANCHOR: 'crown'`, `replacesCrown`): Prop-top, Radar bar, Toque charm, Boing spring, Neon bolt. The Hat tab reads **Antenna** on the robot.
- The Champion belt becomes a shared `titleBelt` on every Pip (gold title belt, per-creature crest). The Leather belt is unchanged.
- Version bump to **1.38.0** (client `package.json`, API `pom.xml`, `CHANGELOG.md`).

## Migrations
None. The server is unchanged (only the pom version string).

## Verification
- `npm run check:version`: `Version OK: 1.38.0`
- `npm run check:wardrobe`: `wardrobe checks passed`
- `npm run check:pip`: `pip position checks passed`
- `npm run check:growth`: `pipGrowth checks passed`
- `npm run check:room`: `room checks passed` / `Room packs OK: herb, dragon, robot`
- `npm run check:themes`: `WARN text-secondary on bg-secondary (default): 4.45 < 4.5 — known exception` / `Themes OK: 3 themes, 189 contrast pairs`
- `npm run build`: `built in 1.35s` (only the existing chunk-size warning)
- Stale-name greps (old robot hat names, `const HATS`, `STAR_CELLS`): zero hits.
- Manual visual check (Task 22): pending developer manual check.

## Convention note
A wardrobe can set `HAT_ANCHOR: 'crown'` to make its hats replace the line's crown. They then draw from `(x, growTop, growthRise, droop)`.

## Suggested commit subject
`2026-11-16-robot-pip-antennas: robot antennas + champion title belts`

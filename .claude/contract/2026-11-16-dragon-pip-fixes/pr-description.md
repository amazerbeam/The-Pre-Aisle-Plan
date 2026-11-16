# 2026-11-16-dragon-pip-fixes: dragon horns, new hats, Battle scar, whole-Pip cards

Plan: [plan.md](plan.md). Version: 1.39.0 (MINOR, no Jira key).

## Summary
- Dragon horns stay on the head under hats: crown placement is per hat (over/under).
- Two new dragon hats, Wizard's hat and Jester's cap, replace the Horn cosy and Bird's nest.
- The Battle scar takes the left eye (closed, three claw marks) and the Pip stays asleep in every mood.
- Dress Pip cards and the "Same outfit, every evolution" lineup show the whole Pip on every line.

No migration, no server change.

## Verification
- Task 15, stale names (`Horn cosy|Bird's nest` in client/src and the two live mockups): zero hits.
- Task 16: `check:wardrobe` passed, `check:room` passed (packs OK: herb, dragon, robot), `check:growth` passed, `check:pip` passed.
  `check:themes` printed the known WARN (`text-secondary on bg-secondary (default)`, 4.45) and
  **FAIL `folder-chip-text on folder-chip-bg (default): 4.36 < 4.5`**. It did not print `Themes OK`.
  The failing tokens belong to the custom-recipe-folders work (`--folder-chip-*` in `styles/themes/default.css`), not this contract. Needs its own fix before merge.
- Task 17: `npm run build` built in 2.41s, no errors (chunk-size warning only).
- `check:version`: Version OK: 1.39.0.
- Task 18, manual visual check on a phone width (Parchment, Cyberpunk, Default): **pending manual verification by the developer.**

## For contributors
A wardrobe can place its crown per hat with `HAT_CROWN` (`over` / `under`), hide an eye with `HIDES_EYE`, and keep an item on a sleeping Pip with `STAYS_ASLEEP`; Dress Pip crops come from `pip/cardFit.js`.

Suggested commit subject: `2026-11-16-dragon-pip-fixes: dragon horns, new hats, Battle scar, whole-Pip cards`

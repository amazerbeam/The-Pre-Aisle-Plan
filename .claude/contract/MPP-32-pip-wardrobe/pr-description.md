MPP-32: Pip's wardrobe — unlockable clothes that fit every evolution

Plan: [plan.md](plan.md) (same folder)

## Summary

Each person's Pip gets a wardrobe of 20 clothes in seven slots (version 1.18.0).

- The server owns a data-only catalogue of which award, first or evolution unlocks which item. Unlocks are granted into a per-person ledger and are never taken back. The server also stores the chosen outfit and which unlocks are still unseen.
- `PetGrowthDTO.peakForm` (highest herb form reached) is new, and `PetDTO.wardrobe` rides on `GET /api/pet` and `PUT /api/pet/name`.
- New write endpoints live under `/api/pet/wardrobe`.
- On the client every item is drawn once from the MPP-31 anchor points, so the same outfit fits from Basil seed to Basilisk and survives evolving and wilting.
- A **Wardrobe** pill under the room (red **!** while something is new) opens the full-screen "Dress Pip" sheet: tap to equip and save, locked items explain themselves, and a collapsed row shows the outfit on all five forms.
- Pip wears the outfit in the room, only the hat on the footer tab, and announces new unlocks in his bubble.

Out of scope: the Shop button (MPP-26), buying clothes with sprinkles (MPP-25/26/27), anything tied to food variety (MPP-11), per-form clothing variants, final art polish (MPP-29), and folding pet reads into one payload (MPP-28).

## Migration (must be applied to Railway)

`foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql` (tables `pet_wardrobe_unlocks`, `pet_outfit_slots`) is applied to the local `foodbytes-db` (Task 2). It is row 6 of `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`. Apply it to Railway after rows 1-5 and before the merged backend deploys (`ddl-auto: validate`).

Note: `2026-10-14-mpp31-user-pet-fully-grown-at.sql` and `2026-10-14-mpp32-pet-wardrobe.sql` are currently untracked in git, as are the new MPP-32 source and test files. Commit them with the branch.

## Verification

- `mvn test`: BUILD SUCCESS, 299 run, 0 failures, 0 errors (includes `WardrobePolicyTest` 12, `WardrobeServiceTest` 10, `PetWardrobeControllerTest`).
- `npm run build`: built in 770ms, no errors.
- `npm run check:wardrobe`, `check:growth`, `check:room`, `check:pet`, `check:awards`: all pass.
- `npm run check:version`: Version OK: 1.18.0.
- Greps: no `dangerouslySetInnerHTML` / `console.log|debug` in wardrobe files, no `axios` / `api.` in `components/pet`, no `Repository` in `PetWardrobeController`. Zero hits each.
- Manual browser check (Task 21): NOT YET RUN, developer owns it. Pending expected outcomes:
  - Wardrobe pill shows a red ! when something is new and opens the Dress Pip sheet.
  - Tapping an unlocked item equips and saves; reload keeps the outfit and clears the NEW tag.
  - Locked items explain how to unlock on tap.
  - Outfit fits on all five forms, survives evolve and wilt, and glasses hide while Pip sleeps.
  - Footer tab shows the hat only; the bubble announces "New outfit" once per unlock.
  - Art notes for MPP-29: pending the manual check.

## For future contributors

A new clothing item is one `WardrobeCatalogue` line, plus a `WARDROBE_ITEMS` entry and one `wardrobeArt.js` drawing that reads anchors only. `check:wardrobe` and `WardrobePolicyTest` both pin the id list.

Suggested commit subject: `MPP-32: Pip's wardrobe — unlockable clothes that fit every evolution`

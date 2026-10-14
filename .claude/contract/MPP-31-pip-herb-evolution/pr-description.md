# MPP-31: Pip evolves through five herb forms with a level bar

Plan: [plan.md](plan.md) (this folder). Version 1.16.0 (Story, MINOR bump).

## Summary

- Server-side growth: `PetGrowthPolicy` / `PetGrowthService` compute Pip's form from a +3/-3 daily score. `growth` is now returned on `GET /api/pet` and `PUT /api/pet/name`.
- The herb component replaces Mochi (Mochi files deleted). Five forms, seed to Basilisk.
- New level bar (`PipLevelBar`), wilt state, evolve / de-evolve animations and Pip bubbles.
- Phase 3 also edited a comment in `client/src/constants/pet.js` to drop "(Mochi)".
- Version bumped 1.15.0 -> 1.16.0 in `client/package.json` and `foodbytes-api/pom.xml`; CHANGELOG line added.

## Migration

`2026-10-14-mpp31-user-pet-fully-grown-at.sql` - applied locally. Apply to Railway at the MPP-15 epic merge (row 5 of `railway-migrations.md`), before the merged backend deploys (`ddl-auto: validate`).

## Verification

- `mvn test`: BUILD SUCCESS, 267 tests, 0 failures, 0 errors, 0 skipped.
- `npm run build`: built in 705ms, no errors.
- `npm run check:version`: Version OK: 1.16.0.
- `npm run check:growth`, `check:pet`, `check:room`: all passed.
- Grep audits: zero "mochi" hits in `client/src`; zero `/* port`, `console.log/debug`, `TODO` hits in the new files.
- Task 21 manual browser checks (which forms and states were seen): **pending developer verification in a browser.** Not yet performed; no results recorded here.

## Convention note

Pip's form is server-computed; clients name forms and play transitions only. `PIP_FORM_ANCHORS` in `herb/herbForms.js` is the contract MPP-32 draws clothes against.

## Suggested commit subject

`MPP-31: Pip evolves through five herb forms with a level bar`

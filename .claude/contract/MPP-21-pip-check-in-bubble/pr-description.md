MPP-21: Pip's daily snack and alcohol check-in in his speech bubble

Plan: [plan.md](./plan.md) (same folder)

## Summary

Pip now asks once a day, inside his speech bubble on `/pet`, "Did you have any snacks today?" and then the same for alcohol. Each question offers **No / Yes + date / Not now**, with kind reactions after each answer (streak praise on No, "We can start over" on Yes). "Not now" is remembered per user in localStorage, so he asks again tomorrow. Frontend only; it talks to the MPP-20 endpoints (`GET /api/pet/habits`, `POST /api/pet/habits/{habit}/answer`). If the habit fetch fails, Pip shows his normal greeting with no error banner.

Version: **1.12.0** (Story, MINOR bump from 1.11.0), same in `client/package.json` and `foodbytes-api/pom.xml`. CHANGELOG line added.

## Migrations

None for MPP-21. It depends on MPP-20's `2026-10-13-mpp20-pet-habit-streaks.sql` (order 2 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`) being applied on Railway before the epic deploys.

## Convention note

Pip's bubble is now `SpeechBubble`: a persistent live-region line plus an optional `bubbleActions` slot. Later bubble interactions (MPP-22 awards) should use the slot rather than adding UI under the room. Bubble priority in `PetView`: cook > check-in > fridge-low > mood.

## Verification (run by the implementer)

- `npm run build`: passed (`built in 854ms`, no errors).
- `npm run check:checkin`, `check:pet`, `check:room`, `check:cook`, `check:fridge`: all passed.
- `npm run check:version`: `Version OK: 1.12.0`.
- Grep audits: no `console.log/debug` in the five new files (0 hits); no `from 'axios'` or `localhost:8080` in `components/` or `hooks/` (0 hits); `CheckInActions` referenced only in `CheckInActions.jsx` and `PetView.jsx` (AC 5).
- Line counts: `useHabitCheckIn.js` 121, `CheckInActions.jsx` 57, `PetRoom.jsx` 172, `PetView.jsx` 96, `PetContext.jsx` 197, `habitCheckIn.js` 64. All under 400; new files under 200.
- Not run: backend suite (no Java changes in MPP-21).
- Unverified: there is no frontend test runner, so the React components and hook have no automated tests. Only the pure helpers are covered by the node check scripts.

## Manual check (Task 14): PENDING the developer

None of these have been confirmed yet. Walk the flow in `tasks.md` Task 14 at `http://localhost:5173/pet`: question and No / Yes / Not now buttons; No reaction; Yes + date + Save / Back; start-over reaction clearing after about 8 s; no question after reload; Not now; keyboard focus and the date input label; 320 px layout and the fridge button not being hidden; backend stopped gives the normal greeting.

## Suggested commit subject

`MPP-21: Pip's daily snack and alcohol check-in in his speech bubble`

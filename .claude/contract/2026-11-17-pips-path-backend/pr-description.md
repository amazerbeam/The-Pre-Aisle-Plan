# MPP-49 child: Pip's Path backend (version 1.44.0)

Plan: [plan.md](plan.md). Research behind the generator: [research-generator.md](research-generator.md).
Branch `feature/MPP-49-pips-path-backend`, to be merged into `AI_Master` (not `master`).
Version 1.43.0 -> 1.44.0 (MINOR). The child ticket has no key yet, so the CHANGELOG line uses the slug `2026-11-17-pips-path-backend`.

## Summary

Server half of Pip's Path for the first family, Garden Path. Every map is generated per request, proved by a solver, stored, and replayed on clear. No client work in this PR.

| Verb + path | Body | 200 | Errors |
|---|---|---|---|
| `GET /api/pet/games/pips-path` | none | state (families, progress, next slot, earned today, rates) | 401 |
| `POST /api/pet/games/pips-path/maps` | optional `{family, difficulty}` | map (`mapId`, `rows`, size, mode, difficulty) | 401, 400, 403 `LOCKED`, 503 `GENERATION_FAILED` |
| `POST /api/pet/games/pips-path/maps/{mapId}/clear` | `{path: int[]}` (cell index `y*width+x`) | paid / capped / earnedToday / balance / progress | 401, 400, 404, 422 `INVALID_PATH` |

Error bodies are `{"error": "..."}`. A repeat clear of a cleared map is 200 with `paid: 0, alreadyCleared: true`.

**Cap rule.** 5 sprinkles per cleared level (`GAME_CLEAR`), at most 50 per Europe/Dublin day (`GAME_DAILY_CAP`). Amount = `max(0, min(5, 50 - earnedToday))`. A clear at the cap still counts for progress and returns `capped: true, paid: 0`. The payout happens in the clear's own transaction under the wallet lock, and `uk_pet_sprinkles` makes one payout per map a database fact. Progress is per person (never the plan owner's).

**Generator: generate-and-test (amends the plan's route-first approach).**
- Route-first (build around a random solution path, rocks off the path) failed on difficulty 7-10: 0 of 2 000 maps landed in band (best 9 routes at d7 against a max of 8, 12 at d8 against a max of 3). It samples maps in proportion to their solution count, so it favours easy maps, and a rock cannot sit on the route to remove rival routes. Full analysis and sources: [research-generator.md](research-generator.md).
- Now: random rocks (the band's count), a shuffled start scan, and the solver proves the solution count is inside the band before the map is served (every band has `minSolutions >= 1`). This is the published approach for rock-only one-stroke puzzles. The proof-before-serving requirement is unchanged.
- Speed-ups: a checkerboard parity filter on the layout and the start (open dark/light tiles differ by at most 1, and by 1 only with `S` on the larger colour), and rock perturbation (move one rock to a free neighbour, 8 moves per layout, each layout counted toward `MAX_ATTEMPTS = 400`). Solver node budget is 200 000 per served map. Output stays deterministic per seed.
- Timings, 50 seeded maps per difficulty, old -> new (limit 3 000 ms): d1-3 <= 3 -> <= 5 ms (noise), d4 38 -> 21, d5 53 -> 21, d6 38 -> 7, d7 658 -> 315, d8 1194 -> 367, d9 793 -> 257, d10 2268 -> 1173 ms.
- **No band was widened.** All 10 mockup fixtures (counts 8, 12, 4, 9, 7, 1, 6, 1, 1, 4) sit inside their bands, and a test pins that.

**New puzzle families** implement `PuzzleFamily` as a Spring bean in `service/game`; the registry, sequencer, clear endpoint and payout need no change.

`SprinkleRatesDTO` gains `gameClear` and `gameDailyCap`. `GAME_CLEAR` rows show as the generic earned line in Recent.

## Migrations

`foodbytes-app/database/migrations/2026-11-17-mpp49-pips-path-games.sql`: `pet_game_maps`, `pet_game_progress`, and `GAME_CLEAR` added to `chk_pet_sprinkles_source` (idempotent). MPP-42 (`2026-10-15-mpp42-sprinkles-shopping-sources.sql`) must be applied first because it re-declares the CHECK without `GAME_CLEAR`. Order is MPP-42 then MPP-49 locally and on Railway.

Railway gets both through `mpp15-railway-golive.sql` at the MPP-15 merge, MPP-42 (row 12) strictly before MPP-49 (row 13). `node foodbytes-app/database/build-golive.mjs --check` reports `Go-live OK: 13 migrations`. Nothing has been applied to Railway. The local apply on `foodbytes-db` is part of the pending Docker phase.

## Verification

- Full backend suite: `mvn test` -> 599 tests, 0 failures, 0 errors, BUILD SUCCESS.
- New or changed classes: `GridMapTest` 5, `GardenPathSolverTest` 14, `GardenPathBandsTest` 4, `GardenPathGeneratorTest` 28, `PuzzleFamilyRegistryTest` 4, `PipsPathSequencerTest` 7, `PipsPathServiceTest` 16, `PipsPathControllerTest` 10, `SprinklePolicyTest` 9, `SprinkleHistoryServiceTest` 4, `SprinkleServiceTest` 29. All pass.
- Generator band test: 50 seeded maps per difficulty, all in band, each difficulty under 3 s (timings above).
- `npm run build` (client unchanged): passes. `npm run check:version`: `Version OK: 1.44.0`.
- Audits: no `Repository`/`EntityManager` in `PipsPathController`; no `jakarta.persistence`/`Repository`/`Transactional` in `service/game`; no `garden-01` in `client/src`.

### Local Docker test

- **Task 16 (stack up): passed.** The root `docker-compose.yml` stack ran against the local `foodbytes-db`. The API started cleanly under Hibernate `validate`, which proves the entities match the applied migration. `/api/health` returned `{"version":"1.44.0"}`. The web app on `:3000` returned 200, the `:3000/api` proxy returned 200, and `GET /api/pet/games/pips-path` without sign-in returned 401.
  - Two problems that predate this ticket were fixed along the way. The outstanding `2026-11-16-recipe-folders.sql` migration was applied to the local DB, so the API could start. The root `docker-compose.yml` `api` service gained the network alias `backend`, because `nginx.dev.conf` proxies to `backend`.
  - Railway: confirm the recipe-folders migration is applied before the next backend deploy.
- **Task 17 (sign-in console test): waived by the developer.** This ticket ships no UI. Hands-on verification moves to the MPP-49 frontend ticket: play Pip's Path on localhost (issue, clear, retry, locked level, the 50/day cap) before either branch is pushed. The console script `local-test.js` stays in this folder if an API-level check is wanted later.

## Known risks (see plan.md)

Farming is capped, not prevented (every clear pays); `pet_game_maps` grows one row per play with no pruning; `POST /maps` has no rate limit; `service.game` is a new subpackage.

## Suggested commit subject

`MPP-<n>: Pip's Path backend — generated Garden Path maps, checked clears, progress, sprinkles` (the child's key once it exists).

# Plan: Pip's Path backend (Garden Path generator, solver, clear check, progress, sprinkles)

Plan folder: `.claude/contract/2026-11-17-pips-path-backend/`
Execution status: see `tasks.md` in this folder.

---

## Part 1 — Alignment

### Task reference
**Brief (developer, 2026-11-17):** "MPP-49 child: Pip's Path backend — server-side map generator + solver per family (Garden Path first), difficulty 1–10 proven solvable, path-check clear endpoint, per-person progress migration, 5 sprinkles per clear capped at 50/day. Spec: `.claude/contract/2026-11-17-pips-path-mockup/plan.md` → 'Decisions after mockup review'; epic: `.claude/contract/MPP-49-epic-breakdown/epic.md`."

**Binding decisions from the mockup plan ("Decisions after mockup review", developer, 2026-11-17):**
- Maps are generated server-side per family and difficulty **1–10**. Every play gets a fresh random map, proven solvable by the backend solver before it is sent. The client holds no level data.
- Proof before serving: build the map around a random solution path, place blocked tiles off that path, then the solver re-checks it within a fixed node budget. Retry otherwise.
  - **Amended 2026-11-17 (developer, during `/fb-apply`):** "build around a random solution path" is replaced by generate-and-test: random rocks, a shuffled start scan, and the solver proves the count is in band before the map is served. Route-first could not reach d7–10 (0/2 000 in band) because it samples maps in proportion to their solution count. Evidence and sources: `research-generator.md` in this folder. The proof-before-serving requirement is unchanged.
- Each difficulty fixes a board size (never more than 6 columns), a blocked-tile range and a solution-count band, calibrated against the 10 hand-made mockup levels (counts 8, 12, 4, 9, 7, 1, 6, 1, 1, 4). Those levels become generator test fixtures, not shipped data.
- The server checks every clear: the client submits its path for a map id, the server replays it with the same move rules, and pays only for a valid full path. One map pays at most once.
- Cadence: chapter n = difficulty 1–10 of family n in order, plus one refresher per earlier family (a high-difficulty map of that family). Endless = random family and difficulty, freshly generated. Progress records the highest cleared difficulty per family, not puzzle ids.
- Backend tests replace a client `check:puzzles`: for every family × difficulty, N seeded maps must be solvable, inside their bands and generated within the time budget.
- **Rewards: 5 sprinkles per cleared level, capped at 50 a day** (Europe/Dublin day, as `SprinklePolicy` uses). No replay rate.

**Epic MPP-49 parts that bind this ticket:** progress is per person (MPP-33) and survives devices; rewards reward consistency, never food variety (MPP-11); difficulty bands cap boards at 6 columns.

**Jira:** the child ticket has no key yet (the epic's roadmap lists children as "TBD", and the Atlassian MCP needed re-auth on the mockup contract). No card was moved. See Risks.

### Restated goal
Build the backend half of Pip's Path for its first family, Garden Path. The API hands a signed-in player a freshly generated Garden Path map for the right slot in their chapter (or a replay of a level they have unlocked, or an endless map once the chapter is done). Every map is generated at random and proved by a solver before it leaves the server, and each difficulty 1–10 has a fixed size, rock count and solution-count band. When the player finishes, the client posts the path; the server replays it against the stored map, marks the map cleared once, moves the player's own progress forward, and pays 5 sprinkles unless that person already earned 50 from games today. The structure is a family registry, so Thin Ice and later chapters plug in a new generator without touching the sequencer, the clear endpoint or the reward code.

### In scope
- A pure **grid model, solver and path checker** for Garden Path (orthogonal moves, fixed start, visit every open tile once).
- A **Garden Path generator** with a difficulty table for 1–10 (size, rock range, solution band), seeded and deterministic per seed.
- A **puzzle-family registry** (`PuzzleFamily` interface + Spring list) so later families slot in.
- A pure **sequencer**: next slot = current chapter's next difficulty, then refreshers, then endless.
- **Migration** (idempotent, MPP-15 local-first): `pet_game_maps`, `pet_game_progress`, and `GAME_CLEAR` added to `chk_pet_sprinkles_source`.
- **Entities + repositories** for both tables; a daily-sum query on `pet_sprinkles`.
- **`SprinklePolicy` / `SprinkleSource`**: `GAME_CLEAR = 5`, `GAME_DAILY_CAP = 50`, the cap rule and the Dublin-day UTC bounds; `SprinkleRatesDTO` gains the two amounts.
- **`PipsPathService`**: state read, map issue, clear (replay → mark → progress → pay, under the wallet lock).
- **`PipsPathController`** at `/api/pet/games/pips-path`: `GET` state, `POST /maps`, `POST /maps/{mapId}/clear`.
- **Backend tests**: solver against the 10 mockup fixtures, fixture-in-band calibration, generator bands for every difficulty over seeded maps with a time budget, sequencer, policy, service, controller.
- Go-live row + regenerated `mpp15-railway-golive.sql`; local apply (including the outstanding MPP-42 migration, see audit).
- **Work on a new branch `feature/MPP-49-pips-path-backend` off an up-to-date `AI_Master`** (developer, 2026-11-17: "do the work on a new branch off AI_Master"). The PR targets `AI_Master`, and nothing is pushed until the local Docker test passes.
- **Local end-to-end test in Docker before pushing** (developer, 2026-11-17: "I want to test this locally before pushing, so add docker and for it to be running on local host … and for me to be able to login and test"). Build and start the root `docker-compose.yml` stack against the local `foodbytes-db`: web on http://localhost:3000, API on http://localhost:8080. The developer signs in with Google at :3000 and runs a console test script (`local-test.js` in this folder) that issues a map, solves it in the browser, and checks the clear, the retry, a bad path, a locked replay and the daily cap against the real API and database.
- MINOR bump, CHANGELOG, `pr-description.md`.

### Explicitly out of scope
- **All client work**: the Play a game bubble action, game picker, chapter map, board, the client engine port, theme tokens, skins. That is the next MPP-49 child (frontend), planned against this API and the approved mockup.
- Mockup changes. No UI changes here, so the mockup-sync rule does not apply; the mockup already shows 5/50.
- Thin Ice and every later family's generator (one ticket each). Refreshers are coded generically but can only appear once a second family ships.
- Hints, timers, leaderboards, partner competition, Pip XP from games.
- Pruning old `pet_game_maps` rows (noted in Risks).
- Applying anything to Railway (MPP-15 go-live file at merge).
- A game UI to click through. This ticket ships no screens, so the local test drives the API from the browser console while signed in. The frontend ticket adds the board.
- Moving or editing MPP-49 in Jira.

### Pattern Reference
The brief gave the spec and epic, no code references. Chosen references:
- **`service/SprinkleService.java`**: `lockWallet` (users row `FOR UPDATE`) + `insertIfAbsent` on `uk_pet_sprinkles` is the house way to pay once and serialize a person's wallet writes. The clear reuses both.
- **`service/SprinklePolicy.java`**: constants + package-private pure rules, Dublin day via `HabitStreakPolicy.today(clock)`.
- **`controller/PetStationController.java`**: `/api/pet/...` controller shape, `@AuthenticationPrincipal UserPrincipal` null → 401 `{error}`, domain exception → status `{error}` with the message.
- **`service/PetShopException.java`**: exception with a `Reason` enum that the controller maps.
- **`2026-10-14-mpp26-pet-station-levels.sql` / `2026-10-15-mpp42-sprinkles-shopping-sources.sql`**: idempotent `CREATE TABLE IF NOT EXISTS`, FK to `users ON DELETE CASCADE`, guarded CHECK drop + superset re-add.
- **Tests**: `SprinkleServiceTest` (Mockito + fixed `Clock`), `PetSprinkleControllerTest` (`@WebMvcTest` + `addFilters = false`, direct call for the principal case).
- **Mockup `pp-engine`** (`foodbytes-app/mockup/pips-path.html`): the move rules (`canStep`, `isCleared`) and the pruned solver (connectivity + at most one dead end) the Java solver mirrors, so client play and server replay agree.

### Constraints flagged on the brief
- Every served map proven solvable first; difficulty 1–10 per family; ≤ 6 columns.
- Server replays the submitted path; pays once per map.
- 5 per clear, 50 per Europe/Dublin day.
- Progress per person (the player, never `meal_plan_owner_id`'s owner).
- Hibernate `validate`: migration applied (locally) before the entities land. MPP-15 local-first: idempotent migration, go-live row, `build-golive.mjs`.
- Rewards never depend on food (MPP-11) — trivially true.

### Assumptions made
- **Slug `2026-11-17-pips-path-backend` (no ticket key).** The child ticket does not exist yet. *Rationale:* the step-0.5 rule forbids creating a ticket just to move it; same handling as the mockup contract.
- **Migration file named `2026-11-17-mpp49-pips-path-games.sql`.** `build-golive.mjs --check` only tracks `*-mppNN-*` files, and the epic key is the only key there is. *Rationale:* keeps the go-live check honest; a later rename must update the go-live row too.
- **Tables are `pet_game_maps` and `pet_game_progress`.** *Rationale:* every room/pet table uses the `pet_` prefix; "game" not "pips_path" so later games can share them (the `family` column tells them apart).
- **Issued maps are stored** (`pet_game_maps`: player, family, difficulty, mode, chapter, seed, layout, issued/cleared times). *Rationale:* the clear must be replayed against exactly what was issued, and the map id is the once-only payout key (`pet_sprinkles.source_id`). Regenerating from the seed alone would tie old maps to today's generator code.
- **Progress row per (person, family)**: `highest_cleared` (0–10) and `refresher_through` (highest chapter whose refresher of this family is cleared, 0 = none). *Rationale:* chapters run strictly in order, so one number per family covers every refresher; current chapter and endless are derived, not stored.
- **Endpoints** (all authenticated, principal only, no user parameter):
  - `GET /api/pet/games/pips-path` → state (families, progress, next slot, today's earnings, rates).
  - `POST /api/pet/games/pips-path/maps` with optional `{family, difficulty}`: empty body = the sequencer's next slot; both set = a replay of an unlocked chapter level.
  - `POST /api/pet/games/pips-path/maps/{mapId}/clear` with `{path: int[]}` (cell indices `y * width + x`, start included, as the mockup engine's `run.path`).
  *Rationale:* matches the mockup engine's data so the frontend port posts `run.path` unchanged.
- **Status codes:** 401 no principal; 400 bad body / unknown family / difficulty outside 1–10; 403 `LOCKED` replay of a level not yet unlocked; 404 map not found or not the caller's; 422 `INVALID_PATH`; 503 `GENERATION_FAILED`. A second clear of an already-cleared map is **200 with `paid: 0, alreadyCleared: true`** so a client retry is harmless.
- **Unlock rule:** a replay of family f at difficulty d is allowed when f is shipped, f's chapter ≤ the current chapter (or the player is in endless), and d ≤ `highest_cleared(f) + 1`. *Rationale:* the epic keeps cleared puzzles replayable from the chapter map and unlocks in order.
- **Every clear pays**, including replays and endless (5, capped). *Rationale:* developer decision "no replay rate". So a player can farm difficulty 1 up to the cap; the cap is the guard.
- **Cap arithmetic:** amount = `max(0, min(5, 50 − earnedToday))`, `earnedToday` = sum of the person's `GAME_CLEAR` rows whose `created_at` (UTC) falls in today's Dublin day. A clear at the cap still counts for progress and returns `capped: true, paid: 0`; no zero-amount ledger row is written.
- **The clear pays inside its own transaction**, not via the after-commit `SprinkleRecorder`. *Rationale:* the payout is the point of the request and its amount is in the response; the wallet lock serializes two devices so the cap cannot be overrun.
- **Refresher difficulty:** random 8–10. Endless: random shipped family, random difficulty 1–10. *Rationale:* "high difficulty" in the epic; endless spans the whole range.
- **Difficulty bands** (W×H, rocks, solutions [min, max]; `∞` = no upper bound):

  | d | Board | Rocks | Solutions | Mockup fixture (rocks, count) |
  |---|---|---|---|---|
  | 1 | 3×3 | 0 | 2–∞ | garden-01 (0, 8) |
  | 2 | 4×3 | 0 | 4–∞ | garden-02 (0, 12) |
  | 3 | 4×4 | 1 | 2–∞ | garden-03 (1, 4) |
  | 4 | 5×4 | 1 | 2–20 | garden-04 (1, 9) |
  | 5 | 5×5 | 2 | 2–12 | garden-05 (2, 7) |
  | 6 | 5×5 | 3 | 1–4 | garden-06 (3, 1) |
  | 7 | 6×5 | 2 | 1–8 | garden-07 (2, 6) |
  | 8 | 6×6 | 3 | 1–3 | garden-08 (3, 1) |
  | 9 | 6×6 | 4 | 1–2 | garden-09 (4, 1) |
  | 10 | 6×7 | 4 | 1–4 | garden-10 (4, 4) |

  Width is columns. Every fixture sits inside its band (a test pins this). The executor may widen a band during the calibration task only if the generator's acceptance rate is too low, and every fixture must stay inside it. *Rationale:* the mockup levels are the developer-approved difficulty ramp.
- **Generator budget:** up to 400 attempts per map, solver node budget 200 000 per attempt; the band test asserts 50 seeded maps per difficulty generate in under 3 s per difficulty. *Rationale:* the mockup's solver needed ≤ 530 nodes for these sizes; the margin covers unlucky boards.
- **Map layout format:** rows joined with `/`, legend `S` start, `.` open, `#` rock (the mockup's legend). Returned to the client as `rows: string[]`.
- **Pure game code lives in `com.foodbytes.service.game`** (grid, solver, generator, bands, family interface, registry, sequencer). Service, controller, entities, repos stay in their usual flat packages. *Rationale:* thirteen families will follow; a subpackage keeps `service/` readable without breaking the layer rule.
- **`SprinkleRatesDTO` gains `gameClear` and `gameDailyCap`.** *Rationale:* the Earn tab reads amounts from the API, never hard-coded; the client ignores unknown fields until the frontend ticket uses them. `GAME_CLEAR` ledger rows already render as the generic "earned" line in Recent (`sprinkleHistory.js` default branch), so no client change is needed.
- **Version bump: MINOR** (a Story under the epic).

### Cross-code alignment audit (FE ↔ BE ↔ DB)
MPP-15 is local-first and not merged to `master` (`git merge-base --is-ancestor feature/MPP-15-pip-room master` → false; it is merged into `AI_Master`). The pet tables do not exist on Railway yet, so the audit ran against the local `foodbytes-db` (schema only, no user rows read).
- **`SHOW COLUMNS FROM pet_sprinkles` (local):**
  ```
  id          bigint      NO  PRI  auto_increment
  user_id     bigint      NO  MUL
  source_type varchar(16) NO
  source_id   bigint      NO
  amount      int         NO
  created_at  timestamp   NO       CURRENT_TIMESTAMP
  ```
  `source_id BIGINT` takes a map id; `created_at` is UTC (JDBC `serverTimezone=UTC`), so the Dublin-day sum converts bounds to UTC.
- **Outstanding migration found.** Local `chk_pet_sprinkles_source` = `('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE')` and `source_type` is still `varchar(16)`, so **MPP-42's `2026-10-15-mpp42-sprinkles-shopping-sources.sql` is not applied locally** (go-live row 12 shows "Applied locally: —"). This plan's CHECK is a superset of MPP-42's, so MPP-42 must be applied first; the apply task does both, in order.
- **Ledger rows:** `SELECT source_type, COUNT(*) FROM pet_sprinkles GROUP BY source_type` → `MEAL_EATEN 4`. Re-adding the CHECK with more values keeps every row valid.
- **New tables absent:** `SHOW TABLES LIKE 'pet_game%'` → empty, so `CREATE TABLE IF NOT EXISTS` is a clean create.
- **FK target:** `users.id` is `bigint NO PRI auto_increment`, so `user_id BIGINT NOT NULL` + `ON DELETE CASCADE` matches `pet_station_levels`.
- **Name chain:** `pet_game_maps.id` ↔ `PetGameMap.id` ↔ JSON `mapId`. Columns ↔ entity fields ↔ JSON: `family`↔`family`↔`family`, `difficulty`↔`difficulty`↔`difficulty`, `mode`↔`GameMode mode`↔`"CHAPTER"|"REFRESHER"|"ENDLESS"`, `layout`↔`layout`↔`rows[]` (split on `/` in the DTO mapper), `highest_cleared`↔`highestCleared`↔`highestCleared`, `refresher_through`↔`refresherThrough`↔`refresherThrough`. `GAME_CLEAR` ≤ 16 chars, so it fits even before MPP-42's widening, but the CHECK still needs MPP-42's values.
- **Client side:** no client code reads these endpoints yet (frontend ticket). `sprinkleHistory.js` falls back to the generic earned line for an unknown `sourceType`, so `GAME_CLEAR` rows are safe in Recent today.

---

## Part 2 — Technical design

### Approach
**Pure core, thin shell.** Everything that decides a map, a solution or a slot is pure Java with no Spring or JPA in `com.foodbytes.service.game`: `GridMap` (parsed board), `GardenPathSolver` (count solutions with a node budget; check a submitted path), `GardenPathBands` (the difficulty table), `GardenPathGenerator` (seeded generation), the `PuzzleFamily` interface with `GardenPathFamily` as its first implementation, `PuzzleFamilyRegistry` (all families ordered by chapter), and `PipsPathSequencer` (next slot from progress). Pure code is where the invariants live and where the tests are fast and seeded. `PipsPathService` is the only stateful piece: it loads progress, asks the sequencer and family, stores the issued map, and on clear replays, marks, updates progress and pays. `PipsPathController` stays thin, as the java-backend skill requires.

**Generation: generate-and-test (amended 2026-11-17, see `research-generator.md`).** For a difficulty, the generator lays the band's rocks on random cells, applies a **checkerboard parity filter** (a full route alternates colours, so open dark/light tiles must differ by ≤ 1 and, if they differ by 1, `S` must be on the larger colour; this rejects layouts and starts in O(1)), then scans the parity-valid open cells in shuffled order as `S` and keeps the first whose solver count is inside the band. The scan uses a small per-start node cap; the chosen map is re-proved at `NODE_BUDGET`. If no start fits, the generator **perturbs** the layout (moves one rock to a random free neighbour, keeping the rock count) a bounded number of times before rolling a fresh layout; every map counts as one of the `MAX_ATTEMPTS`. Every served map is proven by the solver, with `minSolutions ≥ 1` in every band. *Superseded original paragraph below, kept for history.*

~~**Generation by construction, then proof.**~~ For a difficulty, the generator picks a rock count in the band and runs a randomized backtracking self-avoiding walk of exactly `W×H − rocks` cells from a random start (random neighbour order, Warnsdorff tie-break toward cells with fewer free neighbours, bounded steps). Cells off the walk become rocks and the walk's first cell is `S`. The walk itself is a solution, so the map is solvable by construction; the solver then re-counts solutions up to `max + 1` (or up to `min` for an unbounded band) inside a node budget, and the map is kept only if the count is inside the band and the budget was not hit. Otherwise the next attempt runs, up to 400; failure throws `PipGameException(GENERATION_FAILED)`. The solver mirrors the mockup's pruned DFS (every unvisited open tile must stay connected to the head, and at most one unvisited tile may be a dead end), so it agrees with the 10 fixture counts exactly — a test pins all ten. **Roads not taken:** (1) placing rocks at random and then searching for any solution — wastes most attempts on unsolvable boards and makes proof the expensive step; (2) shipping pre-generated level packs — the developer ruled out client level data and repeats; (3) storing only the seed and regenerating on clear — a future generator change would silently change old maps.

**Clear and payout.** `clear(userId, mapId, path)` is one `@Transactional` method. It takes `SprinkleService.lockWallet(userId)` first (the same users-row lock purchases use), so two devices clearing at once run one after the other and cannot both slip under the cap. Then: load the map by `(id, user_id)` → 404 if absent; if `cleared_at` is set → return `alreadyCleared` with `paid: 0`; replay the path through the family's checker → 422 if invalid; set `cleared_at`; raise progress (`CHAPTER`: `highest_cleared = max(highest_cleared, difficulty)`; `REFRESHER`: `refresher_through = max(refresher_through, chapter)`; `ENDLESS`: nothing); compute the capped amount from today's `GAME_CLEAR` sum and insert it with `insertIfAbsent(user, GAME_CLEAR, mapId, amount)` when positive. `uk_pet_sprinkles` makes "one map pays once" a database fact, not just a code path. **Road not taken:** paying through `SprinkleRecorder` after commit like meals do — it would return before the amount is known and would need a second read to report it, and the cap check would race without the lock.

**Sequencer and families.** `PipsPathSequencer.next(families, progress, rng)` walks shipped families in chapter order: the first family with `highest_cleared < 10` gives a `CHAPTER` slot at `highest_cleared + 1`; once that family is done, each earlier family k with `refresher_through < c` gives a `REFRESHER` slot (difficulty 8–10, chapter c) before chapter c counts as complete; after the last shipped chapter, an `ENDLESS` slot (random family, random difficulty). With only Garden Path shipped today the chapter has no refreshers and leads straight to endless, but the refresher branch is tested with a fake second family so Thin Ice only adds a `PuzzleFamily` bean. The `families` list comes from `PuzzleFamilyRegistry`, built from every `PuzzleFamily` Spring bean, sorted by `chapter()`, failing at startup if two share an id or a chapter.

### Skills to invoke during execution
- `java-backend` — owns everything here: layer placement (controller → service → repository → model, DTOs on the wire), `@AuthenticationPrincipal UserPrincipal`, `@Transactional` boundaries, the entity ↔ migration contract under `ddl-auto: validate`, and test conventions (`mvn test -Dtest=…`).

`.claude/rules/*` cover recipes, ingredients and variants and do not apply. The executor must follow the MPP-15 local-first migration rules in `.claude/commands/fb-plan.md` (idempotent DDL, go-live row, `build-golive.mjs`).

### Diagram
```mermaid
sequenceDiagram
  participant C as Client (later ticket)
  participant PC as PipsPathController
  participant S as PipsPathService
  participant Q as PipsPathSequencer
  participant F as GardenPathFamily
  participant V as GardenPathSolver
  participant DB as MySQL
  C->>PC: POST /api/pet/games/pips-path/maps {}
  PC->>S: issue(userId, null, null)
  S->>DB: pet_game_progress by user
  S->>Q: next(families, progress, rng)
  Q-->>S: Slot(CHAPTER, garden-path, d=4, ch=1)
  S->>F: generate(4, seed)
  loop until in band (≤400 attempts)
    F->>F: random walk of W×H−rocks cells → rocks off the walk
    F->>V: countSolutions(map, limit, nodeBudget)
    V-->>F: count, budgetHit
  end
  F-->>S: GridMap
  S->>DB: INSERT pet_game_maps
  S-->>C: {mapId, rows, width, height, mode, difficulty}
  C->>PC: POST /maps/{mapId}/clear {path}
  PC->>S: clear(userId, mapId, path)
  S->>DB: SELECT users FOR UPDATE (lockWallet)
  S->>DB: pet_game_maps by (id, user)
  S->>V: isValidClear(map, path)
  alt invalid
    S-->>C: 422 INVALID_PATH
  else valid
    S->>DB: UPDATE cleared_at; UPSERT pet_game_progress
    S->>DB: SUM GAME_CLEAR today (Dublin day in UTC)
    S->>DB: INSERT pet_sprinkles (GAME_CLEAR, mapId, min(5, 50−earned)) if > 0
    S-->>C: {paid, capped, earnedToday, balance, progress}
  end
```

### Data shapes

#### Migration `foodbytes-app/database/migrations/2026-11-17-mpp49-pips-path-games.sql`
```sql
CREATE TABLE IF NOT EXISTS pet_game_maps (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  family      VARCHAR(32)   NOT NULL,
  difficulty  INT           NOT NULL,
  mode        VARCHAR(16)   NOT NULL,
  chapter     INT           NULL,            -- NULL for ENDLESS
  seed        BIGINT        NOT NULL,
  width       INT           NOT NULL,
  height      INT           NOT NULL,
  layout      VARCHAR(1024) NOT NULL,        -- rows joined by '/', legend S . #
  issued_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at  TIMESTAMP     NULL,
  PRIMARY KEY (id),
  KEY idx_pet_game_maps_user (user_id, issued_at),
  CONSTRAINT chk_pet_game_maps_difficulty CHECK (difficulty BETWEEN 1 AND 10),
  CONSTRAINT chk_pet_game_maps_mode CHECK (mode IN ('CHAPTER','REFRESHER','ENDLESS')),
  CONSTRAINT fk_pet_game_maps_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_game_progress (
  id                BIGINT      NOT NULL AUTO_INCREMENT,
  user_id           BIGINT      NOT NULL,
  family            VARCHAR(32) NOT NULL,
  highest_cleared   INT         NOT NULL DEFAULT 0,
  refresher_through INT         NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_game_progress (user_id, family),
  CONSTRAINT chk_pet_game_progress_highest CHECK (highest_cleared BETWEEN 0 AND 10),
  CONSTRAINT fk_pet_game_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- guarded DROP CHECK chk_pet_sprinkles_source (as MPP-42), then:
ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE',
   'SHOPPING_LIST_GENERATED','SHOPPING_LIST_COMPLETED','GAME_CLEAR'));
```

#### Entities and enums (`com.foodbytes.model`)
- `GameMode` enum: `CHAPTER, REFRESHER, ENDLESS`.
- `SprinkleSource`: add `GAME_CLEAR // MPP-49: source_id = pet_game_maps.id`.
- `PetGameMap` (`@Table pet_game_maps`): `Long id`, `Long userId`, `String family`, `int difficulty`, `@Enumerated(STRING) @JdbcTypeCode(VARCHAR) GameMode mode`, `Integer chapter`, `long seed`, `int width`, `int height`, `String layout`, `LocalDateTime issuedAt` (`insertable=false, updatable=false`), `LocalDateTime clearedAt`. Id-based `equals`/`hashCode` as `PetSprinkle`.
- `PetGameProgress` (`@Table pet_game_progress`, unique `uk_pet_game_progress`): `Long id`, `Long userId`, `String family`, `int highestCleared`, `int refresherThrough`, `LocalDateTime updatedAt` (read-only). Id-based equality.

#### Repositories (`com.foodbytes.repository`)
- `PetGameMapRepository extends JpaRepository<PetGameMap, Long>`: `Optional<PetGameMap> findByIdAndUserId(Long id, Long userId)`.
- `PetGameProgressRepository extends JpaRepository<PetGameProgress, Long>`: `List<PetGameProgress> findByUserId(Long userId)`, `Optional<PetGameProgress> findByUserIdAndFamily(Long userId, String family)`.
- `PetSprinkleRepository` add:
  ```java
  @Query("SELECT COALESCE(SUM(s.amount), 0) FROM PetSprinkle s WHERE s.userId = :userId " +
         "AND s.sourceType = :sourceType AND s.createdAt >= :from AND s.createdAt < :to")
  long sumAmountByUserIdAndSourceTypeBetween(Long userId, SprinkleSource sourceType, LocalDateTime from, LocalDateTime to);
  ```

#### Pure game core (`com.foodbytes.service.game`)
```java
record GridMap(int width, int height, boolean[] open, int start, int openCount) {
  static GridMap parse(List<String> rows);         // exactly one S, equal row lengths, only S . #, width ≤ 6 → else IllegalArgumentException
  List<String> rows();                              // back to S . # strings
  String layout();                                  // String.join("/", rows())
  static GridMap fromLayout(String layout, int width, int height);
  int[] neighbours(int i);                          // orthogonal, open only
}
record SolveResult(long count, boolean budgetExceeded, int[] first) {}
final class GardenPathSolver {
  static SolveResult countSolutions(GridMap map, long limit, long nodeBudget);
  static boolean isValidClear(GridMap map, List<Integer> path); // starts at start, each step orthogonal+open+unvisited, size == openCount
}
record DifficultyBand(int difficulty, int width, int height, int rocks, int minSolutions, int maxSolutions) {
  static final int UNBOUNDED = Integer.MAX_VALUE;
  long countLimit();                                // maxSolutions == UNBOUNDED ? minSolutions : maxSolutions + 1L
  boolean accepts(long count);
}
final class GardenPathBands {
  static final int MIN_DIFFICULTY = 1, MAX_DIFFICULTY = 10, MAX_COLS = 6;
  static DifficultyBand of(int difficulty);          // table in Assumptions; IllegalArgumentException outside 1..10
}
final class GardenPathGenerator {
  static final int MAX_ATTEMPTS = 400;
  static final long NODE_BUDGET = 200_000L;
  static GridMap generate(int difficulty, long seed); // deterministic per seed; PipGameException(GENERATION_FAILED) after MAX_ATTEMPTS
}
interface PuzzleFamily {
  String id();                                      // "garden-path"
  int chapter();                                    // 1
  GridMap generate(int difficulty, long seed);
  boolean isValidClear(GridMap map, List<Integer> path);
}
@Component class GardenPathFamily implements PuzzleFamily { ID = "garden-path"; CHAPTER = 1; }
@Component class PuzzleFamilyRegistry {
  PuzzleFamilyRegistry(List<PuzzleFamily> families); // sorted by chapter; duplicate id or chapter → IllegalStateException
  List<PuzzleFamily> ordered();
  Optional<PuzzleFamily> byId(String id);
}
record FamilyProgress(int highestCleared, int refresherThrough) { static final FamilyProgress NONE = new FamilyProgress(0, 0); }
record Slot(String family, int difficulty, GameMode mode, Integer chapter) {}
final class PipsPathSequencer {
  static final int CHAPTER_LEVELS = 10, REFRESHER_MIN = 8, REFRESHER_MAX = 10;
  static Slot next(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress, RandomGenerator rng);
  static int currentChapter(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress); // ordered.size()+1 = endless
  static boolean isUnlocked(PuzzleFamily f, int difficulty, List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress);
}
```

#### Policy and errors
- `SprinklePolicy`: `public static final int GAME_CLEAR = 5; public static final int GAME_DAILY_CAP = 50;` `static int gameClearAmount(long earnedToday)` → `(int) Math.max(0, Math.min(GAME_CLEAR, GAME_DAILY_CAP - earnedToday))`; `static LocalDateTime[] dublinDayUtc(LocalDate day)` → `[start, end)` as UTC wall times.
- `com.foodbytes.service.PipGameException extends RuntimeException` with `enum Reason { UNKNOWN_FAMILY, BAD_DIFFICULTY, LOCKED, NOT_FOUND, INVALID_PATH, GENERATION_FAILED }` and `getReason()`.

#### Service (`com.foodbytes.service.PipsPathService`)
```java
@Transactional(readOnly = true) PipsPathStateDTO state(Long userId);
@Transactional PipsPathMapDTO issue(Long userId, String family, Integer difficulty); // both null = next slot; one null = BAD_DIFFICULTY/UNKNOWN_FAMILY
@Transactional PipsPathClearDTO clear(Long userId, Long mapId, List<Integer> path);
```
Dependencies: `PuzzleFamilyRegistry`, `PetGameMapRepository`, `PetGameProgressRepository`, `PetSprinkleRepository`, `SprinkleService` (`lockWallet`, `balance`), `Clock`.

#### DTOs (`com.foodbytes.dto`) and HTTP contract
```java
class PipsPathMapRequest { @Size(max = 32) String family; @Min(1) @Max(10) Integer difficulty; }   // body optional
class PipsPathClearRequest { @NotNull @Size(min = 1, max = 64) List<@NotNull Integer> path; }
class PipsPathMapDTO { Long mapId; String family; int difficulty; String mode; Integer chapter; int width; int height; List<String> rows; }
class PipsPathFamilyDTO { String id; int chapter; int highestCleared; int refresherThrough; }
class PipsPathSlotDTO { String family; Integer difficulty; String mode; Integer chapter; }
// Amended 2026-11-17 while writing tasks.md: difficulty is null in the state preview for REFRESHER / ENDLESS,
// because their difficulty is rolled when POST /maps issues the map, so a preview number would be wrong.
class PipsPathStateDTO { List<PipsPathFamilyDTO> families; int currentChapter; boolean endless; PipsPathSlotDTO next;
                         long earnedToday; int dailyCap; int perClear; }
class PipsPathClearDTO { boolean alreadyCleared; int paid; boolean capped; long earnedToday; int dailyCap; long balance;
                         PipsPathFamilyDTO progress; }
```
`SprinkleRatesDTO` adds `int gameClear; int gameDailyCap;` (after `mealsPerWeek`), filled in `SprinkleHistoryService.rates()`.

| Verb + path | Body | 200 | Errors |
|---|---|---|---|
| `GET /api/pet/games/pips-path` | — | `PipsPathStateDTO` | 401 |
| `POST /api/pet/games/pips-path/maps` | `PipsPathMapRequest` or none | `PipsPathMapDTO` | 401, 400 (validation, `UNKNOWN_FAMILY`, `BAD_DIFFICULTY`), 403 `LOCKED`, 503 `GENERATION_FAILED` |
| `POST /api/pet/games/pips-path/maps/{mapId}/clear` | `PipsPathClearRequest` | `PipsPathClearDTO` | 401, 400 validation, 404 `NOT_FOUND`, 422 `INVALID_PATH` |

Error bodies are `{"error": "<message>"}` like the other pet controllers.

### Runtime quality notes
- **Resource cleanup:** no streams or external resources; JPA transactions are Spring-managed. The wallet lock is held only for the clear transaction (`lockWallet` is `MANDATORY`). Generation runs inside `issue`'s transaction but takes no locks beyond the single insert.
- **Concurrency / ordering:** two devices clearing different maps at once: the users-row lock serializes them, so the second sees the first's sprinkle row in its daily sum and the cap holds. The same map cleared twice: the second waits on the lock, then sees `cleared_at` and returns `alreadyCleared`; even without the lock, `uk_pet_sprinkles (user, GAME_CLEAR, mapId)` stops a double pay. Progress upsert: first clear for a family inserts the row; a racing insert from another device is impossible because both hold the same users-row lock. Plan sharing (`meal_plan_owner_id`) is irrelevant: everything keys on the player's own id (MPP-33).
- **Allocation / cost behaviour:** generation is CPU-only; 6×7 is 42 cells, and the band test fixes the time budget (50 maps per difficulty < 3 s). Worst case a difficulty hits 400 attempts × 200 000 nodes — bounded, and the test would expose an acceptance rate that low during calibration. State read: one progress query per call plus one indexed sum. Clear: lock, PK lookup, progress row, sum, insert — constant. `pet_game_maps` grows one row per play (bounded in practice by play time; at most ~10 paid a day, but unpaid plays still insert) — pruning is out of scope and noted.
- **Error paths:** domain failures throw `PipGameException` and the controller maps each `Reason` to its status with the message. Validation failures go through the existing `MethodArgumentNotValidException` → 400 handling the other pet controllers use. An unexpected generator bug (e.g. parse failure of its own output) is a programming error and surfaces as 500 with a log line, not swallowed. A failed payout insert rolls back the whole clear (map stays uncleared), so the player can retry and is never told they were paid when they were not.

### Risks and judgement calls
- **No Jira ticket yet.** Once the child Story exists, rename the folder to `MPP-<n>-pips-path-backend` (update the `Plan folder:` lines) and move the card to Planned. Until then `/fb-apply` skips Jira.
- **Migration named after the epic (`mpp49`).** Fine for `build-golive.mjs`; if the developer wants the child key in the filename, rename the file and its go-live row together before apply.
- **MPP-42's migration is unapplied locally.** The apply task applies MPP-42 first, then this one. Order matters: MPP-42 re-declares the CHECK without `GAME_CLEAR`, so running it *after* this file would drop `GAME_CLEAR` and every game payout would fail its insert. The go-live file keeps the same order on Railway (MPP-42 row 12, this file row 13).
- **Hard bands may starve the generator** (d8/d9 want 1–3 and 1–2 solutions on 6×6). A calibration task measures the acceptance rate per difficulty with the 50-seed test; if a difficulty misses the time budget, the executor first improves the walk (Warnsdorff tie-break) and only then widens that band's max, keeping every fixture inside. Any widening is recorded in `pr-description.md`.
- **Farming is capped, not prevented.** Every clear pays, so difficulty 1 (3×3) can be cleared ten times in a minute for the full 50. That matches "no replay rate"; flag if the developer would rather pay only chapter-order clears.
- **Map table growth** with no pruning. Each play inserts a row (~100 bytes). A follow-up can delete uncleared maps older than N days.
- **No issue rate limit.** `POST /maps` generates on demand; a scripted client could burn CPU. Generation is milliseconds and needs auth; flagged rather than built.
- **Package choice** `service.game` for the pure core is new to the codebase. Alternative: flat `service/` with a `PipsPath` prefix on every class.
- **Uncommitted mockup work on `AI_Master`.** On 2026-11-17 the mockup contract's version bump, `pips-path.html`, the README and two contract folders were still uncommitted. Branching carries them onto the new branch. Task 0 stops and asks rather than committing, stashing or discarding them. The cleanest order is to commit the mockup work on `AI_Master` first. Then the MINOR bump in this contract stacks on the mockup's version.
- **Local Docker test (developer-owned sign-in).** It uses the existing root `docker-compose.yml`. `.env` already sets `DB_NAME=foodbytes`, `DB_USER=foodbytes` and `APP_URL=http://localhost:3000`, so the `api` container talks to the running `foodbytes-db`, never Railway. The Google sign-in callback is `http://localhost:8080/login/oauth2/code/google` (set in compose). If Google answers `redirect_uri_mismatch`, that URI must be added to the OAuth client's authorised redirect URIs in Google Cloud Console. Port 8080 is shared with `mvn spring-boot:run`, so only one backend can run at a time. The cap test adds up to 50 real sprinkles to the developer's own local account; an optional reset clears the game rows.
- **Developer-owned step:** none on Railway now. The local apply (MPP-42 then this file) is a DBA step against `foodbytes-db`; Railway gets the regenerated `mpp15-railway-golive.sql` at the MPP-15 merge.

# MPP-49 — Play with Pip: Pip's Path grid puzzle game

> **This file is the epic's ticket text, copied from Jira on 2026-11-17. It is not an `/fb-plan` implementation contract.** It has no `Status:` line and `/fb-apply` never walks it. Jira is the source of truth: https://amazerbeam.atlassian.net/browse/MPP-49. Each child ticket gets its own `/fb-plan` contract, version bump and, where it needs one, a Railway migration.

- **Type:** Epic
- **Priority:** Medium
- **Fix version:** none
- **Status:** To Do (backlog)
- **Created:** 2026-11-17

**Decisions made when the epic was created (2026-11-17):**
- The game is called **Pip's Path**.
- **Rewards:** small sprinkles, capped daily (chosen over no rewards and over trophies only).
- **Cadence:** 10 new puzzles per chapter, plus one refresher from each earlier family. Endless random mode starts after the last chapter.
- The first family is single-visit paths (Hamiltonian). The second is cracked ice (Sootopolis Gym style).

**Decisions after the mockup review (2026-11-17). These supersede the level and reward text below where they conflict:**
- **Maps are generated server-side.** Every family has difficulty levels 1–10. Each play gets a fresh random map from the backend, proven solvable by the backend solver before it is sent. This applies to every grid-map game from now on. No level data ships in the client.
- **The server checks every clear** (the submitted path is replayed against the issued map) before paying.
- **Rewards: 5 sprinkles per cleared level, capped at 50 a day.**
- Details: `.claude/contract/2026-11-17-pips-path-mockup/plan.md` → "Decisions after mockup review".

---

## Objective

Pip asks the player to play a game. From Pip's speech bubble the player taps **Play a game**, picks a game, and plays. The first game is **Pip's Path**: short grid puzzles where Pip is the token on the board. The puzzles come in chapters, one puzzle family per chapter. Each new chapter mixes in refreshers from the earlier ones. Once every chapter is cleared, the game serves random puzzles from the whole pool.

## Background

Pip's room (MPP-15) gives the player reasons to come back every day: the check-in, cooking, the fridge, trophies and the shop. A short puzzle adds something to do in the room that does not depend on meal data. Grid path puzzles suit this well: they are quick, playable one-handed on a phone, and easy to build as level data on one shared tile engine.

## Approach

### Entry point

* Pip's speech bubble (the MPP-21 `SpeechBubble` with `bubbleActions`) gets a **Play a game** action. Pip offers it when no check-in question is waiting, e.g. "Play a game with me?"
* A game picker opens. Today it lists one game, Pip's Path. It is built as a list so later games slot in.

### Chapter cadence (the core rule)

* **Chapter 1:** 10 puzzles of family 1.
* **Chapter 2:** 10 puzzles of family 2, then 1 refresher from family 1.
* **Chapter 3:** 10 puzzles of family 3, then 1 refresher from family 1 and 1 from family 2.
* **Chapter n:** difficulty levels 1–10 of family n plus one refresher from each earlier family (10 + (n − 1)).
* A refresher is a freshly generated, high-difficulty map of the earlier family.
* **Endless mode:** after the last shipped chapter, the server generates a map from a random family and difficulty. Every map is new, so nothing repeats. When a new chapter ships it unlocks next, then endless mode resumes.
* Puzzles in a chapter unlock in order. Cleared puzzles stay replayable from a chapter map.

### Puzzle families (proposed chapter order)

In-app names are our own. The inspirations are listed for design reference only. No franchise names, marks or lookalike art in the app (theme rules in CLAUDE.md).

| # | Chapter (in-app name) | Family | Rule | Inspired by |
|---|---|---|---|---|
| 1 | **Garden Path** | Single-visit path (Hamiltonian) | Draw one continuous path that visits every tile exactly once. No crossing, no backtracking. | One-line fill puzzles |
| 2 | **Thin Ice** | Single-visit path, cracked floor | Pip walks over cracking tiles. A tile breaks once stepped on. Visit every tile, then finish on the exit. | Cracked-ice gym floors in monster-catching RPGs |
| 3 | **Slippery Floor** | Frictionless sliding | Pip slides until hitting a wall, rock or dry patch. Reach the goal. | Ice caves in RPGs, tilt mazes |
| 4 | **Pantry Push** | Block pushing | Push crates onto switches without wedging them in corners. | Sokoban, strength-boulder puzzles |
| 5 | **Leaping Pip** | Knight's tour | Move like a chess knight and land on every square once (small boards, some with holes). | The Knight's Tour |
| 6 | **Pipe Pairs** | Pair linking | Join matching ingredients with paths that never cross and fill every tile. | Numberlink |
| 7 | **Arrow Floor** | Forced-move tiles | Arrow tiles push Pip along. Warp pads teleport Pip. | Spin and warp tiles in RPG gyms |
| 8 | **Bump & Stop** | Collision sliding | Pieces slide until they hit another piece. Line one up on the target. | Ricochet- and lockout-style sliders |
| 9 | **Tile Shuffle** | Sliding tiles | Slide tiles through one gap to rebuild a picture of Pip (3×3, then 4×4). | 15-puzzle |
| 10 | **Fridge Jam** | Block shuffle | Slide items forward and back to free one item from a packed fridge. | Parking-lot block puzzles |
| 11 | **Switch Flip** | Toggle grid | Tapping a tile flips it and its neighbours. Turn them all off. | Lights-out puzzles |
| 12 | **One Stroke** | Edge path (Eulerian) | Trace every line of a shape once without lifting. | One-stroke drawings |
| 13 | **Bridges** | Island linking | Join numbered islands with bridges until they form one network. | Hashiwokakero |

Maybe later: loop puzzles (Slitherlink), hidden-hazard deduction (Minesweeper-style), domino chains.

Not planned: rule-rewriting word blocks (too large, and its look is too close to one specific game), Seven Bridges of Königsberg (unsolvable by design).

### Engine reuse

* **Tile walker** (Pip moves on the grid): chapters 1, 2, 3, 5, 7, 8. Chapter 1 builds it.
* **Pushables** on the walker: chapter 4.
* **Line drawing** between cells or nodes: chapters 6, 12, 13.
* **Block sliding**: chapters 9, 10.
* **Toggle grid**: chapter 11.

### Levels generated server-side, proven solvable

* The backend generates every map on demand, per family and difficulty 1–10. The client holds no level data.
* A map is served only after the backend solver proves it solvable within a fixed search budget. Building the map around a random solution path first, then placing blocked tiles off the path, makes this cheap.
* Each difficulty fixes a board size (at most 6 columns, so tiles stay ≥44 px at 320 px), a blocked-tile range and a solution-count band. Garden Path's bands are calibrated against the 10 hand-made mockup levels.
* Backend tests replace a client `check:puzzles` script: for every family × difficulty, N seeded maps must be solvable, inside their bands and generated within the time budget.
* The client submits its path for the issued map. The server replays it and pays only for a valid full path, once per map.

### Progress and rewards

* Progress is **per person**, like Pip (MPP-33): the highest cleared difficulty per family, current chapter and position. It is stored server-side, so it follows the player across devices.
* **Rewards: 5 sprinkles per cleared level, capped at 50 a day** (Europe/Dublin day). Every play is a new map, so there is no separate replay rate. The rewards follow the existing rule: they reward consistency, not food variety.

### UX

* Tap a neighbouring tile or swipe to move. Arrow keys work on desktop.
* **Undo** and **Restart** on every puzzle.
* Works from 320 to 1280 px. Respects reduced motion.
* The board chrome follows the active theme (Default, Cyberpunk, Parchment) through tokens. The Pip token is drawn from the player's Pip line (herb, dragon or robot).
* Pip reacts when a puzzle is cleared, and the bubble line changes.

## Roadmap (child tickets, created one at a time)

| # | Ticket | What | Can't start until |
|---|---|---|---|
| 1 | TBD | Mockup: Play-a-game bubble action, game picker, Pip's Path chapter map and board in all three themes | Nothing |
| 2 | TBD | Foundation + Chapter 1 **Garden Path** (difficulty 1–10): entry point, picker, tile-walker engine, server-side map generator + solver (Java) with per-difficulty bands, path-checked clears, chapter sequencer (10 + refreshers + endless), per-person progress (migration + API), 5 sprinkles per clear capped at 50 a day | 1 |
| 3 | TBD | Chapter 2 **Thin Ice** (generator, difficulty 1–10) + 1 Garden Path refresher | 2 |
| 4 | TBD | Chapter 3 **Slippery Floor** (generator, difficulty 1–10) + 2 refreshers | 3 |
| 5 | TBD | Chapter 4 **Pantry Push** (generator, difficulty 1–10) + 3 refreshers | 4 |
| 6+ | TBD | One ticket per later chapter (5–13), in the order above, each with its refreshers | previous chapter |

Each chapter ticket also updates the mockup (CLAUDE.md, Mockups) and bumps the version (MINOR).

## Scope

**In scope:**

* Play a game action in Pip's bubble, and a game picker
* Pip's Path: chapter map, puzzle board, undo and restart, clear celebration
* Chapter sequencer with refreshers and endless random mode
* Per-person progress persisted server-side
* Sprinkle rewards: 5 per cleared level, capped at 50 a day
* Puzzle families 1–13 above, one chapter per ticket
* Server-side map generation per family and difficulty 1–10, each map proven solvable before it is served
* Mockups for all three themes

**Out of scope:**

* Games that are not grid puzzles (separate epic if wanted)
* Hand-made level packs shipped in the client (superseded 2026-11-17: maps are generated server-side)
* Leaderboards, timers, or competing with the shared-plan partner
* Pip XP or evolution from games (the evolution level stays tied to meal habits)
* Rewards for food variety (rejected rule)

## Prioritisation

Use Jira priorities (Highest → Lowest) to triage child issues. The mockup and the foundation come first. Chapters follow strictly in order, because the refresher rule depends on the earlier families existing.

## Deliverables

* A Play a game entry from Pip's bubble, and a game picker
* The Pip's Path game, with 13 chapters shipped over time
* A tile-walker engine plus the line, slide and toggle engines added as chapters need them
* A server-side generator and solver per family, with backend tests that prove every difficulty band
* A per-person progress table, migration and API
* Sprinkle rewards: 5 per cleared level, capped at 50 a day
* An updated mockup in `foodbytes-app/mockup/`

## Definition of Done

1. The player can tap Play a game in Pip's bubble, choose Pip's Path, and play.
2. Every planned chapter has shipped with difficulty levels 1–10 plus one refresher per earlier family.
3. After the last chapter, endless mode serves freshly generated maps of a random family and difficulty.
4. Every map the server serves is proven solvable first, and the backend generator tests pass for every family and difficulty.
5. Progress is per person and survives devices and reloads.
6. Each server-checked clear pays 5 sprinkles, up to 50 a day.
7. Every screen works at 320–1280 px in Default, Cyberpunk and Parchment, with reduced motion honoured.
8. The mockups match the live app.

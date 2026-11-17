# Research: generating Garden Path maps (difficulty 7–10)

Date: 2026-11-17. Written during `/fb-apply` after Tasks 5–6 failed, to inform the band/generator decision.

## The puzzle, restated

Grid ≤ 6 columns, some tiles are rocks, Pip starts on `S` and must step on every open tile exactly once with orthogonal moves. The only levers a generator has are **where the rocks go** and **where `S` goes**. Difficulty = how many different routes work (d8 wants 1–3, d9 wants 1–2).

## What went wrong with the plan's method

The plan built each map *around* a random route: walk a random path covering all but 2–4 tiles, make the skipped tiles rocks, put `S` at the walk's first tile. In 2 000 tries no d7–10 map landed in its band (best: 9 routes at d7 vs max 8; 12 at d8 vs max 3).

**Why — the sampling bias.** Every solvable map is "some route + rocks off it", so building from a route *can* reach every map. But it reaches each map once per route it has. A map with 50 routes is 50× more likely to be produced than a map with 1 route. Building around a random route therefore **systematically favours easy maps**, and the harder the band, the worse it gets. With only 2–4 rocks the 1–3-route maps are rare to begin with, so they are effectively never drawn. (The plan's walk was also a Warnsdorff-biased walk, not a uniform one, which skews it further.)

## What published generators do

| Source | Puzzle | How it gets few/unique solutions | Relevance |
|---|---|---|---|
| [onepath](https://github.com/TheRealAlexxx/onepath) (`gen.js`, `core.js`) | Fill grid in one stroke; rocks + start (+ optional checkpoints); 4–6 wide | **Random rocks (22% chance per cell), random start, solve with limit 2 and a node budget, keep only if exactly 1 solution.** Retry otherwise. | **Closest match** — the 0-checkpoint case *is* our puzzle. Uses the same method the Implementer switched to. |
| [Tracewise — dev.to](https://dev.to/blackspectre512/generating-daily-path-puzzles-with-exactly-one-solution-backbite-parity-pruning-and-clue-374f) | Numbered path puzzle, 5×5–8×8 | Route first (backbite), then **add number clues / edge walls** where a rival route diverges, until unique. | Route-first works here because it has extra clue types to kill rivals. We only have rocks, and a rock can't sit on the intended route. Pruning tricks transfer (below). |
| [Zip — dev.to](https://dev.to/quinnharlow/how-i-generate-zip-path-puzzles-that-have-exactly-one-solution-jmg) | Zip-style numbered path | Same as Tracewise: route first, add numbers or walls at divergence. 6×6 in ~0.03 s. | Same limitation: needs numbers/walls, which Garden Path doesn't have. Notes "scatter … and hope" fails *when clues must lie on a path*. |
| [Number Trail](https://www.4rknova.com/blog/2026/04/24/number-trail) | Numbered trail with walls | Route first (Warnsdorff), walls on random off-route edges. **No uniqueness check at all.** | Shows route-first guarantees *a* solution, not *few* solutions. |
| [Simon Tatham — writing puzzles](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/writing.html), [Mines generator](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/mines-solver/) | Many | **Generate at random, run the solver, regenerate if it fails**; for Mines, *perturb* the grid locally when the solver gets stuck, then re-prove. | The standard industry pattern: solver is the proof, not construction. Perturbation is a speed-up option for us. |
| [Backbite / Mansfield](https://mlbj.github.io/posts/25/random_hamiltonian_paths), [SO answer](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/7371227/algorithm-to-find-a-random-hamiltonian-path-in-a-grid) | Random Hamiltonian paths | Backbite mixing gives near-uniform random routes; plain random DFS "gets slow and biased". | Fixes the walk's bias, but **not** the route-count bias above, so it wouldn't rescue d7–10. |
| [Procedural Puzzle Generation survey](https://www.researchgate.net/publication/333226463_Procedural_Puzzle_Generation_A_Survey) | General | Two families: constructive (build solution, add constraints) and generate-and-test (random + solver). | Frames the choice. |

## Conclusion

1. **Route-first is the right method only when the generator can add constraints that sit on or beside the route** (numbers, edge walls). Garden Path has only rocks, which must sit *off* the route, so route-first can't remove rival routes and is biased towards easy maps.
2. **For rock-only one-stroke puzzles, the published approach is generate-and-test**: random rocks + random start, solver proves the count, retry. That is exactly what the Implementer built. Every served map is still proven solvable — by the solver rather than by construction.
3. The developer's requirement *"every map is proven solvable before it is sent"* is fully met. Only the "build it around a route" detail changes.

## Recommendation

**Keep the bands (your mockup levels stay the difficulty ramp) and adopt generate-and-test**, with three cheap upgrades from the sources to make d10 fast and robust:

- **Checkerboard parity filter** (Tracewise): colour the board like a chessboard. A route alternates colours, so open black and white tiles must differ by at most 1, and if they differ by 1 the start must be on the larger colour. This rejects most bad rock/start combinations in O(1), before any search.
- **Dead-end / degree pruning** (Tracewise, Zip): already mirrored from the mockup solver (connectivity + at most one dead end) — keep it.
- **Local perturbation** (Tatham's Mines): if a rock layout has no in-band start, move one rock to a neighbouring tile and retry, instead of starting over. Re-prove after.

Rejected alternative: redesigning bands to fit route-first would need many more rocks or much higher route limits at d7–10, so mockup levels 7–10 (6, 1, 1, 4 routes) would no longer fit their own bands.

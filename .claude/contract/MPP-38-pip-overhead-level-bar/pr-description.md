## MPP-38: Small level bar over Pip's head

Plan: [plan.md](./plan.md) (this folder). Version: **1.25.0** (Story, MINOR bump from 1.24.2).

### Summary
- The labelled level strip under Pip's room (`PipLevelBar`) is removed.
- A small, text-free green bar is drawn over Pip's head inside `RoomPip` (`PipHeadBar`), so it follows every pose, the cook walk and the bed.
- It clears every hat and head growth (geometry in `herb/headBar.js`, pinned by `wardrobe.check.mjs`).
- A visually hidden `role="progressbar"` (`PipHeadBarStatus`) keeps progress available to screen readers ("Growth, Sprig, 14 of 24 to Bushling").
- Before an evolve the full bar fills, then flashes yellow once; the new form's bar starts empty without animating backwards.
- Reduced motion: no fill transition, no flash.
- Hidden once Pip is a Basilisk (`PetView`: `levelBar` is `null` at Basilisk).

No migration. Apply order: merge after MPP-37 (both touch `PetRoom.jsx`, `PetRoom.css`, `PetView.jsx`).

### ACTION REQUIRED BEFORE MERGE: `crownTop` / `growthRise` are PROVISIONAL
The values pinned in `foodbytes-app/client/src/components/pet/herb/herbForms.js` are **provisional control-point (convex-hull) bounds, not `getBBox` measurements**. The developer must run the Task 2 Step 1 snippet (tasks.md) in the approved mockup in Chrome and replace the literals.

| Form | crownTop | growthRise |
|---|---|---|
| Basil seed | 109 | 0 |
| Seedling | 105 | 38 |
| Sprig | 71 | 53 |
| Bushling | 51 | 0 |
| Basilisk | 35 | 80 |

Re-measure them (Task 2's snippet) whenever `HerbBack`, `HerbGrowth` or a body path changes.

### Verification
| Check | Result |
|---|---|
| `npm run check:version` | `Version OK: 1.25.0` |
| `npm run build` | passed (`built in 800ms`) |
| `npm run check:wardrobe` | `wardrobe checks passed` (exit 0) |
| `npm run check:room` | `room checks passed` |
| `npm run check:growth` | `pipGrowth checks passed` |
| Grep `PipLevelBar\|pip-level` / `MPP38-TEMP` | zero hits; `console.log/debug` count 5 (baseline 6) |
| `mvn test` | run by QA (no backend change) |

No frontend test runner exists; rendering, hats, bubble layering and a11y have not been exercised automatically.

### Phase 3 manual phone check: PENDING, developer manual check
1. Forms 1-4, no hat: bar above head, no text: PENDING
2. Forms 1-4 with each hat clear of the crown, incl. bounce: PENDING
3. Rug to cooker walk: bar travels with Pip: PENDING
4. Asleep at bed levels 1-4: visible, same size, not hidden: PENDING
5. Speech bubble paints above bar: PENDING
6. Evolve: fills, flashes yellow once, new form starts empty: PENDING
7. Basilisk: no bar, no progressbar for screen reader: PENDING
8. Screen reader reads "Growth, ..." value text: PENDING
9. Reduced motion: no transition or flash: PENDING

### Suggested commit subject
`MPP-38: Small level bar over Pip's head`

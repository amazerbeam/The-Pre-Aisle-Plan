# Tasks: Themed Pip lines (dragon for Parchment, robot for Cyberpunk)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-15

**Goal:** One Pip, three skins: the server returns growth for herb / dragon / robot (form from peak points, never de-evolving), and the client draws the line named by the active theme's `pipLine`. Every wardrobe item has its own art and name on each creature (same id, slot and unlock), fits all 11 forms, and its animations stop under reduced motion and Low FX.

**Spec:** `plan.md` in this folder (upstream brief: `spec.md`).

---

## File map

**Created:**
- `foodbytes-app/mockup/pip-themed-lines.html` — the dragon + robot forms (and herb for reference), bare and outfitted, for approval
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetLineGrowthDTO.java` — one line's growth
- `foodbytes-app/client/src/constants/pipLines.js` — line ids, default line, per-line copy
- `foodbytes-app/client/src/components/pet/pip/pipSpace.js` — the shared 200-unit space (foot point, full viewBox)
- `foodbytes-app/client/src/components/pet/pip/lineForms.js` — geometry registry per line
- `foodbytes-app/client/src/components/pet/pip/lineArt.jsx` — art-adapter registry per line
- `foodbytes-app/client/src/components/pet/herb/herbArt.jsx` — herb art adapter
- `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js` — the wardrobe dispatcher per line (`LINE_WARDROBE`, `hatArt(line, …)` …), replacing the herb-only file of the same name
- `foodbytes-app/client/src/components/pet/pip/wardrobeShapes.js` — shared descriptor helpers (`curveOf`, `arcY`, `arc`, `band`, `fxGroup`, `pxCells`, `heartPath`)
- `foodbytes-app/client/src/components/pet/dragon/dragonForms.js`, `dragonParts.jsx`, `dragonFaces.jsx`, `dragonArt.jsx`, `dragonWardrobe.js`
- `foodbytes-app/client/src/components/pet/robot/robotForms.js`, `robotParts.jsx`, `robotFaces.jsx`, `robotArt.jsx`, `robotWardrobe.js`

**Moved (`git mv`, then modified):**
- `components/pet/herb/PipHerbFigure.jsx` → `components/pet/pip/PipFigure.jsx`
- `components/pet/herb/PipHerb.jsx` → `components/pet/pip/Pip.jsx`
- `components/pet/herb/PipHerb.css` → `components/pet/pip/Pip.css`
- `components/pet/herb/HerbOutfit.jsx` → `components/pet/pip/PipOutfit.jsx`
- `components/pet/herb/wardrobeLayers.js`, `headBar.js`, `wardrobe.check.mjs` → `components/pet/pip/`
- `components/pet/herb/wardrobeArt.js` → `components/pet/herb/herbWardrobe.js` (the herb's drawings, unchanged, exported as `HERB_WARDROBE`)

**Modified:**
- `foodbytes-api/.../dto/PetGrowthDTO.java` — top-level `form/barCurrent/barSize/fullyGrown` → `lines` map
- `foodbytes-api/.../service/PetGrowthPolicy.java` — `Line` enum, `formFor(Line,int)`, `effectivePeak`, `lineGrowth`, new `toDTO`
- `foodbytes-api/.../service/PetGrowthService.java` — javadoc only (no de-evolve)
- `foodbytes-api/src/test/.../PetGrowthPolicyTest.java`, `PetGrowthServiceTest.java`, `PetServiceTest.java`, `WardrobeServiceTest.java`
- `client/src/constants/pipGrowth.js` — herb copy and devolve phases removed
- `client/src/constants/themes.js` — `pipLine` per theme
- `client/scripts/check-themes.mjs` — `pipLine` validation
- `client/src/utils/pipGrowth.js`, `utils/pipGrowth.check.mjs`, `utils/pipGrowthSeenStore.js`, `hooks/usePipGrowth.js`
- `client/src/components/pet/herb/herbForms.js`, `herbFaces.jsx`, `herbParts.jsx`
- `client/src/components/pet/PetView.jsx`, `room/PetRoom.jsx`, `room/RoomPip.jsx`, `room/PipHeadBar.jsx`, `room/WardrobeView.jsx`, `room/WardrobeItemGrid.jsx`, `room/WardrobeLineup.jsx`, `layout/AppNavItems.jsx`
- `client/src/constants/pipWardrobe.js` — item labels move to `WARDROBE_ITEM_LABELS` per line
- `client/src/utils/pipWardrobe.js`, `hooks/usePipWardrobe.js` — `wardrobeItemLabel(line, id)`, line-aware announcement
- `client/src/services/petService.js` — JSDoc of `growth`
- `client/package.json` — `check:wardrobe` path, version
- `foodbytes-api/pom.xml` — version
- `foodbytes-app/mockup/README.md` — new row + sync note
- `CHANGELOG.md`

**Deleted:** (none beyond the moves)

---

## Phase 1 — Mockup and approval

Draws the dragon and robot lines in the in-repo mockup and stops for developer approval. No production code changes, so the build is untouched; Phase 4 ports geometry from this file verbatim, so nothing after Phase 2 may start until Task 3 is ticked.

### Task 1: Build `mockup/pip-themed-lines.html` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/mockup/pip-themed-lines.html`

- [x] **Step 1: Scaffold from the approved herb mockup**

Copy the `<style>`, the `FORMS` table, the wardrobe drawing functions (`drawHat`, `drawGlasses`, `drawScarf`, `drawJacket`, `drawBelt`, `drawPants`, `drawShoe`, or whatever the file names them) and the figure-composition function from `.claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html` into the new file. Rename the herb table `HERB_FORMS`. Keep the same 200-unit space: feet on y = 186, scale about (100, 186), viewBox `0 -40 200 240`.

- [x] **Step 2: Add `DRAGON_FORMS` and `ROBOT_FORMS` tables**

Three entries each, with exactly the herb keys: `name, scale, fill: [top, bottom], body, hat {y, w}, eyes {y, gap, s}, neck, waist, side, feet [[root, tip], [root, tip]], growTop, crownTop, growthRise, miniViewBox`. `body` is ONE closed path covering head + torso (it is the torso-clothes clip). Every form: upright, forward-facing head, two eyes at `eyes`, feet tips on y 185–186. Anchor ordering per form: `crownTop ≤ hat.y < eyes.y < neck < waist < feet tip y`, `growTop ≤ hat.y`, `eyes.gap × 2 < hat.w`, `eyes.gap + 8 × eyes.s < side`. Scale grows with the form (e.g. 0.84 → 0.92 → 0.98).
- Dragon (generic fantasy, own palette, e.g. teal/green scales, cream belly): 1 **Hatchling** — tiny and stubby, eggshell shards at the feet and a shell cap fragment; 2 **Wyrmling** — wing buds, small horns, short tail; 3 **Drake** — full wings, curved horns, long tail. Horns are the `Crown` (rise `growthRise` above `growTop`, poke through hats). Wings + tail are the `Back`.
- Robot (humanoid **screen-face robot**, revised 2026-11-15 at the developer's request, genre feel only, no franchise lookalike): a CRT-monitor head whose dark screen shows the face as glowing cyan pixel shapes, on a worn gunmetal body (scuffs, rust spots, a riveted chest patch, side dials on the head, a trailing cable on forms 2–3). 1 **Bot-kid** — big monitor head, small body; 2 **Teen Unit** — taller, leaner; 3 **Android** — adult proportions, shoulder upgrade plating and a chest chevron. Antenna is the `Crown`. The two pixel eyes sit at `eyes` (glasses sit on the screen over them).
- No franchise marks, names or lookalikes.

- [x] **Step 3: Draw the per-line parts and faces**

For each line: `Back(form, droop)`, `Limbs(f)` (legs from feet roots to tips, arms at the sides), `Details(form, f)` (belly scales / chest panel), `Face(form, mood)` for moods content, happy, bored, mischievous and sleep, reading only `eyes`, and `Crown(form, droop, base)`. Wilted: dragon wings and tail droop, robot antenna droops and eye glow dims (plus the shared desaturate filter).

- [x] **Step 4: Lay out the review page**

Three rows (Herb, Dragon, Robot). Each row shows every form twice: bare, and in the full outfit `{ HAT: 'top-hat', GLASSES: 'round-specs', SCARF: 'red-scarf', JACKET: 'denim-jacket', BELT: 'leather-belt', PANTS: 'dungarees', SHOES: 'wellies' }`. Below each row: the forms at mini size (32 px) on the Default footer, the Cyberpunk footer `#05070b` and the Parchment footer `#3b2415` backgrounds, and a "wilted" + "asleep" sample of the last form. A select at the top cycles the outfit through every item of every slot so each item can be eyeballed on all 11 forms.

- [x] **Step 5: Open it**

Run: `Start-Process foodbytes-app\mockup\pip-themed-lines.html`
Expected: three rows render with no console errors (DevTools → Console empty); every outfit item visibly sits on head / eyes / torso / feet of every form.

### Task 2: Register the mockup in the README ✓

- Skill: none — documentation

**Files:**
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: Add a table row**

Under the `| File | What it shows |` table add:
`| `pip-themed-lines.html` | Pip's three lines (herb, dragon for Parchment, robot for Cyberpunk), every form bare and in a full outfit, mini sizes on each theme's footer, wilted/asleep samples. Source of the dragon/robot geometry in `client/src/components/pet/dragon|robot/*Forms.js`. |`

- [x] **Step 2: Verify**

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "pip-themed-lines.html"`
Expected: one hit.

### Task 3: Developer approves the mockup ✓

- Skill: none — developer review gate

- [x] **Step 1: Developer reviews `foodbytes-app/mockup/pip-themed-lines.html`**

Developer opens the file, checks the six new forms (shape, franchise-free, readable at 32 px, outfits fit) and either approves or lists changes. Changes loop back to Task 1. Record the approval date in a one-line note at the top of the mockup's `<body>` (`<!-- approved 2026-11-.. -->`).
Expected: developer says "approved". Phases 3–5 do not start before this.

**Approved 2026-11-15**, after two revision rounds: (1) the robot was redesigned as a screen-face robot; (2) every wardrobe item got its own art, name and (where listed) animation per creature, mockup section 3 "Wardrobe per creature". The approved mockup is the source for all dragon/robot geometry, parts, faces and wardrobe art ported in Phase 4.

---

## Phase 2 — Server line registry

Reshapes the growth contract and moves the policy to per-line, peak-based forms. Ends with the backend compiling and every backend test green. The client still compiles; it reads the old fields at runtime until Phase 5, which is acceptable because nothing deploys mid-contract.

### Task 4: Add `PetLineGrowthDTO` and reshape `PetGrowthDTO` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetLineGrowthDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetGrowthDTO.java`

- [x] **Step 1: Create `PetLineGrowthDTO`**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One Pip line's growth (herb, dragon, robot). Built only by PetGrowthPolicy#lineGrowth. The form
 * comes from the peak total, so it never drops; the bar shows the current points and can drain.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetLineGrowthDTO {
    private int form;            // 1..last form of the line, from the effective peak
    private int peakForm;        // equals form (form is peak-based)
    private int formStart;       // points at which this form begins
    private Integer barCurrent;  // max(0, points - formStart); null at the line's last form
    private Integer barSize;     // next threshold - formStart; null at the line's last form
    private boolean fullyGrown;  // the line's last currently defined form is reached
}
```

- [x] **Step 2: Replace the body of `PetGrowthDTO`**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

/**
 * MPP-31 / themed Pip lines: the caller's own Pip growth. One points history, one growth result per
 * line (keys "herb", "dragon", "robot"); the client draws the line its theme names. Rules live in
 * PetGrowthPolicy.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetGrowthDTO {
    private int points;                          // floored running total, never below 0
    private int lastDayScore;                    // most recent non-zero day score (3 or -3), 0 if none yet
    private LocalDate lastScoredDate;            // date of that day, null if none yet
    private int peakForm;                        // the herb line's form: drives wardrobe FORM unlocks (MPP-32)
    private Map<String, PetLineGrowthDTO> lines; // ordered herb, dragon, robot
}
```
(No compile step here: `PetGrowthPolicy` is updated in Task 5 within this phase.)

### Task 5: Per-line, peak-based `PetGrowthPolicy` (test first) ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthPolicyTest.java`

- [x] **Step 1: Rewrite the threshold / de-evolve / DTO tests**

Keep the AC 1 day-score tests, `floorAtZero…`, `zeroDaysAreSkipped…`, `emptyHistory…` and `peak_tracksTheHighestRunningTotal` unchanged. Delete `slipRightAfterEvolving_deEvolves`, `peakForm_staysAtTheHighestFormAfterADeEvolve`, `peakForm_equalsTheFormWhenNeverHigher`, `peakForm_isBasiliskWhenFullyGrown_whateverThePoints`, `peakForm_ofTheEmptyReplay_isTheSeed`, `eachThreshold_crossedUpThenDown`, `toDTO_barIsPointsMinusThreshold_overTheFormsBarSize`, `toDTO_fullyGrown_isBasiliskWithNoBar_whateverThePoints`, and `formFor_eachThresholdBoundary`. Add (import `com.foodbytes.service.PetGrowthPolicy.Line`, `com.foodbytes.dto.PetLineGrowthDTO`):

```java
    private static PetLineGrowthDTO line(PetGrowthDTO dto, Line line) {
        return dto.getLines().get(line.key());
    }

    private static int[] upThenDown(int ups, int downs) {
        int[] out = java.util.Arrays.copyOf(repeat(3, ups), ups + downs);
        java.util.Arrays.fill(out, ups, ups + downs, -3);
        return out;
    }

    // ---- line registry ----

    @Test
    void registry_herbDragonRobot_inOrder_withTheirThresholds() {
        assertThat(Line.values()).containsExactly(Line.HERB, Line.DRAGON, Line.ROBOT);
        assertThat(Line.HERB.thresholds()).containsExactly(0, 15, 36, 60, 90);
        assertThat(Line.DRAGON.thresholds()).containsExactly(0, 15, 36);
        assertThat(Line.ROBOT.thresholds()).containsExactly(0, 15, 36);
        assertThat(Line.HERB.key()).isEqualTo("herb");
        assertThat(Line.DRAGON.lastForm()).isEqualTo(3);
        assertThat(PetGrowthPolicy.FORM_THRESHOLDS).isEqualTo(Line.HERB.thresholds());
    }

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "59,3", "60,4", "89,4", "90,5", "120,5"})
    void formFor_herb_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(Line.HERB, points)).isEqualTo(form);
    }

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "90,3"})
    void formFor_dragonAndRobot_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(Line.DRAGON, points)).isEqualTo(form);
        assertThat(PetGrowthPolicy.formFor(Line.ROBOT, points)).isEqualTo(form);
    }

    @Test
    void toDTO_hasEveryLine_inRegistryOrder() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(Replay.EMPTY, false);
        assertThat(dto.getLines()).containsOnlyKeys("herb", "dragon", "robot");
        assertThat(dto.getLines().keySet()).containsExactly("herb", "dragon", "robot");
        for (Line l : Line.values()) {
            assertThat(line(dto, l).getForm()).isEqualTo(1);
            assertThat(line(dto, l).getBarCurrent()).isZero();
            assertThat(line(dto, l).getBarSize()).isEqualTo(15);
        }
        assertThat(dto.getPeakForm()).isEqualTo(1);
    }

    // ---- never de-evolve: form from peak, every line (herb included) ----

    @Test
    void slipRightAfterEvolving_noLineDeEvolves_andTheBarSitsEmpty() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(5, 1))), false); // 15 -> 12
        assertThat(dto.getPoints()).isEqualTo(12);
        for (Line l : Line.values()) {
            PetLineGrowthDTO g = line(dto, l);
            assertThat(g.getForm()).as(l.key()).isEqualTo(2);
            assertThat(g.getPeakForm()).isEqualTo(2);
            assertThat(g.getFormStart()).isEqualTo(15);
            assertThat(g.getBarCurrent()).isZero();
            assertThat(g.getBarSize()).isEqualTo(21);
        }
    }

    @Test
    void eachThreshold_crossedUpThenDown_keepsTheHigherForm() {
        // 15 -> 12, 36 -> 33, 60 -> 57: herb stays 2 / 3 / 4
        for (int[] pair : new int[][] {{5, 2}, {12, 3}, {20, 4}}) {
            PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(pair[0], 1))), false);
            assertThat(line(dto, Line.HERB).getForm()).isEqualTo(pair[1]);
            assertThat(dto.getPeakForm()).isEqualTo(pair[1]);
        }
    }

    @Test
    void dragonAndRobot_reachTheirLastFormAt36_andStayFullyGrownAfterSlips() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(12, 10))), false); // 36 -> 6
        for (Line l : new Line[] {Line.DRAGON, Line.ROBOT}) {
            PetLineGrowthDTO g = line(dto, l);
            assertThat(g.getForm()).isEqualTo(3);
            assertThat(g.isFullyGrown()).isTrue();
            assertThat(g.getBarCurrent()).isNull();
            assertThat(g.getBarSize()).isNull();
            assertThat(g.getFormStart()).isEqualTo(36);
        }
        PetLineGrowthDTO herb = line(dto, Line.HERB);
        assertThat(herb.getForm()).isEqualTo(3);
        assertThat(herb.isFullyGrown()).isFalse();
        assertThat(herb.getBarCurrent()).isZero();          // 6 points, below Sprig's 36
        assertThat(herb.getBarSize()).isEqualTo(24);
    }

    @Test
    void bar_isPointsMinusFormStart_overTheGapToTheNextForm() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 7))), false); // 21
        PetLineGrowthDTO herb = line(dto, Line.HERB);
        assertThat(herb.getForm()).isEqualTo(2);
        assertThat(herb.getBarCurrent()).isEqualTo(6);
        assertThat(herb.getBarSize()).isEqualTo(21);
        assertThat(herb.isFullyGrown()).isFalse();
    }

    // ---- the fully-grown marker floors the peak at Basilisk ----

    @Test
    void fullyGrownMarker_isBasiliskAndEveryLineAtItsLastForm_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 2))), true); // 6 points
        assertThat(dto.getPoints()).isEqualTo(6);
        assertThat(dto.getPeakForm()).isEqualTo(5);
        assertThat(line(dto, Line.HERB).getForm()).isEqualTo(5);
        for (Line l : Line.values()) {
            assertThat(line(dto, l).isFullyGrown()).isTrue();
            assertThat(line(dto, l).getBarSize()).isNull();
        }
    }

    @Test
    void effectivePeak_floorsAtNinetyOnlyWhenFullyGrown() {
        Replay replay = PetGrowthPolicy.replay(days(repeat(3, 4)));                 // peak 12
        assertThat(PetGrowthPolicy.effectivePeak(replay, false)).isEqualTo(12);
        assertThat(PetGrowthPolicy.effectivePeak(replay, true)).isEqualTo(90);
    }
```

- [x] **Step 2: Run the tests and see them fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest`
Expected: COMPILATION ERROR (`Line`, `effectivePeak`, `formFor(Line,int)` missing).

- [x] **Step 3: Implement the line registry in `PetGrowthPolicy`**

Update the class javadoc's last two sentences to: "Scores are applied in date order with the total floored at 0. Each line (herb, dragon, robot) picks its form from the peak total, so no line de-evolves; the bar shows the current total and can drain. Once Basilisk's 90 has been reached (users.pet_fully_grown_at) the peak is floored there." Add imports `com.foodbytes.dto.PetLineGrowthDTO`, `java.util.LinkedHashMap`. Replace `FORM_THRESHOLDS`, `formFor`, and `toDTO` with:

```java
    /** One Pip skin per theme. Thresholds: index = form - 1. Append a threshold to add a stronger form. */
    public enum Line {
        HERB("herb", List.of(0, 15, 36, 60, 90)),
        DRAGON("dragon", List.of(0, 15, 36)),
        ROBOT("robot", List.of(0, 15, 36));

        private final String key;
        private final List<Integer> thresholds;

        Line(String key, List<Integer> thresholds) {
            this.key = key;
            this.thresholds = thresholds;
        }

        public String key() {
            return key;
        }

        public List<Integer> thresholds() {
            return thresholds;
        }

        public int lastForm() {
            return thresholds.size();
        }
    }

    /** The herb line's thresholds (WardrobeCatalogue's FORM_* unlocks are herb forms). */
    public static final List<Integer> FORM_THRESHOLDS = Line.HERB.thresholds();

    public static int formFor(Line line, int points) {
        List<Integer> thresholds = line.thresholds();
        int form = 1;
        for (int i = 1; i < thresholds.size(); i++) {
            if (points >= thresholds.get(i)) {
                form = i + 1;
            }
        }
        return form;
    }

    /** The peak the forms are picked from: the replayed peak, floored at Basilisk's once fully grown. */
    public static int effectivePeak(Replay replay, boolean fullyGrown) {
        int basilisk = FORM_THRESHOLDS.get(FORM_BASILISK - 1);
        return fullyGrown ? Math.max(replay.peak(), basilisk) : replay.peak();
    }

    /** One line's growth: form from the peak (never drops), bar from the current points, clamped at empty. */
    public static PetLineGrowthDTO lineGrowth(Line line, int points, int peak) {
        int form = formFor(line, peak);
        int start = line.thresholds().get(form - 1);
        if (form == line.lastForm()) {
            return new PetLineGrowthDTO(form, form, start, null, null, true);
        }
        int size = line.thresholds().get(form) - start;
        return new PetLineGrowthDTO(form, form, start, Math.max(0, points - start), size, false);
    }

    public static PetGrowthDTO toDTO(Replay replay, boolean fullyGrown) {
        int points = replay.points();
        int peak = effectivePeak(replay, fullyGrown);
        Map<String, PetLineGrowthDTO> lines = new LinkedHashMap<>();
        for (Line line : Line.values()) {
            lines.put(line.key(), lineGrowth(line, points, peak));
        }
        return new PetGrowthDTO(points, replay.lastDayScore(), replay.lastScoredDate(),
                lines.get(Line.HERB.key()).getForm(), lines);
    }
```
Keep `FORM_BASIL_SEED…FORM_BASILISK`, `dayScore`, `replay`, `reachedBasilisk` as they are.

- [x] **Step 4: Run the tests and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 6: Update `PetGrowthService` javadoc and its test ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthService.java:52-56`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthServiceTest.java`

- [x] **Step 1: Javadoc on `growth(User)`**

Replace "which keeps the form at Basilisk for good (AC 3)." with "which floors the peak at Basilisk for good (PetGrowthPolicy#effectivePeak), so no backdated correction can shrink a line that reached it."

- [x] **Step 2: Point the service test at the herb line**

Add `import com.foodbytes.dto.PetLineGrowthDTO;` and a helper:
```java
    private static PetLineGrowthDTO herb(PetGrowthDTO growth) {
        return growth.getLines().get("herb");
    }
```
Replace every `growth.getForm()` with `herb(growth).getForm()`, `service.growth(user(X)).getForm()` with `herb(service.growth(user(X))).getForm()`, `growth.isFullyGrown()` with `herb(growth).isFullyGrown()`, `growth.getBarSize()` with `herb(growth).getBarSize()`. In the test that asserts a de-evolve to form 1 after slips (around line 151–153), change the expectation to the peak-based form the replay reaches and rename it `…_keepsThePeakForm`; leave its points assertion as it is.

- [x] **Step 3: Run**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 7: Fix the other `PetGrowthDTO` constructors in tests ✓

- Skill: java-backend

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java:52`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobeServiceTest.java:67-69`

- [x] **Step 1: `PetServiceTest`**

```java
    private static final PetGrowthDTO GROWTH = PetGrowthPolicy.toDTO(
            new PetGrowthPolicy.Replay(21, 21, 3, null), false);
```
(add `import com.foodbytes.service.PetGrowthPolicy;` only if the test is in another package — it is in `com.foodbytes.service`, so no import.) Any assertion on `GROWTH.getForm()` becomes `GROWTH.getLines().get("herb").getForm()`.

- [x] **Step 2: `WardrobeServiceTest.growth(form, peakForm, lastDayScore)`**

Only `peakForm` and `lastDayScore` matter to `WardrobeService`. Replace the body:
```java
    private static PetGrowthDTO growth(int form, int peakForm, int lastDayScore) {
        return new PetGrowthDTO(0, lastDayScore, null, peakForm, java.util.Map.of());
    }
```
Leave the `form` parameter in place so callers are untouched.

- [x] **Step 3: Compile and run the affected classes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest+WardrobeServiceTest+PetGrowthPolicyTest+PetGrowthServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 3 — Line-aware renderer (herb only)

Moves the shared renderer into `components/pet/pip/` and threads `line` through every signature, with only the herb registered. The app looks exactly as today; `npm run build` and `check:wardrobe` are green at the end. Consumers read `theme.pipLine`, which is still undefined (added in Phase 5), so every lookup falls back to herb.

### Task 8: Line ids and copy (`constants/pipLines.js`) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/pipLines.js`

- [x] **Step 1: Write the module**

```js
/**
 * Themed Pip lines: one Pip, one points total, three skins. The server (PetGrowthPolicy.Line) owns
 * the thresholds; the client owns names and voice. The active theme's `pipLine` picks the line.
 *
 * Reserved names for later forms (not shipped — append in order):
 *   dragon: Dragon → Elder Dragon → Ancient Wyrm → Great Wyrm
 *   robot:  Synth → Cyborg Prime → Mech → Titan Frame
 */
export const PIP_LINE = { HERB: 'herb', DRAGON: 'dragon', ROBOT: 'robot' }

export const PIP_DEFAULT_LINE = PIP_LINE.HERB

export const PIP_LINE_COPY = {
  [PIP_LINE.HERB]: {
    formNames: { 1: 'Basil seed', 2: 'Seedling', 3: 'Sprig', 4: 'Bushling', 5: 'Basilisk' },
    fullyGrownLabel: 'Fully grown 🌸',
    fullyGrownLine: "I'm fully grown! 🌸 Thank you for looking after me.",
    slipLine: "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!",
    evolveEmoji: '🌱'
  },
  [PIP_LINE.DRAGON]: {
    formNames: { 1: 'Hatchling', 2: 'Wyrmling', 3: 'Drake' },
    fullyGrownLabel: 'Fully grown 🐉',
    fullyGrownLine: "I'm a full-grown drake! 🐉 Thank you for raising me.",
    slipLine: "Oof, I singed a few scales 🔥 A good day and they'll grow back!",
    evolveEmoji: '🐉'
  },
  [PIP_LINE.ROBOT]: {
    formNames: { 1: 'Bot-kid', 2: 'Teen Unit', 3: 'Android' },
    fullyGrownLabel: 'Fully upgraded ⚙️',
    fullyGrownLine: 'Upgrade complete! ⚙️ Thank you for building me.',
    slipLine: "Battery dipped a little 🔋 A good day and I'll recharge!",
    evolveEmoji: '⚙️'
  }
}

export const lineCopy = (line) => PIP_LINE_COPY[line] ?? PIP_LINE_COPY[PIP_DEFAULT_LINE]

export const formName = (line, form) => lineCopy(line).formNames[form] ?? lineCopy(line).formNames[1]
```

- [x] **Step 2: Smoke check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formName} from './src/constants/pipLines.js'; console.log(formName('dragon',2), formName('nope',5), formName('robot',9))"`
Expected: `Wyrmling Basilisk Bot-kid`

### Task 9: Shared space and file moves ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/pip/pipSpace.js`
- Modify: `foodbytes-app/client/src/components/pet/herb/herbForms.js`
- Modify: `foodbytes-app/client/package.json` (`check:wardrobe`)
- Moves listed in the File map

- [x] **Step 1: Move the shared files**

Run:
```
cd foodbytes-app\client\src\components\pet
mkdir pip
git mv herb/PipHerbFigure.jsx pip/PipFigure.jsx
git mv herb/PipHerb.jsx pip/Pip.jsx
git mv herb/PipHerb.css pip/Pip.css
git mv herb/HerbOutfit.jsx pip/PipOutfit.jsx
git mv herb/wardrobeLayers.js pip/wardrobeLayers.js
git mv herb/wardrobeArt.js herb/herbWardrobe.js
git mv herb/headBar.js pip/headBar.js
git mv herb/wardrobe.check.mjs pip/wardrobe.check.mjs
```
Expected: `git status` shows 8 renames.

- [x] **Step 2: Create `pip/pipSpace.js`**

```js
// Every Pip line is drawn in the same 200-unit space with its feet on (PIP_FOOT_X, PIP_FOOT_Y),
// each form scaled by its `scale` about that point (MPP-31, generalised for the themed lines).
export const PIP_FOOT_X = 100
export const PIP_FOOT_Y = 186
export const PIP_FULL_VIEWBOX = '0 -40 200 240'
```

- [x] **Step 3: Trim `herbForms.js`**

Delete `HERB_FOOT_X`, `HERB_FOOT_Y`, `HERB_FULL_VIEWBOX`, `herbForm` and `PIP_FORM_ANCHORS` (they move to `pipSpace.js` / `lineForms.js`). Keep `HERB_INK`, `ellipsePath`, `HERB_FORMS`. Update the header comment's "feet on y = HERB_FOOT_Y" to "feet on y = PIP_FOOT_Y (pip/pipSpace.js)".

- [x] **Step 4: `package.json` script path**

`"check:wardrobe": "node src/components/pet/pip/wardrobe.check.mjs"`

(Build is red until Task 13; no verification step here.)

### Task 10: Geometry registry (`pip/lineForms.js`, herb only) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/pip/lineForms.js`

- [x] **Step 1: Write the registry**

```js
import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines.js'
import { HERB_FORMS } from '../herb/herbForms.js'

/**
 * Geometry per Pip line (pure, so the node checks can import it). Each line's forms share the herb
 * keys: scale, fill, body, hat, eyes, neck, waist, side, feet, growTop, crownTop, growthRise,
 * miniViewBox. Adding a form = append to the line's *_FORMS (and its name + server threshold).
 */
export const LINE_FORMS = {
  [PIP_LINE.HERB]: HERB_FORMS
}

export const lineForms = (line) => LINE_FORMS[line] ?? LINE_FORMS[PIP_DEFAULT_LINE]

export const lineFormCount = (line) => lineForms(line).length

/** The form's geometry; unknown lines fall back to herb and unknown forms to form 1, so a bad payload never blanks Pip. */
export const pipForm = (line, form) => lineForms(line)[form - 1] ?? lineForms(line)[0]

/** The wardrobe anchors of every form of every line, in the unscaled 200-unit space. */
export const PIP_FORM_ANCHORS = Object.fromEntries(Object.entries(LINE_FORMS).map(([line, forms]) => [
  line,
  Object.fromEntries(forms.map((f, i) => [i + 1, {
    hat: f.hat,
    eyes: { y: f.eyes.y, gap: f.eyes.gap },
    neck: f.neck,
    waist: f.waist,
    feetTips: f.feet.map(([, tip]) => tip)
  }]))
]))
```

### Task 11: Per-line wardrobe dispatch, line-aware layers and head bar ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/pip/wardrobeShapes.js`
- Create: `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js`
- Modify: `foodbytes-app/client/src/components/pet/herb/herbWardrobe.js`
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js`
- Modify: `foodbytes-app/client/src/components/pet/pip/headBar.js`

- [x] **Step 1: Shared descriptor helpers (`pip/wardrobeShapes.js`)**

Move `curveOf`, `arcY`, `arc` and `band` out of `herbWardrobe.js` (unchanged, `CX` → `PIP_FOOT_X`) and add the helpers the dragon and robot wardrobes need:
```js
import { PIP_FOOT_X } from './pipSpace.js'

/**
 * Shape-descriptor helpers for every line's wardrobe. Descriptors are { tag, ...SVG attributes };
 * a 'g' descriptor carries `children` and, for an animated part, a `pip-fx pip-fx--<effect>` class
 * (Pip.css), so the geometry stays plain data that wardrobe.check.mjs can run in node.
 */
export const curveOf = (f) => f.side * 0.32
export const arcY = (x, y0, c) => {
  const t = x / 200
  return y0 - c + 4 * c * t * (1 - t)
}
export const arc = (y0, c) => `M0 ${y0 - c} Q${PIP_FOOT_X} ${y0 + c} 200 ${y0 - c}`
export const band = (y0, y1, c) => `M0 ${y0 - c} Q${PIP_FOOT_X} ${y0 + c} 200 ${y0 - c} L200 ${y1 - c} Q${PIP_FOOT_X} ${y1 + c} 0 ${y1 - c} Z`

/** An animated group: effect is one of the pip-fx--* names in Pip.css; style is a React style object (animationDelay, filter). */
export const fxGroup = (effect, children, style) => ({ tag: 'g', className: `pip-fx pip-fx--${effect}`, ...(style ? { style } : {}), children })

/** Square pixel cells (the robot's screen art), centred on (cx, cy), p units each. */
export const pxCells = (cells, cx, cy, p, fill) =>
  cells.map(([i, j]) => ({ tag: 'rect', x: cx + i * p - p / 2, y: cy + j * p - p / 2, width: p, height: p, fill }))

/** A heart of radius r with its point at (x, y + r). */
export const heartPath = (x, y, r) =>
  `M${x} ${y + r} C${x - 2 * r} ${y - 0.1 * r} ${x - 1.5 * r} ${y - 1.75 * r} ${x} ${y - 0.75 * r} C${x + 1.5 * r} ${y - 1.75 * r} ${x + 2 * r} ${y - 0.1 * r} ${x} ${y + r} Z`
```

- [x] **Step 2: `herb/herbWardrobe.js` exports the herb's wardrobe as data**

Imports become `import { HERB_INK } from './herbForms.js'`, `import { PIP_FOOT_X } from '../pip/pipSpace.js'`, `import { arc, arcY, band, curveOf } from '../pip/wardrobeShapes.js'`; `const CX = PIP_FOOT_X`. Every drawing function and colour stays byte-for-byte (the herb look must not change). Delete the four `export const hatArt/glassesArt/torsoArt/shoeArt` and `DRAWN_ITEM_IDS` at the bottom and export instead:
```js
/** The herb's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const HERB_WARDROBE = {
  HATS,            // id → (x, y, w) → { top, shapes, straight? }
  GLASSES,         // id → (L, R, y, s) → shapes
  TORSO,           // id → (f) → { clip, extra, back? }
  SHOES: Object.fromEntries(Object.entries(SHOES).map(([id, style]) => [id, (root, tip) => shoe(style, root, tip)])), // id → (root, tip) → shapes
  REPLACES_FACE: [] // glasses ids that replace the face while worn
}
```
Update the header comment: "MPP-32 AC 3 / themed lines: the herb's clothing … `f` is a pipForm(line, form) geometry".

- [x] **Step 3: `pip/wardrobeArt.js` dispatches per line**

```js
import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines.js'
import { HERB_WARDROBE } from '../herb/herbWardrobe.js'
import { PIP_FOOT_X } from './pipSpace.js'

/**
 * Themed lines: every creature wears its own version of the same 20 items (same ids, slots and
 * unlocks). Each line's wardrobe reads only its slot's anchors and returns shape descriptors.
 */
export const LINE_WARDROBE = {
  [PIP_LINE.HERB]: HERB_WARDROBE
}

const wardrobeOf = (line) => LINE_WARDROBE[line] ?? LINE_WARDROBE[PIP_DEFAULT_LINE]

/** { top, straight?, shapes } on the head anchor, or null for an id that isn't a hat. */
export const hatArt = (line, id, f) => wardrobeOf(line).HATS[id]?.(PIP_FOOT_X, f.hat.y, f.hat.w) ?? null

/** { shapes, replacesFace } on the two eye points, or null for an id that isn't glasses. */
export function glassesArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = wardrobe.GLASSES[id]
  if (!draw) return null
  return { shapes: draw(PIP_FOOT_X - f.eyes.gap, PIP_FOOT_X + f.eyes.gap, f.eyes.y, f.eyes.s), replacesFace: wardrobe.REPLACES_FACE.includes(id) }
}

/** { clip, extra, back }: clip = inside the body outline, extra = outside it, back = behind the body. */
export function torsoArt(line, id, f) {
  const part = wardrobeOf(line).TORSO[id]?.(f)
  return { clip: part?.clip ?? [], extra: part?.extra ?? [], back: part?.back ?? [] }
}

/** Shapes for both feet. */
export function shoeArt(line, id, f) {
  const draw = wardrobeOf(line).SHOES[id]
  return draw ? f.feet.flatMap(([root, tip]) => draw(root, tip)) : []
}

/** Every id a line can draw, for wardrobe.check.mjs. */
export function drawnItemIds(line) {
  const { HATS, GLASSES, TORSO, SHOES } = wardrobeOf(line)
  return [...Object.keys(HATS), ...Object.keys(GLASSES), ...Object.keys(TORSO), ...Object.keys(SHOES)]
}
```

- [x] **Step 4: `wardrobeLayers.js` signatures**

Imports become:
```js
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_X, PIP_FOOT_Y } from './pipSpace.js'
import { glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'
```
Change `dressLayers(outfit, form, { asleep = false } = {})` → `dressLayers(outfit, line, form, { asleep = false } = {})` with `const f = pipForm(line, form)`; `slotCropViewBox(slot, form)` → `slotCropViewBox(slot, line, form)`; `hatMiniViewBox(form)` → `hatMiniViewBox(line, form)`; each uses `pipForm(line, form)`. Replace `HERB_FOOT_X/Y` with `PIP_FOOT_X/Y`. Every art call gains `line` first, and the result gains the two new layers:
```js
  const torso = torsoIds.map(id => torsoArt(line, id, f))
  const hat = worn[HAT] ? hatArt(line, worn[HAT], f) : null
  const glasses = worn[GLASSES] && !asleep ? glassesArt(line, worn[GLASSES], f) : null
  return {
    back: torso.flatMap(t => t.back),               // drawn right after the line's Back (a cape)
    shoes: worn[SHOES] ? shoeArt(line, worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: glasses?.shapes ?? [],
    replacesFace: Boolean(glasses?.replacesFace),   // a screen face: PipFigure skips the line's Face
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${PIP_FOOT_X} ${f.hat.y})` },
    growTop: hat ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, glasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
```
Update the JSDoc: `@param {string} line - PIP_LINE id`, `@param {number} form - 1..lineFormCount(line)`, the `@returns` type gains `back: Object[]` and `replacesFace: boolean`, the layer-order comment becomes "shoes → [back + back-wear] … → [face, unless replacesFace] → glasses (none asleep) → hat → [crown]", and "PipHerbFigure draws" → "PipFigure draws".

- [x] **Step 5: `headBar.js` signatures**

```js
import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_Y } from './pipSpace.js'
import { hatArt } from './wardrobeArt.js'
import { dressLayers } from './wardrobeLayers.js'

export function headBarTop(line, form, outfit) {
  const f = pipForm(line, form)
  const tops = [f.crownTop]
  if (f.growthRise > 0) tops.push(dressLayers(outfit, line, form).growTop - f.growthRise)
  const hatId = outfit?.[WARDROBE_SLOT.HAT]
  const hat = hatId ? hatArt(line, hatId, f) : null
  if (hat) tops.push(hat.top)
  return Math.min(...tops)
}

export function headBarY(line, form, outfit) {
  const k = pipForm(line, form).scale
  return PIP_FOOT_Y + (headBarTop(line, form, outfit) - PIP_FOOT_Y) * k - HEAD_BAR_GAP
}
```
`spokenLevelLabel` unchanged. Keep the existing doc comments, replacing "herb" with "Pip".

### Task 12: Herb art adapter and art registry ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/herbArt.jsx`
- Create: `foodbytes-app/client/src/components/pet/pip/lineArt.jsx`
- Modify: `foodbytes-app/client/src/components/pet/herb/herbFaces.jsx:3,11`
- Modify: `foodbytes-app/client/src/components/pet/herb/herbParts.jsx` (`HerbProps`)

- [x] **Step 1: `herbFaces.jsx` reads geometry via the registry**

Replace `import { HERB_INK, herbForm } from './herbForms'` with `import { PIP_LINE } from '../../../constants/pipLines'`, `import { pipForm } from '../pip/lineForms'`, `import { HERB_INK } from './herbForms'`; line 11 becomes `const { eyes } = pipForm(PIP_LINE.HERB, form)`.

- [x] **Step 2: `HerbProps` takes an ink**

Change the signature to `export function HerbProps({ mood, ink = HERB_INK })` and replace `HERB_INK` with `ink` inside `HerbProps` only.

- [x] **Step 3: Create `herb/herbArt.jsx`**

```jsx
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HerbFace } from './herbFaces'
import { HERB_INK } from './herbForms'
import { HerbBack, HerbGrowth } from './herbParts'

/** The herb line's parts for PipFigure: stalk feet, the seed's zigzag, leaves behind and growth on top (MPP-31). */
function HerbLimbs({ f }) {
  return f.feet.map(([root, tip]) => (
    <path key={tip[0]} d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}
      stroke={HERB_INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
  ))
}

function HerbDetails({ form }) {
  if (form !== PIP_FORMS.BASIL_SEED) return null
  return <path d="M90 118 l5 7 l5 -6 l5 7 l5 -6" stroke={HERB_INK} strokeWidth="3" fill="none" strokeLinejoin="round" opacity=".7" />
}

export const HERB_ART = {
  ink: HERB_INK,
  Back: HerbBack,
  Limbs: HerbLimbs,
  Details: HerbDetails,
  Face: HerbFace,
  Crown: HerbGrowth
}
```

- [x] **Step 4: Create `pip/lineArt.jsx`**

```jsx
import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines'
import { HERB_ART } from '../herb/herbArt'

/**
 * Art per Pip line for PipFigure: { ink, Back({form, droop}), Limbs({f, droop}), Details({form, f}),
 * Face({form, mood}), Crown({form, droop, base}) }. Crown is what rises above the head and pokes
 * through a hat (basil growth, horns, antenna); `base` is where it starts after any hat.
 */
export const LINE_ART = {
  [PIP_LINE.HERB]: HERB_ART
}

export const lineArt = (line) => LINE_ART[line] ?? LINE_ART[PIP_DEFAULT_LINE]
```

### Task 13: `PipFigure`, `Pip`, `PipOutfit` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx`
- Modify: `foodbytes-app/client/src/components/pet/pip/Pip.jsx`
- Modify: `foodbytes-app/client/src/components/pet/pip/PipOutfit.jsx`
- Modify: `foodbytes-app/client/src/components/pet/pip/Pip.css` (comment + `.is-shrinking` rule)

- [x] **Step 1: `PipOutfit.jsx` renders groups**

```jsx
import { createElement } from 'react'

/** Draws wardrobe shape descriptors ({ tag, ...SVG attributes }); a 'g' descriptor nests its `children` (animated parts). */
export function PipOutfit({ shapes }) {
  return shapes.map(({ tag, children, ...attrs }, i) =>
    createElement(tag, { key: i, ...attrs }, children ? <PipOutfit shapes={children} /> : undefined))
}

export default PipOutfit
```

- [x] **Step 2: Rewrite `PipFigure.jsx`**

```jsx
import { useId } from 'react'
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { HerbProps } from '../herb/herbParts'
import { lineArt } from './lineArt'
import { pipForm } from './lineForms'
import { PIP_FOOT_Y } from './pipSpace'
import PipOutfit from './PipOutfit'
import { dressLayers } from './wardrobeLayers'

/**
 * One form of one Pip line at a mood, as an SVG <g> in the 200-unit space with its feet at
 * (100, PIP_FOOT_Y) — Pip wraps it in an <svg>, RoomPip places it in the room. The line's art
 * (lineArt) supplies the parts; this component owns the layer order the wardrobe check pins:
 * shadow → back → back-wear (a cape) → limbs → shoes → body + shine → details → torso clip →
 * outline → extras → face (skipped while a screen-face item is worn) → glasses → hat → crown. `wilted` droops and desaturates; `phase` drives the evolve pulse;
 * `still` stops the idle animation (Dress Pip cards and lineup).
 */
function PipFigure({ line, form, mood, wilted = false, phase = null, showProps = false, outfit = null, still = false }) {
  const id = `pip-figure-${useId().replace(/:/g, '')}`
  const clipId = `${id}-body`
  const f = pipForm(line, form)
  const art = lineArt(line)
  const droop = wilted || mood === PET_MOODS.BORED || mood === PET_SLEEP_FACE
  const dress = dressLayers(outfit, line, form, { asleep: mood === PET_SLEEP_FACE })
  const k = f.scale
  const shineX = 100 - f.side * 0.55
  const shineY = f.hat.y + 10
  const className = [
    'pip-herb-figure',
    `pip-mood-${mood}`,
    wilted && 'is-wilted',
    still && 'is-still',
    phase === PIP_GROWTH_PHASES.EVOLVING && 'is-evolving'
  ].filter(Boolean).join(' ')

  return (
    <g className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.fill[0]} />
          <stop offset="1" stopColor={f.fill[1]} />
        </linearGradient>
        <clipPath id={clipId}><path d={f.body} /></clipPath>
      </defs>
      <ellipse cx="100" cy="189" rx={56 * k} ry="6" fill="rgba(40,60,20,.13)" />
      <g className="pip-anim">
        <g transform={`translate(100 ${PIP_FOOT_Y}) scale(${k}) translate(-100 -${PIP_FOOT_Y})`}>
          <art.Back form={form} droop={droop} />
          <PipOutfit shapes={dress.back} />
          <art.Limbs f={f} droop={droop} />
          <PipOutfit shapes={dress.shoes} />
          <path d={f.body} fill={`url(#${id})`} />
          <ellipse cx={shineX} cy={shineY} rx="11" ry="6" transform={`rotate(-32 ${shineX} ${shineY})`} fill="#fff" opacity=".45" />
          <art.Details form={form} f={f} />
          {dress.clip.length > 0 && <g clipPath={`url(#${clipId})`}><PipOutfit shapes={dress.clip} /></g>}
          <path d={f.body} fill="none" stroke={art.ink} strokeWidth="5" strokeLinejoin="round" />
          <PipOutfit shapes={dress.extra} />
          {!dress.replacesFace && <art.Face form={form} mood={mood} />}
          <PipOutfit shapes={dress.glasses} />
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><PipOutfit shapes={dress.hat.shapes} /></g>}
          <art.Crown form={form} droop={droop} base={dress.growTop} />
        </g>
      </g>
      {showProps && <HerbProps mood={mood} ink={art.ink} />}
    </g>
  )
}

export default PipFigure
```
(Herb draw order is identical to today's `PipHerbFigure`: back, feet, shoes, body, shine, seed zigzag, clip, outline, extra, face, glasses, hat, growth. The herb wardrobe has no back-wear and no screen faces, so the two new layers are empty for it.)

- [x] **Step 3: Rewrite `Pip.jsx`**

```jsx
import { PET_MOOD_LABELS } from '../../../constants/pet'
import { PIP_DEFAULT_FORM } from '../../../constants/pipGrowth'
import { PIP_DEFAULT_LINE, formName } from '../../../constants/pipLines'
import { pipForm } from './lineForms'
import { PIP_FULL_VIEWBOX } from './pipSpace'
import PipFigure from './PipFigure'
import './Pip.css'

/**
 * Pip as a standalone <svg> in the active line. `full` keeps room for mood props; `mini` (footer
 * tab) and `crop` (Dress Pip cards / lineup) are decorative. `viewBox` overrides the crop; `still`
 * stops the idle animation.
 */
function Pip({ line = PIP_DEFAULT_LINE, form = PIP_DEFAULT_FORM, mood, wilted = false, variant = 'full', outfit = null, viewBox = null, still = false, className = '' }) {
  const isFull = variant === 'full'
  const a11y = isFull
    ? { role: 'img', 'aria-label': `${formName(line, form)}, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`pip-herb pip-herb--${variant} ${className}`.trim()}
      viewBox={viewBox ?? (isFull ? PIP_FULL_VIEWBOX : pipForm(line, form).miniViewBox)}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <PipFigure line={line} form={form} mood={mood} wilted={wilted} showProps={isFull} outfit={outfit} still={still} />
    </svg>
  )
}

export default Pip
```
Note: `formName` is used here before Phase 5 removes `PIP_FORM_NAMES`; that is intended.

- [x] **Step 4: `Pip.css`**

Change the header comment to "Pip's figure (every line) — idle moods, wilt filter, evolve pulse." Delete the `.pip-herb-figure.is-shrinking .pip-anim` rule and the `@keyframes pip-shrink` block. Update the AC 8 comment to "evolving — a white silhouette pulse."

### Task 14: Consumers pass the line ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:104`
- Modify: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PipHeadBar.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` (where `<PipHeadBar` is rendered)
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx`
- Modify: `foodbytes-app/client/src/components/layout/AppNavItems.jsx`

- [x] **Step 1: `PetView` adds `line` to the herb object**

Add `import { useTheme } from '../../contexts/ThemeContext'` (match the import path used in `AppNavItems.jsx`) and, beside the other hooks at the top of the component, `const { theme } = useTheme()` and `const line = theme.pipLine`. Line 104 becomes:
`const herb = { line, form: growth.displayForm, wilted: isWilted(pet.growth), phase: growth.phase, outfit: pet.wardrobe?.outfit ?? null }`

- [x] **Step 2: `RoomPip`**

Imports: `import { PIP_FOOT_X, PIP_FOOT_Y } from '../pip/pipSpace'`, `import PipFigure from '../pip/PipFigure'`, `import '../pip/Pip.css'`. Render `<PipFigure line={herb.line} form={herb.form} … />` with the other props unchanged.

- [x] **Step 3: `PipHeadBar` + `PetRoom`**

`PipHeadBar`: imports `PIP_FOOT_X` from `../pip/pipSpace` and `headBarY` from `../pip/headBar`; add a `line` prop and call `headBarY(line, form, outfit)`; replace `HERB_FOOT_X` with `PIP_FOOT_X`; change `INSTANT_PHASES` to `[PIP_GROWTH_PHASES.EVOLVING]`. `PetRoom`: pass `line={herb.line}` on `<PipHeadBar …>`.

- [x] **Step 4: Wardrobe sheet**

`WardrobeView`: import `Pip` from `../pip/Pip`; `<Pip line={herb.line} form={herb.form} …>`; pass `line={herb.line}` to `<WardrobeItemGrid>` and `<WardrobeLineup>`; update the JSDoc herb type to `{ line: string, form: number, wilted: boolean }`. `WardrobeItemGrid`: add `line` prop; `slotCropViewBox(slot, line, form)`; `<Pip line={line} …>`; imports from `../pip/`. `WardrobeLineup`: add `line` prop; import `Pip` from `../pip/Pip` and `lineForms` from `../pip/lineForms`; iterate `lineForms(line).map((_, i) => i + 1)` instead of `Object.values(PIP_FORMS)`; `<Pip line={line} …>`.

- [x] **Step 5: Footer tab**

`AppNavItems`: import `Pip` from `../pet/pip/Pip` and `hatMiniViewBox, hatOnly` from `../pet/pip/wardrobeLayers`; `const line = theme.pipLine`; render `<Pip line={line} … viewBox={tabOutfit.HAT ? hatMiniViewBox(line, tabForm) : null} />`.

- [x] **Step 6: No stale imports remain**

Run: `cd foodbytes-app\client; Get-ChildItem src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "herb/PipHerb|herb/headBar|herb/wardrobe|herb/HerbOutfit|HERB_FOOT_|HERB_FULL_VIEWBOX|herbForm\(|PipHerbFigure"`
Expected: zero hits.

### Task 15: Wardrobe check across lines + fit invariants ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`

- [x] **Step 1: Iterate lines × forms**

Imports become:
```js
import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { PIP_LINE_COPY } from '../../../constants/pipLines.js'
import { LINE_FORMS, lineFormCount, pipForm } from './lineForms.js'
import { PIP_FOOT_Y } from './pipSpace.js'
import { headBarTop, headBarY, spokenLevelLabel } from './headBar.js'
```
The `wardrobeArt` import becomes `import { LINE_WARDROBE, drawnItemIds, glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'` (keep the `wardrobeLayers`, `pipWardrobe` and `utils/pipWardrobe` imports). Every art call gains the line first (`hatArt(line, id, g)`, `glassesArt(line, id, g).shapes`, `torsoArt(line, id, g)`, `shoeArt(line, id, g)`); the "AC 1" check `DRAWN_ITEM_IDS` becomes `drawnItemIds(line)` for every line; `assertFinite` accepts `tag: 'g'` and recurses into its `children`; the "no per-form branches" file list becomes `['./wardrobeArt.js', './wardrobeLayers.js', './wardrobeShapes.js', '../herb/herbWardrobe.js']`. Replace `const FORMS = …` with:
```js
const LINES = Object.keys(LINE_FORMS)
const EACH = LINES.flatMap(line => LINE_FORMS[line].map((_, i) => ({ line, form: i + 1, where: `${line} form ${i + 1}` })))
```
Rewrite each `for (const form of FORMS)` loop as `for (const { line, form, where } of EACH)`, with `herbForm(form)` → `pipForm(line, form)`, `dressLayers(x, form, o)` → `dressLayers(x, line, form, o)`, `slotCropViewBox(key, form)` → `slotCropViewBox(key, line, form)`, `hatMiniViewBox(form)` → `hatMiniViewBox(line, form)`, and messages prefixed with `where`. Update the header comment: "every item renders on every form of every line (11 forms)". The "same outfit on every form" block runs per line.

- [x] **Step 2: Add per-form fit invariants**

```js
// ---- Themed lines: every form of every line carries the anchors in the order clothes need ----
const KEYS = ['name', 'scale', 'fill', 'body', 'hat', 'eyes', 'neck', 'waist', 'side', 'feet', 'growTop', 'crownTop', 'growthRise', 'miniViewBox']
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  KEYS.forEach(key => assert.ok(f[key] !== undefined, `${where}: missing ${key}`))
  const tipYs = f.feet.map(([, tip]) => tip[1])
  assert.equal(f.feet.length, 2, `${where}: two feet`)
  tipYs.forEach(y => assert.ok(y >= PIP_FOOT_Y - 2 && y <= PIP_FOOT_Y, `${where}: feet stand on the floor line`))
  assert.ok(f.crownTop <= f.hat.y, `${where}: crown above the brim`)
  assert.ok(f.growTop <= f.hat.y, `${where}: crown grows from above the brim`)
  assert.ok(f.hat.y < f.eyes.y && f.eyes.y < f.neck && f.neck < f.waist && f.waist < Math.min(...tipYs), `${where}: hat < eyes < neck < waist < feet`)
  assert.ok(f.eyes.gap * 2 < f.hat.w, `${where}: eyes sit under the brim`)
  assert.ok(f.eyes.gap + 8 * f.eyes.s < f.side, `${where}: eyes inside the head`)
  assert.ok(f.scale > 0 && f.side > 0 && f.hat.w > 0, `${where}: positive sizes`)
}
// An outfit put on at form 1 fits after every evolution: the same items, on forms that grow.
for (const line of LINES) {
  const scales = LINE_FORMS[line].map(f => f.scale)
  scales.slice(1).forEach((s, i) => assert.ok(s >= scales[i], `${line}: forms never get smaller`))
  assert.equal(Object.keys(PIP_LINE_COPY[line].formNames).length, lineFormCount(line), `${line}: one name per form`)
}
```

- [x] **Step 3: Per-line wardrobe rules**

```js
// ---- Themed lines: each creature draws all 20 items its own way; the two new layers stay in their slot ----
assert.deepEqual(Object.keys(LINE_WARDROBE).sort(), [...LINES].sort(), 'one wardrobe per line')
const shapesOf = (list) => list.flatMap(s => (s.tag === 'g' ? shapesOf(s.children) : [s]))
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    if (slot !== 'GLASSES') assert.equal(dressLayers({ [slot]: id }, line, form).replacesFace, false, `${where} ${id}: only glasses may replace the face`)
    if (!['SCARF', 'JACKET', 'BELT', 'PANTS'].includes(slot)) assert.deepEqual(dressLayers({ [slot]: id }, line, form).back, [], `${where} ${id}: only torso items draw behind the body`)
  }
  for (const id of idsIn('GLASSES')) {
    assert.equal(dressLayers({ GLASSES: id }, line, form, { asleep: true }).replacesFace, false, `${where} ${id}: the face comes back asleep`)
    assertFinite(shapesOf(glassesArt(line, id, f).shapes), `${where} ${id}`)
  }
}
```

- [x] **Step 4: Head bar on every non-final form of every line**

Replace `for (const form of [1, 2, 3, 4])` with `for (const { line, form, where } of EACH.filter(({ line, form }) => form < lineFormCount(line)))`, use `pipForm(line, form)`, `headBarY(line, form, outfit)`, `headBarTop(line, form, outfit)`, `dressLayers(outfit, line, form)`, and `PIP_FOOT_Y` in `toScaled`.

- [x] **Step 5: Run the check and the build**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed`, then `built in <n>s` with no errors. Manual: `npm run dev`, open `/pet` on Default at 375 px and 1280 px — Pip, outfit, head bar, Dress Pip cards and lineup, and the footer tab look exactly as before this phase.

---

## Phase 4 — Dragon and robot art

Ports the approved mockup's dragon and robot (forms, parts, faces and their own wardrobes) into code, adds the wardrobe animations, and registers both lines. The app still shows herb everywhere (no theme names another line until Phase 5), so the build stays green and nothing user-visible changes; `check:wardrobe` now covers 11 forms × every line's 20 items. Requires Task 3 ticked.

### Task 16: `dragon/dragonForms.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/dragon/dragonForms.js`

- [x] **Step 1: Port the geometry**

Header comment: `// Themed Pip lines: the dragon (Parchment), ported verbatim from the approved foodbytes-app/mockup/pip-themed-lines.html (DRAGON_FORMS, <approval date>). Same 200-unit space as every line (pip/pipSpace.js).` Export `DRAGON_INK` (the mockup's dragon outline colour) and `DRAGON_FORMS` — the mockup's three entries (Hatchling, Wyrmling, Drake) copied verbatim, keys exactly as listed in `plan.md` → Data shapes → geometry.

### Task 17: Dragon parts, faces and art adapter ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/dragon/dragonParts.jsx`
- Create: `foodbytes-app/client/src/components/pet/dragon/dragonFaces.jsx`
- Create: `foodbytes-app/client/src/components/pet/dragon/dragonArt.jsx`

- [x] **Step 1: `dragonParts.jsx`**

Port from the mockup: `export function DragonBack({ form, droop })` (eggshell shards on form 1; wing buds + short tail on 2; full wings + long tail on 3; `droop` lowers wings and tail), `export function DragonLimbs({ f, droop })` (legs from `f.feet` roots to tips, small arms at `f.side`), `export function DragonDetails({ form, f })` (cream belly scales inside the body), `export function DragonCrown({ form, droop, base })` (shell cap on 1, small horns on 2, curved horns on 3, drawn from `base` upward, total rise = the form's `growthRise`). Colours are module constants in this file (Pip palette exception). Use `pipForm(PIP_LINE.DRAGON, form)` for geometry.

- [x] **Step 2: `dragonFaces.jsx`**

`export function DragonFace({ form, mood })` covering every `PET_MOODS` value plus `PET_SLEEP_FACE`, reading only `pipForm(PIP_LINE.DRAGON, form).eyes` (two eyes at `100 ± gap`, scaled by `s`), ported from the mockup.

- [x] **Step 3: `dragonArt.jsx`**

```jsx
import { DragonFace } from './dragonFaces'
import { DRAGON_INK } from './dragonForms'
import { DragonBack, DragonCrown, DragonDetails, DragonLimbs } from './dragonParts'

export const DRAGON_ART = {
  ink: DRAGON_INK,
  Back: DragonBack,
  Limbs: DragonLimbs,
  Details: DragonDetails,
  Face: DragonFace,
  Crown: DragonCrown
}
```

- [x] **Step 4: Size budget**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\dragon\*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_ | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines (split parts into `dragonWings.jsx` if one exceeds it).

### Task 18: Dragon wardrobe (`dragon/dragonWardrobe.js`) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/dragon/dragonWardrobe.js`

- [x] **Step 1: Port the dragon's 20 items as shape descriptors**

Port `DRAGON_WARDROBE` from the approved mockup (section "Per-creature wardrobe"), converting each SVG string into descriptors (`{ tag, ...React SVG attributes }`, camelCase attribute names) and each `fx('<effect>', …, style)` into `fxGroup('<effect>', children, styleObject)` from `../pip/wardrobeShapes.js` (also import `arc`, `arcY`, `band`, `curveOf`, `heartPath`). Colours and `DRAGON_INK` are module constants here. Each item reads only its slot's anchors, exactly as in the mockup. Keys are the **live item ids** (mockup key → id): hats `beanie` → `beanie` (Horn cosy), `cap` → `cap` (Bard's cap, feather `sway`), `chef` → `chef-hat` (Singed toque, `straight: true`, `smoke`), `sunhat` → `straw-hat` (Bird's nest, egg `wobble`), `tophat` → `top-hat` (Crown, gem `sparkle`); glasses `round` → `round-specs` (Battle scar), `heart` → `heart-glasses` (Smitten, hearts `pulse` + `rise`), `shades` → `sunglasses` (War paint); torso `red` → `red-scarf` (Knight's cape: `back` = the cape in a `cape` group, `clip` = collar, `extra` = clasp), `stripe` → `striped-scarf` (Ivy garland), `chef` → `chef-whites` (Baker's apron), `denim` → `denim-jacket` (Leather jerkin), `puffer` → `puffer` (Scale mail), `leather` → `leather-belt` (Potion belt, bubbles `rise`), `champ` → `champion-belt` (Hoard belt, `sparkle`), `jeans`, `joggers`, `dungarees` (Patched breeches, Wool hose, Smith's overalls); shoes `sneakers` (Talon wraps), `wellies` (Iron sabatons). Export:
```js
export const DRAGON_WARDROBE = { HATS, GLASSES, TORSO, SHOES, REPLACES_FACE: [] }
```
with the same function shapes as `HERB_WARDROBE` (Task 11 Step 2). Hat functions return `top` = the highest point including any animated part at rest (feather tip, smoke puff).

- [x] **Step 2: Size check**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\dragon\dragonWardrobe.js | Measure-Object -Line).Lines`
Expected: under 400 (split into `dragonHeadwear.js` + `dragonClothes.js` re-exported from `dragonWardrobe.js` if not).

### Task 19: `robot/robotForms.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/robot/robotForms.js`

- [x] **Step 1: Port the geometry**

Same header pattern as Task 16 naming the robot (Cyberpunk) and `ROBOT_FORMS`. Export `ROBOT_INK` and `ROBOT_FORMS` — the mockup's three entries (Bot-kid, Teen Unit, Android) verbatim.

### Task 20: Robot parts, faces and art adapter ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/robot/robotParts.jsx`
- Create: `foodbytes-app/client/src/components/pet/robot/robotFaces.jsx`
- Create: `foodbytes-app/client/src/components/pet/robot/robotArt.jsx`

- [x] **Step 1: `robotParts.jsx`**

Port from the mockup (`robotBack`, `robotLimbs`, `robotDetails`, `robotCrown`, `ROBOT_HEAD`, `ROBOT_SCREEN`, `RB`): `RobotBack({ form, droop })` (side dials on the monitor head; a trailing cable on forms 2–3, slack when drooped), `RobotLimbs({ f, droop })` (jointed legs root→tip with plated feet, arms at `f.side`; shoulder plating on Android), `RobotDetails({ form, f })` (the monitor screen with scanlines and an edge glow, a bezel status light, scuffs and rust, a riveted chest patch; chest chevron on Android), `RobotCrown({ form, droop, base })` (antenna from `base`, rise = `growthRise`; `droop` bends it and dims the tip light). Colours as module constants.

- [x] **Step 2: `robotFaces.jsx`**

`export function RobotFace({ form, mood })` for every `PET_MOODS` value plus `PET_SLEEP_FACE`: the face drawn as glowing cyan pixel cells on the screen, ported from the mockup's `robotFace`: two pixel eyes at the `eyes` anchor (blocks for content, chevrons for happy with pink pixel blush, half-lids for bored, a line-wink for mischievous, dim lines asleep) and a pixel mouth (smile, grin, flat, smirk). The glow is a CSS `drop-shadow` filter, removed under `body.lowfx` and reduced motion is unaffected (it is static). Reads only `pipForm(PIP_LINE.ROBOT, form).eyes`.

- [x] **Step 3: `robotArt.jsx`**

```jsx
import { RobotFace } from './robotFaces'
import { ROBOT_INK } from './robotForms'
import { RobotBack, RobotCrown, RobotDetails, RobotLimbs } from './robotParts'

export const ROBOT_ART = {
  ink: ROBOT_INK,
  Back: RobotBack,
  Limbs: RobotLimbs,
  Details: RobotDetails,
  Face: RobotFace,
  Crown: RobotCrown
}
```

- [x] **Step 4: Size budget**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\robot\*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_ | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines.

### Task 21: Robot wardrobe (`robot/robotWardrobe.js`) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js`

- [x] **Step 1: Port the robot's 20 items as shape descriptors**

Same conversion as Task 18, from the mockup's `ROBOT_WARDROBE` (import `fxGroup`, `pxCells`, `arc`, `arcY`, `band`, `curveOf` from `../pip/wardrobeShapes.js`; `ROBOT_INK` and the `RB` colours as module constants). Live ids: hats `beanie` (Cooling fan, `straight`, blades `spin` — keep the invisible bounding circle inside the spinning group so it turns about the hub), `cap` (Holo visor, `straight`, `scan`), `chef-hat` (Steam toque, `straight`, `smoke`), `straw-hat` (Satellite dish, `straight`, `sway`), `top-hat` (Neon top hat, `flicker` with a `drop-shadow` filter style); glasses `round-specs` (Smiley.exe, eyes `blink`), `heart-glasses` (Heart eyes, `pulse`), `sunglasses` (Shades.gif, `drop`); torso `red-scarf` (Cable coil), `striped-scarf` (Hazard tape, end `flap`), `chef-whites` (Oven door, window `glow`), `denim-jacket` (Hull plates), `puffer` (Battery vest, bars `charge` with staggered `animationDelay`), `leather-belt` (Tool belt), `champion-belt` (Marquee belt, LEDs `chase` with staggered delays), `jeans` (Coolant casing), `joggers` (Servo sleeves), `dungarees` (Maintenance overalls); shoes `sneakers` (Hover pads, glow `hover`), `wellies` (Mag boots). Export:
```js
export const ROBOT_WARDROBE = { HATS, GLASSES, TORSO, SHOES, REPLACES_FACE: ['round-specs', 'heart-glasses'] }
```

- [x] **Step 2: Size check**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\robot\robotWardrobe.js | Measure-Object -Line).Lines`
Expected: under 400 (split as in Task 18 if not).

### Task 22: Wardrobe animations in `Pip.css` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/Pip.css`

- [x] **Step 1: Add the `pip-fx` effects (ported from the mockup's CSS, names prefixed)**

Append:
```css
/* Themed lines: animated wardrobe parts (fxGroup in pip/wardrobeShapes.js). Every one stops under
   reduced motion, under Low FX (body.lowfx) and on still figures (Dress Pip cards, lineup). */
.pip-fx { transform-box: fill-box; transform-origin: center; }
.pip-fx--spin { animation: pip-fx-spin 1.1s linear infinite; }
.pip-fx--scan { animation: pip-fx-scan 2.2s ease-in-out infinite alternate; }
.pip-fx--smoke { animation: pip-fx-smoke 2.1s ease-out infinite; }
.pip-fx--sway { transform-origin: 50% 100%; animation: pip-fx-sway 3s ease-in-out infinite; }
.pip-fx--flicker { animation: pip-fx-flicker 3.4s linear infinite; }
.pip-fx--blink { animation: pip-fx-blink 3.6s infinite; }
.pip-fx--pulse { animation: pip-fx-pulse 1s ease-in-out infinite; }
.pip-fx--drop { animation: pip-fx-drop .9s cubic-bezier(.3, 1.6, .6, 1) 1 both; }
.pip-fx--flap { transform-origin: 0% 50%; animation: pip-fx-flap .8s ease-in-out infinite alternate; }
.pip-fx--glow { animation: pip-fx-glow 1.8s ease-in-out infinite; }
.pip-fx--charge { animation: pip-fx-charge 2.1s linear infinite; }
.pip-fx--chase { animation: pip-fx-chase .8s linear infinite; }
.pip-fx--hover { animation: pip-fx-hover 1.1s ease-in-out infinite; }
.pip-fx--wobble { transform-origin: 50% 100%; animation: pip-fx-wobble 2.6s ease-in-out infinite; }
.pip-fx--sparkle { animation: pip-fx-sparkle 1.6s ease-in-out infinite; }
.pip-fx--rise { animation: pip-fx-rise 2.2s ease-out infinite; }
.pip-fx--cape { transform-origin: 50% 0; animation: pip-fx-cape 3.4s ease-in-out infinite; }

@keyframes pip-fx-spin { to { transform: rotate(360deg); } }
@keyframes pip-fx-scan { from { transform: translateX(0); } to { transform: translateX(600%); } }
@keyframes pip-fx-smoke { 0% { opacity: 0; transform: translateY(4px) scale(.6); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(-10px) scale(1.3); } }
@keyframes pip-fx-sway { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes pip-fx-flicker { 0%, 40%, 46%, 52%, 100% { opacity: 1; } 43% { opacity: .3; } 49% { opacity: .55; } }
@keyframes pip-fx-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes pip-fx-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
@keyframes pip-fx-drop { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes pip-fx-flap { from { transform: rotate(-10deg); } to { transform: rotate(12deg); } }
@keyframes pip-fx-glow { 0%, 100% { opacity: .8; } 50% { opacity: 1; filter: brightness(1.25); } }
@keyframes pip-fx-charge { 0% { opacity: .15; } 35%, 90% { opacity: 1; } 100% { opacity: .15; } }
@keyframes pip-fx-chase { 0%, 24% { opacity: 1; } 25%, 100% { opacity: .25; } }
@keyframes pip-fx-hover { 0%, 100% { transform: scaleX(1); opacity: .8; } 50% { transform: scaleX(.7); opacity: .4; } }
@keyframes pip-fx-wobble { 0%, 70%, 100% { transform: rotate(0); } 78% { transform: rotate(-9deg); } 86% { transform: rotate(8deg); } 94% { transform: rotate(-4deg); } }
@keyframes pip-fx-sparkle { 0%, 100% { transform: scale(.3); opacity: .2; } 50% { transform: scale(1); opacity: 1; } }
@keyframes pip-fx-rise { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-12px); opacity: 0; } }
@keyframes pip-fx-cape { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(1.6deg); } }

body.lowfx .pip-fx,
.pip-herb-figure.is-still .pip-fx { animation: none !important; }
body.lowfx .pip-herb-figure [style*="drop-shadow"] { filter: none !important; }
@media (prefers-reduced-motion: reduce) {
  .pip-fx { animation: none !important; }
}
```
(`lowfx` is `LOW_FX_BODY_CLASS` from `constants/themes.js`; Pip's room CSS is the colour exception, and these rules carry no colours.)

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no CSS warnings.

### Task 23: Register dragon and robot ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/lineForms.js`
- Modify: `foodbytes-app/client/src/components/pet/pip/lineArt.jsx`
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js`
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`

- [x] **Step 1: Add both lines to all three registries**

`lineForms.js`: import `DRAGON_FORMS` from `../dragon/dragonForms.js` and `ROBOT_FORMS` from `../robot/robotForms.js`; `LINE_FORMS = { [PIP_LINE.HERB]: HERB_FORMS, [PIP_LINE.DRAGON]: DRAGON_FORMS, [PIP_LINE.ROBOT]: ROBOT_FORMS }`.
`lineArt.jsx`: import `DRAGON_ART`, `ROBOT_ART`; `LINE_ART = { [PIP_LINE.HERB]: HERB_ART, [PIP_LINE.DRAGON]: DRAGON_ART, [PIP_LINE.ROBOT]: ROBOT_ART }`.
`wardrobeArt.js`: import `DRAGON_WARDROBE` from `../dragon/dragonWardrobe.js` and `ROBOT_WARDROBE` from `../robot/robotWardrobe.js`; `LINE_WARDROBE = { [PIP_LINE.HERB]: HERB_WARDROBE, [PIP_LINE.DRAGON]: DRAGON_WARDROBE, [PIP_LINE.ROBOT]: ROBOT_WARDROBE }`.

- [x] **Step 2: Extend the "no per-form branches" scan**

In `wardrobe.check.mjs` add `'../dragon/dragonWardrobe.js'` and `'../robot/robotWardrobe.js'` (and any split files from Tasks 18 / 21) to the scanned file list.

- [x] **Step 3: Check and build**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed` (now 11 forms × each line's 20 items, the two new layers checked, fit invariants on all 11), then `built in <n>s`. If an invariant fails, fix the geometry in the mockup first, re-approve with the developer, then re-port.

---

## Phase 5 — Line-aware growth and theme wiring

Moves growth labels, change detection and bubbles onto the active line, removes the de-evolve sequence, and gives every theme its `pipLine`. Ends with every client check and the build green and the three creatures visible in their themes.

### Task 24: Growth constants and utils ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipGrowth.js`
- Modify: `foodbytes-app/client/src/utils/pipGrowth.js`
- Modify: `foodbytes-app/client/src/utils/pipGrowthSeenStore.js`

- [x] **Step 1: Trim `constants/pipGrowth.js`**

Delete `PIP_FORM_NAMES`, `PIP_FULLY_GROWN_LABEL`, `PIP_SLIP_LINE`, `PIP_FULLY_GROWN_LINE`. `PIP_GROWTH_PHASES` becomes `{ IDLE: 'idle', FILLING: 'filling', EVOLVING: 'evolving', REVEALED: 'revealed' }`; `PIP_GROWTH_PHASE_MS` becomes `{ filling: 900, evolving: 1600 }`. Header comment: "Pip's growth sequence. Points, thresholds and forms for every line are computed on the server (PetGrowthPolicy); names and voice per line live in pipLines.js. `PIP_FORMS` names the herb forms for the herb art only." Keep everything else.

- [x] **Step 2: Rewrite `utils/pipGrowth.js`**

```js
import {
  PIP_BAR_MOVE_MS, PIP_GROWTH_BUBBLE_MS, PIP_GROWTH_PHASES, PIP_GROWTH_PHASE_MS, PIP_SLIP_SCORE
} from '../constants/pipGrowth.js'
import { PIP_DEFAULT_LINE, formName, lineCopy } from '../constants/pipLines.js'

const { FILLING, EVOLVING, REVEALED } = PIP_GROWTH_PHASES

export const GROWTH_CHANGES = { EVOLVE: 'evolve', SLIP: 'slip', MOVE: 'move' }

/**
 * The growth payload (PetGrowthDTO) seen through one line: the shared points and last day plus that
 * line's form and bar. Null when the payload has no lines (legacy or missing), so callers fall back.
 */
export function lineGrowth(dto, line) {
  const own = dto?.lines?.[line] ?? dto?.lines?.[PIP_DEFAULT_LINE]
  if (!own) return null
  return { points: dto.points, lastDayScore: dto.lastDayScore, lastScoredDate: dto.lastScoredDate, ...own }
}

/** AC 7: wilted from the day after a −3 day until the next +3 day (the latest scored day is a slip). */
export const isWilted = (growth) => growth?.lastDayScore === PIP_SLIP_SCORE

const isBelowStart = (growth) => growth.points < growth.formStart

/** 0–100 for the bar; the last form (no bar) is full; below the form's start the bar sits empty. */
export function barPct(growth) {
  if (!growth) return 0
  if (growth.barSize == null) return 100
  if (isBelowStart(growth)) return 0
  return Math.round((100 * growth.barCurrent) / growth.barSize)
}

/** "6 / 21", or the real points over the form's start ("12 / 15") once slips drop below it. */
export const barCount = (growth) => (isBelowStart(growth)
  ? `${growth.points} / ${growth.formStart}`
  : `${growth.barCurrent} / ${growth.barSize}`)

/** "Wyrmling · 6 / 21 → Drake", "Wyrmling · 12 / 15" below the start, or the line's fully-grown label. */
export function levelBarLabel(growth, line) {
  if (!growth) return null
  if (growth.fullyGrown || growth.barSize == null) return lineCopy(line).fullyGrownLabel
  const name = formName(line, growth.form)
  if (isBelowStart(growth)) return `${name} · ${barCount(growth)}`
  return `${name} · ${barCount(growth)} → ${formName(line, growth.form + 1)}`
}

/** What changed since this browser last showed Pip (both sides projected on one line); null when nothing to play. Forms never shrink: a drop just settles. */
export function growthChange(seen, growth) {
  if (!seen || !growth) return null
  if (growth.form > seen.form) return GROWTH_CHANGES.EVOLVE
  if (growth.lastScoredDate !== seen.lastScoredDate && growth.lastDayScore === PIP_SLIP_SCORE) return GROWTH_CHANGES.SLIP
  if (growth.points !== seen.points || growth.form !== seen.form) return GROWTH_CHANGES.MOVE
  return null
}

/** The steps to play. Reduced motion keeps only the bubble steps. */
export function growthSchedule(change, reducedMotion) {
  const step = (phase, ms = PIP_GROWTH_PHASE_MS[phase]) => ({ phase, ms })
  const revealed = step(REVEALED, change === GROWTH_CHANGES.MOVE ? PIP_BAR_MOVE_MS : PIP_GROWTH_BUBBLE_MS)
  if (change === GROWTH_CHANGES.EVOLVE) {
    return reducedMotion ? [step(EVOLVING), revealed] : [step(FILLING), step(EVOLVING), revealed]
  }
  return [revealed]
}

/**
 * What Pip and the bar show at a phase. Before an evolve the old form and its full bar show; the
 * new form's bar starts empty and then settles. `phase` null = a change is pending but not started:
 * the last-seen state, so the bar animates from where the viewer left it.
 */
export function growthView(phase, seen, growth, line) {
  const old = seen ?? growth
  switch (phase) {
    case null: return { form: old.form, pct: barPct(old), label: levelBarLabel(old, line) }
    case FILLING: return { form: old.form, pct: 100, label: levelBarLabel(old, line) }
    case EVOLVING: return { form: growth.form, pct: 0, label: levelBarLabel(growth, line) }
    default: return { form: growth.form, pct: barPct(growth), label: levelBarLabel(growth, line) }
  }
}

/** The "+3" / "−3" and the count that pop over the bar; null when points didn't move or either side has no bar. */
export function growthGain(seen, growth, steps) {
  const delta = growth.points - seen.points
  if (!delta || seen.barSize == null || growth.barSize == null) return null
  const delayMs = steps.filter(({ phase }) => phase !== REVEALED).reduce((sum, { ms }) => sum + ms, 0)
  return { text: delta > 0 ? `+${delta}` : `−${-delta}`, gained: delta > 0, count: barCount(growth), delayMs }
}

export const evolvingLine = (name) => `What? ${name} is evolving!`
export const evolvedLine = (name, line, form) => `${name} evolved into ${formName(line, form)}! ${lineCopy(line).evolveEmoji}`

/** The bubble for a phase of a change, or null. */
export function growthBubble({ change, phase, petName, seen, growth, line }) {
  if (phase === EVOLVING) return evolvingLine(petName)
  if (phase !== REVEALED) return null
  switch (change) {
    case GROWTH_CHANGES.EVOLVE:
      return growth.fullyGrown && !seen?.fullyGrown ? lineCopy(line).fullyGrownLine : evolvedLine(petName, line, growth.form)
    case GROWTH_CHANGES.SLIP: return lineCopy(line).slipLine
    default: return null
  }
}
```

- [x] **Step 3: Seen store holds the full payload**

In `pipGrowthSeenStore.js`, change the `readSeenGrowth` doc to "the growth payload (PetGrowthDTO, every line) Pip last finished showing this user here", and replace `toGrowth` with:
```js
// Only a payload with numeric points and a lines map is a marker; a pre-themed-lines marker reads as a first visit.
function toGrowth(value) {
  return value && Number.isFinite(value.points) && value.lines && typeof value.lines === 'object' ? value : null
}
```

### Task 25: `pipGrowth.check.mjs` — line-aware + client/server agreement ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/pipGrowth.check.mjs`

- [x] **Step 1: Rebase the fixtures on the new payload**

Build fixtures as raw DTOs and project them: e.g.
```js
import { readFileSync } from 'node:fs'
import { PIP_LINE, PIP_LINE_COPY } from '../constants/pipLines.js'
import { lineFormCount } from '../components/pet/pip/lineForms.js'
const lineOf = (form, formStart, barCurrent, barSize, fullyGrown = false) => ({ form, peakForm: form, formStart, barCurrent, barSize, fullyGrown })
const dto = (over = {}) => ({ points: 21, lastDayScore: 3, lastScoredDate: '2026-11-14', peakForm: 2,
  lines: { herb: lineOf(2, 15, 6, 21), dragon: lineOf(2, 15, 6, 21), robot: lineOf(2, 15, 6, 21) }, ...over })
const g = (over = {}, line = 'herb') => ({ ...lineGrowth(dto(), line), ...over })
```
Delete every DEVOLVE / DRAINING / SHRINKING assertion. Keep the existing EVOLVE / SLIP / MOVE / schedule / gain assertions, passing `line` where the signature now takes it.

- [x] **Step 2: Add the new assertions**

```js
// Projection
assert.equal(lineGrowth(dto(), 'dragon').form, 2)
assert.equal(lineGrowth(dto(), 'unknown').form, 2, 'unknown line falls back to herb')
assert.equal(lineGrowth({ points: 3, form: 2 }, 'herb'), null, 'legacy payload has no lines')
// Labels per line
assert.equal(levelBarLabel(g(), 'herb'), 'Seedling · 6 / 21 → Sprig')
assert.equal(levelBarLabel(g({}, 'dragon'), 'dragon'), 'Wyrmling · 6 / 21 → Drake')
assert.equal(levelBarLabel(g({}, 'robot'), 'robot'), 'Teen Unit · 6 / 21 → Android')
assert.equal(levelBarLabel(g({ form: 3, barCurrent: null, barSize: null, fullyGrown: true }, 'dragon'), 'dragon'), 'Fully grown 🐉')
assert.equal(levelBarLabel(g({ form: 3, barCurrent: null, barSize: null, fullyGrown: true }, 'robot'), 'robot'), 'Fully upgraded ⚙️')
// Below the form's start: empty bar, real points over the start
const below = g({ points: 12, barCurrent: 0 }, 'dragon')
assert.equal(barPct(below), 0)
assert.equal(levelBarLabel(below, 'dragon'), 'Wyrmling · 12 / 15')
assert.equal(growthGain(g(), below, growthSchedule(GROWTH_CHANGES.MOVE, false)).count, '12 / 15')
// Never shrink: a lower form is a MOVE with a single revealed step
assert.equal(growthChange(g({ form: 3 }), g({ form: 2 })), GROWTH_CHANGES.MOVE)
assert.deepEqual(growthSchedule(GROWTH_CHANGES.MOVE, false).map(s => s.phase), ['revealed'])
assert.equal(Object.values(GROWTH_CHANGES).includes('devolve'), false)
// Bubbles per line
assert.equal(evolvedLine('Pip', 'dragon', 3), 'Pip evolved into Drake! 🐉')
assert.equal(growthBubble({ change: GROWTH_CHANGES.SLIP, phase: 'revealed', petName: 'Pip', seen: g(), growth: g(), line: 'robot' }), PIP_LINE_COPY.robot.slipLine)
assert.equal(growthBubble({ change: GROWTH_CHANGES.EVOLVE, phase: 'revealed', petName: 'Pip', seen: g(), growth: g({ form: 3, fullyGrown: true }), line: 'dragon' }), PIP_LINE_COPY.dragon.fullyGrownLine)

// Client form counts and names agree with the server's PetGrowthPolicy.Line thresholds
const java = readFileSync(new URL('../../../foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java', import.meta.url), 'utf8')
for (const line of Object.values(PIP_LINE)) {
  const match = java.match(new RegExp(`${line.toUpperCase()}\\("${line}", List\\.of\\(([^)]*)\\)`))
  assert.ok(match, `server has no ${line} line`)
  const serverForms = match[1].split(',').length
  assert.equal(lineFormCount(line), serverForms, `${line}: client draws ${lineFormCount(line)} forms, server has ${serverForms} thresholds`)
  assert.equal(Object.keys(PIP_LINE_COPY[line].formNames).length, serverForms, `${line}: one name per server form`)
}
```

- [x] **Step 3: Run**

Run: `cd foodbytes-app\client; npm run check:growth`
Expected: the script's success line, exit code 0.

### Task 26: `usePipGrowth` takes the raw payload and a line ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePipGrowth.js`

- [x] **Step 1: Project marker and payload onto the line**

Imports: add `lineGrowth` from `../utils/pipGrowth` and `lineFormCount` from `../components/pet/pip/lineForms`. Signature `usePipGrowth({ userId, growth, line, petName, hold = false })`. Body changes:
```js
  const live = lineGrowth(growth, line)
  const lastForm = lineFormCount(line)
  const seen = !run && userId != null && live ? lineGrowth(readSeenGrowth(userId), line) : null
  const pending = seen ? growthChange(seen, live) : null

  useEffect(() => {
    if (run || hold || userId == null || !growth) return
    const current = lineGrowth(growth, line)
    if (!current) return
    const stored = readSeenGrowth(userId)
    const last = lineGrowth(stored, line)
    const change = growthChange(last, current)
    if (!change) {
      if (!stored || stored.points !== growth.points || stored.lastScoredDate !== growth.lastScoredDate) {
        writeSeenGrowth(userId, growth)
      }
      return
    }
    const steps = growthSchedule(change, prefersReducedMotion())
    const popped = growthGain(last, current, steps)
    setGain(popped && { ...popped, id: ++gainSeq })
    setRun({ change, line, seen: last, growth: current, raw: growth, steps, index: 0 })
  }, [run, hold, userId, growth, line])
```
In the step effect write `writeSeenGrowth(userId, run.raw)`. Replace `if (!growth) return NO_GROWTH` with `if (!live) return { ...NO_GROWTH, lastForm }`. In the run branch call `growthView(phase, run.seen, run.growth, run.line)` and `growthBubble({ change: run.change, phase, petName, seen: run.seen, growth: run.growth, line: run.line })`; in the idle branch `growthView(pending ? null : PIP_GROWTH_PHASES.IDLE, seen, live, line)`. Add `lastForm` to every returned object. Update the JSDoc: params gain `line: string` and `growth` is "the raw PetGrowthDTO (every line)"; returns gain `lastForm: number`; the summary loses "or de-evolves (shrink)" and gains "A theme switch compares the same line on both sides, so it plays nothing."

### Task 27: Item names per creature ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipWardrobe.js`
- Modify: `foodbytes-app/client/src/utils/pipWardrobe.js:40-45`
- Modify: `foodbytes-app/client/src/hooks/usePipWardrobe.js`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx:23`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx:70`
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx` (the `usePipWardrobe` call)
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`

- [x] **Step 1: Labels per line in `constants/pipWardrobe.js`**

Remove `label` from every `WARDROBE_ITEMS` entry (keep `slot` and `unlockHint`; update the header comment: "names live per creature in WARDROBE_ITEM_LABELS"). Add, importing `PIP_LINE` from `./pipLines.js`:
```js
// Themed lines: each creature names the same item its own way (ids, slots and unlocks are shared).
export const WARDROBE_ITEM_LABELS = {
  [PIP_LINE.HERB]: {
    beanie: 'Beanie', cap: 'Cap', 'chef-hat': 'Chef hat', 'straw-hat': 'Straw hat', 'top-hat': 'Top hat',
    'round-specs': 'Round specs', 'heart-glasses': 'Heart glasses', sunglasses: 'Sunglasses',
    'red-scarf': 'Red scarf', 'striped-scarf': 'Striped scarf', 'chef-whites': 'Chef whites', 'denim-jacket': 'Denim jacket', puffer: 'Puffer',
    'leather-belt': 'Leather belt', 'champion-belt': 'Champion belt', jeans: 'Jeans', joggers: 'Joggers', dungarees: 'Dungarees',
    sneakers: 'Sneakers', wellies: 'Wellies'
  },
  [PIP_LINE.DRAGON]: {
    beanie: 'Horn cosy', cap: "Bard's cap", 'chef-hat': 'Singed toque', 'straw-hat': "Bird's nest", 'top-hat': 'Crown',
    'round-specs': 'Battle scar', 'heart-glasses': 'Smitten', sunglasses: 'War paint',
    'red-scarf': "Knight's cape", 'striped-scarf': 'Ivy garland', 'chef-whites': "Baker's apron", 'denim-jacket': 'Leather jerkin', puffer: 'Scale mail',
    'leather-belt': 'Potion belt', 'champion-belt': 'Hoard belt', jeans: 'Patched breeches', joggers: 'Wool hose', dungarees: "Smith's overalls",
    sneakers: 'Talon wraps', wellies: 'Iron sabatons'
  },
  [PIP_LINE.ROBOT]: {
    beanie: 'Cooling fan', cap: 'Holo visor', 'chef-hat': 'Steam toque', 'straw-hat': 'Satellite dish', 'top-hat': 'Neon top hat',
    'round-specs': 'Smiley.exe', 'heart-glasses': 'Heart eyes', sunglasses: 'Shades.gif',
    'red-scarf': 'Cable coil', 'striped-scarf': 'Hazard tape', 'chef-whites': 'Oven door', 'denim-jacket': 'Hull plates', puffer: 'Battery vest',
    'leather-belt': 'Tool belt', 'champion-belt': 'Marquee belt', jeans: 'Coolant casing', joggers: 'Servo sleeves', dungarees: 'Maintenance overalls',
    sneakers: 'Hover pads', wellies: 'Mag boots'
  }
}
```

- [x] **Step 2: `utils/pipWardrobe.js`**

Import `WARDROBE_ITEM_LABELS` and `PIP_DEFAULT_LINE` (from `../constants/pipLines.js`). Add:
```js
/** The item's name on this creature; unknown lines fall back to the herb's names. */
export const wardrobeItemLabel = (line, id) =>
  (WARDROBE_ITEM_LABELS[line] ?? WARDROBE_ITEM_LABELS[PIP_DEFAULT_LINE])[id] ?? null
```
Change `wardrobeAnnouncement(ids)` → `wardrobeAnnouncement(ids, line)` with `const first = wardrobeItemLabel(line, ids[0])` (the rest of the function unchanged).

- [x] **Step 3: The hook and screens pass the line**

`usePipWardrobe`: accept `line` in its input object, pass it to `wardrobeAnnouncement(fresh, line)`, add it to the JSDoc. `PetView`: pass `line` to `usePipWardrobe({ …, line })`. `WardrobeItemGrid`: `label={wardrobeItemLabel(line, item.id)}` (its `line` prop exists since Task 14). `WardrobeView`: `🔒 {wardrobeItemLabel(herb.line, lockedId)}`; the unlock hint line is unchanged.

- [x] **Step 4: Check the names**

In `wardrobe.check.mjs` (add `wardrobeItemLabel` to the `../../../utils/pipWardrobe.js` import): the AC 1 loop asserts `item.unlockHint` only, and adds `for (const line of LINES) assert.ok(wardrobeItemLabel(line, id), \`${line} ${id} needs a name\`)`; the announcement asserts pass the line:
```js
assert.equal(wardrobeAnnouncement(['wellies'], 'herb'), '🎉 New outfit: Wellies!')
assert.equal(wardrobeAnnouncement(['wellies'], 'robot'), '🎉 New outfit: Mag boots!')
assert.equal(wardrobeAnnouncement(['round-specs'], 'dragon'), '🎉 New outfit: Battle scar!')
assert.equal(wardrobeAnnouncement(['beanie', 'jeans'], 'herb'), '🎉 New outfit: Beanie! (+1 more)')
assert.equal(wardrobeAnnouncement(['jetpack'], 'herb'), null)
```
Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed`, `built in <n>s`.

- [x] **Step 5: No shared label reads remain**

Run: `cd foodbytes-app\client; Get-ChildItem src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "WARDROBE_ITEMS\[[^\]]+\]\??\.label"`
Expected: zero hits.

### Task 28: Screens read the active line ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:9,61,105-122`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx:2,61`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx:3,24`
- Modify: `foodbytes-app/client/src/components/layout/AppNavItems.jsx:59`
- Modify: `foodbytes-app/client/src/services/petService.js:17`

- [x] **Step 1: `PetView`**

Replace the `PIP_FORM_NAMES, PIP_FORMS` import with `import { formName } from '../../constants/pipLines'` and add `lineGrowth` to the `../../utils/pipGrowth` import. Pass `line` to the hook: `usePipGrowth({ userId: petUserId, growth: pet?.growth ?? null, line, petName: …, hold: … })` (move `const line = theme.pipLine` above it if needed). Wardrobe: `peakForm: lineGrowth(pet.growth, line)?.peakForm ?? growth.displayForm`. Level bar: `growth.barLabel && growth.displayForm !== growth.lastForm` (comment: "no bar once the line's last form is reached; during an evolve into it the previous bar still fills and flashes first"). Header: `formName={formName(line, growth.displayForm)}`.

- [x] **Step 2: Wardrobe names**

`WardrobeView`: import `formName` from `../../../constants/pipLines`; line 61 `{formName(herb.line, herb.form)} · wearing …`. `WardrobeLineup`: drop the `PIP_FORMS, PIP_FORM_NAMES` import, import `formName`; label `{reached ? formName(line, form) : WARDROBE_UNREACHED_LABEL}`; update its comment to "the active line's forms; forms above the line's peak form are silhouettes".

- [x] **Step 3: Footer tab form from the active line**

`AppNavItems`: import `lineGrowth` from `../../utils/pipGrowth` (alongside `isWilted`); `const tabForm = lineGrowth(growth, line)?.form ?? PIP_DEFAULT_FORM`.

- [x] **Step 4: `petService.js` JSDoc**

In the `@returns` type replace the `growth: { … }` shape with `growth: { points: number, lastDayScore: number, lastScoredDate: string|null, peakForm: number, lines: { [line: string]: { form: number, peakForm: number, formStart: number, barCurrent: number|null, barSize: number|null, fullyGrown: boolean } } }`.

- [x] **Step 5: No herb-only names left**

Run: `cd foodbytes-app\client; Get-ChildItem src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "PIP_FORM_NAMES|PIP_FULLY_GROWN_|PIP_SLIP_LINE|devolvedLine|SHRINKING|DRAINING|GROWTH_CHANGES.DEVOLVE"`
Expected: zero hits.

### Task 29: `pipLine` on every theme ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/themes.js`
- Modify: `foodbytes-app/client/scripts/check-themes.mjs`

- [x] **Step 1: Registry field**

Add after `ambient: …` on each entry: default `pipLine: 'herb',`, cyberpunk `pipLine: 'robot',`, parchment `pipLine: 'dragon',`.

- [x] **Step 2: Validate it in `check-themes.mjs`**

Add `import { PIP_LINE_COPY } from '../src/constants/pipLines.js'` under the `themes.js` import, and next to the boot-list agreement check:
```js
for (const theme of THEMES) {
  if (!(theme.pipLine in PIP_LINE_COPY)) failures.push(`${theme.id}: pipLine "${theme.pipLine}" is not a known Pip line (${Object.keys(PIP_LINE_COPY)})`)
}
```

- [x] **Step 3: Run every client check and the build**

Run: `cd foodbytes-app\client; npm run check:themes; npm run check:growth; npm run check:wardrobe; npm run check:room; npm run build`
Expected: check:themes prints the one known WARN (`default|text-secondary|bg-secondary`) and `Themes OK: 3 themes, 81 contrast pairs`; the other checks print their success lines; build `built in <n>s`.

### Task 30: Manual check in all three themes + mockup sync — Step 3 ✓; Steps 1–2 pending (developer manual walk)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/README.md` (sync note)
- Modify: `foodbytes-app/mockup/pip-themed-lines.html` (only if the build diverged)

- [ ] **Step 1: Run the stack locally**

Start the backend per `CLAUDE.md` → "Running the backend locally with Google login" (add `$env:PET_FREE_MODE = "true"` if you want the shop open), and `cd foodbytes-app\client; npm run dev`.
Expected: `/pet` loads with no console errors.

- [ ] **Step 2: Walk the themes (developer)**

At 375 px and 1280 px, on `/pet`, switch the theme in the user menu Default → Cyberpunk → Parchment without reloading. Expected: basil / robot / dragon at the form matching the account's peak (0–14 form 1, 15–35 form 2, 36+ form 3 for dragon/robot); the swap is instant and DevTools → Network shows no new `/api/pet` request; header name, level-bar label and screen-reader label (`role="img"` aria-label) use the line's names; Dress Pip cards, the lineup and the footer tab show the active line; a full outfit fits on every reachable form; with OS reduced motion on, an evolve shows only the bubble steps. In Dress Pip on each theme: the item cards, lock text and "New outfit" announcement use that creature's names (e.g. Battle scar, Smiley.exe); Smiley.exe and Heart eyes replace the robot's face and the normal face returns when Pip sleeps; the Knight's cape hangs behind the dragon; the listed items animate in the room, stand still on the Dress Pip cards and lineup, and stop (glow included) when Low FX is switched on in the user menu or OS reduced motion is on.

- [x] **Step 3: Sync the mockup**

If any dragon/robot geometry or art changed during Phase 4, copy the shipped values back into `pip-themed-lines.html`. Append to `mockup/README.md`: `## Synced with the implementation (<date>, contract `2026-11-15-themed-pip-lines`)` with one bullet per divergence, or "No divergence: the shipped dragon and robot match the approved mockup."

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "2026-11-15-themed-pip-lines"`
Expected: one hit.

---

## Phase 6 — Final verification

No production changes beyond the version bump — sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This work has no Jira key and is not a bug fix → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-15-themed-pip-lines: Pip is a dragon on Parchment and a robot on Cyberpunk (3 forms each); no line de-evolves any more — forms follow peak points`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: No herb-only or devolve leftovers on the client**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs,*.css | Select-String -Pattern "PipHerbFigure|herbForm\(|HERB_FOOT_|HERB_FULL_VIEWBOX|PIP_FORM_NAMES|devolvedLine|is-shrinking|pip-shrink|SHRINKING|DRAINING|DRAWN_ITEM_IDS|WARDROBE_ITEMS\[[^\]]+\]\??\.label"`
Expected: zero hits.

- [x] **Step 2: No theme-id branching for the line**

Run: `Get-ChildItem -Path foodbytes-app\client\src\components -Recurse -Include *.js,*.jsx | Select-String -Pattern "themeId\s*===|'parchment'|'cyberpunk'"`
Expected: zero hits.

- [x] **Step 3: No old DTO accessors on the server**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "growth\.getForm\(\)|growth\.isFullyGrown\(\)|growth\.getBarSize\(\)|formFor\(\w+\)"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Every client check + production build ✓

- Skill: none — verification only

- [x] **Step 1: Checks**

Run: `cd foodbytes-app\client; npm run check:themes; npm run check:version; npm run check:growth; npm run check:wardrobe; npm run check:room; npm run check:pet; npm run check:bubble`
Expected: each prints its success line (check:themes with its single known WARN); exit code 0.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 3: Size budget on touched components**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\pip\*.jsx,src\components\pet\PetView.jsx,src\hooks\usePipGrowth.js,src\components\pet\dragon\*.js*,src\components\pet\robot\*.js* | ForEach-Object { "$($_.Name) $((Get-Content $_ | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: server line registry (herb/dragon/robot, form from peak, no de-evolve), `PetGrowthDTO.lines`, client line registry + three art packs, a per-creature wardrobe (same 20 items, own art, names and animations; screen faces and back-wear layers), theme `pipLine`, the new version from Task M.1.
- Migration: none. Deploy note: backend and frontend should go out in the same push (the growth payload shape changed).
- Verification results from Phases 2–6 (test counts, check outputs, manual theme walk).
- Convention note: "A new Pip form = append a threshold in `PetGrowthPolicy.Line`, a geometry entry in `<line>Forms.js`, its art, and its name in `PIP_LINE_COPY`; `check:growth` and `check:wardrobe` enforce the rest. A new wardrobe item = an id on the server catalogue, a drawing in every `<line>Wardrobe.js`, and a name in every `WARDROBE_ITEM_LABELS` line."
- Suggested commit subject: `2026-11-15-themed-pip-lines: themed Pip lines (dragon, robot) and no de-evolve`

---

## Self-review

**Spec coverage:**
- Server line registry, form from peak, herb no longer de-evolves — Task 5.
- `PetGrowthDTO` returns every line — Tasks 4, 5; consumers in Tasks 6, 7.
- Server tests for each line's form, bar, never-de-evolve and herb's change — Task 5 (+ Task 6).
- `pipLine` per theme via `useTheme()` — Tasks 14, 28, 29.
- Dragon art 3 forms, robot art 3 forms — Tasks 1, 16–20.
- Per-form geometry files + per-line names / fully-grown label & line / slip line — Tasks 8, 16, 19.
- Figure renderer, head bar, since-last-visit sequence, mini variant line-aware; shrink removed — Tasks 11–14, 24, 26, 28.
- Wardrobe check across all 11 forms incl. "form-1 outfit fits after every evolution" — Tasks 15, 23.
- Per-creature wardrobe (approved 2026-11-15): own art per line — Tasks 11, 18, 21, 23; own names — Task 27; animations honouring reduced motion and Low FX — Task 22; screen-face and back-wear layers — Tasks 11, 13, 15.
- Mockup first, reviewed, synced — Tasks 1–3, 30.
- Adding form N+1 needs no structural change (enforced by agreement check) — Tasks 10, 25.
- Version bump (MINOR) + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Art-porting steps name the exact source (the approved mockup's `DRAGON_FORMS` / `ROBOT_FORMS` and part functions), the exports, props and features each must draw.

**Type / name consistency:** `PetGrowthPolicy.Line` (`key()`, `thresholds()`, `lastForm()`), `formFor(Line,int)`, `effectivePeak`, `lineGrowth(Line,int,int)` on the server; `PetLineGrowthDTO { form, peakForm, formStart, barCurrent, barSize, fullyGrown }`; `PetGrowthDTO { points, lastDayScore, lastScoredDate, peakForm, lines }`. Client: `PIP_LINE`, `PIP_DEFAULT_LINE`, `PIP_LINE_COPY`, `lineCopy`, `formName`, `LINE_FORMS`, `lineForms`, `lineFormCount`, `pipForm`, `LINE_ART`, `lineArt`, `HERB_ART`/`DRAGON_ART`/`ROBOT_ART`, `PIP_FOOT_X/Y`, `PIP_FULL_VIEWBOX`, `LINE_WARDROBE`, `HERB_WARDROBE`/`DRAGON_WARDROBE`/`ROBOT_WARDROBE` (`{ HATS, GLASSES, TORSO, SHOES, REPLACES_FACE }`), `hatArt/glassesArt/torsoArt/shoeArt(line, id, f)`, `drawnItemIds(line)`, `fxGroup`, `pxCells`, `heartPath`, `pip-fx pip-fx--<effect>`, `WARDROBE_ITEM_LABELS`, `wardrobeItemLabel(line, id)`, `wardrobeAnnouncement(ids, line)`, `PipFigure`, `Pip`, `PipOutfit`, `dressLayers(outfit, line, form, opts)` → `{ back, shoes, clip, extra, glasses, replacesFace, hat, growTop, itemIds }`, `slotCropViewBox(slot, line, form)`, `hatMiniViewBox(line, form)`, `headBarTop/headBarY(line, form, outfit)`, `lineGrowth(dto, line)`, `barCount`, `levelBarLabel(growth, line)`, `growthView(phase, seen, growth, line)`, `evolvedLine(name, line, form)`, `growthBubble({…, line})`, `usePipGrowth({ userId, growth, line, petName, hold })` → `lastForm` — used identically in every task.

**Phase boundary cleanliness:**
- Phase 1: only mockup files change; nothing builds against them yet.
- Phase 2: backend compiles and every affected test class passes; the client is untouched.
- Phase 3: renames complete, no stale imports (Task 14 Step 6), `check:wardrobe` + build green, herb identical.
- Phase 4: two new lines (forms, art, wardrobes) registered but unreferenced by any theme; animations in CSS; `check:wardrobe` (11 forms × each line's 20 items) + build green.
- Phase 5: all client checks + build green; every theme names a registered line.
- Phase 6: version agreed, full backend suite and every client check green.

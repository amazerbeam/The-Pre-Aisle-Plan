# Tasks: Pip's room — zoomed-in draggable camera that floats back to Pip, plus white walls by default

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-15

**Goal:** Make Pip's room a bigger, lower room on a camera layer. You drag it (it trails, rubber-bands and floats back to Pip over 2 s), it follows Pip, it zooms by pinch, Ctrl+wheel or keys with the zoom remembered in the browser, and its tap areas always line up. White becomes the free default wall style, and Lavender stays free.

**Spec:** `plan.md` in this folder.

All paths below are relative to the repo root. Client paths start `foodbytes-app/client/src/`, backend paths `foodbytes-app/foodbytes-api/src/`.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/roomCamera.js`: pure camera maths (zoom clamp, rubber band, axis clamps, easing, bounds, world transform)
- `foodbytes-app/client/src/utils/roomCamera.check.mjs`: node checks for `roomCamera.js` and `roomZoomStore.js`
- `foodbytes-app/client/src/utils/roomZoomStore.js`: `localStorage` zoom read/write with try/catch
- `foodbytes-app/client/src/hooks/usePipCamera.js`: the camera (refs, rAF loop, pointer/pinch/wheel/keys/resize)
- `foodbytes-app/client/src/components/pet/room/RecentreButton.jsx`: the 🎯 "Centre on Pip" button

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorCatalogue.java`: `wall-white` default, Lavender free not default, `Item.isFree()`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetRoomService.java:74-80`: owned = free or bought
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorService.java:30-63`: buy/place use `isFree()`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorCatalogueTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetRoomServiceTest.java:70-116`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorServiceTest.java`
- `foodbytes-app/client/src/constants/petRoom.js`: room size, world box, camera and zoom constants, hint and labels
- `foodbytes-app/client/src/constants/petDecor.js`: `wall-white` + default + skirting colours
- `foodbytes-app/client/src/components/pet/room/roomLayout.js`: rug, cooker spot, shift tables, `shiftPx`/`shiftTransform`, `pipFocusPoint`, shifted hit boxes, world `hitBoxStyle`, cooker L4 footprint
- `foodbytes-app/client/src/components/pet/room/furniture.jsx:90-97`: cooker L4 hood −30
- `foodbytes-app/client/src/components/pet/room/roomDecor.jsx`: backdrop from `ROOM_SIZE`, skirting, corner lines, shifted window, sprigs and patterns
- `foodbytes-app/client/src/components/pet/room/RoomDecorLayers.jsx`: per-spot shifted groups
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`: shifted station groups, stage + world structure, camera hook, 🎯
- `foodbytes-app/client/src/components/pet/room/PetRoom.css`: stage/world, recentre button, no min size on in-world buttons, `is-editing` on stage
- `foodbytes-app/client/src/components/pet/room/room.check.mjs`: world bounds, shifts, wall height, white default, focus point
- `foodbytes-app/client/package.json`: `check:camera` script + version
- `foodbytes-app/foodbytes-api/pom.xml`: version
- `CHANGELOG.md`: one line

**Deleted:** (none)

---

## Phase 1 — White wall default (backend)

The server learns that "free" (owned by everyone) and "default" (shown when nothing is stored) are different things, and makes White the default. This phase is self-contained. The client still sends and receives the same shapes, and nothing stores a wall style today (audit in `plan.md`), so the backend is consistent and green on its own.

### Task 1: Add `wall-white` and `Item.isFree()` to `DecorCatalogue` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorCatalogue.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorCatalogueTest.java`

- [x] **Step 1: Write the failing tests**

In `DecorCatalogueTest`, replace `eachFinishHasExactlyOneFreeDefault` and `everythingElseIsPriced_andTheCatalogueTotals4900` with:

```java
    @Test
    void eachFinishHasExactlyOneDefault_whiteWallsAndLilacFloor() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isDefault)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "floor-lilac");
        assertThat(DecorCatalogue.defaultFor(RoomSpot.WALL_STYLE)).isEqualTo("wall-white");
        assertThat(DecorCatalogue.defaultFor(RoomSpot.FLOOR_STYLE)).isEqualTo("floor-lilac");
    }

    @Test
    void theDefaultsAndLavenderAreFree_andLavenderIsNoLongerTheDefault() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isFree)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac");
        assertThat(DecorCatalogue.find("wall-lavender")).get()
                .satisfies(item -> assertThat(item.isDefault()).isFalse());
    }

    @Test
    void everythingElseIsPriced_andTheCatalogueTotals4900() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(item -> !item.isFree())
                .allSatisfy(item -> assertThat(item.price()).isPositive());
        assertThat(DecorCatalogue.ITEMS.stream().mapToInt(DecorCatalogue.Item::price).sum()).isEqualTo(4900);
    }
```

Update the class Javadoc line to `/** MPP-27 AC 1 / MPP-39: the catalogue - 4 items per spot, one default per finish (White walls, Lilac floor), free items owned by everyone, every other entry priced. */`.

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorCatalogueTest`
Expected: compilation failure: `cannot find symbol … isFree`.

- [x] **Step 3: Implement**

In `DecorCatalogue.java`, replace the record line with:

```java
    public record Item(String id, RoomSpot spot, int price, boolean isDefault) {
        /** MPP-39: a free item (each finish's default, and Lavender) is owned by everyone without a row. */
        public boolean isFree() {
            return price == 0;
        }
    }
```

Replace the `wall-lavender` line with these two lines (White first among the wall styles):

```java
            new Item("wall-white", WALL_STYLE, 0, true),
            new Item("wall-lavender", WALL_STYLE, 0, false),
```

Replace the class Javadoc's last two sentences ("The two defaults are free and owned by everyone without a row. Prices are retunable here only; …") with: `Each finish has one default, shown when nothing is stored (MPP-39: White walls, Lilac floor). Free items - the defaults and Lavender - are owned by everyone without a row. Prices are retunable here only; the client reads PetRoomDTO.decor.`

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorCatalogueTest`
Expected: `Tests run: 8, Failures: 0, Errors: 0` and `BUILD SUCCESS`. The count is today's 7 tests, minus the replaced one, plus the two new ones.

### Task 2: Free items are owned by everyone in `PetRoomService.decorOf` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetRoomService.java:74-80`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetRoomServiceTest.java:70-116`

- [x] **Step 1: Update the tests to the new default and ownership**

In `room_newUser_emptySpotsDefaultStylesAndOnlyTheDefaultsOwned`, rename it to `room_newUser_emptySpotsDefaultStylesAndOnlyFreeItemsOwned` and change:

```java
        assertThat(room.getPlacements()).containsEntry("wallStyle", "wall-white").containsEntry("floorStyle", "floor-lilac");
        …
        assertThat(room.getDecor()).filteredOn(DecorItemDTO::isOwned).extracting(DecorItemDTO::getId)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac");
```

In `room_rowsOverrideTheirSpot_unknownOrMisplacedIdsAreIgnored`, change `.containsEntry("wallStyle", "wall-lavender")` to `.containsEntry("wallStyle", "wall-white")`, and the owned assertion to `.containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "mirror", "floor-oak")`.

Add one test after it:

```java
    @Test
    void room_aStoredLavenderWallIsKept() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        when(placementRepository.findByUserId(USER)).thenReturn(List.of(
                new PetRoomPlacement(1L, USER, RoomSpot.WALL_STYLE, "wall-lavender")));

        assertThat(petRoomService.room(USER).getPlacements()).containsEntry("wallStyle", "wall-lavender");
    }
```

- [x] **Step 2: Run them and see the ownership assertions fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetRoomServiceTest`
Expected: failures in the two edited tests. Lavender is reported not owned, because it is no longer a default.

- [x] **Step 3: Implement**

In `PetRoomService.decorOf`, change `item.isDefault() || owned.contains(item.id())` to `item.isFree() || owned.contains(item.id())`. Change its Javadoc to `/** MPP-27 / MPP-39: every catalogue entry with whether the caller owns it; free items always are. */`

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetRoomServiceTest`
Expected: `Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 3: `DecorService` buys and places by `isFree()`, and deletes the row only for the default ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorService.java:30-63`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorServiceTest.java`

- [x] **Step 1: Write the failing tests**

Rename `buy_aFreeDefault_isAlreadyOwned` to `buy_aFreeItem_isAlreadyOwned` and make it cover both free wall styles:

```java
    @Test
    void buy_aFreeItem_isAlreadyOwned() {
        for (String free : List.of("wall-white", "wall-lavender")) {
            assertThatThrownBy(() -> decorService.buy(OWNER, free))
                    .isInstanceOf(PetShopException.class)
                    .hasMessage("You already own that.");
        }
        verify(ownedRepository, never()).save(any());
    }
```

In `place_theDefaultStyle_deletesTheRowInsteadOfStoringIt`, change `"wall-lavender"` to `"wall-white"`. Add after it:

```java
    @Test
    void place_lavender_isFreeButNotTheDefault_soTheRowIsStored() {
        when(petRoomService.write(OWNER)).thenReturn(WRITE);

        assertThat(decorService.place(OWNER, RoomSpot.WALL_STYLE, "wall-lavender")).isSameAs(WRITE);

        verify(placementRepository).upsert(OWNER, "WALL_STYLE", "wall-lavender");
        verify(ownedRepository, never()).existsByUserIdAndItemKey(anyLong(), anyString());
        verifyNoInteractions(sprinkleService);
    }
```

Add `import java.util.List;` if the file does not already import it.

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorServiceTest`
Expected: `buy_aFreeItem_isAlreadyOwned` fails for `wall-lavender` (Lavender is not a default, so the buy goes ahead). `place_lavender_…` fails with `PetShopException: You don't own that yet.`

- [x] **Step 3: Implement**

In `DecorService.buy`, change `if (item.isDefault() || ownedRepository.existsByUserIdAndItemKey(userId, item.id()))` to `if (item.isFree() || ownedRepository.existsByUserIdAndItemKey(userId, item.id()))`.

In `DecorService.place`, keep the `item.isDefault()` delete branch. Change the ownership guard to:

```java
        if (!item.isFree() && !ownedRepository.existsByUserIdAndItemKey(userId, item.id())) {
            throw new PetShopException(PetShopException.Reason.NOT_OWNED, "You don't own that yet.");
        }
```

Update the `place` Javadoc to `/** Puts an owned (or free) item on its spot, or clears the spot when itemId is null/blank (a finish resets to its default, which is never stored). */`

- [x] **Step 4: Run the three decor test classes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorServiceTest,PetRoomServiceTest,DecorCatalogueTest,PetDecorControllerTest`
Expected: `Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 2 — Bigger room, spread furniture, white walls (client, no camera yet)

The room is redrawn at its new size, with stations, window and decor spots shifted and White as the client default. It is still fitted into one box, the way the page works today. At the end of this phase the build is green, the room shows whole (letterboxed) at `/pet`, and every tap area still lines up. The camera then only changes how the same world is framed.

### Task 4: Room size, world box and white wall style constants ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js:25-27`
- Modify: `foodbytes-app/client/src/constants/petDecor.js:63-79`

- [x] **Step 1: Replace the viewBox constants in `petRoom.js`**

Replace the two lines `ROOM_VIEWBOX_SIZE` / `ROOM_VIEWBOX` (and their comment) with:

```js
// MPP-39: the room's floor along the left wall (u) and the right wall (v), and the wall height —
// bigger and lower than MPP-16's 193 × 193 × 180, in the same isometric units (iso.js P()).
export const ROOM_SIZE = { u: 260, v: 300, h: 150 }

// MPP-39: the world the camera looks at — the projected room (x −62.3…459.6, y 30…383) plus a
// ~20-unit margin. The room SVG's viewBox, and what the % hit boxes are measured against.
export const ROOM_WORLD = { x: -84, y: 10, width: 564, height: 394 }
export const ROOM_WORLD_VIEWBOX = `${ROOM_WORLD.x} ${ROOM_WORLD.y} ${ROOM_WORLD.width} ${ROOM_WORLD.height}`
```

- [x] **Step 2: Add White and skirting colours in `petDecor.js`**

Replace the defaults comment and the two default lines with:

```js
// MPP-39: White is the free default wall (Lavender stays free and owned). Lilac stays the default floor.
export const DEFAULT_WALL_STYLE = 'wall-white'
export const DEFAULT_FLOOR_STYLE = 'floor-lilac'
```

Replace the comment above `ROOM_STYLES` with `// left / right = the wall fills (right = the window wall); skirting = the board along both walls (MPP-39); base = the floor fill; sprigs / boards / grid / checker = the pattern over it.`. Replace the five wall entries with:

```js
  'wall-white': { label: 'White', spot: 'wallStyle', left: '#eceef2', right: '#ffffff', skirting: '#dfe3e9' },
  'wall-lavender': { label: 'Lavender', spot: 'wallStyle', left: '#ece5fb', right: '#e3daf8', skirting: '#cbbdea' },
  'wall-mint': { label: 'Mint', spot: 'wallStyle', left: '#dff3e8', right: '#d2ecdd', skirting: '#bcdcc8' },
  'wall-peach': { label: 'Peach', spot: 'wallStyle', left: '#fde6d8', right: '#f8d9c6', skirting: '#ecc4ab' },
  'wall-sky': { label: 'Sky', spot: 'wallStyle', left: '#dcecfb', right: '#cfe2f6', skirting: '#b9d3ee' },
  'wall-sprig': { label: 'Sprig wallpaper', spot: 'wallStyle', left: '#eef6e4', right: '#e4efd8', sprigs: true, skirting: '#cfe0bd' },
```

The `ROOM_VIEWBOX*` imports in `PetRoom.jsx` and `roomLayout.js` now dangle. Tasks 5 and 9 fix them before this phase's build step.

### Task 5: Shift tables, re-centred rug and world hit boxes in `roomLayout.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js`

- [x] **Step 1: Swap the import and move the rug and cooker spot**

Line 2: replace `ROOM_VIEWBOX_SIZE` in the import with `ROOM_WORLD`. Add `COOK_PHASES` to the `constants/pet.js` import and `PIP_FOCUS_LIFT` to the `constants/petRoom.js` import. (`PIP_FOCUS_LIFT` is added in Task 10. Until then add it here in `petRoom.js` now as `export const PIP_FOCUS_LIFT = 50 // MPP-39: the camera aims this far above Pip's feet (mid-body + level bar)`, and Task 10 leaves it alone.)

Replace `RUG` and `PIP_COOKER_SPOT`:

```js
// MPP-39: the middle of the bigger floor (ROOM_SIZE 260 × 300).
export const RUG = { cu: 140, cv: 150, ru: 58, rv: 44 }
…
// MPP-17 / MPP-39: in world floor coords — the art's [96, 64] plus STATION_SHIFT.cooker.
export const PIP_COOKER_SPOT = [126, 64]
```

- [x] **Step 2: Add the shift tables and helpers under `NIGHT_DIM_FILL`**

```js
// MPP-39: the furniture is spread along the longer walls by sliding each station's art (which stays
// in its MPP-16 coords, so the shop thumbnails don't move). [du, dv] along the floor.
export const STATION_SHIFT = {
  [ROOM_STATIONS.COOKER]: [30, 0],
  [ROOM_STATIONS.FRIDGE]: [60, 0],
  [ROOM_STATIONS.CABINET]: [0, 30],
  [ROOM_STATIONS.BED]: [0, 70]
}

// MPP-39: [du, dv, dh] per decor spot — the wall spots drop under the 150-high walls, onto free wall.
export const DECOR_SPOT_SHIFT = {
  leftWall: [-130, 0, -40],
  rightWall: [0, 216, -40],
  floor: [70, 20, 0]
}

// MPP-39: the window (and its sky) follows the bed and sits lower on the lower wall.
export const WINDOW_SHIFT = [0, 70, -30]

/** MPP-39: a floor shift [du, dv, dh] as screen px. P() is linear, so it is one constant offset. */
export function shiftPx([du, dv, dh = 0]) {
  const [x0, y0] = P(0, 0, 0)
  const [x, y] = P(du, dv, dh)
  return [x - x0, y - y0]
}

/** MPP-39: an SVG transform for a shift, one decimal place like the rest of the art. */
export function shiftTransform(shift) {
  const [dx, dy] = shiftPx(shift)
  return `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`
}

const offsetBox = (box, shift) => {
  const [dx, dy] = shiftPx(shift)
  return { ...box, x: box.x + dx, y: box.y + dy }
}
```

- [x] **Step 3: Lower the cooker L4 footprint**

`COOKER_FOOTPRINT` last entry: `[48, 0, 94, 40, 0, 180]` → `[48, 0, 94, 40, 0, 150]`. Add `(MPP-39: L4's hood dropped 30 to fit the 150 wall)` to its comment.

- [x] **Step 4: Shift the room hit boxes and measure them against the world**

- `decorSpotHitBox(spot)`: wrap the return in `offsetBox(…, DECOR_SPOT_SHIFT[spot])`.
- `fridgeHitBox(level)`: return `offsetBox(boundsOf(…), STATION_SHIFT[ROOM_STATIONS.FRIDGE])`.
- `cabinetHitBox(level)`: return `offsetBox(boundsOf(…), STATION_SHIFT[ROOM_STATIONS.CABINET])`.
- `stationThumbBox` and `decorThumbBox` stay unshifted.
- Replace `hitBoxStyle`:

```js
/** MPP-19 / MPP-27 / MPP-39: a world box → the % position of a button on the room's world layer. */
export function hitBoxStyle(box) {
  const { x, y, width, height } = ROOM_WORLD
  return {
    left: percentOf(box.x - x, width),
    top: percentOf(box.y - y, height),
    width: percentOf(box.width, width),
    height: percentOf(box.height, height)
  }
}
```

Update the JSDoc on `fridgeHitBox` / `cabinetHitBox` / `decorSpotHitBox` to say "world px (shifted, MPP-39)".

- [x] **Step 5: Add `pipFocusPoint` at the end of the file**

```js
const COOKER_PHASES = [COOK_PHASES.WALKING, COOK_PHASES.COOKING, COOK_PHASES.SERVED]

/**
 * MPP-39 AC 8 / AC 14: where the camera aims, in world px — a little above Pip's feet at his
 * current spot (the cooker spot for the whole cook scene, his bed at night, else the rug).
 */
export function pipFocusPoint(position, phase, levels) {
  let anchor = [...PIP_HOME, 0]
  if (COOKER_PHASES.includes(phase) || position === PIP_POSITIONS.COOKER) anchor = [...PIP_COOKER_SPOT, 0]
  else if (position === PIP_POSITIONS.BED) {
    const [u, v, h] = STATION_ANCHORS.bedTop[resolveRoomLevels(levels).bed - 1]
    const [su, sv] = STATION_SHIFT[ROOM_STATIONS.BED]
    anchor = [u + su, v + sv, h]
  }
  const [x, y] = P(...anchor)
  return [x, y - PIP_FOCUS_LIFT]
}
```

### Task 6: Drop the cooker L4 hood under the 150 wall ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/furniture.jsx:90-97`

- [x] **Step 1: Lower the hood, rail and utensils by 30**

In the cooker level-4 art, change only these lines:

```jsx
    // 4 chef's kitchen: hood, range, utensils (MPP-39: hood, rail and utensils 30 lower, under the 150 wall)
    () => (
      <>
        <Box u={84} v={0} du={26} dv={14} h0={106} h1={150} color="#b0bec5" />
        <Box u={70} v={0} du={54} dv={32} h0={94} h1={106} color="#b0bec5" />
        {[76, 84, 112, 118].map((u, i) => (
          <IsoLine key={u} points={[P(u, 1, 88), P(u, 1, 74 - i * 3)]} width={2} />
        ))}
        <IsoLine points={[P(64, 1, 88), P(130, 1, 88)]} width={2} />
```

The range, top, pot, board and knob lines below stay as they are.

### Task 7: Redraw the backdrop at the new size with skirting and corner lines ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomDecor.jsx`

- [x] **Step 1: Imports and constants**

Change the imports to:

```js
import { ROOM_SIZE } from '../../../constants/petRoom'
import { DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../../../constants/petDecor'
import { Leaf } from './decorArt'
import { P, pts, shade } from './iso'
import { Bill, Box, EllH, IsoLine, RectU } from './isoShapes'
import { RUG, WINDOW_SHIFT, shiftTransform } from './roomLayout'
```

Replace `CHECKER_CELLS`, `CHECKER_STEP`, `WALL_LENGTH` and `WALL_HEIGHT` with:

```js
const CHECKER_STEP = 25
const SKIRTING_HEIGHT = 7
const { u: ROOM_U, v: ROOM_V, h: WALL_HEIGHT } = ROOM_SIZE
// The window's spot on the right wall after WINDOW_SHIFT, so the sprigs leave it clear.
const WINDOW_GAP = { v0: 158, v1: 238, h0: 66 }
```

Add `(MPP-39: 260 × 300 floor, 150 walls, skirting + soft corner lines, window moved with the bed)` to the file's top comment.

- [x] **Step 2: Replace `buildBackdrop`**

```jsx
function buildBackdrop(night, wall, floor) {
  const corner = shade(floor.base, -22)
  return (
    <>
      <polygon points={pts([P(ROOM_U, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(ROOM_U, 0, 0)])} fill={wall.left} />
      <polygon points={pts([P(0, 0, WALL_HEIGHT), P(0, ROOM_V, WALL_HEIGHT), P(0, ROOM_V, 0), P(0, 0, 0)])} fill={wall.right} />
      {wall.sprigs && <WallSprigs />}
      <polygon points={pts([P(0, 0), P(ROOM_U, 0), P(ROOM_U, ROOM_V), P(0, ROOM_V)])} fill={floor.base} />
      <FloorPattern floor={floor} />
      <polygon points={pts([P(ROOM_U, 0, 0), P(0, 0, 0), P(0, 0, SKIRTING_HEIGHT), P(ROOM_U, 0, SKIRTING_HEIGHT)])} fill={wall.skirting} />
      <polygon points={pts([P(0, 0, 0), P(0, ROOM_V, 0), P(0, ROOM_V, SKIRTING_HEIGHT), P(0, 0, SKIRTING_HEIGHT)])} fill={shade(wall.skirting, -6)} />
      <IsoLine points={[P(0, 0, 0), P(0, 0, WALL_HEIGHT)]} width={2.5} color={shade(wall.left, -14)} />
      <IsoLine points={[P(ROOM_U, 0), P(0, 0), P(0, ROOM_V)]} width={2.5} color={corner} />

      <g transform={shiftTransform(WINDOW_SHIFT)}>
        <RectU up={0} v0={94} v1={162} h0={104} h1={164} fill="#ffffff" />
        <RectU up={0} v0={98} v1={158} h0={108} h1={160} fill={night ? NIGHT_GLASS : DAY_GLASS} stroke="none" />
        {night ? NIGHT_SKY : DAY_SKY}
        <RectU up={0} v0={126.5} v1={129.5} h0={108} h1={160} fill="#ffffff" stroke="none" />
        <Box u={0} v={90} du={7} dv={76} h0={100} h1={104} color="#d6c8f2" />
      </g>

      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG_RING.ru} rv={RUG_RING.rv} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 5" />
    </>
  )
}
```

The two old corner strokes (`<path d="M180 0 V180" …>` and the `#c4b4e6` polyline) are removed.

- [x] **Step 3: Size the sprigs and floor patterns from `ROOM_SIZE`**

`WallSprigs`: loop `u` from 20 while `u < ROOM_U - 10`, and `v` from 20 while `v < ROOM_V - 10`. Loop `h` from 30 while `h < WALL_HEIGHT - 5`. Skip a right-wall leaf when `v > WINDOW_GAP.v0 && v < WINDOW_GAP.v1 && h > WINDOW_GAP.h0`.

`FloorPattern`: boards run `for (let v = BOARD_STEP; v < ROOM_V; v += BOARD_STEP)` with points `[P(0, v), P(ROOM_U, v)]`. The grid draws `v`-lines for `k < ROOM_V` (`[P(0, k), P(ROOM_U, k)]`) and `u`-lines for `k < ROOM_U` (`[P(k, 0), P(k, ROOM_V)]`). The checker becomes:

```jsx
  if (floor.checker) {
    for (let a = 0; a * CHECKER_STEP < ROOM_U; a++) {
      for (let b = 0; b * CHECKER_STEP < ROOM_V; b++) {
        if ((a + b) % 2 === 0) continue
        const [u0, v0] = [a * CHECKER_STEP, b * CHECKER_STEP]
        const [u1, v1] = [Math.min(u0 + CHECKER_STEP, ROOM_U), Math.min(v0 + CHECKER_STEP, ROOM_V)]
        marks.push(<polygon key={`c${a}-${b}`} points={pts([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={floor.checker} />)
      }
    }
  }
```

### Task 8: Draw each decor spot in its shifted group ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomDecorLayers.jsx`

- [x] **Step 1: Wrap art + outline per spot**

Import `{ DECOR_SPOT_SHIFT, shiftTransform } from './roomLayout'`, and add a small component above `SpotOutline`:

```jsx
// MPP-39: a spot's art and dashed outline, slid to the spot's place in the bigger room (DECOR_SPOT_SHIFT).
function SpotLayer({ spot, placements, editing, selectedSpot }) {
  return (
    <g transform={shiftTransform(DECOR_SPOT_SHIFT[spot])}>
      {decorArt(placements?.[spot])}
      {editing && <SpotOutline spot={spot} placements={placements} selectedSpot={selectedSpot} />}
    </g>
  )
}
```

`WallDecor` returns `<SpotLayer spot={ROOM_SPOTS.LEFT_WALL} … />` and `<SpotLayer spot={ROOM_SPOTS.RIGHT_WALL} … />` (fragment). `FloorDecor` returns `<SpotLayer spot={ROOM_SPOTS.FLOOR} … />`. Each gets `placements`, `editing` and `selectedSpot` passed through. Add `MPP-39: each spot is drawn in its DECOR_SPOT_SHIFT group.` to the top comment.

### Task 9: `PetRoom` draws the world viewBox and shifted stations ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:5,18,106-117`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:26-37`

- [x] **Step 1: World viewBox and station groups**

Import `ROOM_WORLD_VIEWBOX` instead of `ROOM_VIEWBOX`. Add `STATION_SHIFT, shiftTransform` to the `./roomLayout` import. In the SVG use `viewBox={ROOM_WORLD_VIEWBOX}`, and wrap each station:

```jsx
            {ROOM_DRAW_ORDER.map(station => (
              <g key={station} transform={shiftTransform(STATION_SHIFT[station])}>
                <Station
                  station={station}
                  …same props as today…
                />
              </g>
            ))}
```

(The sleeping Pip, steam, plate and gauge are drawn inside `Station`, so they move with their station. The walker Pip uses world `PIP_HOME` / `PIP_COOKER_SPOT`.)

- [x] **Step 2: Interim scene shape**

In `PetRoom.css` `.pip-room-scene`, change `calc(100cqh * 360 / 330)` → `calc(100cqh * 564 / 394)` and `aspect-ratio: 360 / 330` → `aspect-ratio: 564 / 394`. (Task 13 replaces this block with the camera layer.)

### Task 10: Pin the new geometry in `room.check.mjs` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Update imports**

Add `STATION_SHIFT, DECOR_SPOT_SHIFT, WINDOW_SHIFT, shiftPx, pipFocusPoint` to the `./roomLayout.js` import. Add `ROOM_SIZE, ROOM_WORLD` to the `petRoom.js` import, plus `import { PIP_FOCUS_LIFT } from '../../../constants/petRoom.js'` in the same import.

- [x] **Step 2: Replace the "whole room fits the 0 0 360 330 viewBox" block and the viewBox bounds checks**

```js
// MPP-39: the bigger room (ROOM_SIZE) sits inside the world box the SVG and hit boxes are measured against.
const inWorld = ({ x, y, width = 0, height = 0 }) =>
  x >= ROOM_WORLD.x && y >= ROOM_WORLD.y && x + width <= ROOM_WORLD.x + ROOM_WORLD.width && y + height <= ROOM_WORLD.y + ROOM_WORLD.height
for (const u of [0, ROOM_SIZE.u]) for (const v of [0, ROOM_SIZE.v]) for (const h of [0, ROOM_SIZE.h]) {
  const [x, y] = P(u, v, h)
  assert.ok(inWorld({ x, y }), `room corner (${u}, ${v}, ${h}) is outside the world`)
}
assert.deepEqual([ROOM_SIZE.u, ROOM_SIZE.v, ROOM_SIZE.h], [260, 300, 150])

// MPP-39: a shift is one constant screen offset (P is linear).
near(shiftPx([30, 0]), [P(30, 0)[0] - 180, P(30, 0)[1] - 180])
near(shiftPx([0, 0, -30]), [0, 30])
assert.deepEqual(Object.keys(STATION_SHIFT).sort(), Object.keys(DEFAULT_ROOM_LEVELS).sort())

// MPP-39: every station, at every level and after its shift, stands on the floor and under the 150 wall.
const FOOTPRINTS = {
  bed: BED_FOOTPRINT, cooker: COOKER_FOOTPRINT, cabinet: CABINET_FOOTPRINT,
  fridge: FRIDGE_FOOTPRINT.map(([u, v, du, dv, h]) => [u, v, du, dv, 0, h])
}
for (const [station, table] of Object.entries(FOOTPRINTS)) {
  const [su, sv] = STATION_SHIFT[station]
  table.forEach(([u, v, du, dv, , h1], i) => {
    assert.ok(u + su >= 0 && u + du + su <= ROOM_SIZE.u, `${station} L${i + 1} leaves the floor along u`)
    assert.ok(v + sv >= -1 && v + dv + sv <= ROOM_SIZE.v, `${station} L${i + 1} leaves the floor along v`)
    assert.ok(h1 <= ROOM_SIZE.h, `${station} L${i + 1} pokes above the wall`)
  })
}

// MPP-39: the decor spots, after their shift, sit on the floor / under the wall top.
for (const spot of DECOR_SPOTS) {
  const [u, v, du, dv, , h1] = DECOR_SPOT_SHAPES[spot].volume
  const [su, sv, sh] = DECOR_SPOT_SHIFT[spot]
  assert.ok(u + su >= 0 && u + du + su <= ROOM_SIZE.u && v + sv >= 0 && v + dv + sv <= ROOM_SIZE.v, `${spot} leaves the room`)
  assert.ok(h1 + sh <= ROOM_SIZE.h, `${spot} pokes above the wall`)
}
assert.ok(164 + WINDOW_SHIFT[2] <= ROOM_SIZE.h && 162 + WINDOW_SHIFT[1] <= ROOM_SIZE.v, 'the window leaves the right wall')
```

(`v + sv >= -1`: the level-1 fridge lid sits at `v = −1` against the wall, as today.)

- [x] **Step 3: Shift the fridge, cabinet and decor-spot assertions**

- In the fridge loop, replace the `box.x >= 0 … <= 330` bounds assertion with `assert.ok(inWorld(box), \`level ${level} fridge box leaves the world\`)`. Add `const [fu, fv] = STATION_SHIFT.fridge` and use `P(gu + fu, gv + fv, gh + FRIDGE_GAUGE_LIFT)` and `P(u + du / 2 + fu, v + dv / 2 + fv)`.
- In the cabinet loop, do the same with `inWorld(box)` and `const [cu, cv] = STATION_SHIFT.cabinet`, adding `cu`/`cv` to both `P(...)` probes.
- In the decor-spot map, replace the bounds assertion with `inWorld(box)`. Probe the shifted outline: `corners.forEach(([u, v, h]) => assert.ok(inside(P(u + su, v + sv, h + sh)), …))` and the same for `plus`, where `const [su, sv, sh] = DECOR_SPOT_SHIFT[spot]`.
- Replace the `hitBoxStyle` expectation with:

```js
assert.deepEqual(
  hitBoxStyle({ x: ROOM_WORLD.x + 56.4, y: ROOM_WORLD.y + 39.4, width: 112.8, height: 78.8 }),
  { left: '10.00%', top: '10.00%', width: '20.00%', height: '20.00%' }
)
```

- [x] **Step 4: White default and the focus point**

Under the "defaults exist" assertions add:

```js
// MPP-39: White is the default wall (back wall pure white, side wall grey-white); every wall style has a skirting.
assert.equal(DEFAULT_WALL_STYLE, 'wall-white')
assert.deepEqual([ROOM_STYLES['wall-white'].right, ROOM_STYLES['wall-white'].left], ['#ffffff', '#eceef2'])
assert.ok(ROOM_STYLES['wall-lavender'], 'Lavender stays available')
for (const [id, style] of Object.entries(ROOM_STYLES)) {
  if (style.spot === 'wallStyle') assert.match(style.skirting ?? '', /^#[0-9a-f]{6}$/, `${id} has no skirting`)
}
assert.equal(DEFAULT_FLOOR_STYLE, 'floor-lilac')

// MPP-39 AC 8 / AC 14: the camera aims a little above Pip's feet at his current spot.
const lifted = ([x, y]) => [x, y - PIP_FOCUS_LIFT]
near(pipFocusPoint('rug', null, undefined), lifted(P(...PIP_HOME)))
near(pipFocusPoint('rug', 'walking', undefined), lifted(P(...PIP_COOKER_SPOT)))
near(pipFocusPoint('rug', 'returning', undefined), lifted(P(...PIP_HOME)))
near(pipFocusPoint('cooker', null, undefined), lifted(P(...PIP_COOKER_SPOT)))
const [bu, bv, bh] = STATION_ANCHORS.bedTop[1]
near(pipFocusPoint('bed', null, { bed: 2 }), lifted(P(bu + STATION_SHIFT.bed[0], bv + STATION_SHIFT.bed[1], bh)))
```

Replace the existing `withPlacement(room, 'wallStyle', null)` assertion's expected value only if it is a literal. It uses `DEFAULT_WALL_STYLE`, so it stays.

- [x] **Step 5: Run the room checks**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: `room checks passed`.

- [x] **Step 6: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. `Select-String -Path foodbytes-app\client\src -Pattern "ROOM_VIEWBOX" -Recurse` style check: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String "ROOM_VIEWBOX\b|ROOM_VIEWBOX_SIZE"` → zero hits.

---

## Phase 3 — The camera

The fitted room becomes a world layer inside a screen-sized stage, with a camera that pans, rubber-bands, floats back to Pip, follows him, zooms and remembers the zoom. The pure maths lands and is checked first, then the store, then the hook, then the wiring. The build stays green after each task, because nothing imports the new modules until Task 14.

### Task 11: Camera and zoom constants ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js`

- [x] **Step 1: Add under `ROOM_WORLD_VIEWBOX`, and replace `ROOM_HINT`**

```js
// MPP-39: the camera (pip-room-zoom-mockup.html). 2 screen px per room unit ≈ 2× today's phone size.
export const ROOM_PX_PER_UNIT = 2
export const ROOM_ZOOM = { MIN: 0.35, MAX: 2.2, DEFAULT: 1, STEP: 1.2, WHEEL_RATE: 0.0012, EASE: 0.25, SNAP: 0.002 }
export const ROOM_CAMERA = {
  FREE_PAD: 60, // the free area runs this far past the room on every side (AC 11)
  OVERSCROLL: 120, // past it, the rubber band gives at most this much more
  STRETCH: 0.55, // how stiff the band is (lower = stiffer)
  FOLLOW: 0.22, // share of the gap closed per frame while dragging (AC 10)
  SETTLE_MS: 2000, // the float back to Pip (AC 12)
  SETTLED: 0.15, // world px: close enough to stop chasing
  TAP_SLOP_PX: 6, // a press that moves less than this is a tap (AC 9)
  KEY_STEP: 24, // world px per arrow-key press (AC 17)
  WALL_TOP_PAD: 20 // how far above the wall tops the camera may look
}
export const ROOM_ZOOM_STORAGE_KEY = 'pip-room-zoom'
export const ROOM_RECENTRE_LABEL = 'Centre on Pip'
export const ROOM_CAMERA_LABEL = "Pip's room. Drag, or use the arrow keys, to look around. Plus and minus zoom, 0 resets."
```

Change `ROOM_HINT` to `'Drag to look around · tap the fridge 🧊 or cabinet 🏆' // MPP-23 / MPP-39`. `PIP_FOCUS_LIFT` was already added in Task 5.

### Task 12: Pure camera maths and the zoom store, with their checks ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/roomCamera.js`
- Create: `foodbytes-app/client/src/utils/roomZoomStore.js`
- Create: `foodbytes-app/client/src/utils/roomCamera.check.mjs`
- Modify: `foodbytes-app/client/package.json` (scripts)

- [x] **Step 1: Write `roomCamera.js`**

```js
import { P } from '../components/pet/room/iso.js'
import { ROOM_CAMERA, ROOM_PX_PER_UNIT, ROOM_SIZE, ROOM_WORLD, ROOM_ZOOM } from '../constants/petRoom.js'

/**
 * MPP-39: the room camera's maths, pure so roomCamera.check.mjs can pin it (ported from
 * pip-room-zoom-mockup.html). The camera is a centre (cx, cy) in world px plus a zoom multiplier
 * on ROOM_PX_PER_UNIT; usePipCamera owns the motion.
 */

/** A zoom inside [MIN, MAX]; anything non-numeric is the default 1×. */
export function clampZoom(zoom) {
  if (!Number.isFinite(zoom) || zoom <= 0) return ROOM_ZOOM.DEFAULT
  return Math.min(ROOM_ZOOM.MAX, Math.max(ROOM_ZOOM.MIN, zoom))
}

/** AC 11: how far a pull of `over` px past an edge moves — nearly 1:1 at first, never past OVERSCROLL. */
export function rubber(over) {
  const { OVERSCROLL, STRETCH } = ROOM_CAMERA
  return (1 - 1 / ((over * STRETCH) / OVERSCROLL + 1)) * OVERSCROLL
}

// The range a view `size` wide may centre in, inside [lo, hi]; the midpoint when the view is wider.
function centreRange(size, lo, hi) {
  if (hi - lo <= size) return [(lo + hi) / 2, (lo + hi) / 2]
  return [lo + size / 2, hi - size / 2]
}

/** A hard clamp of the centre — used to aim at Pip. */
export function fitAxis(c, size, lo, hi) {
  const [min, max] = centreRange(size, lo, hi)
  return Math.min(Math.max(c, min), max)
}

/** The same range, but damped past it instead of stopped — used while dragging or holding a key. */
export function rubberAxis(c, size, lo, hi) {
  const [min, max] = centreRange(size, lo, hi)
  if (c < min) return min - rubber(min - c)
  if (c > max) return max + rubber(c - max)
  return c
}

/** AC 12: cubic ease in and out. */
export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** AC 11: the free area — the room (floor up to a little above the walls) plus FREE_PAD all round. */
export function cameraBounds() {
  const xs = []
  const ys = []
  for (const u of [0, ROOM_SIZE.u]) {
    for (const v of [0, ROOM_SIZE.v]) {
      for (const h of [0, ROOM_SIZE.h + ROOM_CAMERA.WALL_TOP_PAD]) {
        const [x, y] = P(u, v, h)
        xs.push(x)
        ys.push(y)
      }
    }
  }
  const pad = ROOM_CAMERA.FREE_PAD
  return { minX: Math.min(...xs) - pad, maxX: Math.max(...xs) + pad, minY: Math.min(...ys) - pad, maxY: Math.max(...ys) + pad }
}

/** How much world a stage of stageW × stageH screen px shows at a zoom, in world px. */
export function viewSize(stageW, stageH, zoom) {
  const k = ROOM_PX_PER_UNIT * zoom
  return [stageW / k, stageH / k]
}

/** The world layer's CSS transform that puts world point (cx, cy) in the middle of the stage. */
export function worldTransform(cx, cy, zoom, stageW, stageH) {
  const k = ROOM_PX_PER_UNIT * zoom
  const tx = stageW / 2 - (cx - ROOM_WORLD.x) * k
  const ty = stageH / 2 - (cy - ROOM_WORLD.y) * k
  return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${zoom.toFixed(4)})`
}
```

(`scale(zoom)` multiplies the world element, which is already sized at `ROOM_PX_PER_UNIT` px per unit. See Task 13.)

- [x] **Step 2: Write `roomZoomStore.js`**

```js
import { ROOM_ZOOM, ROOM_ZOOM_STORAGE_KEY } from '../constants/petRoom.js'
import { clampZoom } from './roomCamera.js'

/**
 * MPP-39 AC 16: the room's zoom, remembered in this browser only. Blocked, empty or junk storage
 * opens at 1× with no error; a failed write still zooms for this visit.
 */
export function readRoomZoom() {
  try {
    const raw = localStorage.getItem(ROOM_ZOOM_STORAGE_KEY)
    return raw === null ? ROOM_ZOOM.DEFAULT : clampZoom(Number(raw))
  } catch {
    return ROOM_ZOOM.DEFAULT
  }
}

export function writeRoomZoom(zoom) {
  try {
    localStorage.setItem(ROOM_ZOOM_STORAGE_KEY, String(zoom))
  } catch {
    // Storage disabled or full: the zoom still applies until the page is closed.
  }
}
```

- [x] **Step 3: Write `roomCamera.check.mjs`**

```js
// Run: npm run check:camera   (from foodbytes-app/client)
// MPP-39: the room camera's pure maths and the zoom store. There is no test runner; mirrors room.check.mjs.
import assert from 'node:assert/strict'
import { P } from '../components/pet/room/iso.js'
import { ROOM_CAMERA, ROOM_SIZE, ROOM_WORLD, ROOM_ZOOM, ROOM_ZOOM_STORAGE_KEY } from '../constants/petRoom.js'
import { cameraBounds, clampZoom, easeInOut, fitAxis, rubber, rubberAxis, viewSize, worldTransform } from './roomCamera.js'
import { readRoomZoom, writeRoomZoom } from './roomZoomStore.js'

// AC 15: zoom runs 0.35×–2.2×; junk is 1×.
assert.equal(clampZoom(0.1), 0.35)
assert.equal(clampZoom(9), 2.2)
assert.equal(clampZoom(1.3), 1.3)
for (const junk of [Number.NaN, 0, -2, Infinity]) assert.equal(clampZoom(junk), 1)

// AC 11: the rubber band starts nearly free, stiffens, and never passes OVERSCROLL.
assert.equal(rubber(0), 0)
assert.ok(rubber(10) > 5 && rubber(10) < 10)
assert.ok(rubber(400) > rubber(200) && rubber(200) > rubber(100))
assert.ok(rubber(1e9) < ROOM_CAMERA.OVERSCROLL && rubber(1e9) > ROOM_CAMERA.OVERSCROLL - 1)

// Inside the range a drag is 1:1; past it, damped; a view wider than the range centres.
assert.equal(rubberAxis(50, 20, 0, 100), 50)
assert.equal(rubberAxis(120, 20, 0, 100), 90 + rubber(30))
assert.equal(rubberAxis(-30, 20, 0, 100), 10 - rubber(40))
assert.equal(fitAxis(120, 20, 0, 100), 90)
assert.equal(fitAxis(-5, 20, 0, 100), 10)
assert.equal(fitAxis(7, 300, 0, 100), 50)

// AC 12: ease in-out ends where it should and never goes backwards.
assert.equal(easeInOut(0), 0)
assert.equal(easeInOut(0.5), 0.5)
assert.equal(easeInOut(1), 1)
for (let t = 0.05; t <= 1; t += 0.05) assert.ok(easeInOut(t) >= easeInOut(t - 0.05))

// AC 11: the free area is the room plus FREE_PAD on every side.
const b = cameraBounds()
const [, topY] = P(0, 0, ROOM_SIZE.h + ROOM_CAMERA.WALL_TOP_PAD)
assert.equal(b.minY, topY - ROOM_CAMERA.FREE_PAD)
assert.equal(b.maxY, P(ROOM_SIZE.u, ROOM_SIZE.v)[1] + ROOM_CAMERA.FREE_PAD)
assert.equal(b.minX, P(ROOM_SIZE.u, 0)[0] - ROOM_CAMERA.FREE_PAD)
assert.equal(b.maxX, P(0, ROOM_SIZE.v)[0] + ROOM_CAMERA.FREE_PAD)

// AC 7: 2 screen px per unit at 1×, so a 400 × 300 stage shows 200 × 150 world px.
assert.deepEqual(viewSize(400, 300, 1), [200, 150])
assert.deepEqual(viewSize(400, 300, 2), [100, 75])

// The world origin lands in the middle of the stage; zoom scales the layer.
assert.equal(worldTransform(ROOM_WORLD.x, ROOM_WORLD.y, 1, 400, 300), 'translate3d(200.0px, 150.0px, 0) scale(1.0000)')
assert.equal(worldTransform(ROOM_WORLD.x + 10, ROOM_WORLD.y, 0.5, 400, 300), 'translate3d(190.0px, 150.0px, 0) scale(0.5000)')

// AC 16: no storage (node) → 1×, no throw; a saved zoom is read back and clamped.
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(1.5) // no localStorage here: must not throw
const memory = new Map()
globalThis.localStorage = { getItem: k => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => memory.set(k, v) }
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(1.5)
assert.equal(memory.get(ROOM_ZOOM_STORAGE_KEY), '1.5')
assert.equal(readRoomZoom(), 1.5)
memory.set(ROOM_ZOOM_STORAGE_KEY, '40')
assert.equal(readRoomZoom(), ROOM_ZOOM.MAX)
memory.set(ROOM_ZOOM_STORAGE_KEY, 'huge')
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
globalThis.localStorage = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(2)
delete globalThis.localStorage

console.log('camera checks passed')
```

- [x] **Step 4: Add the script and run it**

In `package.json` `scripts`, after `"check:room"`, add `"check:camera": "node src/utils/roomCamera.check.mjs",`.

Run: `cd foodbytes-app\client; npm run check:camera`
Expected: `camera checks passed`.

### Task 13: `usePipCamera` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePipCamera.js`

- [x] **Step 1: Write the hook**

```js
import { useLayoutEffect, useRef } from 'react'
import { ROOM_CAMERA, ROOM_PX_PER_UNIT, ROOM_ZOOM } from '../constants/petRoom'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { cameraBounds, clampZoom, easeInOut, fitAxis, rubberAxis, viewSize, worldTransform } from '../utils/roomCamera'
import { readRoomZoom, writeRoomZoom } from '../utils/roomZoomStore'

const KEY_PAN = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
const KEY_ZOOM = { '+': ROOM_ZOOM.STEP, '=': ROOM_ZOOM.STEP, '-': 1 / ROOM_ZOOM.STEP, _: 1 / ROOM_ZOOM.STEP }

/**
 * MPP-39: the camera over Pip's room. `stageRef` is the screen-sized viewport, `worldRef` the layer
 * holding the SVG and the tap areas, `focus` Pip's [x, y] in world px (roomLayout.pipFocusPoint).
 * Motion lives in refs and writes one CSS transform per frame, so it never re-renders PetRoom.
 * Drag pans with a trail (AC 9–10), past the room it rubber-bands (AC 11), on release it floats back
 * to Pip over 2 s (AC 12–13) and it follows Pip when he moves (AC 14). Pinch, Ctrl+wheel and
 * + / − / 0 zoom around Pip (AC 15) and the zoom is remembered (AC 16). Arrow keys pan (AC 17).
 * Reduced motion jumps straight to the target (AC 19).
 * @returns {{ recentre: () => void }}
 */
function usePipCamera({ stageRef, worldRef, focus }) {
  const cameraRef = useRef(null)
  if (cameraRef.current === null) cameraRef.current = createCamera(readRoomZoom())
  const camera = cameraRef.current
  const [focusX, focusY] = focus

  // Layout effects, in order: attach before the first paint (no flash at the origin), then aim.
  useLayoutEffect(() => camera.attach(stageRef.current, worldRef.current), [camera, stageRef, worldRef])
  useLayoutEffect(() => camera.setFocus(focusX, focusY), [camera, focusX, focusY])

  return { recentre: camera.recentre }
}

// The camera's state and motion — plain JS, so a frame is a ref write, not a render.
function createCamera(initialZoom) {
  const s = {
    x: null, y: null, tx: 0, ty: 0, zoom: initialZoom, zoomTarget: initialZoom,
    focus: null, pip: true, from: null, t0: 0, frame: 0, stage: null, world: null, w: 0, h: 0
  }

  const clampTo = (axis, x, y) => {
    const [vw, vh] = viewSize(s.w, s.h, s.zoom)
    const b = cameraBounds()
    return [axis(x, vw, b.minX, b.maxX), axis(y, vh, b.minY, b.maxY)]
  }
  const aim = () => clampTo(fitAxis, ...s.focus)
  const paint = () => {
    if (s.world && s.w > 0 && s.x !== null) s.world.style.transform = worldTransform(s.x, s.y, s.zoom, s.w, s.h)
  }
  const moving = on => s.stage?.classList.toggle('is-moving', on)

  const step = () => {
    const reduced = prefersReducedMotion()
    s.zoom = reduced ? s.zoomTarget : s.zoom + (s.zoomTarget - s.zoom) * ROOM_ZOOM.EASE
    if (Math.abs(s.zoomTarget - s.zoom) < ROOM_ZOOM.SNAP) s.zoom = s.zoomTarget
    if (s.pip) [s.tx, s.ty] = aim()
    let done
    if (s.pip && s.from) {
      const t = Math.min(1, (performance.now() - s.t0) / ROOM_CAMERA.SETTLE_MS)
      const e = easeInOut(t)
      s.x = s.from[0] + (s.tx - s.from[0]) * e
      s.y = s.from[1] + (s.ty - s.from[1]) * e
      done = reduced || (t >= 1 && s.zoom === s.zoomTarget)
    } else {
      const dx = s.tx - s.x
      const dy = s.ty - s.y
      done = reduced || (Math.hypot(dx, dy) < ROOM_CAMERA.SETTLED && s.zoom === s.zoomTarget)
      s.x += dx * ROOM_CAMERA.FOLLOW
      s.y += dy * ROOM_CAMERA.FOLLOW
    }
    if (done) {
      ;[s.x, s.y, s.zoom, s.from, s.frame] = [s.tx, s.ty, s.zoomTarget, null, 0]
      moving(false)
    } else {
      s.frame = requestAnimationFrame(step)
    }
    paint()
  }
  const chase = () => {
    if (!s.stage || s.x === null) return
    cancelAnimationFrame(s.frame)
    moving(true)
    s.frame = requestAnimationFrame(step)
  }
  // AC 12–14 / AC 18: float back to Pip; a float already running keeps its clock.
  const floatHome = () => {
    s.pip = true
    if (!s.from && s.x !== null) {
      s.from = [s.x, s.y]
      s.t0 = performance.now()
    }
    chase()
  }
  // A drag or key target: rubber-banded, trailed, not Pip.
  const pullTo = (x, y) => {
    ;[s.tx, s.ty] = clampTo(rubberAxis, x, y)
    s.pip = false
    s.from = null
    chase()
  }
  const setZoom = zoom => {
    s.zoomTarget = clampZoom(zoom)
    writeRoomZoom(s.zoomTarget)
  }
  const place = () => {
    if (!s.focus || s.w === 0) return
    ;[s.x, s.y] = aim()
    ;[s.tx, s.ty] = [s.x, s.y]
    paint()
  }

  return {
    recentre: floatHome,
    setFocus(x, y) {
      s.focus = [x, y]
      if (s.x === null) place()
      else if (s.pip) floatHome()
    },
    attach(stage, world) {
      if (!stage || !world) return undefined
      s.stage = stage
      s.world = world
      const measure = () => {
        s.w = stage.clientWidth
        s.h = stage.clientHeight
        if (s.x === null) place()
        else if (s.pip) chase()
        else paint()
      }
      measure()
      const detach = wireInput(stage, s, { pullTo, floatHome, setZoom, chase })
      const observer = new ResizeObserver(measure)
      observer.observe(stage)
      return () => {
        detach()
        observer.disconnect()
        cancelAnimationFrame(s.frame)
        s.stage = null
        s.world = null
      }
    }
  }
}

// AC 9 / 15 / 17: pointer drag + pinch, Ctrl+wheel and keys on the stage. Returns the detach.
function wireInput(stage, s, { pullTo, floatHome, setZoom, chase }) {
  const pointers = new Map()
  let drag = null
  let pinch = null
  let keyRaw = null
  let swallow = false
  let unswallow = 0
  const spread = () => {
    const [a, b] = [...pointers.values()]
    return Math.hypot(a[0] - b[0], a[1] - b[1])
  }
  const endGesture = () => {
    swallow = true
    clearTimeout(unswallow)
    unswallow = setTimeout(() => { swallow = false }, 0) // only the click from this release
    stage.classList.remove('is-dragging')
    floatHome()
  }

  const onDown = e => {
    if (e.button > 0 || e.target.closest?.('.pip-room-recentre')) return
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    if (pointers.size === 2) {
      drag = null
      pinch = { dist: spread(), zoom: s.zoomTarget }
    } else if (pointers.size === 1) {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: s.x, cy: s.y, moved: false }
    }
  }
  const onMove = e => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    if (pinch) {
      if (pinch.dist > 0) setZoom(pinch.zoom * (spread() / pinch.dist))
      floatHome()
      return
    }
    if (!drag || e.pointerId !== drag.id || s.x === null) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < ROOM_CAMERA.TAP_SLOP_PX) return
    if (!drag.moved) {
      drag.moved = true
      stage.setPointerCapture(e.pointerId)
      stage.classList.add('is-dragging')
    }
    const k = ROOM_PX_PER_UNIT * s.zoom
    pullTo(drag.cx - dx / k, drag.cy - dy / k)
  }
  const onUp = e => {
    pointers.delete(e.pointerId)
    if (pinch) {
      if (pointers.size < 2) {
        pinch = null
        drag = null
        endGesture()
      }
      return
    }
    if (!drag || e.pointerId !== drag.id) return
    const moved = drag.moved
    drag = null
    if (moved) endGesture()
  }
  const onClick = e => {
    if (!swallow) return
    e.preventDefault()
    e.stopPropagation()
    swallow = false
  }
  const onWheel = e => {
    if (!e.ctrlKey) return // a plain wheel scrolls the page
    e.preventDefault()
    setZoom(s.zoomTarget * Math.exp(-e.deltaY * ROOM_ZOOM.WHEEL_RATE))
    if (drag?.moved) chase()
    else floatHome()
  }
  const onKeyDown = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || s.x === null) return
    const pan = KEY_PAN[e.key]
    if (pan) {
      e.preventDefault()
      keyRaw = keyRaw ?? [s.x, s.y]
      keyRaw = [keyRaw[0] + pan[0] * ROOM_CAMERA.KEY_STEP, keyRaw[1] + pan[1] * ROOM_CAMERA.KEY_STEP]
      pullTo(...keyRaw)
      return
    }
    const factor = KEY_ZOOM[e.key]
    if (!factor && e.key !== '0') return
    e.preventDefault()
    setZoom(factor ? s.zoomTarget * factor : ROOM_ZOOM.DEFAULT)
    floatHome()
  }
  const onKeyUp = e => {
    if (!KEY_PAN[e.key]) return
    keyRaw = null
    floatHome()
  }

  const listeners = [
    ['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['pointercancel', onUp],
    ['keydown', onKeyDown], ['keyup', onKeyUp]
  ]
  listeners.forEach(([type, fn]) => stage.addEventListener(type, fn))
  stage.addEventListener('click', onClick, true)
  stage.addEventListener('wheel', onWheel, { passive: false })
  return () => {
    listeners.forEach(([type, fn]) => stage.removeEventListener(type, fn))
    stage.removeEventListener('click', onClick, true)
    stage.removeEventListener('wheel', onWheel)
    clearTimeout(unswallow)
  }
}

export default usePipCamera
```

- [x] **Step 2: Measure it**

Run: `(Get-Content foodbytes-app\client\src\hooks\usePipCamera.js | Measure-Object -Line).Lines`
Expected: under 400 (about 250). Over 400 is blocking: move `wireInput` to `hooks/pipCameraInput.js`.

### Task 14: Put the room on the camera in `PetRoom` + the 🎯 button ✓ (step 5 manual check pending — developer at Ready for Test)

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/RecentreButton.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:1-37,85-100,207-216`

- [x] **Step 1: Write `RecentreButton.jsx`**

```jsx
import { ROOM_RECENTRE_LABEL } from '../../../constants/petRoom'

/** MPP-39 AC 18: floats the camera back to Pip — bottom right of the room, fixed to the screen. */
function RecentreButton({ onRecentre }) {
  return (
    <button type="button" className="pip-room-recentre" aria-label={ROOM_RECENTRE_LABEL} onClick={onRecentre}>
      <span aria-hidden="true">🎯</span>
    </button>
  )
}

export default RecentreButton
```

- [x] **Step 2: Restructure the stage in `PetRoom.jsx`**

Imports: add `usePipCamera from '../../../hooks/usePipCamera'` and `RecentreButton from './RecentreButton'`. Add `ROOM_CAMERA_LABEL, ROOM_PX_PER_UNIT, ROOM_WORLD` to the `petRoom` constants import, and `pipFocusPoint` to the `./roomLayout` import.

In the component body, after `const editButtonRef = useRef(null)`:

```jsx
  // MPP-39: the camera looks at the world layer and follows Pip's spot.
  const stageRef = useRef(null)
  const worldRef = useRef(null)
  const camera = usePipCamera({ stageRef, worldRef, focus: pipFocusPoint(position, phase, levels) })
```

Replace the whole `<div className="pip-room-stage">…</div>` block with:

```jsx
      {/* MPP-39: the stage is the screen-sized, focusable viewport; the world layer inside holds the
          room SVG and its tap areas and is moved by the camera. Bubble, hint and 🎯 stay on the screen. */}
      <div
        ref={stageRef}
        className={editing ? 'pip-room-stage is-editing' : 'pip-room-stage'}
        tabIndex={anyOpen ? -1 : 0}
        role="group"
        aria-label={ROOM_CAMERA_LABEL}
        {...behind}
      >
        <div
          ref={worldRef}
          className="pip-room-world"
          style={{ width: `${ROOM_WORLD.width * ROOM_PX_PER_UNIT}px`, height: `${ROOM_WORLD.height * ROOM_PX_PER_UNIT}px` }}
        >
          <svg className="pip-room-svg" viewBox={ROOM_WORLD_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
            …the SVG children exactly as after Task 9…
          </svg>
          <StationButton box={fridgeHitBox(resolved.fridge)} … />  {/* unchanged props */}
          <StationButton box={cabinetHitBox(resolved.cabinet)} … />
          {editing && <DecorSpotButtons placements={placements} onSpot={openPicker} />}
        </div>
        {levelBar && <PipHeadBarStatus levelBar={levelBar} />}
        <SpeechBubble text={bubble} actions={bubbleActions} />
        <p className="pip-room-hint" aria-hidden="true">{ROOM_HINT}</p>
        <RecentreButton onRecentre={camera.recentre} />
      </div>
```

The `.pip-room-scene` wrapper is gone. Update the component Javadoc's `MPP-37:` line to mention the stage only. Add: ` * MPP-39: the room is a bigger world on a camera (usePipCamera) — drag, pinch, Ctrl+wheel or keys to look around; it floats back to Pip and follows him. Stations and decor spots are shifted groups (roomLayout STATION_SHIFT / DECOR_SPOT_SHIFT).`

`phase` and `levels` are already in scope (`const phase = serving?.phase ?? null`, the `levels` prop).

- [x] **Step 3: CSS for stage, world and 🎯**

In `PetRoom.css`, update the top comment to `MPP-39: the stage is a camera viewport over a bigger world layer (usePipCamera).`. Change `.pip-room` background `#ece5fb` → `#f3f1f8` (the area outside the room). Replace the `.pip-room-stage`, `.pip-room-scene` and `.pip-room-svg` rules with:

```css
.pip-room-stage {
  /* Zero basis + height 0: see MPP-37 — the stage takes the height flex gives it. */
  flex: 1 1 0;
  height: 0;
  min-height: 30vh;
  position: relative;
  overflow: hidden;
  /* MPP-39: drag and pinch belong to the camera, not page scroll or browser zoom. */
  touch-action: none;
  cursor: grab;
  outline: none;
}

.pip-room-stage.is-dragging { cursor: grabbing; }

.pip-room-stage:focus-visible {
  box-shadow: inset 0 0 0 3px var(--pip-focus-ring);
}

/* MPP-39: the world layer — sized in px at ROOM_PX_PER_UNIT inline, moved by the camera's transform. */
.pip-room-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  z-index: 0;
}

/* Only promote the layer while it moves, so at rest it re-rasterises sharp at any zoom. */
.pip-room-stage.is-moving .pip-room-world { will-change: transform; }

.pip-room-svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* MPP-39 AC 18: 🎯 bottom right, fixed to the screen. */
.pip-room-recentre {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 1;
  min-width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  font-size: 1.2rem;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-room-recentre:active { background: #fff3c4; }

@media (hover: hover) {
  .pip-room-recentre:hover { background: #fff; }
}

.pip-room-recentre:focus-visible {
  outline: 3px solid var(--pip-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--pip-focus-halo);
}
```

Remove `min-width: 44px; min-height: 44px;` from `.pip-station-btn` and `.pip-decor-spot-btn`, and change their comment to `on the world layer, scaled with the art (MPP-39: no min size — it would outgrow the art when zoomed out)`. Add `z-index: 1` to `.pip-room-hint` if it has none. Change `.pip-room-scene.is-editing .pet-bubble, .pip-room-scene.is-editing .pip-room-hint` to `.pip-room-stage.is-editing .pet-bubble, .pip-room-stage.is-editing .pip-room-hint`.

- [x] **Step 4: Measure, check, build**

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: under 400.

Run: `cd foodbytes-app\client; npm run check:room; npm run check:camera; npm run build`
Expected: `room checks passed`, `camera checks passed`, `built in <n>s` with no errors.

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String "pip-room-scene"`
Expected: zero hits.

- [ ] **Step 5 (developer, pending): Manual check at `/pet` (dev server, phone width 390 × 844 in DevTools, then desktop)**

Start the backend and `npm run dev`, then open `http://localhost:5173/pet`. Confirm each of these:
1. The room fills the space between Pip's header and the Shop / Edit room / Wardrobe row, drawn about twice today's size, with Pip centred a little above his feet. The walls are white (back pure white, side grey-white), the floor lilac, and the skirting and corner lines are visible (AC 2–5, 7–8).
2. Drag: the room trails the pointer. Past the walls it resists and stops about 120 units out. On release it glides back to Pip in about 2 s. Grabbing it mid-glide doesn't jump (AC 9–13).
3. Tap the fridge and the cabinet: they open. Drag starting on the fridge: it does not open (AC 9).
4. Ctrl + wheel zooms, and a plain wheel does nothing to the room. In DevTools touch emulation, Shift-drag pinch zooms. Reload: the zoom is kept. Then run `localStorage.removeItem('pip-room-zoom')` in the console and reload: 1× (AC 15–16).
5. Tab to the room: `+`, `−` and `0` zoom; arrows pan and float back on release. Press 🎯 after a drag: it floats to Pip (AC 17–18).
6. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: drag and release jump with no glide (AC 19).
7. ✏️ Edit room: the three dashed spots sit on the left wall near the corner, on the right wall past the window, and on the floor front-left of the rug. Their buttons line up at 0.35×, 1× and 2.2× zoom (AC 20). Pick Lavender from the chips: the walls turn lavender and stay lavender after a reload (AC 6).
8. Eat a meal → the cook scene: the camera follows Pip to the cooker and back (AC 14). At bedtime (or with the meal time moved), the camera is on the bed.
9. Upgrade cooker to L4 (or temporarily set levels in React DevTools): the hood is under the wall top. Fridge, bed and cabinet L4 sit on the floor along their walls.

Write down any position that looks wrong (the shift values in `roomLayout.js`) for the PR description, rather than retuning in this task.

---

## Phase 4 — Final verification

The closing phase. No production changes beyond the version bump. These steps only sanity-check that the cumulative work is clean.

### Task 15 (M.1): Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-39 is a **Story**, so bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-39: Pip's room is bigger and zoomed in: drag or pinch to look around, it floats back to Pip and follows him, zoom remembered in this browser; white walls by default (Lavender stays free), skirting and corner lines`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 16 (M.2): Grep for stale references ✓

- Skill: none — read-only audit

- [x] **Step 1: No old viewBox, old scene or lavender-as-default remains**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs,*.css | Select-String "ROOM_VIEWBOX\b|ROOM_VIEWBOX_SIZE|pip-room-scene|WALL_LENGTH"`
Expected: zero hits.

Run: `Get-ChildItem foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String '"wall-lavender", WALL_STYLE, 0, true|defaultFor\(RoomSpot.WALL_STYLE\)\)\.isEqualTo\("wall-lavender"'`
Expected: zero hits.

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String "console\.(log|debug)"`
Expected: no hits in any file this contract created or touched.

### Task 17 (M.3): Run every client check and the full backend suite ✓

- Skill: none — verification only

- [x] **Step 1: Client checks**

Run: `cd foodbytes-app\client; npm run check:room; npm run check:camera; npm run check:pip; npm run check:cook; npm run check:wardrobe`
Expected: each prints its `… checks passed` line.

- [x] **Step 2: Clean backend test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 18 (M.4): Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 19 (M.5): Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-39-pip-room-zoom-camera/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change, and the new version from Task 15.
- Migrations: **none.** No room stores a wall style (0 rows locally and on Railway), so the White default applies through `DecorCatalogue.defaultFor`. Nothing goes into `mpp15-railway-golive.sql`.
- Verification results from Tasks 10, 12, 14 (the manual checklist, with any position that looked off), 17 and 18.
- A note for future contributors. Room art keeps its MPP-16 coordinates: a station or decor spot is placed in the bigger room by `STATION_SHIFT` / `DECOR_SPOT_SHIFT` (an SVG translate), and the room's tap areas must use the shifted `*HitBox` functions with `hitBoxStyle` (% of `ROOM_WORLD`).
- Suggested commit subject: `MPP-39: Pip's room on a zoomable camera that floats back to Pip; white walls by default`.

---

## Self-review

**Spec coverage:**
- Bigger, lower room and furniture spread (AC 1–2): Tasks 4, 5, 6, 7, 9, 10.
- White default, Lavender free and owned, floors unchanged (AC 3–4, 6): Tasks 1, 2, 3, 4, 10 (the client default and checks), 14 step 5.7.
- Skirting and corner lines (AC 5): Task 7.
- Camera zoomed-in default, opens on Pip (AC 7–8): Tasks 11, 12, 13, 14.
- Drag, tap slop, trail, rubber band, 2 s float, grab mid-float, follow Pip (AC 9–14): Tasks 12, 13, 14 (focus from `pipFocusPoint`, Task 5).
- Pinch, Ctrl+wheel, range, ease, stays on Pip; zoom saved in the browser (AC 15–16): Tasks 12, 13.
- Keyboard, 🎯, reduced motion (AC 17–19): Tasks 13, 14.
- Screen-fixed bubble and hint; aligned tap areas at every zoom (AC 20): Task 14 (world layer, `hitBoxStyle` on `ROOM_WORLD`), Task 10 (shifted hit-box checks).
- Version bump (AC 21): Task 15.
- Updated room checks and backend tests named on the ticket: Tasks 1–3, 10.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a `Run:` / `Expected:` pair. The one prose-only step (Task 14 step 5) is an explicit manual checklist with routes, viewports and expected outcomes, because the frontend has no test runner.

**Type / name consistency:** `ROOM_SIZE`, `ROOM_WORLD`, `ROOM_WORLD_VIEWBOX`, `ROOM_PX_PER_UNIT`, `ROOM_ZOOM`, `ROOM_CAMERA`, `ROOM_ZOOM_STORAGE_KEY`, `PIP_FOCUS_LIFT`, `ROOM_RECENTRE_LABEL`, `ROOM_CAMERA_LABEL` (petRoom.js). `STATION_SHIFT`, `DECOR_SPOT_SHIFT`, `WINDOW_SHIFT`, `shiftPx`, `shiftTransform`, `pipFocusPoint(position, phase, levels)` (roomLayout.js). `clampZoom`, `rubber`, `rubberAxis`, `fitAxis`, `easeInOut`, `cameraBounds`, `viewSize`, `worldTransform` (roomCamera.js). `readRoomZoom`, `writeRoomZoom`, `usePipCamera({ stageRef, worldRef, focus }) → { recentre }`. CSS classes `.pip-room-stage`, `.pip-room-world`, `.pip-room-recentre`, `.is-moving`, `.is-dragging`, `.is-editing`. Java: `Item.isFree()`, `wall-white`. Each is spelled identically in every task that uses it and matches `plan.md` → Data shapes. `ROOM_ZOOM.SNAP` and `ROOM_CAMERA.SETTLED` are additions to the plan's constant objects. They name the mockup's hard-coded 0.002 / 0.15 thresholds, so the hook carries no literals.

**Phase boundary cleanliness:**
- Phase 1: backend-only. The catalogue, services and tests change together and the decor test classes pass. The client is untouched and still compatible (same DTO shapes).
- Phase 2: the dangling `ROOM_VIEWBOX` imports created in Task 4 are fixed within the phase (Tasks 5 and 9). The phase ends with `check:room` and `npm run build` green, and a fitted (uncameraed) bigger room.
- Phase 3: new modules are inert until Task 14 wires them. Task 14 ends with both checks and the build green, and no `pip-room-scene` left.
- Phase 4: verification and bookkeeping only.

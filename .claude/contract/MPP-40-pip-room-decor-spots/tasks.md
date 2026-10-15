# Tasks: Pip's room — 12 named decor spots, rug spot, wardrobe station and deeper windowsill

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-15

**Goal:** Widen Pip's room from 3 to 12 named decor spots (the rug among them), add the wardrobe station and the deeper windowsill, migrate existing placements losslessly, ship every item only after a signed-off visual pass, and add a permanent, off-by-default pet free mode for testing on localhost.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFreeMode.java` — the free-mode switch (`app.pet-free-mode`, default off)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/StationLevelRequest.java` — `{ level: 1..4 }` for the free-mode set-level endpoint
- `foodbytes-app/client/src/components/pet/room/FreeModeBadge.jsx` — 🧪 badge in the room's action strip
- `foodbytes-app/database/migrations/2026-10-15-mpp40-pet-room-decor-spots.sql` — rename 3 spots, widen the placements + station CHECKs (idempotent)
- `foodbytes-app/client/src/components/pet/room/decorArtWalls.jsx` — `WALL_BUILDERS`: Over the wardrobe, Bedside wall, Front right wall items
- `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx` — `WINDOW_BUILDERS`: Window dressing, Windowsill items
- `foodbytes-app/client/src/components/pet/room/decorArtFloor.jsx` — `FLOOR_BUILDERS`: the six floor spots' items
- `foodbytes-app/client/src/components/pet/room/decorArtRugs.jsx` — `RUG_BUILDERS`: the six rugs

**Modified:**
- `C:\Users\jossd\Downloads\pip-room-decor-spots-mockup.html` — AC 9 art pass (outside the repo)
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — go-live row 11
- `foodbytes-app/database/mpp15-railway-golive.sql` — regenerated
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RoomSpot.java` — 12 + 2 spots, `hasDefault()`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RoomStation.java` — `WARDROBE`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetRoomPlacement.java` — Javadoc spot names
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorCatalogue.java` — 43 new items, rug default
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorService.java` — `hasDefault()` in buy
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetRoomService.java` — `hasDefault()` in placementsOf
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StationPolicy.java` — Javadoc ledger range
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/DecorItemDTO.java`, `PetRoomDTO.java`, `RoomPlacementRequest.java` — comments name the new keys
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorCatalogueTest.java`, `PetRoomServiceTest.java`, `DecorServiceTest.java`, `StationServiceTest.java`, `controller/PetDecorControllerTest.java` — new spots, rug, wardrobe
- `foodbytes-app/client/src/constants/petDecor.js` — spots, shapes, layers, items, defaults
- `foodbytes-app/client/src/constants/petRoom.js` — wardrobe station, hint
- `foodbytes-app/client/src/constants/petShop.js` — wardrobe in the shop
- `foodbytes-app/client/src/utils/roomPlacements.js` — defaulted spots
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` — wardrobe order/shift/footprint/hit box, world-coord spots, legacy shift
- `foodbytes-app/client/src/components/pet/room/decorArt.jsx` — merges the four builder maps, legacy shift
- `foodbytes-app/client/src/components/pet/room/furniture.jsx` — wardrobe L1–4, L4 cooker hood + pot redraw
- `foodbytes-app/client/src/components/pet/room/roomDecor.jsx` — rug out of the backdrop, new sill + brackets, sprig gap
- `foodbytes-app/client/src/components/pet/room/RoomDecorLayers.jsx` — `DecorLayer` + name tags
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — layered draw order, bed split, wardrobe button
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — spot tag style
- `foodbytes-app/client/src/components/pet/room/DecorSpotButtons.jsx` — 12 buttons, ordered
- `foodbytes-app/client/src/components/pet/room/DecorPicker.jsx` — no "Empty" on defaulted spots
- `foodbytes-app/client/src/components/pet/room/ShopDecorTab.jsx` — header comment only (already groups by `DECOR_SPOTS`)
- `foodbytes-app/client/src/components/pet/room/room.check.mjs` — new pins incl. AC 7
- `foodbytes-app/client/src/services/petService.js` — JSDoc spot keys
- `foodbytes-app/foodbytes-api/src/main/resources/application.yml` — `app.pet-free-mode: ${PET_FREE_MODE:false}`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StationService.java` — free upgrades, `setLevel`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetShopException.java` — `FREE_MODE_ONLY`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetStationLevelRepository.java` — `deleteByUserIdAndStation`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetStationController.java` — `PUT /{station}/level`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetStationControllerTest.java`, `service/PetServiceTest.java` — free mode, DTO fixture
- `foodbytes-app/client/src/hooks/usePetShop.js` — `setLevel`
- `foodbytes-app/client/src/components/pet/room/ShopStationCard.jsx`, `ShopView.jsx`, `ShopView.css`, `CheckInActions.css` — level chips, free-mode note, badge
- `CLAUDE.md`, `.env.example` — how to turn free mode on for testing
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version

**Deleted:** (none)

---

## Phase 1 — Art pass in the mockup (AC 9)

Redraw the items in the approved mockup and get the developer's sign-off before any art is ported. Nothing in the repo changes, so stopping here is always safe; **`/fb-apply` must not start Phase 2 until Task 2 is ticked by the developer.**

### Task 1: Redraw the mockup items to furniture quality ✓

- Skill: react-frontend

**Files:**
- Modify: `C:\Users\jossd\Downloads\pip-room-decor-spots-mockup.html` (first copy it to `pip-room-decor-spots-mockup.v1.html` beside it, so the approved layout is kept)

- [x] **Step 1: Back up the approved mockup**

Run: `Copy-Item "C:\Users\jossd\Downloads\pip-room-decor-spots-mockup.html" "C:\Users\jossd\Downloads\pip-room-decor-spots-mockup.v1.html"`
Expected: `Get-ChildItem "C:\Users\jossd\Downloads\pip-room-decor-spots-mockup*.html"` lists both files.

- [x] **Step 2: Fix the four known problems**

In the mockup's `ITEMS` and `FURNITURE`:
- `snake-plant` (Back corner): narrow the leaf fan and lower its tallest leaf so it stays inside u 2–30, v 32–52 and clears the wardrobe (v ≤ 32) and the cabinet (shifted v ≥ 56) at every level.
- `FURNITURE.cooker[3]` (L4 chef's kitchen): replace the flat hood blocks (`box(84,0,26,14,106,150)` + `box(70,0,54,32,94,106)`) with a tapered chimney hood: a trapezoid canopy on the left wall (`poly` faces narrowing from 54 wide at h 94 to 26 wide at h 112), a separate chimney to h 150, a darker underside strip and a steel edge line; replace the bare `cyl` pot with a pot that has a rim ellipse, two side handles and a lid with a knob. Keep the footprint inside `[48, 0, 94, 40, 0, 150]` (art coords, before `STATION_SHIFT.cooker`).
- `rug-leaf`: scale the leaf from ±64 to ±56 along u so it stays inside u 82–198.
- `arc-lamp` (Corner by the door): reduce the arc so the shade sits at u ≤ 40 (arc radius ≤ 18) and keep the base at (22, 276).

- [x] **Step 3: Raise the rest to the furniture's standard**

For every new item (the 43 without `ex: 1`): give solid objects all three box faces (`box`/`cyl`, not single `rectV`/`rectU` slabs) where they have depth, an ink outline at 1.2–1.6, one highlight/shade detail, and keep the art inside its spot's outline in u/v. Bump a spot's height only when needed and note the new `h1` in a comment beside the item. Do not change ids, labels, prices, spot coords or the wardrobe/windowsill layout.

- [x] **Step 4: Self-check every combination**

Open the mockup with `?lv=1` and `?lv=4`, press **Fill every spot**, then pick every item per spot from the side list (and toggle **Night**). Confirm by eye: no item crosses a station or a neighbouring spot's art; no rug pokes outside the dashed rug outline. Repeat at a 390 px browser width.
Expected: no overlaps except the window spots behind the L3/L4 bed (accepted, `plan.md` Assumption 9).

### Task 2: Developer sign-off on the art pass ✓

- Skill: none — developer review gate (visual judgement)

**Files:**
- (none)

- [x] **Step 1: Developer reviews the redrawn mockup**

The developer opens `C:\Users\jossd\Downloads\pip-room-decor-spots-mockup.html?lv=4` and `?lv=1`, presses **Fill every spot**, and either signs off or lists items to redraw (loop on Task 1 Step 3). Record the sign-off date here: `Signed off: 2026-10-15`.
Expected: explicit developer approval in chat.

---

## Phase 2 — Schema (local-first)

Write the idempotent migration, add it to the MPP-15 go-live file, and apply it to the local `foodbytes-db`. After this phase the local DB only accepts the new spot names, so the local backend must not be started until Phase 3 lands (it would 500 on a place to the old names, but `ddl-auto: validate` itself still passes — no column changed).

### Task 3: Write the MPP-40 migration and its go-live row ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-15-mpp40-pet-room-decor-spots.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`
- Modify: `foodbytes-app/database/mpp15-railway-golive.sql` (regenerated, never hand-edited)

- [x] **Step 1: Write the migration**

```sql
-- MPP-40: Pip's room grows from 3 decor spots to 12, the rug becomes a spot, and a wardrobe
-- station joins the other four.
--
-- pet_room_placements - the three MPP-27 spots are renamed to their new names, so every existing
-- placement still shows in the same place (AC 3): LEFT_WALL -> OVER_WARDROBE, RIGHT_WALL ->
-- FRONT_RIGHT_WALL, FLOOR -> BY_FRIDGE. chk_pet_room_placements_spot is re-declared with the 12
-- decor spots plus the two finishes. RUG, like the finishes, stores no row for its free default
-- (rug-pink), so every room starts with the pink rug and no backfill (AC 4).
--
-- pet_station_levels - chk_pet_station_levels_station is re-declared as a superset adding WARDROBE
-- (AC 5). A missing row is level 1, as for the other stations. Its upgrades use the existing
-- STATION_UPGRADE ledger source (ids 52..54), so pet_sprinkles is untouched.
--
-- Lossless: renames only, and both CHECKs accept every row the renamed data can hold. Local
-- evidence 2026-10-15: pet_room_placements 0 rows, pet_station_levels 0 rows, pet_decor_owned 0 rows.
--
-- Idempotent (MPP-15 go-live file): each CHECK is dropped only if present before being re-added,
-- and the UPDATEs match nothing on a second run.
--
-- MUST run after MPP-27's 2026-10-14-mpp27-pet-room-decor.sql (go-live row 10, which creates
-- chk_pet_room_placements_spot) and before the backend that knows RoomSpot.OVER_WARDROBE /
-- RoomStation.WARDROBE starts. MPP-15 is local-first: applied to the local foodbytes-db now; row 11
-- of .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_room_placements_spot');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_room_placements DROP CHECK chk_pet_room_placements_spot', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

UPDATE pet_room_placements SET spot = 'OVER_WARDROBE'    WHERE spot = 'LEFT_WALL';
UPDATE pet_room_placements SET spot = 'FRONT_RIGHT_WALL' WHERE spot = 'RIGHT_WALL';
UPDATE pet_room_placements SET spot = 'BY_FRIDGE'        WHERE spot = 'FLOOR';

ALTER TABLE pet_room_placements ADD CONSTRAINT chk_pet_room_placements_spot CHECK (spot IN
  ('OVER_WARDROBE','BEDSIDE_WALL','FRONT_RIGHT_WALL','WINDOW_DRESSING','WINDOWSILL','RUG',
   'BACK_CORNER','BEDSIDE_NOOK','FOOT_OF_BED','BY_FRIDGE','CORNER_BY_DOOR','FRONT_OF_ROOM',
   'WALL_STYLE','FLOOR_STYLE'));

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_station_levels_station');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_station_levels DROP CHECK chk_pet_station_levels_station', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_station_levels ADD CONSTRAINT chk_pet_station_levels_station CHECK (station IN
  ('BED','FRIDGE','COOKER','CABINET','WARDROBE'));
```

- [x] **Step 2: Append go-live row 11**

Add under row 10 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`:
`| 11 | MPP-40 | foodbytes-app/database/migrations/2026-10-15-mpp40-pet-room-decor-spots.sql | 2026-10-15 | — |`

- [x] **Step 3: Regenerate the go-live file**

Run: `node foodbytes-app/database/build-golive.mjs`
Expected: it reports writing `mpp15-railway-golive.sql`; `Select-String -Path foodbytes-app\database\mpp15-railway-golive.sql -Pattern "OVER_WARDROBE"` → at least one hit.

### Task 4: Apply the migration to the local foodbytes-db ✓

- Skill: none — DBA operation against the local `foodbytes-db` (MPP-15 local-first; Railway gets the go-live file at merge)

**Files:**
- (none — database state only)

- [x] **Step 1: Apply it twice (proves idempotence)**

Run (from the repo root, PowerShell): `Get-Content foodbytes-app\database\migrations\2026-10-15-mpp40-pet-room-decor-spots.sql -Raw | docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes` — then run the same command again.
Expected: both runs exit with no error (only the password warning).

- [x] **Step 2: Verify the constraints**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT CONSTRAINT_NAME, CHECK_CLAUSE FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='foodbytes' AND CONSTRAINT_NAME IN ('chk_pet_room_placements_spot','chk_pet_station_levels_station');"`
Expected: the placements clause lists `OVER_WARDROBE` … `FLOOR_STYLE` (14 names, no `LEFT_WALL`); the station clause ends with `'WARDROBE'`.

- [x] **Step 3: Record the local apply**

Confirm row 11's "Applied locally" column reads `2026-10-15` (it was written in Task 3 Step 2).

---

## Phase 3 — Backend

The enum, catalogue, station and default-spot behaviour, then the permanent pet free mode (off by default), each with its tests. Ends with the backend compiling and every touched test class green against the migrated local DB's names.

### Task 5: Rewrite RoomSpot with the 12 spots and hasDefault() ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RoomSpot.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetRoomPlacement.java` (Javadoc)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/DecorItemDTO.java`, `PetRoomDTO.java`, `RoomPlacementRequest.java` (field comments)

- [x] **Step 1: Replace the constants and add the flag**

```java
/**
 * MPP-27 / MPP-40: the room's 12 decor spots plus its two finishes. Stored by name in
 * pet_room_placements.spot (chk_pet_room_placements_spot). key is the JSON / client key
 * (constants/petDecor.js ROOM_SPOTS); label is for messages. isStyle() marks the two finishes;
 * hasDefault() marks every spot that is never empty - the finishes and the rug - whose free default
 * (DecorCatalogue.defaultFor) is shown when nothing is stored.
 */
public enum RoomSpot {
    OVER_WARDROBE("overWardrobe", "over the wardrobe", false, false),
    BEDSIDE_WALL("bedsideWall", "bedside wall", false, false),
    FRONT_RIGHT_WALL("frontRightWall", "front right wall", false, false),
    WINDOW_DRESSING("windowDressing", "window", false, false),
    WINDOWSILL("windowsill", "windowsill", false, false),
    RUG("rug", "rug", false, true),
    BACK_CORNER("backCorner", "back corner", false, false),
    BEDSIDE_NOOK("bedsideNook", "bedside nook", false, false),
    FOOT_OF_BED("footOfBed", "foot of the bed", false, false),
    BY_FRIDGE("byFridge", "spot by the fridge", false, false),
    CORNER_BY_DOOR("cornerByDoor", "corner by the door", false, false),
    FRONT_OF_ROOM("frontOfRoom", "front of the room", false, false),
    WALL_STYLE("wallStyle", "walls", true, true),
    FLOOR_STYLE("floorStyle", "floor", true, true);

    private final String key;
    private final String label;
    private final boolean style;
    private final boolean hasDefault;

    RoomSpot(String key, String label, boolean style, boolean hasDefault) { … assign all four … }

    public String key() { return key; }
    public String label() { return label; }
    public boolean isStyle() { return style; }
    public boolean hasDefault() { return hasDefault; }
    // fromKey unchanged
}
```

- [x] **Step 2: Update the comments that list spot names**

`PetRoomPlacement` Javadoc: "a decor item on one of the 12 decor spots, or the chosen wall / floor style … No row = an empty spot, or the default for a spot that has one (rug, finishes)". `DecorItemDTO.kind`, `PetRoomDTO.placements` and `RoomPlacementRequest.spot` comments: list `"overWardrobe" … "frontOfRoom" | "wallStyle" | "floorStyle"`, and for `placements` state "decor spots -> id or null; rug / wallStyle / floorStyle -> id (the default when unset)".

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: compile errors only in `DecorCatalogue.java` (it still names `LEFT_WALL` etc.) — fixed in Task 6. No other file fails.

### Task 6: Grow DecorCatalogue to 65 entries with the rug default ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorCatalogue.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorCatalogueTest.java`

- [x] **Step 1: Write the failing tests**

Replace `fourDecorItemsPerSpot`, `eachFinishHasExactlyOneDefault…`, `theDefaultsAndLavenderAreFree…`, `everythingElseIsPriced_andTheCatalogueTotals4900`, `idsFitTheColumnAndResolve`, `defaultFor_aPhysicalSpot_throws` and `roomSpot_fromKey…` with:

```java
@Test
void itemsPerSpotMatchTheMockup() {
    Map<RoomSpot, Integer> expected = Map.ofEntries(
            Map.entry(RoomSpot.OVER_WARDROBE, 5), Map.entry(RoomSpot.BEDSIDE_WALL, 4), Map.entry(RoomSpot.FRONT_RIGHT_WALL, 5),
            Map.entry(RoomSpot.WINDOW_DRESSING, 5), Map.entry(RoomSpot.WINDOWSILL, 5), Map.entry(RoomSpot.RUG, 6),
            Map.entry(RoomSpot.BACK_CORNER, 4), Map.entry(RoomSpot.BEDSIDE_NOOK, 4), Map.entry(RoomSpot.FOOT_OF_BED, 4),
            Map.entry(RoomSpot.BY_FRIDGE, 5), Map.entry(RoomSpot.CORNER_BY_DOOR, 4), Map.entry(RoomSpot.FRONT_OF_ROOM, 4),
            Map.entry(RoomSpot.WALL_STYLE, 6), Map.entry(RoomSpot.FLOOR_STYLE, 4));
    expected.forEach((spot, count) ->
            assertThat(DecorCatalogue.ITEMS).as(spot.name()).filteredOn(item -> item.spot() == spot).hasSize(count));
    assertThat(DecorCatalogue.ITEMS).hasSize(65);
}

@Test
void everyDefaultedSpotHasExactlyOneDefault_whiteWallsLilacFloorPinkRug() {
    assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isDefault)
            .extracting(DecorCatalogue.Item::id)
            .containsExactlyInAnyOrder("wall-white", "floor-lilac", "rug-pink");
    assertThat(DecorCatalogue.defaultFor(RoomSpot.RUG)).isEqualTo("rug-pink");
    assertThat(Arrays.stream(RoomSpot.values()).filter(RoomSpot::hasDefault))
            .containsExactlyInAnyOrder(RoomSpot.RUG, RoomSpot.WALL_STYLE, RoomSpot.FLOOR_STYLE);
}

@Test
void theDefaultsAndLavenderAreFree() {
    assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isFree)
            .extracting(DecorCatalogue.Item::id)
            .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "rug-pink");
}

@Test
void everythingElseIsPriced_andTheCatalogueTotals13080() {
    assertThat(DecorCatalogue.ITEMS).filteredOn(item -> !item.isFree())
            .allSatisfy(item -> assertThat(item.price()).isPositive());
    assertThat(DecorCatalogue.ITEMS.stream().mapToInt(DecorCatalogue.Item::price).sum()).isEqualTo(13080);
}

@Test
void theTwelveMpp27ItemsKeepTheirIdsAndPrices_onTheirRenamedSpots() {
    Map<String, Object[]> legacy = Map.ofEntries(
            Map.entry("basil-print", new Object[]{RoomSpot.OVER_WARDROBE, 120}), Map.entry("recipe-board", new Object[]{RoomSpot.OVER_WARDROBE, 180}),
            Map.entry("herb-shelf", new Object[]{RoomSpot.OVER_WARDROBE, 250}), Map.entry("fairy-lights", new Object[]{RoomSpot.OVER_WARDROBE, 300}),
            Map.entry("wall-clock", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 120}), Map.entry("bunting", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 180}),
            Map.entry("pan-rail", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 200}), Map.entry("mirror", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 250}),
            Map.entry("watering-can", new Object[]{RoomSpot.BY_FRIDGE, 120}), Map.entry("cookbook-stack", new Object[]{RoomSpot.BY_FRIDGE, 180}),
            Map.entry("bean-bag", new Object[]{RoomSpot.BY_FRIDGE, 250}), Map.entry("lemon-tree", new Object[]{RoomSpot.BY_FRIDGE, 300}));
    legacy.forEach((id, spotAndPrice) -> assertThat(DecorCatalogue.find(id)).get().satisfies(item -> {
        assertThat(item.spot()).isEqualTo(spotAndPrice[0]);
        assertThat(item.price()).isEqualTo(spotAndPrice[1]);
    }));
}

@Test
void idsFitTheColumnAndResolve() {
    assertThat(DecorCatalogue.ITEMS).allSatisfy(item -> {
        assertThat(item.id().length()).isLessThanOrEqualTo(32);
        assertThat(DecorCatalogue.find(item.id())).contains(item);
    });
}

@Test
void defaultFor_aSpotWithoutADefault_throws() {
    assertThatThrownBy(() -> DecorCatalogue.defaultFor(RoomSpot.BY_FRIDGE)).isInstanceOf(IllegalArgumentException.class);
}

@Test
void roomSpot_fromKey_acceptsTheKeyOrTheName_andNamesFitTheColumn() {
    assertThat(RoomSpot.fromKey("overWardrobe")).isEqualTo(RoomSpot.OVER_WARDROBE);
    assertThat(RoomSpot.fromKey("corner_by_door")).isEqualTo(RoomSpot.CORNER_BY_DOOR);
    assertThat(RoomSpot.fromKey("floor_style")).isEqualTo(RoomSpot.FLOOR_STYLE);
    assertThat(RoomSpot.WALL_STYLE.isStyle()).isTrue();
    assertThat(RoomSpot.RUG.isStyle()).isFalse();
    assertThat(RoomSpot.values()).allSatisfy(spot -> assertThat(spot.name().length()).isLessThanOrEqualTo(16));
    assertThatThrownBy(() -> RoomSpot.fromKey("leftWall")).isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Unknown spot: leftWall");
}
```

Keep `find_unknownOrNull_isEmpty`. Add imports `java.util.Arrays`, `java.util.Map`. Update the class Javadoc to "MPP-27 / MPP-40".

- [x] **Step 2: Replace ITEMS**

`import static com.foodbytes.model.RoomSpot.*;` stays. `ITEMS` becomes, in this order (ids and prices from `plan.md` → Data shapes; the existing 12 keep id and price on their renamed spots):

```java
new Item("basil-print", OVER_WARDROBE, 120, false),
new Item("recipe-board", OVER_WARDROBE, 180, false),
new Item("herb-shelf", OVER_WARDROBE, 250, false),
new Item("fairy-lights", OVER_WARDROBE, 300, false),
new Item("pip-portrait", OVER_WARDROBE, 250, false),
new Item("growth-chart", BEDSIDE_WALL, 120, false),
new Item("meal-calendar", BEDSIDE_WALL, 180, false),
new Item("wall-sconce", BEDSIDE_WALL, 250, false),
new Item("photo-strip", BEDSIDE_WALL, 180, false),
new Item("wall-clock", FRONT_RIGHT_WALL, 120, false),
new Item("bunting", FRONT_RIGHT_WALL, 180, false),
new Item("pan-rail", FRONT_RIGHT_WALL, 200, false),
new Item("mirror", FRONT_RIGHT_WALL, 250, false),
new Item("coat-hooks", FRONT_RIGHT_WALL, 180, false),
new Item("curtains-gingham", WINDOW_DRESSING, 180, false),
new Item("curtains-linen", WINDOW_DRESSING, 120, false),
new Item("roller-blind", WINDOW_DRESSING, 120, false),
new Item("window-lights", WINDOW_DRESSING, 250, false),
new Item("plant-hanger", WINDOW_DRESSING, 300, false),
new Item("sill-basil", WINDOWSILL, 120, false),
new Item("sill-succulents", WINDOWSILL, 180, false),
new Item("sill-cactus", WINDOWSILL, 180, false),
new Item("sill-radio", WINDOWSILL, 250, false),
new Item("sill-cat", WINDOWSILL, 300, false),
new Item("rug-pink", RUG, 0, true),
new Item("rug-braided", RUG, 180, false),
new Item("rug-leaf", RUG, 250, false),
new Item("rug-stripe", RUG, 250, false),
new Item("rug-picnic", RUG, 150, false),
new Item("rug-sheepskin", RUG, 300, false),
new Item("snake-plant", BACK_CORNER, 180, false),
new Item("cactus", BACK_CORNER, 120, false),
new Item("umbrella-stand", BACK_CORNER, 120, false),
new Item("broom", BACK_CORNER, 120, false),
new Item("side-table-lamp", BEDSIDE_NOOK, 180, false),
new Item("record-player", BEDSIDE_NOOK, 300, false),
new Item("plant-stand", BEDSIDE_NOOK, 250, false),
new Item("stool-books", BEDSIDE_NOOK, 120, false),
new Item("toy-chest", FOOT_OF_BED, 180, false),
new Item("bench", FOOT_OF_BED, 250, false),
new Item("laundry-basket", FOOT_OF_BED, 120, false),
new Item("slippers", FOOT_OF_BED, 120, false),
new Item("watering-can", BY_FRIDGE, 120, false),
new Item("cookbook-stack", BY_FRIDGE, 180, false),
new Item("bean-bag", BY_FRIDGE, 250, false),
new Item("lemon-tree", BY_FRIDGE, 300, false),
new Item("veg-basket", BY_FRIDGE, 180, false),
new Item("monstera", CORNER_BY_DOOR, 250, false),
new Item("coat-stand", CORNER_BY_DOOR, 180, false),
new Item("arc-lamp", CORNER_BY_DOOR, 300, false),
new Item("guitar", CORNER_BY_DOOR, 250, false),
new Item("pouffe", FRONT_OF_ROOM, 120, false),
new Item("tea-table", FRONT_OF_ROOM, 250, false),
new Item("pip-ball", FRONT_OF_ROOM, 120, false),
new Item("picnic-basket", FRONT_OF_ROOM, 180, false),
// then the 10 wall / floor styles, unchanged
```

Update the class Javadoc ("MPP-40: 12 decor spots from pip-room-decor-spots-mockup.html; each defaulted spot - the finishes and the rug - has one free default …") and `defaultFor`'s Javadoc to "A defaulted spot's free item (RUG, WALL_STYLE, FLOOR_STYLE)". If the art pass (Task 1) changed a price, the developer said so at sign-off — use the signed-off price and recompute the 13080 total in the test.

- [x] **Step 3: Run the catalogue tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorCatalogueTest`
Expected: `Tests run: 9, Failures: 0, Errors: 0`.

### Task 7: Add the WARDROBE station ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RoomStation.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StationPolicy.java` (Javadoc only)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/StationServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetRoomServiceTest.java`

- [x] **Step 1: Write the failing tests**

In `StationServiceTest`, following the existing CABINET test's mocks:

```java
@Test
void upgrade_wardrobe_spendsUnderLedgerId52AndRaisesItToTwo() {
    when(levelRepository.findByUserId(OWNER)).thenReturn(List.of());

    stationService.upgrade(OWNER, RoomStation.WARDROBE);

    verify(sprinkleService).spend(OWNER, SprinkleSource.STATION_UPGRADE, 52L, 300);
    verify(levelRepository).upsert(OWNER, "WARDROBE", 2);
}
```

In `PetRoomServiceTest.room_noRows_everyStationAtLevelOne`, extend the expected map with `Map.entry("wardrobe", 1)` as the fifth entry. Add to `StationPolicyTest` (or the RoomStation `fromPath` coverage there): `assertThat(RoomStation.fromPath("Wardrobe")).isEqualTo(RoomStation.WARDROBE);`.

- [x] **Step 2: Add the constant**

```java
CABINET(4, "cabinet", "trophy cabinet"),
WARDROBE(5, "wardrobe", "wardrobe");
```

Class Javadoc: "MPP-26: Pip's upgradable stations; MPP-40 adds the wardrobe." `StationPolicy.sourceId` Javadoc: append ", wardrobe 52..54".

- [x] **Step 3: Run the station tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=StationServiceTest+StationPolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 8: Use hasDefault() in PetRoomService and DecorService ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetRoomService.java` (`placementsOf`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorService.java` (`buy`, Javadoc of `place`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetRoomServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorServiceTest.java`

- [x] **Step 1: Update the existing tests to the new names and add the rug cases**

`PetRoomServiceTest`:
- `room_newUser_…`: the key set is `containsExactly("overWardrobe", "bedsideWall", "frontRightWall", "windowDressing", "windowsill", "rug", "backCorner", "bedsideNook", "footOfBed", "byFridge", "cornerByDoor", "frontOfRoom", "wallStyle", "floorStyle")`; every decor key except `rug` is null; `containsEntry("rug", "rug-pink")`; owned ids `containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "rug-pink")`; `bunting`'s kind is `"frontRightWall"`.
- `room_rowsOverrideTheirSpot_unknownOrMisplacedIdsAreIgnored`: rows become `FRONT_RIGHT_WALL "mirror"`, `FLOOR_STYLE "floor-oak"`, `BY_FRIDGE "retired-sofa"`, `OVER_WARDROBE "bean-bag"`; assertions read `frontRightWall`, `byFridge`, `overWardrobe`.
- New:

```java
@Test
void room_aStoredRugReplacesThePinkDefault() {
    when(levelRepository.findByUserId(USER)).thenReturn(List.of());
    when(placementRepository.findByUserId(USER)).thenReturn(List.of(new PetRoomPlacement(1L, USER, RoomSpot.RUG, "rug-braided")));

    assertThat(petRoomService.room(USER).getPlacements()).containsEntry("rug", "rug-braided");
}
```

`DecorServiceTest`: rename `RIGHT_WALL`→`FRONT_RIGHT_WALL`, `LEFT_WALL`→`OVER_WARDROBE`, `FLOOR`→`BY_FRIDGE` in every stub/verify (including the upsert string literals `"FRONT_RIGHT_WALL"`, `"OVER_WARDROBE"`). Add, following `buy_style_isAppliedAtOnce` and `place_theDefaultStyle_deletesTheRowInsteadOfStoringIt`:

```java
@Test
void buy_rug_isPutDownAtOnceOverThePinkDefault() {
    savesWithId(41L);
    decorService.buy(OWNER, "rug-sheepskin");
    verify(placementRepository).upsert(OWNER, "RUG", "rug-sheepskin");
    verify(placementRepository, never()).existsByUserIdAndSpot(OWNER, RoomSpot.RUG);
}

@Test
void place_rugNullOrPink_deletesTheRow_soThePinkRugShows() {
    decorService.place(OWNER, RoomSpot.RUG, null);
    decorService.place(OWNER, RoomSpot.RUG, "rug-pink");
    verify(placementRepository, times(2)).deleteByUserIdAndSpot(OWNER, RoomSpot.RUG);
    verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
}
```

(Match `savesWithId` / stubbing helpers already in the class; add `never`, `anyLong`, `anyString` imports if missing.)

- [x] **Step 2: Run them and watch them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetRoomServiceTest+DecorServiceTest`
Expected: failures in the rug cases (`rug` → null; `buy` checks `existsByUserIdAndSpot` for the rug).

- [x] **Step 3: Switch the two branches**

`PetRoomService.placementsOf`:
```java
placements.put(spot.key(), spot.hasDefault() ? DecorCatalogue.defaultFor(spot) : null);
```
Javadoc: "null for an empty decor spot, the default for an unset defaulted spot (rug, finishes)".

`DecorService.buy`:
```java
if (spot.hasDefault() || !placementRepository.existsByUserIdAndSpot(userId, spot)) {
```
Class/method Javadoc: "a bought style or rug is applied at once". `place` Javadoc: "(a defaulted spot resets to its default, which is never stored)".

- [x] **Step 4: Run them green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetRoomServiceTest+DecorServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 9: Move the controller test to the new spot keys ✓

- Skill: java-backend

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetDecorControllerTest.java`

- [x] **Step 1: Rename the keys**

`"{\"spot\":\"leftWall\",\"itemId\":\"herb-shelf\"}"` → `"overWardrobe"`; `RoomSpot.LEFT_WALL` → `RoomSpot.OVER_WARDROBE`; `placement("leftWall", …)` → `placement("overWardrobe", …)`; `RoomSpot.RIGHT_WALL` → `RoomSpot.FRONT_RIGHT_WALL`. Add one case: `placement("leftWall", "herb-shelf")` → 400 with `{error: "Unknown spot: leftWall"}` (a stale client).

- [x] **Step 2: Confirm no old names remain in the backend**

Run: `Get-ChildItem foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "LEFT_WALL|RIGHT_WALL\b|RoomSpot\.FLOOR\b|\"leftWall\"|\"rightWall\""`
Expected: only the stale-client test case's `"leftWall"` literal(s).

- [x] **Step 3: Run the controller test and compile tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetDecorControllerTest+PetStationControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 10: PetFreeMode switch and the free-mode room read ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFreeMode.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/resources/application.yml` (`app.pet-free-mode`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetRoomDTO.java` (`freeMode`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetRoomService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetRoomServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` (the `ROOM` fixture's constructor)

- [x] **Step 1: Add the property, off by default**

In `application.yml` under `app:`:

```yaml
  # MPP-40: testing only. true = everything in Pip's room shop is owned and free, and any station can be
  # set to any level (PUT /api/pet/stations/{station}/level). Never set on Railway.
  pet-free-mode: ${PET_FREE_MODE:false}
```

- [x] **Step 2: Create PetFreeMode**

```java
package com.foodbytes.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * MPP-40: the pet free-mode switch for local testing (app.pet-free-mode / PET_FREE_MODE, default off).
 * When on, every room-shop item is owned, upgrades cost nothing and any station can be set to any
 * level - see PetRoomService, DecorService and StationService. Read once at startup; never set it on Railway.
 */
@Component
@Slf4j
public class PetFreeMode {

    private final boolean on;

    public PetFreeMode(@Value("${app.pet-free-mode:false}") boolean on) {
        this.on = on;
        if (on) {
            log.warn("PET FREE MODE IS ON: Pip's room shop is unlocked and free for every user. Testing only.");
        }
    }

    public boolean isOn() {
        return on;
    }
}
```

- [x] **Step 3: Write the failing tests**

In `PetRoomServiceTest`, add `@Mock private PetFreeMode freeMode;` (Mockito returns `false` by default, so the existing tests stay in normal mode) and:

```java
@Test
void room_freeModeOff_saysSo() {
    when(levelRepository.findByUserId(USER)).thenReturn(List.of());
    assertThat(petRoomService.room(USER).isFreeMode()).isFalse();
}

@Test
void room_freeMode_everythingOwned_upgradesCostNothing_noRowsNeeded() {
    when(freeMode.isOn()).thenReturn(true);
    when(levelRepository.findByUserId(USER)).thenReturn(List.of());

    PetRoomDTO room = petRoomService.room(USER);

    assertThat(room.isFreeMode()).isTrue();
    assertThat(room.getDecor()).allSatisfy(item -> assertThat(item.isOwned()).isTrue());
    assertThat(room.getDecor()).filteredOn(item -> item.getId().equals("rug-sheepskin")).singleElement()
            .satisfies(item -> assertThat(item.getPrice()).isEqualTo(300)); // the real price is still shown
    assertThat(room.getUpgradeCosts()).containsOnly(Map.entry(2, 0), Map.entry(3, 0), Map.entry(4, 0));
    verify(ownedRepository, never()).save(any());
}
```

Update `PetServiceTest`'s `ROOM` fixture to pass `false` as the new last constructor argument.

- [x] **Step 4: Wire it into PetRoomService and the DTO**

`PetRoomDTO`: add `private boolean freeMode; // MPP-40: testing switch (PetFreeMode) - everything owned, upgrades free` as the last field. `PetRoomService`: inject `private final PetFreeMode freeMode;`. In `room()`:

```java
boolean free = freeMode.isOn();
Map<Integer, Integer> costs = new TreeMap<>(StationPolicy.UPGRADE_COSTS);
if (free) costs.replaceAll((level, cost) -> 0);
return new PetRoomDTO(stations, costs, decorOf(owned, free), placementsOf(placementRepository.findByUserId(userId)), free);
```

`decorOf(Set<String> owned, boolean free)` marks an item owned when `item.isFree() || free || owned.contains(item.id())`. Add an MPP-40 line to the class Javadoc.

- [x] **Step 5: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetRoomServiceTest+PetServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 11: Free placing, free upgrades and the set-level endpoint ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/StationLevelRequest.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetShopException.java` (`FREE_MODE_ONLY`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/DecorService.java` (`place`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StationService.java` (`upgrade`, new `setLevel`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetStationLevelRepository.java` (`deleteByUserIdAndStation`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetStationController.java` (`PUT /{station}/level`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/DecorServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/StationServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetStationControllerTest.java`

- [x] **Step 1: Write the failing tests**

`DecorServiceTest` (add `@Mock private PetFreeMode freeMode;`):

```java
@Test
void place_freeMode_anItemYouDontOwn_isPlacedWithoutAPurchase() {
    when(freeMode.isOn()).thenReturn(true);
    decorService.place(OWNER, RoomSpot.FRONT_RIGHT_WALL, "mirror");
    verify(placementRepository).upsert(OWNER, "FRONT_RIGHT_WALL", "mirror");
    verify(ownedRepository, never()).save(any());
    verifyNoInteractions(sprinkleService);
}
```

(`place_notOwned_is409` stays and still passes, because free mode is off by default.)

`StationServiceTest` (add `@Mock private PetFreeMode freeMode;`):

```java
@Test
void upgrade_freeMode_raisesTheLevelAndChargesNothing() {
    when(freeMode.isOn()).thenReturn(true);
    when(levelRepository.findByUserId(OWNER)).thenReturn(List.of());
    stationService.upgrade(OWNER, RoomStation.COOKER);
    verify(levelRepository).upsert(OWNER, "COOKER", 2);
    verify(sprinkleService, never()).spend(anyLong(), any(), anyLong(), anyInt());
}

@Test
void setLevel_freeMode_anyLevelUpOrDown_levelOneDeletesTheRow() {
    when(freeMode.isOn()).thenReturn(true);
    stationService.setLevel(OWNER, RoomStation.BED, 4);
    stationService.setLevel(OWNER, RoomStation.BED, 1);
    verify(levelRepository).upsert(OWNER, "BED", 4);
    verify(levelRepository).deleteByUserIdAndStation(OWNER, RoomStation.BED);
    verify(sprinkleService, never()).spend(anyLong(), any(), anyLong(), anyInt());
}

@Test
void setLevel_freeModeOff_isRefusedAndWritesNothing() {
    assertThatThrownBy(() -> stationService.setLevel(OWNER, RoomStation.BED, 3))
            .isInstanceOf(PetShopException.class)
            .extracting(e -> ((PetShopException) e).getReason()).isEqualTo(PetShopException.Reason.FREE_MODE_ONLY);
    verifyNoInteractions(levelRepository);
}
```

`PetStationControllerTest`: `setLevel` → 200 with the write; `PetShopException(FREE_MODE_ONLY)` → 403 `{error: "Free mode is off."}`; unknown station → 400; a body of `{"level":5}` through MockMvc → 400 (mirror the MockMvc validation test in `PetDecorControllerTest`).

- [x] **Step 2: Run them and watch them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorServiceTest+StationServiceTest+PetStationControllerTest`
Expected: compile errors or failures for `setLevel`, `FREE_MODE_ONLY` and `deleteByUserIdAndStation`.

- [x] **Step 3: Implement**

- `PetShopException.Reason`: add `FREE_MODE_ONLY`.
- `PetStationLevelRepository`:
  ```java
  /** MPP-40 free mode: back to level 1 (no row). */
  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM PetStationLevel s WHERE s.userId = :userId AND s.station = :station")
  int deleteByUserIdAndStation(@Param("userId") Long userId, @Param("station") RoomStation station);
  ```
- `DecorService.place`: inject `PetFreeMode freeMode`; the ownership check becomes `if (!item.isFree() && !freeMode.isOn() && !ownedRepository.existsByUserIdAndItemKey(userId, item.id()))`. Javadoc: "MPP-40: in free mode anything can be placed, and nothing is recorded as bought."
- `StationService`: inject `PetFreeMode freeMode`; in `upgrade`, call `sprinkleService.spend(...)` only `if (!freeMode.isOn())`. Add:
  ```java
  /** MPP-40 free mode only: set a station to any level 1..4, up or down, for nothing. Level 1 = no row. */
  @Transactional
  public RoomWriteDTO setLevel(Long userId, RoomStation station, int level) {
      if (!freeMode.isOn()) {
          throw new PetShopException(PetShopException.Reason.FREE_MODE_ONLY, "Free mode is off.");
      }
      if (level < StationPolicy.MIN_LEVEL || level > StationPolicy.MAX_LEVEL) {
          throw new IllegalArgumentException("Level must be 1 to 4");
      }
      sprinkleService.lockWallet(userId); // the same per-person lock as upgrade, so the two can't race
      if (level == StationPolicy.MIN_LEVEL) {
          levelRepository.deleteByUserIdAndStation(userId, station);
      } else {
          levelRepository.upsert(userId, station.name(), level);
      }
      return petRoomService.write(userId);
  }
  ```
- `StationLevelRequest`: `@Data @NoArgsConstructor @AllArgsConstructor`, `@NotNull @Min(1) @Max(4) private Integer level;`.
- `PetStationController`:
  ```java
  /** MPP-40 free mode only (403 otherwise): set a station to any level. */
  @PutMapping("/{station}/level")
  public ResponseEntity<?> setLevel(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                    @PathVariable String station,
                                    @Valid @RequestBody StationLevelRequest request)
  ```
  Unauthenticated and unknown-station handling are the same as in `upgrade`. A `PetShopException` with `FREE_MODE_ONLY` returns 403; any other `PetShopException` returns 409; an `IllegalArgumentException` returns 400. Add a `MethodArgumentNotValidException` handler returning a 400 `{error}`, copied from `PetDecorController`.

- [x] **Step 4: Run them green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=DecorServiceTest+StationServiceTest+PetStationControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 12: Document free mode for future testing ✓

- Skill: none — project docs

**Files:**
- Modify: `CLAUDE.md` ("Running the backend locally with Google login")
- Modify: `.env.example`

- [x] **Step 1: CLAUDE.md**

Under the PowerShell block in "Running the backend locally with Google login", add:

```markdown
**Pet free mode (testing).** Add `$env:PET_FREE_MODE = "true"` before `mvn spring-boot:run` to unlock Pip's whole room shop for every user on that backend: every decor item and wall/floor style is owned, station upgrades cost nothing, and the Upgrades tab shows level chips that set any station to any level 1–4 (`PUT /api/pet/stations/{station}/level`, which returns 403 when free mode is off). The room shows a 🧪 Free mode badge, and the backend logs a WARN at startup. Nothing is recorded as bought and no sprinkles move, but the placements and levels you set are real rows in the local DB. It's off unless the env var is set, so **never set it on Railway**. Use it to test room art and layout at every level (MPP-40 and later room work).
```

- [x] **Step 2: .env.example**

Append:

```
# MPP-40: local testing only - unlocks Pip's room shop for free. Never set on Railway.
PET_FREE_MODE=false
```

- [x] **Step 3: Confirm the default is off**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\resources\application.yml -Pattern 'pet-free-mode: \$\{PET_FREE_MODE:false\}'`
Expected: one hit.

---

## Phase 4 — Frontend art (additive)

Port the signed-off art into new modules and extend the furniture and backdrop. Nothing reads the new builders by spot yet, so the existing room still renders; the only visible changes are the deeper windowsill, the redrawn L4 cooker and the wardrobe art being available. The build stays green.

### Task 13: Port the decor item art into four builder modules ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/decorArtWalls.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/decorArtFloor.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/decorArtRugs.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/decorArt.jsx`

- [x] **Step 1: Move the 12 legacy builders and add the new ones**

Each module exports one map `id → () => JSX`, file order imports → constants → helpers → export. Translate the signed-off mockup `ITEMS[id].art` with the existing primitives: `box`→`<Box>`, `rectV`/`rectU`/`rectH`→`<RectV>`/`<RectU>`/`<RectH>`, `ellH`→`<EllH>`, `cyl`→`<Cyl>`, `bill`→`<Bill>`, `iline`→`<IsoLine>`, `poly`→`<Poly>`, `leaf(...)`→`<Leaf>` (exported from `decorArt.jsx` — move `Leaf` to `decorArtWalls.jsx` and re-export it from `decorArt.jsx` if an import cycle appears), `pot(u,v,h,r,ht,c)`→`<Cyl cu={u} cv={v} r={r} h0={h} h1={h+ht} color={c} />`. Strip the mockup's `lw()/rw()/fl()` wrappers — the legacy shift moves into `decorArt` (Step 2). Lamp glow (`glow(st)`) is dropped: the room's night dim covers it.
- `decorArtWalls.jsx` → `WALL_BUILDERS`: `basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights` (moved verbatim from `decorArt.jsx`), `pip-portrait`, `growth-chart`, `meal-calendar`, `wall-sconce`, `photo-strip`, `wall-clock`, `bunting`, `pan-rail`, `mirror` (moved verbatim), `coat-hooks`.
- `decorArtWindow.jsx` → `WINDOW_BUILDERS`: `curtains-gingham`, `curtains-linen`, `roller-blind`, `window-lights`, `plant-hanger`, `sill-basil`, `sill-succulents`, `sill-cactus`, `sill-radio`, `sill-cat`.
- `decorArtRugs.jsx` → `RUG_BUILDERS`: `rug-pink` (today's `roomDecor.jsx` rug + ring, using `RUG` and the `RUG_RING` sizes moved here), `rug-braided`, `rug-leaf`, `rug-stripe`, `rug-picnic`, `rug-sheepskin`; every rug centred on `RUG.cu, RUG.cv` from `roomLayout.js`.
- `decorArtFloor.jsx` → `FLOOR_BUILDERS`: `snake-plant`, `cactus`, `umbrella-stand`, `broom`, `side-table-lamp`, `record-player`, `plant-stand`, `stool-books`, `toy-chest`, `bench`, `laundry-basket`, `slippers`, `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree` (moved verbatim), `veg-basket`, `monstera`, `coat-stand`, `arc-lamp`, `guitar`, `pouffe`, `tea-table`, `pip-ball`, `picnic-basket`.

- [x] **Step 2: Make decorArt.jsx the merged, shifted, cached entry point**

```jsx
import { DECOR_ITEMS } from '../../../constants/petDecor'
import { WALL_BUILDERS } from './decorArtWalls'
import { WINDOW_BUILDERS } from './decorArtWindow'
import { FLOOR_BUILDERS } from './decorArtFloor'
import { RUG_BUILDERS } from './decorArtRugs'
import { DECOR_LEGACY_SHIFT, shiftTransform } from './roomLayout'

const BUILDERS = { ...WALL_BUILDERS, ...WINDOW_BUILDERS, ...FLOOR_BUILDERS, ...RUG_BUILDERS }
// MPP-27's 12 items are drawn in their original coords and slid to their MPP-40 spot.
const LEGACY_IDS = new Set(['basil-print', 'recipe-board', 'herb-shelf', 'fairy-lights', 'wall-clock', 'bunting', 'pan-rail', 'mirror', 'watering-can', 'cookbook-stack', 'bean-bag', 'lemon-tree'])

const cache = new Map()

/** MPP-27 / MPP-40: an item's art in world coords (cached per id), or null for an id this client doesn't know. */
export function decorArt(id) {
  if (!id || !BUILDERS[id]) return null
  if (!cache.has(id)) {
    const art = BUILDERS[id]()
    const shift = LEGACY_IDS.has(id) ? DECOR_LEGACY_SHIFT[DECOR_ITEMS[id]?.spot] : null
    cache.set(id, shift ? <g transform={shiftTransform(shift)}>{art}</g> : art)
  }
  return cache.get(id)
}
```

Add `DECOR_LEGACY_SHIFT` to `roomLayout.js` now, keyed by the **new** spot keys only. Until Task 16 switches `DECOR_ITEMS`, the legacy ids still carry their old spot keys (`leftWall` …), so the lookup finds no shift and today's `SpotLayer` shift keeps drawing them where they are. Tasks 16 and 17 switch the keys and delete `DECOR_SPOT_SHIFT` in the same phase, so the shift is applied exactly once at every point.

```js
// roomLayout.js — MPP-40: MPP-27's 12 items keep their art coords; this slides them to their spot (world coords).
export const DECOR_LEGACY_SHIFT = {
  overWardrobe: [-130, 0, -30],
  frontRightWall: [0, 216, -40],
  byFridge: [70, 20, 0]
}
```

- [x] **Step 3: Measure the files**

Run: `cd foodbytes-app\client\src\components\pet\room; Get-ChildItem decorArt*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_ | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines (split `decorArtFloor.jsx` into `decorArtFloorBack.jsx` / `decorArtFloorFront.jsx` along `DECOR_LAYERS` if it isn't).

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Wardrobe station art and the L4 cooker redraw ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/furniture.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js` (`COOKER_FOOTPRINT[3]` if the hood's box changed; `STATION_ANCHORS.cookerPot[3]` / `cookerPlate[3]` if the pot moved)

- [x] **Step 1: Add FURNITURE.wardrobe**

Four builders in world coords (no shift), translated from the signed-off mockup `FURNITURE.wardrobe` with the furniture file's style (`ART_STROKE`, `KNOB_STROKE`, `// 1 clothes rail` … `// 4 mirrored double wardrobe` comments). Update the file header comment to name the wardrobe (MPP-40).

- [x] **Step 2: Redraw the L4 cooker hood and pot**

Replace the `// 4 chef's kitchen` hood and pot JSX with the signed-off mockup version (Task 1 Step 2). Keep the art inside `COOKER_FOOTPRINT[3]`; if the hood's outer box changed, update `COOKER_FOOTPRINT[3]` and its comment. If the pot moved, update `STATION_ANCHORS.cookerPot[3]` and `cookerPlate[3]` so steam and the served plate still sit on it.

- [x] **Step 3: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\furniture.jsx | Measure-Object -Line).Lines; npm run build`
Expected: under 400 lines (otherwise move the wardrobe into `wardrobeArt.jsx`, imported into `FURNITURE`); `built in <n>s`.

### Task 15: Deeper windowsill, sprig gap, rug out of the backdrop ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomDecor.jsx`

- [x] **Step 1: Replace the sill**

Delete the `<Box u={0} v={90} du={7} dv={76} h0={100} h1={104} … />` inside the `WINDOW_SHIFT` group and add, after that group (world coords, AC 6):

```jsx
{/* MPP-40 AC 6: the sill is twice as deep (7 → 14), thicker (h 68–74) and sits on two brackets. */}
<Box u={0} v={167} du={9} dv={3} h0={58} h1={68} color={SILL_BRACKET} />
<Box u={0} v={227} du={9} dv={3} h0={58} h1={68} color={SILL_BRACKET} />
<Box u={0} v={158} du={14} dv={80} h0={68} h1={74} color={SILL_TOP} />
```

with constants `SILL_TOP = '#e6dcf7'`, `SILL_BRACKET = '#cbbdea'` next to the other colours.

- [x] **Step 2: Lower the sprig window gap**

`const WINDOW_GAP = { v0: 158, v1: 238, h0: 56 }` — sprigs stay clear of the brackets.

- [x] **Step 3: Keep the rug for now**

Leave the two rug `EllH`s in `buildBackdrop` in this phase (the rug layer doesn't exist yet); Task 18 removes them in the same change that draws the rug spot. Note this in a one-line comment above them: `{/* MPP-40: moves to the rug spot (DecorLayer rug) */}`.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 5 — Frontend room wiring

Switch the constants to the 12 spots and the wardrobe, and wire every consumer in the same phase so no import dangles. Ends with `check:room` green, the build green and the room drawing every layer in order.

### Task 16: Constants — 12 spots, layers, items, wardrobe ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petDecor.js`
- Modify: `foodbytes-app/client/src/constants/petRoom.js`
- Modify: `foodbytes-app/client/src/constants/petShop.js`

- [x] **Step 1: petDecor.js**

Replace `ROOM_SPOTS`, `DECOR_SPOTS`, `DECOR_SPOT_LABELS`, `DECOR_SPOT_SHAPES`, `DECOR_ITEMS` per `plan.md` → Data shapes, and add `DECOR_LAYERS`, `SPOT_BUTTON_ORDER`, `DEFAULT_RUG`, `DEFAULT_PLACEMENTS`. `DECOR_SPOT_SHAPES` entries in world coords:

```js
overWardrobe: {
  corners: [[20, 0, 102], [56, 0, 102], [56, 0, 140], [20, 0, 140]],
  plus: [38, 0, 121], tag: [38, 0, 140], volume: [20, 0, 36, 8, 98, 146]
},
bedsideWall: {
  corners: [[0, 134, 60], [0, 154, 60], [0, 154, 124], [0, 134, 124]],
  plus: [0, 144, 92], tag: [0, 144, 52], volume: [0, 134, 6, 20, 60, 132]
},
frontRightWall: {
  corners: [[0, 250, 102], [0, 296, 102], [0, 296, 134], [0, 250, 134]],
  plus: [0, 273, 118], tag: [0, 273, 134], volume: [0, 250, 4, 46, 98, 138]
},
windowDressing: {
  corners: [[0, 156, 60], [0, 244, 60], [0, 244, 146], [0, 156, 146]],
  plus: [0, 160, 140], tag: [0, 198, 146], volume: [0, 156, 16, 88, 60, 150]
},
windowsill: {
  corners: [[0, 158, 74], [14, 158, 74], [14, 238, 74], [0, 238, 74]],
  plus: [7, 198, 74], tag: [7, 198, 66], volume: [0, 158, 14, 80, 74, 100]
},
rug: {
  corners: [[82, 106, 0], [198, 106, 0], [198, 194, 0], [82, 194, 0]],
  plus: [140, 150, 0], tag: [198, 150, 0], volume: [82, 106, 116, 88, 0, 2]
},
backCorner: { corners: <u 2–30 × v 32–52 at h 0>, plus: [16, 42, 0], tag: [16, 42, -4], volume: [2, 32, 28, 20, 0, 80] },
bedsideNook: { corners: <u 2–32 × v 140–182>, plus: [17, 161, 0], tag: [17, 161, 0], volume: [2, 140, 30, 42, 0, 70] },
footOfBed: { corners: <u 96–126 × v 196–240>, plus: [111, 218, 0], tag: [111, 218, 0], volume: [96, 196, 30, 44, 0, 30] },
byFridge: { corners: <u 220–256 × v 130–170>, plus: [238, 150, 0], tag: [238, 150, 0], volume: [220, 130, 36, 40, 0, 64] },
cornerByDoor: { corners: <u 4–40 × v 258–294>, plus: [22, 276, 0], tag: [22, 276, 0], volume: [4, 258, 36, 36, 0, 100] },
frontOfRoom: { corners: <u 172–208 × v 232–268>, plus: [190, 250, 0], tag: [190, 250, 0], volume: [172, 232, 36, 36, 0, 40] }
```

(Floor `corners` are the four `[u, v, 0]` points in the order `[u0,v0] [u1,v0] [u1,v1] [u0,v1]`. If the art pass raised a volume's `h1`, use the signed-off value.) `DECOR_ITEMS` adds the 43 new `{ label, spot }` entries with the mockup labels (`'pip-portrait': { label: 'Pip portrait', spot: 'overWardrobe' }`, …, `'rug-pink': { label: 'Pink rug', spot: 'rug' }`, …) and moves the 12 legacy items to `overWardrobe` / `frontRightWall` / `byFridge`. Update the file header (MPP-40: 12 spots, world coords) and the comment above the shapes (`tag` = the edit-mode name label anchor). `DECOR_SPOT_LABELS` uses the ticket's names exactly.

- [x] **Step 2: petRoom.js and petShop.js**

```js
// petRoom.js
export const ROOM_STATIONS = { BED: 'bed', FRIDGE: 'fridge', COOKER: 'cooker', CABINET: 'cabinet', WARDROBE: 'wardrobe' }
export const DEFAULT_ROOM_LEVELS = { bed: 1, fridge: 1, cooker: 1, cabinet: 1, wardrobe: 1 }
export const ROOM_HINT = 'Drag to look around · tap the fridge 🧊, cabinet 🏆 or wardrobe 👕' // MPP-23 / MPP-39 / MPP-40

// petShop.js
{ key: 'wardrobe', label: 'Wardrobe', icon: '👕' }  // appended to SHOP_STATIONS
wardrobe: ['Clothes rail', 'Chest of drawers', 'Wooden wardrobe', 'Mirrored wardrobe'],  // STATION_LEVEL_NAMES
wardrobe: 'A new wardrobe for my outfits! 👕✨'  // SHOP_UPGRADE_LINES
```

### Task 17: Layout and helpers — world-coord spots, wardrobe geometry, defaulted spots ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js`
- Modify: `foodbytes-app/client/src/utils/roomPlacements.js`
- Modify: `foodbytes-app/client/src/services/petService.js` (JSDoc only)

- [x] **Step 1: roomLayout.js**

- `ROOM_DRAW_ORDER = [ROOM_STATIONS.WARDROBE, ROOM_STATIONS.COOKER, ROOM_STATIONS.FRIDGE, ROOM_STATIONS.CABINET, ROOM_STATIONS.BED]`, comment updated.
- `STATION_SHIFT[ROOM_STATIONS.WARDROBE] = [0, 0]` (drawn in world coords).
- Delete `DECOR_SPOT_SHIFT`; `decorSpotHitBox(spot)` returns the padded bounds of the world volume with no `offsetBox`; `decorThumbBox` unchanged in body.
- Add after `BED_FOOTPRINT`:

```js
// MPP-40: the outer box of FURNITURE.wardrobe[level - 1] as [u, v, du, dv, h0, h1], world coords (no shift).
// Hand-copied from furniture.jsx; keep them in step with the art.
export const WARDROBE_FOOTPRINT = [[6, 4, 63, 22, 0, 82], [10, 0, 52, 26, 0, 78], [6, 0, 60, 30, 0, 92], [2, 0, 70, 32, 0, 96]]
```

(re-measure against the ported art from Task 14 and correct any value). Add `[ROOM_STATIONS.WARDROBE]: WARDROBE_FOOTPRINT` to `THUMB_FOOTPRINTS`, and:

```js
/** MPP-40 AC 5: the wardrobe's bounding box in world px, for the button that opens Dress Pip. */
export function wardrobeHitBox(level) {
  const index = resolveRoomLevels({ wardrobe: level }).wardrobe - 1
  return offsetBox(boundsOf(boxCorners(...WARDROBE_FOOTPRINT[index])), STATION_SHIFT[ROOM_STATIONS.WARDROBE])
}
```

Update the `resolveRoomLevels` JSDoc to "{ bed, fridge, cooker, cabinet, wardrobe }".

- [x] **Step 2: roomPlacements.js**

```js
import { DECOR_ITEMS, DECOR_SPOT_LABELS, DEFAULT_PLACEMENTS, ROOM_STYLES } from '../constants/petDecor.js'

/** True for a spot that is never empty — the rug and the two finishes. */
export function hasDefault(spot) {
  return spot in DEFAULT_PLACEMENTS
}

/** The room after putting itemId on spot, for an optimistic edit. null clears it, and a cleared defaulted spot shows its default. */
export function withPlacement(room, spot, itemId) {
  return { ...room, placements: { ...room?.placements, [spot]: itemId || DEFAULT_PLACEMENTS[spot] || null } }
}
```

`decorBoughtLine`: replace the two-finish test with `if (hasDefault(entry.spot)) return \`${entry.label} bought and applied.\``. Header JSDoc lists the 14 placement keys.

- [x] **Step 3: petService.js JSDoc**

`placements: { [spot: string]: string|null }` (12 decor spots, `rug`, `wallStyle`, `floorStyle`) on the `getPet` return and `@param {string} spot — a ROOM_SPOTS value` on `placeDecor`.

### Task 18: Draw the decor in layers with name tags, and the wardrobe button ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomDecorLayers.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css`
- Modify: `foodbytes-app/client/src/components/pet/room/roomDecor.jsx` (remove the backdrop rug)

- [x] **Step 1: RoomDecorLayers.jsx → one DecorLayer**

```jsx
import { DECOR_LAYERS, DECOR_SPOT_LABELS, DECOR_SPOT_SHAPES } from '../../../constants/petDecor'
import { decorArt } from './decorArt'
import { P, pts } from './iso'
import { Bill } from './isoShapes'

/**
 * MPP-27 / MPP-40: one draw layer of the room's decor (DECOR_LAYERS: rug, wall, backFloor,
 * frontFloor) — each spot's placed item and, in edit mode, its dashed outline and name (AC 8).
 * PetRoom puts each layer at its depth among the stations. `selectedSpot` is the spot whose picker is open.
 */
export function DecorLayer({ layer, placements, editing, selectedSpot }) {
  return DECOR_LAYERS[layer].map(spot => (
    <g key={spot}>
      {decorArt(placements?.[spot])}
      {editing && <SpotOutline spot={spot} placements={placements} selectedSpot={selectedSpot} />}
    </g>
  ))
}

function SpotOutline({ spot, placements, selectedSpot }) {
  const { corners, plus, tag } = DECOR_SPOT_SHAPES[spot]
  const filled = decorArt(placements?.[spot]) != null
  const className = ['pip-decor-spot', filled && 'is-filled', selectedSpot === spot && 'is-selected'].filter(Boolean).join(' ')
  const label = DECOR_SPOT_LABELS[spot]
  return (
    <g className={className}>
      <polygon points={pts(corners.map(corner => P(...corner)))} />
      {!filled && (
        <Bill u={plus[0]} v={plus[1]} h={plus[2]}>
          <text x="-5" y="6">+</text>
        </Bill>
      )}
      <Bill u={tag[0]} v={tag[1]} h={tag[2]}>
        <g className="pip-decor-spot-tag" transform="translate(0 -6)">
          <rect x={-(label.length * 3.75 + 8) / 2} y="-6" width={label.length * 3.75 + 8} height="11" rx="5.5" />
          <text textAnchor="middle" y="2.4">{label}</text>
        </g>
      </Bill>
    </g>
  )
}
```

Move the tag size numbers (`3.75`, `8`, `11`, `5.5`) into named constants at the top of the file (`TAG_CHAR_WIDTH`, `TAG_PAD`, `TAG_HEIGHT`, `TAG_RADIUS`).

- [x] **Step 2: PetRoom.jsx draw order and the wardrobe button**

Replace the `WallDecor` / station loop / `FloorDecor` block with:

```jsx
{roomBackdrop(asleep, placements?.wallStyle, placements?.floorStyle)}
<DecorLayer layer="rug" {...decorProps} />
<DecorLayer layer="wall" {...decorProps} />
{BACK_STATIONS.map(station => <ShiftedStation key={station} station={station} {...stationProps} />)}
<DecorLayer layer="backFloor" {...decorProps} />
<ShiftedStation station={ROOM_STATIONS.BED} {...stationProps} />
<PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} herb={herb} levelBar={levelBar} />}</PipWalker>
<DecorLayer layer="frontFloor" {...decorProps} />
{asleep && <NightDim />}
{asleep && <SleepZs level={resolved.bed} />}
```

That is the exact order inside the `<svg>`: backdrop → `rug` → `wall` → wardrobe, cooker, fridge, cabinet → `backFloor` → bed → Pip → `frontFloor` → night dim → z's (the dim moves from before Pip to after the front floor, so it covers the front-floor items too; Pip isn't drawn on the rug while asleep). Where `decorProps = { placements, editing, selectedSpot }`, `BACK_STATIONS = ROOM_DRAW_ORDER.filter(s => s !== ROOM_STATIONS.BED)` (module-level constant), and `ShiftedStation` is a small component wrapping today's `<g transform={shiftTransform(STATION_SHIFT[station])}><Station … /></g>`. Update the import line (`DecorLayer` instead of `FloorDecor, WallDecor`; `wardrobeHitBox`).

After the cabinet `StationButton`:

```jsx
{wardrobe && (
  <StationButton
    box={wardrobeHitBox(resolved.wardrobe)}
    label={`Open ${name}'s wardrobe`}
    onOpen={event => openWardrobe(event.currentTarget)}
  />
)}
```

with, next to `openPicker`:

```js
// MPP-40 AC 5: the wardrobe station is a second way into Dress Pip; focus returns to whichever was tapped.
const openWardrobe = (button) => {
  wardrobeOverlay.triggerRef.current = button
  wardrobeOverlay.open()
}
```

`StationButton` passes the click event to `onOpen` (`onClick={onOpen}` already does) and its `buttonRef` becomes optional; the 👕 `WardrobeButton` sets `wardrobeOverlay.triggerRef.current` in its own click before opening (change its `onOpen` prop to `event => openWardrobe(event.currentTarget)`, dropping `buttonRef={wardrobeOverlay.triggerRef}`). Update the component's MPP-39 header comment (stations and decor are drawn in layers; `DECOR_SPOT_SHIFT` is gone) and add an MPP-40 line.

- [x] **Step 3: Remove the backdrop rug**

In `roomDecor.jsx` delete the two rug `EllH`s, `RUG_RING`, and `RUG` from the `roomLayout` import (now drawn by `rug-pink` in `decorArtRugs.jsx`). Update the `roomBackdrop` JSDoc ("walls, floor, window and sill").

- [x] **Step 4: Tag styles**

In `PetRoom.css`, next to the `.pip-decor-spot` rules:

```css
.pip-decor-spot-tag rect { fill: #fff; stroke: #7c5cd6; stroke-width: 0.8; }
.pip-decor-spot-tag text { font: 600 7px system-ui, sans-serif; fill: #3b2f5c; pointer-events: none; }
.pip-decor-spot-tag { pointer-events: none; }
```

- [x] **Step 5: Measure PetRoom.jsx**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: under 400. If not, move `Station`, `ShiftedStation`, `PipWalker` into `RoomStations.jsx` and `SpeechBubble` into `SpeechBubble.jsx` in this task.

### Task 19: Spot buttons, picker and shop for 12 spots ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/DecorSpotButtons.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/DecorPicker.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/ShopDecorTab.jsx`

- [x] **Step 1: DecorSpotButtons — the 12, largest first**

Map over `SPOT_BUTTON_ORDER` instead of `DECOR_SPOTS` (later buttons sit on top, so the windowsill wins over the window dressing and small floor spots over the rug). `current` for a defaulted spot falls back to its default's label: `DECOR_ITEMS[placements?.[spot]]?.label ?? DECOR_EMPTY_LABEL.toLowerCase()` already covers the rug since `placements.rug` is never null from the server. Header comment: "MPP-40: 12 spots; order = SPOT_BUTTON_ORDER".

- [x] **Step 2: DecorPicker — no Empty on the rug**

```jsx
import { hasDefault, catalogueFor, ownedFor } from '../../../utils/roomPlacements'
…
{!hasDefault(spot) && (
  <button type="button" className="pip-decor-option" aria-pressed={current == null} onClick={() => onPick(spot, null)}>
    …
  </button>
)}
```

Comment: "It offers Empty (not on the rug, which always has one) plus every owned item for the spot".

- [x] **Step 3: ShopDecorTab comment**

Header: "MPP-27 AC 1 / MPP-40 AC 8: the Decor tab — the items for each of the 12 spots, grouped under the spot's name." No logic change.

- [x] **Step 4: Grep for stale keys**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "leftWall|rightWall|LEFT_WALL|RIGHT_WALL|DECOR_SPOT_SHIFT|WallDecor|FloorDecor|ROOM_SPOTS\.FLOOR\b"`
Expected: zero hits outside `room.check.mjs` (fixed in Task 20).

### Task 20: Pin the new room in room.check.mjs (incl. AC 7) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Update imports and the old spot checks**

Drop `DECOR_SPOT_SHIFT` from the import; import `WARDROBE_FOOTPRINT`, `wardrobeHitBox`, `DECOR_LEGACY_SHIFT` from `roomLayout.js` and `DECOR_LAYERS`, `SPOT_BUTTON_ORDER`, `DEFAULT_PLACEMENTS`, `DEFAULT_RUG`, `DECOR_SPOT_LABELS`, `ROOM_SPOTS` from `petDecor.js`, `hasDefault` from `roomPlacements.js`. The "decor spots sit on the floor / under the wall top" loop reads the world volume directly (no shift). The spot-button loop checks corners, plus and tag at their world points with no shift, and **drop the "two decor spot buttons overlap" assertion** (12 spots overlap by design — sill inside window dressing — `plan.md` Risks). Add the wardrobe to the station footprint loops (inside the floor, under the wall, `wardrobeHitBox(l)` in the world for l 1–4, `stationThumbBox('wardrobe', l)` square).

- [x] **Step 2: Add the MPP-40 pins**

```js
// MPP-40 AC 1: exactly the ticket's 12 spots, each named, in one layer, with a button.
assert.equal(DECOR_SPOTS.length, 12)
assert.deepEqual([...Object.values(DECOR_LAYERS).flat()].sort(), [...DECOR_SPOTS].sort())
assert.deepEqual([...SPOT_BUTTON_ORDER].sort(), [...DECOR_SPOTS].sort())
DECOR_SPOTS.forEach(spot => assert.ok(DECOR_SPOT_LABELS[spot], `${spot} has no name`))
assert.deepEqual(DECOR_SPOT_SHAPES.byFridge.corners.map(c => c.slice(0, 2)), [[220, 130], [256, 130], [256, 170], [220, 170]])
assert.deepEqual(DECOR_SPOT_SHAPES.overWardrobe.corners.map(c => c[2]), [102, 102, 140, 140])

// MPP-40 AC 2: every item names a known spot; per-spot counts match the mockup.
const COUNTS = { overWardrobe: 5, bedsideWall: 4, frontRightWall: 5, windowDressing: 5, windowsill: 5, rug: 6, backCorner: 4, bedsideNook: 4, footOfBed: 4, byFridge: 5, cornerByDoor: 4, frontOfRoom: 4 }
DECOR_SPOTS.forEach(spot => assert.equal(Object.values(DECOR_ITEMS).filter(i => i.spot === spot).length, COUNTS[spot], `${spot} item count`))

// MPP-40 AC 3: the legacy shift puts MPP-27's spots where MPP-39 drew them (left wall 10 higher).
assert.deepEqual(DECOR_LEGACY_SHIFT, { overWardrobe: [-130, 0, -30], frontRightWall: [0, 216, -40], byFridge: [70, 20, 0] })

// MPP-40 AC 4: the rug defaults to pink; Pip's home is the rug spot's centre.
assert.equal(DEFAULT_PLACEMENTS.rug, DEFAULT_RUG)
assert.ok(hasDefault('rug') && hasDefault('wallStyle') && !hasDefault('byFridge'))
const [ru, rv, rdu, rdv] = DECOR_SPOT_SHAPES.rug.volume
near([ru + rdu / 2, rv + rdv / 2], PIP_HOME)
assert.equal(withPlacement({ placements: { rug: 'rug-braided' } }, 'rug', null).placements.rug, 'rug-pink')

// MPP-40 AC 7: no spot's volume overlaps any station at any level (strict — touching faces are fine).
// The rug is tested as its ellipse; the window spots may sit behind the bed, like the window (plan.md Assumption 9).
const STATION_BOXES = {
  wardrobe: WARDROBE_FOOTPRINT, cooker: COOKER_FOOTPRINT, cabinet: CABINET_FOOTPRINT, bed: BED_FOOTPRINT,
  fridge: FRIDGE_FOOTPRINT.map(([u, v, du, dv, h]) => [u, v, du, dv, 0, h])
}
const BEHIND_BED = new Set(['windowDressing', 'windowsill'])
const overlaps = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[4] < b[5] && b[4] < a[5]
const rugTouches = ([u, v, du, dv]) => {
  const nu = Math.max(u, Math.min(RUG.cu, u + du)), nv = Math.max(v, Math.min(RUG.cv, v + dv))
  return ((nu - RUG.cu) / RUG.ru) ** 2 + ((nv - RUG.cv) / RUG.rv) ** 2 < 1
}
for (const [station, boxes] of Object.entries(STATION_BOXES)) {
  const [su, sv] = STATION_SHIFT[station]
  boxes.forEach(([u, v, du, dv, h0, h1], i) => {
    const box = [u + su, v + sv, du, dv, h0, h1]
    for (const spot of DECOR_SPOTS) {
      if (station === 'bed' && BEHIND_BED.has(spot)) continue
      const hit = spot === 'rug' ? rugTouches(box) : overlaps(DECOR_SPOT_SHAPES[spot].volume, box)
      assert.ok(!hit, `${spot} overlaps the ${station} at level ${i + 1}`)
    }
  })
}
```

Replace the old `withPlacement` / `catalogueFor` / `ownedFor` fixtures with the new keys (`overWardrobe`, `frontRightWall`, `byFridge`, `rug`).

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: exits 0 with no assertion error. If AC 7 fails for a spot, fix the spot's `volume` (or the item art) — never the station footprint, and never widen the `BEHIND_BED` exception.

- [x] **Step 4: Run the sibling checks that read room constants**

Run: `cd foodbytes-app\client; npm run check:camera; npm run check:cook; npm run check:wardrobe`
Expected: each exits 0.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 21: Free mode in the client — badge, shop note and level chips ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/FreeModeBadge.jsx`
- Modify: `foodbytes-app/client/src/constants/petShop.js`
- Modify: `foodbytes-app/client/src/services/petService.js` (`setStationLevel`)
- Modify: `foodbytes-app/client/src/hooks/usePetShop.js` (`setLevel`)
- Modify: `foodbytes-app/client/src/components/pet/room/ShopStationCard.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/ShopView.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` (badge in the action strip)
- Modify: `foodbytes-app/client/src/components/pet/room/ShopView.css`, `CheckInActions.css` (badge and chip styles)

- [x] **Step 1: Constants**

```js
// petShop.js — MPP-40: free mode (app.pet-free-mode on the server, local testing only).
export const FREE_MODE_BADGE = '🧪 Free mode'
export const FREE_MODE_BADGE_LABEL = 'Free mode is on: everything in the shop is unlocked and free (testing)'
export const FREE_MODE_SHOP_NOTE = 'Free mode (testing): everything is unlocked and free. Nothing here costs sprinkles.'
export const FREE_MODE_LEVEL_LABEL = level => `Set to level ${level}`
export const SHOP_LEVEL_ERROR = "Couldn't change the level. Check your connection and try again."
```

- [x] **Step 2: Service and hook**

```js
// petService.js
/**
 * MPP-40 free mode only: sets one of your own stations to any level 1–4 (403 when free mode is off).
 * Resolves RoomWriteDTO { sprinkles, room }.
 */
async setStationLevel(station, level) {
  const response = await api.put(`/pet/stations/${station}/level`, { level })
  return response.data
},
```

`usePetShop`: add `const setLevel = (station, level) => purchase(\`${station}:${level}\`, () => petService.setStationLevel(station, level), result => { setStatus(upgradedLine(station, result.room?.stations?.[station])) }, SHOP_LEVEL_ERROR)`, matching the `purchase` signature `upgrade` uses (read the hook and pass arguments in the same order). Return it, and add it to the JSDoc `@returns`.

- [x] **Step 3: ShopStationCard level chips**

Add a `freeMode` and an `onSetLevel` prop. When `freeMode` is set, render this in place of `<UpgradeAction …/>`:

```jsx
<div className="pip-shop-levels" role="group" aria-label={`${station.label} level`}>
  {[1, 2, 3, 4].map(n => (
    <button
      key={n}
      type="button"
      className="pip-shop-level-chip"
      aria-pressed={level === n}
      aria-label={FREE_MODE_LEVEL_LABEL(n)}
      disabled={busy != null}
      onClick={() => onSetLevel(station.key, n)}
    >
      {n}
    </button>
  ))}
</div>
```

The thumbnail and Now/Next lines stay. In free mode the thumbnail shows the current level (`shown = level`). Use `ROOM_MIN_LEVEL`/`ROOM_MAX_LEVEL` to build the `[1..4]` list rather than a literal.

- [x] **Step 4: ShopView and the room badge**

`ShopView`: when `shop.room.freeMode`, render `<p className="pip-shop-free" role="note">{FREE_MODE_SHOP_NOTE}</p>` above the tab content, and pass `freeMode={shop.room.freeMode}` and `onSetLevel={shop.setLevel}` to each `ShopStationCard`.

`FreeModeBadge.jsx`:

```jsx
import { FREE_MODE_BADGE, FREE_MODE_BADGE_LABEL } from '../../../constants/petShop'

/** MPP-40: shown in the room's action strip while the server's pet free mode is on (testing), so it is never mistaken for the real shop. */
function FreeModeBadge() {
  return <span className="pip-free-mode-badge" role="status" aria-label={FREE_MODE_BADGE_LABEL}>{FREE_MODE_BADGE}</span>
}

export default FreeModeBadge
```

`PetRoom.jsx`: inside `.pip-room-actions`, after the Wardrobe pill, add `{decor?.room?.freeMode && <FreeModeBadge />}`.

CSS: `.pip-free-mode-badge` is an amber pill (`background: #fff1c9; color: #7a5800; border-radius: 999px; padding: 4px 10px; font-weight: 600;`) and non-interactive. `.pip-shop-free` uses the same colours as a block note. `.pip-shop-level-chip` has `min-width: 44px; min-height: 44px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;`; `[aria-pressed="true"]` gets the brand fill, and `:focus-visible` gets an outline. Hover styles go only inside `@media (hover: hover)`.

- [x] **Step 5: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\ShopStationCard.jsx | Measure-Object -Line).Lines; (Get-Content src\hooks\usePetShop.js | Measure-Object -Line).Lines; npm run build`
Expected: each file under 200 lines; `built in <n>s`, no errors.

### Task 22: Manual check on localhost at phone width — free mode, then normal mode ✓ (developer signed off 2026-10-15)

- Skill: react-frontend

**Files:**
- (none)

- [x] **Step 1: Start the local stack in free mode**

Docker Desktop running with `foodbytes-db` up (migration applied in Task 4). Backend, from the repo root in PowerShell: the `CLAUDE.md` → "Running the backend locally with Google login" recipe plus `$env:PET_FREE_MODE = "true"` before `mvn spring-boot:run`. Frontend: `cd foodbytes-app\client; npm run dev`. Open `http://localhost:5173`, log in, go to `/pet` at a 390 × 844 viewport.
Expected: the backend log shows the `PET FREE MODE IS ON` warning, and the room shows the 🧪 Free mode badge.

- [x] **Step 2: Walk every spot and every level (free mode)**

- Shop → Upgrades: each of the 5 stations shows level chips 1–4. Set **all** stations to 1, then to 4. At each setting, open Edit room: 12 dashed outlines with their names, and no outline or placed item crosses a station (the window spots behind the L3/L4 bed are the accepted exception).
- In each of the 12 spots, the picker lists every item for that spot. Place each one in turn and confirm it sits inside its outline. The rug's picker has no "Empty", and Pip stands in the middle of every rug.
- Shop → Decor shows 12 groups named after the spots, all ✓ Owned. The sprinkles counter doesn't move.
- Tapping the wardrobe opens Dress Pip, and closing it returns focus to the wardrobe. The 👕 pill still works.
- The windowsill is deeper with two brackets. At night the room dims over the front-floor items.
Expected: all observed. Record anything that's off as a fix item before Final verification.

- [x] **Step 3: Restart in normal mode and check the real economy**

Stop the backend, remove the variable (`Remove-Item env:PET_FREE_MODE`), and start it again with the same recipe.
Expected: no free-mode warning and no 🧪 badge. Shop → Upgrades shows priced upgrade buttons, not chips. Unowned items show prices. A direct `PUT /api/pet/stations/bed/level` (e.g. from the browser console via the app's own origin) returns 403. Buying a rug with enough sprinkles puts it down straight away and debits the balance.

---

## Phase 6 — Final verification

No production changes beyond the version bump — only sanity checks that the cumulative work is clean.

### Task 23: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-40 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-40: Pip's room gets 12 named decor spots, a rug spot, the wardrobe station and a deeper windowsill`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 24: Grep for stale references and check the go-live file ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: No old spot names anywhere in code**

Run: `Get-ChildItem foodbytes-app\client\src, foodbytes-app\foodbytes-api\src\main -Recurse -Include *.js,*.jsx,*.mjs,*.java | Select-String -Pattern "leftWall|rightWall|LEFT_WALL|RIGHT_WALL|DECOR_SPOT_SHIFT|WallDecor|FloorDecor"`
Expected: zero hits.

- [x] **Step 2: No new console.log**

Run: `git diff HEAD -- foodbytes-app/client/src | Select-String -Pattern "^\+.*console\.(log|debug)"`
Expected: zero hits (no added `console.log` / `console.debug` lines).

- [x] **Step 3: Free mode is off by default and documented**

Run: `Select-String -Path foodbytes-appoodbytes-api\src\main
Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\resources\application.yml -Pattern 'PET_FREE_MODE:false'; Select-String -Path CLAUDE.md, .env.example -Pattern 'PET_FREE_MODE'`
Expected: one hit in `application.yml`, at least one each in `CLAUDE.md` and `.env.example`.

- [x] **Step 4: Go-live file is current**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK`.

### Task 25: Run the full backend test suite ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 26: Production build and room checks ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Room check and build**

Run: `cd foodbytes-app\client; npm run check:room; npm run build`
Expected: `check:room` exits 0; `built in <n>s`, no errors.

- [x] **Step 2: Component sizes**

Run: `cd foodbytes-app\client\src\components\pet\room; Get-ChildItem PetRoom.jsx, furniture.jsx, decorArt*.jsx, RoomDecorLayers.jsx, DecorPicker.jsx, DecorSpotButtons.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_ | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines.

### Task 27: Write the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/MPP-40-pip-room-decor-spots/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: 12 spots (3 renamed, 9 new), 43 new items, rug as a spot with a free pink default, wardrobe station (levels 1–4, ledger ids 52–54, opens Dress Pip), deeper windowsill, art pass signed off on <date from Task 2>; the new version from Task 23.
- Migration: `2026-10-15-mpp40-pet-room-decor-spots.sql` — go-live row 11 in `railway-migrations.md`, inside `mpp15-railway-golive.sql`; applied locally; Railway gets it at the MPP-15 merge, after row 10 and before the backend deploys.
- Verification results: `mvn test` totals, `check:room`, `npm run build`, the Task 22 manual check.
- Pet free mode: `PET_FREE_MODE=true` (local only, default off, never on Railway) unlocks the room shop for testing; see `CLAUDE.md`.
- Convention note: decor spot geometry is in world coords (`DECOR_SPOT_SHAPES`); only MPP-27's 12 items use `DECOR_LEGACY_SHIFT`. Spots with a free default (rug, finishes) are `RoomSpot.hasDefault()` / `hasDefault(spot)`.
- Suggested commit subject: `MPP-40: Pip's room — 12 decor spots, rug spot, wardrobe station, deeper windowsill`.

---

## Self-review

**Spec coverage:**
- Backend spot model widened to 12 + 2 with `hasDefault` — Tasks 5, 8.
- Catalogue: 43 new items, existing 12 unchanged in id/price — Task 6 (pinned by `theTwelveMpp27ItemsKeepTheirIdsAndPrices…`).
- Wardrobe station (backend) — Task 7; (frontend art, geometry, shop, button) — Tasks 14, 16, 17, 18.
- Migration + go-live row + local apply — Tasks 3, 4; go-live check — Task 24.
- Frontend constants (12 world-coord spots, layers, items, rug default) — Task 16.
- Art: 43 new builders split by area, legacy shift — Task 13; windowsill — Task 15; rug out of the backdrop — Task 18; L4 cooker — Task 14.
- Layered drawing, name tags, wardrobe hit box, 12 buttons, picker without Empty on the rug — Tasks 18, 19.
- AC 9 art pass in the mockup with sign-off — Tasks 1, 2.
- `room.check.mjs` pins incl. AC 7 overlap — Task 20.
- Pet free mode (backend switch, free placing/upgrades, set-level endpoint) — Tasks 10, 11; docs — Task 12; client badge, note, level chips — Task 21; localhost run in free and normal mode — Task 22; default-off check — Task 24.
- Version bump — Task 23.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "similar to Task N". Art steps name the exact mockup source (`ITEMS[id].art` / `FURNITURE.wardrobe`) and the primitive mapping; the signed-off mockup is the art's source of truth, by design (Phase 1).

**Type / name consistency:** `RoomSpot.hasDefault()` (Java) ↔ `hasDefault(spot)` (JS) ↔ `DEFAULT_PLACEMENTS`; spot keys `overWardrobe … frontOfRoom` identical in `RoomSpot.key()`, `ROOM_SPOTS`, `DECOR_SPOT_SHAPES`, `DECOR_LAYERS`, `SPOT_BUTTON_ORDER`, tests and checks; `WARDROBE` / `'wardrobe'` in `RoomStation`, the CHECK, `ROOM_STATIONS`, `DEFAULT_ROOM_LEVELS`, `STATION_SHIFT`, `WARDROBE_FOOTPRINT`, `wardrobeHitBox`, `SHOP_STATIONS`, `STATION_LEVEL_NAMES`, `SHOP_UPGRADE_LINES`; `DECOR_LEGACY_SHIFT` keyed by new spot keys in Tasks 13, 17, 20; `DecorLayer` layer names `rug | wall | backFloor | frontFloor` match `DECOR_LAYERS`; free mode: `app.pet-free-mode` / `PET_FREE_MODE` ↔ `PetFreeMode.isOn()` ↔ `PetRoomDTO.freeMode` ↔ `room.freeMode`; `StationService.setLevel` ↔ `PUT /api/pet/stations/{station}/level` ↔ `petService.setStationLevel` ↔ `usePetShop.setLevel` ↔ `ShopStationCard onSetLevel`; `PetShopException.Reason.FREE_MODE_ONLY` → 403.

**Phase boundary cleanliness:**
- Phase 1 — only the Downloads mockup changes; repo untouched.
- Phase 2 — migration file + go-live row + local DB; the backend compiles unchanged (no column changed), but the local backend should not take placement writes until Phase 3.
- Phase 3 — backend compiles and every touched test class passes; free mode is off unless `PET_FREE_MODE` is set, so normal behaviour is unchanged; no frontend change yet (the old client would 400 on old keys locally — expected until Phase 5).
- Phase 4 — additive art modules, furniture and backdrop sill; the build is green and the room still draws through the old spots (legacy shift unused until keys switch).
- Phase 5 — constants switch and every consumer is rewired in one phase; ends with `check:room` and `npm run build` green.
- Phase 6 — bookkeeping and verification only.

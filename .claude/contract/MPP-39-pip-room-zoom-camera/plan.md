# Plan: Pip's room — zoomed-in draggable camera that floats back to Pip, plus white walls by default

Plan folder: `.claude/contract/MPP-39-pip-room-zoom-camera/`
Execution status: see `tasks.md` in this folder.

---

## Part 1 — Alignment

### Task reference

Jira **MPP-39** (Story, Medium, parent epic MPP-15; relates to MPP-16, MPP-27, MPP-37). The plan was primed with `/fb-plan MPP-39` on 2026-10-15. Design asset: `Downloads\pip-room-zoom-mockup.html` (final choices: Zoomed in, Corner, White walls, Lilac floor).

Acceptance criteria (verbatim from the ticket):

**Room look (corner view, as today)**
1. The room keeps today's corner angle: back wall, side wall and floor. Furniture art, decor spots and the fridge/cabinet tap areas carry over.
2. The room is bigger and lower than today. In the mockup's units the floor is about 300 × 260 (up from about 180 × 160) and the walls are about 150 high, so it reads as a room rather than a tall narrow box. Furniture is spread out to fill it: the fridge and cooker on the side wall; the trophy cabinet and the bed (under the window) along the back wall; the rug in the middle of the floor.
3. A new free **White** wall style becomes the default wall style. The back wall is pure white (`#ffffff`) and the side wall a cool grey-white (`#eceef2`), so the corner still reads.
4. **Floors are unchanged.** Lilac stays the default floor, and the floor styles, prices and ownership stay as they are today.
5. The three surfaces are clearly distinct. A skirting board runs along the bottom of both walls, and soft corner lines mark where the walls and the floor meet.
6. Rooms that never picked a wall style in Edit room show the new white default. Rooms that did pick one keep their choice. Lavender stays available, free and owned, so anyone can switch back.

**Camera: zoomed in**
7. By default the room draws at about 2× today's size on a phone. It no longer has to fit the window: the area between Pip's header and the room buttons is filled edge to edge, and the ends of the room can be off-screen.
8. On open, the camera is centred on Pip, framed a little above his feet so his body and level bar are in view.

**Camera: dragging**
9. Dragging (finger, mouse or pen) pans the camera. A press that moves less than 6px is still a tap, so the fridge, cabinet and Edit-room decor spots still work. A drag never triggers them.
10. The camera trails the drag. It closes about 22% of the gap each frame, so it floats just behind the finger instead of being glued to it.
11. The camera can go beyond the room's walls but cannot get lost. The free area extends about 60 room units past the room on every side. Past that it is rubber-banded: the first pixels move almost freely, then it stiffens, and it never goes more than about 120 units further.
12. On release, wherever you let go, the camera floats back to Pip over **about 2 seconds**, with an ease-in-out. (0.4s and 0.7s were too fast; a 7%-per-frame chase was too slow.)
13. Grabbing the camera mid-float picks it up from where it is, without a jump.
14. When Pip walks to the cooker or the bed (routine, cook-and-serve), the camera floats after him.

**Camera: zoom**
15. Pinching zooms on touch. With a mouse, Ctrl + wheel zooms, and a trackpad pinch sends the same event. A plain wheel still scrolls the page. Zoom runs from 0.35× to 2.2× of the new default, eases smoothly (about 25% of the gap per frame) and stays centred on Pip.
16. **The zoom level is saved in the browser** (`localStorage`), and the room opens at the zoom you left it on that device. If storage is blocked or empty, it opens at 1× with no error. The camera position is not saved: it always opens on Pip.

**Accessibility and edge cases**
17. The room is focusable. With focus on it, arrow keys pan (hold to keep going, with the same edge resistance), and releasing the key floats back to Pip. `+` and `−` zoom, and `0` resets to 1×.
18. A 🎯 button (bottom right of the room, at least 44px) floats the camera back to Pip, labelled "Centre on Pip".
19. With `prefers-reduced-motion`, there is no trailing, floating or zoom easing: the camera moves straight to where it should be.
20. The speech bubble and the "Drag to look around" hint stay fixed to the screen, not to the room, and stay readable at every zoom. The fridge and cabinet tap areas and the Edit-room decor spots line up with the art at every zoom and camera position.
21. Version bump (MINOR, as a Story), with a CHANGELOG line.

Ticket scope: in scope are the camera, the bigger room and furniture re-layout, the White wall default (`petDecor.js` + `DecorCatalogue`), and updates to `room.check.mjs`, `DecorCatalogueTest`, `PetRoomServiceTest` and `DecorServiceTest`. Out of scope: floors, server-side zoom, the front-on view, new furniture or decor (the potted plant only "if cheap"), saving the camera position, and the sheets themselves.

### Restated goal

Pip's room stops being a letterboxed picture and becomes a space you look around. The room gets bigger and lower: a 260 × 300 floor with 150-high walls, in the app's own isometric units. The four stations, window and decor spots are spread along the longer walls. The whole picture sits on a "world" layer that a camera pans and zooms. By default it draws at 2 screen px per room unit, about twice today's phone scale. You can drag it with a trailing, rubber-banded feel, and it floats back to Pip over 2 s when you let go. It follows him when he walks, zooms by pinch, Ctrl+wheel or `+`/`−`/`0`, and the zoom is remembered in `localStorage`. The tap areas live on the same layer, so they always line up with the art. A new free **White** wall style becomes the default on both the client and the server. Lavender stays free and owned for everyone, but stops being the default. A skirting board and soft corner lines separate the three surfaces.

### In scope

- New room proportions (260 u × 300 v floor, 150-high walls) and the backdrop redrawn to them: walls, floor patterns, skirting, soft corner lines, window lowered and moved, rug re-centred.
- Per-station floor shifts (cooker, fridge, cabinet, bed) and per-spot decor shifts, applied as SVG translates. The art tables stay untouched, so the shop and picker thumbnails are unchanged.
- The cooker level-4 hood lowered by 30 so it fits under a 150-high wall. This is the only art edit.
- A world layer (SVG + station buttons + decor spot buttons) inside a screen-sized stage. A camera drives the layer's CSS transform.
- `usePipCamera` hook: drag pan with a 6px tap slop and click swallowing, 22% trail, 60-unit free pad plus 120-unit rubber band, 2 s ease-in-out float to Pip, grab mid-float, follow Pip on position or phase change, pinch zoom, Ctrl+wheel zoom, keyboard pan and zoom, reduced motion, resize.
- Pure camera maths in `utils/roomCamera.js`, pinned by a new `roomCamera.check.mjs`.
- Zoom persistence in `utils/roomZoomStore.js` (`localStorage`, try/catch, falls back to 1×).
- 🎯 "Centre on Pip" button; hint text updated to mention dragging; bubble and hint stay screen-fixed.
- White wall style: `petDecor.js` (`wall-white`, new default, `skirting` colour per wall style) and `DecorCatalogue.java` (`wall-white` default, `wall-lavender` free but not default). A "free" rule is split out from "default" in `DecorService` and `PetRoomService`.
- Updated checks and tests: `room.check.mjs`, `DecorCatalogueTest`, `PetRoomServiceTest`, `DecorServiceTest`.
- MINOR version bump + CHANGELOG.

### Explicitly out of scope

- Any floor change: lilac stays default, and floor prices and ownership are unchanged.
- Saving zoom on the server or across devices, and saving the camera position.
- The front-on view.
- The mockup's potted plant (back-right corner). It is not cheap: it needs a new art piece plus a slot in the layout. Leave it for a separate decor ticket.
- Redrawing any furniture or decor art beyond the cooker L4 hood drop.
- Changes to the fridge, cabinet, shop, wardrobe or edit-room sheets.
- Any DB migration (see the audit: no row stores a wall style).

### Pattern Reference

The ticket names the files: `petDecor.js`, `DecorCatalogue`, `room.check.mjs`, `hitBoxStyle`, `DecorCatalogueTest`, `PetRoomServiceTest`, `DecorServiceTest`, and the mockup's camera code (`pip-room-zoom-mockup.html`, lines ~736–925: `PX_PER_UNIT`, `rubber`, `rubberAxis`, `chase`, `focusPip`, `wireDrag`). Other references I chose:
- `utils/pipSeenStore.js`: the try/catch `localStorage` store shape, used for `roomZoomStore.js`.
- `utils/reducedMotion.js` → `prefersReducedMotion()`: the one reduced-motion read for JS-timed motion.
- `components/pet/room/roomLayout.js`: pure, node-checkable layout data. The new shift tables live here.
- `*.check.mjs` + `check:*` npm scripts: the project's stand-in for unit tests.

### Constraints flagged on the brief

- `touch-action: none` on the room, so pinch and drag don't fight page scroll. (The app has no tab-swipe handler today: `grep touchstart` finds only modal click-outside listeners.)
- Zoom lives in `localStorage` only, with every read and write wrapped in try/catch. No schema change for zoom.
- Hit boxes must follow a moving camera. The ticket says: "either derive them from the live viewBox or move them into the SVG."
- Default wall in the DB: check whether rooms store `wall-lavender`. If they do, a migration goes into the MPP-15 go-live SQL.
- Version bump: MINOR (Story).
- MPP-15 epic is local-first: any DB work targets local `foodbytes-db` plus the go-live file. Not needed here.

### Assumptions made

- **Room units = the app's isometric units, mapped from the mockup.** The mockup's back wall (x) is the app's right wall (`u = 0`, axis `v`), and its side wall (z) is the app's left wall (`v = 0`, axis `u`). So the floor becomes `u` 0–260 by `v` 0–300 with walls 150 high. The app's `P()` projection is unchanged (AC 1: keep today's angle). The mockup's own projection is slightly steeper and is not adopted.
- **Furniture is spread by translating whole stations along their wall, not by editing art coordinates.** `P()` is linear, so a floor shift is a constant SVG translate. Shifts: cooker `[+30, 0]`, fridge `[+60, 0]`, cabinet `[0, +30]`, bed `[0, +70]`. Today's station order is kept: cooker nearer the corner, fridge further along. The mockup swaps them, but AC 1 says the art carries over.
- **Window moves with the bed:** `v + 70`, and drops 30 in height (`h` 74–134) so it sits on a 150 wall above the bed.
- **Decor spots move with fixed shifts** `[du, dv, dh]`: leftWall `[−130, 0, −40]` (u 20–56, h 92–130, the free stretch near the corner); rightWall `[0, +216, −40]` (v 250–296, past the window and clear of bed L4); floor `[+70, +20, 0]` (u 220–256, v 130–170, clear of the rug). All three wall-mounted spots currently sit above h 150, so they must drop.
- **Cooker L4 hood drops 30** (h 136–180 → 106–150, canopy 124–136 → 94–106, rail and utensils −30) so nothing pokes above the wall. `COOKER_FOOTPRINT[3]` h1 becomes 150. This is the one art edit.
- **Rug re-centred** at `(u 140, v 150)`, same radii. Pip's home follows (`PIP_HOME = [RUG.cu, RUG.cv]`). The cooker spot becomes `[126, 64]`, today's `[96, 64]` plus the cooker shift.
- **Hit boxes: a CSS-transformed world layer**, not a per-frame viewBox. The SVG gets a static world viewBox. The station and decor buttons stay real HTML buttons positioned in % of the world box. The camera writes one `transform` on the world element each frame. This follows the ticket's first option ("derive them from the live" camera) without re-rendering React per frame.
- **Scale:** `ROOM_PX_PER_UNIT = 2` (the mockup's corner value). Today a 360-unit box fits a ~390px phone at ~1.05 px/unit, so this is about 2×. It is a fixed px scale, so desktop shows more room rather than a bigger room.
- **Pip focus point** is Pip's foot point in world units, lifted `PIP_FOCUS_LIFT = 50` units (his ~92-unit-tall figure at scale 0.46: mid-body plus the level bar). During the cook-and-serve walk the focus is the cooker spot. At night it is the bed anchor plus the bed shift.
- **The zoom key is per device, not per user:** `pip-room-zoom`, as in the mockup. The ticket says "in the browser".
- **Pinch "stays centred on Pip":** a pinch changes zoom and re-aims the camera at Pip, like the mockup's wheel zoom. It does not zoom around the fingers' midpoint.
- **Station and decor buttons lose their CSS `min-width`/`min-height: 44px`.** Inside a scaled layer a minimum size makes the button outgrow its art, which breaks AC 20. At the default 2 px/unit the smallest box (fridge L1, ~60 units) is about 120px.
- **Lavender's ownership:** "free" (`price == 0`) now means owned by everyone. "Default" (one per finish) means shown when nothing is stored. Placing a free non-default style stores a row. Placing the default deletes the row (as today).
- **Hint text:** `ROOM_HINT` becomes "Drag to look around · tap the fridge 🧊 or cabinet 🏆". On a phone "Ctrl + scroll" (the mockup's desktop wording) does not apply.
- **Skirting colour per wall style:** each wall style in `ROOM_STYLES` gains a `skirting` hex: white `#dfe3e9` and lavender `#cbbdea` (from the mockup), mint `#bcdcc8`, peach `#ecc4ab`, sky `#b9d3ee`, sprig `#cfe0bd`. The right wall's skirting is `shade(skirting, −6)`. Corner lines are `shade(wall.left, −14)` and `shade(floor.base, −22)`.
- **Area outside the room** (seen past the walls) shows the stage background, a neutral `#f3f1f8`. It was the lavender `#ece5fb`, which would clash with white walls.

### Cross-code alignment audit (FE ↔ BE ↔ DB)

- **Wall style storage (local `foodbytes-db`, where MPP-15 tables live):** `SHOW COLUMNS FROM pet_room_placements` → `id bigint NO PRI`, `user_id bigint NO MUL`, `spot varchar(16) NO`, `item_key varchar(32) NO`. `SELECT spot, item_key, COUNT(*) … GROUP BY spot, item_key` → **0 rows**.
- **Same query on the mysql MCP (Railway):** `pet_room_placements` and `pet_decor_owned` exist, and both group-by queries return **0 rows**.
- **Conclusion for AC 6:** no room stores a wall style anywhere. That fits the code: `DecorService.place` deletes the row for the default, so `wall-lavender` was never stored. Every room is "never chose" and turns white through `DecorCatalogue.defaultFor(WALL_STYLE)` with **no migration**. `item_key varchar(32)` fits `wall-white` (10 chars), which `DecorCatalogueTest.idsFitTheColumnAndResolve` already guards.
- **`pet_decor_owned`:** `item_key varchar(32)`. 0 rows for `wall-%`. Free styles are never stored as owned rows: ownership of free items is computed in `PetRoomService.decorOf`.
- **Name chain:** DB `item_key` ↔ `DecorCatalogue.Item.id` ↔ `DecorItemDTO.id` / `placements.wallStyle` ↔ `PetRoomDTO.decor[].id` ↔ client `ROOM_STYLES` key / `DEFAULT_WALL_STYLE`. The new id is `wall-white` on both sides.
- **Unapplied migrations:** none needed by this plan. No entity or column changes, so the Hibernate `validate` risk is nil.

---

## Part 2 — Technical design

### Approach

**Room geometry first, camera second.** Today `roomDecor.jsx` draws a square room (`WALL_LENGTH = 193`, `WALL_HEIGHT = 180`) that fills a fixed `0 0 360 330` viewBox. The new room size goes into `constants/petRoom.js` as `ROOM_SIZE = { u: 260, v: 300, h: 150 }`, and the backdrop is drawn from it. The backdrop also gains the skirting board and soft corner lines, a lowered and moved window, and the re-centred rug. Furniture is spread without touching its art. `P()` is linear, so moving a station `du, dv` along the floor equals a constant pixel offset (`shiftPx`). `roomLayout.js` gains `STATION_SHIFT` and `DECOR_SPOT_SHIFT` tables. `PetRoom` wraps each `<Station>` (art, gauge, steam, plate, sleeping Pip) in a `<g transform>`. `RoomDecorLayers` wraps each spot's art and outline the same way. The hit-box functions add the shift. `stationThumbBox` and `decorThumbBox` don't, so the shop and picker thumbnails stay exactly as they are. Only the walking and cooker-routine Pip draw outside a station group, so `PIP_COOKER_SPOT` is stored in world coordinates.

**The world layer is how the camera moves.** I rejected two alternatives. The first was animating the SVG `viewBox` and recomputing the `%` hit boxes each frame. That needs React state at 60 fps, or hand-written DOM writes to every button. The second was moving the buttons into the SVG. The SVG is `role="img"`, which makes its children presentational, and MPP-19/23/27 deliberately keep real `<button>`s outside it. Instead, `.pip-room-stage` becomes a screen-sized, focusable, `overflow: hidden`, `touch-action: none` viewport. Inside it, `.pip-room-world` is an absolutely positioned box sized to the static world rectangle at `ROOM_PX_PER_UNIT`. It holds the SVG (with `viewBox` set to the world rectangle) and the station and decor buttons, placed by `hitBoxStyle()` in % of that rectangle. The camera writes `transform: translate3d(tx, ty, 0) scale(zoom)` (origin `0 0`) on it, so art and buttons move together and always line up (AC 20). The bubble, hint, 🎯 button and visually-hidden `PipHeadBarStatus` stay as stage children, fixed to the screen.

**Camera logic splits into pure maths plus one hook.** `utils/roomCamera.js` ports the mockup's maths as pure functions: `clampZoom`, `rubber`, `rubberAxis`, `fitAxis`, `easeInOut`, `cameraBounds`, `viewSize`, `worldTransform`. They are pinned by `roomCamera.check.mjs`, since there is no test runner. `hooks/usePipCamera.js` owns the mutable camera (`useRef`, never `useState`, so a frame never re-renders `PetRoom`). It also owns the rAF `chase` loop (trail 0.22, 2 s eased float, zoom ease 0.25, reduced motion snaps) and the listeners on the stage. Those are pointer drag with 6px slop, pointer capture and capture-phase click swallowing; two-pointer pinch; Ctrl+wheel (`passive: false`); arrow, `+`, `−` and `0` keys; and a `ResizeObserver`. It exposes `recentre()` for 🎯. A `focus` input (world `[x, y]`, from `pipFocusPoint(position, phase, levels)` in `roomLayout.js`) re-targets the camera whenever Pip's spot changes, which gives the follow behaviour (AC 14). The first placement runs in `useLayoutEffect`, so the room never flashes at the origin. Zoom is read once on mount from `roomZoomStore` and written on every zoom change.

**White default is a catalogue change plus one rule split.** On the server, `DecorCatalogue` gains `wall-white` (free, default), and `wall-lavender` becomes free but not default. A new `Item.isFree()` (`price == 0`) replaces `isDefault()` where the question is "owned by everyone": in `PetRoomService.decorOf` and `DecorService.buy`. It also lets a free non-default style be placed without an owned row. `isDefault()` keeps meaning "what an unset finish shows", and placing it deletes the row. Nothing is stored for any room today (audit), so every existing room turns white with no migration. Placing Lavender later stores a row and survives (AC 6). On the client, `petDecor.js` gets `wall-white` first in `ROOM_STYLES` and `DEFAULT_WALL_STYLE = 'wall-white'`, plus a `skirting` colour on every wall style.

### Skills to invoke during execution

- `react-frontend`: owns every `client/src` change (the world/stage restructure in `PetRoom.jsx`, `usePipCamera`, the stores and constants, CSS, touch and accessibility rules, the file-size budget, no new dependency).
- `java-backend`: owns `DecorCatalogue`, `DecorService`, `PetRoomService` and their tests (service-layer rule change, no entity or schema change).

Rules: none of `.claude/rules/*` apply. They cover recipes, ingredients and variants, and this task touches no recipe data.

### Diagram

```mermaid
flowchart TB
  subgraph PetRoom
    stage[".pip-room-stage<br/>focusable · overflow hidden · touch-action none"]
    world[".pip-room-world<br/>transform: translate3d(tx,ty) scale(zoom)"]
    svg["svg viewBox = ROOM_WORLD<br/>backdrop · shifted stations · shifted decor · Pip"]
    btns["station + decor buttons<br/>hitBoxStyle(box) = % of ROOM_WORLD"]
    fixed["screen-fixed: bubble · hint · 🎯 · level status"]
    stage --> world --> svg
    world --> btns
    stage --> fixed
  end
  focus["pipFocusPoint(position, phase, levels)"] -->|focus [x,y]| hook
  hook["usePipCamera<br/>refs: cam, target, zoom · rAF chase"] -->|style.transform each frame| world
  stage -->|pointer · wheel · keys · resize| hook
  hook <-->|read once / write on change| store["roomZoomStore (localStorage)"]
  hook --> math["utils/roomCamera.js (pure)<br/>rubber · rubberAxis · fitAxis · easeInOut · worldTransform"]
```

### Data shapes

#### `constants/petRoom.js` (replaces `ROOM_VIEWBOX_SIZE` / `ROOM_VIEWBOX`)

```js
export const ROOM_SIZE = { u: 260, v: 300, h: 150 }          // floor along the left wall (u) and right wall (v); wall height
export const ROOM_WORLD = { x: -84, y: 10, width: 564, height: 394 } // projected room bounds (x −62.3…459.6, y 30…383) + ~20 margin
export const ROOM_WORLD_VIEWBOX = `${ROOM_WORLD.x} ${ROOM_WORLD.y} ${ROOM_WORLD.width} ${ROOM_WORLD.height}`
export const ROOM_PX_PER_UNIT = 2
export const ROOM_ZOOM = { MIN: 0.35, MAX: 2.2, DEFAULT: 1, STEP: 1.2, WHEEL_RATE: 0.0012, EASE: 0.25 }
export const ROOM_CAMERA = { FREE_PAD: 60, OVERSCROLL: 120, STRETCH: 0.55, FOLLOW: 0.22, SETTLE_MS: 2000, TAP_SLOP_PX: 6, KEY_STEP: 24, WALL_TOP_PAD: 20 }
export const ROOM_ZOOM_STORAGE_KEY = 'pip-room-zoom'
export const PIP_FOCUS_LIFT = 50
export const ROOM_HINT = 'Drag to look around · tap the fridge 🧊 or cabinet 🏆'
export const ROOM_RECENTRE_LABEL = 'Centre on Pip'
export const ROOM_CAMERA_LABEL = "Pip's room. Drag, or use the arrow keys, to look around. Plus and minus zoom."
```

#### `components/pet/room/roomLayout.js` (additions and changes)

```js
export const RUG = { cu: 140, cv: 150, ru: 58, rv: 44 }       // was { cu: 100, cv: 85, … }
export const PIP_COOKER_SPOT = [126, 64]                       // world coords (was [96, 64] + cooker shift)
export const STATION_SHIFT = { cooker: [30, 0], fridge: [60, 0], cabinet: [0, 30], bed: [0, 70] }   // [du, dv]
export const DECOR_SPOT_SHIFT = { leftWall: [-130, 0, -40], rightWall: [0, 216, -40], floor: [70, 20, 0] } // [du, dv, dh]
export const WINDOW_SHIFT = [0, 70, -30]                       // used by roomDecor.jsx
export function shiftPx([du, dv, dh = 0]) // → [dx, dy] = P(du, dv, dh) − P(0, 0, 0)
export function shiftTransform(shift)    // → 'translate(dx dy)' string, 1 dp
export function pipFocusPoint(position, phase, levels) // → [x, y] world, lifted PIP_FOCUS_LIFT: the cooker spot while phase ∈ WALKING/COOKING/SERVED or position = COOKER; bedTop[level] + bed shift at BED; PIP_HOME otherwise
// (signature refined from (pose, …) while writing tasks.md, 2026-10-15: the position names the spot without sniffing the pose's scale)
export function hitBoxStyle(box)         // now % of ROOM_WORLD: left = (box.x − ROOM_WORLD.x) / width …
// fridgeHitBox / cabinetHitBox / decorSpotHitBox: unchanged footprint maths + shiftPx(STATION_SHIFT[…] | DECOR_SPOT_SHIFT[…])
// stationThumbBox / decorThumbBox: unchanged (no shift)
export const COOKER_FOOTPRINT[3] = [48, 0, 94, 40, 0, 150]    // h1 180 → 150 (hood dropped)
```

#### `utils/roomCamera.js` (new, pure)

```js
clampZoom(z)                         // → z within [ROOM_ZOOM.MIN, ROOM_ZOOM.MAX]; non-finite → DEFAULT
rubber(over)                         // → (1 − 1 / (over·STRETCH/OVERSCROLL + 1)) · OVERSCROLL; 0 → 0, ∞ → OVERSCROLL
rubberAxis(c, size, lo, hi)          // → c inside [lo+size/2, hi−size/2] (or the midpoint when the view is wider), damped past it
fitAxis(c, size, lo, hi)             // → hard clamp of the same range (used to aim at Pip)
easeInOut(t)                         // cubic in-out, 0→0, 0.5→0.5, 1→1
cameraBounds()                       // → { minX, maxX, minY, maxY }: room corners at h 0 and ROOM_SIZE.h + WALL_TOP_PAD, ± FREE_PAD
viewSize(stageW, stageH, zoom)       // → [stageW / (PX·zoom), stageH / (PX·zoom)] in world units
worldTransform(cx, cy, zoom, stageW, stageH) // → 'translate3d(txpx, typx, 0) scale(zoom)', tx = stageW/2 − (cx − ROOM_WORLD.x)·PX·zoom
```

#### `utils/roomZoomStore.js` (new)

```js
readRoomZoom()   // → clampZoom(Number(localStorage[ROOM_ZOOM_STORAGE_KEY])) or ROOM_ZOOM.DEFAULT on missing / blocked / non-numeric
writeRoomZoom(z) // try { localStorage.setItem(key, String(z)) } catch { /* zoom still works this visit */ }
```

#### `hooks/usePipCamera.js` (new)

```js
usePipCamera({ stageRef, worldRef, focus /* [x, y] world */ }) // → { recentre: () => void }
```

#### `constants/petDecor.js`

```js
export const DEFAULT_WALL_STYLE = 'wall-white'
// ROOM_STYLES gains, first: 'wall-white': { label: 'White', spot: 'wallStyle', left: '#eceef2', right: '#ffffff', skirting: '#dfe3e9' }
// and a `skirting` on every other wall style (lavender #cbbdea, mint #bcdcc8, peach #ecc4ab, sky #b9d3ee, sprig #cfe0bd)
```

#### `DecorCatalogue.java`

```java
public record Item(String id, RoomSpot spot, int price, boolean isDefault) {
    /** Free items are owned by everyone without a row (the defaults and Lavender). */
    public boolean isFree() { return price == 0; }
}
new Item("wall-white", WALL_STYLE, 0, true),     // new, first of the wall styles
new Item("wall-lavender", WALL_STYLE, 0, false), // was the default; still free
```

The catalogue total stays 4900.

#### HTTP contract

Unchanged in shape. `GET` room responses now carry `placements.wallStyle = "wall-white"` for unset rooms, and `decor[]` gains `{ id: "wall-white", kind: "wallStyle", price: 0, owned: true }`. Lavender stays `owned: true`.

### Runtime quality notes

Frontend dimensions are mapped onto the browser runtime (single-threaded event loop, effect cleanup, re-render cost).

- **Resource cleanup:** `usePipCamera` registers every stage listener (`pointerdown/move/up/cancel`, capture `click`, `wheel` with `passive: false`, `keydown/keyup`) and a `ResizeObserver` in one `useEffect`. The cleanup removes them all, disconnects the observer and `cancelAnimationFrame`s the running loop. Pointer capture is released on `pointerup` and `pointercancel`. No timers except the mockup's 0 ms "un-swallow" `setTimeout`, which is cleared in cleanup too.
- **Concurrency / ordering:** one rAF loop at a time (`chase()` cancels the previous frame). A drag sets `target.pip = false` and clears `from`. Release and 🎯 start the eased float from the current camera, so grabbing mid-float never jumps (AC 13). A second pointer converts a drag into a pinch (pan stops). Focus changes while dragging only update where the float will go. The zoom write is fire-and-forget to `localStorage`, and the last write wins. No server state is involved.
- **Allocation / cost behaviour:** the camera state lives in refs and each frame writes one `style.transform` string. `PetRoom` never re-renders from camera motion. The backdrop stays cached per (night, wall, floor). The world element is ~1128 × 788 CSS px at 1×. `will-change: transform` is set only while `.is-moving` (dragging or floating), so the browser re-rasterises crisply at rest instead of keeping a blurry scaled layer.
- **Error paths:** `localStorage` failures are caught in `roomZoomStore` and fall back to 1× (AC 16). A missing `matchMedia` (node) reads as "no reduced motion". A stage with 0 size (before layout) skips the transform until the `ResizeObserver` reports a size. No network calls are added. The backend decor endpoints keep their existing `PetShopException` / `IllegalArgumentException` → 4xx mapping. The only behaviour change is that placing Lavender now succeeds without an owned row.

### Risks and judgement calls

- **Wall height 150 forces moves.** The window (top 164), both wall decor spots (tops 170 and 178) and the cooker L4 hood (180) sit above a 150 wall today. The plan drops them (window −30, wall spots −40, hood −30). The hood drop is the one change to furniture art, so check it on the level-4 cooker.
- **Bed L4 headboard (h 127) now overlaps more of the window (bottom h 74).** It already overlapped (bottom h 104). It's drawn in front, so it reads as a tall headboard under a window. If it looks wrong, lower the window drop to −20.
- **All the shift numbers are first-pass layout values.** I derived them from the mockup and checked them for collisions on paper. `room.check.mjs` pins non-overlap of buttons and that everything stays inside the world. Final placement is a visual call at `/pet`, so tasks include a manual check.
- **Station order is kept (cooker near the corner, fridge further out). The mockup swaps them.** Swapping would mean redrawing the fridge and cooker art at all four levels, so I treated it as out of scope under AC 1 ("art carries over").
- **Button minimum size dropped.** Inside the scaled layer at 0.35× zoom the fridge L1 button is ~42px, just under 44. I accept this as the cost of AC 20. The 🎯 and all screen-fixed buttons keep ≥44px.
- **Pinch re-aims at Pip rather than zooming around the fingers.** This matches the "stays centred on Pip" wording, but a user may expect focal-point zoom.
- **Lavender users:** anyone who had deliberately switched back to Lavender stored nothing (it was the default), so they will see White too. The audit shows 0 placement rows anywhere, so no real room is affected.
- **No migration.** If Railway gains `wall-lavender` rows before merge (it can't today, since the default is never stored), they'd still resolve to Lavender. Nothing goes into the go-live SQL.
- **`PetRoom.jsx` grows** (now 277 lines). The camera logic goes in the hook. The stage markup adds ~20 lines, so the file stays under 400. The executor measures it.
- **Mockup approval:** the developer already reviewed `pip-room-zoom-mockup.html`, so the mockup-first rule is satisfied. The decor-spot and window re-placement is not shown in the mockup (it has no decor spots), so it gets a visual check at Ready for Test.

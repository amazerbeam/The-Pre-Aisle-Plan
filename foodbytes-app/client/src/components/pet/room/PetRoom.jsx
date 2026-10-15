import { useEffect, useId, useRef } from 'react'
import { MEAL_TYPE_LABELS } from '../../../constants/mealTypes'
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { SHOP_TAB_KEYS } from '../../../constants/petDecor'
import { DEFAULT_ROOM_LEVELS, ROOM_CAMERA_LABEL, ROOM_HINT, ROOM_PX_PER_UNIT, ROOM_STATIONS, ROOM_WORLD, ROOM_WORLD_VIEWBOX } from '../../../constants/petRoom'
import usePipCamera from '../../../hooks/usePipCamera'
import useRoomOverlay from '../../../hooks/useRoomOverlay'
import { pipWalkMs } from '../../../utils/cookServe'
import DecorPicker from './DecorPicker'
import DecorSpotButtons from './DecorSpotButtons'
import EditRoomBar from './EditRoomBar'
import EditRoomButton from './EditRoomButton'
import { stationArt } from './furniture'
import FreeModeBadge from './FreeModeBadge'
import FridgeView from './FridgeView'
import { DecorLayer } from './RoomDecorLayers'
import { roomBackdrop } from './roomDecor'
import { FridgeGauge, NightDim, PotSteam, ServedPlate, SleepZs } from './roomEffects'
import { COOK_WALK_OFFSET, ROOM_DRAW_ORDER, STATION_SHIFT, cabinetHitBox, cookPose, fridgeHitBox, hitBoxStyle, pipFocusPoint, pipPose, resolveRoomLevels, shiftTransform, wardrobeHitBox } from './roomLayout'
import PipHeadBarStatus from './PipHeadBarStatus'
import RecentreButton from './RecentreButton'
import RoomPip from './RoomPip'
import RoomStyleChips from './RoomStyleChips'
import ShopButton from './ShopButton'
import ShopView from './ShopView'
import TrophyCabinetView from './TrophyCabinetView'
import WardrobeButton from './WardrobeButton'
import WardrobeView from './WardrobeView'
import './PetRoom.css'

// MPP-40: every station but the bed, back to front; the bed is drawn after the back-floor decor layer.
const BACK_STATIONS = ROOM_DRAW_ORDER.filter(station => station !== ROOM_STATIONS.BED)

/**
 * MPP-16: Pip's angled-corner room — every station at `levels` (default all 1s), drawn
 * back-to-front so nearer objects overlap farther ones (AC 4), and the speech bubble
 * top-right (AC 5).
 * MPP-17: `position` (from pipPosition) puts Pip on the rug, at the cooker with the pot
 * steaming, or asleep in bed with the night window, the room dimmed and z's above him.
 * MPP-18: `serving` ({ phase, mealType } from useCookAndServe) overrides the routine with
 * the day scene: Pip walks rug → cooker, cooks (steam), serves (plate) and walks back.
 * MPP-19: the fridge gauge, a real button over the fridge that opens FridgeView, and the "tap the fridge" hint.
 * MPP-21: the bubble is a SpeechBubble — a live-region line of text plus optional
 * `bubbleActions` (the check-in controls) under it.
 * MPP-23: the cabinet — a real button over the cabinet art that opens TrophyCabinetView with `cabinet` ({ data, loading, error, retry } from usePetAwards).
 * MPP-31: `herb` ({ form, wilted, phase }) draws Pip's current herb form; `levelBar` ({ label, pct, phase }) — MPP-38: drawn over Pip's head by RoomPip, spoken by PipHeadBarStatus.
 * MPP-32: `wardrobe` ({ data, hasNew, firstNewSlot, peakForm, equip, undress, markSeen, error }) adds the Wardrobe strip and the Dress Pip sheet.
 * MPP-25 / MPP-37: the sprinkles counter now lives in Pip's header (PipHeader), not in the room.
 * MPP-37: full screen — .pip-room-stage fills the height.
 * MPP-39: the room is a bigger world on a camera (usePipCamera) — drag, pinch, Ctrl+wheel or keys to look around; it floats back to Pip and follows him. Stations are shifted groups (roomLayout STATION_SHIFT); decor is drawn in world coords.
 * MPP-27: `decor` ({ room, editing, selectedSpot, openSpot, closeSpot, place, toggle, done, error }) draws your own wall / floor styles and placed decor, and drives ✏️ Edit room.
 * MPP-40: 12 decor spots drawn in four layers among the stations (rug, wall, back floor, front floor), a wardrobe station whose button opens Dress Pip, and a 🧪 badge while the server's free mode is on.
 * MPP-26: `shop` ({ room, sprinkles, armed, busy, status, error, arm, upgrade, reset }) adds the 🛍 Shop pill beside Wardrobe and the Shop sheet; `levels` (from the pet's room) draws each station at its owned level.
 */
function PetRoom({ name, mood, bubble, bubbleActions = null, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null, cabinet = null, herb, levelBar = null, wardrobe = null, shop = null, decor = null }) {
  const resolved = resolveRoomLevels(levels)
  // MPP-27: `decor` = { room, editing, … } from useRoomEdit; null until the pet's room has loaded.
  const placements = decor?.room?.placements ?? null
  const editing = decor?.editing ?? false
  const phase = serving?.phase ?? null
  const scenePosition = serving ? PIP_POSITIONS.RUG : position
  const pose = serving ? cookPose() : pipPose(position, mood, resolved)
  const asleep = scenePosition === PIP_POSITIONS.BED
  const label = `${name}'s room — ${name} is ${roomDoing(position, mood, serving)}`

  const fridgeOverlay = useRoomOverlay()
  const cabinetOverlay = useRoomOverlay()
  const wardrobeOverlay = useRoomOverlay()
  const pickerOverlay = useRoomOverlay()
  const shopOverlay = useRoomOverlay()
  const overlayId = useId().replace(/:/g, '')
  const fridgeTitleId = `pip-fridge-title-${overlayId}`
  const cabinetTitleId = `pip-cabinet-title-${overlayId}`
  const wardrobeTitleId = `pip-wardrobe-title-${overlayId}`
  const shopTitleId = `pip-shop-title-${overlayId}`
  const pickerTitleId = `pip-decor-picker-title-${overlayId}`
  const editButtonRef = useRef(null)
  // MPP-39: the camera looks at the world layer and follows Pip's spot.
  const stageRef = useRef(null)
  const worldRef = useRef(null)
  const camera = usePipCamera({ stageRef, worldRef, focus: pipFocusPoint(position, phase, levels) })
  const fridgeFill = fridge?.fill ?? null
  const stationProps = { levels: resolved, position: scenePosition, phase, pose, herb, levelBar, fridgePct: fridgeFill?.pct ?? null }
  // MPP-19 / MPP-23 / MPP-26 / MPP-27 / MPP-32: the room behind an open overlay is out of the tab order and the a11y tree.
  const anyOpen = fridgeOverlay.isOpen || cabinetOverlay.isOpen || wardrobeOverlay.isOpen || shopOverlay.isOpen || pickerOverlay.isOpen
  const behind = anyOpen ? { inert: '', 'aria-hidden': true } : {}

  // MPP-27: which spot's picker is open (highlighted in the room); the overlay owns open/closed.
  const selectedSpot = pickerOverlay.isOpen ? decor?.selectedSpot ?? null : null
  const decorProps = { placements, editing, selectedSpot }
  const openShop = (tab) => {
    shop.setTab(tab)
    shopOverlay.open()
  }
  const openPicker = (spot, button) => {
    pickerOverlay.triggerRef.current = button // focus returns to the tapped spot
    decor.openSpot(spot)
    pickerOverlay.open()
  }
  // MPP-40 AC 5: the wardrobe station is a second way into Dress Pip; focus returns to whichever was tapped.
  const openWardrobe = (button) => {
    wardrobeOverlay.triggerRef.current = button
    wardrobeOverlay.open()
  }
  const closePicker = () => {
    pickerOverlay.close()
    decor.closeSpot()
  }
  const finishEditing = () => {
    closePicker()
    decor.done()
    editButtonRef.current?.focus()
  }
  const buyMore = () => {
    closePicker()
    openShop(SHOP_TAB_KEYS.DECOR)
  }

  return (
    <div className="pip-room">
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
          </svg>
          <StationButton
            box={fridgeHitBox(resolved.fridge)}
            label={fridgeLabel(name, fridgeFill)}
            buttonRef={fridgeOverlay.triggerRef}
            onOpen={fridgeOverlay.open}
          />
          <StationButton
            box={cabinetHitBox(resolved.cabinet)}
            label={`Open ${name}'s trophy cabinet`}
            buttonRef={cabinetOverlay.triggerRef}
            onOpen={cabinetOverlay.open}
          />
          {wardrobe && (
            <StationButton
              box={wardrobeHitBox(resolved.wardrobe)}
              label={`Open ${name}'s wardrobe`}
              onOpen={event => openWardrobe(event.currentTarget)}
            />
          )}
          {editing && <DecorSpotButtons placements={placements} onSpot={openPicker} />}
        </div>
        {levelBar && <PipHeadBarStatus levelBar={levelBar} />}
        <SpeechBubble text={bubble} actions={bubbleActions} />
        <p className="pip-room-hint" aria-hidden="true">{ROOM_HINT}</p>
        <RecentreButton onRecentre={camera.recentre} />
      </div>
      {editing && <EditRoomBar error={decor.error} overlayOpen={anyOpen} behind={behind} onDone={finishEditing} />}
      {(shop || decor || wardrobe) && (
        <div className="pip-room-actions" {...behind}>
          {shop && <ShopButton buttonRef={shopOverlay.triggerRef} onOpen={() => openShop(SHOP_TAB_KEYS.UPGRADES)} />}
          {decor && <EditRoomButton editing={editing} buttonRef={editButtonRef} onToggle={decor.toggle} />}
          {wardrobe && <WardrobeButton hasNew={wardrobe.hasNew} onOpen={event => openWardrobe(event.currentTarget)} />}
          {decor?.room?.freeMode && <FreeModeBadge />}
        </div>
      )}
      {editing && <RoomStyleChips room={decor.room} behind={behind} onPick={decor.place} />}
      {fridgeOverlay.isOpen && (
        <FridgeView name={name} fridge={fridge} titleId={fridgeTitleId} panelRef={fridgeOverlay.panelRef} onClose={fridgeOverlay.close} />
      )}
      {cabinetOverlay.isOpen && (
        <TrophyCabinetView name={name} cabinet={cabinet} titleId={cabinetTitleId} panelRef={cabinetOverlay.panelRef} onClose={cabinetOverlay.close} />
      )}
      {wardrobe && wardrobeOverlay.isOpen && (
        <WardrobeView mood={mood} herb={herb} wardrobe={wardrobe} titleId={wardrobeTitleId} panelRef={wardrobeOverlay.panelRef} onClose={wardrobeOverlay.close} />
      )}
      {shop && shopOverlay.isOpen && (
        <ShopView shop={shop} titleId={shopTitleId} panelRef={shopOverlay.panelRef} onClose={shopOverlay.close} />
      )}
      {decor && pickerOverlay.isOpen && decor.selectedSpot && (
        <DecorPicker
          spot={decor.selectedSpot}
          room={decor.room}
          error={decor.error}
          titleId={pickerTitleId}
          panelRef={pickerOverlay.panelRef}
          onPick={decor.place}
          onBuyMore={shop ? buyMore : null}
          onClose={closePicker}
        />
      )}
    </div>
  )
}

// Steam and the served plate sit on the cooker before the fridge is drawn over it; a
// sleeping Pip lies between the bed's back and front layers (MPP-17).
function Station({ station, level, position, phase, pose, herb, levelBar, fridgePct }) {
  const art = stationArt(station, level)
  // MPP-19: the gauge sits on the fridge, before the cabinet and bed are drawn (back → front).
  if (station === ROOM_STATIONS.FRIDGE) {
    return (
      <>
        {art}
        {fridgePct != null && <FridgeGauge level={level} pct={fridgePct} />}
      </>
    )
  }
  if (station === ROOM_STATIONS.COOKER) {
    const steaming = position === PIP_POSITIONS.COOKER || phase === COOK_PHASES.COOKING
    return (
      <>
        {art}
        {steaming && <PotSteam level={level} />}
        {phase === COOK_PHASES.SERVED && <ServedPlate level={level} />}
      </>
    )
  }
  if (station !== ROOM_STATIONS.BED) return art
  return (
    <>
      {art.back}
      {position === PIP_POSITIONS.BED && <RoomPip pose={pose} herb={herb} levelBar={levelBar} />}
      {art.front}
    </>
  )
}

// MPP-39: a station drawn at its STATION_SHIFT place in the room.
function ShiftedStation({ station, levels, ...props }) {
  return (
    <g transform={shiftTransform(STATION_SHIFT[station])}>
      <Station station={station} level={levels[station]} {...props} />
    </g>
  )
}

// MPP-18: always rendered in the same place, even while Pip sleeps, so a change of its
// transform is a CSS transition (a node mounted with the transform already set would jump).
function PipWalker({ phase, children }) {
  const atCooker = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.COOKING || phase === COOK_PHASES.SERVED
  const walking = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.RETURNING
  const [dx, dy] = COOK_WALK_OFFSET
  const transform = atCooker ? `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` : 'none'
  // MPP-29: each walk lasts exactly its phase (out 0.7 s, back 0.5 s), so Pip is on the rug as the scene ends.
  return (
    <g className={walking ? 'pip-walker is-walking' : 'pip-walker'} style={{ transform, transitionDuration: `${pipWalkMs(phase)}ms` }}>
      <g className="pip-hop">{children}</g>
    </g>
  )
}

// MPP-21: the text line stays mounted so screen readers hear each new line without the
// buttons being re-read. When the controls go away under a keyboard user (answered,
// snoozed, or hidden by the cook scene), focus lands on the bubble instead of <body>.
function SpeechBubble({ text, actions }) {
  const bubbleRef = useRef(null)
  const hadActionsRef = useRef(false)

  useEffect(() => {
    const hasActions = actions != null
    if (hadActionsRef.current && !hasActions && document.activeElement === document.body) {
      bubbleRef.current?.focus()
    }
    hadActionsRef.current = hasActions
  })

  return (
    <div ref={bubbleRef} className={actions ? 'pet-bubble is-asking' : 'pet-bubble'} tabIndex={-1}>
      <p className="pet-bubble-text" aria-live="polite">{text}</p>
      {actions}
    </div>
  )
}

// MPP-19 AC 3 / MPP-23 AC 1: a real button laid over a station's art. The SVG is role="img", so it can't hold one.
function StationButton({ box, label, buttonRef, onOpen }) {
  const style = hitBoxStyle(box)
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-station-btn"
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onOpen}
    />
  )
}

const fridgeLabel = (name, fill) =>
  fill && fill.planned > 0 ? `Open ${name}'s fridge, ${fill.pct}% full` : `Open ${name}'s fridge`

function roomDoing(position, mood, serving) {
  if (serving) return `cooking your ${(MEAL_TYPE_LABELS[serving.mealType] ?? 'meal').toLowerCase()}`
  return PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
}

export default PetRoom

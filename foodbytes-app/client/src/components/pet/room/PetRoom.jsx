import { useEffect, useId, useRef } from 'react'
import { MEAL_TYPE_LABELS } from '../../../constants/mealTypes'
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, ROOM_HINT, ROOM_STATIONS, ROOM_VIEWBOX, ROOM_VIEWBOX_SIZE } from '../../../constants/petRoom'
import useRoomOverlay from '../../../hooks/useRoomOverlay'
import { stationArt } from './furniture'
import FridgeView from './FridgeView'
import { ROOM_BACKDROP } from './roomDecor'
import { FridgeGauge, NightDim, PotSteam, ServedPlate, SleepZs } from './roomEffects'
import { COOK_WALK_OFFSET, ROOM_DRAW_ORDER, cabinetHitBox, cookPose, fridgeHitBox, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import TrophyCabinetView from './TrophyCabinetView'
import './PetRoom.css'

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
 */
function PetRoom({ name, mood, bubble, bubbleActions = null, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null, cabinet = null }) {
  const resolved = resolveRoomLevels(levels)
  const phase = serving?.phase ?? null
  const scenePosition = serving ? PIP_POSITIONS.RUG : position
  const pose = serving ? cookPose() : pipPose(position, mood, resolved)
  const asleep = scenePosition === PIP_POSITIONS.BED
  const label = `${name}'s room — ${name} is ${roomDoing(position, mood, serving)}`

  const fridgeOverlay = useRoomOverlay()
  const cabinetOverlay = useRoomOverlay()
  const overlayId = useId().replace(/:/g, '')
  const fridgeTitleId = `pip-fridge-title-${overlayId}`
  const cabinetTitleId = `pip-cabinet-title-${overlayId}`
  const fridgeFill = fridge?.fill ?? null
  // MPP-19 / MPP-23: the room behind an open overlay is out of the tab order and the a11y tree.
  const behind = fridgeOverlay.isOpen || cabinetOverlay.isOpen ? { inert: '', 'aria-hidden': true } : {}

  return (
    <div className="pip-room">
      <div className="pip-room-scene" {...behind}>
        <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
          {asleep ? ROOM_BACKDROP.night : ROOM_BACKDROP.day}
          {ROOM_DRAW_ORDER.map(station => (
            <Station
              key={station}
              station={station}
              level={resolved[station]}
              position={scenePosition}
              phase={phase}
              pose={pose}
              fridgePct={fridgeFill?.pct ?? null}
            />
          ))}
          {asleep && <NightDim />}
          <PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} />}</PipWalker>
          {asleep && <SleepZs level={resolved.bed} />}
        </svg>
        <SpeechBubble text={bubble} actions={bubbleActions} />
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
        <p className="pip-room-hint" aria-hidden="true">{ROOM_HINT}</p>
      </div>
      {fridgeOverlay.isOpen && (
        <FridgeView name={name} fridge={fridge} titleId={fridgeTitleId} panelRef={fridgeOverlay.panelRef} onClose={fridgeOverlay.close} />
      )}
      {cabinetOverlay.isOpen && (
        <TrophyCabinetView name={name} cabinet={cabinet} titleId={cabinetTitleId} panelRef={cabinetOverlay.panelRef} onClose={cabinetOverlay.close} />
      )}
    </div>
  )
}

// Steam and the served plate sit on the cooker before the fridge is drawn over it; a
// sleeping Pip lies between the bed's back and front layers (MPP-17).
function Station({ station, level, position, phase, pose, fridgePct }) {
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
      {position === PIP_POSITIONS.BED && <RoomPip pose={pose} />}
      {art.front}
    </>
  )
}

// MPP-18: always rendered in the same place, even while Pip sleeps, so a change of its
// transform is a CSS transition (a node mounted with the transform already set would jump).
function PipWalker({ phase, children }) {
  const atCooker = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.COOKING || phase === COOK_PHASES.SERVED
  const walking = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.RETURNING
  const [dx, dy] = COOK_WALK_OFFSET
  const transform = atCooker ? `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` : 'none'
  return (
    <g className={walking ? 'pip-walker is-walking' : 'pip-walker'} style={{ transform }}>
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
  const { width: viewWidth, height: viewHeight } = ROOM_VIEWBOX_SIZE
  const style = {
    left: percentOf(box.x, viewWidth),
    top: percentOf(box.y, viewHeight),
    width: percentOf(box.width, viewWidth),
    height: percentOf(box.height, viewHeight)
  }
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

const percentOf = (value, total) => `${((100 * value) / total).toFixed(2)}%`

function roomDoing(position, mood, serving) {
  if (serving) return `cooking your ${(MEAL_TYPE_LABELS[serving.mealType] ?? 'meal').toLowerCase()}`
  return PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
}

export default PetRoom

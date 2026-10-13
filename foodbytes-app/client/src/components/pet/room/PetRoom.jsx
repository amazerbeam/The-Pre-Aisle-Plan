import { useId } from 'react'
import { MEAL_TYPE_LABELS } from '../../../constants/mealTypes'
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, FRIDGE_HINT, ROOM_STATIONS, ROOM_VIEWBOX, ROOM_VIEWBOX_SIZE } from '../../../constants/petRoom'
import useRoomOverlay from '../../../hooks/useRoomOverlay'
import { stationArt } from './furniture'
import FridgeView from './FridgeView'
import { ROOM_BACKDROP } from './roomDecor'
import { FridgeGauge, NightDim, PotSteam, ServedPlate, SleepZs } from './roomEffects'
import { COOK_WALK_OFFSET, ROOM_DRAW_ORDER, cookPose, fridgeHitBox, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
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
 */
function PetRoom({ name, mood, bubble, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null }) {
  const resolved = resolveRoomLevels(levels)
  const phase = serving?.phase ?? null
  const scenePosition = serving ? PIP_POSITIONS.RUG : position
  const pose = serving ? cookPose() : pipPose(position, mood, resolved)
  const asleep = scenePosition === PIP_POSITIONS.BED
  const label = `${name}'s room — ${name} is ${roomDoing(position, mood, serving)}`

  const fridgeOverlay = useRoomOverlay()
  const fridgeTitleId = `pip-fridge-title-${useId().replace(/:/g, '')}`
  const fridgeFill = fridge?.fill ?? null
  // MPP-19: the room behind an open overlay is out of the tab order and the a11y tree.
  const behind = fridgeOverlay.isOpen ? { inert: '', 'aria-hidden': true } : {}

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
        <p className="pet-bubble" aria-live="polite">{bubble}</p>
        <FridgeButton name={name} level={resolved.fridge} fill={fridgeFill} buttonRef={fridgeOverlay.triggerRef} onOpen={fridgeOverlay.open} />
        <p className="pip-room-hint" aria-hidden="true">{FRIDGE_HINT}</p>
      </div>
      {fridgeOverlay.isOpen && (
        <FridgeView name={name} fridge={fridge} titleId={fridgeTitleId} panelRef={fridgeOverlay.panelRef} onClose={fridgeOverlay.close} />
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

// MPP-19 AC 3: a real button laid over the fridge art. The SVG is role="img", so it can't hold one.
function FridgeButton({ name, level, fill, buttonRef, onOpen }) {
  const { x, y, width, height } = fridgeHitBox(level)
  const { width: viewWidth, height: viewHeight } = ROOM_VIEWBOX_SIZE
  const style = {
    left: percentOf(x, viewWidth),
    top: percentOf(y, viewHeight),
    width: percentOf(width, viewWidth),
    height: percentOf(height, viewHeight)
  }
  const label = fill && fill.planned > 0 ? `Open ${name}'s fridge, ${fill.pct}% full` : `Open ${name}'s fridge`
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-fridge-btn"
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onOpen}
    />
  )
}

const percentOf = (value, total) => `${((100 * value) / total).toFixed(2)}%`

function roomDoing(position, mood, serving) {
  if (serving) return `cooking your ${(MEAL_TYPE_LABELS[serving.mealType] ?? 'meal').toLowerCase()}`
  return PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
}

export default PetRoom

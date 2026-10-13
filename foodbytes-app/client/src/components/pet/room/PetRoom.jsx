import { PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, ROOM_STATIONS, ROOM_VIEWBOX } from '../../../constants/petRoom'
import { stationArt } from './furniture'
import { ROOM_BACKDROP } from './roomDecor'
import { NightDim, PotSteam, SleepZs } from './roomEffects'
import { ROOM_DRAW_ORDER, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import './PetRoom.css'

/**
 * MPP-16: Pip's angled-corner room — every station at `levels` (default all 1s), drawn
 * back-to-front so nearer objects overlap farther ones (AC 4), and the speech bubble
 * top-right (AC 5).
 * MPP-17: `position` (from pipPosition) puts Pip on the rug, at the cooker with the pot
 * steaming, or asleep in bed with the night window, the room dimmed and z's above him.
 */
function PetRoom({ name, mood, bubble, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS }) {
  const resolved = resolveRoomLevels(levels)
  const pose = pipPose(position, mood, resolved)
  const asleep = position === PIP_POSITIONS.BED
  const doing = PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
  const label = `${name}'s room — ${name} is ${doing}`

  return (
    <div className="pip-room">
      <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
        {asleep ? ROOM_BACKDROP.night : ROOM_BACKDROP.day}
        {ROOM_DRAW_ORDER.map(station => (
          <Station key={station} station={station} level={resolved[station]} position={position} pose={pose} />
        ))}
        {asleep ? (
          <>
            <NightDim />
            <SleepZs level={resolved.bed} />
          </>
        ) : (
          <RoomPip pose={pose} />
        )}
      </svg>
      <p className="pet-bubble" aria-live="polite">{bubble}</p>
    </div>
  )
}

// Steam sits on the cooker before the fridge is drawn over it; a sleeping Pip lies
// between the bed's back and front layers (MPP-17).
function Station({ station, level, position, pose }) {
  const art = stationArt(station, level)
  if (station === ROOM_STATIONS.COOKER) {
    return (
      <>
        {art}
        {position === PIP_POSITIONS.COOKER && <PotSteam level={level} />}
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

export default PetRoom

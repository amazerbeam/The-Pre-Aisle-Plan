import { DECOR_SPOT_SHAPES, ROOM_SPOTS } from '../../../constants/petDecor'
import { decorArt } from './decorArt'
import { P, pts } from './iso'
import { Bill } from './isoShapes'

/**
 * MPP-27 AC 3 + AC 4: the person's placed decor and, in edit mode, the dashed spots (v5 .slot). Wall
 * decor and the wall spots draw right after the backdrop, behind every station; the floor item and
 * floor spot draw after the stations and before Pip, so nothing covers an object nearer the viewer.
 * `selectedSpot` is the spot whose picker is open (highlighted).
 */
export function WallDecor({ placements, editing, selectedSpot }) {
  return (
    <>
      {decorArt(placements?.leftWall)}
      {decorArt(placements?.rightWall)}
      {editing && <SpotOutline spot={ROOM_SPOTS.LEFT_WALL} placements={placements} selectedSpot={selectedSpot} />}
      {editing && <SpotOutline spot={ROOM_SPOTS.RIGHT_WALL} placements={placements} selectedSpot={selectedSpot} />}
    </>
  )
}

export function FloorDecor({ placements, editing, selectedSpot }) {
  return (
    <>
      {decorArt(placements?.floor)}
      {editing && <SpotOutline spot={ROOM_SPOTS.FLOOR} placements={placements} selectedSpot={selectedSpot} />}
    </>
  )
}

function SpotOutline({ spot, placements, selectedSpot }) {
  const { corners, plus } = DECOR_SPOT_SHAPES[spot]
  const filled = decorArt(placements?.[spot]) != null
  const className = ['pip-decor-spot', filled && 'is-filled', selectedSpot === spot && 'is-selected'].filter(Boolean).join(' ')
  return (
    <g className={className}>
      <polygon points={pts(corners.map(corner => P(...corner)))} />
      {!filled && (
        <Bill u={plus[0]} v={plus[1]} h={plus[2]}>
          <text x="-5" y="6">+</text>
        </Bill>
      )}
    </g>
  )
}

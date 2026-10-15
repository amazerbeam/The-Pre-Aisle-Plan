import { DECOR_SPOT_SHAPES, ROOM_SPOTS } from '../../../constants/petDecor'
import { decorArt } from './decorArt'
import { P, pts } from './iso'
import { Bill } from './isoShapes'
import { DECOR_SPOT_SHIFT, shiftTransform } from './roomLayout'

/**
 * MPP-27 AC 3 + AC 4: the person's placed decor and, in edit mode, the dashed spots (v5 .slot). Wall
 * decor and the wall spots draw right after the backdrop, behind every station; the floor item and
 * floor spot draw after the stations and before Pip, so nothing covers an object nearer the viewer.
 * `selectedSpot` is the spot whose picker is open (highlighted).
 * MPP-39: each spot is drawn in its DECOR_SPOT_SHIFT group.
 */
export function WallDecor({ placements, editing, selectedSpot }) {
  return (
    <>
      <SpotLayer spot={ROOM_SPOTS.LEFT_WALL} placements={placements} editing={editing} selectedSpot={selectedSpot} />
      <SpotLayer spot={ROOM_SPOTS.RIGHT_WALL} placements={placements} editing={editing} selectedSpot={selectedSpot} />
    </>
  )
}

export function FloorDecor({ placements, editing, selectedSpot }) {
  return <SpotLayer spot={ROOM_SPOTS.FLOOR} placements={placements} editing={editing} selectedSpot={selectedSpot} />
}

// MPP-39: a spot's art and dashed outline, slid to the spot's place in the bigger room (DECOR_SPOT_SHIFT).
function SpotLayer({ spot, placements, editing, selectedSpot }) {
  return (
    <g transform={shiftTransform(DECOR_SPOT_SHIFT[spot])}>
      {decorArt(placements?.[spot])}
      {editing && <SpotOutline spot={spot} placements={placements} selectedSpot={selectedSpot} />}
    </g>
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

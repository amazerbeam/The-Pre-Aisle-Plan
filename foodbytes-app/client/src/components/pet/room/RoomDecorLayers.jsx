import { DECOR_LAYERS, DECOR_SPOT_LABELS, DECOR_SPOT_SHAPES } from '../../../constants/petDecor'
import { decorArt } from './decorArt'
import { P, pts } from './iso'
import { Bill } from './isoShapes'

// The edit-mode name tag: a pill sized from the label's length (SVG text has no auto-width).
const TAG_CHAR_WIDTH = 3.75
const TAG_PAD = 8
const TAG_HEIGHT = 11
const TAG_RADIUS = 5.5

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
  const tagWidth = label.length * TAG_CHAR_WIDTH + TAG_PAD
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
          <rect x={-tagWidth / 2} y={-TAG_HEIGHT / 2 - 0.5} width={tagWidth} height={TAG_HEIGHT} rx={TAG_RADIUS} />
          <text textAnchor="middle" y="2.4">{label}</text>
        </g>
      </Bill>
    </g>
  )
}

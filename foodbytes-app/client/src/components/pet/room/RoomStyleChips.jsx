import { DECOR_SPOT_LABELS, STYLE_SPOTS } from '../../../constants/petDecor'
import { styleLabel } from '../../../constants/petRoomLabels'
import { ownedFor } from '../../../utils/roomPlacements'
import { useRoomPack } from './roomPackContext'
import { packStyle } from './roomPacks'

/**
 * MPP-27 AC 3: while editing, the owned wall and floor styles as chips under the strip (mockup
 * .chip). Tapping one applies it for free; the current one is pressed. The defaults are always owned,
 * so each row has at least one chip.
 */
function RoomStyleChips({ room, behind, onPick }) {
  const pack = useRoomPack()
  return (
    <div className="pip-room-styles" {...behind}>
      {STYLE_SPOTS.map(spot => (
        <div key={spot} role="group" aria-label={`${DECOR_SPOT_LABELS[spot]} styles`}>
          <p className="pip-room-styles-label" aria-hidden="true">{DECOR_SPOT_LABELS[spot]}</p>
          <div className="pip-room-styles-row">
            {ownedFor(room.decor, spot).map(({ id }) => {
              const style = packStyle(pack, id)
              if (!style) return null
              return (
                <button
                  key={id}
                  type="button"
                  className="pip-style-chip"
                  aria-pressed={room.placements?.[spot] === id}
                  onClick={() => onPick(spot, id)}
                >
                  <span className="pip-style-swatch" style={{ background: style.left ?? style.base }} aria-hidden="true" />
                  {styleLabel(pack.line, id)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RoomStyleChips

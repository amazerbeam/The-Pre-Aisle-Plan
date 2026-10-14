import { ROOM_STATIONS } from '../../../constants/petRoom'
import { stationArt } from './furniture'
import { stationThumbBox } from './roomLayout'

/** MPP-26 AC 3: one station at one level, cropped from the room art (the bed's back + front layers). */
function StationThumb({ station, level }) {
  const { x, y, width, height } = stationThumbBox(station, level)
  const art = stationArt(station, level)
  return (
    <svg
      className="pip-shop-thumb-svg"
      viewBox={`${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`}
      aria-hidden="true"
      focusable="false"
    >
      {station === ROOM_STATIONS.BED ? <>{art.back}{art.front}</> : art}
    </svg>
  )
}

export default StationThumb

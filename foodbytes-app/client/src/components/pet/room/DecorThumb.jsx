import { DECOR_ITEMS } from '../../../constants/petDecor'
import { decorArt } from './decorArt'
import { decorThumbBox } from './roomLayout'

/** MPP-27: one decor item cropped from the room art (its spot's thumbnail box), for the picker and the shop. */
function DecorThumb({ id }) {
  const spot = DECOR_ITEMS[id]?.spot
  const art = decorArt(id)
  if (!spot || !art) return null
  const { x, y, width, height } = decorThumbBox(spot)
  return (
    <svg
      className="pip-decor-thumb"
      viewBox={`${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`}
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  )
}

export default DecorThumb

import { DECOR_EMPTY_LABEL, DECOR_ITEMS, DECOR_SPOTS, DECOR_SPOT_LABELS } from '../../../constants/petDecor'
import { decorSpotHitBox, hitBoxStyle } from './roomLayout'

/**
 * MPP-27 AC 3: in edit mode, a real button over each dashed spot (the SVG is role="img", so it can't
 * hold one). onSpot gets the spot and the button, so the picker can hand focus back to it.
 */
function DecorSpotButtons({ placements, onSpot }) {
  return DECOR_SPOTS.map(spot => {
    const current = DECOR_ITEMS[placements?.[spot]]?.label ?? DECOR_EMPTY_LABEL.toLowerCase()
    return (
      <button
        key={spot}
        type="button"
        className="pip-decor-spot-btn"
        style={hitBoxStyle(decorSpotHitBox(spot))}
        aria-label={`${DECOR_SPOT_LABELS[spot]}: ${current}. Change`}
        aria-haspopup="dialog"
        onClick={event => onSpot(spot, event.currentTarget)}
      />
    )
  })
}

export default DecorSpotButtons

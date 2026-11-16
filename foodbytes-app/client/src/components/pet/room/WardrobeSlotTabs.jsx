import { WARDROBE_SLOTS, WARDROBE_TABS_LABEL } from '../../../constants/pipWardrobe'
import { slotHasNew, wardrobeSlotLabel } from '../../../utils/pipWardrobe'

/** MPP-32 AC 4: the seven slots, scrolling sideways; green dot = worn, red dot = something new. Labels follow the creature (the robot's Hat tab reads "Antenna"). */
function WardrobeSlotTabs({ wardrobe, line, selected, onSelect }) {
  return (
    <div className="pip-wardrobe-tabs" role="tablist" aria-label={WARDROBE_TABS_LABEL}>
      {WARDROBE_SLOTS.map(({ key }) => {
        const label = wardrobeSlotLabel(line, key)
        const worn = Boolean(wardrobe.outfit?.[key])
        const fresh = slotHasNew(wardrobe, key)
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === selected}
            aria-label={[label, worn && 'worn', fresh && 'new'].filter(Boolean).join(', ')}
            className={key === selected ? 'pip-wardrobe-tab is-selected' : 'pip-wardrobe-tab'}
            onClick={() => onSelect(key)}
          >
            {worn && <span className="pip-wardrobe-tab-worn" aria-hidden="true" />}
            {label}
            {fresh && <span className="pip-wardrobe-tab-new" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

export default WardrobeSlotTabs

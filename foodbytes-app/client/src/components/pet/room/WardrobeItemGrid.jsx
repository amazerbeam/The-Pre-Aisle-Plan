import { PET_MOODS } from '../../../constants/pet'
import { WARDROBE_ITEMS, WARDROBE_NEW_TAG, WARDROBE_NONE_LABEL } from '../../../constants/pipWardrobe'
import { itemsInSlot } from '../../../utils/pipWardrobe'
import PipHerb from '../herb/PipHerb'
import { slotCropViewBox } from '../herb/wardrobeLayers'

/**
 * MPP-32 AC 4: "None" then the slot's items, 3 per row. Each card is Pip's CURRENT form wearing
 * that item, cropped to the part of him it changes. Locked cards stay tappable so they can
 * explain their unlock (onTap decides).
 */
function WardrobeItemGrid({ wardrobe, slot, form, onTap }) {
  const viewBox = slotCropViewBox(slot, form)
  const worn = wardrobe.outfit?.[slot] ?? null
  return (
    <ul className="pip-wardrobe-grid">
      <li>
        <ItemCard label={WARDROBE_NONE_LABEL} pressed={!worn} viewBox={viewBox} form={form} outfit={null} onClick={() => onTap(null)} />
      </li>
      {itemsInSlot(wardrobe, slot).map(item => (
        <li key={item.id}>
          <ItemCard
            label={WARDROBE_ITEMS[item.id].label}
            pressed={worn === item.id}
            locked={!item.owned}
            fresh={item.owned && item.unseen}
            viewBox={viewBox}
            form={form}
            outfit={{ [slot]: item.id }}
            onClick={() => onTap(item)}
          />
        </li>
      ))}
    </ul>
  )
}

function ItemCard({ label, pressed, locked = false, fresh = false, viewBox, form, outfit, onClick }) {
  const className = ['pip-wardrobe-item', pressed && 'is-worn', locked && 'is-locked'].filter(Boolean).join(' ')
  const name = [label, locked && 'locked', fresh && 'new'].filter(Boolean).join(', ')
  return (
    <button type="button" className={className} aria-pressed={locked ? undefined : pressed} aria-label={name} onClick={onClick}>
      <PipHerb form={form} mood={PET_MOODS.CONTENT} variant="crop" viewBox={viewBox} outfit={outfit} still />
      {locked && <span className="pip-wardrobe-lock" aria-hidden="true">🔒</span>}
      {fresh && <span className="pip-wardrobe-new" aria-hidden="true">{WARDROBE_NEW_TAG}</span>}
      <span className="pip-wardrobe-item-label" aria-hidden="true">{label}</span>
    </button>
  )
}

export default WardrobeItemGrid

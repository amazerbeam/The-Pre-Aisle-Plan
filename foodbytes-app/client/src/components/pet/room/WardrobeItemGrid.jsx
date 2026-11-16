import { PET_MOODS } from '../../../constants/pet'
import { WARDROBE_NEW_TAG, WARDROBE_NONE_LABEL } from '../../../constants/pipWardrobe'
import { itemsInSlot, wardrobeItemLabel } from '../../../utils/pipWardrobe'
import Pip from '../pip/Pip'
import { slotFitViewBox } from '../pip/cardFit'

/**
 * MPP-32 AC 4: "None" then the slot's items, 3 per row. Each card is Pip's CURRENT form (of the active line) wearing
 * that item, shown whole, at one scale per slot (cardFit.js). Locked cards stay tappable so they can
 * explain their unlock (onTap decides).
 */
function WardrobeItemGrid({ wardrobe, slot, line, form, onTap }) {
  const items = itemsInSlot(wardrobe, slot)
  const viewBox = slotFitViewBox(slot, line, form, items.map(item => item.id))
  const worn = wardrobe.outfit?.[slot] ?? null
  return (
    <ul className="pip-wardrobe-grid">
      <li>
        <ItemCard label={WARDROBE_NONE_LABEL} pressed={!worn} viewBox={viewBox} line={line} form={form} outfit={null} onClick={() => onTap(null)} />
      </li>
      {items.map(item => (
        <li key={item.id}>
          <ItemCard
            label={wardrobeItemLabel(line, item.id)}
            pressed={worn === item.id}
            locked={!item.owned}
            fresh={item.owned && item.unseen}
            viewBox={viewBox}
            line={line}
            form={form}
            outfit={{ [slot]: item.id }}
            onClick={() => onTap(item)}
          />
        </li>
      ))}
    </ul>
  )
}

function ItemCard({ label, pressed, locked = false, fresh = false, viewBox, line, form, outfit, onClick }) {
  const className = ['pip-wardrobe-item', pressed && 'is-worn', locked && 'is-locked'].filter(Boolean).join(' ')
  const name = [label, locked && 'locked', fresh && 'new'].filter(Boolean).join(', ')
  return (
    <button type="button" className={className} aria-pressed={locked ? undefined : pressed} aria-label={name} onClick={onClick}>
      <Pip line={line} form={form} mood={PET_MOODS.CONTENT} variant="crop" viewBox={viewBox} outfit={outfit} still />
      {locked && <span className="pip-wardrobe-lock" aria-hidden="true">🔒</span>}
      {fresh && <span className="pip-wardrobe-new" aria-hidden="true">{WARDROBE_NEW_TAG}</span>}
      <span className="pip-wardrobe-item-label" aria-hidden="true">{label}</span>
    </button>
  )
}

export default WardrobeItemGrid

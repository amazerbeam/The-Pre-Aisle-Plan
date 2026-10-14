import { useEffect, useState } from 'react'
import { PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import {
  WARDROBE_CLOSE_LABEL, WARDROBE_ITEMS, WARDROBE_LOCK_PREFIX, WARDROBE_SLOTS, WARDROBE_TITLE, WARDROBE_UNDRESS_LABEL
} from '../../../constants/pipWardrobe'
import useBodyScrollLock from '../../../hooks/useBodyScrollLock'
import { wornCount } from '../../../utils/pipWardrobe'
import PipHerb from '../herb/PipHerb'
import WardrobeItemGrid from './WardrobeItemGrid'
import WardrobeLineup from './WardrobeLineup'
import WardrobeSlotTabs from './WardrobeSlotTabs'
import './WardrobeView.css'

/**
 * MPP-32 AC 4: "Dress Pip" — a modal sheet that slides up over the whole screen on a phone (the
 * room card is too short to hold it). Header (✕, title, Undress), live preview, slot tabs, item
 * grid with the locked-item note, and the collapsed evolution lineup. Focus, Escape and the Tab
 * trap come from useRoomOverlay (the panel's first button, ✕, takes focus). Opens on the first
 * slot with something new; opening a tab marks its new items seen. Every tap saves (usePipWardrobe).
 *
 * @param {{ mood: string, herb: { form: number, wilted: boolean }, wardrobe: Object, titleId: string, panelRef: object, onClose: () => void }} props
 *   wardrobe = { data: WardrobeDTO, peakForm, firstNewSlot, equip, undress, markSeen, error }
 */
function WardrobeView({ mood, herb, wardrobe, titleId, panelRef, onClose }) {
  const [slot, setSlot] = useState(() => wardrobe.firstNewSlot ?? WARDROBE_SLOTS[0].key)
  const [lockedId, setLockedId] = useState(null)
  const outfit = wardrobe.data.outfit ?? {}
  useBodyScrollLock(true)

  // Opening a tab (including the first) is what clears its NEW tags and, in time, the badge.
  useEffect(() => {
    wardrobe.markSeen(slot)
  }, [slot]) // eslint-disable-line react-hooks/exhaustive-deps -- run per tab opened, not per render

  const chooseSlot = (key) => {
    setSlot(key)
    setLockedId(null)
  }

  const tapItem = (item) => {
    if (item && !item.owned) {
      setLockedId(item.id)
      return
    }
    setLockedId(null)
    wardrobe.equip(slot, item?.id ?? null)
  }

  return (
    <div ref={panelRef} className="pip-wardrobe" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-wardrobe-head">
        <button type="button" className="pip-wardrobe-icon-btn" aria-label={WARDROBE_CLOSE_LABEL} onClick={onClose}>✕</button>
        <h3 id={titleId}>{WARDROBE_TITLE}</h3>
        <button type="button" className="pip-wardrobe-text-btn" onClick={wardrobe.undress} disabled={wornCount(outfit) === 0}>
          {WARDROBE_UNDRESS_LABEL}
        </button>
      </div>
      <div className="pip-wardrobe-preview">
        <PipHerb form={herb.form} mood={mood} wilted={herb.wilted} outfit={outfit} />
        <p className="pip-wardrobe-caption">
          {PIP_FORM_NAMES[herb.form]} · wearing {wornCount(outfit)} of {WARDROBE_SLOTS.length}
        </p>
      </div>
      {wardrobe.error && <p className="pip-wardrobe-error" role="alert">{wardrobe.error}</p>}
      <WardrobeSlotTabs wardrobe={wardrobe.data} selected={slot} onSelect={chooseSlot} />
      <div className="pip-wardrobe-body">
        <WardrobeItemGrid wardrobe={wardrobe.data} slot={slot} form={herb.form} onTap={tapItem} />
        {lockedId && (
          <p className="pip-wardrobe-lock-note" role="status">
            <b>🔒 {WARDROBE_ITEMS[lockedId].label}</b>
            {WARDROBE_LOCK_PREFIX} {WARDROBE_ITEMS[lockedId].unlockHint}
          </p>
        )}
      </div>
      <WardrobeLineup outfit={outfit} currentForm={herb.form} peakForm={wardrobe.peakForm} />
    </div>
  )
}

export default WardrobeView

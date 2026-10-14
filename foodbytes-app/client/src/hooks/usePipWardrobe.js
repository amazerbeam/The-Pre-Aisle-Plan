import { useEffect, useRef, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { WARDROBE_SAVE_ERROR } from '../constants/pipWardrobe'
import { readAnnounced, writeAnnounced } from '../utils/wardrobeAnnouncedStore'
import {
  firstNewSlot, newItemIds, slotHasNew, toggleTarget, wardrobeAnnouncement, withSlot, withSlotSeen
} from '../utils/pipWardrobe'

/**
 * MPP-32: dressing Pip on /pet. Every write is optimistic: the wardrobe changes at once
 * (setWardrobe), the server's WardrobeDTO replaces it when the request returns, and a failure
 * rolls back to the last server copy. Only the newest write's outcome is applied, so a slow
 * earlier response can't undo a later tap. Writes are never aborted.
 *
 * AC 6: new unlocks not yet announced in this browser queue one "🎉 New outfit" line, shown for
 * AWARD_BUBBLE_MS. The ids are recorded before the line shows, so a reload never repeats it.
 *
 * @param {{ userId: number|null, wardrobe: Object|null, setWardrobe: (w: Object) => void }} input
 * @returns {{ announcement: string|null, hasNew: boolean, firstNewSlot: string|null,
 *   equip: (slot: string, itemId: string|null) => void, undress: () => void,
 *   markSeen: (slot: string) => void, error: string|null }}
 */
export function usePipWardrobe({ userId, wardrobe, setWardrobe }) {
  const [announcement, setAnnouncement] = useState(null)
  const [error, setError] = useState(null)
  const seqRef = useRef(0)
  const pendingRef = useRef(0)
  const serverRef = useRef(wardrobe)

  // Between writes, the context's copy is the server's.
  useEffect(() => {
    if (pendingRef.current === 0) serverRef.current = wardrobe
  }, [wardrobe])

  useEffect(() => {
    if (userId == null || !wardrobe) return
    const announced = readAnnounced(userId)
    const fresh = newItemIds(wardrobe).filter(id => !announced.has(id))
    if (fresh.length === 0) return
    writeAnnounced(userId, [...announced, ...fresh])
    setAnnouncement(wardrobeAnnouncement(fresh))
  }, [userId, wardrobe])

  useEffect(() => {
    if (!announcement) return undefined
    const timerId = setTimeout(() => setAnnouncement(null), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [announcement])

  const save = (optimistic, request, { quiet = false } = {}) => {
    const seq = ++seqRef.current
    pendingRef.current += 1
    setError(null)
    setWardrobe(optimistic)
    request()
      .then(saved => {
        serverRef.current = saved
        if (seq === seqRef.current) setWardrobe(saved)
      })
      .catch(err => {
        if (seq !== seqRef.current) return
        setWardrobe(serverRef.current)
        if (!quiet) setError(err.response?.data?.error || WARDROBE_SAVE_ERROR)
      })
      .finally(() => {
        pendingRef.current -= 1
      })
  }

  const equip = (slot, itemId) => {
    const target = toggleTarget(wardrobe.outfit, slot, itemId)
    save(withSlot(wardrobe, slot, target), () => petService.equipItem(slot, target))
  }

  const undress = () => save({ ...wardrobe, outfit: {} }, () => petService.undress())

  // A failed "seen" just keeps the badge; it is not worth an error note.
  const markSeen = (slot) => {
    if (!wardrobe || !slotHasNew(wardrobe, slot)) return
    save(withSlotSeen(wardrobe, slot), () => petService.markWardrobeSeen(slot), { quiet: true })
  }

  return {
    announcement,
    hasNew: newItemIds(wardrobe).length > 0,
    firstNewSlot: firstNewSlot(wardrobe),
    equip,
    undress,
    markSeen,
    error
  }
}

export default usePipWardrobe

import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { DECOR_BOUGHT_LINE, DECOR_BUY_ERROR, SHOP_TAB_KEYS } from '../constants/petDecor'
import { SHOP_CONFIRM_MS, SHOP_LEVEL_ERROR, SHOP_STATIONS, SHOP_UPGRADE_ERROR, SHOP_UPGRADE_LINES, STATION_LEVEL_NAMES } from '../constants/petShop'
import { decorBoughtLine } from '../utils/roomPlacements'

/**
 * MPP-26: the Shop sheet's state. A first tap arms a purchase (SHOP_CONFIRM_MS); a second tap makes
 * it. Purchases are NOT optimistic — spending can't be undone, so the room changes only when the
 * server says so (applyRoomWrite). A 409 shows the server's message and refetches the pet so the
 * sheet shows the true balance and room. Writes are never aborted.
 * MPP-27: the sheet's tab (Upgrades | Decor | Walls & floors) and buy(itemId) for decor and styles.
 * Station keys and decor ids never collide, so `armed` / `busy` hold either.
 * MPP-40: setLevel(station, level) — free mode only; the server refuses it (403) otherwise.
 *
 * @param {{ applyRoomWrite: (w: { sprinkles: number, room: Object }) => void, refreshPet: () => void }} input
 * @returns {{ tab: string, setTab: (tab: string) => void, armed: string|null, busy: string|null,
 *   status: string|null, error: string|null, announcement: string|null, arm: (key: string) => void,
 *   upgrade: (station: string) => void, setLevel: (station: string, level: number) => void,
 *   buy: (itemId: string) => void, reset: () => void }}
 */
export function usePetShop({ applyRoomWrite, refreshPet }) {
  const [tab, setTabState] = useState(SHOP_TAB_KEYS.UPGRADES)
  const [armed, setArmed] = useState(null)
  const [busy, setBusy] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    if (!armed) return undefined
    const timerId = setTimeout(() => setArmed(null), SHOP_CONFIRM_MS)
    return () => clearTimeout(timerId)
  }, [armed])

  useEffect(() => {
    if (!announcement) return undefined
    const timerId = setTimeout(() => setAnnouncement(null), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [announcement])

  const arm = (key) => {
    setArmed(key)
    setStatus(null)
    setError(null)
  }

  // One purchase at a time; `key` is what shows as busy.
  const purchase = (key, request, onBought, fallbackError) => {
    if (busy) return
    setArmed(null)
    setBusy(key)
    setStatus(null)
    setError(null)
    request()
      .then(result => {
        applyRoomWrite(result)
        onBought(result)
      })
      .catch(err => {
        setError(err.response?.data?.error || fallbackError)
        if (err.response?.status === 409) refreshPet()
      })
      .finally(() => setBusy(null))
  }

  const upgrade = (station) => purchase(station, () => petService.upgradeStation(station), result => {
    setStatus(upgradedLine(station, result.room?.stations?.[station]))
    setAnnouncement(SHOP_UPGRADE_LINES[station] ?? null)
  }, SHOP_UPGRADE_ERROR)

  // MPP-40: free mode sets a station to any level, down as well as up; busy shows as "station:level".
  const setLevel = (station, level) => purchase(`${station}:${level}`, () => petService.setStationLevel(station, level), result => {
    setStatus(levelSetLine(station, result.room?.stations?.[station]))
  }, SHOP_LEVEL_ERROR)

  // MPP-27: the server auto-places decor on an empty spot and applies a style; the line says which.
  const buy = (itemId) => purchase(itemId, () => petService.buyDecor(itemId), result => {
    setStatus(decorBoughtLine(itemId, result.room))
    setAnnouncement(DECOR_BOUGHT_LINE)
  }, DECOR_BUY_ERROR)

  // The sheet closed: forget the armed button and the last message.
  const reset = () => {
    setArmed(null)
    setStatus(null)
    setError(null)
  }

  // A new tab starts clean, like a fresh sheet.
  const setTab = (next) => {
    setTabState(next)
    reset()
  }

  return { tab, setTab, armed, busy, status, error, announcement, arm, upgrade, setLevel, buy, reset }
}

function upgradedLine(station, level) {
  const label = SHOP_STATIONS.find(s => s.key === station)?.label ?? station
  const name = STATION_LEVEL_NAMES[station]?.[level - 1]
  return name ? `${label} upgraded to level ${level}: ${name}!` : `${label} upgraded!`
}

function levelSetLine(station, level) {
  const label = SHOP_STATIONS.find(s => s.key === station)?.label ?? station
  const name = STATION_LEVEL_NAMES[station]?.[level - 1]
  return name ? `${label} set to level ${level}: ${name}.` : `${label} level changed.`
}

export default usePetShop

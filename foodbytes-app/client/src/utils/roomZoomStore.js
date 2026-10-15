import { ROOM_ZOOM, ROOM_ZOOM_STORAGE_KEY } from '../constants/petRoom.js'
import { clampZoom } from './roomCamera.js'

/**
 * MPP-39 AC 16: the room's zoom, remembered in this browser only. Blocked, empty or junk storage
 * opens at 1× with no error; a failed write still zooms for this visit.
 */
export function readRoomZoom() {
  try {
    const raw = localStorage.getItem(ROOM_ZOOM_STORAGE_KEY)
    return raw === null ? ROOM_ZOOM.DEFAULT : clampZoom(Number(raw))
  } catch {
    return ROOM_ZOOM.DEFAULT
  }
}

export function writeRoomZoom(zoom) {
  try {
    localStorage.setItem(ROOM_ZOOM_STORAGE_KEY, String(zoom))
  } catch {
    // Storage disabled or full: the zoom still applies until the page is closed.
  }
}

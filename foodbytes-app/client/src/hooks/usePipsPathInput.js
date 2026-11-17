import { useEffect, useRef } from 'react'
import { DRAG_STEP_RATIO } from '../constants/pipsPath'

const TILE_SELECTOR = '.pp-tile[data-i]'

/**
 * MPP-49: board input. pointerdown on a tile steps to it (a visited neighbour restarts the level and ends the drag) and captures the pointer;
 * pointermove steps into every tile the pointer crosses (coalesced points, sampled at half-tile steps
 * so a fast swipe never skips); the listeners are removed on pointerup / pointercancel / unmount.
 * Keyboard activation of a tile (click with detail 0) and board keys go through tryTile / onKey.
 */
export default function usePipsPathInput({ boardRef, tryTile, onKey }) {
  const dragRef = useRef(null)

  useEffect(() => () => dragRef.current?.cleanup(), [])

  const tileAt = (x, y) => {
    const tile = document.elementFromPoint(x, y)?.closest(TILE_SELECTOR)
    return tile && boardRef.current?.contains(tile) ? Number(tile.dataset.i) : -1
  }

  const onPointerDown = (event) => {
    if (event.button !== 0 || dragRef.current) return
    const i = tileAt(event.clientX, event.clientY)
    const board = boardRef.current
    if (i < 0 || !board) return
    const drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
    const visit = (x, y) => {
      const j = tileAt(x, y)
      if (j >= 0 && tryTile(j)) drag.cleanup()
    }
    const onMove = (e) => {
      if (e.pointerId !== drag.id) return
      const points = e.getCoalescedEvents?.() ?? []
      const size = board.querySelector(TILE_SELECTOR)?.offsetWidth || 1
      for (const p of points.length ? points : [e]) {
        if (dragRef.current !== drag) return
        const steps = Math.max(1, Math.ceil(Math.hypot(p.clientX - drag.x, p.clientY - drag.y) / (size * DRAG_STEP_RATIO)))
        for (let k = 1; k <= steps && dragRef.current === drag; k++) visit(drag.x + (p.clientX - drag.x) * k / steps, drag.y + (p.clientY - drag.y) * k / steps)
        drag.x = p.clientX
        drag.y = p.clientY
      }
    }
    const onEnd = (e) => { if (e.pointerId === drag.id) drag.cleanup() }
    drag.cleanup = () => {
      board.removeEventListener('pointermove', onMove)
      board.removeEventListener('pointerup', onEnd)
      board.removeEventListener('pointercancel', onEnd)
      if (board.hasPointerCapture?.(drag.id)) board.releasePointerCapture(drag.id)
      dragRef.current = null
    }
    board.setPointerCapture(event.pointerId)
    board.addEventListener('pointermove', onMove)
    board.addEventListener('pointerup', onEnd)
    board.addEventListener('pointercancel', onEnd)
    dragRef.current = drag
    if (tryTile(i)) drag.cleanup()
  }

  // Keyboard activation only (Enter / Space on a focused tile); pointer input is handled above.
  const onClick = (event) => {
    const tile = event.target.closest(TILE_SELECTOR)
    if (tile && event.detail === 0) tryTile(Number(tile.dataset.i))
  }

  const onKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return false
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    const handled = onKey(key)
    if (handled) event.preventDefault()
    return handled
  }

  return { onPointerDown, onClick, onKeyDown }
}

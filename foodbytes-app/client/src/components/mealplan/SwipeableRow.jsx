import { useRef, useState } from 'react'
import { SWIPE_COMMIT_PX, SWIPE_ACTION_WIDTH_PX } from '../../constants/mealPlanUi'

/** Swipe left to reveal actions. Pointer events cover touch and mouse. Taps fall through to children. */
function SwipeableRow({ actions, onSwiped, hint = false, children }) {
  const openX = -SWIPE_ACTION_WIDTH_PX * actions.length
  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef(null)          // { px, baseX, moved }
  const swallowClick = useRef(false)  // a drag that ends on the face is followed by a click

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return
    start.current = { px: e.clientX, baseX: x, moved: false }
    setDragging(true)
  }
  const onPointerMove = (e) => {
    if (!start.current) return
    const dx = e.clientX - start.current.px
    if (Math.abs(dx) > 6 && !start.current.moved) {
      start.current.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (start.current.moved) setX(Math.min(0, Math.max(openX - 12, start.current.baseX + dx)))
  }
  const end = () => {
    if (!start.current) return
    const { moved } = start.current
    start.current = null
    setDragging(false)
    if (!moved) return
    const open = x < -SWIPE_COMMIT_PX
    setX(open ? openX : 0)
    if (open) onSwiped?.()
    // Swallow the click that follows a real drag; clear the flag in case none arrives.
    swallowClick.current = true
    setTimeout(() => { swallowClick.current = false }, 0)
  }
  // A real drag must not also open the recipe: swallow the click that follows it.
  const onClickCapture = (e) => {
    if (swallowClick.current) { swallowClick.current = false; e.stopPropagation(); return }
    if (x !== 0) { e.stopPropagation(); setX(0) }
  }

  return (
    <div className={`swipe-row ${hint ? 'is-hinting' : ''}`}>
      <div className="swipe-row-actions" aria-hidden={x === 0}>
        {actions.map(a => (
          <button key={a.key} type="button" className={`swipe-row-action ${a.className}`}
                  tabIndex={x === 0 ? -1 : 0} onClick={() => { setX(0); a.onClick() }}>
            <span aria-hidden="true">{a.icon}</span>{a.label}
          </button>
        ))}
      </div>
      <div className="swipe-row-face" style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : undefined }}
           onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={end}
           onClickCapture={onClickCapture}>
        {children}
        {hint && <span className="swipe-row-hand" aria-hidden="true">👆</span>}
      </div>
    </div>
  )
}

export default SwipeableRow

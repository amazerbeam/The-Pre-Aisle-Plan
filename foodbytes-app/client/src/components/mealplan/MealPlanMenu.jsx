import { useEffect, useRef, useState } from 'react'
import './MealPlanMenu.css'

/**
 * Overflow menu trigger in the Meal Plan header. Replaces the standalone
 * "C" copy-week button. Exposes Copy week / Save as / Apply / Manage.
 *
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
function MealPlanMenu({ onCopyWeek, onSaveAs, onApply, onManage }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const choose = (handler) => () => {
    setOpen(false)
    handler?.()
  }

  return (
    <div className="meal-plan-menu" ref={wrapperRef}>
      <button
        type="button"
        className="meal-plan-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Meal plan actions"
        title="Meal plan actions"
      >
        <span className="meal-plan-menu-dot" />
        <span className="meal-plan-menu-dot" />
        <span className="meal-plan-menu-dot" />
      </button>

      {open && (
        <>
          {/* Mobile bottom-sheet backdrop. A native <button>, not a <div>: iOS
              Safari always synthesises a click on a native control, so the
              onClick below is reliable with no document-level fallback needed.
              The scrim renders inside wrapperRef, so the document handler's
              contains() check reads a tap here as an *inside* tap and will not
              close — hence the explicit onClick. Dismissal deliberately happens
              on click, not touchstart: closing on touchstart would unmount the
              scrim before touchend, and the synthesised click would land on the
              calendar underneath (ghost click onto .remove-btn et al).
              aria-hidden requires tabIndex={-1} — Escape and the menu items are
              the accessible dismiss/activate paths. */}
          <button
            type="button"
            className="meal-plan-menu-scrim"
            onClick={() => setOpen(false)}
            aria-hidden="true"
            tabIndex={-1}
          />
          <ul className="meal-plan-menu-list" role="menu">
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onCopyWeek)}>
                Copy week…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onSaveAs)}>
                Save as template…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onApply)}>
                Apply template…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onManage)}>
                Manage templates…
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

export default MealPlanMenu

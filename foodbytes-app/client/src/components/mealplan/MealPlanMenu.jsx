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
      )}
    </div>
  )
}

export default MealPlanMenu

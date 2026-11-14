import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SHOPPING_PATH } from '../../constants/appRoutes'

/** Desktop title-row actions. Templates is a disclosure menu; the handlers are the ones MealPlanMenu receives. */
function MealPlanToolbar({ onCopyWeek, onManageExtras, onSaveAs, onApply, onManage }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
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
    <div className="week-toolbar">
      <button type="button" className="toolbar-btn" onClick={onCopyWeek}>⧉ Copy week</button>
      <div className="toolbar-dd" ref={wrapperRef}>
        <button type="button" className="toolbar-btn" aria-haspopup="menu" aria-expanded={open}
                onClick={() => setOpen(v => !v)}>
          🗂 Templates ▾
        </button>
        {open && (
          <ul className="toolbar-dd-menu" role="menu">
            <li role="none"><button role="menuitem" type="button" onClick={choose(onSaveAs)}>Save this week as template…</button></li>
            <li role="none"><button role="menuitem" type="button" onClick={choose(onApply)}>Apply template…</button></li>
            <li role="none"><button role="menuitem" type="button" onClick={choose(onManage)}>Manage templates…</button></li>
          </ul>
        )}
      </div>
      <button type="button" className="toolbar-btn" onClick={onManageExtras}>🛒 Extras</button>
      <button type="button" className="toolbar-btn toolbar-btn--primary" onClick={() => navigate(SHOPPING_PATH)}>
        Build shopping list →
      </button>
    </div>
  )
}

export default MealPlanToolbar

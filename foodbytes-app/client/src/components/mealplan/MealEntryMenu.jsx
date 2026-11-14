import { useEffect, useRef, useState } from 'react'
import './MealEntryMenu.css'

/** The ⋯ menu on a desktop meal card. Clicks inside never reach the card (which would open the recipe). */
function MealEntryMenu({ entry, slotLabel, onServings, onVariant, onReplace, onMove, onRemove }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const name = entry.recipe?.name ?? 'meal'
  const variants = [...(entry.recipe?.variants ?? [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

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
    handler()
  }

  return (
    <div className={`entry-menu ${open ? 'is-open' : ''}`} ref={wrapperRef}
         onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <button type="button" className="entry-menu-trigger" aria-haspopup="menu" aria-expanded={open}
              aria-label={`Actions for ${name}`} onClick={() => setOpen(v => !v)}>
        ⋯
      </button>
      {open && (
        <ul className="entry-menu-list" role="menu">
          <li role="none"><button role="menuitem" type="button" onClick={choose(onServings)}>👥 Change servings…</button></li>
          {variants.length > 1 && variants.map(v => {
            const current = v.recipeId === entry.recipe.id
            return (
              <li role="none" key={v.recipeId}>
                <button role="menuitemradio" aria-checked={current} type="button" onClick={choose(() => onVariant(v))}>
                  {current ? '● ' : '○ '}{v.variantLabel}
                </button>
              </li>
            )
          })}
          <li role="none"><button role="menuitem" type="button" onClick={choose(onReplace)}>↻ Replace {slotLabel}</button></li>
          <li role="none"><button role="menuitem" type="button" onClick={choose(onMove)}>↔ Move to…</button></li>
          <li role="none"><button role="menuitem" type="button" className="is-danger" onClick={choose(onRemove)}>🗑 Remove</button></li>
        </ul>
      )}
    </div>
  )
}

export default MealEntryMenu

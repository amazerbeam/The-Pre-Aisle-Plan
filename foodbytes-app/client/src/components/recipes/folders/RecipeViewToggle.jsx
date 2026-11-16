import FolderIcon from './FolderIcon'
import { RECIPE_VIEWS } from '../../../constants/recipeFolders'
import './RecipeFolders.css'

/** Menu / Folders switch. Menu = the original page; Folders = the folder browser. */
function RecipeViewToggle({ view, onChange }) {
  const opt = (value, label, icon) => (
    <button type="button" role="radio" aria-checked={view === value}
      className={`view-toggle-btn ${view === value ? 'on' : ''}`} onClick={() => onChange(value)}>
      {icon}{label}
    </button>
  )
  return (
    <div className="view-toggle" role="radiogroup" aria-label="Recipe view">
      {opt(RECIPE_VIEWS.MENU, 'Menu', <span aria-hidden="true">☰</span>)}
      {opt(RECIPE_VIEWS.FOLDERS, 'Folders', <FolderIcon size={16} />)}
    </div>
  )
}

export default RecipeViewToggle

import { SPRINKLES_ICON } from '../../constants/petRoom'
import PetNameEditor from './PetNameEditor'

/**
 * MPP-37: Pip mode's slim header, above the room — name with the rename pencil and his
 * current herb form on the left, sprinkles and the mood chip on the right. Replaces the
 * name row under the room and the room's top-left sprinkles counter.
 */
function PipHeader({ name, onRename, formName, sprinkles, mood, moodLabel }) {
  return (
    <header className="pip-header">
      <div className="pip-header-name">
        <PetNameEditor name={name} onRename={onRename} />
        <span className="pip-header-form">{formName}</span>
      </div>
      <div className="pip-header-right">
        {typeof sprinkles === 'number' && (
          <span className="pip-header-sprinkles" aria-label={`${sprinkles} sprinkles`}>
            <span aria-hidden="true">{SPRINKLES_ICON} {sprinkles}</span>
          </span>
        )}
        <span className={`pet-chip pet-chip--${mood}`}>{moodLabel}</span>
      </div>
    </header>
  )
}

export default PipHeader

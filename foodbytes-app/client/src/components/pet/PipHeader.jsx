import PetNameEditor from './PetNameEditor'
import SprinklesChip from './SprinklesChip'

/**
 * MPP-37: Pip mode's slim header, above the room — name with the rename pencil and his
 * current herb form on the left, sprinkles and the mood chip on the right. Replaces the
 * name row under the room and the room's top-left sprinkles counter.
 * MPP-42: the sprinkles chip counts up when you come back with more (useSprinkleCountUp → earning).
 */
function PipHeader({ name, onRename, formName, sprinkles, earning, mood, moodLabel }) {
  return (
    <header className="pip-header">
      <div className="pip-header-name">
        <PetNameEditor name={name} onRename={onRename} />
        <span className="pip-header-form">{formName}</span>
      </div>
      <div className="pip-header-right">
        {typeof sprinkles === 'number' && <SprinklesChip sprinkles={sprinkles} earning={earning} />}
        <span className={`pet-chip pet-chip--${mood}`}>{moodLabel}</span>
      </div>
    </header>
  )
}

export default PipHeader

import { CartIcon, HomeIcon } from '../common/ExtrasIcons'

const BASE_PADDING_PX = 12
const INDENT_PX = 16

/** MPP-10: one extra — what lands on the list, and a Homemade | Store-bought segmented switch. */
function ExtraChoiceRow({ extra, onChange }) {
  const { extraName, homemade, usedGrams, storeBoughtIngredientName, depth } = extra
  const grams = usedGrams != null ? ` · ${usedGrams} g` : ''

  let detail
  if (homemade) {
    detail = <><b>Make</b> {extraName}{usedGrams != null ? ` · ${usedGrams} g used` : ''}</>
  } else if (storeBoughtIngredientName) {
    detail = <><b>Buy</b> {storeBoughtIngredientName}{grams}</>
  } else {
    detail = <><b>Buy</b> ready-made · listed as "Store Bought {extraName}" (no product linked)</>
  }

  return (
    <div className="mx-extra" style={{ paddingLeft: `${BASE_PADDING_PX + (depth ?? 0) * INDENT_PX}px` }}>
      <div className="mx-extra-info">
        <div className="mx-extra-name">{extraName}</div>
        <div className={`mx-extra-detail ${homemade ? 'hm' : 'sb'}`}>{detail}</div>
        {homemade && !storeBoughtIngredientName && (
          <div className="mx-note">No store-bought product linked yet</div>
        )}
      </div>
      <div className="mx-seg" role="radiogroup" aria-label={`${extraName}: homemade or store-bought`}>
        <button type="button" role="radio" aria-checked={homemade} className={`mx-seg-hm ${homemade ? 'on' : ''}`} onClick={() => !homemade && onChange(true)}>
          <HomeIcon />Homemade
        </button>
        <button type="button" role="radio" aria-checked={!homemade} className={`mx-seg-sb ${homemade ? '' : 'on'}`} onClick={() => homemade && onChange(false)}>
          <CartIcon />Store-bought
        </button>
      </div>
    </div>
  )
}

export default ExtraChoiceRow

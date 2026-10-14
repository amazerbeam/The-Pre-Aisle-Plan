import { ROOM_INK } from '../../../constants/petRoom'
import { DECOR_SPOT_LABELS, ROOM_STYLES, STYLE_SPOTS } from '../../../constants/petDecor'
import { catalogueFor } from '../../../utils/roomPlacements'
import ShopItemCard from './ShopItemCard'

/** MPP-27 AC 1: the Walls & floors tab — the paid styles (the free defaults aren't for sale), with a swatch each. */
function ShopStylesTab({ shop }) {
  return STYLE_SPOTS.map(spot => (
    <section key={spot}>
      <h4 className="pip-shop-group">{DECOR_SPOT_LABELS[spot]}</h4>
      <ul className="pip-shop-grid">
        {catalogueFor(shop.room.decor, spot).filter(item => item.price > 0).map(item => (
          <ShopItemCard
            key={item.id}
            id={item.id}
            label={ROOM_STYLES[item.id].label}
            price={item.price}
            owned={item.owned}
            art={<StyleSwatch style={ROOM_STYLES[item.id]} />}
            sprinkles={shop.sprinkles}
            armed={shop.armed}
            busy={shop.busy}
            onArm={shop.arm}
            onConfirm={shop.buy}
          />
        ))}
      </ul>
    </section>
  ))
}

// Mockup swatchSvg: two wall panels, or a floor tile with its pattern.
function StyleSwatch({ style }) {
  return (
    <svg className="pip-style-swatch-svg" viewBox="0 0 60 56" aria-hidden="true" focusable="false">
      {style.left ? (
        <>
          <rect x="2" y="4" width="28" height="48" fill={style.left} stroke={ROOM_INK} />
          <rect x="30" y="4" width="28" height="48" fill={style.right} stroke={ROOM_INK} />
          {style.sprigs && <text x="9" y="34" fontSize="16">🌿</text>}
        </>
      ) : (
        <>
          <rect x="4" y="8" width="52" height="40" fill={style.base} stroke={ROOM_INK} />
          {style.boards && <path d="M4 18H56M4 28H56M4 38H56" stroke={style.boards} />}
          {style.grid && <path d="M17 8V48M30 8V48M43 8V48M4 21H56M4 34H56" stroke={style.grid} />}
          {style.checker && <path d="M4 8h13v13H4zM30 8h13v13H30zM17 21h13v13H17zM43 21h13v13H43zM4 34h13v14H4zM30 34h13v14H30z" fill={style.checker} />}
        </>
      )}
    </svg>
  )
}

export default ShopStylesTab

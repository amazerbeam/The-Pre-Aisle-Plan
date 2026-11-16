import { DECOR_SPOTS, DECOR_SPOT_LABELS } from '../../../constants/petDecor'
import { decorLabel } from '../../../constants/petRoomLabels'
import { catalogueFor } from '../../../utils/roomPlacements'
import DecorThumb from './DecorThumb'
import ShopItemCard from './ShopItemCard'
import { useRoomPack } from './roomPackContext'

/** MPP-27 AC 1 / MPP-40 AC 8: the Decor tab — the items for each of the 12 spots, grouped under the spot's name. */
function ShopDecorTab({ shop }) {
  const { line } = useRoomPack()
  return DECOR_SPOTS.map(spot => (
    <section key={spot}>
      <h4 className="pip-shop-group">{DECOR_SPOT_LABELS[spot]}</h4>
      <ul className="pip-shop-grid">
        {catalogueFor(shop.room.decor, spot).map(item => (
          <ShopItemCard
            key={item.id}
            id={item.id}
            label={decorLabel(line, item.id)}
            price={item.price}
            owned={item.owned}
            art={<DecorThumb id={item.id} />}
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

export default ShopDecorTab

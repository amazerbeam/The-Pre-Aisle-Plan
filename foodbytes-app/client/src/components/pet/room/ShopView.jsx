import { useEffect } from 'react'
import { ROOM_MIN_LEVEL, SPRINKLES_ICON } from '../../../constants/petRoom'
import { DECOR_SHOP_INTRO, SHOP_TAB_KEYS } from '../../../constants/petDecor'
import { FREE_MODE_SHOP_NOTE, SHOP_CLOSE_LABEL, SHOP_INTRO, SHOP_STATIONS, SHOP_TITLE } from '../../../constants/petShop'
import { EARN_FOOT_LINK, EARN_FOOT_TEXT } from '../../../constants/petSprinkles'
import useBodyScrollLock from '../../../hooks/useBodyScrollLock'
import ShopDecorTab from './ShopDecorTab'
import ShopEarnTab from './ShopEarnTab'
import ShopStationCard from './ShopStationCard'
import ShopStylesTab from './ShopStylesTab'
import ShopTabs from './ShopTabs'
import './ShopView.css'

/**
 * MPP-26 AC 3: the Shop — a modal sheet over the whole screen on a phone (the Dress Pip shell).
 * Header (✕, title, balance), the last result, and one card per station.
 * MPP-27: tabs (Upgrades | Decor | Walls & floors) — shop.tab / shop.setTab; decor and styles buy through shop.buy. Focus, Escape and the
 * Tab trap come from useRoomOverlay (✕ takes focus). Closing forgets the armed button and message.
 *
 * @param {{ shop: Object, titleId: string, panelRef: object, onClose: () => void }} props
 *   shop = { room: PetRoomDTO, sprinkles, armed, busy, status, error, tab, setTab, arm, upgrade, setLevel, buy, reset }
 * MPP-42: a fourth ✨ Earn tab (how sprinkles are earned + your recent ones); the other tabs end with a link to it.
 * MPP-40: while shop.room.freeMode is on (local testing) a note says so and each station gets level chips.
 */
function ShopView({ shop, titleId, panelRef, onClose }) {
  useBodyScrollLock(true)

  useEffect(() => shop.reset, []) // eslint-disable-line react-hooks/exhaustive-deps -- reset once, on close

  // MPP-42 AC 7: the footnote link opens Earn and moves focus to its tab, as an arrow key would.
  const openEarn = () => {
    shop.setTab(SHOP_TAB_KEYS.EARN)
    document.getElementById(`${titleId}-tab-${SHOP_TAB_KEYS.EARN}`)?.focus()
  }
  const isDecorTab = shop.tab === SHOP_TAB_KEYS.DECOR || shop.tab === SHOP_TAB_KEYS.STYLES

  return (
    <div ref={panelRef} className="pip-shop" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-shop-head">
        <button type="button" className="pip-shop-icon-btn" aria-label={SHOP_CLOSE_LABEL} onClick={onClose}>✕</button>
        <h3 id={titleId}>{SHOP_TITLE}</h3>
        <span className="pip-shop-balance" aria-label={`${shop.sprinkles} sprinkles`}>
          <span aria-hidden="true">{SPRINKLES_ICON} {shop.sprinkles}</span>
        </span>
      </div>
      <ShopTabs tab={shop.tab} idPrefix={titleId} onSelect={shop.setTab} />
      <div className="pip-shop-body" id={`${titleId}-panel`} role="tabpanel" aria-labelledby={`${titleId}-tab-${shop.tab}`}>
        {shop.status && <p className="pip-shop-status" role="status">{shop.status}</p>}
        {shop.error && <p className="pip-shop-error" role="alert">{shop.error}</p>}
        {shop.room.freeMode && <p className="pip-shop-free" role="note">{FREE_MODE_SHOP_NOTE}</p>}
        {shop.tab === SHOP_TAB_KEYS.UPGRADES && (
          <>
            <p className="pip-shop-intro">{SHOP_INTRO}</p>
            <ul className="pip-shop-list">
          {SHOP_STATIONS.map(station => (
            <ShopStationCard
              key={station.key}
              station={station}
              level={shop.room.stations?.[station.key] ?? ROOM_MIN_LEVEL}
              costs={shop.room.upgradeCosts}
              sprinkles={shop.sprinkles}
              armed={shop.armed}
              busy={shop.busy}
              freeMode={shop.room.freeMode}
              onArm={shop.arm}
              onConfirm={shop.upgrade}
              onSetLevel={shop.setLevel}
            />
          ))}
            </ul>
          </>
        )}
        {isDecorTab && <p className="pip-shop-intro">{DECOR_SHOP_INTRO}</p>}
        {shop.tab === SHOP_TAB_KEYS.DECOR && <ShopDecorTab shop={shop} />}
        {shop.tab === SHOP_TAB_KEYS.STYLES && <ShopStylesTab shop={shop} />}
        {shop.tab === SHOP_TAB_KEYS.EARN && <ShopEarnTab />}
        {shop.tab !== SHOP_TAB_KEYS.EARN && (
          <p className="pip-shop-foot">
            {EARN_FOOT_TEXT}{' '}
            <button type="button" className="pip-shop-foot-link" onClick={openEarn}>{EARN_FOOT_LINK}</button>
          </p>
        )}
      </div>
    </div>
  )
}

export default ShopView

import { ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, SPRINKLES_ICON } from '../../../constants/petRoom'
import { FREE_MODE_LEVEL_LABEL, SHOP_BUSY_LABEL, SHOP_FULLY_UPGRADED, SHOP_MAX_LEVEL_LABEL, STATION_LEVEL_NAMES } from '../../../constants/petShop'
import StationThumb from './StationThumb'

const LEVELS = Array.from({ length: ROOM_MAX_LEVEL - ROOM_MIN_LEVEL + 1 }, (_, i) => ROOM_MIN_LEVEL + i)

/**
 * MPP-26 AC 3: one station in the shop — next-level thumbnail, level dots, now / next names and
 * the button (upgrade → confirm → upgrading…, or short / maxed). Swapping the label in place keeps
 * the same <button>, so focus stays on it between the two taps.
 * MPP-40: in free mode (`freeMode`) the button is replaced by level chips 1–4 (onSetLevel), and the thumbnail shows the current level.
 */
function ShopStationCard({ station, level, costs, sprinkles, armed, busy, freeMode = false, onArm, onConfirm, onSetLevel }) {
  const maxed = level >= ROOM_MAX_LEVEL
  const shown = maxed || freeMode ? level : level + 1
  const names = STATION_LEVEL_NAMES[station.key]
  return (
    <li className="pip-shop-card">
      <div className="pip-shop-thumb">
        <StationThumb station={station.key} level={shown} />
        <span className="pip-shop-thumb-tag" aria-hidden="true">L{shown}</span>
      </div>
      <div className="pip-shop-card-body">
        <h4 className="pip-shop-card-title">
          <span aria-hidden="true">{station.icon}</span> {station.label}
          <LevelDots level={level} />
        </h4>
        <p className="pip-shop-now">Now: {names[level - 1]}</p>
        <p className="pip-shop-next">{maxed ? SHOP_FULLY_UPGRADED : <>Next: <b>{names[level]}</b></>}</p>
        {freeMode ? (
          <div className="pip-shop-levels" role="group" aria-label={`${station.label} level`}>
            {LEVELS.map(n => (
              <button
                key={n}
                type="button"
                className="pip-shop-level-chip"
                aria-pressed={level === n}
                aria-label={FREE_MODE_LEVEL_LABEL(n)}
                disabled={busy != null}
                onClick={() => onSetLevel(station.key, n)}
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div className="pip-shop-row">
            <UpgradeAction
              station={station}
              maxed={maxed}
              next={level + 1}
              cost={costs?.[level + 1] ?? null}
              sprinkles={sprinkles}
              armed={armed}
              busy={busy}
              onArm={onArm}
              onConfirm={onConfirm}
            />
          </div>
        )}
      </div>
    </li>
  )
}

function UpgradeAction({ station, maxed, next, cost, sprinkles, armed, busy, onArm, onConfirm }) {
  if (maxed) return <span className="pip-shop-max">{SHOP_MAX_LEVEL_LABEL}</span>
  if (cost == null) return null
  if (busy === station.key) {
    return <button type="button" className="pip-shop-btn" disabled aria-busy="true">{SHOP_BUSY_LABEL}</button>
  }
  if (sprinkles < cost) {
    return (
      <>
        <button type="button" className="pip-shop-btn" disabled>{SPRINKLES_ICON} {cost}</button>
        <span className="pip-shop-short">Need {SPRINKLES_ICON} {cost - sprinkles} more</span>
      </>
    )
  }
  const confirming = armed === station.key
  return (
    <button
      type="button"
      className={confirming ? 'pip-shop-btn is-confirm' : 'pip-shop-btn'}
      disabled={busy != null}
      aria-label={`${confirming ? 'Confirm: upgrade' : 'Upgrade'} ${station.label} to level ${next} for ${cost} sprinkles`}
      onClick={() => (confirming ? onConfirm(station.key) : onArm(station.key))}
    >
      {confirming ? `Confirm ${SPRINKLES_ICON} ${cost}` : `Upgrade · ${SPRINKLES_ICON} ${cost}`}
    </button>
  )
}

function LevelDots({ level }) {
  return (
    <span className="pip-shop-dots" role="img" aria-label={`Level ${level} of ${ROOM_MAX_LEVEL}`}>
      {Array.from({ length: ROOM_MAX_LEVEL }, (_, i) => (
        <b key={i} className={i < level ? 'is-on' : undefined} />
      ))}
    </span>
  )
}

export default ShopStationCard

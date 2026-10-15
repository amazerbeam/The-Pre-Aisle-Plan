import { SPRINKLES_ICON } from '../../../constants/petRoom'
import {
  EARN_INTRO, EARN_LOADING, EARN_NEW_TAG, EARN_RETRY_LABEL, EARN_WAYS,
  GOOD_TO_KNOW, GOOD_TO_KNOW_TITLE, GOOD_WEEK_LABELS, GOOD_WEEK_TITLE
} from '../../../constants/petSprinkles'
import useRecentSprinkles from '../../../hooks/useRecentSprinkles'
import { goodWeek } from '../../../utils/sprinkleHistory'
import EarnRecentList from './EarnRecentList'
import './ShopEarnTab.css'

/**
 * MPP-42: the Shop's ✨ Earn tab — every way to earn with the server's amounts (AC 2–3), a worked
 * good week (AC 4), your recent sprinkles (AC 5) and the small rules (AC 6). Amounts and history
 * come from one read, so while it loads or fails only the static rules show.
 */
function ShopEarnTab() {
  const recent = useRecentSprinkles()
  const rates = recent.data?.rates ?? null
  const week = rates ? goodWeek(rates) : null

  return (
    <div className="pip-earn">
      <p className="pip-shop-intro">{EARN_INTRO}</p>
      {recent.loading && !recent.data && <p className="pip-earn-loading" aria-busy="true">{EARN_LOADING}</p>}
      {recent.error && (
        <div className="pip-earn-error" role="alert">
          <p>{recent.error}</p>
          <button type="button" className="pip-earn-retry" onClick={recent.retry}>{EARN_RETRY_LABEL}</button>
        </div>
      )}
      {rates && (
        <ul className="pip-earn-ways">
          {EARN_WAYS.map(way => (
            <li key={way.key} className="pip-earn-way">
              <span className="pip-earn-icon" aria-hidden="true">{way.icon}</span>
              <div>
                <h4>
                  {way.title}
                  {way.isNew && <span className="pip-earn-new">{EARN_NEW_TAG}</span>}
                </h4>
                <p>{way.detail}</p>
              </div>
              <span className="pip-earn-amount">+{rates[way.rateKey]} {SPRINKLES_ICON}</span>
            </li>
          ))}
        </ul>
      )}
      {week && (
        <div className="pip-earn-week">
          <b>{GOOD_WEEK_TITLE}</b>
          <table>
            <tbody>
              <tr><td>{GOOD_WEEK_LABELS.meals(week.mealCount)}</td><td>{week.meals}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.onTime}</td><td>{week.onTime}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.fullWeek}</td><td>{week.fullWeek}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.shopping}</td><td>{week.shopping}</td></tr>
              <tr className="pip-earn-week-total"><td>{GOOD_WEEK_LABELS.total}</td><td>{week.total} {SPRINKLES_ICON}</td></tr>
            </tbody>
          </table>
        </div>
      )}
      {recent.data && <EarnRecentList entries={recent.data.entries} />}
      <h4 className="pip-shop-group">{GOOD_TO_KNOW_TITLE}</h4>
      <ul className="pip-earn-rules">
        {GOOD_TO_KNOW.map(rule => <li key={rule}>{rule}</li>)}
      </ul>
    </div>
  )
}

export default ShopEarnTab

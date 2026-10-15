import { RECENT_EMPTY, RECENT_TITLE } from '../../../constants/petSprinkles'
import { groupRecent, localISO, relativeDay } from '../../../utils/sprinkleHistory'

/**
 * MPP-42 AC 5: "Your recent sprinkles" — the caller's own last 14 days, newest first, earnings green +
 * and spends red −, one meal's rows on one line. Empty is its own state, never a blank list.
 */
function EarnRecentList({ entries }) {
  const todayISO = localISO(new Date())
  const lines = groupRecent(entries)

  return (
    <section aria-labelledby="pip-earn-recent">
      <h4 id="pip-earn-recent" className="pip-shop-group">{RECENT_TITLE}</h4>
      {lines.length === 0 ? (
        <p className="pip-earn-empty">{RECENT_EMPTY}</p>
      ) : (
        <ul className="pip-earn-recent">
          {lines.map(line => (
            <li key={line.key}>
              <span>
                {line.text}
                <small>{relativeDay(line.createdAt, todayISO)}</small>
              </span>
              <span className={line.amount < 0 ? 'pip-earn-minus' : 'pip-earn-plus'}>
                {line.amount < 0 ? `−${-line.amount}` : `+${line.amount}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default EarnRecentList

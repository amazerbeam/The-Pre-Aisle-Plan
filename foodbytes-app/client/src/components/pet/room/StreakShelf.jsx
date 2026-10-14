import { AWARD_MILESTONES, AWARD_MILESTONE_LABELS, AWARD_SHELVES } from '../../../constants/petAwards'
import { awardCount, nextLine, streakLine } from '../../../utils/petAwards'
import { AwardIcon } from './awardArt'

/**
 * MPP-23 AC 2/3: one cabinet shelf (mockup v5 cabinetHtml → shelf()) — the streak line,
 * the next milestone, and the 7 ladder awards: a gold ×N badge when earned, greyed at 0.
 */
function StreakShelf({ status }) {
  const shelf = AWARD_SHELVES[status.streakType]
  const headingId = `pip-shelf-${status.streakType.toLowerCase()}`
  const next = nextLine(status.next)
  return (
    <section className="pip-cabinet-shelf" aria-labelledby={headingId}>
      <h4 id={headingId}>
        <span aria-hidden="true">{shelf.icon}</span> {shelf.title}
      </h4>
      <p className="pip-cabinet-streak">
        <span>{streakLine(status)}</span>
        {next && <span>{next}</span>}
      </p>
      <ul className="pip-cabinet-awards">
        {AWARD_MILESTONES.map(milestone => {
          const count = awardCount(status, milestone)
          const label = AWARD_MILESTONE_LABELS[milestone]
          return (
            <li
              key={milestone}
              className={count ? 'pip-award' : 'pip-award is-locked'}
              aria-label={count ? `${label}, earned ${count} time${count === 1 ? '' : 's'}` : `${label}, not earned yet`}
            >
              <AwardIcon kind={shelf.kind} />
              <span aria-hidden="true">{label}</span>
              {count > 0 && <span className="pip-award-times" aria-hidden="true">×{count}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default StreakShelf

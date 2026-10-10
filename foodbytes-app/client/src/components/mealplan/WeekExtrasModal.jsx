import { useManageExtras } from '../../hooks/useManageExtras'
import { EXTRAS_SCOPE } from '../../constants/extraChoices'
import { formatShortRange } from '../../utils/manageExtrasUtils'
import ManageExtrasModal from './ManageExtrasModal'
import ShoppingListStaleBar from './ShoppingListStaleBar'

/** MPP-10 / AC 8: Manage extras for the week on screen. Edits change only that week (+ dish defaults). */
function WeekExtrasModal({ startDate, endDate, onClose }) {
  const extras = useManageExtras({ scope: EXTRAS_SCOPE.WEEK, startDate })
  const range = formatShortRange(startDate, endDate)
  return (
    <ManageExtrasModal
      title="Manage extras"
      subtitle={`This week · ${range}`}
      scopeNote={`Changes apply to ${range} only. Your templates and other weeks stay as they are.`}
      savedTo="this week"
      emptyTitle="No extras this week"
      emptyBody={`None of the meals planned for ${range} have a homemade or store-bought choice. Add a dish like Pizza or Pink Sauce Pasta and it'll show up here.`}
      showDates
      extras={extras}
      onClose={() => onClose(extras.hasSaved)}
    >
      {extras.hasSaved && <ShoppingListStaleBar weekStart={startDate} weekEnd={endDate} />}
    </ManageExtrasModal>
  )
}

export default WeekExtrasModal

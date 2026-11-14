import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MealPlanWeekDesktop from './MealPlanWeekDesktop'
import MealPlanWeekMobile from './MealPlanWeekMobile'
import DailyMacroPopup from './DailyMacroPopup'
import WeeklyMacroPopup from './WeeklyMacroPopup'
import SwapDaysModal from './SwapDaysModal'
import CopyWeekModal from './CopyWeekModal'
import SaveTemplateModal from './SaveTemplateModal'
import ApplyTemplateModal from './ApplyTemplateModal'
import ManageTemplatesModal from './ManageTemplatesModal'
import WeekExtrasModal from './WeekExtrasModal'
import TemplateExtrasModal from './TemplateExtrasModal'
import { useHomemadeSelections } from '../../contexts/HomemadeSelectionsContext'
import useMediaQuery from '../../hooks/useMediaQuery'
import { MOBILE_MEDIA_QUERY } from '../../constants/mealPlanUi'
import { RECIPES_PATH } from '../../constants/appRoutes'
import { todayOrFirstDay } from '../../utils/mealPlanDayUtils'
import './MealPlanCalendar.css'

/**
 * MealPlanCalendar - FR-016: 7-day calendar view of meal plan
 * FR-082: Clickable week total showing macro summary popup
 * Swap days feature: day header (desktop) or the menu (mobile) opens the swap modal
 * Shell only: picks the desktop timetable or the mobile day view and owns the modals.
 */
function MealPlanCalendar() {
  const { isAuthenticated } = useAuth()
  const {
    weekPlan, startDate, endDate, loading, error, fetchWeekPlan,
    swapDayMeals, copyWeek,
    templates, loadTemplates,
    saveTemplate, renameTemplate, updateTemplateSnapshot, deleteTemplate, applyTemplate
  } = useMealPlan()
  const navigate = useNavigate()
  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)
  const [swapSourceDay, setSwapSourceDay] = useState(null)
  const [dailyPopupDay, setDailyPopupDay] = useState(null)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showWeekExtras, setShowWeekExtras] = useState(false)     // MPP-10
  const [extrasTemplate, setExtrasTemplate] = useState(null)      // MPP-10: template whose extras are open
  const { reloadSelections } = useHomemadeSelections()
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)

  const currentWeekHasMeals = !!(weekPlan?.days?.some(d =>
    Object.values(d.mealsByType || {}).some(entries => entries.length > 0)
  ))

  const openApply = async () => {
    try { await loadTemplates({ force: true }) } catch {}
    setShowApplyModal(true)
  }

  const openManage = async () => {
    try { await loadTemplates({ force: true }) } catch {}
    setShowManageModal(true)
  }

  const closeWeekExtras = (changed) => {
    setShowWeekExtras(false)
    if (changed) {
      fetchWeekPlan()        // cart icons (AC 12)
      reloadSelections()     // week edits updated dish defaults (AC 4)
    }
  }

  const openTemplateExtras = (template) => {
    setShowManageModal(false)  // replace, don't stack
    setExtrasTemplate(template)
  }

  const closeTemplateExtras = async (backToManage) => {
    setExtrasTemplate(null)
    // Refresh failure is non-fatal: the template list simply keeps its previous extras counts.
    try { await loadTemplates({ force: true }) } catch {}
    if (backToManage) setShowManageModal(true)
  }

  const menuHandlers = {
    onCopyWeek: () => setShowCopyModal(true),
    onManageExtras: () => setShowWeekExtras(true),
    onSaveAs: () => setShowSaveModal(true),
    onApply: openApply,
    onManage: openManage
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="meal-plan-auth-required">
        <h2>Sign In Required</h2>
        <p>Please sign in to view and manage your meal plan.</p>
        <button onClick={() => navigate(RECIPES_PATH)}>Go to Recipes</button>
      </div>
    )
  }

  // A refetch (after an entry edit) sets loading again; only block the screen on first load.
  if (loading && !weekPlan) {
    return (
      <div className="meal-plan-loading">
        <div className="spinner"></div>
        <p>Loading your meal plan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="meal-plan-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="meal-plan-calendar">
      {weekPlan && (isMobile ? (
        <MealPlanWeekMobile
          weekPlan={weekPlan}
          onOpenDayMacros={setDailyPopupDay}
          onOpenWeekMacros={() => setShowWeeklyPopup(true)}
          menuHandlers={{ ...menuHandlers, onSwapDays: () => handleSwapClick(todayOrFirstDay(weekPlan)) }}
        />
      ) : (
        <MealPlanWeekDesktop
          weekPlan={weekPlan}
          onSwap={handleSwapClick}
          onOpenDayMacros={setDailyPopupDay}
          onOpenWeekMacros={() => setShowWeeklyPopup(true)}
          toolbarHandlers={menuHandlers}
        />
      ))}

      {(!weekPlan || weekPlan.days?.every(d =>
        Object.values(d.mealsByType || {}).every(entries => entries.length === 0)
      )) && (
        <div className="empty-plan">
          <p>Your meal plan is empty for this week.</p>
          <p>Go to <a href="/">Recipes</a> and click the day buttons to add meals!</p>
        </div>
      )}

      {/* FR-082: Weekly Macro Popup */}
      {showWeeklyPopup && weekPlan && (
        <WeeklyMacroPopup
          weekData={weekPlan}
          onClose={() => setShowWeeklyPopup(false)}
        />
      )}

      {dailyPopupDay && (
        <DailyMacroPopup day={dailyPopupDay} onClose={() => setDailyPopupDay(null)} />
      )}

      {/* Swap Days Modal */}
      {swapSourceDay && weekPlan && (
        <SwapDaysModal
          sourceDay={swapSourceDay}
          allDays={weekPlan.days}
          onSwap={handleSwap}
          onClose={() => setSwapSourceDay(null)}
        />
      )}

      {/* Copy Week Modal */}
      {showCopyModal && (
        <CopyWeekModal
          sourceStartDate={startDate}
          sourceEndDate={endDate}
          onCopy={handleCopyWeek}
          onClose={() => setShowCopyModal(false)}
        />
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <SaveTemplateModal
          onSave={async (name) => {
            await saveTemplate(name)
            setShowSaveModal(false)
          }}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Apply Template Modal */}
      {showApplyModal && (
        <ApplyTemplateModal
          templates={templates}
          currentWeekHasMeals={currentWeekHasMeals}
          onApply={async (templateId) => {
            await applyTemplate(templateId)
            setShowApplyModal(false)
          }}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      {/* Manage Templates Modal */}
      {showManageModal && (
        <ManageTemplatesModal
          templates={templates}
          onRename={renameTemplate}
          onUpdateSnapshot={updateTemplateSnapshot}
          onDelete={deleteTemplate}
          onOpenExtras={openTemplateExtras}
          onClose={() => setShowManageModal(false)}
        />
      )}

      {/* MPP-10: Manage extras for the week on screen */}
      {showWeekExtras && (
        <WeekExtrasModal startDate={startDate} endDate={endDate} onClose={closeWeekExtras} />
      )}

      {/* MPP-10: Manage extras for one template (replaces Manage templates, with a back arrow) */}
      {extrasTemplate && (
        <TemplateExtrasModal
          template={extrasTemplate}
          onBack={() => closeTemplateExtras(true)}
          onClose={() => closeTemplateExtras(false)}
        />
      )}
    </div>
  )

  // Handler when copy week is confirmed
  async function handleCopyWeek(targetStartDate) {
    try {
      await copyWeek(targetStartDate)
      setShowCopyModal(false)
    } catch (err) {
      // Error already handled in context
    }
  }

  // Handler when a day header is clicked to initiate swap
  function handleSwapClick(day) {
    setSwapSourceDay(day)
  }

  // Handler when a target day is selected in the swap modal
  async function handleSwap(sourceDateISO, targetDateISO) {
    try {
      await swapDayMeals(sourceDateISO, targetDateISO)
    } catch (err) {
      // Error already handled in context
    }
  }
}

export default MealPlanCalendar

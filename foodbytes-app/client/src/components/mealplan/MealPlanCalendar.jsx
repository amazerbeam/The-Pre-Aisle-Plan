import { useState, useEffect, useRef } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MealPlanDay from './MealPlanDay'
import WeeklyMacroPopup from './WeeklyMacroPopup'
import SwapDaysModal from './SwapDaysModal'
import CopyWeekModal from './CopyWeekModal'
import { formatDateRange } from '../../utils/dateUtils'
import './MealPlanCalendar.css'

/**
 * MealPlanCalendar - FR-016: 7-day calendar view of meal plan
 * FR-082: Clickable week total showing macro summary popup
 * Swap days feature: Click day header to swap with another day
 * Auto-scrolls to today on mobile
 * Shows recipes organized by date and meal type
 */
function MealPlanCalendar() {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate, endDate, loading, error, swapDayMeals, copyWeek } = useMealPlan()
  const navigate = useNavigate()
  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)
  const [swapSourceDay, setSwapSourceDay] = useState(null)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const todayRef = useRef(null)

  // Auto-scroll to today on mobile when weekPlan loads
  useEffect(() => {
    if (weekPlan && todayRef.current) {
      // Only scroll on mobile (screen width <= 768px)
      const isMobile = window.innerWidth <= 768
      if (isMobile) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          todayRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 100)
      }
    }
  }, [weekPlan])

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="meal-plan-auth-required">
        <h2>Sign In Required</h2>
        <p>Please sign in to view and manage your meal plan.</p>
        <button onClick={() => navigate('/')}>Go to Recipes</button>
      </div>
    )
  }

  if (loading) {
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
      <header className="calendar-header">
        {/* FR-038: Recipes button moved to Footer.jsx - DO NOT add navigation buttons here */}
        <h2>Meal Plan</h2>
        <button
          className="copy-week-button"
          onClick={() => setShowCopyModal(true)}
          title="Copy this week to another week"
          aria-label="Copy week"
        >
          C
        </button>
        <span className="date-range">{formatDateRange(startDate, endDate)}</span>
        {/* FR-082: Make week total clickable */}
        {weekPlan && (
          <span
            className="week-calories week-calories-clickable"
            onClick={() => setShowWeeklyPopup(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setShowWeeklyPopup(true)
              }
            }}
            aria-label="View weekly macro summary"
          >
            Week Total: {weekPlan.weekTotalCalories} cal
          </span>
        )}
      </header>

      <div className="calendar-grid">
        {weekPlan?.days?.map((day) => (
          <MealPlanDay
            key={day.date}
            day={day}
            onSwapClick={handleSwapClick}
            isSwapSource={swapSourceDay?.date === day.date}
            ref={day.isToday ? todayRef : null}
          />
        ))}
      </div>

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

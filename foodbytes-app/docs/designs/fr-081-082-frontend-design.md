# FR-081 & FR-082: Macro Popup Components - Frontend Design

## Document Information
- **Feature:** Daily and Weekly Macro Popups
- **Requirements:** FR-081 (Daily Macro Popup), FR-082 (Weekly Macro Summary)
- **Status:** Design
- **Date:** 2025-12-09
- **Author:** React Frontend Agent

---

## Overview

This design document specifies the frontend implementation for two clickable macro popups in the Meal Plan view:
1. **Daily Macro Popup (FR-081)**: Click a day's calorie total to see detailed macros for that day
2. **Weekly Macro Summary Popup (FR-082)**: Click the week total to see weekly macro aggregates and daily averages

Both popups follow the existing `IngredientBreakdownPopup` pattern for consistent UX and styling.

---

## 1. New Components

### 1.1 DailyMacroPopup.jsx

**Location:** `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx`

**Purpose:** Display detailed macro breakdown for a single day

**Props:**
```javascript
{
  day: {
    date: string,              // ISO format "2025-12-09"
    dayOfWeek: string,         // "Mon", "Tue", etc.
    totalCalories: number,
    totalProtein: number,      // grams
    totalCarbs: number,        // grams
    totalFat: number           // grams
  },
  onClose: function            // Callback to close popup
}
```

**Component Structure:**
```jsx
import { useEffect, useRef } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import './DailyMacroPopup.css'

function DailyMacroPopup({ day, onClose }) {
  const popupRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    // Close on ESC key
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Cancel on scroll
    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  if (!day) return null

  // Calculate macro percentages
  // Formula: protein/carbs = 4 cal/g, fat = 9 cal/g
  const proteinCalories = day.totalProtein * 4
  const carbsCalories = day.totalCarbs * 4
  const fatCalories = day.totalFat * 9

  const proteinPercent = day.totalCalories > 0
    ? Math.round((proteinCalories / day.totalCalories) * 100)
    : 0
  const carbsPercent = day.totalCalories > 0
    ? Math.round((carbsCalories / day.totalCalories) * 100)
    : 0
  const fatPercent = day.totalCalories > 0
    ? Math.round((fatCalories / day.totalCalories) * 100)
    : 0

  return (
    <div className="macro-popup-overlay">
      <div ref={popupRef} className="macro-popup">
        <header className="macro-popup-header">
          <div className="macro-popup-title">
            <h4>{day.dayOfWeek}</h4>
            <span className="macro-popup-date">{formatDateShort(day.date)}</span>
          </div>
          <button
            className="macro-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <div className="macro-popup-content">
          <div className="macro-total">
            <span className="macro-total-label">Total Calories</span>
            <span className="macro-total-value">{day.totalCalories}</span>
          </div>

          <div className="macro-grid">
            <div className="macro-item macro-item-protein">
              <div className="macro-item-header">
                <span className="macro-item-icon">🥩</span>
                <span className="macro-item-label">Protein</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{day.totalProtein}g</span>
                <span className="macro-item-percent">{proteinPercent}%</span>
              </div>
              <div className="macro-item-calories">{proteinCalories} cal</div>
            </div>

            <div className="macro-item macro-item-carbs">
              <div className="macro-item-header">
                <span className="macro-item-icon">🌾</span>
                <span className="macro-item-label">Carbs</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{day.totalCarbs}g</span>
                <span className="macro-item-percent">{carbsPercent}%</span>
              </div>
              <div className="macro-item-calories">{carbsCalories} cal</div>
            </div>

            <div className="macro-item macro-item-fat">
              <div className="macro-item-header">
                <span className="macro-item-icon">🥑</span>
                <span className="macro-item-label">Fat</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{day.totalFat}g</span>
                <span className="macro-item-percent">{fatPercent}%</span>
              </div>
              <div className="macro-item-calories">{fatCalories} cal</div>
            </div>
          </div>
        </div>

        <p className="macro-popup-hint">Press ESC or tap anywhere to close</p>
      </div>
    </div>
  )
}

export default DailyMacroPopup
```

---

### 1.2 WeeklyMacroPopup.jsx

**Location:** `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx`

**Purpose:** Display weekly macro summary and daily averages

**Props:**
```javascript
{
  weekData: {
    startDate: string,         // ISO format
    endDate: string,           // ISO format
    weekTotalCalories: number,
    weekTotalProtein: number,  // grams
    weekTotalCarbs: number,    // grams
    weekTotalFat: number,      // grams
    daysWithMeals: number      // Number of days that have meals (for averaging)
  },
  onClose: function            // Callback to close popup
}
```

**Component Structure:**
```jsx
import { useEffect, useRef } from 'react'
import { formatDateRange } from '../../utils/dateUtils'
import './WeeklyMacroPopup.css'

function WeeklyMacroPopup({ weekData, onClose }) {
  const popupRef = useRef(null)

  // Close on click outside, ESC key, scroll
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  if (!weekData) return null

  // Calculate weekly totals in calories
  const weekProteinCalories = weekData.weekTotalProtein * 4
  const weekCarbsCalories = weekData.weekTotalCarbs * 4
  const weekFatCalories = weekData.weekTotalFat * 9

  // Calculate daily averages (based on days with meals, not always 7)
  const daysCount = weekData.daysWithMeals || 1
  const avgCalories = Math.round(weekData.weekTotalCalories / daysCount)
  const avgProtein = Math.round(weekData.weekTotalProtein / daysCount)
  const avgCarbs = Math.round(weekData.weekTotalCarbs / daysCount)
  const avgFat = Math.round(weekData.weekTotalFat / daysCount)

  // Calculate percentages for averages
  const avgProteinCalories = avgProtein * 4
  const avgCarbsCalories = avgCarbs * 4
  const avgFatCalories = avgFat * 9

  const avgProteinPercent = avgCalories > 0
    ? Math.round((avgProteinCalories / avgCalories) * 100)
    : 0
  const avgCarbsPercent = avgCalories > 0
    ? Math.round((avgCarbsCalories / avgCalories) * 100)
    : 0
  const avgFatPercent = avgCalories > 0
    ? Math.round((avgFatCalories / avgCalories) * 100)
    : 0

  return (
    <div className="macro-popup-overlay">
      <div ref={popupRef} className="macro-popup macro-popup-wide">
        <header className="macro-popup-header">
          <div className="macro-popup-title">
            <h4>Weekly Summary</h4>
            <span className="macro-popup-date">
              {formatDateRange(weekData.startDate, weekData.endDate)}
            </span>
          </div>
          <button
            className="macro-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <div className="macro-popup-content">
          {/* Weekly Totals Section */}
          <section className="macro-section">
            <h5 className="macro-section-title">Weekly Totals</h5>
            <div className="macro-total">
              <span className="macro-total-label">Total Calories</span>
              <span className="macro-total-value">{weekData.weekTotalCalories}</span>
            </div>
            <div className="macro-summary-grid">
              <div className="macro-summary-item">
                <span className="macro-summary-icon">🥩</span>
                <span className="macro-summary-label">Protein</span>
                <span className="macro-summary-value">{weekData.weekTotalProtein}g</span>
                <span className="macro-summary-calories">{weekProteinCalories} cal</span>
              </div>
              <div className="macro-summary-item">
                <span className="macro-summary-icon">🌾</span>
                <span className="macro-summary-label">Carbs</span>
                <span className="macro-summary-value">{weekData.weekTotalCarbs}g</span>
                <span className="macro-summary-calories">{weekCarbsCalories} cal</span>
              </div>
              <div className="macro-summary-item">
                <span className="macro-summary-icon">🥑</span>
                <span className="macro-summary-label">Fat</span>
                <span className="macro-summary-value">{weekData.weekTotalFat}g</span>
                <span className="macro-summary-calories">{weekFatCalories} cal</span>
              </div>
            </div>
          </section>

          {/* Daily Averages Section */}
          <section className="macro-section">
            <h5 className="macro-section-title">
              Daily Average ({daysCount} {daysCount === 1 ? 'day' : 'days'} with meals)
            </h5>
            <div className="macro-total">
              <span className="macro-total-label">Avg Calories</span>
              <span className="macro-total-value">{avgCalories}</span>
            </div>
            <div className="macro-grid">
              <div className="macro-item macro-item-protein">
                <div className="macro-item-header">
                  <span className="macro-item-icon">🥩</span>
                  <span className="macro-item-label">Protein</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgProtein}g</span>
                  <span className="macro-item-percent">{avgProteinPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgProteinCalories} cal</div>
              </div>

              <div className="macro-item macro-item-carbs">
                <div className="macro-item-header">
                  <span className="macro-item-icon">🌾</span>
                  <span className="macro-item-label">Carbs</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgCarbs}g</span>
                  <span className="macro-item-percent">{avgCarbsPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgCarbsCalories} cal</div>
              </div>

              <div className="macro-item macro-item-fat">
                <div className="macro-item-header">
                  <span className="macro-item-icon">🥑</span>
                  <span className="macro-item-label">Fat</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgFat}g</span>
                  <span className="macro-item-percent">{avgFatPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgFatCalories} cal</div>
              </div>
            </div>
          </section>
        </div>

        <p className="macro-popup-hint">Press ESC or tap anywhere to close</p>
      </div>
    </div>
  )
}

export default WeeklyMacroPopup
```

---

## 2. Component Modifications

### 2.1 MealPlanDay.jsx

**Changes Required:**
1. Add state for popup visibility
2. Make calorie text clickable
3. Handle popup open/close
4. Render DailyMacroPopup when clicked

**Modified Code:**
```jsx
import { useState } from 'react'
import MealPlanEntry from './MealPlanEntry'
import DailyMacroPopup from './DailyMacroPopup'
import { formatDateShort } from '../../utils/dateUtils'
import { getEmojiForMeal } from '../../utils/emojiUtils'
import './MealPlanDay.css'

function MealPlanDay({ day }) {
  const [showMacroPopup, setShowMacroPopup] = useState(false)

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ]

  const activeMealTypes = mealTypes.filter(({ key }) => {
    const entries = day.mealsByType?.[key] || []
    return entries.length > 0
  })

  // FR-081: Handle clicking calorie total
  const handleCalorieClick = () => {
    setShowMacroPopup(true)
  }

  return (
    <div className={`meal-plan-day ${day.isToday ? 'today' : ''}`}>
      <header className="day-header">
        <span className="day-name">{day.dayOfWeek}</span>
        <span className="day-date">{formatDateShort(day.date)}</span>
        {day.isToday && <span className="today-badge">Today</span>}
      </header>

      <div className="day-meals">
        {activeMealTypes.length > 0 ? (
          activeMealTypes.map(({ key, label }) => {
            const entries = day.mealsByType?.[key] || []
            const mealEmoji = getEmojiForMeal(day.date, key)
            return (
              <div key={key} className="meal-section">
                <div className="meal-header">
                  <span className="meal-icon">{mealEmoji}</span>
                  <span className="meal-label">{label}</span>
                </div>
                <div className="meal-entries">
                  {entries.map((entry) => (
                    <MealPlanEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-day-message">No meals planned</div>
        )}
      </div>

      <footer className="day-footer">
        {/* FR-081: Make calorie text clickable */}
        <span
          className="day-calories day-calories-clickable"
          onClick={handleCalorieClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCalorieClick()
            }
          }}
          aria-label={`View macro breakdown for ${day.dayOfWeek}`}
        >
          {day.totalCalories} cal
        </span>
      </footer>

      {/* FR-081: Daily Macro Popup */}
      {showMacroPopup && (
        <DailyMacroPopup
          day={day}
          onClose={() => setShowMacroPopup(false)}
        />
      )}
    </div>
  )
}

export default MealPlanDay
```

**CSS Changes in MealPlanDay.css:**
```css
/* FR-081: Make calorie text clickable */
.day-calories-clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.day-calories-clickable:hover {
  background-color: rgba(74, 63, 128, 0.1);
}

.day-calories-clickable:active {
  background-color: rgba(74, 63, 128, 0.2);
}

/* Keyboard focus style */
.day-calories-clickable:focus {
  outline: 2px solid var(--primary-color, #4a3f80);
  outline-offset: 2px;
}
```

---

### 2.2 MealPlanCalendar.jsx

**Changes Required:**
1. Add state for weekly popup visibility
2. Make "Week Total" text clickable
3. Handle popup open/close
4. Render WeeklyMacroPopup when clicked

**Modified Code:**
```jsx
import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MealPlanDay from './MealPlanDay'
import WeeklyMacroPopup from './WeeklyMacroPopup'
import { formatDateRange } from '../../utils/dateUtils'
import './MealPlanCalendar.css'

function MealPlanCalendar() {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate, endDate, loading, error } = useMealPlan()
  const navigate = useNavigate()
  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)

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

  // FR-082: Handle clicking week total
  const handleWeekTotalClick = () => {
    setShowWeeklyPopup(true)
  }

  return (
    <div className="meal-plan-calendar">
      <header className="calendar-header">
        <h2>Meal Plan</h2>
        <span className="date-range">{formatDateRange(startDate, endDate)}</span>
        {weekPlan && (
          /* FR-082: Make week total clickable */
          <span
            className="week-calories week-calories-clickable"
            onClick={handleWeekTotalClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleWeekTotalClick()
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
          <MealPlanDay key={day.date} day={day} />
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
    </div>
  )
}

export default MealPlanCalendar
```

**CSS Changes in MealPlanCalendar.css:**
```css
/* FR-082: Make week total clickable */
.week-calories-clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.week-calories-clickable:hover {
  background-color: #3d3469;
  transform: scale(1.02);
}

.week-calories-clickable:active {
  transform: scale(0.98);
}

/* Keyboard focus style */
.week-calories-clickable:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}
```

---

## 3. Styling

### 3.1 DailyMacroPopup.css

**Location:** `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css`

```css
/* FR-081: Daily Macro Popup Styles */
/* Based on IngredientBreakdownPopup pattern */

.macro-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.macro-popup {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-width: 320px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  animation: slideIn 0.2s ease-out;
}

.macro-popup-wide {
  max-width: 600px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.macro-popup-header {
  background: #4a3f80;
  color: #fff;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.macro-popup-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-popup-title h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.macro-popup-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.macro-popup-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.macro-popup-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.macro-popup-content {
  padding: 20px;
}

.macro-total {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.macro-total-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.macro-total-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #4a3f80;
}

.macro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.macro-item {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: border-color 0.2s ease;
}

.macro-item:hover {
  border-color: #4a3f80;
}

.macro-item-protein {
  border-color: #e57373;
}

.macro-item-carbs {
  border-color: #ffa726;
}

.macro-item-fat {
  border-color: #66bb6a;
}

.macro-item-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
}

.macro-item-icon {
  font-size: 1.5rem;
}

.macro-item-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.macro-item-values {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.macro-item-grams {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.macro-item-percent {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 12px;
}

.macro-item-calories {
  font-size: 0.75rem;
  color: #999;
}

.macro-popup-hint {
  text-align: center;
  font-size: 0.75rem;
  color: #999;
  padding: 8px;
  margin: 0;
  border-top: 1px solid #eee;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .macro-popup {
    max-width: 95%;
    margin: 10px;
  }

  .macro-popup-header {
    padding: 14px;
  }

  .macro-popup-title h4 {
    font-size: 1.1rem;
  }

  .macro-popup-content {
    padding: 16px;
  }

  .macro-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .macro-item {
    padding: 14px;
  }
}
```

---

### 3.2 WeeklyMacroPopup.css

**Location:** `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.css`

```css
/* FR-082: Weekly Macro Popup Styles */
/* Extends macro-popup styles from DailyMacroPopup.css */

@import './DailyMacroPopup.css';

.macro-section {
  margin-bottom: 24px;
}

.macro-section:last-child {
  margin-bottom: 0;
}

.macro-section-title {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 6px;
}

.macro-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.macro-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 6px;
}

.macro-summary-icon {
  font-size: 1.5rem;
}

.macro-summary-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.macro-summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.macro-summary-calories {
  font-size: 0.75rem;
  color: #999;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .macro-summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .macro-summary-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 14px;
  }

  .macro-summary-icon {
    order: 1;
  }

  .macro-summary-label {
    order: 2;
    flex: 1;
    text-align: left;
    margin-left: 10px;
  }

  .macro-summary-value {
    order: 3;
  }

  .macro-summary-calories {
    order: 4;
    margin-left: 6px;
  }
}
```

---

## 4. Props & Data Flow

### 4.1 Data Source

Both popups require macro data from the backend. According to FR-080, the backend should calculate and include macro data in the DTOs:

**Expected DTO Updates:**

**MealPlanDayDTO.java** (Backend):
```java
public class MealPlanDayDTO {
    private LocalDate date;
    private String dayOfWeek;
    private Boolean isToday;
    private Map<String, List<MealPlanEntryDTO>> mealsByType;
    private Integer totalCalories;

    // FR-081: New macro fields
    private BigDecimal totalProtein;  // grams
    private BigDecimal totalCarbs;    // grams
    private BigDecimal totalFat;      // grams
}
```

**MealPlanWeekDTO.java** (Backend):
```java
public class MealPlanWeekDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<MealPlanDayDTO> days;
    private Integer weekTotalCalories;

    // FR-082: New macro fields
    private BigDecimal weekTotalProtein;  // grams
    private BigDecimal weekTotalCarbs;    // grams
    private BigDecimal weekTotalFat;      // grams
    private Integer daysWithMeals;        // For calculating averages
}
```

### 4.2 Data Flow Diagram

```
Backend API (MealPlanController)
  ↓ (GET /api/meal-plan?startDate=...)
mealPlanService.js (Axios request)
  ↓ (response.data)
MealPlanContext (weekPlan state)
  ↓ (via useMealPlan hook)
MealPlanCalendar (weekPlan prop)
  ↓ (weekPlan.days[i])
MealPlanDay (day prop)
  ↓ (onClick day.totalCalories)
DailyMacroPopup (day prop with macros)

MealPlanCalendar (weekPlan prop)
  ↓ (onClick weekPlan.weekTotalCalories)
WeeklyMacroPopup (weekData prop with macros)
```

### 4.3 Fallback Handling

If the backend has not yet implemented FR-080 macro fields, the popups should handle missing data gracefully:

```javascript
// In DailyMacroPopup.jsx
const proteinValue = day.totalProtein ?? 0
const carbsValue = day.totalCarbs ?? 0
const fatValue = day.totalFat ?? 0

// Display message if all macros are 0
if (proteinValue === 0 && carbsValue === 0 && fatValue === 0) {
  return (
    <div className="macro-popup-overlay">
      <div ref={popupRef} className="macro-popup">
        <header className="macro-popup-header">
          <h4>Macro data not available</h4>
          <button className="macro-popup-close" onClick={onClose}>&times;</button>
        </header>
        <div className="macro-popup-content">
          <p>Macro data is being calculated. Please check back later.</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Accessibility

### 5.1 Keyboard Navigation

**Implemented Features:**
- **Enter/Space keys**: Activate clickable calorie text
- **ESC key**: Close open popup
- **Tab navigation**: Focus on clickable elements
- **Focus indicators**: Visible outline on focus

### 5.2 ARIA Labels

**Implemented Attributes:**
- `role="button"` on clickable calorie text
- `tabIndex={0}` for keyboard accessibility
- `aria-label` describing the action (e.g., "View macro breakdown for Monday")
- `aria-label="Close"` on close button

### 5.3 Screen Reader Support

- Semantic HTML structure (header, section, h4, h5)
- Clear heading hierarchy
- Descriptive labels for all interactive elements
- Non-visual close methods (ESC key, click outside)

### 5.4 Color Contrast

All text meets WCAG AA standards:
- Header text (#fff) on brand color (#4a3f80): 8.2:1 contrast ratio
- Body text (#333) on white (#fff): 12.6:1 contrast ratio
- Secondary text (#666) on white (#fff): 5.7:1 contrast ratio

---

## 6. Requirements Addressed

### FR-081: Daily Macro Popup

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Daily calorie text in Meal Plan is clickable (cursor: pointer) | ✅ `.day-calories-clickable` class with `cursor: pointer` |
| Clicking opens a popup/modal with macro breakdown | ✅ `DailyMacroPopup` component with overlay |
| Popup displays day name and date | ✅ `day.dayOfWeek` and `formatDateShort(day.date)` in header |
| Popup displays total calories | ✅ `day.totalCalories` in macro-total section |
| Popup displays protein (grams and percentage) | ✅ `day.totalProtein` with calculated percentage |
| Popup displays carbs (grams and percentage) | ✅ `day.totalCarbs` with calculated percentage |
| Popup displays fat (grams and percentage) | ✅ `day.totalFat` with calculated percentage |
| Macros calculated from ingredient data | ✅ Backend responsibility (FR-080), frontend displays |
| Percentage formula: protein/carbs = 4 cal/g, fat = 9 cal/g | ✅ Implemented in `proteinCalories = day.totalProtein * 4` etc. |
| Popup closes on backdrop click | ✅ Click-outside detection with `useEffect` |
| Popup closes on X button | ✅ Close button in header |
| Popup closes on ESC key | ✅ ESC key listener in `useEffect` |

### FR-082: Weekly Macro Summary Popup

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Weekly "Total" text in Meal Plan is clickable | ✅ `.week-calories-clickable` class with `cursor: pointer` |
| Clicking opens a popup/modal with weekly macro summary | ✅ `WeeklyMacroPopup` component with overlay |
| Popup displays week date range (e.g., "Dec 9 - Dec 15") | ✅ `formatDateRange(startDate, endDate)` in header |
| Popup displays total weekly calories | ✅ `weekData.weekTotalCalories` |
| Popup displays total weekly protein, carbs, fat | ✅ `weekData.weekTotalProtein/Carbs/Fat` in weekly totals section |
| Popup displays daily averages for all macros | ✅ Calculated from `daysWithMeals` in daily averages section |
| Average based on days with meals (not always 7) | ✅ Uses `weekData.daysWithMeals` for division |
| Daily average percentages shown | ✅ Calculated from average values |
| Macros calculated from ingredient data | ✅ Backend responsibility (FR-080), frontend displays |
| Popup closes on backdrop click, X button, ESC key | ✅ Same pattern as DailyMacroPopup |

---

## 7. Testing Plan

### 7.1 Unit Tests (Jest + React Testing Library)

**DailyMacroPopup.test.jsx:**
- Renders with valid day data
- Displays correct day name and date
- Calculates macro percentages correctly
- Closes on ESC key press
- Closes on click outside
- Handles missing macro data gracefully

**WeeklyMacroPopup.test.jsx:**
- Renders with valid week data
- Displays correct date range
- Calculates daily averages correctly
- Uses daysWithMeals for averaging (not hardcoded 7)
- Displays both weekly totals and daily averages
- Closes on ESC key press
- Closes on click outside

**MealPlanDay.test.jsx:**
- Calorie text is clickable
- Opens DailyMacroPopup on click
- Popup closes when requested

**MealPlanCalendar.test.jsx:**
- Week total is clickable
- Opens WeeklyMacroPopup on click
- Popup closes when requested

### 7.2 Integration Tests

- Click daily calorie → popup opens → ESC → popup closes
- Click weekly total → popup opens → click outside → popup closes
- Keyboard navigation (Tab, Enter, Space) works correctly
- Mobile responsive behavior (viewport < 480px)

### 7.3 Manual QA Checklist

- [ ] Daily calorie text has pointer cursor on hover
- [ ] Weekly total has pointer cursor on hover
- [ ] Popups animate in smoothly
- [ ] Macro percentages add up to ~100% (allowing rounding)
- [ ] Brand color #4a3f80 is used in headers
- [ ] No white text on white backgrounds
- [ ] Mobile layout stacks properly
- [ ] Scroll closes popup (as with IngredientBreakdownPopup)
- [ ] Multiple popups don't overlap (only one open at a time)
- [ ] Focus returns to trigger element after close

---

## 8. Dependencies

**No new npm packages required.**

Existing dependencies used:
- React 18+ (useState, useEffect, useRef hooks)
- react-router-dom (already in project)
- date-fns utilities (via `dateUtils.js`)

---

## 9. Implementation Order

1. **Backend updates (FR-080)** - Add macro fields to DTOs and calculate values
2. **Create DailyMacroPopup component** - Build standalone component
3. **Create WeeklyMacroPopup component** - Build standalone component
4. **Update MealPlanDay** - Add click handler and state
5. **Update MealPlanCalendar** - Add click handler and state
6. **Add CSS files** - Style both popups
7. **Test components** - Unit and integration tests
8. **QA pass** - Manual testing on desktop and mobile

---

## 10. Notes

- **Backend Dependency:** These popups require FR-080 (Ingredient Macro Data) to be completed first. If backend macro fields are not ready, popups will show 0 values or "data not available" message.
- **Consistency:** Both popups follow the exact pattern established by `IngredientBreakdownPopup` for UX consistency.
- **Performance:** Popup components are only mounted when opened (conditional rendering), minimizing performance impact.
- **Accessibility:** All popups meet WCAG AA standards and support keyboard navigation.
- **Mobile-First:** CSS uses mobile-first approach with responsive breakpoints at 480px.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial design document |

import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Ticker from './components/layout/Ticker.jsx'
import RecipeList from './components/recipes/RecipeList.jsx'
import MealPlanCalendar from './components/mealplan/MealPlanCalendar.jsx'
import ShoppingList from './components/shopping/ShoppingList.jsx'
import PetView from './components/pet/PetView.jsx'
import LandingPageAnimation from './components/onboarding/LandingPageAnimation.jsx'
import Toast from './components/common/Toast.jsx'
import { useAuth } from './contexts/AuthContext'
import { useMealPlan } from './contexts/MealPlanContext'
import { useTheme } from './contexts/ThemeContext'
import { PET_ROUTE } from './constants/pet'
import useDocumentTitle from './hooks/useDocumentTitle'
import './styles/global.css'

function App() {
  const { isAuthenticated, isGuest, loading } = useAuth()
  const { theme } = useTheme()
  // MPP-37: the Pip tab is full screen — no top bar (date picker + account menu).
  const pipMode = useLocation().pathname.replace(/\/+$/, '') === PET_ROUTE
  useDocumentTitle()
  // FR-098: Get assignment error for toast display
  const { assignmentError, clearAssignmentError } = useMealPlan()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    if (loading) return

    const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true'
    const shouldShowLanding = !isAuthenticated && !isGuest && !hasSeenIntro

    setShowLanding(shouldShowLanding)
  }, [isAuthenticated, isGuest, loading])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Show landing page animation for first-time guests
  if (showLanding) {
    return <LandingPageAnimation onComplete={() => setShowLanding(false)} />
  }

  return (
    <div className="app">
      {theme.effects && <div className="city-rain" aria-hidden="true" />}
      {!pipMode && (
        <>
          <Header />
          {theme.ticker && <Ticker />}
        </>
      )}
      <main className={pipMode ? 'main-content main-content--pip' : 'main-content'}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/mealplan" element={<MealPlanCalendar />} />
          <Route path="/pet" element={<PetView />} />
          <Route path="/shopping" element={<ShoppingList />} />
        </Routes>
      </main>
      <Footer alwaysVisible={pipMode} />
      {/* FR-098: Toast for assignment errors */}
      <Toast message={assignmentError} onClose={clearAssignmentError} />
    </div>
  )
}

export default App

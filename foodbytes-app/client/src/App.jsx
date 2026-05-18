import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import RecipeList from './components/recipes/RecipeList.jsx'
import SearchView from './components/recipes/SearchView.jsx'
import MealPlanCalendar from './components/mealplan/MealPlanCalendar.jsx'
import ShoppingList from './components/shopping/ShoppingList.jsx'
import LandingPageAnimation from './components/onboarding/LandingPageAnimation.jsx'
import Toast from './components/common/Toast.jsx'
import { useAuth } from './contexts/AuthContext'
import { useMealPlan } from './contexts/MealPlanContext'
import './styles/global.css'

function App() {
  const { isAuthenticated, isGuest, loading } = useAuth()
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
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/mealplan" element={<MealPlanCalendar />} />
          <Route path="/shopping" element={<ShoppingList />} />
        </Routes>
      </main>
      <Footer />
      {/* FR-098: Toast for assignment errors */}
      <Toast message={assignmentError} onClose={clearAssignmentError} />
    </div>
  )
}

export default App

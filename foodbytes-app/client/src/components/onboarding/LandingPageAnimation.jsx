import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LandingPageAnimation.css'

// Phase content constants
const PHASE_1_LINES = [
  "Most people have no idea what they're eating.",
  "And it's not their fault."
]

const PHASE_2_PROBLEMS = [
  "Schools never taught us nutrition",
  "Portion sizes are wildly distorted",
  "Food labels are designed to confuse",
  "Cooking skills weren't passed down",
  "Nutrition advice changes every year",
  "Tracking calories feels like a full-time job"
]

const PHASE_2_FINAL = "You're not lazy. You're not stupid. The system is broken."

const PHASE_4_FEATURES = [
  "Curated recipes with real calorie and macro data",
  "Meal planning that hits your targets automatically",
  "Shopping lists organized by aisle",
  "No calorie counting — just pick meals and eat",
  "Learn to cook through simple, repeatable recipes",
  "Build habits that actually stick"
]

const PHASE_5_BENEFITS = [
  "Curated recipes with real nutrition data",
  "Automatic meal planning",
  "Smart shopping lists by aisle",
  "No calorie counting required",
  "Simple, repeatable recipes",
  "Build lasting habits"
]

function LandingPageAnimation({ onComplete }) {
  const { loginWithGoogle, continueAsGuest } = useAuth()

  // State management
  const [currentPhase, setCurrentPhase] = useState(0)
  const [currentItem, setCurrentItem] = useState(0)
  const [showSecondLine, setShowSecondLine] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Skip to Phase 5 if reduced motion preferred
  useEffect(() => {
    if (prefersReducedMotion) {
      skipToEnd()
    }
  }, [prefersReducedMotion])

  const skipToEnd = useCallback(() => {
    setIsAnimating(false)
    setCurrentPhase(4)
    setCurrentItem(0)
    localStorage.setItem('hasSeenIntro', 'true')
  }, [])

  // Phase progression timer
  useEffect(() => {
    if (!isAnimating || currentPhase === 4) return

    let timer

    if (currentPhase === 0) {
      // Phase 1: Show first line, then second line after 2s
      if (!showSecondLine) {
        timer = setTimeout(() => setShowSecondLine(true), 2000)
      } else {
        // Move to Phase 2 after 4 more seconds
        timer = setTimeout(() => {
          setCurrentPhase(1)
          setCurrentItem(0)
          setShowSecondLine(false)
        }, 4000)
      }
    } else if (currentPhase === 1) {
      // Phase 2: Problems list (6 items) + final statement
      if (currentItem < PHASE_2_PROBLEMS.length) {
        timer = setTimeout(() => setCurrentItem(prev => prev + 1), 2400)
      } else if (currentItem === PHASE_2_PROBLEMS.length) {
        // Show final statement, then move to Phase 3
        timer = setTimeout(() => {
          setCurrentPhase(2)
          setCurrentItem(0)
        }, 4000)
      }
    } else if (currentPhase === 2) {
      // Phase 3: The Solution - show for 5 seconds
      timer = setTimeout(() => {
        setCurrentPhase(3)
        setCurrentItem(0)
      }, 5000)
    } else if (currentPhase === 3) {
      // Phase 4: Features list (6 items)
      if (currentItem < PHASE_4_FEATURES.length - 1) {
        timer = setTimeout(() => setCurrentItem(prev => prev + 1), 2400)
      } else {
        timer = setTimeout(() => {
          setCurrentPhase(4)
          setCurrentItem(0)
          localStorage.setItem('hasSeenIntro', 'true')
        }, 2400)
      }
    }

    return () => clearTimeout(timer)
  }, [currentPhase, currentItem, showSecondLine, isAnimating])

  // Mark intro as seen when Phase 5 reached
  useEffect(() => {
    if (currentPhase === 4) {
      localStorage.setItem('hasSeenIntro', 'true')
    }
  }, [currentPhase])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentPhase < 4) {
        skipToEnd()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentPhase, skipToEnd])

  const handleLogin = () => {
    loginWithGoogle()
  }

  const handleGuestContinue = () => {
    continueAsGuest()
    onComplete()
  }

  // Determine background class
  const isDarkPhase = currentPhase < 2
  const backgroundClass = isDarkPhase ? 'phase-depressing' : 'phase-uplifting'

  return (
    <div
      className={`landing-animation-container ${backgroundClass}`}
      role="region"
      aria-label="Welcome animation"
    >
      {/* Skip Button - visible during phases 0-3 */}
      {currentPhase < 4 && (
        <button
          className="skip-button"
          onClick={skipToEnd}
          aria-label="Skip animation and go to summary"
        >
          Skip intro →
        </button>
      )}

      <div className="phase-content">
        {/* Phase 1: The Hook */}
        {currentPhase === 0 && (
          <div className="phase-1">
            <h1 className="hook-primary animate-fade-in">
              {PHASE_1_LINES[0]}
            </h1>
            {showSecondLine && (
              <h2 className="hook-secondary animate-fade-in">
                {PHASE_1_LINES[1]}
              </h2>
            )}
          </div>
        )}

        {/* Phase 2: Problems List */}
        {currentPhase === 1 && (
          <div className="phase-2">
            {currentItem < PHASE_2_PROBLEMS.length ? (
              <p className="problem-text animate-fade-in-out" key={currentItem}>
                {PHASE_2_PROBLEMS[currentItem]}
              </p>
            ) : (
              <h2 className="problem-final animate-fade-in" key="final">
                {PHASE_2_FINAL}
              </h2>
            )}
          </div>
        )}

        {/* Phase 3: The Solution */}
        {currentPhase === 2 && (
          <div className="phase-3">
            <h1 className="solution-primary animate-fade-in">
              The Solution
            </h1>
            <h2 className="solution-secondary animate-fade-in delay-1s">
              Join My Pantry Plan
            </h2>
          </div>
        )}

        {/* Phase 4: Features List */}
        {currentPhase === 3 && (
          <div className="phase-4">
            <p className="feature-text animate-fade-in-out" key={currentItem}>
              {PHASE_4_FEATURES[currentItem]}
            </p>
          </div>
        )}

        {/* Phase 5: Summary & CTA */}
        {currentPhase === 4 && (
          <div className="phase-5">
            <ul className="summary-list" role="list" aria-label="My Pantry Plan features">
              {PHASE_5_BENEFITS.map((benefit, index) => (
                <li
                  className="summary-item"
                  key={index}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="checkmark" aria-hidden="true">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <p className="summary-tagline">
              Stop guessing. Start knowing.
            </p>

            <div className="cta-buttons">
              <button
                className="google-signin-btn"
                onClick={handleLogin}
                aria-label="Sign in with Google to save your meal plans"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  aria-hidden="true"
                />
                Sign in with Google
              </button>

              <button
                className="continue-guest-btn"
                onClick={handleGuestContinue}
                aria-label="Continue as guest to browse recipes"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPageAnimation

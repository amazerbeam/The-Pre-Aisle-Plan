import { useState, useEffect } from 'react'
import './LockEmojiAnimation.css'

/**
 * FR-029: LockEmojiAnimation - Visual indicator for wake lock status
 *
 * Animation sequence (1 second total):
 * 1. Start with unlocked emoji at 1x scale
 * 2. Scale up to 1.1x
 * 3. Scale down to 0.9x
 * 4. Flash white
 * 5. Transform to locked emoji
 * 6. Return to 1x scale
 *
 * @param {boolean} show - Whether to show the animation
 * @param {function} onComplete - Callback when animation completes
 */
function LockEmojiAnimation({ show, onComplete }) {
  const [animationPhase, setAnimationPhase] = useState('hidden')

  useEffect(() => {
    if (!show) {
      setAnimationPhase('hidden')
      return
    }

    // Start animation sequence
    setAnimationPhase('unlocked')

    const phases = [
      { phase: 'scale-up', delay: 100 },
      { phase: 'scale-down', delay: 250 },
      { phase: 'flash', delay: 400 },
      { phase: 'locked', delay: 550 },
      { phase: 'scale-normal', delay: 750 },
      { phase: 'fade-out', delay: 900 }
    ]

    const timeouts = phases.map(({ phase, delay }) =>
      setTimeout(() => setAnimationPhase(phase), delay)
    )

    // Complete and hide after 1 second
    const completeTimeout = setTimeout(() => {
      setAnimationPhase('hidden')
      onComplete?.()
    }, 1000)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(completeTimeout)
    }
  }, [show, onComplete])

  if (animationPhase === 'hidden') return null

  const isLocked = ['locked', 'scale-normal', 'fade-out'].includes(animationPhase)

  return (
    <div className={`lock-emoji-container ${animationPhase}`}>
      <span className="lock-emoji">
        {isLocked ? '\uD83D\uDD12' : '\uD83D\uDD13'}
      </span>
    </div>
  )
}

export default LockEmojiAnimation

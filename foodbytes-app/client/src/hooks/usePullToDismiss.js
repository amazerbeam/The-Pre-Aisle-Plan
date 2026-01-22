import { useState, useRef, useCallback } from 'react'

/**
 * Hook for pull-to-dismiss gesture on mobile popups.
 * - At top of scroll, drag down → X appears at bottom
 * - At bottom of scroll, drag up → X appears at top
 * Releasing over the X dismisses the popup.
 *
 * @param {Function} onDismiss - Callback when popup should be dismissed
 * @param {Object} options - Configuration options
 * @param {number} options.targetRadius - Radius of the X target hit area (default: 40)
 * @returns {Object} - { isDragging, circlePosition, isOverTarget, targetPosition, handlers, setScrollableRef }
 */
export function usePullToDismiss(onDismiss, options = {}) {
  const { targetRadius = 40 } = options

  const [isDragging, setIsDragging] = useState(false)
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 })
  const [isOverTarget, setIsOverTarget] = useState(false)
  const [dragDirection, setDragDirection] = useState(null) // 'down' or 'up'

  const startY = useRef(0)
  const scrollableRef = useRef(null)
  const isTouchActive = useRef(false)
  const initialScrollTop = useRef(0)

  // Target position based on drag direction
  const getTargetPosition = useCallback(() => {
    if (dragDirection === 'down') {
      // Dragging down from top → X at bottom
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight - 80
      }
    } else if (dragDirection === 'up') {
      // Dragging up from bottom → X at top
      return {
        x: window.innerWidth / 2,
        y: 80
      }
    }
    return { x: window.innerWidth / 2, y: window.innerHeight - 80 }
  }, [dragDirection])

  // Check if circle is over target
  const checkOverTarget = useCallback((x, y, direction) => {
    const targetY = direction === 'up' ? 80 : window.innerHeight - 80
    const targetX = window.innerWidth / 2
    const distance = Math.sqrt(
      Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2)
    )
    return distance < targetRadius + 30 // 30px for circle radius
  }, [targetRadius])

  // Check if at top of scroll
  const isAtTop = useCallback(() => {
    const el = scrollableRef.current
    if (!el) return true
    return el.scrollTop <= 0
  }, [])

  // Check if at bottom of scroll
  const isAtBottom = useCallback(() => {
    const el = scrollableRef.current
    if (!el) return true
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 1
  }, [])

  const handleTouchStart = useCallback((e) => {
    // Only enable on mobile
    if (window.innerWidth > 768) return

    const touch = e.touches[0]
    startY.current = touch.clientY
    initialScrollTop.current = scrollableRef.current?.scrollTop || 0
    isTouchActive.current = true
    setDragDirection(null)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isTouchActive.current) return
    if (window.innerWidth > 768) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY.current

    // Determine direction and check if at boundary
    let direction = null
    let shouldActivate = false

    if (deltaY > 10 && isAtTop()) {
      // Dragging down while at top
      direction = 'down'
      shouldActivate = true
    } else if (deltaY < -10 && isAtBottom()) {
      // Dragging up while at bottom
      direction = 'up'
      shouldActivate = true
    }

    if (shouldActivate) {
      setIsDragging(true)
      setDragDirection(direction)
      setCirclePosition({ x: touch.clientX, y: touch.clientY })
      setIsOverTarget(checkOverTarget(touch.clientX, touch.clientY, direction))

      // Prevent scroll while dragging to dismiss
      e.preventDefault()
    } else if (!isDragging) {
      // Allow normal scrolling if not in dismiss mode
      setDragDirection(null)
    }
  }, [isAtTop, isAtBottom, checkOverTarget, isDragging])

  const handleTouchEnd = useCallback(() => {
    if (isDragging && isOverTarget) {
      onDismiss()
    }

    setIsDragging(false)
    setIsOverTarget(false)
    setDragDirection(null)
    isTouchActive.current = false
  }, [isDragging, isOverTarget, onDismiss])

  // Attach ref to scrollable element
  const setScrollableRef = useCallback((element) => {
    scrollableRef.current = element
  }, [])

  // Touch handlers to spread onto the popup container
  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }

  return {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers,
    setScrollableRef,
    targetPosition: getTargetPosition()
  }
}

export default usePullToDismiss

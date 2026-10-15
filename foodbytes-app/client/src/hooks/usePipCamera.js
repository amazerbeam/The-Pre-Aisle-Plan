import { useLayoutEffect, useRef } from 'react'
import { ROOM_CAMERA, ROOM_PX_PER_UNIT, ROOM_ZOOM, ROOM_ZOOM_SAVE_DELAY_MS } from '../constants/petRoom'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { cameraBounds, clampZoom, easeInOut, fitAxis, rubberAxis, viewSize, worldTransform } from '../utils/roomCamera'
import { readRoomZoom, writeRoomZoom } from '../utils/roomZoomStore'

const KEY_PAN = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
const KEY_ZOOM = { '+': ROOM_ZOOM.STEP, '=': ROOM_ZOOM.STEP, '-': 1 / ROOM_ZOOM.STEP, _: 1 / ROOM_ZOOM.STEP }

/**
 * MPP-39: the camera over Pip's room. `stageRef` is the screen-sized viewport, `worldRef` the layer
 * holding the SVG and the tap areas, `focus` Pip's [x, y] in world px (roomLayout.pipFocusPoint).
 * Motion lives in refs and writes one CSS transform per frame, so it never re-renders PetRoom.
 * Drag pans with a trail (AC 9–10), past the room it rubber-bands (AC 11), on release it floats back
 * to Pip over 2 s (AC 12–13) and it follows Pip when he moves (AC 14). Pinch, Ctrl+wheel and
 * + / − / 0 zoom around Pip (AC 15) and the zoom is remembered (AC 16). Arrow keys pan (AC 17).
 * Reduced motion jumps straight to the target (AC 19).
 * @returns {{ recentre: () => void }}
 */
function usePipCamera({ stageRef, worldRef, focus }) {
  const cameraRef = useRef(null)
  if (cameraRef.current === null) cameraRef.current = createCamera(readRoomZoom())
  const camera = cameraRef.current
  const [focusX, focusY] = focus

  // Layout effects, in order: attach before the first paint (no flash at the origin), then aim.
  useLayoutEffect(() => camera.attach(stageRef.current, worldRef.current), [camera, stageRef, worldRef])
  useLayoutEffect(() => camera.setFocus(focusX, focusY), [camera, focusX, focusY])

  return { recentre: camera.recentre }
}

// The camera's state and motion — plain JS, so a frame is a ref write, not a render.
function createCamera(initialZoom) {
  const s = {
    x: null, y: null, tx: 0, ty: 0, zoom: initialZoom, zoomTarget: initialZoom,
    focus: null, pip: true, from: null, t0: 0, frame: 0, stage: null, world: null, w: 0, h: 0
  }

  const clampTo = (axis, x, y) => {
    const [vw, vh] = viewSize(s.w, s.h, s.zoom)
    const b = cameraBounds()
    return [axis(x, vw, b.minX, b.maxX), axis(y, vh, b.minY, b.maxY)]
  }
  const aim = () => clampTo(fitAxis, ...s.focus)
  const paint = () => {
    if (s.world && s.w > 0 && s.x !== null) s.world.style.transform = worldTransform(s.x, s.y, s.zoom, s.w, s.h)
  }
  const moving = on => s.stage?.classList.toggle('is-moving', on)

  const step = () => {
    const reduced = prefersReducedMotion()
    s.zoom = reduced ? s.zoomTarget : s.zoom + (s.zoomTarget - s.zoom) * ROOM_ZOOM.EASE
    if (Math.abs(s.zoomTarget - s.zoom) < ROOM_ZOOM.SNAP) s.zoom = s.zoomTarget
    if (s.pip) [s.tx, s.ty] = aim()
    let done
    if (s.pip && s.from) {
      const t = Math.min(1, (performance.now() - s.t0) / ROOM_CAMERA.SETTLE_MS)
      const e = easeInOut(t)
      s.x = s.from[0] + (s.tx - s.from[0]) * e
      s.y = s.from[1] + (s.ty - s.from[1]) * e
      done = reduced || (t >= 1 && s.zoom === s.zoomTarget)
    } else {
      const dx = s.tx - s.x
      const dy = s.ty - s.y
      done = reduced || (Math.hypot(dx, dy) < ROOM_CAMERA.SETTLED && s.zoom === s.zoomTarget)
      s.x += dx * ROOM_CAMERA.FOLLOW
      s.y += dy * ROOM_CAMERA.FOLLOW
    }
    if (done) {
      ;[s.x, s.y, s.zoom, s.from, s.frame] = [s.tx, s.ty, s.zoomTarget, null, 0]
      moving(false)
    } else {
      s.frame = requestAnimationFrame(step)
    }
    paint()
  }
  const chase = () => {
    if (!s.stage || s.x === null) return
    cancelAnimationFrame(s.frame)
    moving(true)
    s.frame = requestAnimationFrame(step)
  }
  // AC 12–14 / AC 18: float back to Pip; a float already running keeps its clock.
  const floatHome = () => {
    s.pip = true
    if (!s.from && s.x !== null) {
      s.from = [s.x, s.y]
      s.t0 = performance.now()
    }
    chase()
  }
  // A drag or key target: rubber-banded, trailed, not Pip.
  const pullTo = (x, y) => {
    ;[s.tx, s.ty] = clampTo(rubberAxis, x, y)
    s.pip = false
    s.from = null
    chase()
  }
  // AC 16: the target moves per event, but storage is written once the gesture settles.
  let saveTimer = 0
  const saveZoom = () => {
    clearTimeout(saveTimer)
    saveTimer = 0
    writeRoomZoom(s.zoomTarget)
  }
  const setZoom = zoom => {
    s.zoomTarget = clampZoom(zoom)
    clearTimeout(saveTimer)
    saveTimer = setTimeout(saveZoom, ROOM_ZOOM_SAVE_DELAY_MS)
  }
  const place = () => {
    if (!s.focus || s.w === 0) return
    ;[s.x, s.y] = aim()
    ;[s.tx, s.ty] = [s.x, s.y]
    paint()
  }

  return {
    recentre: floatHome,
    setFocus(x, y) {
      s.focus = [x, y]
      if (s.x === null) place()
      else if (s.pip) floatHome()
    },
    attach(stage, world) {
      if (!stage || !world) return undefined
      s.stage = stage
      s.world = world
      const measure = () => {
        s.w = stage.clientWidth
        s.h = stage.clientHeight
        if (s.x === null) place()
        else if (s.pip) chase()
        else paint()
      }
      measure()
      const detach = wireInput(stage, s, { pullTo, floatHome, setZoom, saveZoom, chase })
      const observer = new ResizeObserver(measure)
      observer.observe(stage)
      return () => {
        detach()
        if (saveTimer) saveZoom()
        observer.disconnect()
        cancelAnimationFrame(s.frame)
        s.stage = null
        s.world = null
      }
    }
  }
}

// AC 9 / 15 / 17: pointer drag + pinch, Ctrl+wheel and keys on the stage. Returns the detach.
function wireInput(stage, s, { pullTo, floatHome, setZoom, saveZoom, chase }) {
  const pointers = new Map()
  let drag = null
  let pinch = null
  let keyRaw = null
  let swallow = false
  let unswallow = 0
  const spread = () => {
    const [a, b] = [...pointers.values()]
    return Math.hypot(a[0] - b[0], a[1] - b[1])
  }
  const endGesture = () => {
    swallow = true
    clearTimeout(unswallow)
    unswallow = setTimeout(() => { swallow = false }, 0) // only the click from this release
    stage.classList.remove('is-dragging')
    floatHome()
  }

  const onDown = e => {
    if (e.button > 0 || e.target.closest?.('.pip-room-recentre')) return
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    if (pointers.size === 2) {
      drag = null
      pinch = { dist: spread(), zoom: s.zoomTarget }
    } else if (pointers.size === 1) {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: s.x, cy: s.y, moved: false }
    }
  }
  const onMove = e => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, [e.clientX, e.clientY])
    if (pinch) {
      if (pinch.dist > 0) setZoom(pinch.zoom * (spread() / pinch.dist))
      floatHome()
      return
    }
    if (!drag || e.pointerId !== drag.id || s.x === null) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < ROOM_CAMERA.TAP_SLOP_PX) return
    if (!drag.moved) {
      drag.moved = true
      try {
        stage.setPointerCapture(e.pointerId)
      } catch {
        // the pointer is already gone; the drag still works without capture
      }
      stage.classList.add('is-dragging')
    }
    const k = ROOM_PX_PER_UNIT * s.zoom
    pullTo(drag.cx - dx / k, drag.cy - dy / k)
  }
  const onUp = e => {
    pointers.delete(e.pointerId)
    if (pinch) {
      if (pointers.size < 2) {
        pinch = null
        drag = null
        saveZoom()
        endGesture()
      }
      return
    }
    if (!drag || e.pointerId !== drag.id) return
    const moved = drag.moved
    drag = null
    if (moved) endGesture()
  }
  const onClick = e => {
    if (!swallow) return
    e.preventDefault()
    e.stopPropagation()
    swallow = false
  }
  const onWheel = e => {
    if (!e.ctrlKey) return // a plain wheel scrolls the page
    e.preventDefault()
    setZoom(s.zoomTarget * Math.exp(-e.deltaY * ROOM_ZOOM.WHEEL_RATE))
    if (drag?.moved) chase()
    else floatHome()
  }
  const onKeyDown = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || s.x === null) return
    const pan = KEY_PAN[e.key]
    if (pan) {
      e.preventDefault()
      keyRaw = keyRaw ?? [s.x, s.y]
      keyRaw = [keyRaw[0] + pan[0] * ROOM_CAMERA.KEY_STEP, keyRaw[1] + pan[1] * ROOM_CAMERA.KEY_STEP]
      pullTo(...keyRaw)
      return
    }
    const factor = KEY_ZOOM[e.key]
    if (!factor && e.key !== '0') return
    e.preventDefault()
    setZoom(factor ? s.zoomTarget * factor : ROOM_ZOOM.DEFAULT)
    floatHome()
  }
  const onKeyUp = e => {
    if (!KEY_PAN[e.key]) return
    keyRaw = null
    floatHome()
  }

  // Focus left the stage mid-key (Tab, overlay, alt-tab): no keyup will arrive, so end the hold here.
  const onFocusOut = () => {
    if (keyRaw === null) return
    keyRaw = null
    floatHome()
  }

  const listeners = [
    ['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['pointercancel', onUp], ['lostpointercapture', onUp], ['focusout', onFocusOut],
    ['keydown', onKeyDown], ['keyup', onKeyUp]
  ]
  listeners.forEach(([type, fn]) => stage.addEventListener(type, fn))
  stage.addEventListener('click', onClick, true)
  stage.addEventListener('wheel', onWheel, { passive: false })
  return () => {
    listeners.forEach(([type, fn]) => stage.removeEventListener(type, fn))
    stage.removeEventListener('click', onClick, true)
    stage.removeEventListener('wheel', onWheel)
    clearTimeout(unswallow)
  }
}

export default usePipCamera

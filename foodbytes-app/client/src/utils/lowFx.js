import { LOW_FX_STORAGE_KEY, LOW_FX_BODY_CLASS } from '../constants/themes'

export function readLowFx() {
  try { return localStorage.getItem(LOW_FX_STORAGE_KEY) === '1' } catch { return false }
}

export function applyLowFx(on) {
  document.body.classList.toggle(LOW_FX_BODY_CLASS, on)
  try { localStorage.setItem(LOW_FX_STORAGE_KEY, on ? '1' : '0') } catch { /* storage blocked */ }
}

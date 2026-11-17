import { PIP_LINE } from '../../../constants/pipLines'

/**
 * MPP-49: Pip's Path skin art per Pip line (approved mockup pips-path.html → pp-skins). Like Pip's room
 * art it keeps its own palette in every theme; board chrome comes from --pp-* tokens. Every piece is a
 * 0 0 48 48 drawing; the board frame is stretched to fill.
 */
function Art({ children, stretch = false, className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" preserveAspectRatio={stretch ? 'none' : undefined}>
      {children}
    </svg>
  )
}

const HERB = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="6" fill="#8a5a35" />
      <rect x="1" y="1" width="46" height="46" rx="6" fill="none" stroke="#6e4526" strokeWidth="2" />
      <path d="M4 12h40M4 24h40M4 36h40" stroke="#6e4526" strokeWidth="1" opacity="0.6" />
      <rect x="7" y="7" width="34" height="34" rx="3" fill="#5b3a24" />
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="6" fill="#7a4f30" />
      <circle cx="24" cy="24" r="4" fill="#d9c08a" />
      <path d="M22.5 22.5l3 3" stroke="#7a4f30" strokeWidth="1.2" strokeLinecap="round" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <path d="M24 42V24" stroke="#4f9a3a" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 32c-8 1-12-4-12-9 7-1 12 2 12 9z" fill="#7cc95a" />
        <path d="M24 28c7 0 11-4 11-9-6-1-11 2-11 9z" fill="#7cc95a" />
        <g className="pp-mark-bloom" opacity="0">
          <circle cx="24" cy="14" r="4" fill="#f7a8c8" /><circle cx="17" cy="18" r="4" fill="#f7a8c8" />
          <circle cx="31" cy="18" r="4" fill="#f7a8c8" /><circle cx="19" cy="9" r="4" fill="#f7a8c8" />
          <circle cx="29" cy="9" r="4" fill="#f7a8c8" /><circle cx="24" cy="14" r="3.2" fill="#ffd34d" />
        </g>
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <path d="M12 18h20l-2 20H14z" fill="#5b85c4" />
      <ellipse cx="22" cy="18" rx="10" ry="2.5" fill="#46689d" />
      <path d="M32 22l10-8" stroke="#5b85c4" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 22c-5 0-5 10 0 10" fill="none" stroke="#5b85c4" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 11l4 3-3 4z" fill="#46689d" />
    </Art>
  )
}

const DRAGON = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="5" fill="#6d6457" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="5" fill="none" stroke="#4a4239" strokeWidth="3" />
      <g stroke="#c9b48a" strokeWidth="1" opacity="0.25" fill="none">
        <path d="M8 14c8-4 14 4 22 0s8-2 10 2" /><path d="M8 28c6 4 12-2 20 2s10 0 12-3" /><path d="M12 38c6-3 10 2 18-1" />
      </g>
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="4" fill="#b9ad96" />
      <path d="M10 6l6 10-4 8M34 42l-5-9 6-7M30 6l-3 8 7 4" fill="none" stroke="#8c8170" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <ellipse cx="24" cy="38" rx="14" ry="6" fill="#7a2e12" />
        <circle cx="16" cy="36" r="3.5" fill="#5a2009" /><circle cx="30" cy="37" r="4" fill="#5a2009" /><circle cx="23" cy="39" r="3" fill="#8f3a18" />
        <g className="pp-mark-flame" opacity="0.35">
          <path d="M24 8c2 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6 4-9 0 3 1 4 2 5 1-4 1-8 3-13z" fill="#ff8a2a" />
          <path d="M24 22c1 3 4 4 4 8a4 4 0 0 1-8 0c0-3 3-4 4-8z" fill="#ffd34d" />
        </g>
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <ellipse cx="24" cy="34" rx="18" ry="9" fill="#8a6a3e" />
      <ellipse cx="24" cy="32" rx="12" ry="5.5" fill="#5e4527" />
      <path d="M6 32c6-8 14-9 20-8M42 34c-5-8-10-10-16-8M10 40c8 4 20 4 28 0" fill="none" stroke="#a88650" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="30" rx="5" ry="3.5" fill="#fffaf3" />
      <path d="M21 29h6" stroke="#e3d6bf" strokeWidth="1" strokeLinecap="round" />
    </Art>
  )
}

const ROBOT = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="4" fill="#0e1a14" />
      <g fill="none" stroke="#c8a24a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10h14l4 4h12M4 24h10l4-4h8M44 36H30l-4 4H8M44 14h-4l-4 4" />
      </g>
      <g fill="#c8a24a"><circle cx="4" cy="10" r="2" /><circle cx="4" cy="24" r="2" /><circle cx="44" cy="36" r="2" /><circle cx="44" cy="14" r="2" /></g>
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="5" fill="#1b2a33" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="#2f4552" strokeWidth="3" />
      <circle cx="24" cy="24" r="3" fill="#2f4552" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <rect x="4" y="4" width="40" height="40" rx="6" fill="#1b2a33" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="#37e6ff" strokeWidth="3" />
        <circle cx="24" cy="24" r="9" fill="#0f1b22" />
        <circle className="pp-mark-led" cx="24" cy="24" r="4.5" fill="#9cff6a" opacity="0.4" />
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <rect x="6" y="30" width="36" height="12" rx="3" fill="#22303f" />
      <rect x="10" y="26" width="28" height="6" rx="2" fill="#2d3f52" />
      <path d="M26 6L16 24h7l-2 10 11-18h-7z" fill="#ffd34d" />
    </Art>
  )
}

const SKIN_ART = { [PIP_LINE.HERB]: HERB, [PIP_LINE.DRAGON]: DRAGON, [PIP_LINE.ROBOT]: ROBOT }

/** The art set for a Pip line; an unknown line draws the herb set. */
export const skinArt = (line) => SKIN_ART[line] ?? HERB

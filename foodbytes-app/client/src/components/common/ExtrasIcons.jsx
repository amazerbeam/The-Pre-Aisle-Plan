// MPP-10: icons for the homemade/store-bought extras UI (paths from the approved mockup).

const svgProps = {
  viewBox: '0 0 24 24',
  width: '14',
  height: '14',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false'
}

export const CartIcon = ({ className }) => (
  <svg className={className} {...svgProps}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
)

export const HomeIcon = ({ className }) => (
  <svg className={className} {...svgProps}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const InfoIcon = ({ className }) => (
  <svg className={className} {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

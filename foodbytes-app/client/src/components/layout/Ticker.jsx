import './Ticker.css'

// Verbatim from the approved mockup (app-mockup.html).
const TICKER_ITEMS = [
  'NIGHT KITCHEN OPEN 24/7',
  'SYNTH-RAMEN BACK ON THE BOARD',
  'PLAN YOUR WEEK, SKIP THE QUEUE',
  'HOMEMADE BEATS VAT-GROWN',
  'SECTOR 9 CURFEW 03:00',
  'TIP YOUR DELIVERY DRONE',
]

/** Decorative headline strip under the header. Rendered only for themes with `ticker: true` in the registry. */
function Ticker() {
  const line = TICKER_ITEMS.map((item) => `▶ ${item}`).join('  ')
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  )
}

export default Ticker

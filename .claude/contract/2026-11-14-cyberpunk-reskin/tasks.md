# Tasks: Cyberpunk pixel restaurant reskin (FOODBYTES // Night Kitchen)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase by phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: PLANNED
Started: 2026-11-14

**Goal:** Restyle the whole client to match the approved mockup: a cyberpunk pixel night-kitchen look with tokens, backdrop, neon brand, pixel icons, a teal menu board, an LED order board, a terminal recipe view and a receipt shopping list. Behaviour stays the same, every text pair passes AA, popups work on mobile, and there is a Low FX switch.

**Spec:** `plan.md` in this folder. Visual reference: `C:\Users\jossd\Downloads\cyberpunk-makeover-mockup.html`. Design rules: `.claude/contract/2026-11-14-cyberpunk-makeover/mockup-plan.md` §2–§3.

---

## Sweep rules (apply in every CSS task)

The phase 2–7 tasks restyle CSS files. These steps describe how to do that:

1. **Find the target look.** Open the mockup and find the selector that draws the same element. For example, the mockup's `.rcard` corresponds to `.recipe-card`, and its `.dlg` and `.bar-t` correspond to a modal and its header. Copy the look (border, background, font token, glow), translated to the app's class names. Never copy mockup class names into the app.
2. **Replace every literal colour with a token from `src/styles/tokens.css`.** Use this table:

| Old literal (typical) | Token |
|---|---|
| `#fff`, `white`, `#ffffff` (as a surface) | `var(--panel)`, or `var(--raised)` for popovers and inputs |
| `#f8f9fa`, `#f5f5f5`, `#fafafa` | `var(--void)` (page) or `var(--deep)` (inset wells) |
| `#fff`, `white` (as text on a brand fill) | `var(--void)`, because neon fills take dark text |
| `#2c3e50`, `#333`, `#222`, `#111` (as text) | `var(--ink)` |
| `#666`, `#6c757d`, `#888`, `#999` (as text) | `var(--muted)` |
| `#e9ecef`, `#ddd`, `#eee`, `#ccc` (borders) | `var(--line-soft)`, or `var(--line)` for a visible edge |
| `#4a3f80` and purples | `var(--pink)` for primary actions, `var(--cyan)` for selection and focus frames |
| greens | `var(--lime)` |
| reds | `var(--red)` |
| ambers and yellows | `var(--yellow)`, or `var(--orange)` for cheat and store-bought |
| `rgba(0,0,0,x)` shadows | keep them (black shadows are allowed) |

3. **Typography:** headings and section titles use `var(--f-display)`, badges, tags and tiny labels use `var(--f-label)`, numbers (kcal, macros, counts, dates) use `var(--f-num)`, and everything else inherits `var(--f-body)`.
4. **Stacking:** use `z-index` only from `var(--z-popover)`, `var(--z-nav)`, `var(--z-sheet)` and `var(--z-toast)`.
5. **Touch and focus:** keep or restore `min-height: 44px` and `min-width: 44px` on interactive elements. Wrap hover rules in `@media (hover: hover)`. Focus uses `:focus-visible { outline: var(--focus-ring); outline-offset: 2px }`.
6. **Don't touch JSX** unless the task's `**Files:**` block lists it.
7. **Verify the file** with the task's `Select-String` step. The pattern `#[0-9a-fA-F]{3,8}\b|\bwhite\b` must return zero hits in that file. Any intentional literal goes into `tokens.css` instead.

---

## File map

**Created:**
- `foodbytes-app/client/src/styles/tokens.css`: palette, fonts, glow, z-scale, focus, legacy remap and macro retune.
- `foodbytes-app/client/src/constants/display.js`: Low FX storage key and body class.
- `foodbytes-app/client/src/utils/lowFx.js`: `readLowFx` and `applyLowFx`.
- `foodbytes-app/client/src/hooks/useLowFx.js`: the toggle hook for the account-menu switch.
- `foodbytes-app/client/src/constants/pixelIcons.js`: icon grids and accents.
- `foodbytes-app/client/src/components/common/PixelIcon.jsx` and `PixelIcon.css`: the pixel icon renderer.
- `foodbytes-app/client/src/components/layout/Ticker.jsx` and `Ticker.css`: the decorative ticker.
- `foodbytes-app/client/src/components/layout/LowFxControl.jsx`: the account-menu switch.
- `foodbytes-app/client/scripts/check-contrast.mjs`: the token contrast check.

**Modified:**
- `foodbytes-app/client/index.html`: fonts, title, theme colour and Apple meta tags.
- `foodbytes-app/client/public/manifest.webmanifest`: name and colours.
- `foodbytes-app/client/public/favicon.svg`, `public/icons/brand-mark.svg`, `public/icons/brand-mark-maskable.svg`: the pixel logo.
- `foodbytes-app/client/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`: re-rendered from the new SVG.
- `foodbytes-app/client/package.json`: the `check:contrast` script and the version.
- `foodbytes-app/client/src/main.jsx`: imports `tokens.css` and applies Low FX at boot.
- `foodbytes-app/client/src/App.jsx`: rain div and ticker mount.
- `foodbytes-app/client/src/styles/global.css`: body, `.app` backdrop, scanlines, lowfx and reduced motion.
- `foodbytes-app/client/src/components/pet/PetView.css`: containment block only.
- `foodbytes-app/client/src/components/common/BrandMark.jsx`: the pixel logo.
- `foodbytes-app/client/src/components/layout/Header.jsx` and `Header.css`, `Footer.css`, `AppNavItems.jsx`.
- `foodbytes-app/client/src/components/common/ExtrasIcons.jsx`: `CartIcon` uses `PixelIcon`.
- About 45 component CSS files, swept area by area. Each task lists them.
- `foodbytes-app/foodbytes-api/pom.xml` and `CHANGELOG.md`: the version.

**Deleted:** (none)

---

## Phase 1 — Foundations

This phase adds the token sheet, fonts, backdrop, Low FX plumbing, Pip containment and the contrast check. The legacy remap flips most of the app dark immediately. Some literal-coloured spots will look wrong until their phase sweeps them, which is expected. The build stays green and no behaviour changes.

### Task 1: Create the token sheet

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/styles/tokens.css`
- Modify: `foodbytes-app/client/src/main.jsx:10`

- [ ] **Step 1: Write `tokens.css`** with exactly the values in plan.md → Data shapes → `tokens.css`:
  - palette, card panel stops, fonts, glow, z-scale and `--focus-ring`
  - the legacy remap
  - the macro retune
  - a `body.lowfx` block setting `--glow-pink`, `--glow-cyan`, `--glow-yellow`, `--box-pink` and `--box-cyan` to `none` and `--f-display: var(--f-body)`

  Take the glow and box shadow values from the mockup's `:root`. Add `color-scheme: dark;` on `:root`.

- [ ] **Step 2: Import it before global.css** in `main.jsx`:

```js
import './styles/tokens.css'
import './styles/global.css'
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 2: Remove the old token block from global.css and restyle the shell base

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/styles/global.css:1-104`

- [ ] **Step 1: Remove the duplicated tokens from `global.css`.** Delete these `:root` declarations, which `tokens.css` now owns:
  - brand, neutral, semantic and macro tokens
  - the `--pip-focus-ring`, `--pip-focus-ring-on-dark` and `--pip-focus-halo` values

  Move those three Pip values verbatim into `tokens.css`, because Pip needs them unchanged.

  Move the 15 `--aisle-*` colours into `tokens.css` too, retuned to neon-safe hues that each pass 3:1 as a swatch on `--paper` (Task 7 asserts this). Moving them keeps `global.css` free of literal colours, which Task 23 greps for.

Keep in `global.css`: spacing, radius, shadows (black rgba only), `--footer-clearance` and `--pip-sheet-*`. Update the header comment to `/* FOODBYTES // Night Kitchen — global styles. Colours live in tokens.css. */`.

- [ ] **Step 2: Restyle the base rules.**
  - `body`: `font-family: var(--f-body); color: var(--ink); background: var(--void);`
  - `.app`: add `position: relative; isolation: isolate;`
  - Add `.app::before` (skyline): `position: fixed; inset: auto 0 0 0; height: 46vh; z-index: -2; pointer-events: none; background: url("data:image/svg+xml,…") bottom/auto 100% repeat-x;`. Copy the skyline SVG from the mockup's `.app::before`, keeping its colours URL-encoded as `%23rrggbb`. The skyline is artwork, not UI colour, and the encoded form keeps it out of the literal-colour grep.
  - Add `.app::after` (scanlines): copy the mockup's repeating-linear-gradient, with `position: fixed; inset: 0; z-index: -1; pointer-events: none;`.
  - Add `.city-rain`: copy the mockup's `.rain` rule, with `position: fixed; inset: 0; z-index: -1; pointer-events: none;`.
  - Add `:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }`.
  - Add `::placeholder { color: var(--muted); opacity: 1 }`.
  - Add `input, select, textarea { background: var(--raised); color: var(--ink); caret-color: var(--yellow); }` and an autofill override using `-webkit-text-fill-color: var(--ink)` and `box-shadow: 0 0 0 100px var(--raised) inset`.
  - Add `body.lowfx .app::before, body.lowfx .app::after, body.lowfx .city-rain { display: none }` and `body.lowfx * { animation: none !important }`.
  - Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } }`.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 3: Load the fonts and set the page meta tags

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/index.html`

- [ ] **Step 1: Replace the Inter `<link>`** with:

```html
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@400..700&family=VT323&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update the meta tags.** Set `theme-color` to `#05070b`, `apple-mobile-web-app-status-bar-style` to `black-translucent`, `apple-mobile-web-app-title` to `FOODBYTES`, `description` to `FOODBYTES Night Kitchen - recipes and meal planning`, and `<title>` to `FOODBYTES · Night Kitchen`.

- [ ] **Step 3: Confirm Inter is gone**

Run: `Select-String -Path foodbytes-app\client\index.html,foodbytes-app\client\src\styles\*.css -Pattern "Inter"`
Expected: zero hits.

### Task 4: Add the Low FX constants and helpers

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/constants/display.js`
- Create: `foodbytes-app/client/src/utils/lowFx.js`
- Create: `foodbytes-app/client/src/hooks/useLowFx.js`
- Modify: `foodbytes-app/client/src/main.jsx`

- [ ] **Step 1: Write the constants**

```js
export const LOW_FX_STORAGE_KEY = 'fb.display.lowFx'
export const LOW_FX_BODY_CLASS = 'lowfx'
```

- [ ] **Step 2: Write `utils/lowFx.js`**

```js
import { LOW_FX_STORAGE_KEY, LOW_FX_BODY_CLASS } from '../constants/display'

export function readLowFx() {
  try { return localStorage.getItem(LOW_FX_STORAGE_KEY) === '1' } catch { return false }
}

export function applyLowFx(on) {
  document.body.classList.toggle(LOW_FX_BODY_CLASS, on)
  try { localStorage.setItem(LOW_FX_STORAGE_KEY, on ? '1' : '0') } catch { /* storage blocked: class still applies for this session */ }
}
```

- [ ] **Step 3: Write `hooks/useLowFx.js`**

```js
import { useState } from 'react'
import { LOW_FX_BODY_CLASS } from '../constants/display'
import { applyLowFx } from '../utils/lowFx'

// No cleanup by design: the switch unmounts with the account menu, but the preference persists.
export function useLowFx() {
  const [lowFx, setLowFx] = useState(() => document.body.classList.contains(LOW_FX_BODY_CLASS))
  const toggleLowFx = () => { const next = !lowFx; applyLowFx(next); setLowFx(next) }
  return { lowFx, toggleLowFx }
}
```

- [ ] **Step 4: Apply the stored preference at boot.** In `main.jsx`, after the imports and before `ReactDOM.createRoot`:

```js
import { applyLowFx, readLowFx } from './utils/lowFx'
applyLowFx(readLowFx())
```

- [ ] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 5: Mount the rain layer

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/App.jsx:50-51`

- [ ] **Step 1: Add the rain div** as the first child of `<div className="app">`:

```jsx
<div className="city-rain" aria-hidden="true" />
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 6: Keep Pip's room on the old palette

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.css` (prepend only)

- [ ] **Step 1: Prepend the containment block.** It restores today's legacy token values and the Inter-free body font for the room:

```css
/* Cyberpunk reskin: Pip's room is out of scope (decision 4) and keeps its original palette. */
.pet-view {
  --brand-primary: #4a3f80; --brand-primary-dark: #3a3266; --brand-primary-light: #6b5fa0;
  --text-primary: #2c3e50; --text-secondary: #6c757d;
  --bg-primary: #ffffff; --bg-secondary: #f8f9fa; --border-color: #e9ecef;
  --success: #28a745; --warning: #ffc107; --error: #dc3545;
  color: var(--text-primary);
  font-family: var(--f-body);
}
```

- [ ] **Step 2: Confirm the room has no portals that escape the containment**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\*.jsx,foodbytes-app\client\src\components\pet\*\*.jsx -Pattern "createPortal"`
Expected: zero hits. If there are any, add each portal root class to the `.pet-view` selector list.

### Task 7: Add the contrast regression check

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/scripts/check-contrast.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [ ] **Step 1: Write the script.**
  - Read `src/styles/tokens.css` with `fs`. It holds every colour, including the aisle colours.
  - Collect `--name: #hex` declarations into a map with a regex (`/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\b/g`). Use the first occurrence, which is the `:root` value.
  - Compute WCAG contrast (sRGB → linear, `L = .2126R + .7152G + .0722B`, ratio `(L1+.05)/(L2+.05)`).
  - Check `PAIRS`:
    - text 4.5 on `panel`: `ink`, `muted`, `pink`, `cyan`, `yellow`, `lime`, `red`
    - text 4.5 on `raised`: `ink`, `muted`, `pink`, `cyan`, `yellow`, `lime`, `red`
    - text 4.5 on `card-teal-top` and `card-teal-bottom`: `ink`, `muted`, `pink`, `yellow`
    - text 4.5 on `card-plan-top` and `card-plan-bottom`: `ink`, `muted`, `yellow`
    - text 4.5 on `pink`, `cyan`, `yellow`, `lime`, `orange` and `red`: `void`
    - text 4.5 on `paper`: `paper-ink`
    - UI 3.0 on `panel`: `line`
    - UI 3.0 on `paper`: every `aisle-*` token
  - Print each failure as `FAIL <fg> on <bg>: <ratio> < <min>`, and exit 1 if any fail. Otherwise print `Contrast OK: <n> pairs`.
  - An unknown token name is a failure (`MISSING <name>`), so a renamed token can't silently pass.

- [ ] **Step 2: Add the npm script** `"check:contrast": "node scripts/check-contrast.mjs"`.

- [ ] **Step 3: Run it**

Run: `cd foodbytes-app\client; npm run check:contrast`
Expected: `Contrast OK: <n> pairs`. On a failure, retune the token in `tokens.css`, never the threshold.

---

## Phase 2 — Brand and shell

This phase covers the pixel logo, icons, header sign, ticker, footer console nav, account menu with the Low FX switch, toasts and sign-in. When it's done, the app frame looks like the mockup on every route, even while page bodies are still being swept.

### Task 8: Pixel BrandMark and public brand assets

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/common/BrandMark.jsx`
- Modify: `foodbytes-app/client/public/favicon.svg`, `public/icons/brand-mark.svg`, `public/icons/brand-mark-maskable.svg`
- Modify: `foodbytes-app/client/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`
- Modify: `foodbytes-app/client/public/manifest.webmanifest`

- [ ] **Step 1: Rewrite `BrandMark`.** Keep the props (`size`, `title`, `className`) and the a11y behaviour. The body becomes `<svg viewBox="0 0 16 16" shapeRendering="crispEdges">` with a `#05070b` background rect plus the pixel rects from the mockup's `LOGO`: cyan steam, yellow chopsticks and a pink bowl with highlight `#ff8fb3` and shadow `#a3123f`. Put the rect list in a module-level `LOGO_PIXELS` array of `[color, x, y, w]`. Update the doc comment: the FOODBYTES night-kitchen logo, chosen 2026-11-14, with the same rects in `public/favicon.svg` and `public/icons/brand-mark*.svg`.

- [ ] **Step 2: Write the same SVG** to `favicon.svg` and `brand-mark.svg`. Write `brand-mark-maskable.svg` with a 20% safe-zone padding: `viewBox="-3.2 -3.2 22.4 22.4"` with a full-bleed `#05070b` background rect.

- [ ] **Step 3: Render the PNGs with headless Chrome.**

Run: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=512,512 --screenshot="<abs>\icon-512.png" "file:///<abs>/brand-mark.svg"`. Repeat for 192 and for the 180 Apple touch icon, and use `brand-mark-maskable.svg` for the maskable 512.
Expected: each command prints `bytes written to file`.

- [ ] **Step 4: Update the manifest.** Set `name` and `short_name` to `"FOODBYTES"`, and `background_color` and `theme_color` to `"#05070b"`. Leave the icon entries unchanged.

- [ ] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 9: PixelIcon component and icon data

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/constants/pixelIcons.js`
- Create: `foodbytes-app/client/src/components/common/PixelIcon.jsx`
- Create: `foodbytes-app/client/src/components/common/PixelIcon.css`

- [ ] **Step 1: Write `PIXEL_ICONS`.** Copy the `menu`, `cal` and `cart` grids verbatim from the mockup's `ICO` block as `{ rows: [...], accents: { a: 'var(--pink)', b: 'var(--yellow)' } }`. The cart's accents are `a: 'var(--cyan)', b: 'var(--pink)'`.

- [ ] **Step 2: Write `PixelIcon`.** Follow the file order: imports, then a constant `toRuns(rows)` that returns `[{x, y, w, c}]` (run-length per row, skipping `.`, same algorithm as the mockup's `pxi()`), then the component, then the export.

```jsx
function PixelIcon({ name, size = 20, className }) {
  const icon = PIXEL_ICONS[name]
  if (!icon) return null
  const w = Math.max(...icon.rows.map(r => r.length)), h = icon.rows.length
  return (
    <svg className={`pixel-icon ${className ?? ''}`} viewBox={`-0.5 -0.5 ${w + 1} ${h + 1}`}
         width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {toRuns(icon.rows).map(({ x, y, w: rw, c }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={rw} height={1}
              {...(c === '#' ? { fill: 'currentColor' } : { style: { fill: icon.accents[c] } })} />
      ))}
    </svg>
  )
}
```

Compute `toRuns` once per icon at module load (`const RUNS = Object.fromEntries(...)`) instead of on every render.

- [ ] **Step 3: Write the CSS**

```css
.pixel-icon { display: inline-block; flex: none; overflow: visible; }
.active > .pixel-icon, [aria-current="page"] > .pixel-icon { filter: drop-shadow(0 0 3px currentColor); }
body.lowfx .pixel-icon { filter: none; }
```

Import `./PixelIcon.css` in `PixelIcon.jsx`.

- [ ] **Step 4: Smoke-check the run-length logic**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {PIXEL_ICONS} from './src/constants/pixelIcons.js'; for (const [k,v] of Object.entries(PIXEL_ICONS)) console.log(k, v.rows.length, Math.max(...v.rows.map(r=>r.length)))"`
Expected: `menu 13 15`, `cal 15 15`, `cart 13 15`.

### Task 10: Use pixel icons in the nav and in CartIcon

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/AppNavItems.jsx:8-33`
- Modify: `foodbytes-app/client/src/components/common/ExtrasIcons.jsx` (`CartIcon` only)

- [ ] **Step 1: Swap the nav icons.** Replace `ICON_PROPS` and `NAV_ICONS` with:

```jsx
const NAV_ICON_NAMES = { recipes: 'menu', mealplan: 'cal', shopping: 'cart' }
```

Render `<PixelIcon name={NAV_ICON_NAMES[item.key]} size={24} />` in place of `{NAV_ICONS[item.key]}`. The Pip item is unchanged (it keeps `PipHerb`).

- [ ] **Step 2: Make `CartIcon` delegate to the pixel cart**

```jsx
export const CartIcon = ({ className }) => <PixelIcon name="cart" size={14} className={className} />
```

Leave the other exports in `ExtrasIcons.jsx` unchanged.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 11: Neon sign header and Low FX switch

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/LowFxControl.jsx`
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx:30-33,66-68`
- Modify: `foodbytes-app/client/src/components/layout/Header.css`
- Modify: `foodbytes-app/client/src/components/layout/DefaultPortionsControl.css`, `MealTimesControl.css`, `VersionInfo.css`

- [ ] **Step 1: Write `LowFxControl`**

```jsx
import { useLowFx } from '../../hooks/useLowFx'

function LowFxControl() {
  const { lowFx, toggleLowFx } = useLowFx()
  return (
    <div className="lowfx-row">
      <span id="lowfx-label">Low FX: no glow, rain or flicker</span>
      <button type="button" className="lowfx-switch" role="switch" aria-checked={lowFx}
              aria-labelledby="lowfx-label" onClick={toggleLowFx} />
    </div>
  )
}

export default LowFxControl
```

- [ ] **Step 2: Update the Header markup.**
  - The brand button's `aria-label` becomes `"FOODBYTES, go to Recipes"` and its `title` becomes `"Go to the menu"`.
  - The wordmark becomes:

```jsx
<span className="brand-sign" aria-hidden="true">
  <span className="brand-word">FOOD<span className="brand-flicker">B</span>YTES</span>
  <span className="brand-sub">NIGHT KITCHEN · SECTOR 9</span>
</span>
```

  - Add `<section className="user-section" aria-label="Display"><LowFxControl /></section>` after the Meal times section.

- [ ] **Step 3: Restyle `Header.css` and the three menu-control CSS files** per the sweep rules, translating these mockup selectors:

| Mockup | App |
|---|---|
| `.hdr` | `.header` |
| `.brand`, `.sign`, `.w`, `.fl`, `.sub` | `.brand-btn`, `.brand-sign`, `.brand-word`, `.brand-flicker`, `.brand-sub` |
| `.hnav` buttons | `.header-nav` and `.header-btn` |
| `.wk` | `.header-week` |
| `.amenu` | the user dropdown |
| `.switch` | `.lowfx-switch` (44×24 min hit area, `[aria-checked="true"]` lit lime) |

  Remove the flicker animation under `body.lowfx`. Keep every existing breakpoint.

- [ ] **Step 4: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\layout\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits, apart from `Ticker.css`, which doesn't exist yet.

- [ ] **Step 5: Measure Header.jsx**

Run: `(Get-Content foodbytes-app\client\src\components\layout\Header.jsx | Measure-Object -Line).Lines`
Expected: below 200.

### Task 12: Ticker strip

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/Ticker.jsx`
- Create: `foodbytes-app/client/src/components/layout/Ticker.css`
- Modify: `foodbytes-app/client/src/App.jsx:51`

- [ ] **Step 1: Write the component.** Put `TICKER_ITEMS` at module top, copied verbatim from the mockup: `'NIGHT KITCHEN OPEN 24/7'`, `'SYNTH-RAMEN BACK ON THE BOARD'`, `'PLAN YOUR WEEK, SKIP THE QUEUE'`, `'HOMEMADE BEATS VAT-GROWN'`, `'SECTOR 9 CURFEW 03:00'`, `'TIP YOUR DELIVERY DRONE'`. Render `<div className="ticker" aria-hidden="true"><div className="ticker-track">` containing two identical `<span>`s, each joining the items with a leading `▶ `.

- [ ] **Step 2: Write the CSS** from the mockup's `.ticker` and `.track` rules: a yellow background, `var(--void)` text, `var(--f-num)`, and a translateX(-50%) loop. Under `body.lowfx` and reduced motion it stops (the global rules already cover this) and the overflow stays clipped.

- [ ] **Step 3: Mount it in `App.jsx`:** `{!pipMode && <><Header /><Ticker /></>}`.

- [ ] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 13: Footer console nav, toasts and sign-in

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Footer.css`
- Modify: `foodbytes-app/client/src/components/common/Toast.css`, `UndoToast.css`
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.css`
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.jsx` (heading copy only)

- [ ] **Step 1: Restyle `Footer.css`** from the mockup's `.bnav`: a black bar with a 2px pink top border and glow, labels in `var(--f-label)` uppercase, and the active tab yellow with an inset top bar. Use `z-index: var(--z-nav)`. Keep the targets at least 48px tall and keep the safe-area padding.

- [ ] **Step 2: Restyle the toasts** as a terminal line: `var(--raised)` with a cyan left border, `var(--f-num)` text and `z-index: var(--z-toast)`. The Undo button is yellow with `var(--void)` text.

- [ ] **Step 3: Restyle the login modal** as the `DOOR://SIGN IN` terminal from the mockup. Change the heading text in `LoginModal.jsx` from the old app name to `FOODBYTES`, and the subtitle to `Night Kitchen · Sector 9. Sign in to plan your week and build your supply run.`. The Google button keeps its label and handler.

- [ ] **Step 4: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\layout\Footer.css,foodbytes-app\client\src\components\common\Toast.css,foodbytes-app\client\src\components\common\UndoToast.css,foodbytes-app\client\src\components\auth\LoginModal.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

---

## Phase 3 — Recipes: the menu board

When this phase is done, the Recipes route matches the mockup's menu board, including the teal panels and the pink in-plan panels. Only CSS changes (the numbering is a CSS counter), so behaviour can't regress.

### Task 14: Teal recipe cards

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.css`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeList.css`

- [ ] **Step 1: Restyle `.recipe-card`** from the mockup's `.rcard` and the `v-cards` override block:
  - `background: linear-gradient(180deg, var(--card-teal-top), var(--card-teal-bottom)); border: 1px solid rgba(5,217,232,.5); border-top: 3px solid var(--cyan);` plus the box-shadow set
  - HUD corner brackets via `::before`, from the mockup's `.hud::before`
  - `.recipe-card.is-in-plan` uses the plan stops with pink borders and `var(--box-pink)`
  - `.recipe-card.is-hidden` uses `var(--deep)`
  - `body.lowfx .recipe-card { box-shadow: 0 0 0 1px #000 }`. Move the `#000` into `tokens.css` as `--black: #000` and use the token.

- [ ] **Step 2: Number the cards with a CSS counter.** Add `.recipe-grid { counter-reset: menu-item }` to `RecipeList.css`. In `RecipeCard.css`, add `.recipe-card-top::before { counter-increment: menu-item; content: counter(menu-item, decimal-leading-zero); font-family: var(--f-num); color: var(--pink); }`.

- [ ] **Step 3: Restyle the inner parts** per the sweep rules:
  - `.recipe-card-name` uses `var(--f-body)` 600 in `var(--ink)`.
  - The kcal figure is a yellow VT323 "price".
  - The variant segment comes from the mockup's `.vseg`: the active option is cyan with `var(--void)` text.
  - The dotted rule under `.recipe-card-top` is cyan at 45% opacity.

- [ ] **Step 4: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeCard.css,foodbytes-app\client\src\components\recipes\RecipeList.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

### Task 15: Recipe toolbar, day buttons, macro chips and popups

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeToolbar.css`, `DayAssignmentButtons.css`, `MacroTargetPopup.css`, `ExtrasSelectionPopup.css`
- Modify: `foodbytes-app/client/src/components/common/MacroChips.css`

- [ ] **Step 1: Sweep the five files.** Translate these mockup selectors:

| Mockup | App |
|---|---|
| `.rtool`, `.mtabs` | toolbar meal tabs (active tab pink with `var(--void)` text), search box, Hidden filter |
| `.strip`, `.days` | day assignment buttons (hazard stripes for unplanned, lime check for planned) |
| `.chip` | macro chips (bordered, `var(--f-num)`, colour from the macro tokens) |
| `.pop` | both popups (`z-index: var(--z-popover)`, cyan frame) |

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeToolbar.css,foodbytes-app\client\src\components\recipes\DayAssignmentButtons.css,foodbytes-app\client\src\components\recipes\MacroTargetPopup.css,foodbytes-app\client\src\components\recipes\ExtrasSelectionPopup.css,foodbytes-app\client\src\components\common\MacroChips.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 4 — Meal Plan: the order board

When this phase is done, both meal-plan layouts and their sheets and modals match the mockup's LED order board. Only CSS changes.

### Task 16: Desktop timetable, mobile day view and meal cards

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanWeekDesktop.css`, `MealPlanWeekMobile.css`, `MealCard.css`, `WeekSummary.css`, `MealPlanCalendar.css`

- [ ] **Step 1: Sweep the five files.** Translate these mockup selectors:
  - Day headers: yellow `var(--f-num)` LED text, with today framed in cyan and glowing.
  - Meal cards come from `.mcard`: `var(--panel)` with a 4px cyan left edge, `var(--f-num)` kcal, and an eaten tick in lime with the ✓ shape kept.
  - Mobile day chips are pink when active.
  - Swipe action panels come from `.sw-act`: cyan Replace, yellow Move and red Remove, each with `var(--void)` text.
  - The swipe hint is a yellow hazard style.
  - The week summary tile is `.hud`.

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\mealplan\MealPlanWeekDesktop.css,foodbytes-app\client\src\components\mealplan\MealPlanWeekMobile.css,foodbytes-app\client\src\components\mealplan\MealCard.css,foodbytes-app\client\src\components\mealplan\WeekSummary.css,foodbytes-app\client\src\components\mealplan\MealPlanCalendar.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

### Task 17: Meal-plan menus, sheets and modals

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanSheet.css`, `MealPlanMenu.css`, `MealEntryMenu.css`, `DailyMacroPopup.css`, `WeeklyMacroPopup.css`, `SwapDaysModal.css`, `CopyWeekModal.css`, `TemplateModals.css`, `ManageExtrasModal.css`

- [ ] **Step 1: Sweep the nine files** as terminal windows, translating the mockup's `.dlg`:
  - A 2px cyan frame and a `.bar-t`-style header strip in `var(--f-label)`.
  - Menus use `.pop`.
  - Sheets get `max-height: calc(100dvh - 24px); overflow: auto; overscroll-behavior: contain; padding-bottom: env(safe-area-inset-bottom)` on mobile, with `z-index: var(--z-sheet)` and the scrim at `rgba(2,3,5,.75)`.
  - The macro pill text uses the retuned `-pill-text` tokens.

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\mealplan\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 5 — Recipe view: the kitchen terminal

When this phase is done, the recipe modal, the full-screen ingredients view and cook mode match the mockup's KDS terminal. Only CSS changes, so `RecipeViewModal.jsx` (393 lines) isn't touched.

### Task 18: Recipe view, full-screen ingredients view and cook mode

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.css`, `IngredientsFullscreen.css`, `CookMode.css`, `MealEatenSection.css`, `LinkedRecipeNavigation.css`

- [ ] **Step 1: Sweep the five files.** Translate these mockup selectors:

| Mockup | App |
|---|---|
| `.dlg.rv`, `.rv-hd`, `.rv-ctl`, `.rv-tabs`, `.ilist`, `.steps`, `.cookbtn`, `.eatbtn` | modal frame, header gradient, variant segment and servings stepper, tabs (active tab cyan underline), ingredient rows with square tick boxes (ticked rows lime, struck through, still ≥4.5:1), numbered steps in `var(--f-num)`, cook button pink, eaten button lime |
| `.ifull` | full-screen ingredients view (progress bar lime, "All out" in lime) |
| `.cook` | cook mode: full-screen terminal, step text in `var(--f-body)` at least 22px, yellow Next button with `var(--void)` text |

  Keep the `.recipe-view-modal` selector prefixes that already raise specificity.

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeViewModal.css,foodbytes-app\client\src\components\recipes\IngredientsFullscreen.css,foodbytes-app\client\src\components\recipes\CookMode.css,foodbytes-app\client\src\components\recipes\MealEatenSection.css,foodbytes-app\client\src\components\recipes\LinkedRecipeNavigation.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 6 — Shopping: the supply run receipt

When this phase is done, the shopping list is a paper receipt on the dark city. It's the only light surface, so it sets its own ink. Only CSS changes.

### Task 19: Receipt list and shopping popups

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/ShoppingList.css`, `IngredientBreakdownPopup.css`, `GenerateShoppingListModal.css`

- [ ] **Step 1: Sweep the receipt.**
  - Aisle groups use `background: var(--paper); color: var(--paper-ink);` with the mockup's zigzag `mask` edges.
  - Every descendant text colour inside the receipt is set explicitly to `var(--paper-ink)` or a darker tone, never inherited from the dark theme.
  - Ticked rows are struck through and must stay at least 4.5:1 (use `--paper-ink` at reduced weight, not opacity below 0.75).
  - The aisle swatch uses `var(--aisle-*)`.
  - The progress tile and stale banner come from the mockup's `.prog` and hazard `.stale` styles.

- [ ] **Step 2: Sweep the two popups** as terminal windows (same treatment as Task 17).

- [ ] **Step 3: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\shopping\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

---

## Phase 7 — Common dialogs, landing and admin

This phase sweeps the remaining shared surfaces and the rarely seen screens to tokens. When it's done, every in-scope CSS file is free of literal colours.

### Task 20: Shared dialogs and controls

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/common/ConfirmDialog.css`, `DateRangePicker.css`, `PullToDismissUI.css`, `LockEmojiAnimation.css`

- [ ] **Step 1: Sweep the four files.**
  - The confirm dialog is a `SYS://CONFIRM` terminal, and its destructive button is red with `var(--void)` text.
  - The date picker trigger is a cyan HUD frame with yellow `var(--f-num)` dates. Its calendar popover is `var(--raised)` with `z-index: var(--z-popover)`, and native date inputs inherit `color-scheme: dark`.

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\common\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

### Task 21: Landing animation and admin forms (tokens only)

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/onboarding/LandingPageAnimation.css`
- Modify: `foodbytes-app/client/src/components/admin/RecipeEditModal.css`, `RecipeIngredientsForm.css`, `RecipeStepsForm.css`, `RecipeInfoForm.css`

- [ ] **Step 1: Replace every literal colour** with a token using the sweep table. Don't redesign the layout. The landing page's brand references take the pink and cyan neon, and its headline uses `var(--f-display)`.

- [ ] **Step 2: Verify there are no literal colours left**

Run: `Select-String -Path foodbytes-app\client\src\components\onboarding\*.css,foodbytes-app\client\src\components\admin\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 8 — Final verification

No production changes beyond the version bump. This phase only sanity-checks the cumulative work.

### Task 22: Bump version and CHANGELOG

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [ ] **Step 1: Bump both manifests.** Read the current version from `foodbytes-app/client/package.json`. This is non-ticket feature work, so bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [ ] **Step 2: Prepend the CHANGELOG line** directly above the current top entry: `<new version> — 2026-11-14-cyberpunk-reskin: FOODBYTES Night Kitchen reskin — neon pixel theme, city backdrop, pixel icons, Low FX switch`

- [ ] **Step 3: Verify the versions agree**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 23: Grep for leftover literals and old brand references

- Skill: none — verification only

- [ ] **Step 1: Check for literal colours outside the token sheet and Pip**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.css | Where-Object { $_.FullName -notmatch '\\components\\pet\\' -and $_.Name -ne 'tokens.css' } | Select-String -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b"`
Expected: zero hits.

- [ ] **Step 2: Check for leftover old brand strings in the shell**

Run: `Select-String -Path foodbytes-app\client\index.html,foodbytes-app\client\public\manifest.webmanifest,foodbytes-app\client\src\components\layout\*.jsx,foodbytes-app\client\src\components\auth\*.jsx,foodbytes-app\client\src\components\common\BrandMark.jsx -Pattern "Pantry Plan|4a3f80"`
Expected: zero hits.

- [ ] **Step 3: Check that no console logging was added**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: no higher than the 6 baseline.

### Task 24: Contrast check, backend suite and production build

- Skill: none — verification only

- [ ] **Step 1: Contrast check**

Run: `cd foodbytes-app\client; npm run check:contrast`
Expected: `Contrast OK: <n> pairs`

- [ ] **Step 2: Full backend suite.** There are no backend changes, so this guards the version bump only.

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

- [ ] **Step 3: Client build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 25: Manual visual checklist and PR description

- Skill: none — the developer verifies; the implementer writes the checklist

**Files:**
- Create: `.claude/contract/2026-11-14-cyberpunk-reskin/pr-description.md`

- [ ] **Step 1: Write `pr-description.md`** with:
  - A link to `plan.md`, a summary, the new version, and "no migrations, no backend changes".
  - The suggested commit subject `cyberpunk-reskin: FOODBYTES Night Kitchen theme`.
  - A note for future contributors: colours live only in `src/styles/tokens.css`, `npm run check:contrast` guards the pairs, and Pip's room is contained by `.pet-view`.
  - This **MANUAL VERIFICATION** checklist for the developer, run with `npm run dev` at 320, 390, 768 and 1280px:
    1. `/`: teal cards, pink in-plan cards, numbering 01…, yellow kcal, no unreadable text.
    2. Open a recipe: the terminal modal opens on mobile as a sheet. Check the tabs, ticks, servings, ⤢ Expand (full-screen view) and cook mode.
    3. `/mealplan`: on desktop, the LED headers and the ⋯ menus open above the cards. On mobile, check the day chips, swipe Replace / Move / Remove panels and every sheet. Each sheet must scroll internally and must not sit behind the keyboard.
    4. `/shopping`: on the receipt, ticked items stay readable. Check the breakdown popup and Generate.
    5. `/pet`: the room looks exactly as it did before the reskin.
    6. Account menu: turn on Low FX. Glow, rain, scanlines, flicker and the ticker scroll stop. Reload and confirm it persists.
    7. OS reduced-motion setting on: no animations.
    8. Tab through the header, a card and a dialog: the yellow focus ring is visible everywhere.
    9. Sign out and back in: the login modal is the `DOOR://SIGN IN` terminal and Google sign-in still works.
    10. Install prompt / home screen: the pixel bowl icon appears and the status bar is dark.

---

## Self-review

**Spec coverage:**
- Token sheet, fonts, z-scale, focus, legacy remap — Tasks 1, 2, 3.
- Backdrop (skyline, scanlines, rain) — Tasks 2, 5.
- Brand (logo, favicon, PWA icons, manifest, meta, title) — Tasks 3, 8, 13.
- Pixel icons for nav and CartIcon — Tasks 9, 10.
- Ticker — Task 12.
- Low FX switch — Tasks 1, 2, 4, 11.
- Header, footer, toasts, sign-in — Tasks 11, 13.
- Recipes menu board, including teal cards — Tasks 14, 15.
- Meal plan order board, desktop and mobile — Tasks 16, 17.
- Recipe view, full-screen ingredients view and cook mode — Task 18.
- Shopping receipt — Task 19.
- Dialogs, landing and admin — Tasks 20, 21.
- Pip containment — Task 6.
- Contrast regression check — Tasks 7, 24.
- MINOR bump — Task 22.

**Placeholder scan:** no `TBD`, `TODO` or "similar to Task N" references. Each sweep step names its files, its mockup source selectors and a zero-hit grep.

**Type / name consistency:** these identifiers are used identically wherever they appear:
- `LOW_FX_STORAGE_KEY`, `LOW_FX_BODY_CLASS`, `readLowFx`, `applyLowFx`, `useLowFx`, `toggleLowFx`, `LowFxControl`
- `PIXEL_ICONS`, `PixelIcon`, `NAV_ICON_NAMES`, `TICKER_ITEMS`
- the CSS classes `.city-rain`, `.ticker`, `.ticker-track`, `.pixel-icon`, `.lowfx-switch`, `.brand-sign`, `.brand-word`, `.brand-flicker`, `.brand-sub`
- the tokens `--card-teal-top`, `--card-teal-bottom`, `--card-plan-top`, `--card-plan-bottom`, `--paper`, `--paper-ink`, `--z-*`, `--focus-ring`, `--black`

**Phase boundary cleanliness:**
- Phase 1 ends with a green build. It changes tokens and shell only, and literal-coloured spots are expected to look wrong until swept.
- Phase 2 ends green with a complete frame and no half-wired components (Ticker and LowFxControl are mounted in the same tasks that create them).
- Phases 3 to 7 are CSS-only per area, and each ends green with zero literals in its files.
- Phase 8 makes no production changes beyond the bump.

# Tasks: Parchment theme ("The Kitchen Grimoire")

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-15

**Goal:** Add Parchment, an old handwritten kitchen book look, as a third selectable theme beside Default and Cyberpunk, exactly as approved in `foodbytes-app/mockup/parchment-theme.html`, without changing Default or Cyberpunk.

**Spec:** `plan.md` in this folder. Visual reference: `foodbytes-app/mockup/parchment-theme.html` (open it in a browser and copy colours, gradients, fonts and effects from its `<style>` block).

All commands run in PowerShell from the repo root unless a `cd` is shown.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/themeCopy.js`: `navLabel` / `pageCopy` helpers for themed copy
- `foodbytes-app/client/src/constants/engravedIcons.js`: `ENGRAVED_ICONS` path map
- `foodbytes-app/client/src/components/common/EngravedIcon.jsx`: stroked engraved icon
- `foodbytes-app/client/src/components/common/EngravedBrandMark.jsx`: quill crest brand mark
- `foodbytes-app/client/src/styles/themes/parchment.css`: Parchment token values
- `foodbytes-app/client/src/styles/themes/parchment/index.css`: override bundle entry
- `foodbytes-app/client/src/styles/themes/parchment/shell.css`: page, header, footer, user menu, toasts, login, candlelight
- `foodbytes-app/client/src/styles/themes/parchment/recipes.css`: recipe cards, toolbar, chips, popups
- `foodbytes-app/client/src/styles/themes/parchment/mealplan.css`: ledger timetable, mobile day view, sheets, modals
- `foodbytes-app/client/src/styles/themes/parchment/recipe-view.css`: book view, full-screen ingredients, cook mode
- `foodbytes-app/client/src/styles/themes/parchment/shopping.css`: scroll, aisles, items, popups
- `foodbytes-app/client/src/styles/themes/parchment/dialogs.css`: confirm dialogs and shared modals

**Modified:**
- `foodbytes-app/client/src/constants/themes.js`: Parchment entry; `ambient` on every entry; `copy` on Parchment
- `foodbytes-app/client/src/App.jsx:54`: ambient layer from `theme.ambient`
- `foodbytes-app/client/src/main.jsx:5-7` and the theme CSS imports (~line 16-19): import `parchment.css` and `parchment/index.css`
- `foodbytes-app/client/index.html:9`: boot script ids and colour map
- `foodbytes-app/client/scripts/check-themes.mjs`: `PAIRS.parchment`; boot colour parsing
- `foodbytes-app/client/src/styles/themes/previews.css`: `.theme-preview--parchment`
- `foodbytes-app/client/src/components/layout/HeaderBrand.jsx:8`: `MARKS.engraved`
- `foodbytes-app/client/src/components/layout/AppNavItems.jsx:12-13,78-82`: icon map by `iconSet`; `navLabel`
- `foodbytes-app/client/src/components/common/ExtrasIcons.jsx:20-21`: engraved cart
- `foodbytes-app/client/src/components/recipes/RecipeList.jsx:77-78` + `RecipeList.css`: optional themed page heading
- `foodbytes-app/client/src/components/mealplan/MealPlanWeekDesktop.jsx:29` + `.css`: themed heading
- `foodbytes-app/client/src/components/mealplan/MealPlanWeekMobile.jsx:64` + `.css`: themed heading
- `foodbytes-app/client/src/components/shopping/ShoppingList.jsx:92`, `ShoppingListHeader.jsx:62` + `ShoppingList.css`: themed heading
- `CLAUDE.md`: Themes section
- `foodbytes-app/mockup/README.md`, `foodbytes-app/mockup/user-menu-themes.html`, `foodbytes-app/mockup/app-mockup.html`: Parchment reference + picker tile
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version

**Deleted:** (none)

---

## Phase 1 — Theme plumbing

This phase registers Parchment and wires its token file, preview tile, boot script, check script and the `ambient` / `copy` registry fields. There are no override looks yet. At the end you can pick Parchment and get a coherent parchment palette on the existing layouts. Default and Cyberpunk are unchanged, the build is green and `check:themes` passes, so it is a safe stopping point.

### Task 1: Registry entry, `ambient` field and `copy` field ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/themes.js`

- [x] **Step 1: Add `ambient` to the two existing entries and append the Parchment entry**

1. In the Default entry, add `ambient: null,` after `ticker: false,`.
2. In the Cyberpunk entry, add `ambient: 'city-rain',` after `ticker: true,`.
3. Append this third entry to `THEMES`:

```js
  { id: 'parchment', label: 'Parchment', themeColor: '#3b2415',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400..700;1,400..600&family=Homemade+Apple&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap',
    iconSet: 'engraved', effects: true, ticker: false, ambient: 'candlelight',
    brand: { name: 'The Kitchen Grimoire', wordmark: { before: 'The Kitchen Grimoire', accent: '', after: '', accentClass: null }, sub: 'Receipts, provisions & the weekly almanac', loginTitle: 'The Kitchen Grimoire', loginSub: 'Sign your name to open the book and plan your week.' },
    copy: {
      nav: { recipes: 'Receipts', mealplan: 'Ledger', shopping: 'Provisions' },
      pages: {
        recipes: { title: 'The Receipt Book', sub: 'Tried & true dishes, set down in good ink' },
        mealplan: { title: 'The Week’s Ledger', sub: null },
        shopping: { title: 'Provisions', sub: null },
      },
    } },
```

- [x] **Step 2: Smoke-check the registry**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {THEMES,themeById} from './src/constants/themes.js'; console.log(THEMES.map(t=>t.id+':'+t.ambient).join(' '), themeById('parchment').copy.nav.recipes)"`
Expected: `default:null cyberpunk:city-rain parchment:candlelight Receipts`

### Task 2: Themed copy helper ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/themeCopy.js`

- [x] **Step 1: Write the helper**

```js
// Themed copy from the THEMES registry (`copy` field). Themes without it keep the plain strings,
// so Default and Cyberpunk render exactly what they did before Parchment.

/** Themed nav label, or the caller's plain label when the theme has none. */
export const navLabel = (theme, key, fallback) => theme?.copy?.nav?.[key] ?? fallback

/** { title, sub } for a page, or null when the theme keeps the plain heading. */
export const pageCopy = (theme, key) => theme?.copy?.pages?.[key] ?? null
```

- [x] **Step 2: Smoke-check it**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {navLabel,pageCopy} from './src/utils/themeCopy.js'; import {themeById} from './src/constants/themes.js'; console.log(navLabel(themeById('parchment'),'recipes','Recipes'), navLabel(themeById('default'),'recipes','Recipes'), JSON.stringify(pageCopy(themeById('cyberpunk'),'recipes')), pageCopy(themeById('parchment'),'shopping').title)"`
Expected: `Receipts Recipes null Provisions`

### Task 3: Ambient layer from the registry ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/App.jsx:54`

- [x] **Step 1: Replace the rain line**

Replace:
```jsx
      {theme.effects && <div className="city-rain" aria-hidden="true" />}
```
with:
```jsx
      {theme.ambient && <div className={theme.ambient} aria-hidden="true" />}
```
For Cyberpunk the DOM is identical (`<div class="city-rain">`). For Default no layer is rendered, as before.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: Parchment token file ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment.css`

- [x] **Step 1: Write the header, theme-only palette, texture and fonts**

```css
/* Parchment theme (The Kitchen Grimoire): an old handwritten kitchen book. Reassigns the Default
   tokens from default.css and adds the parchment / ink / wax / leather / gold palette and fonts.
   Looks that tokens can't express live in parchment/*.css.
   Reference: foodbytes-app/mockup/parchment-theme.html. Generic period motifs only. */
:root[data-theme="parchment"] {
  color-scheme: light;

  /* Palette */
  --page: #f7eed6;
  --parchment: #ead9b1;
  --ink: #2b1d10;
  --ink-faded: #5e4a32;
  --ink-light: #6b5236;
  --wax: #7a1f14;
  --wax-deep: #5a150d;
  --wax-bright: #9c3a2a;
  --leather: #3b2415;
  --leather-dark: #22140a;
  --leather-ink: #e9d6ac;
  --gold: #d8b25a;
  --gold-dim: #a88a45;
  --focus-ink: #1f3a5f;
  --verdigris: #3f6b3a;
  --ochre: #9a6c0c;
  --rule: rgba(110, 80, 40, 0.25);

  /* Texture: fractal-noise grain + faint stains (put on page / card surfaces only, never per row) */
  --paper-noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .24  0 0 0 0 .1  0 0 0 .16 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  --paper-stains: radial-gradient(ellipse 40% 30% at 12% 18%, rgba(150, 105, 45, 0.14), transparent 70%), radial-gradient(ellipse 30% 40% at 88% 70%, rgba(140, 95, 40, 0.12), transparent 70%);
  --page-shadow: inset 0 0 22px rgba(160, 120, 60, 0.18), 0 8px 14px -10px rgba(60, 35, 10, 0.55);
  --leather-grad: linear-gradient(180deg, #4a2d1a, var(--leather) 55%, var(--leather-dark));
  --ribbon-grad: linear-gradient(90deg, #6e140c, #a3271a 50%, #6e140c);
  --seal-grad: radial-gradient(circle at 38% 32%, #c0412f, #8c1c13 55%, #55100a);

  /* Fonts (loaded on demand by applyTheme) */
  --f-brand: 'Cinzel Decorative', Georgia, serif;
  --f-display: 'IM Fell English', Georgia, serif;
  --f-label: 'IM Fell English SC', Georgia, serif;
  --f-body: 'EB Garamond', Georgia, serif;
  --f-num: var(--f-body);
  --f-hand: 'Homemade Apple', cursive;
```

- [x] **Step 2: Remap every Default token (except `--pip-*`), in the same section order as `cyberpunk.css`**

Start with the core remap:
```css
  /* Remap of the Default tokens */
  --brand-primary: var(--wax);
  --brand-primary-dark: var(--wax-deep);
  --brand-primary-light: var(--wax-bright);
  --text-primary: var(--ink);
  --text-secondary: var(--ink-faded);
  --bg-primary: var(--page);
  --bg-secondary: var(--parchment);
  --border-color: #c9ad78;
  --success: var(--verdigris);
  --warning: var(--ochre);
  --error: #9b2318;
  --cheat-badge: var(--wax);
  --on-brand: var(--page);
  --focus-ring-color: var(--focus-ink);

  /* FR-104 macro traffic light: ink colours. Direction encoding unchanged (blue under, red over). */
  --macro-under-target: #2f5d8a;
  --macro-under-target-tint: rgba(47, 93, 138, 0.22);
  --macro-under-target-pill-bg: rgba(47, 93, 138, 0.14);
  --macro-under-target-pill-text: #234a70;
  --macro-near-target: #a8760e;
  --macro-near-target-tint: rgba(168, 118, 14, 0.22);
  --macro-near-target-pill-bg: rgba(168, 118, 14, 0.16);
  --macro-near-target-pill-text: #6f4d05;
  --macro-on-target: #3f7a4a;
  --macro-on-target-tint: rgba(63, 122, 74, 0.22);
  --macro-on-target-pill-bg: rgba(63, 122, 74, 0.15);
  --macro-on-target-pill-text: #2a5733;
  --macro-over-target: #a3241a;
  --macro-over-target-tint: rgba(163, 36, 26, 0.22);
  --macro-over-target-pill-bg: rgba(163, 36, 26, 0.13);
  --macro-over-target-pill-text: #7a1a12;

  /* Aisle inks: each >= 3:1 on --page */
  --aisle-produce: #4f6b2c;  --aisle-dairy: #3d5f86;   --aisle-meat: #8a2a1c;     --aisle-seafood: #2f6f7a;
  --aisle-bakery: #8a5a1c;   --aisle-grains: #6b4a2a;  --aisle-canned: #6d6457;   --aisle-condiments: #8a6a12;
  --aisle-snacks: #8a3050;   --aisle-beverages: #3f4a86; --aisle-frozen: #2f6f7a; --aisle-spices: #6e6418;
  --aisle-oils: #7a6a1a;     --aisle-baking: #6a3a6e;  --aisle-misc: #55626a;
```
Then give **every remaining Default token** a Parchment value, grouped under the same comments `cyberpunk.css` uses: sweep-added, account menu and controls, header, footer/toasts/sign-in, recipes, meal plan, menus/sheets/modals, recipe view, shopping, shared dialogs, admin, landing. Use these mapping rules:
- Purple brand tints (`rgba(74,63,128,…)`-style values in Default) become wax or sepia tints at the same alpha, e.g. `rgba(122, 31, 20, a)` for brand washes and `rgba(110, 80, 40, a)` for neutral washes.
- White surfaces become `var(--page)`. Light-grey surfaces become `var(--parchment)` or `#efe2c2` (a step between).
- Dark text becomes `var(--ink)`. Grey text becomes `var(--ink-faded)` or `var(--ink-light)`. Placeholder text becomes `var(--ink-light)`.
- **Header washes** (`--on-brand-*`, `--nav-message-*`, `--avatar-*`) sit on the leather header and are built from `var(--leather-ink)` / `var(--gold)` at the Default alphas. Concrete values:
  - `--avatar-bg: var(--wax)`
  - `--avatar-text: #f3d2a8`
  - `--avatar-ring: var(--gold-dim)`
- **The recipe-view header (`--rv-head-*`) and cook mode (`--cook-*`)** use leather as the solid (`--rv-head-solid: var(--leather)`, `--rv-head-on-solid: var(--leather-ink)`) and parchment for the panel.
- **Toasts:**
  - `--toast-bg: var(--page)`
  - `--toast-text: var(--ink)`
  - `--toast-action: var(--wax)`
- **Google button:** keep Google's light-theme values (the same literals as Default).
- **Landing:**
  - `--landing-brand: var(--wax)`
  - `--landing-brand-dark: var(--wax-deep)`
  - Dark-phase bgs: `var(--leather-dark)` to `var(--leather)`, with dark-phase text `var(--leather-ink)`.
  - Light-phase bgs: `var(--page)` to `var(--parchment)`.
  - Glass: `rgba(247, 238, 214, 0.08)` / `0.16`.
- **Do not declare any `--pip-*` token.** Pip's room keeps its palette.

Close the block with `}`, then add:
```css
/* Low FX for Parchment is handled in parchment/shell.css (ambient layer, page-turn, ink-blot).
   No token changes: the period fonts neither glow nor animate. */
```

- [x] **Step 3: Verify every Default token is declared**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {readFileSync} from 'fs';const t=f=>new Set([...readFileSync(f,'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));const d=t('src/styles/themes/default.css'),p=t('src/styles/themes/parchment.css');console.log([...d].filter(x=>!p.has(x)&&!x.startsWith('--pip-')).join(' ')||'ALL TOKENS DECLARED')"`
Expected: `ALL TOKENS DECLARED`

### Task 5: Import the Parchment CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/index.css`
- Modify: `foodbytes-app/client/src/main.jsx` (theme CSS imports)

- [x] **Step 1: Create the bundle entry (imports are added as Phase 4 creates each file)**

```css
/* Parchment override bundle. Every selector in every file here MUST start with
   :root[data-theme="parchment"] (the base element defaults in shell.css may use
   :where(:root[data-theme="parchment"])). Colours come from tokens in ../parchment.css;
   no !important except the Low FX animation kill-switch. */
```

- [x] **Step 2: Import both files in `main.jsx`**

Directly after `import './styles/themes/cyberpunk/index.css'` add `import './styles/themes/parchment/index.css'`. Directly after `import './styles/themes/cyberpunk.css'` add `import './styles/themes/parchment.css'`. Update the comment above to read "Cyberpunk and Parchment overrides win on specificity…".

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: Picker tile art ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/previews.css` (append after the Cyberpunk block)

- [x] **Step 1: Add the Parchment tile, built from the same `__bar` / `__cards` / `__card` parts the Default and Cyberpunk blocks use**

```css
/* Parchment */
.theme-preview--parchment {
  background: #ead9b1;
}

.theme-preview--parchment .theme-preview__bar {
  position: relative;
  background: #3b2415;
  border-bottom: 1px solid #d8b25a;
}

.theme-preview--parchment .theme-preview__bar::after {
  content: "";
  position: absolute;
  left: 22%;
  top: 100%;
  width: 6px;
  height: 9px;
  background: #a3271a;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
}

.theme-preview--parchment .theme-preview__card {
  background: #f7eed6;
  box-shadow: 0 0 0 1px #c9ad78;
}
```
Match the gap, padding and child structure the existing blocks use. If they draw extra detail through `::after` on `__card`, give Parchment a faint ink line (`background: #5e4a32; height: 2px`) in the same slot.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Boot script with a colour map ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/index.html:9`

- [x] **Step 1: Replace the boot script line**

```html
    <script>(function(){var ids=['default','cyberpunk','parchment'];var c={cyberpunk:'#05070b',parchment:'#3b2415'};try{var t=localStorage.getItem('fb.display.theme');if(ids.indexOf(t)>0){document.documentElement.dataset.theme=t;document.querySelector('meta[name="theme-color"]').content=c[t]||'#4a3f80'}}catch(e){}})()</script>
```

### Task 8: Theme check knows Parchment and the colour map ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/scripts/check-themes.mjs` (`PAIRS`, boot-colour block at the end)

- [x] **Step 1: Add the Parchment contrast pairs to `PAIRS`**

```js
  parchment: [
    ...on(['text-primary', 'text-secondary', 'brand-primary'], ['bg-primary', 'bg-secondary'], 4.5),
    ['on-brand', 'brand-primary', 4.5],
    ...on(['leather-ink', 'gold'], ['leather'], 4.5),
    ['focus-ink', 'page', 3.0],
    ...AISLES.map((a) => [`aisle-${a}`, 'page', 3.0]),
  ],
```

- [x] **Step 2: Read the boot colours from the `c` map**

Replace the `bootFallback` line and the per-theme `bootColor` loop with:
```js
const bootMap = Object.fromEntries(
  [...(indexHtml.match(/var c=\{([^}]*)\}/)?.[1] ?? '').matchAll(/(\w+):'(#[0-9a-fA-F]+)'/g)].map((m) => [m[1], m[2]])
)
const bootFallback = indexHtml.match(/c\[t\]\|\|'(#[0-9a-fA-F]+)'/)?.[1]
if (bootFallback !== defaultTheme.themeColor) failures.push(`index.html boot script fallback colour ${bootFallback} does not match Default themeColor ${defaultTheme.themeColor}`)
for (const theme of THEMES.filter((t) => t.id !== DEFAULT_THEME_ID)) {
  if (bootMap[theme.id] !== theme.themeColor) failures.push(`index.html boot script colour for ${theme.id} (${bootMap[theme.id]}) does not match its themeColor ${theme.themeColor}`)
}
```
Keep the `metaColor` check as it is.

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the one known Default WARN, then `Themes OK: 3 themes, <n> contrast pairs` with `<n>` = 56 + the Parchment count (about 30). Any `FAIL … (parchment)` means a token is wrong. Fix the token in `parchment.css`; never add a `KNOWN_EXCEPTIONS` entry for Parchment.

---

## Phase 2 — Engraved icons and brand

This phase adds the `engraved` icon set and the quill brand mark, and switches the three `iconSet` consumers to lookup maps. Default (`line`) and Cyberpunk (`pixel`) render the same components as before. The build is green.

### Task 9: Engraved icon paths and component ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/engravedIcons.js`
- Create: `foodbytes-app/client/src/components/common/EngravedIcon.jsx`

- [x] **Step 1: Path map (24×24, from the mockup's `ICO`)**

```js
// Engraved line icons for themes with iconSet 'engraved' (Parchment). Thin strokes, 24×24 viewBox.
// Source: foodbytes-app/mockup/parchment-theme.html → ICO.
export const ENGRAVED_ICONS = {
  book: ['M3 5.5c3-1.2 6-1 9 1 3-2 6-2.2 9-1v13.5c-3-1-6-.8-9 1-3-1.8-6-2-9-1z', 'M12 6.5v13.5'],
  ledger: ['M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M8 3v18M11 8h6M11 12h6M11 16h4'],
  basket: ['M3 10h18l-2 10H5z', 'M7 10l4-6M17 10l-4-6M9 14v3M12 14v3M15 14v3'],
  quill: ['M20 3C13 4 8 9 6.5 16L5 21l3-3.2C15 16.5 19 11 20 3z', 'M8 17.5l6-6.5'],
}
```

- [x] **Step 2: Component**

```jsx
import { ENGRAVED_ICONS } from '../../constants/engravedIcons'

/** Thin-stroke engraved icon (iconSet 'engraved'). Decorative: the caller supplies the label. */
function EngravedIcon({ name, size = 24, className }) {
  const paths = ENGRAVED_ICONS[name]
  if (!paths) return null
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  )
}

export default EngravedIcon
```

### Task 10: Quill brand mark ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/common/EngravedBrandMark.jsx`

- [x] **Step 1: Component (colours from `currentColor`; `shell.css` sets `color: var(--gold)` on `.brand-mark`)**

```jsx
/** Quill crest for the Parchment header (iconSet 'engraved'). Decorative; HeaderBrand labels the button. */
function EngravedBrandMark({ size = 40, className }) {
  return (
    <svg className={className} viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="12.3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.2 1.6" />
      <path d="M23 7c-6 1-10 6-11.5 12L10 25l2.6-2.8C18.5 21 22.4 15.6 23 7z" fill="currentColor" />
      <path d="M12.4 21.6l5.2-6" stroke="var(--leather)" strokeWidth="1" />
    </svg>
  )
}

export default EngravedBrandMark
```

### Task 11: HeaderBrand picks the engraved mark ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/HeaderBrand.jsx:1-8`

- [x] **Step 1: Import and register**

Add `import EngravedBrandMark from '../common/EngravedBrandMark'` after the `PixelBrandMark` import, and change the map to:
```js
const MARKS = { line: BrandMark, pixel: PixelBrandMark, engraved: EngravedBrandMark }
```

### Task 12: AppNavItems: icon map by set + themed labels ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/AppNavItems.jsx:1-13,78-82`

- [x] **Step 1: Imports and maps**

Add the imports `import EngravedIcon from '../common/EngravedIcon'` and `import { navLabel } from '../../utils/themeCopy'`. Below `NAV_ICON_NAMES`, add:
```js
// Parchment (iconSet 'engraved') draws the same three sections as engraved glyphs.
const NAV_ENGRAVED_NAMES = { recipes: 'book', mealplan: 'ledger', shopping: 'basket' }

// One renderer per icon set; anything else falls back to the Default line icons.
const NAV_ICON_RENDERERS = {
  pixel: (key) => <PixelIcon name={NAV_ICON_NAMES[key]} size={24} />,
  engraved: (key) => <EngravedIcon name={NAV_ENGRAVED_NAMES[key]} size={24} />,
}
```

- [x] **Step 2: Use them in the render**

Replace:
```jsx
                {theme.iconSet === 'pixel'
                  ? <PixelIcon name={NAV_ICON_NAMES[item.key]} size={24} />
                  : NAV_ICONS[item.key]}
                <span>{item.label}</span>
```
with:
```jsx
                {NAV_ICON_RENDERERS[theme.iconSet]?.(item.key) ?? NAV_ICONS[item.key]}
                <span>{navLabel(theme, item.key, item.label)}</span>
```

### Task 13: Engraved cart in the extras UI ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/common/ExtrasIcons.jsx:3-4,20-21`

- [x] **Step 1: Branch on the engraved set**

Add `import EngravedIcon from './EngravedIcon'`. In `CartIcon`, directly after the `pixel` line, add:
```jsx
  if (theme.iconSet === 'engraved') return <EngravedIcon name="basket" size={14} className={className} />
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Themed page headings

The page components read `pageCopy`. With Default or Cyberpunk active, `pageCopy` returns `null`, so the output is identical to today. With Parchment active, the headings read "The Receipt Book" / "The Week's Ledger" / "Provisions". The build is green.

### Task 14: Recipes page heading (Parchment only) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeList.jsx:1-17,77-78`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeList.css` (append)

- [x] **Step 1: Render the heading only when the theme supplies one**

Add the imports `import { useTheme } from '../../contexts/ThemeContext'` and `import { pageCopy } from '../../utils/themeCopy'`. Near the other hooks in the component body add `const { theme } = useTheme()` and `const heading = pageCopy(theme, 'recipes')`. Directly inside `<div className="recipe-list-container">`, before `<RecipeToolbar`, add:
```jsx
      {heading && (
        <header className="page-heading">
          <h1 className="page-heading-title">{heading.title}</h1>
          {heading.sub && <p className="page-sub">{heading.sub}</p>}
        </header>
      )}
```

- [x] **Step 2: Theme-agnostic base layout (tokens only)**

Append to `RecipeList.css`:
```css
/* Optional themed page heading (only rendered when the active theme has copy.pages.recipes) */
.page-heading {
  margin: 0 0 12px;
}

.page-heading-title {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary);
}

.page-sub {
  display: block;
  margin: 2px 0 0;
  font-style: italic;
  color: var(--text-secondary);
}
```

- [x] **Step 3: Measure the file**

Run: `(Get-Content foodbytes-app\client\src\components\recipes\RecipeList.jsx | Measure-Object -Line).Lines`
Expected: under 220 (was 196).

### Task 15: Meal Plan headings (desktop + mobile) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanWeekDesktop.jsx:1-13,29`
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanWeekMobile.jsx:1-20,64`

- [x] **Step 1: Desktop**

Add `import { useTheme } from '../../contexts/ThemeContext'` and `import { pageCopy } from '../../utils/themeCopy'`. In the component body add `const { theme } = useTheme()` and `const heading = pageCopy(theme, 'mealplan')`. Replace `<h2>Meal Plan</h2>` with:
```jsx
        <h2>{heading?.title ?? 'Meal Plan'}</h2>
        {heading?.sub && <span className="page-sub">{heading.sub}</span>}
```

- [x] **Step 2: Mobile, same change at line 64**

Add the same imports and the same two body lines, then replace `<h2>Meal Plan</h2>` with the same two lines as Step 1.

`.page-sub` is styled globally by Task 14's rule, which ships in the bundle because `RecipeList.css` is always loaded. If the executor prefers locality, it may instead duplicate the `.page-sub` rule into `MealPlanWeekDesktop.css`. Note the choice in the summary.

### Task 16: Shopping headings ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/ShoppingList.jsx:92`
- Modify: `foodbytes-app/client/src/components/shopping/ShoppingListHeader.jsx:62`

- [x] **Step 1: Both headings read the themed title**

In each file add `import { useTheme } from '../../contexts/ThemeContext'` and `import { pageCopy } from '../../utils/themeCopy'`, plus `const heading = pageCopy(useTheme().theme, 'shopping')` in the component body.
- `ShoppingList.jsx:92`: replace `<h1>Shopping List</h1>` with `<h1>{heading?.title ?? 'Shopping List'}</h1>`.
- `ShoppingListHeader.jsx:62`: replace `<h1>Shopping list</h1>` with `<h1>{heading?.title ?? 'Shopping list'}</h1>`.

Keep each file's existing casing as the fallback.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — The Parchment look (override bundle)

This phase adds one area file per task, each imported from `parchment/index.css` as it is created. Every selector starts `:root[data-theme="parchment"]`. Use the matching `cyberpunk/<area>.css` as the list of app classes to restyle, and the mockup's `<style>` as the look. Colours come only from `parchment.css` tokens (`var(--…)`); black-based shadows are allowed. Each task ends with a build, so any task boundary is a safe stopping point. Default and Cyberpunk are untouched because nothing here matches without `data-theme="parchment"`.

Rules for every file in this phase:
- Touch targets stay at least 44px. Hover styles go inside `@media (hover: hover)` and are paired with `:active`. Focus uses `:focus-visible` with `outline: 2px solid var(--focus-ring-color)`.
- No `mask` on any element that contains a fixed popup (receipt/scroll, cards with popovers). Use backgrounds or clip-path on pseudo-elements instead.
- The `--paper-noise` texture goes on page and card surfaces only, never on per-row elements.
- Every animation sits under a `body.lowfx` kill rule and `@media (prefers-reduced-motion: reduce)`.

### Task 17: Shell: page, header, footer, user menu, toasts, login, candlelight ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/shell.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './shell.css';`)

- [x] **Step 1: Base element defaults and page surface**

```css
:where(:root[data-theme="parchment"]) body {
  font-family: var(--f-body);
  font-size: 17px;
  color: var(--text-primary);
  background-color: var(--parchment);
  background-image: var(--paper-noise), var(--paper-stains);
  font-variant-numeric: oldstyle-nums;
}

:where(:root[data-theme="parchment"]) h1,
:where(:root[data-theme="parchment"]) h2,
:where(:root[data-theme="parchment"]) h3 {
  font-family: var(--f-display);
  font-weight: 400;
}
```

- [x] **Step 2: Restyle the shell classes `cyberpunk/shell.css` lists, using the mockup's `.hdr` / `.hnav` / `.seal` / `.bnav` / `.amenu` / `.toast` CSS**

- **`.header`:** `background: var(--paper-noise), var(--leather-grad)`, `border-bottom: 3px double var(--gold-dim)`, and a `::after` dashed stitch inset with `rgba(216,178,90,.35)`.
- **`.brand-btn`:** `color: var(--gold)`. `.brand-word` in `var(--f-brand)` 700. `.brand-sub` italic `var(--f-display)` in `var(--leather-ink)`, hidden below 768px.
- **`.header-btn` / `.footer-btn`:** `var(--f-label)` in `var(--leather-ink)`. In the `.active` state, a `::after` ribbon: `background: var(--ribbon-grad)` with `clip-path: polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)`, hanging below the header (or above the footer tab, as in the mockup's `.bnav`).
- **`.footer` / `.footer-nav`:** the leather gradient and the double gold top border.
- **`.avatar-btn` / `.user-menu__avatar`:** the wax seal. Irregular `border-radius: 48% 52% 50% 46%/50% 45% 55% 50%`, `background: var(--seal-grad)`, inset rings, `var(--f-brand)` letter.
- **`.user-menu`, `.user-menu--sheet`, `__section`, `__who`, `__close`, `__signout`, `.theme-tile`, `.theme-tile__tick`, `.lowfx-switch`, `.version-info`:** parchment card (`--page` + `--paper-noise` + `--page-shadow`), section headings in `--f-label` and wax colour. The selected tile gets a 2px wax border. On the sheet variant, the handle (`__grab`) is in faded ink.
- **`.toast` / `.meal-toast`:** a sealed note. Parchment card, italic `--f-display`, a small wax seal on `::before`.
- **`.modal-overlay` / `.modal-content` / `.modal-header` / `.modal-close`, login (`.google-signin-btn` keeps Google's light spec, `.guest-btn`, `.benefits`, `.password-form`, `.password-submit-btn`):** parchment dialog with a leather header bar.

- [x] **Step 3: The candlelight ambient layer and Low FX**

```css
:root[data-theme="parchment"] .candlelight {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

:root[data-theme="parchment"] .candlelight::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(70, 40, 10, 0.28) 100%);
  animation: candle-flicker 5s ease-in-out infinite;
}

:root[data-theme="parchment"] .candlelight::after {
  content: "";
  position: absolute;
  left: 0;
  top: 100%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  box-shadow: 12vw -8vh 4px rgba(255, 228, 170, 0.8), 30vw -20vh 4px rgba(255, 228, 170, 0.7),
    55vw -12vh 4px rgba(255, 228, 170, 0.75), 72vw -26vh 4px rgba(255, 228, 170, 0.6),
    88vw -6vh 4px rgba(255, 228, 170, 0.7), 44vw -34vh 4px rgba(255, 228, 170, 0.55);
  animation: candle-motes 16s linear infinite;
}

@keyframes candle-flicker {
  0%, 100% { opacity: 1; }
  22% { opacity: 0.82; }
  25% { opacity: 0.95; }
  61% { opacity: 0.86; }
  64% { opacity: 1; }
}

@keyframes candle-motes {
  from { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  to { transform: translateY(-70vh); opacity: 0; }
}

:root[data-theme="parchment"] body.lowfx .candlelight {
  display: none;
}

:root[data-theme="parchment"] body.lowfx * {
  animation: none !important;
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  :root[data-theme="parchment"] .candlelight { display: none; }
}
```
Make sure `.app` content stacks above the layer: if `.main-content` is not positioned, add `:root[data-theme="parchment"] .main-content { position: relative; z-index: 1; }`.

The blanket `body.lowfx *` rule only turns off animations under Parchment. Before committing to it, confirm `.loading-spinner` is not rendered inside Parchment pages while Low FX is on, because functional spinners must keep turning. If it would stop one, scope the rule to `.candlelight, .recipe-view-modal, .shopping-aisle` descendants instead.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 18: Recipes: pinned slips ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/recipes.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './recipes.css';`)

- [x] **Step 1: Restyle the classes listed in `cyberpunk/recipes.css`, from the mockup's `.card`, `.etch`, `.vtabs`, `.chips`, `.tabs`, `.search`, `.inplan`, `.cheat`**

- **`.recipe-card`:**
  - `--page` + `--paper-noise` with `--page-shadow` and `1px solid var(--border-color)`.
  - Alternate the tilt with `:nth-child(3n+1) { rotate: -0.35deg }` and `:nth-child(3n+2) { rotate: 0.3deg }`, under `body:not(.lowfx)` only.
  - Add a `::before` brass pin (a radial gradient of `var(--gold)` to `var(--gold-dim)`).
- **`.recipe-card-top` emoji / thumbnail:** an etched roundel (1.5px `--ink-light` border with an inset ring) and `filter: sepia(0.85) saturate(0.7) contrast(1.05)`. This filter is the approved stand-in for engraved dish art.
- **`.recipe-card-name`:** `--f-display`.
- **`.variant-seg` / `.variant-single`:** small-caps (`--f-label`) joined tabs. The selected tab is filled with `--ink` and has `--page` text.
- **`.macro-chip` / `.macro-chips--*`:** ink-dot chips in `--f-label` with oldstyle numerals.
- **The cheat badge** (the class that marks `is_cheat`, see `RecipeCard.jsx`): a rotated wax seal with "Treat day" text drawn by CSS on the seal, or the badge's existing text in `--f-label` on the seal.
- **The in-plan state:** the mockup's `.inplan` wax ribbon tag.
- **`.recipe-tab`:** a folder tab, whose `on`/active state lifts onto the page colour with a wax label.
- **`.recipe-search`:** an underlined quill-ink field in `--f-display` italic.
- **`.recipe-add-btn` / `.pick-btn` / `.day-btn` / `.week-tile`:** primary buttons are a wax gradient (`--brand-primary-light` to `--brand-primary-dark`) with `--on-brand` text.
- **`.extras-popup-*` / `.macro-target-*` / `.servings-chip-*`:** parchment popovers with a leather header strip.
- **`.page-heading-title`:** `--f-display` at 34px (28px below 480px). `.page-sub` is italic `--ink-faded`, followed by a flourish rule on `::after`: a `linear-gradient(90deg, var(--ink-light), transparent)` 1px line, 220px wide.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 19: Meal plan: the ledger ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/mealplan.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './mealplan.css';`)

- [x] **Step 1: Restyle the classes listed in `cyberpunk/mealplan.css`, from the mockup's `.ledger`, `.ent`, `.eaten`, `.add`, `.tot`, `.daytabs`, `.slip`**

- **Timetable** (`.slot-cell`, `.timetable-rowlabel`, `.timetable-rowtime`, `.day-header*`): the ledger card surface. Column rules are `1px solid var(--rule)`, the header row has a `2px solid var(--ink-light)` bottom border, and rows carry ruled lines (`repeating-linear-gradient(180deg, transparent 0 27px, var(--rule) 27px 28px)`). Day names are in `--f-label` and dates in `--f-display`.
- **Today's column:** `background: rgba(216,178,90,.14)`. Its header gets a handwritten "today" via `::after { content: "today"; font-family: var(--f-hand); }`, which is decorative and duplicates the existing today marker.
- **`.meal-card`:** borderless ink entries with the name in italic `--f-display` and the meta (`.meal-card-meta`) in `--f-label`.
- **`.meal-card-tick`, eaten state:** a hand-drawn ✓ in `--f-hand` and `--success`, rotated -5deg.
- **`.slot-add` / `.m-add`:** a dashed `--border-color` box with faded italic text.
- **`.day-summary` / `.week-summary-tile` / `.macro-summary-*`:** a "Day's sum" row with a double ink top rule and kcal in `--f-display`.
- **Mobile:**
  - `.day-chip` gets parchment tabs. The selected one is ink-filled. Today has a 3px wax underline (`box-shadow: inset 0 -3px 0 var(--brand-primary)`).
  - `.m-slot-head`, `.m-entry-fallback` and `.m-empty` sit on parchment slips.
  - `.m-weekbar` gets a leather-free parchment strip.
- **Menus, sheets and modals** (`.meal-sheet*`, `.swap-modal*`, `.copy-modal*`, `.tpl-modal*`, `.macro-popup*`, `.toolbar-btn*`, `.toolbar-dd-menu`, `.entry-menu-list`, `.meal-plan-menu-list`, `.servings-sheet-*`, `.swipe-row-action*`, `.mx-*`, `.swipe-hint-bubble`): parchment cards with leather header strips, wax primary buttons and faded-ink secondary buttons. Swipe actions use `--brand-primary` (remove) and `--success` (replace / move).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 20: Recipe view: the open book ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/recipe-view.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './recipe-view.css';`)

- [x] **Step 1: Restyle `.recipe-view-modal` and its descendants (use the descendant selectors `cyberpunk/recipe-view.css` targets), from the mockup's `.book`, `.leaf`, `.ing`, `.steps`, `.margin`**

- **The modal frame:** a leather cover (`--paper-noise` + `--leather-grad`, `inset 0 0 0 2px var(--gold-dim)`) padding a parchment interior.
- **Two-column layouts** (from the breakpoint where `RecipeViewModal` already shows ingredients and steps side by side): the ingredients column is the left leaf, with a gutter shade `linear-gradient(90deg, transparent 80%, rgba(120,85,35,.28))`. The steps column is the right leaf with the mirrored shade. One column below that breakpoint, with no gutter.
- **Ingredient rows:** a dotted leader between name and quantity (a flex filler with `border-bottom: 1.5px dotted var(--ink-light)`) and oldstyle numerals. Linked homemade ingredients keep their existing link and get wax italic text, with a `--f-hand` margin note "homemade" via `::after`. The existing store-bought / homemade controls keep working and are only restyled.
- **Steps:**
  - Roman numerals in wax (`counter(<the list's counter>, upper-roman)` if the list is CSS-counted; otherwise style the existing number element in `--f-label` and wax).
  - The first step's first letter is a drop cap: `::first-letter { float: left; font-family: var(--f-brand); font-weight: 700; font-size: 46px; line-height: .85; color: var(--brand-primary); margin: 4px 6px 0 0 }`.
  - Done steps are struck through in ink at 1.5px, coloured `--ink-light`.
  - The linked-recipe step is italic, with its `alt_instruction` line in faded small text.
- **The header** (`--rv-head-*` tokens already supply the colours): `--f-display` title, variant tabs as in recipes, and the servings stepper with 26px round ink buttons inside a 44px hit area.
- **Full-screen ingredients and cook mode:** plain parchment with large `--f-body` text and no texture behind the main text block (readability while cooking).
- **Animations, both killed by Low FX and reduced motion:**
  - The book-open page turn on the modal entrance: `@keyframes book-open { from { transform: perspective(1400px) rotateY(-14deg) scale(.96); opacity: 0 } }`, 0.45s.
  - The ink-blot settle on a step's check: `@keyframes ink-blot { 0% { transform: scale(1.25); filter: blur(1px) } 100% { transform: none; filter: none } }`, 0.4s, applied to the tick mark's checked state.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 21: Shopping: the scroll ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/shopping.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './shopping.css';`)

- [x] **Step 1: Restyle the classes listed in `cyberpunk/shopping.css`, from the mockup's `.scrollwrap`, `.rod`, `.paper`, `.aisle`, `.item`, `.box`, `.sealrow`**

- **`.shopping-list-page`:** centred at max 640px, with the list body as the paper (`--page` + `--paper-noise`, inset top and bottom shading).
- **Rods:** use `::before` and `::after` on the list wrapper. 20px tall, rounded, with a wood gradient built from `--leather` / `--gold-dim` tokens and gold finials through layered radial gradients on the same pseudo-element, extending 22px past the paper (8px on mobile).
- **No `mask`.** The breakdown popup is fixed-positioned inside this tree.
- **`.shopping-list-header` / `.list-meta`:** title centred in `--f-display`, meta italic.
- **`.shopping-aisle`:**
  - The `.aisle-name` heading in `--f-label`.
  - An ink-dot `::before` coloured by the existing per-aisle colour (the component already exposes `data-aisle`; reuse whatever variable or selector `cyberpunk/shopping.css` uses to pick `--aisle-*`).
  - A flourish rule `::after` (`linear-gradient(90deg, var(--ink-light), transparent)`).
  - The done state uses the `--aisle-done-*` tokens.
- **Items:**
  - The checkbox is a drawn ink square: 1.5px `--ink`, irregular radius `1px 3px 2px 2px`.
  - Checked shows a hand-drawn ✗ in `--f-hand` and wax via `::after`, which is decorative because the real checkbox state stays on the input or ARIA.
  - The checked name is struck through in `--ink-light`.
  - Quantities are italic with oldstyle numerals.
- **`.sl-progress*`:** a thin ink bar on parchment.
- **`.sl-stale` / `.warning-message`:** an ochre note slip.
- **`.generate-btn` / `.sl-btn` / `.choose-dates-btn`:** wax primary or ink secondary.
- **`.generate-modal*`, `.breakdown-popup*`, `.modal-actions`, `.cancel-btn`, `.date-field`:** parchment dialog styling as in the shell.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 22: Shared dialogs ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/parchment/dialogs.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment/index.css` (add `@import './dialogs.css';`)

- [x] **Step 1: Restyle the classes in `cyberpunk/dialogs.css` and `cyberpunk/hud.css`'s dialog headers**

- **`.confirm-dialog*`:** a parchment card. The title is in `--f-display`. The confirm button is wax and cancel is ink outline. Do not add a `content:` prefix like Cyberpunk's `SYS://CONFIRM`.
- **`.date-input` / `.header-week`:** a quill-ink underline field, with the header week control in `--leather-ink` on leather and gold-outlined arrows (the mockup's `.wk`).
- **Dialog header bars** (`.breakdown-header`, `.copy-modal-header`, `.macro-popup-header`, `.swap-modal-header`, `.tpl-modal-header`) if not already covered: leather strip, gold `--f-label` title, `--leather-ink` close.

- [x] **Step 2: Confirm the bundle lists all six files, then build**

Run: `Select-String -Path foodbytes-app\client\src\styles\themes\parchment\index.css -Pattern "@import"`
Expected: six lines (`shell`, `recipes`, `mealplan`, `recipe-view`, `shopping`, `dialogs`).

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 5 — Docs and mockups

This phase brings the docs and mockups in line with what shipped. There are no runtime changes; the build stays green.

### Task 23: CLAUDE.md Themes section ✓

- Skill: none — project documentation, not client code

**Files:**
- Modify: `CLAUDE.md` (`### Themes — the client has several`)

- [x] **Step 1: Update the section**

- **First paragraph:** add **Parchment** (*The Kitchen Grimoire*, parchment, ink, wax and leather, a generic period look with no franchise marks) to the list of themes, and cite this contract.
- **File layout:** add `parchment.css` and `parchment/` (same six area files as Cyberpunk, without `hud.css`).
- **Registry fields:** add `ambient` (class of the fixed effect layer `App.jsx` renders: `'city-rain'`, `'candlelight'` or `null`), `iconSet` value `engraved`, and `copy` (`{ nav: {recipes, mealplan, shopping}, pages: {recipes|mealplan|shopping: {title, sub}} }`, read through `utils/themeCopy.js`; themes without it keep the plain strings).
- **`check:themes` expected output:** the Default WARN plus `Themes OK: 3 themes, <n> contrast pairs` (use the number Task 8 printed).
- **"Adding a theme" checklist:** add "colour in the `index.html` boot script's `c` map" and "a `PAIRS.<id>` list in `check-themes.mjs`".
- **Rules:** add one line: "Themes borrow a genre's feel, never its property: no franchise names, marks, characters or lookalike fonts; open-licence fonts only."

### Task 24: Mockup sync ✓

- Skill: none — static HTML mockups outside client/src

**Files:**
- Modify: `foodbytes-app/mockup/README.md`
- Modify: `foodbytes-app/mockup/user-menu-themes.html`
- Modify: `foodbytes-app/mockup/app-mockup.html`

- [x] **Step 1: README**

Add a table row: `parchment-theme.html` | the **Parchment** theme (Receipts, Ledger desktop + mobile, open-book recipe view, Provisions scroll, account menu with three tiles). Deep links: `#mobile`, `#r=mealplan|shopping|pet`, `#dlg=recipe`, `#acct`, `#lowfx`. Update the Known gap paragraph: `app-mockup.html` draws Cyberpunk, `parchment-theme.html` draws Parchment, and Default's live app is the reference. Add a History line: "Parchment theme approved 2026-11-15; shipped by `.claude/contract/2026-11-15-parchment-theme/`."

- [x] **Step 2: Picker tiles in the two other mockups**

In `user-menu-themes.html` and `app-mockup.html`, add `{id:'parchment',label:'Parchment'}` to their `THEMES` arrays and a `parchment` entry in the tile-preview map, reusing the `.pv-parch` CSS from `parchment-theme.html`. Picking Parchment shows the existing "this file draws X only" toast pattern, pointing to `parchment-theme.html`.

- [x] **Step 3: Record divergences**

If the implementation differs from `parchment-theme.html` anywhere for a good reason, edit the mockup to match. Expected differences, by design: plain meal and aisle names, and "Shopping list" fallbacks not shown. Change the mockup's meal labels ("Luncheon / Supper / Morsels") and aisle names back to the app's plain names so it matches live, and add a line to its notes panel saying meal and aisle renames were deferred.

---

## Phase 6 — Final verification

The closing phase makes no production changes beyond the version bump; it only sanity-checks the cumulative work.

### Task 25: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This work has no Jira key and is not a bug fix, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-15-parchment-theme: Parchment theme (The Kitchen Grimoire), a third selectable theme`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 26: Greps ✓

- Skill: none — verification only

- [x] **Step 1: No franchise words anywhere in shipped code**

Run: `Get-ChildItem foodbytes-app\client\src, foodbytes-app\client\index.html -Recurse -Include *.js,*.jsx,*.css,*.html | Select-String -Pattern "harry|potter|hogwarts|gryffindor|slytherin|ravenclaw|hufflepuff|muggle|wizarding|lumos|diagon|marauder|hedwig|quidditch" -CaseSensitive:$false`
Expected: zero hits.

- [x] **Step 2: No theme-id branching in components**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.jsx | Select-String -Pattern "parchment"`
Expected: zero hits. Parchment appears only in `constants/themes.js` and CSS.

- [x] **Step 3: Parchment colours live only in the themes folder**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.css,*.jsx,*.js | Where-Object { $_.FullName -notmatch '\\styles\\themes\\' -and $_.Name -ne 'themes.js' } | Select-String -Pattern "#3b2415|#f7eed6|#ead9b1|#7a1f14|#d8b25a"`
Expected: zero hits. `constants/themes.js` is excluded because its `themeColor: '#3b2415'` is the registry value, as Cyberpunk's `#05070b` is.

- [x] **Step 4: Every override selector is prefixed**

Run: `Get-ChildItem foodbytes-app\client\src\styles\themes\parchment -Filter *.css | Select-String -Pattern "^[.#a-z]" | Where-Object { $_.Line -notmatch '^@' }`
Expected: zero hits. Every rule starts with `:root[data-theme="parchment"]`, `:where(:root[data-theme="parchment"])`, `@keyframes`, `@media` or `@import`.

- [x] **Step 5: No new console logging**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: no higher than before this contract (6).

### Task 27: Theme check, production build ✓

- Skill: none — verification only

- [x] **Step 1: Theme check**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the one known Default WARN, then `Themes OK: 3 themes, <n> contrast pairs` (same `<n>` as Task 8).

- [x] **Step 2: Production build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 3: Backend suite: skipped**

No file under `foodbytes-app/foodbytes-api/` changes except the `pom.xml` version. Instead of a full `mvn test`, compile once to prove the version edit is well-formed.
Run: `cd foodbytes-app\foodbytes-api; mvn -q compile` (with the `JAVA_HOME` / Maven `PATH` prefix from `CLAUDE.md` → "Running the backend locally")
Expected: `BUILD SUCCESS` (quiet: no output, exit code 0).

### Task 28: Manual visual checklist and PR description ✓ (Step 1 pending — developer browser check)

- Skill: none — manual check by the developer + documentation

**Files:**
- Create: `.claude/contract/2026-11-15-parchment-theme/pr-description.md`

- [ ] **Step 1: Manual check (developer, `npm run dev` → http://localhost:5173)**

For each check, the expected result is stated.
1. **Default** is chosen. Recipes, Meal Plan, Shopping, recipe view and user menu look exactly as before, there is no Recipes heading, and nav labels are "Recipes / Meal Plan / Shopping".
2. **Cyberpunk** is chosen. Rain, ticker, pixel icons and neon all work as before, and Low FX still stops the rain.
3. **Parchment** is chosen from the user menu:
   - The leather header shows the gold quill crest, "The Kitchen Grimoire" and the red ribbon on the active tab.
   - Nav labels read Receipts / Ledger / Provisions.
   - Recipes shows "The Receipt Book" with its subtitle, pinned slips and sepia emoji.
   - Meal Plan shows "The Week's Ledger" as a ruled ledger with handwritten "today".
   - The recipe view opens as a book with a drop cap, and ticked steps are struck through.
   - Shopping shows "Provisions" as a scroll with rods, and a ticked item shows ✗ with its name struck through.
   - The breakdown popup opens fully, not clipped.
4. **Reload** with Parchment chosen. There is no Default flash before paint, and the phone browser bar is dark brown (`#3b2415`).
5. **Low FX on:** the candle flicker and motes are gone, the book opens without a page turn, and the spinners still spin. Low FX off: they are back.
6. **Widths:** at 320, 390, 768, 1024 and 1280px, nothing overflows horizontally, every popup and sheet is usable, and touch targets are at least 44px.
7. **On a phone:** gold and light text on the leather header and footer are clearly readable over the texture.
8. **Pip tab:** the room looks unchanged, with only the leather footer around it.
9. **Sign out → login dialog:** it reads "The Kitchen Grimoire" and the Google button is unchanged.

- [x] **Step 2: Write `pr-description.md` in this plan folder**

Include:
- A link to `plan.md`.
- A summary: the Parchment theme; the new `ambient`, `copy` and `engraved` registry pieces; Default and Cyberpunk unchanged.
- The new version from Task 25.
- That there is no migration and no Railway step.
- The results of Tasks 26–27 (the `check:themes` output line, the build) and the manual checklist outcome.
- A note for contributors: "Themed copy goes through `utils/themeCopy.js` (`copy` registry field); the background effect layer is the registry's `ambient` class."
- A suggested commit subject: `Parchment theme: The Kitchen Grimoire (third selectable theme)`. There is no Jira key; if a ticket is opened, prefix it with `MPP-n:`.

---

## Self-review

**Spec coverage:**
- Registry entry, plus the `ambient` and `copy` fields: Tasks 1, 3.
- Token file with every Default token except `--pip-*`: Task 4.
- Override bundle (shell, recipes, mealplan, recipe-view, shopping, dialogs): Tasks 5, 17–22.
- Engraved icon set and brand mark: Tasks 9–13.
- Themed copy helper, nav labels and page headings: Tasks 2, 12, 14–16.
- Picker tile: Task 6.
- Boot script: Task 7.
- `check-themes.mjs` pairs and colour-map parsing: Task 8.
- Docs (CLAUDE.md) and mockups (README, two picker mockups, parchment mockup divergences): Tasks 23–24.
- Version bump and CHANGELOG: Task 25.
- Licence-free guardrail: Task 26 Step 1.
- Default and Cyberpunk unchanged: Task 26 Step 2 and Task 28 checks 1–2.

**Placeholder scan:** none of the forbidden placeholders appear. Every step carries code, a mapping rule tied to named classes and mockup selectors, or a `Run:` / `Expected:` pair. The `<n>` counts are printed by Task 8 and reused by Tasks 23 and 27.

**Type / name consistency:**
- `ambient` values `'city-rain'` / `'candlelight'` / `null` are used in Tasks 1, 3, 17 and 23.
- `copy.nav` / `copy.pages` and `navLabel` / `pageCopy` are used in Tasks 1, 2, 12 and 14–16.
- `ENGRAVED_ICONS` keys `book` / `ledger` / `basket` / `quill` are used in Tasks 9, 12 and 13.
- `EngravedIcon` / `EngravedBrandMark` are used in Tasks 9–13.
- Tokens `--page`, `--leather`, `--leather-ink`, `--gold` and `--focus-ink` are defined in Task 4 and checked in Task 8.
- CSS classes `.candlelight`, `.page-heading`, `.page-heading-title` and `.page-sub` are used consistently in Tasks 3, 14, 15, 17 and 18.

**Phase boundary cleanliness:**
- Phase 1 ends green: Parchment is selectable with tokens only, and `check:themes` passes.
- Phase 2 ends green: the new icon set renders only for `engraved`, and the other sets are unchanged.
- Phase 3 ends green: headings fall back to today's text when there is no `copy`.
- Phase 4 ends green after every task: each area file is additive and scoped to `data-theme="parchment"`.
- Phase 5 is docs only.
- Phase 6 is verification and the version bump.

# Tasks: Theme system + user menu v2 + Cyberpunk theme (FOODBYTES // Night Kitchen)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase by phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-14 (revision 2: 2026-11-15)

**Goal:** Add a theme system. Default stays exactly as today; Cyberpunk is the approved night-kitchen look. Users pick a theme in a redesigned user menu (remembered per device). Every text pair passes AA in every theme, popups work on mobile, Low FX switch for Cyberpunk.

**Spec:** `plan.md` in this folder. Visual reference: `foodbytes-app/mockup/app-mockup.html` (Cyberpunk, full app) and `foodbytes-app/mockup/user-menu-themes.html` (user menu, both themes, style A). Cyberpunk design rules: `.claude/contract/2026-11-14-cyberpunk-makeover/mockup-plan.md` §2–§3.

---

## Sweep rules (apply in every CSS task)

Every CSS task in Phases 2–8 does two things to its files: a **Default-preserving sweep** and a **Cyberpunk treatment**.

1. **Default-preserving sweep (component CSS file).** Replace every literal colour — `#hex`, `white`, and any `rgb()/rgba()` that is not pure black — with a token:
   - If `themes/default.css` already has a token with **exactly** that value **and** the same role, use it.
   - Otherwise add a role-named token to `themes/default.css` with **exactly** the literal value (e.g. `--surface-tint-brand: #eeebf7;`, `--on-brand: #ffffff;`), grouped under an area comment, and give it a value in `themes/cyberpunk.css`.
   - **Never change a Default value.** Under Default the computed colour of every element must be identical to before. Black `rgba(0,0,0,x)` shadows stay as they are.
2. **Cyberpunk values.** Pick the Cyberpunk value for each new token from this table:

| Default literal (typical role) | Cyberpunk value |
|---|---|
| white / light surface | `var(--panel)`, or `var(--raised)` for popovers and inputs |
| light grey page / well | `var(--void)` (page) or `var(--deep)` (inset well) |
| white text on a brand fill | `var(--void)` (neon fills take dark text) |
| dark text | `var(--ink)` |
| grey text | `var(--muted)` |
| light borders | `var(--line-soft)`, or `var(--line)` for a visible edge |
| brand purple | `var(--pink)` for primary actions, `var(--cyan)` for selection and focus frames |
| green / red | `var(--lime)` / `var(--red)` |
| amber / yellow | `var(--yellow)`, or `var(--orange)` for cheat and store-bought |
| purple-tinted rgba | the same alpha on `--pink` or `--cyan` |

3. **Cyberpunk treatment (override file).** Anything tokens can't express — fonts per element, HUD brackets, glow, borders, counters, the receipt zigzag — goes in `src/styles/themes/cyberpunk/<area>.css`. Every selector starts with `:root[data-theme="cyberpunk"]`. Find the look by matching the mockup selector to the app element (e.g. mockup `.rcard` → `.recipe-card`); never copy mockup class names into the app. Raise selector specificity instead of using `!important` (the Low FX / reduced-motion animation kill-switch is the only `!important`).
4. **Typography (Cyberpunk only, in override files):** headings `var(--f-display)`, badges/tags/tiny labels `var(--f-label)`, numbers (kcal, macros, counts, dates) `var(--f-num)`, everything else `var(--f-body)`.
5. **Touch and focus (both themes):** keep `min-height/min-width: 44px` on interactive elements; hover rules inside `@media (hover: hover)`; focus via `:focus-visible { outline: 2px solid var(--focus-ring-color); outline-offset: 2px }`.
6. **Don't touch JSX** unless the task's `**Files:**` block lists it.
7. **Verify each component CSS file** with the task's grep. Pattern (PowerShell `Select-String`, .NET regex):
   `#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])`
   Zero hits required. `src/styles/themes/**` is exempt (that is where colours live).

---

## File map

**Created:**
- `foodbytes-app/client/src/styles/themes/default.css`, `cyberpunk.css`, `previews.css`, `cyberpunk/index.css`, `cyberpunk/shell.css`, `cyberpunk/recipes.css`, `cyberpunk/mealplan.css`, `cyberpunk/recipe-view.css`, `cyberpunk/shopping.css`, `cyberpunk/dialogs.css`
- `foodbytes-app/client/src/constants/themes.js`, `constants/pixelIcons.js`
- `foodbytes-app/client/src/utils/theme.js`, `utils/lowFx.js`
- `foodbytes-app/client/src/contexts/ThemeContext.jsx`
- `foodbytes-app/client/src/components/layout/UserMenu.jsx` + `.css`, `ThemePicker.jsx` + `.css`, `LowFxControl.jsx`, `HeaderBrand.jsx`, `Ticker.jsx` + `.css`
- `foodbytes-app/client/src/components/common/PixelBrandMark.jsx`, `PixelIcon.jsx` + `.css`
- `foodbytes-app/client/scripts/check-themes.mjs`

**Modified:** `index.html` (boot script only), `package.json` (script + version), `src/main.jsx`, `src/App.jsx`, `src/styles/global.css`, `src/constants/appRoutes.js`, `src/hooks/useDocumentTitle.js`, `components/layout/Header.jsx` + `Header.css`, `Footer.css`, `AppNavItems.jsx`, `DefaultPortionsControl.css`, `MealTimesControl.css`, `VersionInfo.css`, `components/common/ExtrasIcons.jsx`, `components/auth/LoginModal.jsx` + `.css`, `components/pet/PetView.css` (containment only), ~45 component CSS files swept per area, `foodbytes-api/pom.xml`, `CHANGELOG.md`, `CLAUDE.md`, `foodbytes-app/mockup/*` (only if implementation diverged).

**Unchanged by decision:** `public/favicon.svg`, `public/icons/*`, `public/manifest.webmanifest`, `components/common/BrandMark.jsx`, the `index.html` title, icons and Apple meta.

**Deleted:** none.

---

## Phase 1 — Theme foundations

Adds the token files, registry, context, boot path, Pip containment and the theme check. Default must look exactly as before at the end of this phase (only token locations moved). No Cyberpunk visuals yet beyond the token remap; the app can be switched to Cyberpunk by hand (`document.documentElement.dataset.theme='cyberpunk'`) and will look half-done, which is expected.

### Task 1: Default token file ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/default.css`
- Modify: `foodbytes-app/client/src/styles/global.css`
- Modify: `foodbytes-app/client/src/main.jsx`

- [x] **Step 1: Move the colour tokens.** Cut every colour token from `global.css` `:root` (brand, neutral, semantic, the FR-104 macro set with its comments, `--pip-focus-ring`, `--pip-focus-ring-on-dark`, `--pip-focus-halo`, all `--aisle-*`) into `themes/default.css` under `:root { color-scheme: light; … }`, values and comments verbatim. Add `--focus-ring-color` with the value of the focus colour most used in `global.css` today.
- [x] **Step 2: Sweep `global.css`** per the sweep rules (exact Default values; new tokens into `default.css`). Keep spacing, radius, black shadows, `--footer-clearance`, `--pip-sheet-*`. Header comment: `/* Global styles. Colours live in styles/themes/ — see CLAUDE.md → Themes. */`.
- [x] **Step 3: Import order in `main.jsx`:** `import './styles/themes/default.css'` immediately before `import './styles/global.css'`.
- [x] **Step 4: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\styles\global.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build`
  Expected: `built in <n>s`, no errors.

### Task 2: Cyberpunk token file and override bundle ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/index.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/shell.css` (empty scaffold with header comment)
- Modify: `foodbytes-app/client/src/main.jsx`

- [x] **Step 1: Write `cyberpunk.css`** with exactly the values in plan.md → Data shapes → `cyberpunk.css`: palette, card stops, fonts, glow (copied from `app-mockup.html` `:root`), the remap of every Default token (including `--pip-*` left unchanged — Pip is contained), macro retune, `--aisle-*` retuned to ≥3:1 on `--paper`, and the `body.lowfx` block. All under `:root[data-theme="cyberpunk"]`.
- [x] **Step 2: Write `cyberpunk/index.css`** with `@import './shell.css';` (later phases append their files) and a comment explaining the `:root[data-theme="cyberpunk"]` prefix rule.
- [x] **Step 3: Import in `main.jsx`:** `import './styles/themes/cyberpunk.css'` after `default.css`; `import './styles/themes/cyberpunk/index.css'` on the line **after** `import App from './App.jsx'`.
- [x] **Step 4: Build.**
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

### Task 3: Theme registry and helpers ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/constants/themes.js`
- Create: `foodbytes-app/client/src/utils/theme.js`
- Create: `foodbytes-app/client/src/utils/lowFx.js`

- [x] **Step 1: Write `constants/themes.js`** exactly as plan.md → Data shapes.
- [x] **Step 2: Write `utils/theme.js`:**

```js
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, themeById } from '../constants/themes'

export function readThemeId() {
  try { return themeById(localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID).id } catch { return DEFAULT_THEME_ID }
}

export function applyTheme(id) {
  const theme = themeById(id)
  const root = document.documentElement
  if (theme.id === DEFAULT_THEME_ID) delete root.dataset.theme
  else root.dataset.theme = theme.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.themeColor)
  if (theme.fontsHref && !document.querySelector(`link[data-theme-fonts="${theme.id}"]`)) {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: theme.fontsHref })
    link.dataset.themeFonts = theme.id
    document.head.appendChild(link)
  }
  try { localStorage.setItem(THEME_STORAGE_KEY, theme.id) } catch { /* storage blocked: theme still applies this session */ }
}
```

- [x] **Step 3: Write `utils/lowFx.js`:**

```js
import { LOW_FX_STORAGE_KEY, LOW_FX_BODY_CLASS } from '../constants/themes'

export function readLowFx() {
  try { return localStorage.getItem(LOW_FX_STORAGE_KEY) === '1' } catch { return false }
}

export function applyLowFx(on) {
  document.body.classList.toggle(LOW_FX_BODY_CLASS, on)
  try { localStorage.setItem(LOW_FX_STORAGE_KEY, on ? '1' : '0') } catch { /* storage blocked */ }
}
```

- [x] **Step 4: Smoke-check the registry.**
  Run: `cd foodbytes-app\client; node --input-type=module -e "import {THEMES,themeById} from './src/constants/themes.js'; console.log(THEMES.map(t=>t.id).join(','), themeById('nope').id)"`
  Expected: `default,cyberpunk default`

### Task 4: ThemeContext and boot ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/contexts/ThemeContext.jsx`
- Modify: `foodbytes-app/client/src/main.jsx`
- Modify: `foodbytes-app/client/index.html` (boot script only)

- [x] **Step 1: Write `ThemeContext.jsx`** following the existing context files' shape: `ThemeProvider` holds `themeId` (init `readThemeId()`) and `lowFx` (init `readLowFx()`); `setTheme(id)` calls `applyTheme(id)` then sets state; `toggleLowFx()` calls `applyLowFx(!lowFx)` then sets state; value memoised `{ themeId, theme: themeById(themeId), setTheme, lowFx, toggleLowFx }`; `useTheme()` throws outside the provider like the other contexts.
- [x] **Step 2: Boot in `main.jsx`:** after the imports, before `ReactDOM.createRoot`: `applyTheme(readThemeId())` and `applyLowFx(readLowFx())`. Wrap `<BrowserRouter>` in `<ThemeProvider>` (outermost).
- [x] **Step 3: Inline boot script in `index.html`**, in `<head>` after the `theme-color` meta, exactly the script in plan.md → Modified contracts. Change nothing else in `index.html`.
- [x] **Step 4: Build.**
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

### Task 5: Keep Pip's room on the Default palette ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.css` (prepend only)

- [x] **Step 1: Prepend the containment block:**

```css
/* Themes: Pip's room keeps its own palette in every theme (decision 4, CLAUDE.md → Themes). */
.pet-view {
  --brand-primary: #4a3f80; --brand-primary-dark: #3a3266; --brand-primary-light: #6b5fa0;
  --text-primary: #2c3e50; --text-secondary: #6c757d;
  --bg-primary: #ffffff; --bg-secondary: #f8f9fa; --border-color: #e9ecef;
  --success: #28a745; --warning: #ffc107; --error: #dc3545;
  --focus-ring-color: <the Default value from Task 1>;
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
}
```

  Use the exact Default values from `default.css`; if Task 1 changed none of these names, the list above is correct. `PetView.css` is exempt from the literal grep (it is Pip, out of scope).
- [x] **Step 2: Confirm no room portal escapes the containment.**
  Run: `Get-ChildItem foodbytes-app\client\src\components\pet -Recurse -Include *.jsx | Select-String -Pattern "createPortal"`
  Expected: zero hits. If any, add each portal root class to the `.pet-view` selector list.

### Task 6: Theme check script ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/scripts/check-themes.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the script** (shape of `scripts/check-version.mjs`):
  - Parse `src/styles/themes/default.css` into a token map (`--name: value`). For each non-default theme, parse `src/styles/themes/<id>.css` and layer it over the Default map. Resolve `var(--x)` one level deep; only `#hex` values are checked.
  - WCAG contrast (sRGB → linear, `L = .2126R + .7152G + .0722B`, `(L1+.05)/(L2+.05)`).
  - `PAIRS.default`: `text-primary` and `text-secondary` on `bg-primary` and `bg-secondary` (4.5); white-equivalent `--on-brand` on `brand-primary` (4.5). If a Default pair fails, **report it and stop** — Default values are not retuned in this contract; the developer decides.
  - `PAIRS.cyberpunk`: ink, muted, pink, cyan, yellow, lime, red on `panel` and on `raised` (4.5); ink, muted, pink, yellow on both `card-teal-*` stops (4.5); ink, muted, yellow on both `card-plan-*` stops (4.5); `void` on pink, cyan, yellow, lime, orange, red (4.5); `paper-ink` on `paper` (4.5); `line` on `panel` (3.0); every `aisle-*` on `paper` (3.0).
  - Consistency: every `THEMES` id (import `src/constants/themes.js`) other than `default` has `src/styles/themes/<id>.css`; every id has a `.theme-preview--<id>` rule in `src/styles/themes/previews.css` (skip this check until Task 10 creates the file — treat a missing file as `MISSING previews.css` only once Task 10 is ticked; simplest: check only if the file exists); the `ids=[…]` array in `index.html` equals the `THEMES` ids in order.
  - An unknown token name in `PAIRS` is a failure (`MISSING --name in <theme>`).
  - Output `Themes OK: <n> themes, <m> contrast pairs`, else each `FAIL <fg> on <bg> (<theme>): <ratio> < <min>` / `MISSING …`, exit 1.
- [x] **Step 2: Add the npm script** `"check:themes": "node scripts/check-themes.mjs"`.
- [x] **Step 3: Run it.**
  Run: `cd foodbytes-app\client; npm run check:themes`
  Expected: `Themes OK: 2 themes, <m> contrast pairs`. On a Cyberpunk failure retune the Cyberpunk token, never the threshold.

---

## Phase 2 — User menu v2 and theme picker

Builds the new menu from `user-menu-themes.html` (style A) and makes the theme switchable from the UI. At the end of this phase Default users see the new menu (in Default styling) and can switch to a still-unfinished Cyberpunk.

### Task 7: ThemePicker and tile previews ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/ThemePicker.jsx`
- Create: `foodbytes-app/client/src/components/layout/ThemePicker.css`
- Create: `foodbytes-app/client/src/styles/themes/previews.css`
- Modify: `foodbytes-app/client/src/main.jsx` (import `previews.css` after `cyberpunk.css`)

- [x] **Step 1: Write `previews.css`** from `user-menu-themes.html` `.pv-default` and `.pv-cyber` rules, renamed `.theme-preview--default` / `.theme-preview--cyberpunk` (literal colours allowed: this file is artwork in the exempt folder). The preview markup is plain spans (`.theme-preview__bar`, `__dot`, `__line`, `__ticker`, `__cards`, `__card`).
- [x] **Step 2: Write `ThemePicker`.** `useTheme()`; `role="radiogroup" aria-label="Theme"`; a `button type="button" role="radio"` tile per `THEMES` entry: `aria-checked`, roving `tabIndex` (0 on the selected tile), preview span `aria-hidden`, label, tick `aria-hidden`. Arrow keys (←/↑ previous, →/↓ next, wrapping) call `setTheme` and focus the new tile (refs array).
- [x] **Step 3: Write `ThemePicker.css`** from the mockup `.tiles`/`.tile` rules using tokens only (2-column grid, selected tile border `var(--brand-primary)` in Default). Cyberpunk look of the tiles goes into `cyberpunk/shell.css` (cyan frame, square corners, `var(--box-cyan)`).
- [x] **Step 4: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\layout\ThemePicker.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

### Task 8: UserMenu and LowFxControl ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/UserMenu.jsx`
- Create: `foodbytes-app/client/src/components/layout/UserMenu.css`
- Create: `foodbytes-app/client/src/components/layout/LowFxControl.jsx`

- [x] **Step 1: Write `LowFxControl`** — row with `<span id="lowfx-label">Low FX<small>No glow, rain or flicker</small></span>` and `<button type="button" className="lowfx-switch" role="switch" aria-checked={lowFx} aria-labelledby="lowfx-label" onClick={toggleLowFx} />`.
- [x] **Step 2: Write `UserMenu`** per plan.md → Data shapes → `UserMenu.jsx`: who block, *Planning* (`DefaultPortionsControl`, `MealTimesControl`), *Appearance* (`ThemePicker`; `LowFxControl` when `theme.effects`; "Saved on this device"), Sign out button calling `onSignOut`, `VersionInfo` last (still mounts only while open — MPP-9). Section headings are `<h3>` with `id`s and each `<section aria-labelledby>`. Desktop vs mobile via `useMediaQuery('(max-width: 767px)')`; mobile uses `createPortal(…, document.body)`, scrim click closes, close button (`aria-label="Close account menu"`), `useBodyScrollLock(true)`, focus first focusable on open, return focus to `anchorRef` on close. Esc closes in both modes; outside-click closes on desktop (ignore clicks on the anchor). Keep the file under 200 lines; split a `UserMenuPanel` child if needed.
- [x] **Step 3: Write `UserMenu.css`** from `user-menu-themes.html` (`.umenu`, `.who`, `.sec`, `.row`, `.out`, `.ver`, `.scrim`, `.grab`, `.x`, `.lowfx-switch`), tokens only, Default look as in the mockup's Default theme. Desktop panel: `position:absolute; right:0; top:calc(100% + 8px); width:340px; max-width:calc(100vw - 24px); max-height:calc(100dvh - 88px); overflow:auto`. Mobile sheet: full width, `max-height:calc(100dvh - 24px)`, inner scroll with `overscroll-behavior: contain`, `padding-bottom: env(safe-area-inset-bottom)`. Keep today's dropdown z-index for the panel; the sheet and scrim use the existing modal band (≥1000) so they cover the footer.
- [x] **Step 4: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\layout\UserMenu.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

### Task 9: Header uses UserMenu; sweep the menu controls ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx`
- Modify: `foodbytes-app/client/src/components/layout/Header.css`
- Modify: `foodbytes-app/client/src/components/layout/DefaultPortionsControl.css`, `MealTimesControl.css`, `VersionInfo.css`

- [x] **Step 1: Header.jsx.** Replace the inline dropdown with `<UserMenu user={user} onSignOut={logout} onClose={() => setShowUserMenu(false)} anchorRef={avatarRef} />` rendered while `showUserMenu`. The avatar button gets `ref={avatarRef}`, keeps `aria-expanded`, `aria-haspopup="dialog"`, `aria-label="Account menu"`. Remove the now-unused `avatar` const and dropdown markup. The `.user-dropdown`-era CSS that UserMenu now owns is deleted from `Header.css`.
- [x] **Step 2: Sweep `Header.css` and the three control CSS files** per the sweep rules (Default-preserving).
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\layout\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits except `Footer.css` (Task 13).
  Run: `(Get-Content foodbytes-app\client\src\components\layout\Header.jsx | Measure-Object -Line).Lines`
  Expected: below 120.
  Run: `cd foodbytes-app\client; npm run build; npm run check:themes`
  Expected: build OK; `Themes OK: 2 themes, …`.

---

## Phase 3 — Cyberpunk brand and shell

Brand per theme, pixel icons, ticker and rain, and the Cyberpunk look of the app frame. Default is unchanged by this phase except for the swept files staying identical.

### Task 10: Brand per theme ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/common/PixelBrandMark.jsx`
- Create: `foodbytes-app/client/src/components/layout/HeaderBrand.jsx`
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx`
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.jsx` (copy source only)
- Modify: `foodbytes-app/client/src/constants/appRoutes.js`, `foodbytes-app/client/src/hooks/useDocumentTitle.js`

- [x] **Step 1: `PixelBrandMark`** — same props and a11y as `BrandMark`; `<svg viewBox="0 0 16 16" shapeRendering="crispEdges">` with a `#05070b` background rect and the mockup `LOGO` rects (cyan steam, yellow chopsticks, pink bowl, highlight `#ff8fb3`, shadow `#a3123f`) from a module-level `LOGO_PIXELS` array of `[color, x, y, w]`. Doc comment: Cyberpunk theme logo, approved 2026-11-14; the installed-app icons deliberately stay on the Default `BrandMark`.
- [x] **Step 2: `HeaderBrand`** per plan.md → Data shapes. It keeps today's `brand-btn` / `brand-mark` / `brand-word` classes for Default so Default renders exactly as now; Cyberpunk renders `.brand-sign` > `.brand-word` (with `.brand-flicker`) + `.brand-sub`. `title="Go to Recipes"` unchanged. Header.jsx renders `<HeaderBrand />` in place of the brand button.
- [x] **Step 3: LoginModal** heading and subtitle read `theme.brand.loginTitle` / `loginSub` via `useTheme()`. The Google button, its label and handler are unchanged.
- [x] **Step 4: Tab title.** `routeTitle(pathname, appName = APP_NAME)`; `useDocumentTitle` passes `useTheme().theme.brand.name` and depends on it.
- [x] **Step 5: Verify Default strings are intact.**
  Run: `Select-String -Path foodbytes-app\client\src\constants\themes.js -Pattern "My Pantry Plan"`
  Expected: at least one hit. And `npm run build` passes.

### Task 11: Pixel icons ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/constants/pixelIcons.js`
- Create: `foodbytes-app/client/src/components/common/PixelIcon.jsx`, `PixelIcon.css`
- Modify: `foodbytes-app/client/src/components/layout/AppNavItems.jsx`
- Modify: `foodbytes-app/client/src/components/common/ExtrasIcons.jsx` (`CartIcon` only)

- [x] **Step 1: `PIXEL_ICONS`** — `menu`, `cal`, `cart` grids verbatim from the mockup `ICO` block, `{ rows, accents }`; menu/cal accents `a: 'var(--pink)', b: 'var(--yellow)'`, cart `a: 'var(--cyan)', b: 'var(--pink)'`.
- [x] **Step 2: `PixelIcon({ name, size = 20, className })`** — run-lengths precomputed at module load (`RUNS`), same algorithm as the mockup `pxi()`; `<svg className={\`pixel-icon ${className ?? ''}\`} viewBox={\`-0.5 -0.5 ${w + 1} ${h + 1}\`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" focusable="false">`; `#` cells `fill="currentColor"`, accents `style={{ fill }}`.
- [x] **Step 3: `PixelIcon.css`** — `.pixel-icon { display:inline-block; flex:none; overflow:visible }`. The active-state drop-shadow goes in `cyberpunk/shell.css` (and off under `body.lowfx`).
- [x] **Step 4: Branch on `theme.iconSet`.** `AppNavItems`: keep `NAV_ICONS` for `'line'`; for `'pixel'` render `<PixelIcon name={NAV_ICON_NAMES[item.key]} size={24} />` with `NAV_ICON_NAMES = { recipes: 'menu', mealplan: 'cal', shopping: 'cart' }`. Pip keeps `PipHerb` in every theme. `CartIcon`: `'pixel'` → `<PixelIcon name="cart" size={14} className={className} />`, else today's SVG.
- [x] **Step 5: Smoke-check.**
  Run: `cd foodbytes-app\client; node --input-type=module -e "import {PIXEL_ICONS} from './src/constants/pixelIcons.js'; for (const [k,v] of Object.entries(PIXEL_ICONS)) console.log(k, v.rows.length, Math.max(...v.rows.map(r=>r.length)))"`
  Expected: `menu 13 15`, `cal 15 15`, `cart 13 15`.

### Task 12: Ticker, rain and the Cyberpunk shell ✓

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/Ticker.jsx`, `Ticker.css`
- Modify: `foodbytes-app/client/src/App.jsx`
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/shell.css`

- [x] **Step 1: Ticker** — `TICKER_ITEMS` verbatim from the mockup (`'NIGHT KITCHEN OPEN 24/7'`, `'SYNTH-RAMEN BACK ON THE BOARD'`, `'PLAN YOUR WEEK, SKIP THE QUEUE'`, `'HOMEMADE BEATS VAT-GROWN'`, `'SECTOR 9 CURFEW 03:00'`, `'TIP YOUR DELIVERY DRONE'`), two identical spans in `.ticker-track`, wrapper `aria-hidden="true"`. `Ticker.css` holds layout only (overflow clip, track keyframes) with tokens; its colours (`var(--yellow)` background, `var(--void)` text, `var(--f-num)`) are Cyberpunk tokens — the component only renders under Cyberpunk.
- [x] **Step 2: App.jsx** — `const { theme } = useTheme()`; `{theme.effects && <div className="city-rain" aria-hidden="true" />}` as the first child of `.app`; `{!pipMode && <><Header />{theme.ticker && <Ticker />}</>}`.
- [x] **Step 3: `cyberpunk/shell.css`** — from the mockup: `body` background `var(--void)`, font `var(--f-body)`, colour `var(--ink)`; `.app` `position:relative; isolation:isolate`; `.app::before` skyline (data-URI SVG copied from the mockup, `%23rrggbb`, `position:fixed; inset:auto 0 0 0; height:46vh; z-index:-2; pointer-events:none`); `.app::after` scanlines (`position:fixed; inset:0; z-index:-1; pointer-events:none`); `.city-rain` (mockup `.rain`, fixed, `z-index:-1`, `pointer-events:none`); `::placeholder`, inputs/selects/textareas on `var(--raised)` with `caret-color: var(--yellow)` and autofill override; theme tile look (Task 7); `.pixel-icon` active drop-shadow; `body.lowfx` hides `.app::before`, `.app::after`, `.city-rain`, kills animation; `@media (prefers-reduced-motion: reduce)` kills animation and transition. All selectors prefixed `:root[data-theme="cyberpunk"]`.
- [x] **Step 4: Build.**
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

### Task 13: Header, footer, toasts, login — sweep + Cyberpunk look ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Footer.css`
- Modify: `foodbytes-app/client/src/components/common/Toast.css`, `UndoToast.css`
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.css`
- Modify: `foodbytes-app/client/src/components/layout/UserMenu.css` (none expected — only if sweep finds stragglers)
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/shell.css`

- [x] **Step 1: Sweep** `Footer.css`, `Toast.css`, `UndoToast.css`, `LoginModal.css` (Default-preserving).
- [x] **Step 2: Cyberpunk look in `shell.css`**, translating these mockup selectors:

| Mockup | App |
|---|---|
| `.hdr` | `.header` |
| `.brand`, `.sign`, `.w`, `.fl`, `.sub` | `.brand-btn`, `.brand-sign`, `.brand-word`, `.brand-flicker`, `.brand-sub` (flicker off under `body.lowfx`) |
| `.hnav` buttons | `.header-nav`, `.header-btn` |
| `.wk` | `.header-week` and the date pill inside it (full picker restyle is Task 23) |
| `.av` | `.avatar-btn`, `.avatar-placeholder` |
| `.amenu`, `.who`, `.sec`, `h5`, `.switch`, `.out`, `.ver` | `UserMenu` classes, `.lowfx-switch` (lit lime when `aria-checked="true"`), mobile sheet (`[X]` close, 2px cyan top border) |
| `.bnav` | footer nav: black bar, 2px pink top border + glow, `var(--f-label)` uppercase, active tab yellow with inset top bar, ≥48px targets, safe-area padding kept |
| `.toast` | toasts: `var(--raised)`, cyan left border, `var(--f-num)`; Undo yellow with `var(--void)` |
| login `.dlg` + `.bar-t` | `DOOR://SIGN IN` terminal (title bar via `::before`), bottom sheet on mobile, capped `calc(100dvh - 24px)` with internal scroll |

- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\layout\*.css,foodbytes-app\client\src\components\common\Toast.css,foodbytes-app\client\src\components\common\UndoToast.css,foodbytes-app\client\src\components\auth\LoginModal.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build; npm run check:themes`
  Expected: both pass.

---

## Phase 4 — Recipes: the menu board (Cyberpunk)

### Task 14: Recipe cards ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.css`, `RecipeList.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css` (+ `@import` line in `cyberpunk/index.css`)

- [x] **Step 1: Sweep** `RecipeCard.css`, `RecipeList.css` (Default-preserving). `.meal-tabs` keeps its current z-index.
- [x] **Step 2: Cyberpunk cards in `recipes.css`** from the mockup `.rcard` + `v-cards` block: teal gradient (`--card-teal-top/bottom`), `1px solid rgba(5,217,232,.5)` → token, 3px cyan top border, HUD brackets via `::before` (mockup `.hud::before`), `.is-in-plan` plan stops + pink borders + `var(--box-pink)`, `.is-hidden` `var(--deep)`, `body.lowfx` box-shadow `0 0 0 1px var(--black)`; numbering `.recipe-grid { counter-reset: menu-item }` + `.recipe-card-top::before { counter-increment: menu-item; content: counter(menu-item, decimal-leading-zero); font-family: var(--f-num); color: var(--pink) }`; name `var(--f-body)` 600 ink; kcal yellow VT323 "price"; variant segment from `.vseg` (active cyan, `var(--void)` text); dotted rule under `.recipe-card-top` cyan 45%.
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeCard.css,foodbytes-app\client\src\components\recipes\RecipeList.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

### Task 15: Toolbar, day buttons, macro chips, popups ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeToolbar.css`, `DayAssignmentButtons.css`, `MacroTargetPopup.css`, `ExtrasSelectionPopup.css`
- Modify: `foodbytes-app/client/src/components/common/MacroChips.css`
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css`

- [x] **Step 1: Sweep** the five files (Default-preserving).
- [x] **Step 2: Cyberpunk look in `recipes.css`:** `.rtool`/`.mtabs` → meal tabs (active pink, `var(--void)` text), search, Hidden filter; `.strip`/`.days` → day buttons (hazard stripes unplanned, lime check planned); `.chip` → macro chips (bordered, `var(--f-num)`, macro token colours); `.pop` → both popups (cyan frame).
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeToolbar.css,foodbytes-app\client\src\components\recipes\DayAssignmentButtons.css,foodbytes-app\client\src\components\recipes\MacroTargetPopup.css,foodbytes-app\client\src\components\recipes\ExtrasSelectionPopup.css,foodbytes-app\client\src\components\common\MacroChips.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

---

## Phase 5 — Meal Plan: the order board (Cyberpunk)

### Task 16: Timetable, mobile day view, meal cards ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanWeekDesktop.css`, `MealPlanWeekMobile.css`, `MealCard.css`, `WeekSummary.css`, `MealPlanCalendar.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/mealplan.css` (+ `@import` in `cyberpunk/index.css`)

- [x] **Step 1: Sweep** the five files (Default-preserving).
- [x] **Step 2: Cyberpunk look in `mealplan.css`:** day headers yellow `var(--f-num)` LED, today framed cyan + glow; meal cards from `.mcard` (`var(--panel)`, 4px cyan left edge, `var(--f-num)` kcal, eaten tick lime with the ✓ kept); mobile day chips pink when active; swipe panels from `.sw-act` (Replace cyan, Move yellow, Remove red, `var(--void)` text); swipe hint yellow hazard; week summary tile `.hud`.
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\mealplan\MealPlanWeekDesktop.css,foodbytes-app\client\src\components\mealplan\MealPlanWeekMobile.css,foodbytes-app\client\src\components\mealplan\MealCard.css,foodbytes-app\client\src\components\mealplan\WeekSummary.css,foodbytes-app\client\src\components\mealplan\MealPlanCalendar.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

### Task 17: Meal-plan menus, sheets and modals ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanSheet.css`, `MealPlanMenu.css`, `MealEntryMenu.css`, `DailyMacroPopup.css`, `WeeklyMacroPopup.css`, `SwapDaysModal.css`, `CopyWeekModal.css`, `TemplateModals.css`, `ManageExtrasModal.css`
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/mealplan.css`

- [x] **Step 1: Sweep** the nine files (Default-preserving).
- [x] **Step 2: Cyberpunk look in `mealplan.css`** as terminal windows (mockup `.dlg`): 2px cyan frame, `.bar-t`-style header strip in `var(--f-label)`; menus use `.pop`; scrims `rgba(2,3,5,.75)` (as a Cyberpunk token); macro pills use the retuned `-pill-*` tokens. Do not change sheet heights, scrolling or z-index — only colour, border, font and glow.
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\mealplan\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

---

## Phase 6 — Recipe view: the kitchen terminal (Cyberpunk)

CSS only. `RecipeViewModal.jsx` is not touched. Build on whatever the working tree holds in these files (the developer had uncommitted recipe-view work on 2026-11-15); never revert it.

### Task 18: Recipe view, full-screen ingredients, cook mode ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.css`, `IngredientsFullscreen.css`, `CookMode.css`, `MealEatenSection.css`, `LinkedRecipeNavigation.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/recipe-view.css` (+ `@import` in `cyberpunk/index.css`)

- [x] **Step 1: Sweep** the five files (Default-preserving). Keep the `.recipe-view-modal` prefixes.
- [x] **Step 2: Cyberpunk look in `recipe-view.css`:**

| Mockup | App |
|---|---|
| `.dlg.rv`, `.rv-hd`, `.rv-ctl`, `.rv-tabs`, `.ilist`, `.steps`, `.cookbtn`, `.eatbtn` | modal frame, header gradient, variant segment + servings stepper, tabs (active cyan underline), ingredient rows with square tick boxes (ticked lime, struck, still ≥4.5:1), numbered steps `var(--f-num)`, cook button pink, eaten button lime |
| `.ifull` | full-screen ingredients (progress bar lime, "All out" lime) |
| `.cook` | cook mode: full-screen terminal, step text `var(--f-body)` ≥22px, Next yellow with `var(--void)` |

- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeViewModal.css,foodbytes-app\client\src\components\recipes\IngredientsFullscreen.css,foodbytes-app\client\src\components\recipes\CookMode.css,foodbytes-app\client\src\components\recipes\MealEatenSection.css,foodbytes-app\client\src\components\recipes\LinkedRecipeNavigation.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build`
  Expected: no errors.

---

## Phase 7 — Shopping: the supply-run receipt (Cyberpunk)

### Task 19: Receipt and shopping popups ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/ShoppingList.css`, `IngredientBreakdownPopup.css`, `GenerateShoppingListModal.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/shopping.css` (+ `@import` in `cyberpunk/index.css`)

- [x] **Step 1: Sweep** the three files (Default-preserving).
- [x] **Step 2: Cyberpunk receipt in `shopping.css`:** aisle groups `background: var(--paper); color: var(--paper-ink)` with the mockup zigzag `mask` edges; every descendant text colour inside the receipt set explicitly to `--paper-ink` / `--paper-muted` / `--paper-struck`, never inherited; ticked rows struck, ≥4.5:1 (reduced weight, no opacity below 0.75); aisle swatches `var(--aisle-*)`; progress tile and stale banner from `.prog` and hazard `.stale`; the two popups as terminal windows (as Task 17).
- [x] **Step 3: Verify.**
  Run: `Select-String -Path foodbytes-app\client\src\components\shopping\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

---

## Phase 8 — Shared dialogs, landing and admin

### Task 20: Shared dialogs and controls ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/common/ConfirmDialog.css`, `DateRangePicker.css`, `PullToDismissUI.css`, `LockEmojiAnimation.css`
- Create: `foodbytes-app/client/src/styles/themes/cyberpunk/dialogs.css` (+ `@import` in `cyberpunk/index.css`)

- [x] **Step 1: Sweep** the four files (Default-preserving).
- [x] **Step 2: Cyberpunk look in `dialogs.css`:** confirm dialog as a `SYS://CONFIRM` terminal, destructive button red with `var(--void)`; date-picker trigger as a cyan HUD frame with yellow `var(--f-num)` dates, calendar popover `var(--raised)`, native date inputs `color-scheme: dark`.
- [x] **Step 3: Verify.**
  Run: `Get-ChildItem foodbytes-app\client\src\components\common -Include *.css -Recurse | Select-String -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.

### Task 21: Landing animation and admin forms (tokens only) ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/onboarding/LandingPageAnimation.css`
- Modify: `foodbytes-app/client/src/components/admin/RecipeEditModal.css`, `RecipeIngredientsForm.css`, `RecipeStepsForm.css`, `RecipeInfoForm.css`

- [x] **Step 1: Sweep** (Default-preserving). No override file and no layout change; under Cyberpunk these screens simply pick up the remapped tokens.
- [x] **Step 2: Verify.**
  Run: `Get-ChildItem foodbytes-app\client\src\components\onboarding,foodbytes-app\client\src\components\admin -Include *.css -Recurse | Select-String -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
  Run: `cd foodbytes-app\client; npm run build; npm run check:themes`
  Expected: both pass.

---

## Phase 9 — Docs, mockups and final verification

### Task 22: Finalise CLAUDE.md and the mockups ✓

- Skill: none — documentation

**Files:**
- Modify: `CLAUDE.md` (*Themes* section)
- Modify: `foodbytes-app/mockup/README.md`, `foodbytes-app/mockup/app-mockup.html`, `foodbytes-app/mockup/user-menu-themes.html` (only where the implementation diverged)

- [x] **Step 1: Update CLAUDE.md → Themes** so it describes what shipped, not the plan: the file layout (`styles/themes/default.css`, `<id>.css`, `<id>/` overrides, `previews.css`), the registry fields, `ThemeContext`, storage keys, the boot script, the Default-preserving sweep rule, the `:root[data-theme="<id>"]` prefix rule, Pip containment, static assets staying on Default, `npm run check:themes`, and the **add-a-theme checklist**. Remove the "being built" status line.
- [x] **Step 2: Mockup sync.** Compare the implemented user menu, header and each Cyberpunk screen against `app-mockup.html` / `user-menu-themes.html`. Where the app intentionally differs, update the mockup to match the app. Note any change in `foodbytes-app/mockup/README.md`.

### Task 23: Bump version and CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump MINOR, reset PATCH** in both manifests (read the current version from `package.json`).
- [x] **Step 2: Prepend** `<new version> — 2026-11-14-cyberpunk-reskin: theme system + user menu v2 with theme picker; Cyberpunk (FOODBYTES Night Kitchen) theme, Low FX switch`
- [x] **Step 3: Verify.**
  Run: `cd foodbytes-app\client; npm run check:version`
  Expected: `Version OK: <new version>`

### Task 24: Greps ✓

- Skill: none — verification only

- [x] **Step 1: No literal colours outside the theme folder and Pip.**
  Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.css | Where-Object { $_.FullName -notmatch '\\components\\pet\\' -and $_.FullName -notmatch '\\styles\\themes\\' } | Select-String -Pattern "#[0-9a-fA-F]{3,8}\b|\bwhite\b(?!-)|rgba?\((?!\s*0\s*,\s*0\s*,\s*0\s*[,)])"`
  Expected: zero hits.
- [x] **Step 2: Every Cyberpunk override selector is scoped.**
  Run: `Get-ChildItem foodbytes-app\client\src\styles\themes\cyberpunk -Include *.css -Recurse | Select-String -Pattern "^\s*[^\s@/*:}][^{]*\{" | Where-Object { $_.Line -notmatch ':root\[data-theme="cyberpunk"\]' -and $_.Line -notmatch '^\s*(from|to|\d+%)' }`
  Expected: zero hits.
- [x] **Step 3: Static brand assets untouched.**
  Run: `git diff --stat -- foodbytes-app/client/public foodbytes-app/client/src/components/common/BrandMark.jsx`
  Expected: no output.
- [x] **Step 4: No console logging added.**
  Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
  Expected: no higher than the 6 baseline.

### Task 25: Theme check, backend suite, production build ✓

- Skill: none — verification only

- [x] **Step 1:** Run: `cd foodbytes-app\client; npm run check:themes` → Expected: `Themes OK: 2 themes, <m> contrast pairs`
- [x] **Step 2:** Run: `cd foodbytes-app\foodbytes-api; mvn test` → Expected: `BUILD SUCCESS`, 0 failures, 0 errors (guards the version bump only).
- [x] **Step 3:** Run: `cd foodbytes-app\client; npm run build` → Expected: `built in <n>s`, no errors.

### Task 26: Manual visual checklist and PR description ✓

- Skill: none — the developer verifies; the implementer writes the checklist

**Files:**
- Create: `.claude/contract/2026-11-14-cyberpunk-reskin/pr-description.md`

- [x] **Step 1: Write `pr-description.md`:** link to `plan.md`, summary, new version, "no migrations, no backend changes", suggested commit subject `themes: theme system, user menu v2, Cyberpunk theme`, a contributor note (colours live only in `src/styles/themes/`, `npm run check:themes` guards pairs and registry, mockups in `foodbytes-app/mockup/` must stay in step — CLAUDE.md), and this **MANUAL VERIFICATION** checklist (run with `npm run dev`, at 320, 390, 768 and 1280px):
  1. **Default fidelity:** with Default selected, every route (`/`, `/mealplan`, a recipe, cook mode, `/shopping`, login, landing) looks identical to production. Only the user menu is new.
  2. **User menu (both themes):** desktop dropdown opens under the avatar, closes on outside click and Esc; mobile opens as a bottom sheet over the footer, scrolls inside, closes via `[X]`/`✕`, scrim and Esc, focus returns to the avatar. Servings, meal times, sign out and version line still work.
  3. **Theme picker:** tiles switch instantly; arrow keys move the selection; the choice survives a reload; the status-bar colour changes on a phone; a fresh browser starts on Default.
  4. **Cyberpunk `/`:** teal cards, pink in-plan cards, numbering 01…, yellow kcal, pixel nav icons, ticker, neon sign, no unreadable text.
  5. **Cyberpunk recipe view:** terminal modal (sheet on mobile), tabs, ticks, servings, ⤢ Expand, cook mode.
  6. **Cyberpunk `/mealplan`:** desktop LED headers and ⋯ menus above cards; mobile day chips, swipe Replace / Move / Remove, every sheet scrolls internally and stays clear of the keyboard.
  7. **Cyberpunk `/shopping`:** receipt readable, ticked items readable, breakdown popup, Generate.
  8. **`/pet` in both themes:** the room looks exactly as before.
  9. **Low FX** (Cyberpunk): glow, rain, scanlines, flicker and ticker scroll stop; persists on reload; the row is hidden under Default.
  10. **Reduced motion** (OS setting): no animations in either theme.
  11. **Focus ring** visible on header, a card, the menu tiles and a dialog in both themes.
  12. **Login:** Default shows "Welcome to My Pantry Plan"; Cyberpunk shows the `DOOR://SIGN IN` terminal with FOODBYTES; Google sign-in works.
  13. **Installed icon / favicon** still the Default plate-P in both themes.

---

## Self-review

**Spec coverage:**
- Theme architecture (token files, override bundle, registry, context, boot) — Tasks 1–4.
- Default-preserving sweep — every CSS task, rule 1; Task 24 Step 1.
- User menu v2 + picker + Low FX row — Tasks 7–9, 13.
- Brand per theme (header, login, tab title); static icons on Default — Tasks 10, 24 Step 3.
- Pixel icons, ticker, rain, shell — Tasks 11–13.
- Cyberpunk screens — Tasks 14–20; landing/admin tokens — Task 21.
- Pip containment — Task 5.
- `check:themes` — Tasks 6, 25.
- CLAUDE.md + mockups in step — Task 22.
- MINOR bump — Task 23.

**Placeholder scan:** none, except Task 5 Step 1's `--focus-ring-color` value, which is defined by Task 1 Step 1 and must be copied from there.

**Name consistency:** `THEMES`, `themeById`, `THEME_STORAGE_KEY`, `LOW_FX_STORAGE_KEY`, `LOW_FX_BODY_CLASS`, `DEFAULT_THEME_ID`, `readThemeId`, `applyTheme`, `readLowFx`, `applyLowFx`, `ThemeProvider`, `useTheme`, `setTheme`, `toggleLowFx`, `UserMenu`, `ThemePicker`, `LowFxControl`, `HeaderBrand`, `PixelBrandMark`, `PIXEL_ICONS`, `PixelIcon`, `NAV_ICON_NAMES`, `TICKER_ITEMS`; classes `.theme-preview--<id>`, `.lowfx-switch`, `.city-rain`, `.ticker`, `.ticker-track`, `.pixel-icon`, `.brand-sign`, `.brand-word`, `.brand-flicker`, `.brand-sub`; tokens `--focus-ring-color`, `--card-teal-*`, `--card-plan-*`, `--paper*`, `--black`; script `check:themes`.

**Phase boundary cleanliness:**
- Phase 1 ends green with Default unchanged (tokens moved, not changed).
- Phase 2 ends green with the new menu working in Default and the theme switchable.
- Phase 3 ends green with the Cyberpunk frame complete (Ticker, rain and icons mounted in the tasks that create them).
- Phases 4–8 are CSS-only per area plus one override file each; each ends green with zero literals in its files.
- Phase 9 changes docs, mockups (only if diverged) and the version.

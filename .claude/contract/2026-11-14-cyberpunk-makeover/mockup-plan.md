# Cyberpunk makeover: mockup plan

**Status:** PLANNED (mockup only, no app code)
**Mockup file:** `C:\Users\jossd\Downloads\cyberpunk-makeover-mockup.html` (a copy of the meal-plan redesign `prototype.html`, unchanged so far)
**Brief:** Reskin the whole site as the website of a pixel-art restaurant in a cyberpunk city. Every function and UX flow stays the same. Logo, colours, type and icons can all change. Nothing may break: no unreadable text, no popups that fail on mobile.

---

## 1. Concept

**The restaurant:** `FOODBYTES // Night Kitchen, Sector 9`. This is the app's original name, which suits the setting, and the site is the restaurant's own ordering and kitchen system. Other names: `NEON PANTRY`, `PANTRY.EXE`, or keep `My Pantry Plan` and restyle it. **(Decision 1)**

**The metaphor, applied by screen.** Labels that do a job stay plain ("Meal Plan", "Shopping", "Add to Sat"). The flavour goes into headings, subtitles and decoration, so nobody has to translate the UI.

| Screen | In-world look | Stays the same |
|---|---|---|
| Header + nav | Neon shop sign: a flickering pixel logo over a dark awning, with nav as lit sign tabs | Route buttons, week arrows, the date picker, This week, the account menu |
| Recipes | **The menu board.** Meal tabs are menu sections (`// BREAKFAST`). Each card is a menu item with kcal shown like a price on a dotted leader: `Tomato Beef Curry ........ 610 KCAL`. The variant segment reads as portion sizes, still labelled Light / Moderate / Balanced | Tabs, search, Hidden filter, the week strip, card actions, picking mode |
| Meal Plan (desktop) | **Kitchen order board**, like a departures board: day columns with split-flap style day headers, and a meal card is an order ticket | Timetable, drag, ⋯ menus, swap days, ticks, macro totals |
| Meal Plan (mobile) | Day chips styled as a neon ticker strip. Meal cards are order tickets, and swipe actions show as coloured hazard panels | Day chips, swipe Replace / Move / Remove, the first-run hint, sheets |
| Recipe view | **Kitchen terminal (KDS).** The header is a HUD with macro chips as stat bars. Steps are a numbered command list, and cook mode is a full-screen terminal | Variant switch, servings, tabs, extras toggle, cook mode, eaten tick, Expand ingredients |
| Shopping | **Supply run receipt:** a thermal-paper strip (light paper, dark ink, torn edge) on the dark city background. Aisle groups are receipt sections | Generate, stale warning, ticks, Hide ticked, breakdown ⓘ, uncheck all |
| Dialogs and sheets | Terminal windows: a title bar with `[X]`, chamfered corners, scanlines | Every dialog's content and buttons |
| Toast | System message line: `> SAVED. [UNDO]` | Timing, Undo |
| Sign-in | Neon door sign with "Sign in with Google" as the entry keypad button | The Google flow |
| Pip | Only the outer shell is restyled; the room art is out of scope **(Decision 4)** | Everything |

## 2. Design system (the mockup's `:root`)

### Colour tokens (contrast checked)

Dark only. The site sets `color-scheme: dark` so native controls (date picker, number spinners, scrollbars) also come out dark.

**Revised 2026-11-14 after review: no purple.** Black-blue streets with hot pink, cyan and yellow neon. The mockup's `:root` is the source of truth.

| Token | Value | Use |
|---|---|---|
| `--void` | `#05070b` | Page background, and text on neon fills |
| `--panel` | `#0b1119` | Cards, header, sheets |
| `--raised` | `#141d2b` | Popovers, inputs |
| `--ink` | `#eaf6ff` | Body text |
| `--muted` | `#9db2c7` | Secondary text |
| `--pink` | `#ff2a6d` | Brand sign, primary actions, selected tab |
| `--cyan` | `#05d9e8` | HUD frames, selected variant, links |
| `--yellow` | `#f9f002` | kcal "prices", LED numbers, ticker, focus ring |
| `--lime` | `#39ff88` | Eaten, macros on target, progress |
| `--orange` | `#ff9f1c` | Cheat badge, store-bought cart, empty days |
| `--red` | `#ff4d5e` | Remove, errors, macros over |
| `--line` | `#4a7d99` | Borders |
| Receipt paper / ink | `#f4f1e8` / `#16141c` | Shopping receipt only |

Measured WCAG contrast ratios (AA needs 4.5 for text and 3 for UI edges):
- On `--panel`: ink 17.3, muted 8.7, pink 5.2, cyan 10.9, yellow 15.8, lime 14.3, red 5.8.
- On `--raised`, pink is the lowest at 4.7, which still passes.
- `--void` text on every neon fill reaches 5.6 or better.
- Receipt ink on paper reaches 16.2, and struck-through items reach 5.9.
- `--line` reaches 4.2 on panel.
- The mockup's Audit contrast button found no failures on any screen tested: Recipes, Meal Plan, Shopping, the recipe view and the account menu, in both web and mobile.

**Rules that stop the "white on white" class of bug:**
1. No hex colours outside `:root`. The copied file has about 75 hard-coded `#fff` / `white`, and every one becomes a token.
2. Text on a neon fill is always `--void`, never white.
3. Glow (`text-shadow`) is decoration only and never counts toward contrast. The colour underneath must pass on its own.
4. The receipt is the only light surface. It sets its own ink, so dark-theme text can't spill onto it.
5. Placeholders, disabled states and autofill get explicit token colours.

### Type
Pixel type is used for short text only. Guides agree pixel fonts get tiring past two or three lines, so anything you read at length uses a smooth font.
- **Display:** `Pixelify Sans` for the logo wordmark, screen titles, section headers and primary buttons. It has real weights (400–700), which most pixel fonts lack.
- **Small labels:** `Silkscreen` for badges, tags and chip labels (Cheat, Hidden, Stale, In plan), at 12px or 16px only. It was drawn for those sizes.
- **Numbers and HUD:** `VT323` for kcal "prices", macro values, counts and the clock, at 20px or larger. It's a monospaced VT100 terminal face, so columns of numbers line up.
- **Body:** `Space Grotesk` for recipe names, ingredients, steps and form text. It stays readable at 14–20px and in cook mode.
- `Press Start 2P` was considered and dropped. It's too wide for recipe names and hard to read below 16px.
- All four are on Google Fonts, which allows app use. The mockup loads them from Google Fonts. The real app must self-host them, because the PWA works offline.

### Pixel treatment
- Pixel-stepped borders made with layered `box-shadow`, and chamfered corners with `clip-path`, **on buttons, chips and cards only**. Never on anything that contains a popover or focus ring, because `clip-path` clips both.
- `shape-rendering: crispEdges` on SVG, and `image-rendering: pixelated` on any bitmap.
- A static scanline overlay on the page background with `pointer-events: none`. Flicker and glitch only on the logo and the section headers, with a long pause between runs.
- **Icons:** the emoji icons (📅 🛒 🌱 ☰ 🔍 ⋯ ✓ ⤢) become a small inline SVG sprite drawn on a 16×16 grid, so they look the same on every phone.
- **Logo:** a 16×16 pixel plate, with chopsticks forming an "F" and a neon-tube wordmark. One SVG serves the header, the sign-in screen and the favicon draft.

## 3. Safety checklist (gates the mockup)

| Risk | What the mockup does |
|---|---|
| Unreadable text | Tokens only. A dev-only **"Audit contrast"** button in the prototype chrome walks every visible text node, works out the real background behind it, and outlines anything under 4.5:1 in red with its ratio. It must report zero failures on every screen, in both modes |
| Popups failing on mobile | Every overlay renders at the app root, never inside a transformed, clipped or `overflow:hidden` parent. That was the recipe-view bug fixed earlier |
| Popups too tall or behind the keyboard | Dialogs become bottom sheets on mobile, with `max-height: calc(100dvh - 24px)`, internal scroll, safe-area padding and a sticky close button. One z-index scale: popover 40, nav 50, sheet 80, toast 90 |
| Tap targets | Everything tappable is at least 44×44, the pixel decoration included |
| Focus | 2px cyan outline with offset on every control. Clipped elements get an inset ring instead |
| Motion | `prefers-reduced-motion` turns off flicker, glitch, scanline drift, the sheet slide and the swipe-hint animation |
| Eye strain | A **Low FX** switch in the account menu removes scanlines and glow and swaps pixel headings for the body font. It's remembered per device. Glow is kept soft (one small blur radius, never stacked) |
| Colour-only meaning | Eaten keeps its ✓ shape, store-bought keeps the cart icon, and stale keeps its words. Macro chips keep their text |
| Hover-only info | Nothing important appears only on hover, because touch has no hover |
| Narrow screens | Checked at 320, 390, 768 and 1280px. No horizontal scroll, and long recipe names wrap or ellipsize. Pixel headings shrink a step under 360px |
| Native inputs | `color-scheme: dark`, styled number and date inputs, and the caret colour set |

## 4. Mockup build phases

1. **Foundations.** New `:root` tokens, fonts, body and scanline, the z-index scale, and focus and reduced-motion rules. Sweep every hard-coded colour into tokens. Add the Audit contrast button to the prototype chrome.
2. **Brand and shell.** Pixel logo, neon sign header, desktop nav, the mobile bottom nav as a lit console bar, the account menu as a terminal panel (with the Low FX switch), the toast, and the signed-out and sign-in screens.
3. **Recipes as the menu board.** Section tabs, search, the Hidden filter, the week strip, menu-item cards with kcal leaders, the portion segment, macro HUD chips and picking mode.
4. **Meal Plan as the order board.** Desktop timetable, mobile day view, swipe panels, the first-run hint, entry menus, and the move, swap and servings sheets.
5. **Recipe view as the kitchen terminal.** Replace the prototype's placeholder dialog with the real redesigned recipe view: header and HUD, Ingredients and Steps tabs, extras toggle, steps, cook mode, eaten tick, and the mobile **⤢ Expand ingredients** view. This also brings the prototype up to date with Phase 14 and today's change.
6. **Shopping as the supply run receipt.** Generate, stale banner, receipt list, ticks, Hide ticked, breakdown and uncheck all.
7. **Dialogs pass.** Restyle every remaining dialog as a terminal window: date, week sheet, macros, info, login.
8. **Verification.** Run Audit contrast on every screen in web and mobile. Walk every flow at 320, 390, 768 and 1280px. Turn on reduced motion. Tab through each screen with the keyboard. Record the results in the mockup's spec panel.

**JavaScript:** behaviour and state logic stay as they are. The changes are limited to markup and class names in the render functions, the new icon sprite, the logo, the ported recipe view (phase 5) and the audit tool.

## 5. Open decisions

1. **Name:** `FOODBYTES // Night Kitchen` (recommended), `NEON PANTRY`, `PANTRY.EXE`, or keep `My Pantry Plan`.
2. **How much in-world wording:** recommended is plain labels with flavour headings ("Shopping", subtitled "Supply run · Sector 9"). The other option is to rename the labels themselves ("Supply run").
3. **Pixel intensity:** recommended is pixel display type, chrome and icons with a smooth body font. The alternative is pixel everything, which is less readable in cook mode and the ingredient list.
4. **Pip:** restyle the shell only (recommended, and Pip already has its own art direction), or bring the room into the theme as well.

## 6. After the mockup is approved

Run `/fb-plan` for the real makeover:
- one global token sheet that replaces the colours in every component CSS file
- self-hosted fonts
- the SVG icon sprite
- new logo, favicon, PWA icons, `manifest.webmanifest` theme colour and `<meta name="theme-color">`
- a contrast regression check

It's a MINOR version bump. No backend or database changes.

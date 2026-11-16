# FoodBytes mockups

The design reference for the client UI. **Keep these files in step with the live app**: any change to the UI updates the mockup in the same ticket, so the next change always starts from a mockup that matches what users see. See `CLAUDE.md` → *Mockups*.

| File | What it shows |
|---|---|
| `app-mockup.html` | The full app as an interactive prototype (Recipes, Meal Plan desktop + mobile, recipe view, ingredients full screen, cook mode, Shopping, Pip, every dialog, the user menu). Draws the **Cyberpunk** theme. Deep links: `#mobile`, `#acct`, `#lowfx`, `#audit`, `#r=mealplan\|shopping\|pet`, `#dlg=recipe`, `#max`, `#cook`. |
| `parchment-theme.html` | The **Parchment** theme (Receipts, Ledger desktop + mobile, open-book recipe view, Provisions scroll, account menu with three tiles). Deep links: `#mobile`, `#r=mealplan\|shopping\|pet`, `#dlg=recipe`, `#acct`, `#lowfx`. |
| `pip-themed-lines.html` | Pip's three lines (herb, dragon for Parchment, robot for Cyberpunk), every form bare and in a full outfit, mini sizes on each theme's footer, wilted/asleep samples, the per-creature wardrobe (all 20 items drawn and named three ways, with animations that stop under Low FX and reduced motion), a live preview of the planned growth behaviour (theme switch, form from peak, bar labels, evolve bubbles, the `PetGrowthDTO` payload) and the geometry/fit table. Source of the dragon/robot geometry in `client/src/components/pet/dragon\|robot/*Forms.js`. Contract `2026-11-15-themed-pip-lines`, approved 2026-11-15. |
| `user-menu-themes.html` | The user menu and theme picker in Default and Cyberpunk (Parchment is a third tile that points to `parchment-theme.html`), web and mobile, with the three picker styles explored (A tiles was chosen). Query params: `?theme=`, `?mode=mobile`, `?pick=`. |
| `pip-room-dragon.html` | Pip's room as the dragon lair (Parchment): shell, 10 styles, 5 stations × 4 levels, all 55 decor items with lair names, effects, light ambience, Low FX / reduced-motion / hit-box toggles, thumbnails, names and fit tables. Built on the live room geometry. Source for contract 2 (engine, shell, stations) and contract 3 (dragon decor). Contract `2026-11-16-themed-pip-rooms-mockups`. Lair shell, stations and styles are live from v1.35.0 (MPP-45); the 55 lair decor drawings and names are live from v1.36.0 (MPP-46). |
| `pip-room-robot.html` | Pip's room as the robot workshop (Cyberpunk), with the same contents. Source for contracts 2 and 4. Workshop shell, stations and styles are live from v1.35.0 (MPP-45); the 55 workshop decor drawings and names are live from v1.37.0 (MPP-47). |
| `pip-room-chrome.html` | The room's UI (Shop, decor picker, Fridge, Trophy cabinet, Dress Pip, edit bar, head bar, check-in) in Default, Parchment and Cyberpunk at 375 / 1280 px, with the proposed `--pet-*` role-token table and contrast pairs. Source for contract 2's chrome token split. Live from v1.35.0 (MPP-45): the table uses the normalised token names (e.g. `--pet-divider-border`, `--pet-muted-text`), includes `--pet-gold-ring-shadow` and the per-theme `--pip-focus-ring`; the pin (Default palette for the Fridge interior, cabinet scene and Dress Pip stage) sits on `.pip-fridge-view, .pip-cabinet-view, .pip-wardrobe-preview`, not on `.pet-view` or the room SVG, and also sets `--pip-focus-ring: #7c5cd6` and `color: var(--text-primary)`. |

## Proposal in review: custom recipe folders (2026-11-16, Cyberpunk only)

`app-mockup.html` now draws **custom recipe folders** on the Recipes page. Not built yet; Default and Parchment follow once this is approved.
- **View switch:** a *☰ Menu / 📁 Folders* toggle in the page header. **Menu** is today's page unchanged (week strip, all recipes by meal, no folder chips; cards still have *Add to folder…* in ⋯). **Folders** is the folder browser. The choice is remembered per device (`fb.recipes.view`), default Menu. Tapping a folder chip or creating a folder switches to Folders.
- **Folders top level:** your folders as tiles, then *Not in a folder yet* (unfiled recipes only, so it doesn't repeat the menu).
- **Web:** a *My folders* tree beside the grid (All folders + nested folders, counts, ⋯ per folder, ＋ New folder). Opening a folder shows a breadcrumb header, subfolder tiles and only that folder's recipes; the meal tabs and search filter within it. Drag a recipe card onto a folder (sidebar or tile) to file it.
- **Mobile:** a *Folders ▾* bar above the tabs opens the tree as a sheet.
- **Rules (confirmed 2026-11-16):** folders are personal (not shared with a meal-plan partner); up to 3 levels deep; a recipe can sit in several folders (folder chips on each card in Folders view); names unique among siblings; deleting a folder never deletes recipes, and its subfolders move up a level (with undo). The week strip shows only in Menu view.
- **Dialogs:** new folder/subfolder, rename, move (blocks moves into itself or past max depth), delete, *Add to folder* (from a card's ⋯) and *Add recipes* (from inside a folder).
- Deep links: `#view=folders`, `#fold=f1`, `#fdlg=new|add|sheet` (combine with `#mobile`).

## Proposal in review: themed Pip rooms (2026-11-16)

- The rooms follow the creature (`theme.pipLine`): Default keeps the herb room, Parchment gets the dragon lair, Cyberpunk the robot workshop, and the room's UI chrome follows the app theme through `--pet-*` role tokens.
- Ids, spots, prices and ownership are shared, and each creature draws and names everything its own way.
- Live from v1.35.0 (MPP-45): the lair and workshop shells, stations and styles, with names per creature and the chrome tokens under their normalised names. The lair decor is live from v1.36.0 (MPP-46); the workshop decor is live from v1.37.0 (MPP-47).

## Known gap

`app-mockup.html` draws Cyberpunk, `parchment-theme.html` draws Parchment, and for the **Default** theme the live app itself is the reference until Default screens are added here. Picking Default or Parchment inside `app-mockup.html` shows a toast saying so.

## Workflow

1. Change the mockup first (open the file straight in a browser, no build step).
2. Get it reviewed.
3. Plan and implement against it (`/fb-plan`, `/fb-apply`).
4. If implementation diverges from the mockup for a good reason, update the mockup before the ticket closes.

History: the Cyberpunk mockup was approved 2026-11-14 (design rules: `.claude/contract/2026-11-14-cyberpunk-makeover/mockup-plan.md`); the user menu v2 + theme picker was approved 2026-11-15. Parchment theme approved 2026-11-15; shipped by `.claude/contract/2026-11-15-parchment-theme/`.

## Synced with the implementation (2026-11-15, contract `2026-11-14-cyberpunk-reskin`)

`app-mockup.html` was updated where the shipped Cyberpunk theme intentionally differs from the first approved mockup:
- Recipe view tabs (mobile) highlight in **cyan**, not pink.
- The **cook button** is pink with a cyan offset shadow in the label font (was yellow with pink).
- Recipe card day buttons: a planned day is a **lime** fill with a check (hazard stripes + orange pip remain for "slot taken by another recipe").
- Multi-variant recipe cards show kcal per variant in ink inside the segment; the yellow "price" kcal only appears on single-variant cards.
- The login dialog keeps the **Default plate-P mark** (static brand assets stay on Default); the live app also lifts it above the footer in Cyberpunk.

`user-menu-themes.html` needed no changes. Not mirrored here: Low FX kills only theme animations (rain, flicker, ticker) and glow, not spinners; the receipt zigzag is conic-gradient based in the app (a CSS-mask detail the mockup does not need).

## Synced with the implementation (2026-11-15, contract `2026-11-15-parchment-theme`)

`parchment-theme.html` shows the plain meal names (Breakfast / Lunch / Dinner / Snacks) and plain aisle names, as the live theme does. Meal and aisle renames were deferred; only the nav (Receipts / Ledger / Provisions) and page headings are themed.

## Synced with the implementation (2026-11-15, contract `2026-11-15-themed-pip-lines`)

No divergence: the shipped dragon and robot match the approved mockup. `pip-themed-lines.html` stays the source of the geometry, art, wardrobe drawings and item names (`WARDROBE_ITEM_LABELS`) in `client/src/components/pet/dragon|robot/` and `client/src/constants/pipWardrobe.js`.

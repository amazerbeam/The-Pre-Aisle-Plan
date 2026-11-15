# FoodBytes mockups

The design reference for the client UI. **Keep these files in step with the live app**: any change to the UI updates the mockup in the same ticket, so the next change always starts from a mockup that matches what users see. See `CLAUDE.md` → *Mockups*.

| File | What it shows |
|---|---|
| `app-mockup.html` | The full app as an interactive prototype (Recipes, Meal Plan desktop + mobile, recipe view, ingredients full screen, cook mode, Shopping, Pip, every dialog, the user menu). Draws the **Cyberpunk** theme. Deep links: `#mobile`, `#acct`, `#lowfx`, `#audit`, `#r=mealplan\|shopping\|pet`, `#dlg=recipe`, `#max`, `#cook`. |
| `parchment-theme.html` | The **Parchment** theme (Receipts, Ledger desktop + mobile, open-book recipe view, Provisions scroll, account menu with three tiles). Deep links: `#mobile`, `#r=mealplan\|shopping\|pet`, `#dlg=recipe`, `#acct`, `#lowfx`. |
| `user-menu-themes.html` | The user menu and theme picker in Default and Cyberpunk (Parchment is a third tile that points to `parchment-theme.html`), web and mobile, with the three picker styles explored (A tiles was chosen). Query params: `?theme=`, `?mode=mobile`, `?pick=`. |

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

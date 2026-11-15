# themes: theme system, user menu v2, Cyberpunk theme

Plan: [`plan.md`](./plan.md) (tasks in [`tasks.md`](./tasks.md))

**Suggested commit subject:** `themes: theme system, user menu v2, Cyberpunk theme`

## Summary

- A per-device **theme system**: every colour is a token (`client/src/styles/themes/default.css`), themes reassign tokens (`<id>.css`) and add theme-only looks (`<id>/`). A `THEMES` registry (`constants/themes.js`) + `ThemeContext` drive brand, icon set, ticker and effects; an inline boot script in `index.html` applies the saved theme before first paint.
- **User menu v2** (avatar dropdown on desktop, bottom sheet on mobile) with servings, meal times, the **theme picker** (tiles, keyboard arrows), the **Low FX** switch (Cyberpunk only) and the version line.
- **Cyberpunk theme** (FOODBYTES, Night Kitchen): pixel icons, ticker, neon sign, rain, terminal-style recipe view, receipt shopping list, login terminal. Low FX stops theme animations and glow (not spinners).
- Default is unchanged: the sweep moved every literal colour into a Default token with the exact same value. Pip's room keeps its own palette in every theme. Favicon, PWA icons, manifest and `index.html` title stay on Default.
- `npm run check:themes` guards WCAG AA contrast pairs per theme and registry / CSS / boot-list agreement.

**Version:** 1.30.0 to **1.31.0** (client `package.json`, API `pom.xml`, `CHANGELOG.md`).

**No migrations, no backend changes** (the `pom.xml` edit is the version bump only).

## Contributor note

- Colours live only in `client/src/styles/themes/` (Pip's `components/pet/` excepted). Component CSS reads tokens.
- Every selector under `styles/themes/<id>/` is prefixed `:root[data-theme="<id>"]`.
- `npm run check:themes` must stay green. Adding a theme: see `CLAUDE.md` -> *Themes* -> add-a-theme checklist.
- The mockups in `foodbytes-app/mockup/` must stay in step with the live app (`CLAUDE.md` -> *Mockups*). They were synced at the end of this change; see the mockup `README.md`.

## Known exception

`default|text-secondary|bg-secondary` is 4.45:1 (needs 4.5). It is the pre-existing Default look, accepted by the developer on 2026-11-15, and listed in the `KNOWN_EXCEPTIONS` map in `scripts/check-themes.mjs` (prints WARN, does not fail). To be fixed in its own ticket, since fixing it changes the Default look.

## Automated verification (implementer run)

- `npm run check:version` -> `Version OK: 1.31.0`
- `npm run check:themes` -> WARN for the known exception, `Themes OK: 2 themes, 56 contrast pairs`
- `npm run build` -> built, no errors
- `mvn test` -> `Tests run: 483, Failures: 0, Errors: 0`, `BUILD SUCCESS`

## MANUAL VERIFICATION

Run with `npm run dev`, at 320, 390, 768 and 1280px.

1. **Default fidelity:** with Default selected, every route (`/`, `/mealplan`, a recipe, cook mode, `/shopping`, login, landing) looks identical to production. Only the user menu is new.
2. **User menu (both themes):** desktop dropdown opens under the avatar, closes on outside click and Esc; mobile opens as a bottom sheet over the footer, scrolls inside, closes via `[X]`/`✕`, scrim and Esc, focus returns to the avatar. Servings, meal times, sign out and version line still work.
3. **Theme picker:** tiles switch instantly; arrow keys move the selection; the choice survives a reload; the status-bar colour changes on a phone; a fresh browser starts on Default.
4. **Cyberpunk `/`:** teal cards, pink in-plan cards, numbering 01..., yellow kcal, pixel nav icons, ticker, neon sign, no unreadable text.
5. **Cyberpunk recipe view:** terminal modal (sheet on mobile), tabs, ticks, servings, expand, cook mode.
6. **Cyberpunk `/mealplan`:** desktop LED headers and menus above cards; mobile day chips, swipe Replace / Move / Remove, every sheet scrolls internally and stays clear of the keyboard.
7. **Cyberpunk `/shopping`:** receipt readable, ticked items readable, breakdown popup, Generate.
8. **`/pet` in both themes:** the room looks exactly as before.
9. **Low FX** (Cyberpunk): glow, rain, scanlines, flicker and ticker scroll stop; persists on reload; the row is hidden under Default.
10. **Reduced motion** (OS setting): no animations in either theme.
11. **Focus ring** visible on header, a card, the menu tiles and a dialog in both themes.
12. **Login:** Default shows "Welcome to My Pantry Plan"; Cyberpunk shows the `DOOR://SIGN IN` terminal with FOODBYTES; Google sign-in works.
13. **Installed icon / favicon** still the Default plate-P in both themes.

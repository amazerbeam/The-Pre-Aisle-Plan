# Parchment theme: The Kitchen Grimoire (third selectable theme)

Plan: [plan.md](plan.md)

## Summary
- Adds **Parchment** ("The Kitchen Grimoire"): leather header and footer, gold quill crest, aged-paper pages, engraved icons, themed page headings and nav labels (Receipts / Ledger / Provisions).
- New registry pieces in `constants/themes.js`: `ambient` (background effect layer class, `'candlelight'` for Parchment), `copy` (themed nav and page copy) and `engraved` (`iconSet` value with `EngravedIcon` / `EngravedBrandMark`).
- Tokens in `styles/themes/parchment.css`; override bundle in `styles/themes/parchment/` (shell, recipes, mealplan, recipe-view, shopping, dialogs); picker tile in `previews.css`; id and `theme-color` (`#3b2415`) in the `index.html` boot script; `check-themes.mjs` extended.
- Default and Cyberpunk are unchanged (fall back to today's text when no `copy`).
- Docs: `CLAUDE.md` and mockup docs updated.

## Version
1.32.0 (MINOR). `package.json` and `pom.xml` agree; CHANGELOG line added.

## Deploy
No migration, no Railway step. The only backend file touched is the `pom.xml` version.

## Verification results
- `npm run check:version`: `Version OK: 1.32.0`
- `npm run check:themes`: Default WARN (known), then `Themes OK: 3 themes, 81 contrast pairs`
- `npm run build`: `built in 1.07s`, no errors
- `mvn -q compile`: exit 0
- Greps: no franchise words; no Parchment colour literals outside `styles/themes/` and `constants/themes.js`; every override selector prefixed; console.log/debug count 5 (baseline 6).
- Manual visual checklist (Task 28 Step 1): **pending, developer to run** at http://localhost:5173. There is no frontend test runner; nothing visual has been verified by automation.

## Note for contributors
Themed copy goes through `utils/themeCopy.js` (`copy` registry field); the background effect layer is the registry's `ambient` class.

## Suggested commit subject
`Parchment theme: The Kitchen Grimoire (third selectable theme)`
(No Jira key; if a ticket is opened, prefix with `MPP-n:`.)

# robot-pip-screen-faces: robot face items are pixels on the screen

Plan: [plan.md](plan.md) (tasks: [tasks.md](tasks.md)). Version 1.40.0 (MINOR). No migration.

## Summary

On the robot line (Cyberpunk), the three glasses items are now pixel faces the CRT screen displays, not stickers on the monitor. Approved option B for each (mockup `pip-robot-screen-faces.html`):

- Smiley.exe: glowing cyan outline smiley, eyes blink.
- Heart eyes: all-cyan pixel hearts that pulse, with a smile.
- Shades.gif: the screen lights cyan, dark shades scroll in, then a glint.

Each face replaces the base face (`REPLACES_FACE` now includes `sunglasses`), is clipped to the glass, and has the scanlines and sheen redrawn over it. Wearing or removing one plays a CRT channel change (`.pip-fx--tune`). Bored dims the face to 0.55; asleep shows the base sleep face. Low FX and reduced motion stop every effect.

Changes: `screen` anchor on each `ROBOT_FORMS` entry; new `robotScreenFaces.js` (renderer plus the three faces); `glassesArt`/`dressLayers` carry the screen; `PipFigure` clips and keys the face; four new effects in `Pip.css`; `wardrobe.check.mjs` asserts the anchor and screen-face rules (including the antenna droop loop, which now lets droop change only `glasses` for screen faces); mockups synced (`pip-themed-lines.html`, `pip-robot-screen-faces.html`, README).

## Convention

Robot face items are screen bitmaps (`robotScreenFaces.js`) that replace the base face, never shapes on top.

## Verification

- `check:version`: `Version OK: 1.40.0`.
- `check:wardrobe`: `wardrobe checks passed`. `check:room`: `room checks passed`, `Room packs OK: herb, dragon, robot`. `check:growth`: `pipGrowth checks passed`.
- `check:themes`: **FAILS on `folder-chip-text on folder-chip-bg (default): 4.36 < 4.5`**, plus the known `text-secondary on bg-secondary` WARN. No file under `client/src/styles/` is changed by this work, so it is pre-existing at HEAD. Not fixed here (out of scope); needs its own ticket.
- `npm run build`: built in 1.38s.
- `mvn test`: 508 run, 0 failures, 0 errors, BUILD SUCCESS (only the pom version changed).
- Renderer smoke check printed `14,14,15 0`. `PipFigure.jsx` is 88 lines.
- Mockup: headless Chrome screenshot of `pip-themed-lines.html` shows Smiley.exe, Heart eyes and Shades.gif on the screen with no base face in Section 3's robot column.

## Not verified

- **Manual `/pet` check (tasks.md Task 9 Step 5) was not done.** Still owed by the developer: Cyberpunk, Dress Pip, Glasses at 375px and 1280px; faces stay on the glass; blink / pulse / scroll-in + glint; channel change on wear and remove; bored dims; asleep shows the base face; Low FX stops animation and the glint stays visible.
- Browser console / DevTools check of the mockups: MANUAL VERIFICATION NEEDED.
- The `tune` channel change is not drawn in `pip-themed-lines.html` (static render); it is demoed in `pip-robot-screen-faces.html`.
- There is no frontend test runner; no frontend behaviour is test-verified.

## Suggested commit subject

`robot-pip-screen-faces: robot face items are pixels on the screen`

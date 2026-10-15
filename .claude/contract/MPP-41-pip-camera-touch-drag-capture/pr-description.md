# MPP-41: fix touch drag in Pip's room floating back to Pip after a few px

Plan: [plan.md](plan.md)

## Summary
- On touch devices a child element (fridge/cabinet) takes implicit pointer capture, which fires a bubbling `lostpointercapture` on the stage. The hook treated it as the end of the drag, so the camera cancelled after a few px and floated back to Pip.
- `usePipCamera.js` now registers `onLostCapture` for `lostpointercapture`, which ends the gesture only when `e.target === stage`.
- Version bumped to 1.28.1 (client `package.json`, api `pom.xml`, `CHANGELOG.md`).

## Migrations
None.

## Convention note
In `wireInput`, `lostpointercapture` must be filtered to `e.target === stage` because it bubbles from children.

## Verification
- Phase 1: `npm run build` passed; greps passed.
- Phase 2: `npm run check:version` -> `Version OK: 1.28.1`; `mvn test` -> 442 tests, 0 failures, 0 errors, BUILD SUCCESS; `npm run build` -> built, no errors; no `console.log/debug` in the hook; `lostpointercapture` appears only in the comment and the `['lostpointercapture', onLostCapture]` entry.

## Manual phone checks (NOT yet run, remain for the developer)
- [ ] Drag follows the finger without floating back while the finger is down
- [ ] Rubber-bands past the edge
- [ ] Floats home about 2 s after lift
- [ ] Pinch zoom then drag works; zoom remembered after reload
- [ ] A drag ending on the fridge/cabinet does not open it; a plain tap does
- [ ] Desktop mouse drag still pans and floats home

Suggested commit subject: `MPP-41: fix touch drag in Pip's room floating back to Pip after a few px`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

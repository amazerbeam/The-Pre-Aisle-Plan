---
name: svg-character-poster
description: Design and add a new flat-silhouette game-character SVG to the character lineup poster, scaling it to the correct real-world height and placing it in the crowd so it fits the existing cast. Use when adding a character to the poster, drafting a new SVG for the poster, scaling a character's height for the print, or checking how a new figure fits alongside the existing lineup.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(python:*)
metadata:
  version: 1.0.0
---

# SVG Character Poster

## Overview

Adds one character at a time to the flat-color, silhouette-style game-character lineup poster (`E:\Photoshop\Claude`), sourced from `Gaming_Poster.psd` / `GG_Landscape.psd`. Every character must be scaled off a real-world height anchor, drafted in the established visual language, and placed so it reads correctly against its neighbors at final print size — this skill treats each addition as a small pipeline (height → scale → placement → draft → fit-check), not a one-shot image generation.

## When to Use This Skill

- Adding a new character to the poster (from the roster planning list or a fresh request)
- Drafting a character as a flat-color SVG in the poster's house style
- Scaling a character's real/canon height into poster centimeters or pixels
- Checking whether a newly drafted character fits its row (size, silhouette distinctiveness, z-order) alongside the existing cast

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index. (As of this writing, the repo's `.claude/rules/` covers the FoodBytes app domain, not the poster project — none apply here, but re-check each run in case that changes.)

## Project context (read once per session)

Before drafting anything, Read `references/poster-conventions.md` — it holds the locked scale factor, the print target, the visual style rules extracted from the source PSDs, and the current height table. Then check the current state of the project's own tracking files, which are the source of truth and may have changed since this skill was last run:

- `E:\Photoshop\Claude\Roster Planning\character-heights.txt` — every character's real height, poster height, and source confidence
- `E:\Photoshop\Claude\Roster Planning\character-roster-suggestions.txt` — the candidate list and what's been trimmed
- `E:\Photoshop\Claude\Gaming Poster\` and `E:\Photoshop\Claude\GG Landscape\` — the existing composite art, for visual reference

## Core workflow

### 1. Check — confirm the character isn't already covered

Search `character-heights.txt` and `character-roster-suggestions.txt`'s "ALREADY IN THE POSTER" section for the character or a close variant. If the franchise is already present but this specific character isn't, that's fine — many characters per franchise is the established pattern. Flag it if it looks like an exact duplicate.

### 2. Determine real-world height

Find the character's real/canon height and note the confidence:
- **official** — stated in-game, by the developer, or in a widely-cited wiki/Pokédex-style source
- **estimate** — no official figure exists; reason from the character's proportions relative to already-scaled figures of a similar build (note what you compared against)

Never silently invent a number without flagging which category it falls in — the height table's whole value is knowing what's sourced vs. guessed.

### 3. Compute the poster scale

Apply the locked scale factor from `references/poster-conventions.md`: `poster_cm = real_cm × (12 / 185)`, then `poster_px_300dpi = poster_cm / 2.54 × 300`. Arthur Morgan (185cm real → 12cm poster) is the fixed anchor — don't re-derive it from a different character.

Apply the human-cap exception already established: an *ordinary* human character should not exceed Arthur's 12cm. A non-human, demigod, or powered/armored character may exceed it on its own real/lore height (precedent: Master Chief in armor, Kratos, Mewtwo). If a new character is borderline (e.g. another armored supersoldier, another mythological figure), flag the judgment call rather than deciding silently.

### 4. Decide placement in the crowd

Reference the existing layout logic (multi-row crowd, consistent depth ordering, front row = full figures, back rows = partially occluded, peeking through gaps):

- **Row**: taller/major figures generally anchor the back or middle rows; small or "cute" characters sit front-and-visible, matching the existing composition's convention (see `Gaming_Poster.psd`'s crowd).
- **Horizontal slot**: place near thematically or visually related neighbors, or — when the user has asked for characters interacting — position the pair/group so the interaction reads (e.g. a duo boss standing together, one character reacting to another).
- **Z-order**: back-row figures render behind front-row figures; within a row, taller figures behind shorter ones so nothing important gets clipped. State the intended z-order explicitly so it's easy to apply when this becomes a real PSD layer.

### 5. Draft the SVG

Follow `references/poster-conventions.md`'s visual style rules: flat solid color-block shapes, no outline strokes, no gradients or shading, minimal internal detail (one or two silhouette-defining props or color blocks — a scar, a cape color, a weapon shape — not fine texture, since none of that survives at ~2–2.5cm print width). Author the SVG at a fixed viewBox height that matches the character's computed poster proportion, so placing it later is a straight scale/position, not a redraw.

Save each character as its own file: `E:\Photoshop\Claude\Roster Planning\svg-drafts\{character-name}.svg`.

### 6. Verify the fit

Before calling a character done, check:

- **Width at print size** — does it land near or above the ~2–2.3cm recognizable floor established from the existing cast? If a character's detail (small props, facial features) won't read at its computed width, either simplify the silhouette further or flag that this character may not survive the style at this print size.
- **Silhouette distinctiveness** — does it read differently from characters already placed nearby (avoid two similar human-with-sword silhouettes standing shoulder to shoulder with no visual variety)?
- **Z-order sanity** — does the intended layering actually keep every character's identifying silhouette visible, or does a same-height neighbor swallow it?

### 7. Record it

Update `character-heights.txt` with the new row (name, real cm, poster cm, poster px @300dpi, source confidence) and mark the character as placed (not just suggested) in `character-roster-suggestions.txt`. These files are the running spec for the whole poster — an SVG that isn't recorded there is easy to lose track of.

## Success Criteria

- Character's real height is documented with source confidence (official/estimate), not invented silently
- Poster height correctly derived from the `12/185` Arthur Morgan scale factor (or the human-cap exception explicitly justified)
- Row, horizontal slot, and z-order are stated explicitly, consistent with the existing crowd's depth logic
- SVG uses the flat color-block style (no outlines/gradients, minimal detail load) and is saved under `Roster Planning\svg-drafts\`
- `character-heights.txt` and `character-roster-suggestions.txt` are updated to reflect the addition

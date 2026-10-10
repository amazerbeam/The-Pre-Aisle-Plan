---
name: svg-v2-character-poster
description: Design and add a new flat-silhouette game-character SVG to the character lineup poster using an automated segmentation-model pipeline instead of hand-traced boundaries, scaling it to the correct real-world height and placing it in the crowd so it fits the existing cast. Use when adding a character to the poster, drafting a new SVG for the poster from a reference photo, segmenting a character photo into skin/hair/clothing regions, or scaling a character's height for the print.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(python:*)
metadata:
  version: 1.0.0
---

# SVG Character Poster (v2 pipeline)

## Overview

Adds one character at a time to the flat-color, silhouette-style game-character lineup poster (`E:\Photoshop\Claude`), sourced from `Gaming_Poster.psd` / `GG_Landscape.psd`. Every character is scaled off a real-world height anchor, drafted in the established visual language, and placed in the full-canvas stadium-riser crowd so it reads correctly against its neighbors at final print size — treated as a pipeline (height → scale → placement → segment → split → verify → style), not a one-shot image generation.

**This skill exists because the original approach (a sibling skill, `svg-character-poster`) hand-traced every boundary with color heuristics, ray-casting, and per-boundary GrabCut seeding — which worked for the figure-vs-background boundary but repeatedly failed on internal material boundaries with overlapping colors under lighting, specifically skin vs. hair.** This version replaces hand-tracing with a pretrained human-parsing model that segments skin/hair/clothing in one pass, and reserves manual tools for what they're actually good at: clothing sub-splits (much higher color contrast) and props (not a body-parsing class at all). See `references/segmentation-pipeline.md` for the full reasoning and the specific failure that motivated it.

## When to Use This Skill

- Adding a new character to the poster (from the roster planning list or a fresh request)
- Drafting a character as a flat-color SVG from a reference photo using the segmentation-model pipeline
- Segmenting a character photo into skin/hair/clothing/background regions
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

Apply the locked scale factor from `references/poster-conventions.md`: `poster_cm = real_cm × (6 / 185)`, then `poster_px_300dpi = poster_cm / 2.54 × 300`. Arthur Morgan (185cm real → 6cm poster) is the fixed anchor — don't re-derive it from a different character.

Apply the human-cap exception already established: an *ordinary* human character should not exceed Arthur's 6cm. A non-human, demigod, or powered/armored character may exceed it on its own real/lore height (precedent: Master Chief in armor, Kratos, Mewtwo). If a new character is borderline, flag the judgment call rather than deciding silently.

### 4. Decide placement in the stadium-riser crowd

Front row at the canvas bottom, each row behind rising up the canvas so it's never covered past its own chest by the row in front (~28% of a row's representative height, per `references/poster-conventions.md`). 15 rows fit front-to-back, ~21–25 characters per row.

- **Row**: pick 1 (front) to 15 (back). Taller/major figures can sit further back; small/cute characters work well toward the front.
- **Horizontal slot**: place near thematically related neighbors, or — for a deliberate interacting pair/group — adjacent within the same row. Otherwise, don't cluster a whole franchise together; spread it across rows so the crowd reads as mixed.
- **Z-order**: back-row figures render behind front-row figures; within a row, taller figures behind shorter ones. State the intended z-order and row rise explicitly.

### 5. Draft the SVG — segment first, trace what the model can't, verify everything

**5a. Get the reference.**
Find and save a real reference image (official art, a render, a clean promotional shot — not a screenshot full of background clutter). Prefer a clean single-character image with a plain or simple background. Read/view it before drawing anything.

**5b. Segment — one automated model pass, not per-boundary manual tracing.**
Run `E:\Photoshop\Claude\Scripts\human_parse_segformer.py`'s `parse_classes()` on the reference photo. This is Phase 1 of the pipeline in `references/segmentation-pipeline.md` — read that file for the full detail (setup command, code, and why this replaced hand-tracing). In short:
- One model pass gives Skin / Hair / Clothing / Background masks directly — no seed points, no color-ratio tuning, no ray-casting.
- Union of everything but Background = the outer silhouette; trace it with `trace_mask_boundary()`.
- Take the largest connected component of Skin and of Hair (`largest_connected_component()`) and trace each — these are the boundaries that broke every hand-rolled approach the sibling skill tried, and this model is the actual fix.

**5c. Split "Clothing" into real garment pieces.**
The model gives one blob for everything that isn't skin/hair/background. Split it into the actual garment shapes (jacket, vest, pants, boots, gloves, straps) using `silhouette_boundary.py`'s `segment_material_grabcut()` seeded within the clothing region, or plain color thresholding — appropriate here because garment-to-garment color contrast is usually much higher than the skin/hair case, not because these tools are generally reliable. Full detail in `references/segmentation-pipeline.md` Phase 2.

**5d. Props, and same-color limb/garment splitting when Phase 2 fails.**
A held weapon or tool isn't a body/clothing class — segment it with SAM (installed and verified as of 2026-08-23; `E:\Photoshop\Claude\Scripts\sam_segment.py`, checkpoint at `Scripts\checkpoints\sam_vit_b_01ec64.pth`). **Also reach for SAM whenever 5c's color-based garment split fails because the uniform/outfit is one near-uniform color** (this is what broke a prior session: the fallback was hand-guessing coordinates off a grid instead of using SAM per-limb) — one foreground click per limb/torso/leg segment, with background-exclusion points on the neighboring regions, inspecting all 3 returned candidates rather than trusting the top score. Full detail, including the practical click/verification lessons, in `references/segmentation-pipeline.md` Phase 3. If a specific small shape still resists SAM (a thin low-contrast strap, say), fall back to manual Pen-Tool-style tracing for that one shape only.

**5e. Verify — every shape, a real zoomed look, before it counts as done. Not optional, not a glance.**
This is the part that matters most, independent of which tool produced a given shape. For every shape from 5b–5d:
1. Render it as a semi-transparent overlay on the reference (live-browser or static-composite).
2. Zoom into its actual boundary — not the whole figure at arm's length.
3. Describe in words what the zoomed crop shows at that boundary, naming the real landmark it should track (jawline, collar seam, hairline). If that description doesn't hold up honestly, the shape is not done.
4. **When a shape sharing an edge with this one gets touched, re-verify the neighbor too** — never assume it's still correct because it was drawn earlier or by a different method. Two shapes sharing a boundary are a joint problem; see `references/segmentation-pipeline.md`'s Phase 4 for the specific incident this rule comes from.
5. **Also do a lower-opacity overlay pass (~40-50% drawn, not the usual ~70%) across the whole figure, not just per-shape.** More of the real photo shows through at lower opacity, which surfaces boundary drift the higher-opacity pass can miss — this is how a uniform outward inflation along both entire pant legs (caused by seam-closing dilation bleeding into edges that don't border any other shape) got caught, after the higher-opacity checks had all passed. Do this as standard practice, not only when asked to.
6. **Before calling the whole character done, the overlay checks above are not the final gate — an exact pixel-diff against the real photo silhouette is.** After repeated rounds where overlay-based checks (even the low-opacity one in point 5) missed or misdiagnosed real overflow/underflow, this is no longer optional: compute the reference photo's own silhouette mask, rasterize the flat SVG, and measure `overflow = drawn & ~real` / `underflow = real & ~drawn` as raw pixel counts — then wrap the character's `<g>` in a `clip-path` traced from that same real silhouette, which makes overflow past the true edge structurally impossible regardless of any shape's individual accuracy. Fix remaining underflow with generous per-color backing rectangles (safe to overdraw, since the clip trims them) rather than chasing many small gaps by hand. Full method and the numbers from doing this in practice are in `references/segmentation-pipeline.md` Phase 4.

Do not describe a shape as "locked," "done," or "correct" to the user without having actually done steps 1–3 above on it.

**5e-2. Smooth organic body shapes' straight edges into curves — but not rigid gear.** `trace_mask_boundary()` + `approxPolyDP()` produces a polygon connected by straight `L` segments — nothing in that step ever produces a curve, which gives every shape a faceted, low-poly look that doesn't match the house style. Confirmed directly against `leon-extracted.svg` (the real Photoshop vector geometry for this same character, pulled straight from the poster PSD): body-silhouette shapes there are smooth cubic-bezier curves. Run a Catmull-Rom → cubic-Bezier conversion over each *organic* shape's already-simplified vertex list (torso, limbs, boots, hair, face, a rounded armor plate — the exact points `approxPolyDP` produced, no re-tracing needed) and replace the straight-line `d` attribute with the resulting curve. See `references/segmentation-pipeline.md` Phase 3, point 13 for the conversion code and its caveat. **Leave straight-edged human-made gear — belts, straps, buckles, small rectangular patches, a weapon's hard lines — as straight `L` segments.** Confirmed the hard way: applying the same smoothing to a belt and holster straps (long, sparse-vertex, mostly-straight shapes) made them balloon into wavy, bulging, "stuck on"-looking blobs instead of rigid gear — the curve fit overshoots badly on long straight runs with widely-spaced points. This is cheap enough to run as a final pass over an entire already-built character (confirmed: zero new gaps introduced, re-verified with the Phase 4 plain-background scan) — but decide per-shape whether it's organic or rigid before applying it, not as a blanket default.

**5f. Color: one color per material, reused everywhere that material appears — not resampled per shape.**
Pick a color once per real-world material (skin, denim, leather, metal), and reuse that *exact* value for every shape of that material across the whole character. Don't re-sample a fresh color each time a new shape happens to look similar to one already placed.

**A limb that's genuinely a separate visible shape can get a brighter value than the torso so it doesn't disappear into it — but only where the limb is actually a distinct region in the photo, confirmed by looking, not assumed from anatomy.** `poster-conventions.md` documents this as a real technique (Leon's own worked example: lighter blue-grey sleeves/collar vs. a darker slate torso/vest). But this is easy to overreach: a session tried to brighten "the arms" as a category and, finding no real separate arm-shaped mask near one shoulder, brightened a SAM click that had actually landed on collar/torso fabric instead — producing a visibly wrong blotch, because in a foreshortened/crossed-arm pose the bicep can be genuinely hidden behind the torso with no separate region to color at all. **Before adding a limb-brightening shape, verify in the reference photo that the limb is actually visible there as its own silhouette region** (a bent elbow, a raised forearm) — if a pose hides the upper arm behind the torso, don't invent one; rely on whatever *is* genuinely visible (a forearm guard, a glove, a shoulder pad) to carry the "this is an arm" read instead. Once real limb shapes are added, check the whole flat render (not per-shape) to confirm they read as separate from the torso — same discipline as the Phase 4 gap check.

**5g. Add detail only where the character needs it to read correctly.**
Detail (a panel breaking up a flat area, a prop, a distinguishing accent) is never automatic — added deliberately, only where its absence would make the silhouette illegible or generic. Minimal shape count and minimal color count are the default. Where shading is used, it's a second darker tone of the *same* hue as a hard-edged flat shape (never a generic grey shadow, never a gradient) — an artistic layering choice, not a copy of the reference photo's lighting. **No facial features ever** — heads are a flat skin-tone shape plus hair, nothing else.

Author the SVG at a fixed viewBox height matching the character's computed poster proportion (step 3), so placing it later is a straight scale/position.

**Isolating an existing poster character as ground truth** (for comparison while drafting, not as the reference itself): when a real, already-drafted character is available (any of the current 36), pull its *actual* isolated layer group rather than cropping the flattened composite. Use `psd-tools` to walk the layer tree and `.composite()` on just that group for a clean transparent-background PNG.

Save each character as its own file: `E:\Photoshop\Claude\Roster Planning\svg-drafts\{character-name}.svg`. Save the reference image alongside it as `{character-name}-reference.{ext}`.

### 6. Verify the fit

Before calling a character done, check:

- **Width at print size** — does it land near or above the ~2–2.3cm recognizable floor established from the existing cast? If a character's detail won't read at its computed width, simplify further or flag that this character may not survive the style at this print size.
- **Silhouette distinctiveness** — does it read differently from characters already placed nearby?
- **Z-order sanity** — does the intended layering keep every character's identifying silhouette visible?

### 7. Record it

Update `character-heights.txt` with the new row (name, real cm, poster cm, poster px @300dpi, source confidence) and mark the character as placed (not just suggested) in `character-roster-suggestions.txt`. An SVG that isn't recorded there is easy to lose track of.

## Extracting an existing character's SVG from the PSD

A separate task from Core workflow step 5's drafting pipeline: instead of drafting a *new* character by segmenting a reference photo, this pulls the *real* vector artwork for a character that's **already built** into `Gaming_Poster.psd` or `GG_Landscape.psd`. The output is the actual Photoshop bezier geometry and sampled fill colors, not a re-trace, so it's ground truth.

1. **Find the character's layer group.** `Gaming_Poster.psd` nests characters as `All_Characters/Row_N/{CharacterName}`; `GG_Landscape.psd` has them as top-level groups. If the exact group name isn't known, run `E:\Photoshop\Claude\Scripts\psd_layers.py` against the PSD (dumps every layer name) — search case-sensitively; names don't always match the roster's display name exactly (e.g. `Gordan Freeman`, `zarya2`).
2. **Run the extractor**: `python "E:\Photoshop\Claude\Scripts\extract_character_svg.py" <psd_path> <GroupName> <output.svg>`. Walks the group's shape layers, reads each one's real Photoshop vector-mask bezier knots, converts straight to SVG `<path d="...">` commands, samples each shape's dominant rendered color for its `fill`, and sets the viewBox to the character's native bbox in poster pixels. Prints a skip list for any layer that wasn't a shape-with-vector-mask.
3. **Verify it before handing it over.** No Cairo/rsvg in this environment: render via `svglib.svg2rlg` → `reportlab.graphics.renderPDF.drawToFile` → rasterize with PyMuPDF (`fitz`, `page.get_pixmap()`) → view the PNG. Compare against the character's known appearance before calling the extraction done.
4. **Where it goes**: durable ground-truth pulls go in `E:\Photoshop\Claude\Roster Planning\extracted-svgs\{character-name}.svg`, parallel to `svg-drafts\`. A one-off requested for a specific comparison can go wherever asked instead — it isn't part of the roster-tracking files.

This is not a substitute for Core workflow step 5 — never use an extracted SVG's shapes as the "reference" to trace a *different, new* character from.

## Success Criteria

- Character's real height is documented with source confidence (official/estimate), not invented silently
- Poster height correctly derived from the `6/185` Arthur Morgan scale factor (or the human-cap exception explicitly justified)
- Row (1–15), horizontal slot, and z-order are stated explicitly, consistent with the stadium-riser depth logic
- Skin/Hair/outer-silhouette boundaries came from the segmentation model pass (`human_parse_segformer.py`), not hand-rolled color/ray-cast heuristics
- The SVG has one connected **base** shape per limb/torso region (not just isolated accent patches with gaps between them), and no background sliver at any seam between two independently-traced shapes (grow each mask ~2-3px before tracing to close this) — verified by rendering the flat SVG on a plain background and running an automated connected-components scan for any white patch that doesn't touch the canvas border (a real enclosed gap), not by eyeballing crops — a 2-4px gap judged "negligible" by eye was still a real, visible gap to the user
- Every shape (segmented, GrabCut-split, or manually traced) was individually zoomed in on and its boundary described against the reference before being accepted — and any shape whose neighbor was later re-touched was itself re-verified, not assumed still correct
- Every organic body-silhouette shape's final `d` attribute uses smooth curves (Catmull-Rom → Bezier), not the raw straight-line `L` polygon `approxPolyDP` produces — checked against real extracted PSD geometry (`leon-extracted.svg`). Rigid human-made gear (belts, straps, buckles, small patches) stays straight-edged — smoothing those instead makes them balloon into "stuck on"-looking blobs
- SVG uses the flat color-block style (no outlines/gradients, minimal detail load) and is saved under `Roster Planning\svg-drafts\`
- Each shape's color is an existing material color reused, not a fresh sample — one color per material across the whole character
- `character-heights.txt` and `character-roster-suggestions.txt` are updated to reflect the addition

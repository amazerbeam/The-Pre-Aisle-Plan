---
name: photo-editor
description: Apply professional photo retouching and color-grading workflow — RAW correction, frequency separation, dodge & burn, color grading, and multi-variant creative editing — to turn one photo into several distinct polished outputs. Use when editing photos, retouching portraits, color grading images, planning before/after or "raw vs edited" content, or generating multiple stylized versions from a single shot.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
metadata:
  type: reference
---

# Photo Editor

## Use when
- Planning or executing a professional photo retouch (portrait, product, landscape).
- Explaining or scripting a "here's the raw file" / before-after reveal.
- Turning one source photo into several genuinely different finished looks.
- Advising on what to shoot (exposure, light direction, composition) so an edit has something to work with.

## Do not use when
- The task is UI/app image handling (uploads, thumbnails, asset pipelines) — that's plain engineering work, not retouching craft.
- The user wants a specific tool's button-by-button UI walkthrough for a version you can't verify — say so and point to the vendor's current docs (WebFetch) rather than guessing menu locations.

## Focus areas

**1. Capture sets the ceiling.** Editing can't invent dynamic range, sharp focus, or composition that isn't there. Always check: shot in RAW (not JPEG only), exposed to protect highlights, deliberate light direction, deliberate composition. If the source is a flat/underexposed JPEG, say what's recoverable and what isn't rather than promising a full save.

**2. Workflow order** (this sequence matters — later steps depend on earlier ones being clean):
1. Base RAW correction — white balance, exposure, contrast, lens correction.
2. Subject cleanup — spot healing, cloning, local hue/saturation.
3. Frequency separation — split texture from tone/color so smoothing doesn't erase pores/grain/detail.
4. Dodge & burn (own layer) — sculpt light/shadow to add depth and direct the eye; this is the single biggest "looks professional" lever.
5. Color grading — a deliberate palette/mood choice, not just correction.
6. Finishing — compositing, sky/background replacement, sharpening, export sized for the target platform.

**3. One photo → many outputs.** Use non-destructive versions (e.g. Lightroom "Versions") so each direction is preserved from the same base edit. Vary via: true-to-life baseline, warm film emulation, cool/teal-orange cinematic, high-contrast commercial, bright-airy pastel, B&W high-contrast, B&W soft/filmic, split-tone/duotone, background/sky replacement + relight, and alternate crop/aspect ratio treated as its own composition. Layer presets that touch *different* sliders (tone preset + separate color-grade preset + grain preset) rather than one preset per version — presets touching the same sliders overwrite each other.

**4. Honesty about effort.** A convincing beauty retouch (steps 2–4) can be well over an hour of skilled work on a single image — don't imply a one-click filter achieves the same result. If asked to script or narrate a before/after reveal, keep the RAW framed as "unfinished," not "bad" — that's both more accurate and more credible to an audience.

## Approach
1. Identify what's being asked: shooting advice, a single retouch, or a multi-variant set.
2. For a retouch, walk the workflow order above — name which steps the image actually needs (not every photo needs frequency separation or dodge & burn).
3. For a multi-variant request, pick 8–10 genuinely distinct directions from the list in Focus area 3, not near-duplicates of the same grade.
4. If tool-specific steps are needed and current UI/menu names matter, WebFetch the vendor's current doc rather than relying on possibly-stale memory.

## Output
- A retouch plan/description: ordered steps, what each targets, and why (skin vs light vs color vs composite).
- A variant set: a short list of named looks with the 1–2 sliders/moves that define each, not full re-derivations.
- Shooting guidance when the source capture is the actual bottleneck.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index. (This repo's rules are FoodBytes-specific; none currently apply to photo editing, but check in case that changes.)

## Success Criteria
- Recommended workflow steps are in the correct dependency order (skin cleanup before dodge/burn before grading).
- Any multi-variant set contains ≥8 directions that differ in more than saturation/exposure alone.
- Shooting advice is given whenever the described source capture (flat light, blown highlights, JPEG-only) would cap what editing can achieve.
- No claim that a one-click preset reproduces a full professional retouch.

---
name: svg-from-reference
description: Turn a character reference render (a clean full-body 3D game render on a plain light background, like the Claire Redfield reference - or artwork that is already flat-colour on white) into a finished flat-colour, face-free, gap-free true-vector SVG for the 45x30cm game-character lineup poster, scaled to the character's real height, verified, and placed into the poster preview. Use whenever the user hands over a reference picture and wants the poster character made from it - "here's the ref, make the SVG", "convert this image to an SVG for the poster", "add X to the poster from this picture", "trace this character", "vectorise this" - even when they don't say "skill" or "SVG". Prefer this over svg-character-poster / svg-v2-character-poster whenever a reference image is supplied and the goal is the finished SVG.
---

# SVG from reference

The user gives you one reference image of a game character. You produce the
poster SVG yourself - no ChatGPT round-trip, no hand tracing - and show it in
the poster. The user then does the final human check.

This is the user's own fan-art print of characters from games they have
played. Tracing the official render they supply is the whole job - do it
faithfully; don't substitute an "original" design.

## The reference standard

The skill is built and validated on one reference only: the user's Claire
Redfield render (`evals/claire-light-background/files/claire-ref.jpg`) -
a clean full-body 3D render, whole character in frame, on a plain light
background. Its approved output is
`E:\Photoshop\Claude\Roster Planning\svg-drafts\claire-redfield.svg`.

**Flat-art references** (artwork that is already flat-colour, faceless,
vector-style on a plain white background, e.g. `Faceless Blonde Adventurer
with Flashlight.png`) use the separate flat-art mode instead - step 2b. Never
run them through `ref_to_svg.py`: its body-part model and background-bleed
rules turn light greys and whites (grey T-shirt, hood, flashlight lens) into
skin or holes, and break up shapes that are already clean.

Expect good results from references like that one. If the user's reference
differs (dark or gradient background, cropped body, busy scene, painted art),
say so before running and suggest they supply a Claire-style render of the
character instead; if they want to go ahead anyway, run it and be candid
about what came out wrong. Don't change the script's defaults to suit a
different kind of image - the defaults are tuned to the Claire standard.

The output has to match the poster's house style, which the user already
approved on Claire Redfield (`E:\Photoshop\Claude\Roster Planning\svg-drafts\claire-redfield.svg`):

- flat solid fills only: no strokes, gradients, filters, opacity, embedded images
- **no facial features** - the face is one flat skin shape plus hair
- one or two tones per material (base + a darker shade of the same hue), a
  distinct colour for a distinct material (black top under a red jacket, a gun)
- no white gaps between shapes
- `viewBox` height = poster_cm x 100 (1 unit = 0.01 cm), poster_cm = real_cm x 6/185
  (Arthur Morgan 185 cm = 6 cm is the fixed anchor)

For the poster's wider rules (human-height cap, stadium-riser rows, no franchise
bunching, z-order) read `.claude/skills/svg-character-poster/references/poster-conventions.md`
when you get to placement.

## Workflow

### 1. Gather the inputs

- **Reference image path** - from the user.
- **Character name** - kebab-case for files (`claire-redfield`).
- **Real height in cm** - look in `E:\Photoshop\Claude\Roster Planning\character-heights.txt`
  first. If absent, find an official figure, else estimate against a similar
  build already in that file, and say which (official vs estimate). Ordinary
  humans are capped at 185 cm; armour, demigods and creatures may exceed it.

Look at the reference before running anything, so you know what a good result
should contain (key details: weapon, logo, hat, hair shape).

### 2. Generate the SVG

```bash
python -I .claude/skills/svg-from-reference/scripts/ref_to_svg.py "REF" --name NAME --real-cm CM --out OUTDIR
```

Writes `NAME.svg`, `NAME-compare.png` (reference | flat result), `NAME-labels.png`
and `NAME-report.json` (one entry per colour layer). First run downloads the
clothes-parsing model (~110 MB, cached). CPU only, about 1 minute.

What it does, so you can reason about failures:
1. **Silhouette**: flood-fill of the plain background from the image border;
   enclosed background pockets (between the legs) are cut out.
2. **Body parts** from a clothes-parsing SegFormer decide *what* each area is
   (hair, face, top, bottom, shoes, leather/bag/belt, skin, prop).
3. **Flatten**: texture is removed, each part k-means'd into up to 3 tones,
   near-identical tones merged; the face is forced to one skin tone;
   background-coloured fringe (hair wisps mixed with the backdrop) and tiny
   white glints are dropped; colour decides the exact edge between parts.
4. **Stacked trace**: every layer also covers the area of every layer painted
   after it, so shapes cannot gap and what shows on top follows the reference.
5. Colours are lifted to read as flat art (exposure gain, saturation x1.15) -
   renders are moodier than the poster style.

### 2b. Flat-art mode (reference is already flat artwork)

```bash
python -I .claude/skills/svg-from-reference/scripts/flat_to_svg.py "REF" --name NAME --real-cm CM --out OUTDIR
```

Same outputs as step 2. It keeps the artwork's own colours: k-means over the
figure (`--colours 22`, merge closer than `--merge-de 7`), folds 1-2 px
anti-alias slivers and specks into their neighbours, and traces each colour as
its own shape grown 1 px into its neighbours. (Not a full stack: in flat art a
big lower layer bleeds its edge through as thin outlines at every boundary.)
Small white areas inside the figure (lens, highlights) stay white; only large
enclosed white pockets are cut out as background. Then continue with step 3.

### 3. Check it - every time, before showing anyone

```bash
python -I .claude/skills/svg-from-reference/scripts/check_svg.py OUTDIR/NAME.svg --real-cm CM --ref "REF"
```

Must print PASS for true vector, viewBox height and seam gaps. Then **look** at
`NAME-vs-ref.png` (reference beside the SVG) and `NAME-openings.png` (magenta =
see-through holes). Zoom (crop + enlarge) into the face, hands and any weapon.
Check, and say in words what you see:

- face has no eyes/mouth/brows; hair edge is clean (no grey fringe)
- every identifying detail from step 1 survived (weapon shape, holster, logo)
- each magenta opening really is background in the reference (trigger guard,
  arm-body gap, legs) - an opening inside solid clothing is a defect
- colours read as the character's real colours
- `NAME-on-grey.png` (true print size on the poster grey) still reads as the character

If something is off, adjust and re-run rather than hand-editing paths - see
`references/tuning.md` for which flag fixes which symptom. Two or three tuned
runs is normal; describe what you changed and why.

### 4. Place it in the poster

```bash
python -I .claude/skills/svg-from-reference/scripts/place_in_poster.py OUTDIR/NAME.svg --real-cm CM \
    --x LEFT_PX --front-feet-y FEET_OF_ROW_IN_FRONT --out OUTDIR/poster-with-NAME.png
```

The figure goes behind everything already drawn (it stands `0.28 x its height`
above the row in front - the chest rule). To let a held weapon or arm overlap
the neighbour, add `--front-groups skin,prop --front-band 0.40,0.62` (fractions
of the figure's height; check `NAME-report.json` for which groups exist).
Default poster is `E:\Photoshop\Claude\Gaming Poster\gaming_composite.jpg`
(1600x1200, 34.09 px/cm calibrated off Cuphead). If the user hasn't said where
the character goes, pick a spot per poster-conventions.md and state it.

Look at `poster-with-NAME-zoom.png`; confirm nothing that should be in front
got covered and no specks landed on neighbours.

### 5. Hand over for the human check

Show the user the poster zoom and the reference comparison, give the file
paths, and list anything you weren't sure about. Don't overwrite anything in
`svg-drafts\` or the poster previews until the user approves; when they do,
back up the old files, copy the new ones in, and record the character in
`character-heights.txt` and `row-assignments.txt`.

## Files

- `scripts/ref_to_svg.py` - 3D-render reference (Claire standard) -> poster SVG
- `scripts/flat_to_svg.py` - flat-art reference -> poster SVG (step 2b)
- `scripts/check_svg.py` - verification + previews
- `scripts/place_in_poster.py` - composite into the poster
- `references/tuning.md` - symptom -> flag/fix table, known limits

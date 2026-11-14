# Tuning ref_to_svg.py

The defaults are tuned to the Claire Redfield standard reference (clean
full-body render, plain light background). Use these flags for small
per-character adjustments; re-run rather than hand-editing the SVG, because
the stacked trace is what guarantees no gaps.

| Symptom in the -compare / -vs-ref preview | Fix |
|---|---|
| Too blotchy / camouflage patches on clothes | `--merge-de 14` (merge more similar tones) or `--max-tones 2` |
| A real detail vanished (black top, belt, two-tone jeans) | `--merge-de 7` and/or `--max-tones 4` |
| Colours too dull | `--saturation 1.25` |
| Colours garish | `--saturation 1.0` |
| A colour is wrong for the character (brand red, uniform colour) | `--palette top=#a92e26,bottom=#23303c` - sets that group's base tone; its shade keeps its relative darkness. Groups: hair, skin, top, bottom, shoes, leather, hat, eyewear, prop |

## Outside the standard

The script expects a plain light background with the whole character in
frame. With anything else (dark or gradient background, scenery, cropped
body, painted art) the silhouette step is not reliable - ask the user for a
Claire-style render rather than retuning the script.

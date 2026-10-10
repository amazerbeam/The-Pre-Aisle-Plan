# Poster Conventions — Scale, Print Target, Visual Style

**Scope note:** everything below is structural/locked-in for this project (established across the session that built it) — not pulled from any external API or library, so nothing here goes stale on its own. Update this file directly if the user changes the print size, the anchor character, or the visual style.

## Print target (v2 — stadium-riser full-canvas layout)

- **45cm × 30cm at 300 DPI** → 5315 × 3543 px canvas
- **v1 (corner crowd) is superseded.** The goal is no longer a tight ~42–46 character huddle in one corner — the owner wants the *entire* 45×30cm canvas filled, edge to edge, using a stadium-riser technique (see Layout logic below).
- **Theoretical capacity at the v2 scale: ~315–375 characters** (15 rows × ~21–25 per row). This is the real target ceiling, not 42–46 — the roster should keep growing toward it, not stop at a small curated cap.
- Existing cast already in `Gaming_Poster.psd` / `GG_Landscape.psd`: 36 characters, all now due for rescaling to the v2 anchor (see below) as part of being folded into the riser layout.
- Recognizable width floor at this print size: **~2–2.3cm per character**. At the v2 6cm anchor height, a typical character's silhouette width comes out to ≈2.1cm — right at that floor. This means the v2 scale is legibility-tight by design: flag any character whose identifying detail (a small prop, a facial feature) won't survive at ~2cm wide, rather than silently shrinking it further.

## The height scale (locked, v2)

Anchor: **Arthur Morgan (Red Dead Redemption 2) = 185cm real → 6cm on the poster** (halved from the v1 12cm anchor when the layout moved from a corner crowd to the full-canvas riser technique).

```
scale_factor = 6 / 185  ≈ 0.0324 cm-poster per cm-real   (~1:30.8)

poster_cm       = real_cm × scale_factor
poster_px_300dpi = poster_cm / 2.54 × 300
```

**Human-cap rule (unchanged):** Arthur is the tallest *ordinary* human on the poster at 6cm. Characters that are not ordinary humans — non-human (Mewtwo), demigod (Kratos), or in powered armor (Master Chief) — are allowed to compute taller than 6cm on their own real/lore height. This was a deliberate call, not an oversight: don't "fix" a tall non-human character back down to 6cm.

**Any character height already computed under the old v1 (12cm-anchor) scale must be recomputed at v2 before use** — halving is not exact for every row due to rounding, always reapply the formula rather than dividing the old figure by 2.

## Current height table (v2, 6cm anchor — as of last update, re-check `character-heights.txt` for the live version)

| Character | Real (cm) | Poster (cm) | Source |
|---|---|---|---|
| Master Chief, armored | 213 | 6.91 | official |
| Kratos | 203 | 6.58 | official |
| Mewtwo | 200 | 6.49 | official |
| Minecraft Steve | 190 | 6.16 | estimate |
| Zarya | 188 | 6.10 | official |
| McCree/Cassidy | 188 | 6.10 | official |
| **Arthur Morgan** | **185** | **6.00** | **official — anchor** |
| Guile | 185 | 6.00 | official |
| Agent 47 | 185 | 6.00 | official |
| Kazuya Mishima | 183 | 5.94 | official |
| Isaac Clarke | 183 | 5.94 | estimate |
| Solaire | 183 | 5.94 | estimate |
| Gordon Freeman | 180 | 5.84 | estimate |
| Walking Dead character | 180 | 5.84 | estimate |
| Plants vs. Zombies (Zombie) | 180 | 5.84 | estimate |
| Leon S. Kennedy | 179 | 5.81 | estimate |
| Spider-Man | 178 | 5.77 | official |
| Link, adult | 177 | 5.74 | official |
| Abe | 175 | 5.68 | estimate |
| Castle Crashers Knight | 175 | 5.68 | estimate |
| Shinobi (GG Landscape) | 175 | 5.68 | estimate |
| Aloy | 168 | 5.45 | official |
| Sheik/Zelda | 163 | 5.29 | estimate |
| Mario | 155 | 5.03 | official |
| Limbo (the boy) | 110 | 3.57 | estimate |
| Deku Link | 100 | 3.24 | estimate |
| Sonic | 100 | 3.24 | official |
| Cuphead | 95 | 3.08 | estimate |
| Crash Bandicoot | 90 | 2.92 | estimate |
| Ratchet | 90 | 2.92 | estimate |
| Diddy Kong | 87 | 2.82 | estimate |
| Tails | 80 | 2.59 | estimate |
| Companion Cube | 61 | 1.98 | official |
| Clank | 60 | 1.95 | estimate |
| Super Meat Boy | 40 | 1.30 | estimate |
| Pikachu | 40 | 1.30 | official |

This table is a snapshot — `E:\Photoshop\Claude\Roster Planning\character-heights.txt` is the live source of truth and grows as characters are added. Read that file fresh each time rather than trusting this copy for anything beyond the pattern.

## Layout logic (v2 — stadium risers, full canvas)

This replaces the v1 "small huddle in one corner" approach entirely.

- **Stadium risers**: front row stands at the bottom of the canvas at full height. Each row behind is drawn progressively higher up the canvas (like bleacher seating), overlapped by the row in front — but the rule is the row in front must **never cover past its own chest** on the row behind. Using the anthropometric convention that chest height sits ~72% up a standing body, each row must rise **at least `row_character_height × 0.28`** above the row in front. At the 6cm anchor this is ~1.68cm per row.
- **Row capacity**: `6cm + (rows − 1) × 1.68cm ≤ 30cm` → **15 rows fit** front-to-back in the 30cm canvas height.
- **Per-row capacity**: at ~2.1cm silhouette width and natural shoulder-to-shoulder crowd overlap, **~21–25 characters per row** across the 45cm width.
- **Fills the whole canvas**, not one corner — row 1 spans the full 45cm width at the bottom, row 15 spans the full width near the top. This is the actual current goal; don't default back to the old corner-crowd composition.
- **Z-order**: back rows render behind front rows; within a row, taller figures sit behind shorter ones so nothing gets clipped that shouldn't be.
- **Row assignment by prominence/size**: small or "cute" characters (Pikachu, Diddy Kong, Clank) still read well toward the front; tall/major figures (Kratos, Master Chief) can anchor further back since their height carries over the rows in front of them.
- **Interacting characters**: when two characters are meant to interact (e.g. a duo boss, one character reacting to another), place them adjacent within the same row rather than across rows, so the interaction is visually legible.
- **Don't bunch a whole franchise together**: characters from the same game should be spread across different rows and horizontal positions in the crowd, not clustered into one franchise-shaped clump. With ~15 rows and a roster where many-per-franchise is the norm (11 Resident Evil characters, 15 Overwatch, 12 Tekken, etc. — see `character-roster-suggestions.txt`), letting one franchise dominate a single patch of the poster would read as a sub-poster inside the poster rather than one mixed crowd. Exception: the deliberate interacting pairs/groups above (a duo boss, the Fellowship trio) — those stay adjacent on purpose; it's the rest of a franchise's characters that should scatter.
- **Per-character height varies** (this is not a uniform-height crowd — see the height table): the 6cm/1.68cm figures above are the *representative* anchor-height numbers for capacity planning. A specific row's actual rise depends on the tallest character placed in it — recompute per-row when actually laying out real characters, don't assume every row is exactly 1.68cm.

## Visual style rules (verified directly against the source art — Gordon Freeman crop, `E:\Photoshop\Claude\Gaming Poster\`)

- **Flat solid color-block shapes, no gradients, no outline strokes.** Every shape is a hard-edged fill — confirmed both via layer inspection (`Shape N`-named vector layers) and by zooming into the actual rendered art.
- **Fewest colors possible per character.** Gordon Freeman's whole HEV suit + head reads on roughly 7 flat colors total: two oranges, one grey-blue, black, skin tone, brown hair, and a gold logo accent. Don't reach for more colors than the silhouette needs to read.
- **Shading is a second, darker tone of the SAME hue — not a separate grey/black shadow layer, and not a gradient.** This is the actual technique, verified on Gordon: his HEV suit's front chest plate is a lighter orange; the shoulder/side plates are a distinctly darker orange (same hue, lower value) as a hard-edged flat shape — not gradiented, not tinted with grey. Black is reserved for actual black elements (joints, gloves, collars) — it is not a generic shadow color.
- **The two-tone split is an artistic layering choice, not a copy of the reference photo's lighting.** Confirmed by directly comparing Leon Kennedy's traced version against his actual source render (a 3D character render with one fairly uniform navy-blue jacket, no strong light/dark split): the trace introduces a lighter blue-grey for the sleeves/collar and a darker slate blue-grey for the vest panel layered on top, even though the reference doesn't show that split — same for the asymmetric glove colors (mint vs. black), which add visual distinction rather than match the reference's actual lighting. So: use the reference for proportions, pose, and identifying details (weapon shape, badge, strap, boots) — then apply the same-hue two-tone technique by judgment, to separate garment pieces that are visually layered on top of each other (a vest over a jacket, a pauldron over an arm), not by sampling the reference's photographic shadows.
- **No facial features, ever.** Confirmed on Leon Kennedy's isolated extraction: the head is a flat skin-tone silhouette shape plus a hair shape — no eyes, nose, or mouth drawn at all. This is a hard rule across the whole existing cast, not a simplification some characters skip. Never add facial features to a new character.
- **Minimal internal detail** — a character is defined by silhouette plus one or two identifying details (a scar, a cape color, a signature weapon shape, a hat, a chest logo, a badge). Anything finer than that won't survive at the ~2–2.3cm print width.
- **No literal outlines separating internal color blocks** — colors abut directly; separation reads through hue/value contrast (including the light/dark-of-same-hue technique above), not a stroke.
- **Ground**: existing poster background is flat mid-grey (`#909090`-ish, matches both source composites) — new characters should be drafted against transparent or that same grey so they preview correctly in context.
- **Scale unit convention**: draft each character's SVG viewBox at a height in the same units as its computed poster-cm figure (e.g. viewBox height = poster_cm × 100, so 1 SVG unit = 0.01cm) — this keeps every character's file directly comparable and drop-in scalable without unit conversion later.

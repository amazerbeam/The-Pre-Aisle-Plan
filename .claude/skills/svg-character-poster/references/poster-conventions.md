# Poster Conventions — Scale, Print Target, Visual Style

**Scope note:** everything below is structural/locked-in for this project (established across the session that built it) — not pulled from any external API or library, so nothing here goes stale on its own. Update this file directly if the user changes the print size, the anchor character, or the visual style.

## Print target

- **45cm × 30cm at 300 DPI** → 5315 × 3543 px canvas
- Target total cast: **~42–46 characters** for a tight, fully-legible 3-row crowd at this size
- Existing cast already in `Gaming_Poster.psd` / `GG_Landscape.psd`: **36 characters** — so roughly 6–10 new characters is the real ceiling before the crowd stops being "tight and compact"
- Recognizable width floor at this print size: **~2–2.3cm per character** (validated against the existing `GG_Landscape.psd`, which packs ~19–20 characters across the full 45cm width in a single row)

## The height scale (locked)

Anchor: **Arthur Morgan (Red Dead Redemption 2) = 185cm real → 12cm on the poster.**

```
scale_factor = 12 / 185  ≈ 0.0649 cm-poster per cm-real   (~1:15.4)

poster_cm       = real_cm × scale_factor
poster_px_300dpi = poster_cm / 2.54 × 300
```

**Human-cap rule:** Arthur is the tallest *ordinary* human on the poster at 12cm. Characters that are not ordinary humans — non-human (Mewtwo), demigod (Kratos), or in powered armor (Master Chief) — are allowed to compute taller than 12cm on their own real/lore height. This was a deliberate call, not an oversight: don't "fix" a tall non-human character back down to 12cm.

## Current height table (as of last update — re-check `character-heights.txt` for the live version)

| Character | Real (cm) | Poster (cm) | Source |
|---|---|---|---|
| Master Chief, armored | 213 | 13.8 | official |
| Kratos | 203 | 13.2 | official |
| Mewtwo | 200 | 13.0 | official |
| Minecraft Steve | 190 | 12.3 | estimate |
| Zarya | 188 | 12.2 | official |
| McCree/Cassidy | 188 | 12.2 | official |
| **Arthur Morgan** | **185** | **12.0** | **official — anchor** |
| Guile | 185 | 12.0 | official |
| Agent 47 | 185 | 12.0 | official |
| Kazuya Mishima | 183 | 11.9 | official |
| Isaac Clarke | 183 | 11.9 | estimate |
| Solaire | 183 | 11.9 | estimate |
| Gordon Freeman | 180 | 11.7 | estimate |
| Walking Dead character | 180 | 11.7 | estimate |
| Plants vs. Zombies (Zombie) | 180 | 11.7 | estimate |
| Leon S. Kennedy | 179 | 11.6 | estimate |
| Spider-Man | 178 | 11.5 | official |
| Link, adult | 177 | 11.5 | official |
| Abe | 175 | 11.4 | estimate |
| Castle Crashers Knight | 175 | 11.4 | estimate |
| Shinobi (GG Landscape) | 175 | 11.4 | estimate |
| Aloy | 168 | 10.9 | official |
| Sheik/Zelda | 163 | 10.6 | estimate |
| Mario | 155 | 10.1 | official |
| Limbo (the boy) | 110 | 7.1 | estimate |
| Deku Link | 100 | 6.5 | estimate |
| Sonic | 100 | 6.5 | official |
| Cuphead | 95 | 6.2 | estimate |
| Crash Bandicoot | 90 | 5.8 | estimate |
| Ratchet | 90 | 5.8 | estimate |
| Diddy Kong | 87 | 5.6 | estimate |
| Tails | 80 | 5.2 | estimate |
| Companion Cube | 61 | 4.0 | official |
| Clank | 60 | 3.9 | estimate |
| Super Meat Boy | 40 | 2.6 | estimate |
| Pikachu | 40 | 2.6 | official |

This table is a snapshot — `E:\Photoshop\Claude\Roster Planning\character-heights.txt` is the live source of truth and grows as characters are added. Read that file fresh each time rather than trusting this copy for anything beyond the pattern.

## Layout logic

- **Multi-row crowd**, not a single line — front row shows full figures at full size; back rows are partially occluded, "peeking" through the gaps between front-row silhouettes (this is how `Gaming_Poster.psd`'s existing crowd achieves density without shrinking anyone).
- **Z-order**: back rows render behind front rows; within a row, taller figures sit behind shorter ones so nothing gets clipped that shouldn't be.
- **Row assignment by prominence/size**: small or "cute" characters (Pikachu, Diddy Kong, Clank) read well in the front; tall/major figures (Kratos, Master Chief) anchor the middle-to-back where their height reads over the crowd.
- **Interacting characters**: when two characters are meant to interact (e.g. a duo boss, one character reacting to another), place them adjacent within the same row/depth rather than across rows, so the interaction is visually legible.

## Visual style rules (extracted from the source PSDs)

- **Flat solid color-block shapes only** — no outline strokes, no gradients, no shading, no drop shadows. Every existing character in the poster is built this way (confirmed via layer inspection: `Shape N`-named vector layers, not painted/rendered art).
- **Minimal internal detail** — a character is defined by silhouette plus one or two color-blocked details (a scar, a cape color, a signature weapon shape, a hat). Anything finer than that won't survive at the ~2–2.3cm print width.
- **No literal outlines separating internal color blocks** — colors abut directly; separation reads through hue/value contrast, not a stroke.
- **Ground**: existing poster background is flat mid-grey (`#909090`-ish, matches both source composites) — new characters should be drafted against transparent or that same grey so they preview correctly in context.
- **Scale unit convention**: draft each character's SVG viewBox at a height in the same units as its computed poster-cm figure (e.g. viewBox height = poster_cm × 100, so 1 SVG unit = 0.01cm) — this keeps every character's file directly comparable and drop-in scalable without unit conversion later.

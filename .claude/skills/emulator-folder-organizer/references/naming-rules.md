# Naming Rules — Worked Examples

The target format is always `Game Name (Region).ext`. These before → after examples show each rule. Disc games (`.chd`/`.iso`) are where naming matters most (Playnite matches them by filename); cartridge ROMs match by checksum, so only fix clearly broken names.

## Strip scene tags, dump codes, and underscores

| Before | After |
|---|---|
| `Final_Fantasy_VII_(USA)_(Disc_1)_[SLUS-00669].chd` | `Final Fantasy VII (USA) (Disc 1).chd` |
| `Crash Bandicoot (USA) [!].iso` | `Crash Bandicoot (USA).iso` |
| `Metal Gear Solid (E) (Disc 2) [SCES-01370].chd` | `Metal Gear Solid (Europe) (Disc 2).chd` |
| `Gran.Turismo.2.USA.Arcade.Disc-PARADOX.chd` | `Gran Turismo 2 (USA) (Disc 1).chd` |

- Underscores → spaces.
- Remove `[!]`, `[b]`, `[h1]`, release-group suffixes (`-PARADOX`, `-PSXDB`), and serial codes like `[SLUS-00669]`.
- Normalize region shorthand: `(U)`/`(USA)` → `(USA)`; `(E)`/`(EUR)` → `(Europe)`; `(J)`/`(JPN)` → `(Japan)`; `(W)` → `(World)`.

## Keep leading articles at the FRONT

Playnite matches on the literal filename — a comma-flipped article breaks it.

| Before | After |
|---|---|
| `Legend of Zelda, The - Ocarina of Time (USA).z64` | `The Legend of Zelda - Ocarina of Time (USA).z64` |
| `Adventures of Batman, The (USA).chd` | `The Adventures of Batman (USA).chd` |

## Multi-disc

| Before | After |
|---|---|
| `Final Fantasy IX (USA) (Disc 1 of 4).chd` | `Final Fantasy IX (USA) (Disc 1).chd` |
| `MGS_disc2.chd` (region known = USA) | `Metal Gear Solid (USA) (Disc 2).chd` |

Always `(Disc N)`, not `(Disc N of M)` or `CD1`.

## Keep version / revision info

| Before | After |
|---|---|
| `Pokemon Crystal (USA) (Rev 1).gbc` | `Pokemon Crystal (USA) (Rev 1).gbc` |
| `Street Fighter Alpha 2 (USA) (v1.1).chd` | `Street Fighter Alpha 2 (USA) (v1.1).chd` |

Region, `(Rev N)`, `(v1.1)`, and `(Disc N)` are meaningful — keep them. Everything else in brackets/parens is usually noise.

## Cartridge ROMs — leave well-named files alone

Cartridge systems (nes, snes, gb, gbc, gba, n64, genesis, etc.) match by checksum. A file like `Super Mario World (USA).sfc` is already fine — don't churn it. Only act when the name is clearly broken:

| Before | After | Reason |
|---|---|---|
| `smw.sfc` | `Super Mario World (USA).sfc` | uninformative; safe to improve |
| `Super Mario World (USA).sfc` | *(leave unchanged)* | already clean |
| `Chrono_Trigger_[!].sfc` | `Chrono Trigger (USA).sfc` | strip noise |

## NEVER

- **Never change the extension.** `.z64` stays `.z64`; `.cue`/`.bin` pairs keep both extensions.
- **Never rename arcade/MAME zips.** `mslug.zip`, `sf2ce.zip`, `kof98.zip` must keep their exact names — MAME matches the set name. Only sort them into `arcade/` or `mame/`.
- **Never invent a region.** If region is genuinely unknown, omit the `(Region)` suffix and flag in NEEDS REVIEW rather than guessing.

## Multi-file disc sets (`.cue` + `.bin`)

When a disc is stored as a `.cue` plus one or more `.bin` tracks, rename the `.cue` to the clean game name and rename the `.bin`(s) to match the names referenced **inside** the `.cue` file — otherwise the cue's track references break. If editing the cue's internal references is risky, prefer leaving a `.cue`/`.bin` set untouched and flag it, or recommend converting to `.chd` (single-file, easiest to name). Single-file `.chd`/`.iso` have none of this complication — prefer them.

# System Mapping

How to identify a file's system from its extension and/or current subfolder, and the canonical folder name to sort it into.

## Canonical system folder names

Lowercase, short. These are the only folders that should appear under `roms/`:

`nes snes n64 gb gbc gba nds genesis mastersystem gamegear saturn dreamcast ps1 ps2 psp gamecube wii tg16 neogeo arcade mame`

If a file's system isn't on this list, **flag it in NEEDS REVIEW** and propose a name — never invent and silently apply a new folder.

## Extension → system

Cartridge/handheld systems usually identify cleanly by extension:

| Extension | System | Folder | Match type |
|---|---|---|---|
| `.nes` | Nintendo Entertainment System | `nes` | checksum |
| `.sfc` `.smc` | Super Nintendo | `snes` | checksum |
| `.n64` `.z64` `.v64` | Nintendo 64 | `n64` | checksum |
| `.gb` | Game Boy | `gb` | checksum |
| `.gbc` | Game Boy Color | `gbc` | checksum |
| `.gba` | Game Boy Advance | `gba` | checksum |
| `.nds` | Nintendo DS | `nds` | checksum |
| `.md` `.gen` `.bin` (Sega) | Sega Genesis / Mega Drive | `genesis` | checksum |
| `.sms` | Sega Master System | `mastersystem` | checksum |
| `.gg` | Sega Game Gear | `gamegear` | checksum |
| `.pce` | TurboGrafx-16 / PC Engine | `tg16` | checksum |
| `.iso` `.cso` (PSP) | PlayStation Portable | `psp` | filename (disc) |
| `.chd` `.cue` `.bin` `.iso` | disc system — see below | varies | **filename** |
| `.zip` (arcade set) | Arcade / MAME | `arcade` or `mame` | exact zip name |

## Disc-based systems — extension alone is ambiguous

`.chd`, `.iso`, `.cue`/`.bin` are shared across PS1, PS2, Saturn, Dreamcast, GameCube, Wii, Neo Geo CD. Disambiguate by:

1. **Current subfolder** — a `PS2/` or `ps2/` parent is strong evidence.
2. **Disc size** — PS1 ≈ 100s of MB; PS2/GameCube/Wii ≈ multiple GB; Dreamcast GD-ROM ≈ 1 GB.
3. **GameCube/Wii** also use `.rvz`, `.gcm`, `.wbfs` → `gamecube` / `wii` unambiguously.

If still ambiguous after these, **flag it** — do not guess between, say, ps1 and saturn.

| Disc system | Folder | Hints |
|---|---|---|
| PlayStation | `ps1` | `.chd`/`.cue`+`.bin`, ~hundreds of MB |
| PlayStation 2 | `ps2` | `.iso`/`.chd`, multi-GB |
| Sega Saturn | `saturn` | `.chd`/`.cue`, often multi-`.bin` |
| Dreamcast | `dreamcast` | `.chd`/`.gdi`/`.cdi` |
| GameCube | `gamecube` | `.rvz`/`.gcm`/`.iso` ~1.4 GB |
| Wii | `wii` | `.rvz`/`.wbfs`/`.iso` ~4.7 GB |
| Neo Geo (CD) | `neogeo` | `.chd`/`.cue` |

## BIOS files → `bios/` (never a system folder)

Recognize by name, not extension. Common ones:

- PlayStation: `scph1001.bin`, `scph5500.bin`, `scph5501.bin`, `scph7502.bin`, any `scph*.bin`
- GBA: `gba_bios.bin`
- Sega CD / Saturn: `bios_CD_*.bin`, `sega_101.bin`, `mpr-*.bin`
- Neo Geo: `neogeo.zip` (BIOS set — flag, as it lives with arcade sets)
- Dreamcast: `dc_boot.bin`, `dc_flash.bin`
- PS2: `*.bin` ROM images named `rom1`/`rom2`/`erom`

When unsure whether a `.bin` is a BIOS or a disc track, check the filename pattern and size — flag if ambiguous.

## Emulator executables / support files → `emulators/`

`.exe`, emulator install folders (RetroArch, PCSX2, Dolphin, DuckStation), config/save folders that ship with an emulator. These are not ROMs — sort them under `emulators/` and don't rename.

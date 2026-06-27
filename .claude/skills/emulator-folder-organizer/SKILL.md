---
name: emulator-folder-organizer
description: Organize an emulator ROM folder into a clean roms/bios/emulators structure that maximizes Playnite artwork matching, with a mandatory revert manifest and an undo mode. Use when the user wants to organize ROMs, sort an emulator folder, clean up ROM filenames, fix Playnite art matching, structure a RetroArch/emulator library, asks why Playnite won't match their game art, or wants to revert/undo a previous ROM reorganization.
allowed-tools: Read, Grep, Glob, Write, Bash(Get-ChildItem:*), Bash(New-Item:*), Bash(Move-Item:*), Bash(Rename-Item:*), Bash(Test-Path:*), Bash(Get-FileHash:*)
metadata:
  type: automation
  domain: file-organization
---

# Emulator Folder Organizer

Organize a user's emulator ROM folder into a clean, predictable structure that maximizes Playnite artwork matching. Operates on a real folder the user provides (e.g. `E:\Emulators`). Always works in two phases — scan & plan, then execute — and never moves or renames a file before the user approves the plan.

## When to Use This Skill

- User wants to organize, sort, or clean up an emulator / ROM folder
- User wants to maximize Playnite (or another frontend) artwork matching
- ROM filenames are messy (scene tags, dump codes, underscores) and need cleaning
- User asks why Playnite won't match art to their disc games
- User has games **already imported** into Playnite that show blank/missing box art (this is a *diagnosis* task, not a file-org task — see below)

## Why naming drives the whole task

Playnite matches **cartridge ROMs by checksum** (the filename barely matters — only fix clearly broken names) but matches **disc games (`.chd`/`.iso`) by filename**. So disc-game naming is where almost all the matching value is — clean those carefully and leave well-named cartridge ROMs alone. This is the core reasoning behind every rule below.

## Diagnosing missing box art (already-imported games — NOT a file-org task)

If the user's games are **already in Playnite** but show blank tiles, do **not** jump into the scan-and-plan reorg below — renaming files won't fix entries Playnite has already imported. Playnite matches against the **stored game Name from import time**, so the fix is usually *in-app* (Edit Name → Download Metadata), not on disk. Read `references/playnite-art-matching.md` first. Key points:

- A clean `.cue` filename is what disc games match on — messy `.bin` track names or folder names don't matter. Check the `.cue`.
- Comma-flipped articles in the **displayed tile name** (`Zelda, The -`) are the #1 blocker; fix the Name in-app, then Download Metadata.
- ROM hacks / homebrew have no official art anywhere — SteamGridDB or a manual cover only.
- Recommend adding the **SteamGridDB** metadata source for widest coverage.

Only fall through to the file reorganization phases below if the goal is genuinely to clean/restructure files on disk (or the user wants a remove-and-reimport).

## Phase 1 — Scan & Plan (never touches files)

**Purpose:** produce a complete before → after plan for the user to approve.

1. **Get the folder path and confirm safety.** Ask for the root path if not given. Confirm the folder is backed up, or that the user accepts the risk of in-place moves/renames.
2. **Recursively read the folder.** Use `Glob` / `Get-ChildItem` to enumerate every file. Record each file's current full path, extension, and current subfolder.
3. **Identify each file's system** by extension and/or current subfolder name. See `references/system-mapping.md` for the extension → system table and the canonical system folder names.
4. **Classify each file** as: ROM (cartridge), disc game, BIOS, emulator executable/support, or unknown.
5. **Compute the target path** for each file under the target structure (below), applying the naming rules.
6. **Present the plan as a table** — `old path → new path` — grouped by system. Flag anything uncertain in a **NEEDS REVIEW** section (unknown system, possible bad dump, ambiguous region, unlisted system folder). **Do not touch any file in this phase.**

### Target structure

```
<root>/
  roms/<system>/Game Name (Region).ext
  bios/
  emulators/
```

System folder names (lowercase, short): `nes snes n64 gb gbc gba nds genesis mastersystem gamegear saturn dreamcast ps1 ps2 psp gamecube wii tg16 neogeo arcade mame`. Propose and **flag** any system not on this list rather than inventing a folder silently.

### Naming rules (these drive Playnite matching)

- **Format:** `Game Name (Region).ext`. Regions: `(USA)` `(Europe)` `(Japan)` `(World)`.
- **Cartridge ROMs** match by checksum — only fix a clearly broken name; otherwise leave as-is.
- **Disc games** (`.chd`/`.iso`) match by filename — clean these carefully; naming matters most here.
- **Keep leading articles at the FRONT** — `The Legend of Zelda...`, not `Legend of Zelda, The`. Moving the article breaks Playnite matching.
- **Multi-disc:** append `(Disc 1)`, `(Disc 2)`.
- **Strip** scene tags, dump/release group codes, `[!]` good-dump markers; convert underscores → spaces. **Keep** region, version (e.g. `(Rev 1)`), and disc info.
- **NEVER change a file extension.**
- **NEVER rename arcade/MAME ROMs** — the exact zip name is required for matching. Only sort them into `arcade/` or `mame/`.
- **BIOS files** (`scph*.bin`, `gba_bios.bin`, etc.) go into `bios/`, never a system folder.

See `references/naming-rules.md` for worked before → after examples of each rule.

## Phase 1.5 — Write the revert manifest (MANDATORY, before any file moves)

**Purpose:** capture a full revert map so every change can be undone, and an integrity record so corruption/loss is detectable. This phase is not optional — do not move a single file until the manifest is written and confirmed readable.

1. **Choose a manifest location OUTSIDE the target folder** so it can't be caught up in the operation. Default: `C:\emulator-reorg\manifest-<YYYY-MM-DD-HHMM>.json`. Create the directory with `New-Item -ItemType Directory -Force` if needed. (Get the timestamp from the user or the environment's current date — script time functions are unavailable.)
2. **Record every file** in the approved plan as a manifest entry:
   - `originalPath` — full original path
   - `newPath` — planned destination
   - `sizeBytes` — file size
   - `sha1` — `(Get-FileHash -Algorithm SHA1 "<path>").Hash` (MD5 acceptable if SHA-1 is too slow on a huge library)
   - `status` — `"pending"`
3. **Write the manifest** with `Write`, then **confirm it is readable** (`Read` it back, or `Test-Path` + a length check). If the manifest can't be written or read, **stop** — do not proceed to Phase 2.

Manifest shape:
```json
{
  "root": "E:\\Emulators",
  "createdAt": "2026-06-13-1530",
  "entries": [
    { "originalPath": "E:\\Emulators\\FF7_d1_[!].chd", "newPath": "E:\\Emulators\\roms\\ps1\\Final Fantasy VII (USA) (Disc 1).chd", "sizeBytes": 705032704, "sha1": "A1B2...", "status": "pending" }
  ]
}
```

## Phase 2 — Execute (only after explicit approval AND a confirmed manifest)

**Purpose:** apply the approved plan and report exactly what changed.

1. Wait for explicit approval of the Phase 1 plan. If the user amends it, re-show the affected rows **and regenerate the manifest** before proceeding.
2. Confirm the Phase 1.5 manifest exists and is readable. If it doesn't, go back and write it — never execute without it.
3. Create the target folders (`roms/<system>/`, `bios/`, `emulators/`) with `New-Item -ItemType Directory -Force`.
4. **Move/rename one file at a time** with `Move-Item` (quote every path — ROM names contain spaces and parentheses). After each successful move, **update that entry's `status` to `"done"`** in the manifest so a mid-run failure leaves an accurate record of exactly what was and wasn't changed. Never overwrite — if a destination exists, skip it, set `status` to `"skipped"`, and add it to NEEDS REVIEW.
5. Skip anything in NEEDS REVIEW that the user didn't resolve — do not guess.
6. **Output a change log** (every move/rename, old → new) and a final **NEEDS REVIEW** list of everything skipped and why.
7. Confirm completion with a summary count: files moved, files renamed, files skipped, folders created — and state the manifest path so the user knows how to revert.

## Revert mode — undo a previous reorganization

Triggered when the user asks to revert/undo, or provides a manifest path. Because moving/renaming doesn't change file contents, the manifest alone is enough to reverse every change.

1. **Locate and Read the manifest** (ask for the path, or look in `C:\emulator-reorg\`). If multiple exist, confirm which one.
2. For each entry with `status: "done"`: **verify the file at `newPath` still matches its recorded `sha1`** before moving it back. On a checksum **mismatch** (file changed/corrupted) or if `newPath` is missing, **flag it and skip** — never blindly overwrite or move a file whose integrity is in doubt.
3. Move each verified file from `newPath` back to `originalPath` with `Move-Item`. If `originalPath` already has a file, skip and flag rather than overwrite.
4. Entries with `status: "pending"` or `"skipped"` were never moved — leave them.
5. **Output a revert log** (each file moved back, old → original) and a **COULD NOT REVERT** list with reasons (checksum mismatch, missing file, occupied original path). Finish with a summary count.

## Safety checks (read before Phase 2)

- IMPORTANT: never move or rename anything in Phase 1. Plan only.
- IMPORTANT: never start Phase 2 without a written, readable revert manifest stored OUTSIDE the target folder (Phase 1.5).
- IMPORTANT: never overwrite an existing destination file — skip and flag instead. The same applies in revert mode.
- IMPORTANT: in revert mode, verify the recorded checksum before moving a file back; flag mismatches rather than overwriting.
- Never change a file extension under any circumstance.
- Never rename an arcade/MAME zip — sorting into a folder is the only allowed action.
- Confirm the backup/risk acknowledgement before the first `Move-Item`.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index. (This skill's domain — emulator/ROM organization — is unrelated to the current FoodBytes rules, but check anyway in case relevant rules are added later.)

## Success Criteria

- A before → after table was presented and approved before any file moved.
- A revert manifest (original path, new path, size, checksum, per-file status) was written outside the target folder and confirmed readable before Phase 2.
- Every file lands under `roms/<system>/`, `bios/`, or `emulators/` — nothing left loose at the root.
- Disc games (`.chd`/`.iso`) follow `Game Name (Region).ext` with leading articles at the front.
- No file extension changed; no arcade/MAME zip renamed; no destination overwritten.
- A complete change log and a NEEDS REVIEW list were produced, plus a summary count.
- Verify with: `Get-ChildItem <root> -Recurse -File | Where-Object { $_.DirectoryName -notmatch '\\(roms|bios|emulators)' }` returns nothing (everything is sorted).

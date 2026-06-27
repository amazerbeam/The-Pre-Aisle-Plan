# Diagnosing missing box art in Playnite

This skill organizes files on disk. But when a user asks "why won't Playnite match art?", the cause is often **not** the filename — the games may already be imported and the fix is *inside Playnite*, not on disk. Use this guide for that diagnosis. Ask for screenshots of the blank tiles if you can't see the library directly; the displayed name on each tile is the key clue.

## The single most important fact

**Playnite stores a game's `Name` at import time.** Metadata matching runs against that stored Name, not against the file on disk. So:

- **Renaming the file does NOT fix an already-imported game.** The stale Name stays in Playnite's database. Editing the file only helps a *future* import.
- For games already in the library, the fix is **in-app**: right-click → **Edit** → correct the **Name** → then **Download Metadata**. Or remove the entry and re-scan after fixing the file.
- Only choose the file-rename route if the user wants a clean remove-and-reimport anyway. Otherwise in-app editing is faster and less disruptive.

This flips the skill's on-disk naming advice: naming matters for **import**; for **fixing existing blanks**, work in Playnite.

## Disc games match via the `.cue`, not the `.bin`

A PS1 game stored as 20–50 raw `.bin` tracks plus one `.cue` matches on the **`.cue` filename**. If the `.cue` is cleanly named (`Tekken (USA).cue`), the game matches fine regardless of how messy the folder or the `.bin` track names are. Don't be misled into "fixing" track names or folder names — check the `.cue` name. (No `.cue` at all is a different, real problem: the set may not import/launch.)

## Why a tile is blank — categories and fixes

| Cause | Tell-tale | Fix |
|---|---|---|
| **Comma-flipped article** | Tile shows `Zelda, The -` / `Simpsons, The -` | Edit Name to article-first (`The Legend of Zelda - ...`), then Download Metadata. Batch-select siblings. |
| **ROM hack / homebrew** | Names like `Nameless Fire Red`, `... Omega` | No official art exists anywhere. Use **SteamGridDB** (community art) or set a manual cover. Renaming never helps. |
| **Foreign / regional title** | Japanese name for a Western release (`Bare Knuckle` = Streets of Rage) | Download Metadata and search the **canonical Western title**. |
| **Abbreviation** | `PES 2014` vs `Pro Evolution Soccer 2014` | Search the full canonical name in the Download Metadata dialog. |
| **Edition/suffix drift** | `... - Black Edition`, `... (Rerelease)` | Search the base title; or pull just the Cover Image from another source. |
| **Provider gap** | Real game, but its exact entry isn't in IGDB results | Scroll the result list; if absent, switch the **Cover Image** source to SteamGridDB or set a custom image. |

## UI gotchas (users get stuck here)

- **The library search/filter box is NOT the metadata search.** Typing a name top-left only filters the visible list. To fetch art you must open the **Download Metadata** dialog and search *there*.
- **Download Metadata** is on the right-click menu — but **some themes/menus omit it**. Fallback: right-click → **Edit** (F3) → **Download Metadata** button at the top of the editor, or the per-field source picker on **Cover Image**.
- You don't need a full metadata match just for art: the **Cover Image** field can pull from a different source independently, so a provider gap on details needn't leave the tile blank.

## Recommend installing SteamGridDB

For any art-matching session, recommend adding the **SteamGridDB** metadata source (Add-ons → Browse). It has the widest box-art coverage, catches many ROM hacks, and is the fallback when IGDB lacks an entry.

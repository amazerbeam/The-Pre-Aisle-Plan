---
name: plex-media-namer
description: Convert messy movie and TV file/folder names into Plex Media Server's official naming convention, looking up real episode titles from the web, and returning corrected folder paths and filenames. Use when the user wants to rename media for Plex, fix Plex naming, organise a movie or TV library, add real episode titles, asks why Plex won't match or scan their files, or pastes a list of media filenames to clean up.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
metadata:
  type: reference
  domain: media-organisation
---

# Plex Media Namer

Apply Plex Media Server's official file and folder naming conventions exactly. Given a list of movie and/or TV filenames or folder names, return the corrected Plex-compliant paths. The goal is reliable scanner matching — the year (movies) and the `sXXeXX` token (TV) are what Plex's agents key on.

## When to Use This Skill

- User pastes a list of movie/TV filenames or folders to reorganise for Plex.
- User asks why Plex won't match, scan, or correctly identify their media.
- User wants to set up or clean up a Plex Movies or TV Shows library.
- User asks how to name a specific edition, multi-version, special, miniseries, or date-based episode.
- User wants real episode titles looked up and embedded in the filenames.

## Top-Level Rule (non-negotiable)

Movies and TV shows live in **completely separate root libraries** — `/Movies` and `/TV Shows`. Never mix content types in one folder; Plex's scanners misbehave when they do. The first decision for every input is: **is this a movie or a TV episode?** Classify before formatting.

Classification cues:
- TV → has any season/episode token (`s01e01`, `1x01`, `S1.E1`, `Season 2 Episode 3`, `- 101 -`), a date stamp on an episodic show, or a known series name.
- Movie → a title with a single release year and no episode token.
- Ambiguous → state the assumption you made and offer the alternative rather than guessing silently.

## Movies

Structure:

```
/Movies/Movie Name (Year)/Movie Name (Year).ext
```

Rules:
- Each film gets its **own folder** named `Movie Name (Year)`.
- The filename **matches the folder**: `Movie Name (Year).ext`.
- The **year in parentheses is the single most important element** for matching — always include it. If the input lacks a year, flag it as the highest-priority gap.
- **Multiple versions/qualities of the same film** stay in the one movie folder, distinguished by an arbitrary suffix after a hyphen:
  - `The Matrix (1999) - 1080p.mkv`
  - `The Matrix (1999) - 4K HDR.mkv`
- **Different cuts** use the edition tag in curly braces:
  - `Blade Runner (1982) {edition-Final Cut}.mkv`

Example:

```
/Movies/Inception (2010)/Inception (2010).mkv
```

## TV Shows

Structure:

```
/TV Shows/Show Name (Year)/Season XX/Show Name (Year) - sXXeXX - Optional Title.ext
```

Rules:
- Each show gets its **own folder** named `Show Name (Year)`, with the show's **first-air year** in parentheses (strongly recommended for the Plex TV Series agent — include it even when the input omits it, noting it as an assumption if you inferred it).
- One **subfolder per season**, named with the literal English word `Season` + two-digit number: `Season 01`, `Season 02`. Use `Season` even for non-English content.
- The critical filename element is the **`sXXeXX` token** — two digits each (`s02e17` = Season 2, Episode 17). Normalise any input format (`2x17`, `S2E17`, `Ep17`) into `sXXeXX`.
- Separators between filename elements (dashes, dots, spaces) **don't matter** to Plex — pick one and stay consistent.
- An **episode title after the token is optional** — Plex fetches real titles from its database. To force extra text to be **ignored during matching**, wrap it in square brackets: `[1080p Bluray]`.

Special cases:
- **Specials** → `Season 00` (or a folder literally named `Specials`), using `s00eXX`.
- **Miniseries** → treat as a single season — always `Season 01`.
- **Date-based shows** (talk/news) → `Show Name (Year) - YYYY-MM-DD - Optional Title.ext` instead of `sXXeXX`.
- **Multi-episode single file** → `Show Name (Year) - s02e17-e18.ext`.

Example:

```
/TV Shows/Band of Brothers (2001)/Season 01/Band of Brothers (2001) - s01e01 - Currahee.mkv
```

## Looking Up Episode Titles

Plex fetches titles itself, but when the user wants real titles embedded in the filenames, look them up online before emitting paths. The title is convenience text, not match-critical data — so accuracy of the **show, year, season, and episode number** still comes first; a wrong title is cosmetic, a wrong `sXXeXX` breaks matching.

1. **Confirm the series and first-air year first** — search the show name to lock the correct series (disambiguate remakes/reboots, e.g. multiple shows named the same). The year you settle on becomes the folder year.
2. **Fetch the per-season episode list** with `WebSearch` then `WebFetch` on an authoritative source (Wikipedia's "List of <show> episodes" page, IMDb, or TheTVDB — TheTVDB is what the Plex TV agent itself uses, so prefer it when titles must align with Plex's own match).
3. **Map titles by `sXXeXX`**, not by guessing order. Verify the episode count per season matches so titles don't shift by one (a common error when a two-part premiere is numbered `e01-e02` on one source and `e01`,`e02` on another).
4. **Sanitise titles for filesystems** — strip or replace characters illegal on the target OS (`\ / : * ? " < > |` on Windows), collapse the rest. Keep the title human-readable; it is optional text Plex ignores during matching.
5. **Flag, don't invent** — if a source disagrees or a title can't be confirmed, emit the path **without** the optional title (still fully valid Plex form) and note it in the "Needs your input" list rather than fabricating a title.

Batch lookups by show+season (one fetch per season list), not one search per episode.

## Workflow

1. **Classify** each input as movie or TV (see cues above). Sort into the two separate root libraries.
2. **Extract** the title, year, and — for TV — season/episode (or date). Normalise tokens to `sXXeXX` / two-digit seasons.
3. **Look up episode titles** (TV, when titles are wanted) per "Looking Up Episode Titles" above — confirm series/year, fetch the season list, map by token, sanitise.
4. **Detect special cases**: edition/cut, multiple qualities of one film, specials, miniseries, date-based, multi-episode.
5. **Emit** the full corrected path for each item, preserving the original extension.
6. **Flag gaps**: missing year, unknown first-air year, unconfirmed episode title, or ambiguous classification — surface these explicitly rather than fabricating data. The year/token is what matching depends on, so a guessed year is worse than a flagged unknown.

## Output Format

Return a table or a clear before → after list. Always show the **full path**, not just the filename. Group by library (`/Movies` first, then `/TV Shows`). End with a short "Needs your input" list for any flagged gaps (missing/uncertain years, ambiguous items).

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

## Success Criteria

- Movies and TV are never mixed in one root folder.
- Every movie path is `/Movies/Title (Year)/Title (Year).ext` with the filename matching its folder.
- Every standard TV path is `/TV Shows/Show (Year)/Season XX/Show (Year) - sXXeXX[ - Title].ext` with two-digit season and episode numbers.
- Multiple qualities share one movie folder (hyphen suffix); cuts use `{edition-...}`; specials use `Season 00`/`s00eXX`; miniseries use `Season 01`; date-based shows use `YYYY-MM-DD`; multi-episode files use `sXXeXX-eXX`.
- When titles are requested, each is looked up from an authoritative source, mapped by `sXXeXX` (not order), and filesystem-sanitised; unconfirmed titles are omitted, not invented.
- Every missing or inferred year, unconfirmed title, and ambiguous classification is flagged rather than silently guessed.

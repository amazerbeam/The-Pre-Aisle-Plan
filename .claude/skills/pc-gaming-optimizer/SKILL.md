---
name: pc-gaming-optimizer
description: Diagnose and fix Windows PC gaming performance issues — graphics settings that reset, sub-optimal in-game video config, monitor refresh rate mismatches, and hardware upgrade decisions. Triages OneDrive-induced config corruption, applies community-accepted competitive max-FPS settings (Overwatch 2 specifically supported), detects hardware via CIM, and gives brutally honest upgrade advice grounded in input-lag math and £/FPS value. Use when the user asks why their game settings keep resetting, wants max FPS / competitive graphics settings, asks "what CPU/GPU should I get" for gaming, reports low FPS in a shooter, asks about monitor refresh rate problems, or specifically wants Overwatch 2 graphics tuning.
allowed-tools: Read, Edit, Write, Grep, Glob, PowerShell, Bash, WebSearch, WebFetch
metadata:
  type: hybrid
  domain: pc-gaming
---

## Overview

PC gaming problems on Windows fall into three buckets that look similar but have different fixes: **environmental** (OneDrive eating your config), **configuration** (graphics settings leaving FPS on the table), and **hardware** (CPU/GPU/monitor mismatch). The wrong fix wastes time or money — a £300 CPU buying 0.6 ms of input lag is worse than free; a read-only config file stops the resets but freezes keybinds and sensitivity.

This skill always runs in order: **environment → settings → hardware**. Never recommend a hardware purchase before confirming the cheap fixes are in place and the monitor is actually doing what the user paid for.

## When to Use This Skill

- "My [game] graphics settings keep resetting"
- "What are the best Overwatch settings for FPS?" / "competitive settings"
- "Why am I only getting [N] FPS?" in a competitive shooter
- "What CPU should I upgrade to?" / "Is my CPU bottlenecking me?"
- "My monitor is supposed to be 360 Hz but Windows says 60"
- Any combination of game name + "FPS" / "stutter" / "lag"

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

## Core workflow

### Phase 1 — Environment audit (always first)

The most common cause of "my settings keep resetting" is **OneDrive racing the game on writes** to a config file inside a redirected Documents folder. Always check first:

```powershell
$docs = [Environment]::GetFolderPath('MyDocuments')
"Documents path: $docs"
"OneDrive root: $env:OneDrive"
```

If `$docs` starts with the OneDrive root, the user's Documents is redirected into OneDrive. Any game writing to `Documents\<Game>\` is at risk. Symptoms:

- Graphics settings revert to defaults sporadically (not every launch).
- The config file's `LastWriteTime` is recent but the *content* is older than expected.
- OneDrive shows a "conflict copy" of the config file.

**Fix — directory junction** (preferred):

1. Close the game, its launcher (Battle.net), and Steam (verify with `Get-Process`).
2. Move the game's config folder out of OneDrive:
   ```powershell
   Move-Item "$env:USERPROFILE\OneDrive\Documents\<Game>" "$env:USERPROFILE\Documents-Local\<Game>"
   ```
3. Replace the original path with a junction:
   ```cmd
   mklink /J "C:\Users\<user>\OneDrive\Documents\<Game>" "C:\Users\<user>\Documents-Local\<Game>"
   ```
4. Verify: `Get-Item` on the junction path should show `LinkType : Junction`.

**Why not just make the config file read-only?** It stops the reset but also stops the game from saving keybinds, per-hero sensitivity, audio sliders, FOV — anything the user changes in-game vanishes on exit. The junction fix keeps writes working; OneDrive ignores junctions.

### Phase 2 — Settings audit (applies regardless of hardware)

Apply settings before recommending any hardware spend. Cheap fixes first.

For Overwatch 2 specifically, the canonical file is `%USERPROFILE%\Documents\Overwatch\Settings\Settings_v0.ini` (resolve OneDrive redirection from Phase 1). Both Battle.net and Steam launchers write to the same file. **Always back up before editing:**

```powershell
Copy-Item $ini "$ini.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"
```

#### Overwatch 2 Settings_v0.ini — competitive max-FPS field map

| Field | Recommended | Range / meaning | Why |
|---|---|---|---|
| `GFXPresetLevel` | `5` | 0=Low, 1=Med, 2=High, 3=Epic, 4=Ultra, 5=Custom | **Must be 5** or individual fields below are ignored |
| `TextureDetail` | `3` | 0=Low ... 3=Ultra | Free FPS on ≥8 GB VRAM, sharper enemy outlines |
| `ModelQuality` | `0` | 0=Low ... 3 | Removes prop polys, pros run Low |
| `EffectsQuality` | `0` | 0=Low ... 3 | Big win in ult-heavy teamfights |
| `LightQuality` | `0` | 0=Low ... 3 | Negligible visual loss |
| `LocalFogDetail` | `0` | 0=Low ... 3 | Clearer visibility through smoke |
| `LocalReflections` | `0` | 0=off, 1=on | Free FPS |
| `SSAODetail` | `0` | 0=off, 1+=on | Free FPS, slightly flatter look |
| `SSLRDetailLevel` | `0` | 0=off | Screen-space reflections off |
| `RefractionDetail` | `0` | 0=low | |
| `DirectionalShadowDetail` | `1` | 0=off, 1=low, 2+=higher | **Keep shadows** — they reveal enemies around corners |
| `AnisotropicFiltering` | `1` | 0=off, 1=on | Effectively free on modern GPUs |
| `MaxAnisotropy` | `16` | up to 16 | 16× AF costs ~nothing |
| `AADetail` | `0` | 0=off, 1=FXAA Low ... | Sharper image; AA blurs at high FPS |
| `VerticalSyncEnabled` | `0` | 0=off | V-Sync adds 1–3 frames of input lag |
| `DynamicRenderScale` | `0` | 0=off | Pin render scale at 100% |
| `ReflexMode` | `2` | 0=off, 1=on, 2=on+boost | NVIDIA Reflex Enabled + Boost on 30/40-series |
| `DLSSPerformanceQualityMode` | `5` | 5=off (effectively) | Temporal upscalers ghost on fast-moving Tracer/Genji — competitive guides reject |
| `FrameRateCap` | `≥ monitor refresh` or higher | numeric | With Reflex on, the cap is for sanity; Reflex handles latency |
| `FullScreenWidth` / `FullScreenHeight` / `FullScreenRefresh` | native | | Confirm refresh matches monitor's max |

**Apply pattern:** use Edit on the .ini, one field at a time (preserves section headers and other settings). Make sure the game and launchers are fully closed first — otherwise the game overwrites the file with in-memory values on exit.

**FOV:** lives in match/account settings, not this file. Verify it's set to **103** (community-unanimous max) in-game.

#### Other competitive shooters (general principles)

If the game isn't Overwatch 2, apply the same philosophy and look up the game's specific config:
- Display Mode: **Exclusive Fullscreen** (bypasses Windows compositor)
- V-Sync: **off** (use G-Sync/FreeSync if monitor supports)
- Textures: **High/Ultra** if VRAM allows (free)
- Shadows: **Low** but not Off (gameplay-relevant)
- Effects/Foliage/Post-processing: **Low/Off**
- Anti-aliasing: **Off** or lightest available
- NVIDIA Reflex / AMD Anti-Lag: **on + boost**
- Frame Rate Cap: **monitor refresh** or higher

### Phase 3 — Hardware audit (only after Phases 1 + 2)

Detect specs first, then reason about them. Never recommend purchases blind.

```powershell
# CPU
Get-CimInstance Win32_Processor |
  Select Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed
# GPU + current display mode
Get-CimInstance Win32_VideoController |
  Select Name, AdapterRAM, DriverVersion,
         CurrentHorizontalResolution, CurrentVerticalResolution,
         CurrentRefreshRate, MaxRefreshRate
# Motherboard + chipset hint
Get-CimInstance Win32_BaseBoard | Select Manufacturer, Product, Version
# BIOS version + date (matters for CPU compatibility flashing)
Get-CimInstance Win32_BIOS | Select Manufacturer, SMBIOSBIOSVersion, ReleaseDate
# RAM modules + actual running speed
Get-CimInstance Win32_PhysicalMemory |
  Select Manufacturer, PartNumber, Capacity, Speed, ConfiguredClockSpeed
# Monitor identity from EDID
Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID |
  ForEach-Object {
    $name = -join ($_.UserFriendlyName | Where {$_ -ne 0} | ForEach {[char]$_})
    "$name (manufacture year $($_.YearOfManufacture))"
  }
```

#### Socket-compatibility cheat sheet (Intel — most common Coffee Lake era boards in this repo's user base)

| Chipset | Socket | Compatible CPUs | Dead-end? |
|---|---|---|---|
| H310 / B360 / H370 / Z370 / Z390 / B365 | LGA 1151 rev 2 | 8th + 9th gen Coffee Lake / Coffee Lake Refresh | **Yes** — peaks at i9-9900K/KF |
| H410 / B460 / H470 / Z490 | LGA 1200 | 10th + 11th gen | Yes — peaks at i9-11900K |
| H510 / B560 / H570 / Z590 | LGA 1200 | 10th + 11th gen | Yes |
| H610 / B660 / H670 / Z690 | LGA 1700 | 12th + 13th + 14th gen | Yes — peaks at i9-14900K |
| H810 / B860 / Z890 | LGA 1851 | Core Ultra 200 series | Current platform |

For AMD: AM4 (Ryzen 1000–5000), AM5 (Ryzen 7000+). AM4 is a dead-end but a cheap 5800X3D upgrade is still excellent for gaming on a B450/X470/B550/X570 board.

**Always check the motherboard manufacturer's CPU support list** before recommending — chipset compatibility is necessary but not sufficient (BIOS version matters).

#### Monitor refresh rate sanity check

`CurrentRefreshRate` < `MaxRefreshRate` means **Windows is throttling the panel**. This is the single highest-impact free fix available. Possible causes:

- Windows display setting set wrong: Settings → Display → Advanced display → Refresh rate
- NVIDIA Control Panel → Change resolution → Refresh rate set lower than panel max
- Cable can't carry the bandwidth (DisplayPort 1.4 needed for 1440p @ 240Hz+; HDMI 2.1 for 4K @ 120Hz+)
- Monitor itself in a low-refresh OSD profile

Fix in this order: NVIDIA CP refresh → Windows display refresh → enable G-Sync (NVIDIA CP → Set up G-SYNC) → check cable.

**Monitor first warning:** if `CurrentRefreshRate` was 60 in one query and `MaxRefreshRate` is 360, the monitor may have been asleep when the first query ran. Re-query before alarming the user.

#### The brutally honest upgrade math

Compute input-lag delta before recommending any hardware spend:

```
Δms = (1000 / FPS_current) − (1000 / FPS_after_upgrade)
```

| Going from → to | Δms saved |
|---|---|
| 60 → 144 FPS | **9.7 ms** (huge, immediately felt) |
| 144 → 240 FPS | **2.8 ms** (felt by trained players) |
| 240 → 360 FPS | **1.4 ms** (measurable, barely felt) |
| 280 → 340 FPS | **0.6 ms** (sub-perceptual — not worth £300) |

Past 240 FPS the curve is flat. Below 144 FPS, almost any upgrade is worth it.

**Decision framework for "should I buy this CPU?":**

1. Is the user already at/near monitor refresh? → say so, don't recommend.
2. Is the user CPU-bottlenecked but on a dead socket? → compare same-socket drop-in vs platform refresh on £/FPS:
   - Same-socket: cheap, ~15–25% gain (e.g. 9700F → 9900KF: ~£300 for ~+20%).
   - Platform refresh (CPU + board + DDR5): 2–3× cost but 60–110% gain and a future upgrade path.
3. Is the user GPU-bottlenecked? → confirm via in-game stats (CPU util <70%, GPU util ~100%) before recommending GPU.
4. Has the user applied Phase 1 + 2 fixes? → require this before recommending hardware.

#### Order of recommendations (cheapest first, always)

1. Fix OneDrive (free, Phase 1).
2. Apply graphics settings (free, Phase 2).
3. Set Windows + NVIDIA refresh to monitor max + enable G-Sync (free).
4. Update GPU drivers, set NVIDIA Low Latency Mode = Ultra, enable HAGS in Windows (free).
5. Buy a high-refresh monitor if still on 60 Hz (~£150–£250 — single biggest perceived upgrade).
6. CPU/GPU upgrade — only if 1–5 are done and frames are still meaningfully below monitor refresh.

## Worked example (Overwatch 2 on RTX 4070 / i7-9700F / 360 Hz panel)

User reports settings resetting + asks "what CPU should I buy".

1. **Phase 1:** Documents is in OneDrive → apply junction fix → resets stop.
2. **Phase 2:** `GFXPresetLevel` was 1 (Medium), individual fields ignored. Switch to 5 + Custom values from the table → FPS goes from ~220 to ~280.
3. **Phase 3:** Detect AW2521H (360 Hz) — confirm `CurrentRefreshRate = 360`. Compute: 280 → 340 FPS from 9900KF = 0.6 ms saved = bad value. Recommend the user **not** buy the CPU. If frames felt stuttery in fights, recommend full platform refresh (Ryzen 5 7600 + B650 + DDR5) over same-socket 9900KF because £/FPS is 3× better.

## Brutal-honesty defaults (do not skip)

- **State the input-lag math.** If a £300 CPU buys <1 ms, say so explicitly. Numbers beat opinions.
- **Refuse to recommend dead-socket Intel upgrades silently.** If the socket is dead, the user must hear "this is a 2018 socket, your upgrade ceiling is fixed" before they spend.
- **Never recommend hardware before Phases 1 + 2.** A misconfigured `GFXPresetLevel` can hide 60+ FPS of free performance. Fixing that first changes what hardware advice even makes sense.
- **Confirm monitor is doing what it was paid for.** A 360 Hz monitor running at 60 Hz is the #1 free perf fix and is invisible without the EDID + refresh cross-check.
- **Don't oversell drop-in CPUs.** Hyperthreading and clock bumps help 1% lows more than averages — say that, don't promise an FPS number you can't verify.

## Success criteria

- Environment is confirmed (OneDrive redirection identified and fixed, or ruled out) before any settings work.
- Settings_v0.ini (or the game's equivalent) is backed up before editing, edits are field-by-field, and `GFXPresetLevel = 5` is set whenever per-field values are applied.
- Hardware detection has been run (CPU/GPU/board/BIOS/RAM/monitor) before any purchase recommendation.
- Monitor `CurrentRefreshRate` has been compared against `MaxRefreshRate` and discrepancies surfaced to the user.
- Input-lag delta in milliseconds is computed and quoted before recommending any hardware over £100.
- For dead-socket Intel boards (B365 etc.), the user is shown both the same-socket drop-in option and a full-platform-refresh option with £/FPS for each.
- The user is never sold a CPU upgrade for sub-1-ms latency gains without that fact being stated explicitly.

## NEVER SAY THESE PHRASES

- "Have you tried turning V-Sync off?" — check the config file directly.
- "It depends on your hardware." — detect the hardware, then say what it depends on.
- "You should upgrade your CPU." — without input-lag math + £/FPS framing.
- "Just make the file read-only." — it freezes keybinds and sensitivity changes.

## FORBIDDEN BEHAVIORS

- Recommending a hardware purchase before running Phase 1 + Phase 2.
- Editing Settings_v0.ini without backing it up first.
- Editing Settings_v0.ini while the game or launcher is running (the game overwrites it on exit).
- Telling the user their monitor is 60 Hz based on a single CIM query — re-query if `MaxRefreshRate` disagrees, the panel may have been asleep.
- Recommending a same-socket Intel CPU upgrade for a B365/Z390-era board without mentioning that the socket is dead-end.
- Quoting current CPU/GPU prices from training data — always WebSearch for current UK/region pricing before naming a number.

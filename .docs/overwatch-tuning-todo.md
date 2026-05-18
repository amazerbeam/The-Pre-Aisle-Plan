# Overwatch 2 Tuning — Todo List

**Baseline:** ~280 FPS (2026-05-16). Target: stable 320+ in fights, less ult-chaos dipping.

**Rig:** i7-9700F · RTX 4070 · 4×16GB CMK16GX4M1D3000C16 · ASRock B365M Pro4-F · Dell AW2521H 360Hz · Win11 25H2

---

## You (Joss) — BIOS / GUI / monitor

- [x] **Enable XMP** — done 2026-05-16. Verify in Windows post-reboot: `Get-CimInstance Win32_PhysicalMemory | Select Speed, ConfiguredClockSpeed` should now show 3000 (or 2666/2400 if you stepped down).
- [x] **Disable Memory Integrity** — Settings → Privacy & security → Windows Security → Device security → Core isolation → Memory Integrity OFF → reboot. *(5–15% FPS on no-HT chip)*
- [ ] **AW2521H OSD** — Menu button → Game → Response Time = **Super Fast** (not Extreme); Dark Stabilizer = **1**; HDR = Off; Preset = Standard or FPS
- [x] **NVIDIA Control Panel — per-game OW2 profile**
  - Shader Cache Size = **Unlimited**
  - Power Management = **Prefer Maximum Performance**
  - Low Latency Mode = **Ultra**
  - Texture Filtering – Quality = **High Performance**
  - Threaded Optimization = **On**
  - V-Sync = **On** (NVCP only — game stays Off)
  - G-SYNC = On (already native module)
- [ ] **Battle.net** → Settings → Downloads → uncheck **"Scan for updates while playing"**; bandwidth limit = 0

## Claude — scripted

- [x] Audit hardware + Settings_v0.ini + monitor
- [x] **Settings_v0.ini patched** (backup at `Settings_v0.ini.bak-20260516-172622`): EffectsQuality 4→0, LocalFogDetail 3→0, ModelQuality 2→0, PhysicsQuality 2→0, FrameRateCap 400→357
- [x] **"Optimizations for windowed games" = Off** (HKCU\Software\Microsoft\DirectX\UserGpuPreferences → SwapEffectUpgradeEnable=0; preserved AutoHDR + VRROptimize)
- [x] Scheduled tasks checked — Edge updater tasks not present on this system; MapsUpdateTask was **already Disabled**. Nothing to do.
- [x] **PCIe ASPM Off + Processor min 100%** — requires admin. Script written: `C:\Users\jossd\OneDrive\Documents\ow2-power-tweaks.bat` → right-click → Run as administrator
- [ ] Full LatencyMon run — separate tool, you'd download it (resplendence.com/latencymon). Not urgent unless you hear audio crackle in fights.

## Skip / not worth

- ~~i9-9900KF £150 same-socket upgrade~~ — 0.6 ms gain, dead socket, trap
- ~~Flash BIOS to P1.31~~ — only NVMe compat fix, leave unless XMP misbehaves
- ~~ReBAR force via NVIDIA Profile Inspector~~ — B365 doesn't support, ~2 FPS
- ~~Driver update past 591.86~~ — 576.xx and 600.xx have OW2 regressions
- ~~HDR / ULMB on AW2521H~~ — incompatible with competitive use

## If still unhappy after the above

- **Ryzen 5 7600X3D + B650 + 32GB DDR5-6000** ≈ £580 → +60–80% in OW2, AM5 alive through Zen 6.

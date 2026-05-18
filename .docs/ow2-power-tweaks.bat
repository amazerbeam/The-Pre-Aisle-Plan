@echo off
REM Run as Administrator. Right-click -> Run as administrator.
REM Applies to the ACTIVE power plan only. Reversible by reverting in Control Panel -> Power Options -> Change advanced power settings.

echo === Setting PCIe ASPM = Off on active plan ===
powercfg -setacvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0

echo === Setting Processor minimum state = 100%% on active plan ===
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100

echo === Activating changes ===
powercfg -setactive SCHEME_CURRENT

echo === Done. Current plan summary: ===
powercfg /getactivescheme
pause

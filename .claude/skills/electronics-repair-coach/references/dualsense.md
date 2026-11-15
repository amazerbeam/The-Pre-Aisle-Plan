# PS5 DualSense / DualSense Edge

> **Scope.** Structural (stable): fault patterns, diagnostic order, listing red flags, test checklist.
> Live (search each time): part prices, sold prices, which replacement sticks fit which board revision.

## Identify the board revision
All standard DualSenses are model CFI-ZCT1W; the internal board is **BDM-010 / -020 / -030 / -040 / -050**. Read it from the serial number on the back (17 chars, starts with a letter) or the board marking once opened. iFixit has per-version guides (V1–V5) — match the guide and the parts to the revision. Verify stick compatibility for BDM-050 before ordering; most third-party sticks advertise 010–040.

## Fault table

| Symptom | Likely cause | Fix | Solder? | Rung | Listing grade |
|---|---|---|---|---|---|
| Stick drift | Worn potentiometer (most common, ~60% of shop repairs) or debris | Clean (IPA/compressed air) → replace stick module (Hall effect/TMR upgrade) | Yes, many through-hole pins | 4 | Green once at rung 4; Amber before |
| Stick drift on **Edge** | Worn swappable module | Swap module (Sony part) | No | 1 | Green |
| Sticky / dead face buttons | Dirt, worn membrane | Strip, clean, replace membrane | No | 1 | Green |
| L1/R1 or trigger dead | Ribbon cable, button board | Reseat/replace ribbon | No | 2 | Green |
| Adaptive trigger grinding/limp | Trigger motor/gear | Replace motor/gear assembly | Sometimes | 3 | Amber |
| Charges only at an angle / flickering orange | Worn USB-C port | Port replacement (SMD, fiddly) | Yes | 5 | Amber |
| Won't charge, no orange light, good cable | Battery, charging circuit, board | Battery swap first; circuit = board-level | Battery no; circuit yes | 2 / 6 | Red unless cheap |
| Short battery life | Ageing cell (1,560 mAh, LIP1708) | Battery swap | No | 2 | Green |
| No power at all / liquid damage | Board-level | — | — | 6 | Red → parts only |

## Diagnostic order (cheapest first)
1. Known-good **data** USB-C cable into the PS5 (charge-only cables mimic a dead port). Wiggle test for the port.
2. PS button: does it pair? Lightbar colour?
3. Drift: PS5 has no built-in stick tester — use a PC with gamepadtester-style web tool to see centre offset and range per axis.
4. Every button, both triggers (adaptive resistance in a game/Astro's Playroom), touchpad, speaker, mic, haptics.
5. Open it only after the above narrows the fault.

## Listing triage
**Buy:** "drift only", "sticky button", cosmetic damage, Edge with drift, cheap donor lots for shells/ribbons/batteries.
**Avoid / parts-only:** "no power", "no lights", liquid, "untested", missing internals, no photo of the back, overseas bulk lots (shipping eats margin).
**Ask the seller:** photo of the serial on the back; does it charge from the PS5 with the original cable; which stick drifts and which direction; any drops or liquid.
**Search terms:** "DualSense faulty", "PS5 controller spares or repairs", "for parts" — filter Sold.

## Post-repair test checklist
Charge + pair, all buttons, L3/R3 clicks (a known issue with some Hall effect sticks), stick centre and full circularity on a tester, triggers' adaptive resistance, haptics, speaker, mic, touchpad, lightbar. Run a 30-minute play session before listing.

## Canonical sources
- iFixit DualSense device + troubleshooting: https://www.ifixit.com/Device/DualSense
- iFixit joystick replacement guide: https://www.ifixit.com/Guide/DualSense+Joystick+Replacement/142488
- ConsoleMods thumbstick replacement: https://consolemods.org/wiki/PS4:Thumbstick_Replacement
- iFixit charging troubleshooting: https://www.ifixit.com/Troubleshooting/DualSense/Controller+Not+Charging/538810

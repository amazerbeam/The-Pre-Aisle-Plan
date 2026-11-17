# Changelog

One line per ticket, newest first: `<version> — <ticket key>: <summary>`. Bump rules and how
to check what is deployed: `CLAUDE.md` → Versioning & deploy verification.
1.45.0 — 2026-11-17-pips-path-client: Pip's Path in the app — tap Pip to play, games picker, chapter map and Garden Path board in three skins, server-checked clears (5 ✨, 50/day); an open map is handed back per slot
1.44.0 — 2026-11-17-pips-path-backend: Pip's Path backend — server-generated, solver-proven Garden Path maps (difficulty 1–10), path-checked clears, per-person progress, 5 sprinkles per clear capped at 50/day
1.43.0 — 2026-11-17-pips-path-mockup: Pip's Path mockup (Play a game, picker, chapter map, 10 Garden Path levels in three skins)
1.42.0 — 2026-11-17-pip-ball-feet-shoes: Pip ball feet + whole-foot shoes on every line, dragon Fluffy fur boots and Dragonscale boots, wall frames no longer float over the windowsill
1.41.0 — 2026-11-17-day-kcal-buttons: day kcal back on recipe-card day buttons (all themes), with a hover/focus preview of the day total
1.40.0 — 2026-11-17-robot-pip-screen-faces: robot Pip face items are pixels on the screen that replace the base face (Smiley.exe outline, cyan Heart eyes, LCD-invert Shades.gif); the screen changes channel when the face swaps
1.39.0 — 2026-11-16-dragon-pip-fixes: dragon horns stay on the head under hats (over/under per hat), Wizard's hat and Jester's cap replace the Horn cosy and Bird's nest, the Battle scar takes the left eye; Dress Pip cards show the whole Pip on every line
1.38.0 — 2026-11-16-robot-pip-antennas: robot Pip hats become antennas (Prop-top, Radar bar, Toque charm, Boing spring, Neon bolt; Hat tab reads Antenna); every Champion belt is a gold title belt
1.37.0 — MPP-47: Robot workshop decor: all 55 items drawn and named as workshop counterparts on Cyberpunk
1.36.0 — MPP-46: Dragon lair decor: all 55 items drawn and named as lair counterparts on Parchment
1.35.0 — MPP-45: themed Pip rooms — room packs per creature (dragon lair, robot workshop shell, stations, styles, ambience) and themed room UI tokens
1.34.0 — 2026-11-16-themed-pip-rooms-mockups: mockups for Pip's dragon lair, robot workshop and themed room UI (no app change)
1.33.0 — 2026-11-15-themed-pip-lines: Pip is a dragon on Parchment and a robot on Cyberpunk (3 forms each); no line de-evolves any more — forms follow peak points
1.32.2 — parchment-tick-cross: Parchment Provisions ticked-item ✗ drawn inside its box instead of spilling out of it
1.32.1 — parchment-swipe-showthrough: Parchment mobile day view no longer shows Replace/Move/Remove through the meal entries
1.32.0 — 2026-11-15-parchment-theme: Parchment theme (The Kitchen Grimoire), a third selectable theme
1.31.0 — 2026-11-14-cyberpunk-reskin: theme system + user menu v2 with theme picker; Cyberpunk (FOODBYTES Night Kitchen) theme, Low FX switch
1.30.0 — 2026-11-14-meal-plan-screen-redesign: Meal Plan + Recipes + Header redesign: timetable + mobile day view, eaten tick, meal actions with undo, recipe search/strip/picking mode, variant segment, macro chips, hide recipes, Plate P logo everywhere, desktop header nav, week pill, recipe view (cook mode, step cards, extras box), shopping (progress, out-of-date banner, folding aisles)
1.29.0 — 2026-10-30-pip-points-pop: Pip's head bar pops "+3" / "−3" when he gains or loses points, then shows the count and fades
1.28.2 — MPP-44: Pip room night dim covers the whole stage; curtains centred on the window and stop at the sill
1.28.1 — MPP-41: fix touch drag in Pip's room cancelling after a few px and floating back to Pip
1.28.0 — MPP-42: Sprinkles Earn tab in the Shop, weekly shopping-list rewards, and a count-up when you return to Pip
1.27.0 — MPP-40: Pip's room gets 12 named decor spots, a rug spot, the wardrobe station and a deeper windowsill
1.26.0 — MPP-39: Pip's room is bigger and zoomed in: drag or pinch to look around, it floats back to Pip and follows him, zoom remembered in this browser; white walls by default (Lavender stays free), skirting and corner lines
1.25.1 — MPP-37: fix Pip's room collapsing to nothing on phones (room picture, Pip and fridge/cabinet missing; hint and bubble squeezed to one word per line)
1.25.0 — MPP-38: Pip's level bar is a small green bar over his head that follows him (no label), hidden once he's fully grown
1.24.2 — MPP-37: Pip tab is full screen: no top bar, slim Pip header, room fills the screen with Shop / Edit room / Wardrobe in one row above the tab bar, Today's meals removed, room tap targets anchored to the picture
1.24.1 — MPP-29: cook scene's walk back now lasts its 0.5 s phase, so Pip is on the rug when the scene ends (no 200 ms overrun past 3 s)
1.24.0 — MPP-29: Pip's room polish: visible focus rings and full hover/pressed states on every room control, cook scene retuned to 3 s with a pinned 3 s animation limit, one overlay entrance timing
1.23.0 — MPP-28: Pip's room loads in one pet read (habits + cabinet in /api/pet, ≤1 meal-plan read) and Pip's bubble follows one priority order
1.22.0 — MPP-35: carry old eaten ticks over at go-live; Pip asks once when you last had a snack / a drink (30-day cap)
1.21.0 — MPP-27: Decor for Pip's room — 12 items for three fixed spots, paid wall and floor styles, and ✏️ Edit room to place, swap or clear them
1.20.0 — MPP-26: Shop — spend sprinkles to upgrade Pip's bed, fridge, cooker and trophy cabinet
1.19.0 — MPP-25: Sprinkles — a per-person, consistency-only currency (ledger, earning rules, balance on /api/pet, room counter)
1.18.0 — MPP-32: Pip's wardrobe — 20 clothes unlocked by awards, firsts and evolutions, a tap-to-save Dress Pip screen, and outfits that fit every herb form
1.17.0 — MPP-34: Marking a meal as eaten takes you straight to Pip
1.16.0 — MPP-31: Pip evolves through five herb forms on a +3/−3 daily score, with a level bar, wilt and evolve / de-evolve animations
1.15.0 — MPP-23: Trophy cabinet — tap the cabinet for plan / snack / alcohol shelves (now · best · next, ×N awards) and the firsts list; Pip's bubble announces newly earned awards
1.14.0 — MPP-24: Pip "firsts" — template, shopping list, full week and homemade-extra firsts recorded per person, backfilled, and returned from GET /api/pet/awards
1.13.0 — MPP-22: Plan streak + repeating milestone ladder — per-person plan streak, award ledger and GET /api/pet/awards
1.12.0 — MPP-21: Pip's daily snack / alcohol check-in in his speech bubble (No / Yes + date / Not now), kind reactions
1.11.0 — MPP-20: Habit streaks backend — per-person snack-free and alcohol-free check-ins (GET /api/pet/habits, POST /api/pet/habits/{habit}/answer)
1.10.0 — MPP-19: Pip's fridge — gauge + tappable 15-slot fridge view of this week's uneaten planned meals, low-stock bubble

1.9.0 — MPP-18: Pip cooks and serves a newly eaten meal on /pet (once per meal, per-user seen marker, reduced-motion served state)

1.8.0 — MPP-17: Pip's daily routine — at the cooker around your meal times, asleep in bed at night, on the rug otherwise

1.7.0 — MPP-16: Pip's room — 3D corner room engine and level 1–4 furniture catalogue on the Pet page
1.6.0 — MPP-33: per-person eaten ticks and per-person Pip (meal plan stays shared)
1.5.0 — MPP-14: Pet page (Phase 1) — Mochi with four meal-logging moods replaces the Search tab; pet name stored on the plan owner
1.4.0 — MPP-13: Meal times (breakfast/lunch/dinner "by" times) in the account menu
1.3.0 — MPP-12: Mark a planned meal as eaten from the recipe (shared across linked meal plans)
1.2.2 — MPP-10: holding a "Store Bought X" row shows the meals and grams behind it
1.2.1 — MPP-10: generic store-bought rows listed in grams, Pink Sauce Pasta store-bought pasta = Spaghetti (dried), no breakdown popup on generic rows
1.2.0 — MPP-10: homemade/store-bought choices saved server-side per planned meal and template, Manage extras popup, store-bought quantities in grams, 32 missing recipe_extras links
1.1.0 — MPP-9: show deployed version + build time in the app
1.0.0 — baseline before per-ticket versioning (shipped as 1.0.0-mvp)

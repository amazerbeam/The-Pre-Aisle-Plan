# Changelog

One line per ticket, newest first: `<version> — <ticket key>: <summary>`. Bump rules and how
to check what is deployed: `CLAUDE.md` → Versioning & deploy verification.
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

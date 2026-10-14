# Changelog

One line per ticket, newest first: `<version> — <ticket key>: <summary>`. Bump rules and how
to check what is deployed: `CLAUDE.md` → Versioning & deploy verification.
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

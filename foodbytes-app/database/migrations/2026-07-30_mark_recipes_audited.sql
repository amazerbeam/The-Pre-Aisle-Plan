-- 2026-07-30  Audit remediation part 5 — record the audit
--
-- Sets macros_audited on all 20 families audited on 2026-07-30, scored under
-- .claude/rules/recipe-variants.md ("Calories are a target, not a reject
-- condition"): protein >= 35 g, fat <= 35 %, carbs >= 38 % per serving, plus
-- family structure. Per-serving kcal is advisory and does not gate the flag.
--
-- macros_audited_by is deliberately NOT set. It is a FK to users.id and this
-- audit was run by an agent with no user row behind it — the established
-- convention (see the Stromboli family, 44/45/46) is to leave it NULL.
--
-- Whole families only. A family with some members flagged and others not reads
-- as "reviewed" on the card while its siblings were never checked, which is a
-- worse state than unaudited.
--
-- Idempotent: re-running only refreshes the timestamps.

-- Group 1 — failed the first audit on per-serving kcal ONLY. Clean under the
-- 2026-07-30 policy; structurally repaired in part 1. Not redesigned.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
   20,  21,  22,   -- family  6  Black Bean Chicken Wrap
   81,  82,  83,   -- family 23  Spaghetti Bolognese
   87,  88,  89,   -- family 25  Paella de pollo
  104, 105, 106,   -- family 31  Beef & Mushroom Black Bean Stir Fry
  130, 131, 132,   -- family 39  Peanut Butter Banana Overnight Oats
  133, 134, 135,   -- family 40  Tamarind Tossed Noodles
  187, 192, 193    -- family 86  Protein Porridge with Berries
);

-- Group 2 — genuinely failed on protein/fat/carbs; remediated in parts 2 and 3.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
   84,  85,  86,   -- family 24  Black Pepper Beef Stir Fry
  111, 112, 113,   -- family 33  Chicken & Beef Chop Suey
  127, 128, 129,   -- family 38  Reina Arepa
  190, 198, 199,   -- family 89  Slow-Roasted Salmon with Citrus & Veg
   90, 208, 209    -- family 26  Paella Valenciana
);

-- Group 3 — already marked earlier on 2026-07-30, re-verified after the
-- display-unit sweep touched some of their rows. Re-asserted so the timestamps
-- reflect the post-sweep verification rather than the pre-sweep one.
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW()
WHERE id IN (
    4,   5,   6,   -- family  2  Peanut Butter Banana Smoothie
    7,   8,   9,   -- family  3  Irish Chicken Curry
   57,  58,  59,   -- family 17  Chicken Burrito Bowl
   91,  92,  93,   -- family 27  Pad Thai
  189, 196, 197,   -- family 88  Mediterranean White Bean & Chicken Soup
  191, 200, 201,   -- family 90  High-Protein Tuscan Chicken with Rice
  202, 203, 204,   -- family 91  Tortilla de Atun
  205, 206, 207    -- family 92  Crispy Chicken Dippers with Potato Wedges
);

-- =====================================================================
-- Stromboli rebuild + leaner Pizza Dough
-- Date: 2026-07-30
-- Approved by user: audit of family 13 (Stromboli, recipes 44/45/46)
--
-- WHY:
--   All three Stromboli variants failed per-variant macro targets
--   (fat ~47% vs 25-35%, kcal 681/844/1056 per serving vs bands).
--   Root causes: a 22-35g olive oil brush (252 kcal on Moderate),
--   raw burger-patty mixture crumbled into the roll uncooked, and
--   pre-bake garlic granules that scorch over a 30 min bake.
--
-- SCOPE:
--   A. recipe 11  Pizza Dough  - olive oil 56g -> 28g
--   B. recipe 43  Burger Patties - 5% mince -> 3% mince
--   C. recipes 44/45/46 Stromboli - full ingredient + step rebuild
--   D. recipe_extras - drop child 43 from Stromboli (link removed)
--   E. family 13 - is_default moved from Balanced to Moderate
--   F. Pizza 13/14/15/107 - resync stored calories after dough change
--
-- ROLLBACK VALUES (pre-change state):
--   recipe_ingredients (11, ingredient 22 Olive oil): quantity 4.00, unit 4 (tbsp), quantity_grams 56.00
--   recipe_ingredients (43, ingredient 62): ingredient_id 62 (Beef mince 5% fat)
--   recipes.calories: 11=2052, 43=852, 44=1306, 45=1618, 46=2043,
--                     13=1025, 14=1212, 15=1509, 107=1561
--   recipe_family_members family 13: is_default=1 on recipe 46 (Balanced), 0 on 44/45
--   Stromboli 44/45/46 pre-change ingredient rows (9 each):
--     sort 1 ing 75 + linked 11, qty 250/300/370 g, grams 250/300/370
--     sort 2 ing 76 + linked 12, qty 51/60/73 g,    grams 51/60/73
--     sort 3 ing 37,             qty 80/100/130 g,  grams 80/105/130
--     sort 4 ing 30,             qty 15/20/30 g,    grams 15/20/30
--     sort 5 linked 43 only,     qty 100/125/160 g, grams 100/125/160
--     sort 6 ing 12,             qty 40/50/60 g,    grams 40/50/60
--     sort 7 ing 66,             qty 1 tsp,         grams 2.5/3/3
--     sort 8 ing 67,             qty 2 tsp,         grams 2/2/2
--     sort 9 ing 22,             qty 1.5/2/2.5 tbsp,grams 22/28/35
--   recipe_extras: (44,43,2), (45,43,2), (46,43,2)
--
-- All macros recomputed from ingredients + prorated linked recipes.
-- kcal derived as 4P + 4C + 9F (ingredients has no calories_per_100g).
-- recipes.calories stores WHOLE-recipe kcal (per-serving x default_servings).
-- =====================================================================


-- ---------------------------------------------------------------------
-- A. Pizza Dough (11): olive oil 4 tbsp (56g) -> 2 tbsp (28g)
--    Yield 761g -> 733g. Whole-recipe kcal 2052 -> 1800.
--    Reason: at 7.4% oil the dough carried 24.8g fat into 300g of
--    Stromboli, making fat <=35% unreachable while keeping both cheeses.
-- ---------------------------------------------------------------------
UPDATE recipe_ingredients
SET quantity = 2.00, unit_id = 4, quantity_grams = 28.00
WHERE recipe_id = 11 AND ingredient_id = 22;

UPDATE recipes SET calories = 1800 WHERE id = 11;


-- ---------------------------------------------------------------------
-- B. Burger Patties (43): Beef mince (5% fat) -> Beef Mince (3% fat)
--    Yield unchanged 565g. Whole-recipe kcal 852 -> 755.
--    Knock-on: Homemade Big Mac (63) loses ~51 kcal / 7.2g fat and
--    gains 3.6g protein on its 450g linked portion. Accepted; 63
--    needs its own audit (solo recipe, no family, ~1800 kcal/serving).
-- ---------------------------------------------------------------------
UPDATE recipe_ingredients
SET ingredient_id = 125
WHERE recipe_id = 43 AND ingredient_id = 62;

UPDATE recipes SET calories = 755 WHERE id = 43;


-- ---------------------------------------------------------------------
-- C. Stromboli 44/45/46 - ingredient rebuild
--    Wipe-and-re-insert: the row set changes shape (link to 43 and the
--    olive oil brush are removed, egg + butter added), so a guarded
--    INSERT cannot express it. DELETE + INSERT is idempotent on retry.
--
--    Changes vs before:
--      - Burger Patties link (43) REMOVED -> direct Beef Mince (3% fat),
--        browned before rolling. Fixes raw mince baked inside the roll
--        and the raw-vs-cooked weight mismatch between FR-103 paths.
--      - Olive oil brush REMOVED (22/28/35g, up to 315 kcal).
--      - Egg wash ADDED for crust colour.
--      - Butter ADDED: caramelises the onions + post-bake garlic butter.
--      - Onion roughly doubled and moved to whole-item display units.
--      - Garlic granules harmonised to 3g for "1 tsp" across all three.
--      - Pizza sauce quantities rounded (51/73 -> 50/75).
--      - Mozzarella qty/quantity_grams mismatch on 45 (100 vs 105) fixed.
--    Dough and sauce keep their FR-103 dual path (ingredient_id + linked).
-- ---------------------------------------------------------------------
DELETE FROM recipe_ingredients WHERE recipe_id IN (44, 45, 46);

-- Light (44) -- 1065 kcal whole / 532 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
  (44,  75,   11, 210.00, 1, 210.00, 1),
  (44,  76,   12,  50.00, 1,  50.00, 2),
  (44,  37, NULL,  60.00, 1,  60.00, 3),
  (44,  30, NULL,  15.00, 1,  15.00, 4),
  (44, 125, NULL, 160.00, 1, 160.00, 5),
  (44,  12, NULL,   1.00, 6,  90.00, 6),
  (44,  66, NULL,   1.00, 3,   3.00, 7),
  (44,  67, NULL,   2.00, 3,   2.00, 8),
  (44,  59, NULL,   1.00, 5,  12.00, 9),
  (44, 103, NULL,   1.00, 3,   5.00, 10);

-- Moderate (45) -- 1295 kcal whole / 648 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
  (45,  75,   11, 250.00, 1, 250.00, 1),
  (45,  76,   12,  60.00, 1,  60.00, 2),
  (45,  37, NULL,  80.00, 1,  80.00, 3),
  (45,  30, NULL,  20.00, 1,  20.00, 4),
  (45, 125, NULL, 180.00, 1, 180.00, 5),
  (45,  12, NULL,   1.00, 7, 110.00, 6),
  (45,  66, NULL,   1.00, 3,   3.00, 7),
  (45,  67, NULL,   2.00, 3,   2.00, 8),
  (45,  59, NULL,   1.00, 5,  15.00, 9),
  (45, 103, NULL,   1.50, 3,   7.00, 10);

-- Balanced (46) -- 1554 kcal whole / 777 per serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order) VALUES
  (46,  75,   11, 300.00, 1, 300.00, 1),
  (46,  76,   12,  75.00, 1,  75.00, 2),
  (46,  37, NULL,  95.00, 1,  95.00, 3),
  (46,  30, NULL,  25.00, 1,  25.00, 4),
  (46, 125, NULL, 210.00, 1, 210.00, 5),
  (46,  12, NULL,   1.00, 8, 140.00, 6),
  (46,  66, NULL,   1.00, 3,   3.00, 7),
  (46,  67, NULL,   2.00, 3,   2.00, 8),
  (46,  59, NULL,   1.00, 5,  18.00, 9),
  (46, 103, NULL,   2.00, 3,   9.00, 10);


-- ---------------------------------------------------------------------
-- C2. Stromboli 44/45/46 - step rebuild
--     Wipe-and-re-insert: unique key (recipe_id, step_number) makes
--     cascading renumber UPDATEs collide.
--     Linked steps retained for dough (11) and sauce (12) with
--     alt_instruction store-bought fallbacks. Step for 43 removed.
-- ---------------------------------------------------------------------
DELETE FROM recipe_steps WHERE recipe_id IN (44, 45, 46);

-- Light (44)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
  (44, 1, 'Prepare the pizza dough according to the linked recipe. Use 210g dough. Let it come to room temperature before rolling.', 11, 'Use 210g store-bought pizza dough, brought to room temperature.'),
  (44, 2, 'Melt 3g of the butter in a wide pan over medium-low heat. Add the sliced onion and a pinch of salt and cook 12-15 minutes, stirring now and then, until deep gold, sweet and jammy — not merely softened. Scrape into a bowl and reserve the rest of the butter.', NULL, NULL),
  (44, 3, 'Turn the heat to medium-high. Add the beef mince to the dry pan in a single layer and leave it alone for 3-4 minutes until a brown crust forms and it sticks to the pan. Only then break it up and cook 2-3 minutes more until no pink remains. Tip off any liquid.', NULL, NULL),
  (44, 4, 'Stir the onions back through the mince with the Italian seasoning. Taste and adjust the salt now — once it is sealed in the dough you cannot fix it.', NULL, NULL),
  (44, 5, 'Roll the dough into a 28 x 18cm rectangle on a floured surface. Spread 50g pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.', 12, 'Roll the dough into a 28 x 18cm rectangle. Spread 50g store-bought pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.'),
  (44, 6, 'Roll up tightly from the long edge. Pinch the seam firmly closed and tuck the ends underneath. Sit it seam-side down on a lined tray and cut 3-4 diagonal slits across the top.', NULL, NULL),
  (44, 7, 'Beat the egg and brush it all over the top and sides. Bake at 200C for 25-30 minutes until deep golden and firm to the tap.', NULL, NULL),
  (44, 8, 'Stir the garlic granules into the reserved melted butter and brush it over the stromboli the moment it leaves the oven. Rest 10-15 minutes before slicing — cut it sooner and the cheese runs out onto the board.', NULL, NULL);

-- Moderate (45)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
  (45, 1, 'Prepare the pizza dough according to the linked recipe. Use 250g dough. Let it come to room temperature before rolling.', 11, 'Use 250g store-bought pizza dough, brought to room temperature.'),
  (45, 2, 'Melt 4g of the butter in a wide pan over medium-low heat. Add the sliced onion and a pinch of salt and cook 12-15 minutes, stirring now and then, until deep gold, sweet and jammy — not merely softened. Scrape into a bowl and reserve the rest of the butter.', NULL, NULL),
  (45, 3, 'Turn the heat to medium-high. Add the beef mince to the dry pan in a single layer and leave it alone for 3-4 minutes until a brown crust forms and it sticks to the pan. Only then break it up and cook 2-3 minutes more until no pink remains. Tip off any liquid.', NULL, NULL),
  (45, 4, 'Stir the onions back through the mince with the Italian seasoning. Taste and adjust the salt now — once it is sealed in the dough you cannot fix it.', NULL, NULL),
  (45, 5, 'Roll the dough into a 30 x 20cm rectangle on a floured surface. Spread 60g pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.', 12, 'Roll the dough into a 30 x 20cm rectangle. Spread 60g store-bought pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.'),
  (45, 6, 'Roll up tightly from the long edge. Pinch the seam firmly closed and tuck the ends underneath. Sit it seam-side down on a lined tray and cut 3-4 diagonal slits across the top.', NULL, NULL),
  (45, 7, 'Beat the egg and brush it all over the top and sides. Bake at 200C for 25-30 minutes until deep golden and firm to the tap.', NULL, NULL),
  (45, 8, 'Stir the garlic granules into the reserved melted butter and brush it over the stromboli the moment it leaves the oven. Rest 10-15 minutes before slicing — cut it sooner and the cheese runs out onto the board.', NULL, NULL);

-- Balanced (46)
INSERT INTO recipe_steps (recipe_id, step_number, instruction, linked_recipe_id, alt_instruction) VALUES
  (46, 1, 'Prepare the pizza dough according to the linked recipe. Use 300g dough. Let it come to room temperature before rolling.', 11, 'Use 300g store-bought pizza dough, brought to room temperature.'),
  (46, 2, 'Melt 5g of the butter in a wide pan over medium-low heat. Add the sliced onion and a pinch of salt and cook 12-15 minutes, stirring now and then, until deep gold, sweet and jammy — not merely softened. Scrape into a bowl and reserve the rest of the butter.', NULL, NULL),
  (46, 3, 'Turn the heat to medium-high. Add the beef mince to the dry pan in a single layer and leave it alone for 3-4 minutes until a brown crust forms and it sticks to the pan. Only then break it up and cook 2-3 minutes more until no pink remains. Tip off any liquid.', NULL, NULL),
  (46, 4, 'Stir the onions back through the mince with the Italian seasoning. Taste and adjust the salt now — once it is sealed in the dough you cannot fix it.', NULL, NULL),
  (46, 5, 'Roll the dough into a 34 x 22cm rectangle on a floured surface. Spread 75g pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.', 12, 'Roll the dough into a 34 x 22cm rectangle. Spread 75g store-bought pizza sauce over it, leaving a 2cm border. Scatter over the mozzarella, then the mince and onion, then the parmesan.'),
  (46, 6, 'Roll up tightly from the long edge. Pinch the seam firmly closed and tuck the ends underneath. Sit it seam-side down on a lined tray and cut 3-4 diagonal slits across the top.', NULL, NULL),
  (46, 7, 'Beat the egg and brush it all over the top and sides. Bake at 200C for 28-33 minutes until deep golden and firm to the tap.', NULL, NULL),
  (46, 8, 'Stir the garlic granules into the reserved melted butter and brush it over the stromboli the moment it leaves the oven. Rest 10-15 minutes before slicing — cut it sooner and the cheese runs out onto the board.', NULL, NULL);


-- ---------------------------------------------------------------------
-- D. recipe_extras: the Burger Patties link is gone, so drop the child
--    row. Dough (11) and Pizza Sauce (12) extras stay.
-- ---------------------------------------------------------------------
DELETE FROM recipe_extras WHERE parent_recipe_id IN (44, 45, 46) AND child_recipe_id = 43;


-- ---------------------------------------------------------------------
-- E. Stromboli calories + audit flag
-- ---------------------------------------------------------------------
UPDATE recipes SET calories = 1065, macros_audited = 1, macros_audited_at = NOW() WHERE id = 44;
UPDATE recipes SET calories = 1295, macros_audited = 1, macros_audited_at = NOW() WHERE id = 45;
UPDATE recipes SET calories = 1554, macros_audited = 1, macros_audited_at = NOW() WHERE id = 46;


-- ---------------------------------------------------------------------
-- F. family 13: default must be Moderate, not Balanced
-- ---------------------------------------------------------------------
UPDATE recipe_family_members SET is_default = 0 WHERE family_id = 13;
UPDATE recipe_family_members SET is_default = 1 WHERE family_id = 13 AND recipe_id = 45;


-- ---------------------------------------------------------------------
-- G. Pizza 13/14/15/107 - resync stored calories after the dough change.
--    Recipe content untouched; only the stored total moves because the
--    linked dough got leaner.
--      13 Light      1025 -> 1020  (510/srv)
--      14 Moderate   1212 -> 1206  (603/srv)  now passes all four targets
--      15 Balanced   1509 -> 1500  (750/srv)
--     107 Balanced 2 1561 -> 1553  (777/srv)  now passes all four targets
-- ---------------------------------------------------------------------
UPDATE recipes SET calories = 1020 WHERE id = 13;
UPDATE recipes SET calories = 1206 WHERE id = 14;
UPDATE recipes SET calories = 1500 WHERE id = 15;
UPDATE recipes SET calories = 1553 WHERE id = 107;

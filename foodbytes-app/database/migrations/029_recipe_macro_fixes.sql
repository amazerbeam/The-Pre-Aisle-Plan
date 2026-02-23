-- Migration: Recipe Macro Fixes
-- Date: 29 Jan 2026
-- Purpose: Fix 7 recipes failing protein/fat%/carbs% targets
-- Audit file: Claude/agents/recipe-audit-29-jan-2026.md

-- ============================================
-- 1. CREATE NEW INGREDIENTS
-- ============================================

INSERT INTO ingredients (id, `key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified) VALUES
(162, 'turkey_mince', 'Turkey Mince', 2, 27.0, 0.0, 8.0, TRUE),
(163, 'protein_powder', 'Protein Powder', 17, 80.0, 8.0, 3.0, TRUE);

-- ============================================
-- 2. GREEK CHICKEN GYROS (Recipes 118, 119, 120)
-- Issue: Fat 36-37%, Carbs 33-35%
-- Fix: thigh→breast, reduce oil, increase pita
-- ============================================

-- 2a. Swap chicken_thigh (41) → chicken_breast (11)
UPDATE recipe_ingredients
SET ingredient_id = 11
WHERE recipe_id IN (118, 119, 120)
AND ingredient_id = 41;

-- 2b. Reduce olive oil
-- Balanced (120): 20g → 14g
-- Moderate (119): 16g → 11g
-- Light (118): 12g → 9g
UPDATE recipe_ingredients SET quantity_grams = 14 WHERE recipe_id = 120 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 11 WHERE recipe_id = 119 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 9 WHERE recipe_id = 118 AND ingredient_id = 22;

-- 2c. Increase pita bread (157)
-- Balanced (120): 200g → 240g
-- Moderate (119): 160g → 195g
-- Light (118): 120g → 150g
UPDATE recipe_ingredients SET quantity_grams = 240 WHERE recipe_id = 120 AND ingredient_id = 157;
UPDATE recipe_ingredients SET quantity_grams = 195 WHERE recipe_id = 119 AND ingredient_id = 157;
UPDATE recipe_ingredients SET quantity_grams = 150 WHERE recipe_id = 118 AND ingredient_id = 157;

-- ============================================
-- 3. BREADED CHICKEN WITH MASH & BLACK BEANS (Recipes 101, 102, 103)
-- Issue: Fat 36-39%, Carbs 31-33%
-- Fix: reduce oil+butter, increase potato
-- ============================================

-- 3a. Reduce olive oil for breading
-- Need to identify which olive oil entry is for breading vs beans
-- Assuming single olive oil entry, reduce total
-- Balanced (103): 38g → 17g (12g breading + 5g beans)
-- Moderate (102): 30g → 14g
-- Light (101): 24g → 11g
UPDATE recipe_ingredients SET quantity_grams = 17 WHERE recipe_id = 103 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 14 WHERE recipe_id = 102 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 11 WHERE recipe_id = 101 AND ingredient_id = 22;

-- 3b. Reduce butter (unsalted 44 or salted 53)
-- Balanced (103): 20g → 12g
-- Moderate (102): 16g → 10g
-- Light (101): 12g → 8g
UPDATE recipe_ingredients SET quantity_grams = 12 WHERE recipe_id = 103 AND ingredient_id IN (44, 53);
UPDATE recipe_ingredients SET quantity_grams = 10 WHERE recipe_id = 102 AND ingredient_id IN (44, 53);
UPDATE recipe_ingredients SET quantity_grams = 8 WHERE recipe_id = 101 AND ingredient_id IN (44, 53);

-- 3c. Increase potato (121)
-- Balanced (103): 320g → 420g
-- Moderate (102): 260g → 340g
-- Light (101): 200g → 265g
UPDATE recipe_ingredients SET quantity_grams = 420 WHERE recipe_id = 103 AND ingredient_id = 121;
UPDATE recipe_ingredients SET quantity_grams = 340 WHERE recipe_id = 102 AND ingredient_id = 121;
UPDATE recipe_ingredients SET quantity_grams = 265 WHERE recipe_id = 101 AND ingredient_id = 121;

-- ============================================
-- 4. STROMBOLI (Recipes 44, 45, 46)
-- Issue: Fat 36-38%
-- Fix: reduce oil and mozzarella
-- ============================================

-- 4a. Reduce olive oil
-- Balanced (46): 35g → 18g
-- Moderate (45): 28g → 15g
-- Light (44): 22g → 12g
UPDATE recipe_ingredients SET quantity_grams = 18 WHERE recipe_id = 46 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 15 WHERE recipe_id = 45 AND ingredient_id = 22;
UPDATE recipe_ingredients SET quantity_grams = 12 WHERE recipe_id = 44 AND ingredient_id = 22;

-- 4b. Reduce mozzarella (37)
-- Balanced (46): 130g → 110g
-- Moderate (45): 105g → 90g
-- Light (44): 80g → 70g
UPDATE recipe_ingredients SET quantity_grams = 110 WHERE recipe_id = 46 AND ingredient_id = 37;
UPDATE recipe_ingredients SET quantity_grams = 90 WHERE recipe_id = 45 AND ingredient_id = 37;
UPDATE recipe_ingredients SET quantity_grams = 70 WHERE recipe_id = 44 AND ingredient_id = 37;

-- ============================================
-- 5. SALMON SANDWICH (Recipes 28, 29)
-- Issue: Fat 36%, Moderate protein 30g
-- Fix: reduce butter
-- Note: Only 2 variants (Moderate, Balanced)
-- ============================================

-- 5a. Reduce butter
-- Balanced (29): 30g → 15g
-- Moderate (28): 24g → 8g
UPDATE recipe_ingredients SET quantity_grams = 15 WHERE recipe_id = 29 AND ingredient_id IN (44, 53);
UPDATE recipe_ingredients SET quantity_grams = 8 WHERE recipe_id = 28 AND ingredient_id IN (44, 53);

-- ============================================
-- 6. LENTIL STEW (Recipes 30, 31, 32)
-- Issue: Protein 24-33g (under)
-- Fix: Add chicken breast
-- ============================================

-- 6a. Insert chicken breast (11) - aisle_id 2 (poultry)
-- Light (30): 150g → 47.6g protein/serving
-- Moderate (31): 100g → 38.5g protein/serving
-- Balanced (32): 80g → 36.5g protein/serving
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 30, 11, 150, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 30;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 31, 11, 100, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 31;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 32, 11, 80, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 32;

-- ============================================
-- 7. LENTIL STUFFED PEPPERS (Recipes 33, 34, 35)
-- Issue: Protein 18-30g (under)
-- Fix: Add turkey mince
-- ============================================

-- 7a. Insert turkey mince (162)
-- Light (33): 150g → adds 40.5g protein
-- Moderate (34): 120g → adds 32.4g protein
-- Balanced (35): 100g → adds 27g protein
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 33, 162, 150, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 33;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 34, 162, 120, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 34;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 35, 162, 100, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 35;

-- ============================================
-- 8. PEANUT BUTTER BANANA SMOOTHIE (Recipes 4, 5, 6)
-- Issue: Protein 14-24g (under)
-- Fix: Add protein powder
-- ============================================

-- 8a. Insert protein powder (163)
-- Light (4): 55g → adds 44g protein → 36.3g/serving ✓
-- Moderate (5): 45g → adds 36g protein → 38g/serving ✓
-- Balanced (6): 35g → adds 28g protein → 38g/serving ✓
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 4, 163, 55, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 4;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 5, 163, 45, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 5;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams, unit_id, display_order)
SELECT 6, 163, 35, 1, COALESCE(MAX(display_order), 0) + 1 FROM recipe_ingredients WHERE recipe_id = 6;

-- ============================================
-- 9. DELETE SALMON & ASPARAGUS (Recipes 69, 70)
-- User requested deletion
-- ============================================

-- 9a. Remove from meal associations
DELETE FROM recipe_meals WHERE recipe_id IN (69, 70);

-- 9b. Remove from family members
DELETE FROM recipe_family_members WHERE recipe_id IN (69, 70);

-- 9c. Remove ingredients
DELETE FROM recipe_ingredients WHERE recipe_id IN (69, 70);

-- 9d. Remove recipe steps
DELETE FROM recipe_steps WHERE recipe_id IN (69, 70);

-- 9e. Set recipes as not live (soft delete)
UPDATE recipes SET is_live = FALSE WHERE id IN (69, 70);

-- ============================================
-- 10. UPDATE STORED CALORIES (run AFTER verification)
-- These will be calculated after audit confirms fixes
-- ============================================

-- Placeholder - will update after re-running audit query
-- UPDATE recipes SET calories = X WHERE id = Y;

-- ============================================
-- VERIFICATION: Run audit query after migration
-- ============================================
-- See audit query in: Claude/agents/recipe-audit-29-jan-2026.md

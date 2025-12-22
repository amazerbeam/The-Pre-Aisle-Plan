-- =============================================
-- MIGRATION: Balanced/Moderate/Light Variant Naming
-- Date: 2025-12-22
-- Description: Replace I/II/III variant naming with descriptive names
--   Light = smallest portion (deficit, weight loss)
--   Moderate = middle portion (gentle deficit) - remains default
--   Balanced = largest portion (maintenance)
-- =============================================

-- =============================================
-- STEP 1: Update Recipe Names
-- =============================================

-- Porridge with Berries & Nuts Family
UPDATE recipes SET name = 'Porridge with Berries & Nuts (Light)' WHERE id = 1;
UPDATE recipes SET name = 'Porridge with Berries & Nuts (Moderate)' WHERE id = 2;
UPDATE recipes SET name = 'Porridge with Berries & Nuts (Balanced)' WHERE id = 3;

-- Peanut Butter Banana Smoothie Family
UPDATE recipes SET name = 'Peanut Butter Banana Smoothie (Light)' WHERE id = 4;
UPDATE recipes SET name = 'Peanut Butter Banana Smoothie (Moderate)' WHERE id = 5;
UPDATE recipes SET name = 'Peanut Butter Banana Smoothie (Balanced)' WHERE id = 6;

-- Irish Chicken Curry Family
UPDATE recipes SET name = 'Irish Chicken Curry (Light)' WHERE id = 7;
UPDATE recipes SET name = 'Irish Chicken Curry (Moderate)' WHERE id = 8;
UPDATE recipes SET name = 'Irish Chicken Curry (Balanced)' WHERE id = 9;

-- Pizza Family
UPDATE recipes SET name = 'Pizza (Light)' WHERE id = 13;
UPDATE recipes SET name = 'Pizza (Moderate)' WHERE id = 14;
UPDATE recipes SET name = 'Pizza (Balanced)' WHERE id = 15;

-- Chicken Satay Family
UPDATE recipes SET name = 'Chicken Satay (Light)' WHERE id = 16;
UPDATE recipes SET name = 'Chicken Satay (Moderate)' WHERE id = 17;
UPDATE recipes SET name = 'Chicken Satay (Balanced)' WHERE id = 18;

-- Black Bean Chicken Wrap Family
UPDATE recipes SET name = 'Black Bean Chicken Wrap (Light)' WHERE id = 20;
UPDATE recipes SET name = 'Black Bean Chicken Wrap (Moderate)' WHERE id = 21;
UPDATE recipes SET name = 'Black Bean Chicken Wrap (Balanced)' WHERE id = 22;

-- Chicken & Vegetable Soup Family
UPDATE recipes SET name = 'Chicken & Vegetable Soup (Light)' WHERE id = 23;
UPDATE recipes SET name = 'Chicken & Vegetable Soup (Moderate)' WHERE id = 24;
UPDATE recipes SET name = 'Chicken & Vegetable Soup (Balanced)' WHERE id = 25;

-- Salmon Sandwich Family
UPDATE recipes SET name = 'Salmon Sandwich (Light)' WHERE id = 27;
UPDATE recipes SET name = 'Salmon Sandwich (Moderate)' WHERE id = 28;
UPDATE recipes SET name = 'Salmon Sandwich (Balanced)' WHERE id = 29;

-- Lentil Stew Family
UPDATE recipes SET name = 'Lentil Stew (Light)' WHERE id = 30;
UPDATE recipes SET name = 'Lentil Stew (Moderate)' WHERE id = 31;
UPDATE recipes SET name = 'Lentil Stew (Balanced)' WHERE id = 32;

-- Lentil Stuffed Peppers Family
UPDATE recipes SET name = 'Lentil Stuffed Peppers (Light)' WHERE id = 33;
UPDATE recipes SET name = 'Lentil Stuffed Peppers (Moderate)' WHERE id = 34;
UPDATE recipes SET name = 'Lentil Stuffed Peppers (Balanced)' WHERE id = 35;

-- Pink Sauce Pasta Family
UPDATE recipes SET name = 'Pink Sauce Pasta (Light)' WHERE id = 37;
UPDATE recipes SET name = 'Pink Sauce Pasta (Moderate)' WHERE id = 38;
UPDATE recipes SET name = 'Pink Sauce Pasta (Balanced)' WHERE id = 39;

-- Chicken Tikka Masala Family
UPDATE recipes SET name = 'Chicken Tikka Masala (Light)' WHERE id = 40;
UPDATE recipes SET name = 'Chicken Tikka Masala (Moderate)' WHERE id = 41;
UPDATE recipes SET name = 'Chicken Tikka Masala (Balanced)' WHERE id = 42;

-- Stromboli Family
UPDATE recipes SET name = 'Stromboli (Light)' WHERE id = 44;
UPDATE recipes SET name = 'Stromboli (Moderate)' WHERE id = 45;
UPDATE recipes SET name = 'Stromboli (Balanced)' WHERE id = 46;

-- Steak & Chips Family
UPDATE recipes SET name = 'Steak & Chips (Light)' WHERE id = 47;
UPDATE recipes SET name = 'Steak & Chips (Moderate)' WHERE id = 48;
UPDATE recipes SET name = 'Steak & Chips (Balanced)' WHERE id = 49;

-- Scrambled Eggs & Toast Family
UPDATE recipes SET name = 'Scrambled Eggs & Toast (Light)' WHERE id = 50;
UPDATE recipes SET name = 'Scrambled Eggs & Toast (Moderate)' WHERE id = 51;
UPDATE recipes SET name = 'Scrambled Eggs & Toast (Balanced)' WHERE id = 52;

-- Avocado Toast Family
UPDATE recipes SET name = 'Avocado Toast (Light)' WHERE id = 53;
UPDATE recipes SET name = 'Avocado Toast (Moderate)' WHERE id = 54;
UPDATE recipes SET name = 'Avocado Toast (Balanced)' WHERE id = 55;

-- =============================================
-- STEP 2: Update Variant Labels
-- =============================================

-- Update variant labels: I -> Light, II -> Moderate, III -> Balanced
-- Display order stays: Light=1, Moderate=2, Balanced=3
UPDATE recipe_family_members SET variant_label = 'Light' WHERE variant_label = 'I';
UPDATE recipe_family_members SET variant_label = 'Moderate' WHERE variant_label = 'II';
UPDATE recipe_family_members SET variant_label = 'Balanced' WHERE variant_label = 'III';

-- =============================================
-- STEP 3: Update Recipe Family Descriptions
-- =============================================

UPDATE recipe_families
SET description = 'Simple salmon sandwich with homemade milk bread, salted butter, and fresh lettuce. Moderate = 1 sandwich per person, Balanced = 2 sandwiches per person.'
WHERE id = 8;

UPDATE recipe_families
SET description = 'Hearty stew with brown lentils, tomatoes, carrots, and pak choi, spiced with smoked paprika and cumin. Moderate and Balanced variants include crispy chorizo.'
WHERE id = 9;

UPDATE recipe_families
SET description = 'Mashed avocado on buttered toast. Light: 1 slice with fried egg. Moderate: vegetarian with parmesan. Balanced: 2 slices, 2 eggs per person, topped with parmesan.'
WHERE id = 16;

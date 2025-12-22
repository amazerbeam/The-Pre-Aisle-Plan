-- FR-099: Default Variant Selection to Moderate (middle variant)
-- Changes the default displayed variant to Moderate

-- Step 1: Clear existing defaults
UPDATE recipe_family_members SET is_default = FALSE WHERE is_default = TRUE;

-- Step 2: Set Moderate as the new default for all families
-- Note: Database uses Light/Moderate/Balanced labels
UPDATE recipe_family_members SET is_default = TRUE WHERE variant_label = 'Moderate';

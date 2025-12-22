-- FR-099: Default Variant Selection to Standard (middle variant)
-- Changes the default displayed variant to Standard

-- Step 1: Clear existing defaults
UPDATE recipe_family_members SET is_default = FALSE WHERE is_default = TRUE;

-- Step 2: Set Standard as the new default for all families
-- Note: Database uses Light/Standard/Full (not Light/Moderate/Balanced)
UPDATE recipe_family_members SET is_default = TRUE WHERE variant_label = 'Standard';

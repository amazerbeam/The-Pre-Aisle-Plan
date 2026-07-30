-- 2026-07-29 — Decimal serving size (half portions)
--
-- Widens `servings` from INT to DECIMAL(4,2) so a meal plan entry can record a
-- fractional portion (0.5 for a half portion, 0.25 for a quarter).
--
-- Lossless: at time of writing meal_plan_entries holds 565 rows with servings
-- 1..4 and meal_plan_template_entries holds 58 rows with servings 1..2 — all
-- whole numbers, so MODIFY converts without truncation. No backfill required.
--
-- DECIMAL(4,2) permits 0.01..99.99 at the column level; the application floor
-- (0.25) and ceiling (20) are enforced by MealPlanCreateRequest validation,
-- matching how @Min(1) guarded this column before.
--
-- Both statements are idempotent: re-running MODIFY to the same type is a no-op.
--
-- MUST be applied to the Railway MySQL BEFORE the backend redeploys.
-- Hibernate runs ddl-auto: validate and will refuse to start if the entity is
-- BigDecimal while the column is still INT.

ALTER TABLE meal_plan_entries
  MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;

ALTER TABLE meal_plan_template_entries
  MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;

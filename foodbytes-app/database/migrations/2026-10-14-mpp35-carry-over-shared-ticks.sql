-- MPP-35: carry the old shared eaten ticks into MPP-33's per-person tick table at go-live.
--
-- Copies every meal_plan_entries row with eaten = 1 into meal_plan_entry_eaten, credited to the
-- entry's own user_id (the plan owner) and never to linked partners - the old ticks never recorded
-- who ticked (MPP-35 AC 1). eaten_at is the old eaten_at, else created_at, else the plan date.
--
-- Order is load-bearing: this runs straight after MPP-33 creates the table (go-live row 2) and
-- before MPP-24 (firsts) and MPP-25 (sprinkles), whose backfills then seal the copied ticks
-- (COOK_HOMEMADE_EXTRA, MEAL_EATEN 10, HOMEMADE_EXTRA 5). Run after MPP-25 and an untick/re-tick
-- of a copied meal would pay sprinkles.
--
-- Lossless: only INSERTs into meal_plan_entry_eaten; no existing row is changed, and the old
-- eaten / eaten_at columns stay until the follow-up cleanup. Live evidence (Railway, read-only,
-- 2026-10-14): 7 rows with eaten = 1, all user 1 (12 and 13 Oct B/L/D, 14 Oct breakfast), none with
-- a NULL eaten_at -> 70 MEAL_EATEN sprinkles once MPP-25 runs. Reads the column at go-live time, so
-- ticks made before the merge are included. Re-running is a no-op (uk_mpe_eaten_entry_user).
--
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 2 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at)
SELECT e.id, e.user_id, COALESCE(e.eaten_at, e.created_at, TIMESTAMP(e.plan_date))
FROM meal_plan_entries e
WHERE e.eaten = 1
ON DUPLICATE KEY UPDATE meal_plan_entry_eaten.id = meal_plan_entry_eaten.id;

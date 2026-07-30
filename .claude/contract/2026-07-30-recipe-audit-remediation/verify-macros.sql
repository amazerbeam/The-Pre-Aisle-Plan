-- Recompute per-serving macros for the 20 audited families from
-- recipe_ingredients + prorated linked recipes. Read-only.
--
-- Scores against the post-2026-07-30 audit policy in
-- .claude/rules/recipe-variants.md: protein >= 35 g, fat <= 35 %, carbs >= 38 %.
-- Per-serving kcal is reported for information only and NEVER fails a row.
--
-- Usage: run the whole file through mcp__mysql__mysql_query.
-- Expected after all phases: `fails` is NULL on every row, and
-- kcal_order reads 'ok' for every family.

WITH lt AS (
  SELECT ri.recipe_id AS lid,
         SUM(ri.quantity_grams) AS y,
         SUM(ri.quantity_grams * i.protein_per_100g / 100) AS lp,
         SUM(ri.quantity_grams * i.carbs_per_100g   / 100) AS lc,
         SUM(ri.quantity_grams * i.fat_per_100g     / 100) AS lf
  FROM recipe_ingredients ri
  JOIN ingredients i ON i.id = ri.ingredient_id
  GROUP BY ri.recipe_id
),
rawi AS (
  SELECT ri.recipe_id AS rid,
         SUM(ri.quantity_grams * i.protein_per_100g / 100) AS rp,
         SUM(ri.quantity_grams * i.carbs_per_100g   / 100) AS rc,
         SUM(ri.quantity_grams * i.fat_per_100g     / 100) AS rf
  FROM recipe_ingredients ri
  JOIN ingredients i ON i.id = ri.ingredient_id
  WHERE ri.linked_recipe_id IS NULL
  GROUP BY ri.recipe_id
),
lnki AS (
  SELECT ri.recipe_id AS rid,
         SUM(lt.lp * ri.quantity_grams / lt.y) AS kp,
         SUM(lt.lc * ri.quantity_grams / lt.y) AS kc,
         SUM(lt.lf * ri.quantity_grams / lt.y) AS kf
  FROM recipe_ingredients ri
  JOIN lt ON lt.lid = ri.linked_recipe_id
  WHERE ri.linked_recipe_id IS NOT NULL
  GROUP BY ri.recipe_id
),
t AS (
  SELECT rfm.family_id, rf.family_name, r.id, r.name, r.calories AS stored_cal,
         rfm.variant_label AS v, rfm.display_order AS dord, rfm.is_default AS dflt,
         r.default_servings AS s, r.macros_audited AS audited,
         COALESCE(rawi.rp, 0) + COALESCE(lnki.kp, 0) AS tP,
         COALESCE(rawi.rc, 0) + COALESCE(lnki.kc, 0) AS tC,
         COALESCE(rawi.rf, 0) + COALESCE(lnki.kf, 0) AS tF
  FROM recipes r
  JOIN recipe_family_members rfm ON rfm.recipe_id = r.id
  JOIN recipe_families rf        ON rf.id = rfm.family_id
  LEFT JOIN rawi ON rawi.rid = r.id
  LEFT JOIN lnki ON lnki.rid = r.id
  WHERE rfm.family_id IN (2,3,6,17,23,24,25,26,27,31,33,38,39,40,86,88,89,90,91,92)
),
m AS (
  SELECT family_id, family_name, id, name, v, dord, dflt, s, audited, stored_cal,
         tP / s                                            AS pg,
         100 * 4 * tC / NULLIF(tP*4 + tC*4 + tF*9, 0)       AS cp,
         100 * 9 * tF / NULLIF(tP*4 + tC*4 + tF*9, 0)       AS fp,
         (tP*4 + tC*4 + tF*9)                               AS whole_kcal,
         (tP*4 + tC*4 + tF*9) / s                           AS srv_kcal
  FROM t
)
SELECT family_id, family_name, id, v, dord, dflt, audited,
       ROUND(pg,1)        AS protein_g,
       ROUND(cp,1)        AS carb_pct,
       ROUND(fp,1)        AS fat_pct,
       ROUND(srv_kcal)    AS kcal_srv_advisory,
       stored_cal,
       ROUND(whole_kcal)  AS computed_whole_kcal,
       CONCAT_WS(' + ',
         IF(pg < 35, CONCAT('PROTEIN ', ROUND(pg,1), 'g'), NULL),
         IF(fp > 35, CONCAT('FAT ',     ROUND(fp,1), '%'), NULL),
         IF(cp < 38, CONCAT('CARBS ',   ROUND(cp,1), '%'), NULL)
       )                  AS fails,
       IF(ABS(stored_cal - whole_kcal) / NULLIF(whole_kcal,0) > 0.05,
          'STORED CAL OFF >5%', 'ok')                       AS stored_cal_check
FROM m
ORDER BY family_name, dord;

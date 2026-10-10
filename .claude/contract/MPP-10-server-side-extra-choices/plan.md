# Plan: Server-side homemade/store-bought choices per planned meal + Manage extras + gram quantities + 32 missing recipe_extras links

Plan folder: `.claude/contract/MPP-10-server-side-extra-choices/`
Execution status: see `tasks.md` in this folder.

---

## Part 1 — Alignment

### Task reference

Jira **MPP-10** (Story, High) — "Store homemade/store-bought choices server-side per planned meal (any browser, linked accounts, templates) + Manage extras for week & templates + store-bought quantities in grams + 32 missing recipe_extras links". Relates to **MPP-8** (Ready for Test), which this story supersedes for selection storage.

Approved design asset: `C:\Users\jossd\Downloads\mpp-10-manage-extras-mockup.html` (2026-10-10) — screens A–C (week), D–F (templates), desktop + phone, Saved / Saving / Error states, `mx-*` CSS classes, reusing `TemplateModals.css` + `MealPlanMenu.css`. Six approved decisions: (1) every tap saves, no Save/Cancel; (2) keep All homemade / All store-bought; (3) orange cart icon on calendar meals with a store-bought extra; (4) Regenerate list prompt in the week popup; (5) template button label **Extras**; (6) week-popup changes update the dish default, template edits don't.

Acceptance criteria (verbatim from the ticket):

1. A homemade/store-bought choice made on one device produces the same generated shopping list on any other device and browser for the same account.
2. A linked user (`meal_plan_owner_id` set) generating the same date range gets the identical list to the owner, and sees and edits the same choices.
3. Choices are stored per planned meal: two entries of the same dish in one range can have different choices, and the list reflects each one.
4. Adding a dish pre-fills the popup with the dish's default; the default is updated by the add-to-day popup and the week Manage extras popup, never by template edits.
5. Changing a planned meal to another variant in the same family keeps its choices.
6. Copy week and swap days preserve each meal's choices.
7. Saving a template stores each meal's choices; applying it restores them; Update re-snapshots them.
8. The ⋯ menu has **Manage extras…** (second item, divider after it), opening the week popup for the displayed week; edits change only that week's entries.
9. Manage templates shows an **Extras** button (with store-bought count) only on templates with extras; it opens the template popup with a back arrow; edits change only that template.
10. Both popups match the approved mockup: grouping, meal header, segmented switch, "Make/Buy … g" line, summary + bulk buttons, scope note, immediate save with Saving/Saved/error states and revert on failure, empty state, phone bottom-sheet layout.
11. After a week edit, if a saved shopping list overlaps that week, the out-of-date bar with **Regenerate list** is shown and regenerates the list.
12. Calendar meal cards with any store-bought extra show the orange cart icon.
13. A store-bought extra with a store-bought ingredient is listed in grams: link `quantity_grams` × servings ÷ default servings, summed across meals, merged with the same ingredient in `g` elsewhere. Examples 1–3 and 6 hold.
14. A store-bought extra without a store-bought ingredient still shows the generic "Store Bought <recipe>" row.
15. With no stored choice, the list is identical to today's homemade behaviour.
16. Every `recipe_ingredients` row with `linked_recipe_id` set has a matching `recipe_extras` row (the ticket's `COUNT(*)` query returns 0).
17. After the first post-deploy load, choices that existed only in a browser's localStorage are present on the server.
18. The ingredient-breakdown popup agrees with the generated list for store-bought rows.
19. Backend tests cover: stored-choice lookup in generate, gram quantity and aggregation, per-entry divergence for the same dish, owner resolution for linked users, template save/apply round trip, week vs template edit scope, default update rules.

Ticket examples that tests must reproduce: Bolognese (82) + Fresh Pasta (36) store-bought → **Spaghetti (dried) 200 g** (link row `quantity_grams` = 200.00, `ingredient_id` = 126, verified live); Mon + Thu both store-bought → 400 g; 4 servings of a 2-serving recipe → 400 g; Mon store-bought / Thu homemade → 200 g + flour/egg for Thursday only; Pink Sauce Pasta (38) + Pizza Sauce (12) store-bought → **Tomato passata 180 g**.

### Restated goal

Move the homemade/store-bought choice for a recipe's extras out of each browser's localStorage and into MySQL, stored **per planned meal** (one row per meal-plan entry per extra) and **per template entry**, with a per-dish **default** that pre-fills the add-to-day popup — all keyed to the effective meal-plan owner so linked accounts share them. Shopping-list generation and the ingredient-breakdown popup read those stored choices instead of a client payload, list store-bought products in grams (link grams × servings ÷ default servings) so they merge with the same ingredient used raw, and still fall back to the generic "Store Bought X" row when no product is linked. Choices survive variant switches, copy week, swap days and template save / apply / update. A new **Manage extras** popup — opened from the ⋯ menu for the displayed week, and from an **Extras** button per template — lets the user flip every extra in one place with save-on-tap, bulk buttons and a Regenerate-list prompt; calendar cards with a store-bought extra get a cart icon. A one-time client upload migrates existing localStorage choices, and a data migration adds the 32 linked sub-recipes missing from `recipe_extras`.

### In scope

- Schema migration: three new tables — `meal_plan_entry_extra_choices`, `meal_plan_template_entry_extra_choices`, `user_extra_defaults` — with DB-level `ON DELETE CASCADE`.
- Data migration: the 32 missing `recipe_extras` rows (explicit, reviewed list).
- Backend: three entities + repositories; `ExtraChoiceService` (owner resolution, read/write/copy choices, defaults with family fan-out, legacy import); `ManageExtrasService` (popup view model incl. used grams); `ExtraPortionResolver` (extracted link-grams / portion-ratio helpers); `MealPlanExtrasController` under `/api/meal-plan/extras`.
- `ShoppingListService`: stored-choice lookup per entry in `getShoppingList` and `getIngredientBreakdown`; store-bought rows in grams; `HomemadeSelectionsDTO` / request `selections` removed.
- `MealPlanService`: `assignRecipe` writes choices from the popup (+ defaults) or carries them across a same-family variant swap; `copyWeek` copies choices; `swapDays` keeps them (no-op, tested); `MealPlanEntryDTO.extraChoices`.
- `MealPlanTemplateService`: snapshot/update copy entry → template choices; apply copies template → entry choices; summary DTO carries `extrasMealCount` + `storeBoughtCount`.
- Frontend: `extraChoicesService.js`; `HomemadeSelectionsContext` → API-backed defaults (guest stays localStorage) + one-time localStorage import; `ExtrasSelectionPopup` / `DayAssignmentButtons` send choices with the assign call; `useManageExtras` hook + `ManageExtrasModal` (+ sub-components, CSS from the mockup); ⋯ menu item + divider; Manage templates **Extras** button + meta count + back-arrow flow; calendar cart icon; Regenerate bar; MPP-8 `selections` plumbing removed from the generate path; `RecipeViewModal` reads the entry's own choices when opened from the calendar.
- Backend tests for every item in AC 19.

### Explicitly out of scope

- Nutrition — kcal and macros stay on the homemade basis (`CLAUDE.md`, FR-103). `MacroCalculationService` is not touched.
- Adding store-bought products to extras that have none (e.g. Milk Bread, Goodness Granola, Honey Ham, Fresh Pasta on the soup).
- Changing which sub-recipes count as extras beyond the 32-row fix; no edits to recipe ingredients, steps or yields (memory: don't audit extras).
- Retroactively changing already-generated lists — users regenerate after deploy.
- The existing quirk that `PersistedShoppingListService.generateShoppingList` aggregates `startDate + 7` regardless of `endDate` — pre-existing, untouched.
- Redesigning the add-to-day `ExtrasSelectionPopup` (checkbox UI stays; only its data source and confirm path change).
- PWA bootstrap, splitting `MealPlanContext.jsx` (559 lines) or `RecipeViewModal.jsx` (406 lines) — neither grows (see Risks).

### Pattern Reference

None supplied beyond the mockup. Chosen references:
- Backend layering, nested service exceptions, `userPrincipal == null → 403` guard, try/catch → 404 mapping: `MealPlanTemplateController` / `MealPlanTemplateService`.
- Effective-owner resolution: `MealPlanService.effectiveOwnerId(User)`.
- Request-scoped caches and `findById` (not `findWithDetailsById`) for extras: `ShoppingListService.processExtras` / `collectUsagesFromExtras` javadoc.
- Portion maths: `ShoppingListService.resolveExtraPortionRatio` / `findLinkedQuantityGrams` (MPP-1).
- Modal shell, header, list rows, hint line: `ManageTemplatesModal.jsx` + `TemplateModals.css`; menu + bottom-sheet scrim: `MealPlanMenu.jsx` + `MealPlanMenu.css`.
- New popup markup/CSS: the `mx-*` classes in the approved mockup.
- Tests: `ShoppingListServiceTest`, `MealPlanServiceTest` (Mockito, `@InjectMocks`).

### Constraints flagged on the brief

- Migration must be applied to Railway MySQL **before** the backend redeploys (`ddl-auto: validate`).
- Choices are keyed to the **effective meal-plan owner** (`users.meal_plan_owner_id`; 2 linked users live).
- No stored choice ⇒ homemade; the list must equal today's homemade output (AC 15).
- Nutrition always homemade basis — store-bought path is shopping-list only.
- Review the 32 `recipe_extras` rows before inserting (listed in full in Data shapes).
- Regenerating a list still resets ticked items.
- Guests keep localStorage-only behaviour.
- Approved mockup is the visual contract; phone = bottom sheet, ≥44 px targets.

### Assumptions made

- **Three tables, plain `Long` FK columns in the entities** (no `@ManyToOne`) — choice rows are read in bulk by id lists; relations would add lazy-loading surface for no gain. DB FKs + `ON DELETE CASCADE` still enforce integrity.
- **DB-level cascade is load-bearing**: `deleteByUserIdAndDateRange` and `deleteByTemplateId` are JPQL bulk deletes that bypass JPA cascades, so entry/template-entry deletion must cascade in MySQL.
- **Both values stored explicitly** (`is_homemade` 1 or 0), upserted on the natural unique key; absence still means homemade. Makes "All homemade" an overwrite rather than a delete.
- **Defaults fan out across the family**: writing a default for recipe R also writes it for R's Light/Moderate/Balanced siblings, so the popup pre-fills the same choice whichever variant is added next. The brief says "per-dish default" without defining dish; family = dish is the plausible reading.
- **Variant switch = swap in the same slot** via `POST /api/meal-plan` (the only place a planned meal changes recipe today). Rule: if the request carries `extraChoices`, those win; else if the replaced entry's recipe is in the same family as the new one, its choices are copied; otherwise none. The add popup pre-fills from the replaced entry's choices when it is a same-family sibling.
- **Add-to-day popup writes choices atomically with the assign** via a new optional `MealPlanCreateRequest.extraChoices` — no second round-trip, no window where the entry exists without its choices.
- **Week edit scope = entry ids** sent by the client; the server validates each entry belongs to the owner and each `extraRecipeId` is in that entry's recipe extras tree (400 otherwise, 404 for a foreign entry).
- **Nested extras**: the popup lists the tree flattened in display order with a `depth`; children of a store-bought extra are hidden (they are not cooked). Bulk buttons set every listed extra.
- **Used grams** for nested extras follow the same chain as the shopping list (`link grams × parent ratio`), via the extracted `ExtraPortionResolver`, so the popup and the list cannot disagree.
- **Store-bought rows aggregate under unit key `g`** (live: `units.id = 1, key = 'g'`), looked up once per generation with `UnitRepository.findByKey("g")`.
- **Breakdown store-bought usage** is reported only when the requested unit is `g` and the ingredient is the extra's store-bought product, labelled `via "<Extra> (store-bought)"`.
- **Legacy import**: `POST /api/meal-plan/extras/import` runs only when the owner has zero defaults **and** zero entry choices; it writes defaults (with fan-out) and fills entries dated ≥ Monday of the current week whose recipe id is a key in the payload and which have no choice yet. The client deletes its localStorage key after a successful (or `imported:false`) response.
- **`HomemadeSelectionsDTO` and `GenerateShoppingListRequest.selections` are deleted**; MPP-8's two selection tests are replaced. Spring Boot's default Jackson config ignores unknown properties, so an old client still sending `selections` gets 200.
- **Template summary counts** (`extrasMealCount`, `storeBoughtCount`) are added to `MealPlanTemplateDTO` and computed in `listTemplates`/detail — 5 templates / 95 entries live, so per-call cost is trivial.
- **Calendar cart icon** derives from `MealPlanEntryDTO.extraChoices` (`Object.values(..).includes(false)`), not a separate boolean — the same map feeds `RecipeViewModal`'s linked-step wording.
- **Week popup refresh**: the week plan is refetched when the popup closes (cart icons), templates are force-reloaded when the template popup closes (counts).
- **Regenerate** reuses `ShoppingListContext.generateShoppingList(list.startDate, list.endDate)`; overlap = `list.startDate <= weekEnd && list.endDate >= weekStart`.
- **Data fix ordering**: Pink Sauce Pasta's Pizza Sauce gets `display_order = 1` (Fresh Pasta is 0); omelette parents get Milk Bread 0, Honey Ham 1; all others 0.

### Cross-code alignment audit (FE ↔ BE ↔ DB)

- **`meal_plan_entries`** (live `information_schema.COLUMNS`): `id bigint NO PRI`, `user_id bigint NO MUL`, `plan_date date NO`, `meal_id bigint NO MUL`, `recipe_id bigint NO MUL`, `servings decimal(4,2) NO`, `created_at timestamp YES`, `updated_at timestamp YES` — matches `MealPlanEntry` (`servings` `precision = 4, scale = 2`). 800 rows.
- **`meal_plan_template_entries`**: `id bigint NO PRI`, `template_id bigint NO MUL`, `day_offset int NO`, `meal_id bigint NO MUL`, `recipe_id bigint NO MUL`, `servings decimal(4,2) NO` — matches `MealPlanTemplateEntry`. 95 rows across 5 templates.
- **FK delete rules** (`REFERENTIAL_CONSTRAINTS`): `meal_plan_entries.user_id → users CASCADE`, `.recipe_id → recipes CASCADE`, `.meal_id → meals RESTRICT`; `meal_plan_template_entries.template_id → meal_plan_templates CASCADE`, `.recipe_id → recipes CASCADE`. New choice tables cascade off these, so deleting a user/recipe/template clears choices transitively.
- **`recipe_extras`**: `id bigint NO PRI`, `parent_recipe_id bigint NO MUL`, `child_recipe_id bigint NO MUL`, `display_order int YES`; indexes include `unique_parent_child (parent_recipe_id, child_recipe_id)` UNIQUE. 71 rows vs 103 distinct `(recipe_id, linked_recipe_id)` pairs in `recipe_ingredients` → **32 missing**, matching the ticket. No `(recipe_id, linked_recipe_id)` pair is duplicated in `recipe_ingredients`.
- **Missing links (live)**: 37/38/39 → Pizza Sauce 12 (store-bought Tomato passata 136; 160/180/220 g); 189/196/197 → Fresh Pasta 36 (no product); 205/206/207 → Milk Bread 26; 208/209 → Pizza Sauce 12 (passata 136; 60 g); 210/211/212 → Fresh Pasta 36 (Spaghetti (dried) 126; 190/260/280 g); 220/221/222 → Goodness Granola 213; 223–231 → Milk Bread 26; 232/233/234 → Milk Bread 26 **and** Honey Ham 64. Existing extras on those parents: only 37/38/39 → Fresh Pasta 36 at `display_order 0`.
- **Units**: `units (id=1, key='g', value='g')`, `(id=5, key='piece')` — gram unit exists for aggregation.
- **Example fixture**: recipe 82 → linked 36, `quantity_grams = 200.00`, `ingredient_id = 126` — the 200 g in example 1 is literally the link grams at default servings.
- **Linked users**: `COUNT(users WHERE meal_plan_owner_id IS NOT NULL) = 2` (aggregate only; no user rows read).
- **Shopping lists**: 5 persisted lists; `shopping_lists.start_date / end_date` ↔ `PersistedShoppingListDTO.startDate / endDate` ↔ client `shoppingList.startDate / endDate` — used for the overlap check.
- **No new table already exists**: `information_schema.TABLES LIKE '%choice%' / '%default%' / '%extra%'` returns only `recipe_extras`.
- **Unapplied migrations**: latest file `2026-10-03-add-chilli-lime-chicken-halloumi-rice-noodles.sql` is applied (3 matching recipes live); no schema migration is outstanding.
- **Linked-step rule** (`linked-recipe-extras.md` check 5): `links_without_step = 0` — all 32 links already have prep steps, so adding them to `recipe_extras` surfaces nothing step-less.
- **Name chain (new)**: `meal_plan_entry_extra_choices.is_homemade` ↔ `@Column(name = "is_homemade") Boolean homemade` ↔ JSON `homemade` ↔ client `homemade`. `extra_recipe_id` ↔ `extraRecipeId` everywhere. `MealPlanEntryDTO.extraChoices` (JSON object, string keys) ↔ client `entry.extraChoices[extraId]`. `MealPlanCreateRequest.extraChoices` ↔ `mealPlanService.assignRecipe(..., extraChoices)`. `MealPlanTemplateDTO.extrasMealCount / storeBoughtCount` ↔ `t.extrasMealCount / t.storeBoughtCount`.
- **Existing name chain**: `RecipeSummaryDTO.variants[].recipeId` (from `RecipeVariantDTO.recipeId`) is what the client uses to test "same family" for popup pre-fill.

---

## Part 2 — Technical design

### Approach

**Storage.** Three narrow tables hold booleans keyed by natural unique keys: per meal-plan entry per extra, per template entry per extra, and per owner per recipe per extra (the default). Everything resolves through the effective owner, so the linked account reads and writes the owner's rows with no extra logic: entry and template-entry rows inherit ownership from their parent row, and the defaults table stores `user_id = ownerId`. FKs cascade from entries, template entries, users and recipes, which matters because the existing week-replace and template-update paths use JPQL bulk deletes that never touch JPA cascades. A separate reviewed data migration inserts the 32 missing `recipe_extras` rows; `unique_parent_child` plus a `NOT EXISTS` guard makes it idempotent.

**Service shape.** `ExtraChoiceService` owns every rule about choices: owner resolution, bulk reads (`Map<entryId, Map<extraId, homemade>>`), upserts, copies between entries / template entries, the family fan-out for defaults, week-vs-template scope (week writes update defaults, template writes never do), validation (entry owned, extra in tree), and the one-time legacy import. `ManageExtrasService` builds the popup view model — meals that have extras, in date/meal order, with the flattened tree, current choice, used grams and store-bought product name — for a week or a template, and the per-template counts. The link-grams and portion-ratio maths currently private in `ShoppingListService` moves into a small `ExtraPortionResolver` component used by both the list and the popup, so "Buy Tomato passata · 180 g" in the popup is the same number the list prints. `MealPlanService` and `MealPlanTemplateService` call `ExtraChoiceService` at the four lifecycle points (assign, copy week, snapshot, apply); swap days needs nothing because it moves entries in place. Alternatives rejected: **one polymorphic table** with a `scope` column and nullable FKs (no FK-level cascade per scope, uglier uniqueness); **choices as a JSON column** on `meal_plan_entries` (can't query store-bought counts, can't cascade per extra, changes a hot entity); **keeping the client payload and just syncing localStorage to the server** (still per-browser at generate time, still breaks for linked users — the core bug).

**Shopping list.** `getShoppingList(userId, startDate)` loads entries, then one query for all their choices, and passes each entry's map into the existing `processExtras` walk — the walk itself is unchanged except the store-bought branch: with a product, it adds `linkGrams × parentRatio` grams under key `(ingredientId, gUnitId)` with unit `"g"`, so a dried spaghetti row merges with dried spaghetti used raw elsewhere; without a product, the generic "Store Bought X" row is untouched. `getIngredientBreakdown` gets the same per-entry choices: it skips a store-bought extra's subtree and, when the requested ingredient is that extra's product in `g`, reports the store-bought grams — closing the MPP-8 divergence. The client stops sending `selections`; `HomemadeSelectionsDTO` is deleted.

**Frontend.** `HomemadeSelectionsContext` keeps its public surface (`selections`, `getSelections`, `saveSelections`, `selectionsLoaded`) so `ExtrasSelectionPopup` and `RecipeViewModal` barely move, but for authenticated users it loads defaults from `GET /api/meal-plan/extras/defaults`, runs the one-time localStorage import, and treats `saveSelections` as a local cache update (the server write happens inside the assign call). `DayAssignmentButtons` passes the popup's map into `assignRecipe(..., extraChoices)`; `MealPlanContext` and `mealPlanService` forward it without growing. The Manage extras popup is one presentational `ManageExtrasModal` driven by a `useManageExtras({ load, save })` hook — the week and template entry points differ only in the adapter functions, title/subtitle/scope note, and whether a back arrow and the Regenerate bar render. Save-on-tap is optimistic: flip locally, call PUT, show Saving… → ✓ Saved, and on failure revert the exact items and show the error line. `MealPlanCalendar` owns which modal is open, so the template flow swaps `ManageTemplatesModal` for `ManageExtrasModal` (no stacking) and back.

### Skills to invoke during execution

- `java-backend` — entities, repositories, the two new services, `ExtraPortionResolver`, controller, DTOs, changes to `ShoppingListService` / `MealPlanService` / `MealPlanTemplateService` / `PersistedShoppingListService`, migration mechanics, Mockito tests.
- `react-frontend` — `extraChoicesService.js`, `HomemadeSelectionsContext`, `useManageExtras`, `ManageExtrasModal` and sub-components + CSS, menu/templates/calendar/entry wiring, the four async states, ≥44 px targets, no growth of >400-line files.
- `chef` — governs the `recipe_extras` data migration (reviewed 32-row list, guarded idempotent INSERT). Developer-confirmed during planning; no recipe content changes.

Rules the executor must Read: `.claude/rules/linked-recipe-extras.md`, `.claude/rules/homemade-first-and-ingredient-dedup.md`, `.claude/rules/recipe-variants.md` (family = dish for default fan-out).

### Diagram

```mermaid
sequenceDiagram
    participant UI as Client (popup / Manage extras / Generate)
    participant MPC as MealPlanController / MealPlanExtrasController
    participant ECS as ExtraChoiceService
    participant MES as ManageExtrasService
    participant SLS as ShoppingListService
    participant EPR as ExtraPortionResolver
    participant DB as MySQL

    Note over UI,DB: Add to day (popup confirm)
    UI->>MPC: POST /api/meal-plan {recipeId, ..., extraChoices}
    MPC->>ECS: (via MealPlanService.assignRecipe) setEntryChoices + updateDefaults(owner, recipe)
    ECS->>DB: upsert meal_plan_entry_extra_choices, user_extra_defaults (family fan-out)

    Note over UI,DB: Manage extras (week)
    UI->>MPC: GET /api/meal-plan/extras/week?startDate
    MPC->>MES: getWeekView(user, start)
    MES->>ECS: getEntryChoices(entryIds)
    MES->>EPR: usedGrams(parent, extra, ratio)
    MES-->>UI: ManageExtrasViewDTO
    UI->>MPC: PUT /api/meal-plan/extras/week/choices [{targetId, extraRecipeId, homemade}]
    MPC->>ECS: updateWeekChoices (validate owner + tree, upsert, update defaults)

    Note over UI,DB: Generate list (any device, any linked user)
    UI->>SLS: POST /api/shopping-list/generate {startDate, endDate}
    SLS->>DB: entries for owner in range
    SLS->>ECS: getEntryChoices(entryIds)
    SLS->>EPR: portion ratio / used grams per extra
    SLS-->>UI: homemade subtrees prorated; store-bought product in g; else "Store Bought X"
```

### Data shapes

#### DDL — `foodbytes-app/database/migrations/2026-10-10-mpp10-extra-choices-schema.sql`

```sql
CREATE TABLE meal_plan_entry_extra_choices (
  id                 BIGINT     NOT NULL AUTO_INCREMENT,
  meal_plan_entry_id BIGINT     NOT NULL,
  extra_recipe_id    BIGINT     NOT NULL,
  is_homemade        TINYINT(1) NOT NULL,
  updated_at         TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpe_extra_choice (meal_plan_entry_id, extra_recipe_id),
  KEY idx_mpe_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpe_extra_choice_entry FOREIGN KEY (meal_plan_entry_id)
    REFERENCES meal_plan_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpe_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE meal_plan_template_entry_extra_choices (
  id                BIGINT     NOT NULL AUTO_INCREMENT,
  template_entry_id BIGINT     NOT NULL,
  extra_recipe_id   BIGINT     NOT NULL,
  is_homemade       TINYINT(1) NOT NULL,
  updated_at        TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpte_extra_choice (template_entry_id, extra_recipe_id),
  KEY idx_mpte_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpte_extra_choice_entry FOREIGN KEY (template_entry_id)
    REFERENCES meal_plan_template_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpte_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_extra_defaults (
  id              BIGINT     NOT NULL AUTO_INCREMENT,
  user_id         BIGINT     NOT NULL,
  recipe_id       BIGINT     NOT NULL,
  extra_recipe_id BIGINT     NOT NULL,
  is_homemade     TINYINT(1) NOT NULL,
  updated_at      TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_extra_default (user_id, recipe_id, extra_recipe_id),
  CONSTRAINT fk_user_extra_default_user   FOREIGN KEY (user_id)         REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_recipe FOREIGN KEY (recipe_id)       REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_extra  FOREIGN KEY (extra_recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

#### Data — `foodbytes-app/database/migrations/2026-10-10-mpp10-recipe-extras-missing-links.sql`

32 `(parent_recipe_id, child_recipe_id, display_order)` rows, inserted with `INSERT INTO recipe_extras (...) SELECT v.p, v.c, v.o FROM (SELECT 37 AS p, 12 AS c, 1 AS o UNION ALL SELECT ... ) v WHERE NOT EXISTS (SELECT 1 FROM recipe_extras re WHERE re.parent_recipe_id = v.p AND re.child_recipe_id = v.c)` (derived-table `UNION ALL`, not `VALUES ROW`, so it runs on any MySQL 8 minor):

| parent | child | order | parent | child | order |
|---|---|---|---|---|---|
| 37 | 12 | 1 | 223 | 26 | 0 |
| 38 | 12 | 1 | 224 | 26 | 0 |
| 39 | 12 | 1 | 225 | 26 | 0 |
| 189 | 36 | 0 | 226 | 26 | 0 |
| 196 | 36 | 0 | 227 | 26 | 0 |
| 197 | 36 | 0 | 228 | 26 | 0 |
| 205 | 26 | 0 | 229 | 26 | 0 |
| 206 | 26 | 0 | 230 | 26 | 0 |
| 207 | 26 | 0 | 231 | 26 | 0 |
| 208 | 12 | 0 | 232 | 26 | 0 |
| 209 | 12 | 0 | 232 | 64 | 1 |
| 210 | 36 | 0 | 233 | 26 | 0 |
| 211 | 36 | 0 | 233 | 64 | 1 |
| 212 | 36 | 0 | 234 | 26 | 0 |
| 220 | 213 | 0 | 234 | 64 | 1 |
| 221 | 213 | 0 | 222 | 213 | 0 |

#### Entities (`com.foodbytes.model`)

```java
@Entity @Table(name = "meal_plan_entry_extra_choices")
public class MealPlanEntryExtraChoice {
  @Id @GeneratedValue(strategy = IDENTITY) Long id;
  @Column(name = "meal_plan_entry_id", nullable = false) Long mealPlanEntryId;
  @Column(name = "extra_recipe_id", nullable = false)    Long extraRecipeId;
  @Column(name = "is_homemade", nullable = false)        Boolean homemade;
  @Column(name = "updated_at", insertable = false, updatable = false) LocalDateTime updatedAt;
}
// MealPlanTemplateEntryExtraChoice: same, with templateEntryId → "template_entry_id"
// UserExtraDefault: userId "user_id", recipeId "recipe_id", extraRecipeId, homemade, updatedAt
```
Each overrides `equals`/`hashCode` on id, matching `MealPlanEntry`.

#### Repositories (`com.foodbytes.repository`)

```java
interface MealPlanEntryExtraChoiceRepository extends JpaRepository<MealPlanEntryExtraChoice, Long> {
  List<MealPlanEntryExtraChoice> findByMealPlanEntryIdIn(Collection<Long> entryIds);
  @Query("SELECT COUNT(c) > 0 FROM MealPlanEntryExtraChoice c, MealPlanEntry e " +
         "WHERE e.id = c.mealPlanEntryId AND e.user.id = :ownerId")
  boolean existsForOwner(@Param("ownerId") Long ownerId);
}
interface MealPlanTemplateEntryExtraChoiceRepository extends JpaRepository<MealPlanTemplateEntryExtraChoice, Long> {
  List<MealPlanTemplateEntryExtraChoice> findByTemplateEntryIdIn(Collection<Long> templateEntryIds);
}
interface UserExtraDefaultRepository extends JpaRepository<UserExtraDefault, Long> {
  List<UserExtraDefault> findByUserId(Long userId);
  List<UserExtraDefault> findByUserIdAndRecipeIdIn(Long userId, Collection<Long> recipeIds);
  boolean existsByUserId(Long userId);
}
// MealPlanEntryRepository (add):
@Query("SELECT mpe FROM MealPlanEntry mpe WHERE mpe.user.id = :userId AND mpe.planDate >= :fromDate")
List<MealPlanEntry> findByUserIdFromDate(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);
// MealPlanTemplateEntryRepository already has findByTemplateId.
```

#### DTOs (`com.foodbytes.dto`)

```java
// New
@Data class ExtraChoiceItemDTO { @NotNull Long targetId; @NotNull Long extraRecipeId; @NotNull Boolean homemade; }
@Data class ExtraChoicesUpdateRequest { @NotEmpty @Size(max = 300) List<@Valid ExtraChoiceItemDTO> choices; }
@Data class LegacySelectionsImportRequest { @NotNull Map<Long, Map<Long, Boolean>> selections; }
@Data @Builder class ManageExtrasViewDTO {
  String scope;              // "WEEK" | "TEMPLATE"
  LocalDate startDate;       // WEEK only
  LocalDate endDate;         // WEEK only, inclusive (start + 6)
  Long templateId;           // TEMPLATE only
  String templateName;       // TEMPLATE only
  List<ManageExtrasMealDTO> meals;   // only meals with ≥1 extra; ordered by date/dayOffset, then meal id
}
@Data @Builder class ManageExtrasMealDTO {
  Long targetId;             // meal_plan_entries.id or meal_plan_template_entries.id
  LocalDate planDate;        // WEEK only
  Integer dayOffset;         // 0..6, both scopes
  String mealType;           // meals.key
  Long recipeId; String recipeName; String variantLabel; // variantLabel null when not in a family
  BigDecimal servings; Integer defaultServings;
  List<ManageExtraDTO> extras;       // flattened tree, display order, depth-first
}
@Data @Builder class ManageExtraDTO {
  Long extraRecipeId; String extraName;
  Integer depth;             // 0 = direct extra
  Long parentExtraRecipeId;  // null at depth 0
  Boolean homemade;          // stored choice, true when none stored
  BigDecimal usedGrams;      // scaled to servings, 0 dp HALF_UP; null if no link row
  Long storeBoughtIngredientId; String storeBoughtIngredientName; // null when no product
}

// Modified
MealPlanCreateRequest   + Map<Long, Boolean> extraChoices;          // optional; null = no popup
MealPlanEntryDTO        + Map<Long, Boolean> extraChoices;          // empty map when none stored
MealPlanTemplateDTO     + Integer extrasMealCount; + Integer storeBoughtCount;
GenerateShoppingListRequest  − selections                            // removed
HomemadeSelectionsDTO                                                // deleted
```

#### HTTP contract — `MealPlanExtrasController` at `/api/meal-plan/extras`

| Verb + path | Body | 2xx | Errors |
|---|---|---|---|
| `GET /week?startDate=YYYY-MM-DD` | — | 200 `ManageExtrasViewDTO` (scope WEEK) | 403 no auth |
| `PUT /week/choices` | `ExtraChoicesUpdateRequest` (targetId = entry id) | 204 | 400 extra not in tree / invalid body, 404 entry not owned, 403 |
| `GET /templates/{templateId}` | — | 200 `ManageExtrasViewDTO` (scope TEMPLATE) | 404 template not owned, 403 |
| `PUT /templates/{templateId}/choices` | `ExtraChoicesUpdateRequest` (targetId = template entry id) | 204 | 400, 404 (template or entry not in template), 403 |
| `GET /defaults` | — | 200 `{ "<recipeId>": { "<extraId>": true/false } }` | 403 |
| `POST /import` | `LegacySelectionsImportRequest` | 200 `{ "imported": true/false }` | 400, 403 |

Unchanged paths, changed behaviour: `POST /api/meal-plan` accepts `extraChoices`; `GET`/`POST /api/meal-plan/shopping-list` ignore any body and read stored choices; `POST /api/shopping-list/generate` ignores `selections`.

#### Backend service surface

```java
@Component class ExtraPortionResolver {             // moved verbatim from ShoppingListService
  BigDecimal findLinkedQuantityGrams(Recipe parent, Long childId);          // null when no link row
  BigDecimal resolveExtraPortionRatio(Recipe parent, Long childId, BigDecimal parentRatio, Recipe child);
  BigDecimal usedGrams(Recipe parent, Long childId, BigDecimal parentRatio); // linkGrams × parentRatio, null if no link
}
@Service class ExtraChoiceService {
  Long resolveOwnerId(Long userId);
  Map<Long, Map<Long, Boolean>> getEntryChoices(Collection<Long> entryIds);
  Map<Long, Map<Long, Boolean>> getTemplateEntryChoices(Collection<Long> templateEntryIds);
  void setEntryChoices(Long entryId, Map<Long, Boolean> choices);                    // upsert
  void updateDefaults(Long ownerId, Long recipeId, Map<Long, Boolean> choices);       // + family siblings
  Map<Long, Map<Long, Boolean>> getDefaults(Long userId);                             // keyed recipeId
  void copyEntryChoices(Map<Long, Long> sourceEntryIdToTargetEntryId);
  void copyEntryChoicesToTemplate(Map<Long, Long> entryIdToTemplateEntryId);
  void copyTemplateChoicesToEntries(Map<Long, Long> templateEntryIdToEntryId);
  void updateWeekChoices(Long userId, List<ExtraChoiceItemDTO> choices);              // + defaults
  void updateTemplateChoices(Long userId, Long templateId, List<ExtraChoiceItemDTO> choices); // no defaults
  boolean importLegacySelections(Long userId, Map<Long, Map<Long, Boolean>> selections);
  Map<Long, Boolean> retainTreeExtras(Long recipeId, Map<Long, Boolean> choices);    // drops ids not in the recipe's extras tree
  static class ChoiceTargetNotFoundException extends RuntimeException {}
}
@Service class ManageExtrasService {
  ManageExtrasViewDTO getWeekView(Long userId, LocalDate startDate);
  ManageExtrasViewDTO getTemplateView(Long userId, Long templateId);
  Map<Long, int[]> templateExtrasCounts(List<MealPlanTemplate> templates);           // {extrasMealCount, storeBoughtCount}
}
ShoppingListService.getShoppingList(Long userId, LocalDate startDate)              // selections param removed
```

#### Frontend modules (`foodbytes-app/client/src`)

```js
// services/extraChoicesService.js
getWeek(startDate, { signal })            // GET /meal-plan/extras/week?startDate=
updateWeek(choices)                       // PUT /meal-plan/extras/week/choices  { choices }
getTemplate(templateId, { signal })       // GET /meal-plan/extras/templates/{id}
updateTemplate(templateId, choices)       // PUT /meal-plan/extras/templates/{id}/choices
getDefaults({ signal })                   // GET /meal-plan/extras/defaults
importLegacy(selections)                  // POST /meal-plan/extras/import { selections }

// constants/extraChoices.js
export const SAVE_STATUS = { IDLE: 'idle', SAVING: 'saving', SAVED: 'saved', ERROR: 'error' }
export const LEGACY_SELECTIONS_KEY_PREFIX = 'homemadeSelections_'
export const EXTRAS_SCOPE = { WEEK: 'week', TEMPLATE: 'template' }
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// utils/manageExtrasUtils.js (pure, node-smoke-testable)
choiceKey(targetId, extraRecipeId) · visibleExtras(meal) · patchView(view, items) · countExtras(view) · formatShortRange(startISO, endISO)

// hooks/useManageExtras.js — primitives in, so effect deps need no memoised callbacks
useManageExtras({ scope, startDate, templateId }) → { view, loading, loadError, saveStatus, hasSaved,
                                    toggle(targetId, extraRecipeId, homemade), setAll(homemade), counts, reload }
// hooks/useLinkedStepSelections.js
useLinkedStepSelections(parentRecipeId, extraChoices) → extraChoices ?? getSelections(parentRecipeId)

// contexts/HomemadeSelectionsContext.jsx — public surface kept, plus:
reloadSelections()  // re-reads server defaults after a week edit

// components/common/ExtrasIcons.jsx   CartIcon, HomeIcon, InfoIcon (SVGs from the mockup's ICON_* constants)
// components/mealplan/
ManageExtrasModal.jsx     props: { title, subtitle, scopeNote, savedTo, emptyTitle, emptyBody, showDates, extras (hook result), onBack?, onClose, children? }
ManageExtrasMeal.jsx      one meal block (header + rows)
ExtraChoiceRow.jsx        name, "Make/Buy … g" line, segmented Homemade | Store-bought switch
ShoppingListStaleBar.jsx  orange bar + Regenerate list (week only)
WeekExtrasModal.jsx       week adapter: hook + copy + stale bar
TemplateExtrasModal.jsx   template adapter: hook + copy + back arrow
ManageExtrasModal.css     mx-* classes ported from the mockup (generic mockup names prefixed mx-)
```

### Runtime quality notes

- **Resource cleanup:** Backend: all DB work inside `@Transactional` service methods; no streams or manual connections. Frontend (browser event loop): `useManageExtras` and the `HomemadeSelectionsContext` defaults load each own an `AbortController` aborted in effect cleanup; cancellations are swallowed. PUT/POST writes are never aborted. The modal's ESC / outside-click listeners are removed in cleanup, mirroring `ManageTemplatesModal`.
- **Concurrency / ordering:** Upserts are find-then-save inside one transaction on a unique key; two devices tapping the same extra concurrently can collide on `uk_*` — the loser gets a 500 → client reverts and shows the error; retry succeeds (acceptable for a 2-user household, noted in Risks). `assignRecipe` reads the replaced entry's choices **before** deleting it (DB cascade would remove them). Rapid taps in the popup: each tap is its own PUT; the hook tracks the last-in-flight request per `(targetId, extraRecipeId)` and only reverts that item on failure, so an earlier failed tap cannot clobber a later successful one. Linked users share rows via the owner id; last write wins.
- **Allocation / cost behaviour:** Generate: one extra query for all entries' choices (`findByMealPlanEntryIdIn`) instead of per entry; extras trees and extra recipes stay request-cached. Week view: entries (1 query), choices (1), extras tree per **distinct** recipe (cached), family label per distinct recipe (cached), `ingredientRepository.findById` per distinct store-bought product (cached). Template list: per-template counts across ≤5 templates / ~95 entries — bounded. `getWeekPlan` adds one `findByMealPlanEntryIdIn` for the week. No macro recomputation added. Frontend: three small new components, no new dependency.
- **Error paths:** `ChoiceTargetNotFoundException` → 404, `IllegalArgumentException` (extra not in tree, empty choices) → 400, both caught in the controller like `MealPlanTemplateController`; bean validation → 400 via `@Valid`. Store-bought product missing (`ingredientRepository.findById` empty) → logged warn, falls back to the generic "Store Bought X" row rather than dropping the extra. Missing link row → `usedGrams` null → popup shows the line without grams, list falls back to generic row, warn logged. Client: load error renders an error state with retry (not an empty list); save error reverts the item and shows the mockup's error line; import failure is logged once and leaves localStorage untouched so the next load retries.

### Risks and judgement calls

- **Manual DB steps (developer-owned):** apply `2026-10-10-mpp10-extra-choices-schema.sql` to Railway **before** the backend redeploys; apply `2026-10-10-mpp10-recipe-extras-missing-links.sql` (either order relative to deploy — it is data only). Then redeploy the backend.
- **The 32-link fix changes lists immediately**: toast breakfasts (223–234), chicken dippers, granola bowls and the soup will now pull Milk Bread / Goodness Granola / Fresh Pasta / Honey Ham **homemade ingredients** (flour, oats, pork…) onto lists, where today those sub-recipes are silently dropped. That is the homemade-first rule working, but a user who buys bread will see flour until they flip to store-bought — and Milk Bread, Granola, Honey Ham and the soup's Fresh Pasta have **no store-bought product**, so their store-bought path is the generic "Store Bought Milk Bread" row. Confirm Honey Ham should be user-choosable at all.
- **Default fan-out across families** is an interpretation of "per-dish"; if defaults should be per exact variant, drop the sibling write in `updateDefaults` (one method).
- **Variant-swap carry rule** relies on "same family"; swapping Bolognese for a different dish that also uses Fresh Pasta does **not** carry the pasta choice — the popup pre-fills from that dish's default instead.
- **`MealPlanContext.jsx` (559 lines) and `RecipeViewModal.jsx` (406)** are already over the 400-line budget; this plan changes them **without growing them** (signature edits on existing lines; one hook call replacing two lines). Splitting them stays known debt.
- **`ExtraPortionResolver` extraction** touches MPP-1's maths; it is a verbatim move and `ShoppingListServiceTest`'s existing proration tests are the regression net. Those tests construct the service with `@InjectMocks`, so the test setup must build the resolver as a real object (Task notes this).
- **Removing `HomemadeSelectionsDTO` / `selections`** deletes MPP-8's request plumbing and its two tests. MPP-8 is still "Ready for Test"; once this ships, MPP-8's play-test is effectively re-run under MPP-10.
- **Concurrent upsert race** on the same key returns 500 to the loser rather than retrying; acceptable now, would need `INSERT … ON DUPLICATE KEY UPDATE` via a native query if it shows up.
- **Breakdown labelling** for store-bought usage ("Pizza Sauce (store-bought)") is new copy not in the mockup.
- **Legacy import scope** (current-and-future weeks, only entries whose exact recipe id was a localStorage key) means a past week or a variant added later keeps homemade — deliberate, matches the ticket.

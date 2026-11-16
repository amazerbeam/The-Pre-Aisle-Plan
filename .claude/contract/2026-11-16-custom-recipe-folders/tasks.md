# Tasks: Custom recipe folders (all themes)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: PLANNED
Started: 2026-11-16

**Goal:** Personal, nested (≤3 levels) recipe folders with multi-folder membership and a Menu / Folders view switch on the Recipes page, in the Default, Cyberpunk and Parchment themes, backed by `recipe_folders` / `recipe_folder_items` and `/api/recipe-folders`.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-11-16-recipe-folders.sql` — the two tables
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeKeyResolver.java` — family-default-id key (moved out of `HiddenRecipeService`)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RecipeFolder.java`, `model/RecipeFolderItem.java` — entities
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/RecipeFolderRepository.java`, `repository/RecipeFolderItemRepository.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFolderTree.java` — pure tree rules
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFolderService.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeFolderDTO.java`, `RecipeFoldersDTO.java`, `RecipeFolderCreateRequest.java`, `RecipeFolderNameRequest.java`, `RecipeFolderParentRequest.java`, `RecipeFolderItemDTO.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeFolderController.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeFolderTreeTest.java`, `RecipeFolderServiceTest.java`
- `foodbytes-app/client/src/constants/recipeFolders.js`
- `foodbytes-app/client/src/utils/recipeFolderTree.js`
- `foodbytes-app/client/src/services/recipeFolderService.js`
- `foodbytes-app/client/src/hooks/useRecipeFolders.js`, `useRecipeView.js`, `useRecipeFolderScope.js`
- `foodbytes-app/client/src/components/recipes/folders/` — `FolderIcon.jsx`, `RecipeViewToggle.jsx`, `FolderTree.jsx`, `FolderSidebar.jsx`, `FolderBar.jsx`, `FolderHeader.jsx`, `FolderRoot.jsx`, `FolderChips.jsx`, `FolderActionsMenu.jsx`, `FolderDialogs.jsx`, `RecipeFolders.css`

**Modified:**
- `foodbytes-app/mockup/parchment-theme.html` — folder feature drawn in Parchment
- `foodbytes-app/mockup/app-mockup.html` — delete is confirm-only (no Undo)
- `foodbytes-app/mockup/README.md` — folder section: Parchment drawn, delete without Undo, status
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HiddenRecipeService.java` — `normalise` delegates to `RecipeKeyResolver`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HiddenRecipeServiceTest.java` — builds the service with a real resolver over its mocks
- `foodbytes-app/client/src/constants/pixelIcons.js`, `constants/engravedIcons.js` — `folder` glyph
- `foodbytes-app/client/src/components/recipes/RecipeList.jsx` — view switch, folder layout, scope
- `foodbytes-app/client/src/components/recipes/RecipeToolbar.jsx` — `folderBar` slot, folder-aware placeholder
- `foodbytes-app/client/src/components/recipes/RecipeCard.jsx`, `RecipeCardMenu.jsx` — folder chips, menu items, drag source
- `foodbytes-app/client/src/styles/themes/default.css`, `cyberpunk.css`, `parchment.css` — `--folder-*` / `--view-toggle-*` tokens
- `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css`, `parchment/recipes.css` — theme-only folder looks
- `foodbytes-app/client/scripts/check-themes.mjs` — `FOLDER_PAIRS` in every theme
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version
- `CLAUDE.md` — one line under Architecture → recipe quirks noting folders key by family default id

**Deleted:** (none)

---

## Phase 1 — Mockups first

The UI source of truth is updated before any code: Parchment gets its folder screens, Cyberpunk drops the delete Undo. Nothing in the app changes, so stopping here is always safe. **Phase 1 ends with a developer review checkpoint.**

### Task 1: Align the Cyberpunk mockup with "delete is confirm-only"

- Skill: none — HTML mockup edit, no app code

**Files:**
- Modify: `foodbytes-app/mockup/app-mockup.html` (`fdoDel` action and the `fdel` dialog body)

- [ ] **Step 1: Drop the Undo from `fdoDel`**

Replace the toast in `fdoDel` so it has no undo callback, and remove the `snap` capture:

```js
  fdoDel:()=>{const f=FB(U.dlg.v);
    fKids(f.id).forEach(k=>k.parent=f.parent);S.folders=S.folders.filter(x=>x.id!==f.id);delete S.fmem[f.id];
    if(U.folder===f.id)U.folder=f.parent;U.dlg=null;toast(`Deleted “${esc(f.name)}”. Recipes kept.`)},
```

- [ ] **Step 2: Say it in the delete dialog**

In the `fdel` dialog, append to the first `<p>`: ` This can't be undone.`

- [ ] **Step 3: Syntax-check the page script**

Run: `cd foodbytes-app\mockup; node -e "const s=require('fs').readFileSync('app-mockup.html','utf8');new Function(s.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('ok')"`
Expected: `ok`

### Task 2: Draw folders in the Parchment mockup

- Skill: none — HTML mockup edit, no app code

**Files:**
- Modify: `foodbytes-app/mockup/parchment-theme.html` (`recipesPage` at ~line 398, the `U` state at ~line 373, the dialog renderer, the action map, CSS block)

- [ ] **Step 1: Port the folder model and behaviour from `app-mockup.html`**

Copy into `parchment-theme.html`, adapting to its state object (`U`) and its recipe ids: the seed folders (`Batch cook › Freezer friendly`, `Date night`, `Quick (under 20 min)`, `Gym days › Post-workout`) with members drawn from this file's `RECIPES`; the helpers `FB`, `fKids`, `fPath`, `fDepth`, `fDesc`, `fHeight`, `inF`, `fCount`, `rFolders`, `unfiledN`; the view toggle (`U.view`, localStorage `fb.recipes.view`); the sidebar tree, mobile Folders ▾ bar and sheet, the folder header with breadcrumbs, the subfolder tiles, the top-level tiles plus "Not in a folder yet", folder chips on cards in Folders view, card ⋯ "Add to folder…" / "Remove from <folder>", and the dialogs new / rename / move / delete (confirm-only, as in Task 1) / add-to-folder / add-recipes. Keep labels plain ("Folders", "Menu", "All folders"), as the plan's Assumptions say.

- [ ] **Step 2: Give it the Parchment look**

Style with this file's existing palette variables only (no new hex values beyond what the file already uses):
- The sidebar is a ledger panel with a ruled hairline between rows.
- The active row is ink-on-parchment with a wax-red left rule.
- Folder tiles are leather-edged cards with a gilt top rule.
- Breadcrumbs are small-caps ink.
- The view toggle is two leather tabs; the active tab uses the gold-on-leather pair.
- The folder glyph is an engraved-style SVG matching `engravedIcons.js` stroke weight.
- Touch targets stay ≥44px; the layout holds at 320px.

- [ ] **Step 3: Add deep links**

Support `#view=folders`, `#fold=f1`, `#fdlg=new|add|sheet`, as `app-mockup.html` does.

- [ ] **Step 4: Syntax-check**

Run: `cd foodbytes-app\mockup; node -e "const s=require('fs').readFileSync('parchment-theme.html','utf8');for(const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(m[1]);console.log('ok')"`
Expected: `ok`

### Task 3: Update the mockup README

- Skill: none — docs

**Files:**
- Modify: `foodbytes-app/mockup/README.md` (the "Proposal in review: custom recipe folders" section)

- [ ] **Step 1: Re-read the section, then edit it**

Read the file first (it changed on disk after planning). Then:
- Rename the heading to `## Custom recipe folders (approved 2026-11-16; contract 2026-11-16-custom-recipe-folders)`.
- Change "Cyberpunk only" / "Default and Parchment follow" to state that both `app-mockup.html` and `parchment-theme.html` draw folders, and that Default has no mockup (known gap).
- Replace "(with undo)" on delete with "(confirm-only, no Undo)".
- Add the Parchment deep links.

- [ ] **Step 2: Developer review checkpoint**

Stop and ask the developer to open `parchment-theme.html#view=folders` and `#mobile view=folders` in a browser and approve the Parchment folder look before Phase 6 Parchment CSS is written. Record the approval date in the README section. Phases 2–5 may proceed while waiting.

---

## Phase 2 — Database

Creates two empty tables; nothing existing changes. Safe to stop after: an unmapped table does not affect Hibernate `validate`.

### Task 4: Write the migration

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-11-16-recipe-folders.sql`

- [ ] **Step 1: Write the file**

```sql
-- 2026-11-16 Custom recipe folders (plan: .claude/contract/2026-11-16-custom-recipe-folders/)
-- Personal, nested (max 3 levels, enforced in RecipeFolderService) folders of recipe FAMILIES.
-- recipe_folder_items.recipe_id is the family's DEFAULT recipe id (same key as user_hidden_recipes).
-- parent_id cascade only fires when a whole user is deleted; deleting one folder re-parents its
-- children in the service first.
-- Lossless: two brand-new empty tables; no existing rows change (live: 237 recipes, 13 users, 2026-11-16).
-- Idempotent (IF NOT EXISTS). MUST be applied to Railway BEFORE the backend containing RecipeFolder
-- deploys (Hibernate ddl-auto=validate refuses to start without the tables).
CREATE TABLE IF NOT EXISTS recipe_folders (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  parent_id  BIGINT      NULL,
  name       VARCHAR(40) NOT NULL,
  created_at TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipe_folders_user (user_id),
  KEY idx_recipe_folders_parent (parent_id),
  CONSTRAINT fk_recipe_folders_user   FOREIGN KEY (user_id)   REFERENCES users (id)          ON DELETE CASCADE,
  CONSTRAINT fk_recipe_folders_parent FOREIGN KEY (parent_id) REFERENCES recipe_folders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recipe_folder_items (
  id         BIGINT    NOT NULL AUTO_INCREMENT,
  folder_id  BIGINT    NOT NULL,
  recipe_id  BIGINT    NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recipe_folder_item (folder_id, recipe_id),
  KEY idx_recipe_folder_items_recipe (recipe_id),
  CONSTRAINT fk_recipe_folder_items_folder FOREIGN KEY (folder_id) REFERENCES recipe_folders (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_folder_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- [ ] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-11-16-recipe-folders.sql`
Expected: one file listed.

### Task 5: Developer applies the migration to the local DB

- Skill: none — DBA operation against the local `foodbytes-db` (developer-owned)

**Files:** (none — applies an existing file)

- [ ] **Step 1: Developer applies it locally**

Run (developer, Docker Desktop running): `Get-Content foodbytes-app\database\migrations\2026-11-16-recipe-folders.sql | docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes`
Expected: no output, exit 0.

- [ ] **Step 2: Verify both tables**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW TABLES LIKE 'recipe_folder%'"`
Expected: `recipe_folder_items` and `recipe_folders`.

The Railway apply is listed in the PR description (Task 34) and must happen before the backend redeploys.

---

## Phase 3 — Backend

Builds the API bottom-up. Each task compiles; the new endpoints are only reachable once the controller lands, and they need only the Phase 2 tables. Safe to stop after any task.

### Task 6: Extract `RecipeKeyResolver`

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeKeyResolver.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HiddenRecipeService.java` (`normalise` + fields)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HiddenRecipeServiceTest.java`

- [ ] **Step 1: Create the resolver with the moved body**

```java
package com.foodbytes.service;

import com.foodbytes.repository.RecipeFamilyMemberRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * The per-person key for a recipe FAMILY: the family's default (Moderate) recipe id, or the recipe
 * itself when it has no family / no default. Shared by hidden recipes and recipe folders, so one card
 * maps to one key everywhere. Empty when the recipe does not exist.
 */
@Component
@RequiredArgsConstructor
public class RecipeKeyResolver {
    private final RecipeRepository recipeRepository;
    private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @Transactional(readOnly = true)
    public Optional<Long> resolve(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) return Optional.empty();
        return Optional.of(recipeFamilyMemberRepository.findByRecipeId(recipeId)
            .flatMap(m -> recipeFamilyMemberRepository.findVariantsForRecipe(recipeId).stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
                .map(v -> v.getRecipe().getId())
                .findFirst())
            .orElse(recipeId));
    }
}
```

- [ ] **Step 2: Make `HiddenRecipeService` delegate**

Replace the `RecipeRepository` and `RecipeFamilyMemberRepository` fields with `private final RecipeKeyResolver recipeKeyResolver;`, remove their now-unused imports, and replace the body of `normalise`:

```java
    /** Family default id, or the recipe itself when it has no family / no default. Empty if unknown. */
    public Optional<Long> normalise(Long recipeId) {
        return recipeKeyResolver.resolve(recipeId);
    }
```

- [ ] **Step 3: Rebuild the test's service from its mocks**

In `HiddenRecipeServiceTest`, remove `@InjectMocks` from `service`, make it a plain field, and add:

```java
    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        service = new HiddenRecipeService(userHiddenRecipeRepository,
            new RecipeKeyResolver(recipeRepository, recipeFamilyMemberRepository));
    }
```

Remove the now-unused `InjectMocks` import.

- [ ] **Step 4: Run the hidden-recipes tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HiddenRecipeServiceTest`
Expected: `BUILD SUCCESS`, 0 failures (same count as before the change).

### Task 7: Entities

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RecipeFolder.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RecipeFolderItem.java`

- [ ] **Step 1: Write `RecipeFolder`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/** A personal recipe folder. parentId null = top level. Plain id columns; MySQL cascades on user delete. */
@Entity
@Table(name = "recipe_folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "name", nullable = false, length = 40)
    private String name;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeFolder other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeFolder.class.hashCode();
    }
}
```

- [ ] **Step 2: Write `RecipeFolderItem`**

Same shape as `UserHiddenRecipe`: `@Table(name = "recipe_folder_items", uniqueConstraints = @UniqueConstraint(name = "uk_recipe_folder_item", columnNames = {"folder_id", "recipe_id"}))`, fields `Long id` (IDENTITY), `@Column(name = "folder_id", nullable = false) Long folderId`, `@Column(name = "recipe_id", nullable = false) Long recipeId`, `@Column(name = "created_at", insertable = false, updatable = false) LocalDateTime createdAt`, PK-based `equals`/`hashCode` using `RecipeFolderItem.class.hashCode()`.

- [ ] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no errors.

### Task 8: Repositories

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/RecipeFolderRepository.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/RecipeFolderItemRepository.java`

- [ ] **Step 1: Write both interfaces**

```java
@Repository
public interface RecipeFolderRepository extends JpaRepository<RecipeFolder, Long> {
    List<RecipeFolder> findByUserId(Long userId);
    Optional<RecipeFolder> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
}
```

```java
@Repository
public interface RecipeFolderItemRepository extends JpaRepository<RecipeFolderItem, Long> {
    List<RecipeFolderItem> findByFolderIdIn(Collection<Long> folderIds);

    /** Idempotent add: a concurrent duplicate converges on uk_recipe_folder_item instead of throwing. */
    @Modifying
    @Query(value = "INSERT INTO recipe_folder_items (folder_id, recipe_id) VALUES (:folderId, :recipeId) " +
                   "ON DUPLICATE KEY UPDATE folder_id = folder_id", nativeQuery = true)
    void insertIfAbsent(@Param("folderId") Long folderId, @Param("recipeId") Long recipeId);

    @Modifying
    long deleteByFolderIdAndRecipeId(Long folderId, Long recipeId);
}
```

(Imports as in `UserHiddenRecipeRepository`, plus `java.util.Collection` and `java.util.Optional`.)

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 9: `RecipeFolderTree` pure rules (test first)

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFolderTree.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeFolderTreeTest.java`

- [ ] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.model.RecipeFolder;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class RecipeFolderTreeTest {
    private static RecipeFolder f(long id, Long parent, String name) {
        RecipeFolder x = new RecipeFolder(); x.setId(id); x.setParentId(parent); x.setName(name); return x;
    }
    // 1 Batch cook > 2 Freezer > 3 Soups ; 4 Date night
    private final List<RecipeFolder> all = List.of(f(1, null, "Batch cook"), f(2, 1L, "Freezer"), f(3, 2L, "Soups"), f(4, null, "Date night"));

    @Test void depth_topLevelIsOne_andCountsAncestors() {
        assertThat(RecipeFolderTree.depthOf(1L, all)).isEqualTo(1);
        assertThat(RecipeFolderTree.depthOf(3L, all)).isEqualTo(3);
    }
    @Test void height_leafIsOne() {
        assertThat(RecipeFolderTree.heightOf(3L, all)).isEqualTo(1);
        assertThat(RecipeFolderTree.heightOf(1L, all)).isEqualTo(3);
    }
    @Test void descendants_areAllBelow() {
        assertThat(RecipeFolderTree.descendantIds(1L, all)).containsExactlyInAnyOrder(2L, 3L);
    }
    @Test void siblingName_isCaseInsensitiveAndTrimmed_andIgnoresSelf() {
        assertThat(RecipeFolderTree.siblingNameTaken(null, "  date NIGHT ", null, all)).isTrue();
        assertThat(RecipeFolderTree.siblingNameTaken(null, "Date night", 4L, all)).isFalse();
        assertThat(RecipeFolderTree.siblingNameTaken(1L, "Date night", null, all)).isFalse();
    }
    @Test void cleanName_rejectsBlankAndTooLong() {
        assertThatThrownBy(() -> RecipeFolderTree.cleanName("   ")).isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Give the folder a name.");
        assertThatThrownBy(() -> RecipeFolderTree.cleanName("x".repeat(41))).hasMessage("Folder names can be up to 40 characters.");
        assertThat(RecipeFolderTree.cleanName("  Gym days ")).isEqualTo("Gym days");
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=RecipeFolderTreeTest`
Expected: compilation failure: `cannot find symbol ... RecipeFolderTree`.

- [ ] **Step 3: Implement**

```java
package com.foodbytes.service;

import com.foodbytes.model.RecipeFolder;
import java.util.*;

/** Pure rules for a user's folder tree (adjacency list). Depth: top level = 1. Height: leaf = 1. */
final class RecipeFolderTree {
    static final int MAX_DEPTH = 3;
    static final int MAX_FOLDERS = 100;
    static final int NAME_MAX = 40;

    private RecipeFolderTree() {}

    static int depthOf(Long id, List<RecipeFolder> all) {
        Map<Long, RecipeFolder> byId = index(all);
        int depth = 0;
        for (RecipeFolder f = byId.get(id); f != null && depth <= all.size(); f = byId.get(f.getParentId())) depth++;
        return depth;
    }

    static int heightOf(Long id, List<RecipeFolder> all) {
        return 1 + all.stream().filter(f -> id.equals(f.getParentId()))
            .mapToInt(c -> heightOf(c.getId(), all)).max().orElse(0);
    }

    static Set<Long> descendantIds(Long id, List<RecipeFolder> all) {
        Set<Long> out = new HashSet<>();
        Deque<Long> todo = new ArrayDeque<>(List.of(id));
        while (!todo.isEmpty()) {
            Long cur = todo.pop();
            for (RecipeFolder f : all) if (cur.equals(f.getParentId()) && out.add(f.getId())) todo.push(f.getId());
        }
        return out;
    }

    static boolean siblingNameTaken(Long parentId, String name, Long exceptId, List<RecipeFolder> all) {
        String wanted = name.trim();
        return all.stream().anyMatch(f -> Objects.equals(f.getParentId(), parentId)
            && !f.getId().equals(exceptId) && f.getName().equalsIgnoreCase(wanted));
    }

    static String cleanName(String raw) {
        String name = raw == null ? "" : raw.trim();
        if (name.isEmpty()) throw new IllegalArgumentException("Give the folder a name.");
        if (name.length() > NAME_MAX) throw new IllegalArgumentException("Folder names can be up to 40 characters.");
        return name;
    }

    private static Map<Long, RecipeFolder> index(List<RecipeFolder> all) {
        Map<Long, RecipeFolder> m = new HashMap<>();
        all.forEach(f -> m.put(f.getId(), f));
        return m;
    }
}
```

- [ ] **Step 4: Run it to pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=RecipeFolderTreeTest`
Expected: `BUILD SUCCESS`, 5 tests, 0 failures.

### Task 10: DTOs

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeFolderDTO.java`, `RecipeFoldersDTO.java`, `RecipeFolderCreateRequest.java`, `RecipeFolderNameRequest.java`, `RecipeFolderParentRequest.java`, `RecipeFolderItemDTO.java`

- [ ] **Step 1: Write the six DTOs**

All are `@Data @NoArgsConstructor @AllArgsConstructor` (Lombok, as `HiddenRecipesDTO`):
- `RecipeFolderDTO { Long id; String name; Long parentId; List<Long> recipeIds; }`
- `RecipeFoldersDTO { List<RecipeFolderDTO> folders; }`
- `RecipeFolderCreateRequest { @NotBlank(message = "Give the folder a name.") @Size(max = 40, message = "Folder names can be up to 40 characters.") String name; Long parentId; }`
- `RecipeFolderNameRequest { @NotBlank(message = "Give the folder a name.") @Size(max = 40, message = "Folder names can be up to 40 characters.") String name; }`
- `RecipeFolderParentRequest { Long parentId; }`
- `RecipeFolderItemDTO { Long recipeId; }`

Validation annotations from `jakarta.validation.constraints`.

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 11: `RecipeFolderService` (test first)

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFolderService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeFolderServiceTest.java`

- [ ] **Step 1: Write the failing tests**

`@ExtendWith(MockitoExtension.class)` with `@Mock RecipeFolderRepository folderRepository`, `@Mock RecipeFolderItemRepository itemRepository`, `@Mock RecipeKeyResolver recipeKeyResolver`, `@InjectMocks RecipeFolderService service`. Helper `folder(id, userId=5L, parentId, name)`. Cases (one `@Test` each):
1. `create_atDepthThree_isRejected`: user 5 owns 1 › 2 › 3; `create(5L, "X", 3L)` throws `IllegalArgumentException` with message `"Folders go up to 3 levels deep."`; `verify(folderRepository, never()).save(any())`.
2. `create_duplicateSiblingName_isRejectedCaseInsensitively`: existing top-level "Gym days"; `create(5L, "gym DAYS", null)` throws with message `There's already a folder called “gym DAYS” here.`
3. `create_overCap_isRejected`: `countByUserId(5L)` returns 100 → message `"You can have up to 100 folders."`.
4. `create_unknownParent_throwsNoSuchElement`: `findByUserId(5L)` returns no folder 9 → `NoSuchElementException`.
5. `move_intoOwnDescendant_isRejected`: 1 › 2; `move(5L, 1L, 2L)` throws `"A folder can't go inside itself."`.
6. `move_thatWouldExceedDepth_isRejected`: 1 › 2 (height 2) moving under 3 › 4 (depth 2) throws the depth message.
7. `move_foreignFolder_isEmpty`: `findByIdAndUserId(1L, 5L)` empty → `move(...)` returns `Optional.empty()`.
8. `delete_reparentsChildrenToGrandparent`: 1 › 2 › 3; `delete(5L, 2L)` saves folder 3 with `parentId == 1L`, then `verify(folderRepository).delete(folder2)`; returns true.
9. `delete_reparentClash_isRejected`: top-level "Soups" and 1 › "Soups"; `delete(5L, 1L)` throws a message containing `would clash`.
10. `addRecipe_storesFamilyKey`: `recipeKeyResolver.resolve(6L)` → `Optional.of(7L)`; owned folder 1; `addRecipe(5L, 1L, 6L)` returns `Optional.of(7L)` and `verify(itemRepository).insertIfAbsent(1L, 7L)`.
11. `addRecipe_unknownRecipe_isEmpty`: resolver empty → `Optional.empty()`, `insertIfAbsent` never called.
12. `listFolders_sortsByNameAndAttachesKeys`: two folders "b", "A" plus items → names `["A","b"]`, each with its `recipeIds`.

- [ ] **Step 2: Run to fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=RecipeFolderServiceTest`
Expected: compilation failure: `cannot find symbol ... RecipeFolderService`.

- [ ] **Step 3: Implement the service**

```java
package com.foodbytes.service;

import com.foodbytes.dto.RecipeFolderDTO;
import com.foodbytes.model.RecipeFolder;
import com.foodbytes.model.RecipeFolderItem;
import com.foodbytes.repository.RecipeFolderItemRepository;
import com.foodbytes.repository.RecipeFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.foodbytes.service.RecipeFolderTree.*;

/**
 * Personal recipe folders. Always the caller's own folders (never the shared meal-plan owner's).
 * Rule breaks throw IllegalArgumentException with a user-facing message (controller → 400);
 * unknown / foreign ids come back empty (controller → 404).
 */
@Service
@RequiredArgsConstructor
public class RecipeFolderService {
    private final RecipeFolderRepository folderRepository;
    private final RecipeFolderItemRepository itemRepository;
    private final RecipeKeyResolver recipeKeyResolver;

    @Transactional(readOnly = true)
    public List<RecipeFolderDTO> listFolders(Long userId) {
        List<RecipeFolder> folders = folderRepository.findByUserId(userId);
        Map<Long, List<Long>> keys = folders.isEmpty() ? Map.of()
            : itemRepository.findByFolderIdIn(folders.stream().map(RecipeFolder::getId).toList()).stream()
                .collect(Collectors.groupingBy(RecipeFolderItem::getFolderId,
                    Collectors.mapping(RecipeFolderItem::getRecipeId, Collectors.toList())));
        return folders.stream()
            .sorted(Comparator.comparing(RecipeFolder::getName, String.CASE_INSENSITIVE_ORDER))
            .map(f -> toDto(f, keys.getOrDefault(f.getId(), List.of())))
            .toList();
    }

    @Transactional
    public RecipeFolderDTO create(Long userId, String rawName, Long parentId) {
        String name = cleanName(rawName);
        List<RecipeFolder> all = folderRepository.findByUserId(userId);
        if (folderRepository.countByUserId(userId) >= MAX_FOLDERS)
            throw new IllegalArgumentException("You can have up to 100 folders.");
        if (parentId != null) {
            if (all.stream().noneMatch(f -> f.getId().equals(parentId))) throw new NoSuchElementException("Folder not found");
            if (depthOf(parentId, all) + 1 > MAX_DEPTH) throw new IllegalArgumentException("Folders go up to 3 levels deep.");
        }
        if (siblingNameTaken(parentId, name, null, all)) throw duplicate(name);
        RecipeFolder saved = folderRepository.save(new RecipeFolder(null, userId, parentId, name, null));
        return toDto(saved, List.of());
    }

    @Transactional
    public Optional<RecipeFolderDTO> rename(Long userId, Long folderId, String rawName) {
        String name = cleanName(rawName);
        return folderRepository.findByIdAndUserId(folderId, userId).map(f -> {
            if (siblingNameTaken(f.getParentId(), name, f.getId(), folderRepository.findByUserId(userId))) throw duplicate(name);
            f.setName(name);
            return toDto(folderRepository.save(f), keysOf(f.getId()));
        });
    }

    @Transactional
    public Optional<RecipeFolderDTO> move(Long userId, Long folderId, Long newParentId) {
        return folderRepository.findByIdAndUserId(folderId, userId).map(f -> {
            List<RecipeFolder> all = folderRepository.findByUserId(userId);
            if (newParentId != null) {
                if (all.stream().noneMatch(x -> x.getId().equals(newParentId))) throw new NoSuchElementException("Folder not found");
                if (newParentId.equals(f.getId()) || descendantIds(f.getId(), all).contains(newParentId))
                    throw new IllegalArgumentException("A folder can't go inside itself.");
                if (depthOf(newParentId, all) + heightOf(f.getId(), all) > MAX_DEPTH)
                    throw new IllegalArgumentException("Folders go up to 3 levels deep.");
            }
            if (siblingNameTaken(newParentId, f.getName(), f.getId(), all)) throw duplicate(f.getName());
            f.setParentId(newParentId);
            return toDto(folderRepository.save(f), keysOf(f.getId()));
        });
    }

    @Transactional
    public boolean delete(Long userId, Long folderId) {
        Optional<RecipeFolder> found = folderRepository.findByIdAndUserId(folderId, userId);
        if (found.isEmpty()) return false;
        RecipeFolder folder = found.get();
        List<RecipeFolder> all = folderRepository.findByUserId(userId);
        List<RecipeFolder> children = all.stream().filter(c -> folder.getId().equals(c.getParentId())).toList();
        for (RecipeFolder child : children) {
            if (siblingNameTaken(folder.getParentId(), child.getName(), folder.getId(), all)) {
                String where = all.stream().filter(p -> p.getId().equals(folder.getParentId())).findFirst()
                    .map(p -> "“" + p.getName() + "”").orElse("the top level");
                throw new IllegalArgumentException("Can't delete: “" + child.getName()
                    + "” would clash with a folder of the same name in " + where + ".");
            }
        }
        children.forEach(c -> { c.setParentId(folder.getParentId()); folderRepository.save(c); });
        folderRepository.delete(folder);
        return true;
    }

    @Transactional
    public Optional<Long> addRecipe(Long userId, Long folderId, Long recipeId) {
        if (folderRepository.findByIdAndUserId(folderId, userId).isEmpty()) return Optional.empty();
        return recipeKeyResolver.resolve(recipeId).map(key -> { itemRepository.insertIfAbsent(folderId, key); return key; });
    }

    @Transactional
    public boolean removeRecipe(Long userId, Long folderId, Long recipeId) {
        if (folderRepository.findByIdAndUserId(folderId, userId).isEmpty()) return false;
        recipeKeyResolver.resolve(recipeId).ifPresent(key -> itemRepository.deleteByFolderIdAndRecipeId(folderId, key));
        return true;
    }

    private List<Long> keysOf(Long folderId) {
        return itemRepository.findByFolderIdIn(List.of(folderId)).stream().map(RecipeFolderItem::getRecipeId).toList();
    }

    private static RecipeFolderDTO toDto(RecipeFolder f, List<Long> recipeIds) {
        return new RecipeFolderDTO(f.getId(), f.getName(), f.getParentId(), recipeIds);
    }

    private static IllegalArgumentException duplicate(String name) {
        return new IllegalArgumentException("There's already a folder called “" + name.trim() + "” here.");
    }
}
```

In `delete`, the sibling check ignores the folder being deleted (`exceptId = folder.getId()`) because it leaves the parent's child list. A child whose name matches the deleted folder's own name is therefore not a clash.

- [ ] **Step 4: Run to pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=RecipeFolderServiceTest`
Expected: `BUILD SUCCESS`, 12 tests, 0 failures.

### Task 12: `RecipeFolderController`

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeFolderController.java`

- [ ] **Step 1: Write the thin controller**

```java
/** Personal recipe folders for the Recipes screen. The caller's own folders, never the shared plan owner's. */
@RestController
@RequestMapping("/api/recipe-folders")
@RequiredArgsConstructor
public class RecipeFolderController {
    private final RecipeFolderService recipeFolderService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) return forbidden();
        return ResponseEntity.ok(new RecipeFoldersDTO(recipeFolderService.listFolders(user.getId())));
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody RecipeFolderCreateRequest req) {
        if (user == null) return forbidden();
        return ResponseEntity.status(201).body(recipeFolderService.create(user.getId(), req.getName(), req.getParentId()));
    }

    @PatchMapping("/{id}/name")
    public ResponseEntity<?> rename(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @Valid @RequestBody RecipeFolderNameRequest req) {
        if (user == null) return forbidden();
        return recipeFolderService.rename(user.getId(), id, req.getName())
            .<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/parent")
    public ResponseEntity<?> move(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @RequestBody RecipeFolderParentRequest req) {
        if (user == null) return forbidden();
        return recipeFolderService.move(user.getId(), id, req.getParentId())
            .<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        if (user == null) return forbidden();
        return recipeFolderService.delete(user.getId(), id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/recipes/{recipeId}")
    public ResponseEntity<?> addRecipe(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @PathVariable Long recipeId) {
        if (user == null) return forbidden();
        return recipeFolderService.addRecipe(user.getId(), id, recipeId)
            .<ResponseEntity<?>>map(key -> ResponseEntity.ok(new RecipeFolderItemDTO(key)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/recipes/{recipeId}")
    public ResponseEntity<?> removeRecipe(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @PathVariable Long recipeId) {
        if (user == null) return forbidden();
        return recipeFolderService.removeRecipe(user.getId(), id, recipeId) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleRule(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleMissing(NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", "That folder no longer exists."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().findFirst()
            .map(err -> err.getDefaultMessage()).orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("error", "Authentication required to manage recipe folders"));
    }
}
```

Imports follow `HiddenRecipeController` and `PetDecorController` (`jakarta.validation.Valid`, `MethodArgumentNotValidException`, `java.util.Map`, `java.util.NoSuchElementException`). No `SecurityConfig` change: `/api/**` falls through to `authenticated()`, as `/api/hidden-recipes` does.

- [ ] **Step 2: Compile and run the folder tests together**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile; mvn test -Dtest="RecipeFolder*Test,HiddenRecipeServiceTest"`
Expected: `BUILD SUCCESS`, 0 failures.

- [ ] **Step 3: Grep the controller for repository use**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\RecipeFolderController.java -Pattern "Repository"`
Expected: zero hits.

---

## Phase 4 — Frontend data layer

Adds constants, pure helpers, the service, and hooks. Nothing renders them yet, so the app is unchanged and the build stays green.

### Task 13: Constants

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/recipeFolders.js`

- [ ] **Step 1: Write the constants**

```js
/** Custom recipe folders. Limits mirror RecipeFolderTree on the backend. */
export const FOLDER_MAX_DEPTH = 3
export const FOLDER_NAME_MAX = 40
export const RECIPE_VIEW_STORAGE_KEY = 'fb.recipes.view'
export const RECIPE_VIEWS = { MENU: 'menu', FOLDERS: 'folders' }
/** dataTransfer type for dragging a recipe card onto a folder (desktop). */
export const FOLDER_DRAG_TYPE = 'application/x-fb-recipe'
/** Fine pointer + hover: where drag-and-drop filing is offered. */
export const FOLDER_DRAG_MEDIA = '(hover: hover) and (pointer: fine)'
export const FOLDER_LOAD_ERROR = "Couldn't load your folders."
export const FOLDER_SAVE_ERROR = "Couldn't update your folders. Please try again."
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 14: Pure tree helpers

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/recipeFolderTree.js`

- [ ] **Step 1: Write the helpers**

```js
import { FOLDER_MAX_DEPTH } from '../constants/recipeFolders.js'

/** Pure helpers over the flat folder list from GET /api/recipe-folders: {id, name, parentId, recipeIds}. */
const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

export const folderById = (folders, id) => folders.find((f) => f.id === id) || null
export const childrenOf = (folders, parentId) => folders.filter((f) => (f.parentId ?? null) === (parentId ?? null)).sort(byName)

export function pathOf(folders, id) {
  const path = []
  for (let f = folderById(folders, id); f && path.length <= folders.length; f = folderById(folders, f.parentId)) path.unshift(f)
  return path
}
export const depthOf = (folders, id) => (id == null ? 0 : pathOf(folders, id).length)
export const heightOf = (folders, id) => 1 + Math.max(0, ...childrenOf(folders, id).map((c) => heightOf(folders, c.id)))
export const descendantIdsOf = (folders, id) => childrenOf(folders, id).flatMap((c) => [c.id, ...descendantIdsOf(folders, c.id)])

export const canCreateIn = (folders, parentId) => depthOf(folders, parentId) + 1 <= FOLDER_MAX_DEPTH
export function canMoveTo(folders, id, targetParentId) {
  if (targetParentId == null) return true
  if (targetParentId === id || descendantIdsOf(folders, id).includes(targetParentId)) return false
  return depthOf(folders, targetParentId) + heightOf(folders, id) <= FOLDER_MAX_DEPTH
}

/** Map<recipeKey, Set<folderId>>: build once per folders change, then O(1) per card. */
export function folderIndex(folders) {
  const idx = new Map()
  folders.forEach((f) => f.recipeIds.forEach((k) => { if (!idx.has(k)) idx.set(k, new Set()); idx.get(k).add(f.id) }))
  return idx
}
export const visibleCount = (folder, isHiddenKey) => folder.recipeIds.filter((k) => !isHiddenKey(k)).length
```

- [ ] **Step 2: Smoke-test the rules with node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {depthOf,heightOf,canMoveTo,canCreateIn,childrenOf} from './src/utils/recipeFolderTree.js'; const F=[{id:1,name:'b',parentId:null,recipeIds:[]},{id:2,name:'x',parentId:1,recipeIds:[]},{id:3,name:'y',parentId:2,recipeIds:[]},{id:4,name:'A',parentId:null,recipeIds:[]}]; console.log(depthOf(F,3),heightOf(F,1),canMoveTo(F,1,3),canMoveTo(F,4,2),canCreateIn(F,3),childrenOf(F,null).map(f=>f.name).join(','))"`
Expected: `3 3 false true false A,b`

### Task 15: Service module

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/services/recipeFolderService.js`

- [ ] **Step 1: Write it**

```js
import api from './api'

/** Personal recipe folders. All calls require a signed-in user. Errors carry the server's {error} message. */
export const recipeFolderService = {
  /** @returns {Promise<Array<{id:number,name:string,parentId:number|null,recipeIds:number[]}>>} */
  async list() { return (await api.get('/recipe-folders')).data.folders },
  async create(name, parentId) { return (await api.post('/recipe-folders', { name, parentId: parentId ?? null })).data },
  async rename(id, name) { return (await api.patch(`/recipe-folders/${id}/name`, { name })).data },
  async move(id, parentId) { return (await api.patch(`/recipe-folders/${id}/parent`, { parentId: parentId ?? null })).data },
  async remove(id) { await api.delete(`/recipe-folders/${id}`) },
  /** @returns {Promise<number>} the family key the server stored */
  async addRecipe(id, recipeId) { return (await api.put(`/recipe-folders/${id}/recipes/${recipeId}`)).data.recipeId },
  async removeRecipe(id, recipeId) { await api.delete(`/recipe-folders/${id}/recipes/${recipeId}`) },
}

export default recipeFolderService
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 16: `useRecipeFolders`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useRecipeFolders.js`

- [ ] **Step 1: Write the hook, modelled on `useHiddenRecipes`**

Shape and behaviour (all in one file, ≤200 lines):
- State: `folders` (array, `[]`), `loading` (`isAuthenticated`), `loadFailed` (false); `useToast()` for `{ toast, showToast, dismissToast }`; `queue` ref (`Promise.resolve()`) for ordered membership writes; `lastRemoved` ref `{ folderId, recipe }`; `loadSeq` ref to ignore stale loads.
- `load` (`useCallback` on `isAuthenticated`): if not signed in → `setFolders([])`, `setLoading(false)`; else `setLoading(true)`, `const seq = ++loadSeq.current`, `try { const list = await recipeFolderService.list(); if (seq === loadSeq.current) { setFolders(list); setLoadFailed(false) } } catch { if (seq === loadSeq.current) setLoadFailed(true) } finally { if (seq === loadSeq.current) setLoading(false) }`. `useEffect(() => { load() }, [load])`.
- `messageOf(err)` = `err.response?.data?.error || FOLDER_SAVE_ERROR`.
- Structural (pessimistic), each returning `{ ok: true, folder? }` or `{ ok: false, error }` and reloading on any 404 or 400:
  - `create(name, parentId)` → append the returned DTO.
  - `rename(id, name)` → replace by id.
  - `move(id, parentId)` → replace by id.
  - `removeFolder(id)` → `setFolders(prev => prev.filter(f => f.id !== id).map(f => f.parentId === id ? { ...f, parentId: deleted.parentId } : f))`.
- Membership (optimistic, through `enqueue`):
  - `addRecipe(folderId, recipe)`: key = `hideKeyOf(recipe)`. Add the key to that folder's `recipeIds` if absent. `show('Added to <name>', false)`. On error, roll back and `show(messageOf(err), false)`.
  - `removeRecipe(folderId, recipe, { silent })`: remove the key; unless silent, `lastRemoved.current = { folderId, recipe }` and `show('Removed from <name>', true)`. On error, roll back and show the message.
  - `toggleRecipe(folderId, recipe)`: add or remove (silent remove, no Undo, used by the tick lists).
- `undo()`: re-adds `lastRemoved.current` via `addRecipe` with no toast, then `dismissToast()`.
- Return `{ folders, loading, loadFailed, retry: load, canEdit: isAuthenticated && !loading && !loadFailed, create, rename, move, removeFolder, addRecipe, removeRecipe, toggleRecipe, undo, toast, dismissToast }`.
- Toast timings reuse `UNDO_REMOVE_MS` / `INFO_TOAST_MS` from `constants/mealPlanUi`.

- [ ] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\hooks\useRecipeFolders.js | Measure-Object -Line).Lines`
Expected: `built in`, and a line count under 200.

### Task 17: `useRecipeView` and `useRecipeFolderScope`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useRecipeView.js`
- Create: `foodbytes-app/client/src/hooks/useRecipeFolderScope.js`

- [ ] **Step 1: Write `useRecipeView`**

```js
import { useState } from 'react'
import { RECIPE_VIEWS, RECIPE_VIEW_STORAGE_KEY } from '../constants/recipeFolders'

const read = () => {
  try { return localStorage.getItem(RECIPE_VIEW_STORAGE_KEY) === RECIPE_VIEWS.FOLDERS ? RECIPE_VIEWS.FOLDERS : RECIPE_VIEWS.MENU }
  catch { return RECIPE_VIEWS.MENU }
}

/** Menu / Folders switch for the Recipes page, remembered per device (like the theme). */
export default function useRecipeView() {
  const [view, setViewState] = useState(read)
  const setView = (next) => {
    setViewState(next)
    try { localStorage.setItem(RECIPE_VIEW_STORAGE_KEY, next) } catch { /* private mode: the choice lasts this visit */ }
  }
  return { view, setView }
}
```

- [ ] **Step 2: Write `useRecipeFolderScope`**

Inputs `{ inFolders, folderId, folders, recipesByMeal, isHidden }`; returns `{ inScope(recipe), counts, unfiledCount }`:
- `idx = folderIndex(folders)`.
- `inScope(r)`:
  - Menu view: `true`.
  - Inside a folder: `folderById(folders, folderId)?.recipeIds.includes(hideKeyOf(r))`.
  - Folders top level: `!idx.has(hideKeyOf(r))`.
- `counts`: per meal key, recipes that are `inScope` and not hidden (the same shape `RecipeToolbar` takes today).
- `unfiledCount`: distinct `hideKeyOf` across all meals that are not hidden and not in `idx`.
- No `useMemo` (no profiling evidence; the lists are small).

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

---

## Phase 5 — Frontend UI (Default look)

Builds every folder component against new tokens whose Default values point at existing Default tokens, then wires them into the Recipes page. At the end of the phase the feature works end-to-end in Default; Cyberpunk and Parchment inherit Default token values until Phase 6, which is functional but unthemed. That is acceptable at this boundary because nothing is deployed between phases.

### Task 18: Folder tokens in `default.css`

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/default.css` (Recipes area, after `--macro-chip-solid-bg`, ~line 140)

- [ ] **Step 1: Add the tokens (Default values reuse existing Default tokens only)**

```css
  /* Recipes: custom folders + Menu/Folders switch (2026-11-16). Default reuses existing tokens: no new colours. */
  --folder-icon: var(--brand-primary);
  --folder-row-text: var(--text-primary);
  --folder-row-active-bg: var(--surface-tint-brand);
  --folder-row-active-border: var(--brand-primary);
  --folder-row-active-text: var(--brand-primary);
  --folder-count-text: var(--text-secondary);
  --folder-tile-bg: var(--bg-primary);
  --folder-tile-border: var(--border-color);
  --folder-tile-accent: var(--brand-primary);
  --folder-tile-text: var(--text-primary);
  --folder-tile-sub: var(--text-secondary);
  --folder-drop-border: var(--success-hover);
  --folder-chip-bg: var(--surface-tint-faint);
  --folder-chip-text: var(--text-secondary);
  --folder-crumb-text: var(--brand-primary);
  --view-toggle-bg: var(--bg-primary);
  --view-toggle-text: var(--text-secondary);
  --view-toggle-on-bg: var(--brand-primary);
  --view-toggle-on-text: var(--on-brand);
  --folder-check-on-bg: var(--brand-primary);
  --folder-check-on-text: var(--on-brand);
```

Before saving, confirm each referenced token exists in `default.css` (`Select-String -Path src\styles\themes\default.css -Pattern "--surface-tint-brand:|--border-color:|--surface-tint-faint:|--on-brand:|--success-hover:|--text-secondary:|--bg-primary:"` → 7 hits). If one is missing, use the token `RecipeToolbar.css` uses for the same role.

- [ ] **Step 2: Theme check stays green**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the one known WARN, then `Themes OK: 3 themes, 81 contrast pairs`.

### Task 19: Folder glyph in each icon set + `FolderIcon`

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pixelIcons.js` (add `folder` to `PIXEL_ICONS`)
- Modify: `foodbytes-app/client/src/constants/engravedIcons.js` (add `folder` to `ENGRAVED_ICONS`)
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderIcon.jsx`

- [ ] **Step 1: Add the pixel grid (verbatim from `app-mockup.html` `ICO.folder`)**

```js
  folder: {
    rows: [
      '#####..........',
      '#...#########..',
      '#############.#',
      '#aaaaaaaaaaaa##',
      '#aaaaaaaaaaaa##',
      '#aaaaaaaaaaaa##',
      '#aaaaaaaaaaaa##',
      '#aaaaaaaaaaaa#.',
      '##############.',
    ],
    accents: { a: 'var(--deep)' },
  },
```

- [ ] **Step 2: Add the engraved glyph (paths from the approved Parchment mockup, Task 2)**

```js
  folder: ['M3 6.5a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z', 'M3 10h18M6 13.5h5'],
```

If the Parchment mockup's glyph differs, use the mockup's paths instead.

- [ ] **Step 3: Write `FolderIcon`**

```jsx
import { useTheme } from '../../../contexts/ThemeContext'
import PixelIcon from '../../common/PixelIcon'
import EngravedIcon from '../../common/EngravedIcon'

const LINE = (size) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)

// One renderer per icon set (as AppNavItems); anything else gets the Default line icon.
const RENDERERS = {
  pixel: (size) => <PixelIcon name="folder" size={size} />,
  engraved: (size) => <EngravedIcon name="folder" size={size} />,
}

/** Folder glyph in the active theme's icon set. Decorative: callers carry the accessible name. */
function FolderIcon({ size = 18 }) {
  const { theme } = useTheme()
  return <span className="folder-icon" aria-hidden="true">{(RENDERERS[theme.iconSet] || LINE)(size)}</span>
}

export default FolderIcon
```

- [ ] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 20: `RecipeViewToggle`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/folders/RecipeViewToggle.jsx`

- [ ] **Step 1: Write the radiogroup**

```jsx
import FolderIcon from './FolderIcon'
import { RECIPE_VIEWS } from '../../../constants/recipeFolders'

/** ☰ Menu / Folders switch. Menu = the original page; Folders = the folder browser. */
function RecipeViewToggle({ view, onChange }) {
  const opt = (value, label, icon) => (
    <button type="button" role="radio" aria-checked={view === value}
      className={`view-toggle-btn ${view === value ? 'on' : ''}`} onClick={() => onChange(value)}>
      {icon}{label}
    </button>
  )
  return (
    <div className="view-toggle" role="radiogroup" aria-label="Recipe view">
      {opt(RECIPE_VIEWS.MENU, 'Menu', <span aria-hidden="true">☰</span>)}
      {opt(RECIPE_VIEWS.FOLDERS, 'Folders', <FolderIcon size={16} />)}
    </div>
  )
}

export default RecipeViewToggle
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 21: `FolderTree` (nav + pick modes) and `FolderActionsMenu`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderTree.jsx`
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderActionsMenu.jsx`

- [ ] **Step 1: Write `FolderActionsMenu`**

Copy `RecipeCardMenu`'s open/close mechanics (outside mousedown/touchstart, Escape, document listeners removed in cleanup). Props: `{ folder, canAddSubfolder, isCurrent, onOpen, onAddRecipes, onNewSubfolder, onRename, onMove, onDelete }`. The trigger is `⋯` with `aria-label={\`Folder actions for ${folder.name}\`}`, `aria-haspopup="menu"`, `aria-expanded`. The menu items are:
- When `isCurrent`: `＋ Add recipes…`; otherwise `📂 Open`.
- `＋ New subfolder`, `disabled={!canAddSubfolder}` with the visible suffix `(max depth)` when disabled.
- `✎ Rename`.
- `↳ Move to…`.
- `🗑 Delete folder`, class `danger`.

- [ ] **Step 2: Write `FolderTree`**

Props: `{ mode, folders, currentId, openIds, onToggleOpen, onOpenFolder, isHiddenKey, pickedKey, onTogglePick, renderActions, dropProps }`.
- Renders `<div className="folder-tree">`.
- In `mode === 'nav'`, the first row is "All folders" (`☰`) with `aria-current={currentId == null}` and the unfiled count passed as `rootCount`.
- Each folder row is `<div className={\`folder-row ${on ? 'on' : ''}\`} style={{ '--d': depth }} {...dropProps?.(f.id)}>` containing:
  - A disclosure button (`aria-expanded`, `aria-label="Expand|Collapse <name>"`, hidden when there are no children or in pick mode).
  - In nav mode, a name button (`onOpenFolder(f.id)`, `aria-current`) with `<FolderIcon/>`, the name and `visibleCount(f, isHiddenKey)`, then `renderActions?.(f)`.
  - In pick mode, a `role="checkbox"` button with `aria-checked={f.recipeIds.includes(pickedKey)}`, a check box span, `<FolderIcon/>`, name and count, calling `onTogglePick(f.id)`.
- Children recurse via `childrenOf`. In pick mode every level is open; in nav mode a level is open when `openIds.has(id)`.

- [ ] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\folders\FolderTree.jsx | Measure-Object -Line).Lines`
Expected: `built in`; under 200 lines.

### Task 22: `FolderSidebar`, `FolderBar`, `FolderHeader`, `FolderRoot`, `FolderChips`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderSidebar.jsx`
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderBar.jsx`
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderHeader.jsx`
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderRoot.jsx`
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderChips.jsx`

- [ ] **Step 1: Write the five components**

- `FolderSidebar` `{ treeProps, canDrag, onNewFolder }`: `<aside className="folder-sidebar" aria-label="Recipe folders">`, a header `<FolderIcon/> My folders` with `<small>drag a card onto one</small>` only when `canDrag`, then `<FolderTree mode="nav" {...treeProps}/>`, then `<button className="folder-new-btn" onClick={onNewFolder}>＋ New folder</button>`.
- `FolderBar` `{ folders, currentId, onOpenSheet }`: one button (`aria-haspopup="dialog"`, `className="folder-bar"`) showing `<FolderIcon/>` and either `pathOf(...).map(f => f.name).join(' › ')` or `All folders`, plus a trailing `Folders ▾` label.
- `FolderHeader` `{ folders, folderId, isHiddenKey, canDrag, dropProps, onOpenFolder, actions, onAddRecipes, isMobile }`:
  - A `<nav className="folder-crumbs" aria-label="Folder path">`: an "All folders" button, then ancestor buttons separated by `›`.
  - `<h2 className="folder-title"><FolderIcon size={22}/>{name}</h2>`.
  - A meta line: `N recipe(s) · M subfolder(s)`.
  - Desktop only, a `＋ Add recipes` button; then `actions` (the `FolderActionsMenu`).
  - A `folder-tiles` grid of subfolder tiles (`<button className="folder-tile" onClick={() => onOpenFolder(id)} {...dropProps(id)}>` with name and `N RECIPES · M FOLDERS`), plus a `＋ New subfolder` tile when `canCreateIn(folders, folderId)`.
- `FolderRoot` `{ folders, isHiddenKey, unfiledCount, dropProps, onOpenFolder, onNewFolder, canDrag }`:
  - Section label `Your folders` with a count, then top-level tiles and a `＋ New folder` tile.
  - Section label `Not in a folder yet` with `<small>{unfiledCount} recipes · file them from ⋯{canDrag ? ' or drag onto a folder' : ''}</small>`.
- `FolderChips` `{ folders, recipeKey, excludeId, onOpenFolder }`: up to 3 `<button className="folder-chip">` (FolderIcon + name) for folders containing the key, minus `excludeId`, plus a `+N` span. Renders nothing when empty.

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 23: `FolderDialogs`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/folders/FolderDialogs.jsx`

- [ ] **Step 1: Write one component that switches on `dialog.type`**

Props: `{ dialog, setDialog, foldersApi, recipesByMeal, isHiddenKey, onOpenFolder, treeProps }`. Every dialog renders inside `<MealPlanSheet title={…} onClose={() => setDialog(null)}>`. Local state: `name`, `error`, `busy`, `query`.

| `type` | Title | Body | Primary action |
|---|---|---|---|
| `sheet` | Folders | `<FolderTree mode="nav" {...treeProps}/>` + `＋ New folder` | Opening a folder closes the sheet |
| `new` | New folder / New subfolder | "Inside **path**." or "At the top level."; "**Recipe** goes straight in." when `dialog.recipe`; labelled `<input maxLength={FOLDER_NAME_MAX} autoFocus>`; `error` in `role="alert"` | `Create folder`: `const r = await foldersApi.create(name, dialog.parentId)`. On `ok`, if `dialog.recipe` then `foldersApi.addRecipe(r.folder.id, dialog.recipe)` and return to `dialog.back` (the addTo dialog); otherwise open the new folder. On failure, show `r.error`. Enter submits. |
| `rename` | Rename folder | Input prefilled with the name | `Save` → `foldersApi.rename` |
| `move` | Move “name” | "Its recipes and subfolders come with it. Folders go up to 3 levels deep."; a `Top level` option, then every folder indented by depth; disabled when `!canMoveTo` or it is the current parent; small reason `current` / `too deep` | Clicking an option calls `foldersApi.move` and closes on `ok` |
| `delete` | Delete “name”? | "Only the folder goes. **No recipes are deleted**… This can't be undone."; recipe and subfolder counts; "Its subfolders move up to <parent / the top level>." when it has children | `Delete folder` → `foldersApi.removeFolder`; if it was the open folder, open its parent |
| `addTo` | Add to folder | "**Recipe** can sit in as many folders as you like. In N now."; `<FolderTree mode="pick" pickedKey={hideKeyOf(dialog.recipe)} onTogglePick={(id) => foldersApi.toggleRecipe(id, dialog.recipe)}/>`; `＋ New folder…` opening `new` with `recipe` and `back` | `Done` |
| `addRecipes` | Add to name | Search input; recipes from every meal (not hidden) grouped under meal labels (`RECIPE_TAB_LABELS`), each a `role="checkbox"` row toggling via `foldersApi.toggleRecipe(dialog.folderId, recipe)` | `Done` |

While `busy`, disable the primary button. Never close on a failed save.

- [ ] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\folders\FolderDialogs.jsx | Measure-Object -Line).Lines`
Expected: `built in`; under 400 lines. If it is over 300, move the `addRecipes` body into `FolderAddRecipesList.jsx` in the same folder.

### Task 24: Card menu, folder chips and drag source

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCardMenu.jsx` (props + two items)
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.jsx` (props, `<article>`, chips row)

- [ ] **Step 1: Add the menu items**

New props `canFile`, `removeFromLabel`, `onAddToFolder`, `onRemoveFromFolder`. After `View recipe`:

```jsx
          {canFile && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onAddToFolder)}>📁 Add to folder…</button>
            </li>
          )}
          {removeFromLabel && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onRemoveFromFolder)}>↩ Remove from {removeFromLabel}</button>
            </li>
          )}
```

- [ ] **Step 2: Wire the card**

New optional prop `folderUi` (undefined in signed-out / guest use) = `{ canFile, showChips, folders, currentFolderId, currentFolderName, inCurrent, draggable, onAddToFolder, onRemoveFromFolder, onOpenFolder }`.
- Pass the menu props through. `removeFromLabel` = `folderUi?.inCurrent ? folderUi.currentFolderName : null`.
- When `folderUi?.draggable && !isHidden`, add `draggable` and an `onDragStart` to `<article>` that sets `e.dataTransfer.setData(FOLDER_DRAG_TYPE, String(hideKeyOf(recipe)))`, sets `effectAllowed = 'copy'` and adds class `is-dragging` (removed `onDragEnd`).
- After `.recipe-card-top`, render `{folderUi?.showChips && <FolderChips folders={folderUi.folders} recipeKey={hideKeyOf(recipe)} excludeId={folderUi.currentFolderId} onOpenFolder={folderUi.onOpenFolder}/>}`.

- [ ] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\RecipeCard.jsx | Measure-Object -Line).Lines`
Expected: `built in`; under 200 lines.

### Task 25: Toolbar slot

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeToolbar.jsx` (props, placeholder, slot)

- [ ] **Step 1: Add `folderBar` and `searchPlaceholder` props**

Render `{folderBar}` as the first child of `.recipe-toolbar` (it is `null` except on mobile Folders view). Use `placeholder={searchPlaceholder ?? \`Search ${RECIPE_TAB_LABELS[activeMeal].toLowerCase()} recipes\`}` so Menu view's text is unchanged.

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`, no errors.

### Task 26: Wire the Recipes page

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeList.jsx` (state, scope, layout, dialogs, drop handling)

- [ ] **Step 1: Add view, folder state and scope**

```jsx
  const { view, setView } = useRecipeView()
  const foldersApi = useRecipeFolders({ isAuthenticated })
  const inFolders = isAuthenticated && view === RECIPE_VIEWS.FOLDERS
  const [folderId, setFolderId] = useState(null)
  const [openIds, setOpenIds] = useState(() => new Set())
  const [dialog, setDialog] = useState(null)
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const canDrag = useMediaQuery(FOLDER_DRAG_MEDIA) && inFolders && !isMobile
  const isHiddenKey = (k) => hidden.hiddenKeys.has(k)
  const scope = useRecipeFolderScope({ inFolders, folderId, folders: foldersApi.folders, recipesByMeal, isHidden: hidden.isHidden })
```

Change `visible` to add `.filter(scope.inScope)` and use `scope.counts` for `RecipeToolbar` `counts`.

- [ ] **Step 2: Folder navigation**

```jsx
  const openFolder = (id) => {
    setView(RECIPE_VIEWS.FOLDERS)
    setFolderId(id ?? null)
    setQuery('')
    setShowHidden(false)
    if (id != null) setOpenIds((prev) => new Set([...prev, ...pathOf(foldersApi.folders, id).map((f) => f.id)]))
  }
```

After opening a folder, if the active tab has no in-scope recipe, switch `setActiveMeal` to the first tab in `RECIPE_MEAL_TABS` with `scope.counts[k] > 0`. Do this in an effect keyed on `folderId`, guarded so it runs only after the folders have loaded. If `folderId` no longer exists in `foldersApi.folders` (deleted elsewhere), reset it to `null`.

- [ ] **Step 3: Drop handling (desktop)**

```jsx
  const dropProps = (targetId) => (canDrag ? {
    onDragOver: (e) => { if (e.dataTransfer.types.includes(FOLDER_DRAG_TYPE)) { e.preventDefault(); e.currentTarget.classList.add('is-drop') } },
    onDragLeave: (e) => e.currentTarget.classList.remove('is-drop'),
    onDrop: (e) => {
      e.preventDefault(); e.currentTarget.classList.remove('is-drop')
      const key = Number(e.dataTransfer.getData(FOLDER_DRAG_TYPE))
      const recipe = Object.values(recipesByMeal).flat().find((r) => hideKeyOf(r) === key)
      if (recipe) foldersApi.addRecipe(targetId, recipe)
    },
  } : {})
```

- [ ] **Step 4: Render**

- Header: render `<RecipeViewToggle view={view} onChange={(v) => { setView(v); setFolderId(null) }}/>` inside the page heading row when `isAuthenticated`. When there is no themed heading, render it right-aligned above the toolbar.
- Wrap the toolbar + content in `<div className={inFolders && !isMobile ? 'recipe-folder-layout' : undefined}>`. In that layout, put `<FolderSidebar …/>` first and the rest in `<div className="recipe-folder-main">`.
- On mobile in Folders view, pass `folderBar={<FolderBar … onOpenSheet={() => setDialog({ type: 'sheet' })}/>}` to the toolbar.
- `searchPlaceholder`: `Search in ${folder.name}` inside a folder; `Search unfiled ${meal}` at the Folders top level; otherwise undefined.
- Below the toolbar: `foldersApi.loadFailed && inFolders` → a `recipe-notice` "Couldn't load your folders." with Retry (same markup as the hidden notice). Then either `<FolderHeader …/>` (inside a folder) or `<FolderRoot …/>` (Folders top level).
- `WeekSlotStrip` condition becomes `!showHidden && isAuthenticated && !inFolders`.
- Pass `folderUi` to each `RecipeCard`: `canFile: foldersApi.canEdit`, `showChips: inFolders`, `inCurrent` from the current folder's `recipeIds`, `draggable: canDrag`. Wire `onAddToFolder` to `setDialog({ type: 'addTo', recipe })`, `onRemoveFromFolder` to `foldersApi.removeRecipe(folderId, recipe)`, and `onOpenFolder: openFolder`.
- Empty states:
  - Inside a folder with nothing in this tab: "No <meal> recipes in <folder>." plus buttons for tabs that do have some ("It has 2 dinner, 1 breakfast"), and "Use ⋯ → Add to folder on any recipe."
  - Folders top level with nothing unfiled in this tab: "Every <meal> recipe is in a folder ✓".
- Render `<FolderDialogs …/>` when `dialog`, and `<UndoToast toast={foldersApi.toast} onUndo={foldersApi.undo}/>` next to the existing hidden-recipes toast.

- [ ] **Step 5: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\RecipeList.jsx | Measure-Object -Line).Lines`
Expected: `built in`; under 400 lines. If it is 300 or more, move Steps 2–3 into `hooks/useFolderNavigation.js` (returning `{ folderId, openIds, openFolder, toggleOpen, dropProps }`) in the same change.

### Task 27: Folder CSS (theme-agnostic, tokens only)

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/folders/RecipeFolders.css` (imported from `FolderSidebar.jsx`, `FolderHeader.jsx`, `FolderRoot.jsx`, `RecipeViewToggle.jsx`, `FolderDialogs.jsx`, `FolderChips.jsx`)

- [ ] **Step 1: Write the CSS, mobile first**

Classes:
- `.view-toggle`, `.view-toggle-btn(.on)`
- `.recipe-folder-layout` (`@media (min-width: 768px)`: grid `250px minmax(0,1fr)`, gap 20px)
- `.recipe-folder-main`
- `.folder-sidebar` (sticky top 0)
- `.folder-tree`
- `.folder-row` (`padding-left: calc(var(--d,0) * 16px)`; `.on` uses the `--folder-row-active-*` tokens)
- `.folder-row.is-drop` and `.folder-tile.is-drop` (dashed `--folder-drop-border`)
- `.folder-row-name`, `.folder-row-count`, `.folder-row-toggle`
- `.folder-new-btn`
- `.folder-bar`
- `.folder-crumbs`, `.folder-title`, `.folder-meta`
- `.folder-tiles` (grid `repeat(auto-fill, minmax(180px,1fr))`; at <480px `1fr 1fr`)
- `.folder-tile` (left accent border `--folder-tile-accent`), `.folder-tile.add` (dashed)
- `.folder-section-label`
- `.folder-chip(s)`
- `.folder-check(.on)`
- `.folder-name-input`
- `.recipe-card.is-dragging` (opacity .45) and `.recipe-card[draggable="true"] { cursor: grab }`

Rules: colours only via `var(--folder-*)`, `var(--view-toggle-*)` or existing tokens (no literals); every button gets `min-height: 44px; touch-action: manipulation; -webkit-tap-highlight-color: transparent`; hover styles sit inside `@media (hover: hover)` and are paired with `:active`; keyboard focus uses `:focus-visible`; the folder-actions trigger is always visible on touch and is revealed on row hover only inside `@media (hover: hover)`.

- [ ] **Step 2: No literal colours**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\folders\RecipeFolders.css -Pattern "#[0-9a-fA-F]{3,8}\b|rgba?\("`
Expected: zero hits.

- [ ] **Step 3: Build and check Default by hand**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`.
Manual check (local backend with `.env` + Vite per `CLAUDE.md`, the migration applied locally, theme Default): at 1280px, Recipes → Folders. Create "Batch cook", a subfolder, and a third level; the fourth level's "New subfolder" is disabled. Drag a card onto a folder; the toast reads "Added to …". At 375px: Folders ▾ opens the sheet; ⋯ → Add to folder ticks persist after reload. Switch to Menu: the page matches today's, with the week strip back. Reload: the view is remembered.

---

## Phase 6 — Cyberpunk and Parchment

Gives the two named themes their approved looks. Token reassignments plus theme-only overrides; component CSS stays untouched. Ends with the contrast check green.

### Task 28: Cyberpunk folder look

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk.css` (token block under `:root[data-theme="cyberpunk"]`)
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css`

- [ ] **Step 1: Reassign the tokens from the approved mockup**

```css
  --folder-icon: var(--cyan);
  --folder-row-text: var(--ink);
  --folder-row-active-bg: var(--raised);
  --folder-row-active-border: var(--yellow);
  --folder-row-active-text: var(--yellow);
  --folder-count-text: var(--muted);
  --folder-tile-bg: var(--deep);
  --folder-tile-border: var(--line-soft);
  --folder-tile-accent: var(--yellow);
  --folder-tile-text: var(--ink);
  --folder-tile-sub: var(--muted);
  --folder-drop-border: var(--lime);
  --folder-chip-bg: var(--deep);
  --folder-chip-text: var(--muted);
  --folder-crumb-text: var(--cyan);
  --view-toggle-bg: var(--deep);
  --view-toggle-text: var(--muted);
  --view-toggle-on-bg: var(--yellow);
  --view-toggle-on-text: var(--void);
  --folder-check-on-bg: var(--lime);
  --folder-check-on-text: var(--void);
```

(Use the Cyberpunk palette token names as they exist in `cyberpunk.css`; if one is spelled differently there, use that spelling.)

- [ ] **Step 2: Theme-only looks in `cyberpunk/recipes.css`**

Every selector is prefixed `:root[data-theme="cyberpunk"]`:
- HUD corner brackets on `.folder-sidebar` and the folder header, reusing the existing HUD bracket rule from `hud.css`.
- Square corners (`border-radius: 0`) on tiles, rows, chips and the toggle.
- The label font plus uppercase on `.folder-section-label`, `.folder-crumbs`, `.view-toggle-btn`, `.folder-tile small`, `.folder-new-btn`.
- A yellow glow on `.folder-title` that is removed under `body.lowfx`.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`.

### Task 29: Parchment folder look

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/parchment.css` (token block under `:root[data-theme="parchment"]`)
- Modify: `foodbytes-app/client/src/styles/themes/parchment/recipes.css`

- [ ] **Step 1: Confirm the Parchment mockup was approved (Task 3 Step 2)**

If it is not yet approved, stop this task and ask the developer.

- [ ] **Step 2: Reassign tokens to the approved Parchment mockup's colours**

Map each `--folder-*` / `--view-toggle-*` token to the Parchment palette tokens used in `parchment-theme.html` for the same role:
- Ink text on page for rows and tiles.
- Wax-red active rule.
- Leather toggle with `--leather-ink` / `--gold` for the active tab.
- Gilt tile accent.
- Ink crumbs.

Use only tokens that already exist in `parchment.css`.

- [ ] **Step 3: Theme-only looks in `parchment/recipes.css`**

Every selector is prefixed `:root[data-theme="parchment"]`:
- Ruled hairlines between `.folder-row`s.
- The active row's wax-red left rule.
- Leather-edged `.folder-tile` with a gilt top rule.
- Small-caps `.folder-crumbs` and `.folder-section-label`.
- `.view-toggle` drawn as two leather tabs.

- [ ] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in`.

### Task 30: Contrast pairs for folders in every theme

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/scripts/check-themes.mjs` (new `FOLDER_PAIRS` constant near `PET_PAIRS`; spread into all three `PAIRS` lists)

- [ ] **Step 1: Add the pairs**

```js
// Recipe folders + Menu/Folders switch (2026-11-16). Same pairs in every theme.
const FOLDER_PAIRS = [
  ['folder-row-text', 'bg-primary', 4.5],
  ['folder-row-active-text', 'folder-row-active-bg', 4.5, 'bg-primary'],
  ['folder-count-text', 'bg-primary', 4.5],
  ['folder-tile-text', 'folder-tile-bg', 4.5, 'bg-primary'],
  ['folder-tile-sub', 'folder-tile-bg', 4.5, 'bg-primary'],
  ['folder-chip-text', 'folder-chip-bg', 4.5, 'bg-primary'],
  ['folder-crumb-text', 'bg-primary', 4.5],
  ['view-toggle-text', 'view-toggle-bg', 4.5, 'bg-primary'],
  ['view-toggle-on-text', 'view-toggle-on-bg', 4.5],
  ['folder-check-on-text', 'folder-check-on-bg', 4.5],
  ['folder-icon', 'bg-primary', 3],
]
```

Add `...FOLDER_PAIRS,` to `default`, `cyberpunk` and `parchment`. If a theme has no `bg-primary` token, check what `PET_PAIRS` resolves against in that theme and use the same background name.

- [ ] **Step 2: Run the check**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the one known WARN (`default|text-secondary|bg-secondary`), then `Themes OK: 3 themes, 114 contrast pairs` (81 + 11 × 3). Any failure is fixed by changing the token, **never** by adding to `KNOWN_EXCEPTIONS`.

### Task 31: Manual check in all three themes + mockup parity

- Skill: react-frontend

**Files:** (none — verification only; fix in the owning file if anything fails)

- [ ] **Step 1: Walk each theme**

With the dev setup from Task 27, for each of Default, Cyberpunk and Parchment, at 320px, 768px and 1280px:
- The toggle switches views and is remembered after reload.
- Sidebar (≥768px) or sheet (<768px) navigation works.
- Breadcrumbs work.
- Subfolder tiles open folders.
- "Not in a folder yet" lists only unfiled recipes.
- Card chips open their folder.
- Add to folder, Remove from folder (with Undo), Add recipes, rename, move and delete all work.
- A 4th level is refused, and so is moving a folder into its own child.
- Low FX in Cyberpunk removes the title glow.
- Nothing scrolls horizontally at 320px.
- Popups fit on mobile.

Compare side by side with `app-mockup.html#view=folders` (Cyberpunk) and `parchment-theme.html#view=folders` (Parchment).

- [ ] **Step 2: Record any deliberate divergence**

If the implementation intentionally differs from a mockup, update that mockup now and add a line under the README's folder section ("Synced with the implementation (2026-11-16, contract 2026-11-16-custom-recipe-folders)").

---

## Phase 7 — Final verification

No production changes beyond the version bump, the CLAUDE.md note and the PR text.

### Task 32: Bump version + CHANGELOG

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [ ] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This work has no Jira key and is a new feature, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [ ] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-16-custom-recipe-folders: personal nested recipe folders with a Menu / Folders view, in all three themes`

- [ ] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 33: CLAUDE.md note + stale-reference greps

- Skill: none — docs and audit

**Files:**
- Modify: `CLAUDE.md` (Architecture → "Recipe modeling — important quirks", one bullet)

- [ ] **Step 1: Add the bullet**

`- **Recipe folders (2026-11-16):** \`recipe_folders\` (personal, adjacency list, max 3 deep, rules in \`RecipeFolderService\`/\`RecipeFolderTree\`) + \`recipe_folder_items\`. Items key recipes by the **family default id** via \`RecipeKeyResolver\` (shared with hidden recipes; client \`hideKeyOf\`). Never shared through \`meal_plan_owner_id\`.`

- [ ] **Step 2: Grep audits**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\folders\*.jsx,foodbytes-app\client\src\hooks\useRecipeFolders.js -Pattern "console\.(log|debug)|axios|localhost:8080|data-theme|themeId ==="`
Expected: zero hits (no logging, no direct axios, no hard-coded URL, no theme-id branching).

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\HiddenRecipeService.java -Pattern "RecipeFamilyMemberRepository"`
Expected: zero hits (normalisation lives only in `RecipeKeyResolver`).

### Task 34: Full backend suite, theme check, production build, PR description

- Skill: none — verification

**Files:**
- Create: `.claude/contract/2026-11-16-custom-recipe-folders/pr-description.md`

- [ ] **Step 1: Backend suite**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (previous count + 17 new tests).

- [ ] **Step 2: Themes and build**

Run: `cd foodbytes-app\client; npm run check:themes; npm run build`
Expected: the one known WARN, then `Themes OK: 3 themes, 114 contrast pairs`; then `built in`.

- [ ] **Step 3: Write `pr-description.md`**

Include:
- A link to `plan.md`.
- A summary (Menu / Folders switch, nested personal folders, multi-folder membership, all three themes) and the new version.
- **Migration:** `foodbytes-app/database/migrations/2026-11-16-recipe-folders.sql` must be applied to Railway MySQL **before** the backend redeploys (Hibernate validate). The 12 MPP-15 migrations still unapplied on Railway (`.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`) are needed by any AI_Master backend deploy regardless.
- Verification results from Tasks 12, 30, 31 and 34.
- A note for future contributors: folders and hidden recipes share `RecipeKeyResolver`; the new UI tokens are `--folder-*` / `--view-toggle-*`.
- Suggested commit subject: `recipe-folders: personal nested recipe folders with Menu/Folders view`.

---

## Self-review

**Spec coverage:**
- DB migration — Tasks 4, 5 (Railway apply in Task 34 PR notes).
- Backend entities / repos / service / controller / DTOs / tests — Tasks 7–12.
- Shared family key (`RecipeKeyResolver`) — Task 6.
- Frontend data (service, hooks, helpers, constants) — Tasks 13–17.
- View toggle remembered per device — Tasks 17, 20, 26.
- Sidebar / mobile bar + sheet / header / root / tiles / chips — Tasks 21, 22, 23, 26.
- Card ⋯ Add to / Remove from, Add recipes picker, dialogs — Tasks 23, 24, 26.
- Desktop drag-and-drop — Tasks 24, 26.
- Default styling — Tasks 18, 27; Cyberpunk — Task 28; Parchment — Tasks 2, 29.
- Folder glyph per icon set — Task 19.
- Contrast pairs — Task 30.
- Mockups (Parchment drawn, Cyberpunk delete aligned, README) — Tasks 1–3, 31.
- Version bump + CHANGELOG — Task 32.

**Placeholder scan:** No `TBD` / `TODO` / "implement later". Each step names exact files, identifiers, code or a runnable command with its expected output.

**Type / name consistency:**
- `RecipeFolderDTO { id, name, parentId, recipeIds }` is used identically by the service (Task 11), controller (Task 12), JS service (Task 15) and helpers (Task 14).
- Endpoints `/api/recipe-folders`, `/{id}/name`, `/{id}/parent`, `/{id}/recipes/{recipeId}` match between Tasks 12 and 15.
- `FOLDER_DRAG_TYPE` is shared by Tasks 13, 24, 26; `RECIPE_VIEWS` / `RECIPE_VIEW_STORAGE_KEY` by Tasks 13, 17, 20, 26.
- The token names in Task 18 are the same ones reassigned in Tasks 28–29 and checked in Task 30.
- Hook API (`create`, `rename`, `move`, `removeFolder`, `addRecipe`, `removeRecipe`, `toggleRecipe`, `undo`) is the same in Tasks 16, 23, 24, 26.

**Phase boundary cleanliness:**
- Phase 1 changes only mockups.
- Phase 2 adds unmapped empty tables (backend unaffected).
- Phase 3 compiles and tests green after each task; the endpoints need only Phase 2's tables.
- Phase 4 adds unused modules (build green).
- Phase 5 ends with the feature working in Default and the other themes falling back to Default token values.
- Phase 6 ends with `check:themes` green.
- Phase 7 changes only version, docs and PR text.

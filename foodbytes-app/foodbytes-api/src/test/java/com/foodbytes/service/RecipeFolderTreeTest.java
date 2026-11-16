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

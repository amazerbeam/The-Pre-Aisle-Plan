package com.foodbytes.service;

import com.foodbytes.dto.RecipeFolderDTO;
import com.foodbytes.model.RecipeFolder;
import com.foodbytes.model.RecipeFolderItem;
import com.foodbytes.repository.RecipeFolderItemRepository;
import com.foodbytes.repository.RecipeFolderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Ownership, depth, sibling-name, cap, re-parenting on delete and family-key filing. */
@ExtendWith(MockitoExtension.class)
class RecipeFolderServiceTest {

    @Mock private RecipeFolderRepository folderRepository;
    @Mock private RecipeFolderItemRepository itemRepository;
    @Mock private RecipeKeyResolver recipeKeyResolver;

    @InjectMocks private RecipeFolderService service;

    private static RecipeFolder folder(long id, Long parentId, String name) {
        return new RecipeFolder(id, 5L, parentId, name, null);
    }

    @Test
    void create_atDepthThree_isRejected() {
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(folder(1, null, "A"), folder(2, 1L, "B"), folder(3, 2L, "C")));

        assertThatThrownBy(() -> service.create(5L, "X", 3L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Folders go up to 3 levels deep.");
        verify(folderRepository, never()).save(any());
    }

    @Test
    void create_duplicateSiblingName_isRejectedCaseInsensitively() {
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(folder(1, null, "Gym days")));

        assertThatThrownBy(() -> service.create(5L, "gym DAYS", null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("There's already a folder called “gym DAYS” here.");
        verify(folderRepository, never()).save(any());
    }

    @Test
    void create_overCap_isRejected() {
        when(folderRepository.findByUserId(5L)).thenReturn(List.of());
        when(folderRepository.countByUserId(5L)).thenReturn(100L);

        assertThatThrownBy(() -> service.create(5L, "X", null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("You can have up to 100 folders.");
    }

    @Test
    void create_unknownParent_throwsNoSuchElement() {
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(folder(1, null, "A")));

        assertThatThrownBy(() -> service.create(5L, "X", 9L)).isInstanceOf(NoSuchElementException.class);
        verify(folderRepository, never()).save(any());
    }

    @Test
    void move_intoOwnDescendant_isRejected() {
        RecipeFolder one = folder(1, null, "A");
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.of(one));
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(one, folder(2, 1L, "B")));

        assertThatThrownBy(() -> service.move(5L, 1L, 2L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("A folder can't go inside itself.");
    }

    @Test
    void move_thatWouldExceedDepth_isRejected() {
        // 1 > 2 (height 2) moved under 4, which sits at depth 2 (3 > 4)
        RecipeFolder one = folder(1, null, "A");
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.of(one));
        when(folderRepository.findByUserId(5L)).thenReturn(
            List.of(one, folder(2, 1L, "B"), folder(3, null, "C"), folder(4, 3L, "D")));

        assertThatThrownBy(() -> service.move(5L, 1L, 4L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Folders go up to 3 levels deep.");
        verify(folderRepository, never()).save(any());
    }

    @Test
    void move_foreignFolder_isEmpty() {
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.empty());

        assertThat(service.move(5L, 1L, null)).isEmpty();
        verify(folderRepository, never()).save(any());
    }

    @Test
    void delete_reparentsChildrenToGrandparent() {
        RecipeFolder one = folder(1, null, "A");
        RecipeFolder two = folder(2, 1L, "B");
        RecipeFolder three = folder(3, 2L, "C");
        when(folderRepository.findByIdAndUserId(2L, 5L)).thenReturn(Optional.of(two));
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(one, two, three));

        assertThat(service.delete(5L, 2L)).isTrue();

        assertThat(three.getParentId()).isEqualTo(1L);
        verify(folderRepository).save(three);
        verify(folderRepository).delete(two);
    }

    @Test
    void delete_reparentClash_isRejected() {
        RecipeFolder topSoups = folder(1, null, "Soups");
        RecipeFolder holder = folder(2, null, "Holder");
        RecipeFolder nestedSoups = folder(3, 2L, "Soups");
        when(folderRepository.findByIdAndUserId(2L, 5L)).thenReturn(Optional.of(holder));
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(topSoups, holder, nestedSoups));

        assertThatThrownBy(() -> service.delete(5L, 2L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("would clash");
        verify(folderRepository, never()).delete(any());
    }

    @Test
    void delete_foreignFolder_returnsFalse() {
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.empty());

        assertThat(service.delete(5L, 1L)).isFalse();
        verify(folderRepository, never()).delete(any());
    }

    @Test
    void addRecipe_storesFamilyKey() {
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.of(folder(1, null, "A")));
        when(recipeKeyResolver.resolve(6L)).thenReturn(Optional.of(7L));

        assertThat(service.addRecipe(5L, 1L, 6L)).contains(7L);
        verify(itemRepository).insertIfAbsent(1L, 7L);
    }

    @Test
    void addRecipe_unknownRecipe_isEmpty() {
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.of(folder(1, null, "A")));
        when(recipeKeyResolver.resolve(6L)).thenReturn(Optional.empty());

        assertThat(service.addRecipe(5L, 1L, 6L)).isEmpty();
        verify(itemRepository, never()).insertIfAbsent(anyLong(), anyLong());
    }

    @Test
    void addRecipe_foreignFolder_isEmpty() {
        when(folderRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.empty());

        assertThat(service.addRecipe(5L, 1L, 6L)).isEmpty();
        verify(itemRepository, never()).insertIfAbsent(anyLong(), anyLong());
    }

    @Test
    void listFolders_sortsByNameAndAttachesKeys() {
        RecipeFolder b = folder(1, null, "b");
        RecipeFolder a = folder(2, null, "A");
        when(folderRepository.findByUserId(5L)).thenReturn(List.of(b, a));
        when(itemRepository.findByFolderIdIn(any())).thenReturn(List.of(
            new RecipeFolderItem(10L, 1L, 7L, null), new RecipeFolderItem(11L, 2L, 8L, null),
            new RecipeFolderItem(12L, 2L, 9L, null)));

        List<RecipeFolderDTO> out = service.listFolders(5L);

        assertThat(out).extracting(RecipeFolderDTO::getName).containsExactly("A", "b");
        assertThat(out.get(0).getRecipeIds()).containsExactlyInAnyOrder(8L, 9L);
        assertThat(out.get(1).getRecipeIds()).containsExactly(7L);
    }
}

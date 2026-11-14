package com.foodbytes.controller;

import com.foodbytes.dto.HiddenRecipeDTO;
import com.foodbytes.dto.HiddenRecipesDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.HiddenRecipeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** /api/hidden-recipes maps the service result onto HTTP: 200, 404 unknown recipe, 204, 403 anonymous. */
@ExtendWith(MockitoExtension.class)
class HiddenRecipeControllerTest {

    @Mock private HiddenRecipeService hiddenRecipeService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private HiddenRecipeController controller;

    @Test
    void list_returnsIds() {
        when(userPrincipal.getId()).thenReturn(5L);
        when(hiddenRecipeService.listHidden(5L)).thenReturn(List.of(7L, 23L));

        ResponseEntity<?> r = controller.list(userPrincipal);

        assertThat(r.getStatusCode().value()).isEqualTo(200);
        assertThat(((HiddenRecipesDTO) r.getBody()).getRecipeIds()).containsExactly(7L, 23L);
    }

    @Test
    void hide_returnsNormalisedKey() {
        when(userPrincipal.getId()).thenReturn(5L);
        when(hiddenRecipeService.hide(5L, 6L)).thenReturn(Optional.of(7L));

        ResponseEntity<?> r = controller.hide(userPrincipal, 6L);

        assertThat(r.getStatusCode().value()).isEqualTo(200);
        assertThat(((HiddenRecipeDTO) r.getBody()).getRecipeId()).isEqualTo(7L);
    }

    @Test
    void hide_unknownRecipe_returns404() {
        when(userPrincipal.getId()).thenReturn(5L);
        when(hiddenRecipeService.hide(5L, 999L)).thenReturn(Optional.empty());

        assertThat(controller.hide(userPrincipal, 999L).getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void unhide_returns204() {
        when(userPrincipal.getId()).thenReturn(5L);

        assertThat(controller.unhide(userPrincipal, 6L).getStatusCode().value()).isEqualTo(204);
        verify(hiddenRecipeService).unhide(5L, 6L);
    }

    @Test
    void unauthenticated_returns403_everywhere() {
        assertThat(controller.list(null).getStatusCode().value()).isEqualTo(403);
        assertThat(controller.hide(null, 6L).getStatusCode().value()).isEqualTo(403);
        assertThat(controller.unhide(null, 6L).getStatusCode().value()).isEqualTo(403);
        verifyNoInteractions(hiddenRecipeService);
    }
}

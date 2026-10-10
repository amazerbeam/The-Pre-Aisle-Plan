package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.foodbytes.dto.GenerateShoppingListRequest;
import com.foodbytes.dto.HomemadeSelectionsDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PersistedShoppingListService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-8: POST /api/shopping-list/generate must hand the client's string-keyed selections
 * to PersistedShoppingListService as a Long-keyed HomemadeSelectionsDTO. The body is
 * deserialised with Jackson exactly as Spring would, then fed to the controller method —
 * no Spring context, matching every other test in this suite.
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListControllerTest {

    private static final LocalDate START = LocalDate.of(2026, 10, 12);
    private static final LocalDate END = LocalDate.of(2026, 10, 14);

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock private PersistedShoppingListService persistedShoppingListService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private ShoppingListController controller;

    @Test
    void generate_forwardsStringKeyedSelectionsAsLongKeyedDto() throws Exception {
        GenerateShoppingListRequest request = objectMapper.readValue(
            "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\",\"selections\":{\"82\":{\"36\":false}}}",
            GenerateShoppingListRequest.class);
        when(userPrincipal.getId()).thenReturn(1L);

        ResponseEntity<?> response = controller.generateShoppingList(userPrincipal, request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        ArgumentCaptor<HomemadeSelectionsDTO> captor = ArgumentCaptor.forClass(HomemadeSelectionsDTO.class);
        verify(persistedShoppingListService)
            .generateShoppingList(eq(1L), eq(START), eq(END), captor.capture());
        assertThat(captor.getValue().getSelections().get(82L).get(36L)).isFalse();
    }

    @Test
    void generate_withoutSelections_forwardsNullSoEveryExtraStaysHomemade() throws Exception {
        GenerateShoppingListRequest request = objectMapper.readValue(
            "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\"}",
            GenerateShoppingListRequest.class);
        when(userPrincipal.getId()).thenReturn(1L);

        controller.generateShoppingList(userPrincipal, request);

        verify(persistedShoppingListService)
            .generateShoppingList(eq(1L), eq(START), eq(END), isNull());
    }
}

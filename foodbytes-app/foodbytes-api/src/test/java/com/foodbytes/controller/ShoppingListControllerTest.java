package com.foodbytes.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.GenerateShoppingListRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PersistedShoppingListService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-10: POST /api/shopping-list/generate reads homemade/store-bought choices from the database,
 * so it only hands the dates to PersistedShoppingListService. A {@code selections} property sent by
 * an older (MPP-8) client must still deserialise and be ignored. The body is deserialised with an
 * ObjectMapper configured like Spring Boot's, then fed to the controller method - no Spring context,
 * matching every other test in this suite.
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper()
        .findAndRegisterModules()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Mock private PersistedShoppingListService persistedShoppingListService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private ShoppingListController controller;

    @Test
    void generate_delegatesDatesToService_andIgnoresLegacySelections() throws Exception {
        GenerateShoppingListRequest request = objectMapper.readValue(
            "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\",\"selections\":{\"82\":{\"36\":false}}}",
            GenerateShoppingListRequest.class);
        when(userPrincipal.getId()).thenReturn(7L);

        ResponseEntity<?> response = controller.generateShoppingList(userPrincipal, request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(persistedShoppingListService)
            .generateShoppingList(7L, LocalDate.of(2026, 10, 12), LocalDate.of(2026, 10, 14));
    }
}

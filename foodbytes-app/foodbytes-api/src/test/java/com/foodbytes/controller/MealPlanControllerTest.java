package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.foodbytes.dto.MealPlanEntryEatenDTO;
import com.foodbytes.dto.MealPlanEntryEatenRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import com.foodbytes.service.ShoppingListService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-12: PUT /api/meal-plan/{id}/eaten maps the service result onto HTTP. Not-in-your-plan is 404
 * (AC 9), unauthenticated is 403, and eatenAt serialises as ISO-8601 UTC so the browser can render
 * HH:MM in the viewer's local time.
 */
@ExtendWith(MockitoExtension.class)
class MealPlanControllerTest {

    // Configured like Spring Boot's default mapper (WRITE_DATES_AS_TIMESTAMPS off).
    private final ObjectMapper objectMapper = new ObjectMapper()
        .findAndRegisterModules()
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Mock private MealPlanService mealPlanService;
    @Mock private ShoppingListService shoppingListService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private MealPlanController controller;

    @Test
    void setEaten_returns200WithState() throws Exception {
        Instant at = Instant.parse("2026-10-12T12:12:04Z");
        when(userPrincipal.getId()).thenReturn(7L);
        when(mealPlanService.setEntryEaten(7L, 812L, true))
            .thenReturn(Optional.of(new MealPlanEntryEatenDTO(812L, true, at)));

        ResponseEntity<?> response = controller.setEaten(userPrincipal, 812L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(objectMapper.writeValueAsString(response.getBody()))
            .isEqualTo("{\"id\":812,\"eaten\":true,\"eatenAt\":\"2026-10-12T12:12:04Z\"}");
    }

    @Test
    void setEaten_entryNotInPlan_returns404() {
        when(userPrincipal.getId()).thenReturn(7L);
        when(mealPlanService.setEntryEaten(7L, 999L, true)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.setEaten(userPrincipal, 999L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void setEaten_unauthenticated_returns403() {
        ResponseEntity<?> response = controller.setEaten(null, 812L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        verifyNoInteractions(mealPlanService);
    }
}

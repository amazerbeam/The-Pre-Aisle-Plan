package com.foodbytes.controller;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.SprinkleHistoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-42: GET /api/pet/sprinkles/recent - 401 without a principal; otherwise the principal's own rows. */
@WebMvcTest(PetSprinkleController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetSprinkleControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private SprinkleHistoryService sprinkleHistoryService;

    @Test
    void recent_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/sprinkles/recent"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(sprinkleHistoryService);
    }

    @Test
    void recent_readsThePrincipalsOwnRows() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        RecentSprinklesDTO dto = new RecentSprinklesDTO(List.of(), null);
        when(sprinkleHistoryService.recent(2L)).thenReturn(dto);

        ResponseEntity<?> response = new PetSprinkleController(sprinkleHistoryService).recent(principal);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(dto);
        verify(sprinkleHistoryService).recent(2L);
    }
}

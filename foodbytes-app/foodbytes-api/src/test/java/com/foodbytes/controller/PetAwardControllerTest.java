package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.PetAwardsDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.AwardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MPP-22: the no-principal path never reaches the service. MPP-24 adds the 200 path (the cabinet)
 * and pins the JSON shape {streaks, firsts}.
 */
@WebMvcTest(PetAwardController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetAwardControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AwardService awardService;

    @Test
    void getAwards_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/awards"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(awardService);
    }

    @Test
    void getAwards_withPrincipal_returnsTheCabinet() {
        UserPrincipal principal = org.mockito.Mockito.mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        PetAwardsDTO cabinet = new PetAwardsDTO(List.of(),
                List.of(new FirstStatusDTO(FirstKey.MAKE_TEMPLATE, null)));
        when(awardService.getCabinet(2L)).thenReturn(cabinet);

        ResponseEntity<?> response = new PetAwardController(awardService).getAwards(principal);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(cabinet);
    }

    @Test
    void cabinetJson_hasStreaksAndFirsts_withNullEarnedAt() throws Exception {
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String json = mapper.writeValueAsString(new PetAwardsDTO(List.of(), List.of(
                new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, Instant.parse("2026-01-07T21:33:10Z")),
                new FirstStatusDTO(FirstKey.COOK_HOMEMADE_EXTRA, null))));

        assertThat(json).isEqualTo("{\"streaks\":[],\"firsts\":["
                + "{\"key\":\"PLAN_FULL_WEEK\",\"earnedAt\":\"2026-01-07T21:33:10Z\"},"
                + "{\"key\":\"COOK_HOMEMADE_EXTRA\",\"earnedAt\":null}]}");
    }
}

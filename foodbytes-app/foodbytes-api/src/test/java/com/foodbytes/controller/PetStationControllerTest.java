package com.foodbytes.controller;

import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.RoomStation;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PetShopException;
import com.foodbytes.service.StationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-26: POST /api/pet/stations/{station}/upgrade - 401 without a principal, 400 unknown station, 409 {error} when refused. */
@WebMvcTest(PetStationController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetStationControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private StationService stationService;

    private static UserPrincipal principal() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        return principal;
    }

    @Test
    void upgrade_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(post("/api/pet/stations/bed/upgrade"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(stationService);
    }

    @Test
    void upgrade_returnsTheRoomWrite_caseInsensitive() {
        RoomWriteDTO write = new RoomWriteDTO(435L, null);
        when(stationService.upgrade(2L, RoomStation.FRIDGE)).thenReturn(write);

        ResponseEntity<?> response = new PetStationController(stationService).upgrade(principal(), "FRIDGE");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(write);
    }

    @Test
    void upgrade_unknownStation_returns400() {
        ResponseEntity<?> response = new PetStationController(stationService).upgrade(principal(), "sofa");

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Unknown station: sofa"));
        verifyNoInteractions(stationService);
    }

    @Test
    void upgrade_refused_returns409WithTheMessage() {
        when(stationService.upgrade(2L, RoomStation.BED))
                .thenThrow(new PetShopException(PetShopException.Reason.NOT_ENOUGH_SPRINKLES, "Not enough sprinkles: you have 10, this costs 300."));

        ResponseEntity<?> response = new PetStationController(stationService).upgrade(principal(), "bed");

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Not enough sprinkles: you have 10, this costs 300."));
    }
}

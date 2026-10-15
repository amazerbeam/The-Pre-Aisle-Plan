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
import com.foodbytes.dto.StationLevelRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    // ---- MPP-40: PUT /{station}/level (free mode only) ----

    @Test
    void setLevel_returnsTheRoomWrite() {
        RoomWriteDTO write = new RoomWriteDTO(435L, null);
        when(stationService.setLevel(2L, RoomStation.BED, 3)).thenReturn(write);

        ResponseEntity<?> response = new PetStationController(stationService).setLevel(principal(), "bed", new StationLevelRequest(3));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(write);
    }

    @Test
    void setLevel_freeModeOff_returns403() {
        when(stationService.setLevel(2L, RoomStation.BED, 3))
                .thenThrow(new PetShopException(PetShopException.Reason.FREE_MODE_ONLY, "Free mode is off."));

        ResponseEntity<?> response = new PetStationController(stationService).setLevel(principal(), "bed", new StationLevelRequest(3));

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Free mode is off."));
    }

    @Test
    void setLevel_unknownStation_returns400() {
        ResponseEntity<?> response = new PetStationController(stationService).setLevel(principal(), "sofa", new StationLevelRequest(3));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Unknown station: sofa"));
        verifyNoInteractions(stationService);
    }

    @Test
    void setLevel_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(put("/api/pet/stations/bed/level").contentType(MediaType.APPLICATION_JSON).content("{\"level\":3}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(stationService);
    }

    @Test
    void setLevel_levelFive_returns400() throws Exception {
        mockMvc.perform(put("/api/pet/stations/bed/level").contentType(MediaType.APPLICATION_JSON).content("{\"level\":5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("level must be 1 to 4"));
        verifyNoInteractions(stationService);
    }
}

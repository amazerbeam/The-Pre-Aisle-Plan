package com.foodbytes.controller;

import com.foodbytes.dto.RoomPlacementRequest;
import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.DecorService;
import com.foodbytes.service.PetShopException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
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

/** MPP-27: buy + place - 401 without a principal, 400 {error} on a bad id / spot / body, 409 {error} when refused. */
@WebMvcTest(PetDecorController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetDecorControllerTest {

    private static final RoomWriteDTO WRITE = new RoomWriteDTO(435L, null);

    @Autowired private MockMvc mockMvc;
    @MockBean private DecorService decorService;

    private static UserPrincipal principal() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        return principal;
    }

    private static RoomPlacementRequest placement(String spot, String itemId) {
        RoomPlacementRequest request = new RoomPlacementRequest();
        request.setSpot(spot);
        request.setItemId(itemId);
        return request;
    }

    @Test
    void everyEndpoint_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(post("/api/pet/decor/bunting/buy"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        mockMvc.perform(put("/api/pet/room/placements").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"spot\":\"leftWall\",\"itemId\":\"herb-shelf\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(decorService);
    }

    @Test
    void place_blankSpot_returns400() throws Exception {
        mockMvc.perform(put("/api/pet/room/placements").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"spot\":\"\",\"itemId\":\"herb-shelf\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("spot is required"));
    }

    @Test
    void buy_returnsTheRoomWrite() {
        when(decorService.buy(2L, "bunting")).thenReturn(WRITE);

        ResponseEntity<?> response = new PetDecorController(decorService).buy(principal(), "bunting");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(WRITE);
    }

    @Test
    void buy_refused_returns409WithTheMessage() {
        when(decorService.buy(2L, "mirror"))
                .thenThrow(new PetShopException(PetShopException.Reason.NOT_ENOUGH_SPRINKLES, "Not enough sprinkles: you have 90, this costs 250."));

        ResponseEntity<?> response = new PetDecorController(decorService).buy(principal(), "mirror");

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Not enough sprinkles: you have 90, this costs 250."));
    }

    @Test
    void buy_unknownItem_returns400() {
        when(decorService.buy(2L, "sofa")).thenThrow(new IllegalArgumentException("Unknown item: sofa"));

        ResponseEntity<?> response = new PetDecorController(decorService).buy(principal(), "sofa");

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Unknown item: sofa"));
    }

    @Test
    void place_resolvesTheSpotKey() {
        when(decorService.place(2L, RoomSpot.LEFT_WALL, "herb-shelf")).thenReturn(WRITE);

        ResponseEntity<?> response = new PetDecorController(decorService).place(principal(), placement("leftWall", "herb-shelf"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(WRITE);
    }

    @Test
    void place_unknownSpot_returns400WithoutCallingTheService() {
        ResponseEntity<?> response = new PetDecorController(decorService).place(principal(), placement("sofa", "herb-shelf"));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "Unknown spot: sofa"));
        verifyNoInteractions(decorService);
    }

    @Test
    void place_notOwned_returns409() {
        when(decorService.place(2L, RoomSpot.RIGHT_WALL, "mirror"))
                .thenThrow(new PetShopException(PetShopException.Reason.NOT_OWNED, "You don't own that yet."));

        ResponseEntity<?> response = new PetDecorController(decorService).place(principal(), placement("rightWall", "mirror"));

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "You don't own that yet."));
    }
}

package com.foodbytes.controller;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeEquipRequest;
import com.foodbytes.dto.WardrobeSeenRequest;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.WardrobeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-32: the wardrobe write endpoints - 401 without a principal, 400 {error} on a bad item or body. */
@WebMvcTest(PetWardrobeController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetWardrobeControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private WardrobeService wardrobeService;

    private static final WardrobeDTO WARDROBE = new WardrobeDTO(List.of(), Map.of(WardrobeSlot.HAT, "beanie"));

    private static UserPrincipal principal() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        return principal;
    }

    private static WardrobeEquipRequest equip(WardrobeSlot slot, String itemId) {
        WardrobeEquipRequest request = new WardrobeEquipRequest();
        request.setSlot(slot);
        request.setItemId(itemId);
        return request;
    }

    @Test
    void everyEndpoint_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(put("/api/pet/wardrobe/outfit").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slot\":\"HAT\",\"itemId\":\"beanie\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        mockMvc.perform(delete("/api/pet/wardrobe/outfit")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/pet/wardrobe/seen").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slot\":\"HAT\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(wardrobeService);
    }

    @Test
    void equip_missingSlot_returns400() throws Exception {
        mockMvc.perform(put("/api/pet/wardrobe/outfit").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"beanie\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("slot is required"));
    }

    @Test
    void equip_returnsTheWardrobe() {
        when(wardrobeService.equip(2L, WardrobeSlot.HAT, "beanie")).thenReturn(WARDROBE);

        ResponseEntity<?> response = new PetWardrobeController(wardrobeService).equip(principal(), equip(WardrobeSlot.HAT, "beanie"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(WARDROBE);
    }

    @Test
    void equip_lockedItem_returns400WithTheMessage() {
        when(wardrobeService.equip(2L, WardrobeSlot.HAT, "top-hat"))
                .thenThrow(new IllegalArgumentException("top-hat is still locked"));

        ResponseEntity<?> response = new PetWardrobeController(wardrobeService).equip(principal(), equip(WardrobeSlot.HAT, "top-hat"));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "top-hat is still locked"));
    }

    @Test
    void undressAndSeen_returnTheWardrobe() {
        when(wardrobeService.undress(2L)).thenReturn(WARDROBE);
        when(wardrobeService.markSeen(2L, WardrobeSlot.SHOES)).thenReturn(WARDROBE);
        PetWardrobeController controller = new PetWardrobeController(wardrobeService);
        WardrobeSeenRequest seen = new WardrobeSeenRequest();
        seen.setSlot(WardrobeSlot.SHOES);

        assertThat(controller.undress(principal()).getBody()).isSameAs(WARDROBE);
        assertThat(controller.markSeen(principal(), seen).getBody()).isSameAs(WARDROBE);
    }
}

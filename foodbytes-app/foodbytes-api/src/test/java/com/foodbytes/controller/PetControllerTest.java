package com.foodbytes.controller;

import com.foodbytes.service.PetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MPP-14: a too-long pet name is rejected with a 400 carrying the message the
 * frontend shows; the length is checked after trimming; no principal → 401.
 */
@WebMvcTest(PetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private PetService petService;

    @Test
    void tooLongName_returns400_withLengthMessage() throws Exception {
        mockMvc.perform(put("/api/pet/name")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Thirteen chars\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Pet name must be 12 characters or fewer"));
        verifyNoInteractions(petService);
    }

    @Test
    void paddedTwelveCharName_passesValidation_thenNeedsAPrincipal() throws Exception {
        mockMvc.perform(put("/api/pet/name")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   Twelve chars   \"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(petService);
    }

    @Test
    void getPet_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(petService);
    }
}

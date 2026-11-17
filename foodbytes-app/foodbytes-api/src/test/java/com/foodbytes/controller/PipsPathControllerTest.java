package com.foodbytes.controller;

import com.foodbytes.dto.PipsPathClearDTO;
import com.foodbytes.dto.PipsPathClearRequest;
import com.foodbytes.dto.PipsPathMapDTO;
import com.foodbytes.dto.PipsPathMapRequest;
import com.foodbytes.dto.PipsPathStateDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PipGameException;
import com.foodbytes.service.PipsPathService;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-49: /api/pet/games/pips-path - 401 without a principal, the principal's own id only, Reason to status. */
@WebMvcTest(PipsPathController.class)
@AutoConfigureMockMvc(addFilters = false)
class PipsPathControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private PipsPathService service;

    @Test
    void withoutAPrincipal_everyEndpointReturns401() throws Exception {
        mockMvc.perform(get("/api/pet/games/pips-path"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        mockMvc.perform(post("/api/pet/games/pips-path/maps"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        mockMvc.perform(post("/api/pet/games/pips-path/maps/1/clear")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"path\":[0,1]}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(service);
    }

    @Test
    void invalidClearBody_returns400WithTheMessage() throws Exception {
        mockMvc.perform(post("/api/pet/games/pips-path/maps/1/clear")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"path\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("path must have 1-64 steps"));
        verifyNoInteractions(service);
    }

    @Test
    void state_readsThePrincipalsOwnState() {
        PipsPathStateDTO dto = new PipsPathStateDTO();
        when(service.state(2L)).thenReturn(dto);

        ResponseEntity<?> response = controller().state(principal());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(dto);
    }

    @Test
    void issue_withNoBody_asksForTheNextSlot() {
        PipsPathMapDTO dto = new PipsPathMapDTO();
        when(service.issue(2L, null, null)).thenReturn(dto);

        ResponseEntity<?> response = controller().issue(principal(), null);

        assertThat(response.getBody()).isSameAs(dto);
        verify(service).issue(2L, null, null);
    }

    @Test
    void issue_withFamilyAndDifficulty_asksForThatReplay() {
        controller().issue(principal(), new PipsPathMapRequest("garden-path", 3));

        verify(service).issue(2L, "garden-path", 3);
    }

    @Test
    void clear_passesThePrincipalsIdMapIdAndPath() {
        PipsPathClearDTO dto = new PipsPathClearDTO();
        when(service.clear(2L, 77L, List.of(0, 1))).thenReturn(dto);

        ResponseEntity<?> response = controller().clear(principal(), 77L, new PipsPathClearRequest(List.of(0, 1)));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(dto);
    }

    @Test
    void everyReasonMapsToItsStatus() {
        assertThat(PipsPathController.statusOf(PipGameException.Reason.UNKNOWN_FAMILY)).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(PipsPathController.statusOf(PipGameException.Reason.BAD_DIFFICULTY)).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(PipsPathController.statusOf(PipGameException.Reason.LOCKED)).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(PipsPathController.statusOf(PipGameException.Reason.NOT_FOUND)).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(PipsPathController.statusOf(PipGameException.Reason.INVALID_PATH)).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(PipsPathController.statusOf(PipGameException.Reason.GENERATION_FAILED)).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void clear_invalidPath_returns422WithTheMessage() {
        when(service.clear(2L, 77L, List.of(0, 1))).thenThrow(
                new PipGameException(PipGameException.Reason.INVALID_PATH, "nope"));

        ResponseEntity<?> response = controller().clear(principal(), 77L, new PipsPathClearRequest(List.of(0, 1)));

        assertThat(response.getStatusCode().value()).isEqualTo(422);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "nope"));
    }

    @Test
    void issue_locked_returns403() {
        when(service.issue(2L, "garden-path", 9)).thenThrow(
                new PipGameException(PipGameException.Reason.LOCKED, "locked"));

        ResponseEntity<?> response = controller().issue(principal(), new PipsPathMapRequest("garden-path", 9));

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "locked"));
    }

    @Test
    void requestValidation_rejectsAnEmptyPathAndDifficultyEleven() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        assertThat(validator.validate(new PipsPathClearRequest(List.of()))).hasSize(1);
        assertThat(validator.validate(new PipsPathMapRequest(null, 11))).hasSize(1);
        assertThat(validator.validate(new PipsPathMapRequest("garden-path", 10))).isEmpty();
    }

    private PipsPathController controller() {
        return new PipsPathController(service);
    }

    private static UserPrincipal principal() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        return principal;
    }
}

package com.foodbytes.controller;

import com.foodbytes.service.HabitStreakService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-20: request validation, unknown habits and the no-principal path never reach the service. */
@WebMvcTest(PetHabitController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetHabitControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private HabitStreakService habitStreakService;

    @Test
    void getHabits_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/habits"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(post("/api/pet/habits/SNACK/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":true}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_unknownHabit_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/CRISPS/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Unknown habit: CRISPS"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_missingClean_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/SNACK/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("clean is required"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_lapseWithoutDate_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/ALCOHOL/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("lapseDate is required when clean is false"));
        verifyNoInteractions(habitStreakService);
    }
}

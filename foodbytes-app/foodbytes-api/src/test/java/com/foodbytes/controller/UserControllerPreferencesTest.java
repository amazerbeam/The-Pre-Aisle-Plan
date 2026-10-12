package com.foodbytes.controller;

import com.foodbytes.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MPP-13 AC 7: invalid meal times are rejected with a 400 whose body carries the
 * same message the frontend shows, and nothing reaches the service.
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerPreferencesTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService;

    @Test
    void outOfOrderTimes_return400_withOrderMessage() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"13:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Times must run breakfast → lunch → dinner."));
        verifyNoInteractions(userService);
    }

    @Test
    void badlyFormattedTime_returns400_withFormatMessage() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"25:00\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Meal times must be HH:mm"));
        verifyNoInteractions(userService);
    }

    @Test
    void validTimes_withoutPrincipal_return401() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"09:00\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(userService);
    }
}

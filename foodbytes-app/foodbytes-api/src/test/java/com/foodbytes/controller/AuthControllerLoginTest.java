package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.model.User;
import com.foodbytes.service.PasswordAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerLoginTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private PasswordAuthService passwordAuthService;

    @Test
    void loginSuccess_returns200_andSetsJwtCookieViaService() throws Exception {
        User user = new User();
        user.setId(42L);
        user.setEmail("friend@example.com");
        user.setName("Friend");
        user.setIsAdmin(false);
        when(passwordAuthService.authenticateAndIssueCookie(eq("friend@example.com"), eq("hunter2"), any()))
                .thenAnswer(inv -> {
                    var res = (jakarta.servlet.http.HttpServletResponse) inv.getArgument(2);
                    var c = new jakarta.servlet.http.Cookie("jwt", "fake-token");
                    c.setHttpOnly(true); c.setSecure(true); c.setPath("/"); c.setMaxAge(7*24*60*60);
                    res.addCookie(c);
                    return user;
                });

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "friend@example.com",
                                "password", "hunter2"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("friend@example.com"))
                .andExpect(cookie().exists("jwt"))
                .andExpect(cookie().httpOnly("jwt", true))
                .andExpect(cookie().secure("jwt", true));
    }

    @Test
    void loginWrongPassword_returns401_andDoesNotSetCookie() throws Exception {
        when(passwordAuthService.authenticateAndIssueCookie(any(), any(), any()))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "friend@example.com",
                                "password", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"))
                .andExpect(cookie().doesNotExist("jwt"));
    }

    @Test
    void loginUnknownEmail_returns401_sameErrorShape() throws Exception {
        when(passwordAuthService.authenticateAndIssueCookie(any(), any(), any()))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "nobody@example.com",
                                "password", "whatever"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    void loginMissingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}

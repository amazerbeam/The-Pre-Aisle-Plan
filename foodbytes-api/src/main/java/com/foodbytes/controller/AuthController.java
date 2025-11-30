package com.foodbytes.controller;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        // Clear the JWT cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> preferences) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (preferences.containsKey("defaultServings")) {
            Integer defaultServings = (Integer) preferences.get("defaultServings");
            if (defaultServings >= 1 && defaultServings <= 10) {
                user.setDefaultServings(defaultServings);
            }
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}

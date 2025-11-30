package com.foodbytes.controller;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.security.JwtTokenProvider;
import com.foodbytes.security.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        UserDTO userDTO = new UserDTO(
                userPrincipal.getId(),
                userPrincipal.getEmail(),
                userPrincipal.getName(),
                userPrincipal.getAvatarUrl(),
                userPrincipal.isAdmin()
        );
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear the JWT cookie
        Cookie cookie = new Cookie("jwt", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal != null) {
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "user", userPrincipal.getName()
            ));
        }
        return ResponseEntity.ok(Map.of("authenticated", false));
    }
}

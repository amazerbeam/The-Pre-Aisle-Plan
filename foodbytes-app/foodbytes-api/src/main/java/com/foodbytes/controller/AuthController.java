package com.foodbytes.controller;

import com.foodbytes.dto.PasswordLoginRequest;
import com.foodbytes.dto.UserDTO;
import com.foodbytes.model.User;
import com.foodbytes.security.JwtCookieService;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PasswordAuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PasswordAuthService passwordAuthService;
    private final JwtCookieService jwtCookieService;

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
        jwtCookieService.clearJwtCookie(response);
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody PasswordLoginRequest request,
                                   HttpServletResponse response) {
        User user = passwordAuthService.authenticateAndIssueCookie(
                request.email(), request.password(), response);
        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                Boolean.TRUE.equals(user.getIsAdmin())
        );
        return ResponseEntity.ok(userDTO);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }
}

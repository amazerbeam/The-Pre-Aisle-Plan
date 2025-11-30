package com.foodbytes.controller;

import com.foodbytes.dto.UpdatePreferencesRequest;
import com.foodbytes.dto.UserResponse;
import com.foodbytes.model.User;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Getting current user: userId={}", userPrincipal.getId());

        User user = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    /**
     * Logout user by clearing JWT cookie
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        log.info("User logging out");

        // Clear JWT cookie
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.noContent().build();
    }

    /**
     * Update user preferences (default servings)
     */
    @PutMapping("/preferences")
    public ResponseEntity<UserResponse> updatePreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        log.info("Updating preferences for user: userId={}, defaultServings={}",
                userPrincipal.getId(), request.getDefaultServings());

        User updatedUser = userService.updateDefaultServings(
                userPrincipal.getId(),
                request.getDefaultServings()
        );

        return ResponseEntity.ok(UserResponse.from(updatedUser));
    }
}

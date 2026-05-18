package com.foodbytes.service;

import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.security.JwtCookieService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordAuthService {

    private static final String GENERIC_ERROR = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCookieService jwtCookieService;

    @Transactional(readOnly = true)
    public User authenticateAndIssueCookie(String email, String rawPassword, HttpServletResponse response) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException(GENERIC_ERROR));

        if (user.getPasswordHash() == null) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        jwtCookieService.writeJwtCookie(user, response);
        return user;
    }
}

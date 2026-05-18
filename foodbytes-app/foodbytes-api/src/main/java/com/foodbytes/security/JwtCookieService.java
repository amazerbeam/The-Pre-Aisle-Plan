package com.foodbytes.security;

import com.foodbytes.model.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtCookieService {

    public static final String COOKIE_NAME = "jwt";
    public static final int COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

    private final JwtTokenProvider jwtTokenProvider;

    public void writeJwtCookie(User user, HttpServletResponse response) {
        String token = jwtTokenProvider.generateToken(user);
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE_SECONDS);
        response.addCookie(cookie);
    }

    public void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}

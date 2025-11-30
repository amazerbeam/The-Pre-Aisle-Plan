package com.foodbytes.security;

import com.foodbytes.model.OAuthProvider;
import com.foodbytes.model.User;
import com.foodbytes.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("OAuth2 login attempt from provider: {}", registrationId);
        log.debug("OAuth2 attributes: {}", attributes);

        // Extract user information based on provider
        String email = extractEmail(registrationId, attributes);
        String name = extractName(registrationId, attributes);
        String oauthId = extractOAuthId(registrationId, attributes);
        OAuthProvider provider = OAuthProvider.valueOf(registrationId.toUpperCase());

        // Find or create user
        User user = userService.findOrCreateFromOAuth(email, name, provider, oauthId);

        log.info("User authenticated: {} (ID: {})", email, user.getId());

        return new CustomOAuth2User(oAuth2User, user);
    }

    private String extractEmail(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return (String) attributes.get("email");
        } else if ("github".equals(registrationId)) {
            // GitHub might have email in attributes or might need to fetch from /user/emails API
            String email = (String) attributes.get("email");
            if (email == null || email.isEmpty()) {
                // Fallback: use login@github.com if email is not public
                String login = (String) attributes.get("login");
                email = login + "@github.com";
            }
            return email;
        }
        throw new OAuth2AuthenticationException("Unsupported OAuth provider: " + registrationId);
    }

    private String extractName(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return (String) attributes.get("name");
        } else if ("github".equals(registrationId)) {
            String name = (String) attributes.get("name");
            if (name == null || name.isEmpty()) {
                name = (String) attributes.get("login");
            }
            return name;
        }
        throw new OAuth2AuthenticationException("Unsupported OAuth provider: " + registrationId);
    }

    private String extractOAuthId(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return (String) attributes.get("sub");
        } else if ("github".equals(registrationId)) {
            Object id = attributes.get("id");
            return id != null ? String.valueOf(id) : null;
        }
        throw new OAuth2AuthenticationException("Unsupported OAuth provider: " + registrationId);
    }
}

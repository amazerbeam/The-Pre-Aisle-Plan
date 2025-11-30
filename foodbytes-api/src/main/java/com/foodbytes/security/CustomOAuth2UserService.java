package com.foodbytes.security;

import com.foodbytes.model.OAuthProvider;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String oauthId = (String) attributes.get("sub"); // Google uses 'sub' for user ID

        OAuthProvider provider = OAuthProvider.valueOf(registrationId.toUpperCase());

        User user = userRepository.findByOauthProviderAndOauthId(provider, oauthId)
                .map(existingUser -> {
                    existingUser.setName(name);
                    existingUser.setEmail(email);
                    existingUser.setLastLogin(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .oauthProvider(provider)
                            .oauthId(oauthId)
                            .isAdmin(false)
                            .defaultServings(1)
                            .build();
                    log.info("Creating new user: {}", email);
                    return userRepository.save(newUser);
                });

        return UserPrincipal.create(user, attributes);
    }
}

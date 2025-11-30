package com.foodbytes.service;

import com.foodbytes.model.OAuthProvider;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreateFromOAuth(String email, String name, OAuthProvider provider, String oauthId) {
        return userRepository.findByOauthProviderAndOauthId(provider, oauthId)
                .map(user -> {
                    // Update last login
                    user.updateLastLogin();
                    // Update email/name if changed
                    if (!user.getEmail().equals(email)) {
                        user.setEmail(email);
                    }
                    if (!user.getName().equals(name)) {
                        user.setName(name);
                    }
                    User savedUser = userRepository.save(user);
                    log.info("Existing user logged in: {} (ID: {})", email, savedUser.getId());
                    return savedUser;
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .oauthProvider(provider)
                            .oauthId(oauthId)
                            .isAdmin(false)
                            .build();
                    newUser.updateLastLogin();
                    User savedUser = userRepository.save(newUser);
                    log.info("New user created: {} (ID: {})", email, savedUser.getId());
                    return savedUser;
                });
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}

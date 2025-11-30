package com.foodbytes.service;

import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Load user by ID for JWT authentication
     */
    @Transactional(readOnly = true)
    public UserPrincipal loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }

    /**
     * Process OAuth2 user after successful authentication
     */
    @Transactional
    public User processOAuth2User(String email, String name,
                                  User.OAuthProvider provider, String oauthId) {
        return userRepository.findByOauthProviderAndOauthId(provider, oauthId)
                .map(existingUser -> updateExistingUser(existingUser, email, name))
                .orElseGet(() -> createNewUser(email, name, provider, oauthId));
    }

    /**
     * Update existing user information
     */
    private User updateExistingUser(User user, String email, String name) {
        boolean updated = false;

        if (!user.getEmail().equals(email)) {
            user.setEmail(email);
            updated = true;
        }

        if (!user.getName().equals(name)) {
            user.setName(name);
            updated = true;
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        updated = true;

        if (updated) {
            return userRepository.save(user);
        }

        return user;
    }

    /**
     * Create new user from OAuth2 data
     */
    private User createNewUser(String email, String name,
                              User.OAuthProvider provider, String oauthId) {
        User user = User.builder()
                .email(email)
                .name(name)
                .oauthProvider(provider)
                .oauthId(oauthId)
                .isAdmin(false)
                .defaultServings(1)
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    /**
     * Update user's default servings preference
     */
    @Transactional
    public User updateDefaultServings(Long userId, Integer defaultServings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        user.setDefaultServings(defaultServings);
        return userRepository.save(user);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}

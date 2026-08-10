package com.foodbytes.service;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreateUser(String googleId, String email, String name, String avatarUrl) {
        return userRepository.findByGoogleId(googleId)
                .map(user -> {
                    // Update last login
                    user.setLastLogin(LocalDateTime.now());
                    user.setAvatarUrl(avatarUrl);
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setAvatarUrl(avatarUrl);
                    newUser.setIsAdmin(false);
                    newUser.setLastLogin(LocalDateTime.now());
                    return userRepository.save(newUser);
                });
    }

    public UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getIsAdmin(),
                user.getDefaultServings()
        );
    }

    /**
     * MPP-3: save the user's preferred starting portion count.
     * A null value clears the preference, restoring the recipe-default
     * behaviour. Validation of the range happens on the request DTO.
     */
    @Transactional
    public UserDTO updateDefaultServings(Long userId, BigDecimal defaultServings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setDefaultServings(defaultServings);
        return convertToDTO(userRepository.save(user));
    }
}

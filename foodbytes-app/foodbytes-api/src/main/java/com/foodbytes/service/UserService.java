package com.foodbytes.service;

import com.foodbytes.dto.MealTimesRequest;
import com.foodbytes.dto.UserDTO;
import com.foodbytes.dto.UserPreferencesUpdateRequest;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
                user.getDefaultServings(),
                MealTimesPolicy.effective(user)
        );
    }

    @Transactional(readOnly = true)
    public UserDTO getUserDTO(Long userId) {
        return convertToDTO(findUser(userId));
    }

    /**
     * MPP-3 / MPP-13: apply a partial preferences update. Only fields present in
     * the request body are touched (see UserPreferencesUpdateRequest); an explicit
     * null clears. Meal times are written as a set — all three, or all NULL — so a
     * row never mixes saved and default times. Validation (range, HH:mm, strict
     * order) happens on the request DTOs before this runs.
     */
    @Transactional
    public UserDTO updatePreferences(Long userId, UserPreferencesUpdateRequest request) {
        User user = findUser(userId);
        if (request.isDefaultServingsPresent()) {
            user.setDefaultServings(request.getDefaultServings());
        }
        if (request.isMealTimesPresent()) {
            MealTimesRequest times = request.getMealTimes();
            user.setBreakfastBy(times == null ? null : MealTimesPolicy.parse(times.getBreakfastBy()));
            user.setLunchBy(times == null ? null : MealTimesPolicy.parse(times.getLunchBy()));
            user.setDinnerBy(times == null ? null : MealTimesPolicy.parse(times.getDinnerBy()));
        }
        return convertToDTO(userRepository.save(user));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}

package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own Pip: the name and the MPP-13 meal
 * times are read from and written to the caller's users row, even when users.meal_plan_owner_id
 * links them to someone else's meal plan. The meal plan is shared; the pet is not.
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PetDTO getPet(Long userId) {
        return PetPolicy.toDTO(findUser(userId));
    }

    /** Renames the caller's own pet; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User user = findUser(userId);
        user.setPetName(PetPolicy.normalise(name));
        return PetPolicy.toDTO(userRepository.save(user));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}

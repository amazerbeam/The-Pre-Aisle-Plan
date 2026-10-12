package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-14: the plan's pet. Every read and write goes to the meal-plan OWNER's row
 * (users.meal_plan_owner_id, else the caller), so linked users share one pet,
 * one name and the owner's meal times (AC 8).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PetService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PetDTO getPet(Long userId) {
        return PetPolicy.toDTO(resolveOwner(userId));
    }

    /** Either linked user may rename; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User owner = resolveOwner(userId);
        owner.setPetName(PetPolicy.normalise(name));
        return PetPolicy.toDTO(userRepository.save(owner));
    }

    // Same rule as MealPlanService.getEffectiveMealPlanOwnerId (one of several private
    // copies — consolidating them is out of scope for MPP-14).
    private User resolveOwner(Long userId) {
        User user = findUser(userId);
        Long ownerId = user.getMealPlanOwnerId();
        if (ownerId == null) return user;
        // A dangling meal_plan_owner_id must not break the pet page: fall back to the caller's own row.
        return userRepository.findById(ownerId).orElseGet(() -> {
            log.warn("User {} has meal_plan_owner_id {} but that user does not exist; using the caller's own pet", userId, ownerId);
            return user;
        });
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}

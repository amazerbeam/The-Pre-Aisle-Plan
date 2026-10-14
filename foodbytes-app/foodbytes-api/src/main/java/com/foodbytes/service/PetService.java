package com.foodbytes.service;

import com.foodbytes.dto.PetAwardsDTO;
import com.foodbytes.dto.PetDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own Pip: the name and the MPP-13 meal
 * times are read from and written to the caller's users row, even when users.meal_plan_owner_id
 * links them to someone else's meal plan. The meal plan is shared; the pet is not.
 * MPP-31: both responses carry the caller's own growth (PetGrowthService).
 * MPP-32: and the caller's own wardrobe, synced against that growth (WardrobeService).
 * MPP-25: and the caller's own sprinkles balance (SprinkleService).
 * MPP-26: and the caller's own room (PetRoomService).
 * MPP-28: and the caller's own habit statuses and trophy cabinet, so /pet is the room's one pet read.
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final UserRepository userRepository;
    private final PetGrowthService petGrowthService;
    private final WardrobeService wardrobeService;
    private final SprinkleService sprinkleService;
    private final PetRoomService petRoomService;
    private final AwardService awardService;              // MPP-28
    private final HabitStreakService habitStreakService;  // MPP-28

    /** Not read-only: the growth read records Basilisk the first time it is reached (MPP-31). */
    @Transactional
    public PetDTO getPet(Long userId) {
        return toDTO(findUser(userId));
    }

    /** Renames the caller's own pet; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User user = findUser(userId);
        user.setPetName(PetPolicy.normalise(name));
        return toDTO(userRepository.save(user));
    }

    // The client replaces its whole pet with either response, so both carry every part.
    // Order (MPP-28): the cabinet records any new award before the wardrobe unlocks from those
    // counts and before the balance is read, so one read agrees with itself.
    private PetDTO toDTO(User user) {
        Long userId = user.getId();
        PetGrowthDTO growth = petGrowthService.growth(user);
        PetAwardsDTO awards = awardService.getCabinet(userId);
        WardrobeDTO wardrobe = wardrobeService.sync(userId, growth, awards.getStreaks());
        return PetPolicy.toDTO(user, growth, wardrobe, sprinkleService.balance(userId),
                petRoomService.room(userId), habitStreakService.getHabits(userId), awards);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}

package com.foodbytes.service;

import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * MPP-24: decides whether a candidate action has earned its first, and lists the caller's firsts.
 * Credit always goes to the candidate's userId (the actor); the meal-plan owner is used only to
 * find which entries are planned (per-person Pip, MPP-33).
 */
@Service
@RequiredArgsConstructor
public class PetFirstService {

    private final PetFirstRepository petFirstRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final ExtraChoiceService extraChoiceService;

    /**
     * Called from PetFirstRecorder after the triggering request has committed. REQUIRES_NEW
     * because Spring runs after-commit work while the old transaction is still bound. Idempotent:
     * an earned first is never re-checked and its earned_at never moves.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void evaluate(PetFirstCandidate candidate) {
        if (petFirstRepository.existsByUserIdAndFirstKey(candidate.userId(), candidate.key())) return;
        if (isProven(candidate)) {
            petFirstRepository.insertIfAbsent(candidate.userId(), candidate.key().name());
        }
    }

    private boolean isProven(PetFirstCandidate candidate) {
        return switch (candidate.key()) {
            case MAKE_TEMPLATE, GENERATE_SHOPPING_LIST -> true;
            case PLAN_FULL_WEEK -> PetFirstPolicy.containsFullWeek(mealPlanEntryRepository.findFullyPlannedDates(
                    extraChoiceService.resolveOwnerId(candidate.userId()),
                    PlanStreakPolicy.MAIN_MEAL_KEYS,
                    PetFirstPolicy.scanFrom(candidate.from()),
                    PetFirstPolicy.scanTo(candidate.to()),
                    PlanStreakPolicy.MAIN_MEAL_KEYS.size()));
            case COOK_HOMEMADE_EXTRA -> petFirstRepository.countHomemadeExtras(candidate.entryId()) > 0;
        };
    }

    /** All four keys in FirstKey order; earnedAt is null while not yet earned. */
    @Transactional(readOnly = true)
    public List<FirstStatusDTO> getFirsts(Long userId) {
        Map<FirstKey, LocalDateTime> earned = new EnumMap<>(FirstKey.class);
        petFirstRepository.findByUserId(userId).forEach(f -> earned.put(f.getFirstKey(), f.getEarnedAt()));
        return Arrays.stream(FirstKey.values())
                .map(key -> new FirstStatusDTO(key, toUtcInstant(earned.get(key))))
                .toList();
    }

    /** earned_at is UTC wall time; null stays null. */
    private static Instant toUtcInstant(LocalDateTime utcWallTime) {
        return utcWallTime == null ? null : utcWallTime.toInstant(ZoneOffset.UTC);
    }
}

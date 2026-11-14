package com.foodbytes.service;

import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.repository.MealPlanEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/** Shopping redesign: detects "plan changed since this list was made" without per-mutation timestamps. */
@Service
@RequiredArgsConstructor
public class MealPlanFingerprintService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final ExtraChoiceService extraChoiceService;

    /**
     * SHA-256 hex of the owner's plan over the shopping-list window (start + ShoppingListService.WINDOW_DAYS,
     * the same range the aggregator reads). Eaten state is deliberately excluded.
     * Callers pass the effective meal-plan owner id (users.meal_plan_owner_id already resolved).
     */
    @Transactional(readOnly = true)
    public String fingerprint(Long ownerId, LocalDate start) {
        // The entries finder takes an exclusive end date.
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(ownerId, start, start.plusDays(ShoppingListService.WINDOW_DAYS));
        Map<Long, Map<Long, Boolean>> choices = entries.isEmpty() ? Map.of()
            : extraChoiceService.getEntryChoices(entries.stream().map(MealPlanEntry::getId).toList());
        String canonical = entries.stream()
            .sorted(Comparator.comparing(MealPlanEntry::getId))
            .map(e -> e.getId() + "|" + e.getPlanDate() + "|" + e.getMeal().getId() + "|" + e.getRecipe().getId() + "|"
                + e.getServings().stripTrailingZeros().toPlainString() + "|"
                + new TreeMap<>(choices.getOrDefault(e.getId(), Map.of())))
            .collect(Collectors.joining("\n"));
        try {
            return HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);   // guaranteed on every JVM
        }
    }
}

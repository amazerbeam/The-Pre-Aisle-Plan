package com.foodbytes.service;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * MPP-32: the single owner of the wardrobe's unlock rules (the PetGrowthPolicy pattern). Pure and
 * static; WardrobeService feeds it the caller's progress. Items carry their rule as data
 * (WardrobeCatalogue), so this evaluates rule kinds, never individual items.
 */
public final class WardrobePolicy {

    /**
     * awardCounts: per streak type, milestone -> times earned (AwardStatusDTO.counts). firsts: the
     * firsts earned. peakForm: the highest form reached (PetGrowthDTO.peakForm).
     */
    public record Progress(Map<StreakType, Map<Integer, Integer>> awardCounts, Set<FirstKey> firsts, int peakForm) {}

    private WardrobePolicy() {
    }

    public static boolean isMet(UnlockRule rule, Progress progress) {
        return switch (rule.kind()) {
            case STARTER -> true;
            case AWARD -> earned(progress, rule.streak(), rule.milestone());
            case ANY_AWARD -> Arrays.stream(StreakType.values()).anyMatch(type -> earned(progress, type, rule.milestone()));
            case ALL_AWARDS -> Arrays.stream(StreakType.values()).allMatch(type -> earned(progress, type, rule.milestone()));
            case FIRST -> progress.firsts().contains(rule.first());
            case FORM -> progress.peakForm() >= rule.form();
        };
    }

    /** Ids whose rule is met and which the caller doesn't own yet, in catalogue order. */
    public static List<String> newlyMet(Progress progress, Set<String> owned) {
        return WardrobeCatalogue.ITEMS.stream()
                .filter(item -> !owned.contains(item.id()) && isMet(item.rule(), progress))
                .map(WardrobeCatalogue.Item::id)
                .toList();
    }

    public static WardrobeDTO toDTO(Set<String> owned, Set<String> unseen, Map<WardrobeSlot, String> outfit) {
        List<WardrobeItemDTO> items = WardrobeCatalogue.ITEMS.stream()
                .map(item -> new WardrobeItemDTO(item.id(), item.slot(),
                        owned.contains(item.id()), owned.contains(item.id()) && unseen.contains(item.id())))
                .toList();
        return new WardrobeDTO(items, outfit);
    }

    private static boolean earned(Progress progress, StreakType type, int milestone) {
        return progress.awardCounts().getOrDefault(type, Map.of()).getOrDefault(milestone, 0) > 0;
    }
}

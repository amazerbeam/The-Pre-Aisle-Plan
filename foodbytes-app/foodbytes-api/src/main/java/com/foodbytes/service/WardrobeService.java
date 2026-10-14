package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetWardrobeUnlock;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.repository.PetOutfitSlotRepository;
import com.foodbytes.repository.PetWardrobeUnlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MPP-32: the caller's own wardrobe (per-person Pip, MPP-33 - always the caller's id, never the
 * meal-plan owner). sync() grants every item whose rule (WardrobeCatalogue / WardrobePolicy) the
 * caller now meets; no method deletes an unlock, so clothes are kept forever (AC 2), whatever
 * happens to the form, the wilt or the streaks. The outfit is stored apart from growth, so it
 * survives evolving and wilting unchanged (AC 7).
 */
@Service
@RequiredArgsConstructor
public class WardrobeService {

    private final PetWardrobeUnlockRepository unlockRepository;
    private final PetOutfitSlotRepository outfitRepository;
    private final PetFirstService petFirstService;
    private final Clock clock;

    /**
     * Called on every pet read with the statuses PetService just took from AwardService#getCabinet
     * (which already synced the award ledger), so one pet read derives the ledger once (MPP-28).
     */
    @Transactional
    public WardrobeDTO sync(Long userId, PetGrowthDTO growth, List<AwardStatusDTO> awards) {
        Set<String> owned = ownedIds(unlockRepository.findByUserId(userId));
        List<String> fresh = WardrobePolicy.newlyMet(progress(userId, growth, awards), owned);
        fresh.forEach(id -> unlockRepository.insertIfAbsent(userId, id));
        return getWardrobe(userId);
    }

    @Transactional(readOnly = true)
    public WardrobeDTO getWardrobe(Long userId) {
        List<PetWardrobeUnlock> unlocks = unlockRepository.findByUserId(userId);
        Set<String> unseen = unlocks.stream()
                .filter(unlock -> unlock.getSeenAt() == null)
                .map(PetWardrobeUnlock::getItemKey)
                .collect(Collectors.toSet());
        Map<WardrobeSlot, String> outfit = new EnumMap<>(WardrobeSlot.class);
        outfitRepository.findByUserId(userId).forEach(slot -> outfit.put(slot.getSlot(), slot.getItemKey()));
        return WardrobePolicy.toDTO(ownedIds(unlocks), unseen, outfit);
    }

    /** AC 4: puts an owned item on, or empties the slot when itemId is null/blank. */
    @Transactional
    public WardrobeDTO equip(Long userId, WardrobeSlot slot, String itemId) {
        if (itemId == null || itemId.isBlank()) {
            outfitRepository.deleteByUserIdAndSlot(userId, slot);
            return getWardrobe(userId);
        }
        WardrobeCatalogue.Item item = WardrobeCatalogue.find(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown item: " + itemId));
        if (item.slot() != slot) {
            throw new IllegalArgumentException(itemId + " is not a " + slot);
        }
        if (!unlockRepository.existsByUserIdAndItemKey(userId, itemId)) {
            throw new IllegalArgumentException(itemId + " is still locked");
        }
        outfitRepository.upsert(userId, slot.name(), itemId);
        return getWardrobe(userId);
    }

    @Transactional
    public WardrobeDTO undress(Long userId) {
        outfitRepository.deleteByUserId(userId);
        return getWardrobe(userId);
    }

    /** AC 4: opening a slot's tab marks its new items seen, which clears their NEW tags and, eventually, the badge. */
    @Transactional
    public WardrobeDTO markSeen(Long userId, WardrobeSlot slot) {
        unlockRepository.markSeen(userId, WardrobeCatalogue.idsIn(slot), LocalDateTime.now(clock));
        return getWardrobe(userId);
    }

    private WardrobePolicy.Progress progress(Long userId, PetGrowthDTO growth, List<AwardStatusDTO> awards) {
        Map<StreakType, Map<Integer, Integer>> counts = new EnumMap<>(StreakType.class);
        awards.forEach(status -> counts.put(status.getStreakType(), status.getCounts()));
        Set<FirstKey> firsts = petFirstService.getFirsts(userId).stream()
                .filter(first -> first.getEarnedAt() != null)
                .map(FirstStatusDTO::getKey)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(FirstKey.class)));
        return new WardrobePolicy.Progress(counts, firsts, growth.getPeakForm());
    }

    private static Set<String> ownedIds(List<PetWardrobeUnlock> unlocks) {
        return unlocks.stream().map(PetWardrobeUnlock::getItemKey).collect(Collectors.toSet());
    }
}

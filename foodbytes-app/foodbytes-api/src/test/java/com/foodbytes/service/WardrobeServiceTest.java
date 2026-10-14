package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetOutfitSlot;
import com.foodbytes.model.PetWardrobeUnlock;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.repository.PetOutfitSlotRepository;
import com.foodbytes.repository.PetWardrobeUnlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-32 AC 2 / AC 4 / AC 7: grants are kept forever, equips are validated, and the outfit never follows the form. */
@ExtendWith(MockitoExtension.class)
class WardrobeServiceTest {

    private static final Long USER = 7L;
    private static final Instant NOW = Instant.parse("2026-10-14T09:00:00Z");

    @Mock private PetWardrobeUnlockRepository unlockRepository;
    @Mock private PetOutfitSlotRepository outfitRepository;
    @Mock private PetFirstService petFirstService;
    private WardrobeService service;

    @BeforeEach
    void setUp() {
        service = new WardrobeService(unlockRepository, outfitRepository, petFirstService,
                Clock.fixed(NOW, ZoneOffset.UTC));
        lenient().when(petFirstService.getFirsts(USER)).thenReturn(List.of(new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, null)));
        lenient().when(outfitRepository.findByUserId(USER)).thenReturn(List.of());
    }

    private static List<AwardStatusDTO> awards(Map<StreakType, Map<Integer, Integer>> counts) {
        return Arrays.stream(StreakType.values())
                .map(type -> new AwardStatusDTO(type, 0, 0, counts.getOrDefault(type, Map.of()), null))
                .toList();
    }

    private static PetGrowthDTO growth(int form, int peakForm, int lastDayScore) {
        return new PetGrowthDTO(0, form, 0, 15, false, lastDayScore, null, peakForm);
    }

    private static PetWardrobeUnlock unlock(String id, boolean seen) {
        return new PetWardrobeUnlock(null, USER, id, null, seen ? LocalDateTime.of(2026, 10, 1, 9, 0) : null);
    }

    private void owns(PetWardrobeUnlock... unlocks) {
        when(unlockRepository.findByUserId(USER)).thenReturn(List.of(unlocks));
    }

    private static WardrobeItemDTO item(WardrobeDTO dto, String id) {
        return dto.getItems().stream().filter(i -> i.getId().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void sync_grantsOnlyNewlyMetItems() {
        owns(unlock("beanie", true));

        service.sync(USER, growth(1, 1, 0), awards(Map.of(StreakType.PLAN, Map.of(3, 1))));

        verify(unlockRepository).insertIfAbsent(USER, "chef-whites");
        verify(unlockRepository).insertIfAbsent(USER, "jeans");
        verify(unlockRepository, never()).insertIfAbsent(USER, "beanie");
        verify(unlockRepository, never()).insertIfAbsent(USER, "round-specs"); // first not earned (earnedAt null)
    }

    @Test
    void sync_grantsAnEarnedFirst_andAnEvolutionFromThePeakForm() {
        owns(unlock("beanie", true), unlock("jeans", true));
        when(petFirstService.getFirsts(USER)).thenReturn(List.of(new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, NOW)));

        service.sync(USER, growth(2, 3, -3), awards(Map.of())); // de-evolved to Seedling after reaching Sprig

        verify(unlockRepository).insertIfAbsent(USER, "round-specs");
        verify(unlockRepository).insertIfAbsent(USER, "straw-hat");
    }

    @Test
    void sync_keepsItemsForever_whenProgressNoLongerMeetsTheirRule() {
        owns(unlock("beanie", true), unlock("jeans", true), unlock("sunglasses", true));

        WardrobeDTO dto = service.sync(USER, growth(1, 1, -3), awards(Map.of())); // wilted seed

        assertThat(item(dto, "sunglasses").isOwned()).isTrue();
        verify(unlockRepository, never()).insertIfAbsent(eq(USER), anyString());
    }

    @Test
    void outfit_survivesAnEvolutionAndAWilt_unchanged() {
        owns(unlock("beanie", true), unlock("jeans", true));
        when(outfitRepository.findByUserId(USER)).thenReturn(List.of(
                new PetOutfitSlot(1L, USER, WardrobeSlot.HAT, "beanie"),
                new PetOutfitSlot(2L, USER, WardrobeSlot.PANTS, "jeans")));

        WardrobeDTO seed = service.sync(USER, growth(1, 1, 3), awards(Map.of()));
        WardrobeDTO wiltedBasilisk = service.sync(USER, growth(5, 5, -3), awards(Map.of()));

        assertThat(wiltedBasilisk.getOutfit()).isEqualTo(seed.getOutfit())
                .containsOnly(Map.entry(WardrobeSlot.HAT, "beanie"), Map.entry(WardrobeSlot.PANTS, "jeans"));
        verify(outfitRepository, never()).upsert(any(), any(), any());
        verify(outfitRepository, never()).deleteByUserIdAndSlot(any(), any());
        verify(outfitRepository, never()).deleteByUserId(any());
    }

    @Test
    void getWardrobe_unseenOnlyForUnseenRows() {
        owns(unlock("beanie", true), unlock("wellies", false));

        WardrobeDTO dto = service.getWardrobe(USER);

        assertThat(item(dto, "beanie").isUnseen()).isFalse();
        assertThat(item(dto, "wellies").isUnseen()).isTrue();
        assertThat(item(dto, "cap").isOwned()).isFalse();
    }

    @Test
    void equip_ownedItem_upsertsTheSlot() {
        when(unlockRepository.existsByUserIdAndItemKey(USER, "beanie")).thenReturn(true);
        owns(unlock("beanie", true));

        service.equip(USER, WardrobeSlot.HAT, "beanie");

        verify(outfitRepository).upsert(USER, "HAT", "beanie");
    }

    @Test
    void equip_null_emptiesTheSlot() {
        owns();
        service.equip(USER, WardrobeSlot.HAT, null);
        verify(outfitRepository).deleteByUserIdAndSlot(USER, WardrobeSlot.HAT);
    }

    @Test
    void equip_rejectsUnknownWrongSlotAndLockedItems() {
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "jetpack"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("Unknown item: jetpack");
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "jeans"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("jeans is not a HAT");
        when(unlockRepository.existsByUserIdAndItemKey(USER, "top-hat")).thenReturn(false);
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "top-hat"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("top-hat is still locked");
        verify(outfitRepository, never()).upsert(any(), any(), any());
    }

    @Test
    void undress_emptiesEverySlot() {
        owns();
        service.undress(USER);
        verify(outfitRepository).deleteByUserId(USER);
    }

    @Test
    @SuppressWarnings("unchecked")
    void markSeen_marksOnlyThatSlotsItems_atNow() {
        owns();
        ArgumentCaptor<Collection<String>> ids = ArgumentCaptor.forClass(Collection.class);

        service.markSeen(USER, WardrobeSlot.SHOES);

        verify(unlockRepository).markSeen(eq(USER), ids.capture(), eq(LocalDateTime.of(2026, 10, 14, 9, 0)));
        assertThat(ids.getValue()).containsExactly("sneakers", "wellies");
    }
}

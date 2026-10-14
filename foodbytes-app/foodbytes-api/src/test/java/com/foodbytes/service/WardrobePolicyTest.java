package com.foodbytes.service;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.service.WardrobePolicy.Progress;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-32 AC 1 / AC 2: the catalogue is data, and each rule kind is met exactly when its progress exists. */
class WardrobePolicyTest {

    private static final Progress NOTHING = new Progress(Map.of(), Set.of(), 1);

    private static Progress awards(StreakType type, int... milestones) {
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        Arrays.stream(milestones).forEach(m -> counts.put(m, 1));
        return new Progress(Map.of(type, counts), Set.of(), 1);
    }

    @Test
    void catalogue_isTheTwentyItemsOfAc1_inTheirSlots() {
        Map<String, WardrobeSlot> slots = WardrobeCatalogue.ITEMS.stream()
                .collect(Collectors.toMap(WardrobeCatalogue.Item::id, WardrobeCatalogue.Item::slot, (a, b) -> a, LinkedHashMap::new));
        assertThat(slots).containsExactly(
                Map.entry("beanie", WardrobeSlot.HAT), Map.entry("cap", WardrobeSlot.HAT),
                Map.entry("chef-hat", WardrobeSlot.HAT), Map.entry("straw-hat", WardrobeSlot.HAT),
                Map.entry("top-hat", WardrobeSlot.HAT),
                Map.entry("round-specs", WardrobeSlot.GLASSES), Map.entry("heart-glasses", WardrobeSlot.GLASSES),
                Map.entry("sunglasses", WardrobeSlot.GLASSES),
                Map.entry("red-scarf", WardrobeSlot.SCARF), Map.entry("striped-scarf", WardrobeSlot.SCARF),
                Map.entry("chef-whites", WardrobeSlot.JACKET), Map.entry("denim-jacket", WardrobeSlot.JACKET),
                Map.entry("puffer", WardrobeSlot.JACKET),
                Map.entry("leather-belt", WardrobeSlot.BELT), Map.entry("champion-belt", WardrobeSlot.BELT),
                Map.entry("jeans", WardrobeSlot.PANTS), Map.entry("joggers", WardrobeSlot.PANTS),
                Map.entry("dungarees", WardrobeSlot.PANTS),
                Map.entry("sneakers", WardrobeSlot.SHOES), Map.entry("wellies", WardrobeSlot.SHOES));
        assertThat(WardrobeCatalogue.ITEMS).hasSize(20);
        assertThat(WardrobeCatalogue.ITEMS.stream().map(WardrobeCatalogue.Item::slot).collect(Collectors.toSet()))
                .containsExactlyInAnyOrder(WardrobeSlot.values());
    }

    @Test
    void starters_areBeanieAndJeans_ownedWithNoProgress() {
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of())).containsExactly("beanie", "jeans");
    }

    @Test
    void ladderRules_matchAc1() {
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.PLAN, 1, 3, 5, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("chef-whites", "denim-jacket", "puffer", "dungarees");
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.SNACK, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("striped-scarf", "joggers", "sneakers");
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.ALCOHOL, 5, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("cap", "heart-glasses", "red-scarf", "leather-belt");
    }

    @Test
    void awardRule_needsThatStreakTypeAndMilestone() {
        UnlockRule rule = UnlockRule.award(StreakType.ALCOHOL, 5);
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.ALCOHOL, 5))).isTrue();
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.SNACK, 5))).isFalse();
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.ALCOHOL, 3, 7))).isFalse();
        assertThat(WardrobePolicy.isMet(rule, new Progress(Map.of(StreakType.ALCOHOL, Map.of(5, 0)), Set.of(), 1))).isFalse();
    }

    @Test
    void anyAward_topHat_onAnyOneThirtyDayStreak() {
        assertThat(WardrobePolicy.isMet(UnlockRule.anyAward(30), awards(StreakType.SNACK, 30))).isTrue();
        assertThat(WardrobePolicy.isMet(UnlockRule.anyAward(30), awards(StreakType.SNACK, 21))).isFalse();
    }

    @Test
    void allAwards_championBelt_needsThirtyOnEveryStreakType() {
        Map<StreakType, Map<Integer, Integer>> two = new EnumMap<>(StreakType.class);
        two.put(StreakType.PLAN, Map.of(30, 1));
        two.put(StreakType.SNACK, Map.of(30, 2));
        assertThat(WardrobePolicy.isMet(UnlockRule.allAwards(30), new Progress(two, Set.of(), 1))).isFalse();
        two.put(StreakType.ALCOHOL, Map.of(30, 1));
        assertThat(WardrobePolicy.isMet(UnlockRule.allAwards(30), new Progress(two, Set.of(), 1))).isTrue();
    }

    @Test
    void firstRules_chefHatAndRoundSpecs() {
        Progress firsts = new Progress(Map.of(), EnumSet.of(FirstKey.COOK_HOMEMADE_EXTRA, FirstKey.PLAN_FULL_WEEK), 1);
        assertThat(WardrobePolicy.newlyMet(firsts, Set.of("beanie", "jeans"))).containsExactly("chef-hat", "round-specs");
        assertThat(WardrobePolicy.isMet(UnlockRule.first(FirstKey.PLAN_FULL_WEEK),
                new Progress(Map.of(), EnumSet.of(FirstKey.MAKE_TEMPLATE), 1))).isFalse();
    }

    @Test
    void formRules_useThePeakForm() {
        assertThat(WardrobePolicy.newlyMet(new Progress(Map.of(), Set.of(), 3), Set.of("beanie", "jeans")))
                .containsExactly("straw-hat");
        assertThat(WardrobePolicy.newlyMet(new Progress(Map.of(), Set.of(), 5), Set.of("beanie", "jeans")))
                .containsExactly("straw-hat", "sunglasses", "wellies");
    }

    @Test
    void newlyMet_neverRepeatsAnOwnedItem() {
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of("beanie"))).containsExactly("jeans");
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of("beanie", "jeans"))).isEmpty();
    }

    @Test
    void toDTO_listsAllTwentyInCatalogueOrder_withOwnedUnseenAndTheOutfit() {
        Map<WardrobeSlot, String> outfit = new EnumMap<>(WardrobeSlot.class);
        outfit.put(WardrobeSlot.HAT, "beanie");
        WardrobeDTO dto = WardrobePolicy.toDTO(Set.of("beanie", "jeans"), Set.of("jeans"), outfit);

        assertThat(dto.getItems()).hasSize(20);
        assertThat(dto.getItems().get(0)).isEqualTo(new WardrobeItemDTO("beanie", WardrobeSlot.HAT, true, false));
        assertThat(dto.getItems()).filteredOn(i -> i.getId().equals("jeans"))
                .containsExactly(new WardrobeItemDTO("jeans", WardrobeSlot.PANTS, true, true));
        assertThat(dto.getItems()).filteredOn(i -> i.getId().equals("wellies"))
                .containsExactly(new WardrobeItemDTO("wellies", WardrobeSlot.SHOES, false, false));
        assertThat(dto.getOutfit()).containsExactly(Map.entry(WardrobeSlot.HAT, "beanie"));
    }

    @Test
    void find_knowsEveryIdAndNothingElse() {
        assertThat(WardrobeCatalogue.find("wellies")).map(WardrobeCatalogue.Item::slot).contains(WardrobeSlot.SHOES);
        assertThat(WardrobeCatalogue.find("jetpack")).isEmpty();
        assertThat(WardrobeCatalogue.find(null)).isEmpty();
    }

    @Test
    void itemsInSlot_listsTheSlotsIdsInCatalogueOrder() {
        assertThat(WardrobeCatalogue.idsIn(WardrobeSlot.SHOES)).isEqualTo(List.of("sneakers", "wellies"));
    }
}

package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.foodbytes.model.WardrobeSlot.*;
import static com.foodbytes.service.UnlockRule.*;

/**
 * MPP-32 AC 1: every clothing item, its slot and its unlock rule, in slot then AC order. Adding an
 * item is one line here plus its art and label on the client (constants/pipWardrobe.js,
 * herb/wardrobeArt.js); no code branch changes. Ids are unique across slots and stored in
 * pet_wardrobe_unlocks.item_key / pet_outfit_slots.item_key.
 */
public final class WardrobeCatalogue {

    public record Item(String id, WardrobeSlot slot, UnlockRule rule) {}

    public static final int MONTH = 30;

    public static final List<Item> ITEMS = List.of(
            new Item("beanie", HAT, starter()),
            new Item("cap", HAT, award(StreakType.ALCOHOL, 5)),
            new Item("chef-hat", HAT, first(FirstKey.COOK_HOMEMADE_EXTRA)),
            new Item("straw-hat", HAT, form(PetGrowthPolicy.FORM_SPRIG)),
            new Item("top-hat", HAT, anyAward(MONTH)),
            new Item("round-specs", GLASSES, first(FirstKey.PLAN_FULL_WEEK)),
            new Item("heart-glasses", GLASSES, award(StreakType.ALCOHOL, 14)),
            new Item("sunglasses", GLASSES, form(PetGrowthPolicy.FORM_BASILISK)),
            new Item("red-scarf", SCARF, award(StreakType.ALCOHOL, 7)),
            new Item("striped-scarf", SCARF, award(StreakType.SNACK, 21)),
            new Item("chef-whites", JACKET, award(StreakType.PLAN, 3)),
            new Item("denim-jacket", JACKET, award(StreakType.PLAN, 14)),
            new Item("puffer", JACKET, award(StreakType.PLAN, 21)),
            new Item("leather-belt", BELT, award(StreakType.ALCOHOL, 21)),
            new Item("champion-belt", BELT, allAwards(MONTH)),
            new Item("jeans", PANTS, starter()),
            new Item("joggers", PANTS, award(StreakType.SNACK, 14)),
            new Item("dungarees", PANTS, award(StreakType.PLAN, 7)),
            new Item("sneakers", SHOES, award(StreakType.SNACK, 7)),
            new Item("wellies", SHOES, form(PetGrowthPolicy.FORM_BUSHLING)));

    // toUnmodifiableMap throws on a duplicate id, so a copy-paste slip fails at class load.
    private static final Map<String, Item> BY_ID = ITEMS.stream()
            .collect(Collectors.toUnmodifiableMap(Item::id, Function.identity()));

    private WardrobeCatalogue() {
    }

    public static Optional<Item> find(String id) {
        return id == null ? Optional.empty() : Optional.ofNullable(BY_ID.get(id));
    }

    /** The ids in one slot, in catalogue order. */
    public static List<String> idsIn(WardrobeSlot slot) {
        return ITEMS.stream().filter(item -> item.slot() == slot).map(Item::id).toList();
    }
}

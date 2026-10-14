package com.foodbytes.service;

import com.foodbytes.model.RoomSpot;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.foodbytes.model.RoomSpot.*;

/**
 * MPP-27 AC 1: every decor item and room style, the spot it belongs to and its sprinkles price
 * (mpp-27-decor-catalogue-mockup.html, approved 2026-10-14). Adding one is a line here plus its label
 * and art on the client (constants/petDecor.js, room/decorArt.jsx). Ids are unique across spots and
 * stored in pet_decor_owned.item_key / pet_room_placements.item_key. The two defaults are free and
 * owned by everyone without a row. Prices are retunable here only; the client reads PetRoomDTO.decor.
 */
public final class DecorCatalogue {

    public record Item(String id, RoomSpot spot, int price, boolean isDefault) {}

    public static final List<Item> ITEMS = List.of(
            new Item("basil-print", LEFT_WALL, 120, false),
            new Item("recipe-board", LEFT_WALL, 180, false),
            new Item("herb-shelf", LEFT_WALL, 250, false),
            new Item("fairy-lights", LEFT_WALL, 300, false),
            new Item("wall-clock", RIGHT_WALL, 120, false),
            new Item("bunting", RIGHT_WALL, 180, false),
            new Item("pan-rail", RIGHT_WALL, 200, false),
            new Item("mirror", RIGHT_WALL, 250, false),
            new Item("watering-can", FLOOR, 120, false),
            new Item("cookbook-stack", FLOOR, 180, false),
            new Item("bean-bag", FLOOR, 250, false),
            new Item("lemon-tree", FLOOR, 300, false),
            new Item("wall-lavender", WALL_STYLE, 0, true),
            new Item("wall-mint", WALL_STYLE, 250, false),
            new Item("wall-peach", WALL_STYLE, 250, false),
            new Item("wall-sky", WALL_STYLE, 250, false),
            new Item("wall-sprig", WALL_STYLE, 500, false),
            new Item("floor-lilac", FLOOR_STYLE, 0, true),
            new Item("floor-oak", FLOOR_STYLE, 300, false),
            new Item("floor-terracotta", FLOOR_STYLE, 400, false),
            new Item("floor-checker", FLOOR_STYLE, 500, false));

    // toUnmodifiableMap throws on a duplicate id, so a copy-paste slip fails at class load.
    private static final Map<String, Item> BY_ID = ITEMS.stream()
            .collect(Collectors.toUnmodifiableMap(Item::id, Function.identity()));

    private DecorCatalogue() {
    }

    public static Optional<Item> find(String id) {
        return id == null ? Optional.empty() : Optional.ofNullable(BY_ID.get(id));
    }

    /** The free style a finish has when nothing is stored for it (WALL_STYLE / FLOOR_STYLE only). */
    public static String defaultFor(RoomSpot styleSpot) {
        return ITEMS.stream()
                .filter(item -> item.spot() == styleSpot && item.isDefault())
                .map(Item::id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(styleSpot + " has no default"));
    }
}

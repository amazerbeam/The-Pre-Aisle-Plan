package com.foodbytes.service;

import com.foodbytes.model.RoomSpot;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.foodbytes.model.RoomSpot.*;

/**
 * MPP-27 AC 1 / MPP-40: every decor item and room style, the spot it belongs to and its sprinkles price
 * (pip-room-decor-spots-mockup.html: 12 decor spots plus the two finishes). Adding one is a line here plus its label
 * and art on the client (constants/petDecor.js, room/decorArt.jsx). Ids are unique across spots and
 * stored in pet_decor_owned.item_key / pet_room_placements.item_key. Each defaulted spot - the finishes and the rug -
 * has one free default, shown when nothing is stored (White walls, Lilac floor, Pink rug). Free items - the defaults
 * and Lavender - are owned by everyone without a row. Prices are retunable here only; the client reads PetRoomDTO.decor.
 */
public final class DecorCatalogue {

    public record Item(String id, RoomSpot spot, int price, boolean isDefault) {
        /** MPP-39: a free item (each defaulted spot's default, and Lavender) is owned by everyone without a row. */
        public boolean isFree() {
            return price == 0;
        }
    }

    public static final List<Item> ITEMS = List.of(
            new Item("basil-print", OVER_WARDROBE, 120, false),
            new Item("recipe-board", OVER_WARDROBE, 180, false),
            new Item("herb-shelf", OVER_WARDROBE, 250, false),
            new Item("fairy-lights", OVER_WARDROBE, 300, false),
            new Item("pip-portrait", OVER_WARDROBE, 250, false),
            new Item("growth-chart", BEDSIDE_WALL, 120, false),
            new Item("meal-calendar", BEDSIDE_WALL, 180, false),
            new Item("wall-sconce", BEDSIDE_WALL, 250, false),
            new Item("photo-strip", BEDSIDE_WALL, 180, false),
            new Item("wall-clock", FRONT_RIGHT_WALL, 120, false),
            new Item("bunting", FRONT_RIGHT_WALL, 180, false),
            new Item("pan-rail", FRONT_RIGHT_WALL, 200, false),
            new Item("mirror", FRONT_RIGHT_WALL, 250, false),
            new Item("coat-hooks", FRONT_RIGHT_WALL, 180, false),
            new Item("curtains-gingham", WINDOW_DRESSING, 180, false),
            new Item("curtains-linen", WINDOW_DRESSING, 120, false),
            new Item("roller-blind", WINDOW_DRESSING, 120, false),
            new Item("window-lights", WINDOW_DRESSING, 250, false),
            new Item("plant-hanger", WINDOW_DRESSING, 300, false),
            new Item("sill-basil", WINDOWSILL, 120, false),
            new Item("sill-succulents", WINDOWSILL, 180, false),
            new Item("sill-cactus", WINDOWSILL, 180, false),
            new Item("sill-radio", WINDOWSILL, 250, false),
            new Item("sill-cat", WINDOWSILL, 300, false),
            new Item("rug-pink", RUG, 0, true),
            new Item("rug-braided", RUG, 180, false),
            new Item("rug-leaf", RUG, 250, false),
            new Item("rug-stripe", RUG, 250, false),
            new Item("rug-picnic", RUG, 150, false),
            new Item("rug-sheepskin", RUG, 300, false),
            new Item("snake-plant", BACK_CORNER, 180, false),
            new Item("cactus", BACK_CORNER, 120, false),
            new Item("umbrella-stand", BACK_CORNER, 120, false),
            new Item("broom", BACK_CORNER, 120, false),
            new Item("side-table-lamp", BEDSIDE_NOOK, 180, false),
            new Item("record-player", BEDSIDE_NOOK, 300, false),
            new Item("plant-stand", BEDSIDE_NOOK, 250, false),
            new Item("stool-books", BEDSIDE_NOOK, 120, false),
            new Item("toy-chest", FOOT_OF_BED, 180, false),
            new Item("bench", FOOT_OF_BED, 250, false),
            new Item("laundry-basket", FOOT_OF_BED, 120, false),
            new Item("slippers", FOOT_OF_BED, 120, false),
            new Item("watering-can", BY_FRIDGE, 120, false),
            new Item("cookbook-stack", BY_FRIDGE, 180, false),
            new Item("bean-bag", BY_FRIDGE, 250, false),
            new Item("lemon-tree", BY_FRIDGE, 300, false),
            new Item("veg-basket", BY_FRIDGE, 180, false),
            new Item("monstera", CORNER_BY_DOOR, 250, false),
            new Item("coat-stand", CORNER_BY_DOOR, 180, false),
            new Item("arc-lamp", CORNER_BY_DOOR, 300, false),
            new Item("guitar", CORNER_BY_DOOR, 250, false),
            new Item("pouffe", FRONT_OF_ROOM, 120, false),
            new Item("tea-table", FRONT_OF_ROOM, 250, false),
            new Item("pip-ball", FRONT_OF_ROOM, 120, false),
            new Item("picnic-basket", FRONT_OF_ROOM, 180, false),
            new Item("wall-white", WALL_STYLE, 0, true),
            new Item("wall-lavender", WALL_STYLE, 0, false),
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

    /** A defaulted spot's free item (RUG, WALL_STYLE, FLOOR_STYLE). */
    public static String defaultFor(RoomSpot defaultedSpot) {
        return ITEMS.stream()
                .filter(item -> item.spot() == defaultedSpot && item.isDefault())
                .map(Item::id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(defaultedSpot + " has no default"));
    }
}

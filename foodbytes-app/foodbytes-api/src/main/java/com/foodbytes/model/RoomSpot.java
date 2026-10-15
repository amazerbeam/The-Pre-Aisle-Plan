package com.foodbytes.model;

import java.util.Arrays;
import java.util.Locale;

/**
 * MPP-27 / MPP-40: the room's 12 decor spots plus its two finishes. Stored by name in
 * pet_room_placements.spot (chk_pet_room_placements_spot). key is the JSON / client key
 * (constants/petDecor.js ROOM_SPOTS); label is for messages. isStyle() marks the two finishes;
 * hasDefault() marks every spot that is never empty - the finishes and the rug - whose free default
 * (DecorCatalogue.defaultFor) is shown when nothing is stored.
 */
public enum RoomSpot {
    OVER_WARDROBE("overWardrobe", "over the wardrobe", false, false),
    BEDSIDE_WALL("bedsideWall", "bedside wall", false, false),
    FRONT_RIGHT_WALL("frontRightWall", "front right wall", false, false),
    WINDOW_DRESSING("windowDressing", "window", false, false),
    WINDOWSILL("windowsill", "windowsill", false, false),
    RUG("rug", "rug", false, true),
    BACK_CORNER("backCorner", "back corner", false, false),
    BEDSIDE_NOOK("bedsideNook", "bedside nook", false, false),
    FOOT_OF_BED("footOfBed", "foot of the bed", false, false),
    BY_FRIDGE("byFridge", "spot by the fridge", false, false),
    CORNER_BY_DOOR("cornerByDoor", "corner by the door", false, false),
    FRONT_OF_ROOM("frontOfRoom", "front of the room", false, false),
    WALL_STYLE("wallStyle", "walls", true, true),
    FLOOR_STYLE("floorStyle", "floor", true, true);

    private final String key;
    private final String label;
    private final boolean style;
    private final boolean hasDefault;

    RoomSpot(String key, String label, boolean style, boolean hasDefault) {
        this.key = key;
        this.label = label;
        this.style = style;
        this.hasDefault = hasDefault;
    }

    public String key() { return key; }
    public String label() { return label; }
    public boolean isStyle() { return style; }
    public boolean hasDefault() { return hasDefault; }

    /** The request's spot: the JSON key ("overWardrobe") or the enum name ("OVER_WARDROBE", any case). */
    public static RoomSpot fromKey(String value) {
        String wanted = value == null ? "" : value.trim();
        return Arrays.stream(values())
                .filter(spot -> spot.key.equals(wanted) || spot.name().equals(wanted.toUpperCase(Locale.ROOT)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown spot: " + value));
    }
}

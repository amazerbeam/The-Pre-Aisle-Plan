package com.foodbytes.model;

import java.util.Arrays;
import java.util.Locale;

/**
 * MPP-27: the room's three fixed decor spots plus its two finishes. Stored by name in
 * pet_room_placements.spot (chk_pet_room_placements_spot). key is the JSON / client key
 * (constants/petDecor.js ROOM_SPOTS); label is for messages. The style "spots" hold the chosen wall
 * and floor style, so one placement table covers both; isStyle() keeps them apart in code.
 */
public enum RoomSpot {
    LEFT_WALL("leftWall", "left wall", false),
    RIGHT_WALL("rightWall", "right wall", false),
    FLOOR("floor", "floor", false),
    WALL_STYLE("wallStyle", "walls", true),
    FLOOR_STYLE("floorStyle", "floor", true);

    private final String key;
    private final String label;
    private final boolean style;

    RoomSpot(String key, String label, boolean style) {
        this.key = key;
        this.label = label;
        this.style = style;
    }

    public String key() { return key; }
    public String label() { return label; }
    public boolean isStyle() { return style; }

    /** The request's spot: the JSON key ("leftWall") or the enum name ("LEFT_WALL", any case). */
    public static RoomSpot fromKey(String value) {
        String wanted = value == null ? "" : value.trim();
        return Arrays.stream(values())
                .filter(spot -> spot.key.equals(wanted) || spot.name().equals(wanted.toUpperCase(Locale.ROOT)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown spot: " + value));
    }
}

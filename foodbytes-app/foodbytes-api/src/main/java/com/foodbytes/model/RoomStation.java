package com.foodbytes.model;

import java.util.Arrays;
import java.util.Locale;

/**
 * MPP-26: Pip's upgradable stations; MPP-40 adds the wardrobe. code feeds the ledger source id (StationPolicy.sourceId);
 * key is the JSON / client key (constants/petRoom.js ROOM_STATIONS); label is for messages.
 */
public enum RoomStation {
    BED(1, "bed", "bed"),
    FRIDGE(2, "fridge", "fridge"),
    COOKER(3, "cooker", "cooker"),
    CABINET(4, "cabinet", "trophy cabinet"),
    WARDROBE(5, "wardrobe", "wardrobe");

    private final int code;
    private final String key;
    private final String label;

    RoomStation(int code, String key, String label) {
        this.code = code;
        this.key = key;
        this.label = label;
    }

    public int code() { return code; }
    public String key() { return key; }
    public String label() { return label; }

    /** The path variable, case-insensitive ("bed", "BED"). */
    public static RoomStation fromPath(String value) {
        String wanted = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(station -> station.key.equals(wanted))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown station: " + value));
    }

    /** MPP-42: the station a ledger code names, or null for an unknown code. */
    public static RoomStation fromCode(int code) {
        return Arrays.stream(values()).filter(station -> station.code == code).findFirst().orElse(null);
    }
}

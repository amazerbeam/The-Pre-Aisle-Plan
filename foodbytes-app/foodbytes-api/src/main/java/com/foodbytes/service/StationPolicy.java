package com.foodbytes.service;

import com.foodbytes.model.RoomStation;

import java.util.Map;

/**
 * MPP-26 AC 2: the station price list and the ledger id for an upgrade. Costs are retunable here
 * only; the client reads them from PetRoomDTO.upgradeCosts and keeps no copy.
 */
public final class StationPolicy {

    public static final int MIN_LEVEL = 1;
    public static final int MAX_LEVEL = 4;
    public static final Map<Integer, Integer> UPGRADE_COSTS = Map.of(2, 300, 3, 600, 4, 1200);

    private StationPolicy() {
    }

    public static int costFor(int nextLevel) {
        Integer cost = UPGRADE_COSTS.get(nextLevel);
        if (cost == null) {
            throw new IllegalArgumentException("No upgrade to level " + nextLevel);
        }
        return cost;
    }

    public static boolean isMaxed(int level) {
        return level >= MAX_LEVEL;
    }

    /** bed 12..14, fridge 22..24, cooker 32..34, cabinet 42..44: one ledger row per (station, level) ever. */
    public static long sourceId(RoomStation station, int level) {
        return station.code() * 10L + level;
    }
}

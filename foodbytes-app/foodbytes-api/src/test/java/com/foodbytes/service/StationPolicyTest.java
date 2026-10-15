package com.foodbytes.service;

import com.foodbytes.model.RoomStation;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** MPP-26 AC 2: the price list, the top level and a unique ledger id per (station, level). */
class StationPolicyTest {

    @Test
    void costs_areTheTicketsConstants() {
        assertThat(StationPolicy.costFor(2)).isEqualTo(300);
        assertThat(StationPolicy.costFor(3)).isEqualTo(600);
        assertThat(StationPolicy.costFor(4)).isEqualTo(1200);
    }

    @Test
    void costFor_outsideTwoToFour_throws() {
        assertThatThrownBy(() -> StationPolicy.costFor(1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> StationPolicy.costFor(5)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void isMaxed_onlyAtLevelFour() {
        assertThat(StationPolicy.isMaxed(3)).isFalse();
        assertThat(StationPolicy.isMaxed(4)).isTrue();
    }

    @Test
    void sourceId_isUniquePerStationAndLevel() {
        Set<Long> ids = new HashSet<>();
        for (RoomStation station : RoomStation.values()) {
            for (int level = 2; level <= StationPolicy.MAX_LEVEL; level++) {
                assertThat(ids.add(StationPolicy.sourceId(station, level))).isTrue();
            }
        }
        assertThat(StationPolicy.sourceId(RoomStation.FRIDGE, 3)).isEqualTo(23L);
    }

    @Test
    void stationOfAndLevelOf_invertSourceId() {
        for (RoomStation station : RoomStation.values()) {
            for (int level = 2; level <= 4; level++) {
                long id = StationPolicy.sourceId(station, level);
                assertThat(StationPolicy.stationOf(id)).isEqualTo(station);
                assertThat(StationPolicy.levelOf(id)).isEqualTo(level);
            }
        }
        assertThat(StationPolicy.stationOf(92)).isNull();
    }

    @Test
    void fromPath_wardrobe_isCaseInsensitive() {
        assertThat(RoomStation.fromPath("Wardrobe")).isEqualTo(RoomStation.WARDROBE);
        assertThat(StationPolicy.sourceId(RoomStation.WARDROBE, 2)).isEqualTo(52L);
    }
}

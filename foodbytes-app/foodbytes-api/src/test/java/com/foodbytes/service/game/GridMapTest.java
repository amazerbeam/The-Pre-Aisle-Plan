package com.foodbytes.service.game;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GridMapTest {

    private static final List<String> THREE = List.of("S..", "...", "...");
    private static final List<String> ROCKY = List.of(".#..", "....", "..S.", "....");

    @Test
    void parse_open3x3() {
        GridMap m = GridMap.parse(THREE);
        assertThat(m.width()).isEqualTo(3);
        assertThat(m.height()).isEqualTo(3);
        assertThat(m.start()).isZero();
        assertThat(m.openCount()).isEqualTo(9);
    }

    @Test
    void parse_withRock() {
        GridMap m = GridMap.parse(ROCKY);
        assertThat(m.start()).isEqualTo(10);
        assertThat(m.openCount()).isEqualTo(15);
        assertThat(m.open()[1]).isFalse();
    }

    @Test
    void rowsAndLayout_roundTrip() {
        GridMap m = GridMap.parse(THREE);
        assertThat(m.layout()).isEqualTo("S../.../...");
        assertThat(GridMap.fromLayout(m.layout(), m.width(), m.height()).rows()).isEqualTo(THREE);
        GridMap r = GridMap.parse(ROCKY);
        assertThat(GridMap.fromLayout(r.layout(), 4, 4).rows()).isEqualTo(ROCKY);
    }

    @Test
    void neighbours_openOnly() {
        assertThat(GridMap.parse(THREE).neighbours(0)).containsExactlyInAnyOrder(1, 3);
        assertThat(GridMap.parse(ROCKY).neighbours(0)).containsExactly(4);
    }

    @Test
    void rejections() {
        assertThatThrownBy(() -> GridMap.parse(List.of("...", "..."))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GridMap.parse(List.of("SS.", "..."))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GridMap.parse(List.of("S..", ".."))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GridMap.parse(List.of("S.x", "..."))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GridMap.parse(List.of("S......", "......."))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GridMap.parse(List.of())).isInstanceOf(IllegalArgumentException.class);
    }
}

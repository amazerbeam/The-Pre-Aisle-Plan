package com.foodbytes.service;

import com.foodbytes.model.RoomSpot;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** MPP-27 AC 1 / MPP-39: the catalogue - 4 items per spot, one default per finish (White walls, Lilac floor), free items owned by everyone, every other entry priced. */
class DecorCatalogueTest {

    @Test
    void fourDecorItemsPerSpot() {
        for (RoomSpot spot : List.of(RoomSpot.LEFT_WALL, RoomSpot.RIGHT_WALL, RoomSpot.FLOOR)) {
            assertThat(DecorCatalogue.ITEMS).filteredOn(item -> item.spot() == spot).hasSize(4);
        }
    }

    @Test
    void eachFinishHasExactlyOneDefault_whiteWallsAndLilacFloor() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isDefault)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "floor-lilac");
        assertThat(DecorCatalogue.defaultFor(RoomSpot.WALL_STYLE)).isEqualTo("wall-white");
        assertThat(DecorCatalogue.defaultFor(RoomSpot.FLOOR_STYLE)).isEqualTo("floor-lilac");
    }

    @Test
    void theDefaultsAndLavenderAreFree_andLavenderIsNoLongerTheDefault() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isFree)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac");
        assertThat(DecorCatalogue.find("wall-lavender")).get()
                .satisfies(item -> assertThat(item.isDefault()).isFalse());
    }

    @Test
    void everythingElseIsPriced_andTheCatalogueTotals4900() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(item -> !item.isFree())
                .allSatisfy(item -> assertThat(item.price()).isPositive());
        assertThat(DecorCatalogue.ITEMS.stream().mapToInt(DecorCatalogue.Item::price).sum()).isEqualTo(4900);
    }

    @Test
    void idsFitTheColumnAndResolve() {
        assertThat(DecorCatalogue.ITEMS).allSatisfy(item -> {
            assertThat(item.id().length()).isLessThanOrEqualTo(32);
            assertThat(DecorCatalogue.find(item.id())).contains(item);
        });
        assertThat(DecorCatalogue.find("herb-shelf")).get()
                .satisfies(item -> {
                    assertThat(item.spot()).isEqualTo(RoomSpot.LEFT_WALL);
                    assertThat(item.price()).isEqualTo(250);
                });
    }

    @Test
    void find_unknownOrNull_isEmpty() {
        assertThat(DecorCatalogue.find("sofa")).isEmpty();
        assertThat(DecorCatalogue.find(null)).isEmpty();
    }

    @Test
    void defaultFor_aPhysicalSpot_throws() {
        assertThatThrownBy(() -> DecorCatalogue.defaultFor(RoomSpot.FLOOR)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void roomSpot_fromKey_acceptsTheKeyOrTheName() {
        assertThat(RoomSpot.fromKey("leftWall")).isEqualTo(RoomSpot.LEFT_WALL);
        assertThat(RoomSpot.fromKey("floor_style")).isEqualTo(RoomSpot.FLOOR_STYLE);
        assertThat(RoomSpot.WALL_STYLE.isStyle()).isTrue();
        assertThat(RoomSpot.FLOOR.isStyle()).isFalse();
        assertThatThrownBy(() -> RoomSpot.fromKey("sofa"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unknown spot: sofa");
    }
}

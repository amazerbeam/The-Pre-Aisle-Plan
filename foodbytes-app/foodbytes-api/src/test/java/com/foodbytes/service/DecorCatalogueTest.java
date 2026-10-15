package com.foodbytes.service;

import com.foodbytes.model.RoomSpot;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** MPP-27 AC 1 / MPP-39 / MPP-40: the catalogue - the mockup's items per spot, one default per defaulted spot (White walls, Lilac floor, Pink rug), free items owned by everyone, every other entry priced. */
class DecorCatalogueTest {

    @Test
    void itemsPerSpotMatchTheMockup() {
        Map<RoomSpot, Integer> expected = Map.ofEntries(
                Map.entry(RoomSpot.OVER_WARDROBE, 5), Map.entry(RoomSpot.BEDSIDE_WALL, 4), Map.entry(RoomSpot.FRONT_RIGHT_WALL, 5),
                Map.entry(RoomSpot.WINDOW_DRESSING, 5), Map.entry(RoomSpot.WINDOWSILL, 5), Map.entry(RoomSpot.RUG, 6),
                Map.entry(RoomSpot.BACK_CORNER, 4), Map.entry(RoomSpot.BEDSIDE_NOOK, 4), Map.entry(RoomSpot.FOOT_OF_BED, 4),
                Map.entry(RoomSpot.BY_FRIDGE, 5), Map.entry(RoomSpot.CORNER_BY_DOOR, 4), Map.entry(RoomSpot.FRONT_OF_ROOM, 4),
                Map.entry(RoomSpot.WALL_STYLE, 6), Map.entry(RoomSpot.FLOOR_STYLE, 4));
        expected.forEach((spot, count) ->
                assertThat(DecorCatalogue.ITEMS).as(spot.name()).filteredOn(item -> item.spot() == spot).hasSize(count));
        assertThat(DecorCatalogue.ITEMS).hasSize(65);
    }

    @Test
    void everyDefaultedSpotHasExactlyOneDefault_whiteWallsLilacFloorPinkRug() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isDefault)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "floor-lilac", "rug-pink");
        assertThat(DecorCatalogue.defaultFor(RoomSpot.RUG)).isEqualTo("rug-pink");
        assertThat(Arrays.stream(RoomSpot.values()).filter(RoomSpot::hasDefault))
                .containsExactlyInAnyOrder(RoomSpot.RUG, RoomSpot.WALL_STYLE, RoomSpot.FLOOR_STYLE);
    }

    @Test
    void theDefaultsAndLavenderAreFree() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(DecorCatalogue.Item::isFree)
                .extracting(DecorCatalogue.Item::id)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "rug-pink");
    }

    @Test
    void everythingElseIsPriced_andTheCatalogueTotals13080() {
        assertThat(DecorCatalogue.ITEMS).filteredOn(item -> !item.isFree())
                .allSatisfy(item -> assertThat(item.price()).isPositive());
        assertThat(DecorCatalogue.ITEMS.stream().mapToInt(DecorCatalogue.Item::price).sum()).isEqualTo(13080);
    }

    @Test
    void theTwelveMpp27ItemsKeepTheirIdsAndPrices_onTheirRenamedSpots() {
        Map<String, Object[]> legacy = Map.ofEntries(
                Map.entry("basil-print", new Object[]{RoomSpot.OVER_WARDROBE, 120}), Map.entry("recipe-board", new Object[]{RoomSpot.OVER_WARDROBE, 180}),
                Map.entry("herb-shelf", new Object[]{RoomSpot.OVER_WARDROBE, 250}), Map.entry("fairy-lights", new Object[]{RoomSpot.OVER_WARDROBE, 300}),
                Map.entry("wall-clock", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 120}), Map.entry("bunting", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 180}),
                Map.entry("pan-rail", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 200}), Map.entry("mirror", new Object[]{RoomSpot.FRONT_RIGHT_WALL, 250}),
                Map.entry("watering-can", new Object[]{RoomSpot.BY_FRIDGE, 120}), Map.entry("cookbook-stack", new Object[]{RoomSpot.BY_FRIDGE, 180}),
                Map.entry("bean-bag", new Object[]{RoomSpot.BY_FRIDGE, 250}), Map.entry("lemon-tree", new Object[]{RoomSpot.BY_FRIDGE, 300}));
        legacy.forEach((id, spotAndPrice) -> assertThat(DecorCatalogue.find(id)).get().satisfies(item -> {
            assertThat(item.spot()).isEqualTo(spotAndPrice[0]);
            assertThat(item.price()).isEqualTo(spotAndPrice[1]);
        }));
    }

    @Test
    void idsFitTheColumnAndResolve() {
        assertThat(DecorCatalogue.ITEMS).allSatisfy(item -> {
            assertThat(item.id().length()).isLessThanOrEqualTo(32);
            assertThat(DecorCatalogue.find(item.id())).contains(item);
        });
    }

    @Test
    void find_unknownOrNull_isEmpty() {
        assertThat(DecorCatalogue.find("sofa")).isEmpty();
        assertThat(DecorCatalogue.find(null)).isEmpty();
    }

    @Test
    void defaultFor_aSpotWithoutADefault_throws() {
        assertThatThrownBy(() -> DecorCatalogue.defaultFor(RoomSpot.BY_FRIDGE)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void roomSpot_fromKey_acceptsTheKeyOrTheName_andNamesFitTheColumn() {
        assertThat(RoomSpot.fromKey("overWardrobe")).isEqualTo(RoomSpot.OVER_WARDROBE);
        assertThat(RoomSpot.fromKey("corner_by_door")).isEqualTo(RoomSpot.CORNER_BY_DOOR);
        assertThat(RoomSpot.fromKey("floor_style")).isEqualTo(RoomSpot.FLOOR_STYLE);
        assertThat(RoomSpot.WALL_STYLE.isStyle()).isTrue();
        assertThat(RoomSpot.RUG.isStyle()).isFalse();
        assertThat(RoomSpot.values()).allSatisfy(spot -> assertThat(spot.name().length()).isLessThanOrEqualTo(16));
        assertThatThrownBy(() -> RoomSpot.fromKey("leftWall")).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unknown spot: leftWall");
    }
}

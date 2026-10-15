package com.foodbytes.service;

import com.foodbytes.dto.DecorItemDTO;
import com.foodbytes.dto.PetRoomDTO;
import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetRoomPlacement;
import com.foodbytes.model.PetStationLevel;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.model.RoomStation;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetRoomPlacementRepository;
import com.foodbytes.repository.PetStationLevelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-26 AC 1 / AC 4: every station has a level, 1 until upgraded; the write response carries the balance. */
@ExtendWith(MockitoExtension.class)
class PetRoomServiceTest {

    private static final Long USER = 7L;

    @Mock private PetStationLevelRepository levelRepository;
    @Mock private PetDecorOwnedRepository ownedRepository;
    @Mock private PetRoomPlacementRepository placementRepository;
    @Mock private SprinkleService sprinkleService;
    @Mock private PetFreeMode freeMode;
    @InjectMocks private PetRoomService petRoomService;

    @Test
    void room_noRows_everyStationAtLevelOne() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());

        PetRoomDTO room = petRoomService.room(USER);

        assertThat(room.getStations()).containsExactly(
                Map.entry("bed", 1), Map.entry("fridge", 1), Map.entry("cooker", 1), Map.entry("cabinet", 1), Map.entry("wardrobe", 1));
        assertThat(room.getUpgradeCosts()).containsEntry(2, 300).containsEntry(3, 600).containsEntry(4, 1200);
    }

    @Test
    void room_rowsOverrideTheirStationOnly() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of(
                new PetStationLevel(1L, USER, RoomStation.FRIDGE, 3, null)));

        assertThat(petRoomService.room(USER).getStations())
                .containsEntry("fridge", 3).containsEntry("bed", 1).containsEntry("cooker", 1).containsEntry("cabinet", 1);
    }

    @Test
    void write_carriesTheCallersBalanceAndRoom() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        when(sprinkleService.balance(USER)).thenReturn(435L);

        RoomWriteDTO write = petRoomService.write(USER);

        assertThat(write.getSprinkles()).isEqualTo(435L);
        assertThat(write.getRoom().getStations()).containsEntry("bed", 1);
    }

    // ---- MPP-27: decor and placements ----

    @Test
    void room_newUser_emptySpotsDefaultStylesAndOnlyFreeItemsOwned() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());

        PetRoomDTO room = petRoomService.room(USER);

        assertThat(room.getPlacements().keySet())
                .containsExactly("overWardrobe", "bedsideWall", "frontRightWall", "windowDressing", "windowsill", "rug",
                        "backCorner", "bedsideNook", "footOfBed", "byFridge", "cornerByDoor", "frontOfRoom", "wallStyle", "floorStyle");
        room.getPlacements().forEach((key, value) -> {
            if (!key.equals("rug") && !key.endsWith("Style")) {
                assertThat(value).as(key).isNull();
            }
        });
        assertThat(room.getPlacements()).containsEntry("rug", "rug-pink")
                .containsEntry("wallStyle", "wall-white").containsEntry("floorStyle", "floor-lilac");
        assertThat(room.getDecor()).hasSize(DecorCatalogue.ITEMS.size());
        assertThat(room.getDecor()).filteredOn(DecorItemDTO::isOwned).extracting(DecorItemDTO::getId)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "rug-pink");
        assertThat(room.getDecor()).filteredOn(item -> item.getId().equals("bunting")).singleElement()
                .satisfies(item -> {
                    assertThat(item.getKind()).isEqualTo("frontRightWall");
                    assertThat(item.getPrice()).isEqualTo(180);
                });
    }

    @Test
    void room_rowsOverrideTheirSpot_unknownOrMisplacedIdsAreIgnored() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        when(ownedRepository.findByUserId(USER)).thenReturn(List.of(
                new PetDecorOwned(1L, USER, "mirror", null),
                new PetDecorOwned(2L, USER, "floor-oak", null)));
        when(placementRepository.findByUserId(USER)).thenReturn(List.of(
                new PetRoomPlacement(1L, USER, RoomSpot.FRONT_RIGHT_WALL, "mirror"),
                new PetRoomPlacement(2L, USER, RoomSpot.FLOOR_STYLE, "floor-oak"),
                new PetRoomPlacement(3L, USER, RoomSpot.BY_FRIDGE, "retired-sofa"),
                new PetRoomPlacement(4L, USER, RoomSpot.OVER_WARDROBE, "bean-bag")));

        PetRoomDTO room = petRoomService.room(USER);

        assertThat(room.getPlacements())
                .containsEntry("frontRightWall", "mirror")
                .containsEntry("floorStyle", "floor-oak")
                .containsEntry("wallStyle", "wall-white");
        assertThat(room.getPlacements().get("byFridge")).isNull();       // unknown id -> empty
        assertThat(room.getPlacements().get("overWardrobe")).isNull();   // a floor item on a wall -> empty
        assertThat(room.getDecor()).filteredOn(DecorItemDTO::isOwned).extracting(DecorItemDTO::getId)
                .containsExactlyInAnyOrder("wall-white", "wall-lavender", "floor-lilac", "rug-pink", "mirror", "floor-oak");
    }

    @Test
    void room_aStoredLavenderWallIsKept() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        when(placementRepository.findByUserId(USER)).thenReturn(List.of(
                new PetRoomPlacement(1L, USER, RoomSpot.WALL_STYLE, "wall-lavender")));

        assertThat(petRoomService.room(USER).getPlacements()).containsEntry("wallStyle", "wall-lavender");
    }

    @Test
    void room_aStoredRugReplacesThePinkDefault() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        when(placementRepository.findByUserId(USER)).thenReturn(List.of(new PetRoomPlacement(1L, USER, RoomSpot.RUG, "rug-braided")));

        assertThat(petRoomService.room(USER).getPlacements()).containsEntry("rug", "rug-braided");
    }

    // ---- MPP-40: free mode ----

    @Test
    void room_freeModeOff_saysSo() {
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());
        assertThat(petRoomService.room(USER).isFreeMode()).isFalse();
    }

    @Test
    void room_freeMode_everythingOwned_upgradesCostNothing_noRowsNeeded() {
        when(freeMode.isOn()).thenReturn(true);
        when(levelRepository.findByUserId(USER)).thenReturn(List.of());

        PetRoomDTO room = petRoomService.room(USER);

        assertThat(room.isFreeMode()).isTrue();
        assertThat(room.getDecor()).allSatisfy(item -> assertThat(item.isOwned()).isTrue());
        assertThat(room.getDecor()).filteredOn(item -> item.getId().equals("rug-sheepskin")).singleElement()
                .satisfies(item -> assertThat(item.getPrice()).isEqualTo(300)); // the real price is still shown
        assertThat(room.getUpgradeCosts()).containsOnly(Map.entry(2, 0), Map.entry(3, 0), Map.entry(4, 0));
        verify(ownedRepository, never()).save(any());
    }
}

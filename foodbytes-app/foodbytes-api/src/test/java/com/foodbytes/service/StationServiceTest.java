package com.foodbytes.service;

import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.PetStationLevel;
import com.foodbytes.model.RoomStation;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetStationLevelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-26 AC 2 / AC 5: lock, then check, then debit and level up together; a partner's room is never touched. */
@ExtendWith(MockitoExtension.class)
class StationServiceTest {

    private static final Long OWNER = 1L;
    private static final Long LINKED = 2L;
    private static final RoomWriteDTO WRITE = new RoomWriteDTO(100L, null);

    @Mock private PetStationLevelRepository levelRepository;
    @Mock private SprinkleService sprinkleService;
    @Mock private PetRoomService petRoomService;
    @InjectMocks private StationService stationService;

    @Test
    void upgrade_fromLevelOne_locksThenSpends300ThenRaisesToTwo() {
        when(levelRepository.findByUserId(LINKED)).thenReturn(List.of());
        when(petRoomService.write(LINKED)).thenReturn(WRITE);

        RoomWriteDTO result = stationService.upgrade(LINKED, RoomStation.BED);

        assertThat(result).isSameAs(WRITE);
        InOrder order = inOrder(sprinkleService, levelRepository);
        order.verify(sprinkleService).lockWallet(LINKED);
        order.verify(levelRepository).findByUserId(LINKED);
        order.verify(sprinkleService).spend(LINKED, SprinkleSource.STATION_UPGRADE, 12L, 300);
        order.verify(levelRepository).upsert(LINKED, "BED", 2);
        verify(levelRepository, never()).upsert(eq(OWNER), anyString(), anyInt()); // AC 5
    }

    @Test
    void upgrade_fromLevelThree_costs1200() {
        when(levelRepository.findByUserId(OWNER)).thenReturn(List.of(new PetStationLevel(9L, OWNER, RoomStation.CABINET, 3, null)));

        stationService.upgrade(OWNER, RoomStation.CABINET);

        verify(sprinkleService).spend(OWNER, SprinkleSource.STATION_UPGRADE, 44L, 1200);
        verify(levelRepository).upsert(OWNER, "CABINET", 4);
    }

    @Test
    void upgrade_atLevelFour_isMaxedAndChargesNothing() {
        when(levelRepository.findByUserId(OWNER)).thenReturn(List.of(new PetStationLevel(9L, OWNER, RoomStation.FRIDGE, 4, null)));

        assertThatThrownBy(() -> stationService.upgrade(OWNER, RoomStation.FRIDGE))
                .isInstanceOf(PetShopException.class)
                .hasMessage("Your fridge is already at the top level.");
        verify(sprinkleService, never()).spend(anyLong(), eq(SprinkleSource.STATION_UPGRADE), anyLong(), anyInt());
        verify(levelRepository, never()).upsert(anyLong(), anyString(), anyInt());
    }

    @Test
    void upgrade_tooFewSprinkles_neverRaisesTheLevel() {
        when(levelRepository.findByUserId(OWNER)).thenReturn(List.of());
        doThrow(new PetShopException(PetShopException.Reason.NOT_ENOUGH_SPRINKLES, "Not enough sprinkles: you have 10, this costs 300."))
                .when(sprinkleService).spend(OWNER, SprinkleSource.STATION_UPGRADE, 32L, 300);

        assertThatThrownBy(() -> stationService.upgrade(OWNER, RoomStation.COOKER)).isInstanceOf(PetShopException.class);
        verify(levelRepository, never()).upsert(anyLong(), anyString(), anyInt());
    }
}

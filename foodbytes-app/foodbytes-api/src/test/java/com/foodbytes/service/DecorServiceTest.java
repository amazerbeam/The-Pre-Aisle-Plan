package com.foodbytes.service;

import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetRoomPlacementRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-27 AC 2 / AC 3: buying locks, records ownership, debits and auto-places in one transaction;
 * placing is free and only ever touches the caller's own room (AC 4).
 */
@ExtendWith(MockitoExtension.class)
class DecorServiceTest {

    private static final Long OWNER = 1L;
    private static final Long LINKED = 2L;
    private static final RoomWriteDTO WRITE = new RoomWriteDTO(100L, null);

    @Mock private PetDecorOwnedRepository ownedRepository;
    @Mock private PetRoomPlacementRepository placementRepository;
    @Mock private SprinkleService sprinkleService;
    @Mock private PetRoomService petRoomService;
    @Mock private PetFreeMode freeMode;
    @InjectMocks private DecorService decorService;

    // save() hands back the row with the id the database would give it.
    private void savesWithId(long id) {
        when(ownedRepository.save(any(PetDecorOwned.class))).thenAnswer(invocation -> {
            PetDecorOwned row = invocation.getArgument(0);
            row.setId(id);
            return row;
        });
    }

    // ---- buy ----

    @Test
    void buy_decor_locksThenRecordsThenSpendsThenPlacesOnAnEmptySpot() {
        savesWithId(55L);
        when(petRoomService.write(LINKED)).thenReturn(WRITE);

        RoomWriteDTO result = decorService.buy(LINKED, "bunting");

        assertThat(result).isSameAs(WRITE);
        InOrder order = inOrder(sprinkleService, ownedRepository, placementRepository);
        order.verify(sprinkleService).lockWallet(LINKED);
        order.verify(ownedRepository).existsByUserIdAndItemKey(LINKED, "bunting");
        order.verify(ownedRepository).save(argThat(row -> row.getUserId().equals(LINKED) && row.getItemKey().equals("bunting")));
        order.verify(sprinkleService).spend(LINKED, SprinkleSource.DECOR_PURCHASE, 55L, 180);
        order.verify(placementRepository).upsert(LINKED, "FRONT_RIGHT_WALL", "bunting");
        verify(placementRepository, never()).upsert(eq(OWNER), anyString(), anyString()); // AC 4
    }

    @Test
    void buy_decor_spotAlreadyFilled_keepsWhatIsThere() {
        savesWithId(56L);
        when(placementRepository.existsByUserIdAndSpot(OWNER, RoomSpot.BY_FRIDGE)).thenReturn(true);

        decorService.buy(OWNER, "bean-bag");

        verify(sprinkleService).spend(OWNER, SprinkleSource.DECOR_PURCHASE, 56L, 250);
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    @Test
    void buy_style_isAppliedAtOnce() {
        savesWithId(57L);

        decorService.buy(OWNER, "floor-oak");

        verify(sprinkleService).spend(OWNER, SprinkleSource.DECOR_PURCHASE, 57L, 300);
        verify(placementRepository).upsert(OWNER, "FLOOR_STYLE", "floor-oak");
        verify(placementRepository, never()).existsByUserIdAndSpot(anyLong(), any());
    }

    @Test
    void buy_alreadyOwned_is409AndChargesNothing() {
        when(ownedRepository.existsByUserIdAndItemKey(OWNER, "mirror")).thenReturn(true);

        assertThatThrownBy(() -> decorService.buy(OWNER, "mirror"))
                .isInstanceOf(PetShopException.class)
                .extracting(e -> ((PetShopException) e).getReason())
                .isEqualTo(PetShopException.Reason.ALREADY_OWNED);
        verify(ownedRepository, never()).save(any());
        verify(sprinkleService, never()).spend(anyLong(), any(), anyLong(), anyInt());
    }

    @Test
    void buy_aFreeItem_isAlreadyOwned() {
        for (String free : List.of("wall-white", "wall-lavender")) {
            assertThatThrownBy(() -> decorService.buy(OWNER, free))
                    .isInstanceOf(PetShopException.class)
                    .hasMessage("You already own that.");
        }
        verify(ownedRepository, never()).save(any());
    }

    @Test
    void buy_unknownItem_isRejectedBeforeTheLock() {
        assertThatThrownBy(() -> decorService.buy(OWNER, "sofa"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unknown item: sofa");
        verifyNoInteractions(sprinkleService, ownedRepository, placementRepository);
    }

    @Test
    void buy_tooFewSprinkles_propagatesSoTheOwnedRowRollsBack() {
        savesWithId(58L);
        doThrow(new PetShopException(PetShopException.Reason.NOT_ENOUGH_SPRINKLES, "Not enough sprinkles: you have 90, this costs 180."))
                .when(sprinkleService).spend(OWNER, SprinkleSource.DECOR_PURCHASE, 58L, 180);

        assertThatThrownBy(() -> decorService.buy(OWNER, "recipe-board"))
                .hasMessage("Not enough sprinkles: you have 90, this costs 180.");
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    // ---- place ----

    @Test
    void place_ownedItem_upsertsTheCallersSpotAndSpendsNothing() {
        when(ownedRepository.existsByUserIdAndItemKey(LINKED, "herb-shelf")).thenReturn(true);
        when(petRoomService.write(LINKED)).thenReturn(WRITE);

        assertThat(decorService.place(LINKED, RoomSpot.OVER_WARDROBE, "herb-shelf")).isSameAs(WRITE);

        verify(placementRepository).upsert(LINKED, "OVER_WARDROBE", "herb-shelf");
        verifyNoInteractions(sprinkleService);
    }

    @Test
    void place_nullOrBlank_clearsTheSpot() {
        decorService.place(OWNER, RoomSpot.BY_FRIDGE, null);
        decorService.place(OWNER, RoomSpot.BY_FRIDGE, " ");

        verify(placementRepository, times(2)).deleteByUserIdAndSpot(OWNER, RoomSpot.BY_FRIDGE);
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    @Test
    void place_theDefaultStyle_deletesTheRowInsteadOfStoringIt() {
        decorService.place(OWNER, RoomSpot.WALL_STYLE, "wall-white");

        verify(placementRepository).deleteByUserIdAndSpot(OWNER, RoomSpot.WALL_STYLE);
        verify(ownedRepository, never()).existsByUserIdAndItemKey(anyLong(), anyString());
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    @Test
    void place_lavender_isFreeButNotTheDefault_soTheRowIsStored() {
        when(petRoomService.write(OWNER)).thenReturn(WRITE);

        assertThat(decorService.place(OWNER, RoomSpot.WALL_STYLE, "wall-lavender")).isSameAs(WRITE);

        verify(placementRepository).upsert(OWNER, "WALL_STYLE", "wall-lavender");
        verify(ownedRepository, never()).existsByUserIdAndItemKey(anyLong(), anyString());
        verifyNoInteractions(sprinkleService);
    }

    @Test
    void place_wrongSpot_is400() {
        assertThatThrownBy(() -> decorService.place(OWNER, RoomSpot.BY_FRIDGE, "herb-shelf"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("herb-shelf doesn't go on the spot by the fridge");
        assertThatThrownBy(() -> decorService.place(OWNER, RoomSpot.WALL_STYLE, "floor-oak"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("floor-oak doesn't go on the walls");
        verifyNoInteractions(placementRepository);
    }

    @Test
    void place_unknownItem_is400() {
        assertThatThrownBy(() -> decorService.place(OWNER, RoomSpot.BY_FRIDGE, "sofa"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unknown item: sofa");
    }

    @Test
    void place_notOwned_is409() {
        assertThatThrownBy(() -> decorService.place(OWNER, RoomSpot.FRONT_RIGHT_WALL, "mirror"))
                .isInstanceOf(PetShopException.class)
                .hasMessage("You don't own that yet.")
                .extracting(e -> ((PetShopException) e).getReason())
                .isEqualTo(PetShopException.Reason.NOT_OWNED);
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    @Test
    void buy_rug_isPutDownAtOnceOverThePinkDefault() {
        savesWithId(41L);
        decorService.buy(OWNER, "rug-sheepskin");
        verify(placementRepository).upsert(OWNER, "RUG", "rug-sheepskin");
        verify(placementRepository, never()).existsByUserIdAndSpot(OWNER, RoomSpot.RUG);
    }

    @Test
    void place_rugNullOrPink_deletesTheRow_soThePinkRugShows() {
        decorService.place(OWNER, RoomSpot.RUG, null);
        decorService.place(OWNER, RoomSpot.RUG, "rug-pink");
        verify(placementRepository, times(2)).deleteByUserIdAndSpot(OWNER, RoomSpot.RUG);
        verify(placementRepository, never()).upsert(anyLong(), anyString(), anyString());
    }

    // ---- MPP-40: free mode ----

    @Test
    void place_freeMode_anItemYouDoNotOwn_isPlacedWithoutAPurchase() {
        when(freeMode.isOn()).thenReturn(true);
        decorService.place(OWNER, RoomSpot.FRONT_RIGHT_WALL, "mirror");
        verify(placementRepository).upsert(OWNER, "FRONT_RIGHT_WALL", "mirror");
        verify(ownedRepository, never()).save(any());
        verifyNoInteractions(sprinkleService);
    }
}

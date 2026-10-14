package com.foodbytes.service;

import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.dto.PetAwardsDTO;
import com.foodbytes.dto.PetDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.PetRoomDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-14 / MPP-33: each person has their own pet. A linked user (meal_plan_owner_id) reads and renames THEIR OWN pet, with their own meal times; the plan owner's are never used. */
@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PetGrowthService petGrowthService;
    @Mock private WardrobeService wardrobeService;
    @Mock private SprinkleService sprinkleService;
    @Mock private PetRoomService petRoomService;
    @Mock private AwardService awardService;
    @Mock private HabitStreakService habitStreakService;
    @InjectMocks private PetService petService;

    private static final PetAwardsDTO AWARDS = new PetAwardsDTO(List.of(), List.of());
    private static final List<HabitStatusDTO> HABITS = List.of();

    private static final PetGrowthDTO GROWTH = new PetGrowthDTO(21, 2, 6, 21, false, 3, null, 2);
    private static final WardrobeDTO WARDROBE = new WardrobeDTO(List.of(), Map.of(WardrobeSlot.HAT, "beanie"));
    private static final PetRoomDTO ROOM = new PetRoomDTO(
            Map.of("bed", 2, "fridge", 1, "cooker", 1, "cabinet", 1), Map.of(2, 300, 3, 600, 4, 1200),
            List.of(), Map.of());
    private static final Long OWNER_ID = 1L;
    private static final Long LINKED_ID = 2L;
    private User owner;
    private User linked;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(OWNER_ID);
        linked = new User();
        linked.setId(LINKED_ID);
        linked.setMealPlanOwnerId(OWNER_ID);
        lenient().when(petGrowthService.growth(any(User.class))).thenReturn(GROWTH);
        lenient().when(wardrobeService.sync(any(), any(PetGrowthDTO.class), any())).thenReturn(WARDROBE);
        lenient().when(awardService.getCabinet(any())).thenReturn(AWARDS);
        lenient().when(habitStreakService.getHabits(any())).thenReturn(HABITS);
        lenient().when(petRoomService.room(any())).thenReturn(ROOM);
    }

    /** MPP-26: the room is the caller's own, never the plan owner's. */
    @Test
    void getPet_carriesTheCallersOwnRoom() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getRoom()).isSameAs(ROOM);
        verify(petRoomService).room(LINKED_ID);
        verify(petRoomService, never()).room(OWNER_ID);
    }

    private void stubSave() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void getPet_carriesTheCallersOwnWardrobe_syncedAgainstTheirGrowth() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getWardrobe()).isSameAs(WARDROBE);
        verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        verify(wardrobeService, never()).sync(eq(OWNER_ID), any(), any());
    }

    /** MPP-28 AC 3: two accounts on one plan — every personal part of the payload is the caller's own. */
    @Test
    void getPet_linkedPartner_everyPersonalPartIsTheirOwn_neverThePlanOwners() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getHabits()).isSameAs(HABITS);
        assertThat(pet.getAwards()).isSameAs(AWARDS);
        verify(petGrowthService).growth(linked);
        verify(awardService).getCabinet(LINKED_ID);
        verify(habitStreakService).getHabits(LINKED_ID);
        verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        verify(sprinkleService).balance(LINKED_ID);
        verify(petRoomService).room(LINKED_ID);
        verify(userRepository, never()).findById(OWNER_ID);
        verify(awardService, never()).getCabinet(OWNER_ID);
        verify(habitStreakService, never()).getHabits(OWNER_ID);
        verify(wardrobeService, never()).sync(eq(OWNER_ID), any(), any());
        verify(sprinkleService, never()).balance(OWNER_ID);
        verify(petRoomService, never()).room(OWNER_ID);
    }

    /** MPP-28 AC 3, the other account: the plan owner reads only their own parts, never the partner's. */
    @Test
    void getPet_planOwner_neverReadsThePartnersParts() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        petService.getPet(OWNER_ID);

        verify(awardService).getCabinet(OWNER_ID);
        verify(habitStreakService).getHabits(OWNER_ID);
        verify(awardService, never()).getCabinet(LINKED_ID);
        verify(habitStreakService, never()).getHabits(LINKED_ID);
        verify(wardrobeService, never()).sync(eq(LINKED_ID), any(), any());
        verify(sprinkleService, never()).balance(LINKED_ID);
        verify(petRoomService, never()).room(LINKED_ID);
    }

    /** MPP-28: the cabinet records new awards before the wardrobe unlocks from them and before the balance is read. */
    @Test
    void getPet_recordsAwardsBeforeTheWardrobeAndTheBalance() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        petService.getPet(LINKED_ID);

        InOrder order = inOrder(petGrowthService, awardService, wardrobeService, sprinkleService);
        order.verify(petGrowthService).growth(linked);
        order.verify(awardService).getCabinet(LINKED_ID);
        order.verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        order.verify(sprinkleService).balance(LINKED_ID);
    }

    /** MPP-25: the balance is the caller's own, never the plan owner's. */
    @Test
    void getPet_carriesTheCallersOwnSprinkles() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(sprinkleService.balance(LINKED_ID)).thenReturn(135L);

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getSprinkles()).isEqualTo(135L);
        verify(sprinkleService).balance(LINKED_ID);
        verify(sprinkleService, never()).balance(OWNER_ID);
    }

    @Test
    void renamePet_alsoCarriesTheCallersOwnSprinkles() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(sprinkleService.balance(LINKED_ID)).thenReturn(135L);
        stubSave();

        PetDTO pet = petService.renamePet(LINKED_ID, "Bao");

        assertThat(pet.getSprinkles()).isEqualTo(135L);
        assertThat(pet.getRoom()).isSameAs(ROOM);
        verify(sprinkleService, never()).balance(OWNER_ID);
    }

    @Test
    void getPet_unlinkedUserWithNoName_returnsPipAndDefaultTimes() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        PetDTO pet = petService.getPet(OWNER_ID);

        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("15:00");
    }

    @Test
    void getPet_linkedUser_returnsTheirOwnDefaultsNotTheOwners() {
        owner.setPetName("Mochi");
        owner.setLunchBy(LocalTime.of(12, 30));
        linked.setLunchBy(LocalTime.of(14, 0));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("14:00");
        verify(userRepository, never()).findById(OWNER_ID);
    }

    @Test
    void getPet_ownerAndLinkedUser_eachGetTheirOwnNameAndTimes() {
        owner.setPetName("Mochi");
        owner.setDinnerBy(LocalTime.of(19, 0));
        linked.setPetName("Bao");
        linked.setDinnerBy(LocalTime.of(20, 30));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO ownersPet = petService.getPet(OWNER_ID);
        PetDTO linkedPet = petService.getPet(LINKED_ID);

        assertThat(ownersPet.getName()).isEqualTo("Mochi");
        assertThat(ownersPet.getMealTimes().getDinnerBy()).isEqualTo("19:00");
        assertThat(linkedPet.getName()).isEqualTo("Bao");
        assertThat(linkedPet.getMealTimes().getDinnerBy()).isEqualTo("20:30");
    }

    @Test
    void renamePet_byLinkedUser_writesOnlyTheirOwnRow() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        stubSave();

        PetDTO pet = petService.renamePet(LINKED_ID, "Bao");

        assertThat(linked.getPetName()).isEqualTo("Bao");
        assertThat(owner.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Bao");
        verify(userRepository, never()).findById(OWNER_ID);
    }

    @Test
    void renamePet_trimsTheName() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        petService.renamePet(OWNER_ID, "  Bao  ");

        assertThat(owner.getPetName()).isEqualTo("Bao");
    }

    @Test
    void renamePet_blank_resetsToTheDefault() {
        owner.setPetName("Bao");
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        PetDTO pet = petService.renamePet(OWNER_ID, "   ");

        assertThat(owner.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
    }

    /** MPP-31: GET and rename both return the caller's own growth. */
    @Test
    void getAndRename_bothCarryTheCallersGrowth() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        stubSave();

        assertThat(petService.getPet(LINKED_ID).getGrowth()).isEqualTo(GROWTH);
        assertThat(petService.renamePet(LINKED_ID, "Basil").getGrowth()).isEqualTo(GROWTH);
        verify(petGrowthService, times(2)).growth(linked);
    }

    @Test
    void getPet_whenCallerRowMissing_throws() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.getPet(LINKED_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found: " + LINKED_ID);
    }
}

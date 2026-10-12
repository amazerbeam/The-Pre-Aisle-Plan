package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * MPP-14: one pet per meal plan, belonging to the owner (AC 8). A linked user
 * reads and renames the OWNER's pet, and the pet carries the owner's meal times.
 */
@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private PetService petService;

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
    }

    private void stubSave() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
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
    void getPet_linkedUser_returnsOwnersNameAndOwnersMealTimes() {
        owner.setPetName("Mochi");
        owner.setBreakfastBy(LocalTime.of(8, 0));
        owner.setLunchBy(LocalTime.of(12, 30));
        owner.setDinnerBy(LocalTime.of(19, 0));
        linked.setLunchBy(LocalTime.of(14, 0));   // linked user's own times must be ignored
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getName()).isEqualTo("Mochi");
        assertThat(pet.isCustomName()).isTrue();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("12:30");
    }

    @Test
    void renamePet_byLinkedUser_writesTheOwnersRow() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        PetDTO pet = petService.renamePet(LINKED_ID, "Bao");

        assertThat(owner.getPetName()).isEqualTo("Bao");
        assertThat(linked.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Bao");
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

    @Test
    void getPet_whenOwnerRowMissing_fallsBackToTheCallersOwnPet() {
        linked.setPetName("Solo");
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getName()).isEqualTo("Solo");
    }

    @Test
    void getPet_whenCallerRowMissing_throws() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.getPet(LINKED_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found: " + LINKED_ID);
    }
}

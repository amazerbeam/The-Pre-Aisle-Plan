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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-14 / MPP-33: each person has their own pet. A linked user (meal_plan_owner_id) reads and renames THEIR OWN pet, with their own meal times; the plan owner's are never used. */
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

    @Test
    void getPet_whenCallerRowMissing_throws() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.getPet(LINKED_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found: " + LINKED_ID);
    }
}

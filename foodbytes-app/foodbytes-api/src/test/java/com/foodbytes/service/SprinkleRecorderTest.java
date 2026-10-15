package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/** MPP-25: routes MPP-24 candidates to the earning rules, and never lets a failure escape. */
@ExtendWith(MockitoExtension.class)
class SprinkleRecorderTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private SprinkleService sprinkleService;
    @InjectMocks private SprinkleRecorder recorder;

    @Test
    void cooked_routesToMealEaten() {
        recorder.onCandidate(PetFirstCandidate.cooked(1L, 50L));
        verify(sprinkleService).mealEaten(1L, 50L);
    }

    @Test
    void planned_routesToPlanned() {
        recorder.onCandidate(PetFirstCandidate.planned(2L, MON, MON.plusDays(6)));
        verify(sprinkleService).planned(2L, MON, MON.plusDays(6));
    }

    @Test
    void template_paysNothing() {
        recorder.onCandidate(PetFirstCandidate.of(1L, FirstKey.MAKE_TEMPLATE));
        verifyNoInteractions(sprinkleService);
    }

    @Test
    void shoppingListGenerated_routesToShoppingListGenerated() {
        recorder.onCandidate(PetFirstCandidate.of(2L, FirstKey.GENERATE_SHOPPING_LIST));
        verify(sprinkleService).shoppingListGenerated(2L);
    }

    @Test
    void itemChecked_routesToShoppingListCompleted() {
        recorder.onShoppingItemChecked(new ShoppingItemChecked(2L));
        verify(sprinkleService).shoppingListCompleted(2L);
    }

    @Test
    void aShoppingFailure_isSwallowed_soTheToggleStillSucceeds() {
        doThrow(new IllegalStateException("db down")).when(sprinkleService).shoppingListCompleted(2L);
        assertThatCode(() -> recorder.onShoppingItemChecked(new ShoppingItemChecked(2L))).doesNotThrowAnyException();
    }

    @Test
    void aFailure_isSwallowed_soTheTickStillSucceeds() {
        doThrow(new IllegalStateException("db down")).when(sprinkleService).mealEaten(1L, 50L);
        assertThatCode(() -> recorder.onCandidate(PetFirstCandidate.cooked(1L, 50L))).doesNotThrowAnyException();
    }
}

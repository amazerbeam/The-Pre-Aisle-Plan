package com.foodbytes.service;

import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetFirst;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** MPP-24 AC 1 / AC 3: what proves each first, idempotency, per-person credit, and the read model. */
@ExtendWith(MockitoExtension.class)
class PetFirstServiceTest {

    private static final Long ACTOR = 2L;   // linked partner
    private static final Long OWNER = 1L;   // meal-plan owner
    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private PetFirstRepository petFirstRepository;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private ExtraChoiceService extraChoiceService;

    @InjectMocks private PetFirstService service;

    private static List<LocalDate> days(int fromOffset, int count) {
        return IntStream.range(fromOffset, fromOffset + count).mapToObj(MON::plusDays).toList();
    }

    @Test
    void template_isItsOwnProof_creditedToTheActor() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.MAKE_TEMPLATE)).thenReturn(false);

        service.evaluate(PetFirstCandidate.of(ACTOR, FirstKey.MAKE_TEMPLATE));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "MAKE_TEMPLATE");
    }

    @Test
    void shoppingList_isItsOwnProof() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.GENERATE_SHOPPING_LIST)).thenReturn(false);

        service.evaluate(PetFirstCandidate.of(ACTOR, FirstKey.GENERATE_SHOPPING_LIST));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "GENERATE_SHOPPING_LIST");
    }

    @Test
    void alreadyEarned_doesNoMoreWork() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(true);

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
        verifyNoInteractions(mealPlanEntryRepository, extraChoiceService);
    }

    @Test
    void fullWeek_onASharedPlan_readsTheOwnersPlanButCreditsTheActor() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(false);
        when(extraChoiceService.resolveOwnerId(ACTOR)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findFullyPlannedDates(
                OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, MON.minusDays(6), MON.plusDays(6), 3L))
                .thenReturn(days(-3, 7));

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "PLAN_FULL_WEEK");
    }

    @Test
    void fullWeek_sixDaysOnly_recordsNothing() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(false);
        when(extraChoiceService.resolveOwnerId(ACTOR)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findFullyPlannedDates(
                OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, MON.minusDays(6), MON.plusDays(12), 3L))
                .thenReturn(days(0, 6));

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON.plusDays(6)));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
    }

    @Test
    void cookedEntry_withAHomemadeExtra_records() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.COOK_HOMEMADE_EXTRA)).thenReturn(false);
        when(petFirstRepository.countHomemadeExtras(812L)).thenReturn(1L);

        service.evaluate(PetFirstCandidate.cooked(ACTOR, 812L));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "COOK_HOMEMADE_EXTRA");
    }

    @Test
    void cookedEntry_withOnlyStoreBoughtOrNoExtras_recordsNothing() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.COOK_HOMEMADE_EXTRA)).thenReturn(false);
        when(petFirstRepository.countHomemadeExtras(812L)).thenReturn(0L);

        service.evaluate(PetFirstCandidate.cooked(ACTOR, 812L));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
    }

    @Test
    void getFirsts_listsAllFourInOrder_withUtcEarnedAtOrNull() {
        when(petFirstRepository.findByUserId(ACTOR)).thenReturn(List.of(
                new PetFirst(9L, ACTOR, FirstKey.PLAN_FULL_WEEK, LocalDateTime.of(2026, 10, 12, 8, 0))));

        List<FirstStatusDTO> firsts = service.getFirsts(ACTOR);

        assertThat(firsts).extracting(FirstStatusDTO::getKey).containsExactly(
                FirstKey.MAKE_TEMPLATE, FirstKey.GENERATE_SHOPPING_LIST,
                FirstKey.PLAN_FULL_WEEK, FirstKey.COOK_HOMEMADE_EXTRA);
        assertThat(firsts).extracting(FirstStatusDTO::getEarnedAt).containsExactly(
                null, null, Instant.parse("2026-10-12T08:00:00Z"), null);
    }
}
